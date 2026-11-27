# AGENTS.md – Edovita

## Projekt
- Zweck: Ernährungs-App mit Rezepten, Einkaufsliste und Zweitsprache für Lebensmittel. PWA zuerst, Handy-App mit Capacitor später.
- **Current repo state (base `main` `957ac7ef4091638f1d706304bb86ce50c5b6e234`, E0–E11 `#48`, test fix `#54`, E11 follow-up `#52` and E12a `#49` merged; E12 in progress):** `README.md`, `SECURITY.md`, the Phase 1 base (E0–E12 + compact UI & secondary language switchers, version `0.1.0`) under `src/` (including `TabBar` main navigation with route whitelist for Recipes/Plan/Profile, `#/plan` meal plan for 3–7 days with four slots, `PlanSheet` with local title search in `pick` mode, daily totals via `dayPlanNutrition`, swap/remove, local 56×56 WebP thumbnails & primary `#planMakeShop` button with live sync to `qtyPlan`/`qtyHave`, `#/profil` with entries to `#/profil/sprache` and `#/profil/datenschutz` for full `edovita-plan-einkauf.json` export/import + `DataImportSheet` and transactional Dexie v4 import F1b, `LangSwitcher`, `SecondLangSwitcher`, `BilingualName` & `BilingualText` with `<bdi>`, `LangFlag`, `#/rezepte` with 4 preference exclusion chips and top-card "Add to shopping list" button [top card only] & `#/rezept/:id` with "Add to plan", auto-scheduling into next free slot with in-memory undo and redirect to `#/einkauf`, local bundled WebP recipe photos with placeholder fallback, `#/einkauf` v5.10.1 with bilingual `#shopSub`, two-line secondary language for items/UI/sheets, three states, groups, ⓘ source sheet with `{when} · {qty}` plan slots, "Have" sheet with partial quantities `qtyHave` & Dexie v4 migration, catalog search, store-brand info, sharing without `qtyHave`, and `resolveQrImportItems`-hardened QR import with confirmation dialog), `content/` (**199 foods**, **7 glossaries** `de/en/fr/it/es/pt/ja`, **200 recipes** with DE/EN steps and 7 title languages, 10 bundled WebP recipe photos for the 5 starter recipes under `content/images/recipes/` with internal `manifest.json` and license rules in `content/README.md`, language registry `locales/languages.json` with `active` + `legalApproved`, 7 UI locales `{de,en,fr,it,es,ja,pt}/ui.json`, generated typed indexes under `content/generated/`), `public/`, `tests/`, `scripts/` and `.github/`, the frozen click prototype v5.4.1 under `prototype/` (design reference only, do not touch), architecture docs and initial content under `docs/architektur/`, plus logos, brief, decision log, legal/store drafts and sound favourites under `design/`.
- **Übergabe an neue Agents (zuerst lesen):** `docs/architektur/adr/` (ADR-001 bis ADR-005, akzeptiert 15.11.2026; ADR-006, akzeptiert 22.11.2026), dann `design/brief/HANDOFF-entwickler.md` und `design/brief/decision-log.md`. Bei Widerspruch gilt: **ADRs (`docs/architektur/adr/*`) > Decision-Log > Handoff > `design/brief/BRIEF.md` > `design/brief/architektur-hosting.md`** (z. B. überschreiben ADR-001 bis ADR-004 ältere Handoff-Punkte wie SQLite/WebCrypto in Phase 1 oder `src/locales/`).
- Stack (aktiv ab E0–E11): React 19, TypeScript 6 (strict), Rsbuild (inkl. lokal gebündelter WebP-Rezeptfotos ab E8), React Router (Hash-Router mit `TabBar`-Hauptnavigation & `#/profil` ab E9, `#/plan` & `#/profil/datenschutz` ab E10), `zod` (ab E1 aktiv, `jitless: true`), `i18next` + `react-i18next` + `i18next-icu` (ab E2 aktiv, synchronisiert mit `Settings.uiLang` ab E4, kompakter Umschalter + Zweitsprachen-Umschalter `SecondLangSwitcher` mit Orts-Standard ohne Geolocation-API ab E6 + zweisprachige Einkaufslisten-UI/Sheets `tSecond`/`BilingualText` ab E6b inkl. `#shopSub` ab E11, lokale SVG-Flaggen, `active`+`legalApproved`-Whitelist für UI-Sprache, kein Rechts-Gate für Zweitsprache), `dexie` (IndexedDB, ab E3 aktiv mit Repository-Schnittstellen, transaktionalem `importAll`/`importPlanTransferBundle` F1b, v1→v2-Migration für `qtyHave` ab E5b, v2→v3-Migration für `plan` ab E10, v3→v4-Migration für `qtyPlan`/`qtyExtra`/`recipesPlan`/`recipesExtra` ab E11 und `Memory*`-Implementierungen; SQLite später mit Capacitor), `qrcode-generator` (ab E5 lokal für reines React-SVG ohne `innerHTML`, 0 transitive Abhängigkeiten). Tests: Rstest mit `@rstest/adapter-rsbuild` (exakt `0.12.6`, noch vor 1.0), Testing Library, `fake-indexeddb`; Playwright für Journeys (390×844 & 360×844, Hell & Dunkel, inkl. J1 mit lokalen Rezeptfotos, J3, J4, J5 `ar-XB`, J6, J7, J9, J10 Essensplan & Datenschutz-Export/Import, J11 Plan→Einkaufsliste & Top-Karte & Rückgängig, ⓘ-Sheet, beiden Kopfzeilen-Umschaltern & Tab-Leiste/Profil mit Tastatur/RTL und Desktop-Resize). Travel Talk und die anderen Repos bleiben bei Vitest (ADR-006). Lint: ESLint, Stylelint (`csstools/use-logical`), dependency-cruiser.
- Architektur: ARCHITECTURE.md und `docs/architektur/` (ADR-001 bis ADR-006, Bausteine, Testplan, Pakete E0–E12). Stand: STATUS.md.

