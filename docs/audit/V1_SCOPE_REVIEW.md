# V1 SCOPE REVIEW

**Status:** Conditional recommendation, pending product approval
**Basis:** PRD, architecture, business/financial documents, audit reports, and repository reality check.

## Scope reality

PRD describes a broad offline-first UMKM manager. Repository contains design and documentation only; no application feature is implemented or runnable. The classifications below are scope recommendations, not approved commitments.

## Must Have V1

Only if V1 promises financial and inventory management:

- Single-device local-first application shell and data persistence.
- Product/unit master data.
- Sales and payment recording.
- Basic customer and invoice flow if receivables are promised.
- Inventory movements and stock balance if inventory is promised.
- One approved costing method and explicit stock policy.
- Centralized financial posting and reconstructable balances.
- Basic reports matching approved accounting scope.
- Versioned backup and restore with validation.
- Atomic transaction behavior, audit trail, and integrity tests for money, stock, payment, and restore.
- Empty, loading, error, success, disabled, keyboard, and accessible responsive states for delivered screens.

## Should Have V1

- Customer receivables and aging if credit sales are common.
- Payment allocation and unapplied payment handling if multiple invoices are supported.
- Module enable/disable while preserving history.
- Dashboard with only metrics supported by approved rules and complete data.
- Basic order workflow or partial fulfillment, only if product promise requires it.
- Import/export that has validation and does not silently overwrite data.

## Optional V1

- Down payments and customer advances.
- Controlled returns and credit/refund workflow.
- Simple tax fields or tax calculation, only with explicit tax scope.
- Employee/payroll-related operational records.
- Multi-location inventory.
- Basic fixed asset register.
- QRIS and other payment method labels beyond cash/transfer.
- Advanced dashboard analytics.

## Deferred / Post-V1

- Configurable tax compliance engine.
- FIFO layers, batch/expiry, or complex landed-cost allocation unless required by the target business.
- Multi-currency and foreign exchange.
- Cloud sync, multi-device conflict merge, and multi-tenant server architecture.
- Payment gateway and automatic bank reconciliation.
- Full fixed asset lifecycle, impairment, disposal, and revaluation.
- Forecasting and advanced analytics.
- Silent negative stock and automatic unapproved refund behavior.

## Scope decisions required

- Which modules from PRD are actually promised in V1.
- Whether the product is cash-sales-only or includes receivables, orders, and inventory.
- Whether owner capital, personal withdrawals, tax, assets, employees, and payroll are V1.
- Whether DP, returns, and partial fulfillment are included.
- Whether light/dark theme and every proposed navigation item ship in V1.

## Readiness conclusion

V1 is **Not Ready** for implementation. It may become **Conditionally Ready** after scope and financial decisions are approved, specifications are reconciled, and a runnable foundation is created and tested. This document does not authorize Phase 1.
