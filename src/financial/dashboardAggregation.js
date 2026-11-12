import { toLocalDateKey } from './dateKey';

export function getPeriodRange(period, today = new Date()) {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  if (period === 'Hari Ini') {
    // same day
  } else if (period === '7 Hari Terakhir') start.setDate(start.getDate() - 6);
  else if (period === 'Tahun Ini') start.setMonth(0, 1);
  else start.setDate(1);
  return { start: toLocalDateKey(start), end: toLocalDateKey(end) };
}

export function filterPostedJournals(journals, period, today = new Date()) {
  const { start, end } = getPeriodRange(period, today);
  return journals.filter(journal => journal.status === 'POSTED' && journal.transactionDate >= start && journal.transactionDate <= end);
}

export function sumAccountBalance(journals, accountCode) {
  return journals.reduce((total, journal) => total + journal.entries.reduce((sum, entry) => {
    if (entry.accountCode !== accountCode) return sum;
    return sum + (entry.debit || 0) - (entry.credit || 0);
  }, 0), 0);
}
