# BUSINESS RULES
## UMKM Manager

**Versi:** 1.0  
**Status:** Draft – Proposed Business Rules  
**Produk:** UMKM Manager V1  
**Referensi:** PRD v2.0 dan FINANCIAL_LOGIC.md  
**Tujuan:** Menetapkan perilaku aplikasi, aturan operasional setiap modul, serta hubungan antarfitur.

---

# 1. Prinsip Umum Produk

UMKM Manager harus mengikuti prinsip berikut:

1. Aplikasi ditujukan untuk berbagai jenis UMKM, bukan hanya satu jenis usaha.
2. Pengguna tidak diwajibkan memiliki pengetahuan akuntansi.
3. Pengguna dapat mencatat aktivitas usaha secara manual.
4. Sistem menghitung nilai transaksi secara otomatis berdasarkan data dan aturan yang sudah ditetapkan.
5. Fitur bersifat modular dan dapat diaktifkan sesuai kebutuhan usaha.
6. Menonaktifkan fitur tidak boleh menghapus data historis.
7. Data bisnis harus tetap dapat diakses tanpa koneksi internet.
8. Setiap transaksi harus memiliki histori dan hubungan dengan transaksi terkait.
9. Aplikasi tidak boleh membuat angka keuangan berdasarkan asumsi yang tidak memiliki sumber data.
10. Pengguna harus mendapat informasi yang jelas ketika suatu tindakan memengaruhi kas, stok, piutang, atau laporan.

# 2. Identitas dan Pengaturan Usaha

Pengguna dapat memasukkan informasi usaha secara manual.

Informasi yang dapat disimpan:
- Nama usaha.
- Jenis usaha.
- Alamat usaha.
- Nomor telepon.
- Logo.
- Mata uang.
- Zona waktu.
- Format tanggal.
- Informasi lain yang diperlukan untuk nota.

Aturan:
- Pengaturan usaha tidak memerlukan registrasi akun.
- Nama usaha dapat diubah.
- Perubahan identitas usaha tidak boleh mengubah histori transaksi.
- Format mata uang default adalah Rupiah (IDR).
- Format nominal ditampilkan dengan pemisah ribuan yang sesuai kebiasaan Indonesia.

# 3. Sistem Modular

## 3.1 Aktivasi fitur

Aplikasi menyediakan menu **Tambah Fitur**.

Pengguna dapat memilih modul yang ingin digunakan.

Contoh modul:
- Keuangan.
- Produk.
- Inventaris.
- Penjualan.
- Pelanggan.
- Pesanan.
- Nota digital.
- Piutang.
- Karyawan.
- Penggajian.
- Pemasok.
- Utang.
- Anggaran.
- Target tabungan.
- Aset usaha.
- Laporan lanjutan.

## 3.2 Penonaktifan fitur

Ketika fitur dinonaktifkan:
- Data historis tetap disimpan.
- Transaksi lama tetap dapat dilihat.
- Data tidak dihapus.
- Fitur tidak muncul pada navigasi utama.
- Hubungan data dengan modul lain tidak boleh rusak.
- Sistem harus mempertahankan informasi yang diperlukan oleh laporan.

Jika modul masih memiliki transaksi tertunda, misalnya piutang belum lunas atau pesanan belum selesai, sistem harus memberikan peringatan sebelum dinonaktifkan.

## 3.3 Ketergantungan modul

Beberapa modul membutuhkan modul lain.

Contoh:

| Modul | Ketergantungan |
|---|---|
| Nota digital | Penjualan atau pesanan |
| Piutang | Penjualan dan pelanggan |
| Penggajian | Karyawan dan keuangan |
| Inventaris | Produk |
| Utang | Pemasok dan keuangan |
| Laporan lanjutan | Data dari modul terkait |

Jika modul yang menjadi ketergantungan dinonaktifkan, sistem tidak boleh menghapus data atau menghentikan akses terhadap histori transaksi.

# 4. Sistem Data dan Identitas

Setiap data utama harus memiliki ID internal yang unik dan tidak berubah.