## Befehle
- **Paketmanager: nur pnpm** (`packageManager` in `package.json`, `corepack enable`). Kein `npm`, kein `yarn`, kein `package-lock.json`. Fehlt ein Paket, wird es sauber in `package.json` eingetragen, kein `shamefully-hoist`. `.npmrc` mit `ignore-scripts=true` (Sicherheitshaltung CA-3).
- **Mindestalter neuer Paketversionen: 4 Tage.** `pnpm-workspace.yaml` setzt `minimumReleaseAge: 5760` (Minuten): pnpm installiert keine jüngere Version (Schutz vor kompromittierten Releases). Die Zeile nie senken oder entfernen. Ausnahme nur, wenn eine Sicherheitslücke sich anders nicht beheben lässt: das Paket gezielt unter `minimumReleaseAgeExclude` eintragen, mit Kommentar (CVE/GHSA, Datum), im PR melden und nach 4 Tagen wieder entfernen. Dependabot hat `cooldown` von 4 Tagen. Das gilt für alle Agents (Cursor, Antigravity, weitere).
- **Echte Skripte (ab E0–E11):** `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run dev`, `pnpm run lint` (TypeScript, ESLint, Stylelint, dependency-cruiser), `pnpm run test:arch` (ADR-001-Negativtests für `src` + `content`), `pnpm test` (Rstest inkl. Repository-Vertragstests, Dexie-v1→v2→v3→v4-Migrationen, Transaktions-Rollback G2/F1b, LangSwitcher, SecondLang/Orts-Standard/tSecond/BilingualText/xx/ar-XB, Shopping-Merge/Have/PlanShop/QR, Rezeptbilder-Whitelist, Navigation/Tab-Leiste, Essensplan & Datenschutz-Export/Import & Rezept-Komponenten), `pnpm run content:build` (erzeugt `catalog-index.ts` inkl. `RECIPE_IMAGES` und `locales-index.ts`), `pnpm run content:check` (Inhalts-, Bild- und Sprachen-Vollständigkeitsprüfung inkl. xlsx-SHA-256, WebP-EXIF/GPS-/Lizenz-/Budget-Prüfung & Negativtests), `pnpm run build`, `pnpm run security:check`, `pnpm audit --audit-level=moderate`, `pnpm run test:e2e` (Playwright `390×844` + `360×844` + Desktop, J1/J3/J4/J5/J6/J7/J9/J10/J11 & E9-Navigation).
- Prototyp lokal ansehen: in `prototype/` `python3 -m http.server`, dann `http://localhost:8000/`.

