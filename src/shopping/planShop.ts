import { getRecipe, listFoods, listRecipes } from '../catalog/index.ts';
import {
  SHOP_STATES,
  coercePlanPortions,
  isSafeRecordKey,
  newPlanItemId,
  parseIsoDateLocal,
  planWindowDates,
  recomputeShoppingItem,
  refreshPlanQuantitiesInDomain,
  upsertPlanItem,
  type FoodId,
  type ImportShopItem,
  type MealPlan,
  type PlanItem,
  type PlanSlot,
  type Recipe,
  type RecipeId,
  type ShopState,
  type ShoppingItem,
  type Unit,
} from '../domain/index.ts';

const SHOP_STATE_SET: ReadonlySet<string> = new Set<ShopState>(SHOP_STATES);
const SAFE_QR_ID_RE = /^[a-zA-Z0-9_.-]+$/;

function roundTenth(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function cloneItem(item: ShoppingItem): ShoppingItem {
  return {
    ...item,
    fromRecipes: [...item.fromRecipes],
    ...(item.recipesPlan ? { recipesPlan: [...item.recipesPlan] } : {}),
    ...(item.recipesExtra ? { recipesExtra: [...item.recipesExtra] } : {}),
    ...(item.recipeAmounts ? { recipeAmounts: { ...item.recipeAmounts } } : {}),
  };
}

export interface PlanIngredientEntry {
  readonly food: FoodId;
  readonly qty: number;
  readonly unit: Unit;
  readonly recipeId: RecipeId;
}

/**
 * Skaliert alle Zutaten eines Plan-Eintrags (`amount * portions / recipe.servings`, Prototyp `ingsForPlanEntry`).
 */
export function ingsForPlanEntry(
  entry: Pick<PlanItem, 'recipeId' | 'portions'>,
  lookupRecipe: (id: string) => Recipe | undefined = getRecipe,
): PlanIngredientEntry[] {
  const recipe = lookupRecipe(entry.recipeId);
  if (!recipe || !Number.isFinite(recipe.servings) || recipe.servings <= 0) {
    return [];
  }
  const factor = entry.portions / recipe.servings;
  const out: PlanIngredientEntry[] = [];
  for (const ing of recipe.ingredients) {
    const qty = roundTenth(ing.amount * factor);
    if (!Number.isFinite(qty) || qty <= 0) {
      continue;
    }
    out.push({
      food: ing.food,
      qty,
      unit: ing.unit,
      recipeId: entry.recipeId,
    });
  }
  return out;
}

/**
 * Fügt ein Bündel skalierter Zutaten unveränderlich in Plan- oder Extra-Anteile ein (Prototyp `addIngBundle`).
 */
export function addIngredientBundle(
  currentItems: readonly ShoppingItem[],
  entries: readonly PlanIngredientEntry[],
  dest: 'plan' | 'extra',
  nowIso: string = new Date().toISOString(),
): ShoppingItem[] {
  const next = currentItems.map(cloneItem);

  for (const entry of entries) {
    let target = next.find(
      (it) => it.food === entry.food && it.unit === entry.unit,
    );
    if (!target) {
      target = {
        id: `${entry.food}__${entry.unit}`,
        food: entry.food,
        amount: 0,
        unit: entry.unit,
        qtyPlan: 0,
        qtyExtra: 0,
        qtyHave: 0,
        state: 'open',
        fromRecipes: [],
        recipesPlan: [],
        recipesExtra: [],
        addedAt: nowIso,
      };
      next.push(target);
    } else if (target.qtyPlan === undefined && target.qtyExtra === undefined) {
      target.qtyPlan = 0;
      target.qtyExtra =
        typeof target.amount === 'number' && Number.isFinite(target.amount)
          ? roundTenth(target.amount)
          : 0;
      target.recipesPlan = [];
      target.recipesExtra = [...target.fromRecipes];
    }

    if (dest === 'plan') {
      target.qtyPlan = roundTenth((target.qtyPlan ?? 0) + entry.qty);
      const rp = target.recipesPlan ?? [];
      if (!rp.includes(entry.recipeId)) {
        rp.push(entry.recipeId);
      }
      target.recipesPlan = rp;
    } else {
      target.qtyExtra = roundTenth((target.qtyExtra ?? 0) + entry.qty);
      const re = target.recipesExtra ?? [];
      if (!re.includes(entry.recipeId)) {
        re.push(entry.recipeId);
      }
      target.recipesExtra = re;

      const amounts: Record<string, number> = target.recipeAmounts
        ? { ...target.recipeAmounts }
        : {};
      const prevAmt = Object.hasOwn(amounts, entry.recipeId)
        ? (amounts[entry.recipeId] ?? 0)
        : 0;
      amounts[entry.recipeId] = roundTenth(prevAmt + entry.qty);
      target.recipeAmounts = amounts;
    }

    const idx = next.indexOf(target);
    next[idx] = recomputeShoppingItem(target);
  }

  return next;
}

export interface RefreshPlanShopOptions {
  readonly lookupRecipe?: (id: string) => Recipe | undefined;
  readonly now?: Date;
  readonly nowIso?: string;
}

/**
 * Aktualisiert alle Plan-Anteile der Einkaufsliste aus dem aktuellen Plan-Zeitraum,
 * erhält `qtyExtra`/`recipesExtra` sowie `customLabel`-Artikel und deckelt `qtyHave` (Prototyp `refreshPlanQuantities`).
 */
export function refreshPlanQuantities(
  currentItems: readonly ShoppingItem[],
  plan: MealPlan,
  options: RefreshPlanShopOptions = {},
): ShoppingItem[] {
  return refreshPlanQuantitiesInDomain(
    currentItems,
    plan,
    options.lookupRecipe ?? getRecipe,
    {
      now: options.now,
      nowIso: options.nowIso,
    },
  );
}

/**
 * Ziel-Slots für automatische Einplanung nach Mahlzeit-Art (Prototyp `slotTargetsFor` v5.7):
 * - `breakfast` → `['breakfast']`
 * - `snack` → `['snack']`
 * - `lunch` / `dinner` → `['lunch', 'dinner']`
 */
export function slotTargetsFor(
  recipe: Pick<Recipe, 'meal'>,
): readonly PlanSlot[] {
  if (recipe.meal === 'breakfast') return ['breakfast'];
  if (recipe.meal === 'snack') return ['snack'];
  return ['lunch', 'dinner'];
}

export interface FreePlanSlot {
  readonly date: string;
  readonly slot: PlanSlot;
}

/**
 * Sucht Tag für Tag ab heute im aktuellen Plan-Zeitraum den ersten freien passenden Slot
 * (Prototyp `findNextFreeSlot` v5.7). Gibt `null` zurück, wenn alle passenden Slots belegt sind.
 */
export function findNextFreeSlot(
  plan: MealPlan,
  recipe: Pick<Recipe, 'meal'>,
  now: Date = new Date(),
): FreePlanSlot | null {
  const targets = slotTargetsFor(recipe);
  const dates = planWindowDates(plan.days, now);

  for (const date of dates) {
    for (const slot of targets) {
      const occupied = plan.items.some(
        (it) => it.date === date && it.slot === slot,
      );
      if (!occupied) {
        return { date, slot };
      }
    }
  }
  return null;
}

/**
 * Formatiert den kurzen Wochentag eines ISO-Datums über `Intl` ohne Abschluss-Punkt (Prototyp `weekdayShort`).
 */
export function weekdayShort(
  isoDate: string,
  fmtDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string,
): string {
  try {
    const label = fmtDate(parseIsoDateLocal(isoDate), { weekday: 'short' });
    return (label || isoDate).replace(/\.$/, '');
  } catch {
    return isoDate;
  }
}

/**
 * Kurze Zeitangabe für Toasts & ⓘ-Sheet (`{Wochentag kurz} {Mahlzeit kurz}`, Prototyp `planWhenLabel`).
 */
export function planWhenLabel(
  isoDate: string,
  slot: PlanSlot,
  fmtDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string,
  slotShortLabel: (slot: PlanSlot) => string,
): string {
  return `${weekdayShort(isoDate, fmtDate)} ${slotShortLabel(slot)}`;
}

export interface ShopAndPlanSnapshot {
  readonly plan: MealPlan;
  readonly items: ShoppingItem[];
}

/**
 * Erstellt eine tiefe lokale In-Memory-Kopie von Plan und Einkaufsliste für «Rückgängig» (Prototyp `snapshotShopAndPlan`).
 */
export function snapshotShopAndPlan(
  plan: MealPlan,
  items: readonly ShoppingItem[],
): ShopAndPlanSnapshot {
  return {
    plan: {
      days: plan.days,
      items: plan.items.map((it) => ({ ...it })),
    },
    items: items.map(cloneItem),
  };
}

/**
 * Stellt eine tiefe Kopie aus einem lokalen Snapshot unveränderlich her (Prototyp `restoreShopAndPlan`).
 */
export function restoreShopAndPlan(
  snap: ShopAndPlanSnapshot,
): ShopAndPlanSnapshot {
  return snapshotShopAndPlan(snap.plan, snap.items);
}

/**
 * Ergänzt fehlende Plan-Zutaten für bereits eingeplante Einträge eines Rezepts auf der Einkaufsliste
 * (Prototyp `ensurePlanRecipeOnList`).
 */
export function ensurePlanRecipeOnList(
  currentItems: readonly ShoppingItem[],
  planItems: readonly PlanItem[],
  options: RefreshPlanShopOptions = {},
): { readonly items: ShoppingItem[]; readonly added: boolean } {
  let next = currentItems.map(cloneItem);
  let added = false;
  const lookup = options.lookupRecipe ?? getRecipe;

  for (const pitem of planItems) {
    const alreadyOnList = next.some((s) =>
      (s.recipesPlan ?? []).includes(pitem.recipeId),
    );
    if (!alreadyOnList) {
      next = addIngredientBundle(
        next,
        ingsForPlanEntry(pitem, lookup),
        'plan',
        options.nowIso,
      );
      added = true;
    }
  }

  return { items: next, added };
}

export type AddRecipeToListOutcome = 'already' | 'planned' | 'noslot';

export interface AddRecipeToListResult {
  readonly outcome: AddRecipeToListOutcome;
  readonly plan: MealPlan;
  readonly items: ShoppingItem[];
  readonly plannedItem?: PlanItem;
  readonly snapshot: ShopAndPlanSnapshot;
  readonly canUndo: boolean;
}

export interface AddRecipeToListOptions extends RefreshPlanShopOptions {
  readonly portions?: number;
  readonly knownRecipeIds?: ReadonlySet<string>;
}

/**
 * Reine Umsetzung von «Zur Einkaufsliste hinzufügen» mit automatischer Einplanung (Prototyp `addRecipeToListAndMaybePlan`, E11):
 * - Fall A: Rezept bereits im Plan → fehlende Plan-Zutaten ergänzen (`already`, ohne Rückgängig)
 * - Fall B: Freier passender Slot im Zeitraum → einplanen + Zutaten als Plan-Anteil (`planned`, mit Rückgängig)
 * - Fall C: Kein passender Slot frei → Zutaten als Extra-Anteil auf die Liste (`noslot`, mit Rückgängig)
 */
export function addRecipeToListAndMaybePlan(
  plan: MealPlan,
  currentItems: readonly ShoppingItem[],
  recipe: Recipe,
  options: AddRecipeToListOptions = {},
): AddRecipeToListResult {
  const now = options.now ?? new Date();
  const nowIso = options.nowIso ?? now.toISOString();
  const lookup = options.lookupRecipe ?? getRecipe;
  const knownRecipeIds =
    options.knownRecipeIds ?? new Set<string>(listRecipes().map((r) => r.id));
  const portions = coercePlanPortions(options.portions ?? recipe.servings);
  const snapshot = snapshotShopAndPlan(plan, currentItems);

  const existing = plan.items.filter((it) => it.recipeId === recipe.id);
  if (existing.length > 0) {
    const ensured = ensurePlanRecipeOnList(currentItems, existing, {
      lookupRecipe: lookup,
      now,
      nowIso,
    });
    return {
      outcome: 'already',
      plan,
      items: ensured.items,
      snapshot,
      canUndo: false,
    };
  }

  const freeSlot = findNextFreeSlot(plan, recipe, now);
  if (!freeSlot) {
    const extraEntries = ingsForPlanEntry(
      { recipeId: recipe.id, portions },
      lookup,
    );
    const nextItems = addIngredientBundle(
      currentItems,
      extraEntries,
      'extra',
      nowIso,
    );
    return {
      outcome: 'noslot',
      plan,
      items: nextItems,
      snapshot,
      canUndo: true,
    };
  }

  const candidate: PlanItem = {
    id: newPlanItemId(),
    date: freeSlot.date,
    slot: freeSlot.slot,
    recipeId: recipe.id,
    portions,
  };
  const nextPlan = upsertPlanItem(plan, candidate, { knownRecipeIds, now });
  const inserted = nextPlan.items.some((it) => it.id === candidate.id);
  if (!inserted) {
    const extraEntries = ingsForPlanEntry(
      { recipeId: recipe.id, portions },
      lookup,
    );
    const nextItems = addIngredientBundle(
      currentItems,
      extraEntries,
      'extra',
      nowIso,
    );
    return {
      outcome: 'noslot',
      plan,
      items: nextItems,
      snapshot,
      canUndo: true,
    };
  }

  const planEntries = ingsForPlanEntry(candidate, lookup);
  const nextItems = addIngredientBundle(
    currentItems,
    planEntries,
    'plan',
    nowIso,
  );
  return {
    outcome: 'planned',
    plan: nextPlan,
    items: nextItems,
    plannedItem: candidate,
    snapshot,
    canUndo: true,
  };
}

/**
 * Filtert geprüfte QR-Import-Artikel gegen die aktuelle Einkaufsliste (inkl. Plan-Zeilen)
 * und den Lebensmittel-Katalog (Prototyp `resolveQrImportItems`, E11).
 * Unbekannte IDs werden weder in der Vorschau angezeigt noch übernommen.
 */
export function resolveQrImportItems(
  imported: readonly ImportShopItem[],
  currentList: readonly ShoppingItem[],
  knownFoodIds?: ReadonlySet<string>,
): ImportShopItem[] {
  const foodIds =
    knownFoodIds ?? new Set<string>(listFoods().map((food) => food.id));
  const out: ImportShopItem[] = [];
  const seen = new Set<string>();

  for (const item of imported) {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !SAFE_QR_ID_RE.test(item.id) ||
      !isSafeRecordKey(item.id) ||
      seen.has(item.id)
    ) {
      continue;
    }
    if (!SHOP_STATE_SET.has(item.st)) {
      continue;
    }
    const baseFoodId = item.id.includes('__')
      ? (item.id.split('__')[0] ?? item.id)
      : item.id;
    const knownInCatalog = foodIds.has(baseFoodId);
    const matchesLiveRow = currentList.some(
      (row) => row.id === item.id || row.food === baseFoodId,
    );
    if (!knownInCatalog && !matchesLiveRow) {
      continue;
    }
    seen.add(item.id);
    out.push({ ...item });
  }

  return out;
}
