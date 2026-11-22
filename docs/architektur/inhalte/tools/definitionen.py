# -*- coding: utf-8 -*-
"""Quelldefinitionen für die Edovita-Startinhalte (von Hand geschrieben, 15.11.2026).
Aus dieser Datei erzeugt build_inhalte.py die JSON-Dateien. Nährwerte werden NICHT hier
eingetragen, sondern beim Build aus der Schweizer Nährwertdatenbank V7.1 (xlsx) gelesen.

nwd   = ID in der Schweizer Nährwertdatenbank (Blatt «Generische Lebensmittel»), None = nicht enthalten
proxy = True: Näherungswert eines verwandten Lebensmittels, muss geprüft werden
ja_unsicher = True: japanische Übersetzung unsicher, gegenlesen lassen
"""

# id: (gruppe, nwd, proxy, note, allergene, allergene_zu_pruefen, {de,en,pt,ja}, ja_unsicher, pt_unsicher)
FOODS = {
 # --- Ofenlachs ---
 'salmon':        ('fish', 194, False, 'Lachs, Zucht, roh', ['fish'], [], dict(de='Lachs', en='salmon', pt='salmão', ja='サーモン'), False, False),
 'broccoli':      ('veg', 351, False, 'Broccoli, roh', [], [], dict(de='Broccoli', en='broccoli', pt='brócolis', ja='ブロッコリー'), False, False),
 'potato':        ('veg', 813, False, 'Kartoffel, geschält, roh (für ungeschälte Schnitze verwendet)', [], [], dict(de='Kartoffeln', en='potatoes', pt='batata', ja='じゃがいも'), False, False),
 'olive_oil':     ('pantry', 591, False, 'Olivenöl', [], [], dict(de='Olivenöl', en='olive oil', pt='azeite de oliva', ja='オリーブオイル'), False, False),
 'lemon':         ('fruit', 398, False, 'Zitrone, roh (gegessen wird der Saft)', [], [], dict(de='Zitrone', en='lemon', pt='limão-siciliano', ja='レモン'), False, False),
 'garlic':        ('veg', 356, False, 'Knoblauch, roh', [], [], dict(de='Knoblauch', en='garlic', pt='alho', ja='にんにく'), False, False),
 'salt':          ('spice', 762, False, 'Kochsalz mit Jod', [], [], dict(de='Salz', en='salt', pt='sal', ja='塩'), False, False),
 'black_pepper':  ('spice', None, False, 'nicht in CH-NWD', [], [], dict(de='Pfeffer, schwarz', en='black pepper', pt='pimenta-do-reino', ja='黒こしょう'), False, False),
 # --- Thai-Curry ---
 'chicken_breast':('meat', 22, False, 'Poulet, Brust, ohne Haut, roh', [], [], dict(de='Pouletbrust', en='chicken breast', pt='peito de frango', ja='鶏むね肉'), False, False),
 'coconut_milk':  ('pantry', 13458, False, 'Kokosnussmilch (Dichte 1,02)', [], [], dict(de='Kokosmilch', en='coconut milk', pt='leite de coco', ja='ココナッツミルク'), False, False),
 'red_curry_paste':('pantry', None, False, 'nicht in CH-NWD; Fertigpasten enthalten oft Krevettenpaste', [], ['crustaceans'], dict(de='rote Currypaste', en='red curry paste', pt='pasta de curry vermelho', ja='レッドカレーペースト'), False, False),
 'red_bell_pepper':('veg', 360, False, 'Peperoni, rot, roh', [], [], dict(de='Peperoni, rot (Paprika)', en='red bell pepper', pt='pimentão vermelho', ja='赤パプリカ'), False, False),
 'aubergine':     ('veg', 349, False, 'Aubergine, roh', [], [], dict(de='Aubergine', en='aubergine (eggplant)', pt='berinjela', ja='なす'), False, False),
 'rapeseed_oil':  ('pantry', 600, False, 'Rapsöl', [], [], dict(de='Rapsöl', en='rapeseed oil', pt='óleo de canola', ja='なたね油'), False, False),
 'fish_sauce':    ('pantry', None, False, 'nicht in CH-NWD; sehr salzig', ['fish'], [], dict(de='Fischsauce', en='fish sauce', pt='molho de peixe', ja='ナンプラー（魚醤）'), False, False),
 'sugar':         ('pantry', 470, False, 'Zucker, weiss (statt Palmzucker)', [], [], dict(de='Zucker', en='sugar', pt='açúcar', ja='砂糖'), False, False),
 'thai_basil':    ('spice', 464, True, 'Näherung: Basilikum, roh (Thai-Basilikum nicht in CH-NWD)', [], [], dict(de='Thai-Basilikum', en='Thai basil', pt='manjericão tailandês', ja='タイバジル'), False, False),
 'kaffir_lime_leaves':('spice', None, False, 'nicht in CH-NWD; Menge vernachlässigbar', [], [], dict(de='Kaffirlimettenblätter', en='makrut lime leaves', pt='folhas de limão-kaffir', ja='こぶみかんの葉'), True, True),
 'jasmine_rice':  ('pantry', 427, False, 'Reis poliert, trocken (Jasminreis ist polierter Reis)', [], [], dict(de='Jasminreis', en='jasmine rice', pt='arroz jasmim', ja='ジャスミンライス'), False, False),
 # --- Pho ---
 'beef_broth':    ('pantry', 668, False, 'Bouillon, Fleisch, zubereitet (Dichte 1,01)', [], ['celery'], dict(de='Fleischbouillon', en='beef stock', pt='caldo de carne', ja='ビーフブイヨン'), False, False),
 'onion':         ('veg', 368, False, 'Zwiebel, roh', [], [], dict(de='Zwiebel', en='onion', pt='cebola', ja='玉ねぎ'), False, False),
 'ginger':        ('veg', 14239, False, 'Ingwer, roh', [], [], dict(de='Ingwer', en='ginger', pt='gengibre', ja='しょうが'), False, False),
 'star_anise':    ('spice', None, False, 'nicht in CH-NWD; wird abgesiebt', [], [], dict(de='Sternanis', en='star anise', pt='anis-estrelado', ja='八角（スターアニス）'), False, False),
 'cinnamon_stick':('spice', 911, False, 'Zimt; wird abgesiebt', [], [], dict(de='Zimtstange', en='cinnamon stick', pt='canela em pau', ja='シナモンスティック'), False, False),
 'cloves':        ('spice', None, False, 'nicht in CH-NWD; wird abgesiebt', [], [], dict(de='Gewürznelken', en='cloves', pt='cravo-da-índia', ja='クローブ'), False, False),
 'rice_noodles':  ('pantry', 427, True, 'Näherung: Reis poliert, trocken (flache Reisnudeln nicht in CH-NWD)', [], [], dict(de='Reisnudeln, flach', en='flat rice noodles', pt='macarrão de arroz (talharim)', ja='ライスヌードル（平麺）'), True, True),
 'beef_sirloin':  ('meat', 30, False, 'Rind, Entrecôte, roh', [], [], dict(de='Rindsentrecôte', en='beef sirloin (entrecôte)', pt='bife ancho (entrecôte)', ja='牛ロース'), True, True),
 'bean_sprouts':  ('veg', None, False, 'nicht in CH-NWD', [], [], dict(de='Sojasprossen (Mungbohnensprossen)', en='bean sprouts', pt='broto de feijão', ja='もやし'), False, False),
 'spring_onion':  ('veg', None, False, 'nicht in CH-NWD', [], [], dict(de='Frühlingszwiebeln', en='spring onions', pt='cebolinha', ja='青ねぎ'), False, False),
 'coriander_fresh':('spice', None, False, 'nicht in CH-NWD', [], [], dict(de='Koriander, frisch', en='fresh coriander', pt='coentro', ja='パクチー（香菜）'), False, False),
 'lime':          ('fruit', None, False, 'nicht in CH-NWD', [], [], dict(de='Limette', en='lime', pt='limão-taiti', ja='ライム'), False, False),
 # --- Birchermüesli ---
 'oats':          ('pantry', 198, False, 'Haferflocken', ['gluten'], [], dict(de='Haferflocken', en='rolled oats', pt='aveia em flocos', ja='オートミール'), False, False),
 'milk':          ('dairy', 62, False, 'Vollmilch, pasteurisiert (Dichte 1,03)', ['milk'], [], dict(de='Vollmilch', en='whole milk', pt='leite integral', ja='牛乳'), False, False),
 'yogurt':        ('dairy', 52, False, 'Joghurt, nature', ['milk'], [], dict(de='Joghurt nature', en='plain yoghurt', pt='iogurte natural', ja='プレーンヨーグルト'), False, False),
 'apple':         ('fruit', 378, False, 'Apfel, roh', [], [], dict(de='Äpfel', en='apples', pt='maçã', ja='りんご'), False, False),
 'hazelnuts':     ('pantry', 270, False, 'Haselnuss', ['nuts'], [], dict(de='Haselnüsse', en='hazelnuts', pt='avelãs', ja='ヘーゼルナッツ'), False, False),
 'honey':         ('pantry', 472, False, 'Honig (Blütenhonig)', [], [], dict(de='Honig', en='honey', pt='mel', ja='はちみつ'), False, False),
 # --- Linsen-Curry ---
 'red_lentils':   ('pantry', 13385, False, 'Linse, geschält, getrocknet (rote Linsen sind geschält)', [], [], dict(de='rote Linsen', en='red lentils', pt='lentilha vermelha', ja='赤レンズ豆'), False, False),
 'canned_tomatoes':('pantry', 637, False, 'Tomate, geschält (Konserve)', [], [], dict(de='Pelati (Tomaten, Dose)', en='tinned tomatoes', pt='tomate pelado (lata)', ja='トマト缶'), False, False),
 'vegetable_broth':('pantry', 664, False, 'Bouillon, Gemüse, zubereitet (Dichte 1,01)', [], ['celery'], dict(de='Gemüsebouillon', en='vegetable stock', pt='caldo de legumes', ja='野菜ブイヨン'), False, False),
 'spinach':       ('veg', 365, False, 'Spinat, roh', [], [], dict(de='Blattspinat', en='spinach', pt='espinafre', ja='ほうれん草'), False, False),
 'curry_powder':  ('spice', None, False, 'nicht in CH-NWD; Mischungen können Senf/Sellerie enthalten', [], ['mustard', 'celery'], dict(de='Currypulver', en='curry powder', pt='curry em pó', ja='カレー粉'), False, False),
 'cumin':         ('spice', None, False, 'nicht in CH-NWD', [], [], dict(de='Kreuzkümmel, gemahlen', en='ground cumin', pt='cominho em pó', ja='クミンパウダー'), False, False),
 # --- häufige Einkaufsartikel ---
 'eggs':          ('dairy', 290, False, 'Hühnerei, ganz, roh', ['eggs'], [], dict(de='Eier', en='eggs', pt='ovos', ja='卵'), False, False),
 'bread':         ('bakery', 829, False, 'Ruchbrot (Standard-Brot)', ['gluten'], [], dict(de='Brot', en='bread', pt='pão', ja='パン'), False, False),
 'butter':        ('dairy', 49, False, 'Vorzugsbutter', ['milk'], [], dict(de='Butter', en='butter', pt='manteiga', ja='バター'), False, False),
 'gruyere':       ('dairy', 530, False, 'Greyerzer, vollfett', ['milk'], [], dict(de='Greyerzer', en='Gruyère cheese', pt='queijo gruyère', ja='グリュイエールチーズ'), False, False),
 'tomato':        ('veg', 348, False, 'Tomate, roh', [], [], dict(de='Tomaten', en='tomatoes', pt='tomate', ja='トマト'), False, False),
 'cucumber':      ('veg', 354, False, 'Gurke, roh', [], [], dict(de='Gurke', en='cucumber', pt='pepino', ja='きゅうり'), False, False),
 'banana':        ('fruit', 381, False, 'Banane, roh', [], [], dict(de='Bananen', en='bananas', pt='banana', ja='バナナ'), False, False),
 'chickpeas':     ('pantry', 1059, False, 'Kichererbse, gekocht (Dose, abgetropft)', [], [], dict(de='Kichererbsen (Dose)', en='chickpeas (tinned)', pt='grão-de-bico (lata)', ja='ひよこ豆（缶詰）'), False, False),
 'quinoa':        ('pantry', 13394, False, 'Quinoa, roh', [], [], dict(de='Quinoa', en='quinoa', pt='quinoa', ja='キヌア'), False, False),
 'berries':       ('fruit', 1119, False, 'Beeren (Durchschnitt), roh', [], [], dict(de='Beeren', en='berries', pt='frutas vermelhas', ja='ベリー'), False, False),
 'pasta':         ('pantry', 800, False, 'Teigwaren ohne Ei, trocken', ['gluten'], [], dict(de='Teigwaren', en='pasta', pt='macarrão', ja='パスタ'), False, False),
 'lettuce':       ('veg', 448, False, 'Kopfsalat, roh', [], [], dict(de='Kopfsalat', en='lettuce', pt='alface', ja='レタス'), False, False),
}

