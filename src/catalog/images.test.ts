import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { asRecipeId, type RecipeImageAssets } from '../domain/index.ts';
import {
  getRecipe,
  getRecipePhoto,
  hasRecipePhoto,
  listRecipes,
} from './index.ts';

describe('Katalog Rezeptbilder (E8 + Nachtrag v5.11, Issue #33)', () => {
  const MAIN_RECIPE_IDS = [
    'birchermuesli',
    'lentil_curry',
    'oven_salmon',
    'pho',
    'thai_curry',
  ] as const;

  const SAMPLE_PLACEHOLDER_IDS = [
    'mushroom_polenta',
    'rosti_fried_egg',
    'zurich_geschnetzeltes',
  ] as const;

  it('löst Vollbild (800×600) und Miniatur (400×300) für alle 5 Startrezepte über die Whitelist auf', () => {
    for (const id of MAIN_RECIPE_IDS) {
      const recipe = getRecipe(id);
      expect(recipe).toBeDefined();
      expect(hasRecipePhoto(recipe!)).toBe(true);
      expect(hasRecipePhoto(id)).toBe(true);

      const full = getRecipePhoto(recipe!, 'full');
      const thumb = getRecipePhoto(recipe!, 'thumb');
      expect(full).not.toBeNull();
      expect(thumb).not.toBeNull();
      expect(full!.src.length).toBeGreaterThan(0);
      expect(thumb!.src.length).toBeGreaterThan(0);
      expect(full!.width).toBe(800);
      expect(full!.height).toBe(600);
      expect(thumb!.width).toBe(400);
      expect(thumb!.height).toBe(300);
      expect(full!.src).not.toContain('pexels.com');
      expect(thumb!.src).not.toContain('unsplash.com');
    }
  });

  it('löst im v5.11-Katalog genau 177 Rezepte lokal auf und liefert für alle 23 Platzhalter null', () => {
    const all = listRecipes();
    expect(all).toHaveLength(200);

    let withPhoto = 0;
    let withoutPhoto = 0;

    for (const recipe of all) {
      if (hasRecipePhoto(recipe)) {
        withPhoto += 1;
        expect(recipe.image).toBe(recipe.id);
        const full = getRecipePhoto(recipe, 'full');
        const thumb = getRecipePhoto(recipe, 'thumb');
        expect(full).not.toBeNull();
        expect(thumb).not.toBeNull();
        expect(full!.src.length).toBeGreaterThan(0);
        expect(thumb!.src.length).toBeGreaterThan(0);
        expect(
          (full!.width === 800 && full!.height === 600) ||
            (full!.width === 640 && full!.height === 480),
        ).toBe(true);
        expect(thumb!.width).toBe(400);
        expect(thumb!.height).toBe(300);
        expect(full!.src).not.toContain('pexels.com');
        expect(thumb!.src).not.toContain('unsplash.com');
      } else {
        withoutPhoto += 1;
        expect(recipe.image).toBeUndefined();
        expect(getRecipePhoto(recipe, 'full')).toBeNull();
        expect(getRecipePhoto(recipe, 'thumb')).toBeNull();
      }
    }

    expect(withPhoto).toBe(177);
    expect(withoutPhoto).toBe(23);

    for (const phId of SAMPLE_PLACEHOLDER_IDS) {
      expect(hasRecipePhoto(phId)).toBe(false);
      expect(getRecipePhoto(phId, 'full')).toBeNull();
      expect(getRecipePhoto(phId, 'thumb')).toBeNull();
    }
  });

  it('lehnt unbekannte IDs, freie Pfade, URLs und Prototype-Schlüssel ab (Platzhalter-Fall)', () => {
    const unsafe = [
      'nicht_vorhanden',
      '../oven_salmon',
      '/images/oven_salmon.webp',
      'https://images.pexels.com/photos/1/test.webp',
      `${'javascript'}:alert(1)`,
      '__proto__',
      'constructor',
      'toString',
      '',
    ];
    for (const bad of unsafe) {
      expect(hasRecipePhoto(bad)).toBe(false);
      expect(getRecipePhoto(bad, 'full')).toBeNull();
      expect(getRecipePhoto(bad, 'thumb')).toBeNull();
    }

    // Platzhalter-Fall: Rezept ohne Eintrag in einer kleineren Whitelist liefert null
    const emptyMap: Readonly<Record<string, RecipeImageAssets>> = {};
    expect(hasRecipePhoto(asRecipeId('oven_salmon'), emptyMap)).toBe(false);
    expect(getRecipePhoto(asRecipeId('oven_salmon'), 'full', emptyMap)).toBeNull();
  });

  it('bündelt manifest.json (Fotografennamen & Ursprungs-URLs) niemals in catalog-index.ts', () => {
    const repoRoot = resolve(import.meta.dirname, '../..');
    const generated = readFileSync(
      resolve(repoRoot, 'content/generated/catalog-index.ts'),
      'utf8',
    );
    expect(generated).not.toContain('manifest.json');
    expect(generated).not.toContain('pexels.com');
    expect(generated).not.toContain('photographer');
  });
});
