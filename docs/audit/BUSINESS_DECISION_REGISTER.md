# BUSINESS DECISION REGISTER

**Status:** Pending Product Owner decisions
**Source:** `docs/business/`, `docs/architecture/DATABASE_SCHEMA.md`, `docs/audit/INDEPENDENT_BUSINESS_RULES_REVIEW.md`

Recommendations are analysis only. No row is approved by silence.

| ID | Decision | Current evidence | Conflict/gap | Impact | Status |
|---|---|---|---|---|---|
| DEC-001 | Accounting model and recognition basis | Documents propose centralized financial service and discuss simplified ledger/double-entry. | No approved model, chart of accounts, cash/accrual basis, posting matrix, reversal, or closing policy. | All balances, profit, cash flow, journals, database, reports. | Pending approval |
| DEC-002 | Inventory costing | Moving weighted average and FIFO are discussed; schema supports stock history. | Backdating, returns, adjustments, precision, locations, and landed cost unresolved. | COGS, stock valuation, profit, returns. | Pending approval |
| DEC-003 | Negative stock | Rejecting negative stock recommended in audit decision report. | Available quantity, reservations, imports, and offline conflict behavior unresolved. | Stock integrity, sales atomicity, COGS. | Pending approval |
| DEC-004 | Down payment/customer advance | DP liability/customer advance is recommended if orders are in V1. | Terminology and release, cancellation, forfeiture, transfer, refund lifecycle unresolved. | Cash, liability, revenue, receivable, refund. | Pending approval |
| DEC-005 | Overpayment and unapplied cash | Customer credit is recommended; auto-refund discouraged. | Must be separated from DP; payment without invoice, expiration, and refund approval unresolved. | Cash, customer balance, receivable, liability. | Pending approval |
| DEC-006 | Payment allocation | User allocation with suggested oldest due date is recommended. | Tie-breaker, unapplied payment, reversal, void invoice, and partial allocation unresolved. | Aging, receivable, cash, reports. | Pending approval |
| DEC-007 | Tax scope | Complex tax engine recommended outside V1 unless required. | Inclusive/exclusive, rounding, tax liability posting, returns, and reporting boundary unresolved. | Invoice totals, profit, liabilities, compliance claims. | Pending approval |
| DEC-008 | Fixed assets/depreciation | Complex depreciation recommended post-V1. | Treatment of asset purchase while depreciation is deferred is unresolved. | Profit, assets, expense, balance sheet. | Pending approval |
| DEC-009 | Partial fulfillment and returns | Partial fulfillment or controlled return is conditional recommendation. | Restock/write-off, cost reversal, refund/credit, eligibility, and tax reversal unresolved. | Stock, revenue, COGS, receivable, refund. | Pending approval |
| DEC-010 | V1 product promise | PRD describes broad finance, inventory, orders, employees, and operations. | No approved cut line between core and optional modules. | Schedule, schema, acceptance criteria, QA scope. | Pending approval |
| DEC-011 | Fractional quantities and rounding | Risk is noted in phase status and financial docs. | Decimal precision by product/unit and currency rounding not approved. | Stock, invoice totals, COGS, journal balance. | Pending approval |
| DEC-012 | Owner capital and personal withdrawals | PRD/business docs mention separation of business and personal money. | Account treatment, owner equity, withdrawal, and reporting are not approved. | Cash, equity, profit, reports. | Pending approval |
| DEC-013 | Theme and mobile UI contract | Design drafts specify light/dark and responsive drawer. | Exact breakpoints, table behavior, font delivery, and implementation evidence absent. | UX consistency, accessibility, offline asset loading. | Pending design approval |

## Required approval format

User should approve, reject, or edit each decision ID. For each approved decision, record the chosen rule and date in the project decision history before schema or financial engine work begins.

- [ ] DEC-001
- [ ] DEC-002
- [ ] DEC-003
- [ ] DEC-004
- [ ] DEC-005
- [ ] DEC-006
- [ ] DEC-007
- [ ] DEC-008
- [ ] DEC-009
- [ ] DEC-010
- [ ] DEC-011
- [ ] DEC-012
- [ ] DEC-013

**No implementation authorization is implied by this register.**