Contoh:
- Product ID.
- Customer ID.
- Supplier ID.
- Employee ID.
- Transaction ID.
- Invoice ID.
- Payment ID.

Aturan:
- Nama bukan identitas unik utama.
- Dua pelanggan boleh memiliki nama sama.
- Dua produk boleh memiliki nama mirip.
- Sistem tidak boleh menggabungkan dua profil secara otomatis.
- Penggabungan data, jika kelak didukung, harus melalui tindakan khusus dan mempertahankan histori.

Pengguna harus dapat mencari data berdasarkan nama, nomor, atau informasi relevan lainnya.

# 5. Modul Keuangan

## 5.1 Dashboard keuangan

Dashboard menampilkan informasi yang berasal dari transaksi sebenarnya.

Informasi yang dapat ditampilkan:
- Total kas.
- Saldo rekening.
- Pendapatan penjualan.
- Pengeluaran.
- HPP.
- Laba.
- Piutang.
- Utang.
- Ringkasan transaksi terbaru.

Aturan:
- Pengguna dapat memilih periode laporan.
- Angka harus berasal dari sumber data yang sama dengan laporan terkait.
- Saldo kas tidak boleh disamakan dengan laba.
- Nilai yang belum diketahui harus ditampilkan sebagai belum tersedia atau belum lengkap, bukan dibuat-buat.

## 5.2 Pencatatan pemasukan

Pemasukan dapat berasal dari:
- Penjualan tunai.
- Pembayaran piutang.
- Setoran modal.
- Pemasukan lain yang sah.
- Penerimaan lainnya yang dikategorikan pengguna.

Sistem wajib membedakan pendapatan usaha dengan sumber kas lainnya.

## 5.3 Pencatatan pengeluaran

Pengeluaran dapat berasal dari:
- Beban operasional.
- Pembelian persediaan.
- Pembelian aset.
- Pembayaran utang.
- Pengambilan pemilik.
- Pengeluaran lainnya.

Pengguna harus memilih kategori yang sesuai.

Sistem tidak boleh menganggap semua uang keluar sebagai beban yang mengurangi laba.

# 6. Modul Produk

Pengguna dapat membuat produk secara manual melalui menu Tambah Data.

Informasi produk:
- Nama produk.
- SKU atau kode produk, opsional.
- Kategori.
- Satuan.
- Harga jual.
- Harga pokok atau biaya perolehan.
- Deskripsi.
- Status aktif/nonaktif.

Aturan:
- Nama produk wajib diisi.
- Sistem tidak boleh membuat produk otomatis tanpa persetujuan pengguna.
- Produk yang sudah digunakan dalam transaksi tidak boleh dihapus secara permanen melalui fungsi biasa.
- Produk yang tidak lagi dijual dapat dinonaktifkan.
- Perubahan harga jual tidak boleh mengubah harga jual transaksi lama.
- Perubahan biaya perolehan tidak boleh mengubah histori HPP transaksi yang telah selesai.

# 7. Modul Inventaris

Inventaris mengelola jumlah dan nilai barang yang dimiliki usaha.

Informasi:
- Stok tersedia.
- Stok minimum.
- Riwayat barang masuk.
- Riwayat barang keluar.
- Penyesuaian stok.
- Nilai persediaan.

Aturan:
- Barang masuk dapat berasal dari pembelian atau penambahan stok yang sah.
- Barang keluar dapat berasal dari penjualan, penggunaan internal, kerusakan, kehilangan, atau penyesuaian.
- Penjualan produk otomatis mengurangi stok apabila pelacakan stok diaktifkan.
- Pengguna dapat melakukan koreksi stok manual dengan alasan.
- Penyesuaian stok harus memiliki histori.
- Sistem tidak boleh mengurangi stok dua kali untuk satu transaksi.

Jika stok tidak mencukupi, sistem harus menerapkan kebijakan stok negatif yang sudah disetujui pemilik produk.

# 8. Modul Pelanggan

Pelanggan tidak wajib dibuat melalui halaman khusus sebelum transaksi.

Ketika pengguna mencatat penjualan atau pesanan:

1. Pengguna mengetik nama pelanggan.
2. Sistem mencari profil pelanggan yang sudah ada.
3. Sistem menampilkan kandidat nama yang cocok.
4. Pengguna dapat memilih profil yang sudah ada.
5. Jika tidak ditemukan, pengguna dapat mengonfirmasi pembuatan pelanggan baru.
6. Sistem membuat Customer ID baru.

Informasi pelanggan:
- Nama.
- Nomor telepon.
- Alamat.
- Catatan.
- Batas kredit, opsional.

Halaman detail pelanggan menampilkan:
- Total pembelian.
- Total pembayaran.
- Saldo piutang.
- Jumlah nota.
- Riwayat pembelian.
- Riwayat pembayaran.
- Tagihan yang belum lunas.
- Tagihan yang sudah jatuh tempo.

Sistem tidak boleh menggabungkan profil pelanggan hanya berdasarkan kemiripan nama atau nomor telepon.

# 9. Modul Pesanan

Pesanan digunakan untuk mencatat permintaan barang atau jasa dari pelanggan.

Data pesanan:
- Nomor pesanan.
- Pelanggan.
- Tanggal.
- Daftar barang.
- Kuantitas.
- Harga.
- Diskon.
- Catatan.
- Tanggal pengiriman yang direncanakan.
- Status pesanan.

Status pesanan:
1. Menunggu konfirmasi.
2. Diproses.
3. Siap dikirim atau diambil.
4. Dalam pengiriman.
5. Selesai.
6. Dibatalkan.

Aturan:
- Pesanan tidak otomatis menjadi penjualan.
- Pesanan belum selesai tidak otomatis mengurangi stok sebagai penjualan.
- Pesanan selesai harus memiliki proses konfirmasi penyerahan barang atau penyelesaian jasa.
- Perubahan status harus tercatat.
- Pembatalan pesanan harus memiliki alasan.
- DP pesanan mengikuti aturan uang muka pada FINANCIAL_LOGIC.md.

Sistem harus memisahkan status pesanan dengan status pembayaran.

# 10. Modul Penjualan

Penjualan dapat dilakukan secara langsung atau berasal dari pesanan.

Data penjualan:
- Nomor transaksi.
- Pelanggan, opsional.
- Daftar produk.
- Kuantitas.
- Harga jual.
- Diskon.
- Total.
- Pembayaran.
- Sisa tagihan.

Aturan:
- Penjualan dari pesanan harus merujuk pesanan asal.
- Pesanan yang dikonversi tidak boleh menciptakan penjualan ganda.
- Satu transaksi penjualan dapat memiliki lebih dari satu pembayaran.
- Pembayaran tidak menciptakan penjualan baru.
- Setiap penjualan yang memengaruhi stok harus mempunyai hubungan dengan pergerakan stoknya.
- Penjualan yang telah diselesaikan tidak boleh dihapus langsung.

# 11. Modul Nota Digital

Nota digital dibuat berdasarkan transaksi yang sudah memiliki data valid.

Informasi nota:
- Identitas usaha.
- Nomor nota.
- Tanggal.
- Identitas pelanggan jika tersedia.
- Daftar barang.
- Jumlah barang.
- Harga.
- Diskon.
- Total.
- Pembayaran.
- Sisa pembayaran.
- Jatuh tempo jika ada.
- Status pembayaran.

Fungsi:
- Melihat nota.
- Membuat PDF.
- Mencetak nota.
- Membagikan nota.

Aturan:
- Nomor nota tidak boleh digunakan kembali setelah transaksi tercatat.
- Nota yang sudah diterbitkan tidak boleh berubah diam-diam.
- Koreksi nota harus memiliki histori.
- PDF harus dapat dibuat tanpa internet.
- Membagikan melalui aplikasi eksternal seperti WhatsApp mungkin membutuhkan koneksi internet.

# 12. Modul Piutang

Piutang berasal dari penjualan yang telah diakui tetapi belum dibayar penuh.

Informasi:
- Pelanggan.
- Nomor nota.
- Nilai tagihan.
- Total pembayaran.
- Sisa piutang.
- Tanggal jatuh tempo.
- Status pembayaran.

