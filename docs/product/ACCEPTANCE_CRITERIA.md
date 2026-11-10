# ACCEPTANCE CRITERIA
## UMKM Manager

**Versi:** 1.0  
**Status:** Draft – Proposed Acceptance Criteria  
**Produk:** UMKM Manager V1  
**Referensi:** PRD v2.0, FINANCIAL_LOGIC.md, BUSINESS_RULES.md, TRANSACTION_RULES.md

---

# 1. Tujuan

Dokumen ini menetapkan kriteria penerimaan untuk setiap modul dan tahapan pengembangan UMKM Manager.

Sebuah fitur hanya boleh dinyatakan selesai jika:
1. Fungsinya berjalan sesuai spesifikasi.
2. Data tersimpan dengan benar.
3. Tidak merusak fungsi lain.
4. Validasi input bekerja.
5. Kesalahan ditangani dengan benar.
6. Automated tests yang relevan berhasil.
7. Acceptance criteria yang ditetapkan terpenuhi.
8. Dokumentasi diperbarui jika diperlukan.

# 2. Standar Penerimaan Global

## AC-GLOBAL-01 — Offline

- Pengguna dapat menjalankan fungsi inti tanpa koneksi internet.
- Data transaksi baru dapat dibuat dan disimpan offline.
- Tidak ada ketergantungan pada server eksternal untuk fungsi inti.
- Aplikasi dapat dibuka kembali tanpa koneksi internet setelah tersedia pada perangkat.

## AC-GLOBAL-02 — Penyimpanan

- Data tetap tersedia setelah aplikasi ditutup dan dibuka kembali.
- Operasi penyimpanan tidak boleh meninggalkan data setengah tersimpan.
- Kegagalan penyimpanan harus menghasilkan pesan yang jelas.
- Data lama tidak boleh hilang ketika fitur baru ditambahkan.

## AC-GLOBAL-03 — Konsistensi

- Nilai transaksi sama di dashboard, detail transaksi, dan laporan.
- Satu transaksi tidak boleh dihitung dua kali.
- Pembayaran tidak boleh menghasilkan pendapatan penjualan tambahan.
- Perubahan stok harus sesuai transaksi sumbernya.
- Saldo kas harus sesuai seluruh pergerakan kas yang tercatat.

## AC-GLOBAL-04 — Pengalaman Pengguna

- Bahasa antarmuka menggunakan bahasa Indonesia.
- Nominal menggunakan format Rupiah.
- Pesan kesalahan mudah dipahami.
- Pengguna mendapat konfirmasi sebelum tindakan yang berisiko terhadap data.
- Tidak ada tombol utama yang tidak memiliki fungsi.
- Navigasi konsisten.

## AC-GLOBAL-05 — Data Historis

- Data historis tidak hilang ketika fitur dinonaktifkan.
- Transaksi yang sudah selesai tidak dapat dihapus melalui fungsi biasa.
- Koreksi memiliki histori.
- ID internal tetap stabil.

# 3. Pengaturan Awal

### AC-SETUP-01 — Membuat profil usaha

Diterima jika:
- Pengguna dapat memasukkan nama usaha.
- Pengguna dapat mengatur informasi usaha.
- Pengguna dapat melanjutkan tanpa registrasi.
- Informasi tetap tersimpan setelah aplikasi ditutup.

### AC-SETUP-02 — Saldo awal

Diterima jika:
- Pengguna dapat memulai dengan saldo Rp0.
- Pengguna dapat memasukkan modal atau saldo awal yang sebenarnya.
- Setoran modal tidak dihitung sebagai pendapatan.
- Saldo awal dapat dilihat dalam histori.

### AC-SETUP-03 — Alokasi dana

Diterima jika:
- Pengguna dapat membuat pos dana.
- Pengguna dapat mengalokasikan uang ke pos tersebut.
- Total alokasi tidak boleh melampaui dana yang tersedia menurut kebijakan sistem.
- Transfer antarpos tidak menghasilkan pendapatan atau beban.

# 4. Sistem Modular

### AC-MODULE-01 — Aktivasi fitur

Diterima jika:
- Pengguna dapat melihat katalog fitur.
- Pengguna dapat mengaktifkan fitur.
- Fitur aktif muncul pada navigasi yang sesuai.
- Fitur yang membutuhkan dependensi tidak dapat diaktifkan secara tidak konsisten.

