export async function getStorageEstimate() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { usage: 0, quota: 0, percent: 0 };
  }
  const estimate = await navigator.storage.estimate();
  return {
    usage: estimate.usage || 0,
    quota: estimate.quota || 0,
    percent: (estimate.usage / (estimate.quota || 1)) * 100,
  };
}
