# BACKUP & RESTORE
## UMKM Manager

**Version:** 1.0  
**Status:** Draft – Proposed Specification  
**Storage:** Local-First  
**Backup Format:** Versioned JSON Package  
**Optional Compression:** ZIP

---

# 1. Tujuan

Dokumen ini mengatur mekanisme pencadangan dan pemulihan data UMKM Manager V1.

Tujuan:
1. Melindungi data dari kehilangan.
2. Memungkinkan pemindahan data antarperangkat.
3. Memastikan backup dapat divalidasi.
4. Mencegah restore file rusak.
5. Mencegah duplikasi transaksi akibat restore.
6. Menjaga konsistensi hubungan antardata.
7. Memungkinkan backup dan restore tanpa internet.

# 2. Prinsip Utama

## 2.1 Manual Backup

Pengguna mengendalikan kapan backup dilakukan dan di mana file disimpan.

Tidak ada upload otomatis ke cloud pada V1.

## 2.2 Complete Backup

Backup harus mencakup seluruh data yang diperlukan untuk memulihkan kondisi usaha.

## 2.3 Safe Restore

Restore tidak boleh langsung menimpa database sebelum validasi selesai.

## 2.4 Version Compatibility

Setiap backup harus mempunyai versi format dan versi skema database.

## 2.5 No Silent Data Loss

Jika restore gagal, database yang sedang digunakan tidak boleh rusak atau hilang.

---

# 3. Backup Scope

Backup harus mencakup:

| Kelompok | Data |
|---|---|
| Business | Profil usaha |
| Settings | Pengaturan aplikasi |
| Features | Status modul aktif |
| Finance | Akun dan catatan keuangan |
| Products | Produk dan satuan |
| Inventory | Pergerakan dan saldo stok |
| Customers | Pelanggan |
| Suppliers | Pemasok |
| Orders | Pesanan dan detail |
| Sales | Penjualan dan detail |
| Invoices | Nota dan tagihan |
| Payments | Pembayaran dan alokasi |
| Receivables | Piutang |
| Payables | Utang |
| Purchases | Pembelian |
| Returns | Retur dan refund |
| Expenses | Pengeluaran |
| Employees | Data karyawan |
| Payroll | Penggajian |
| Audit | Histori perubahan |
| Migration | Versi database |

Jika terdapat data lampiran atau file tambahan, backup harus menyertakannya atau secara jelas menyatakan bahwa data tersebut tidak termasuk.

## 3.1 Derived Data

Data ringkasan seperti:
- Saldo stok.
- Saldo pelanggan.
- Saldo pemasok.
- Ringkasan dashboard.

Dapat disimpan untuk mempercepat restore, tetapi harus dapat dihitung ulang dari sumber transaksi.

Jika hasil perhitungan ulang berbeda, sistem harus mendeteksi dan melaporkan perbedaannya.

---

# 4. Backup Format

Format yang diusulkan:

`umkm-manager-backup-YYYY-MM-DD-HHMMSS.zip`

Isi paket:

```text
umkm-manager-backup.zip
├── manifest.json
├── data/
│   ├── businesses.json
│   ├── settings.json
│   ├── products.json
│   ├── customers.json
│   ├── suppliers.json
│   ├── sales.json
│   ├── sale_items.json
│   ├── orders.json
│   ├── payments.json
│   ├── invoices.json
│   ├── inventory_movements.json
│   ├── financial_entries.json
│   ├── journal_entries.json
│   ├── journal_lines.json
│   └── other_tables.json
└── integrity.json
```

Struktur file aktual harus mengikuti database schema final.

Alternatif satu file JSON juga dapat disediakan jika ukuran data masih wajar.

# 5. Manifest

Setiap backup harus memiliki metadata.

Contoh:

```json
{
  "format": "UMKM_MANAGER_BACKUP",
  "formatVersion": 1,
  "applicationVersion": "1.0.0",
  "databaseSchemaVersion": 1,
  "createdAt": "2026-11-09T10:00:00.000Z",
  "business": {
    "id": "business-001",
    "name": "Toko Contoh"
  },
  "recordCounts": {
    "products": 20,
    "customers": 50,
    "sales": 100,
    "payments": 80
  }
}
```

Metadata harus menggambarkan isi backup yang sebenarnya.

