import { describe, expect, it } from '@rstest/core';
import {
  DEFAULT_UI_LANG,
  coerceUiLang,
  normalizeLangBase,
  settingsSchema,
} from './index.ts';

describe('domain/lang (N2 Whitelist & Fallback)', () => {
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

  it('beschränkt uiLang auf die Whitelist und fällt deterministisch auf Fallback zurück', () => {
    expect(coerceUiLang('de')).toBe('de');
    expect(coerceUiLang('de-CH')).toBe('de');
    expect(coerceUiLang('pt-BR')).toBe('pt');
    expect(coerceUiLang('pt-BR', ['de', 'en'], 'en')).toBe('en');
    expect(coerceUiLang('xx')).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('constructor')).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('__proto__')).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang('toString')).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang(42)).toBe(DEFAULT_UI_LANG);
    expect(coerceUiLang(undefined)).toBe(DEFAULT_UI_LANG);
  });

  it('lehnt nicht-gelistete oder Prototype-uiLang-Werte in settingsSchema ab', () => {
    const valid = settingsSchema.safeParse({
      uiLang: 'de',
      secondLang: 'pt',
      theme: 'system',
      sound: true,
      hymn: 'H1',
    });
    expect(valid.success).toBe(true);

    for (const bad of ['xx', 'constructor', '__proto__', 'toString', '<script>']) {
      const res = settingsSchema.safeParse({
        uiLang: bad,
        secondLang: null,
        theme: 'system',
        sound: true,
        hymn: 'H1',
      });
      expect(res.success).toBe(false);
    }
  });
});
