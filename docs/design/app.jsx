import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '../../src/hooks/useProducts.js';
import { useCustomers } from '../../src/hooks/useCustomers.js';
import { db, initializeDatabase } from '../../src/storage/database.js';
import { exportBackup, importBackup } from '../../src/storage/backupRepository.js';
import { listFeatures, saveFeature } from '../../src/storage/featuresRepository.js';
import { acquireTabLock } from '../../src/storage/tabCoordination.js';
import { checkStorageQuota, onStorageWarning } from '../../src/storage/storageMonitor.js';
import { getAccountBalance } from '../../src/financial/financialEngine.js';
import { recordOperatingExpense, recordCapitalContribution, recordOwnerWithdrawal, createSale } from '../../src/financial/transactionEngine.js';
import { InventoryScreen } from './InventoryScreen.jsx';
import { CustomerOrdersScreen } from './CustomerOrdersScreen.jsx';
import { listProductCategories, matchesProduct } from '../../src/storage/productSearch.js';

// ==========================================
// 1. ICONS (SVG Mocks for zero-dependency)
// ==========================================
const Icon = ({ name, className = "w-5 h-5", strokeWidth = 2 }) => {
  const icons = {
    Home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    DollarSign: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
    ShoppingCart: <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7.6-5h7.3l3.6-7H5.4l-.5-2H2" />,
    Package: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />,
    Users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
    Clipboard: <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />,
    FileText: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
    Grid: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
    Settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />,
    Plus: <path d="M12 5v14M5 12h14" />,
    Minus: <path d="M5 12h14" />,
    X: <path d="M18 6L6 18M6 6l12 12" />,
    Trash2: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />,
    Check: <path d="M20 6L9 17l-5-5" />,
    TrendingUp: <path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />,
    TrendingDown: <path d="M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6" />,
    AlertCircle: <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01" />,
    Menu: <path d="M3 12h18M3 6h18M3 18h18" />,
    Search: <path d="M21 21l-6-6M15 10a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" />,
    Bell: <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 0 1-3.46 0" />,
    Sun: <><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
    Moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    ChevronLeft: <path d="M15 18l-6-6 6-6" />,
    ChevronRight: <path d="M9 18l6-6-6-6" />,
    Calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || icons['AlertCircle']}
    </svg>
  );
};

const formatIDR = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
const todayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

// ==========================================
// 3. REUSABLE UI COMPONENTS
// ==========================================

const Card = ({ children, className = '', noPadding = false }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors ${noPadding ? '' : 'p-5'} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', icon, onClick, className = '', disabled = false, type = "button" }) => {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
    secondary: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
    danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {icon && <Icon name={icon} className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange, required = false }) => {
  const inputId = label ? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined;
  return (
  <div className="mb-4">
    {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label} {required && <span className="text-rose-500">*</span>}</label>}
    <input 
      id={inputId}
      type={type} 
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" 
    />
  </div>
  );
};

