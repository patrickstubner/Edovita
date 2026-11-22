import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { isCatalogIndexUpToDate } from './build-content-index.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const contentDir = resolve(ROOT, 'content');
const RSTEST_BIN = resolve(ROOT, 'node_modules/.bin/rstest');

if (!existsSync(contentDir)) {
  console.error('FEHLER: content/-Ordner fehlt (ADR-001).');
  process.exit(1);
}

// 1. Typisierten Inhalts-Index auf Aktualität prüfen
if (!isCatalogIndexUpToDate()) {
  console.error(
    'FEHLER: content/generated/catalog-index.ts ist nicht aktuell. Bitte `pnpm run content:build` ausführen.',
  );
  process.exit(1);
}

// 2. Vollständige Inhaltsprüfung (Port von validate.py + Negativtests) via Rstest ausführen
try {
  execFileSync(RSTEST_BIN, ['run', 'tests/unit/content.check.test.ts'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
} catch {
  process.exit(1);
}

console.log('ERGEBNIS: content:check (E1) inklusive typisiertem Index und Negativtests OK.');
