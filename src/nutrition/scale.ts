import type { Recipe, ScaledIngredient, Unit } from '../domain/index.ts';

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 12;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Rundungsregeln je Einheit gemäss docs/architektur/bausteine.md & testplan.md:
 * - `g`: ab 10 g auf 5 g, darunter auf ganze 1 g (mind. 1 g)
 * - `ml`: ab 10 ml auf 10 ml, darunter auf 5 ml (mind. 5 ml)
 * - `pc`: auf halbe Stücke (0,5), mind. 0,5
 * - `tbsp` / `tsp`: auf halbe Löffel (0,5), mind. 0,5
 * - `pinch`: ganze Prisen, mind. 1
 */
export function roundScaledAmount(rawAmount: number, unit: Unit): number {
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new RangeError(`Ungültige Zutatenmenge: ${rawAmount}`);
  }

  switch (unit) {
    case 'g':
      if (rawAmount < 10) {
        return Math.max(1, Math.round(rawAmount));
      }
      return Math.max(5, Math.round(rawAmount / 5) * 5);
    case 'ml':
      if (rawAmount < 10) {
        return Math.max(5, Math.round(rawAmount / 5) * 5);
      }
      return Math.max(10, Math.round(rawAmount / 10) * 10);
    case 'pc':
    case 'tbsp':
    case 'tsp':
      return Math.max(0.5, Math.round(rawAmount * 2) / 2);
    case 'pinch':
      return Math.max(1, Math.round(rawAmount));
  }
}

/**
 * Skaliert alle Zutaten eines Rezepts auf `targetServings` (1–12 Portionen).
 * Bei identischer Portionszahl bleiben die Grundmengen unverändert erhalten.
 */
export function scaleIngredients(
  recipe: Recipe,
  targetServings: number,
): ScaledIngredient[] {
  if (
    !Number.isInteger(targetServings) ||
    targetServings < MIN_SERVINGS ||
    targetServings > MAX_SERVINGS
  ) {
    throw new RangeError(
      `Portionszahl muss ganzzahlig zwischen ${MIN_SERVINGS} und ${MAX_SERVINGS} liegen (erhalten: ${targetServings}).`,
    );
  }
  if (!Number.isFinite(recipe.servings) || recipe.servings <= 0) {
    throw new RangeError(`Ungültige Grundportionen im Rezept ${recipe.id}.`);
  }

  const factor = targetServings / recipe.servings;
  const isBaseServings = targetServings === recipe.servings;

  return recipe.ingredients.map((ing) => ({
    ...ing,
    scaledAmount: isBaseServings
      ? ing.amount
      : roundScaledAmount(ing.amount * factor, ing.unit),
    scaledGrams: isBaseServings ? ing.grams : roundTo(ing.grams * factor, 1),
  }));
}
