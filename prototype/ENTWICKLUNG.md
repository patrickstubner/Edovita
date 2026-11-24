# Stand v5.8.1 (24. November 2026)

Kurznachtrag zur Einkaufsliste: Herkunftstext unter den Zutaten entfernt, dafür Info-Button (ⓘ 28×28 CSS-Pixel in einer Tippfläche 56×56, 16 CSS-Pixel Abstand zur Abhakzeile) und Bottom-Sheet mit Rezept/Plan-Slot. Siehe `SECURITY.md`. Darunter der Stand v5.8.

# Stand v5.8 (24. November 2026)
Lokale Rezeptbilder (Pexels, ohne Pflicht zur Namensnennung, intern in `IMAGES.md` dokumentiert) in Liste, Detail und Plan. Plan-Slot «Zwischenmahlzeit» heisst «Snacks». «Auf die Einkaufsliste» plant das Rezept zusätzlich in den nächsten freien passenden Slot (Toast mit Rückgängig; Zutaten nur einmal gezählt). Dark/Light und Sprachumschalter unverändert.

---

# Stand v5.7 (24. November 2026)
Zweitsprache fest in der Kopfzeile links neben dem Hauptumschalter. Orts-Standard ohne Geolocation (Zeitzone/Sprachtags), nicht gespeichert bis zur manuellen Wahl. Essensplan für 3–7 Tage, Einkaufsliste aus dem Plan (skaliert, zusammengeführt, mit Rezeptangabe). Glossar «Brokkoli». Dark/Light unverändert.

---

# Stand v5.6 (24. November 2026)
Zweitsprache zum Vergleich in zwei Varianten (A auf der Seite, B oben rechts neben dem Hauptumschalter). Umschaltung über Demo-Leiste und `?variant=a|b`. Standard «keine», Whitelist `de/en/pt/ja`, nicht gleich der UI-Sprache, Speicher `edovita.secondLang`. Zweisprachige Namen nur bei Zutaten und Einkaufspositionen (ADR-003); Schritte und UI bleiben in der Hauptsprache. Neue Datei `data/glossary.js`. Hauptumschalter und Dark/Light unverändert.

---

# Stand v5.5 (24. November 2026)
Kompakter Sprachumschalter oben rechts (Flagge + Kürzel, Dropdown) auf allen Screens. Volle Sprachliste von der Startseite entfernt. Default: Browsersprache, sonst Englisch. Wahl in localStorage, Whitelist in `i18n.js` (`approved`).

---

# Edovita – Klick-Prototyp v5
Statischer, mobile-first Klick-Prototyp (HTML/CSS/Vanilla-JS, keine Laufzeit-Abhängigkeiten, keine echten Daten). Einstieg: **`index.html`** (Startbildschirm `#/start`). Für Töne über einen lokalen Server öffnen (z. B. `python3 -m http.server`), per Doppelklick geht alles ausser Audio je nach Browser.

## Neu in v5 (6. November 2026)
- **Mehrsprachig: DE (Quelle), EN (Fallback), FR, IT, ES, JA.** Struktur `locales/<code>/{meta,ui,legal,recipes,store}.json` + `locales/languages.json` (aktive und geplante Sprachen). Übersetzungen sind Entwürfe (`reviewed=false`), `legalApproved=true` ist simuliert (`legalNote`).
  - **Wo ändern:** Startbildschirm (mit Erkennung der Gerätesprache), Sprach-Chip oben im Onboarding, Profil → Sprache und Ton → Sprache.
  - **Wann:** jederzeit, sofort, ohne Neustart; Ziele, Mahlzeiten, Bewertungen, Einkaufsliste bleiben erhalten. Zahlen/Datum folgen der Sprache (de-CH, en-GB, fr-CH, it-CH, es-ES, ja-JP).
  - **Nicht freigegeben (ausgegraut):** PT, HI, KO, BN (geplant), TR (nur ohne Backup, Registrierung offen), ID (gesperrt, Registrierungspflicht).
  - Werkzeuge: `tools/extract-i18n.py` (HTML → Schlüssel, einmalig), `tools/build-locales.py` (prüft fehlende Schlüssel, Platzhalter, Klammern, HTML; erzeugt JSON und `locales.js`). Quelltexte in `tools/i18n-src/`.
