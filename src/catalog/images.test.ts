import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { asRecipeId, type RecipeImageAssets } from '../domain/index.ts';
import { getRecipe, getRecipePhoto, hasRecipePhoto } from './index.ts';

describe('Katalog Rezeptbilder (E8, Issue #33)', () => {
  const MAIN_RECIPE_IDS = [
    'birchermuesli',
    'lentil_curry',
    'oven_salmon',
    'pho',
    'thai_curry',
  ] as const;

  it('löst Vollbild (800×600) und Miniatur (400×300) für alle 5 Rezepte über die Whitelist auf', () => {
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
