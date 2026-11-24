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
});
