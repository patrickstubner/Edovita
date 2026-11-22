# STATUS.md – Stand 22.11.2026, beruht auf Commit 6d0c0a1 (`main`, inkl. PR #1–#4)

## Nachtrag 22.11.2026 (Antigravity): Dev-Tools-Skript gefixt & Doku-Rangfolge geklärt
Branch `chore/prep-agents-and-dev-tools` (Draft-PR, Basis `main` `6d0c0a1`, nicht mergen bis Stabschef-Ok und Ja des Projektinhabers). Kein App-Code, kein Versionsbump.
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
- Architektur-Doku, ADR-001 bis ADR-005 akzeptiert (15.11.2026).
- Architektur-Doku als `docs/architektur/` im Repo, AGENTS.md, ARCHITECTURE.md, STATUS.md (dieser PR, lokal ohne Cloud Agent).

## Entscheide (15.11.2026)
- Dexie in der Web-Phase, SQLite später mit der Handy-App.
- Zweitsprache ohne Rechts-Gate.
- Stack React, TypeScript, Rsbuild, später Capacitor.

## Plan ab 27.11.2026 (ca. ein Drittel des Kontingents)
| Paket | Inhalt | Voraussetzung |
|---|---|---|
| E0 | Grundgerüst mit Leitplanken (Scaffold Phase 1), CI, SECURITY.md | – |
| E1 | Domäne, Lebensmittel-Katalog, Rezept-Schema, Inhaltsprüfung, übernimmt die lokal vorbereiteten Inhalte | E0 |
| E2 | i18n-Laufzeit und Registry | E0 |
| E3 | Speicherung mit Dexie | E0 |
| E4 | Rezept-Detailseite | E1, E2, E3 |
| E5 | Einkaufsliste mit drei Zuständen | E1, E3 |
| E6 | Zweitsprache | E2, E5 |
| E7 | PWA und Offline | E0, eher Dez./Jan. |
Details: `docs/architektur/issues-entwuerfe.md`, `docs/architektur/ablaufplan-und-schaetzung.md`.

## Offen / Entscheide nötig (wer?)
- Startinhalte (55 Lebensmittel, Glossare, 5 Rezepte, Prüfskript, Quelldatei CH-NWD) liegen seit PR #4 als Entwurf unter `docs/architektur/inhalte/`; Übernahme nach `content/` folgt in E1.
- Nährwerte für 12 fehlende Lebensmittel (USDA) und 2 Näherungen (`rice_noodles`, `thai_basil`), Pho-Salzgehalt (5,7 g/Portion ohne Fischsauce), Probekochen, JA/PT-Namen gegenlesen (offen bis 26.11.) – Projektinhaber
- Issues E0–E7 auf GitHub anlegen? – Projektinhaber

## PR-Status (22.11.2026)
- Gemergt auf `main` (`6d0c0a1`): PR #1 (Docs/AGENTS/STATUS), PR #2 (Cloud-Agent-Setup), PR #3 (MCP-Allowlist), PR #4 (Antigravity-Setup, `design/`, `docs/architektur/inhalte/`).
- Offen (Draft-PR): `chore/prep-agents-and-dev-tools` (Fix `.cursor/install-dev-tools.sh`, Quellen-Rangfolge, Doku-Abgleich).

## Bekannte Probleme / Risiken
- Noch keine CI und kein Secret-Scan im Repo (kommt mit E0).
- Repo ist öffentlich: keine Personendaten, keine Live-URL mit Namensteil.

## Genutzte lokale Tools & vermiedene Cloud-Agent-Nutzung
- 16.11.: `rg` für Personendaten-Prüfung der Architektur-Doku vor dem Übernehmen (Doku-Teil von E0 erledigt, geschätzt 0,1–0,2 Agent-Tage gespart).
- 22.11. (Antigravity-VM): `.cursor/install-dev-tools.sh` erstmals real auf Ubuntu 24.04 getestet → zwei echte Blocker in `install-dev-tools.sh` vor dem ersten Cursor-Cloud-Agent-Lauf gefunden und behoben (sonst wäre der erste Cloud-Agent-Build am hängenden `codebase-memory-mcp --ui=false` bzw. an der dynamisch gelinkten musl-`ast-grep`-Binary gescheitert). `ripgrep 14.1.1`, `ast-grep 0.51.2` (glibc) und `codebase-memory-mcp 0.12.1` installiert und Repo indexiert (9'709 Knoten, 10'903 Kanten). `validate.py` geprüft (0 Fehler; 6 inhaltliche Warnungen + fehlendes `openpyxl` in der VM).
