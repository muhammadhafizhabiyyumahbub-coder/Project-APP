import { db, initializeDatabase } from '../storage/database';
import { createId } from '../storage/idGenerator';

export async function recordStockIn({ productId, quantity, unitCost, transactionDate }) {
  await initializeDatabase();
  if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(unitCost) || unitCost < 0) {
    throw new Error('Stok masuk memerlukan quantity dan unitCost integer valid.');
  }

  // Read, recompute and write inside one transaction so concurrent stock-ins cannot overwrite each other.
  return await db.transaction('rw', db.products, db.inventoryMovements, async () => {
    const product = await db.products.get(productId);
    if (!product) throw new Error(`Produk ${productId} tidak ditemukan.`);

    const oldQuantity = product.stok || 0;
    const oldValue = oldQuantity * (product.hpp || 0);
    const newQuantity = oldQuantity + quantity;
    product.stok = newQuantity;
    product.hpp = Math.floor((oldValue + quantity * unitCost) / newQuantity);

    await db.products.put(product);
    await db.inventoryMovements.put({
      id: createId('STOCK-IN'),
      productId,
      quantity,
      unitCost,
      transactionDate,
      type: 'STOCK_IN',
      createdAt: new Date().toISOString(),
    });
    return product;
  });
}

export async function reserveSaleStock(items, saleId, transactionDate) {
  await initializeDatabase();
  if (!Array.isArray(items) || items.length === 0) throw new Error('Penjualan harus memiliki barang.');

  // Aggregate quantities by productId so duplicate lines are validated and deducted as one total.
  const productQuantities = new Map();
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error('Quantity harus integer positif.');
    productQuantities.set(item.productId, (productQuantities.get(item.productId) || 0) + item.quantity);
  }

  // Availability check and deduction share the same read-write transaction, so a concurrent
  // sale cannot pass validation against stale stock and drive the balance negative.
  return await db.transaction('rw', db.products, db.inventoryMovements, async () => {
    let totalCost = 0;
    for (const [productId, totalQuantity] of productQuantities) {
      const product = await db.products.get(productId);
      if (!product) throw new Error(`Produk ${productId} tidak ditemukan.`);
      if ((product.stok || 0) < totalQuantity) throw new Error(`Stok produk ${productId} tidak mencukupi.`);

      totalCost += totalQuantity * (product.hpp || 0);
      product.stok -= totalQuantity;
      await db.products.put(product);
      await db.inventoryMovements.put({
        id: `STOCK-OUT-${saleId}-${productId}`,
        productId,
        saleId,
        quantity: totalQuantity,
        unitCost: product.hpp || 0,
        transactionDate,
        type: 'STOCK_OUT',
        createdAt: new Date().toISOString(),
      });
    }
    return totalCost;
  });
}
