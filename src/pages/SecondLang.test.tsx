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
import { BilingualText } from '../components/index.ts';
import type { LanguagesRegistry } from '../domain/index.ts';
import {
  LANGUAGES_REGISTRY,
  PSEUDO_RTL_LANG,
  SECOND_LANG_STORAGE_KEY,
} from '../i18n/index.ts';
import { useSecondLang } from '../hooks/index.ts';
import { addRecipe } from '../shopping/index.ts';
import { createMemoryStorage } from '../storage/index.ts';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
});

describe('Paket E6: Zweitsprache für Lebensmittel, Kopfzeilen-Umschalter, Bidi & Profil (Issue #12)', () => {
  it('nutzt Orts-Standard ohne Speicherung (America/Sao_Paulo + DE -> PT), speichert manuelle Wahl und unterstützt zweizeilige Einkaufsliste & Rezept-Detail', async () => {
    const storage = createMemoryStorage();
    const salmon = getRecipe('oven_salmon')!;
    await storage.shopping.replaceAll(addRecipe([], salmon, 2));
    window.location.hash = '#/rezept/oven_salmon';

    render(
      <App
        navigatorLanguages={['de-CH']}
        timeZone="America/Sao_Paulo"
        storage={storage}
      />,
    );

    // 1) Automatischer Standard nach Ort (BR -> pt): Button zeigt PT, NICHT gespeichert
    expect(await screen.findByTestId('second-switch-code')).toHaveTextContent(
      'PT',
    );
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBeNull();
    expect(await storage.settings.getStored?.()).toBeNull();

    // Rezept-Detail: einzeilig "Broccoli · brócolis" mit <bdi lang="pt-BR" dir="ltr">
    const brocIng = await screen.findByTestId('ingredient-broccoli-1');
    expect(brocIng).toHaveTextContent('Broccoli');
    const bdi = brocIng.querySelector('bdi');
    expect(bdi).not.toBeNull();
    expect(bdi).toHaveTextContent('brócolis');
    expect(bdi).toHaveAttribute('lang', 'pt-BR');
    expect(bdi).toHaveAttribute('dir', 'ltr');

    // Schritte bleiben auf Deutsch mit Hinweis second.hint darunter
    expect(screen.getByTestId('second-lang-steps-hint')).toHaveTextContent(
      'Schritte und Menüs bleiben in der App-Sprache.',
    );

    // 2) Nur ein Menü gleichzeitig offen (Zweitsprache <-> Hauptsprache)
    const secondBtn = screen.getByTestId('second-switch-btn');
    const langBtn = screen.getByTestId('lang-switch-btn');
    fireEvent.click(secondBtn);
    expect(screen.getByTestId('second-switch-menu')).toBeVisible();
    expect(screen.getByTestId('lang-switch-menu')).not.toBeVisible();

    fireEvent.click(langBtn);
    expect(screen.getByTestId('lang-switch-menu')).toBeVisible();
    expect(screen.getByTestId('second-switch-menu')).not.toBeVisible();

    // 3) Manuelle Wahl JA im Kopfzeilen-Umschalter -> wird gespeichert
    fireEvent.click(secondBtn);
    const secondMenu = screen.getByTestId('second-switch-menu');
    // Aktuelle UI-Sprache (de) ist nicht als Option gelistet
    expect(secondMenu.querySelector('[data-second="de"]')).toBeNull();
    fireEvent.click(secondMenu.querySelector('[data-second="ja"]')!);

    await waitFor(() => {
      expect(screen.getByTestId('second-switch-code')).toHaveTextContent('JA');
    });
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBe('ja');
    const saved = await storage.settings.get();
    expect(saved.secondLang).toBe('ja');
    expect(saved.uiLang).toBe('de');
    expect(brocIng).toHaveTextContent('Broccoli');
    expect(brocIng.querySelector('bdi')).toHaveTextContent('ブロッコリー');
    expect(brocIng.querySelector('bdi')).toHaveAttribute('lang', 'ja-JP');

    // 4) Einkaufsliste: zweizeilig (Zeile 1 Name, Zeile 2 Zweitname + Menge), KEIN Chip
    fireEvent.click(screen.getByTestId('detail-open-shopping-btn'));
    const brocRow = await screen.findByTestId('shop-row-broccoli__g');
    expect(brocRow.querySelector('[data-bilingual="two-line"]')).not.toBeNull();
    expect(brocRow.querySelector('bdi')).toHaveTextContent('ブロッコリー');
    expect(screen.queryByTestId('second-lang-chip')).toBeNull();

    // 5) «Keine» wählen -> einzeilige Einkaufsliste, Button zeigt "—"
    fireEvent.click(screen.getByTestId('second-switch-btn'));
    fireEvent.click(
      screen
        .getByTestId('second-switch-menu')
        .querySelector('[data-second="none"]')!,
    );
    await waitFor(() => {
      expect(screen.getByTestId('second-switch-code')).toHaveTextContent('—');
    });
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBe('none');
    expect(
      screen
        .getByTestId('shop-row-broccoli__g')
        .querySelector('[data-bilingual="one-line"]'),
    ).not.toBeNull();
    expect(screen.getByTestId('shop-row-broccoli__g').querySelector('bdi')).toBeNull();
  });

  it('blendet Zweitsprache aus, wenn UI-Sprache auf dieselbe Sprache wechselt, und erlaubt Auswahl unter #/profil/sprache', async () => {
    const storage = createMemoryStorage();
    window.location.hash = '#/profil/sprache';

    render(
      <App
        navigatorLanguages={['de-CH']}
        timeZone="Europe/Zurich"
        storage={storage}
      />,
    );

    // Profil > Sprache zeigt Abschnitt Zweitsprache
    const secList = await screen.findByTestId('second-lang-list');
    expect(within(secList).getByText(/Automatisch \(Ort\) · EN/)).toBeInTheDocument();

    // Manuell EN als Zweitsprache wählen
    fireEvent.click(secList.querySelector('[data-second="en"]')!);
    await waitFor(() => {
      expect(screen.getByTestId('second-switch-code')).toHaveTextContent('EN');
    });

    // UI-Sprache von DE auf EN wechseln -> Zweitsprache EN wird sofort ausgeblendet ("—")
    fireEvent.click(
      screen.getByTestId('lang-list').querySelector('[data-lang="en"]')!,
    );
    await waitFor(() => {
      expect(screen.getByTestId('lang-switch-code')).toHaveTextContent('EN');
      expect(screen.getByTestId('second-switch-code')).toHaveTextContent('—');
    });
  });

  it('unterstützt neue Zweitsprache xx ohne Codeänderung und zeigt bei fehlendem Glossareintrag nur den App-Namen', async () => {
    const storage = createMemoryStorage();
    const extendedRegistry: LanguagesRegistry = {
      ...LANGUAGES_REGISTRY,
      secondary: [...LANGUAGES_REGISTRY.secondary, 'xx'],
      meta: {
        ...LANGUAGES_REGISTRY.meta,
        xx: {
          code: 'xx',
          name: 'Testisch',
          locale: 'xx',
          dir: 'ltr',
          active: true,
          legalApproved: false,
          reviewed: false,
        },
      },
    };
    const customGlossaries = {
      xx: {
        broccoli: 'Brok-XX',
        // potato bewusst weggelassen -> darf KEINEN englischen Ersatz zeigen!
      },
    };

    window.location.hash = '#/rezept/oven_salmon';
    render(
      <App
        navigatorLanguages={['de-CH']}
        timeZone="Europe/Zurich"
        secondLangRegistry={extendedRegistry}
        secondLangGlossaries={customGlossaries}
        storage={storage}
      />,
    );

    fireEvent.click(await screen.findByTestId('second-switch-btn'));
    const xxOpt = screen
      .getByTestId('second-switch-menu')
      .querySelector('[data-second="xx"]');
    expect(xxOpt).not.toBeNull();
    fireEvent.click(xxOpt!);

    await waitFor(() => {
      expect(screen.getByTestId('second-switch-code')).toHaveTextContent('XX');
    });

    // Broccoli hat Eintrag in xx -> zeigt Brok-XX
    const brocIng = screen.getByTestId('ingredient-broccoli-1');
    expect(brocIng.querySelector('bdi')).toHaveTextContent('Brok-XX');

    // Kartoffeln hat KEINEN Eintrag in xx -> nur App-Name, kein <bdi>, kein EN-Ersatz
    const potIng = screen.getByTestId('ingredient-potato-0');
    expect(potIng).toHaveTextContent('Kartoffeln');
    expect(potIng.querySelector('bdi')).toBeNull();
    expect(potIng).not.toHaveTextContent('potatoes');
  });

  it('rendert Pseudo-RTL ar-XB isoliert mit <bdi lang="ar-XB" dir="rtl"> im Testmodus', async () => {
    const storage = createMemoryStorage();
    window.location.hash = '#/rezept/oven_salmon';

    render(
      <App
        navigatorLanguages={['de-CH']}
        timeZone="Europe/Zurich"
        enablePseudoRtl
        storage={storage}
      />,
    );

    fireEvent.click(await screen.findByTestId('second-switch-btn'));
    const rtlOpt = screen
      .getByTestId('second-switch-menu')
      .querySelector(`[data-second="${PSEUDO_RTL_LANG}"]`);
    expect(rtlOpt).not.toBeNull();
    fireEvent.click(rtlOpt!);

    const brocIng = await screen.findByTestId('ingredient-broccoli-1');
    await waitFor(() => {
      const bdi = brocIng.querySelector('bdi');
      expect(bdi).not.toBeNull();
      expect(bdi).toHaveAttribute('lang', 'ar-XB');
      expect(bdi).toHaveAttribute('dir', 'rtl');
      expect(bdi).toHaveTextContent('بروكلي');
    });
  });

  it('lehnt Wahl gleich der UI-Sprache mit "same" ab, ohne den Zustand zu verändern', async () => {
    const { I18nProvider } = await import('../app/I18nProvider.tsx');
    const { SecondLangProvider } = await import('../app/SecondLangProvider.tsx');
    const { SettingsProvider } = await import('../app/SettingsProvider.tsx');
    const storage = createMemoryStorage();
    const outcomes: string[] = [];

    function Probe() {
      const { effective, setSecondLang } = useSecondLang();
      return (
        <div>
          <span data-testid="probe-eff">{effective ?? 'none'}</span>
          <button
            type="button"
            data-testid="probe-pick-de"
            onClick={() => outcomes.push(setSecondLang('de'))}
          >
            DE
          </button>
        </div>
      );
    }

    render(
      <SettingsProvider repository={storage.settings}>
        <I18nProvider initialLang="de">
          <SecondLangProvider timeZone="America/Sao_Paulo">
            <Probe />
          </SecondLangProvider>
        </I18nProvider>
      </SettingsProvider>,
    );

    expect(screen.getByTestId('probe-eff')).toHaveTextContent('pt');
    fireEvent.click(screen.getByTestId('probe-pick-de'));
    expect(outcomes).toEqual(['same']);
    expect(screen.getByTestId('probe-eff')).toHaveTextContent('pt');
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBeNull();
  });

  it('BilingualText rendert Haupttext + <bdi lang dir> und lässt <bdi> ohne Zweittext weg (E6b)', () => {
    const { rerender } = render(
      <p data-testid="bt-host">
        <BilingualText
          main="Im Korb"
          suffix=" (2)"
          secondary="No carrinho"
          secondaryLang="pt-BR"
          secondaryDir="ltr"
        />
      </p>,
    );
    const host = screen.getByTestId('bt-host');
    expect(host).toHaveTextContent('Im Korb (2)');
    const bdi = host.querySelector('bdi');
    expect(bdi).not.toBeNull();
    expect(bdi).toHaveTextContent('No carrinho');
    expect(bdi).toHaveAttribute('lang', 'pt-BR');
    expect(bdi).toHaveAttribute('dir', 'ltr');

    rerender(
      <p data-testid="bt-host">
        <BilingualText main="Im Korb" suffix=" (2)" secondary="" />
      </p>,
    );
    expect(host.querySelector('bdi')).toBeNull();
  });

  it('E6b: Einkaufsliste zeigt Titel, Gruppen, Abschnitte und beide Sheets zweisprachig in PT (ohne EN-Ersatz bei Rezepttitel), Zeilen-Knopf einsprachig, und schaltet auf «Keine» einzeilig zurück', async () => {
    const storage = createMemoryStorage();
    const salmon = getRecipe('oven_salmon')!;
    await storage.shopping.replaceAll(addRecipe([], salmon, 2));
    window.location.hash = '#/einkauf';

    render(
      <App
        navigatorLanguages={['de-CH']}
        timeZone="America/Sao_Paulo"
        storage={storage}
      />,
    );

    // 1) Seitentitel zweisprachig (PT)
    const titleSec = await screen.findByTestId('shop-title-sec');
    const titleBdi = titleSec.querySelector('bdi');
    expect(titleBdi).toHaveTextContent('Lista de compras');
    expect(titleBdi).toHaveAttribute('lang', 'pt-BR');
    expect(titleBdi).toHaveAttribute('dir', 'ltr');

    // 2) Gruppenüberschrift zweisprachig, Anzahl nur einmal
    const vegGroup = screen.getByTestId('shop-group-veg');
    const vegHead = vegGroup.querySelector('.edo-grph')!;
    expect(vegHead.querySelector('.edo-i18n-main')).toHaveTextContent(
      'Gemüse und Früchte (3)',
    );
    expect(vegHead.querySelector('bdi')).toHaveTextContent('Frutas e verduras');
    expect(vegHead.querySelector('bdi')!.textContent).not.toContain('(3)');

    // 3) Zeilen-Knopf «Hab ich» bleibt einsprachig (wie Prototyp)
    const haveBtn = screen.getByTestId('shop-have-broccoli__g');
    expect(haveBtn).toHaveTextContent('Hab ich');
    expect(haveBtn.querySelector('bdi')).toBeNull();

    // 4) Korb-Abschnitt zweisprachig mit einmaliger Anzahl
    fireEvent.click(screen.getByTestId('shop-toggle-potato__g'));
    const cartSec = await screen.findByTestId('shop-section-cart');
    const cartHead = cartSec.querySelector('.edo-grph')!;
    expect(cartHead.querySelector('.edo-i18n-main')).toHaveTextContent(
      'Im Korb (1)',
    );
    expect(cartHead.querySelector('bdi')).toHaveTextContent('No carrinho');

    // 5) Herkunfts-Sheet: Titel gestapelt zweizeilig, Rezepttitel OHNE PT-Übersetzung nur Haupttitel (kein EN-Ersatz!), Summe zweisprachig
    fireEvent.click(screen.getByTestId('shop-src-broccoli__g'));
    const srcSheet = await screen.findByTestId('shop-src-sheet');
    const srcTitleBdi = srcSheet.querySelector('#edo-shop-src-title bdi');
    expect(srcTitleBdi).toHaveTextContent('brócolis');
    expect(srcTitleBdi).toHaveAttribute('lang', 'pt-BR');
    const srcNameEl = srcSheet.querySelector('.edo-shop-src-name')!;
    expect(srcNameEl).toHaveTextContent('Ofenlachs mit Broccoli und Kartoffeln');
    expect(srcNameEl.querySelector('bdi')).toBeNull();
    expect(srcSheet).not.toHaveTextContent('Oven-baked salmon');
    const srcSum = within(srcSheet).getByTestId('shop-src-sum');
    expect(srcSum).toHaveTextContent('Summe: 400 g');
    expect(srcSum.querySelector('bdi')).toHaveTextContent('Total: 400 g');
    fireEvent.click(screen.getByTestId('shop-src-close'));

    // 6) «Hab ich»-Sheet: Titel, Hinweis, Alles vorhanden, Davon schon zu Hause, Zurücksetzen, Übernehmen zweisprachig
    fireEvent.click(screen.getByTestId('shop-have-broccoli__g'));
    const haveSheet = await screen.findByTestId('shop-have-sheet');
    expect(haveSheet.querySelector('#edo-shop-have-title bdi')).toHaveTextContent(
      'brócolis',
    );
    expect(within(haveSheet).getByTestId('shop-have-hint').querySelector('bdi')).toHaveTextContent(
      'Já em casa?',
    );
    expect(within(haveSheet).getByTestId('shop-have-all').querySelector('bdi')).toHaveTextContent(
      'Tudo em casa',
    );
    expect(within(haveSheet).getByTestId('shop-have-amt').querySelector('bdi')).toHaveTextContent(
      'Já em casa: 400 g',
    );
    expect(within(haveSheet).getByTestId('shop-have-reset').querySelector('bdi')).toHaveTextContent(
      'Redefinir',
    );
    expect(within(haveSheet).getByTestId('shop-have-apply').querySelector('bdi')).toHaveTextContent(
      'Aplicar',
    );
    fireEvent.click(screen.getByTestId('shop-have-apply'));

    // Abschnitt «Schon zu Hause» zweisprachig mit einmaliger Anzahl
    const homeSec = await screen.findByTestId('shop-section-home');
    expect(homeSec.querySelector('.edo-grph bdi')).toHaveTextContent(
      'Já tenho em casa',
    );

    // 7) Wechsel auf EN: Herkunfts-Sheet zeigt nun den vorhandenen englischen Rezepttitel als zweite Zeile
    fireEvent.click(screen.getByTestId('second-switch-btn'));
    fireEvent.click(
      screen.getByTestId('second-switch-menu').querySelector('[data-second="en"]')!,
    );
    await waitFor(() => {
      expect(screen.getByTestId('shop-title-sec')).toHaveTextContent(
        'Shopping list',
      );
    });
    fireEvent.click(screen.getByTestId('shop-src-broccoli__g'));
    const srcSheetEn = await screen.findByTestId('shop-src-sheet');
    const enRecipeBdi = srcSheetEn.querySelector('.edo-shop-src-name bdi');
    expect(enRecipeBdi).not.toBeNull();
    expect(enRecipeBdi).toHaveTextContent(
      'Oven-baked salmon with broccoli and potatoes',
    );
    expect(enRecipeBdi).toHaveAttribute('lang', 'en-GB');
    fireEvent.click(screen.getByTestId('shop-src-close'));

    // 8) Wechsel auf «Keine»: alles wieder einsprachig ohne <bdi>
    fireEvent.click(screen.getByTestId('second-switch-btn'));
    fireEvent.click(
      screen.getByTestId('second-switch-menu').querySelector('[data-second="none"]')!,
    );
    await waitFor(() => {
      expect(screen.queryByTestId('shop-title-sec')).toBeNull();
    });
    expect(screen.getByTestId('shop-group-veg').querySelector('bdi')).toBeNull();
    expect(screen.getByTestId('shop-section-home').querySelector('bdi')).toBeNull();
  });
});
