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

  it('verifies cross-profile restore: all numbers match after export/import cycle', async () => {
    // Step 1: Create full test dataset
    // Create product
    await saveProduct({ id: 'P001', nama: 'Beras', stok: 5, hpp: 60000 });
    // Create customer
    await saveCustomer({ id: 'C001', nama: 'Toko Berkah' });

    // Step 2: Create cash sale (full payment)
    const cashSale = await createSale({
      saleNumber: 'INV-CASH-001', transactionDate: '2026-11-10', customerId: 'C001',
      items: [{ productId: 'P001', quantity: 2, unitPrice: 50000, total: 100000 }],
      totalAmount: 100000, paymentMethod: 'CASH', paidAmount: 100000,
    });

    // Step 3: Create credit sale + partial payment
    const creditSale = await createSale({
      saleNumber: 'INV-CREDIT-001', transactionDate: '2026-11-11', customerId: 'C001',
      items: [{ productId: 'P001', quantity: 1, unitPrice: 75000, total: 75000 }],
      totalAmount: 75000, paymentMethod: 'CREDIT', paidAmount: 0,
    });
    await recordPayment({
      paymentNumber: 'PAY-PP-001', transactionDate: '2026-11-12', saleId: creditSale.id, amount: 25000,
    });

    // Step 4: Record baseline numbers before backup
    const backup = await exportBackup();

    const baselineRecordCounts = {};
    for (const table of db.tables) {
      const name = table.name;
      baselineRecordCounts[name] = await table.count();
    }

    const balancesBefore = await Promise.all(['1010', '1100', '4000', '5100'].map(code => getAccountBalance(code)));
    const journalLinesBefore = await db.journals.count();

    // Also compute expected totals from the data
    // Cash (1010): from cash sale (100000) + partial payment (25000) = 125000
    // Receivables (1100): from credit sale (75000) - partial payment (25000) = 50000
    // Revenue (4000): from both sales (100000 + 75000) = 175000
    // HPP (5100): from both sales (2 * 60000 + 1 * 60000) = 180000

    // Step 5: Clear database (simulate new profile/problematic state)
    await resetDatabase();

    // Step 6: Import backup (simulate cross-profile restore)
    await importBackup(backup);

    // Step 7: Compare all numbers against baseline
    // Verify record counts match
    const recordCountsAfter = {};
    for (const table of db.tables) {
      const name = table.name;
      recordCountsAfter[name] = await table.count();
    }

    for (const tableName of Object.keys(baselineRecordCounts)) {
      expect(recordCountsAfter[tableName])
        .withContext(`table ${tableName}`)
        .toBe(baselineRecordCounts[tableName]);
    }

    // Verify account balances match (these are promises from getAccountBalance)
    const balancesAfter = await Promise.all(['1010', '1100', '4000', '5100'].map(code => getAccountBalance(code)));
    expect(balancesAfter).toEqual(balancesBefore);

    // Verify journal balance (debit = credit for each journal entry, and total debits = total credits)
    const allJournals = await db.journals.toArray();
    const paymentJournals = allJournals.filter(j => j.reference.startsWith('PAYMENT:'));
    const saleJournals = allJournals.filter(j => j.reference.startsWith('SALE:'));

    // Check that payment journals have balanced entries
    for (const journal of paymentJournals) {
      const entries = journal.entries || [];
      let totalDebit = 0, totalCredit = 0;
      for (const entry of entries) {
        totalDebit += entry.debit || 0;
        totalCredit += entry.credit || 0;
      }
      expect(totalDebit).toBe(totalCredit);
    }

    // Check that sale journals have balanced entries
    for (const journal of saleJournals) {
      const entries = journal.entries || [];
      let totalDebit = 0, totalCredit = 0;
      for (const entry of entries) {
        totalDebit += entry.debit || 0;
        totalCredit += entry.credit || 0;
      }
      expect(totalDebit).toBe(totalCredit);
    }

    // Verify no duplicate sales (await the promise)
    const salesCount = await db.sales.count();
    expect(salesCount).toBe(2); // cash sale + credit sale

    // Verify specific balance expectations
    expect(balancesAfter).toEqual([125000, 50000, 175000, 180000]);

    // Verify journal line count (await the promise)
    const journalsCount = await db.journals.count();
    expect(journalsCount).toBe(journalLinesBefore);
  });

  it('S-1: rejects backup with invalid row shapes (missing required fields)', async () => {
    await saveProduct({ id: 'P-VALID', nama: 'Produk Valid', stok: 10, hpp: 5000 });
    const backup = await exportBackup();

    // Row has a valid primary key (id) but is missing the required 'nama' field.
    // Dexie would store this row without complaint, so only row-level validation catches it.
    backup.tables.products.push({ id: 'P-CORRUPT', stok: 5, hpp: 1000 });

    await expect(importBackup(backup)).rejects.toThrow('Data baris pada tabel products tidak valid');

    // Original data must remain intact (atomic rollback).
    const p = await db.products.get('P-VALID');
    expect(p.nama).toBe('Produk Valid');
    expect(await db.products.get('P-CORRUPT')).toBeUndefined();
  });
});
