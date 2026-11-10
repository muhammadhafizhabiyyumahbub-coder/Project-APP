# TEST PLAN
## UMKM Manager

**Versi:** 1.0  
**Status:** Draft – Proposed Test Plan  
**Produk:** UMKM Manager V1  
**Referensi:** PRD v2.0, FINANCIAL_LOGIC.md, BUSINESS_RULES.md, TRANSACTION_RULES.md, ACCEPTANCE_CRITERIA.md

---

# 1. Tujuan Pengujian

Memastikan UMKM Manager:
- Berfungsi sesuai kebutuhan produk.
- Menghasilkan perhitungan keuangan yang benar.
- Menyimpan data secara konsisten.
- Tidak menggandakan transaksi.
- Mengelola persediaan dengan benar.
- Dapat digunakan tanpa koneksi internet.
- Dapat melakukan backup dan restore.
- Tidak kehilangan histori transaksi.
- Memiliki pengalaman penggunaan yang dapat dipahami pengguna UMKM.

# 2. Strategi Pengujian

Pengujian dibagi menjadi:

| Jenis | Tujuan |
|---|---|
| Unit Test | Menguji fungsi perhitungan dan validasi secara terpisah |
| Integration Test | Menguji hubungan antarmodul |
| Database Test | Menguji konsistensi penyimpanan |
| End-to-End Test | Menguji alur pengguna dari awal sampai selesai |
| Regression Test | Memastikan perubahan tidak merusak fitur lama |
| Offline Test | Memastikan fungsi berjalan tanpa internet |
| Backup/Restore Test | Memastikan data dapat dipulihkan |
| Manual Usability Test | Memeriksa kemudahan penggunaan |

# 3. Lingkungan Pengujian

Rekomendasi lingkungan:

- Browser Chromium berbasis desktop.
- Browser mobile atau emulator mobile.
- Aplikasi lokal/PWA.
- Database lokal pengujian yang terpisah dari data produksi.
- Tidak menggunakan data usaha nyata.
- Tidak membutuhkan layanan cloud.

Pengujian harus dapat diulang dengan dataset yang sama.

# 4. Dataset Pengujian Dasar

Gunakan data berikut untuk pengujian terkontrol.

## 4.1 Profil usaha

Nama usaha: Toko Contoh

Saldo awal:
- Kas tunai: Rp5.000.000.
- Bank: Rp5.000.000.
- Total kas: Rp10.000.000.

Modal awal: Rp10.000.000.

## 4.2 Produk

| Produk | Stok awal | Nilai stok | Harga jual |
|---|---:|---:|---:|
| Produk A | 10 | Rp500.000 | Rp80.000 |
| Produk B | 20 | Rp1.000.000 | Rp75.000 |
| Produk C | 5 | Rp250.000 | Rp100.000 |

Asumsi biaya rata-rata awal:
- Produk A: Rp50.000/unit.
- Produk B: Rp50.000/unit.
- Produk C: Rp50.000/unit.

## 4.3 Pelanggan

| ID | Nama | Batas kredit |
|---|---|---:|
| CUST-001 | Andi | Rp2.000.000 |
| CUST-002 | Budi | Rp1.000.000 |

## 4.4 Pemasok

| ID | Nama |
|---|---|
| SUP-001 | Supplier Utama |

Dataset ini harus di-reset sebelum setiap kelompok pengujian agar hasil dapat dibandingkan.

# 5. Pengujian Pengaturan Awal

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| SET-001 | Membuat profil usaha | Profil tersimpan |
| SET-002 | Mengisi saldo awal Rp0 | Saldo Rp0 |
| SET-003 | Mengisi modal Rp10 juta | Kas/modal bertambah Rp10 juta |
| SET-004 | Menutup dan membuka aplikasi | Data tetap ada |
| SET-005 | Memasukkan nominal negatif | Ditolak |
| SET-006 | Mengisi nama usaha kosong | Validasi ditampilkan |

# 6. Pengujian Keuangan

## 6.1 Modal

**FIN-001 — Setoran modal**

Input:
- Modal Rp10.000.000.

