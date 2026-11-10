# TRANSACTION RULES
## UMKM Manager

**Versi:** 1.0  
**Status:** Draft – Proposed Transaction Specification  
**Produk:** UMKM Manager V1  
**Referensi:** PRD v2.0, FINANCIAL_LOGIC.md, BUSINESS_RULES.md

---

# 1. Tujuan

Dokumen ini menetapkan aturan operasional dan perubahan data untuk seluruh transaksi UMKM Manager.

Setiap transaksi harus:
- Memiliki identitas unik.
- Memiliki status yang jelas.
- Memiliki hubungan dengan transaksi asal jika relevan.
- Menghasilkan perubahan keuangan dan persediaan yang konsisten.
- Tidak boleh diproses dua kali.
- Memiliki histori perubahan.
- Dapat ditelusuri kembali.

# 2. Struktur Umum Transaksi

Setiap transaksi utama minimal mempunyai:

| Informasi | Keterangan |
|---|---|
| Transaction ID | Identitas unik |
| Transaction Number | Nomor yang terlihat pengguna |
| Transaction Type | Jenis transaksi |
| Transaction Date | Tanggal kejadian |
| Created At | Waktu pencatatan |
| Updated At | Waktu perubahan terakhir |
| Status | Status transaksi |
| Reference ID | Referensi transaksi asal |
| Notes | Catatan |
| Total Amount | Nilai transaksi |
| Created By | Identitas pencatat jika kelak multi-user |

ID internal tidak boleh berubah.

Nomor transaksi yang sudah digunakan tidak boleh digunakan kembali.

# 3. Alur Pesanan

## 3.1 Membuat pesanan

Pengguna:
1. Membuka menu Pesanan.
2. Memilih atau mengetik nama pelanggan.
3. Memilih produk atau jasa.
4. Mengisi kuantitas.
5. Mengisi atau memeriksa harga.
6. Menambahkan diskon jika ada.
7. Mengisi catatan dan tanggal pengiriman jika diperlukan.
8. Menyimpan pesanan.

Sistem:
- Membuat Order ID.
- Membuat nomor pesanan.
- Menghitung total pesanan.
- Menyimpan detail barang.
- Mengatur status awal.

Status awal: `WAITING_CONFIRMATION`.

## 3.2 Perubahan status pesanan

<escape>
WAITING_CONFIRMATION
        |
        v
PROCESSING
        |
        v
READY
        |
        v
IN_DELIVERY
        |
        v
COMPLETED
</escape>

Pesanan juga dapat berakhir dengan status `CANCELLED` sesuai aturan pembatalan.

Ketentuan:
- Perubahan status harus divalidasi.
- Sistem menyimpan histori status.
- Pesanan selesai tidak boleh kembali ke status awal melalui perubahan biasa.
- Koreksi pesanan selesai harus melalui mekanisme khusus.
- Pesanan yang belum diserahkan tidak otomatis menjadi pendapatan penjualan.

## 3.3 Pesanan dengan DP

Jika pelanggan membayar DP:
- Sistem membuat catatan penerimaan pembayaran.
- Pembayaran dikaitkan dengan pesanan.
- Sebelum barang diserahkan, DP dicatat sebagai uang muka pelanggan sesuai FINANCIAL_LOGIC.md.
- DP tidak otomatis dianggap pendapatan.
- Ketika pesanan diselesaikan, DP dialokasikan ke tagihan penjualan.

## 3.4 Pesanan dibatalkan

Jika pesanan belum memiliki pembayaran:
- Status menjadi `CANCELLED`.
- Tidak ada pendapatan penjualan.
- Tidak ada piutang penjualan.
- Tidak ada pengurangan stok penjualan.

Jika sudah menerima DP:
- Sistem menghitung saldo uang muka.
- Sistem meminta pengguna menentukan penyelesaian sesuai kebijakan pembatalan.
- Pengembalian uang dicatat sebagai refund uang muka.
- Jika terdapat biaya pembatalan yang sah, pencatatannya harus mengikuti aturan bisnis yang disetujui.
- Histori pesanan dan pembayaran tetap disimpan.

# 4. Konversi Pesanan Menjadi Penjualan

Konversi hanya dilakukan setelah barang diserahkan atau jasa diselesaikan.

