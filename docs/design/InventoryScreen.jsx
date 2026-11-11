import React from 'react';
import { useInventory } from '../../src/hooks/useInventory.js';
import { Card, Button, Badge, Icon } from './app.jsx';

function InventoryScreen() {
  const { movements, products, loading, error, reload, adjustStock } = useInventory();

  if (loading) return <div className="p-6 text-sm text-slate-500">Memuat data persediaan...</div>;
  if (error) return <div role="alert" className="p-4 rounded-lg bg-red-50 text-red-700">{error}</div>;

  const productMap = new Map(products.map(p => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Persediaan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Riwayat pergerakan stok dan penyesuaian</p>
        </div>
        <Button onClick={reload}>Muat Ulang</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Produk</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">{products.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Stok</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            {products.reduce((sum, p) => sum + (p.stok || 0), 0)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Nilai Stok</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {products.reduce((sum, p) => sum + ((p.stok || 0) * (p.hpp || 0)), 0).toLocaleString('id-ID')}
          </p>
        </Card>
      </div>

      {/* Recent Movements */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Riwayat Pergerakan</h2>
        {movements.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            Belum ada pergerakan stok
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Produk</th>
                  <th className="px-5 py-3 font-medium">Jenis</th>
                  <th className="px-5 py-3 font-medium text-right">Jumlah</th>
                  <th className="px-5 py-3 font-medium text-right">Harga</th>
                  <th className="px-5 py-3 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{m.transactionDate}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {productMap.get(m.productId)?.nama || m.productId}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={
                        m.type === 'STOCK_IN' ? 'success' :
                        m.type === 'STOCK_OUT' ? 'info' :
                        m.type === 'ADJUSTMENT' ? 'warning' : 'neutral'
                      }>
                        {m.type === 'STOCK_IN' ? 'Stok Masuk' :
                         m.type === 'STOCK_OUT' ? 'Stok Keluar' :
                         m.type === 'ADJUSTMENT' ? 'Penyesuaian' : m.type}
                      </Badge>
                    </td>
                    <td className={`px-5 py-3 text-right font-medium ${m.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">
                      {m.unitCost?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={m.reason}>
                      {m.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Penyesuaian Stok</h2>
        <StockAdjustmentForm products={products} onAdjust={adjustStock} />
      </div>
    </div>
  );
}

function StockAdjustmentForm({ products, onAdjust }) {
  const [productId, setProductId] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [notice, setNotice] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity) {
      setNotice('Semua field wajib diisi.');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty === 0) {
      setNotice('Jumlah harus integer dan tidak boleh 0.');
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      await onAdjust({ productId, quantity: qty, reason: reason || 'Penyesuaian stok' });
      setProductId('');
      setQuantity('');
      setReason('');
      setNotice('Penyesuaian berhasil disimpan.');
    } catch (e) {
      setNotice(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notice && (
        <div role="alert" className={`p-3 rounded-lg text-sm ${
          notice.includes('berhasil') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
          'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
        }`}>
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Produk</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Pilih produk</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.nama} (stok: {p.stok})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Contoh: +10 atau -5"
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">Gunakan nilai positif untuk tambah stok, negatif untuk kurang.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alasan</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Koreksi stok, rusak, atau perubahan harga"
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan Penyesuaian'}
      </Button>
    </form>
  );
}

export { InventoryScreen };
