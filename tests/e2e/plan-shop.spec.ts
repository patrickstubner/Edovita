import { expect, test } from '@playwright/test';

function localIsoOffset(daysOffset = 0): string {
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysOffset,
    12,
    0,
    0,
  );
  const y = String(target.getFullYear());
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

test.describe('E11 Journey J11: Plan -> Einkaufsliste, Top-Karten-Knopf, automatische Einplanung, Rückgängig & Transfer (390x844, 360x844, 1280x800, Hell & Dunkel)', () => {
  test('Top-Karte #/rezepte (nur auf Top-Karte, >= 44 px) -> Einplanen + Rückgängig -> Weiterleitung #/einkauf -> #/plan Ändern/Entfernen -> «Einkaufsliste erstellen» -> ⓘ-Sheet mit Plan-Slot -> Datenschutz Export/Import', async ({
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

    // 1) Top-Karte auf #/rezepte: genau 1 Knopf «Zur Einkaufsliste hinzufügen» (nur auf Top-Karte, >= 44 px)
    await page.goto('/#/rezepte');
    await expect(
      page.getByRole('heading', { name: 'Rezepte für dich' }),
    ).toBeVisible();

    const topAddButtons = page.getByTestId('top-card-add-to-list-btn');
    await expect(topAddButtons).toHaveCount(1);
    const topAddBtn = topAddButtons.first();
    await expect(topAddBtn).toHaveText('Zur Einkaufsliste hinzufügen');
    const topBtnBox = await topAddBtn.boundingBox();
    expect(topBtnBox).not.toBeNull();
    expect(topBtnBox!.height).toBeGreaterThanOrEqual(44);

    // Klick -> plant automatisch in nächsten freien Slot + Toast mit «Rückgängig»
    await topAddBtn.click();
    const toast = page.getByTestId('toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/Auf Liste und für .* eingeplant/);

    // Sofort «Rückgängig» -> bricht Weiterleitung ab und leert Plan + Liste wieder
    await page.getByTestId('toast-undo').click();
    await expect(toast).toContainText('rückgängig');
    expect(page.url()).toContain('#/rezepte');

    // Erneut klicken -> diesmal nicht rückgängig machen -> landet nach ~700 ms auf #/einkauf
    await topAddBtn.click();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();
    expect(page.url()).toContain('#/einkauf');

    // Plan-Untertitel #shopSub sichtbar
    const shopSub = page.getByTestId('shop-sub');
    await expect(shopSub).toBeVisible();
    await expect(shopSub).toContainText('Aus dem Plan für 5 Tage erstellt');

    // 2) Über Tab-Leiste zu #/plan wechseln -> automatisch eingeplantes Gericht ist sichtbar + #planMakeShop fix unten
    await page.getByTestId('tab-plan').click();
    await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible();
    const makeShopBtn = page.getByTestId('plan-make-shop-btn');
    await expect(makeShopBtn).toBeVisible();
    const makeShopBox = await makeShopBtn.boundingBox();
    expect(makeShopBox).not.toBeNull();
    expect(makeShopBox!.height).toBeGreaterThanOrEqual(44);
    expect(makeShopBox!.y + makeShopBox!.height).toBeLessThanOrEqual(844);

    // Zweites Gericht (Ofenlachs) für morgen Abend einplanen
    const tomorrow = localIsoOffset(1);
    await page.getByTestId(`plan-add-${tomorrow}-dinner`).click();
    await page.getByTestId('plan-pick-oven_salmon').click();
    await page.getByTestId('plan-sheet-confirm').click();
    await expect(page.getByTestId(`plan-day-${tomorrow}`)).toContainText(
      'Ofenlachs',
    );

    // «Einkaufsliste erstellen» -> wechselt auf #/einkauf mit Toast + aktualisierten Mengen
    await makeShopBtn.click();
    await expect(
      page.getByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeVisible();
    await expect(page.getByTestId('toast')).toContainText(
      'Einkaufsliste aktualisiert',
    );

    // ⓘ-Sheet zeigt Plan-Slot («… Abend · 500 g») & Summe
    await page.getByTestId('shop-src-potato__g').click();
    const srcSheet = page.getByTestId('shop-src-sheet');
    await expect(srcSheet).toBeVisible();
    await expect(srcSheet).toContainText(/Abend\s*·\s*500\s*g/);
    await expect(page.getByTestId('shop-src-sum')).toContainText('Summe: 500 g');
    await page.keyboard.press('Escape');
    await expect(srcSheet).toHaveCount(0);

    // Teilmenge (200 g vorhanden) auf Kartoffeln setzen und Zustand für Transfer prüfen
    await page.getByTestId('shop-have-potato__g').click();
    await page.getByTestId('shop-have-all').click(); // alle abwählen -> 0
    await page.getByTestId('shop-have-plus').click(); // 50 g
    await page.getByTestId('shop-have-plus').click(); // 100 g
    await page.getByTestId('shop-have-plus').click(); // 150 g
    await page.getByTestId('shop-have-plus').click(); // 200 g
    await page.getByTestId('shop-have-apply').click();
    await expect(page.getByTestId('shop-row-potato__g')).toHaveAttribute(
      'data-partial',
      'true',
    );

    // 3) Datenschutz Export -> JSON enthält Plan + shopItems + shopStatus (keine Körperdaten), Import übernimmt alles
    await page.getByTestId('tab-profil').click();
    await page.getByTestId('profil-datenschutz-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Datenschutz' }),
    ).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('data-export-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('edovita-plan-einkauf.json');
    const dlPath = await download.path();
    expect(dlPath).not.toBeNull();
    const fs = await import('node:fs/promises');
    const exportedRaw = await fs.readFile(dlPath!, 'utf8');
    const exported = JSON.parse(exportedRaw) as Record<string, unknown>;
    expect(exported.v).toBe(1);
    expect(exported.kind).toBe('edovita-prototype-export');
    expect(Array.isArray(exported.shopItems)).toBe(true);
    expect((exported.shopItems as unknown[]).length).toBeGreaterThan(0);
    expect(typeof exported.shopStatus).toBe('object');
    expect('settings' in exported).toBe(false);
    expect('profile' in exported).toBe(false);

    // 4) Schmaler Viewport 360x844 (läuft im Hell- & Dunkel-Projekt): kein horizontaler Überlauf auf #/rezepte, #/plan und #/einkauf
    await page.setViewportSize({ width: 360, height: 844 });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--edo-app-h')
          .trim() === '844px',
    );
    for (const route of ['/#/rezepte', '/#/plan', '/#/einkauf']) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }

    // 5) Desktop 1280x800: #planMakeShop im Viewport sichtbar
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--edo-app-h')
          .trim() === '800px',
    );
    await page.goto('/#/plan');
    const desktopMakeShop = await page
      .getByTestId('plan-make-shop-btn')
      .boundingBox();
    expect(desktopMakeShop).not.toBeNull();
    expect(desktopMakeShop!.y + desktopMakeShop!.height).toBeLessThanOrEqual(
      800,
    );

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
