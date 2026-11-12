import React, { useEffect, useState } from 'react';
import { getSalesByCustomer, getSalesStats } from '../../src/storage/salesRepository.js';
import { getCustomer } from '../../src/storage/customerRepository.js';
import { recordPayment } from '../../src/financial/transactionEngine.js';
import { toLocalDateKey } from '../../src/financial/dateKey.js';
import { Card, Badge, Button } from './app.jsx';

function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export function CustomerOrdersScreen({ customerId, onBack }) {
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSale, setPaymentSale] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [customerData, salesData, statsData] = await Promise.all([
          getCustomer(customerId),
          getSalesByCustomer(customerId, 50),
          getSalesStats(customerId),
        ]);
        if (mounted) {
          setCustomer(customerData);
          setSales(salesData);
          setStats(statsData);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e.message || 'Gagal memuat data pesanan.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [customerId]);

  if (loading) return <div className="p-6 text-sm text-slate-500">Memuat riwayat pesanan...</div>;
  if (error) return <div role="alert" className="p-4 rounded-lg bg-red-50 text-red-700">{error}</div>;
  if (!customer) return <div className="p-6 text-sm text-slate-500">Pelanggan tidak ditemukan.</div>;

  const submitPayment = async (event) => {
    event.preventDefault();
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > paymentSale.totalAmount - paymentSale.paidAmount) {
      setError('Jumlah pembayaran tidak valid.');
      return;
    }
    setSaving(true);
    try {
      await recordPayment({
        saleId: paymentSale.id,
        amount,
        paymentNumber: `PAY-${Date.now()}`,
        transactionDate: toLocalDateKey(new Date()),
      });
      const [salesData, statsData] = await Promise.all([
        getSalesByCustomer(customerId, 50),
        getSalesStats(customerId),
      ]);
      setSales(salesData);
      setStats(statsData);
      setPaymentSale(null);
      setPaymentAmount('');
      setError(null);
    } catch (e) {
      setError(e.message || 'Gagal mencatat pembayaran.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={onBack}>← Kembali</Button>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mt-3">{customer.nama}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Riwayat pesanan dan transaksi</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Transaksi</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">{stats.totalTransactions}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Pembelian</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatIDR(stats.totalAmount)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sudah Dibayar</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatIDR(stats.totalPaid)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Piutang</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatIDR(stats.totalUnpaid)}</p>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Riwayat Pesanan</h2>
        {sales.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            Belum ada pesanan dari pelanggan ini
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Nomor</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium text-right">Dibayar</th>
                  <th className="px-5 py-3 font-medium text-right">Sisa</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{sale.transactionDate}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{sale.saleNumber}</div>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-900 dark:text-slate-100 font-medium">
                      {formatIDR(sale.totalAmount)}
                    </td>
                    <td className="px-5 py-3 text-right text-blue-600 dark:text-blue-400">
                      {formatIDR(sale.paidAmount)}
                    </td>
                    <td className="px-5 py-3 text-right text-rose-600 dark:text-rose-400">
                      {formatIDR(sale.totalAmount - sale.paidAmount)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={sale.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {sale.status === 'COMPLETED' ? 'Lunas' : 'Belum Lunas'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {sale.status !== 'COMPLETED' && (
                        <Button variant="ghost" onClick={() => { setPaymentSale(sale); setPaymentAmount(String(sale.totalAmount - sale.paidAmount)); }}>
                          Catat pembayaran
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paymentSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form onSubmit={submitPayment} className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-5 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Catat pembayaran</h2>
            <p className="text-sm text-slate-500">Sisa tagihan: {formatIDR(paymentSale.totalAmount - paymentSale.paidAmount)}</p>
            <input
              aria-label="Jumlah pembayaran"
              type="number"
              min="1"
              max={paymentSale.totalAmount - paymentSale.paidAmount}
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
              required
            />
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => setPaymentSale(null)} disabled={saving}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan pembayaran'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
