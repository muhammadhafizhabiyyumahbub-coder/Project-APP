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

  it('deducts the aggregated quantity when the same product appears on multiple lines', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 10, hpp: 60000 });

    const totalCost = await reserveSaleStock(
      [
        { productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 },
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
      ],
      'SALE-DUP-001',
      '2026-11-10',
    );

    expect(totalCost).toBe(300000); // 5 units * 60000 hpp
    expect((await db.products.get('P001')).stok).toBe(5);
  });

  it('deducts the aggregated quantity when the same product appears on three lines', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 20, hpp: 60000 });

    await reserveSaleStock(
      [
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
        { productId: 'P001', quantity: 5, unitPrice: 50000, total: 250000 },
        { productId: 'P001', quantity: 4, unitPrice: 50000, total: 200000 },
      ],
      'SALE-DUP-002',
      '2026-11-10',
    );

    expect((await db.products.get('P001')).stok).toBe(8); // 20 - 12
  });

  it('accepts duplicate lines when the total exactly matches stock', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 6, hpp: 60000 });

    await reserveSaleStock(
      [
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
      ],
      'SALE-EXACT',
      '2026-11-10',
    );

    expect((await db.products.get('P001')).stok).toBe(0);
    expect(await db.inventoryMovements.count()).toBe(1);
  });

  it('handles mixed products with duplicate lines', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 10, hpp: 60000 });
    await saveProduct({ id: 'P002', nama: 'Gula', stok: 15, hpp: 40000 });

    await reserveSaleStock(
      [
        { productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 },
        { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
        { productId: 'P002', quantity: 4, unitPrice: 45000, total: 180000 },
      ],
      'SALE-DUP-003',
      '2026-11-10',
    );

    expect((await db.products.get('P001')).stok).toBe(5);
    expect((await db.products.get('P002')).stok).toBe(11);
  });

  it('rejects duplicate lines whose aggregated quantity exceeds stock', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 4, hpp: 60000 });

    await expect(
      reserveSaleStock(
        [
          { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
          { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
        ],
        'SALE-INSUFF-001',
        '2026-11-10',
      ),
    ).rejects.toThrow('tidak mencukupi');

    expect((await db.products.get('P001')).stok).toBe(4);
    expect(await db.inventoryMovements.count()).toBe(0);
  });

  it('rejects the whole sale when one product in a mixed cart is short', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 10, hpp: 60000 });
    await saveProduct({ id: 'P002', nama: 'Gula', stok: 3, hpp: 40000 });

    await expect(
      reserveSaleStock(
        [
          { productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 },
          { productId: 'P001', quantity: 3, unitPrice: 50000, total: 150000 },
          { productId: 'P002', quantity: 4, unitPrice: 45000, total: 180000 },
        ],
        'SALE-MIX-FAIL',
        '2026-11-10',
      ),
    ).rejects.toThrow('tidak mencukupi');

    expect((await db.products.get('P001')).stok).toBe(10);
    expect((await db.products.get('P002')).stok).toBe(3);
    expect(await db.inventoryMovements.count()).toBe(0);
  });

  it('rejects invalid quantities and unknown products', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 10, hpp: 60000 });

    await expect(reserveSaleStock([{ productId: 'P001', quantity: 0 }], 'SALE-Q0', '2026-11-10'))
      .rejects.toThrow('Quantity harus integer positif');
    await expect(reserveSaleStock([{ productId: 'P001', quantity: -2 }], 'SALE-QNEG', '2026-11-10'))
      .rejects.toThrow('Quantity harus integer positif');
    await expect(reserveSaleStock([{ productId: 'P001', quantity: 1.5 }], 'SALE-QFRAC', '2026-11-10'))
      .rejects.toThrow('Quantity harus integer positif');
    await expect(reserveSaleStock([{ productId: 'MISSING', quantity: 1 }], 'SALE-NOPROD', '2026-11-10'))
      .rejects.toThrow('tidak ditemukan');
    await expect(reserveSaleStock([], 'SALE-EMPTY', '2026-11-10'))
      .rejects.toThrow('harus memiliki barang');

    expect((await db.products.get('P001')).stok).toBe(10);
    expect(await db.inventoryMovements.count()).toBe(0);
  });

  it('serializes concurrent sales so only one can take the last stock', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 5, hpp: 60000 });

    const attempts = await Promise.allSettled([
      reserveSaleStock([{ productId: 'P001', quantity: 4 }], 'SALE-CONCURRENT-A', '2026-11-10'),
      reserveSaleStock([{ productId: 'P001', quantity: 4 }], 'SALE-CONCURRENT-B', '2026-11-10'),
    ]);

    const fulfilled = attempts.filter(a => a.status === 'fulfilled');
    expect(fulfilled).toHaveLength(1);
    expect((await db.products.get('P001')).stok).toBe(1); // never negative
    expect(await db.inventoryMovements.count()).toBe(1); // only the successful sale left a movement
  });

  it('applies concurrent stock-ins without losing quantity or cost', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 10, hpp: 1000 });

    await Promise.all([
      recordStockIn({ productId: 'P001', quantity: 10, unitCost: 2000, transactionDate: '2026-11-10' }),
      recordStockIn({ productId: 'P001', quantity: 10, unitCost: 3000, transactionDate: '2026-11-10' }),
    ]);

    const product = await db.products.get('P001');
    expect(product.stok).toBe(30);
    expect(product.hpp).toBe(2000); // (10*1000 + 10*2000 + 10*3000) / 30
    expect(await db.inventoryMovements.count()).toBe(2);
  });

  it('leaves no partial change when stock-in targets a missing product', async () => {
    await expect(
      recordStockIn({ productId: 'MISSING', quantity: 5, unitCost: 1000, transactionDate: '2026-11-10' }),
    ).rejects.toThrow('tidak ditemukan');

    expect(await db.inventoryMovements.count()).toBe(0);
  });
});
