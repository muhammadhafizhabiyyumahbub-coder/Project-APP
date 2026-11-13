import { describe, expect, it, vi } from 'vitest';
import { getStorageEstimate } from './storageQuota';

describe('storage quota', () => {
  it('returns usage and quota when API is available', async () => {
    vi.stubGlobal('navigator', {
      storage: {
        estimate: async () => ({ usage: 500, quota: 1000 }),
      },
    });
    const est = await getStorageEstimate();
    expect(est).toEqual({ usage: 500, quota: 1000, percent: 50 });
    vi.unstubAllGlobals();
  });

  it('returns zeros when navigator.storage is missing', async () => {
    vi.stubGlobal('navigator', {});
    const est = await getStorageEstimate();
    expect(est).toEqual({ usage: 0, quota: 0, percent: 0 });
    vi.unstubAllGlobals();
  });
});
