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

export interface RatingsContextValue {
  ratings: Readonly<Record<string, number>>;
  saved: readonly RecipeId[];
  loading: boolean;
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
 */
export function RatingsProvider({
  repository,
  children,
}: RatingsProviderProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saved, setSavedState] = useState<RecipeId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reload = useCallback(async (): Promise<void> => {
    const [nextRatings, nextSaved] = await Promise.all([
      repository.listRatings(),
      repository.listSaved(),
    ]);
    setRatings(nextRatings);
    setSavedState(nextSaved);
    setLoading(false);
  }, [repository]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      repository.listRatings(),
      repository.listSaved(),
    ]).then(([nextRatings, nextSaved]) => {
      if (active) {
        setRatings(nextRatings);
        setSavedState(nextSaved);
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
      await repository.setRating(recipeId, stars);
      const nextRatings = await repository.listRatings();
      setRatings(nextRatings);
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
      await repository.setSaved(recipeId, nextFlag);
      const nextSaved = await repository.listSaved();
      setSavedState(nextSaved);
    },
    [repository],
  );

  const toggleSaved = useCallback(
    async (recipeId: RecipeId | string): Promise<boolean> => {
      const nextFlag = !isSaved(recipeId);
      await setSaved(recipeId, nextFlag);
      return nextFlag;
    },
    [isSaved, setSaved],
  );

  const value = useMemo<RatingsContextValue>(
    () => ({
      ratings,
      saved,
      loading,
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