Alur:
1. Pengguna membuka pesanan.
2. Pengguna memeriksa barang dan jumlah aktual yang diserahkan.
3. Sistem menampilkan ringkasan.
4. Pengguna mengonfirmasi penyelesaian.
5. Sistem membuat transaksi penjualan yang merujuk Order ID.
6. Sistem mengalokasikan DP yang sudah diterima.
7. Sistem membuat piutang untuk sisa yang belum dibayar.
8. Sistem mengurangi stok jika pelacakan stok aktif.
9. Sistem memperbarui status pesanan.

**Aturan penting:**
- Satu pesanan hanya boleh dikonversi sesuai jumlah yang belum pernah dikonversi.
- Pengulangan klik atau proses ulang tidak boleh membuat penjualan kedua.
- Penjualan harus mempunyai referensi ke pesanan asal.
- Jika terjadi pengiriman sebagian, hanya jumlah yang benar-benar diserahkan yang boleh dikonversi menjadi penjualan.
- Sisa pesanan tetap tercatat sebagai belum dipenuhi.

# 5. Penjualan Langsung

Penjualan langsung dapat dibuat tanpa pesanan sebelumnya.

Alur:
1. Pengguna membuka menu Penjualan.
2. Memilih produk atau jasa.
3. Mengisi jumlah.
4. Memasukkan pelanggan jika ada.
5. Memeriksa harga dan diskon.
6. Sistem menghitung total.
7. Pengguna menentukan metode pembayaran.
8. Pengguna mengonfirmasi transaksi.
9. Sistem menyimpan penjualan dan dampak terkait.

Penjualan tanpa profil pelanggan diperbolehkan untuk transaksi umum.

Jika pelanggan diisi, transaksi harus terhubung dengan Customer ID yang benar.

# 6. Pembayaran

Pembayaran adalah transaksi tersendiri yang harus memiliki referensi ke tagihan, penjualan, atau pesanan terkait.

Informasi pembayaran:
- Payment ID.
- Nomor pembayaran.
- Tanggal pembayaran.
- Nominal.
- Metode pembayaran.
- Akun penerima.
- Referensi transaksi.
- Catatan.

Metode pembayaran dapat mencakup:
- Tunai.
- Transfer bank.
- Dompet digital.
- Metode lainnya.

## 6.1 Pembayaran penuh

Jika nilai tagihan Rp1.000.000 dan pembayaran Rp1.000.000:
- Status pembayaran menjadi `PAID`.
- Sisa tagihan Rp0.

## 6.2 Pembayaran sebagian

Jika tagihan Rp1.000.000 dan pembayaran Rp300.000:
- Total pembayaran Rp300.000.
- Sisa tagihan Rp700.000.
- Status pembayaran menjadi `PARTIALLY_PAID`.

## 6.3 Pelunasan

Jika pelanggan kemudian membayar Rp700.000:
- Total pembayaran menjadi Rp1.000.000.
- Sisa tagihan menjadi Rp0.
- Status menjadi `PAID`.

Pembayaran pelunasan tidak membuat pendapatan penjualan baru.

## 6.4 Pembayaran berlebih

Jika tagihan Rp1.000.000 dan pelanggan membayar Rp1.100.000:
- Sistem tidak boleh diam-diam menghilangkan kelebihan Rp100.000.
- Sistem harus meminta penentuan perlakuan kelebihan.
- Kelebihan dapat menjadi saldo kredit pelanggan atau dikembalikan.
- Jika menjadi saldo kredit, pengguna harus dapat melihat dan mengalokasikannya ke tagihan lain.
- Jika dikembalikan, refund harus memiliki referensi pembayaran asal.

## 6.5 Pembayaran dengan beberapa metode

Satu tagihan boleh dibayar menggunakan beberapa metode.

Contoh:
- Tunai Rp300.000.
- Transfer Rp700.000.

Total pembayaran Rp1.000.000.

Sistem harus menyimpan masing-masing bagian pembayaran secara terpisah, tetapi menghubungkannya dengan tagihan yang sama.

# 7. Status Pembayaran

Status pembayaran tidak boleh dicampur dengan status pesanan atau status penjualan.

Status:
- `UNPAID`
- `PARTIALLY_PAID`
- `PAID`
- `OVERPAID` jika kelebihan pembayaran diperbolehkan dan belum diselesaikan.

Status keterlambatan dapat menjadi indikator terpisah:
- `NOT_DUE`
- `OVERDUE`

