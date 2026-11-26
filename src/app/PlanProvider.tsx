import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getFood, getRecipe, listFoods, listRecipes } from '../catalog/index.ts';
import {
  EMPTY_PLAN,
  buildPlanExportBundle,
  parsePlanExportBundle,
  removePlanItem as removePlanItemDomain,
  setPlanDays as setPlanDaysDomain,
  shoppingItemsToTransferExport,
  transferBundleToShoppingItems,
  upsertPlanItem as upsertPlanItemDomain,
  type MealPlan,
  type ParsedPlanExportBundle,
  type PlanExportBundle,
  type PlanExportErrorCode,
  type PlanItem,
  type Result,
  type ShoppingItem,
} from '../domain/index.ts';
import {
  restoreShopAndPlan,
  type ShopAndPlanSnapshot,
} from '../shopping/index.ts';
import type { PlanRepository, StorageSnapshotPatch } from '../storage/index.ts';
import { ShoppingContext } from './ShoppingProvider.tsx';
import {
  classifyStorageError,
  type StorageErrorCode,
} from './storageError.ts';

export interface PlanContextValue {
  plan: MealPlan;
  loading: boolean;
  error: StorageErrorCode | null;
  clearError: () => void;
  setDays: (days: number) => Promise<MealPlan>;
  upsertItem: (item: PlanItem) => Promise<MealPlan>;
  removeItem: (id: string) => Promise<MealPlan>;
  commitPlanAndShopping: (
    nextPlan: MealPlan,
    nextShopping: readonly ShoppingItem[],
  ) => Promise<{ ok: boolean; plan: MealPlan }>;
  recordPlanShopUndo: (snapshot: ShopAndPlanSnapshot | null) => void;
  undoPlanAndShopping: () => Promise<boolean>;
  exportTransferBundle: () => PlanExportBundle;
  parseTransferFile: (
    rawText: string,
  ) => Result<ParsedPlanExportBundle, PlanExportErrorCode>;
  applyTransferBundle: (
    bundle: ParsedPlanExportBundle,
  ) => Promise<{ ok: boolean }>;
  reload: () => Promise<MealPlan>;
}

export const PlanContext = createContext<PlanContextValue | null>(null);

export interface PlanProviderProps {
  repository: PlanRepository;
  applyImport?: (patch: StorageSnapshotPatch) => Promise<void>;
  children: ReactNode;
}

/**
 * Eigener Bereichs-Provider nur für den Essensplan (ADR-001 Regel 6, ADR-002, E10/E11).
 * IndexedDB-/Quota-Fehler werden gefangen, `loading` zurückgesetzt und nur generisch gemeldet (G1).
 * Gemeinsame Plan-+Einkaufslisten-Änderungen und Datei-Importe laufen echt transaktional über
 * `applyImport` (Dexie-Transaktion F1b / G2).
 */
