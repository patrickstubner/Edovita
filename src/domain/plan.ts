import { isSafeRecordKey } from './schemas.ts';
import {
  MEALS,
  SHOP_STATES,
  asRecipeId,
  type Meal,
  type RecipeId,
  type Result,
  type ShopState,
} from './types.ts';

export const PLAN_SLOTS = MEALS;
export type PlanSlot = Meal;

export const PLAN_DAYS_MIN = 3;
export const PLAN_DAYS_MAX = 7;
export const PLAN_DAYS_DEFAULT = 5;

export const PLAN_PORTIONS_MIN = 1;
export const PLAN_PORTIONS_MAX = 8;
export const PLAN_PORTIONS_DEFAULT = 2;

export const PLAN_ITEMS_MAX = 80;
export const PLAN_DATE_PAST_DAYS = -1;
export const PLAN_DATE_FUTURE_DAYS = 14;

export const PLAN_ITEM_ID_RE = /^p[a-z0-9]{4,20}$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const PLAN_EXPORT_FILENAME = 'edovita-plan-einkauf.json';
export const PLAN_EXPORT_KIND = 'edovita-prototype-export';
export const PLAN_EXPORT_MAX_BYTES = 100_000;

const PLAN_SLOT_SET: ReadonlySet<string> = new Set<PlanSlot>(PLAN_SLOTS);
const SHOP_STATE_SET: ReadonlySet<string> = new Set<ShopState>(SHOP_STATES);
const EXPORT_SHOP_UNIT_SET: ReadonlySet<string> = new Set([
  '',
  'g',
  'ml',
  'pc',
  'tbsp',
  'tsp',
  'pinch',
  'bottle',
]);

export interface PlanItem {
  readonly id: string;
  readonly date: string;
  readonly slot: PlanSlot;
  readonly recipeId: RecipeId;
  readonly portions: number;
}

export interface MealPlan {
  readonly days: number;
  readonly items: readonly PlanItem[];
}

export const EMPTY_PLAN: MealPlan = {
  days: PLAN_DAYS_DEFAULT,
  items: [],
};

export interface PlanExportShopItem {
  readonly id: string;
  readonly unit: string;
  readonly qtyPlan: number;
  readonly qtyExtra: number;
  readonly qtyHave: number;
  readonly recipesPlan: readonly string[];
  readonly recipesExtra: readonly string[];
  readonly grp?: string;
}

export interface PlanExportBundle {
  readonly v: 1;
  readonly kind: typeof PLAN_EXPORT_KIND;
  readonly plan?: MealPlan;
  readonly shopItems?: readonly PlanExportShopItem[];
  readonly shopStatus?: Readonly<Record<string, ShopState>>;
}

export interface ParsedPlanExportBundle {
  readonly plan: MealPlan | null;
  readonly shopItems: readonly PlanExportShopItem[] | null;
  readonly shopStatus: Readonly<Record<string, ShopState>> | null;
}

export type PlanExportErrorCode =
  | 'size'
  | 'parse'
  | 'schema'
  | 'days'
  | 'plan'
  | 'plan-count'
  | 'plan-id'
  | 'plan-date'
  | 'plan-slot'
  | 'plan-recipe'
  | 'plan-portions'
  | 'shop'
  | 'shop-count'
  | 'shop-id'
  | 'shop-unit'
  | 'shop-dup'
  | 'shop-qty'
  | 'shop-rec'
  | 'status'
  | 'empty';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Liefert das lokale Datum als ISO-Zeichenkette `YYYY-MM-DD` (ohne UTC-Versatz). */
export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** Prüft streng auf gültiges Kalenderdatum im Format `YYYY-MM-DD`. */
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) {
    return false;
  }
  const [yStr, mStr, dStr] = value.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return false;
  }
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

/** Addiert `delta` Kalendertage zu einem ISO-Datum `YYYY-MM-DD`. */
export function addDaysIso(iso: string, delta: number): string {
  const [yStr, mStr, dStr] = iso.split('-');
  const dt = new Date(Number(yStr), Number(mStr) - 1, Number(dStr) + delta);
  return todayIso(dt);
}

/** Wandelt ein gültiges ISO-Datum `YYYY-MM-DD` in ein lokales `Date`-Objekt um. */
export function parseIsoDateLocal(iso: string): Date {
  const [yStr, mStr, dStr] = iso.split('-');
  return new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
}

export function isIsoDateInRange(
  iso: string,
  from: string,
  to: string,
): boolean {
  return iso >= from && iso <= to;
}

/** Liefert die aufeinanderfolgenden Tage des Planungszeitraums ab heute. */
export function planWindowDates(days: number, now: Date = new Date()): string[] {
  const safeDays = coercePlanDays(days);
  const start = todayIso(now);
  const dates: string[] = [];
  for (let i = 0; i < safeDays; i += 1) {
    dates.push(addDaysIso(start, i));
  }
  return dates;
}

