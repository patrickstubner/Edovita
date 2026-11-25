import { useCallback, useMemo } from 'react';
import { listRecipes } from '../catalog/index.ts';
import {
  removePlanItem as removePlanItemDomain,
  setPlanDays as setPlanDaysDomain,
  upsertPlanItem as upsertPlanItemDomain,
  type MealPlan,
  type PlanItem,
  type Recipe,
} from '../domain/index.ts';
import { MEAL_SHORT_LABEL_KEYS } from '../i18n/index.ts';
import {
  addRecipeToListAndMaybePlan,
  planWhenLabel,
  refreshPlanQuantities,
  type AddRecipeToListOutcome,
} from '../shopping/index.ts';
import { useI18n } from './useI18n.ts';
import { usePlan } from './usePlan.ts';
import { useShopping } from './useShopping.ts';

export interface AddRecipeToListFeedback {
  readonly outcome: AddRecipeToListOutcome;
  readonly message: string;
  readonly canUndo: boolean;
}

export interface UsePlanShoppingResult {
  readonly makeShopFromPlan: () => Promise<{
    readonly ok: boolean;
    readonly message: string;
  }>;
  readonly syncPlanDays: (days: number) => Promise<MealPlan>;
  readonly syncUpsertPlanItem: (item: PlanItem) => Promise<MealPlan>;
  readonly syncRemovePlanItem: (id: string) => Promise<MealPlan>;
  readonly addRecipeToList: (
    recipe: Recipe,
    portions?: number,
  ) => Promise<AddRecipeToListFeedback>;
  readonly undoPlanAndShopping: () => Promise<boolean>;
}

/**
 * Koordiniert Essensplan und Einkaufsliste gemeinsam (Paket E11 / Issue #36, Prototyp v5.10.1):
 * - «Einkaufsliste erstellen» aus dem aktuellen Plan (`refreshPlanQuantities`)
 * - Plan-Änderungen (Tage, Hinzufügen/Tauschen, Entfernen) aktualisieren Plan-Anteile und deckeln `qtyHave`
 * - «Zur Einkaufsliste hinzufügen» mit automatischer Einplanung in den nächsten freien Slot & In-Memory-Rückgängig
 */
export function usePlanShopping(): UsePlanShoppingResult {
  const { t, fmtDate } = useI18n();
  const {
    plan,
    setDays,
    upsertItem,
    removeItem,
    commitPlanAndShopping,
    recordPlanShopUndo,
    undoPlanAndShopping,
  } = usePlan();
  const { items, replaceAll } = useShopping();

  const knownRecipeIds = useMemo(
    () => new Set<string>(listRecipes().map((r) => r.id)),
    [],
  );

  const makeShopFromPlan = useCallback(async () => {
    const nextItems = refreshPlanQuantities(items, plan);
    await replaceAll(nextItems);
    return {
      ok: true,
      message: t('plan.shop.done'),
    };
  }, [items, plan, replaceAll, t]);

  const syncPlanDays = useCallback(
    async (days: number): Promise<MealPlan> => {
      if (items.length === 0) {
        return setDays(days);
      }
      const nextPlan = setPlanDaysDomain(plan, days);
      const nextItems = refreshPlanQuantities(items, nextPlan);
      const res = await commitPlanAndShopping(nextPlan, nextItems);
      return res.plan;
    },
    [commitPlanAndShopping, items, plan, setDays],
  );

  const syncUpsertPlanItem = useCallback(
    async (item: PlanItem): Promise<MealPlan> => {
      if (items.length === 0) {
        return upsertItem(item);
      }
      const nextPlan = upsertPlanItemDomain(plan, item, { knownRecipeIds });
      const nextItems = refreshPlanQuantities(items, nextPlan);
      const res = await commitPlanAndShopping(nextPlan, nextItems);
      return res.plan;
    },
    [commitPlanAndShopping, items, knownRecipeIds, plan, upsertItem],
  );

  const syncRemovePlanItem = useCallback(
    async (id: string): Promise<MealPlan> => {
      if (items.length === 0) {
        return removeItem(id);
      }
      const nextPlan = removePlanItemDomain(plan, id);
      const nextItems = refreshPlanQuantities(items, nextPlan);
      const res = await commitPlanAndShopping(nextPlan, nextItems);
      return res.plan;
    },
    [commitPlanAndShopping, items, plan, removeItem],
  );

  const addRecipeToList = useCallback(
    async (
      recipe: Recipe,
      portions?: number,
    ): Promise<AddRecipeToListFeedback> => {
      const result = addRecipeToListAndMaybePlan(plan, items, recipe, {
        portions,
        knownRecipeIds,
      });
      await commitPlanAndShopping(result.plan, result.items);
      recordPlanShopUndo(result.canUndo ? result.snapshot : null);

      let message: string;
      if (result.outcome === 'already') {
        message = t('toast.addlist.already');
      } else if (result.outcome === 'planned' && result.plannedItem) {
        const when = planWhenLabel(
          result.plannedItem.date,
          result.plannedItem.slot,
          fmtDate,
          (slot) => t(MEAL_SHORT_LABEL_KEYS[slot]),
        );
        message = t('toast.addlist.planned', { when });
      } else {
        message = t('toast.addlist.noslot');
      }

      return {
        outcome: result.outcome,
        message,
        canUndo: result.canUndo,
      };
    },
    [
      commitPlanAndShopping,
      fmtDate,
      items,
      knownRecipeIds,
      plan,
      recordPlanShopUndo,
      t,
    ],
  );

  return {
    makeShopFromPlan,
    syncPlanDays,
    syncUpsertPlanItem,
    syncRemovePlanItem,
    addRecipeToList,
    undoPlanAndShopping,
  };
}
