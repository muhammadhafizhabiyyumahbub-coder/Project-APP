import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initializeDatabase, resetDatabase } from './database';
import { getCustomer, saveCustomer } from './customerRepository';
import { exportBackup, importBackup } from './backupRepository';

beforeEach(initializeDatabase);
afterEach(resetDatabase);

describe('backup repository', () => {
  it('exports and restores all stored tables', async () => {
    await saveCustomer({ id: 'C001', nama: 'Toko Lama' });
    const backup = await exportBackup();
    await saveCustomer({ id: 'C002', nama: 'Data Baru' });

    await importBackup(backup);

    await expect(getCustomer('C001')).resolves.toMatchObject({ nama: 'Toko Lama' });
    await expect(getCustomer('C002')).resolves.toBeUndefined();
  });

  it('rejects incomplete backups without changing data', async () => {
    await saveCustomer({ id: 'C001', nama: 'Tetap Ada' });

    await expect(importBackup({ manifest: { format: 'UMKM_MANAGER_BACKUP', formatVersion: 1 }, tables: {} })).rejects.toThrow('Data tabel');
    await expect(getCustomer('C001')).resolves.toMatchObject({ nama: 'Tetap Ada' });
  });
});
