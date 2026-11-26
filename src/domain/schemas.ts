import { z } from 'zod';
import {
  ALLERGENS,
  CUISINES,
  FOOD_GROUPS,
  GOALS,
  HYMN_IDS,
  MEALS,
  PACES,
  PREFERENCE_TAGS,
  RECIPE_TAGS,
  SEX_FOR_CALC,
  SHOP_STATES,
  TEXT_DIRS,
  UNITS,
  asCuisineId,
  asFoodId,
  asRecipeId,
  type LanguagesRegistry,
} from './types.ts';

// Strikte CSP ohne 'unsafe-eval': Zod-v4-JIT (`new Function`-Probe) global deaktivieren,
// sonst löst bereits die Schema-Initialisierung ein `securitypolicyviolation`-Event aus.
z.config({ jitless: true });

/** Lehnt HTML-Zeichen und ASCII-Steuerzeichen in Inhaltstexten ab (ADR-003, validate.py). */
// eslint-disable-next-line no-control-regex
export const UNSAFE_TEXT_RE = /[<>&"\u0000-\u001F\u007F]/;

/** Strenger für QR-Namen: zusätzlich einfaches Anführungszeichen (edo-qr.js). */
// eslint-disable-next-line no-control-regex
export const UNSAFE_QR_NAME_RE = /[<>&"'\u0000-\u001F\u007F]/;

export const FOOD_ID_RE = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const RECIPE_ID_RE = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const CUISINE_ID_RE = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const QR_ID_RE = /^[\w.-]{1,40}$/;

const FORBIDDEN_PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isSafeRecordKey(key: string): boolean {
  return !FORBIDDEN_PROTO_KEYS.has(key);
}

/**
 * Prüft rekursiv alle eigenen Eigenschaften (`Object.getOwnPropertyNames`)
 * gegen Prototype-Pollution-Schlüssel (`__proto__`, `constructor`, `prototype`).
 */
export function hasForbiddenOwnKey(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some(hasForbiddenOwnKey);
  }
  const obj = value as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(obj)) {
    if (!isSafeRecordKey(key)) {
      return true;
    }
    if (hasForbiddenOwnKey(obj[key])) {
      return true;
    }
  }
  return false;
}

export const safeContentStringSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !UNSAFE_TEXT_RE.test(value), {
    message: 'Text enthält unzulässige HTML- oder Steuerzeichen.',
  });

export const foodIdSchema = z
  .string()
  .regex(FOOD_ID_RE, 'Ungültiges FoodId-Format (nur Kleinbuchstaben, Ziffern, _).')
  .refine(isSafeRecordKey, 'Reservierter Schlüsselname nicht zulässig.')
  .transform(asFoodId);

export const recipeIdSchema = z
  .string()
  .regex(RECIPE_ID_RE, 'Ungültiges RecipeId-Format (nur Kleinbuchstaben, Ziffern, _).')
  .refine(isSafeRecordKey, 'Reservierter Schlüsselname nicht zulässig.')
  .transform(asRecipeId);

export const cuisineIdSchema = z
  .enum(CUISINES)
  .transform(asCuisineId);

export const unitSchema = z.enum(UNITS);
export const foodGroupSchema = z.enum(FOOD_GROUPS);
export const allergenSchema = z.enum(ALLERGENS);
export const mealSchema = z.enum(MEALS);
export const recipeTagSchema = z.enum(RECIPE_TAGS);
export const preferenceTagSchema = z.enum(PREFERENCE_TAGS);
export const shopStateSchema = z.enum(SHOP_STATES);

const nonNegativeNumber = z.number().finite().min(0);
const nullableNutrient = nonNegativeNumber.nullable();

export const nutrientsSchema = z.strictObject({
  kcal: nonNegativeNumber,
  fat: nonNegativeNumber,
  satFat: nonNegativeNumber,
  carbs: nonNegativeNumber,
  sugars: nonNegativeNumber,
  fiber: nonNegativeNumber,
  protein: nonNegativeNumber,
  salt: nonNegativeNumber,
});

export const foodNutrientsSchema = z.strictObject({
  kcal: nullableNutrient,
  fat: nullableNutrient,
  satFat: nullableNutrient,
  carbs: nullableNutrient,
  sugars: nullableNutrient,
  fiber: nullableNutrient,
  protein: nullableNutrient,
  salt: nullableNutrient,
});

export const foodSourceSchema = z.strictObject({
  db: z.enum(['CH-NWD', 'USDA']),
  version: z.string().min(1),
  ref: z.union([z.number().int().positive(), z.string().min(1)]),
  name: z.string().min(1),
});

export const foodSchema = z.strictObject({
  id: foodIdSchema,
  group: foodGroupSchema,
  allergens: z.array(allergenSchema),
  allergensToCheck: z.array(allergenSchema),
  per100g: foodNutrientsSchema.nullable(),
  source: foodSourceSchema.nullable(),
  status: z.enum(['ok', 'zu_pruefen']),
  proxy: z.boolean().optional(),
  density: z.number().finite().positive().optional(),
  note: z.string().optional(),
});

