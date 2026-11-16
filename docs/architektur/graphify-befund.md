# Graphify und Edovita: was geht, was geliefert wurde

- **Geprüft:** 15.11.2026, ca. 09:50 (Zürich)
- **Workspace:** Graphify-Workspace des Repo-Kontos, Free-Plan

## 1. Was im Index ist

| Repo | Status | Knoten | Index-Stand |
|---|---|---|---|
| `patrickstubner/Edovita` | ready | **2** (nur `README.md`, Inhalt «# edovita») | Commit `ed4d9fb`, indexiert 14.11.2026, 23:34 |
| `patrickstubner/Travel-Talk` | ready | 1'315 | Commit `8ae1686`, indexiert 13.11.2026, 19:05 |

`query_graph` zu Edovita («Welche Screens, Komponenten, Datenmodelle?») antwortet ehrlich mit «kein fundierter Treffer» (Score 0,02, Schwelle 0,35). `search "recipe"` liefert nichts.

## 2. Kann Graphify den Prototyp einlesen?

**Nein, nicht direkt.** Graphify hat keine Funktion, um lokale Dateien oder Ordner hochzuladen. Es indexiert nur GitHub-Repos, die über die Graphify-GitHub-App freigegeben sind (`graphify_help`: Setup = GitHub-App, Repo aktivieren, Index abwarten). Die MCP-Werkzeuge sind nur lesend (Suche, Graph-Abfragen, Aufrufer, Wirkungsradius, PR-Review-Status) plus eine Notiz-Funktion (`remember`/`recall`).

Der Prototyp lag damals nur lokal, das Repo war leer. Deshalb **konnte ich den Prototyp nicht einlesen lassen**. Es gab keine kostenpflichtige Aktion und kein Upgrade.

Plan-Hinweis von Graphify: «On the Free plan, only README.md is indexed from a repository's documents». Code-Dateien (JS/TS) werden indexiert, Markdown-Dokumente ausser README nicht.

### Weg, falls der Projektinhaber es will (braucht sein Ja, weil es ein Push ins öffentliche Repo ist)

1. Prototyp als Referenz in einen Ordner `prototype/` im Repo legen. Weglassen: `worker.mjs` (2,2 MB Build-Artefakt), `locales.js` (generiert, 400 KB), `audio/`, `screenshots/`, `shots/`.
2. Graphify indexiert den Push automatisch (Free-Plan, keine Kosten bekannt).
3. Danach können die Agents `query_graph`/`graphify_find` auf den Prototyp anwenden.

**Ehrliche Einschätzung des Nutzens:** mittel. Der Prototyp ist Vanilla-JS in zwei grossen IIFE-Dateien (`app.js` 1'516 Zeilen, `v1-features.js` 683 Zeilen) mit globalem `state`. Graphify findet darin Funktionen (ca. 170) und Aufrufe, aber kaum Module oder Typen, an denen sich eine Architektur ablesen lässt. Die Architektur-Arbeit dieses Ordners ersetzt das weitgehend. Wichtig ist der Prototyp als **Design-Referenz** (Screens, Texte, Schutzregeln), und die steht hier bereits in `bausteine.md` und `review-2026-11-15.md`.

**Der grosse Nutzen kommt ab dem ersten echten Code:** Sobald E0 (Grundgerüst) im Repo ist, indexiert Graphify jeden Commit. Dann können die Agents Wirkungsradius, Aufrufer und Tests pro Datei abfragen, statt den Code selbst zu durchsuchen. Bei Travel Talk hat `query_graph` für eine Storage-Frage 5'022 Token geliefert, gegenüber ca. 10'900 Token beim Lesen der Dateien (Graphify-Angabe `counterfactual_tokens`).

## 3. Was Graphify tatsächlich geliefert hat

| Frage | Ergebnis | Verwendet in |
|---|---|---|
| Edovita: Screens, Komponenten, Modelle | nichts (nur README indexiert) | – |
| Travel Talk: wo liegen i18n, Spracherkennung, Settings, Dexie, Migrationen? | 11 Dateien gerankt: `storage/types.ts` (`coerceSettings`, `defaultSettings`), `storage/dexie-repository.ts` (`LegacySettingsRow`, `switchPerson`), `storage/import.ts` (`settingsFromV4`, `settingsFromBundle`), `app/labels.ts` (`interfaceLang`), `components/LanguageChoice.tsx` | ADR-002, ADR-003, bausteine.md |
| Travel Talk: Repository-Schnittstelle Dexie/Memory, Migration alter Settings | Volle Definitionen von `ProgressRepository`, `MemoryProgressRepository`, `coerceSettings()` (jedes Feld gegen Whitelist geprüft, unbekannte Werte fallen auf Standard), zod-validierte Import-Bundles mit Formatversion | ADR-002 (gleiches Muster für Edovita, inkl. Memory-Repo für Tests) |

Die Lehren aus dem Travel-Talk-Review vom 13.11. (Gott-Kontext `AppProvider`, Zyklus `storage` ↔ `audio`, Grundtyp `Lang` in einer Inhaltsdatei, Inhalte auf zwei Wegen gelesen) stammen aus der damaligen Graphify-Analyse. Sie sind in ADR-001 bis ADR-003 als Regeln **von Anfang an** eingebaut, damit Edovita sie nicht wiederholt.

## 4. Was ich selbst aus den Dateien abgeleitet habe

Alles Prototyp-Spezifische: Screen-Liste, Datenstrukturen (`state`, `RECIPES`, `SHOP`, `EdoV1Data`), die sechs getrennten Lebensmittel-Vokabulare, Schutzregeln (`kcalFloor`, `wMin`, `loseBlocked`, `checkDob`, `kcalSafe`), i18n-Laufzeit (`i18n.js`), Sicherheitsbefunde. Methode: `rg`, Lesen von `app.js`, `v1-features.js`, `i18n.js`, `vendor/edo-qr.js`, `data/v1-data.js`, `locales/*`, `_headers`, `build-worker.py`, sowie Brief, Handoff und Decision-Log.

## 5. Nachtrag 15.11.2026: Prototyp gepusht und indexiert

- Der Projektinhaber hat am 15.11. entschieden: «Prototyp: Persönliches entfernen, dann pushen». Vor dem Push entfernt: Vorname, ein persönlicher Bezug in `locales/pt/meta.json` (Quelle `content.py`, neu gebaut), Worker-URL mit Namensteil, interne Ticket-IDs, lokale Pfade und Backup-Ordnernamen. Der lokale Commit wurde per Amend ersetzt, die alte Fassung war nie auf GitHub.
- Commit `7ccbd06` auf main (vorher `ed4d9fb`): https://github.com/patrickstubner/Edovita/commit/7ccbd0632d29a03bb9dba1daf365bdaf62a4addc · 101 Dateien, nur `prototype/`. Gitleaks danach: keine Funde. Klicktests `v54.js` und `ptcheck.js` lokal gegen den Repo-Stand: PASS, 0 Konsolenfehler.
- Mit drin: `locales.js`, `audio/`, `screenshots/` (vollständige, startbare Referenz). Weggelassen: `worker.mjs`, `shots/`.
- **Graphify:** neu indexiert am 15.11.2026 um 10:37 (Zürich), Commit `7ccbd06`, ca. 1 Minute nach dem Push. `graph_stats`: **228 Knoten** (vorher 2), 486 Kanten, 25 Communities. `list_repositories`: status ready, queryable.
- Test: `graphify_callers bmr` findet die zwei echten Aufrufer `kcalSafe()` und `renderKcal()` in `prototype/app.js` (typisiert aufgelöst). `query_graph` mit einer deutschen Freitextfrage nach BMR und Zustandsprüfung lieferte dagegen vor allem unpassende Funktionen (`applyWidths`, `renderQr`, …). Fazit: Für Aufrufer, Einfluss und Symbolsuche brauchbar; für semantische Fragen besser englisch und mit Symbolnamen fragen. Markdown ausser README.md wird im Free-Plan nicht indexiert.
