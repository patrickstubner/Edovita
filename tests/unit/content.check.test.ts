import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  EXPECTED_GLOSSARY_LANGS,
  EXPECTED_RECIPE_UI_LANGS,
  validateContentBundle,
  type RawContentBundle,
} from '../../src/domain/index.ts';

const ROOT = resolve(import.meta.dirname, '../..');
const CONTENT_DIR = resolve(ROOT, 'content');
const SOURCE_XLSX = resolve(
  ROOT,
  'docs/architektur/inhalte/quelle/Schweizer_Nahrwertdatenbank_V7.1.xlsx',
);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadRawContentBundle(): RawContentBundle {
  const foodsFile = readJson(resolve(CONTENT_DIR, 'foods/foods.json'));

  const glossaries: Record<string, unknown> = {};
  for (const lang of EXPECTED_GLOSSARY_LANGS) {
    const p = resolve(CONTENT_DIR, `foods/glossary/${lang}.json`);
    if (existsSync(p)) {
      glossaries[lang] = readJson(p);
    }
  }

  const recipesDir = resolve(CONTENT_DIR, 'recipes');
  const recipeFolders = readdirSync(recipesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const recipes = recipeFolders.map((folderName) => {
    const rDir = resolve(recipesDir, folderName);
    const locales: Record<string, unknown> = {};
    for (const lang of EXPECTED_RECIPE_UI_LANGS) {
      const lp = resolve(rDir, `${lang}.json`);
      if (existsSync(lp)) {
        locales[lang] = readJson(lp);
      }
    }
    return {
      folderName,
      recipe: readJson(resolve(rDir, 'recipe.json')),
      locales,
    };
  });

  return { foodsFile, glossaries, recipes };
}

function cloneBundle(bundle: RawContentBundle): RawContentBundle {
  return structuredClone(bundle);
}

describe('Inhaltsprüfung content/ (Port von validate.py, ADR-005 & ADR-006)', () => {
  it('prüft alle 55 Lebensmittel, 4 Glossare und 5 Rezepte fehlerfrei inklusive xlsx-SHA-256', () => {
    const bundle = loadRawContentBundle();
    const report = validateContentBundle(bundle);

    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.validated).not.toBeNull();
    expect(report.validated!.catalog.foods.length).toBe(55);
    expect(report.validated!.recipes.length).toBe(5);

    // SHA-256 der archivierten Schweizer Nährwertdatenbank V7.1 verifizieren
    expect(existsSync(SOURCE_XLSX)).toBe(true);
    const actualSha = createHash('sha256')
      .update(readFileSync(SOURCE_XLSX))
      .digest('hex');
    expect(actualSha).toBe(report.validated!.catalog.source.sha256);
  });

  it('Negativtest: unbekannte FoodId in einem Rezept bricht content:check', () => {
    const broken = cloneBundle(loadRawContentBundle());
    const firstRecipe = broken.recipes[0]!.recipe as {
      ingredients: Array<{ food: string }>;
    };
    firstRecipe.ingredients[0]!.food = 'unbekannte_zutat_xyz';

    const report = validateContentBundle(broken);
    expect(report.ok).toBe(false);
    expect(
      report.errors.some((e) => e.includes('unbekannte_zutat_xyz')),
    ).toBe(true);
  });

  it('Negativtest: Rezept mit nur 1 Quelle bricht content:check', () => {
    const broken = cloneBundle(loadRawContentBundle());
    const firstRecipe = broken.recipes[0]!.recipe as {
      review: { sources: string[] };
    };
    firstRecipe.review.sources = ['https://example.org/only-one'];

    const report = validateContentBundle(broken);
    expect(report.ok).toBe(false);
    expect(
      report.errors.some((e) => e.includes('review.sources')),
    ).toBe(true);
  });

  it('Negativtest: falscher kcal-Wert oder manipulierte Allergene brechen content:check', () => {
    const brokenKcal = cloneBundle(loadRawContentBundle());
    const firstRecipe = brokenKcal.recipes[0]!.recipe as {
      nutritionPerServing: { values: { kcal: number } };
    };
    firstRecipe.nutritionPerServing.values.kcal = 999;

    const kcalReport = validateContentBundle(brokenKcal);
    expect(kcalReport.ok).toBe(false);
    expect(
      kcalReport.errors.some((e) => e.includes('nutritionPerServing.kcal')),
    ).toBe(true);

    const brokenAllergens = cloneBundle(loadRawContentBundle());
    const r = brokenAllergens.recipes[0]!.recipe as { allergens: string[] };
    r.allergens = [];

    const algReport = validateContentBundle(brokenAllergens);
    expect(algReport.ok).toBe(false);
    expect(
      algReport.errors.some((e) => e.includes('Allergene nicht aus Katalog abgeleitet')),
    ).toBe(true);
  });

  it('Negativtest: HTML-Zeichen oder fehlender Glossareintrag brechen content:check', () => {
    const brokenHtml = cloneBundle(loadRawContentBundle());
    (brokenHtml.glossaries.de as Record<string, string>).broccoli =
      '<script>alert(1)</script>';

    const htmlReport = validateContentBundle(brokenHtml);
    expect(htmlReport.ok).toBe(false);
    expect(
      htmlReport.errors.some((e) => e.includes('Glossar de')),
    ).toBe(true);

    const brokenMissing = cloneBundle(loadRawContentBundle());
    delete (brokenMissing.glossaries.ja as Record<string, string>).broccoli;

    const missReport = validateContentBundle(brokenMissing);
    expect(missReport.ok).toBe(false);
    expect(
      missReport.errors.some((e) => e.includes('Glossar ja: broccoli fehlt')),
    ).toBe(true);
  });
});