Status tagihan yang sudah lunas tidak boleh berubah hanya karena tanggal jatuh tempo telah lewat.

# 8. Nota Digital

Nota dibuat dari transaksi penjualan yang sudah valid.

Alur:
1. Penjualan disimpan.
2. Sistem membuat nomor nota.
3. Sistem menghasilkan tampilan nota.
4. Pengguna dapat membuat PDF.
5. Pengguna dapat mencetak atau membagikan nota.

Jika nota dikoreksi:
- Sistem menyimpan versi atau histori koreksi.
- Nilai transaksi harus mengikuti transaksi yang sudah dikoreksi secara sah.
- Nota lama tidak boleh berubah tanpa jejak.

Nota tidak boleh menghasilkan transaksi penjualan atau pembayaran baru hanya karena PDF dibuat, dicetak, atau dibagikan.

# 9. Piutang

Piutang dibuat dari penjualan yang telah diakui dan belum dibayar penuh.

Alur:
1. Penjualan diselesaikan.
2. Sistem menghitung jumlah yang telah dibayar.
3. Sistem menghitung sisa tagihan.
4. Sistem mencatat piutang.
5. Sistem menghubungkan piutang ke pelanggan dan nota.

Rumus:

`Piutang = Nilai tagihan - Pembayaran yang dialokasikan`

Piutang harus memiliki:
- Customer ID.
- Invoice ID.
- Nilai awal.
- Saldo tersisa.
- Tanggal jatuh tempo.
- Status.

Jika pengguna mencatat pembayaran, sistem memperbarui saldo piutang secara atomik.

# 10. Pembelian dan Penerimaan Stok

Pembelian persediaan dapat dilakukan tunai atau kredit.

Alur:
1. Pengguna memilih pemasok jika tersedia.
2. Pengguna memasukkan barang.
3. Pengguna mengisi jumlah.
4. Pengguna mengisi harga perolehan.
5. Pengguna mengonfirmasi penerimaan barang.
6. Sistem mencatat pembelian.
7. Sistem menambah persediaan.
8. Sistem mencatat kas keluar atau utang pemasok sesuai metode pembayaran.

Jika barang belum diterima, pembelian tidak boleh otomatis menambah stok tersedia.

Penerimaan sebagian harus mencatat jumlah aktual yang diterima.

# 11. Pembayaran Utang Pemasok

Alur:
1. Pengguna membuka daftar utang.
2. Memilih kewajiban pemasok.
3. Mengisi nominal pembayaran.
4. Memilih akun pengeluaran.
5. Mengonfirmasi pembayaran.

Dampak:
- Kas berkurang sebesar pembayaran.
- Utang berkurang sebesar pembayaran.
- Pembayaran tidak menciptakan beban pembelian kedua kali.

Pembayaran sebagian harus didukung.

# 12. Retur Penjualan

Retur harus terhubung dengan penjualan asal.

Alur:
1. Pengguna memilih transaksi asal.
2. Memilih produk yang dikembalikan.
3. Memasukkan jumlah.
4. Memilih kondisi barang.
5. Memilih penyelesaian.
6. Mengonfirmasi retur.

Penyelesaian dapat berupa:
- Pengembalian uang.
- Pengurangan piutang.
- Saldo kredit pelanggan.
- Penggantian barang.

Aturan:
- Jumlah retur tidak boleh melebihi jumlah yang belum pernah diretur.
- Barang rusak tidak otomatis masuk stok layak jual.
- Barang layak jual dapat dikembalikan ke stok.
- HPP dikoreksi sesuai nilai persediaan barang yang kembali.
- Pendapatan dikoreksi melalui retur penjualan.
- Refund harus terhubung dengan retur asal.
- Retur tidak boleh menciptakan penjualan baru.

# 13. Refund

Refund adalah pengembalian uang kepada pelanggan.

Setiap refund harus:
- Memiliki Refund ID.
- Terhubung dengan pembayaran atau transaksi asal.
- Memiliki nominal.
- Memiliki alasan.
- Memiliki tanggal.
- Memiliki akun sumber dana.

Sistem tidak boleh mengembalikan uang lebih dari jumlah yang dapat dikembalikan berdasarkan transaksi terkait tanpa proses persetujuan khusus.

Refund harus mengurangi saldo kewajiban refund atau mengoreksi penerimaan sebelumnya sesuai konteksnya.

