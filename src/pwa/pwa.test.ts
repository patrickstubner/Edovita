import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from '@rstest/core';
import {
  MAX_RUNTIME_IMAGE_ENTRIES,
  PWA_BACKGROUND_COLOR,
  PWA_CACHE_PREFIX,
  PWA_ICON_FILES,
  PWA_IMAGES_CACHE_PREFIX,
  PWA_THEME_COLOR,
  PWA_THUMBS_CACHE_PREFIX,
  SHELL_PRECACHE_STATIC_FILES,
  buildCacheName,
  buildCacheNames,
  buildWebManifest,
  createPwaUpdateController,
  filterAppShellPaths,
  filterRecipeThumbPaths,
  generateKillSwitchServiceWorkerScript,
  generateServiceWorkerScript,
  isAppShellAssetPath,
  isEdovitaCacheName,
  isFullRecipeImagePath,
  isObsoleteEdovitaCache,
  isRecipeThumbPath,
  normalizeBasePath,
  registerServiceWorker,
  resolveShellCacheLookup,
  resolveSwScope,
  resolveSwUrl,
  runPwaKillSwitch,
  scheduleServiceWorkerRegistration,
  type ServiceWorkerContainerLike,
  type ServiceWorkerLike,
  type ServiceWorkerRegistrationLike,
} from './index.ts';

describe('PWA manifest and static precache files (E7a + E7b)', () => {
  it('builds an installable manifest for root and GitHub Pages scopes', () => {
    const rootManifest = buildWebManifest('/');
    expect(rootManifest.name).toBe('Edovita');
    expect(rootManifest.short_name).toBe('Edovita');
    expect(rootManifest.display).toBe('standalone');
    expect(rootManifest.theme_color).toBe(PWA_THEME_COLOR);
    expect(rootManifest.theme_color).toBe('#0B7F6B');
    expect(rootManifest.background_color).toBe(PWA_BACKGROUND_COLOR);
    expect(rootManifest.start_url).toBe('/');
    expect(rootManifest.scope).toBe('/');
    expect(rootManifest.icons).toHaveLength(4);
    expect(rootManifest.icons.map((i) => i.src)).toEqual([
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/maskable-192.png',
      '/icons/maskable-512.png',
    ]);

    const pagesManifest = buildWebManifest('/Edovita/');
    expect(pagesManifest.id).toBe('/Edovita/');
    expect(pagesManifest.start_url).toBe('/Edovita/');
    expect(pagesManifest.scope).toBe('/Edovita/');
    expect(
      pagesManifest.icons.every((i) => i.src.startsWith('/Edovita/icons/')),
    ).toBe(true);
  });

  it('references only existing icon and static shell files under public/', () => {
    for (const icon of PWA_ICON_FILES) {
      expect(existsSync(resolve(process.cwd(), 'public', icon.file))).toBe(true);
    }
    for (const file of SHELL_PRECACHE_STATIC_FILES) {
      if (file === 'manifest.webmanifest') continue;
      expect(existsSync(resolve(process.cwd(), 'public', file))).toBe(true);
    }
  });

  it('configures Cache-Control: no-cache for both /sw.js and /Edovita/sw.js in public/_headers (L1)', () => {
    const raw = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');
    const blocks = new Map<string, Map<string, string>>();
    let current: string | null = null;
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (!trimmed.includes(':')) {
        current = trimmed;
        blocks.set(current, new Map());
        continue;
      }
      if (!current) continue;
      const sep = trimmed.indexOf(':');
      blocks
        .get(current)
        ?.set(
          trimmed.slice(0, sep).trim().toLowerCase(),
          trimmed.slice(sep + 1).trim(),
        );
    }
    expect(blocks.get('/sw.js')?.get('cache-control')).toBe('no-cache');
    expect(blocks.get('/Edovita/sw.js')?.get('cache-control')).toBe('no-cache');
  });
});

