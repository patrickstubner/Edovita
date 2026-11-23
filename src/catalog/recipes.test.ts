import { describe, expect, it } from '@rstest/core';
import { asCuisineId, asRecipeId, type Recipe } from '../domain/index.ts';
import {
  getRecipe,
  getRecipeText,
  listRecipes,
  rankRecipes,
} from './recipes.ts';

describe('catalog/recipes', () => {
  it('lädt alle 5 Startrezepte samt DE- und EN-Texten', () => {
    const all = listRecipes();
    expect(all.length).toBe(5);
    expect(getRecipe('oven_salmon')?.servings).toBe(2);
    expect(getRecipeText('oven_salmon', 'de')?.title).toContain('Ofenlachs');
    expect(getRecipeText('oven_salmon', 'en')?.title).toContain('salmon');
    expect(getRecipeText('unbekannt', 'de')).toBeUndefined();
  });

  it('filtert nach Mahlzeit, schnell (<= 15 min), proteinreich (>= 30 g), gemerkt und Vorlieben', () => {
    expect(listRecipes({ meal: 'breakfast' }).map((r) => r.id)).toEqual([
      'birchermuesli',
    ]);
    expect(listRecipes({ fast: true }).map((r) => r.id)).toEqual([
      'birchermuesli',
    ]);
    expect(listRecipes({ protein: true }).map((r) => r.id)).toEqual([
      'oven_salmon',
      'pho',
      'thai_curry',
    ]);
    expect(
      listRecipes({ savedOnly: true, savedIds: new Set(['lentil_curry']) }).map(
        (r) => r.id,
      ),
    ).toEqual(['lentil_curry']);
    // Vegan schliesst Fleisch, Fisch und Milchprodukte aus -> nur Linsen-Curry bleibt
    expect(listRecipes({ prefs: { vegan: true } }).map((r) => r.id)).toEqual([
      'lentil_curry',
    ]);
  });

  it('rankRecipes berücksichtigt Sterne, Merkliste und Küchen-Vielfalt', () => {
    const base = getRecipe('oven_salmon')!;
    const mk = (id: string, cuisine: string): Recipe => ({
      ...base,
      id: asRecipeId(id),
      cuisine: asCuisineId(cuisine),
    });

    const list = [
      mk('thai_a', 'thai'),
      mk('thai_b', 'thai'),
      mk('swiss_a', 'swiss'),
    ];

    // thai_a (5 Sterne) und thai_b (4 Sterne) stehen punktemässig vor swiss_a (unbewertet),
    // aber Vielfalt verhindert zwei Thai-Gerichte direkt hintereinander.
    const ranked = rankRecipes(
      list,
      { thai_a: 5, thai_b: 4 },
      { swiss_a: false },
    );
    expect(ranked.map((r) => r.id)).toEqual(['thai_a', 'swiss_a', 'thai_b']);

    // Merkliste hebt unbewertetes Rezept vor anderes unbewertetes derselben Popularität
    const withSaved = rankRecipes(
      [mk('a_eu', 'european'), mk('b_ind', 'indian')],
      {},
      { b_ind: true },
    );
    expect(withSaved[0]?.id).toBe('b_ind');
  });

  it('lehnt Prototype-Schlüssel in getRecipeText und savedIds ab (N2 / Object.hasOwn)', () => {
    expect(getRecipeText('constructor', 'de')).toBeUndefined();
    expect(getRecipeText('__proto__', 'de')).toBeUndefined();
    expect(getRecipeText('toString', 'de')).toBeUndefined();
    expect(getRecipeText('oven_salmon', 'constructor')).toBeUndefined();
    expect(getRecipeText('oven_salmon', '__proto__')).toBeUndefined();
    expect(getRecipeText('constructor', 'toString')).toBeUndefined();
    expect(listRecipes({ savedOnly: true, savedIds: {} })).toEqual([]);
  });
});
