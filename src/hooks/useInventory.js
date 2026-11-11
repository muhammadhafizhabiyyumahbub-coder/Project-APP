import { useEffect, useState, useRef } from 'react';
import { listInventoryMovements, recordStockAdjustment } from '../storage/inventoryRepository';
import { listProducts } from '../storage/productRepository';

export function useInventory() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = async () => {
    try {
      const [invMovements, prodList] = await Promise.all([
        listInventoryMovements({ limit: 50 }),
        listProducts(),
      ]);
      if (mountedRef.current) {
        setMovements(invMovements);
        setProducts(prodList);
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e.message || 'Gagal memuat data persediaan.');
        setMovements([]);
        setProducts([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reload = async () => {
    setLoading(true);
    await loadData();
  };

  const adjustStock = async (adjustment) => {
    try {
      const updatedProduct = await recordStockAdjustment(adjustment);
      await reload();
      return updatedProduct;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  return {
    movements,
    products,
    loading,
    error,
    reload,
    adjustStock,
  };
}
