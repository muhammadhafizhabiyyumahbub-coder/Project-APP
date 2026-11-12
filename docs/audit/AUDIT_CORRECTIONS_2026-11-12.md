# AUDIT CORRECTIONS — 2026-11-12

## Summary

Re-audit of implementation against findings P.1–P.8. Three findings fixed and verified, three findings not reproduced in current code, one finding blocked pending business decision.

## P.1 Quantity Input — FIXED

**Was:** `setQty()` rejected empty string (`if (value === '') return`), so clearing the input to type a new number snap-back to the previous value.

**Now:** Temporary input state (`qtyInputs`) holds raw text while typing. `commitQty()` validates on blur. Checkout re-validates cart quantity before submit. Stock re-checked inside `createSale()` → `reserveSaleStock()` atomically.

**Files:** `docs/design/app.jsx` (setQty, commitQty, input binding, checkout guard).

**Evidence:** test suite passes; checkout guard rejects non-integer/zero/over-stock quantities.

## P.4 Payment Idempotency — FIXED

**Was:** Idempotency lookup ran outside the DB transaction. Payment number reused on a different invoice could return the wrong payment.

**Now:** Lookup, validation, journal post, payment write, and sale update all run inside one `db.transaction('rw', ...)`. Existing payment must match `saleId`; mismatch throws. Retry with same payment number returns the same payment without a duplicate journal.

**Files:** `src/financial/transactionEngine.js`.

**Evidence:** 3 new tests in `src/financial/transactionEngine.test.js`:
- retry same payment number → same payment id, one journal, paidAmount unchanged
- same payment number on second invoice → rejected, second sale paidAmount stays 0
- partial then full payment → sale status transitions UNPAID → COMPLETED, one journal per payment

## P.6 Dashboard Period Filtering — FIXED

**Was:** Period select changed the label only; all balances/chart data came from all posted journals regardless of period.

**Now:** New `dashboardAggregation.js` computes period start/end dates, filters POSTED journals by `transactionDate`, and sums balances from that filtered set. Dashboard re-loads when `period` changes.

**Files:** `src/financial/dashboardAggregation.js` (new), `src/financial/dashboardAggregation.test.js` (new), `docs/design/app.jsx` (DashboardScreen load effect + dependency).

**Evidence:** 2 new tests: period range for "Bulan Ini", posted-only filtering excludes DRAFT and out-of-period journals.

## P.2 Custom Category — NOT REPRODUCED

Current financial form has one free-text field labelled `Deskripsi transaksi`. It maps to journal `description` only. Transaction types are fixed (`EXPENSE`, `CAPITAL`, `WITHDRAWAL`) and account mapping is hardcoded per type in `transactionEngine.js`. There is no code path where user text selects debit/credit accounts. No fix required; label is slightly misleading but changing it is cosmetic, not a correctness fix.

## P.3 Save/Load Reliability — NOT REPRODUCED

`FinancialScreen.loadData()` wraps load in try/catch and sets a user-visible error. `handleSubmit` sets error on handler failure. Save handlers (`recordOperatingExpense`, `recordCapitalContribution`, `recordOwnerWithdrawal`, `recordPayment`) all write inside `db.transaction`, so a mid-way failure rolls back rather than leaving partial data. Success notice only set after `await` resolves.

## P.5 Order Status vs Payment Status — BLOCKED

`sale.status` currently carries payment state (`COMPLETED`/`UNPAID`). Invoice-level status (`PAID`/`PARTIAL`/`OVERDUE`) is computed at read time in `invoiceRepository.getInvoiceStatus()`. Operational order status (processing/delivered/etc.) is not modelled — `Pesanan` route is a placeholder screen.

Splitting order status from payment status requires a new field and a policy decision (what status values exist, who transitions them, whether DP/partial fulfilment changes revenue recognition). That is in the Pending section of `BUSINESS_DECISION_REGISTER.md`. Not changed without approval.

## P.7 Cross-Module Integration — NOT REPRODUCED

Product search (`productSearch.js`) matches name and SKU case-insensitively; category filter normalizes case. Stock deduction happens inside the same transaction as the sale journal. Receivables read `sales` directly, so no duplicate invoice store. Dashboard now reads posted journals only. No regressions found across the 80-test suite.

## P.8 Documentation — UPDATED

- `PHASE_STATUS.md`: Phase 7 marked Completed; test counts updated to current suite.
- `TEST_PLAN.md`: test inventory refreshed.
- `BUSINESS_DECISION_REGISTER.md`: unchanged — no pending decision was converted to approved.
- Historical audit reports left intact. Corrections recorded in this dated addendum.

## P.9 Backup/Restore Atomicity — FIXED (2026-11-12, follow-up)

**Was:** `exportBackup()` read each table in its own implicit transaction, so concurrent writes could produce a mixed snapshot. `importBackup()` ran restore in one transaction but then, on failure, started a *second* transaction that cleared all tables and re-wrote a snapshot taken before the restore. That second write could fail part-way or overwrite data written by another tab after the snapshot.

**Now:** Export reads every table inside one read transaction. Import runs a single read-write transaction; Dexie aborts and rolls back automatically when any row fails, so the previous data stays as it was. The compensating second transaction was removed.

**Files:** `src/storage/backupRepository.js`, `src/storage/backupRepository.test.js`.

**Evidence:** new test `rolls back fully when a restored row fails mid-way` inserts a customer row without a primary key; import rejects and `C001` is still present. Suite: 84 tests, 17 files, exit 0.

## P.10 Local Transaction Date — FIXED (2026-11-12, follow-up)

**Was:** UI transaction dates and dashboard period boundaries used `toISOString().slice(0, 10)`, which is UTC-based. Around local midnight, a transaction could be stored under the previous or next business date.

**Now:** Added `src/financial/dateKey.js` with `toLocalDateKey()`. POS, finance, receivables, customer payments, invoice overdue checks, and dashboard period ranges use local calendar dates. Existing stored ISO date keys remain compatible.

**Evidence:** 2 date-key tests cover padded dates and early local morning; full suite passes.

## P.11 Timestamp-based ID Collision — FIXED (2026-11-12, follow-up)

**Was:** Sale, payment, journal, stock-in, and stock-adjustment IDs used `Date.now()`. Two operations in the same millisecond could overwrite the same IndexedDB primary key.

**Now:** Added `createId(prefix)`, using `crypto.randomUUID()` where available and a timestamp-plus-random fallback. Replaced timestamp-only IDs at all identified production call sites. No schema change; IDs remain strings with existing entity prefixes.

**Evidence:** 100 IDs generated under a frozen timestamp are distinct; transaction and inventory engine tests pass.

## Validation

- `npm test`: 87 tests, 19 files, exit code 0 (verified via `cmd /c`).
- `npm run build`: pass (vite, 55 modules).