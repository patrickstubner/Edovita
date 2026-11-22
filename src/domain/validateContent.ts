import {
  foodCatalogFileSchema,
  glossarySchema,
  recipeLocaleTextSchema,
  recipeSchema,
} from './schemas.ts';
import {
  NUTRIENT_KEYS,
  type Allergen,
  type Food,
  type FoodCatalogFile,
  type FoodGlossary,
  type FoodId,
  type Nutrients,
  type NutritionSummary,
  type Recipe,
  type RecipeLocaleText,
} from './types.ts';

export const EXPECTED_GLOSSARY_LANGS = ['de', 'en', 'pt', 'ja'] as const;
export const EXPECTED_RECIPE_UI_LANGS = ['de', 'en'] as const;

export interface RawRecipeBundle {
  folderName: string;
  recipe: unknown;
  locales: Record<string, unknown>;
}

export interface RawContentBundle {
  foodsFile: unknown;
  glossaries: Record<string, unknown>;
  recipes: RawRecipeBundle[];
}

export interface ValidatedContentBundle {
  catalog: FoodCatalogFile;
  glossaries: Record<string, FoodGlossary>;
  recipes: Array<{
    recipe: Recipe;
    locales: Record<string, RecipeLocaleText>;
  }>;
}

export interface ContentValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  validated: ValidatedContentBundle | null;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Reine Nährwert-Nachrechnung für die Inhaltsprüfung (identisch zu build_inhalte.py).
 */
export function computeRecipeNutrition(
  recipe: Pick<Recipe, 'servings' | 'ingredients' | 'nutritionPerServing'>,
  foodsById: ReadonlyMap<FoodId, Food>,
): NutritionSummary {
  const totals: Nutrients = {
    kcal: 0,
    fat: 0,
    satFat: 0,
    carbs: 0,
    sugars: 0,
    fiber: 0,
    protein: 0,
    salt: 0,
  };
  const missing = new Set<string>();
  const proxies = new Set<string>();

  for (const ing of recipe.ingredients) {
    if (ing.optional || ing.strained) {
      continue;
    }
    const food = foodsById.get(ing.food);
    if (!food) {
      missing.add(ing.food);
      continue;
    }
    if (food.per100g === null) {
      missing.add(ing.food);
      continue;
    }
    if (food.proxy) {
      proxies.add(ing.food);
    }
    for (const key of NUTRIENT_KEYS) {
      const per100 = food.per100g[key];
      if (per100 === null) {
        missing.add(`${ing.food}:${key}`);
      } else {
        totals[key] += (per100 * ing.grams) / 100;
      }
    }
  }

  const values: Nutrients = {
    kcal: Math.round(totals.kcal / recipe.servings),
    fat: roundTo(totals.fat / recipe.servings, 1),
    satFat: roundTo(totals.satFat / recipe.servings, 1),
    carbs: roundTo(totals.carbs / recipe.servings, 1),
    sugars: roundTo(totals.sugars / recipe.servings, 1),
    fiber: roundTo(totals.fiber / recipe.servings, 1),
    protein: roundTo(totals.protein / recipe.servings, 1),
    salt: roundTo(totals.salt / recipe.servings, 1),
  };

  const notIncluded = [...missing].sort();
  return {
    values,
    isMinimum: notIncluded.length > 0,
    notIncluded,
    proxies: [...proxies].sort(),
    basis: recipe.nutritionPerServing.basis,
  };
}

