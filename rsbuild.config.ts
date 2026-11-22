import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

/**
 * Liest alle Sicherheits-Header direkt aus `public/_headers` (Single Source of Truth,
 * ADR-004 / docs/architektur/SECURITY.md), damit Preview-Server und Auslieferung
 * garantiert identische CSP- und Sicherheits-Header verwenden.
 */
export function loadSecurityHeaders(
  headersFile = resolve(process.cwd(), 'public/_headers'),
): Record<string, string> {
  const raw = readFileSync(headersFile, 'utf8');
  const headers: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '/*' || trimmed.startsWith('#')) {
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

export const SECURITY_HEADERS = loadSecurityHeaders();

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  html: {
    template: './index.html',
  },
  output: {
    distPath: {
      root: 'dist',
    },
    cleanDistPath: true,
    inlineScripts: false,
    inlineStyles: false,
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    headers: SECURITY_HEADERS,
  },
});
