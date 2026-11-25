import { expect, test } from '@playwright/test';

test.describe('E9 Navigation: Tab-Leiste, Profil -> Sprache, BottomActions & RTL (390x844)', () => {
  test('Start -> Tab Profil -> Sprache -> zurück -> Tab Rezepte ohne Überlappung auf Handy & Desktop sowie RTL-Spiegelung', async ({
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
      page.getByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeVisible();

    // Tab-Leiste sichtbar: Rezepte, Plan & Profil (E9 + E10)
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(nav).toBeVisible();
    const tabIds = await nav
      .locator('[data-tabid]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-tabid')));
    expect(tabIds).toEqual(['rezepte', 'plan', 'profil']);

    // Touch-Ziele >= 44x44 px und kein Überlappen mit BottomActions auf Startseite
    const tabRezepte = page.getByTestId('tab-rezepte');
    const tabProfil = page.getByTestId('tab-profil');
    const rezepteLtrBox = await tabRezepte.boundingBox();
    const profilLtrBox = await tabProfil.boundingBox();
    const navBox = await nav.boundingBox();
    const homeActionsBox = await page
      .getByTestId('bottom-actions')
      .boundingBox();

    expect(rezepteLtrBox).not.toBeNull();
    expect(profilLtrBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(homeActionsBox).not.toBeNull();
    expect(rezepteLtrBox!.width).toBeGreaterThanOrEqual(44);
    expect(rezepteLtrBox!.height).toBeGreaterThanOrEqual(44);
    expect(profilLtrBox!.width).toBeGreaterThanOrEqual(44);
    expect(profilLtrBox!.height).toBeGreaterThanOrEqual(44);
    expect(homeActionsBox!.y + homeActionsBox!.height).toBeLessThanOrEqual(
      navBox!.y + 1,
    );
    expect(navBox!.y + navBox!.height).toBeLessThanOrEqual(844);

    // Tastaturbedienung: Fokus auf Tab Profil + Enter öffnet #/profil
    await tabProfil.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Profil' })).toBeVisible();
    expect(page.url()).toContain('#/profil');
    await expect(tabProfil).toHaveAttribute('aria-current', 'page');
    await expect(tabRezepte).not.toHaveAttribute('aria-current', 'page');

    // Profil zeigt Zeile «Sprache» mit aktuellem Sprachnamen und keinen Demo-Abschnitt
    const langRow = page.getByTestId('profil-sprache-btn');
    await expect(langRow).toBeVisible();
    await expect(langRow).toContainText('Sprache');
    await expect(langRow).toContainText('Deutsch');
    await expect(page.getByText(/Weitere Funktionen/i)).toHaveCount(0);

    // Profil -> Sprache (#/profil/sprache) -> Zurück nach #/profil
    await langRow.click();
    await expect(
      page.getByRole('heading', { name: 'Sprache', exact: true }),
    ).toBeVisible();
    expect(page.url()).toContain('#/profil/sprache');
    await expect(tabProfil).toHaveAttribute('aria-current', 'page');

    await page.getByRole('button', { name: 'Zurück', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Profil' })).toBeVisible();
    expect(page.url()).toMatch(/#\/profil$/);

    // Direkter Hash #/profil/sprache (Alias) funktioniert weiterhin
    await page.goto('/#/profil/sprache');
    await expect(
      page.getByRole('heading', { name: 'Sprache', exact: true }),
    ).toBeVisible();
    await expect(tabProfil).toHaveAttribute('aria-current', 'page');

    // Tab Rezepte -> #/rezepte & Detailseite ohne Überlappung mit BottomActions
    await tabRezepte.click();
    await expect(
      page.getByRole('heading', { name: 'Rezepte für dich' }),
    ).toBeVisible();
    expect(page.url()).toContain('#/rezepte');
    await expect(tabRezepte).toHaveAttribute('aria-current', 'page');

    const listActionsBox = await page
      .getByTestId('bottom-actions')
      .boundingBox();
    const listNavBox = await nav.boundingBox();
    expect(listActionsBox).not.toBeNull();
    expect(listNavBox).not.toBeNull();
    expect(listActionsBox!.y + listActionsBox!.height).toBeLessThanOrEqual(
      listNavBox!.y + 1,
    );

    await page
      .getByTestId('recipe-card-oven_salmon')
      .getByRole('button', { name: /Ofenlachs/i })
      .first()
      .click();
    await expect(
      page.getByRole('heading', {
        name: 'Ofenlachs mit Broccoli und Kartoffeln',
      }),
    ).toBeVisible();
    await expect(tabRezepte).toHaveAttribute('aria-current', 'page');

    const detailActionsBox = await page
      .getByTestId('bottom-actions')
      .boundingBox();
    const detailNavBox = await nav.boundingBox();
    expect(detailActionsBox!.y + detailActionsBox!.height).toBeLessThanOrEqual(
      detailNavBox!.y + 1,
    );
    expect(detailNavBox!.y + detailNavBox!.height).toBeLessThanOrEqual(844);

    // Unbekannte Route -> zurück auf Startseite /
    await page.goto('/#/unbekannt');
    await expect(
      page.getByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeVisible();

    // RTL-Prüfung (logische Eigenschaften + ar-XB-Modus): Tab-Leiste spiegelt horizontal ohne Überlauf
    await page.goto('/?pseudoRtl=1#/profil');
    await expect(page.getByRole('heading', { name: 'Profil' })).toBeVisible();
    const ltrRezepte = await tabRezepte.boundingBox();
    const ltrProfil = await tabProfil.boundingBox();
    expect(ltrRezepte!.x).toBeLessThan(ltrProfil!.x);

    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });
    const rtlRezepte = await tabRezepte.boundingBox();
    const rtlProfil = await tabProfil.boundingBox();
    expect(rtlRezepte!.x).toBeGreaterThan(rtlProfil!.x);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'ltr');
    });

    // Desktop-Viewport (1280x800): auf --edo-app-h warten (F1), kein Überlappen von BottomActions & Tab-Leiste
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

    const deskActions = await page.getByTestId('bottom-actions').boundingBox();
    const deskNav = await nav.boundingBox();
    expect(deskActions).not.toBeNull();
    expect(deskNav).not.toBeNull();
    expect(deskActions!.y + deskActions!.height).toBeLessThanOrEqual(
      deskNav!.y + 1,
    );
    expect(deskNav!.y + deskNav!.height).toBeLessThanOrEqual(800);

    const cspViolations = await page.evaluate(() => {
      const target = window as unknown as { __cspViolations?: string[] };
      return target.__cspViolations ?? [];
    });
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
