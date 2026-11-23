/* Auto-generiert von scripts/build-content-index.mjs – nicht von Hand bearbeiten. */
import type {
  LanguagesRegistry,
  UiLocaleDict,
} from '../../src/domain/index.ts';
import languagesFile from '../locales/languages.json';
import uiDe from '../locales/de/ui.json';
import uiEn from '../locales/en/ui.json';
import uiEs from '../locales/es/ui.json';
import uiFr from '../locales/fr/ui.json';
import uiIt from '../locales/it/ui.json';
import uiJa from '../locales/ja/ui.json';
import uiPt from '../locales/pt/ui.json';

export const LANGUAGES_REGISTRY: LanguagesRegistry = languagesFile as unknown as LanguagesRegistry;

export type UiKey = keyof typeof uiEn;

export const UI_LOCALES: Readonly<Record<string, UiLocaleDict>> = {
  de: uiDe,
  en: uiEn,
  es: uiEs,
  fr: uiFr,
  it: uiIt,
  ja: uiJa,
  pt: uiPt,
};
