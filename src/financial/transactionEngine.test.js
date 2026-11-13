import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from '../storage/database';
import { getAccountBalance } from './financialEngine';
import { createSale, recordPayment, recordOperatingExpense, recordCapitalContribution, recordOwnerWithdrawal } from './transactionEngine';
import { saveProduct } from '../storage/productRepository';

beforeEach(async () => {
  await initializeDatabase();
  await Promise.all(['P001', 'P002', 'P003', 'P-DUP', 'P-FAIL'].map(id =>
    saveProduct({ id, nama: id, stok: 10, hpp: 0 })
  ));
});

afterEach(async () => {
  await resetDatabase();
});

describe('Transaction Engine - Sales and Payments', () => {
  it('posts cash sale atomically', async () => {
    await saveProduct({ id: 'P001', nama: 'Item', stok: 2, hpp: 60000 });
    const sale = await createSale({
      saleNumber: 'INV-001',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [
        { productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 },
      ],
      totalAmount: 100000,
      paymentMethod: 'CASH',
      paidAmount: 100000,
    });

    expect(sale.id).toBeDefined();
    expect(sale.status).toBe('COMPLETED');

    // Verify journal posted
    const journal = await db.journals.where('reference').equals(`SALE:${sale.id}`).first();
    expect(journal.status).toBe('POSTED');
    expect(journal.entries.length).toBeGreaterThan(0);

    // Verify balances
    await expect(getAccountBalance('1010')).resolves.toBe(100000); // Kas
    await expect(getAccountBalance('4000')).resolves.toBe(100000); // Pendapatan
    await expect(getAccountBalance('5100')).resolves.toBe(120000); // HPP
    await expect(getAccountBalance('1200')).resolves.toBe(-120000); // Persediaan
    expect((await db.products.get('P001')).stok).toBe(0);
  });

  it('prevents overpayment on sale', async () => {
    const sale = await createSale({
      saleNumber: 'INV-002',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CREDIT',
      paidAmount: 0,
    });

    await expect(
      recordPayment({
        paymentNumber: 'PAY-001',
        transactionDate: '2026-11-10',
        saleId: sale.id,
        amount: 60000,
      })
    ).rejects.toThrow('melebihi sisa tagihan');
  });

  it('prevents payment on completed sale', async () => {
    const sale = await createSale({
      saleNumber: 'INV-003',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P002', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CASH',
      paidAmount: 50000,
    });

    await expect(
      recordPayment({
        paymentNumber: 'PAY-002',
        transactionDate: '2026-11-10',
        saleId: sale.id,
        amount: 10000,
      })
    ).rejects.toThrow('sudah lunas');
  });

  it('prevents duplicate posting via idempotency key', async () => {
    const key = 'IDEMPOTENT-TEST-001';
    const sale1 = await createSale({
      saleNumber: 'INV-004',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P003', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CASH',
      paidAmount: 50000,
      idempotencyKey: key,
    });

    const sale2 = await createSale({
      saleNumber: 'INV-004-DUP',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CASH',
      paidAmount: 50000,
      idempotencyKey: key,
    });

    expect(sale1.id).toBe(sale2.id);
  });
});

