import { describe, expect, it } from '@rstest/core';
import {
  approved,
  createI18nInstance,
  detectUiLang,
  fmtAmount,
  fmtDate,
  fmtNumber,
  getApprovedUiLanguages,
  getLangMeta,
  getUiLanguages,
  resolveApprovedUiLang,
} from './index.ts';

describe('i18n/registry & Rechts-Gate (ADR-003)', () => {
  it('kennt alle 7 v1-Sprachen und gibt nur DE/EN per Rechts-Gate frei', () => {
    expect(getUiLanguages()).toEqual(['de', 'en', 'fr', 'it', 'es', 'ja', 'pt']);
    expect(getApprovedUiLanguages()).toEqual(['de', 'en']);

    expect(approved('de')).toBe(true);
    expect(approved('en')).toBe(true);
    for (const pending of ['fr', 'it', 'es', 'ja', 'pt']) {
      expect(approved(pending)).toBe(false);
    }
    // N2: Prototype-Schlüssel und unbekannte Codes abgelehnt
    for (const bad of ['constructor', '__proto__', 'toString', 'xx', '']) {
      expect(approved(bad)).toBe(false);
      expect(getLangMeta(bad)).toBeUndefined();
    }
  });

  it('erkennt Gerätesprache mit Basis-Abgleich: de-CH -> de, pt-BR -> Fallback en', () => {
    expect(detectUiLang(['de-CH'])).toEqual({
      code: 'de',
      device: 'de-CH',
      matched: true,
    });
    expect(detectUiLang(['en-US'])).toEqual({
      code: 'en',
      device: 'en-US',
      matched: true,
    });
    // PT noch nicht legalApproved -> Fallback EN
    expect(detectUiLang(['pt-BR'])).toEqual({
      code: 'en',
      device: 'pt-BR',
      matched: false,
    });
    // Erstes freigegebenes Match in der Liste gewinnt
    expect(detectUiLang(['fr-CH', 'de-AT'])).toEqual({
      code: 'de',
      device: 'de-AT',
      matched: true,
    });
    // Ungültige / Prototype-Eingaben fallen auf EN zurück
    expect(detectUiLang(['constructor', '__proto__'])).toEqual({
      code: 'en',
      device: 'constructor',
      matched: false,
    });
  });

  it('normalisiert uiLang gegen die Whitelist freigegebener Sprachen (N2)', () => {
    expect(resolveApprovedUiLang('de')).toBe('de');
    expect(resolveApprovedUiLang('de-CH')).toBe('de');
    expect(resolveApprovedUiLang('en')).toBe('en');
    expect(resolveApprovedUiLang('pt')).toBe('en');
    expect(resolveApprovedUiLang('fr')).toBe('en');
    expect(resolveApprovedUiLang('constructor')).toBe('en');
    expect(resolveApprovedUiLang('__proto__')).toBe('en');
    expect(resolveApprovedUiLang(null)).toBe('en');
  });
});

describe('i18n/instance (i18next + i18next-icu)', () => {
  it('interpoliert ICU-Platzhalter und wechselt Sprache ohne Neustart', async () => {
    const inst = createI18nInstance({ initialLang: 'de' });
    expect(inst.t('start.willkommen_bei_edovita')).toBe('Willkommen bei Edovita');
    expect(inst.t('lang.detected', { name: 'Deutsch' })).toBe('Erkannt: Deutsch');

    await inst.changeLanguage('en');
    expect(inst.t('start.willkommen_bei_edovita')).toBe('Welcome to Edovita');
    expect(inst.t('lang.fallback.x', { device: 'pt-BR' })).toContain('pt-BR');
  });

  it('unterstützt ICU-Pluralformatierung über i18next-icu', () => {
    const inst = createI18nInstance({
      initialLang: 'de',
      locales: {
        de: {
          'test.items': '{count, plural, =0 {Keine Artikel} one {# Artikel} other {# Artikel}}',
        },
        en: {
          'test.items': '{count, plural, =0 {No items} one {# item} other {# items}}',
        },
      },
    });
    expect(inst.t('test.items', { count: 0 })).toBe('Keine Artikel');
    expect(inst.t('test.items', { count: 1 })).toBe('1 Artikel');
    expect(inst.t('test.items', { count: 4 })).toBe('4 Artikel');
  });
});

describe('i18n/format (Intl-Formatierer, metrisch)', () => {
  it('formatiert Zahlen, metrische Mengen und Daten sprachabhängig', () => {
    expect(fmtNumber(1500, 'en-GB')).toBe('1,500');
    expect(fmtNumber(1.5, 'de-CH', 1)).toMatch(/1[.,]5/);
    expect(fmtAmount(250, 'g', 'de-CH')).toContain('250');
    expect(fmtAmount(250, 'g', 'de-CH')).toContain('g');
    expect(fmtAmount(100, 'ml', 'en-GB')).toContain('100');
    expect(fmtAmount(100, 'ml', 'en-GB')).toContain('ml');
    expect(fmtAmount(2, 'tbsp', 'de-CH')).toBe('2 EL');
    expect(fmtAmount(2, 'tbsp', 'en-GB')).toBe('2 tbsp');
    expect(fmtDate(new Date('2026-11-23T12:00:00Z'), 'en-GB')).toContain('2026');
  });
});
