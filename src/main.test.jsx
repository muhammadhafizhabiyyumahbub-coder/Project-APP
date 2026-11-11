import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from '../docs/design/app.jsx';
import ErrorBoundary from './ErrorBoundary';
import { listFeatures } from './storage/featuresRepository';
import { db, initializeDatabase } from './storage/database';

const createSaleMock = vi.fn();
const reloadProductsMock = vi.fn();

vi.mock('../src/financial/transactionEngine.js', () => ({
  createSale: (...args) => createSaleMock(...args),
  recordOperatingExpense: vi.fn(),
  recordCapitalContribution: vi.fn(),
  recordOwnerWithdrawal: vi.fn(),
}));

vi.mock('./hooks/useProducts.js', () => ({
  useProducts: () => ({
    products: [
      { id: 'P001', nama: 'Beras Pandan Wangi 5kg', sku: 'BR-001', stok: 12, harga: 75000, hpp: 60000, kategori: 'Sembako' },
      { id: 'P002', nama: 'Minyak Goreng Bimoli 2L', sku: 'OIL-002', stok: 8, harga: 36000, hpp: 32000, kategori: 'Sembako' },
      { id: 'P003', nama: 'Indomie Goreng (Dus)', sku: 'IND-003', stok: 20, harga: 110000, hpp: 98000, kategori: 'Makanan' },
      { id: 'P004', nama: 'Gula Pasir Gulaku 1kg', sku: 'GLR-004', stok: 0, harga: 15000, hpp: 13000, kategori: 'Sembako' },
      { id: 'P005', nama: 'Sabun Mandi Lifebuoy', sku: 'SBN-005', stok: 45, harga: 4500, hpp: 3000, kategori: 'Kebutuhan' },
    ],
    loading: false,
    error: null,
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    removeProduct: vi.fn(),
    reloadProducts: reloadProductsMock,
  }),
}));

beforeEach(() => {
  localStorage.clear();
  createSaleMock.mockReset();
  reloadProductsMock.mockReset();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await initializeDatabase();
  await db.features.clear();
});

