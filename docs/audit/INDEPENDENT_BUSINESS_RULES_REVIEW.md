# INDEPENDENT BUSINESS RULES REVIEW

**Project:** UMKM Manager  
**Branch:** `main`  
**Review date:** 2026-11-10  
**Phase 0 status:** Review Required  
**Phase 1 status:** Not Started  

## 1. Executive Summary

Review independen menemukan bahwa `BUSINESS_RULES_DECISION_REPORT.md` adalah bahan keputusan yang berguna, tetapi belum merupakan spesifikasi final. Rekomendasi utamanya secara umum masuk akal untuk UMKM: accounting double-entry di belakang UI sederhana, moving weighted average, penolakan stok negatif, customer credit untuk overpayment, dan penundaan depreciation kompleks.

Beberapa rekomendasi perlu diperketat sebelum dapat menjadi dasar database atau financial engine:

- Double-entry tidak cukup hanya memilih model; chart of accounts, posting rules, period/reversal policy, rounding, dan recognition basis juga harus diputuskan.
- Moving weighted average membutuhkan aturan tanggal efektif, backdated transaction, purchase return, sales return, adjustment, pembulatan, dan perubahan cost setelah penjualan.
- Penolakan stok negatif aman sebagai default, tetapi harus dipisahkan dari ketersediaan stok, reservasi, dan transaksi yang belum diposting.
- DP sebagai liability benar secara konsep, tetapi istilah `customer credit` dapat membingungkan dengan overpayment credit. Keduanya perlu dibedakan.
- Overpayment credit dan DP liability tidak boleh digabung tanpa aturan saldo dan redemption yang jelas.
- Default oldest due date bukan aturan universal; harus ada pilihan allocation, tie-breaker, dan perilaku pembayaran tanpa referensi invoice.
- Tax scope perlu diputuskan sebelum invoice final, termasuk apakah pajak hanya informasional atau masuk journal/liability.
- Menunda depreciation aman hanya jika batas laporan aset dan expense ditulis tegas.
- Partial fulfillment dan return membutuhkan keputusan terpisah; return tidak boleh dianggap sekadar fulfillment negatif.

Tidak ada business rule yang dikunci dalam review ini. Tidak ada source code, schema, API, dependency, atau status fase yang diubah.

## 2. Skill yang Ditemukan dan Digunakan

Skill yang relevan ditemukan pada environment dan digunakan:

1. **`domain-modeling`** — digunakan untuk memperjelas istilah yang berpotensi tumpang tindih, memeriksa relasi antar konsep seperti customer credit, DP liability, payment, invoice, fulfillment, dan return, serta menekan edge case domain.
2. **`codebase-design`** — digunakan untuk menilai konsekuensi keputusan terhadap interface financial engine, locality aturan, seam persistence, dan testability. Skill ini relevan walaupun belum ada implementasi.

Skill lain yang tersedia tidak digunakan karena task ini hanya review dokumentasi dan tidak membangun database, UI, testing setup, atau aplikasi. Tidak ada skill accounting-specific, product-requirements-specific, offline-first-specific, atau database-specific yang tersedia pada daftar environment yang diverifikasi. Analisis area tersebut dilakukan berdasarkan review profesional dan bukti repository.

## 3. Referensi yang Diperiksa

- `docs/audit/PHASE_0_AUDIT_REPORT.md`
- `docs/audit/BUSINESS_RULES_DECISION_REPORT.md`
- `docs/implementation/PHASE_STATUS.md`
- File yang disebut audit: `docs/business/BUSINESS_RULES.md`, `docs/business/FINANCIAL_LOGIC.md`, `docs/business/TRANSACTION_RULES.md`, `docs/architecture/DATABASE_SCHEMA.md` — terverifikasi kosong menurut audit.

### Fakta repository yang sudah terverifikasi

- Tidak ada source code aplikasi.
- Tidak ada `package.json`, dependency manifest, build config, database implementation, API, atau test implementation.
- Dokumen business, financial, transaction, dan database schema kosong.
- Sembilan keputusan masih pending di `PHASE_STATUS.md`.
- Phase 0 masih `Review Required`; Phase 1 belum dimulai.

