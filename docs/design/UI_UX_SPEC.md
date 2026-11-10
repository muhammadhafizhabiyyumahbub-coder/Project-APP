# UMKM Manager - UI/UX Specification

**Status:** Draft, pending product approval
**Scope:** UI/UX direction only. No application implementation is verified.
**Related:** `docs/design/DESIGN_SYSTEM.md`, `docs/product/PRD.md`

## 1. Product Design Direction

UMKM Manager is an offline-first application for small businesses. Interface priorities:

- Fast, clear transaction entry.
- Practical information density without visual clutter.
- Plain Indonesian language for users without accounting training.
- Clear separation between cash position, activity, profit, receivables, payables, stock, and orders.
- Progressive disclosure for optional modules.

Design read: operational business dashboard for UMKM owners, calm and information-dense visual language, ENERGY 1 / RHYTHM 2 / MOTION 1. These dials are documentation guidance, not implementation evidence.

Personas in current draft: shop owner needing quick stock and sales entry, and distributor/reseller needing order, receivable, and simple profit visibility. Persona names in earlier draft are examples only, not verified research.

## 2. Information Architecture

App shell contains:

- **Global header:** global search where supported, notifications where supported, theme toggle, profile/settings.
- **Primary sidebar:** Dashboard, Keuangan, Penjualan, Produk, Persediaan, Pelanggan, Pesanan, Piutang, Laporan, Tambah Fitur, Pengaturan.
- **Module-driven navigation:** Pesanan, Piutang, and other optional modules appear only when enabled. Disabling a module must preserve its historical data.
- **Content area:** page header, filters/search, primary action, then table/list or operational workspace.

Navigation entries must point to real screens. Until screens exist, entries are planned navigation, not implemented navigation.

## 3. Responsive Behavior

| Viewport | Behavior |
|---|---|
| Desktop, wider than 1024px | Sidebar visible and collapsible; content uses desktop spacing. |
| Tablet and mobile, below 1024px | Sidebar becomes a drawer opened by hamburger; backdrop closes it. |
| Mobile, below 768px | Summary content reflows to one or two columns; dense tables use an accessible responsive treatment. |

Exact breakpoint behavior remains a product/design decision to validate against implementation. Horizontal scrolling must not hide required row actions or create page-level overflow. Touch targets must be at least 44px. Keyboard order must follow visual order.

## 4. Screens and Behaviors

### 4.1 Dashboard

- Period filter: Today, 7 days, This month, This year.
- Financial summary separates cash/account balances, income, expenses, profit/loss, receivables, and payables.
- Cash/account position uses neutral styling.
- Income uses success styling; expenses use danger styling; receivables/due items use warning styling.
- Profit must show a warning instead of a misleading value when required COGS data is incomplete.
- Sales and inventory overview shows trends only when data exists.
- Low/out-of-stock alerts, order status, receivable due reminders, and recent activity are separate information groups.

### 4.2 Sales/POS

- Split workspace: product search/selection and cart/receipt.
- Product controls support keyboard search and touch-friendly selection.
- Out-of-stock products are disabled when policy disallows sale.
- Cart supports quantity changes, removal, stock validation, subtotal calculation, and explicit checkout confirmation.
- Payment method options are shown only when supported by approved business rules: cash, transfer, QRIS, and credit/receivable are currently proposed, not approved.

### 4.3 Products and Inventory

- Search by name/SKU and category filtering.
- Dense master-data table with stock status.
- Low-stock and out-of-stock indicators must not rely on color alone.
- Product form proposal includes name, SKU, category, cost, selling price, and opening stock. Fields and accounting meaning remain subject to schema/business-rule approval.

### 4.4 Optional Modules

- Module catalog displays available modules and enabled state.
- Disable action must explain that historical data remains.
- Module state is intended to persist locally, subject to implementation and storage verification.

### 4.5 Shared Screens

Keuangan, Pelanggan, Pesanan, Piutang, Laporan, and Pengaturan use a consistent page header, search/filter area, primary action, and data view. The exact module list and workflow remain conditional on approved V1 scope.

## 5. UI States and Interaction

Every data view specifies:

- **Empty:** explains what is absent and offers a relevant action when one exists.
- **Loading:** skeleton or progress indicator scoped to the loading content.
- **Error:** explains failure, preserves entered data where possible, and offers retry or recovery.
- **Success:** confirms completed save/post/export without implying financial posting when only a draft was saved.
- **Disabled:** explains why an action is unavailable.

Modals use an overlay, a visible title, close/cancel action, Escape handling, focus management, and scroll containment. Buttons must have real behavior. Links must have real destinations. Forms need visible labels, validation, and feedback.

## 6. Theme

Light and dark themes are planned. Theme selection is intended to persist locally. Both themes must preserve contrast, focus visibility, disabled states, and semantic meaning. Theme implementation is not verified in the current repository.

## 7. Accessibility

- Semantic landmarks and heading hierarchy.
- Keyboard access for navigation, forms, drawers, dialogs, and tables.
- Visible `:focus-visible` indicator.
- Minimum WCAG AA contrast target.
- Do not use color as the only status signal.
- Accessible names for controls and meaningful alternative text for images.
- Reduced-motion support for non-essential transitions.
- Responsive layout without page-level horizontal overflow.

## 8. Open Design Decisions

- Whether all proposed modules belong in V1.
- Exact desktop/tablet/mobile breakpoint values after implementation review.
- Whether POS payment methods include QRIS and credit in first release.
- Dashboard metrics shown when accounting and COGS rules remain pending.
- Whether tables reflow, scroll within a region, or switch to cards on mobile.
- Final visual validation and accessibility test evidence.

No open decision is treated as approved. No UI implementation is claimed by this specification.
