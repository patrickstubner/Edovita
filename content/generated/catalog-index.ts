/* Auto-generiert von scripts/build-content-index.mjs – nicht von Hand bearbeiten. */
import type {
  Food,
  FoodCatalogSourceMeta,
  FoodGlossary,
  Recipe,
  RecipeImageAssets,
  RecipeLocaleText,
  RecipeTitles,
} from '../../src/domain/index.ts';
import foodsFile from '../foods/foods.json';
import glossaryDe from '../foods/glossary/de.json';
import glossaryEn from '../foods/glossary/en.json';
import glossaryEs from '../foods/glossary/es.json';
import glossaryFr from '../foods/glossary/fr.json';
import glossaryIt from '../foods/glossary/it.json';
import glossaryJa from '../foods/glossary/ja.json';
import glossaryPt from '../foods/glossary/pt.json';
import recipeTitlesDe from '../locales/de/recipes.json';
import recipeTitlesEn from '../locales/en/recipes.json';
import recipeTitlesEs from '../locales/es/recipes.json';
import recipeTitlesFr from '../locales/fr/recipes.json';
import recipeTitlesIt from '../locales/it/recipes.json';
import recipeTitlesJa from '../locales/ja/recipes.json';
import recipeTitlesPt from '../locales/pt/recipes.json';
import recipeAcaiSkyrBowl from '../recipes/acai_skyr_bowl/recipe.json';
import recipeAcaiSkyrBowlDe from '../recipes/acai_skyr_bowl/de.json';
import recipeAcaiSkyrBowlEn from '../recipes/acai_skyr_bowl/en.json';
import recipeAjiDeGallinaLight from '../recipes/aji_de_gallina_light/recipe.json';
import recipeAjiDeGallinaLightDe from '../recipes/aji_de_gallina_light/de.json';
import recipeAjiDeGallinaLightEn from '../recipes/aji_de_gallina_light/en.json';
import recipeAlplerMagronenLight from '../recipes/alpler_magronen_light/recipe.json';
import recipeAlplerMagronenLightDe from '../recipes/alpler_magronen_light/de.json';
import recipeAlplerMagronenLightEn from '../recipes/alpler_magronen_light/en.json';
import recipeAppleSkyrPbDip from '../recipes/apple_skyr_pb_dip/recipe.json';
import recipeAppleSkyrPbDipDe from '../recipes/apple_skyr_pb_dip/de.json';
import recipeAppleSkyrPbDipEn from '../recipes/apple_skyr_pb_dip/en.json';
import recipeAvocadoEggToast from '../recipes/avocado_egg_toast/recipe.json';
import recipeAvocadoEggToastDe from '../recipes/avocado_egg_toast/de.json';
import recipeAvocadoEggToastEn from '../recipes/avocado_egg_toast/en.json';
import recipeBacalhauGrao from '../recipes/bacalhau_grao/recipe.json';
import recipeBacalhauGraoDe from '../recipes/bacalhau_grao/de.json';
import recipeBacalhauGraoEn from '../recipes/bacalhau_grao/en.json';
import recipeBakedCodTomatoes from '../recipes/baked_cod_tomatoes/recipe.json';
import recipeBakedCodTomatoesDe from '../recipes/baked_cod_tomatoes/de.json';
import recipeBakedCodTomatoesEn from '../recipes/baked_cod_tomatoes/en.json';
import recipeBakedFalafelBowl from '../recipes/baked_falafel_bowl/recipe.json';
import recipeBakedFalafelBowlDe from '../recipes/baked_falafel_bowl/de.json';
import recipeBakedFalafelBowlEn from '../recipes/baked_falafel_bowl/en.json';
import recipeBakedFetaChickpeas from '../recipes/baked_feta_chickpeas/recipe.json';
import recipeBakedFetaChickpeasDe from '../recipes/baked_feta_chickpeas/de.json';
import recipeBakedFetaChickpeasEn from '../recipes/baked_feta_chickpeas/en.json';
import recipeBananaProteinShake from '../recipes/banana_protein_shake/recipe.json';
import recipeBananaProteinShakeDe from '../recipes/banana_protein_shake/de.json';
import recipeBananaProteinShakeEn from '../recipes/banana_protein_shake/en.json';
import recipeBanhMiBowl from '../recipes/banh_mi_bowl/recipe.json';
import recipeBanhMiBowlDe from '../recipes/banh_mi_bowl/de.json';
import recipeBanhMiBowlEn from '../recipes/banh_mi_bowl/en.json';
import recipeBarleyRisottoChicken from '../recipes/barley_risotto_chicken/recipe.json';
import recipeBarleyRisottoChickenDe from '../recipes/barley_risotto_chicken/de.json';
import recipeBarleyRisottoChickenEn from '../recipes/barley_risotto_chicken/en.json';
import recipeBeefBroccoli from '../recipes/beef_broccoli/recipe.json';
import recipeBeefBroccoliDe from '../recipes/beef_broccoli/de.json';
import recipeBeefBroccoliEn from '../recipes/beef_broccoli/en.json';
import recipeBeefFajitaBowl from '../recipes/beef_fajita_bowl/recipe.json';
import recipeBeefFajitaBowlDe from '../recipes/beef_fajita_bowl/de.json';
import recipeBeefFajitaBowlEn from '../recipes/beef_fajita_bowl/en.json';
import recipeBeefKoftaYogurt from '../recipes/beef_kofta_yogurt/recipe.json';
import recipeBeefKoftaYogurtDe from '../recipes/beef_kofta_yogurt/de.json';
import recipeBeefKoftaYogurtEn from '../recipes/beef_kofta_yogurt/en.json';
import recipeBeefSteakVegetables from '../recipes/beef_steak_vegetables/recipe.json';
import recipeBeefSteakVegetablesDe from '../recipes/beef_steak_vegetables/de.json';
import recipeBeefSteakVegetablesEn from '../recipes/beef_steak_vegetables/en.json';
import recipeBerryProteinSmoothie from '../recipes/berry_protein_smoothie/recipe.json';
import recipeBerryProteinSmoothieDe from '../recipes/berry_protein_smoothie/de.json';
import recipeBerryProteinSmoothieEn from '../recipes/berry_protein_smoothie/en.json';
import recipeBibimbap from '../recipes/bibimbap/recipe.json';
import recipeBibimbapDe from '../recipes/bibimbap/de.json';
import recipeBibimbapEn from '../recipes/bibimbap/en.json';
import recipeBirchermuesli from '../recipes/birchermuesli/recipe.json';
import recipeBirchermuesliDe from '../recipes/birchermuesli/de.json';
import recipeBirchermuesliEn from '../recipes/birchermuesli/en.json';
import recipeBlackBeanSoup from '../recipes/black_bean_soup/recipe.json';
import recipeBlackBeanSoupDe from '../recipes/black_bean_soup/de.json';
import recipeBlackBeanSoupEn from '../recipes/black_bean_soup/en.json';
import recipeBoboCamarao from '../recipes/bobo_camarao/recipe.json';
import recipeBoboCamaraoDe from '../recipes/bobo_camarao/de.json';
import recipeBoboCamaraoEn from '../recipes/bobo_camarao/en.json';
import recipeBreakfastBurrito from '../recipes/breakfast_burrito/recipe.json';
import recipeBreakfastBurritoDe from '../recipes/breakfast_burrito/de.json';
import recipeBreakfastBurritoEn from '../recipes/breakfast_burrito/en.json';
import recipeBresaolaRocketToast from '../recipes/bresaola_rocket_toast/recipe.json';
import recipeBresaolaRocketToastDe from '../recipes/bresaola_rocket_toast/de.json';
import recipeBresaolaRocketToastEn from '../recipes/bresaola_rocket_toast/en.json';
import recipeBresaolaRolls from '../recipes/bresaola_rolls/recipe.json';
import recipeBresaolaRollsDe from '../recipes/bresaola_rolls/de.json';
import recipeBresaolaRollsEn from '../recipes/bresaola_rolls/en.json';
import recipeBuckwheatGalette from '../recipes/buckwheat_galette/recipe.json';
import recipeBuckwheatGaletteDe from '../recipes/buckwheat_galette/de.json';
import recipeBuckwheatGaletteEn from '../recipes/buckwheat_galette/en.json';
import recipeBulgogi from '../recipes/bulgogi/recipe.json';
import recipeBulgogiDe from '../recipes/bulgogi/de.json';
import recipeBulgogiEn from '../recipes/bulgogi/en.json';
import recipeBunChayTofu from '../recipes/bun_chay_tofu/recipe.json';
import recipeBunChayTofuDe from '../recipes/bun_chay_tofu/de.json';
import recipeBunChayTofuEn from '../recipes/bun_chay_tofu/en.json';
import recipeBundnerBarleySoup from '../recipes/bundner_barley_soup/recipe.json';
import recipeBundnerBarleySoupDe from '../recipes/bundner_barley_soup/de.json';
import recipeBundnerBarleySoupEn from '../recipes/bundner_barley_soup/en.json';
import recipeBundnerfleischCrispbread from '../recipes/bundnerfleisch_crispbread/recipe.json';
import recipeBundnerfleischCrispbreadDe from '../recipes/bundnerfleisch_crispbread/de.json';
import recipeBundnerfleischCrispbreadEn from '../recipes/bundnerfleisch_crispbread/en.json';
import recipeBurritoBowl from '../recipes/burrito_bowl/recipe.json';
import recipeBurritoBowlDe from '../recipes/burrito_bowl/de.json';
import recipeBurritoBowlEn from '../recipes/burrito_bowl/en.json';
import recipeCaKho from '../recipes/ca_kho/recipe.json';
import recipeCaKhoDe from '../recipes/ca_kho/de.json';
import recipeCaKhoEn from '../recipes/ca_kho/en.json';
import recipeCaldoVerdeBeans from '../recipes/caldo_verde_beans/recipe.json';
import recipeCaldoVerdeBeansDe from '../recipes/caldo_verde_beans/de.json';
import recipeCaldoVerdeBeansEn from '../recipes/caldo_verde_beans/en.json';
import recipeCevicheSweetPotato from '../recipes/ceviche_sweet_potato/recipe.json';
import recipeCevicheSweetPotatoDe from '../recipes/ceviche_sweet_potato/de.json';
import recipeCevicheSweetPotatoEn from '../recipes/ceviche_sweet_potato/en.json';
import recipeChanaMasala from '../recipes/chana_masala/recipe.json';
import recipeChanaMasalaDe from '../recipes/chana_masala/de.json';
import recipeChanaMasalaEn from '../recipes/chana_masala/en.json';
import recipeChiaSkyrMango from '../recipes/chia_skyr_mango/recipe.json';
import recipeChiaSkyrMangoDe from '../recipes/chia_skyr_mango/de.json';
import recipeChiaSkyrMangoEn from '../recipes/chia_skyr_mango/en.json';
import recipeChickenBowl from '../recipes/chicken_bowl/recipe.json';
import recipeChickenBowlDe from '../recipes/chicken_bowl/de.json';
import recipeChickenBowlEn from '../recipes/chicken_bowl/en.json';
import recipeChickenCaesarLight from '../recipes/chicken_caesar_light/recipe.json';
import recipeChickenCaesarLightDe from '../recipes/chicken_caesar_light/de.json';
import recipeChickenCaesarLightEn from '../recipes/chicken_caesar_light/en.json';
import recipeChickenCapreseSalad from '../recipes/chicken_caprese_salad/recipe.json';
import recipeChickenCapreseSaladDe from '../recipes/chicken_caprese_salad/de.json';
import recipeChickenCapreseSaladEn from '../recipes/chicken_caprese_salad/en.json';
import recipeChickenCongee from '../recipes/chicken_congee/recipe.json';
import recipeChickenCongeeDe from '../recipes/chicken_congee/de.json';
import recipeChickenCongeeEn from '../recipes/chicken_congee/en.json';
import recipeChickenFajitas from '../recipes/chicken_fajitas/recipe.json';
import recipeChickenFajitasDe from '../recipes/chicken_fajitas/de.json';
import recipeChickenFajitasEn from '../recipes/chicken_fajitas/en.json';
import recipeChickenPiccata from '../recipes/chicken_piccata/recipe.json';
import recipeChickenPiccataDe from '../recipes/chicken_piccata/de.json';
import recipeChickenPiccataEn from '../recipes/chicken_piccata/en.json';
import recipeChickenSataySkewers from '../recipes/chicken_satay_skewers/recipe.json';
import recipeChickenSataySkewersDe from '../recipes/chicken_satay_skewers/de.json';
import recipeChickenSataySkewersEn from '../recipes/chicken_satay_skewers/en.json';
import recipeChickenShawarmaBowl from '../recipes/chicken_shawarma_bowl/recipe.json';
import recipeChickenShawarmaBowlDe from '../recipes/chicken_shawarma_bowl/de.json';
import recipeChickenShawarmaBowlEn from '../recipes/chicken_shawarma_bowl/en.json';
import recipeChickenSouvlaki from '../recipes/chicken_souvlaki/recipe.json';
import recipeChickenSouvlakiDe from '../recipes/chicken_souvlaki/de.json';
import recipeChickenSouvlakiEn from '../recipes/chicken_souvlaki/en.json';
import recipeChickenSweetPotatoTraybake from '../recipes/chicken_sweet_potato_traybake/recipe.json';
import recipeChickenSweetPotatoTraybakeDe from '../recipes/chicken_sweet_potato_traybake/de.json';
import recipeChickenSweetPotatoTraybakeEn from '../recipes/chicken_sweet_potato_traybake/en.json';
import recipeChickenTagine from '../recipes/chicken_tagine/recipe.json';
import recipeChickenTagineDe from '../recipes/chicken_tagine/de.json';
import recipeChickenTagineEn from '../recipes/chicken_tagine/en.json';
import recipeChickenTortillaSoup from '../recipes/chicken_tortilla_soup/recipe.json';
import recipeChickenTortillaSoupDe from '../recipes/chicken_tortilla_soup/de.json';
import recipeChickenTortillaSoupEn from '../recipes/chicken_tortilla_soup/en.json';
import recipeChickenVegetableSoup from '../recipes/chicken_vegetable_soup/recipe.json';
import recipeChickenVegetableSoupDe from '../recipes/chicken_vegetable_soup/de.json';
import recipeChickenVegetableSoupEn from '../recipes/chicken_vegetable_soup/en.json';
import recipeChickpeaChaat from '../recipes/chickpea_chaat/recipe.json';
import recipeChickpeaChaatDe from '../recipes/chickpea_chaat/de.json';
import recipeChickpeaChaatEn from '../recipes/chickpea_chaat/en.json';
import recipeChickpeaTunaSalad from '../recipes/chickpea_tuna_salad/recipe.json';
import recipeChickpeaTunaSaladDe from '../recipes/chickpea_tuna_salad/de.json';
import recipeChickpeaTunaSaladEn from '../recipes/chickpea_tuna_salad/en.json';
import recipeChiliConCarne from '../recipes/chili_con_carne/recipe.json';
import recipeChiliConCarneDe from '../recipes/chili_con_carne/de.json';
import recipeChiliConCarneEn from '../recipes/chili_con_carne/en.json';
import recipeChiliSinCarne from '../recipes/chili_sin_carne/recipe.json';
import recipeChiliSinCarneDe from '../recipes/chili_sin_carne/de.json';
import recipeChiliSinCarneEn from '../recipes/chili_sin_carne/en.json';
import recipeCilbir from '../recipes/cilbir/recipe.json';
import recipeCilbirDe from '../recipes/cilbir/de.json';
import recipeCilbirEn from '../recipes/cilbir/en.json';
import recipeCocoaProteinMilk from '../recipes/cocoa_protein_milk/recipe.json';
import recipeCocoaProteinMilkDe from '../recipes/cocoa_protein_milk/de.json';
import recipeCocoaProteinMilkEn from '../recipes/cocoa_protein_milk/en.json';
import recipeCodDillMustard from '../recipes/cod_dill_mustard/recipe.json';
import recipeCodDillMustardDe from '../recipes/cod_dill_mustard/de.json';
import recipeCodDillMustardEn from '../recipes/cod_dill_mustard/en.json';
import recipeColdSobaTofu from '../recipes/cold_soba_tofu/recipe.json';
import recipeColdSobaTofuDe from '../recipes/cold_soba_tofu/de.json';
import recipeColdSobaTofuEn from '../recipes/cold_soba_tofu/en.json';
import recipeCottageCrispbread from '../recipes/cottage_crispbread/recipe.json';
import recipeCottageCrispbreadDe from '../recipes/cottage_crispbread/de.json';
import recipeCottageCrispbreadEn from '../recipes/cottage_crispbread/en.json';
import recipeCottagePineapple from '../recipes/cottage_pineapple/recipe.json';
import recipeCottagePineappleDe from '../recipes/cottage_pineapple/de.json';
import recipeCottagePineappleEn from '../recipes/cottage_pineapple/en.json';
import recipeCottageTomatoToast from '../recipes/cottage_tomato_toast/recipe.json';
import recipeCottageTomatoToastDe from '../recipes/cottage_tomato_toast/de.json';
import recipeCottageTomatoToastEn from '../recipes/cottage_tomato_toast/en.json';
import recipeCottageZucchiniFrittata from '../recipes/cottage_zucchini_frittata/recipe.json';
import recipeCottageZucchiniFrittataDe from '../recipes/cottage_zucchini_frittata/de.json';
import recipeCottageZucchiniFrittataEn from '../recipes/cottage_zucchini_frittata/en.json';
import recipeCouscousChickenSalad from '../recipes/couscous_chicken_salad/recipe.json';
import recipeCouscousChickenSaladDe from '../recipes/couscous_chicken_salad/de.json';
import recipeCouscousChickenSaladEn from '../recipes/couscous_chicken_salad/en.json';
import recipeCrepiocaChicken from '../recipes/crepioca_chicken/recipe.json';
import recipeCrepiocaChickenDe from '../recipes/crepioca_chicken/de.json';
import recipeCrepiocaChickenEn from '../recipes/crepioca_chicken/en.json';
import recipeCuscuzEgg from '../recipes/cuscuz_egg/recipe.json';
import recipeCuscuzEggDe from '../recipes/cuscuz_egg/de.json';
import recipeCuscuzEggEn from '../recipes/cuscuz_egg/en.json';
import recipeDakgalbi from '../recipes/dakgalbi/recipe.json';
import recipeDakgalbiDe from '../recipes/dakgalbi/de.json';
import recipeDakgalbiEn from '../recipes/dakgalbi/en.json';
import recipeDeviledEggsYogurt from '../recipes/deviled_eggs_yogurt/recipe.json';
import recipeDeviledEggsYogurtDe from '../recipes/deviled_eggs_yogurt/de.json';
import recipeDeviledEggsYogurtEn from '../recipes/deviled_eggs_yogurt/en.json';
import recipeEdamameHummus from '../recipes/edamame_hummus/recipe.json';
import recipeEdamameHummusDe from '../recipes/edamame_hummus/de.json';
import recipeEdamameHummusEn from '../recipes/edamame_hummus/en.json';
import recipeEdamameQuinoaBowl from '../recipes/edamame_quinoa_bowl/recipe.json';
import recipeEdamameQuinoaBowlDe from '../recipes/edamame_quinoa_bowl/de.json';
import recipeEdamameQuinoaBowlEn from '../recipes/edamame_quinoa_bowl/en.json';
import recipeEdamameSeaSalt from '../recipes/edamame_sea_salt/recipe.json';
import recipeEdamameSeaSaltDe from '../recipes/edamame_sea_salt/de.json';
import recipeEdamameSeaSaltEn from '../recipes/edamame_sea_salt/en.json';
import recipeEggSaladSandwich from '../recipes/egg_salad_sandwich/recipe.json';
import recipeEggSaladSandwichDe from '../recipes/egg_salad_sandwich/de.json';
import recipeEggSaladSandwichEn from '../recipes/egg_salad_sandwich/en.json';
import recipeEggsCucumber from '../recipes/eggs_cucumber/recipe.json';
import recipeEggsCucumberDe from '../recipes/eggs_cucumber/de.json';
import recipeEggsCucumberEn from '../recipes/eggs_cucumber/en.json';
import recipeEspinacasGarbanzos from '../recipes/espinacas_garbanzos/recipe.json';
import recipeEspinacasGarbanzosDe from '../recipes/espinacas_garbanzos/de.json';
import recipeEspinacasGarbanzosEn from '../recipes/espinacas_garbanzos/en.json';
import recipeFeijoadaLight from '../recipes/feijoada_light/recipe.json';
import recipeFeijoadaLightDe from '../recipes/feijoada_light/de.json';
import recipeFeijoadaLightEn from '../recipes/feijoada_light/en.json';
import recipeFrangoPiriPiri from '../recipes/frango_piri_piri/recipe.json';
import recipeFrangoPiriPiriDe from '../recipes/frango_piri_piri/de.json';
import recipeFrangoPiriPiriEn from '../recipes/frango_piri_piri/en.json';
import recipeGaXaoSaOt from '../recipes/ga_xao_sa_ot/recipe.json';
import recipeGaXaoSaOtDe from '../recipes/ga_xao_sa_ot/de.json';
import recipeGaXaoSaOtEn from '../recipes/ga_xao_sa_ot/en.json';
import recipeGadoGado from '../recipes/gado_gado/recipe.json';
import recipeGadoGadoDe from '../recipes/gado_gado/de.json';
import recipeGadoGadoEn from '../recipes/gado_gado/en.json';
import recipeGalinhada from '../recipes/galinhada/recipe.json';
import recipeGalinhadaDe from '../recipes/galinhada/de.json';
import recipeGalinhadaEn from '../recipes/galinhada/en.json';
import recipeGazpachoShrimp from '../recipes/gazpacho_shrimp/recipe.json';
import recipeGazpachoShrimpDe from '../recipes/gazpacho_shrimp/de.json';
import recipeGazpachoShrimpEn from '../recipes/gazpacho_shrimp/en.json';
import recipeGoiGa from '../recipes/goi_ga/recipe.json';
import recipeGoiGaDe from '../recipes/goi_ga/de.json';
import recipeGoiGaEn from '../recipes/goi_ga/en.json';
import recipeGreekChickenSalad from '../recipes/greek_chicken_salad/recipe.json';
import recipeGreekChickenSaladDe from '../recipes/greek_chicken_salad/de.json';
import recipeGreekChickenSaladEn from '../recipes/greek_chicken_salad/en.json';
import recipeGreekYogurtWalnut from '../recipes/greek_yogurt_walnut/recipe.json';
import recipeGreekYogurtWalnutDe from '../recipes/greek_yogurt_walnut/de.json';
import recipeGreekYogurtWalnutEn from '../recipes/greek_yogurt_walnut/en.json';
import recipeGreenCurryShrimp from '../recipes/green_curry_shrimp/recipe.json';
import recipeGreenCurryShrimpDe from '../recipes/green_curry_shrimp/de.json';
import recipeGreenCurryShrimpEn from '../recipes/green_curry_shrimp/en.json';
import recipeGreenShakshuka from '../recipes/green_shakshuka/recipe.json';
import recipeGreenShakshukaDe from '../recipes/green_shakshuka/de.json';
import recipeGreenShakshukaEn from '../recipes/green_shakshuka/en.json';
import recipeGreenSkyrSmoothie from '../recipes/green_skyr_smoothie/recipe.json';
import recipeGreenSkyrSmoothieDe from '../recipes/green_skyr_smoothie/de.json';
import recipeGreenSkyrSmoothieEn from '../recipes/green_skyr_smoothie/en.json';
import recipeGyeranJjim from '../recipes/gyeran_jjim/recipe.json';
import recipeGyeranJjimDe from '../recipes/gyeran_jjim/de.json';
import recipeGyeranJjimEn from '../recipes/gyeran_jjim/en.json';
import recipeGyudonLight from '../recipes/gyudon_light/recipe.json';
import recipeGyudonLightDe from '../recipes/gyudon_light/de.json';
import recipeGyudonLightEn from '../recipes/gyudon_light/en.json';
import recipeHalloumiLentilSalad from '../recipes/halloumi_lentil_salad/recipe.json';
import recipeHalloumiLentilSaladDe from '../recipes/halloumi_lentil_salad/de.json';
import recipeHalloumiLentilSaladEn from '../recipes/halloumi_lentil_salad/en.json';
import recipeHarira from '../recipes/harira/recipe.json';
import recipeHariraDe from '../recipes/harira/de.json';
import recipeHariraEn from '../recipes/harira/en.json';
import recipeHotSourTofuSoup from '../recipes/hot_sour_tofu_soup/recipe.json';
import recipeHotSourTofuSoupDe from '../recipes/hot_sour_tofu_soup/de.json';
import recipeHotSourTofuSoupEn from '../recipes/hot_sour_tofu_soup/en.json';
import recipeHuevosRancheros from '../recipes/huevos_rancheros/recipe.json';
import recipeHuevosRancherosDe from '../recipes/huevos_rancheros/de.json';
import recipeHuevosRancherosEn from '../recipes/huevos_rancheros/en.json';
import recipeHummusVeggieSticks from '../recipes/hummus_veggie_sticks/recipe.json';
import recipeHummusVeggieSticksDe from '../recipes/hummus_veggie_sticks/de.json';
import recipeHummusVeggieSticksEn from '../recipes/hummus_veggie_sticks/en.json';
import recipeHummusWrap from '../recipes/hummus_wrap/recipe.json';
import recipeHummusWrapDe from '../recipes/hummus_wrap/de.json';
import recipeHummusWrapEn from '../recipes/hummus_wrap/en.json';
import recipeJapaneseChickenCurry from '../recipes/japanese_chicken_curry/recipe.json';
import recipeJapaneseChickenCurryDe from '../recipes/japanese_chicken_curry/de.json';
import recipeJapaneseChickenCurryEn from '../recipes/japanese_chicken_curry/en.json';
import recipeJapaneseSalmonBreakfast from '../recipes/japanese_salmon_breakfast/recipe.json';
import recipeJapaneseSalmonBreakfastDe from '../recipes/japanese_salmon_breakfast/de.json';
import recipeJapaneseSalmonBreakfastEn from '../recipes/japanese_salmon_breakfast/en.json';
import recipeKeralaFishCurry from '../recipes/kerala_fish_curry/recipe.json';
import recipeKeralaFishCurryDe from '../recipes/kerala_fish_curry/de.json';
import recipeKeralaFishCurryEn from '../recipes/kerala_fish_curry/en.json';
import recipeKimchiScrambledEggs from '../recipes/kimchi_scrambled_eggs/recipe.json';
import recipeKimchiScrambledEggsDe from '../recipes/kimchi_scrambled_eggs/de.json';
import recipeKimchiScrambledEggsEn from '../recipes/kimchi_scrambled_eggs/en.json';
import recipeKungPaoChicken from '../recipes/kung_pao_chicken/recipe.json';
import recipeKungPaoChickenDe from '../recipes/kung_pao_chicken/de.json';
import recipeKungPaoChickenEn from '../recipes/kung_pao_chicken/en.json';
import recipeLabnehZaatar from '../recipes/labneh_zaatar/recipe.json';
import recipeLabnehZaatarDe from '../recipes/labneh_zaatar/de.json';
import recipeLabnehZaatarEn from '../recipes/labneh_zaatar/en.json';
import recipeLarbGai from '../recipes/larb_gai/recipe.json';
import recipeLarbGaiDe from '../recipes/larb_gai/de.json';
import recipeLarbGaiEn from '../recipes/larb_gai/en.json';
import recipeLentilBolognese from '../recipes/lentil_bolognese/recipe.json';
import recipeLentilBologneseDe from '../recipes/lentil_bolognese/de.json';
import recipeLentilBologneseEn from '../recipes/lentil_bolognese/en.json';
import recipeLentilCurry from '../recipes/lentil_curry/recipe.json';
import recipeLentilCurryDe from '../recipes/lentil_curry/de.json';
import recipeLentilCurryEn from '../recipes/lentil_curry/en.json';
import recipeLentilFetaSalad from '../recipes/lentil_feta_salad/recipe.json';
import recipeLentilFetaSaladDe from '../recipes/lentil_feta_salad/de.json';
import recipeLentilFetaSaladEn from '../recipes/lentil_feta_salad/en.json';
import recipeLomoSaltado from '../recipes/lomo_saltado/recipe.json';
import recipeLomoSaltadoDe from '../recipes/lomo_saltado/de.json';
import recipeLomoSaltadoEn from '../recipes/lomo_saltado/en.json';
import recipeMapoTofu from '../recipes/mapo_tofu/recipe.json';
import recipeMapoTofuDe from '../recipes/mapo_tofu/de.json';
import recipeMapoTofuEn from '../recipes/mapo_tofu/en.json';
import recipeMasalaOmelette from '../recipes/masala_omelette/recipe.json';
import recipeMasalaOmeletteDe from '../recipes/masala_omelette/de.json';
import recipeMasalaOmeletteEn from '../recipes/masala_omelette/en.json';
import recipeMenemen from '../recipes/menemen/recipe.json';
import recipeMenemenDe from '../recipes/menemen/de.json';
import recipeMenemenEn from '../recipes/menemen/en.json';
import recipeMinestroneBeans from '../recipes/minestrone_beans/recipe.json';
import recipeMinestroneBeansDe from '../recipes/minestrone_beans/de.json';
import recipeMinestroneBeansEn from '../recipes/minestrone_beans/en.json';
import recipeMisoSalmon from '../recipes/miso_salmon/recipe.json';
import recipeMisoSalmonDe from '../recipes/miso_salmon/de.json';
import recipeMisoSalmonEn from '../recipes/miso_salmon/en.json';
import recipeMoongDalChilla from '../recipes/moong_dal_chilla/recipe.json';
import recipeMoongDalChillaDe from '../recipes/moong_dal_chilla/de.json';
import recipeMoongDalChillaEn from '../recipes/moong_dal_chilla/en.json';
import recipeMoqueca from '../recipes/moqueca/recipe.json';
import recipeMoquecaDe from '../recipes/moqueca/de.json';
import recipeMoquecaEn from '../recipes/moqueca/en.json';
import recipeMozzarellaTomatoSkewers from '../recipes/mozzarella_tomato_skewers/recipe.json';
import recipeMozzarellaTomatoSkewersDe from '../recipes/mozzarella_tomato_skewers/de.json';
import recipeMozzarellaTomatoSkewersEn from '../recipes/mozzarella_tomato_skewers/en.json';
import recipeMushroomPolenta from '../recipes/mushroom_polenta/recipe.json';
import recipeMushroomPolentaDe from '../recipes/mushroom_polenta/de.json';
import recipeMushroomPolentaEn from '../recipes/mushroom_polenta/en.json';
import recipeNasiGoreng from '../recipes/nasi_goreng/recipe.json';
import recipeNasiGorengDe from '../recipes/nasi_goreng/de.json';
import recipeNasiGorengEn from '../recipes/nasi_goreng/en.json';
import recipeOatPorridgeQuark from '../recipes/oat_porridge_quark/recipe.json';
import recipeOatPorridgeQuarkDe from '../recipes/oat_porridge_quark/de.json';
import recipeOatPorridgeQuarkEn from '../recipes/oat_porridge_quark/en.json';
import recipeOvenSalmon from '../recipes/oven_salmon/recipe.json';
import recipeOvenSalmonDe from '../recipes/oven_salmon/de.json';
import recipeOvenSalmonEn from '../recipes/oven_salmon/en.json';
import recipeOvernightOatsQuark from '../recipes/overnight_oats_quark/recipe.json';
import recipeOvernightOatsQuarkDe from '../recipes/overnight_oats_quark/de.json';
import recipeOvernightOatsQuarkEn from '../recipes/overnight_oats_quark/en.json';
import recipeOyakodon from '../recipes/oyakodon/recipe.json';
import recipeOyakodonDe from '../recipes/oyakodon/de.json';
import recipeOyakodonEn from '../recipes/oyakodon/en.json';
import recipePadKraPao from '../recipes/pad_kra_pao/recipe.json';
import recipePadKraPaoDe from '../recipes/pad_kra_pao/de.json';
import recipePadKraPaoEn from '../recipes/pad_kra_pao/en.json';
import recipePadThaiChicken from '../recipes/pad_thai_chicken/recipe.json';
import recipePadThaiChickenDe from '../recipes/pad_thai_chicken/de.json';
import recipePadThaiChickenEn from '../recipes/pad_thai_chicken/en.json';
import recipePalakDal from '../recipes/palak_dal/recipe.json';
import recipePalakDalDe from '../recipes/palak_dal/de.json';
import recipePalakDalEn from '../recipes/palak_dal/en.json';
import recipePalakPaneerLight from '../recipes/palak_paneer_light/recipe.json';
import recipePalakPaneerLightDe from '../recipes/palak_paneer_light/de.json';
import recipePalakPaneerLightEn from '../recipes/palak_paneer_light/en.json';
import recipePaneerTikkaBites from '../recipes/paneer_tikka_bites/recipe.json';
import recipePaneerTikkaBitesDe from '../recipes/paneer_tikka_bites/de.json';
import recipePaneerTikkaBitesEn from '../recipes/paneer_tikka_bites/en.json';
import recipePaneerTikkaWrap from '../recipes/paneer_tikka_wrap/recipe.json';
import recipePaneerTikkaWrapDe from '../recipes/paneer_tikka_wrap/de.json';
import recipePaneerTikkaWrapEn from '../recipes/paneer_tikka_wrap/en.json';
import recipePbBananaSoyOats from '../recipes/pb_banana_soy_oats/recipe.json';
import recipePbBananaSoyOatsDe from '../recipes/pb_banana_soy_oats/de.json';
import recipePbBananaSoyOatsEn from '../recipes/pb_banana_soy_oats/en.json';
import recipePescadoVeracruzana from '../recipes/pescado_veracruzana/recipe.json';
import recipePescadoVeracruzanaDe from '../recipes/pescado_veracruzana/de.json';
import recipePescadoVeracruzanaEn from '../recipes/pescado_veracruzana/en.json';
import recipePho from '../recipes/pho/recipe.json';
import recipePhoDe from '../recipes/pho/de.json';
import recipePhoEn from '../recipes/pho/en.json';
import recipePicadinho from '../recipes/picadinho/recipe.json';
import recipePicadinhoDe from '../recipes/picadinho/de.json';
import recipePicadinhoEn from '../recipes/picadinho/en.json';
import recipePolloAlAjillo from '../recipes/pollo_al_ajillo/recipe.json';
import recipePolloAlAjilloDe from '../recipes/pollo_al_ajillo/de.json';
import recipePolloAlAjilloEn from '../recipes/pollo_al_ajillo/en.json';
import recipePouletProvencal from '../recipes/poulet_provencal/recipe.json';
import recipePouletProvencalDe from '../recipes/poulet_provencal/de.json';
import recipePouletProvencalEn from '../recipes/poulet_provencal/en.json';
import recipePratoFeito from '../recipes/prato_feito/recipe.json';
import recipePratoFeitoDe from '../recipes/prato_feito/de.json';
import recipePratoFeitoEn from '../recipes/prato_feito/en.json';
import recipeProteinEnergyBalls from '../recipes/protein_energy_balls/recipe.json';
import recipeProteinEnergyBallsDe from '../recipes/protein_energy_balls/de.json';
import recipeProteinEnergyBallsEn from '../recipes/protein_energy_balls/en.json';
import recipeProteinPancakes from '../recipes/protein_pancakes/recipe.json';
import recipeProteinPancakesDe from '../recipes/protein_pancakes/de.json';
import recipeProteinPancakesEn from '../recipes/protein_pancakes/en.json';
import recipeQuarkBerries from '../recipes/quark_berries/recipe.json';
import recipeQuarkBerriesDe from '../recipes/quark_berries/de.json';
import recipeQuarkBerriesEn from '../recipes/quark_berries/en.json';
import recipeQuarkBircher from '../recipes/quark_bircher/recipe.json';
import recipeQuarkBircherDe from '../recipes/quark_bircher/de.json';
import recipeQuarkBircherEn from '../recipes/quark_bircher/en.json';
import recipeQuinoaBreakfastPorridge from '../recipes/quinoa_breakfast_porridge/recipe.json';
import recipeQuinoaBreakfastPorridgeDe from '../recipes/quinoa_breakfast_porridge/de.json';
import recipeQuinoaBreakfastPorridgeEn from '../recipes/quinoa_breakfast_porridge/en.json';
import recipeQuinoaFetaSalad from '../recipes/quinoa_feta_salad/recipe.json';
import recipeQuinoaFetaSaladDe from '../recipes/quinoa_feta_salad/de.json';
import recipeQuinoaFetaSaladEn from '../recipes/quinoa_feta_salad/en.json';
import recipeQuinoaPan from '../recipes/quinoa_pan/recipe.json';
import recipeQuinoaPanDe from '../recipes/quinoa_pan/de.json';
import recipeQuinoaPanEn from '../recipes/quinoa_pan/en.json';
import recipeRajma from '../recipes/rajma/recipe.json';
import recipeRajmaDe from '../recipes/rajma/de.json';
import recipeRajmaEn from '../recipes/rajma/en.json';
import recipeRatatouilleWhiteBeans from '../recipes/ratatouille_white_beans/recipe.json';
import recipeRatatouilleWhiteBeansDe from '../recipes/ratatouille_white_beans/de.json';
import recipeRatatouilleWhiteBeansEn from '../recipes/ratatouille_white_beans/en.json';
import recipeRicottaBerryToast from '../recipes/ricotta_berry_toast/recipe.json';
import recipeRicottaBerryToastDe from '../recipes/ricotta_berry_toast/de.json';
import recipeRicottaBerryToastEn from '../recipes/ricotta_berry_toast/en.json';
import recipeRoastedChickpeas from '../recipes/roasted_chickpeas/recipe.json';
import recipeRoastedChickpeasDe from '../recipes/roasted_chickpeas/de.json';
import recipeRoastedChickpeasEn from '../recipes/roasted_chickpeas/en.json';
import recipeRostiFriedEgg from '../recipes/rosti_fried_egg/recipe.json';
import recipeRostiFriedEggDe from '../recipes/rosti_fried_egg/de.json';
import recipeRostiFriedEggEn from '../recipes/rosti_fried_egg/en.json';
import recipeSabaShioyaki from '../recipes/saba_shioyaki/recipe.json';
import recipeSabaShioyakiDe from '../recipes/saba_shioyaki/de.json';
import recipeSabaShioyakiEn from '../recipes/saba_shioyaki/en.json';
import recipeSalmonCucumberBites from '../recipes/salmon_cucumber_bites/recipe.json';
import recipeSalmonCucumberBitesDe from '../recipes/salmon_cucumber_bites/de.json';
import recipeSalmonCucumberBitesEn from '../recipes/salmon_cucumber_bites/en.json';
import recipeSalmonPoke from '../recipes/salmon_poke/recipe.json';
import recipeSalmonPokeDe from '../recipes/salmon_poke/de.json';
import recipeSalmonPokeEn from '../recipes/salmon_poke/en.json';
import recipeSalmonPuyLentils from '../recipes/salmon_puy_lentils/recipe.json';
import recipeSalmonPuyLentilsDe from '../recipes/salmon_puy_lentils/de.json';
import recipeSalmonPuyLentilsEn from '../recipes/salmon_puy_lentils/en.json';
import recipeSalpicaoFrango from '../recipes/salpicao_frango/recipe.json';
import recipeSalpicaoFrangoDe from '../recipes/salpicao_frango/de.json';
import recipeSalpicaoFrangoEn from '../recipes/salpicao_frango/en.json';
import recipeScrambledEggs from '../recipes/scrambled_eggs/recipe.json';
import recipeScrambledEggsDe from '../recipes/scrambled_eggs/de.json';
import recipeScrambledEggsEn from '../recipes/scrambled_eggs/en.json';
import recipeSeafoodPaella from '../recipes/seafood_paella/recipe.json';
import recipeSeafoodPaellaDe from '../recipes/seafood_paella/de.json';
import recipeSeafoodPaellaEn from '../recipes/seafood_paella/en.json';
import recipeSesameTofuBites from '../recipes/sesame_tofu_bites/recipe.json';
import recipeSesameTofuBitesDe from '../recipes/sesame_tofu_bites/de.json';
import recipeSesameTofuBitesEn from '../recipes/sesame_tofu_bites/en.json';
import recipeShakshuka from '../recipes/shakshuka/recipe.json';
import recipeShakshukaDe from '../recipes/shakshuka/de.json';
import recipeShakshukaEn from '../recipes/shakshuka/en.json';
import recipeShrimpCocktail from '../recipes/shrimp_cocktail/recipe.json';
import recipeShrimpCocktailDe from '../recipes/shrimp_cocktail/de.json';
import recipeShrimpCocktailEn from '../recipes/shrimp_cocktail/en.json';
import recipeShrimpGarlicPasta from '../recipes/shrimp_garlic_pasta/recipe.json';
import recipeShrimpGarlicPastaDe from '../recipes/shrimp_garlic_pasta/de.json';
import recipeShrimpGarlicPastaEn from '../recipes/shrimp_garlic_pasta/en.json';
import recipeShrimpSaganaki from '../recipes/shrimp_saganaki/recipe.json';
import recipeShrimpSaganakiDe from '../recipes/shrimp_saganaki/de.json';
import recipeShrimpSaganakiEn from '../recipes/shrimp_saganaki/en.json';
import recipeShrimpTacos from '../recipes/shrimp_tacos/recipe.json';
import recipeShrimpTacosDe from '../recipes/shrimp_tacos/de.json';
import recipeShrimpTacosEn from '../recipes/shrimp_tacos/en.json';
import recipeSilkenChocolateMousse from '../recipes/silken_chocolate_mousse/recipe.json';
import recipeSilkenChocolateMousseDe from '../recipes/silken_chocolate_mousse/de.json';
import recipeSilkenChocolateMousseEn from '../recipes/silken_chocolate_mousse/en.json';
import recipeSilkenTofuSmoothie from '../recipes/silken_tofu_smoothie/recipe.json';
import recipeSilkenTofuSmoothieDe from '../recipes/silken_tofu_smoothie/de.json';
import recipeSilkenTofuSmoothieEn from '../recipes/silken_tofu_smoothie/en.json';
import recipeSkagenToast from '../recipes/skagen_toast/recipe.json';
import recipeSkagenToastDe from '../recipes/skagen_toast/de.json';
import recipeSkagenToastEn from '../recipes/skagen_toast/en.json';
import recipeSkyrAppleCompote from '../recipes/skyr_apple_compote/recipe.json';
import recipeSkyrAppleCompoteDe from '../recipes/skyr_apple_compote/de.json';
import recipeSkyrAppleCompoteEn from '../recipes/skyr_apple_compote/en.json';
import recipeSkyrBerryBark from '../recipes/skyr_berry_bark/recipe.json';
import recipeSkyrBerryBarkDe from '../recipes/skyr_berry_bark/de.json';
import recipeSkyrBerryBarkEn from '../recipes/skyr_berry_bark/en.json';
import recipeSkyrBerryBowl from '../recipes/skyr_berry_bowl/recipe.json';
import recipeSkyrBerryBowlDe from '../recipes/skyr_berry_bowl/de.json';
import recipeSkyrBerryBowlEn from '../recipes/skyr_berry_bowl/en.json';
import recipeSkyrHerbDip from '../recipes/skyr_herb_dip/recipe.json';
import recipeSkyrHerbDipDe from '../recipes/skyr_herb_dip/de.json';
import recipeSkyrHerbDipEn from '../recipes/skyr_herb_dip/en.json';
import recipeSmokedSalmonBread from '../recipes/smoked_salmon_bread/recipe.json';
import recipeSmokedSalmonBreadDe from '../recipes/smoked_salmon_bread/de.json';
import recipeSmokedSalmonBreadEn from '../recipes/smoked_salmon_bread/en.json';
import recipeSoyChiaPudding from '../recipes/soy_chia_pudding/recipe.json';
import recipeSoyChiaPuddingDe from '../recipes/soy_chia_pudding/de.json';
import recipeSoyChiaPuddingEn from '../recipes/soy_chia_pudding/en.json';
import recipeSpinachEggWrap from '../recipes/spinach_egg_wrap/recipe.json';
import recipeSpinachEggWrapDe from '../recipes/spinach_egg_wrap/de.json';
import recipeSpinachEggWrapEn from '../recipes/spinach_egg_wrap/en.json';
import recipeSpinachFetaOmelette from '../recipes/spinach_feta_omelette/recipe.json';
import recipeSpinachFetaOmeletteDe from '../recipes/spinach_feta_omelette/de.json';
import recipeSpinachFetaOmeletteEn from '../recipes/spinach_feta_omelette/en.json';
import recipeSteamedFishGinger from '../recipes/steamed_fish_ginger/recipe.json';
import recipeSteamedFishGingerDe from '../recipes/steamed_fish_ginger/de.json';
import recipeSteamedFishGingerEn from '../recipes/steamed_fish_ginger/en.json';
import recipeStuffedPeppersTurkey from '../recipes/stuffed_peppers_turkey/recipe.json';
import recipeStuffedPeppersTurkeyDe from '../recipes/stuffed_peppers_turkey/de.json';
import recipeStuffedPeppersTurkeyEn from '../recipes/stuffed_peppers_turkey/en.json';
import recipeStuffedSweetPotato from '../recipes/stuffed_sweet_potato/recipe.json';
import recipeStuffedSweetPotatoDe from '../recipes/stuffed_sweet_potato/de.json';
import recipeStuffedSweetPotatoEn from '../recipes/stuffed_sweet_potato/en.json';
import recipeSummerRolls from '../recipes/summer_rolls/recipe.json';
import recipeSummerRollsDe from '../recipes/summer_rolls/de.json';
import recipeSummerRollsEn from '../recipes/summer_rolls/en.json';
import recipeSundubuJjigae from '../recipes/sundubu_jjigae/recipe.json';
import recipeSundubuJjigaeDe from '../recipes/sundubu_jjigae/de.json';
import recipeSundubuJjigaeEn from '../recipes/sundubu_jjigae/en.json';
import recipeSwissCottageRadishBread from '../recipes/swiss_cottage_radish_bread/recipe.json';
import recipeSwissCottageRadishBreadDe from '../recipes/swiss_cottage_radish_bread/de.json';
import recipeSwissCottageRadishBreadEn from '../recipes/swiss_cottage_radish_bread/en.json';
import recipeTamagoyakiEdamame from '../recipes/tamagoyaki_edamame/recipe.json';
import recipeTamagoyakiEdamameDe from '../recipes/tamagoyaki_edamame/de.json';
import recipeTamagoyakiEdamameEn from '../recipes/tamagoyaki_edamame/en.json';
import recipeTandooriChickenSalad from '../recipes/tandoori_chicken_salad/recipe.json';
import recipeTandooriChickenSaladDe from '../recipes/tandoori_chicken_salad/de.json';
import recipeTandooriChickenSaladEn from '../recipes/tandoori_chicken_salad/en.json';
import recipeTapiocaEggCheese from '../recipes/tapioca_egg_cheese/recipe.json';
import recipeTapiocaEggCheeseDe from '../recipes/tapioca_egg_cheese/de.json';
import recipeTapiocaEggCheeseEn from '../recipes/tapioca_egg_cheese/en.json';
import recipeTempehStirfry from '../recipes/tempeh_stirfry/recipe.json';
import recipeTempehStirfryDe from '../recipes/tempeh_stirfry/de.json';
import recipeTempehStirfryEn from '../recipes/tempeh_stirfry/en.json';
import recipeTeriyakiTofu from '../recipes/teriyaki_tofu/recipe.json';
import recipeTeriyakiTofuDe from '../recipes/teriyaki_tofu/de.json';
import recipeTeriyakiTofuEn from '../recipes/teriyaki_tofu/en.json';
import recipeThaiCurry from '../recipes/thai_curry/recipe.json';
import recipeThaiCurryDe from '../recipes/thai_curry/de.json';
import recipeThaiCurryEn from '../recipes/thai_curry/en.json';
import recipeTikkaMasalaLight from '../recipes/tikka_masala_light/recipe.json';
import recipeTikkaMasalaLightDe from '../recipes/tikka_masala_light/de.json';
import recipeTikkaMasalaLightEn from '../recipes/tikka_masala_light/en.json';
import recipeTofuPoke from '../recipes/tofu_poke/recipe.json';
import recipeTofuPokeDe from '../recipes/tofu_poke/de.json';
import recipeTofuPokeEn from '../recipes/tofu_poke/en.json';
import recipeTofuScramble from '../recipes/tofu_scramble/recipe.json';
import recipeTofuScrambleDe from '../recipes/tofu_scramble/de.json';
import recipeTofuScrambleEn from '../recipes/tofu_scramble/en.json';
import recipeTomYumShrimp from '../recipes/tom_yum_shrimp/recipe.json';
import recipeTomYumShrimpDe from '../recipes/tom_yum_shrimp/de.json';
import recipeTomYumShrimpEn from '../recipes/tom_yum_shrimp/en.json';
import recipeTonnoFagioli from '../recipes/tonno_fagioli/recipe.json';
import recipeTonnoFagioliDe from '../recipes/tonno_fagioli/de.json';
import recipeTonnoFagioliEn from '../recipes/tonno_fagioli/en.json';
import recipeTroutPotatoSalad from '../recipes/trout_potato_salad/recipe.json';
import recipeTroutPotatoSaladDe from '../recipes/trout_potato_salad/de.json';
import recipeTroutPotatoSaladEn from '../recipes/trout_potato_salad/en.json';
import recipeTunaAvocado from '../recipes/tuna_avocado/recipe.json';
import recipeTunaAvocadoDe from '../recipes/tuna_avocado/de.json';
import recipeTunaAvocadoEn from '../recipes/tuna_avocado/en.json';
import recipeTunaNicoise from '../recipes/tuna_nicoise/recipe.json';
import recipeTunaNicoiseDe from '../recipes/tuna_nicoise/de.json';
import recipeTunaNicoiseEn from '../recipes/tuna_nicoise/en.json';
import recipeTunaOnigiri from '../recipes/tuna_onigiri/recipe.json';
import recipeTunaOnigiriDe from '../recipes/tuna_onigiri/de.json';
import recipeTunaOnigiriEn from '../recipes/tuna_onigiri/en.json';
import recipeTunaPastaSalad from '../recipes/tuna_pasta_salad/recipe.json';
import recipeTunaPastaSaladDe from '../recipes/tuna_pasta_salad/de.json';
import recipeTunaPastaSaladEn from '../recipes/tuna_pasta_salad/en.json';
import recipeTunaRiceCakes from '../recipes/tuna_rice_cakes/recipe.json';
import recipeTunaRiceCakesDe from '../recipes/tuna_rice_cakes/de.json';
import recipeTunaRiceCakesEn from '../recipes/tuna_rice_cakes/en.json';
import recipeTurkeyBolognese from '../recipes/turkey_bolognese/recipe.json';
import recipeTurkeyBologneseDe from '../recipes/turkey_bolognese/de.json';
import recipeTurkeyBologneseEn from '../recipes/turkey_bolognese/en.json';
import recipeTurkeyMeatballs from '../recipes/turkey_meatballs/recipe.json';
import recipeTurkeyMeatballsDe from '../recipes/turkey_meatballs/de.json';
import recipeTurkeyMeatballsEn from '../recipes/turkey_meatballs/en.json';
import recipeTurkeyRollups from '../recipes/turkey_rollups/recipe.json';
import recipeTurkeyRollupsDe from '../recipes/turkey_rollups/de.json';
import recipeTurkeyRollupsEn from '../recipes/turkey_rollups/en.json';
import recipeTurkeyVeggieWrap from '../recipes/turkey_veggie_wrap/recipe.json';
import recipeTurkeyVeggieWrapDe from '../recipes/turkey_veggie_wrap/de.json';
import recipeTurkeyVeggieWrapEn from '../recipes/turkey_veggie_wrap/en.json';
import recipeTzatzikiPita from '../recipes/tzatziki_pita/recipe.json';
import recipeTzatzikiPitaDe from '../recipes/tzatziki_pita/de.json';
import recipeTzatzikiPitaEn from '../recipes/tzatziki_pita/en.json';
import recipeVeggieEggMuffins from '../recipes/veggie_egg_muffins/recipe.json';
import recipeVeggieEggMuffinsDe from '../recipes/veggie_egg_muffins/de.json';
import recipeVeggieEggMuffinsEn from '../recipes/veggie_egg_muffins/en.json';
import recipeVeggieOmelette from '../recipes/veggie_omelette/recipe.json';
import recipeVeggieOmeletteDe from '../recipes/veggie_omelette/de.json';
import recipeVeggieOmeletteEn from '../recipes/veggie_omelette/en.json';
import recipeVitaminaBanana from '../recipes/vitamina_banana/recipe.json';
import recipeVitaminaBananaDe from '../recipes/vitamina_banana/de.json';
import recipeVitaminaBananaEn from '../recipes/vitamina_banana/en.json';
import recipeWhitefishPotatoes from '../recipes/whitefish_potatoes/recipe.json';
import recipeWhitefishPotatoesDe from '../recipes/whitefish_potatoes/de.json';
import recipeWhitefishPotatoesEn from '../recipes/whitefish_potatoes/en.json';
import recipeYogurtBowl from '../recipes/yogurt_bowl/recipe.json';
import recipeYogurtBowlDe from '../recipes/yogurt_bowl/de.json';
import recipeYogurtBowlEn from '../recipes/yogurt_bowl/en.json';
import recipeYumNua from '../recipes/yum_nua/recipe.json';
import recipeYumNuaDe from '../recipes/yum_nua/de.json';
import recipeYumNuaEn from '../recipes/yum_nua/en.json';
import recipeZurichGeschnetzeltes from '../recipes/zurich_geschnetzeltes/recipe.json';
import recipeZurichGeschnetzeltesDe from '../recipes/zurich_geschnetzeltes/de.json';
import recipeZurichGeschnetzeltesEn from '../recipes/zurich_geschnetzeltes/en.json';
import imgBirchermuesliFull from '../images/recipes/birchermuesli.webp';
import imgBirchermuesliThumb from '../images/recipes/birchermuesli-thumb.webp';
import imgLentilCurryFull from '../images/recipes/lentil_curry.webp';
import imgLentilCurryThumb from '../images/recipes/lentil_curry-thumb.webp';
import imgOvenSalmonFull from '../images/recipes/oven_salmon.webp';
import imgOvenSalmonThumb from '../images/recipes/oven_salmon-thumb.webp';
import imgPhoFull from '../images/recipes/pho.webp';
import imgPhoThumb from '../images/recipes/pho-thumb.webp';
import imgThaiCurryFull from '../images/recipes/thai_curry.webp';
import imgThaiCurryThumb from '../images/recipes/thai_curry-thumb.webp';

