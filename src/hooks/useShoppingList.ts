import { useCallback, useMemo, useRef } from 'react';
import { foodName, getFood } from '../catalog/index.ts';
import type {
  FoodId,
  ImportShopItem,
  Recipe,
  RecipeId,
  ShoppingItem,
  Unit,
} from '../domain/index.ts';
import {
  addCatalogItem,
  addRecipe as addRecipeToList,
  applyShopImport,
  clearDone as clearDoneItems,
  groupItems,
  removeRecipe as removeRecipeFromList,
  setState as setItemState,
  type GroupedShoppingList,
} from '../shopping/index.ts';
import { useI18n } from './useI18n.ts';
import { useShopping } from './useShopping.ts';

function cloneSnapshot(items: readonly ShoppingItem[]): ShoppingItem[] {
  return items.map((item) => ({
    ...item,
    fromRecipes: [...item.fromRecipes],
    ...(item.recipeAmounts ? { recipeAmounts: { ...item.recipeAmounts } } : {}),
  }));
}

export interface UseShoppingListResult {
  readonly items: readonly ShoppingItem[];
  readonly grouped: GroupedShoppingList;
  readonly loading: boolean;
  readonly resolveItemName: (item: ShoppingItem) => string;
  readonly resolveItemAmount: (item: ShoppingItem) => string;
  readonly toggleCart: (id: string) => Promise<void>;
  readonly markHome: (id: string) => Promise<void>;
  readonly markOpen: (id: string) => Promise<void>;
  readonly undo: () => Promise<boolean>;
  readonly addRecipe: (recipe: Recipe, servings: number) => Promise<void>;
  readonly removeRecipe: (recipeId: RecipeId) => Promise<void>;
  readonly addFromCatalog: (
    foodId: FoodId,
    amount?: number,
    unit?: Unit,
  ) => Promise<void>;
  readonly clearDone: () => Promise<void>;
  readonly applyImport: (
    imported: readonly ImportShopItem[],
    mode: 'replace' | 'merge',
  ) => Promise<void>;
}

/**
 * Verbindet `ShoppingProvider` mit der reinen Einkaufslisten-Logik (`src/shopping/`),
 * lokalisiert Namen/Mengen über `useI18n` und hält einen Undo-Snapshot für schnelle
 * Rückgängig-Aktionen («Hab ich», Rezept entfernen, Korb leeren).
 */
export function useShoppingList(): UseShoppingListResult {
  const { items, loading, replaceAll } = useShopping();
  const { lang, fmtAmount } = useI18n();
  const undoRef = useRef<ShoppingItem[] | null>(null);

  const grouped = useMemo(
    () => groupItems(items, (id) => getFood(id)?.group ?? 'pantry'),
    [items],
  );

  const resolveItemName = useCallback(
    (item: ShoppingItem): string => {
      if (item.customLabel) {
        return item.customLabel;
      }
      return foodName(item.food, lang) ?? item.food;
    },
    [lang],
  );

  const resolveItemAmount = useCallback(
    (item: ShoppingItem): string => {
      if (
        typeof item.amount === 'number' &&
        Number.isFinite(item.amount) &&
        item.unit
      ) {
        return fmtAmount(item.amount, item.unit);
      }
      return '';
    },
    [fmtAmount],
  );

  const commit = useCallback(
    async (next: ShoppingItem[], recordUndo = false): Promise<void> => {
      if (recordUndo) {
        undoRef.current = cloneSnapshot(items);
      }
      await replaceAll(next);
    },
    [items, replaceAll],
  );

  const toggleCart = useCallback(
    async (id: string): Promise<void> => {
      const target = items.find((it) => it.id === id);
      if (!target) return;
      const nextState = target.state === 'cart' ? 'open' : 'cart';
      await commit(setItemState(items, id, nextState));
    },
    [commit, items],
  );

  const markHome = useCallback(
    async (id: string): Promise<void> => {
      await commit(setItemState(items, id, 'home'), true);
    },
    [commit, items],
  );

  const markOpen = useCallback(
    async (id: string): Promise<void> => {
      await commit(setItemState(items, id, 'open'));
    },
    [commit, items],
  );

  const undo = useCallback(async (): Promise<boolean> => {
    const previous = undoRef.current;
    if (!previous) return false;
    undoRef.current = null;
    await replaceAll(previous);
    return true;
  }, [replaceAll]);

  const addRecipe = useCallback(
    async (recipe: Recipe, servings: number): Promise<void> => {
      await commit(addRecipeToList(items, recipe, servings), true);
    },
    [commit, items],
  );

  const removeRecipe = useCallback(
    async (recipeId: RecipeId): Promise<void> => {
      await commit(removeRecipeFromList(items, recipeId), true);
    },
    [commit, items],
  );

  const addFromCatalog = useCallback(
    async (foodId: FoodId, amount?: number, unit?: Unit): Promise<void> => {
      await commit(addCatalogItem(items, foodId, { amount, unit }));
    },
    [commit, items],
  );

  const clearDone = useCallback(async (): Promise<void> => {
    await commit(clearDoneItems(items), true);
  }, [commit, items]);

  const applyImport = useCallback(
    async (
      imported: readonly ImportShopItem[],
      mode: 'replace' | 'merge',
    ): Promise<void> => {
      await commit(applyShopImport(items, imported, mode), true);
    },
    [commit, items],
  );

  return {
    items,
    grouped,
    loading,
    resolveItemName,
    resolveItemAmount,
    toggleCart,
    markHome,
    markOpen,
    undo,
    addRecipe,
    removeRecipe,
    addFromCatalog,
    clearDone,
    applyImport,
  };
}
