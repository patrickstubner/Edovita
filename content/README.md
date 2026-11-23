# content/

Daten-Ordner gemäss ADR-001, ADR-003 und ADR-005 (nur Inhalte, keine UI- oder App-Logik; darf aus `src/` höchstens `src/domain` importieren):

- `foods/`: Lebensmittel-Katalog (`foods.json`, 55 Lebensmittel, CH-NWD V7.1) und Glossare (`glossary/{de,en,pt,ja}.json`, `_status.json`) – übernommen in **Paket E1**.
- `recipes/`: 5 geprüfte Rezepte (`birchermuesli`, `lentil_curry`, `oven_salmon`, `pho`, `thai_curry`, jeweils `recipe.json` + `de.json`/`en.json`) – übernommen in **Paket E1**.
- `generated/catalog-index.ts`: typisierter Inhalts-Index, erzeugt via `pnpm run content:build` und geprüft via `pnpm run content:check` (importiert ausschliesslich Typen aus `src/domain`, ADR-001).
- `locales/`: UI-, Rechts- und Store-Texte sowie `languages.json`. Bisher liegt `locales/de/ui.json` (Texte der Start- und Statusseite, inkl. Platzhalter). Vollständiges i18n-Setup (i18next, Registry, weitere Sprachen) folgt in **Paket E2**.
