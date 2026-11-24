import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RecipeId } from '../domain/index.ts';
import type { RatingsRepository } from '../storage/index.ts';
import {
  classifyStorageError,
  type StorageErrorCode,
} from './storageError.ts';

export interface RatingsContextValue {
  ratings: Readonly<Record<string, number>>;
  saved: readonly RecipeId[];
  loading: boolean;
  error: StorageErrorCode | null;
  clearError: () => void;
  getRating: (recipeId: RecipeId | string) => number | null;
  setRating: (recipeId: RecipeId | string, stars: number | null) => Promise<void>;
  isSaved: (recipeId: RecipeId | string) => boolean;
  setSaved: (recipeId: RecipeId | string, saved: boolean) => Promise<void>;
  toggleSaved: (recipeId: RecipeId | string) => Promise<boolean>;
  reload: () => Promise<void>;
}

export const RatingsContext = createContext<RatingsContextValue | null>(null);

export interface RatingsProviderProps {
  repository: RatingsRepository;
  children: ReactNode;
}

/**
 * Eigener Bereichs-Provider nur für Bewertungen und Merkliste (ADR-001 Regel 6, ADR-002).
 * Repository wird injiziert (Web: DexieRatingsRepository, Tests: MemoryRatingsRepository).
 * IndexedDB-/Quota-Fehler werden gefangen, `loading` zurückgesetzt und nur generisch gemeldet (G1).
 */
export function RatingsProvider({
  repository,
  children,
}: RatingsProviderProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saved, setSavedState] = useState<RecipeId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<StorageErrorCode | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    try {
      const [nextRatings, nextSaved] = await Promise.all([
        repository.listRatings(),
        repository.listSaved(),
      ]);
      setRatings(nextRatings);
      setSavedState(nextSaved);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(classifyStorageError(err, 'read'));
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    let active = true;
    void Promise.all([repository.listRatings(), repository.listSaved()])
      .then(([nextRatings, nextSaved]) => {
        if (active) {
          setRatings(nextRatings);
          setSavedState(nextSaved);
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

  const getRating = useCallback(
    (recipeId: RecipeId | string): number | null => {
      if (typeof recipeId !== 'string' || !Object.hasOwn(ratings, recipeId)) {
        return null;
      }
      return ratings[recipeId] ?? null;
    },
    [ratings],
  );

  const setRating = useCallback(
    async (recipeId: RecipeId | string, stars: number | null): Promise<void> => {
      try {
        await repository.setRating(recipeId, stars);
        const nextRatings = await repository.listRatings();
        setRatings(nextRatings);
        setError(null);
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
      }
    },
    [repository],
  );

  const isSaved = useCallback(
    (recipeId: RecipeId | string): boolean =>
      saved.some((entry) => entry === recipeId),
    [saved],
  );

  const setSaved = useCallback(
    async (recipeId: RecipeId | string, nextFlag: boolean): Promise<void> => {
      try {
        await repository.setSaved(recipeId, nextFlag);
        const nextSaved = await repository.listSaved();
        setSavedState(nextSaved);
        setError(null);
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
      }
    },
    [repository],
  );

  const toggleSaved = useCallback(
    async (recipeId: RecipeId | string): Promise<boolean> => {
      const current = isSaved(recipeId);
      const nextFlag = !current;
      try {
        await repository.setSaved(recipeId, nextFlag);
        const nextSaved = await repository.listSaved();
        setSavedState(nextSaved);
        setError(null);
        return nextFlag;
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return current;
      }
    },
    [isSaved, repository],
  );

  const value = useMemo<RatingsContextValue>(
    () => ({
      ratings,
      saved,
      loading,
      error,
      clearError,
      getRating,
      setRating,
      isSaved,
      setSaved,
      toggleSaved,
      reload,
    }),
    [
      ratings,
      saved,
      loading,
      error,
      clearError,
      getRating,
      setRating,
      isSaved,
      setSaved,
      toggleSaved,
      reload,
    ],
  );

  return (
    <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>
  );
}