export const foodCatalogSourceMetaSchema = z.strictObject({
  name: z.string().min(1),
  license: z.string().min(1),
  file: z.string().min(1),
  sha256: z.string().regex(/^[0-9a-f]{64}$/, 'Ungültiger SHA-256-Hash.'),
});

export const foodCatalogFileSchema = z.strictObject({
  format: z.literal(1),
  source: foodCatalogSourceMetaSchema,
  foods: z.array(foodSchema).min(1),
});

export const glossarySchema = z
  .record(z.string(), safeContentStringSchema)
  .refine(
    (obj) => Object.keys(obj).every(isSafeRecordKey),
    'Reservierter Schlüssel im Glossar nicht zulässig.',
  );

export const recipeIngredientSchema = z.strictObject({
  food: foodIdSchema,
  amount: z.number().finite().positive(),
  unit: unitSchema,
  grams: z.number().finite().positive(),
  optional: z.boolean().optional(),
  strained: z.boolean().optional(),
  noteKey: z.string().min(1).optional(),
});

export const nutritionSummarySchema = z.strictObject({
  values: nutrientsSchema,
  isMinimum: z.boolean(),
  notIncluded: z.array(z.string().min(1)),
  proxies: z.array(z.string().min(1)),
  basis: z.string().min(1),
});

/**
 * Prüft eine externe URL strikt auf `https:`, nicht-leeren Hostnamen und fehlende
 * Benutzerdaten (`username`/`password`, F3b gegen `https://user:pw@host`).
 */
export function isSafeHttpsUrl(raw: string): boolean {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return false;
  }
  try {
    const parsed = new URL(raw);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.length > 0 &&
      parsed.username === '' &&
      parsed.password === ''
    );
  } catch {
    return false;
  }
}

/**
 * Liefert eine bereinigte `https:`-URL für externe Links oder `null`, falls Schema,
 * Host oder Userinfo (`https://user:pw@host`) unzulässig sind (F3b).
 */
export function sanitizeExternalHttpsUrl(raw: string): string | null {
  if (!isSafeHttpsUrl(raw)) {
    return null;
  }
  try {
    return new URL(raw).href;
  } catch {
    return null;
  }
}

export const httpsUrlSchema = z
  .string()
  .url()
  .refine(
    isSafeHttpsUrl,
    'Quelle muss eine gültige https-URL ohne Benutzerdaten sein.',
  );

export const LANG_CODE_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

export const langCodeSchema = z
  .string()
  .min(2)
  .max(16)
  .regex(LANG_CODE_RE, 'Ungültiger Sprachcode.')
  .refine(isSafeRecordKey, 'Reservierter Sprachcode nicht zulässig.');

export const recipeReviewSchema = z.strictObject({
  status: z.enum(['ok', 'zu_pruefen']),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss YYYY-MM-DD sein.'),
  by: z.string().min(1),
  sources: z.array(httpsUrlSchema).min(2),
  open: z.array(z.string().min(1)).optional(),
});

export const recipeSchema = z.strictObject({
  format: z.literal(1),
  id: recipeIdSchema,
  image: recipeIdSchema.optional(),
  cuisine: cuisineIdSchema,
  meal: mealSchema,
  minutes: z.number().int().positive().max(600),
  servings: z.number().int().min(1).max(12),
  tags: z.array(recipeTagSchema),
  preferenceTags: z.array(preferenceTagSchema).optional(),
  ingredients: z.array(recipeIngredientSchema).min(1),
  steps: z.number().int().min(1).max(50),
  allergens: z.array(allergenSchema),
  allergensToCheck: z.array(allergenSchema),
  nutritionPerServing: nutritionSummarySchema,
  review: recipeReviewSchema,
});

export const recipeLocaleTextSchema = z.strictObject({
  title: safeContentStringSchema,
  steps: z.array(safeContentStringSchema).min(1),
  notes: z.record(z.string(), safeContentStringSchema),
});

export const recipeTitlesSchema = z
  .record(z.string(), safeContentStringSchema)
  .refine(
    (obj) =>
      Object.keys(obj).every(
        (key) => isSafeRecordKey(key) && RECIPE_ID_RE.test(key),
      ),
    'Ungültige oder reservierte Rezept-ID in Rezepttiteln nicht zulässig.',
  );

export const shoppingItemSchema = z.strictObject({
  id: z.string().min(1).max(80),
  food: foodIdSchema,
  amount: z.number().finite().positive().optional(),
  unit: unitSchema.optional(),
  qtyPlan: z.number().finite().min(0).max(1_000_000).optional(),
  qtyExtra: z.number().finite().min(0).max(1_000_000).optional(),
  qtyHave: z.number().finite().min(0).max(1_000_000).optional(),
  state: shopStateSchema,
  fromRecipes: z.array(recipeIdSchema),
  recipesPlan: z.array(recipeIdSchema).optional(),
  recipesExtra: z.array(recipeIdSchema).optional(),
  recipeAmounts: z
    .record(
      z
        .string()
        .regex(RECIPE_ID_RE, 'Ungültige Rezept-ID in recipeAmounts.')
        .refine(isSafeRecordKey, 'Reservierter Schlüssel nicht zulässig.'),
      z.number().finite().positive(),
    )
    .optional(),
  customLabel: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .refine((value) => !UNSAFE_QR_NAME_RE.test(value), {
      message: 'Bezeichnung enthält unzulässige Zeichen.',
    })
    .optional(),
  addedAt: z.string().min(1),
});