describe('Transaction Engine - Payment Idempotency', () => {
  it('retrying same payment number returns same payment without duplicate journal', async () => {
    const sale = await createSale({
      saleNumber: 'INV-PAY-001',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CREDIT',
      paidAmount: 0,
    });

    const payment1 = await recordPayment({ paymentNumber: 'PAY-IDEMP', transactionDate: '2026-11-11', saleId: sale.id, amount: 25000 });
    const payment2 = await recordPayment({ paymentNumber: 'PAY-IDEMP', transactionDate: '2026-11-11', saleId: sale.id, amount: 25000 });

    expect(payment2.id).toBe(payment1.id);
    const journals = await db.journals.where('reference').equals(`PAYMENT:${payment1.id}`).toArray();
    expect(journals.length).toBe(1);
    const updatedSale = await db.sales.get(sale.id);
    expect(updatedSale.paidAmount).toBe(25000);
  });

  it('rejects payment number already used for another invoice', async () => {
    const saleA = await createSale({
      saleNumber: 'INV-PAY-A', transactionDate: '2026-11-10', customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000, paymentMethod: 'CREDIT', paidAmount: 0,
    });
    const saleB = await createSale({
      saleNumber: 'INV-PAY-B', transactionDate: '2026-11-10', customerId: 'CUST-001',
      items: [{ productId: 'P002', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000, paymentMethod: 'CREDIT', paidAmount: 0,
    });

    await recordPayment({ paymentNumber: 'PAY-SHARED', transactionDate: '2026-11-11', saleId: saleA.id, amount: 25000 });
    await expect(
      recordPayment({ paymentNumber: 'PAY-SHARED', transactionDate: '2026-11-11', saleId: saleB.id, amount: 25000 })
    ).rejects.toThrow('sudah digunakan untuk invoice lain');

    const saleBB = await db.sales.get(saleB.id);
    expect(saleBB.paidAmount).toBe(0);
  });

  it('records a payment without adding revenue or a second sale', async () => {
    const sale = await createSale({
      saleNumber: 'INV-NOREV', transactionDate: '2026-11-10', customerId: 'CUST-001',
      items: [{ productId: 'P003', quantity: 1, unitPrice: 100000, total: 100000 }],
      totalAmount: 100000, paymentMethod: 'CREDIT', paidAmount: 0,
    });

    await recordPayment({ paymentNumber: 'PAY-NOREV', transactionDate: '2026-11-11', saleId: sale.id, amount: 40000 });

    await expect(getAccountBalance('4000')).resolves.toBe(100000);
    await expect(getAccountBalance('1100')).resolves.toBe(60000);
    await expect(getAccountBalance('1010')).resolves.toBe(40000);
    await expect(db.sales.count()).resolves.toBe(1);
    expect((await db.journals.where('reference').equals(`SALE:${sale.id}`).toArray())).toHaveLength(1);
  });

  it('keeps payment, journal and sale status consistent after partial then full payment', async () => {
    const sale = await createSale({
      saleNumber: 'INV-PAY-003', transactionDate: '2026-11-10', customerId: 'CUST-001',
      items: [{ productId: 'P003', quantity: 1, unitPrice: 100000, total: 100000 }],
      totalAmount: 100000, paymentMethod: 'CREDIT', paidAmount: 0,
    });

    await recordPayment({ paymentNumber: 'PAY-PP-1', transactionDate: '2026-11-11', saleId: sale.id, amount: 40000 });
    let updated = await db.sales.get(sale.id);
    expect(updated.paidAmount).toBe(40000);
    expect(updated.status).toBe('UNPAID');

    await recordPayment({ paymentNumber: 'PAY-PP-2', transactionDate: '2026-11-12', saleId: sale.id, amount: 60000 });
    updated = await db.sales.get(sale.id);
    expect(updated.paidAmount).toBe(100000);
    expect(updated.status).toBe('COMPLETED');
    const allJournals = await db.journals.toArray();
    const paymentJournals = allJournals.filter(j => j.reference.startsWith('PAYMENT:'));
    expect(paymentJournals.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Transaction Engine - Operating Transactions', () => {
  it('records operating expense atomically', async () => {
    const expense = await recordOperatingExpense({
      referenceNumber: 'EXP-001',
      transactionDate: '2026-11-10',
      amount: 250000,
      description: 'Bayar Listrik',
    });

    expect(expense.status).toBe('POSTED');
    await expect(getAccountBalance('5000')).resolves.toBe(250000); // Beban
    await expect(getAccountBalance('1010')).resolves.toBe(-250000); // Kas kurang
  });

  it('prevents negative expense amount', async () => {
    await expect(
      recordOperatingExpense({
        referenceNumber: 'EXP-002',
        transactionDate: '2026-11-10',
        amount: -50000,
      })
    ).rejects.toThrow('harus > 0');
  });

  it('records capital contribution atomically', async () => {
    const contrib = await recordCapitalContribution({
      referenceNumber: 'CONTRIB-001',
      transactionDate: '2026-11-10',
      amount: 5000000,
    });

    expect(contrib.status).toBe('POSTED');
    await expect(getAccountBalance('1010')).resolves.toBe(5000000); // Kas masuk
    await expect(getAccountBalance('3000')).resolves.toBe(5000000); // Modal (equity credit balance)
  });

  it('records owner withdrawal atomically', async () => {
    await recordCapitalContribution({
      referenceNumber: 'CONTRIB-002',
      transactionDate: '2026-11-10',
      amount: 1000000,
    });

    const withdrawal = await recordOwnerWithdrawal({
      referenceNumber: 'WITHDRAW-001',
      transactionDate: '2026-11-10',
      amount: 300000,
    });

    expect(withdrawal.status).toBe('POSTED');
    await expect(getAccountBalance('3100')).resolves.toBe(-300000); // Prive (contra-equity debit)
    await expect(getAccountBalance('1010')).resolves.toBe(700000); // Kas sisa
  });

  it('verifies checkout integrity: sale creates one journal with revenue+hpp+stock', async () => {
    await saveProduct({ id: 'P-CHK', nama: 'Test', stok: 5, hpp: 30000 });
    const sale = await createSale({
      saleNumber: 'CHK-001',
      transactionDate: '2026-11-10',
      customerId: 'CUST-CHK',
      items: [{ productId: 'P-CHK', quantity: 2, unitPrice: 50000, total: 100000 }],
      totalAmount: 100000,
      paymentMethod: 'CASH',
      paidAmount: 100000,
    });

    // Verify sale posted once
    const journals = await db.journals.where('reference').equals(`SALE:${sale.id}`).toArray();
    expect(journals.length).toBe(1);
    expect(journals[0].status).toBe('POSTED');

    // Verify journal entries: revenue + HPP cost
    const entries = journals[0].entries;
    const revEntry = entries.find(e => e.accountCode === '4000');
    const hppEntry = entries.find(e => e.accountCode === '5100');
    const stockEntry = entries.find(e => e.accountCode === '1200');
    const kasEntry = entries.find(e => e.accountCode === '1010');

    expect(revEntry.credit).toBe(100000);
    expect(hppEntry.debit).toBe(60000); // 2 units * 30000 hpp
    expect(stockEntry.credit).toBe(60000);
    expect(kasEntry.debit).toBe(100000);

    // Verify stock reduced
    const product = await db.products.get('P-CHK');
    expect(product.stok).toBe(3);

    // Verify balances
    await expect(getAccountBalance('1010')).resolves.toBe(100000);
    await expect(getAccountBalance('4000')).resolves.toBe(100000);
    await expect(getAccountBalance('5100')).resolves.toBe(60000);
  });

  it('prevents sale with insufficient stock', async () => {
    await saveProduct({ id: 'P-STOCK', nama: 'Low Stock', stok: 1, hpp: 20000 });
    await expect(
      createSale({
        saleNumber: 'CHK-002',
        transactionDate: '2026-11-10',
        customerId: 'CUST-STOCK',
        items: [{ productId: 'P-STOCK', quantity: 2, unitPrice: 50000, total: 100000 }],
        totalAmount: 100000,
        paymentMethod: 'CASH',
        paidAmount: 100000,
      })
    ).rejects.toThrow(/stok|stock/i);
  });
});
