import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { resetDatabase } from './database';
import { getSetting, listSettings, saveSetting } from './settingsRepository';

afterEach(async () => {
  await resetDatabase();
});

describe('settings repository', () => {
  it('saves and retrieves settings', async () => {
    await saveSetting('theme', 'dark');
    await expect(getSetting('theme')).resolves.toMatchObject({ value: 'dark' });
  });

  it('updates a setting', async () => {
    await saveSetting('theme', 'dark');
    await saveSetting('theme', 'light');
    await expect(getSetting('theme')).resolves.toMatchObject({ value: 'light' });
  });

  it('lists all settings', async () => {
    await saveSetting('theme', 'dark');
    await saveSetting('language', 'id');
    await expect(listSettings()).resolves.toHaveLength(2);
  });
});