export function PlanProvider({
  repository,
  applyImport,
  children,
}: PlanProviderProps) {
  const shoppingCtx = useContext(ShoppingContext);
  const [plan, setPlan] = useState<MealPlan>(EMPTY_PLAN);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<StorageErrorCode | null>(null);

  const planRef = useRef<MealPlan>(plan);
  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  const shoppingItemsRef = useRef<readonly ShoppingItem[]>(
    shoppingCtx?.items ?? [],
  );
  useEffect(() => {
    shoppingItemsRef.current = shoppingCtx?.items ?? [];
  }, [shoppingCtx?.items]);

  // Lokaler In-Memory-Snapshot für «Rückgängig» (überlebt Navigation zu #/einkauf, nie persistiert)
  const undoSnapshotRef = useRef<ShopAndPlanSnapshot | null>(null);

  const knownRecipeIds = useMemo(
    () => new Set<string>(listRecipes().map((r) => r.id)),
    [],
  );
  const knownFoodIds = useMemo(
    () => new Set<string>(listFoods().map((f) => f.id)),
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reload = useCallback(async (): Promise<MealPlan> => {
    try {
      const loaded = await repository.get();
      planRef.current = loaded;
      setPlan(loaded);
      setError(null);
      setLoading(false);
      return loaded;
    } catch (err) {
      setError(classifyStorageError(err, 'read'));
      setLoading(false);
      return planRef.current;
    }
  }, [repository]);

  useEffect(() => {
    let active = true;
    void repository
      .get()
      .then((loaded) => {
        if (active) {
          planRef.current = loaded;
          setPlan(loaded);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(classifyStorageError(err, 'read'));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [repository]);

  const persist = useCallback(
    async (next: MealPlan): Promise<MealPlan> => {
      try {
        const saved = await repository.set(next);
        planRef.current = saved;
        setPlan(saved);
        setError(null);
        return saved;
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return planRef.current;
      }
    },
    [repository],
  );

  const setDays = useCallback(
    async (days: number): Promise<MealPlan> => {
      const next = setPlanDaysDomain(planRef.current, days);
      return persist(next);
    },
    [persist],
  );

  const upsertItem = useCallback(
    async (item: PlanItem): Promise<MealPlan> => {
      const next = upsertPlanItemDomain(planRef.current, item, {
        knownRecipeIds,
      });
      return persist(next);
    },
    [knownRecipeIds, persist],
  );

  const removeItem = useCallback(
    async (id: string): Promise<MealPlan> => {
      const next = removePlanItemDomain(planRef.current, id);
      return persist(next);
    },
    [persist],
  );

  const commitPlanAndShopping = useCallback(
    async (
      nextPlan: MealPlan,
      nextShopping: readonly ShoppingItem[],
    ): Promise<{ ok: boolean; plan: MealPlan }> => {
      try {
        if (applyImport) {
          await applyImport({
            plan: nextPlan,
            shopping: [...nextShopping],
          });
          const reloadedPlan = await repository.get();
          planRef.current = reloadedPlan;
          setPlan(reloadedPlan);
          if (shoppingCtx) {
            await shoppingCtx.reload();
          }
          setError(null);
          return { ok: true, plan: reloadedPlan };
        }
        const savedPlan = await repository.set(nextPlan);
        planRef.current = savedPlan;
        setPlan(savedPlan);
        if (shoppingCtx) {
          await shoppingCtx.replaceAll(nextShopping);
        }
        setError(null);
        return { ok: true, plan: savedPlan };
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return { ok: false, plan: planRef.current };
      }
    },
    [applyImport, repository, shoppingCtx],
  );

  const recordPlanShopUndo = useCallback(
    (snapshot: ShopAndPlanSnapshot | null) => {
      undoSnapshotRef.current = snapshot;
    },
    [],
  );

  const undoPlanAndShopping = useCallback(async (): Promise<boolean> => {
    const snap = undoSnapshotRef.current;
    if (!snap) {
      return false;
    }
    undoSnapshotRef.current = null;
    const restored = restoreShopAndPlan(snap);
    const result = await commitPlanAndShopping(restored.plan, restored.items);
    return result.ok;
  }, [commitPlanAndShopping]);

  const exportTransferBundle = useCallback((): PlanExportBundle => {
    const shopExport = shoppingItemsToTransferExport(shoppingItemsRef.current, {
      knownFoodIds,
      knownRecipeIds,
      lookupFoodGroup: (foodId) => getFood(foodId)?.group,
    });
    return buildPlanExportBundle(planRef.current, {
      knownRecipeIds,
      shopItems: shopExport.shopItems,
      shopStatus: shopExport.shopStatus,
    });
  }, [knownFoodIds, knownRecipeIds]);

  const parseTransferFile = useCallback(
    (rawText: string) =>
      parsePlanExportBundle(rawText, {
        knownRecipeIds,
        knownFoodIds,
      }),
    [knownFoodIds, knownRecipeIds],
  );

  const applyTransferBundle = useCallback(
    async (bundle: ParsedPlanExportBundle): Promise<{ ok: boolean }> => {
      const hasPlan = bundle.plan !== null;
      const hasShop =
        bundle.shopItems !== null || bundle.shopStatus !== null;
      if (!hasPlan && !hasShop) {
        return { ok: true };
      }

      const nextShopping = hasShop
        ? transferBundleToShoppingItems(bundle, shoppingItemsRef.current, {
            lookupRecipe: getRecipe,
          })
        : null;

      try {
        const patch: StorageSnapshotPatch = {
          ...(hasPlan && bundle.plan ? { plan: bundle.plan } : {}),
          ...(nextShopping !== null ? { shopping: nextShopping } : {}),
        };
        if (applyImport) {
          await applyImport(patch);
        } else {
          if (patch.plan) {
            await repository.set(patch.plan);
          }
          if (patch.shopping && shoppingCtx) {
            await shoppingCtx.replaceAll(patch.shopping);
          }
        }
        if (patch.plan) {
          const reloadedPlan = await repository.get();
          planRef.current = reloadedPlan;
          setPlan(reloadedPlan);
        }
        if (patch.shopping && shoppingCtx) {
          await shoppingCtx.reload();
        }
        undoSnapshotRef.current = null;
        setError(null);
        return { ok: true };
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return { ok: false };
      }
    },
    [applyImport, repository, shoppingCtx],
  );

  const value = useMemo<PlanContextValue>(
    () => ({
      plan,
      loading,
      error,
      clearError,
      setDays,
      upsertItem,
      removeItem,
      commitPlanAndShopping,
      recordPlanShopUndo,
      undoPlanAndShopping,
      exportTransferBundle,
      parseTransferFile,
      applyTransferBundle,
      reload,
    }),
    [
      plan,
      loading,
      error,
      clearError,
      setDays,
      upsertItem,
      removeItem,
      commitPlanAndShopping,
      recordPlanShopUndo,
      undoPlanAndShopping,
      exportTransferBundle,
      parseTransferFile,
      applyTransferBundle,
      reload,
    ],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