export function isValidPlanItemId(id: unknown): id is string {
  return typeof id === 'string' && PLAN_ITEM_ID_RE.test(id);
}

let planIdSeq = 0;

/** Erzeugt eine eindeutige, Whitelist-konforme Plan-Eintrags-ID (`p[a-z0-9]{4,20}`). */
export function newPlanItemId(): string {
  planIdSeq = (planIdSeq + 1) % 46656;
  const ts = Date.now().toString(36);
  const seq = planIdSeq.toString(36).padStart(3, '0');
  const rnd = Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, '0');
  return `p${ts}${seq}${rnd}`.slice(0, 20);
}

export function isPlanSlot(value: unknown): value is PlanSlot {
  return typeof value === 'string' && PLAN_SLOT_SET.has(value);
}

export function coercePlanDays(value: unknown): number {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number.parseInt(value, 10)
        : Number.NaN;
  if (!Number.isFinite(num)) {
    return PLAN_DAYS_DEFAULT;
  }
  return Math.max(PLAN_DAYS_MIN, Math.min(PLAN_DAYS_MAX, Math.round(num)));
}

export function coercePlanPortions(value: unknown): number {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number.parseInt(value, 10)
        : Number.NaN;
  if (!Number.isFinite(num)) {
    return PLAN_PORTIONS_DEFAULT;
  }
  return Math.max(
    PLAN_PORTIONS_MIN,
    Math.min(PLAN_PORTIONS_MAX, Math.round(num)),
  );
}

export interface CoercePlanOptions {
  readonly knownRecipeIds: ReadonlySet<string>;
  readonly now?: Date;
}

/**
 * Bereinigt gespeicherte oder geladene Plandaten gemäss Prototyp `sanitizePlan` (Issue #35):
 * `days` 3–7, max. 80 Einträge, `id` nach Whitelist, Datum im Fenster heute−1 bis heute+14,
 * Slot aus Whitelist, `recipeId` nur bekannte Rezepte, Portionen ganzzahlig 1–8.
 */
export function coercePlan(raw: unknown, options: CoercePlanOptions): MealPlan {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { days: PLAN_DAYS_DEFAULT, items: [] };
  }
  const record = raw as Record<string, unknown>;
  const days = coercePlanDays(record.days);
  if (!Array.isArray(record.items)) {
    return { days, items: [] };
  }

  const today = todayIso(options.now);
  const minDate = addDaysIso(today, PLAN_DATE_PAST_DAYS);
  const maxDate = addDaysIso(today, PLAN_DATE_FUTURE_DAYS);

  const seenIds = new Set<string>();
  const items: PlanItem[] = [];

  for (const entry of record.items.slice(0, PLAN_ITEMS_MAX)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }
    const item = entry as Record<string, unknown>;
    const id = isValidPlanItemId(item.id) ? item.id : newPlanItemId();
    if (seenIds.has(id)) {
      continue;
    }
    if (
      !isValidIsoDate(item.date) ||
      !isIsoDateInRange(item.date, minDate, maxDate)
    ) {
      continue;
    }
    if (!isPlanSlot(item.slot)) {
      continue;
    }
    if (
      typeof item.recipeId !== 'string' ||
      !options.knownRecipeIds.has(item.recipeId)
    ) {
      continue;
    }
    seenIds.add(id);
    items.push({
      id,
      date: item.date,
      slot: item.slot,
      recipeId: asRecipeId(item.recipeId),
      portions: coercePlanPortions(item.portions),
    });
  }

  return { days, items };
}

/**
 * Fügt einen Planeintrag hinzu oder ersetzt einen bestehenden Eintrag:
 * - Frühstück, Mittagessen und Abendessen: höchstens ein Eintrag pro Tag und Slot (neuer ersetzt alten).
 * - Snacks: mehrere Einträge pro Tag erlaubt (nur gleiche ID wird beim Tauschen ersetzt).
 */
export function upsertPlanItem(
  plan: MealPlan,
  candidate: PlanItem,
  options: CoercePlanOptions,
): MealPlan {
  const clean = coercePlan(plan, options);
  const today = todayIso(options.now);
  const minDate = addDaysIso(today, PLAN_DATE_PAST_DAYS);
  const maxDate = addDaysIso(today, PLAN_DATE_FUTURE_DAYS);

  if (
    !isValidIsoDate(candidate.date) ||
    !isIsoDateInRange(candidate.date, minDate, maxDate) ||
    !isPlanSlot(candidate.slot) ||
    !options.knownRecipeIds.has(candidate.recipeId)
  ) {
    return clean;
  }

  const nextItem: PlanItem = {
    id: isValidPlanItemId(candidate.id) ? candidate.id : newPlanItemId(),
    date: candidate.date,
    slot: candidate.slot,
    recipeId: asRecipeId(candidate.recipeId),
    portions: coercePlanPortions(candidate.portions),
  };

  const filtered = clean.items.filter((existing) => {
    if (existing.id === nextItem.id) {
      return false;
    }
    if (
      nextItem.slot !== 'snack' &&
      existing.date === nextItem.date &&
      existing.slot === nextItem.slot
    ) {
      return false;
    }
    return true;
  });

  if (filtered.length >= PLAN_ITEMS_MAX) {
    return clean;
  }

  return {
    days: clean.days,
    items: [...filtered, nextItem],
  };
}

