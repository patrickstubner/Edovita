import { expect, test } from '@playwright/test';

test('Startseite rendert im Handy-Viewport (390x844) mit strikter CSP und fixen BottomActions', async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  const cspViolations: string[] = [];

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
  const headers = response!.headers();

  // Strenge Sicherheits-Header prüfen (ADR-004, docs/architektur/SECURITY.md)
  const csp = headers['content-security-policy'] ?? '';
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("style-src 'self'");
  expect(csp).toContain("connect-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toContain('unsafe-inline');
  expect(csp).not.toContain('unsafe-eval');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('no-referrer');

  await expect(
    page.getByRole('heading', { name: 'Willkommen bei Edovita' }),
  ).toBeVisible();

  // Passendes Farbschema (Hell vs. Dunkel) je Projekt prüfen
  const expectedEff = testInfo.project.name.includes('dark') ? 'dark' : 'light';
  await expect(page.locator('html')).toHaveAttribute('data-eff', expectedEff);

  // Fixe Aktionsleiste muss vollständig im 390x844-Viewport sichtbar sein
  const actions = page.getByTestId('bottom-actions');
  await expect(actions).toBeVisible();
  const box = await actions.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);

  // Theme-Wechsel und Hash-Navigation prüfen
  await page.getByRole('button', { name: 'Dunkel' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-eff', 'dark');

  await page.getByRole('button', { name: 'Hell' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-eff', 'light');

  await page.getByRole('button', { name: /Weiter zum Projektstand/i }).click();
  await expect(
    page.getByRole('heading', { name: 'Grundgerüst E0' }),
  ).toBeVisible();
  expect(page.url()).toContain('#/status');

  const runtimeViolations = await page.evaluate(() => {
    const target = window as unknown as { __cspViolations?: string[] };
    return target.__cspViolations ?? [];
  });
  cspViolations.push(...runtimeViolations);

  expect(cspViolations).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