describe('PWA cache naming and asset whitelists (E7b + L2)', () => {
  it('normalizes base paths and generates versioned shell, thumbs, and images cache names', () => {
    expect(normalizeBasePath('')).toBe('/');
    expect(normalizeBasePath('/')).toBe('/');
    expect(normalizeBasePath('Edovita')).toBe('/Edovita/');
    expect(normalizeBasePath('/Edovita/')).toBe('/Edovita/');

    const single = buildCacheName('0.1.0', '0123456789ab');
    expect(single).toBe(`${PWA_CACHE_PREFIX}v0.1.0-0123456789ab`);

    const names = buildCacheNames('0.1.0', '0123456789ab');
    expect(names).toEqual({
      shell: `${PWA_CACHE_PREFIX}v0.1.0-0123456789ab`,
      thumbs: `${PWA_THUMBS_CACHE_PREFIX}v0.1.0-0123456789ab`,
      images: `${PWA_IMAGES_CACHE_PREFIX}v0.1.0-0123456789ab`,
    });
    expect(MAX_RUNTIME_IMAGE_ENTRIES).toBe(60);
    expect(() => buildCacheNames('0.1.0 bad', '0123456789ab')).toThrow();
    expect(() => buildCacheNames('0.1.0', 'not-hex')).toThrow();
  });

  it('flags only obsolete Edovita caches across all three prefixes', () => {
    const active = buildCacheNames('0.1.0', 'aaaa1111bbbb');
    const activeSet = new Set([active.shell, active.thumbs, active.images]);

    expect(isEdovitaCacheName(active.shell)).toBe(true);
    expect(isEdovitaCacheName(active.thumbs)).toBe(true);
    expect(isEdovitaCacheName(active.images)).toBe(true);
    expect(isEdovitaCacheName('other-app-cache-v1')).toBe(false);

    expect(
      isObsoleteEdovitaCache('edovita-shell-v0.0.9-000011112222', activeSet),
    ).toBe(true);
    expect(
      isObsoleteEdovitaCache('edovita-thumbs-v0.0.9-000011112222', activeSet),
    ).toBe(true);
    expect(
      isObsoleteEdovitaCache('edovita-images-v0.0.9-000011112222', activeSet),
    ).toBe(true);
    expect(isObsoleteEdovitaCache(active.shell, activeSet)).toBe(false);
    expect(isObsoleteEdovitaCache(active.thumbs, activeSet)).toBe(false);
    expect(isObsoleteEdovitaCache(active.images, activeSet)).toBe(false);
    expect(isObsoleteEdovitaCache('other-app-cache-v1', activeSet)).toBe(false);
  });

  it('whitelists app shell (including async JS/CSS subfolders for L2, manifest, icons, logos) and rejects recipe images and APIs', () => {
    expect(isAppShellAssetPath('/', '/')).toBe(true);
    expect(isAppShellAssetPath('/index.html', '/')).toBe(true);
    expect(isAppShellAssetPath('/manifest.webmanifest', '/')).toBe(true);
    expect(isAppShellAssetPath('/favicon.ico', '/')).toBe(true);
    expect(isAppShellAssetPath('/theme-init.js', '/')).toBe(true);
    expect(isAppShellAssetPath('/icons/icon-192.png', '/')).toBe(true);
    expect(isAppShellAssetPath('/assets/edovita_appicon.svg', '/')).toBe(true);
    expect(isAppShellAssetPath('/static/js/index.abc123.js', '/')).toBe(true);
    expect(isAppShellAssetPath('/static/css/index.def456.css', '/')).toBe(true);

    // L2: nested async chunks are explicitly accepted
    expect(
      isAppShellAssetPath('/static/js/async/vendor.abc123.js', '/'),
    ).toBe(true);
    expect(
      isAppShellAssetPath('/static/css/async/chunk-1.def456.css', '/'),
    ).toBe(true);
    expect(
      isAppShellAssetPath(
        '/Edovita/static/js/async/lazy.abc123.js',
        '/Edovita/',
      ),
    ).toBe(true);

    // GitHub Pages prefix enforcement
    expect(isAppShellAssetPath('/Edovita/', '/Edovita/')).toBe(true);
    expect(
      isAppShellAssetPath('/Edovita/manifest.webmanifest', '/Edovita/'),
    ).toBe(true);
    expect(
      isAppShellAssetPath('/static/js/index.abc123.js', '/Edovita/'),
    ).toBe(false);

    // Rejected: recipe WebP images, APIs, traversal, query strings, hash fragments, unknown files
    expect(
      isAppShellAssetPath('/static/image/oven_salmon.abc123.webp', '/'),
    ).toBe(false);
    expect(
      isAppShellAssetPath('/static/image/oven_salmon-thumb.abc123.webp', '/'),
    ).toBe(false);
    expect(isAppShellAssetPath('/api/sync', '/')).toBe(false);
    expect(isAppShellAssetPath('/static/js/async/../../secret.js', '/')).toBe(
      false,
    );
    expect(isAppShellAssetPath('/static/js\\index.js', '/')).toBe(false);
    expect(isAppShellAssetPath('/index.html?token=1', '/')).toBe(false);
    expect(isAppShellAssetPath('/index.html#import=secret', '/')).toBe(false);
    expect(isAppShellAssetPath('/icons/unlisted.png', '/')).toBe(false);

    const filtered = filterAppShellPaths(
      [
        '/index.html',
        '/',
        '/manifest.webmanifest',
        '/theme-init.js',
        '/icons/icon-192.png',
        '/static/js/index.111.js',
        '/static/js/async/extra.333.js',
        '/static/css/index.222.css',
        '/static/image/oven_salmon.333.webp',
        '/static/image/oven_salmon-thumb.333.webp',
        '/api/profile',
      ],
      '/',
    );
    expect(filtered).toEqual([
      '/',
      '/icons/icon-192.png',
      '/index.html',
      '/manifest.webmanifest',
      '/static/css/index.222.css',
      '/static/js/async/extra.333.js',
      '/static/js/index.111.js',
      '/theme-init.js',
    ]);
  });

  it('strictly separates recipe thumbnails from full-size recipe images', () => {
    expect(
      isRecipeThumbPath('/static/image/oven_salmon-thumb.a1b2c3d4.webp', '/'),
    ).toBe(true);
    expect(
      isRecipeThumbPath(
        '/Edovita/static/image/alpler_magronen_light-thumb.00ff11aa.webp',
        '/Edovita/',
      ),
    ).toBe(true);
    expect(
      isRecipeThumbPath('/static/image/oven_salmon.a1b2c3d4.webp', '/'),
    ).toBe(false);
    expect(
      isRecipeThumbPath('/static/image/../oven_salmon-thumb.webp', '/'),
    ).toBe(false);
    expect(
      isRecipeThumbPath('/static/image/oven_salmon-thumb.webp?v=1', '/'),
    ).toBe(false);

    expect(
      isFullRecipeImagePath('/static/image/oven_salmon.a1b2c3d4.webp', '/'),
    ).toBe(true);
    expect(
      isFullRecipeImagePath(
        '/Edovita/static/image/oven_salmon.a1b2c3d4.webp',
        '/Edovita/',
      ),
    ).toBe(true);
    expect(
      isFullRecipeImagePath(
        '/static/image/oven_salmon-thumb.a1b2c3d4.webp',
        '/',
      ),
    ).toBe(false);
    expect(isFullRecipeImagePath('/icons/icon-192.png', '/')).toBe(false);
    expect(
      isFullRecipeImagePath('/static/image/oven_salmon.webp?foo=1', '/'),
    ).toBe(false);

    expect(
      filterRecipeThumbPaths(
        [
          '/static/image/oven_salmon-thumb.1111aaaa.webp',
          '/static/image/oven_salmon.1111aaaa.webp',
          '/static/image/berry_oats-thumb.2222bbbb.webp',
          '/icons/icon-192.png',
        ],
        '/',
      ),
    ).toEqual([
      '/static/image/berry_oats-thumb.2222bbbb.webp',
      '/static/image/oven_salmon-thumb.1111aaaa.webp',
    ]);
  });

  it('resolves shell cache lookups safely and ignores APIs, full images, queries, and non-GET', () => {
    const origin = 'https://edovita.example';
    const shellSet = new Set([
      '/',
      '/index.html',
      '/manifest.webmanifest',
      '/static/js/index.111.js',
    ]);

    expect(
      resolveShellCacheLookup(
        {
          method: 'GET',
          url: 'https://edovita.example/?pseudoRtl=1',
          mode: 'navigate',
        },
        origin,
        shellSet,
        '/',
      ),
    ).toBe('/index.html');

    expect(
      resolveShellCacheLookup(
        { method: 'GET', url: 'https://edovita.example/manifest.webmanifest' },
        origin,
        shellSet,
        '/',
      ),
    ).toBe('/manifest.webmanifest');

    expect(
      resolveShellCacheLookup(
        { method: 'POST', url: 'https://edovita.example/index.html', mode: 'navigate' },
        origin,
        shellSet,
        '/',
      ),
    ).toBeNull();
    expect(
      resolveShellCacheLookup(
        { method: 'GET', url: 'https://evil.example/index.html', mode: 'navigate' },
        origin,
        shellSet,
        '/',
      ),
    ).toBeNull();
    expect(
      resolveShellCacheLookup(
        { method: 'GET', url: 'https://edovita.example/api/user-data' },
        origin,
        shellSet,
        '/',
      ),
    ).toBeNull();
    expect(
      resolveShellCacheLookup(
        { method: 'GET', url: 'https://edovita.example/static/js/index.111.js?v=1' },
        origin,
        shellSet,
        '/',
      ),
    ).toBeNull();
  });
});

