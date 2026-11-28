import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type RsbuildPlugin } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import {
  SHELL_PRECACHE_STATIC_FILES,
  buildCacheNames,
  buildWebManifest,
  filterAppShellPaths,
  filterRecipeThumbPaths,
  generateKillSwitchServiceWorkerScript,
  generateServiceWorkerScript,
} from './src/pwa/index.ts';

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
 * Es wird nur der `/*`-Block gelesen; andere Pfad-Blöcke werden ignoriert.
 * Der Standardpfad hängt an dieser Datei (`import.meta.dirname`), nicht am cwd.
 */
export function loadSecurityHeaders(
  headersFile = resolve(import.meta.dirname, 'public/_headers'),
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

function loadAppVersion(): string {
  const pkgPath = resolve(import.meta.dirname, 'package.json');
  const parsed = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
    version?: unknown;
  };
  return typeof parsed.version === 'string' && parsed.version.length > 0
    ? parsed.version
    : '0.1.0';
}

/**
 * Emits `manifest.webmanifest` and the E7b offline `sw.js` with deterministic
 * versioned cache names covering the app shell (HTML/JS/CSS, manifest, icons,
 * logos) and recipe thumbnails, plus a bounded runtime full-image cache.
 * Set `PWA_KILL_SWITCH=true` to emit the self-unregistering kill-switch worker.
 */
function pluginPwaShell(basePath: string): RsbuildPlugin {
  const appVersion = loadAppVersion();
  const killSwitchEnabled = process.env.PWA_KILL_SWITCH === 'true';
  const publicStaticBuffers = SHELL_PRECACHE_STATIC_FILES.filter(
    (file) => file !== 'manifest.webmanifest',
  ).map((file) => ({
    file,
    content: readFileSync(resolve(import.meta.dirname, 'public', file)),
  }));

  return {
    name: 'edovita-pwa-shell',
    setup(api) {
      api.processAssets(
        { stage: 'summarize' },
        ({ assets, compilation, sources }) => {
          const manifestJson = `${JSON.stringify(
            buildWebManifest(basePath),
            null,
            2,
          )}\n`;
          compilation.emitAsset(
            'manifest.webmanifest',
            new sources.RawSource(manifestJson),
          );

          if (killSwitchEnabled) {
            compilation.emitAsset(
              'sw.js',
              new sources.RawSource(generateKillSwitchServiceWorkerScript()),
            );
            return;
          }

          const emittedAssetPaths = Object.keys(assets).map(
            (assetName) => `${basePath}${assetName.replace(/^\/+/, '')}`,
          );
          const shellCandidates = [
            basePath,
            `${basePath}index.html`,
            ...SHELL_PRECACHE_STATIC_FILES.map((file) => `${basePath}${file}`),
            ...emittedAssetPaths,
          ];
          const shellPaths = filterAppShellPaths(shellCandidates, basePath);
          const thumbPaths = filterRecipeThumbPaths(
            emittedAssetPaths,
            basePath,
          );

          const hash = createHash('sha256');
          hash.update(appVersion);
          hash.update('\n');
          hash.update(basePath);
          hash.update('\n');
          hash.update(manifestJson);
          for (const entry of publicStaticBuffers) {
            hash.update('\n');
            hash.update(entry.file);
            hash.update(':');
            hash.update(entry.content);
          }
          for (const precachePath of [...shellPaths, ...thumbPaths]) {
            hash.update('\n');
            hash.update(precachePath);
            const rel = precachePath.slice(basePath.length);
            const asset = rel ? assets[rel] : undefined;
            if (asset) {
              hash.update(':');
              const src = asset.source();
              hash.update(typeof src === 'string' ? src : Buffer.from(src));
            }
          }
          const buildHash = hash.digest('hex').slice(0, 12);
          const cacheNames = buildCacheNames(appVersion, buildHash);

          const swSource = generateServiceWorkerScript({
            cacheNames,
            basePath,
            shellPaths,
            thumbPaths,
          });
          compilation.emitAsset('sw.js', new sources.RawSource(swSource));
        },
      );
    },
  };
}

export const SECURITY_HEADERS = loadSecurityHeaders();
export const CSP_META_CONTENT = cspForMeta(
  SECURITY_HEADERS['Content-Security-Policy'] ?? '',
);

const assetPrefix = getAssetPrefix();
const distRoot = process.env.PAGES_DIST ?? 'dist';

export default defineConfig({
  plugins: [pluginReact(), pluginPwaShell(assetPrefix)],
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
