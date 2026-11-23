import {
  languagesRegistrySchema,
  uiLocaleSchema,
  type FoodId,
} from '../domain/index.ts';

export interface RawLocalesBundle {
  registry: unknown;
  uiLocales: Record<string, unknown>;
  glossaries: Record<string, unknown>;
  foodIds: readonly (FoodId | string)[];
  usedUiKeys?: ReadonlySet<string>;
}

export interface LocalesValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const HTML_TAG_RE = /<\s*\/?\s*[a-zA-Z]/;

/**
 * Prüft ausgeglichene ICU-Klammern (`{...}`).
 */
export function hasBalancedBraces(text: string): boolean {
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth < 0) {
        return false;
      }
    }
  }
  return depth === 0;
}

/**
 * Extrahiert die sortierten ICU-Platzhalternamen aus einem Übersetzungstext
 * (identisch zu `prototype/tools/build-locales.py`).
 */
export function extractPlaceholderNames(text: string): string[] {
  const names = new Set<string>();
  const re = /\{\s*([A-Za-z_]\w*)\s*[,}]/g;
  let match = re.exec(text);
  while (match !== null) {
    if (match[1]) {
      names.add(match[1]);
    }
    match = re.exec(text);
  }
  return [...names].sort();
}

function sameStringList(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Prüft Sprach-Registry, alle UI-Locales (Schlüssel, ICU-Platzhalter, Klammern, kein HTML)
 * und alle Zweitsprachen-Glossare (Vollständigkeit aller FoodIds) gemäss ADR-003 und Testplan.
 */
export function validateLocalesBundle(
  bundle: RawLocalesBundle,
): LocalesValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsedReg = languagesRegistrySchema.safeParse(bundle.registry);
  if (!parsedReg.success) {
    for (const issue of parsedReg.error.issues) {
      errors.push(`languages.json (${issue.path.join('.')}): ${issue.message}`);
    }
    return { ok: false, errors, warnings };
  }

  const registry = parsedReg.data;

  if (!registry.ui.includes(registry.fallback)) {
    errors.push(
      `languages.json: fallback "${registry.fallback}" fehlt in ui-Liste`,
    );
  }

  for (const code of [...registry.ui, ...registry.secondary]) {
    if (!Object.hasOwn(registry.meta, code)) {
      errors.push(`languages.json: meta für "${code}" fehlt`);
    } else if (registry.meta[code]?.code !== code) {
      errors.push(
        `languages.json: meta["${code}"].code weicht vom Schlüssel ab`,
      );
    }
  }

  // UI-Locales validieren
  const validatedUi: Record<string, Record<string, string>> = {};
  for (const code of registry.ui) {
    if (!Object.hasOwn(bundle.uiLocales, code)) {
      errors.push(`UI-Locale ${code}: ui.json fehlt`);
      continue;
    }
    const rawLocale = bundle.uiLocales[code];
    const parsedLocale = uiLocaleSchema.safeParse(rawLocale);
    if (!parsedLocale.success) {
      for (const issue of parsedLocale.error.issues) {
        errors.push(
          `UI-Locale ${code} (${issue.path.join('.')}): ${issue.message}`,
        );
      }
      continue;
    }
    validatedUi[code] = parsedLocale.data;
  }

  const fallbackUi = Object.hasOwn(validatedUi, registry.fallback)
    ? validatedUi[registry.fallback]
    : undefined;

  if (!fallbackUi) {
    errors.push(
      `UI-Locale ${registry.fallback}: Fallback-Locale fehlt oder ungültig`,
    );
  } else {
    const baseKeys = Object.keys(fallbackUi).sort();

    for (const code of registry.ui) {
      const dict = Object.hasOwn(validatedUi, code)
        ? validatedUi[code]
        : undefined;
      if (!dict) continue;

      for (const key of baseKeys) {
        if (!Object.hasOwn(dict, key)) {
          errors.push(`UI-Locale ${code}: Schlüssel "${key}" fehlt`);
          continue;
        }
        const value = dict[key]!;
        if (!hasBalancedBraces(value)) {
          errors.push(`UI-Locale ${code}:${key}: Klammern unausgeglichen`);
        }
        if (HTML_TAG_RE.test(value)) {
          errors.push(`UI-Locale ${code}:${key}: HTML nicht erlaubt`);
        }
        const expectedVars = extractPlaceholderNames(fallbackUi[key]!);
        const actualVars = extractPlaceholderNames(value);
        if (!sameStringList(actualVars, expectedVars)) {
          errors.push(
            `UI-Locale ${code}:${key}: Platzhalter [${actualVars.join(', ')}] != ${registry.fallback} [${expectedVars.join(', ')}]`,
          );
        }
      }

      for (const key of Object.keys(dict)) {
        if (!Object.hasOwn(fallbackUi, key)) {
          errors.push(
            `UI-Locale ${code}: überzähliger Schlüssel "${key}" fehlt in ${registry.fallback}`,
          );
        }
      }
    }

    if (bundle.usedUiKeys) {
      for (const key of baseKeys) {
        if (!bundle.usedUiKeys.has(key)) {
          warnings.push(`Ungenutzter UI-Schlüssel: "${key}"`);
        }
      }
    }
  }

  // Zweitsprachen-Glossare: jede Zweitsprache muss alle FoodIds enthalten
  for (const code of registry.secondary) {
    if (!Object.hasOwn(bundle.glossaries, code)) {
      errors.push(`Zweitsprache ${code}: Glossar fehlt`);
      continue;
    }
    const rawGlossary = bundle.glossaries[code];
    const parsedGlossary = uiLocaleSchema.safeParse(rawGlossary);
    if (!parsedGlossary.success) {
      for (const issue of parsedGlossary.error.issues) {
        errors.push(
          `Zweitsprache ${code} (${issue.path.join('.')}): ${issue.message}`,
        );
      }
      continue;
    }
    const glossary = parsedGlossary.data;
    for (const foodId of bundle.foodIds) {
      if (!Object.hasOwn(glossary, foodId) || !glossary[foodId]) {
        errors.push(`Zweitsprache ${code}: FoodId "${foodId}" fehlt im Glossar`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
