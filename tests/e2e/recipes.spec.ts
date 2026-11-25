import { expect, test } from '@playwright/test';

test.describe('E4 + E8 Journey J1: Rezeptliste & lokale Bilder -> Detail -> Portionen 2->4 -> Einkaufsliste -> Toast (390x844)', () => {
  test('öffnet Rezept-Detail mit lokalem WebP-Bild ohne Fremd-Requests, skaliert Portionen 2 -> 4, fügt zur Einkaufsliste hinzu und prüft unbekannte ID', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const foreignRequests: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));
    page.on('request', (req) => {
      const url = req.url();
      if (
        !url.startsWith('http://127.0.0.1:') &&
        !url.startsWith('http://localhost:') &&
        !url.startsWith('data:')
      ) {
        foreignRequests.push(url);
      }
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

    await page.goto('/');
    await page.getByRole('button', { name: 'Rezepte' }).click();

    await expect(
      page.getByRole('heading', { name: 'Rezepte für dich' }),
    ).toBeVisible();
    expect(page.url()).toContain('#/rezepte');

    // E8: Rezeptliste zeigt lokale WebP-Bilder (Top-Karte max. 180 px, loading="lazy", geladen)
    const listImgs = page.locator('[data-testid="recipe-list"] img');
    await expect(listImgs).toHaveCount(5);
    const firstImg = listImgs.first();
    await expect(firstImg).toHaveAttribute('loading', 'lazy');
    await expect(firstImg).toHaveJSProperty('complete', true);
    const firstNaturalWidth = await firstImg.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth,
    );
    expect(firstNaturalWidth).toBe(800);
    const firstHeroBox = await page
      .locator('[data-testid="recipe-list"] .edo-recipe-hero-btn')
      .first()
      .boundingBox();
    expect(firstHeroBox).not.toBeNull();
    expect(firstHeroBox!.height).toBeLessThanOrEqual(181);

    // Kachel «Ofenlachs mit Broccoli und Kartoffeln» antippen -> Detailseite
    const salmonCard = page.getByTestId('recipe-card-oven_salmon');
    await expect(salmonCard).toBeVisible();
    await salmonCard
      .getByRole('button', { name: /Ofenlachs mit Broccoli und Kartoffeln/i })
      .first()
      .click();

    expect(page.url()).toContain('#/rezept/oven_salmon');
    await expect(
      page.getByRole('heading', {
        name: 'Ofenlachs mit Broccoli und Kartoffeln',
      }),
    ).toBeVisible();

    // E8: Detailseite zeigt lokales 4:3-Titelbild (loading="eager", geladen, 800x600)
    const detailHeroImg = page.locator('[data-testid="recipe-detail-hero"] img');
    await expect(detailHeroImg).toBeVisible();
    await expect(detailHeroImg).toHaveAttribute('loading', 'eager');
    await expect(detailHeroImg).toHaveAttribute(
      'alt',
      'Ofenlachs mit Broccoli und Kartoffeln',
    );
    await expect(detailHeroImg).toHaveJSProperty('complete', true);
    const heroMetrics = await detailHeroImg.evaluate((el) => {
      const img = el as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      return {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        ratio: rect.width / rect.height,
      };
    });
    expect(heroMetrics.naturalWidth).toBe(800);
    expect(heroMetrics.naturalHeight).toBe(600);
    expect(heroMetrics.ratio).toBeGreaterThan(1.25);
    expect(heroMetrics.ratio).toBeLessThan(1.42);

    // Fixe BottomActions im Viewport sichtbar
    const actions = page.getByTestId('bottom-actions');
    await expect(actions).toBeVisible();
    const box = await actions.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);

    // Portionen 2 -> 4 (Mengen verdoppeln: Kartoffeln 500 g -> 1'000 g)
    const output = page.getByTestId('servings-output');
    await expect(output).toHaveText('2 Portionen');
    await expect(page.getByTestId('ingredient-potato-0')).toContainText('500 g');

    const incBtn = page.getByTestId('servings-inc');
    const incBox = await incBtn.boundingBox();
    expect(incBox!.width).toBeGreaterThanOrEqual(44);
    expect(incBox!.height).toBeGreaterThanOrEqual(44);

    await incBtn.click();
    await incBtn.click();
    await expect(output).toHaveText('4 Portionen');
    await expect(page.getByTestId('ingredient-potato-0')).toContainText(
      /1.?000\s*g/,
    );

    // Auch nach Scrollen nach unten bleibt BottomActions sichtbar
    await page.getByTestId('nutrition-panel').scrollIntoViewIfNeeded();
    await expect(actions).toBeVisible();
    const boxAfterScroll = await actions.boundingBox();
    expect(boxAfterScroll).not.toBeNull();
    expect(boxAfterScroll!.y + boxAfterScroll!.height).toBeLessThanOrEqual(844);

    // «Zur Einkaufsliste hinzufügen» -> Toast mit «Rückgängig», bleibt auf der Seite
    await page.getByTestId('add-to-shopping-btn').click();
    const toast = page.getByTestId('toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('8 Zutaten');
    expect(page.url()).toContain('#/rezept/oven_salmon');

    await page.getByTestId('toast-undo').click();
    await expect(toast).toContainText('rückgängig');

    // Unbekannte Rezept-ID -> «Rezept nicht gefunden» (kurzer Inhalt) mit sichtbarer BottomActions & Zurück-Navigation
    await page.goto('/#/rezept/unbekanntes_rezept');
    await expect(page.getByTestId('recipe-not-found')).toBeVisible();
    const shortBox = await page.getByTestId('bottom-actions').boundingBox();
    expect(shortBox).not.toBeNull();
    expect(shortBox!.y + shortBox!.height).toBeLessThanOrEqual(844);
    await page.getByRole('button', { name: 'Zurück zu Rezepten' }).first().click();
    await expect(
      page.getByRole('heading', { name: 'Rezepte für dich' }),
    ).toBeVisible();

    // Desktop-Viewport (1280x800): auf aktualisiertes --edo-app-h warten (F1), dann BottomActions prüfen
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--edo-app-h')
          .trim() === '800px',
    );
    await page.goto('/#/rezept/oven_salmon');
    await expect(
      page.getByRole('heading', {
        name: 'Ofenlachs mit Broccoli und Kartoffeln',
      }),
    ).toBeVisible();
    const desktopBox = await page.getByTestId('bottom-actions').boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.y).toBeGreaterThanOrEqual(0);
    expect(desktopBox!.y + desktopBox!.height).toBeLessThanOrEqual(800);

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(foreignRequests).toEqual([]);
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
