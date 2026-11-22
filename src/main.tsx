import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/tokens.css';
import './components/components.css';
import { App } from './app/App.tsx';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Wurzel-Element #root nicht gefunden.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