## Projektregeln
- Schichten und Ordner nach ADR-001, durchgesetzt mit dependency-cruiser ab E0.
- Gesundheitsdaten nur auf dem Gerät, kein Konto, kein Server, keine Analytics in Phase 1 (ADR-004). Service Worker cacht nie Nutzerdaten.
- Neue Sprache = Inhalt + Registry-Eintrag, kein Code. Zweitsprache ohne Rechts-Gate. RTL-fähig (logische CSS-Eigenschaften, `<bdi>`).
- Rezepte sind Daten, Nährwerte berechnet aus der Schweizer Nährwertdatenbank, nichts geschätzt (ADR-005).
- Kein `innerHTML`, kein `dangerouslySetInnerHTML`, CSP ohne `unsafe-inline`.
- `prototype/` nicht anfassen.

### Produktvorgaben Edovita (verbindlich für die echte App)
- **Web-App mit Capacitor** (iOS/Android später), eine Codebasis, **PWA zuerst**. Stack React + TypeScript (strict) + **Rsbuild** (nicht Vite), Hash-Router.
- **Volle Offline-Nutzung ist Pflicht fürs fertige Produkt** (PWA mit Service Worker: nach dem ersten Start alles lokal, inklusive Rezepte, Sounds und Animationen; nur Backup und Partner-Sync brauchen Netz). **In Prototypen und frühen Paketen nicht nötig** (kommt mit E7). Service Worker cacht nie Nutzerdaten oder API-Antworten.
- **Hauptaktions-Buttons (1–3) sind auf jedem Screen immer fix unten sichtbar, der Inhalt scrollt darüber.**
- **Dark Mode** (System/Hell/Dunkel). Primärgrün für Text und Buttons im Hellmodus `#0B7F6B` (Kontrast 4,9:1; der Prototyp nutzt noch `#0F9D84`). Logo für dunkel: dunkler Hintergrund, Symbol gleich, Schriftzug weiss.
- **Animationen:** Lottie für Belohnungen bei Zwischenzielen (Konfetti, Abzeichen, Logo-Feier, mit Erfolg-Sound), **SVG** (CSS-Keyframes) für Loader und die Logo-Animation (Zusammenbau, Herz Lub-Dub, EKG; `prefers-reduced-motion` beachten). Native Startanimation: das Hauptlogo setzt sich zusammen.
- **Logo final** (Konzept D: Blatt und Gabel als V, darüber Herz mit Pulslinie; Schriftzug Quicksand): `design/logos/final/`, Export für Web/Android/Apple/Capacitor in `design/logos/export/`. Im App-Icon nur wenig Rand.
- **Sprachen UI v1:** EN, DE, FR, IT, ES, JA, PT (pt-BR), Fallback EN; wählbar nur bei `legalApproved=true` (zuerst DE/EN). i18next + react-i18next + i18next-icu, Ordner `content/locales/<code>/{meta,ui,legal,recipes,store}.json` (ADR-001/ADR-003). Zweitsprache nur für Zutaten und Einkaufsartikel, Kochschritte nur in der App-Sprache. **Repository language rule (from 27.11.2026):** Everything written into GitHub — including code, comments, identifiers, docs, PRs, and commit messages — must be written in English. Write new or changed sections in English, and do not translate other existing German text.
- **Schutzregeln (Gesundheit):** kein Abnehmen bei BMI < 18,5; Gewicht min. 25 kg bei Zunehmen/Halten, 40 kg bei Abnehmen; Tempo ≤ 1 kg pro Woche; Mindest-kcal 1'500 (m) / 1'200 (w); Texte zielabhängig, nie «abnehmen»-Wortlaut bei Ziel Zunehmen. Keine Finanz- oder Medizinberatung, Allergenfilter nur als Hinweis. Rechtliches zu Gesundheitsdaten immer mehrfach prüfen.
- **Eingaben im Prototyp-Stil:** Grösse als Slider plus Minus/Plus 1 cm, Geburtsdatum statt Alter, Gewicht als Slider plus Minus/Plus 0,1 kg.
- **Einkaufsliste:** Zustände «habe ich zu Hause» / «bereits im Einkaufskorb» bleiben; unten QR-Einkaufsliste und Liste teilen; Hausmarken als Info-Icon oben; Rezept-Detail mit Portionszahl, Schritten, Nährwerten und Button «zur Einkaufsliste».
- **Sounds:** Erkennungsmelodie H1 ist Standard (H5 gut, H4 Reserve), Töne beim ersten Start an, KI-Hymnen als KI-generiert kennzeichnen (ACE-Step, Apache-2.0), Credit «Drum samples provided by DrumGizmo.org». Nicht ausliefern: `hymne_AI_H2*`, `hymne_AI_H3*`, `stile_v3/_discarded`, `stile_v3/samples/`, `ai_hymnen_v1/raw/`. Favoriten liegen in `design/sounds/favoriten/`; die Quell-Sounds (3,4 GB) sind nur lokal beim Projektinhaber.
- **Hosting/Daten:** Local-first, Gesundheitsdaten nur auf dem Gerät. Später Cloudflare Workers, Jurisdiction `eu`. App-ID `ch.edovita.app`. Cloud-Backup standardmässig aus. **Deploy nur über den Pages-Workflow** (`.github/workflows/deploy-pages.yml`) nach Merge auf `main` und grüner CI; Vorschau: https://patrickstubner.github.io/Edovita/. Keine eigene Domain, keine Store-Konten und keine anderen Deploys ohne Ja des Projektinhabers.
- **Nährwerte** werden berechnet (Schweizer Nährwertdatenbank, Quellenangabe Pflicht), nie geschätzt. Rezepte sind selbst geschrieben, kein kopierter Text.

