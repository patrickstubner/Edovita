# ARCHITECTURE.md – Edovita

Stand 22.11.2026, `main` enthält E0 (`7f49e3d`, Version `0.1.0`) und E0b Pages (`e7d46884`). Die lokale Analyse von E0 (codebase-memory, Leitplanken, Tests, gitleaks) bezieht sich auf den Code-Stand `9e45e9e9688d33e781d03d3b8e722b0af55f68d6` (letzter Vor-Squash-Head von PR #15: `50e3739086ac488911c26aa30606d505becab2be`). Das Grundgerüst (Phase 1) steht mit allen Schicht- und Sicherheitsleitplanken; Details in `docs/architektur/`. Vorschau: https://patrickstubner.github.io/Edovita/.

## Heute im Repo
| Ort | Inhalt |
|---|---|
| `src/` | Produktiv-Grundgerüst (E0): React 19, TypeScript (strict), Rsbuild, `createHashRouter`, `Screen`/`BottomActions`, Theme (System/Hell/Dunkel, `#0B7F6B`), SVG-Icon-Sprite, leere Dienst-Einstiege für E1–E7 |
| `content/` | Zielordner für geprüfte Inhalte (Übernahme aus `docs/architektur/inhalte/` ab E1/E2) |
| `public/` | `_headers` mit strikter CSP (`connect-src 'self'`; auf GitHub Pages zusätzlich als CSP-Meta-Tag, ohne `frame-ancestors`), `theme-init.js` (ohne Inline-Skript), finale Logo-SVGs |
| `tests/`, `scripts/` | Rstest `0.12.6` (ADR-006), Testing Library, `fake-indexeddb`, Playwright (`390×844`, Hell/Dunkel + CSP-Header), ADR-001-Negativtests (`test-arch-guard.mjs`), `security-check.mjs` |
| `.github/` | Hardened CI-Workflow (SHA-gepinnt, Lint, Tests, Build, Audit, `gitleaks 8.30.1`), Pages-Deploy (`deploy-pages.yml`, nur nach Merge auf `main`) und Dependabot (4-Tage-Cooldown) |
| `SECURITY.md` | Sicherheitsmodell und laufende Sicherheitsprüfungen der App |
| `README.md` | Überblick, lokaler Start mit `pnpm`, Einstieg für Agents (Cursor, Antigravity) |
| `prototype/` | Klick-Prototyp v5.4.1: HTML/CSS/Vanilla-JS, 37 Screens, 7 Sprachen. Eingefrorene Design-Referenz (nicht anfassen). |
| `design/` | Design- und Produktvorgaben: `logos/`, `brief/`, `sounds/favoriten/` |
| `docs/architektur/` | Review, `inhalte/` (Startinhalte), ADR-001 bis ADR-006, Bausteine, Testplan, Pakete E0–E7, Ablaufplan, historische Sicherheitsprüfung |

## Schichtstruktur (ADR-001, durchgesetzt per `dependency-cruiser` & ESLint)
```
src/
  pages/        Routen, dünne Komposition (HomePage, StatusPage; ab E4 RecipeDetailPage, ShoppingListPage …)
  components/   reine Darstellung (Screen, BottomActions, Icon, IconSprite)
  hooks/        React-Bausteine (useTheme; ab E4 useRecipe, useServings, useShoppingList, useSecondLang …)
  app/          Provider pro Bereich (ThemeProvider), Router (createHashRouter), Shell, Tokens
  storage/      Repository-Schnittstellen, Dexie- und Memory-Implementierungen, Migrationen (E3)
  catalog/      Rezepte, Lebensmittel, Glossare lesen (E1)
  i18n/         i18next, Registry, Intl-Formatierer (E2)
  nutrition/    Portionen, Nährwertsummen, Einheiten (E1)
  health/       Schutzregeln, reine Funktionen (Onboarding)
  pwa/          Service Worker, Update-Hinweis (E7)
  domain/       Typen, IDs, Whitelist-Normalisierung, zod-Schemas; importiert nichts aus src/
content/        nur Daten (Rezepte, Lebensmittel, Glossare, Locales)
```

## Datenfluss (Ziel)
- **Inhalte:** `content/` → Build-Prüfung (`content:check`, zod) → typisierter Index → `catalog/` → Hooks → Seiten.
- **Nutzerdaten:** Seiten → Hooks → Provider pro Bereich → `*Repository` (Dexie, Tests mit Memory). Beim Lesen `coerce*()` (Whitelist).
- **Einkaufsliste:** Rezept-Detail → `addRecipe(list, recipe, servings)` → `ShoppingRepository`. Teilen nur Lebensmittel-IDs, Mengen, Zustände.
- **Kein Netzwerk** ausser eigenen statischen Dateien (CSP `connect-src 'self'`).

## Datenmodell und Speicherung
Siehe `docs/architektur/adr/ADR-002-datenmodell-und-speicherung.md`: `Food`, `Recipe`, `ShoppingItem` (Zustände open/cart/home), `Settings` mit `secondLang`; Export-Bundle `format: 1`.

## Entscheide
ADR-001 Schichten, ADR-002 Datenmodell und Dexie, ADR-003 Sprachen und Zweitsprache, ADR-004 Gesundheitsdaten und Datenschutz, ADR-005 Rezeptinhalte (akzeptiert 15.11.2026), ADR-006 Rstest als Testrunner (akzeptiert 22.11.2026).
