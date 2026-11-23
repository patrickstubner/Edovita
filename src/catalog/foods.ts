import {
  CATALOG_SOURCE,
  FOODS,
  GLOSSARIES,
  GLOSSARY_LANGS,
} from '../../content/generated/catalog-index.ts';
import {
  asFoodId,
  type Allergen,
  type DietaryPref,
  type Food,
  type FoodCatalogSourceMeta,
  type FoodId,
  type LangCode,
} from '../domain/index.ts';

const FOODS_BY_ID: ReadonlyMap<FoodId, Food> = new Map(
  FOODS.map((food) => [food.id, food]),
);

const ONION_IDS: ReadonlySet<string> = new Set(['onion', 'spring_onion']);
const MUSHROOM_IDS: ReadonlySet<string> = new Set(['mushroom', 'mushrooms']);
const CILANTRO_IDS: ReadonlySet<string> = new Set(['coriander_fresh']);

function hasAnyAllergen(
  food: Food,
  blocked: readonly Allergen[],
): boolean {
  return food.allergens.some((a) => blocked.includes(a));
}

export function getCatalogSource(): FoodCatalogSourceMeta {
  return CATALOG_SOURCE;
}

export function listFoods(): readonly Food[] {
  return FOODS;
}

export function getFoodsMap(): ReadonlyMap<FoodId, Food> {
  return FOODS_BY_ID;
}

export function getFood(id: FoodId | string): Food | undefined {
  return FOODS_BY_ID.get(asFoodId(id));
}

export function getGlossaryLangs(): readonly string[] {
  return GLOSSARY_LANGS;
}

/**
 * Liefert den Lebensmittelnamen in `lang` oder `null`, falls kein Glossareintrag existiert.
 * ADR-003: bewusst kein englischer Ersatz bei fehlendem Eintrag (sonst irreführend im Laden).
 */
export function foodName(
  id: FoodId | string,
  lang: LangCode,
): string | null {
  const glossary = GLOSSARIES[lang];
  if (!glossary) {
    return null;
  }
  const value = glossary[id];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Prüft, ob ein Lebensmittel gemäss den gewählten Vorlieben/Allergien erlaubt ist.
 * Verhaltensgleich zu `EXC`/`allowed` in `prototype/app.js` (Z. 684–688).
 */
export function isAllowed(
  food: Food,
  prefs: Readonly<Partial<Record<DietaryPref, boolean>>>,
): boolean {
  if (prefs.veg) {
    if (
      food.group === 'meat' ||
      food.group === 'fish' ||
      hasAnyAllergen(food, ['fish', 'crustaceans', 'molluscs'])
    ) {
      return false;
    }
  }

  if (prefs.vegan) {
    if (
      food.group === 'meat' ||
      food.group === 'fish' ||
      food.group === 'dairy' ||
      hasAnyAllergen(food, ['milk', 'eggs', 'fish', 'crustaceans', 'molluscs'])
    ) {
      return false;
    }
  }

  if (prefs.lactose && (food.group === 'dairy' || hasAnyAllergen(food, ['milk']))) {
    return false;
  }

  if (prefs.gluten && hasAnyAllergen(food, ['gluten'])) {
    return false;
  }

  if (prefs.nuts && hasAnyAllergen(food, ['nuts', 'peanuts'])) {
    return false;
  }

  if (prefs.d_fish && (food.group === 'fish' || hasAnyAllergen(food, ['fish']))) {
    return false;
  }

  if (prefs.d_mush && MUSHROOM_IDS.has(food.id)) {
    return false;
  }

  if (prefs.d_onion && ONION_IDS.has(food.id)) {
    return false;
  }

  if (prefs.d_cil && CILANTRO_IDS.has(food.id)) {
    return false;
  }

  return true;
}
