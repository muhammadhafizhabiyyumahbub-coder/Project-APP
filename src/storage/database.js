import Dexie from 'dexie';

export const DATABASE_NAME = 'umkm-manager';
export const DATABASE_VERSION = 2;

export const db = new Dexie(DATABASE_NAME);

db.version(1).stores({
  businesses: 'id',
  products: 'id, sku, nama',
  customers: 'id, nama',
  settings: 'id, key',
  features: 'featureId',
  journals: 'id, status, idempotencyKey, reference',
});

db.version(DATABASE_VERSION).stores({
  businesses: 'id',
  products: 'id, sku, nama',
  customers: 'id, nama',
  settings: 'id, key',
  features: 'featureId',
  journals: 'id, status, idempotencyKey, reference',
  auditTrail: 'id, entityId, action, reference',
  sales: 'id, saleNumber, customerId, journalId, transactionDate',
  payments: 'id, paymentNumber, saleId, journalId',
  inventoryMovements: 'id, productId, saleId, transactionDate',
});

export async function initializeDatabase() {
  await db.open();
  return db;
}

export async function resetDatabase() {
  await db.delete();
  db.close();
}
