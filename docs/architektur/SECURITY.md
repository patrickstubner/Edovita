# Sicherheits-Kurzprüfung Prototyp v5.4.1

- **Datum:** 15.11.2026 (Zürich)
- **Geprüft:** Prototyp v5.4.1, heute `prototype/` (`app.js`, `v1-features.js`, `i18n.js`, `theme.js`, `vendor/edo-qr.js`, `data/v1-data.js`, `index.html`, `_headers`, `worker.tpl.mjs`, `build-worker.py`, `tools/*.py`)
- **Methode:** Code-Lesen, `rg` nach `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `eval`, `new Function`, `document.write`, Inline-Handlern/-Stilen, Netzwerkaufrufen und Secret-Mustern (AWS/GitHub/Slack/API-Key/Bearer). Kein dynamischer Test, kein `npm audit` (keine Laufzeit-Abhängigkeiten im Prototyp; Python-Werkzeuge nur Standardbibliothek).
- **Vorherige Prüfungen:** `prototype/SECURITY.md` (v4–v5.4). Diese Prüfung bestätigt sie und ergänzt Punkte für die echte App.

## Ergebnis

Keine kritischen und keine hohen Befunde. Der Prototyp ist bewusst ohne Netz, ohne Backend und ohne gespeicherte Gesundheitsdaten gebaut.

| # | Thema | Befund | Schwere | Fix-Vorschlag |
|---|---|---|---|---|
| 1 | XSS / Injection | Kein `innerHTML`, `eval`, `new Function`, `document.write`. Texte nur über `textContent`/`setAttribute` (Whitelist `ATTR_OK` in `i18n.js`). QR-SVG über `DOMParser`, nur `<svg>`-Wurzel übernommen. CSP ohne `unsafe-inline`/`unsafe-eval`. | kein Befund | In der App beibehalten: ESLint `react/no-danger` als Fehler, CSP-Test in CI |
| 2 | Eingabevalidierung QR-Import | `parseImport`: Regex auf Fragment, Länge ≤ 4000/3000, ≤ 40 Items, ID-Whitelist, Namen ohne `<>&"'`, `st` auf open/cart/home begrenzt. Übernahme erfolgt **ohne Rückfrage**, sobald jemand einen präparierten Link öffnet (Liste wird überschrieben). | niedrig | In der App: Bestätigungsdialog «X Artikel übernehmen?» mit Vorschau, nur bekannte `FoodId`, Ersetzen vs. Ergänzen wählbar |
| 3 | Eingabevalidierung localStorage | `edovita.v1`: `travelRegion` wird nur auf Typ `string` geprüft, nicht gegen `regions` (anders als `region`). Wirkung nur ein falscher Übersetzungsschlüssel, da Ausgabe per `textContent`. | niedrig | Gegen `D.regions` prüfen; in der App alle gelesenen Werte über `coerce*()`/zod |
| 4 | Geheimnisse | Keine Keys/Tokens im Code. Treffer für `AKIA` nur in Base64-Audio in `worker.mjs` (Zufall). `build-worker.py` erzeugt den Upload-Code ohne Zugangsdaten (`accountId`/Auth kommen aus der Laufzeit des Cloudflare-Werkzeugs). | kein Befund | Im Repo: Secret-Scan (gitleaks) in CI, `.env*` in `.gitignore` |
| 5 | Abhängigkeiten | Laufzeit nur `qrcode-generator` 1.4.4 (MIT, lokal gebündelt, Lizenz beigelegt). Keine CDNs, keine Fremd-Fonts. | kein Befund | In der App: `npm audit` pro PR, Dependabot, Lockfile committen |
| 6 | Datenschutz Gesundheitsdaten | Gewicht, Grösse, Geburtsdatum, Ziel, Mahlzeiten nur im Arbeitsspeicher (Demo-Werte), nicht gespeichert, nicht übertragen. localStorage nur Sprache, Theme, Ton, Melodie, Region/Fenster/Reise. | kein Befund (Prototyp) | App: ADR-004 (lokal, Backup aus, Export/Löschen, keine Scheinverschlüsselung im Browser, SQLCipher mit Capacitor) |
| 7 | Geteilte Einkaufsliste | QR/Teilen enthält nur ID, Name, Zustand, keine Gesundheitsdaten. Das QR-Fragment hängt an der aktuellen URL; geteilt wird damit die Prototyp-Adresse. | niedrig | In der App nur Lebensmittel-IDs teilen, Namen lokal auflösen (kürzere, robuste Payload) |
| 8 | Öffentliche Prototyp-URL | Cloudflare-Worker-Demo ohne Zugriffsschutz, `noindex`. Keine echten Daten. | niedrig | Nach Abschluss der App-Entwicklung Worker abschalten oder Cloudflare Access (gratis bis 50 Nutzer, vor Aktivierung prüfen) |
| 9 | Meta-CSP ohne `frame-ancestors` | Gilt nur, wenn `index.html` als Datei geöffnet wird; der Worker setzt den Header. | niedrig | In der App nur über HTTP-Header (`_headers`) |
| 10 | Medizinische Logik | Schutzregeln korrekt umgesetzt (`kcalFloor`, `wMin`, `loseBlocked`, `kcalSafe`, `checkDob`). `bmr()` kennt nur m/w. | mittel (fachlich, nicht technisch) | `sexForCalc` mit «keine Angabe» und konservativer Untergrenze; Grenzwerte und Texte vor Release medizinisch prüfen lassen |

