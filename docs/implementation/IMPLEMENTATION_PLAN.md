# IMPLEMENTATION PLAN
## UMKM Manager

**Version:** 1.0  
**Status:** Draft – Proposed Implementation Roadmap  
**Target:** V1 Offline-First Application  
**Implementation Agent:** OpenCode

---

# 1. Tujuan

Dokumen ini mendefinisikan urutan implementasi UMKM Manager berdasarkan dokumen produk dan spesifikasi teknis.

Tujuan:
1. Mengubah spesifikasi menjadi pekerjaan implementasi yang terstruktur.
2. Mengurangi risiko kesalahan arsitektur.
3. Memastikan setiap fase mempunyai hasil yang dapat diuji.
4. Mencegah implementasi fitur sebelum fondasinya siap.
5. Memastikan aturan keuangan tidak dibuat sendiri oleh AI coding agent.
6. Mengharuskan persetujuan pengguna sebelum fase berikutnya.

# 2. Prinsip Implementasi

OpenCode wajib mengikuti prinsip berikut:

- Implementasi berdasarkan dokumen yang sudah disetujui.
- Tidak mengarang aturan akuntansi.
- Tidak menambahkan fitur di luar ruang lingkup fase.
- Tidak mengubah arsitektur utama tanpa persetujuan.
- Tidak menghapus data ketika modul dinonaktifkan.
- Tidak mengandalkan koneksi internet untuk operasi inti.
- Tidak membuat transaksi bisnis langsung dari komponen UI.
- Semua operasi keuangan dan stok harus menjaga konsistensi.
- Setiap fase harus mempunyai automated tests.
- Tidak melanjutkan fase berikutnya tanpa persetujuan pengguna.

# 3. Prerequisites

Sebelum implementasi dimulai, OpenCode harus membaca:

1. `PRD.md`
2. `FINANCIAL_LOGIC.md`
3. `BUSINESS_RULES.md`
4. `TRANSACTION_RULES.md`
5. `ACCEPTANCE_CRITERIA.md`
6. `TEST_PLAN.md`
7. `ARCHITECTURE.md`
8. `DATABASE_SCHEMA.md`
9. `OFFLINE_STORAGE.md`
10. `BACKUP_RESTORE.md`

Dokumen UI/UX dari Lovable juga harus digunakan sebagai referensi ketika tersedia.

Jika terdapat kontradiksi:
- Jangan memilih salah satu secara diam-diam.
- Identifikasi kontradiksi.
- Jelaskan dampaknya.
- Ajukan keputusan kepada pengguna.

# 4. Development Strategy

Gunakan pendekatan incremental development.

Setiap fase harus melewati:

```text
SPECIFICATION REVIEW
        |
        v
IMPLEMENTATION
        |
        v
UNIT TESTS
        |
        v
INTEGRATION TESTS
        |
        v
MANUAL VERIFICATION
        |
        v
DOCUMENTATION UPDATE
        |
        v
PHASE REPORT
        |
        v
USER APPROVAL
        |
        v
NEXT PHASE
```

Tidak boleh melewati tahapan pengujian untuk mengejar kecepatan.

# 5. Phase Overview

| Phase | Nama | Prioritas |
|---|---|---|
| 0 | Project Audit & Foundation Review | Critical |
| 1 | Application Foundation | Critical |
| 2 | Local Database & Storage | Critical |
| 3 | Core Financial Engine | Critical |
| 4 | Feature Module System | High |
| 5 | Product & Inventory | High |
| 6 | Customers, Orders & Sales | High |
| 7 | Invoices & Receivables | High |
| 8 | Business Operations | Medium |
| 9 | Reports & Dashboard | High |
| 10 | Backup & Restore | Critical |
| 11 | Offline & Reliability Hardening | Critical |
| 12 | Final QA & V1 Release | Critical |

Urutan dapat disesuaikan jika ditemukan dependensi teknis yang nyata, tetapi perubahan harus dijelaskan dan disetujui.

---

# 6. Detailed Implementation Phases

## PHASE 0 — Project Audit & Foundation Review

**Objective:** Memahami kondisi proyek dan memastikan fondasi sesuai spesifikasi.

