import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { I18nextProvider } from 'react-i18next';
import type { LangCode, LangMeta, Unit } from '../domain/index.ts';
import {
  LANGUAGES_REGISTRY,
  applyLangToDocument,
  approved,
  createI18nInstance,
  detectUiLang,
  fmtAmount,
  fmtDate,
  fmtNumber,
  getLangMeta,
  readStoredUiLang,
  resolveApprovedUiLang,
  writeStoredUiLang,
  type DetectedLang,
} from '../i18n/index.ts';
import { SettingsContext } from './SettingsProvider.tsx';

export interface I18nContextValue {
  lang: LangCode;
  meta: LangMeta;
  locale: string;
  detected: DetectedLang;
  uiLanguages: readonly LangCode[];
  isApproved: (code: LangCode) => boolean;
  metaFor: (code: LangCode) => LangMeta | undefined;
  setLang: (code: LangCode) => boolean;
  fmtNumber: (value: number, decimals?: number) => string;
  fmtAmount: (value: number, unit: Unit) => string;
  fmtDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  initialLang?: LangCode;
  navigatorLanguages?: readonly string[];
}

interface LocalLangState {
  readonly code: LangCode;
  readonly minVersion: number;
}

/**
 * Eigener Provider nur für Sprache und Formatierung (ADR-001 Regel 6, ADR-003).
 * Sprachwechsel erfolgt im laufenden Betrieb ohne Neustart; Daten bleiben erhalten.
 * Synchronisiert `Settings.uiLang` (IndexedDB) bidirektional mit `localStorage` (H1),
 * abgeleitet ohne `setState` in Effekten.
 */
export function I18nProvider({
  children,
  initialLang,
  navigatorLanguages,
}: I18nProviderProps) {
  const settingsCtx = useContext(SettingsContext);

  const detected = useMemo(
    () => detectUiLang(navigatorLanguages, LANGUAGES_REGISTRY),
    [navigatorLanguages],
  );

  const [localLang, setLocalLang] = useState<LocalLangState>(() => {
    if (initialLang !== undefined) {
      return {
        code: resolveApprovedUiLang(initialLang, LANGUAGES_REGISTRY),
        minVersion: 1,
      };
    }
    return {
      code: readStoredUiLang(LANGUAGES_REGISTRY) ?? detected.code,
      minVersion: 0,
    };
  });

  const persistedSettings = settingsCtx?.persisted ?? false;
  const settingsLoading = settingsCtx?.loading ?? true;
  const settingsVersion = settingsCtx?.version ?? 0;
  const dbUiLang = settingsCtx?.settings.uiLang;

  // H1: Persistierte Settings aus IndexedDB übernehmen, sobald sie neuer als die lokale Wahl sind
  const syncedFromDb =
    !settingsLoading &&
    persistedSettings &&
    typeof dbUiLang === 'string' &&
    approved(dbUiLang, LANGUAGES_REGISTRY) &&
    settingsVersion > localLang.minVersion;

  const lang: LangCode = syncedFromDb ? dbUiLang : localLang.code;

  const instance = useMemo(
    () =>
      createI18nInstance({
        initialLang: lang,
        registry: LANGUAGES_REGISTRY,
      }),
    // Instanz einmal pro Provider-Mount anlegen; spätere Wechsel laufen über changeLanguage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (instance.language !== lang) {
      void instance.changeLanguage(lang);
    }
    applyLangToDocument(lang, LANGUAGES_REGISTRY);
    if (syncedFromDb) {
      writeStoredUiLang(lang, LANGUAGES_REGISTRY);
    }
  }, [instance, lang, syncedFromDb]);

  const updateSettings = settingsCtx?.updateSettings;

  const setLang = useCallback(
    (next: LangCode): boolean => {
      if (!approved(next, LANGUAGES_REGISTRY)) {
        return false;
      }
      setLocalLang({ code: next, minVersion: settingsVersion + 1 });
      writeStoredUiLang(next, LANGUAGES_REGISTRY);
      void instance.changeLanguage(next);
      applyLangToDocument(next, LANGUAGES_REGISTRY);
      if (updateSettings) {
        void updateSettings({ uiLang: next });
      }
      return true;
    },
    [instance, settingsVersion, updateSettings],
  );

  const meta = useMemo<LangMeta>(
    () =>
      getLangMeta(lang, LANGUAGES_REGISTRY) ??
      getLangMeta(LANGUAGES_REGISTRY.fallback, LANGUAGES_REGISTRY)!,
    [lang],
  );

  const locale = meta.locale;

  const isApproved = useCallback(
    (code: LangCode) => approved(code, LANGUAGES_REGISTRY),
    [],
  );

  const metaFor = useCallback(
    (code: LangCode) => getLangMeta(code, LANGUAGES_REGISTRY),
    [],
  );

  const formatNumber = useCallback(
    (value: number, decimals?: number) => fmtNumber(value, locale, decimals),
    [locale],
  );

  const formatAmount = useCallback(
    (value: number, unit: Unit) => fmtAmount(value, unit, locale),
    [locale],
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) =>
      fmtDate(date, locale, options),
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      meta,
      locale,
      detected,
      uiLanguages: LANGUAGES_REGISTRY.ui,
      isApproved,
      metaFor,
      setLang,
      fmtNumber: formatNumber,
      fmtAmount: formatAmount,
      fmtDate: formatDate,
    }),
    [
      lang,
      meta,
      locale,
      detected,
      isApproved,
      metaFor,
      setLang,
      formatNumber,
      formatAmount,
      formatDate,
    ],
  );

  return (
    <I18nextProvider i18n={instance}>
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    </I18nextProvider>
  );
}
