# AGENTS.md – Edovita

## Projekt
- Zweck: Ernährungs-App mit Rezepten, Einkaufsliste und Zweitsprache für Lebensmittel. PWA zuerst, Handy-App mit Capacitor später.
- **Heute im Repo:** nur `README.md`, der Klick-Prototyp v5.4.1 unter `prototype/` (eingefrorene Design-Referenz, nicht produktiv, nicht erweitern) und die Architektur-Doku unter `docs/architektur/`. Noch kein App-Code.
- Stack (entschieden, kommt mit E0): React, TypeScript (strict), Rsbuild, React Router (Hash-Router), Dexie (IndexedDB) in der Web-Phase, SQLite später mit Capacitor, i18next mit ICU, zod. Tests: Vitest, Testing Library, Playwright (390×844), fake-indexeddb. Lint: ESLint, Stylelint (`csstools/use-logical`), dependency-cruiser.
- Architektur: ARCHITECTURE.md und `docs/architektur/` (ADR-001 bis ADR-005, Bausteine, Testplan, Pakete E0–E7). Stand: STATUS.md.

## Befehle
- Noch keine (`package.json` fehlt, kommt mit E0). Geplant laut `docs/architektur/testplan.md`: `npm ci`, `npm test`, `npm run lint`, `npm run build`, `npm run content:check`, `npm audit`. Diese Liste mit E0 an die echten Skripte anpassen.
- Prototyp lokal ansehen: in `prototype/` `python3 -m http.server`, dann `http://localhost:8000/`.

## Projektregeln
- Schichten und Ordner nach ADR-001, durchgesetzt mit dependency-cruiser ab E0.
- Gesundheitsdaten nur auf dem Gerät, kein Konto, kein Server, keine Analytics in Phase 1 (ADR-004). Service Worker cacht nie Nutzerdaten.
- Neue Sprache = Inhalt + Registry-Eintrag, kein Code. Zweitsprache ohne Rechts-Gate. RTL-fähig (logische CSS-Eigenschaften, `<bdi>`).
- Rezepte sind Daten, Nährwerte berechnet aus der Schweizer Nährwertdatenbank, nichts geschätzt (ADR-005).
- Kein `innerHTML`, kein `dangerouslySetInnerHTML`, CSP ohne `unsafe-inline`.
- `prototype/` nicht anfassen.

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
- Keine bezahlten Dienste und kein On-Demand ohne dem Ja des Projektinhabers.
- Merge immer als Squash-Merge mit `--match-head-commit <SHA>`. Autor und Committer nur mit der GitHub-noreply-Adresse des Repo-Kontos.