Status:
- Belum dibayar.
- Dibayar sebagian.
- Lunas.
- Terlambat.
- Dibatalkan atau dikoreksi sesuai aturan transaksi.

Aturan:
- Pembayaran harus terhubung dengan tagihan.
- Pembayaran sebagian memperbarui sisa piutang.
- Pelunasan mengubah status menjadi lunas.
- Pembayaran berlebih harus memiliki penanganan khusus.
- Piutang terlambat tidak otomatis dihapus.
- Satu pembayaran tidak boleh dialokasikan dua kali.

Laporan umur piutang menggunakan kelompok:
- Belum jatuh tempo.
- Terlambat 1–30 hari.
- Terlambat 31–60 hari.
- Terlambat 61–90 hari.
- Terlambat lebih dari 90 hari.

# 13. Modul Pemasok dan Utang

Profil pemasok dapat dibuat secara manual.

Data pemasok:
- Nama.
- Nomor telepon.
- Alamat.
- Catatan.

Utang pemasok dapat berasal dari pembelian kredit atau kewajiban usaha lainnya.

Aturan:
- Pembayaran utang harus terhubung dengan kewajiban asal.
- Pembayaran sebagian mengurangi saldo utang.
- Pembayaran penuh menyelesaikan utang.
- Pembayaran tidak boleh membuat beban atau persediaan tercatat dua kali.
- Riwayat pembelian dan pembayaran pemasok harus dapat dilihat.

# 14. Modul Karyawan dan Penggajian

Data karyawan:
- Nama.
- Posisi.
- Nomor telepon.
- Tanggal mulai bekerja.
- Status aktif/nonaktif.
- Informasi gaji.

Penggajian dapat mencakup:
- Gaji pokok.
- Tunjangan.
- Bonus.
- Potongan.
- Pembayaran gaji.

Aturan:
- Penggajian harus mempunyai periode.
- Satu periode gaji tidak boleh dibayar dua kali tanpa tindakan koreksi.
- Pembayaran gaji harus terhubung dengan catatan penggajian.
- Karyawan nonaktif tetap mempunyai histori.
- Data gaji tidak boleh dihapus ketika karyawan dinonaktifkan.

# 15. Modul Anggaran dan Target Dana

Anggaran digunakan untuk merencanakan pengeluaran atau alokasi dana.

Informasi:
- Nama anggaran.
- Kategori.
- Periode.
- Batas nominal.
- Realisasi.
- Sisa anggaran.

Aturan:
- Anggaran bukan transaksi keuangan.
- Membuat anggaran tidak mengurangi kas.
- Realisasi berasal dari transaksi yang sesuai kategori.
- Pengguna dapat melihat perbandingan rencana dan realisasi.
- Mengubah anggaran tidak mengubah transaksi historis.

Target tabungan atau dana:
- Memiliki nama tujuan.
- Target nominal.
- Dana terkumpul.
- Tanggal target opsional.
- Riwayat alokasi.

Alokasi dana internal tidak boleh dihitung sebagai beban usaha.

# 16. Modul Aset Usaha

Aset dapat mencakup:
- Peralatan.
- Mesin.
- Kendaraan.
- Komputer.
- Perabot.
- Aset lainnya.

Informasi:
- Nama aset.
- Tanggal perolehan.
- Nilai perolehan.
- Kondisi.
- Lokasi.
- Status.

Aturan:
- Aset harus dibedakan dari persediaan barang dagangan.
- Pembelian aset tidak otomatis menjadi beban operasional penuh tanpa mengikuti kebijakan akuntansi yang disepakati.
- Penjualan atau pelepasan aset harus memiliki histori.
- Penyusutan hanya dijalankan jika fitur dan metode penyusutan sudah ditetapkan.

# 17. Modul Laporan

Laporan dapat berasal dari:
- Keuangan.
- Penjualan.
- Persediaan.
- Piutang.
- Utang.
- Pelanggan.
- Pemasok.
- Karyawan.