# 14. Pembatalan Penjualan

Penjualan yang belum diselesaikan dapat dibatalkan tanpa mengakui pendapatan.

Penjualan yang sudah selesai tidak boleh dihapus.

Untuk penjualan selesai:
- Gunakan retur atau pembalikan transaksi sesuai keadaan.
- Periksa pembayaran yang telah diterima.
- Periksa stok yang telah keluar.
- Periksa piutang.
- Periksa nota.
- Simpan alasan pembatalan atau koreksi.

Sistem tidak boleh menghapus histori demi membuat saldo kembali seolah transaksi tidak pernah terjadi.

# 15. Koreksi Transaksi

Koreksi digunakan ketika terdapat kesalahan pada transaksi yang sudah tercatat.

Contoh:
- Salah jumlah barang.
- Salah harga.
- Salah pelanggan.
- Salah metode pembayaran.
- Salah tanggal.
- Salah akun kas.

Aturan:
- Koreksi harus memiliki alasan.
- Nilai lama harus dapat ditelusuri.
- Nilai baru harus tercatat.
- Dampak ke stok dan keuangan harus disesuaikan.
- Koreksi tidak boleh menghasilkan dampak ganda.
- Koreksi transaksi yang sudah memengaruhi laporan harus melalui mekanisme pembalikan dan pencatatan pengganti sesuai aturan.

# 16. Penyesuaian Stok

Penyesuaian stok digunakan untuk memperbaiki selisih antara catatan dan kondisi fisik.

Alasan:
- Barang rusak.
- Barang hilang.
- Selisih penghitungan.
- Barang digunakan sendiri.
- Kesalahan pencatatan sebelumnya.

Setiap penyesuaian harus memiliki:
- Product ID.
- Jumlah sebelum.
- Jumlah sesudah.
- Selisih.
- Alasan.
- Tanggal.
- Nilai penyesuaian jika berdampak pada laporan.

Penyesuaian stok tidak boleh digunakan untuk menyamarkan penjualan.

# 17. Pengeluaran dan Pembayaran Operasional

Pengeluaran langsung:
1. Pengguna memilih kategori.
2. Memasukkan nominal.
3. Memilih akun pembayaran.
4. Mengisi tanggal dan keterangan.
5. Mengonfirmasi.

Jika pengeluaran merupakan pembayaran kewajiban yang sudah diakui, pembayaran harus terhubung dengan kewajiban asal agar beban tidak dicatat dua kali.

# 18. Penggajian

Alur:
1. Pengguna memilih karyawan.
2. Memilih periode.
3. Memasukkan komponen gaji.
4. Sistem menghitung total.
5. Pengguna mengonfirmasi.
6. Sistem mencatat kewajiban gaji atau pembayaran langsung sesuai kebijakan.
7. Pembayaran dicatat dan dihubungkan dengan catatan gaji.

Satu periode penggajian tidak boleh menghasilkan pembayaran ganda secara tidak sengaja.

# 19. Pengambilan Pemilik

Alur:
1. Pengguna memilih Pengambilan Pemilik.
2. Mengisi nominal.
3. Memilih akun kas.
4. Menambahkan keterangan.
5. Mengonfirmasi.

Dampak:
- Kas berkurang.
- Ekuitas pemilik berkurang melalui pencatatan pengambilan.
- Beban operasional tidak bertambah.
- Laba tidak berubah.

# 20. Transfer Internal

Alur:
1. Memilih akun asal.
2. Memilih akun tujuan.
3. Mengisi nominal.
4. Mengisi biaya transfer jika ada.
5. Mengonfirmasi.

Aturan:
- Akun asal berkurang.
- Akun tujuan bertambah.
- Total kas usaha tidak berubah kecuali biaya transfer.
- Transfer tidak dicatat sebagai pendapatan atau pengeluaran operasional.

# 21. Mekanisme Pencegahan Transaksi Ganda

Setiap operasi yang dapat menghasilkan dampak keuangan harus memiliki mekanisme idempotensi.

Contoh:
- Klik tombol simpan dua kali tidak membuat dua penjualan.
- Pengulangan permintaan pembayaran tidak menggandakan pembayaran.
- Konversi pesanan tidak membuat dua penjualan.
- Pemrosesan ulang transaksi tidak mengurangi stok dua kali.
- Pemulihan data tidak memproses ulang transaksi yang sama.

