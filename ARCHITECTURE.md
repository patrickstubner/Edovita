# ARCHITECTURE.md – Edovita

Stand 24.11.2026, Basis `main` `3d1daef4a4d530039f2e111a781bc42e2a116afc` (enthält E0 `7f49e3d`, E0b Pages `e7d46884`, Nachzug `#23` `a6c47cb3`, E1 PR `#24` `bd3e0246`, Dependabot/TS 6 `e0c7cadf`, E2 PR `#26` `f7dcd628`, E3 PR `#27` `1ef9b440`, E4 PR `#28` `7dd734d4` und Kompakter Sprachumschalter/F1/F2 PR `#29` `3d1daef4`, Version `0.1.0`), erweitert um Paket **E5** (Issue `#11`, Draft-PR `#30`, Branch `feat/e5-shopping-list`: Einkaufsliste `#/einkauf` mit drei Zuständen, Rezept-Abzug, Katalog-Suche, Hausmarken, Teilen & sicherem QR-Import). Details in `docs/architektur/`. Vorschau: https://patrickstubner.github.io/Edovita/.

## Heute im Repo
| Ort | Inhalt |
|---|---|
| `src/` | Produktiv-Basis (E0–E5 + kompakter Sprachumschalter): React 19, TypeScript 6 (strict), Rsbuild, `createHashRouter` (`#/`, `#/profil/sprache`, `#/rezepte`, `#/rezept/:id`, `#/einkauf`, `#/status`), `Screen`/`BottomActions`, globaler kompakter UI-Sprachumschalter (`LangSwitcher`, `LangFlag`), ausführliche Sprachliste unter `#/profil/sprache`, Rezeptliste & Rezept-Detailseite (`RecipeCard`, `RecipeHeader`, `ServingsStepper`, `IngredientList`, `StepList`, `NutritionPanel`, `Stars`, `SaveButton`, `Toast`, sichtbare Übersetzungslücken F2), Einkaufsliste (`ShoppingListPage`, `ShopGroup`, `ShopRow`, `CatalogAddPanel`, `BrandsSheet`, `QrSheet`, `QrCodeSvg`, `QrImportDialog`), reiner Dienst `src/shopping/` (`addRecipe`, `removeRecipe`, `addCatalogItem`, `setState`, `clearDone`, `applyShopImport`, `groupItems`, `formatShareText`, `buildQrMatrix` via lokalem `qrcode-generator`, `STORE_BRANDS`), Hooks `useShoppingList` & `useShareList`, getrennte Bereichs-Provider (`SettingsProvider`, `I18nProvider` mit H1-`uiLang`-Sync, `ThemeProvider`, `ShoppingProvider`, `RatingsProvider` mit G1-Fehlerbehandlung), `src/storage`, `src/i18n`, `src/domain`, `src/catalog`, `src/nutrition` sowie Einstiege für E6–E7 |
| `content/` | Geprüfte Inhalte (E1 + E2 + E4 + Sprachumschalter + E5): `foods/foods.json` (55 Lebensmittel, CH-NWD V7.1), `foods/glossary/{de,en,pt,ja}.json`, 5 Rezepte unter `recipes/<id>/{recipe,de,en}.json`, Sprach-Registry `locales/languages.json` (inkl. `active` + `legalApproved`), 7 UI-Locales `locales/{de,en,fr,it,es,ja,pt}/ui.json` (inkl. Sprachumschalter, Rezeptliste, Rezept-Detail, Einkaufsliste, Hausmarken, QR-Import-Dialog, sichtbare Übersetzungslücken F2 & generische Speicher-Meldungen) sowie typisierte Indizes `generated/catalog-index.ts` und `generated/locales-index.ts` |
| `public/` | `_headers` mit strikter CSP (`connect-src 'self'`; auf GitHub Pages zusätzlich als CSP-Meta-Tag, ohne `frame-ancestors`), `theme-init.js` (ohne Inline-Skript), finale Logo-SVGs |
| `tests/`, `scripts/` | Rstest `0.12.6` (ADR-006), Testing Library, `fake-indexeddb`, Repository-Vertragstests (`Memory*` & `Dexie*`), Dexie-Transaktions-Rollback-Test (G2), `LangSwitcher`-, `shopping/merge`- & `ShoppingList`-Tests, G1-/H1-/F2-/F3b-/E4-Komponententests, Inhalts- & Sprachprüfungen (`content.check.test.ts`, `languages.complete.test.ts`), Playwright (`390×844` Hell/Dunkel + Desktop mit `--edo-app-h`-Wait F1, Sprachumschalter/Tastatur/Whitelist/RTL, Journeys J1, J2, J3, J6, J7, CSP-Header), `build-content-index.mjs`, ADR-001-Negativtests (`test-arch-guard.mjs`), `security-check.mjs` |
| `.github/` | Hardened CI-Workflow (SHA-gepinnt, Lint, Tests, Build, Audit, `gitleaks 8.30.1`), Pages-Deploy (`deploy-pages.yml`, nur nach grüner `push`-CI auf `main` des eigenen Repos) und Dependabot (4-Tage-Cooldown) |
| `SECURITY.md` | Sicherheitsmodell und laufende Sicherheitsprüfungen der App |
| `README.md` | Überblick, lokaler Start mit `pnpm`, Einstieg für Agents (Cursor, Antigravity) |
| `prototype/` | Klick-Prototyp v5.4.1: HTML/CSS/Vanilla-JS, 37 Screens, 7 Sprachen. Eingefrorene Design-Referenz (nicht anfassen). |
| `design/` | Design- und Produktvorgaben: `logos/`, `brief/`, `sounds/favoriten/` |
| `docs/architektur/` | Review, `inhalte/` (Startinhalte inkl. CH-NWD V7.1 Quelldatei), ADR-001 bis ADR-006, Bausteine, Testplan, Pakete E0–E7, Ablaufplan, historische Sicherheitsprüfung |