## Vorgaben für die App (aus dieser Prüfung)

1. CSP wie Prototyp, aber `connect-src 'self'` für lazy geladene Inhalte; bei SQLite-WASM zusätzlich nur `'wasm-unsafe-eval'`, nie `'unsafe-eval'`.
2. Alles von aussen (QR, Import, Inhalte beim Build) durch zod; alles aus dem Speicher durch `coerce*()`.
3. Keine Nutzerdaten im Service-Worker-Cache.
4. Pro PR: `npm audit`, Secret-Scan, grep auf gefährliche Senken, Bericht mit Schweregrad an den Projektinhaber.

## Nachtrag 15.11.2026: Prototyp-Push und Inhalte

### Prototyp-Commit `7ccbd06` (`prototype/`, gepusht 15.11.2026, ersetzt den lokalen Entwurf `4369eb8`)

- Gitleaks 8.30.1: `gitleaks dir prototype` und `gitleaks git .` (2 Commits) ohne Funde. Keine `.env`, `.pem`, `wrangler.toml`, keine Tokens.
- Metadaten: MP3-ID3 nur Encoder (`Lavc61.19`), PNG ohne Text- oder EXIF-Blöcke. Keine Datei über 500 KB.
- Nichts ausserhalb von `prototype/` geändert. `prototype/README.md` kennzeichnet den Ordner als nicht produktiven Code.

| # | Schwere | Befund | Fix-Vorschlag |
|---|---|---|---|
| P1 | niedrig, **behoben** | Vorname und ein persönlicher Bezug in `locales/pt/meta.json` | vor dem Push in `meta.json`, `tools/build-locales.py`, `content.py` neutralisiert (Entscheid Projektinhaber 15.11.) |
| P2 | niedrig, **behoben** | Interne Ticket-IDs, lokale Pfade, Backup-Ordner, Worker-URL mit Namensteil in `ENTWICKLUNG.md`, `SECURITY.md`, `README.md` | vor dem Push neutralisiert; rg-Prüfung danach ohne Treffer |
| P5 | info | Commit-Autor-Mail ist die GitHub-noreply-Adresse des Repo-Kontos; Kontoname steht ohnehin in der Repo-URL | keiner |
| P6 | info | Orts- und Länder-Treffer im Code sind fachlich (Beratungsstelle, Ländername `region.BR`) | keiner |
| P3 | info | Telefonnummern in `index.html` sind öffentliche Hilfe-Nummern (PEP) | keiner |
| P4 | info | Bekannte Prototyp-Befunde (QR-Import ohne Bestätigung, `travelRegion` ohne Whitelist, `bmr()` nur m/w) werden mit dem Push öffentlich lesbar | nicht ausnutzbar (keine Server, keine Nutzerdaten); in E2/E3 beheben wie oben |

### Inhalte (`inhalte/`, seit 22.11.2026 im Repo)

