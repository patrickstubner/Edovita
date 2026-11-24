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
  }));

  for (const ing of scaledIngredients) {
    const existing = next.find(
      (item) => item.food === ing.food && item.unit === ing.unit,
    );
    if (existing) {
      const prevAmount =
        typeof existing.amount === 'number' && Number.isFinite(existing.amount)
          ? existing.amount
          : 0;
      existing.amount = roundAmount(prevAmount + ing.scaledAmount);
      if (!existing.fromRecipes.includes(recipe.id)) {
        existing.fromRecipes.push(recipe.id);
      }
    } else {
      const id = `${ing.food}__${ing.unit}`;
      const fromRecipes: RecipeId[] = [recipe.id];
      next.push({
        id,
        food: ing.food,
        amount: roundAmount(ing.scaledAmount),
        unit: ing.unit,
        state: 'open',
        fromRecipes,
        addedAt: nowIso,
      });
    }
  }

  return next;
}