- **Töne:** Erkennungsmelodie H1/H5/H4 (KI-generiert, ACE-Step) und Stings Aufbruch/Erfolg/Zusammen; Ton-Schalter auf Start, Heute und Profil → Töne. Melodie läuft mit der Start-Animation, Erfolg bei Belohnungen, Zusammen beim Partner-Verbinden.
- **Animationen:** Logo-Animation zusätzlich als Endlosschleife (Profil → Darstellung).
- **Erfassen:** Text- und Sprach-Eingabe (Simulation) mit Portion klein/mittel/gross; Foto-Erkennung als «Später».
- **Rezepte:** Filter getrennt nach Mahlzeit (eine) und Eigenschaften (mehrere), Sterne, Merkliste, Vorschläge nach Bewertung mit Abwechslung (auch Thai, Vietnamesisch, Japanisch …).
- **Einkaufsliste:** drei klare Zustände: offen, im Korb (antippen), schon zu Hause («Hab ich»); Aktionen der Läden als «Nach V1».
- **Partnermodus:** Sam sieht Rezepte, Liste, Restkalorien, Mahlzeiten; Gewicht standardmässig privat; Verbinden per QR, 6-stelligem Code oder WhatsApp-Link; Trennen jederzeit.
- **Datenschutz:** lokal, Backup standardmässig aus, Einschalten nur mit ausdrücklicher Einwilligung (EU, verschlüsselt); Export/Löschen; Rechtliches mit Gesundheitshinweis und Credits.
- Screenshots v5 (390×844): `screenshots/01-start-sprachwahl-de.png`, `02-sprache-einstellungen-fr.png`, `03-heute-ja.png`, `04-rezepte-en.png`, `05-toene-de.png`.

---

# Stand v4
Statischer, mobile-first Klick-Prototyp (HTML/CSS/Vanilla-JS, keine Laufzeit-Abhängigkeiten, keine echten Daten). Einstieg: **`index.html`** (per Doppelklick im Browser öffnen, am besten Handy-Breite; Navigation per `#/screen`).

## Neu in v4 (5. November 2026)
- **Finales Logo** aus `edovita-docs/logos/final/` (Kopien in `assets/`): App-Kopfzeile, Splash, Profil-Fusszeile, Favicon. Gruppen-IDs `#symbol #fork #leaf #midrib #veins #heart #pulse #wordmark` bleiben im Splash-SVG erhalten.
- **Dunkelmodus:** Wahl «System / Hell / Dunkel» im Profil (Abschnitt Darstellung) und Schnellschalter (Mond/Sonne) oben auf «Heute». Standard = Geräteeinstellung (`prefers-color-scheme`). Grund reines Schwarz, Karten leicht angehoben. Symbol bleibt unverändert (weisses Blatt, rotes Herz, weisser Puls, grüner Verlauf), der Schriftzug «Edovita» wird weiss. Diagramme, Banner, Toast, Benachrichtigung sind angepasst. Einzige gespeicherte Einstellung: `localStorage["edovita.theme"]` (`light`/`dark`, fehlt = System). Dunkle Logo-Varianten: `edovita-docs/logos/final/edovita_logo_dark.svg/.png` (schwarzer Grund) und `edovita_logo_dark_transparent.svg/.png`.
- **Start-Animation (Splash):** Das Logo setzt sich Stück für Stück zusammen (Kachel, Gabel, Blatt, Adern, Herz, Puls, Schriftzug), danach schlägt das Herz zweimal im Lub-Dub-Rhythmus, ein EKG-Strahl läuft durch die Pulslinie. Tippen, Enter, Esc oder Leertaste überspringen. Wiederholbar über Profil → «Start-Animation ansehen». Mit `prefers-reduced-motion` erscheint das fertige Logo ohne Bewegung.
  Die Animation ist dieselbe wie in der Standalone-Datei (`edovita-docs/logos/animation/`, dort als Endlosschleife mit Zerfall). Die Keyframes entstehen aus `build_animation.py` und liegen hier als `logo-anim.css`.
- **Native Capacitor-Variante:** Das Native Launch Screen (iOS Storyboard / Android Splash) zeigt nur die einfarbige Fläche (hell `#FFFFFF`, dunkel `#000000`, passend zum Splash). Die WebView startet dieselbe Animation (`@capacitor/splash-screen` mit `launchAutoHide: false`, `SplashScreen.hide()` sobald das erste Bild der Animation steht, sonst blitzt die Fläche). Mindestdauer ca. 2.8 s (Zusammenbau), danach sofort ausblenden, sobald die App bereit ist. Die Animation wird also wiederverwendet, nicht neu gebaut.
- **Belohnungs-Animation (Lottie-artig):** Herz mit Puls, Fortschrittsring und Konfetti aus Blättern/Punkten, ausgelöst bei Mahlzeit gespeichert, Wasserziel erreicht und Training geschafft (Demo: Profil → «Belohnungs-Animation ansehen»). Umsetzung als Vektor-Keyframes (SVG/CSS) ohne Bibliothek. In der nativen App kann sie durch eine echte Lottie-Datei ersetzt werden (nur gebündelte, geprüfte JSON-Dateien, siehe SECURITY.md).
- **SVG-Loader:** schlagendes Herz mit EKG-Strahl (Klasse `.loader`), im Rhythmus der Logo-Animation; ersetzt den runden Spinner bei der KI-Analyse.

