# ADR-005: Rezeptinhalte datengetrieben und selbst geschrieben

- **Status:** akzeptiert (Projektinhaber, 15.11.2026). Erste Inhalte: `inhalte/` (5 Rezepte, 55 Lebensmittel)
- **Bezug:** Projektinhaber 07.11. (Rezepte selbst schreiben, keine Betty-Bossi-Texte; jedes Rezept 2–3× gegenprüfen; Nährwerte aus einer Datenbank berechnen, nicht schätzen); Review Befunde 1, 2, 7

## Entscheid

1. **Rezepte sind Daten, kein Code.** Ordner `content/recipes/<id>/` mit `recipe.json` (Struktur, Zutaten, Mengen, Portionen, Zeit, Tags, Prüfvermerk) und `<lang>.json` (Titel, Schritte, Hinweise). Die App hat keine rezeptspezifische Logik.
2. **Zutaten referenzieren den Katalog** (`FoodId`), nie freien Text. Ein unbekanntes Lebensmittel bricht den Build.
3. **Nährwerte werden berechnet** aus `RecipeIngredient.grams` × `Food.per100g` der **Schweizer Nährwertdatenbank V7.1** (BLV; Nutzung auch kommerziell mit Quellenangabe erlaubt, laut naehrwertdaten.ch/de/downloads). Credit in «Rechtliches» und im Export. Für Lebensmittel, die dort fehlen (z. B. Fischsauce, Currypaste, Limette): USDA FoodData Central (gemeinfrei), Quelle pro Lebensmittel vermerkt. Bis dahin `per100g: null`, `status: zu_pruefen`, und die Rezeptsumme ist als «mindestens» gekennzeichnet. Nichts wird geschätzt.
4. **Gegenprüfung pro Rezept:** `review.sources` (mind. 2 seriöse Quellen für Zutaten und Mengenverhältnisse, nur als Abgleich, keine Texte kopieren), `review.checkedAt`, `review.by`. Ein Inhaltstest prüft: Quellen ≥ 2, Portionen ≥ 1, Schritte in allen UI-Sprachen vorhanden, kcal/Portion plausibel (100–1'200), Allergene aus dem Katalog abgeleitet und nicht von Hand gesetzt.
5. **Eigene Texte**, keine Fotos von Dritten. Bilder anfangs als Farbfläche + Symbol wie im Prototyp.
6. **Allergen- und Vorlieben-Filter** leiten sich aus `Food.allergens`/Tags ab. Hinweis «nur Orientierung» bleibt (Handoff §3).
7. **Inhaltsarbeit ohne Cloud Agent:** Rezepte und Glossare werden lokal ohne Cloud Agent als JSON vorbereitet und gegengeprüft. Die Agents bauen nur die Pipeline und die Screens. Das ist der grösste Hebel gegen Agent-Tage.

## Folgen

- Start mit 5 Rezepten aus dem Prototyp (Ofenlachs, Thai-Curry, Pho, Birchermüesli, Linsen-Curry), danach in Paketen à 10.
- Portionsrechner und «Zur Einkaufsliste» funktionieren für jedes Rezept gleich.
