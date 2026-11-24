import { getFood } from '../catalog/index.ts';
import {
  FOOD_ID_RE,
  asFoodId,
  isSafeRecordKey,
  mergeRecipeIntoShoppingList,
  type Food,
  type FoodGroup,
  type FoodId,
  type ImportShopItem,
  type Recipe,
  type RecipeId,
  type ShopState,
  type ShoppingItem,
  type Unit,
} from '../domain/index.ts';
import { scaleIngredients } from '../nutrition/index.ts';
import {
  capHaveToNeed,
  effectiveShopState,
  isHaveAll,
} from './have.ts';

/** Einheitliche Supermarkt-Reihenfolge der Lebensmittelgruppen. */
export const SHOP_GROUP_ORDER: readonly FoodGroup[] = [
  'veg',
  'fruit',
  'dairy',
  'meat',
  'fish',
  'bakery',
  'pantry',
  'spice',
  'drinks',
];

export interface ShoppingGroup {
  readonly group: FoodGroup;
  readonly items: readonly ShoppingItem[];
  readonly count: number;
}

export interface GroupedShoppingList {
  readonly openGroups: readonly ShoppingGroup[];
  readonly cartItems: readonly ShoppingItem[];
  readonly homeItems: readonly ShoppingItem[];
  readonly recipeIds: readonly RecipeId[];
  readonly counts: {
    readonly total: number;
    readonly open: number;
    readonly cart: number;
    readonly home: number;
  };
}

function roundAmount(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function cloneItem(item: ShoppingItem): ShoppingItem {
  return {
    ...item,
    fromRecipes: [...item.fromRecipes],
    ...(item.recipeAmounts ? { recipeAmounts: { ...item.recipeAmounts } } : {}),
  };
}

/**
 * Fügt alle skalierten Zutaten eines Rezepts zur Einkaufsliste hinzu.
 * Gleiche Zutat + gleiche Einheit werden summiert, verschiedene Einheiten bleiben getrennt.
 * Bestehender Zustand (insbesondere `home` oder `cart`) bleibt beim Zusammenführen erhalten (ADR-002).
 */
export function addRecipe(
  list: readonly ShoppingItem[],
  recipe: Recipe,
  servings: number,
  nowIso: string = new Date().toISOString(),
): ShoppingItem[] {
  const scaled = scaleIngredients(recipe, servings);
  return mergeRecipeIntoShoppingList(list, recipe, scaled, nowIso);
}

/**
 * Zieht den Anteil eines Rezepts sauber aus der Einkaufsliste ab (ADR-002).
 * Artikel, die nur aus diesem Rezept stammen oder deren Restmenge ≤ 0 fällt, werden entfernt;
 * Anteile anderer Rezepte bleiben exakt erhalten und `qtyHave` wird auf den neuen Bedarf gedeckelt (v5.9).
 */
export function removeRecipe(
  list: readonly ShoppingItem[],
  recipeId: RecipeId,
): ShoppingItem[] {
  const next: ShoppingItem[] = [];

  for (const raw of list) {
    if (!raw.fromRecipes.includes(recipeId)) {
      next.push(cloneItem(raw));
      continue;
    }

    const item = cloneItem(raw);
    const remainingRecipes = item.fromRecipes.filter((id) => id !== recipeId);
    const hadRecipeAmount =
      item.recipeAmounts !== undefined &&
      Object.hasOwn(item.recipeAmounts, recipeId);
    const contribution = hadRecipeAmount
      ? (item.recipeAmounts?.[recipeId] ?? 0)
      : undefined;

    if (item.recipeAmounts) {
      const updatedMap: Record<string, number> = {};
      for (const key of Object.getOwnPropertyNames(item.recipeAmounts)) {
        if (key !== recipeId && isSafeRecordKey(key)) {
          const val = item.recipeAmounts[key];
          if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
            updatedMap[key] = val;
          }
        }
      }
      if (Object.keys(updatedMap).length > 0) {
        item.recipeAmounts = updatedMap;
      } else {
        delete item.recipeAmounts;
      }
    }

    item.fromRecipes = remainingRecipes;

    if (contribution !== undefined && typeof item.amount === 'number') {
      const remainingAmount = roundAmount(item.amount - contribution);
      if (remainingAmount <= 0.001) {
        // Nichts mehr übrig -> Artikel entfernen
        continue;
      }
      item.amount = remainingAmount;
      const capped = capHaveToNeed(item);
      if (isHaveAll(capped)) {
        capped.state = 'home';
      }
      next.push(capped);
      continue;
    }

    // Legacy-Eintrag ohne `recipeAmounts`: wenn keine weiteren Rezepte mehr verweisen, entfernen
    if (remainingRecipes.length === 0) {
      continue;
    }

    next.push(capHaveToNeed(item));
  }

  return next;
}

