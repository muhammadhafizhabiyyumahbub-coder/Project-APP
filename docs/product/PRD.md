# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# UMKM MANAGER

**Versi:** 2.0  
**Status:** Draft – Product Specification  
**Platform:** Desktop & Mobile  
**Bahasa:** Indonesia  
**Target Pengguna:** Pemilik dan pengelola UMKM  
**Arsitektur:** Offline-First, Local-First, Modular  
**Autentikasi:** Tidak diperlukan untuk versi pertama  
**Model Penggunaan:** Single Device dengan Backup & Restore

---

# 1. PRODUCT OVERVIEW

## 1.1 Deskripsi Produk

UMKM Manager adalah aplikasi manajemen usaha sederhana untuk membantu pemilik UMKM mengelola keuangan, produk, stok, penjualan, pesanan, pelanggan, nota digital, piutang, karyawan, dan aktivitas operasional.

Aplikasi dirancang untuk pengguna yang tidak memiliki pengetahuan akuntansi khusus.

Pengguna dapat memulai dari fitur dasar dan menambahkan fitur lain sesuai kebutuhan melalui menu Tambah.

Aplikasi bekerja secara offline dan menyimpan data secara lokal di perangkat. Pengguna tidak perlu membuat akun, login, atau menggunakan layanan cloud untuk menjalankan fungsi utama.

## 1.2 Visi Produk

Menjadi aplikasi pengelolaan UMKM yang mudah digunakan, fleksibel, akurat dalam pencatatan keuangan, dan dapat berkembang mengikuti kebutuhan bisnis.

## 1.3 Prinsip Produk

1. Simple: mudah digunakan oleh pemilik UMKM.
2. Modular: pengguna bebas memilih fitur.
3. Offline-first: fungsi utama tidak bergantung pada internet.
4. Local-first: data disimpan di perangkat pengguna.
5. Financial accuracy: pencatatan dan laporan harus mengikuti aturan keuangan yang konsisten.
6. User-controlled: pengguna mengendalikan data dan fitur.
7. Progressive disclosure: fitur yang tidak dibutuhkan tidak memenuhi tampilan utama.
8. Scalable: arsitektur memungkinkan pengembangan modul baru.

---

# 2. TARGET PENGGUNA DAN MASALAH

## 2.1 Target Pengguna

Aplikasi ditujukan untuk berbagai jenis UMKM tanpa membatasi sektor usaha.

Contoh:
- Warung dan toko kelontong.
- Toko grosir.
- Toko pakaian.
- Usaha makanan dan minuman.
- Usaha produksi rumahan.
- Reseller dan distributor kecil.
- Pemasok toko atau pedagang pasar.
- Usaha keluarga.
- Usaha jasa.

## 2.2 Masalah yang Diselesaikan

1. Uang pribadi dan uang usaha bercampur.
2. Pemilik tidak mengetahui kondisi keuangan usaha.
3. Pencatatan pemasukan dan pengeluaran tidak teratur.
4. Stok barang sulit dipantau.
5. Keuntungan usaha sulit dihitung.
6. Pelanggan sering membeli barang secara kredit atau bon.
7. Pembayaran pelanggan sering terlambat.
8. Nota transaksi masih menggunakan kertas atau pencatatan manual.
9. Riwayat utang dan pembayaran pelanggan tidak tersimpan rapi.
10. Pemilik kesulitan memantau gaji dan biaya operasional.

## 2.3 Tujuan Pengguna

Pengguna harus bisa:
- Mengetahui saldo usaha.
- Mengelola alokasi dana.
- Mencatat pemasukan dan pengeluaran.
- Mengelola produk dan stok.
- Mencatat pesanan.
- Membuat nota digital.
- Mencatat penjualan tunai dan kredit.
- Mengetahui pelanggan yang belum membayar.
- Mencatat pembayaran secara bertahap.
- Mengetahui keuntungan dan perkembangan usaha.
- Membuat laporan keuangan.

---

# 3. SISTEM MODULAR DAN FITUR OPSIONAL

## 3.1 Konsep Utama

Semua fitur bisnis tambahan menggunakan sistem modular.

Pengguna tidak harus mengaktifkan seluruh fitur saat pertama kali menggunakan aplikasi.

Pengguna dapat memilih fitur yang diperlukan melalui menu:

**+ Tambah Fitur**

Setiap fitur yang ditambahkan akan muncul pada navigasi atau dashboard.

## 3.2 Fitur Fondasi

Fitur dasar yang tersedia:
- Dashboard.
- Pengaturan usaha.
- Saldo dan transaksi dasar.
- Kategori transaksi.
- Penyimpanan lokal.
- Pengaturan aplikasi.
- Backup dan restore.

## 3.3 Katalog Modul Opsional

