import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from '@rstest/core';
import { foodName } from '../catalog/index.ts';
import {
  asFoodId,
  coerceSecondLang,
  createSettingsSchema,
  type LanguagesRegistry,
} from '../domain/index.ts';
import {
  LANGUAGES_REGISTRY,
  PSEUDO_RTL_LANG,
  SECOND_LANG_STORAGE_KEY,
  autoSecondLang,
  effectiveSecondLang,
  isPseudoRtlEnabled,
  pseudoRtlFoodName,
  readStoredSecondLang,
  withPseudoRtlRegistry,
  writeStoredSecondLang,
} from './index.ts';

afterEach(() => {
  window.localStorage.clear();
});

function walkSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkSourceFiles(full));
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('i18n/secondLang (E6, Issue #12, Prototyp v5.10)', () => {
  it('berechnet den automatischen Standard nach Ort aus Zeitzone/Sprachen (ohne Geolocation)', () => {
    // 1. America/Sao_Paulo + UI de -> pt
    expect(
      autoSecondLang('de', LANGUAGES_REGISTRY, {
        timeZone: 'America/Sao_Paulo',
        navigatorLanguages: ['de-CH'],
      }),
    ).toBe('pt');

    // 2. Asia/Tokyo -> ja (bei UI de und UI en)
    expect(
      autoSecondLang('de', LANGUAGES_REGISTRY, {
        timeZone: 'Asia/Tokyo',
        navigatorLanguages: ['de-CH'],
      }),
    ).toBe('ja');
    expect(
      autoSecondLang('en', LANGUAGES_REGISTRY, {
        timeZone: 'Asia/Tokyo',
        navigatorLanguages: ['en-GB'],
      }),
    ).toBe('ja');

    // 3. Europe/Zurich + UI de -> en (Ort ist CH -> de == UI -> Fallback en)
    expect(
      autoSecondLang('de', LANGUAGES_REGISTRY, {
        timeZone: 'Europe/Zurich',
        navigatorLanguages: ['de-CH'],
      }),
    ).toBe('en');

    // 4. UI en ohne passenden Ort -> keine (null)
    expect(
      autoSecondLang('en', LANGUAGES_REGISTRY, {
        timeZone: 'Europe/London',
        navigatorLanguages: ['en-GB'],
      }),
    ).toBeNull();
    expect(
      autoSecondLang('en', LANGUAGES_REGISTRY, {
        timeZone: 'Asia/Ho_Chi_Minh', // vi nicht in secondary
        navigatorLanguages: ['en-US'],
      }),
    ).toBeNull();
    expect(
      autoSecondLang('en', LANGUAGES_REGISTRY, {
        timeZone: 'UTC',
        navigatorLanguages: ['en'],
      }),
    ).toBeNull();

    // 5. Fallback auf Region aus navigator.languages bei unbekannter Zeitzone
    expect(
      autoSecondLang('de', LANGUAGES_REGISTRY, {
        timeZone: 'UTC',
        navigatorLanguages: ['pt-BR'],
      }),
    ).toBe('pt');
    expect(
      autoSecondLang('de', LANGUAGES_REGISTRY, {
        timeZone: 'UTC',
        navigatorLanguages: ['ja-JP'],
      }),
    ).toBe('ja');
  });

  it('behandelt dreiwertiges secondLang (null=automatisch, "none"=keine, Code=manuell) und blendet gleiche Sprache aus', () => {
    const schema = createSettingsSchema(LANGUAGES_REGISTRY);

    expect(coerceSecondLang(null, LANGUAGES_REGISTRY)).toBeNull();
    expect(coerceSecondLang(undefined, LANGUAGES_REGISTRY)).toBeNull();
    expect(coerceSecondLang('', LANGUAGES_REGISTRY)).toBeNull();
    expect(coerceSecondLang('auto', LANGUAGES_REGISTRY)).toBeNull();
    expect(coerceSecondLang('none', LANGUAGES_REGISTRY)).toBe('none');
    expect(coerceSecondLang('pt', LANGUAGES_REGISTRY)).toBe('pt');
    expect(coerceSecondLang('pt-BR', LANGUAGES_REGISTRY)).toBe('pt');
    expect(coerceSecondLang('fr', LANGUAGES_REGISTRY)).toBeNull();
    expect(coerceSecondLang('__proto__', LANGUAGES_REGISTRY)).toBeNull();
    expect(coerceSecondLang('constructor', LANGUAGES_REGISTRY)).toBeNull();

    expect(
      schema.safeParse({
        uiLang: 'de',
        secondLang: 'none',
        theme: 'system',
        sound: true,
        hymn: 'H1',
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        uiLang: 'de',
        secondLang: null,
        theme: 'system',
        sound: true,
        hymn: 'H1',
      }).success,
    ).toBe(true);

    // `none` schaltet Zweitsprache explizit aus (kein Fallback auf Automatik)
    expect(
      effectiveSecondLang('none', 'de', LANGUAGES_REGISTRY, {
        timeZone: 'America/Sao_Paulo',
      }),
    ).toBeNull();

    // Manuelle Wahl == UI-Sprache -> ausgeblendet
    expect(
      effectiveSecondLang('en', 'en', LANGUAGES_REGISTRY, {
        timeZone: 'America/Sao_Paulo',
      }),
    ).toBeNull();

    // Manuelle Wahl != UI-Sprache -> wirksam
    expect(
      effectiveSecondLang('ja', 'de', LANGUAGES_REGISTRY, {
        timeZone: 'Europe/Zurich',
      }),
    ).toBe('ja');

    // Automatik (null) folgt Ort
    expect(
      effectiveSecondLang(null, 'de', LANGUAGES_REGISTRY, {
        timeZone: 'America/Sao_Paulo',
      }),
    ).toBe('pt');
  });

  it('speichert Automatik nie in localStorage, manuelle Wahl & "none" jedoch schon; ungültige Einträge werden entfernt', () => {
    expect(readStoredSecondLang(LANGUAGES_REGISTRY)).toBeNull();
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBeNull();

    expect(writeStoredSecondLang('pt', LANGUAGES_REGISTRY)).toBe(true);
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBe('pt');
    expect(readStoredSecondLang(LANGUAGES_REGISTRY)).toBe('pt');

    expect(writeStoredSecondLang('none', LANGUAGES_REGISTRY)).toBe(true);
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBe('none');
    expect(readStoredSecondLang(LANGUAGES_REGISTRY)).toBe('none');

    // Zurück auf Automatik -> Schlüssel wird gelöscht (Automatik nie gespeichert)
    expect(writeStoredSecondLang(null, LANGUAGES_REGISTRY)).toBe(true);
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBeNull();
    expect(readStoredSecondLang(LANGUAGES_REGISTRY)).toBeNull();

    // Manipulierter Eintrag -> bereinigt auf null
    window.localStorage.setItem(SECOND_LANG_STORAGE_KEY, '__proto__');
    expect(readStoredSecondLang(LANGUAGES_REGISTRY)).toBeNull();
    expect(window.localStorage.getItem(SECOND_LANG_STORAGE_KEY)).toBeNull();
  });

  it('erlaubt neue Zweitsprache xx rein über Glossar + Registry ohne Codeänderung; fehlender Eintrag liefert null', async () => {
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
      },
    };

    expect(coerceSecondLang('xx', extendedRegistry)).toBe('xx');
    expect(effectiveSecondLang('xx', 'de', extendedRegistry)).toBe('xx');
    expect(foodName(asFoodId('broccoli'), 'xx', customGlossaries)).toBe('Brok-XX');
    // Fehlender Glossareintrag -> null (kein englischer Ersatz!)
    expect(foodName(asFoodId('potato'), 'xx', customGlossaries)).toBeNull();

    // Auch der Inhalts-Index-Generator nimmt eine neue Datei xx.json automatisch ohne Codeänderung auf
    const scriptUrl = pathToFileURL(
      resolve(process.cwd(), 'scripts/build-content-index.mjs'),
    ).href;
    const { generateCatalogIndexSource } = (await import(scriptUrl)) as {
      generateCatalogIndexSource: (contentDir?: string) => string;
    };
    const tmp = mkdtempSync(join(tmpdir(), 'edovita-xx-'));
    try {
      mkdirSync(join(tmp, 'foods/glossary'), { recursive: true });
      mkdirSync(join(tmp, 'recipes'), { recursive: true });
      writeFileSync(
        join(tmp, 'foods/foods.json'),
        JSON.stringify({ source: { name: 'T', version: '1', license: 'CC' }, foods: [] }),
      );
      writeFileSync(
        join(tmp, 'foods/glossary/xx.json'),
        JSON.stringify({ broccoli: 'Brok-XX' }),
      );
      const generated = generateCatalogIndexSource(tmp);
      expect(generated).toContain("import glossaryXx from '../foods/glossary/xx.json';");
      expect(generated).toContain("'xx'");
      expect(generated).toContain('xx: glossaryXx');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('beschränkt Pseudo-RTL ar-XB strikt auf Loopback + ?pseudoRtl=1 (nie auf Produktiv-Hosts)', () => {
    expect(
      isPseudoRtlEnabled({
        hostname: 'patrickstubner.github.io',
        search: '?pseudoRtl=1',
      }),
    ).toBe(false);
    expect(
      isPseudoRtlEnabled({ hostname: 'edovita.app', search: '?pseudoRtl=1' }),
    ).toBe(false);
    expect(
      isPseudoRtlEnabled({ hostname: '127.0.0.1', search: '' }),
    ).toBe(false);
    expect(
      isPseudoRtlEnabled({ hostname: '127.0.0.1', search: '?pseudoRtl=1' }),
    ).toBe(true);
    expect(
      isPseudoRtlEnabled({ hostname: 'localhost', search: '?pseudoRtl=1' }),
    ).toBe(true);

    const rtlReg = withPseudoRtlRegistry(LANGUAGES_REGISTRY);
    expect(rtlReg.secondary).toContain(PSEUDO_RTL_LANG);
    expect(rtlReg.meta[PSEUDO_RTL_LANG]?.dir).toBe('rtl');
    expect(pseudoRtlFoodName('broccoli')).toBe('بروكلي');
    expect(LANGUAGES_REGISTRY.secondary).not.toContain(PSEUDO_RTL_LANG);
  });

  it('nutzt nirgends navigator.geolocation und behält Permissions-Policy geolocation=() in public/_headers', () => {
    const repoRoot = resolve(import.meta.dirname, '../..');
    const srcFiles = walkSourceFiles(join(repoRoot, 'src')).filter(
      (file) => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'),
    );
    const matches: string[] = [];
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf8');
      if (
        /\bnavigator\s*\.\s*geolocation\b|\bgetCurrentPosition\b|\bwatchPosition\b/.test(
          content,
        )
      ) {
        matches.push(file);
      }
    }
    expect(matches).toEqual([]);

    const headers = readFileSync(join(repoRoot, 'public/_headers'), 'utf8');
    expect(headers).toContain('Permissions-Policy:');
    expect(headers).toContain('geolocation=()');
  });
});
