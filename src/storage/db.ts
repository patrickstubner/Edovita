import Dexie, { type EntityTable, type Transaction } from 'dexie';
import type { Settings, ShoppingItem } from '../domain/index.ts';

export const DEFAULT_DB_NAME = 'edovita';
export const CURRENT_DB_VERSION = 1;

export interface StoredSettingsRow {
  key: 'current';
  value: Settings;
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
 * Künftige Schema-Änderungen werden als neue Versionen (2, 3, …) mit eigenem
 * `upgrade`-Schritt und zugehörigem Migrationstest ergänzt.
 */
export const EDOVITA_SCHEMA_V1: Readonly<Record<string, string>> = {
  settings: 'key',
  shopping: 'id, food, state, addedAt',
  ratings: 'recipeId',
  saved: 'recipeId',
};

export const EDOVITA_MIGRATIONS: readonly SchemaMigration[] = [
  {
    version: 1,
    stores: { ...EDOVITA_SCHEMA_V1 },
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

  constructor(
    name: string = DEFAULT_DB_NAME,
    migrations: readonly SchemaMigration[] = EDOVITA_MIGRATIONS,
  ) {
    super(name);
    applyMigrations(this, migrations);
  }
}
