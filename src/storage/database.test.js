import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DATABASE_VERSION, db, initializeDatabase, resetDatabase } from './database';

afterEach(async () => {
  await resetDatabase();
});

describe('local database foundation', () => {
  it('opens current schema and exposes expected tables', async () => {
    await initializeDatabase();

    expect(DATABASE_VERSION).toBe(3);
    expect(db.tables.map((table) => table.name)).toEqual([
      'businesses', 'products', 'customers', 'settings', 'features', 'journals', 'auditTrail', 'sales', 'payments', 'inventoryMovements', 'suppliers', 'employees',
    ]);
  });

  it('persists product records after reopening', async () => {
    await initializeDatabase();
    await db.products.put({ id: 'P001', nama: 'Produk A', sku: 'A-01' });

    db.close();
    await initializeDatabase();

    await expect(db.products.get('P001')).resolves.toMatchObject({
      id: 'P001',
      nama: 'Produk A',
    });
  });

  it('persists product records across database connections', async () => {
    await initializeDatabase();
    await db.products.put({ id: 'P003', nama: 'Produk Browser', sku: 'B-03' });
    db.close();

    const secondConnection = new Dexie('umkm-manager');
    secondConnection.version(DATABASE_VERSION).stores({
      businesses: 'id',
      products: 'id, sku, nama',
      customers: 'id, nama',
      settings: 'id, key',
      features: 'featureId',
      journals: 'id, status, idempotencyKey, reference',
      auditTrail: 'id, entityId, action, reference',
      sales: 'id, saleNumber, customerId, journalId',
      payments: 'id, paymentNumber, saleId, journalId',
      inventoryMovements: 'id, productId, saleId, transactionDate',
    });
    await secondConnection.open();

    await expect(secondConnection.products.get('P003')).resolves.toMatchObject({
      id: 'P003',
      nama: 'Produk Browser',
    });

    secondConnection.close();
  });

  it('rolls back a failed transaction', async () => {
    await initializeDatabase();

    await expect(db.transaction('rw', db.products, async () => {
      await db.products.put({ id: 'P002', nama: 'Produk B' });
      throw new Error('rollback');
    })).rejects.toThrow('rollback');

    await expect(db.products.get('P002')).resolves.toBeUndefined();
  });

  it('rejects when the database cannot be opened', async () => {
    db.close();
    const open = vi.spyOn(db, 'open').mockRejectedValueOnce(new Error('IndexedDB blocked'));
    await expect(initializeDatabase()).rejects.toThrow('IndexedDB blocked');
    open.mockRestore();
  });

  it('preserves existing records when schema version is bumped', async () => {
    const v1 = new Dexie('umkm-manager-migration-test');
    v1.version(1).stores({ products: 'id, nama' });
    await v1.open();
    await v1.products.put({ id: 'P001', nama: 'Produk Lama' });
    v1.close();

    const v2 = new Dexie('umkm-manager-migration-test');
    v2.version(1).stores({ products: 'id, nama' });
    v2.version(2).stores({ products: 'id, nama', customers: 'id, nama' }).upgrade(() => {});
    await v2.open();

    await expect(v2.products.get('P001')).resolves.toMatchObject({ nama: 'Produk Lama' });
    expect(v2.customers).toBeDefined();

    await v2.delete();
  });
});
