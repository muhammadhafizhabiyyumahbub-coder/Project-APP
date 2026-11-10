# TEST REPORT TEMPLATE
## UMKM Manager

**Version:** 1.0  
**Status:** Draft – Proposed Testing Report Standard  
**Project:** UMKM Manager  
**Purpose:** Standardized Test Execution and Verification Report

---

# 1. Test Report Information

| Field | Value |
|---|---|
| Report ID | TR-YYYY-MM-DD-001 |
| Project | UMKM Manager |
| Application Version | |
| Phase | |
| Test Date | |
| Tester | OpenCode |
| Environment | |
| Branch | |
| Commit Hash | |
| Report Status | Draft |

# 2. Test Objectives

Tuliskan tujuan pengujian.

Contoh:
- Memastikan transaksi penjualan berjalan benar.
- Memastikan pembayaran tidak tercatat sebagai penjualan kedua.
- Memastikan stok berkurang tepat satu kali.
- Memastikan saldo piutang dihitung dengan benar.
- Memastikan data tetap tersedia setelah aplikasi dimulai ulang.

# 3. Test Environment

Catat lingkungan pengujian yang sebenarnya.

| Component | Details |
|---|---|
| Operating System | |
| Browser | |
| Browser Version | |
| Runtime | |
| Framework Version | |
| Database | |
| Test Framework | |
| Application Build | |
| Network Condition | |

Jangan mengisi informasi yang belum diverifikasi.

# 4. Test Execution Summary

| Metric | Result |
|---|---:|
| Total Tests | 0 |
| Passed | 0 |
| Failed | 0 |
| Skipped | 0 |
| Blocked | 0 |
| Not Executed | 0 |

Status:

- PASS: Semua pengujian wajib berhasil.
- FAIL: Satu atau lebih pengujian wajib gagal.
- BLOCKED: Pengujian tidak dapat dijalankan karena hambatan.
- PARTIAL: Sebagian pengujian berhasil, tetapi belum lengkap.
- NOT RUN: Pengujian belum dilaksanakan.

Jangan menghitung Skipped, Blocked, atau Not Executed sebagai Passed.

# 5. Test Categories

## 5.1 Unit Tests

| Test ID | Test Name | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| UNIT-001 | Financial calculation | Correct result | | |
| UNIT-002 | Stock calculation | Correct result | | |
| UNIT-003 | Receivable calculation | Correct result | | |
| UNIT-004 | Payment allocation | Correct result | | |

## 5.2 Integration Tests

| Test ID | Test Name | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| INT-001 | Sales and inventory integration | Stock deducted correctly | | |
| INT-002 | Sales and finance integration | Revenue recorded once | | |
| INT-003 | Payment and receivables integration | Outstanding balance updated | | |
| INT-004 | Purchase and payable integration | Stock and payable consistent | | |

## 5.3 End-to-End Tests

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| E2E-001 | Create a product | Product available | | |
| E2E-002 | Create a sale | Sale recorded | | |
| E2E-003 | Record partial payment | Outstanding balance correct | | |
| E2E-004 | Generate digital invoice | Invoice generated | | |
| E2E-005 | Restore backup | Data recovered | | |

## 5.4 Regression Tests

Catat pengujian lama yang dijalankan kembali setelah perubahan kode.

| Test ID | Existing Functionality | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| REG-001 | Existing financial operations | Still works | | |
| REG-002 | Existing inventory operations | Still works | | |
| REG-003 | Existing backup operations | Still works | | |

## 5.5 Offline Tests

| Test ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| OFF-001 | Open app offline after initial installation | App shell loads | | |
| OFF-002 | Record sale offline | Sale saved locally | | |
| OFF-003 | Restart browser | Data persists | | |
| OFF-004 | Generate invoice offline | Local PDF generated | | |

# 6. Critical Financial Verification

Pengujian keuangan harus mencatat angka sebelum dan sesudah transaksi.

Contoh skenario:

**Initial condition:**
- Cash: Rp5.000.000
- Product inventory cost: Rp700.000
- Product selling price: Rp1.000.000

**Transaction:**
- Sell one product on credit.
- No initial payment.
- Product is fulfilled.

**Expected result:**
- Sales revenue increases by Rp1.000.000.
- Receivables increase by Rp1.000.000.
- Inventory decreases by Rp700.000 at cost.
- COGS increases by Rp700.000.
- Gross profit is Rp300.000.
- Cash remains Rp5.000.000.

**Subsequent payment:**
- Customer pays Rp400.000.

Expected:
- Cash increases by Rp400.000.
- Receivables decrease to Rp600.000.
- Sales revenue does not increase again.
- Gross profit does not increase again.

| Verification | Expected | Actual | Status |
|---|---:|---:|---|
| Sales revenue | Rp1.000.000 | | |
| Cash after sale | Rp5.000.000 | | |
| Receivable after sale | Rp1.000.000 | | |
| Inventory cost reduction | Rp700.000 | | |
| COGS | Rp700.000 | | |
| Gross profit | Rp300.000 | | |
| Cash after payment | Rp5.400.000 | | |
| Receivable after payment | Rp600.000 | | |

Only use this scenario when the corresponding financial recognition policy has been approved.

# 7. Data Integrity Verification

| Test | Expected Result | Status |
|---|---|---|
| Duplicate transaction | Rejected or safely deduplicated | |
| Duplicate payment | No double posting | |
| Transaction rollback | No partial business records | |
| Foreign key relationship | Valid | |
| Audit trail | Preserved | |
| Inventory reconciliation | Consistent | |
| Receivable reconciliation | Consistent | |
| Financial reconciliation | Consistent | |

# 8. Failed Test Details

For each failed test, record:

**Test ID:**  
**Severity:**  
**Description:**  
**Expected Result:**  
**Actual Result:**  
**Reproduction Steps:**  
**Error Message:**  
**Relevant File:**  
**Root Cause:**  
**Proposed Fix:**  
**Regression Test Required:**  

Do not mark a failure resolved until the corresponding test has been rerun successfully.

# 9. Blocked and Skipped Tests

Record why each test could not be executed.

| Test ID | Reason | Impact | Next Action |
|---|---|---|---|
| | | | |

Examples:
- Browser unavailable.
- Required test data unavailable.
- Environment configuration incomplete.
- Dependent feature not implemented.
- External service unavailable.

# 10. Build and Static Analysis

| Check | Command | Result |
|---|---|---|
| Production build | Actual project build command | |
| Type checking | Actual project type-check command | |
| Lint | Actual project lint command | |
| Unit tests | Actual project test command | |
| E2E tests | Actual project E2E command | |

Commands must be taken from the actual repository configuration. Do not invent commands or report a check as passed if it was not executed.

# 11. Test Evidence

Attach or reference relevant evidence:

- Test logs.
- Screenshots.
- Error traces.
- Database verification output.
- Build output.
- Test coverage report.
- Reproduction instructions.

Evidence should be sufficient for another reviewer to understand the result.

Do not include sensitive business data unnecessarily.

# 12. Known Issues

| ID | Issue | Severity | Status | Related Test |
|---|---|---|---|---|
| | | | | |

# 13. Test Conclusion

**Overall Result:** PASS / FAIL / PARTIAL / BLOCKED / NOT RUN

### Summary
Write a concise explanation of the test results.

### Critical Findings
List any data integrity, financial, security, or offline reliability issues.

### Release Readiness
Choose one:

- Ready for phase review.
- Not ready; defects must be fixed.
- Blocked by unresolved decisions.
- Additional testing required.

# 14. Approval

| Role | Name | Status | Date |
|---|---|---|---|
| Implementation Agent | OpenCode | Report Submitted | |
| Product Owner | User | Pending Review | |

A successful test report does not automatically authorize the next implementation phase.

---

**Document Status:** Draft – Proposed Testing Report Standard.  
**Approval:** Pending Product Owner Review.