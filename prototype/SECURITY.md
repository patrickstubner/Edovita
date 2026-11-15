# Sicherheitsprüfung v5.4 (6. November 2026, Europe/Zurich)

**Stand:** deployt auf die Live-Demo (6.11.2026, ~18:09 Europe/Zurich). Backup: lokale Sicherung v53.
**Änderung:** Fixe Aktionsleiste (Hauptbuttons immer unten sichtbar), Screen-Body scrollbar, Status «Prototyp v5.4».
**Methode:** Code-Review (`styles.css`, `app.js` Layout, `index.html` `.actions`), grep (innerHTML/eval/Netzwerk/Inline-Handler), Headless `v54.js` (kurze/lange Screens, Handy 390×844 und Desktop 1280×900, 0 Konsolenfehler), `npm audit` (Dev-Tool) 0 Befunde.

| # | Thema | Ergebnis | Schwere |
|---|--------|----------|---------|
| 1 | DOM-Layout | `layoutScreens()` verschiebt nur bestehende Knoten in `.screen-body`/`.actions`, kein `innerHTML`, keine Nutzerdaten. | kein Befund |
| 2 | Fokus/A11y | Fokus auf `h1` beim Screenwechsel unverändert; Buttons ≥44px; Fokus-Outline bleibt. | kein Befund |
| 3 | CSP | Keine neuen Inline-Styles/Handler; Skripte weiter nur `'self'`. | kein Befund |
| 4 | visualViewport | Nur CSS-Variable `--app-h` für Höhe (Tastatur), keine Netzwerkaufrufe. | kein Befund |
| 5 | Abhängigkeiten | Keine neuen Laufzeit-Abhängigkeiten. Dev: `puppeteer-core`, `npm audit` 0. | kein Befund |
| 6 | Geheimnisse | Keine Keys/Tokens. | kein Befund |
| 7 | Offene Rechts-Punkte | Unverändert aus v5.3 (Marken, DB-Lizenz, Gesundheitsformulierungen). | mittel (offen) |

**SHA-256 (geänderte Kern-Dateien):**
```
3ba9cc747d8d8e500f383ce6ddd0c21c7f330d7242f020179222df887c176a64  index.html
edb11f56e6741177225f9a97604cbe48a66c564d524ae5ee60575fbf883329c1  styles.css
6a5644635a0655ecac6b778afff7c3503180303f591c002bfd0e68a20d8bb7ff  app.js
20244867f38b0db3decd43c257921616b8ce02c3c3411f076a04501e31669689  locales.js
```

---

# Sicherheitsprüfung v5.3 (6. November 2026, Europe/Zurich)

**Stand:** deployt auf die Live-Demo (6.11.2026, ~17:57 Europe/Zurich). Backup: lokale Sicherung v52. build-worker.py um v5.3-Dateien ergänzt (`v1-features.js`, `data/v1-data.js`, `vendor/*`).
**Methode:** Code-Review neuer Dateien (`v1-features.js`, `data/v1-data.js`, `vendor/qrcode-generator.js`, `vendor/edo-qr.js`), grep (innerHTML/eval/Netzwerk/Geheimnisse/CDN), Headless-Chrome (`v53.js`): alle Screens DE/EN ohne Roh-Schlüssel, 0 Konsolenfehler, QR-Import XSS-/Format-Probes, `npm audit` (Dev-Tool) 0 Befunde.

| # | Thema | Ergebnis | Schwere |
|---|--------|----------|---------|
| 1 | QR-Import | Nur `#/einkauf#import=<base64url>`; Schema `v=1`, max. 40 Items, ID-Whitelist `^[\w.-]+$`, Namen ohne `<>&"'`, Längenlimits. Fremde Payloads → Toast, kein DOM-Schreiben unsicherer HTML. | kein Befund (Absicht) |
| 2 | QR-Darstellung | SVG aus gebündeltem `qrcode-generator` (MIT) via DOMParser; nur `<svg>`-Wurzel, kein `innerHTML`. | kein Befund |
| 3 | localStorage | `edovita.v1` nur Region/Fenster/Reise (keine Gesundheitsdaten). Bestehende Whitelist für Sprache/Ton/Theme unverändert. | niedrig (Hinweis) |
| 4 | Barcode-DB | Beispieldaten erfunden, keine OFF-Daten; EAN nur Ziffern max. 13; optional `BarcodeDetector` ohne Netz. | kein Befund |
| 5 | Abhängigkeiten | Laufzeit: nur lokal gebündeltes MIT `qrcode-generator@1.4.4`. Kein CDN. Dev: `puppeteer-core` `npm audit` 0. | kein Befund |
| 6 | Geheimnisse | Keine Keys/Tokens im Repo. | kein Befund |
| 7 | CSP | Keine neuen Inline-Styles/Handler. Früheres Inline-`style` an Erfassen-Chips entfernt. | kein Befund |
| 8 | Gesundheitsaussagen | MET-/Handportions-Texte als Schätzung gekennzeichnet; ärztliche Prüfung offen. | mittel (rechtlich offen) |
| 9 | Markennamen | Beschreibend, keine Logos; Partnerschaft/Rechtliches offen. | mittel (rechtlich offen) |
| 10 | DB-Lizenz | Keine OFF-Daten im Bundle; Hinweis für spätere ODbL-Nutzung dokumentiert. | niedrig (offen für V1-Produkt) |

**Offene Prüfpunkte (Recht):** Markennutzung (Migros/Coop/…), Lebensmittel-DB-Lizenz bei späterem OFF, Formulierungen MET/Protein/ärztliche Hinweise, LGPD/encarregado unverändert offen.

**Nicht V1 / Backlog notiert:** Arzt-Export («bald»), Abend-Check-in (weg), Foto-KI (später, kostenpflichtig).

---

# SECURITY.md – Edovita Klick-Prototyp v5

