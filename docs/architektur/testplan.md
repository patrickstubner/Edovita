# Testplan

Unit- und Komponententests: Rstest mit `@rstest/adapter-rsbuild` (aktuell 0.12.6, noch vor 1.0; ADR-006), Testing Library, `fake-indexeddb` für Dexie-Tests. Journeys: Playwright (Handy-Viewport 390×844, hell und dunkel). Travel Talk und die anderen Repos bleiben bei Vitest. Jede PR: `pnpm test`, `pnpm run lint` (ESLint, Stylelint, dependency-cruiser), `pnpm run build`, `pnpm run content:check`, `pnpm audit`.

## Journeys (Playwright)

| # | Ablauf | Prüft |
|---|---|---|
| J1 | Rezepte → Kachel antippen → Detail → Portionen 2 → 4 → «Zur Einkaufsliste» → Einkauf | Mengen verdoppelt, Toast, Artikel in Gruppen, Hauptbutton immer sichtbar |
| J2 | Zwei Rezepte mit gleicher Zutat hinzufügen → eins entfernen | Mengen zusammengezählt und korrekt abgezogen |
| J3 | Einkauf: Artikel antippen (Korb) → «Hab ich»-Sheet («Alles vorhanden» / Verwerfen) → Neuladen → «Doch kaufen»-Sheet («Zurücksetzen») | drei Zustände, ⓘ-Herkunfts-Sheet (28/56/16 px, Tastatur/Escape, Fokus-Rückkehr, kein Abhaken), Zustand bleibt nach Neuladen |
| J4 | Zweitsprache PT über Umschalter in der Kopfzeile wählen → Rezept-Detail zeigt «Broccoli · brócolis» + Schritte nur Deutsch mit Hinweis, Einkaufsliste zweizeilig → Profil › Sprache / «Keine» → UI-Sprache = Zweitsprache → kein Zweitname | Zweitsprache-Regeln (Kopfzeilen-Umschalter, zweizeilige Liste, kein Rechts-Gate) |
| J5 | Zweitsprache `ar-XB` (Pseudo-RTL) | Zweitname rechts-nach-links isoliert (`<bdi dir="rtl">`), Layout nicht verschoben |
| J6 | UI-Sprache DE → EN im Profil, ohne Neustart | Liste und Portionen bleiben, Zahlen im neuen Format |
| J7 | QR-Fragment mit 41 Items / `<script>` im Namen / falschem `st` öffnen | abgelehnt mit Hinweis, nichts übernommen; gültiges Fragment → Bestätigungsdialog |
| J8 | Offline: App einmal laden, Netz aus, Rezepte und Liste bedienen | Service Worker liefert Shell und Inhalte |
| J9 | Einkauf Teilmenge: «Hab ich»-Sheet → Teilmenge per Stepper/Schieber → «Übernehmen» → Neuladen; Katalog-Artikel ohne ⓘ mit Teilmenge | Kaufmenge normal + Bedarf durchgestrichen, oranger «Teilweise»-Knopf (≥ 48×48), Screenreader «kaufen … von …», `qtyHave` persistent & nie in Share/QR |

## Unit- und Vertragstests

- `nutrition/scale`: Rundungsregeln je Einheit, 1–12 Portionen, `pc` mit halben Stücken, keine negativen Mengen.
- `nutrition/sum`: bekannte Rezepte gegen von Hand nachgerechnete Werte (Toleranz ±2 %).
- `shopping/merge` & `shopping/have` (v5.9): zusammenführen, entfernen (inkl. Deckelung von `qtyHave`), Zustand `home` bleibt, gleiche Zutat mit anderer Einheit getrennt, Teilmenge (`isPartialHave`/`isHaveAll`), Schrittweiten (`haveStepOf`/`snapHaveQty` für `g`/`ml`/`pc`/`tbsp`/`tsp`/`pinch`/`bottle`), Herkunfts-Summe, `qtyHave` nie in Share/QR.
- `i18n/secondLang` (E6): Orts-Standard (`America/Sao_Paulo`, `Asia/Tokyo`, `Europe/Zurich`, UI `en` ohne Treffer), dreiwertiges `secondLang` (`null`/`'none'`/Code), Automatik nie gespeichert, kein `navigator.geolocation`, neue Zweitsprache `xx` rein über Glossar + Registry ohne Codeänderung, fehlender Glossareintrag liefert `null`, Pseudo-RTL `ar-XB` nur im Testmodus.
- `catalog/recipes rankRecipes`: Vielfalt, Bewertung, Merkliste (Fälle aus Prototyp `rlist`).
- `health/*`: alle Grenzwerte aus Handoff §3 als Tabellentest, 100 % Zweigabdeckung.
- `domain/parseShopImport` & `coerceQtyHave`: alle Ablehnungsgründe (`format`, `size`, `count`, `id`, `name`, `schema`, `parse`), ungültige `qtyHave` (negativ, `NaN`, String, `1e9`) bereinigt und auf Bedarf gedeckelt.
- **Repository-Vertragstest:** dieselbe Testsuite läuft gegen `Memory*` und `Dexie*` (später `Sqlite*`).
- **Migrationstest:** pro Dexie-Version ein alter Datensatz → aktuelles Schema (inkl. v1 → v2 `qtyHave`).
- `coerceSettings`: unbekannte/ungültige Werte fallen auf Standard (Muster Travel Talk).

## Inhaltsprüfungen (`content:check`, auch in CI)

- `languages.complete.test.ts`: jede UI-Sprache hat alle Schlüssel und dieselben Platzhalter wie `en`, kein HTML; jede Zweitsprache hat alle `FoodId`.
- Jedes Rezept: Schema gültig, alle `FoodId` existieren, Texte in allen UI-Sprachen, `review.sources` ≥ 2, kcal/Portion 100–1'200, Allergene abgeleitet.
- Jedes Lebensmittel: `per100g` vollständig, Quelle (`CH-NWD` oder `USDA`) mit Referenz.
- Keine ungenutzten UI-Schlüssel (Warnung).

## Sicherheit pro PR (Dauerregel)

`pnpm audit` (keine hohen/kritischen), Secret-Scan, grep auf `dangerouslySetInnerHTML`/`innerHTML`/`eval`, CSP-Header-Test (Antwort der Vorschau), Ergebnis mit Schweregrad und Fix im PR und in der Meldung an den Projektinhaber.
