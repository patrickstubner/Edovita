import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import type { LangCode, LanguagesRegistry } from '../domain/index.ts';
import { createDexieStorage, type StorageBundle } from '../storage/index.ts';
import { I18nProvider } from './I18nProvider.tsx';
import { RatingsProvider } from './RatingsProvider.tsx';
import { createAppRouter } from './router.tsx';
import { SecondLangProvider } from './SecondLangProvider.tsx';
import { SettingsProvider } from './SettingsProvider.tsx';
import { ShoppingProvider } from './ShoppingProvider.tsx';
import { ThemeProvider } from './ThemeProvider.tsx';

export interface AppProps {
  initialLang?: LangCode;
  navigatorLanguages?: readonly string[];
  timeZone?: string | null;
  secondLangRegistry?: LanguagesRegistry;
  secondLangGlossaries?: Readonly<Record<string, Readonly<Record<string, string>>>>;
  enablePseudoRtl?: boolean;
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
  timeZone,
  secondLangRegistry,
  secondLangGlossaries,
  enablePseudoRtl,
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
        <SecondLangProvider
          timeZone={timeZone}
          navigatorLanguages={navigatorLanguages}
          registry={secondLangRegistry}
          glossaries={secondLangGlossaries}
          enablePseudoRtl={enablePseudoRtl}
        >
          <ThemeProvider>
            <ShoppingProvider repository={activeStorage.shopping}>
              <RatingsProvider repository={activeStorage.ratings}>
                <RouterProvider router={router} />
              </RatingsProvider>
            </ShoppingProvider>
          </ThemeProvider>
        </SecondLangProvider>
      </I18nProvider>
    </SettingsProvider>
  );
}
