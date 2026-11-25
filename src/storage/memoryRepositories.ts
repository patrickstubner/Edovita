import { RECIPES } from '../../content/generated/catalog-index.ts';
import { LANGUAGES_REGISTRY } from '../../content/generated/locales-index.ts';
import {
  RECIPE_ID_RE,
  asRecipeId,
  coercePlan,
  coerceRating,
  coerceSettings,
  coerceShoppingItem,
  isSafeRecordKey,
  type LanguagesRegistry,
  type MealPlan,
  type RecipeId,
  type Settings,
  type ShoppingItem,
} from '../domain/index.ts';
import type {
  PlanRepository,
  RatingsRepository,
  SettingsRepository,
  ShoppingRepository,
  StorageBundle,
  StorageSnapshotPatch,
} from './repositories.ts';

const DEFAULT_KNOWN_RECIPE_IDS: ReadonlySet<string> = new Set(
  RECIPES.map((r) => r.id),
);

function clone<T>(value: T): T {
  return structuredClone(value);
}

function isValidRecipeKey(id: string): boolean {
  return RECIPE_ID_RE.test(id) && isSafeRecordKey(id);
}

export class MemorySettingsRepository implements SettingsRepository {
  private raw: unknown = undefined;
  private readonly registry: LanguagesRegistry;

  constructor(
    initial?: unknown,
    registry: LanguagesRegistry = LANGUAGES_REGISTRY,
  ) {
    this.registry = registry;
    if (initial !== undefined) {
      this.raw = clone(initial);
    }
  }

  async get(): Promise<Settings> {
    return coerceSettings(this.raw, this.registry);
  }

  async getStored(): Promise<Settings | null> {
    if (this.raw === undefined) {
      return null;
    }
    return coerceSettings(this.raw, this.registry);
  }

  async set(next: Settings): Promise<Settings> {
    const safe = coerceSettings(next, this.registry);
    this.raw = clone(safe);
    return clone(safe);
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    return this.set({ ...current, ...patch });
  }

  async clear(): Promise<void> {
    this.raw = undefined;
  }
}

export class MemoryShoppingRepository implements ShoppingRepository {
  private readonly items = new Map<string, unknown>();

  constructor(initial: readonly unknown[] = []) {
    for (const raw of initial) {
      const coerced = coerceShoppingItem(raw);
      if (coerced) {
        this.items.set(coerced.id, clone(coerced));
      }
    }
  }

  async list(): Promise<ShoppingItem[]> {
    const out: ShoppingItem[] = [];
    for (const raw of this.items.values()) {
      const coerced = coerceShoppingItem(raw);
      if (coerced) {
        out.push(clone(coerced));
      }
    }
    return out;
  }

  async get(id: string): Promise<ShoppingItem | undefined> {
    if (!isSafeRecordKey(id) || !this.items.has(id)) {
      return undefined;
    }
    const coerced = coerceShoppingItem(this.items.get(id));
    return coerced ? clone(coerced) : undefined;
  }

  async upsert(item: ShoppingItem): Promise<ShoppingItem> {
    const safe = coerceShoppingItem(item);
    if (!safe) {
      throw new Error('Ungültiger Einkaufsartikel.');
    }
    this.items.set(safe.id, clone(safe));
    return clone(safe);
  }

  async replaceAll(items: readonly ShoppingItem[]): Promise<ShoppingItem[]> {
    this.items.clear();
    const out: ShoppingItem[] = [];
    for (const item of items) {
      const safe = coerceShoppingItem(item);
      if (safe) {
        this.items.set(safe.id, clone(safe));
        out.push(clone(safe));
      }
    }
    return out;
  }

  async remove(id: string): Promise<void> {
    if (!isSafeRecordKey(id)) return;
    this.items.delete(id);
  }

  async clear(): Promise<void> {
    this.items.clear();
  }
}

export class MemoryRatingsRepository implements RatingsRepository {
  private readonly ratings = new Map<string, number>();
  private readonly saved = new Set<string>();

