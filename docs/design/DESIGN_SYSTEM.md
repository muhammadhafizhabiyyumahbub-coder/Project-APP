# UMKM Manager - Design System

**Status:** Draft, pending product and implementation review
**Scope:** Tokens and reusable UI rules. No implementation is verified.
**Related:** `docs/design/UI_UX_SPEC.md`

## 1. Design Direction

Clean, practical, and professional. Information density serves daily operations, not decoration. Visual hierarchy separates cash position, activity, profit/loss, receivables, payables, and stock.

Design read: calm operational tool, ENERGY 1 / RHYTHM 2 / MOTION 1. Decisions below include their purpose so they can be tested against the product rather than treated as decoration.

## 2. Color Tokens

Use 2 to 3 core colors plus one accent, with neutral surfaces. Semantic colors must be paired with text, labels, icons, or patterns, never color alone.

| Role | Light | Dark | Purpose |
|---|---|---|---|
| Primary action | blue-600 `#2563eb` | blue-500 `#3b82f6` | Identify the primary actionable path. |
| App background | slate-50 `#f8fafc` | slate-950 `#020617` | Keep long operational sessions readable. |
| Surface | white `#ffffff` | slate-900 `#0f172a` | Separate working surfaces from background. |
| Border | slate-200 `#e2e8f0` | slate-800 `#1e293b` | Delineate dense data without heavy shadow. |
| Primary text | slate-900 `#0f172a` | slate-50 `#f8fafc` | Strong readable content. |
| Secondary text | slate-600 or darker where needed | slate-300 or lighter where needed | Supporting copy; verify AA contrast in context. |
| Income/success | emerald-600 | emerald-400 or stronger | Positive financial activity, with label/icon. |
| Expense/danger | rose-600 | rose-400 or stronger | Negative activity or destructive action, with label/icon. |
| Warning/due | amber-700 | amber-400 | Due or incomplete state, with label/icon. |

The exact secondary and semantic combinations require contrast testing after implementation. Do not assume a Tailwind color token passes every background.

## 3. Typography

- Font: Inter or system sans-serif. Selection reason: familiar, readable UI text for dense business data. Final font loading is not implemented or verified.
- Page title: 24px, semibold.
- Section title: 16 to 18px, medium.
- Body: 14px, regular.
- Caption: 12px only where readable and non-critical.
- Financial values: medium or semibold, Rupiah formatting where applicable, right-aligned in tables.
- Avoid decorative monospace, extreme tracking, and all-caps headings unless a specific usability reason exists.

## 4. Layout, Breakpoints, and Spacing

- Base spacing uses 4px increments.
- Sidebar: 256px expanded, 80px collapsed on desktop.
- Header: 64px target height.
- Content padding: 16px mobile, 32px desktop.
- Desktop breakpoint target: wider than 1024px.
- Mobile/tablet drawer target: below 1024px.
- Mobile summary target: one or two columns below 768px.
- Card radius: 12px for major cards; 8px for inputs and buttons; full radius only for compact status badges.
- Use borders as primary separation. Use `shadow-sm` selectively in light mode and avoid broad floating surfaces in dark mode.

Values above consolidate the two previous drafts. Final breakpoint and dimension validation requires a runnable UI, which does not yet exist.

## 5. Components

### Buttons

- Variants: primary, secondary, danger, ghost.
- Minimum target: 44px touch area.
- Include hover, active, focus-visible, and disabled states.
- Disabled controls use `cursor: not-allowed`; enabled controls use `cursor: pointer`.
- Use specific action labels, not generic filler labels.

### Inputs and search

- Visible label for every field.
- Consistent surface, border, text, and focus ring in both themes.
- Validation message adjacent to the relevant field.
- Required fields clearly indicated without relying only on color.

### Data tables

- Header and row hierarchy supports scanning.
- Numeric values align consistently.
- Row hover is supplementary, not required to understand data.
- Mobile behavior must be chosen per table: contained scroll, reflow, or alternate list. Do not cause page-level overflow.

### Cards

Cards group related information, such as a financial summary or stock warning. Not every piece of content becomes a card. Card hierarchy follows operational importance.

### Modal/dialog

- High stacking order.
- Overlay supports focus and dismissal.
- Header, body, and explicit close/cancel action.
- Body can scroll without hiding primary actions.
- Escape closes when safe; destructive actions require explicit confirmation.

### Theme toggle

Theme toggle is planned in the global header. It must persist locally and work in both themes before being marked complete.

## 6. Motion and Feedback

Motion dial is 1. Use short transitions for state changes, focus, drawer, and modal feedback only. Respect `prefers-reduced-motion`. No decorative looping motion or animation without a user-facing purpose.

## 7. Accessibility and Quality Gate

- WCAG AA contrast target for normal and large text.
- Keyboard navigation follows visual order.
- Focus indicator remains visible.
- Native controls are preferred.
- Every control has an accessible name and real behavior.
- Empty, loading, error, success, and disabled states are documented for data views.
- No fabricated statistics, testimonials, security claims, or unsupported product claims.

## 8. Unresolved Decisions

- Final font delivery and whether external font loading is allowed offline.
- Exact contrast-safe semantic tokens after implementation.
- Whether a theme toggle is included in V1 or deferred.
- Final mobile table strategy per screen.
- Final icon source and licensing, if icons are needed.

No item in this draft is a user-approved implementation contract.
