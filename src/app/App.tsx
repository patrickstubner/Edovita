import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import type { LangCode } from '../domain/index.ts';
import { createDexieStorage, type StorageBundle } from '../storage/index.ts';
import { I18nProvider } from './I18nProvider.tsx';
import { RatingsProvider } from './RatingsProvider.tsx';
import { createAppRouter } from './router.tsx';
import { SettingsProvider } from './SettingsProvider.tsx';
import { ShoppingProvider } from './ShoppingProvider.tsx';
import { ThemeProvider } from './ThemeProvider.tsx';

export interface AppProps {
  initialLang?: LangCode;
  navigatorLanguages?: readonly string[];
  storage?: StorageBundle;
}

let defaultStorage: StorageBundle | null = null;

function getDefaultStorage(): StorageBundle {
  if (!defaultStorage) {
    defaultStorage = createDexieStorage();
  }
  return defaultStorage;
}

/**
 * Wurzelkomponente der Edovita-App.
 * Provider bleiben strikt nach Bereich getrennt (ADR-001 Regel 6),
 * Repositories werden injiziert (Standard: Dexie/IndexedDB, Tests: Memory).
 */
export function App({
  initialLang,
  navigatorLanguages,
  storage,
}: AppProps = {}) {
  const router = useMemo(() => createAppRouter(), []);
  const activeStorage = useMemo(
    () => storage ?? getDefaultStorage(),
    [storage],
  );

  return (
    <SettingsProvider repository={activeStorage.settings}>
      <I18nProvider
        initialLang={initialLang}
        navigatorLanguages={navigatorLanguages}
      >
        <ThemeProvider>
          <ShoppingProvider repository={activeStorage.shopping}>
            <RatingsProvider repository={activeStorage.ratings}>
              <RouterProvider router={router} />
            </RatingsProvider>
          </ShoppingProvider>
        </ThemeProvider>
      </I18nProvider>
    </SettingsProvider>
  );
}
