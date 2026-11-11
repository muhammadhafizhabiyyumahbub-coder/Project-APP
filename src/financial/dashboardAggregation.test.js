import { describe, expect, it } from 'vitest';
import { filterPostedJournals, getPeriodRange, sumAccountBalance } from './dashboardAggregation';

const journals = [
  { status: 'POSTED', transactionDate: '2026-11-10', entries: [{ accountCode: '4000', debit: 0, credit: 100 }] },
  { status: 'POSTED', transactionDate: '2026-10-31', entries: [{ accountCode: '4000', debit: 0, credit: 50 }] },
  { status: 'DRAFT', transactionDate: '2026-11-10', entries: [{ accountCode: '4000', debit: 0, credit: 999 }] },
];

describe('dashboard aggregation', () => {
  it('filters posted journals by selected period', () => {
    expect(getPeriodRange('Bulan Ini', new Date('2026-11-10'))).toEqual({ start: '2026-11-01', end: '2026-11-10' });
    expect(filterPostedJournals(journals, 'Bulan Ini', new Date('2026-11-10'))).toHaveLength(1);
  });

  it('sums only selected account entries', () => {
    expect(sumAccountBalance(filterPostedJournals(journals, 'Bulan Ini', new Date('2026-11-10')), '4000')).toBe(-100);
  });
});
