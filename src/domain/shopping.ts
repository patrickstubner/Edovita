import { recomputeShoppingItem } from './planShop.ts';
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
 * bleibt erhalten. Trennt ab E11 Plan-Anteil (`dest = 'plan'`) und Extra-Anteil (`dest = 'extra'`).
 */
export function mergeRecipeIntoShoppingList(
  currentItems: readonly ShoppingItem[],
  recipe: Pick<Recipe, 'id'>,
  scaledIngredients: readonly ScaledIngredient[],
  nowIso: string = new Date().toISOString(),
  dest: 'extra' | 'plan' = 'extra',
): ShoppingItem[] {
  const next = currentItems.map((item) => ({
    ...item,
    fromRecipes: [...item.fromRecipes],
    ...(item.recipesPlan ? { recipesPlan: [...item.recipesPlan] } : {}),
    ...(item.recipesExtra ? { recipesExtra: [...item.recipesExtra] } : {}),
    ...(item.recipeAmounts ? { recipeAmounts: { ...item.recipeAmounts } } : {}),
  }));

  for (const ing of scaledIngredients) {
    const addAmt = roundAmount(ing.scaledAmount);
    const existing = next.find(
      (item) => item.food === ing.food && item.unit === ing.unit,
    );
    if (existing) {
      const hasSplit =
        existing.qtyPlan !== undefined || existing.qtyExtra !== undefined;
      if (!hasSplit) {
        const prevAmount =
          typeof existing.amount === 'number' && Number.isFinite(existing.amount)
            ? existing.amount
            : 0;
        existing.qtyPlan = 0;
        existing.qtyExtra = prevAmount;
        existing.recipesPlan = [];
        existing.recipesExtra = [...existing.fromRecipes];
      }

      if (dest === 'plan') {
        existing.qtyPlan = roundAmount((existing.qtyPlan ?? 0) + addAmt);
        const rp = existing.recipesPlan ?? [];
        if (!rp.includes(recipe.id)) {
          rp.push(recipe.id);
        }
        existing.recipesPlan = rp;
      } else {
        existing.qtyExtra = roundAmount((existing.qtyExtra ?? 0) + addAmt);
        const re = existing.recipesExtra ?? [];
        if (!re.includes(recipe.id)) {
          re.push(recipe.id);
        }
        existing.recipesExtra = re;
      }

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

      const idx = next.indexOf(existing);
      next[idx] = recomputeShoppingItem(existing);
    } else {
      const id = `${ing.food}__${ing.unit}`;
      const fromRecipes: RecipeId[] = [recipe.id];
      const recipeAmounts: Record<string, number> = { [recipe.id]: addAmt };
      next.push(
        recomputeShoppingItem({
          id,
          food: ing.food,
          amount: addAmt,
          unit: ing.unit,
          qtyPlan: dest === 'plan' ? addAmt : 0,
          qtyExtra: dest === 'extra' ? addAmt : 0,
          state: 'open',
          fromRecipes,
          recipesPlan: dest === 'plan' ? [recipe.id] : [],
          recipesExtra: dest === 'extra' ? [recipe.id] : [],
          recipeAmounts,
          addedAt: nowIso,
        }),
      );
    }
  }

  return next;
}
