# BUSINESS RULES DECISION REPORT

**Project:** UMKM Manager  
**Phase:** 0 — Review & Business Rules Decision Preparation  
**Tanggal:** 2026-11-10  
**Status:** Menunggu keputusan dan persetujuan pengguna  
**Referensi audit:** `docs/audit/PHASE_0_AUDIT_REPORT.md`  

## 1. Tujuan dan Batasan

Dokumen ini menyiapkan bahan keputusan untuk sembilan area bisnis yang tercatat pending di `docs/implementation/PHASE_STATUS.md`. Dokumen ini tidak mengunci aturan, tidak mengubah schema/API/source code, dan tidak memulai Phase 1.

Audit menunjukkan `BUSINESS_RULES.md`, `FINANCIAL_LOGIC.md`, `TRANSACTION_RULES.md`, `DATABASE_SCHEMA.md`, dan dokumen terkait masih kosong. Karena itu, analisis berikut adalah opsi dan rekomendasi profesional yang perlu disetujui pengguna, bukan fakta bisnis project.

## 2. Ringkasan Rekomendasi untuk Dipertimbangkan

| ID | Keputusan | Rekomendasi untuk dipertimbangkan | Wajib sebelum V1? |
|---|---|---|---|
| BR-01 | Accounting model | Double-entry dengan UI transaksi sederhana | Ya |
| BR-02 | Inventory costing | Moving weighted average | Ya, jika V1 memiliki stok/COGS |
| BR-03 | Negative stock | Tolak transaksi yang membuat stok negatif | Ya, jika V1 memiliki stok |
| BR-04 | Down payment/refund | Catat sebagai uang muka/liabilitas; refund hanya lewat transaksi eksplisit | Ya, jika order/DP masuk V1 |
| BR-05 | Overpayment | Simpan sebagai customer credit yang dapat dialokasikan/refund | Ya, jika piutang masuk V1 |
| BR-06 | Payment allocation | Alokasi eksplisit per invoice; default oldest due date | Ya, jika multi-invoice masuk V1 |
| BR-07 | Tax support | V1 tanpa mesin pajak kompleks; simpan tax mode/rate hanya jika scope disetujui | Ya untuk scope pajak V1 |
| BR-08 | Fixed asset depreciation | Tunda dari core V1, kecuali aset tetap adalah kebutuhan utama | Tidak, bila di luar V1 |
| BR-09 | Partial fulfillment/returns | Dukung partial fulfillment dan return terkontrol hanya bila workflow penjualan masuk V1 | Ya, jika order kompleks masuk V1 |

Rekomendasi di atas belum berlaku sebagai business rule sampai pengguna menyetujui setiap keputusan.

## 3. Analisis Sembilan Keputusan

### BR-01 — Accounting model

**Masalah:** Sistem harus menentukan bagaimana transaksi membentuk saldo akun, laba, aset, kewajiban, dan laporan. Pilihan ini memengaruhi database, audit trail, koreksi, dan konsistensi laporan.

#### Alternatif A — Simplified ledger

- **Kelebihan:** UI dan implementasi awal lebih sederhana; cocok untuk pengguna non-akuntansi.
- **Kekurangan:** Validasi keseimbangan lebih lemah; koreksi dan rekonsiliasi lebih sulit; risiko laporan tidak konsisten lebih tinggi.
- **Dampak:** Saldo dan laba dapat dihitung dari kategori transaksi, tetapi auditability dan kontrol silang terbatas. Database cenderung lebih mudah dibuat, namun laporan kompleks dan ekspansi fitur dapat memerlukan migrasi besar.

#### Alternatif B — Double-entry

- **Kelebihan:** Setiap transaksi seimbang; mendukung neraca, laba-rugi, arus kas, audit trail, dan rekonsiliasi yang lebih kuat.
- **Kekurangan:** Model data, validasi, dan edukasi UI lebih kompleks.
- **Dampak:** Saldo akun, laba, aset, kewajiban, dan laporan memiliki sumber data yang lebih kuat. Perlu journal, journal lines, account, period/void/reversal policy, dan kontrol debit-kredit.

#### Alternatif C — Hybrid tersembunyi

Transaksi bisnis memakai UI sederhana, lalu engine mem-posting jurnal double-entry di belakang layar.

- **Kelebihan:** Pengalaman pengguna tetap sederhana, integritas accounting lebih kuat.
- **Kekurangan:** Mapping setiap transaksi harus lengkap; debugging dan koreksi tetap memerlukan pemahaman accounting.
- **Dampak:** Database dan laporan tetap mengikuti double-entry, dengan lapisan business transaction di atasnya.

