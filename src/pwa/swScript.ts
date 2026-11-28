import {
  MAX_RUNTIME_IMAGE_ENTRIES,
  PWA_CACHE_PREFIX,
  PWA_CACHE_PREFIXES,
  PWA_IMAGES_CACHE_PREFIX,
  PWA_THUMBS_CACHE_PREFIX,
  filterAppShellPaths,
  filterRecipeThumbPaths,
  normalizeBasePath,
  type PwaCacheNames,
} from './config.ts';

export interface ServiceWorkerBuildConfig {
  cacheNames: PwaCacheNames;
  basePath: string;
  shellPaths: readonly string[];
  thumbPaths: readonly string[];
  maxRuntimeImageEntries?: number;
}

/**
 * Generates the self-contained E7b service worker script.
 *
 * Security & privacy invariants (ADR-004):
 * - Precaches ONLY whitelisted app shell (HTML, JS/CSS incl. catalog/locales & async chunks,
 *   manifest, icons, logos) and recipe thumbnails (`*-thumb*.webp`).
 * - Full-size recipe images (`static/image/<id>.<hash>.webp`) are NOT precached;
 *   they are served cache-first into a bounded, versioned runtime cache on first open.
 * - Never caches user data, IndexedDB/Dexie content, API responses, non-GET,
 *   cross-origin, query-string assets, or URL hash fragments (`#import=...`).
 * - Never calls `skipWaiting()` automatically during `install`; waits for explicit
 *   `{ type: 'SKIP_WAITING' }` message after user confirmation in the update banner.
 * - Cleans up only obsolete Edovita caches during `activate`.
 */