**Datum der Prüfung:** 6. November 2026 (Europe/Zurich), nach dem Ausbau auf v5 (Mehrsprachigkeit, Töne, Text-/Spracherfassung, Rezept-Bewertung, Einkaufsliste mit drei Zuständen, Partnermodus, Datenschutz/Backup-Einwilligung, Rechtliches).
**Geprüfter Stand (SHA-256, kein Git-Commit):**
```
2583b21eb065d09c0e9f8776b885b9635619a165e951016827d4cf32b8dc4cac  index.html
16a8890d2a4773b57c30f741087e88e87d734d800c847275c2e520f524bcb8d9  styles.css
3e4e6dd936c8ca0607aacb522f3eec041f35291cee3cbed3629b0ae2fae380d4  logo-anim.css
37e94285493a27602d9b7e543edbbd614912f066c05586aa8e4ac4ecfa123c72  app.js
5b54686200f5fcb34be34c3070a741b5c436deddc21e38144f7fd4c2d0bc0786  i18n.js
2b43cf4aa8837fb2955794f9a232986fd79944700272fe919924c501c29e2dbe  locales.js
c22c155ad58ebdd531257bf2fa5417d741ef9f866464674d30181c2b86e05f78  theme.js
03e756dcfb711124b29eaf6312c27bc08aa52dfd407d74660f6831d488f84382  worker.tpl.mjs
cce9a6a2ba59042a52fc8af91abc577041b0248127c0bd7011d53a13450bc70f  worker.mjs
6dc6e19d1ca6dee88a0ab343927903b8c3638b1935d77d584fc007ffd48633ed  build-worker.py
aa00d7e52847524df703ad1b86ebf8b5648266dd268736573fb6bc37e348a0ba  tools/build-locales.py
ac4f4bf58065740480fc1b0a4f566b8552a6c38933a9cb37347b2258f7a6ce74  audio/A_aufbruch.mp3
8da1c9ce0e9183ef1dfc9f2a19140e5c6c11d9f5e6a5df0aa7d832599af517cf  audio/B_erfolg.mp3
1a6c31f129e7d0cda6fbdfd908b44bf7b1edbb8c9c1e12510cb5943bb7728a4a  audio/C_zusammen.mp3
d63eca3ac13b02f99e25bb2742c680d56f5775b6beb03a2bc7d67e4f98e096c0  audio/hymne_H1.mp3
3ef5aeff43d53e5922cf01d64d1fc5576d0f01403c71dc6bfa544fc8749bed2b  audio/hymne_H4.mp3
ce6377fd1865e20627d39a45c090451d49ba0353f07d0b95ebd8cba47314dea4  audio/hymne_H5.mp3
```
**Methode:** Code-Review der neuen Dateien (`app.js` neu geschrieben, `i18n.js`, `locales.js`, `tools/build-locales.py`, `tools/extract-i18n.py`, Worker-Vorlage), grep-Scans (innerHTML/eval/Netzwerk/Geheimnisse/Inline-Handler/`style=`/externe URLs/Storage), Headless-Chrome (puppeteer-core) mit Gerätesprachen de-CH, fr-CH, pt-BR: Konsole, CSP-Verstösse (`securitypolicyviolation`), fehlgeschlagene Requests, alle 27 Screens in allen 6 Sprachen auf sichtbare Roh-Schlüssel, XSS-Probe im Suchfeld, Zustand nach Sprachwechsel; lokaler Aufruf von `worker.mjs` (Status, Typen, Audio byte-identisch, 404/405); `npm audit` für das Screenshot-Werkzeug.

## Ergebnis
**Keine kritischen oder hohen Befunde.** Konsole leer, keine CSP-Verstösse, keine fehlgeschlagenen Requests, keine Roh-Schlüssel sichtbar.

| # | Prüfpunkt | Befund | Schweregrad |
|---|-----------|--------|-------------|
| 1 | XSS / Injection | Alle Texte (auch Übersetzungen, Rezeptnamen, Rechtstexte) werden nur per `textContent`, `nodeValue` oder `setAttribute` gesetzt; Attribut-Übersetzungen nur für die Whitelist `aria-label`, `data-title`, `data-toast`, `placeholder`. Keine `innerHTML`/`eval`/`new Function`/String-Timer. `build-locales.py` bricht ab, wenn ein Übersetzungstext nach HTML aussieht; `locales.js` maskiert `</`, U+2028/2029. XSS-Probe `<img src=x onerror=…>` im Suchfeld: kein Element entsteht. | kein Befund |
| 2 | Eingabevalidierung | Neues Freitextfeld (Essen suchen): `maxlength=40`, zusätzlich `slice(0,40)`, wird nur zum Filtern und als Text angezeigt, nie gespeichert. Sprachcode nur wählbar, wenn in `active` und `meta.legalApproved === true` (getestet: `setLang('tr')` → abgelehnt). Klick-Daten (`data-rate`, `data-save`, `data-shop`, `data-portion`, `data-hymn`, `data-preview`, `data-pconn`, `data-rmeal`, `data-rprop`) werden gegen feste Listen geprüft. | kein Befund |
| 3 | Audio | Feste Whitelist `AUDIO` (6 Dateien, nur eigene Pfade unter `audio/`), kein Nutzer-Input als Quelle. Ton nur nach Berührung und nur wenn Ton an ist; Autoplay-Ablehnung wird abgefangen. CSP `media-src` von `'none'` auf `'self'` geöffnet (nötig, nur eigene Herkunft). | niedrig (bewusste Öffnung) |
| 4 | Speicherung im Browser | Nur noch Einstellungen, jeweils gegen Whitelist gelesen: `edovita.theme`, `edovita.lang`, `edovita.sound` (on/off), `edovita.hymn` (H1/H5/H4). Keine Gesundheitsdaten, keine Cookies, kein IndexedDB. Alle Fantasiedaten verschwinden beim Neuladen. | niedrig (Hinweis) |
| 5 | Netzwerk / Angriffsfläche | Weiterhin kein `fetch`/XHR/WebSocket, `connect-src 'none'`; Sprachdaten deshalb gebündelt (`locales.js`). Externe Links nur `tel:` (Hilfe-Nummern). Partner-QR ist eine deterministische Grafik ohne echten Inhalt, WhatsApp/Trennen/Export/Löschen sind nur Toasts. | kein Befund |
| 6 | Geheimnisse | Keine Schlüssel/Tokens (Scan; die einzigen Treffer sind Zufallsfolgen in den base64-Audiodaten in `worker.mjs`). | kein Befund |
| 7 | Abhängigkeiten | Keine Laufzeit-Abhängigkeiten, keine CDNs, keine Fremdschriften (Japanisch nutzt System-Schriften). i18n bewusst ohne i18next im Prototyp (eigene ~120 Zeilen, ICU-Teilmenge: `{x}`, `plural` mit `#`/`=n`, `select`). Screenshot-Werkzeug `puppeteer-core` 25.16.0: `npm audit` 0 Schwachstellen. | kein Befund |
| 8 | Worker | Nur GET/HEAD (POST → 405), feste Dateitabelle, unbekannte Pfade 404 (z. B. `/tools/…`, `/audio/x.mp3`). Neu: Audio als base64 eingebettet und binär ausgeliefert (`audio/mpeg`, byte-identisch geprüft, `Cache-Control: public, max-age=86400`), `locales/**/*.json` lesbar mitgeliefert. Grösse 1.84 MB, gzip 0.98 MB (unter der Free-Grenze von 3 MB). | kein Befund |
| 9 | Inhalt / Haftung | Übersetzungen (en, fr, it, es, ja) sind **Entwürfe** (`reviewed=false`), inklusive Gesundheits- und Risikohinweisen. `legalApproved=true` ist für alle sechs Sprachen nur **simuliert** (`legalNote`, sichtbar im Sprach-Screen). Vor einem echten Release müssen Sicherheits- und Rechtstexte fachlich und anwaltlich geprüft werden. | mittel (erst für Release relevant) |
| 10 | Datenschutz-UX | Backup ist standardmässig aus; Einschalten nur nach ausdrücklicher Einwilligung (Häkchen, Knopf vorher deaktiviert; getestet). Gewicht ist im Partnermodus standardmässig nicht geteilt. | kein Befund |

