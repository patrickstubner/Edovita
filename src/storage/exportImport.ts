import { LANGUAGES_REGISTRY } from '../../content/generated/locales-index.ts';
import {
  RECIPE_ID_RE,
  asRecipeId,
  createExportBundleV1Schema,
  createSettingsSchema,
  isSafeRecordKey,
  type ExportBundleV1,
  type LanguagesRegistry,
  type Result,
} from '../domain/index.ts';
import type { EdovitaDb } from './db.ts';
import type { StorageBundle } from './repositories.ts';

/** Registry-gebundenes Settings-Schema (F1/F3a: nur freigegebene UI-Sprachen & registry.secondary). */
export const settingsSchema = createSettingsSchema(LANGUAGES_REGISTRY);

/** Registry-gebundenes Export-Bundle-Schema Format 1 (ADR-002). */
export const exportBundleV1Schema =
  createExportBundleV1Schema(LANGUAGES_REGISTRY);

export type ImportErrorCode = 'parse' | 'schema' | 'write';

const MAX_IMPORT_JSON_BYTES = 1_000_000;
const LOCAL_STORAGE_PREFIX = 'edovita.';

/**
 * Exportiert alle lokalen Nutzerdaten als versioniertes JSON-Bundle (`format: 1`, ADR-002 & ADR-004).
 */
export async function exportAll(
  storage: StorageBundle,
  options?: {
    now?: () => Date;
    registry?: LanguagesRegistry;
  },
): Promise<ExportBundleV1> {
  const registry = options?.registry ?? LANGUAGES_REGISTRY;
  const [settings, shopping, ratings, saved] = await Promise.all([
    storage.settings.get(),
    storage.shopping.list(),
    storage.ratings.listRatings(),
    storage.ratings.listSaved(),
  ]);

  const bundle: ExportBundleV1 = {
    format: 1,
    exportedAt: (options?.now ?? (() => new Date()))().toISOString(),
    data: {
      settings,
      shopping,
      ratings,
      saved,
    },
  };

  return createExportBundleV1Schema(registry).parse(bundle);
}

function hasForbiddenOwnKey(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some(hasForbiddenOwnKey);
  }
  const obj = value as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(obj)) {
    if (!isSafeRecordKey(key)) {
      return true;
    }
    if (hasForbiddenOwnKey(obj[key])) {
      return true;
    }
  }
  return false;
}

/**
 * Validiert ein Export-Bundle (`format: 1`) streng per `zod` (inkl. Rechts-Gate F1 und
 * `registry.secondary` F3a) und ersetzt bestehende Daten atomar in einer Transaktion (G2).
 * Bei Validierungs- oder Schreibfehlern bleiben bestehende Daten vollständig unverändert.
 */
export async function importAll(
  storage: StorageBundle,
  rawInput: unknown,
  registry: LanguagesRegistry = LANGUAGES_REGISTRY,
): Promise<Result<ExportBundleV1, ImportErrorCode>> {
  let candidate: unknown = rawInput;
  if (typeof rawInput === 'string') {
    if (rawInput.length > MAX_IMPORT_JSON_BYTES) {
      return { ok: false, error: 'parse' };
    }
    try {
      candidate = JSON.parse(rawInput);
    } catch {
      return { ok: false, error: 'parse' };
    }
  }

  if (hasForbiddenOwnKey(candidate)) {
    return { ok: false, error: 'schema' };
  }

  const parsed = createExportBundleV1Schema(registry).safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, error: 'schema' };
  }

  const bundle = parsed.data;
  const { settings, shopping, ratings, saved } = bundle.data;

  const safeRatings: Record<string, number> | undefined =
    ratings === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(ratings).filter(
            ([recipeId]) =>
              RECIPE_ID_RE.test(recipeId) && isSafeRecordKey(recipeId),
          ),
        );

  const safeSaved =
    saved === undefined
      ? undefined
      : saved
          .filter(
            (recipeId) =>
              RECIPE_ID_RE.test(recipeId) && isSafeRecordKey(recipeId),
          )
          .map(asRecipeId);

  if (storage.applyImport) {
    try {
      await storage.applyImport({
        settings,
        shopping,
        ratings: safeRatings,
        saved: safeSaved,
      });
      return { ok: true, value: bundle };
    } catch {
      return { ok: false, error: 'write' };
    }
  }

  // Fallback für eigene StorageBundle-Implementierungen ohne applyImport: Snapshot + Rollback
  const prevSettings = storage.settings.getStored
    ? await storage.settings.getStored()
    : await storage.settings.get();
  const prevShopping = await storage.shopping.list();
  const prevRatings = await storage.ratings.listRatings();
  const prevSaved = await storage.ratings.listSaved();

  try {
    if (settings !== undefined) {
      await storage.settings.set(settings);
    }
    if (shopping !== undefined) {
      await storage.shopping.replaceAll(shopping);
    }
    if (safeRatings !== undefined || safeSaved !== undefined) {
      await storage.ratings.clear();
      if (safeRatings !== undefined) {
        for (const [recipeId, stars] of Object.entries(safeRatings)) {
          await storage.ratings.setRating(recipeId, stars);
        }
      }
      if (safeSaved !== undefined) {
        for (const recipeId of safeSaved) {
          await storage.ratings.setSaved(recipeId, true);
        }
      }
    }
    return { ok: true, value: bundle };
  } catch {
    try {
      if (prevSettings === null) {
        await storage.settings.clear();
      } else {
        await storage.settings.set(prevSettings);
      }
      await storage.shopping.replaceAll(prevShopping);
      await storage.ratings.clear();
      for (const [recipeId, stars] of Object.entries(prevRatings)) {
        await storage.ratings.setRating(recipeId, stars);
      }
      for (const recipeId of prevSaved) {
        await storage.ratings.setSaved(recipeId, true);
      }
    } catch {
      // Rollback-Fehler nicht nach aussen lecken
    }
    return { ok: false, error: 'write' };
  }
}

export function clearEdovitaLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(LOCAL_STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Privates Fenster / eingeschränkter Speicherzugriff
  }
}

/**
 * «Alles löschen» gemäss ADR-004: leert alle Repositories (IndexedDB/Memory)
 * sowie alle `edovita.*`-Schlüssel in `localStorage`.
 */
export async function wipeAll(
  storage: StorageBundle,
  options?: {
    clearLocalStorage?: boolean;
    db?: EdovitaDb;
  },
): Promise<void> {
  await Promise.all([
    storage.settings.clear(),
    storage.shopping.clear(),
    storage.ratings.clear(),
  ]);

  if (options?.clearLocalStorage !== false) {
    clearEdovitaLocalStorage();
  }

  if (options?.db) {
    await options.db.transaction(
      'rw',
      [
        options.db.settings,
        options.db.shopping,
        options.db.ratings,
        options.db.saved,
      ],
      async () => {
        await options.db!.settings.clear();
        await options.db!.shopping.clear();
        await options.db!.ratings.clear();
        await options.db!.saved.clear();
      },
    );
  }
}
