import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../docs/design/app.jsx';
import ErrorBoundary from './ErrorBoundary';
import { initializeDatabase } from './storage/database';
import { getStorageEstimate } from './storage/storageQuota';
import './styles.css';

export { ErrorBoundary };

// Initialize database at startup
initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err);
});

getStorageEstimate()
  .then(({ percent }) => {
    if (percent >= 80) console.warn(`Penyimpanan lokal hampir penuh (${percent.toFixed(1)}%).`);
  })
  .catch(() => {});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