- Kein ausführbarer App-Code; `build_inhalte.py` und `validate.py` lesen nur die lokale xlsx (SHA-256 geprüft) und schreiben JSON. Abhängigkeit `openpyxl` 3.1.5 (neuste Version, keine bekannte offene Lücke; liest nur die eigene, per SHA-256 geprüfte Datei).
- `validate.py` lehnt `<`, `>`, `&` und Steuerzeichen in allen Glossaren und Rezepttexten ab, prüft jede ID gegen den Katalog und alle Nährwerte gegen die xlsx. Negativtest mit 4 absichtlichen Fehlern: alle erkannt. Ein Absturz bei unbekannter Zutat (KeyError statt Meldung) wurde dabei gefunden und behoben.
- Allergene werden aus den Zutaten abgeleitet, nicht von Hand gesetzt; produktabhängige stehen als `allergensToCheck`.

| # | Schwere | Befund | Fix-Vorschlag |
|---|---|---|---|
| I1 | mittel (Gesundheit) | 14 Lebensmittel ohne Nährwerte, Rezeptsummen sind Mindestwerte; Pho hat 5,7 g Salz pro Portion ohne Fischsauce | App zeigt «mindestens» und Salz-Hinweis; Werte aus USDA ergänzen; salzarme Bouillon im Rezept |
| I2 | mittel (Allergie) | Currypaste (Krebstiere), Currypulver (Senf, Sellerie), Bouillon (Sellerie) produktabhängig | als «kann enthalten» anzeigen, nie als «frei von» |
| I3 | niedrig | 3 JA- und 3 PT-Namen unsicher | Gegenlesen durch Muttersprachler; bis dahin in `_status.json` markiert |
| I4 | info | Rezepttexte selbst geschrieben, Quellen nur zum Abgleich; CH-NWD erlaubt kommerzielle Nutzung mit Quellenangabe | Quellenangabe im Impressum der App |

## Nachtrag 16.11.2026: Cloud-Agent-Setup

Geprüft: `.cursor/environment.json`, `.cursor/install-dev-tools.sh`, `.cursorignore`, ergänzter Abschnitt in AGENTS.md. Kein App-Code, keine Secrets, keine Personennamen und keine lokalen Rechnerpfade in den neuen Dateien.

Das Install-Skript lädt ripgrep 14.1.1, ast-grep 0.51.2 und codebase-memory-mcp 0.12.1 von offiziellen GitHub-Releases, prüft SHA-256, setzt kein `curl|bash` ein und ruft nicht `codebase-memory-mcp install` oder `update` auf. Ohne `package-lock.json` entfällt `npm ci`.

| # | Schwere | Befund | Fix-Vorschlag |
|---|---|---|---|
| C1 | info | Keine kritischen, hohen oder mittleren Befunde in den neuen Dateien. | keiner |
| C2 | niedrig | Lieferkettenrisiko der Dritt-Binaries bleibt trotz Hash-Prüfung. | Hashes bei jedem Versionswechsel von der Release-Seite neu übernehmen. |
| C3 | niedrig, behoben | (CA-1) optionales `sudo` nach `/usr/local/bin` entfernt. | nur `~/.local/bin`, PATH im Skript |
| C4 | niedrig, behoben | (CA-2) `.codebase-memory/` war nicht ignoriert. | Eintrag in `.gitignore` und `.cursorignore` |

Nachzug 16.11.2026 (CA-1, CA-2): Das Install-Skript kopiert nicht mehr nach `/usr/local/bin` und verwendet kein `sudo`; die Werkzeuge liegen nur unter `~/.local/bin`, PATH setzt das Skript in `~/.profile` und `~/.bashrc`. `.codebase-memory/` steht in `.gitignore` und `.cursorignore`.

## Nachtrag 20.11.2026: MCP-Allowlist

Geprüft auf Basis main b6acf91. Nur Konfiguration: `.cursor/environment.json` (neu `mcpServerAllowlist`), Abschnitt in AGENTS.md, STATUS.md. Kein Anwendungscode, keine neuen Abhängigkeiten, keine Secrets, keine Personendaten, keine lokalen Rechnerpfade. Schema-Prüfung der JSON-Datei gegen https://cursor.com/schemas/environment.schema.json bestanden (Negativprobe mit unbekanntem Feld wird abgelehnt).