**Fix-Vorschläge:** #3 keiner nötig. #9: Übersetzungen der Risiko-/Hilfetexte von Fachperson und Muttersprachler prüfen lassen, `legalApproved` erst nach Anwaltsprüfung setzen (Build-Skript könnte dann `legalApproved` aus einer separaten Freigabeliste lesen).

---

# Frühere Prüfung: v4

**Datum der Prüfung:** 5. November 2026 (Europe/Zurich). Dritte Prüfung (am selben Tag nach einem Fehlerbericht zu Zunehmen-Ziel ergänzt, siehe Punkte 16 und 17), nach Ergänzung um finales Logo, Dunkelmodus, Splash-/Logo-Animation, Belohnungs-Animation, SVG-Loader. Die Prüfpunkte der Prüfung vom 4. November (v3) wurden erneut gegen den neuen Code geprüft.
**Geprüfter Stand (SHA-256):**
```
a012239e573bbf1360992374579e93df912c16f7e5790dcef317bea7fcd7a93a index.html
f17b2c2fb7b1b61fc26288975e0ed5aa552dd4f0687894eb081a73cbf385882a styles.css
3e4e6dd936c8ca0607aacb522f3eec041f35291cee3cbed3629b0ae2fae380d4 logo-anim.css
3ec6e8ae4c9cf160b5a922f054cdf5f3d8bc0afbc75256b4d5abfd223a83a71d app.js
c22c155ad58ebdd531257bf2fa5417d741ef9f866464674d30181c2b86e05f78 theme.js
d735b856a31cd27f73c1ce98e2e42cffbecf541bd71e08d8fae7c7ad324682c8 worker.mjs
f9e67063043b216b932bf5dda09f03a4dd0cefcfdb324b392e537333bc8fa719 ../edovita-docs/logos/animation/edovita_logo_animation.html
```
(kein Git-Commit vorhanden; Stand über Datei-Hashes festgehalten)
**Methode:** manuelle Code-Review, grep-Scans (innerHTML/eval/Inline-Handler/`style=`/externe URLs/Storage/Netzwerk/Service Worker/Geheimnisse), Headless-Chrome-Läufe (Konsole und CSP-Verstösse in Hell und Dunkel, Klickflüsse inkl. Splash, Theme-Umschaltung, Belohnung, Loader), lokaler Aufruf von `worker.mjs` (Statuscodes, Methoden, Pfade), `npm audit` für das Screenshot-Werkzeug. Nicht ausgeführt: `pip-audit` für die Python-Hilfswerkzeuge (cairosvg, fontTools; sie laufen nur beim Logo-Export, nicht im Prototyp).

## Zusammenfassung
**Keine kritischen, hohen oder mittleren Befunde im Prototyp-Code.** Es gibt zwei niedrige Befunde (plus Punkt 16, behoben) (Kontrast Hellmodus, Splash blockiert kurz die Bedienung), mehrere Hinweise für die Produkt-App und Vorgaben für V1 (Offline-first, Service Worker, Lottie). Das mittlere Produkt-/Haftungsthema «Allergen-Prüfung» aus v3 gilt unverändert für die echte App.

