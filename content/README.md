# content/

Daten-Ordner gemäss ADR-001, ADR-003 und ADR-005 (nur Inhalte, keine UI- oder App-Logik; darf aus `src/` höchstens `src/domain` importieren):

- `foods/`: Lebensmittel-Katalog (`foods.json`, 55 Lebensmittel, CH-NWD V7.1) und Glossare (`glossary/{de,en,pt,ja}.json`, `_status.json`) – übernommen in **Paket E1**.
- `recipes/`: 5 geprüfte Rezepte (`birchermuesli`, `lentil_curry`, `oven_salmon`, `pho`, `thai_curry`, jeweils `recipe.json` + `de.json`/`en.json`) – übernommen in **Paket E1**.
- `generated/catalog-index.ts` & `generated/locales-index.ts`: typisierte Inhalts- und Sprach-Indizes, erzeugt via `pnpm run content:build` und geprüft via `pnpm run content:check` (importieren ausschliesslich Typen aus `src/domain`, ADR-001).
- `locales/`: Sprach-Registry (`languages.json` mit `fallback: "en"`, `ui`, `secondary`, `meta` inkl. `dir` & `legalApproved`) und UI-Texte für alle 7 v1-Sprachen (`{de,en,fr,it,es,ja,pt}/ui.json`, wählbar DE/EN, übrige ausgegraut «In Prüfung») – umgesetzt in **Paket E2**. Rechtstexte und Store-Texte folgen vor Release.
