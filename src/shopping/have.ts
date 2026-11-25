import { getRecipe } from '../catalog/index.ts';
import {
  coerceQtyHave,
  computeEffectiveNeed,
  planWindowDates,
  type FoodGroup,
  type MealPlan,
  type PlanSlot,
  type Recipe,
  type RecipeId,
  type ShopState,
  type ShoppingItem,
  type Unit,
} from '../domain/index.ts';

function roundTenth(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

/**
 * Liefert den aktuellen effektiven Bedarf eines Artikels (Prototyp `shopQtyOf` v5.7–v5.10.1),
 * sofern positiv und mit Einheit, sonst `null`. Dieselbe Rezeptquelle wird nicht doppelt gezählt.
 */
export function shopNeedOf(
  item: Pick<
    ShoppingItem,
    'amount' | 'unit' | 'qtyPlan' | 'qtyExtra' | 'recipesPlan' | 'recipesExtra'
  >,
): number | null {
  return computeEffectiveNeed(item);
}

/**
 * Liefert die sicher normalisierte und auf den Bedarf gedeckelte Vorratsmenge (`qtyHave`, ≥ 0).
 */
export function shopHaveOf(
  item: Pick<
    ShoppingItem,
    | 'amount'
    | 'unit'
    | 'qtyHave'
    | 'qtyPlan'
    | 'qtyExtra'
    | 'recipesPlan'
    | 'recipesExtra'
  >,
): number {
  const need = shopNeedOf(item);
  return coerceQtyHave(item.qtyHave, need ?? undefined);
}

/**
 * Deckelt `qtyHave` unveränderlich auf den aktuellen Bedarf (Prototyp `capHaveToNeed` v5.9).
 */
export function capHaveToNeed(item: ShoppingItem): ShoppingItem {
  const need = shopNeedOf(item);
  if (item.qtyHave === undefined) {
    return item;
  }
  const capped = coerceQtyHave(item.qtyHave, need ?? undefined);
  return {
    ...item,
    qtyHave: capped,
  };
}

/**
 * Berechnet die verbleibende Kaufmenge (`max(0, need - have)`).
 */
export function shopBuyQty(
  item: Pick<
    ShoppingItem,
    | 'amount'
    | 'unit'
    | 'qtyHave'
    | 'qtyPlan'
    | 'qtyExtra'
    | 'recipesPlan'
    | 'recipesExtra'
  >,
): number | null {
  const need = shopNeedOf(item);
  if (need === null) {
    return null;
  }
  return Math.max(0, roundTenth(need - shopHaveOf(item)));
}

/**
 * Wahr, wenn eine echte Teilmenge bereits zu Hause vorhanden ist (`0 < qtyHave < need`).
 */
export function isPartialHave(
  item: Pick<
    ShoppingItem,
    | 'amount'
    | 'unit'
    | 'qtyHave'
    | 'qtyPlan'
    | 'qtyExtra'
    | 'recipesPlan'
    | 'recipesExtra'
  >,
): boolean {
  const need = shopNeedOf(item);
  const have = shopHaveOf(item);
  return need !== null && need > 0 && have > 0 && have < need;
}

/**
 * Wahr, wenn die vorhandene Menge den gesamten Bedarf deckt (oder bei Artikeln ohne Menge `qtyHave > 0`).
 */
export function isHaveAll(
  item: Pick<
    ShoppingItem,
    | 'amount'
    | 'unit'
    | 'qtyHave'
    | 'qtyPlan'
    | 'qtyExtra'
    | 'recipesPlan'
    | 'recipesExtra'
  >,
): boolean {
  const need = shopNeedOf(item);
  const have = shopHaveOf(item);
  if (need !== null && need > 0) {
    return have >= need;
  }
  return have > 0;
}

/**
 * Wirksamer Anzeige- und Speicherzustand eines Artikels gemäss Prototyp `stOfItem` (v5.9):
 * Deckt `qtyHave` den Bedarf, gilt der Artikel als `home`; Teilmengen bleiben `open` (oder `cart`).
 */
export function effectiveShopState(
  item: Pick<
    ShoppingItem,
    | 'amount'
    | 'unit'
    | 'qtyHave'
    | 'qtyPlan'
    | 'qtyExtra'
    | 'recipesPlan'
    | 'recipesExtra'
    | 'state'
  >,
): ShopState {
  if (isHaveAll(item)) {
    return 'home';
  }
  return item.state;
}

/**
 * Schrittweite für Schieber und Stepper im «Hab ich»-Sheet, 1:1 gemäss Prototyp `haveStepOf` (v5.9).
 */
export function haveStepOf(need: number, unit?: Unit | 'bottle' | string): number {
  if (unit === 'pc' || unit === 'bottle') {
    return need >= 5 ? 1 : need % 1 !== 0 ? 0.5 : 1;
  }
  if (unit === 'tbsp' || unit === 'tsp') {
    return 0.5;
  }
  if (unit === 'pinch') {
    return 1;
  }
  if (need >= 500) return 50;
  if (need >= 200) return 25;
  if (need >= 50) return 10;
  if (need >= 20) return 5;
  return 1;
}

/**
 * Rastet und begrenzt einen Eingabewert auf `[0, need]` anhand der Einheiten-Schrittweite
 * (1:1 gemäss Prototyp `snapHaveQty` v5.9).
 */
export function snapHaveQty(
  value: number,
  need: number,
  unit?: Unit | 'bottle' | string,
): number {
  if (!Number.isFinite(need) || need <= 0) {
    return 0;
  }
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  if (value >= need) {
    return need;
  }
  const step = haveStepOf(need, unit);
  let snapped = Math.round(value / step) * step;
  if (snapped > need) snapped = need;
  if (snapped < 0) snapped = 0;
  if (unit === 'g' || unit === 'ml') {
    snapped = need >= 10 ? Math.round(snapped) : roundTenth(snapped);
  } else {
    snapped = roundTenth(snapped);
  }
  return Math.min(snapped, need);
}

export interface ApplyHaveOptions {
  readonly all: boolean;
  readonly qtyHave?: number;
}

/**
 * Übernimmt die Auswahl aus dem «Hab ich»-Sheet (Prototyp `applyShopHave` v5.9):
 * - `all: true` → `qtyHave = need` (oder `1` ohne Menge), `state = 'home'`
 * - Teilmenge → gerastet & gedeckelt auf Bedarf; deckt sie den Bedarf → `home`, sonst bei bisherigem `home` → `open`.
 */
export function applyHave(
  list: readonly ShoppingItem[],
  id: string,
  options: ApplyHaveOptions,
): ShoppingItem[] {
  return list.map((raw) => {
    if (raw.id !== id) {
      return raw;
    }
    const item: ShoppingItem = {
      ...raw,
      fromRecipes: [...raw.fromRecipes],
      ...(raw.recipesPlan ? { recipesPlan: [...raw.recipesPlan] } : {}),
      ...(raw.recipesExtra ? { recipesExtra: [...raw.recipesExtra] } : {}),
      ...(raw.recipeAmounts ? { recipeAmounts: { ...raw.recipeAmounts } } : {}),
    };
    const need = shopNeedOf(item);

    if (options.all) {
      item.qtyHave = need !== null && need > 0 ? need : 1;
    } else {
      item.qtyHave =
        need !== null && need > 0
          ? snapHaveQty(options.qtyHave ?? 0, need, item.unit)
          : 0;
    }

    if (isHaveAll(item)) {
      item.state = 'home';
    } else if (item.state === 'home') {
      item.state = 'open';
    }

    return item;
  });
}

/**
 * Setzt Vorratsmenge und Zustand eines Artikels zurück auf «offen» ohne Vorrat (Prototyp `resetShopHave` v5.9).
 */
export function resetHave(
  list: readonly ShoppingItem[],
  id: string,
): ShoppingItem[] {
  return list.map((raw) => {
    if (raw.id !== id) {
      return raw;
    }
    return {
      ...raw,
      fromRecipes: [...raw.fromRecipes],
      ...(raw.recipesPlan ? { recipesPlan: [...raw.recipesPlan] } : {}),
      ...(raw.recipesExtra ? { recipesExtra: [...raw.recipesExtra] } : {}),
      ...(raw.recipeAmounts ? { recipeAmounts: { ...raw.recipeAmounts } } : {}),
      qtyHave: 0,
      state: 'open',
    };
  });
}

export interface ShopSourceEntry {
  readonly recipeId: RecipeId;
  readonly amount: number | null;
  readonly unit: Unit | null;
  readonly when?: string;
}

export interface ShopSourceSummary {
  readonly lines: readonly ShopSourceEntry[];
  readonly sumAmount: number | null;
  readonly unit: Unit | null;
}

export interface BuildSourceSummaryOptions {
  readonly plan?: MealPlan;
  readonly now?: Date;
  readonly formatWhen?: (dateIso: string, slot: PlanSlot) => string;
  readonly lookupRecipe?: (id: string) => Recipe | undefined;
}

/**
 * Erzeugt die Rezept-Herkunftszeilen und die berechnete Summe für das ⓘ-Sheet (Prototyp v5.9 + E11 `shopSourceLines`).
 * Ist ein Essensplan übergeben, werden zuerst alle konkreten Plan-Slots im aktuellen Zeitraum (inkl. Mehrfach-Einplanungen)
 * mit `when` aufgeführt, danach allfällige übrige Extra-Rezepte ohne Slot.
 */
export function buildSourceSummary(
  item: ShoppingItem,
  options: BuildSourceSummaryOptions = {},
): ShopSourceSummary {
  const unit = item.unit ?? null;
  const lines: ShopSourceEntry[] = [];
  const seenInPlan = new Set<RecipeId>();
  const lookup = options.lookupRecipe ?? getRecipe;

  if (options.plan) {
    const dates = new Set(planWindowDates(options.plan.days, options.now));
    for (const pitem of options.plan.items) {
      if (!dates.has(pitem.date)) {
        continue;
      }
      const recipe = lookup(pitem.recipeId);
      if (!recipe || !Number.isFinite(recipe.servings) || recipe.servings <= 0) {
        continue;
      }
      const factor = pitem.portions / recipe.servings;
      for (const ing of recipe.ingredients) {
        if (ing.food !== item.food || ing.unit !== unit) {
          continue;
        }
        const amount = roundTenth(ing.amount * factor);
        lines.push({
          recipeId: pitem.recipeId,
          amount: Number.isFinite(amount) && amount > 0 ? amount : null,
          unit,
          when: options.formatWhen
            ? options.formatWhen(pitem.date, pitem.slot)
            : undefined,
        });
        seenInPlan.add(pitem.recipeId);
      }
    }
  }

  const allRecipeIds: RecipeId[] = [];
  for (const rid of [
    ...(item.recipesPlan ?? []),
    ...(item.recipesExtra ?? []),
    ...item.fromRecipes,
  ]) {
    if (!allRecipeIds.includes(rid)) {
      allRecipeIds.push(rid);
    }
  }

  for (const recipeId of allRecipeIds) {
    if (seenInPlan.has(recipeId)) {
      continue;
    }
    const rawAmt =
      item.recipeAmounts && Object.hasOwn(item.recipeAmounts, recipeId)
        ? item.recipeAmounts[recipeId]
        : undefined;
    let amount: number | null =
      typeof rawAmt === 'number' && Number.isFinite(rawAmt) && rawAmt > 0
        ? rawAmt
        : null;
    if (amount === null) {
      const recipe = lookup(recipeId);
      const ing = recipe?.ingredients.find(
        (entry) => entry.food === item.food && entry.unit === unit,
      );
      if (ing && Number.isFinite(ing.amount) && ing.amount > 0) {
        amount = roundTenth(ing.amount);
      }
    }
    lines.push({ recipeId, amount, unit });
  }

  if (lines.length === 0) {
    return { lines: [], sumAmount: null, unit };
  }

  let canSum = unit !== null;
  let sum = 0;
  for (const line of lines) {
    if (line.amount === null || line.unit !== unit) {
      canSum = false;
      break;
    }
    sum += line.amount;
  }

  const fallbackNeed = shopNeedOf(item);
  const sumAmount = canSum ? roundTenth(sum) : fallbackNeed;
  return {
    lines,
    sumAmount,
    unit,
  };
}

/**
 * Sinnvolle Standardmenge pro Lebensmittelgruppe beim manuellen Hinzufügen aus dem Katalog,
 * damit Teilmengen («Hab ich»-Sheet) direkt ohne Zusatzschritt nutzbar sind.
 */
export function defaultCatalogAmountForGroup(
  group: FoodGroup,
): { readonly amount: number; readonly unit: Unit } {
  switch (group) {
    case 'drinks':
      return { amount: 500, unit: 'ml' };
    case 'fruit':
      return { amount: 2, unit: 'pc' };
    case 'spice':
      return { amount: 10, unit: 'g' };
    default:
      return { amount: 200, unit: 'g' };
  }
}
