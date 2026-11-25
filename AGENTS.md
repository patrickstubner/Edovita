# AGENTS.md – Edovita

## Projekt
- Zweck: Ernährungs-App mit Rezepten, Einkaufsliste und Zweitsprache für Lebensmittel. PWA zuerst, Handy-App mit Capacitor später.
- **Heute im Repo (Basis `main` `098ed506`, Paket E6b in Arbeit):** `README.md`, `SECURITY.md`, die Phase-1-Basis (E0/E0b/E1/E2/E3/E4 + kompakter UI-Sprachumschalter + E5 + E5b + E6 + E6b, Version `0.1.0`) unter `src/` (inkl. `LangSwitcher`, `SecondLangSwitcher`, `BilingualName` & `BilingualText` mit `<bdi>`, `LangFlag`, `#/profil/sprache` inkl. Zweitsprache, Rezeptliste `#/rezepte`, Rezept-Detailseite `#/rezept/:id`, Einkaufsliste `#/einkauf` im Prototyp-v5.10.1-Stand mit zweizeiliger Zweitsprache für Artikel, relevante UI-Texte & beide Sheets, drei Zuständen, Gruppen, ⓘ-Herkunfts-Sheet, «Hab ich»-Sheet mit Teilmengen `qtyHave` & Dexie-v2-Migration, bewusster Katalog-Suche, Hausmarken-Info, Teilen ohne `qtyHave` und gehärtetem QR-Import samt Bestätigungsdialog), `content/` (55 Lebensmittel, Glossare DE/EN/PT/JA, 5 Rezepte, Sprach-Registry `locales/languages.json` mit `active` + `legalApproved`, 7 UI-Locales `{de,en,fr,it,es,ja,pt}/ui.json`, typisierte Indizes unter `content/generated/`), `public/`, `tests/`, `scripts/` und `.github/`, der eingefrorene Klick-Prototyp v5.4.1 unter `prototype/` (Design-Referenz, nicht produktiv, nicht erweitern), die Architektur-Doku und Startinhalte unter `docs/architektur/` sowie Logos, Briefing, Entscheid-Log, Rechts- und Store-Entwürfe, Sound-Favoriten unter `design/`.
- **Übergabe an neue Agents (zuerst lesen):** `docs/architektur/adr/` (ADR-001 bis ADR-005, akzeptiert 15.11.2026; ADR-006, akzeptiert 22.11.2026), dann `design/brief/HANDOFF-entwickler.md` und `design/brief/decision-log.md`. Bei Widerspruch gilt: **ADRs (`docs/architektur/adr/*`) > Decision-Log > Handoff > `design/brief/BRIEF.md` > `design/brief/architektur-hosting.md`** (z. B. überschreiben ADR-001 bis ADR-004 ältere Handoff-Punkte wie SQLite/WebCrypto in Phase 1 oder `src/locales/`).
- Stack (aktiv ab E0–E6b): React 19, TypeScript 6 (strict), Rsbuild, React Router (Hash-Router), `zod` (ab E1 aktiv, `jitless: true`), `i18next` + `react-i18next` + `i18next-icu` (ab E2 aktiv, synchronisiert mit `Settings.uiLang` ab E4, kompakter Umschalter + Zweitsprachen-Umschalter `SecondLangSwitcher` mit Orts-Standard ohne Geolocation-API ab E6 + zweisprachige Einkaufslisten-UI/Sheets `tSecond`/`BilingualText` ab E6b, lokale SVG-Flaggen, `active`+`legalApproved`-Whitelist für UI-Sprache, kein Rechts-Gate für Zweitsprache), `dexie` (IndexedDB, ab E3 aktiv mit Repository-Schnittstellen, transaktionalem `importAll`, v1→v2-Migration für `qtyHave` ab E5b und `Memory*`-Implementierungen; SQLite später mit Capacitor), `qrcode-generator` (ab E5 lokal für reines React-SVG ohne `innerHTML`, 0 transitive Abhängigkeiten). Tests: Rstest mit `@rstest/adapter-rsbuild` (exakt `0.12.6`, noch vor 1.0), Testing Library, `fake-indexeddb`; Playwright für Journeys (390×844 & 360×844, Hell & Dunkel, inkl. J1, J3, J4, J5 `ar-XB`, J6, J7, J9, ⓘ-Sheet, beiden Kopfzeilen-Umschaltern mit Tastatur/RTL und Desktop-Resize). Travel Talk und die anderen Repos bleiben bei Vitest (ADR-006). Lint: ESLint, Stylelint (`csstools/use-logical`), dependency-cruiser.
- Architektur: ARCHITECTURE.md und `docs/architektur/` (ADR-001 bis ADR-006, Bausteine, Testplan, Pakete E0–E11). Stand: STATUS.md.

## Befehle
- **Paketmanager: nur pnpm** (`packageManager` in `package.json`, `corepack enable`). Kein `npm`, kein `yarn`, kein `package-lock.json`. Fehlt ein Paket, wird es sauber in `package.json` eingetragen, kein `shamefully-hoist`. `.npmrc` mit `ignore-scripts=true` (Sicherheitshaltung CA-3).
- **Mindestalter neuer Paketversionen: 4 Tage.** `pnpm-workspace.yaml` setzt `minimumReleaseAge: 5760` (Minuten): pnpm installiert keine jüngere Version (Schutz vor kompromittierten Releases). Die Zeile nie senken oder entfernen. Ausnahme nur, wenn eine Sicherheitslücke sich anders nicht beheben lässt: das Paket gezielt unter `minimumReleaseAgeExclude` eintragen, mit Kommentar (CVE/GHSA, Datum), im PR melden und nach 4 Tagen wieder entfernen. Dependabot hat `cooldown` von 4 Tagen. Das gilt für alle Agents (Cursor, Antigravity, weitere).
- **Echte Skripte (ab E0–E6b):** `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run dev`, `pnpm run lint` (TypeScript, ESLint, Stylelint, dependency-cruiser), `pnpm run test:arch` (ADR-001-Negativtests für `src` + `content`), `pnpm test` (Rstest inkl. Repository-Vertragstests, Dexie-v1→v2-Migration, Transaktions-Rollback, LangSwitcher, SecondLang/Orts-Standard/tSecond/BilingualText/xx/ar-XB, Shopping-Merge/Have/QR & Rezept-Komponenten), `pnpm run content:build` (erzeugt `catalog-index.ts` und `locales-index.ts`), `pnpm run content:check` (Inhalts- und Sprachen-Vollständigkeitsprüfung inkl. xlsx-SHA-256 & Negativtests), `pnpm run build`, `pnpm run security:check`, `pnpm audit --audit-level=high`, `pnpm run test:e2e` (Playwright `390×844` + `360×844` + Desktop, J1/J3/J4/J5/J6/J7/J9).
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
- **Sprachen UI v1:** EN, DE, FR, IT, ES, JA, PT (pt-BR), Fallback EN; wählbar nur bei `legalApproved=true` (zuerst DE/EN). i18next + react-i18next + i18next-icu, Ordner `content/locales/<code>/{meta,ui,legal,recipes,store}.json` (ADR-001/ADR-003). Zweitsprache nur für Zutaten und Einkaufsartikel, Kochschritte nur in der App-Sprache. Quelltext und Kommentare Deutsch, Schweizer Schreibweise (ss, kein ß).
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
- Am Ende **jeder Aufgabe** `STATUS.md` nachführen: was getan wurde, was offen ist, **Commit-Hash**, auf dem der Stand beruht, und welche lokalen Tools genutzt wurden. So kann der nächste Agent einsteigen, ohne alles neu zu lesen.
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
