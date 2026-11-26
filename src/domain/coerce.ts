import { coerceSecondLang, coerceUiLang } from './lang.ts';
import {
  FOOD_ID_RE,
  RECIPE_ID_RE,
  UNSAFE_QR_NAME_RE,
  isSafeRecordKey,
} from './schemas.ts';
import { coerceThemePreference } from './theme.ts';
import {
  DEFAULT_UI_LANG,
  HYMN_IDS,
  SHOP_STATES,
  UNITS,
  asFoodId,
  asRecipeId,
  type HymnId,
  type LanguagesRegistry,
  type RecipeId,
  type Settings,
  type ShopState,
  type ShoppingItem,
  type Unit,
} from './types.ts';

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  uiLang: DEFAULT_UI_LANG,
  secondLang: null,
  theme: 'system',
  sound: true,
  hymn: 'H1',
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function ownField(obj: Record<string, unknown>, key: string): unknown {
  return Object.hasOwn(obj, key) ? obj[key] : undefined;
}

function coerceHymn(value: unknown): HymnId {
  if (typeof value === 'string' && (HYMN_IDS as readonly string[]).includes(value)) {
    return value as HymnId;
  }
  return DEFAULT_SETTINGS.hymn;
}

function coerceShopState(value: unknown): ShopState {
  if (
    typeof value === 'string' &&
    (SHOP_STATES as readonly string[]).includes(value)
  ) {
    return value as ShopState;
  }
  return 'open';
}

function coerceUnit(value: unknown): Unit | undefined {
  if (typeof value === 'string' && (UNITS as readonly string[]).includes(value)) {
    return value as Unit;
  }
  return undefined;
}

/**
 * Normalisiert beliebige gelesene Einstellungen über strikte Whitelists (ADR-002, F1, F3a).
 * - `uiLang`: nur freigegebene Sprachen (`legalApproved === true`), sonst Fallback (`en`).
 * - `secondLang`: nur Sprachen in `registry.secondary`, sonst `null`.
 * - `theme`, `sound`, `hymn`: Whitelist / Standardwerte (`system`, `true`, `H1`).
 */
export function coerceSettings(
  raw: unknown,
  registry: LanguagesRegistry,
): Settings {
  const src = isPlainObject(raw) ? raw : {};

  const uiLang = coerceUiLang(ownField(src, 'uiLang'), registry);
  const secondLang = coerceSecondLang(ownField(src, 'secondLang'), registry);
  const theme = coerceThemePreference(ownField(src, 'theme'));
  const rawSound = ownField(src, 'sound');
  const sound = typeof rawSound === 'boolean' ? rawSound : DEFAULT_SETTINGS.sound;
  const hymn = coerceHymn(ownField(src, 'hymn'));

  return {
    uiLang,
    secondLang,
    theme,
    sound,
    hymn,
  };
}

export const MAX_QTY_HAVE = 1_000_000;

/**
 * Normalisiert `qtyHave`: nur endliche Zahl in `[0, 1e6]`, ungültige Werte -> `0`.
 * Ist ein positiver Bedarf (`need`) bekannt, wird `qtyHave` strikt darauf gedeckelt (v5.9).
 */
export function coerceQtyHave(raw: unknown, need?: number): number {
  if (
    typeof raw !== 'number' ||
    !Number.isFinite(raw) ||
    raw <= 0 ||
    raw > MAX_QTY_HAVE
  ) {
    return 0;
  }
  const rounded = Math.round((raw + Number.EPSILON) * 10) / 10;
  if (typeof need === 'number' && Number.isFinite(need) && need > 0) {
    return Math.min(rounded, need);
  }
  return rounded;
}

/**
 * Normalisiert einen gelesenen Einkaufsartikel über Whitelists (ADR-002).
 * Gibt `null` zurück, wenn Pflichtfelder (`id`, `food`) fehlen oder ungültig sind.
 */