export function removePlanItem(plan: MealPlan, id: string): MealPlan {
  return {
    days: coercePlanDays(plan.days),
    items: plan.items.filter((it) => it.id !== id),
  };
}

export function setPlanDays(plan: MealPlan, days: number): MealPlan {
  return {
    days: coercePlanDays(days),
    items: [...plan.items],
  };
}

function hasForbiddenOwnKey(value: unknown): boolean {
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

/**
 * Erzeugt das Austausch-Bündel für `edovita-plan-einkauf.json` (Prototyp v5.10/v5.10.1).
 * Enthält ausschliesslich Plan (und ab E11 Einkaufsliste/Listenstatus) – niemals Körper-,
 * Gesundheits-, Profil- oder Einstellungsdaten (ADR-004).
 */
export function buildPlanExportBundle(
  plan: MealPlan,
  options: CoercePlanOptions,
): PlanExportBundle {
  return {
    v: 1,
    kind: PLAN_EXPORT_KIND,
    plan: coercePlan(plan, options),
    shopItems: [],
    shopStatus: {},
  };
}

export interface ParsePlanExportOptions extends CoercePlanOptions {
  readonly knownFoodIds: ReadonlySet<string>;
}

/**
 * Prüft eine `edovita-plan-einkauf.json`-Datei vollständig vor jeder Bestätigung oder Speicherung.
 * Alte Bündel ohne `plan` bleiben gültig, sofern `shopItems` gültig ist; Bündel ohne `plan` und
 * ohne `shopItems` werden abgelehnt.
 */
export function parsePlanExportBundle(
  rawText: string,
  options: ParsePlanExportOptions,
): Result<ParsedPlanExportBundle, PlanExportErrorCode> {
  if (typeof rawText !== 'string' || rawText.length > PLAN_EXPORT_MAX_BYTES) {
    return { ok: false, error: 'size' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'parse' };
  }

  if (hasForbiddenOwnKey(parsed)) {
    return { ok: false, error: 'schema' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'schema' };
  }

  const data = parsed as Record<string, unknown>;
  if (data.v !== 1 || data.kind !== PLAN_EXPORT_KIND) {
    return { ok: false, error: 'schema' };
  }

  let plan: MealPlan | null = null;
  let shopItems: PlanExportShopItem[] | null = null;
  let shopStatus: Record<string, ShopState> | null = null;

  if (data.plan !== undefined && data.plan !== null) {
    if (typeof data.plan !== 'object' || Array.isArray(data.plan)) {
      return { ok: false, error: 'plan' };
    }
    const rawPlan = data.plan as Record<string, unknown>;
    if (rawPlan.days !== undefined && rawPlan.days !== null) {
      if (
        typeof rawPlan.days !== 'number' ||
        !Number.isFinite(rawPlan.days) ||
        !Number.isInteger(rawPlan.days) ||
        rawPlan.days < PLAN_DAYS_MIN ||
        rawPlan.days > PLAN_DAYS_MAX
      ) {
        return { ok: false, error: 'days' };
      }
    }
    if (rawPlan.items !== undefined && rawPlan.items !== null) {
      if (!Array.isArray(rawPlan.items)) {
        return { ok: false, error: 'plan' };
      }
      if (rawPlan.items.length > PLAN_ITEMS_MAX) {
        return { ok: false, error: 'plan-count' };
      }
      const today = todayIso(options.now);
      const minDate = addDaysIso(today, PLAN_DATE_PAST_DAYS);
      const maxDate = addDaysIso(today, PLAN_DATE_FUTURE_DAYS);
      const seenIds = new Set<string>();

      for (const entry of rawPlan.items) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          return { ok: false, error: 'plan' };
        }
        const it = entry as Record<string, unknown>;
        if (!isValidPlanItemId(it.id) || seenIds.has(it.id)) {
          return { ok: false, error: 'plan-id' };
        }
        seenIds.add(it.id);

        if (
          !isValidIsoDate(it.date) ||
          !isIsoDateInRange(it.date, minDate, maxDate)
        ) {
          return { ok: false, error: 'plan-date' };
        }
        if (!isPlanSlot(it.slot)) {
          return { ok: false, error: 'plan-slot' };
        }
        if (
          typeof it.recipeId !== 'string' ||
          !options.knownRecipeIds.has(it.recipeId)
        ) {
          return { ok: false, error: 'plan-recipe' };
        }
        if (it.portions !== undefined && it.portions !== null) {
          if (
            typeof it.portions !== 'number' ||
            !Number.isFinite(it.portions) ||
            !Number.isInteger(it.portions) ||
            it.portions < PLAN_PORTIONS_MIN ||
            it.portions > PLAN_PORTIONS_MAX
          ) {
            return { ok: false, error: 'plan-portions' };
          }
        }
      }
    }
    plan = coercePlan(rawPlan, options);
  }

  if (data.shopItems !== undefined && data.shopItems !== null) {
    if (!Array.isArray(data.shopItems) || data.shopItems.length > 120) {
      return { ok: false, error: 'shop-count' };
    }
    const seenShop = new Set<string>();
    const cleanShop: PlanExportShopItem[] = [];

    for (const entry of data.shopItems) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return { ok: false, error: 'shop' };
      }
      const it = entry as Record<string, unknown>;
      if (typeof it.id !== 'string' || !options.knownFoodIds.has(it.id)) {
        return { ok: false, error: 'shop-id' };
      }
      const unit =
        it.unit === '' || it.unit === undefined || it.unit === null
          ? ''
          : typeof it.unit === 'string'
            ? it.unit
            : null;
      if (unit === null || !EXPORT_SHOP_UNIT_SET.has(unit)) {
        return { ok: false, error: 'shop-unit' };
      }
      const key = `${it.id}\0${unit}`;
      if (seenShop.has(key)) {
        return { ok: false, error: 'shop-dup' };
      }
      seenShop.add(key);

      for (const qtyField of [it.qtyPlan, it.qtyExtra, it.qtyHave]) {
        if (qtyField !== undefined && qtyField !== null) {
          if (
            typeof qtyField !== 'number' ||
            !Number.isFinite(qtyField) ||
            qtyField < 0 ||
            qtyField > 1e6
          ) {
            return { ok: false, error: 'shop-qty' };
          }
        }
      }

      const recipesPlan: string[] = [];
      if (it.recipesPlan !== undefined && it.recipesPlan !== null) {
        if (!Array.isArray(it.recipesPlan) || it.recipesPlan.length > 20) {
          return { ok: false, error: 'shop-rec' };
        }
        for (const rId of it.recipesPlan) {
          if (typeof rId !== 'string' || !options.knownRecipeIds.has(rId)) {
            return { ok: false, error: 'shop-rec' };
          }
          recipesPlan.push(rId);
        }
      }

      const recipesExtra: string[] = [];
      if (it.recipesExtra !== undefined && it.recipesExtra !== null) {
        if (!Array.isArray(it.recipesExtra) || it.recipesExtra.length > 20) {
          return { ok: false, error: 'shop-rec' };
        }
        for (const rId of it.recipesExtra) {
          if (typeof rId !== 'string' || !options.knownRecipeIds.has(rId)) {
            return { ok: false, error: 'shop-rec' };
          }
          recipesExtra.push(rId);
        }
      }

      cleanShop.push({
        id: it.id,
        unit,
        qtyPlan: typeof it.qtyPlan === 'number' ? it.qtyPlan : 0,
        qtyExtra: typeof it.qtyExtra === 'number' ? it.qtyExtra : 0,
        qtyHave: typeof it.qtyHave === 'number' ? it.qtyHave : 0,
        recipesPlan,
        recipesExtra,
        grp: typeof it.grp === 'string' ? it.grp : undefined,
      });
    }
    shopItems = cleanShop;
  }

  if (data.shopStatus !== undefined && data.shopStatus !== null) {
    if (typeof data.shopStatus !== 'object' || Array.isArray(data.shopStatus)) {
      return { ok: false, error: 'status' };
    }
    const rawStatus = data.shopStatus as Record<string, unknown>;
    const cleanStatus: Record<string, ShopState> = {};
    for (const key of Object.keys(rawStatus)) {
      if (!isSafeRecordKey(key)) {
        return { ok: false, error: 'status' };
      }
      const foodId = key.split('|')[0] ?? '';
      if (!options.knownFoodIds.has(foodId)) {
        continue;
      }
      const val = rawStatus[key];
      if (typeof val === 'string' && SHOP_STATE_SET.has(val)) {
        cleanStatus[key] = val as ShopState;
      }
    }
    shopStatus = cleanStatus;
  }

  if (plan === null && shopItems === null) {
    return { ok: false, error: 'empty' };
  }

  return {
    ok: true,
    value: {
      plan,
      shopItems,
      shopStatus,
    },
  };
}
