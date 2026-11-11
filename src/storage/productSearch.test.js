import { describe, expect, it } from 'vitest';
import { matchesProduct, listProductCategories } from './productSearch';

describe('productSearch', () => {
  it('matchesProduct with empty query returns all products', () => {
    const products = [
      { id: 'P001', nama: 'Beras Wangi', sku: 'B-5', kategori: 'Sembako' },
      { id: 'P002', nama: 'Minyak', sku: 'M-2', kategori: 'Minyak' },
    ];
    expect(matchesProduct(products[0], '', '')).toBe(true);
    expect(matchesProduct(products[1], '', '')).toBe(true);
  });

  it('matchesProduct filters by search query', () => {
    const products = [
      { id: 'P001', nama: 'Beras Wangi', sku: 'B-5', kategori: 'Sembako' },
    ];
    expect(matchesProduct(products[0], 'beras', '')).toBe(true);
    expect(matchesProduct(products[0], 'wangi', '')).toBe(true);
    expect(matchesProduct(products[0], 'minyak', '')).toBe(false);
  });

  it('matchesProduct filters by category', () => {
    const products = [
      { id: 'P001', nama: 'Beras', sku: 'B-5', kategori: 'Sembako' },
      { id: 'P002', nama: 'Minyak', sku: 'M-2', kategori: 'Minyak' },
    ];
    expect(matchesProduct(products[0], '', 'Sembako')).toBe(true);
    expect(matchesProduct(products[1], '', 'Sembako')).toBe(false);
  });

  it('matchesProduct is case-insensitive', () => {
    const products = [
      { id: 'P001', nama: 'Beras Wangi', sku: 'B-5', kategori: 'Sembako' },
    ];
    expect(matchesProduct(products[0], 'BERAS', '')).toBe(true);
    expect(matchesProduct(products[0], 'bErAs', '')).toBe(true);
  });

  it('listProductCategories returns unique categories', () => {
    const products = [
      { id: 'P001', nama: 'Beras', sku: 'B-5', kategori: 'Sembako' },
      { id: 'P002', nama: 'Minyak', sku: 'M-2', kategori: 'Sembako' },
      { id: 'P003', nama: 'Gula', sku: 'G-1', kategori: 'Sembako' },
      { id: 'P004', nama: 'Sabun', sku: 'S-1', kategori: 'Kebutuhan' },
    ];
    const cats = listProductCategories(products);
    expect(cats).toContain('Sembako');
    expect(cats).toContain('Kebutuhan');
    expect(cats.length).toBe(2);
  });

  it('listProductCategories with empty products array', () => {
    expect(listProductCategories([])).toEqual([]);
  });
});