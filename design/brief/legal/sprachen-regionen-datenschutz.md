# Edovita – Sprachen, Regionen und Gesundheitsdaten-Recht

Stand: 6.11.2026, Nachtrag Portugiesisch 15:25 (Europe/Zurich) · Entwurf für die Planung · **Das ist keine Rechtsberatung.** Alle Bewertungen sind Einschätzungen, die vor dem Launch eine Anwältin oder ein Anwalt bestätigen muss (Liste offener Punkte in §5).
Grundlage: `design/architektur-hosting.md` (§8), `design/brief/cloudflare.md`, `legal/datenschutz-phase1.md`.

**Annahmen:** Die Phase 1 ist local-first: Die Gesundheitsdaten liegen nur in SQLite auf dem Gerät, es gibt keinen Server-Zugriff, keine Analytics mit Gesundheitsbezug und kein Konto. Das optionale Backup ist standardmässig **aus**, Ende-zu-Ende verschlüsselt (Ciphertext) und liegt bei Cloudflare mit Jurisdiction `eu` (D1/DO/R2). Betreiber ist eine Privatperson, später eine Firma im Kanton Zürich.

---

## 1. Kurzfazit

| Sprache | Status | Ausgeschlossen / Auflage | Hauptgrund |
|---|---|---|---|
| Englisch | **drin** (gesetzt) | China-, Russland- und Sanktionsregionen über die Store-Länderauswahl sperren; USA mit Auflagen | Kernmarkt EU/CH/UK; USA: Gesetze der Bundesstaaten zu Konsumenten-Gesundheitsdaten |
| Spanisch | **drin** | – (Mexiko, Kolumbien, Argentinien, Chile mit Auflagen) | Spanien = DSGVO; Lateinamerika: Einwilligung für sensible Daten, Transfer möglich |
| Chinesisch (Mandarin) | **raus (vorerst)** | Festland-China; Taiwan/Singapur wären später einzeln prüfbar | PIPL: separate Einwilligung + Transfermechanismus; App-Filing/ICP; Gesundheitsdaten = sensibel/teils «wichtige Daten» |
| Hindi | **drin, mit Auflagen** | – | Indien DPDP: kein Lokalisierungszwang (nur Negativliste); Pflichten der Data Fiduciaries ab 13.5.2027 |
| Arabisch | **raus (vorerst)** | Ägypten, Saudi-Arabien; Syrien/Jemen/Sudan zusätzlich wegen Sanktionen | Ägypten: Lizenz + Genehmigung pro Zielland für sensible Daten/Transfer; Saudi PDPL: Transferregeln + Registrierung |
| Französisch | **drin** | Québec mit Auflage (PIA vor Transfer) | FR/BE/CH/LU = DSGVO/DSG; Kanada PIPEDA/Loi 25 machbar |
| Portugiesisch | **drin, mit Auflagen** (✅ v1, Basis pt-BR, Entscheid 6.11.2026) | – | Brasilien LGPD: spezifische, hervorgehobene Einwilligung; **⚠ aktualisiert:** Transfer BR→EU seit 27.1.2026 über ANPD-Angemessenheit (Res. 32/2026), keine SCC mehr nötig; Onward-Zugriff Cloudflare USA weiter prüfen (§8) |
| Deutsch | **drin** | – | Heimmarkt CH/DE/AT |
| Russisch | **raus** | Russland, Belarus (Kasachstan ebenfalls Lokalisierung) | 152-FZ Art. 18 Abs. 5: Erstspeicherung in Russland; Sanktionen/Zahlungsverkehr |
| Indonesisch | **⚠ GEÄNDERT → raus (vorerst)** | Indonesien | UU PDP Art. 56 erlaubt Transfer, aber **PSE-Registrierung ist Pflicht, bevor die App von Nutzern in Indonesien genutzt wird** (OSS-Konto, NIB, beglaubigte Übersetzungen; Komdigi droht mit Sperrung) – für Privatperson vorerst nicht machbar |
| Japanisch | **drin** | – | APPI: Einwilligung für «special care-required» Daten; EU–Japan gegenseitige Angemessenheit |
| Bengalisch | **drin, mit Auflagen** | Bangladesh: Backup erst nach Prüfung | Bangladesh PDPO 2025: kein Pauschal-Lokalisierungszwang; Spiegelpflicht nur für «restricted» Daten |
| Türkisch | **drin, mit Auflagen (⚠ verschärft)** | TR: nur local-first; Backup gesperrt | Ausländische Verantwortliche: VERBIS-Registrierung **über Vertreter in TR, ohne Schwellen-Ausnahme** (laut Kanzleiquellen); Standardvertrag unverändert, auf Türkisch unterschrieben, Meldung innert 5 Arbeitstagen. Ob VERBIS schon bei reinem local-first greift → Anwalt; bis dahin Store-Freigabe TR erst nach Klärung |
| Vietnamesisch | **raus (vorerst)** | Vietnam | PDPL 91/2025 (seit 1.1.2026): Transfer-Impact-Dossier an A05 innert 60 Tagen, auch für Offshore-Plattformen; Gesundheitsdaten sensibel |
| Koreanisch | **drin, mit Auflagen** | – | PIPA Art. 23: separate Einwilligung für sensible Daten; Auslandspeicherung zur Vertragserfüllung ohne Transfer-Einwilligung zulässig, wenn in der Privacy Policy offengelegt (Art. 28-8 Abs. 1 Nr. 3) (korrigiert) |
| Italienisch | **drin** | – | IT/CH/SM = DSGVO/DSG |

**Ergebnis (nach Verifikation 6.11.2026):** 11 von 16 Sprachen bleiben drin (EN, ES, HI, FR, PT, DE, JA, BN, TR, KO, IT). **Vorerst raus:** Chinesisch, Arabisch, Russisch, Vietnamesisch, **⚠ neu Indonesisch**.

**Sprache ≠ Land:** Die rechtliche Sperre läuft über die **Länderverfügbarkeit im App Store / bei Google Play** und nicht über die Sprache. Englisch bleibt zum Beispiel drin, aber China, Russland und die Sanktionsländer werden in den Store-Einstellungen ausgeschlossen.

---

## 2. Teil A – Gesundheitsdaten: Schweiz und EU

