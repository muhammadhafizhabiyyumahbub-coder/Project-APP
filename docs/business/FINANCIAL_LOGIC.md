# FINANCIAL LOGIC
## UMKM Manager

**Versi:** 1.0 Draft  
**Status:** Proposed – Menunggu persetujuan pemilik produk  
**Berlaku untuk:** UMKM Manager V1  
**Tujuan:** Menjadi acuan tunggal seluruh perhitungan dan pencatatan keuangan aplikasi.

---

# 1. Prinsip Dasar

UMKM Manager harus membedakan lima hal:

1. **Kas:** uang yang benar-benar tersedia.
2. **Pendapatan:** nilai penjualan yang sudah diakui.
3. **Beban:** biaya usaha yang sudah terjadi.
4. **Piutang dan utang:** hak tagih dan kewajiban pembayaran.
5. **Laba:** selisih pendapatan dengan beban, termasuk HPP.

Saldo kas tidak boleh dianggap sebagai laba.

Setiap transaksi keuangan harus memiliki identitas unik, tanggal, nominal, kategori, sumber transaksi, dan riwayat perubahan.

Satu kejadian ekonomi hanya boleh menghasilkan satu pencatatan keuangan yang sesuai.

# 2. Struktur Keuangan

Aplikasi harus dapat membedakan kategori berikut.

| Kategori | Contoh |
|---|---|
| Modal pemilik | Setoran modal awal |
| Pendapatan | Penjualan barang |
| Beban operasional | Listrik, internet, sewa |
| HPP | Biaya perolehan barang yang terjual |
| Piutang | Penjualan yang belum dibayar |
| Utang | Pembelian barang secara kredit |
| Pengambilan pemilik | Uang usaha dipakai pribadi |
| Transfer internal | Pemindahan uang kas ke rekening |
| Aset usaha | Pembelian peralatan jangka panjang |

Kategori tersebut tidak boleh dicampur dalam laporan.

# 3. Modal dan Saldo Awal

Ketika pertama kali menggunakan aplikasi:

- Saldo awal dapat dimulai dari Rp0.
- Pengguna dapat memasukkan jumlah uang usaha yang benar-benar tersedia.
- Setoran pemilik dicatat sebagai modal, bukan pendapatan.
- Saldo awal kas dan saldo rekening dapat dimasukkan secara terpisah.
- Pengguna dapat mengalokasikan uang ke beberapa tempat penyimpanan atau pos dana.

Contoh:

Pemilik menyetor modal Rp10.000.000.

Dampak:
- Kas bertambah Rp10.000.000.
- Modal pemilik bertambah Rp10.000.000.
- Pendapatan tidak berubah.
- Laba tidak berubah.

Alokasi dana Rp3.000.000 ke pos operasional dari kas utama bukan pengeluaran. Itu hanya perpindahan alokasi internal.

# 4. Kas dan Transfer Internal

Aplikasi dapat memiliki beberapa akun atau tempat penyimpanan uang:

- Kas tunai.
- Rekening bank.
- Dompet digital.
- Kas operasional.
- Pos dana lainnya.

Aturan:
- Transfer antar-akun tidak dihitung sebagai pendapatan.
- Transfer antar-akun tidak dihitung sebagai beban.
- Total kekayaan kas tidak berubah karena transfer internal.
- Biaya administrasi transfer, jika ada, dicatat sebagai beban.
- Setiap transfer harus mempunyai akun asal dan tujuan.

Contoh:

Transfer Rp500.000 dari kas ke rekening bank.

Dampak:
- Kas tunai berkurang Rp500.000.
- Saldo bank bertambah Rp500.000.
- Total uang usaha tetap sama.
- Laba tidak berubah.

# 5. Penjualan

Penjualan dapat dilakukan melalui:

- Penjualan tunai.
- Penjualan dengan pembayaran sebagian.
- Penjualan kredit.
- Penjualan dengan pembayaran penuh setelah barang diserahkan.

Rekomendasi kebijakan pengakuan pendapatan:

Pendapatan penjualan diakui ketika barang atau jasa telah diserahkan atau kewajiban penjualan telah dipenuhi sesuai kebijakan usaha.

