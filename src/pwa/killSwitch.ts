import { isEdovitaCacheName } from './config.ts';

export interface KillSwitchRegistrationLike {
  unregister: () => Promise<boolean>;
}

export interface KillSwitchSwContainerLike {
  getRegistrations: () => Promise<readonly KillSwitchRegistrationLike[]>;
}

export interface KillSwitchCacheStorageLike {
  keys: () => Promise<string[]>;
  delete: (cacheName: string) => Promise<boolean>;
}

export interface PwaKillSwitchOptions {
  serviceWorker?: KillSwitchSwContainerLike | null;
  cacheStorage?: KillSwitchCacheStorageLike | null;
}

export interface PwaKillSwitchResult {
  unregisteredCount: number;
  deletedCaches: string[];
}

/**
 * Runtime emergency kill switch (E7b, ADR-004).
 * Unregisters active service workers and deletes ONLY Edovita caches
 * (`edovita-shell-*`, `edovita-thumbs-*`, `edovita-images-*`).
 * Never touches IndexedDB/Dexie user data or unrelated browser caches.
 */
export async function runPwaKillSwitch(
  options: PwaKillSwitchOptions = {},
): Promise<PwaKillSwitchResult> {
  let unregisteredCount = 0;
  const deletedCaches: string[] = [];

  const swContainer =
    options.serviceWorker !== undefined
      ? options.serviceWorker
      : typeof navigator !== 'undefined' && 'serviceWorker' in navigator
        ? navigator.serviceWorker
        : null;

  if (swContainer && typeof swContainer.getRegistrations === 'function') {
    try {
      const registrations = await swContainer.getRegistrations();
      for (const reg of registrations) {
        try {
          const ok = await reg.unregister();
          if (ok) {
            unregisteredCount += 1;
          }
        } catch {
          // Continue cleaning up remaining registrations.
        }
      }
    } catch {
      // Service Worker API unavailable or restricted.
    }
  }

  const cacheStorage =
    options.cacheStorage !== undefined
      ? options.cacheStorage
      : typeof caches !== 'undefined'
        ? caches
        : null;

  if (cacheStorage && typeof cacheStorage.keys === 'function') {
    try {
      const keys = await cacheStorage.keys();
      for (const key of keys) {
        if (!isEdovitaCacheName(key)) {
          continue;
        }
        try {
          const deleted = await cacheStorage.delete(key);
          if (deleted) {
            deletedCaches.push(key);
          }
        } catch {
          // Continue cleaning up remaining Edovita caches.
        }
      }
    } catch {
      // CacheStorage API unavailable or restricted.
    }
  }

  return { unregisteredCount, deletedCaches };
}
