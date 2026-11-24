/**
 * Internationalisierungs-Schicht (ADR-001, ADR-003).
 * Stellt i18next + i18next-icu, Sprach-Registry mit Rechts-Gate, Gerätesprachen-Erkennung,
 * Intl-Formatierer und die reine Locale-Validierung bereit (ohne React-Importe).
 */

export const I18N_LAYER_VERSION = 2;

export {
  LANGUAGES_REGISTRY,
  UI_LOCALES,
  type UiKey,
} from '../../content/generated/locales-index.ts';

export {
  SECONDARY_LANGS,
  SUPPORTED_UI_LANGS,
  approved,
  detectUiLang,
  getApprovedUiLanguages,
  getFallbackLang,
  getLangMeta,
  getRegistry,
  getSecondaryLanguages,
  getUiLanguages,
  isSupportedUiLang,
  resolveApprovedUiLang,
  resolveSecondLang,
  type DetectedLang,
} from './registry.ts';

export { fmtAmount, fmtDate, fmtNumber } from './format.ts';

export {
  LANG_STORAGE_KEY,
  applyLangToDocument,
  createI18nInstance,
  readStoredUiLang,
  writeStoredUiLang,
  type CreateI18nOptions,
} from './instance.ts';

export {
  extractPlaceholderNames,
  hasBalancedBraces,
  validateLocalesBundle,
  type LocalesValidationReport,
  type RawLocalesBundle,
} from './validateLocales.ts';

export {
  ALLERGEN_LABEL_KEYS,
  BRAND_LABEL_KEYS,
  CUISINE_LABEL_KEYS,
  FOOD_GROUP_LABEL_KEYS,
  MEAL_LABEL_KEYS,
  REGION_LABEL_KEYS,
  getCuisineLabelKey,
} from './labels.ts';

export {
  COUNTRY_LANG,
  PSEUDO_RTL_LANG,
  PSEUDO_RTL_META,
  SECOND_LANG_STORAGE_KEY,
  TZ_COUNTRY,
  autoSecondLang,
  countryFromLanguages,
  countryFromTimeZone,
  effectiveSecondLang,
  inferCountry,
  isPseudoRtlEnabled,
  pseudoRtlFoodName,
  readStoredSecondLang,
  withPseudoRtlRegistry,
  writeStoredSecondLang,
  type SecondLangEnv,
} from './secondLang.ts';
