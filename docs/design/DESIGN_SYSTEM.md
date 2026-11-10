# UMKM Manager - Design System

## 1. Design Principles
Sistem desain yang *Clean, Modern, dan Professional*. Menitikberatkan pada kepadatan informasi (*high information density*) yang rapi tanpa elemen dekoratif berlebih.

## 2. Color System & Design Tokens (Tailwind)

Sistem warna beradaptasi penuh terhadap Light dan Dark mode.

### A. Primary (Brand & Actions)
* **Light Mode:** `blue-600` (#2563eb) untuk tombol utama, `blue-50` untuk latar aktif.
* **Dark Mode:** `blue-500` (#3b82f6) untuk visibilitas lebih baik, `blue-900/30` untuk latar aktif.

### B. Neutral (Background, Surface, Text, Borders)
* **Background Utama:** Light `slate-50` (#f8fafc) | Dark `slate-950` (#020617)
* **Surface (Card/Modal):** Light `white` (#ffffff) | Dark `slate-900` (#0f172a)
* **Borders & Dividers:** Light `slate-200` (#e2e8f0) | Dark `slate-800` (#1e293b)
* **Text (Primary):** Light `slate-900` (#0f172a) | Dark `slate-50` (#f8fafc)
* **Text (Secondary):** Light `slate-500` (#64748b) | Dark `slate-400` (#94a3b8)

### C. Semantic (Feedback & Financials)
* **Success/Pendapatan:** Light `emerald-600` | Dark `emerald-500` (Background aksen: `emerald-50` / `emerald-900/20`)
* **Danger/Pengeluaran:** Light `rose-600` | Dark `rose-500` (Background aksen: `rose-50` / `rose-900/20`)
* **Warning/Jatuh Tempo:** Light `amber-500` | Dark `amber-500` (Background aksen: `amber-50` / `amber-900/20`)

## 3. Typography
* **Font Family:** `Inter`, `sans-serif` (Default sistem).
* **H1 (Page Title):** 24px (text-2xl), Semibold (600), `text-slate-900` / `dark:text-slate-50`.
* **H2 (Card/Section Title):** 16px (text-base) atau 18px (text-lg), Medium (500).
* **Body Base:** 14px (text-sm), Regular (400), `text-slate-700` / `dark:text-slate-300`.
* **Caption/Small:** 12px (text-xs), `text-slate-500` / `dark:text-slate-400`.
* **Angka Finansial:** Menggunakan varian Medium/Semibold, diformat Rupiah (Rp) dan *right-aligned* di dalam tabel.

## 4. Layout & Spacing
* **Grid Base:** Kelipatan 4px (Tailwind base).
* **Sidebar Dimensions:** Expanded `256px` (w-64), Collapsed `80px` (w-20).
* **Header Height:** `64px` (h-16).
* **Container Padding:** `16px` (p-4) pada mobile, `32px` (p-8) pada desktop.
* **Corner Radius:** `rounded-xl` (12px) untuk Card besar, `rounded-lg` (8px) untuk Input dan Button. `rounded-full` untuk Badge.
* **Shadows:** Sangat minimalis. `shadow-sm` untuk Cards di Light mode, `shadow-none` dengan border kuat di Dark mode.

## 5. Komponen Utama (Component Specifications)

### Buttons
* **Primary:** `bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 border-none rounded-lg px-4 py-2 text-sm font-medium`.
* **Secondary:** `bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-4 py-2 text-sm`.
* **Ghost (Icon/Aksi Ringan):** Transparan, teks abu-abu, latar muncul saat *hover*.

### Inputs & Search
* **Base:** `bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`.

### Data Table
* **Header Row:** Latar `slate-50` / `dark:slate-800`, teks kapital (uppercase) kecil `text-xs font-medium text-slate-500 dark:text-slate-400`.
* **Body Row:** Border bawah tipis. Efek hover halus pada baris (`hover:bg-slate-50/50` / `dark:hover:bg-slate-800/50`).

### Theme Toggle
* Ditempatkan di header kanan.
* Ikon transisi: Matahari (*Sun*) bergaris untuk Light, Bulan (*Moon*) untuk Dark.
UMKM Manager - Design System (Revised)

1. Filosofi Desain

Clean, Modern, dan Professional. Fokus pada kontras yang baik untuk membedakan metrik keuangan (seperti saldo kas riil vs proyeksi laba). Komponen dibuat reusable dengan penanganan transisi (animasi) yang halus.

2. Color Tokens (Tailwind)

A. Primary (Aksi & Interaktif)

Base: blue-600 (Light) / blue-500 (Dark).

Hover: blue-700 (Light) / blue-400 (Dark).

Active Surface: blue-50 (Light) / blue-900/40 (Dark).

B. Backgrounds & Surfaces

App Background: slate-50 (Light) / slate-950 (Dark) -> Memberikan kesan lapang.

Card/Modal Surface: white (Light) / slate-900 (Dark).

Borders: slate-200 (Light) / slate-800 (Dark) -> Ketat memisahkan antar kartu tanpa shadow berlebih.

C. Semantic Colors (Keuangan & Status)

Pendapatan/Success: emerald-600 (Teks) / emerald-50/30 (Latar transparan) di Light. Di Dark emerald-400.

Pengeluaran/Danger: rose-600 (Teks) / rose-50/30 (Latar transparan) di Light. Di Dark rose-400.

Piutang/Warning: amber-600 (Teks) / amber-50 (Latar) di Light. Di Dark amber-500.

3. Komponen Utama (UI Library)

Buttons (Button)

Mendukung prop variant: primary, secondary, danger, dan ghost.

Accessibility: Wajib memiliki disabled:opacity-50 disabled:cursor-not-allowed beserta focus:ring-2 focus:ring-offset-2.

Radius & Padding: rounded-lg, px-4 py-2 text-sm.

Form Elements (Input, Select, SearchInput)

Styling Seragam: bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100.

Focus State: Semua form input berubah garis luarnya (border) menjadi ring-2 ring-blue-500 saat diklik.

Labeling: Input wajib menyertakan ruang label opsional di atas form, dan tanda asterisk merah untuk required fields.

Modals (Modal)

Z-Index: Berada di atas segala komponen (z-50).

Background Overlay: bg-slate-900/60 backdrop-blur-sm.

Struktur Card: Header (Title & X button), Body (Scrollable, max-h-[90vh]), dilindungi oleh rounded-xl dan shadow kuat.

Cards & Layout (Card)

Menggunakan border tipis sebagai pemisah utama (border-slate-200/800) menggantikan dominasi efek drop-shadow.

Radius sudut seragam: rounded-xl (12px).

4. Typography & Breakpoints

Font: Inter / System sans-serif.

H1 (Header Layar): 24px, Semibold.

Angka Finansial Dashboard: 24px - 30px (text-2xl / text-3xl), Bold.

Breakpoint Mobile (lg): <1024px mengaktifkan menu Hamburger dan menutup Sidebar kiri.