Tasks:
- Periksa repository dan struktur folder.
- Periksa hasil implementasi Lovable.
- Periksa package dan dependencies.
- Identifikasi framework aktual.
- Periksa konfigurasi build.
- Identifikasi komponen yang dapat digunakan kembali.
- Bandingkan implementasi yang sudah ada dengan PRD.
- Identifikasi pekerjaan yang sudah selesai dan belum selesai.

Deliverables:
- Project audit report.
- Gap analysis.
- Proposed folder structure.
- Dependency report.
- Implementation readiness report.

Tests:
- Existing build.
- Existing test suite.
- Basic runtime verification.

**Gate:** Tidak boleh melakukan perubahan besar sebelum hasil audit disetujui.

## PHASE 1 — Application Foundation

**Objective:** Membangun kerangka aplikasi.

Tasks:
- Setup project frontend.
- Integrasikan hasil UI/UX Lovable.
- Setup TypeScript.
- Setup routing.
- Setup design tokens dan reusable components.
- Setup Indonesian language defaults.
- Setup error boundary.
- Setup basic application settings.
- Setup build dan testing tools.

Deliverables:
- Application shell.
- Navigation.
- Main dashboard placeholder.
- Settings page.
- Basic component system.

Tests:
- Build passes.
- Routing works.
- Components render.
- No critical console errors.
- Responsive layout checks.

## PHASE 2 — Local Database & Storage

**Objective:** Membuat fondasi penyimpanan data lokal.

Tasks:
- Setup IndexedDB.
- Integrasikan Dexie jika sudah disetujui.
- Implementasikan database schema.
- Implementasikan repository layer.
- Implementasikan schema migrations.
- Implementasikan transaction wrapper.
- Implementasikan ID generation.
- Implementasikan database initialization.
- Implementasikan storage error handling.

Deliverables:
- Working local database.
- Repository layer.
- Migration mechanism.
- Database initialization.
- Data access tests.

Tests:
- Create/read/update operations.
- Relationship integrity.
- Transaction rollback.
- Migration tests.
- Reload persistence.
- Browser restart persistence.

**Gate:** Tidak boleh membangun transaksi keuangan sebelum database foundation dinyatakan stabil.

## PHASE 3 — Core Financial Engine

**Objective:** Membangun inti pengolahan keuangan.

Tasks:
- Implementasikan financial domain models.
- Implementasikan transaction engine.
- Implementasikan financial engine.
- Implementasikan saldo kas dan bank.
- Implementasikan modal pemilik.
- Implementasikan owner withdrawal.
- Implementasikan pendapatan dan pengeluaran.
- Implementasikan transfer internal.
- Implementasikan validasi transaksi.
- Implementasikan audit trail.
- Implementasikan idempotency.

Important:
- Sumber kebenaran saldo harus ditentukan secara eksplisit.
- Jangan menghitung satu transaksi dua kali.
- Jangan menyamakan arus kas dengan laba.
- Jangan menganggap modal sebagai pendapatan.
- Jangan menganggap pengambilan pemilik sebagai beban operasional.

Deliverables:
- Core financial engine.
- Financial transaction services.
- Financial validation.
- Audit records.

Tests:
- Modal.
- Income.
- Expenses.
- Transfers.
- Owner withdrawals.
- Duplicate transaction prevention.
- Atomic transaction rollback.
- Financial balance consistency.

**Gate:** Model pencatatan keuangan dan seluruh keputusan akuntansi kritis harus disetujui sebelum implementasi final.

## PHASE 4 — Feature Module System

**Objective:** Memungkinkan pengguna mengaktifkan dan menonaktifkan fitur.

Tasks:
- Implementasikan feature registry.
- Implementasikan feature dependencies.
- Implementasikan active/inactive states.
- Implementasikan Tambah Fitur.
- Implementasikan menu dinamis.
- Implementasikan feature settings.
- Pastikan data tidak terhapus ketika modul dinonaktifkan.

Deliverables:
- Feature management system.
- Feature registry.
- Module activation interface.

Tests:
- Activate module.
- Deactivate module.
- Re-enable module.
- Preserve module data.
- Dependency validation.
- Navigation updates.