Pesanan yang masih menunggu konfirmasi, diproses, atau belum diserahkan tidak otomatis menjadi pendapatan.

Setiap penjualan mempunyai:
- Nomor transaksi.
- Tanggal transaksi.
- Data pelanggan jika tersedia.
- Daftar produk atau jasa.
- Kuantitas.
- Harga jual.
- Diskon.
- Total.
- Pembayaran.
- Sisa tagihan.
- Status transaksi.

Rumus:

Total kotor = jumlah (kuantitas × harga jual)

Total bersih = total kotor − diskon + biaya tambahan yang relevan

Sisa tagihan = total bersih − total pembayaran yang dialokasikan

# 6. Penjualan Tunai

Contoh:

Barang dijual Rp1.000.000 dan dibayar penuh secara tunai.

Dampak:
- Kas bertambah Rp1.000.000.
- Pendapatan penjualan bertambah Rp1.000.000.
- Piutang tidak bertambah.
- HPP dicatat sesuai biaya perolehan barang.

Pembayaran yang diterima tidak boleh dicatat sebagai pendapatan kedua kali.

# 7. Penjualan Kredit dan Piutang

Contoh:

Barang diserahkan dengan nilai penjualan Rp1.000.000. Pelanggan belum membayar.

Dampak:
- Pendapatan penjualan bertambah Rp1.000.000.
- Piutang bertambah Rp1.000.000.
- Kas tidak berubah.
- HPP dicatat sesuai biaya perolehan barang.

Jika pelanggan membayar Rp400.000 kemudian:

- Kas bertambah Rp400.000.
- Piutang berkurang Rp400.000.
- Pendapatan penjualan tidak bertambah lagi.

Sisa piutang menjadi Rp600.000.

Jika pelanggan kemudian membayar Rp600.000:
- Kas bertambah Rp600.000.
- Piutang menjadi Rp0.
- Status tagihan menjadi lunas.

Pembayaran harus terhubung ke tagihan atau piutang yang dibayar. Sistem harus mencegah pembayaran yang sama tercatat dua kali.

# 8. DP dan Uang Muka Pesanan

DP harus dibedakan dari pendapatan penjualan.

Rekomendasi kebijakan:

Jika pelanggan membayar DP sebelum barang diserahkan:
- Kas bertambah.
- Uang muka pelanggan atau kewajiban kontrak bertambah.
- Pendapatan belum diakui hanya karena DP diterima.

Ketika barang diserahkan:
- Pendapatan diakui sesuai nilai penjualan.
- Uang muka pelanggan dialokasikan ke tagihan.
- Sisa pembayaran menjadi piutang jika belum lunas.

Contoh:

Nilai pesanan Rp2.000.000. Pelanggan membayar DP Rp500.000 sebelum barang diserahkan.

Sebelum penyerahan:
- Kas bertambah Rp500.000.
- Uang muka pelanggan Rp500.000.
- Pendapatan penjualan belum diakui.

Setelah barang diserahkan:
- Pendapatan penjualan Rp2.000.000.
- Uang muka pelanggan Rp500.000 dialokasikan.
- Sisa piutang Rp1.500.000 jika belum dibayar.

Jika pesanan dibatalkan, pengembalian DP atau kompensasi harus mengikuti ketentuan pembatalan yang disepakati dan dicatat secara terpisah.

# 9. Produk, Persediaan, dan HPP

Persediaan harus dibedakan dari beban operasional.

Pembelian barang untuk dijual kembali bukan otomatis HPP pada saat pembelian. Biaya perolehan menjadi HPP ketika barang terjual.

Rekomendasi metode HPP awal: **rata-rata tertimbang bergerak (moving weighted average)** untuk produk yang menggunakan pelacakan stok.

Rumus:

Biaya rata-rata per unit = total nilai persediaan tersedia ÷ total unit tersedia.

HPP penjualan = kuantitas terjual × biaya rata-rata per unit.

Contoh:

- Stok awal 10 unit dengan total biaya Rp500.000.
- Pembelian 10 unit dengan total biaya Rp600.000.
- Total 20 unit dengan biaya Rp1.100.000.
- Biaya rata-rata per unit Rp55.000.
- Terjual 5 unit.

