import { afterEach, describe, expect, it } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LANG_STORAGE_KEY } from '../i18n/index.ts';
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

describe('App Grundgerüst & Mehrsprachigkeit (E0 + E2)', () => {
  it('startet bei Gerätesprache de-CH auf Deutsch, rendert BottomActions und schaltet Hell/Dunkel um', () => {
    render(<App navigatorLanguages={['de-CH']} />);

    expect(
      screen.getByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('lang')).toBe('de-CH');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(screen.getByTestId('bottom-actions')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-eff')).toBe('light');

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

  it('startet bei Gerätesprache pt-BR im Fallback Englisch und zeigt FR/IT/ES/JA/PT ausgegraut (Rechts-Gate)', () => {
    render(<App navigatorLanguages={['pt-BR']} />);

    expect(
      screen.getByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('lang')).toBe('en-GB');
    expect(screen.getByTestId('lang-detect-banner')).toHaveTextContent('pt-BR');

    for (const pending of ['fr', 'it', 'es', 'ja', 'pt']) {
      const row = document.querySelector(`[data-lang-pending="${pending}"]`);
      expect(row).not.toBeNull();
      expect(row?.getAttribute('aria-disabled')).toBe('true');
      expect(row?.tagName).toBe('DIV');
    }
  });

  it('wechselt Sprache DE -> EN im laufenden Betrieb ohne Neustart und behält Zustand (Journey J6)', async () => {
    render(<App navigatorLanguages={['de-CH']} />);

    // Zustand setzen (Dunkelmodus) vor Sprachwechsel
    fireEvent.click(screen.getByRole('button', { name: 'Dunkel' }));
    expect(document.documentElement.getAttribute('data-eff')).toBe('dark');

    // Sprachwechsel auf Englisch ohne Neustart
    const enBtn = document.querySelector('button[data-lang="en"]');
    expect(enBtn).not.toBeNull();
    fireEvent.click(enBtn!);

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Edovita' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('lang')).toBe('en-GB');
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    // Bestehende Einstellung (Dunkelmodus) bleibt unverändert erhalten
    expect(document.documentElement.getAttribute('data-eff')).toBe('dark');

    // Navigation zur Statusseite zeigt sofort englische Texte
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(
      await screen.findByRole('heading', { name: 'Overview' }),
    ).toBeInTheDocument();
  });

  it('navigiert per Hash-Router zur Statusseite und wieder zurück', async () => {
    render(<App navigatorLanguages={['de-CH']} />);

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