## PHASE 5 — Products & Inventory

**Objective:** Mengimplementasikan produk dan persediaan.

Tasks:
- Product CRUD.
- Product categories.
- Units of measurement.
- Purchase cost.
- Selling price.
- Inventory movements.
- Stock balances.
- Stock adjustments.
- Stock valuation.
- Cost of Goods Sold integration.

Deliverables:
- Product management.
- Inventory management.
- Stock movement history.
- Inventory valuation.

Tests:
- Create product.
- Update product.
- Stock in.
- Stock out.
- Manual adjustment.
- Unit conversion.
- Stock valuation.
- Negative stock policy.
- Inventory rollback.

**Gate:** Metode HPP dan kebijakan stok negatif harus sudah diputuskan.

## PHASE 6 — Customers, Orders & Sales

**Objective:** Membuat sistem pelanggan, pesanan, dan penjualan.

Tasks:
- Customer management.
- Customer autocomplete.
- Customer identity matching.
- Order creation.
- Order item management.
- Order status management.
- Direct sales.
- Order fulfillment.
- Partial fulfillment.
- Sales transaction creation.
- Inventory integration.
- Financial integration.

Deliverables:
- Customer module.
- Orders module.
- Sales module.
- Sales history.

Tests:
- Create customer.
- Match existing customer.
- Prevent accidental duplicate customer merging.
- Create order.
- Cancel order.
- Fulfill order.
- Partial fulfillment.
- Direct sale.
- Stock deduction exactly once.
- Revenue recognition exactly once.

**Gate:** Aturan pengakuan penjualan dan pemenuhan pesanan harus sudah disetujui.

## PHASE 7 — Invoices & Receivables

**Objective:** Mengimplementasikan nota digital dan piutang.

Tasks:
- Invoice numbering.
- Invoice generation.
- PDF export.
- Payment recording.
- Partial payment.
- Multiple payment methods.
- Payment allocation.
- Receivable balance.
- Due dates.
- Customer ledger.
- Overdue detection.
- Receivable aging report.

Deliverables:
- Digital invoice.
- Payment history.
- Receivable management.
- Customer financial statement.

Tests:
- Full payment.
- Partial payment.
- Multiple installments.
- Duplicate payment prevention.
- Payment allocation.
- Outstanding balance.
- Overdue status.
- PDF generation.
- Offline invoice creation.

**Gate:** Kebijakan DP, alokasi pembayaran, kelebihan pembayaran, pembatalan, dan refund harus sudah disetujui.

## PHASE 8 — Business Operations

**Objective:** Melengkapi operasional usaha.

Tasks:
- Supplier management.
- Purchase management.
- Payables.
- Supplier payments.
- Employee management.
- Payroll.
- Budget management.
- Savings goals.
- Business assets, jika sudah disetujui.

Deliverables:
- Supplier module.
- Payables module.
- Employee module.
- Payroll module.
- Additional operational modules sesuai persetujuan.

Tests:
- Purchase and stock integration.
- Payable creation.
- Supplier payment.
- Payroll.
- Salary expense recognition.
- Budget tracking.

**Gate:** Fitur yang belum diputuskan tidak boleh diimplementasikan berdasarkan asumsi.

## PHASE 9 — Reports & Dashboard

**Objective:** Menyediakan informasi usaha yang mudah dipahami.

Tasks:
- Dashboard summaries.
- Cash flow report.
- Sales report.
- Expense report.
- Profit report.
- Inventory report.
- Receivable report.
- Payable report.
- Payroll report.
- Date filters.
- Export reports.

Deliverables:
- Business dashboard.
- Financial reports.
- Operational reports.
- Export functions.

Tests:
- Report calculation.
- Date boundaries.
- Cross-report consistency.
- Incomplete data warnings.
- Export accuracy.

Important:
Laporan laba tidak boleh menampilkan angka yang seolah-olah pasti jika data HPP atau transaksi belum lengkap.

## PHASE 10 — Backup & Restore

**Objective:** Melindungi dan memulihkan seluruh data usaha.

