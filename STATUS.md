# STATUS.md – Stand 22.11.2026, `main` `e7d46884e98c61619ec85702133670ec32aca4a3` (E0 als PR #15, E0b als PR #22; inkl. PR #1–#5, #14)


## Nachtrag 22.11.2026 (Abend): H1 und N1 am Deploy-Workflow (Folge zu #23)

Branch `fix/stabschef-e0-e0b` (Draft-PR #23, Basis `main` `e7d46884`, nicht mergen). Geprüfter Code-Stand: `d3a4d0ca061580abbe41ac167ca46deee24e26df`.
- **H1 (hoch, behoben):** `deploy-pages.yml` lässt `workflow_run` nur noch zu, wenn die auslösende CI ein erfolgreicher `push` auf `main` **im eigenen Repo** war (`event == 'push'`, `head_branch == 'main'`, `head_repository.full_name == github.repository`, zusätzlich zu `conclusion == success`). Dieselbe `if` gilt für `build` und `deploy`. Der Filter `branches: [main]` bleibt, gilt aber nicht als einzige Vertrauensgrenze.
- **N1 (niedrig, geschlossen):** `workflow_dispatch` bleibt auf `main` beschränkt und prüft vor dem Build per `gh api` (Recht `actions: read`, `GITHUB_TOKEN`), dass der Workflow «CI» für genau diesen Commit als `push` auf `main` des eigenen Repos erfolgreich war. Sonst kein Deploy.
- Details in `SECURITY.md` (H1 dort als gefunden und behoben festgehalten, nicht mehr als «kein Befund»).

## Nachtrag 22.11.2026 (Abend): Folge-PR zu Stabschef-Hinweisen aus #15 und #22
Branch `fix/stabschef-e0-e0b` (Draft-PR, Basis `main` `e7d46884`, nicht mergen). Geprüfter Code-Stand: `63d426bb6cb77aa2a02e1f013500bcdde4291575` (plus dieser Doku-Nachtrag mit dem SHA).
- **Zu #15:** `ARCHITECTURE.md` nennt den Analyse-SHA von E0 (`9e45e9e9688d33e781d03d3b8e722b0af55f68d6`; letzter Vor-Squash-Head `50e3739086ac488911c26aa30606d505becab2be`). Der `_headers`-Parser liest ausschliesslich den `/*`-Block und löst den Dateipfad über `import.meta.dirname`. Platzhalter- und UI-Texte der Start- und Statusseite liegen in `content/locales/de/ui.json` und werden nur über `src/i18n` gelesen (kein i18next, das bleibt E2; keine neuen Pakete).
- **Zu #22:** S2: Deploy erst nach grüner CI (`workflow_run`); die wirksame Absicherung gegen Fork-PRs (H1) steht im Nachtrag darüber. S3: `workflow_dispatch` nur auf `main`, mit CI-Prüfung für denselben Commit (N1). S4: geprüfter Head von #22 `1891b0f18ea31bf4e22ec92b538e86306fc8744a` steht in `STATUS.md` und `SECURITY.md`. Low: in `SECURITY.md` als bekannte Grenze von GitHub Pages festgehalten, dass `frame-ancestors` und `X-Frame-Options` per Meta-Tag nicht setzbar sind und auf Pages nicht ankommen.
- **Hinweis vor Release (nicht in diesem PR entfernt):** Die Entwicklungs-Route `#/status` (`StatusPage`) und die Dev-/Platzhaltertexte (etwa «Bereit für den Aufbau», «Geplante Bereiche») vor der Veröffentlichung entfernen.
- **Lokal geprüft:** siehe Sicherheitsprüfung in `SECURITY.md` und den PR-Bericht.

## Nachtrag 22.11.2026 (Abend): E0b – Deploy auf GitHub Pages
Branch `feat/e0b-github-pages` (PR #22, gemergt, Squash-Commit `e7d46884e98c61619ec85702133670ec32aca4a3`). Geprüfter Head vor dem Merge: `1891b0f18ea31bf4e22ec92b538e86306fc8744a`. Basis war `main` `7f49e3d`, Issue `#21`. Der Projektinhaber hat am 22.11.2026 entschieden, dass das E0-Grundgerüst unter https://patrickstubner.github.io/Edovita/ ansehbar sein soll. Kein bestehendes Issue (#7–#13) deckte Pages ab.
- **Workflow** `.github/workflows/deploy-pages.yml` (Stand nach H1/N1): Deploy erst nach grüner CI auf `main` des eigenen Repos (`workflow_run` nach `push`) oder per `workflow_dispatch` nur auf `main` und nur bei grüner CI für genau diesen Commit. Alle Actions SHA-gepinnt (`pnpm/action-setup` wie in `ci.yml`; `configure-pages` `v6.0.0`, `upload-pages-artifact` `v5.0.0`, `deploy-pages` `v5.0.1`, jeweils älter als 4 Tage). Schreibrechte `pages: write` und `id-token: write` nur im Deploy-Job. Concurrency-Gruppe `pages`, laufende Deploys werden nicht abgebrochen. Environment `github-pages` auf Branch `main` beschränkt.
- **Build:** Asset-Prefix `/Edovita/` nur wenn `GITHUB_PAGES=true`; lokal weiter `/`. Hash-Router unverändert. `publicUrl()` für Logo- und Public-Pfade. CI baut zusätzlich nach `dist-pages/` und prüft Prefix plus CSP-Meta.
- **CSP:** GitHub Pages ignoriert `_headers`. Dieselbe Policy wird als `<meta http-equiv>` aus `_headers` erzeugt, ohne `frame-ancestors`. Dokumentiert in `SECURITY.md`.
- **Doku:** `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `STATUS.md`, `docs/architektur/issues-entwuerfe.md`, `ablaufplan-und-schaetzung.md`: Deploy nur über den Pages-Workflow nach Merge auf `main`. Keine neuen Pakete, keine Kosten (öffentliches Repo).
- **Lokal geprüft (22.11.2026, Europe/Zurich):** `pnpm run lint` grün; `test:arch` 3/3; `pnpm test` 10/10 (Rstest 0.12.6); `content:check` OK; `pnpm run build` OK; `security:check` OK (auch auf `dist-pages` mit Prefix `/Edovita/`); `pnpm audit --audit-level=high` 0 Funde; Playwright E2E 2/2 (390×844 Hell/Dunkel); Preview `GITHUB_PAGES=true PAGES_DIST=dist-pages pnpm run preview` unter http://127.0.0.1:4173/Edovita/: alle Assets HTTP 200, Logo `/Edovita/assets/…`, Hash-Route `#/status`, 0 Konsolenfehler; `gitleaks 8.30.1 dir` 0 Funde; `actionlint 1.7.12` 0 Funde.
- **Lokale Tools:** `rg`, Lesen der Dateien, `pnpm`, Playwright, `gitleaks`, `actionlint`. Kein Cloud Agent (Kontingent bis 27.11.2026 erschöpft).

## Nachtrag 22.11.2026 (Antigravity): Paket E0 – Grundgerüst mit Leitplanken (v0.1.0)
Branch `feat/e0-scaffold` (Draft-PR, Basis `main` `40aa5b5`, nicht mergen bis Stabschef-Ok und Ja des Projektinhabers). Version `0.1.0`, Issue `#6`.
- **Supply-Chain & Paketmanager (nur `pnpm`):** `.npmrc` (`ignore-scripts=true`, kein `shamefully-hoist`), `pnpm-workspace.yaml` (`minimumReleaseAge: 5760`, 4 Tage), `package.json` (`packageManager: pnpm@12.21.0`, `engines.node: >=22`), `.github/dependabot.yml` (4-Tage-Cooldown, Rstest bewusst ausgenommen gemäss ADR-006). `pnpm-lock.yaml` eingecheckt, kein `package-lock.json`.
- **Stack & Schichten (ADR-001, ADR-006):** React 19, TypeScript (`strict`), Rsbuild (`2.3.3`), React Router (`createHashRouter`), Rstest (`@rstest/core` + `@rstest/adapter-rsbuild` exakt auf `0.12.6`), Testing Library, `fake-indexeddb`, Playwright (`390×844`, Hell & Dunkel). Alle Zielordner gemäss ADR-001 angelegt (`src/pages`, `components`, `hooks`, `app`, `storage`, `catalog`, `i18n`, `nutrition`, `health`, `pwa`, `domain`, `content/`).
- **UI-Basis:** `Screen` + `BottomActions` (fix unten, Safe-Area, `visualViewport`), Theme (`ThemeProvider` + `useTheme`, System/Hell/Dunkel, Primärgrün `#0B7F6B`, externe `public/theme-init.js`), SVG-Icon-Sprite (52 Symbole aus Prototyp), Startseite (`HomePage`) und `#/status` (`StatusPage`), finale Logo-SVGs unter `public/assets/`.
- **Leitplanken & CI:** ESLint (`react/no-danger` als Fehler, ADR-001-Importverbote), Stylelint (`csstools/use-logical` für RTL), `dependency-cruiser` (alle 7 ADR-001-Regeln + 3 automatisierte Negativtests in `scripts/test-arch-guard.mjs`), `scripts/security-check.mjs`, `public/_headers` (CSP mit `connect-src 'self'`, ohne `unsafe-inline`/`unsafe-eval`), `.github/workflows/ci.yml` (alle Actions auf Commit-SHAs gepinnt, `permissions: { contents: read }`, `gitleaks 8.30.1` mit SHA-256-Prüfung).
- **Doku nachgeführt:** Root-`SECURITY.md` angelegt, `README.md`, `AGENTS.md`, `ARCHITECTURE.md` und diese `STATUS.md` aktualisiert. GitHub-Issues `#6`–`#13` (E0–E7) angelegt.
- **Bewusst nicht in E0:** Capacitor, Sounds, Splash, Service Worker (E7); `prototype/` unverändert.

## Nachtrag 22.11.2026 (Abend): Entscheid Rstest (ADR-006)
Branch `chore/pnpm-regel` (gemergt als PR #14, `40aa5b5`). Nur Doku, kein App-Code, kein Versionsbump, kein Cloud Agent.
- Der Projektinhaber hat am 22.11.2026 entschieden: Edovita nutzt Rstest (aktuell 0.12.6, noch vor 1.0) mit `@rstest/adapter-rsbuild` statt Vitest. Playwright bleibt für Journeys. Travel Talk und die anderen Repos bleiben bei Vitest.
- Festgehalten in ADR-006, `AGENTS.md`, `docs/architektur/testplan.md`, `docs/architektur/issues-entwuerfe.md` (E0-Umfang, `validate.py` als Rstest-Test), `README.md`, dieser Datei und `docs/architektur/SECURITY.md`.

## Nachtrag 22.11.2026 (Nachmittag): Regel «nur pnpm»
Branch `chore/pnpm-regel` (gemergt als PR #14, `40aa5b5`). Nur Doku, kein App-Code, kein Versionsbump, kein Cloud Agent.
- Edovita hat noch kein `package.json` und keine Abhängigkeiten (kommen mit E0). Nichts umzustellen.
- `AGENTS.md`: Regel «nur pnpm» (kein npm/yarn, kein `shamefully-hoist`, `ignore-scripts` per `.npmrc`), geplante Befehle und Verweise auf `npm` korrigiert. `README.md` und `docs/architektur/testplan.md`: geplante Befehle mit pnpm.
- Mindestalter neuer Paketversionen 4 Tage: Regel in `AGENTS.md` und `docs/architektur/SECURITY.md`; `pnpm-workspace.yaml` mit `minimumReleaseAge: 5760` und Dependabot-`cooldown` kommen mit E0. Übergangsausnahmen: keine (keine Pakete im Repo).
- Historische Sicherheitsberichte (`prototype/SECURITY.md`, `design/brief/`) bleiben unverändert: Sie beschreiben den damaligen Stand.

## Nachtrag 22.11.2026 (Antigravity): Dev-Tools-Skript gefixt & Doku-Rangfolge geklärt
Branch `chore/prep-agents-and-dev-tools` (gemergt als PR #5, `889a09f`). Kein App-Code, kein Versionsbump.
- **`.cursor/install-dev-tools.sh` erstmals auf Ubuntu 24.04 (x86_64) end-to-end getestet und zwei reale Blocker behoben:**
  1. `ast-grep` 0.51.2: `app-x86_64-unknown-linux-musl.zip` war dynamisch gegen `/lib/ld-musl-x86_64.so.1` gelinkt und startete auf Ubuntu (glibc) nicht (`cannot execute: required file not found`). Umstellung auf das offizielle glibc-Archiv `app-x86_64-unknown-linux-gnu.zip` mit geprüfter SHA-256-Prüfsumme (`40604c21…`).
  2. `codebase-memory-mcp --ui=false` (Zeile 180) startete den stdio-MCP-Server im Vordergrund und blockierte das Skript dauerhaft. Zeile entfernt; `config set ui_enabled false` und `auto_index false` laufen nicht-blockierend.
  3. Vollständiger Skript-Durchlauf danach erfolgreich (Exit-Code 0, alle 3 Binaries unter `~/.local/bin` funktionsfähig, Repository indexiert: 9'709 Knoten / 10'903 Kanten).
- **Quellen-Rangfolge & Pfade vereinheitlicht:** In `AGENTS.md`, `README.md` und `design/README.md` explizit festgehalten, dass die akzeptierten ADRs (`docs/architektur/adr/*`, 15.11.) ältere Punkte aus `HANDOFF-entwickler.md` (6.11.) überschreiben (z. B. Dexie statt SQLite/WebCrypto in Phase 1, `content/locales/` statt `src/locales/`). Pfad in `AGENTS.md` angepasst, `ARCHITECTURE.md`-Stand auf `6d0c0a1` aktualisiert.
- **Sicherheitsprüfung:** in `docs/architektur/SECURITY.md` nachgeführt (SHA-256 gegen offizielle GitHub-Release-API verifiziert, keine Secrets, keine neuen Angriffsflächen).

## Nachtrag 22.11.2026 (Abend): Korrekturen nach Stabschef-Prüfung
Commit `c7bba31` (gemergt in PR #4, `6d0c0a1`). Nur Doku und das Hilfsskript `design/logos/animation/build_animation.py`, kein Cloud Agent.
- Abschnitt «Zusammenarbeit mehrerer Agents»: vor dem Merge geht der Head-SHA an Stabschef, auf dessen Ok warten, Merge erst nach dem Ja des Projektinhabers.
- Formulierung korrigiert: es gibt sieben Python-Hilfsskripte (unbedenklich), nicht «kein ausführbarer Code».
- `build_animation.py` schreibt nicht mehr in den Geschwisterordner `edovita-prototyp` ausserhalb des Repos. Ausgabe nur noch innerhalb des Repo-Stamms (`prototype/` bzw. `design/logos/animation/`), mit Pfadprüfung.

## Nachtrag 22.11.2026: Vorbereitung für lokale Arbeit mit Google Antigravity
Branch `docs/antigravity-setup` (gemergt als PR #4, `6d0c0a1`). Nur Doku, Design-Dateien, Inhalte und sieben Python-Hilfsskripte (Build, Validierung, Export; unbedenklich). Kein App-Code (keine React-App). Kein Cloud Agent gestartet.
- **Neu im Repo:** `design/` (Logos final/Export/Animation/Schrift, Briefing, Handoff, Decision-Log, Rechtsentwürfe, Store-Texte, String-Inventar, Sound-Manifest, 7 Sound-Favoriten) und `docs/architektur/inhalte/` (55 Lebensmittel, Glossare DE/EN/PT/JA, 5 Rezepte, Prüfskripte, CH-Nährwertdatenbank V7.1 als Quelle). Das war bisher nur lokal. Persönliche Angaben, interne Pfade und die Worker-URL sind entfernt (Prüfung mit `rg` und gitleaks ohne Funde).
- **AGENTS.md:** neuer Abschnitt «Zusammenarbeit mehrerer Agents» (ein Branch pro Aufgabe und Agent, nur PRs, Sicherheitsprüfung nach jeder Änderung, STATUS.md mit Commit, keine Secrets, keine Kosten ohne Ja, empfohlene lokale MCP-Server) und «Produktvorgaben Edovita» (Capacitor, Offline-PWA nur fürs fertige Produkt, Buttons fix unten, Dark Mode, Lottie/SVG, Sprachen, Schutzregeln). Antigravity liest `AGENTS.md` automatisch; keine zweite Regel-Datei.
- **README.md, ARCHITECTURE.md, `.gitignore` (`.agents/mcp_config.json`), `.cursorignore`** ergänzt. Cloud-Agent-Setup (`.cursor/`) unverändert.
- **Offen:** Mit E1 die Inhalte nach `content/` übernehmen (Entscheid war «mit E1 oder eigener PR»: jetzt als Entwurf im Repo). Entscheide aus dem Abschnitt «Offen» weiter beim Projektinhaber.

## Nachtrag 20.11.2026: MCP-Allowlist für Cloud-Agent-Umgebung
Branch `chore/mcp-allowlist` (Draft-PR, Basis main b6acf91, nicht mergen bis Stabschef-Ok und Ja des Projektinhabers). Kein Versionsbump.
- `.cursor/environment.json`: neu `mcpServerAllowlist` mit genau einem Eintrag, dem gehosteten Graphify-MCP (`https://api.graphify.com/mcp`). Alle anderen User- und Team-MCP-Server sind für Agents dieser Umgebung gesperrt, Cursor-eigene MCP-Server nicht. Feldnamen laut https://cursor.com/schemas/environment.schema.json; die Datei wurde gegen das Schema geprüft.
- AGENTS.md (Cloud-Abschnitt): Regel «MCP-Liste schlank halten; Serena nur nach positivem lokalem Test, dann ersetzt es codebase-memory-mcp».
- Die Datei wirkt nur, wenn «environment.json location» der Umgebung auf cursor.com auf dieses Repo zeigt. Sonst gleichen Eintrag im Dashboard von Hand setzen (Abschnitt «MCP servers» der Umgebung). Ungetestet: kein Cloud Agent gestartet (Kontingent bis 27.11.2026 erschöpft).

## Nachtrag 16.11.2026: Cloud-Agent-Setup
Branch `chore/cloud-agent-setup` (Draft-PR, nicht mergen bis Stabschef und Projektinhaber Ja sagen).
- `.cursor/environment.json` und `.cursor/install-dev-tools.sh`: ripgrep 14.1.1, ast-grep 0.51.2, codebase-memory-mcp 0.12.1, Versionen und SHA-256 gepinnt. `npm ci` erst, wenn ein Lockfile da ist (E0).
- `.cursorignore` für Lockfiles, Build, Audio, Screenshots, grosse generierte Dateien, Index-Ordner.
- Abschnitt «Cursor Cloud specific instructions» in AGENTS.md ergänzt.
- Der gehostete Graphify-MCP wird unter cursor.com/agents verbunden, nicht durch diesen PR.
- Nachzug CA-1/CA-2: Binaries nur unter `~/.local/bin` (kein `sudo`, kein `/usr/local/bin`); PATH setzt das Skript in `~/.profile` und `~/.bashrc`. `.codebase-memory/` steht in `.gitignore` und `.cursorignore`.
- Die Analyse mit lokalen Index-Tools (Hotspots, Aufrufer, Abhängigkeiten des Prototyps) wird ab E0 nachgeführt, mit dem dann aktuellen Commit-Stand. Bis E0 bleiben cbm/codegraph zurückgestellt; `ARCHITECTURE.md` bezieht sich weiter auf Commit `7ccbd06` (Prototyp).

## Aktuelles Ziel
Phase 1 ab 27.11.2026: Grundgerüst (E0), dann zuerst Rezept-Detailseite (E4) und zweisprachige Einkaufsliste (E5, E6).

## Erledigt
- Klick-Prototyp v5.4.1 als Referenz unter `prototype/` (15.11.2026).
- Architektur-Doku, ADR-001 bis ADR-005 akzeptiert (15.11.2026), ADR-006 akzeptiert (22.11.2026).
- GitHub-Issues `#6`–`#13` für E0–E7 angelegt (22.11.2026).
- Paket **E0** (Grundgerüst v0.1.0, Leitplanken, Rstest `0.12.6`, Playwright `390×844`, CI, Root-`SECURITY.md`) umgesetzt auf Branch `feat/e0-scaffold` (22.11.2026, Draft-PR wartet auf Stabschef-Ok und Ja des Projektinhabers).

## Entscheide (15.11. & 22.11.2026)
- Dexie in der Web-Phase, SQLite später mit der Handy-App (ADR-002).
- Zweitsprache ohne Rechts-Gate (ADR-003).
- Stack React, TypeScript (strict), Rsbuild, später Capacitor.
- Paketmanager nur `pnpm` mit 4-Tage-Mindestalter (`minimumReleaseAge: 5760`) und `ignore-scripts=true` (PR #14).
- Testrunner Rstest `0.12.6` mit `@rstest/adapter-rsbuild` statt Vitest (ADR-006); Playwright für Journeys.

## Plan Phase 1 (Issues `#6`–`#13`)
| Paket | Issue | Inhalt | Status / Voraussetzung |
|---|---|---|---|
| E0 | `#6` | Grundgerüst mit Leitplanken (Scaffold Phase 1), CI, SECURITY.md | umgesetzt (Draft-PR `feat/e0-scaffold`) |
| E1 | `#7` | Domäne, Lebensmittel-Katalog, Rezept-Schema, Inhaltsprüfung, übernimmt `docs/architektur/inhalte/` | offen (nach E0) |
| E2 | `#8` | i18n-Laufzeit und Registry | offen (nach E0) |
| E3 | `#9` | Speicherung mit Dexie | offen (nach E0) |
| E4 | `#10` | Rezept-Detailseite | offen (nach E1, E2, E3) |
| E5 | `#11` | Einkaufsliste mit drei Zuständen | offen (nach E1, E3) |
| E6 | `#12` | Zweitsprache | offen (nach E2, E5) |
| E7 | `#13` | PWA und Offline | offen (nach E0, eher Dez./Jan.) |
Details: `docs/architektur/issues-entwuerfe.md`, `docs/architektur/ablaufplan-und-schaetzung.md`.

## Offen / Entscheide nötig (wer?)
- Startinhalte (55 Lebensmittel, Glossare, 5 Rezepte, Prüfskript, Quelldatei CH-NWD) liegen unter `docs/architektur/inhalte/`; Übernahme nach `content/` folgt in E1 (`#7`).
- Nährwerte für 12 fehlende Lebensmittel (USDA) und 2 Näherungen (`rice_noodles`, `thai_basil`), Pho-Salzgehalt (5,7 g/Portion ohne Fischsauce), Probekochen, JA/PT-Namen gegenlesen (offen bis 26.11.) – Projektinhaber
- Issues `#6`–`#13`: Issue `#6` (E0) nach Merge abschliessen; in `#7` (E1) Rstest statt Vitest als Testrunner beachten (ADR-006).

## PR-Status (22.11.2026)
- Gemergt auf `main` (`40aa5b5`): PR #1 (Docs/AGENTS/STATUS), PR #2 (Cloud-Agent-Setup), PR #3 (MCP-Allowlist), PR #4 (Antigravity-Setup, `design/`, `docs/architektur/inhalte/`), PR #5 (Fix `.cursor/install-dev-tools.sh` & Quellen-Rangfolge), PR #14 (Regel «nur pnpm» & ADR-006 Rstest).
- Offen (Draft-PR): `feat/e0-scaffold` (Paket E0 – Grundgerüst mit Leitplanken, v0.1.0, Issue `#6`).

## Bekannte Probleme / Risiken
- Rstest (`0.12.6`) ist noch vor 1.0 (ADR-006): exakt gepinnt, in Dependabot ausgenommen, Rückweg zu Vitest dokumentiert.
- `eslint` auf `9.39.5` (wegen Peer-Range von `eslint-plugin-react@7.37.5`); bei ESLint-10-Support nachziehen.
- Repo ist öffentlich: keine Personendaten, keine Live-URL mit Namensteil; `gitleaks 8.30.1` läuft ab E0 automatisch in CI.

## Genutzte lokale Tools & vermiedene Cloud-Agent-Nutzung
- 16.11.: `rg` für Personendaten-Prüfung der Architektur-Doku vor dem Übernehmen (Doku-Teil von E0 erledigt, geschätzt 0,1–0,2 Agent-Tage gespart).
- 22.11. (Antigravity-VM, Vorarbeit): `.cursor/install-dev-tools.sh` erstmals real auf Ubuntu 24.04 getestet → zwei Blocker behoben (PR #5).
- 22.11. (Antigravity-VM, E0, analysierter Code-Stand Commit `9e45e9e9688d33e781d03d3b8e722b0af55f68d6`, PR #15):
  - **`codebase-memory-mcp 0.12.1`** (Stand `9e45e9e`): Repository indexiert mit **9'926 Knoten / 11'311 Kanten** (`parse_unusable: 0` nach YAML-Fix; neue Pakete `components`, `domain`, `theme`, `theme-init` sauber getrennt). **`dependency-cruiser`**: 32 Module / 44 Abhängigkeiten, 0 Verstösse + 3/3 Negativtests grün.
  - **`actionlint 1.7.12`** (SHA-256-verifiziert): `.github/workflows/ci.yml` ohne Befunde geprüft.
  - **`gitleaks 8.30.1`** (`dir` & `git` lokal sowie GitHub Actions Run `45042950181` auf `9e45e9e`): 0 Funde; CI-Job `Lint, Tests, Build & Audit` (45 s) und `Secret Scan (gitleaks)` (8 s) auf GitHub grün.
  - **`rg`**, **`pnpm audit`** (0 Schwachstellen), **Rstest `0.12.6`** (6/6 grün), **Playwright `390×844`** Hell & Dunkel (2/2 grün, HTTP-CSP- & `X-Robots-Tag`-Header geprüft).
  - **Vermiedene Cloud-Agent-Nutzung:** E0 inkl. Review-Nachbesserungen komplett ohne Cursor-Cloud-Agent-Kontingent umgesetzt (~1–1,5 Agent-Tage gespart).
  - **Rückmeldung zu den Tools:** `rg`, `ast-grep` (glibc) und `actionlint` laufen sehr schnell und zuverlässig. `codebase-memory-mcp` liefert hilfreiche Aufrufer-/Paketübersichten (kleine Kante: `parse_partial` bei kompakten CSS-Keyframe-Zeilen in `logo-anim.css`, unkritisch). **Rstest `0.12.6`** startet mit `@rstest/adapter-rsbuild` sehr schnell (~210–335 ms Build); für `@testing-library/jest-dom` braucht es `globals: true` in `rstest.config.ts` plus eine kleine Typ-Augmentierung (`tests/jest-dom.d.ts`). Playwright mit `rsbuild preview` erfordert auf Linux explizit `server.host: '127.0.0.1'`, da `rsbuild` sonst auf IPv6 `[::1]` bindet.