Hasil:
- Kas bertambah Rp10.000.000.
- Modal bertambah Rp10.000.000.
- Pendapatan tetap Rp0.
- Laba tetap Rp0.

**FIN-002 — Pengambilan pemilik**

Input:
- Pengambilan Rp500.000.

Hasil:
- Kas berkurang Rp500.000.
- Pengambilan pemilik bertambah Rp500.000.
- Beban operasional tetap.
- Laba tidak berubah.

## 6.2 Transfer

**FIN-003 — Transfer internal**

Input:
- Kas tunai ke bank Rp1.000.000.

Hasil:
- Kas tunai berkurang Rp1.000.000.
- Bank bertambah Rp1.000.000.
- Total kas tidak berubah.
- Pendapatan dan beban tidak berubah.

**FIN-004 — Transfer dengan biaya**

Input:
- Transfer Rp1.000.000.
- Biaya administrasi Rp2.500.

Hasil:
- Akun asal berkurang Rp1.002.500.
- Akun tujuan bertambah Rp1.000.000.
- Beban administrasi bertambah Rp2.500.

## 6.3 Beban

**FIN-005 — Pengeluaran listrik**

Input:
- Beban listrik Rp300.000.

Hasil:
- Kas berkurang Rp300.000.
- Beban listrik bertambah Rp300.000.

**FIN-006 — Pengeluaran pribadi**

Input:
- Pemilik mengambil Rp200.000.

Hasil:
- Kas berkurang Rp200.000.
- Pengambilan pemilik bertambah Rp200.000.
- Beban operasional tidak berubah.

# 7. Pengujian Penjualan dan HPP

## 7.1 Penjualan tunai

**SALES-001 — Penjualan satu produk**

Input:
- Produk A: 2 unit.
- Harga jual: Rp80.000/unit.
- Pembayaran tunai penuh.

Hasil:
- Pendapatan: Rp160.000.
- Kas bertambah Rp160.000.
- Stok Produk A menjadi 8 unit.
- HPP: Rp100.000.
- Laba kotor: Rp60.000.

## 7.2 Penjualan kredit

**SALES-002 — Penjualan kredit**

Input:
- Produk A: 4 unit.
- Harga jual: Rp80.000/unit.
- Pelanggan Andi.
- Belum ada pembayaran.

Hasil:
- Pendapatan: Rp320.000.
- Piutang: Rp320.000.
- Kas tidak berubah.
- Stok berkurang 4 unit.
- HPP: Rp200.000.
- Laba kotor: Rp120.000.

## 7.3 Diskon

**SALES-003 — Diskon transaksi**

Input:
- Produk A: 2 unit.
- Harga total: Rp160.000.
- Diskon: Rp10.000.

Hasil:
- Pendapatan bersih: Rp150.000.
- Diskon tidak dihitung dua kali.
- HPP tetap berdasarkan biaya perolehan.
- Laba kotor: Rp50.000.

## 7.4 Validasi stok

**SALES-004 — Stok tidak mencukupi**

Input:
- Stok Produk A: 2 unit.
- Penjualan: 3 unit.

Hasil:
- Mengikuti kebijakan stok negatif yang disetujui.
- Jika stok negatif dilarang, transaksi ditolak.
- Stok tidak boleh berubah sebagian.

## 7.5 Pencegahan duplikasi

**SALES-005 — Klik simpan dua kali**

Hasil:
- Hanya satu transaksi penjualan.
- Stok hanya berkurang sekali.
- Pembayaran hanya dicatat sekali.

# 8. Pengujian Pembayaran dan Piutang

**PAY-001 — Pembayaran sebagian**

Input:
- Piutang: Rp1.000.000.
- Pembayaran: Rp300.000.

Hasil:
- Kas bertambah Rp300.000.
- Piutang menjadi Rp700.000.
- Status PARTIALLY_PAID.
- Pendapatan tidak bertambah.

**PAY-002 — Pelunasan**

Input:
- Sisa piutang: Rp700.000.
- Pembayaran: Rp700.000.

