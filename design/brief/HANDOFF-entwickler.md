# Edovita – Entwickler-Übergabe

Stand: 6.11.2026, 15:46 (Europe/Zurich) · Für den Entwickler, sobald wieder Cloud Agents verfügbar sind.
Quelle der Entscheide: `decision-log.md`. Bei Widerspruch gilt: Decision-Log > dieses Dokument > `BRIEF.md` > `design/architektur-hosting.md`.

> **Kurz:** Neue Produktiv-App bauen (den Prototyp **nicht** erweitern). Web-App + Capacitor, **PWA zuerst**. Local-first, Gesundheitsdaten nur auf dem Gerät. 7 Sprachen über i18next, Fallback EN, Rechts-Gate pro Sprache. Repo öffentlich, keine Secrets. Keine Kosten ohne Rückfrage bei Projektinhaber.

---

## 1. Entscheide (verbindlich)

| # | Thema | Entscheid | Quelle |
|---|---|---|---|
| 1 | Stack | React + TypeScript + **Rsbuild** (nicht Vite) + **Capacitor** (iOS/Android) | BRIEF.md, Projektinhaber 6.11.2026 |
| 2 | Reihenfolge | **PWA zuerst** (Web-App + Service Worker), Stores später | Decision-Log #2 |
| 3 | App-ID / Bundle-ID | `ch.edovita.app`, Anzeigename «Edovita» | Decision-Log #5 |
| 4 | Datenhaltung | Local-first: SQLite auf dem Gerät (`@capacitor-community/sqlite`, Web: wa-sqlite/OPFS). Kein Konto, keine Analytics mit Gesundheitsbezug | architektur-hosting.md §1, §3 |
| 5 | Backup | Standardmässig **aus**; optional, Ende-zu-Ende verschlüsselt (nur Ciphertext), Cloudflare Jurisdiction `eu` (D1/DO/R2) – **nicht Phase 1** | Decision-Log #1, #4 |
| 6 | Markt | CH + DE/AT von Anfang an, grundsätzlich weltweit über Store-Länderauswahl | Decision-Log #3, Sprachen |
| 7 | i18n | **i18next + react-i18next + i18next-icu** (ICU-Plurale/Select) | Decision-Log «i18n» |
| 8 | Sprachen v1 | **en, de, fr, it, es, ja, pt** (pt = Basis **pt-BR**) | Decision-Log «v1 Sprachen + PT» |
| 9 | Fallback | `en` | Decision-Log |
| 10 | Rechts-Gate | Sprache nur wählbar, wenn `meta.legalApproved === true`. Aktuell **nur DE und EN**; FR/IT/ES/JA/PT ausgegraut mit «In Prüfung», Gerätesprache dieser 5 → Start in EN | Decision-Log |
| 11 | Repo | `patrickstubner/Edovita` ist und bleibt **öffentlich**. Keine Secrets/Keys/Tokens/.env im Repo | Decision-Log «Repo» |
| 12 | Kosten | **Keine Kosten** ohne vorherige Freigabe durch Projektinhaber (Hosting Cloudflare Free, workers.dev, keine Domain, keine Store-Konten ohne OK) | Projektinhaber |
| 13 | Sicherheitsregel | Nach **jeder** Codeerstellung/-änderung Sicherheits- und Schwachstellenprüfung (XSS/Injection, Secrets, Abhängigkeiten inkl. `npm audit`, Berechtigungen) und Meldung an Projektinhaber, **bevor** weitergebaut wird | Skill «Sicherheitsprüfung nach Codeänderung» |
| 14 | UI-Quelltext | Deutsch, Schweizer Schreibweise (ss, kein ß); Dark Mode System/Hell/Dunkel | BRIEF.md |

## 2. i18n – Struktur und Regeln

