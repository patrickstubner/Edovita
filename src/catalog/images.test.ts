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

describe('Katalog Rezeptbilder (E8 + Nachtrag v5.11 + E14, Issues #33 & #41)', () => {
  const MAIN_RECIPE_IDS = [
    'birchermuesli',
    'lentil_curry',
    'oven_salmon',
    'pho',
    'thai_curry',
  ] as const;

  const SAMPLE_E14_IDS = [
    'aji_de_gallina_light',
    'mushroom_polenta',
    'rosti_fried_egg',
    'swiss_cottage_radish_bread',
    'teriyaki_tofu',
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

  it('löst im vollständigen Katalog alle 200 Rezepte (inkl. der 23 E14-Rezepte) lokal auf', () => {
    const all = listRecipes();
    expect(all).toHaveLength(200);

    let withPhoto = 0;

    for (const recipe of all) {
      expect(hasRecipePhoto(recipe)).toBe(true);
      expect(recipe.image).toBe(recipe.id);
      withPhoto += 1;
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
    }

    expect(withPhoto).toBe(200);

    for (const e14Id of SAMPLE_E14_IDS) {
      expect(hasRecipePhoto(e14Id)).toBe(true);
      const full = getRecipePhoto(e14Id, 'full');
      const thumb = getRecipePhoto(e14Id, 'thumb');
      expect(full).not.toBeNull();
      expect(thumb).not.toBeNull();
      expect(full!.width).toBe(640);
      expect(full!.height).toBe(480);
      expect(thumb!.width).toBe(400);
      expect(thumb!.height).toBe(300);
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
