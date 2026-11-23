import { z } from 'zod';
import {
  ALLERGENS,
  FOOD_GROUPS,
  GOALS,
  HYMN_IDS,
  MEALS,
  PACES,
  SEX_FOR_CALC,
  SHOP_STATES,
  TEXT_DIRS,
  UNITS,
  asCuisineId,
  asFoodId,
  asRecipeId,
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
  .string()
  .regex(CUISINE_ID_RE, 'Ungültiges CuisineId-Format.')
  .transform(asCuisineId);

export const unitSchema = z.enum(UNITS);
export const foodGroupSchema = z.enum(FOOD_GROUPS);
export const allergenSchema = z.enum(ALLERGENS);
export const mealSchema = z.enum(MEALS);
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

export const recipeReviewSchema = z.strictObject({
  status: z.enum(['ok', 'zu_pruefen']),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss YYYY-MM-DD sein.'),
  by: z.string().min(1),
  sources: z.array(z.string().url()).min(2),
  open: z.array(z.string().min(1)).optional(),
});

export const recipeSchema = z.strictObject({
  format: z.literal(1),
  id: recipeIdSchema,
  cuisine: cuisineIdSchema,
  meal: mealSchema,
  minutes: z.number().int().positive().max(600),
  servings: z.number().int().min(1).max(12),
  tags: z.array(z.string().min(1)),
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

export const shoppingItemSchema = z.strictObject({
  id: z.string().min(1).max(80),
  food: foodIdSchema,
  amount: z.number().finite().positive().optional(),
  unit: unitSchema.optional(),
  state: shopStateSchema,
  fromRecipes: z.array(recipeIdSchema),
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

export const settingsSchema = z.strictObject({
  uiLang: z.string().min(2).max(16),
  secondLang: z.string().min(2).max(16).nullable(),
  theme: z.enum(['system', 'light', 'dark']),
  sound: z.boolean(),
  hymn: z.enum(HYMN_IDS),
});

export const langMetaSchema = z.strictObject({
  code: z.string().min(2).max(16),
  name: safeContentStringSchema,
  englishName: safeContentStringSchema.optional(),
  locale: z.string().min(2).max(16),
  dir: z.enum(TEXT_DIRS),
  legalApproved: z.boolean(),
  reviewed: z.boolean(),
});

export const exportBundleV1Schema = z.strictObject({
  format: z.literal(1),
  exportedAt: z.string().min(1),
  data: z.strictObject({
    settings: settingsSchema.optional(),
    profile: profileSchema.nullable().optional(),
    shopping: z.array(shoppingItemSchema).max(500).optional(),
    ratings: z
      .record(z.string(), z.number().int().min(1).max(5))
      .refine((obj) => Object.keys(obj).every(isSafeRecordKey))
      .optional(),
    saved: z.array(recipeIdSchema).max(500).optional(),
  }),
});