### Analisis profesional

Isi review, koreksi, edge case, dan dampak pada bagian berikut adalah analisis, bukan fakta bisnis project.

### Rekomendasi

Semua rekomendasi diberi label sebagai bahan pertimbangan. Tidak ada yang dianggap disetujui.

## 4. Review Sembilan Keputusan

### 4.1 BR-01 — Double-entry accounting dengan UI sederhana

**Validitas masalah:** Benar. Model accounting menentukan saldo, laba, aset, kewajiban, arus kas, auditability, dan bentuk database.

**Kecukupan alternatif:** Cukup untuk level awal, tetapi `simplified ledger`, `double-entry`, dan `hybrid` bukan seluruh dimensi keputusan. Hal yang belum disebut jelas:

- cash basis vs accrual basis;
- chart of accounts minimum;
- kapan revenue dan COGS diposting;
- fiscal period dan closing;
- edit vs reversal;
- rounding dan currency precision;
- opening balance dan adjustment;
- apakah setiap business transaction wajib menghasilkan journal seimbang.

**Konsekuensi yang perlu ditambahkan:** UI sederhana tetap membutuhkan error handling ketika mapping business transaction gagal. Journal tidak boleh berhasil sebagian. Laporan saldo, laba, arus kas, piutang, dan stok harus bersumber dari aturan posting yang konsisten, bukan perhitungan berbeda per halaman.

**Rekomendasi sebelumnya:** Tetap layak: double-entry/hidden posting engine dengan UI sederhana. Koreksi: jangan menyebutnya siap diputuskan tanpa menetapkan recognition basis, posting matrix, reversal, period, dan opening balance policy.

**Wajib sebelum database/engine:** Ya, minimal sebagai keputusan model dan recognition basis. Detail posting matrix wajib sebelum implementasi transaksi pertama.

### 4.2 BR-02 — Moving weighted average

**Validitas masalah:** Benar. Costing memengaruhi COGS, inventory valuation, laba, return, dan adjustment.

**Kecukupan alternatif:** Weighted average, FIFO, dan standard cost cukup sebagai pilihan utama. Namun alternatif bukan hanya algoritma; timing dan histori juga menentukan hasil.

**Konsekuensi yang belum cukup ditekankan:**

- penerimaan barang setelah tanggal penjualan;
- transaksi backdated;
- purchase return dan sales return;
- stock adjustment dan write-off;
- perubahan biaya setelah COGS sudah dilaporkan;
- pembulatan quantity dan currency;
- cost per lokasi atau per batch;
- apakah biaya freight/discount masuk inventory cost.

**Risiko:** Recalculation historis dapat mengubah laba periode sebelumnya. Jika aplikasi offline, urutan sinkronisasi atau import dapat mengubah average cost.

**Rekomendasi sebelumnya:** Tetap layak untuk UMKM dengan barang homogen dan satu lokasi. Koreksi: scope harus membatasi backdated transactions, multi-location, batch/expiry, dan landed cost sampai ada aturan.

**Wajib sebelum database/engine:** Ya jika inventori/COGS masuk V1. Metode, precision, effective date, dan correction policy wajib ditentukan.

### 4.3 BR-03 — Menolak transaksi yang menyebabkan stok negatif

**Validitas masalah:** Benar sebagai kontrol integritas.

**Kecukupan alternatif:** Alternatif allow, reject, dan approval cukup. Namun perlu membedakan:

- on-hand stock;
- reserved stock;
- available-to-sell;
- pending/unposted movement;
- stock per lokasi.

**Konsekuensi:** Reject harus atomic: tidak boleh invoice/journal/payment tercatat jika stock movement gagal. Offline concurrent edits atau import juga membutuhkan conflict behavior.

**Rekomendasi sebelumnya:** Tetap layak sebagai default V1. Koreksi: definisi stok yang dipakai harus disetujui; exception manual harus memiliki audit trail dan tidak boleh diam-diam mengubah saldo.