Aturan:
- Laporan menggunakan periode yang jelas.
- Laporan tidak boleh menghitung transaksi yang sama lebih dari sekali.
- Data dari modul nonaktif tetap dapat digunakan untuk laporan historis.
- Pengguna dapat mengekspor laporan.
- Laporan harus menunjukkan jika terdapat data yang belum lengkap.
- Nilai laporan harus konsisten dengan data transaksi dan aturan keuangan.

# 18. Notifikasi dan Peringatan

Sistem dapat memberikan peringatan untuk:
- Stok mencapai batas minimum.
- Piutang jatuh tempo.
- Piutang terlambat.
- Utang mendekati jatuh tempo.
- Anggaran terlampaui.
- Pesanan belum diselesaikan.
- Backup terakhir sudah terlalu lama.
- Kapasitas penyimpanan lokal hampir penuh jika informasi tersebut tersedia.

Notifikasi harus informatif dan tidak menghalangi pengguna melakukan pekerjaan yang sah.

Peringatan bukan pengganti validasi transaksi.

# 19. Hak Akses dan Penggunaan

V1 tidak memerlukan akun atau autentikasi.

Aplikasi berjalan pada perangkat utama pengguna.

Konsekuensinya:
- Data berada pada perangkat tersebut.
- Tidak ada sistem multi-user dengan akun berbeda pada V1.
- Pengguna perangkat bertanggung jawab menjaga akses fisik perangkat.
- Backup manual menjadi bagian penting dari keamanan data.
- Jika kelak diperlukan sistem multi-user atau multi-device, hal tersebut harus dirancang sebagai pengembangan terpisah.

# 20. Integritas dan Riwayat

Setiap perubahan penting harus memiliki jejak yang cukup untuk ditelusuri.

Informasi histori minimal:
- ID transaksi.
- Tanggal pembuatan.
- Waktu perubahan.
- Jenis tindakan.
- Nilai sebelum dan sesudah jika relevan.
- Alasan perubahan atau koreksi.
- Referensi transaksi asal.

Sistem harus mencegah:
- Transaksi ganda.
- Pembayaran ganda.
- Pengurangan stok ganda.
- Pengakuan pendapatan ganda.
- Penghapusan histori transaksi.
- Perubahan histori tanpa jejak.

# 21. Aturan Kegagalan Operasional

Jika proses transaksi gagal:
- Data tidak boleh tersimpan setengah jalan.
- Saldo dan stok tidak boleh berubah sebagian.
- Pengguna harus menerima pesan kesalahan yang dapat dipahami.
- Pengguna dapat mencoba kembali tanpa menciptakan transaksi ganda.
- Sistem harus mempertahankan konsistensi data.

Jika aplikasi ditutup ketika transaksi sedang diproses, data harus tetap berada dalam keadaan konsisten ketika aplikasi dibuka kembali.

# 22. Batasan V1

Fitur berikut tidak termasuk ruang lingkup V1 kecuali disetujui kemudian:
- AI untuk analisis usaha.
- Sinkronisasi cloud otomatis.
- Multi-device real-time.
- Multi-user dengan role dan permission.
- Integrasi bank otomatis.
- Integrasi marketplace otomatis.
- Integrasi pajak pemerintah secara otomatis.
- Pembayaran online terintegrasi.
- Sistem akuntansi multi-cabang kompleks.

---

# 23. Keputusan yang Masih Memerlukan Persetujuan

1. Apakah penjualan tanpa profil pelanggan boleh dilakukan? Rekomendasi: boleh.
2. Apakah satu produk dapat memiliki beberapa satuan, misalnya dus, pak, dan pcs? Rekomendasi: didukung dengan konversi satuan yang eksplisit.
3. Apakah pengguna boleh menjual produk tanpa mengaktifkan inventaris? Rekomendasi: boleh.
4. Apakah transaksi stok negatif diperbolehkan? Mengikuti keputusan di FINANCIAL_LOGIC.md.
5. Apakah satu transaksi dapat memuat beberapa metode pembayaran? Rekomendasi: didukung.
6. Apakah satu nota dapat memiliki lebih dari satu kali pembayaran? Rekomendasi: wajib didukung untuk piutang dan cicilan.
7. Apakah pengguna dapat mencatat transaksi tanpa tanggal jatuh tempo? Rekomendasi: boleh.
8. Apakah laporan laba dan neraca lengkap termasuk V1? Perlu disesuaikan dengan cakupan sistem akuntansi yang disetujui.
9. Apakah aplikasi mendukung lebih dari satu usaha dalam satu instalasi? Rekomendasi awal: satu profil usaha per instalasi V1 agar lebih sederhana.

