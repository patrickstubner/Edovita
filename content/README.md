# Inhalte (`content/`) – Regeln für Daten und Rezeptbilder

Dieser Ordner enthält alle geprüften, lokal gebündelten Inhalte der App (ADR-001, ADR-003, ADR-005):
- `foods/` – Lebensmittel-Katalog (`foods.json`: **199 Lebensmittel** – 55 bestehende aus CH-NWD V7.1 plus 144 übernommene aus E12a `#46` mit CH-NWD V7.1 / USDA SR Legacy 2018-04) und vollständige Glossare in **7 Sprachen** (`glossary/{de,en,fr,it,es,pt,ja}.json`)
- `recipes/` – **200 Rezepte** (`<id>/recipe.json` inkl. `preferenceTags`-Whitelist `cilantro`/`mushrooms`/`onion`/`meat` sowie **alle 7 Sprachdateien** `{de,en,fr,it,es,pt,ja}.json` mit Titeln, Schritten und Hinweisen gemäss E13 `#40`)
- `locales/` – Sprach-Registry (`languages.json`, `secondary` umfasst alle 7 Sprachen ohne Rechts-Gate; `legalApproved` unverändert DE/EN), UI-Texte (`<lang>/ui.json` inkl. aller 23 `cuisine.*`-Schlüssel) und Rezepttitel in allen 7 Sprachen (`<lang>/recipes.json`, je 200 Einträge)
- `images/recipes/` – Lokal gebündelte Rezeptbilder (`*.webp`, **alle 200 Pexels-Fotopaare = 400 WebP-Dateien**, **0 Platzhalter** gemäss E8 `#33` & E14 `#41`) samt internem Herkunfts-Manifest (`manifest.json`)
- `generated/` – Automatisch erzeugte typisierte Indizes (`pnpm run content:build`, nicht von Hand bearbeiten; inkl. `RECIPE_TITLES`, `RECIPE_LOCALES` in allen 7 Sprachen und `RECIPE_IMAGES`)

## Lizenz- und Sicherheitsregeln für Rezeptbilder (Issues #33 & #41, Prototyp v5.10.1 / v5.11)

1. **Zulässige Quellen und Lizenzen:** Ausschliesslich Fotos unter **Pexels License** oder **Unsplash License** (kostenlose Nutzung und Offline-Bündelung in Apps, **keine Pflicht zur Namensnennung**). **Ausgeschlossen** sind Wikimedia Commons, CC-BY, CC-BY-SA sowie kommerzielle Stock-Lizenzen mit Nennungspflicht.
2. **Keine Nennung in der UI:** Fotografennamen und Ursprungs-URLs stehen **ausschliesslich** im internen Manifest (`content/images/recipes/manifest.json`) im Repo. Das Manifest wird weder ins App-Bundle übernommen noch in der Oberfläche angezeigt.
3. **Kein Hotlinking, keine APIs:** Kein `fetch`, keine externen Bildhosts, keine Unsplash-/Pexels-API-Schlüssel. Alle Bilder werden lokal im Bundle unter CSP `img-src 'self' data:` ausgeliefert (kein Workers KV in der App).
4. **Motivprüfung:** Keine sichtbaren Marken, Logos, geschützten Werke oder erkennbaren Personen (Modellrechte sind durch Stock-Lizenzen nicht abgedeckt).
5. **Technisches Format & Datenschutz:** WebP ohne EXIF-, XMP- oder GPS-Metadaten (wird durch `pnpm run content:check` automatisiert geprüft). Je Rezept zwei Varianten im Seitenverhältnis 4:3 (Kodierung mit Pillow `method=6`, Qualität `q=52` Vollbild / `q=48` Miniatur, ohne Verkleinerung der Bildmasse):
   - Vollbild (`<recipeId>.webp`, 12× `800×600` inkl. der 5 Startrezepte sowie 188× `640×480`)
   - Miniatur (`<recipeId>-thumb.webp`, 200× `400×300`)
