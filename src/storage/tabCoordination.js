import { createId } from './idGenerator';

const STORAGE_KEY = 'umkm-tab-token';
const HEARTBEAT_INTERVAL = 3000;
const STALE_THRESHOLD = 10000;

export function acquireTabLock() {
  const token = createId('TAB');
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, timestamp: Date.now() }));
  
  const heartbeat = setInterval(() => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (current.token === token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, timestamp: Date.now() }));
    }
  }, HEARTBEAT_INTERVAL);

  return () => clearInterval(heartbeat);
}

export function isActiveTabStale() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return !stored.timestamp || Date.now() - stored.timestamp > STALE_THRESHOLD;
}
