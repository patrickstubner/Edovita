# Edovita – Klick-Prototyp v5.11 (200 Rezepte)

**Nicht produktiver Code.** Dieser Ordner ist die Design-Referenz und der klickbare Prototyp für UX-Versuche. Er wird nicht in die echte App übernommen; die App entsteht neu (React + TypeScript + Rsbuild).

- **Version:** v5.11 (24.11.2026), auf v5.10.1 aufbauend
- **Live:** als Cloudflare-Worker-Demo veröffentlicht (URL bewusst nicht im Repo)
- **Technik:** statisches HTML/CSS/Vanilla-JS, keine Laufzeit-Abhängigkeiten ausser `vendor/qrcode-generator.js` (MIT), keine Netzwerkaufrufe, strenge CSP
- **Daten:** nur erfundene Demo-Daten. Es werden keine Gesundheitsdaten gespeichert (localStorage nur Sprache, Zweitsprache (manuelle Wahl), Plan, Einkaufsliste inkl. Listenstatus, Darstellung, Ton, Region; keine Standortdaten). Export/Import enthalten nur Plan und Einkaufsliste.
- **Starten:** im Ordner `python3 -m http.server` und `http://localhost:8000/` öffnen (Handy-Breite, z. B. 390×844)

## Neu in v5.11
200 statt 15 Rezepte (45 Frühstück, 54 Mittag, 66 Abend, 35 Snacks; 23 Küchen; 74 mit Fleisch, 35 mit Fisch/Meeresfrüchten, 60 vegetarisch, 31 vegan), proteinreich: 193 von 200 erreichen den Richtwert (Hauptmahlzeit ≥ 25 g, Frühstück/Snack ≥ 15 g Protein pro Portion). Jedes Rezept hat Zutaten mit Mengen, Portionen, Schritte (de/en wie bisher), Titel in allen 7 Sprachen und Nährwerte, die `tools/build-recipes.py` aus den Zutaten berechnet. 144 neue Lebensmittel im Katalog (Namen in 7 Sprachen, Einkaufsgruppe). Daten liegen getrennt in `data/recipes-ext.js` (Quelle `tools/recipes-src/`); `app.js` hat nur einen kleinen, validierenden Merge-Hook. 177 Rezepte mit Pexels-Foto (neue: 640×480 und 400×300 WebP), 23 mit Platzhalter. Alle Rezeptbilder liefert der Worker jetzt aus Workers KV (Binding `IMG`) statt eingebettet. Prüfung: `python3 tools/validate-recipes.py`. Details in `IMAGES.md`, `ENTWICKLUNG.md` und `SECURITY.md`.

## Neu in v5.10.1
Vier niedrige Befunde zu v5.10 behoben: Import von Plan und Einkaufsliste ist transaktional (Snapshot und Rollback, Fehler sichtbar). Ein QR-Fragment ohne `offerShopImport` wird abgelehnt statt still angewendet. Listenstatus nur für bekannte Lebensmittel-IDs. QR-Rückfrage und Anwendung beziehen sich auf die aktuelle Einkaufsliste (inkl. Zeilen aus dem Plan). Details in `SECURITY.md`.

## Neu in v5.10
Die Tab-Leiste zeigt nur Rezepte, Plan und Profil; Heute, Erfassen und Fortschritt bleiben als Demo-Bildschirme über Profil › Weitere Funktionen (Demo) erreichbar. `#/profil/sprache` führt auf die Sprachseite. Unter Datenschutz gibt es einen echten Export und Import von Plan und Einkaufsliste (Bestätigung, transaktional, ohne Körperdaten). Der Listenstatus (offen / Einkaufswagen / zu Hause) bleibt nach dem Neuladen erhalten (`edovita.shopStatus`). Ein QR-Import fragt vor dem Übernehmen mit Ersetzen oder Ergänzen nach. Katalogsuche in der Einkaufsliste und PWA bleiben bewusst draussen. Details in `ENTWICKLUNG.md` und `SECURITY.md`.

## Neu in v5.9
Einkaufsliste zweisprachig (Haupt- und Zweitsprache aus den Dropdowns): Name in der ersten Zeile, Zweitsprache gedämpft plus Menge in der zweiten; ohne Zweitsprache bleibt die Zeile einzeilig. Das ⓘ-Sheet zeigt pro Gericht den zweisprachigen Namen, den Plan-Slot und die benötigte Menge, plus eine Summenzeile (Icon unverändert 28×28, Tippfläche 56×56). «Hab ich» öffnet ein Sheet: «Alles vorhanden» (vorausgewählt) oder Schieber/Stepper «Davon schon zu Hause», plus Zurücksetzen. Eine Teilmenge erscheint als Kaufmenge plus durchgestrichene Bedarfsmenge (z. B. 50 g und 100 g) und oranger «Teilweise»-Knopf (mind. 48×48). Vollständig vorhandene Mengen gelten als erledigt. Vorhandenes wird in `edovita.shopItems` gespeichert und bei Plan-Änderungen auf den neuen Bedarf gedeckelt. Details in `ENTWICKLUNG.md` und `SECURITY.md`.

## Neu in v5.8.1
Die Einkaufsliste ist einzeilig: die Herkunftszeile unter jeder Zutat entfällt. Stattdessen erscheint rechts ein Info-Button (sichtbares Icon 28×28 CSS-Pixel, Tippfläche 56×56, 16 CSS-Pixel Abstand zur Abhakzeile), der ein Bottom-Sheet mit Rezept und Plan-Slot öffnet, z. B. «Ofenlachs mit Brokkoli · Di Abend, 400 g». Das Icon kommt nur bei Zutaten aus Rezepten, löst das Abhaken nicht aus und schliesst mit Escape oder Tipp ausserhalb. Details in `ENTWICKLUNG.md` und `SECURITY.md`.

