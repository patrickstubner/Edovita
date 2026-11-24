# ARCHITECTURE.md – Edovita

Stand 23.11.2026, Basis `main` `1ef9b440ede335c51429ed294f55f15fdf87b124` (enthält E0 `7f49e3d`, E0b Pages `e7d46884`, Nachzug `#23` `a6c47cb3`, E1 PR `#24` `bd3e0246`, Dependabot/TS 6 `e0c7cadf`, E2 PR `#26` `f7dcd628` und E3 PR `#27` `1ef9b440`, Version `0.1.0`), erweitert um Paket **E4** (Issue `#10`, Branch `feat/e4-recipes`, inkl. Nachzüge F3b, G1, G2, H1). Der E4-Analyse-SHA wird im Folge-Commit nach grüner CI ergänzt (E3-Referenzstand: `79cdf5dfd60c9bf97ba6c51208c5f02e3390cfa3`). Details in `docs/architektur/`. Vorschau: https://patrickstubner.github.io/Edovita/.

## Heute im Repo
| Ort | Inhalt |
|---|---|
| `src/` | Produktiv-Basis (E0–E4): React 19, TypeScript 6 (strict), Rsbuild, `createHashRouter` (`#/`, `#/rezepte`, `#/rezept/:id`, `#/status`), `Screen`/`BottomActions`, Rezeptliste & Rezept-Detailseite (`RecipeCard`, `RecipeHeader`, `ServingsStepper`, `IngredientList`, `StepList`, `NutritionPanel`, `Stars`, `SaveButton`, `Toast`), getrennte Bereichs-Provider (`SettingsProvider`, `I18nProvider` mit H1-`uiLang`-Sync, `ThemeProvider`, `ShoppingProvider`, `RatingsProvider` mit G1-Fehlerbehandlung), `src/storage` (`EdovitaDb` Dexie v1, transaktionales `importAll` G2, `Dexie*` & `Memory*`), `src/i18n`, `src/domain` (inkl. F3b `isSafeHttpsUrl`/`sanitizeExternalHttpsUrl` ohne Userinfo und `mergeRecipeIntoShoppingList`), `src/catalog`, `src/nutrition` sowie Einstiege für E5–E7 |
| `content/` | Geprüfte Inhalte (E1 + E2 + E4): `foods/foods.json` (55 Lebensmittel, CH-NWD V7.1), `foods/glossary/{de,en,pt,ja}.json`, 5 Rezepte unter `recipes/<id>/{recipe,de,en}.json`, Sprach-Registry `locales/languages.json`, 7 UI-Locales `locales/{de,en,fr,it,es,ja,pt}/ui.json` (inkl. Rezeptliste, Rezept-Detail, Allergene, Nährwerte & generische Speicher-Meldungen) sowie typisierte Indizes `generated/catalog-index.ts` und `generated/locales-index.ts` |
| `public/` | `_headers` mit strikter CSP (`connect-src 'self'`; auf GitHub Pages zusätzlich als CSP-Meta-Tag, ohne `frame-ancestors`), `theme-init.js` (ohne Inline-Skript), finale Logo-SVGs |
| `tests/`, `scripts/` | Rstest `0.12.6` (ADR-006), Testing Library, `fake-indexeddb`, Repository-Vertragstests (`Memory*` & `Dexie*`), Dexie-Transaktions-Rollback-Test (G2), G1-/H1-/F3b-/E4-Komponententests, Inhalts- & Sprachprüfungen (`content.check.test.ts`, `languages.complete.test.ts`), Playwright (`390×844` Hell/Dunkel + Desktop, i18n/J6, Rezept-Journey J1 bis Toast, CSP-Header), `build-content-index.mjs`, ADR-001-Negativtests (`test-arch-guard.mjs`), `security-check.mjs` |
| `.github/` | Hardened CI-Workflow (SHA-gepinnt, Lint, Tests, Build, Audit, `gitleaks 8.30.1`), Pages-Deploy (`deploy-pages.yml`, nur nach grüner `push`-CI auf `main` des eigenen Repos) und Dependabot (4-Tage-Cooldown) |
| `SECURITY.md` | Sicherheitsmodell und laufende Sicherheitsprüfungen der App |
| `README.md` | Überblick, lokaler Start mit `pnpm`, Einstieg für Agents (Cursor, Antigravity) |
| `prototype/` | Klick-Prototyp v5.4.1: HTML/CSS/Vanilla-JS, 37 Screens, 7 Sprachen. Eingefrorene Design-Referenz (nicht anfassen). |
| `design/` | Design- und Produktvorgaben: `logos/`, `brief/`, `sounds/favoriten/` |
| `docs/architektur/` | Review, `inhalte/` (Startinhalte inkl. CH-NWD V7.1 Quelldatei), ADR-001 bis ADR-006, Bausteine, Testplan, Pakete E0–E7, Ablaufplan, historische Sicherheitsprüfung |