### Keuangan
- Dana usaha.
- Dana darurat.
- Anggaran.
- Target tabungan.
- Aset usaha.
- Laporan lanjutan.

### Produk dan Operasional
- Produk.
- Stok.
- Penjualan.
- Pembelian persediaan.
- Pemasok.

### Pelanggan dan Transaksi
- Pelanggan.
- Pesanan.
- Nota digital.
- Invoice.
- Penjualan kredit.
- Buku piutang.
- Pembayaran bertahap.
- Laporan umur piutang.

### Sumber Daya Manusia
- Karyawan.
- Gaji.
- Bonus dan tunjangan.

### Manajemen Bisnis
- Utang.
- Pelanggan.
- Anggaran.
- Target usaha.
- Aset.

## 3.4 Aturan Modular

1. Modul dapat ditambahkan kapan saja.
2. Modul dapat dinonaktifkan kapan saja.
3. Menonaktifkan modul tidak menghapus data.
4. Modul dapat diaktifkan kembali dengan data sebelumnya.
5. Modul tidak boleh aktif tanpa tindakan pengguna.
6. Modul yang memiliki ketergantungan harus menjelaskan kebutuhan tersebut.
7. Modul tidak boleh merusak transaksi atau data modul lainnya.
8. Penghapusan data harus memerlukan konfirmasi terpisah dari penonaktifan modul.

## 3.5 Perbedaan Tambah Fitur dan Tambah Data

**Tambah Fitur**
- Mengaktifkan modul bisnis baru.

**Tambah Data**
- Membuat produk.
- Membuat transaksi.
- Membuat pesanan.
- Membuat pelanggan.
- Menambahkan karyawan.
- Mencatat pembayaran.

Kedua fungsi harus dibedakan dalam UI agar pengguna tidak bingung.

---

# 4. INITIAL SETUP DAN PENGELOLAAN DANA

## 4.1 Setup Awal

Ketika aplikasi pertama kali dibuka:
- Saldo awal Rp0.
- Pengguna dapat mengisi dana yang saat ini dimiliki.
- Pengguna dapat mengalokasikan dana.
- Pengguna dapat melewati pengaturan tambahan dan melakukannya nanti.

Tidak ada kewajiban membuat akun.

## 4.2 Alokasi Dana

Contoh total dana usaha Rp10.000.000:

| Alokasi | Nominal |
|---|---:|
| Operasional | Rp6.000.000 |
| Dana darurat | Rp2.000.000 |
| Dana lainnya | Rp2.000.000 |
| Total | Rp10.000.000 |

Alokasi merupakan pembagian dari uang yang sama, bukan tambahan aset.

Sistem harus memastikan total alokasi tidak melebihi dana aktual yang tersedia untuk dialokasikan.

## 4.3 Aturan Dana

- Transfer antaralokasi bukan pendapatan.
- Transfer antaralokasi bukan pengeluaran.
- Saldo aktual dan saldo alokasi harus dibedakan.
- Pengguna dapat mengubah alokasi.
- Setiap perubahan memiliki riwayat.

---

# 5. DASHBOARD DAN NAVIGASI

## 5.1 Dashboard

Dashboard menampilkan ringkasan usaha berdasarkan modul aktif.

Informasi:
- Total saldo aktual.
- Dana operasional.
- Dana cadangan.
- Pemasukan.
- Pengeluaran.
- Penjualan.
- Estimasi laba.
- Piutang yang belum dibayar.
- Tagihan jatuh tempo.
- Stok rendah.
- Ringkasan karyawan jika modul terkait aktif.

Informasi yang belum tersedia tidak boleh ditampilkan seolah-olah memiliki nilai yang akurat.

## 5.2 Navigasi

Navigasi awal:
1. Dashboard.
2. Keuangan.
3. Tambah.

Modul lain muncul setelah diaktifkan.

Pengguna dapat mengatur urutan atau menyembunyikan modul yang tidak diperlukan.

---

# 6. MODUL KEUANGAN

## 6.1 Fungsi

- Mencatat pemasukan.
- Mencatat pengeluaran.
- Melihat saldo.
- Mengelompokkan transaksi.
- Melihat riwayat transaksi.
- Mengedit transaksi dengan jejak perubahan.
- Membatalkan transaksi dengan alasan dan konfirmasi.

## 6.2 Kategori Pengeluaran

Contoh:
- Pembelian bahan baku.
- Pembelian persediaan.
- Gaji karyawan.
- Sewa tempat usaha.
- Listrik dan air usaha.
- Transportasi usaha.
- Pengiriman.
- Perawatan.
- Pemasaran.
- Peralatan.
- Biaya operasional lainnya.

## 6.3 Pengeluaran Pribadi

Pengeluaran rumah tangga dan kebutuhan pribadi tidak boleh dicampurkan dengan biaya usaha.

