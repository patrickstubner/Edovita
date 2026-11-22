# Testplan

Unit- und Komponententests: Rstest mit `@rstest/adapter-rsbuild` (aktuell 0.12.6, noch vor 1.0; ADR-006), Testing Library, `fake-indexeddb` für Dexie-Tests. Journeys: Playwright (Handy-Viewport 390×844, hell und dunkel). Travel Talk und die anderen Repos bleiben bei Vitest. Jede PR: `pnpm test`, `pnpm run lint` (ESLint, Stylelint, dependency-cruiser), `pnpm run build`, `pnpm run content:check`, `pnpm audit`.

## Journeys (Playwright)

| # | Ablauf | Prüft |
|---|---|---|
| J1 | Rezepte → Kachel antippen → Detail → Portionen 2 → 4 → «Zur Einkaufsliste» → Einkauf | Mengen verdoppelt, Toast, Artikel in Gruppen, Hauptbutton immer sichtbar |
| J2 | Zwei Rezepte mit gleicher Zutat hinzufügen → eins entfernen | Mengen zusammengezählt und korrekt abgezogen |
| J3 | Einkauf: Artikel antippen (Korb) → «Hab ich» → «Rückgängig» → Neuladen | drei Zustände, Zustand bleibt nach Neuladen |
| J4 | Zweitsprache PT wählen → Liste und Rezept-Detail zeigen «Brokkoli · brócolis», Schritte nur Deutsch → Zweitsprache = App-Sprache → kein Zweitname | Zweitsprache-Regeln |
| J5 | Zweitsprache `ar-XB` (Pseudo-RTL) | Zweitname rechts-nach-links isoliert, Layout nicht verschoben (Screenshot-Vergleich) |
| J6 | UI-Sprache DE → EN im Profil, ohne Neustart | Liste und Portionen bleiben, Zahlen im neuen Format |
| J7 | QR-Fragment mit 41 Items / `<script>` im Namen / falschem `st` öffnen | abgelehnt mit Hinweis, nichts übernommen; gültiges Fragment → Bestätigungsdialog |
| J8 | Offline: App einmal laden, Netz aus, Rezepte und Liste bedienen | Service Worker liefert Shell und Inhalte |

## Unit- und Vertragstests

- `nutrition/scale`: Rundungsregeln je Einheit, 1–12 Portionen, `pc` mit halben Stücken, keine negativen Mengen.
- `nutrition/sum`: bekannte Rezepte gegen von Hand nachgerechnete Werte (Toleranz ±2 %).
- `shopping/merge`: zusammenführen, entfernen, Zustand `home` bleibt, gleiche Zutat mit anderer Einheit getrennt (oder über `gramsPer` umgerechnet).
- `catalog/recipes rankRecipes`: Vielfalt, Bewertung, Merkliste (Fälle aus Prototyp `rlist`).
- `health/*`: alle Grenzwerte aus Handoff §3 als Tabellentest, 100 % Zweigabdeckung.
- `domain/parseShopImport`: alle Ablehnungsgründe (`format`, `size`, `count`, `id`, `name`, `schema`, `parse`).
- **Repository-Vertragstest:** dieselbe Testsuite läuft gegen `Memory*` und `Dexie*` (später `Sqlite*`).
- **Migrationstest:** pro Dexie-Version ein alter Datensatz → aktuelles Schema.
- `coerceSettings`: unbekannte/ungültige Werte fallen auf Standard (Muster Travel Talk).

## Inhaltsprüfungen (`content:check`, auch in CI)

- `languages.complete.test.ts`: jede UI-Sprache hat alle Schlüssel und dieselben Platzhalter wie `en`, kein HTML; jede Zweitsprache hat alle `FoodId`.
- Jedes Rezept: Schema gültig, alle `FoodId` existieren, Texte in allen UI-Sprachen, `review.sources` ≥ 2, kcal/Portion 100–1'200, Allergene abgeleitet.
- Jedes Lebensmittel: `per100g` vollständig, Quelle (`CH-NWD` oder `USDA`) mit Referenz.
- Keine ungenutzten UI-Schlüssel (Warnung).

## Sicherheit pro PR (Dauerregel)

`pnpm audit` (keine hohen/kritischen), Secret-Scan, grep auf `dangerouslySetInnerHTML`/`innerHTML`/`eval`, CSP-Header-Test (Antwort der Vorschau), Ergebnis mit Schweregrad und Fix im PR und in der Meldung an den Projektinhaber.