---

**Catatan implementasi:** Business Rules ini harus dibaca bersama PRD, FINANCIAL_LOGIC.md, dan TRANSACTION_RULES.md. Jika terdapat konflik, jangan membuat keputusan sendiri. Tandai konflik dan minta persetujuan pemilik produk.
# BUSINESS_RULES.md

**UMKM Manager — Business Rules**  
Version: 1.1  
Status: Draft – Audit Revision  
Approval: Pending Product Owner Approval

## 1. Tujuan

Menetapkan perilaku modul dan aturan bisnis UMKM Manager agar seluruh fitur konsisten, sederhana, dan dapat digunakan berbagai jenis UMKM.

## 2. Prinsip produk

- Offline-first dan local-first.
- Tidak memerlukan akun atau login.
- Data utama disimpan pada perangkat utama.
- Tidak ada sinkronisasi cloud otomatis pada V1.
- Input transaksi dilakukan manual.
- Tidak ada AI pada V1.
- Fitur opsional dapat diaktifkan melalui menu **Tambah Fitur**.
- Data tidak dihapus ketika fitur dinonaktifkan.
- **Tambah Fitur** berbeda dari **Tambah Data**.
- Pengguna tidak harus memahami akuntansi.

## 3. Profil usaha

**Usulan – Menunggu Persetujuan:** satu profil usaha per instalasi V1.

Profil memuat nama usaha dan informasi dasar yang diperlukan untuk nota dan laporan. Perubahan profil tidak boleh mengubah histori transaksi.

## 4. Sistem modul

Modul dibagi menjadi:

### Core
- Profil usaha.
- Dashboard dasar.
- Keuangan dasar.
- Pengaturan.
- Backup dan restore.

### Opsional
- Produk.
- Persediaan.
- Penjualan.
- Pelanggan.
- Pesanan.
- Nota digital.
- Piutang.
- Karyawan.
- Payroll.
- Pemasok.
- Utang.
- Anggaran.
- Target tabungan.
- Aset usaha.
- Laporan lanjutan.

Aturan:
1. Modul opsional tidak aktif secara default kecuali ditetapkan sebagai bagian onboarding.
2. Aktivasi modul tidak boleh mengubah transaksi lama secara diam-diam.
3. Penonaktifan modul menyembunyikan akses input baru sesuai kebijakan, tetapi mempertahankan data.
4. Modul yang menjadi dependensi modul lain tidak boleh dinonaktifkan tanpa penanganan dependensi.
5. Laporan harus menjelaskan apabila suatu modul tidak aktif sehingga datanya tidak lengkap.

## 5. Identitas data

- Setiap entitas memiliki ID internal unik dan stabil.
- ID tidak boleh berubah ketika nama atau informasi tampilan diubah.
- Nama yang sama tidak otomatis dianggap entitas yang sama.
- Penghapusan master data yang sudah digunakan dalam transaksi harus dibatasi.
- Data historis tetap dapat dibaca setelah master data dinonaktifkan.

## 6. Keuangan

- Saldo awal dimasukkan pengguna.
- Sistem tidak menganggap saldo awal otomatis Rp0 sebagai uang usaha yang benar-benar tersedia.
- Modal pemilik bukan pendapatan.
- Pengambilan pemilik bukan biaya operasional.
- Transfer antarakun bukan pendapatan atau biaya.
- Pembayaran piutang bukan penjualan baru.
- Pembayaran utang bukan biaya kedua.
- Saldo kas tidak sama dengan laba.
- Semua aturan rinci mengikuti `FINANCIAL_LOGIC.md`.

## 7. Produk dan persediaan

Produk dibuat manual dengan nama dan data yang dibutuhkan.