| # | Prüfpunkt | Befund | Schweregrad |
|---|-----------|--------|-------------|
| 1 | Eingabevalidierung | Weiterhin keine Textfelder; Eingaben nur über Schieberegler, Schalter und Auswahl, alle gegen `LIMITS`/Whitelists begrenzt (v3-Prüfung unverändert gültig). **Geändert (Fehlerbericht):** Die Untergrenze des Körpergewichts hängt vom Ziel ab: Zunehmen und Gewicht halten 25–200 kg, Abnehmen 40–200 kg (`wMin()`); manipulierte oder zu kleine Werte werden beim Einlesen auf die Grenze geklemmt (getestet: Eingabe 10 kg → 25.0 kg). Abnehmen bleibt zusätzlich gesperrt bei BMI unter 18.5 oder Gewicht unter 40 kg (`loseBlocked()`). **Neu:** Theme-Wahl wird beim Setzen (`EdoTheme.set`) und beim Lesen aus `localStorage` gegen die Whitelist `light`/`dark`/`system` geprüft, ein manipulierter Speicherwert fällt auf «System» zurück. Die Standalone-Animation liest `?theme=`, `?bare=`, `?once=` nur als Vergleichswerte (`dark`/`light`/`1`), nie als Markup oder URL. Hash-Routing weiter gegen `SCREENS`. Reward-Texte stammen aus Konstanten im Code. | kein Befund |
| 2 | XSS / Injection | Keine Sinks: kein `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `document.write`, String-`setTimeout`, `postMessage`, `fetch`, `XMLHttpRequest`, `WebSocket` (Scan über `app.js`, `theme.js`). Neue Elemente (Konfetti, Theme-Schalter, Splash-Neustart) entstehen per `createElementNS`/`setAttribute`/`textContent` bzw. `cloneNode` auf statischem Markup. Splash-Logo, Logo-Symbol und Loader sind statisches Inline-SVG; Logos auf dem Profil-Screen werden als `<img src="assets/*.svg">` geladen (in `<img>` laufen keine Skripte). `<use href>` zeigt nur auf interne `#`-IDs. Die SVG-Assets enthalten kein `<script>`, `foreignObject`, Event-Attribut oder externes `href` (Scan). Konfetti-Parameter werden per `style.setProperty` (CSSOM) gesetzt, was die CSP erlaubt. | kein Befund |
| 3 | Geheimnisse | Keine Schlüssel, Tokens, Passwörter im Code (Scan über alle Quelldateien; Treffer nur im Wort «Token»/«Passwort» in Dokumentation). Kein `.env`, keine API-Adresse. | kein Befund |
| 4 | Rechte / Auth / CORS / Methoden | Keine Authentifizierung nötig (öffentlich, fiktive Daten). `worker.mjs` (neu gebaut, nicht deployt): nur GET/HEAD (POST → 405), unbekannte Pfade, Pfad-Traversal (`/../etc/passwd`) und `/__proto__` → 404, Zugriff nur auf eine feste Dateitabelle (`hasOwnProperty`). Keine CORS-Header, keine Bindings, keine Secrets. | kein Befund |
| 5 | Abhängigkeiten | Keine Laufzeit-Abhängigkeiten: keine CDNs, keine Fremdschriften (Schriftzug als Pfade im SVG; Quicksand ist OFL-lizenziert, Pfade aus der Schrift sind unkritisch), keine Skripte Dritter, kein `package.json` im Projekt. Die Belohnungs-Animation ist bewusst **ohne** Lottie-Bibliothek gebaut. Werkzeuge ausserhalb des Projekts (`(lokaler Pfad)`): `puppeteer-core` 25.16.0, `npm audit` = 0 Schwachstellen. Python-Werkzeuge nicht geprüft (siehe Methode). | kein Befund (Hinweis zu Lottie: siehe V1-Vorgaben) |
| 6 | Service-Worker- und Cache-Geltungsbereich | **Nicht anwendbar, aber bestätigt:** Es gibt keinen Service Worker (`serviceWorker`-Scan ohne Treffer), kein Manifest, keine Cache-API-Nutzung. Damit kann der Prototyp keine veralteten oder fremden Inhalte dauerhaft ausliefern und es werden keine Daten im Cache abgelegt (Entscheid: Offline/PWA gehört in V1, nicht in den Prototyp). Die Seite wird per `Cache-Control: no-cache` ausgeliefert. Anforderungen für V1 siehe unten. | kein Befund (Hinweis) |
| 7 | Speicherung im Browser (neu) | Neu ist genau ein Eintrag: `localStorage["edovita.theme"]` mit `light`/`dark` (kein Eintrag = System). Kein Personenbezug, keine Gesundheitsdaten, keine Cookies, kein `sessionStorage`/IndexedDB. Aussage aus v3 («es wird nichts gespeichert») gilt daher nur noch mit dieser Ausnahme. Bei gesperrtem Speicher (`try/catch`) gilt die Wahl bis zum Neuladen. | niedrig (Hinweis) |
| 8 | CSP und Header | `index.html` bleibt bei der strengen CSP ohne `unsafe-inline`/`unsafe-eval` (`default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; …; connect-src 'none'; media-src 'none'`). Alle neuen Skripte/Stile sind externe Dateien (`theme.js`, `logo-anim.css`), Inline-SVG braucht keine Freigabe. In den Headless-Läufen (Hell und Dunkel, alle 22 Screens, Splash, Belohnung, Loader) keine CSP-Verstösse und keine Konsolenfehler. Die Standalone-Animation hat eine eigene CSP per Meta-Tag mit **SHA-256-Hashes** für das eine Inline-Skript und -Stil (kein `unsafe-inline`, `connect-src 'none'`); ein anfänglicher Verstoss (`style`-Attribut am Sprite) wurde dabei gefunden und behoben. Die Hashes werden von `build_animation.py` bei jeder Änderung neu berechnet, ohne Neubau passt die CSP nicht mehr (fail-closed). Weiter gültig: Meta-CSP kann `frame-ancestors` nicht (nur per HTTP-Header im Worker). Neue SVG-Dateien werden mit `image/svg+xml` und `nosniff` ausgeliefert, die Worker-CSP (`default-src 'none'`) gilt auch beim direkten Öffnen der SVG. | niedrig (Hinweis) |
| 9 | Fehlermeldungen | Worker liefert nur «Nicht gefunden» (404) und «Method Not Allowed» (405), keine Stacktraces. Konsole bleibt leer. | kein Befund |
| 10 | Splash blockiert Bedienung (neu) | Der Splash liegt bis ca. 5 s als Vollbild über der App. Überspringen per Tippen/Enter/Esc/Leertaste; CSS blendet ihn auch ohne JavaScript nach 4.6 s aus, bei `prefers-reduced-motion` entfällt die Bewegung (Standbild, 1.2 s). Der Splash hat `role="img"`/`aria-label`, aber die App dahinter bleibt für Screenreader lesbar; in der Produkt-App sollte der Splash so kurz wie die Startzeit sein (Mindestdauer ca. 2.8 s Zusammenbau). Keine schnellen Blitze (Herzschlag ca. 1 Hz, Skalierung ≤ 17 %), also kein Risiko für Photosensitivität (WCAG 2.3.1). | niedrig |
| 11 | Barrierefreiheit Kontrast (neu) | Dunkelmodus gemessen (WCAG-Kontrast): Text 15.9:1, Nebentext 8.0:1, Banner 9.5–9.9:1, Primärtaste dunkler Text auf Grün 7.4:1 (zuerst weisser Text 2.7:1, behoben). **Hellmodus (unverändert aus v3):** weisser Text auf `#0F9D84` = 3.4:1, ausreichend nur für grossen/fetten Text (Tasten 19 px fett), nicht für kleine Beschriftungen auf Grün. Empfehlung V1: Primärfarbe für Text-auf-Grün auf `#0B7F6B` (4.9:1) abdunkeln. | niedrig |
| 12 | Angriffsfläche / Datenschutz | Keine Endpunkte ausser statischen Dateien, keine Uploads, drei `tel:`-Links auf dem Hilfe-Screen. Seite per `noindex` ausgenommen, URL öffentlich (Inhalt fiktiv). **Hinweis:** v4 wurde am 5. November 2026 mit Freigabe des Nutzers auf die bestehende Live-URL hochgeladen; die Live-Dateien stimmen per SHA-256 mit den lokalen überein. | niedrig (Hinweis) |
| 13 | Sensible Daten im Prototyp | BMI, Gewicht, Allergien, Ernährungsweise sind Gesundheitsdaten im Sinn des Datenschutzes; im Prototyp erfunden und nur im Speicher (CSP `connect-src 'none'`). Echte App: Einwilligung, Verschlüsselung, Datensparsamkeit (siehe V1-Vorgaben). | niedrig (Hinweis) |
| 14 | Allergie-Filter ist nur eine Simulation | Unverändert aus v3: keine verlässliche Allergen-Prüfung, Hinweis «Bei Allergien prüfe immer die Zutatenliste» bleibt. Echte App: Allergen-Daten aus verlässlicher Quelle, Hinweis beibehalten. | mittel (Produkt-/Haftungshinweis für die echte App) |
| 15 | Schutz vor ungesunden Zielen | Unverändert aus v3 (BMI-Untergrenzen, Tempo ≤ 1 kg/Woche, Mindest-kcal, Hilfe-Screen). Grenzwerte vor Release medizinisch prüfen. | niedrig (Hinweis) |
| 16 | Zielabhängige Gesundheitstexte (neu, Fehlerbericht) | Ursache: Hinweise und Texte gingen von «Abnehmen» aus. Bei Ziel «Zunehmen» zeigte der Prototyp «Abnehmen ist nicht sinnvoll» und Kaloriendefizit-Sprache, was widersprüchlich und für untergewichtige Nutzer unpassend ist (Produkt-/Sicherheitsthema, in der echten App mittel). Behoben: Hinweis je Ziel (`riskInfo`): bei Zunehmen und BMI unter 18.5 bzw. 17 unterstützende Texte mit Empfehlung für Hausärztin/Hausarzt und Ernährungsberatung (inkl. Hinweis, den Aufbau bei starkem Untergewicht ärztlich zu begleiten wegen Refeeding-Risiko), nie «Abnehmen»-Wortlaut; bei Zunehmen und BMI ab 25 ein Hinweis auf «Gewicht halten» mit Krafttraining. Kalorienziel bei Zunehmen = Bedarf plus leichter Überschuss (Anzeige «leichter Überschuss»), Heute-Ring «kcal bis Ziel», Hinweis bei Überschreitung «Tagesziel erreicht» statt «Plan anpassen», Wochenrückblick, Gewichtsverlauf (Demodaten steigend) und Rezept-Texte je Ziel. Die Texte sind Richtwerte und müssen vor Release medizinisch/rechtlich geprüft werden. | niedrig im Prototyp, mittel für die echte App |
| 17 | Prüfung der Fehlerbehebung | Headless-Chrome: Zunehmen mit 25/30/45/48/60/100 kg (Hinweis je Bereich korrekt oder keiner), 10 kg → 25 kg geklemmt, Abnehmen bei 30 kg gesperrt, Halten mit 25 kg erlaubt, Scan aller 21 Screens bei Zunehmen/30 kg ohne «Abnehm/Defizit/verlier»-Wortlaut (ausser der Zielkarte «Abnehmen» auf Seite 1), keine Konsolenfehler, kein neuer DOM-Sink. | kein Befund |