**Wajib sebelum database/engine:** Ya jika inventory masuk V1.

### 4.4 BR-04 — Down payment sebagai customer credit/liability

**Validitas masalah:** Benar. DP bukan otomatis revenue dan pembatalan/refund memerlukan lifecycle.

**Masalah istilah:** `Customer credit` sering berarti saldo lebih bayar yang dapat dipakai pelanggan. DP lebih tepat dipisahkan sebagai `customer advance` atau `contract liability`. Keduanya dapat menjadi kewajiban, tetapi sumber, release rule, dan refund rule berbeda.

**Kecukupan alternatif:** Alternatif liability, langsung mengurangi invoice, atau tidak mendukung cukup untuk screening. Belum ada keputusan tentang:

- DP tanpa customer;
- DP terkait order yang berubah;
- partial fulfillment;
- forfeiture/cancellation fee;
- refund sebagian;
- transfer DP ke order/invoice lain;
- kapan DP direklasifikasi menjadi revenue atau settlement.

**Konsekuensi:** Kas naik saat diterima, tetapi revenue dan liability harus mengikuti recognition policy. Piutang tidak boleh berkurang hanya karena kas masuk jika DP belum dialokasikan ke invoice.

**Rekomendasi sebelumnya:** Alternatif liability tetap layak jika DP masuk V1. Koreksi terminology dan wajibkan lifecycle allocation/release/refund.

**Wajib sebelum database/engine:** Ya jika order/DP masuk V1; tidak jika secara eksplisit dikeluarkan dari V1.

### 4.5 BR-05 — Overpayment sebagai customer credit

**Validitas masalah:** Benar. Selisih pembayaran tidak boleh hilang atau otomatis menjadi revenue.

**Kecukupan alternatif:** Customer credit, reject, dan auto-refund mencakup pilihan dasar. Belum ada aturan untuk:

- payment tanpa invoice reference;
- fee bank dan selisih kecil;
- credit expiration;
- refund approval;
- customer deletion/merge;
- allocation ke beberapa customer/invoice;
- apakah credit dapat dipakai lintas order.

**Konsekuensi:** Overpayment dapat menjadi liability/customer balance, bukan income. Refund menurunkan kas; allocation menurunkan credit dan invoice receivable. Laporan harus membedakan overpayment credit dari DP.

**Rekomendasi sebelumnya:** Customer credit dengan manual confirmation dan no auto-refund tetap layak. Koreksi: nama dan ledger treatment harus berbeda dari DP liability.

**Wajib sebelum database/engine:** Ya jika multi-invoice receivable masuk V1.

### 4.6 BR-06 — Payment allocation dengan pilihan invoice dan default oldest due date

**Validitas masalah:** Benar. Satu payment dan banyak invoice membutuhkan allocation yang dapat diaudit.

**Kecukupan alternatif:** Manual, FIFO default, dan user selection cukup sebagai starting options. Default oldest due date tidak universal karena pelanggan dapat menentukan invoice tertentu atau ada dispute/credit note.

**Konsekuensi yang belum lengkap:**

- payment tanpa invoice reference;
- partial allocation;
- invoice void/credit note;
- equal due date tie-breaker;
- currency mismatch;
- allocation reversal;
- payment date versus invoice date;
- unapplied cash report.

**Rekomendasi sebelumnya:** User selection dengan suggested oldest due date tetap layak. Koreksi: default tidak boleh auto-post tanpa review bila ada lebih dari satu invoice; sisa harus mengikuti overpayment/unapplied cash rule.

**Wajib sebelum database/engine:** Ya jika satu customer dapat memiliki banyak invoice atau pembayaran tidak selalu exact.

### 4.7 BR-07 — Tax support dibatasi pada V1

**Validitas masalah:** Benar. Tax tidak boleh diklaim compliant tanpa yurisdiksi, status bisnis, dan aturan yang disetujui.

