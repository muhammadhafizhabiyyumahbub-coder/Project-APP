export function getPeriodRange(period, today = new Date()) {
  const day = today.toISOString().slice(0, 10);
  const [year, month, date] = day.split('-').map(Number);
  const end = new Date(Date.UTC(year, month - 1, date));
  const start = new Date(end);
  if (period === 'Hari Ini') {
    // same day
  } else if (period === '7 Hari Terakhir') start.setUTCDate(start.getUTCDate() - 6);
  else if (period === 'Tahun Ini') start.setUTCMonth(0, 1);
  else start.setUTCDate(1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
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
