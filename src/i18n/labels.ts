import type { UiKey } from '../../content/generated/locales-index.ts';
import type { Allergen, CuisineId, Meal } from '../domain/index.ts';

export const MEAL_LABEL_KEYS: Readonly<Record<Meal, UiKey>> = {
  breakfast: 'meal.breakfast',
  lunch: 'meal.lunch',
  dinner: 'meal.dinner',
  snack: 'meal.snack',
};

export const CUISINE_LABEL_KEYS: Readonly<Record<string, UiKey>> = {
  european: 'cuisine.european',
  thai: 'cuisine.thai',
  vietnamese: 'cuisine.vietnamese',
  swiss: 'cuisine.swiss',
  indian: 'cuisine.indian',
};

export const ALLERGEN_LABEL_KEYS: Readonly<Record<Allergen, UiKey>> = {
  gluten: 'allergen.gluten',
  crustaceans: 'allergen.crustaceans',
  eggs: 'allergen.eggs',
  fish: 'allergen.fish',
  peanuts: 'allergen.peanuts',
  soy: 'allergen.soy',
  milk: 'allergen.milk',
  nuts: 'allergen.nuts',
  celery: 'allergen.celery',
  mustard: 'allergen.mustard',
  sesame: 'allergen.sesame',
  sulphites: 'allergen.sulphites',
  lupin: 'allergen.lupin',
  molluscs: 'allergen.molluscs',
};

export function getCuisineLabelKey(
  cuisine: CuisineId | string,
): UiKey | undefined {
  if (typeof cuisine !== 'string' || !Object.hasOwn(CUISINE_LABEL_KEYS, cuisine)) {
    return undefined;
  }
  return CUISINE_LABEL_KEYS[cuisine];
}