```
src/locales/
  languages.json            { "fallback": "en", "active": [...7], "planned": [hi, ko, bn, tr, id] }
  <code>/meta.json          code, name, englishName, locale, direction, fallback, units, font,
                            reviewed, legalApproved, legalNote, (pt: variant, variantNote)
  <code>/ui.json            745 UI-Schlüssel (ICU-Strings)
  <code>/legal.json         Gesundheitshinweis, Datenschutz, Sprachen, Credits
  <code>/recipes.json       recipes, cuisines, ingredients, foods (IDs stabil, Texte übersetzt)
  <code>/store.json         title, subtitle, short (App Store / Google Play)
```
- **Vorlage zum Übernehmen:** `prototype/locales/` (7 Sprachen × 5 Dateien, alle 745 Schlüssel). Quelle/Generator: `prototype/tools/build-locales.py` (prüft fehlende Schlüssel, Platzhalter gegen EN, Klammern, kein HTML) – als CI-Test nachbauen.
- `locale` je Sprache: de-CH, en-GB, fr-CH, it-CH, es-ES, ja-JP, **pt-BR**. Zahlen/Daten nur über `Intl` (`NumberFormat`, `DateTimeFormat`, `PluralRules`). Einheiten bleiben kg/kcal/cm.
- **pt-BR-Hinweise:** Plural «one» gilt in pt auch für 0 → bei Zählern `=0 {…}` ergänzen (im Prototyp so gemacht). pt-PT-Geräte bekommen vorerst pt-BR; Rechtstexte für Portugal in pt-PT gegenlesen.
- Ja: Schrift System (Hiragino / Noto Sans CJK JP), `word-break: keep-all` für Titel.
- Übersetzungen nur als Text setzen (React escaped), **nie** `dangerouslySetInnerHTML`.
- Sprachwechsel jederzeit (Onboarding-Start mit Geräteerkennung + Profil › Sprache), sofort, ohne Neustart, ohne Datenverlust. Gewählte Sprache lokal speichern; ungültige/gesperrte gespeicherte Werte ignorieren.
- Status je Sprache: alle ausser DE `reviewed=false` (Entwurf). `legalApproved` darf nur nach Anwaltsfreigabe auf `true`.

## 3. Rechtliches (Kurzfassung, keine Rechtsberatung)
- Details: `legal/sprachen-regionen-datenschutz.md` (inkl. **§8 Portugiesisch: LGPD/ANPD + DSGVO**), `legal/datenschutz-phase1.md`, `legal/einwilligungen-skizze.md`, `legal/disclaimer-gesundheit.md`, `legal/credits-lizenzen.md`.
- Gesundheitsdaten = besonders schützenswert (DSG/DSGVO Art. 9/LGPD Art. 11). Einwilligungen getrennt pro Zweck (Backup, Partnermodus, Health-Import), jederzeit widerrufbar.
- PT/Brasilien: EU-Speicherung ist über ANPD-Res. 32/2026 gedeckt; offen: Encarregado/pt-Kontaktkanal, Cloudflare-Metadaten USA (ANPD-SCC?). Backup für BR erst nach Anwaltsfreigabe.
- App-Altersfreigabe 16+ (Abnehm-Funktionen); Brasilien ECA Digital: Alterssignal der Stores beachten.
- Schutzregeln (Pflicht): kein Abnehmen bei BMI < 18.5; Gewicht min. 25 kg bei Zunehmen/Halten, 40 kg bei Abnehmen; Tempo ≤ 1 kg/Woche (Zunehmen ≤ 0,75); Tagesziel nie unter 1'500 kcal (Männer) / 1'200 kcal (Frauen); zielabhängige Texte (nie «abnehmen» bei Ziel Zunehmen); Hilfe-Hinweise bei sehr tiefem BMI (`strings/strings-goal-protection-de.json`).
- Disclaimer: keine Medizin-/Ernährungsberatung, Allergenfilter nur Hinweis.