HPP = 5 × Rp55.000 = Rp275.000.

Sisa stok = 15 unit.

Aturan:
- Harga jual tidak boleh dipakai sebagai HPP.
- Pembelian stok menambah nilai persediaan.
- Penjualan mengurangi jumlah dan nilai persediaan.
- Penyesuaian stok harus memiliki alasan.
- Stok negatif sebaiknya dicegah secara default.
- Produk tanpa pelacakan stok tidak boleh menghasilkan pengurangan stok otomatis.
- Perubahan metode HPP tidak boleh mengubah histori secara diam-diam.

# 10. Diskon dan Biaya Tambahan

Diskon penjualan mengurangi nilai pendapatan yang diakui.

Biaya tambahan hanya masuk ke nilai transaksi apabila memang menjadi bagian dari harga yang dibebankan kepada pelanggan.

Sistem harus membedakan:
- Diskon per produk.
- Diskon keseluruhan transaksi.
- Biaya pengiriman yang dibebankan kepada pelanggan.
- Biaya operasional pengiriman yang ditanggung usaha.

Jangan menghitung diskon dua kali.

# 11. Pengeluaran dan Beban Operasional

Contoh beban:
- Listrik.
- Air.
- Internet.
- Sewa.
- Transportasi.
- Biaya pemasaran.
- Perlengkapan operasional.

Contoh:

Usaha membayar listrik Rp300.000.

Dampak:
- Kas berkurang Rp300.000.
- Beban listrik bertambah Rp300.000.
- Laba berkurang Rp300.000.

Pengeluaran pribadi pemilik tidak boleh dimasukkan sebagai beban operasional.

# 12. Pengambilan Pemilik

Jika pemilik mengambil uang dari kas usaha untuk kepentingan pribadi:

- Kas berkurang.
- Pengambilan pemilik bertambah.
- Beban operasional tidak berubah.
- Pendapatan tidak berubah.
- Laba tidak berubah.

Pengambilan pemilik harus memiliki tanggal, nominal, dan keterangan.

# 13. Pembelian dan Utang Pemasok

Pembelian dapat dilakukan tunai atau kredit.

Pembelian persediaan tunai:
- Kas berkurang.
- Persediaan bertambah.

Pembelian persediaan kredit:
- Persediaan bertambah.
- Utang pemasok bertambah.
- Kas belum berubah.

Ketika utang dibayar:
- Kas berkurang.
- Utang pemasok berkurang.
- Tidak boleh mencatat beban pembelian untuk kedua kalinya.

Pembelian barang yang langsung digunakan untuk operasional dapat dicatat sebagai beban sesuai kebijakan kategorinya.

# 14. Karyawan dan Penggajian

Gaji karyawan merupakan beban usaha.

Ketika gaji menjadi kewajiban:
- Beban gaji bertambah.
- Utang gaji dapat bertambah jika belum dibayar.

Ketika gaji dibayar:
- Kas berkurang.
- Utang gaji berkurang jika sebelumnya sudah diakui.

Jika gaji langsung dibayar saat jatuh tempo tanpa pencatatan utang terpisah, sistem tidak boleh mencatat beban dua kali.

Potongan, bonus, tunjangan, dan pinjaman karyawan harus memiliki aturan masing-masing sebelum diaktifkan.

# 15. Retur, Refund, dan Pembatalan

Sistem harus membedakan:

**Pembatalan sebelum transaksi selesai**
- Tidak mengakui pendapatan penjualan.
- Tidak mengakui HPP penjualan.
- DP yang sudah diterima harus diselesaikan sesuai aturan pengembalian.

**Retur setelah penjualan**
- Mengurangi pendapatan melalui akun retur penjualan.
- Mengembalikan barang ke persediaan jika barang layak dijual kembali.
- Membalik atau menyesuaikan HPP sesuai nilai persediaan barang yang kembali.
- Mengurangi piutang atau menghasilkan kewajiban refund sesuai kondisi pembayaran.

**Refund**
- Mengurangi kas jika uang benar-benar dikembalikan.
- Harus terhubung dengan transaksi asal.
- Tidak boleh menghasilkan pengeluaran operasional biasa yang menggandakan dampak retur.

