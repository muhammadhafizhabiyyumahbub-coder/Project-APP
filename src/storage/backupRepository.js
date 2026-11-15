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
    // saleId is validated per movement type below: STOCK_OUT requires it, STOCK_IN/ADJUSTMENT do not.
    inventoryMovements: ['id', 'productId', 'transactionDate', 'type'],
    suppliers: ['id', 'nama'],
    employees: ['id', 'nama'],
  };
  const movementTypes = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'];

  for (const [tableName, fields] of Object.entries(requiredFields)) {
    const rows = backup.tables[tableName];
    if (rows) {
      for (const row of rows) {
        for (const field of fields) {
          if (row[field] === undefined || row[field] === null) {
            throw new Error(`Data baris pada tabel ${tableName} tidak valid: field wajib '${field}' hilang.`);
          }
        }
        // Validate numeric types and ranges after all required fields checked
        if (tableName === 'products') {
          if (!Number.isInteger(row.stok) || row.stok < 0) {
            throw new Error(`Data baris pada tabel products tidak valid: field 'stok' harus berupa bilangan integer tidak negatif.`);
          }
          if (!Number.isInteger(row.hpp) || row.hpp < 0) {
            throw new Error(`Data baris pada tabel products tidak valid: field 'hpp' harus berupa bilangan integer tidak negatif.`);
          }
        }
        if (tableName === 'inventoryMovements') {
          if (!movementTypes.includes(row.type)) {
            throw new Error(`Data baris pada tabel inventoryMovements tidak valid: jenis movement '${row.type}' tidak dikenal.`);
          }
          if (!Number.isInteger(row.quantity)) {
            throw new Error(`Data baris pada tabel inventoryMovements tidak valid: field 'quantity' harus berupa bilangan integer.`);
          }
          if (row.unitCost !== undefined && (!Number.isInteger(row.unitCost) || row.unitCost < 0)) {
            throw new Error(`Data baris pada tabel inventoryMovements tidak valid: field 'unitCost' harus berupa bilangan integer tidak negatif.`);
          }
          if (row.type === 'STOCK_OUT' && (row.saleId === undefined || row.saleId === null)) {
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