Informasi produk dapat mencakup:
- Nama.
- SKU/kode opsional.
- Kategori opsional.
- Satuan dasar.
- Harga jual.
- Biaya perolehan/HPP.
- Stok.
- Batas stok minimum.
- Status aktif.

**Usulan – Menunggu Persetujuan:**
- Mendukung satuan alternatif dan konversi eksplisit.
- Mendukung kuantitas pecahan.
- Tidak mengizinkan stok negatif secara default.
- Menggunakan moving weighted average sebagai metode HPP.

Penyesuaian stok harus menyimpan alasan, tanggal, kuantitas sebelum/sesudah, dan pengguna/perangkat yang melakukan perubahan.

## 8. Pelanggan

Pelanggan tidak wajib dibuat melalui halaman master data sebelum transaksi.

Alur:
1. Pengguna mengetik nama pelanggan pada transaksi.
2. Sistem mencari dan menyarankan profil yang cocok.
3. Pengguna memilih profil yang benar atau secara eksplisit membuat profil baru.
4. Nama yang mirip tidak boleh otomatis digabung.
5. Profil pelanggan memiliki ID internal unik.

Data minimum: nama. Nomor telepon, alamat, catatan, dan limit kredit bersifat opsional.

Halaman pelanggan dapat menampilkan:
- Total pembelian.
- Total pembayaran.
- Saldo piutang.
- Jumlah invoice.
- Riwayat invoice.
- Riwayat pembayaran.
- Invoice jatuh tempo.

## 9. Pesanan

Pesanan memiliki status operasional yang terpisah dari status pembayaran.

Status pesanan:
- Menunggu konfirmasi.
- Diproses.
- Siap dikirim/diambil.
- Dikirim.
- Selesai.
- Dibatalkan.

Pesanan yang belum dipenuhi tidak otomatis menjadi penjualan atau piutang.

Pemenuhan sebagian harus didukung apabila keputusan ini disetujui. Kuantitas yang belum dipenuhi tetap tercatat sebagai sisa pesanan.

## 10. Penjualan

**Usulan – Menunggu Persetujuan:** penjualan boleh dicatat tanpa profil pelanggan.

Penjualan dapat dilakukan:
- Dengan produk dari katalog.
- Dengan input item manual.
- Dengan modul persediaan aktif.
- Tanpa modul persediaan.

Jika modul persediaan tidak aktif, sistem tidak boleh mengurangi stok yang tidak dikelola. Laporan HPP dan laba harus menampilkan keterbatasan data.

Penjualan barang dari persediaan aktif harus menghasilkan pengurangan stok tepat satu kali.

## 11. Nota digital dan invoice

Invoice harus memiliki:
- Nomor unik.
- Tanggal.
- Informasi pelanggan bila tersedia.
- Item dan kuantitas.
- Harga satuan.
- Diskon/biaya tambahan.
- Total.
- Jumlah dibayar.
- Sisa tagihan.
- Jatuh tempo bila ada.
- Status pembayaran.

Nota dapat ditampilkan, dicetak, dan diekspor PDF secara offline. Berbagi melalui layanan eksternal seperti WhatsApp memerlukan koneksi internet.

Invoice yang telah diposting dan memiliki pembayaran tidak boleh dihapus langsung.

## 12. Piutang dan pembayaran

Status pembayaran:
- Belum dibayar.
- Dibayar sebagian.
- Lunas.
- Dibatalkan.

Aturan:
- Pembayaran dapat dilakukan dalam beberapa cicilan.
- Satu invoice dapat menerima beberapa metode pembayaran.
- Setiap pembayaran memiliki ID unik.
- Pembayaran harus memiliki alokasi yang jelas.
- Pembayaran tidak boleh menciptakan penjualan baru.
- Jatuh tempo dapat opsional.
- Keterlambatan dihitung dari tanggal jatuh tempo.
- Limit kredit pelanggan bersifat opsional dan hanya memberi peringatan jika diaktifkan.

**Usulan – Menunggu Persetujuan:** pembayaran dapat dialokasikan ke beberapa invoice dan kelebihan pembayaran disimpan sebagai kredit pelanggan.

## 13. Pemasok dan utang

