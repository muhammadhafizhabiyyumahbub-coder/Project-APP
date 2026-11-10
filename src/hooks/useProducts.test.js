import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProducts } from './useProducts';
import * as repo from '../storage/productRepository.js';
import * as database from '../storage/database.js';

vi.mock('../storage/productRepository.js');
vi.mock('../storage/database.js');

afterEach(() => {
  vi.clearAllMocks();
});

describe('useProducts hook', () => {
  it('loads products on mount', async () => {
    vi.mocked(database.initializeDatabase).mockResolvedValue(undefined);
    vi.mocked(repo.listProducts).mockResolvedValue([
      { id: 'P001', nama: 'Produk A' },
    ]);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('handles load error', async () => {
    vi.mocked(database.initializeDatabase).mockResolvedValue(undefined);
    vi.mocked(repo.listProducts).mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(0);
    expect(result.current.error).toBe('DB error');
  });

  it('adds product', async () => {
    vi.mocked(database.initializeDatabase).mockResolvedValue(undefined);
    vi.mocked(repo.listProducts).mockResolvedValue([]);
    vi.mocked(repo.saveProduct).mockImplementation((p) => Promise.resolve(p));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.addProduct({ id: 'P002', nama: 'Produk B' });

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(result.current.products[0].id).toBe('P002');
  });
});
