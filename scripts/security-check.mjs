import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = resolve(ROOT, process.env.DIST_DIR || 'dist');
const IS_PAGES = process.env.GITHUB_PAGES === 'true';
const errors = [];

const FORBIDDEN_SINKS = [
  { name: 'dangerouslySetInnerHTML', re: /\bdangerouslySetInnerHTML\b/ },
  { name: 'innerHTML', re: /\.innerHTML\b/ },
  { name: 'outerHTML', re: /\.outerHTML\b/ },
  { name: 'insertAdjacentHTML', re: /\.insertAdjacentHTML\b/ },
  { name: 'document.write', re: /\bdocument\.write\s*\(/ },
  { name: 'eval()', re: /\beval\s*\(/ },
  { name: 'new Function', re: /\bnew\s+Function\s*\(/ },
];

function walkFiles(dir, allowedExts) {
  const result = [];
  if (!existsSync(dir)) return result;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      result.push(...walkFiles(full, allowedExts));
    } else if (allowedExts.has(extname(full))) {
      result.push(full);
    }
  }
  return result;
}

function headerValue(headersText, name) {
  const re = new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, 'im');
  const match = headersText.match(re);
  return match ? match[1].trim() : '';
}

function cspForMeta(csp) {
  return csp
    .split(';')
    .map((directive) => directive.trim())
    .filter(
      (directive) =>
        directive.length > 0 && !/^frame-ancestors\b/i.test(directive),
    )
    .join('; ');
}

function normalizeCsp(csp) {
  return csp
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .split(';')
    .map((directive) => directive.trim())
    .filter(Boolean)
    .join('; ');
}

