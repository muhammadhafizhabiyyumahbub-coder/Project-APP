import { db, initializeDatabase } from './database';

export async function listSales({ customerId, limit = 100 } = {}) {
  await initializeDatabase();
  let query = db.sales.orderBy('transactionDate').reverse();
  if (customerId && customerId !== 'WALK-IN') {
    query = query.filter(s => s.customerId === customerId);
  }
  return query.limit(limit).toArray();
}

export async function getSale(id) {
  await initializeDatabase();
  return db.sales.get(id);
}

export async function getSalesByCustomer(customerId, limit = 100) {
  await initializeDatabase();
  return db.sales
    .where('customerId')
    .equals(customerId)
    .reverse()
    .toArray()
    .then(sales => sales.slice(0, limit));
}

export async function getSalesStats(customerId) {
  await initializeDatabase();
  const sales = await getSalesByCustomer(customerId, 1000);
  return {
    totalTransactions: sales.length,
    totalAmount: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    totalPaid: sales.reduce((sum, s) => sum + s.paidAmount, 0),
    totalUnpaid: sales.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0),
  };
}
