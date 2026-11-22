import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Verbindliche Sicherheits-Header (ADR-004, docs/architektur/SECURITY.md).
// Identisch zu public/_headers; connect-src 'self' für lazy geladene Inhalte,
// strikt ohne 'unsafe-inline' und ohne 'unsafe-eval'.
export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy':
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

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
