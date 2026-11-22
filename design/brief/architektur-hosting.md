# Edovita – Architektur- und Hosting-Entscheid

Stand: 5. November 2026 · Autor: Grok Bot für Projektinhaber · Status: Entscheidungsvorlage (keine Rechtsberatung)

> **Wichtig:** Preise und Limits wurden am 5.11.2026 auf den offiziellen Seiten gelesen (Links in Abschnitt 12). Was nicht verifiziert werden konnte, ist als «(nicht verifiziert)» oder «Annahme» markiert. Es wurde nichts registriert, gekauft oder deployt.

---

## 1. Empfehlung in Kürze

| Frage | Empfehlung |
|---|---|
| **Was** | **Local-first-App:** React + TS + Vite in Capacitor, Gesundheitsdaten primär in einer SQLite-DB auf dem Gerät. Rezepte und Lebensmittel sind öffentliche Inhalte und werden als statische Dateien ausgeliefert (keine Rezept-Datenbank im Backend). Backend nur für optionales **verschlüsseltes Backup/Sync** und **Partnermodus**. |
| **Wo** | **Cloudflare** (das Cloudflare-Konto des Projektinhabers): Workers (API + statische Assets), Durable Objects (SQLite) für Sync und Partner-Echtzeit, D1 nur für Konto-/Pairing-Index. Speicherort per **Jurisdiction `eu`**. Kein Domain-Kauf nötig (workers.dev). |
| **Wann** | Jetzt: 3 kurze Spikes (Sync, Health-Plugin, Food-Daten-Import), dann Phase 1 **ohne Backend** (nur lokal), dann Backend für Partnermodus und Backup. Details Abschnitt 10. |
| **Warum** | 0 CHF Betriebskosten ohne Kreditkarte; Gesundheitsdaten bleiben auf dem Gerät oder nur als Ciphertext auf dem Server (Datenminimierung nach DSG Art. 7); statische Inhalte sind gratis und unbegrenzt; Skalierung bis ca. 100k Nutzer kostet im Modell nur ca. 20–50 USD/Monat. |
| **Skalierung** | Stufe 1 gratis (bis ca. 1–5k registrierte Nutzer) → Workers Paid 5 USD/Mt. (ab ca. 5k) → bei Bedarf Postgres-Pfad (Supabase Zürich / Neon / Self-Host). Server-Logik bleibt portabel (Hono + SQLite-Schema). |
| **Nicht** | Kein Firebase (Billing/Blaze nötig, US-Anbieter), kein Supabase Free für Produktion (Pausierung, keine Backups), kein GitHub Pages (kommerzielle SaaS ausgeschlossen), kein Vercel Hobby (nur nicht-kommerziell), keine iCloud-/CloudKit-Speicherung von Gesundheitsdaten (Apple 5.1.3). |

