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
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();
    await expect(page.getByTestId('second-lang-chip')).toHaveCount(0);
    await expect(page.getByTestId('shop-sub')).toContainText(
      'Aus dem Plan für 5 Tage erstellt',
    );
    await expect(page.getByTestId('shop-sub').locator('bdi')).toHaveText(
      'Criada a partir do plano de 5 dias',
    );

    const brocRow = page.getByTestId('shop-row-broccoli__g');
    await expect(brocRow.locator('[data-bilingual="two-line"]')).toBeVisible();
    await expect(brocRow.locator('bdi')).toHaveText('brócolis');
    await expect(brocRow).toContainText('400 g');

    // E6b: Seitentitel, Gruppen, Abschnitte und beide Sheets zweisprachig in PT; Zeilen-Knopf bleibt einsprachig
    const titleSec = page.getByTestId('shop-title-sec').locator('bdi');
    await expect(titleSec).toHaveText('Lista de compras');
    await expect(titleSec).toHaveAttribute('lang', 'pt-BR');
    await expect(titleSec).toHaveAttribute('dir', 'ltr');

    const vegHead = page.getByTestId('shop-group-veg').locator('.edo-grph');
    await expect(vegHead.locator('bdi')).toHaveText('Frutas e verduras');
    await expect(page.getByTestId('shop-have-broccoli__g').locator('bdi')).toHaveCount(0);

    // Herkunfts-Sheet zweisprachig in PT (E12: Rezepttitel in allen 7 Sprachen -> PT statt EN-Ersatz)
    await page.getByTestId('shop-src-broccoli__g').click();
    const srcSheet = page.getByTestId('shop-src-sheet');
    await expect(srcSheet.locator('#edo-shop-src-title bdi')).toHaveText('brócolis');
    await expect(srcSheet.locator('.edo-shop-src-name')).toContainText(
      'Ofenlachs mit Broccoli und Kartoffeln',
    );
    const srcRecipeBdi = srcSheet.locator('.edo-shop-src-name bdi');
    await expect(srcRecipeBdi).toHaveCount(1);
    await expect(srcRecipeBdi).toHaveAttribute('lang', 'pt-BR');
    await expect(srcSheet).not.toContainText('Oven-baked salmon');
    await expect(page.getByTestId('shop-src-sum').locator('bdi')).toHaveText(
      'Total: 400 g',
    );
    await page.getByTestId('shop-src-close').click();

    // «Hab ich»-Sheet zweisprachig in PT + Abschnitt «Schon zu Hause» + «Im Korb»
    await page.getByTestId('shop-have-broccoli__g').click();
    const haveSheet = page.getByTestId('shop-have-sheet');
    await expect(haveSheet.locator('#edo-shop-have-title bdi')).toHaveText('brócolis');
    await expect(page.getByTestId('shop-have-hint').locator('bdi')).toHaveText('Já em casa?');
    await expect(page.getByTestId('shop-have-all').locator('bdi')).toHaveText('Tudo em casa');
    await expect(page.getByTestId('shop-have-amt').locator('bdi')).toHaveText(
      'Já em casa: 400 g',
    );
    await expect(page.getByTestId('shop-have-reset').locator('bdi')).toHaveText('Redefinir');
    await expect(page.getByTestId('shop-have-apply').locator('bdi')).toHaveText('Aplicar');
    await page.getByTestId('shop-have-apply').click();

    await expect(
      page.getByTestId('shop-section-home').locator('.edo-grph bdi'),
    ).toHaveText('Já tenho em casa');

    await page.getByTestId('shop-toggle-potato__g').click();
    await expect(
      page.getByTestId('shop-section-cart').locator('.edo-grph bdi'),
    ).toHaveText('No carrinho');

    // Keine horizontale Scrollleiste bei 390 px und 360 px
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });

    // Reload -> manuelle Wahl PT bleibt persistent (Liste + Titel)
    await page.reload();
    await expect(page.getByTestId('second-switch-code')).toHaveText('PT');
    await expect(page.getByTestId('shop-title-sec').locator('bdi')).toHaveText(
      'Lista de compras',
    );
    await expect(
      page.getByTestId('shop-row-broccoli__g').locator('bdi'),
    ).toHaveText('brócolis');

    // Profil > Sprache -> Abschnitt Zweitsprache -> «Keine» wählen -> einzeilige Liste & Sheets
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
    await expect(page.getByTestId('shop-title-sec')).toHaveCount(0);
    await expect(
      page.getByTestId('shop-row-broccoli__g').locator('[data-bilingual="one-line"]'),
    ).toBeVisible();
    await expect(
      page.getByTestId('shop-row-broccoli__g').locator('bdi'),
    ).toHaveCount(0);
    await expect(
      page.getByTestId('shop-section-home').locator('.edo-grph bdi'),
    ).toHaveCount(0);

    // EN als Zweitsprache wählen -> UI auf EN umstellen -> Zweitsprache automatisch ausgeblendet
    await secondBtn.click();
    await secondMenu.locator('[data-second="en"]').click();
    await expect(page.getByTestId('second-switch-code')).toHaveText('EN');

    await langBtn.click();
    await page.getByTestId('lang-switch-menu').locator('[data-lang="en"]').click();
    await expect(page.getByTestId('lang-switch-code')).toHaveText('EN');
    await expect(page.getByTestId('second-switch-code')).toHaveText('—');
    await expect(page.getByTestId('shop-title-sec')).toHaveCount(0);
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

  test('J5: Pseudo-RTL ar-XB isoliert Zweitnamen & Einkaufslisten-UI/Sheets mit <bdi dir="rtl"> ohne Layout-Verschiebung bei 390 und 360 px', async ({
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

    // Einkaufsliste mit ar-XB: Titel, Plan-Untertitel #shopSub, Gruppen, Zeilen und beide Sheets mit <bdi lang="ar-XB" dir="rtl">
    await page.getByTestId('add-to-shopping-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();

    const subBdi = page.getByTestId('shop-sub').locator('bdi');
    await expect(subBdi).toHaveAttribute('lang', 'ar-XB');
    await expect(subBdi).toHaveAttribute('dir', 'rtl');

    const titleBdi = page.getByTestId('shop-title-sec').locator('bdi');
    await expect(titleBdi).toHaveText('قائمة التسوق');
    await expect(titleBdi).toHaveAttribute('lang', 'ar-XB');
    await expect(titleBdi).toHaveAttribute('dir', 'rtl');

    const grpBdi = page.getByTestId('shop-group-veg').locator('.edo-grph bdi');
    await expect(grpBdi).toHaveText('خضار');
    await expect(grpBdi).toHaveAttribute('dir', 'rtl');

    const brocRow = page.getByTestId('shop-row-broccoli__g');
    const shopBdi = brocRow.locator('bdi');
    await expect(shopBdi).toHaveText('بروكلي');
    await expect(shopBdi).toHaveAttribute('lang', 'ar-XB');
    await expect(shopBdi).toHaveAttribute('dir', 'rtl');

    // Herkunfts-Sheet mit ar-XB
    await page.getByTestId('shop-src-broccoli__g').click();
    const srcSheet = page.getByTestId('shop-src-sheet');
    await expect(srcSheet.locator('#edo-shop-src-title bdi')).toHaveAttribute('dir', 'rtl');
    await expect(srcSheet.locator('.edo-shop-src-name bdi')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('shop-src-sum').locator('bdi')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId('shop-src-close').click();

    // «Hab ich»-Sheet mit ar-XB
    await page.getByTestId('shop-have-broccoli__g').click();
    const haveSheet = page.getByTestId('shop-have-sheet');
    await expect(haveSheet.locator('#edo-shop-have-title bdi')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('shop-have-all').locator('bdi')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('shop-have-apply').locator('bdi')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId('shop-have-close').click();

    // Kein horizontaler Überlauf bei 390 px und 360 px
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });

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
