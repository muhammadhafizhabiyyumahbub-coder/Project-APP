import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../docs/design/app.jsx';
import ErrorBoundary, { DatabaseErrorScreen } from './ErrorBoundary';
import { initializeDatabase } from './storage/database';
import { formatDatabaseError } from './storage/databaseErrors';
import { getStorageEstimate } from './storage/storageQuota';
import './styles.css';

export { ErrorBoundary };

const root = createRoot(document.getElementById('root'));

// Initialize database before first render so a failure shows a recovery screen.
initializeDatabase()
  .then(() => {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    root.render(<DatabaseErrorScreen message={formatDatabaseError(err)} />);
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
