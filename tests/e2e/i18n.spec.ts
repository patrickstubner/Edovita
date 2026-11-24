import { expect, test } from '@playwright/test';

test.describe('E2 + v5.5 Browser pt-BR Fallback EN & Whitelist (390x844)', () => {
  test.use({ locale: 'pt-BR' });

  test('Browser pt-BR startet im Fallback EN, zeigt kompakten Umschalter nur mit freigegebenen Sprachen und volle Liste nur unter #/profil/sprache', async ({
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

    // Startseite enthält keine volle Sprachliste mehr (v5.5)
    await expect(page.getByTestId('lang-list')).toHaveCount(0);
    await expect(page.getByTestId('lang-detect-banner')).toHaveCount(0);

    // Kompakter Umschalter oben rechts (>= 44x44 px, lokale SVG-Flagge 22x16, Kürzel EN)
    const btn = page.getByTestId('lang-switch-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toHaveAttribute('aria-controls', 'langMenu');
    await expect(page.getByTestId('lang-switch-code')).toHaveText('EN');

    const btnBox = await btn.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(btnBox!.width).toBeGreaterThanOrEqual(44);
    expect(btnBox!.height).toBeGreaterThanOrEqual(44);

    const flagBox = await btn.locator('.edo-lang-flag').boundingBox();
    expect(flagBox).not.toBeNull();
    expect(Math.round(flagBox!.width)).toBe(22);
    expect(Math.round(flagBox!.height)).toBe(16);

    // Dropdown zeigt ausschliesslich aktive & freigegebene Sprachen (de, en) – keine unfreigegebenen
    await btn.click();
    const menu = page.getByRole('listbox', { name: 'Language' });
    await expect(menu).toBeVisible();
    const optionCodes = await menu
      .locator('[role="option"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-lang')));
    expect(optionCodes).toEqual(['de', 'en']);

    // Klick auf Hintergrund schliesst Dropdown
    await page.getByTestId('lang-switch-backdrop').click({ position: { x: 20, y: 400 } });
    await expect(menu).toBeHidden();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');

    // Manipulierte unfreigegebene Sprache in localStorage wird ignoriert (Whitelist)
    await page.evaluate(() => {
      window.localStorage.setItem('edovita.lang', 'fr');
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeVisible();
    await expect(page.getByTestId('lang-switch-code')).toHaveText('EN');

    // Ausführliche Sprachliste bleibt unter #/profil/sprache mit ausgegrauten Sprachen
    await page.goto('/#/profil/sprache');
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

test.describe('E2 + v5.5 Kompakter Umschalter: Tastatur, Live-Wechsel J6, alle Screens & RTL (390x844)', () => {
  test('wechselt DE -> EN per Tastatur, hält Fokus/Zustand, erscheint auf allen Screens und spiegelt in RTL', async ({
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
    await expect(page.getByTestId('lang-switch-code')).toHaveText('DE');

    // Zustand setzen (Dunkelmodus)
    await page.getByRole('button', { name: 'Dunkel' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-eff', 'dark');

    // Tastaturbedienung: ArrowDown öffnet -> Escape schliesst & gibt Fokus zurück
    const btn = page.getByTestId('lang-switch-btn');
    await btn.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('listbox', { name: 'Sprache' });
    await expect(menu).toBeVisible();
    await expect(menu.locator('[data-lang="de"]')).toBeFocused();

    await page.keyboard.press('End');
    await expect(menu.locator('[data-lang="en"]')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(menu.locator('[data-lang="de"]')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(btn).toBeFocused();

    // ArrowUp öffnet auf letzter Option (en) -> Enter wählt EN -> sofortiger Wechsel & Fokus zurück auf Button
    await page.keyboard.press('ArrowUp');
    await expect(menu).toBeVisible();
    await expect(menu.locator('[data-lang="en"]')).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(
      page.getByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await expect(page.getByTestId('lang-switch-code')).toHaveText('EN');
    await expect(btn).toBeFocused();
    // Zustand bleibt erhalten
    await expect(page.locator('html')).toHaveAttribute('data-eff', 'dark');

    // Umschalter bleibt auf allen Screens oben rechts sichtbar (mit Header-Abstand)
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(btn).toBeVisible();
    const headerPadEnd = await page
      .locator('.edo-screen-header')
      .evaluate((el) => getComputedStyle(el).paddingInlineEnd);
    expect(headerPadEnd).toBe('96px');

    await page.goto('/#/rezepte');
    await expect(btn).toBeVisible();

    // Wahl überlebt Neuladen (localStorage + IndexedDB H1)
    await page.reload();
    await expect(page.getByTestId('lang-switch-code')).toHaveText('EN');

    // RTL-Prüfung: Umschalter wechselt über logische CSS-Eigenschaft nach links
    const ltrBox = await btn.boundingBox();
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });
    const rtlBox = await btn.boundingBox();
    expect(ltrBox).not.toBeNull();
    expect(rtlBox).not.toBeNull();
    expect(ltrBox!.x).toBeGreaterThan(200);
    expect(rtlBox!.x).toBeLessThan(100);

    expect(consoleErrors).toEqual([]);
  });
});
