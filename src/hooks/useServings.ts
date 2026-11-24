import { useCallback, useMemo, useState } from 'react';
import type {
  Nutrients,
  NutritionSummary,
  Recipe,
  ScaledIngredient,
} from '../domain/index.ts';
import {
  MAX_SERVINGS,
  MIN_SERVINGS,
  nutrientsForServings,
  nutrientsPerServing,
  scaleIngredients,
} from '../nutrition/index.ts';

export interface UseServingsResult {
  readonly servings: number;
  readonly min: number;
  readonly max: number;
  readonly setServings: (next: number) => void;
  readonly increment: () => void;
  readonly decrement: () => void;
  readonly scaledIngredients: readonly ScaledIngredient[];
  readonly perServing: NutritionSummary | undefined;
  readonly totalNutrients: Nutrients | undefined;
}

function clampServings(value: number): number {
  const rounded = Math.round(value);
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, rounded));
}

interface ServingsSelection {
  readonly recipeId: string | undefined;
  readonly value: number;
}

/**
 * Verwaltet die Portionszahl (1–12) für ein Rezept und berechnet skalierte Zutaten
 * sowie Nährwerte pro Portion und insgesamt (Issue #10, ADR-005).
 */
export function useServings(recipe: Recipe | undefined): UseServingsResult {
  const recipeId = recipe?.id;
  const baseServings = recipe ? clampServings(recipe.servings) : 2;
  const [selection, setSelection] = useState<ServingsSelection>({
    recipeId,
    value: baseServings,
  });

  const servings =
    selection.recipeId === recipeId ? selection.value : baseServings;

  const setServings = useCallback(
    (next: number) => {
      if (!Number.isFinite(next)) return;
      setSelection({ recipeId, value: clampServings(next) });
    },
    [recipeId],
  );

  const increment = useCallback(() => {
    setSelection((prev) => {
      const current = prev.recipeId === recipeId ? prev.value : baseServings;
      return { recipeId, value: clampServings(current + 1) };
    });
  }, [baseServings, recipeId]);

  const decrement = useCallback(() => {
    setSelection((prev) => {
      const current = prev.recipeId === recipeId ? prev.value : baseServings;
      return { recipeId, value: clampServings(current - 1) };
    });
  }, [baseServings, recipeId]);

  const scaledIngredients = useMemo<readonly ScaledIngredient[]>(() => {
    if (!recipe) return [];
    return scaleIngredients(recipe, servings);
  }, [recipe, servings]);

  const perServing = useMemo<NutritionSummary | undefined>(() => {
    if (!recipe) return undefined;
    return nutrientsPerServing(recipe);
  }, [recipe]);

  const totalNutrients = useMemo<Nutrients | undefined>(() => {
    if (!recipe) return undefined;
    return nutrientsForServings(recipe, servings);
  }, [recipe, servings]);

  return {
    servings,
    min: MIN_SERVINGS,
    max: MAX_SERVINGS,
    setServings,
    increment,
    decrement,
    scaledIngredients,
    perServing,
    totalNutrients,
  };
}
