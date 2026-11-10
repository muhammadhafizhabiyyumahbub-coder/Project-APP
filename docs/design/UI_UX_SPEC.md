# UMKM Manager - UI/UX Specification

## 1. Product Design Overview
**UMKM Manager** dirancang sebagai aplikasi *offline-first* untuk pengelolaan bisnis berskala kecil hingga menengah (warung, toko kelontong, distributor, dll). Prioritas utama antarmuka adalah **kejelasan, kecepatan input, dan kepadatan informasi yang praktis** tanpa mengorbankan estetika modern (*SaaS quality*). Aplikasi harus bisa digunakan oleh awam tanpa latar belakang akuntansi.

## 2. User Persona & Kebutuhan
* **Bapak Budi (Pemilik Toko Kelontong):** Butuh melihat stok barang secara cepat dan mencatat penjualan kasir dengan sedikit klik.
* **Ibu Siti (Distributor/Reseller):** Butuh memantau status pesanan yang sedang diproses, utang/piutang pelanggan, dan melihat laporan laba-rugi sederhana.
* **Kebutuhan Utama:** Akses instan ke status kesehatan bisnis (Dashboard), pencatatan transaksi cepat, tidak bingung dengan istilah akuntansi rumit (seperti *Debit/Kredit*, diganti dengan *Masuk/Keluar*).

## 3. Information Architecture & Navigation
* **Global Header:** Pencarian global, Notifikasi, Toggle Tema (Terang/Gelap), Profil/Pengaturan.
* **Primary Sidebar (Dapat diciutkan/Collapsed):**
  * *Operasional:* Dashboard, Keuangan, Penjualan, Produk, Persediaan.
  * *CRM & Orders:* Pelanggan, Pesanan, Piutang.
  * *Analitik:* Laporan.
  * *Sistem:* Tambah Fitur, Pengaturan.

## 4. Halaman Frontend (Screen Behaviors)

### A. Dashboard (Prioritas Utama)
Berfungsi sebagai *360-degree view* kondisi bisnis.
* **Header Area:** Menyapa pengguna dan menampilkan filter periode (Hari ini, 7 Hari, Bulan Ini).
* **Financial Summary:** Kartu metrik utama (Kas, Rekening, Pendapatan, Pengeluaran, Laba, Piutang, Utang). **Aturan UX:** Saldo Kas/Rekening menggunakan warna netral (biru/slate), sedangkan Pendapatan/Laba menggunakan warna *Success* (Emerald).
* **Sales & Inventory Overview:** Grafik penjualan sederhana dan daftar peringatan stok (Menipis/Habis).
* **Orders & Receivables:** Status operasional pesanan dan pengingat jatuh tempo piutang.
* **Recent Activities:** Tabel ringkas transaksi terakhir.

### B. Penjualan (Kasir/POS)
* Layout *split-screen*: Kiri untuk mencari dan memilih produk, kanan untuk keranjang/nota transaksi.
* Fokus pada interaksi sentuh (tombol produk besar) dan *keyboard-friendly* untuk pencarian.

### C. Produk & Persediaan
* Tabel *master data* padat informasi. Dilengkapi *inline search* dan filter kategori.
* Terdapat *badge* peringatan warna kuning/merah untuk stok yang berada di bawah batas minimum.

### D. Tambah Fitur (Module Catalog)
* Menampilkan daftar kartu modul (contoh: Modul Piutang, Modul Pesanan).
* Interaksi: Toggle Aktif/Nonaktif. Menonaktifkan modul disisipi *micro-copy* (teks kecil) yang menegaskan data lama tidak akan terhapus.

### E. Halaman Lainnya (Keuangan, Pelanggan, Pesanan, Laporan, Pengaturan)
* Berbagi *layout* standar: *Page Header* (Judul, Deskripsi, Tombol Aksi Utama di kanan), disusul dengan *Filter/Search bar*, dan diakhiri dengan *Data Table* atau *List View*.

## 5. Interaction & Feedback States
* **Empty States:** Ditampilkan secara visual (ikon abu-abu, teks ramah, dan tombol aksi utama) jika tabel kosong.
* **Hover States:** Baris tabel dan tombol berubah warna latar secara halus untuk menandakan area interaktif.
* **Loading States (Simulasi):** Penggunaan *skeleton loader* atau indikator *spinner* pada komponen spesifik.

## 6. Dark/Light Mode Behavior
* **Toggle:** Berada di ujung kanan atas (Ikon Matahari/Bulan).
* **Behavior:** Pilihan disimpan di `localStorage`. Tema secara menyeluruh mengubah warna latar (*background*), teks, garis batas (*borders*), dan bayangan (*shadows*).
* **Kontras:** Memastikan teks sekunder tetap terbaca di mode gelap (menggunakan palet `slate-400` di atas `slate-900`).

