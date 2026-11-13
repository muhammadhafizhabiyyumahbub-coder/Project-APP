import { db, initializeDatabase } from './database';

function requireEmployee(employee) {
  if (!employee?.id || !employee?.nama?.trim()) throw new Error('Karyawan memerlukan id dan nama.');
  return { ...employee, nama: employee.nama.trim() };
}

export async function listEmployees() {
  await initializeDatabase();
  return db.employees.toArray();
}

export async function getEmployee(id) {
  await initializeDatabase();
  return db.employees.get(id);
}

export async function saveEmployee(employee) {
  await initializeDatabase();
  const valid = requireEmployee(employee);
  await db.employees.put(valid);
  return valid;
}

export async function deleteEmployee(id) {
  await initializeDatabase();
  return db.employees.delete(id);
}
