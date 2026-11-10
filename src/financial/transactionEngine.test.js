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
});
