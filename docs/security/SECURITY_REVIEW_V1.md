# Security Review V1
## UMKM Manager

**Date:** 2026-11-15
**Scope:** Local-first browser application (`src/`, `docs/design/app.jsx`, `public/sw.js`), backup import/export, storage layer.
**Method:** Static review of source, dependency surface, network calls, rendering paths, and backup validation. No penetration test was run.

## Summary

| Area | Result | Level |
|---|---|---|
| XSS via rendered user data | No unsafe HTML sinks found; all data rendered as React text | Low |
| Backup import validation | Format, table presence, row shapes, movement types, and numeric ranges validated | Low |
| Secrets in repository | None found | Low |
| External network calls | None from application code; only same-origin service worker | Low |
| Data at rest | IndexedDB unencrypted; protected by browser origin isolation only | Medium |
| Multi-tab write protection | Advisory lock; last writer wins if both tabs bypass the lock | Low |
| Service worker cache scope | Same-origin GET only; non-GET and cross-origin requests are not intercepted | Low |

## Findings

### S-1: Backup import row validation (Medium → mitigated)

`src/storage/backupRepository.js` validates the manifest format and that every table is an array, then clears and bulk-adds inside one transaction. Row-level validation was added in the 2026-11-15 hardening pass:

- Required fields per table are enforced.
- `inventoryMovements` must use a known `type` (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`).
- `saleId` is required only for `STOCK_OUT`; `STOCK_IN` and `ADJUSTMENT` restore without it.
- Numeric fields (`products.stok`, `products.hpp`, `inventoryMovements.quantity`, `inventoryMovements.unitCost`) must be integers in valid ranges (`stok`/`hpp`/`unitCost` non-negative).

Impact: a hand-edited or corrupted backup is rejected before import. The import is atomic, so the previous data set is preserved on failure.

Remaining gap: file size is not bounded. Recommendation: add a record-count limit in a later hardening pass.

### S-2: Data at rest is not encrypted (Medium)

All business data is stored in IndexedDB in plain text. Anyone with access to the browser profile or OS account can read it. This is expected for a local-first V1 without authentication.

Recommendation: document this limitation for owners; rely on OS account protection. Encryption at rest is out of V1 scope.

### S-3: Multi-tab lock is advisory (Low)

`src/storage/tabCoordination.js` uses a `localStorage` token with heartbeat. A second tab is set to read-only at the Dexie `dbcore` transaction layer. A malicious or modified client can write directly through `indexedDB`, bypassing the lock.

Impact: accidental concurrent edits are prevented; deliberate tampering is not in the threat model for a single-user local app.

### S-4: No Content Security Policy (Low)

`index.html` does not set a CSP. The app has no remote script loads, no `eval`, and no inline event handlers, so current risk is low. A static-host CSP would add defense in depth.

### S-5: Service worker caches any same-origin GET (Low)

`public/sw.js` caches successful same-origin GET responses. Non-GET and cross-origin requests are ignored. Cached entries are limited to the app origin; no third-party content is cached.

## Verified absent

- `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `document.write`, `eval`, `new Function`: none in application source.
- `fetch`, `XMLHttpRequest`, `axios` calls to external hosts: none; the only network use is the service worker registration and same-origin asset loading.
- Secrets, API keys, tokens, or `.env` values: none in repository source or build configuration.

## Limitations

- Review covers repository source only; hosting configuration, browser extensions, and OS-level access are out of scope.
- No dynamic testing (fuzzing, malformed backup files, CSP bypass) was performed.
- Backup import row validation (S-1) is implemented; file-size bounding remains a known gap for V1.