Hasil:
- Piutang menjadi Rp0.
- Status PAID.
- Pendapatan tidak berubah.

**PAY-003 — Pembayaran berlebih**

Input:
- Tagihan: Rp1.000.000.
- Pembayaran: Rp1.100.000.

Hasil:
- Sistem mendeteksi kelebihan Rp100.000.
- Sistem meminta pilihan penyelesaian.
- Kelebihan tidak hilang.

**PAY-004 — Pembayaran ganda**

Input:
- Pembayaran dengan identitas operasi yang sama dikirim dua kali.

Hasil:
- Hanya satu pembayaran yang dicatat.

**PAY-005 — Jatuh tempo**

Input:
- Jatuh tempo sudah lewat.
- Tagihan belum lunas.

Hasil:
- Tagihan ditandai terlambat.
- Piutang tetap tercatat.
- Tidak otomatis dihapus atau menjadi beban.

# 9. Pengujian Pesanan dan DP

**ORDER-001 — Membuat pesanan**

Input:
- Produk A: 5 unit.
- Total Rp400.000.
- Belum dibayar.

Hasil:
- Pesanan tersimpan.
- Pendapatan Rp0.
- Piutang penjualan Rp0.
- Stok penjualan belum berkurang.

**ORDER-002 — Menerima DP**

Input:
- DP Rp100.000 sebelum barang diserahkan.

Hasil:
- Kas bertambah Rp100.000.
- Uang muka pelanggan bertambah Rp100.000.
- Pendapatan penjualan belum bertambah.

**ORDER-003 — Menyelesaikan pesanan**

Input:
- Nilai pesanan Rp400.000.
- DP Rp100.000.
- Barang diserahkan penuh.

Hasil:
- Pendapatan Rp400.000.
- DP dialokasikan Rp100.000.
- Piutang Rp300.000.
- Stok berkurang sesuai jumlah yang diserahkan.
- Penjualan hanya tercatat satu kali.

**ORDER-004 — Pengiriman sebagian**

Input:
- Pesanan 10 unit.
- Diserahkan 4 unit.

Hasil:
- Hanya 4 unit dikonversi menjadi penjualan.
- Stok berkurang 4 unit.
- Sisa 6 unit masih tercatat.
- Pesanan belum sepenuhnya selesai.

**ORDER-005 — Pesanan dibatalkan**

Input:
- Pesanan memiliki DP Rp100.000.
- Pesanan dibatalkan.

Hasil:
- Status pesanan dibatalkan.
- Pendapatan penjualan tidak otomatis muncul.
- DP diselesaikan berdasarkan kebijakan refund.
- Histori tetap tersimpan.

# 10. Pengujian Persediaan

**STOCK-001 — Pembelian tunai**

Input:
- 10 unit.
- Biaya Rp50.000/unit.
- Total Rp500.000.

Hasil:
- Stok bertambah 10 unit setelah barang diterima.
- Nilai persediaan bertambah Rp500.000.
- Kas berkurang Rp500.000.
- HPP belum bertambah.

**STOCK-002 — Pembelian kredit**

Input:
- 10 unit.
- Total Rp500.000.
- Pembayaran belum dilakukan.

Hasil:
- Stok bertambah setelah penerimaan.
- Utang bertambah Rp500.000.
- Kas tidak berubah.
- HPP belum bertambah.

**STOCK-003 — Metode rata-rata tertimbang**

Input:
- Stok awal 10 unit, nilai Rp500.000.
- Pembelian 10 unit, nilai Rp600.000.

Hasil:
- Stok 20 unit.
- Nilai Rp1.100.000.
- Biaya rata-rata Rp55.000/unit.

**STOCK-004 — Penjualan setelah pembelian**

Input:
- Penjualan 5 unit.
- Biaya rata-rata Rp55.000.

Hasil:
- HPP Rp275.000.
- Stok tersisa 15 unit.
- Nilai persediaan tersisa Rp825.000.

# 11. Pengujian Retur dan Refund

**RETURN-001 — Retur sebagian**

Input:
- Penjualan 5 unit.
- Retur 2 unit.
- Kedua barang layak dijual kembali.