## Schichtstruktur (ADR-001, durchgesetzt per `dependency-cruiser` & ESLint)
```
src/
  pages/        Routen, dünne Komposition (HomePage, LanguageSettingsPage `#/profil/sprache`, RecipesPage `#/rezepte`, RecipeDetailPage `#/rezept/:id`, ShoppingListPage `#/einkauf`, StatusPage)
  components/   reine Darstellung (Screen, BottomActions, LangSwitcher, LangFlag, Icon, IconSprite, RecipeCard, RecipeHeader, ServingsStepper, IngredientList, StepList, NutritionPanel, ShopGroup, ShopRow, CatalogAddPanel, BrandsSheet, QrSheet, QrCodeSvg, QrImportDialog, Stars, SaveButton, Toast)
  hooks/        React-Bausteine (useTheme, useI18n, useSettings, useShopping, useShoppingList, useShareList, useRatings, useRecipes, useRecipe, useServings; ab E6 useSecondLang …)
  app/          Provider pro Bereich (SettingsProvider, I18nProvider mit H1-Sync, ThemeProvider, ShoppingProvider, RatingsProvider mit G1-Fehlerbehandlung), Shell (kompakter Sprachumschalter + generischer Fehler-Banner), Router, Tokens
  storage/      Repository-Schnittstellen, Dexie- (`EdovitaDb` v1 + Migrationen) und Memory-Implementierungen, transaktionales `importAll` (G2), Export (`format: 1`), `wipeAll`, `coerceSettings` (ohne React)
  catalog/      Rezepte, Lebensmittel, Glossare (`Object.hasOwn`), Filter/Ranking (E1 aktiv)
  i18n/         i18next + i18next-icu, Registry mit `active` + `legalApproved`-Rechts-Gate (F1/F3a), Gerätesprache, Intl-Formatierer, Label-Maps, Locale-Prüfung (ohne React)
  nutrition/    Portionsskalierung (`scaleIngredients`), Nährwertsummen (`nutrientsPerServing`, `nutrientsForServings`) (E1 aktiv)
  shopping/     reine Einkaufslisten-Logik (`addRecipe`, `removeRecipe`, `addCatalogItem`, `setState`, `clearDone`, `applyShopImport`, `groupItems`), Klartext-Teilen, lokale QR-SVG-Matrix (`qrcode-generator`), Hausmarken-Daten (E5 aktiv, ohne React)
  health/       Schutzregeln, reine Funktionen (Onboarding)
  pwa/          Service Worker, Update-Hinweis (E7)
  domain/       Typen, Branded IDs, Whitelist-Normalisierung (`coerce*`), Registry-gebundene `zod`-Schemas (`jitless: true`, `httpsUrlSchema`/`isSafeHttpsUrl`/`sanitizeExternalHttpsUrl` F3b), `mergeRecipeIntoShoppingList`, `parseShopImport`/`encodeShopImport`, `validateContentBundle`; importiert nichts aus anderen `src/`-Ordnern
