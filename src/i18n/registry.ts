import { LANGUAGES_REGISTRY } from '../../content/generated/locales-index.ts';
import {
  DEFAULT_UI_LANG,
  coerceSecondLang,
  coerceUiLang,
  isApprovedUiLang,
  normalizeLangBase,
  type LangCode,
  type LangMeta,
  type LanguagesRegistry,
  type SecondLangSetting,
} from '../domain/index.ts';

/** Aus der Sprach-Registry abgeleitete UI-Sprachen (F1, nicht hartkodiert). */
export const SUPPORTED_UI_LANGS: readonly LangCode[] = LANGUAGES_REGISTRY.ui;

/** Aus der Sprach-Registry abgeleitete Zweitsprachen (F3a, nicht hartkodiert). */
export const SECONDARY_LANGS: readonly LangCode[] =
  LANGUAGES_REGISTRY.secondary;

export interface DetectedLang {
  code: LangCode;
  device: string;
  matched: boolean;
}

export function getRegistry(): LanguagesRegistry {
  return LANGUAGES_REGISTRY;
}

export function getFallbackLang(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): LangCode {
  return registry.fallback;
}

export function getUiLanguages(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): readonly LangCode[] {
  return registry.ui;
}

export function getSecondaryLanguages(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): readonly LangCode[] {
  return registry.secondary;
}

/**
 * Liefert Metadaten einer Sprache nur über eigene Schlüssel (N2 / Object.hasOwn).
 */
export function getLangMeta(
  code: LangCode,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): LangMeta | undefined {
  if (typeof code !== 'string' || !Object.hasOwn(registry.meta, code)) {
    return undefined;
  }
  return registry.meta[code];
}

export function isSupportedUiLang(
  code: unknown,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): code is LangCode {
  return (
    typeof code === 'string' &&
    registry.ui.includes(code) &&
    Object.hasOwn(registry.meta, code)
  );
}

/**
 * Rechts-Gate gemäss ADR-003: nur UI-Sprachen mit `legalApproved === true` sind wählbar.
 */
export function approved(
  code: unknown,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): code is LangCode {
  return isApprovedUiLang(code, registry);
}

export function getApprovedUiLanguages(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): LangCode[] {
  return registry.ui.filter((code) => approved(code, registry));
}

/**
 * Validiert eine beliebige Eingabe gegen die Whitelist freigegebener UI-Sprachen
 * und fällt deterministisch auf `registry.fallback` (`en`) zurück (N2, F1).
 */
export function resolveApprovedUiLang(
  value: unknown,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): LangCode {
  return coerceUiLang(value, registry);
}

/**
 * Validiert `secondLang` dreiwertig gegen `registry.secondary` (`null` = automatisch,
 * `'none'` = keine, Sprachcode = manuell; unbekannte Werte fallen auf `null` zurück).
 */
export function resolveSecondLang(
  value: unknown,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): SecondLangSetting {
  return coerceSecondLang(value, registry);
}

/**
 * Ermittelt die Startsprache aus den Gerätesprachen mit Basis-Abgleich (`de-CH` -> `de`,
 * `pt-BR` -> `pt` -> Fallback `en` solange nicht freigegeben).
 * Verhaltensgleich zu `prototype/i18n.js detect()`.
 */
export function detectUiLang(
  navigatorLanguages?: readonly string[] | null,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): DetectedLang {
  const fallback = approved(registry.fallback, registry)
    ? registry.fallback
    : (getApprovedUiLanguages(registry)[0] ?? DEFAULT_UI_LANG);

  let candidates: readonly string[];
  if (navigatorLanguages && navigatorLanguages.length > 0) {
    candidates = navigatorLanguages;
  } else if (typeof navigator !== 'undefined') {
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      candidates = navigator.languages;
    } else if (navigator.language) {
      candidates = [navigator.language];
    } else {
      candidates = [fallback];
    }
  } else {
    candidates = [fallback];
  }

  for (const raw of candidates) {
    const base = normalizeLangBase(raw);
    if (base && approved(base, registry)) {
      return {
        code: base,
        device: String(raw),
        matched: true,
      };
    }
  }

  return {
    code: fallback,
    device: String(candidates[0] ?? ''),
    matched: false,
  };
}
