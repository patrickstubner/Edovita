/**
 * Speicher-Schicht (ADR-001, ADR-002, ADR-004).
 * Stellt austauschbare Repositories (Dexie/IndexedDB und Memory), Schema-Migrationen,
 * Whitelist-Normalisierung (`coerceSettings`), Export/Import (`format: 1`) und `wipeAll` bereit.
 */
import { LANGUAGES_REGISTRY } from '../../content/generated/locales-index.ts';
import {
  coerceSettings as coerceSettingsWithRegistry,
  type LanguagesRegistry,
  type Settings,
} from '../domain/index.ts';

export const STORAGE_LAYER_VERSION = 1;

/**
 * Normalisiert gelesene Einstellungen standardmässig gegen `LANGUAGES_REGISTRY` (ADR-002, F1, F3a).
 */
export function coerceSettings(
  raw: unknown,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): Settings {
  return coerceSettingsWithRegistry(raw, registry);
}

export {
  CURRENT_DB_VERSION,
  DEFAULT_DB_NAME,
  EDOVITA_MIGRATIONS,
  EDOVITA_SCHEMA_V1,
  EDOVITA_SCHEMA_V3,
  EdovitaDb,
  applyMigrations,
  type SchemaMigration,
  type StoredPlanRow,
  type StoredRatingRow,
  type StoredSavedRow,
  type StoredSettingsRow,
} from './db.ts';

export type {
  PlanRepository,
  RatingsRepository,
  SettingsRepository,
  ShoppingRepository,
  StorageBundle,
  StorageSnapshotPatch,
} from './repositories.ts';

export {
  DexiePlanRepository,
  DexieRatingsRepository,
  DexieSettingsRepository,
  DexieShoppingRepository,
  createDexieStorage,
  type DexieStorageBundle,
} from './dexieRepositories.ts';

export {
  MemoryPlanRepository,
  MemoryRatingsRepository,
  MemorySettingsRepository,
  MemoryShoppingRepository,
  createMemoryStorage,
} from './memoryRepositories.ts';

export {
  clearEdovitaLocalStorage,
  exportAll,
  exportBundleV1Schema,
  exportPlanTransferBundle,
  importAll,
  importPlanTransferBundle,
  settingsSchema,
  wipeAll,
  type ImportErrorCode,
  type PlanTransferImportErrorCode,
} from './exportImport.ts';
