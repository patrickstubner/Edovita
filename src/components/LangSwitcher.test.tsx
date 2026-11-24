import { afterEach, describe, expect, it } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  createSettingsSchema,
  isApprovedUiLang,
  type LangCode,
  type LanguagesRegistry,
} from '../domain/index.ts';
import {
  LANGUAGES_REGISTRY,
  getApprovedUiLanguages,
} from '../i18n/index.ts';
import { LangFlag } from './LangFlag.tsx';
import { LangSwitcher, type LangSwitcherOption } from './LangSwitcher.tsx';

afterEach(() => {
  cleanup();
});

const DEFAULT_OPTIONS: readonly LangSwitcherOption[] = [
  { code: 'de', name: 'Deutsch', locale: 'de-CH' },
  { code: 'en', name: 'English', locale: 'en-GB' },
];

describe('Kompakter Sprachumschalter & Registry-Whitelist (Prototyp v5.5)', () => {
  it('rendert Trigger-Button mit lokaler SVG-Flagge, Kürzel und allen ARIA-Attributen und schliesst per Backdrop', () => {
    const selected: LangCode[] = [];
    render(
      <LangSwitcher
        currentCode="de"
        options={DEFAULT_OPTIONS}
        buttonLabel="Sprache, aktuell Deutsch"
        menuLabel="Sprache"
        onSelect={(code) => selected.push(code)}
      />,
    );

    const btn = screen.getByTestId('lang-switch-btn');
    expect(btn).toHaveAttribute('aria-haspopup', 'listbox');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveAttribute('aria-controls', 'langMenu');
    expect(btn).toHaveAttribute('aria-label', 'Sprache, aktuell Deutsch');
    expect(screen.getByTestId('lang-switch-code')).toHaveTextContent('DE');

    // Lokale SVG-Flagge ohne Netzabruf
    const svg = btn.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 60 42');
    expect(btn.querySelector('img')).toBeNull();

    // Öffnen per Klick zeigt role="listbox" mit aria-selected
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('listbox', { name: 'Sprache' });
    expect(menu).toBeVisible();

    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(2);
    expect(opts[0]).toHaveAttribute('aria-selected', 'true');
    expect(opts[0]).toHaveAttribute('data-lang', 'de');
    expect(opts[1]).toHaveAttribute('aria-selected', 'false');
    expect(opts[1]).toHaveAttribute('data-lang', 'en');

    // Klick auf Hintergrund (Backdrop) schliesst das Menü
    fireEvent.click(screen.getByTestId('lang-switch-backdrop'));
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('lang-switch-menu')).not.toBeVisible();
    expect(selected).toEqual([]);
  });

  it('unterstützt volle Tastaturbedienung: ArrowDown/ArrowUp, Home/End, Escape (Fokus zurück), Tab und Auswahl (Fokus zurück)', () => {
    const selected: LangCode[] = [];
    render(
      <LangSwitcher
        currentCode="de"
        options={DEFAULT_OPTIONS}
        buttonLabel="Sprache, aktuell Deutsch"
        menuLabel="Sprache"
        onSelect={(code) => selected.push(code)}
      />,
    );

    const btn = screen.getByTestId('lang-switch-btn');
    btn.focus();

    // ArrowDown öffnet und fokussiert gewählte Option (de)
    fireEvent.keyDown(btn, { key: 'ArrowDown' });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const opts = screen.getAllByRole('option');
    expect(document.activeElement).toBe(opts[0]);

    // ArrowDown -> en, End -> en, Home -> de, ArrowUp (Wrap) -> en
    fireEvent.keyDown(opts[0]!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(opts[1]);

    fireEvent.keyDown(opts[1]!, { key: 'Home' });
    expect(document.activeElement).toBe(opts[0]);

    fireEvent.keyDown(opts[0]!, { key: 'End' });
    expect(document.activeElement).toBe(opts[1]);

    fireEvent.keyDown(opts[1]!, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(opts[0]);

    // Escape schliesst und gibt Fokus an Trigger-Button zurück
    fireEvent.keyDown(opts[0]!, { key: 'Escape' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(btn);

    // ArrowUp auf geschlossenem Button öffnet und fokussiert letzte Option (en)
    fireEvent.keyDown(btn, { key: 'ArrowUp' });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toBe(opts[1]);

    // Tab schliesst das Menü
    fireEvent.keyDown(opts[1]!, { key: 'Tab' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');

    // Öffnen + Auswahl wählt en, schliesst und gibt Fokus an Button zurück
    fireEvent.click(btn);
    fireEvent.click(opts[1]!);
    expect(selected).toEqual(['en']);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(btn);
  });

  it('LangFlag rendert feste lokale SVGs für alle 7 Sprachen und sicheren Fallback für unbekannte Codes', () => {
    for (const code of ['de', 'en', 'fr', 'it', 'es', 'ja', 'pt', 'xx']) {
      const { container, unmount } = render(<LangFlag code={code} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 60 42');
      expect(svg?.children.length).toBeGreaterThan(0);
      unmount();
    }
  });

  it('Whitelist-Prüfung: nur Sprachen mit active !== false UND legalApproved === true sind zugelassen', () => {
    const customRegistry: LanguagesRegistry = {
      ...LANGUAGES_REGISTRY,
      meta: {
        ...LANGUAGES_REGISTRY.meta,
        de: { ...LANGUAGES_REGISTRY.meta.de!, active: false, legalApproved: true },
        fr: { ...LANGUAGES_REGISTRY.meta.fr!, active: true, legalApproved: false },
        en: { ...LANGUAGES_REGISTRY.meta.en!, active: true, legalApproved: true },
      },
    };

    expect(isApprovedUiLang('en', customRegistry)).toBe(true);
    expect(isApprovedUiLang('de', customRegistry)).toBe(false);
    expect(isApprovedUiLang('fr', customRegistry)).toBe(false);
    expect(isApprovedUiLang('__proto__', customRegistry)).toBe(false);
    expect(getApprovedUiLanguages(customRegistry)).toEqual(['en']);

    const schema = createSettingsSchema(customRegistry);
    expect(
      schema.safeParse({
        uiLang: 'de',
        secondLang: null,
        theme: 'system',
        sound: true,
        hymn: 'H1',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        uiLang: 'en',
        secondLang: null,
        theme: 'system',
        sound: true,
        hymn: 'H1',
      }).success,
    ).toBe(true);
  });
});
