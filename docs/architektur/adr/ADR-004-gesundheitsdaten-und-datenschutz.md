# ADR-004: Gesundheitsdaten und Datenschutz

- **Status:** akzeptiert (Projektinhaber, 15.11.2026); Grenzwerte und Texte vor Release fachlich und rechtlich prüfen (keine Rechtsberatung)
- **Bezug:** Decision-Log #1, #4; Handoff §3–§4; lokale Rechtstexte (nicht im Repo); Prototyp `SECURITY.md`

## Datenklassen

| Klasse | Beispiele | Ort | Geteilt |
|---|---|---|---|
| G – Gesundheit (DSG/DSGVO Art. 9, LGPD Art. 11) | Gewicht, Grösse, Ziel, Mahlzeiten, kcal, Aktivitäten, Geburtsdatum | nur Gerät (IndexedDB, später SQLite) | nie, ausser einzeln freigegeben im Partnermodus (Phase 2) |
| N – Nutzerdaten | Einkaufsliste, Sterne, Merkliste, Zweitsprache | Gerät | Liste per Teilen/QR (nutzergesteuert) |
| E – Einstellungen | Sprache, Theme, Ton | localStorage/IndexedDB | nie |
| I – Inhalte | Rezepte, Lebensmittel, Glossare | statisch im Bundle | öffentlich |

## Entscheid

1. **Kein Konto, kein Server, keine Analytics** in Phase 1. CSP `connect-src 'self'` (nur eigene statische Dateien).
2. **Cloud-Backup standardmässig aus.** Erst Phase 2, nur Ende-zu-Ende verschlüsselt, Cloudflare Jurisdiction `eu`, eigene Einwilligung pro Zweck (Backup, Partner, Health-Import), jederzeit widerrufbar.
3. **Export und Löschen** ab der ersten Version mit Profildaten: JSON-Export (ADR-002) und «Alles löschen» (IndexedDB + localStorage + Cache des Service Workers für Nutzerdaten, falls vorhanden).
4. **Verschlüsselung lokal (Web-Phase mit Dexie):** Im Browser ehrlich begrenzt. Ein WebCrypto-Schlüssel, der im selben Browser liegt, schützt nicht gegen XSS oder jemanden mit entsperrtem Gerät. Phase 1: keine Scheinverschlüsselung, stattdessen strikte CSP, kein `innerHTML`, keine Drittskripte. Mit Capacitor: SQLCipher + Schlüssel im Keychain/Keystore (Handoff §4).
5. **Service Worker** cacht nur App-Shell und versionierte Inhalte, nie Nutzerdaten.
6. **Teilen der Einkaufsliste:** nur Lebensmittelnamen, Mengen und Zustände, nie G-Daten. QR-Import wie im Prototyp validiert (Schema, Längen, ID-Whitelist), plus Bestätigungsdialog vor dem Übernehmen.
7. **Schutzregeln** (`src/health`) sind reine Funktionen mit vollständigen Tests; Texte zielabhängig, nie «abnehmen» bei Ziel Zunehmen. Grenzwerte und Formulierungen vor Release medizinisch prüfen.
8. **Repo öffentlich:** keine Secrets, `.env` in `.gitignore`, Secret-Scan in CI (z. B. gitleaks), `npm audit` pro PR.
9. **Alter:** Geburtsdatum 13–110 J., Hinweis unter 16, Store-Freigabe 16+ (Handoff §3).

## Folgen

- Die Startfunktionen (Rezept-Detail, Einkaufsliste) berühren **keine** G-Daten. Sie können vor der Datenschutz-Prüfung gebaut werden.
- Onboarding/Profil (G-Daten) erst nach dem Lösch-/Export-Baustein.