## Vorgaben für V1 (aus der Prüfung abgeleitet, noch nicht umgesetzt)
**Offline-first / Service Worker (Pflichtanforderung V1, nur Web-Version nötig; in Capacitor liegen die Dateien im Bundle):**
1. **Geltungsbereich:** Service Worker nur unter `/` der eigenen Herkunft registrieren, Datei `sw.js` mit `Cache-Control: no-cache`, CSP `worker-src 'self'`; keine Registrierung über fremde Herkunft, kein `importScripts` von aussen.
2. **Was in den Cache darf:** nur versionierte, öffentliche statische Dateien (App-Shell, `rezepte-vN.json`, Sounds, Animationen). **Nie** Antworten der API, des Backups, des Partner-Syncs oder Gesundheitsdaten in die Cache-API legen (unverschlüsselt, vom Nutzer nicht zuverlässig löschbar). Gesundheitsdaten gehören in die lokale SQLite-Datenbank bzw. verschlüsselten Speicher.
3. **Cache-Hygiene:** Cache-Name mit Version, beim `activate` alte Caches löschen, Precache-Liste aus dem Build (Hashes), keine opaken Cross-Origin-Antworten cachen, nur GET, Navigations-Fallback nur auf die eigene `index.html`.
4. **Warteschlange für Sync:** Op-Log lokal (verschlüsselt), idempotente Operationen mit ID, Wiederholung mit Backoff, nur über HTTPS; bei Abmeldung/Löschen der Daten auch Warteschlange und Caches leeren. `connect-src` nur um die eigene API-Herkunft erweitern.
5. **Updates:** neuer Service Worker wartet, bis der Nutzer die App neu startet (kein stilles Überschreiben während der Eingabe); Notfall-Abschaltung («kill switch») vorsehen.

