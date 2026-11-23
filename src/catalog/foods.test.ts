import { describe, expect, it } from '@rstest/core';
import {
  foodName,
  getCatalogSource,
  getFood,
  getGlossaryLangs,
  isAllowed,
  listFoods,
} from './foods.ts';

describe('catalog/foods', () => {
  it('lädt alle 55 Lebensmittel und Quellen-Metadaten (CH-NWD 7.1)', () => {
    expect(listFoods().length).toBe(55);
    expect(getCatalogSource().name).toContain('Schweizer Nährwertdatenbank');
    expect(getGlossaryLangs()).toEqual(['de', 'en', 'ja', 'pt']);
  });

  it('liefert Lebensmittelnamen in DE, EN, PT und JA ohne englischen Ersatz bei unbekannter Sprache', () => {
    expect(foodName('broccoli', 'de')).toBe('Broccoli');
    expect(foodName('broccoli', 'en')).toBe('broccoli');
    expect(foodName('broccoli', 'pt')).toBe('brócolis');
    expect(foodName('broccoli', 'ja')).toBe('ブロッコリー');
    // ADR-003: fehlende Sprache oder fehlende ID -> null, kein EN-Fallback
    expect(foodName('broccoli', 'ar')).toBeNull();
    expect(foodName('unbekannt', 'de')).toBeNull();
    // N2: Prototype-Schlüssel liefern immer null (Object.hasOwn)
    expect(foodName('constructor', 'de')).toBeNull();
    expect(foodName('__proto__', 'de')).toBeNull();
    expect(foodName('toString', 'de')).toBeNull();
    expect(foodName('broccoli', 'constructor')).toBeNull();
    expect(foodName('broccoli', '__proto__')).toBeNull();
    expect(foodName('toString', 'constructor')).toBeNull();
  });

  it('filtert Lebensmittel gemäss Vorlieben und Allergien (isAllowed)', () => {
    const salmon = getFood('salmon')!;
    const milk = getFood('milk')!;
    const oats = getFood('oats')!;
    const hazelnuts = getFood('hazelnuts')!;
    const onion = getFood('onion')!;
    const coriander = getFood('coriander_fresh')!;
    const broccoli = getFood('broccoli')!;

    expect(isAllowed(salmon, { veg: true })).toBe(false);
    expect(isAllowed(salmon, { d_fish: true })).toBe(false);
    expect(isAllowed(milk, { veg: true })).toBe(true);
    expect(isAllowed(milk, { vegan: true })).toBe(false);
    expect(isAllowed(milk, { lactose: true })).toBe(false);
    expect(isAllowed(oats, { gluten: true })).toBe(false);
    expect(isAllowed(hazelnuts, { nuts: true })).toBe(false);
    expect(isAllowed(onion, { d_onion: true })).toBe(false);
    expect(isAllowed(coriander, { d_cil: true })).toBe(false);
    expect(isAllowed(broccoli, { vegan: true, gluten: true, nuts: true })).toBe(
      true,
    );
  });
});