### AC-MODULE-02 — Deaktivasi fitur

Diterima jika:
- Pengguna dapat menonaktifkan fitur.
- Data historis tetap tersimpan.
- Transaksi yang masih memiliki kewajiban tertunda tidak hilang.
- Pengguna mendapatkan peringatan ketika terdapat transaksi terbuka.
- Fitur dapat diaktifkan kembali tanpa kehilangan data.

# 5. Keuangan

### AC-FIN-01 — Pemasukan

Diterima jika:
- Pengguna dapat mencatat pemasukan.
- Pengguna dapat memilih kategori.
- Saldo kas berubah sesuai nominal.
- Pendapatan usaha dibedakan dari modal dan pembayaran piutang.

### AC-FIN-02 — Pengeluaran

Diterima jika:
- Pengguna dapat mencatat pengeluaran.
- Pengguna dapat memilih kategori dan akun sumber dana.
- Saldo kas berubah sesuai nominal.
- Pengeluaran pribadi pemilik tidak masuk beban operasional.

### AC-FIN-03 — Transfer internal

Diterima jika:
- Akun asal berkurang.
- Akun tujuan bertambah.
- Total kas tidak berubah kecuali terdapat biaya transfer.
- Transfer tidak muncul sebagai pendapatan atau beban.

### AC-FIN-04 — Dashboard

Diterima jika:
- Dashboard menampilkan saldo kas.
- Pendapatan, beban, HPP, laba, piutang, dan utang ditampilkan secara terpisah.
- Pengguna dapat memilih periode.
- Semua angka sesuai sumber transaksi.
- Data yang tidak lengkap diberi penanda.

# 6. Produk dan Inventaris

### AC-PROD-01 — Produk

Diterima jika:
- Pengguna dapat membuat produk.
- Pengguna dapat mengubah informasi produk.
- Pengguna dapat menonaktifkan produk.
- Histori produk yang pernah digunakan tetap tersedia.
- Perubahan harga tidak mengubah transaksi historis.

### AC-STOCK-01 — Barang masuk

Diterima jika:
- Penerimaan barang menambah stok sesuai jumlah aktual.
- Biaya perolehan tercatat.
- Riwayat barang masuk tersedia.
- Pembelian yang belum diterima tidak menambah stok tersedia.

### AC-STOCK-02 — Barang keluar

Diterima jika:
- Penjualan mengurangi stok sesuai jumlah yang diserahkan.
- Barang yang tidak dilacak stoknya tidak mengurangi stok otomatis.
- Stok tidak dikurangi dua kali.
- Sistem mengikuti kebijakan stok negatif yang disetujui.

### AC-STOCK-03 — Penyesuaian stok

Diterima jika:
- Pengguna dapat memasukkan hasil penghitungan fisik.
- Sistem menghitung selisih.
- Pengguna harus memberikan alasan.
- Histori penyesuaian tersedia.
- Penyesuaian berdampak ke nilai persediaan dan laporan secara benar.

# 7. Pelanggan

### AC-CUST-01 — Pencarian pelanggan

Diterima jika:
- Pengguna dapat mengetik nama pelanggan ketika membuat transaksi.
- Sistem menampilkan kandidat profil yang sesuai.
- Pengguna dapat memilih profil yang sudah ada.
- Sistem tidak menggabungkan nama yang mirip secara otomatis.

### AC-CUST-02 — Membuat pelanggan

Diterima jika:
- Pengguna dapat membuat pelanggan baru ketika transaksi berlangsung.
- Nama wajib diisi.
- Sistem menghasilkan Customer ID unik.
- Data pelanggan dapat dilihat dan diperbarui.

### AC-CUST-03 — Profil pelanggan

Diterima jika:
- Total pembelian benar.
- Total pembayaran benar.
- Saldo piutang benar.
- Riwayat nota tersedia.
- Riwayat pembayaran tersedia.
- Tagihan terlambat dapat diidentifikasi.

# 8. Pesanan

### AC-ORDER-01 — Membuat pesanan

Diterima jika:
- Pengguna dapat membuat pesanan.
- Pesanan memiliki nomor unik.
- Detail barang dan nilai pesanan tersimpan.
- Status awal sesuai aturan.
- Pesanan belum dianggap penjualan.

### AC-ORDER-02 — Perubahan status

