import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkStorageQuota, clearServiceWorkerCache } from './storageMonitor';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('storage monitor', () => {
  it('warns when usage reaches 80 percent', async () => {
    vi.stubGlobal('navigator', {
      storage: { estimate: async () => ({ usage: 80, quota: 100 }) },
    });
    await expect(checkStorageQuota()).resolves.toMatchObject({ available: false, usagePercent: 80 });
  });

  it('allows writes below 80 percent', async () => {
    vi.stubGlobal('navigator', {
      storage: { estimate: async () => ({ usage: 79, quota: 100 }) },
    });
    await expect(checkStorageQuota()).resolves.toMatchObject({ available: true, usagePercent: 79 });
  });

  it('deletes only service worker caches', async () => {
    const remove = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('caches', {
      keys: async () => ['umkm-manager-shell-v1', 'umkm-manager-shell-v2'],
      delete: remove,
    });

    await clearServiceWorkerCache();

    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledWith('umkm-manager-shell-v1');
    expect(remove).toHaveBeenCalledWith('umkm-manager-shell-v2');
  });
});