**Lottie (echte Belohnungs-Animation):** nur gebündelte, geprüfte JSON-Dateien laden, nie aus dem Netz; Lottie-Expressions deaktivieren bzw. eine Bibliothek ohne Expression-Engine verwenden (Expressions werten Code aus); Bibliothek fest auf eine Version pinnen und in `npm audit`/Renovate aufnehmen; CSP ohne `unsafe-eval` beibehalten.

**Native Splash:** nur einfarbige Fläche nativ, Animation in der WebView (siehe README); darauf achten, dass nicht Gesundheitsdaten im Splash erscheinen (App-Switcher-Vorschau).

**Weiter aus v3:** Ende-zu-Ende-Verschlüsselung der Fortschrittsfotos, KI-/Barcode-Aufrufe (Prompt-Injection, Fremddaten wie Open Food Facts nie als HTML rendern), Authentifizierung, Rate-Limits, echte Push-Benachrichtigungen (Einwilligung, Opt-out), Datenschutz CH/EU und ärztliche Freigabe der Grenzwerte separat entwerfen und prüfen.

## Hilfsangebote: Quellen geprüft (4. November 2026)
Die Angaben auf dem Hilfe-Screen wurden auf den Websites der Anbieter nachgeprüft:
- Dargebotene Hand: Telefon 143, rund um die Uhr, anonym und kostenlos; Chat täglich 10–22 Uhr; Mail-Beratung (143.ch, Kontaktseite).
- PEP – Prävention Essstörungen Praxisnah: kostenlose, anonyme Beratung bei Essverhaltensproblemen, Essstörungen, Fitness- und Muskelsucht; Telefon +41 76 368 96 17, in der Regel Montag und Donnerstag (pepinfo.ch/angebote/beratung).
- AES – Arbeitsgemeinschaft Ess-Störungen, Zürich: kostenlose Beratung, Telefon 043 488 63 73, Dienstag und Donnerstag 10–12 und 14–17 Uhr (aes.ch/angebot/beratungen).
- Sanität 144, Notruf 112 (laut AES-Seite) und Pro Juventute 147 (laut BAG-Seite zu psychischer Gesundheit).
Erreichbarkeiten können sich ändern; vor einem echten Release erneut prüfen.

## Gehärtet
- **CSP** (Meta-Tag und HTTP-Header im Worker): `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; frame-ancestors 'none' (nur Header); base-uri 'none'; form-action 'none'`. Dynamische Werte (Balken, Wasserstand, Legendenfarbe, Konfetti-Parameter) werden per CSSOM (`el.style.*`) gesetzt. Das Theme wird über das Attribut `data-eff` am `<html>` gesteuert, nicht über Inline-Stile.
- Weitere Header im Worker: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (Kamera/Mikrofon/Standort aus), `COOP same-origin`, `HSTS`, `X-Robots-Tag: noindex`.
- `<meta name="robots" content="noindex, nofollow, noarchive">`, `robots.txt` mit `Disallow: /`.

## Offene Punkte / Hinweise
1. **Mittel (nur echte App) – Allergen-Prüfung** (Punkt 14).
2. **Niedrig – Kontrast Hellmodus** (Punkt 11) und **Splash-Dauer** (Punkt 10) vor V1 anpassen.
3. **Niedrig – öffentliche URL ohne Zugriffsschutz** (zeigt Stand v4). Bei Bedarf Cloudflare Access davorsetzen oder das Deployment nach dem Review deaktivieren.
4. **Niedrig – Meta-CSP kann `frame-ancestors` nicht**; bei Weitergabe als Datei fehlt dieser Schutz (Worker setzt den Header).
5. **Niedrig – Gesundheitsdaten und medizinische Grenzwerte** vor einer echten Umsetzung fachlich und rechtlich prüfen.
6. **Hinweis – Python-Werkzeuge nicht auf Schwachstellen geprüft** (`pip-audit` nicht ausgeführt; nur Logo-/Animationsexport, nicht Teil des ausgelieferten Prototyps).

## Deployment
Cloudflare Worker `edovita-prototyp` (Dateien im Worker eingebettet, siehe `worker.tpl.mjs` / `build-worker.py`): die Live-Demo (Stand **v5.4**, hochgeladen am 6. November 2026 Europe/Zurich; Freigabe des Projektinhabers; bestehender Worker aktualisiert, keine neuen Ressourcen/Bindings/kostenpflichtigen Produkte; Live-Byte-Vergleich 59/59 identisch; Headless `v54.js` live: 0 Konsolenfehler, fixe Aktionsleiste OK).

## Nachtrag 6.11.2026, 15:20 (Europe/Zurich): Sprachfreigabe nur DE/EN

**Änderung:** Gemäss Entscheid des Projektinhabers sind bis zur Prüfung nur Deutsch und Englisch wählbar. FR, IT, ES, JA haben `legalApproved: false`, erscheinen ausgegraut mit Hinweis «In Prüfung» (in der aktuellen UI-Sprache, neuer Schlüssel `lang.reason.review`) und sind nicht anklickbar. Gerätesprache FR/IT/ES/JA fällt auf EN zurück.