export function generateServiceWorkerScript(
  config: ServiceWorkerBuildConfig,
): string {
  const basePath = normalizeBasePath(config.basePath);
  const { shell, thumbs, images } = config.cacheNames;
  if (
    !shell.startsWith(PWA_CACHE_PREFIX) ||
    !thumbs.startsWith(PWA_THUMBS_CACHE_PREFIX) ||
    !images.startsWith(PWA_IMAGES_CACHE_PREFIX)
  ) {
    throw new Error('Service worker cache names must use Edovita prefixes.');
  }

  const shellPaths = filterAppShellPaths(config.shellPaths, basePath);
  const thumbPaths = filterRecipeThumbPaths(config.thumbPaths, basePath);
  const indexPath = `${basePath}index.html`;
  if (!shellPaths.includes(indexPath)) {
    throw new Error('Service worker app shell must include index.html.');
  }

  const maxImages = Math.max(
    1,
    Math.floor(config.maxRuntimeImageEntries ?? MAX_RUNTIME_IMAGE_ENTRIES),
  );

  return `/* Edovita Service Worker (E7b offline PWA, generated at build time).
   - Precaches ONLY whitelisted app shell (HTML/JS/CSS/manifest/icons/logos) and *-thumb.webp thumbnails.
   - Full-size recipe images are cache-first in a bounded, versioned runtime cache.
   - Never caches user data, IndexedDB/Dexie content, API responses, non-GET, cross-origin,
     query-string assets, or #import fragments.
   - Never calls skipWaiting() silently; activates waiting updates only on user SKIP_WAITING message. */
'use strict';

var CACHE_PREFIXES = ${JSON.stringify(PWA_CACHE_PREFIXES)};
var SHELL_CACHE_NAME = ${JSON.stringify(shell)};
var THUMBS_CACHE_NAME = ${JSON.stringify(thumbs)};
var IMAGES_CACHE_NAME = ${JSON.stringify(images)};
var ACTIVE_CACHES = new Set([SHELL_CACHE_NAME, THUMBS_CACHE_NAME, IMAGES_CACHE_NAME]);
var BASE_PATH = ${JSON.stringify(basePath)};
var SHELL_INDEX_PATH = ${JSON.stringify(indexPath)};
var SHELL_PATHS = ${JSON.stringify(shellPaths)};
var THUMB_PATHS = ${JSON.stringify(thumbPaths)};
var SHELL_PATH_SET = new Set(SHELL_PATHS);
var THUMB_PATH_SET = new Set(THUMB_PATHS);
var MAX_RUNTIME_IMAGE_ENTRIES = ${JSON.stringify(maxImages)};
var PRECACHE_BATCH_SIZE = 12;
var RECIPE_THUMB_REL_RE = /^static\\/image\\/([a-z0-9_]+)-thumb(?:\\.[0-9a-f]+)?\\.webp$/;
var RECIPE_FULL_REL_RE = /^static\\/image\\/([a-z0-9_]+)(?:\\.[0-9a-f]+)?\\.webp$/;
var THUMB_BY_ID = Object.create(null);

for (var tIdx = 0; tIdx < THUMB_PATHS.length; tIdx += 1) {
  var tPath = THUMB_PATHS[tIdx];
  var tMatch = RECIPE_THUMB_REL_RE.exec(tPath.slice(BASE_PATH.length));
  if (tMatch) {
    THUMB_BY_ID[tMatch[1]] = tPath;
  }
}

function isEdovitaCache(key) {
  for (var i = 0; i < CACHE_PREFIXES.length; i += 1) {
    if (key.indexOf(CACHE_PREFIXES[i]) === 0) {
      return true;
    }
  }
  return false;
}

function addAllBatched(cache, urls) {
  var chain = Promise.resolve();
  for (var i = 0; i < urls.length; i += PRECACHE_BATCH_SIZE) {
    (function (batch) {
      chain = chain.then(function () {
        var requests = batch.map(function (url) {
          return new Request(url, { cache: 'reload' });
        });
        return cache.addAll(requests);
      });
    })(urls.slice(i, i + PRECACHE_BATCH_SIZE));
  }
  return chain;
}

function isFullRecipeImagePath(pathname) {
  if (
    pathname.indexOf(BASE_PATH) !== 0 ||
    pathname.indexOf('..') !== -1 ||
    pathname.indexOf('\\\\') !== -1
  ) {
    return false;
  }
  var relative = pathname.slice(BASE_PATH.length);
  if (RECIPE_THUMB_REL_RE.test(relative)) {
    return false;
  }
  return RECIPE_FULL_REL_RE.test(relative);
}

function matchThumbFallbackForFullPath(pathname) {
  var relative = pathname.slice(BASE_PATH.length);
  var match = RECIPE_FULL_REL_RE.exec(relative);
  var thumbPath = match ? THUMB_BY_ID[match[1]] : null;
  if (!thumbPath) {
    return Promise.resolve(undefined);
  }
  return caches.open(THUMBS_CACHE_NAME).then(function (thumbCache) {
    return thumbCache.match(thumbPath);
  });
}

function isCacheableFullImageResponse(response) {
  if (!response || response.ok !== true || response.status !== 200) {
    return false;
  }
  if (response.type !== 'basic') {
    return false;
  }
  if (!response.headers || typeof response.headers.get !== 'function') {
    return false;
  }
  var contentType = response.headers.get('content-type');
  if (
    typeof contentType !== 'string' ||
    contentType.toLowerCase().indexOf('image/webp') !== 0
  ) {
    return false;
  }
  return true;
}

function isValidSkipWaitingMessage(event) {
  if (!event || !event.source || typeof event.source.url !== 'string') {
    return false;
  }
  var scope =
    self.registration && typeof self.registration.scope === 'string'
      ? self.registration.scope
      : self.location.origin + BASE_PATH;
  if (event.source.url.indexOf(scope) !== 0) {
    return false;
  }
  var data = event.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  var keys = Object.keys(data);
  return keys.length === 1 && keys[0] === 'type' && data.type === 'SKIP_WAITING';
}

function enforceBoundedImageCache(cache) {
  return cache.keys().then(function (keys) {
    if (keys.length <= MAX_RUNTIME_IMAGE_ENTRIES) {
      return;
    }
    var excess = keys.length - MAX_RUNTIME_IMAGE_ENTRIES;
    var deletions = [];
    for (var i = 0; i < excess; i += 1) {
      deletions.push(cache.delete(keys[i]));
    }
    return Promise.all(deletions);
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE_NAME).then(function (cache) {
        return addAllBatched(cache, SHELL_PATHS);
      }),
      caches.open(THUMBS_CACHE_NAME).then(function (cache) {
        return addAllBatched(cache, THUMB_PATHS);
      }),
    ]),
  );
});

self.addEventListener('message', function (event) {
  if (isValidSkipWaitingMessage(event)) {
    self.skipWaiting();
  }
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return isEdovitaCache(key) && !ACTIVE_CACHES.has(key);
            })
            .map(function (key) {
              return caches.delete(key);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (!request || request.method !== 'GET') {
    return;
  }

  var url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (
    url.pathname.indexOf('/api/') === 0 ||
    url.pathname.indexOf(BASE_PATH + 'api/') === 0
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    if (url.pathname !== BASE_PATH && url.pathname !== SHELL_INDEX_PATH) {
      return;
    }
    event.respondWith(
      caches.open(SHELL_CACHE_NAME).then(function (cache) {
        return cache.match(SHELL_INDEX_PATH).then(function (cached) {
          return cached || fetch(request);
        });
      }),
    );
    return;
  }

  if (url.search !== '') {
    return;
  }

  if (SHELL_PATH_SET.has(url.pathname)) {
    event.respondWith(
      caches.open(SHELL_CACHE_NAME).then(function (cache) {
        return cache.match(url.pathname).then(function (cached) {
          return cached || fetch(request);
        });
      }),
    );
    return;
  }

  if (THUMB_PATH_SET.has(url.pathname)) {
    event.respondWith(
      caches.open(THUMBS_CACHE_NAME).then(function (cache) {
        return cache.match(url.pathname).then(function (cached) {
          return cached || fetch(request);
        });
      }),
    );
    return;
  }

  if (isFullRecipeImagePath(url.pathname)) {
    event.respondWith(
      caches.open(IMAGES_CACHE_NAME).then(function (cache) {
        return cache.match(url.pathname).then(function (cached) {
          if (cached) {
            return cached;
          }
          return fetch(request)
            .then(function (networkResponse) {
              if (!isCacheableFullImageResponse(networkResponse)) {
                return networkResponse;
              }
              var responseToCache = networkResponse.clone();
              return cache
                .put(url.pathname, responseToCache)
                .then(function () {
                  return enforceBoundedImageCache(cache);
                })
                .then(function () {
                  return networkResponse;
                });
            })
            .catch(function (err) {
              return matchThumbFallbackForFullPath(url.pathname).then(
                function (thumbRes) {
                  if (thumbRes) {
                    return thumbRes;
                  }
                  throw err;
                },
              );
            });
        });
      }),
    );
  }
});
`;
}