**Rekomendasi:** Alternatif C, atau B jika scope V1 memang ditujukan untuk pengguna yang memahami accounting. UI sederhana tidak harus mengorbankan journal seimbang.

**Wajib sebelum V1:** Ya untuk V1 yang menampilkan laba, saldo, atau laporan keuangan.

---

### BR-02 — Inventory costing

**Masalah:** Saat harga beli berbeda, sistem harus menentukan COGS dan nilai stok tersisa.

#### Alternatif A — Moving weighted average

- **Kelebihan:** Lebih mudah dipahami dan dihitung; stabil untuk transaksi harian; cocok untuk barang homogen.
- **Kekurangan:** Tidak melacak unit batch spesifik; hasil berbeda dari FIFO pada fluktuasi harga.
- **Dampak:** COGS dan nilai stok berubah setelah penerimaan; perlu quantity, total cost, dan average cost per item/location bila ada lokasi.

#### Alternatif B — FIFO

- **Kelebihan:** Melacak lapisan stok; dapat lebih merepresentasikan urutan barang keluar.
- **Kekurangan:** Database dan reversal/return lebih kompleks; perlu stock layers dan allocation.
- **Dampak:** COGS mengikuti layer tertua; laporan stok dan koreksi harus mempertahankan histori layer.

#### Alternatif C — Standard cost

- **Kelebihan:** Perhitungan cepat dan sederhana untuk operasi tertentu.
- **Kekurangan:** Selisih harga harus dikelola; kurang cocok tanpa proses variance accounting.
- **Dampak:** Laba dapat menampilkan variance terpisah; berisiko menyesatkan jika variance tidak dipelihara.

**Rekomendasi:** Moving weighted average untuk V1 sederhana, dengan pencatatan histori penerimaan dan penyesuaian. FIFO ditunda sampai kebutuhan batch/layer terbukti.

**Wajib sebelum V1:** Ya jika inventori dan COGS masuk V1.

---

### BR-03 — Negative stock policy

**Masalah:** Penjualan atau pengeluaran dapat terjadi saat stok tercatat kurang dari quantity yang diminta.

#### Alternatif A — Tolak transaksi

- **Kelebihan:** Menjaga integritas stok dan COGS; masalah data terlihat segera.
- **Kekurangan:** Operasi harus menunggu penerimaan atau koreksi stok; kurang fleksibel untuk pencatatan terlambat.
- **Dampak:** Stok tidak negatif; transaksi gagal harus atomic dan memberikan alasan jelas.

#### Alternatif B — Izinkan stok negatif

- **Kelebihan:** Operasi tetap dapat mencatat penjualan; cocok jika pencatatan penerimaan sering terlambat.
- **Kekurangan:** COGS dan valuasi sementara tidak stabil; rekonsiliasi menjadi wajib; risiko saldo stok salah.
- **Dampak:** Database perlu negative layers/backfill policy dan laporan harus menandai stok negatif.

#### Alternatif C — Izinkan dengan warning dan approval

- **Kelebihan:** Fleksibilitas dengan kontrol.
- **Kekurangan:** Memerlukan role/approval, audit trail, dan kebijakan rekonsiliasi.
- **Dampak:** Transaksi dapat masuk, tetapi laporan harus membedakan exception dan normal stock.

**Rekomendasi:** Tolak sebagai default untuk V1. Jika bisnis membutuhkan fleksibilitas, gunakan approval eksplisit, bukan silent negative stock.

**Wajib sebelum V1:** Ya jika inventori masuk V1.

---

### BR-04 — Down payment, cancellation, dan refund

**Masalah:** Uang muka sebelum barang/jasa dipenuhi bukan otomatis revenue. Pembatalan perlu menentukan apakah DP dipakai, dikembalikan, atau dipotong biaya.

#### Alternatif A — DP sebagai customer credit/liability

- **Kelebihan:** Memisahkan kas diterima dari revenue; aman untuk pembatalan dan pemenuhan bertahap.
- **Kekurangan:** Membutuhkan status allocation dan refund.
- **Dampak:** Arus kas meningkat saat DP diterima; revenue/laba baru diakui sesuai kebijakan pemenuhan; piutang berkurang saat dialokasikan.

#### Alternatif B — DP langsung mengurangi piutang invoice