Contoh:
- Belanja rumah.
- Makan keluarga.
- Cicilan rumah pribadi.
- Biaya sekolah pribadi.
- Liburan keluarga.
- Kebutuhan pribadi.

Jika pemilik menggunakan uang usaha untuk kepentingan pribadi, transaksi dicatat sebagai:

**Pengambilan Pemilik (Owner Withdrawal).**

Transaksi ini mengurangi kas dan ekuitas pemilik, bukan biaya operasional usaha.

---

# 7. MODUL PRODUK DAN STOK

## 7.1 Data Produk

Pengguna dapat menambahkan produk secara manual.

Data:
- Nama produk.
- Jumlah stok.
- Satuan.
- Harga modal per satuan.
- Harga jual per satuan.
- Keterangan opsional.

Harga modal dan harga jual dapat belum diisi, tetapi sistem harus memberikan peringatan ketika data tersebut dibutuhkan untuk menghitung laba.

## 7.2 Fitur Produk

- Tambah produk.
- Edit produk.
- Arsipkan produk.
- Lihat stok.
- Tambah stok.
- Kurangi stok.
- Lihat riwayat perubahan.

## 7.3 Pengelolaan Stok

- Stok masuk.
- Stok keluar.
- Penyesuaian stok.
- Riwayat stok.
- Peringatan stok rendah.

Penjualan berbasis produk dapat mengurangi stok otomatis.

Pengguna tetap dapat melakukan koreksi manual dengan riwayat perubahan.

Stok tidak boleh berubah dua kali akibat transaksi yang sama.

---

# 8. MODUL PELANGGAN

## 8.1 Konsep Pencatatan Pelanggan

Pelanggan dicatat secara manual melalui nama yang diketik oleh pengguna.

Pengguna tidak diwajibkan membuat profil pelanggan sebelum mencatat transaksi.

Sistem menyediakan identifikasi pelanggan berdasarkan nama yang dimasukkan.

## 8.2 Cara Kerja

Ketika pengguna membuat pesanan atau nota:

1. Pengguna mengetik nama toko atau pelanggan.
2. Sistem mencari nama yang pernah digunakan.
3. Jika ditemukan, sistem menawarkan profil yang sudah ada.
4. Jika tidak ditemukan, sistem menawarkan membuat pelanggan baru.
5. Pengguna memilih profil lama atau mengonfirmasi profil baru.
6. Sistem menghubungkan transaksi dengan identitas pelanggan tersebut.

Contoh:

Pengguna mengetik: Toko Makmur.

Jika ditemukan:
- Tampilkan profil Toko Makmur.
- Tampilkan total piutang.
- Tampilkan jumlah nota.
- Tampilkan riwayat transaksi.

Jika tidak ditemukan:
- Tawarkan pembuatan profil baru.
- Buat identitas internal unik.
- Hubungkan transaksi dengan profil tersebut.

## 8.3 Data Pelanggan

Data minimal:
- ID pelanggan internal.
- Nama pelanggan atau nama toko.

Data opsional:
- Nomor telepon.
- Alamat.
- Catatan.
- Batas kredit.
- Status pelanggan.

Semua informasi tambahan dapat diisi belakangan.

## 8.4 Identifikasi Nama

1. Pencarian nama mendukung pencocokan teks yang tidak sensitif terhadap huruf besar/kecil.
2. Nama yang mirip dapat ditampilkan sebagai saran.
3. Nama yang sama tidak otomatis dianggap sebagai pelanggan yang sama.
4. Pengguna harus mengonfirmasi ketika memilih pelanggan yang ditemukan.
5. Setiap pelanggan memiliki ID internal yang tidak berubah meskipun namanya diedit.
6. Penggabungan dua profil hanya boleh dilakukan melalui tindakan eksplisit dan proses verifikasi.

## 8.5 Profil Pelanggan

Halaman profil pelanggan menampilkan:

- Nama pelanggan.
- Informasi kontak jika tersedia.
- Total pembelian.
- Total pembayaran.
- Total piutang berjalan.
- Jumlah nota.
- Daftar nota.
- Riwayat pembayaran.
- Tagihan belum jatuh tempo.
- Tagihan terlambat.
- Catatan khusus.

---

# 9. MODUL PESANAN

## 9.1 Fungsi

Mencatat permintaan barang dari pelanggan atau toko.

Contoh:
- Toko memesan barang.
- Reseller memesan persediaan.
- Pedagang pasar memesan barang.
- Pelanggan memesan produk dalam jumlah tertentu.

## 9.2 Data Pesanan

- Nomor pesanan.
- Tanggal pesanan.
- Pelanggan.
- Daftar barang.
- Jumlah barang.
- Harga satuan.
- Diskon opsional.
- Catatan.
- Status pesanan.

