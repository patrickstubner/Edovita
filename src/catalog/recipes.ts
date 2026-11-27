import {
  RECIPES,
  RECIPE_LOCALES,
  RECIPE_TITLES,
} from '../../content/generated/catalog-index.ts';
import {
  asRecipeId,
  type DietaryPref,
  type LangCode,
  type Meal,
  type PreferenceTag,
  type Recipe,
  type RecipeId,
  type RecipeLocaleText,
} from '../domain/index.ts';
import { getFood, isAllowed } from './foods.ts';

const RECIPES_BY_ID: ReadonlyMap<RecipeId, Recipe> = new Map(
  RECIPES.map((recipe) => [recipe.id, recipe]),
);

const DEFAULT_POPULARITY = 7;

export interface RecipeFilter {
  meal?: Meal | 'all';
  fast?: boolean;
  protein?: boolean;
  savedOnly?: boolean;
  savedIds?: Readonly<Record<string, boolean>> | ReadonlySet<string>;
  prefs?: Readonly<Partial<Record<DietaryPref, boolean>>>;
  /** Vorlieben-Tags, die Rezepte ausschliessen (`cilantro`, `mushrooms`, `onion`, `meat`; E12). */
  excludePreferences?: readonly PreferenceTag[];
  tag?: string;
}

function isSavedId(
  id: string,
  saved?: Readonly<Record<string, boolean>> | ReadonlySet<string>,
): boolean {
  if (!saved) return false;
  if (saved instanceof Set) {
    return saved.has(id);
  }
  const map = saved as Readonly<Record<string, boolean>>;
  return Object.hasOwn(map, id) && Boolean(map[id]);
}

export function getRecipe(id: RecipeId | string): Recipe | undefined {
  return RECIPES_BY_ID.get(asRecipeId(id));
}

export function getRecipeText(
  id: RecipeId | string,
  lang: LangCode,
): RecipeLocaleText | undefined {
  if (typeof id !== 'string' || typeof lang !== 'string') {
    return undefined;
  }
  if (!Object.hasOwn(RECIPE_LOCALES, id)) {
    return undefined;
  }
  const byLang = RECIPE_LOCALES[id];
  if (!byLang || !Object.hasOwn(byLang, lang)) {
    return undefined;
  }
  return byLang[lang];
}

/**
 * Liefert den lokalisierten Rezepttitel in allen 7 unterstützten Sprachen (E12),
 * streng über eigene Schlüssel (`Object.hasOwn`) ohne stillen Englisch-Fallback (F2).
 */
export function getRecipeTitle(
  id: RecipeId | string,
  lang: LangCode,
): string | undefined {
  if (typeof id !== 'string' || typeof lang !== 'string') {
    return undefined;
  }
  const full = getRecipeText(id, lang);
  if (full) {
    return full.title;
  }
  if (!Object.hasOwn(RECIPE_TITLES, lang)) {
    return undefined;
  }
  const byId = RECIPE_TITLES[lang];
  if (!byId || !Object.hasOwn(byId, id)) {
    return undefined;
  }
  return byId[id];
}

export function isRecipeAllowed(
  recipe: Recipe,
  prefs?: Readonly<Partial<Record<DietaryPref, boolean>>>,
): boolean {
  if (!prefs) return true;
  for (const ing of recipe.ingredients) {
    if (ing.strained) continue;
    const food = getFood(ing.food);
    if (food && !isAllowed(food, prefs)) {
      return false;
    }
  }
  return true;
}

/**
 * Filtert den Rezeptkatalog nach Mahlzeit, Eigenschaften (schnell <= 15 min,
 * proteinreich >= 30 g, gemerkt), Vorlieben-Ausschluss, Tag und Ernährungsprofil (wie Prototyp `rlist`).
 */
export function listRecipes(filter?: RecipeFilter): Recipe[] {
  if (!filter) {
    return [...RECIPES];
  }
  const excludedPrefs =
    filter.excludePreferences && filter.excludePreferences.length > 0
      ? new Set<PreferenceTag>(filter.excludePreferences)
      : null;
  return RECIPES.filter((recipe) => {
    if (filter.meal && filter.meal !== 'all' && recipe.meal !== filter.meal) {
      return false;
    }
    if (filter.fast && recipe.minutes > 15) {
      return false;
    }
    if (filter.protein && recipe.nutritionPerServing.values.protein < 30) {
      return false;
    }
    if (filter.savedOnly && !isSavedId(recipe.id, filter.savedIds)) {
      return false;
    }
    if (filter.tag && !recipe.tags.includes(filter.tag)) {
      return false;
    }
    if (
      excludedPrefs &&
      recipe.preferenceTags?.some((pref) => excludedPrefs.has(pref))
    ) {
      return false;
    }
    if (filter.prefs && !isRecipeAllowed(recipe, filter.prefs)) {
      return false;
    }
    return true;
  });
}

/**
 * Bewertet und sortiert Rezepte gemäss Prototyp `rscore` + `rlist` (`prototype/app.js` Z. 731–747):
 * - Punktzahl: `(sterne ? sterne * 2 : 5) + pop / 2 + (gemerkt ? 1 : 0)`
 * - Vielfalt: nie zweimal hintereinander dieselbe Küche, solange eine Alternative da ist.
 */
export function rankRecipes(
  list: readonly Recipe[],
  ratings: Readonly<Record<string, number>> = {},
  saved?: Readonly<Record<string, boolean>> | ReadonlySet<string>,
  popularity: Readonly<Record<string, number>> = {},
): Recipe[] {
  const score = (recipe: Recipe): number => {
    const stars = ratings[recipe.id];
    const pop = popularity[recipe.id] ?? DEFAULT_POPULARITY;
    const savedBonus = isSavedId(recipe.id, saved) ? 1 : 0;
    return (stars && stars > 0 ? stars * 2 : 5) + pop / 2 + savedBonus;
  };

  const remaining = [...list].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });

  const ordered: Recipe[] = [];
  while (remaining.length > 0) {
    const lastCuisine =
      ordered.length > 0 ? ordered[ordered.length - 1]?.cuisine : undefined;
    let pickIndex = 0;
    if (lastCuisine !== undefined) {
      const altIndex = remaining.findIndex((r) => r.cuisine !== lastCuisine);
      if (altIndex !== -1) {
        pickIndex = altIndex;
      }
    }
    const [picked] = remaining.splice(pickIndex, 1);
    if (picked) {
      ordered.push(picked);
    }
  }

  return ordered;
}
