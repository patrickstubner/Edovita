# Edovita Decision-Log

Stand: 2026-11-06, entschieden von Projektinhaber

| # | Thema | Entscheid |
|---|-------|-----------|
| 1 | Datenort | EU bei Cloudflare (Jurisdiction eu) |
| 2 | Start | Zuerst Web-App/PWA, Stores später |
| 3 | Markt | CH plus DE/AT von Anfang an |
| 4 | Cloud-Backup | Standardmässig aus, freiwillig einschaltbar |
| 5 | App-/Bundle-ID | ch.edovita.app |

Offen: Kontomodell Phase 2, Partner-Umfang V1, Sync nach Spike, Juristen-Budget, Domain, Prototyp einfrieren, Worker-Name, CF-DPA, Hör-QC Favoriten.

## 2026-11-06 – Sprachen Version 1
Entscheid Projektinhaber: EN, DE, FR, IT, ES, JA. Weitere Sprachen (u. a. PT, HI, ID) eventuell später, offen. Markt grundsätzlich weltweit.

## 2026-11-06 – i18n
Entscheid Projektinhaber: i18next + react-i18next (ICU-Plurale via i18next-icu). Struktur: locales/<code>/{meta,ui,legal,recipes,store}.json, Fallback en, aktive Sprachen in einer Liste, Sprache nur wählbar wenn legalApproved=true, Test auf fehlende Schlüssel/Platzhalter.

## 2026-11-06 – Repo
Entscheid Projektinhaber: Repo patrickstubner/Edovita ist und bleibt öffentlich. Keine Geheimnisse/Keys ins Repo.

## 2026-11-06 – v1 Sprachen + PT
Entscheid Projektinhaber (6.11.2026, Nachmittag):
- **Sprachen Version 1:** EN, DE, FR, IT, ES, JA **und neu PT** (7 Sprachen). Fallback `en`.
- **Portugiesisch-Variante:** Basis **pt-BR** (grösste Sprechergruppe, ca. 215 Mio. von ~265 Mio.; Anrede «você»). Ein Ordner `locales/pt/`, `meta.json` mit `locale: "pt-BR"`, `variant: "pt-BR"` und Begründung. Geräte mit pt-PT erhalten vorerst pt-BR; eigene pt-PT-Variante nur bei Bedarf (Rechtstexte für Portugal in pt-PT gegenlesen lassen).
- **Legal-Gate bis zur Prüfung:** wählbar nur **DE und EN**. FR, IT, ES, JA, PT: `legalApproved=false`, in der Sprachwahl ausgegraut mit «In Prüfung» (übersetzt). Gerätesprache FR/IT/ES/JA/PT → Start in EN. Alle Übersetzungen `reviewed=false` ausser DE (Quelltext).
- **Rechtslage PT** (Details `legal/sprachen-regionen-datenschutz.md` §8): mit EU-Datenhaltung **vereinbar**. Portugal = DSGVO. Brasilien: Transfer BR→EU seit 27.1.2026 über ANPD-Angemessenheit (Res. CD/ANPD 32/2026). Auflagen: Einwilligung «específica e destacada», pt-sprachiger Encarregado/Kontaktkanal, Incident 3 Arbeitstage, Cloudflare-Metadaten USA klären.
- Nicht mehr «geplant»: PT. Weiterhin geplant: HI, KO, BN; TR mit Auflagen; ID blockiert.
- Prototyp v5: PT lokal eingebaut, **nicht deployt** (Deploy braucht neue Freigabe).

## 2026-11-06 – Eigenes Kalorienziel (v5.2)
Entscheid Projektinhaber: Neben dem nachhaltigen Edovita-Tempo und «Eigenes Tempo» (kg/Woche) gibt es «Eigenes Kalorienziel» (kcal/Tag). Preset 1'200 kcal «ärztlich begleitete Diät, z. B. nach Dr. Nowzaradan» nur als neutrales Beispiel, ohne Markenbezug. Leitplanken: unter 1'200 (Frauen) / 1'500 kcal (Männer) bzw. unter Grundumsatz Hinweis «nur unter ärztlicher Begleitung» mit Bestätigung; harte Untergrenze 800 kcal; Hinweise für Zunehmen/Halten. Keine medizinische Beratung. Zusätzlich: Primärgrün #0B7F6B, Rahmen ≥3:1, Fokus auf Titel, Vorlieben überspringbar. Unter-16 bleibt Hinweis, Geburtsdatum bleibt voll. Deployt am 6.11.2026 (freigegeben).

## 6.11.2026 – V1-Feature-Paket (Ideen-Scout → Prototyp v5.3)
- **Entscheid:** Zehn V1-Features lokal im Prototyp umsetzen (Resteverwertung ohne Foto/KI, Saisonkalender je Markt, Ein-Tipp, Handportionen, lokale Barcode-DB, Essensfenster default aus, Sport/MET, QR-Liste ohne Server, Reisemodus, Hausmarken).
- **Nicht V1:** Abend-Check-in; Arzt-Export als «bald»; Foto-KI später (kostenpflichtig).
- **Rahmen:** local-first, keine Betriebskosten, kein Deploy ohne Freigabe.
- **Umsetzung:** Prototyp v5.3 lokal; Backup v5.2; i18n 7 Sprachen; SECURITY.md v5.3.

## 6.11.2026 – Fixe Aktionsbuttons (Prototyp v5.4)
Entscheid Projektinhaber (Sprachnachricht): Hauptaktions-Buttons (1–3, z. B. Weiter, Speichern, Später) auf jedem Screen immer fix ganz unten im Viewport sichtbar; Inhalt darüber scrollt. Kurz oder lang: Buttons unten. Umsetzung: `.actions`-Leiste + `.screen-body`, Safe-Area, Tabbar-Abstand, visualViewport für Tastatur. Statuszeile «Prototyp v5.4». **Nicht deployt** (Freigabe ausstehend).
