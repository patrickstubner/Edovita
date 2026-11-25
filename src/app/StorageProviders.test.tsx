import { afterEach, describe, expect, it } from '@rstest/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { asFoodId, asRecipeId } from '../domain/index.ts';
import {
  useI18n,
  useRatings,
  useSettings,
  useShopping,
} from '../hooks/index.ts';
import { LANG_STORAGE_KEY } from '../i18n/index.ts';
import {
  EdovitaDb,
  createDexieStorage,
  createMemoryStorage,
  type PlanRepository,
  type RatingsRepository,
  type SettingsRepository,
  type ShoppingRepository,
  type StorageBundle,
} from '../storage/index.ts';
import { App } from './App.tsx';
import { I18nProvider } from './I18nProvider.tsx';
import { RatingsProvider } from './RatingsProvider.tsx';
import { SettingsProvider } from './SettingsProvider.tsx';
import { ShoppingProvider } from './ShoppingProvider.tsx';

const createdDbs: EdovitaDb[] = [];
let seq = 0;

function nextDbName(prefix: string): string {
  seq += 1;
  return `edovita_prov_${prefix}_${seq}_${Date.now()}`;
}

afterEach(async () => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
  while (createdDbs.length > 0) {
    const db = createdDbs.pop()!;
    await db.delete();
  }
});

function ProbeComponent() {
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    updateSettings,
  } = useSettings();
  const { items, loading: shoppingLoading, error: shoppingError, upsertItem } =
    useShopping();
  const {
    loading: ratingsLoading,
    error: ratingsError,
    getRating,
    isSaved,
    setRating,
    toggleSaved,
  } = useRatings();

  return (
    <div>
      <span data-testid="settings-loading">{String(settingsLoading)}</span>
      <span data-testid="shopping-loading">{String(shoppingLoading)}</span>
      <span data-testid="ratings-loading">{String(ratingsLoading)}</span>
      <span data-testid="settings-error">{settingsError ?? 'none'}</span>
      <span data-testid="shopping-error">{shoppingError ?? 'none'}</span>
      <span data-testid="ratings-error">{ratingsError ?? 'none'}</span>
      <span data-testid="settings-second">{settings.secondLang ?? 'none'}</span>
      <span data-testid="shopping-count">{items.length}</span>
      <span data-testid="rating-salmon">{getRating('oven_salmon') ?? 0}</span>
      <span data-testid="saved-salmon">{String(isSaved('oven_salmon'))}</span>

      <button
        type="button"
        onClick={() => void updateSettings({ secondLang: 'pt' })}
      >
        set-second-pt
      </button>
      <button
        type="button"
        onClick={() =>
          void upsertItem({
            id: 'item_broccoli',
            food: asFoodId('broccoli'),
            amount: 300,
            unit: 'g',
            state: 'open',
            fromRecipes: [asRecipeId('oven_salmon')],
            addedAt: '2026-11-23T12:00:00.000Z',
          })
        }
      >
        add-broccoli
      </button>
      <button
        type="button"
        onClick={() => void setRating('oven_salmon', 5)}
      >
        rate-salmon
      </button>
      <button
        type="button"
        onClick={() => void toggleSaved('oven_salmon')}
      >
        toggle-saved
      </button>
    </div>
  );
}

function SyncProbe() {
  const { lang, setLang } = useI18n();
  const { settings, loading, updateSettings } = useSettings();

  return (
    <div>
      <span data-testid="sync-loading">{String(loading)}</span>
      <span data-testid="sync-i18n-lang">{lang}</span>
      <span data-testid="sync-db-lang">{settings.uiLang}</span>
      <button type="button" onClick={() => setLang('de')}>
        i18n-to-de
      </button>
      <button type="button" onClick={() => void updateSettings({ uiLang: 'en' })}>
        db-to-en
      </button>
    </div>
  );
}

