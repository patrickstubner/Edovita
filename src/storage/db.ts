import Dexie, { type EntityTable, type Transaction } from 'dexie';
import {
  coerceQtyHave,
  type MealPlan,
  type Settings,
  type ShoppingItem,
} from '../domain/index.ts';

export const DEFAULT_DB_NAME = 'edovita';
export const CURRENT_DB_VERSION = 4;

export interface StoredSettingsRow {
  key: 'current';
  value: Settings;
}

export interface StoredPlanRow {
  key: 'current';
  value: MealPlan;
}

export interface StoredRatingRow {
  recipeId: string;
  stars: number;
}

export interface StoredSavedRow {
  recipeId: string;
  savedAt: string;
}

export interface SchemaMigration {
  version: number;
  stores: Record<string, string | null>;
  upgrade?: (tx: Transaction) => Promise<void> | void;
}

/**
 * Zentrale Dexie-Schema-Definitionen ab v1 (ADR-002).
 * Künftige Schema-Änderungen werden als neue Versionen (2, 3, 4, …) mit eigenem
 * `upgrade`-Schritt und zugehörigem Migrationstest ergänzt.
 */
export const EDOVITA_SCHEMA_V1: Readonly<Record<string, string>> = {
  settings: 'key',
  shopping: 'id, food, state, addedAt',
  ratings: 'recipeId',
  saved: 'recipeId',
};

export const EDOVITA_SCHEMA_V3: Readonly<Record<string, string>> = {
  ...EDOVITA_SCHEMA_V1,
  plan: 'key',
};

export const EDOVITA_MIGRATIONS: readonly SchemaMigration[] = [
  {
    version: 1,
    stores: { ...EDOVITA_SCHEMA_V1 },
  },
  {
    version: 2,
    stores: { ...EDOVITA_SCHEMA_V1 },
    upgrade: async (tx) => {
      await tx
        .table('shopping')
        .toCollection()
        .modify((row: Record<string, unknown>) => {
          const need =
            typeof row.amount === 'number' &&
            Number.isFinite(row.amount) &&
            row.amount > 0
              ? row.amount
              : undefined;
          row.qtyHave = coerceQtyHave(row.qtyHave, need);
        });
    },
  },
  {
    version: 3,
    stores: { ...EDOVITA_SCHEMA_V3 },
  },
  {
    version: 4,
    stores: { ...EDOVITA_SCHEMA_V3 },
    upgrade: async (tx) => {
      await tx
        .table('shopping')
        .toCollection()
        .modify((row: Record<string, unknown>) => {
          const amount =
            typeof row.amount === 'number' &&
            Number.isFinite(row.amount) &&
            row.amount > 0
              ? row.amount
              : 0;
          if (row.qtyExtra === undefined) {
            row.qtyExtra = amount;
          }
          if (row.qtyPlan === undefined) {
            row.qtyPlan = 0;
          }
          if (!Array.isArray(row.recipesExtra)) {
            row.recipesExtra = Array.isArray(row.fromRecipes)
              ? [...row.fromRecipes]
              : [];
          }
          if (!Array.isArray(row.recipesPlan)) {
            row.recipesPlan = [];
          }
          const need = amount > 0 ? amount : undefined;
          const nextHave = coerceQtyHave(row.qtyHave, need);
          row.qtyHave = nextHave;
          if (need !== undefined && nextHave >= need) {
            row.state = 'home';
          }
        });
    },
  },
];

export function applyMigrations(
  db: Dexie,
  migrations: readonly SchemaMigration[] = EDOVITA_MIGRATIONS,
): void {
  for (const step of migrations) {
    const version = db.version(step.version).stores(step.stores);
    if (step.upgrade) {
      version.upgrade(step.upgrade);
    }
  }
}

export class EdovitaDb extends Dexie {
  settings!: EntityTable<StoredSettingsRow, 'key'>;
  shopping!: EntityTable<ShoppingItem, 'id'>;
  ratings!: EntityTable<StoredRatingRow, 'recipeId'>;
  saved!: EntityTable<StoredSavedRow, 'recipeId'>;
  plan!: EntityTable<StoredPlanRow, 'key'>;

  constructor(
    name: string = DEFAULT_DB_NAME,
    migrations: readonly SchemaMigration[] = EDOVITA_MIGRATIONS,
  ) {
    super(name);
    applyMigrations(this, migrations);
  }
}