- **Kelebihan:** UI lebih sederhana jika selalu terkait satu invoice.
- **Kekurangan:** Berisiko salah bila order dibatalkan atau invoice berubah; kurang cocok untuk multi-order.
- **Dampak:** Saldo piutang lebih cepat turun, tetapi kewajiban dan refund perlu aturan tambahan.

#### Alternatif C — DP tidak didukung di V1

- **Kelebihan:** Mengurangi risiko accounting.
- **Kekurangan:** Membatasi workflow order bisnis.
- **Dampak:** Sistem hanya mendukung pembayaran setelah invoice/penjualan.

**Rekomendasi:** Alternatif A jika order/DP adalah kebutuhan V1; sediakan refund sebagai transaksi eksplisit dengan audit trail. Jangan menganggap DP sebagai revenue tanpa aturan pengakuan.

**Wajib sebelum V1:** Ya jika DP/order masuk V1; dapat ditunda bila scope V1 hanya penjualan tunai sederhana.

---

### BR-05 — Overpayment

**Masalah:** Pembayaran melebihi total invoice harus memiliki tujuan akuntansi dan perilaku saldo pelanggan.

#### Alternatif A — Customer credit

- **Kelebihan:** Tidak hilang; dapat dipakai untuk invoice berikutnya atau refund.
- **Kekurangan:** Memerlukan customer balance dan allocation workflow.
- **Dampak:** Kas naik; invoice lunas; selisih menjadi credit/liability sampai dialokasikan atau direfund.

#### Alternatif B — Tolak pembayaran yang melebihi saldo

- **Kelebihan:** Data sederhana dan mencegah saldo tidak disengaja.
- **Kekurangan:** Tidak cocok untuk transfer/bank fee atau pembayaran manual yang salah.
- **Dampak:** Tidak ada credit; UI harus menolak atau meminta koreksi.

#### Alternatif C — Otomatis refund selisih

- **Kelebihan:** Saldo pelanggan bersih.
- **Kekurangan:** Tidak aman tanpa konfirmasi; menambah transaksi kas dan rekonsiliasi.
- **Dampak:** Arus kas keluar; perlu status refund dan failure handling.

**Rekomendasi:** Customer credit dengan konfirmasi dan opsi refund. Hindari auto-refund di V1.

**Wajib sebelum V1:** Ya jika pembayaran dan piutang masuk V1.

---

### BR-06 — Payment allocation across invoices

**Masalah:** Satu pembayaran dapat melunasi beberapa invoice. Sistem perlu menentukan invoice mana yang menerima pembayaran dan bagaimana sisa dicatat.

#### Alternatif A — Manual allocation

- **Kelebihan:** Kontrol pengguna paling jelas; cocok untuk kasus khusus.
- **Kekurangan:** Lebih lambat dan rawan salah input.
- **Dampak:** Database perlu payment allocation rows; saldo tiap invoice dapat diaudit.

#### Alternatif B — FIFO/oldest due date default

- **Kelebihan:** Mengurangi pekerjaan manual; perilaku konsisten.
- **Kekurangan:** Tidak selalu sesuai instruksi pelanggan.
- **Dampak:** Sistem perlu due date, status invoice, dan aturan tie-breaker.

#### Alternatif C — User memilih invoice, sistem menghitung sisa

- **Kelebihan:** Seimbang antara kontrol dan kemudahan; mencegah allocation melebihi invoice.
- **Kekurangan:** Masih membutuhkan input pengguna.
- **Dampak:** Allocation tetap terpisah dari payment header; sisa menjadi credit atau error sesuai keputusan overpayment.

**Rekomendasi:** Alternatif C, dengan default FIFO/oldest due date sebagai shortcut yang dapat diubah sebelum posting.

**Wajib sebelum V1:** Ya jika satu pelanggan dapat memiliki lebih dari satu invoice terbuka.

---

### BR-07 — Tax support scope

**Masalah:** V1 harus menentukan apakah pajak dihitung, dicatat, dan dilaporkan; jangan mengklaim compliance tanpa scope dan aturan negara yang jelas.

#### Alternatif A — Tanpa tax engine; harga final saja

- **Kelebihan:** Risiko dan kompleksitas rendah.
- **Kekurangan:** Tidak mendukung kebutuhan pemisahan tax/non-tax.
- **Dampak:** Laporan laba memakai total sesuai kebijakan harga; tidak ada tax payable yang dapat diandalkan.

#### Alternatif B — Tax rate sederhana per line/invoice

