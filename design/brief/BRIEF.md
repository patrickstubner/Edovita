# Edovita – Umsetzungsbriefing (2026-11-06)

## Ziel
Neue Produktiv-App (nicht den Prototyp erweitern). Design-Referenz: Klick-Prototyp **v5** (`prototype/`, live v5-Stand vom 6.11.2026 ohne PT: (Cloudflare-Worker-Demo, URL nicht öffentlich dokumentiert)). Gesamtübergabe: `HANDOFF-entwickler.md`.

## Stack (Entscheidung Architektur)
- React + TypeScript + **Rsbuild** (Projektinhaber 2026-11-06; nicht Vite)
- Capacitor für iOS/Android + Web/PWA
- Local-first: Gesundheitsdaten in SQLite auf dem Gerät (z. B. @capacitor-community/sqlite / wa-sqlite für Web)
- Offline-Pflicht: Service Worker für Web (App-Shell + versionierte statische Inhalte precachen); nie API/Gesundheitsdaten in Cache-API
- Dark Mode (System/Hell/Dunkel), Primärgrün Hellmodus-Text auf Grün: #0B7F6B (Fix gegenüber Prototyp #0F9D84)
- Hosting: Cloudflare Workers (Konto des Projektinhabers), Jurisdiction eu
- Backend: Entscheide gemäss architektur-hosting.md (Local-first Phase 1 ohne Sync-Backend; Worker/DO/D1 erst für Backup/Partner Phase 2). Du wählst konkrete Libs/Schemas im Rahmen dieses Plans.
- UI-Sprachen v1: **EN, DE, FR, IT, ES, JA, PT (pt-BR)**, Fallback EN; Quelltext Deutsch, Schweizer Schreibweise (ss, kein ß). i18next + react-i18next + i18next-icu; Struktur `locales/<code>/{meta,ui,legal,recipes,store}.json`; Sprache nur wählbar bei `legalApproved=true` (aktuell nur DE/EN). Vorlage: Prototyp `locales/` (745 Schlüssel je Sprache). Details: `HANDOFF-entwickler.md`

## Phase 1 (dieser Auftrag)
Scaffold + lauffähige mobile-first Kern-App:
1. Rsbuild/React/TS-Projekt mit Capacitor-Grundsetup (iOS/Android-Projekte anlegen, Splash nur einfarbig nativ)
2. Screens/Flows aus Prototyp portieren (Onboarding 1–4, Heute, Erfassen, Rezepte, Einkauf, Woche, Fortschritt, Körper, Profil, …) – zuerst Handy
3. Theme + finales Logo/Icons (SVG beigefügt) + Splash-Animation aus logo-anim.css (Zusammenbau, Herz Lub-Dub, EKG; prefers-reduced-motion)
4. Lokale Persistenz (Profil/Ziele/Logs) – noch kein Sync
5. Schutzregeln: kein Abnehmen bei BMI < 18.5; Gewicht min 25 kg bei Zunehmen/Halten, 40 kg bei Abnehmen; Tempo ≤ 1 kg/Woche; Mindest-kcal 1500 m / 1200 w; Texte zielabhängig, nie «abnehmen»-Wortlaut bei Ziel Zunehmen
6. Sounds: Manifest beigefügt. **Nicht** ausliefern: hymne_AI_H2*, hymne_AI_H3*, stile_v3/_discarded, stile_v3/samples/, ai_hymnen_v1/raw/. Favoriten-Defaults: Hymnen H1, H5, H4; Rock stile_v3/rock_v3 + rock_v4; Hip-Hop v2 #2 = stile_v2/hiphop_v2 (auch stile_v3/hiphop_v2 vorhanden). UI: Auswahl, Stummschalten. KI-Hymnen als KI-generiert kennzeichnen (ACE-Step Apache-2.0). Credit wo MuldjordKit: «Drum samples provided by DrumGizmo.org»
7. PWA: manifest + Service Worker nach SECURITY.md V1-Vorgaben (strenge CSP ohne unsafe-inline/eval wo möglich)
8. Disclaimer: keine Finanz-/Medizinberatung; Allergenfilter nur Hinweis (Simulation); Gesundheitstexte brauchen später medizinische Prüfung
9. README + SECURITY.md (npm audit, Secrets-Scan, Angriffsflächen); version 0.1.0

## Nicht in Phase 1
Backend/Sync/Partner, HealthKit, echte Lebensmittel-DB-Pipeline, Store-Submission, samples/-Rohmaterial (3.4 GB)

## Erfolg
- `npm test` / lint / build grün
- `npx cap sync` dokumentiert
- App lokal im Browser (Handy-Viewport) bedienbar: Onboarding → Heute, Theme, Splash, mind. ein Sound
- Keine Secrets; SECURITY.md mit Audit-Ergebnis