## 7. Responsive & Accessibility
* **Mobile (< 768px):** Sidebar disembunyikan dalam *drawer* (Hamburger menu). Kartu summary menjadi 1-2 kolom. Tabel menggunakan *horizontal scroll*.
* **Tablet (768px - 1024px):** Sidebar *collapsed* (hanya ikon).
* **Accessibility:** Dukungan navigasi tab dasar, kontras teks yang mematuhi standar WCAG, dan penggunaan tag HTML semantik.
UMKM Manager - UI/UX Specification (Revised)

1. Product Design Overview

Aplikasi manajemen bisnis offline-first untuk UMKM (warung, kelontong, dll). Desain menekankan kepadatan informasi yang rapi, pemisahan konsep keuangan yang jelas, dan kemudahan interaksi tanpa mengandalkan pengetahuan akuntansi.

2. Struktur Layout & Navigasi

App Shell: Terdiri dari Sidebar (Navigasi), Global Header (Pencarian & Toggle Tema), dan Content Area.

Navigasi Adaptif (Module-driven): Menu di sidebar bersifat dinamis. Menu "Pesanan" dan "Piutang & Utang" hanya muncul jika diaktifkan melalui menu Tambah Fitur.

Responsive Behavior:

Desktop (>1024px): Sidebar statis (bisa di-collapse).

Mobile (<1024px): Sidebar tersembunyi menjadi Drawer (Hamburger Menu) dengan backdrop blur.

3. Spesifikasi Layar Utama (Screens)

A. Dashboard (Pusat Ringkasan)

Filter Periode: Dropdown di header untuk memilih (Hari Ini, 7 Hari, Bulan Ini, Tahun Ini).

Hierarki Kartu Keuangan (Pemisahan Jelas):

Posisi Uang (Kas/Rekening): Warna netral, diletakkan berdampingan untuk merepresentasikan saldo riil.

Aktivitas (Pendapatan/Pengeluaran): Warna sukses (hijau) dan bahaya (merah).

Laba/Rugi: Memiliki latar gradien (highlight). Jika data HPP (Harga Pokok Penjualan) tidak lengkap, tidak memaksakan angka menyesatkan, melainkan menampilkan status peringatan ("Data HPP Belum Lengkap").

Kewajiban (Piutang/Utang): Dipisahkan di kartu kecil yang menegaskan status "belum dibayar".

Aktivitas Terbaru: Tabel transaksi campuran (Masuk/Keluar/Pembelian/Pembayaran Piutang). Pembayaran piutang secara spesifik dibedakan dari penjualan.

B. Penjualan / POS (Point of Sale)

Layout: Split-screen (Kiri: Pencarian Produk, Kanan: Nota Keranjang).

Interaksi Produk: Kartu produk bisa diklik untuk masuk keranjang. Disabled state aktif jika stok = 0.

Keranjang: Mendukung penambahan/pengurangan quantity (+ / -) dengan validasi batas stok, dan hapus item. Menghitung subtotal otomatis.

Checkout Flow: Klik "Bayar" membuka Modal Konfirmasi. Di dalamnya, kasir bisa memilih Metode Pembayaran (Tunai, Transfer, QRIS, Kredit/Piutang) dan menyimpan transaksi.

C. Master Produk

Interaksi Daftar: Tabel dengan search bar (berdasarkan Nama/SKU).

Tambah Produk (Modal Form): Berisi input Nama (Wajib), SKU, Kategori, HPP, Harga Jual (Wajib), dan Stok Awal. Disimpan secara lokal (mock data).

Empty State: Menggunakan desain seragam (Ikon bundar + Pesan) jika tabel kosong.

D. Tambah Fitur (Module System)

Perilaku Modul: Mengaktifkan/menonaktifkan modul akan langsung mengubah state global, yang berdampak pada muncul/hilangnya menu di Sidebar. Status ini harus dipertahankan secara persisten.

4. Interaction & Feedback States

Hover & Focus: Seluruh button dan input wajib memiliki state :hover (perubahan kecerahan) dan :focus-visible (cincin biru/ring-blue-500) agar mematuhi standar accessibility.

Modals: Menggunakan overlay dengan backdrop-blur, dapat ditutup melalui tombol 'X' atau aksi tombol 'Batal'.

5. Dark/Light Mode

Toggle: Tombol transisi Matahari (Terang) dan Bulan (Gelap) di header persisten.

Persistensi: Pilihan disimpan di localStorage (umkm-theme). Saat aplikasi dimuat, mengecek preferensi tersimpan, dan jika kosong, mengecek system settings OS.