Diterima jika:
- Perubahan status mengikuti alur yang diizinkan.
- Status sebelumnya dapat ditelusuri.
- Pembatalan memiliki alasan.
- Status pesanan terpisah dari status pembayaran.

### AC-ORDER-03 — Pengiriman sebagian

Diterima jika:
- Pengguna dapat mencatat jumlah yang diserahkan.
- Jumlah yang diserahkan tidak melebihi sisa pesanan.
- Hanya jumlah yang diserahkan yang dikonversi menjadi penjualan.
- Sisa pesanan tetap tersedia untuk diproses.

### AC-ORDER-04 — Konversi penjualan

Diterima jika:
- Penjualan merujuk pesanan asal.
- Konversi berulang tidak menghasilkan penjualan ganda.
- DP dialokasikan dengan benar.
- Stok berkurang sesuai jumlah aktual yang diserahkan.
- Sisa piutang dihitung dengan benar.

# 9. Penjualan

### AC-SALES-01 — Penjualan langsung

Diterima jika:
- Pengguna dapat membuat penjualan tanpa pesanan.
- Penjualan dapat dilakukan dengan atau tanpa profil pelanggan.
- Total transaksi dihitung benar.
- Transaksi memiliki nomor unik.

### AC-SALES-02 — Diskon

Diterima jika:
- Diskon per produk dapat dihitung.
- Diskon keseluruhan dapat dihitung sesuai aturan.
- Diskon tidak diterapkan dua kali.
- Nilai nota sesuai nilai transaksi.

### AC-SALES-03 — Penjualan kredit

Diterima jika:
- Pendapatan diakui sesuai kebijakan penyerahan.
- Piutang dibuat dengan benar.
- HPP dicatat sesuai metode yang disetujui.
- Stok berkurang sesuai barang yang diserahkan.

# 10. Pembayaran dan Piutang

### AC-PAY-01 — Pembayaran penuh

Diterima jika:
- Pembayaran sebesar tagihan menghasilkan status lunas.
- Saldo kas bertambah sesuai nominal.
- Piutang menjadi nol.
- Tidak ada pendapatan penjualan tambahan.

### AC-PAY-02 — Pembayaran sebagian

Diterima jika:
- Pembayaran dapat dicatat lebih dari satu kali.
- Saldo piutang berkurang sesuai jumlah pembayaran.
- Histori pembayaran lengkap.
- Status berubah menjadi dibayar sebagian.

### AC-PAY-03 — Pembayaran berlebih

Diterima jika:
- Sistem mendeteksi kelebihan.
- Sistem meminta pilihan penyelesaian.
- Kelebihan tidak hilang.
- Saldo kredit atau refund dapat ditelusuri.

### AC-AR-01 — Umur piutang

Diterima jika:
- Piutang dikelompokkan berdasarkan jatuh tempo.
- Periode umur piutang dihitung benar.
- Piutang lunas tidak ditampilkan sebagai belum dibayar.
- Perubahan pembayaran memperbarui laporan.

# 11. Nota Digital

### AC-INVOICE-01 — Membuat nota

Diterima jika:
- Nota berasal dari transaksi valid.
- Nomor nota unik.
- Detail barang dan total benar.
- Informasi pembayaran dan sisa tagihan benar.

### AC-INVOICE-02 — PDF

Diterima jika:
- PDF dapat dibuat offline.
- Tampilan dapat dibaca.
- Nilai sesuai transaksi.
- PDF tidak menciptakan transaksi baru.

### AC-INVOICE-03 — Koreksi

Diterima jika:
- Koreksi dapat ditelusuri.
- Nota sebelumnya tidak berubah diam-diam.
- Nilai transaksi mengikuti koreksi yang sah.

# 12. Pemasok dan Utang

### AC-SUP-01 — Profil pemasok

Diterima jika:
- Pengguna dapat membuat dan memperbarui profil pemasok.
- Supplier ID unik.
- Histori pemasok tetap tersedia.

### AC-AP-01 — Pembelian kredit

Diterima jika:
- Persediaan bertambah setelah barang diterima.
- Utang pemasok bertambah.
- Kas tidak berubah sebelum pembayaran.

### AC-AP-02 — Pembayaran utang

Diterima jika:
- Pembayaran mengurangi utang.
- Pembayaran mengurangi kas.
- Beban tidak dicatat dua kali.
- Histori pembayaran tersedia.

# 13. Retur dan Refund

### AC-RETURN-01 — Retur sebagian

