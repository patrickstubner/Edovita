import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = process.cwd();
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

// 1. Gefährliche DOM-/Ausführungs-Senken in src/ und public/ prüfen
const codeFiles = [
  ...walkFiles(resolve(ROOT, 'src'), new Set(['.ts', '.tsx', '.js', '.jsx'])),
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
if (!existsSync(headersPath)) {
  errors.push('public/_headers fehlt.');
} else {
  const headers = readFileSync(headersPath, 'utf8');
  if (!headers.includes('Content-Security-Policy:')) {
    errors.push('Content-Security-Policy fehlt in public/_headers.');
  }
  if (headers.includes('unsafe-inline') || headers.includes('unsafe-eval')) {
    errors.push('CSP in public/_headers darf kein unsafe-inline oder unsafe-eval enthalten.');
  }
  if (!headers.includes("connect-src 'self'")) {
    errors.push("CSP in public/_headers muss connect-src 'self' enthalten.");
  }
  if (!headers.includes("frame-ancestors 'none'")) {
    errors.push("CSP in public/_headers muss frame-ancestors 'none' enthalten.");
  }
  if (!headers.includes('X-Robots-Tag: noindex, nofollow, noarchive')) {
    errors.push('public/_headers muss X-Robots-Tag: noindex, nofollow, noarchive enthalten.');
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
}

// 3. Gebautes dist/index.html prüfen (falls Build bereits gelaufen ist): keine Inline-Skripte
const distIndex = resolve(ROOT, 'dist/index.html');
if (existsSync(distIndex)) {
  const html = readFileSync(distIndex, 'utf8');
  const scriptTags = html.match(/<script\b[^>]*>/gi) ?? [];
  for (const tag of scriptTags) {
    if (!/\bsrc\s*=/.test(tag)) {
      errors.push(`Inline-<script> ohne src= in dist/index.html gefunden: ${tag}`);
    }
  }
  if (/<style\b/i.test(html)) {
    errors.push('Inline-<style> in dist/index.html gefunden (verletzt strikte CSP).');
  }
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