/**
 * Generates an emergency self-unregistering kill-switch service worker
 * (`PWA_KILL_SWITCH=true`). Deletes only Edovita caches and unregisters itself
 * without ever touching IndexedDB/Dexie user data.
 *
 * Keeping normal SW registration active in a kill-switch build is intentional
 * and harmless: returning clients with an older worker actively check `sw.js`
 * (`updateViaCache: 'none'`), activate this kill-switch worker, clear Edovita
 * caches, and unregister it; fresh clients immediately self-unregister on
 * `activate`, leaving zero active worker and zero caches.
 */
export function generateKillSwitchServiceWorkerScript(): string {
  return `/* Edovita Emergency Kill-Switch Service Worker (PWA_KILL_SWITCH=true).
   Unregisters itself and clears only Edovita caches; IndexedDB/Dexie remains untouched. */
'use strict';

var CACHE_PREFIXES = ${JSON.stringify(PWA_CACHE_PREFIXES)};

function isEdovitaCache(key) {
  for (var i = 0; i < CACHE_PREFIXES.length; i += 1) {
    if (key.indexOf(CACHE_PREFIXES[i]) === 0) {
      return true;
    }
  }
  return false;
}

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(isEdovitaCache)
            .map(function (key) {
              return caches.delete(key);
            }),
        );
      })
      .then(function () {
        return self.registration.unregister();
      }),
  );
});
`;
}
