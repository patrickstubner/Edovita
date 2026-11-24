import { expect, test } from '@playwright/test';

function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

test.describe('E5 + E5b Journeys J1, J3, J7 & J9: Einkaufsliste v5.9, ⓘ-Sheet, Teilmenge & QR-Import (390x844)', () => {
  test('J1 + ⓘ-Sheet + J3: Rezept skalieren -> ⓘ-Sheet (28/56/16 px, Tastatur/Escape, Fokus-Rückkehr, kein Abhaken) -> Korb & «Hab ich»-Sheet -> Reload -> «Doch kaufen»-Sheet', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    await page.addInitScript(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      target.__cspViolations = [];
      window.addEventListener('securitypolicyviolation', (ev) => {
        target.__cspViolations?.push(`${ev.violatedDirective}: ${ev.blockedURI}`);
      });
    });

    // J1: Rezepte -> Ofenlachs -> Portionen 2 -> 4 -> Zur Einkaufsliste -> Einkauf
    await page.goto('/#/rezepte');
    const salmonCard = page.getByTestId('recipe-card-oven_salmon');
    await expect(salmonCard).toBeVisible();
    await salmonCard
      .getByRole('button', { name: /Ofenlachs mit Broccoli und Kartoffeln/i })
      .first()
      .click();
    await expect(
      page.getByRole('heading', {
        name: 'Ofenlachs mit Broccoli und Kartoffeln',
      }),
    ).toBeVisible();

    const incBtn = page.getByTestId('servings-inc');
    await incBtn.click();
    await incBtn.click();
    await expect(page.getByTestId('servings-output')).toHaveText('4 Portionen');

    await page.getByTestId('add-to-shopping-btn').click();
    await expect(page.getByTestId('toast')).toContainText(
      'zur Einkaufsliste hinzugefügt',
    );

    // Zweites Rezept mit gemeinsamer Zutat (Linsencurry: Knoblauch +2 Stk. -> 6 Stk.)
    await page.goto('/#/rezept/lentil_curry');
    await page.getByTestId('add-to-shopping-btn').click();
    await page.getByTestId('detail-open-shopping-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();

    // Keine Rezept-Chips mehr in der Einkaufsliste (v5.9)
    await expect(page.getByTestId('shop-recipe-chips')).toHaveCount(0);

    // Verdoppelte & zusammengeführte Mengen: Kartoffeln 1'000 g, Broccoli 800 g, Knoblauch 6 Stk.
    const vegGroup = page.getByTestId('shop-group-veg');
    await expect(vegGroup).toContainText('Kartoffeln');
    await expect(vegGroup).toContainText(/1['’\s]?000\s*g/);
    await expect(vegGroup).toContainText('800 g');
    await expect(page.getByTestId('shop-row-garlic__pc')).toContainText('6 Stk.');

    // Fixe BottomActions immer sichtbar im Viewport (390x844)
    const actionsBox = await page.getByTestId('bottom-actions').boundingBox();
    expect(actionsBox).not.toBeNull();
    expect(actionsBox!.y + actionsBox!.height).toBeLessThanOrEqual(844);

    // ⓘ-Knopf Masse (Icon 28x28, Tippfläche 56x56, Abstand >= 16 px) & kein Abhaken beim Tippen
    const garlicToggle = page.getByTestId('shop-toggle-garlic__pc');
    const garlicSrc = page.getByTestId('shop-src-garlic__pc');
    const toggleBox = await garlicToggle.boundingBox();
    const srcBox = await garlicSrc.boundingBox();
    const srcIconBox = await garlicSrc.locator('.edo-ic').boundingBox();
    expect(toggleBox).not.toBeNull();
    expect(srcBox).not.toBeNull();
    expect(srcIconBox).not.toBeNull();
    expect(Math.round(srcBox!.width)).toBe(56);
    expect(Math.round(srcBox!.height)).toBe(56);
    expect(Math.round(srcIconBox!.width)).toBe(28);
    expect(Math.round(srcIconBox!.height)).toBe(28);
    expect(srcBox!.x - (toggleBox!.x + toggleBox!.width)).toBeGreaterThanOrEqual(15.5);

    // ⓘ öffnen -> Knoblauch bleibt unangehakt, Sheet zeigt beide Gerichte + Summe
    await garlicSrc.click();
    await expect(garlicToggle).toHaveAttribute('aria-pressed', 'false');
    const srcSheet = page.getByTestId('shop-src-sheet');
    await expect(srcSheet).toBeVisible();
    await expect(srcSheet).toContainText('Knoblauch');
    await expect(srcSheet).toContainText('Ofenlachs mit Broccoli und Kartoffeln, 4 Stk.');
    await expect(srcSheet).toContainText('Linsen-Curry mit Kokosmilch und Spinat, 2 Stk.');
    await expect(page.getByTestId('shop-src-sum')).toContainText('Summe: 6 Stk.');

    // Escape schliesst ⓘ-Sheet und gibt Fokus an ⓘ zurück
    await page.keyboard.press('Escape');
    await expect(srcSheet).toHaveCount(0);
    await expect(garlicSrc).toBeFocused();

    // Per Tastatur (Enter) erneut öffnen & per Escape wieder schliessen
    await page.keyboard.press('Enter');
    await expect(srcSheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(srcSheet).toHaveCount(0);
    await expect(garlicSrc).toBeFocused();

    // J3: Korb -> «Hab ich»-Sheet (Escape verwirft; «Übernehmen» -> «Schon zu Hause») -> Reload -> «Doch kaufen»-Sheet
    await page.getByTestId('shop-toggle-potato__g').click();
    await expect(page.getByTestId('shop-section-cart')).toContainText('Kartoffeln');
    await expect(page.getByTestId('shop-have-potato__g')).toHaveCount(0);

    const brocHave = page.getByTestId('shop-have-broccoli__g');
    await brocHave.click();
    await expect(page.getByTestId('shop-have-sheet')).toBeVisible();
    await expect(page.getByTestId('shop-have-all')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('shop-have-sheet')).toHaveCount(0);
    await expect(page.getByTestId('shop-group-veg')).toContainText('Broccoli');

    await brocHave.click();
    await page.getByTestId('shop-have-apply').click();
    await expect(page.getByTestId('shop-section-home')).toContainText('Broccoli');

    // Reload -> alle drei Zustände bleiben persistent
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();
    await expect(page.getByTestId('shop-group-veg')).toContainText('Knoblauch');
    await expect(page.getByTestId('shop-section-cart')).toContainText('Kartoffeln');
    await expect(page.getByTestId('shop-section-home')).toContainText('Broccoli');

    // «Doch kaufen» öffnet dasselbe Sheet -> «Zurücksetzen» holt Broccoli zurück in die offene Liste
    await page.getByTestId('shop-section-home').getByTestId('shop-have-broccoli__g').click();
    await expect(page.getByTestId('shop-have-sheet')).toBeVisible();
    await page.getByTestId('shop-have-reset').click();
    await expect(page.getByTestId('shop-group-veg')).toContainText('Broccoli');

    // Hausmarken-Info-Dialog oben & QR-Einkaufsliste
    await page.getByTestId('brands-info-btn').click();
    await expect(page.getByTestId('brands-sheet')).toBeVisible();
    await expect(page.getByTestId('brands-sheet')).toContainText('Migros');
    await page.getByTestId('brands-sheet-close').click();
    await expect(page.getByTestId('brands-sheet')).toHaveCount(0);

    await page.getByTestId('shop-qr-btn').click();
    await expect(page.getByTestId('qr-sheet')).toBeVisible();
    await expect(page.locator('svg.edo-qr-svg')).toBeVisible();
    await page.getByTestId('qr-sheet-close').click();

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('J9: Teilmenge («Hab ich»-Sheet, Kaufmenge + durchgestrichener Bedarf, oranger «Teilweise»-Knopf, Screenreader-Label, Reload) & Katalog-Artikel ohne ⓘ mit Teilmenge', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    await page.addInitScript(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      target.__cspViolations = [];
      window.addEventListener('securitypolicyviolation', (ev) => {
        target.__cspViolations?.push(`${ev.violatedDirective}: ${ev.blockedURI}`);
      });
    });

    // Rezept hinzufügen (Ofenlachs 2 Portionen: Kartoffeln 500 g, Broccoli 400 g)
    await page.goto('/#/rezept/oven_salmon');
    await page.getByTestId('add-to-shopping-btn').click();
    await page.getByTestId('detail-open-shopping-btn').click();

    // Teilmenge auf Kartoffeln (500 g): «Hab ich» -> 4× Stepper Minus (Schritt 50 g -> 300 g zu Hause) -> «Übernehmen»
    await page.getByTestId('shop-have-potato__g').click();
    await expect(page.getByTestId('shop-have-sheet')).toBeVisible();
    const minusBtn = page.getByTestId('shop-have-minus');
    await minusBtn.click();
    await minusBtn.click();
    await minusBtn.click();
    await minusBtn.click();
    await expect(page.getByTestId('shop-have-out')).toHaveText('300 g');
    await expect(page.getByTestId('shop-have-all')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('shop-have-apply').click();

    // Bleibt offen: Kaufmenge 200 g normal, Bedarf 500 g durchgestrichen, Screenreader-Label, oranger «Teilweise»-Knopf >= 48x48
    const potatoRow = page.getByTestId('shop-row-potato__g');
    await expect(potatoRow).toHaveAttribute('data-state', 'open');
    await expect(potatoRow).toHaveAttribute('data-partial', 'true');

    const potatoQty = page.getByTestId('shop-qty-potato__g');
    await expect(potatoQty).toHaveAttribute('aria-label', 'kaufen 200 g von 500 g');
    await expect(potatoQty.locator('.edo-shop-qty-buy')).toHaveText('200 g');
    await expect(potatoQty.locator('.edo-shop-qty-need')).toHaveText('500 g');
    await expect(potatoQty.locator('.edo-shop-qty-need')).toHaveAttribute('aria-hidden', 'true');
    const needDecoration = await potatoQty
      .locator('.edo-shop-qty-need')
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(needDecoration).toContain('line-through');

    const partialBtn = page.getByTestId('shop-have-potato__g');
    await expect(partialBtn).toHaveText('Teilweise');
    await expect(partialBtn).toHaveClass(/edo-havebtn-partial/);
    const partialBox = await partialBtn.boundingBox();
    expect(partialBox).not.toBeNull();
    expect(partialBox!.width).toBeGreaterThanOrEqual(48);
    expect(partialBox!.height).toBeGreaterThanOrEqual(48);

    // Katalog-Suche: Haferflocken manuell hinzufügen -> KEIN ⓘ-Knopf, aber «Hab ich» mit Teilmenge
    await page.getByTestId('catalog-search-input').fill('Hafer');
    await page.getByTestId('catalog-add-oats').click();
    await expect(page.getByTestId('shop-row-oats__g')).toBeVisible();
    await expect(page.getByTestId('shop-src-oats__g')).toHaveCount(0);

    await page.getByTestId('shop-have-oats__g').click();
    await expect(page.getByTestId('shop-have-sheet')).toBeVisible();
    await page.getByTestId('shop-have-range').fill('100');
    await page.getByTestId('shop-have-apply').click();
    await expect(page.getByTestId('shop-have-oats__g')).toHaveText('Teilweise');
    await expect(page.getByTestId('shop-qty-oats__g')).toHaveAttribute(
      'aria-label',
      'kaufen 100 g von 200 g',
    );

    // Reload -> beide Teilmengen bleiben persistent
    await page.reload();
    await expect(page.getByTestId('shop-qty-potato__g')).toHaveAttribute(
      'aria-label',
      'kaufen 200 g von 500 g',
    );
    await expect(page.getByTestId('shop-qty-oats__g')).toHaveAttribute(
      'aria-label',
      'kaufen 100 g von 200 g',
    );

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('J7: lehnt 41 Items, <script>-Namen und falschen st ab; gültiges QR-Fragment öffnet Bestätigungsdialog', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    await page.addInitScript(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      target.__cspViolations = [];
      window.addEventListener('securitypolicyviolation', (ev) => {
        target.__cspViolations?.push(`${ev.violatedDirective}: ${ev.blockedURI}`);
      });
    });

    // 1) 41 Items -> abgelehnt (count)
    const tooMany = Array.from({ length: 41 }, (_, i) => ({
      id: `i${i}`,
      n: `Artikel ${i}`,
      st: 'open',
    }));
    await page.goto(
      `/#/einkauf#import=${toBase64Url(JSON.stringify({ v: 1, items: tooMany }))}`,
    );
    await expect(page.getByTestId('qr-import-error')).toContainText('count');
    await expect(page.getByTestId('qr-import-dialog')).toHaveCount(0);
    await expect(page.getByTestId('shop-empty')).toBeVisible();

    // 2) <script> im Namen -> abgelehnt (name)
    await page.goto(
      `/#/einkauf#import=${toBase64Url(
        JSON.stringify({
          v: 1,
          items: [{ id: 'milk', n: '<script>alert(1)</script>', st: 'open' }],
        }),
      )}`,
    );
    await expect(page.getByTestId('qr-import-error')).toContainText('name');
    await expect(page.getByTestId('qr-import-dialog')).toHaveCount(0);
    await expect(page.getByTestId('shop-empty')).toBeVisible();

    // 3) Falscher Zustand st -> abgelehnt (schema)
    await page.goto(
      `/#/einkauf#import=${toBase64Url(
        JSON.stringify({
          v: 1,
          items: [{ id: 'milk', n: 'Milch', st: 'invalid_state' }],
        }),
      )}`,
    );
    await expect(page.getByTestId('qr-import-error')).toContainText('schema');
    await expect(page.getByTestId('qr-import-dialog')).toHaveCount(0);
    await expect(page.getByTestId('shop-empty')).toBeVisible();

    // 4) Gültiges Fragment -> Bestätigungsdialog mit Vorschau -> Übernehmen
    const valid = toBase64Url(
      JSON.stringify({
        v: 1,
        items: [
          { id: 'broccoli', n: 'Broccoli', st: 'open', a: 400, u: 'g' },
          { id: 'apple', n: 'Äpfel', st: 'home' },
        ],
      }),
    );
    await page.goto(`/#/einkauf#import=${valid}`);
    const dialog = page.getByTestId('qr-import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('2 Artikel übernehmen?');
    await expect(page.getByTestId('qr-import-preview')).toContainText('Broccoli');
    await expect(page.getByTestId('qr-import-preview')).toContainText('Äpfel');

    await page.getByTestId('qr-import-merge').click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId('shop-group-veg')).toContainText('Broccoli');
    await expect(page.getByTestId('shop-section-home')).toContainText('Äpfel');

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