function extractMetaCsp(html) {
  const tag = html.match(
    /<meta\b[^>]*http-equiv\s*=\s*(["'])Content-Security-Policy\1[^>]*>/i,
  );
  if (!tag) {
    return null;
  }
  const content = tag[0].match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i);
  return content ? content[2] : '';
}

// 1. Gefährliche DOM-/Ausführungs-Senken in src/, content/ und public/ prüfen
const codeFiles = [
  ...walkFiles(resolve(ROOT, 'src'), new Set(['.ts', '.tsx', '.js', '.jsx'])),
  ...walkFiles(resolve(ROOT, 'content'), new Set(['.ts', '.tsx', '.js', '.jsx'])),
  ...walkFiles(resolve(ROOT, 'public'), new Set(['.js', '.html'])),
];

for (const file of codeFiles) {
  if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
  const content = readFileSync(file, 'utf8');
  for (const sink of FORBIDDEN_SINKS) {
    if (sink.re.test(content)) {
      errors.push(`Verbotene Senke "${sink.name}" gefunden in ${file}`);
    }
  }
}

// 2. CSP in public/_headers prüfen
const headersPath = resolve(ROOT, 'public/_headers');
let headersCsp = '';
if (!existsSync(headersPath)) {
  errors.push('public/_headers fehlt.');
} else {
  const headers = readFileSync(headersPath, 'utf8');
  headersCsp = headerValue(headers, 'Content-Security-Policy');
  if (!headersCsp) {
    errors.push('Content-Security-Policy fehlt in public/_headers.');
  }
  if (headers.includes('unsafe-inline') || headers.includes('unsafe-eval')) {
    errors.push('CSP in public/_headers darf kein unsafe-inline oder unsafe-eval enthalten.');
  }
  if (!headers.includes("connect-src 'self'")) {
    errors.push("CSP in public/_headers muss connect-src 'self' enthalten.");
  }
  if (!headers.includes("worker-src 'self'")) {
    errors.push("CSP in public/_headers must include worker-src 'self'.");
  }
  if (!headers.includes("manifest-src 'self'")) {
    errors.push("CSP in public/_headers must include manifest-src 'self'.");
  }
  if (!headers.includes("frame-ancestors 'none'")) {
    errors.push("CSP in public/_headers muss frame-ancestors 'none' enthalten.");
  }
  if (!headers.includes('X-Robots-Tag: noindex, nofollow, noarchive')) {
    errors.push('public/_headers muss X-Robots-Tag: noindex, nofollow, noarchive enthalten.');
  }
  if (!/^\s*\/sw\.js\s*$/m.test(headers) || !/Cache-Control:\s*no-cache/i.test(headers)) {
    errors.push('public/_headers must configure Cache-Control: no-cache for /sw.js.');
  }
}

// 2b. Sicherstellen, dass rsbuild.config.ts die Header direkt aus public/_headers liest
const rsbuildConfigPath = resolve(ROOT, 'rsbuild.config.ts');
if (!existsSync(rsbuildConfigPath)) {
  errors.push('rsbuild.config.ts fehlt.');
} else {
  const rsbuildSrc = readFileSync(rsbuildConfigPath, 'utf8');
  if (!rsbuildSrc.includes('public/_headers')) {
    errors.push('rsbuild.config.ts muss Sicherheits-Header aus public/_headers laden (Single Source of Truth).');
  }
  if (/Content-Security-Policy['"]?\s*:/.test(rsbuildSrc)) {
    errors.push('rsbuild.config.ts darf keine duplizierte CSP-Zeichenkette neben public/_headers definieren.');
  }
  if (!rsbuildSrc.includes('cspMeta') || !rsbuildSrc.includes('cspForMeta') || !rsbuildSrc.includes('CSP_META_CONTENT')) {
    errors.push('rsbuild.config.ts muss cspMeta/CSP_META_CONTENT aus public/_headers ableiten (cspForMeta).');
  }
  if (!rsbuildSrc.includes('frame-ancestors')) {
    errors.push('rsbuild.config.ts muss frame-ancestors aus der Meta-CSP entfernen.');
  }
  if (!rsbuildSrc.includes('GITHUB_PAGES') || !rsbuildSrc.includes('assetPrefix')) {
    errors.push('rsbuild.config.ts muss assetPrefix für GitHub Pages (GITHUB_PAGES) setzen.');
  }
}

// 2c. HTML-Template darf die CSP nicht fest kodieren (Quelle bleibt _headers)
const templatePath = resolve(ROOT, 'index.html');
if (!existsSync(templatePath)) {
  errors.push('index.html fehlt.');
} else {
  const template = readFileSync(templatePath, 'utf8');
  if (!template.includes('http-equiv="Content-Security-Policy"') || !template.includes('<%= cspMeta %>')) {
    errors.push('index.html muss die CSP als Meta-Tag mit <%= cspMeta %> direkt nach dem charset setzen (Quelle bleibt public/_headers).');
  }
  if (/content\s*=\s*["'](?!<%= cspMeta %>)[^"']*default-src/.test(template)) {
    errors.push('index.html darf die CSP-Policy nicht fest kodieren; sie kommt aus public/_headers über cspMeta.');
  }
  const charsetPos = template.indexOf('charset');
  const cspPos = template.indexOf('Content-Security-Policy');
  const scriptPos = template.indexOf('<script');
  if (cspPos < 0 || charsetPos < 0 || cspPos < charsetPos || (scriptPos >= 0 && cspPos > scriptPos)) {
    errors.push('CSP-Meta-Tag muss in index.html nach charset und vor jedem <script> stehen.');
  }
  if (!template.includes('<%= publicBase %>')) {
    errors.push('index.html muss publicBase für Icon und theme-init.js verwenden.');
  }
  if (!template.includes('rel="manifest"') || !template.includes('<%= publicBase %>manifest.webmanifest')) {
    errors.push('index.html must link manifest.webmanifest using <%= publicBase %>.');
  }
}

// 3. Gebautes dist/index.html prüfen (falls Build bereits gelaufen ist)
const distIndex = resolve(DIST_DIR, 'index.html');
if (existsSync(distIndex)) {
  const html = readFileSync(distIndex, 'utf8');
  const scriptTags = html.match(/<script\b[^>]*>/gi) ?? [];
  for (const tag of scriptTags) {
    if (!/\bsrc\s*=/.test(tag)) {
      errors.push(`Inline-<script> ohne src= in ${distIndex} gefunden: ${tag}`);
    }
  }
  if (/<style\b/i.test(html)) {
    errors.push(`Inline-<style> in ${distIndex} gefunden (verletzt strikte CSP).`);
  }

  const metaCsp = extractMetaCsp(html);
  if (metaCsp === null) {
    errors.push(`${distIndex} muss ein CSP-Meta-Tag (http-equiv) enthalten (GitHub Pages ignoriert _headers).`);
  } else {
    if (/frame-ancestors/i.test(metaCsp)) {
      errors.push('CSP-Meta-Tag darf kein frame-ancestors enthalten (wirkt in Meta nicht).');
    }
    if (/unsafe-inline|unsafe-eval/i.test(metaCsp)) {
      errors.push('CSP-Meta-Tag darf kein unsafe-inline oder unsafe-eval enthalten.');
    }
    if (!metaCsp.includes("worker-src 'self'") || !metaCsp.includes("manifest-src 'self'")) {
      errors.push("CSP meta tag must include worker-src 'self' and manifest-src 'self'.");
    }
    if (headersCsp) {
      const expected = normalizeCsp(cspForMeta(headersCsp));
      const actual = normalizeCsp(metaCsp);
      if (actual !== expected) {
        errors.push(
          `CSP-Meta-Tag weicht von public/_headers (ohne frame-ancestors) ab.\n  erwartet: ${expected}\n  gefunden: ${actual}`,
        );
      }
    }
  }

  const expectedBase = IS_PAGES ? '/Edovita/' : '/';

  if (IS_PAGES) {
    const prefix = '/Edovita/';
    const srcAttrs = [
      ...(html.match(/\bsrc\s*=\s*(["'])([^"']+)\1/gi) ?? []),
      ...(html.match(/\bhref\s*=\s*(["'])([^"']+\.(?:js|css|svg|png|ico|webmanifest))\1/gi) ?? []),
    ];
    for (const attr of srcAttrs) {
      const value = attr.replace(/^[^=]+=\s*["']/, '').replace(/["']$/, '');
      if (value.startsWith('#')) continue;
      if (!value.startsWith(prefix)) {
        errors.push(`Pages-Build: Asset "${value}" in ${distIndex} hat nicht den Prefix ${prefix}.`);
      }
    }
    if (html.includes('src="/theme-init.js"') || html.includes('href="/assets/') || html.includes('href="/icons/') || html.includes('href="/manifest.webmanifest"')) {
      errors.push(`Pages-Build: ${distIndex} enthält noch unpräfixierte Root-Pfade.`);
    }
  }

  // 3b. Validate emitted Web App Manifest (E7a)
  const distManifest = resolve(DIST_DIR, 'manifest.webmanifest');
  if (!existsSync(distManifest)) {
    errors.push(`${distManifest} is missing (E7a web app manifest required).`);
  } else {
    try {
      const manifest = JSON.parse(readFileSync(distManifest, 'utf8'));
      if (manifest.name !== 'Edovita' || manifest.short_name !== 'Edovita') {
        errors.push(`Invalid app name in ${distManifest}.`);
      }
      if (manifest.display !== 'standalone') {
        errors.push(`Manifest display must be "standalone" in ${distManifest}.`);
      }
      if (manifest.theme_color !== '#0B7F6B') {
        errors.push(`Manifest theme_color must be "#0B7F6B" in ${distManifest}.`);
      }
      if (manifest.start_url !== expectedBase || manifest.scope !== expectedBase) {
        errors.push(`Manifest start_url/scope must be "${expectedBase}" in ${distManifest}.`);
      }
      if (!Array.isArray(manifest.icons) || manifest.icons.length < 4) {
        errors.push(`Manifest must declare at least 4 PWA icons in ${distManifest}.`);
      } else {
        for (const icon of manifest.icons) {
          if (typeof icon.src !== 'string' || !icon.src.startsWith(expectedBase)) {
            errors.push(`Manifest icon "${icon.src}" must start with "${expectedBase}".`);
            continue;
          }
          const relIcon = icon.src.slice(expectedBase.length);
          if (!existsSync(resolve(DIST_DIR, relIcon))) {
            errors.push(`Manifest icon file missing in build output: ${relIcon}`);
          }
        }
      }
    } catch (err) {
      errors.push(`Failed to parse ${distManifest}: ${String(err)}`);
    }
  }

  // 3c. Validate emitted app-shell-only service worker (E7a)
  const distSw = resolve(DIST_DIR, 'sw.js');
  if (!existsSync(distSw)) {
    errors.push(`${distSw} is missing (E7a service worker required).`);
  } else {
    const swSrc = readFileSync(distSw, 'utf8');
    for (const sink of FORBIDDEN_SINKS) {
      if (sink.re.test(swSrc)) {
        errors.push(`Forbidden sink "${sink.name}" found in ${distSw}.`);
      }
    }
    if (/\bimportScripts\s*\(/.test(swSrc)) {
      errors.push(`importScripts() is forbidden in ${distSw}.`);
    }
    if (/\bcache\.put\s*\(/.test(swSrc)) {
      errors.push(`E7a service worker must not call cache.put() at runtime in ${distSw}.`);
    }
    if (!/var CACHE_NAME = "edovita-shell-v[0-9A-Za-z._-]+-[0-9a-f]{12}";/.test(swSrc)) {
      errors.push(`${distSw} must define a versioned edovita-shell-* CACHE_NAME.`);
    }
    const pathsMatch = swSrc.match(/var SHELL_PATHS = (\[[\s\S]*?\]);/);
    if (!pathsMatch) {
      errors.push(`${distSw} must define SHELL_PATHS.`);
    } else {
      try {
        const shellPaths = JSON.parse(pathsMatch[1]);
        if (!Array.isArray(shellPaths) || shellPaths.length < 4) {
          errors.push(`${distSw} SHELL_PATHS must contain the built HTML/JS/CSS app shell.`);
        } else {
          for (const entry of shellPaths) {
            if (typeof entry !== 'string' || !entry.startsWith(expectedBase)) {
              errors.push(`${distSw} SHELL_PATHS entry "${entry}" must start with "${expectedBase}".`);
            }
            if (/\.(?:webp|png|jpe?g|gif|svg|ico|avif|json|webmanifest)$/i.test(entry)) {
              errors.push(`${distSw} SHELL_PATHS must not precache images or data files in E7a: "${entry}".`);
            }
          }
        }
      } catch (err) {
        errors.push(`Failed to parse SHELL_PATHS in ${distSw}: ${String(err)}`);
      }
    }
  }
} else if (IS_PAGES) {
  errors.push(`${distIndex} fehlt (Pages-Build erwartet).`);
}

// 4. Supply-Chain-Regeln (.npmrc & pnpm-workspace.yaml) prüfen
const npmrcPath = resolve(ROOT, '.npmrc');
if (!existsSync(npmrcPath)) {
  errors.push('.npmrc fehlt (muss ignore-scripts=true enthalten).');
} else {
  const npmrcActiveLines = readFileSync(npmrcPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
  if (!npmrcActiveLines.some((line) => /^ignore-scripts\s*=\s*true$/.test(line))) {
    errors.push('.npmrc muss ignore-scripts=true enthalten (CA-3).');
  }
  if (npmrcActiveLines.some((line) => /shamefully-hoist/i.test(line))) {
    errors.push('.npmrc darf kein shamefully-hoist enthalten.');
  }
}

const wsPath = resolve(ROOT, 'pnpm-workspace.yaml');
if (!existsSync(wsPath)) {
  errors.push('pnpm-workspace.yaml fehlt.');
} else {
  const ws = readFileSync(wsPath, 'utf8');
  const match = ws.match(/^minimumReleaseAge:\s*(\d+)/m);
  if (!match || Number(match[1]) < 5760) {
    errors.push('pnpm-workspace.yaml muss minimumReleaseAge >= 5760 (4 Tage) setzen.');
  }
}

// 5. Kein package-lock.json im Repo (Regel «nur pnpm»)
if (existsSync(resolve(ROOT, 'package-lock.json'))) {
  errors.push('package-lock.json darf nicht vorhanden sein (Regel «nur pnpm»).');
}

if (errors.length > 0) {
  console.error('SICHERHEITSPRÜFUNG FEHLGESCHLAGEN:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('ERGEBNIS: Sicherheitsprüfung (Senken, CSP, Supply-Chain-Regeln) OK.');