## 9.3 Status Pesanan

- Menunggu konfirmasi.
- Diproses.
- Siap dikirim.
- Dikirim.
- Selesai.
- Dibatalkan.

Status pesanan harus dibedakan dari status pembayaran.

Pesanan yang baru masuk tidak otomatis menjadi pendapatan atau piutang.

Transaksi penjualan dan pengakuan piutang dilakukan saat barang diserahkan atau saat transaksi dianggap selesai sesuai kebijakan pencatatan usaha.

## 9.4 Integrasi Stok

Ketika pesanan dibuat:
- Sistem dapat memeriksa ketersediaan stok.
- Sistem dapat menampilkan jumlah stok tersedia.
- Sistem dapat menyediakan reservasi stok sebagai opsi pengembangan.

Untuk versi pertama, pesanan yang belum dikonfirmasi tidak otomatis mengurangi stok fisik.

Ketika barang diserahkan, stok diperbarui sesuai jumlah barang yang benar-benar keluar.

---

# 10. MODUL NOTA DIGITAL DAN INVOICE

## 10.1 Fungsi

Pengguna dapat membuat nota digital dari transaksi penjualan.

Nota menjadi bukti transaksi antara usaha dan pelanggan.

## 10.2 Data Nota

- Nomor nota unik.
- Tanggal transaksi.
- Identitas pelanggan.
- Daftar produk.
- Jumlah barang.
- Harga satuan.
- Diskon jika ada.
- Total transaksi.
- Pembayaran awal.
- Sisa tagihan.
- Jatuh tempo.
- Catatan.

## 10.3 Format Nota

Nota menampilkan:
- Nama usaha.
- Informasi usaha jika tersedia.
- Nomor nota.
- Tanggal.
- Nama pelanggan.
- Rincian barang.
- Total pembayaran.
- Jumlah yang telah dibayar.
- Sisa tagihan.
- Status pembayaran.
- Jatuh tempo jika ada.

## 10.4 Status Nota

- Belum dibayar.
- Dibayar sebagian.
- Lunas.
- Dibatalkan.

Status pesanan dan status pembayaran merupakan dua status terpisah.

## 10.5 Ekspor dan Distribusi

Pengguna dapat:
- Menyimpan nota sebagai PDF.
- Mencetak nota.
- Membagikan file melalui aplikasi lain.
- Menyimpan salinan nota di perangkat.

Pembuatan nota PDF harus tersedia offline.

Pengiriman melalui WhatsApp atau layanan online memerlukan koneksi internet.

## 10.6 Nomor Nota

Sistem membuat nomor nota unik secara otomatis.

Nomor nota:
- Tidak boleh duplikat.
- Tidak berubah tanpa proses koreksi resmi.
- Tidak digunakan kembali setelah pembatalan.
- Harus tetap unik setelah backup dan restore.

---

# 11. MODUL PENJUALAN KREDIT DAN PIUTANG

## 11.1 Metode Pembayaran

Setiap transaksi dapat menggunakan:

1. Tunai/lunas.
2. Pembayaran sebagian.
3. Kredit atau bon.
4. Uang muka (DP).

## 11.2 Contoh Transaksi

Total pembelian Toko Makmur: Rp1.001.000.

Pembayaran pertama: Rp300.000.

Sisa piutang: Rp701.000.

Jatuh tempo: 16 November 2026.

Status: Dibayar Sebagian.

## 11.3 Pembayaran Bertahap

Pelanggan dapat membayar beberapa kali.

Contoh:

| Pembayaran | Nominal |
|---|---:|
| Pembayaran pertama | Rp300.000 |
| Pembayaran kedua | Rp200.000 |
| Pembayaran ketiga | Rp501.000 |
| Total | Rp1.001.000 |

Sistem menghitung sisa tagihan secara otomatis.

Status berubah:
- Belum dibayar.
- Dibayar sebagian.
- Lunas.

Setiap pembayaran memiliki:
- Tanggal.
- Nominal.
- Metode pembayaran.
- Catatan opsional.
- Referensi nota.

Pembayaran tidak boleh dicatat dua kali.

## 11.4 Buku Piutang

Halaman buku piutang menampilkan semua pelanggan yang masih memiliki tagihan.

Contoh:

| Pelanggan | Sisa piutang | Jatuh tempo |
|---|---:|---|
| Toko Makmur | Rp701.000 | 16 Nov |
| Toko Jaya | Rp450.000 | 12 Nov |
| Toko Berkah | Rp1.200.000 | 20 Nov |

Fungsi:
- Melihat total piutang.
- Melihat piutang per pelanggan.
- Melihat daftar nota.
- Melihat pembayaran.
- Melihat jatuh tempo.
- Memfilter status.
- Memfilter periode.
- Melihat tagihan terlambat.