Diterima jika:
- Pengguna dapat memilih produk dan kuantitas yang dikembalikan.
- Jumlah retur tidak melebihi jumlah yang masih dapat diretur.
- Nilai koreksi sesuai transaksi asal.
- Stok bertambah hanya jika barang layak dijual kembali.

### AC-REFUND-01 — Refund

Diterima jika:
- Refund terhubung dengan transaksi asal.
- Nilai refund tervalidasi.
- Kas berkurang sesuai uang yang benar-benar dikembalikan.
- Histori refund tersedia.
- Refund tidak menghasilkan beban ganda.

# 14. Karyawan dan Penggajian

### AC-EMP-01 — Data karyawan

Diterima jika:
- Pengguna dapat menambah karyawan.
- Data karyawan dapat diperbarui.
- Karyawan dapat dinonaktifkan.
- Histori penggajian tetap tersedia.

### AC-PAYROLL-01 — Penggajian

Diterima jika:
- Pengguna dapat membuat periode gaji.
- Sistem menghitung komponen gaji sesuai data.
- Pembayaran terhubung dengan periode gaji.
- Pembayaran ganda dicegah.

# 15. Laporan

### AC-REPORT-01 — Laporan keuangan

Diterima jika:
- Laporan pendapatan benar.
- Laporan beban benar.
- Laporan HPP benar.
- Laba kotor dan laba bersih dihitung sesuai aturan.
- Kas dipisahkan dari laba.
- Periode laporan dapat dipilih.

### AC-REPORT-02 — Laporan operasional

Diterima jika:
- Laporan penjualan sesuai transaksi.
- Laporan stok sesuai pergerakan stok.
- Laporan piutang sesuai saldo tagihan.
- Laporan utang sesuai saldo kewajiban.

### AC-REPORT-03 — Ekspor

Diterima jika:
- Data dapat diekspor dalam format yang ditetapkan.
- Hasil ekspor sesuai filter.
- Angka tidak berubah karena proses ekspor.
- File dapat dibuka oleh aplikasi yang mendukung formatnya.

# 16. Backup dan Restore

### AC-BACKUP-01 — Backup

Diterima jika:
- Backup dapat dibuat tanpa internet.
- File berisi data yang diperlukan.
- Backup memiliki versi format.
- Backup dapat diverifikasi.
- Kegagalan pembuatan backup ditampilkan kepada pengguna.

### AC-BACKUP-02 — Restore

Diterima jika:
- Sistem memeriksa validitas file sebelum restore.
- File yang rusak ditolak.
- Pengguna diberi peringatan sebelum data diganti.
- Kegagalan restore tidak merusak data sebelumnya.
- Data yang dipulihkan sesuai data backup.

### AC-BACKUP-03 — Konsistensi

Diterima jika:
- Jumlah transaksi sebelum dan sesudah restore sesuai.
- Saldo kas sesuai.
- Piutang dan utang sesuai.
- Persediaan sesuai.
- Histori transaksi tetap tersedia.

# 17. Keamanan dan Ketahanan Data

### AC-SEC-01 — Validasi

- Nominal tidak boleh negatif kecuali secara eksplisit diperbolehkan oleh jenis transaksi.
- Kuantitas harus sesuai tipe data dan satuan.
- Tanggal harus divalidasi.
- Referensi transaksi harus valid.
- ID duplikat harus ditolak.

### AC-SEC-02 — Ketahanan

- Penutupan aplikasi saat transaksi berlangsung tidak boleh merusak data.
- Error penyimpanan tidak boleh menghasilkan transaksi parsial.
- Sistem dapat dibuka kembali setelah kegagalan.
- Data pengguna tidak dikirim ke layanan eksternal.

# 18. Kriteria Rilis V1

Aplikasi hanya boleh dinyatakan layak rilis jika:

1. Semua fitur wajib PRD terpenuhi.
2. Semua acceptance criteria kritis terpenuhi.
3. Semua pengujian integritas transaksi berhasil.
4. Backup dan restore berhasil diuji.
5. Tidak terdapat bug kritis atau tinggi yang belum diselesaikan.
6. Build produksi berhasil.
7. Aplikasi dapat digunakan offline sesuai spesifikasi.
8. Tidak terdapat fitur inti yang hanya berupa tampilan dummy.
9. Dokumentasi penggunaan dan batasan aplikasi tersedia.
10. Seluruh keputusan bisnis kritis telah disetujui.

