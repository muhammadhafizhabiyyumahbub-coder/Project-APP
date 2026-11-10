import Dexie from 'dexie';

export const DATABASE_NAME = 'umkm-manager';
export const DATABASE_VERSION = 1;

export const db = new Dexie(DATABASE_NAME);

db.version(DATABASE_VERSION).stores({
  businesses: 'id',
  products: 'id, sku, nama',
  customers: 'id, nama',
  settings: 'id, key',
  features: 'featureId',
  journals: 'id, status, idempotencyKey, reference',
});

export async function initializeDatabase() {
  await db.open();
  return db;
}

export async function resetDatabase() {
  await db.delete();
  db.close();
}
