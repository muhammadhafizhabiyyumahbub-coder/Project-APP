import React, { useEffect, useState } from 'react';
import { initializeDatabase } from '../storage/database.js';
import { listProducts, saveProduct, deleteProduct } from '../storage/repository.js';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initializeDatabase();
        const list = await listProducts();
        if (mounted) {
          setProducts(list);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e.message || 'Gagal memuat produk dari penyimpanan lokal.');
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const addProduct = async (product) => {
    try {
      const saved = await saveProduct(product);
      setProducts((prev) => [...prev, saved]);
      return saved;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const updateProduct = async (id, product) => {
    try {
      const saved = await saveProduct({ ...product, id });
      setProducts((prev) => prev.map((p) => (p.id === id ? saved : p)));
      return saved;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    removeProduct,
  };
}
