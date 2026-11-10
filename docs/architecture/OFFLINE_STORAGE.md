# OFFLINE STORAGE
## UMKM Manager

**Version:** 1.0  
**Status:** Draft – Proposed Specification  
**Storage Architecture:** Local-First  
**Primary Database:** IndexedDB  
**Database Wrapper:** Dexie.js (proposed)  
**Offline Technology:** PWA + Service Worker

---

# 1. Tujuan

Dokumen ini mengatur penyimpanan lokal dan perilaku offline UMKM Manager V1.

Tujuan utamanya:

1. Aplikasi dapat berfungsi tanpa internet.
2. Data usaha disimpan pada perangkat pengguna.
3. Data tetap tersedia setelah aplikasi ditutup dan dibuka kembali.
4. Transaksi tidak bergantung pada server.
5. Aplikasi dapat mendeteksi masalah penyimpanan.
6. Pengguna mendapat peringatan ketika data berisiko.
7. Data dapat dipindahkan melalui backup dan restore manual.

# 2. Prinsip Penyimpanan

## 2.1 Local-First

IndexedDB menjadi sumber penyimpanan utama seluruh data usaha.

Tidak ada data transaksi inti yang harus dikirim ke cloud.

## 2.2 Offline-First

Operasi inti tidak boleh membutuhkan koneksi internet.

Contoh:
- Membuat produk.
- Mencatat penjualan.
- Mencatat pembayaran.
- Mengelola piutang.
- Mengelola utang.
- Mengubah stok.
- Melihat laporan.
- Membuat PDF nota.
- Membuat backup.

## 2.3 Persistent Data

Data harus tetap tersedia setelah:
- Browser ditutup.
- Tab ditutup.
- Komputer restart.
- Aplikasi dibuka kembali.
- Internet terputus.

Ketahanan tersebut berlaku selama data browser dan profil pengguna tidak dihapus atau rusak.

## 2.4 No Silent Data Loss

Jika penyimpanan gagal, aplikasi tidak boleh berpura-pura bahwa transaksi berhasil.

Pengguna harus menerima status yang jelas.

---

# 3. Storage Architecture

Pembagian penyimpanan:

| Teknologi | Fungsi |
|---|---|
| IndexedDB | Database utama usaha |
| Cache Storage | Aset aplikasi |
| Service Worker | Pengelolaan cache offline |
| localStorage | Preferensi kecil yang tidak kritis |
| File System / Download | Backup dan ekspor yang dipilih pengguna |

Jangan menyimpan transaksi keuangan utama di localStorage.

Jangan menggunakan Cache Storage sebagai pengganti database.

---

# 4. IndexedDB Storage

IndexedDB menyimpan:
- Profil usaha.
- Produk.
- Pelanggan.
- Pemasok.
- Penjualan.
- Pesanan.
- Pembayaran.
- Piutang.
- Utang.
- Persediaan.
- Pengeluaran.
- Penggajian.
- Audit log.
- Pengaturan fitur.

## 4.1 Database Initialization

Saat pertama kali aplikasi dijalankan:

1. Periksa keberadaan database.
2. Jika belum ada, buat database baru.
3. Jalankan migration awal.
4. Buat konfigurasi default.
5. Buat profil usaha melalui onboarding.
6. Pastikan database dapat dibaca dan ditulis.
7. Tampilkan dashboard setelah proses berhasil.

Jika inisialisasi gagal, aplikasi tidak boleh menampilkan dashboard seolah database siap digunakan.

## 4.2 Database Versioning

Setiap perubahan skema harus memiliki versi.

Contoh:

```ts
db.version(1).stores({
  businesses: 'id',
  products: 'id, name, sku',
  customers: 'id, name, phone',
  sales: 'id, saleNumber, saleDate'
});
```

Migration harus:
- Dijalankan secara terurut.
- Mempertahankan data lama.
- Dapat diuji.
- Memiliki penanganan kegagalan.
- Tidak menghapus data pengguna secara diam-diam.

---

# 5. Persistent Storage Request

Browser dapat memberikan izin penyimpanan persisten melalui mekanisme yang tersedia.

Aplikasi dapat meminta persistent storage menggunakan:

```ts
const persistent = await navigator.storage.persist();
```

Aplikasi juga dapat memeriksa perkiraan penggunaan:

```ts
const estimate = await navigator.storage.estimate();

console.log({
  usage: estimate.usage,
  quota: estimate.quota
});
```

Aturan:
- Jangan menganggap permintaan persistent storage pasti diterima.
- Jangan menganggap quota browser selalu tersedia dalam jumlah tetap.
- Tampilkan status penyimpanan kepada pengguna.
- Tetap anjurkan backup meskipun persistent storage diberikan.

---

# 6. Storage Monitoring

Aplikasi harus menyediakan informasi status penyimpanan.

Informasi yang disarankan:
- Status database.
- Estimasi penggunaan penyimpanan.
- Estimasi kapasitas jika tersedia.
- Status persistent storage.
- Waktu backup terakhir jika diketahui.
- Status kesehatan database.

