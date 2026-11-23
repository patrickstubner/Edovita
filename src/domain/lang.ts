import { isSafeRecordKey } from './schemas.ts';
import {
  DEFAULT_UI_LANG,
  SUPPORTED_UI_LANGS,
  type LangCode,
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
 * Prüft `uiLang` strikt gegen eine Whitelist unterstützter Sprachen (N2).
 * Unbekannte Werte, Nicht-Strings und Prototype-Schlüssel (`constructor`, `__proto__`)
 * fallen deterministisch auf `fallback` (`en`) zurück.
 */
export function coerceUiLang(
  value: unknown,
  allowed: readonly LangCode[] = SUPPORTED_UI_LANGS,
  fallback: LangCode = DEFAULT_UI_LANG,
): LangCode {
  const safeFallback =
    typeof fallback === 'string' &&
    isSafeRecordKey(fallback) &&
    allowed.includes(fallback)
      ? fallback
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
