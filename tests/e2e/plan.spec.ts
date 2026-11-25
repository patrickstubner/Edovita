import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

function localTodayIso(): string {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function localAddDaysIso(delta: number): string {
  const now = new Date();
  const dt = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + delta,
  );
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

test.describe('Paket E10 (J10): Essensplan, Datenschutz-Export/Import, Dunkelmodus & RTL', () => {
  test('J10: Rezept-Detail -> Plan -> Zeitraum 3-7 -> Tauschen -> Entfernen -> Reload (390x844 Hell & Dunkel)', async ({
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

    const today = localTodayIso();
    const tomorrow = localAddDaysIso(1);

    // Start auf Rezept-Detail Ofenlachs
    await page.goto('/#/rezept/oven_salmon');
    await expect(
      page.getByRole('heading', { level: 1, name: /Ofenlachs/ }),
    ).toBeVisible();

    // «Zum Plan hinzufügen» öffnet das modale PlanSheet mit Vorauswahl Abendessen
    const addToPlanBtn = page.getByTestId('add-to-plan-btn');
    await expect(addToPlanBtn).toBeVisible();
    await addToPlanBtn.click();

    await expect(page.getByTestId('plan-sheet')).toBeVisible();
    await expect(page.getByTestId('plan-slot-opt-dinner')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Morgen und 3 Portionen wählen -> Übernehmen
    await page.getByTestId(`plan-day-opt-${tomorrow}`).click();
    await page.getByTestId('plan-portions-inc').click();
    await expect(page.getByTestId('plan-portions-output')).toHaveText('3');
    await page.getByTestId('plan-sheet-confirm').click();

    // Weiterleitung nach #/plan mit Toast, Tab Plan aktiv, Tagestotal & WebP-Vorschaubild
    await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible();
    expect(page.url()).toContain('#/plan');
    await expect(page.getByTestId('tab-plan')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByTestId('toast')).toContainText('Zum Plan hinzugefügt');
    await expect(page.getByText('Einkaufsliste erstellen')).toHaveCount(0);

    const tomorrowCard = page.getByTestId(`plan-day-${tomorrow}`);
    await expect(tomorrowCard).toContainText('Ofenlachs');
    await expect(page.getByTestId(`plan-day-total-${tomorrow}`)).toContainText(
      'kcal',
    );
    const thumbImg = tomorrowCard.locator('.edo-plan-thumb img').first();
    await expect(thumbImg).toBeVisible();
    const naturalWidth = await thumbImg.evaluate(
      (img: HTMLImageElement) => img.naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);

    // Zeitraum 3 -> 7 -> 5 Tage umschalten
    await page.getByTestId('plan-days-3').click();
    await expect(
      page.locator('[data-testid^="plan-day-20"]'),
    ).toHaveCount(3);
    await page.getByTestId('plan-days-7').click();
    await expect(
      page.locator('[data-testid^="plan-day-20"]'),
    ).toHaveCount(7);
    await page.getByTestId('plan-days-5').click();
    await expect(
      page.locator('[data-testid^="plan-day-20"]'),
    ).toHaveCount(5);

    // Direkt über «+ Rezept» ein Frühstück für heute hinzufügen
    await page.getByTestId(`plan-add-${today}-breakfast`).click();
    await expect(page.getByTestId('plan-pick-birchermuesli')).toBeVisible();
    await page.getByTestId('plan-pick-birchermuesli').click();
    await page.getByTestId('plan-sheet-confirm').click();
    await expect(page.getByTestId(`plan-day-${today}`)).toContainText(
      'Birchermüesli',
    );

    // Tauschen des Abendessens morgen (Ofenlachs -> Linsen-Curry)
    const swapBtn = tomorrowCard.locator('[data-testid^="plan-swap-"]').first();
    const swapBox = await swapBtn.boundingBox();
    expect(swapBox).not.toBeNull();
    expect(swapBox!.width).toBeGreaterThanOrEqual(44);
    expect(swapBox!.height).toBeGreaterThanOrEqual(44);

    await swapBtn.click();
    await expect(page.getByTestId('plan-pick-lentil_curry')).toBeVisible();
    await page.getByTestId('plan-pick-lentil_curry').click();
    await page.getByTestId('plan-sheet-confirm').click();
    await expect(tomorrowCard).toContainText('Linsen');

    // Persistenz über Neuladen (IndexedDB Dexie v3)
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible();
    await expect(page.getByTestId(`plan-day-${today}`)).toContainText(
      'Birchermüesli',
    );
    await expect(page.getByTestId(`plan-day-${tomorrow}`)).toContainText(
      'Linsen',
    );

    // Entfernen des Frühstücks heute -> «+ Rezept» erscheint wieder
    await page
      .getByTestId(`plan-day-${today}`)
      .locator('[data-testid^="plan-remove-"]')
      .first()
      .click();
    await expect(
      page.getByTestId(`plan-add-${today}-breakfast`),
    ).toBeVisible();

    // Kein horizontaler Überlauf im Hell- und Dunkelmodus
    const overflowLight = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflowLight).toBe(false);

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible();
    const overflowDark = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflowDark).toBe(false);

    const cspViolations = await page.evaluate(
      () =>
        (window as unknown as { __cspViolations?: string[] }).__cspViolations ??
        [],
    );
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('Datenschutz-Export/Import (edovita-plan-einkauf.json), Desktop & ar-XB RTL ohne Überlauf oder Fehler', async ({
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

    const today = localTodayIso();

    // Zuerst einen Eintrag planen
    await page.goto('/#/plan');
    await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible();
    await page.getByTestId(`plan-add-${today}-lunch`).click();
    await page.getByTestId('plan-pick-pho').click();
    await page.getByTestId('plan-sheet-confirm').click();
    await expect(page.getByTestId(`plan-day-${today}`)).toContainText('Pho');

    // Über Profil -> Datenschutz und Backup nach #/profil/datenschutz
    await page.getByTestId('tab-profil').click();
    await expect(page.getByRole('heading', { name: 'Profil' })).toBeVisible();
    await page.getByTestId('profil-datenschutz-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Datenschutz' }),
    ).toBeVisible();
    expect(page.url()).toContain('#/profil/datenschutz');

    // Export prüfen (Dateiname + JSON-Inhalt ohne Körper-/Einstellungsdaten)
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('data-export-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('edovita-plan-einkauf.json');
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    const exportedJson = JSON.parse(
      await readFile(downloadPath!, 'utf8'),
    ) as Record<string, unknown>;
    expect(exportedJson.v).toBe(1);
    expect(exportedJson.kind).toBe('edovita-prototype-export');
    expect('settings' in exportedJson).toBe(false);
    expect('profile' in exportedJson).toBe(false);

    // Ungültiger Import -> Fehler-Toast, kein Sheet
    const fileInput = page.getByTestId('data-import-file');
    await fileInput.setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ungueltig', 'utf8'),
    });
    await expect(page.getByTestId('toast')).toContainText(
      'Datei ungültig, nichts geändert',
    );
    await expect(page.getByTestId('data-import-sheet')).toHaveCount(0);

    // Gültiger Import -> Bestätigungs-Sheet -> Abbrechen -> erneut laden -> Übernehmen
    const importPayload = JSON.stringify({
      v: 1,
      kind: 'edovita-prototype-export',
      plan: {
        days: 6,
        items: [
          {
            id: 'pe2e001',
            date: today,
            slot: 'dinner',
            recipeId: 'oven_salmon',
            portions: 4,
          },
        ],
      },
      shopItems: [],
      shopStatus: {},
    });

    await fileInput.setInputFiles({
      name: 'edovita-plan-einkauf.json',
      mimeType: 'application/json',
      buffer: Buffer.from(importPayload, 'utf8'),
    });
    await expect(page.getByTestId('data-import-sheet')).toBeVisible();
    await expect(page.getByTestId('data-import-preview-plan')).toContainText(
      '1',
    );
    await page.getByTestId('data-import-cancel').click();
    await expect(page.getByTestId('data-import-sheet')).toHaveCount(0);

    await fileInput.setInputFiles({
      name: 'edovita-plan-einkauf.json',
      mimeType: 'application/json',
      buffer: Buffer.from(importPayload, 'utf8'),
    });
    await expect(page.getByTestId('data-import-sheet')).toBeVisible();
    await page.getByTestId('data-import-apply').click();
    await expect(page.getByTestId('toast')).toContainText('Daten übernommen');

    // Importierter Plan ist auf #/plan sichtbar und überlebt Reload
    await page.getByTestId('tab-plan').click();
    await expect(page.getByTestId('plan-days-6')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByTestId(`plan-day-${today}`)).toContainText(
      'Ofenlachs',
    );
    await page.reload();
    await expect(page.getByTestId(`plan-day-${today}`)).toContainText(
      'Ofenlachs',
    );

    // Desktop-Grösse 1280x800 ohne horizontalen Überlauf
    await page.setViewportSize({ width: 1280, height: 800 });
    const overflowDesktop = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflowDesktop).toBe(false);

    // RTL-Prüfung (logische Eigenschaften): Plan-Screen spiegelt sauber ohne Überlauf
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('plan-days-group')).toBeVisible();
    const overflowRtl = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflowRtl).toBe(false);
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'ltr');
    });

    const cspViolations = await page.evaluate(
      () =>
        (window as unknown as { __cspViolations?: string[] }).__cspViolations ??
        [],
    );
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
