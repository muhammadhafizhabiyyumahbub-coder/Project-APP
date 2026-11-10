import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { DATABASE_VERSION, db, initializeDatabase, resetDatabase } from './database';

afterEach(async () => {
  await resetDatabase();
});

describe('local database foundation', () => {
  it('opens current schema and exposes expected tables', async () => {
    await initializeDatabase();

    expect(DATABASE_VERSION).toBe(1);
    expect(db.tables.map((table) => table.name)).toEqual([
      'businesses', 'products', 'customers', 'settings', 'features',
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

  it('rolls back a failed transaction', async () => {
    await initializeDatabase();

    await expect(db.transaction('rw', db.products, async () => {
      await db.products.put({ id: 'P002', nama: 'Produk B' });
      throw new Error('rollback');
    })).rejects.toThrow('rollback');

    await expect(db.products.get('P002')).resolves.toBeUndefined();
  });
});