Wirkung: Agents dieser Umgebung laden nur den gehosteten Graphify-MCP; alle anderen User- und Team-MCP-Server sind gesperrt (weniger Tool-Beschreibungen pro Anfrage, kleinere Angriffsfläche durch fremde MCP-Tools). Keine kritischen, hohen oder mittleren Befunde. (M1, Info) Die Datei wirkt nur, wenn die Umgebung auf cursor.com sie verwendet; sonst gilt die Dashboard-Einstellung. (M2, Info) Passt das URL-Muster nicht, ist Graphify gesperrt und der Agent nutzt `codebase-memory-mcp` (steht in AGENTS.md). Nicht in der Cloud getestet.

## Nachtrag 22.11.2026: Fix `.cursor/install-dev-tools.sh` und Doku-Abgleich

Geprüft auf Basis `main` `6d0c0a1` (Branch `chore/prep-agents-and-dev-tools`). Geändert: `.cursor/install-dev-tools.sh`, `AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `STATUS.md`, `design/README.md`, `docs/architektur/SECURITY.md`. Kein App-Code, keine neuen Laufzeitabhängigkeiten.

- **Lieferkette / Hash-Prüfung:** `ast-grep` 0.51.2 von `app-x86_64-unknown-linux-musl.zip` auf das offizielle glibc-Release `app-x86_64-unknown-linux-gnu.zip` umgestellt. Die SHA-256-Prüfsumme (`40604c21c38d4c7581c56bdddeef277c56bf3c0113620aa96e78ae87e82366df`) wurde direkt gegen die offizielle GitHub-Release-API (`repos/ast-grep/ast-grep/releases/tags/0.51.2`) verifiziert und im Skript beim Download geprüft. Weiterhin nur HTTPS, kein `curl|bash`, kein `sudo`, Installation nur unter `~/.local/bin`.
- **Verfügbarkeit / Laufzeitverhalten:** Blockierender Aufruf `codebase-memory-mcp --ui=false` entfernt; Skript läuft auf Ubuntu 24.04 (x86_64) vollständig und idempotent durch (Exit-Code 0).
- **Secrets & Personendaten:** Diff- und `rg`-Prüfung auf Schlüssel, Tokens, Pfade und Personendaten ohne Funde.
- **Befunde:** Keine kritischen, hohen oder mittleren Befunde. (D1, niedrig, unverändert aus C2) Allgemeines Lieferkettenrisiko der Dritt-Binaries bleibt trotz Hash-Pinning; Hashes bei Versionswechsel erneut gegen die offizielle Release-Seite prüfen.

## Regel Mindestalter neuer Paketversionen (22.11.2026)

Neue Paketversionen kommen erst ins Projekt, wenn sie mindestens 4 Tage alt sind (Schutz vor kompromittierten Releases). Umsetzung mit E0: `pnpm-workspace.yaml` mit `minimumReleaseAge: 5760` und Dependabot-`cooldown` von mindestens 4 Tagen. Ausnahmen nur für Sicherheitslücken, die sich anders nicht beheben lassen: Paket in `minimumReleaseAgeExclude`, mit Kommentar (CVE/GHSA, Datum), nach 4 Tagen wieder entfernen. Edovita hat noch kein `package.json`; heute ist nichts zu prüfen, keine Ausnahme nötig.

## Nachtrag 22.11.2026: ADR-006 Rstest (nur Doku)

Geprüft am Branch `chore/pnpm-regel` (Draft-PR #14, Basis `main` `889a09f`). Quelle: Lesen der geänderten Dateien. Kein App-Code, kein `package.json`, keine neuen Abhängigkeiten im Repo (kommen mit E0).

Geändert: `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `STATUS.md`, `docs/architektur/testplan.md`, `docs/architektur/issues-entwuerfe.md`, neu `docs/architektur/adr/ADR-006-rstest.md`, diese Notiz.

- Keine Secrets, keine Personendaten, keine neuen Rechte, keine neue Angriffsfläche.
- Geplante Test-Pakete mit E0: `@rstest/core` 0.12.6 und `@rstest/adapter-rsbuild` 0.12.6, veröffentlicht am 3.11.2026 (älter als 4 Tage). Die 4-Tage-Regel gilt beim Install in E0 weiterhin; Version exakt pinnen, Updates bewusst (ADR-006). Vor 1.0: Breaking Changes möglich (bekannt aus 0.11). Rückweg zu Vitest ist dokumentiert (`https://rstest.rs/guide/migration/vitest`).
- Keine Prüfung mit `pnpm audit` (noch keine Lockdatei).

Keine kritischen, hohen oder mittleren Befunde.