export interface AddCatalogItemOptions {
  readonly amount?: number;
  readonly unit?: Unit;
  readonly nowIso?: string;
}

/**
 * Fügt ein Lebensmittel manuell aus dem Katalog hinzu (Suche in der Einkaufsliste).
 */
export function addCatalogItem(
  list: readonly ShoppingItem[],
  food: FoodId,
  options: AddCatalogItemOptions = {},
): ShoppingItem[] {
  const nowIso = options.nowIso ?? new Date().toISOString();
  const amount =
    typeof options.amount === 'number' &&
    Number.isFinite(options.amount) &&
    options.amount > 0
      ? roundAmount(options.amount)
      : undefined;
  const unit = amount !== undefined ? options.unit : undefined;

  const next = list.map(cloneItem);
  const existing = next.find(
    (item) => item.food === food && item.unit === unit,
  );

  if (existing) {
    if (amount !== undefined) {
      const prev =
        typeof existing.amount === 'number' && Number.isFinite(existing.amount)
          ? existing.amount
          : 0;
      existing.amount = roundAmount(prev + amount);
    }
    if (existing.state !== 'open') {
      existing.state = 'open';
    }
    return next;
  }

  const id = unit ? `${food}__${unit}` : `${food}__manual`;
  const created: ShoppingItem = {
    id,
    food,
    state: 'open',
    fromRecipes: [],
    addedAt: nowIso,
  };
  if (amount !== undefined) {
    created.amount = amount;
  }
  if (unit !== undefined) {
    created.unit = unit;
  }

  next.push(created);
  return next;
}

/**
 * Setzt den Zustand (`open` | `cart` | `home`) eines einzelnen Einkaufsartikels unveränderlich.
 */
export function setState(
  list: readonly ShoppingItem[],
  id: string,
  state: ShopState,
): ShoppingItem[] {
  return list.map((item) => {
    if (item.id !== id) {
      return cloneItem(item);
    }
    return {
      ...cloneItem(item),
      state,
    };
  });
}

/**
 * Entfernt alle Artikel, die bereits im Einkaufskorb liegen (`state === 'cart'`).
 */
export function clearDone(list: readonly ShoppingItem[]): ShoppingItem[] {
  return list.filter((item) => item.state !== 'cart').map(cloneItem);
}

function toSafeImportedFoodId(rawId: string, index: number): FoodId {
  const normalized = rawId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  if (
    normalized.length > 0 &&
    FOOD_ID_RE.test(normalized) &&
    isSafeRecordKey(normalized)
  ) {
    return asFoodId(normalized);
  }
  return asFoodId(`import_${index + 1}`);
}

/**
 * Wandelt geprüfte QR-Import-Artikel (`parseShopImport`) in `ShoppingItem[]` um
 * und wendet sie je nach Nutzerentscheid im Bestätigungsdialog an (`replace` oder `merge`).
 */
