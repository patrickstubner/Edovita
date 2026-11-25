# Edovita-Startinhalte (Entwurf, 15.11.2026)

Lokal vorbereitet für E1 (Domäne, Katalog, Rezept-Schema). Format gemäss ADR-002, ADR-003 und ADR-005. Seit 22.11.2026 im Repo (Entwurf, noch nicht in der App verdrahtet; E1 übernimmt sie nach `content/`).

## Inhalt

| Pfad | Inhalt |
|---|---|
| `foods/foods.json` | Lebensmittel-Katalog: 55 Einträge mit festen IDs, Gruppe, Allergenen, Nährwerten pro 100 g aus der Schweizer Nährwertdatenbank (mit Referenz-ID und Originalname) |
| `foods/glossary/{de,en,pt,ja}.json` | Lebensmittelnamen, je 55 Einträge; `_status.json` markiert unsichere Übersetzungen |
| `recipes/<id>/recipe.json` | Struktur, Zutaten mit Menge, Einheit und gegessenem Gewicht (`grams`), Allergene, Nährwerte pro Portion, Prüfvermerk |
| `recipes/<id>/{de,en}.json` | Titel, Schritte, Hinweise zu Zutaten (nur freigegebene UI-Sprachen; PT/JA-Rezepttexte folgen mit der Sprachfreigabe) |
| `quelle/Schweizer_Nahrwertdatenbank_V7.1.xlsx` | Original-Download vom 15.11.2026 (SHA-256 in `foods.json`) |
| `tools/definitionen.py` | von Hand geschriebene Quelle (Zutaten, Mengen, Schritte, Übersetzungen, DB-Zuordnung) |
| `tools/build_inhalte.py` | erzeugt die JSON-Dateien und rechnet die Nährwerte aus der xlsx |
| `tools/validate.py` | Prüfung: Schema, jede Zutat im Katalog, jede Katalog-ID in allen Glossaren, Werte = xlsx, ml × Dichte, Allergene abgeleitet, ≥ 2 Quellen, kcal plausibel, Texte DE/EN vollständig |

Ausführen: `python3 tools/build_inhalte.py && python3 tools/validate.py` (braucht `openpyxl`). Ergebnis 15.11.2026: **OK, 0 Fehler**, 6 Warnungen (unten). Negativtest: absichtlich falscher kcal-Wert, fehlender JA-Eintrag, unbekannte Zutat und nur 1 Quelle werden alle erkannt.

## Rezepte (2 Portionen als Grundmenge, skalierbar 1–12)

Werte pro Portion, berechnet aus Rohgewichten (Garverluste nicht berücksichtigt). Abgesiebte Zutaten (Pho: Zwiebel, Ingwer, Gewürze) und optionale Zutaten zählen nicht.

| Rezept | Port. | Min. | kcal | Protein g | Fett g | KH g | Ballastst. g | Salz g | Allergene | nicht enthalten | Näherung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Birchermüesli (`birchermuesli`) | 2 | 10 | 443 | 14.4 | 18.8 | 50.6 | 7.9 | 0.2 | gluten, milk, nuts | – | – |
| Linsen-Curry mit Kokosmilch und Spinat (`lentil_curry`) | 2 | 35 | 582 | 27.0 | 29.4 | 43.8 | 17.3 | 3.0 | – (prüfen: celery, mustard) | cumin, curry_powder, lime, vegetable_broth:fiber | – |
| Ofenlachs mit Broccoli und Kartoffeln (`oven_salmon`) | 2 | 40 | 721 | 42.3 | 37.9 | 46.2 | 12.0 | 2.1 | fish | black_pepper | – |
| Pho mit Rindfleisch (`pho`) | 2 | 45 | 452 | 30.8 | 6.8 | 66.2 | 1.0 | 5.7 | fish (prüfen: celery) | bean_sprouts, beef_broth:fiber, coriander_fresh, fish_sauce, lime, spring_onion | rice_noodles, thai_basil |
| Rotes Thai-Curry mit Poulet (`thai_curry`) | 2 | 30 | 800 | 47.2 | 34.5 | 72.9 | 4.3 | 0.1 | fish (prüfen: crustaceans) | fish_sauce, red_curry_paste | thai_basil |

Salzwerte sind bei Thai-Curry und Linsen-Curry **zu tief**, weil Fischsauce, Currypaste und Currypulver fehlen. Pho hat schon ohne Fischsauce **5,7 g Salz pro Portion** (fertige Fleischbouillon laut CH-NWD); mit Fischsauce liegt es nahe oder über der Tagesempfehlung von 5 g. Vorschlag: Hinweis «salzarme Bouillon verwenden» und Bouillonmenge prüfen.

**Abweichungen vom Prototyp (dort geschätzt):** Ofenlachs dort 480 kcal, hier 721 kcal (Zuchtlachs 150 g + 250 g Kartoffeln + 12,5 g Öl pro Portion). Thai-Curry dort 540 kcal ohne Reis, hier 800 kcal inkl. 75 g Reis. Die Rezeptkarten-Werte im Prototyp gelten nicht mehr.

**Selbst geschrieben:** Mengen, Schritte und Texte sind eigene Formulierungen. Die Quellen in `review.sources` (je 3) dienten nur zum Abgleich von Zutaten, Verhältnissen, Garzeiten und Temperaturen. Es wurden keine Texte übernommen, keine Betty-Bossi-Rezepte verwendet.

