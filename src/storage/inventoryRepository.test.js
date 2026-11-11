import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from './database';
import { saveProduct } from './productRepository';
import { listInventoryMovements, recordStockAdjustment } from './inventoryRepository';
import { recordStockIn } from '../financial/inventoryEngine';

beforeEach(async () => initializeDatabase());
afterEach(async () => resetDatabase());

describe('inventory repository', () => {
  it('records stock adjustment and updates product stock', async () => {
    await saveProduct({ id: 'P1', nama: 'Item', stok: 10, hpp: 1000 });
    
    // Test increase
    await recordStockAdjustment({
      productId: 'P1',
      quantity: 5,
      reason: 'Penambahan manual',
      transactionDate: '2026-11-11'
    });
    
    const pAfterInc = await db.products.get('P1');
    expect(pAfterInc.stok).toBe(15);
    
    // Test decrease
    await recordStockAdjustment({
      productId: 'P1',
      quantity: -3,
      reason: 'Rusak',
      transactionDate: '2026-11-11'
    });
    
    const pAfterDec = await db.products.get('P1');
    expect(pAfterDec.stok).toBe(12);
    
    const movements = await listInventoryMovements();
    expect(movements).toHaveLength(2);
    expect(movements[0].type).toBe('ADJUSTMENT');
    expect(movements[0].quantity).toBe(-3);
  });

  it('rejects adjustment that leads to negative stock', async () => {
    await saveProduct({ id: 'P1', nama: 'Item', stok: 5 });
    await expect(recordStockAdjustment({
      productId: 'P1',
      quantity: -6,
      transactionDate: '2026-11-11'
    })).rejects.toThrow('Stok tidak boleh negatif');
  });

  it('lists inventory movements with filter and limit', async () => {
    await saveProduct({ id: 'P1', nama: 'Item 1' });
    await saveProduct({ id: 'P2', nama: 'Item 2' });
    
    await recordStockIn({ productId: 'P1', quantity: 10, unitCost: 1000, transactionDate: '2026-11-10' });
    await recordStockAdjustment({ productId: 'P2', quantity: 5, transactionDate: '2026-11-11' });
    
    const all = await listInventoryMovements();
    expect(all).toHaveLength(2);
    
    const p1Only = await listInventoryMovements({ productId: 'P1' });
    expect(p1Only).toHaveLength(1);
    expect(p1Only[0].productId).toBe('P1');
    
    const limited = await listInventoryMovements({ limit: 1 });
    expect(limited).toHaveLength(1);
  });
});