export function applyShopImport(
  currentList: readonly ShoppingItem[],
  imported: readonly ImportShopItem[],
  mode: 'replace' | 'merge',
  lookupFood: (id: string) => Food | undefined = (id) => getFood(id),
  nowIso: string = new Date().toISOString(),
): ShoppingItem[] {
  const base = mode === 'replace' ? [] : currentList.map(cloneItem);

  for (let i = 0; i < imported.length; i += 1) {
    const entry = imported[i];
    if (!entry) continue;

    // Prüfen, ob die ID (oder ihr Food-Präfix vor "__") im Lebensmittel-Katalog existiert
    const candidateFoodKey = entry.id.includes('__')
      ? (entry.id.split('__')[0] ?? entry.id)
      : entry.id;
    const catalogFood = lookupFood(candidateFoodKey);
    const foodId = catalogFood
      ? catalogFood.id
      : toSafeImportedFoodId(entry.id, i);
    const itemId = entry.unit
      ? `${foodId}__${entry.unit}`
      : catalogFood
        ? `${foodId}__import`
        : `qr_${foodId}_${i}`;

    const existing = base.find(
      (item) =>
        item.id === entry.id ||
        item.id === itemId ||
        (item.food === foodId && item.unit === entry.unit),
    );

    if (existing) {
      if (
        typeof entry.amount === 'number' &&
        Number.isFinite(entry.amount) &&
        entry.amount > 0
      ) {
        const prev =
          typeof existing.amount === 'number' && Number.isFinite(existing.amount)
            ? existing.amount
            : 0;
        existing.amount =
          mode === 'merge' ? roundAmount(prev + entry.amount) : entry.amount;
      }
      // Bestehenden `home`-Zustand beim Zusammenführen erhalten (ADR-002)
      if (existing.state !== 'home') {
        existing.state = entry.st;
      }
      if (!catalogFood && entry.name) {
        existing.customLabel = entry.name;
      }
    } else {
      const nextItem: ShoppingItem = {
        id: itemId,
        food: foodId,
        state: entry.st,
        fromRecipes: [],
        addedAt: nowIso,
      };
      if (
        typeof entry.amount === 'number' &&
        Number.isFinite(entry.amount) &&
        entry.amount > 0
      ) {
        nextItem.amount = roundAmount(entry.amount);
      }
      if (entry.unit !== undefined) {
        nextItem.unit = entry.unit;
      }
      if (!catalogFood) {
        nextItem.customLabel = entry.name;
      }
      base.push(nextItem);
    }
  }

  return base;
}

/**
 * Gruppiert Einkaufsartikel in offene Lebensmittelgruppen (nach Supermarkt-Reihenfolge)
 * sowie die Abschnitte «Im Korb» (`cart`) und «Schon zu Hause» (`home`).
 */
export function groupItems(
  list: readonly ShoppingItem[],
  resolveGroup: (food: FoodId) => FoodGroup = (id) =>
    getFood(id)?.group ?? 'pantry',
): GroupedShoppingList {
  const byGroup = new Map<FoodGroup, ShoppingItem[]>();
  const cartItems: ShoppingItem[] = [];
  const homeItems: ShoppingItem[] = [];
  const recipeSet = new Set<RecipeId>();
  let openCount = 0;

  for (const item of list) {
    for (const rid of item.fromRecipes) {
      recipeSet.add(rid);
    }
    const effState = effectiveShopState(item);
    if (effState === 'cart') {
      cartItems.push(item);
    } else if (effState === 'home') {
      homeItems.push(item);
    } else {
      openCount += 1;
      const grp = resolveGroup(item.food);
      const bucket = byGroup.get(grp);
      if (bucket) {
        bucket.push(item);
      } else {
        byGroup.set(grp, [item]);
      }
    }
  }

  const openGroups: ShoppingGroup[] = [];
  for (const group of SHOP_GROUP_ORDER) {
    const items = byGroup.get(group);
    if (items && items.length > 0) {
      openGroups.push({
        group,
        items,
        count: items.length,
      });
    }
  }

  return {
    openGroups,
    cartItems,
    homeItems,
    recipeIds: [...recipeSet],
    counts: {
      total: list.length,
      open: openCount,
      cart: cartItems.length,
      home: homeItems.length,
    },
  };
}
