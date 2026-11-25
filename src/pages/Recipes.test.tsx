import { afterEach, describe, expect, it } from '@rstest/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router';
import { App } from '../app/App.tsx';
import { I18nContext } from '../app/I18nProvider.tsx';
import { RatingsProvider } from '../app/RatingsProvider.tsx';
import { SecondLangProvider } from '../app/SecondLangProvider.tsx';
import { ShoppingProvider } from '../app/ShoppingProvider.tsx';
import { getRecipe } from '../catalog/index.ts';
import {
  NutritionPanel,
  RecipeCard,
  RecipeHeader,
} from '../components/index.ts';
import {
  asRecipeId,
  isSafeHttpsUrl,
  sanitizeExternalHttpsUrl,
  type LanguagesRegistry,
} from '../domain/index.ts';
import {
  LANGUAGES_REGISTRY,
  createI18nInstance,
  fmtAmount,
  fmtNumber,
} from '../i18n/index.ts';
import { nutrientsForServings, scaleIngredients } from '../nutrition/index.ts';
import { createMemoryStorage } from '../storage/index.ts';
import { RecipeDetailPage } from './RecipeDetailPage.tsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
});

describe('Paket E4: Rezeptliste, Rezept-Detailseite & F3b (Issue #10)', () => {
  it('zeigt alle Rezepte, filtert nach Mahlzeit und Eigenschaften und speichert Sterne/Merken persistent', async () => {
    const storage = createMemoryStorage();
    window.location.hash = '#/rezepte';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(
      await screen.findByRole('heading', { name: 'Rezepte für dich' }),
    ).toBeInTheDocument();

    const list = screen.getByTestId('recipe-list');
    expect(within(list).getAllByRole('article')).toHaveLength(5);

    // Mahlzeit-Filter: Frühstück -> nur Birchermüesli
    fireEvent.click(screen.getByRole('button', { name: 'Frühstück' }));
    expect(within(list).getAllByRole('article')).toHaveLength(1);
    expect(
      screen.getByTestId('recipe-card-birchermuesli'),
    ).toBeInTheDocument();

    // Mahlzeit-Filter: Zwischenmahlzeit -> leerer Zustand
    fireEvent.click(screen.getByRole('button', { name: 'Zwischenmahlzeit' }));
    expect(screen.getByTestId('recipes-empty')).toBeInTheDocument();

    // Zurück auf Alle + Eigenschaftsfilter «Schnell, bis 15 Min.» -> Birchermüesli
    fireEvent.click(screen.getByRole('button', { name: 'Alle' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Schnell, bis 15 Min.' }),
    );
    expect(within(list).getAllByRole('article')).toHaveLength(1);
    expect(
      screen.getByTestId('recipe-card-birchermuesli'),
    ).toBeInTheDocument();

    // Merken & 5 Sterne auf Birchermüesli -> persistent im RatingsRepository
    const card = screen.getByTestId('recipe-card-birchermuesli');
    fireEvent.click(within(card).getByRole('button', { name: 'Merken' }));
    fireEvent.click(
      within(card).getByRole('button', { name: 'Mit 5 von 5 Sternen bewerten' }),
    );

    expect(await screen.findByTestId('toast')).toBeInTheDocument();
    expect(await storage.ratings.isSaved('birchermuesli')).toBe(true);
    expect(await storage.ratings.getRating('birchermuesli')).toBe(5);

    // Filter «Schnell» aus, «Gemerkt» an -> genau Birchermüesli bleibt
    fireEvent.click(
      screen.getByRole('button', { name: 'Schnell, bis 15 Min.' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gemerkt' }));
    expect(within(list).getAllByRole('article')).toHaveLength(1);
    expect(
      screen.getByTestId('recipe-card-birchermuesli'),
    ).toBeInTheDocument();
  });

  it('Rezept-Detailseite (#/rezept/oven_salmon): Mengen & Nährwerte für 1, 2, 4 Portionen exakt gemäss Unit-Tests, Tastatur-Stepper, Einkaufsliste + Rückgängig', async () => {
    const storage = createMemoryStorage();
    const salmon = getRecipe('oven_salmon')!;
    window.location.hash = '#/rezept/oven_salmon';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(
      await screen.findByRole('heading', {
        name: 'Ofenlachs mit Broccoli und Kartoffeln',
      }),
    ).toBeInTheDocument();

    const output = screen.getByTestId('servings-output');
    expect(output).toHaveAttribute('aria-live', 'polite');
    expect(output).toHaveTextContent('2 Portionen');

    // Hilfsprüfung: gerenderte Mengen & kcal müssen exakt zu scaleIngredients / nutrientsForServings passen
    const expectMatchesDomain = (servings: number) => {
      const scaled = scaleIngredients(salmon, servings);
      const potato = scaled.find((i) => i.food === 'potato')!;
      const fish = scaled.find((i) => i.food === 'salmon')!;
      expect(screen.getByTestId('ingredient-potato-0')).toHaveTextContent(
        fmtAmount(potato.scaledAmount, potato.unit, 'de-CH'),
      );
      expect(screen.getByTestId('ingredient-salmon-2')).toHaveTextContent(
        fmtAmount(fish.scaledAmount, fish.unit, 'de-CH'),
      );

      const tot = nutrientsForServings(salmon, servings);
      if (servings > 1) {
        expect(screen.getByTestId('nutrition-total-kcal')).toHaveTextContent(
          `${fmtNumber(Math.round(tot.kcal), 'de-CH')} kcal`,
        );
        expect(screen.getByTestId('nutrition-total-protein')).toHaveTextContent(
          `${fmtNumber(tot.protein, 'de-CH', 1)} g`,
        );
      } else {
        expect(screen.getByTestId('nutrition-per-kcal')).toHaveTextContent(
          `${fmtNumber(Math.round(tot.kcal), 'de-CH')} kcal`,
        );
      }
    };

    // 2 Portionen (Standard)
    expectMatchesDomain(2);

    // Tastatur-Bedienung: ArrowLeft -> 1 Portion
    const spinbutton = screen.getByTestId('servings-spinbutton');
    fireEvent.keyDown(spinbutton, { key: 'ArrowLeft' });
    expect(output).toHaveTextContent('1 Portion');
    expect(screen.getByTestId('servings-dec')).toBeDisabled();
    expectMatchesDomain(1);

    // Tastatur-Bedienung: 3× ArrowRight -> 4 Portionen
    fireEvent.keyDown(spinbutton, { key: 'ArrowRight' });
    fireEvent.keyDown(spinbutton, { key: 'ArrowRight' });
    fireEvent.keyDown(spinbutton, { key: 'ArrowRight' });
    expect(output).toHaveTextContent('4 Portionen');
    expectMatchesDomain(4);

    // Quellenvermerk CH-NWD V7.1 und «mindestens» sichtbar
    expect(screen.getByTestId('nutrition-source')).toHaveTextContent(
      'Schweizer Nährwertdatenbank',
    );
    expect(screen.getByTestId('nutrition-minimum-badge')).toHaveTextContent(
      'mindestens',
    );

    // Zur Einkaufsliste hinzufügen -> Toast mit «Rückgängig», bleibt auf Seite
    fireEvent.click(screen.getByTestId('add-to-shopping-btn'));

    const toast = await screen.findByTestId('toast');
    expect(toast).toHaveTextContent('8 Zutaten zur Einkaufsliste hinzugefügt.');
    expect(window.location.hash).toContain('#/rezept/oven_salmon');

    const storedItems = await storage.shopping.list();
    expect(storedItems).toHaveLength(8);
    const storedPotato = storedItems.find((i) => i.food === 'potato');
    expect(storedPotato?.amount).toBe(1000);
    expect(storedPotato?.unit).toBe('g');

    // Rückgängig stellt vorherige leere Liste wieder her
    fireEvent.click(screen.getByTestId('toast-undo'));
    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'Hinzufügen rückgängig gemacht.',
    );
    expect(await storage.shopping.list()).toHaveLength(0);
  });

  it('zeigt Allergene inkl. «Kann enthalten» für allergensToCheck (#/rezept/pho)', async () => {
    const storage = createMemoryStorage();
    window.location.hash = '#/rezept/pho';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(await screen.findByTestId('allergen-summary')).toHaveTextContent(
      'Enthält: Fisch',
    );
    expect(screen.getByTestId('allergen-summary')).toHaveTextContent(
      'Kann enthalten: Sellerie',
    );
  });

  it('zeigt bei unbekannter Rezept-ID «Rezept nicht gefunden» mit Zurück-Navigation zur Rezeptliste', async () => {
    const storage = createMemoryStorage();
    window.location.hash = '#/rezept/existiert_nicht';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(await screen.findByTestId('recipe-not-found')).toHaveTextContent(
      'Rezept nicht gefunden',
    );

    const backButtons = screen.getAllByRole('button', {
      name: 'Zurück zu Rezepten',
    });
    expect(backButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(backButtons[0]!);
    expect(
      await screen.findByRole('heading', { name: 'Rezepte für dich' }),
    ).toBeInTheDocument();
  });

  it('F3b: verwirft Userinfo-URLs (https://user:pw@host) in review.sources und setzt rel="noopener noreferrer"', () => {
    expect(isSafeHttpsUrl('https://example.org/rezept')).toBe(true);
    expect(isSafeHttpsUrl('https://user:pw@example.org/rezept')).toBe(false);
    expect(isSafeHttpsUrl('https://user@example.org/rezept')).toBe(false);
    expect(sanitizeExternalHttpsUrl('https://user:pw@evil.example/x')).toBeNull();
    expect(sanitizeExternalHttpsUrl('http://example.org/x')).toBeNull();
    expect(sanitizeExternalHttpsUrl('https://example.org/ok')).toBe(
      'https://example.org/ok',
    );

    render(
      <NutritionPanel
        heading="Nährwerte"
        perServingLabel="Pro Portion"
        rows={[{ key: 'kcal', label: 'Energie', perServing: '480 kcal' }]}
        isMinimum={false}
        minimumBadgeLabel="mindestens"
        minimumNoteLabel="Hinweis"
        sourceLabel="Quelle: CH-NWD V7.1"
        reviewSourcesHeading="Rezept-Quellen"
        reviewSources={[
          'https://user:secret@evil.example/phish',
          'https://onlyuser@evil.example/phish2',
          'http://insecure.example/a',
          `${'javascript'}:alert(1)`,
          'https://www.bbc.co.uk/food/recipes/baked_salmon_00289',
        ]}
      />,
    );

    const sourcesBox = screen.getByTestId('recipe-sources');
    const links = within(sourcesBox).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute(
      'href',
      'https://www.bbc.co.uk/food/recipes/baked_salmon_00289',
    );
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
    expect(sourcesBox.textContent).not.toContain('evil.example');
    expect(sourcesBox.textContent).not.toContain('secret');
  });

  it('F2: zeigt fehlenden Rezepttext und fehlende Lebensmittelnamen sichtbar statt still auf Englisch zurückzufallen', async () => {
    const storage = createMemoryStorage();
    const frMeta = {
      ...LANGUAGES_REGISTRY.meta.fr!,
      active: true,
      legalApproved: true,
    };
    const frRegistry: LanguagesRegistry = {
      ...LANGUAGES_REGISTRY,
      meta: {
        ...LANGUAGES_REGISTRY.meta,
        fr: frMeta,
      },
    };
    const frInstance = createI18nInstance({
      initialLang: 'fr',
      registry: frRegistry,
    });

    render(
      <I18nextProvider i18n={frInstance}>
        <I18nContext.Provider
          value={{
            lang: 'fr',
            meta: frMeta,
            locale: frMeta.locale,
            detected: { code: 'fr', device: 'fr-CH', matched: true },
            uiLanguages: frRegistry.ui,
            isApproved: (c) => c === 'fr',
            metaFor: (c) => frRegistry.meta[c],
            setLang: () => false,
            fmtNumber: (v, d) => fmtNumber(v, 'fr-CH', d),
            fmtAmount: (v, u) => fmtAmount(v, u, 'fr-CH'),
            fmtDate: (d) => d.toISOString(),
          }}
        >
          <SecondLangProvider>
            <ShoppingProvider repository={storage.shopping}>
              <RatingsProvider repository={storage.ratings}>
                <MemoryRouter initialEntries={['/rezept/oven_salmon']}>
                  <Routes>
                    <Route path="/rezept/:id" element={<RecipeDetailPage />} />
                  </Routes>
                </MemoryRouter>
              </RatingsProvider>
            </ShoppingProvider>
          </SecondLangProvider>
        </I18nContext.Provider>
      </I18nextProvider>,
    );

    // Lücke für fehlenden Rezepttext wird sichtbar ausgewiesen (kein stiller EN-Fallback)
    const missingBanner = await screen.findByTestId('missing-recipe-text');
    expect(missingBanner).toHaveTextContent('fr');
    expect(screen.queryByTestId('step-list')).toBeNull();
    expect(document.body.textContent).not.toContain('Baked salmon');
    expect(document.body.textContent).not.toContain('Preheat the oven');

    // Lücke für fehlende Lebensmittelnamen (Glossar fr existiert nicht) wird sichtbar markiert
    const missingPotato = screen.getByTestId('missing-food-potato-0');
    expect(missingPotato).toHaveTextContent('potato');
    expect(missingPotato).toHaveTextContent('Nom manquant');
    expect(document.body.textContent).not.toContain('Potatoes');
  });

  it('E8: zeigt lokale Rezeptbilder in Liste (lazy) und Detail (eager, 4:3) ohne Manifest-/Fotografenangaben in der UI', async () => {
    const storage = createMemoryStorage();
    window.location.hash = '#/rezepte';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    const list = await screen.findByTestId('recipe-list');
    const listImgs = list.querySelectorAll('img');
    expect(listImgs).toHaveLength(5);
    // Top-Karte: Vollbild 800x600, loading="lazy"
    expect(listImgs[0]).toHaveAttribute('loading', 'lazy');
    expect(listImgs[0]).toHaveAttribute('width', '800');
    expect(listImgs[0]).toHaveAttribute('height', '600');
    expect(listImgs[0]!.getAttribute('alt')!.length).toBeGreaterThan(3);
    // Kompakte Karten: Miniatur 400x300, loading="lazy"
    expect(listImgs[1]).toHaveAttribute('loading', 'lazy');
    expect(listImgs[1]).toHaveAttribute('width', '400');
    expect(listImgs[1]).toHaveAttribute('height', '300');
    // Kein Fotografenname und keine Pexels-URL in der UI
    expect(document.body.textContent).not.toContain('Pexels');
    expect(document.body.textContent).not.toContain('pexels.com');

    // Detailseite: Titelbild 800x600, loading="eager", alt = Rezepttitel
    const salmonCard = screen.getByTestId('recipe-card-oven_salmon');
    fireEvent.click(
      within(salmonCard).getAllByRole('button', { name: /Ofenlachs/i })[0]!,
    );
    const hero = await screen.findByTestId('recipe-detail-hero');
    const heroImg = hero.querySelector('img');
    expect(heroImg).not.toBeNull();
    expect(heroImg).toHaveAttribute('loading', 'eager');
    expect(heroImg).toHaveAttribute(
      'alt',
      'Ofenlachs mit Broccoli und Kartoffeln',
    );
    expect(heroImg).toHaveAttribute('width', '800');
    expect(heroImg).toHaveAttribute('height', '600');
    expect(document.body.textContent).not.toContain('Pexels');
  });

  it('E8: zeigt ohne Foto den neutralen Platzhalter (role="img", aria-label, Blatt-Icon) in Liste und Detail', () => {
    render(
      <div>
        <RecipeCard
          id={asRecipeId('platzhalter_rezept')}
          title="Ohne Foto"
          mealLabel="Mittagessen"
          cuisineLabel="Schweizerisch"
          kcalLabel="420 kcal"
          minutesLabel="15 Min."
          proteinLabel="30 g Protein"
          imageLabel="Rezeptbild"
          photo={null}
          openLabel="Rezept öffnen: Ohne Foto"
          featured
          tone="c2"
          rating={null}
          saved={false}
          ratingGroupLabel="Bewerten"
          starLabel={(n) => `${n} Sterne`}
          saveLabel="Merken"
          unsaveLabel="Entfernen"
          onOpen={() => {}}
          onRate={() => {}}
          onToggleSave={() => {}}
        />
        <RecipeHeader
          title="Ohne Foto"
          mealLabel="Mittagessen"
          cuisineLabel="Schweizerisch"
          kcalLabel="420 kcal"
          minutesLabel="15 Min."
          proteinLabel="30 g Protein"
          imageLabel="Rezeptbild"
          photo={null}
          tone="c3"
          rating={null}
          saved={false}
          ratingGroupLabel="Bewerten"
          starLabel={(n) => `${n} Sterne`}
          saveLabel="Merken"
          unsaveLabel="Entfernen"
          onRate={() => {}}
          onToggleSave={() => {}}
        />
      </div>,
    );

    const card = screen.getByTestId('recipe-card-platzhalter_rezept');
    expect(card.querySelector('img')).toBeNull();
    expect(within(card).getByRole('img', { name: 'Rezeptbild' })).toBeInTheDocument();
    expect(card.querySelector('.edo-rimg-ph')).not.toBeNull();

    const hero = screen.getByTestId('recipe-detail-hero');
    expect(hero.querySelector('img')).toBeNull();
    expect(hero).toHaveAttribute('role', 'img');
    expect(hero).toHaveAttribute('aria-label', 'Rezeptbild');
    expect(hero.className).toContain('edo-rimg-ph');
  });
});
