import { getFoodsMap } from '../catalog/index.ts';
import {
  computeRecipeNutrition,
  type Food,
  type FoodId,
  type Nutrients,
  type NutritionSummary,
  type Recipe,
} from '../domain/index.ts';
import { MAX_SERVINGS, MIN_SERVINGS } from './scale.ts';

function toFoodMap(
  foods?: ReadonlyMap<FoodId, Food> | readonly Food[],
): ReadonlyMap<FoodId, Food> {
  if (!foods) {
    return getFoodsMap();
  }
  if (Array.isArray(foods)) {
    return new Map(foods.map((food) => [food.id, food]));
  }
  return foods as ReadonlyMap<FoodId, Food>;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Berechnet die Nährwerte pro Portion aus den Zutaten (`grams × per100g`)
 * gemäss ADR-005 (nichts geschätzt; abgesiebte und optionale Zutaten zählen nicht).
 */
export function nutrientsPerServing(
  recipe: Recipe,
  foods?: ReadonlyMap<FoodId, Food> | readonly Food[],
): NutritionSummary {
  return computeRecipeNutrition(recipe, toFoodMap(foods));
}

/**
 * Skaliert die Nährwerte pro Portion auf eine gewählte Portionszahl (1–12).
 */
export function nutrientsForServings(
  recipe: Recipe,
  servings: number,
  foods?: ReadonlyMap<FoodId, Food> | readonly Food[],
): Nutrients {
  if (
    !Number.isInteger(servings) ||
    servings < MIN_SERVINGS ||
    servings > MAX_SERVINGS
  ) {
    throw new RangeError(
      `Portionszahl muss ganzzahlig zwischen ${MIN_SERVINGS} und ${MAX_SERVINGS} liegen (erhalten: ${servings}).`,
    );
  }
  const per = nutrientsPerServing(recipe, foods).values;
  return {
    kcal: Math.round(per.kcal * servings),
    fat: roundTo(per.fat * servings, 1),
    satFat: roundTo(per.satFat * servings, 1),
    carbs: roundTo(per.carbs * servings, 1),
    sugars: roundTo(per.sugars * servings, 1),
    fiber: roundTo(per.fiber * servings, 1),
    protein: roundTo(per.protein * servings, 1),
    salt: roundTo(per.salt * servings, 1),
  };
}
