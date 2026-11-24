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
  readonly missingText: boolean;
  readonly nutrition: NutritionSummary | undefined;
  readonly catalogSource: FoodCatalogSourceMeta;
  readonly notFound: boolean;
}

/**
 * Lädt ein Rezept anhand der Route-ID inkl. lokalisierter Texte in der aktuellen
 * UI-Sprache und berechneter Nährwerte (ADR-001, ADR-003, ADR-005).
 * Kein stiller Fallback auf Englisch (F2): fehlender Text wird explizit über
 * `missingText: true` sichtbar gemacht.
 */
export function useRecipe(id: string | undefined): UseRecipeResult {
  const { lang } = useI18n();

  return useMemo(() => {
    const catalogSource = getCatalogSource();
    if (!id) {
      return {
        recipe: undefined,
        text: undefined,
        missingText: false,
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
        missingText: false,
        nutrition: undefined,
        catalogSource,
        notFound: true,
      };
    }

    const text = getRecipeText(recipe.id, lang);
    const nutrition = nutrientsPerServing(recipe);

    return {
      recipe,
      text,
      missingText: text === undefined,
      nutrition,
      catalogSource,
      notFound: false,
    };
  }, [id, lang]);
}
