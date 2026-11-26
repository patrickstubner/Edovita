import { afterEach, describe, expect, it } from '@rstest/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from '../app/App.tsx';
import { getRecipe } from '../catalog/index.ts';
import { encodeShopImport } from '../domain/index.ts';
import { addRecipe } from '../shopping/index.ts';
import { createMemoryStorage } from '../storage/index.ts';

function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
});

describe('Paket E5 + E5b: Einkaufsliste v5.9 (ⓘ-Sheet, «Hab ich»-Sheet, Teilmenge, Hausmarken, Teilen & QR-Import)', () => {
  it('zeigt keine Rezept-Chips, bietet ⓘ-Herkunfts-Sheet (ohne Abhaken, mit Summe & Fokus-Rückkehr), «Hab ich»-Sheet mit Teilmenge und Katalog-Suche', async () => {
    const storage = createMemoryStorage();
    const salmon = getRecipe('oven_salmon')!;
    const lentil = getRecipe('lentil_curry')!;
    const combined = addRecipe(addRecipe([], salmon, 2), lentil, 2);
    await storage.shopping.replaceAll(combined);
    window.location.hash = '#/einkauf';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(
      await screen.findByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeInTheDocument();

    // 1) Keine Rezept-Chips mehr in der Einkaufsliste (v5.9)
    expect(screen.queryByTestId('shop-recipe-chips')).toBeNull();

    // Artikel in Gruppen: Kartoffeln, Broccoli, Knoblauch (4 Stk. aus 2 Rezepten)
    const vegGroup = await screen.findByTestId('shop-group-veg');
    expect(vegGroup).toHaveTextContent('Kartoffeln');
    expect(vegGroup).toHaveTextContent('500 g');
    expect(vegGroup).toHaveTextContent('4 Stk.');

    // 2) ⓘ-Knopf auf Knoblauch: löst KEIN Abhaken aus, zeigt beide Gerichte + Summe, Escape gibt Fokus zurück
    const garlicSrcBtn = screen.getByTestId('shop-src-garlic__pc');
    const garlicToggleBtn = screen.getByTestId('shop-toggle-garlic__pc');
    expect(garlicToggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(garlicSrcBtn).toHaveAttribute('aria-haspopup', 'dialog');
    expect(garlicSrcBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(garlicSrcBtn);
    expect(garlicToggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(garlicSrcBtn).toHaveAttribute('aria-expanded', 'true');

    const srcSheet = await screen.findByTestId('shop-src-sheet');
    expect(srcSheet).toHaveAttribute('role', 'dialog');
    expect(srcSheet).toHaveAttribute('aria-modal', 'true');
    expect(within(srcSheet).getByRole('heading', { name: /Knoblauch/ })).toBeInTheDocument();
    const srcItems = srcSheet.querySelectorAll('.edo-shop-src-item');
    expect(srcItems).toHaveLength(2);
    expect(srcItems[0]).toHaveTextContent('Ofenlachs mit Broccoli und Kartoffeln');
    expect(srcItems[0]).toHaveTextContent('2 Stk.');
    expect(srcItems[1]).toHaveTextContent('Linsen-Curry mit Kokosmilch und Spinat');
    expect(srcItems[1]).toHaveTextContent('2 Stk.');
    expect(screen.getByTestId('shop-src-sum')).toHaveTextContent('Summe: 4 Stk.');

    // Escape schliesst Sheet und gibt Fokus ans ⓘ zurück
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('shop-src-sheet')).toBeNull();
    expect(document.activeElement).toBe(garlicSrcBtn);

    // 3) Antippen -> liegt im Korb; im Korb gibt es KEINEN «Hab ich»-Knopf
    fireEvent.click(screen.getByTestId('shop-toggle-potato__g'));
    const cartSec = await screen.findByTestId('shop-section-cart');
    expect(within(cartSec).getByTestId('shop-row-potato__g')).toHaveAttribute(
      'data-state',
      'cart',
    );
    expect(screen.queryByTestId('shop-have-potato__g')).toBeNull();

    // 4) «Hab ich» auf Broccoli (400 g) öffnet Sheet mit vorausgewähltem «Alles vorhanden»
    const brocHaveBtn = screen.getByTestId('shop-have-broccoli__g');
    fireEvent.click(brocHaveBtn);
    const haveSheet = await screen.findByTestId('shop-have-sheet');
    expect(haveSheet).toHaveAttribute('role', 'dialog');
    expect(screen.getByTestId('shop-have-all')).toHaveAttribute('aria-checked', 'true');

    // Verwerfen mit Escape ändert nichts
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('shop-have-sheet')).toBeNull();
    expect(screen.getByTestId('shop-row-broccoli__g')).toHaveAttribute('data-state', 'open');
    expect(document.activeElement).toBe(brocHaveBtn);

    // Erneut öffnen -> Teilmenge 150 g per Schieber einstellen -> «Übernehmen»
    fireEvent.click(brocHaveBtn);
    await screen.findByTestId('shop-have-sheet');
    fireEvent.change(screen.getByTestId('shop-have-range'), {
      target: { value: '150' },
    });
    expect(screen.getByTestId('shop-have-all')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('shop-have-out')).toHaveTextContent('150 g');
    fireEvent.click(screen.getByTestId('shop-have-apply'));

    // Teilmenge bleibt offen: Kaufmenge 250 g, Bedarf 400 g durchgestrichen, Screenreader-Label, oranger «Teilweise»-Knopf
    await waitFor(() => {
      const brocRow = screen.getByTestId('shop-row-broccoli__g');
      expect(brocRow).toHaveAttribute('data-state', 'open');
      expect(brocRow).toHaveAttribute('data-partial', 'true');
    });
    const brocQty = screen.getByTestId('shop-qty-broccoli__g');
    expect(brocQty).toHaveAttribute('aria-label', 'kaufen 250 g von 400 g');
    expect(brocQty).toHaveTextContent('250 g');
    expect(brocQty).toHaveTextContent('400 g');
    expect(
      screen.getByTestId('shop-toggle-broccoli__g').getAttribute('aria-label'),
    ).toContain('kaufen 250 g von 400 g');
    const partialBtn = screen.getByTestId('shop-have-broccoli__g');
    expect(partialBtn).toHaveTextContent('Teilweise');
    expect(partialBtn).toHaveClass('edo-havebtn-partial');

    // «Teilweise» erneut öffnen -> «Alles vorhanden» aktivieren -> «Übernehmen» -> «Schon zu Hause»
    fireEvent.click(partialBtn);
    await screen.findByTestId('shop-have-sheet');
    fireEvent.click(screen.getByTestId('shop-have-all'));
    expect(screen.getByTestId('shop-have-all')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByTestId('shop-have-apply'));

    const homeSec = await screen.findByTestId('shop-section-home');
    expect(within(homeSec).getByTestId('shop-row-broccoli__g')).toHaveAttribute(
      'data-state',
      'home',
    );

    // «Doch kaufen» in «Schon zu Hause» öffnet dasselbe Sheet -> «Zurücksetzen» holt Artikel zurück in die offene Liste
    const homeHaveBtn = within(homeSec).getByTestId('shop-have-broccoli__g');
    expect(homeHaveBtn).toHaveTextContent('Doch kaufen');
    fireEvent.click(homeHaveBtn);
    await screen.findByTestId('shop-have-sheet');
    fireEvent.click(screen.getByTestId('shop-have-reset'));

    await waitFor(() => {
      expect(screen.getByTestId('shop-row-broccoli__g')).toHaveAttribute(
        'data-state',
        'open',
      );
      expect(screen.getByTestId('shop-have-broccoli__g')).toHaveTextContent('Hab ich');
    });

    // 5) Katalog-Suche (bewusste Ergänzung): Haferflocken manuell hinzufügen -> KEIN ⓘ-Knopf, aber «Hab ich» mit Teilmenge
    fireEvent.change(screen.getByTestId('catalog-search-input'), {
      target: { value: 'Hafer' },
    });
    fireEvent.click(await screen.findByTestId('catalog-add-oats'));
    const oatsRow = await screen.findByTestId('shop-row-oats__g');
    expect(oatsRow).toHaveTextContent('Haferflocken');
    expect(screen.queryByTestId('shop-src-oats__g')).toBeNull();

    fireEvent.click(screen.getByTestId('shop-have-oats__g'));
    await screen.findByTestId('shop-have-sheet');
    fireEvent.change(screen.getByTestId('shop-have-range'), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByTestId('shop-have-apply'));
    await waitFor(() => {
      expect(screen.getByTestId('shop-have-oats__g')).toHaveTextContent('Teilweise');
      expect(screen.getByTestId('shop-qty-oats__g')).toHaveAttribute(
        'aria-label',
        'kaufen 100 g von 200 g',
      );
    });

    // 6) Hausmarken-Info-Dialog oben
    fireEvent.click(screen.getByTestId('brands-info-btn'));
    const brandsSheet = await screen.findByTestId('brands-sheet');
    expect(brandsSheet).toHaveTextContent('Migros');
    expect(brandsSheet).toHaveTextContent('Coop');
    fireEvent.click(screen.getByTestId('brands-sheet-close'));
    expect(screen.queryByTestId('brands-sheet')).toBeNull();

    // 7) QR-Einkaufsliste-Dialog mit lokalem React-SVG (kein innerHTML)
    fireEvent.click(screen.getByTestId('shop-qr-btn'));
    const qrSheet = await screen.findByTestId('qr-sheet');
    const qrSvg = qrSheet.querySelector('svg.edo-qr-svg');
    expect(qrSvg).not.toBeNull();
    expect(qrSvg?.querySelector('path')?.getAttribute('d')).toContain('M');
    fireEvent.click(screen.getByTestId('qr-sheet-close'));
    expect(screen.queryByTestId('qr-sheet')).toBeNull();
  });

  it('J7: lehnt bösartige QR-Fragmente (41 Items, <script>, ungültiger st) ab und zeigt Bestätigungsdialog für gültiges Fragment', async () => {
    const storage = createMemoryStorage();

    // 1) Bösartiges Fragment mit <script> im Namen -> abgelehnt, nichts übernommen
    const xssFrag = `#/einkauf#import=${toBase64Url(
      JSON.stringify({
        v: 1,
        items: [{ id: 'milk', n: '<script>alert(1)</script>', st: 'open' }],
      }),
    )}`;
    window.location.hash = xssFrag;

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    const errBanner = await screen.findByTestId('qr-import-error');
    expect(errBanner).toHaveTextContent('name');
    expect(screen.queryByTestId('qr-import-dialog')).toBeNull();
    expect(await storage.shopping.list()).toHaveLength(0);

    cleanup();

    // 2) Gültiges Fragment -> zeigt Bestätigungsdialog mit Vorschau; Übernehmen fügt Artikel hinzu
    const validFrag = encodeShopImport([
      { id: 'broccoli', name: 'Broccoli', st: 'open', amount: 300, unit: 'g' },
      { id: 'apple', name: 'Äpfel', st: 'home' },
    ]);
    window.location.hash = validFrag;

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    const dialog = await screen.findByTestId('qr-import-dialog');
    expect(dialog).toHaveTextContent('2 Artikel übernehmen?');
    expect(screen.getByTestId('qr-import-preview')).toHaveTextContent(
      'Broccoli',
    );
    expect(screen.getByTestId('qr-import-preview')).toHaveTextContent('Äpfel');

    // Noch NICHT übernommen vor Klick
    expect(await storage.shopping.list()).toHaveLength(0);

    // Bestätigen («Ergänzen»)
    fireEvent.click(screen.getByTestId('qr-import-merge'));
    expect(await screen.findByTestId('shop-row-broccoli__g')).toBeInTheDocument();
    expect(await screen.findByTestId('shop-section-home')).toHaveTextContent(
      'Äpfel',
    );
    expect(await storage.shopping.list()).toHaveLength(2);
  });

  it('teilt über Web Share API ausschliesslich Artikelnamen, Mengen und Zustände (nie G-Daten und nie qtyHave)', async () => {
    const storage = createMemoryStorage();
    const salmon = getRecipe('oven_salmon')!;
    const initial = addRecipe([], salmon, 2).map((it) =>
      it.id === 'potato__g' ? { ...it, qtyHave: 200 } : it,
    );
    await storage.shopping.replaceAll(initial);
    window.location.hash = '#/einkauf';

    const sharedPayloads: ShareData[] = [];
    const originalShare = navigator.share;
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        sharedPayloads.push(data);
      },
    });

    try {
      render(<App navigatorLanguages={['de-CH']} storage={storage} />);
      expect(await screen.findByTestId('shop-group-veg')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('shop-share-btn'));
      expect(await screen.findByRole('status')).toHaveTextContent('geteilt');

      expect(sharedPayloads).toHaveLength(1);
      const text = sharedPayloads[0]?.text ?? '';
      expect(text).toContain('Kartoffeln');
      expect(text).toContain('500 g');
      expect(text).toContain('[Offen]');
      expect(text).not.toContain('qtyHave');
      expect(text).not.toContain('200 g');
      expect(text).not.toMatch(/BMI|kcal|Gewicht|Geburtsdatum|Profil/i);
    } finally {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: originalShare,
      });
    }
  });

  it('E11: zeigt zweisprachigen Plan-Untertitel #shopSub, Plan-Slot im ⓘ-Sheet und verwirft unbekannte QR-Import-IDs', async () => {
    const storage = createMemoryStorage();
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const salmon = getRecipe('oven_salmon')!;
    await storage.plan.set({
      days: 5,
      items: [
        {
          id: 'p1',
          date: iso,
          slot: 'dinner',
          recipeId: salmon.id,
          portions: 2,
        },
      ],
    });
    const planItems = addRecipe([], salmon, 2).map((it) => ({
      ...it,
      qtyPlan: it.amount ?? 0,
      qtyExtra: 0,
      recipesPlan: [salmon.id],
      recipesExtra: [],
    }));
    await storage.shopping.replaceAll(planItems);
    await storage.settings.set({
      uiLang: 'de',
      secondLang: 'pt',
      theme: 'light',
      sound: true,
      hymn: 'H1',
    });

    // 1) Zweisprachiger Plan-Untertitel #shopSub (DE + PT) und ⓘ-Sheet mit Plan-Slot
    window.location.hash = '#/einkauf';
    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    const shopSub = await screen.findByTestId('shop-sub');
    expect(shopSub).toHaveTextContent('Aus dem Plan für 5 Tage erstellt');
    expect(shopSub).toHaveTextContent('Criada a partir do plano de 5 dias');

    fireEvent.click(screen.getByTestId('shop-src-potato__g'));
    const sheet = await screen.findByTestId('shop-src-sheet');
    expect(sheet).toHaveTextContent('Abend · 500 g');
    expect(sheet).toHaveTextContent('Summe: 500 g');
    expect(sheet).toHaveTextContent('Total: 500 g');

    cleanup();

    // 2) Unbekannte QR-IDs werden über resolveQrImportItems verworfen und nicht im Dialog gezeigt
    const unknownOnlyFrag = encodeShopImport([
      { id: 'unbekannt_123', name: 'Geisterartikel', st: 'open' },
    ]);
    window.location.hash = unknownOnlyFrag;
    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(await screen.findByTestId('qr-import-error')).toBeInTheDocument();
    expect(screen.queryByTestId('qr-import-dialog')).toBeNull();
  });
});
