import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initializeDatabase, resetDatabase } from './database';
import { createSale, recordPayment } from '../financial/transactionEngine';
import { saveProduct } from './productRepository';
import { getInvoice, getInvoiceStatus, getReceivablesStats, listInvoices } from './invoiceRepository';

beforeEach(async () => {
  await initializeDatabase();
  await saveProduct({ id: 'P001', nama: 'Item', stok: 100, hpp: 30000 });
});

afterEach(async () => resetDatabase());

async function sale(data) {
  return createSale({
    saleNumber: data.saleNumber,
    transactionDate: '2026-11-10',
    dueDate: data.dueDate,
    customerId: 'CUST-001',
    items: [{ productId: 'P001', quantity: 1, unitPrice: data.totalAmount, total: data.totalAmount }],
    totalAmount: data.totalAmount,
    paymentMethod: 'CREDIT',
    paidAmount: data.paidAmount ?? 0,
  });
}

describe('invoiceRepository', () => {
  it('lists invoice status and outstanding amount', async () => {
    await sale({ saleNumber: 'INV-001', totalAmount: 100000, paidAmount: 25000 });
    const invoices = await listInvoices({ customerId: 'CUST-001' });
    expect(invoices[0]).toMatchObject({ invoiceStatus: 'PARTIAL', outstandingAmount: 75000 });
  });

  it('marks unpaid invoice overdue by due date', async () => {
    const invoice = await sale({ saleNumber: 'INV-002', totalAmount: 100000, dueDate: '2026-01-01' });
    expect(getInvoiceStatus(invoice, new Date('2026-11-10'))).toBe('OVERDUE');
  });

  it('updates receivable after payment', async () => {
    const invoice = await sale({ saleNumber: 'INV-003', totalAmount: 100000 });
    await recordPayment({ saleId: invoice.id, paymentNumber: 'PAY-001', transactionDate: '2026-11-11', amount: 100000 });
    await expect(getInvoice(invoice.id)).resolves.toMatchObject({ invoiceStatus: 'PAID', outstandingAmount: 0 });
    await expect(getReceivablesStats('CUST-001')).resolves.toMatchObject({ outstandingAmount: 0, totalPaid: 100000 });
  });
});