## 11.5 Laporan Umur Piutang

Sistem menyediakan pengelompokan:
- Belum jatuh tempo.
- Terlambat 1–30 hari.
- Terlambat 31–60 hari.
- Terlambat 61–90 hari.
- Terlambat lebih dari 90 hari.

Pengelompokan dihitung berdasarkan tanggal jatuh tempo.

## 11.6 Batas Kredit Pelanggan

Fitur opsional:
- Batas kredit per pelanggan.
- Total piutang berjalan.
- Peringatan ketika pelanggan melewati batas.
- Konfirmasi sebelum membuat transaksi kredit tambahan.

Batas kredit merupakan peringatan dan kontrol internal, bukan jaminan pelanggan akan membayar.

## 11.7 Pembatalan dan Koreksi

- Nota yang sudah dibayar tidak boleh dihapus secara langsung.
- Pembatalan harus memiliki alasan.
- Pembayaran yang salah harus dikoreksi melalui transaksi pembalikan atau mekanisme koreksi yang dapat diaudit.
- Pengembalian barang harus memperbarui stok dan nilai transaksi dengan benar.
- Perubahan tidak boleh menghapus riwayat pembayaran.

---

# 12. INTEGRASI NOTA, STOK, DAN KEUANGAN

Bagian ini merupakan aturan inti sistem.

## 12.1 Contoh Penjualan Kredit

Penjualan:
- Nilai transaksi Rp1.000.000.
- HPP Rp700.000.
- Pembayaran tunai Rp0.

Dampak pencatatan:

| Komponen | Perubahan |
|---|---:|
| Penjualan | +Rp1.000.000 |
| Piutang | +Rp1.000.000 |
| Kas | Rp0 |
| Persediaan | -Rp700.000 |
| HPP | +Rp700.000 |
| Laba kotor | +Rp300.000 |

## 12.2 Ketika Pelanggan Membayar

Pelanggan membayar Rp400.000.

Dampak:
- Kas bertambah Rp400.000.
- Piutang berkurang Rp400.000.
- Penjualan tidak bertambah lagi.
- Laba tidak bertambah lagi hanya karena pembayaran piutang.

## 12.3 Prinsip Integrasi

1. Satu transaksi hanya boleh menghasilkan satu pengakuan penjualan.
2. Pembayaran piutang bukan penjualan baru.
3. Perubahan stok harus sesuai jumlah barang yang diserahkan.
4. HPP tidak boleh dihitung dari harga jual.
5. Pembatalan harus membalik dampak transaksi terkait secara konsisten.
6. Perubahan transaksi harus memiliki riwayat.
7. Nota, pembayaran, stok, dan laporan harus terhubung melalui referensi transaksi.

---

# 13. MODUL KARYAWAN DAN GAJI

## 13.1 Karyawan

Data:
- Nama.
- Jabatan.
- Tanggal mulai (opsional).
- Status.
- Catatan.

## 13.2 Gaji

Data:
- Karyawan.
- Nominal gaji.
- Periode.
- Tanggal pembayaran.
- Status pembayaran.
- Bonus/tunjangan opsional.

Status:
- Belum dibayar.
- Sudah dibayar.

Gaji yang sudah menjadi kewajiban tetapi belum dibayar dapat dicatat sebagai utang gaji.

Ketika dibayar:
- Kas berkurang.
- Utang gaji diselesaikan.
- Riwayat pembayaran tersimpan.

Menambahkan karyawan tidak otomatis membuat transaksi gaji.

---

# 14. MODUL UTANG, PEMASOK, DAN FITUR LAIN

## 14.1 Utang

Mencatat kewajiban kepada pemasok atau pihak lain:
- Nama pihak terkait.
- Nominal.
- Tanggal.
- Jatuh tempo.
- Status.
- Riwayat pembayaran.

## 14.2 Pemasok

Data:
- Nama pemasok.
- Nomor kontak opsional.
- Alamat opsional.
- Catatan.
- Riwayat transaksi.

## 14.3 Anggaran

Pengguna dapat membuat batas pengeluaran per kategori dan periode.

## 14.4 Target Tabungan

Pengguna dapat menentukan target dana usaha dan melihat progresnya.

## 14.5 Aset Usaha

Mencatat peralatan, mesin, kendaraan, dan aset lain.

Penyusutan akuntansi belum diwajibkan pada versi pertama.

---

# 15. LAPORAN KEUANGAN

## 15.1 Laporan Dasar

- Pemasukan.
- Pengeluaran.
- Saldo.
- Penjualan.
- Pembelian.
- HPP jika tersedia.
- Laba kotor.
- Estimasi laba bersih.
- Pengambilan pemilik.

## 15.2 Laporan Penjualan