## Neu in v5.8
Lokale Rezeptbilder (nur Pexels, Lizenz ohne Pflicht zur Namensnennung; Herkunft intern in `IMAGES.md` und `images/recipes/manifest.json`). 12 von 15 Beispielrezepten haben ein Foto in Liste, Detail und Plan (Miniatur), drei behalten den neutralen Platzhalter. Bilder sind WebP ohne EXIF/GPS und im Worker gebündelt (CSP `img-src 'self'`, kein Hotlinking). Der Plan-Slot heisst «Snacks». «Auf die Einkaufsliste» aus einem Rezept setzt das Gericht zusätzlich in den nächsten freien passenden Slot (ab heute, im Planzeitraum; Toast mit Rückgängig). Zutaten werden nur einmal gezählt (Verknüpfung mit dem Plan-Slot). Details in `ENTWICKLUNG.md`, `IMAGES.md` und `SECURITY.md`.

## Neu in v5.7
Zweitsprache fest als zweiter kompakter Umschalter **links neben** dem Hauptumschalter in der Kopfzeile (Variante B). Variante A, Demo-Leiste und `?variant` entfallen. Standard der Zweitsprache folgt dem Ort (Zeitzone bzw. Sprache-Region, ohne Geolocation), sonst Englisch, sonst keine; eine manuelle Wahl hat Vorrang und wird erst dann gespeichert. Glossar-DE: «Brokkoli».

Neuer **Essensplan** (Tab «Plan», 3–7 Tage ab heute, Slots Frühstück/Mittag/Abend/Snacks). Rezepte lassen sich aus dem Detail mit «Zum Plan hinzufügen» oder per «+ Rezept» einfügen, tauschen und entfernen. «Einkaufsliste erstellen» sammelt die Zutaten im gewählten Zeitraum, skaliert nach Portionen, führt gleiche Artikel mit Mengen zusammen und zeigt die Herkunftsrezepte. Direktes Hinzufügen eines einzelnen Rezepts zur Liste bleibt möglich. Tagestotale kcal/Protein aus den vorhandenen Rezept-Beispieldaten. Details in `ENTWICKLUNG.md` und `SECURITY.md`.

## Neu in v5.6
Zwei vergleichbare Varianten für die **Zweitsprache** (Inhalte wie Lebensmittel- und Zutatenname, ADR-003). Umschaltbar über die Demo-Leiste und `?variant=a` / `?variant=b`.
- **A (empfohlen):** kompakter Chip «auch auf: PT» auf der Seite selbst (Einkaufsliste, Rezept-Detail); Kopfzeile bleibt mit nur dem Hauptumschalter schlank.
- **B:** zweiter Chip (Flagge plus Kürzel, inkl. «keine») direkt neben dem Hauptumschalter oben rechts.

Standard ist «keine», gespeichert in `localStorage`, geprüft gegen die Whitelist `de/en/pt/ja`. Die Zweitsprache darf nicht gleich der Hauptsprache sein. PT und JA dürfen in der Demo als Inhaltssprache erscheinen, auch wenn sie als UI-Sprache noch nicht freigegeben sind. Zusätzlich wählbar unter Profil › Sprache. Rezeptschritte, Titel und die restliche Oberfläche bleiben in der Hauptsprache. Dark/Light und der Hauptumschalter sind unverändert (v5.5). Details in `ENTWICKLUNG.md` und `SECURITY.md`.

## Neu in v5.5
Kompakter Sprachumschalter fest oben rechts auf allen Screens (Flagge plus zweistelliges Kürzel, Dropdown). Die volle Sprachliste ist von der Startseite entfernt. Standard ist die Browsersprache, falls sie freigegeben ist, sonst Englisch. Die Wahl wird lokal gespeichert und gegen eine Whitelist geprüft. Details in `ENTWICKLUNG.md` und `SECURITY.md`.

## Inhalt

| Pfad | Zweck |
|---|---|
| `index.html`, `styles.css`, `logo-anim.css`, `theme.js` | Screens, Layout, Dark Mode, Logo-Animation |
| `app.js`, `v1-features.js`, `data/v1-data.js`, `data/glossary.js` | Klicklogik, Schutzregeln, V1-Features, Lebensmittel-Glossar (DE/EN/PT/JA) |
| `i18n.js`, `locales/`, `locales.js` | Übersetzungen (7 Sprachen, `locales.js` aus `tools/build-locales.py` generiert) |
| `tools/` | Werkzeuge für Übersetzungen (Python, nur Standardbibliothek) |
| `audio/` | Erkennungsmelodie und Töne (KI-generiert, ACE-Step v1, Apache-2.0) |
| `screenshots/` | Bildschirmfotos 390×844 |
| `ENTWICKLUNG.md`, `SECURITY.md` | Versionsverlauf und Sicherheitsprüfungen des Prototyps |
| `_headers`, `worker.tpl.mjs`, `build-worker.py` | Auslieferung als Cloudflare Worker (das erzeugte `worker.mjs` ist nicht eingecheckt) |

Nicht eingecheckt: `worker.mjs` (Build-Artefakt, 2,2 MB) und `shots/` (alte Screenshots, 15 MB).
