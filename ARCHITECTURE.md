# ARCHITECTURE.md – Edovita

Stand 16.11.2026, Commit 7ccbd06. Die App existiert noch nicht; diese Datei beschreibt die **beschlossene Zielstruktur**. Details in `docs/architektur/`.

## Heute im Repo
| Ort | Inhalt |
|---|---|
| `README.md` | Überblick, lokaler Start, Einstieg für Agents (Cursor, Antigravity) |
| `prototype/` | Klick-Prototyp v5.4.1: HTML/CSS/Vanilla-JS, 37 Screens, 7 Sprachen, keine Laufzeit-Abhängigkeit ausser `qrcode-generator`. Nur Design-Referenz (siehe `prototype/README.md`). |
| `design/` | Design- und Produktvorgaben: `logos/` (final, Export, Animation, Schrift), `brief/` (Briefing, Handoff, Decision-Log, Rechtsentwürfe, Store-Texte, String-Inventar), `sounds/favoriten/` (7 MP3). Die Quell-Sounds (3,4 GB) liegen nur lokal beim Projektinhaber. |
| `docs/architektur/` | Review, `inhalte/` (Startinhalte: 55 Lebensmittel, Glossare, 5 Rezepte, Prüfskripte), ADR-001 bis ADR-005, Bausteine, Testplan, Pakete E0–E7, Ablaufplan, Sicherheitsprüfung des Prototyps |

## Zielstruktur (ADR-001)
```
src/
  pages/        Routen, dünne Komposition (RecipeDetailPage, ShoppingListPage …)
  components/   reine Darstellung
  hooks/        useRecipe, useServings, useShoppingList, useSecondLang …
  app/          Provider pro Bereich, Router, Shell, Theme
  storage/      Repository-Schnittstellen, Dexie- und Memory-Implementierungen, Migrationen
  catalog/      Rezepte, Lebensmittel, Glossare lesen
  i18n/         i18next, Registry, Intl-Formatierer
  nutrition/    Portionen, Nährwertsummen, Einheiten
  health/       Schutzregeln, reine Funktionen
  pwa/          Service Worker, Update-Hinweis
  domain/       Typen, IDs, zod-Schemas; importiert nichts aus src/
content/        nur Daten (Rezepte, Lebensmittel, Glossare, Locales)
```

## Datenfluss (Ziel)
- **Inhalte:** `content/` → Build-Prüfung (`content:check`, zod) → typisierter Index → `catalog/` → Hooks → Seiten.
- **Nutzerdaten:** Seiten → Hooks → Provider pro Bereich → `*Repository` (Dexie, Tests mit Memory). Beim Lesen `coerce*()` (Whitelist).
- **Einkaufsliste:** Rezept-Detail → `addRecipe(list, recipe, servings)` → `ShoppingRepository`. Teilen nur Lebensmittel-IDs, Mengen, Zustände.
- **Kein Netzwerk** ausser eigenen statischen Dateien (CSP `connect-src 'self'`).

## Datenmodell und Speicherung
Siehe `docs/architektur/adr/ADR-002-datenmodell-und-speicherung.md`: `Food`, `Recipe`, `ShoppingItem` (Zustände open/cart/home), `Settings` mit `secondLang`; Export-Bundle `format: 1`.

## Entscheide
ADR-001 Schichten, ADR-002 Datenmodell und Dexie, ADR-003 Sprachen und Zweitsprache, ADR-004 Gesundheitsdaten und Datenschutz, ADR-005 Rezeptinhalte. Alle akzeptiert am 15.11.2026.
