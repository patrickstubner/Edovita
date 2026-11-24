import { afterEach, describe, expect, it } from '@rstest/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { LANG_STORAGE_KEY } from '../i18n/index.ts';
import { createMemoryStorage } from '../storage/index.ts';
import { App } from './App.tsx';
import { THEME_STORAGE_KEY } from './theme.ts';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
});

describe('App Grundgerüst & Kompakter Sprachumschalter (E0 + E2 + v5.5)', () => {
  it('startet bei Gerätesprache de-CH auf Deutsch ohne volle Sprachliste auf der Startseite, rendert kompakten Umschalter und schaltet Hell/Dunkel um', () => {
    render(
      <App navigatorLanguages={['de-CH']} storage={createMemoryStorage()} />,
    );

    expect(
      screen.getByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('lang')).toBe('de-CH');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(screen.getByTestId('bottom-actions')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-eff')).toBe('light');

    // Ausführliche Sprachliste ist von der Startseite entfernt (v5.5)
    expect(screen.queryByTestId('lang-list')).toBeNull();
    expect(screen.queryByTestId('lang-detect-banner')).toBeNull();

    // Kompakter Umschalter sitzt oben rechts mit Kürzel DE
    const switcher = screen.getByTestId('lang-switch-btn');
    expect(switcher).toHaveAttribute('aria-haspopup', 'listbox');
    expect(switcher).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('lang-switch-code')).toHaveTextContent('DE');

    fireEvent.click(screen.getByRole('button', { name: 'Dunkel' }));
    expect(document.documentElement.getAttribute('data-eff')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    const logo = screen.getByRole('img', { name: 'Edovita' });
    expect(logo.getAttribute('src')).toBe(
      '/assets/edovita_logo_dark_transparent.svg',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hell' }));
    expect(document.documentElement.getAttribute('data-eff')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(logo.getAttribute('src')).toBe('/assets/edovita_logo.svg');
  });

  it('startet bei Gerätesprache pt-BR im Fallback Englisch; Dropdown zeigt nur freigegebene Sprachen und #/profil/sprache zeigt FR/IT/ES/JA/PT ausgegraut', async () => {
    render(
      <App navigatorLanguages={['pt-BR']} storage={createMemoryStorage()} />,
    );

    expect(
      screen.getByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('lang')).toBe('en-GB');
    expect(screen.getByTestId('lang-switch-code')).toHaveTextContent('EN');

    // Dropdown zeigt nur aktive & freigegebene Sprachen (de, en)
    fireEvent.click(screen.getByTestId('lang-switch-btn'));
    const menu = screen.getByRole('listbox', { name: 'Language' });
    const options = within(menu).getAllByRole('option');
    expect(options.map((el) => el.getAttribute('data-lang'))).toEqual([
      'de',
      'en',
    ]);

    // Ausführliche Sprachliste bleibt unter #/profil/sprache mit ausgegrauten Sprachen
    cleanup();
    window.location.hash = '#/profil/sprache';
    render(
      <App navigatorLanguages={['pt-BR']} storage={createMemoryStorage()} />,
    );

    expect(await screen.findByTestId('lang-detect-banner')).toHaveTextContent(
      'pt-BR',
    );
    for (const pending of ['fr', 'it', 'es', 'ja', 'pt']) {
      const row = document.querySelector(`[data-lang-pending="${pending}"]`);
      expect(row).not.toBeNull();
      expect(row?.getAttribute('aria-disabled')).toBe('true');
      expect(row?.tagName).toBe('DIV');
    }
  });

  it('wechselt Sprache DE -> EN über den kompakten Umschalter ohne Neustart, behält Zustand (J6) und synct Settings.uiLang (H1)', async () => {
    const storage = createMemoryStorage();
    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    // Zustand setzen (Dunkelmodus) vor Sprachwechsel
    fireEvent.click(screen.getByRole('button', { name: 'Dunkel' }));
    expect(document.documentElement.getAttribute('data-eff')).toBe('dark');

    // Sprachwechsel über den kompakten Umschalter auf Englisch ohne Neustart
    const switchBtn = screen.getByTestId('lang-switch-btn');
    fireEvent.click(switchBtn);
    const menu = screen.getByRole('listbox', { name: 'Sprache' });
    fireEvent.click(within(menu).getByRole('option', { name: /English/i }));

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('lang')).toBe('en-GB');
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(document.activeElement).toBe(switchBtn);
    await waitFor(async () => {
      expect((await storage.settings.get()).uiLang).toBe('en');
    });
    // Bestehende Einstellung (Dunkelmodus) bleibt unverändert erhalten
    expect(document.documentElement.getAttribute('data-eff')).toBe('dark');

    // Navigation zur Statusseite zeigt sofort englische Texte
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(
      await screen.findByRole('heading', { name: 'Overview' }),
    ).toBeInTheDocument();
  });

  it('navigiert per Hash-Router zur Statusseite und wieder zurück', async () => {
    render(
      <App navigatorLanguages={['de-CH']} storage={createMemoryStorage()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Weiter/i }));

    expect(
      await screen.findByRole('heading', { name: 'Übersicht' }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Zurück zur Startseite/i }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeInTheDocument();
  });

  it('stellt fake-indexeddb in der Testumgebung bereit', () => {
    expect(typeof indexedDB).toBe('object');
    expect(typeof indexedDB.open).toBe('function');
  });
});
