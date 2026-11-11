import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from './database';
import { createSale } from '../financial/transactionEngine';
import { saveProduct } from './productRepository';
import { listSales, getSale, getSalesByCustomer, getSalesStats } from './salesRepository';

beforeEach(async () => {
  await initializeDatabase();
  await saveProduct({ id: 'P001', nama: 'Item', stok: 100, hpp: 30000 });
});

afterEach(async () => {
  await resetDatabase();
});

describe('salesRepository', () => {
  it('lists all sales', async () => {
    const sale1 = await createSale({
      saleNumber: 'INV-001',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CASH',
      paidAmount: 50000,
    });

    const sale2 = await createSale({
      saleNumber: 'INV-002',
      transactionDate: '2026-11-11',
      customerId: 'CUST-002',
      items: [{ productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 }],
      totalAmount: 100000,
      paymentMethod: 'CREDIT',
      paidAmount: 0,
    });

    const sales = await listSales();
    expect(sales).toHaveLength(2);
    expect(sales.map(s => s.saleNumber)).toContain('INV-001');
    expect(sales.map(s => s.saleNumber)).toContain('INV-002');
  });

  it('gets single sale by id', async () => {
    const sale = await createSale({
      saleNumber: 'INV-003',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CASH',
      paidAmount: 50000,
    });

    const retrieved = await getSale(sale.id);
    expect(retrieved).toMatchObject({ saleNumber: 'INV-003', customerId: 'CUST-001' });
  });

  it('gets sales by customer', async () => {
    await createSale({
      saleNumber: 'INV-004',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CASH',
      paidAmount: 50000,
    });

    await createSale({
      saleNumber: 'INV-005',
      transactionDate: '2026-11-11',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 60000, total: 60000 }],
      totalAmount: 60000,
      paymentMethod: 'CREDIT',
      paidAmount: 0,
    });

    await createSale({
      saleNumber: 'INV-006',
      transactionDate: '2026-11-11',
      customerId: 'CUST-002',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 40000, total: 40000 }],
      totalAmount: 40000,
      paymentMethod: 'CASH',
      paidAmount: 40000,
    });

    const cust1Sales = await getSalesByCustomer('CUST-001');
    expect(cust1Sales).toHaveLength(2);
    expect(cust1Sales.every(s => s.customerId === 'CUST-001')).toBe(true);

    const cust2Sales = await getSalesByCustomer('CUST-002');
    expect(cust2Sales).toHaveLength(1);
  });

  it('computes sales stats per customer', async () => {
    await createSale({
      saleNumber: 'INV-007',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 100000, total: 100000 }],
      totalAmount: 100000,
      paymentMethod: 'CASH',
      paidAmount: 100000,
    });

    await createSale({
      saleNumber: 'INV-008',
      transactionDate: '2026-11-11',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 }],
      totalAmount: 100000,
      paymentMethod: 'CREDIT',
      paidAmount: 25000,
    });

    const stats = await getSalesStats('CUST-001');
    expect(stats.totalTransactions).toBe(2);
    expect(stats.totalAmount).toBe(200000);
    expect(stats.totalPaid).toBe(125000);
    expect(stats.totalUnpaid).toBe(75000);
  });

  it('filters unpaid sales in listSales', async () => {
    await createSale({
      saleNumber: 'INV-009',
      transactionDate: '2026-11-10',
      customerId: 'CUST-001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 50000, total: 50000 }],
      totalAmount: 50000,
      paymentMethod: 'CASH',
      paidAmount: 50000,
    });

    await createSale({
      saleNumber: 'INV-010',
      transactionDate: '2026-11-11',
      customerId: 'CUST-002',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 60000, total: 60000 }],
      totalAmount: 60000,
      paymentMethod: 'CREDIT',
      paidAmount: 0,
    });

    const allSales = await listSales();
    expect(allSales).toHaveLength(2);
  });
});
