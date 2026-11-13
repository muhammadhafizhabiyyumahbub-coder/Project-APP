import { createId } from './idGenerator';

const STORAGE_KEY = 'umkm-tab-token';
const HEARTBEAT_INTERVAL = 3000;
const STALE_THRESHOLD = 10000;

let currentToken = null;
let heartbeat = null;
let readOnly = false;

function readLock() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function writeLock(token) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, timestamp: Date.now() }));
}

function isStale(lock) {
  return !lock?.timestamp || Date.now() - lock.timestamp > STALE_THRESHOLD;
}

function stopHeartbeat() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
}

function startHeartbeat(token) {
  stopHeartbeat();
  heartbeat = setInterval(() => {
    const lock = readLock();
    if (lock?.token === token) writeLock(token);
  }, HEARTBEAT_INTERVAL);
}

export function acquireTabLock() {
  const lock = readLock();
  if (lock && !isStale(lock) && lock.token !== currentToken) {
    currentToken = null;
    readOnly = true;
    stopHeartbeat();
    return { token: null, isOwner: false, release: releaseTabLock, takeover: takeoverTabLock };
  }

  currentToken = createId('TAB');
  readOnly = false;
  writeLock(currentToken);
  startHeartbeat(currentToken);
  return { token: currentToken, isOwner: true, release: () => releaseTabLock(currentToken), takeover: takeoverTabLock };
}

export function releaseTabLock(token = currentToken) {
  const lock = readLock();
  if (lock?.token === token) localStorage.removeItem(STORAGE_KEY);
  if (token === currentToken) {
    currentToken = null;
    readOnly = false;
    stopHeartbeat();
  }
}

export function takeoverTabLock() {
  currentToken = createId('TAB');
  readOnly = false;
  writeLock(currentToken);
  startHeartbeat(currentToken);
  return { token: currentToken, isOwner: true, release: () => releaseTabLock(currentToken), takeover: takeoverTabLock };
}

export function isTabLockOwner() {
  if (!readOnly) return true;
  const lock = readLock();
  return Boolean(currentToken) && lock?.token === currentToken && !isStale(lock);
}

export function isActiveTabStale() {
  return isStale(readLock());
}

export function subscribeTabLock(callback) {
  const notify = () => callback({ isOwner: isTabLockOwner(), stale: isActiveTabStale() });
  const onStorage = event => {
    if (event.key === STORAGE_KEY) notify();
  };
  window.addEventListener('storage', onStorage);
  const interval = setInterval(notify, HEARTBEAT_INTERVAL);
  notify();
  return () => {
    window.removeEventListener('storage', onStorage);
    clearInterval(interval);
  };
}
