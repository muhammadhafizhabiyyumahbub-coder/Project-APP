import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { resetDatabase } from './database';
import { deleteSupplier, getSupplier, listSuppliers, saveSupplier } from './supplierRepository';

afterEach(resetDatabase);

describe('supplier repository', () => {
  it('supports CRUD and trims names', async () => {
    await saveSupplier({ id: 'SUP-001', nama: ' Supplier Utama ' });
    await expect(getSupplier('SUP-001')).resolves.toMatchObject({ nama: 'Supplier Utama' });
    await saveSupplier({ id: 'SUP-001', nama: 'Supplier Baru' });
    await expect(listSuppliers()).resolves.toHaveLength(1);
    await deleteSupplier('SUP-001');
    await expect(getSupplier('SUP-001')).resolves.toBeUndefined();
  });

  it('rejects missing name', async () => {
    await expect(saveSupplier({ id: 'SUP-002', nama: ' ' })).rejects.toThrow('Pemasok memerlukan id dan nama.');
  });
});