Tasks:
- Full backup.
- Backup manifest.
- Checksum.
- Backup versioning.
- Restore validation.
- Restore preview.
- Safe restore.
- Database recovery.
- Cross-device restore.
- Migration compatibility.

Deliverables:
- Backup system.
- Restore system.
- Integrity validation.
- Recovery procedures.

Tests:
- Full backup.
- Full restore.
- Cross-device restore.
- Corrupt backup.
- Invalid checksum.
- Unsupported version.
- Restore failure recovery.
- Record count comparison.
- Financial and stock reconciliation.

## PHASE 11 — Offline & Reliability Hardening

**Objective:** Memastikan aplikasi dapat diandalkan tanpa internet.

Tasks:
- Service worker.
- App shell caching.
- Offline startup after initial installation.
- IndexedDB persistence checks.
- Storage quota monitoring.
- Multiple-tab behavior.
- Unexpected shutdown handling.
- Error recovery.
- Offline PDF/export.
- Data integrity checks.
- Performance optimization.

Deliverables:
- Reliable offline application.
- Storage monitoring.
- Error recovery mechanisms.

Tests:
- First installation.
- Offline after initial load.
- Browser restart.
- Storage failure.
- Quota exceeded.
- Multiple tabs.
- Interrupted operations.
- Large dataset performance.

## PHASE 12 — Final QA & V1 Release

**Objective:** Memastikan produk siap digunakan.

Tasks:
- Full regression testing.
- Financial reconciliation.
- Inventory reconciliation.
- Backup and restore validation.
- UI/UX review against Lovable references.
- Accessibility review.
- Performance review.
- Security review.
- Documentation.
- Release build.

Deliverables:
- Release candidate.
- Test report.
- Known issues list.
- User guide.
- Backup guide.
- Release notes.

Release requirements:
- No unresolved Critical bugs.
- No unresolved High bugs affecting core workflows.
- All critical acceptance criteria pass.
- Financial and inventory consistency verified.
- Backup and restore verified.
- Offline core operations verified.
- User approves release.

---

# 7. Definition of Done

Sebuah fase hanya dinyatakan selesai jika:

1. Seluruh pekerjaan fase sudah diimplementasikan.
2. Automated tests berhasil.
3. Integration tests berhasil.
4. Tidak ada bug Critical yang belum terselesaikan.
5. Dokumentasi diperbarui.
6. Tidak ada perubahan tidak disetujui.
7. Hasil implementasi dapat diperiksa pengguna.
8. OpenCode memberikan laporan fase.
9. Pengguna menyetujui hasil fase.

# 8. Required Phase Report

Setelah setiap fase, OpenCode harus melaporkan:

- Fase yang dikerjakan.
- Tujuan.
- File yang dibuat.
- File yang diubah.
- Implementasi yang selesai.
- Tests yang dijalankan.
- Jumlah tests passed/failed.
- Build status.
- Known issues.
- Risiko.
- Perbedaan dengan spesifikasi.
- Keputusan yang masih dibutuhkan.
- Rekomendasi fase berikutnya.

Jangan hanya melaporkan bahwa implementasi selesai tanpa bukti pengujian.

# 9. Change Management

Jika OpenCode menemukan kebutuhan perubahan:

1. Hentikan pekerjaan yang terdampak.
2. Jelaskan masalah.
3. Jelaskan opsi solusi.
4. Jelaskan dampak pada database, API, UI, dan data lama.
5. Tunggu persetujuan pengguna.
6. Perbarui dokumen terkait.
7. Lanjutkan implementasi setelah disetujui.

Perubahan kecil internal boleh dilakukan jika tidak mengubah kontrak, perilaku bisnis, atau ruang lingkup yang disetujui.

# 10. Scope Control

Tidak termasuk V1 kecuali disetujui secara eksplisit:

- Cloud synchronization.
- User account/login.
- Multi-user collaboration.
- AI assistant.
- Automatic cloud backup.
- Automatic online banking integration.
- Automatic payment gateway.
- Multi-device live synchronization.
- Advanced tax filing.
- Enterprise ERP functions.

# 11. Final Implementation Principle

UMKM Manager harus dibangun dengan prioritas:

1. Data integrity.
2. Financial correctness.
3. Offline reliability.
4. Ease of use.
5. Modular extensibility.
6. Performance.
7. Visual polish.

Aplikasi yang terlihat menarik tetapi menghasilkan saldo, piutang, stok, atau laba yang salah tidak dapat dianggap berhasil.

---

**Document Status:** Draft – Proposed Implementation Roadmap.  
**Implementation Authorization:** Requires explicit user approval.
# IMPLEMENTATION_PLAN.md

**UMKM Manager — Implementation Plan**  
Version: 1.1  
Status: Draft – Audit Revision  
Approval: Pending Product Owner Approval

## 1. Tujuan

Menetapkan tahapan implementasi UMKM Manager dengan kontrol ruang lingkup, pengujian, dan persetujuan Product Owner pada setiap fase.

## 2. Aturan pelaksanaan

1. OpenCode wajib membaca dokumen yang telah disetujui.
2. Tidak boleh menetapkan sendiri aturan keuangan atau transaksi.
3. Tidak boleh memulai fase berikutnya tanpa persetujuan.
4. Tidak boleh mengubah skema database atau kontrak API di luar ruang lingkup fase.
5. Setiap fase wajib memiliki test report.
6. Perubahan dependency, arsitektur, atau struktur proyek harus dijelaskan dan disetujui.
7. Hasil Lovable harus diaudit sebelum diintegrasikan.
8. Data historis tidak boleh dihapus ketika modul dinonaktifkan.

## 3. Fase implementasi

### Phase 0 — Project and Documentation Audit

Tujuan:
- Memeriksa repository.
- Membaca spesifikasi.
- Memeriksa hasil Lovable jika tersedia.
- Mengidentifikasi konflik dan gap.

Deliverables:
- Repository audit report.
- Documentation consistency report.
- Architecture gap report.
- Daftar keputusan yang belum disetujui.
- Rekomendasi urutan implementasi.

Larangan:
- Tidak ada coding.
- Tidak ada perubahan dependency.
- Tidak ada perubahan skema/database/API/config.
- Tidak ada penghapusan atau pemindahan file.

Gate: persetujuan Product Owner.

### Phase 1 — Application Foundation

Tujuan:
- Menyiapkan fondasi aplikasi.
- Mengintegrasikan hasil UI/UX yang telah disetujui.
- Menyiapkan routing, layout, komponen, dan konfigurasi.

Deliverables:
- Aplikasi dapat dijalankan.
- Struktur komponen.
- Navigasi utama.
- Error boundary dan state dasar.
- Build dan test dasar.

Tidak boleh membuat financial engine sebelum keputusan model keuangan disetujui.

Gate: UI foundation dan build disetujui.

### Phase 2 — Local Database, Storage, and Minimum Backup

Tujuan:
- Menyiapkan database lokal.
- Menyiapkan repository.
- Menyiapkan migrasi.
- Menyiapkan mekanisme backup minimum.

Deliverables:
- IndexedDB dan wrapper yang disetujui.
- Schema versioning.
- Repository pattern.
- Backup minimum.
- Validasi file backup.
- Test persistensi setelah restart.

Gate:
- Database dapat digunakan.
- Migrasi diuji.
- Backup minimum dapat dibuat dan divalidasi.
- Kegagalan penyimpanan ditangani.

### Phase 3 — Transaction Engine and Financial Core

Tujuan:
- Membangun fondasi transaksi dan keuangan.

Prasyarat:
- Model akuntansi disetujui.
- Struktur akun disetujui.
- Aturan posting dan koreksi disetujui.
- Aturan presisi uang ditetapkan.

Deliverables:
- Transaction Engine.
- Financial Engine.
- Posting dan reversal.
- Idempotensi.
- Atomicity.
- Audit trail.
- Unit dan integration tests.

Gate: seluruh skenario keuangan kritis lulus dan dapat direkonsiliasi.

### Phase 4 — Feature Module System

Tujuan:
- Menyiapkan pengelolaan fitur opsional.