Implementasi harus menggunakan identitas operasi yang unik dan pemeriksaan konsistensi data.

# 22. Transaksi Atomik

Operasi yang saling berhubungan harus berhasil seluruhnya atau gagal seluruhnya.

Contoh penjualan:
- Menyimpan penjualan.
- Menyimpan detail produk.
- Mengurangi stok.
- Mencatat pembayaran.
- Memperbarui piutang.
- Membuat referensi nota.

Jika salah satu proses penting gagal, sistem harus membatalkan seluruh perubahan yang termasuk dalam satu transaksi database.

Tidak boleh terjadi keadaan penjualan tersimpan tetapi stok tidak diperbarui, atau pembayaran tersimpan tetapi piutang tidak berubah.

# 23. Audit Trail

Perubahan penting harus mempunyai catatan:

- Entitas yang diubah.
- ID entitas.
- Jenis tindakan.
- Waktu tindakan.
- Nilai sebelum.
- Nilai sesudah.
- Alasan.
- Referensi transaksi terkait.

Audit trail tidak boleh dihapus melalui antarmuka biasa.

# 24. Aturan Tanggal dan Periode

Sistem harus membedakan:
- Tanggal kejadian transaksi.
- Waktu transaksi dicatat.
- Tanggal jatuh tempo.
- Tanggal pembayaran.

Transaksi yang dimasukkan terlambat tidak boleh otomatis dianggap terjadi pada tanggal pencatatan.

Laporan harus menggunakan tanggal yang sesuai dengan jenis laporan.

Perubahan tanggal transaksi historis harus memiliki jejak koreksi.

# 25. Kegagalan dan Pemulihan

Jika penyimpanan gagal:
- Jangan menampilkan transaksi sebagai berhasil.
- Jangan mengubah saldo sebagian.
- Jangan mengurangi stok sebagian.
- Berikan pesan kesalahan.
- Izinkan pengguna mencoba ulang secara aman.

Jika aplikasi tertutup saat penyimpanan:
- Sistem harus memulihkan kondisi konsisten.
- Operasi yang belum selesai tidak boleh dianggap berhasil.
- Sistem harus mencegah duplikasi ketika pengguna mencoba ulang.

---

# 26. Acceptance Checks Awal

Berikut pemeriksaan minimum untuk implementasi:

| Kasus | Hasil yang wajib |
|---|---|
| Pesanan belum diserahkan | Belum menjadi pendapatan |
| DP sebelum penyerahan | Menjadi uang muka |
| Pesanan dikonversi | Satu penjualan saja |
| Pembayaran sebagian | Piutang berkurang sesuai pembayaran |
| Pelunasan | Piutang menjadi nol |
| Pembayaran diulang | Tidak ada pembayaran ganda |
| Retur barang | Stok dan keuangan dikoreksi |
| Refund | Terhubung dengan pembayaran asal |
| Pembelian kredit | Persediaan dan utang bertambah |
| Pembayaran utang | Utang berkurang tanpa beban ganda |
| Transfer internal | Bukan pendapatan atau beban |
| Pengambilan pemilik | Bukan beban operasional |
| Transaksi gagal | Tidak ada perubahan parsial |

---

# 27. Keputusan yang Masih Memerlukan Persetujuan

1. Apakah penjualan dari pesanan boleh dilakukan secara bertahap? Rekomendasi: ya.
2. Apakah retur dapat dilakukan sebagian? Rekomendasi: ya.
3. Apakah pengembalian barang rusak otomatis menambah stok? Rekomendasi: tidak.
4. Apakah pembayaran berlebih menjadi saldo kredit pelanggan secara default? Rekomendasi: pengguna harus memilih.
5. Apakah transaksi yang sudah masuk periode laporan dapat dikoreksi langsung? Rekomendasi: gunakan mekanisme koreksi yang mempertahankan histori.
6. Apakah transaksi penjualan boleh diedit setelah pembayaran diterima? Rekomendasi: tidak secara langsung; gunakan koreksi.
7. Apakah satu pembayaran dapat dialokasikan ke beberapa nota? Rekomendasi: dapat dipertimbangkan, tetapi perlu aturan alokasi dan pelacakan yang eksplisit.
8. Apakah pesanan dengan pengiriman sebagian tetap aktif sampai seluruh barang diserahkan? Rekomendasi: ya.

---

