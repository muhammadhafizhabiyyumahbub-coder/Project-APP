import Dexie from 'dexie';
import { isTabLockOwner } from './tabCoordination';

export const DATABASE_NAME = 'umkm-manager';
export const DATABASE_VERSION = 3;

export const db = new Dexie(DATABASE_NAME);

db.use({
  stack: 'dbcore',
  create: down => ({
    ...down,
    transaction: (stores, mode, options) => {
      if (mode === 'readwrite' && !isTabLockOwner()) {
        throw new Error('Tab ini dalam mode baca saja. Ambil alih kendali dari tab lain terlebih dahulu.');
      }
      return down.transaction(stores, mode, options);
    },
  }),
});

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
  suppliers: 'id, nama',
  employees: 'id, nama',
});

export async function initializeDatabase() {
  await db.open();
  return db;
}

export async function resetDatabase() {
  await db.delete();
  db.close();
}