  async getRating(recipeId: RecipeId | string): Promise<number | null> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return null;
    }
    const value = this.ratings.get(recipeId);
    return coerceRating(value);
  }

  async setRating(
    recipeId: RecipeId | string,
    stars: number | null,
  ): Promise<void> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return;
    }
    if (stars === null) {
      this.ratings.delete(recipeId);
      return;
    }
    const safe = coerceRating(stars);
    if (safe === null) {
      throw new Error('Bewertung muss eine ganze Zahl zwischen 1 und 5 sein.');
    }
    this.ratings.set(recipeId, safe);
  }

  async listRatings(): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    for (const [key, val] of this.ratings.entries()) {
      const safe = coerceRating(val);
      if (isValidRecipeKey(key) && safe !== null) {
        out[key] = safe;
      }
    }
    return out;
  }

  async isSaved(recipeId: RecipeId | string): Promise<boolean> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return false;
    }
    return this.saved.has(recipeId);
  }

  async setSaved(recipeId: RecipeId | string, saved: boolean): Promise<void> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return;
    }
    if (saved) {
      this.saved.add(recipeId);
    } else {
      this.saved.delete(recipeId);
    }
  }

  async listSaved(): Promise<RecipeId[]> {
    return [...this.saved]
      .filter(isValidRecipeKey)
      .sort()
      .map((id) => asRecipeId(id));
  }

  async clear(): Promise<void> {
    this.ratings.clear();
    this.saved.clear();
  }
}

export class MemoryPlanRepository implements PlanRepository {
  private raw: unknown = undefined;
  private readonly knownRecipeIds: ReadonlySet<string>;

  constructor(
    initial?: unknown,
    knownRecipeIds: ReadonlySet<string> = DEFAULT_KNOWN_RECIPE_IDS,
  ) {
    this.knownRecipeIds = knownRecipeIds;
    if (initial !== undefined) {
      this.raw = clone(initial);
    }
  }

  async get(now?: Date): Promise<MealPlan> {
    return coercePlan(this.raw, {
      knownRecipeIds: this.knownRecipeIds,
      now,
    });
  }

  async set(plan: MealPlan, now?: Date): Promise<MealPlan> {
    const safe = coercePlan(plan, {
      knownRecipeIds: this.knownRecipeIds,
      now,
    });
    this.raw = clone(safe);
    return clone(safe);
  }

  async clear(): Promise<void> {
    this.raw = undefined;
  }
}

export function createMemoryStorage(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
  knownRecipeIds: ReadonlySet<string> = DEFAULT_KNOWN_RECIPE_IDS,
): StorageBundle {
  const settings = new MemorySettingsRepository(undefined, registry);
  const shopping = new MemoryShoppingRepository();
  const ratings = new MemoryRatingsRepository();
  const plan = new MemoryPlanRepository(undefined, knownRecipeIds);

  return {
    settings,
    shopping,
    ratings,
    plan,
    applyImport: async (patch: StorageSnapshotPatch): Promise<void> => {
      // Snapshot vor Änderungen sichern, damit ein Fehler den Altbestand unverändert lässt (G2 / F1b)
      const prevSettings = await settings.getStored();
      const prevShopping = await shopping.list();
      const prevRatings = await ratings.listRatings();
      const prevSaved = await ratings.listSaved();
      const prevPlan = await plan.get();

      try {
        if (patch.settings !== undefined) {
          await settings.set(patch.settings);
        }
        if (patch.shopping !== undefined) {
          await shopping.replaceAll(patch.shopping);
        }
        if (patch.ratings !== undefined || patch.saved !== undefined) {
          await ratings.clear();
          if (patch.ratings !== undefined) {
            for (const [recipeId, stars] of Object.entries(patch.ratings)) {
              if (isValidRecipeKey(recipeId)) {
                await ratings.setRating(recipeId, stars);
              }
            }
          }
          if (patch.saved !== undefined) {
            for (const recipeId of patch.saved) {
              if (isValidRecipeKey(recipeId)) {
                await ratings.setSaved(recipeId, true);
              }
            }
          }
        }
        if (patch.plan !== undefined) {
          await plan.set(patch.plan);
        }
      } catch (err) {
        if (prevSettings === null) {
          await settings.clear();
        } else {
          await settings.set(prevSettings);
        }
        await shopping.replaceAll(prevShopping);
        await ratings.clear();
        for (const [recipeId, stars] of Object.entries(prevRatings)) {
          await ratings.setRating(recipeId, stars);
        }
        for (const recipeId of prevSaved) {
          await ratings.setSaved(recipeId, true);
        }
        await plan.set(prevPlan);
        throw err;
      }
    },
  };
}