**Ketentuan akhir:** Dokumen ini harus diimplementasikan bersama FINANCIAL_LOGIC.md dan BUSINESS_RULES.md. Semua aturan yang belum disetujui harus ditandai sebagai keputusan terbuka dan tidak boleh diputuskan sendiri oleh developer.
# TRANSACTION_RULES.md

**UMKM Manager — Transaction Rules**  
Version: 1.1  
Status: Draft – Audit Revision  
Approval: Pending Product Owner Approval

## 1. Tujuan

Menentukan alur transaksi dan perubahan status agar transaksi tidak tercatat ganda, saldo tetap benar, dan histori dapat ditelusuri.

## 2. Aturan umum

- Setiap transaksi memiliki ID internal unik.
- Setiap operasi posting memiliki kunci idempotensi.
- Perubahan terkait satu transaksi harus atomik.
- Kegagalan harus membatalkan seluruh perubahan terkait.
- Transaksi yang sudah diposting tidak dihapus langsung.
- Koreksi harus merujuk transaksi asal.
- Nomor invoice/nota harus unik dalam satu instalasi usaha.
- Tanggal transaksi dan waktu pencatatan harus dibedakan jika diperlukan untuk audit.

## 3. Alur pesanan

Status operasional:
`WAITING_CONFIRMATION → PROCESSING → READY → SHIPPED → COMPLETED`

Status tambahan:
- `CANCELLED`
- Status pemenuhan sebagian jika kebijakan tersebut disetujui.

Aturan:
1. Membuat pesanan tidak otomatis membuat penjualan.
2. Mengubah status operasional tidak otomatis mencatat pembayaran.
3. Pesanan yang dibatalkan sebelum pemenuhan tidak menghasilkan penjualan.
4. Riwayat perubahan status disimpan.
5. Pemenuhan barang harus mencatat kuantitas yang benar-benar diserahkan.

**Usulan – Menunggu Persetujuan:** pesanan dapat dipenuhi sebagian. Setiap pemenuhan dicatat sebagai peristiwa terpisah, dan hanya kuantitas yang dipenuhi yang masuk penjualan.

## 4. DP pesanan

**Usulan – Menunggu Persetujuan:**
1. DP diterima sebelum pemenuhan dicatat sebagai kewajiban pelanggan.
2. DP terhubung dengan pesanan dan pembayaran.
3. Ketika pemenuhan terjadi, bagian DP yang sesuai dialokasikan ke penjualan.
4. Pembatalan memerlukan keputusan refund, saldo kredit, atau perlakuan lain yang disetujui.
5. DP tidak boleh diakui sebagai pendapatan dua kali.

## 5. Konversi pesanan menjadi penjualan

Ketika barang/jasa dipenuhi:
1. Validasi pesanan dan kuantitas yang diserahkan.
2. Pastikan item, harga, diskon, dan biaya tambahan valid.
3. Buat transaksi penjualan untuk kuantitas yang dipenuhi.
4. Buat invoice atau dokumen penjualan terkait.
5. Terapkan DP yang sudah diterima sesuai alokasi.
6. Hitung sisa tagihan.
7. Jika modul persediaan aktif, catat pengeluaran stok dan HPP satu kali.
8. Buat jurnal keuangan sesuai `FINANCIAL_LOGIC.md`.
9. Simpan hubungan pesanan, pemenuhan, penjualan, invoice, pembayaran, stok, dan jurnal.

Semua langkah harus berhasil atau dibatalkan sebagai satu operasi atomik, atau menggunakan mekanisme pemulihan yang menjamin tidak ada kondisi setengah selesai.

## 6. Penjualan langsung

Penjualan langsung dapat dibuat tanpa pesanan.

Alur:
1. Masukkan item dan kuantitas.
2. Pilih atau masukkan pelanggan jika diperlukan.
3. Validasi harga, diskon, dan stok bila dikelola.
4. Tentukan metode pembayaran.
5. Posting penjualan.
6. Buat invoice/nota.
7. Catat pengurangan stok dan HPP jika modul persediaan aktif.
8. Catat jurnal.
9. Tampilkan hasil transaksi.

**Usulan – Menunggu Persetujuan:** pelanggan tidak wajib untuk penjualan langsung.

## 7. Pembayaran

Satu invoice dapat menerima beberapa pembayaran.

