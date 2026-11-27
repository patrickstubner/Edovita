import { describe, expect, it } from '@rstest/core';
import {
  CUISINES,
  PREFERENCE_TAGS,
  asCuisineId,
  asRecipeId,
  type Recipe,
} from '../domain/index.ts';
import {
  getRecipe,
  getRecipeText,
  getRecipeTitle,
  listRecipes,
  rankRecipes,
} from './recipes.ts';

describe('catalog/recipes', () => {
  it('lädt alle 200 Rezepte, alle 23 Küchen sowie Titel in allen 7 Sprachen und DE/EN-Schritte (E12)', () => {
    const all = listRecipes();
    expect(all.length).toBe(200);
    expect(getRecipe('oven_salmon')?.servings).toBe(2);
    expect(getRecipeText('oven_salmon', 'de')?.title).toContain('Ofenlachs');
    expect(getRecipeText('oven_salmon', 'en')?.title).toContain('salmon');
    expect(getRecipeText('skyr_berry_bowl', 'de')?.steps.length).toBeGreaterThanOrEqual(3);
    expect(getRecipeText('skyr_berry_bowl', 'en')?.steps.length).toBeGreaterThanOrEqual(3);
    expect(getRecipeText('unbekannt', 'de')).toBeUndefined();

    // Alle 23 Küchen im Katalog vertreten
    const seenCuisines = new Set(all.map((r) => r.cuisine as string));
    for (const c of CUISINES) {
      expect(seenCuisines.has(c)).toBe(true);
    }

    // Titel in allen 7 Sprachen abrufbar, kein EN-Fallback bei fehlender Sprache
    for (const lang of ['de', 'en', 'fr', 'it', 'es', 'pt', 'ja']) {
      expect(getRecipeTitle('oven_salmon', lang)).toBeTruthy();
      expect(getRecipeTitle('skyr_berry_bowl', lang)).toBeTruthy();
    }
    expect(getRecipeTitle('oven_salmon', 'ar')).toBeUndefined();
    expect(getRecipeTitle('unbekannt', 'de')).toBeUndefined();
  });

  it('filtert nach Mahlzeit, schnell (<= 15 min), proteinreich (>= 30 g), gemerkt, Vorlieben-Chips und Ernährungsprofil', () => {
    const breakfasts = listRecipes({ meal: 'breakfast' });
    expect(breakfasts.length).toBeGreaterThan(10);
    expect(breakfasts.every((r) => r.meal === 'breakfast')).toBe(true);
    expect(breakfasts.some((r) => r.id === 'birchermuesli')).toBe(true);

    const fast = listRecipes({ fast: true });
    expect(fast.length).toBeGreaterThan(10);
    expect(fast.every((r) => r.minutes <= 15)).toBe(true);

    const protein = listRecipes({ protein: true });
    expect(protein.length).toBeGreaterThan(20);
    expect(protein.every((r) => r.nutritionPerServing.values.protein >= 30)).toBe(
      true,
    );

    expect(
      listRecipes({ savedOnly: true, savedIds: new Set(['lentil_curry']) }).map(
        (r) => r.id,
      ),
    ).toEqual(['lentil_curry']);

    const vegan = listRecipes({ prefs: { vegan: true } });
    expect(vegan.length).toBeGreaterThan(0);
    expect(vegan.some((r) => r.id === 'lentil_curry')).toBe(true);
    expect(vegan.some((r) => r.id === 'oven_salmon')).toBe(false);

    // E12 Vorlieben-Ausschluss (4er-Whitelist getrennt von Allergenen)
    for (const pref of PREFERENCE_TAGS) {
      const filtered = listRecipes({ excludePreferences: [pref] });
      expect(filtered.length).toBeLessThan(200);
      expect(
        filtered.every((r) => !(r.preferenceTags ?? []).includes(pref)),
      ).toBe(true);
    }
    const noMeatNoCilantro = listRecipes({
      excludePreferences: ['meat', 'cilantro'],
    });
    expect(noMeatNoCilantro.some((r) => r.id === 'thai_curry')).toBe(false);
    expect(noMeatNoCilantro.some((r) => r.id === 'pho')).toBe(false);
    expect(noMeatNoCilantro.some((r) => r.id === 'birchermuesli')).toBe(true);
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

  it('lehnt Prototype-Schlüssel in getRecipeText, getRecipeTitle und savedIds ab (N2 / Object.hasOwn)', () => {
    expect(getRecipeText('constructor', 'de')).toBeUndefined();
    expect(getRecipeText('__proto__', 'de')).toBeUndefined();
    expect(getRecipeText('toString', 'de')).toBeUndefined();
    expect(getRecipeText('oven_salmon', 'constructor')).toBeUndefined();
    expect(getRecipeText('oven_salmon', '__proto__')).toBeUndefined();
    expect(getRecipeText('constructor', 'toString')).toBeUndefined();
    expect(getRecipeTitle('constructor', 'fr')).toBeUndefined();
    expect(getRecipeTitle('__proto__', 'fr')).toBeUndefined();
    expect(getRecipeTitle('oven_salmon', 'constructor')).toBeUndefined();
    expect(getRecipeTitle('oven_salmon', '__proto__')).toBeUndefined();
    expect(listRecipes({ savedOnly: true, savedIds: {} })).toEqual([]);
  });
});
