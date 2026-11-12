import { db, initializeDatabase } from './database';
import { toLocalDateKey } from '../financial/dateKey';

export async function listInvoices({ customerId, status, limit = 100 } = {}) {
  await initializeDatabase();
  let invoices = await db.sales.orderBy('transactionDate').reverse().toArray();
  if (customerId && customerId !== 'WALK-IN') invoices = invoices.filter(invoice => invoice.customerId === customerId);
  if (status) invoices = invoices.filter(invoice => getInvoiceStatus(invoice) === status);
  return invoices.slice(0, limit).map(invoice => ({
    ...invoice,
    invoiceStatus: getInvoiceStatus(invoice),
    outstandingAmount: invoice.totalAmount - invoice.paidAmount,
  }));
}

export async function getInvoice(id) {
  await initializeDatabase();
  const invoice = await db.sales.get(id);
  return invoice ? { ...invoice, invoiceStatus: getInvoiceStatus(invoice), outstandingAmount: invoice.totalAmount - invoice.paidAmount } : undefined;
}

export function getInvoiceStatus(invoice, today = new Date()) {
  if (invoice.paidAmount >= invoice.totalAmount) return 'PAID';
  if (invoice.dueDate && invoice.dueDate.slice(0, 10) < toLocalDateKey(today)) return 'OVERDUE';
  if (invoice.paidAmount > 0) return 'PARTIAL';
  return 'UNPAID';
}

export async function getReceivablesStats(customerId) {
  const invoices = await listInvoices({ customerId, limit: 1000 });
  return {
    invoiceCount: invoices.length,
    totalAmount: invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
    totalPaid: invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0),
    outstandingAmount: invoices.reduce((sum, invoice) => sum + invoice.outstandingAmount, 0),
  };
}