describe('application shell', () => {
  it('renders dashboard navigation and Indonesian interface', () => {
    render(<App />);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getByText('Mode Offline')).toBeInTheDocument();
  });

  it('opens financial screen with journal summary', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /keuangan/i })[0]);

    expect(screen.getByRole('heading', { name: 'Keuangan' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Memuat jurnal...')).not.toBeInTheDocument());
    expect(screen.getByText('Belum ada jurnal terposting.')).toBeInTheDocument();
  });

  it('validates financial transaction amount', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /keuangan/i })[0]);

    await user.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Jumlah harus lebih dari 0.');
  });

  it('checks out cart once, clears cart, and reloads products', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    createSaleMock.mockResolvedValueOnce({ id: 'sale-1' });
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: /penjualan/i })[0]);
    const productButtons = screen.getAllByRole('button').filter(btn => btn.textContent.includes('Beras Pandan Wangi 5kg'));
    await user.click(productButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Bayar' }));
    await user.click(screen.getByRole('button', { name: 'Selesaikan' }));

    await waitFor(() => expect(createSaleMock).toHaveBeenCalledTimes(1));
    expect(reloadProductsMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Keranjang Kosong')).toBeInTheDocument();
    expect(alert).toHaveBeenCalled();
  });

  it('keeps cart and shows checkout error when sale fails', async () => {
    const user = userEvent.setup();
    createSaleMock.mockRejectedValueOnce(new Error('Stock tidak cukup'));
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: /penjualan/i })[0]);
    const productButtons = screen.getAllByRole('button').filter(btn => btn.textContent.includes('Beras Pandan Wangi 5kg'));
    await user.click(productButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Bayar' }));
    await user.click(screen.getByRole('button', { name: 'Selesaikan' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Stock tidak cukup');
    expect(screen.getByLabelText('Jumlah Beras Pandan Wangi 5kg')).toHaveValue(1);
  });

  it('opens product screen from navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);

    expect(screen.getByRole('heading', { name: 'Master Produk' })).toBeInTheDocument();
  });

  it('edits an existing product from the product screen', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const dialog = screen.getByRole('dialog');
    const nameInput = within(dialog).getByLabelText(/Nama Produk/);
    expect(within(dialog).getByRole('heading', { name: 'Edit Produk' })).toBeInTheDocument();
    expect(nameInput).toHaveValue('Beras Pandan Wangi 5kg');
    fireEvent.change(nameInput, { target: { value: 'Beras Premium' } });
    expect(nameInput).toHaveValue('Beras Premium');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan Produk' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('deletes an existing product after confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);

    await user.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Anda yakin ingin menghapus produk ini?');
  });

  it('closes product modal with Escape and restores focus', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);
    const addButton = screen.getByRole('button', { name: 'Tambah Produk' });
    addButton.focus();

    await user.click(addButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(addButton);
  });

  it('persists feature toggles', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'Tambah Fitur' })[0]);

    const toggle = screen.getAllByRole('button', { name: 'Nonaktifkan Modul' })[0];
    await user.click(toggle);

    await waitFor(async () => {
      const saved = await listFeatures();
      const target = saved.find(item => item.featureId === 'f-pesanan');
      expect(target?.enabled).toBe(false);
    });
  });

  it('reactivates a deactivated feature', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'Tambah Fitur' })[0]);

    const toggle = screen.getAllByRole('button', { name: 'Nonaktifkan Modul' })[0];
    await user.click(toggle);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Aktifkan Modul' }).length).toBeGreaterThan(0));

    await user.click(screen.getAllByRole('button', { name: 'Aktifkan Modul' })[0]);
    await waitFor(async () => {
      const saved = await listFeatures();
      const target = saved.find(item => item.featureId === 'f-pesanan');
      expect(target?.enabled).toBe(true);
    });
  });

  it('persists theme toggle', async () => {
    const user = userEvent.setup();
    render(<App />);
    const themeButton = screen.getAllByRole('button', { name: 'Ganti tema' })[0];

    await user.click(themeButton);

    expect(localStorage.getItem('umkm-theme')).toBe('dark');
  });

  it('renders an error recovery state when child throws', () => {
    const Broken = () => {
      throw new Error('test failure');
    };

    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Broken /></ErrorBoundary>);

    expect(screen.getByRole('alert')).toHaveTextContent('Aplikasi mengalami kendala');
    expect(screen.getByRole('button', { name: 'Muat ulang aplikasi' })).toBeInTheDocument();
  });

  it('shows notification action feedback', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: 'Buka notifikasi' })[0]);

    expect(alert).toHaveBeenCalledWith('Belum ada notifikasi baru.');
  });

  it('filters produk by category dinamis', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);

    const categorySelect = screen.getByDisplayValue('Semua Kategori');
    await user.selectOptions(categorySelect, 'Sembako');

    expect(screen.getByText('Beras Pandan Wangi 5kg')).toBeInTheDocument();
    expect(screen.getByText('Minyak Goreng Bimoli 2L')).toBeInTheDocument();
    expect(screen.queryByText('Indomie Goreng (Dus)')).not.toBeInTheDocument();
  });

  it('searches produk by SKU partial match', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);

    const searchInput = screen.getByPlaceholderText('Cari nama atau SKU...');
    await user.type(searchInput, 'BR');

    expect(screen.getByText('Beras Pandan Wangi 5kg')).toBeInTheDocument();
    expect(screen.queryByText('Minyak Goreng Bimoli 2L')).not.toBeInTheDocument();
    expect(screen.queryByText('Indomie Goreng (Dus)')).not.toBeInTheDocument();
  });

  it('searches produk by nama case-insensitive', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);

    const searchInput = screen.getByPlaceholderText('Cari nama atau SKU...');
    fireEvent.change(searchInput, { target: { value: 'bimoli' } });

    expect(searchInput).toHaveValue('bimoli');
    expect(screen.getByText('Minyak Goreng Bimoli 2L')).toBeInTheDocument();
    expect(screen.queryByText('Beras Pandan Wangi 5kg')).not.toBeInTheDocument();
  });
});
