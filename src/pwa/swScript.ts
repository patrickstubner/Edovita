import {
  PWA_CACHE_PREFIX,
  filterAppShellPaths,
  normalizeBasePath,
} from './config.ts';

export interface ServiceWorkerBuildConfig {
  cacheName: string;
  basePath: string;
  shellPaths: readonly string[];
}

/**
 * Generates the self-contained E7a service worker script.
 *
 * Security & privacy invariants (ADR-004):
 * - Caches ONLY the build-time whitelisted app shell (HTML, JS, CSS).
 * - No image precaching (deferred to E7b).
 * - No runtime cache.put() calls: never caches API responses, user data,
 *   IndexedDB/Dexie content, or URL hash fragments.
 * - Cleans up only obsolete Edovita shell caches during activate.
 * - No eval, no new Function, no importScripts, no silent skipWaiting.
 */
export function generateServiceWorkerScript(
  config: ServiceWorkerBuildConfig,
): string {
  const basePath = normalizeBasePath(config.basePath);
  if (!config.cacheName.startsWith(PWA_CACHE_PREFIX)) {
    throw new Error('Service worker cache name must use the Edovita prefix.');
  }
  const shellPaths = filterAppShellPaths(config.shellPaths, basePath);
  const indexPath = `${basePath}index.html`;
  if (!shellPaths.includes(indexPath)) {
    throw new Error('Service worker app shell must include index.html.');
  }

  return `/* Edovita Service Worker (E7a app-shell skeleton, generated at build time).
   Caches ONLY same-origin HTML/JS/CSS app-shell assets under a versioned cache name.
   Never caches images (E7b), API responses, user data, or IndexedDB/Dexie content. */
'use strict';

var CACHE_PREFIX = ${JSON.stringify(PWA_CACHE_PREFIX)};
var CACHE_NAME = ${JSON.stringify(config.cacheName)};
var BASE_PATH = ${JSON.stringify(basePath)};
var SHELL_INDEX_PATH = ${JSON.stringify(indexPath)};
var SHELL_PATHS = ${JSON.stringify(shellPaths)};
var SHELL_PATH_SET = new Set(SHELL_PATHS);

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_PATHS);
    }),
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME;
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
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(SHELL_INDEX_PATH).then(function (cached) {
          return cached || fetch(request);
        });
      }),
    );
    return;
  }

  if (url.search !== '' || !SHELL_PATH_SET.has(url.pathname)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(url.pathname).then(function (cached) {
        return cached || fetch(request);
      });
    }),
  );
});
`;
}
