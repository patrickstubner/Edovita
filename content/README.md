# Inhalte (`content/`) – Regeln für Daten und Rezeptbilder

Dieser Ordner enthält alle geprüften, lokal gebündelten Inhalte der App (ADR-001, ADR-003, ADR-005):
- `foods/` – Lebensmittel-Katalog (`foods.json`: **199 Lebensmittel** – 55 bestehende aus CH-NWD V7.1 plus 144 übernommene aus E12a `#46` mit CH-NWD V7.1 / USDA SR Legacy 2018-04) und vollständige Glossare in **7 Sprachen** (`glossary/{de,en,fr,it,es,pt,ja}.json`)
- `recipes/` – **200 Rezepte** (`<id>/recipe.json` inkl. `preferenceTags`-Whitelist `cilantro`/`mushrooms`/`onion`/`meat` und `de.json`/`en.json` mit Titeln, Schritten und Hinweisen; Schritte in `fr, it, es, pt, ja` folgen in E13 `#40`)
- `locales/` – Sprach-Registry (`languages.json`, `secondary` umfasst alle 7 Sprachen ohne Rechts-Gate), UI-Texte (`<lang>/ui.json` inkl. aller 23 `cuisine.*`-Schlüssel) und Rezepttitel in allen 7 Sprachen (`<lang>/recipes.json`, je 200 Einträge)
- `images/recipes/` – Lokal gebündelte Rezeptbilder (`*.webp`, aktuell 5 Startrezepte = 10 Dateien; 172 weitere Pexels-Fotos folgen in E8 Nachtrag v5.11 `#33`, 23 Platzhalter in E14 `#41`) samt internem Herkunfts-Manifest (`manifest.json`)
- `generated/` – Automatisch erzeugte typisierte Indizes (`pnpm run content:build`, nicht von Hand bearbeiten; inkl. `RECIPE_TITLES` und `RECIPE_IMAGES`)

## Lizenz- und Sicherheitsregeln für Rezeptbilder (Issue #33, Prototyp v5.10.1 / v5.11)

1. **Zulässige Quellen und Lizenzen:** Ausschliesslich Fotos unter **Pexels License** oder **Unsplash License** (kostenlose Nutzung und Offline-Bündelung in Apps, **keine Pflicht zur Namensnennung**). **Ausgeschlossen** sind Wikimedia Commons, CC-BY, CC-BY-SA sowie kommerzielle Stock-Lizenzen mit Nennungspflicht.
2. **Keine Nennung in der UI:** Fotografennamen und Ursprungs-URLs stehen **ausschliesslich** im internen Manifest (`content/images/recipes/manifest.json`) im Repo. Das Manifest wird weder ins App-Bundle übernommen noch in der Oberfläche angezeigt.
3. **Kein Hotlinking, keine APIs:** Kein `fetch`, keine externen Bildhosts, keine Unsplash-/Pexels-API-Schlüssel. Alle Bilder werden lokal im Bundle unter CSP `img-src 'self' data:` ausgeliefert (kein Workers KV in der App).
4. **Motivprüfung:** Keine sichtbaren Marken, Logos, geschützten Werke oder erkennbaren Personen (Modellrechte sind durch Stock-Lizenzen nicht abgedeckt).
5. **Technisches Format & Datenschutz:** WebP ohne EXIF-, XMP- oder GPS-Metadaten (wird durch `pnpm run content:check` automatisiert geprüft). Je Rezept zwei Varianten im Seitenverhältnis 4:3:
   - Vollbild (`<recipeId>.webp`, 800×600 bzw. im v5.11-Katalog 640×480)
   - Miniatur (`<recipeId>-thumb.webp`, 400×300)
6. **Feste Whitelist:** Bildpfade werden ausschliesslich über die geprüfte `recipeId` und den generierten statischen Index (`content/generated/catalog-index.ts`) aufgelöst – niemals aus freien Pfaden, Nutzereingaben oder URL-Parametern. Rezepte ohne Eintrag im Index zeigen den neutralen Platzhalter (farbige Fläche + Blatt-Icon).
7. **Grössenbudget & Offline-Precache (Nachtrag v5.11, Abstimmung mit E7 #13):**
   - Aktueller Stand auf `main` (5 Rezepte, 10 WebP-Dateien): **406'802 Bytes (~397 KiB / 0,39 MiB)**.
   - Zielbudget für den vollständigen v5.11-Katalog (nach E12 `#39`: 177 Pexels-Fotos + 23 Platzhalter): **7,4 MB (`7'400'000` Bytes)** gemäss Prototyp v5.11; Überschreitung nur nach ausdrücklicher Entscheidung.
   - Für E7 (`#13`, Service-Worker-Precache): Miniaturen (`*-thumb.webp`) und benötigte Vollbilder klar ausweisen, damit Journey J8 offline mit Bildern funktioniert, ohne das Budget unbemerkt zu sprengen.

## Herkunft der v5.11-Daten und Nährwert-Belege (E12a `#46` & E12 `#39`)

- **Bestehende Basis (`main`):** Die 5 Startrezepte (`birchermuesli`, `lentil_curry`, `oven_salmon`, `pho`, `thai_curry`) und 55 CH-NWD-V7.1-Lebensmittel behalten unverändert ihre geprüften Nährwerte, Allergene, Quellen und Texte (ergänzt um `preferenceTags`).
- **Erweiterung (E12 `#39`, Prototyp v5.11 `93630aa` + E12a `#46`):** Die 144 neuen Lebensmittel und 195 weiteren Rezepte stammen in Struktur, Titeln (7 Sprachen), DE/EN-Schritten, Glossaren (`de, en, fr, it, es, pt, ja`) und 23 Küchen aus dem Prototyp v5.11 (`93630aa`), während alle Nährwerte, Dichten und `review.sources` (je ≥ 2 geprüfte HTTPS-Quellen, 0 geschätzte Werte, 0 Betty Bossi) aus den in **E12a (`#46`)** unter `docs/architektur/inhalte/e12a/` dokumentierten CH-NWD-V7.1-/USDA-Belegen übernommen wurden.
- **Folgepakete:** 172 weitere Pexels-Fotos folgen in **E8 Nachtrag v5.11 (`#33`)**, Zubereitungsschritte in `fr, it, es, pt, ja` in **E13 (`#40`)** und die 23 Ersatzfotos für Platzhalter in **E14 (`#41`)**.

