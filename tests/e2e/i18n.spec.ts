import { expect, test } from '@playwright/test';

test.describe('E2 Browser pt-BR Fallback EN (390x844)', () => {
  test.use({ locale: 'pt-BR' });

  test('Browser pt-BR startet im Fallback EN und zeigt FR/IT/ES/JA/PT ausgegraut', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

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
      page.getByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await expect(page.getByTestId('lang-detect-banner')).toContainText('pt-BR');

    for (const pending of ['fr', 'it', 'es', 'ja', 'pt']) {
      const row = page.locator(`[data-lang-pending="${pending}"]`);
      await expect(row).toBeVisible();
      await expect(row).toHaveAttribute('aria-disabled', 'true');
    }

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe('E2 Browser de-CH und Live-Wechsel J6 (390x844)', () => {
  test('Browser de-CH startet auf DE und wechselt DE -> EN ohne Neustart mit Zustandserhalt (J6)', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH');

    // Zustand setzen (Dunkelmodus)
    await page.getByRole('button', { name: 'Dunkel' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-eff', 'dark');

    // Live-Sprachwechsel auf Englisch ohne Neuladen
    await page.locator('button[data-lang="en"]').click();
    await expect(
      page.getByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    // Zustand bleibt erhalten
    await expect(page.locator('html')).toHaveAttribute('data-eff', 'dark');

    // Navigation zeigt englische Übersicht
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
