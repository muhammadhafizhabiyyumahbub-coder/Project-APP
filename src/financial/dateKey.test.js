import { describe, expect, it } from 'vitest';
import { toLocalDateKey } from './dateKey';

describe('toLocalDateKey', () => {
  it('formats the local calendar day with padding', () => {
    expect(toLocalDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(toLocalDateKey(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31');
  });

  it('does not shift early-morning local time to the previous UTC day', () => {
    const earlyMorning = new Date(2026, 10, 10, 1, 30);
    expect(toLocalDateKey(earlyMorning)).toBe('2026-11-10');
  });
});
