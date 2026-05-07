import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initCacheGuardian } from './lib/cache-guardian.ts';

async function boot() {
  await initCacheGuardian();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found. Cannot mount application.');
    return;
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot();
