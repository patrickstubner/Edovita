import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { listFoods, listRecipes } from '../catalog/index.ts';
import {
  EMPTY_PLAN,
  buildPlanExportBundle,
  parsePlanExportBundle,
  removePlanItem as removePlanItemDomain,
  setPlanDays as setPlanDaysDomain,
  upsertPlanItem as upsertPlanItemDomain,
  type MealPlan,
  type ParsedPlanExportBundle,
  type PlanExportBundle,
  type PlanExportErrorCode,
  type PlanItem,
  type Result,
} from '../domain/index.ts';
import type { PlanRepository, StorageSnapshotPatch } from '../storage/index.ts';
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
 * Eigener Bereichs-Provider nur für den Essensplan (ADR-001 Regel 6, ADR-002, E10).
 * IndexedDB-/Quota-Fehler werden gefangen, `loading` zurückgesetzt und nur generisch gemeldet (G1).
 * Datei-Importe laufen echt transaktional über `applyImport` (Dexie-Transaktion F1b / G2).
 */
export function PlanProvider({
  repository,
  applyImport,
  children,
}: PlanProviderProps) {
  const [plan, setPlan] = useState<MealPlan>(EMPTY_PLAN);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<StorageErrorCode | null>(null);

  const planRef = useRef<MealPlan>(plan);
  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

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

  const exportTransferBundle = useCallback(
    (): PlanExportBundle =>
      buildPlanExportBundle(planRef.current, { knownRecipeIds }),
    [knownRecipeIds],
  );

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
      if (bundle.plan === null) {
        // Altes Bündel ohne `plan` mit gültigen Listenfeldern: in E10 gültig (shopItems/shopStatus folgen in E11 #36)
        return { ok: true };
      }

      try {
        if (applyImport) {
          await applyImport({ plan: bundle.plan });
        } else {
          await repository.set(bundle.plan);
        }
        const reloaded = await repository.get();
        planRef.current = reloaded;
        setPlan(reloaded);
        setError(null);
        return { ok: true };
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return { ok: false };
      }
    },
    [applyImport, repository],
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
      exportTransferBundle,
      parseTransferFile,
      applyTransferBundle,
      reload,
    ],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
