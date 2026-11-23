import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import type { LangCode } from '../domain/index.ts';
import { I18nProvider } from './I18nProvider.tsx';
import { createAppRouter } from './router.tsx';
import { ThemeProvider } from './ThemeProvider.tsx';

export interface AppProps {
  initialLang?: LangCode;
  navigatorLanguages?: readonly string[];
}

/**
 * Wurzelkomponente der Edovita-App.
 * Provider bleiben strikt nach Bereich getrennt (ADR-001 Regel 6).
 */
export function App({ initialLang, navigatorLanguages }: AppProps = {}) {
  const router = useMemo(() => createAppRouter(), []);

  return (
    <I18nProvider
      initialLang={initialLang}
      navigatorLanguages={navigatorLanguages}
    >
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nProvider>
  );
}
