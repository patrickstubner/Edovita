import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const DEPCRUISE_BIN = resolve(ROOT, 'node_modules/.bin/depcruise');

function runDepcruise() {
  try {
    const out = execFileSync(
      DEPCRUISE_BIN,
      ['src', 'content', '--config', '.dependency-cruiser.mjs'],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return { ok: true, output: out };
  } catch (err) {
    const stdout = err && typeof err === 'object' && 'stdout' in err ? String(err.stdout) : '';
    const stderr = err && typeof err === 'object' && 'stderr' in err ? String(err.stderr) : '';
    return { ok: false, output: `${stdout}\n${stderr}` };
  }
}

// 1. Positivprüfung: aktueller Code muss sauber sein.
const clean = runDepcruise();
if (!clean.ok) {
  console.error('FEHLER: dependency-cruiser meldet Verstösse im sauberen Code:\n', clean.output);
  process.exit(1);
}

// 2. Negativprüfungen: absichtlich falsche Importe MÜSSEN anschlagen (ADR-001).
const negativeCases = [
  {
    file: resolve(ROOT, 'src/domain/__arch_guard_test__.ts'),
    content: "export { STORAGE_LAYER_VERSION } from '../storage/index.ts';\n",
    expectedRule: 'domain-is-pure',
  },
  {
    file: resolve(ROOT, 'src/components/__arch_guard_test__.ts'),
    content: "export { STORAGE_LAYER_VERSION } from '../storage/index.ts';\n",
    expectedRule: 'components-allowed-imports',
  },
  {
    file: resolve(ROOT, 'src/pages/__arch_guard_test__.ts'),
    content: "export { STORAGE_LAYER_VERSION } from '../storage/index.ts';\n",
    expectedRule: 'pages-no-direct-storage-or-content',
  },
  {
    file: resolve(ROOT, 'content/generated/__arch_guard_test__.ts'),
    content: "export { STORAGE_LAYER_VERSION } from '../../src/storage/index.ts';\n",
    expectedRule: 'content-only-domain',
  },
];

for (const tc of negativeCases) {
  try {
    writeFileSync(tc.file, tc.content, 'utf8');
    const res = runDepcruise();
    if (res.ok) {
      console.error(`FEHLER: Negativtest für ${tc.expectedRule} wurde NICHT erkannt!`);
      process.exit(1);
    }
    if (!res.output.includes(tc.expectedRule)) {
      console.error(
        `FEHLER: Erwartete Regel "${tc.expectedRule}" nicht in Ausgabe gefunden:\n`,
        res.output,
      );
      process.exit(1);
    }
    console.log(`OK: Negativtest "${tc.expectedRule}" wie erwartet blockiert.`);
  } finally {
    rmSync(tc.file, { force: true });
  }
}

console.log('ERGEBNIS: Architektur-Leitplanken (ADR-001) inklusive Negativtests bestanden.');