export const profileSchema = z.strictObject({
  id: z.string().min(1).max(80),
  name: safeContentStringSchema.max(80),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sexForCalc: z.enum(SEX_FOR_CALC).optional(),
  heightCm: z.number().finite().min(100).max(250).optional(),
  goal: z.enum(GOALS),
  pace: z.enum(PACES),
});

function isApprovedInRegistry(
  code: string,
  registry: LanguagesRegistry,
): boolean {
  if (
    !isSafeRecordKey(code) ||
    !registry.ui.includes(code) ||
    !Object.hasOwn(registry.meta, code)
  ) {
    return false;
  }
  const meta = registry.meta[code];
  return meta?.active !== false && meta?.legalApproved === true;
}

function isSecondaryInRegistry(
  code: string,
  registry: LanguagesRegistry,
): boolean {
  return isSafeRecordKey(code) && registry.secondary.includes(code);
}

/**
 * Erzeugt das strenge Settings-Schema gebunden an die Sprach-Registry (F1, F3a, E6).
 * - `uiLang`: akzeptiert ausschliesslich aktive und rechtlich freigegebene UI-Sprachen (`active !== false && legalApproved === true`).
 * - `secondLang`: akzeptiert `null` (automatisch), `'none'` (keine) oder Einträge aus `registry.secondary`.
 */
export function createSettingsSchema(registry: LanguagesRegistry) {
  return z.strictObject({
    uiLang: langCodeSchema.refine(
      (code) => isApprovedInRegistry(code, registry),
      'UI-Sprache ist nicht aktiv und freigegeben (active & legalApproved).',
    ),
    secondLang: z
      .union([
        z.literal('none'),
        langCodeSchema.refine(
          (code) => isSecondaryInRegistry(code, registry),
          'Zweitsprache ist nicht in registry.secondary enthalten.',
        ),
      ])
      .nullable(),
    theme: z.enum(['system', 'light', 'dark']),
    sound: z.boolean(),
    hymn: z.enum(HYMN_IDS),
  });
}

export const langMetaSchema = z.strictObject({
  code: langCodeSchema,
  name: safeContentStringSchema,
  englishName: safeContentStringSchema.optional(),
  locale: z.string().min(2).max(16),
  dir: z.enum(TEXT_DIRS),
  active: z.boolean().optional(),
  legalApproved: z.boolean(),
  reviewed: z.boolean(),
});

export const languagesRegistrySchema = z.strictObject({
  fallback: langCodeSchema,
  ui: z.array(langCodeSchema).min(1),
  secondary: z.array(langCodeSchema).min(1),
  meta: z
    .record(z.string(), langMetaSchema)
    .refine(
      (obj) => Object.keys(obj).every(isSafeRecordKey),
      'Reservierter Schlüssel in languages.meta nicht zulässig.',
    ),
});

export const uiLocaleSchema = z
  .record(z.string(), safeContentStringSchema)
  .refine(
    (obj) => Object.keys(obj).every(isSafeRecordKey),
    'Reservierter Schlüssel in UI-Locale nicht zulässig.',
  );

export const planItemSchema = z.strictObject({
  id: z.string().regex(/^p[a-z0-9]{4,20}$/, 'Ungültige Plan-Eintrags-ID.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum im Plan.'),
  slot: mealSchema,
  recipeId: recipeIdSchema,
  portions: z.number().int().min(1).max(8),
});

export const mealPlanSchema = z.strictObject({
  days: z.number().int().min(3).max(7),
  items: z.array(planItemSchema).max(80),
});

/**
 * Erzeugt das strenge Export-Bundle-Schema (Format 1) gebunden an die Sprach-Registry (ADR-002, F1, F3a).
 */
export function createExportBundleV1Schema(registry: LanguagesRegistry) {
  return z.strictObject({
    format: z.literal(1),
    exportedAt: z.string().min(1),
    data: z.strictObject({
      settings: createSettingsSchema(registry).optional(),
      profile: profileSchema.nullable().optional(),
      shopping: z.array(shoppingItemSchema).max(500).optional(),
      ratings: z
        .record(
          z
            .string()
            .regex(RECIPE_ID_RE, 'Ungültige Rezept-ID in ratings.')
            .refine(isSafeRecordKey, 'Reservierter Schlüssel nicht zulässig.'),
          z.number().int().min(1).max(5),
        )
        .optional(),
      saved: z.array(recipeIdSchema).max(500).optional(),
      plan: mealPlanSchema.optional(),
    }),
  });
}
