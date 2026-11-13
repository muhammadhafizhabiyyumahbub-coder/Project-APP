# PANDUAN PENGGUNA — UMKM Manager V1

**Bahasa Indonesia**  
**Versi:** 1.0  
**Status:** Release Candidate — belum dirilis

## Cara Buka Aplikasi

1. Buka browser (Chrome / Edge / Firefox terbaru).
2. Pergi ke `http://127.0.0.1:4173/` (atau alamat yang diberikan oleh pengembang).
3. Aplikasi akan memuat dashboard utama.

## Instal & Offline

- Aplikasi ini **tidak memerlukan instalasi**; hanya perlu menjalankan perintah `npm run preview -- --host 127.0.0.1 --port 4173` di folder proyek.
- Aplikasi bekerja **offline-first**: setelah halaman dimuat sekali (online), bisa dipakai tanpa internet.
- **Untuk menguji offline:** jalankan preview, lalu putuskan koneksi internet (atau matikan Wi-Fi). Refresh halaman. Aplikasi tetap terbuka dari cache service worker dan data IndexedDB tetap tersimpan.
- **Catatan:** data offline disimpan di penyimpanan lokal browser (IndexedDB). Hapus data browser untuk menghapus seluruh data aplikasi.

## Menambah Produk

1. Klik tombol **“Tambah Fitur”** → pilih **“Produk”** dari menu sidebar.
2. Klik tombol **“Tambah Produk”** di halaman Produk.
3. Isi form:
   - **Nama Produk** — wajib diisi (contoh: "Beras QA").
   - **SKU (Opsional)** — contoh: "BT-001".
   - **Kategori** — contoh: "Sembako".
   - **Harga Beli / HPP** — uang integer rupiah (contoh: `50000`).
   - **Harga Jual** — uang integer rupiah (contoh: `70000`).
   - **Stok Awal** — jumlah integer (contoh: `5`).
4. Klik tombol **“Simpan Produk”**.
5. Produk baru akan muncul di daftar tabel.

## Mengubah Produk

1. Di daftar Produk, klik tombol **“Edit”** (tombol berbentuk pensil atau "Hapus" di baris produk).
2. Ubah nilai di form yang muncul.
3. Klik tombol **“Simpan”** untuk menyimpan perubahan.
4. Untuk menghapus: klik tombol **“Hapus”**, konfirmasi dialog, produk dihapus.

## Menambah Pelanggan

1. Klik tombol **“Tambah Fitur”** → pilih **“Pelanggan”** dari menu sidebar.
2. Klik tombol **“Tambah Pelanggan”**.
3. Isi form:
   - **Nama Pelanggan** — wajib diisi (contoh: "Ibu Siti").
   - **No. HP (Opsional)** — contoh: "081234567890".
   - **Email (Opsional)** — contoh: "ibu.siti@email.com".
   - **Alamat (Opsional)** — contoh: "Jl. Merdeka No. 123".
4. Klik tombol **“Simpan Pelanggan”**.
5. Pelanggan baru akan terdaftar dan terlihat di daftar.

## Penjualan Tunai (Cash Sale)

1. Dari menu utama, buka **“Penjualan (POS)”**.
2. Klik tombol **“Transaksi Baru”** (atau ikon plus).
3. Pilih **Pelanggan** (atau "Tanpa Pelanggan" jika tunai umum).
4. Tambah **Produk** yang dijual:
   - Pilih produk dari daftar atau cari SKU-nya.
   - Masukkan **Kuantitas** yang dijual.
5. Pilih **Metode Pembayaran**: **“Tunai”**.
6. Klik **“Lanjutkan”** atau **“Selesaikan Transaksi”**.
7. Transaksi akan:
   - Membuat jurnal akuntansi (Kas + Pendapatan + HPP + Persediaan).
   - Mengurangi stok produk sesuai kuantitas.
   - Menampilkan status **“COMPLETED”** jika pembayaran lengkap.
   - Tidak menambah pendapatan kedua kali (anti double-count).

## Penjualan Kredit (Credit Sale)

1. Langkah 1–4 sama dengan penjualan tunai.
2. Pilih **Metode Pembayaran**: **“Kredit”**.
3. Transaksi akan:
   - Membuat status penjualan **“UNPAID”**.
   - Membuat **Piutang** di akun 1100 (Piutang Pelanggan).
   - Tidak mengurangi saldo Kas.
4. Untuk **merekam pembayaran**:
   - Dari menu **“Piutang & Utang”**, lihat daftar tagihan.
   - Klik **“Rekam Pembayaran”**.
   - Masukkan **No. Pembayaran** dan **Jumlah Pembayaran**.
   - Setiap pembayaran akan:
     - Mengurangi saldo Piutang.
     - Meningkatkan saldo Kas.
     - Membuat entri jurnal terpisah (Kas debit / Piutang credit).
     - Jika total pembayaran >= total tagihan, status penjualan berubah menjadi **“COMPLETED”**.
     - **Anti double-count:** pembayaran tidak menambah pendapatan baru; pendapatan sudah tercatat saat penjualan pertama dibuat.

