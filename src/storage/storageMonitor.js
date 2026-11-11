export async function checkStorageQuota() {
  if (!navigator.storage?.estimate) return { available: true };
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  const usagePercent = quota ? (usage / quota) * 100 : 0;
  return { usage, quota, usagePercent, available: usagePercent < 90 };
}

export function onStorageWarning(callback) {
  let interval;
  const check = async () => {
    const status = await checkStorageQuota();
    if (!status.available) callback(status);
  };
  interval = setInterval(check, 60000);
  check();
  return () => clearInterval(interval);
}