Hasil:
- Pendapatan dikoreksi sebesar nilai 2 unit sesuai transaksi asal.
- Stok bertambah 2 unit.
- HPP dikoreksi sesuai biaya persediaan yang relevan.
- Histori retur tersimpan.

**RETURN-002 — Barang rusak**

Input:
- Retur 1 unit.
- Barang rusak.

Hasil:
- Barang tidak otomatis masuk stok layak jual.
- Sistem menyimpan kondisi barang.
- Penyesuaian nilai persediaan mengikuti kebijakan yang disetujui.

**REFUND-001 — Pengembalian uang**

Input:
- Refund Rp100.000.

Hasil:
- Kas berkurang Rp100.000.
- Refund terhubung ke transaksi asal.
- Tidak ada beban ganda.

**RETURN-003 — Retur melebihi jumlah**

Input:
- Jumlah terjual 5.
- Jumlah yang sudah diretur 3.
- Permintaan retur tambahan 3.

Hasil:
- Sistem menolak karena jumlah kumulatif retur melebihi jumlah terjual.

# 12. Pengujian Pemasok dan Utang

**AP-001 — Pembelian kredit**

Hasil:
- Persediaan bertambah.
- Utang bertambah.
- Kas tidak berubah.

**AP-002 — Pembayaran sebagian**

Input:
- Utang Rp1.000.000.
- Pembayaran Rp400.000.

Hasil:
- Kas berkurang Rp400.000.
- Utang menjadi Rp600.000.

**AP-003 — Pelunasan utang**

Input:
- Pembayaran Rp600.000.

Hasil:
- Utang menjadi Rp0.
- Tidak ada beban pembelian tambahan.

# 13. Pengujian Modul Pelanggan

**CUST-001 — Pelanggan baru**

Hasil:
- Profil pelanggan dibuat.
- ID unik dihasilkan.
- Profil dapat digunakan untuk transaksi.

**CUST-002 — Nama mirip**

Input:
- Andi.
- Andi Saputra.

Hasil:
- Sistem menampilkan kandidat.
- Tidak menggabungkan profil otomatis.

**CUST-003 — Penjualan tanpa pelanggan**

Hasil:
- Transaksi tetap dapat dibuat.
- Laporan penjualan tetap benar.

# 14. Pengujian Nota Digital

**INV-001 — Membuat PDF**

Hasil:
- PDF dibuat tanpa internet.
- Total sesuai transaksi.
- Pembayaran dan sisa tagihan benar.

**INV-002 — Membuat PDF berulang kali**

Hasil:
- Tidak membuat transaksi baru.
- Nomor nota tetap sama.

**INV-003 — Koreksi nota**

Hasil:
- Histori koreksi tersedia.
- Nilai lama dapat ditelusuri.

# 15. Pengujian Karyawan dan Penggajian

**PAYROLL-001 — Membuat penggajian**

Input:
- Gaji Rp2.000.000.

Hasil:
- Kewajiban gaji atau beban gaji tercatat sesuai kebijakan.
- Periode penggajian tersimpan.

**PAYROLL-002 — Membayar gaji**

Hasil:
- Kas berkurang sesuai nominal.
- Kewajiban gaji berkurang jika sebelumnya sudah diakui.
- Beban tidak dihitung dua kali.

**PAYROLL-003 — Pembayaran ganda**

Hasil:
- Sistem menolak pembayaran yang sama secara tidak sengaja.

# 16. Pengujian Laporan

**REPORT-001 — Laporan laba kotor**

Input:
- Pendapatan bersih Rp1.000.000.
- HPP Rp700.000.

Hasil:
- Laba kotor Rp300.000.

**REPORT-002 — Laporan laba bersih**

Input:
- Laba kotor Rp300.000.
- Beban operasional Rp100.000.

Hasil:
- Laba bersih Rp200.000.

**REPORT-003 — Kas dan laba**

Input:
- Modal Rp10.000.000.
- Tidak ada penjualan.

Hasil:
- Kas Rp10.000.000.
- Pendapatan Rp0.
- Laba Rp0.