### 2.1 Schweiz (revDSG, in Kraft seit 1.9.2023)
- **Besonders schützenswert:** Daten über die Gesundheit (Art. 5 lit. c Ziff. 2 DSG). Gewicht/BMI, Ernährungsziele und Allergien gelten konservativ als Gesundheitsdaten. [DSG, fedlex](https://www.fedlex.admin.ch/eli/cc/2022/491/de)
- **Einwilligung**, wo nötig: ausdrücklich, freiwillig, informiert und für die bestimmte Bearbeitung (Art. 6 Abs. 6–7).
- **Privacy by Design/Default** (Art. 7), **Datensicherheit** (Art. 8 + DSV Art. 1–6).
- **DSFA** (Art. 22): bei voraussichtlich hohem Risiko, insbesondere bei umfangreicher Bearbeitung besonders schützenswerter Daten. Für das Cloud-Backup durchführen und dokumentieren.
- **Verzeichnis der Bearbeitungstätigkeiten** (Art. 12): Die Ausnahme für KMU unter 250 Mitarbeitenden gilt **nicht** bei umfangreicher Bearbeitung besonders schützenswerter Daten (DSV Art. 24). Deshalb trotzdem führen.
- **Auslandbekanntgabe** (Art. 16–17): EU/EWR ist auf der Liste in Anhang 1 DSV. USA nur via Swiss-U.S. DPF für zertifizierte Firmen (Cloudflare ist zertifiziert, siehe Architektur §8). [EDÖB Cloud](https://www.edoeb.admin.ch/de/datenbearbeitungen-in-der-cloud)
- **Meldung von Datensicherheitsverletzungen** an den EDÖB «so rasch als möglich» (Art. 24).
- **Strafen:** Bussen bis CHF 250'000 gegen **natürliche Personen**, z.B. für Verletzungen von Informations- oder Sorgfaltspflichten (Art. 60–61). Das Risiko liegt persönlich bei dir.

### 2.2 EU (DSGVO) – gilt über Art. 3 Abs. 2, sobald du Personen in der EU gezielt ansprichst (DE/AT/IT/FR-Stores)
- **Art. 9:** Die Verarbeitung von Gesundheitsdaten ist verboten, ausser mit **ausdrücklicher Einwilligung** (Art. 9 Abs. 2 lit. a). [DSGVO, EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- **Art. 27: EU-Vertreter** sind für Nicht-EU-Verantwortliche Pflicht. Die Ausnahme in Abs. 2 gilt nur für gelegentliche Verarbeitung, die **nicht** umfangreich Art.-9-Daten betrifft. Mit Backup deshalb sehr wahrscheinlich nötig; bei reinem local-first ohne Betreiberzugriff ist das offen (Anwalt).
- **Art. 35 DSFA:** Gesundheitsdaten + neue Technologie + App-Nutzer stehen auf den DSFA-Listen der Behörden. Für das Backup vorsehen.
- **Art. 25, 32:** Privacy by Default und Verschlüsselung. Das E2EE-Backup passt gut.
- **Art. 28:** Cloudflare DPA (Customer DPA mit SCC, Version vor Launch prüfen). [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/)
- **EU–US-Transfer:** Angemessenheitsbeschluss EU-U.S. Data Privacy Framework vom 10.7.2023. Cloudflare ist DPF-zertifiziert, und die DPA enthält zusätzlich SCC. [DPF-Liste](https://www.dataprivacyframework.gov/list) (EuG T-553/23 Latombe, Urteil 3.9.2025: Klage abgewiesen; **Rechtsmittel C-703/25 P eingereicht 31.10.2025, hängig** → DPF gilt; SCC in der Cloudflare-DPA als Rückfall.)
- **Cloudflare Data Localization Suite / Jurisdiction:** Die Jurisdiction `eu` für D1, Durable Objects und R2 legt fest, wo die Daten ruhen. Workers laufen global, und TLS kann ohne Regional Services ausserhalb der EU terminieren. Regional Services und Metadata Boundary gehören zur Data Localization Suite (Enterprise-Add-on). Mit E2EE sieht Cloudflare nur Ciphertext, deshalb ist die Suite für Phase 2 nicht zwingend. [DLS](https://developers.cloudflare.com/data-localization/) · [DO Jurisdiction](https://developers.cloudflare.com/durable-objects/reference/data-location/) · [R2 Jurisdiction](https://developers.cloudflare.com/r2/reference/data-location/)
- **Hinweis:** Laut EuGH (C-582/14 Breyer, C-413/23 P EDPS/SRB 2025) ist auch verschlüsselter oder pseudonymisierter Inhalt beim Verantwortlichen weiterhin ein Personendatum. E2EE senkt das Risiko, befreit aber nicht von der DSGVO.

### 2.3 Local-first vs. Cloud-Backup – was ist nötig?

| Pflicht | Phase 1 local-first (kein Backup, keine Telemetrie) | Mit E2EE-Cloud-Backup (opt-in) |
|---|---|---|
| Datenschutzerklärung (Store-Pflicht) | ja | ja, erweitert (Cloudflare, EU, USA/DPF) |
| Ausdrückliche Einwilligung Gesundheitsdaten | eher nicht nötig, wenn der Betreiber nichts erhält (offen, Anwalt) – zur Sicherheit Onboarding-Hinweis | **ja**, separat, nicht vorangekreuzt, widerrufbar |
| DSFA | empfohlen (kurz) | **ja** |
| Verzeichnis der Bearbeitungstätigkeiten | empfohlen | ja |
| AVV/DPA mit Cloudflare | für Website/Logs ja | ja |
| EU-Vertreter (Art. 27) | offen | wahrscheinlich ja |
| Lokale Verschlüsselung + App-Sperre | empfohlen (Art. 8 DSG / Art. 32) | ja |
| Lösch-/Exportfunktion | lokal | lokal + Server-Löschung |
| Ausländische Transfer-Regeln (§3) | kaum betroffen (kein Transfer) | **betroffen** → Backup pro Land freischalten |

Konsequenz: **Backup-Schalter länderabhängig**. Wo §3 «Backup erst nach X» sagt, bleibt der Schalter dort deaktiviert.

### 2.4 Medizinprodukt? (MDR / MepV)
- Software ist ein Medizinprodukt, wenn der Hersteller ihr eine **medizinische Zweckbestimmung** gibt (Diagnose, Verhütung, Überwachung, Behandlung oder Linderung von Krankheiten), Art. 2 Nr. 1 MDR. Massgebend ist die Zweckbestimmung, wie sie in Store-Text, Werbung und UI kommuniziert wird. [MDR](https://eur-lex.europa.eu/eli/reg/2017/745/oj) · [MDCG 2019-11 Qualifizierung Software](https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_qualification_classification_software_en_0.pdf) · [Swissmedic Medizinprodukte-Software](https://www.swissmedic.ch/swissmedic/de/home/medizinprodukte/medizinprodukte-software.html) · [MepV](https://www.fedlex.admin.ch/eli/cc/2020/552/de)
- **Wellness/Lifestyle** (allgemeines Wohlbefinden, Kalorien zählen, Gewichtsziele bei Gesunden, Rezepte) ist nach MDCG 2019-11 in der Regel **kein** Medizinprodukt.
- **Die Grenze wird überschritten** durch Aussagen wie «Therapie von Adipositas/Diabetes», individuelle Insulin- oder Dosisempfehlungen, «Allergie-Diagnose/-Schutz» (z.B. «sicher für Allergiker»), Essstörungs-Behandlung oder Warnungen, die auf Krankheitswerten beruhen.
- Empfehlung: Wellness-Wording, Disclaimer (`disclaimer-gesundheit.md`), Allergien nur als **Nutzerfilter** ohne Sicherheitsversprechen, BMI-Grenzen und Mindest-kcal als Schutzmechanismus formulieren und nicht als medizinische Beratung. Das gilt analog für die USA (FDA General Wellness Guidance) und für andere Länder.

---

## 3. Teil B – Länderbewertung

Legende: **OK** · **OK+A** = OK mit Auflagen · **raus** = vorerst raus. «Phase 1» = local-first ohne Backup, «Backup» = E2EE-Backup in der EU.

| Sprache | Land/Region | Regel (Gesundheit / Transfer / Lokalisierung) | Phase 1 | Backup | Auflagen / Grund | Quelle |
|---|---|---|---|---|---|---|
| EN | UK | UK GDPR; Art. 9 analog; UK erkennt EU/EWR als angemessen an; UK-Vertreter (Art. 27 UK GDPR) | OK | OK+A | UK-Vertreter prüfen | [ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/) |
| EN | USA | HIPAA greift **nicht** (keine Covered Entity). Washington My Health My Data Act: separate Einwilligung für Erhebung **und** Weitergabe, eigene Consumer Health Data Privacy Policy, Verkaufsverbot ohne Autorisierung, privates Klagerecht; Link zur Policy auf der Homepage; Nevada SB 370 (seit 31.3.2024) ebenfalls getrennte Einwilligung für Erhebung und Weitergabe; Connecticut CTDPA: Einwilligung für Consumer Health Data **für alle Verantwortlichen ohne Schwellen** (SB 1295 erweitert ab 1.7.2026); FTC HBNR (2024): Breach-Meldung an Betroffene und, ab 500 Personen, an die FTC innert 60 Tagen | OK+A | OK+A | Consumer-Health-Privacy-Policy, Opt-in, kein Ad-Tracking/SDKs mit Gesundheitsbezug, FTC-HBNR-Breach-Prozess | [WA AG MHMDA](https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy) · [FTC HBNR 16 CFR 318](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-318) · [NRS 603A](https://www.leg.state.nv.us/nrS/NRS-603A.html) · [CT AG](https://portal.ct.gov/AG/Sections/Privacy-/The-Connecticut-Data-Privacy-Act) |
| EN | Kanada | PIPEDA (Transfer erlaubt, Transparenz); Québec Loi 25 (Art. 17 LPRPSP): EFVP vor Bekanntgabe ausserhalb Québecs + **schriftliche Vereinbarung** | OK | OK+A | PIA für Québec; Hinweis auf Auslandspeicherung | [OPC](https://www.priv.gc.ca/en/privacy-topics/airports-and-borders/gl_dab_090127/) · [LPRPSP Art. 17](https://www.legisquebec.gouv.qc.ca/fr/version/lc/P-39.1?code=se%3A17) |
| EN | Australien | Privacy Act 1988, APP 8 (Accountability bei Auslandtransfer), Gesundheit = sensitive information → Einwilligung | OK | OK+A | Einwilligung, APP-8-Hinweis | [OAIC](https://www.oaic.gov.au/privacy/australian-privacy-principles) |
| EN | Indien, Nigeria, Philippinen, Pakistan | siehe HI; Nigeria NDPA 2023, Philippinen DPA 2012: Transfer mit Einwilligung/Garantien möglich | OK | OK+A | Einwilligung | [NDPC](https://ndpc.gov.ng/) · [NPC PH](https://privacy.gov.ph/data-privacy-act/) |
| ES | Spanien | DSGVO | OK | OK | wie EU | EUR-Lex |
| ES | Mexiko | neues LFPDPPP (DOF 20.3.2025): sensible Daten nur mit **ausdrücklicher und schriftlicher** Einwilligung per Unterschrift, E-Signatur oder Authentifizierungsmechanismus (Art. 8); Weitergabe an einen Auftragsbearbeiter (encargado) ist keine «transferencia» (Art. 35) | OK | OK+A | Aviso de privacidad (ES); Einwilligung mit Authentifizierung (z.B. Konto-Login + Bestätigung) – Wortlaut Anwalt | [LFPDPPP (Diputados)](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf) |
| ES | Kolumbien, Argentinien, Chile, Peru | Kolumbien Ley 1581: Gesundheitsdaten sensibel, Transfer in die EU ok (SIC-Liste); Argentinien hat EU-Angemessenheit; Chile Ley 21.719 (ab 12/2026) | OK | OK+A | Einwilligung; Kolumbien RNBD nur über Schwellen | [SIC](https://www.sic.gov.co/) |
| ZH | China (Festland) | PIPL Art. 28–29 (sensible Daten, separate Einwilligung), Art. 38–39 (Transfer: Standardvertrag/Zertifizierung/Sicherheitsprüfung + separate Einwilligung); Art. 53 Vertreter in China; Netzwerkdaten-Verordnung 2025; App-Store-Vertrieb nur mit MIIT-App-Filing (ICP) einer chinesischen Einheit | **raus** | raus | ohne China-Entität kein App-Filing; Transfer-Formalitäten; politisch/rechtlich hohes Risiko | [PIPL (EN)](http://en.npc.gov.cn.cdurl.cn/2021-12/29/c_694559.htm) · [MIIT App-Filing 2023](https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2023/art_8ca4ec4d8bc54ba6a7ce9fb61e9b5b44.html) |
| ZH | Taiwan, Singapur, Malaysia | Taiwan PDPA (Gesundheit = Art. 6, Einwilligung); Singapur PDPA (Transfer-Obligation); keine Lokalisierung | (später) | (später) | Option für Phase 2 mit Traditional Chinese (TW) bzw. EN (SG) | [PDPC SG](https://www.pdpc.gov.sg/) |
| HI | Indien | DPDP Act 2023 + Rules 2025 (13.11.2025): Pflichten ab **13.5.2027**; Transfer überall hin erlaubt, ausser auf eine Negativliste (Sec. 16); kein Sondertyp «sensibel», aber Einwilligung (Notice) nötig; IT-Act SPDI-Rules bis dahin (Gesundheit = SPDI, schriftliche Einwilligung) | OK | OK+A | Consent-Notice (auch Hindi/EN), Breach-Meldung an DPB, Grievance-Kontakt | [Gazette 13.11.2025](https://egazette.gov.in/WriteReadData/2025/267647.pdf) · [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014) |
| AR | Ägypten | PDPL 151/2020 + Executive Regulations (Dekret 816/2025, 1.11.2025; 1 Jahr Übergang): **Lizenz/Permit** für sensible Daten, **Lizenz + Einwilligung pro Zielland** für Auslandtransfer, schriftliche Einwilligung | raus | raus | Lizenzverfahren für ein Ein-Personen-Projekt unverhältnismässig | [ER Translation](https://shehatalaw.com/wp-content/uploads/2026/01/Shehata-Partners-Publications-Data-Protection-Executive-Regulations-English.pdf) · [CMS](https://cms.law/en/int/legal-updates/egypt-s-pdpl-executive-regulations-issued-one-year-compliance-countdown-begins/) |
| AR | Saudi-Arabien | PDPL: Gesundheitsdaten sensibel; Transfer-Verordnung: SCC/BCR/Zertifikat + **Risikobewertung bei laufendem Transfer sensibler Daten** (Art. 4, 7); Registrierung im National Register **Pflicht bei sensiblen Daten**; für Auslands-Entitäten mit MOFA-Beglaubigung + Vertreter | raus | raus | Registrierung/Vertreter + Transfer-Assessment; zusammen mit Ägypten → Arabisch vorerst raus | [SDAIA Transfer-Verordnung](https://sdaia.gov.sa/Documents/RegulationonPersonalDataEN.pdf) · [Register-Regeln](https://sdaia.gov.sa/Documents/TheRulesGoverningTheNationalRegisterOfControllersWithinTheKingdomPublicEN.pdf) · [Registrierung Ausland](https://dgp.sdaia.gov.sa/wps/portal/pdp/Registration/external/) |
| AR | VAE | PDPL 45/2021 (Executive Regulations ausstehend); ICT-Health-Law 2/2019 (Lokalisierung, gilt aber primär für Gesundheitsdienstleister) | (später) | (später) | Kandidat für Phase 2 | [UAE](https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws) |
| AR | Syrien, Jemen, Sudan, Libyen | Sanktionsregime (CH/EU/US), Store-Verfügbarkeit eingeschränkt | raus | raus | Sanktionen | [SECO](https://www.seco.admin.ch/seco/de/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/sanktionen-embargos.html) |
| FR | Frankreich, Belgien, Luxemburg, CH | DSGVO/DSG; FR: HDS (Art. L1111-8 CSP) gilt nur für Gesundheitsdaten aus Prävention/Diagnose/Versorgung/medizinisch-sozialer Begleitung; ANS: eigenständige Wellness-App ohne Bezug zur Versorgung = ausserhalb (bestätigt) | OK | OK | erst relevant bei Ärzte-/Kassen-Anbindung | [ANS FAQ HDS](https://esante.gouv.fr/faq/quel-est-le-champ-dapplication-de-la-legislation-relative-lhebergement-de-donnees-de-sante-caractere-personnel) |
| FR | Kanada (QC) | siehe EN Kanada | OK | OK+A | PIA Loi 25 | CAI |
| FR | Westafrika (CI, SN, CM…) | eigene Gesetze, teils Genehmigung der Behörde für Transfer (z.B. Senegal CDP, Côte d'Ivoire ARTCI) | OK | OK+A/offen | Backup dort erst nach Prüfung | [CDP SN](https://www.cdp.sn/) |
| PT | Portugal | DSGVO | OK | OK | – | EUR-Lex |
| PT | Brasilien | LGPD Art. 11 I (sensible Daten: Einwilligung «de forma específica e destacada»), Art. 33 I + **ANPD-Res. 32/2026: EU/EWR angemessen** (seit 27.1.2026); ANPD-SCC (Res. 19/2024) nur noch für Onward-Transfers ausserhalb EU/EWR (z. B. Cloudflare USA) | OK | OK+A | Einwilligung (pt-BR), Encarregado mit Portugiesisch-Kenntnis (Res. 18/2024) bzw. Kontaktkanal, Incident-Meldung 3 Arbeitstage (Res. 15/2024); Details §8 | [ANPD Res. 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024) |
| PT | Angola, Mosambik | Angola Lei 22/11: Transfer genehmigungspflichtig | (Store-Ausschluss erwägen) | raus | Genehmigung APD | – |
| DE | CH, DE, AT, LI | DSG/DSGVO | OK | OK | §2 | – |
| RU | Russland | 152-FZ Art. 18 Abs. 5 i.d.F. 23-FZ (seit 1.7.2025): **Verbot**, Datenbanken ausserhalb Russlands für Erhebung/Speicherung von Daten russischer Bürger zu nutzen, auch für Auftragsbearbeiter; Gesundheit = Sonderkategorie (schriftliche Einwilligung); Meldung an Roskomnadzor; seit 2025 verschärfte Bussen; Sanktionen, Zahlungs- und Store-Einschränkungen | raus | raus | Lokalisierung unvereinbar mit EU-Hosting | [23-FZ vom 28.2.2025](http://www.kremlin.ru/acts/bank/51683/print) |
| RU | Belarus, Kasachstan | Belarus: Sanktionen; Kasachstan: Gesetz 94-V Art. 12 Lokalisierung in KZ | raus | raus | Lokalisierung/Sanktionen | – |
| ID | Indonesien | UU PDP 27/2022 (voll seit 17.10.2024): Gesundheit = spezifische Daten, Transfer gestuft: gleichwertiges Schutzniveau → sonst angemessene, verbindliche Garantien → sonst Einwilligung (Art. 56, bestätigt); GR 71/2019: private ESOs dürfen im Ausland speichern; **PSE-Registrierung Pflicht vor Nutzung durch Nutzer in ID** (Permenkominfo 5/2020; über OSS mit NIB) | **raus** | raus | ⚠ geändert: Registrierung (OSS, NIB, beglaubigte Übersetzung) vorerst nicht machbar | [UU PDP](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) · [PSE](https://pse.komdigi.go.id/) · [OSS-Anleitung PSE](https://oss.go.id/en/panduan/635970086345c7d71a8144be) · [Pasal 56](https://pasal.id/peraturan/uu/uu-no-27-tahun-2022/pasal-56) |
| JA | Japan | APPI: Gesundheit = «special care-required», vorgängige Einwilligung bei Erhebung (Art. 20 Abs. 2 geltende Fassung; vor 2022 Art. 17 Abs. 2); Auslandtransfer (Art. 28): ohne Einwilligung nur in von der PPC anerkannte Länder – **EU/EWR und UK anerkannt, Schweiz nicht** (irrelevant, solange die Daten in der EU liegen) | OK | OK+A | Einwilligung (JA) | [PPC Supplementary Rules EU/UK](https://www.ppc.go.jp/files/pdf/supplementary_rules_eu_uk.pdf) |
| BN | Bangladesh | PDPO 2025: Gesundheit = sensibel; Transfer mit Einwilligung erlaubt (Sec. 29 Abs. 3); kein Pauschal-Lokalisierungszwang; Echtzeit-Spiegelkopie in BD nur für Klasse «restricted» + CII; Meldung bei grossen Transfers von ID/Biometrie | OK | OK+A/offen | prüfen, ob Gesundheitsdaten in den Anhang «restricted» fallen; bis dahin Backup in BD aus | [PDPO 2025, Sec. 29](https://bdlaws.minlaw.gov.bd/act-1574/section-55534.html) · [FE](https://thefinancialexpress.com.bd/national/no-mandatory-data-localisation-in-final-pdpo) |
| BN | Indien (Westbengalen) | siehe HI | OK | OK+A | – | – |
| TR | Türkei | KVKK Art. 6, Art. 9 (seit 1.6.2024) + Transfer-Verordnung (RG 10.7.2024): Standardvertrag unverändert, Unterschriften auf dem türkischen Text, Nachweis der Zeichnungsberechtigung (ggf. Apostille), Meldung innert 5 Arbeitstagen (Modul/KEP); VERBIS: KVKK-Beschluss 2025/1572 befreit nur Kleinst-Verantwortliche (<10 MA, <10 Mio. TRY); für Verantwortliche im Ausland gilt laut Kanzleiquellen keine Schwellen-Ausnahme → Vertreter in TR | OK+A (offen) | OK+A | VERBIS + Vertreter, Standardvertrag mit Cloudflare praktisch schwierig (Cloudflare müsste türkischen Text unterzeichnen) | [KVKK Standardvertrag](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu) · [KVKK VERBIS 2025/1572](https://www.kvkk.gov.tr/Icerik/8388/KAMUOYU-DUYURUSU) |
| VI | Vietnam | PDPL 91/2025/QH15 (seit 1.1.2026): Gesundheit sensibel; Transfer-Impact-Dossier an A05 innert 60 Tagen, ausdrücklich auch für ausländische Plattformen mit in Vietnam erhobenen Daten; Processing-Impact-Dossier (Art. 21) | raus | raus | Dossierpflichten + Behörde mit Stopp-Befugnis; schon Telemetrie würde auslösen | [Law 91/2025 (EN)](https://thuvienphapluat.vn/van-ban/EN/Bo-may-hanh-chinh/Law-91-2025-QH15-Personal-Data-Protection/665440/tieng-anh.aspx) · [Linklaters](https://www.linklaters.com/insights/data-protected/data-protected---vietnam) |
| KO | Südkorea | PIPA Art. 23 (sensible Daten: separate Einwilligung); Art. 28-8 Abs. 1 Nr. 3: Speicherung im Ausland zur Vertragserfüllung zulässig, wenn Daten, Land, Zeitpunkt/Methode, Empfänger, Zweck/Dauer und Widerspruchsweg in der Privacy Policy stehen; Inlandsvertreter erst ab 1 Bio. KRW Umsatz oder 1 Mio. Nutzern | OK+A | OK+A | separate Einwilligung für Gesundheitsdaten; Privacy Policy (KO) mit Angaben nach Art. 28-8 Abs. 2 | [PIPA (EN), law.go.kr](https://www.law.go.kr/LSW/eng/engLsInfoR.do?lsiSeq=283839) |
| IT | Italien, CH-Tessin, San Marino | DSGVO/DSG | OK | OK | – | – |

**Sanktionen / Embargos (alle Sprachen):** Iran, Nordkorea, Syrien, Kuba, Krim/Donezk/Luhansk sowie Russland/Belarus (Sektor- und Zahlungsbeschränkungen) in den Stores ausschliessen. Massgebend sind die Schweizer Massnahmen (SECO, EmbG) und für Apple/Google die US-OFAC-Regeln. [SECO](https://www.seco.admin.ch/seco/de/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/sanktionen-embargos.html) · [OFAC](https://ofac.treasury.gov/sanctions-programs-and-country-information)

**Local-first-Effekt:** Ohne Backup, Konto und Telemetrie fliessen praktisch keine Gesundheitsdaten zu dir. Viele Transferregeln (TR, KO, ID, BR) betreffen dann vor allem die Store-/Website-Logs. Darum steht dort «Phase 1 OK». Bei CN, VN, EG und RU ist das Problem schon der Marktzugang bzw. Registrierung und Lizenz (App-Filing, PSE-ähnliche Pflichten, Lokalisierung) oder die Sanktionen, nicht erst das Backup. Deshalb bleiben sie raus.

---

## 4. Teil C – Abgedeckte Weltbevölkerung (Schätzung)

Sprecherzahlen (L1+L2) nach Ethnologue 2025 «What are the top 200 most spoken languages?» ([Ethnologue](https://www.ethnologue.com/insights/ethnologue200/)), gerundet:

| Sprache | Sprecher gesamt (Mio.) |
|---|---|
| Englisch | ~1'530 |
| Hindi | ~610 |
| Spanisch | ~560 |
| Französisch | ~310 |
| Bengalisch | ~285 |
| Portugiesisch | ~265 |
| Indonesisch | ~250 |
| Deutsch | ~135 |
| Japanisch | ~125 |
| Türkisch | ~90 |
| Koreanisch | ~80 |
| Italienisch | ~70 |
| **Summe (mit Doppelzählungen)** | **~4'300** |

Überschneidungen: Die grössten Doppelzählungen sind Englisch-L2 in Indien (~250 Mio., überlappt mit Hindi/Bengalisch), Hindi ↔ Bengalisch in Indien, Englisch-L2 in EU/Philippinen/Nigeria mit anderen gelisteten Sprachen sowie Französisch-L2 in Afrika. Nach grobem Abzug von **~700–900 Mio.** bleiben **~3.4–3.6 Mrd.** (42–45 %). **Nach Verifikation ohne Indonesisch (~250 Mio., geringe Überschneidung):** **~3.2–3.4 Mrd. Menschen, ca. 39–41 % der Weltbevölkerung** (8.2 Mrd., [UN WPP 2024](https://population.un.org/wpp/)).
Durch die Länderausschlüsse (z.B. Englischsprechende in China/Russland, Franko-Westafrika ohne Backup) sinkt die effektiv adressierbare Zahl um wenige Prozentpunkte. → **Schätzung (aktualisiert): rund 37–40 %**, nicht gemessen.
Zum Vergleich: Die ausgeschlossenen Sprachen ZH (~1'180 Mio.), AR (~335 Mio.), RU (~255 Mio.) und VI (~85 Mio.) entsprechen zusammen ca. 22 % der Weltbevölkerung.

---

## 5. Offene Punkte für die Anwältin / den Anwalt
1. Bearbeitest du bei reinem local-first überhaupt Gesundheitsdaten (DSG Art. 5 lit. d / DSGVO «Verantwortlicher»)? Folgen für Einwilligung, EU-Vertreter (Art. 27) und VVT.
2. Ist ein E2EE-Ciphertext-Backup bei Cloudflare für dich und für Cloudflare «Personendaten»? Reichen DPF + SCC, oder braucht es die Data Localization Suite (Regional Services/Metadata Boundary)?
3. Einwilligungstexte (DE/EN + Sprachen), Granularität (Backup, Partnermodus, Health-Import), Widerruf.
4. MDR/MepV-Abgrenzung: Store-Texte und Features (Allergie-Filter, BMI-Grenzen, Essensfenster) als Wellness bestätigen lassen.
5. Frankreich HDS: laut ANS für eigenständige Wellness nicht anwendbar (§7); nur bei späterer Anbindung an die Versorgung erneut prüfen.
6. USA: Umfang WA MHMDA/Nevada/Connecticut; FTC HBNR; ob eine eigene Consumer Health Data Privacy Policy reicht.
7. Türkei: VERBIS + Vertreter schon ohne Backup nötig? Standardvertrag mit Cloudflare.
8. Indonesien: Gibt es eine PSE-Ausnahme für eine reine Offline-App? Sonst bleibt Indonesisch raus.
9. Bangladesh: Fallen Gesundheitsdaten im Anhang zu Sec. 29 unter «restricted»?
10. Brasilien: Gilt ein Schweizer Einzelunternehmen als «agente de tratamento de pequeno porte» (Res. 2/2022 Art. 2)? Ist die Gesundheits-App «alto risco» (Art. 4: sensible Daten + ggf. erhebliche Beeinträchtigung) → dann Encarregado Pflicht. Reicht ANPD-Res. 32/2026 für das EU-Backup, oder braucht der Fernzugriff durch Cloudflare-Stellen ausserhalb EU/EWR zusätzlich ANPD-SCC? Ist E2EE-Ciphertext für den Betreiber «dado pessoal»? (§8)
11. Korea/Japan: Wortlaut der Einwilligungen; Korea Inlandsvertreter-Schwellen.
12. Spätere Öffnung: Taiwan, Singapur, VAE (Phase 2) und eventuell Saudi-Arabien.
13. Haftung als Privatperson (DSG-Bussen persönlich) → Zeitpunkt der Firmengründung (GmbH) vor dem Backup-Launch.

## 6. Hinweise zur Prüfung
- Online direkt geprüft (6.11.2026): Indien DPDP Rules (Gazette 13.11.2025, Fristen), Vietnam PDPL 91/2025 (Art. 20, in Kraft 1.1.2026), Bangladesh PDPO 2025 Sec. 29 (inkl. Änderung Abs. 7 lit. b), Ägypten Executive Regulations (Dekret 816/2025, Art. 14, 16).
- Aus dem Fachwissen, **vor dem Launch an der Primärquelle zu verifizieren**: Saudi-Registrierungspflicht, KVKK-Details, Mexiko-LFPDPPP-Link, ANPD-Link, Chile-Inkrafttreten, Kasachstan, Angola, Status DPF-Rechtsmittel, MIIT-Link.

## 7. Verifikation (6.11.2026, Europe/Zurich)

Geprüft an Gesetzestexten oder offiziellen Behördenseiten; wo nur Kanzleiquellen verfügbar waren, ist das vermerkt. Abrufdatum aller Links: 6.11.2026.

| Punkt | Ergebnis | Quelle |
|---|---|---|
| China PIPL Art. 29, 38, 39 | **bestätigt**: separate Einwilligung (sensibel und Transfer) + Mechanismus; Ausnahmen der CAC-Bestimmungen 2024 heben die Art.-39-Einwilligung nicht auf | [PIPL, CAC](https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm) · [CAC 2024 Bestimmungen](https://www.gov.cn/zhengce/202501/content_6997438.htm) |
| China App-Filing | **bestätigt** (MIIT-Mitteilung 8/2023); Apple verlangt Filing-Nummer für neue China-Apps (Presse) | [MIIT, gov.cn](https://www.gov.cn/zhengce/zhengceku/202308/content_6897341.htm) |
| Russland 152-FZ | **präzisiert**: seit 1.7.2025 ausdrückliches Verbot ausländischer DB (23-FZ) | [23-FZ](http://www.kremlin.ru/acts/bank/51683/print) |
| Saudi PDPL + Transfer + Register | **bestätigt**: Registrierung bei sensiblen Daten; Risikobewertung bei laufendem Transfer sensibler Daten | SDAIA (Links §3) |
| Türkei KVKK Art. 9 / Verordnung 10.7.2024 | **bestätigt**: 5 Arbeitstage; **ergänzt**: türkischer Text, Unterschriftsnachweise, Apostille | [KVKK](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu) |
| Türkei VERBIS | **korrigiert/verschärft**: Beschluss 2025/1572 (in Kraft 1.10.2025) befreit Kleinst-Verantwortliche mit Sonderdaten; für Ausland-Verantwortliche keine Schwellen (nur Kanzleiquelle, Anwalt) | [KVKK 2025/1572](https://www.kvkk.gov.tr/Icerik/8388/KAMUOYU-DUYURUSU) |
| Indonesien UU PDP Art. 56 / GR 71 / PSE | Art. 56 **bestätigt**; PSE-Pflicht **bestätigt und schwerer als angenommen** → ⚠ **Indonesisch raus** | [Pasal 56](https://pasal.id/peraturan/uu/uu-no-27-tahun-2022/pasal-56) · [Permenkominfo 5/2020](https://jdih.komdigi.go.id/produk_hukum/view/id/759/t/common) · [Komdigi-Warnung](https://portal.komdigi.go.id/kanal-publik/berita-kini/9819) |
| Korea PIPA | **korrigiert**: Transfer-Einwilligung nicht zwingend (Art. 28-8 Abs. 1 Nr. 3); Vertreter-Schwellen bestätigt | [law.go.kr](https://www.law.go.kr/LSW/eng/engLsInfoR.do?lsiSeq=283839) |
| Japan APPI + EU-Angemessenheit | **bestätigt**: EU/UK anerkannt; Hinweis: Schweiz nicht anerkannt | [PPC](https://www.ppc.go.jp/files/pdf/supplementary_rules_eu_uk.pdf) |
| Brasilien LGPD + ANPD-SCC | **bestätigt**; Frist 23.8.2025 abgelaufen, Klauseln wortgleich | [ANPD Res. 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024) |
| Brasilien ANPD-Angemessenheit EU (neu, 6.11.2026) | **⚠ korrigiert**: ANPD-Res. 32/2026 (DOU 27.1.2026) anerkennt EU + EWR als angemessen (Art. 33 I); EU-Gegenstück Durchführungsbeschluss (EU) 2026/179. Für BR→EU sind keine ANPD-SCC mehr nötig. Doppelt geprüft: DOU-Originaltext + ANPD-Regulierungsliste («Vigente») + EU-Kommission | [DOU Res. 32/2026](https://www.in.gov.br/web/dou/-/resolucao-n-32-de-26-de-janeiro-de-2026-683334547) · [ANPD Regulamentações](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd) · [EU-Kommission IP/26/229](https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_26_229/IP_26_229_EN.pdf) |
| Mexiko LFPDPPP 2025 | **korrigiert/verschärft**: schriftliche Einwilligung mit Signatur/Authentifizierung (Art. 8) | [Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf) |
| USA WA MHMDA | **bestätigt** (+ Homepage-Link-Pflicht) | [RCW 19.373.020](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.020) · [RCW 19.373.030](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.030) |
| USA Nevada SB 370 | **bestätigt** (seit 31.3.2024) | [NRS 603A](https://www.leg.state.nv.us/nrS/NRS-603A.html) |
| USA Connecticut | **ergänzt**: gilt für alle Verantwortlichen; SB 1295 ab 1.7.2026 | [CT AG](https://portal.ct.gov/AG/Sections/Privacy-/The-Connecticut-Data-Privacy-Act) · [PA 25-113](https://www.cga.ct.gov/2025/ACT/PA/PDF/2025PA-00113-R00SB-01295-PA.PDF) |
| FTC HBNR | **bestätigt**: 60 Tage; FTC sofort ab 500 Personen, sonst jährlich | [16 CFR 318.4](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-318/section-318.4) |
| Québec Loi 25 | **bestätigt** + schriftliche Vereinbarung | [LPRPSP Art. 17](https://www.legisquebec.gouv.qc.ca/fr/version/lc/P-39.1?code=se%3A17) |
| Frankreich HDS | **bestätigt**: Wellness ausserhalb (offener Punkt 5 weitgehend erledigt) | [ANS FAQ](https://esante.gouv.fr/faq/quel-est-le-champ-dapplication-de-la-legislation-relative-lhebergement-de-donnees-de-sante-caractere-personnel) · [L1111-8](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033862549) |
| CH revDSG Art. 5, 6, 12, 22, 60–61; DSV Art. 24 | **nicht neu abgerufen** (Fedlex lädt nur per JavaScript); Inhalt entspricht dem bekannten Wortlaut, vor Launch im Browser gegenlesen: Bussen Art. 60/61 bis CHF 250'000 gegen natürliche Personen, nur bei Vorsatz | [DSG](https://www.fedlex.admin.ch/eli/cc/2022/491/de) · [DSV](https://www.fedlex.admin.ch/eli/cc/2022/568/de) |
| DSGVO Art. 9, 27, 35 | **nicht neu abgerufen** (stabiler Wortlaut, seit 2018 unverändert) | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj) |
| EU-US / Swiss-US DPF | **bestätigt**: Cloudflare aktiv in beiden, nächste Frist 15.9.2027; Rechtsmittel Latombe C-703/25 P hängig | [DPF Cloudflare](https://www.dataprivacyframework.gov/participant/5666) · [C-703/25 P, ABl.](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AC_202506610) |
| Cloudflare DPA | **bestätigt**: Version 6.4, gültig ab 3.4.2026; nennt Swiss-US DPF und das revDSG | [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) |
| Cloudflare Jurisdiction | **bestätigt**: D1, DO und R2 unterstützen eine Jurisdiction-Beschränkung (bei Erstellung) | [D1](https://developers.cloudflare.com/d1/configuration/data-location/) · [DO](https://developers.cloudflare.com/durable-objects/reference/data-location/) · [R2](https://developers.cloudflare.com/r2/reference/data-location/) |

**Weiterhin nicht am Originaltext geprüft** (nicht im Prüfauftrag): Chile Ley 21.719, Kasachstan, Angola, Westafrika, VAE, Taiwan/Singapur, Kolumbien, Australien, UK, Nigeria/Philippinen.

---

## 8. Portugiesisch in v1 – Status Brasilien (LGPD/ANPD) und Portugal (DSGVO)

Stand 6.11.2026, 15:25 (Europe/Zurich). Anlass: Entscheid Projektinhaber, Portugiesisch kommt in Version 1 (Basis **pt-BR**). **Keine Rechtsberatung**, Anwältin/Anwalt muss bestätigen. Jede Aussage unten ist an **zwei unabhängigen Quellen** geprüft (Primärquelle + Behörde oder zweite Primärquelle); Abrufdatum aller Links 6.11.2026.

### 8.1 Ergebnis in einem Satz
**Portugiesisch ist mit der EU-Datenhaltung vereinbar.** Portugal fällt direkt unter die DSGVO (wie DE/FR/IT). Für Brasilien ist der Transfer ins EU-Backup seit dem **27.1.2026** über die ANPD-Angemessenheitsentscheidung für die EU gedeckt; Auflagen bleiben Einwilligung, Ansprechstelle auf Portugiesisch, Incident-Prozess und die Frage des Cloudflare-Fernzugriffs aus den USA.

### 8.2 Brasilien (LGPD, Lei 13.709/2018)

| Thema | Befund | Quelle 1 | Quelle 2 |
|---|---|---|---|
| Anwendbarkeit auf Edovita (Sitz CH) | LGPD gilt unabhängig vom Sitz, wenn Waren/Dienste an Personen in Brasilien angeboten werden (Art. 3 II) bzw. Daten in Brasilien erhoben werden (Art. 3 III) → **gilt**, sobald die App im brasilianischen Store ist | [LGPD Art. 3, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | Gleicher Wortlaut zitiert in ANPD-Leitfäden (gov.br/anpd) |
| Gesundheitsdaten = sensibel | Art. 5 II «dado referente à saúde» → sensibel | Planalto Art. 5 | ANPD Guia Encarregado (Bsp. Gesundheitsdaten) |
| Rechtsgrundlage | Art. 11 I: Einwilligung «**de forma específica e destacada, para finalidades específicas**». Andere Gründe (Art. 11 II f: Gesundheitsschutz nur durch Gesundheitsfachpersonen) passen für eine Wellness-App nicht → **Einwilligung nötig**, getrennt pro Zweck (Backup, Partnermodus, Health-Import) | Planalto Art. 11 | Art. 8 §1, §4, §5 (hervorgehobene Klausel, keine Pauschal-Einwilligung, Widerruf gratis und einfach) |
| Transfer BR → EU (Backup Cloudflare Jurisdiction `eu`) | **Erlaubt über Art. 33 I**: ANPD-Res. **32/2026** vom 26.1.2026 (DOU 27.1.2026, «Vigente») anerkennt die EU sowie Island, Liechtenstein, Norwegen als angemessen; Neubewertung nach 4 Jahren | [DOU Res. 32/2026](https://www.in.gov.br/web/dou/-/resolucao-n-32-de-26-de-janeiro-de-2026-683334547) | [ANPD-Liste Regulamentações](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd) · [EU-Kommission 27.1.2026](https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_26_229/IP_26_229_EN.pdf) |
| ⚠ Lücke 1: Schweiz | Die ANPD hat **nur die EU/EWR** anerkannt, **nicht die Schweiz** (ANPD: bisher einzige Angemessenheitsentscheidung). Solange Gesundheitsdaten nie im Klartext in die Schweiz gelangen (local-first, E2EE), ist das unkritisch; Support-Fälle mit Klartext-Daten aus BR nur mit Einwilligung (Art. 33 VIII) oder ANPD-SCC | [ANPD Transferência Internacional](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados) | Res. 32/2026 Art. 1 Parágrafo único (nur EU/EWR) |
| ⚠ Lücke 2: Cloudflare (US-Firma) | Cloudflare verarbeitet Metadaten/Logs (u. a. IP-Adressen) in **USA und Europa**; für BR→USA nennt Cloudflare nur seine DPA-Zusagen, **keine ANPD-Standardklauseln**. ANPD-SCC müssen wortgleich übernommen werden. → Mit Anwalt klären: E2EE-Inhalt bleibt in der EU, aber Metadaten-Onward-Transfer USA braucht eigenen Mechanismus (ANPD-SCC als Zusatz, oder Art. 33 VIII Einwilligung im Backup-Dialog) | [Cloudflare LGPD FAQ](https://www.cloudflare.com/trust-hub/brazil-lgpd/) | [ANPD Res. 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024) |
| Encarregado (DPO) | Grundsatz Pflicht (Art. 41). Erleichterung für Kleinstanbieter (Res. 2/2022 Art. 11: kein Encarregado, aber Kontaktkanal) **entfällt bei «alto risco»** (Art. 3 I, Art. 4: ein allgemeines + ein spezifisches Kriterium; sensible Daten = spezifisches Kriterium). Encarregado muss **auf Portugiesisch** mit Betroffenen und ANPD kommunizieren können (Res. 18/2024 Art. 13), kann extern sein, Wohnsitz in Brasilien nicht verlangt. **Empfehlung:** externen pt-sprachigen Encarregado-Dienst oder mindestens pt-BR-Kontaktkanal vorsehen | [Res. 2/2022, DOU](https://in.gov.br/web/dou/-/resolucao-cd/anpd-n-2-de-27-de-janeiro-de-2022-376562019) | [Res. 18/2024, DOU](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-18-de-16-de-julho-de-2024-572632074) · [ANPD Guia Encarregado](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_da_atuacao_do_encarregado_anpd.pdf/@@display-file/file) |
| Datenpanne | Meldung an ANPD **und** Betroffene innert **3 Arbeitstagen** (Kleinstanbieter: doppelt), Ergänzung 20 Arbeitstage; Verschlüsselung, die Daten unlesbar macht, wird bei der Schwere berücksichtigt (LGPD Art. 48 §3) → E2EE ist hier ein echter Vorteil | [Res. 15/2024, DOU](http://in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024) | Planalto Art. 48 |
| Auskunft | Vereinfachte Auskunft sofort, vollständige innert 15 Tagen (Art. 19); in der App über «Daten exportieren» lösbar | Planalto Art. 18, 19 | – |
| Kinder/Jugendliche | LGPD Art. 14 (Eltern-Einwilligung für Kinder); **ECA Digital (Lei 15.211/2025) seit 17.3.2026 in Kraft**: Altersnachweis über Stores/«Alterssignal» → App-Altersfreigabe 16+ (Abnehm-Funktionen) und Alterssignal der Stores beachten | [Lei 15.211/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm) | [Senado 17.3.2026](https://www12.senado.leg.br/noticias/materias/2026/03/17/eca-digital-para-protecao-on-line-de-criancas-e-adolescentes-entra-em-vigor) |
| Behörde | ANPD heisst seit MP 1.317/2025 bzw. Lei 15.352/2026 «**Agência** Nacional de Proteção de Dados» (vorher «Autoridade»); in Texten so bezeichnen | Planalto Art. 5 VIII / 55-A | DOU Res. 32/2026 (Kopf «Agência») |
| Sanktionen | Bis 2 % des Umsatzes in Brasilien, max. BRL 50 Mio. pro Verstoss (Art. 52) | Planalto Art. 52 | – |

### 8.3 Portugal (DSGVO + Lei 58/2019)
- Gesundheitsdaten: DSGVO Art. 9 Abs. 2 lit. a (ausdrückliche Einwilligung) – wie für DE/FR/IT. Speicherung in der EU: **keine Transferfrage**.
- Lei 58/2019 Art. 16: digitale Einwilligung Minderjähriger ab **13 Jahren** (für Edovita irrelevant, wenn App-Freigabe 16+). Quellen: [Lei 58/2019, Diário da República](https://diariodarepublica.pt/dr/detalhe/lei/58-2019-123815982) · [CNPD Consentimento](https://www.cnpd.pt/organizacoes/areas-tematicas/consentimento/).
- Sprachvariante: Rechtstexte für Portugal sollten in **pt-PT** gegengelesen werden (Begriffe, Anrede «tu/você»); die App-UI darf vorerst pt-BR zeigen.

### 8.4 Was das für Edovita konkret heisst (Auflagen PT)
1. Einwilligungsdialog Backup auf pt-BR, eigener Schalter pro Zweck, Text «específica e destacada», Hinweis auf EU-Speicherort und Widerruf.
2. Datenschutzerklärung pt-BR mit Art.-9-/Art.-18-Angaben (Zweck, Dauer, Verantwortlicher, Kontakt, Weitergaben, Rechte) + Encarregado/Kontaktkanal auf Portugiesisch.
3. Cloudflare: abklären, ob ANPD-SCC als Zusatz zur DPA nötig sind (Metadaten USA) – bis dahin Backup für BR-Nutzer:innen erst nach Anwaltsfreigabe aktivieren (local-first funktioniert ohne).
4. Incident-Prozess: 3 Arbeitstage (BR) neben 72 h (DSGVO) und «so rasch als möglich» (DSG) in den Notfallplan.
5. Legal-Gate: `legalApproved` für `pt` bleibt **false**, bis 1.–4. erledigt und die Anwältin/der Anwalt die pt-Texte freigegeben hat.

**Fazit EU-Datenhaltung:** **vereinbar** (BR über ANPD-Res. 32/2026, PT direkt DSGVO). Offen nur Cloudflare-Onward-Transfer (USA) und Encarregado-Frage.