**Kurzprüfung der Änderung:**
- Freigabe wird an einer Stelle erzwungen (`I.approved()` in i18n.js): `setLang('fr')` liefert `false`, ein gespeicherter Wert `edovita.lang=ja` wird beim Start ignoriert (Test: Start in DE), Klick auf ausgegraute Zeile ändert nichts. Ausgegraute Zeilen sind `div`, keine Buttons, kein `data-lang`.
- Neue DOM-Ausgabe nur über `createElement`/`textContent`/`setAttribute('lang', …)`; kein `innerHTML`, kein `eval`, kein `fetch` (grep ohne Treffer).
- Neue Übersetzungstexte durch build-locales.py geprüft (Platzhalter, Klammern, kein HTML).
- Keine neuen Abhängigkeiten, keine Secrets, CSP unverändert (`connect-src 'none'`, `media-src 'self'`).
- Headless-Test lokal und live: 0 Konsolenfehler, 0 CSP-Verstösse, 0 Roh-Schlüssel in DE/EN auf allen Screens.

**Befunde:** keine kritischen/hohen. Niedrig/Info: Die Sperre ist clientseitig (für einen Prototyp ausreichend; in der echten App muss die Freigabe serverseitig bzw. im Build erzwungen werden, damit nicht geprüfte Rechtstexte nicht ausgeliefert werden). Die FR/IT/ES/JA-Dateien werden weiterhin mit ausgeliefert (öffentlich abrufbar, z. B. /locales/fr/legal.json) – unkritisch, da Entwürfe ohne Geheimnisse, aber in der echten App nicht freigegebene Sprachen nicht ausliefern.

**Geprüfter Stand (SHA-256):**
```
    c66cc51dcfa2946bc69ecd75ae812100845f17d66927f3141f2e7ee296dad57a  app.js
    6519af7d3449560404ed520fd361d5eb021066e6820f7de02b5c450c50e56179  locales.js
    f0607a6e1ceaf19c97c2dd2a4cefba906ad42d6ade491a249bc4e0daf71917d1  worker.mjs
    0ad94296fa5999612c164207fda4a3ffe0b70a3111f8ff97c970b4e7e75d6ea4  tools/build-locales.py
```

## Nachtrag 6.11.2026, 15:46 (Europe/Zurich): Portugiesisch (pt-BR) + Körperdaten-Eingabe v5.1 + Tap-Flächen

**Änderungen:** (1) Neue Sprache `pt` (Basis pt-BR, 745 Schlüssel, `legalApproved=false`, ausgegraut «In Prüfung»). (2) Screen «Erzähl uns von dir» / «Körperdaten»: Grösse und Gewicht mit Minus/Plus (1 cm / 0,1 kg, Halten beschleunigt), antippbarem Eingabefeld und Slider; Alter ersetzt durch Geburtsdatum (Tag/Monat/Jahr in Sprach-Reihenfolge, Alter berechnet, 13–110 Jahre, kein Zukunftsdatum, Hinweis unter 16). (3) Unsichtbar vergrösserte Tap-Flächen (CSS-Pseudo-Elemente). (4) Fix: Statuszeilen der Schalter (Health Connect, Waage, Essensfenster, Fasten) waren beim Start immer Deutsch. **Nicht deployt.**

**Prüfung:**
- XSS/Injection: neue DOM-Ausgabe nur über `createElement`/`textContent`/`setAttribute`; grep auf `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `document.write`: keine Treffer. Monatsnamen kommen aus `Intl`, nicht aus Nutzereingaben.
- Eingabevalidierung: Zahlen per Whitelist-Regex (`^\d{1,3}(\.\d{0,2})?$` nach Normalisierung von Komma/Apostroph), danach Bereichs-Clamp (Grösse 140–210, Gewicht ≥ 40 kg Abnehmen bzw. ≥ 25 kg Zunehmen/Halten, ≤ 200 kg). Geburtsdatum: nur Ziffern, echte Kalenderprüfung (31.2. abgelehnt), kein Zukunftsdatum, Alter 13–110. Ungültige Eingaben ändern den Zustand nicht.
- Speicherung: Geburtsdatum, Grösse, Gewicht nur im Arbeitsspeicher (kein localStorage, kein Netzwerk). `autocomplete="bday-*"` erlaubt Browser-Autofill lokal – unkritisch.
- Timer (Halten): wird bei `pointerup`/`pointercancel`/`lostpointercapture`/Fenster-Blur/Tab-Wechsel und an den Grenzwerten gestoppt → kein Endlos-Timer.
- Übersetzungen pt: durch build-locales.py geprüft (Platzhalter = en, Klammern, kein HTML). Testweise Freigabe nur im Headless-Test per Override, nicht im Code.
- CSP unverändert, keine neuen Abhängigkeiten, keine Secrets (Regex-Scan ohne Treffer).
- Headless: 0 Konsolenfehler, 0 CSP-Verstösse; DE/EN ohne Roh-Schlüssel; pt (Testfreigabe) ohne Roh-Schlüssel und ohne horizontales Überlaufen.

**Befunde:** keine kritischen/hohen/mittleren. Niedrig: (a) Geburtsdatum ist ein zusätzliches Personendatum – in der echten App lokal verschlüsselt speichern und im Backup/Partnermodus nie teilen (Datenminimierung: für die Berechnung würde auch Monat/Jahr reichen → Entscheid des Projektinhabers). (b) Unter-16-Nutzung ist nur ein Hinweis, keine Sperre (BMR-Formel gilt für Erwachsene) – Produkt-/Rechtsentscheid. (c) Eingabe-Rahmen (#DCE5E2 auf Weiss, 1,3:1) erfüllt WCAG 1.4.11 (3:1) nicht – siehe UX-Review.

**Geprüfter Stand (SHA-256):**
```
    f186cd14356f86bebbaaf8b8c598c2cde429f7ad8fbadefd4dd41e9a469bb157  index.html
    b0835f688cd954cad54d0ba29c05d00f0498ccf82aa7ddf988d3e1d92ed74f86  styles.css
    4dd0f712173bbd6f39458ca17717441777b088772b478afbc9d3aeb67ff72865  app.js
    5b54686200f5fcb34be34c3070a741b5c436deddc21e38144f7fd4c2d0bc0786  i18n.js
    14674ad29a33b4edffd2e0bb95e295d36e0c548a6692076ae0c73d3d07b87581  locales.js
    025ff24ba5bd212e7267b8e51ec023126ba2d9edea006add6994c8878343ee96  tools/build-locales.py
    c828bb7172cdc19ec4d3bf6217b60370d0f5d45b37e30b13f349bc0327da82d7  tools/i18n-src/content.py
    ddd2005d570db56e060c75fb9111c544692d78e6fc85bc74c20b2b1de24092a1  tools/i18n-src/pt.txt
    a14f918fa167e9081bdd7be36515043d67ff392dd204e140ec095cdcad411911  worker.mjs
