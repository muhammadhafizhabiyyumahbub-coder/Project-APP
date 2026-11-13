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

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