- **Kelebihan:** Mendukung subtotal, tax amount, dan total; masih relatif terbatas.
- **Kekurangan:** Belum mencakup exemption, inclusive/exclusive, rounding kompleks, atau perubahan regulasi.
- **Dampak:** Database perlu tax rate/type dan rounding policy; laporan perlu memisahkan revenue dan tax payable bila relevan.

#### Alternatif C — Tax engine penuh dan configurable

- **Kelebihan:** Fleksibel untuk banyak aturan.
- **Kekurangan:** Kompleks, rawan salah, dan perlu validasi regulasi serta maintenance.
- **Dampak:** Menambah master data, effective dates, jurisdiction, exemption, rounding, dan test matrix.

**Rekomendasi:** Alternatif A jika V1 belum punya kebutuhan pajak; jika wajib, Alternatif B dengan scope, rounding, dan status tax yang disetujui. Jangan mengambil asumsi regulasi.

**Wajib sebelum V1:** Hanya jika pajak termasuk scope V1; keputusan scope tetap wajib sebelum implementasi invoice.

---

### BR-08 — Fixed asset depreciation

**Masalah:** Aset tetap tidak selalu boleh dibebankan penuh saat dibeli; depreciation memengaruhi laba dan nilai aset.

#### Alternatif A — Tunda dari V1

- **Kelebihan:** Mengurangi kompleksitas; fokus ke kas, penjualan, dan stok.
- **Kekurangan:** Laporan laba dan aset tidak lengkap untuk bisnis dengan aset signifikan.
- **Dampak:** Pembelian aset mungkin hanya dicatat sebagai expense atau belum didukung; harus diberi batasan laporan yang jelas.

#### Alternatif B — Straight-line depreciation sederhana

- **Kelebihan:** Mudah dipahami dan diuji; cukup untuk kebutuhan dasar.
- **Kekurangan:** Tidak cocok untuk semua asset class/regulasi; perlu residual value, start date, dan rounding.
- **Dampak:** Aset, accumulated depreciation, expense, dan net book value memengaruhi neraca/laba.

#### Alternatif C — Configurable multi-method

- **Kelebihan:** Fleksibel.
- **Kekurangan:** Besar untuk V1; banyak edge case dan kebutuhan accounting.
- **Dampak:** Menambah asset register, schedule, adjustment, disposal, impairment, dan audit trail.

**Rekomendasi:** Tunda dari core V1 kecuali kebutuhan pengguna menuntutnya. Jangan mencatat laporan aset/depreciation seolah-olah akurat tanpa engine.

**Wajib sebelum V1:** Tidak, jika aset tetap di luar scope V1.

---

### BR-09 — Partial fulfillment dan partial returns

**Masalah:** Order dapat dipenuhi atau dikembalikan sebagian. Status order, stok, revenue, refund, dan piutang harus tetap konsisten.

#### Alternatif A — Full fulfillment/full return saja

- **Kelebihan:** Model dan UI sederhana.
- **Kekurangan:** Tidak cocok untuk operasional nyata dengan pengiriman bertahap atau return sebagian.
- **Dampak:** Status dan stok lebih mudah, tetapi workflow bisnis terbatas.

#### Alternatif B — Partial fulfillment dan partial return terkontrol

- **Kelebihan:** Mendukung operasi nyata; quantity dan status dapat diaudit.
- **Kekurangan:** Membutuhkan line-level fulfillment, stock movement, return reason, refund/credit, dan aturan revenue.
- **Dampak:** Stok berubah per fulfillment/return; revenue dan piutang perlu mengikuti kebijakan pengakuan; laporan harus mencegah double count.

#### Alternatif C — Partial fulfillment saja; return ditunda

- **Kelebihan:** Menangani pengiriman bertahap tanpa seluruh kompleksitas return.
- **Kekurangan:** Tidak mencakup kasus pengembalian yang umum.
- **Dampak:** Database perlu fulfillment lines; return menjadi proses manual/off-system sampai fase berikutnya.

**Rekomendasi:** Alternatif C untuk V1 terbatas, lalu return dikunci sebagai scope lanjutan; atau Alternatif B bila return adalah kebutuhan inti. Jangan mencampurkan status order dengan status pembayaran.

**Wajib sebelum V1:** Bergantung pada scope order. Wajib jika penjualan partial/return dijanjikan; dapat ditunda untuk penjualan sederhana.

## 4. Pengelompokan Fitur V1

### Wajib V1 — jika product promise mencakup manajemen keuangan dan stok