# 19. Klasifikasi Tingkat Kegagalan

**Critical**
- Kehilangan data.
- Transaksi keuangan ganda.
- Saldo salah secara material.
- Restore merusak data.
- Data pengguna bocor.

**High**
- Perhitungan HPP atau piutang salah.
- Stok berubah tidak konsisten.
- Fitur utama tidak dapat digunakan.
- Backup tidak dapat dipulihkan.

**Medium**
- Fungsi tambahan tidak berjalan.
- Filter atau laporan tertentu salah.
- Tampilan mengganggu alur kerja.

**Low**
- Kesalahan kosmetik.
- Perbedaan kecil tata letak.
- Teks atau label yang kurang tepat.

Critical dan High wajib diselesaikan sebelum rilis.

---

**Ketentuan:** Kriteria ini harus menjadi acuan automated testing dan manual testing. OpenCode tidak boleh menyatakan suatu fase selesai hanya berdasarkan keberhasilan build.
# ACCEPTANCE_CRITERIA.md

**UMKM Manager — Acceptance Criteria**  
Version: 1.1  
Status: Draft – Audit Revision  
Approval: Pending Product Owner Approval

## 1. Standar umum

- Aplikasi dapat digunakan tanpa login.
- Fungsi inti tersedia offline setelah instalasi awal.
- Data transaksi tersimpan lokal.
- Kegagalan penyimpanan tidak boleh ditampilkan sebagai keberhasilan.
- Transaksi kritis tidak boleh terduplikasi.
- Modul dinonaktifkan tanpa menghapus data.
- Data historis dapat ditelusuri.
- Semua keputusan yang masih menunggu persetujuan tidak dianggap sebagai kriteria final.

## 2. Setup dan profil usaha

- Pengguna dapat mengisi informasi usaha.
- Pengguna dapat memasukkan saldo awal aktual.
- Saldo awal tidak otomatis dianggap omzet.
- Informasi profil dapat diperbarui tanpa mengubah snapshot transaksi lama.

## 3. Modul

- Pengguna dapat mengaktifkan modul opsional.
- Pengguna dapat menonaktifkan modul.
- Penonaktifan tidak menghapus data.
- Dependensi modul divalidasi.
- Laporan memberi tahu pengguna jika data tidak lengkap akibat modul nonaktif.

## 4. Keuangan

- Modal tidak dihitung sebagai pendapatan.
- Pengambilan pemilik tidak dihitung sebagai biaya operasional.
- Transfer internal tidak mengubah pendapatan atau biaya.
- Pembayaran piutang tidak menciptakan penjualan baru.
- Pembayaran utang tidak menciptakan biaya kedua.
- Saldo kas tidak ditampilkan sebagai laba.
- Jurnal yang diposting seimbang jika model double-entry disetujui.
- Laporan keuangan dapat direkonsiliasi ke jurnal.

## 5. Produk dan persediaan

- Produk dapat dibuat, diperbarui, dan dinonaktifkan.
- Satuan dan konversi tervalidasi.
- Pergerakan stok memiliki referensi sumber.
- Stok dapat direkonsiliasi dari histori pergerakan.
- Penjualan tidak mengurangi stok dua kali.
- Retur tidak otomatis masuk stok siap jual jika barang rusak.
- HPP hanya ditampilkan sebagai nilai andal jika data biaya memadai.

Kriteria metode HPP dan stok negatif mengikuti keputusan Product Owner yang disetujui.

## 6. Pelanggan

- Pengguna dapat mengetik nama pelanggan langsung di transaksi.
- Sistem menyarankan profil yang cocok.
- Pengguna memilih profil secara eksplisit.
- Nama mirip tidak otomatis digabung.
- Profil pelanggan memiliki ID unik.
- Histori invoice tetap benar meskipun profil berubah.

## 7. Pesanan

- Pembuatan pesanan tidak otomatis mencatat penjualan.
- Status operasional terpisah dari status pembayaran.
- Pesanan batal tidak menjadi penjualan jika belum dipenuhi.
- Pemenuhan yang dicatat memiliki kuantitas dan tanggal.
- Pemenuhan sebagian mengikuti keputusan yang disetujui.

## 8. Penjualan

