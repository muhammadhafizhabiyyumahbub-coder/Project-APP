import React, { useEffect, useState } from 'react';
import { listSales } from '../../src/storage/salesRepository.js';
import { recordPayment } from '../../src/financial/transactionEngine.js';
import { toLocalDateKey } from '../../src/financial/dateKey.js';
import { Card, Button } from './app.jsx';

const formatIDR = (amount) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
}).format(amount);

export function ReceivablesScreen({ customers = [] }) {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const allSales = await listSales({ limit: 1000 });
      setSales(allSales.filter((sale) => sale.paidAmount < sale.totalAmount));
      setError(null);
    } catch (e) {
      setError(e.message || 'Gagal memuat piutang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const customerName = (id) => customers.find((customer) => customer.id === id)?.nama || 'Pelanggan umum';
  const total = sales.reduce((sum, sale) => sum + sale.totalAmount - sale.paidAmount, 0);

  const submit = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    const remaining = selectedSale.totalAmount - selectedSale.paidAmount;
    if (!Number.isFinite(value) || value <= 0 || value > remaining) {
      setError('Jumlah pembayaran tidak valid.');
      return;
    }
    setSaving(true);
    try {
      await recordPayment({
        saleId: selectedSale.id,
        amount: value,
        paymentNumber: `PAY-${Date.now()}`,
        transactionDate: toLocalDateKey(new Date()),
      });
      setSelectedSale(null);
      setAmount('');
      await load();
    } catch (e) {
      setError(e.message || 'Gagal mencatat pembayaran.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Buku Piutang</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau tagihan pelanggan yang belum lunas.</p>
      </div>
      {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">Total piutang</p>
        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatIDR(total)}</p>
      </Card>
      {loading ? <div className="text-sm text-slate-500">Memuat piutang...</div> : (
        <Card noPadding>
          {sales.length === 0 ? <div className="p-8 text-center text-slate-500">Tidak ada piutang aktif.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs">
                  <tr><th className="px-5 py-3">Pelanggan</th><th className="px-5 py-3">Nomor</th><th className="px-5 py-3 text-right">Sisa</th><th className="px-5 py-3">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {sales.map((sale) => <tr key={sale.id}>
                    <td className="px-5 py-3">{customerName(sale.customerId)}</td>
                    <td className="px-5 py-3">{sale.saleNumber}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatIDR(sale.totalAmount - sale.paidAmount)}</td>
                    <td className="px-5 py-3"><Button variant="ghost" onClick={() => { setSelectedSale(sale); setAmount(String(sale.totalAmount - sale.paidAmount)); }}>Catat pembayaran</Button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
      {selectedSale && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-5 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold">Catat pembayaran</h2>
          <p className="text-sm text-slate-500">Sisa: {formatIDR(selectedSale.totalAmount - selectedSale.paidAmount)}</p>
          <input aria-label="Jumlah pembayaran" type="number" min="1" max={selectedSale.totalAmount - selectedSale.paidAmount} value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setSelectedSale(null)}>Batal</Button><Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button></div>
        </form>
      </div>}
    </div>
  );
}