Setiap pembatalan dan koreksi harus mempertahankan histori transaksi.

# 16. Piutang Tak Tertagih

Piutang yang belum dibayar tidak otomatis menjadi beban hanya karena melewati tanggal jatuh tempo.

Aplikasi harus menyediakan:
- Umur piutang.
- Status jatuh tempo.
- Catatan penagihan.
- Penandaan piutang bermasalah.

Penghapusan piutang harus melalui tindakan khusus, dengan alasan, nominal, tanggal, dan histori persetujuan.

# 17. Laporan Keuangan

Minimal laporan yang disediakan:

1. Ringkasan kas.
2. Pendapatan penjualan.
3. Beban operasional.
4. HPP.
5. Laba kotor.
6. Laba bersih berdasarkan kategori beban yang tercatat.
7. Daftar piutang.
8. Daftar utang.
9. Nilai persediaan.
10. Modal dan pengambilan pemilik.

Rumus dasar:

Laba kotor = pendapatan bersih penjualan − HPP

Laba bersih = laba kotor − beban operasional dan beban lain yang relevan

Laporan harus menyatakan jika data belum lengkap. Jangan menyajikan laba sebagai angka pasti jika HPP atau beban penting belum tercatat.

Laporan kas harus dipisahkan dari laporan laba rugi.

# 18. Ketentuan Integritas Data

Semua transaksi keuangan wajib memenuhi ketentuan:

- Memiliki ID unik.
- Memiliki tanggal transaksi dan waktu pencatatan.
- Memiliki sumber transaksi.
- Memiliki hubungan ke dokumen asal.
- Tidak boleh diproses dua kali.
- Memiliki riwayat koreksi.
- Menggunakan nominal numerik yang konsisten.
- Menghindari perhitungan ulang yang menghasilkan nilai berbeda antarhalaman.
- Menggunakan mekanisme transaksi database agar perubahan terkait berhasil seluruhnya atau dibatalkan seluruhnya.

Transaksi yang sudah dibayar atau memengaruhi laporan tidak boleh dihapus secara permanen melalui antarmuka biasa.

# 19. Contoh Pengujian Integrasi

Kasus A — Penjualan kredit:

- Nilai penjualan Rp1.000.000.
- HPP Rp700.000.
- Pembayaran awal Rp400.000.

Hasil yang diharapkan:
- Pendapatan Rp1.000.000.
- Piutang Rp600.000.
- Kas bertambah Rp400.000.
- Persediaan berkurang senilai Rp700.000.
- HPP Rp700.000.
- Laba kotor Rp300.000.

Kasus B — Pelunasan piutang:

Pelanggan membayar Rp600.000.

Hasil:
- Kas bertambah Rp600.000.
- Piutang menjadi Rp0.
- Pendapatan tetap Rp1.000.000.
- HPP tetap Rp700.000.
- Tidak ada laba penjualan tambahan.

Kasus C — Pengambilan pemilik:

Pemilik mengambil Rp200.000.

Hasil:
- Kas berkurang Rp200.000.
- Pengambilan pemilik bertambah Rp200.000.
- Beban operasional tidak berubah.
- Laba tidak berubah.

Kasus D — Pembelian stok kredit:

Usaha membeli stok Rp500.000 secara kredit.

Hasil:
- Persediaan bertambah Rp500.000.
- Utang pemasok bertambah Rp500.000.
- Kas tidak berubah.
- HPP belum bertambah hanya karena pembelian.

# 20. Keputusan yang Masih Memerlukan Persetujuan

Sebelum dokumen ini ditetapkan final, pemilik produk perlu menyetujui:

1. **Metode HPP:** apakah moving weighted average menjadi metode default, atau perlu pilihan FIFO?
2. **Stok negatif:** apakah transaksi penjualan harus ditolak jika stok tidak mencukupi?
3. **Piutang tak tertagih:** apakah penghapusan memerlukan persetujuan atau cukup hak akses pemilik?
4. **DP pesanan batal:** bagaimana kebijakan pengembalian DP dan biaya pembatalan?
5. **Pajak:** apakah V1 hanya mencatat pajak secara manual atau menyediakan perhitungan pajak yang dapat dikonfigurasi?
6. **Aset usaha:** apakah pembelian aset hanya dicatat sebagai aset, atau V1 juga menghitung penyusutan?
7. **Laporan laba:** apakah V1 menggunakan pencatatan sederhana berbasis transaksi dengan laporan laba-rugi, atau menerapkan sistem pembukuan berpasangan secara penuh?

