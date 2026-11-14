import { db, initializeDatabase, DATABASE_VERSION } from './database';

export const BACKUP_FORMAT = 'UMKM_MANAGER_BACKUP';
export const BACKUP_FORMAT_VERSION = 1;

export async function exportBackup() {
  await initializeDatabase();
  const tables = await db.transaction('r', db.tables, async () => Object.fromEntries(
    await Promise.all(db.tables.map(async table => [table.name, await table.toArray()]))
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
  
  // S-1: Row-level validation - check required fields per table
  const requiredFields = {
    businesses: ['id'],
    products: ['id', 'nama', 'stok', 'hpp'],
    customers: ['id', 'nama'],
    settings: ['id', 'key'],
    features: ['featureId'],
    journals: ['id', 'status', 'idempotencyKey', 'reference'],
    auditTrail: ['id', 'entityId', 'action', 'reference'],
    sales: ['id', 'saleNumber', 'customerId', 'journalId', 'transactionDate'],
    payments: ['id', 'paymentNumber', 'saleId', 'journalId'],
    // inventoryMovements: saleId wajib hanya untuk STOCK_OUT, tidak untuk STOCK_IN
    inventoryMovements: ['id', 'productId', 'transactionDate'],
    suppliers: ['id', 'nama'],
    employees: ['id', 'nama'],
  };
  
  for (const [tableName, fields] of Object.entries(requiredFields)) {
    const rows = backup.tables[tableName];
    if (rows) {
      for (const row of rows) {
        for (const field of fields) {
          if (row[field] === undefined || row[field] === null) {
            throw new Error(`Data baris pada tabel ${tableName} tidak valid: field wajib '${field}' hilang.`);
          }
        }
        // Validate numeric types after all required fields checked
        if (tableName === 'products') {
          if (!Number.isInteger(row.stok)) {
            throw new Error(`Data baris pada tabel products tidak valid: field 'stok' harus berupa bilangan integer.`);
          }
          if (!Number.isInteger(row.hpp)) {
            throw new Error(`Data baris pada tabel products tidak valid: field 'hpp' harus berupa bilangan integer.`);
          }
        }
        if (tableName === 'inventoryMovements') {
          if (!Number.isInteger(row.quantity)) {
            throw new Error(`Data baris pada tabel inventoryMovements tidak valid: field 'quantity' harus berupa bilangan integer.`);
          }
        }
      }
      // Post-validation: inventoryMovements - saleId required only for STOCK_OUT type
      if (tableName === 'inventoryMovements') {
        for (const row of rows) {
          const type = row.type;
          if (type === 'STOCK_OUT' && (row.saleId === undefined || row.saleId === null)) {
            throw new Error(`Data baris pada tabel inventoryMovements tidak valid: field wajib 'saleId' hilang untuk jenis STOCK_OUT.`);
          }
        }
      }
    }
  }
}

export async function importBackup(backup) {
  await initializeDatabase();
  validateBackup(backup);
  // Dexie rolls back the whole transaction if any table write fails, so original data stays intact.
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
      await table.bulkAdd(backup.tables[table.name]);
    }
  });
}