**Bewusste Entscheide:** Thai-Curry ohne Karotte (im Prototyp gelistet, in den geprüften Thai-Quellen nicht üblich), dafür Aubergine und Peperoni. Pho: Fleisch kurz in der siedenden Brühe gegart statt roh übergossen (Lebensmittelsicherheit). Birchermüesli: moderne Variante mit Milch und Joghurt statt Kondensmilch.

## Zu prüfen

1. **Nicht in der Schweizer Nährwertdatenbank (12), ohne Nährwerte, nichts erfunden:** `black_pepper` (nicht in CH-NWD); `red_curry_paste` (nicht in CH-NWD; Fertigpasten enthalten oft Krevettenpaste); `fish_sauce` (nicht in CH-NWD; sehr salzig); `kaffir_lime_leaves` (nicht in CH-NWD; Menge vernachlässigbar); `star_anise` (nicht in CH-NWD; wird abgesiebt); `cloves` (nicht in CH-NWD; wird abgesiebt); `bean_sprouts` (nicht in CH-NWD); `spring_onion` (nicht in CH-NWD); `coriander_fresh` (nicht in CH-NWD); `lime` (nicht in CH-NWD); `curry_powder` (nicht in CH-NWD; Mischungen können Senf/Sellerie enthalten); `cumin` (nicht in CH-NWD). Vorschlag: Werte aus USDA FoodData Central (gemeinfrei) ergänzen und Quelle pro Lebensmittel vermerken.
2. **Näherungen (2):** `thai_basil` (Näherung: Basilikum, roh (Thai-Basilikum nicht in CH-NWD)); `rice_noodles` (Näherung: Reis poliert, trocken (flache Reisnudeln nicht in CH-NWD)). Bei Reisnudeln macht das ca. 280 kcal pro Portion Pho aus, bitte mit einer Packungsangabe oder USDA prüfen.
3. **Annahmen für Stückgewichte und Löffel:** Knoblauchzehe 3 g, Zitronensaft 15–20 g, Limettensaft 15–30 g, Zwiebel 100 g, 1 EL Currypaste 15 g, 1 TL Currypulver 3 g. Stehen als Hinweis an der Zutat.
4. **Allergene «prüfen»:** Bouillon (Sellerie), Currypaste (Krebstiere/Krevettenpaste), Currypulver (Senf, Sellerie). Hängt vom Produkt ab; die App soll das als «kann enthalten» zeigen.
5. **Unsichere Übersetzungen:** JA `kaffir_lime_leaves` (こぶみかんの葉), `rice_noodles` (ライスヌードル（平麺）), `beef_sirloin` (牛ロース); PT `kaffir_lime_leaves` (folhas de limão-kaffir), `rice_noodles` (macarrão de arroz (talharim)), `beef_sirloin` (bife ancho (entrecôte)). Rest gängige Begriffe; alle JA/PT-Namen von Muttersprachlern gegenlesen lassen.
6. **Probekochen** aller 5 Rezepte durch einen Menschen (`review.status = zu_pruefen`).
7. **DE-Begriffe:** Schweizer Schreibweise (Broccoli, Peperoni, Poulet, Pelati). Für DE/AT später eigene Varianten (`de-DE`: Brokkoli, Paprika, Hähnchen)?

## Erweiterungspaket E12a (Issue #46, Basis `main` `10c3b7bb67b14e9cae0c03c2574c11768297fbb6`)

Vorbereitete Nährwert- und Quellenbelege für den späteren Rezeptimport in **E12 (`#39`)**, abgelegt unter `docs/architektur/inhalte/e12a/` ohne Änderung an den 55 bestehenden Lebensmitteln und 5 bestehenden Rezepten unter `content/`:

| Pfad | Inhalt |
|---|---|
| `e12a/foods-ext.json` | 144 neue Lebensmittel im `foodCatalogFileSchema`-Format (disjunkt zu den 55 auf `main`; 98 CH-NWD V7.1, 40 USDA SR Legacy 2018-04, 6 ohne generische Quelle mit `per100g: null` & `status: "zu_pruefen"`; gesamt 116 `ok`, 28 `zu_pruefen`, 0 geschätzte Werte) |
| `e12a/recipes-ext.json` | 195 neue Rezepte im `recipeSchema`-Format (disjunkt zu den 5 auf `main`; je 2 geprüfte HTTPS-Quellen-URLs ohne Betty Bossi, `nutritionPerServing` vollständig aus `grams × per100g` berechnet, 141–746 kcal/Portion, 0 Ausreisser) |
| `e12a/BELEGE.md` | Vollständige Belegtabelle aller 144 Lebensmittel und 195 Rezepte inkl. Quellen, Status, Näherungen und offener Prüfpunkte |

Automatische Prüfung über `tests/unit/e12a.evidence.test.ts` (`pnpm test`): prüft die unveränderte 55+5-Basis, alle 98 CH-NWD-Einträge zellenweise gegen `quelle/Schweizer_Nahrwertdatenbank_V7.1.xlsx` (inkl. SHA-256), alle 199 Lebensmittel + 200 Rezepte gegen das unveränderte `validateContentBundle`, alle 390 Quellen-URLs gegen `isSafeHttpsUrl`, die Vollständigkeit von `e12a/BELEGE.md` sowie Negativtests.

