import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from '@rstest/core';
import {
  PWA_BACKGROUND_COLOR,
  PWA_CACHE_PREFIX,
  PWA_ICON_FILES,
  PWA_THEME_COLOR,
  buildCacheName,
  buildWebManifest,
  filterAppShellPaths,
  generateServiceWorkerScript,
  isAppShellAssetPath,
  isObsoleteEdovitaCache,
  normalizeBasePath,
  registerServiceWorker,
  resolveShellCacheLookup,
  resolveSwScope,
  resolveSwUrl,
  scheduleServiceWorkerRegistration,
} from './index.ts';

describe('PWA manifest (E7a)', () => {
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

  it('references only existing icon files under public/', () => {
    for (const icon of PWA_ICON_FILES) {
      expect(existsSync(resolve(process.cwd(), 'public', icon.file))).toBe(true);
    }
    expect(existsSync(resolve(process.cwd(), 'public/favicon.ico'))).toBe(true);
    expect(
      existsSync(resolve(process.cwd(), 'public/icons/apple-touch-icon-180.png')),
    ).toBe(true);
  });
});

describe('PWA cache naming and app-shell whitelist (E7a)', () => {
  it('normalizes base paths and generates versioned cache names', () => {
    expect(normalizeBasePath('')).toBe('/');
    expect(normalizeBasePath('/')).toBe('/');
    expect(normalizeBasePath('Edovita')).toBe('/Edovita/');
    expect(normalizeBasePath('/Edovita/')).toBe('/Edovita/');

    const cacheName = buildCacheName('0.1.0', '0123456789ab');
    expect(cacheName).toBe(`${PWA_CACHE_PREFIX}v0.1.0-0123456789ab`);
    expect(() => buildCacheName('0.1.0 bad', '0123456789ab')).toThrow();
    expect(() => buildCacheName('0.1.0', 'not-hex')).toThrow();
  });

  it('flags only obsolete Edovita shell caches for deletion', () => {
    const current = 'edovita-shell-v0.1.0-aaaa1111bbbb';
    expect(isObsoleteEdovitaCache('edovita-shell-v0.0.9-000011112222', current)).toBe(true);
    expect(isObsoleteEdovitaCache(current, current)).toBe(false);
    expect(isObsoleteEdovitaCache('other-app-cache-v1', current)).toBe(false);
  });

  it('whitelists only HTML/JS/CSS app-shell paths and rejects images, APIs, and user data', () => {
    expect(isAppShellAssetPath('/', '/')).toBe(true);
    expect(isAppShellAssetPath('/index.html', '/')).toBe(true);
    expect(isAppShellAssetPath('/theme-init.js', '/')).toBe(true);
    expect(isAppShellAssetPath('/static/js/index.abc123.js', '/')).toBe(true);
    expect(isAppShellAssetPath('/static/css/index.def456.css', '/')).toBe(true);

    // GitHub Pages prefix
    expect(isAppShellAssetPath('/Edovita/', '/Edovita/')).toBe(true);
    expect(isAppShellAssetPath('/Edovita/static/js/index.abc123.js', '/Edovita/')).toBe(true);
    expect(isAppShellAssetPath('/static/js/index.abc123.js', '/Edovita/')).toBe(false);

    // Rejected: images (E7b), JSON, manifest, API, traversal, queries, hashes
    expect(isAppShellAssetPath('/static/image/oven_salmon.abc123.webp', '/')).toBe(false);
    expect(isAppShellAssetPath('/static/image/oven_salmon-thumb.abc123.webp', '/')).toBe(false);
    expect(isAppShellAssetPath('/icons/icon-192.png', '/')).toBe(false);
    expect(isAppShellAssetPath('/assets/edovita_appicon.svg', '/')).toBe(false);
    expect(isAppShellAssetPath('/manifest.webmanifest', '/')).toBe(false);
    expect(isAppShellAssetPath('/api/sync', '/')).toBe(false);
    expect(isAppShellAssetPath('/static/js/../secret.js', '/')).toBe(false);
    expect(isAppShellAssetPath('/index.html?token=1', '/')).toBe(false);
    expect(isAppShellAssetPath('/index.html#import=secret', '/')).toBe(false);

    const filtered = filterAppShellPaths(
      [
        '/index.html',
        '/',
        '/theme-init.js',
        '/static/js/index.111.js',
        '/static/css/index.222.css',
        '/static/image/oven_salmon.333.webp',
        '/icons/icon-192.png',
        '/api/profile',
      ],
      '/',
    );
    expect(filtered).toEqual([
      '/',
      '/index.html',
      '/static/css/index.222.css',
      '/static/js/index.111.js',
      '/theme-init.js',
    ]);
  });

  it('resolves shell cache lookups safely and never caches APIs, images, or non-GET requests', () => {
    const origin = 'https://edovita.example';
    const shellSet = new Set([
      '/',
      '/index.html',
      '/theme-init.js',
      '/static/js/index.111.js',
      '/static/css/index.222.css',
    ]);

    expect(
      resolveShellCacheLookup(
        { method: 'GET', url: 'https://edovita.example/?pseudoRtl=1', mode: 'navigate' },
        origin,
        shellSet,
        '/',
      ),
    ).toBe('/index.html');

    expect(
      resolveShellCacheLookup(
        { method: 'GET', url: 'https://edovita.example/static/js/index.111.js' },
        origin,
        shellSet,
        '/',
      ),
    ).toBe('/static/js/index.111.js');

    // Rejected cases
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
        { method: 'GET', url: 'https://edovita.example/static/image/oven_salmon.webp' },
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

describe('Service worker skeleton script lifecycle (E7a)', () => {
  it('installs only HTML/JS/CSS shell, cleans obsolete caches on activate, and ignores API/images/POST on fetch', async () => {
    const cacheName = 'edovita-shell-v0.1.0-abcdef012345';
    const script = generateServiceWorkerScript({
      cacheName,
      basePath: '/',
      shellPaths: [
        '/',
        '/index.html',
        '/theme-init.js',
        '/static/js/index.111.js',
        '/static/css/index.222.css',
        '/static/image/oven_salmon.webp',
        '/api/health',
      ],
    });

    expect(script).not.toContain('oven_salmon.webp');
    expect(script).not.toContain('/api/health');
    expect(script).not.toContain('cache.put');
    expect(script).not.toContain('skipWaiting');
    expect(script).not.toContain('importScripts');

    // Execute generated SW in an isolated VM context with mock CacheStorage
    const store = new Map<string, Map<string, string>>([
      ['edovita-shell-v0.0.1-old000000000', new Map([['/index.html', 'old']])],
      ['unrelated-cache-v1', new Map([['/keep', 'yes']])],
    ]);
    const listeners = new Map<string, (event: unknown) => void>();
    let claimed = false;
    let indexedDbTouched = false;

    const mockCaches = {
      async open(name: string) {
        let bucket = store.get(name);
        if (!bucket) {
          bucket = new Map<string, string>();
          store.set(name, bucket);
        }
        return {
          async addAll(urls: string[]) {
            for (const url of urls) {
              bucket.set(url, `cached:${url}`);
            }
          },
          async match(key: string) {
            return bucket.get(key);
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

    const sandbox: Record<string, unknown> = {
      URL,
      Set,
      Promise,
      caches: mockCaches,
      fetch: async (req: { url: string }) => `network:${req.url}`,
      get indexedDB() {
        indexedDbTouched = true;
        return null;
      },
      self: {
        location: { origin: 'https://edovita.example' },
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

    // 1. Install event
    const installPromises: Promise<unknown>[] = [];
    listeners.get('install')?.({
      waitUntil: (p: Promise<unknown>) => installPromises.push(p),
    });
    await Promise.all(installPromises);

    const cachedUrls = Array.from(store.get(cacheName)?.keys() ?? []);
    expect(cachedUrls).toEqual([
      '/',
      '/index.html',
      '/static/css/index.222.css',
      '/static/js/index.111.js',
      '/theme-init.js',
    ]);

    // 2. Activate event cleans up old edovita-shell-* only
    const activatePromises: Promise<unknown>[] = [];
    listeners.get('activate')?.({
      waitUntil: (p: Promise<unknown>) => activatePromises.push(p),
    });
    await Promise.all(activatePromises);

    expect(store.has('edovita-shell-v0.0.1-old000000000')).toBe(false);
    expect(store.has(cacheName)).toBe(true);
    expect(store.has('unrelated-cache-v1')).toBe(true);
    expect(claimed).toBe(true);
    expect(indexedDbTouched).toBe(false);

    // 3. Fetch event serves shell, ignores API/image/POST/cross-origin
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
      return responded ? await responded : undefined;
    };

    expect(
      await dispatchFetch({
        method: 'GET',
        url: 'https://edovita.example/?pseudoRtl=1',
        mode: 'navigate',
      }),
    ).toBe('cached:/index.html');

    expect(
      await dispatchFetch({
        method: 'GET',
        url: 'https://edovita.example/static/js/index.111.js',
      }),
    ).toBe('cached:/static/js/index.111.js');

    expect(
      await dispatchFetch({
        method: 'GET',
        url: 'https://edovita.example/api/user-profile',
      }),
    ).toBeUndefined();

    expect(
      await dispatchFetch({
        method: 'GET',
        url: 'https://edovita.example/static/image/oven_salmon.webp',
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
        url: 'https://other.example/index.html',
        mode: 'navigate',
      }),
    ).toBeUndefined();
  });
});

describe('Service worker registration helper (E7a)', () => {
  it('resolves sw URL and scope for root and GitHub Pages', () => {
    expect(resolveSwUrl('/')).toBe('/sw.js');
    expect(resolveSwScope('/')).toBe('/');
    expect(resolveSwUrl('/Edovita/')).toBe('/Edovita/sw.js');
    expect(resolveSwScope('/Edovita/')).toBe('/Edovita/');
  });

  it('registers with updateViaCache=none and handles skipped, unsupported, and error states cleanly', async () => {
    const calls: Array<{ url: string; options?: RegistrationOptions }> = [];
    const fakeReg = {} as ServiceWorkerRegistration;
    const mockSw = {
      async register(url: string, options?: RegistrationOptions) {
        calls.push({ url, options });
        return fakeReg;
      },
    };

    const ok = await registerServiceWorker({
      basePath: '/Edovita/',
      isProduction: true,
      serviceWorker: mockSw,
    });
    expect(ok).toEqual({ status: 'registered', registration: fakeReg });
    expect(calls).toEqual([
      {
        url: '/Edovita/sw.js',
        options: { scope: '/Edovita/', updateViaCache: 'none' },
      },
    ]);

    expect(
      await registerServiceWorker({
        basePath: '/',
        isProduction: false,
        serviceWorker: mockSw,
      }),
    ).toEqual({ status: 'skipped' });

    expect(
      await registerServiceWorker({
        basePath: '/',
        isProduction: true,
        serviceWorker: null,
      }),
    ).toEqual({ status: 'unsupported' });

    expect(
      await registerServiceWorker({
        basePath: '/',
        isProduction: true,
        serviceWorker: {
          async register() {
            throw new Error('Blocked in private browsing');
          },
        },
      }),
    ).toEqual({ status: 'error' });
  });

  it('defers registration via scheduleServiceWorkerRegistration and skips non-production builds', async () => {
    let called = 0;
    const mockSw = {
      async register() {
        called += 1;
        return {} as ServiceWorkerRegistration;
      },
    };

    scheduleServiceWorkerRegistration({
      basePath: '/',
      isProduction: false,
      serviceWorker: mockSw,
    });
    expect(called).toBe(0);

    scheduleServiceWorkerRegistration({
      basePath: '/',
      isProduction: true,
      serviceWorker: mockSw,
    });
    window.dispatchEvent(new Event('load'));
    await Promise.resolve();
    expect(called).toBeGreaterThanOrEqual(1);
  });
});
