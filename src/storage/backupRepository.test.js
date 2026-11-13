import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from './database';
import { getCustomer, saveCustomer } from './customerRepository';
import { exportBackup, importBackup } from './backupRepository';
import { saveProduct } from './productRepository';
import { createSale, recordPayment } from '../financial/transactionEngine';
import { getAccountBalance } from '../financial/financialEngine';

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

  it('rolls back fully when a restored row fails mid-way', async () => {
    await saveCustomer({ id: 'C001', nama: 'Tetap Ada' });

    const backup = await exportBackup();
    backup.tables.customers.push({ nama: 'tanpa id' });

    await expect(importBackup(backup)).rejects.toBeTruthy();
    await expect(getCustomer('C001')).resolves.toMatchObject({ nama: 'Tetap Ada' });
  });

  it('restores cash, receivable, and journal balances consistently', async () => {
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 5, hpp: 60000 });
    const sale = await createSale({
      saleNumber: 'INV-BK-1', transactionDate: '2026-11-10', customerId: 'C001',
      items: [{ productId: 'P001', quantity: 2, unitPrice: 100000, total: 200000 }],
      totalAmount: 200000, paymentMethod: 'CREDIT', paidAmount: 0,
    });
    await recordPayment({ paymentNumber: 'PAY-BK-1', transactionDate: '2026-11-11', saleId: sale.id, amount: 50000 });

    const backup = await exportBackup();
    const balancesBefore = await Promise.all(['1010', '1100', '4000'].map(code => getAccountBalance(code)));

    await createSale({
      saleNumber: 'INV-BK-2', transactionDate: '2026-11-12', customerId: 'C001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 100000, total: 100000 }],
      totalAmount: 100000, paymentMethod: 'CASH', paidAmount: 100000,
    });
    await importBackup(backup);

    const balancesAfter = await Promise.all(['1010', '1100', '4000'].map(code => getAccountBalance(code)));
    expect(balancesAfter).toEqual(balancesBefore);
    expect(balancesAfter).toEqual([50000, 150000, 200000]);
    await expect(db.sales.count()).resolves.toBe(1);
    await expect(db.journals.count()).resolves.toBe(2);
  });
});
