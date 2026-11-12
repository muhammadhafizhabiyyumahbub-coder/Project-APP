import { describe, expect, it, vi } from 'vitest';
import { createId } from './idGenerator';

describe('createId', () => {
  it('creates distinct IDs when called in the same millisecond', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1731196800000);
    const ids = new Set(Array.from({ length: 100 }, () => createId('PAY')));
    expect(ids.size).toBe(100);
    expect([...ids][0]).toMatch(/^PAY-/);
    vi.restoreAllMocks();
  });
});
