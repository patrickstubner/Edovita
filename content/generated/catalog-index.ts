/* Auto-generiert von scripts/build-content-index.mjs – nicht von Hand bearbeiten. */
import type {
  Food,
  FoodCatalogSourceMeta,
  FoodGlossary,
  Recipe,
  RecipeLocaleText,
} from '../../src/domain/index.ts';
import foodsFile from '../foods/foods.json';
import glossaryDe from '../foods/glossary/de.json';
import glossaryEn from '../foods/glossary/en.json';
import glossaryJa from '../foods/glossary/ja.json';
import glossaryPt from '../foods/glossary/pt.json';
import recipeBirchermuesli from '../recipes/birchermuesli/recipe.json';
import recipeBirchermuesliDe from '../recipes/birchermuesli/de.json';
import recipeBirchermuesliEn from '../recipes/birchermuesli/en.json';
import recipeLentilCurry from '../recipes/lentil_curry/recipe.json';
import recipeLentilCurryDe from '../recipes/lentil_curry/de.json';
import recipeLentilCurryEn from '../recipes/lentil_curry/en.json';
import recipeOvenSalmon from '../recipes/oven_salmon/recipe.json';
import recipeOvenSalmonDe from '../recipes/oven_salmon/de.json';
import recipeOvenSalmonEn from '../recipes/oven_salmon/en.json';
import recipePho from '../recipes/pho/recipe.json';
import recipePhoDe from '../recipes/pho/de.json';
import recipePhoEn from '../recipes/pho/en.json';
import recipeThaiCurry from '../recipes/thai_curry/recipe.json';
import recipeThaiCurryDe from '../recipes/thai_curry/de.json';
import recipeThaiCurryEn from '../recipes/thai_curry/en.json';

export const CATALOG_SOURCE: FoodCatalogSourceMeta = foodsFile.source;
export const FOODS: readonly Food[] = foodsFile.foods as unknown as readonly Food[];

export const GLOSSARY_LANGS = ['de', 'en', 'ja', 'pt'] as const;
export const GLOSSARIES: Readonly<Record<string, FoodGlossary>> = {
  de: glossaryDe,
  en: glossaryEn,
  ja: glossaryJa,
  pt: glossaryPt,
};

export const RECIPES: readonly Recipe[] = [
  recipeBirchermuesli as unknown as Recipe,
  recipeLentilCurry as unknown as Recipe,
  recipeOvenSalmon as unknown as Recipe,
  recipePho as unknown as Recipe,
  recipeThaiCurry as unknown as Recipe,
];

export const RECIPE_LOCALES: Readonly<Record<string, Readonly<Record<string, RecipeLocaleText>>>> = {
  birchermuesli: {
    de: recipeBirchermuesliDe,
    en: recipeBirchermuesliEn,
  },
  lentil_curry: {
    de: recipeLentilCurryDe,
    en: recipeLentilCurryEn,
  },
  oven_salmon: {
    de: recipeOvenSalmonDe,
    en: recipeOvenSalmonEn,
  },
  pho: {
    de: recipePhoDe,
    en: recipePhoEn,
  },
  thai_curry: {
    de: recipeThaiCurryDe,
    en: recipeThaiCurryEn,
  },
};
