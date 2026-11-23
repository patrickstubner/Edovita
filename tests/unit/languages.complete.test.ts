import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  validateLocalesBundle,
  type RawLocalesBundle,
} from '../../src/i18n/index.ts';

const ROOT = resolve(import.meta.dirname, '../..');
const CONTENT_DIR = resolve(ROOT, 'content');
const SRC_DIR = resolve(ROOT, 'src');

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function collectUsedUiKeys(dir: string): Set<string> {
  const used = new Set<string>();
  const keyRe = /['"]([a-z0-9_]+(?:\.[a-z0-9_]+)+)['"]/g;

  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
      } else if (
        (extname(full) === '.ts' || extname(full) === '.tsx') &&
        !full.endsWith('.test.ts') &&
        !full.endsWith('.test.tsx')
      ) {
        const src = readFileSync(full, 'utf8');
        let match = keyRe.exec(src);
        while (match !== null) {
          if (match[1]) {
            used.add(match[1]);
          }
          match = keyRe.exec(src);
        }
      }
    }
  }

  walk(dir);
  return used;
}

function loadRawLocalesBundle(): RawLocalesBundle {
  const registry = readJson(
    resolve(CONTENT_DIR, 'locales/languages.json'),
  ) as {
    ui: string[];
    secondary: string[];
  };

  const uiLocales: Record<string, unknown> = {};
  for (const code of registry.ui) {
    const p = resolve(CONTENT_DIR, `locales/${code}/ui.json`);
    if (existsSync(p)) {
      uiLocales[code] = readJson(p);
    }
  }

  const glossaries: Record<string, unknown> = {};
  for (const code of registry.secondary) {
    const p = resolve(CONTENT_DIR, `foods/glossary/${code}.json`);
    if (existsSync(p)) {
      glossaries[code] = readJson(p);
    }
  }

  const foodsFile = readJson(resolve(CONTENT_DIR, 'foods/foods.json')) as {
    foods: Array<{ id: string }>;
  };
  const foodIds = foodsFile.foods.map((f) => f.id);
  const usedUiKeys = collectUsedUiKeys(SRC_DIR);

  return { registry, uiLocales, glossaries, foodIds, usedUiKeys };
}

function cloneBundle(bundle: RawLocalesBundle): RawLocalesBundle {
  return {
    registry: structuredClone(bundle.registry),
    uiLocales: structuredClone(bundle.uiLocales),
    glossaries: structuredClone(bundle.glossaries),
    foodIds: [...bundle.foodIds],
    usedUiKeys: bundle.usedUiKeys ? new Set(bundle.usedUiKeys) : undefined,
  };
}

describe('Sprachen-Vollständigkeit (languages.complete.test.ts, ADR-003)', () => {
  it('prüft Registry, alle 7 UI-Sprachen (Schlüssel, Platzhalter, kein HTML) und alle Zweitsprachen-Glossare fehlerfrei', () => {
    const bundle = loadRawLocalesBundle();
    const report = validateLocalesBundle(bundle);

    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    // Alle UI-Schlüssel werden von den gebauten Screens genutzt (keine Altlasten aus Prototyp)
    expect(report.warnings).toEqual([]);
  });

  it('Negativtest: fehlender Schlüssel in fr lässt languages.complete.test.ts scheitern', () => {
    const broken = cloneBundle(loadRawLocalesBundle());
    delete (broken.uiLocales.fr as Record<string, string>)[
      'start.willkommen_bei_edovita'
    ];

    const report = validateLocalesBundle(broken);
    expect(report.ok).toBe(false);
    expect(
      report.errors.some(
        (e) =>
          e.includes('UI-Locale fr') &&
          e.includes('start.willkommen_bei_edovita'),
      ),
    ).toBe(true);
  });

  it('Negativtest: abweichende ICU-Platzhalter oder unausgeglichene Klammern brechen Prüfung', () => {
    const brokenVars = cloneBundle(loadRawLocalesBundle());
    (brokenVars.uiLocales.fr as Record<string, string>)['lang.detected'] =
      'Détectée : {wrongVar}';

    const varReport = validateLocalesBundle(brokenVars);
    expect(varReport.ok).toBe(false);
    expect(
      varReport.errors.some((e) => e.includes('Platzhalter')),
    ).toBe(true);

    const brokenBraces = cloneBundle(loadRawLocalesBundle());
    (brokenBraces.uiLocales.it as Record<string, string>)['lang.detected'] =
      'Rilevata: {name';

    const braceReport = validateLocalesBundle(brokenBraces);
    expect(braceReport.ok).toBe(false);
    expect(
      braceReport.errors.some((e) => e.includes('Klammern unausgeglichen')),
    ).toBe(true);
  });

  it('Negativtest: HTML in Übersetzung oder fehlende FoodId im Zweitsprachen-Glossar brechen Prüfung', () => {
    const brokenHtml = cloneBundle(loadRawLocalesBundle());
    (brokenHtml.uiLocales.es as Record<string, string>)['start.weiter'] =
      '<b>Continuar</b>';

    const htmlReport = validateLocalesBundle(brokenHtml);
    expect(htmlReport.ok).toBe(false);
    expect(
      htmlReport.errors.some((e) => e.includes('UI-Locale es')),
    ).toBe(true);

    const brokenGlossary = cloneBundle(loadRawLocalesBundle());
    delete (brokenGlossary.glossaries.pt as Record<string, string>).broccoli;

    const glossReport = validateLocalesBundle(brokenGlossary);
    expect(glossReport.ok).toBe(false);
    expect(
      glossReport.errors.some((e) =>
        e.includes('Zweitsprache pt: FoodId "broccoli" fehlt'),
      ),
    ).toBe(true);
  });

  it('meldet ungenutzte UI-Schlüssel als Warnung', () => {
    const bundle = cloneBundle(loadRawLocalesBundle());
    const reduced = new Set(bundle.usedUiKeys);
    reduced.delete('status.planned.offline');
    bundle.usedUiKeys = reduced;

    const report = validateLocalesBundle(bundle);
    expect(report.ok).toBe(true);
    expect(
      report.warnings.some((w) => w.includes('status.planned.offline')),
    ).toBe(true);
  });
});
