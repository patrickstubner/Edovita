# ARCHITECTURE.md – Edovita

Stand 23.11.2026, Basis `main` `bd3e0246d91066fd28ab381879cf28b7ff4410b9` (enthält E0 `7f49e3d`, E0b Pages `e7d46884`, Nachzug `#23` `a6c47cb3` und E1 PR `#24` `bd3e0246`, Version `0.1.0`). Die lokale Analyse von E1 (`codebase-memory-mcp`, Leitplanken, Rstest, Playwright, `gitleaks`, GitHub-CI-Run `45074835911`) bezieht sich auf den vor dem Merge geprüften Code-Stand `eb71c25a0bfc68c9cbb185f0ce45e9a9d5d453f1` (E0-Referenzstand: `9e45e9e9688d33e781d03d3b8e722b0af55f68d6`; von Stabschef freigegebener Head vor dem Squash-Merge: `691863e1d7e38071cc3561ad3ccd781fd156f2a9`). Details in `docs/architektur/`. Vorschau: https://patrickstubner.github.io/Edovita/.

## Heute im Repo
| Ort | Inhalt |
|---|---|
| `src/` | Produktiv-Basis (E0 + E1): React 19, TypeScript (strict), Rsbuild, `createHashRouter`, `Screen`/`BottomActions`, Theme (System/Hell/Dunkel, `#0B7F6B`), SVG-Icon-Sprite, `src/domain` (Typen, `zod`-Schemas, `parseShopImport`, `validateContentBundle`), `src/catalog` (Lebensmittel, Glossare, Rezepte, Filter/Ranking), `src/nutrition` (Portionsskalierung, Nährwertsummen), Basis-`src/i18n` (`de/ui.json`) sowie Einstiege für E2–E7 |
| `content/` | Geprüfte Inhalte (E1): `foods/foods.json` (55 Lebensmittel, CH-NWD V7.1), `foods/glossary/{de,en,pt,ja}.json`, 5 Rezepte unter `recipes/<id>/{recipe,de,en}.json`, typisierter Index `generated/catalog-index.ts`, sowie `locales/de/ui.json` (weitere Locales ab E2) |
| `public/` | `_headers` mit strikter CSP (`connect-src 'self'`; auf GitHub Pages zusätzlich als CSP-Meta-Tag, ohne `frame-ancestors`), `theme-init.js` (ohne Inline-Skript), finale Logo-SVGs |
| `tests/`, `scripts/` | Rstest `0.12.6` (ADR-006), Testing Library, `fake-indexeddb`, Inhaltsprüfung (`tests/unit/content.check.test.ts`, Port von `validate.py` inkl. xlsx-SHA-256 & Negativtests), Playwright (`390×844`, Hell/Dunkel + CSP-Header), `build-content-index.mjs`, ADR-001-Negativtests (`test-arch-guard.mjs`, 4 Regeln inkl. `content-only-domain`), `security-check.mjs` |
| `.github/` | Hardened CI-Workflow (SHA-gepinnt, Lint, Tests, Build, Audit, `gitleaks 8.30.1`), Pages-Deploy (`deploy-pages.yml`, nur nach grüner `push`-CI auf `main` des eigenen Repos) und Dependabot (4-Tage-Cooldown) |
| `SECURITY.md` | Sicherheitsmodell und laufende Sicherheitsprüfungen der App |
| `README.md` | Überblick, lokaler Start mit `pnpm`, Einstieg für Agents (Cursor, Antigravity) |
| `prototype/` | Klick-Prototyp v5.4.1: HTML/CSS/Vanilla-JS, 37 Screens, 7 Sprachen. Eingefrorene Design-Referenz (nicht anfassen). |
| `design/` | Design- und Produktvorgaben: `logos/`, `brief/`, `sounds/favoriten/` |
| `docs/architektur/` | Review, `inhalte/` (Startinhalte inkl. CH-NWD V7.1 Quelldatei), ADR-001 bis ADR-006, Bausteine, Testplan, Pakete E0–E7, Ablaufplan, historische Sicherheitsprüfung |

## Schichtstruktur (ADR-001, durchgesetzt per `dependency-cruiser` & ESLint)
```
src/
  pages/        Routen, dünne Komposition (HomePage, StatusPage; ab E4 RecipeDetailPage, ShoppingListPage …)
  components/   reine Darstellung (Screen, BottomActions, Icon, IconSprite)
  hooks/        React-Bausteine (useTheme; ab E4 useRecipe, useServings, useShoppingList, useSecondLang …)
  app/          Provider pro Bereich (ThemeProvider), Router (createHashRouter), Shell, Tokens
  storage/      Repository-Schnittstellen, Dexie- und Memory-Implementierungen, Migrationen (E3)
  catalog/      Rezepte, Lebensmittel, Glossare, Filter/Ranking (E1 aktiv)
  i18n/         Basis-Textzugriff (`locales/de/ui.json`); i18next, Registry, Intl-Formatierer (E2)
  nutrition/    Portionsskalierung (`scaleIngredients`), Nährwertsummen (`nutrientsPerServing`, `nutrientsForServings`) (E1 aktiv)
  health/       Schutzregeln, reine Funktionen (Onboarding)
  pwa/          Service Worker, Update-Hinweis (E7)
  domain/       Typen, Branded IDs, Whitelist-Normalisierung, `zod`-Schemas, `parseShopImport`, `validateContentBundle`; importiert nichts aus anderen `src/`-Ordnern (E1 aktiv)
content/        nur Daten (Rezepte, Lebensmittel, Glossare, Locales, generierter Index `generated/catalog-index.ts`)
```

## Datenfluss (aktiv ab E1 / Ziel)
- **Inhalte (aktiv ab E1):** `content/{foods,recipes}` → `pnpm run content:build` (`content/generated/catalog-index.ts`) & `pnpm run content:check` (`zod` + Nährwert-/Allergen-/Glossar-/xlsx-SHA-256-Prüfung) → `src/catalog/` & `src/nutrition/` → Hooks → Seiten.
- **Nutzerdaten (Ziel ab E3):** Seiten → Hooks → Provider pro Bereich → `*Repository` (Dexie, Tests mit Memory). Beim Lesen `coerce*()` (Whitelist).
- **Einkaufsliste (Ziel ab E5; Import-Parser aktiv ab E1):** Rezept-Detail → `addRecipe(list, recipe, servings)` → `ShoppingRepository`. Teilen nur Lebensmittel-IDs, Mengen, Zustände (`parseShopImport`/`encodeShopImport` in `src/domain`).
- **Kein Netzwerk** ausser eigenen statischen Dateien (CSP `connect-src 'self'`).

## Datenmodell und Speicherung
Siehe `docs/architektur/adr/ADR-002-datenmodell-und-speicherung.md`: `Food`, `Recipe`, `ShoppingItem` (Zustände open/cart/home), `Settings` mit `secondLang`; Export-Bundle `format: 1`.

## Entscheide
ADR-001 Schichten, ADR-002 Datenmodell und Dexie, ADR-003 Sprachen und Zweitsprache, ADR-004 Gesundheitsdaten und Datenschutz, ADR-005 Rezeptinhalte (akzeptiert 15.11.2026), ADR-006 Rstest als Testrunner (akzeptiert 22.11.2026).