function sameSortedStrings(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Portierung aller Prüfregeln aus `docs/architektur/inhalte/tools/validate.py`
 * und `docs/architektur/testplan.md` als reine Domänenfunktion (ohne Dateisystem-Importe).
 */
export function validateContentBundle(
  bundle: RawContentBundle,
  options?: {
    requiredGlossaryLangs?: readonly string[];
    requiredRecipeUiLangs?: readonly string[];
  },
): ContentValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const glossaryLangs =
    options?.requiredGlossaryLangs ?? EXPECTED_GLOSSARY_LANGS;
  const recipeUiLangs =
    options?.requiredRecipeUiLangs ?? EXPECTED_RECIPE_UI_LANGS;

  const catalogResult = foodCatalogFileSchema.safeParse(bundle.foodsFile);
  if (!catalogResult.success) {
    for (const issue of catalogResult.error.issues) {
      errors.push(`foods.json (${issue.path.join('.')}): ${issue.message}`);
    }
    return { ok: false, errors, warnings, validated: null };
  }

  const catalog = catalogResult.data;
  const foodsById = new Map<FoodId, Food>();

  for (const food of catalog.foods) {
    if (foodsById.has(food.id)) {
      errors.push(`doppelte Food-ID: ${food.id}`);
      continue;
    }
    foodsById.set(food.id, food);

    if (food.per100g === null) {
      if (food.status !== 'zu_pruefen') {
        errors.push(`${food.id}: ohne Nährwerte, aber status != zu_pruefen`);
      }
    } else {
      if (food.source === null) {
        errors.push(`${food.id}: Nährwerte vorhanden, aber Quelle fehlt`);
      }
      if (food.proxy && food.status !== 'zu_pruefen') {
        errors.push(`${food.id}: Näherung muss status zu_pruefen haben`);
      }
    }
  }

  const validatedGlossaries: Record<string, FoodGlossary> = {};
  for (const lang of glossaryLangs) {
    const rawGlossary = bundle.glossaries[lang];
    if (rawGlossary === undefined) {
      errors.push(`Glossar ${lang}: Datei fehlt`);
      continue;
    }
    const parsedGlossary = glossarySchema.safeParse(rawGlossary);
    if (!parsedGlossary.success) {
      for (const issue of parsedGlossary.error.issues) {
        errors.push(
          `Glossar ${lang} (${issue.path.join('.')}): ${issue.message}`,
        );
      }
      continue;
    }
    const glossary = parsedGlossary.data;
    validatedGlossaries[lang] = glossary;

    for (const foodId of foodsById.keys()) {
      if (!Object.hasOwn(glossary, foodId) || !glossary[foodId]) {
        errors.push(`Glossar ${lang}: ${foodId} fehlt`);
      }
    }
    for (const key of Object.keys(glossary)) {
      if (!foodsById.has(key as FoodId)) {
        errors.push(`Glossar ${lang}: unbekannte Food-ID ${key}`);
      }
    }
  }

  const validatedRecipes: ValidatedContentBundle['recipes'] = [];
  const seenRecipeIds = new Set<string>();

  for (const entry of bundle.recipes) {
    const parsedRecipe = recipeSchema.safeParse(entry.recipe);
    if (!parsedRecipe.success) {
      for (const issue of parsedRecipe.error.issues) {
        errors.push(
          `Rezept ${entry.folderName} (${issue.path.join('.')}): ${issue.message}`,
        );
      }
      continue;
    }

    const recipe = parsedRecipe.data;
    const rid = recipe.id;

    if (entry.folderName !== rid) {
      errors.push(`${rid}: Ordnername (${entry.folderName}) weicht von id ab`);
    }
    if (seenRecipeIds.has(rid)) {
      errors.push(`${rid}: doppelte Rezept-ID`);
    }
    seenRecipeIds.add(rid);

    const notesNeeded = new Set<string>();
    let allIngredientsInCatalog = true;

    for (const ing of recipe.ingredients) {
      const food = foodsById.get(ing.food);
      if (!food) {
        errors.push(`${rid}: Zutat ${ing.food} nicht im Katalog`);
        allIngredientsInCatalog = false;
        continue;
      }

      if (ing.unit === 'g' && Math.abs(ing.grams - ing.amount) > 1e-9) {
        errors.push(`${rid}/${ing.food}: unit=g aber grams (${ing.grams}) != amount (${ing.amount})`);
      }

      if (ing.unit === 'ml') {
        const density = food.density ?? 1.0;
        if (food.density === undefined) {
          warnings.push(`${rid}/${ing.food}: ml ohne Dichte in Quelle (1,0 angenommen)`);
        }
        if (Math.abs(ing.grams - ing.amount * density) > 0.01 * ing.grams) {
          errors.push(`${rid}/${ing.food}: ml × Dichte weicht von grams ab`);
        }
      }

      if (ing.noteKey) {
        notesNeeded.add(ing.noteKey);
      }
    }

    if (allIngredientsInCatalog) {
      const derivedAllergens = [
        ...new Set<Allergen>(
          recipe.ingredients
            .filter((ing) => !ing.strained)
            .flatMap((ing) => foodsById.get(ing.food)?.allergens ?? []),
        ),
      ].sort();

      const declaredAllergens = [...recipe.allergens].sort();
      if (!sameSortedStrings(derivedAllergens, declaredAllergens)) {
        errors.push(
          `${rid}: Allergene nicht aus Katalog abgeleitet (angegeben: [${declaredAllergens.join(', ')}] vs. abgeleitet: [${derivedAllergens.join(', ')}])`,
        );
      }

      const derivedToCheck = [
        ...new Set<Allergen>(
          recipe.ingredients
            .filter((ing) => !ing.strained)
            .flatMap((ing) => foodsById.get(ing.food)?.allergensToCheck ?? []),
        ),
      ].sort();
      const declaredToCheck = [...recipe.allergensToCheck].sort();
      if (!sameSortedStrings(derivedToCheck, declaredToCheck)) {
        errors.push(
          `${rid}: allergensToCheck nicht aus Katalog abgeleitet (angegeben: [${declaredToCheck.join(', ')}] vs. abgeleitet: [${derivedToCheck.join(', ')}])`,
        );
      }

      const recomputed = computeRecipeNutrition(recipe, foodsById);
      for (const key of NUTRIENT_KEYS) {
        const declared = recipe.nutritionPerServing.values[key];
        const expected = recomputed.values[key];
        const tol = key === 'kcal' ? 1 : 0.1;
        if (Math.abs(declared - expected) > tol) {
          errors.push(
            `${rid}: nutritionPerServing.${key} (${declared}) weicht von Berechnung (${expected}) ab`,
          );
        }
      }

      if (recipe.nutritionPerServing.isMinimum !== recomputed.isMinimum) {
        errors.push(`${rid}: nutritionPerServing.isMinimum stimmt nicht`);
      }
      if (
        !sameSortedStrings(
          [...recipe.nutritionPerServing.notIncluded].sort(),
          recomputed.notIncluded,
        )
      ) {
        errors.push(`${rid}: nutritionPerServing.notIncluded stimmt nicht`);
      }
      if (
        !sameSortedStrings(
          [...recipe.nutritionPerServing.proxies].sort(),
          recomputed.proxies,
        )
      ) {
        errors.push(`${rid}: nutritionPerServing.proxies stimmt nicht`);
      }
    }

    const kcal = recipe.nutritionPerServing.values.kcal;
    if (kcal < 100 || kcal > 1200) {
      errors.push(`${rid}: kcal/Portion ${kcal} ausserhalb 100–1200`);
    }

    if (recipe.nutritionPerServing.isMinimum) {
      warnings.push(
        `${rid}: Nährwerte unvollständig ohne [${recipe.nutritionPerServing.notIncluded.join(', ')}]`,
      );
    }
    if (recipe.nutritionPerServing.proxies.length > 0) {
      warnings.push(
        `${rid}: Näherungswerte für [${recipe.nutritionPerServing.proxies.join(', ')}]`,
      );
    }

    const validatedLocales: Record<string, RecipeLocaleText> = {};
    for (const lang of recipeUiLangs) {
      const rawLocale = entry.locales[lang];
      if (rawLocale === undefined) {
        errors.push(`${rid}/${lang}: Übersetzungsdatei fehlt`);
        continue;
      }
      const parsedLocale = recipeLocaleTextSchema.safeParse(rawLocale);
      if (!parsedLocale.success) {
        for (const issue of parsedLocale.error.issues) {
          errors.push(
            `${rid}/${lang} (${issue.path.join('.')}): ${issue.message}`,
          );
        }
        continue;
      }

      const loc = parsedLocale.data;
      validatedLocales[lang] = loc;

      if (loc.steps.length !== recipe.steps) {
        errors.push(
          `${rid}/${lang}: Schrittzahl ${loc.steps.length} != ${recipe.steps}`,
        );
      }

      const providedNotes = Object.keys(loc.notes).sort();
      const neededNotes = [...notesNeeded].sort();
      if (!sameSortedStrings(providedNotes, neededNotes)) {
        errors.push(`${rid}/${lang}: Hinweis-Schlüssel stimmen nicht überein`);
      }
    }

    validatedRecipes.push({ recipe, locales: validatedLocales });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    validated:
      errors.length === 0
        ? {
            catalog,
            glossaries: validatedGlossaries,
            recipes: validatedRecipes,
          }
        : null,
  };
}
