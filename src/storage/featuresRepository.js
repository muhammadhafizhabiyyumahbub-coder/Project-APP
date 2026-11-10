import { db, initializeDatabase } from './database';

export async function getFeature(featureId) {
  await initializeDatabase();
  return db.features.get(featureId);
}

export async function saveFeature(featureId, enabled) {
  await initializeDatabase();
  await db.features.put({ featureId, enabled });
  return { featureId, enabled };
}

export async function listFeatures() {
  await initializeDatabase();
  return db.features.toArray();
}