## Ziel-abhängige Eingaben und Texte (Fehlerbehebung 5. November 2026)
- **Gewichtseingabe:** bei «Zunehmen» und «Gewicht halten» ab 25 kg, bei «Abnehmen» ab 40 kg (zusätzlich ist Abnehmen bei BMI unter 18.5 gesperrt).
- **Hinweise je Ziel (Abnehmen / Halten / Zunehmen):** Bei Zunehmen und niedrigem BMI erscheint ein unterstützender Hinweis (Hausarzt, Ernährungsberatung, ärztlich begleiteter Aufbau), nie «Abnehmen»-Wortlaut. Kalorienziel bei Zunehmen = Bedarf plus leichter Überschuss; Heute, Wochenrückblick, Gewichtsverlauf (Demodaten steigend) und Rezept-Texte passen sich dem Ziel an.
- **Für die echte App:** Dieselben Regeln gehören in die V1-Spezifikation (Untergrenzen je Ziel, Texte je Ziel, medizinische Prüfung der Grenzen und Formulierungen).

## Offline-first (nur für die Produkt-App, V1-Pflicht)
Im Prototyp gibt es bewusst **kein** Service Worker, kein Manifest und keine Offline-Funktion. **Für V1 ist Offline-first eine Pflichtanforderung:** App-Shell, Rezeptdaten, Sounds und Animationen werden nach dem ersten Start vorab geladen (Precache, versioniert); nur Backup und Partner-Sync brauchen Netz, Änderungen werden bei fehlendem Netz in eine Warteschlange gelegt und später synchronisiert (siehe `architektur-hosting.md`, Local-first). In der Capacitor-App liegen die Dateien ohnehin im Bundle; ein Service Worker ist nur für die Web-Version nötig. Sicherheitsvorgaben dafür stehen in `SECURITY.md` (Abschnitt «Vorgaben für V1»).

## Bestehende Funktionen (unverändert)
- Onboarding: `onboarding` (Ziel) → `onboarding2` (Körperdaten) → `onboarding3` (Zielgewicht und Tempo) → `onboarding4` (Allergien und Vorlieben) → `heute`.
- Screens: heute (inkl. Wasser, Plananpassung), details, erfassen (Foto, Barcode, Favoriten), rezepte, einkauf, restaurant, woche, kraft, fortschritt (Gewicht + BMI-Bänder, Körperfett), koerper, profil, daten, ziel, vorlieben, erinnerungen, hilfe, partner, arzt.
- Schutzmechanismen: kein Abnehmen-Ziel bei BMI unter 18.5, kein Zielgewicht unter BMI 18.5, Tempo-Obergrenze 1 kg/Woche, Mindest-Tagesziel 1'500 kcal (Männer) / 1'200 kcal (Frauen), Hinweis mit Hilfsangeboten (Screen `hilfe`).
- Sprache: Deutsch mit Schweizer Schreibweise (ss statt ß). Schrift: System-Schrift, Fliesstext 17 px.

## Dateien
`index.html` (Einstieg) · `styles.css` · `logo-anim.css` · `app.js` · `theme.js` (läuft synchron im `<head>`, verhindert Aufblitzen) · `assets/` (Logos) · `shots/` (Screenshots) · `SECURITY.md` · `worker.tpl.mjs` + `build-worker.py` (erzeugt `worker.mjs` für Cloudflare; deployt auf die Live-Demo (Stand v5.4)).

## Screenshots (`shots/`)
- `v4-uebersicht-hell.png`, `v4-uebersicht-dunkel.png` (Überblick)
- `v4-splash-hell-ablauf.png`, `v4-splash-dunkel-ablauf.png` (Splash in 5 Phasen) und Einzelbilder `v4-splash-<hell|dunkel>-<phase>.png`
- `v4-<hell|dunkel>-<onboarding|heute|rezepte|fortschritt|koerper|loader|erfassen-ergebnis|profil-darstellung|belohnung>.png`
- `v4-system-dunkel-heute.png` (Gerät dunkel, keine Wahl gespeichert → App dunkel)
- ältere Screenshots (ohne Logo, nur hell): `00-…` bis `14-…`

## Logo-Animation (Standalone)
`edovita-docs/logos/animation/`: `edovita_logo_animation.html` (Endlosschleife, `?theme=dark|light`, `?bare=1` ohne Schaltflächen), Vorschauen `edovita_logo_animation_<light|dark>.mp4/.gif` und `…_filmstrip.png`, Generator `build_animation.py`.