describe('Getrennte Speicher-Provider mit Repository-Injektion (ADR-001 Regel 6, E3, G1, H1)', () => {
  it('injiziert Memory-Repositories sauber in Settings-, Shopping- und RatingsProvider', async () => {
    const memory = createMemoryStorage();

    render(
      <SettingsProvider repository={memory.settings}>
        <ShoppingProvider repository={memory.shopping}>
          <RatingsProvider repository={memory.ratings}>
            <ProbeComponent />
          </RatingsProvider>
        </ShoppingProvider>
      </SettingsProvider>,
    );

    expect(await screen.findByTestId('settings-loading')).toHaveTextContent(
      'false',
    );
    expect(screen.getByTestId('settings-second')).toHaveTextContent('none');

    fireEvent.click(screen.getByRole('button', { name: 'set-second-pt' }));
    expect(await screen.findByText('pt')).toBeInTheDocument();
    expect((await memory.settings.get()).secondLang).toBe('pt');

    fireEvent.click(screen.getByRole('button', { name: 'add-broccoli' }));
    expect(await screen.findByTestId('shopping-count')).toHaveTextContent('1');
    expect((await memory.shopping.list()).length).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'rate-salmon' }));
    expect(await screen.findByTestId('rating-salmon')).toHaveTextContent('5');
    expect(await memory.ratings.getRating('oven_salmon')).toBe(5);

    fireEvent.click(screen.getByRole('button', { name: 'toggle-saved' }));
    expect(await screen.findByTestId('saved-salmon')).toHaveTextContent('true');
    expect(await memory.ratings.isSaved('oven_salmon')).toBe(true);
  });

  it('G1: fängt IndexedDB-/Quota-Fehler in allen drei Providern, setzt loading zurück und zeigt nur generische Meldung ohne Rohdaten/Stack', async () => {
    const quotaError = new Error(
      'INTERNAL_SECRET_TOKEN_XYZ at /private/stack/db.ts:42',
    );
    quotaError.name = 'QuotaExceededError';

    const readError = new Error(
      'RAW_IDB_CORRUPT_PAYLOAD_999 stacktrace leak',
    );

    const failingSettings: SettingsRepository = {
      get: () => Promise.reject(readError),
      getStored: () => Promise.reject(readError),
      set: () => Promise.reject(quotaError),
      update: () => Promise.reject(quotaError),
      clear: () => Promise.reject(quotaError),
    };

    const failingShopping: ShoppingRepository = {
      list: () => Promise.reject(quotaError),
      get: () => Promise.reject(readError),
      upsert: () => Promise.reject(quotaError),
      replaceAll: () => Promise.reject(quotaError),
      remove: () => Promise.reject(quotaError),
      clear: () => Promise.reject(quotaError),
    };

    const failingRatings: RatingsRepository = {
      getRating: () => Promise.reject(readError),
      setRating: () => Promise.reject(quotaError),
      listRatings: () => Promise.reject(readError),
      isSaved: () => Promise.reject(readError),
      setSaved: () => Promise.reject(quotaError),
      listSaved: () => Promise.reject(readError),
      clear: () => Promise.reject(quotaError),
    };

    render(
      <SettingsProvider repository={failingSettings}>
        <ShoppingProvider repository={failingShopping}>
          <RatingsProvider repository={failingRatings}>
            <ProbeComponent />
          </RatingsProvider>
        </ShoppingProvider>
      </SettingsProvider>,
    );

    // loading wird trotz abgelehnter Promises sicher auf false zurückgesetzt
    expect(await screen.findByTestId('settings-loading')).toHaveTextContent(
      'false',
    );
    expect(await screen.findByTestId('shopping-loading')).toHaveTextContent(
      'false',
    );
    expect(await screen.findByTestId('ratings-loading')).toHaveTextContent(
      'false',
    );

    expect(screen.getByTestId('settings-error')).toHaveTextContent(
      'storage.error.read',
    );
    expect(screen.getByTestId('shopping-error')).toHaveTextContent(
      'storage.error.quota',
    );
    expect(screen.getByTestId('ratings-error')).toHaveTextContent(
      'storage.error.read',
    );

    // Auch Schreibfehler (QuotaExceededError) werden gefangen und generisch klassifiziert
    fireEvent.click(screen.getByRole('button', { name: 'set-second-pt' }));
    expect(await screen.findByTestId('settings-error')).toHaveTextContent(
      'storage.error.quota',
    );

    // UI-Banner in der vollständigen App zeigt nur die generische Meldung – keine Rohdaten/Stacks
    cleanup();
    const failingPlan: PlanRepository = {
      get: () => Promise.reject(readError),
      set: () => Promise.reject(quotaError),
      clear: () => Promise.reject(quotaError),
    };

    const failingBundle: StorageBundle = {
      settings: failingSettings,
      shopping: failingShopping,
      ratings: failingRatings,
      plan: failingPlan,
    };
    render(<App navigatorLanguages={['de-CH']} storage={failingBundle} />);

    const banner = await screen.findByTestId('storage-error-banner');
    expect(banner).toHaveTextContent(
      'Lokale Daten konnten nicht geladen werden.',
    );
    expect(banner.textContent).not.toContain('RAW_IDB_CORRUPT_PAYLOAD_999');
    expect(banner.textContent).not.toContain('INTERNAL_SECRET_TOKEN_XYZ');
    expect(banner.textContent).not.toContain('/private/stack');
  });

  it('H1: synchronisiert Settings.uiLang (IndexedDB) bidirektional mit I18nProvider (localStorage)', async () => {
    const dbName = nextDbName('h1_sync');
    const storage = createDexieStorage(dbName);
    createdDbs.push(storage.db);

    // 1) Wechsel via I18nProvider.setLang('de') schreibt sowohl localStorage als auch IndexedDB
    render(
      <SettingsProvider repository={storage.settings}>
        <I18nProvider navigatorLanguages={['en-GB']}>
          <SyncProbe />
        </I18nProvider>
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('sync-i18n-lang')).toHaveTextContent('en');

    fireEvent.click(screen.getByRole('button', { name: 'i18n-to-de' }));
    await waitFor(() => {
      expect(screen.getByTestId('sync-i18n-lang')).toHaveTextContent('de');
      expect(screen.getByTestId('sync-db-lang')).toHaveTextContent('de');
    });
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('de');
    expect((await storage.settings.get()).uiLang).toBe('de');

    // 2) Simuliertes Neuladen mit leerem localStorage & en-GB-Browser: IndexedDB ('de') gewinnt & synct localStorage
    cleanup();
    window.localStorage.clear();

    render(
      <SettingsProvider repository={storage.settings}>
        <I18nProvider navigatorLanguages={['en-GB']}>
          <SyncProbe />
        </I18nProvider>
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-i18n-lang')).toHaveTextContent('de');
      expect(screen.getByTestId('sync-db-lang')).toHaveTextContent('de');
    });
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('de');

    // 3) Direkte Änderung über SettingsProvider.updateSettings({ uiLang: 'en' }) schaltet I18nProvider & localStorage um
    fireEvent.click(screen.getByRole('button', { name: 'db-to-en' }));
    await waitFor(() => {
      expect(screen.getByTestId('sync-i18n-lang')).toHaveTextContent('en');
      expect(screen.getByTestId('sync-db-lang')).toHaveTextContent('en');
    });
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
  });
});
