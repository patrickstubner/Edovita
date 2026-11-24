/**
 * Domänentypen gemäss ADR-002, ADR-003 und ADR-005.
 * Reine Typ- und Marken-Definitionen ohne Abhängigkeiten auf andere Schichten (ADR-001 Regel 1).
 */

export type FoodId = string & { readonly __brand: 'FoodId' };
export type RecipeId = string & { readonly __brand: 'RecipeId' };
export type CuisineId = string & { readonly __brand: 'CuisineId' };

export function asFoodId(id: string): FoodId {
  return id as FoodId;
}

export function asRecipeId(id: string): RecipeId {
  return id as RecipeId;
}

export function asCuisineId(id: string): CuisineId {
  return id as CuisineId;
}

export const UNITS = ['g', 'ml', 'pc', 'tbsp', 'tsp', 'pinch'] as const;
export type Unit = (typeof UNITS)[number];

export const FOOD_GROUPS = [
  'veg',
  'fruit',
  'dairy',
  'meat',
  'fish',
  'pantry',
  'spice',
  'bakery',
  'drinks',
] as const;
export type FoodGroup = (typeof FOOD_GROUPS)[number];

export const ALLERGENS = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soy',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const NUTRIENT_KEYS = [
  'kcal',
  'fat',
  'satFat',
  'carbs',
  'sugars',
  'fiber',
  'protein',
  'salt',
] as const;
export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type Meal = (typeof MEALS)[number];

export const RECIPE_TAGS = [
  'fast',
  'protein',
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
] as const;
export type RecipeTag = (typeof RECIPE_TAGS)[number];

export const SHOP_STATES = ['open', 'cart', 'home'] as const;
export type ShopState = (typeof SHOP_STATES)[number];

export const GOALS = ['lose', 'keep', 'gain'] as const;
export type Goal = (typeof GOALS)[number];

export const PACES = ['sustainable', 'custom_rate', 'custom_kcal'] as const;
export type Pace = (typeof PACES)[number];

export const SEX_FOR_CALC = ['m', 'f', 'na'] as const;
export type SexForCalc = (typeof SEX_FOR_CALC)[number];

export const HYMN_IDS = ['H1', 'H5', 'H4'] as const;
export type HymnId = (typeof HYMN_IDS)[number];

export const TEXT_DIRS = ['ltr', 'rtl'] as const;
export type TextDir = (typeof TEXT_DIRS)[number];

export const DIETARY_PREFS = [
  'veg',
  'vegan',
  'lactose',
  'gluten',
  'nuts',
  'd_mush',
  'd_fish',
  'd_onion',
  'd_cil',
] as const;
export type DietaryPref = (typeof DIETARY_PREFS)[number];

export type LangCode = string;

export const DEFAULT_UI_LANG: LangCode = 'en';

export interface LangMeta {
  code: LangCode;
  name: string;
  englishName?: string;
  locale: string;
  dir: TextDir;
  legalApproved: boolean;
  reviewed: boolean;
}

export interface LanguagesRegistry {
  fallback: LangCode;
  ui: readonly LangCode[];
  secondary: readonly LangCode[];
  meta: Readonly<Record<string, LangMeta>>;
}

export type UiLocaleDict = Readonly<Record<string, string>>;

export interface Nutrients {
  kcal: number;
  fat: number;
  satFat: number;
  carbs: number;
  sugars: number;
  fiber: number;
  protein: number;
  salt: number;
}

/**
 * Nährwertwerte pro 100 g aus der Datenquelle; einzelne Felder können `null` sein,
 * wenn die Datenbank keinen Wert ausweist (z. B. Nahrungsfasern bei Bouillon).
 */
export type FoodNutrients = Record<NutrientKey, number | null>;

export interface FoodSource {
  db: 'CH-NWD' | 'USDA';
  version: string;
  ref: number | string;
  name: string;
}

export interface Food {
  id: FoodId;
  group: FoodGroup;
  allergens: Allergen[];
  allergensToCheck: Allergen[];
  per100g: FoodNutrients | null;
  source: FoodSource | null;
  status: 'ok' | 'zu_pruefen';
  proxy?: boolean;
  density?: number;
  note?: string;
}

export interface FoodCatalogSourceMeta {
  name: string;
  license: string;
  file: string;
  sha256: string;
}

export interface FoodCatalogFile {
  format: 1;
  source: FoodCatalogSourceMeta;
  foods: Food[];
}

export interface RecipeIngredient {
  food: FoodId;
  amount: number;
  unit: Unit;
  grams: number;
  optional?: boolean;
  strained?: boolean;
  noteKey?: string;
}

export interface ScaledIngredient extends RecipeIngredient {
  scaledAmount: number;
  scaledGrams: number;
}

export interface NutritionSummary {
  values: Nutrients;
  isMinimum: boolean;
  notIncluded: string[];
  proxies: string[];
  basis: string;
}

export interface RecipeReview {
  status: 'ok' | 'zu_pruefen';
  checkedAt: string;
  by: string;
  sources: string[];
  open?: string[];
}

export interface Recipe {
  format: 1;
  id: RecipeId;
  cuisine: CuisineId;
  meal: Meal;
  minutes: number;
  servings: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: number;
  allergens: Allergen[];
  allergensToCheck: Allergen[];
  nutritionPerServing: NutritionSummary;
  review: RecipeReview;
}

export interface RecipeLocaleText {
  title: string;
  steps: string[];
  notes: Record<string, string>;
}

export type FoodGlossary = Record<string, string>;

export interface ShoppingItem {
  id: string;
  food: FoodId;
  amount?: number;
  unit?: Unit;
  state: ShopState;
  fromRecipes: RecipeId[];
  addedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  birthDate?: string;
  sexForCalc?: SexForCalc;
  heightCm?: number;
  goal: Goal;
  pace: Pace;
}

export interface Settings {
  uiLang: LangCode;
  secondLang: LangCode | null;
  theme: 'system' | 'light' | 'dark';
  sound: boolean;
  hymn: HymnId;
}

export interface ExportBundleV1 {
  format: 1;
  exportedAt: string;
  data: {
    settings?: Settings;
    profile?: Profile | null;
    shopping?: ShoppingItem[];
    ratings?: Record<string, number>;
    saved?: string[];
  };
}

export interface ImportShopItem {
  id: string;
  name: string;
  st: ShopState;
}

export type ShopImportError =
  | 'format'
  | 'size'
  | 'parse'
  | 'schema'
  | 'count'
  | 'id'
  | 'name';

export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
