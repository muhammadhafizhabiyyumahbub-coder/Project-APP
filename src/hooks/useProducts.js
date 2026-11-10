import React, { useEffect, useState } from 'react';
import { initializeDatabase } from '../storage/database.js';
import { listProducts, saveProduct, deleteProduct } from '../storage/productRepository.js';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = React.useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await initializeDatabase();
        const list = await listProducts();
        if (mountedRef.current) {
          setProducts(list);
          setError(null);
        }
      } catch (e) {
        if (mountedRef.current) {
          setError(e.message || 'Gagal memuat produk dari penyimpanan lokal.');
          setProducts([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
  }, []);

  const reloadProducts = async () => {
    setLoading(true);
    try {
      await initializeDatabase();
      const list = await listProducts();
      if (mountedRef.current) {
        setProducts(list);
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e.message || 'Gagal memuat produk dari penyimpanan lokal.');
        setProducts([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

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
    reloadProducts,
  };
}
