import { describe, expect, it } from '@rstest/core';
import { getRecipe, listRecipes } from '../catalog/index.ts';
import { NUTRIENT_KEYS } from '../domain/index.ts';
import { nutrientsForServings, nutrientsPerServing } from './sum.ts';

describe('nutrientsPerServing', () => {
  it('stimmt für alle 200 Rezepte mit den geprüften Rezept-Nährwerten überein (±2 %)', () => {
    const recipes = listRecipes();
    expect(recipes.length).toBe(200);

    for (const recipe of recipes) {
      const computed = nutrientsPerServing(recipe);
      for (const key of NUTRIENT_KEYS) {
        const expected = recipe.nutritionPerServing.values[key];
        const actual = computed.values[key];
        const tolerance = Math.max(key === 'kcal' ? 1 : 0.1, expected * 0.02);
        expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
      }
      expect(computed.isMinimum).toBe(recipe.nutritionPerServing.isMinimum);
      expect(computed.notIncluded).toEqual(
        recipe.nutritionPerServing.notIncluded,
      );
      expect(computed.proxies).toEqual(recipe.nutritionPerServing.proxies);
    }
  });

  it('rechnet Birchermüesli (vollständige CH-NWD-Werte) ohne fehlende Zutaten exakt nach', () => {
    const muesli = getRecipe('birchermuesli')!;
    const sum = nutrientsPerServing(muesli);
    expect(sum.isMinimum).toBe(false);
    expect(sum.notIncluded).toEqual([]);
    expect(sum.proxies).toEqual([]);
    expect(sum.values.kcal).toBe(443);
    expect(sum.values.protein).toBe(14.4);
    expect(sum.values.fiber).toBe(7.9);
  });

  it('klammert abgesiebte Zutaten bei Pho aus und markiert fehlende/Näherungswerte', () => {
    const pho = getRecipe('pho')!;
    const sum = nutrientsPerServing(pho);
    expect(sum.isMinimum).toBe(true);
    expect(sum.proxies).toEqual(['rice_noodles', 'thai_basil']);
    expect(sum.notIncluded).toContain('fish_sauce');
    expect(sum.notIncluded).not.toContain('star_anise'); // abgesiebt -> zählt nicht
    expect(sum.notIncluded).not.toContain('cloves'); // abgesiebt -> zählt nicht
    expect(sum.values.kcal).toBe(452);
    expect(sum.values.salt).toBe(5.7);
  });

  it('skaliert Nährwerte für mehrere Portionen über nutrientsForServings', () => {
    const salmon = getRecipe('oven_salmon')!;
    const two = nutrientsForServings(salmon, 2);
    expect(two.kcal).toBe(1442);
    expect(two.protein).toBe(84.6);
    expect(() => nutrientsForServings(salmon, 0)).toThrow(RangeError);
  });
});
