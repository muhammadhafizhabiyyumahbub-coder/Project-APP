# RELEASE TEST REPORT — UMKM Manager V1

**Generated:** 2026-11-14  
**Test Command:** `cmd /c "npm test > t.txt 2>&1"; set EXIT=%ERRORLEVEL%; type t.txt | findstr /r /c:"Test Files" /c:"Tests " /c:"FAIL"; del t.txt`  
**Build Command:** `npm run build`  
**Exit Code:** 0 (all tests passed)

## Test Summary

| Metric | Result |
|---|---|
| Test Files | 25 passed |
| Tests | 105 passed |
| Skipped | 0 |
| Failed | 0 |
| Build | ✓ passed |
| Bundle JS (gzip) | ~103 KB |
| Bundle CSS (gzip) | ~5.8 KB |

## Acceptance Criteria Coverage

| AC ID | Criteria | Test Status |
|---|---|---|
| AC-GLOBAL-01 | Offline functionality | Pass (manual: reload with server stopped, app served from SW cache) |
| AC-GLOBAL-02 | Penyimpanan data | Pass (IndexedDB persists after browser close/reopen) |
| AC-GLOBAL-03 | Konsistensi transaksi | Pass (payment double-count test; atomic sale+stock+journal) |
| AC-GLOBAL-04 | Pengalaman pengguna | Pass (Indonesian UI, Rupiah format, clear error messages) |
| AC-GLOBAL-05 | Data historis | Pass (backup/restore preserves record counts and balances) |
| AC-BACKUP-01 | Backup | Pass (exportBackup creates valid manifest with schema version) |
| AC-BACKUP-02 | Restore | Pass (importBackup atomic rollback; restore cash/receivable/journal consistency) |
| AC-BACKUP-03 | Konsistensi | Pass (balances match before/after restore) |
| AC-SEC-01 | Validasi nominal/kuantitas/tanggal | Pass (validation tests for positive integers, non-negative) |
| AC-SEC-02 | Ketahanan | Pass (app recoverable after init failure; DB error screen in Indonesian) |
| AC-REPORT-01 | Laporan keuangan | Pass (dashboard aggregation from posted journals) |
| AC-OFFLINE-01 | Pengguna tanpa internet | Pass (manual: network stopped, SW shell cache served app) |
| AC-OFFLINE-02 | Transaksi offline | Pass (simpan transaksi offline, tutup browser, buka kembali, data tetap ada) |
| AC-OFFLINE-03 | Beberapa tab | Pass (read-only banner + takeover button; module test covers acquire/release/takeover) |
| AC-OFFLINE-04 | Warning kuota | Pass (UI banner at >=80%; clear-SW-cache action only) |

## Manual QA Checklist (sesi ini, preview production)

| # | Langkah | Hasil |
|---|---|---|
| 1 | Buka app preview `http://127.0.0.1:4173/` | Pass |
| 2 | Navigasi semua halaman utama (Dashboard, Keuangan, Penjualan, Produk, Pelanggan, Laporan) | Pass |
| 3 | Tambah Produk → fill → Simpan → row muncul di tabel | Pass |
| 4 | Edit harga → Simpan → row ter-update | Pass |
| 5 | Hapus → accept dialog → row dihapus | Pass |
| 6 | Tambah Pelanggan → fill → Simpan → customer ter-list | Pass |
| 7 | Penjualan cash: buat sale → verify journal → console error none | Pass |
| 8 | Penjualan kredit: buat sale credit → recordPayment → verify receivable, no duplicate revenue | Pass |
| 9 | Reload (server stopped) → app served from SW cache → IndexedDB data intact, heading "Dashboard", no console errors | Pass |
| 10 | Multi-tab: second tab shows "Tab ini mode baca saja" banner + "Ambil alih kendali" button; takeover works | Pass |
| 11 | Storage quota warning (≥80%) → UI banner + "Bersihkan cache aplikasi" → clear only SW cache | Pass |
| 12 | Tambah produk dengan stok dan harga → verify di tampilan daftar produk | Pass |

## Notes

- All 105 unit/integration tests pass with `npm test` (exit 0).
- Build passes (`npm run build`); production bundle 348 KB raw (103 KB gzip) JS, 31 KB raw (5.8 KB gzip) CSS.
- Offline verification done by terminating the preview server process; reload served cached `umkm-manager-shell-v3` shell plus hashed assets; IndexedDB data intact.
- Security review `docs/security/SECURITY_REVIEW_V1.md` completed; findings S-1 (backup row validation gap), S-2 (data at rest unencrypted), S-3 (multi-tab advisory lock), S-4 (no CSP) documented; no behavioral changes made.
- Phase 8 full scope blocked by pending business decisions DEC-005/006/008/009/010.