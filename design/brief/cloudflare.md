# Edovita – Cloudflare / Hosting (1-Pager, Entwurf)

Stand: 2026-11-06 (Europe/Zurich) · **Kein Deploy in diesem Auftrag.** Account-Referenz: Projekt-Konto.  
Quelle der Architektur: `design/architektur-hosting.md`.

## Empfehlung Phase 1

| Thema | Vorschlag |
|---|---|
| Worker-Name (Kandidat) | `edovita` oder `edovita-app` (API später: `edovita-api`) |
| Static / Privacy-URL | derselbe Worker mit Static Assets (Workers, nicht Pages-Neu) |
| Jurisdiction | **`eu`** für D1 / Durable Objects / R2 (bei Erstellung setzen) |
| DPA | Cloudflare Customer DPA akzeptieren und ablegen (Projektinhaber) – Link in Architektur §13 |
| Prototyp-URL | Cloudflare-Worker-Demo bleibt Design-Referenz; einfrieren |
| Produktiv-Domain | später; V1-Tests auf `workers.dev` ok |
| Bundle-ID (nativ, Vorschlag) | `ch.edovita.app` – **nicht final** |

## Was Cloudflare in Phase 1 braucht

- Auslieferung der **Web/PWA** und der **Privacy-/Legal-URLs** (Stores verlangen öffentliche Privacy-URL).
- Statische Rezept-/Lebensmittel-Dateien (später), Icons, Sounds.
- **Kein** Sync-Backend in Phase 1 (local-first).

## Explizit nicht

- **GitHub Pages** für kommerzielles SaaS / Produkt → nein (ToS).
- Vercel Hobby für kommerziell → nein.
- Firebase als Free-Produktionspfad → nicht empfohlen.
- Speicherung von Gesundheits-Klartext auf dem Server → nein; später nur Ciphertext + Einwilligung.

## DPA / Datenschutz (Kurz)

- Cloudflare ist Auftragsbearbeiter, sobald personenbezogene Daten den Dienst berühren.
- Mit Jurisdiction `eu` liegen DO/D1/R2-Daten in der EU; Cloudflare bleibt US-Unternehmen (Zugriff/Metadaten beachten) → Architektur: E2EE für Backups, DPA, Information in der Datenschutzerklärung.
- Swiss-U.S. DPF und SCC: siehe Architektur §8; vor Launch DPA-Version und Zertifizierung erneut prüfen.

## Nächste Schritte für Projektinhaber

1. CF-Account Projekt-Konto bestätigen; DPA akzeptieren/PDF ablegen.
2. Worker-Namen final wählen (`edovita` vs. `edovita-app`).
3. §12 Architektur-Entscheide (Datenort EU vs. nur CH, PWA-first vs. Stores, Domain).
4. Deploy erst mit Coding-Wiederaufnahme (~27.11.), nicht jetzt.

## Kostenrahmen (Erinnerung)

Free-Tarif bis Modell ~1–5k Nutzer; Store-Konten separat (Apple 99 USD/J, Google 25 USD einmalig). Details §7 Architektur.
