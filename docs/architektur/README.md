# Edovita: Architekturgrundlage für den Bau ab 27.11.2026

- **Stand:** 15.11.2026
- **Repo-Stand:** `patrickstubner/Edovita`, Commit `ed4d9fb` (nur `README.md`, öffentlich)
- **Prototyp (Referenz):** v5.4.1, im Repo unter `prototype/`, identisch mit der Live-Demo (Cloudflare Worker, URL bewusst nicht im Repo, Titel «Prototyp v5.4»). Ältere Stände nur lokal.
- **Weitere Quellen (lokal, nicht im Repo):** Brief, Entwickler-Handoff, Decision-Log, Rechtstexte, Strings, Hosting-Notiz, gespeicherte Entscheide des Projektinhabers (Zweitsprache 07./10.11., Rezept-Detailseite 07.11., Rezepte selbst geschrieben und gegengeprüft).
- **Graphify:** Workspace des Repo-Kontos. Was Graphify geliefert hat und was nicht: `graphify-befund.md`.
- Beim Erstellen (15.11.2026) wurde nichts gemergt oder als Issue angelegt. Keine Cloud Agents. Seit 16.11.2026 im Repo unter `docs/architektur/` (Docs-PR, Paket E0 Doku-Teil).

| Datei | Inhalt |
|---|---|
| `graphify-befund.md` | Was Graphify kann, was es zu Edovita und Travel Talk geliefert hat, wie der Prototyp hineinkäme |
| `review-2026-11-15.md` | Ist-Stand Repo vs. Prototyp, 8 Befunde mit Wirkung und Fix |
| `adr/ADR-001-schichten-und-ordner.md` | Schichtregeln, Ordnerstruktur, dependency-cruiser |
| `adr/ADR-002-datenmodell-und-speicherung.md` | Domänenmodell, Repository-Schnittstelle, IndexedDB/Dexie mit Migrationen, SQLite später |
| `adr/ADR-003-sprachen-und-lebensmittel.md` | i18n, Sprach-Registry, ein Lebensmittel-Katalog, Zweitsprache, neue Sprache = Inhalt + Registry, RTL |
| `adr/ADR-004-gesundheitsdaten-und-datenschutz.md` | Datenklassen, lokal, Backup standardmässig aus, Export/Löschen, CSP |
| `adr/ADR-005-rezeptinhalte-datengetrieben.md` | Rezepte als geprüfte Daten, Nährwerte berechnet aus der Schweizer Nährwertdatenbank, Gegenprüfung |
| `bausteine.md` | Typen, Dienste, Hooks und Komponenten, aus dem Prototyp abgeleitet |
| `testplan.md` | Journeys, Unit- und Vertragstests, Inhaltsprüfungen |
| `issues-entwuerfe.md` | E0–E7: kleine, agent-taugliche Pakete mit Akzeptanzkriterien (nicht angelegt) |
| `ablaufplan-und-schaetzung.md` | Reihenfolge ab 27.11., Agent-Tage mit und ohne Vorarbeit |
| `SECURITY.md` | Sicherheits-Kurzprüfung des Prototyp-Codes (v5.4.1) mit Schweregrad und Fix |

## Nachtrag 15.11.2026

- Alle ADRs **akzeptiert** (Projektinhaber, 15.11.): Dexie in der Web-Phase, SQLite mit der Handy-App; Zweitsprache ohne Rechts-Gate; Doku kommt mit E0 ab 27.11. als `docs/architektur/` ins Repo (macht der Entwickler).
- `inhalte/` (lokal vorbereitet, noch nicht im Repo, kommt mit E1): 55 Lebensmittel (CH-NWD 7.1), Glossare de/en/pt/ja, 5 Rezepte, Prüfskript.
- Prototyp als `prototype/` gepusht (Commit `7ccbd06`, Graphify 228 Knoten): `graphify-befund.md` §5.
