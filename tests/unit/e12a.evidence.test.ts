import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { describe, expect, it } from '@rstest/core';
import {
  NUTRIENT_KEYS,
  UNSAFE_TEXT_RE,
  foodCatalogFileSchema,
  foodSchema,
  isSafeHttpsUrl,
  recipeSchema,
  validateContentBundle,
  type FoodCatalogFile,
  type Nutrients,
  type RawContentBundle,
  type Recipe,
} from '../../src/domain/index.ts';

const ROOT = resolve(import.meta.dirname, '../..');
const CONTENT_DIR = resolve(ROOT, 'content');
const E12A_DIR = resolve(ROOT, 'docs/architektur/inhalte/e12a');
const SOURCE_XLSX = resolve(
  ROOT,
  'docs/architektur/inhalte/quelle/Schweizer_Nahrwertdatenbank_V7.1.xlsx',
);

interface E12aRecipesFile {
  format: 1;
  basis: string;
  prototypeRef: string;
  recipes: Recipe[];
}

interface NwdXlsxRow {
  id: number;
  name: string;
  density: number | null;
  per100g: Record<keyof Nutrients, number | null>;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/**
 * Minimale reine Node-ZIP-Auslesung für die archivierte CH-NWD-V7.1-xlsx
 * (keine zusätzliche Abhängigkeit; prüft die Original-Zellen direkt gegen foods-ext.json).
 */
function readZipEntry(zipBytes: Buffer, entryName: string): string {
  // End of Central Directory (EOCD) rückwärts suchen
  let eocdOffset = -1;
  for (let i = zipBytes.length - 22; i >= Math.max(0, zipBytes.length - 65558); i -= 1) {
    if (zipBytes.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new Error('Ungültige ZIP-Datei (EOCD fehlt).');
  }

  const cdCount = zipBytes.readUInt16LE(eocdOffset + 10);
  let cdOffset = zipBytes.readUInt32LE(eocdOffset + 16);

  for (let i = 0; i < cdCount; i += 1) {
    if (zipBytes.readUInt32LE(cdOffset) !== 0x02014b50) {
      throw new Error('Ungültiger Central-Directory-Header.');
    }
    const method = zipBytes.readUInt16LE(cdOffset + 10);
    const compSize = zipBytes.readUInt32LE(cdOffset + 20);
    const nameLen = zipBytes.readUInt16LE(cdOffset + 28);
    const extraLen = zipBytes.readUInt16LE(cdOffset + 30);
    const commentLen = zipBytes.readUInt16LE(cdOffset + 32);
    const localHeaderOffset = zipBytes.readUInt32LE(cdOffset + 42);
    const name = zipBytes.toString('utf8', cdOffset + 46, cdOffset + 46 + nameLen);

    if (name === entryName) {
      const localNameLen = zipBytes.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = zipBytes.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const compressed = zipBytes.subarray(dataStart, dataStart + compSize);
      const raw = method === 0 ? compressed : inflateRawSync(compressed);
      return raw.toString('utf8');
    }
    cdOffset += 46 + nameLen + extraLen + commentLen;
  }

  throw new Error(`ZIP-Eintrag fehlt: ${entryName}`);
}

function decodeXmlEntities(raw: string): string {
  return raw
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function colRefToIndex(ref: string): number {
  const letters = ref.replaceAll(/\d+/g, '');
  let idx = 0;
  for (let i = 0; i < letters.length; i += 1) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

function loadChNwdV71Rows(): Map<number, NwdXlsxRow> {
  const zipBytes = readFileSync(SOURCE_XLSX);
  const sharedStringsXml = readZipEntry(zipBytes, 'xl/sharedStrings.xml');
  const sharedStrings: string[] = [];
  for (const siMatch of sharedStringsXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    const inner = siMatch[1] ?? '';
    let text = '';
    for (const tMatch of inner.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) {
      text += decodeXmlEntities(tMatch[1] ?? '');
    }
    sharedStrings.push(text);
  }

  const sheetXml = readZipEntry(zipBytes, 'xl/worksheets/sheet1.xml');
  const rows: Array<Record<number, string>> = [];
  for (const rowMatch of sheetXml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const rowBody = rowMatch[1] ?? '';
    const cells: Record<number, string> = {};
    for (const cellMatch of rowBody.matchAll(
      /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
    )) {
      const attrs = cellMatch[1] ?? '';
      const body = cellMatch[2];
      if (body === undefined) continue;
      const rAttr = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1];
      if (!rAttr) continue;
      const colIdx = colRefToIndex(rAttr);
      const tAttr = /\bt="([^"]+)"/.exec(attrs)?.[1];
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      if (vMatch === undefined) continue;
      if (tAttr === 's') {
        cells[colIdx] = sharedStrings[Number(vMatch)] ?? '';
      } else {
        cells[colIdx] = decodeXmlEntities(vMatch);
      }
    }
    rows.push(cells);
  }

  const headerRow = rows[2] ?? {};
  const headerIndex = new Map<string, number>();
  for (const [k, v] of Object.entries(headerRow)) {
    headerIndex.set(v, Number(k));
  }

  const colMap: Record<keyof Nutrients, number> = {
    kcal: headerIndex.get('Energie, Kilokalorien (kcal)')!,
    fat: headerIndex.get('Fett, total (g)')!,
    satFat: headerIndex.get('Fettsäuren, gesättigt (g)')!,
    carbs: headerIndex.get('Kohlenhydrate, verfügbar (g)')!,
    sugars: headerIndex.get('Zucker (g)')!,
    fiber: headerIndex.get('Nahrungsfasern (g)')!,
    protein: headerIndex.get('Protein (g)')!,
    salt: headerIndex.get('Salz (NaCl) (g)')!,
  };

  const out = new Map<number, NwdXlsxRow>();
  for (let i = 3; i < rows.length; i += 1) {
    const r = rows[i] ?? {};
    const idRaw = r[0];
    if (!idRaw || Number.isNaN(Number(idRaw))) continue;
    const id = Number(idRaw);
    const name = r[3] ?? '';
    const densityRaw = r[6];
    const density =
      densityRaw !== undefined &&
      densityRaw !== '' &&
      !Number.isNaN(Number(densityRaw))
        ? Number(densityRaw)
        : null;

    const per100g = {} as Record<keyof Nutrients, number | null>;
    for (const key of NUTRIENT_KEYS) {
      const cell = r[colMap[key]];
      per100g[key] =
        cell !== undefined && cell !== '' && !Number.isNaN(Number(cell))
          ? Number(cell)
          : null;
    }
    out.set(id, { id, name, density, per100g });
  }
  return out;
}

function loadMergedE12aBundle(): RawContentBundle {
  const catalogFoods = readJson<FoodCatalogFile>(
    resolve(CONTENT_DIR, 'foods/foods.json'),
  );
  const e12aFoods = readJson<FoodCatalogFile>(
    resolve(E12A_DIR, 'foods-ext.json'),
  );
  const e12aRecipes = readJson<E12aRecipesFile>(
    resolve(E12A_DIR, 'recipes-ext.json'),
  );

  const e12aFoodIds = new Set(e12aFoods.foods.map((f) => f.id));
  const baseFoods = catalogFoods.foods.filter((f) => !e12aFoodIds.has(f.id));

  const e12aRecipeIds = new Set<string>(e12aRecipes.recipes.map((r) => r.id));
  const recipesDir = resolve(CONTENT_DIR, 'recipes');
  const baseFolders = readdirSync(recipesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !e12aRecipeIds.has(entry.name))
    .map((entry) => entry.name)
    .sort();

  const baseRecipes = baseFolders.map((folderName) => ({
    folderName,
    recipe: readJson<unknown>(resolve(recipesDir, folderName, 'recipe.json')),
    locales: {},
  }));

  const extRecipes = e12aRecipes.recipes.map((recipe) => ({
    folderName: recipe.id,
    recipe,
    locales: {},
  }));

  return {
    foodsFile: {
      ...catalogFoods,
      foods: [...baseFoods, ...e12aFoods.foods],
    },
    glossaries: {},
    recipes: [...baseRecipes, ...extRecipes],
  };
}

describe('Paket E12a (#46): Nährwert- und Quellenbelege vor dem Rezeptimport', () => {
  it('prüft die 55 Basis-Lebensmittel + 144 E12a-Lebensmittel (199) sowie 5 Basis- + 195 E12a-Rezepte (200) konsistent zu content/', () => {
    const catalogFoods = readJson<FoodCatalogFile>(
      resolve(CONTENT_DIR, 'foods/foods.json'),
    );
    const e12aFoods = readJson<FoodCatalogFile>(
      resolve(E12A_DIR, 'foods-ext.json'),
    );
    const e12aRecipes = readJson<E12aRecipesFile>(
      resolve(E12A_DIR, 'recipes-ext.json'),
    );

    const allRecipeFolders = readdirSync(resolve(CONTENT_DIR, 'recipes'), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(e12aFoods.foods).toHaveLength(144);
    expect(e12aRecipes.recipes).toHaveLength(195);
    expect(catalogFoods.foods).toHaveLength(199);
    expect(allRecipeFolders).toHaveLength(200);

    const catalogFoodById = new Map(catalogFoods.foods.map((f) => [f.id, f]));
    for (const f of e12aFoods.foods) {
      expect(catalogFoodById.get(f.id)).toEqual(f);
    }

    const folderSet = new Set(allRecipeFolders);
    for (const r of e12aRecipes.recipes) {
      expect(folderSet.has(r.id)).toBe(true);
    }
  });

  it('validiert alle 144 neuen Lebensmittel streng gegen foodCatalogFileSchema und prüft alle CH-NWD-Zeilen zellgenau gegen die archivierte V7.1-xlsx', () => {
    const rawFoods = readJson<unknown>(resolve(E12A_DIR, 'foods-ext.json'));
    const parsed = foodCatalogFileSchema.safeParse(rawFoods);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    // SHA-256 der archivierten Schweizer Nährwertdatenbank V7.1 prüfen
    expect(existsSync(SOURCE_XLSX)).toBe(true);
    const actualSha = createHash('sha256')
      .update(readFileSync(SOURCE_XLSX))
      .digest('hex');
    expect(parsed.data.source.sha256).toBe(actualSha);

    const nwdRows = loadChNwdV71Rows();
    expect(nwdRows.size).toBeGreaterThan(1000);

    let chNwdCount = 0;
    let usdaCount = 0;
    let missingCount = 0;

    for (const food of parsed.data.foods) {
      if (food.note) {
        expect(UNSAFE_TEXT_RE.test(food.note)).toBe(false);
      }

      if (food.per100g === null) {
        expect(food.source).toBeNull();
        expect(food.status).toBe('zu_pruefen');
        missingCount += 1;
        continue;
      }

      expect(food.source).not.toBeNull();
      const src = food.source!;
      expect(UNSAFE_TEXT_RE.test(src.name)).toBe(false);

      const hasNullNutrient = NUTRIENT_KEYS.some(
        (key) => food.per100g![key] === null,
      );
      if (hasNullNutrient || food.proxy === true) {
        expect(food.status).toBe('zu_pruefen');
      }

      if (src.db === 'CH-NWD') {
        chNwdCount += 1;
        expect(src.version).toBe('7.1');
        expect(typeof src.ref).toBe('number');
        const xlsxRow = nwdRows.get(src.ref as number);
        expect(xlsxRow).toBeDefined();
        expect(src.name).toBe(xlsxRow!.name);
        if (xlsxRow!.density !== null) {
          expect(food.density).toBe(xlsxRow!.density);
        }
        for (const key of NUTRIENT_KEYS) {
          expect(food.per100g[key]).toBe(xlsxRow!.per100g[key]);
        }
      } else {
        usdaCount += 1;
        expect(src.db).toBe('USDA');
        expect(typeof src.ref).toBe('number');
        expect(src.ref as number).toBeGreaterThan(0);
      }
    }

    expect(chNwdCount + usdaCount + missingCount).toBe(144);
    expect(chNwdCount).toBe(98);
    expect(usdaCount).toBe(40);
    expect(missingCount).toBe(6);
  });

  it('besteht den unveränderten validateContentBundle für alle 199 Lebensmittel und 200 Rezepte (0 Fehler) sowie alle Quellen- und BELEGE.md-Prüfungen', () => {
    const bundle = loadMergedE12aBundle();
    const report = validateContentBundle(bundle, {
      requiredGlossaryLangs: [],
      requiredRecipeUiLangs: [],
    });

    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.validated).not.toBeNull();
    expect(report.validated!.catalog.foods).toHaveLength(199);
    expect(report.validated!.recipes).toHaveLength(200);

    const e12aFoods = readJson<FoodCatalogFile>(
      resolve(E12A_DIR, 'foods-ext.json'),
    );
    const e12aRecipes = readJson<E12aRecipesFile>(
      resolve(E12A_DIR, 'recipes-ext.json'),
    );

    for (const r of e12aRecipes.recipes) {
      expect(r.review.sources.length).toBeGreaterThanOrEqual(2);
      expect(new Set(r.review.sources).size).toBe(r.review.sources.length);
      for (const url of r.review.sources) {
        expect(isSafeHttpsUrl(url)).toBe(true);
        expect(url.toLowerCase()).not.toContain('bettybossi');
        expect(UNSAFE_TEXT_RE.test(url)).toBe(false);
      }
      expect(UNSAFE_TEXT_RE.test(r.review.by)).toBe(false);
    }

    const belegeText = readFileSync(resolve(E12A_DIR, 'BELEGE.md'), 'utf8');
    expect(belegeText).not.toContain('ß');
    expect(belegeText).not.toMatch(/(?:^|[\s(`'"])\/home\/|(?:^|[\s(`'"])\/Users\/|[A-Za-z]:\\/);
    for (const f of e12aFoods.foods) {
      expect(belegeText).toContain(`\`${f.id}\``);
    }
    for (const r of e12aRecipes.recipes) {
      expect(belegeText).toContain(`\`${r.id}\``);
    }
  });

  it('Negativtests: fehlendes source.ref, < 2 Quellen, manipulierte kcal, unsichere URL, doppelte ID und Prototype-Schlüssel werden abgelehnt', () => {
    // 1) Fehlendes source.ref bzw. fehlende Quelle bei vorhandenen Nährwerten
    const foodNoRef = {
      id: 'test_food',
      group: 'veg',
      allergens: [],
      allergensToCheck: [],
      per100g: {
        kcal: 50,
        fat: 0.5,
        satFat: 0.1,
        carbs: 8,
        sugars: 3,
        fiber: 2,
        protein: 2,
        salt: 0,
      },
      source: { db: 'USDA', version: 'SR Legacy 2018-04', ref: '', name: 'Test' },
      status: 'ok',
    };
    expect(foodSchema.safeParse(foodNoRef).success).toBe(false);

    const bundleNoSource = structuredClone(loadMergedE12aBundle());
    const foodsArr = (bundleNoSource.foodsFile as { foods: Array<Record<string, unknown>> }).foods;
    const chFood = foodsArr.find((f) => f.id === 'almonds')!;
    chFood.source = null;
    const noSourceReport = validateContentBundle(bundleNoSource, {
      requiredGlossaryLangs: [],
      requiredRecipeUiLangs: [],
    });
    expect(noSourceReport.ok).toBe(false);
    expect(
      noSourceReport.errors.some((e) => e.includes('almonds') && e.includes('Quelle fehlt')),
    ).toBe(true);

    // 2) Weniger als 2 review.sources
    const bundleOneSource = structuredClone(loadMergedE12aBundle());
    const targetRecipe = bundleOneSource.recipes.find(
      (r) => r.folderName === 'quinoa_pan',
    )!.recipe as { review: { sources: string[] } };
    targetRecipe.review.sources = ['https://example.org/only-one'];
    const oneSourceReport = validateContentBundle(bundleOneSource, {
      requiredGlossaryLangs: [],
      requiredRecipeUiLangs: [],
    });
    expect(oneSourceReport.ok).toBe(false);
    expect(
      oneSourceReport.errors.some((e) => e.includes('review.sources')),
    ).toBe(true);

    // 3) Geschätzte/manipulierte Rezeptsumme (kcal)
    const bundleBadKcal = structuredClone(loadMergedE12aBundle());
    const kcalRecipe = bundleBadKcal.recipes.find(
      (r) => r.folderName === 'quinoa_pan',
    )!.recipe as { nutritionPerServing: { values: { kcal: number } } };
    kcalRecipe.nutritionPerServing.values.kcal += 50;
    const kcalReport = validateContentBundle(bundleBadKcal, {
      requiredGlossaryLangs: [],
      requiredRecipeUiLangs: [],
    });
    expect(kcalReport.ok).toBe(false);
    expect(
      kcalReport.errors.some((e) => e.includes('nutritionPerServing.kcal')),
    ).toBe(true);

    // 4) Unsichere URLs (http, javascript, Userinfo)
    for (const badUrl of [
      'http://example.org/rezept',
      `${'javascript'}:alert(1)`,
      'https://user:pw@example.org/rezept',
    ]) {
      const bundleBadUrl = structuredClone(loadMergedE12aBundle());
      const r = bundleBadUrl.recipes.find(
        (x) => x.folderName === 'quinoa_pan',
      )!.recipe as { review: { sources: string[] } };
      r.review.sources = ['https://example.org/valid', badUrl];
      const urlReport = validateContentBundle(bundleBadUrl, {
        requiredGlossaryLangs: [],
        requiredRecipeUiLangs: [],
      });
      expect(urlReport.ok).toBe(false);
      expect(urlReport.errors.some((e) => e.includes('review.sources'))).toBe(
        true,
      );
    }

    // 5) Doppelte Rezept-ID
    const bundleDup = structuredClone(loadMergedE12aBundle());
    bundleDup.recipes.push(structuredClone(bundleDup.recipes[0]!));
    const dupReport = validateContentBundle(bundleDup, {
      requiredGlossaryLangs: [],
      requiredRecipeUiLangs: [],
    });
    expect(dupReport.ok).toBe(false);
    expect(dupReport.errors.some((e) => e.includes('doppelte Rezept-ID'))).toBe(
      true,
    );

    // 6) Prototype-Pollution-Schlüssel als ID abgelehnt
    for (const badKey of ['__proto__', 'constructor', 'prototype']) {
      expect(
        foodSchema.safeParse({
          ...foodNoRef,
          id: badKey,
          source: null,
          per100g: null,
          status: 'zu_pruefen',
        }).success,
      ).toBe(false);
      expect(
        recipeSchema.safeParse({
          ...(loadMergedE12aBundle().recipes[0]!.recipe as Record<string, unknown>),
          id: badKey,
        }).success,
      ).toBe(false);
    }
  });
});