export const CATALOG_SOURCE: FoodCatalogSourceMeta = foodsFile.source;
export const FOODS: readonly Food[] = foodsFile.foods as unknown as readonly Food[];

export const GLOSSARY_LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt'] as const;
export const GLOSSARIES: Readonly<Record<string, FoodGlossary>> = {
  de: glossaryDe,
  en: glossaryEn,
  es: glossaryEs,
  fr: glossaryFr,
  it: glossaryIt,
  ja: glossaryJa,
  pt: glossaryPt,
};

export const RECIPE_TITLE_LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt'] as const;
export const RECIPE_TITLES: Readonly<Record<string, RecipeTitles>> = {
  de: recipeTitlesDe,
  en: recipeTitlesEn,
  es: recipeTitlesEs,
  fr: recipeTitlesFr,
  it: recipeTitlesIt,
  ja: recipeTitlesJa,
  pt: recipeTitlesPt,
};

export const RECIPES: readonly Recipe[] = [
  recipeAcaiSkyrBowl as unknown as Recipe,
  recipeAjiDeGallinaLight as unknown as Recipe,
  recipeAlplerMagronenLight as unknown as Recipe,
  recipeAppleSkyrPbDip as unknown as Recipe,
  recipeAvocadoEggToast as unknown as Recipe,
  recipeBacalhauGrao as unknown as Recipe,
  recipeBakedCodTomatoes as unknown as Recipe,
  recipeBakedFalafelBowl as unknown as Recipe,
  recipeBakedFetaChickpeas as unknown as Recipe,
  recipeBananaProteinShake as unknown as Recipe,
  recipeBanhMiBowl as unknown as Recipe,
  recipeBarleyRisottoChicken as unknown as Recipe,
  recipeBeefBroccoli as unknown as Recipe,
  recipeBeefFajitaBowl as unknown as Recipe,
  recipeBeefKoftaYogurt as unknown as Recipe,
  recipeBeefSteakVegetables as unknown as Recipe,
  recipeBerryProteinSmoothie as unknown as Recipe,
  recipeBibimbap as unknown as Recipe,
  recipeBirchermuesli as unknown as Recipe,
  recipeBlackBeanSoup as unknown as Recipe,
  recipeBoboCamarao as unknown as Recipe,
  recipeBreakfastBurrito as unknown as Recipe,
  recipeBresaolaRocketToast as unknown as Recipe,
  recipeBresaolaRolls as unknown as Recipe,
  recipeBuckwheatGalette as unknown as Recipe,
  recipeBulgogi as unknown as Recipe,
  recipeBunChayTofu as unknown as Recipe,
  recipeBundnerBarleySoup as unknown as Recipe,
  recipeBundnerfleischCrispbread as unknown as Recipe,
  recipeBurritoBowl as unknown as Recipe,
  recipeCaKho as unknown as Recipe,
  recipeCaldoVerdeBeans as unknown as Recipe,
  recipeCevicheSweetPotato as unknown as Recipe,
  recipeChanaMasala as unknown as Recipe,
  recipeChiaSkyrMango as unknown as Recipe,
  recipeChickenBowl as unknown as Recipe,
  recipeChickenCaesarLight as unknown as Recipe,
  recipeChickenCapreseSalad as unknown as Recipe,
  recipeChickenCongee as unknown as Recipe,
  recipeChickenFajitas as unknown as Recipe,
  recipeChickenPiccata as unknown as Recipe,
  recipeChickenSataySkewers as unknown as Recipe,
  recipeChickenShawarmaBowl as unknown as Recipe,
  recipeChickenSouvlaki as unknown as Recipe,
  recipeChickenSweetPotatoTraybake as unknown as Recipe,
  recipeChickenTagine as unknown as Recipe,
  recipeChickenTortillaSoup as unknown as Recipe,
  recipeChickenVegetableSoup as unknown as Recipe,
  recipeChickpeaChaat as unknown as Recipe,
  recipeChickpeaTunaSalad as unknown as Recipe,
  recipeChiliConCarne as unknown as Recipe,
  recipeChiliSinCarne as unknown as Recipe,
  recipeCilbir as unknown as Recipe,
  recipeCocoaProteinMilk as unknown as Recipe,
  recipeCodDillMustard as unknown as Recipe,
  recipeColdSobaTofu as unknown as Recipe,
  recipeCottageCrispbread as unknown as Recipe,
  recipeCottagePineapple as unknown as Recipe,
  recipeCottageTomatoToast as unknown as Recipe,
  recipeCottageZucchiniFrittata as unknown as Recipe,
  recipeCouscousChickenSalad as unknown as Recipe,
  recipeCrepiocaChicken as unknown as Recipe,
  recipeCuscuzEgg as unknown as Recipe,
  recipeDakgalbi as unknown as Recipe,
  recipeDeviledEggsYogurt as unknown as Recipe,
  recipeEdamameHummus as unknown as Recipe,
  recipeEdamameQuinoaBowl as unknown as Recipe,
  recipeEdamameSeaSalt as unknown as Recipe,
  recipeEggSaladSandwich as unknown as Recipe,
  recipeEggsCucumber as unknown as Recipe,
  recipeEspinacasGarbanzos as unknown as Recipe,
  recipeFeijoadaLight as unknown as Recipe,
  recipeFrangoPiriPiri as unknown as Recipe,
  recipeGaXaoSaOt as unknown as Recipe,
  recipeGadoGado as unknown as Recipe,
  recipeGalinhada as unknown as Recipe,
  recipeGazpachoShrimp as unknown as Recipe,
  recipeGoiGa as unknown as Recipe,
  recipeGreekChickenSalad as unknown as Recipe,
  recipeGreekYogurtWalnut as unknown as Recipe,
  recipeGreenCurryShrimp as unknown as Recipe,
  recipeGreenShakshuka as unknown as Recipe,
  recipeGreenSkyrSmoothie as unknown as Recipe,
  recipeGyeranJjim as unknown as Recipe,
  recipeGyudonLight as unknown as Recipe,
  recipeHalloumiLentilSalad as unknown as Recipe,
  recipeHarira as unknown as Recipe,
  recipeHotSourTofuSoup as unknown as Recipe,
  recipeHuevosRancheros as unknown as Recipe,
  recipeHummusVeggieSticks as unknown as Recipe,
  recipeHummusWrap as unknown as Recipe,
  recipeJapaneseChickenCurry as unknown as Recipe,
  recipeJapaneseSalmonBreakfast as unknown as Recipe,
  recipeKeralaFishCurry as unknown as Recipe,
  recipeKimchiScrambledEggs as unknown as Recipe,
  recipeKungPaoChicken as unknown as Recipe,
  recipeLabnehZaatar as unknown as Recipe,
  recipeLarbGai as unknown as Recipe,
  recipeLentilBolognese as unknown as Recipe,
  recipeLentilCurry as unknown as Recipe,
  recipeLentilFetaSalad as unknown as Recipe,
  recipeLomoSaltado as unknown as Recipe,
  recipeMapoTofu as unknown as Recipe,
  recipeMasalaOmelette as unknown as Recipe,
  recipeMenemen as unknown as Recipe,
  recipeMinestroneBeans as unknown as Recipe,
  recipeMisoSalmon as unknown as Recipe,
  recipeMoongDalChilla as unknown as Recipe,
  recipeMoqueca as unknown as Recipe,
  recipeMozzarellaTomatoSkewers as unknown as Recipe,
  recipeMushroomPolenta as unknown as Recipe,
  recipeNasiGoreng as unknown as Recipe,
  recipeOatPorridgeQuark as unknown as Recipe,
  recipeOvenSalmon as unknown as Recipe,
  recipeOvernightOatsQuark as unknown as Recipe,
  recipeOyakodon as unknown as Recipe,
  recipePadKraPao as unknown as Recipe,
  recipePadThaiChicken as unknown as Recipe,
  recipePalakDal as unknown as Recipe,
  recipePalakPaneerLight as unknown as Recipe,
  recipePaneerTikkaBites as unknown as Recipe,
  recipePaneerTikkaWrap as unknown as Recipe,
  recipePbBananaSoyOats as unknown as Recipe,
  recipePescadoVeracruzana as unknown as Recipe,
  recipePho as unknown as Recipe,
  recipePicadinho as unknown as Recipe,
  recipePolloAlAjillo as unknown as Recipe,
  recipePouletProvencal as unknown as Recipe,
  recipePratoFeito as unknown as Recipe,
  recipeProteinEnergyBalls as unknown as Recipe,
  recipeProteinPancakes as unknown as Recipe,
  recipeQuarkBerries as unknown as Recipe,
  recipeQuarkBircher as unknown as Recipe,
  recipeQuinoaBreakfastPorridge as unknown as Recipe,
  recipeQuinoaFetaSalad as unknown as Recipe,
  recipeQuinoaPan as unknown as Recipe,
  recipeRajma as unknown as Recipe,
  recipeRatatouilleWhiteBeans as unknown as Recipe,
  recipeRicottaBerryToast as unknown as Recipe,
  recipeRoastedChickpeas as unknown as Recipe,
  recipeRostiFriedEgg as unknown as Recipe,
  recipeSabaShioyaki as unknown as Recipe,
  recipeSalmonCucumberBites as unknown as Recipe,
  recipeSalmonPoke as unknown as Recipe,
  recipeSalmonPuyLentils as unknown as Recipe,
  recipeSalpicaoFrango as unknown as Recipe,
  recipeScrambledEggs as unknown as Recipe,
  recipeSeafoodPaella as unknown as Recipe,
  recipeSesameTofuBites as unknown as Recipe,
  recipeShakshuka as unknown as Recipe,
  recipeShrimpCocktail as unknown as Recipe,
  recipeShrimpGarlicPasta as unknown as Recipe,
  recipeShrimpSaganaki as unknown as Recipe,
  recipeShrimpTacos as unknown as Recipe,
  recipeSilkenChocolateMousse as unknown as Recipe,
  recipeSilkenTofuSmoothie as unknown as Recipe,
  recipeSkagenToast as unknown as Recipe,
  recipeSkyrAppleCompote as unknown as Recipe,
  recipeSkyrBerryBark as unknown as Recipe,
  recipeSkyrBerryBowl as unknown as Recipe,
  recipeSkyrHerbDip as unknown as Recipe,
  recipeSmokedSalmonBread as unknown as Recipe,
  recipeSoyChiaPudding as unknown as Recipe,
  recipeSpinachEggWrap as unknown as Recipe,
  recipeSpinachFetaOmelette as unknown as Recipe,
  recipeSteamedFishGinger as unknown as Recipe,
  recipeStuffedPeppersTurkey as unknown as Recipe,
  recipeStuffedSweetPotato as unknown as Recipe,
  recipeSummerRolls as unknown as Recipe,
  recipeSundubuJjigae as unknown as Recipe,
  recipeSwissCottageRadishBread as unknown as Recipe,
  recipeTamagoyakiEdamame as unknown as Recipe,
  recipeTandooriChickenSalad as unknown as Recipe,
  recipeTapiocaEggCheese as unknown as Recipe,
  recipeTempehStirfry as unknown as Recipe,
  recipeTeriyakiTofu as unknown as Recipe,
  recipeThaiCurry as unknown as Recipe,
  recipeTikkaMasalaLight as unknown as Recipe,
  recipeTofuPoke as unknown as Recipe,
  recipeTofuScramble as unknown as Recipe,
  recipeTomYumShrimp as unknown as Recipe,
  recipeTonnoFagioli as unknown as Recipe,
  recipeTroutPotatoSalad as unknown as Recipe,
  recipeTunaAvocado as unknown as Recipe,
  recipeTunaNicoise as unknown as Recipe,
  recipeTunaOnigiri as unknown as Recipe,
  recipeTunaPastaSalad as unknown as Recipe,
  recipeTunaRiceCakes as unknown as Recipe,
  recipeTurkeyBolognese as unknown as Recipe,
  recipeTurkeyMeatballs as unknown as Recipe,
  recipeTurkeyRollups as unknown as Recipe,
  recipeTurkeyVeggieWrap as unknown as Recipe,
  recipeTzatzikiPita as unknown as Recipe,
  recipeVeggieEggMuffins as unknown as Recipe,
  recipeVeggieOmelette as unknown as Recipe,
  recipeVitaminaBanana as unknown as Recipe,
  recipeWhitefishPotatoes as unknown as Recipe,
  recipeYogurtBowl as unknown as Recipe,
  recipeYumNua as unknown as Recipe,
  recipeZurichGeschnetzeltes as unknown as Recipe,
];

