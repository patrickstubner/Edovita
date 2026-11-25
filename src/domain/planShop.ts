import { coerceQtyHave } from './coerce.ts';
import {
  PLAN_EXPORT_KIND,
  planWindowDates,
  type MealPlan,
  type ParsedPlanExportBundle,
  type PlanExportBundle,
  type PlanExportShopItem,
} from './plan.ts';
import {
  UNITS,
  asFoodId,
  asRecipeId,
  type FoodGroup,
  type FoodId,
  type Recipe,
  type RecipeId,
  type ShopState,
  type ShoppingItem,
  type Unit,
} from './types.ts';

const UNIT_SET: ReadonlySet<string> = new Set<Unit>(UNITS);

function roundTenth(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function uniqueRecipes(list: readonly RecipeId[]): RecipeId[] {
  const out: RecipeId[] = [];
  for (const id of list) {
    if (!out.includes(id)) {
      out.push(id);
    }
  }
  return out;
}

function cloneShoppingItem(item: ShoppingItem): ShoppingItem {
  return {
    ...item,
    fromRecipes: [...item.fromRecipes],
    ...(item.recipesPlan ? { recipesPlan: [...item.recipesPlan] } : {}),
    ...(item.recipesExtra ? { recipesExtra: [...item.recipesExtra] } : {}),
    ...(item.recipeAmounts ? { recipeAmounts: { ...item.recipeAmounts } } : {}),
  };
}

/**
 * Effektiver Bedarf eines Artikels gemäss Prototyp `shopQtyOf` (E11 / v5.7–v5.10.1):
 * - Ohne Einheit → `null`
 * - Wenn `qtyPlan`/`qtyExtra` geführt werden: Rezeptquellen, die sowohl in `recipesPlan`
 *   als auch in `recipesExtra` stehen, werden NICHT doppelt gezählt (wenn alle Extra-Rezepte
 *   bereits im Plan sind, zählt ausschliesslich `qtyPlan`).
 * - Legacy-/Katalog-Artikel ohne `qtyPlan`/`qtyExtra`: verwenden `amount`.
 */
export function computeEffectiveNeed(
  item: Pick<
    ShoppingItem,
    'amount' | 'unit' | 'qtyPlan' | 'qtyExtra' | 'recipesPlan' | 'recipesExtra'
  >,
): number | null {
  if (!item.unit) {
    return null;
  }

  const hasSplit = item.qtyPlan !== undefined || item.qtyExtra !== undefined;
  if (hasSplit) {
    const qtyPlan =
      typeof item.qtyPlan === 'number' && Number.isFinite(item.qtyPlan) && item.qtyPlan > 0
        ? item.qtyPlan
        : 0;
    const qtyExtra =
      typeof item.qtyExtra === 'number' && Number.isFinite(item.qtyExtra) && item.qtyExtra > 0
        ? item.qtyExtra
        : 0;
    const planSet = new Set<string>(item.recipesPlan ?? []);
    const extraRecipes = item.recipesExtra ?? [];
    const onlyExtra = extraRecipes.filter((id) => !planSet.has(id));

    if (extraRecipes.length > 0 && onlyExtra.length === 0) {
      return qtyPlan > 0 ? roundTenth(qtyPlan) : null;
    }

    const total = roundTenth(qtyPlan + qtyExtra);
    return total > 0 ? total : null;
  }

  if (
    typeof item.amount === 'number' &&
    Number.isFinite(item.amount) &&
    item.amount > 0
  ) {
    return roundTenth(item.amount);
  }
  return null;
}

/**
 * Synchronisiert `amount`, `fromRecipes`, gedeckeltes `qtyHave` und `state` (`home` bei `qtyHave >= need`)
 * auf Basis von `qtyPlan`/`qtyExtra`/`recipesPlan`/`recipesExtra` (E11).
 */
export function recomputeShoppingItem(raw: ShoppingItem): ShoppingItem {
  const item = cloneShoppingItem(raw);

  if (item.recipesPlan !== undefined || item.recipesExtra !== undefined) {
    item.fromRecipes = uniqueRecipes([
      ...(item.recipesPlan ?? []),
      ...(item.recipesExtra ?? []),
    ]);
  }

  const need = computeEffectiveNeed(item);
  if (need !== null) {
    item.amount = need;
  } else if (item.qtyPlan !== undefined || item.qtyExtra !== undefined) {
    delete item.amount;
  }

  if (item.qtyHave !== undefined) {
    const capped = coerceQtyHave(item.qtyHave, need ?? undefined);
    item.qtyHave = capped;
    if (need !== null && need > 0 && capped >= need) {
      item.state = 'home';
    }
  }

  return item;
}

export interface RefreshPlanQuantitiesOptions {
  readonly now?: Date;
  readonly nowIso?: string;
}

/**
 * Berechnet alle Plan-Anteile der Einkaufsliste neu aus den Plan-Einträgen im aktuellen
 * Planungszeitraum (`planWindowDates(plan.days)`), behält `qtyExtra`/`recipesExtra`,
 * manuelle Katalog-Artikel und `customLabel`-QR-Einträge bei, entfernt verwaiste Plan-Artikel
 * und deckelt `qtyHave` auf den neuen Bedarf (Prototyp `refreshPlanQuantities`, E11).
 */
export function refreshPlanQuantitiesInDomain(
  currentItems: readonly ShoppingItem[],
  plan: MealPlan,
  lookupRecipe: (id: string) => Recipe | undefined,
  options: RefreshPlanQuantitiesOptions = {},
): ShoppingItem[] {
  const now = options.now ?? new Date();
  const nowIso = options.nowIso ?? now.toISOString();
  const dates = new Set(planWindowDates(plan.days, now));

  const next: ShoppingItem[] = currentItems.map((raw) => {
    const item = cloneShoppingItem(raw);
    const hasSplit = item.qtyPlan !== undefined || item.qtyExtra !== undefined;
    if (!hasSplit) {
      // Legacy-/v3-Bestandsartikel als Extra bewahren
      item.qtyExtra =
        typeof item.amount === 'number' && Number.isFinite(item.amount) && item.amount > 0
          ? roundTenth(item.amount)
          : 0;
      item.recipesExtra = [...item.fromRecipes];
    }
    item.qtyPlan = 0;
    item.recipesPlan = [];
    return item;
  });

  for (const entry of plan.items) {
    if (!dates.has(entry.date)) {
      continue;
    }
    const recipe = lookupRecipe(entry.recipeId);
    if (!recipe || !Number.isFinite(recipe.servings) || recipe.servings <= 0) {
      continue;
    }
    const factor = entry.portions / recipe.servings;

    for (const ing of recipe.ingredients) {
      const qty = roundTenth(ing.amount * factor);
      if (!Number.isFinite(qty) || qty <= 0) {
        continue;
      }

      let target = next.find(
        (it) => it.food === ing.food && it.unit === ing.unit,
      );
      if (!target) {
        target = {
          id: `${ing.food}__${ing.unit}`,
          food: ing.food,
          amount: 0,
          unit: ing.unit,
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
      }

      target.qtyPlan = roundTenth((target.qtyPlan ?? 0) + qty);
      const rp = target.recipesPlan ?? [];
      if (!rp.includes(entry.recipeId)) {
        rp.push(entry.recipeId);
      }
      target.recipesPlan = rp;
    }
  }

  const kept: ShoppingItem[] = [];
  for (const item of next) {
    const qtyPlan = item.qtyPlan ?? 0;
    const qtyExtra = item.qtyExtra ?? 0;
    const hasPlanRef = (item.recipesPlan?.length ?? 0) > 0;
    const hasExtraRef = (item.recipesExtra?.length ?? 0) > 0;
    const keep =
      Boolean(item.customLabel) ||
      qtyPlan > 0 ||
      qtyExtra > 0 ||
      (!item.unit && (hasPlanRef || hasExtraRef));
    if (!keep) {
      continue;
    }
    kept.push(recomputeShoppingItem(item));
  }

  return kept;
}

export interface ShoppingTransferExportOptions {
  readonly knownFoodIds: ReadonlySet<string>;
  readonly knownRecipeIds: ReadonlySet<string>;
  readonly lookupFoodGroup?: (id: FoodId) => FoodGroup | undefined;
}

/**
 * Erzeugt `shopItems` & `shopStatus` im Prototyp-v5.10.1-Transferformat (`edovita-plan-einkauf.json`, E11).
 * Enthält `qtyHave` für den Gerätewechsel, aber niemals Körper-, Gesundheits- oder Einstellungsdaten (ADR-004).
 */
export function shoppingItemsToTransferExport(
  items: readonly ShoppingItem[],
  options: ShoppingTransferExportOptions,
): Pick<PlanExportBundle, 'shopItems' | 'shopStatus'> {
  const shopItems: PlanExportShopItem[] = [];
  const shopStatus: Record<string, ShopState> = {};
  const seenKeys = new Set<string>();

  for (const item of items) {
    if (shopItems.length >= 120) {
      break;
    }
    if (!options.knownFoodIds.has(item.food)) {
      continue;
    }
    const unit = item.unit ?? '';
    const dedupKey = `${item.food}\0${unit}`;
    if (seenKeys.has(dedupKey)) {
      continue;
    }
    seenKeys.add(dedupKey);

    const hasSplit = item.qtyPlan !== undefined || item.qtyExtra !== undefined;
    const qtyPlan = hasSplit ? (item.qtyPlan ?? 0) : 0;
    const qtyExtra = hasSplit
      ? (item.qtyExtra ?? 0)
      : typeof item.amount === 'number' && Number.isFinite(item.amount) && item.amount > 0
        ? roundTenth(item.amount)
        : 0;
    const need = computeEffectiveNeed(item);
    const qtyHave = coerceQtyHave(item.qtyHave, need ?? undefined);

    const recipesPlan = (item.recipesPlan ?? [])
      .filter((rid) => options.knownRecipeIds.has(rid))
      .slice(0, 20);
    const recipesExtra = (
      item.recipesExtra !== undefined ? item.recipesExtra : item.fromRecipes
    )
      .filter((rid) => options.knownRecipeIds.has(rid))
      .slice(0, 20);
    const grp = options.lookupFoodGroup?.(item.food);

    shopItems.push({
      id: item.food,
      unit,
      qtyPlan: roundTenth(qtyPlan),
      qtyExtra: roundTenth(qtyExtra),
      qtyHave,
      recipesPlan,
      recipesExtra,
      ...(grp ? { grp } : {}),
    });

    const effState: ShopState =
      need !== null && need > 0 && qtyHave >= need ? 'home' : item.state;
    const statusKey = unit ? `${item.food}\0${unit}` : item.food;
    if (Object.keys(shopStatus).length < 200) {
      shopStatus[statusKey] = effState;
    }
  }

  return { shopItems, shopStatus };
}

export interface TransferBundleToShoppingOptions {
  readonly lookupRecipe: (id: string) => Recipe | undefined;
  readonly now?: Date;
  readonly nowIso?: string;
}

function lookupTransferStatus(
  shopStatus: Readonly<Record<string, ShopState>> | null,
  foodId: string,
  unit: string,
): ShopState {
  if (!shopStatus) {
    return 'open';
  }
  const keyNull = unit ? `${foodId}\0${unit}` : foodId;
  if (Object.hasOwn(shopStatus, keyNull)) {
    return shopStatus[keyNull]!;
  }
  const keyPipe = unit ? `${foodId}|${unit}` : foodId;
  if (Object.hasOwn(shopStatus, keyPipe)) {
    return shopStatus[keyPipe]!;
  }
  if (Object.hasOwn(shopStatus, foodId)) {
    return shopStatus[foodId]!;
  }
  return 'open';
}

/**
 * Wandelt ein geprüftes `edovita-plan-einkauf.json`-Transfer-Bündel deterministisch in `ShoppingItem[]`
 * um und aktualisiert bei vorhandenem `plan` die Plan-Anteile inkl. `capHaveToNeed` (E11 / F1b).
 */
export function transferBundleToShoppingItems(
  bundle: ParsedPlanExportBundle,
  existingItems: readonly ShoppingItem[],
  options: TransferBundleToShoppingOptions,
): ShoppingItem[] {
  const now = options.now ?? new Date();
  const nowIso = options.nowIso ?? now.toISOString();

  let base: ShoppingItem[];

  if (bundle.shopItems !== null) {
    base = [];
    for (const raw of bundle.shopItems) {
      const unit: Unit | undefined =
        raw.unit && UNIT_SET.has(raw.unit) ? (raw.unit as Unit) : undefined;
      const food = asFoodId(raw.id);
      const id = unit ? `${food}__${unit}` : `${food}__manual`;
      const recipesPlan = uniqueRecipes(raw.recipesPlan.map(asRecipeId));
      const recipesExtra = uniqueRecipes(raw.recipesExtra.map(asRecipeId));
      const state = lookupTransferStatus(bundle.shopStatus, raw.id, raw.unit);

      const candidate: ShoppingItem = {
        id,
        food,
        ...(unit ? { unit } : {}),
        qtyPlan: roundTenth(raw.qtyPlan),
        qtyExtra: roundTenth(raw.qtyExtra),
        qtyHave: raw.qtyHave,
        state,
        fromRecipes: uniqueRecipes([...recipesPlan, ...recipesExtra]),
        recipesPlan,
        recipesExtra,
        addedAt: nowIso,
      };
      base.push(recomputeShoppingItem(candidate));
    }
  } else {
    base = existingItems.map((it) => {
      const copy = cloneShoppingItem(it);
      if (bundle.shopStatus) {
        const mapped = lookupTransferStatus(
          bundle.shopStatus,
          copy.food,
          copy.unit ?? '',
        );
        copy.state = mapped;
      }
      return recomputeShoppingItem(copy);
    });
  }

  if (bundle.plan !== null) {
    return refreshPlanQuantitiesInDomain(base, bundle.plan, options.lookupRecipe, {
      now,
      nowIso,
    });
  }

  return base;
}

export { PLAN_EXPORT_KIND };
