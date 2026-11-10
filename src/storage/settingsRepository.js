import { db, initializeDatabase } from './database';

export async function getSetting(key) {
  await initializeDatabase();
  return db.settings.get(key);
}

export async function saveSetting(key, value) {
  await initializeDatabase();
  await db.settings.put({ id: key, key, value });
  return value;
}

export async function listSettings() {
  await initializeDatabase();
  return db.settings.toArray();
}
