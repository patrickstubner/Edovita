# ARCHITECTURE.md – Edovita

Stand 23.11.2026, Basis `main` `f7dcd628a8655690739dea644443a36319fbe4be` (enthält E0 `7f49e3d`, E0b Pages `e7d46884`, Nachzug `#23` `a6c47cb3`, E1 PR `#24` `bd3e0246`, Dependabot/TS 6 `e0c7cadf` und E2 PR `#26` `f7dcd628`, Version `0.1.0`), erweitert um Paket **E3** (Issue `#9`, Branch `feat/e3-storage-dexie`, inkl. E2-Nachzüge F1, F2, F3a). Der E3-Analyse-SHA wird im Folge-Commit nach grüner CI ergänzt (E2-Referenzstand: `797033297b658485d7dedfc360058674ea28177b`). Details in `docs/architektur/`. Vorschau: https://patrickstubner.github.io/Edovita/.

## Heute im Repo
| Ort | Inhalt |
|---|---|
| `src/` | Produktiv-Basis (E0–E3): React 19, TypeScript 6 (strict), Rsbuild, `createHashRouter`, `Screen`/`BottomActions`, getrennte Bereichs-Provider (`I18nProvider`, `ThemeProvider`, `SettingsProvider`, `ShoppingProvider`, `RatingsProvider` mit Repository-Injektion), `src/storage` (`EdovitaDb` Dexie v1 + Migrations-Gerüst, `Dexie*Repository` & `Memory*Repository`, `coerceSettings`, `exportAll`/`importAll`/`wipeAll`), `src/i18n` (`i18next` + `i18next-icu`, Registry-abgeleitete `SUPPORTED_UI_LANGS`/`SECONDARY_LANGS`, Rechts-Gate, `Intl`-Formatierer), `src/domain` (Typen, `zod`-Schemas inkl. `createSettingsSchema`/`createExportBundleV1Schema` F1/F3a, `httpsUrlSchema`, `coerce*`, `parseShopImport`, `validateContentBundle`), `src/catalog`, `src/nutrition` sowie Einstiege für E4–E7 |
| `content/` | Geprüfte Inhalte (E1 + E2): `foods/foods.json` (55 Lebensmittel, CH-NWD V7.1), `foods/glossary/{de,en,pt,ja}.json`, 5 Rezepte unter `recipes/<id>/{recipe,de,en}.json`, Sprach-Registry `locales/languages.json`, 7 UI-Locales `locales/{de,en,fr,it,es,ja,pt}/ui.json` sowie typisierte Indizes `generated/catalog-index.ts` und `generated/locales-index.ts` |
| `public/` | `_headers` mit strikter CSP (`connect-src 'self'`; auf GitHub Pages zusätzlich als CSP-Meta-Tag, ohne `frame-ancestors`), `theme-init.js` (ohne Inline-Skript), finale Logo-SVGs |
| `tests/`, `scripts/` | Rstest `0.12.6` (ADR-006), Testing Library, `fake-indexeddb`, Repository-Vertragstests (`Memory*` & `Dexie*`), Migrations-/Export-/Import-/Wipe-Tests, Inhalts- & Sprachprüfungen (`content.check.test.ts`, `languages.complete.test.ts`), Playwright (`390×844`, Hell/Dunkel, i18n/J6 + CSP-Header), `build-content-index.mjs`, ADR-001-Negativtests (`test-arch-guard.mjs`, 4 Regeln inkl. `content-only-domain`), `security-check.mjs` |
| `.github/` | Hardened CI-Workflow (SHA-gepinnt, Lint, Tests, Build, Audit, `gitleaks 8.30.1`), Pages-Deploy (`deploy-pages.yml`, nur nach grüner `push`-CI auf `main` des eigenen Repos) und Dependabot (4-Tage-Cooldown) |
| `SECURITY.md` | Sicherheitsmodell und laufende Sicherheitsprüfungen der App |
| `README.md` | Überblick, lokaler Start mit `pnpm`, Einstieg für Agents (Cursor, Antigravity) |
| `prototype/` | Klick-Prototyp v5.4.1: HTML/CSS/Vanilla-JS, 37 Screens, 7 Sprachen. Eingefrorene Design-Referenz (nicht anfassen). |
| `design/` | Design- und Produktvorgaben: `logos/`, `brief/`, `sounds/favoriten/` |
| `docs/architektur/` | Review, `inhalte/` (Startinhalte inkl. CH-NWD V7.1 Quelldatei), ADR-001 bis ADR-006, Bausteine, Testplan, Pakete E0–E7, Ablaufplan, historische Sicherheitsprüfung |