interface MockResponse {
  ok: boolean;
  status: number;
  type: string;
  body: string;
  headers: { get: (name: string) => string | null };
  clone: () => MockResponse;
}

function makeMockResponse(
  body: string,
  overrides: Partial<{
    ok: boolean;
    status: number;
    type: string;
    contentType: string | null;
  }> = {},
): MockResponse {
  const contentType =
    overrides.contentType !== undefined ? overrides.contentType : 'image/webp';
  const resp: MockResponse = {
    ok: overrides.ok ?? true,
    status: overrides.status ?? 200,
    type: overrides.type ?? 'basic',
    body,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? contentType : null,
    },
    clone: () => makeMockResponse(body, overrides),
  };
  return resp;
}

describe('Service worker offline script lifecycle (E7b)', () => {
  it('precaches shell + thumbs in batches, caches full images with bounded FIFO eviction, gates skipWaiting, and cleans old caches', async () => {
    const cacheNames = buildCacheNames('0.1.0', 'abcdef012345');
    // 30 thumbnails exercises batched precaching (> PRECACHE_BATCH_SIZE = 24)
    const thumbList = Array.from(
      { length: 30 },
      (_, idx) => `/static/image/recipe_${idx}-thumb.aaaa${String(idx).padStart(4, '0')}.webp`,
    );

    const script = generateServiceWorkerScript({
      cacheNames,
      basePath: '/',
      shellPaths: [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/theme-init.js',
        '/icons/icon-192.png',
        '/static/js/index.111.js',
        '/static/js/async/chunk.333.js',
        '/static/css/index.222.css',
        '/static/image/oven_salmon.webp',
        '/api/health',
      ],
      thumbPaths: [
        ...thumbList,
        '/static/image/oven_salmon.1234abcd.webp',
        '/api/secret',
      ],
      maxRuntimeImageEntries: 2,
    });

    expect(script).not.toContain('/api/health');
    expect(script).not.toContain('/api/secret');
    expect(script).not.toContain('oven_salmon.1234abcd.webp');
    expect(script).not.toContain('importScripts');

    const store = new Map<string, Map<string, MockResponse>>([
      [
        'edovita-shell-v0.0.1-old000000000',
        new Map([['/index.html', makeMockResponse('old')]]),
      ],
      [
        'edovita-thumbs-v0.0.1-old000000000',
        new Map([['/old-thumb.webp', makeMockResponse('old')]]),
      ],
      [
        'edovita-images-v0.0.1-old000000000',
        new Map([['/old-full.webp', makeMockResponse('old')]]),
      ],
      [
        'unrelated-cache-v1',
        new Map([['/keep', makeMockResponse('keep')]]),
      ],
    ]);

    const listeners = new Map<string, (event: unknown) => void>();
    const networkFetches: string[] = [];
    let claimed = false;
    let skipWaitingCount = 0;
    let indexedDbTouched = false;

    const mockCaches = {
      async open(name: string) {
        let bucket = store.get(name);
        if (!bucket) {
          bucket = new Map<string, MockResponse>();
          store.set(name, bucket);
        }
        return {
          async addAll(urls: string[]) {
            for (const url of urls) {
              bucket.set(url, makeMockResponse(`cached:${url}`));
            }
          },
          async match(key: string) {
            return bucket.get(key);
          },
          async put(key: string, response: MockResponse) {
            bucket.set(key, response);
          },
          async keys() {
            return Array.from(bucket.keys());
          },
          async delete(key: string) {
            return bucket.delete(key);
          },
        };
      },
      async keys() {
        return Array.from(store.keys());
      },
      async delete(name: string) {
        return store.delete(name);
      },
    };

    const mockFetch = async (req: { url: string }) => {
      networkFetches.push(req.url);
      if (req.url.includes('recipe_0.')) {
        throw new Error('Offline');
      }
      if (req.url.includes('opaque_img')) {
        return makeMockResponse('opaque', { type: 'opaque' });
      }
      if (req.url.includes('bad_mime')) {
        return makeMockResponse('<html>nope</html>', {
          contentType: 'text/html',
        });
      }
      if (req.url.includes('missing_img')) {
        return makeMockResponse('404', { ok: false, status: 404 });
      }
      return makeMockResponse(`net:${req.url}`);
    };

    const sandbox: Record<string, unknown> = {
      URL,
      Set,
      Promise,
      caches: mockCaches,
      fetch: mockFetch,
      get indexedDB() {
        indexedDbTouched = true;
        return null;
      },
      self: {
        location: { origin: 'https://edovita.example' },
        skipWaiting() {
          skipWaitingCount += 1;
        },
        clients: {
          async claim() {
            claimed = true;
          },
        },
        addEventListener(type: string, fn: (event: unknown) => void) {
          listeners.set(type, fn);
        },
      },
    };

    vm.runInNewContext(script, sandbox);

    // 1. Install precaches shell + all 30 thumbs and NEVER calls skipWaiting()
    const installPromises: Promise<unknown>[] = [];
    listeners.get('install')?.({
      waitUntil: (p: Promise<unknown>) => installPromises.push(p),
    });
    await Promise.all(installPromises);

    expect(skipWaitingCount).toBe(0);
    expect(Array.from(store.get(cacheNames.shell)?.keys() ?? [])).toEqual([
      '/',
      '/icons/icon-192.png',
      '/index.html',
      '/manifest.webmanifest',
      '/static/css/index.222.css',
      '/static/js/async/chunk.333.js',
      '/static/js/index.111.js',
      '/theme-init.js',
    ]);
    expect(store.get(cacheNames.thumbs)?.size).toBe(30);
    expect(store.has(cacheNames.images)).toBe(false);

    // 2. Message listener only calls skipWaiting on explicit SKIP_WAITING
    listeners.get('message')?.({ data: { type: 'OTHER' } });
    listeners.get('message')?.({ data: null });
    expect(skipWaitingCount).toBe(0);
    listeners.get('message')?.({ data: { type: 'SKIP_WAITING' } });
    expect(skipWaitingCount).toBe(1);

    // 3. Activate deletes all 3 obsolete Edovita caches but keeps active + unrelated caches
    const activatePromises: Promise<unknown>[] = [];
    listeners.get('activate')?.({
      waitUntil: (p: Promise<unknown>) => activatePromises.push(p),
    });
    await Promise.all(activatePromises);

    expect(store.has('edovita-shell-v0.0.1-old000000000')).toBe(false);
    expect(store.has('edovita-thumbs-v0.0.1-old000000000')).toBe(false);
    expect(store.has('edovita-images-v0.0.1-old000000000')).toBe(false);
    expect(store.has(cacheNames.shell)).toBe(true);
    expect(store.has(cacheNames.thumbs)).toBe(true);
    expect(store.has('unrelated-cache-v1')).toBe(true);
    expect(claimed).toBe(true);
    expect(indexedDbTouched).toBe(false);

    // 4. Fetch handler tests
    const dispatchFetch = async (request: {
      method: string;
      url: string;
      mode?: string;
    }) => {
      let responded: Promise<unknown> | null = null;
      listeners.get('fetch')?.({
        request,
        respondWith: (p: Promise<unknown>) => {
          responded = p;
        },
      });
      return responded ? ((await responded) as MockResponse) : undefined;
    };

    // Shell + manifest + async chunk + thumbnails served cache-first
    expect(
      (
        await dispatchFetch({
          method: 'GET',
          url: 'https://edovita.example/?pseudoRtl=1',
          mode: 'navigate',
        })
      )?.body,
    ).toBe('cached:/index.html');
    expect(
      (
        await dispatchFetch({
          method: 'GET',
          url: 'https://edovita.example/manifest.webmanifest',
        })
      )?.body,
    ).toBe('cached:/manifest.webmanifest');
    expect(
      (
        await dispatchFetch({
          method: 'GET',
          url: 'https://edovita.example/static/js/async/chunk.333.js',
        })
      )?.body,
    ).toBe('cached:/static/js/async/chunk.333.js');
    expect(
      (
        await dispatchFetch({
          method: 'GET',
          url: `https://edovita.example${thumbList[0]!}`,
        })
      )?.body,
    ).toBe(`cached:${thumbList[0]!}`);
    expect(networkFetches).toHaveLength(0);

    // Full-size recipe images: cache-first + bounded FIFO eviction (maxRuntimeImageEntries = 2)
    const img1 = 'https://edovita.example/static/image/oven_salmon.1111aaaa.webp';
    const img2 = 'https://edovita.example/static/image/berry_oats.2222bbbb.webp';
    const img3 = 'https://edovita.example/static/image/lentil_dal.3333cccc.webp';

    expect((await dispatchFetch({ method: 'GET', url: img1 }))?.body).toBe(
      `net:${img1}`,
    );
    expect(networkFetches).toHaveLength(1);
    // Second request hits cache without hitting network
    expect((await dispatchFetch({ method: 'GET', url: img1 }))?.body).toBe(
      `net:${img1}`,
    );
    expect(networkFetches).toHaveLength(1);

    await dispatchFetch({ method: 'GET', url: img2 });
    await dispatchFetch({ method: 'GET', url: img3 });

    const cachedFullKeys = Array.from(store.get(cacheNames.images)?.keys() ?? []);
    expect(cachedFullKeys).toEqual([
      '/static/image/berry_oats.2222bbbb.webp',
      '/static/image/lentil_dal.3333cccc.webp',
    ]);

    // Rejects opaque, non-200, and non-webp full-image responses from CacheStorage
    await dispatchFetch({
      method: 'GET',
      url: 'https://edovita.example/static/image/opaque_img.4444dddd.webp',
    });
    await dispatchFetch({
      method: 'GET',
      url: 'https://edovita.example/static/image/bad_mime.5555eeee.webp',
    });
    await dispatchFetch({
      method: 'GET',
      url: 'https://edovita.example/static/image/missing_img.6666ffff.webp',
    });
    expect(Array.from(store.get(cacheNames.images)?.keys() ?? [])).toEqual([
      '/static/image/berry_oats.2222bbbb.webp',
      '/static/image/lentil_dal.3333cccc.webp',
    ]);

    // Offline uncached full-size photo gracefully falls back to its precached thumbnail
    // without polluting the runtime full-image cache
    expect(
      (
        await dispatchFetch({
          method: 'GET',
          url: 'https://edovita.example/static/image/recipe_0.9999eeee.webp',
        })
      )?.body,
    ).toBe(`cached:${thumbList[0]!}`);
    expect(Array.from(store.get(cacheNames.images)?.keys() ?? [])).toEqual([
      '/static/image/berry_oats.2222bbbb.webp',
      '/static/image/lentil_dal.3333cccc.webp',
    ]);

    // Ignores APIs, POST, cross-origin, and query-string image requests
    expect(
      await dispatchFetch({
        method: 'GET',
        url: 'https://edovita.example/api/user-profile',
      }),
    ).toBeUndefined();
    expect(
      await dispatchFetch({
        method: 'POST',
        url: 'https://edovita.example/index.html',
        mode: 'navigate',
      }),
    ).toBeUndefined();
    expect(
      await dispatchFetch({
        method: 'GET',
        url: 'https://other.example/static/image/oven_salmon.1111aaaa.webp',
      }),
    ).toBeUndefined();
    expect(
      await dispatchFetch({
        method: 'GET',
        url: 'https://edovita.example/static/image/oven_salmon.1111aaaa.webp?token=1',
      }),
    ).toBeUndefined();
    expect(indexedDbTouched).toBe(false);
  });
});