export function coerceShoppingItem(raw: unknown): ShoppingItem | null {
  if (!isPlainObject(raw)) {
    return null;
  }

  const rawId = ownField(raw, 'id');
  if (
    typeof rawId !== 'string' ||
    rawId.length === 0 ||
    rawId.length > 80 ||
    !isSafeRecordKey(rawId)
  ) {
    return null;
  }

  const rawFood = ownField(raw, 'food');
  if (
    typeof rawFood !== 'string' ||
    !FOOD_ID_RE.test(rawFood) ||
    !isSafeRecordKey(rawFood)
  ) {
    return null;
  }

  const rawAmount = ownField(raw, 'amount');
  const amount =
    typeof rawAmount === 'number' && Number.isFinite(rawAmount) && rawAmount > 0
      ? rawAmount
      : undefined;

  const unit = coerceUnit(ownField(raw, 'unit'));

  const coerceNonNegQty = (v: unknown): number | undefined => {
    if (v === undefined) return undefined;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > MAX_QTY_HAVE) {
      return 0;
    }
    return Math.round((v + Number.EPSILON) * 10) / 10;
  };

  const qtyPlan = coerceNonNegQty(ownField(raw, 'qtyPlan'));
  const qtyExtra = coerceNonNegQty(ownField(raw, 'qtyExtra'));

  const coerceRecipeList = (rawList: unknown): RecipeId[] | undefined => {
    if (rawList === undefined) return undefined;
    if (!Array.isArray(rawList)) return [];
    const out: RecipeId[] = [];
    for (const entry of rawList) {
      if (
        typeof entry === 'string' &&
        RECIPE_ID_RE.test(entry) &&
        isSafeRecordKey(entry)
      ) {
        const rid = asRecipeId(entry);
        if (!out.includes(rid)) {
          out.push(rid);
        }
      }
    }
    return out;
  };

  const recipesPlan = coerceRecipeList(ownField(raw, 'recipesPlan'));
  const recipesExtra = coerceRecipeList(ownField(raw, 'recipesExtra'));

  const rawQtyHave = ownField(raw, 'qtyHave');
  const qtyHave =
    rawQtyHave !== undefined ? coerceQtyHave(rawQtyHave, amount) : undefined;
  const state = coerceShopState(ownField(raw, 'state'));

  const rawFrom = ownField(raw, 'fromRecipes');
  const fromRecipes = Array.isArray(rawFrom)
    ? rawFrom
        .filter(
          (entry): entry is string =>
            typeof entry === 'string' &&
            RECIPE_ID_RE.test(entry) &&
            isSafeRecordKey(entry),
        )
        .map((id) => asRecipeId(id))
    : [];

  const rawAddedAt = ownField(raw, 'addedAt');
  const addedAt =
    typeof rawAddedAt === 'string' && rawAddedAt.trim().length > 0
      ? rawAddedAt
      : new Date(0).toISOString();

  const rawRecipeAmounts = ownField(raw, 'recipeAmounts');
  let recipeAmounts: Record<string, number> | undefined;
  if (isPlainObject(rawRecipeAmounts)) {
    const clean: Record<string, number> = {};
    let hasAny = false;
    for (const key of Object.getOwnPropertyNames(rawRecipeAmounts)) {
      if (!RECIPE_ID_RE.test(key) || !isSafeRecordKey(key)) {
        continue;
      }
      const val = rawRecipeAmounts[key];
      if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
        clean[key] = val;
        hasAny = true;
      }
    }
    if (hasAny) {
      recipeAmounts = clean;
    }
  }

  const rawCustomLabel = ownField(raw, 'customLabel');
  const customLabel =
    typeof rawCustomLabel === 'string' &&
    rawCustomLabel.trim().length > 0 &&
    rawCustomLabel.trim().length <= 80 &&
    !UNSAFE_QR_NAME_RE.test(rawCustomLabel.trim())
      ? rawCustomLabel.trim()
      : undefined;

  const item: ShoppingItem = {
    id: rawId,
    food: asFoodId(rawFood),
    state,
    fromRecipes,
    addedAt,
  };

  if (amount !== undefined) {
    item.amount = amount;
  }
  if (unit !== undefined) {
    item.unit = unit;
  }
  if (qtyPlan !== undefined) {
    item.qtyPlan = qtyPlan;
  }
  if (qtyExtra !== undefined) {
    item.qtyExtra = qtyExtra;
  }
  if (qtyHave !== undefined) {
    item.qtyHave = qtyHave;
  }
  if (recipesPlan !== undefined) {
    item.recipesPlan = recipesPlan;
  }
  if (recipesExtra !== undefined) {
    item.recipesExtra = recipesExtra;
  }
  if (recipeAmounts !== undefined) {
    item.recipeAmounts = recipeAmounts;
  }
  if (customLabel !== undefined) {
    item.customLabel = customLabel;
  }

  return item;
}

/**
 * Normalisiert eine Sterne-Bewertung (1–5 ganzzahlig), sonst `null`.
 */
export function coerceRating(raw: unknown): number | null {
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 1 || raw > 5) {
    return null;
  }
  return raw;
}
