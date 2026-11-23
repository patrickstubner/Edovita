import { describe, expect, it } from '@rstest/core';
import { getRecipe } from '../catalog/index.ts';
import { roundScaledAmount, scaleIngredients } from './scale.ts';

describe('roundScaledAmount', () => {
  it('rundet Gramm ab 10 g auf 5 g und kleine Gewürzmengen auf ganze Gramm', () => {
    expect(roundScaledAmount(12, 'g')).toBe(10);
    expect(roundScaledAmount(13, 'g')).toBe(15);
    expect(roundScaledAmount(37.5, 'g')).toBe(40);
    expect(roundScaledAmount(2, 'g')).toBe(2);
    expect(roundScaledAmount(0.4, 'g')).toBe(1);
  });

  it('rundet Milliliter ab 10 ml auf 10 ml und kleine Mengen auf 5 ml', () => {
    expect(roundScaledAmount(125, 'ml')).toBe(130);
    expect(roundScaledAmount(244, 'ml')).toBe(240);
    expect(roundScaledAmount(7, 'ml')).toBe(5);
    expect(roundScaledAmount(2, 'ml')).toBe(5);
  });

  it('rundet pc, tbsp und tsp auf halbe Schritte (mind. 0,5)', () => {
    expect(roundScaledAmount(0.25, 'pc')).toBe(0.5);
    expect(roundScaledAmount(0.75, 'pc')).toBe(1);
    expect(roundScaledAmount(1.3, 'pc')).toBe(1.5);
    expect(roundScaledAmount(1.2, 'tbsp')).toBe(1);
    expect(roundScaledAmount(0.6, 'tsp')).toBe(0.5);
  });

  it('rundet pinch auf ganze Prisen (mind. 1) und lehnt <= 0 ab', () => {
    expect(roundScaledAmount(0.5, 'pinch')).toBe(1);
    expect(roundScaledAmount(2.6, 'pinch')).toBe(3);
    expect(() => roundScaledAmount(0, 'g')).toThrow(RangeError);
    expect(() => roundScaledAmount(-5, 'g')).toThrow(RangeError);
  });
});

describe('scaleIngredients', () => {
  it('skaliert Ofenlachs korrekt für 1, 2, 4 und 12 Portionen ohne negative Mengen', () => {
    const salmon = getRecipe('oven_salmon');
    expect(salmon).toBeDefined();

    // Grundmenge (2 Portionen) bleibt exakt unverändert
    const base = scaleIngredients(salmon!, 2);
    expect(base.find((i) => i.food === 'potato')?.scaledAmount).toBe(500);
    expect(base.find((i) => i.food === 'lemon')?.scaledAmount).toBe(0.5);
    expect(base.find((i) => i.food === 'salt')?.scaledAmount).toBe(4);

    // 1 Portion (halbieren)
    const one = scaleIngredients(salmon!, 1);
    expect(one.find((i) => i.food === 'potato')?.scaledAmount).toBe(250);
    expect(one.find((i) => i.food === 'olive_oil')?.scaledAmount).toBe(15); // 12.5 -> 15
    expect(one.find((i) => i.food === 'lemon')?.scaledAmount).toBe(0.5); // 0.25 -> min 0.5
    expect(one.find((i) => i.food === 'salt')?.scaledAmount).toBe(2);

    // 4 Portionen (verdoppeln)
    const four = scaleIngredients(salmon!, 4);
    expect(four.find((i) => i.food === 'potato')?.scaledAmount).toBe(1000);
    expect(four.find((i) => i.food === 'salmon')?.scaledAmount).toBe(600);
    expect(four.find((i) => i.food === 'lemon')?.scaledAmount).toBe(1);

    // Alle Portionszahlen 1–12 liefern strikt positive Mengen
    for (let s = 1; s <= 12; s += 1) {
      const scaled = scaleIngredients(salmon!, s);
      for (const item of scaled) {
        expect(item.scaledAmount).toBeGreaterThan(0);
        expect(item.scaledGrams).toBeGreaterThan(0);
      }
    }
  });

  it('lehnt ungültige Portionszahlen ausserhalb 1–12 ab', () => {
    const salmon = getRecipe('oven_salmon')!;
    expect(() => scaleIngredients(salmon, 0)).toThrow(RangeError);
    expect(() => scaleIngredients(salmon, -2)).toThrow(RangeError);
    expect(() => scaleIngredients(salmon, 13)).toThrow(RangeError);
    expect(() => scaleIngredients(salmon, 2.5)).toThrow(RangeError);
  });
});
