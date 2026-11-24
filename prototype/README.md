# Edovita – Klick-Prototyp v5.5 (UX-Versuch Sprachumschalter)

**Nicht produktiver Code.** Dieser Ordner ist die Design-Referenz und der klickbare Prototyp für UX-Versuche. Er wird nicht in die echte App übernommen; die App entsteht neu (React + TypeScript + Rsbuild).

- **Version:** v5.5 (24.11.2026), auf v5.4.1 aufbauend
- **Live:** als Cloudflare-Worker-Demo veröffentlicht (URL bewusst nicht im Repo)
- **Technik:** statisches HTML/CSS/Vanilla-JS, keine Laufzeit-Abhängigkeiten ausser `vendor/qrcode-generator.js` (MIT), keine Netzwerkaufrufe, strenge CSP
- **Daten:** nur erfundene Demo-Daten. Es werden keine Gesundheitsdaten gespeichert (localStorage nur Sprache, Darstellung, Ton, Region)
- **Starten:** im Ordner `python3 -m http.server` und `http://localhost:8000/` öffnen (Handy-Breite, z. B. 390×844)

## Neu in v5.5
Kompakter Sprachumschalter fest oben rechts auf allen Screens (Flagge plus zweistelliges Kürzel, Dropdown). Die volle Sprachliste ist von der Startseite entfernt. Standard ist die Browsersprache, falls sie freigegeben ist, sonst Englisch. Die Wahl wird lokal gespeichert und gegen eine Whitelist geprüft. Details in `ENTWICKLUNG.md` und `SECURITY.md`.

## Inhalt

| Pfad | Zweck |
|---|---|
| `index.html`, `styles.css`, `logo-anim.css`, `theme.js` | Screens, Layout, Dark Mode, Logo-Animation |
| `app.js`, `v1-features.js`, `data/v1-data.js` | Klicklogik, Schutzregeln, V1-Features mit Beispieldaten |
| `i18n.js`, `locales/`, `locales.js` | Übersetzungen (7 Sprachen, `locales.js` aus `tools/build-locales.py` generiert) |
| `tools/` | Werkzeuge für Übersetzungen (Python, nur Standardbibliothek) |
| `audio/` | Erkennungsmelodie und Töne (KI-generiert, ACE-Step v1, Apache-2.0) |
| `screenshots/` | Bildschirmfotos 390×844 |
| `ENTWICKLUNG.md`, `SECURITY.md` | Versionsverlauf und Sicherheitsprüfungen des Prototyps |
| `_headers`, `worker.tpl.mjs`, `build-worker.py` | Auslieferung als Cloudflare Worker (das erzeugte `worker.mjs` ist nicht eingecheckt) |

Nicht eingecheckt: `worker.mjs` (Build-Artefakt, 2,2 MB) und `shots/` (alte Screenshots, 15 MB).