Jangan mengandalkan nama file sebagai bukti validitas.

# 6. Integrity Validation

Sistem harus menghitung checksum untuk file atau bagian data yang dicadangkan.

Contoh pendekatan:

- SHA-256 untuk setiap file data.
- Manifest memuat daftar file dan checksum.
- Pemeriksaan dilakukan sebelum restore.

Contoh:

```json
{
  "algorithm": "SHA-256",
  "files": {
    "data/products.json": "checksum-value",
    "data/sales.json": "checksum-value",
    "data/payments.json": "checksum-value"
  }
}
```

Checksum hanya membuktikan integritas terhadap perubahan yang terjadi setelah checksum dibuat. Checksum bukan enkripsi dan bukan bukti bahwa data secara bisnis benar.

# 7. Backup Workflow

Alur backup:

```text
User selects Backup
        |
        v
Check database availability
        |
        v
Read consistent database snapshot
        |
        v
Validate data
        |
        v
Generate backup package
        |
        v
Calculate checksums
        |
        v
Generate manifest
        |
        v
Prepare downloadable file
        |
        v
User saves backup
        |
        v
Verify backup generation
```

Sistem harus:
- Membaca data dari snapshot yang konsisten.
- Tidak mengubah transaksi bisnis.
- Tidak menghapus data setelah backup.
- Memberikan informasi tanggal dan waktu backup.
- Menampilkan keberhasilan hanya setelah file berhasil dibuat.

Untuk dataset besar, proses backup dapat dilakukan secara bertahap dengan strategi konsistensi yang jelas. Jangan membaca tabel secara terpisah jika hal itu memungkinkan isi backup berasal dari keadaan database yang berbeda.

---

# 8. Backup User Interface

Menu yang direkomendasikan:

**Pengaturan → Backup & Restore**

Informasi yang ditampilkan:
- Backup terakhir.
- Estimasi jumlah data.
- Status database.
- Tombol Buat Backup.
- Tombol Pulihkan Backup.
- Panduan penyimpanan file.

Contoh pesan:

"Backup berhasil dibuat. Simpan file ini di tempat yang aman, misalnya flashdisk atau penyimpanan lain."

Pengguna harus diberi tahu bahwa menyimpan backup hanya di perangkat yang sama tidak cukup melindungi dari kerusakan perangkat.

---

# 9. Restore Workflow

Restore mempunyai risiko lebih tinggi daripada backup.

Alur:

```text
User selects backup file
        |
        v
Read file
        |
        v
Validate file format
        |
        v
Validate manifest
        |
        v
Check checksum
        |
        v
Check version compatibility
        |
        v
Validate data schema
        |
        v
Validate relationships
        |
        v
Show restore preview
        |
        v
Require confirmation
        |
        v
Protect current database
        |
        v
Restore into safe database state
        |
        v
Recalculate derived balances
        |
        v
Run integrity checks
        |
        v
Commit restored database
        |
        v
Show result
```

Restore tidak boleh dimulai sebelum semua validasi awal berhasil.

# 10. Restore Preview

Sebelum pengguna mengonfirmasi, tampilkan:

- Nama usaha pada backup.
- Tanggal backup.
- Versi backup.
- Jumlah produk.
- Jumlah pelanggan.
- Jumlah penjualan.
- Jumlah pesanan.
- Jumlah pembayaran.
- Jumlah transaksi keuangan.
- Perkiraan perbedaan dengan database saat ini jika memungkinkan.

Pengguna harus mengetahui apakah restore akan mengganti data saat ini.

# 11. Restore Protection

Sebelum mengganti database:

1. Validasi backup selesai.
2. Buat backup database saat ini jika memungkinkan.
3. Simpan kondisi database lama dengan aman.
4. Persiapkan database hasil restore secara terpisah.
5. Jalankan validasi akhir.
6. Aktifkan database baru hanya setelah seluruh pemeriksaan lulus.

Jika proses gagal:
- Pertahankan database lama.
- Jangan menghapus file backup pengguna.
- Berikan pesan kegagalan.
- Catat informasi diagnostik yang aman.

Jangan mengandalkan satu transaksi IndexedDB yang sangat panjang jika keterbatasan browser membuatnya tidak dapat diandalkan. Gunakan strategi staging dan penggantian database yang dapat dipulihkan.

# 12. Version Compatibility

