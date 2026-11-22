# Edovita

Ernährungs-App mit Rezepten, Einkaufsliste und Zweitsprache für Lebensmittel. Web-App (PWA) zuerst, danach Handy-App mit Capacitor. Local-first: Gesundheitsdaten bleiben auf dem Gerät. App-ID `ch.edovita.app`.

**Stand:** Version `0.1.0` – Paket **E0** (Grundgerüst mit Leitplanken, React + TypeScript strict + Rsbuild + Rstest + Playwright + CI). Vorschau nach Merge auf `main`: https://patrickstubner.github.io/Edovita/ (Deploy nur über den Pages-Workflow). Aktueller Stand und nächste Schritte: [`STATUS.md`](STATUS.md).

## Inhalt

| Ordner | Zweck |
|---|---|
| `src/` | Echte App (ADR-001-Schichten: `pages`, `components`, `hooks`, `app`, `storage`, `catalog`, `i18n`, `nutrition`, `health`, `pwa`, `domain`) |
| `content/` | App-Inhalte (Datenbasis ab E1/E2: Lebensmittel, Glossare, Rezepte, Locales) |
| `public/` | Statische Dateien (`_headers` mit strikter CSP, `theme-init.js`, finale Logos) |
| `tests/` | Test-Setup (Rstest + Testing Library + `fake-indexeddb`) und Playwright-E2E (`390×844`) |
| `scripts/` | Leitplanken- und Sicherheitsprüfungen (`test-arch-guard.mjs`, `security-check.mjs`, `content-check.mjs`) |
| `prototype/` | Klick-Prototyp v5.4.1 (Vanilla-JS, eingefroren, nur Design-Referenz) |
| `design/` | Logos, Icon-Exporte, Logo-Animation, Schrift Quicksand (OFL), Briefing, Handoff, Decision-Log, Rechtsentwürfe, Store-Texte, 7 Sound-Favoriten |
| `docs/architektur/` | Architektur-Entscheide (ADR-001 bis ADR-006), Pakete E0–E7, Testplan, Startinhalte (`inhalte/`), historische Sicherheitsprüfung |

## Lokal starten (nur pnpm, Node >= 22)

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

### Prüfen, testen und bauen

```bash
pnpm run lint            # TypeScript (strict), ESLint, Stylelint (RTL), dependency-cruiser
pnpm run test:arch       # Negativtests für ADR-001-Schichtregeln
pnpm test                # Unit- & Komponententests (Rstest 0.12.6, ADR-006)
pnpm run content:check   # Inhaltsprüfung (Basis in E0, Vollausbau in E1)
pnpm run build           # Produktions-Build mit Rsbuild nach dist/
pnpm run security:check  # DOM-Senken, CSP, Build-HTML, Supply-Chain-Config
pnpm audit --audit-level=high
pnpm run test:e2e        # Playwright 390×844 (Hell & Dunkel, HTTP-CSP-Header)

# Pages-Build lokal prüfen (Assets unter /Edovita/, dann http://127.0.0.1:4173/Edovita/)
GITHUB_PAGES=true PAGES_DIST=dist-pages pnpm run build
GITHUB_PAGES=true PAGES_DIST=dist-pages pnpm run preview
```

### Prototyp und Startinhalte ansehen

```bash
# Eingefrorener Prototyp (Design-Referenz)
python3 -m http.server 8000 --directory prototype

# Startinhalte prüfen (optional: pip install openpyxl für xlsx-Rückverfolgung)
python3 docs/architektur/inhalte/tools/validate.py
```

## Vorschau auf GitHub Pages

Nach einem Merge auf `main` veröffentlicht der Workflow `.github/workflows/deploy-pages.yml` den Build unter https://patrickstubner.github.io/Edovita/. Es gibt keinen anderen automatischen Deploy. Keine eigene Domain und keine kostenpflichtigen Dienste ohne Ja des Projektinhabers. Die Seite bleibt mit `noindex` versehen.

## Mit Agents arbeiten (Cursor, Google Antigravity)

1. `AGENTS.md`, `ARCHITECTURE.md` und `STATUS.md` lesen. Antigravity lädt `AGENTS.md` automatisch.
2. Zuerst `docs/architektur/adr/` (ADR-001 bis ADR-006) und `design/brief/HANDOFF-entwickler.md` (Reihenfolge der Quellen bei Widerspruch: ADRs > Decision-Log > Handoff > Briefing > Hosting-Doku).
3. Ein Branch pro Aufgabe und Agent, Änderungen nur per Pull Request, nach jeder Änderung Sicherheitsprüfung (`SECURITY.md`), am Ende `STATUS.md` nachführen.
4. Keine Secrets ins Repo, keine kostenpflichtigen Dienste ohne Ja des Projektinhabers.

Das Repo ist öffentlich. Rechtliches (Datenschutz, Disclaimer) liegt nur als Entwurf vor und ist keine Rechtsberatung.
