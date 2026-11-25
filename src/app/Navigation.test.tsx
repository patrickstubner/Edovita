import { afterEach, describe, expect, it } from '@rstest/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { createMemoryStorage } from '../storage/index.ts';
import { App } from './App.tsx';
import {
  NAV_TABS,
  VISIBLE_NAV_TABS,
  resolveActiveNavTab,
  resolveNavTabPath,
} from './navigation.ts';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
});

describe('E9 Navigation: Whitelist & Tab-Zuordnung (navigation.ts)', () => {
  it('erlaubt ausschliesslich aktive Whitelist-Tabs und lehnt Plan (bis E10) sowie freie Eingaben ab', () => {
    expect(NAV_TABS.map((t) => t.id)).toEqual(['rezepte', 'plan', 'profil']);
    expect(VISIBLE_NAV_TABS.map((t) => t.id)).toEqual(['rezepte', 'profil']);

    expect(resolveNavTabPath('rezepte')).toBe('/rezepte');
    expect(resolveNavTabPath('profil')).toBe('/profil');
    expect(resolveNavTabPath('plan')).toBeNull();
    expect(resolveNavTabPath('__proto__')).toBeNull();
    expect(resolveNavTabPath(`${'java'}script:alert(1)`)).toBeNull();
    expect(resolveNavTabPath('../etc/passwd')).toBeNull();
  });

  it('ordnet Routen korrekt dem aktiven Tab zu', () => {
    expect(resolveActiveNavTab('/rezepte')).toBe('rezepte');
    expect(resolveActiveNavTab('/rezept/oven_salmon')).toBe('rezepte');
    expect(resolveActiveNavTab('/einkauf')).toBe('rezepte');
    expect(resolveActiveNavTab('/plan')).toBe('plan');
    expect(resolveActiveNavTab('/profil')).toBe('profil');
    expect(resolveActiveNavTab('/profil/sprache')).toBe('profil');
    expect(resolveActiveNavTab('/')).toBeNull();
    expect(resolveActiveNavTab('/status')).toBeNull();
    expect(resolveActiveNavTab('/unbekannt')).toBeNull();
  });
});

describe('E9 Navigation: Tab-Leiste, #/profil, #/profil/sprache & Fallback-Route', () => {
  it('navigiert Start -> Tab Profil -> Sprache -> zurück -> Tab Rezepte und zeigt keinen Plan-/Demo-Abschnitt', async () => {
    render(
      <App navigatorLanguages={['de-CH']} storage={createMemoryStorage()} />,
    );

    const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((el) => el.getAttribute('data-tabid'))).toEqual([
      'rezepte',
      'profil',
    ]);
    // Auf der Startseite ist kein Tab aktiv markiert
    for (const link of links) {
      expect(link).not.toHaveAttribute('aria-current');
    }
    expect(within(nav).queryByText('Plan')).toBeNull();

    // Start -> Tab Profil
    fireEvent.click(within(nav).getByRole('link', { name: 'Profil' }));
    expect(
      await screen.findByRole('heading', { name: 'Profil' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-profil')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByTestId('tab-rezepte')).not.toHaveAttribute(
      'aria-current',
    );

    // Profil zeigt Zeile «Sprache» mit aktuellem Sprachnamen, aber keinen Demo-Abschnitt
    const langBtn = screen.getByTestId('profil-sprache-btn');
    expect(langBtn).toHaveTextContent('Sprache');
    expect(langBtn).toHaveTextContent('Deutsch');
    expect(screen.queryByText(/Weitere Funktionen/i)).toBeNull();
    expect(screen.queryByText(/^Heute$/i)).toBeNull();

    // Profil -> Sprache (#/profil/sprache)
    fireEvent.click(langBtn);
    expect(
      await screen.findByRole('heading', { name: 'Sprache' }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe('#/profil/sprache');
    expect(screen.getByTestId('tab-profil')).toHaveAttribute(
      'aria-current',
      'page',
    );

    // Zurück-Knopf auf #/profil/sprache führt nach #/profil
    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    expect(
      await screen.findByRole('heading', { name: 'Profil' }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe('#/profil');

    // Tab Rezepte aktiviert Rezepte-Tab (auch auf Detailseite und Einkaufsliste)
    fireEvent.click(screen.getByTestId('tab-rezepte'));
    expect(
      await screen.findByRole('heading', { name: 'Rezepte für dich' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-rezepte')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByTestId('tab-profil')).not.toHaveAttribute(
      'aria-current',
    );

    fireEvent.click(screen.getByRole('button', { name: /Einkaufsliste öffnen/i }));
    expect(
      await screen.findByRole('heading', { name: 'Einkaufsliste' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-rezepte')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('unterstützt direkten Hash #/profil/sprache (Alias), leitet unbekannte Routen auf / um und übersetzt Tab-Leiste live', async () => {
    window.location.hash = '#/profil/sprache';
    render(
      <App navigatorLanguages={['de-CH']} storage={createMemoryStorage()} />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Sprache' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-profil')).toHaveAttribute(
      'aria-current',
      'page',
    );

    // Sprachwechsel auf Englisch aktualisiert Tab-Leiste und Profil-Untertitel sofort
    fireEvent.click(
      within(screen.getByTestId('lang-list')).getByRole('button', {
        name: /English/i,
      }),
    );
    expect(
      await screen.findByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-rezepte')).toHaveTextContent('Recipes');
    expect(screen.getByTestId('tab-profil')).toHaveTextContent('Profile');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      await screen.findByRole('heading', { name: 'Profile' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('profil-sprache-btn')).toHaveTextContent(
      'Language',
    );
    expect(screen.getByTestId('profil-sprache-btn')).toHaveTextContent(
      'English',
    );
  });

  it('leitet unbekannte Routen sicher auf die Startseite / um', async () => {
    window.location.hash = '#/nicht-vorhanden';
    render(
      <App navigatorLanguages={['de-CH']} storage={createMemoryStorage()} />,
    );
    expect(
      await screen.findByRole('heading', { name: 'Willkommen bei Edovita' }),
    ).toBeInTheDocument();
  });
});