**Catatan:** Keputusan di atas tidak boleh diisi dengan asumsi oleh developer. Keputusan harus disetujui pemilik produk sebelum fitur terkait diimplementasikan.

---

**Status akhir dokumen:** Draft aturan keuangan untuk ditinjau. Belum menjadi spesifikasi final untuk implementasi.
# FINANCIAL_LOGIC.md

**UMKM Manager — Financial Logic**  
Version: 1.1  
Status: Draft – Audit Revision  
Approval: Pending Product Owner Approval

## 1. Tujuan

Dokumen ini menetapkan aturan pengolahan keuangan UMKM Manager. Semua modul yang memengaruhi uang, pendapatan, biaya, persediaan, piutang, dan utang wajib mengikuti aturan ini.

Pengguna tidak diwajibkan memahami akuntansi. Sistem bertanggung jawab menghasilkan pencatatan yang konsisten dan laporan yang tidak menyesatkan.

## 2. Prinsip utama

1. Saldo kas, pendapatan, laba, piutang, dan utang adalah konsep berbeda.
2. Modal pemilik bukan pendapatan.
3. Pengambilan pemilik bukan biaya operasional.
4. Transfer antarakun bukan pendapatan atau biaya.
5. Pembayaran piutang bukan penjualan baru.
6. Pembayaran utang bukan biaya baru apabila biaya atau persediaannya telah diakui sebelumnya.
7. Penjualan tidak boleh dihitung dua kali.
8. HPP dihitung berdasarkan biaya perolehan barang, bukan harga jual.
9. Transaksi yang sudah diposting tidak boleh dihapus tanpa jejak koreksi.
10. Sistem tidak boleh mengarang laba ketika data biaya atau persediaan tidak lengkap.

## 3. Model pencatatan keuangan

**Usulan – Menunggu Persetujuan:** menggunakan double-entry accounting sebagai sumber kebenaran saldo keuangan internal.

- Setiap transaksi bisnis yang berdampak keuangan menghasilkan jurnal yang seimbang.
- Jurnal memiliki total debit dan kredit yang sama.
- Antarmuka pengguna tetap menggunakan istilah sederhana.
- Pengguna tidak perlu memasukkan debit/kredit secara manual.
- Laporan keuangan berasal dari jurnal yang telah diposting.
- Ringkasan transaksi dan laporan bukan sumber saldo independen.

Tidak boleh ada dua sistem pencatatan yang sama-sama menghitung saldo secara terpisah.

## 4. Modal dan saldo awal

- Saldo awal kas/bank dicatat sebagai saldo pembukaan.
- Setoran modal pemilik meningkatkan kas/bank dan ekuitas, bukan pendapatan.
- Saldo awal persediaan harus memiliki kuantitas dan nilai biaya yang dapat ditelusuri.
- Saldo awal piutang dan utang harus dapat ditelusuri ke saldo pembukaan.
- Saldo awal tidak boleh otomatis dianggap sebagai omzet.

## 5. Kas dan transfer internal

- Penerimaan uang menambah akun kas/bank yang sesuai.
- Pengeluaran uang mengurangi akun kas/bank yang sesuai.
- Transfer antar akun mengurangi akun sumber dan menambah akun tujuan.
- Transfer tidak memengaruhi pendapatan atau biaya.
- Saldo setiap akun harus dapat direkonsiliasi.

## 6. Pengakuan penjualan

Penjualan diakui ketika barang atau jasa telah diserahkan/dipenuhi sesuai kebijakan pengakuan yang disetujui.

- Pesanan yang belum dipenuhi bukan otomatis penjualan.
- Pesanan yang dibatalkan sebelum pemenuhan bukan penjualan.
- Pemenuhan sebagian hanya mengakui bagian yang benar-benar dipenuhi.
- Penjualan tunai dan kredit sama-sama dapat diakui sebagai penjualan.
- Pembayaran pelanggan tidak menentukan apakah penjualan sudah terjadi; pembayaran menentukan perubahan kas dan piutang.