**Kecukupan alternatif:** Tanpa tax engine, rate sederhana, dan configurable engine cukup. Namun `tanpa tax engine; harga final saja` harus menyatakan bahwa laporan tax payable tidak tersedia dan sistem bukan tax compliance tool.

**Konsekuensi yang perlu diputuskan:**

- tax-inclusive vs tax-exclusive pricing;
- line-level vs invoice-level rate;
- rounding per line vs invoice;
- tax-exempt/zero-rated;
- effective date rate;
- credit note/return tax reversal;
- apakah tax amount masuk journal liability;
- invoice numbering/legal output.

**Rekomendasi sebelumnya:** Tetap layak menunda tax engine kompleks. Koreksi: pilih salah satu scope secara eksplisit sebelum invoice; jangan menyimpan tax fields yang memberi kesan compliance jika belum ada posting/reporting yang benar.

**Wajib sebelum database/engine:** Wajib bila invoice V1 menampilkan atau menghitung pajak. Dapat ditunda bila V1 secara eksplisit non-tax/informational.

### 4.8 BR-08 — Fixed asset depreciation ditunda

**Validitas masalah:** Benar. Depreciation memengaruhi expense, asset value, laba, dan neraca.

**Kecukupan alternatif:** Tunda, straight-line, dan configurable methods cukup. Alternatif yang kurang dibahas adalah pencatatan asset purchase sebagai unsupported atau sebagai expense dengan disclosure.

**Konsekuensi:** Jika depreciation ditunda, laporan laba dan aset tidak boleh mengklaim full accounting accuracy untuk fixed assets. Pembelian aset harus ditolak, dicatat sebagai kategori non-depreciating, atau ditampilkan sebagai batasan produk—pilihan ini belum disetujui.

**Rekomendasi sebelumnya:** Tetap layak menunda engine kompleks. Koreksi: jangan otomatis membebankan asset purchase sebagai expense tanpa keputusan accounting; pilih explicit unsupported flow atau scope minimal straight-line.

**Wajib sebelum database/engine:** Tidak bila fixed asset di luar V1. Wajib bila V1 menjanjikan laporan laba/neraca yang mencakup aset tetap.

### 4.9 BR-09 — Partial fulfillment dan returns

**Validitas masalah:** Benar. Fulfillment dan return mengubah quantity, stock, revenue, COGS, receivable, refund, dan order status.

**Kecukupan alternatif:** Full-only, partial fulfillment plus return, dan partial fulfillment only cukup untuk scope screening. Namun return bukan inverse sederhana: barang dapat rusak, sebagian dapat direstock, dan refund dapat berupa cash, credit, atau replacement.

**Konsekuensi yang perlu diputuskan:**

- return eligibility window;
- return reason and condition;
- restock vs write-off;
- COGS reversal/cost basis;
- refund vs credit note vs replacement;
- over-fulfillment prevention;
- revenue recognition timing;
- invoice and tax reversal.

**Rekomendasi sebelumnya:** Partial fulfillment saja dan return ditunda dapat layak untuk V1 terbatas. Koreksi: bila order bukan kebutuhan utama, full sale dengan explicit return-out-of-scope lebih aman daripada setengah workflow yang membingungkan.

**Wajib sebelum database/engine:** Bergantung pada product promise. Wajib sebelum engine jika fitur dijanjikan; tidak wajib jika V1 hanya immediate sale/full delivery.

## 5. Rekomendasi yang Tetap Layak

Rekomendasi berikut tetap layak sebagai kandidat, bukan keputusan final:

1. Gunakan double-entry di belakang transaksi bisnis sederhana.
2. Gunakan moving weighted average untuk inventori homogen/satu lokasi bila scope V1 cocok.
3. Tolak stok negatif sebagai default.
4. Hindari auto-refund untuk overpayment.
5. Gunakan allocation yang dapat dipilih pengguna dengan suggested oldest due date.
6. Tunda tax engine configurable penuh.
7. Tunda fixed asset depreciation kompleks.
8. Pisahkan status order, fulfillment, invoice, payment, dan return.