- Penjualan harian.
- Penjualan mingguan.
- Penjualan bulanan.
- Penjualan per produk.
- Penjualan tunai.
- Penjualan kredit.

## 15.3 Laporan Piutang

- Total piutang.
- Piutang per pelanggan.
- Nota belum lunas.
- Pembayaran yang diterima.
- Piutang jatuh tempo.
- Piutang terlambat.
- Umur piutang.

## 15.4 Laporan Stok

- Stok tersedia.
- Barang masuk.
- Barang keluar.
- Penyesuaian stok.
- Stok rendah.
- Riwayat stok.

## 15.5 Ekspor

- PDF.
- Excel.
- CSV.

Semua laporan harus menunjukkan periode dan tanggal pembuatan.

---

# 16. FINANCIAL RULES DAN ACCOUNTING LOGIC

Aturan ini wajib dijaga dalam seluruh modul.

1. Modal pemilik bukan pendapatan penjualan.
2. Pengambilan pemilik bukan biaya operasional.
3. Transfer antaralokasi bukan pendapatan atau pengeluaran.
4. Pembelian persediaan bukan otomatis HPP.
5. HPP dicatat ketika barang terjual atau melalui penyesuaian yang sesuai.
6. Penjualan kredit meningkatkan penjualan dan piutang, bukan kas.
7. Pembayaran piutang meningkatkan kas dan mengurangi piutang, bukan meningkatkan penjualan.
8. Pembayaran utang tidak boleh dihitung sebagai biaya baru jika biaya atau persediaan telah dicatat sebelumnya.
9. Penerimaan piutang tidak boleh dihitung sebagai pendapatan baru.
10. Pesanan yang belum diserahkan tidak otomatis menjadi penjualan.
11. Pembayaran DP harus dibedakan dari pendapatan dan sisa piutang sesuai status pemenuhan transaksi.
12. Pengembalian barang harus menyesuaikan transaksi, stok, dan kewajiban pengembalian uang jika ada.
13. Sistem tidak boleh mengarang HPP atau keuntungan ketika data tidak lengkap.
14. Saldo kas tidak sama dengan keuntungan.
15. Semua perhitungan harus dapat ditelusuri ke transaksi sumber.

Untuk transaksi yang belum memiliki informasi cukup, sistem harus menampilkan bahwa perhitungan keuntungan belum lengkap.

---

# 17. OFFLINE-FIRST TECHNICAL ARCHITECTURE

## 17.1 Rekomendasi Teknologi

Frontend:
- React.
- TypeScript.
- Tailwind CSS.

Database lokal:
- IndexedDB.
- Dexie.js.

Offline:
- PWA.
- Service Worker.
- Cache aset aplikasi.

Ekspor:
- PDF.
- Excel.
- CSV.
- JSON backup dan restore.

## 17.2 Arsitektur

- Tidak memerlukan backend untuk versi pertama.
- Tidak memerlukan cloud database.
- Tidak memerlukan autentikasi.
- Tidak memerlukan API eksternal untuk fungsi inti.
- Data utama disimpan secara lokal.
- Modul menggunakan batas tanggung jawab yang jelas.
- Transaksi database harus mendukung operasi atomik untuk perubahan kas, stok, penjualan, dan piutang.

## 17.3 Penyimpanan Data

Data inti yang perlu disiapkan:
- BusinessSettings.
- FundAllocations.
- Transactions.
- TransactionCategories.
- Products.
- StockMovements.
- Customers.
- Orders.
- Sales.
- SalesItems.
- Invoices.
- InvoiceItems.
- Payments.
- Receivables.
- Employees.
- SalaryRecords.
- Suppliers.
- Payables.
- ModuleSettings.
- AuditLogs.

Struktur akhir harus dirancang secara teknis sebelum implementasi. Daftar tersebut merupakan kebutuhan entitas, bukan kewajiban membuat satu tabel untuk setiap nama.

## 17.4 Perangkat

Versi pertama:
- Satu perangkat utama.
- Backup dan restore manual.
- Tidak ada sinkronisasi otomatis antarperangkat.

## 17.5 Keamanan Data

- Validasi input.
- Pencegahan transaksi ganda.
- Operasi database yang konsisten.
- Konfirmasi penghapusan.
- Riwayat koreksi.
- Backup.
- Restore.
- Opsi backup terenkripsi.
- Tidak mengirim data usaha ke server eksternal.

Pengguna harus diberi tahu bahwa data lokal dapat hilang apabila perangkat atau penyimpanan browser rusak atau dihapus.

---

# 18. NON-FUNCTIONAL REQUIREMENTS

## 18.1 Performance

- Aplikasi ringan.
- Navigasi responsif.
- Database mampu menangani transaksi usaha dalam jumlah wajar.
- Dashboard tidak boleh menghitung ulang seluruh data secara tidak efisien pada setiap interaksi.

