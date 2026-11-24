import { expect, test } from '@playwright/test';

test.describe('E6 Journeys J4 & J5: Zweitsprache in Kopfzeile, zweizeilige Einkaufsliste & RTL ar-XB (390x844)', () => {
  test('J4: Zweitsprache PT über Kopfzeile wählen -> Rezept-Detail «Broccoli · brócolis» + Schritte DE -> Einkaufsliste zweizeilig -> Reload -> Profil/Keine -> UI=Zweitsprache ausblenden', async ({
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

    await page.goto('/#/rezept/oven_salmon');
    await expect(
      page.getByRole('heading', {
        name: 'Ofenlachs mit Broccoli und Kartoffeln',
      }),
    ).toBeVisible();

    // Zweitsprache-Umschalter sitzt links neben dem Hauptumschalter, beide >= 44x44 px
    const secondBtn = page.getByTestId('second-switch-btn');
    const langBtn = page.getByTestId('lang-switch-btn');
    await expect(secondBtn).toBeVisible();
    await expect(langBtn).toBeVisible();

    const secondBox = await secondBtn.boundingBox();
    const langBox = await langBtn.boundingBox();
    expect(secondBox).not.toBeNull();
    expect(langBox).not.toBeNull();
    expect(secondBox!.width).toBeGreaterThanOrEqual(44);
    expect(secondBox!.height).toBeGreaterThanOrEqual(44);
    expect(secondBox!.x + secondBox!.width).toBeLessThanOrEqual(langBox!.x);

    // Im Normalbetrieb ohne ?pseudoRtl=1 darf ar-XB NICHT sichtbar sein
    await secondBtn.click();
    const secondMenu = page.getByTestId('second-switch-menu');
    await expect(secondMenu).toBeVisible();
    await expect(secondMenu.locator('[data-second="ar-XB"]')).toHaveCount(0);

    // Nur ein Menü gleichzeitig offen
    await langBtn.click();
    await expect(page.getByTestId('lang-switch-menu')).toBeVisible();
    await expect(secondMenu).toBeHidden();

    // Tastatur: ArrowDown öffnet -> Escape schliesst & gibt Fokus zurück -> PT wählen
    await secondBtn.focus();
    await page.keyboard.press('ArrowDown');
    await expect(secondMenu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(secondMenu).toBeHidden();
    await expect(secondBtn).toBeFocused();

    await secondBtn.click();
    await secondMenu.locator('[data-second="pt"]').click();
    await expect(page.getByTestId('second-switch-code')).toHaveText('PT');
    await expect(secondBtn).toBeFocused();

    // Rezept-Detail: einzeilig "Broccoli · brócolis", Schritte bleiben Deutsch mit Hinweis
    const brocIng = page.getByTestId('ingredient-broccoli-1');
    await expect(brocIng).toContainText('Broccoli');
    const brocBdi = brocIng.locator('bdi');
    await expect(brocBdi).toHaveText('brócolis');
    await expect(brocBdi).toHaveAttribute('lang', 'pt-BR');
    await expect(brocBdi).toHaveAttribute('dir', 'ltr');
    await expect(page.getByTestId('second-lang-steps-hint')).toContainText(
      'Schritte und Menüs bleiben in der App-Sprache.',
    );

    // Zur Einkaufsliste -> Liste zweizeilig (Zeile 1 Name, Zeile 2 Zweitname + Menge), kein Chip
    await page.getByTestId('add-to-shopping-btn').click();
    await page.getByTestId('detail-open-shopping-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();
    await expect(page.getByTestId('second-lang-chip')).toHaveCount(0);

    const brocRow = page.getByTestId('shop-row-broccoli__g');
    await expect(brocRow.locator('[data-bilingual="two-line"]')).toBeVisible();
    await expect(brocRow.locator('bdi')).toHaveText('brócolis');
    await expect(brocRow).toContainText('400 g');

    // Reload -> manuelle Wahl PT bleibt persistent
    await page.reload();
    await expect(page.getByTestId('second-switch-code')).toHaveText('PT');
    await expect(
      page.getByTestId('shop-row-broccoli__g').locator('bdi'),
    ).toHaveText('brócolis');

    // Profil > Sprache -> Abschnitt Zweitsprache -> «Keine» wählen -> einzeilige Liste
    await page.goto('/#/profil/sprache');
    const secList = page.getByTestId('second-lang-list');
    await expect(secList).toBeVisible();
    await expect(secList.locator('[data-second="pt"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await secList.locator('[data-second="none"]').click();
    await expect(page.getByTestId('second-switch-code')).toHaveText('—');

    await page.goto('/#/einkauf');
    await expect(
      page.getByTestId('shop-row-broccoli__g').locator('[data-bilingual="one-line"]'),
    ).toBeVisible();
    await expect(
      page.getByTestId('shop-row-broccoli__g').locator('bdi'),
    ).toHaveCount(0);

    // EN als Zweitsprache wählen -> UI auf EN umstellen -> Zweitsprache automatisch ausgeblendet
    await secondBtn.click();
    await secondMenu.locator('[data-second="en"]').click();
    await expect(page.getByTestId('second-switch-code')).toHaveText('EN');

    await langBtn.click();
    await page.getByTestId('lang-switch-menu').locator('[data-lang="en"]').click();
    await expect(page.getByTestId('lang-switch-code')).toHaveText('EN');
    await expect(page.getByTestId('second-switch-code')).toHaveText('—');
    await expect(
      page.getByTestId('shop-row-broccoli__g').locator('bdi'),
    ).toHaveCount(0);

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('J5: Pseudo-RTL ar-XB isoliert Zweitnamen mit <bdi dir="rtl"> ohne Layout-Verschiebung in Rezept & Einkaufsliste', async ({
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

    await page.goto('/?pseudoRtl=1#/rezept/oven_salmon');
    await expect(
      page.getByRole('heading', {
        name: 'Ofenlachs mit Broccoli und Kartoffeln',
      }),
    ).toBeVisible();

    await page.getByTestId('second-switch-btn').click();
    const rtlOption = page
      .getByTestId('second-switch-menu')
      .locator('[data-second="ar-XB"]');
    await expect(rtlOption).toBeVisible();
    await rtlOption.click();

    // Rezept-Detail: <bdi lang="ar-XB" dir="rtl"> isoliert und kein horizontaler Überlauf
    const ingBdi = page.getByTestId('ingredient-broccoli-1').locator('bdi');
    await expect(ingBdi).toHaveText('بروكلي');
    await expect(ingBdi).toHaveAttribute('lang', 'ar-XB');
    await expect(ingBdi).toHaveAttribute('dir', 'rtl');
    const bidiStyle = await ingBdi.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { direction: cs.direction, unicodeBidi: cs.unicodeBidi };
    });
    expect(bidiStyle.direction).toBe('rtl');
    expect(bidiStyle.unicodeBidi).toContain('isolate');

    const recipeOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(recipeOverflow).toBeLessThanOrEqual(1);

    // Einkaufsliste mit ar-XB: zweizeilig, ⓘ 56x56 & «Hab ich» >= 48x48 im Viewport, kein Überlauf
    await page.getByTestId('add-to-shopping-btn').click();
    await page.getByTestId('detail-open-shopping-btn').click();

    const brocRow = page.getByTestId('shop-row-broccoli__g');
    const shopBdi = brocRow.locator('bdi');
    await expect(shopBdi).toHaveText('بروكلي');
    await expect(shopBdi).toHaveAttribute('lang', 'ar-XB');
    await expect(shopBdi).toHaveAttribute('dir', 'rtl');

    const shopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(shopOverflow).toBeLessThanOrEqual(1);

    const srcBox = await page.getByTestId('shop-src-broccoli__g').boundingBox();
    const haveBox = await page.getByTestId('shop-have-broccoli__g').boundingBox();
    const actionsBox = await page.getByTestId('bottom-actions').boundingBox();
    expect(srcBox).not.toBeNull();
    expect(haveBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(Math.round(srcBox!.width)).toBe(56);
    expect(Math.round(srcBox!.height)).toBe(56);
    expect(haveBox!.x + haveBox!.width).toBeLessThanOrEqual(390);
    expect(actionsBox!.y + actionsBox!.height).toBeLessThanOrEqual(844);

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