**REPORT-004 — Pembayaran piutang**

Hasil:
- Kas bertambah.
- Piutang berkurang.
- Pendapatan tidak bertambah.

**REPORT-005 — Filter periode**

Hasil:
- Hanya transaksi dalam periode yang dipilih yang masuk laporan.
- Tanggal transaksi dibedakan dari tanggal pencatatan dan pembayaran.

# 17. Pengujian Offline

**OFF-001 — Transaksi offline**

- Matikan koneksi internet.
- Buat transaksi.
- Simpan.
- Tutup aplikasi.
- Buka kembali.

Hasil:
- Transaksi tetap tersedia.
- Tidak ada error akibat koneksi internet yang tidak tersedia.

**OFF-002 — Navigasi offline**

Hasil:
- Halaman inti dapat dibuka.
- Data lokal dapat dibaca.
- Fungsi inti tidak membutuhkan server eksternal.

**OFF-003 — Aset aplikasi**

Hasil:
- Aplikasi dapat memuat aset inti setelah tersedia secara lokal.
- Tidak ada ketergantungan pada font, script, atau library eksternal yang menghalangi penggunaan offline.

# 18. Pengujian Backup dan Restore

**BACKUP-001 — Membuat backup**

Hasil:
- File backup dibuat.
- Ukuran file lebih dari nol.
- Format dan versi backup valid.

**BACKUP-002 — Restore valid**

Hasil:
- Data berhasil dipulihkan.
- Jumlah transaksi sesuai.
- Saldo kas sesuai.
- Stok sesuai.
- Piutang dan utang sesuai.

**BACKUP-003 — File rusak**

Hasil:
- Restore ditolak.
- Database sebelumnya tetap utuh.

**BACKUP-004 — Versi backup tidak kompatibel**

Hasil:
- Sistem memberikan pesan yang jelas.
- Restore tidak dilanjutkan secara diam-diam.

**BACKUP-005 — Backup sebelum restore**

Hasil:
- Sistem memberikan opsi atau mewajibkan backup kondisi saat ini sebelum menimpa data.

# 19. Pengujian Kegagalan

**FAIL-001 — Penyimpanan gagal**

Hasil:
- Tidak ada transaksi parsial.
- Saldo tidak berubah sebagian.

**FAIL-002 — Aplikasi ditutup ketika transaksi berlangsung**

Hasil:
- Database tetap konsisten setelah dibuka kembali.

**FAIL-003 — Klik berulang**

Hasil:
- Tidak ada transaksi duplikat.

**FAIL-004 — Referensi transaksi tidak valid**

Hasil:
- Sistem menolak penyimpanan.

**FAIL-005 — Data wajib kosong**

Hasil:
- Validasi muncul.
- Data tidak disimpan secara tidak valid.

# 20. Regression Testing

Setiap perubahan kode harus menjalankan pengujian ulang terhadap:
- Keuangan.
- Penjualan.
- Pembayaran.
- Piutang.
- Stok.
- Nota.
- Backup dan restore.
- Modul yang memiliki dependensi dengan fitur yang berubah.

Perubahan database harus menjalankan migration tests dan pemeriksaan integritas data.

# 21. Pelaporan Hasil Pengujian

