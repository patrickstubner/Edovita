import { isEdovitaCacheName, normalizeBasePath } from './config.ts';

export interface KillSwitchRegistrationLike {
  scope?: string;
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
  /** App base path (`/` locally or `/Edovita/` on GitHub Pages). Defaults to `/`. */
  basePath?: string;
  /** Expected app origin; defaults to `window.location.origin` when available. */
  origin?: string;
  serviceWorker?: KillSwitchSwContainerLike | null;
  cacheStorage?: KillSwitchCacheStorageLike | null;
}

export interface PwaKillSwitchResult {
  unregisteredCount: number;
  deletedCaches: string[];
}

/**
 * Checks whether a service worker registration scope belongs strictly to this
 * Edovita deployment (`origin` + normalized `basePath`), preventing accidental
 * unregistration of sibling apps hosted on a shared `*.github.io` origin.
 */
export function isMatchingAppScope(
  registrationScope: string | undefined,
  basePath: string,
  origin: string,
): boolean {
  if (!registrationScope) {
    return false;
  }
  let parsed: URL;
  try {
    parsed = new URL(registrationScope);
  } catch {
    return false;
  }
  if (origin && parsed.origin !== origin) {
    return false;
  }
  return normalizeBasePath(parsed.pathname) === normalizeBasePath(basePath);
}

/**
 * Runtime emergency kill switch (E7b, ADR-004).
 * Unregisters ONLY service workers whose scope matches this app's base path
 * (`/` locally or `/Edovita/` on GitHub Pages) and deletes ONLY Edovita caches
 * (`edovita-shell-*`, `edovita-thumbs-*`, `edovita-images-*`).
 * Never touches sibling apps on a shared origin, IndexedDB/Dexie user data,
 * or unrelated browser caches. Note: not wired into the UI yet.
 */
export async function runPwaKillSwitch(
  options: PwaKillSwitchOptions = {},
): Promise<PwaKillSwitchResult> {
  let unregisteredCount = 0;
  const deletedCaches: string[] = [];
  const basePath = normalizeBasePath(options.basePath ?? '/');
  const origin =
    options.origin !== undefined
      ? options.origin
      : typeof window !== 'undefined' && window.location
        ? window.location.origin
        : '';

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
        if (!isMatchingAppScope(reg.scope, basePath, origin)) {
          continue;
        }
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
