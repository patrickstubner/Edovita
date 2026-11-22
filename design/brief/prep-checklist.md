# Edovita – Prep-Checkliste (ohne Cloud Agents / ohne Repo-Code)

Stand: 2026-11-06, ergänzt 15:30 (Europe/Zurich) · Ziel: vor Coding-Wiederaufnahme ~27.11.2026 erledigen  
Repo `patrickstubner/Edovita` bleibt unberührt. Arbeitsort: `design/brief/`, `design/`, Prototyp-Shots.

Musik-Scope (bereits entschieden): alles unter `sounds/ (nur lokal beim Projektinhaber, nicht im Repo)` ausser `hymne_AI_H2*`/`H3*` (+ Alt-Takes), `stile_v3/_discarded`, `stile_v3/samples/`, `ai_hymnen_v1/raw/`. Favoriten: H1, H5, H4; Rock 3/4; Hip-Hop v2 #2 (= `stile_v2/hiphop_v2`, Kopie auch in `stile_v3/`). Credit MuldjordKit; KI-Hymnen als «KI-generiert» kennzeichnen.

---

## Inventar kurz

### Logos (`design/logos/final/`)
| Asset | Status |
|---|---|
| `edovita_appicon.svg` + `.png` 1024×1024 RGB | vorhanden |
| Logo hell/dunkel/weiss/transparent SVG+PNG | vorhanden |
| Animation CSS + HTML + GIF/MP4/Filmstrip | vorhanden (`logos/animation/`) |
| Quicksand-VF.ttf | vorhanden; **OFL-Lizenztext fehlt als Datei** |
| PWA/Capacitor Icon-Set (16–512, maskable, adaptive) | **fehlt** |
| Favicon `.ico` / 32/48 | **fehlt** |
| Native Splash-Bilder | bewusst nicht nötig (einfarbig weiss/schwarz) |

### Sounds
| Set | Status |
|---|---|
| Favoriten-Kopien | `design/sounds/favoriten/` |
| Roh-Inventarliste | `sounds-manifest.txt` (Pfad+Bytes, **kein** Ship-Manifest) |
| A/B/C-Stings mp3+wav | vorhanden (root `sounds/`) |
| stile / stile_v2 / stile_v3 / melodien_v1–3 / ai_hymnen | vorhanden |
| Ship-CSV (id, Label DE, Rolle, Default, KI-Flag, Credit) | **fehlt** |
| Phase-1-Subset-Ordner (nur Auslieferung) | **fehlt** (nur Favoriten-Subset) |
| Loudness | laut README schon −14 LUFS gemastert; **Hör-QC durch Projektinhaber offen** |