Deliverables:
- Feature Registry.
- Aktivasi/deaktivasi modul.
- Validasi dependensi.
- Persistensi konfigurasi.
- Perlindungan data saat modul dinonaktifkan.

Gate: modul dapat diaktifkan/dinonaktifkan tanpa kehilangan data.

### Phase 5 — Products and Inventory

Prasyarat:
- Metode HPP disetujui.
- Kebijakan stok negatif disetujui.
- Konversi satuan ditetapkan.

Deliverables:
- Produk.
- Satuan.
- Inventory movements.
- Stock balance.
- Pembelian dan penerimaan stok.
- Pengeluaran stok.
- HPP.
- Retur dan penyesuaian stok.

Gate: rekonsiliasi stok dan HPP lulus.

### Phase 6 — Customers, Orders, and Sales

Deliverables:
- Profil pelanggan.
- Pencarian dan autocomplete.
- Pesanan.
- Status operasional.
- Pemenuhan.
- Penjualan.
- Relasi transaksi.

Gate: penjualan dan pemenuhan tidak menghasilkan transaksi/stok ganda.

### Phase 7 — Digital Invoices and Receivables

Deliverables:
- Invoice.
- Nota digital.
- Pembayaran.
- Cicilan.
- Alokasi pembayaran.
- Piutang.
- Aging report.
- PDF offline.

Prasyarat:
- Kebijakan DP disetujui.
- Kelebihan pembayaran disetujui.
- Alokasi lintas invoice disetujui.

Gate: saldo invoice dan pembayaran dapat direkonsiliasi.

### Phase 8 — Business Operations

Deliverables:
- Pemasok.
- Utang.
- Biaya.
- Karyawan.
- Payroll.
- Anggaran.
- Aset usaha sesuai ruang lingkup yang disetujui.

Gate: transaksi operasional tidak menghasilkan biaya atau pembayaran ganda.

### Phase 9 — Dashboard and Reports

Deliverables:
- Dashboard.
- Laporan penjualan.
- Laba rugi sesuai cakupan.
- Arus kas.
- Piutang.
- Utang.
- Persediaan.
- Indikator data tidak lengkap.

Gate: seluruh laporan direkonsiliasi dengan sumber data.

### Phase 10 — Complete Backup and Restore

Tujuan:
- Menyelesaikan sistem backup/restore.

Deliverables:
- Backup penuh.
- Manifest dan checksum.
- Validasi versi.
- Preview.
- Restore staging.
- Rollback.
- Restore lintas perangkat.
- Pengujian file rusak dan kegagalan restore.

Gate: backup/restore berhasil tanpa merusak database aktif.

### Phase 11 — Offline and Reliability Hardening

Deliverables:
- Offline behavior.
- Service Worker/cache.
- Storage quota handling.
- Multi-tab handling.
- Recovery.
- Migrasi.
- Error handling.
- Security review.
- Performance testing.

Gate: seluruh test reliability wajib lulus.

### Phase 12 — Final QA and V1 Release

Deliverables:
- Regression test.
- E2E test.
- Test report final.
- Known issues.
- User documentation.
- Release notes.
- Persetujuan Product Owner.

Gate: tidak ada bug Critical/High terbuka dan seluruh kriteria rilis dipenuhi.

## 4. Aturan perubahan ruang lingkup

Jika implementasi menemukan kebutuhan perubahan:
1. Hentikan bagian yang terdampak.
2. Jelaskan masalah.
3. Jelaskan dampak terhadap database, transaksi, UI, dan pengujian.
4. Ajukan opsi.
5. Tunggu persetujuan.
6. Perbarui dokumen sebelum coding perubahan.

## 5. Ketentuan selesai fase

Setiap fase wajib melaporkan:
- Tujuan.
- File yang dibuat/diubah.
- Fitur yang selesai.
- Test yang dijalankan.
- Hasil test.
- Masalah terbuka.
- Risiko.
- Penyimpangan dari spesifikasi.
- Bukti build/test.
- Permintaan persetujuan fase berikutnya.

## 6. Batasan

Dokumen ini merupakan rencana draft. Keputusan yang belum disetujui bukan izin implementasi. Phase 0 merupakan audit saja dan tidak memberi izin coding.