- Master produk, unit, dan harga dasar.
- Pencatatan penjualan dan pembayaran.
- Customer dan invoice dasar.
- Saldo piutang dan customer balance.
- Inventory movement dan stock balance.
- COGS sesuai costing yang disetujui.
- Validasi transaksi atomic dan audit trail dasar.
- Laporan dasar: penjualan, pembayaran, piutang, stok, COGS/laba sesuai scope.
- Offline persistence bila offline-first tetap menjadi product requirement.
- Backup dan restore tervalidasi sebelum data dianggap aman.
- Unit/integration tests untuk money, stock, allocation, reversal, dan restore.

### Opsional V1 — perlu keputusan scope eksplisit

- Down payment dan order workflow.
- Partial fulfillment.
- Partial returns.
- Tax rate sederhana.
- Multi-location stock.
- Fixed asset register dan straight-line depreciation.
- Approval untuk negative stock.
- Import/export data.
- Dashboard analitik lanjutan.

### Di luar V1 — rekomendasi penundaan

- Tax engine configurable penuh.
- FIFO dengan layer kompleks jika weighted average cukup.
- Multi-currency dan foreign exchange.
- Multi-tenant/server synchronization.
- Advanced permissions/workflows.
- Forecasting dan advanced analytics.
- Full fixed asset lifecycle: impairment, disposal, revaluation.
- Integrasi payment gateway/bank reconciliation otomatis.

Pengelompokan ini adalah rekomendasi scope, bukan keputusan final.

## 5. Ketergantungan Keputusan

1. **Accounting model** menjadi keputusan induk untuk database journal, saldo, laba, arus kas, invoice, payment, DP, refund, tax, dan depreciation.
2. **Inventory costing** bergantung pada accounting model dan menentukan COGS, inventory valuation, return, adjustment, dan laporan laba.
3. **Negative stock** bergantung pada inventory costing serta timing penerimaan/penjualan.
4. **Down payment/refund** bergantung pada accounting model, invoice/order lifecycle, payment allocation, dan overpayment treatment.
5. **Overpayment** bergantung pada payment allocation dan customer balance model.
6. **Payment allocation** bergantung pada invoice model, due date, status invoice, dan overpayment behavior.
7. **Tax support** bergantung pada invoice line model, accounting model, price inclusive/exclusive, rounding, dan laporan.
8. **Depreciation** bergantung pada accounting model, chart of accounts, period closing, dan asset register.
9. **Partial fulfillment/returns** bergantung pada inventory movement, costing, revenue recognition, invoice/payment behavior, dan refund/credit policy.

Urutan keputusan yang disarankan: BR-01 → BR-02 → BR-03 → BR-06 → BR-05 → BR-04 → BR-07 → BR-09 → BR-08.

## 6. Daftar Persetujuan Pengguna

Pengguna perlu menyetujui atau mengubah rekomendasi berikut:

- [ ] BR-01: accounting model.
- [ ] BR-02: inventory costing.
- [ ] BR-03: negative stock policy.
- [ ] BR-04: down payment/cancellation/refund.
- [ ] BR-05: overpayment treatment.
- [ ] BR-06: payment allocation.
- [ ] BR-07: tax support scope.
- [ ] BR-08: fixed asset depreciation.
- [ ] BR-09: partial fulfillment/returns.
- [ ] Scope fitur Wajib V1, Opsional V1, dan Di luar V1.
- [ ] Konfirmasi apakah rekomendasi boleh menjadi dasar pengisian business rules dan schema pada fase berikutnya.

Tidak ada checkbox yang dianggap disetujui hanya karena tidak ada tanggapan.

## 7. Risiko Jika Keputusan Ditunda

- Schema database tidak dapat dikunci tanpa risiko migrasi ulang.
- Financial engine dapat memakai definisi saldo/laba yang berbeda antar modul.
- COGS dan nilai stok dapat berubah setelah data produksi tercatat.
- Piutang, DP, overpayment, dan refund dapat tercampur dengan revenue atau kas.
- Laporan historis dapat menjadi tidak konsisten.
- Backup mungkin memulihkan data yang secara struktur ada tetapi secara financial salah.
- Test case dan acceptance criteria tidak memiliki expected result yang sah.
- Estimasi dan sequencing Phase 1 tetap tidak stabil.

## 8. Gate Phase 0

Dokumen ini selesai sebagai bahan keputusan. Phase 0 tetap **Review Required**. Phase 1 tidak dimulai, schema/API/source code tidak diubah, dan tidak ada business rule yang dikunci sampai pengguna memberikan persetujuan eksplisit.
