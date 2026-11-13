import { db, initializeDatabase } from './database';

function requireSupplier(supplier) {
  if (!supplier?.id || !supplier?.nama?.trim()) throw new Error('Pemasok memerlukan id dan nama.');
  return { ...supplier, nama: supplier.nama.trim() };
}

export async function listSuppliers() {
  await initializeDatabase();
  return db.suppliers.toArray();
}

export async function getSupplier(id) {
  await initializeDatabase();
  return db.suppliers.get(id);
}

export async function saveSupplier(supplier) {
  await initializeDatabase();
  const valid = requireSupplier(supplier);
  await db.suppliers.put(valid);
  return valid;
}

export async function deleteSupplier(id) {
  await initializeDatabase();
  return db.suppliers.delete(id);
}