const Select = ({ label, options, value, onChange, required = false }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label} {required && <span className="text-rose-500">*</span>}</label>}
    <select 
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
    >
      <option value="">-- Pilih --</option>
      {options.map((opt, i) => (
        <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  </div>
);

const SearchInput = ({ placeholder = "Cari...", value, onChange }) => (
  <div className="relative">
    <Icon name="Search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" 
    />
  </div>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} className={`bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full ${maxWidth} overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <Icon name="X" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 h-full">
    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
      <Icon name={icon} className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
    {actionLabel && <Button icon="Plus" onClick={onAction}>{actionLabel}</Button>}
  </div>
);

// ==========================================
// 4. SCREENS
// ==========================================

// --- DASHBOARD SCREEN ---
const DashboardScreen = ({ navigate, products }) => {
  const [period, setPeriod] = useState('Bulan Ini');
  const [financials, setFinancials] = useState({
    kas: 0, bank: 0, pendapatan: 0, beban: 0, hpp: 0, piutang: 0, utang: 0
  });
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [kas, bank, pendapatan, beban, hpp, piutang, utang] = await Promise.all([
          getAccountBalance('1010'),
          getAccountBalance('1020'),
          getAccountBalance('4000'),
          getAccountBalance('5000'),
          getAccountBalance('5100'),
          getAccountBalance('1100'),
          getAccountBalance('2100'),
        ]);
        
        const recentJournals = (await db.journals.where('status').equals('POSTED').toArray()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 7);

        if (active) {
          setFinancials({ kas, bank, pendapatan, beban, hpp, piutang, utang });
          setJournals(recentJournals);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const laba = financials.pendapatan - financials.hpp - financials.beban;
  const visibleJournals = journals.slice(0, 5);
  const inventoryLow = products?.filter(p => p.stok > 0 && p.stok <= 5).length || 0;
  const inventoryOut = products?.filter(p => p.stok <= 0).length || 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ringkasan kondisi bisnis Anda per <span className="font-medium text-slate-700 dark:text-slate-300">{todayStr}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Hari Ini</option>
            <option>7 Hari Terakhir</option>
            <option>Bulan Ini</option>
            <option>Tahun Ini</option>
          </select>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Position - Neutral */}
        <Card className="flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Saldo Kas</p>
          <div className="mt-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatIDR(financials.kas)}</p>
            <p className="text-xs text-slate-400 mt-1">Uang fisik di kasir</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Saldo Rekening</p>
          <div className="mt-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatIDR(financials.bank)}</p>
            <p className="text-xs text-slate-400 mt-1">Dana di bank</p>
          </div>
        </Card>

        {/* Business Activities - Success/Danger */}
        <Card className="flex flex-col justify-between border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Pendapatan</p>
          <div className="mt-2">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(financials.pendapatan)}</p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 flex items-center gap-1">
              <Icon name="TrendingUp" className="w-3 h-3" /> Periode {period}
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/10">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Pengeluaran</p>
          <div className="mt-2">
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatIDR(financials.beban)}</p>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 flex items-center gap-1">
               <Icon name="TrendingDown" className="w-3 h-3" /> Periode {period}
            </p>
          </div>
        </Card>

        {/* Profit - Distinct */}
        <Card className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Laba/Rugi (Estimasi)</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{formatIDR(laba)}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Laba kotor operasional (Pendapatan - Beban - HPP)</p>
          </div>
          <div className="hidden sm:block p-3 bg-blue-100/50 dark:bg-blue-800/50 rounded-full">
            <Icon name="TrendingUp" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        {/* Receivables/Payables */}
        <Card className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Piutang</p>
             <p className="text-xl font-bold text-amber-600 dark:text-amber-500 mt-1">{formatIDR(financials.piutang)}</p>
             <p className="text-xs text-slate-400 mt-1">Tagihan pelanggan</p>
           </div>
        </Card>
        <Card className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Utang</p>
             <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatIDR(financials.utang)}</p>
             <p className="text-xs text-slate-400 mt-1">Kewajiban usaha</p>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Overview */}
        <Card className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Tren Penjualan</h2>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{journals.length}</span> Trx
              <span className="mx-2">|</span>
              Avg: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatIDR(journals.length ? financials.pendapatan / journals.length : 0)}</span>
            </div>
          </div>
          <div className="flex-1 min-h-[200px] flex items-end justify-between gap-2 px-2 pb-2">
            {journals.length === 0 ? (
              <p className="m-auto text-sm text-slate-500">Belum ada penjualan terposting.</p>
            ) : journals.slice(0, 7).reverse().map(journal => {
              const amount = journal.entries.find(entry => entry.accountCode === '4000')?.credit || 0;
              const maxAmount = Math.max(...journals.slice(0, 7).map(item => item.entries.find(entry => entry.accountCode === '4000')?.credit || 0), 1);
              const height = Math.max((amount / maxAmount) * 100, 4);
              return <div key={journal.id} className="w-full bg-blue-100 dark:bg-slate-800 rounded-t-sm relative group hover:bg-blue-200 dark:hover:bg-slate-700 transition-colors" style={{ height: `${height}%` }}>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {formatIDR(amount)}
                </div>
              </div>;
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 px-2">
            <span>Awal {period}</span>
            <span>Hari Ini</span>
          </div>
        </Card>

        {/* Side Panels (Inventory & Orders) */}
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
              <Icon name="Package" className="w-4 h-4 text-slate-400" /> Status Persediaan
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Total Produk</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{products?.length || 0}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Stok Menipis</span>
                <Badge variant="warning">{inventoryLow}</Badge>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Stok Habis</span>
                {inventoryOut > 0 ? (
                  <Badge variant="danger">{inventoryOut}</Badge>
                ) : (
                  <Badge variant="success">Aman</Badge>
                )}
              </li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
              <Icon name="ShoppingCart" className="w-4 h-4 text-slate-400" /> Pesanan Berjalan
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">{journals.filter(journal => journal.status === 'POSTED').length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Baru</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-900/30">
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-400">{journals.filter(journal => journal.status === 'DRAFT').length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">Diproses</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activities */}
      <Card noPadding>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Aktivitas & Transaksi Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                <th className="px-5 py-3 font-medium">Jenis</th>
                <th className="px-5 py-3 font-medium">Deskripsi</th>
                <th className="px-5 py-3 font-medium text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="4" className="px-5 py-6 text-center text-slate-500">Memuat transaksi...</td></tr>
              ) : journals.length === 0 ? (
                <tr><td colSpan="4" className="px-5 py-6 text-center text-slate-500">Belum ada transaksi tersimpan.</td></tr>
              ) : visibleJournals.map(journal => {
                const amount = journal.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
                return <tr key={journal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{journal.transactionDate}</td>
                  <td className="px-5 py-3"><Badge variant={journal.status === 'POSTED' ? 'success' : 'neutral'}>{journal.status}</Badge></td>
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{journal.description || journal.reference}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">{formatIDR(amount)}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- PENJUALAN (POS) SCREEN ---
const PenjualanScreen = ({ products, customers = [], reloadProducts }) => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [customerId, setCustomerId] = useState('WALK-IN');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [qtyError, setQtyError] = useState(null);
  
  const categories = listProductCategories(products);
  const filteredProducts = products.filter(p => matchesProduct(p, searchQuery, selectedCategory));

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty < product.stok) {
        setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 && newQty <= item.stok ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const setQty = (id, value) => {
    if (value === '') return;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > cart.find(item => item.id === id)?.stok) {
      setQtyError('Jumlah harus bilangan bulat dan tidak boleh melebihi stok.');
      return;
    }
    setQtyError(null);
    setCart(cart.map(item => item.id === id ? { ...item, qty: quantity } : item));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  
  const handleCheckout = async () => {
    setSaving(true);
    setError(null);
    try {
      const saleNumber = `INV-${Date.now()}`;
      const isCash = paymentMethod === 'Tunai';
      const paidAmount = isCash ? total : 0;
      
      await createSale({
        saleNumber,
        transactionDate: new Date().toISOString().slice(0, 10),
        customerId,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.harga,
          total: item.harga * item.qty,
        })),
        totalAmount: total,
        paymentMethod: paymentMethod.toUpperCase(),
        paidAmount,
      });

      alert(`Transaksi berhasil!\nNomor: ${saleNumber}\nTotal: ${formatIDR(total)}\nMetode: ${paymentMethod}`);
      setCart([]);
      setCheckoutModalOpen(false);
      reloadProducts?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Kasir (Point of Sale)</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Pilih produk untuk dicatat sebagai penjualan baru.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Product Selection */}
        <Card className="flex-1 flex flex-col" noPadding>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-2">
            <div className="flex-1">
              <SearchInput 
                placeholder="Cari nama atau SKU produk..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Kategori</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <EmptyState icon="Search" title="Tidak ditemukan" description="Coba kata kunci lain." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addToCart(p)} 
                    disabled={p.stok === 0}
                    className="text-left border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed group bg-white dark:bg-slate-900 flex flex-col h-full"
                  >
                    <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-lg mb-3 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors w-full">
                      <Icon name="Package" className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight flex-1">{p.nama}</p>
                    <div className="mt-2 flex items-center justify-between w-full">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Stok: {p.stok}</p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatIDR(p.harga)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Cart Sidebar */}
        <Card className="w-full lg:w-96 flex flex-col" noPadding>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Nota Pesanan</h2>
            <Badge variant="neutral">{cart.length} item</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-900">
            {qtyError && <div role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{qtyError}</div>}
             {cart.length === 0 ? (
              <EmptyState icon="ShoppingCart" title="Keranjang Kosong" description="Pilih produk dari daftar di samping." />
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex flex-col pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 pr-2 line-clamp-1">{item.nama}</p>
                    <button type="button" aria-label={`Hapus ${item.nama}`} onClick={() => removeFromCart(item.id)} className="min-h-11 min-w-11 text-slate-400 hover:text-rose-500 transition-colors">
                       <Icon name="X" className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                      <button type="button" aria-label={`Kurangi ${item.nama}`} onClick={() => updateQty(item.id, -1)} className="min-h-11 min-w-11 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                        <Icon name="Minus" className="w-3 h-3" />
                      </button>
                      <label className="sr-only" htmlFor={`quantity-${item.id}`}>Jumlah {item.nama}</label>
                      <input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        max={item.stok}
                        step="1"
                        value={item.qty}
                        onChange={event => setQty(item.id, event.target.value)}
                        className="h-11 w-12 bg-transparent text-center text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                      />
                      <button type="button" aria-label={`Tambah ${item.nama}`} onClick={() => updateQty(item.id, 1)} disabled={item.qty >= item.stok} className="min-h-11 min-w-11 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 disabled:opacity-30">
                        <Icon name="Plus" className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatIDR(item.harga * item.qty)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatIDR(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <Button variant="secondary" disabled={cart.length === 0} onClick={() => setCart([])}>Batal</Button>
               <Button variant="primary" disabled={cart.length === 0} onClick={() => setCheckoutModalOpen(true)}>Bayar</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Checkout Modal */}
      <Modal isOpen={isCheckoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="Konfirmasi Pembayaran">
        <div className="space-y-4">
          {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="font-medium text-slate-600 dark:text-slate-300">Total Tagihan</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatIDR(total)}</span>
          </div>
          <Select 
            label="Pelanggan"
            options={[{ value: 'WALK-IN', label: 'Pelanggan umum' }, ...customers.map(customer => ({ value: customer.id, label: customer.nama }))]}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
          <Select 
            label="Metode Pembayaran" 
            options={['Tunai', 'Transfer Bank', 'QRIS', 'Kredit (Piutang)']} 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <Input label="Catatan Transaksi (Opsional)" placeholder="Misal: Lunas, atau referensi transfer" />
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
             <Button variant="secondary" className="w-full" onClick={() => setCheckoutModalOpen(false)} disabled={saving}>Kembali</Button>
             <Button variant="primary" icon="Check" className="w-full" onClick={handleCheckout} disabled={saving}>{saving ? 'Menyimpan...' : 'Selesaikan'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- PRODUK SCREEN ---
const ProdukScreen = ({ products, onSaveProduct, onDeleteProduct }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    nama: '', sku: '', kategori: '', stok: 0, harga: 0, hpp: 0
  });

  const categories = listProductCategories(products);
  const [selectedCategory, setSelectedCategory] = useState('');
  const filteredProducts = products.filter(p => matchesProduct(p, searchQuery, selectedCategory));

  const resetForm = () => {
    setFormData({ nama: '', sku: '', kategori: '', stok: 0, harga: 0, hpp: 0 });
    setEditingProduct(null);
  };

  const openProductForm = (product = null) => {
    setEditingProduct(product);
    setFormData(product ? { ...product } : { nama: '', sku: '', kategori: '', stok: 0, harga: 0, hpp: 0 });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const product = {
      id: editingProduct?.id || `P${Date.now()}`,
      ...formData,
      stok: parseInt(formData.stok) || 0,
      harga: parseInt(formData.harga) || 0,
      hpp: parseInt(formData.hpp) || 0,
    };
    onSaveProduct(product, editingProduct);
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Master Produk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola daftar barang, harga jual, dan persediaan.</p>
        </div>
        <Button icon="Plus" onClick={() => openProductForm()}>Tambah Produk</Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-900 rounded-t-xl">
          <div className="w-full sm:w-80">
            <SearchInput 
              placeholder="Cari nama atau SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">Semua Kategori</option>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        
        {filteredProducts.length === 0 ? (
           <EmptyState icon="Package" title="Tidak ada produk" description="Data produk kosong atau tidak ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Nama Produk</th>
                  <th className="px-5 py-3 font-medium">Kategori</th>
                  <th className="px-5 py-3 font-medium text-right">Harga Jual</th>
                  <th className="px-5 py-3 font-medium text-center">Stok</th>
                  <th className="px-5 py-3 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{p.sku || '-'}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{p.nama}</td>
                    <td className="px-5 py-3"><Badge variant="neutral">{p.kategori || '-'}</Badge></td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-slate-100">{formatIDR(p.harga)}</td>
                    <td className="px-5 py-3 text-center">
                      {p.stok === 0 ? (
                        <Badge variant="danger">Habis</Badge>
                      ) : p.stok < 5 ? (
                        <Badge variant="warning">{p.stok}</Badge>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{p.stok}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="ghost" className="text-blue-600 dark:text-blue-400" onClick={() => openProductForm(p)}>Edit</Button>
                      <Button variant="ghost" className="text-rose-600 dark:text-rose-400 ml-2" onClick={() => onDeleteProduct(p.id)}>Hapus</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nama Produk" required placeholder="Cth: Kopi Kapal Api" value={formData.nama} onChange={e => setFormData(current => ({...current, nama: e.target.value}))} />
          <div className="grid grid-cols-2 gap-4">
             <Input label="SKU (Opsional)" placeholder="Cth: KP-01" value={formData.sku} onChange={e => setFormData(current => ({...current, sku: e.target.value}))} />
             <Input label="Kategori" placeholder="Cth: Minuman" value={formData.kategori} onChange={e => setFormData(current => ({...current, kategori: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input label="Harga Beli / HPP" type="number" value={formData.hpp} onChange={e => setFormData(current => ({...current, hpp: e.target.value}))} />
             <Input label="Harga Jual" required type="number" value={formData.harga} onChange={e => setFormData(current => ({...current, harga: e.target.value}))} />
          </div>
          <Input label="Stok Awal" type="number" value={formData.stok} onChange={e => setFormData(current => ({...current, stok: e.target.value}))} />
          <div className="pt-4 flex justify-end gap-3">
             <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
             <Button variant="primary" type="submit">Simpan Produk</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- PELANGGAN SCREEN ---
const PelangganScreen = ({ customers, onSaveCustomer, onDeleteCustomer, onViewOrders }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    nama: '', nohp: '', email: '', alamat: ''
  });

  const filteredCustomers = customers.filter(c => 
    c.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.nohp && c.nohp.includes(searchQuery))
  );

  const resetForm = () => {
    setFormData({ nama: '', nohp: '', email: '', alamat: '' });
    setEditingCustomer(null);
  };

  const openCustomerForm = (customer = null) => {
    setEditingCustomer(customer);
    setFormData(customer ? { ...customer } : { nama: '', nohp: '', email: '', alamat: '' });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const customer = {
      id: editingCustomer?.id || `C${Date.now()}`,
      ...formData,
    };
    onSaveCustomer(customer, editingCustomer);
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Database Pelanggan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola daftar pelanggan dan informasi kontak.</p>
        </div>
        <Button icon="Plus" onClick={() => openCustomerForm()}>Tambah Pelanggan</Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-900 rounded-t-xl">
          <div className="w-full sm:w-80">
            <SearchInput 
              placeholder="Cari nama atau No. HP..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {filteredCustomers.length === 0 ? (
           <EmptyState icon="Users" title="Tidak ada pelanggan" description="Data pelanggan kosong atau tidak ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium">Nama Pelanggan</th>
                  <th className="px-5 py-3 font-medium">No. HP</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Alamat</th>
                  <th className="px-5 py-3 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{c.nama}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{c.nohp || '-'}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-xs">{c.email || '-'}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-xs">{c.alamat || '-'}</td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="ghost" className="text-slate-600 dark:text-slate-300" onClick={() => onViewOrders?.(c.id)}>Pesanan</Button>
                      <Button variant="ghost" className="text-blue-600 dark:text-blue-400 ml-2" onClick={() => openCustomerForm(c)}>Edit</Button>
                      <Button variant="ghost" className="text-rose-600 dark:text-rose-400 ml-2" onClick={() => onDeleteCustomer(c.id)}>Hapus</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nama Pelanggan" required placeholder="Cth: Ibu Siti" value={formData.nama} onChange={e => setFormData(current => ({...current, nama: e.target.value}))} />
          <Input label="No. HP (Opsional)" placeholder="Cth: 081234567890" value={formData.nohp} onChange={e => setFormData(current => ({...current, nohp: e.target.value}))} />
          <Input label="Email (Opsional)" type="email" placeholder="Cth: siti@email.com" value={formData.email} onChange={e => setFormData(current => ({...current, email: e.target.value}))} />
          <Input label="Alamat (Opsional)" placeholder="Cth: Jl. Merdeka No. 123" value={formData.alamat} onChange={e => setFormData(current => ({...current, alamat: e.target.value}))} />
          <div className="pt-4 flex justify-end gap-3">
             <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
             <Button variant="primary" type="submit">Simpan Pelanggan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- TAMBAH FITUR SCREEN ---
const TambahFiturScreen = ({ features, toggleFeature }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Katalog Modul (Tambah Fitur)</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Aktifkan modul sesuai dengan kebutuhan bisnis Anda untuk menjaga tampilan agar tetap sederhana. 
          Menonaktifkan modul hanya menyembunyikan menu, tidak menghapus data historis Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map(f => (
          <Card key={f.id} className={`flex flex-col justify-between transition-all ${f.aktif ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{f.nama}</h3>
                {f.aktif ? <Badge variant="success">Aktif</Badge> : <Badge variant="neutral">Nonaktif</Badge>}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{f.deskripsi}</p>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button 
                variant={f.aktif ? 'secondary' : 'primary'} 
                className="w-full"
                onClick={() => toggleFeature(f.id)}
              >
                {f.aktif ? 'Nonaktifkan Modul' : 'Aktifkan Modul'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- GENERIC PLACEHOLDER SCREEN ---
const TRANSACTION_TYPES = {
  EXPENSE: { label: 'Beban Operasional', handler: recordOperatingExpense, prefix: 'EXP' },
  CAPITAL: { label: 'Setoran Modal', handler: recordCapitalContribution, prefix: 'CONTRIB' },
  WITHDRAWAL: { label: 'Prive Pemilik', handler: recordOwnerWithdrawal, prefix: 'WITHDRAW' },
};

const FinancialScreen = () => {
  const [data, setData] = useState({ balances: {}, journals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadData = useCallback(async () => {
    const entries = await Promise.all(['1010', '1020', '1100', '1200', '2100', '4000', '5000', '5100'].map(async code => [code, await getAccountBalance(code)]));
    const journals = (await db.journals.toArray()).filter(journal => journal.status === 'POSTED').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 10);
    setData({ balances: Object.fromEntries(entries), journals });
  }, []);

  useEffect(() => {
    let active = true;
    initializeDatabase().then(loadData).catch((err) => {
      console.error('Gagal memuat data keuangan:', err);
      if (active) setError('Data keuangan gagal dimuat. Coba buka kembali menu ini.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [loadData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError('Jumlah harus lebih dari 0.');
      return;
    }
    const { handler, prefix } = TRANSACTION_TYPES[form.type];
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await handler({
        referenceNumber: `${prefix}-${Date.now()}`,
        transactionDate: new Date().toISOString().slice(0, 10),
        amount,
        description: form.description || undefined,
      });
      setForm({ type: form.type, amount: '', description: '' });
      setNotice('Transaksi tercatat.');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const labels = { '1010': 'Kas', '1020': 'Bank', '1100': 'Piutang', '1200': 'Persediaan', '2100': 'Uang Muka Pelanggan', '4000': 'Pendapatan', '5000': 'Beban', '5100': 'HPP' };
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Keuangan</h1><p className="mt-1 text-sm text-slate-500">Ringkasan saldo dari jurnal terposting.</p></div>
      {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
      {loading ? <p className="text-sm text-slate-500">Memuat data keuangan...</p> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(labels).map(([code, label]) => <div key={code} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{formatIDR(data.balances[code] || 0)}</p></div>)}
      </div>}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Catat Transaksi</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="text-sm">Jenis
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800">
              {Object.entries(TRANSACTION_TYPES).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm">Jumlah (Rp)
            <input type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </label>
          <label className="text-sm">Deskripsi/Kategori
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Cth: Listrik, Transportasi" />
          </label>
        </div>
        <button type="submit" disabled={saving} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
      </form>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">Jurnal Terbaru</h2>{loading ? <p className="mt-3 text-sm text-slate-500">Memuat jurnal...</p> : data.journals.length === 0 ? <p className="mt-3 text-sm text-slate-500">Belum ada jurnal terposting.</p> : <div className="mt-3 space-y-2">{data.journals.map(journal => <div key={journal.id} className="border-b border-slate-100 py-2 text-sm dark:border-slate-800"><div className="flex justify-between"><span>{journal.journalNumber} · {journal.description}</span><span>{journal.status}</span></div><div className="mt-1 text-xs text-slate-500">{journal.entries.map((entry, index) => <span key={`${journal.id}-${index}`} className="mr-3">{entry.accountCode}: D {formatIDR(entry.debit)} / K {formatIDR(entry.credit)}</span>)}</div></div>)}</div>}</section>
    </div>
  );
};

const ReportsScreen = () => {
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    initializeDatabase().then(async () => {
      const codes = ['1010', '1100', '4000', '5000', '5100'];
      const values = await Promise.all(codes.map(async code => [code, await getAccountBalance(code)]));
      if (active) setBalances(Object.fromEntries(values));
    }).catch(() => {
      if (active) setError('Laporan gagal dimuat.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Memuat laporan...</p>;
  if (error) return <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>;

  const laba = balances['4000'] - balances['5000'] - balances['5100'];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Laporan Bisnis</h1><p className="mt-1 text-sm text-slate-500">Ringkasan berdasarkan jurnal terposting.</p></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Pendapatan', '4000'], ['Beban', '5000'], ['HPP', '5100'], ['Laba/Rugi', null]].map(([label, code]) => (
          <Card key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{formatIDR(code ? balances[code] : laba)}</p></Card>
        ))}
      </div>
      <Card><h2 className="font-semibold">Posisi Kas dan Piutang</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><div><p className="text-sm text-slate-500">Kas</p><p className="text-lg font-semibold">{formatIDR(balances['1010'])}</p></div><div><p className="text-sm text-slate-500">Piutang</p><p className="text-lg font-semibold">{formatIDR(balances['1100'])}</p></div></div></Card>
    </div>
  );
};

const SettingsScreen = () => {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const restore = async event => {
    const file = event.target.files?.[0];
    if (!file || !window.confirm('Restore akan mengganti semua data saat ini. Lanjutkan?')) return;
    setError(null);
    try {
      await importBackup(JSON.parse(await file.text()));
      setMessage('Restore selesai. Muat ulang aplikasi untuk melihat data.');
    } catch (err) { setError(err.message || 'Restore gagal.'); }
    finally { event.target.value = ''; }
  };
  const backup = async () => {
    const content = JSON.stringify(await exportBackup(), null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `umkm-manager-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup diunduh.');
  };
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">Backup & Restore</h1><p className="mt-1 text-sm text-slate-500">Simpan salinan data lokal sebelum pindah perangkat atau browser.</p></div>{message && <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}{error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<Card className="space-y-4"><div><h2 className="font-semibold">Backup data</h2><p className="mt-1 text-sm text-slate-500">Unduh seluruh data aplikasi dalam file JSON.</p></div><Button onClick={backup}>Unduh backup</Button></Card><Card className="space-y-4"><div><h2 className="font-semibold">Restore data</h2><p className="mt-1 text-sm text-slate-500">File valid akan mengganti seluruh data aplikasi saat ini.</p></div><input aria-label="Pilih file backup" type="file" accept="application/json,.json" onChange={restore} /></Card></div>;
};

const PlaceholderScreen = ({ title, description }) => (
  <Card className="h-full flex items-center justify-center min-h-[60vh]"><EmptyState icon="Grid" title={title} description={description || "Layar ini merupakan bagian dari purwarupa. Data belum disambungkan ke fungsi ini."} /></Card>
);


// ==========================================
// 5. NAVIGATION ITEM COMPONENT
// ==========================================
const NavItem = ({ item, isActive, isSidebarCollapsed, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={isSidebarCollapsed ? item.name : undefined}
      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4 gap-3'} py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isActive 
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon name={item.icon} className={`flex-shrink-0 ${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
      {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
    </button>
  );
};

// ==========================================
// 6. MAIN APP SHELL (Layout, Nav, Theme)
// ==========================================
const App = () => {
  // Global States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Data States
  const {
    products,
    loading: productsLoading,
    error: productsError,
    addProduct,
    updateProduct,
    removeProduct,
    reloadProducts,
  } = useProducts();

  const {
    customers,
    loading: customersLoading,
    error: customersError,
    addCustomer,
    updateCustomer,
    removeCustomer,
  } = useCustomers();

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [storageWarning, setStorageWarning] = useState(null);

  const handleSaveProduct = async (product, editingProduct) => {
    if (editingProduct) {
      await updateProduct(product.id, product);
    } else {
      await addProduct(product);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Anda yakin ingin menghapus produk ini?')) {
      await removeProduct(id);
    }
  };

  const handleSaveCustomer = async (customer, editingCustomer) => {
    if (editingCustomer) {
      await updateCustomer(customer.id, customer);
    } else {
      await addCustomer(customer);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (confirm('Anda yakin ingin menghapus pelanggan ini?')) {
      await removeCustomer(id);
    }
  };
  const [features, setFeatures] = useState([
    { id: 'f-pesanan', nama: 'Manajemen Pesanan (Order)', deskripsi: 'Lacak status operasional pesanan (Diproses, Dikirim, Selesai).', aktif: true },
    { id: 'f-piutang', nama: 'Buku Piutang & Utang', deskripsi: 'Catat pelanggan yang berhutang dan kelola notifikasi jatuh temponya.', aktif: true },
  ]);

  useEffect(() => {
    const release = acquireTabLock();
    return release;
  }, []);

  useEffect(() => {
    return onStorageWarning(setStorageWarning);
  }, []);

  useEffect(() => {
    listFeatures().then(saved => {
      if (saved.length) setFeatures(current => current.map(feature => ({
        ...feature,
        aktif: saved.find(item => item.featureId === feature.id)?.enabled ?? feature.aktif,
      })));
    }).catch(() => {});
  }, []);

  // Initialize Theme based on localStorage or system pref safely
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('umkm-theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
      } else if (savedTheme === 'light') {
        setIsDark(false);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
      }
    } catch (e) {
      console.warn('LocalStorage not accessible for theme.');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      localStorage.setItem('umkm-theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      // Handle incognito mode restrictions silently
    }
  };

  const toggleFeature = (id) => {
    setFeatures(currentFeatures => {
      const nextFeatures = currentFeatures.map(f => f.id === id ? { ...f, aktif: !f.aktif } : f);
      const feature = nextFeatures.find(item => item.id === id);
      saveFeature(id, feature.aktif).catch(() => {});
      return nextFeatures;
    });
  };

  // Base Navigation Config
  const baseNavigation = [
    { id: 'dashboard', name: 'Dashboard', icon: 'Home', section: 'core' },
    { id: 'keuangan', name: 'Keuangan', icon: 'DollarSign', section: 'core' },
    { id: 'penjualan', name: 'Penjualan (POS)', icon: 'ShoppingCart', section: 'core' },
    { id: 'produk', name: 'Produk', icon: 'Package', section: 'core' },
    { id: 'persediaan', name: 'Persediaan', icon: 'Clipboard', section: 'core' },
    { id: 'pelanggan', name: 'Pelanggan', icon: 'Users', section: 'crm' },
    { id: 'pesanan', name: 'Pesanan', icon: 'FileText', section: 'crm', featureId: 'f-pesanan' },
    { id: 'piutang', name: 'Piutang & Utang', icon: 'AlertCircle', section: 'crm', featureId: 'f-piutang' },
    { id: 'laporan', name: 'Laporan', icon: 'TrendingUp', section: 'analytics' },
  ];

  // Filter navigation based on active features
  const activeFeatureIds = features.filter(f => f.aktif).map(f => f.id);
  const visibleNavigation = baseNavigation.filter(n => !n.featureId || activeFeatureIds.includes(n.featureId));

  const systemNav = [
    { id: 'fitur', name: 'Tambah Fitur', icon: 'Grid' },
    { id: 'pengaturan', name: 'Pengaturan', icon: 'Settings' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen navigate={setActiveTab} products={products} />;
      case 'penjualan': return <PenjualanScreen products={products} customers={customers} reloadProducts={reloadProducts} />;
      case 'produk': return (
        <>
          {productsError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <span>{productsError}</span>
              <Button variant="ghost" className="mt-2 text-red-700 dark:text-red-300" onClick={() => window.location.reload()}>
                Muat ulang aplikasi
              </Button>
            </div>
          )}
          {productsLoading ? (
            <div className="p-6 text-sm text-slate-500">Memuat produk...</div>
          ) : (
            <ProdukScreen products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />
          )}
        </>
      );
      case 'fitur': return <TambahFiturScreen features={features} toggleFeature={toggleFeature} />;
      case 'keuangan': return <FinancialScreen />;
      case 'persediaan': return <InventoryScreen />;
      case 'pelanggan': return (
        selectedCustomerId ? (
          <CustomerOrdersScreen customerId={selectedCustomerId} onBack={() => setSelectedCustomerId(null)} />
        ) : (
        <>
          {customersError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <span>{customersError}</span>
              <Button variant="ghost" className="mt-2 text-red-700 dark:text-red-300" onClick={() => window.location.reload()}>
                Muat ulang aplikasi
              </Button>
            </div>
          )}
          {customersLoading ? (
            <div className="p-6 text-sm text-slate-500">Memuat pelanggan...</div>
          ) : (
            <PelangganScreen customers={customers} onSaveCustomer={handleSaveCustomer} onDeleteCustomer={handleDeleteCustomer} onViewOrders={setSelectedCustomerId} />
          )}
        </>
        )
      );
      case 'pesanan': return <PlaceholderScreen title="Manajemen Pesanan" description="Pantau operasional pesanan (Menunggu diproses, Sedang dikemas, Selesai)." />;
      case 'piutang': return <ReceivablesScreen customers={customers} />;
      case 'laporan': return <ReportsScreen />;
      case 'pengaturan': return <SettingsScreen />;
      default: return <DashboardScreen navigate={setActiveTab} products={products} />;
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''} font-sans`}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden transition-colors duration-200">
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-lg">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-sm">UM</div>
            Manager
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleTheme} aria-label="Ganti tema" className="p-2 text-slate-500 dark:text-slate-400 focus:outline-none">
               <Icon name={isDark ? "Sun" : "Moon"} className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'} className="p-2 text-slate-600 dark:text-slate-300 focus:outline-none">
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0 mt-16 lg:mt-0' : '-translate-x-full'}`}>
          {/* Sidebar Header (Desktop only) */}
          <div className="hidden lg:flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500 font-bold text-lg truncate">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">UM</div>
                Manager
              </div>
            )}
            {isSidebarCollapsed && (
               <div className="w-8 h-8 mx-auto bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">UM</div>
            )}
          </div>
          
          {/* Sidebar Menu */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar pb-24 lg:pb-4">
            <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Operasional</div>}
              <div className="space-y-1">
                {visibleNavigation.filter(n => n.section === 'core').map(item => (
                   <NavItem key={item.id} item={item} isActive={activeTab === item.id} isSidebarCollapsed={isSidebarCollapsed} onClick={() => handleNavClick(item.id)} />
                ))}
              </div>
            </div>
            
            {visibleNavigation.filter(n => n.section === 'crm').length > 0 && (
              <div>
                {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CRM & Bisnis</div>}
                <div className="space-y-1">
                  {visibleNavigation.filter(n => n.section === 'crm').map(item => (
                    <NavItem key={item.id} item={item} isActive={activeTab === item.id} isSidebarCollapsed={isSidebarCollapsed} onClick={() => handleNavClick(item.id)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Analisis</div>}
              <div className="space-y-1">
                {visibleNavigation.filter(n => n.section === 'analytics').map(item => (
                   <NavItem key={item.id} item={item} isActive={activeTab === item.id} isSidebarCollapsed={isSidebarCollapsed} onClick={() => handleNavClick(item.id)} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 bg-slate-50 dark:bg-slate-900/50">
             {systemNav.map(item => (
               <NavItem key={item.id} item={item} isActive={activeTab === item.id} isSidebarCollapsed={isSidebarCollapsed} onClick={() => handleNavClick(item.id)} />
             ))}
             {!isSidebarCollapsed && (
               <div className="pt-4 pb-2 px-2 flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm">TB</div>
                 <div className="truncate">
                   <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight truncate">Toko Berkah</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Mode Offline</p>
                 </div>
               </div>
             )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pt-16 lg:pt-0 bg-slate-50 dark:bg-slate-950">
          
          {/* Desktop Global Header */}
          <header className="hidden lg:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 items-center justify-between px-6 z-10 transition-colors">
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                 className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none transition-colors"
                 aria-label="Toggle Sidebar"
               >
                 <Icon name={isSidebarCollapsed ? "Menu" : "ChevronLeft"} className="w-5 h-5" />
               </button>
               <div className="w-72">
                 <SearchInput placeholder="Pencarian global..." />
               </div>
             </div>

             <div className="flex items-center gap-2">
               <button type="button" aria-label="Buka notifikasi" onClick={() => window.alert('Belum ada notifikasi baru.')} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 relative focus:outline-none transition-colors">
                 <Icon name="Bell" className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
               </button>
               <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
               <button 
                 onClick={toggleTheme} 
                 className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-blue-400 focus:outline-none transition-colors"
                 title="Ganti Tema (Terang/Gelap)"
                 aria-label="Toggle Theme"
               >
                 <Icon name={isDark ? "Sun" : "Moon"} className="w-5 h-5" />
               </button>
             </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto pb-10">
              {storageWarning && (
                <div role="alert" className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 flex items-start gap-3">
                  <Icon name="AlertTriangle" className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Kapasitas Penyimpanan Hampir Penuh</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Penyimpanan browser terpakai {storageWarning.usagePercent.toFixed(1)}%. Segera lakukan backup dan bersihkan data lama agar aplikasi tetap berjalan lancar.
                    </p>
                  </div>
                </div>
              )}
              {renderContent()}
            </div>
          </div>
        </main>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export { Card, Button, Badge, Icon };
export default App;