import { LANGUAGES_REGISTRY } from '../../content/generated/locales-index.ts';
import {
  RECIPE_ID_RE,
  asRecipeId,
  coerceRating,
  coerceSettings,
  coerceShoppingItem,
  isSafeRecordKey,
  type LanguagesRegistry,
  type RecipeId,
  type Settings,
  type ShoppingItem,
} from '../domain/index.ts';
import type {
  RatingsRepository,
  SettingsRepository,
  ShoppingRepository,
  StorageBundle,
} from './repositories.ts';

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

export function createMemoryStorage(
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): StorageBundle {
  return {
    settings: new MemorySettingsRepository(undefined, registry),
    shopping: new MemoryShoppingRepository(),
    ratings: new MemoryRatingsRepository(),
  };
}
