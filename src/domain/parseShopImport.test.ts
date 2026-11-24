import { describe, expect, it } from '@rstest/core';
import {
  asFoodId,
  asRecipeId,
  createExportBundleV1Schema,
  encodeShopImport,
  parseShopImport,
} from './index.ts';

function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

describe('parseShopImport', () => {
  it('dekodiert gültige QR-Fragmente inklusive Umlaute und aller drei Zustände', () => {
    const fragment = encodeShopImport([
      { id: 'broccoli', name: 'Broccoli', st: 'open' },
      { id: 'apple', name: 'Äpfel', st: 'cart' },
      { id: 'oats', name: 'Haferflocken', st: 'home' },
    ]);

    const res = parseShopImport(fragment);
    expect(res).toEqual({
      ok: true,
      value: [
        { id: 'broccoli', name: 'Broccoli', st: 'open' },
        { id: 'apple', name: 'Äpfel', st: 'cart' },
        { id: 'oats', name: 'Haferflocken', st: 'home' },
      ],
    });
  });

  it('lehnt ungültiges Fragment-Format ab (format)', () => {
    expect(parseShopImport('')).toEqual({ ok: false, error: 'format' });
    expect(parseShopImport('#/rezepte')).toEqual({ ok: false, error: 'format' });
    expect(parseShopImport('#/einkauf#import=nicht!base64')).toEqual({
      ok: false,
      error: 'format',
    });
  });

  it('lehnt zu grosse Payloads ab (size)', () => {
    expect(parseShopImport(`#/einkauf#import=${'a'.repeat(4001)}`)).toEqual({
      ok: false,
      error: 'size',
    });

    const hugeJson = JSON.stringify({
      v: 1,
      items: Array.from({ length: 40 }, (_, i) => ({
        id: `item_${i}`,
        n: 'A'.repeat(75),
        st: 'open',
      })),
    });
    expect(hugeJson.length).toBeGreaterThan(3000);
    expect(parseShopImport(`#/einkauf#import=${toBase64Url(hugeJson)}`)).toEqual({
      ok: false,
      error: 'size',
    });

    const okPadLen = 3000 - '{"v":1,"items":[],"p":""}'.length;
    const okJson = `{"v":1,"items":[],"p":"${'a'.repeat(okPadLen)}"}`;
    expect(okJson.length).toBe(3000);
    expect(toBase64Url(okJson).length).toBe(4000);
    expect(parseShopImport(`#/einkauf#import=${toBase64Url(okJson)}`)).toEqual({
      ok: true,
      value: [],
    });
  });

  it('lehnt ungültiges JSON oder defektes Base64 ab (parse)', () => {
    expect(parseShopImport(`#/einkauf#import=${toBase64Url('{kaputt')}`)).toEqual(
      { ok: false, error: 'parse' },
    );
    expect(parseShopImport('#/einkauf#import=___')).toEqual({
      ok: false,
      error: 'parse',
    });
  });

  it('lehnt ungültiges Schema und ungültigen Zustand st ab (schema)', () => {
    const wrongVersion = `#/einkauf#import=${toBase64Url(JSON.stringify({ v: 2, items: [] }))}`;
    expect(parseShopImport(wrongVersion)).toEqual({
      ok: false,
      error: 'schema',
    });

    const wrongState = `#/einkauf#import=${toBase64Url(
      JSON.stringify({ v: 1, items: [{ id: 'broccoli', n: 'Broccoli', st: 'hacked' }] }),
    )}`;
    expect(parseShopImport(wrongState)).toEqual({ ok: false, error: 'schema' });

    const nonArray = `#/einkauf#import=${toBase64Url(JSON.stringify({ v: 1, items: {} }))}`;
    expect(parseShopImport(nonArray)).toEqual({ ok: false, error: 'schema' });
  });

  it('lehnt mehr als 40 Artikel ab (count)', () => {
    const items = Array.from({ length: 41 }, (_, i) => ({
      id: `i${i}`,
      n: `A${i}`,
      st: 'open',
    }));
    const fragment = `#/einkauf#import=${toBase64Url(JSON.stringify({ v: 1, items }))}`;
    expect(parseShopImport(fragment)).toEqual({ ok: false, error: 'count' });
  });

  it('lehnt ungültige IDs und Prototype-Pollution-Schlüssel ab (id)', () => {
    for (const badId of ['../etc', 'a b', '__proto__', 'constructor', 'prototype']) {
      const fragment = `#/einkauf#import=${toBase64Url(
        JSON.stringify({ v: 1, items: [{ id: badId, n: 'Test', st: 'open' }] }),
      )}`;
      expect(parseShopImport(fragment)).toEqual({ ok: false, error: 'id' });
    }
  });

  it('lehnt XSS-/HTML-Zeichen und Steuerzeichen im Namen ab (name)', () => {
    for (const badName of [
      '<script>alert(1)</script>',
      'Milch & Honig',
      'Kaffee "stark"',
      "Tee 'grün'",
      'Zeile\nUmbruch',
    ]) {
      const fragment = `#/einkauf#import=${toBase64Url(
        JSON.stringify({ v: 1, items: [{ id: 'milk', n: badName, st: 'open' }] }),
      )}`;
      expect(parseShopImport(fragment)).toEqual({ ok: false, error: 'name' });
    }
  });
});

describe('createExportBundleV1Schema', () => {
  const testRegistry = {
    fallback: 'en',
    ui: ['de', 'en', 'fr'],
    secondary: ['de', 'en', 'pt', 'ja'],
    meta: {
      de: {
        code: 'de',
        name: 'Deutsch',
        locale: 'de-CH',
        dir: 'ltr' as const,
        legalApproved: true,
        reviewed: true,
      },
      en: {
        code: 'en',
        name: 'English',
        locale: 'en-GB',
        dir: 'ltr' as const,
        legalApproved: true,
        reviewed: false,
      },
      fr: {
        code: 'fr',
        name: 'Français',
        locale: 'fr-CH',
        dir: 'ltr' as const,
        legalApproved: false,
        reviewed: false,
      },
    },
  };
  const bundleSchema = createExportBundleV1Schema(testRegistry);

  it('akzeptiert gültiges Export-Bundle Format 1 und lehnt unbekannte Felder oder unfreigegebene Sprachen ab', () => {
    const valid = bundleSchema.safeParse({
      format: 1,
      exportedAt: '2026-11-22T12:00:00.000Z',
      data: {
        settings: {
          uiLang: 'de',
          secondLang: 'pt',
          theme: 'system',
          sound: true,
          hymn: 'H1',
        },
        shopping: [
          {
            id: 's1',
            food: asFoodId('broccoli'),
            amount: 400,
            unit: 'g',
            state: 'open',
            fromRecipes: [asRecipeId('oven_salmon')],
            addedAt: '2026-11-22T12:00:00.000Z',
          },
        ],
      },
    });
    expect(valid.success).toBe(true);

    const invalidFormat = bundleSchema.safeParse({
      format: 2,
      exportedAt: '2026-11-22T12:00:00.000Z',
      data: {},
    });
    expect(invalidFormat.success).toBe(false);

    const invalidUiLang = bundleSchema.safeParse({
      format: 1,
      exportedAt: '2026-11-22T12:00:00.000Z',
      data: {
        settings: {
          uiLang: 'fr',
          secondLang: null,
          theme: 'system',
          sound: true,
          hymn: 'H1',
        },
      },
    });
    expect(invalidUiLang.success).toBe(false);
  });
});
