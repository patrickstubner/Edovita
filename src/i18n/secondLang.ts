import { IntlMessageFormat } from 'intl-messageformat';
import {
  LANGUAGES_REGISTRY,
  UI_LOCALES,
} from '../../content/generated/locales-index.ts';
import {
  coerceSecondLang,
  isSupportedSecondaryLang,
  type FoodId,
  type LangCode,
  type LangMeta,
  type LanguagesRegistry,
  type RecipeId,
  type SecondLangSetting,
  type UiLocaleDict,
} from '../domain/index.ts';
import { getLangMeta } from './registry.ts';

/** localStorage-Schlüssel für die manuelle Zweitsprache (Prototyp v5.10). Automatik wird nie gespeichert. */
export const SECOND_LANG_STORAGE_KEY = 'edovita.secondLang';

/** Pseudo-RTL-Sprachcode ausschliesslich für Tests (ADR-003, Issue #12). */
export const PSEUDO_RTL_LANG: LangCode = 'ar-XB';

export const PSEUDO_RTL_META: LangMeta = {
  code: PSEUDO_RTL_LANG,
  name: 'العربية (Pseudo-RTL)',
  englishName: 'Arabic (Pseudo-RTL)',
  locale: 'ar-XB',
  dir: 'rtl',
  active: true,
  legalApproved: false,
  reviewed: false,
};

/**
 * Feste Zeitzone→Land-Tabelle 1:1 gemäss Prototyp v5.10 (`TZ_COUNTRY` in `prototype/app.js`).
 * Keine Geolocation-API; nichts Ortsbezogenes wird gespeichert (ADR-004).
 */
export const TZ_COUNTRY: Readonly<Record<string, string>> = {
  'Europe/Zurich': 'CH',
  'Europe/Vaduz': 'LI',
  'Europe/Berlin': 'DE',
  'Europe/Vienna': 'AT',
  'Europe/Lisbon': 'PT',
  'Atlantic/Azores': 'PT',
  'Atlantic/Madeira': 'PT',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'America/Sao_Paulo': 'BR',
  'America/Fortaleza': 'BR',
  'America/Recife': 'BR',
  'America/Bahia': 'BR',
  'America/Manaus': 'BR',
  'America/Belem': 'BR',
  'America/Noronha': 'BR',
  'America/Porto_Velho': 'BR',
  'America/Rio_Branco': 'BR',
  'America/Cuiaba': 'BR',
  'America/Campo_Grande': 'BR',
  'America/Santarem': 'BR',
  'America/Araguaina': 'BR',
  'America/Maceio': 'BR',
  'Asia/Tokyo': 'JP',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Saigon': 'VN',
  'Asia/Manila': 'PH',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Pacific/Auckland': 'NZ',
};

/**
 * Feste Land→Sprache-Tabelle 1:1 gemäss Prototyp v5.10 (`COUNTRY_LANG` in `prototype/app.js`).
 */
export const COUNTRY_LANG: Readonly<Record<string, LangCode>> = {
  PT: 'pt',
  BR: 'pt',
  AO: 'pt',
  MZ: 'pt',
  CV: 'pt',
  GW: 'pt',
  ST: 'pt',
  TL: 'pt',
  JP: 'ja',
  CH: 'de',
  DE: 'de',
  AT: 'de',
  LI: 'de',
  VN: 'vi',
  PH: 'en',
  US: 'en',
  GB: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  CA: 'en',
  FR: 'fr',
  BE: 'fr',
  IT: 'it',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
};

export interface SecondLangEnv {
  readonly timeZone?: string | null;
  readonly navigatorLanguages?: readonly string[] | null;
}

/**
 * Leitet den zweistelligen Ländercode ausschliesslich aus `Intl.DateTimeFormat().resolvedOptions().timeZone`
 * über die feste Tabelle `TZ_COUNTRY` ab (ohne Geolocation-API).
 */
export function countryFromTimeZone(timeZone?: string | null): string | null {
  let tz = '';
  if (timeZone !== undefined) {
    tz = typeof timeZone === 'string' ? timeZone.trim() : '';
  } else {
    try {
      tz = String(Intl.DateTimeFormat().resolvedOptions().timeZone ?? '');
    } catch {
      tz = '';
    }
  }
  if (tz && Object.hasOwn(TZ_COUNTRY, tz)) {
    return TZ_COUNTRY[tz] ?? null;
  }
  return null;
}

