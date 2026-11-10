import { db, initializeDatabase } from './database';

function requireCustomer(customer) {
  if (!customer?.id || !customer?.nama?.trim()) {
    throw new Error('Pelanggan memerlukan id dan nama.');
  }
  return { ...customer, nama: customer.nama.trim() };
}

export async function listCustomers() {
  await initializeDatabase();
  return db.customers.toArray();
}

export async function getCustomer(id) {
  await initializeDatabase();
  return db.customers.get(id);
}

export async function saveCustomer(customer) {
  await initializeDatabase();
  const valid = requireCustomer(customer);
  await db.customers.put(valid);
  return valid;
}

export async function deleteCustomer(id) {
  await initializeDatabase();
  return db.customers.delete(id);
}
