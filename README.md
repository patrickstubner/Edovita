# Edovita

Ernährungs-App mit Rezepten, Einkaufsliste und Zweitsprache für Lebensmittel. Web-App (PWA) zuerst, danach Handy-App mit Capacitor. Local-first: Gesundheitsdaten bleiben auf dem Gerät. App-ID `ch.edovita.app`.

**Stand:** Der App-Code existiert noch nicht. Das Repo enthält den Klick-Prototyp als Design-Referenz, die Architektur-Doku, die Startinhalte und alle Design- und Produktvorgaben. Aktueller Stand und nächste Schritte: [`STATUS.md`](STATUS.md).

## Inhalt

| Ordner | Zweck |
|---|---|
| `prototype/` | Klick-Prototyp v5.4.1 (Vanilla-JS, eingefroren, nur Design-Referenz) |
| `design/logos/` | Finales Logo (SVG/PNG, hell/dunkel/weiss), Icon-Export (PWA, Android, Apple, Capacitor), Logo-Animation, Schrift Quicksand (OFL) |
| `design/brief/` | Briefing, Entwickler-Übergabe, Decision-Log, Rechtsentwürfe, Store-Texte, String-Inventar, Sound-Manifest |
| `design/sounds/favoriten/` | 7 ausgewählte Sounds (KI-generiert, siehe `design/brief/legal/credits-lizenzen.md`) |
| `docs/architektur/` | Architektur-Entscheide (ADR-001 bis ADR-005), Pakete E0–E7, Testplan, Sicherheitsprüfung |
| `docs/architektur/inhalte/` | Startinhalte: 55 Lebensmittel, Glossare DE/EN/PT/JA, 5 Rezepte, Prüfskripte |

## Lokal starten

Prototyp ansehen (Python 3 genügt):
```bash
cd prototype
python3 -m http.server 8000
# http://localhost:8000/ im Browser, Handy-Ansicht 390×844
```

Startinhalte prüfen (`pip install openpyxl`):
```bash
python3 docs/architektur/inhalte/tools/validate.py   # Ergebnis: OK
```

Die echte App (React, TypeScript, Rsbuild, Capacitor) entsteht ab Paket E0; dort kommen `pnpm install --frozen-lockfile`, `pnpm run dev`, `pnpm test`, `pnpm run build` dazu (nur pnpm, nach `corepack enable`). Die Befehle stehen dann hier und in `AGENTS.md`.

## Mit Agents arbeiten (Cursor, Google Antigravity)

1. `AGENTS.md`, `ARCHITECTURE.md` und `STATUS.md` lesen. Antigravity lädt `AGENTS.md` automatisch.
2. Zuerst `docs/architektur/adr/` (ADR-001 bis ADR-005) und `design/brief/HANDOFF-entwickler.md` (Reihenfolge der Quellen bei Widerspruch: ADRs > Decision-Log > Handoff > Briefing > Hosting-Doku).
3. Ein Branch pro Aufgabe und Agent, Änderungen nur per Pull Request, nach jeder Änderung Sicherheitsprüfung, am Ende `STATUS.md` nachführen.
4. Keine Secrets ins Repo, keine kostenpflichtigen Dienste ohne Ja des Projektinhabers.

Das Repo ist öffentlich. Rechtliches (Datenschutz, Disclaimer) liegt nur als Entwurf vor und ist keine Rechtsberatung.