## 7. Uang muka pelanggan (DP)

**Usulan – Menunggu Persetujuan:**

- DP yang diterima sebelum pemenuhan pesanan dicatat sebagai kewajiban kepada pelanggan.
- DP tidak langsung diakui sebagai pendapatan.
- Ketika barang diserahkan, DP dialokasikan terhadap nilai penjualan yang telah dipenuhi.
- Pembatalan dan pengembalian DP harus memiliki transaksi pembalik/koreksi.
- DP untuk pesanan yang dipenuhi sebagian hanya dialokasikan sesuai bagian yang dipenuhi.

## 8. Penjualan tunai, kredit, dan piutang

Contoh penjualan kredit Rp1.000.000:

- Penjualan: Rp1.000.000.
- Piutang: Rp1.000.000.
- Kas belum bertambah.

Ketika pelanggan membayar Rp400.000:

- Kas bertambah Rp400.000.
- Piutang berkurang Rp400.000.
- Tidak ada penjualan baru.

Sisa piutang adalah Rp600.000.

Pembayaran cicilan harus memiliki ID unik dan alokasi yang dapat ditelusuri ke invoice.

## 9. Kelebihan pembayaran

**Usulan – Menunggu Persetujuan:** kelebihan pembayaran menjadi kredit pelanggan/kewajiban usaha, bukan pendapatan.

Kelebihan pembayaran dapat:
- Dialokasikan ke invoice lain dengan persetujuan/pilihan pengguna.
- Disimpan sebagai saldo kredit pelanggan.
- Dikembalikan kepada pelanggan melalui transaksi refund.

Nilai yang belum dialokasikan tidak boleh mengurangi piutang secara sembarang.

## 10. Persediaan dan HPP

**Usulan – Menunggu Persetujuan:** metode moving weighted average.

HPP dihitung dari biaya perolehan rata-rata tertimbang yang berlaku saat barang keluar karena penjualan.

Prinsip:
- Pembelian persediaan menambah kuantitas dan nilai persediaan.
- Pembelian barang tidak otomatis menjadi HPP.
- HPP diakui ketika barang terjual/dikeluarkan untuk transaksi yang memenuhi syarat.
- Retur barang yang layak jual dapat mengembalikan kuantitas dan nilai persediaan sesuai biaya yang relevan.
- Barang retur rusak tidak otomatis menjadi stok siap jual.
- Penyesuaian stok harus memiliki alasan dan riwayat.
- Perubahan harga jual tidak mengubah HPP.

**Stok negatif:** usulan default tidak diperbolehkan. Kebijakan khusus harus disetujui sebelum diterapkan.

Jika modul persediaan tidak aktif atau data biaya tidak tersedia, sistem tidak boleh menampilkan HPP/laba kotor seolah-olah akurat. Laporan harus memberi label keterbatasan data.

## 11. Diskon dan biaya tambahan

- Diskon mengurangi nilai penjualan sesuai kebijakan yang dipilih.
- Biaya tambahan harus memiliki kategori dan dasar pencatatan.
- Diskon per item dan diskon tingkat invoice tidak boleh dihitung dua kali.
- Pajak harus dipisahkan dari pendapatan apabila perlakuan pajaknya mengharuskan demikian.
- Pembulatan harus konsisten dan tercatat.

## 12. Biaya operasional

Biaya usaha mencakup pengeluaran yang berkaitan dengan kegiatan usaha, misalnya:
- Sewa.
- Listrik dan air tempat usaha.
- Transportasi usaha.
- Kemasan.
- Administrasi.
- Gaji dan biaya tenaga kerja.

Pengeluaran pribadi pemilik tidak dicatat sebagai biaya operasional. Jika kas usaha digunakan untuk kebutuhan pribadi, catat sebagai pengambilan pemilik.

## 13. Pembelian dan utang pemasok

- Pembelian persediaan menambah nilai persediaan dan kas berkurang atau utang bertambah.
- Pembayaran utang mengurangi kas dan utang.
- Pembayaran utang tidak boleh menciptakan biaya kedua.
- Pembelian barang non-persediaan mengikuti kategori biaya/aset yang sesuai.

