import type { UiKey } from '../../content/generated/locales-index.ts';
import type { Allergen, CuisineId, FoodGroup, Meal } from '../domain/index.ts';

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

export const FOOD_GROUP_LABEL_KEYS: Readonly<Record<FoodGroup, UiKey>> = {
  veg: 'shop.grp.veg',
  fruit: 'shop.grp.fruit',
  dairy: 'shop.grp.dairy',
  meat: 'shop.grp.meat',
  fish: 'shop.grp.fish',
  bakery: 'shop.grp.bakery',
  pantry: 'shop.grp.pantry',
  spice: 'shop.grp.spice',
  drinks: 'shop.grp.drinks',
};

export const BRAND_LABEL_KEYS: Readonly<
  Record<'migros' | 'coop' | 'lidl' | 'aldi' | 'denner' | 'spar', UiKey>
> = {
  migros: 'brand.migros',
  coop: 'brand.coop',
  lidl: 'brand.lidl',
  aldi: 'brand.aldi',
  denner: 'brand.denner',
  spar: 'brand.spar',
};

export const REGION_LABEL_KEYS: Readonly<
  Record<'CH' | 'DE' | 'AT' | 'IT' | 'ES' | 'FR' | 'PT', UiKey>
> = {
  CH: 'region.CH',
  DE: 'region.DE',
  AT: 'region.AT',
  IT: 'region.IT',
  ES: 'region.ES',
  FR: 'region.FR',
  PT: 'region.PT',
};

export function getCuisineLabelKey(
  cuisine: CuisineId | string,
): UiKey | undefined {
  if (typeof cuisine !== 'string' || !Object.hasOwn(CUISINE_LABEL_KEYS, cuisine)) {
    return undefined;
  }
  return CUISINE_LABEL_KEYS[cuisine];
}