## 18.2 Usability

- Bahasa Indonesia sederhana.
- Tampilan mobile-first.
- Input nominal Rupiah.
- Formulir sesingkat mungkin.
- Penjelasan istilah keuangan.
- Konfirmasi transaksi penting.
- Pencarian pelanggan mudah digunakan.

## 18.3 Reliability

- Data tetap tersimpan setelah aplikasi ditutup secara normal.
- Transaksi tidak boleh setengah tersimpan.
- Backup dan restore harus teruji.
- Modul nonaktif tidak boleh merusak data.
- Kegagalan penyimpanan harus ditampilkan secara jelas.
- Perhitungan saldo dan piutang harus konsisten.

---

# 19. SCOPE MVP DAN PRIORITAS

## 19.1 Prioritas P0 – Fondasi Wajib

- Dashboard.
- Pengaturan usaha.
- Saldo awal.
- Pemasukan.
- Pengeluaran.
- Pengambilan pemilik.
- Database lokal.
- Sistem modular.
- Backup dan restore.

## 19.2 Prioritas P1 – Operasional dan Penjualan

- Produk.
- Stok.
- Penjualan.
- Pelanggan manual.
- Pesanan.
- Nota digital.
- Penjualan kredit.
- Pembayaran bertahap.
- Buku piutang.
- Laporan penjualan dan piutang.

## 19.3 Prioritas P2 – Manajemen Lanjutan

- Karyawan.
- Gaji.
- Utang pemasok.
- Pemasok.
- Anggaran.
- Target tabungan.
- Aset.
- Laporan lanjutan.
- Batas kredit pelanggan.

Seluruh fitur P1 dan P2 tetap opsional dari sisi penggunaan. Prioritas implementasi tidak berarti semua modul harus diaktifkan oleh pengguna.

## 19.4 Tidak Termasuk Versi Pertama

- AI.
- Chatbot.
- Cloud synchronization.
- Multi-user.
- Login dan registrasi.
- Integrasi bank.
- Payment gateway.
- Integrasi WhatsApp otomatis.
- Barcode scanner.
- POS hardware.
- Pajak otomatis.
- Payroll kompleks.
- Integrasi marketplace.
- Multi-cabang.
- Prediksi penjualan otomatis.

---

# 20. DEVELOPMENT ROADMAP

## Phase 0 – Product and Technical Foundation
- Finalisasi PRD.
- Desain arsitektur.
- Desain database.
- Desain sistem modular.
- Desain financial logic.
- UI/UX prototype.
- Acceptance criteria.

## Phase 1 – Application Foundation
- Setup proyek.
- React dan TypeScript.
- IndexedDB.
- PWA.
- Navigasi.
- Dashboard dasar.

## Phase 2 – Financial Core
- Saldo awal.
- Alokasi dana.
- Pemasukan.
- Pengeluaran.
- Pengambilan pemilik.
- Riwayat transaksi.

## Phase 3 – Modular System
- Katalog modul.
- Aktivasi modul.
- Penonaktifan modul.
- Dependency management.
- Penyimpanan konfigurasi.

## Phase 4 – Products and Inventory
- Produk.
- Stok.
- Stok masuk dan keluar.
- Penyesuaian stok.
- Riwayat stok.

## Phase 5 – Customers, Orders and Sales
- Identifikasi pelanggan manual.
- Profil pelanggan.
- Pesanan.
- Penjualan.
- Pengurangan stok.
- Integrasi transaksi.

## Phase 6 – Digital Invoice and Receivables
- Nota digital.
- Nomor nota unik.
- Pembayaran tunai dan kredit.
- Pembayaran bertahap.
- Buku piutang.
- Jatuh tempo.
- Laporan umur piutang.
- Ekspor PDF.

## Phase 7 – Employees and Business Operations
- Karyawan.
- Gaji.
- Utang.
- Pemasok.
- Anggaran.
- Target.
- Aset.

## Phase 8 – Reports and Reliability
- Laporan keuangan.
- Laporan penjualan.
- Laporan piutang.
- Ekspor.
- Backup.
- Restore.
- Pengujian offline.
- Pengujian konsistensi.
- Dokumentasi.

Setiap fase harus memiliki pengujian dan kriteria penerimaan sebelum dinyatakan selesai.

---

# 21. ACCEPTANCE CRITERIA

Aplikasi dinyatakan memenuhi persyaratan jika:

1. Aplikasi dapat digunakan tanpa akun.
2. Aplikasi dapat berjalan offline setelah instalasi awal.
3. Saldo awal dapat diatur.
4. Alokasi dana tidak menyebabkan penghitungan ganda.
5. Pengguna dapat mencatat transaksi keuangan.
6. Pengeluaran pribadi dapat dipisahkan.
7. Modul dapat ditambahkan dan dinonaktifkan.
8. Data tidak hilang ketika modul dinonaktifkan.
9. Produk dan stok dapat dikelola.
10. Penjualan berbasis produk dapat memperbarui stok dengan benar.
11. Pengguna dapat mengetik nama pelanggan secara manual.
12. Sistem dapat menawarkan pelanggan yang sudah terdaftar.
13. Pengguna dapat mengonfirmasi pembuatan pelanggan baru.
14. Pesanan dapat dicatat tanpa otomatis menjadi penjualan.
15. Nota digital memiliki nomor unik.
16. Penjualan kredit menghasilkan piutang yang benar.
17. Pembayaran sebagian memperbarui sisa piutang.
18. Pelunasan tidak mencatat penjualan dua kali.
19. Jatuh tempo dan piutang terlambat dapat dipantau.
20. Pembatalan dan koreksi transaksi memiliki jejak perubahan.
21. Laporan mencerminkan transaksi yang benar.
22. Backup dan restore berfungsi.
23. Aplikasi tetap dapat digunakan offline.
24. Kesalahan input ditangani dengan pesan yang jelas.

---

# 22. PRODUCT SUCCESS METRICS

Indikator keberhasilan:
- Pengguna dapat menyelesaikan setup awal.
- Pengguna dapat mencatat transaksi pertama.
- Pengguna memahami saldo dan kondisi usaha.
- Pengguna dapat membuat nota.
- Pengguna dapat mencatat pelanggan tanpa proses registrasi rumit.
- Pengguna dapat mengetahui piutang pelanggan.
- Pengguna menggunakan aplikasi secara berulang.
- Pengguna berhasil melakukan backup dan restore.
- Pengguna bersedia merekomendasikan atau membayar produk.

Validasi komersial:
- Apakah UMKM benar-benar membutuhkan pencatatan digital ini?
- Apakah fitur nota dan piutang merupakan kebutuhan utama?
- Apakah pengguna bersedia membayar?
- Seberapa mudah aplikasi dibandingkan buku catatan atau spreadsheet?
- Modul mana yang paling sering digunakan?

---

# 23. RISIKO DAN MITIGASI

| Risiko | Mitigasi |
|---|---|
| Data lokal hilang | Backup dan restore |
| Pengguna bingung | UI sederhana |
| Nama pelanggan duplikat | Pencarian dan konfirmasi |
| Piutang tidak akurat | Integrasi nota dan pembayaran |
| Penjualan dihitung dua kali | Referensi transaksi unik |
| Stok tidak konsisten | Transaksi database atomik |
| Keuntungan salah | Financial logic dan testing |
| Modul saling mengganggu | Arsitektur modular |
| Pengguna terlambat menagih | Jatuh tempo dan aging report |
| Aplikasi terlalu kompleks | Progressive disclosure |

---

# 24. PRODUCT GOVERNANCE

Prinsip yang harus dipertahankan tanpa persetujuan pemilik produk:

1. Tidak ada akun dan login pada versi pertama.
2. Offline-first.
3. Tidak ada AI pada versi pertama.
4. Semua modul bisnis tambahan opsional.
5. Pengguna mengontrol fitur yang diaktifkan.
6. Data utama tersimpan secara lokal.
7. Pengeluaran pribadi tidak dicampurkan dengan biaya usaha.
8. Penjualan, pembayaran, stok, dan piutang harus terintegrasi.
9. Tidak boleh ada penghitungan transaksi ganda.
10. Backup dan restore merupakan kebutuhan inti.
11. Keakuratan keuangan lebih penting daripada banyaknya fitur.
12. Tidak menambahkan fitur kompleks tanpa kebutuhan yang tervalidasi.

---

# 25. PENUTUP

UMKM Manager dirancang sebagai aplikasi pengelolaan usaha yang dapat dimulai dengan sangat sederhana, tetapi tetap mampu mendukung kebutuhan bisnis yang lebih kompleks.

Pemilik warung dapat menggunakan aplikasi hanya untuk mencatat saldo dan pengeluaran.

Pemilik toko grosir dapat menambahkan produk, stok, pelanggan, pesanan, nota digital, dan sistem kredit.

Pemilik usaha dengan karyawan dapat menambahkan modul karyawan dan gaji.

Semua pengguna menggunakan fondasi aplikasi yang sama, tetapi memiliki pengalaman yang berbeda berdasarkan modul yang mereka pilih.

**Tujuan akhirnya bukan membuat aplikasi dengan sebanyak mungkin fitur, tetapi membuat aplikasi yang hanya menampilkan dan menjalankan fitur yang benar-benar dibutuhkan setiap pengguna.**

**END OF PRD – VERSION 2.0**