## 14. Penggajian

- Gaji yang telah menjadi kewajiban dicatat sebagai biaya tenaga kerja dan utang gaji.
- Pembayaran gaji mengurangi kas dan utang gaji.
- Uang muka karyawan harus dibedakan dari biaya gaji yang telah diakui.
- Koreksi payroll harus menyimpan riwayat.

## 15. Retur, refund, pembatalan, dan piutang tak tertagih

- Retur penjualan mengurangi penjualan atau dicatat sebagai akun retur sesuai model laporan.
- Refund mengurangi kas dan menyelesaikan kewajiban refund/piutang terkait.
- Barang retur dinilai kondisinya sebelum masuk stok siap jual.
- Pembatalan transaksi yang telah diposting menggunakan transaksi pembalik/koreksi.
- Penghapusan piutang harus memiliki alasan, nilai, tanggal, dan jejak persetujuan.
- Penghapusan piutang tidak boleh menghapus histori invoice dan pembayaran.

## 16. Aset usaha

Pembelian aset usaha harus dibedakan dari biaya operasional rutin.

**Usulan V1:** pencatatan aset dasar tersedia jika modul aset diaktifkan. Penyusutan otomatis dan laporan aset kompleks berada di luar MVP sampai aturan dan kebutuhannya disetujui.

## 17. Pajak

**Usulan V1:** mendukung pencatatan pajak dasar secara terpisah bila diperlukan, tetapi tidak mengklaim sebagai sistem pelaporan pajak resmi atau pengganti konsultasi pajak.

Perlakuan pajak spesifik harus ditetapkan sebelum fitur pajak diimplementasikan.

## 18. Laporan

Laporan minimum yang direncanakan:
- Ringkasan kas dan bank.
- Penjualan.
- Biaya.
- Laba rugi sederhana.
- Piutang.
- Utang.
- Persediaan dan HPP jika datanya tersedia.
- Arus kas.

Laporan laba tidak boleh disamakan dengan saldo kas. Laporan harus menyatakan periode, basis data, dan keterbatasannya.

Neraca lengkap dan laporan akuntansi lanjutan memerlukan persetujuan cakupan tersendiri.

## 19. Integritas data

- Jurnal yang diposting harus seimbang.
- Setiap transaksi memiliki ID unik.
- Posting harus idempotent.
- Satu pembayaran tidak boleh diproses dua kali.
- Satu penjualan tidak boleh menghasilkan pengurangan stok ganda.
- Koreksi harus dapat ditelusuri ke transaksi asal.
- Perhitungan uang menggunakan representasi presisi yang aman, bukan floating-point biner tanpa kontrol.
- Kegagalan transaksi harus membatalkan seluruh perubahan terkait secara atomik.

## 20. Keputusan yang belum disetujui

| ID | Keputusan | Status |
|---|---|---|
| DEC-FIN-01 | Double-entry sebagai sumber kebenaran | Menunggu persetujuan |
| DEC-FIN-02 | Moving weighted average | Menunggu persetujuan |
| DEC-FIN-03 | Stok negatif dilarang secara default | Menunggu persetujuan |
| DEC-FIN-04 | DP sebelum pemenuhan menjadi kewajiban | Menunggu persetujuan |
| DEC-FIN-05 | Kelebihan pembayaran menjadi kredit pelanggan | Menunggu persetujuan |
| DEC-FIN-06 | Alokasi pembayaran lintas invoice | Menunggu persetujuan |
| DEC-FIN-07 | Perlakuan pajak V1 | Menunggu persetujuan |
| DEC-FIN-08 | Penyusutan aset di luar MVP | Menunggu persetujuan |
| DEC-FIN-09 | Penghapusan piutang memerlukan persetujuan dan audit | Menunggu persetujuan |
| DEC-FIN-10 | Cakupan neraca dan laporan keuangan | Menunggu persetujuan |

## 21. Batasan implementasi

Dokumen ini adalah spesifikasi draft. OpenCode tidak boleh menetapkan keputusan yang belum disetujui, mengubah model akuntansi, atau mengimplementasikan aturan yang masih berstatus menunggu persetujuan tanpa otorisasi Product Owner.