## 4. Datenschutz-Technik
- Lokal: SQLite verschlüsselt (SQLCipher bzw. Web: Verschlüsselung mit WebCrypto, Schlüssel nicht im Klartext speichern). Fotos E2EE.
- Kein Tracking-SDK, keine Werbung, keine Drittanbieter-Fonts/CDNs (alles self-hosted).
- Service Worker: nur App-Shell und versionierte statische Inhalte cachen, **nie** Gesundheitsdaten/API-Antworten in der Cache-API.
- Strenge CSP (Vorlage Prototyp: `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none' (Phase 1); media-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`), dazu `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restriktiv. Vorlage: `prototype/_headers`, `worker.tpl.mjs`.
- localStorage nur für nicht-sensible Einstellungen (Sprache, Darstellung, Ton, Melodie).
- Geburtsdatum (neu statt Alter) ist ein Personendatum: lokal verschlüsselt, nie im Partnermodus teilen.

## 5. Assets (Pfade auf der Box)

| Was | Pfad |
|---|---|
| Logos final (SVG/PNG, hell/dunkel/weiss/transparent, App-Icon 1024) | `design/logos/final/` |
| Logo-Animation (CSS + HTML + GIF/MP4) | `design/logos/animation/` (`logo-anim.css`; Prototyp-Kopie `prototype/logo-anim.css`) |
| Icon-/Favicon-Export-Skript | `design/brief/scripts/export_icons.py` |
| UI-Icons (SVG-Sprite, Stroke-Icons) | `prototype/index.html` (`<symbol id="i-…">`, ca. 50 Icons) |
| Sounds Quelle | `sounds/ (nur lokal beim Projektinhaber, 3.4 GB, nicht im Repo)` |
| Sounds Auslieferung (Manifest) | `design/brief/sounds-ship-manifest.csv` (Spalte `include_phase1`), Favoriten-Kopien `design/sounds/favoriten/` |
| Sounds im Prototyp | `prototype/audio/` (H1, H5, H4, A/B/C-Stings) |
| Store-Texte/Screenshots | `design/brief/store/` |
| String-Inventar DE | `design/brief/strings/` |

- **Sound-Regeln:** Standard-Hymne **H1**, Töne beim ersten Start **an** (Browser spielt erst nach einer Berührung). Nicht ausliefern: `hymne_AI_H2*`, `hymne_AI_H3*`, `stile_v3/_discarded`, `stile_v3/samples/`, `ai_hymnen_v1/raw/`. KI-Hymnen als «KI-generiert» kennzeichnen (ACE-Step v1, Apache-2.0); Credit «Drum samples provided by DrumGizmo.org». Ton-Schalter global; nie Ton bei «aus».
- **Animation:** Splash (Zusammenbau, Herz Lub-Dub, EKG) aus `logo-anim.css`, `prefers-reduced-motion` respektieren; native Splash nur einfarbig.

## 6. Prototyp (Design-Referenz, nicht Code-Basis)
- **Live (v5, Stand 6.11.2026 ~15:15, ohne PT/ohne neue Körperdaten-Eingabe):** (Cloudflare-Worker-Demo, URL nicht öffentlich dokumentiert)
- **Lokal (aktueller Stand v5.1 inkl. PT + Körperdaten-Stepper):** `prototype/` → `index.html` (statisch, z. B. `python3 -m http.server`), Screenshots `screenshots/01–08`.
- Wichtige Screens: Start/Sprachwahl, Onboarding 1–4 (Ziel, «Erzähl uns von dir», Zielgewicht/Tempo, Vorlieben), Heute, Details, Erfassen (Text/Sprache/Barcode/Foto später), Rezepte (Sterne, Merken, Vielfalt), Einkauf (offen/im Korb/zu Hause), Restaurant, Woche, Kraft, Fortschritt, Körper, Profil, Partner, Arzt-Export, Sprache, Töne, Datenschutz/Backup-Einwilligung, Rechtliches, Hilfe.
- Körperdaten-Eingabe (neu): Grösse/Gewicht mit Minus/Plus (1 cm / 0,1 kg, Halten beschleunigt), Wert antippbar zum Tippen, Slider grob (Gewicht 0,5 kg); Geburtsdatum Tag/Monat/Jahr in Sprachreihenfolge, Alter berechnet, 13–110 Jahre, kein Zukunftsdatum, Hinweis unter 16.
- Sicherheitsbericht Prototyp: `prototype/SECURITY.md`.

## 7. Phase 1 – Auftrag (aus BRIEF.md, aktualisiert)
1. Rsbuild/React/TS + Capacitor-Grundsetup (`appId: ch.edovita.app`), PWA (Manifest + Service Worker).
2. i18n-Gerüst wie §2 inkl. Rechts-Gate, Sprachwahl im Onboarding-Start und Profil, CI-Test für Schlüssel/Platzhalter.
3. Screens aus dem Prototyp portieren (Handy zuerst), Theme hell/dunkel; **Primärgrün für Text/Buttons im Hellmodus #0B7F6B** (Kontrast 4,9:1 statt 3,4:1).
4. Lokale Persistenz (Profil, Ziele, Logs), keine Sync.
5. Schutzregeln §3, Sounds/Animation §5, Disclaimer.
6. README + SECURITY.md mit `npm audit`, Secrets-Scan, Angriffsflächen; Version 0.1.0.
- **Nicht in Phase 1:** Backend/Sync/Partner-Server, HealthKit/Health Connect, Lebensmittel-DB-Pipeline, Store-Submission, Deploy ohne Freigabe.

## 8. Arbeitsregeln
- Keine Secrets ins Repo; Cloudflare-Zugang nur über des Projektinhabers Konto/CI-Secrets ausserhalb des Repos.
- Kein Deploy, keine Domain, keine kostenpflichtigen Dienste ohne des Projektinhabers OK.
- Nach jeder Änderung Sicherheitsprüfung (§1 Nr. 13) und kurzer Bericht.
- Offene Punkte: `prep-checklist.md` (M1–M9), `legal/sprachen-regionen-datenschutz.md` §5 + §8.4.
