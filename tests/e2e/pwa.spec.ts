import { expect, test } from '@playwright/test';

test.describe('E7a PWA installability and app-shell service worker', () => {
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

  test('registers app-shell SW, caches only HTML/JS/CSS (no images or user data), and loads offline', async ({
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

    // Inspect Cache Storage: strictly one versioned edovita-shell-* cache with HTML/JS/CSS only
    const cacheInspection = await page.evaluate(async () => {
      const keys = await caches.keys();
      const entriesByCache: Record<string, string[]> = {};
      for (const key of keys) {
        const cache = await caches.open(key);
        const requests = await cache.keys();
        entriesByCache[key] = requests.map((req) => req.url).sort();
      }
      return { keys, entriesByCache };
    });

    expect(cacheInspection.keys).toHaveLength(1);
    const cacheKey = cacheInspection.keys[0]!;
    expect(cacheKey).toMatch(/^edovita-shell-v[0-9A-Za-z._-]+-[0-9a-f]{12}$/);

    const cachedUrls = cacheInspection.entriesByCache[cacheKey] ?? [];
    expect(cachedUrls.some((u) => u.endsWith('/index.html'))).toBe(true);
    expect(cachedUrls.some((u) => u.endsWith('/theme-init.js'))).toBe(true);
    expect(cachedUrls.some((u) => /\/static\/js\/.+\.js$/.test(u))).toBe(true);
    expect(cachedUrls.some((u) => /\/static\/css\/.+\.css$/.test(u))).toBe(
      true,
    );

    for (const url of cachedUrls) {
      expect(url).toMatch(/^http:\/\/127\.0\.0\.1:4173\//);
      expect(url).not.toMatch(
        /\.(?:webp|png|jpe?g|gif|svg|ico|avif|json|webmanifest)$/i,
      );
      expect(url).not.toContain('/api/');
      expect(url).not.toContain('#import');
    }

    // Go offline and verify full reload loads the app shell from the SW cache
    await context.setOffline(true);
    try {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(
        page.getByRole('heading', { name: 'Willkommen bei Edovita' }),
      ).toBeVisible();

      // Verify hash navigation inside the offline app shell works cleanly
      await page.getByRole('button', { name: /Weiter/i }).click();
      await expect(
        page.getByRole('heading', { name: 'Übersicht' }),
      ).toBeVisible();
      expect(page.url()).toContain('#/status');

      // Re-verify Cache Storage still contains only the HTML/JS/CSS shell after offline navigation
      const postOfflineKeys = await page.evaluate(async () => {
        const keys = await caches.keys();
        const urls: string[] = [];
        for (const key of keys) {
          const cache = await caches.open(key);
          const reqs = await cache.keys();
          urls.push(...reqs.map((r) => r.url));
        }
        return { keys, urls };
      });
      expect(postOfflineKeys.keys).toEqual([cacheKey]);
      expect(postOfflineKeys.urls.sort()).toEqual(cachedUrls);

      const cspViolations = await page.evaluate(() => {
        const target = window as unknown as { __cspViolations?: string[] };
        return target.__cspViolations ?? [];
      });
      expect(cspViolations).toEqual([]);
    } finally {
      await context.setOffline(false);
    }
  });
});
