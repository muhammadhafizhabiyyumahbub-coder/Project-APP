import { db, initializeDatabase } from '../storage/database';
import { createJournal, getJournalByIdempotencyKey } from './journalRepository';
import { reserveSaleStock } from './inventoryEngine';
import { requireValidAmount } from './transactionValidation';
import { createId } from '../storage/idGenerator';

// Inline posting helper so transaction rules run inside a single atomic Dexie transaction.
async function postJournalInline(journal) {
  journal.status = 'POSTED';
  journal.postedAt = new Date().toISOString();
  await db.journals.put(journal);
  await db.auditTrail.put({
    id: `AUDIT-${journal.id}-POSTED`,
    entityId: journal.id,
    action: 'POSTED',
    reference: journal.reference,
    createdAt: journal.postedAt,
    before: { status: 'DRAFT' },
    after: { status: 'POSTED' },
  });
  return journal;
}

// createSale: penjualan tunai atau kredit
export async function createSale(saleData) {
  await initializeDatabase();

  // Validation
  if (!Array.isArray(saleData.items) || saleData.items.length === 0) throw new Error('Penjualan harus memiliki barang.');
  requireValidAmount(saleData.totalAmount, 'Total penjualan');
  const paidAmount = saleData.paidAmount ?? 0;
  if (!Number.isInteger(paidAmount) || paidAmount < 0 || paidAmount > saleData.totalAmount) {
    throw new Error('Pembayaran harus bilangan rupiah bulat antara 0 dan total tagihan.');
  }
  for (const item of saleData.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isInteger(item.unitPrice) || item.unitPrice < 0 || item.total !== item.quantity * item.unitPrice) {
      throw new Error('Jumlah dan harga barang tidak valid.');
    }
  }
  if (saleData.items.reduce((sum, item) => sum + item.total, 0) !== saleData.totalAmount) {
    throw new Error('Total penjualan tidak sesuai dengan total barang.');
  }

  const idempotencyKey = saleData.idempotencyKey || `SALE-${saleData.saleNumber}`;

  return await db.transaction('rw', db.journals, db.auditTrail, db.sales, db.products, db.inventoryMovements, async () => {
    // Idempotency check INSIDE the transaction to prevent race condition.
    // Only one request can create the sale; concurrent requests with the same key
    // will find the existing journal and return the existing sale.
    const existingJournal = await db.journals.where('idempotencyKey').equals(idempotencyKey).first();
    if (existingJournal && existingJournal.status === 'POSTED') {
      const existingSale = await db.sales.where('journalId').equals(existingJournal.id).first();
      if (existingSale) return existingSale;
    }

    // Validation inside transaction
    if (!Array.isArray(saleData.items) || saleData.items.length === 0) throw new Error('Penjualan harus memiliki barang.');

    // Create sale object
    const sale = {
      id: createId('SALE'),
      saleNumber: saleData.saleNumber,
      transactionDate: saleData.transactionDate,
      customerId: saleData.customerId,
      items: saleData.items,
      totalAmount: saleData.totalAmount,
      paidAmount,
      paymentMethod: saleData.paymentMethod,
      status: paidAmount >= saleData.totalAmount ? 'COMPLETED' : 'UNPAID',
      dueDate: saleData.dueDate,
      createdAt: new Date().toISOString(),
    };

    const journalEntries = [
      { accountCode: '4000', debit: 0, credit: sale.totalAmount }, // Revenue
    ];

    if (sale.paidAmount > 0) {
      journalEntries.push({ accountCode: '1010', debit: sale.paidAmount, credit: 0 }); // Kas
    }
    if (sale.totalAmount > sale.paidAmount) {
      journalEntries.push({ accountCode: '1100', debit: sale.totalAmount - sale.paidAmount, credit: 0 }); // Piutang
    }

    const costOfGoodsSold = await reserveSaleStock(sale.items, sale.id, sale.transactionDate);
    const journal = await createJournal({
      journalNumber: `JE-${sale.saleNumber}`,
      transactionDate: sale.transactionDate,
      description: `Penjualan ${sale.saleNumber}`,
      reference: `SALE:${sale.id}`,
      idempotencyKey,
      entries: [
        ...journalEntries,
        ...(costOfGoodsSold > 0
          ? [
              { accountCode: '5100', debit: costOfGoodsSold, credit: 0 },
              { accountCode: '1200', debit: 0, credit: costOfGoodsSold },
            ]
          : []),
      ],
    });
    await postJournalInline(journal);

    sale.journalId = journal.id;
    await db.sales.put(sale);
    return sale;
  });
}

