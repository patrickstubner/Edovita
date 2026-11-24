# Rezeptbilder im Prototyp

Internes Manifest und Lizenznotiz. **Nicht in der Benutzeroberfläche angezeigt.** Fotografennamen und Ursprungs-URLs sind nur hier und in `images/recipes/manifest.json` festgehalten.

**Stand:** 24. November 2026, Europe/Zurich.

## Lizenzprüfung (vor der Auswahl)

Geprüft am 24. November 2026 (Europe/Zurich). Es wurden nur Quellen verwendet, bei denen **keine Urhebernennung Pflicht** ist. Wikimedia und CC-BY sind ausgeschlossen. Die APIs von Unsplash und Pexels wurden **nicht** genutzt (Unsplash-API verlangt Hotlinking und Namensnennung; Pexels-API braucht ein kostenloses Konto). Beschafft wurden die Dateien über öffentliche Seiten bzw. öffentliche Download-Links (`images.pexels.com`), einmalig heruntergeladen und lokal gebündelt.

### Unsplash License

Quellen: [Unsplash License](https://unsplash.com/license) und das Unsplash Help Center (die Lizenzseite war beim direkten Abruf durch Bot-Schutz/Anubis zeitweise nicht lesbar).

- Kostenlose Nutzung für private und kommerzielle Projekte, auch in Apps.
- Namensnennung ist nicht Pflicht, wird aber geschätzt.
- Unveränderte Fotos dürfen nicht als solche verkauft werden (z. B. als Poster oder Druck ohne eigene Leistung).
- Kein Aufbau eines konkurrierenden Stock-Angebots.
- Die Lizenz deckt keine Marken, Logos, erkennbare Personen (Modellrechte) und keine abgebildeten urheberrechtlich geschützten Werke.
- Offline-Bündelung heruntergeladener Dateien ist unter der Lizenz zulässig. Die Unsplash-API (hier ungenutzt) verlangt Hotlinking und Attribution.

In dieser Runde wurde **kein Unsplash-Foto** verwendet; die Prüfung gilt trotzdem, falls später welche dazukommen.

### Pexels License

Quelle: [Pexels License](https://www.pexels.com/license/).

- Kostenlose Nutzung, Bearbeitung erlaubt, auch auf Websites, Blogs und in Apps. Namensnennung ist nicht Pflicht.
- Unveränderte Fotos dürfen nicht einzeln/unverändert verkauft werden.
- Keine beleidigende Verwendung erkennbarer Personen; keine suggerierte Unterstützung durch abgebildete Personen.
- Nicht als Stock-Sammlung weitergeben. Markenrechte sind nicht abgedeckt.
- Offline-Bündelung heruntergeladener Dateien ist zulässig.

## Technische Umsetzung

- Kein Hotlinking, kein `fetch` in der App. Dateien liegen unter `images/recipes/` (`*.webp` ca. 800 px breit, `*-thumb.webp` ca. 400 px, Seitenverhältnis 4:3).
- Beim Umrechnen (Pillow) werden EXIF/GPS nicht übernommen; die WebP-Dateien enthalten keine GPS-Daten.
- Der Cloudflare-Worker liefert die Dateien ab v5.11 aus Workers KV (vorher Base64 eingebettet) unter `img-src 'self'` aus. CSP bleibt `connect-src 'none'`.
- In der UI: Listen-, Detail- und Plan-Miniaturen mit `alt` (Rezepttitel), `loading="lazy"`, festem Seitenverhältnis gegen Layout Shift. Neutraler Platzhalter (farbige Fläche und Blatt-Icon), wenn kein passendes Foto vorliegt.

## Auswahl (12 Fotos, alle Pexels)

| Rezept | Foto | Fotograf/in | Ursprungsseite | Abgerufen |
|--------|------|-------------|----------------|-----------|
| `oven_salmon` | Pexels 20182302 | Valeria Boltneva | https://www.pexels.com/photo/potatoes-and-fish-in-a-meal-20182302/ | 2026-11-24 |
| `thai_curry` | Pexels 10527603 | Nourishment DECODED | https://www.pexels.com/photo/cooked-food-on-white-ceramic-bowl-10527603/ | 2026-11-24 |
| `pho` | Pexels 6646022 | Ana Karotkaya Photography | https://www.pexels.com/photo/cooked-food-in-the-bowl-6646022/ | 2026-11-24 |
| `summer_rolls` | Pexels 6646031 | Ana Karotkaya Photography | https://www.pexels.com/photo/spring-rolls-on-the-plate-6646031/ | 2026-11-24 |
| `birchermuesli` | Pexels 6133456 | Regina Ferraz | https://www.pexels.com/photo/oatmeal-served-for-breakfast-6133456/ | 2026-11-24 |
| `yogurt_bowl` | Pexels 4220141 | Javier Disabato | https://www.pexels.com/photo/healthy-breakfast-bowl-with-oatmeal-and-fruits-4220141/ | 2026-11-24 |
| `lentil_curry` | Pexels 28286241 | Nic Wood | https://www.pexels.com/photo/vegan-lentil-dhal-28286241/ | 2026-11-24 |
| `scrambled_eggs` | Pexels 32134464 | Anthony Rahayel | https://www.pexels.com/photo/scrambled-eggs-and-avocado-on-toast-with-greens-32134464/ | 2026-11-24 |
| `chicken_bowl` | Pexels 17308548 | Vitaliy Haiduk | https://www.pexels.com/photo/close-up-of-a-dish-with-rice-and-chicken-in-sauce-topped-with-spring-onion-17308548/ | 2026-11-24 |
| `miso_salmon` | Pexels 39641632 | Valeria Boltneva | https://www.pexels.com/photo/delicious-glazed-salmon-with-spinach-and-edamame-39641632/ | 2026-11-24 |
| `shakshuka` | Pexels 35672951 | Valeria Boltneva | https://www.pexels.com/photo/delicious-shakshuka-in-cast-iron-skillet-35672951/ | 2026-11-24 |
| `burrito_bowl` | Pexels 16123122 | Raphael Loquellano | https://www.pexels.com/photo/close-up-of-salad-16123122/ | 2026-11-24 |


## Erweiterung v5.11 (165 Fotos, alle Pexels)

Gefunden über die öffentliche Bild-Sitemap von Pexels (lokaler Suchindex, keine API, kein Konto). Heruntergeladen einmalig über `images.pexels.com` (`w=1000`), mit Pillow auf 4:3 zugeschnitten: Vollbild **640×480** (WebP q62), Miniatur **400×300** (WebP q58), ohne EXIF/GPS. Die Sitemap enthält keinen Fotografennamen; die Lizenz verlangt keine Nennung, intern ist die Pexels-ID dokumentiert.

Auslieferung: Ab v5.11 sind die Rezeptbilder nicht mehr im Worker eingebettet (Upload-/Grössenlimit). Der Worker liefert `/images/recipes/*.webp` aus dem Workers-KV-Namespace `edovita-prototyp-img` (Binding `IMG`, Upload `tools/kv-upload-images.py`) mit gleicher CSP (`img-src 'self'`). Die Dateien liegen trotzdem im Repo, damit die App lokal vollständig ist.

| Rezept | Foto | Fotograf/in | Ursprungsseite | Abgerufen |
|--------|------|-------------|----------------|-----------|
| `skyr_berry_bowl` | Pexels 7992683 | – | https://www.pexels.com/photo/7992683/ | 2026-11-24 |
| `quark_bircher` | Pexels 23940631 | – | https://www.pexels.com/photo/23940631/ | 2026-11-24 |
| `cottage_tomato_toast` | Pexels 35672970 | – | https://www.pexels.com/photo/35672970/ | 2026-11-24 |
| `overnight_oats_quark` | Pexels 4725735 | – | https://www.pexels.com/photo/4725735/ | 2026-11-24 |
| `veggie_omelette` | Pexels 37287418 | – | https://www.pexels.com/photo/37287418/ | 2026-11-24 |
| `spinach_feta_omelette` | Pexels 23996321 | – | https://www.pexels.com/photo/23996321/ | 2026-11-24 |
| `cottage_zucchini_frittata` | Pexels 14302153 | – | https://www.pexels.com/photo/14302153/ | 2026-11-24 |
| `protein_pancakes` | Pexels 31098651 | – | https://www.pexels.com/photo/31098651/ | 2026-11-24 |
| `huevos_rancheros` | Pexels 16556117 | – | https://www.pexels.com/photo/16556117/ | 2026-11-24 |
| `smoked_salmon_bread` | Pexels 9524171 | – | https://www.pexels.com/photo/9524171/ | 2026-11-24 |
| `tapioca_egg_cheese` | Pexels 37050196 | – | https://www.pexels.com/photo/37050196/ | 2026-11-24 |
| `acai_skyr_bowl` | Pexels 566564 | – | https://www.pexels.com/photo/566564/ | 2026-11-24 |
| `japanese_salmon_breakfast` | Pexels 33706292 | – | https://www.pexels.com/photo/33706292/ | 2026-11-24 |
| `tamagoyaki_edamame` | Pexels 32722818 | – | https://www.pexels.com/photo/32722818/ | 2026-11-24 |
| `chicken_congee` | Pexels 32835478 | – | https://www.pexels.com/photo/32835478/ | 2026-11-24 |
| `menemen` | Pexels 39853243 | – | https://www.pexels.com/photo/39853243/ | 2026-11-24 |
| `greek_yogurt_walnut` | Pexels 5620415 | – | https://www.pexels.com/photo/5620415/ | 2026-11-24 |
| `chia_skyr_mango` | Pexels 6544212 | – | https://www.pexels.com/photo/6544212/ | 2026-11-24 |
| `ricotta_berry_toast` | Pexels 30900623 | – | https://www.pexels.com/photo/30900623/ | 2026-11-24 |
| `breakfast_burrito` | Pexels 27590340 | – | https://www.pexels.com/photo/27590340/ | 2026-11-24 |
| `avocado_egg_toast` | Pexels 11975658 | – | https://www.pexels.com/photo/11975658/ | 2026-11-24 |
| `quinoa_breakfast_porridge` | Pexels 11532336 | – | https://www.pexels.com/photo/11532336/ | 2026-11-24 |
| `oat_porridge_quark` | Pexels 27850091 | – | https://www.pexels.com/photo/27850091/ | 2026-11-24 |
| `green_shakshuka` | Pexels 6419606 | – | https://www.pexels.com/photo/6419606/ | 2026-11-24 |
| `cilbir` | Pexels 38085477 | – | https://www.pexels.com/photo/38085477/ | 2026-11-24 |
| `gyeran_jjim` | Pexels 39531113 | – | https://www.pexels.com/photo/39531113/ | 2026-11-24 |
| `kimchi_scrambled_eggs` | Pexels 6109498 | – | https://www.pexels.com/photo/6109498/ | 2026-11-24 |
| `buckwheat_galette` | Pexels 10821333 | – | https://www.pexels.com/photo/10821333/ | 2026-11-24 |
| `berry_protein_smoothie` | Pexels 11066839 | – | https://www.pexels.com/photo/11066839/ | 2026-11-24 |
| `skyr_apple_compote` | Pexels 7994280 | – | https://www.pexels.com/photo/7994280/ | 2026-11-24 |
| `silken_tofu_smoothie` | Pexels 33549367 | – | https://www.pexels.com/photo/33549367/ | 2026-11-24 |
| `pb_banana_soy_oats` | Pexels 7167853 | – | https://www.pexels.com/photo/7167853/ | 2026-11-24 |
| `masala_omelette` | Pexels 15801901 | – | https://www.pexels.com/photo/15801901/ | 2026-11-24 |
| `greek_chicken_salad` | Pexels 19295808 | – | https://www.pexels.com/photo/19295808/ | 2026-11-24 |
| `tuna_nicoise` | Pexels 36555137 | – | https://www.pexels.com/photo/36555137/ | 2026-11-24 |
| `quinoa_feta_salad` | Pexels 27850079 | – | https://www.pexels.com/photo/27850079/ | 2026-11-24 |
| `lentil_feta_salad` | Pexels 28618631 | – | https://www.pexels.com/photo/28618631/ | 2026-11-24 |
| `chicken_caesar_light` | Pexels 20321601 | – | https://www.pexels.com/photo/20321601/ | 2026-11-24 |
| `turkey_veggie_wrap` | Pexels 29535634 | – | https://www.pexels.com/photo/29535634/ | 2026-11-24 |
| `salmon_poke` | Pexels 15913488 | – | https://www.pexels.com/photo/15913488/ | 2026-11-24 |
| `tofu_poke` | Pexels 4828142 | – | https://www.pexels.com/photo/4828142/ | 2026-11-24 |
| `bibimbap` | Pexels 39594967 | – | https://www.pexels.com/photo/39594967/ | 2026-11-24 |
| `chicken_shawarma_bowl` | Pexels 8018079 | – | https://www.pexels.com/photo/8018079/ | 2026-11-24 |
| `baked_falafel_bowl` | Pexels 6275189 | – | https://www.pexels.com/photo/6275189/ | 2026-11-24 |
| `chickpea_tuna_salad` | Pexels 34429559 | – | https://www.pexels.com/photo/34429559/ | 2026-11-24 |
| `chicken_caprese_salad` | Pexels 13241857 | – | https://www.pexels.com/photo/13241857/ | 2026-11-24 |
| `minestrone_beans` | Pexels 16811678 | – | https://www.pexels.com/photo/16811678/ | 2026-11-24 |
| `bundner_barley_soup` | Pexels 11519066 | – | https://www.pexels.com/photo/11519066/ | 2026-11-24 |
| `egg_salad_sandwich` | Pexels 31150259 | – | https://www.pexels.com/photo/31150259/ | 2026-11-24 |
| `black_bean_soup` | Pexels 31985803 | – | https://www.pexels.com/photo/31985803/ | 2026-11-24 |
| `chicken_tortilla_soup` | Pexels 15780649 | – | https://www.pexels.com/photo/15780649/ | 2026-11-24 |
| `beef_fajita_bowl` | Pexels 40135711 | – | https://www.pexels.com/photo/40135711/ | 2026-11-24 |
| `shrimp_tacos` | Pexels 10296433 | – | https://www.pexels.com/photo/10296433/ | 2026-11-24 |
| `prato_feito` | Pexels 34628053 | – | https://www.pexels.com/photo/34628053/ | 2026-11-24 |
| `caldo_verde_beans` | Pexels 36429907 | – | https://www.pexels.com/photo/36429907/ | 2026-11-24 |
| `cold_soba_tofu` | Pexels 37140175 | – | https://www.pexels.com/photo/37140175/ | 2026-11-24 |
| `oyakodon` | Pexels 37297724 | – | https://www.pexels.com/photo/37297724/ | 2026-11-24 |
| `gyudon_light` | Pexels 31299650 | – | https://www.pexels.com/photo/31299650/ | 2026-11-24 |
| `goi_ga` | Pexels 15813486 | – | https://www.pexels.com/photo/15813486/ | 2026-11-24 |
| `banh_mi_bowl` | Pexels 34888274 | – | https://www.pexels.com/photo/34888274/ | 2026-11-24 |
| `bun_chay_tofu` | Pexels 29467676 | – | https://www.pexels.com/photo/29467676/ | 2026-11-24 |
| `yum_nua` | Pexels 35215472 | – | https://www.pexels.com/photo/35215472/ | 2026-11-24 |
| `larb_gai` | Pexels 12100417 | – | https://www.pexels.com/photo/12100417/ | 2026-11-24 |
| `palak_dal` | Pexels 28675074 | – | https://www.pexels.com/photo/28675074/ | 2026-11-24 |
| `chana_masala` | Pexels 9287035 | – | https://www.pexels.com/photo/9287035/ | 2026-11-24 |
| `tandoori_chicken_salad` | Pexels 29699526 | – | https://www.pexels.com/photo/29699526/ | 2026-11-24 |
| `paneer_tikka_wrap` | Pexels 36268517 | – | https://www.pexels.com/photo/36268517/ | 2026-11-24 |
| `hot_sour_tofu_soup` | Pexels 36680510 | – | https://www.pexels.com/photo/36680510/ | 2026-11-24 |
| `chicken_vegetable_soup` | Pexels 34821965 | – | https://www.pexels.com/photo/34821965/ | 2026-11-24 |
| `tuna_pasta_salad` | Pexels 37987827 | – | https://www.pexels.com/photo/37987827/ | 2026-11-24 |
| `tonno_fagioli` | Pexels 37081069 | – | https://www.pexels.com/photo/37081069/ | 2026-11-24 |
| `halloumi_lentil_salad` | Pexels 40607633 | – | https://www.pexels.com/photo/40607633/ | 2026-11-24 |
| `gazpacho_shrimp` | Pexels 38238825 | – | https://www.pexels.com/photo/38238825/ | 2026-11-24 |
| `espinacas_garbanzos` | Pexels 35695373 | – | https://www.pexels.com/photo/35695373/ | 2026-11-24 |
| `gado_gado` | Pexels 31336113 | – | https://www.pexels.com/photo/31336113/ | 2026-11-24 |
| `ceviche_sweet_potato` | Pexels 28448392 | – | https://www.pexels.com/photo/28448392/ | 2026-11-24 |
| `trout_potato_salad` | Pexels 19396430 | – | https://www.pexels.com/photo/19396430/ | 2026-11-24 |
| `skagen_toast` | Pexels 39413007 | – | https://www.pexels.com/photo/39413007/ | 2026-11-24 |
| `edamame_quinoa_bowl` | Pexels 7660427 | – | https://www.pexels.com/photo/7660427/ | 2026-11-24 |
| `harira` | Pexels 209540 | – | https://www.pexels.com/photo/209540/ | 2026-11-24 |
| `couscous_chicken_salad` | Pexels 37520728 | – | https://www.pexels.com/photo/37520728/ | 2026-11-24 |
| `whitefish_potatoes` | Pexels 19748960 | – | https://www.pexels.com/photo/19748960/ | 2026-11-24 |
| `barley_risotto_chicken` | Pexels 14537683 | – | https://www.pexels.com/photo/14537683/ | 2026-11-24 |
| `alpler_magronen_light` | Pexels 6845342 | – | https://www.pexels.com/photo/6845342/ | 2026-11-24 |
| `beef_steak_vegetables` | Pexels 36829358 | – | https://www.pexels.com/photo/36829358/ | 2026-11-24 |
| `chicken_piccata` | Pexels 6896080 | – | https://www.pexels.com/photo/6896080/ | 2026-11-24 |
| `turkey_bolognese` | Pexels 30392939 | – | https://www.pexels.com/photo/30392939/ | 2026-11-24 |
| `lentil_bolognese` | Pexels 36223320 | – | https://www.pexels.com/photo/36223320/ | 2026-11-24 |
| `shrimp_garlic_pasta` | Pexels 37648027 | – | https://www.pexels.com/photo/37648027/ | 2026-11-24 |
| `chicken_souvlaki` | Pexels 37073896 | – | https://www.pexels.com/photo/37073896/ | 2026-11-24 |
| `shrimp_saganaki` | Pexels 36630842 | – | https://www.pexels.com/photo/36630842/ | 2026-11-24 |
| `baked_feta_chickpeas` | Pexels 33984950 | – | https://www.pexels.com/photo/33984950/ | 2026-11-24 |
| `chicken_tagine` | Pexels 36984667 | – | https://www.pexels.com/photo/36984667/ | 2026-11-24 |
| `beef_kofta_yogurt` | Pexels 32986492 | – | https://www.pexels.com/photo/32986492/ | 2026-11-24 |
| `stuffed_peppers_turkey` | Pexels 31953512 | – | https://www.pexels.com/photo/31953512/ | 2026-11-24 |
| `chili_con_carne` | Pexels 15881322 | – | https://www.pexels.com/photo/15881322/ | 2026-11-24 |
| `chicken_fajitas` | Pexels 40135708 | – | https://www.pexels.com/photo/40135708/ | 2026-11-24 |
| `moqueca` | Pexels 40108721 | – | https://www.pexels.com/photo/40108721/ | 2026-11-24 |
| `picadinho` | Pexels 34636462 | – | https://www.pexels.com/photo/34636462/ | 2026-11-24 |
| `feijoada_light` | Pexels 40646830 | – | https://www.pexels.com/photo/40646830/ | 2026-11-24 |
| `bobo_camarao` | Pexels 17346226 | – | https://www.pexels.com/photo/17346226/ | 2026-11-24 |
| `galinhada` | Pexels 17696653 | – | https://www.pexels.com/photo/17696653/ | 2026-11-24 |
| `bulgogi` | Pexels 5774000 | – | https://www.pexels.com/photo/5774000/ | 2026-11-24 |
| `dakgalbi` | Pexels 29173121 | – | https://www.pexels.com/photo/29173121/ | 2026-11-24 |
| `sundubu_jjigae` | Pexels 29902068 | – | https://www.pexels.com/photo/29902068/ | 2026-11-24 |
| `kung_pao_chicken` | Pexels 30708204 | – | https://www.pexels.com/photo/30708204/ | 2026-11-24 |
| `mapo_tofu` | Pexels 34618075 | – | https://www.pexels.com/photo/34618075/ | 2026-11-24 |
| `steamed_fish_ginger` | Pexels 33896073 | – | https://www.pexels.com/photo/33896073/ | 2026-11-24 |
| `beef_broccoli` | Pexels 31867670 | – | https://www.pexels.com/photo/31867670/ | 2026-11-24 |
| `saba_shioyaki` | Pexels 37189805 | – | https://www.pexels.com/photo/37189805/ | 2026-11-24 |
| `japanese_chicken_curry` | Pexels 30700759 | – | https://www.pexels.com/photo/30700759/ | 2026-11-24 |
| `green_curry_shrimp` | Pexels 31029754 | – | https://www.pexels.com/photo/31029754/ | 2026-11-24 |
| `pad_kra_pao` | Pexels 34613240 | – | https://www.pexels.com/photo/34613240/ | 2026-11-24 |
| `tom_yum_shrimp` | Pexels 34699476 | – | https://www.pexels.com/photo/34699476/ | 2026-11-24 |
| `pad_thai_chicken` | Pexels 34723308 | – | https://www.pexels.com/photo/34723308/ | 2026-11-24 |
| `ca_kho` | Pexels 38605312 | – | https://www.pexels.com/photo/38605312/ | 2026-11-24 |
| `ga_xao_sa_ot` | Pexels 41231438 | – | https://www.pexels.com/photo/41231438/ | 2026-11-24 |
| `tikka_masala_light` | Pexels 40262818 | – | https://www.pexels.com/photo/40262818/ | 2026-11-24 |
| `palak_paneer_light` | Pexels 31249589 | – | https://www.pexels.com/photo/31249589/ | 2026-11-24 |
| `kerala_fish_curry` | Pexels 38324319 | – | https://www.pexels.com/photo/38324319/ | 2026-11-24 |
| `rajma` | Pexels 35066814 | – | https://www.pexels.com/photo/35066814/ | 2026-11-24 |
| `nasi_goreng` | Pexels 30604605 | – | https://www.pexels.com/photo/30604605/ | 2026-11-24 |
| `tempeh_stirfry` | Pexels 19105514 | – | https://www.pexels.com/photo/19105514/ | 2026-11-24 |
| `lomo_saltado` | Pexels 28503582 | – | https://www.pexels.com/photo/28503582/ | 2026-11-24 |
| `seafood_paella` | Pexels 16743486 | – | https://www.pexels.com/photo/16743486/ | 2026-11-24 |
| `pollo_al_ajillo` | Pexels 38468824 | – | https://www.pexels.com/photo/38468824/ | 2026-11-24 |
| `frango_piri_piri` | Pexels 145804 | – | https://www.pexels.com/photo/145804/ | 2026-11-24 |
| `ratatouille_white_beans` | Pexels 39003151 | – | https://www.pexels.com/photo/39003151/ | 2026-11-24 |
| `salmon_puy_lentils` | Pexels 31909815 | – | https://www.pexels.com/photo/31909815/ | 2026-11-24 |
| `chicken_sweet_potato_traybake` | Pexels 31064161 | – | https://www.pexels.com/photo/31064161/ | 2026-11-24 |
| `turkey_meatballs` | Pexels 33254065 | – | https://www.pexels.com/photo/33254065/ | 2026-11-24 |
| `stuffed_sweet_potato` | Pexels 9219078 | – | https://www.pexels.com/photo/9219078/ | 2026-11-24 |
| `cod_dill_mustard` | Pexels 38995738 | – | https://www.pexels.com/photo/38995738/ | 2026-11-24 |
| `cottage_pineapple` | Pexels 4397310 | – | https://www.pexels.com/photo/4397310/ | 2026-11-24 |
| `skyr_herb_dip` | Pexels 38163955 | – | https://www.pexels.com/photo/38163955/ | 2026-11-24 |
| `roasted_chickpeas` | Pexels 6102661 | – | https://www.pexels.com/photo/6102661/ | 2026-11-24 |
| `edamame_sea_salt` | Pexels 28460870 | – | https://www.pexels.com/photo/28460870/ | 2026-11-24 |
| `hummus_veggie_sticks` | Pexels 34227783 | – | https://www.pexels.com/photo/34227783/ | 2026-11-24 |
| `eggs_cucumber` | Pexels 6823320 | – | https://www.pexels.com/photo/6823320/ | 2026-11-24 |
| `banana_protein_shake` | Pexels 20205955 | – | https://www.pexels.com/photo/20205955/ | 2026-11-24 |
| `turkey_rollups` | Pexels 28584246 | – | https://www.pexels.com/photo/28584246/ | 2026-11-24 |
| `quark_berries` | Pexels 10421049 | – | https://www.pexels.com/photo/10421049/ | 2026-11-24 |
| `protein_energy_balls` | Pexels 27850071 | – | https://www.pexels.com/photo/27850071/ | 2026-11-24 |
| `salmon_cucumber_bites` | Pexels 35212376 | – | https://www.pexels.com/photo/35212376/ | 2026-11-24 |
| `tzatziki_pita` | Pexels 5191819 | – | https://www.pexels.com/photo/5191819/ | 2026-11-24 |
| `deviled_eggs_yogurt` | Pexels 38623468 | – | https://www.pexels.com/photo/38623468/ | 2026-11-24 |
| `sesame_tofu_bites` | Pexels 4518604 | – | https://www.pexels.com/photo/4518604/ | 2026-11-24 |
| `mozzarella_tomato_skewers` | Pexels 33691783 | – | https://www.pexels.com/photo/33691783/ | 2026-11-24 |
| `bresaola_rolls` | Pexels 18229213 | – | https://www.pexels.com/photo/18229213/ | 2026-11-24 |
| `soy_chia_pudding` | Pexels 11280498 | – | https://www.pexels.com/photo/11280498/ | 2026-11-24 |
| `apple_skyr_pb_dip` | Pexels 6659902 | – | https://www.pexels.com/photo/6659902/ | 2026-11-24 |
| `vitamina_banana` | Pexels 33640921 | – | https://www.pexels.com/photo/33640921/ | 2026-11-24 |
| `green_skyr_smoothie` | Pexels 7656401 | – | https://www.pexels.com/photo/7656401/ | 2026-11-24 |
| `labneh_zaatar` | Pexels 38845223 | – | https://www.pexels.com/photo/38845223/ | 2026-11-24 |
| `tuna_avocado` | Pexels 6232551 | – | https://www.pexels.com/photo/6232551/ | 2026-11-24 |
| `shrimp_cocktail` | Pexels 28525134 | – | https://www.pexels.com/photo/28525134/ | 2026-11-24 |
| `cottage_crispbread` | Pexels 36040662 | – | https://www.pexels.com/photo/36040662/ | 2026-11-24 |
| `paneer_tikka_bites` | Pexels 33430556 | – | https://www.pexels.com/photo/33430556/ | 2026-11-24 |
| `chicken_satay_skewers` | Pexels 33434047 | – | https://www.pexels.com/photo/33434047/ | 2026-11-24 |
| `chickpea_chaat` | Pexels 16171917 | – | https://www.pexels.com/photo/16171917/ | 2026-11-24 |
| `skyr_berry_bark` | Pexels 32055278 | – | https://www.pexels.com/photo/32055278/ | 2026-11-24 |
| `cocoa_protein_milk` | Pexels 5429267 | – | https://www.pexels.com/photo/5429267/ | 2026-11-24 |
| `tuna_onigiri` | Pexels 39528138 | – | https://www.pexels.com/photo/39528138/ | 2026-11-24 |
| `silken_chocolate_mousse` | Pexels 34644328 | – | https://www.pexels.com/photo/34644328/ | 2026-11-24 |
| `edamame_hummus` | Pexels 17291667 | – | https://www.pexels.com/photo/17291667/ | 2026-11-24 |

**Dateigrösse gesamt:** 7725496 Bytes (7.4 MB) für 177 Rezepte × 2 Dateien, davon Vollbilder 5.1 MB. Die Erweiterung allein: 6806424 Bytes (ca. 41 KB pro Rezept).

## Rezepte ohne passendes Foto (neutraler Platzhalter, 23)

- `mushroom_polenta` (mushroom_polenta): Kein Foto, das Pilze und Polenta zusammen und erkennbar zeigt.
- `tofu_scramble` (Tofu-Rührei mit Gemüse): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `cuscuz_egg` (Cuscuz nordestino mit Spiegelei): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `veggie_egg_muffins` (Ei-Muffins mit Gemüse und Schinken): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `rosti_fried_egg` (Ofen-Rösti mit Spiegelei und Hüttenkäse): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `swiss_cottage_radish_bread` (Vollkornbrot mit Hüttenkäse, Radiesli und Schnittlauch): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `bresaola_rocket_toast` (Bresaola-Rucola-Toast mit Parmesan): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `crepioca_chicken` (Crepioca mit Poulet und Tomate): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `spinach_egg_wrap` (Spinat-Ei-Wrap mit Hüttenkäse): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `moong_dal_chilla` (Moong-Dal-Chilla (Linsen-Pfannkuchen) mit Minz-Sojajoghurt): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `salpicao_frango` (Salpicão (brasilianischer Poulet-Salat) mit Joghurt): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `baked_cod_tomatoes` (Ofen-Kabeljau mit Tomaten, Oliven und weissen Bohnen): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `chili_sin_carne` (Veganes Chili sin Carne mit Bohnen und Süsskartoffel): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `pescado_veracruzana` (Fisch nach Veracruz-Art mit Tomaten, Oliven und Reis): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `aji_de_gallina_light` (Leichtes Ají de gallina (Poulet in Ají-Sauce) mit Reis und Ei): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `bacalhau_grao` (Bacalhau mit Kichererbsen, Ei und Petersilie): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `poulet_provencal` (Poulet provençal mit Tomaten, Oliven und Kräutern): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `tuna_rice_cakes` (Reiswaffeln mit Thon-Joghurt-Creme): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `bundnerfleisch_crispbread` (Bündnerfleisch mit Knäckebrot, Gurke und Hüttenkäse): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `teriyaki_tofu` (Teriyaki-Tofu mit Brokkoli und Vollkornreis): Passende Kandidaten zeigten Teriyaki-Lachs statt Tofu (irreführend für ein veganes Gericht).
- `hummus_wrap` (hummus_wrap): Kein schlichtes, passendes Hummus-Gemüse-Wrap-Foto (Kandidaten mit Poulet oder stark stilisiert).
- `quinoa_pan` (quinoa_pan): Kein Foto, das klar eine Quinoa-Gemüsepfanne mit Kichererbsen zeigt, ohne irreführende Zutaten (z. B. Fleisch).
- `zurich_geschnetzeltes` (Leichtes Zürcher Geschnetzeltes vom Poulet mit Reis): Kandidaten zeigten Rindfleisch mit Pasta oder Steak statt Poulet mit Reis (irreführend).

Namensnennung in der App ist bewusst unterlassen (Lizenz erlaubt das; intern bleibt die Herkunft dokumentiert).
