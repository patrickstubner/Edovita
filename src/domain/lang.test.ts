import { describe, expect, it } from '@rstest/core';
import {
  DEFAULT_UI_LANG,
  coerceSecondLang,
  coerceSettings,
  coerceUiLang,
  createSettingsSchema,
  isApprovedUiLang,
  isSupportedSecondaryLang,
  normalizeLangBase,
  type LanguagesRegistry,
} from './index.ts';

const TEST_REGISTRY: LanguagesRegistry = {
  fallback: 'en',
  ui: ['de', 'en', 'fr', 'pt'],
  secondary: ['de', 'en', 'pt', 'ja'],
  meta: {
    de: {
      code: 'de',
      name: 'Deutsch',
      locale: 'de-CH',
      dir: 'ltr',
      legalApproved: true,
      reviewed: true,
    },
    en: {
      code: 'en',
      name: 'English',
      locale: 'en-GB',
      dir: 'ltr',
      legalApproved: true,
      reviewed: false,
    },
    fr: {
      code: 'fr',
      name: 'Français',
      locale: 'fr-CH',
      dir: 'ltr',
      legalApproved: false,
      reviewed: false,
    },
    pt: {
      code: 'pt',
      name: 'Português',
      locale: 'pt-BR',
      dir: 'ltr',
      legalApproved: false,
      reviewed: false,
    },
    ja: {
      code: 'ja',
      name: '日本語',
      locale: 'ja-JP',
      dir: 'ltr',
      legalApproved: false,
      reviewed: false,
    },
  },
};

describe('domain/lang (N2, F1 Rechts-Gate, F3a secondLang)', () => {
  it('normalisiert BCP-47-Basis-Sprachcodes und lehnt Prototype-Schlüssel ab', () => {
    expect(normalizeLangBase('de-CH')).toBe('de');
    expect(normalizeLangBase('pt-BR')).toBe('pt');
    expect(normalizeLangBase('EN_gb')).toBe('en');
    expect(normalizeLangBase('constructor')).toBeNull();
    expect(normalizeLangBase('__proto__')).toBeNull();
    expect(normalizeLangBase('prototype')).toBeNull();
    expect(normalizeLangBase('')).toBeNull();
    expect(normalizeLangBase(null)).toBeNull();
  });

  it('beschränkt uiLang über die Sprach-Registry auf freigegebene Sprachen mit Fallback en (F1)', () => {
    expect(isApprovedUiLang('de', TEST_REGISTRY)).toBe(true);
    expect(isApprovedUiLang('en', TEST_REGISTRY)).toBe(true);
    expect(isApprovedUiLang('fr', TEST_REGISTRY)).toBe(false);
    expect(isApprovedUiLang('pt', TEST_REGISTRY)).toBe(false);

    expect(coerceUiLang('de', TEST_REGISTRY)).toBe('de');
    expect(coerceUiLang('de-CH', TEST_REGISTRY)).toBe('de');
    expect(coerceUiLang('fr', TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('pt-BR', TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('xx', TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('constructor', TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('__proto__', TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('toString', TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang(42, TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang(undefined, TEST_REGISTRY)).toBe(DEFAULT_UI_LANG);
  });

  it('prüft secondLang gegen registry.secondary mit Fallback null (F3a)', () => {
    expect(isSupportedSecondaryLang('pt', TEST_REGISTRY)).toBe(true);
    expect(isSupportedSecondaryLang('ja', TEST_REGISTRY)).toBe(true);
    expect(isSupportedSecondaryLang('fr', TEST_REGISTRY)).toBe(false);

    expect(coerceSecondLang('pt', TEST_REGISTRY)).toBe('pt');
    expect(coerceSecondLang('pt-BR', TEST_REGISTRY)).toBe('pt');
    expect(coerceSecondLang('ja-JP', TEST_REGISTRY)).toBe('ja');
    expect(coerceSecondLang(null, TEST_REGISTRY)).toBeNull();
    expect(coerceSecondLang('', TEST_REGISTRY)).toBeNull();
    expect(coerceSecondLang('fr', TEST_REGISTRY)).toBeNull();
    expect(coerceSecondLang('xx', TEST_REGISTRY)).toBeNull();
    expect(coerceSecondLang('constructor', TEST_REGISTRY)).toBeNull();
    expect(coerceSecondLang('__proto__', TEST_REGISTRY)).toBeNull();
  });

  it('createSettingsSchema akzeptiert nur freigegebene uiLang und registry.secondary (F1, F3a)', () => {
    const schema = createSettingsSchema(TEST_REGISTRY);

    expect(
      schema.safeParse({
        uiLang: 'de',
        secondLang: 'pt',
        theme: 'system',
        sound: true,
        hymn: 'H1',
      }).success,
    ).toBe(true);

    // Nicht freigegebene UI-Sprachen (fr, pt) sowie unbekannte/Prototype-Werte werden abgelehnt
    for (const badUi of ['fr', 'pt', 'xx', 'constructor', '__proto__', 'toString']) {
      expect(
        schema.safeParse({
          uiLang: badUi,
          secondLang: null,
          theme: 'system',
          sound: true,
          hymn: 'H1',
        }).success,
      ).toBe(false);
    }

    // Nicht in registry.secondary gelistete Zweitsprachen werden abgelehnt
    for (const badSec of ['fr', 'xx', 'constructor', '__proto__']) {
      expect(
        schema.safeParse({
          uiLang: 'de',
          secondLang: badSec,
          theme: 'system',
          sound: true,
          hymn: 'H1',
        }).success,
      ).toBe(false);
    }

    // coerceSettings fällt bei manipulierten Werten sicher auf Standardwerte zurück
    expect(
      coerceSettings(
        {
          uiLang: 'fr',
          secondLang: 'xx',
          theme: 'neon',
          sound: 'invalid',
          hymn: 'H9',
        },
        TEST_REGISTRY,
      ),
    ).toEqual({
      uiLang: 'en',
      secondLang: null,
      theme: 'system',
      sound: true,
      hymn: 'H1',
    });
  });
});
