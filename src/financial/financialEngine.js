import { db, initializeDatabase } from '../storage/database';
import {
  ACCOUNT_TYPE,
  ACCOUNT_NORMAL_BALANCE,
  CHART_OF_ACCOUNTS,
} from './accounts';

// Calculate balance for a single account from all posted journals
export async function getAccountBalance(accountCode) {
  await initializeDatabase();

  const postedJournals = await db.journals
    .where('status')
    .equals('POSTED')
    .toArray();

  let balance = 0;

  postedJournals.forEach(journal => {
    const linesForAccount = journal.entries.filter(
      line => line.accountCode === accountCode
    );

    if (linesForAccount.length === 0) return;

    const account = CHART_OF_ACCOUNTS[accountCode];
    const normalBalance = ACCOUNT_NORMAL_BALANCE[account.type];
    const debit = linesForAccount.reduce((sum, line) => sum + (line.debit || 0), 0);
    const credit = linesForAccount.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (normalBalance === 'DEBIT') {
      balance += debit - credit;
    } else {
      balance += credit - debit;
    }
  });

  return Math.max(0, balance); // No negative balances by default
}

// Get balances for multiple accounts
export async function getAccountBalances(accountCodes = null) {
  await initializeDatabase();

  const codes = accountCodes || Object.keys(CHART_OF_ACCOUNTS);
  const balances = {};

  for (const code of codes) {
    balances[code] = await getAccountBalance(code);
  }

  return balances;
}

// Get all account balances with metadata
export async function getTrialBalance() {
  await initializeDatabase();

  const balances = {};
  let totalDebit = 0;
  let totalCredit = 0;

  for (const [code, account] of Object.entries(CHART_OF_ACCOUNTS)) {
    const balance = await getAccountBalance(code);
    balances[code] = {
      code,
      name: account.name,
      type: account.type,
      normalBalance: ACCOUNT_NORMAL_BALANCE[account.type],
      balance,
    };

    if (ACCOUNT_NORMAL_BALANCE[account.type] === 'DEBIT') {
      totalDebit += balance;
    } else {
      totalCredit += balance;
    }
  }

  return {
    accounts: balances,
    totalDebit,
    totalCredit,
    isBalanced: totalDebit === totalCredit,
  };
}

// Verify that all posted journals are balanced
export async function verifyJournalIntegrity() {
  await initializeDatabase();

  const postedJournals = await db.journals
    .where('status')
    .equals('POSTED')
    .toArray();

  const issues = [];

  postedJournals.forEach(journal => {
    const totalDebit = journal.entries.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = journal.entries.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (totalDebit !== totalCredit) {
      issues.push({
        journalId: journal.id,
        journalNumber: journal.journalNumber,
        message: `Tidak seimbang: debit ${totalDebit} ≠ kredit ${totalCredit}`,
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
}
