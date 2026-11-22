# Issue-Entwürfe Edovita (nicht angelegt)

Kleine Pakete, je ein PR, je ca. 0,5–1,5 Agent-Tage. Jedes Issue verweist auf `docs/architektur/` (dieser Ordner, mit E0 ins Repo) und nennt die Schicht. Allgemein für alle: Sicherheitsprüfung nach der Änderung (Schweregrad + Fix) im PR, `pnpm audit`, keine Secrets, nichts deployen, keine kostenpflichtigen Dienste.

---

## E0 – Grundgerüst mit Leitplanken
**Ziel:** Leeres, aber vollständig abgesichertes Projekt.
**Umfang:** Rsbuild + React + TS (strict), Rstest mit `@rstest/adapter-rsbuild` (aktuell 0.12.6, noch vor 1.0; ADR-006), Testing Library, Playwright (390×844, Journeys), ESLint, Stylelint (`csstools/use-logical`), dependency-cruiser mit ADR-001-Regeln, Ordner gemäss ADR-001, `createHashRouter`, `Screen`/`BottomActions`, Theme (System/Hell/Dunkel, #0B7F6B), SVG-Icon-Sprite aus dem Prototyp, `_headers` mit CSP aus dem Prototyp (`connect-src 'self'`), CI-Workflow (test, lint, build, audit, Secret-Scan), `docs/architektur/` (Kopie dieses Ordners ohne SECURITY-Prototyp-Hashes), README, SECURITY.md, Version 0.1.0.
**Nicht:** Capacitor, Sounds, Splash, Service Worker (kommt in E7).
**Akzeptanz:** `pnpm test`, `pnpm run lint`, `pnpm run build` grün; dependency-cruiser schlägt bei einem absichtlich falschen Import an (Test); Startseite mit `BottomActions` im Handy-Viewport, hell und dunkel; CSP ohne `unsafe-inline`.

## E1 – Domäne, Lebensmittel-Katalog, Rezept-Schema, Inhaltsprüfung
**Ziel:** Datenbasis für Rezepte und Liste.
**Umfang:** `src/domain` (ADR-002-Typen, zod-Schemas), `content/foods/foods.json` + Glossare de/en, `content/` aus `docs/architektur/inhalte/` übernehmen (55 Lebensmittel, Glossare de/en/pt/ja, 5 Rezepte; Agent baut nur ein), `validate.py` als Rstest-Test nachbauen, Skript `content:check`, Build-Schritt erzeugt einen typisierten Index, `nutrition/scale`, `nutrition/sum`, `catalog/*`.
**Akzeptanz:** Inhaltsprüfungen aus dem Testplan grün; absichtlich kaputtes Rezept (unbekannte `FoodId`, 1 Quelle) bricht `content:check`; Unit-Tests `scale`/`sum`/`rankRecipes` grün.

## E2 – i18n-Laufzeit und Registry
**Ziel:** Sprachen gemäss ADR-003.
**Umfang:** i18next + react-i18next + i18next-icu, Registry mit `dir`, Rechts-Gate, Gerätesprache mit Basis-Abgleich, Übernahme der UI-Locales aus dem Prototyp (nur Schlüssel der gebauten Screens), `languages.complete.test.ts`, `Intl`-Formatierer, Sprachwechsel ohne Neustart.
**Akzeptanz:** Browser `pt-BR` → Start in EN (PT nicht freigegeben), `de-CH` → DE; FR/IT/ES/JA/PT ausgegraut «In Prüfung»; fehlender Schlüssel in `fr` lässt den Test scheitern.

## E3 – Speicherung (Dexie) mit Repository-Schnittstellen
**Ziel:** Persistenz für Einstellungen, Liste, Sterne/Merkliste.
**Umfang:** `SettingsRepository`, `ShoppingRepository`, `RatingsRepository` mit `Dexie*` und `Memory*`, Vertragstest, Dexie v1 + Migrationstest-Gerüst, `coerceSettings`, Provider pro Bereich mit Injektion, Export/Import-Bundle `format: 1`, «Alles löschen».
**Entschieden:** Dexie in der Web-Phase (Projektinhaber, 15.11.2026).
**Akzeptanz:** Vertragstest grün gegen beide Implementierungen; Daten überleben Neuladen; Export → Löschen → Import stellt alles wieder her; ungültiger Import abgelehnt.

## E4 – Rezept-Detailseite
**Ziel:** Wunsch des Projektinhabers vom 07.11.
**Umfang:** Route `#/rezept/:id`, `RecipeCard` öffnet Detail, `RecipeHeader`, `ServingsStepper` (1–12), `IngredientList`, `StepList`, `NutritionPanel` mit Quellenvermerk, `BottomActions` «Zur Einkaufsliste hinzufügen» mit Toast und Rückgängig, Sterne/Merken persistent. Rezeptliste mit Mahlzeit-Filter (eins) und Eigenschaften (mehrere) wie Prototyp.
**Akzeptanz:** J1 (bis zum Toast) grün; Mengen und Nährwerte stimmen für 1, 2, 4 Portionen mit den Unit-Tests überein; unbekannte ID → «Rezept nicht gefunden» mit Zurück; Button immer sichtbar (kurzer und langer Inhalt, Handy und Desktop); A11y: Stepper per Tastatur, `aria-live` für Portionen.

## E5 – Einkaufsliste mit drei Zuständen
**Ziel:** Liste aus Rezepten, offen / im Korb / zu Hause.
**Umfang:** `shopping/merge`, `useShoppingList`, `ShoppingListPage` mit Gruppen, `ShopRow`, Abschnitt «Schon zu Hause», manuelles Hinzufügen aus dem Katalog (Suche), Hausmarken als Info-Icon oben, `BottomActions` «QR-Einkaufsliste» und «Liste teilen» (Web Share API / Kopieren; QR mit `qrcode-generator` lokal), QR-Import mit Validierung und Bestätigungsdialog.
**Akzeptanz:** J1–J3 und J7 grün; Zustand bleibt nach Neuladen; geteilter Text enthält nur Namen, Mengen, Zustände.

## E6 – Zweitsprache für Lebensmittel
**Ziel:** Wunsch des Projektinhabers vom 07./10.11.
**Umfang:** `secondLang` in Settings, `useSecondLang`, `BilingualName` mit `<bdi>`, `LangChip` + `SecondLangSheet` in der Liste und Auswahl im Profil, Glossare pt und ja (liegen in `inhalte/foods/glossary/`), kein Rechts-Gate für die Zweitsprache, Pseudo-Sprache `ar-XB` nur im Testbuild, Registry-Eintrag `secondary`.
**Akzeptanz:** J4 und J5 grün; neue Zweitsprache nur durch Glossar-Datei + Registry-Eintrag (Test fügt `xx` hinzu, ohne Codeänderung sichtbar); fehlender Glossareintrag → nur App-Name.

## E7 – PWA und Offline
**Ziel:** Offline-Pflicht für Web.
**Umfang:** Manifest, Workbox (nur App-Shell und versionierte Inhalte, keine Nutzerdaten), Update-Hinweis, Icons aus den lokalen Logo-Exporten (noch nicht im Repo).
**Akzeptanz:** J8 grün; App ist im Browser installierbar (Manifest + Service Worker); Cache enthält keine IndexedDB-Inhalte.

---

**Danach (Januar-Kontingent):** Onboarding 1–4 mit `health/*` und Profil (G-Daten, ADR-004), Heute/Erfassen, Woche/Fortschritt, Sounds und Splash, Capacitor-Projekt, Partnermodus/Backup (Phase 2).