### Content / Legal / Store
| Thema | Status |
|---|---|
| Disclaimer-Snippet (Hilfe-Screen) | Prototyp hat Kurztext |
| Datenschutzerklärung / Impressum / Credits-Seite | **fehlen** |
| Store-Listings / Keywords | **fehlen** (Submission erst später, Texte jetzt vorbereitbar) |
| Offene Architektur-Entscheide (§12) | **offen** |
| Rezept-/Lebensmittel-Stubdaten | **fehlen** (Pipeline Phase 1 nicht, aber Stub-JSON möglich) |
| Capacitor `appId` / Bundle-ID | **erledigt:** `ch.edovita.app` (Decision-Log #5) |
| UI-Übersetzungen v1 (7 Sprachen) | **Entwürfe vorhanden** im Prototyp `locales/` (EN, FR, IT, ES, JA, PT = `reviewed=false`); Fach-/Rechtsprüfung offen |
| PT-Rechtslage (LGPD/DSGVO) | **geprüft 6.11.2026**, vereinbar mit EU-Datenhaltung, Auflagen in `legal/…` §8 |

---

## MUST – vor Coding (~27.11.)

### M1. Projektinhaber: Offene Entscheide schriftlich fixieren
- **Was:** Antworten zu architektur-hosting.md §12, mind. für Phase 1 relevant:
  1. Datenort EU (CF) vs. nur CH  
  2. Zuerst nur Web/PWA vs. Store-Konten (Apple 99 USD/J, Google 25 USD)  
  3. Kontomodell (Phase 2, aber Richtung)  
  4–5. Cloud-Backup default aus; Partner nur Einkauf/Rezepte  
  6. Sync-Technik → nach Spike Phase 2  
  7. EU-Markt jetzt oder später CH-first  
  8. Juristen-Budget grob  
  9. Domain: wann / Kandidatenliste  
  10. Prototyp einfrieren (bereits empfohlen)  
- Zusätzlich: **Capacitor appId** z. B. `ch.edovita.app` / Display-Name «Edovita»
- **Wer:** Projektinhaber (Master Bot fasst Antworten in 1 Seite Decision-Log)
- **Aufwand:** 30–60 Min
- **Warum:** Scaffold braucht Bundle-ID, Hosting-Ziel, PWA-vs-native Scope; verhindert Umbau

### M2. Master Bot / Entwickler-ohne-CloudAgent: Icon- & Favicon-Paket generieren
- **Was:** Aus `edovita_appicon.svg`/1024-PNG erzeugen und unter `design/logos/export/` ablegen (nicht ins Git-App-Repo committen, bis Coding startet):
  - PWA: 192, 512 (+ maskable 192/512 mit Safe-Zone)
  - Favicon: 16, 32, 48, `favicon.ico`
  - Apple Touch: 180
  - Android adaptive: foreground (transparent) + background (#0B7F6B oder weiss/schwarz) + 108dp-Vorlagen
  - Capacitor-üblich: 48–512 Zwischengrössen
- **Wer:** Master Bot oder Entwickler-Bot (lokale Tools/Box, ImageMagick/cairosvg) – **kein** Cloud Agent nötig
- **Aufwand:** 1–2 h
- **Warum:** Phase-1 Scaffold + PWA-Manifest brauchen die Dateien sofort

### M3. Master Bot: Ship-Sound-Manifest (CSV/JSON) finalisieren
- **Was:** Datei z. B. `design/brief/sounds-ship-manifest.csv` mit Spalten: `id`, `rel_path`, `role` (hymne|jingle|sting|ui), `label_de`, `default`, `ki_generated`, `credit`, `include_phase1`, `notes`
  - Defaults setzen: H1/H5/H4, rock_v3/v4, hiphop_v2 (stile_v2 + Hinweis stile_v3-Kopie)
  - Exclude-Regeln explizit
  - UI-Stings A/B/C als `include_phase1=yes`
  - Optional: kurzes Phase-1-Subset (Favoriten + A/B/C + je Stil 1 Default) vs. Full-Catalog
- **Wer:** Master Bot; Projektinhaber bestätigt Labels/Defaults nach Hörprobe
- **Aufwand:** 1–2 h (+ Hörzeit Projektinhaber)
- **Warum:** Coding kann Assets 1:1 einbinden ohne Scope-Diskussion

### M4. Projektinhaber: Hör-QC Favoriten + kurze Hymnen-Schnitte entscheiden
- **Was:** Favoriten in `design/brief/audio/` anhören; entscheiden ob Hymnen als 25–28 s bleiben oder Intro-Schnitt 5–8 s («E-do-vi-ta!») für App-Events; Alt-Takes H1/H4/H5 optional
- **Wer:** Projektinhaber (Ideen-Scout kann Hörnotiz-Template vorbereiten)
- **Aufwand:** 45–90 Min
- **Warum:** verhindert erneutes Encoding/Umbau nach Scaffold

### M5. Master Bot / Ideen-Scout: Rechtstexte-Entwürfe (CH-Deutsch, ss)
- **Was:** Drafts unter `design/brief/legal/` (keine Rechtsberatung, klar als Entwurf markieren):
  1. **Disclaimer** (keine Medizin-/Ernährungsberatung; Allergenfilter nur Hinweis; Grenzwerte Richtwerte)
  2. **Datenschutz Phase-1** (local-first, was lokal gespeichert wird, keine Sync-Server, Kontakt)
  3. **Credits** (MuldjordKit/DrumGizmo; KI-Hymnen ACE-Step Apache-2.0 «KI-generiert»; Quicksand OFL; Quellen Nährwertdaten später)
  4. **Einwilligungs-Skizze** für spätere Backup/Partner/Health (Checkbox-Texte)
- **Wer:** Master Bot Draft → Projektinhaber Review → optional Jurist später
- **Aufwand:** 2–4 h Draft
- **Warum:** BRIEF verlangt Disclaimer in Phase 1; Stores brauchen später URL

### M6. Master Bot: UI-String-Inventar aus Prototyp (DE-CH)
- **Was:** Alle sichtbaren Texte aus `edovita-prototyp` (Onboarding, Schutzhinweise zielabhängig, Hilfe-Hotlines, Disclaimer) als `strings-de.json` / Markdown-Tabelle extrahieren; Kontrast-Fix Primär `#0B7F6B` vermerken
- **Wer:** Master Bot / Entwickler-ohne-CloudAgent
- **Aufwand:** 2–3 h
- **Warum:** Portierung Screens ohne Copy-Rätsel; medizinische Formulierungen reviewbar

### M7. Projektinhaber + Master: Store-/App-Metadaten (auch ohne Submission)
- **Was:** Kurzentscheid + Draft:
  - App-Name, Untertitel, Kurzbeschreibung, Langtext (DE)
  - Kategorie (Health & Fitness / Food)
  - Keywords
  - Screenshot-Auswahl aus `prototyp/shots/` (mind. 5–6: Onboarding, Heute hell/dunkel, Splash, Rezepte, Fortschritt, Profil)
  - Feature-Graphic-Skizze (Android) aus Logo
- **Wer:** Projektinhaber entscheidet Tonalität; Master Bot schreibt Draft + kuratiert Shots nach `design/brief/store/`
- **Aufwand:** 2–3 h
- **Warum:** Parallelisierbar; unblockt Launch später, liefert auch PWA-Manifest-Felder

### M8. Master Bot: Cloudflare / Hosting Notizen (ohne Deploy-Zwang)
- **Was:** 1-Pager: Worker-Name-Kandidat `edovita` / `edovita-app`, Jurisdiction `eu`, DPA akzeptieren/ablegen (Projektinhaber), Static Assets für Privacy-URL, Hinweis GitHub Pages **nicht** für kommerziell; Prototyp-URL bleibt Referenz
- **Wer:** Master Bot schreibt; Projektinhaber bestätigt CF-Account Projekt-Konto
- **Aufwand:** 30–45 Min
- **Warum:** Phase-1 Web-Deploy + Privacy-URL ohne Architektur-Neudiskussion

---

### M9. Sprachen v1 inkl. PT (Stand 6.11.2026)
- **Erledigt:** Entscheid v1 = EN, DE, FR, IT, ES, JA, PT (pt-BR); Legal-Gate nur DE/EN wählbar; PT-Übersetzung vollständig (745/745 inkl. neuer Körperdaten-Texte) im Prototyp; LGPD/ANPD-Prüfung mit Quellen (§8); Entwickler-Übergabe `HANDOFF-entwickler.md`.
- **Offen (Projektinhaber/Anwalt):** Muttersprachliche Prüfung je Sprache (pt-BR zuerst, dann pt-PT-Rechtstexte); Encarregado bzw. pt-Kontaktkanal; Cloudflare-Onward-Transfer USA (ANPD-SCC ja/nein); Freigabe `legalApproved` pro Sprache; Deploy des PT-Stands auf den Worker (braucht Freigabe).

## NICE – sinnvoll vor Coding, nicht blockierend

### N1. Phase-1 Sound-Subset-Ordner + leichte Kompression
- Nur Ship-Dateien spiegeln; WAV weglassen wenn MP3 reicht; Hymnen ggf. kürzen nach M4
- **Wer:** Master Bot · **Aufwand:** 1 h

### N2. Quicksand OFL LICENSE + Font-Subset-Hinweis
- Lizenzdatei neben `fonts/`; entscheiden ob VF oder statische Weights für PWA
- **Wer:** Master Bot · **Aufwand:** 20 Min

### N3. Rezept-/Lebensmittel-Stub (10–20 Einträge)
- Handkuratiertes `rezepte-stub.json` + Quellenfeld-Schema (BLS/Schweizer NDB/USDA) – **keine** volle Import-Pipeline
- **Wer:** Ideen-Scout Inhalt, Master Bot Schema · **Aufwand:** 2–4 h
- **Warum:** Screens Rezepte/Einkauf haben Inhalt ohne Pipeline

### N4. Hilfe-Hotlines erneut verifizieren
- 143 / PEP / AES Nummern+Zeiten gegen Live-Seiten (wie SECURITY.md 4.11.)
- **Wer:** Master Bot · **Aufwand:** 20 Min

### N5. Screen-Flow / IA Einseiter
- Flussdiagramm Onboarding→Heute→… aus Prototyp für Entwickler-Handoff
- **Wer:** Ideen-Scout / Master · **Aufwand:** 1 h

### N6. Domain-Kandidatenliste
- z. B. edovita.ch / .app – nur Recherche+Preise, kein Kauf ohne Projektinhaber
- **Wer:** Ideen-Scout · **Aufwand:** 30 Min

### N7. Medizinprodukt / Wellness Abgrenzung – Kurzrecherche
- Hinweisliste was Disclaimer abdecken muss (keine Diagnose/Therapie)
- **Wer:** Ideen-Scout · **Aufwand:** 1–2 h · **nicht** Rechtsberatung

### N8. Belohnungs-Animation Spec
- Lottie vs. SVG/CSS (Prototyp-Empfehlung: kein Lottie Phase 1) – ½ Seite Spec
- **Wer:** Master · **Aufwand:** 30 Min

### N9. Apple/Google Developer-Konten vorbereiten (nur wenn M1 = Stores)
- Account-Daten sammeln, **nicht** zwingend bezahlen vor 27.11.
- **Wer:** Projektinhaber · **Aufwand:** variabel

### N10. Prototyp einfrieren / Tag
- README-Vermerk «frozen v4 design reference»; optional Snapshot-Hash aus SECURITY.md
- **Wer:** Master Bot · **Aufwand:** 15 Min

---

## Explizit NICHT jetzt (wartet auf Cloud Agents / Coding)

- Rsbuild/React/TS Scaffold, Capacitor-Projekte im GitHub-Repo
- Service Worker / PWA-Implementierung im Code
- SQLite-Schema-Code, Sync/Backend Workers
- Echte Lebensmittel-Import-Pipeline, HealthKit
- Store-Submission

---

## Vorschlag Auftrag an Master Bot (Reihenfolge)

1. Decision-Log-Vorlage → Projektinhaber (M1)  
2. Parallel: Icon-Export (M2), Sound-Ship-Manifest (M3), String-Inventar (M6)  
3. Legal-Drafts (M5) + Store-Draft + Shot-Kuratierung (M7)  
4. Projektinhaber Hör-QC (M4) → ggf. Hymnen-Schnitte (N1)  
5. CF-Notiz (M8), Nice-Items nach Kapazität  

Erfolg: Entwickler startet ~27.11. mit fertigen Assets, Manifest, Copy und Entscheiden – ohne Asset-/Legal-Blocker.
