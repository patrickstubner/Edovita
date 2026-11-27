import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/tokens.css';
import './components/components.css';
import './components/shopping.css';
import { App } from './app/App.tsx';
import { getPublicBase } from './app/publicBase.ts';
import { scheduleServiceWorkerRegistration } from './pwa/index.ts';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Wurzel-Element #root nicht gefunden.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

scheduleServiceWorkerRegistration({
  basePath: getPublicBase(),
  isProduction: import.meta.env.PROD,
});