**Ehrlicher Vorbehalt zu «0 CHF»:** Hosting ist gratis, aber die **Store-Konten nicht**: Apple Developer Program 99 USD/Jahr, Google Play einmalig 25 USD ([Apple](https://developer.apple.com/programs/enroll/), [Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)). Ohne diese Gebühren gibt es nur Web/PWA (ohne HealthKit/Health Connect). Siehe offene Entscheide.

---

## 2. Ausgangslage

- **Prototyp** Cloudflare-Worker-Demo: statischer Klick-Prototyp (HTML/CSS/Vanilla-JS, ~55 KB `app.js`, in ein einziges `worker.mjs` gebaut, keine Daten gespeichert, kein Backend). Befund: **nicht erweitern**, sondern als Design-Referenz einfrieren. Die Produktiv-App wird als Vite-/React-/TS-Projekt neu aufgesetzt; Screens und Schutzmechanismen (BMI-Grenzen, Mindest-kcal) werden übernommen.
- **Nutzer:** Schweiz, Sprache Deutsch → faktisch auch DE/AT (relevant für DSGVO).
- **V1-Funktionen und ihr Datentyp:**

| Funktion | Datentyp | Ort |
|---|---|---|
| Essens-Log, kcal/Protein, Gewicht/BMI/Körperfett, Ziele, Schritte/Schlaf, Wochenreview, Essensfenster | **Gesundheitsdaten** (besonders schützenswert) | Gerät; optional verschlüsseltes Backup |
| Rezepte (150–300), Lebensmittel-Nährwerte | öffentliche Inhalte | statisch (CDN), im App-Bundle/Cache |
| Sterne, Favoriten | Nutzerdaten, geringes Risiko | Gerät; Backup |
| Einkaufsliste, geteilte Rezepte (Partnermodus) | Nutzerdaten, geteilt | Haushalts-Raum (Durable Object), Ende-zu-Ende-verschlüsselt |
| Später: Foto-KI, Aktionen, Kundenkarten-Flags | Bilder/Gesundheit, Drittanbieter | später, eigener Entscheid |

---

## 3. Zielarchitektur

```
 Gerät (Capacitor iOS/Android, optional Web)
 ├─ React/TS/Vite UI
 ├─ SQLite lokal  ← primäre Quelle für Gesundheitsdaten
 ├─ Lebensmittel-/Rezept-DB (read-only, versioniert, aus statischen Dateien)
 ├─ HealthKit / Health Connect (Schritte, Schlaf) via Plugin → nur lokal
 └─ Sync-Client: Op-Log, clientseitig verschlüsselt (Schlüssel nur auf Geräten)
          │ HTTPS / WebSocket
 Cloudflare (Konto des Projektinhabers, Jurisdiction eu)
 ├─ Worker «edovita-api» (Hono/TS): Auth, Pairing, Sync-Endpunkte, Rate-Limits
 ├─ Static Assets: rezepte-vN.json, lebensmittel-vN.sqlite, Bilder  (Requests gratis/unbegrenzt)
 ├─ Durable Object (SQLite) pro Konto: Ciphertext-Op-Log (Backup/Multi-Device)
 ├─ Durable Object (SQLite) pro Haushalt: geteilte Einkaufsliste/Rezepte, WebSocket Hibernation
 └─ D1 (eu): Konto-Index, Pairing-Codes (keine Gesundheitsdaten)
```

Kernideen:
1. **Local-first:** App funktioniert offline und überlebt Tageslimits des Gratis-Tarifs (Limit-Ausfall = nur Sync pausiert).
2. **Datenminimierung:** Server sieht nur Ciphertext + Metadaten. Das reduziert Risiko und Pflichten, ersetzt aber nicht Einwilligung/Datenschutzerklärung.
3. **Partnermodus ohne Server-Klartext:** Haushaltsschlüssel steckt im QR-Code (kommt nie zum Server). Granulare Freigaben = pro Datenkategorie getrennte Schlüssel/Räume. V1: nur Einkaufsliste und Rezepte teilen, **keine** Gesundheitswerte.
4. **Portabilität:** API mit Hono (läuft auch auf Node/Bun), SQLite-kompatibles Schema, Export-Funktion (auch gesetzlich nötig: DSG Art. 28).

---

## 4. Frontend-Hosting

Für Capacitor wird das Frontend **im App-Bundle** ausgeliefert; Hosting betrifft nur die optionale Web-Version, Inhalts-Updates und Landingpage/Datenschutzerklärung (diese URL verlangen die Stores).

| Option | Gratis-Limits (Nov 2026) | Eignung |
|---|---|---|
| **Cloudflare Workers + Static Assets** | Requests auf statische Assets gratis und unbegrenzt; 20'000 Dateien/Version, 25 MiB/Datei; Cloudflare lenkt neue Projekte auf Workers statt Pages | **Empfohlen** (derselbe Account wie Prototyp und Backend) |
| Cloudflare Pages | weiter nutzbar, aber neue Features nur auf Workers | nur falls Nicht-Cloudflare-DNS nötig |
| Vercel Hobby | 100 GB Transfer, aber **nur nicht-kommerziell** | nein (kommerzielles Produkt) |
| Netlify Free | 300 Credits/Mt., Projekt pausiert bei Verbrauch | möglich, aber Pausierungsrisiko |
| GitHub Pages | 100 GB/Mt. soft, 1 GB Site; **kein kommerzielles SaaS** | nein |

Hinweis: Eine Community-Antwort nennt `workers.dev` als «für nicht geschäftskritische Hobbyprojekte gedacht» (nicht offiziell verifiziert). Für den öffentlichen Launch ist eine eigene Domain sinnvoll; für V1-Tests reicht workers.dev.

---

## 5. Backend-Optionen im Vergleich

| Option | Gratis (verifiziert) | Region / Datenort | Offline/Realtime | Urteil für Edovita |
|---|---|---|---|---|
| **Cloudflare** Workers + DO + D1 + R2 + KV | Workers 100k Req/Tag, 10 ms CPU; D1 5 M Reads + 100k Writes/Tag, 5 GB total, **500 MB pro DB**; DO (SQLite) 100k Req/Tag, 5 GB; R2 10 GB, 0 Egress; **keine Karte nötig** | Jurisdiction **EU** für D1/DO/R2 (nicht CH); Workers laufen global | DO + WebSocket Hibernation = Echtzeit; kein Offline-SDK (eigenes Sync) | **Empfohlen für V1** |
| **Supabase** | Free: 500 MB DB, 50k MAU, Realtime 200 Verbindungen; **Pausierung nach 1 Woche Inaktivität, keine Backups**, 2 Projekte | Zürich (`eu-central-2`) und Frankfurt wählbar | Postgres Changes/Realtime; Offline nur mit PowerSync o. ä. | Gut als **Skalierungspfad** (Pro ab 25 USD), nicht als Gratis-Produktion |
| **Firebase** | Spark: Firestore 1 GiB, 50k Reads/20k Writes pro Tag; Phone-Auth/SMS nur mit Blaze | Firestore `europe-west6` (Zürich) | Offline-Cache und Realtime eingebaut | Reibung: Billing/Karte für Wachstum, Google-Lock-in, 50k Reads/Tag reichen ab ca. 3k aktiven Nutzern/Tag nicht |
| **Appwrite Cloud** | Free-Plan friert bei Limit ein (Details der Limits nicht verifiziert) | Frankfurt (FRA) | Realtime vorhanden | Möglich, kein Vorteil gegenüber CF |
| **PocketBase** (Self-Host) | Software gratis; Server kostet (z. B. Hetzner CX23 5.49–5.99 €/Mt.) | frei wählbar (Hetzner DE/FI, Infomaniak CH) | SSE-Realtime; Einzelserver, kein HA, noch pre-1.0 | Exit-Pfad für kleine/mittlere Last, nicht V1 (kostet, Betrieb) |
| **Neon** (Postgres) | Free: 100 CU-h/Projekt, 1 GB/Projekt, Scale-to-zero, keine Karte | AWS-Regionen (Frankfurt, nicht verifiziert) | kein Realtime-Sync für Clients | Postgres-Ausweg via Cloudflare Hyperdrive |
| **Turso** (libSQL) | Free: 100 DBs, 5 GB, 500 M Reads, 10 M Writes/Mt.; Dev 4.99 USD | Frankfurt (AWS eu-central-1) | Embedded Sync | SQLite-kompatibler Ausweg, kein Muss |
| **Infomaniak** (CH) | Public Cloud ab CHF 16.10/Mt. (4 vCPU/8 GB); **Managed Postgres «bald», nicht kaufbar** | Schweiz | selbst betreiben | Swiss-only-Pfad, ab Tag 1 nicht gratis |
| **Exoscale** (CH, Zürich) | Managed PostgreSQL Hobbyist-2: CHF 48.12/30 Tage (2 GB RAM, kein Replikat) | Zürich (CH-DK-2) | selbst betreiben | Swiss-only-Pfad, teuer für Start |

**Sync-Engines (lokal-first):**

| Engine | Eigenschaften (Quelle: Herstellerseiten) | Urteil |
|---|---|---|
| Eigener Op-Log auf Workers/DO | volle Kontrolle, passt zu E2EE und kleinem Datenmodell | **V1-Favorit**, Aufwand ca. 1–2 Wochen (Schätzung) |
| Evolu | SQLite, lokal-first, **Ende-zu-Ende-verschlüsselt**, Self-Host-Relay, MIT | **im Spike prüfen** (Capacitor-Tauglichkeit noch offen) |
| PowerSync | Free: 50 gleichzeitige Clients, 2 GB Sync/Mt., **Deaktivierung nach 1 Woche**; Pro ab 49 USD; braucht Postgres/MongoDB; Capacitor-SDK vorhanden | erst im Postgres-Pfad (Stufe 3) |

---

## 6. Free-V1-Stack (konkret)

| Baustein | Wahl | Gratis-Grenze / Hinweis |
|---|---|---|
| App | Capacitor + React/TS/Vite | Store-Konten kosten (Abschnitt 1) |
| Inhalte | `rezepte-vN.json`, `lebensmittel-vN.sqlite`, Bilder in Static Assets | Requests gratis/unbegrenzt; max. 25 MiB pro Datei |
| API | Worker (Hono) auf workers.dev | 100'000 Req/Tag, **10 ms CPU/Request** (Krypto läuft auf dem Gerät → passt) |
| Konto-/Sync-Daten | Durable Object (SQLite) pro Konto/Haushalt, Jurisdiction `eu` | 100k Req/Tag, 5 GB total, 100k Writes/Tag |
| Index | D1 mit `--jurisdiction=eu` (nur Konto-ID, Pairing-Code) | **500 MB pro DB**, Jurisdiction nur bei Erstellung setzbar |
| Auth V1 | anonymes Konto: Geräteschlüssel + Recovery-Phrase, später Passkeys/E-Mail | kein E-Mail-Versand nötig (spart Dienst und Personendaten); Entscheid offen |
| Backups | D1 Time Travel 7 Tage (Free); DO: eigener Export | Geräte-Export (JSON/CSV) als Hauptsicherung |
| Logging | Workers Logs (200k Events/Tag, 3 Tage) | keine Personendaten loggen |
| Cron (später Aktionen) | Cron Triggers | 5 pro Account (Free) |

**Wo der Gratis-Tarif bricht (Modell, Abschnitt 7):** ca. **5'000 registrierte Nutzer** (Writes/Req-Spitzen, DO-Speicher nahe 5 GB). Bei Überschreitung des Tageslimits liefert Cloudflare Fehler 1027 – die App bleibt offline nutzbar, nur Sync/Partner pausieren bis 00:00 UTC. Gegenmassnahmen: Sync bündeln (Batch), Statisches nie über den Worker, Alarm bei 50 % Limit.

Nutzungsgrenzen der Datenquellen: Schweizer Nährwertdatenbank V7.1 (1246 Lebensmittel) darf **kostenlos mit Quellenangabe kommerziell** in Ernährungs-Apps genutzt werden; BLS 4.0 steht unter CC BY 4.0 (Quellenangabe, Änderungen kennzeichnen); USDA FoodData Central ist CC0. Berechnete Rezept-Nährwerte brauchen ein Feld `quelle` je Zutat und eine Quellenseite in der App.

---

## 7. Skalierungspfad und Kosten

**Annahmen (Modell, nicht gemessen):** 30 % täglich aktiv; 15 Sync-Requests pro aktivem Nutzer/Tag; 5 ms CPU/Request; 10 geschriebene Zeilen pro aktivem Nutzer/Tag; 0.5 MB verschlüsselte Server-Daten pro Konto; Kurs grob 1 USD ≈ 0.8 CHF (Annahme). Preise: [Workers/DO/D1](https://developers.cloudflare.com/workers/platform/pricing/).

| Registrierte Nutzer | aktiv/Tag | Requests/Tag | Server-Daten | Cloudflare-Kosten (Modell) | Tarif |
|---|---|---|---|---|---|
| **1'000** | 300 | 4'500 | 0.5 GB | **0 USD** | Free |
| **10'000** | 3'000 | 45'000 | ca. 5 GB | **ca. 5 USD** (≈ CHF 4) | Paid empfohlen (Free am Limit: DO 5 GB, Spitzen) |
| **100'000** | 30'000 | 450'000 | ca. 49 GB | **ca. 17 USD, realistisch 20–50 USD** (≈ CHF 16–40) | Paid |
| 1'000'000 (zur Orientierung) | 300'000 | 4.5 M | ca. 490 GB | ca. 210 USD (Modell) | Paid, dann Architektur-Review |

Zusätzlich (nicht in der Tabelle): Domain, E-Mail-Versand falls E-Mail-Login, Apple 99 USD/Jahr, Store-Provisionen später (Apple Small Business Program 15 % bis 1 Mio. USD Umsatz; Google 15 % auf die ersten 1 Mio. USD, Abos meist 15 %), Datenschutz-Check durch Jurist/in (einmalig, Betrag offen).

**Vergleich Alternativen bei gleicher Last** (Listenpreise, grobe Schätzung für die Last):

| Pfad | 1k | 10k | 100k |
|---|---|---|---|
| Supabase Pro, Zürich (25 USD inkl. Micro; Small 15, Medium 60 USD; 100k MAU inkl.; Disk 8 GB inkl., dann 0.125 USD/GB; Realtime 500 Verbindungen inkl., dann 10 USD/1000) | 25 USD | 25–40 USD | ca. 90–150 USD |
| Neon Launch (nutzungsbasiert; Richtwerte der Preisseite: 15 USD klein, 22 USD always-on, 80 USD mittlere Last) + Hosting der API | ca. 15–22 USD | ca. 22–80 USD | ab ca. 80 USD, plus API-Hosting |
| PocketBase auf Hetzner CX23 (Einzelserver) | 6 € | 6 € | grösserer Server/Umbau nötig, kein HA |
| Infomaniak Public Cloud (selbst betrieben, ab CHF 16.10) | CHF 16 | CHF 16–30 | CHF 30–100 (Schätzung) |
| Exoscale Managed Postgres (Zürich) | CHF 48+ | CHF 48+ | CHF 100+ (Schätzung) |

**Auslöser für Stufenwechsel:**

| Stufe | Auslöser | Aktion | Aufwand (Schätzung) |
|---|---|---|---|
| 1 → 2 | >50 % des Tageslimits (50k Req/Tag) oder DO-Speicher >3 GB | Workers Paid 5 USD/Mt. | 1 Stunde |
| 2 → 3 | relationale Auswertungen nötig, Analytics, oder D1/DO-Modell wird zu eng, oder Kunde/Behörde verlangt Schweizer Hosting | Postgres-Pfad: Supabase Zürich (+ PowerSync) oder Neon via Hyperdrive; Sync-Protokoll bleibt, Server-Adapter wird ersetzt | 2–4 Wochen |
| 2 → 3b | Swiss-only-Pflicht | Infomaniak/Exoscale-VM mit Node + SQLite/Postgres, Cloudflare nur noch als statisches CDN oder gar nicht | 2–4 Wochen |
| Sonderfall | Foto-KI (Bezahlstufe) | Proxy-Worker zu KI-Anbieter; separater Einwilligungstext, DPA, Kosten pro Aufruf durch Abo gedeckt | pro Anbieter |

Skalierungsgrenzen Cloudflare: D1 max. 10 GB pro DB (nicht erhöhbar) und single-threaded → Sharding pro Nutzer/Haushalt (genau das macht das DO-Modell). Workers Paid: unbegrenzte Requests, 5 min CPU.

---

## 8. Recht (Schweiz, EU) – keine Rechtsberatung

**Einordnung.** Daten über die Gesundheit sind besonders schützenswert ([DSG Art. 5 lit. c Ziff. 2](https://www.fedlex.admin.ch/eli/cc/2022/491/de)). Gewicht, BMI, Körperfett, Schlaf, Schritte und Ernährungsprotokolle sind realistisch als Gesundheitsdaten zu behandeln (juristische Einschätzung nötig).

**Gilt das Gesetz, wenn alles lokal bleibt?** Die Ausnahme in Art. 2 Abs. 2 lit. a DSG gilt für natürliche Personen im persönlichen Gebrauch, nicht für dich als Anbieter. Reine Gerätespeicherung ohne Zugriff durch dich spricht dafür, dass du für diese Daten nicht «bearbeitest» (Art. 5 lit. d), aber Server-Backup, Partnerfunktion, Support und Analytics ändern das. Das Thema deshalb früh juristisch bestätigen lassen.

| Thema | Regel | Konsequenz für Edovita |
|---|---|---|
| **Einwilligung** | Für besonders schützenswerte Daten muss eine nötige Einwilligung **ausdrücklich**, freiwillig, informiert und für bestimmte Bearbeitungen erfolgen (DSG Art. 6 Abs. 6–7) | Getrennte, nicht vorangekreuzte Einwilligungen: (a) Cloud-Backup, (b) Partnerfreigabe, (c) später KI-Foto, (d) Health-Import |
| **Datenminimierung/Privacy by Default** | Art. 6 Abs. 2/4, Art. 7 | Local-first, Backup standardmässig **aus**, Löschung nach Kontoauflösung |
| **Datensicherheit** | Art. 8; Busse bis CHF 250'000 bei Verstoss gegen Mindestanforderungen (Art. 61 lit. c) | Verschlüsselung (Transport + Ende-zu-Ende), Zugriffskonzept |
| **Auftragsbearbeitung / AVV** | Art. 9: vertraglich absichern; Cloud-Anbieter sind i. d. R. Auftragsbearbeiter; Unterbeauftragung nur mit Genehmigung ([EDÖB Outsourcing](https://www.edoeb.admin.ch/de/outsourcing-auftragsdatenbearbeitung), [EDÖB Cloud](https://www.edoeb.admin.ch/de/datenbearbeitungen-in-der-cloud)) | Cloudflare-DPA (v6.4, 3.4.2026, mit Schweizer Anpassungen der EU-SCC) akzeptieren und ablegen; bei Supabase DPA (Version 1.8.2026) |
| **Bekanntgabe ins Ausland** | Art. 16: nur bei angemessenem Schutz (Bundesrat-Liste, Anhang 1 DSV), sonst Garantien (z. B. Standardklauseln); Ausnahmen Art. 17 (u. a. ausdrückliche Einwilligung). Verstoss: Busse bis CHF 250'000 (Art. 61 lit. a) | **EU/EWR steht auf der Liste.** USA nur für **DPF-zertifizierte** Organisationen (seit 15.9.2024). Cloudflare ist Swiss-U.S.-DPF-zertifiziert (aktiv, nächste Frist 15.9.2027). Supabase ist laut Drittquelle nicht DPF-zertifiziert → Standardklauseln |
| **Informationspflicht** | Art. 19, inkl. Zielstaat der Bekanntgabe | Datenschutzerklärung nennt Cloudflare, Ort (EU-Jurisdiction, Anbieter US) und Garantien |
| **DSFA** | Art. 22: bei umfangreicher Bearbeitung besonders schützenswerter Daten | schlanke Datenschutz-Folgenabschätzung vor Skalierung |
| **Betroffenenrechte** | Auskunft (Art. 25, 30 Tage), Datenherausgabe/-übertragung (Art. 28) | Export-Funktion JSON/CSV in der App |
| **Datenpannen** | Meldung an EDÖB so rasch als möglich (Art. 24) | Incident-Prozess (1 Seite) |
| **Verzeichnis** | Art. 12 (Ausnahme nur bei geringem Risiko, bei Gesundheitsdaten unsicher) | Verzeichnis führen (1 Tabelle) |

**Ist Speicherung in den USA erlaubt?** Rechtlich möglich, wenn der Empfänger Swiss-U.S.-DPF-zertifiziert ist (Art. 16 Abs. 1, [Bundesrat/BJ](https://www.bj.admin.ch/de/nsb?id=102054)), Verträge stehen und informiert/eingewilligt wird. Aus meiner Sicht trotzdem **nicht die beste Wahl** für Gesundheitsdaten:
- DPF-Zertifizierung ist jährlich zu erneuern und kann jederzeit entfallen; die kantonale Datenschutzstelle ZH empfiehlt, die Zertifizierung zu prüfen und Ausstiegsszenarien zu planen ([privatim](https://www.privatim.ch/wp-content/uploads/2025/07/privatim_Publikation-Swiss-US-Data-Privacy-Framework_DE.pdf)).
- Auf EU-Seite ist die Berufung gegen das Urteil, das das DPF bestätigt hat, beim EuGH hängig (C-703/25 P, kein Termin bekannt; [EUR-Lex](https://eur-lex.europa.eu/eli/C/2025/6610/oj/eng)). Fällt das DPF, brauchen US-Übermittlungen Standardklauseln plus Risikoprüfung.
- Der EDÖB rät bei Patientendaten von Auslands-Clouds ab (Berufsgeheimnis-Kontext, [EDÖB](https://www.edoeb.admin.ch/de/bekanntgabe-von-patientendaten)). Edovita ist keine Arztpraxis, die Warnung zeigt aber die Haltung der Behörde.
- Auch mit Jurisdiction `eu` ist Cloudflare ein US-Unternehmen; Jurisdiction steuert nur, wo DO/D1/R2 laufen und speichern, Zugriff aus aller Welt bleibt möglich, und IDs werden für Abrechnung ausserhalb geloggt. Zudem gibt es nur «eu», nicht «ch».
→ **Praxis:** Daten in EU-Jurisdiction + **Ende-zu-Ende-Verschlüsselung** (Schlüssel nie beim Anbieter) + DPA + ausdrückliche Einwilligung. Das entschärft das US-Zugriffsrisiko technisch statt nur vertraglich.

**EU/DSGVO.** Sobald du DE/AT-Nutzer gezielt ansprichst (deutsche App, EU-Stores), gilt die DSGVO ([Art. 3 Abs. 2](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data_en)). Gesundheitsdaten = Art. 9, ausdrückliche Einwilligung (Art. 9 Abs. 2 lit. a). Die Schweiz hat einen EU-Angemessenheitsbeschluss (Januar 2024 bestätigt, [EDÖB](https://www.edoeb.admin.ch/en/15012024-eu-adequacy-decision-regarding-switzerland)), EU→CH-Übermittlungen sind also frei. **Offen:** EU-Vertreter nach Art. 27 DSGVO; die Ausnahme greift nur bei gelegentlicher Bearbeitung ohne umfangreiche Verarbeitung besonderer Kategorien ([Art. 27](https://gdpr-info.eu/art-27-gdpr/)) – bei einer Gesundheits-App voraussichtlich nicht erfüllt, sobald es relevante EU-Nutzerzahlen gibt. Zudem DSFA-Pflicht bei umfangreicher Verarbeitung nach Art. 35.

**Persönliche Haftung:** Die Bussen nach DSG Art. 60–61 treffen **private Personen**, also dich persönlich, nicht eine allfällige Firma. Das spricht für saubere Dokumentation von Anfang an.

---

## 9. Store-Regeln (Apple/Google)

| Thema | Apple | Google Play |
|---|---|---|
| Datenschutzerklärung | in App und in App Store Connect verlinken | öffentlich, nicht geofenced, nicht editierbar; muss Gesundheitsdaten-Erhebung, -Nutzung, -Weitergabe, -Aufbewahrung, -Löschung, -Sicherheit beschreiben ([Health Content](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en)) |
| Kontolöschung | Pflicht in der App, wenn Konten erstellbar; Deaktivieren genügt nicht ([5.1.1(v)](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion/)) | In-App-Pfad **und** Web-Löschseite; zugehörige Daten inkl. Health-Connect-Daten löschen ([Play-Anforderungen](https://support.google.com/googleplay/android-developer/answer/13327111)) |
| Health-Daten | HealthKit-Daten **nicht** für Werbung/Marketing/Data-Mining; keine Gesundheitsdaten in **iCloud**; keine falschen Werte in HealthKit schreiben; erhobene Daten offenlegen ([5.1.3](https://developer.apple.com/app-store/review/guidelines/)) | nur nötige Health-Connect-Datentypen, Begründung je Berechtigung, Health-Apps-Deklaration + Data-Safety-Formular ([Health Permissions](https://support.google.com/googleplay/android-developer/answer/12991134)) |
| Datenweitergabe an Dritte/KI | muss klar offengelegt und ausdrücklich bewilligt sein (5.1.1(i)) | Data-Safety-Angaben müssen stimmen |
| Konsequenz | **kein CloudKit/iCloud-Sync**, Sync über eigenes Backend | Schritte/Schlaf nur lesen und lokal halten |

Plugin-Risiko: `@capgo/capacitor-health` deckt HealthKit und Health Connect inkl. Schritte/Schlaf ab ([Repo](https://github.com/Cap-go/capacitor-health)), Reife und Wartung sind im Spike mit echten Geräten zu prüfen; Fallback ist ein kleines eigenes natives Plugin (Swift/Kotlin).

---

## 10. Zeitplan (wann)

| Phase | Inhalt | Backend? |
|---|---|---|
| **0 – Spikes (ca. 1 Woche)** | (1) Sync/E2EE: eigener Op-Log vs. Evolu; (2) Health-Plugin auf echtem iPhone/Android; (3) Import-Pipeline BLS/Schweizer NDB/USDA → `lebensmittel.sqlite` mit Quellenfeld | nein |
| **1 – Lokale App (V1a)** | Logging, Charts, Ziele, Rezepte/Favoriten/Sterne, Einkaufsliste, Wochenreview, Essensfenster – alles lokal | **nein** (nur statische Assets) |
| **2 – Konto, Backup, Partner (V1b)** | Worker + DO + D1, QR-Pairing, Live-Einkaufsliste, Export/Löschung, Datenschutzerklärung, DSFA light | ja, gratis |
| **3 – Launch** | Store-Konten, Datenschutz-Check durch Jurist/in, Domain, Monitoring | – |
| **4 – Später** | Foto-KI (Bezahlstufe, In-App-Kauf), Aktionen/Scraping (Cron-Worker; AGB der Händlerseiten prüfen), Kundenkarten-Flags | je Feature neu entscheiden |

---

## 11. Risiken

| Risiko | Wirkung | Gegenmassnahme |
|---|---|---|
| Sync/E2EE selbst bauen ist anspruchsvoller als gedacht (Konflikte, Schlüsselverlust) | Verzögerung, Datenverlust | Spike, kleines Datenmodell (LWW pro Feld), Recovery-Phrase + Export |
| Gratis-Tageslimit (100k Req) wird erreicht | Sync/Partner pausieren | Local-first, Batching, Alarm, 5-USD-Upgrade |
| D1/DO-Lock-in | teure Migration | Hono + SQLite-Schema, Adapter-Schicht, Export |
| DPF fällt (EuGH) / Behördenhaltung ändert sich | US-Anbieter angreifbar | EU-Jurisdiction + E2EE, Standardklauseln, Exit-Plan zu Hetzner/Infomaniak |
| Gesundheitsdaten-Pflichten unterschätzt | Bussen (persönlich), Store-Ablehnung | DSFA, Einwilligungen, DPA, Juristencheck vor Launch |
| EU-Nutzer ohne EU-Vertreter | DSGVO-Verstoss | früh klären (Art. 27) |
| Apple/Google-Review (Health) | Ablehnung | Privacy-Texte, Berechtigungsbegründung, Löschfunktion von Anfang an |
| Health-Plugin unreif | Feature fehlt | Spike, eigenes Plugin als Fallback |
| Abgrenzung Wellness/Medizinprodukt (Abnehm-Empfehlungen) | Regulatorik | nicht recherchiert; Schutzmechanismen des Prototyps beibehalten, Disclaimer, später prüfen lassen |
| workers.dev als Produktiv-Domain | Vertrauens-/Betriebsrisiko | eigene Domain vor Launch |
| Quellenpflichten Nährwertdaten | Lizenzverstoss | Attribution (BLS, Schweizer NDB), Quellenfeld pro Zutat |

---

## 12. Offene Entscheide für Projektinhaber

1. **Datenort:** EU-Jurisdiction (Cloudflare, gratis) akzeptieren, oder **nur Schweiz** (Supabase Zürich ab 25 USD/Mt., Infomaniak ab CHF 16/Mt.) → bricht «0 CHF» ab Tag 1?
2. **Store-Gebühren:** Apple 99 USD/Jahr und Google 25 USD einmalig ok? Oder zuerst nur Web/PWA (ohne HealthKit/Health Connect)?
3. **Kontomodell:** anonymes Konto mit Recovery-Phrase (maximal datensparsam, aber Schlüsselverlust-Risiko) oder E-Mail-Login (komfortabler, braucht Mail-Dienst und speichert Personendaten)?
4. **Cloud-Backup:** standardmässig aus (empfohlen) oder an?
5. **Partnermodus V1:** nur Einkaufsliste/Rezepte teilen (empfohlen), Gesundheitswerte erst später und mit Einzelfreigaben?
6. **Sync-Technik:** selber bauen oder Evolu/PowerSync (nach Spike)?
7. **EU-Markt:** DE/AT gezielt bedienen (dann DSGVO, ggf. EU-Vertreter) oder zuerst Schweiz?
8. **Juristischer Check** vor Launch (Budget, Einzelfirma vs. Gesellschaft wegen persönlicher Haftung).
9. **Domain:** wann kaufen (nicht gratis, Preis nicht verifiziert).
10. **Prototyp:** als Click-Dummy einfrieren und Vite-Projekt neu starten (Empfehlung)?

---

## 13. Quellen

**Cloudflare:** [Workers-Preise (Stand 2.10.2026)](https://developers.cloudflare.com/workers/platform/pricing/) · [Workers-Limits](https://developers.cloudflare.com/workers/platform/limits/) · [D1-Preise](https://developers.cloudflare.com/d1/platform/pricing/) · [D1-Limits](https://developers.cloudflare.com/d1/platform/limits/) · [D1 Datenort](https://developers.cloudflare.com/d1/configuration/data-location/) · [Durable Objects Datenort](https://developers.cloudflare.com/durable-objects/reference/data-location/) · [R2 Datenort](https://developers.cloudflare.com/r2/reference/data-location/) · [Pages → Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) · [Cloudflare DPA v6.4](https://www.cloudflare.com/cloudflare-customer-dpa/) · [Cloudflare im Swiss-U.S. DPF](https://www.dataprivacyframework.gov/participant/5666) · [Data Localization Suite](https://developers.cloudflare.com/data-localization/region-support/) · [GDPR-FAQ](https://www.cloudflare.com/trust-hub/gdpr/)
**Alternativen:** [Supabase Preise](https://supabase.com/pricing) · [Supabase Regionen](https://supabase.com/docs/guides/platform/regions) · [Supabase DPA](https://supabase.com/legal/customer-resources/data-processing-addendum) · [Firestore Quoten](https://firebase.google.com/docs/firestore/quotas) · [Firestore Standorte](https://firebase.google.com/docs/firestore/locations) · [Appwrite Preise](https://appwrite.io/pricing) · [Neon Preise](https://neon.com/pricing) · [Turso Preise](https://turso.tech/pricing) · [PowerSync Preise](https://www.powersync.com/pricing) · [Evolu](https://evolu.dev/docs) · [PocketBase Production](https://pocketbase.io/docs/going-to-production/) · [Hetzner Preise](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) · [Infomaniak Public Cloud](https://www.infomaniak.com/en/hosting/public-cloud/prices) · [Exoscale PostgreSQL](https://www.exoscale.com/dbaas/postgresql/) · [Vercel Hobby](https://vercel.com/docs/plans/hobby) · [Netlify](https://netlify.com/pricing) · [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
**Recht:** [DSG (SR 235.1)](https://www.fedlex.admin.ch/eli/cc/2022/491/de) · [BJ: Angemessenheit und Swiss-U.S. DPF](https://www.bj.admin.ch/de/schweizerische-anerkennung-von-staaten-die-einen-angemessenen-datenschutz-gewaehrleisten) · [BJ/EDÖB Medienmitteilung DPF](https://www.edoeb.admin.ch/de/nsb?id=102054) · [DPF-Liste](https://www.dataprivacyframework.gov/list) · [EDÖB Cloud](https://www.edoeb.admin.ch/de/datenbearbeitungen-in-der-cloud) · [EDÖB Outsourcing](https://www.edoeb.admin.ch/de/outsourcing-auftragsdatenbearbeitung) · [EDÖB Patientendaten](https://www.edoeb.admin.ch/de/bekanntgabe-von-patientendaten) · [EDÖB zu EU-Angemessenheit CH](https://www.edoeb.admin.ch/en/15012024-eu-adequacy-decision-regarding-switzerland) · [privatim zum DPF](https://www.privatim.ch/wp-content/uploads/2025/07/privatim_Publikation-Swiss-US-Data-Privacy-Framework_DE.pdf) · [EuGH C-703/25 P](https://eur-lex.europa.eu/eli/C/2025/6610/oj/eng) · [DSGVO Art. 27](https://gdpr-info.eu/art-27-gdpr/)
**Stores:** [Apple Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [Apple 5.1.1(v)](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion/) · [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/) · [Apple Developer Program](https://developer.apple.com/programs/enroll/) · [Apple Small Business Program](https://developer.apple.com/app-store/small-business-program/) · [Play Health Content](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en) · [Play Health Permissions](https://support.google.com/googleplay/android-developer/answer/12991134) · [Play Kontolöschung](https://support.google.com/googleplay/android-developer/answer/13327111) · [Play Console](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) · [Google Servicegebühren](https://support.google.com/paymentscenter/answer/112622?hl=en)
**Daten/Plugins:** [Schweizer Nährwertdatenbank](https://naehrwertdaten.ch/de/informationen/) · [BLS (MRI)](https://www.mri.bund.de/de/institute/ernaehrungsverhalten/forschungsbereiche/bundeslebensmittelschluessel-bls/) · [USDA FoodData Central](https://fdc.nal.usda.gov/) · [capacitor-health](https://github.com/Cap-go/capacitor-health)

**Nicht verifiziert / Annahmen:** CHF-Kurs (0.8), Nutzungsmodell in Abschnitt 7, Aufwandsschätzungen, Supabase-Kosten ab 10k, Appwrite-Free-Limits, Neon-Frankfurt, Preise für Domain/E-Mail-Dienst, Verfügbarkeit/Preis der Cloudflare Regional Services für den Free-Plan, Herkunft «workers.dev nur Hobby» (Community-Beitrag), Abgrenzung Medizinprodukt. Quellen mit «Drittquelle» (z. B. Supabase nicht DPF-zertifiziert) vor dem Launch auf dataprivacyframework.gov nachprüfen.
