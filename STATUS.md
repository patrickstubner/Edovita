# STATUS.md – Stand 16.11.2026, Commit 7ccbd06

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
- nur dieser Docs-PR

## Bekannte Probleme / Risiken
- Noch keine CI und kein Secret-Scan im Repo (kommt mit E0).
- Repo ist öffentlich: keine Personendaten, keine Live-URL mit Namensteil.

## Genutzte lokale Tools & vermiedene Cloud-Agent-Nutzung
- rg: Personendaten-Prüfung der Architektur-Doku vor dem Übernehmen.
- Kein Code zum Indexieren (cbm/codegraph erst ab E0 sinnvoll).
- Der Doku-Teil von E0 ist damit erledigt, geschätzt 0,1–0,2 Agent-Tage gespart.
