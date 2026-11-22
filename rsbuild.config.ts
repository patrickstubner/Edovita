import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

/** Asset-Prefix auf GitHub Pages (Projektseiten-URL …/Edovita/). */
export const PAGES_BASE = '/Edovita/';

export function isGitHubPagesBuild(): boolean {
  return process.env.GITHUB_PAGES === 'true';
}

/** Lokal `/`, auf GitHub Pages `/Edovita/`. Immer mit abschliessendem Schrägstrich. */
export function getAssetPrefix(): string {
  return isGitHubPagesBuild() ? PAGES_BASE : '/';
}

/**
 * Liest alle Sicherheits-Header direkt aus `public/_headers` (Single Source of Truth,
 * ADR-004 / docs/architektur/SECURITY.md), damit Preview-Server und Auslieferung
 * garantiert identische CSP- und Sicherheits-Header verwenden.
 *
 * Es wird nur der `/*`-Block gelesen.
 */
export function loadSecurityHeaders(
  headersFile = resolve(process.cwd(), 'public/_headers'),
): Record<string, string> {
  const raw = readFileSync(headersFile, 'utf8');
  const headers: Record<string, string> = {};
  let inDefaultBlock = false;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    if (!trimmed.includes(':')) {
      inDefaultBlock = trimmed === '/*';
      continue;
    }
    if (!inDefaultBlock) {
      continue;
    }
    const sep = trimmed.indexOf(':');
    if (sep <= 0) {
      continue;
    }
    const name = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim();
    if (name && value) {
      headers[name] = value;
    }
  }
  return headers;
}

/**
 * CSP für `<meta http-equiv>`: `frame-ancestors` wirkt in Meta-Tags nicht
 * (HTML-Standard / CSP) und wird deshalb entfernt. Quelle bleibt `public/_headers`.
 */
export function cspForMeta(csp: string): string {
  return csp
    .split(';')
    .map((directive) => directive.trim())
    .filter(
      (directive) =>
        directive.length > 0 && !/^frame-ancestors\b/i.test(directive),
    )
    .join('; ');
}

export const SECURITY_HEADERS = loadSecurityHeaders();
export const CSP_META_CONTENT = cspForMeta(
  SECURITY_HEADERS['Content-Security-Policy'] ?? '',
);

const assetPrefix = getAssetPrefix();
const distRoot = process.env.PAGES_DIST ?? 'dist';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  html: {
    template: './index.html',
    templateParameters: {
      publicBase: assetPrefix,
      cspMeta: CSP_META_CONTENT,
    },
  },
  output: {
    assetPrefix,
    distPath: {
      root: distRoot,
    },
    cleanDistPath: true,
    inlineScripts: false,
    inlineStyles: false,
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    headers: SECURITY_HEADERS,
    base: assetPrefix,
  },
});
