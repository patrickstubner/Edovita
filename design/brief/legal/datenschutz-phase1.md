# Datenschutzerklärung – Phase 1 local-first (Entwurf)

> **ENTWURF – keine Rechtsberatung.** Bezug: CH-DSG und vorsorglich DSGVO (falls DE/AT). Stand 2026-11-06 (Europe/Zurich).  
> Phase 1 laut Architektur: **keine Sync-Server**, Gesundheitsdaten primär auf dem Gerät.

## Verantwortliche Person

Projektinhaber (Arbeitstitel; Name, Adresse und Kontakt vor Launch ergänzen)  
E-Mail: [Kontakt ergänzen]  
App: Edovita

## Was wir in Phase 1 tun (und was nicht)

- **Lokal auf deinem Gerät** können u. a. gespeichert werden: Profilangaben (z. B. Alter, Geschlecht, Grösse, Gewicht), Ziele, Essens-/Aktivitätsprotokolle, Vorlieben, App-Einstellungen (z. B. Theme).
- Diese Angaben können **Gesundheitsdaten** im Sinn des DSG sein (besonders schützenswert).
- In Phase 1 gibt es **keinen** Cloud-Backup-/Sync-Server von Edovita. Es werden **keine** Gesundheitsdaten an unsere Server übermittelt.
- Statische Inhalte (Rezepte, Lebensmittel-Stammdaten, Sounds, App-UI) können von einem CDN/Worker (geplant: Cloudflare, Jurisdiction `eu`) ausgeliefert werden – das sind **öffentliche Inhalte**, keine persönlichen Gesundheitsdaten.
- Analytics/Crash-Reporting: in Phase 1 **aus** (oder nur datensparsam und erst nach Entscheid).

## Rechtsgrundlagen (Skizze)

- Bereitstellung der von dir gewünschten App-Funktionen (Vertrag/Nutzung).
- Für besonders schützenswerte Daten: soweit nötig **ausdrückliche Einwilligung** (DSG Art. 6 Abs. 6–7; DSGVO Art. 9 Abs. 2 lit. a) – in Phase 1 vor allem lokal; Cloud-Features erst Phase 2 mit separaten Einwilligungen.

## Speicherdauer

Daten bleiben auf dem Gerät, bis du sie löschst oder die App deinstallierst. Export-Funktion (JSON/CSV) ist für die Produkt-App vorgesehen.

## Deine Rechte

Auskunft, Berichtigung, Löschung, Datenherausgabe/-übertragung (DSG Art. 25/28; ggf. DSGVO Kap. III). In Phase 1: über In-App-Export/Löschen bzw. Deinstallation. Kontakt: [E-Mail].

## Auftragsbearbeiter / Ausland

Phase 1 ohne Sync: kein Auftragsbearbeiter für Gesundheitsdaten. Für die Auslieferung der Web-/Asset-Seite ggf. Cloudflare (US-Unternehmen, Speicherung/Compute mit Jurisdiction `eu` geplant). Details und DPA vor Go-Live ergänzen (siehe `cloudflare.md`).

## Änderungen

Wir aktualisieren diese Erklärung bei Bedarf. Wesentliche Änderungen kommunizieren wir in der App bzw. auf der Privacy-URL.

## Keine Rechtsberatung

Dieser Text ist ein interner Entwurf und ersetzt keine anwaltliche Prüfung.
