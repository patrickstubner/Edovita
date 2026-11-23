/**
 * Nährwert-Schicht (ADR-001, ADR-005).
 * Portionsskalierung und berechnete Nährwertsummen aus der Schweizer Nährwertdatenbank.
 */
export const NUTRITION_LAYER_VERSION = 1;

export {
  MAX_SERVINGS,
  MIN_SERVINGS,
  roundScaledAmount,
  scaleIngredients,
} from './scale.ts';

export { nutrientsForServings, nutrientsPerServing } from './sum.ts';