// recordPayment: pembayaran terhadap penjualan
export async function recordPayment(paymentData) {
  await initializeDatabase();
  requireValidAmount(paymentData.amount, 'Pembayaran');
  const idempotencyKey = paymentData.idempotencyKey || `PAYMENT-${paymentData.paymentNumber}`;

  return await db.transaction('rw', db.journals, db.auditTrail, db.sales, db.payments, async () => {
    const existingJournal = await db.journals.where('idempotencyKey').equals(idempotencyKey).first();
    if (existingJournal?.status === 'POSTED') {
      const existingPayment = await db.payments.where('journalId').equals(existingJournal.id).first();
      if (!existingPayment) throw new Error('Pembayaran sebelumnya tidak lengkap.');
      if (existingPayment.saleId !== paymentData.saleId) throw new Error('Nomor pembayaran sudah digunakan untuk invoice lain.');
      return existingPayment;
    }

    const sale = await db.sales.get(paymentData.saleId);
    if (!sale) throw new Error(`Sale ${paymentData.saleId} tidak ditemukan.`);
    if (sale.status === 'COMPLETED') throw new Error('Tagihan sudah lunas.');
    if (paymentData.amount + (sale.paidAmount || 0) > sale.totalAmount) {
      throw new Error('Pembayaran melebihi sisa tagihan.');
    }

    const payment = {
      id: createId('PAY'),
      paymentNumber: paymentData.paymentNumber,
      transactionDate: paymentData.transactionDate,
      saleId: sale.id,
      amount: paymentData.amount,
      createdAt: new Date().toISOString(),
    };

    const journal = await createJournal({
      journalNumber: `JE-${payment.paymentNumber}`,
      transactionDate: payment.transactionDate,
      description: `Pembayaran ${payment.paymentNumber} untuk ${sale.saleNumber}`,
      reference: `PAYMENT:${payment.id}`,
      idempotencyKey,
      entries: [
        { accountCode: '1010', debit: payment.amount, credit: 0 }, // Kas
        { accountCode: '1100', debit: 0, credit: payment.amount }, // Piutang berkurang
      ],
    });
    await postJournalInline(journal);

    payment.journalId = journal.id;
    await db.payments.put(payment);

    sale.paidAmount = (sale.paidAmount || 0) + payment.amount;
    sale.status = sale.paidAmount >= sale.totalAmount ? 'COMPLETED' : 'UNPAID';
    await db.sales.put(sale);

    return payment;
  });
}

// recordOperatingExpense: beban operasional (selain HPP)
export async function recordOperatingExpense(expenseData) {
  await initializeDatabase();

  if (expenseData.amount <= 0) {
    throw new Error('Jumlah beban harus > 0.');
  }
  requireValidAmount(expenseData.amount, 'Beban');

  const idempotencyKey = expenseData.idempotencyKey || `EXPENSE-${expenseData.referenceNumber}`;
  const existingJournal = await getJournalByIdempotencyKey(idempotencyKey);
  if (existingJournal && existingJournal.status === 'POSTED') return existingJournal;

  return await db.transaction('rw', db.journals, db.auditTrail, async () => {
    const journal = await createJournal({
      journalNumber: `JE-${expenseData.referenceNumber}`,
      transactionDate: expenseData.transactionDate,
      description: expenseData.description || `Beban Operasional ${expenseData.referenceNumber}`,
      reference: `EXPENSE:${expenseData.referenceNumber}`,
      idempotencyKey,
      entries: [
        { accountCode: '5000', debit: expenseData.amount, credit: 0 }, // Beban
        { accountCode: '1010', debit: 0, credit: expenseData.amount }, // Kas
      ],
    });
    await postJournalInline(journal);
    return journal;
  });
}

// recordCapitalContribution: setoran modal pemilik
export async function recordCapitalContribution(contributionData) {
  await initializeDatabase();

  if (contributionData.amount <= 0) {
    throw new Error('Jumlah setoran harus > 0.');
  }
  requireValidAmount(contributionData.amount, 'Setoran modal');

  const idempotencyKey = contributionData.idempotencyKey || `CONTRIB-${contributionData.referenceNumber}`;
  const existingJournal = await getJournalByIdempotencyKey(idempotencyKey);
  if (existingJournal && existingJournal.status === 'POSTED') return existingJournal;

  return await db.transaction('rw', db.journals, db.auditTrail, async () => {
    const journal = await createJournal({
      journalNumber: `JE-${contributionData.referenceNumber}`,
      transactionDate: contributionData.transactionDate,
      description: `Setoran Modal ${contributionData.referenceNumber}`,
      reference: `CONTRIB:${contributionData.referenceNumber}`,
      idempotencyKey,
      entries: [
        { accountCode: '1010', debit: contributionData.amount, credit: 0 }, // Kas
        { accountCode: '3000', debit: 0, credit: contributionData.amount }, // Modal
      ],
    });
    await postJournalInline(journal);
    return journal;
  });
}

// recordOwnerWithdrawal: pengambilan prive pemilik
export async function recordOwnerWithdrawal(withdrawalData) {
  await initializeDatabase();

  if (withdrawalData.amount <= 0) {
    throw new Error('Jumlah prive harus > 0.');
  }
  requireValidAmount(withdrawalData.amount, 'Prive');

  const idempotencyKey = withdrawalData.idempotencyKey || `WITHDRAW-${withdrawalData.referenceNumber}`;
  const existingJournal = await getJournalByIdempotencyKey(idempotencyKey);
  if (existingJournal && existingJournal.status === 'POSTED') return existingJournal;

  return await db.transaction('rw', db.journals, db.auditTrail, async () => {
    const journal = await createJournal({
      journalNumber: `JE-${withdrawalData.referenceNumber}`,
      transactionDate: withdrawalData.transactionDate,
      description: `Prive Pemilik ${withdrawalData.referenceNumber}`,
      reference: `WITHDRAW:${withdrawalData.referenceNumber}`,
      idempotencyKey,
      entries: [
        { accountCode: '3100', debit: withdrawalData.amount, credit: 0 }, // Prive
        { accountCode: '1010', debit: 0, credit: withdrawalData.amount }, // Kas
      ],
    });
    await postJournalInline(journal);
    return journal;
  });
}