6. **Feste Whitelist:** Bildpfade werden ausschliesslich über die geprüfte `recipeId` und den generierten statischen Index (`content/generated/catalog-index.ts`) aufgelöst – niemals aus freien Pfaden, Nutzereingaben oder URL-Parametern. Rezepte ohne Eintrag im Index zeigen den neutralen Platzhalter (farbige Fläche + Blatt-Icon).
7. **Grössenbudget & Offline-Precache (E8 `#33` + E14 `#41`, Abstimmung mit E7 `#13`):**
   - Aktueller Stand (E14 `#41`, alle 200 Pexels-Fotopaare = 400 WebP-Dateien, 0 Platzhalter): **7'313'344 Bytes (~6,97 MiB / Ø 36'567 B pro Rezept)** bei `q=52/48` (`method=6`).
   - Fixes Gesamtbudget (`RECIPE_IMAGE_BUDGET_BYTES`): **7,4 MB (`7'400'000` Bytes)** gemäss Entscheid 25.11. unverändert eingehalten (Restreserve **86'656 Bytes**).
   - Für E7 (`#13`, Service-Worker-Precache): Miniaturen (`*-thumb.webp`, 200 Dateien) im Precache und Vollbilder cache-first ausweisen, damit Journey J8 offline mit Bildern funktioniert, ohne das Precache-Budget unnötig aufzublähen.

## Herkunft der v5.11-Daten und Nährwert-Belege (E12a `#46`, E12 `#39`, E8 Nachtrag v5.11 `#33`, E13 `#40` & E14 `#41`)

- **Bestehende Basis (`main`):** Die 5 Startrezepte (`birchermuesli`, `lentil_curry`, `oven_salmon`, `pho`, `thai_curry`) und 55 CH-NWD-V7.1-Lebensmittel behalten unverändert ihre geprüften Nährwerte, Allergene, Quellen und DE/EN-Texte (ergänzt um `preferenceTags`).
- **Erweiterung (E12 `#39` + E8 Nachtrag v5.11 `#33`, Prototyp v5.11 `93630aa` + E12a `#46`):** Die 144 neuen Lebensmittel, 195 weiteren Rezepte und 172 weiteren Pexels-Fotopaare stammen in Struktur, Titeln (7 Sprachen), DE/EN-Schritten, Glossaren (`de, en, fr, it, es, pt, ja`), 23 Küchen und Bildauswahl aus dem Prototyp v5.11 (`93630aa`), während alle Nährwerte, Dichten und `review.sources` (je ≥ 2 geprüfte HTTPS-Quellen, 0 geschätzte Werte, 0 Betty Bossi) aus den in **E12a (`#46`)** unter `docs/architektur/inhalte/e12a/` dokumentierten CH-NWD-V7.1-/USDA-Belegen übernommen wurden.
- **Mehrsprachige Zubereitungsschritte (E13 `#40`, Entscheid 25.11.2026):** Die 1'000 zusätzlichen Sprachdateien (`{fr,it,es,pt,ja}.json` für alle 200 Rezepte = 4'250 Schritte + 145 `notes`, streng ausgerichtet an den 7 Lebensmittel-Glossaren und mit unveränderten Zahlen/Temperaturen/Einheiten) wurden im Rahmen der auf E13 begrenzten Ausnahme zu ADR-005 §7 erstellt und unterliegen dem verbindlichen Review vor dem Merge. `EXPECTED_RECIPE_UI_LANGS` prüft seither verpflichtend alle 7 UI-Sprachen.
- **Ersatz der 23 Platzhalter-Rezepte (E14 `#41`, Entscheid 25.11.2026):** Alle 23 vormals als Platzhalter geführten Rezepte erhielten je ein visuell geprüftes Pexels-Fotopaar (`Pexels License`, `640×480` `q=52` / `400×300` `q=48`, 0 EXIF/XMP/GPS, 0 Marken/Logos/Personen, `+773'874 B`), sodass alle 200 Rezepte lokal bebildert sind (`placeholders: []`, gesamt `7'313'344 B ≤ 7'400'000 B`).
- **Folgepaket:** PWA/Offline-Service-Worker folgt in **E7 (`#13`)**.

