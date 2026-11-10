import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from '../storage/database';
import { getAccountBalance } from './financialEngine';
import { createSale, recordPayment } from './transactionEngine';
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
    expect(journal).toBeDefined();
    expect(journal.status).toBe('POSTED');

    // Verify account balances
    await expect(getAccountBalance('1010')).resolves.toBe(100000); // Kas
    await expect(getAccountBalance('4000')).resolves.toBe(100000); // Pendapatan
    await expect(getAccountBalance('5100')).resolves.toBe(120000); // HPP
    await expect(getAccountBalance('1200')).resolves.toBe(-120000); // Persediaan
    expect((await db.products.get('P001')).stok).toBe(0);
  });

  it('posts credit sale with receivable', async () => {
    const sale = await createSale({
      saleNumber: 'INV-002',
      transactionDate: '2026-11-10',
      customerId: 'CUST-002',
      items: [
        { productId: 'P002', quantity: 1, unitPrice: 200000, total: 200000 },
      ],
      totalAmount: 200000,
      paymentMethod: 'CREDIT',
      paidAmount: 0,
    });

    expect(sale.status).toBe('UNPAID');

    const journal = await db.journals.where('reference').equals(`SALE:${sale.id}`).first();
    expect(journal.status).toBe('POSTED');

    // Piutang belum di chart accounts, test basic posting dulu
    await expect(getAccountBalance('4000')).resolves.toBe(200000);
  });

  it('records partial payment against sale', async () => {
    const sale = await createSale({
      saleNumber: 'INV-003',
      transactionDate: '2026-11-10',
      customerId: 'CUST-003',
      items: [
        { productId: 'P003', quantity: 1, unitPrice: 500000, total: 500000 },
      ],
      totalAmount: 500000,
      paymentMethod: 'CREDIT',
      paidAmount: 0,
    });

    const payment = await recordPayment({
      paymentNumber: 'PAY-001',
      transactionDate: '2026-11-10',
      saleId: sale.id,
      amount: 200000,
      paymentMethod: 'CASH',
    });

    expect(payment.id).toBeDefined();
    expect(payment.amount).toBe(200000);

    const paymentJournal = await db.journals.where('reference').equals(`PAYMENT:${payment.id}`).first();
    expect(paymentJournal.status).toBe('POSTED');

    await expect(getAccountBalance('1010')).resolves.toBe(200000);
  });

  it('prevents duplicate sale posting with idempotency key', async () => {
    const saleData = {
      saleNumber: 'INV-DUP',
      transactionDate: '2026-11-10',
      customerId: 'CUST-DUP',
      items: [{ productId: 'P-DUP', quantity: 1, unitPrice: 100000, total: 100000 }],
      totalAmount: 100000,
      paymentMethod: 'CASH',
      paidAmount: 100000,
      idempotencyKey: 'SALE-IDEM-001',
    };

    const sale1 = await createSale(saleData);
    const sale2 = await createSale({ ...saleData, saleNumber: 'INV-DUP-2' });

    expect(sale2.id).toBe(sale1.id);

    const journals = await db.journals.where('reference').startsWith('SALE:').toArray();
    expect(journals.length).toBe(1);

    await expect(getAccountBalance('1010')).resolves.toBe(100000);
  });

  it('rejects overpayment and posts nothing', async () => {
    await expect(
      createSale({
        saleNumber: 'INV-FAIL',
        transactionDate: '2026-11-10',
        customerId: 'CUST-FAIL',
        items: [{ productId: 'P-FAIL', quantity: 1, unitPrice: 75000, total: 75000 }],
        totalAmount: 75000,
        paymentMethod: 'CASH',
        paidAmount: 100000,
      })
    ).rejects.toThrow('Pembayaran melebihi total tagihan.');

    const journals = await db.journals.toArray();
    expect(journals.length).toBe(0);
    const sales = await db.sales.toArray();
    expect(sales.length).toBe(0);
  });
});
