export async function checkStorageQuota() {
  if (!navigator.storage?.estimate) return { available: true, usage: 0, quota: 0, usagePercent: 0 };
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  const usagePercent = quota ? (usage / quota) * 100 : 0;
  return { usage, quota, usagePercent, available: usagePercent < 80 };
}

export async function clearServiceWorkerCache() {
  if (typeof caches === 'undefined') return;
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
}

export function onStorageWarning(callback) {
  const check = async () => {
    const status = await checkStorageQuota();
    callback(status.available ? null : status);
  };
  const interval = setInterval(check, 60000);
  check();
  return () => clearInterval(interval);
}
