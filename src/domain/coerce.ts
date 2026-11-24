import { coerceSecondLang, coerceUiLang } from './lang.ts';
import { FOOD_ID_RE, RECIPE_ID_RE, isSafeRecordKey } from './schemas.ts';
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
