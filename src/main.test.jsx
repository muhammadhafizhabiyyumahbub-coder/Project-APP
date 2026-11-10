import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from '../docs/design/app.jsx';
import ErrorBoundary from './ErrorBoundary';

vi.mock('./hooks/useProducts.js', () => ({
  useProducts: () => ({
    products: [{ id: 'P001', nama: 'Beras Pandan Wangi 5kg', sku: 'BR-001', stok: 12, harga: 75000, hpp: 60000 }],
    loading: false,
    error: null,
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    removeProduct: vi.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
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
    expect(screen.getByText('Belum ada jurnal terposting.')).toBeInTheDocument();
  });

  it('validates financial transaction amount', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /keuangan/i })[0]);

    await user.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Jumlah harus lebih dari 0.');
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

    await user.click(screen.getByRole('button', { name: 'Hapus' }));

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

    expect(JSON.parse(localStorage.getItem('umkm-features'))[0].aktif).toBe(false);
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
});
