import { db, initializeDatabase, DATABASE_VERSION } from './database';

export const BACKUP_FORMAT = 'UMKM_MANAGER_BACKUP';
export const BACKUP_FORMAT_VERSION = 1;

export async function exportBackup() {
  await initializeDatabase();
  const tables = Object.fromEntries(await Promise.all(
    db.tables.map(async table => [table.name, await table.toArray()])
  ));
  return {
    manifest: {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_FORMAT_VERSION,
      databaseSchemaVersion: DATABASE_VERSION,
      createdAt: new Date().toISOString(),
      recordCounts: Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length])),
    },
    tables,
  };
}

function validateBackup(backup) {
  if (!backup || backup.manifest?.format !== BACKUP_FORMAT || backup.manifest?.formatVersion !== BACKUP_FORMAT_VERSION || !backup.tables) {
    throw new Error('Format backup tidak valid.');
  }
  for (const table of db.tables) {
    if (!Array.isArray(backup.tables[table.name])) throw new Error(`Data tabel ${table.name} tidak valid.`);
  }
}

export async function importBackup(backup) {
  await initializeDatabase();
  validateBackup(backup);
  const snapshot = await exportBackup();
  try {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
        await table.bulkAdd(backup.tables[table.name]);
      }
    });
  } catch (error) {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
        await table.bulkAdd(snapshot.tables[table.name]);
      }
    });
    throw error;
  }
}