## Schichtstruktur (ADR-001, durchgesetzt per `dependency-cruiser` & ESLint)
```
src/
  pages/        Routen, dünne Komposition (HomePage, RecipesPage `#/rezepte`, RecipeDetailPage `#/rezept/:id`, StatusPage; ab E5 ShoppingListPage …)
  components/   reine Darstellung (Screen, BottomActions, Icon, IconSprite, RecipeCard, RecipeHeader, ServingsStepper, IngredientList, StepList, NutritionPanel, Stars, SaveButton, Toast)
  hooks/        React-Bausteine (useTheme, useI18n, useSettings, useShopping, useRatings, useRecipes, useRecipe, useServings; ab E5/E6 useShoppingList, useSecondLang …)
  app/          Provider pro Bereich (SettingsProvider, I18nProvider mit H1-Sync, ThemeProvider, ShoppingProvider, RatingsProvider mit G1-Fehlerbehandlung), Shell (generischer Fehler-Banner), Router, Tokens
  storage/      Repository-Schnittstellen, Dexie- (`EdovitaDb` v1 + Migrationen) und Memory-Implementierungen, transaktionales `importAll` (G2), Export (`format: 1`), `wipeAll`, `coerceSettings` (ohne React)
  catalog/      Rezepte, Lebensmittel, Glossare (`Object.hasOwn`), Filter/Ranking (E1 aktiv)
  i18n/         i18next + i18next-icu, Registry mit Rechts-Gate (F1/F3a), Gerätesprache, Intl-Formatierer, Label-Maps, Locale-Prüfung (ohne React)
  nutrition/    Portionsskalierung (`scaleIngredients`), Nährwertsummen (`nutrientsPerServing`, `nutrientsForServings`) (E1 aktiv)
  health/       Schutzregeln, reine Funktionen (Onboarding)
  pwa/          Service Worker, Update-Hinweis (E7)
  domain/       Typen, Branded IDs, Whitelist-Normalisierung (`coerce*`), Registry-gebundene `zod`-Schemas (`jitless: true`, `httpsUrlSchema`/`isSafeHttpsUrl`/`sanitizeExternalHttpsUrl` F3b), `mergeRecipeIntoShoppingList`, `parseShopImport`, `validateContentBundle`; importiert nichts aus anderen `src/`-Ordnern
content/        nur Daten (Rezepte, Lebensmittel, Glossare, Locales, generierte Indizes unter `generated/`)
```

## Datenfluss (aktiv ab E1–E4 / Ziel)
- **Inhalte & Sprachen (aktiv ab E1/E2):** `content/{foods,recipes,locales}` → `pnpm run content:build` (`catalog-index.ts`, `locales-index.ts`) & `pnpm run content:check` (`zod`, Nährwerte/Allergene/xlsx-SHA-256, Schlüssel/ICU-Platzhalter/Glossare) → `src/catalog/`, `src/nutrition/`, `src/i18n/` → Provider/Hooks → Seiten.
- **Rezepte & Detail (aktiv ab E4):** `RecipesPage` (`useRecipes` + `rankRecipes`) → `RecipeCard` → `RecipeDetailPage` (`useRecipe`, `useServings`) → `ServingsStepper` (1–12), `IngredientList` (Allergene inkl. «Kann enthalten»), `StepList` (nur App-Sprache), `NutritionPanel` (CH-NWD V7.1 + F3b sichere `review.sources`) → `BottomActions` «Zur Einkaufsliste hinzufügen» (`mergeRecipeIntoShoppingList` → `ShoppingProvider` + Undo-Toast).
- **Nutzerdaten (aktiv ab E3/E4):** Seiten → Hooks → getrennte Provider pro Bereich (`SettingsProvider` ↔ `I18nProvider` H1-Sync, `ShoppingProvider`, `RatingsProvider`, G1-Fehlerbehandlung ohne Rohdaten/Stacks) → `*Repository` (Dexie/IndexedDB, Tests mit Memory). Beim Lesen `coerce*()` (Whitelist); Export/Import atomar über `format: 1` (Dexie-Transaktion G2) und «Alles löschen» (`wipeAll`).
- **Kein Netzwerk** ausser eigenen statischen Dateien (CSP `connect-src 'self'`).

## Datenmodell und Speicherung
Siehe `docs/architektur/adr/ADR-002-datenmodell-und-speicherung.md`: `Food`, `Recipe`, `ShoppingItem` (Zustände open/cart/home), `Settings` mit `secondLang`; Export-Bundle `format: 1`.

## Entscheide
ADR-001 Schichten, ADR-002 Datenmodell und Dexie, ADR-003 Sprachen und Zweitsprache, ADR-004 Gesundheitsdaten und Datenschutz, ADR-005 Rezeptinhalte (akzeptiert 15.11.2026), ADR-006 Rstest als Testrunner (akzeptiert 22.11.2026).