Setiap test harus mempunyai status:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT_RUN`

Laporan pengujian harus memuat:
- Test ID.
- Nama skenario.
- Data input.
- Hasil yang diharapkan.
- Hasil aktual.
- Status.
- Bukti atau log yang relevan.
- Bug ID jika gagal.

Test yang belum dijalankan tidak boleh dianggap lulus.

# 22. Kriteria Kelulusan

Fitur dapat diterima jika:
1. Seluruh test kritis lulus.
2. Seluruh test yang relevan pada fitur tersebut lulus.
3. Tidak ada kegagalan Critical atau High yang terbuka.
4. Tidak ada perubahan data yang tidak dapat dijelaskan.
5. Acceptance criteria terpenuhi.
6. Hasil pengujian dapat direproduksi.

Rilis V1 hanya dapat dilakukan jika seluruh pengujian wajib, integritas data, offline, dan backup/restore telah lulus.

---

**Catatan:** Dataset dan angka pada dokumen ini merupakan data simulasi untuk pengujian, bukan data usaha nyata. Hasil yang diharapkan mengikuti kebijakan keuangan dan metode persediaan yang sudah disetujui.
# TEST_PLAN.md

**UMKM Manager — Test Plan**  
Version: 1.1  
Status: Draft – Audit Revision  
Approval: Pending Product Owner Approval

## 1. Tujuan

Memastikan aplikasi bekerja offline, menjaga konsistensi transaksi, dan menghasilkan saldo/laporan yang dapat direkonsiliasi.

## 2. Lapisan pengujian

- Unit test: fungsi domain dan perhitungan.
- Integration test: use case dan repository.
- Database test: constraint, migrasi, atomicity.
- E2E test: alur UI.
- Offline test: penggunaan tanpa internet.
- Backup/restore test.
- Regression test.

## 3. Lingkungan

- Browser dan versi yang didukung.
- Perangkat target.
- Database test terisolasi.
- Data fixture yang dapat diulang.
- Mode offline yang dapat diverifikasi.
- Versi aplikasi dan skema dicatat pada laporan.

## 4. Dataset baseline

Siapkan data uji:
- Satu profil usaha.
- Kas awal.
- Akun bank.
- Produk dengan biaya perolehan.
- Pelanggan.
- Pemasok.
- Satu karyawan.

Semua nilai baseline harus ditentukan eksplisit pada fixture. Jangan mengandalkan data dari test sebelumnya.

## 5. Setup dan saldo awal

Uji:
1. Membuat profil usaha.
2. Mengisi saldo awal.
3. Menutup dan membuka ulang aplikasi.
4. Memastikan saldo tetap.
5. Memastikan saldo awal bukan pendapatan.
6. Memastikan profil tidak menggandakan data ketika setup diulang.

## 6. Keuangan

Uji:
- Modal pemilik.
- Pengambilan pemilik.
- Transfer internal.
- Biaya operasional.
- Pendapatan.
- Saldo kas vs laba.
- Jurnal seimbang jika double-entry disetujui.
- Reversal dan koreksi.

Expected result wajib berasal dari aturan yang telah disetujui.

## 7. Penjualan dan HPP

Fixture contoh:
- Kuantitas terjual: 10 unit.
- Harga jual: Rp100.000/unit.
- Biaya perolehan: Rp70.000/unit.

Jika semua barang dipenuhi dan biaya valid:
- Penjualan kotor sebelum diskon: Rp1.000.000.
- HPP: Rp700.000.
- Laba kotor sebelum biaya lain: Rp300.000.
- Stok berkurang 10 unit tepat satu kali.

Uji juga:
- Retry posting.
- Penjualan tanpa pelanggan jika disetujui.
- Penjualan tanpa modul persediaan.
- Diskon.
- Pembatalan sebelum posting.
- Koreksi setelah posting.
- Data biaya tidak tersedia.

## 8. Piutang dan pembayaran

Fixture:
- Invoice Rp1.001.000.
- Pembayaran awal Rp300.000.
- Saldo awal piutang Rp701.000.

Pembayaran lanjutan:
- Rp200.000.
- Rp501.000.

Expected result:
- Setelah pembayaran awal: piutang Rp701.000.
- Setelah pembayaran kedua: piutang Rp501.000.
- Setelah pembayaran ketiga: piutang Rp0.
- Total penjualan tetap Rp1.001.000.
- Tidak ada penjualan baru yang muncul dari pembayaran.

Uji:
- Pembayaran ganda.
- Retry.
- Pembayaran sebagian.
- Multi-metode.
- Kelebihan pembayaran.
- Pembayaran lintas invoice jika disetujui.
- Refund.
- Pembatalan pembayaran.
- Jatuh tempo dan aging.

## 9. Pesanan dan DP

Uji:
- Membuat pesanan tanpa penjualan.
- Menerima DP sebelum pemenuhan.
- Pemenuhan penuh.
- Pemenuhan sebagian jika disetujui.
- Pembatalan sebelum pemenuhan.
- Refund DP.
- Alokasi DP ke penjualan.
- Memastikan DP tidak menjadi pendapatan dua kali.

## 10. Persediaan

Uji:
- Pembelian dan penerimaan barang.
- Pengeluaran karena penjualan.
- Retur layak jual.
- Retur rusak.
- Penyesuaian stok.
- Konversi satuan.
- Kuantitas pecahan.
- Stok negatif sesuai keputusan.
- Rekonsiliasi stock balance dengan inventory movements.
- Perhitungan HPP sesuai metode yang disetujui.

## 11. Pembelian dan utang

Uji:
- Pembelian tunai.
- Pembelian kredit.
- Pembayaran cicilan.
- Pembayaran penuh.
- Pembayaran berlebih.
- Pembatalan/koreksi pembelian.
- Memastikan pembayaran utang tidak menciptakan biaya kedua.

## 12. Retur dan refund

Uji:
- Retur penuh.
- Retur sebagian jika disetujui.
- Retur barang rusak.
- Refund penuh/sebagian.
- Retur invoice yang telah dibayar.
- Retur invoice yang masih memiliki piutang.
- Reversal dan audit trail.

## 13. Pelanggan dan pemasok

Uji:
- Autocomplete nama.
- Memilih profil yang benar.
- Membuat profil baru.
- Nama mirip tidak otomatis digabung.
- Mengubah data profil.
- Memastikan snapshot transaksi lama tidak berubah.

## 14. Payroll

Uji:
- Membuat payroll.
- Membayar sebagian/seluruh gaji.
- Uang muka.
- Koreksi payroll.
- Memastikan biaya dan pembayaran tidak dihitung ganda.

## 15. Laporan

Uji:
- Laba rugi.
- Arus kas.
- Piutang.
- Utang.
- Persediaan.
- Rekonsiliasi saldo akun.
- Periode kosong.
- Data tidak lengkap.
- Modul nonaktif.

Laporan tidak boleh menyajikan angka pasti jika sumber data tidak memadai tanpa penjelasan.

## 16. Offline

Uji:
1. Instalasi awal.
2. Muat aplikasi dan aset.
3. Putus koneksi internet.
4. Buat transaksi.
5. Tutup browser.
6. Buka ulang.
7. Pastikan data tersimpan.
8. Uji storage quota/error.
9. Uji beberapa tab.
10. Pastikan fitur yang memerlukan layanan eksternal memberikan penjelasan.

## 17. Backup dan restore

Uji:
- Backup lengkap.
- Validasi manifest.
- Validasi checksum.
- File rusak.
- Versi backup tidak didukung.
- Restore sukses.
- Restore gagal.
- Rollback.
- Restore ke perangkat lain.
- Perbandingan jumlah record dan saldo sebelum/sesudah restore.

## 18. Failure dan idempotency

Uji kegagalan pada setiap tahap:
- Sebelum validasi.
- Setelah validasi.
- Saat menulis transaksi.
- Saat membuat jurnal.
- Saat memperbarui stok.
- Saat membuat alokasi pembayaran.
- Saat commit.
- Saat aplikasi ditutup mendadak.

Pastikan tidak ada transaksi setengah jadi atau efek ganda.

## 19. Release gate

- Semua test Critical lulus.
- Tidak ada bug Critical/High terbuka.
- Build lulus.
- Unit/integration/E2E wajib lulus.
- Backup/restore lulus.
- Offline test lulus.
- Rekonsiliasi transaksi lulus.
- Hasil dicatat di `TEST_REPORT_TEMPLATE.md`.

## 20. Keputusan tertunda

Jika hasil test bergantung pada aturan yang belum disetujui, tandai `BLOCKED – PENDING DECISION`. Jangan mengubah expected result untuk membuat test terlihat lulus.

## 21. Pelaporan

Setiap test report harus memuat versi aplikasi, versi skema, environment, jumlah passed/failed/skipped/blocked, bukti, dan kesimpulan. Dilarang mengklaim test lulus tanpa eksekusi dan bukti.