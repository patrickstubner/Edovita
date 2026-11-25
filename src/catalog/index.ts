/**
 * Katalog-Schicht (ADR-001, ADR-003, ADR-005).
 * Liest geprüfte Lebensmittel, Glossare und Rezepte über den typisierten Inhalts-Index.
 */
export const CATALOG_LAYER_VERSION = 1;

export {
  foodName,
  getCatalogSource,
  getFood,
  getFoodsMap,
  getGlossaryLangs,
  isAllowed,
  listFoods,
} from './foods.ts';

export {
  getRecipe,
  getRecipeText,
  isRecipeAllowed,
  listRecipes,
  rankRecipes,
  type RecipeFilter,
} from './recipes.ts';

export { getRecipePhoto, hasRecipePhoto } from './images.ts';