## 6. Rekomendasi yang Perlu Dikoreksi

1. **Pisahkan DP dan overpayment credit secara terminologi dan ledger treatment.** Keduanya bukan satu saldo generik.
2. **Perjelas double-entry.** Pilihan model harus disertai recognition basis, posting matrix, reversal, closing, opening balance, dan rounding policy.
3. **Perjelas weighted average.** Tetapkan backdating, correction, returns, adjustments, precision, dan single/multi-location scope.
4. **Perjelas negative stock.** Tentukan definisi quantity yang dicek dan perilaku transaksi atomic/offline conflict.
5. **Perjelas payment allocation.** Suggested oldest due date tidak boleh dianggap universal atau otomatis diposting.
6. **Perjelas tax boundary.** V1 tanpa tax harus menyatakan batas laporan dan non-compliance; V1 dengan tax sederhana tetap perlu inclusive/exclusive, rounding, dan reversal.
7. **Perjelas fixed asset exclusion.** Jangan memberi default expense treatment tanpa persetujuan.
8. **Perjelas returns.** Return memerlukan disposition dan financial treatment, bukan hanya stock reversal.
9. **Uji scope V1 terhadap product promise.** Daftar `Wajib V1` sebelumnya mengasumsikan product promise keuangan dan stok, padahal PRD kosong. Itu harus ditandai sebagai conditional, bukan baseline terverifikasi.

## 7. Keputusan yang Harus Ditentukan Pengguna

Checklist ini membutuhkan jawaban eksplisit:

- [ ] V1 memakai accounting double-entry atau model lain.
- [ ] Recognition basis: cash, accrual, atau kombinasi yang jelas.
- [ ] Chart of accounts minimum dan laporan yang dijanjikan.
- [ ] Posting, reversal, void, period close, opening balance, dan rounding policy.
- [ ] V1 memakai moving weighted average, FIFO, atau metode lain.
- [ ] Scope inventory: satu/multi-location, batch/expiry, backdating, landed cost.
- [ ] Negative stock: reject, approval exception, atau allow.
- [ ] DP didukung atau ditunda; jika didukung, lifecycle release/refund/cancellation.
- [ ] Overpayment menjadi credit, ditolak, atau workflow refund; batas penggunaan credit.
- [ ] Payment tanpa invoice reference dan unapplied cash behavior.
- [ ] Allocation manual/suggested/default; tie-breaker dan reversal.
- [ ] Tax di luar V1 atau tax sederhana; inclusive/exclusive, rounding, reversal, dan reporting boundary.
- [ ] Fixed asset di luar V1 atau straight-line minimal; treatment pembelian aset.
- [ ] Full-only vs partial fulfillment; return scope dan restock/refund/credit behavior.
- [ ] Scope product promise V1: cash sales saja, atau inventory + receivable + financial reports.

## 8. Ketergantungan Antar-business Rules

1. Accounting model dan recognition basis memengaruhi DP, overpayment, tax, depreciation, revenue, COGS, dan reports.
2. Inventory costing memengaruhi sales posting, return, adjustment, stock valuation, dan laba.
3. Negative stock bergantung pada inventory availability model, reservation, costing, dan offline conflict policy.
4. DP bergantung pada order lifecycle, invoice timing, revenue recognition, payment allocation, dan refund.
5. Overpayment bergantung pada payment allocation, customer balance, unapplied cash, dan refund.
6. Tax bergantung pada invoice line, price mode, rounding, return/credit note, dan journal mapping.
7. Depreciation bergantung pada chart of accounts, period close, asset register, dan reporting promise.
8. Partial fulfillment/returns bergantung pada stock movement, costing, revenue recognition, invoice, tax, and refund treatment.

Urutan keputusan yang lebih aman:

1. Product promise dan scope V1.
2. Accounting model + recognition basis + reporting promise.
3. Inventory scope + costing + stock availability.
4. Invoice/payment/allocation/customer balance.
5. DP, overpayment, refund, and credit note.
6. Tax boundary.
7. Fulfillment and returns.
8. Fixed asset treatment.