describe('PWA update controller and registration (E7b)', () => {
  it('resolves sw URL and scope for root and GitHub Pages', () => {
    expect(resolveSwUrl('/')).toBe('/sw.js');
    expect(resolveSwScope('/')).toBe('/');
    expect(resolveSwUrl('/Edovita/')).toBe('/Edovita/sw.js');
    expect(resolveSwScope('/Edovita/')).toBe('/Edovita/');
  });

  it('shows update banner only when an existing controller is active, sends SKIP_WAITING on user action, and reloads once', () => {
    let reloads = 0;
    const controller = createPwaUpdateController(() => {
      reloads += 1;
    });
    const observed: boolean[] = [];
    const unsub = controller.subscribe((state) => {
      observed.push(state.updateAvailable);
    });

    // 1. First install (no existing controller): must NOT prompt update banner
    const firstInstallListeners: Record<string, () => void> = {};
    const firstWorker: ServiceWorkerLike = {
      state: 'installing',
      addEventListener: (type, fn) => {
        firstInstallListeners[type] = fn;
      },
    };
    const regListeners: Record<string, () => void> = {};
    const firstReg: ServiceWorkerRegistrationLike = {
      installing: firstWorker,
      waiting: null,
      addEventListener: (type, fn) => {
        regListeners[type] = fn;
      },
    };
    const firstContainer: ServiceWorkerContainerLike = {
      controller: null,
      register: async () => firstReg,
    };
    controller.attachRegistration(firstReg, firstContainer);
    regListeners.updatefound?.();
    firstWorker.state = 'installed';
    firstInstallListeners.statechange?.();
    expect(controller.getState().updateAvailable).toBe(false);
    expect(observed).toEqual([]);

    // 2. Subsequent update while controller is active: shows banner, waits for user click
    const posted: unknown[] = [];
    const controllerChangeListeners: Array<() => void> = [];
    const waitingWorker: ServiceWorkerLike = {
      state: 'installed',
      postMessage: (msg) => {
        posted.push(msg);
      },
    };
    const waitingReg: ServiceWorkerRegistrationLike = {
      waiting: waitingWorker,
    };
    const activeContainer: ServiceWorkerContainerLike = {
      controller: { state: 'activated' },
      register: async () => waitingReg,
      addEventListener: (type, fn) => {
        if (type === 'controllerchange') {
          controllerChangeListeners.push(fn);
        }
      },
    };

    controller.attachRegistration(waitingReg, activeContainer);
    expect(controller.getState().updateAvailable).toBe(true);
    expect(posted).toEqual([]);

    // Dismissing hides banner without calling SKIP_WAITING
    controller.dismissUpdate();
    expect(controller.getState().updateAvailable).toBe(false);
    expect(posted).toEqual([]);

    // Re-attach simulates user opening again with waiting worker, then clicking Update now
    controller.attachRegistration(waitingReg, activeContainer);
    expect(controller.applyUpdate()).toBe(true);
    // Double-click guard: second call returns false and does not repost
    expect(controller.applyUpdate()).toBe(false);
    expect(posted).toEqual([{ type: 'SKIP_WAITING' }]);
    expect(controller.getState().isReloading).toBe(true);

    // Even if controllerchange fires twice, reload happens only once
    controllerChangeListeners.forEach((fn) => fn());
    controllerChangeListeners.forEach((fn) => fn());
    expect(reloads).toBe(1);
    unsub();
  });

  it('registers with updateViaCache=none and handles skipped, unsupported, and error states cleanly', async () => {
    const calls: Array<{ url: string; options?: RegistrationOptions }> = [];
    const fakeReg: ServiceWorkerRegistrationLike = {};
    const mockSw: ServiceWorkerContainerLike = {
      async register(url: string, options?: RegistrationOptions) {
        calls.push({ url, options });
        return fakeReg;
      },
    };
    const testController = createPwaUpdateController(() => {});

    const ok = await registerServiceWorker(
      {
        basePath: '/Edovita/',
        isProduction: true,
        serviceWorker: mockSw,
      },
      testController,
    );
    expect(ok).toEqual({ status: 'registered', registration: fakeReg });
    expect(calls).toEqual([
      {
        url: '/Edovita/sw.js',
        options: { scope: '/Edovita/', updateViaCache: 'none' },
      },
    ]);

    expect(
      await registerServiceWorker(
        {
          basePath: '/',
          isProduction: false,
          serviceWorker: mockSw,
        },
        testController,
      ),
    ).toEqual({ status: 'skipped' });

    expect(
      await registerServiceWorker(
        {
          basePath: '/',
          isProduction: true,
          serviceWorker: null,
        },
        testController,
      ),
    ).toEqual({ status: 'unsupported' });

    expect(
      await registerServiceWorker(
        {
          basePath: '/',
          isProduction: true,
          serviceWorker: {
            async register() {
              throw new Error('Blocked in private browsing');
            },
          },
        },
        testController,
      ),
    ).toEqual({ status: 'error' });
  });

  it('defers registration via scheduleServiceWorkerRegistration and skips non-production builds', async () => {
    let called = 0;
    const mockSw: ServiceWorkerContainerLike = {
      async register() {
        called += 1;
        return {};
      },
    };
    const testController = createPwaUpdateController(() => {});

    scheduleServiceWorkerRegistration(
      {
        basePath: '/',
        isProduction: false,
        serviceWorker: mockSw,
      },
      testController,
    );
    expect(called).toBe(0);

    scheduleServiceWorkerRegistration(
      {
        basePath: '/',
        isProduction: true,
        serviceWorker: mockSw,
      },
      testController,
    );
    window.dispatchEvent(new Event('load'));
    await Promise.resolve();
    expect(called).toBeGreaterThanOrEqual(1);
  });
});

