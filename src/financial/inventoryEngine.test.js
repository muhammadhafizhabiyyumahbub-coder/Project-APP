import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from '../storage/database';
import { saveProduct } from '../storage/productRepository';
import { recordStockIn, reserveSaleStock } from './inventoryEngine';

beforeEach(async () => initializeDatabase());
afterEach(async () => resetDatabase());

describe('Inventory engine', () => {
  it('calculates weighted average cost on stock in', async () => {
    await saveProduct({ id: 'P1', nama: 'Item', stok: 10, hpp: 1000 });
    const product = await recordStockIn({ productId: 'P1', quantity: 10, unitCost: 2000, transactionDate: '2026-11-10' });
    expect(product.stok).toBe(20);
    expect(product.hpp).toBe(1500);
  });

  it('rejects sale when stock is insufficient and deducts valid stock', async () => {
    await saveProduct({ id: 'P1', nama: 'Item', stok: 3, hpp: 1500 });
    await expect(reserveSaleStock([{ productId: 'P1', quantity: 4 }], 'SALE-1', '2026-11-10')).rejects.toThrow('tidak mencukupi');
    expect((await db.products.get('P1')).stok).toBe(3);

    await expect(reserveSaleStock([{ productId: 'P1', quantity: 2 }], 'SALE-2', '2026-11-10')).resolves.toBe(3000);
    expect((await db.products.get('P1')).stok).toBe(1);
  });
});