/**
 * Fallback für den Ländercode aus der Region in `navigator.languages` (z. B. `de-CH` → `CH`).
 */
export function countryFromLanguages(
  navigatorLanguages?: readonly string[] | null,
): string | null {
  let langs: readonly string[] = [];
  if (navigatorLanguages !== undefined) {
    langs = navigatorLanguages ?? [];
  } else if (typeof navigator !== 'undefined') {
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      langs = navigator.languages;
    } else if (navigator.language) {
      langs = [navigator.language];
    }
  }

  for (const raw of langs) {
    const tag = String(raw ?? '').trim();
    if (!tag) continue;
    try {
      if (typeof Intl !== 'undefined' && typeof Intl.Locale === 'function') {
        const loc = new Intl.Locale(tag);
        if (loc.region && /^[A-Za-z]{2}$/.test(loc.region)) {
          return loc.region.toUpperCase();
        }
      }
    } catch {
      // weiter mit Tag-Regex
    }
    const match = tag.match(/[-_]([A-Za-z]{2})\b/);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Ermittelt den wahrscheinlichen Ländercode (Zeitzone zuerst, sonst Sprache-Region).
 * Wird nie gespeichert und nutzt keine Standortabfrage des Browsers.
 */
export function inferCountry(env?: SecondLangEnv): string | null {
  return (
    countryFromTimeZone(env?.timeZone) ??
    countryFromLanguages(env?.navigatorLanguages)
  );
}

/**
 * Automatischer Standard für die Zweitsprache nach Ort (Prototyp v5.10 `autoSecondLang`):
 * 1. Land → Sprache aus fester Tabelle, nur wenn in `registry.secondary` und ≠ `uiLang`
 * 2. Sonst `en`, wenn `uiLang !== 'en'` und `en` in `registry.secondary`
 * 3. Sonst `null` (keine)
 */
export function autoSecondLang(
  uiLang: LangCode,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
  env?: SecondLangEnv,
): LangCode | null {
  const cc = inferCountry(env);
  const lang =
    cc && Object.hasOwn(COUNTRY_LANG, cc) ? (COUNTRY_LANG[cc] ?? null) : null;
  if (
    lang &&
    isSupportedSecondaryLang(lang, registry) &&
    lang !== uiLang
  ) {
    return lang;
  }
  if (uiLang !== 'en' && isSupportedSecondaryLang('en', registry)) {
    return 'en';
  }
  return null;
}

/**
 * Liefert die wirksame Zweitsprache (nie gleich `uiLang`, `null` wenn aus/gleich/ohne Treffer).
 * 1:1 gemäss Prototyp v5.10 `effectiveSecond`.
 */
export function effectiveSecondLang(
  setting: SecondLangSetting,
  uiLang: LangCode,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
  env?: SecondLangEnv,
): LangCode | null {
  const normalized = coerceSecondLang(setting, registry);
  if (normalized === 'none') {
    return null;
  }
  if (typeof normalized === 'string') {
    return normalized === uiLang ? null : normalized;
  }
  return autoSecondLang(uiLang, registry, env);
}

/**
 * Liest die manuelle Zweitsprachen-Wahl aus `localStorage`.
 * Fehlend, leer oder `'auto'` → `null` (automatisch). Ungültige Einträge werden entfernt.
 */
export function readStoredSecondLang(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): SecondLangSetting {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(SECOND_LANG_STORAGE_KEY);
    if (raw === null || raw === '' || raw === 'auto') {
      return null;
    }
    if (raw === 'none') {
      return 'none';
    }
    const coerced = coerceSecondLang(raw, registry);
    if (coerced === null) {
      window.localStorage.removeItem(SECOND_LANG_STORAGE_KEY);
      return null;
    }
    return coerced;
  } catch {
    return null;
  }
}

/**
 * Speichert nur explizite Wahlen (`'none'` oder gültige Zweitsprache) in `localStorage`.
 * Bei `null` (automatisch) wird der Schlüssel entfernt – Automatik wird nie gespeichert.
 */
