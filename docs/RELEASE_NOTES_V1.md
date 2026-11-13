# RELEASE NOTES V1 — UMKM Manager

**Versi:** 1.0 (Release Candidate)  
**Tanggal:** 2026-11-14  
**Status:** Release Candidate — belum dirilis

## Ringkasan Fitur per Fase

| Fase | Nama | Status | Fitur Utama |
|------|------|---|---|
| 0 | Project Audit & Foundation Review | Completed | Struktur repo, branch, remote, commit; identifikasi gap dokumentasi |
| 1 | Application Foundation | Completed | Setup Vite + React + Vitest; ErrorBoundary; database foundation |
| 2 | Local Database & Storage | Completed | IndexedDB via Dexie; skema v1 (businesses, products, customers, settings, features, journals); operasi CRUD dasar |
| 3 | Core Financial Engine | Completed | Chart of accounts (1010 Kas, 1100 Piutang, 4000 Pendapatan, 5000 Beban, 5100 HPP); double-entry journal posting; idempotency keys; trial balance; journal reversal |
| 4 | Feature Module System | Completed | Aktivasi/nonaktifasi fitur via fitur repository; toggle menu |
| 5 | Products & Inventory | Completed | Produk CRUD; stok barang masuk/keluar; penyesuaian stok; kategori produk |
| 6 | Customers, Orders & Sales | Completed | Pelanggan CRUD; pembuatan pesanan; status pesanan dipisah dari status pembayaran |
| 7 | Invoices & Receivables | Completed | Pembuatan nota (invoice); PDF offline; umur piutang (aging); pembayaran penuh/terbagi/lebih |
| 8 | Business Operations | In Progress (approved subset) | **Supplier CRUD** + **Employee CRUD** hanya. Payroll, payables, budgets, assets pending DEC-005/006/008/009/010. |
| 9 | Reports & Dashboard | Completed | Dashboard posisi kas & piutang; laporan keuangan (pendapatan, beban, HPP, laba); laporan operasional (penjualan, stok, piutang, utang); ekspor data |
| 10 | Backup & Restore | Completed | Export backup (format terter, versi skema); import backup dengan rollback atomic; validasi manifest; restore cash/receivable/journal consistency |
| 11 | Offline & Reliability Hardening | Completed | Service worker shell cache (v3) dengan awaited cache writes; navigate fallback pada non-OK response; tab coordination read-only lock + takeover; warning kuota UI >=80%; DB recovery screen (Indonesian + reload); formatDatabaseError; manual offline reload verified 2026-11-14 |

## Batasan V1 (Tidak Terdiri di Rilis Ini)

- ❌ Payroll / penggajian karyawan (DEC-009)
- ❌ Pengelolaan utang & piutang lengkap (payables/accounts payable — DEC-005)
- ❌ Fitur budgets & anggaran (DEC-006)
- ❌ Aset usaha (assets — DEC-008)
- ❌ Kategori transaksi kustom di jurnal (ISSUE-011)
- ❌ Content Security Policy (CSP) pada index.html (S-4 security review)
- ❌ Multi-user / autentikasi & akun berbeda
- ❌ Ekspor laporan laba rugi / arus kas / aging terpisah (laporan tersedia tapi belum dipisahkan ke file terpisah di V1)
- ❌ CDP Network.emulateNetworkConditions offline simulation (offline diverifikasi pakai server termination)

## Persyaratan Sistem

- Browser: Chrome, Edge, atau Firefox terbaru
- Sistem operasi: Windows 10/11, macOS, atau Linux (dengan browser modern)
- Tidak ada persyaratan server backend; semua state di penyimpanan lokal browser

## Build & Distribusi

- `npm run build` menghasilkan:
  - `dist/index.html`
  - `dist/assets/index-*.js` (~348 KB gzip)
  - `dist/assets/index-*.css` (~31 KB gzip)
- Aplikasi bisa di-hosting static file server (Vite preview, Nginx, GitHub Pages, dll).
- Service worker (`sw.js`) sudah terintegrasi; akan merender aplikasi dari cache saat koneksi tidak tersedia.

## Catatan Penting

1. Aplikasi ini **hanya untuk satu pengguna** di satu perangkat; tidak ada fitur multi-user atau pengelolaan hak akses.
2. Semua data disimpan di IndexedDB browser; **backup manual** diperlukan sebelum pindah perangkat atau melakukan penginstalan ulang.
3. Jika fitur Phase 8 penuh (payables, payroll, budgets, assets) dibutuhkan, harap menunggu keputusan bisnis DEC-005/006/008/009/010 sebelum mengaktifkan modul tersebut.
4. Setiap transaksi penjualan secara atomik mencakup: membuat jurnal, mengurangi stok, dan memperbarui status pembayaran — tidak boleh double-count.
5. Nominal uang selalu integer Rupiah; tidak ada operasi desimal di dalam database.
6. Aplikasi diuji dengan `npm test` (102 tests, exit 0) dan `npm run build` (pass).
7. Verifikasi offline dilakukan dengan menghentikan proses server preview lalu merefresh; aplikasi terus berjalan dari cache service worker dan data IndexedDB tetap ada.

## Update Selanjutnya (V2 Roadmap — belum dijadwalkan)

- Aktifkan modul payables (AP) setelah DEC-005 disetujui.
- Aktifkan modul payroll setelah DEC-009 disetujui.
- Aktifkan modul budgets & assets setelah DEC-006/008 disetujui.
- Sertakan CSP (Content Security Policy) untuk mitigasi S-4.
- Tambahkan enkripsi data at rest (mitigasi S-2).
- Perbaiki validasi row shape pada import backup (mitigasi S-1).

---

**Catatan:** Aplikasi ini sedang dalam tahap *Release Candidate*. Semua fitur wajib PRD dan acceptance criteria kritis telah terverifikasi melalui 102 unit/integration tests, build produksi, dan manual QA di preview production. Masih ada keputusan bisnis pending (DEC-*) yang menentukan apakah Phase 8 full scope akan diaktifkan sebelum rilis final.

---
**End of Release Notes V1**