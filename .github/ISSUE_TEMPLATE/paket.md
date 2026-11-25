---
name: Arbeitspaket (Definition of Ready)
about: Vollständige Spezifikation eines Edovita-Pakets für Agents ohne Raten und Rückfragen
title: "E<Nr>: <Kurztitel>"
labels: []
---

## Ziel
<1–3 Sätze: fachliches Ziel und erwartetes Verhalten.>

- **Prototyp-Referenz:** Branch `prototype/lang-switcher`, Commit `<SHA>` (`v5.x`)
  - `<Datei>` › `<Symbole / Selektoren>`
- **Architektur-Referenz:** `ADR-001`..`ADR-006`, `docs/architektur/bausteine.md`, `docs/architektur/testplan.md`
- **Voraussetzungen:** #<Nr>
- **Schicht:** `src/...`, `content/...`

## Nicht-Ziele (bewusst nicht in diesem Issue)
- <Was explizit nicht vorgezogen wird>

## Umfang
1. <Konkreter Umsetzungsbaustein>

## UI-Texte in allen 7 Locales
- Neue/geänderte Schlüssel (`content/locales/{de,en,fr,it,es,ja,pt}/ui.json`): `<liste>`
- Hinweis: 0 ungenutzte Schlüssel (`content:check`), kein stiller EN-Fallback bei fehlenden Übersetzungen.

## Datenmodell & Dexie-Migration
- Typen / Schemas (`src/domain/`): `<Felder, Grenzen, coerce*>`
- Dexie-Version: `<vX → vY, Upgrade-Pfad, Migrationstest>`

## Randfälle & Fehlerzustände
- <Leere/ungültige Daten, Quota/IndexedDB-Fehler (G1), Transaktionen (G2), Abbrechen/Escape>

## Barrierefreiheit
- Tastaturbedienung, Dialog-Rollen & Fokus-Rückkehr, `aria-live`, Touch-Ziele ≥ 44 px, logische CSS-Eigenschaften & RTL (`ar-XB`).

## Akzeptanzkriterien
- [ ] <Messbares Verhalten 1>
- [ ] <Hell/Dunkel 390×844, 360×844, 1280×800 und RTL ar-XB ohne Überlauf / CSP-Fehler>

## Sicherheit
- <Whitelists, UNSAFE_TEXT_RE, hasForbiddenOwnKey, kein innerHTML, CSP unverändert, keine G-Daten>

## Tests & lokale Prüfbefehle
- **Rstest:** <Unit-, Vertrags-, Migrations- und Negativtests>
- **Playwright (E2E):** <Journeys, Viewports, `--workers=1`>
- **Pflichtbefehle:** `pnpm install --frozen-lockfile --ignore-scripts`, `content:build`, `lint`, `test:arch`, `content:check`, `test`, `build` + `GITHUB_PAGES=true PAGES_DIST=dist-pages pnpm run build`, `security:check` (beide Builds), `pnpm audit --audit-level=moderate`, `pnpm peers check`, `test:e2e`, `gitleaks`, `actionlint`.

## Abhängigkeiten & Reihenfolge
- Braucht: #<Nr>. Danach: #<Nr>.
- **Reihenfolge:** <Aktuelle verbindliche Paket-Kette>

## Regeln & Definition of Done
- Eigener Branch ab `main`, Draft-PR, kein Selbst-Merge (erst Stabschef-Ok + Ja des Projektinhabers).
- Schutzliste: `.github/workflows/`, `.npmrc`, `pnpm-workspace.yaml`, `tsconfig.json`, `eslint.config.mjs`, `.dependency-cruiser.mjs`, `playwright.config.ts`, `rsbuild.config.ts`, `package.json`/`pnpm-lock.yaml`, Rstest `0.12.6`, `prototype/` unverändert.
- Doku-Regel (25.11.): In Doku-Dateien (`STATUS.md`, `SECURITY.md` usw.) nur Basis-Commit und Prototyp-Commit nennen, niemals eigenen PR-Head-SHA oder eigene CI-Run-IDs. Head-SHA und exakte Testzahlen gehören in den PR-Text.
- Keine personenbezogenen Daten, Vornamen, lokalen Pfade oder Geheimnisse.
