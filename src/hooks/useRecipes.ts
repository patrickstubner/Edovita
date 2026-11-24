import { useMemo } from 'react';
import { getRecipeText, listRecipes, rankRecipes } from '../catalog/index.ts';
import type { Meal, Recipe } from '../domain/index.ts';
import { useI18n } from './useI18n.ts';
import { useRatings } from './useRatings.ts';

export interface RecipesFilterState {
  readonly meal: Meal | 'all';
  readonly fast: boolean;
  readonly protein: boolean;
  readonly savedOnly: boolean;
}

export interface RankedRecipeItem {
  readonly recipe: Recipe;
  readonly title: string;
  readonly rating: number | null;
  readonly saved: boolean;
}

/**
 * Filtert und sortiert die Rezeptliste mit Vielfalt-Ranking (`rankRecipes`)
 * anhand von Mahlzeit, Eigenschaften, Bewertungen und Merkliste.
 */
export function useRecipes(filter: RecipesFilterState): readonly RankedRecipeItem[] {
  const { lang } = useI18n();
  const { ratings, saved, getRating, isSaved } = useRatings();

  return useMemo(() => {
    const savedSet = new Set<string>(saved);
    const filtered = listRecipes({
      meal: filter.meal,
      fast: filter.fast,
      protein: filter.protein,
      savedOnly: filter.savedOnly,
      savedIds: savedSet,
    });
    const ranked = rankRecipes(filtered, ratings, savedSet);

    return ranked.map((recipe) => {
      const text =
        getRecipeText(recipe.id, lang) ?? getRecipeText(recipe.id, 'en');
      return {
        recipe,
        title: text?.title ?? recipe.id,
        rating: getRating(recipe.id),
        saved: isSaved(recipe.id),
      };
    });
  }, [
    filter.fast,
    filter.meal,
    filter.protein,
    filter.savedOnly,
    getRating,
    isSaved,
    lang,
    ratings,
    saved,
  ]);
}
