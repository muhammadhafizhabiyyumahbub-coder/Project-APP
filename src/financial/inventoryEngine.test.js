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

  it('handles same product in multiple lines - total quantity deducted correctly', async () => {
    // Product P001 with stok 10
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 10, hpp: 60000 });
    
    // Two line items for same product: qty 2 + qty 3 = 5 total
    // Expected stok: 10 - 5 = 5
    await reserveSaleStock(
      [
        { productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 },
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 }
      ],
      'SALE-DUP-001',
      '2026-11-10'
    );
    
    const product = await db.products.get('P001');
    // BUG: Without fix, stok might be 7 or 8 instead of 5
    // Because each line reads stok=10 and subtracts independently
    // After fix: stok should be exactly 5
    expect(product.stok).toBe(5);
  });

  it('handles same product in three lines - total quantity deducted correctly', async () => {
    // Product P001 with stok 20
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 20, hpp: 60000 });
    
    // Three line items for same product: qty 3 + qty 5 + qty 4 = 12 total
    // Expected stok: 20 - 12 = 8
    await reserveSaleStock(
      [
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
        { productId: 'P001', quantity: 5, unitPrice: 50000, total: 250000 },
        { productId: 'P001', quantity: 4, unitPrice: 50000, total: 200000 }
      ],
      'SALE-DUP-002',
      '2026-11-10'
    );
    
    const product = await db.products.get('P001');
    // Expected: stok = 20 - 12 = 8
    expect(product.stok).toBe(8);
  });

  it('handles mixed products with one having duplicate lines', async () => {
    // Product P001 with stok 10, Product P002 with stok 15
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 10, hpp: 60000 });
    await saveProduct({ id: 'P002', nama: 'Gula', stok: 15, hpp: 40000 });
    
    // P001 appears twice (qty 2 + qty 3 = 5), P001 appears once (qty 4)
    await reserveSaleStock(
      [
        { productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 },
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
        { productId: 'P002', quantity: 4, unitPrice: 45000, total: 180000 }
      ],
      'SALE-DUP-003',
      '2026-11-10'
    );
    
    const product1 = await db.products.get('P001');
    const product2 = await db.products.get('P002');
    
    // P001: stok = 10 - 5 = 5
    // P002: stok = 15 - 4 = 11
    expect(product1.stok).toBe(5);
    expect(product2.stok).toBe(11);
  });
});