Pemasok dibuat manual dan memiliki ID unik.

Data dapat mencakup nama, kontak, alamat, catatan, histori pembelian, pembayaran, dan saldo utang.

Pembayaran utang tidak boleh menciptakan biaya baru jika biaya/persediaan telah diakui saat transaksi pembelian.

## 14. Karyawan dan payroll

Data karyawan dapat mencakup nama, kontak, jabatan, tanggal mulai, status, dan komponen gaji.

Payroll harus memisahkan:
- Gaji yang menjadi kewajiban.
- Pembayaran gaji.
- Uang muka.
- Potongan.
- Koreksi.

Pembayaran payroll tidak boleh dicatat dua kali sebagai biaya.

## 15. Anggaran dan target tabungan

- Anggaran merupakan batas/rencana, bukan transaksi.
- Target tabungan merupakan alokasi atau tujuan, bukan otomatis biaya.
- Pemindahan dana ke rekening/tabungan usaha tidak otomatis menjadi biaya.
- Realisasi harus berasal dari transaksi yang tercatat.

## 16. Aset usaha

Modul aset dapat mencatat nama aset, tanggal perolehan, biaya, lokasi, kondisi, dan status.

**Usulan – Menunggu Persetujuan:** penyusutan otomatis berada di luar MVP.

## 17. Laporan

Laporan harus:
- Memiliki periode yang jelas.
- Menjelaskan sumber data.
- Tidak menggabungkan kas dengan laba.
- Menandai data yang tidak lengkap.
- Tidak mengasumsikan HPP jika biaya produk tidak tersedia.
- Mempertahankan histori ketika modul dinonaktifkan.

## 18. Offline dan penyimpanan

- Aplikasi harus dapat digunakan tanpa internet setelah aset aplikasi tersedia di perangkat.
- Transaksi disimpan lokal.
- Kegagalan penyimpanan harus ditampilkan dengan jelas.
- Pengguna harus dapat membuat backup manual.
- Restore harus memvalidasi file sebelum mengganti data.
- Tidak ada sinkronisasi otomatis antarperangkat pada V1.
- Data browser dapat hilang jika profil/browser/perangkat dihapus atau rusak; aplikasi wajib memberi edukasi backup.

## 19. Audit dan koreksi

- Transaksi penting memiliki histori perubahan.
- Transaksi yang telah diposting tidak dihapus langsung.
- Koreksi menggunakan pembatalan/reversal atau transaksi koreksi.
- Histori invoice dan pembayaran harus tetap tersedia.
- Kegagalan operasi tidak boleh meninggalkan transaksi setengah jadi.

## 20. Keputusan terbuka

| ID | Keputusan | Status |
|---|---|---|
| DEC-BIZ-01 | Satu profil usaha per instalasi | Menunggu persetujuan |
| DEC-BIZ-02 | Penjualan tanpa pelanggan | Menunggu persetujuan |
| DEC-BIZ-03 | Penjualan tanpa modul persediaan | Menunggu persetujuan |
| DEC-BIZ-04 | Satuan alternatif dan konversi | Menunggu persetujuan |
| DEC-BIZ-05 | Stok negatif | Menunggu persetujuan |
| DEC-BIZ-06 | Multi-metode pembayaran | Menunggu persetujuan |
| DEC-BIZ-07 | Multi-cicilan | Direkomendasikan, belum disahkan |
| DEC-BIZ-08 | Jatuh tempo opsional | Menunggu persetujuan |
| DEC-BIZ-09 | Cakupan laporan keuangan | Menunggu persetujuan |
| DEC-BIZ-10 | Penyusutan aset | Menunggu persetujuan |
| DEC-BIZ-11 | Pemenuhan sebagian pesanan | Menunggu persetujuan |
| DEC-BIZ-12 | Alokasi pembayaran lintas invoice | Menunggu persetujuan |

## 21. Batasan

Dokumen ini belum menjadi persetujuan implementasi. Jika aturan bisnis bertentangan dengan `FINANCIAL_LOGIC.md` atau `TRANSACTION_RULES.md`, implementasi harus dihentikan dan konflik dilaporkan kepada Product Owner.