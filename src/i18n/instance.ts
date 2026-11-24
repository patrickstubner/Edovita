import i18next, { type i18n as I18nInstance } from 'i18next';
import ICU from 'i18next-icu';
import {
  LANGUAGES_REGISTRY,
  UI_LOCALES,
} from '../../content/generated/locales-index.ts';
import type {
  LangCode,
  LanguagesRegistry,
  UiLocaleDict,
} from '../domain/index.ts';
import {
  approved,
  detectUiLang,
  getLangMeta,
  resolveApprovedUiLang,
} from './registry.ts';

export const LANG_STORAGE_KEY = 'edovita.lang';

export function readStoredUiLang(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): LangCode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY);
    return approved(raw, registry) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredUiLang(
  code: LangCode,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): boolean {
  if (!approved(code, registry)) {
    return false;
  }
  if (typeof window === 'undefined') {
    return true;
  }
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, code);
  } catch {
    // Gilt bis zum Neuladen (z. B. privates Fenster)
  }
  return true;
}

export function applyLangToDocument(
  code: LangCode,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): void {
  if (typeof document === 'undefined') {
    return;
  }
  const meta = getLangMeta(code, registry);
  const root = document.documentElement;
  root.setAttribute('lang', meta?.locale ?? code);
  root.setAttribute('dir', meta?.dir === 'rtl' ? 'rtl' : 'ltr');
}

export interface CreateI18nOptions {
  initialLang?: LangCode;
  registry?: LanguagesRegistry;
  locales?: Readonly<Record<string, UiLocaleDict>>;
}

/**
 * Erstellt eine isolierte i18next-Instanz mit ICU-Formatierer (`i18next-icu`),
 * synchroner Initialisierung (kein Flackern roher Schlüssel) und rein lokal gebündelten
 * Ressourcen (CSP `connect-src 'self'`, kein externer Netzabruf).
 */
export function createI18nInstance(
  options: CreateI18nOptions = {},
): I18nInstance {
  const registry = options.registry ?? LANGUAGES_REGISTRY;
  const locales = options.locales ?? UI_LOCALES;
  const initialLang =
    options.initialLang !== undefined
      ? resolveApprovedUiLang(options.initialLang, registry)
      : (readStoredUiLang(registry) ?? detectUiLang(undefined, registry).code);

  const resources: Record<string, { ui: Record<string, string> }> = {};
  for (const code of registry.ui) {
    if (Object.hasOwn(locales, code) && locales[code]) {
      resources[code] = { ui: { ...locales[code] } };
    }
  }

  const instance = i18next.createInstance();
  instance.use(ICU);
  void instance.init({
    lng: initialLang,
    fallbackLng: registry.fallback,
    defaultNS: 'ui',
    ns: ['ui'],
    resources,
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      // React escapet alle Textknoten; kein HTML in Übersetzungen (ADR-003, ESLint react/no-danger)
      escapeValue: false,
    },
    returnNull: false,
  });

  return instance;
}
