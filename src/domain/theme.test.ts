import { describe, expect, it } from '@rstest/core';
import { coerceThemePreference, ICON_NAMES } from './theme.ts';

describe('coerceThemePreference', () => {
  it('übernimmt gültige Whitelist-Werte unverändert', () => {
    expect(coerceThemePreference('system')).toBe('system');
    expect(coerceThemePreference('light')).toBe('light');
    expect(coerceThemePreference('dark')).toBe('dark');
  });

  it('fällt bei unbekannten oder manipulierten Werten sicher auf system zurück', () => {
    expect(coerceThemePreference(null)).toBe('system');
    expect(coerceThemePreference(undefined)).toBe('system');
    expect(coerceThemePreference('')).toBe('system');
    expect(coerceThemePreference('<script>alert(1)</script>')).toBe('system');
    expect(coerceThemePreference('DARK')).toBe('system');
    expect(coerceThemePreference(42)).toBe('system');
    expect(coerceThemePreference({})).toBe('system');
  });
});

describe('ICON_NAMES', () => {
  it('enthält eindeutige Symbolnamen aus dem Prototyp-Sprite', () => {
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });
});