## Backup & Restore

### Membuat Backup

1. Dari halaman **“Pengaturan”** atau **“Laporan”**, cari opsi **“Export Backup”**.
2. Aplikasi akan membuat file berisi:
   - Manifest (format, versi skema, tanggal pembuatan).
   - Data semua tabel: usaha, produk, pelanggan, penjualan, pembayaran, jurnal, stok, dan sebagainya.
3. Simpan file backup tersebut di tempat aman (misalnya Google Drive, flashdisk, atau folder lokal). File backup **tidak membutuhkan internet** untuk dibuat.

### Memulihkan dari Backup (Restore)

1. Pastikan aplikasi ditutup/refresh dulu.
2. Pindahkan file backup ke komputer yang ingin dipulihkan data ke-nya.
3. Jalankan ulang perintah `npm run preview -- --host 127.0.0.1 --port 4173`.
4. Dari menu **“Pengaturan”** atau **“Laporan”**, pilih **“Import Backup”**.
5. Pilih file backup yang akan dipulihkan.
6. Aplikasi akan:
   - Memvalidasi format file (manifest, versi skema).
   - Menghapus data lama secara atomic (jika restore gagal, data lama tetap intact).
   - Memasukkan data dari backup ke IndexedDB.
   - Menampilkan pesan sukses atau gagal beserta alasan.

**Penting:** Jika file backup rusak (tidak valid), aplikasi akan menolak restore dan menampilkan pesan "File yang rusak ditolak". Data sebelumnya tidak akan berubah.

## Banner Multi-Tab & Tombol "Ambil alih kendali"

- Jika Anda membuka aplikasi di **dua tab browser** yang berbeda:
  - Tab yang pertama (yang mendapatkan kendali) bisa mengubah data (tambah/edit/hapus produk, pelanggan, transaksi).
  - Tab yang kedua akan menampilkan banner di bagian atas: **"Tab ini mode baca saja"**.
  - Di bawah banner ada tombol **“Ambil alih kendali”**.
- **Klik "Ambil alih kendali"** di tab kedua untuk mengambil hak menulis data. Tab pertama akan secara otomatis menjadi read-only hingga di-reload atau diambil alih lagi.
- Fungsi ini mencegah konflik data ketika dua orang (atau dua jendela) secara bersamaan mencoba mengubah data yang sama.

## Warning Kuota Penyimpanan

- Jika penyimpanan browser hampir penuh (≧ 80%):
  - Akan muncul banner peringatan di bagian atas halaman: **"Kapasitas Penyimpanan Hampir Penuh"**.
  - Teks berisi persentase penggunaan saat ini (misalnya: "Penyimpanan browser terpakai 82.5%").
  - Terdapat tombol **“Bersihkan cache aplikasi"**.
- **Tombol "Bersihkan cache aplikasi" hanya menghapus cache service worker (file aset JS/CSS), **bukan** data bisnis (produk, pelanggan, transaksi) yang tersimpan di IndexedDB.
- Jika ingin menghapus semua data aplikasi, hapus data browsing di setting browser (clear site data).

## Batasan V1 (Penting Dibaca)

1. Aplikasi ini **hanya untuk satu pengguna** di satu perangkat; tidak ada fitur multi-user atau autentikasi.
2. Data disimpan di penyimpanan lokal browser (IndexedDB); tidak ada server belakang yang menyinkronkan data.
3. Fitur berikut **belum tersedia** (tergantung keputusan bisnis mendatang — DEC-005/006/008/009/010):
   - Pengelolaan utang & piutang lengkap (payables).
   - Budgets & anggaran.
   - Aset usaha.
   - Payroll / penggajian karyawan.
   - Kategori transaksi kustom.
4. Aplikasi belum memiliki **Content Security Policy (CSP)**; jangan mengklik link atau men-download file dari sumber yang tidak dipercaya saat menggunakan aplikasi.
5. Backup hanya berisi data lokal; tidak ada fitur restore lintas perangkat tanpa manually menyalin file backup.
6. Nominal uang selalu integer Rupiah; tidak ada desimal (misalnya: `75000`, bukan `75000,50`).
7. Setiap transaksi (jualan + stok + jurnal) dilakukan atomik dalam satu operasi database; penghapusan atau kegagalan akan rollback total.

## Bantuan

Jika mengalami kendala:
- Muat ulang halaman (`F5` atau tombol refresh).
- Jika masih error, **muat ulang aplikasi** menggunakan tombol di bagian bawah halaman "Aplikasi mengalami kendala → Muat ulang aplikasi".
- Untuk kendala penyimpanan: bersihkan cache browser atau pindai ruang penyimpanan.
- Untuk pertanyaan fitur yang belum ada: lihat keputusan bisnis DEC-005/006/008/009/010 atau tunggu rilis V2.

---

**Dokumen ini dibuat untuk membantu pengguna memahami cara menggunakan aplikasi UMKM Manager V1.**