import { isSafeRecordKey } from './schemas.ts';
import {
  DEFAULT_UI_LANG,
  type LangCode,
  type LanguagesRegistry,
  type SecondLangSetting,
} from './types.ts';

/**
 * Extrahiert den Basis-Sprachcode eines BCP-47-Tags (`de-CH` -> `de`, `pt-BR` -> `pt`).
 * Gibt `null` zurück bei ungültigem Typ, leerem Wert oder reservierten Objekt-Schlüsseln.
 */
export function normalizeLangBase(tag: unknown): string | null {
  if (typeof tag !== 'string') {
    return null;
  }
  const base = tag.trim().toLowerCase().split(/[-_]/)[0] ?? '';
  if (!base || !isSafeRecordKey(base)) {
    return null;
  }
  return base;
}

/**
 * Prüft das Aktiv- und Rechts-Gate (ADR-003, F1) direkt gegen eine Sprach-Registry.
 * Nur Sprachen mit `active !== false` und `legalApproved === true` sind wählbar.
 */
export function isApprovedUiLang(
  code: unknown,
  registry: LanguagesRegistry,
): code is LangCode {
  if (typeof code !== 'string' || !isSafeRecordKey(code)) {
    return false;
  }
  if (!registry.ui.includes(code) || !Object.hasOwn(registry.meta, code)) {
    return false;
  }
  const meta = registry.meta[code];
  return meta?.active !== false && meta?.legalApproved === true;
}

/**
 * Liefert alle freigegebenen UI-Sprachen aus einer Sprach-Registry (F1).
 */
export function getApprovedUiLangsFromRegistry(
  registry: LanguagesRegistry,
): LangCode[] {
  return registry.ui.filter((code) => isApprovedUiLang(code, registry));
}

/**
 * Prüft, ob ein Sprachcode als Zweitsprache in `registry.secondary` eingetragen ist (F3a).
 * Zweitsprachen unterliegen gemäss ADR-003 keinem Rechts-Gate.
 */
export function isSupportedSecondaryLang(
  code: unknown,
  registry: LanguagesRegistry,
): code is LangCode {
  return (
    typeof code === 'string' &&
    isSafeRecordKey(code) &&
    registry.secondary.includes(code)
  );
}

function isLanguagesRegistry(
  value: readonly LangCode[] | LanguagesRegistry,
): value is LanguagesRegistry {
  return !Array.isArray(value);
}

/**
 * Prüft `uiLang` strikt gegen eine Whitelist (oder direkt die freigegebenen Sprachen
 * einer Sprach-Registry, F1/N2). Unbekannte Werte, nicht freigegebene Sprachen und
 * Prototype-Schlüssel (`constructor`, `__proto__`) fallen deterministisch auf `fallback` (`en`) zurück.
 */
export function coerceUiLang(
  value: unknown,
  allowedOrRegistry: readonly LangCode[] | LanguagesRegistry,
  fallback?: LangCode,
): LangCode {
  const allowed = isLanguagesRegistry(allowedOrRegistry)
    ? getApprovedUiLangsFromRegistry(allowedOrRegistry)
    : allowedOrRegistry;
  const preferredFallback =
    fallback ??
    (isLanguagesRegistry(allowedOrRegistry)
      ? allowedOrRegistry.fallback
      : DEFAULT_UI_LANG);

  const safeFallback =
    typeof preferredFallback === 'string' &&
    isSafeRecordKey(preferredFallback) &&
    allowed.includes(preferredFallback)
      ? preferredFallback
      : (allowed[0] ?? DEFAULT_UI_LANG);

  if (typeof value !== 'string') {
    return safeFallback;
  }
  const trimmed = value.trim();
  if (!trimmed || !isSafeRecordKey(trimmed)) {
    return safeFallback;
  }
  if (allowed.includes(trimmed)) {
    return trimmed;
  }
  const base = normalizeLangBase(trimmed);
  if (base && allowed.includes(base)) {
    return base;
  }
  return safeFallback;
}

/**
 * Prüft `secondLang` dreiwertig gegen `registry.secondary` (oder eine explizite Whitelist, F3a / E6):
 * - `null`, `undefined`, `''`, `'auto'` → `null` (automatisch nach Ort)
 * - `'none'` → `'none'` (explizit keine Zweitsprache)
 * - gültiger Code in `registry.secondary` → Sprachcode
 * - ungültige, nicht gelistete oder reservierte Schlüssel fallen sicher auf `null` (automatisch) zurück.
 */
export function coerceSecondLang(
  value: unknown,
  allowedOrRegistry: readonly LangCode[] | LanguagesRegistry,
): SecondLangSetting {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'auto') {
    return null;
  }
  if (trimmed === 'none') {
    return 'none';
  }
  if (!isSafeRecordKey(trimmed)) {
    return null;
  }
  const allowed = isLanguagesRegistry(allowedOrRegistry)
    ? allowedOrRegistry.secondary
    : allowedOrRegistry;

  if (allowed.includes(trimmed)) {
    return trimmed;
  }
  const base = normalizeLangBase(trimmed);
  if (base && allowed.includes(base)) {
    return base;
  }
  return null;
}