Kemungkinan kondisi:

| Kondisi | Penanganan |
|---|---|
| Backup versi sama | Restore normal |
| Backup versi lebih lama | Jalankan migration yang didukung |
| Backup versi lebih baru | Tolak jika tidak kompatibel |
| Format tidak dikenal | Tolak |
| Schema tidak valid | Tolak |
| Checksum salah | Tolak |
| Data relasi rusak | Tolak atau masuk proses pemulihan terkontrol |

Migration backup harus diuji terlebih dahulu.

Jangan menghapus field yang tidak dikenal secara diam-diam ketika memulihkan backup.

# 13. Cross-Device Restore

V1 mendukung pemindahan data secara manual.

Contoh:

1. Pengguna membuat backup pada komputer A.
2. File disimpan ke flashdisk.
3. Pengguna membuka UMKM Manager pada komputer B.
4. Pengguna memilih Restore.
5. Sistem memvalidasi backup.
6. Pengguna mengonfirmasi.
7. Data dipulihkan ke komputer B.

Tidak ada sinkronisasi otomatis antara komputer A dan B.

Jika kedua perangkat digunakan secara bergantian, pengguna harus memahami bahwa perubahan pada satu perangkat tidak otomatis muncul pada perangkat lain. Gunakan satu salinan data aktif sebagai sumber utama untuk menghindari divergensi.

# 14. Backup Encryption

Enkripsi backup dapat menjadi fitur tambahan.

Jika diterapkan:
- Gunakan algoritma enkripsi modern yang tersedia dan teruji.
- Password tidak boleh disimpan dalam plaintext.
- Pengguna harus memahami bahwa kehilangan password dapat membuat backup tidak dapat dipulihkan.
- Validasi integritas harus dilakukan sebelum data dipulihkan.
- Jangan membuat algoritma enkripsi sendiri.

Enkripsi backup belum wajib untuk MVP, tetapi risiko data keuangan yang tidak terenkripsi harus dijelaskan.

# 15. Backup Retention

V1 tidak perlu menyimpan seluruh backup secara otomatis.

Pengguna mengelola file backup sendiri.

Rekomendasi:
- Backup berkala.
- Backup sebelum pembaruan besar.
- Backup sebelum restore.
- Simpan beberapa versi backup terakhir.
- Simpan salinan pada perangkat atau media lain.

Pengingat dapat disediakan tanpa membuat backup otomatis.

# 16. Failure Scenarios

| ID | Skenario | Expected Result |
|---|---|---|
| BK-001 | Backup berhasil | File valid dibuat |
| BK-002 | Database tidak tersedia | Backup ditolak |
| BK-003 | Ruang penyimpanan penuh | Proses gagal tanpa merusak data |
| BK-004 | File backup rusak | Restore ditolak |
| BK-005 | Checksum salah | Restore ditolak |
| BK-006 | Format tidak dikenal | Restore ditolak |
| BK-007 | Versi lebih baru | Restore ditolak jika tidak kompatibel |
| BK-008 | Restore gagal | Database lama tetap aman |
| BK-009 | Relasi transaksi rusak | Validasi gagal |
| BK-010 | Restore pada perangkat lain | Data dapat dipulihkan |
| BK-011 | Backup kosong/tidak lengkap | Validasi gagal |
| BK-012 | File terlalu besar | Penanganan batas ukuran yang jelas |
| BK-013 | Pengguna membatalkan restore | Database saat ini tidak berubah |

# 17. Acceptance Criteria

Fitur backup dan restore dianggap selesai jika:

1. Backup mencakup seluruh data penting.
2. Backup memiliki manifest dan versi.
3. Checksum dapat diverifikasi.
4. Restore memvalidasi struktur dan relasi.
5. Restore memiliki preview.
6. Pengguna harus mengonfirmasi penggantian data.
7. Restore gagal tidak merusak database sebelumnya.
8. Saldo dan stok dapat direkonstruksi.
9. Backup dapat dipulihkan tanpa internet.
10. Data dapat dipindahkan ke perangkat lain.
11. File backup dapat diuji melalui automated tests.
12. Tidak ada klaim backup berhasil sebelum file benar-benar tersedia.

---

**Document Status:** Draft – Proposed Specification.  
**Implementation Status:** Not Authorized by This Document Alone.