## Arbeitsregeln für Agents

### Vor dem Start
- Vor jedem Cloud-Agent-Start AGENTS.md, ARCHITECTURE.md und STATUS.md lesen. Sie müssen aktuell sein. Fehlt etwas oder ist es unklar: zuerst konkret nachfragen, keinen Cloud Agent starten.
- Zuerst lokal arbeiten, mit den lokalen Tools. Für neue Features oder grössere Umbauten zuerst einen klickbaren Prototyp und eine klare Spezifikation, erst dann einen Cloud Agent.
- Kontext schlank halten: Struktur-Fragen mit den Tools unten beantworten statt ganze Dateien zu lesen. STATUS.md nach jedem Arbeitspaket nachführen.
- Pro grösserem Paket in STATUS.md festhalten: welche lokalen Tools genutzt wurden, wie viel Cloud-Agent-Nutzung das vermieden hat, Rückmeldung zu den Tools.
- Keine Werte erfinden. Was nicht belegt ist, steht als «offen» da.

### Definition of Ready (DoR) vor Agent-Start
Ein Arbeitspaket-Issue wird erst an einen Agenten (Cursor, Grok Bot, Antigravity oder Cloud Agent) übergeben, wenn alle Punkte erfüllt sind und keine offenen Produktentscheide mehr im Text stehen:
1. **Ziel, Umfang & Nicht-Ziele:** Klar abgegrenzter Umfang plus explizite Liste, was bewusst nicht vorgezogen wird.
2. **Abhängigkeiten & Reihenfolge:** Voraussetzungen, Nachfolger und Einordnung in die festgelegte Paket-Reihenfolge.
3. **Exakte Referenzen:** Prototyp-Branch + Commit-Hash (z. B. `5ef149a` oder `93630aa`) mit konkreten Dateien/Symbolen/Selektoren sowie relevante ADRs (`ADR-001`–`006`) und Ziel-Schichten auf `main`.
4. **UI-Texte in 7 Locales:** Konkrete neue/geänderte `ui.json`-Schlüssel (oder klare Regel bei Abweichung vom Prototyp), Hinweis auf `content:check` (0 ungenutzte Schlüssel) und Verhalten bei fehlender Übersetzung (kein stiller EN-Fallback).
5. **Datenmodell & Dexie-Migration:** Betroffene Domänentypen, `zod`-Schemas (`jitless: true`, `hasForbiddenOwnKey`), `coerce*`-Normalisierung, Dexie-Schema-Version + `upgrade()`-Test + `Memory*`-Parität.
6. **Randfälle & Fehlerzustände:** Leere/ungültige Eingaben, generische Speicherfehler (G1), atomare Dexie-Transaktionen bei Mehrtabellen-Writes (G2/F1b), Abweichungen zwischen Prototyp und `main`.
7. **Barrierefreiheit (A11y):** Tastaturbedienung, `role="dialog"`/Escape/Fokus-Rückkehr, `aria-live`, Touch-Ziele (≥ 44 px bzw. Spezialmasse), logische CSS-Eigenschaften und RTL (`ar-XB`).
8. **Sicherheit & Datenschutz:** Whitelists/Validierung, `UNSAFE_TEXT_RE`, kein `innerHTML`, URL-Prüfung (`isSafeHttpsUrl`), CSP-Sync (`public/_headers` + `<meta http-equiv>`), keine G-Daten im Export/Share/QR/SW-Cache, kein externes Netz.
9. **Testbare Akzeptanzkriterien:** Konkrete, prüfbare Bedingungen inkl. `390×844` / `360×844` / `1280×800` (Hell/Dunkel), RTL und 0 CSP-Verstösse.
10. **Tests & lokale Prüfbefehle:** Benötigte Unit-/Vertrags-/Migrations-/Negativtests (Rstest `0.12.6`) und Playwright-Journeys (`--workers=1`) inkl. `pnpm run content:build`, `lint`, `test:arch`, `content:check`, `test`, `build` + `GITHUB_PAGES=true`, `security:check` (beide Builds), `pnpm audit --audit-level=moderate`, `pnpm peers check`, `test:e2e`, `gitleaks`, `actionlint`.
11. **Doku-Regel & exakte Testzahlen:** Doku-Dateien (`AGENTS.md`, `ARCHITECTURE.md`, `STATUS.md`, `SECURITY.md`) nennen ausschliesslich den **Basis-Commit**, niemals den eigenen PR-Head-SHA oder eigene CI-Run-IDs (Entscheid 25.11.2026). Der PR-Text nennt Basis-Commit, Head-SHA und die exakten tatsächlich gelaufenen Test-/Dateizahlen.
12. **PR-Format & Definition of Done:** Eigener Branch ab `main`, Draft-PR, kein Selbst-Merge (erst Stabschef-Ok + Ja des Projektinhabers), `STATUS.md`-Tool-Rückmeldung.
13. **Schutzliste:** `.github/workflows/`, `.npmrc`, `pnpm-workspace.yaml`, `tsconfig.json`, `eslint.config.mjs`, `.dependency-cruiser.mjs`, `playwright.config.ts`, `rsbuild.config.ts` (sofern nicht explizit ausgenommen), `package.json`/`pnpm-lock.yaml`, Rstest `0.12.6` und `prototype/` bleiben unverändert; keine `.codegraph/`/`graphify-out/`/`.serena/`/`.codebase-memory/`/`__pycache__/`.
14. **Keine offenen Produktentscheide & Hygiene:** Keine ungeklärten Fragen, keine `ß`-Schreibweise in Doku/Issues, keine personenbezogenen Daten, keine Vornamen, keine lokalen Pfade und keine Geheimnisse.