## Deployment / Prüfung
`python3 build-worker.py` erzeugt `worker.mjs` (alle Dateien eingebettet, PNGs ausgenommen). Sicherheit: siehe `SECURITY.md`.

## v5.1 (6.11.2026, lokal, nicht deployt)
- Portugiesisch (pt, Basis pt-BR) als 7. Sprache, gesperrt «In Prüfung» wie FR/IT/ES/JA; nur DE/EN wählbar.
- «Erzähl uns von dir» / Körperdaten: Grösse/Gewicht mit Minus/Plus (halten beschleunigt), Wert antippbar, Slider grob; Geburtsdatum statt Alter (Tag/Monat/Jahr je Sprache, Alter berechnet, Plausibilitätsprüfung).
- Grössere Tap-Flächen für Schalter, Sterne, Radios, Chips; Statuszeilen der Schalter jetzt übersetzt.
- Screenshots: `screenshots/07-erzaehl-mir-mehr.png`, `08-vorschau-pt-br-nur-testfreigabe.png`.


## v5.3 (6.11.2026, deployt auf die Live-Demo)
Entscheid Ideen-Scout (6.11.): zehn V1-Features im Klick-Prototyp. Backup: lokale Sicherung v52.

1. **Resteverwertung** (`#/reste`) – Zutaten + Mengen → lokale Rezeptvorschläge (kein Foto/KI).
2. **Saisonkalender** (`#/saison`) – Regionen CH/DE/AT/IT/ES/FR/PT/BR/JP, Beispieldaten Gemüse/Obst.
3. **Ein-Tipp-Mahlzeiten** (`#/eintipp`) – wie gestern, Favoriten, Vorlagen.
4. **Portionen mit der Hand** (`#/portionen`) – Handfläche/Faust/Daumen usw.
5. **Barcode-/Lebensmittel-DB** (`#/bardb`) – gebündelte Beispieldaten; optional `BarcodeDetector`; Lizenzhinweis (keine OFF-Daten).
6. **Essensfenster** (`#/fenster` + Profil) – optional, **standardmässig aus**.
7. **Sport/Aktivität** (`#/aktivitaet`) – Padel, Pingpong, Tennis, Volleyball, Beachvolleyball, Kraft, Gehen, «nur rumgelegen» … MET-basiert, Protein-Hinweis bei Kraft.
8. **QR-Einkaufsliste** (`#/qrshop`) – Liste im URL-Fragment, gebündeltes MIT `qrcode-generator`, strikte Import-Validierung.
9. **Reisemodus** (`#/reise`) – vereinfachte Erfassung, Restaurant, Saison-/Regionswechsel.
10. **Hausmarken** (`#/marken`) – Migros, Coop, Lidl, Denner, Aldi, Spar (beschreibend, keine Logos).

**Nicht V1:** Abend-Check-in; Arzt-Export nur «bald»-Platzhalter; Foto-KI später.
**i18n:** 1020 UI-Schlüssel, 7 Sprachen 100 %, Sprachwahl weiter nur DE/EN.
**Tests:** Headless-Klicktest `v53.js` (nicht im Repo) – 0 Konsolenfehler, keine Roh-Schlüssel.
**Screenshots:** `screenshots/10-reste.png` … `19-hausmarken.png`.
**Deploy:** ja (später am 6.11.2026 nach Freigabe; aktuelle Live-Version siehe v5.4).

## v5.2 (6.11.2026, deployt auf die Live-Demo)
- Zielgewicht/Tempo: Optionen Nachhaltig / Eigenes Tempo / **Eigenes Kalorienziel** (Minus/Plus 50 kcal, Presets, Tempo + Zieldatum berechnet); Leitplanken: ärztliche Begleitung unter 1'200/1'500 kcal bzw. Grundumsatz (mit Bestätigung), harte Untergrenze 800 kcal.
- Zielgewicht und Tempo mit Minus/Plus; Primärgrün #0B7F6B; Rahmen ≥3:1; Fokus auf Titel beim Screenwechsel; Vorlieben «Später festlegen».
- Screenshot: `screenshots/09-kalorienziel.png`.

## v5.4 (6.11.2026, deployt auf die Live-Demo)
- Hauptaktions-Buttons immer fix unten (`.actions`); Inhalt in `.screen-body` scrollbar.
- Safe-Area, Tabbar-Abstand, visualViewport-Höhe für Tastatur.
- Status: «Prototyp v5.4». Screenshot: `screenshots/20-fixe-buttons.png`.
- Backup: lokale Sicherung v53.
- Tests: Headless-Klicktest `v54.js` (nicht im Repo) live — 0 Konsolenfehler, fixe Buttons kurz/lang/Desktop OK.
- Deploy: Freigabe des Projektinhabers, bestehender Worker aktualisiert, keine neuen Ressourcen/Bindings.

