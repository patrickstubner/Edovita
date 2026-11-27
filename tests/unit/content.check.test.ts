import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  EXPECTED_GLOSSARY_LANGS,
  EXPECTED_RECIPE_TITLE_LANGS,
  EXPECTED_RECIPE_UI_LANGS,
  PREFERENCE_TAGS,
  RECIPE_IMAGE_BUDGET_BYTES,
  recipeSchema,
  validateContentBundle,
  validateRecipeImages,
  type RawContentBundle,
  type RawRecipeImagesBundle,
} from '../../src/domain/index.ts';

const ROOT = resolve(import.meta.dirname, '../..');
const CONTENT_DIR = resolve(ROOT, 'content');
const IMAGES_DIR = resolve(CONTENT_DIR, 'images/recipes');
const SOURCE_XLSX = resolve(
  ROOT,
  'docs/architektur/inhalte/quelle/Schweizer_Nahrwertdatenbank_V7.1.xlsx',
);

const ORIGINAL_5_RECIPES = [
  'birchermuesli',
  'lentil_curry',
  'oven_salmon',
  'pho',
  'thai_curry',
] as const;

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

  const recipeTitles: Record<string, unknown> = {};
  for (const lang of EXPECTED_RECIPE_TITLE_LANGS) {
    const p = resolve(CONTENT_DIR, `locales/${lang}/recipes.json`);
    if (existsSync(p)) {
      recipeTitles[lang] = readJson(p);
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

  return { foodsFile, glossaries, recipes, recipeTitles };
}

function cloneBundle(bundle: RawContentBundle): RawContentBundle {
  return structuredClone(bundle);
}

describe('Inhaltsprüfung content/ (Port von validate.py, ADR-005, ADR-006 & E12)', () => {
  it('prüft alle 199 Lebensmittel, 7 Glossare, 200 Rezepte (DE/EN Schritte + 7 Titel-Sprachen) fehlerfrei inklusive xlsx-SHA-256', () => {
    const bundle = loadRawContentBundle();
    const report = validateContentBundle(bundle);

    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.validated).not.toBeNull();
    expect(report.validated!.catalog.foods.length).toBe(199);
    expect(report.validated!.recipes.length).toBe(200);
    expect(Object.keys(report.validated!.glossaries).sort()).toEqual([
      'de',
      'en',
      'es',
      'fr',
      'it',
      'ja',
      'pt',
    ]);
    expect(Object.keys(report.validated!.recipeTitles ?? {}).sort()).toEqual([
      'de',
      'en',
      'es',
      'fr',
      'it',
      'ja',
      'pt',
    ]);

    // Alle 200 Rezepte tragen gültige preferenceTags aus der 4er-Whitelist; 195 neue Rezepte haben >= 3 Schritte
    const originalSet = new Set<string>(ORIGINAL_5_RECIPES);
    const prefSet = new Set<string>(PREFERENCE_TAGS);
    for (const entry of report.validated!.recipes) {
      expect(Array.isArray(entry.recipe.preferenceTags)).toBe(true);
      for (const p of entry.recipe.preferenceTags ?? []) {
        expect(prefSet.has(p)).toBe(true);
      }
      if (!originalSet.has(entry.recipe.id)) {
        expect(entry.recipe.steps).toBeGreaterThanOrEqual(3);
      }
    }

    // Bestehende 5 Rezepte behalten ihre CH-NWD-Basis
    const byId = new Map(
      report.validated!.recipes.map((entry) => [entry.recipe.id as string, entry]),
    );
    expect(byId.get('oven_salmon')?.recipe.nutritionPerServing.values.kcal).toBe(721);
    expect(byId.get('birchermuesli')?.recipe.nutritionPerServing.values.kcal).toBe(443);
    expect(byId.get('lentil_curry')?.recipe.nutritionPerServing.values.kcal).toBe(582);
    expect(byId.get('pho')?.recipe.nutritionPerServing.values.kcal).toBe(452);
    expect(byId.get('thai_curry')?.recipe.nutritionPerServing.values.kcal).toBe(800);

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
    const salmonEntry = brokenAllergens.recipes.find(
      (entry) => entry.folderName === 'oven_salmon',
    )!;
    (salmonEntry.recipe as { allergens: string[] }).allergens = [];

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
    delete (brokenMissing.glossaries.fr as Record<string, string>).broccoli;

    const missReport = validateContentBundle(brokenMissing);
    expect(missReport.ok).toBe(false);
    expect(
      missReport.errors.some((e) => e.includes('Glossar fr: broccoli fehlt')),
    ).toBe(true);
  });

  it('Negativtest (N1 + F3b): review.sources lehnt javascript:, data:, http:, file: und Userinfo-URLs ab', () => {
    const unsafeUrls = [
      `${'javascript'}:alert(1)`,
      'data:text/html,<script>alert(1)</script>',
      'http://example.org/rezept',
      'file:///etc/passwd',
      'https://user:pw@example.org/rezept',
      'https://user@example.org/rezept',
    ];

    for (const badUrl of unsafeUrls) {
      const broken = cloneBundle(loadRawContentBundle());
      const firstRecipe = broken.recipes[0]!.recipe as {
        review: { sources: string[] };
      };
      firstRecipe.review.sources = [
        'https://example.org/valid-source',
        badUrl,
      ];

      const report = validateContentBundle(broken);
      expect(report.ok).toBe(false);
      expect(
        report.errors.some((e) => e.includes('review.sources')),
      ).toBe(true);
    }
  });

  it('E12 Negativtests: fehlende Schritte/Sprache, abweichende Schrittzahl, falsche Dichte/Gramm, unbekannte Küche, ungültige ID, preferenceTags und Prototype-Schlüssel brechen content:check', () => {
    const base = loadRawContentBundle();

    // 1) Fehlende Sprache (en)
    const missingLang = cloneBundle(base);
    delete missingLang.recipes[0]!.locales.en;
    const missingLangReport = validateContentBundle(missingLang);
    expect(missingLangReport.ok).toBe(false);
    expect(
      missingLangReport.errors.some((e) => e.includes('Übersetzungsdatei fehlt')),
    ).toBe(true);

    // 2) Abweichende Schrittzahl
    const wrongSteps = cloneBundle(base);
    (wrongSteps.recipes[0]!.locales.de as { steps: string[] }).steps.pop();
    const wrongStepsReport = validateContentBundle(wrongSteps);
    expect(wrongStepsReport.ok).toBe(false);
    expect(
      wrongStepsReport.errors.some((e) => e.includes('Schrittzahl')),
    ).toBe(true);

    // 3) Falsche Dichte / Gramm (unit=g und unit=ml)
    const wrongGrams = cloneBundle(base);
    const gEntry = wrongGrams.recipes.find((r) =>
      (r.recipe as { ingredients: Array<{ unit: string }> }).ingredients.some(
        (i) => i.unit === 'g',
      ),
    )!;
    const gIng = (
      gEntry.recipe as { ingredients: Array<{ unit: string; grams: number }> }
    ).ingredients.find((i) => i.unit === 'g')!;
    gIng.grams += 50;
    const wrongGramsReport = validateContentBundle(wrongGrams);
    expect(wrongGramsReport.ok).toBe(false);
    expect(
      wrongGramsReport.errors.some((e) => e.includes('unit=g aber grams')),
    ).toBe(true);

    const wrongMl = cloneBundle(base);
    const mlEntry = wrongMl.recipes.find((r) =>
      (r.recipe as { ingredients: Array<{ unit: string }> }).ingredients.some(
        (i) => i.unit === 'ml',
      ),
    )!;
    const mlIng = (
      mlEntry.recipe as { ingredients: Array<{ unit: string; grams: number }> }
    ).ingredients.find((i) => i.unit === 'ml')!;
    mlIng.grams += 50;
    const wrongMlReport = validateContentBundle(wrongMl);
    expect(wrongMlReport.ok).toBe(false);
    expect(
      wrongMlReport.errors.some((e) => e.includes('ml × Dichte weicht von grams ab')),
    ).toBe(true);

    // 4) Unbekannte Küche, ungültige ID und unzulässige preferenceTags
    const badMeta = cloneBundle(base);
    (badMeta.recipes[0]!.recipe as { cuisine: string }).cuisine = 'atlantis';
    (badMeta.recipes[1]!.recipe as { id: string }).id = 'Invalid-ID!';
    (badMeta.recipes[2]!.recipe as { preferenceTags: string[] }).preferenceTags = [
      'fish',
    ];
    const badMetaReport = validateContentBundle(badMeta);
    expect(badMetaReport.ok).toBe(false);
    expect(badMetaReport.errors.some((e) => e.includes('cuisine'))).toBe(true);
    expect(badMetaReport.errors.some((e) => e.includes('Ungültiges RecipeId'))).toBe(
      true,
    );
    expect(badMetaReport.errors.some((e) => e.includes('preferenceTags'))).toBe(
      true,
    );

    // 5) Fehlender Titel in einer der 7 Titel-Sprachen
    const missingTitle = cloneBundle(base);
    delete (missingTitle.recipeTitles!.pt as Record<string, string>).oven_salmon;
    const missingTitleReport = validateContentBundle(missingTitle);
    expect(missingTitleReport.ok).toBe(false);
    expect(
      missingTitleReport.errors.some((e) =>
        e.includes('Rezepttitel pt: oven_salmon fehlt'),
      ),
    ).toBe(true);

    // 6) Prototype-Pollution-Schlüssel (`__proto__`)
    const protoBundle = cloneBundle(base);
    protoBundle.recipes[0]!.recipe = JSON.parse(
      `{"__proto__":{"polluted":true},${JSON.stringify(protoBundle.recipes[0]!.recipe).slice(1)}`,
    );
    const protoReport = validateContentBundle(protoBundle);
    expect(protoReport.ok).toBe(false);
    expect(
      protoReport.errors.some((e) =>
        e.includes('reservierter Prototype-Schlüssel'),
      ),
    ).toBe(true);
  });

  function loadRawRecipeImagesBundle(): RawRecipeImagesBundle {
    const contentReport = validateContentBundle(loadRawContentBundle());
    const recipes = contentReport.validated!.recipes;
    const knownRecipeIds = recipes.map((r) => r.recipe.id);
    const recipeImageFields: Record<string, string | undefined> = {};
    for (const r of recipes) {
      recipeImageFields[r.recipe.id] = r.recipe.image;
    }
    const manifest = readJson(resolve(IMAGES_DIR, 'manifest.json'));
    const files: Record<string, Uint8Array> = {};
    for (const name of readdirSync(IMAGES_DIR)) {
      if (name === 'manifest.json') continue;
      files[name] = new Uint8Array(readFileSync(resolve(IMAGES_DIR, name)));
    }
    return { manifest, files, knownRecipeIds, recipeImageFields };
  }

  function appendSyntheticExifChunk(webpBytes: Uint8Array): Uint8Array {
    const exifPayload = new TextEncoder().encode('Exif\0\0GPSInfo');
    const pad = exifPayload.length % 2;
    const chunkTotal = 8 + exifPayload.length + pad;
    const out = new Uint8Array(webpBytes.length + chunkTotal);
    out.set(webpBytes, 0);
    // RIFF-Gesamtgrösse (Bytes 4..7, little-endian) erhöhen
    const dv = new DataView(out.buffer);
    dv.setUint32(4, out.length - 8, true);
    const offset = webpBytes.length;
    out[offset] = 0x45; // E
    out[offset + 1] = 0x58; // X
    out[offset + 2] = 0x49; // I
    out[offset + 3] = 0x46; // F
    dv.setUint32(offset + 4, exifPayload.length, true);
    out.set(exifPayload, offset + 8);
    return out;
  }

  it('E8: prüft alle 10 WebP-Rezeptbilder gegen Manifest, Lizenz (Pexels/Unsplash), Budget und 0 EXIF/GPS', () => {
    const bundle = loadRawRecipeImagesBundle();
    const report = validateRecipeImages(bundle);

    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.validated).not.toBeNull();
    expect(report.validated!.images).toHaveLength(5);
    expect(report.totalBytes).toBe(406_802);
    expect(report.totalBytes).toBeLessThanOrEqual(RECIPE_IMAGE_BUDGET_BYTES);
  });

  it('E8 Negativtests: Bild ohne Manifest, falsche Lizenz, unbekannte Rezept-ID, EXIF/GPS und freie Bildpfade brechen content:check', () => {
    // 1) Bild ohne Manifest-Eintrag
    const extraFileBundle = loadRawRecipeImagesBundle();
    const withExtraFile: RawRecipeImagesBundle = {
      ...extraFileBundle,
      files: {
        ...extraFileBundle.files,
        'unregistriert.webp': extraFileBundle.files['oven_salmon.webp']!,
      },
    };
    const extraReport = validateRecipeImages(withExtraFile);
    expect(extraReport.ok).toBe(false);
    expect(
      extraReport.errors.some((e) => e.includes('ohne Eintrag in manifest.json')),
    ).toBe(true);

    // 2) Falsche Lizenz (CC-BY / Wikimedia abgelehnt)
    const badLicenseBundle = loadRawRecipeImagesBundle();
    const badLicenseManifest = structuredClone(badLicenseBundle.manifest) as {
      images: Array<{ license: string }>;
    };
    badLicenseManifest.images[0]!.license = 'CC-BY 4.0';
    const licenseReport = validateRecipeImages({
      ...badLicenseBundle,
      manifest: badLicenseManifest,
    });
    expect(licenseReport.ok).toBe(false);
    expect(
      licenseReport.errors.some((e) => e.includes('license')),
    ).toBe(true);

    // 3) Unbekannte Rezept-ID im Manifest
    const unknownIdBundle = loadRawRecipeImagesBundle();
    const unknownIdManifest = structuredClone(unknownIdBundle.manifest) as {
      images: Array<{
        recipeId: string;
        files: { full: string; thumb: string };
      }>;
    };
    unknownIdManifest.images[0]!.recipeId = 'nicht_im_katalog';
    unknownIdManifest.images[0]!.files = {
      full: 'nicht_im_katalog.webp',
      thumb: 'nicht_im_katalog-thumb.webp',
    };
    const unknownReport = validateRecipeImages({
      ...unknownIdBundle,
      manifest: unknownIdManifest,
    });
    expect(unknownReport.ok).toBe(false);
    expect(
      unknownReport.errors.some((e) => e.includes('unbekannte Rezept-ID')),
    ).toBe(true);

    // 4) EXIF/GPS-Chunk im WebP
    const exifBundle = loadRawRecipeImagesBundle();
    const withExifBytes = appendSyntheticExifChunk(
      exifBundle.files['oven_salmon.webp']!,
    );
    const exifManifest = structuredClone(exifBundle.manifest) as {
      images: Array<{ recipeId: string; bytes: { full: number } }>;
    };
    const salmonEntry = exifManifest.images.find(
      (i) => i.recipeId === 'oven_salmon',
    )!;
    salmonEntry.bytes.full = withExifBytes.length;
    const exifReport = validateRecipeImages({
      ...exifBundle,
      manifest: exifManifest,
      files: {
        ...exifBundle.files,
        'oven_salmon.webp': withExifBytes,
      },
    });
    expect(exifReport.ok).toBe(false);
    expect(
      exifReport.errors.some((e) => e.includes('EXIF/XMP/GPS')),
    ).toBe(true);

    // 5) Rezept-Schema lehnt freie Bildpfade und URLs strikt ab
    const validRecipe = loadRawContentBundle().recipes[0]!.recipe as Record<
      string,
      unknown
    >;
    for (const badPath of [
      '../oven_salmon.webp',
      '/images/oven_salmon.webp',
      'https://images.pexels.com/photos/1/a.webp',
      'oven_salmon.webp',
    ]) {
      const parsed = recipeSchema.safeParse({ ...validRecipe, image: badPath });
      expect(parsed.success).toBe(false);
    }
  });
});
