import { db, initializeDatabase } from '../storage/database';
import { createId } from '../storage/idGenerator';
import { getProduct } from '../storage/productRepository';

export async function recordStockIn({ productId, quantity, unitCost, transactionDate }) {
  await initializeDatabase();
  if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(unitCost) || unitCost < 0) {
    throw new Error('Stok masuk memerlukan quantity dan unitCost integer valid.');
  }
  const product = await getProduct(productId);
  if (!product) throw new Error(`Produk ${productId} tidak ditemukan.`);

  const oldQuantity = product.stok || 0;
  const oldValue = oldQuantity * (product.hpp || 0);
  const newQuantity = oldQuantity + quantity;
  const newHpp = Math.floor((oldValue + quantity * unitCost) / newQuantity);
  product.stok = newQuantity;
  product.hpp = newHpp;

  await db.transaction('rw', db.products, db.inventoryMovements, async () => {
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
  });
  return product;
}

export async function reserveSaleStock(items, saleId, transactionDate) {
  await initializeDatabase();
  // Aggregate quantities by productId first to handle duplicate product lines correctly.
  // Each productId's total quantity should be deducted in one atomic operation.
  const productQuantities = new Map();
  let totalCost = 0;

  for (const item of items) {
    const product = await getProduct(item.productId);
    if (!product) throw new Error(`Produk ${item.productId} tidak ditemukan.`);
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error('Quantity harus integer positif.');
    
    const existingQty = productQuantities.get(item.productId) || 0;
    productQuantities.set(item.productId, existingQty + item.quantity);
    
    if ((product.stok || 0) < item.quantity) throw new Error(`Stok produk ${item.productId} tidak mencukupi.`);
    totalCost += item.quantity * (product.hpp || 0);
  }

  await db.transaction('rw', db.products, db.inventoryMovements, async () => {
    for (const [productId, totalQuantity] of productQuantities) {
      const product = await getProduct(productId);
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
  });
  return totalCost;
}