### Lokale Tools (gemeinsamer Rechner, Anleitung `dev-tools/README.md`)
- codebase-memory-mcp, Standard für «wer ruft X»: `cbm index <pfad>`, dann `cbm callers <projekt> <Symbol> 2`, `cbm get_architecture '{"project":"<projekt>"}'`
- codegraph, wenn Code und Aufrufpfade gebraucht werden: `codegraph explore "<Frage>"`
- Serena für exakte Referenzen (nur eigene Repos): `serena-repl . 's.lsp.find_referencing_symbols("<Symbol>","<Datei>")'`
- ast-grep für Muster: `ast-grep run -p '<Muster>' -l tsx src`
- `rg` für einfache Zeilensuchen
- Graphify: für GitHub-Repos den Connector. Die lokale CLI nur für ungepushten Code und immer mit `--code-only` bzw. `--no-label`, sonst ruft sie ein LLM auf (Kosten, Code verlässt den Rechner).
- Index-Ordner `.codegraph/`, `graphify-out/` und `.serena/` nie committen, sie stehen in `.gitignore`.

### Sicherheit (Dauerregel)
- Nach jeder Code-Erstellung oder -Änderung eine detaillierte Sicherheitsprüfung: Eingabevalidierung, Injection, Geheimnisse und Zugangsdaten, Berechtigungen, Abhängigkeiten inklusive indirekter, CDN und GitHub Actions auf bekannte Schwachstellen, Fehlermeldungen mit sensiblen Daten, Angriffsflächen. Ergebnis mit Schweregrad und Fix-Vorschlag im PR.
- Verwundbare Libraries auf die nächste sichere Version heben. Bei einem grossen oder brechenden Sprung (Major) vorher den Projektinhaber fragen.
- Updates und offene Risiken in SECURITY.md (kommt mit E0; bis dahin `docs/architektur/SECURITY.md`) nachführen.
- Keine Geheimnisse und keine personenbezogenen Daten ins Repo (das Repo ist öffentlich).

