import { db, initializeDatabase } from './database';

function requireProduct(product) {
  if (!product?.id || !product?.nama?.trim()) {
    throw new Error('Produk memerlukan id dan nama.');
  }
  return { ...product, nama: product.nama.trim() };
}

export async function listProducts() {
  await initializeDatabase();
  return db.products.toArray();
}

export async function getProduct(id) {
  await initializeDatabase();
  return db.products.get(id);
}

export async function saveProduct(product) {
  await initializeDatabase();
  const validProduct = requireProduct(product);
  await db.products.put(validProduct);
  return validProduct;
}

export async function deleteProduct(id) {
  await initializeDatabase();
  return db.products.delete(id);
}
