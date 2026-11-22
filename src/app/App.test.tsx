import { afterEach, describe, expect, it } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from './App.tsx';
import { THEME_STORAGE_KEY } from './theme.ts';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
});

describe('App Grundgerüst (E0)', () => {
  it('rendert Startseite mit fixen BottomActions und schaltet Hell/Dunkel um', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeInTheDocument();
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

  it('navigiert per Hash-Router zur Statusseite und wieder zurück', async () => {
    render(<App />);

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
