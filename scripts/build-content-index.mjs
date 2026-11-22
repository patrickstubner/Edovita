import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT_DIR = resolve(ROOT, 'content');
const OUTPUT_FILE = resolve(CONTENT_DIR, 'generated/catalog-index.ts');

function toPascal(name) {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const SAFE_IDENT_RE = /^[a-z0-9_]+$/;

function assertSafeIdent(value, context) {
  if (!SAFE_IDENT_RE.test(value)) {
    throw new Error(`Ungültiger Bezeichner in ${context}: ${value}`);
  }
}

export function generateCatalogIndexSource(contentDir = CONTENT_DIR) {
  const glossaryDir = resolve(contentDir, 'foods/glossary');
  const recipesDir = resolve(contentDir, 'recipes');

  const glossaryLangs = readdirSync(glossaryDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
  for (const lang of glossaryLangs) {
    assertSafeIdent(lang, 'foods/glossary');
  }

  const recipeIds = readdirSync(recipesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const rid of recipeIds) {
    assertSafeIdent(rid, 'recipes');
  }

  const lines = [
    '/* Auto-generiert von scripts/build-content-index.mjs – nicht von Hand bearbeiten. */',
    'import type {',
    '  Food,',
    '  FoodCatalogSourceMeta,',
    '  FoodGlossary,',
    '  Recipe,',
    '  RecipeLocaleText,',
    "} from '../../src/domain/index.ts';",
    "import foodsFile from '../foods/foods.json';",
  ];

  for (const lang of glossaryLangs) {
    lines.push(
      `import glossary${toPascal(lang)} from '../foods/glossary/${lang}.json';`,
    );
  }

  const recipeMeta = [];
  for (const rid of recipeIds) {
    const rDir = resolve(recipesDir, rid);
    const langs = readdirSync(rDir)
      .filter((f) => f.endsWith('.json') && f !== 'recipe.json')
      .map((f) => f.replace(/\.json$/, ''))
      .sort();
    for (const lang of langs) {
      assertSafeIdent(lang, `recipes/${rid}`);
    }
    const ident = toPascal(rid);
    lines.push(`import recipe${ident} from '../recipes/${rid}/recipe.json';`);
    for (const lang of langs) {
      lines.push(
        `import recipe${ident}${toPascal(lang)} from '../recipes/${rid}/${lang}.json';`,
      );
    }
    recipeMeta.push({ rid, ident, langs });
  }

  lines.push('');
  lines.push(
    'export const CATALOG_SOURCE: FoodCatalogSourceMeta = foodsFile.source;',
  );
  lines.push(
    'export const FOODS: readonly Food[] = foodsFile.foods as unknown as readonly Food[];',
  );
  lines.push('');
  lines.push(
    'export const GLOSSARY_LANGS = [' +
      glossaryLangs.map((l) => `'${l}'`).join(', ') +
      '] as const;',
  );
  lines.push(
    'export const GLOSSARIES: Readonly<Record<string, FoodGlossary>> = {',
  );
  for (const lang of glossaryLangs) {
    lines.push(`  ${lang}: glossary${toPascal(lang)},`);
  }
  lines.push('};');
  lines.push('');
  lines.push('export const RECIPES: readonly Recipe[] = [');
  for (const { ident } of recipeMeta) {
    lines.push(`  recipe${ident} as unknown as Recipe,`);
  }
  lines.push('];');
  lines.push('');
  lines.push(
    'export const RECIPE_LOCALES: Readonly<Record<string, Readonly<Record<string, RecipeLocaleText>>>> = {',
  );
  for (const { rid, ident, langs } of recipeMeta) {
    lines.push(`  ${rid}: {`);
    for (const lang of langs) {
      lines.push(`    ${lang}: recipe${ident}${toPascal(lang)},`);
    }
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

export function isCatalogIndexUpToDate(
  contentDir = CONTENT_DIR,
  outputFile = OUTPUT_FILE,
) {
  if (!existsSync(outputFile)) {
    return false;
  }
  const expected = generateCatalogIndexSource(contentDir);
  const actual = readFileSync(outputFile, 'utf8');
  return actual === expected;
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename);

if (isMain) {
  const source = generateCatalogIndexSource();
  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, source, 'utf8');
  console.log('Typisierter Inhalts-Index erzeugt: content/generated/catalog-index.ts');
}
