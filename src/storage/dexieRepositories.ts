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
import { DEFAULT_DB_NAME, EdovitaDb } from './db.ts';
import type {
  RatingsRepository,
  SettingsRepository,
  ShoppingRepository,
  StorageBundle,
} from './repositories.ts';

function isValidRecipeKey(id: string): boolean {
  return RECIPE_ID_RE.test(id) && isSafeRecordKey(id);
}

export class DexieSettingsRepository implements SettingsRepository {
  private readonly db: EdovitaDb;
  private readonly registry: LanguagesRegistry;

  constructor(
    db: EdovitaDb,
    registry: LanguagesRegistry = LANGUAGES_REGISTRY,
  ) {
    this.db = db;
    this.registry = registry;
  }

  async get(): Promise<Settings> {
    const row = await this.db.settings.get('current');
    return coerceSettings(row?.value, this.registry);
  }

  async set(next: Settings): Promise<Settings> {
    const safe = coerceSettings(next, this.registry);
    await this.db.settings.put({ key: 'current', value: safe });
    return { ...safe };
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    return this.set({ ...current, ...patch });
  }

  async clear(): Promise<void> {
    await this.db.settings.clear();
  }
}

export class DexieShoppingRepository implements ShoppingRepository {
  private readonly db: EdovitaDb;

  constructor(db: EdovitaDb) {
    this.db = db;
  }

  async list(): Promise<ShoppingItem[]> {
    const rows = await this.db.shopping.toArray();
    const out: ShoppingItem[] = [];
    for (const row of rows) {
      const coerced = coerceShoppingItem(row);
      if (coerced) {
        out.push(coerced);
      }
    }
    return out;
  }

  async get(id: string): Promise<ShoppingItem | undefined> {
    if (!isSafeRecordKey(id)) {
      return undefined;
    }
    const row = await this.db.shopping.get(id);
    if (!row) return undefined;
    return coerceShoppingItem(row) ?? undefined;
  }

  async upsert(item: ShoppingItem): Promise<ShoppingItem> {
    const safe = coerceShoppingItem(item);
    if (!safe) {
      throw new Error('Ungültiger Einkaufsartikel.');
    }
    await this.db.shopping.put(safe);
    return structuredClone(safe);
  }

  async replaceAll(items: readonly ShoppingItem[]): Promise<ShoppingItem[]> {
    const valid: ShoppingItem[] = [];
    for (const item of items) {
      const safe = coerceShoppingItem(item);
      if (safe) {
        valid.push(safe);
      }
    }
    await this.db.transaction('rw', this.db.shopping, async () => {
      await this.db.shopping.clear();
      if (valid.length > 0) {
        await this.db.shopping.bulkPut(valid);
      }
    });
    return valid.map((it) => structuredClone(it));
  }

  async remove(id: string): Promise<void> {
    if (!isSafeRecordKey(id)) return;
    await this.db.shopping.delete(id);
  }

  async clear(): Promise<void> {
    await this.db.shopping.clear();
  }
}

export class DexieRatingsRepository implements RatingsRepository {
  private readonly db: EdovitaDb;

  constructor(db: EdovitaDb) {
    this.db = db;
  }

  async getRating(recipeId: RecipeId | string): Promise<number | null> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return null;
    }
    const row = await this.db.ratings.get(recipeId);
    return coerceRating(row?.stars);
  }

  async setRating(
    recipeId: RecipeId | string,
    stars: number | null,
  ): Promise<void> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return;
    }
    if (stars === null) {
      await this.db.ratings.delete(recipeId);
      return;
    }
    const safe = coerceRating(stars);
    if (safe === null) {
      throw new Error('Bewertung muss eine ganze Zahl zwischen 1 und 5 sein.');
    }
    await this.db.ratings.put({ recipeId, stars: safe });
  }

  async listRatings(): Promise<Record<string, number>> {
    const rows = await this.db.ratings.toArray();
    const out: Record<string, number> = {};
    for (const row of rows) {
      const safe = coerceRating(row?.stars);
      if (
        typeof row?.recipeId === 'string' &&
        isValidRecipeKey(row.recipeId) &&
        safe !== null
      ) {
        out[row.recipeId] = safe;
      }
    }
    return out;
  }

  async isSaved(recipeId: RecipeId | string): Promise<boolean> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return false;
    }
    const row = await this.db.saved.get(recipeId);
    return row !== undefined;
  }

  async setSaved(recipeId: RecipeId | string, saved: boolean): Promise<void> {
    if (typeof recipeId !== 'string' || !isValidRecipeKey(recipeId)) {
      return;
    }
    if (saved) {
      await this.db.saved.put({
        recipeId,
        savedAt: new Date().toISOString(),
      });
    } else {
      await this.db.saved.delete(recipeId);
    }
  }

  async listSaved(): Promise<RecipeId[]> {
    const rows = await this.db.saved.toArray();
    return rows
      .map((r) => r.recipeId)
      .filter((id): id is string => typeof id === 'string' && isValidRecipeKey(id))
      .sort()
      .map((id) => asRecipeId(id));
  }

  async clear(): Promise<void> {
    await this.db.transaction('rw', this.db.ratings, this.db.saved, async () => {
      await this.db.ratings.clear();
      await this.db.saved.clear();
    });
  }
}

export interface DexieStorageBundle extends StorageBundle {
  readonly db: EdovitaDb;
}

export function createDexieStorage(
  dbName: string = DEFAULT_DB_NAME,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): DexieStorageBundle {
  const db = new EdovitaDb(dbName);
  return {
    db,
    settings: new DexieSettingsRepository(db, registry),
    shopping: new DexieShoppingRepository(db),
    ratings: new DexieRatingsRepository(db),
    close: () => db.close(),
  };
}
