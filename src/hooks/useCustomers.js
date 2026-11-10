import React, { useEffect, useState } from 'react';
import { initializeDatabase } from '../storage/database.js';
import { listCustomers, saveCustomer, deleteCustomer } from '../storage/customerRepository.js';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initializeDatabase();
        const list = await listCustomers();
        if (mounted) {
          setCustomers(list);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e.message || 'Gagal memuat pelanggan dari penyimpanan lokal.');
          setCustomers([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const addCustomer = async (customer) => {
    try {
      const saved = await saveCustomer(customer);
      setCustomers((prev) => [...prev, saved]);
      return saved;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const updateCustomer = async (id, customer) => {
    try {
      const saved = await saveCustomer({ ...customer, id });
      setCustomers((prev) => prev.map((c) => (c.id === id ? saved : c)));
      return saved;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const removeCustomer = async (id) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  return { customers, loading, error, addCustomer, updateCustomer, removeCustomer };
}
