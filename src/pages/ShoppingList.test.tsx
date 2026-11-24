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

describe('Paket E5: Einkaufsliste, drei Zustände, Hausmarken, Teilen & QR-Import (Issue #11)', () => {
  it('zeigt drei Zustände (offen / im Korb / schon zu Hause), Rückgängig, Katalog-Suche, Hausmarken und QR-Sheet', async () => {
    const storage = createMemoryStorage();
    const salmon = getRecipe('oven_salmon')!;
    await storage.shopping.replaceAll(addRecipe([], salmon, 2));
    window.location.hash = '#/einkauf';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(
      await screen.findByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeInTheDocument();

    // Artikel in Gruppen: Kartoffeln & Broccoli unter veg
    const vegGroup = await screen.findByTestId('shop-group-veg');
    expect(vegGroup).toHaveTextContent('Kartoffeln');
    expect(vegGroup).toHaveTextContent('500 g');

    // 1) Antippen -> liegt im Korb
    fireEvent.click(screen.getByTestId('shop-toggle-potato__g'));
    const cartSec = await screen.findByTestId('shop-section-cart');
    expect(within(cartSec).getByTestId('shop-row-potato__g')).toHaveAttribute(
      'data-state',
      'cart',
    );

    // 2) «Hab ich» -> wandert nach «Schon zu Hause» + Toast mit Rückgängig
    fireEvent.click(screen.getByTestId('shop-have-broccoli__g'));
    const homeSec = await screen.findByTestId('shop-section-home');
    expect(within(homeSec).getByTestId('shop-row-broccoli__g')).toHaveAttribute(
      'data-state',
      'home',
    );
    const undoBtn = await screen.findByTestId('toast-undo');
    fireEvent.click(undoBtn);
    await waitFor(() => {
      expect(screen.getByTestId('shop-row-broccoli__g')).toHaveAttribute(
        'data-state',
        'open',
      );
    });

    // 3) Katalog-Suche: Haferflocken manuell hinzufügen
    fireEvent.change(screen.getByTestId('catalog-search-input'), {
      target: { value: 'Hafer' },
    });
    fireEvent.click(await screen.findByTestId('catalog-add-oats'));
    expect(await screen.findByTestId('shop-row-oats__manual')).toHaveTextContent(
      'Haferflocken',
    );

    // 4) Hausmarken-Info-Dialog oben
    fireEvent.click(screen.getByTestId('brands-info-btn'));
    const brandsSheet = await screen.findByTestId('brands-sheet');
    expect(brandsSheet).toHaveTextContent('Migros');
    expect(brandsSheet).toHaveTextContent('Coop');
    fireEvent.click(screen.getByTestId('brands-sheet-close'));
    expect(screen.queryByTestId('brands-sheet')).toBeNull();

    // 5) QR-Einkaufsliste-Dialog mit lokalem React-SVG (kein innerHTML)
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

  it('teilt über Web Share API ausschliesslich Artikelnamen, Mengen und Zustände (nie G-Daten)', async () => {
    const storage = createMemoryStorage();
    const salmon = getRecipe('oven_salmon')!;
    await storage.shopping.replaceAll(addRecipe([], salmon, 2));
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
      expect(text).not.toMatch(/BMI|kcal|Gewicht|Geburtsdatum|Profil/i);
    } finally {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: originalShare,
      });
    }
  });
});