Jangan menampilkan kapasitas yang tidak dapat diverifikasi.

## 6.1 Storage Warning

Jika penggunaan mendekati batas yang tersedia, tampilkan peringatan.

Ambang awal yang diusulkan:
- Di bawah 70%: normal.
- 70–85%: peringatan.
- Di atas 85%: peringatan tinggi.

Ambang ini bersifat heuristik dan harus disesuaikan dengan kapasitas yang benar-benar dilaporkan browser.

## 6.2 Storage Full

Jika penyimpanan penuh:

1. Hentikan operasi tulis yang gagal.
2. Jangan tampilkan transaksi sebagai berhasil.
3. Pastikan transaksi database yang gagal tidak meninggalkan perubahan parsial.
4. Tampilkan pesan yang mudah dipahami.
5. Arahkan pengguna membuat backup atau membebaskan ruang perangkat.
6. Jangan menghapus transaksi lama secara otomatis.

---

# 7. Offline Application Cache

Service Worker mengelola aset aplikasi agar dapat dimuat tanpa internet.

Aset yang harus tersedia:
- HTML entry point.
- JavaScript bundle.
- CSS.
- Ikon aplikasi.
- Font lokal yang digunakan.
- Aset UI penting.

## 7.1 Cache Strategy

Strategi yang diusulkan:

| Resource | Strategi |
|---|---|
| App shell | Cache-first |
| Static assets | Cache-first |
| Versioned bundles | Cache-first |
| External optional resources | Network-first atau tidak digunakan |
| Business data | IndexedDB |

Aset aplikasi tidak boleh bergantung pada CDN eksternal untuk fungsi inti.

## 7.2 First Installation

Aplikasi membutuhkan koneksi pada saat pertama kali diakses jika belum ada aset yang tersimpan.

Setelah instalasi dan caching awal berhasil, fungsi offline harus tersedia.

Aplikasi harus memberi tahu pengguna jika proses instalasi offline belum selesai.

## 7.3 Cache Update

Saat versi aplikasi diperbarui:

1. Unduh cache versi baru.
2. Validasi aset.
3. Aktifkan versi baru secara aman.
4. Pertahankan database pengguna.
5. Jangan menghapus cache lama sebelum versi baru siap.

Pembaruan aplikasi tidak boleh merusak data transaksi.

---

# 8. Application Lifecycle

## 8.1 Browser Closed

Ketika browser ditutup:
- Data yang sudah berhasil disimpan tetap berada di IndexedDB.
- Tidak ada operasi yang boleh dianggap berhasil jika commit belum selesai.

## 8.2 Computer Restart

Setelah komputer dinyalakan:
- Aplikasi dapat dibuka kembali.
- Database tetap dapat diakses.
- Dashboard membaca data terbaru yang berhasil disimpan.

## 8.3 Unexpected Shutdown

Jika komputer mati saat transaksi berlangsung:
- Transaksi database harus bersifat atomik sesuai kemampuan IndexedDB.
- Operasi yang belum commit tidak boleh dianggap berhasil.
- Sistem harus dapat membaca keadaan database yang konsisten saat dibuka kembali.

## 8.4 Multiple Tabs

V1 sebaiknya mendukung penggunaan satu tab utama sebagai mode normal.

Jika aplikasi dibuka pada beberapa tab:
- Perubahan data harus tetap konsisten.
- Jangan mengandalkan state React sebagai sumber kebenaran.
- Gunakan mekanisme notifikasi perubahan lintas tab jika dibutuhkan.
- Konflik penulisan harus ditangani secara eksplisit.

---

# 9. Transaction Safety

Semua transaksi yang mengubah beberapa entitas terkait harus menggunakan transaksi database.

Contoh penjualan:

```text
BEGIN TRANSACTION
  Create sale
  Create sale items
  Create payment or receivable
  Create inventory movements
  Update stock summary
  Create financial records
COMMIT
```

Jika satu langkah gagal:

```text
ROLLBACK
```

Hasil yang diwajibkan:
- Tidak ada transaksi setengah jadi.
- Tidak ada saldo yang berubah sebagian.
- Tidak ada stok berkurang tanpa transaksi penjualan.
- Tidak ada pembayaran tanpa referensi yang valid.

Operation ID harus digunakan untuk mencegah pengiriman ulang perintah yang sama menghasilkan duplikasi.

---

# 10. Storage Error Handling

Jenis error yang harus ditangani:

| Error | Penanganan |
|---|---|
| QuotaExceededError | Hentikan operasi tulis dan beri peringatan |
| Database unavailable | Tampilkan status database gagal |
| Transaction aborted | Jangan tampilkan sukses |
| Migration failure | Pertahankan kondisi aman dan hentikan startup |
| Corrupt backup | Tolak restore |
| Unexpected error | Catat diagnostik tanpa membocorkan data |

Pesan pengguna harus sederhana.

Contoh:

