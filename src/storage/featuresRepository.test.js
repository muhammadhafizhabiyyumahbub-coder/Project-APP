import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { resetDatabase } from './database';
import { getFeature, listFeatures, saveFeature } from './featuresRepository';

afterEach(async () => {
  await resetDatabase();
});

describe('features repository', () => {
  it('saves and retrieves feature toggles', async () => {
    await saveFeature('sales', true);
    await expect(getFeature('sales')).resolves.toMatchObject({ enabled: true });
  });

  it('updates a feature toggle', async () => {
    await saveFeature('sales', true);
    await saveFeature('sales', false);
    await expect(getFeature('sales')).resolves.toMatchObject({ enabled: false });
  });

  it('lists all features', async () => {
    await saveFeature('sales', true);
    await saveFeature('inventory', false);
    await expect(listFeatures()).resolves.toHaveLength(2);
  });
});
