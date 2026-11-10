import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../docs/design/app.jsx';
import ErrorBoundary from './ErrorBoundary';
import './styles.css';

export { ErrorBoundary };

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
