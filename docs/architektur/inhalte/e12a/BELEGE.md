# Nährwert- und Quellenbelege (Paket E12a, Issue #46)

- **Basis-Commit (`main`):** `10c3b7bb67b14e9cae0c03c2574c11768297fbb6`
- **Prototyp-Referenz:** Branch `prototype/lang-switcher`, Commit `93630aa` (Katalog v5.11)
- **Unveränderte Basis auf `main`:** 55 Lebensmittel in `content/foods/foods.json`, 5 Rezepte unter `content/recipes/`
- **Primärquelle 1 (Vorrang):** Schweizer Nährwertdatenbank V 7.1 (`docs/architektur/inhalte/quelle/Schweizer_Nahrwertdatenbank_V7.1.xlsx`, SHA-256 `f4bb854944ef811f9b8463984389f8121e73278c4fd24fc3e8d16336cb711270`)
- **Primärquelle 2 (nur wenn in CH-NWD V7.1 fehlend):** USDA FoodData Central SR Legacy 2018-04 (Public Domain / CC0; Salz berechnet als Natrium [mg] × 2,5 / 1'000 gemäss EU-LMIV 1169/2011; Kohlenhydrate in USDA als `Carbohydrate, by difference` statt verfügbarer KH wie in CH-NWD)
- **Grundsatz (ADR-005 & Entscheid 25.11.2026):** Keine geschätzten oder erfundenen Nährwerte. Fehlende Quellenwerte bleiben `null` und tragen `status: "zu_pruefen"`; betroffene Rezepte tragen `nutritionPerServing.isMinimum: true` und listen Lücken in `notIncluded`.

## Zusammenfassung

- **Neue Lebensmittel (`foods-ext.json`):** 144 (disjunkt zu den 55 bestehenden IDs auf `main`; ungenutzter Altschlüssel `nuts` aus `foods.txt` nicht enthalten)
  - `CH-NWD` V7.1: **98** (davon 85 `ok`, 13 `zu_pruefen` wegen einzelner fehlender Zellen oder Näherung)
  - `USDA` SR Legacy 2018-04: **40** (davon 31 `ok`, 9 `zu_pruefen` wegen einzelner fehlender Zellen oder Näherung)
  - Ohne generische Quellenzeile (`per100g: null`, `source: null`, `status: "zu_pruefen"`): **6** (`acai_pulp`, `aji_amarillo`, `garam_masala`, `gochujang`, `halloumi`, `sambal_oelek`)
  - Gesamtstatus: **116** `ok`, **28** `zu_pruefen` (davon 16 mit einzelnen `null`-Nährstoffen in der Primärquelle, 6 explizite Näherungen `proxy: true`, 6 ohne Primärzeile)
- **Neue Rezepte (`recipes-ext.json`):** 195 (disjunkt zu den 5 bestehenden Rezepten auf `main`)
  - Jedes Rezept mit mindestens 2 gültigen `https:`-Quellen-URLs ohne Benutzerdaten (`isSafeHttpsUrl`, keine Betty-Bossi-Quellen, keine Texte kopiert)
  - `nutritionPerServing` vollständig aus `grams × per100g` der 55 bestehenden + 144 neuen Lebensmittel berechnet; Spannweite **141–746 kcal/Portion** (0 Ausreisser ausserhalb 100–1'200 kcal)
  - Rezepte mit `isMinimum: true`: **154** (überwiegend wegen der unveränderten 12 `zu_pruefen`-Lebensmittel auf `main` wie `black_pepper`, `lime`, `spring_onion`, `coriander_fresh`, `cumin`, `fish_sauce` sowie der 6 fehlenden E12a-Spezialzutaten und einzelner `k.A.`-Zellen)

## Lebensmittel-Belege (144 neue Einträge)

| Food-ID | Gruppe | DB | Version | ref | Quellenname | Status | Proxy |
|---|---|---|---|---|---|---|---|
| `acai_pulp` | `fruit` | – | – | – | nicht in CH-NWD/USDA (generisch) | `zu_pruefen` | nein |
| `aji_amarillo` | `spice` | – | – | – | nicht in CH-NWD/USDA (generisch) | `zu_pruefen` | nein |
| `almonds` | `pantry` | CH-NWD | 7.1 | 273 | Mandel | `ok` | nein |
| `avocado` | `veg` | CH-NWD | 7.1 | 380 | Avocado, roh | `ok` | nein |
| `baking_powder` | `pantry` | USDA | SR Legacy 2018-04 | 172804 | Leavening agents, baking powder, double-acting, straight phosphate | `ok` | nein |
| `balsamic` | `pantry` | CH-NWD | 7.1 | 13455 | Balsamicoessig | `zu_pruefen` | nein |
| `basil_fresh` | `spice` | CH-NWD | 7.1 | 464 | Basilikum, roh | `ok` | nein |
| `basmati_rice` | `pantry` | CH-NWD | 7.1 | 427 | Reis poliert, trocken | `ok` | nein |
| `beef_mince_lean` | `meat` | CH-NWD | 7.1 | 6 | Rind, Gehacktes, mager, roh | `ok` | nein |
| `beef_steak` | `meat` | CH-NWD | 7.1 | 1103 | Rindfleisch (Durchschnitt exkl. Innereien, Rippensteak), roh | `ok` | nein |
| `beef_stew` | `meat` | CH-NWD | 7.1 | 38 | Rind, Voressen, roh | `ok` | nein |
| `black_beans` | `pantry` | USDA | SR Legacy 2018-04 | 173735 | Beans, black, mature seeds, cooked, boiled, without salt | `ok` | nein |
| `bresaola` | `meat` | CH-NWD | 7.1 | 705 | Bresaola | `zu_pruefen` | nein |
| `brown_rice` | `pantry` | CH-NWD | 7.1 | 428 | Reis unpoliert, trocken | `ok` | nein |
| `buckwheat_flour` | `pantry` | CH-NWD | 7.1 | 420 | Buchweizenmehl | `ok` | nein |
| `bulgur` | `pantry` | USDA | SR Legacy 2018-04 | 170688 | Bulgur, dry | `ok` | nein |
| `bundnerfleisch` | `meat` | CH-NWD | 7.1 | 709 | Trockenfleisch | `ok` | nein |
| `carrot` | `veg` | CH-NWD | 7.1 | 355 | Karotte, roh | `ok` | nein |
| `cassava` | `veg` | CH-NWD | 7.1 | 13918 | Maniok, Wurzelknolle, roh | `ok` | nein |
| `celery` | `veg` | CH-NWD | 7.1 | 366 | Stangensellerie, roh | `ok` | nein |
| `cherry_tomatoes` | `veg` | CH-NWD | 7.1 | 348 | Tomate, roh | `ok` | nein |
| `chia_seeds` | `pantry` | CH-NWD | 7.1 | 13457 | Chia-Samen | `ok` | nein |
| `chicken_broth` | `pantry` | CH-NWD | 7.1 | 665 | Bouillon, Geflügel, zubereitet | `zu_pruefen` | nein |
| `chicken_thigh` | `meat` | CH-NWD | 7.1 | 26 | Poulet, Schenkel, ohne Haut, roh | `ok` | nein |
| `chickpea_flour` | `pantry` | USDA | SR Legacy 2018-04 | 174288 | Chickpea flour (besan) | `ok` | nein |
| `chili_flakes` | `spice` | USDA | SR Legacy 2018-04 | 170932 | Spices, pepper, red or cayenne | `ok` | nein |
| `chili_fresh` | `veg` | USDA | SR Legacy 2018-04 | 170106 | Peppers, hot chili, red, raw | `ok` | nein |
| `chives` | `spice` | CH-NWD | 7.1 | 374 | Schnittlauch, roh | `ok` | nein |
| `chorizo` | `meat` | USDA | SR Legacy 2018-04 | 173859 | Sausage, pork, chorizo, link or ground, raw | `ok` | nein |
| `cinnamon_ground` | `spice` | CH-NWD | 7.1 | 911 | Zimt | `ok` | nein |
| `cocoa_powder` | `pantry` | CH-NWD | 7.1 | 978 | Kakaopulver, entölt, ohne Zucker | `ok` | nein |
| `cod` | `fish` | CH-NWD | 7.1 | 285 | Dorsch, roh | `ok` | nein |
| `cooking_cream` | `dairy` | CH-NWD | 7.1 | 69 | Kaffeerahm | `ok` | nein |
| `corn_tortilla` | `bakery` | USDA | SR Legacy 2018-04 | 175036 | Tortillas, ready-to-bake or -fry, corn | `ok` | nein |
| `cornstarch` | `pantry` | CH-NWD | 7.1 | 426 | Maisstärke | `zu_pruefen` | nein |
| `cottage_cheese` | `dairy` | CH-NWD | 7.1 | 505 | Hüttenkäse, nature | `ok` | nein |
| `couscous` | `pantry` | USDA | SR Legacy 2018-04 | 169699 | Couscous, dry | `zu_pruefen` | nein |
| `cream_cheese_light` | `dairy` | USDA | SR Legacy 2018-04 | 169079 | Cheese, cream, low fat | `ok` | nein |
| `crispbread` | `bakery` | CH-NWD | 7.1 | 918 | Knäckebrot, Vollkorn | `ok` | nein |
| `dates` | `fruit` | CH-NWD | 7.1 | 384 | Dattel, getrocknet | `ok` | nein |
| `dende_oil` | `pantry` | CH-NWD | 7.1 | 708 | Palmöl - Palmfett | `ok` | nein |
| `dijon_mustard` | `pantry` | CH-NWD | 7.1 | 13464 | Senf | `ok` | nein |
| `dill` | `spice` | USDA | SR Legacy 2018-04 | 172233 | Dill weed, fresh | `zu_pruefen` | nein |
| `edamame` | `veg` | CH-NWD | 7.1 | 14160 | Edamame (unreife Sojabohne), geschält, gefroren | `ok` | nein |
| `feta` | `dairy` | CH-NWD | 7.1 | 549 | Käse in Salzlake (Schaf- und Ziegenmilch) | `zu_pruefen` | nein |
| `flocao` | `pantry` | CH-NWD | 7.1 | 425 | Maisgriess, trocken | `zu_pruefen` | ja |
| `garam_masala` | `spice` | – | – | – | nicht in CH-NWD/USDA (generisch) | `zu_pruefen` | nein |
| `gochujang` | `pantry` | – | – | – | nicht in CH-NWD/USDA (generisch) | `zu_pruefen` | nein |
| `greek_yogurt` | `dairy` | USDA | SR Legacy 2018-04 | 170903 | Yogurt, Greek, plain, lowfat | `ok` | nein |
| `green_beans` | `veg` | CH-NWD | 7.1 | 353 | Bohne, grün, roh | `ok` | nein |
| `green_bell_pepper` | `veg` | CH-NWD | 7.1 | 359 | Peperoni, grün, roh | `ok` | nein |
| `green_lentils` | `pantry` | CH-NWD | 7.1 | 370 | Linse, ganz, getrocknet | `ok` | nein |
| `halloumi` | `dairy` | – | – | – | nicht in CH-NWD/USDA (generisch) | `zu_pruefen` | nein |
| `ham_cooked` | `meat` | CH-NWD | 7.1 | 691 | Hinterschinken | `ok` | nein |
| `kale` | `veg` | CH-NWD | 7.1 | 13400 | Federkohl, roh | `ok` | nein |
| `kidney_beans` | `pantry` | USDA | SR Legacy 2018-04 | 174285 | Beans, kidney, red, mature seeds, canned, drained solids | `ok` | nein |
| `kimchi` | `veg` | USDA | SR Legacy 2018-04 | 170392 | Cabbage, kimchi | `ok` | nein |
| `kiwi` | `fruit` | CH-NWD | 7.1 | 395 | Kiwi, roh | `ok` | nein |
| `leek` | `veg` | CH-NWD | 7.1 | 358 | Lauch, roh | `ok` | nein |
| `lemongrass` | `spice` | USDA | SR Legacy 2018-04 | 168573 | Lemon grass (citronella), raw | `zu_pruefen` | nein |
| `mackerel` | `fish` | USDA | SR Legacy 2018-04 | 175119 | Fish, mackerel, Atlantic, raw | `ok` | nein |
| `mango` | `fruit` | CH-NWD | 7.1 | 396 | Mango, roh | `ok` | nein |
| `maple_syrup` | `pantry` | CH-NWD | 7.1 | 14093 | Ahornsirup | `ok` | nein |
| `milk_skimmed` | `dairy` | CH-NWD | 7.1 | 64 | Magermilch, UHT | `ok` | nein |
| `mint_fresh` | `spice` | CH-NWD | 7.1 | 463 | Pfefferminze, roh | `ok` | nein |
| `miso_paste` | `pantry` | USDA | SR Legacy 2018-04 | 172442 | Miso | `ok` | nein |
| `mozzarella` | `dairy` | CH-NWD | 7.1 | 82 | Mozzarella | `ok` | nein |
| `mung_dal` | `pantry` | USDA | SR Legacy 2018-04 | 174256 | Mung beans, mature seeds, raw | `ok` | nein |
| `mushrooms` | `veg` | CH-NWD | 7.1 | 375 | Champignon, roh | `ok` | nein |
| `mussels` | `fish` | CH-NWD | 7.1 | 761 | Miesmuschel, roh | `zu_pruefen` | nein |
| `nori` | `pantry` | CH-NWD | 7.1 | 13466 | Alge, Nori, getrocknet | `ok` | nein |
| `olives` | `pantry` | CH-NWD | 7.1 | 493 | Olive, schwarz | `ok` | nein |
| `orange` | `fruit` | CH-NWD | 7.1 | 405 | Orange, roh | `ok` | nein |
| `oregano_dried` | `spice` | USDA | SR Legacy 2018-04 | 171328 | Spices, oregano, dried | `ok` | nein |
| `oyster_sauce` | `pantry` | USDA | SR Legacy 2018-04 | 174529 | Sauce, oyster, ready-to-serve | `ok` | nein |
| `pak_choi` | `veg` | USDA | SR Legacy 2018-04 | 170390 | Cabbage, chinese (pak-choi), raw | `ok` | nein |
| `paneer` | `dairy` | USDA | SR Legacy 2018-04 | 172223 | Cheese, fresh, queso fresco | `zu_pruefen` | ja |
| `paprika` | `spice` | CH-NWD | 7.1 | 663 | Paprika (Gewürz) | `ok` | nein |
| `parmesan` | `dairy` | CH-NWD | 7.1 | 482 | Parmesan | `zu_pruefen` | nein |
| `parsley` | `spice` | CH-NWD | 7.1 | 373 | Petersilie, roh | `ok` | nein |
| `passata` | `pantry` | USDA | SR Legacy 2018-04 | 170460 | Tomato products, canned, puree, without salt added | `ok` | nein |
| `peanut_butter` | `pantry` | CH-NWD | 7.1 | 751 | Erdnussbutter | `ok` | nein |
| `peanuts` | `pantry` | CH-NWD | 7.1 | 14238 | Erdnuss, geröstet, ohne Salz | `ok` | nein |
| `pear` | `fruit` | CH-NWD | 7.1 | 382 | Birne, roh | `ok` | nein |
| `pearl_barley` | `pantry` | CH-NWD | 7.1 | 429 | Rollgerste | `ok` | nein |
| `peas` | `veg` | CH-NWD | 7.1 | 14219 | Erbse, grün, tiefgekühlt | `ok` | nein |
| `pineapple` | `fruit` | CH-NWD | 7.1 | 377 | Ananas, roh | `ok` | nein |
| `pita` | `bakery` | USDA | SR Legacy 2018-04 | 174916 | Bread, pita, whole-wheat | `ok` | nein |
| `polenta` | `pantry` | CH-NWD | 7.1 | 425 | Maisgriess, trocken | `ok` | nein |
| `pork_mince_lean` | `meat` | CH-NWD | 7.1 | 7 | Schwein, Gehacktes, roh | `ok` | nein |
| `pork_tenderloin` | `meat` | CH-NWD | 7.1 | 677 | Schwein, Filet, roh | `ok` | nein |
| `pumpkin` | `veg` | CH-NWD | 7.1 | 480 | Kürbis, roh | `ok` | nein |
| `pumpkin_seeds` | `pantry` | CH-NWD | 7.1 | 276 | Kürbiskerne | `ok` | nein |
| `quark_lowfat` | `dairy` | CH-NWD | 7.1 | 71 | Quark, nature, mager | `ok` | nein |
| `queijo_minas` | `dairy` | USDA | SR Legacy 2018-04 | 172223 | Cheese, fresh, queso fresco | `zu_pruefen` | ja |
| `radish` | `veg` | CH-NWD | 7.1 | 456 | Radieschen, roh | `ok` | nein |
| `red_cabbage` | `veg` | CH-NWD | 7.1 | 364 | Rotkohl, roh | `ok` | nein |
| `red_onion` | `veg` | CH-NWD | 7.1 | 368 | Zwiebel, roh | `ok` | nein |
| `rice_cakes` | `bakery` | CH-NWD | 7.1 | 802 | Vollkornreiswaffel | `ok` | nein |
| `rice_vinegar` | `pantry` | CH-NWD | 7.1 | 1693 | Essig | `zu_pruefen` | ja |
| `ricotta` | `dairy` | USDA | SR Legacy 2018-04 | 170851 | Cheese, ricotta, whole milk | `ok` | nein |
| `risotto_rice` | `pantry` | CH-NWD | 7.1 | 427 | Reis poliert, trocken | `ok` | nein |
| `rocket` | `veg` | CH-NWD | 7.1 | 468 | Rucola, roh | `ok` | nein |
| `saffron` | `spice` | USDA | SR Legacy 2018-04 | 170934 | Spices, saffron | `zu_pruefen` | nein |
| `salt_cod` | `fish` | CH-NWD | 7.1 | 285 | Dorsch, roh | `zu_pruefen` | ja |
| `sambal_oelek` | `spice` | – | – | – | nicht in CH-NWD/USDA (generisch) | `zu_pruefen` | nein |
| `sea_bass` | `fish` | USDA | SR Legacy 2018-04 | 175142 | Fish, sea bass, mixed species, raw | `ok` | nein |
| `sesame_oil` | `pantry` | CH-NWD | 7.1 | 14107 | Sesamöl | `ok` | nein |
| `sesame_seeds` | `pantry` | CH-NWD | 7.1 | 280 | Sesamsamen ungeschält | `ok` | nein |
| `shallot` | `veg` | CH-NWD | 7.1 | 14281 | Schalotte, roh | `zu_pruefen` | nein |
| `shiitake` | `veg` | USDA | SR Legacy 2018-04 | 169242 | Mushrooms, shiitake, raw | `zu_pruefen` | nein |
| `shrimp` | `fish` | CH-NWD | 7.1 | 766 | Garnele, geschält, roh (frisch oder tiefgekuhlt) | `ok` | nein |
| `silken_tofu` | `pantry` | CH-NWD | 7.1 | 13438 | Tofu, seidig (weich), nature | `ok` | nein |
| `skyr` | `dairy` | CH-NWD | 7.1 | 71 | Quark, nature, mager | `zu_pruefen` | ja |
| `smoked_salmon` | `fish` | CH-NWD | 7.1 | 193 | Lachs, geräuchert | `ok` | nein |
| `soba_noodles` | `pantry` | USDA | SR Legacy 2018-04 | 168906 | Noodles, japanese, soba, dry | `zu_pruefen` | nein |
| `soy_milk` | `drinks` | CH-NWD | 7.1 | 72 | Sojagetränk, nature | `ok` | nein |
| `soy_sauce` | `pantry` | CH-NWD | 7.1 | 13456 | Sojasauce | `ok` | nein |
| `soy_yogurt` | `dairy` | CH-NWD | 7.1 | 13451 | Joghurtalternative aus Soja, nature | `ok` | nein |
| `sushi_rice` | `pantry` | CH-NWD | 7.1 | 427 | Reis poliert, trocken | `ok` | nein |
| `sweet_potato` | `veg` | CH-NWD | 7.1 | 13406 | Süsskartoffel, roh | `ok` | nein |
| `sweetcorn` | `veg` | CH-NWD | 7.1 | 632 | Zuckermais (Konserve) | `ok` | nein |
| `tahini` | `pantry` | USDA | SR Legacy 2018-04 | 170189 | Seeds, sesame butter, tahini, from roasted and toasted kernels (most common type) | `ok` | nein |
| `tapioca_starch` | `pantry` | USDA | SR Legacy 2018-04 | 169717 | Tapioca, pearl, dry | `ok` | nein |
| `tempeh` | `pantry` | CH-NWD | 7.1 | 14251 | Tempeh, nature | `ok` | nein |
| `thyme_dried` | `spice` | USDA | SR Legacy 2018-04 | 170938 | Spices, thyme, dried | `ok` | nein |
| `tofu_firm` | `pantry` | CH-NWD | 7.1 | 13437 | Tofu, fest, nature (Durchschnitt) | `zu_pruefen` | nein |
| `tomato_paste` | `pantry` | CH-NWD | 7.1 | 636 | Tomatenpüree | `ok` | nein |
| `trout_smoked` | `fish` | CH-NWD | 7.1 | 13976 | Forelle, geräuchert | `ok` | nein |
| `tuna_canned` | `fish` | CH-NWD | 7.1 | 417 | Thon im Wasser, abgetropft | `ok` | nein |
| `turkey_breast` | `meat` | CH-NWD | 7.1 | 713 | Truthahn, Brust, Schnitzel oder Geschnetzeltes, roh | `ok` | nein |
| `turkey_mince` | `meat` | USDA | SR Legacy 2018-04 | 172850 | Turkey, ground, 93% lean, 7% fat, raw | `ok` | nein |
| `turmeric` | `spice` | USDA | SR Legacy 2018-04 | 172231 | Spices, turmeric, ground | `ok` | nein |
| `vanilla_extract` | `spice` | USDA | SR Legacy 2018-04 | 173471 | Vanilla extract | `ok` | nein |
| `walnuts` | `pantry` | CH-NWD | 7.1 | 271 | Baumnuss | `ok` | nein |
| `whey_protein` | `pantry` | USDA | SR Legacy 2018-04 | 173180 | Beverages, Protein powder whey based | `ok` | nein |
| `white_beans` | `pantry` | USDA | SR Legacy 2018-04 | 175204 | Beans, white, mature seeds, canned | `ok` | nein |
| `white_cabbage` | `veg` | CH-NWD | 7.1 | 453 | Weisskohl, roh | `ok` | nein |
| `white_wine_vinegar` | `pantry` | CH-NWD | 7.1 | 1693 | Essig | `ok` | nein |
| `whitefish` | `fish` | CH-NWD | 7.1 | 211 | Felche, roh | `ok` | nein |
| `whole_wheat_tortilla` | `bakery` | USDA | SR Legacy 2018-04 | 174081 | Tortillas, ready-to-bake or -fry, whole wheat | `ok` | nein |
| `wholewheat_flour` | `pantry` | CH-NWD | 7.1 | 206 | Weizenmehl, Vollkorn, Typ 1700 | `ok` | nein |
| `yellow_bell_pepper` | `veg` | USDA | SR Legacy 2018-04 | 169383 | Peppers, sweet, yellow, raw | `zu_pruefen` | nein |
| `zucchini` | `veg` | CH-NWD | 7.1 | 367 | Zucchetti, roh | `ok` | nein |

## Rezept-Quellenbelege (195 neue Rezepte)

| Rezept-ID | Mahlzeit | Küche | kcal/Port. | Min. | Quellen (≥ 2 HTTPS) |
|---|---|---|---|---|---|
| `quinoa_pan` | `dinner` | `mediterranean` | 691 | ja | https://www.easycheesyvegetarian.com/garlicky-quinoa-bowls-broccoli-chickpeas/ ; https://cassclaycooking.com/roasted-chickpeas-broccoli-and-quinoa-buddha-bowl/ |
| `summer_rolls` | `lunch` | `vietnamese` | 273 | ja | https://healthynibblesandbits.com/fresh-vietnamese-spring-rolls-with-video/ ; https://andrewzimmern.com/recipes/vietnamese-shrimp-summer-rolls/ |
| `yogurt_bowl` | `snack` | `european` | 229 | nein | https://www.daisybeet.com/fruit-granola-greek-yogurt-breakfast-bowls/ ; https://usa.fage/recipes/greek-yogurt-recipes/mixed-berry-yogurt-bowl |
| `scrambled_eggs` | `breakfast` | `european` | 354 | ja | https://www.recipetineats.com/scrambled-eggs/ ; https://www.warburtons.co.uk/recipes/scrambled-egg-on-toast/ |
| `chicken_bowl` | `lunch` | `japanese` | 535 | ja | https://japanesecooking101.com/teriyaki-chicken-bowl-recipe/ ; https://www.foodiecrush.com/teriyaki-chicken-rice-bowls/ |
| `mushroom_polenta` | `dinner` | `italian` | 460 | ja | https://www.crowdedkitchen.com/creamy-polenta-with-mushrooms/ ; https://ottolenghi.co.uk/pages/recipes/mushroom-herb-polenta |
| `hummus_wrap` | `lunch` | `middle_eastern` | 378 | ja | https://kristineskitchenblog.com/veggie-wrap/ ; https://www.bowlofdelicious.com/versatile-veggie-wraps/ |
| `miso_salmon` | `dinner` | `japanese` | 614 | ja | https://www.justonecookbook.com/miso-salmon/ ; https://www.recipetineats.com/miso-marinated-side-of-salmon/ |
| `shakshuka` | `breakfast` | `middle_eastern` | 449 | ja | https://www.bbcgoodfood.com/recipes/shakshuka ; https://www.recipetineats.com/shakshuka-baked-eggs/ |
| `burrito_bowl` | `lunch` | `mexican` | 550 | ja | https://www.urbanfoodiekitchen.com/chicken-burrito-bowl/ ; https://ohsweetbasil.com/mexican-chicken-burrito-bowl/ |
| `skyr_berry_bowl` | `breakfast` | `nordic` | 393 | nein | https://mallorythedietitian.com/skyr-bowl/ ; https://equal.house/recipes/icelandic-skyr-bowl-with-berries-and-oats/ |
| `quark_bircher` | `breakfast` | `swiss` | 378 | nein | https://orlawalshnutrition.ie/high-protein-bircher-museli/ ; https://vlhhealth.com/high-protein-bircher-muesli/ |
| `cottage_tomato_toast` | `breakfast` | `european` | 400 | ja | https://www.thekitchn.com/cottage-cheese-tomato-toast-recipe-review-23838156 ; https://foodfamilyfriends.com/2022/09/30/cottage-cheese-and-tomato-toast/ |
| `overnight_oats_quark` | `breakfast` | `american` | 379 | nein | https://www.karlijnskitchen.com/en/3x-oatmeal-breakfast/ ; https://metromode.se/en/mat-och-dryck/overnight-oats-med-kvarg-fyra-smaker-att-forbereda-pa-sondagen/ |
| `veggie_omelette` | `breakfast` | `french` | 346 | ja | https://bakedbree.com/veggie-omelette-recipe ; https://www.sweetashoney.co/spinach-omelette/ |
| `spinach_feta_omelette` | `breakfast` | `greek` | 370 | ja | https://cheeseandsuch.com/spinach-and-feta-omelette/ ; https://themom100.com/recipe/spinach-feta-omelet/ |
| `cottage_zucchini_frittata` | `breakfast` | `italian` | 329 | ja | https://eggs.org.nz/recipes/zucchini-cottage-cheese-and-corn-baked-frittata/ ; https://cleananddelicious.com/crustless-cottage-cheese-frittata/ |
| `protein_pancakes` | `breakfast` | `american` | 336 | nein | https://www.bbcgoodfood.com/recipes/protein-pancakes-with-banana ; https://rachaelsgoodeats.com/high-protein-blender-banana-oat-pancakes/ |
| `tofu_scramble` | `breakfast` | `american` | 405 | ja | https://nutritionfacts.org/recipe/turmeric-tofu-scramble/ ; https://www.heynutritionlady.com/turmeric-tofu-scramble-2-ways/ |
| `huevos_rancheros` | `breakfast` | `mexican` | 436 | ja | https://www.foodnetwork.com/recipes/huevos-rancheros-with-quick-stewed-black-beans-12342933 ; https://www.tesco.com/recipes/en-GB/recipe/black-bean-huevos-rancheros |
| `smoked_salmon_bread` | `breakfast` | `nordic` | 375 | ja | https://www.waitrose.com/ecom/recipe/rye-with-smoked-salmon-cream-cheese ; https://www.foodnetwork.com/fnk/recipes/open-rye-sandwich-with-smoked-salmon-herb-cream-cheese-and-radishes-8134035 |
| `tapioca_egg_cheese` | `breakfast` | `brazilian` | 417 | nein | https://easybrazilianfood.com/brazilian-breakfast-tapiocas/ ; https://thesantoscookbook.com/2024/01/01/traditional-brazilian-tapioca-crepes/ |
| `cuscuz_egg` | `breakfast` | `brazilian` | 436 | nein | https://www.saborbrasil.it/en/cuscuz-nordestino-brazilian-couscous-from-the-northeast-region/ ; https://mybrazil.co.uk/recipes/cuscuz-nordestino |
| `acai_skyr_bowl` | `breakfast` | `brazilian` | 390 | ja | https://www.usdairy.com/recipes/homemade-acai-bowl ; https://www.nourishandtempt.com/breakfast-acai-bowl/ |
| `japanese_salmon_breakfast` | `breakfast` | `japanese` | 468 | ja | https://sudachirecipes.com/japanese-salted-salmon-shiozake/ ; https://www.justonecookbook.com/how-to-cook-salmon-salted-salmon/ |
| `tamagoyaki_edamame` | `breakfast` | `japanese` | 431 | nein | https://www.justonecookbook.com/tamagoyaki-japanese-rolled-omelette/ ; https://www.waitrose.com/ecom/recipe/tamagoyaki-japanese-rolled-omelette |
| `chicken_congee` | `breakfast` | `chinese` | 361 | ja | https://makan.ch/recipe/chicken-congee-chicken-rice-porridge ; https://panlasangpinoy.com/chicken-congee-recipe/ |
| `menemen` | `breakfast` | `middle_eastern` | 410 | ja | https://downshiftology.com/recipes/menemen/ ; https://www.theguardian.com/food/2023/may/24/how-to-cook-the-perfect-menemen-recipe-turkish-eggs-breakfast-peppers-felicity-cloake |
| `greek_yogurt_walnut` | `breakfast` | `greek` | 358 | nein | https://realgreekrecipes.com/greek-yogurt-with-honey-and-walnuts/ ; https://walnuts.org/recipe/greek-yogurt-with-walnuts-and-honey/ |
| `chia_skyr_mango` | `breakfast` | `european` | 346 | nein | https://www.threelittlechickpeas.com/mango-chia-pudding-with-yogurt/ ; https://www.jmbliving.com/blogs/blog/mango-yogurt-chia-seed-pudding |
| `ricotta_berry_toast` | `breakfast` | `italian` | 451 | nein | https://www.driscolls.com/Recipes/Ricotta-Toast-with-Berries-and-Honey-for-Kids ; https://www.shockinglydelicious.com/breakfast-toast-with-ricotta-berries-lemon-and-honey/ |
| `veggie_egg_muffins` | `breakfast` | `american` | 239 | ja | https://www.spendwithpennies.com/veggie-egg-muffins/ ; https://www.incredibleegg.org/recipe/veggie-loaded-egg-muffins/ |
| `breakfast_burrito` | `breakfast` | `mexican` | 451 | ja | https://recipes.heart.org/en/recipes/egg-avocado-and-black-bean-breakfast-burrito ; https://www.incredibleegg.org/recipe/spicy-black-bean-breakfast-burrito/ |
| `avocado_egg_toast` | `breakfast` | `american` | 478 | nein | https://www.bbcgoodfood.com/recipes/poached-eggs-smashed-avocado-tomatoes ; https://www.gordonramsayrestaurants.com/recipes/smashed-avocado-and-poached-eggs-on-toast/ |
| `quinoa_breakfast_porridge` | `breakfast` | `peruvian` | 401 | nein | https://www.goya.com/en/recipes/breakfast-quinoa-with-blueberries/ ; https://www.drink-milk.com/berry-quinoa-breakfast-bowls/ |
| `oat_porridge_quark` | `breakfast` | `swiss` | 447 | nein | https://avocadoskillet.com/high-protein-caramel-apple-oatmeal/ ; https://terianncarty.com/high-protein-apple-pie-baked-oatmeal/ |
| `rosti_fried_egg` | `breakfast` | `swiss` | 429 | ja | https://www.bbcgoodfood.com/recipes/potato-rosti-cakes-sage-leaves ; https://biggreenegg.com/blogs/recipes/rosti-with-bacon-fried-egg |
| `swiss_cottage_radish_bread` | `breakfast` | `swiss` | 397 | ja | https://thelavenderapron.com/cottage-cheese-and-radish-sandwich/ ; https://www.mecooks.com/breakfast/cottage-cheese-with-radish-and-chives/ |
| `bresaola_rocket_toast` | `breakfast` | `italian` | 407 | ja | https://filippoberio.co.uk/blogs/recipes/bresaola-with-rocket-and-parmesan ; https://primoli.it/en/bresaola-rocket-leaves-and-shaved-parmesan-cheese/ |
| `green_shakshuka` | `breakfast` | `middle_eastern` | 446 | ja | https://www.oliveandmango.com/green-shakshuka/ ; https://www.masterclass.com/articles/green-shakshuka-recipe-by-yotam-ottolenghi |
| `cilbir` | `breakfast` | `middle_eastern` | 351 | ja | https://www.nigella.com/recipes/turkish-eggs ; https://chatelaine.com/recipe/dinner/cilbir-turkish-eggs-and-yogurt/ |
| `gyeran_jjim` | `breakfast` | `korean` | 356 | ja | https://www.koreanbapsang.com/gyeranjjim-korean-steamed-eggs/ ; https://www.thekitchn.com/recipe-korean-style-steamed-egg-gyeran-jjimrecipes-167222 |
| `kimchi_scrambled_eggs` | `breakfast` | `korean` | 356 | ja | https://www.foodnetwork.com/fnk/recipes/kimchi-scrambled-eggs-on-toast-7151529 ; https://www.nonguiltypleasures.com/kimchi-scrambled-eggs/ |
| `crepioca_chicken` | `breakfast` | `brazilian` | 393 | nein | https://www.drbotezelli.com/recipes/tapioca-crepioca-with-chicken/ ; https://berryfit.ai/recipes/brazilian-tapioca |
| `buckwheat_galette` | `breakfast` | `french` | 353 | nein | https://www.bbcgoodfood.com/recipes/buckwheat-crepe-madames ; https://www.tastefrance.com/recipes/everyday-recipes/original-french-galette-complete |
| `berry_protein_smoothie` | `breakfast` | `european` | 338 | nein | https://realfoodwholelife.com/recipes/berry-protein-smoothie/ ; https://www.usdairy.com/recipes/protein-berry-smoothie |
| `skyr_apple_compote` | `breakfast` | `nordic` | 316 | nein | https://www.missallieskitchen.com/easy-apple-compote-parfait/ ; https://sweetkitchencravings.com/recipes/apple-compote/ |
| `spinach_egg_wrap` | `breakfast` | `european` | 410 | ja | https://www.thekitchn.com/recipe-spinach-feta-breakfast-wraps-recipes-from-the-kitchn-210526 ; https://www.cookincanuck.com/scrambled-egg-wrap-recipe-spinach-tomato-feta-cheese/ |
| `silken_tofu_smoothie` | `breakfast` | `european` | 380 | nein | https://www.theleangreenbean.com/silken-tofu-berry-smoothie/ ; https://www.cookforyourlife.org/recipes/blueberry-tofu-smoothie/ |
| `pb_banana_soy_oats` | `breakfast` | `american` | 512 | nein | https://ohsheglows.com/early-morning-peanut-butter-banana-oatmeal/ ; https://cadryskitchen.com/peanut-butter-banana-oatmeal/ |
| `moong_dal_chilla` | `breakfast` | `indian` | 299 | ja | https://www.indianhealthyrecipes.com/moong-dal-chilla/ ; https://trueindianspices.com.au/blogs/indian-recipes/moong-dal-chilla-recipe |
| `masala_omelette` | `breakfast` | `indian` | 393 | ja | https://maunikagowardhan.co.uk/cook-in-a-curry/spicy-masala-omelette-with-turmeric-onions/ ; https://www.tesco.com/recipes/en-GB/recipe/indian-masala-omelette |
| `greek_chicken_salad` | `lunch` | `greek` | 534 | ja | https://simply-delicious-food.com/greek-chicken-salad/ ; https://www.foodiecrush.com/greek-salad-with-chicken/ |
| `tuna_nicoise` | `lunch` | `french` | 412 | ja | https://www.bbcgoodfood.com/recipes/salade-nicoise ; https://www.recipetineats.com/nicoise-salad-french-salad-with-tuna/ |
| `quinoa_feta_salad` | `lunch` | `mediterranean` | 579 | ja | https://www.themediterraneandish.com/quinoa-salad/ ; https://www.gimmesomeoven.com/cucumber-quinoa-salad-recipe/ |
| `lentil_feta_salad` | `lunch` | `french` | 449 | ja | https://www.themediterraneandish.com/french-lentil-salad-recipe/ ; https://www.aline-made.com/french-lentil-salad/ |
| `chicken_caesar_light` | `lunch` | `american` | 377 | ja | https://www.bbcgoodfood.com/recipes/skinny-chicken-caesar-salad ; https://www.foodnetwork.com/recipes/food-network-kitchen/light-chicken-caesar-salad-recipe-2109886 |
| `turkey_veggie_wrap` | `lunch` | `american` | 333 | ja | https://www.melskitchencafe.com/turkey-avocado-veggie-wraps/ ; https://diet.mayoclinic.org/us/motivational-tips/recipe-collections/family-friendly/turkey-avocado-wrap/ |
| `salmon_poke` | `lunch` | `hawaiian` | 671 | ja | https://jeccachantilly.com/hawaiian-salmon-poke/ ; https://www.chewoutloud.com/salmon-poke-bowl/ |
| `tofu_poke` | `lunch` | `hawaiian` | 620 | ja | https://simple-veganista.com/tofu-poke-bowl-recipe/ ; https://www.hawaiianelectric.com/recipes/find-a-recipe/tofu-poke |
| `bibimbap` | `lunch` | `korean` | 541 | ja | https://www.recipetineats.com/bibimbap/ ; https://www.bbcgoodfood.com/recipes/korean-bibimbap |
| `chicken_shawarma_bowl` | `lunch` | `middle_eastern` | 521 | ja | https://simplehomeedit.com/recipe/chicken-shawarma-with-garlic-yoghurt-sauce/ ; https://cookingwithcurls.com/2025/04/10/chicken-shawarma-bowls/ |
| `baked_falafel_bowl` | `lunch` | `middle_eastern` | 585 | ja | https://www.mediterraneancleankitchen.com/recipes/baked-falafel-bowls ; https://www.notenoughcinnamon.com/baked-falafel-bowls-recipe/ |
| `chickpea_tuna_salad` | `lunch` | `mediterranean` | 365 | ja | https://wildplanetfoods.com/blogs/recipes/greek-chickpea-tuna-salad ; https://www.olivetomato.com/5-minute-mediterranean-chickpea-tuna-salad/ |
| `chicken_caprese_salad` | `lunch` | `italian` | 449 | ja | https://www.tasteofhome.com/recipes/caprese-chicken/ ; https://www.homechef.com/meals/caprese-chicken-salad-standard |
| `minestrone_beans` | `lunch` | `italian` | 483 | ja | https://www.bbcgoodfood.com/recipes/classic-minestrone-soup ; https://www.italiankitchenconfessions.com/classic-italian-minestron-soup/ |
| `bundner_barley_soup` | `lunch` | `swiss` | 424 | ja | https://www.aline-made.com/vegetable-barley-soup/ ; https://beinspired.au/recipes/swiss-barley-soup-gerstensuppe/ |
| `egg_salad_sandwich` | `lunch` | `european` | 418 | ja | https://www.bowlofdelicious.com/greek-yogurt-egg-salad-with-dill/ ; https://cleananddelicious.com/lightened-up-egg-salad-with-greek-yogurt/ |
| `black_bean_soup` | `lunch` | `mexican` | 505 | ja | https://www.bbcgoodfood.com/recipes/mexican-bean-soup-guacamole ; https://www.mexicanplease.com/mexican-black-bean-soup/ |
| `chicken_tortilla_soup` | `lunch` | `mexican` | 520 | ja | https://www.bbcgoodfood.com/recipes/mexican-chicken-tortilla-soup ; https://natashaskitchen.com/chicken-tortilla-soup-recipe/ |
| `beef_fajita_bowl` | `lunch` | `mexican` | 520 | ja | https://www.tesco.com/recipes/en-GB/recipe/fajita-rice-bowls ; https://www.oldelpaso.co.uk/recipes/beef-fajita-bowls/db845001-49f9-4903-a388-67c1323b6326 |
| `shrimp_tacos` | `lunch` | `mexican` | 428 | ja | https://www.isabeleats.com/grilled-shrimp-tacos-with-creamy-slaw/ ; https://www.oliveandmango.com/grilled-shrimp-tacos-with-cilantro-lime-slaw/ |
| `prato_feito` | `lunch` | `brazilian` | 578 | ja | https://ourbestbites.com/brazilian-style-black-beans-rice/ ; https://www.planmymeals.ai/brazilian-recipes/prato-feito-rice-beans-fried-egg-and-collards |
| `salpicao_frango` | `lunch` | `brazilian` | 364 | ja | https://easybrazilianfood.com/brazilian-chicken-salad-salpicao-de-frango/ ; https://braziliankitchenabroad.com/salpicao-brazilian-chicken-salad/ |
| `caldo_verde_beans` | `lunch` | `portuguese` | 489 | ja | https://honestcooking.com/caldo-verde-portuguese-kale-soup/ ; https://leitesculinaria.com/7580/recipes-portuguese-kale-soup-caldo-verde.html |
| `cold_soba_tofu` | `lunch` | `japanese` | 561 | ja | https://www.k33kitchen.com/recipes/cold-soba-noodles-tofu-sesame-sauce/ ; https://www.foodiecrush.com/sesame-soba-noodles/ |
| `oyakodon` | `lunch` | `japanese` | 543 | ja | https://winniesbalance.com/easy-chicken-oyakodon-chicken-egg-rice-bowl/ ; https://ironchefshellie.com/2024/08/17/oyakodon-chicken-and-egg-rice-bowl/ |
| `gyudon_light` | `lunch` | `japanese` | 459 | ja | https://www.justonecookbook.com/gyudon/ ; https://www.okawarirecipes.com/recipes/beef-bowl |
| `goi_ga` | `lunch` | `vietnamese` | 307 | ja | https://www.thekitchn.com/vietnamese-goi-ga-chicken-slaw-salad-23341327 ; https://delightfulplate.com/vietnamese-chicken-and-cabbage-salad/ |
| `banh_mi_bowl` | `lunch` | `vietnamese` | 450 | ja | https://www.spoonfulofflavor.com/banh-mi-rice-bowl/ ; https://recipes.lidl.co.uk/recipes/banh-mi-rice-bowl |
| `bun_chay_tofu` | `lunch` | `vietnamese` | 639 | ja | https://www.okonomikitchen.com/vietnamese-vermicelli-noodle-salad-with-tofu/ ; https://schoolnightvegan.com/home/bun-chay-vegan-vietnamese-noodle-salad/ |
| `yum_nua` | `lunch` | `thai` | 399 | ja | https://www.cookeatworld.com/thai-beef-salad/ ; https://www.foodiecrush.com/thai-beef-salad-yum-nua/ |
| `larb_gai` | `lunch` | `thai` | 392 | ja | https://hot-thai-kitchen.com/laab-gai/ ; https://www.bbcgoodfood.com/recipes/thai-minced-chicken-salad |
| `palak_dal` | `lunch` | `indian` | 523 | ja | https://www.indianhealthyrecipes.com/dal-palak-recipe/ ; https://www.twospoons.ca/dal-palak/ |
| `chana_masala` | `lunch` | `indian` | 590 | ja | https://glebekitchen.com/chana-masala/ ; https://mariasmenu.com/vegetarian/easy-chana-masala |
| `tandoori_chicken_salad` | `lunch` | `indian` | 388 | ja | https://www.usdairy.com/recipes/tandoori-grilled-chicken-and-fattoush-salad-with-greek-yogurt-dressing ; https://www.coles.com.au/recipes-inspiration/recipes/tandoori-chicken-and-cucumber-rice-salad |
| `paneer_tikka_wrap` | `lunch` | `indian` | 515 | ja | https://www.indianhealthyrecipes.com/paneer-kathi-roll/ ; https://www.bbcgoodfood.com/recipes/tandoori-paneer-wraps-green-chutney |
| `hot_sour_tofu_soup` | `lunch` | `chinese` | 404 | ja | https://woonheng.com/vegan-hot-and-sour-soup/ ; https://www.budgetbytes.com/hot-sour-vegetable-soup-with-tofu/ |
| `chicken_vegetable_soup` | `lunch` | `european` | 323 | ja | https://thecozycook.com/chicken-vegetable-soup/ ; https://detoxinista.com/classic-chicken-vegetable-soup/ |
| `tuna_pasta_salad` | `lunch` | `italian` | 471 | ja | https://www.thepetitecook.com/summer-italian-pasta-salad/ ; https://barefeetinthekitchen.com/mediterranean-tuna-pasta-salad/ |
| `tonno_fagioli` | `lunch` | `italian` | 490 | ja | https://www.themediterraneandish.com/tuna-white-bean-salad/ ; https://www.tastingtable.com/2099720/tonno-e-fagioli-italian-tuna-bean-salad-recipe/ |
| `halloumi_lentil_salad` | `lunch` | `mediterranean` | 310 | ja | https://www.sainsburys.co.uk/gol-ui/recipes/lemony-lentil-salad-with-griddled-halloumi ; https://simplebites.net/mediterranean-lentil-salad-with-halloumi/ |
| `gazpacho_shrimp` | `lunch` | `spanish` | 387 | nein | https://www.surlatable.com/recipe/grilled-shrimp-gazpacho/REC-315518 ; https://www.mythreeseasons.com/gazpacho-with-shrimp/ |
| `espinacas_garbanzos` | `lunch` | `spanish` | 604 | ja | https://simpleveganblog.com/spanish-spinach-with-chickpeas/ ; https://www.noshwithtash.com/food/recipe-2023-natasha-feldman-smoky-spanish-spinach-and-chickpeas-espinacas-con-garbanzos |
| `gado_gado` | `lunch` | `indonesian` | 518 | ja | https://www.lazycatkitchen.com/indonesian-gado-gado-salad/ ; https://justasdelish.com/gado-gado/ |
| `ceviche_sweet_potato` | `lunch` | `peruvian` | 326 | ja | https://goya.es/en/recipes/fish-ceviche-with-sweet-potato-peruvian-style ; https://thestarvingchefblog.com/peruvian-ceviche/ |
| `trout_potato_salad` | `lunch` | `nordic` | 394 | ja | https://www.feastingathome.com/nordic-nicoise-salad/ ; https://savorylotus.com/smoked-trout-salad/ |
| `skagen_toast` | `lunch` | `nordic` | 324 | ja | https://theeuropeandish.com/creamy-swedish-shrimp-salad-skagenrora/ ; https://recipheon.com/en/recipes/snacks/toast-skagen-swedish-toast-with-creamy-shrimp-and-dill |
| `edamame_quinoa_bowl` | `lunch` | `japanese` | 616 | ja | https://www.twopeasandtheirpod.com/quinoa-salad-with-edamame-cucumber-and-avocado/ ; https://www.walderwellness.com/quinoa-edamame-salad-with-miso-dressing/ |
| `harira` | `lunch` | `moroccan` | 419 | ja | https://www.veganricha.com/moroccan-harira/ ; https://www.feastingathome.com/harira-soup/ |
| `couscous_chicken_salad` | `lunch` | `moroccan` | 503 | ja | https://www.waitrose.com/ecom/recipe/moroccan-spiced-chicken-couscous-salad ; https://www.sprinklesandsprouts.com/moroccan-chicken-couscous-buddha-bowl/ |
| `zurich_geschnetzeltes` | `dinner` | `swiss` | 570 | ja | https://poeticroad.com/zurcher-geschnetzeltes/ ; https://vivikocht.ch/en/zuercher-geschnetzeltes/ |
| `whitefish_potatoes` | `dinner` | `swiss` | 416 | ja | https://cookingwithcocktailrings.com/pan-seared-white-fish/ ; https://www.thekitchn.com/recipe-lemon-herb-fish-fillets-on-crispy-potato-rafts-recipes-from-the-kitchn-217625 |
| `barley_risotto_chicken` | `dinner` | `swiss` | 571 | ja | https://www.bbcgoodfood.com/recipes/barley-chicken-mushroom-risotto ; https://www.tesco.com/recipes/en-GB/recipe/chicken-and-mushroom-pearl-barley-risotto |
| `alpler_magronen_light` | `dinner` | `swiss` | 636 | ja | https://poeticroad.com/alplermagronen-swiss-alpine-macaroni/ ; https://www.helvetickitchen.com/recipes/2015/8/23/alplermagarone |
| `beef_steak_vegetables` | `dinner` | `european` | 492 | ja | https://ahealthylifeforme.com/pan-seared-steak-recipe-with-vegetables/ ; https://canadabeef.ca/recipes/bistro-beef-steak-with-roasted-vegetables/ |
| `chicken_piccata` | `dinner` | `italian` | 540 | ja | https://www.recipetineats.com/chicken-piccata/ ; https://www.budgetbytes.com/chicken-piccata/ |
| `turkey_bolognese` | `dinner` | `italian` | 685 | ja | https://www.bbcgoodfood.com/recipes/low-fat-turkey-bolognese ; https://lexiscleankitchen.com/healthy-turkey-bolognese/ |
| `lentil_bolognese` | `dinner` | `italian` | 746 | ja | https://rainbowplantlife.com/10-ingredient-vegan-red-lentil-bolognese/ ; https://www.feastingathome.com/lentil-bolognese/ |
| `shrimp_garlic_pasta` | `dinner` | `italian` | 460 | nein | https://www.tasteofhome.com/recipes/garlic-lemon-shrimp-linguine/ ; https://therecipecritic.com/lemon-garlic-parmesan-shrimp-pasta/ |
| `baked_cod_tomatoes` | `dinner` | `mediterranean` | 408 | ja | https://foolproofliving.com/mediterranean-baked-cod/ ; https://www.themediterraneandish.com/baked-white-fish-recipe/ |
| `chicken_souvlaki` | `dinner` | `greek` | 518 | ja | https://www.recipetineats.com/chicken-souvlaki-tzatziki/ ; https://www.bbcgoodfood.com/recipes/chicken-gyros |
| `shrimp_saganaki` | `dinner` | `greek` | 496 | ja | https://miakouppa.com/shrimp-saganaki/ ; https://thegreekfoodie.com/greek-shrimp-bake-garides-saganaki/ |
| `baked_feta_chickpeas` | `dinner` | `greek` | 681 | ja | https://smittenkitchen.com/2021/02/baked-feta-with-tomatoes-and-chickpeas/ ; https://www.feastingathome.com/baked-feta-with-chickpeas/ |
| `chicken_tagine` | `dinner` | `moroccan` | 668 | ja | https://www.recipetineats.com/chicken-tagine/ ; https://www.mccormick.com/blogs/gourmet-recipes/spiced-chicken-tagine |
| `beef_kofta_yogurt` | `dinner` | `middle_eastern` | 523 | ja | https://www.recipetineats.com/smashed-beef-kofta-with-cucumber-yogurt-sauce/ ; https://www.passmesometasty.com/beef-kofta-with-greek-yogurt-sauce/ |
| `stuffed_peppers_turkey` | `dinner` | `european` | 603 | ja | https://momsdish.com/ground-turkey-stuffed-bell-peppers ; https://cookingformysoul.com/ground-turkey-stuffed-peppers/ |
| `chili_con_carne` | `dinner` | `mexican` | 664 | ja | https://www.recipetineats.com/chilli-con-carne/ ; https://www.jamieoliver.com/recipes/beef/good-old-chilli-con-carne/ |
| `chili_sin_carne` | `dinner` | `mexican` | 633 | ja | https://www.zuckerjagdwurst.com/en/recipes/vegan-chili-sin-carne ; https://biancazapatka.com/en/chili-sin-carne-with-rice-vegan/ |
| `chicken_fajitas` | `dinner` | `mexican` | 591 | ja | https://www.muydelish.com/chicken-fajitas/ ; https://sunbasket.com/recipe/new-mexican-chicken-fajitas-with-sweet-peppers-and-onion |
| `pescado_veracruzana` | `dinner` | `mexican` | 477 | ja | https://www.muydelish.com/pescado-veracruzana/ ; https://www.fromachefskitchen.com/baked-veracruz-style-fish/ |
| `moqueca` | `dinner` | `brazilian` | 562 | ja | https://www.feastingathome.com/brazilian-fish-stew-aka-moqueca/ ; https://www.goya.com/en/recipes/brazilian-fish-stew-moqueca/ |
| `picadinho` | `dinner` | `brazilian` | 469 | ja | https://www.easyanddelish.com/brazilian-beef-stew/ ; https://easybrazilianfood.com/beef-stew-stove-top-picadinho-with-beef-cubes/ |
| `feijoada_light` | `dinner` | `brazilian` | 676 | ja | https://www.daringgourmet.com/feijoada/ ; https://www.177milkstreet.com/stories/brazilian-black-bean-stew-with-pork-and-beef |
| `bobo_camarao` | `dinner` | `brazilian` | 527 | ja | https://brazilandco.se/blogs/recipes/bobo-de-camarao-brazilian-shrimp-stew ; https://thedomesticman.com/2018/08/21/bobo-de-camarao-brazilian-shrimp-stew/ |
| `galinhada` | `dinner` | `brazilian` | 599 | ja | https://texasdebrazil.com/recipes/brazilian-chicken-and-saffron-rice-galinhada/ ; https://www.gousto.co.uk/cookbook/recipes/one-pot-brazilian-chicken-saffron-rice |
| `bulgogi` | `dinner` | `korean` | 570 | ja | https://www.recipetineats.com/korean-beef-bowl-bulgogi-korean-bbq-beef/ ; https://themodernproper.com/korean-bbq-beef-with-cucumber-kimchi |
| `dakgalbi` | `dinner` | `korean` | 454 | ja | https://mykoreankitchen.com/dak-galbi/ ; https://tarasmulticulturaltable.com/dakgalbi-spicy-stir-fried-chicken/ |
| `sundubu_jjigae` | `dinner` | `korean` | 475 | ja | https://www.koreanbapsang.com/kimchi-soondubu-jjigae-soft-tofu-stew-kimchi/ ; https://www.cookerru.com/soondubu-jjigae/ |
| `kung_pao_chicken` | `dinner` | `chinese` | 596 | ja | https://www.recipetineats.com/kung-pao-chicken/ ; https://www.waitrose.com/ecom/recipe/kung-pao-chicken-with-peanuts |
| `mapo_tofu` | `dinner` | `chinese` | 698 | ja | https://www.recipetineats.com/mapo-tofu/ ; https://www.bbcgoodfood.com/recipes/mapo-tofu |
| `steamed_fish_ginger` | `dinner` | `chinese` | 448 | ja | https://www.madewithlau.com/recipes/steamed-fish-ginger-scallion ; https://alexandracooks.com/2019/03/28/chinese-style-steamed-whole-fish-with-ginger-and-scallions/ |
| `beef_broccoli` | `dinner` | `chinese` | 564 | ja | https://www.recipetineats.com/chinese-beef-and-broccoli-extra-saucy-take-out-style/ ; https://www.madewithlau.com/recipes/beef-broccoli |
| `teriyaki_tofu` | `dinner` | `japanese` | 653 | ja | https://www.daringgourmet.com/teriyaki-tofu/ ; https://www.recipetineats.com/sesame-crusted-tofu-steaks/ |
| `saba_shioyaki` | `dinner` | `japanese` | 606 | nein | https://www.justonecookbook.com/grilled-mackerel-saba-shioyaki/ ; https://www.sakanasg.com/blogs/reads/grilled-mackerel-saba-shioyaki-%E9%AF%96%E3%81%AE%E5%A1%A9%E7%84%BC%E3%81%8D |
| `japanese_chicken_curry` | `dinner` | `japanese` | 613 | ja | https://www.justonecookbook.com/simple-chicken-curry/ ; https://glebekitchen.com/japanese-chicken-curry-curry-rice/ |
| `green_curry_shrimp` | `dinner` | `thai` | 561 | ja | https://www.nourish-and-fete.com/thai-green-curry-with-shrimp/ ; https://fortheloveofgourmet.com/shrimp-green-curry-with-spring-vegetables/ |
| `pad_kra_pao` | `dinner` | `thai` | 529 | ja | https://hot-thai-kitchen.com/holy-basil-stir-fry/ ; https://glebekitchen.com/thai-basil-chicken-pad-kra-pao/ |
| `tom_yum_shrimp` | `dinner` | `thai` | 350 | ja | https://www.recipetineats.com/tom-yum-soup-thai/ ; https://www.foodiecrush.com/thai-shrimp-soup-tom-yum-goong/ |
| `pad_thai_chicken` | `dinner` | `thai` | 634 | ja | https://www.recipetineats.com/chicken-pad-thai/ ; https://www.bbcgoodfood.com/recipes/chicken-pad-thai |
| `ca_kho` | `dinner` | `vietnamese` | 426 | ja | https://delightfulplate.com/ca-kho-vietnamese-caramelized-fish/ ; https://food52.com/recipes/78340-vietnamese-caramelized-catfish-ca-kho-to |
| `ga_xao_sa_ot` | `dinner` | `vietnamese` | 557 | ja | https://delightfulplate.com/vietnamese-lemongrass-chicken-stir-fry-ga-xao-sa-ot/ ; https://www.hungryhuy.com/vietnamese-lemongrass-chicken/ |
| `tikka_masala_light` | `dinner` | `indian` | 611 | ja | https://www.bhf.org.uk/informationsupport/support/healthy-living/healthy-eating/recipe-finder/chicken-tikka-masala ; https://thehealthyfoodie.com/chicken-tikka-masala/ |
| `palak_paneer_light` | `dinner` | `indian` | 686 | ja | https://www.recipetineats.com/palak-paneer-indian-spinach-curry-with-cheese/ ; https://feastwithsafiya.com/palak-paneer-recipe-spinach-with-indian-cheese/ |
| `kerala_fish_curry` | `dinner` | `indian` | 582 | ja | https://meerasodha.com/recipes/coconut-fish-curry-from-my-book-made-in-india/ ; https://www.indianhealthyrecipes.com/kerala-meen-fish-curry/ |
| `rajma` | `dinner` | `indian` | 719 | ja | https://rainbowplantlife.com/rajma-masala/ ; https://www.bytheforkful.com/kidney-bean-curry-rajma-masala/ |
| `nasi_goreng` | `dinner` | `indonesian` | 543 | ja | https://www.recipetineats.com/nasi-goreng-indonesian-fried-rice/ ; https://www.kitchensanctuary.com/indonesian-fried-rice/ |
| `tempeh_stirfry` | `dinner` | `indonesian` | 615 | ja | https://www.cookmeindonesian.com/stir-fried-sliced-tempeh-vegan/ ; https://veggieanh.com/tempe-orek/ |
| `lomo_saltado` | `dinner` | `peruvian` | 458 | ja | https://www.eatperu.com/lomo-saltado-recipe/ ; https://www.oliveandmango.com/lomo-saltado-peruvian-beef-stir-fry/ |
| `aji_de_gallina_light` | `dinner` | `peruvian` | 652 | ja | https://www.eatperu.com/aji-de-gallina/ ; https://www.ourmodernkitchen.com/aji-de-gallina/ |
| `seafood_paella` | `dinner` | `spanish` | 576 | ja | https://food52.com/recipes/36023-seafood-paella ; https://applauseforthechef.com/spanish-seafood-paella-with-prawns-mussels/ |
| `pollo_al_ajillo` | `dinner` | `spanish` | 446 | ja | https://www.themediterraneandish.com/spanish-garlic-chicken-pollo-al-ajillo/ ; https://www.thespanishchef.com/recipes/chicken-garlic-pollo-ajillo/ |
| `bacalhau_grao` | `dinner` | `portuguese` | 566 | ja | https://leitesculinaria.com/7752/recipes-portuguese-chickpea-salad-with-salt-cod.html ; https://www.manusmenu.com/salada-de-bacalhau-e-grao |
| `frango_piri_piri` | `dinner` | `portuguese` | 462 | nein | https://www.nelsonoliveoil.ca/blogs/grilling-and-baking/portuguese-frango-piri-piri ; https://nelsoncarvalheiro.com/portuguese-piri-piri-chicken-recipe/ |
| `poulet_provencal` | `dinner` | `french` | 517 | ja | https://www.bbcgoodfood.com/recipes/chicken-provencal-olives-artichokes ; https://themodernproper.com/chicken-provencal |
| `ratatouille_white_beans` | `dinner` | `french` | 684 | ja | https://www.abelandcole.co.uk/recipes/ratatouille-with-white-beans-parsley-pistou ; https://sharonpalmer.com/ratatouille-with-white-beans-vegan-gluten-free/ |
| `salmon_puy_lentils` | `dinner` | `french` | 601 | ja | https://www.bbcgoodfood.com/recipes/puy-lentils-with-seared-salmon ; https://www.feastingathome.com/salmon-with-braised-french-lentils/ |
| `chicken_sweet_potato_traybake` | `dinner` | `american` | 514 | ja | https://www.bbcgoodfood.com/recipes/piri-piri-chicken-smashed-sweet-potatoes-broccoli ; https://therealfooddietitians.com/sweet-potato-broccoli-chicken-bake/ |
| `turkey_meatballs` | `dinner` | `italian` | 681 | ja | https://www.cookincanuck.com/italian-turkey-meatballs-in-tomato-sauce-recipe/ ; https://www.wellplated.com/baked-turkey-meatballs/ |
| `stuffed_sweet_potato` | `dinner` | `american` | 723 | ja | https://vanillaandbean.com/mexican-style-stuffed-sweet-potatoes/ ; https://www.heynutritionlady.com/loaded-sweet-potatoes/ |
| `cod_dill_mustard` | `dinner` | `nordic` | 419 | ja | https://dirndlkitchen.com/kabeljau-in-senfsose-cod-in-mustard-sauce/ ; https://vikalinka.com/cod-roasted-in-mustard-sauce/ |
| `cottage_pineapple` | `snack` | `european` | 303 | nein | https://www.tastyaz.com/cottage-cheese-with-pineapple/ ; https://www.trainaiapp.com/recipes/pineapple-cottage-cheese-bowl/ |
| `skyr_herb_dip` | `snack` | `nordic` | 163 | ja | https://www.arlafoods.co.uk/recipes/garlic-and-herb-dip/ ; https://www.icelandicprovisions.com/skyr-recipes/roasted-garlic-herb-skyr-dip/ |
| `roasted_chickpeas` | `snack` | `mediterranean` | 378 | ja | https://themodernproper.com/crispy-roasted-chickpeas ; https://food52.com/recipes/18482-crispy-roasted-chickpeas |
| `edamame_sea_salt` | `snack` | `japanese` | 327 | nein | https://simplegreensmoothies.com/how-to-make-edamame/ ; https://kitchendreaming.com/steamed-edamame-recipe/ |
| `hummus_veggie_sticks` | `snack` | `middle_eastern` | 314 | ja | https://www.bbcgoodfood.com/recipes/hummus-veg-sticks ; https://www.veganeasy.org/recipes/homemade-hummus-with-veggie-sticks/ |
| `eggs_cucumber` | `snack` | `european` | 222 | ja | https://www.cookincanuck.com/light-egg-salad-cucumber-boats-recipe/ ; https://www.egglandsbest.com/recipes/cucumber-dill-egg-salad |
| `banana_protein_shake` | `snack` | `european` | 358 | nein | https://wheyforliving.com/consumer/recipes/banana-protein-shake/ ; https://protealpes.com/en/recettes/smoothies/vanille-banane/ |
| `tuna_rice_cakes` | `snack` | `european` | 246 | ja | https://wildplanetfoods.com/blogs/recipes/spicy-tuna-rice-cakes ; https://flannerys.com.au/recipes/loaded-tuna-rice-cakes/ |
| `turkey_rollups` | `snack` | `american` | 203 | ja | https://www.savoryonline.com/recipes/turkey-and-veggie-cream-cheese-roll-ups/ ; https://weelicious.com/turkey-cucumber-roll-ups-recipe/ |
| `quark_berries` | `snack` | `swiss` | 199 | nein | https://www.happyveggiekitchen.com/quark-breakfast-bowls/ ; https://www.internationaldessertsblog.com/german-blackberry-dessert-quark/ |
| `protein_energy_balls` | `snack` | `american` | 246 | nein | https://www.gimmesomeoven.com/no-bake-energy-bites/ ; https://www.loveandlemons.com/energy-balls/ |
| `salmon_cucumber_bites` | `snack` | `nordic` | 212 | ja | https://bakerbynature.com/smoked-salmon-cream-cheese-cucumber-bites/ ; https://www.wholesomeyum.com/recipes/smoked-salmon-cucumber-bites/ |
| `tzatziki_pita` | `snack` | `greek` | 232 | ja | https://www.strongrootsnutrition.com/2013/12/tzatziki-cucumber-yogurt-dip-and-whole-wheat-pita-bread/ ; https://www.flourishingfoodie.com/blog/whole-wheat-pita-bread-and-tzatziki |
| `deviled_eggs_yogurt` | `snack` | `american` | 163 | nein | https://www.eatingbirdfood.com/healthy-deviled-eggs/ ; https://www.stonyfield.com/recipes/greek-yogurt-deviled-eggs/ |
| `sesame_tofu_bites` | `snack` | `japanese` | 302 | ja | https://www.loveandlemons.com/sesame-tofu-recipe/ ; https://meatfreemondays.com/recipes/crispy-ginger-sesame-tofu/ |
| `mozzarella_tomato_skewers` | `snack` | `italian` | 227 | ja | https://www.loveandlemons.com/caprese-skewers/ ; https://natashaskitchen.com/caprese-salad-skewers/ |
| `bresaola_rolls` | `snack` | `italian` | 216 | ja | https://www.granapadano.it/en-en/recipes/health-and-sport/bresaola-rolls-with-cream-cheese-and-grana-padano-pdo-lime/ ; https://www.giallozafferano.com/recipes/bresaola-and-cheese-cones.html |
| `soy_chia_pudding` | `snack` | `european` | 357 | nein | https://glow-diaries.com/vanilla-chia-pudding/ ; https://www.sweeterthanoats.com/how-to-make-one-step-healthy-chia-pudding/ |
| `apple_skyr_pb_dip` | `snack` | `american` | 273 | nein | https://foodhero.org/recipes/peanut-butter-yogurt-dip ; https://nutritiontofit.com/peanut-butter-yogurt-dip/ |
| `vitamina_banana` | `snack` | `brazilian` | 328 | nein | https://vicios-brasileiros.de/en/blogs/rezepte-kochtipps/vitamina-de-banana-brasilianischer-bananenshake-das-original-rezept ; https://www.planmymeals.ai/brazilian-recipes/banana-and-oat-smoothie-with-milk-vitamina |
| `green_skyr_smoothie` | `snack` | `nordic` | 277 | nein | https://www.pickuplimes.com/recipe/mango-spinach-smoothie-125 ; https://www.wellplated.com/mango-green-smoothie-recipe/ |
| `labneh_zaatar` | `snack` | `middle_eastern` | 238 | nein | https://explorecookeat.com/easy-homemade-middle-eastern-labneh-dip-recipe-with-zaatar/ ; https://www.yummymummykitchen.com/2019/12/labneh-labne-dip.html |
| `tuna_avocado` | `snack` | `american` | 252 | ja | https://www.daisybeet.com/high-protein-avocado-tuna-salad-no-mayo/ ; https://www.walderwellness.com/no-mayo-high-protein-tuna-salad/ |
| `shrimp_cocktail` | `snack` | `european` | 141 | nein | https://www.weightwatchers.com/us/recipe/shrimp-cocktail-spicy-dipping-sauce/5a53df1fce3db155e6de0f99 ; https://food52.com/recipes/90714-shrimp-cocktail-gets-a-makeover |
| `cottage_crispbread` | `snack` | `nordic` | 223 | ja | https://www.wasa.com/en-us/recipes/wasa-savory-cottage-cheese-toasts/ ; https://breakstones.com/recipe/green-goddess-cottage-cheese-crispbreads/ |
| `paneer_tikka_bites` | `snack` | `indian` | 288 | ja | https://www.thespicehouse.com/blogs/recipes/paneer-tikka-skewers ; https://www.indianhealthyrecipes.com/paneer-tikka-on-stove-top/ |
| `chicken_satay_skewers` | `snack` | `indonesian` | 191 | ja | https://www.recipetineats.com/satay-chicken-with-peanut-sauce/ ; https://vikalinka.com/chicken-satay-easy-peanut-sauce/ |
| `chickpea_chaat` | `snack` | `indian` | 313 | ja | https://www.cookrepublic.com/chickpea-chaat-salad/ ; https://www.indianveggiedelight.com/kala-chana-chaat-black-chickpea-salad/ |
| `skyr_berry_bark` | `snack` | `european` | 178 | nein | https://www.canada.ca/en/health-canada/services/food-guide/eating-support/kitchen/recipes/yogurt-bark-berries.html ; https://www.tesco.com/recipes/en-GB/recipe/frozen-blueberry-yogurt-bark |
| `cocoa_protein_milk` | `snack` | `swiss` | 219 | nein | https://www.puristnutrition.com/blogs/recipes/chocolate-protein-shake ; https://www.hersheyland.com/recipes/chocolate-protein-shake.html |
| `tuna_onigiri` | `snack` | `japanese` | 322 | nein | https://sudachirecipes.com/tuna-mayo-onigiri/ ; https://www.kikkoman.com/en/cookbook/washoku/onigiri.html |
| `silken_chocolate_mousse` | `snack` | `european` | 209 | nein | https://aseasyasapplepie.com/silken-tofu-chocolate-mousse/ ; https://nadiashealthykitchen.com/vegan-tofu-chocolate-mousse/ |
| `edamame_hummus` | `snack` | `japanese` | 280 | nein | https://www.foodnetwork.com/recipes/food-network-kitchen/edamame-hummus-recipe2-2105193 ; https://ohsheglows.com/edamame-hummus/ |
| `bundnerfleisch_crispbread` | `snack` | `swiss` | 228 | ja | https://www.gefro.de/blogs/rezepte/bauernbrot-mit-buendnerfleisch-in-pestomarinade ; https://www.lecker.de/flottes-buendner-fleisch-sandwich-129978.html |