export const RECIPE_LOCALES: Readonly<Record<string, Readonly<Record<string, RecipeLocaleText>>>> = {
  acai_skyr_bowl: {
    de: recipeAcaiSkyrBowlDe,
    en: recipeAcaiSkyrBowlEn,
  },
  aji_de_gallina_light: {
    de: recipeAjiDeGallinaLightDe,
    en: recipeAjiDeGallinaLightEn,
  },
  alpler_magronen_light: {
    de: recipeAlplerMagronenLightDe,
    en: recipeAlplerMagronenLightEn,
  },
  apple_skyr_pb_dip: {
    de: recipeAppleSkyrPbDipDe,
    en: recipeAppleSkyrPbDipEn,
  },
  avocado_egg_toast: {
    de: recipeAvocadoEggToastDe,
    en: recipeAvocadoEggToastEn,
  },
  bacalhau_grao: {
    de: recipeBacalhauGraoDe,
    en: recipeBacalhauGraoEn,
  },
  baked_cod_tomatoes: {
    de: recipeBakedCodTomatoesDe,
    en: recipeBakedCodTomatoesEn,
  },
  baked_falafel_bowl: {
    de: recipeBakedFalafelBowlDe,
    en: recipeBakedFalafelBowlEn,
  },
  baked_feta_chickpeas: {
    de: recipeBakedFetaChickpeasDe,
    en: recipeBakedFetaChickpeasEn,
  },
  banana_protein_shake: {
    de: recipeBananaProteinShakeDe,
    en: recipeBananaProteinShakeEn,
  },
  banh_mi_bowl: {
    de: recipeBanhMiBowlDe,
    en: recipeBanhMiBowlEn,
  },
  barley_risotto_chicken: {
    de: recipeBarleyRisottoChickenDe,
    en: recipeBarleyRisottoChickenEn,
  },
  beef_broccoli: {
    de: recipeBeefBroccoliDe,
    en: recipeBeefBroccoliEn,
  },
  beef_fajita_bowl: {
    de: recipeBeefFajitaBowlDe,
    en: recipeBeefFajitaBowlEn,
  },
  beef_kofta_yogurt: {
    de: recipeBeefKoftaYogurtDe,
    en: recipeBeefKoftaYogurtEn,
  },
  beef_steak_vegetables: {
    de: recipeBeefSteakVegetablesDe,
    en: recipeBeefSteakVegetablesEn,
  },
  berry_protein_smoothie: {
    de: recipeBerryProteinSmoothieDe,
    en: recipeBerryProteinSmoothieEn,
  },
  bibimbap: {
    de: recipeBibimbapDe,
    en: recipeBibimbapEn,
  },
  birchermuesli: {
    de: recipeBirchermuesliDe,
    en: recipeBirchermuesliEn,
  },
  black_bean_soup: {
    de: recipeBlackBeanSoupDe,
    en: recipeBlackBeanSoupEn,
  },
  bobo_camarao: {
    de: recipeBoboCamaraoDe,
    en: recipeBoboCamaraoEn,
  },
  breakfast_burrito: {
    de: recipeBreakfastBurritoDe,
    en: recipeBreakfastBurritoEn,
  },
  bresaola_rocket_toast: {
    de: recipeBresaolaRocketToastDe,
    en: recipeBresaolaRocketToastEn,
  },
  bresaola_rolls: {
    de: recipeBresaolaRollsDe,
    en: recipeBresaolaRollsEn,
  },
  buckwheat_galette: {
    de: recipeBuckwheatGaletteDe,
    en: recipeBuckwheatGaletteEn,
  },
  bulgogi: {
    de: recipeBulgogiDe,
    en: recipeBulgogiEn,
  },
  bun_chay_tofu: {
    de: recipeBunChayTofuDe,
    en: recipeBunChayTofuEn,
  },
  bundner_barley_soup: {
    de: recipeBundnerBarleySoupDe,
    en: recipeBundnerBarleySoupEn,
  },
  bundnerfleisch_crispbread: {
    de: recipeBundnerfleischCrispbreadDe,
    en: recipeBundnerfleischCrispbreadEn,
  },
  burrito_bowl: {
    de: recipeBurritoBowlDe,
    en: recipeBurritoBowlEn,
  },
  ca_kho: {
    de: recipeCaKhoDe,
    en: recipeCaKhoEn,
  },
  caldo_verde_beans: {
    de: recipeCaldoVerdeBeansDe,
    en: recipeCaldoVerdeBeansEn,
  },
  ceviche_sweet_potato: {
    de: recipeCevicheSweetPotatoDe,
    en: recipeCevicheSweetPotatoEn,
  },
  chana_masala: {
    de: recipeChanaMasalaDe,
    en: recipeChanaMasalaEn,
  },
  chia_skyr_mango: {
    de: recipeChiaSkyrMangoDe,
    en: recipeChiaSkyrMangoEn,
  },
  chicken_bowl: {
    de: recipeChickenBowlDe,
    en: recipeChickenBowlEn,
  },
  chicken_caesar_light: {
    de: recipeChickenCaesarLightDe,
    en: recipeChickenCaesarLightEn,
  },
  chicken_caprese_salad: {
    de: recipeChickenCapreseSaladDe,
    en: recipeChickenCapreseSaladEn,
  },
  chicken_congee: {
    de: recipeChickenCongeeDe,
    en: recipeChickenCongeeEn,
  },
  chicken_fajitas: {
    de: recipeChickenFajitasDe,
    en: recipeChickenFajitasEn,
  },
  chicken_piccata: {
    de: recipeChickenPiccataDe,
    en: recipeChickenPiccataEn,
  },
  chicken_satay_skewers: {
    de: recipeChickenSataySkewersDe,
    en: recipeChickenSataySkewersEn,
  },
  chicken_shawarma_bowl: {
    de: recipeChickenShawarmaBowlDe,
    en: recipeChickenShawarmaBowlEn,
  },
  chicken_souvlaki: {
    de: recipeChickenSouvlakiDe,
    en: recipeChickenSouvlakiEn,
  },
  chicken_sweet_potato_traybake: {
    de: recipeChickenSweetPotatoTraybakeDe,
    en: recipeChickenSweetPotatoTraybakeEn,
  },
  chicken_tagine: {
    de: recipeChickenTagineDe,
    en: recipeChickenTagineEn,
  },
  chicken_tortilla_soup: {
    de: recipeChickenTortillaSoupDe,
    en: recipeChickenTortillaSoupEn,
  },
  chicken_vegetable_soup: {
    de: recipeChickenVegetableSoupDe,
    en: recipeChickenVegetableSoupEn,
  },
  chickpea_chaat: {
    de: recipeChickpeaChaatDe,
    en: recipeChickpeaChaatEn,
  },
  chickpea_tuna_salad: {
    de: recipeChickpeaTunaSaladDe,
    en: recipeChickpeaTunaSaladEn,
  },
  chili_con_carne: {
    de: recipeChiliConCarneDe,
    en: recipeChiliConCarneEn,
  },
  chili_sin_carne: {
    de: recipeChiliSinCarneDe,
    en: recipeChiliSinCarneEn,
  },
  cilbir: {
    de: recipeCilbirDe,
    en: recipeCilbirEn,
  },
  cocoa_protein_milk: {
    de: recipeCocoaProteinMilkDe,
    en: recipeCocoaProteinMilkEn,
  },
  cod_dill_mustard: {
    de: recipeCodDillMustardDe,
    en: recipeCodDillMustardEn,
  },
  cold_soba_tofu: {
    de: recipeColdSobaTofuDe,
    en: recipeColdSobaTofuEn,
  },
  cottage_crispbread: {
    de: recipeCottageCrispbreadDe,
    en: recipeCottageCrispbreadEn,
  },
  cottage_pineapple: {
    de: recipeCottagePineappleDe,
    en: recipeCottagePineappleEn,
  },
  cottage_tomato_toast: {
    de: recipeCottageTomatoToastDe,
    en: recipeCottageTomatoToastEn,
  },
  cottage_zucchini_frittata: {
    de: recipeCottageZucchiniFrittataDe,
    en: recipeCottageZucchiniFrittataEn,
  },
  couscous_chicken_salad: {
    de: recipeCouscousChickenSaladDe,
    en: recipeCouscousChickenSaladEn,
  },
  crepioca_chicken: {
    de: recipeCrepiocaChickenDe,
    en: recipeCrepiocaChickenEn,
  },
  cuscuz_egg: {
    de: recipeCuscuzEggDe,
    en: recipeCuscuzEggEn,
  },
  dakgalbi: {
    de: recipeDakgalbiDe,
    en: recipeDakgalbiEn,
  },
  deviled_eggs_yogurt: {
    de: recipeDeviledEggsYogurtDe,
    en: recipeDeviledEggsYogurtEn,
  },
  edamame_hummus: {
    de: recipeEdamameHummusDe,
    en: recipeEdamameHummusEn,
  },
  edamame_quinoa_bowl: {
    de: recipeEdamameQuinoaBowlDe,
    en: recipeEdamameQuinoaBowlEn,
  },
  edamame_sea_salt: {
    de: recipeEdamameSeaSaltDe,
    en: recipeEdamameSeaSaltEn,
  },
  egg_salad_sandwich: {
    de: recipeEggSaladSandwichDe,
    en: recipeEggSaladSandwichEn,
  },
  eggs_cucumber: {
    de: recipeEggsCucumberDe,
    en: recipeEggsCucumberEn,
  },
  espinacas_garbanzos: {
    de: recipeEspinacasGarbanzosDe,
    en: recipeEspinacasGarbanzosEn,
  },
  feijoada_light: {
    de: recipeFeijoadaLightDe,
    en: recipeFeijoadaLightEn,
  },
  frango_piri_piri: {
    de: recipeFrangoPiriPiriDe,
    en: recipeFrangoPiriPiriEn,
  },
  ga_xao_sa_ot: {
    de: recipeGaXaoSaOtDe,
    en: recipeGaXaoSaOtEn,
  },
  gado_gado: {
    de: recipeGadoGadoDe,
    en: recipeGadoGadoEn,
  },
  galinhada: {
    de: recipeGalinhadaDe,
    en: recipeGalinhadaEn,
  },
  gazpacho_shrimp: {
    de: recipeGazpachoShrimpDe,
    en: recipeGazpachoShrimpEn,
  },
  goi_ga: {
    de: recipeGoiGaDe,
    en: recipeGoiGaEn,
  },
  greek_chicken_salad: {
    de: recipeGreekChickenSaladDe,
    en: recipeGreekChickenSaladEn,
  },
  greek_yogurt_walnut: {
    de: recipeGreekYogurtWalnutDe,
    en: recipeGreekYogurtWalnutEn,
  },
  green_curry_shrimp: {
    de: recipeGreenCurryShrimpDe,
    en: recipeGreenCurryShrimpEn,
  },
  green_shakshuka: {
    de: recipeGreenShakshukaDe,
    en: recipeGreenShakshukaEn,
  },
  green_skyr_smoothie: {
    de: recipeGreenSkyrSmoothieDe,
    en: recipeGreenSkyrSmoothieEn,
  },
  gyeran_jjim: {
    de: recipeGyeranJjimDe,
    en: recipeGyeranJjimEn,
  },
  gyudon_light: {
    de: recipeGyudonLightDe,
    en: recipeGyudonLightEn,
  },
  halloumi_lentil_salad: {
    de: recipeHalloumiLentilSaladDe,
    en: recipeHalloumiLentilSaladEn,
  },
  harira: {
    de: recipeHariraDe,
    en: recipeHariraEn,
  },
  hot_sour_tofu_soup: {
    de: recipeHotSourTofuSoupDe,
    en: recipeHotSourTofuSoupEn,
  },
  huevos_rancheros: {
    de: recipeHuevosRancherosDe,
    en: recipeHuevosRancherosEn,
  },
  hummus_veggie_sticks: {
    de: recipeHummusVeggieSticksDe,
    en: recipeHummusVeggieSticksEn,
  },
  hummus_wrap: {
    de: recipeHummusWrapDe,
    en: recipeHummusWrapEn,
  },
  japanese_chicken_curry: {
    de: recipeJapaneseChickenCurryDe,
    en: recipeJapaneseChickenCurryEn,
  },
  japanese_salmon_breakfast: {
    de: recipeJapaneseSalmonBreakfastDe,
    en: recipeJapaneseSalmonBreakfastEn,
  },
  kerala_fish_curry: {
    de: recipeKeralaFishCurryDe,
    en: recipeKeralaFishCurryEn,
  },
  kimchi_scrambled_eggs: {
    de: recipeKimchiScrambledEggsDe,
    en: recipeKimchiScrambledEggsEn,
  },
  kung_pao_chicken: {
    de: recipeKungPaoChickenDe,
    en: recipeKungPaoChickenEn,
  },
  labneh_zaatar: {
    de: recipeLabnehZaatarDe,
    en: recipeLabnehZaatarEn,
  },
  larb_gai: {
    de: recipeLarbGaiDe,
    en: recipeLarbGaiEn,
  },
  lentil_bolognese: {
    de: recipeLentilBologneseDe,
    en: recipeLentilBologneseEn,
  },
  lentil_curry: {
    de: recipeLentilCurryDe,
    en: recipeLentilCurryEn,
  },
  lentil_feta_salad: {
    de: recipeLentilFetaSaladDe,
    en: recipeLentilFetaSaladEn,
  },
  lomo_saltado: {
    de: recipeLomoSaltadoDe,
    en: recipeLomoSaltadoEn,
  },
  mapo_tofu: {
    de: recipeMapoTofuDe,
    en: recipeMapoTofuEn,
  },
  masala_omelette: {
    de: recipeMasalaOmeletteDe,
    en: recipeMasalaOmeletteEn,
  },
  menemen: {
    de: recipeMenemenDe,
    en: recipeMenemenEn,
  },
  minestrone_beans: {
    de: recipeMinestroneBeansDe,
    en: recipeMinestroneBeansEn,
  },
  miso_salmon: {
    de: recipeMisoSalmonDe,
    en: recipeMisoSalmonEn,
  },
  moong_dal_chilla: {
    de: recipeMoongDalChillaDe,
    en: recipeMoongDalChillaEn,
  },
  moqueca: {
    de: recipeMoquecaDe,
    en: recipeMoquecaEn,
  },
  mozzarella_tomato_skewers: {
    de: recipeMozzarellaTomatoSkewersDe,
    en: recipeMozzarellaTomatoSkewersEn,
  },
  mushroom_polenta: {
    de: recipeMushroomPolentaDe,
    en: recipeMushroomPolentaEn,
  },
  nasi_goreng: {
    de: recipeNasiGorengDe,
    en: recipeNasiGorengEn,
  },
  oat_porridge_quark: {
    de: recipeOatPorridgeQuarkDe,
    en: recipeOatPorridgeQuarkEn,
  },
  oven_salmon: {
    de: recipeOvenSalmonDe,
    en: recipeOvenSalmonEn,
  },
  overnight_oats_quark: {
    de: recipeOvernightOatsQuarkDe,
    en: recipeOvernightOatsQuarkEn,
  },
  oyakodon: {
    de: recipeOyakodonDe,
    en: recipeOyakodonEn,
  },
  pad_kra_pao: {
    de: recipePadKraPaoDe,
    en: recipePadKraPaoEn,
  },
  pad_thai_chicken: {
    de: recipePadThaiChickenDe,
    en: recipePadThaiChickenEn,
  },
  palak_dal: {
    de: recipePalakDalDe,
    en: recipePalakDalEn,
  },
  palak_paneer_light: {
    de: recipePalakPaneerLightDe,
    en: recipePalakPaneerLightEn,
  },
  paneer_tikka_bites: {
    de: recipePaneerTikkaBitesDe,
    en: recipePaneerTikkaBitesEn,
  },
  paneer_tikka_wrap: {
    de: recipePaneerTikkaWrapDe,
    en: recipePaneerTikkaWrapEn,
  },
  pb_banana_soy_oats: {
    de: recipePbBananaSoyOatsDe,
    en: recipePbBananaSoyOatsEn,
  },
  pescado_veracruzana: {
    de: recipePescadoVeracruzanaDe,
    en: recipePescadoVeracruzanaEn,
  },
  pho: {
    de: recipePhoDe,
    en: recipePhoEn,
  },
  picadinho: {
    de: recipePicadinhoDe,
    en: recipePicadinhoEn,
  },
  pollo_al_ajillo: {
    de: recipePolloAlAjilloDe,
    en: recipePolloAlAjilloEn,
  },
  poulet_provencal: {
    de: recipePouletProvencalDe,
    en: recipePouletProvencalEn,
  },
  prato_feito: {
    de: recipePratoFeitoDe,
    en: recipePratoFeitoEn,
  },
  protein_energy_balls: {
    de: recipeProteinEnergyBallsDe,
    en: recipeProteinEnergyBallsEn,
  },
  protein_pancakes: {
    de: recipeProteinPancakesDe,
    en: recipeProteinPancakesEn,
  },
  quark_berries: {
    de: recipeQuarkBerriesDe,
    en: recipeQuarkBerriesEn,
  },
  quark_bircher: {
    de: recipeQuarkBircherDe,
    en: recipeQuarkBircherEn,
  },
  quinoa_breakfast_porridge: {
    de: recipeQuinoaBreakfastPorridgeDe,
    en: recipeQuinoaBreakfastPorridgeEn,
  },
  quinoa_feta_salad: {
    de: recipeQuinoaFetaSaladDe,
    en: recipeQuinoaFetaSaladEn,
  },
  quinoa_pan: {
    de: recipeQuinoaPanDe,
    en: recipeQuinoaPanEn,
  },
  rajma: {
    de: recipeRajmaDe,
    en: recipeRajmaEn,
  },
  ratatouille_white_beans: {
    de: recipeRatatouilleWhiteBeansDe,
    en: recipeRatatouilleWhiteBeansEn,
  },
  ricotta_berry_toast: {
    de: recipeRicottaBerryToastDe,
    en: recipeRicottaBerryToastEn,
  },
  roasted_chickpeas: {
    de: recipeRoastedChickpeasDe,
    en: recipeRoastedChickpeasEn,
  },
  rosti_fried_egg: {
    de: recipeRostiFriedEggDe,
    en: recipeRostiFriedEggEn,
  },
  saba_shioyaki: {
    de: recipeSabaShioyakiDe,
    en: recipeSabaShioyakiEn,
  },
  salmon_cucumber_bites: {
    de: recipeSalmonCucumberBitesDe,
    en: recipeSalmonCucumberBitesEn,
  },
  salmon_poke: {
    de: recipeSalmonPokeDe,
    en: recipeSalmonPokeEn,
  },
  salmon_puy_lentils: {
    de: recipeSalmonPuyLentilsDe,
    en: recipeSalmonPuyLentilsEn,
  },
  salpicao_frango: {
    de: recipeSalpicaoFrangoDe,
    en: recipeSalpicaoFrangoEn,
  },
  scrambled_eggs: {
    de: recipeScrambledEggsDe,
    en: recipeScrambledEggsEn,
  },
  seafood_paella: {
    de: recipeSeafoodPaellaDe,
    en: recipeSeafoodPaellaEn,
  },
  sesame_tofu_bites: {
    de: recipeSesameTofuBitesDe,
    en: recipeSesameTofuBitesEn,
  },
  shakshuka: {
    de: recipeShakshukaDe,
    en: recipeShakshukaEn,
  },
  shrimp_cocktail: {
    de: recipeShrimpCocktailDe,
    en: recipeShrimpCocktailEn,
  },
  shrimp_garlic_pasta: {
    de: recipeShrimpGarlicPastaDe,
    en: recipeShrimpGarlicPastaEn,
  },
  shrimp_saganaki: {
    de: recipeShrimpSaganakiDe,
    en: recipeShrimpSaganakiEn,
  },
  shrimp_tacos: {
    de: recipeShrimpTacosDe,
    en: recipeShrimpTacosEn,
  },
  silken_chocolate_mousse: {
    de: recipeSilkenChocolateMousseDe,
    en: recipeSilkenChocolateMousseEn,
  },
  silken_tofu_smoothie: {
    de: recipeSilkenTofuSmoothieDe,
    en: recipeSilkenTofuSmoothieEn,
  },
  skagen_toast: {
    de: recipeSkagenToastDe,
    en: recipeSkagenToastEn,
  },
  skyr_apple_compote: {
    de: recipeSkyrAppleCompoteDe,
    en: recipeSkyrAppleCompoteEn,
  },
  skyr_berry_bark: {
    de: recipeSkyrBerryBarkDe,
    en: recipeSkyrBerryBarkEn,
  },
  skyr_berry_bowl: {
    de: recipeSkyrBerryBowlDe,
    en: recipeSkyrBerryBowlEn,
  },
  skyr_herb_dip: {
    de: recipeSkyrHerbDipDe,
    en: recipeSkyrHerbDipEn,
  },
  smoked_salmon_bread: {
    de: recipeSmokedSalmonBreadDe,
    en: recipeSmokedSalmonBreadEn,
  },
  soy_chia_pudding: {
    de: recipeSoyChiaPuddingDe,
    en: recipeSoyChiaPuddingEn,
  },
  spinach_egg_wrap: {
    de: recipeSpinachEggWrapDe,
    en: recipeSpinachEggWrapEn,
  },
  spinach_feta_omelette: {
    de: recipeSpinachFetaOmeletteDe,
    en: recipeSpinachFetaOmeletteEn,
  },
  steamed_fish_ginger: {
    de: recipeSteamedFishGingerDe,
    en: recipeSteamedFishGingerEn,
  },
  stuffed_peppers_turkey: {
    de: recipeStuffedPeppersTurkeyDe,
    en: recipeStuffedPeppersTurkeyEn,
  },
  stuffed_sweet_potato: {
    de: recipeStuffedSweetPotatoDe,
    en: recipeStuffedSweetPotatoEn,
  },
  summer_rolls: {
    de: recipeSummerRollsDe,
    en: recipeSummerRollsEn,
  },
  sundubu_jjigae: {
    de: recipeSundubuJjigaeDe,
    en: recipeSundubuJjigaeEn,
  },
  swiss_cottage_radish_bread: {
    de: recipeSwissCottageRadishBreadDe,
    en: recipeSwissCottageRadishBreadEn,
  },
  tamagoyaki_edamame: {
    de: recipeTamagoyakiEdamameDe,
    en: recipeTamagoyakiEdamameEn,
  },
  tandoori_chicken_salad: {
    de: recipeTandooriChickenSaladDe,
    en: recipeTandooriChickenSaladEn,
  },
  tapioca_egg_cheese: {
    de: recipeTapiocaEggCheeseDe,
    en: recipeTapiocaEggCheeseEn,
  },
  tempeh_stirfry: {
    de: recipeTempehStirfryDe,
    en: recipeTempehStirfryEn,
  },
  teriyaki_tofu: {
    de: recipeTeriyakiTofuDe,
    en: recipeTeriyakiTofuEn,
  },
  thai_curry: {
    de: recipeThaiCurryDe,
    en: recipeThaiCurryEn,
  },
  tikka_masala_light: {
    de: recipeTikkaMasalaLightDe,
    en: recipeTikkaMasalaLightEn,
  },
  tofu_poke: {
    de: recipeTofuPokeDe,
    en: recipeTofuPokeEn,
  },
  tofu_scramble: {
    de: recipeTofuScrambleDe,
    en: recipeTofuScrambleEn,
  },
  tom_yum_shrimp: {
    de: recipeTomYumShrimpDe,
    en: recipeTomYumShrimpEn,
  },
  tonno_fagioli: {
    de: recipeTonnoFagioliDe,
    en: recipeTonnoFagioliEn,
  },
  trout_potato_salad: {
    de: recipeTroutPotatoSaladDe,
    en: recipeTroutPotatoSaladEn,
  },
  tuna_avocado: {
    de: recipeTunaAvocadoDe,
    en: recipeTunaAvocadoEn,
  },
  tuna_nicoise: {
    de: recipeTunaNicoiseDe,
    en: recipeTunaNicoiseEn,
  },
  tuna_onigiri: {
    de: recipeTunaOnigiriDe,
    en: recipeTunaOnigiriEn,
  },
  tuna_pasta_salad: {
    de: recipeTunaPastaSaladDe,
    en: recipeTunaPastaSaladEn,
  },
  tuna_rice_cakes: {
    de: recipeTunaRiceCakesDe,
    en: recipeTunaRiceCakesEn,
  },
  turkey_bolognese: {
    de: recipeTurkeyBologneseDe,
    en: recipeTurkeyBologneseEn,
  },
  turkey_meatballs: {
    de: recipeTurkeyMeatballsDe,
    en: recipeTurkeyMeatballsEn,
  },
  turkey_rollups: {
    de: recipeTurkeyRollupsDe,
    en: recipeTurkeyRollupsEn,
  },
  turkey_veggie_wrap: {
    de: recipeTurkeyVeggieWrapDe,
    en: recipeTurkeyVeggieWrapEn,
  },
  tzatziki_pita: {
    de: recipeTzatzikiPitaDe,
    en: recipeTzatzikiPitaEn,
  },
  veggie_egg_muffins: {
    de: recipeVeggieEggMuffinsDe,
    en: recipeVeggieEggMuffinsEn,
  },
  veggie_omelette: {
    de: recipeVeggieOmeletteDe,
    en: recipeVeggieOmeletteEn,
  },
  vitamina_banana: {
    de: recipeVitaminaBananaDe,
    en: recipeVitaminaBananaEn,
  },
  whitefish_potatoes: {
    de: recipeWhitefishPotatoesDe,
    en: recipeWhitefishPotatoesEn,
  },
  yogurt_bowl: {
    de: recipeYogurtBowlDe,
    en: recipeYogurtBowlEn,
  },
  yum_nua: {
    de: recipeYumNuaDe,
    en: recipeYumNuaEn,
  },
  zurich_geschnetzeltes: {
    de: recipeZurichGeschnetzeltesDe,
    en: recipeZurichGeschnetzeltesEn,
  },
};

export const RECIPE_IMAGES: Readonly<Record<string, RecipeImageAssets>> = {
  birchermuesli: {
    full: imgBirchermuesliFull,
    thumb: imgBirchermuesliThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  lentil_curry: {
    full: imgLentilCurryFull,
    thumb: imgLentilCurryThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  oven_salmon: {
    full: imgOvenSalmonFull,
    thumb: imgOvenSalmonThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  pho: {
    full: imgPhoFull,
    thumb: imgPhoThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  thai_curry: {
    full: imgThaiCurryFull,
    thumb: imgThaiCurryThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
};