```

## v5.2 – Eigenes Kalorienziel, UX-Fixes (6.11.2026, 16:05 MEZ, deployt)

**Änderungen:** Screen Zielgewicht/Tempo: drei Optionen (Nachhaltig = Edovita-Empfehlung, Eigenes Tempo kg/Woche, **Eigenes Kalorienziel** kcal/Tag, 50-kcal-Schritte, Halten beschleunigt, Wert antippbar, Presets 1'200 kcal «ärztlich begleitete Diät, z. B. nach Dr. Nowzaradan» als neutrales Beispiel + Edovita-Empfehlung). Erwartetes Tempo und Zieldatum werden aus kcal berechnet. Zielgewicht und Tempo mit Minus/Plus. Primärgrün hell #0B7F6B, Formular-Rahmen/Schalter ≥3:1 (`--bf`), Fokus auf Titel beim Screenwechsel, «Vorlieben» mit «Später festlegen». 38 neue Schlüssel in allen 7 Sprachen (783 total).

**Leitplanken (fachlich/rechtlich):** unter max(1'200 kcal Frauen / 1'500 kcal Männer, geschätzter Grundumsatz) roter Hinweis «Nur unter ärztlicher Begleitung» mit Checkbox-Bestätigung; ohne Bestätigung rechnet die App mit dem sicheren Wert. Bestätigung verfällt bei tieferem Wert oder Zielwechsel. Harte Untergrenze 800 kcal (VLCD), auch per Eingabe/Slider/Preset nicht unterschreitbar. Hinweise für Zunehmen/Halten. Details in aufklappbarem `<details>`. Kein Markenbezug, Disclaimer «keine medizinische Beratung».

**Prüfung:**
- XSS/Injection: neue Ausgabe nur via `createElement`/`textContent`/`setAttribute`; grep auf `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `document.write`, `fetch`: keine Treffer. ICU-Platzhalter erhalten nur formatierte Zahlen/Daten.
- Eingabevalidierung: kcal nur Ziffern (Tausendertrenner . , ' entfernt, max. 4 Stellen), Clamp 800–4'500, Rundung auf 50; Preset-Werte per `parseInt` + gleicher Clamp. Tempo/Zielgewicht über denselben Validierungspfad wie Körperdaten.
- Speicherung: Kalorienziel und Bestätigung nur im Arbeitsspeicher; kein localStorage, kein Netzwerk.
- Timer (Halten) unverändert abgesichert. Abhängigkeiten: keine neuen (nur Dev-Tool puppeteer-core, `npm audit`: 0 Befunde). Secrets-Scan ohne Treffer. CSP unverändert.
- Headless lokal und live: 0 Konsolenfehler, alle Funktionstests OK, keine Roh-Schlüssel in 7 Sprachen.

**Befunde:** keine kritischen/hohen/mittleren. Niedrig: (a) Checkbox-Bestätigung ist eine Selbstauskunft, keine Prüfung – in der echten App Text rechtlich prüfen lassen (Medizinprodukt-Abgrenzung, Haftung) und Bestätigung mit Zeitstempel lokal protokollieren. (b) Grundumsatz-Schätzung (Mifflin-St Jeor) gilt für Erwachsene; Unter-16 bleibt Hinweis (Entscheid des Projektinhabers). (c) Diagrammlinien nutzen noch #0F9D84 (Grafik, 3,4:1 – erfüllt 1.4.11).

**Geprüfter Stand (SHA-256):**
```
    2d9b21b191f8c1ec899ee7238531d84ec8934d5f726e955f3b365f775c00e452  index.html
    c3350ff3492168177ccd653d500ae51f3e6aa742ef87af1fe4a26ca7a317175f  styles.css
    0ce299569b835fba16ea18a14f1034e46871a94bbc0f73de2d96add5e36f1c54  app.js
    35854c0c7fe886ad6f716c2d41b1ee9b56acdd4f7e6b8ddf9407e23383b83ae2  locales.js
    988e02088414d968f31a31737c9b8c41b6a6ab425e1ca2c70448d16fa5cfa99d  tools/i18n-src/keys.json
    b31dfb8d0aa28fcd90c3db2c80cb38ad09721087cae0776289564da298b48fd0  worker.mjs
```


## v5.4 – Deploy (6.11.2026, Europe/Zurich)

**Freigabe:** Projektinhaber («ja»). Bestehenden Worker `edovita-prototyp` aktualisiert (`build-worker.py` → API PUT), keine neuen Ressourcen, Bindings oder kostenpflichtigen Produkte.

**Live-Prüfung:** 59 eingebettete Dateien byte-identisch mit lokal; Headless-Klicktest `v54.js` (nicht im Repo) gegen Live-URL: PASS, 0 Konsolenfehler; Status «Prototyp v5.4»; CSP unverändert.

**Geprüfter Stand (SHA-256):**
```
    3ba9cc747d8d8e500f383ce6ddd0c21c7f330d7242f020179222df887c176a64  index.html
    edb11f56e6741177225f9a97604cbe48a66c564d524ae5ee60575fbf883329c1  styles.css
    6a5644635a0655ecac6b778afff7c3503180303f591c002bfd0e68a20d8bb7ff  app.js
    20244867f38b0db3decd43c257921616b8ce02c3c3411f076a04501e31669689  locales.js
    f1d295e12e90344741d07bf72ac87b229f6d586daf251a726bc909721a892bd7  v1-features.js
    e9ef0549139c2f3ca67bd9a53714fe5a68ef955b495217a39eb6477f472ecafb  worker.mjs
```
