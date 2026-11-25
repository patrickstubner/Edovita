# Inhalte (`content/`) – Regeln für Daten und Rezeptbilder

Dieser Ordner enthält alle geprüften, lokal gebündelten Inhalte der App (ADR-001, ADR-003, ADR-005):
- `foods/` – Lebensmittel-Katalog (`foods.json`, Schweizer Nährwertdatenbank V7.1) und Glossare (`glossary/*.json`)
- `recipes/` – Rezepte (`<id>/recipe.json` und Sprachdateien `<id>/<lang>.json`)
- `locales/` – Sprach-Registry (`languages.json`) und UI-Texte (`<lang>/ui.json`)
- `images/recipes/` – Lokal gebündelte Rezeptbilder (`*.webp`) samt internem Herkunfts-Manifest (`manifest.json`)
- `generated/` – Automatisch erzeugte typisierte Indizes (`pnpm run content:build`, nicht von Hand bearbeiten)

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
