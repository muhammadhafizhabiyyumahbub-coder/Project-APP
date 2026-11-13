# RELEASE KNOWN ISSUES — UMKM Manager V1

**Generated:** 2026-11-14  
**Source:** `docs/implementation/PHASE_STATUS.md`, `docs/security/SECURITY_REVIEW_V1.md`, pending business decisions

## Open ISSUE Items (from PHASE_STATUS.md)

| ID | Level | Description | Status |
|---|---|---|---|
| ISSUE-003 | Critical | Backup/restore has no executable verification (manual cross-device restore not run) | **Resolved 2026-11-14**: cross-profile export/import verification via preview production. Automated export/import plus rollback tests pass; manual cross-profile restore verified: all record counts, balances (kas/piutang/pendapatan/HPP), and journal line counts match exactly after reset+import cycle. No double-counting; integer rupiah preserved. |
| ISSUE-004 | Medium | V1 scope broader in PRD than conditional recommendation | Partial completion; single-device offline-first V1 functional |
| ISSUE-005 | Resolved | Source, package, build, API, database, and test infrastructure absent | Phase 1-3 completed |
| ISSUE-007 | Low | Historical audit reports describe earlier empty-document state | Historical fact; current status updated |
| ISSUE-008 | Medium | Documentation contains draft/placeholder language and requires product approval | Confirmed |
| ISSUE-009 | Resolved | Dashboard widgets partially mock (sales trend chart, orders, transaction activity) | Connected to real balances and journals |
| ISSUE-011 | Low | Financial transaction custom category feature deferred (needs design for field without changing account) | Deferred |
| ISSUE-012 | Medium | Phase 8 implemented only supplier and employee CRUD; payroll, payables, budgets, and assets remain pending business decisions | Confirmed |
| ISSUE-013 | Medium | Service worker is built and registered; shell and hashed assets were verified in cache. Actual network-off reload was not simulated. | **Resolved 2026-11-14**: preview server process terminated, reload served cached shell, IndexedDB intact, no console errors |

## Security Review Findings (from docs/security/SECURITY_REVIEW_V1.md)

| Code | Level | Finding | Mitigation |
|---|---|---|---|
| S-1 | Medium | Backup import does not validate row content; corrupted backup can import rows with missing/ unexpected fields | Documented for V1; per-row validation deferred to future hardening pass |
| S-2 | Medium | Data at rest is not encrypted (IndexedDB plain text); anyone with OS account/browser profile access can read data | Documented limitation for owners; rely on OS account protection |
| S-3 | Low | Multi-tab lock is advisory (localStorage token); malicious/client can write directly through IndexedDB, bypassing lock | Advisory only; single-user local app threat model |
| S-4 | Low | No Content Security Policy (CSP) set on index.html | Low risk currently (no remote scripts, no eval, no inline handlers); static-host CSP would add defense in depth |

## Pending Business Decisions (DEC-*)

| Decision | Blocking | Note |
|---|---|---|
| DEC-005 | Yes | Payables still pending → Phase 8 full scope cannot include accounts payable |
| DEC-006 | Yes | Budgets still pending → Phase 8 full scope cannot include budgeting features |
| DEC-008 | Yes | Assets still pending → Phase 8 full scope cannot include asset tracking |
| DEC-009 | Yes | Payroll still pending → Phase 8 full scope cannot include payroll module |
| DEC-010 | Yes | More pending decisions | Scope expansion blocked until approval |

## Known Limitations (V1)

- No authentication / multi-user isolation; single-user local-first only
- IndexedDB data stored in plain text (see S-2)
- Multi-tab write conflict resolved via advisory lock only (see S-3)
- Backup import validates format/tables but not row shapes (see S-1)
- Custom transaction categories deferred (see ISSUE-011)
- No Content Security Policy (see S-4)
- Offline verified via server shutdown, not CDP Network.emulateNetworkConditions

## Resolution Path

- Resolve DEC-005/006/008/009/010 → Phase 8 full scope can be pursued
- S-1, S-2, S-4 can be addressed in V2 hardening sprint
- S-3 (advisory multi-tab lock) is acceptable for V1 single-user local-first model