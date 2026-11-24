import { useMemo } from 'react';
import {
  getCatalogSource,
  getRecipe,
  getRecipeText,
} from '../catalog/index.ts';
import type {
  FoodCatalogSourceMeta,
  NutritionSummary,
  Recipe,
  RecipeLocaleText,
} from '../domain/index.ts';
import { nutrientsPerServing } from '../nutrition/index.ts';
import { useI18n } from './useI18n.ts';

export interface UseRecipeResult {
  readonly recipe: Recipe | undefined;
  readonly text: RecipeLocaleText | undefined;
  readonly nutrition: NutritionSummary | undefined;
  readonly catalogSource: FoodCatalogSourceMeta;
  readonly notFound: boolean;
}

/**
 * Lädt ein Rezept anhand der Route-ID inkl. lokalisierter Texte und berechneter
 * Nährwerte aus dem Katalog (ADR-001, ADR-005).
 */
export function useRecipe(id: string | undefined): UseRecipeResult {
  const { lang } = useI18n();

  return useMemo(() => {
    const catalogSource = getCatalogSource();
    if (!id) {
      return {
        recipe: undefined,
        text: undefined,
        nutrition: undefined,
        catalogSource,
        notFound: true,
      };
    }

    const recipe = getRecipe(id);
    if (!recipe) {
      return {
        recipe: undefined,
        text: undefined,
        nutrition: undefined,
        catalogSource,
        notFound: true,
      };
    }

    const text =
      getRecipeText(recipe.id, lang) ?? getRecipeText(recipe.id, 'en');
    const nutrition = nutrientsPerServing(recipe);

    return {
      recipe,
      text,
      nutrition,
      catalogSource,
      notFound: false,
    };
  }, [id, lang]);
}