"Data belum berhasil disimpan. Jangan tutup aplikasi. Periksa ruang penyimpanan dan coba kembali."

Jangan menyatakan transaksi tersimpan sebelum commit berhasil.

---

# 11. Data Integrity Monitoring

Aplikasi perlu menyediakan pemeriksaan integritas.

Pemeriksaan dapat mencakup:
- Referensi transaksi yang tidak valid.
- Invoice tanpa sumber penjualan yang benar.
- Pembayaran tanpa alokasi atau kategori yang sesuai.
- Piutang yang tidak dapat direkonsiliasi.
- Utang yang tidak dapat direkonsiliasi.
- Stok yang berbeda dari hasil inventory movements.
- Jurnal yang tidak seimbang jika double-entry dipilih.
- Duplikasi nomor transaksi.

Pemeriksaan tidak boleh otomatis mengubah data tanpa prosedur koreksi.

---

# 12. Backup Reminder

Aplikasi harus memberikan pengingat backup.

Pengingat dapat dipicu oleh:
- Belum pernah membuat backup.
- Backup terakhir sudah lama.
- Jumlah transaksi meningkat.
- Sebelum restore.
- Sebelum migration besar.

Pengingat tidak boleh menghalangi pekerjaan pengguna secara berlebihan.

Jadwal dan ambang pengingat dapat diatur melalui Settings.

---

# 13. Device and Browser Scope

Data lokal terikat pada profil browser dan perangkat tempat data disimpan.

Konsekuensinya:
- Browser lain tidak otomatis memiliki data yang sama.
- Perangkat lain tidak otomatis memiliki data yang sama.
- Menghapus data browser dapat menghilangkan database.
- Menggunakan mode incognito/private dapat menyebabkan data tidak bertahan seperti penggunaan normal.
- Mengganti profil browser dapat membuat data terlihat seperti hilang.

Aplikasi harus menjelaskan batasan tersebut pada onboarding dan pengaturan backup.

---

# 14. Offline PDF and Export

Pembuatan dokumen harus dapat dilakukan offline jika seluruh library dan aset pendukung tersedia lokal.

Fitur:
- Membuat nota PDF.
- Membuat laporan PDF.
- Ekspor CSV.
- Ekspor data JSON.

Berbagi melalui aplikasi eksternal seperti WhatsApp mungkin membutuhkan koneksi internet.

Kegagalan berbagi tidak boleh menghapus dokumen atau transaksi.

---

# 15. Offline Storage Security

Ketentuan:
- Tidak mengirim data transaksi ke layanan analitik eksternal.
- Tidak menggunakan cloud storage tanpa persetujuan.
- Tidak menyimpan password atau credential eksternal.
- Tidak mencatat detail keuangan pengguna dalam log yang tidak diperlukan.
- Tidak menghapus data karena modul dinonaktifkan.
- Menyediakan backup manual.
- Menjelaskan bahwa local storage bukan pengganti backup.

Jika enkripsi backup diterapkan, algoritma dan manajemen password harus dirancang terpisah. Jangan mengklaim database lokal terenkripsi jika implementasinya belum benar-benar menyediakan enkripsi.

---

# 16. Offline Testing

Test wajib:

| ID | Skenario | Expected Result |
|---|---|---|
| OFF-001 | Membuka aplikasi setelah cache awal | Aplikasi terbuka tanpa internet |
| OFF-002 | Membuat produk offline | Produk tersimpan |
| OFF-003 | Membuat penjualan offline | Transaksi tersimpan |
| OFF-004 | Menutup dan membuka browser | Data tetap tersedia |
| OFF-005 | Restart perangkat | Data tetap tersedia |
| OFF-006 | Storage quota terlampaui | Operasi gagal secara aman |
| OFF-007 | Database migration | Data lama tetap tersedia |
| OFF-008 | Update aplikasi | Data bisnis tidak hilang |
| OFF-009 | Membuka dua tab | Tidak terjadi inkonsistensi |
| OFF-010 | Internet terputus saat penggunaan | Operasi inti tetap berfungsi |
| OFF-011 | Penyimpanan gagal saat transaksi | Tidak ada transaksi parsial |
| OFF-012 | Restore backup offline | Pemulihan berhasil tanpa internet |

---

# 17. Offline Acceptance Criteria

Dokumen ini dianggap terpenuhi apabila:

1. Fungsi inti dapat digunakan tanpa internet setelah instalasi awal.
2. Data utama tersimpan di IndexedDB.
3. Data bertahan setelah aplikasi ditutup dan perangkat restart.
4. Kegagalan penyimpanan ditangani secara jelas.
5. Tidak ada transaksi yang diklaim berhasil sebelum commit.
6. Database migration aman.
7. Cache update tidak menghapus data bisnis.
8. Status penyimpanan dapat diperiksa.
9. Backup dan restore dapat berjalan offline.
10. Tidak ada ketergantungan eksternal untuk fungsi inti.

---

**Document Status:** Draft – Proposed Specification.  
**Implementation Status:** Not Authorized by This Document Alone.