## Schichtstruktur (ADR-001, durchgesetzt per `dependency-cruiser` & ESLint)
```
src/
  pages/        Routen, dünne Komposition (HomePage mit Sprachwahl/Theme, StatusPage; ab E4 RecipeDetailPage, ShoppingListPage …)
  components/   reine Darstellung (Screen, BottomActions, Icon, IconSprite)
  hooks/        React-Bausteine (useTheme, useI18n, useSettings, useShopping, useRatings; ab E4 useRecipe, useServings, useSecondLang …)
  app/          Provider pro Bereich (I18nProvider, ThemeProvider, SettingsProvider, ShoppingProvider, RatingsProvider), Router, Shell, Tokens
  storage/      Repository-Schnittstellen, Dexie- (`EdovitaDb` v1 + Migrationen) und Memory-Implementierungen, Export/Import (`format: 1`), `wipeAll`, `coerceSettings` (E3 aktiv, ohne React)
  catalog/      Rezepte, Lebensmittel, Glossare (`Object.hasOwn`), Filter/Ranking (E1 aktiv)
  i18n/         i18next + i18next-icu, Registry mit Rechts-Gate (F1/F3a), Gerätesprache, Intl-Formatierer, Locale-Prüfung (E2 aktiv, ohne React)
  nutrition/    Portionsskalierung (`scaleIngredients`), Nährwertsummen (`nutrientsPerServing`, `nutrientsForServings`) (E1 aktiv)
  health/       Schutzregeln, reine Funktionen (Onboarding)
  pwa/          Service Worker, Update-Hinweis (E7)
  domain/       Typen, Branded IDs, Whitelist-Normalisierung (`coerceThemePreference`, `coerceUiLang`, `coerceSecondLang`, `coerceSettings`, `coerceShoppingItem`, `coerceRating`), Registry-gebundene `zod`-Schemas (`jitless: true`, `httpsUrlSchema`), `parseShopImport`, `validateContentBundle`; importiert nichts aus anderen `src/`-Ordnern (E1–E3 aktiv)
content/        nur Daten (Rezepte, Lebensmittel, Glossare, Locales, generierte Indizes unter `generated/`)
```

## Datenfluss (aktiv ab E1–E3 / Ziel)
- **Inhalte & Sprachen (aktiv ab E1/E2):** `content/{foods,recipes,locales}` → `pnpm run content:build` (`catalog-index.ts`, `locales-index.ts`) & `pnpm run content:check` (`zod`, Nährwerte/Allergene/xlsx-SHA-256, Schlüssel/ICU-Platzhalter/Glossare) → `src/catalog/`, `src/nutrition/`, `src/i18n/` → Provider/Hooks → Seiten.
- **Nutzerdaten (aktiv ab E3):** Seiten → Hooks → getrennte Provider pro Bereich (`SettingsProvider`, `ShoppingProvider`, `RatingsProvider`) → `*Repository` (Dexie/IndexedDB, Tests mit Memory). Beim Lesen `coerce*()` (Whitelist); Export/Import über `format: 1` (`zod`-validiert) und «Alles löschen» (`wipeAll`).
- **Einkaufsliste (Ziel ab E5; Speicher & Import-Parser aktiv ab E1/E3):** Rezept-Detail → `addRecipe(list, recipe, servings)` → `ShoppingRepository`. Teilen nur Lebensmittel-IDs, Mengen, Zustände (`parseShopImport`/`encodeShopImport` in `src/domain`).
- **Kein Netzwerk** ausser eigenen statischen Dateien (CSP `connect-src 'self'`).

## Datenmodell und Speicherung
Siehe `docs/architektur/adr/ADR-002-datenmodell-und-speicherung.md`: `Food`, `Recipe`, `ShoppingItem` (Zustände open/cart/home), `Settings` mit `secondLang`; Export-Bundle `format: 1`.

## Entscheide
ADR-001 Schichten, ADR-002 Datenmodell und Dexie, ADR-003 Sprachen und Zweitsprache, ADR-004 Gesundheitsdaten und Datenschutz, ADR-005 Rezeptinhalte (akzeptiert 15.11.2026), ADR-006 Rstest als Testrunner (akzeptiert 22.11.2026).
