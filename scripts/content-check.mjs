import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const contentDir = resolve(ROOT, 'content');

if (!existsSync(contentDir)) {
  console.error('FEHLER: content/-Ordner fehlt (ADR-001).');
  process.exit(1);
}

console.log(
  'ERGEBNIS: content:check (E0-Basis) OK. Vollständige Katalog-/Rezept-/Glossar-Prüfung folgt in E1.',
);
