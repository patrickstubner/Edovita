# content/

Daten-Ordner gemäss ADR-001, ADR-003 und ADR-005 (nur Inhalte, keine UI- oder App-Logik; darf aus `src/` höchstens `src/domain` importieren):

- `foods/`: Lebensmittel-Katalog (`foods.json`) und Glossare (`glossary/<code>.json`) – Übernahme aus `docs/architektur/inhalte/` in **Paket E1**.
- `recipes/`: Rezept-Daten (`<id>/recipe.json` und `<id>/<code>.json`) – Übernahme in **Paket E1**.
- `locales/`: UI-, Rechts- und Store-Texte sowie `languages.json` – Aufbau in **Paket E2**.