## 9. Risiko terhadap Database, Financial Engine, dan Laporan

### Database

- Skema dapat mencampur customer credit, DP liability, unapplied cash, dan receivable.
- Tidak ada tempat yang jelas untuk journal/reversal, allocation rows, stock movement, cost history, return disposition, atau tax metadata.
- Backdated/offline correction dapat mengubah histori tanpa versioning atau audit trail.
- Status order, fulfillment, invoice, payment, dan return berisiko menjadi satu status yang ambigu.

### Financial engine

- Journal dapat tidak seimbang jika posting multi-step gagal sebagian.
- COGS dan average cost dapat berubah ketika transaksi terlambat masuk.
- DP/overpayment dapat salah masuk revenue atau mengurangi receivable terlalu dini.
- Refund, return, void, dan reversal dapat menggandakan atau menghapus saldo.
- Rounding dan currency precision dapat membuat invoice tidak sama dengan journal.

### Laporan

- Laba dapat berubah ketika inventory cost direcalculate.
- Cash flow dapat berbeda dengan payment ledger jika DP/refund/unapplied cash tidak dipisah.
- Aging receivable dapat salah karena allocation default atau credit yang tidak teralokasi.
- Stock balance dan COGS dapat tidak cocok jika return/restock tidak memiliki cost basis.
- Tax report dapat disalahartikan sebagai laporan compliance tanpa scope yang disetujui.
- Laporan aset/expense menyesatkan bila depreciation ditunda tetapi asset purchase otomatis dibebankan.

## 10. Rekomendasi Batasan Scope V1

Berdasarkan repository yang seluruh source dan specification-nya belum ada, scope paling aman untuk dipertimbangkan adalah:

### Candidate V1 core

- Customer, product, unit, sale, payment, dan invoice dasar.
- Double-entry posting engine dengan business transaction UI sederhana.
- Satu lokasi inventory.
- Moving weighted average tanpa batch/expiry dan tanpa multi-location.
- Reject negative stock.
- Explicit payment allocation dan unapplied payment handling.
- DP, return, tax, dan fixed asset hanya jika keputusan detail disetujui; default kandidat: tunda.
- Offline persistence, versioned backup/restore, dan data integrity tests sebagai requirement reliability.

### Candidate V1 exclusions

- Tax compliance engine.
- FIFO/layered costing.
- Multi-currency.
- Multi-location atau batch/expiry.
- Automatic bank reconciliation/payment gateway.
- Full fixed asset lifecycle.
- Silent negative stock.
- Unspecified auto-refund.

Daftar ini adalah scope recommendation bersyarat. PRD kosong, sehingga tidak boleh dianggap product commitment.

## 11. Checklist Persetujuan Pengguna

- [ ] Review audit dan independent review diterima.
- [ ] Scope product promise V1 disetujui.
- [ ] Accounting model dan recognition basis disetujui.
- [ ] Inventory costing dan inventory scope disetujui.
- [ ] Negative stock policy disetujui.
- [ ] DP terminology, lifecycle, dan refund disetujui.
- [ ] Overpayment/unapplied cash/customer credit disetujui.
- [ ] Payment allocation dan reversal disetujui.
- [ ] Tax boundary disetujui.
- [ ] Fixed asset treatment disetujui.
- [ ] Fulfillment/return scope disetujui.
- [ ] Pengguna mengizinkan hasil keputusan dituangkan ke business rules dan schema planning.
- [ ] Pengguna secara terpisah menyetujui dimulainya Phase 1.

Tidak ada checkbox yang dianggap disetujui karena diam atau karena rekomendasi sebelumnya.

## 12. Status dan Stop Condition

Review ini hanya menambah dokumentasi analisis. Tidak ada business rule yang dikunci. Tidak ada source code, database schema, API, dependency, atau Phase 1 work yang dibuat. Phase 0 tetap `Review Required`; menunggu review dan persetujuan eksplisit pengguna.