export function writeStoredSecondLang(
  value: SecondLangSetting,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    if (value === null) {
      window.localStorage.removeItem(SECOND_LANG_STORAGE_KEY);
      return true;
    }
    if (value === 'none') {
      window.localStorage.setItem(SECOND_LANG_STORAGE_KEY, 'none');
      return true;
    }
    if (!isSupportedSecondaryLang(value, registry)) {
      return false;
    }
    window.localStorage.setItem(SECOND_LANG_STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prüft, ob die Pseudo-RTL-Test-Sprache `ar-XB` aktiv sein darf.
 * Ausschliesslich auf Loopback (`127.0.0.1` / `localhost`) mit explizitem `?pseudoRtl=1`
 * (oder direkter Injektion in Unit-Tests). Auf produktiven Hosts (z. B. GitHub Pages) immer `false`.
 */
export function isPseudoRtlEnabled(loc?: {
  readonly hostname?: string;
  readonly search?: string;
}): boolean {
  const target =
    loc ??
    (typeof window !== 'undefined'
      ? { hostname: window.location.hostname, search: window.location.search }
      : null);
  if (!target?.hostname || !target.search) {
    return false;
  }
  const host = target.hostname.toLowerCase();
  if (host !== '127.0.0.1' && host !== 'localhost' && host !== '[::1]') {
    return false;
  }
  try {
    return new URLSearchParams(target.search).get('pseudoRtl') === '1';
  } catch {
    return false;
  }
}

/**
 * Erweitert eine Sprach-Registry unveränderlich um die Pseudo-RTL-Sprache `ar-XB` für Tests.
 */
export function withPseudoRtlRegistry(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): LanguagesRegistry {
  if (registry.secondary.includes(PSEUDO_RTL_LANG)) {
    return registry;
  }
  return {
    ...registry,
    secondary: [...registry.secondary, PSEUDO_RTL_LANG],
    meta: {
      ...registry.meta,
      [PSEUDO_RTL_LANG]: PSEUDO_RTL_META,
    },
  };
}

const PSEUDO_RTL_FOOD_NAMES: Readonly<Record<string, string>> = {
  broccoli: 'بروكلي',
  potato: 'بطاطس',
  salmon: 'سلمون',
  garlic: 'ثوم',
  olive_oil: 'زيت زيتون',
  salt: 'ملح',
  pepper: 'فلفل أسود',
  lemon_juice: 'عصير ليمون',
  red_lentils: 'عدس أحمر',
  spinach: 'سبانخ',
  oats: 'شوفان',
  apple: 'تفاح',
  onion: 'بصل',
};

/**
 * Liefert arabische RTL-Testnamen für `ar-XB` (nur für Bidi-Isolations-Tests, nicht im Produktiv-Glossar).
 */
export function pseudoRtlFoodName(
  id: FoodId | string,
  fallbackBase?: string,
): string {
  if (typeof id === 'string' && Object.hasOwn(PSEUDO_RTL_FOOD_NAMES, id)) {
    return PSEUDO_RTL_FOOD_NAMES[id]!;
  }
  return `مكوّن ${fallbackBase || id}`;
}

const PSEUDO_RTL_RECIPE_TITLES: Readonly<Record<string, string>> = {
  oven_salmon: 'سلمون في الفرن مع بروكلي وبطاطس',
  lentil_curry: 'كاري العدس بحليب جوز الهند والسبانخ',
  birchermuesli: 'بيرشر موسلي بالشوفان والتفاح',
  pho: 'شوربة فو مع أعشاب طازجة',
  thai_curry: 'كاري تايلندي أخضر مع خضار',
};

/**
 * Liefert arabische RTL-Testtitel für Rezepte unter `ar-XB` (nur für Bidi-Tests, nicht im Produktiv-Katalog).
 */
export function pseudoRtlRecipeTitle(
  id: RecipeId | string,
  fallbackTitle?: string,
): string {
  if (typeof id === 'string' && Object.hasOwn(PSEUDO_RTL_RECIPE_TITLES, id)) {
    return PSEUDO_RTL_RECIPE_TITLES[id]!;
  }
  return fallbackTitle ? `وصفة ${fallbackTitle}` : `وصفة ${id}`;
}

const PSEUDO_RTL_UI_TEXTS: Readonly<Record<string, string>> = {
  'einkauf.einkaufsliste': 'قائمة التسوق',
  'shop.from.plan': 'أنشئت من الخطة لـ {n} أيام',
  'shop.grp.veg': 'خضار',
  'shop.grp.fruit': 'فواكه',
  'shop.grp.dairy': 'ألبان وبيض',
  'shop.grp.meat': 'لحوم ودواجن',
  'shop.grp.fish': 'أسماك',
  'shop.grp.bakery': 'خبز ومخبوزات',
  'shop.grp.pantry': 'مؤونة',
  'shop.grp.spice': 'توابل وزيوت',
  'shop.grp.drinks': 'مشروبات',
  'shop.sec.cart': 'في السلة',
  'shop.sec.home': 'موجود في المنزل',
  'shop.src.sum': 'المجموع: {qty}',
  'shop.have.title': 'كم لديك بالفعل في المنزل؟',
  'shop.have.all': 'كل شيء موجود',
  'shop.have.athome': 'موجود في المنزل: {qty}',
  'shop.have.reset': 'إعادة تعيين',
  'shop.have.apply': 'تطبيق',
};

export interface TInOptions {
  readonly registry?: LanguagesRegistry;
  readonly locales?: Readonly<Record<string, UiLocaleDict>>;
}

export interface TSecondOptions extends TInOptions {
  readonly mainText?: string;
}

function formatIcuMessage(
  template: string,
  locale: string,
  vars?: Readonly<Record<string, string | number>>,
): string {
  if (!vars || !template.includes('{')) {
    return template;
  }
  try {
    const formatted = new IntlMessageFormat(template, locale).format(vars);
    if (typeof formatted === 'string') {
      return formatted;
    }
    if (Array.isArray(formatted)) {
      return formatted.map((part) => String(part)).join('');
    }
    return String(formatted);
  } catch {
    return template;
  }
}

/**
 * Liest einen UI-Text aus der angegebenen Sprache (über eigene Schlüssel, **ohne** englischen Ersatz)
 * und formatiert allfällige ICU-Platzhalter. Fehlt Sprache oder Schlüssel, wird `''` zurückgegeben.
 */
export function tIn(
  code: LangCode | null | undefined,
  key: string,
  vars?: Readonly<Record<string, string | number>>,
  options?: TInOptions,
): string {
  if (!code || typeof code !== 'string' || typeof key !== 'string' || !key) {
    return '';
  }
  if (code === PSEUDO_RTL_LANG) {
    if (!Object.hasOwn(PSEUDO_RTL_UI_TEXTS, key)) {
      return '';
    }
    return formatIcuMessage(PSEUDO_RTL_UI_TEXTS[key]!, PSEUDO_RTL_META.locale, vars);
  }
  const locales = options?.locales ?? UI_LOCALES;
  if (!Object.hasOwn(locales, code)) {
    return '';
  }
  const dict = locales[code];
  if (!dict || !Object.hasOwn(dict, key)) {
    return '';
  }
  const template = dict[key];
  if (typeof template !== 'string' || template.length === 0) {
    return '';
  }
  const registry = options?.registry ?? LANGUAGES_REGISTRY;
  const locale = getLangMeta(code, registry)?.locale ?? code;
  return formatIcuMessage(template, locale, vars);
}

/**
 * Liefert den UI-Text in der wirksamen Zweitsprache gemäss Issue #32 / Prototyp v5.10.1:
 * leer (`''`), wenn keine Zweitsprache aktiv ist, Zweit- und Hauptsprache identisch sind,
 * der Schlüssel in der Zweitsprache fehlt (kein EN-Ersatz) oder der Text dem Haupttext gleicht.
 */
export function tSecond(
  secondLang: LangCode | null | undefined,
  uiLang: LangCode,
  key: string,
  vars?: Readonly<Record<string, string | number>>,
  options?: TSecondOptions,
): string {
  if (!secondLang || secondLang === uiLang) {
    return '';
  }
  const secondaryText = tIn(secondLang, key, vars, options);
  if (!secondaryText) {
    return '';
  }
  const mainText = options?.mainText ?? tIn(uiLang, key, vars, options);
  return secondaryText !== mainText ? secondaryText : '';
}
