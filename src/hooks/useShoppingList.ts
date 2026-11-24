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
  applyHave as applyItemHave,
  applyShopImport,
  clearDone as clearDoneItems,
  defaultCatalogAmountForGroup,
  effectiveShopState,
  groupItems,
  removeRecipe as removeRecipeFromList,
  resetHave as resetItemHave,
  setState as setItemState,
  type ApplyHaveOptions,
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
  readonly applyHave: (id: string, options: ApplyHaveOptions) => Promise<void>;
  readonly resetHave: (id: string) => Promise<void>;
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
 * Rückgängig-Aktionen (Korb leeren, QR-Import).
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
      const currentState = effectiveShopState(target);
      if (currentState === 'home') return;
      const nextState = currentState === 'cart' ? 'open' : 'cart';
      await commit(setItemState(items, id, nextState));
    },
    [commit, items],
  );

  const applyHave = useCallback(
    async (id: string, options: ApplyHaveOptions): Promise<void> => {
      await commit(applyItemHave(items, id, options));
    },
    [commit, items],
  );

  const resetHave = useCallback(
    async (id: string): Promise<void> => {
      await commit(resetItemHave(items, id));
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
      const defaults =
        amount === undefined && unit === undefined
          ? defaultCatalogAmountForGroup(getFood(foodId)?.group ?? 'pantry')
          : { amount, unit };
      await commit(addCatalogItem(items, foodId, defaults));
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
    applyHave,
    resetHave,
    undo,
    addRecipe,
    removeRecipe,
    addFromCatalog,
    clearDone,
    applyImport,
  };
}