### Prüfung und Merge
- Jede Code-Änderung, jeder Merge und jedes Update (auch grüne Dependabot-PRs) wird von Stabschef unabhängig geprüft (Entscheid Projektinhaber, 16.11.2026).
- Vor jedem Merge oder Push auf `main` den Head-SHA an Stabschef geben und auf das Ok warten. Merge nur mit ausdrücklichem Ok des Projektinhabers.
- Keine bezahlten Dienste und kein On-Demand ohne das Ja des Projektinhabers.
- Merge immer als Squash-Merge mit `--match-head-commit <SHA>`. Autor und Committer nur mit der GitHub-noreply-Adresse des Repo-Kontos.

## Zusammenarbeit mehrerer Agents (Cursor, Google Antigravity, weitere)

Gilt für alle Agents und Menschen, die an diesem Repo arbeiten. Google Antigravity liest diese `AGENTS.md` im Repo-Stamm automatisch (Rules-Doku: https://antigravity.google/docs/rules); eine zweite Regel-Datei gibt es bewusst nicht, damit nichts doppelt gepflegt wird.

### Branches und PRs
- **Ein Branch pro Aufgabe und Agent.** Zwei Agents arbeiten nie auf demselben Branch. Branch-Name nach Muster `<typ>/<kurzer-name>` (z. B. `feat/…`, `fix/…`, `docs/…`), Basis immer aktuelles `main`.
- **Änderungen nur per Pull Request.** Kein direkter Push auf `main`, kein Force-Push auf fremde Branches. Vor dem Merge geht der Head-SHA an Stabschef; auf dessen Ok warten. Gemergt wird erst nach dem ausdrücklichen Ja des Projektinhabers. Agents ohne direkten Zugang zu Stabschef (z. B. Antigravity) nennen den Head-SHA im PR und mergen nicht (Details: «Prüfung und Merge»).
- Im PR den Head-SHA nennen. Kleine PRs mit einem Thema; fremde Branches und PRs nicht anfassen.

### Sicherheitsprüfung nach jeder Codeänderung
Nach jeder Code-Erstellung oder -Änderung, **bevor weitergebaut wird**, kurz prüfen und im PR (Abschnitt «Sicherheit») bzw. in der `SECURITY`-Notiz des Repos festhalten:
- Eingabevalidierung und Injection (XSS, SQL/Command, Pfade, Prototype Pollution, Deserialisierung)
- Geheimnisse und Zugangsdaten (Code, Konfiguration, Git-Historie, Logs)
- Berechtigungen und Zugriffskontrolle
- Abhängigkeiten und Versionen (direkt und indirekt, CDN, GitHub Actions): `pnpm audit`, verwundbare Libraries auf die nächste sichere Version heben; bei Major-Sprung vorher den Projektinhaber fragen
- Fehlermeldungen und Logs mit sensiblen Daten
- Neue Angriffsflächen (Endpunkte, Schnittstellen, Dateizugriff, Weiterleitungen, CSP/Header)

Schwachstellen mit **Schweregrad** (kritisch / hoch / mittel / niedrig) und Fix-Vorschlag melden, bevor weitergebaut wird. Nichts als «sicher» bezeichnen, was nicht geprüft wurde.

### Übergabe: STATUS.md
- **Doku-Regel (Entscheid vom 25.11.):** Die Doku (`AGENTS.md`, `ARCHITECTURE.md`, `STATUS.md`, `SECURITY.md` usw.) nennt nur den **Ausgangs-Commit (Basis)**, nie den eigenen PR-Head oder eigene CI-Run-IDs. Den Head nennt der PR-Text und prüft Stabschef.
- Am Ende **jeder Aufgabe** `STATUS.md` nachführen: was getan wurde, was offen ist, den **Basis-Commit-Hash**, auf dem der Stand beruht, und welche lokalen Tools genutzt wurden. So kann der nächste Agent einsteigen, ohne alles neu zu lesen.
- `ARCHITECTURE.md` nachführen, wenn sich Struktur oder Entscheide ändern. Keine Werte erfinden: Unbelegtes steht als «offen» da.
- Ergebnisse lokaler Analysen (Hotspots, Aufrufer, Abhängigkeiten) kurz in `STATUS.md`; rohe Index-Ordner (`.codegraph/`, `graphify-out/`, `.serena/`, `.codebase-memory/`) bleiben lokal und stehen in `.gitignore`.

### Verbote
- **Keine Secrets, API-Keys, Tokens oder `.env`-Dateien ins Repo.** Auch nicht in MCP-Konfigurationen: `.agents/mcp_config.json` und `~/.gemini/…` liegen nur lokal (`.agents/mcp_config.json` steht in `.gitignore`).
- **Keine kostenpflichtigen Dienste, Abos oder Käufe** ohne ausdrückliches Ja des Projektinhabers. **Deploy nur über den Pages-Workflow nach Merge auf `main` und grüner CI.** Andere Deploys, Domains oder Hosting-Dienste nur mit ausdrücklichem Ja. Im Zweifel stoppen und fragen.
- Keine personenbezogenen Daten ins Repo, wenn es öffentlich ist.

### Lokale MCP-Server (Empfehlung für Antigravity und andere lokale Agents)
- **Sinnvoll:** GitHub (Repos, PRs, Issues), Graphify (Struktur-Graph) und `codebase-memory-mcp` (Aufrufer, Impact, Architektur; spart Tokens).
- **Nicht nötig:** Sentry, Notion, PostHog, Vercel, Netlify. Jeder geladene MCP-Server kostet bei jeder Anfrage Tokens; nur aufnehmen, was beim Coden direkt hilft.
- Antigravity: Konfiguration global in `~/.gemini/config/mcp_config.json` oder pro Workspace in `.agents/mcp_config.json` (nicht committen). Anleitung: https://antigravity.google/docs/mcp

### Lokaler Start
Installation, Start und Tests stehen in `README.md` und im Abschnitt «Befehle» oben. Vor dem ersten Commit `pnpm test` bzw. die dort genannten Prüfungen ausführen.

## Cursor Cloud specific instructions

Cloud Agents starten in einer eigenen Ubuntu-VM, ohne den gemeinsamen Rechner. Diese Hinweise gelten nur dort.

### Zuerst lesen
- AGENTS.md, ARCHITECTURE.md und STATUS.md, in dieser Reihenfolge.
- Sind sie unklar oder nicht aktuell: konkret nachfragen, nicht raten.

### Werkzeuge in dieser Umgebung
Das Install-Skript `.cursor/install-dev-tools.sh` legt im Build bereit:
- `rg` (ripgrep 14.1.1) für Zeilensuche
- `ast-grep` (0.51.2) für strukturelle Suche; auf Linux den Befehl `ast-grep` nutzen, nicht `sg`
- `codebase-memory-mcp` (0.12.1) für Aufrufer, Impact und Architektur. Der Index liegt unter `~/.cache/codebase-memory-mcp/` und wird im Build erzeugt.

Die Binaries liegen nur unter `~/.local/bin` (kein Kopieren nach `/usr/local/bin`, kein `sudo`). Das Skript hängt `~/.local/bin` an PATH in `~/.profile` und `~/.bashrc`. Fehlt ein Befehl in einer Sitzung: `export PATH="$HOME/.local/bin:$PATH"`. `environment.json` setzt PATH nicht selbst: das offizielle Schema erlaubt kein `env`-Feld.

Weitere Tools können später im selben Skript ergänzt werden (Version und SHA-256 pinnen, kein `curl|bash`).

Abhängigkeiten: das Skript erkennt `pnpm-lock.yaml` (`pnpm install --frozen-lockfile`, pnpm über corepack mit der in `packageManager` gepinnten Version) oder `package-lock.json` (`npm ci --ignore-scripts`, nur für andere Repos). In diesem Repo gilt pnpm. Node muss die `engines` in `package.json` erfüllen (typisch >= 22); das Skript installiert Node nicht.

### Reihenfolge bei Struktur-Fragen
1. STATUS.md und ARCHITECTURE.md.
2. Index-Tool, bevor ganze Dateien gelesen werden:
   - `codebase-memory-mcp cli --quiet list_projects '{}'`
   - `codebase-memory-mcp cli --quiet trace_path '{"project":"<name>","function_name":"<Symbol>","direction":"inbound","depth":2}'`
   - `codebase-memory-mcp cli --quiet get_architecture '{"project":"<name>"}'`
3. `ast-grep` oder `rg` für Muster und exakte Zeichenketten.
4. Dateien nur gezielt lesen.

Der eingefrorene Klick-Prototyp liegt unter `prototype/`. Ein Lockfile (`pnpm-lock.yaml`) gibt es erst mit E0; bis dahin überspringt das Skript die Installation.

### Graphify-MCP (gehostet, falls verbunden)
Wenn unter cursor.com/agents ein HTTP-MCP namens `graphify` auf `https://api.graphify.com/mcp` eingerichtet und per OAuth angemeldet ist, den Graphen für Aufrufer, Impact und Tests nutzen (`list_repositories`, `graphify_find`, `graphify_callers`, `graphify_impact`). Der gehostete Graph zeigt den indexierten GitHub-Stand, keine uncommitteten lokalen Änderungen. Fehlt die Verbindung oder weicht der Stand ab: `codebase-memory-mcp` in dieser VM verwenden.

Nicht `codebase-memory-mcp install` oder `update` ausführen (ändert Agent-Konfigurationen oder lädt Binaries). Index-Ordner `.codegraph/`, `graphify-out/`, `.serena/` und `.codebase-memory/` nicht committen (stehen in `.gitignore` und `.cursorignore`).

### MCP-Liste schlank halten (seit 20.11.2026)
Jeder geladene MCP-Server schickt seine Tool-Beschreibungen bei jeder Anfrage mit und kostet Tokens. Darum lässt `.cursor/environment.json` nur den gehosteten Graphify-MCP zu (`mcpServerAllowlist`, Schema: https://cursor.com/schemas/environment.schema.json). Alle anderen User- und Team-MCP-Server sind für Agents dieser Umgebung gesperrt. Cursor-eigene MCP-Server (z. B. Cursor Cloud MCP) bleiben unberührt.
- `codebase-memory-mcp`, `rg` und `ast-grep` laufen als CLI aus dem Install-Skript und brauchen keinen MCP-Eintrag.
- Einen weiteren MCP-Server nur nach einem Nutzen-Test und nur mit Ok des Projektinhabers in die Allowlist aufnehmen.
- Serena nur nach positivem lokalem Test (Tokenmessung bei Travel Talk, ab 27.11.2026). Dann ersetzt es `codebase-memory-mcp`, es kommt nicht zusätzlich dazu.
- Die Datei wirkt nur, wenn bei der Umgebung auf cursor.com «environment.json location» auf dieses Repo zeigt (https://cursor.com/docs/cloud-agent/setup.md#environment-resolution-order). Sonst denselben Eintrag im Abschnitt «MCP servers» der Umgebung von Hand setzen.