Setiap pembayaran memuat:
- ID pembayaran.
- Tanggal.
- Jumlah.
- Metode pembayaran.
- Referensi transaksi bila ada.
- Alokasi ke invoice.
- Catatan.
- Status.

Status invoice:
- `UNPAID`
- `PARTIALLY_PAID`
- `PAID`
- `CANCELLED`

Aturan:
1. Pembayaran tidak menciptakan penjualan baru.
2. Setiap pembayaran hanya dapat diposting satu kali.
3. Pembayaran sebagian mengurangi piutang sesuai nilai yang dialokasikan.
4. Pembayaran penuh menyelesaikan saldo invoice.
5. Pembayaran dengan beberapa metode harus memiliki rincian per metode.
6. Pembatalan pembayaran yang sudah diposting menggunakan reversal/koreksi, bukan penghapusan langsung.

## 8. Alokasi pembayaran

**Usulan – Menunggu Persetujuan:** satu pembayaran dapat dialokasikan ke beberapa invoice.

Aturan yang harus diterapkan jika disetujui:
- Total alokasi tidak boleh melebihi nilai pembayaran.
- Total alokasi ke invoice tidak boleh melebihi saldo yang masih dapat ditagih.
- Sisa pembayaran yang belum dialokasikan dicatat sebagai kredit pelanggan/kewajiban.
- Perubahan alokasi harus tercatat dalam audit log.
- Alokasi ulang tidak boleh menghasilkan kas atau pendapatan baru.

## 9. Kelebihan pembayaran

**Usulan – Menunggu Persetujuan:**
- Kelebihan pembayaran tidak otomatis menjadi pendapatan.
- Sistem menyimpan saldo kredit pelanggan.
- Pengguna dapat memilih alokasi ke invoice lain atau refund.
- Refund harus menjadi transaksi tersendiri.
- Saldo kredit harus dapat direkonsiliasi dengan pembayaran asal.

## 10. Invoice

Invoice dibuat dari penjualan yang telah memenuhi kriteria pengakuan.

Invoice menyimpan snapshot:
- Nama dan informasi pelanggan pada waktu transaksi.
- Item, kuantitas, satuan, dan harga.
- Diskon dan biaya tambahan.
- Total.
- Pembayaran dan alokasi.
- Sisa tagihan.
- Jatuh tempo.
- Status.

Perubahan profil pelanggan tidak boleh mengubah histori invoice yang telah diterbitkan.

Invoice yang sudah dibayar atau diposting tidak boleh dihapus langsung.

## 11. Pembelian dan penerimaan stok

Alur pembelian:
1. Buat transaksi pembelian.
2. Catat pemasok bila ada.
3. Catat item dan kuantitas.
4. Catat biaya perolehan.
5. Ketika barang diterima, catat penerimaan stok.
6. Hitung nilai persediaan dan biaya rata-rata sesuai metode yang disetujui.
7. Catat pembayaran atau utang pemasok.
8. Simpan hubungan pembelian, penerimaan, stok, pembayaran, dan jurnal.

Pembayaran utang tidak boleh menciptakan biaya kedua.

Penerimaan barang dan pembayaran harus menjadi peristiwa yang dapat dibedakan.

## 12. Pembayaran pemasok

- Pembayaran mengurangi kas/bank.
- Pembayaran mengurangi utang yang dialokasikan.
- Pembayaran cicilan diperbolehkan jika disetujui.
- Satu pembayaran tidak boleh diproses dua kali.
- Kelebihan pembayaran pemasok harus dicatat sebagai saldo uang muka/kredit pemasok, bukan biaya otomatis.

## 13. Retur penjualan

Alur:
1. Pilih transaksi penjualan asal.
2. Pilih item dan kuantitas retur.
3. Validasi bahwa kuantitas retur tidak melebihi kuantitas bersih yang terjual.
4. Catat alasan dan kondisi barang.
5. Hitung nilai retur sesuai aturan harga dan diskon transaksi asal.
6. Tentukan apakah barang layak jual, rusak, atau perlu pemeriksaan.
7. Buat koreksi penjualan/piutang/kas sesuai kondisi.
8. Catat stok hanya sesuai kondisi barang.
9. Buat jurnal koreksi.
10. Simpan hubungan retur dengan transaksi asal.

Retur sebagian harus didukung apabila disetujui.

## 14. Refund pelanggan

