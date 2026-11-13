import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from './database';
import { acquireTabLock, isTabLockOwner, takeoverTabLock } from './tabCoordination';

beforeEach(async () => {
  localStorage.clear();
  await initializeDatabase();
});

afterEach(async () => {
  const lock = takeoverTabLock();
  await resetDatabase();
  lock.release();
  localStorage.clear();
});

describe('tab coordination', () => {
  it('acquires, releases, and reports ownership', () => {
    const lock = acquireTabLock();

    expect(lock.isOwner).toBe(true);
    expect(isTabLockOwner()).toBe(true);

    lock.release();

    expect(localStorage.getItem('umkm-tab-token')).toBeNull();
    expect(acquireTabLock().isOwner).toBe(true);
  });

  it('blocks a second tab until it takes over explicitly', async () => {
    acquireTabLock();
    localStorage.setItem('umkm-tab-token', JSON.stringify({ token: 'TAB-other-tab', timestamp: Date.now() }));

    const secondTab = acquireTabLock();

    expect(secondTab.isOwner).toBe(false);
    expect(isTabLockOwner()).toBe(false);
    await expect(db.products.put({ id: 'P1', nama: 'Ditahan' })).rejects.toThrow('mode baca saja');

    const takeover = takeoverTabLock();

    expect(takeover.isOwner).toBe(true);
    await expect(db.products.put({ id: 'P1', nama: 'Diizinkan' })).resolves.toBe('P1');
  });
});