- Penjualan dapat dibuat sesuai kebijakan pelanggan wajib/tidak wajib yang disetujui.
- Total dihitung dari item, kuantitas, harga, diskon, dan biaya tambahan.
- Penjualan yang memenuhi syarat membuat dampak stok dan keuangan tepat satu kali.
- Penjualan tanpa data HPP tidak menampilkan laba yang menyesatkan.
- Transaksi memiliki nomor dan ID unik.

## 9. Pembayaran dan piutang

- Invoice dapat menerima pembayaran sebagian.
- Pembayaran memiliki ID unik.
- Pembayaran tidak membuat penjualan baru.
- Saldo piutang sama dengan nilai invoice dikurangi alokasi pembayaran dan koreksi sah.
- Pembayaran tidak dapat dialokasikan melebihi nilai yang tersedia.
- Status invoice diperbarui dengan benar.
- Kelebihan pembayaran mengikuti kebijakan yang disetujui.
- Pembayaran lintas invoice hanya aktif jika disetujui.

## 10. Invoice

- Nomor invoice unik.
- Snapshot item dan pelanggan tetap konsisten.
- Total, pembayaran, dan saldo dapat direkonsiliasi.
- PDF dapat dibuat offline.
- Invoice yang diposting tidak dapat dihapus langsung.
- Koreksi mempertahankan histori invoice asal.

## 11. Pembelian dan utang

- Penerimaan stok dibedakan dari pembayaran pemasok.
- Pembayaran utang mengurangi saldo utang.
- Pembayaran tidak menciptakan biaya kedua.
- Saldo utang dapat direkonsiliasi dengan pembelian dan alokasi pembayaran.

## 12. Retur dan refund

- Retur merujuk transaksi asal.
- Kuantitas retur tidak melebihi kuantitas bersih yang terjual.
- Nilai retur dihitung berdasarkan kebijakan transaksi asal.
- Barang rusak tidak otomatis menjadi stok siap jual.
- Refund tidak menciptakan penjualan baru.
- Koreksi memiliki audit trail.

## 13. Karyawan dan payroll

- Payroll memiliki rincian per karyawan.
- Kewajiban gaji dipisahkan dari pembayaran.
- Pembayaran gaji tidak menciptakan biaya ganda.
- Koreksi payroll tercatat.

## 14. Laporan

- Periode laporan jelas.
- Sumber data laporan dapat ditelusuri.
- Kas, laba, piutang, dan utang tidak dicampur.
- Laporan HPP menandai data biaya yang tidak lengkap.
- Data historis tetap tersedia meski modul dinonaktifkan.

## 15. Backup dan restore

- Backup berisi semua data penting dan metadata versi.
- Backup konsisten dengan satu snapshot.
- Checksum divalidasi.
- File rusak/versi tidak didukung ditolak dengan pesan yang jelas.
- Restore memiliki preview dan konfirmasi.
- Restore gagal tidak merusak database aktif.
- Restore lintas perangkat dapat diuji.
- Backup dan restore tersedia tanpa internet.

## 16. Data integrity dan reliability

- Retry tidak membuat transaksi duplikat.
- Posting gagal tidak meninggalkan data parsial.
- Jurnal seimbang.
- Saldo piutang, utang, dan stok dapat direkonsiliasi.
- Migrasi database mempertahankan data.
- Audit trail tersedia untuk koreksi.
- Uji restart dan pemulihan dilakukan.

## 17. V1 release gate

V1 tidak boleh dirilis sebelum:
1. Keputusan keuangan dan transaksi yang kritis disetujui.
2. Tidak ada bug Critical/High yang belum ditangani.
3. Build dan test wajib lulus.
4. Backup dan restore telah diuji.
5. Offline behavior telah diuji.
6. Transaksi penjualan, pembayaran, retur, dan pembelian telah direkonsiliasi.
7. Dokumentasi pengguna dan batasan laporan tersedia.
8. Product Owner menyetujui hasil QA.

## 18. Klasifikasi masalah

- **Critical:** kehilangan data, saldo salah material, duplikasi transaksi, atau kegagalan integritas.
- **High:** fungsi utama gagal atau hasil laporan/transaksi menyesatkan.
- **Medium:** fungsi sekunder gagal dengan workaround.
- **Low:** masalah kosmetik atau minor.

## 19. Batasan

Kriteria yang bergantung pada keputusan belum disetujui harus ditandai `PENDING_DECISION`, bukan dinyatakan lulus/gagal sebelum kebijakannya ditetapkan.