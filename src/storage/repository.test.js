import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { resetDatabase } from './database';
import { deleteProduct, getProduct, listProducts, saveProduct } from './repository';

afterEach(async () => {
  await resetDatabase();
});

describe('product repository', () => {
  it('creates, reads, lists, updates, and deletes products', async () => {
    await saveProduct({ id: 'P001', nama: '  Produk A  ', sku: 'A-01' });

    await expect(getProduct('P001')).resolves.toMatchObject({ nama: 'Produk A' });
    await expect(listProducts()).resolves.toHaveLength(1);

    await saveProduct({ id: 'P001', nama: 'Produk A Baru' });
    await expect(getProduct('P001')).resolves.toMatchObject({ nama: 'Produk A Baru' });

    await deleteProduct('P001');
    await expect(getProduct('P001')).resolves.toBeUndefined();
  });

  it('rejects invalid products', async () => {
    await expect(saveProduct({ id: 'P002', nama: ' ' })).rejects.toThrow('Produk memerlukan id dan nama.');
  });
});
