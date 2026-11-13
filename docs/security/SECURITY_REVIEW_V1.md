# Security Review V1
## UMKM Manager

**Date:** 2026-11-14
**Scope:** Local-first browser application (`src/`, `docs/design/app.jsx`, `public/sw.js`), backup import/export, storage layer.
**Method:** Static review of source, dependency surface, network calls, rendering paths, and backup validation. No penetration test was run.

## Summary

| Area | Result | Level |
|---|---|---|
| XSS via rendered user data | No unsafe HTML sinks found; all data rendered as React text | Low |
| Backup import validation | Format and table presence validated; row shapes and size not validated | Medium |
| Secrets in repository | None found | Low |
| External network calls | None from application code; only same-origin service worker | Low |
| Data at rest | IndexedDB unencrypted; protected by browser origin isolation only | Medium |
| Multi-tab write protection | Advisory lock; last writer wins if both tabs bypass the lock | Low |
| Service worker cache scope | Same-origin GET only; non-GET and cross-origin requests are not intercepted | Low |

## Findings

### S-1: Backup import does not validate row content (Medium)

`src/storage/backupRepository.js` validates the manifest format and that every table is an array, then clears and bulk-adds inside one transaction. Individual rows are not schema-checked, and file size is not bounded.

Impact: a hand-edited or corrupted backup can import rows with missing or unexpected fields. The app may render broken records or fail later. The import is atomic, so the previous data set is preserved on failure.

Recommendation: add per-table row validation and a record-count limit in a later hardening pass. No behavior change was made in this review.

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
- Backup import validation depth (S-1) remains a known gap for V1.
