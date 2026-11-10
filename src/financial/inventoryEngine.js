import { db, initializeDatabase } from '../storage/database';
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
      id: `STOCK-IN-${Date.now()}`,
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
  const products = [];
  let totalCost = 0;

  for (const item of items) {
    const product = await getProduct(item.productId);
    if (!product) throw new Error(`Produk ${item.productId} tidak ditemukan.`);
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error('Quantity harus integer positif.');
    if ((product.stok || 0) < item.quantity) throw new Error(`Stok produk ${item.productId} tidak mencukupi.`);
    products.push({ product, item });
    totalCost += item.quantity * (product.hpp || 0);
  }

  await db.transaction('rw', db.products, db.inventoryMovements, async () => {
    for (const { product, item } of products) {
      product.stok -= item.quantity;
      await db.products.put(product);
      await db.inventoryMovements.put({
        id: `STOCK-OUT-${saleId}-${product.id}`,
        productId: product.id,
        saleId,
        quantity: item.quantity,
        unitCost: product.hpp || 0,
        transactionDate,
        type: 'STOCK_OUT',
        createdAt: new Date().toISOString(),
      });
    }
  });
  return totalCost;
}