content/        nur Daten (Rezepte, Lebensmittel, Glossare, Locales, generierte Indizes unter `generated/`)
```

## Datenfluss (aktiv ab E1–E5 / Ziel)
- **Inhalte & Sprachen (aktiv ab E1/E2 + Sprachumschalter):** `content/{foods,recipes,locales}` → `pnpm run content:build` (`catalog-index.ts`, `locales-index.ts`) & `pnpm run content:check` (`zod`, Nährwerte/Allergene/xlsx-SHA-256, Schlüssel/ICU-Platzhalter/Glossare) → `src/catalog/`, `src/nutrition/`, `src/i18n/` → Provider/Hooks → `Shell` (`LangSwitcher` für alle Screens, nur `active` + `legalApproved`) & Seiten (`#/profil/sprache` für ausführliche Sprachübersicht).
- **Rezepte & Detail (aktiv ab E4 + F2):** `RecipesPage` (`useRecipes` + `rankRecipes`) → `RecipeCard` → `RecipeDetailPage` (`useRecipe`, `useServings`, sichtbare Hinweise statt stillem EN-Fallback bei fehlenden Übersetzungen) → `ServingsStepper` (1–12), `IngredientList` (Allergene inkl. «Kann enthalten»), `StepList` (nur App-Sprache), `NutritionPanel` (CH-NWD V7.1 + F3b sichere `review.sources`) → `BottomActions` «Zur Einkaufsliste hinzufügen» (`mergeRecipeIntoShoppingList` mit `recipeAmounts` → `ShoppingProvider` + Undo-Toast) & «Einkaufsliste öffnen».
- **Einkaufsliste, Teilen & QR-Import (aktiv ab E5):** `ShoppingListPage` (`useShoppingList`, `useShareList`) → `src/shopping/` (`addRecipe`/`removeRecipe`/`setState`/`groupItems`, `formatShareText` ohne G-Daten, `buildQrMatrix` lokal als React-SVG) → `ShoppingProvider` → `DexieShoppingRepository`. Eingehende `#/einkauf#import=...`-Fragmente laufen strikt durch `parseShopImport` (Prototype-Key-, Längen-, Mengen-, ID-, Zeichen- & Zustands-Prüfung) und erfordern vor Übernahme den Bestätigungsdialog `QrImportDialog` (Ergänzen vs. Ersetzen).
- **Nutzerdaten (aktiv ab E3–E5):** Seiten → Hooks → getrennte Provider pro Bereich (`SettingsProvider` ↔ `I18nProvider` H1-Sync, `ShoppingProvider`, `RatingsProvider`, G1-Fehlerbehandlung ohne Rohdaten/Stacks) → `*Repository` (Dexie/IndexedDB, Tests mit Memory). Beim Lesen `coerce*()` (Whitelist); Export/Import atomar über `format: 1` (Dexie-Transaktion G2) und «Alles löschen» (`wipeAll`).
- **Kein Netzwerk** ausser eigenen statischen Dateien (CSP `connect-src 'self'`).

## Datenmodell und Speicherung
Siehe `docs/architektur/adr/ADR-002-datenmodell-und-speicherung.md`: `Food`, `Recipe`, `ShoppingItem` (Zustände open/cart/home), `Settings` mit `secondLang`; Export-Bundle `format: 1`.

## Entscheide
ADR-001 Schichten, ADR-002 Datenmodell und Dexie, ADR-003 Sprachen und Zweitsprache, ADR-004 Gesundheitsdaten und Datenschutz, ADR-005 Rezeptinhalte (akzeptiert 15.11.2026), ADR-006 Rstest als Testrunner (akzeptiert 22.11.2026).
