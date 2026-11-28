import { expect, test } from '@playwright/test';

test.describe('E7b PWA offline app shell, thumbnails, manifest/icons, and runtime image cache', () => {
  test('serves valid web app manifest, installability icons, theme color, and strict CSP', async ({
    page,
    request,
  }, testInfo) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(String(err));
    });

    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (event) => {
        const target = window as unknown as { __cspViolations?: string[] };
        target.__cspViolations = target.__cspViolations ?? [];
        target.__cspViolations.push(
          `${event.violatedDirective}: ${event.blockedURI}`,
        );
      });
    });

    const response = await page.goto('/');
    expect(response).not.toBeNull();
    const csp = response!.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("manifest-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('unsafe-eval');

    const manifestHref = await page
      .locator('link[rel="manifest"]')
      .getAttribute('href');
    expect(manifestHref).toBe('/manifest.webmanifest');

    const expectedThemeColor = testInfo.project.name.includes('dark')
      ? '#000000'
      : '#0B7F6B';
    await expect(page.locator('#themeColor')).toHaveAttribute(
      'content',
      expectedThemeColor,
    );

    const manifestRes = await request.get('/manifest.webmanifest');
    expect(manifestRes.status()).toBe(200);
    const manifest = (await manifestRes.json()) as {
      name: string;
      short_name: string;
      display: string;
      theme_color: string;
      background_color: string;
      start_url: string;
      scope: string;
      icons: Array<{
        src: string;
        sizes: string;
        type: string;
        purpose: string;
      }>;
    };

    expect(manifest.name).toBe('Edovita');
    expect(manifest.short_name).toBe('Edovita');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0B7F6B');
    expect(manifest.background_color).toBe('#FFFFFF');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    for (const icon of manifest.icons) {
      const iconRes = await request.get(icon.src);
      expect(iconRes.status()).toBe(200);
      expect(iconRes.headers()['content-type']).toContain('image/png');
    }

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('precaches shell, manifest, icons, and recipe thumbnails; caches full-size images on demand; and runs offline', async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (event) => {
        const target = window as unknown as { __cspViolations?: string[] };
        target.__cspViolations = target.__cspViolations ?? [];
        target.__cspViolations.push(
          `${event.violatedDirective}: ${event.blockedURI}`,
        );
      });
    });

    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeVisible();

    // Wait for SW registration, activation, and client control
    const swState = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => resolve(),
            { once: true },
          );
        });
      }
      return {
        scriptURL: reg.active?.scriptURL ?? '',
        scope: reg.scope,
        controlled: Boolean(navigator.serviceWorker.controller),
      };
    });

    expect(swState.scriptURL).toMatch(/\/sw\.js$/);
    expect(swState.scope).toMatch(/\/$/);
    expect(swState.controlled).toBe(true);

    // Inspect Cache Storage right after install: shell + thumbs precached, NO runtime full images yet
    const initialCaches = await page.evaluate(async () => {
      const keys = (await caches.keys()).sort();
      const entriesByCache: Record<string, string[]> = {};
      for (const key of keys) {
        const cache = await caches.open(key);
        const requests = await cache.keys();
        entriesByCache[key] = requests.map((req) => req.url).sort();
      }
      return { keys, entriesByCache };
    });

    const shellKey = initialCaches.keys.find((k) =>
      /^edovita-shell-v[0-9A-Za-z._-]+-[0-9a-f]{12}$/.test(k),
    );
    const thumbsKey = initialCaches.keys.find((k) =>
      /^edovita-thumbs-v[0-9A-Za-z._-]+-[0-9a-f]{12}$/.test(k),
    );
    expect(shellKey).toBeDefined();
    expect(thumbsKey).toBeDefined();
    expect(initialCaches.keys).toHaveLength(2);

    const shellUrls = initialCaches.entriesByCache[shellKey!] ?? [];
    expect(shellUrls.some((u) => u.endsWith('/index.html'))).toBe(true);
    expect(shellUrls.some((u) => u.endsWith('/manifest.webmanifest'))).toBe(
      true,
    );
    expect(shellUrls.some((u) => u.endsWith('/theme-init.js'))).toBe(true);
    expect(shellUrls.some((u) => u.endsWith('/icons/icon-192.png'))).toBe(true);
    expect(shellUrls.some((u) => u.endsWith('/icons/icon-512.png'))).toBe(true);
    expect(shellUrls.some((u) => u.endsWith('/assets/edovita_appicon.svg'))).toBe(
      true,
    );
    expect(shellUrls.some((u) => /\/static\/js\/.+\.js$/.test(u))).toBe(true);
    expect(shellUrls.some((u) => /\/static\/css\/.+\.css$/.test(u))).toBe(true);
    for (const url of shellUrls) {
      expect(url).toMatch(/^http:\/\/127\.0\.0\.1:4173\//);
      expect(url).not.toMatch(/\.webp$/i);
      expect(url).not.toContain('/api/');
      expect(url).not.toContain('#import');
    }

    const thumbUrls = initialCaches.entriesByCache[thumbsKey!] ?? [];
    expect(thumbUrls.length).toBeGreaterThanOrEqual(190);
    for (const url of thumbUrls) {
      expect(url).toMatch(
        /^http:\/\/127\.0\.0\.1:4173\/static\/image\/[a-z0-9_]+-thumb(?:\.[0-9a-f]+)?\.webp$/,
      );
    }

    // Visit one recipe detail online so its full-size photo populates the bounded runtime cache
    await page.goto('/#/rezept/oven_salmon');
    const detailImg = page.locator('img').first();
    await expect(detailImg).toBeVisible();
    await expect
      .poll(async () =>
        detailImg.evaluate((img: HTMLImageElement) => ({
          complete: img.complete,
          naturalWidth: img.naturalWidth,
        })),
      )
      .toEqual({ complete: true, naturalWidth: expect.any(Number) });
    const onlineDetailWidth = await detailImg.evaluate(
      (img: HTMLImageElement) => img.naturalWidth,
    );
    expect(onlineDetailWidth).toBeGreaterThan(0);

    const postDetailCaches = await page.evaluate(async () => {
      const keys = (await caches.keys()).sort();
      const imageKey = keys.find((k) => k.startsWith('edovita-images-'));
      let imageUrls: string[] = [];
      if (imageKey) {
        const cache = await caches.open(imageKey);
        imageUrls = (await cache.keys()).map((r) => r.url).sort();
      }
      return { keys, imageKey, imageUrls };
    });
    expect(postDetailCaches.imageKey).toMatch(
      /^edovita-images-v[0-9A-Za-z._-]+-[0-9a-f]{12}$/,
    );
    expect(
      postDetailCaches.imageUrls.some((u) =>
        /\/static\/image\/oven_salmon\.[0-9a-f]+\.webp$/.test(u),
      ),
    ).toBe(true);

    // Go offline and verify full app start, manifest/icons, thumbnails, and cached full-size photo
    await context.setOffline(true);
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByRole('heading', { name: 'Willkommen bei Edovita' }),
      ).toBeVisible();

      // Manifest and PWA icons remain fetchable offline from the shell cache
      const offlineMeta = await page.evaluate(async () => {
        const manifestRes = await fetch('/manifest.webmanifest');
        const iconRes = await fetch('/icons/icon-192.png');
        const manifestBody = (await manifestRes.json()) as { name?: string };
        return {
          manifestOk: manifestRes.ok,
          manifestName: manifestBody.name,
          iconOk: iconRes.ok,
        };
      });
      expect(offlineMeta).toEqual({
        manifestOk: true,
        manifestName: 'Edovita',
        iconOk: true,
      });

      // Recipe list + precached thumbnails (and featured card fallback) render offline
      await page.goto('/#/rezepte', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByRole('heading', { name: /Rezepte/ }),
      ).toBeVisible();
      const featuredImg = page.locator('.edo-recipe-feat img').first();
      await expect(featuredImg).toBeVisible();
      await expect
        .poll(async () =>
          featuredImg.evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const compactThumb = page.locator('.edo-recipe-sm img').first();
      await expect(compactThumb).toBeVisible();
      await expect
        .poll(async () =>
          compactThumb.evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
        )
        .toBe(true);

      // Previously viewed recipe full-size photo renders offline from edovita-images-*
      await page.goto('/#/rezept/oven_salmon', {
        waitUntil: 'domcontentloaded',
      });
      const offlineHero = page.locator('img').first();
      await expect(offlineHero).toBeVisible();
      await expect
        .poll(async () =>
          offlineHero.evaluate(
            (img: HTMLImageElement) =>
              img.complete && img.naturalWidth >= 640,
          ),
        )
        .toBe(true);

      // Core tabs (Plan + Shopping) load cleanly offline
      await page.goto('/#/plan', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByRole('heading', { name: 'Plan', exact: true }),
      ).toBeVisible();
      await page.goto('/#/einkauf', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByRole('heading', { name: 'Einkaufsliste', exact: true }),
      ).toBeVisible();

      // Verify Cache Storage hygiene & 0 CSP violations after offline navigation
      const hygiene = await page.evaluate(async () => {
        const keys = await caches.keys();
        const allUrls: string[] = [];
        for (const key of keys) {
          const cache = await caches.open(key);
          const reqs = await cache.keys();
          allUrls.push(...reqs.map((r) => r.url));
        }
        const target = window as unknown as { __cspViolations?: string[] };
        return {
          keys,
          hasForbidden: allUrls.some(
            (u) =>
              u.includes('/api/') ||
              u.includes('#import') ||
              !u.startsWith('http://127.0.0.1:4173/'),
          ),
          cspViolations: target.__cspViolations ?? [],
        };
      });
      expect(hygiene.hasForbidden).toBe(false);
      expect(hygiene.cspViolations).toEqual([]);
    } finally {
      await context.setOffline(false);
    }
  });
});
