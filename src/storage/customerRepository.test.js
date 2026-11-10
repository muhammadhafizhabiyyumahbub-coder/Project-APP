import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { resetDatabase } from './database';
import { deleteCustomer, getCustomer, listCustomers, saveCustomer } from './customerRepository';

afterEach(async () => {
  await resetDatabase();
});

describe('customer repository', () => {
  it('creates, reads, lists, updates, and deletes customers', async () => {
    await saveCustomer({ id: 'C001', nama: '  Toko Sejahtera  ' });

    await expect(getCustomer('C001')).resolves.toMatchObject({ nama: 'Toko Sejahtera' });
    await expect(listCustomers()).resolves.toHaveLength(1);

    await saveCustomer({ id: 'C001', nama: 'Toko Sejahtera Baru' });
    await expect(getCustomer('C001')).resolves.toMatchObject({ nama: 'Toko Sejahtera Baru' });

    await deleteCustomer('C001');
    await expect(getCustomer('C001')).resolves.toBeUndefined();
  });

  it('rejects invalid customers', async () => {
    await expect(saveCustomer({ id: 'C002', nama: ' ' })).rejects.toThrow('Pelanggan memerlukan id dan nama.');
  });
});
