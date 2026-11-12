import { db, initializeDatabase } from './database';
import { createId } from './idGenerator';

export async function listInventoryMovements({ productId, limit = 100 } = {}) {
  await initializeDatabase();
  let query = db.inventoryMovements.orderBy('transactionDate').reverse();
  if (productId) {
    query = query.filter(m => m.productId === productId);
  }
  return query.limit(limit).toArray();
}

export async function getInventoryMovement(id) {
  await initializeDatabase();
  return db.inventoryMovements.get(id);
}

export async function recordStockAdjustment({ productId, quantity, reason, transactionDate }) {
  await initializeDatabase();
  const product = await db.products.get(productId);
  if (!product) throw new Error(`Produk ${productId} tidak ditemukan.`);
  
  const newStock = (product.stok || 0) + quantity;
  if (newStock < 0) throw new Error('Stok tidak boleh negatif setelah penyesuaian.');

  await db.transaction('rw', db.products, db.inventoryMovements, async () => {
    product.stok = newStock;
    await db.products.put(product);
    await db.inventoryMovements.put({
      id: createId('ADJ'),
      productId,
      quantity,
      unitCost: product.hpp || 0,
      transactionDate,
      type: 'ADJUSTMENT',
      reason: reason || 'Penyesuaian stok',
      createdAt: new Date().toISOString(),
    });
  });
  return product;
}