- Refund harus merujuk ke pembayaran atau transaksi terkait.
- Refund mengurangi kas/bank.
- Refund tidak boleh menciptakan biaya atau penjualan baru secara keliru.
- Refund terhadap DP sebelum pemenuhan menyelesaikan kewajiban DP sesuai jumlah yang dikembalikan.
- Refund harus memiliki ID unik dan audit trail.

## 15. Pembatalan dan koreksi

- Transaksi draft dapat dibatalkan tanpa jurnal jika belum diposting.
- Transaksi yang sudah diposting dikoreksi dengan reversal atau transaksi koreksi.
- Histori transaksi asli tetap tersedia.
- Koreksi harus memiliki alasan, tanggal, dan referensi transaksi asal.
- Koreksi tidak boleh membuat stok, kas, piutang, atau utang berubah dua kali.
- Periode yang sudah ditutup memerlukan prosedur koreksi periode yang disetujui.

## 16. Penyesuaian stok

Penyesuaian stok harus mencatat:
- Produk.
- Kuantitas sebelum.
- Kuantitas perubahan.
- Kuantitas sesudah.
- Alasan.
- Tanggal.
- Dampak nilai persediaan.
- Referensi transaksi bila ada.

Penyesuaian tidak boleh digunakan untuk menyamarkan transaksi penjualan atau pembelian.

**Usulan – Menunggu Persetujuan:** stok negatif ditolak secara default. Jika ada kebutuhan khusus, sistem harus meminta keputusan eksplisit dan menandai dampak terhadap HPP.

## 17. Biaya, payroll, modal, dan pengambilan pemilik

- Biaya operasional dicatat satu kali.
- Kewajiban payroll dipisahkan dari pembayaran payroll.
- Setoran modal bukan pendapatan.
- Pengambilan pemilik bukan biaya operasional.
- Transfer internal tidak memengaruhi laba.
- Setiap transaksi menyimpan akun kas/bank yang terpengaruh.

## 18. Idempotensi dan atomicity

Untuk setiap perintah posting:
- Gunakan idempotency key yang stabil.
- Retry dengan key yang sama tidak boleh membuat transaksi baru.
- Validasi seluruh prasyarat sebelum commit.
- Simpan transaksi dan seluruh efek terkait dalam satu transaksi database bila memungkinkan.
- Jika proses gagal, tidak boleh tersisa jurnal tanpa penjualan, pembayaran tanpa alokasi, atau stok berkurang tanpa transaksi sumber.
- Setelah restart, sistem harus dapat mendeteksi dan memulihkan operasi yang belum selesai.

## 19. Audit trail

Audit trail minimal menyimpan:
- ID entitas.
- Jenis tindakan.
- Nilai sebelum dan sesudah jika relevan.
- Waktu.
- Alasan koreksi.
- Referensi transaksi terkait.
- Versi skema/aplikasi bila relevan.

Audit trail tidak boleh dapat dihapus melalui operasi transaksi biasa.

## 20. Keputusan terbuka

| ID | Keputusan | Status |
|---|---|---|
| DEC-TRX-01 | Pemenuhan sebagian | Menunggu persetujuan |
| DEC-TRX-02 | Retur sebagian | Menunggu persetujuan |
| DEC-TRX-03 | Barang retur rusak tidak masuk stok siap jual | Direkomendasikan |
| DEC-TRX-04 | Kelebihan pembayaran menjadi kredit pelanggan | Menunggu persetujuan |
| DEC-TRX-05 | Koreksi transaksi periode lama melalui reversal | Menunggu persetujuan |
| DEC-TRX-06 | Transaksi terposting tidak boleh diedit langsung | Direkomendasikan |
| DEC-TRX-07 | Pembayaran lintas invoice | Menunggu persetujuan |
| DEC-TRX-08 | Sisa pesanan tetap aktif setelah pemenuhan sebagian | Menunggu persetujuan |
| DEC-TRX-09 | Refund DP ketika pesanan dibatalkan | Menunggu persetujuan |
| DEC-TRX-10 | Kebijakan pembayaran pemasok berlebih | Menunggu persetujuan |

## 21. Batasan implementasi

Dokumen ini merupakan draft revisi. OpenCode wajib melaporkan konflik, tidak boleh menebak kebijakan yang belum disetujui, dan tidak boleh mengimplementasikan aturan berstatus menunggu persetujuan tanpa otorisasi.