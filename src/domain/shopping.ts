import type {
  Recipe,
  RecipeId,
  ScaledIngredient,
  ShoppingItem,
} from './types.ts';

function roundAmount(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

/**
 * Fügt skalierte Zutaten eines Rezepts unveränderlich in eine Einkaufsliste ein.
 * Gleiche Zutat + gleiche Einheit werden summiert; bestehender Zustand (`open`/`cart`/`home`)
 * bleibt erhalten.
 */
export function mergeRecipeIntoShoppingList(
  currentItems: readonly ShoppingItem[],
  recipe: Pick<Recipe, 'id'>,
  scaledIngredients: readonly ScaledIngredient[],
  nowIso: string = new Date().toISOString(),
): ShoppingItem[] {
  const next = currentItems.map((item) => ({
    ...item,
    fromRecipes: [...item.fromRecipes],
    ...(item.recipeAmounts ? { recipeAmounts: { ...item.recipeAmounts } } : {}),
  }));

  for (const ing of scaledIngredients) {
    const addAmt = roundAmount(ing.scaledAmount);
    const existing = next.find(
      (item) => item.food === ing.food && item.unit === ing.unit,
    );
    if (existing) {
      const prevAmount =
        typeof existing.amount === 'number' && Number.isFinite(existing.amount)
          ? existing.amount
          : 0;
      existing.amount = roundAmount(prevAmount + addAmt);
      if (!existing.fromRecipes.includes(recipe.id)) {
        existing.fromRecipes.push(recipe.id);
      }
      const prevRecipeAmounts: Record<string, number> = existing.recipeAmounts
        ? { ...existing.recipeAmounts }
        : {};
      const prevForRecipe = Object.hasOwn(prevRecipeAmounts, recipe.id)
        ? (prevRecipeAmounts[recipe.id] ?? 0)
        : 0;
      prevRecipeAmounts[recipe.id] = roundAmount(prevForRecipe + addAmt);
      existing.recipeAmounts = prevRecipeAmounts;
    } else {
      const id = `${ing.food}__${ing.unit}`;
      const fromRecipes: RecipeId[] = [recipe.id];
      const recipeAmounts: Record<string, number> = { [recipe.id]: addAmt };
      next.push({
        id,
        food: ing.food,
        amount: addAmt,
        unit: ing.unit,
        state: 'open',
        fromRecipes,
        recipeAmounts,
        addedAt: nowIso,
      });
    }
  }

  return next;
}