# Rezept-Zutat: (food, amount, unit, grams_eaten_bei_Grundportionen, flags, hinweis_de, hinweis_en)
# flags: 'optional' (nicht in Summe), 'strained' (abgesiebt, nicht in Summe)
# grams: Gewicht, das in die Nährwertrechnung eingeht. g -> = amount; ml -> amount * Dichte (CH-NWD); pc/tbsp/tsp -> Annahme mit Hinweis
RECIPES = {
 'oven_salmon': dict(cuisine='european', meal='dinner', minutes=40, servings=2, tags=['protein'],
   title=dict(de='Ofenlachs mit Broccoli und Kartoffeln', en='Oven-baked salmon with broccoli and potatoes'),
   ingredients=[
     ('potato', 500, 'g', 500, [], 'ungeschält', 'unpeeled'),
     ('broccoli', 400, 'g', 400, [], 'Röschen', 'florets'),
     ('salmon', 300, 'g', 300, [], '2 Filets à 150 g', '2 fillets of 150 g'),
     ('olive_oil', 25, 'g', 25, [], 'ca. 2 EL', 'about 2 tbsp'),
     ('garlic', 2, 'pc', 6, [], '2 Zehen (Annahme 3 g/Zehe)', '2 cloves (assumed 3 g each)'),
     ('lemon', 0.5, 'pc', 20, [], 'Saft (Annahme 20 g)', 'juice (assumed 20 g)'),
     ('salt', 4, 'g', 4, [], None, None),
     ('black_pepper', 1, 'pinch', 0.5, [], None, None),
   ],
   steps=dict(de=[
     'Ofen auf 200 °C (Umluft 180 °C) vorheizen. Kartoffeln waschen, ungeschält in Schnitze schneiden und auf einem Blech mit Backpapier mit der Hälfte des Öls und etwas Salz mischen. 20 Minuten backen.',
     'Broccoli in Röschen teilen, Knoblauch fein hacken und beides mit dem restlichen Öl mischen.',
     'Lachs trocken tupfen und mit Salz und Pfeffer würzen. Kartoffeln wenden, Broccoli und Lachs dazulegen.',
     '12–15 Minuten weiterbacken, bis sich der Lachs leicht zerteilen lässt und innen gerade gar ist (Kerntemperatur ca. 60 °C).',
     'Mit Zitronensaft beträufeln und sofort servieren.'],
    en=[
     'Preheat the oven to 200 °C (180 °C fan). Wash the potatoes, cut them unpeeled into wedges and toss them on a lined tray with half the oil and a little salt. Bake for 20 minutes.',
     'Cut the broccoli into florets, finely chop the garlic and toss both with the remaining oil.',
     'Pat the salmon dry and season with salt and pepper. Turn the potatoes, add the broccoli and salmon to the tray.',
     'Bake for another 12–15 minutes until the salmon flakes easily and is just cooked inside (core about 60 °C).',
     'Drizzle with lemon juice and serve straight away.']),
   sources=['https://www.bbc.co.uk/food/recipes/baked_salmon_00289', 'https://www.recipeanytime.com/salmon-broccoli-and-potatoes/', 'https://chefjar.com/baked-salmon-with-potatoes/']),

 'thai_curry': dict(cuisine='thai', meal='dinner', minutes=30, servings=2, tags=['protein'],
   title=dict(de='Rotes Thai-Curry mit Poulet', en='Thai red curry with chicken'),
   ingredients=[
     ('jasmine_rice', 150, 'g', 150, [], 'roh', 'uncooked'),
     ('chicken_breast', 300, 'g', 300, [], None, None),
     ('red_curry_paste', 2, 'tbsp', 30, [], 'je nach Schärfe 1–3 EL (Annahme 15 g/EL)', '1–3 tbsp depending on heat (assumed 15 g/tbsp)'),
     ('coconut_milk', 250, 'ml', 255, [], 'vollfett', 'full-fat'),
     ('aubergine', 150, 'g', 150, [], None, None),
     ('red_bell_pepper', 150, 'g', 150, [], '1 Stück', '1 pepper'),
     ('rapeseed_oil', 10, 'g', 10, [], 'ca. 1 EL', 'about 1 tbsp'),
     ('fish_sauce', 1, 'tbsp', 15, [], 'nach Geschmack', 'to taste'),
     ('sugar', 8, 'g', 8, [], 'ca. 2 TL, traditionell Palmzucker', 'about 2 tsp, traditionally palm sugar'),
     ('thai_basil', 10, 'g', 10, [], '1 Handvoll Blätter', '1 handful of leaves'),
     ('kaffir_lime_leaves', 3, 'pc', 1, ['optional'], None, None),
   ],
   steps=dict(de=[
     'Reis nach Packungsangabe kochen.',
     'Poulet in mundgerechte Streifen, Peperoni in Streifen und Aubergine in Würfel schneiden.',
     'Öl im Wok oder in einer weiten Pfanne erhitzen. Currypaste darin etwa 1 Minute anrösten, bis sie duftet. 3 EL vom dicken Teil der Kokosmilch dazugeben und kurz mitrösten.',
     'Poulet dazugeben und rundum anbraten. Restliche Kokosmilch, Aubergine und Limettenblätter dazugeben und 8–10 Minuten köcheln, bis das Poulet durchgegart ist.',
     'Peperoni dazugeben und 2 Minuten mitkochen. Mit Fischsauce und Zucker abschmecken.',
     'Vom Herd nehmen, Basilikum unterheben und mit dem Reis servieren.'],
    en=[
     'Cook the rice according to the packet.',
     'Cut the chicken into bite-sized strips, the pepper into strips and the aubergine into cubes.',
     'Heat the oil in a wok or wide pan. Fry the curry paste for about 1 minute until fragrant. Add 3 tbsp of the thick part of the coconut milk and fry briefly.',
     'Add the chicken and brown it on all sides. Add the remaining coconut milk, the aubergine and the lime leaves and simmer for 8–10 minutes until the chicken is cooked through.',
     'Add the pepper and cook for 2 more minutes. Season with fish sauce and sugar.',
     'Take off the heat, stir in the basil and serve with the rice.']),
   sources=['https://hot-thai-kitchen.com/quick-red-curry-chicken/', 'https://praewcooks.com/thai-red-curry-chicken/', 'https://www.thaicookbook.tv/thai-recipes/main-dishes/red-curry-with-bamboo-shoots-chicken-and-coconut/']),

 'pho': dict(cuisine='vietnamese', meal='lunch', minutes=45, servings=2, tags=['protein'],
   title=dict(de='Pho mit Rindfleisch', en='Beef pho'),
   ingredients=[
     ('beef_broth', 1000, 'ml', 1010, [], None, None),
     ('onion', 1, 'pc', 100, ['strained'], 'halbiert, wird abgesiebt', 'halved, strained out'),
     ('ginger', 30, 'g', 30, ['strained'], 'wird abgesiebt', 'strained out'),
     ('star_anise', 2, 'pc', 1, ['strained'], None, None),
     ('cinnamon_stick', 1, 'pc', 3, ['strained'], None, None),
     ('cloves', 3, 'pc', 0.3, ['strained'], None, None),
     ('fish_sauce', 1, 'tbsp', 15, [], None, None),
     ('sugar', 5, 'g', 5, [], 'ca. 1 TL', 'about 1 tsp'),
     ('rice_noodles', 160, 'g', 160, [], 'trocken', 'dry'),
     ('beef_sirloin', 200, 'g', 200, [], 'sehr dünn geschnitten', 'very thinly sliced'),
     ('bean_sprouts', 100, 'g', 100, [], None, None),
     ('spring_onion', 30, 'g', 30, [], '2 Stück', '2 stalks'),
     ('coriander_fresh', 10, 'g', 10, [], None, None),
     ('thai_basil', 10, 'g', 10, [], None, None),
     ('lime', 1, 'pc', 30, [], 'in Schnitzen, Saft (Annahme 30 g)', 'in wedges, juice (assumed 30 g)'),
   ],
   steps=dict(de=[
     'Zwiebel und Ingwer halbieren und mit der Schnittfläche nach unten in einer trockenen Pfanne 6–8 Minuten rösten, bis sie dunkle Stellen haben.',
     'Sternanis, Zimtstange und Nelken in einem Topf ohne Fett 1–2 Minuten rösten, bis sie duften. Bouillon, Zwiebel, Ingwer, Fischsauce und Zucker dazugeben und halb zugedeckt 25 Minuten leise köcheln.',
     'Reisnudeln nach Packungsangabe einweichen oder kochen, abtropfen lassen und auf zwei Schalen verteilen.',
     'Rindfleisch quer zur Faser in sehr dünne Scheiben schneiden. Das geht leichter, wenn es vorher 15 Minuten im Tiefkühler war.',
     'Brühe absieben und wieder aufkochen. Fleischscheiben 30–60 Sekunden in der siedenden Brühe garen und auf die Nudeln legen.',
     'Heisse Brühe darübergiessen. Mit Sprossen, Frühlingszwiebeln, Koriander, Basilikum und Limettenschnitzen servieren.'],
    en=[
     'Halve the onion and ginger and char them cut side down in a dry pan for 6–8 minutes until they have dark spots.',
     'Toast the star anise, cinnamon stick and cloves in a dry pot for 1–2 minutes until fragrant. Add the stock, onion, ginger, fish sauce and sugar and simmer gently, half covered, for 25 minutes.',
     'Soak or cook the rice noodles according to the packet, drain and divide between two bowls.',
     'Slice the beef very thinly across the grain. This is easier after 15 minutes in the freezer.',
     'Strain the broth and bring it back to the boil. Cook the beef slices in the simmering broth for 30–60 seconds and place them on the noodles.',
     'Pour the hot broth over. Serve with sprouts, spring onions, coriander, basil and lime wedges.']),
   sources=['https://www.unitednoodles.com/recipes/pho/', 'https://www.onceuponachef.com/recipes/quick-beef-pho.html', 'https://www.foodnetwork.com/recipes/quick-beef-pho-7112948']),

 'birchermuesli': dict(cuisine='swiss', meal='breakfast', minutes=10, servings=2, tags=['vegetarian'],
   title=dict(de='Birchermüesli', en='Bircher muesli'),
   ingredients=[
     ('oats', 80, 'g', 80, [], None, None),
     ('milk', 150, 'ml', 154.5, [], None, None),
     ('yogurt', 180, 'g', 180, [], None, None),
     ('apple', 2, 'pc', 300, [], '2 Stück, ca. 300 g, mit Schale', '2 apples, about 300 g, unpeeled'),
     ('lemon', 0.5, 'pc', 15, [], 'Saft (Annahme 15 g)', 'juice (assumed 15 g)'),
     ('hazelnuts', 30, 'g', 30, [], None, None),
     ('honey', 10, 'g', 10, ['optional'], 'nach Belieben', 'to taste'),
   ],
   steps=dict(de=[
     'Haferflocken mit der Milch mischen und zugedeckt mindestens 30 Minuten, besser über Nacht, im Kühlschrank quellen lassen.',
     'Haselnüsse grob hacken.',
     'Äpfel waschen und mit der Schale direkt in die Flocken raffeln. Sofort den Zitronensaft untermischen, damit sie nicht braun werden.',
     'Joghurt unterrühren, nach Belieben mit Honig süssen und mit den Nüssen bestreuen.'],
    en=[
     'Mix the oats with the milk, cover and leave to soak in the fridge for at least 30 minutes, ideally overnight.',
     'Roughly chop the hazelnuts.',
     'Wash the apples and grate them unpeeled straight into the oats. Stir in the lemon juice immediately so they do not brown.',
     'Stir in the yoghurt, sweeten with honey if you like and sprinkle with the nuts.']),
   sources=['https://de.wikipedia.org/wiki/Bircherm%C3%BCesli', 'https://www.srf.ch/radio-srf-1/kochen/rezepte/original-birchermueesli', 'https://museum-meilen.ch/esskultur/ch-rezepte/birchermuesli/']),

 'lentil_curry': dict(cuisine='indian', meal='dinner', minutes=35, servings=2, tags=['vegan'],
   title=dict(de='Linsen-Curry mit Kokosmilch und Spinat', en='Lentil curry with coconut milk and spinach'),
   ingredients=[
     ('red_lentils', 150, 'g', 150, [], None, None),
     ('onion', 1, 'pc', 100, [], '1 Stück (Annahme 100 g)', '1 onion (assumed 100 g)'),
     ('garlic', 2, 'pc', 6, [], '2 Zehen', '2 cloves'),
     ('ginger', 15, 'g', 15, [], None, None),
     ('rapeseed_oil', 10, 'g', 10, [], 'ca. 1 EL', 'about 1 tbsp'),
     ('curry_powder', 2, 'tsp', 6, [], 'Annahme 3 g/TL', 'assumed 3 g/tsp'),
     ('cumin', 1, 'tsp', 2, [], None, None),
     ('canned_tomatoes', 200, 'g', 200, [], None, None),
     ('coconut_milk', 200, 'ml', 204, [], None, None),
     ('vegetable_broth', 300, 'ml', 303, [], None, None),
     ('spinach', 150, 'g', 150, [], None, None),
     ('salt', 3, 'g', 3, [], None, None),
     ('lime', 0.5, 'pc', 15, [], 'Saft', 'juice'),
   ],
   steps=dict(de=[
     'Zwiebel fein hacken, Knoblauch und Ingwer reiben. Linsen in einem Sieb spülen, bis das Wasser klar ist.',
     'Öl erhitzen und die Zwiebel 5 Minuten glasig dünsten. Knoblauch und Ingwer 1 Minute mitdünsten, dann Currypulver und Kreuzkümmel 30 Sekunden mitrösten.',
     'Linsen, Tomaten, Kokosmilch und Bouillon dazugeben, aufkochen und offen 18–20 Minuten köcheln, bis die Linsen zerfallen. Öfter rühren, sie setzen leicht an.',
     'Spinat unterrühren, bis er zusammenfällt. Mit Salz und Limettensaft abschmecken.'],
    en=[
     'Finely chop the onion, grate the garlic and ginger. Rinse the lentils in a sieve until the water runs clear.',
     'Heat the oil and soften the onion for 5 minutes. Add the garlic and ginger for 1 minute, then toast the curry powder and cumin for 30 seconds.',
     'Add the lentils, tomatoes, coconut milk and stock, bring to the boil and simmer uncovered for 18–20 minutes until the lentils break down. Stir often, they catch easily.',
     'Stir in the spinach until it wilts. Season with salt and lime juice.']),
   sources=['https://www.abelandcole.co.uk/recipes/red-lentil-spinach--coconut-dal', 'https://hellodollop.com/recipes/red-lentil-curry', 'https://www.emmaslittlekitchen.com/lentil-spinach-coconut-curry/']),
}
