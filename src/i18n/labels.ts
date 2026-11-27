import type { UiKey } from '../../content/generated/locales-index.ts';
import type {
  Allergen,
  Cuisine,
  CuisineId,
  FoodGroup,
  Meal,
  PreferenceTag,
} from '../domain/index.ts';

export const MEAL_LABEL_KEYS: Readonly<Record<Meal, UiKey>> = {
  breakfast: 'meal.breakfast',
  lunch: 'meal.lunch',
  dinner: 'meal.dinner',
  snack: 'meal.snack',
};

export const MEAL_SHORT_LABEL_KEYS: Readonly<Record<Meal, UiKey>> = {
  breakfast: 'meal.short.breakfast',
  lunch: 'meal.short.lunch',
  dinner: 'meal.short.dinner',
  snack: 'meal.short.snack',
};

export const CUISINE_LABEL_KEYS: Readonly<Record<Cuisine, UiKey>> = {
  american: 'cuisine.american',
  brazilian: 'cuisine.brazilian',
  chinese: 'cuisine.chinese',
  european: 'cuisine.european',
  french: 'cuisine.french',
  greek: 'cuisine.greek',
  hawaiian: 'cuisine.hawaiian',
  indian: 'cuisine.indian',
  indonesian: 'cuisine.indonesian',
  italian: 'cuisine.italian',
  japanese: 'cuisine.japanese',
  korean: 'cuisine.korean',
  mediterranean: 'cuisine.mediterranean',
  mexican: 'cuisine.mexican',
  middle_eastern: 'cuisine.middle_eastern',
  moroccan: 'cuisine.moroccan',
  nordic: 'cuisine.nordic',
  peruvian: 'cuisine.peruvian',
  portuguese: 'cuisine.portuguese',
  spanish: 'cuisine.spanish',
  swiss: 'cuisine.swiss',
  thai: 'cuisine.thai',
  vietnamese: 'cuisine.vietnamese',
};

export const PREFERENCE_TAG_LABEL_KEYS: Readonly<Record<PreferenceTag, UiKey>> =
  {
    cilantro: 'pref.d_cil',
    mushrooms: 'pref.d_mush',
    onion: 'pref.d_onion',
    meat: 'pref.d_meat',
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
  return CUISINE_LABEL_KEYS[cuisine as Cuisine];
}
