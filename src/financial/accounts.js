// Chart of Accounts for UMKM Manager
// All accounts follow double-entry accounting structure.
// Account codes are hierarchical: 1xxx=Assets, 3xxx=Equity, 4xxx=Revenue, 5xxx=Expenses

export const ACCOUNT_TYPE = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE',
};

// Normal balance: DEBIT for assets/expenses, CREDIT for liabilities/equity/revenue
export const ACCOUNT_NORMAL_BALANCE = {
  ASSET: 'DEBIT',
  LIABILITY: 'CREDIT',
  EQUITY: 'CREDIT',
  REVENUE: 'CREDIT',
  EXPENSE: 'DEBIT',
};

export const CHART_OF_ACCOUNTS = {
  // Assets (1000-1999)
  '1010': { code: '1010', name: 'Kas', type: ACCOUNT_TYPE.ASSET },
  '1020': { code: '1020', name: 'Bank', type: ACCOUNT_TYPE.ASSET },

  // Equity (3000-3999)
  '3000': { code: '3000', name: 'Modal Pemilik', type: ACCOUNT_TYPE.EQUITY },
  '3100': { code: '3100', name: 'Pengambilan Pemilik', type: ACCOUNT_TYPE.EQUITY },

  // Revenue (4000-4999)
  '4000': { code: '4000', name: 'Pendapatan Penjualan', type: ACCOUNT_TYPE.REVENUE },

  // Expenses (5000-5999)
  '5000': { code: '5000', name: 'Beban Operasional', type: ACCOUNT_TYPE.EXPENSE },
};

export function getAccount(code) {
  return CHART_OF_ACCOUNTS[code];
}

export function validateAccountCode(code) {
  if (!CHART_OF_ACCOUNTS[code]) {
    throw new Error(`Akun ${code} tidak ditemukan dalam chart of accounts.`);
  }
}