describe('PWA kill switch (runtime helper and emergency SW script)', () => {
  it('unregisters SWs and clears only Edovita caches without touching IndexedDB', async () => {
    // Seed a real IndexedDB record (via fake-indexeddb in test setup) and verify it survives
    const dbName = 'edovita_killswitch_test';
    await new Promise<void>((resolveDb, rejectDb) => {
      const openReq = indexedDB.open(dbName, 1);
      openReq.onupgradeneeded = () => {
        openReq.result.createObjectStore('user_data');
      };
      openReq.onsuccess = () => {
        const db = openReq.result;
        const tx = db.transaction('user_data', 'readwrite');
        tx.objectStore('user_data').put('keep-me', 'entry1');
        tx.oncomplete = () => {
          db.close();
          resolveDb();
        };
        tx.onerror = () => rejectDb(tx.error);
      };
      openReq.onerror = () => rejectDb(openReq.error);
    });

    let unregistered = 0;
    const cacheKeys = new Set([
      'edovita-shell-v0.1.0-aaaa1111bbbb',
      'edovita-thumbs-v0.1.0-aaaa1111bbbb',
      'edovita-images-v0.1.0-aaaa1111bbbb',
      'unrelated-site-cache',
    ]);

    const result = await runPwaKillSwitch({
      serviceWorker: {
        getRegistrations: async () => [
          {
            unregister: async () => {
              unregistered += 1;
              return true;
            },
          },
        ],
      },
      cacheStorage: {
        keys: async () => Array.from(cacheKeys),
        delete: async (key) => cacheKeys.delete(key),
      },
    });

    expect(unregistered).toBe(1);
    expect(result.unregisteredCount).toBe(1);
    expect(result.deletedCaches.sort()).toEqual([
      'edovita-images-v0.1.0-aaaa1111bbbb',
      'edovita-shell-v0.1.0-aaaa1111bbbb',
      'edovita-thumbs-v0.1.0-aaaa1111bbbb',
    ]);
    expect(Array.from(cacheKeys)).toEqual(['unrelated-site-cache']);

    // Confirm IndexedDB user record survived untouched
    const survivedValue = await new Promise<unknown>((resolveDb, rejectDb) => {
      const openReq = indexedDB.open(dbName, 1);
      openReq.onsuccess = () => {
        const db = openReq.result;
        const tx = db.transaction('user_data', 'readonly');
        const getReq = tx.objectStore('user_data').get('entry1');
        getReq.onsuccess = () => {
          db.close();
          resolveDb(getReq.result);
        };
        getReq.onerror = () => rejectDb(getReq.error);
      };
      openReq.onerror = () => rejectDb(openReq.error);
    });
    expect(survivedValue).toBe('keep-me');
    indexedDB.deleteDatabase(dbName);
  });

  it('emergency kill-switch SW clears only Edovita caches and unregisters itself', async () => {
    const script = generateKillSwitchServiceWorkerScript();
    const listeners = new Map<string, (event: unknown) => void>();
    const cacheKeys = new Set([
      'edovita-shell-v0.1.0-111122223333',
      'edovita-thumbs-v0.1.0-111122223333',
      'edovita-images-v0.1.0-111122223333',
      'keep-other-cache',
    ]);
    let skipped = false;
    let unregistered = false;
    let indexedDbTouched = false;

    vm.runInNewContext(script, {
      Promise,
      caches: {
        keys: async () => Array.from(cacheKeys),
        delete: async (key: string) => cacheKeys.delete(key),
      },
      get indexedDB() {
        indexedDbTouched = true;
        return null;
      },
      self: {
        skipWaiting: () => {
          skipped = true;
        },
        registration: {
          unregister: async () => {
            unregistered = true;
            return true;
          },
        },
        addEventListener: (type: string, fn: (event: unknown) => void) => {
          listeners.set(type, fn);
        },
      },
    });

    listeners.get('install')?.({});
    expect(skipped).toBe(true);

    const promises: Promise<unknown>[] = [];
    listeners.get('activate')?.({
      waitUntil: (p: Promise<unknown>) => promises.push(p),
    });
    await Promise.all(promises);

    expect(unregistered).toBe(true);
    expect(Array.from(cacheKeys)).toEqual(['keep-other-cache']);
    expect(indexedDbTouched).toBe(false);
  });
});
