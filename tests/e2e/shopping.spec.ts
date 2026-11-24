import { expect, test } from '@playwright/test';

function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

test.describe('E5 Journeys J1, J2, J3 & J7: Einkaufsliste, Zustände, Teilen & QR-Import (390x844)', () => {
  test('J1 + J2 + J3: Rezept skalieren -> Einkauf -> zweites Rezept zusammenführen & entfernen -> drei Zustände persistent nach Reload -> Hausmarken & QR', async ({
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

    await page.getByTestId('detail-open-shopping-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();

    // Verdoppelte Mengen (4 Portionen): Kartoffeln 1'000 g, Broccoli 800 g, Knoblauch 4 Stk.
    const vegGroup = page.getByTestId('shop-group-veg');
    await expect(vegGroup).toContainText('Kartoffeln');
    await expect(vegGroup).toContainText(/1['’\s]?000\s*g/);
    await expect(vegGroup).toContainText('800 g');
    await expect(vegGroup).toContainText('4 Stk.');

    // Fixe BottomActions immer sichtbar im Viewport (390x844)
    const actionsBox = await page.getByTestId('bottom-actions').boundingBox();
    expect(actionsBox).not.toBeNull();
    expect(actionsBox!.y + actionsBox!.height).toBeLessThanOrEqual(844);

    // J2: Zweites Rezept mit gemeinsamer Zutat (Linsencurry: Knoblauch +2 Stk. -> 6 Stk.)
    await page.goto('/#/rezept/lentil_curry');
    await page.getByTestId('add-to-shopping-btn').click();
    await page.getByTestId('detail-open-shopping-btn').click();

    await expect(page.getByTestId('shop-row-garlic__pc')).toContainText('6 Stk.');
    await expect(page.getByTestId('shop-row-red_lentils__g')).toBeVisible();

    // Linsencurry entfernen -> Knoblauch wieder 4 Stk., Rote Linsen weg
    await page.getByTestId('shop-remove-recipe-lentil_curry').click();
    await expect(page.getByTestId('shop-row-garlic__pc')).toContainText('4 Stk.');
    await expect(page.getByTestId('shop-row-red_lentils__g')).toHaveCount(0);

    // J3: Drei Zustände (im Korb + «Hab ich» -> «Rückgängig» -> erneut «Hab ich» -> Neuladen)
    await page.getByTestId('shop-toggle-potato__g').click();
    await expect(page.getByTestId('shop-section-cart')).toContainText(
      'Kartoffeln',
    );

    await page.getByTestId('shop-have-broccoli__g').click();
    await expect(page.getByTestId('shop-section-home')).toContainText('Broccoli');
    await page.getByTestId('toast-undo').click();
    await expect(page.getByTestId('shop-group-veg')).toContainText('Broccoli');

    // Erneut «Hab ich» setzen und neu laden -> alle drei Zustände bleiben erhalten
    await page.getByTestId('shop-have-broccoli__g').click();
    await expect(page.getByTestId('shop-section-home')).toContainText('Broccoli');

    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();
    await expect(page.getByTestId('shop-group-veg')).toContainText('Knoblauch');
    await expect(page.getByTestId('shop-section-cart')).toContainText(
      'Kartoffeln',
    );
    await expect(page.getByTestId('shop-section-home')).toContainText('Broccoli');

    // Hausmarken-Info-Dialog oben
    await page.getByTestId('brands-info-btn').click();
    await expect(page.getByTestId('brands-sheet')).toBeVisible();
    await expect(page.getByTestId('brands-sheet')).toContainText('Migros');
    await page.getByTestId('brands-sheet-close').click();
    await expect(page.getByTestId('brands-sheet')).toHaveCount(0);

    // QR-Einkaufsliste öffnen -> lokales SVG sichtbar
    await page.getByTestId('shop-qr-btn').click();
    await expect(page.getByTestId('qr-sheet')).toBeVisible();
    const qrSvg = page.locator('svg.edo-qr-svg');
    await expect(qrSvg).toBeVisible();
    await page.getByTestId('qr-sheet-close').click();

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
