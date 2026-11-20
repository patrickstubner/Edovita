# STATUS.md – Stand 16.11.2026, Commit 522e39e (main, inkl. #1)

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
- Inhalte (55 Lebensmittel, Glossare, 5 Rezepte, Prüfskript, Quelldatei Nährwertdatenbank) liegen lokal. Mit E1 übernehmen oder vorher als eigener PR? – Projektinhaber
- Nährwerte für 12–14 Lebensmittel fehlen, Probekochen, JA/PT-Namen gegenlesen (offen bis 26.11.) – Projektinhaber
- Issues E0–E7 auf GitHub anlegen? – Projektinhaber

## Offene PRs (16.11.2026)
- Docs-PR #1 ist gemergt.
- dieser Draft-PR: Cloud-Agent-Setup (`chore/cloud-agent-setup`)

## Bekannte Probleme / Risiken
- Noch keine CI und kein Secret-Scan im Repo (kommt mit E0).
- Repo ist öffentlich: keine Personendaten, keine Live-URL mit Namensteil.

## Genutzte lokale Tools & vermiedene Cloud-Agent-Nutzung
- rg: Personendaten-Prüfung der Architektur-Doku vor dem Übernehmen.
- Kein Code zum Indexieren (cbm/codegraph erst ab E0 sinnvoll; Analyse dann mit Commit-Stand nachführen).
- Der Doku-Teil von E0 ist damit erledigt, geschätzt 0,1–0,2 Agent-Tage gespart.
