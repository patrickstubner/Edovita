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
import recipeAcaiSkyrBowlEs from '../recipes/acai_skyr_bowl/es.json';
import recipeAcaiSkyrBowlFr from '../recipes/acai_skyr_bowl/fr.json';
import recipeAcaiSkyrBowlIt from '../recipes/acai_skyr_bowl/it.json';
import recipeAcaiSkyrBowlJa from '../recipes/acai_skyr_bowl/ja.json';
import recipeAcaiSkyrBowlPt from '../recipes/acai_skyr_bowl/pt.json';
import recipeAjiDeGallinaLight from '../recipes/aji_de_gallina_light/recipe.json';
import recipeAjiDeGallinaLightDe from '../recipes/aji_de_gallina_light/de.json';
import recipeAjiDeGallinaLightEn from '../recipes/aji_de_gallina_light/en.json';
import recipeAjiDeGallinaLightEs from '../recipes/aji_de_gallina_light/es.json';
import recipeAjiDeGallinaLightFr from '../recipes/aji_de_gallina_light/fr.json';
import recipeAjiDeGallinaLightIt from '../recipes/aji_de_gallina_light/it.json';
import recipeAjiDeGallinaLightJa from '../recipes/aji_de_gallina_light/ja.json';
import recipeAjiDeGallinaLightPt from '../recipes/aji_de_gallina_light/pt.json';
import recipeAlplerMagronenLight from '../recipes/alpler_magronen_light/recipe.json';
import recipeAlplerMagronenLightDe from '../recipes/alpler_magronen_light/de.json';
import recipeAlplerMagronenLightEn from '../recipes/alpler_magronen_light/en.json';
import recipeAlplerMagronenLightEs from '../recipes/alpler_magronen_light/es.json';
import recipeAlplerMagronenLightFr from '../recipes/alpler_magronen_light/fr.json';
import recipeAlplerMagronenLightIt from '../recipes/alpler_magronen_light/it.json';
import recipeAlplerMagronenLightJa from '../recipes/alpler_magronen_light/ja.json';
import recipeAlplerMagronenLightPt from '../recipes/alpler_magronen_light/pt.json';
import recipeAppleSkyrPbDip from '../recipes/apple_skyr_pb_dip/recipe.json';
import recipeAppleSkyrPbDipDe from '../recipes/apple_skyr_pb_dip/de.json';
import recipeAppleSkyrPbDipEn from '../recipes/apple_skyr_pb_dip/en.json';
import recipeAppleSkyrPbDipEs from '../recipes/apple_skyr_pb_dip/es.json';
import recipeAppleSkyrPbDipFr from '../recipes/apple_skyr_pb_dip/fr.json';
import recipeAppleSkyrPbDipIt from '../recipes/apple_skyr_pb_dip/it.json';
import recipeAppleSkyrPbDipJa from '../recipes/apple_skyr_pb_dip/ja.json';
import recipeAppleSkyrPbDipPt from '../recipes/apple_skyr_pb_dip/pt.json';
import recipeAvocadoEggToast from '../recipes/avocado_egg_toast/recipe.json';
import recipeAvocadoEggToastDe from '../recipes/avocado_egg_toast/de.json';
import recipeAvocadoEggToastEn from '../recipes/avocado_egg_toast/en.json';
import recipeAvocadoEggToastEs from '../recipes/avocado_egg_toast/es.json';
import recipeAvocadoEggToastFr from '../recipes/avocado_egg_toast/fr.json';
import recipeAvocadoEggToastIt from '../recipes/avocado_egg_toast/it.json';
import recipeAvocadoEggToastJa from '../recipes/avocado_egg_toast/ja.json';
import recipeAvocadoEggToastPt from '../recipes/avocado_egg_toast/pt.json';
import recipeBacalhauGrao from '../recipes/bacalhau_grao/recipe.json';
import recipeBacalhauGraoDe from '../recipes/bacalhau_grao/de.json';
import recipeBacalhauGraoEn from '../recipes/bacalhau_grao/en.json';
import recipeBacalhauGraoEs from '../recipes/bacalhau_grao/es.json';
import recipeBacalhauGraoFr from '../recipes/bacalhau_grao/fr.json';
import recipeBacalhauGraoIt from '../recipes/bacalhau_grao/it.json';
import recipeBacalhauGraoJa from '../recipes/bacalhau_grao/ja.json';
import recipeBacalhauGraoPt from '../recipes/bacalhau_grao/pt.json';
import recipeBakedCodTomatoes from '../recipes/baked_cod_tomatoes/recipe.json';
import recipeBakedCodTomatoesDe from '../recipes/baked_cod_tomatoes/de.json';
import recipeBakedCodTomatoesEn from '../recipes/baked_cod_tomatoes/en.json';
import recipeBakedCodTomatoesEs from '../recipes/baked_cod_tomatoes/es.json';
import recipeBakedCodTomatoesFr from '../recipes/baked_cod_tomatoes/fr.json';
import recipeBakedCodTomatoesIt from '../recipes/baked_cod_tomatoes/it.json';
import recipeBakedCodTomatoesJa from '../recipes/baked_cod_tomatoes/ja.json';
import recipeBakedCodTomatoesPt from '../recipes/baked_cod_tomatoes/pt.json';
import recipeBakedFalafelBowl from '../recipes/baked_falafel_bowl/recipe.json';
import recipeBakedFalafelBowlDe from '../recipes/baked_falafel_bowl/de.json';
import recipeBakedFalafelBowlEn from '../recipes/baked_falafel_bowl/en.json';
import recipeBakedFalafelBowlEs from '../recipes/baked_falafel_bowl/es.json';
import recipeBakedFalafelBowlFr from '../recipes/baked_falafel_bowl/fr.json';
import recipeBakedFalafelBowlIt from '../recipes/baked_falafel_bowl/it.json';
import recipeBakedFalafelBowlJa from '../recipes/baked_falafel_bowl/ja.json';
import recipeBakedFalafelBowlPt from '../recipes/baked_falafel_bowl/pt.json';
import recipeBakedFetaChickpeas from '../recipes/baked_feta_chickpeas/recipe.json';
import recipeBakedFetaChickpeasDe from '../recipes/baked_feta_chickpeas/de.json';
import recipeBakedFetaChickpeasEn from '../recipes/baked_feta_chickpeas/en.json';
import recipeBakedFetaChickpeasEs from '../recipes/baked_feta_chickpeas/es.json';
import recipeBakedFetaChickpeasFr from '../recipes/baked_feta_chickpeas/fr.json';
import recipeBakedFetaChickpeasIt from '../recipes/baked_feta_chickpeas/it.json';
import recipeBakedFetaChickpeasJa from '../recipes/baked_feta_chickpeas/ja.json';
import recipeBakedFetaChickpeasPt from '../recipes/baked_feta_chickpeas/pt.json';
import recipeBananaProteinShake from '../recipes/banana_protein_shake/recipe.json';
import recipeBananaProteinShakeDe from '../recipes/banana_protein_shake/de.json';
import recipeBananaProteinShakeEn from '../recipes/banana_protein_shake/en.json';
import recipeBananaProteinShakeEs from '../recipes/banana_protein_shake/es.json';
import recipeBananaProteinShakeFr from '../recipes/banana_protein_shake/fr.json';
import recipeBananaProteinShakeIt from '../recipes/banana_protein_shake/it.json';
import recipeBananaProteinShakeJa from '../recipes/banana_protein_shake/ja.json';
import recipeBananaProteinShakePt from '../recipes/banana_protein_shake/pt.json';
import recipeBanhMiBowl from '../recipes/banh_mi_bowl/recipe.json';
import recipeBanhMiBowlDe from '../recipes/banh_mi_bowl/de.json';
import recipeBanhMiBowlEn from '../recipes/banh_mi_bowl/en.json';
import recipeBanhMiBowlEs from '../recipes/banh_mi_bowl/es.json';
import recipeBanhMiBowlFr from '../recipes/banh_mi_bowl/fr.json';
import recipeBanhMiBowlIt from '../recipes/banh_mi_bowl/it.json';
import recipeBanhMiBowlJa from '../recipes/banh_mi_bowl/ja.json';
import recipeBanhMiBowlPt from '../recipes/banh_mi_bowl/pt.json';
import recipeBarleyRisottoChicken from '../recipes/barley_risotto_chicken/recipe.json';
import recipeBarleyRisottoChickenDe from '../recipes/barley_risotto_chicken/de.json';
import recipeBarleyRisottoChickenEn from '../recipes/barley_risotto_chicken/en.json';
import recipeBarleyRisottoChickenEs from '../recipes/barley_risotto_chicken/es.json';
import recipeBarleyRisottoChickenFr from '../recipes/barley_risotto_chicken/fr.json';
import recipeBarleyRisottoChickenIt from '../recipes/barley_risotto_chicken/it.json';
import recipeBarleyRisottoChickenJa from '../recipes/barley_risotto_chicken/ja.json';
import recipeBarleyRisottoChickenPt from '../recipes/barley_risotto_chicken/pt.json';
import recipeBeefBroccoli from '../recipes/beef_broccoli/recipe.json';
import recipeBeefBroccoliDe from '../recipes/beef_broccoli/de.json';
import recipeBeefBroccoliEn from '../recipes/beef_broccoli/en.json';
import recipeBeefBroccoliEs from '../recipes/beef_broccoli/es.json';
import recipeBeefBroccoliFr from '../recipes/beef_broccoli/fr.json';
import recipeBeefBroccoliIt from '../recipes/beef_broccoli/it.json';
import recipeBeefBroccoliJa from '../recipes/beef_broccoli/ja.json';
import recipeBeefBroccoliPt from '../recipes/beef_broccoli/pt.json';
import recipeBeefFajitaBowl from '../recipes/beef_fajita_bowl/recipe.json';
import recipeBeefFajitaBowlDe from '../recipes/beef_fajita_bowl/de.json';
import recipeBeefFajitaBowlEn from '../recipes/beef_fajita_bowl/en.json';
import recipeBeefFajitaBowlEs from '../recipes/beef_fajita_bowl/es.json';
import recipeBeefFajitaBowlFr from '../recipes/beef_fajita_bowl/fr.json';
import recipeBeefFajitaBowlIt from '../recipes/beef_fajita_bowl/it.json';
import recipeBeefFajitaBowlJa from '../recipes/beef_fajita_bowl/ja.json';
import recipeBeefFajitaBowlPt from '../recipes/beef_fajita_bowl/pt.json';
import recipeBeefKoftaYogurt from '../recipes/beef_kofta_yogurt/recipe.json';
import recipeBeefKoftaYogurtDe from '../recipes/beef_kofta_yogurt/de.json';
import recipeBeefKoftaYogurtEn from '../recipes/beef_kofta_yogurt/en.json';
import recipeBeefKoftaYogurtEs from '../recipes/beef_kofta_yogurt/es.json';
import recipeBeefKoftaYogurtFr from '../recipes/beef_kofta_yogurt/fr.json';
import recipeBeefKoftaYogurtIt from '../recipes/beef_kofta_yogurt/it.json';
import recipeBeefKoftaYogurtJa from '../recipes/beef_kofta_yogurt/ja.json';
import recipeBeefKoftaYogurtPt from '../recipes/beef_kofta_yogurt/pt.json';
import recipeBeefSteakVegetables from '../recipes/beef_steak_vegetables/recipe.json';
import recipeBeefSteakVegetablesDe from '../recipes/beef_steak_vegetables/de.json';
import recipeBeefSteakVegetablesEn from '../recipes/beef_steak_vegetables/en.json';
import recipeBeefSteakVegetablesEs from '../recipes/beef_steak_vegetables/es.json';
import recipeBeefSteakVegetablesFr from '../recipes/beef_steak_vegetables/fr.json';
import recipeBeefSteakVegetablesIt from '../recipes/beef_steak_vegetables/it.json';
import recipeBeefSteakVegetablesJa from '../recipes/beef_steak_vegetables/ja.json';
import recipeBeefSteakVegetablesPt from '../recipes/beef_steak_vegetables/pt.json';
import recipeBerryProteinSmoothie from '../recipes/berry_protein_smoothie/recipe.json';
import recipeBerryProteinSmoothieDe from '../recipes/berry_protein_smoothie/de.json';
import recipeBerryProteinSmoothieEn from '../recipes/berry_protein_smoothie/en.json';
import recipeBerryProteinSmoothieEs from '../recipes/berry_protein_smoothie/es.json';
import recipeBerryProteinSmoothieFr from '../recipes/berry_protein_smoothie/fr.json';
import recipeBerryProteinSmoothieIt from '../recipes/berry_protein_smoothie/it.json';
import recipeBerryProteinSmoothieJa from '../recipes/berry_protein_smoothie/ja.json';
import recipeBerryProteinSmoothiePt from '../recipes/berry_protein_smoothie/pt.json';
import recipeBibimbap from '../recipes/bibimbap/recipe.json';
import recipeBibimbapDe from '../recipes/bibimbap/de.json';
import recipeBibimbapEn from '../recipes/bibimbap/en.json';
import recipeBibimbapEs from '../recipes/bibimbap/es.json';
import recipeBibimbapFr from '../recipes/bibimbap/fr.json';
import recipeBibimbapIt from '../recipes/bibimbap/it.json';
import recipeBibimbapJa from '../recipes/bibimbap/ja.json';
import recipeBibimbapPt from '../recipes/bibimbap/pt.json';
import recipeBirchermuesli from '../recipes/birchermuesli/recipe.json';
import recipeBirchermuesliDe from '../recipes/birchermuesli/de.json';
import recipeBirchermuesliEn from '../recipes/birchermuesli/en.json';
import recipeBirchermuesliEs from '../recipes/birchermuesli/es.json';
import recipeBirchermuesliFr from '../recipes/birchermuesli/fr.json';
import recipeBirchermuesliIt from '../recipes/birchermuesli/it.json';
import recipeBirchermuesliJa from '../recipes/birchermuesli/ja.json';
import recipeBirchermuesliPt from '../recipes/birchermuesli/pt.json';
import recipeBlackBeanSoup from '../recipes/black_bean_soup/recipe.json';
import recipeBlackBeanSoupDe from '../recipes/black_bean_soup/de.json';
import recipeBlackBeanSoupEn from '../recipes/black_bean_soup/en.json';
import recipeBlackBeanSoupEs from '../recipes/black_bean_soup/es.json';
import recipeBlackBeanSoupFr from '../recipes/black_bean_soup/fr.json';
import recipeBlackBeanSoupIt from '../recipes/black_bean_soup/it.json';
import recipeBlackBeanSoupJa from '../recipes/black_bean_soup/ja.json';
import recipeBlackBeanSoupPt from '../recipes/black_bean_soup/pt.json';
import recipeBoboCamarao from '../recipes/bobo_camarao/recipe.json';
import recipeBoboCamaraoDe from '../recipes/bobo_camarao/de.json';
import recipeBoboCamaraoEn from '../recipes/bobo_camarao/en.json';
import recipeBoboCamaraoEs from '../recipes/bobo_camarao/es.json';
import recipeBoboCamaraoFr from '../recipes/bobo_camarao/fr.json';
import recipeBoboCamaraoIt from '../recipes/bobo_camarao/it.json';
import recipeBoboCamaraoJa from '../recipes/bobo_camarao/ja.json';
import recipeBoboCamaraoPt from '../recipes/bobo_camarao/pt.json';
import recipeBreakfastBurrito from '../recipes/breakfast_burrito/recipe.json';
import recipeBreakfastBurritoDe from '../recipes/breakfast_burrito/de.json';
import recipeBreakfastBurritoEn from '../recipes/breakfast_burrito/en.json';
import recipeBreakfastBurritoEs from '../recipes/breakfast_burrito/es.json';
import recipeBreakfastBurritoFr from '../recipes/breakfast_burrito/fr.json';
import recipeBreakfastBurritoIt from '../recipes/breakfast_burrito/it.json';
import recipeBreakfastBurritoJa from '../recipes/breakfast_burrito/ja.json';
import recipeBreakfastBurritoPt from '../recipes/breakfast_burrito/pt.json';
import recipeBresaolaRocketToast from '../recipes/bresaola_rocket_toast/recipe.json';
import recipeBresaolaRocketToastDe from '../recipes/bresaola_rocket_toast/de.json';
import recipeBresaolaRocketToastEn from '../recipes/bresaola_rocket_toast/en.json';
import recipeBresaolaRocketToastEs from '../recipes/bresaola_rocket_toast/es.json';
import recipeBresaolaRocketToastFr from '../recipes/bresaola_rocket_toast/fr.json';
import recipeBresaolaRocketToastIt from '../recipes/bresaola_rocket_toast/it.json';
import recipeBresaolaRocketToastJa from '../recipes/bresaola_rocket_toast/ja.json';
import recipeBresaolaRocketToastPt from '../recipes/bresaola_rocket_toast/pt.json';
import recipeBresaolaRolls from '../recipes/bresaola_rolls/recipe.json';
import recipeBresaolaRollsDe from '../recipes/bresaola_rolls/de.json';
import recipeBresaolaRollsEn from '../recipes/bresaola_rolls/en.json';
import recipeBresaolaRollsEs from '../recipes/bresaola_rolls/es.json';
import recipeBresaolaRollsFr from '../recipes/bresaola_rolls/fr.json';
import recipeBresaolaRollsIt from '../recipes/bresaola_rolls/it.json';
import recipeBresaolaRollsJa from '../recipes/bresaola_rolls/ja.json';
import recipeBresaolaRollsPt from '../recipes/bresaola_rolls/pt.json';
import recipeBuckwheatGalette from '../recipes/buckwheat_galette/recipe.json';
import recipeBuckwheatGaletteDe from '../recipes/buckwheat_galette/de.json';
import recipeBuckwheatGaletteEn from '../recipes/buckwheat_galette/en.json';
import recipeBuckwheatGaletteEs from '../recipes/buckwheat_galette/es.json';
import recipeBuckwheatGaletteFr from '../recipes/buckwheat_galette/fr.json';
import recipeBuckwheatGaletteIt from '../recipes/buckwheat_galette/it.json';
import recipeBuckwheatGaletteJa from '../recipes/buckwheat_galette/ja.json';
import recipeBuckwheatGalettePt from '../recipes/buckwheat_galette/pt.json';
import recipeBulgogi from '../recipes/bulgogi/recipe.json';
import recipeBulgogiDe from '../recipes/bulgogi/de.json';
import recipeBulgogiEn from '../recipes/bulgogi/en.json';
import recipeBulgogiEs from '../recipes/bulgogi/es.json';
import recipeBulgogiFr from '../recipes/bulgogi/fr.json';
import recipeBulgogiIt from '../recipes/bulgogi/it.json';
import recipeBulgogiJa from '../recipes/bulgogi/ja.json';
import recipeBulgogiPt from '../recipes/bulgogi/pt.json';
import recipeBunChayTofu from '../recipes/bun_chay_tofu/recipe.json';
import recipeBunChayTofuDe from '../recipes/bun_chay_tofu/de.json';
import recipeBunChayTofuEn from '../recipes/bun_chay_tofu/en.json';
import recipeBunChayTofuEs from '../recipes/bun_chay_tofu/es.json';
import recipeBunChayTofuFr from '../recipes/bun_chay_tofu/fr.json';
import recipeBunChayTofuIt from '../recipes/bun_chay_tofu/it.json';
import recipeBunChayTofuJa from '../recipes/bun_chay_tofu/ja.json';
import recipeBunChayTofuPt from '../recipes/bun_chay_tofu/pt.json';
import recipeBundnerBarleySoup from '../recipes/bundner_barley_soup/recipe.json';
import recipeBundnerBarleySoupDe from '../recipes/bundner_barley_soup/de.json';
import recipeBundnerBarleySoupEn from '../recipes/bundner_barley_soup/en.json';
import recipeBundnerBarleySoupEs from '../recipes/bundner_barley_soup/es.json';
import recipeBundnerBarleySoupFr from '../recipes/bundner_barley_soup/fr.json';
import recipeBundnerBarleySoupIt from '../recipes/bundner_barley_soup/it.json';
import recipeBundnerBarleySoupJa from '../recipes/bundner_barley_soup/ja.json';
import recipeBundnerBarleySoupPt from '../recipes/bundner_barley_soup/pt.json';
import recipeBundnerfleischCrispbread from '../recipes/bundnerfleisch_crispbread/recipe.json';
import recipeBundnerfleischCrispbreadDe from '../recipes/bundnerfleisch_crispbread/de.json';
import recipeBundnerfleischCrispbreadEn from '../recipes/bundnerfleisch_crispbread/en.json';
import recipeBundnerfleischCrispbreadEs from '../recipes/bundnerfleisch_crispbread/es.json';
import recipeBundnerfleischCrispbreadFr from '../recipes/bundnerfleisch_crispbread/fr.json';
import recipeBundnerfleischCrispbreadIt from '../recipes/bundnerfleisch_crispbread/it.json';
import recipeBundnerfleischCrispbreadJa from '../recipes/bundnerfleisch_crispbread/ja.json';
import recipeBundnerfleischCrispbreadPt from '../recipes/bundnerfleisch_crispbread/pt.json';
import recipeBurritoBowl from '../recipes/burrito_bowl/recipe.json';
import recipeBurritoBowlDe from '../recipes/burrito_bowl/de.json';
import recipeBurritoBowlEn from '../recipes/burrito_bowl/en.json';
import recipeBurritoBowlEs from '../recipes/burrito_bowl/es.json';
import recipeBurritoBowlFr from '../recipes/burrito_bowl/fr.json';
import recipeBurritoBowlIt from '../recipes/burrito_bowl/it.json';
import recipeBurritoBowlJa from '../recipes/burrito_bowl/ja.json';
import recipeBurritoBowlPt from '../recipes/burrito_bowl/pt.json';
import recipeCaKho from '../recipes/ca_kho/recipe.json';
import recipeCaKhoDe from '../recipes/ca_kho/de.json';
import recipeCaKhoEn from '../recipes/ca_kho/en.json';
import recipeCaKhoEs from '../recipes/ca_kho/es.json';
import recipeCaKhoFr from '../recipes/ca_kho/fr.json';
import recipeCaKhoIt from '../recipes/ca_kho/it.json';
import recipeCaKhoJa from '../recipes/ca_kho/ja.json';
import recipeCaKhoPt from '../recipes/ca_kho/pt.json';
import recipeCaldoVerdeBeans from '../recipes/caldo_verde_beans/recipe.json';
import recipeCaldoVerdeBeansDe from '../recipes/caldo_verde_beans/de.json';
import recipeCaldoVerdeBeansEn from '../recipes/caldo_verde_beans/en.json';
import recipeCaldoVerdeBeansEs from '../recipes/caldo_verde_beans/es.json';
import recipeCaldoVerdeBeansFr from '../recipes/caldo_verde_beans/fr.json';
import recipeCaldoVerdeBeansIt from '../recipes/caldo_verde_beans/it.json';
import recipeCaldoVerdeBeansJa from '../recipes/caldo_verde_beans/ja.json';
import recipeCaldoVerdeBeansPt from '../recipes/caldo_verde_beans/pt.json';
import recipeCevicheSweetPotato from '../recipes/ceviche_sweet_potato/recipe.json';
import recipeCevicheSweetPotatoDe from '../recipes/ceviche_sweet_potato/de.json';
import recipeCevicheSweetPotatoEn from '../recipes/ceviche_sweet_potato/en.json';
import recipeCevicheSweetPotatoEs from '../recipes/ceviche_sweet_potato/es.json';
import recipeCevicheSweetPotatoFr from '../recipes/ceviche_sweet_potato/fr.json';
import recipeCevicheSweetPotatoIt from '../recipes/ceviche_sweet_potato/it.json';
import recipeCevicheSweetPotatoJa from '../recipes/ceviche_sweet_potato/ja.json';
import recipeCevicheSweetPotatoPt from '../recipes/ceviche_sweet_potato/pt.json';
import recipeChanaMasala from '../recipes/chana_masala/recipe.json';
import recipeChanaMasalaDe from '../recipes/chana_masala/de.json';
import recipeChanaMasalaEn from '../recipes/chana_masala/en.json';
import recipeChanaMasalaEs from '../recipes/chana_masala/es.json';
import recipeChanaMasalaFr from '../recipes/chana_masala/fr.json';
import recipeChanaMasalaIt from '../recipes/chana_masala/it.json';
import recipeChanaMasalaJa from '../recipes/chana_masala/ja.json';
import recipeChanaMasalaPt from '../recipes/chana_masala/pt.json';
import recipeChiaSkyrMango from '../recipes/chia_skyr_mango/recipe.json';
import recipeChiaSkyrMangoDe from '../recipes/chia_skyr_mango/de.json';
import recipeChiaSkyrMangoEn from '../recipes/chia_skyr_mango/en.json';
import recipeChiaSkyrMangoEs from '../recipes/chia_skyr_mango/es.json';
import recipeChiaSkyrMangoFr from '../recipes/chia_skyr_mango/fr.json';
import recipeChiaSkyrMangoIt from '../recipes/chia_skyr_mango/it.json';
import recipeChiaSkyrMangoJa from '../recipes/chia_skyr_mango/ja.json';
import recipeChiaSkyrMangoPt from '../recipes/chia_skyr_mango/pt.json';
import recipeChickenBowl from '../recipes/chicken_bowl/recipe.json';
import recipeChickenBowlDe from '../recipes/chicken_bowl/de.json';
import recipeChickenBowlEn from '../recipes/chicken_bowl/en.json';
import recipeChickenBowlEs from '../recipes/chicken_bowl/es.json';
import recipeChickenBowlFr from '../recipes/chicken_bowl/fr.json';
import recipeChickenBowlIt from '../recipes/chicken_bowl/it.json';
import recipeChickenBowlJa from '../recipes/chicken_bowl/ja.json';
import recipeChickenBowlPt from '../recipes/chicken_bowl/pt.json';
import recipeChickenCaesarLight from '../recipes/chicken_caesar_light/recipe.json';
import recipeChickenCaesarLightDe from '../recipes/chicken_caesar_light/de.json';
import recipeChickenCaesarLightEn from '../recipes/chicken_caesar_light/en.json';
import recipeChickenCaesarLightEs from '../recipes/chicken_caesar_light/es.json';
import recipeChickenCaesarLightFr from '../recipes/chicken_caesar_light/fr.json';
import recipeChickenCaesarLightIt from '../recipes/chicken_caesar_light/it.json';
import recipeChickenCaesarLightJa from '../recipes/chicken_caesar_light/ja.json';
import recipeChickenCaesarLightPt from '../recipes/chicken_caesar_light/pt.json';
import recipeChickenCapreseSalad from '../recipes/chicken_caprese_salad/recipe.json';
import recipeChickenCapreseSaladDe from '../recipes/chicken_caprese_salad/de.json';
import recipeChickenCapreseSaladEn from '../recipes/chicken_caprese_salad/en.json';
import recipeChickenCapreseSaladEs from '../recipes/chicken_caprese_salad/es.json';
import recipeChickenCapreseSaladFr from '../recipes/chicken_caprese_salad/fr.json';
import recipeChickenCapreseSaladIt from '../recipes/chicken_caprese_salad/it.json';
import recipeChickenCapreseSaladJa from '../recipes/chicken_caprese_salad/ja.json';
import recipeChickenCapreseSaladPt from '../recipes/chicken_caprese_salad/pt.json';
import recipeChickenCongee from '../recipes/chicken_congee/recipe.json';
import recipeChickenCongeeDe from '../recipes/chicken_congee/de.json';
import recipeChickenCongeeEn from '../recipes/chicken_congee/en.json';
import recipeChickenCongeeEs from '../recipes/chicken_congee/es.json';
import recipeChickenCongeeFr from '../recipes/chicken_congee/fr.json';
import recipeChickenCongeeIt from '../recipes/chicken_congee/it.json';
import recipeChickenCongeeJa from '../recipes/chicken_congee/ja.json';
import recipeChickenCongeePt from '../recipes/chicken_congee/pt.json';
import recipeChickenFajitas from '../recipes/chicken_fajitas/recipe.json';
import recipeChickenFajitasDe from '../recipes/chicken_fajitas/de.json';
import recipeChickenFajitasEn from '../recipes/chicken_fajitas/en.json';
import recipeChickenFajitasEs from '../recipes/chicken_fajitas/es.json';
import recipeChickenFajitasFr from '../recipes/chicken_fajitas/fr.json';
import recipeChickenFajitasIt from '../recipes/chicken_fajitas/it.json';
import recipeChickenFajitasJa from '../recipes/chicken_fajitas/ja.json';
import recipeChickenFajitasPt from '../recipes/chicken_fajitas/pt.json';
import recipeChickenPiccata from '../recipes/chicken_piccata/recipe.json';
import recipeChickenPiccataDe from '../recipes/chicken_piccata/de.json';
import recipeChickenPiccataEn from '../recipes/chicken_piccata/en.json';
import recipeChickenPiccataEs from '../recipes/chicken_piccata/es.json';
import recipeChickenPiccataFr from '../recipes/chicken_piccata/fr.json';
import recipeChickenPiccataIt from '../recipes/chicken_piccata/it.json';
import recipeChickenPiccataJa from '../recipes/chicken_piccata/ja.json';
import recipeChickenPiccataPt from '../recipes/chicken_piccata/pt.json';
import recipeChickenSataySkewers from '../recipes/chicken_satay_skewers/recipe.json';
import recipeChickenSataySkewersDe from '../recipes/chicken_satay_skewers/de.json';
import recipeChickenSataySkewersEn from '../recipes/chicken_satay_skewers/en.json';
import recipeChickenSataySkewersEs from '../recipes/chicken_satay_skewers/es.json';
import recipeChickenSataySkewersFr from '../recipes/chicken_satay_skewers/fr.json';
import recipeChickenSataySkewersIt from '../recipes/chicken_satay_skewers/it.json';
import recipeChickenSataySkewersJa from '../recipes/chicken_satay_skewers/ja.json';
import recipeChickenSataySkewersPt from '../recipes/chicken_satay_skewers/pt.json';
import recipeChickenShawarmaBowl from '../recipes/chicken_shawarma_bowl/recipe.json';
import recipeChickenShawarmaBowlDe from '../recipes/chicken_shawarma_bowl/de.json';
import recipeChickenShawarmaBowlEn from '../recipes/chicken_shawarma_bowl/en.json';
import recipeChickenShawarmaBowlEs from '../recipes/chicken_shawarma_bowl/es.json';
import recipeChickenShawarmaBowlFr from '../recipes/chicken_shawarma_bowl/fr.json';
import recipeChickenShawarmaBowlIt from '../recipes/chicken_shawarma_bowl/it.json';
import recipeChickenShawarmaBowlJa from '../recipes/chicken_shawarma_bowl/ja.json';
import recipeChickenShawarmaBowlPt from '../recipes/chicken_shawarma_bowl/pt.json';
import recipeChickenSouvlaki from '../recipes/chicken_souvlaki/recipe.json';
import recipeChickenSouvlakiDe from '../recipes/chicken_souvlaki/de.json';
import recipeChickenSouvlakiEn from '../recipes/chicken_souvlaki/en.json';
import recipeChickenSouvlakiEs from '../recipes/chicken_souvlaki/es.json';
import recipeChickenSouvlakiFr from '../recipes/chicken_souvlaki/fr.json';
import recipeChickenSouvlakiIt from '../recipes/chicken_souvlaki/it.json';
import recipeChickenSouvlakiJa from '../recipes/chicken_souvlaki/ja.json';
import recipeChickenSouvlakiPt from '../recipes/chicken_souvlaki/pt.json';
import recipeChickenSweetPotatoTraybake from '../recipes/chicken_sweet_potato_traybake/recipe.json';
import recipeChickenSweetPotatoTraybakeDe from '../recipes/chicken_sweet_potato_traybake/de.json';
import recipeChickenSweetPotatoTraybakeEn from '../recipes/chicken_sweet_potato_traybake/en.json';
import recipeChickenSweetPotatoTraybakeEs from '../recipes/chicken_sweet_potato_traybake/es.json';
import recipeChickenSweetPotatoTraybakeFr from '../recipes/chicken_sweet_potato_traybake/fr.json';
import recipeChickenSweetPotatoTraybakeIt from '../recipes/chicken_sweet_potato_traybake/it.json';
import recipeChickenSweetPotatoTraybakeJa from '../recipes/chicken_sweet_potato_traybake/ja.json';
import recipeChickenSweetPotatoTraybakePt from '../recipes/chicken_sweet_potato_traybake/pt.json';
import recipeChickenTagine from '../recipes/chicken_tagine/recipe.json';
import recipeChickenTagineDe from '../recipes/chicken_tagine/de.json';
import recipeChickenTagineEn from '../recipes/chicken_tagine/en.json';
import recipeChickenTagineEs from '../recipes/chicken_tagine/es.json';
import recipeChickenTagineFr from '../recipes/chicken_tagine/fr.json';
import recipeChickenTagineIt from '../recipes/chicken_tagine/it.json';
import recipeChickenTagineJa from '../recipes/chicken_tagine/ja.json';
import recipeChickenTaginePt from '../recipes/chicken_tagine/pt.json';
import recipeChickenTortillaSoup from '../recipes/chicken_tortilla_soup/recipe.json';
import recipeChickenTortillaSoupDe from '../recipes/chicken_tortilla_soup/de.json';
import recipeChickenTortillaSoupEn from '../recipes/chicken_tortilla_soup/en.json';
import recipeChickenTortillaSoupEs from '../recipes/chicken_tortilla_soup/es.json';
import recipeChickenTortillaSoupFr from '../recipes/chicken_tortilla_soup/fr.json';
import recipeChickenTortillaSoupIt from '../recipes/chicken_tortilla_soup/it.json';
import recipeChickenTortillaSoupJa from '../recipes/chicken_tortilla_soup/ja.json';
import recipeChickenTortillaSoupPt from '../recipes/chicken_tortilla_soup/pt.json';
import recipeChickenVegetableSoup from '../recipes/chicken_vegetable_soup/recipe.json';
import recipeChickenVegetableSoupDe from '../recipes/chicken_vegetable_soup/de.json';
import recipeChickenVegetableSoupEn from '../recipes/chicken_vegetable_soup/en.json';
import recipeChickenVegetableSoupEs from '../recipes/chicken_vegetable_soup/es.json';
import recipeChickenVegetableSoupFr from '../recipes/chicken_vegetable_soup/fr.json';
import recipeChickenVegetableSoupIt from '../recipes/chicken_vegetable_soup/it.json';
import recipeChickenVegetableSoupJa from '../recipes/chicken_vegetable_soup/ja.json';
import recipeChickenVegetableSoupPt from '../recipes/chicken_vegetable_soup/pt.json';
import recipeChickpeaChaat from '../recipes/chickpea_chaat/recipe.json';
import recipeChickpeaChaatDe from '../recipes/chickpea_chaat/de.json';
import recipeChickpeaChaatEn from '../recipes/chickpea_chaat/en.json';
import recipeChickpeaChaatEs from '../recipes/chickpea_chaat/es.json';
import recipeChickpeaChaatFr from '../recipes/chickpea_chaat/fr.json';
import recipeChickpeaChaatIt from '../recipes/chickpea_chaat/it.json';
import recipeChickpeaChaatJa from '../recipes/chickpea_chaat/ja.json';
import recipeChickpeaChaatPt from '../recipes/chickpea_chaat/pt.json';
import recipeChickpeaTunaSalad from '../recipes/chickpea_tuna_salad/recipe.json';
import recipeChickpeaTunaSaladDe from '../recipes/chickpea_tuna_salad/de.json';
import recipeChickpeaTunaSaladEn from '../recipes/chickpea_tuna_salad/en.json';
import recipeChickpeaTunaSaladEs from '../recipes/chickpea_tuna_salad/es.json';
import recipeChickpeaTunaSaladFr from '../recipes/chickpea_tuna_salad/fr.json';
import recipeChickpeaTunaSaladIt from '../recipes/chickpea_tuna_salad/it.json';
import recipeChickpeaTunaSaladJa from '../recipes/chickpea_tuna_salad/ja.json';
import recipeChickpeaTunaSaladPt from '../recipes/chickpea_tuna_salad/pt.json';
import recipeChiliConCarne from '../recipes/chili_con_carne/recipe.json';
import recipeChiliConCarneDe from '../recipes/chili_con_carne/de.json';
import recipeChiliConCarneEn from '../recipes/chili_con_carne/en.json';
import recipeChiliConCarneEs from '../recipes/chili_con_carne/es.json';
import recipeChiliConCarneFr from '../recipes/chili_con_carne/fr.json';
import recipeChiliConCarneIt from '../recipes/chili_con_carne/it.json';
import recipeChiliConCarneJa from '../recipes/chili_con_carne/ja.json';
import recipeChiliConCarnePt from '../recipes/chili_con_carne/pt.json';
import recipeChiliSinCarne from '../recipes/chili_sin_carne/recipe.json';
import recipeChiliSinCarneDe from '../recipes/chili_sin_carne/de.json';
import recipeChiliSinCarneEn from '../recipes/chili_sin_carne/en.json';
import recipeChiliSinCarneEs from '../recipes/chili_sin_carne/es.json';
import recipeChiliSinCarneFr from '../recipes/chili_sin_carne/fr.json';
import recipeChiliSinCarneIt from '../recipes/chili_sin_carne/it.json';
import recipeChiliSinCarneJa from '../recipes/chili_sin_carne/ja.json';
import recipeChiliSinCarnePt from '../recipes/chili_sin_carne/pt.json';
import recipeCilbir from '../recipes/cilbir/recipe.json';
import recipeCilbirDe from '../recipes/cilbir/de.json';
import recipeCilbirEn from '../recipes/cilbir/en.json';
import recipeCilbirEs from '../recipes/cilbir/es.json';
import recipeCilbirFr from '../recipes/cilbir/fr.json';
import recipeCilbirIt from '../recipes/cilbir/it.json';
import recipeCilbirJa from '../recipes/cilbir/ja.json';
import recipeCilbirPt from '../recipes/cilbir/pt.json';
import recipeCocoaProteinMilk from '../recipes/cocoa_protein_milk/recipe.json';
import recipeCocoaProteinMilkDe from '../recipes/cocoa_protein_milk/de.json';
import recipeCocoaProteinMilkEn from '../recipes/cocoa_protein_milk/en.json';
import recipeCocoaProteinMilkEs from '../recipes/cocoa_protein_milk/es.json';
import recipeCocoaProteinMilkFr from '../recipes/cocoa_protein_milk/fr.json';
import recipeCocoaProteinMilkIt from '../recipes/cocoa_protein_milk/it.json';
import recipeCocoaProteinMilkJa from '../recipes/cocoa_protein_milk/ja.json';
import recipeCocoaProteinMilkPt from '../recipes/cocoa_protein_milk/pt.json';
import recipeCodDillMustard from '../recipes/cod_dill_mustard/recipe.json';
import recipeCodDillMustardDe from '../recipes/cod_dill_mustard/de.json';
import recipeCodDillMustardEn from '../recipes/cod_dill_mustard/en.json';
import recipeCodDillMustardEs from '../recipes/cod_dill_mustard/es.json';
import recipeCodDillMustardFr from '../recipes/cod_dill_mustard/fr.json';
import recipeCodDillMustardIt from '../recipes/cod_dill_mustard/it.json';
import recipeCodDillMustardJa from '../recipes/cod_dill_mustard/ja.json';
import recipeCodDillMustardPt from '../recipes/cod_dill_mustard/pt.json';
import recipeColdSobaTofu from '../recipes/cold_soba_tofu/recipe.json';
import recipeColdSobaTofuDe from '../recipes/cold_soba_tofu/de.json';
import recipeColdSobaTofuEn from '../recipes/cold_soba_tofu/en.json';
import recipeColdSobaTofuEs from '../recipes/cold_soba_tofu/es.json';
import recipeColdSobaTofuFr from '../recipes/cold_soba_tofu/fr.json';
import recipeColdSobaTofuIt from '../recipes/cold_soba_tofu/it.json';
import recipeColdSobaTofuJa from '../recipes/cold_soba_tofu/ja.json';
import recipeColdSobaTofuPt from '../recipes/cold_soba_tofu/pt.json';
import recipeCottageCrispbread from '../recipes/cottage_crispbread/recipe.json';
import recipeCottageCrispbreadDe from '../recipes/cottage_crispbread/de.json';
import recipeCottageCrispbreadEn from '../recipes/cottage_crispbread/en.json';
import recipeCottageCrispbreadEs from '../recipes/cottage_crispbread/es.json';
import recipeCottageCrispbreadFr from '../recipes/cottage_crispbread/fr.json';
import recipeCottageCrispbreadIt from '../recipes/cottage_crispbread/it.json';
import recipeCottageCrispbreadJa from '../recipes/cottage_crispbread/ja.json';
import recipeCottageCrispbreadPt from '../recipes/cottage_crispbread/pt.json';
import recipeCottagePineapple from '../recipes/cottage_pineapple/recipe.json';
import recipeCottagePineappleDe from '../recipes/cottage_pineapple/de.json';
import recipeCottagePineappleEn from '../recipes/cottage_pineapple/en.json';
import recipeCottagePineappleEs from '../recipes/cottage_pineapple/es.json';
import recipeCottagePineappleFr from '../recipes/cottage_pineapple/fr.json';
import recipeCottagePineappleIt from '../recipes/cottage_pineapple/it.json';
import recipeCottagePineappleJa from '../recipes/cottage_pineapple/ja.json';
import recipeCottagePineapplePt from '../recipes/cottage_pineapple/pt.json';
import recipeCottageTomatoToast from '../recipes/cottage_tomato_toast/recipe.json';
import recipeCottageTomatoToastDe from '../recipes/cottage_tomato_toast/de.json';
import recipeCottageTomatoToastEn from '../recipes/cottage_tomato_toast/en.json';
import recipeCottageTomatoToastEs from '../recipes/cottage_tomato_toast/es.json';
import recipeCottageTomatoToastFr from '../recipes/cottage_tomato_toast/fr.json';
import recipeCottageTomatoToastIt from '../recipes/cottage_tomato_toast/it.json';
import recipeCottageTomatoToastJa from '../recipes/cottage_tomato_toast/ja.json';
import recipeCottageTomatoToastPt from '../recipes/cottage_tomato_toast/pt.json';
import recipeCottageZucchiniFrittata from '../recipes/cottage_zucchini_frittata/recipe.json';
import recipeCottageZucchiniFrittataDe from '../recipes/cottage_zucchini_frittata/de.json';
import recipeCottageZucchiniFrittataEn from '../recipes/cottage_zucchini_frittata/en.json';
import recipeCottageZucchiniFrittataEs from '../recipes/cottage_zucchini_frittata/es.json';
import recipeCottageZucchiniFrittataFr from '../recipes/cottage_zucchini_frittata/fr.json';
import recipeCottageZucchiniFrittataIt from '../recipes/cottage_zucchini_frittata/it.json';
import recipeCottageZucchiniFrittataJa from '../recipes/cottage_zucchini_frittata/ja.json';
import recipeCottageZucchiniFrittataPt from '../recipes/cottage_zucchini_frittata/pt.json';
import recipeCouscousChickenSalad from '../recipes/couscous_chicken_salad/recipe.json';
import recipeCouscousChickenSaladDe from '../recipes/couscous_chicken_salad/de.json';
import recipeCouscousChickenSaladEn from '../recipes/couscous_chicken_salad/en.json';
import recipeCouscousChickenSaladEs from '../recipes/couscous_chicken_salad/es.json';
import recipeCouscousChickenSaladFr from '../recipes/couscous_chicken_salad/fr.json';
import recipeCouscousChickenSaladIt from '../recipes/couscous_chicken_salad/it.json';
import recipeCouscousChickenSaladJa from '../recipes/couscous_chicken_salad/ja.json';
import recipeCouscousChickenSaladPt from '../recipes/couscous_chicken_salad/pt.json';
import recipeCrepiocaChicken from '../recipes/crepioca_chicken/recipe.json';
import recipeCrepiocaChickenDe from '../recipes/crepioca_chicken/de.json';
import recipeCrepiocaChickenEn from '../recipes/crepioca_chicken/en.json';
import recipeCrepiocaChickenEs from '../recipes/crepioca_chicken/es.json';
import recipeCrepiocaChickenFr from '../recipes/crepioca_chicken/fr.json';
import recipeCrepiocaChickenIt from '../recipes/crepioca_chicken/it.json';
import recipeCrepiocaChickenJa from '../recipes/crepioca_chicken/ja.json';
import recipeCrepiocaChickenPt from '../recipes/crepioca_chicken/pt.json';
import recipeCuscuzEgg from '../recipes/cuscuz_egg/recipe.json';
import recipeCuscuzEggDe from '../recipes/cuscuz_egg/de.json';
import recipeCuscuzEggEn from '../recipes/cuscuz_egg/en.json';
import recipeCuscuzEggEs from '../recipes/cuscuz_egg/es.json';
import recipeCuscuzEggFr from '../recipes/cuscuz_egg/fr.json';
import recipeCuscuzEggIt from '../recipes/cuscuz_egg/it.json';
import recipeCuscuzEggJa from '../recipes/cuscuz_egg/ja.json';
import recipeCuscuzEggPt from '../recipes/cuscuz_egg/pt.json';
import recipeDakgalbi from '../recipes/dakgalbi/recipe.json';
import recipeDakgalbiDe from '../recipes/dakgalbi/de.json';
import recipeDakgalbiEn from '../recipes/dakgalbi/en.json';
import recipeDakgalbiEs from '../recipes/dakgalbi/es.json';
import recipeDakgalbiFr from '../recipes/dakgalbi/fr.json';
import recipeDakgalbiIt from '../recipes/dakgalbi/it.json';
import recipeDakgalbiJa from '../recipes/dakgalbi/ja.json';
import recipeDakgalbiPt from '../recipes/dakgalbi/pt.json';
import recipeDeviledEggsYogurt from '../recipes/deviled_eggs_yogurt/recipe.json';
import recipeDeviledEggsYogurtDe from '../recipes/deviled_eggs_yogurt/de.json';
import recipeDeviledEggsYogurtEn from '../recipes/deviled_eggs_yogurt/en.json';
import recipeDeviledEggsYogurtEs from '../recipes/deviled_eggs_yogurt/es.json';
import recipeDeviledEggsYogurtFr from '../recipes/deviled_eggs_yogurt/fr.json';
import recipeDeviledEggsYogurtIt from '../recipes/deviled_eggs_yogurt/it.json';
import recipeDeviledEggsYogurtJa from '../recipes/deviled_eggs_yogurt/ja.json';
import recipeDeviledEggsYogurtPt from '../recipes/deviled_eggs_yogurt/pt.json';
import recipeEdamameHummus from '../recipes/edamame_hummus/recipe.json';
import recipeEdamameHummusDe from '../recipes/edamame_hummus/de.json';
import recipeEdamameHummusEn from '../recipes/edamame_hummus/en.json';
import recipeEdamameHummusEs from '../recipes/edamame_hummus/es.json';
import recipeEdamameHummusFr from '../recipes/edamame_hummus/fr.json';
import recipeEdamameHummusIt from '../recipes/edamame_hummus/it.json';
import recipeEdamameHummusJa from '../recipes/edamame_hummus/ja.json';
import recipeEdamameHummusPt from '../recipes/edamame_hummus/pt.json';
import recipeEdamameQuinoaBowl from '../recipes/edamame_quinoa_bowl/recipe.json';
import recipeEdamameQuinoaBowlDe from '../recipes/edamame_quinoa_bowl/de.json';
import recipeEdamameQuinoaBowlEn from '../recipes/edamame_quinoa_bowl/en.json';
import recipeEdamameQuinoaBowlEs from '../recipes/edamame_quinoa_bowl/es.json';
import recipeEdamameQuinoaBowlFr from '../recipes/edamame_quinoa_bowl/fr.json';
import recipeEdamameQuinoaBowlIt from '../recipes/edamame_quinoa_bowl/it.json';
import recipeEdamameQuinoaBowlJa from '../recipes/edamame_quinoa_bowl/ja.json';
import recipeEdamameQuinoaBowlPt from '../recipes/edamame_quinoa_bowl/pt.json';
import recipeEdamameSeaSalt from '../recipes/edamame_sea_salt/recipe.json';
import recipeEdamameSeaSaltDe from '../recipes/edamame_sea_salt/de.json';
import recipeEdamameSeaSaltEn from '../recipes/edamame_sea_salt/en.json';
import recipeEdamameSeaSaltEs from '../recipes/edamame_sea_salt/es.json';
import recipeEdamameSeaSaltFr from '../recipes/edamame_sea_salt/fr.json';
import recipeEdamameSeaSaltIt from '../recipes/edamame_sea_salt/it.json';
import recipeEdamameSeaSaltJa from '../recipes/edamame_sea_salt/ja.json';
import recipeEdamameSeaSaltPt from '../recipes/edamame_sea_salt/pt.json';
import recipeEggSaladSandwich from '../recipes/egg_salad_sandwich/recipe.json';
import recipeEggSaladSandwichDe from '../recipes/egg_salad_sandwich/de.json';
import recipeEggSaladSandwichEn from '../recipes/egg_salad_sandwich/en.json';
import recipeEggSaladSandwichEs from '../recipes/egg_salad_sandwich/es.json';
import recipeEggSaladSandwichFr from '../recipes/egg_salad_sandwich/fr.json';
import recipeEggSaladSandwichIt from '../recipes/egg_salad_sandwich/it.json';
import recipeEggSaladSandwichJa from '../recipes/egg_salad_sandwich/ja.json';
import recipeEggSaladSandwichPt from '../recipes/egg_salad_sandwich/pt.json';
import recipeEggsCucumber from '../recipes/eggs_cucumber/recipe.json';
import recipeEggsCucumberDe from '../recipes/eggs_cucumber/de.json';
import recipeEggsCucumberEn from '../recipes/eggs_cucumber/en.json';
import recipeEggsCucumberEs from '../recipes/eggs_cucumber/es.json';
import recipeEggsCucumberFr from '../recipes/eggs_cucumber/fr.json';
import recipeEggsCucumberIt from '../recipes/eggs_cucumber/it.json';
import recipeEggsCucumberJa from '../recipes/eggs_cucumber/ja.json';
import recipeEggsCucumberPt from '../recipes/eggs_cucumber/pt.json';
import recipeEspinacasGarbanzos from '../recipes/espinacas_garbanzos/recipe.json';
import recipeEspinacasGarbanzosDe from '../recipes/espinacas_garbanzos/de.json';
import recipeEspinacasGarbanzosEn from '../recipes/espinacas_garbanzos/en.json';
import recipeEspinacasGarbanzosEs from '../recipes/espinacas_garbanzos/es.json';
import recipeEspinacasGarbanzosFr from '../recipes/espinacas_garbanzos/fr.json';
import recipeEspinacasGarbanzosIt from '../recipes/espinacas_garbanzos/it.json';
import recipeEspinacasGarbanzosJa from '../recipes/espinacas_garbanzos/ja.json';
import recipeEspinacasGarbanzosPt from '../recipes/espinacas_garbanzos/pt.json';
import recipeFeijoadaLight from '../recipes/feijoada_light/recipe.json';
import recipeFeijoadaLightDe from '../recipes/feijoada_light/de.json';
import recipeFeijoadaLightEn from '../recipes/feijoada_light/en.json';
import recipeFeijoadaLightEs from '../recipes/feijoada_light/es.json';
import recipeFeijoadaLightFr from '../recipes/feijoada_light/fr.json';
import recipeFeijoadaLightIt from '../recipes/feijoada_light/it.json';
import recipeFeijoadaLightJa from '../recipes/feijoada_light/ja.json';
import recipeFeijoadaLightPt from '../recipes/feijoada_light/pt.json';
import recipeFrangoPiriPiri from '../recipes/frango_piri_piri/recipe.json';
import recipeFrangoPiriPiriDe from '../recipes/frango_piri_piri/de.json';
import recipeFrangoPiriPiriEn from '../recipes/frango_piri_piri/en.json';
import recipeFrangoPiriPiriEs from '../recipes/frango_piri_piri/es.json';
import recipeFrangoPiriPiriFr from '../recipes/frango_piri_piri/fr.json';
import recipeFrangoPiriPiriIt from '../recipes/frango_piri_piri/it.json';
import recipeFrangoPiriPiriJa from '../recipes/frango_piri_piri/ja.json';
import recipeFrangoPiriPiriPt from '../recipes/frango_piri_piri/pt.json';
import recipeGaXaoSaOt from '../recipes/ga_xao_sa_ot/recipe.json';
import recipeGaXaoSaOtDe from '../recipes/ga_xao_sa_ot/de.json';
import recipeGaXaoSaOtEn from '../recipes/ga_xao_sa_ot/en.json';
import recipeGaXaoSaOtEs from '../recipes/ga_xao_sa_ot/es.json';
import recipeGaXaoSaOtFr from '../recipes/ga_xao_sa_ot/fr.json';
import recipeGaXaoSaOtIt from '../recipes/ga_xao_sa_ot/it.json';
import recipeGaXaoSaOtJa from '../recipes/ga_xao_sa_ot/ja.json';
import recipeGaXaoSaOtPt from '../recipes/ga_xao_sa_ot/pt.json';
import recipeGadoGado from '../recipes/gado_gado/recipe.json';
import recipeGadoGadoDe from '../recipes/gado_gado/de.json';
import recipeGadoGadoEn from '../recipes/gado_gado/en.json';
import recipeGadoGadoEs from '../recipes/gado_gado/es.json';
import recipeGadoGadoFr from '../recipes/gado_gado/fr.json';
import recipeGadoGadoIt from '../recipes/gado_gado/it.json';
import recipeGadoGadoJa from '../recipes/gado_gado/ja.json';
import recipeGadoGadoPt from '../recipes/gado_gado/pt.json';
import recipeGalinhada from '../recipes/galinhada/recipe.json';
import recipeGalinhadaDe from '../recipes/galinhada/de.json';
import recipeGalinhadaEn from '../recipes/galinhada/en.json';
import recipeGalinhadaEs from '../recipes/galinhada/es.json';
import recipeGalinhadaFr from '../recipes/galinhada/fr.json';
import recipeGalinhadaIt from '../recipes/galinhada/it.json';
import recipeGalinhadaJa from '../recipes/galinhada/ja.json';
import recipeGalinhadaPt from '../recipes/galinhada/pt.json';
import recipeGazpachoShrimp from '../recipes/gazpacho_shrimp/recipe.json';
import recipeGazpachoShrimpDe from '../recipes/gazpacho_shrimp/de.json';
import recipeGazpachoShrimpEn from '../recipes/gazpacho_shrimp/en.json';
import recipeGazpachoShrimpEs from '../recipes/gazpacho_shrimp/es.json';
import recipeGazpachoShrimpFr from '../recipes/gazpacho_shrimp/fr.json';
import recipeGazpachoShrimpIt from '../recipes/gazpacho_shrimp/it.json';
import recipeGazpachoShrimpJa from '../recipes/gazpacho_shrimp/ja.json';
import recipeGazpachoShrimpPt from '../recipes/gazpacho_shrimp/pt.json';
import recipeGoiGa from '../recipes/goi_ga/recipe.json';
import recipeGoiGaDe from '../recipes/goi_ga/de.json';
import recipeGoiGaEn from '../recipes/goi_ga/en.json';
import recipeGoiGaEs from '../recipes/goi_ga/es.json';
import recipeGoiGaFr from '../recipes/goi_ga/fr.json';
import recipeGoiGaIt from '../recipes/goi_ga/it.json';
import recipeGoiGaJa from '../recipes/goi_ga/ja.json';
import recipeGoiGaPt from '../recipes/goi_ga/pt.json';
import recipeGreekChickenSalad from '../recipes/greek_chicken_salad/recipe.json';
import recipeGreekChickenSaladDe from '../recipes/greek_chicken_salad/de.json';
import recipeGreekChickenSaladEn from '../recipes/greek_chicken_salad/en.json';
import recipeGreekChickenSaladEs from '../recipes/greek_chicken_salad/es.json';
import recipeGreekChickenSaladFr from '../recipes/greek_chicken_salad/fr.json';
import recipeGreekChickenSaladIt from '../recipes/greek_chicken_salad/it.json';
import recipeGreekChickenSaladJa from '../recipes/greek_chicken_salad/ja.json';
import recipeGreekChickenSaladPt from '../recipes/greek_chicken_salad/pt.json';
import recipeGreekYogurtWalnut from '../recipes/greek_yogurt_walnut/recipe.json';
import recipeGreekYogurtWalnutDe from '../recipes/greek_yogurt_walnut/de.json';
import recipeGreekYogurtWalnutEn from '../recipes/greek_yogurt_walnut/en.json';
import recipeGreekYogurtWalnutEs from '../recipes/greek_yogurt_walnut/es.json';
import recipeGreekYogurtWalnutFr from '../recipes/greek_yogurt_walnut/fr.json';
import recipeGreekYogurtWalnutIt from '../recipes/greek_yogurt_walnut/it.json';
import recipeGreekYogurtWalnutJa from '../recipes/greek_yogurt_walnut/ja.json';
import recipeGreekYogurtWalnutPt from '../recipes/greek_yogurt_walnut/pt.json';
import recipeGreenCurryShrimp from '../recipes/green_curry_shrimp/recipe.json';
import recipeGreenCurryShrimpDe from '../recipes/green_curry_shrimp/de.json';
import recipeGreenCurryShrimpEn from '../recipes/green_curry_shrimp/en.json';
import recipeGreenCurryShrimpEs from '../recipes/green_curry_shrimp/es.json';
import recipeGreenCurryShrimpFr from '../recipes/green_curry_shrimp/fr.json';
import recipeGreenCurryShrimpIt from '../recipes/green_curry_shrimp/it.json';
import recipeGreenCurryShrimpJa from '../recipes/green_curry_shrimp/ja.json';
import recipeGreenCurryShrimpPt from '../recipes/green_curry_shrimp/pt.json';
import recipeGreenShakshuka from '../recipes/green_shakshuka/recipe.json';
import recipeGreenShakshukaDe from '../recipes/green_shakshuka/de.json';
import recipeGreenShakshukaEn from '../recipes/green_shakshuka/en.json';
import recipeGreenShakshukaEs from '../recipes/green_shakshuka/es.json';
import recipeGreenShakshukaFr from '../recipes/green_shakshuka/fr.json';
import recipeGreenShakshukaIt from '../recipes/green_shakshuka/it.json';
import recipeGreenShakshukaJa from '../recipes/green_shakshuka/ja.json';
import recipeGreenShakshukaPt from '../recipes/green_shakshuka/pt.json';
import recipeGreenSkyrSmoothie from '../recipes/green_skyr_smoothie/recipe.json';
import recipeGreenSkyrSmoothieDe from '../recipes/green_skyr_smoothie/de.json';
import recipeGreenSkyrSmoothieEn from '../recipes/green_skyr_smoothie/en.json';
import recipeGreenSkyrSmoothieEs from '../recipes/green_skyr_smoothie/es.json';
import recipeGreenSkyrSmoothieFr from '../recipes/green_skyr_smoothie/fr.json';
import recipeGreenSkyrSmoothieIt from '../recipes/green_skyr_smoothie/it.json';
import recipeGreenSkyrSmoothieJa from '../recipes/green_skyr_smoothie/ja.json';
import recipeGreenSkyrSmoothiePt from '../recipes/green_skyr_smoothie/pt.json';
import recipeGyeranJjim from '../recipes/gyeran_jjim/recipe.json';
import recipeGyeranJjimDe from '../recipes/gyeran_jjim/de.json';
import recipeGyeranJjimEn from '../recipes/gyeran_jjim/en.json';
import recipeGyeranJjimEs from '../recipes/gyeran_jjim/es.json';
import recipeGyeranJjimFr from '../recipes/gyeran_jjim/fr.json';
import recipeGyeranJjimIt from '../recipes/gyeran_jjim/it.json';
import recipeGyeranJjimJa from '../recipes/gyeran_jjim/ja.json';
import recipeGyeranJjimPt from '../recipes/gyeran_jjim/pt.json';
import recipeGyudonLight from '../recipes/gyudon_light/recipe.json';
import recipeGyudonLightDe from '../recipes/gyudon_light/de.json';
import recipeGyudonLightEn from '../recipes/gyudon_light/en.json';
import recipeGyudonLightEs from '../recipes/gyudon_light/es.json';
import recipeGyudonLightFr from '../recipes/gyudon_light/fr.json';
import recipeGyudonLightIt from '../recipes/gyudon_light/it.json';
import recipeGyudonLightJa from '../recipes/gyudon_light/ja.json';
import recipeGyudonLightPt from '../recipes/gyudon_light/pt.json';
import recipeHalloumiLentilSalad from '../recipes/halloumi_lentil_salad/recipe.json';
import recipeHalloumiLentilSaladDe from '../recipes/halloumi_lentil_salad/de.json';
import recipeHalloumiLentilSaladEn from '../recipes/halloumi_lentil_salad/en.json';
import recipeHalloumiLentilSaladEs from '../recipes/halloumi_lentil_salad/es.json';
import recipeHalloumiLentilSaladFr from '../recipes/halloumi_lentil_salad/fr.json';
import recipeHalloumiLentilSaladIt from '../recipes/halloumi_lentil_salad/it.json';
import recipeHalloumiLentilSaladJa from '../recipes/halloumi_lentil_salad/ja.json';
import recipeHalloumiLentilSaladPt from '../recipes/halloumi_lentil_salad/pt.json';
import recipeHarira from '../recipes/harira/recipe.json';
import recipeHariraDe from '../recipes/harira/de.json';
import recipeHariraEn from '../recipes/harira/en.json';
import recipeHariraEs from '../recipes/harira/es.json';
import recipeHariraFr from '../recipes/harira/fr.json';
import recipeHariraIt from '../recipes/harira/it.json';
import recipeHariraJa from '../recipes/harira/ja.json';
import recipeHariraPt from '../recipes/harira/pt.json';
import recipeHotSourTofuSoup from '../recipes/hot_sour_tofu_soup/recipe.json';
import recipeHotSourTofuSoupDe from '../recipes/hot_sour_tofu_soup/de.json';
import recipeHotSourTofuSoupEn from '../recipes/hot_sour_tofu_soup/en.json';
import recipeHotSourTofuSoupEs from '../recipes/hot_sour_tofu_soup/es.json';
import recipeHotSourTofuSoupFr from '../recipes/hot_sour_tofu_soup/fr.json';
import recipeHotSourTofuSoupIt from '../recipes/hot_sour_tofu_soup/it.json';
import recipeHotSourTofuSoupJa from '../recipes/hot_sour_tofu_soup/ja.json';
import recipeHotSourTofuSoupPt from '../recipes/hot_sour_tofu_soup/pt.json';
import recipeHuevosRancheros from '../recipes/huevos_rancheros/recipe.json';
import recipeHuevosRancherosDe from '../recipes/huevos_rancheros/de.json';
import recipeHuevosRancherosEn from '../recipes/huevos_rancheros/en.json';
import recipeHuevosRancherosEs from '../recipes/huevos_rancheros/es.json';
import recipeHuevosRancherosFr from '../recipes/huevos_rancheros/fr.json';
import recipeHuevosRancherosIt from '../recipes/huevos_rancheros/it.json';
import recipeHuevosRancherosJa from '../recipes/huevos_rancheros/ja.json';
import recipeHuevosRancherosPt from '../recipes/huevos_rancheros/pt.json';
import recipeHummusVeggieSticks from '../recipes/hummus_veggie_sticks/recipe.json';
import recipeHummusVeggieSticksDe from '../recipes/hummus_veggie_sticks/de.json';
import recipeHummusVeggieSticksEn from '../recipes/hummus_veggie_sticks/en.json';
import recipeHummusVeggieSticksEs from '../recipes/hummus_veggie_sticks/es.json';
import recipeHummusVeggieSticksFr from '../recipes/hummus_veggie_sticks/fr.json';
import recipeHummusVeggieSticksIt from '../recipes/hummus_veggie_sticks/it.json';
import recipeHummusVeggieSticksJa from '../recipes/hummus_veggie_sticks/ja.json';
import recipeHummusVeggieSticksPt from '../recipes/hummus_veggie_sticks/pt.json';
import recipeHummusWrap from '../recipes/hummus_wrap/recipe.json';
import recipeHummusWrapDe from '../recipes/hummus_wrap/de.json';
import recipeHummusWrapEn from '../recipes/hummus_wrap/en.json';
import recipeHummusWrapEs from '../recipes/hummus_wrap/es.json';
import recipeHummusWrapFr from '../recipes/hummus_wrap/fr.json';
import recipeHummusWrapIt from '../recipes/hummus_wrap/it.json';
import recipeHummusWrapJa from '../recipes/hummus_wrap/ja.json';
import recipeHummusWrapPt from '../recipes/hummus_wrap/pt.json';
import recipeJapaneseChickenCurry from '../recipes/japanese_chicken_curry/recipe.json';
import recipeJapaneseChickenCurryDe from '../recipes/japanese_chicken_curry/de.json';
import recipeJapaneseChickenCurryEn from '../recipes/japanese_chicken_curry/en.json';
import recipeJapaneseChickenCurryEs from '../recipes/japanese_chicken_curry/es.json';
import recipeJapaneseChickenCurryFr from '../recipes/japanese_chicken_curry/fr.json';
import recipeJapaneseChickenCurryIt from '../recipes/japanese_chicken_curry/it.json';
import recipeJapaneseChickenCurryJa from '../recipes/japanese_chicken_curry/ja.json';
import recipeJapaneseChickenCurryPt from '../recipes/japanese_chicken_curry/pt.json';
import recipeJapaneseSalmonBreakfast from '../recipes/japanese_salmon_breakfast/recipe.json';
import recipeJapaneseSalmonBreakfastDe from '../recipes/japanese_salmon_breakfast/de.json';
import recipeJapaneseSalmonBreakfastEn from '../recipes/japanese_salmon_breakfast/en.json';
import recipeJapaneseSalmonBreakfastEs from '../recipes/japanese_salmon_breakfast/es.json';
import recipeJapaneseSalmonBreakfastFr from '../recipes/japanese_salmon_breakfast/fr.json';
import recipeJapaneseSalmonBreakfastIt from '../recipes/japanese_salmon_breakfast/it.json';
import recipeJapaneseSalmonBreakfastJa from '../recipes/japanese_salmon_breakfast/ja.json';
import recipeJapaneseSalmonBreakfastPt from '../recipes/japanese_salmon_breakfast/pt.json';
import recipeKeralaFishCurry from '../recipes/kerala_fish_curry/recipe.json';
import recipeKeralaFishCurryDe from '../recipes/kerala_fish_curry/de.json';
import recipeKeralaFishCurryEn from '../recipes/kerala_fish_curry/en.json';
import recipeKeralaFishCurryEs from '../recipes/kerala_fish_curry/es.json';
import recipeKeralaFishCurryFr from '../recipes/kerala_fish_curry/fr.json';
import recipeKeralaFishCurryIt from '../recipes/kerala_fish_curry/it.json';
import recipeKeralaFishCurryJa from '../recipes/kerala_fish_curry/ja.json';
import recipeKeralaFishCurryPt from '../recipes/kerala_fish_curry/pt.json';
import recipeKimchiScrambledEggs from '../recipes/kimchi_scrambled_eggs/recipe.json';
import recipeKimchiScrambledEggsDe from '../recipes/kimchi_scrambled_eggs/de.json';
import recipeKimchiScrambledEggsEn from '../recipes/kimchi_scrambled_eggs/en.json';
import recipeKimchiScrambledEggsEs from '../recipes/kimchi_scrambled_eggs/es.json';
import recipeKimchiScrambledEggsFr from '../recipes/kimchi_scrambled_eggs/fr.json';
import recipeKimchiScrambledEggsIt from '../recipes/kimchi_scrambled_eggs/it.json';
import recipeKimchiScrambledEggsJa from '../recipes/kimchi_scrambled_eggs/ja.json';
import recipeKimchiScrambledEggsPt from '../recipes/kimchi_scrambled_eggs/pt.json';
import recipeKungPaoChicken from '../recipes/kung_pao_chicken/recipe.json';
import recipeKungPaoChickenDe from '../recipes/kung_pao_chicken/de.json';
import recipeKungPaoChickenEn from '../recipes/kung_pao_chicken/en.json';
import recipeKungPaoChickenEs from '../recipes/kung_pao_chicken/es.json';
import recipeKungPaoChickenFr from '../recipes/kung_pao_chicken/fr.json';
import recipeKungPaoChickenIt from '../recipes/kung_pao_chicken/it.json';
import recipeKungPaoChickenJa from '../recipes/kung_pao_chicken/ja.json';
import recipeKungPaoChickenPt from '../recipes/kung_pao_chicken/pt.json';
import recipeLabnehZaatar from '../recipes/labneh_zaatar/recipe.json';
import recipeLabnehZaatarDe from '../recipes/labneh_zaatar/de.json';
import recipeLabnehZaatarEn from '../recipes/labneh_zaatar/en.json';
import recipeLabnehZaatarEs from '../recipes/labneh_zaatar/es.json';
import recipeLabnehZaatarFr from '../recipes/labneh_zaatar/fr.json';
import recipeLabnehZaatarIt from '../recipes/labneh_zaatar/it.json';
import recipeLabnehZaatarJa from '../recipes/labneh_zaatar/ja.json';
import recipeLabnehZaatarPt from '../recipes/labneh_zaatar/pt.json';
import recipeLarbGai from '../recipes/larb_gai/recipe.json';
import recipeLarbGaiDe from '../recipes/larb_gai/de.json';
import recipeLarbGaiEn from '../recipes/larb_gai/en.json';
import recipeLarbGaiEs from '../recipes/larb_gai/es.json';
import recipeLarbGaiFr from '../recipes/larb_gai/fr.json';
import recipeLarbGaiIt from '../recipes/larb_gai/it.json';
import recipeLarbGaiJa from '../recipes/larb_gai/ja.json';
import recipeLarbGaiPt from '../recipes/larb_gai/pt.json';
import recipeLentilBolognese from '../recipes/lentil_bolognese/recipe.json';
import recipeLentilBologneseDe from '../recipes/lentil_bolognese/de.json';
import recipeLentilBologneseEn from '../recipes/lentil_bolognese/en.json';
import recipeLentilBologneseEs from '../recipes/lentil_bolognese/es.json';
import recipeLentilBologneseFr from '../recipes/lentil_bolognese/fr.json';
import recipeLentilBologneseIt from '../recipes/lentil_bolognese/it.json';
import recipeLentilBologneseJa from '../recipes/lentil_bolognese/ja.json';
import recipeLentilBolognesePt from '../recipes/lentil_bolognese/pt.json';
import recipeLentilCurry from '../recipes/lentil_curry/recipe.json';
import recipeLentilCurryDe from '../recipes/lentil_curry/de.json';
import recipeLentilCurryEn from '../recipes/lentil_curry/en.json';
import recipeLentilCurryEs from '../recipes/lentil_curry/es.json';
import recipeLentilCurryFr from '../recipes/lentil_curry/fr.json';
import recipeLentilCurryIt from '../recipes/lentil_curry/it.json';
import recipeLentilCurryJa from '../recipes/lentil_curry/ja.json';
import recipeLentilCurryPt from '../recipes/lentil_curry/pt.json';
import recipeLentilFetaSalad from '../recipes/lentil_feta_salad/recipe.json';
import recipeLentilFetaSaladDe from '../recipes/lentil_feta_salad/de.json';
import recipeLentilFetaSaladEn from '../recipes/lentil_feta_salad/en.json';
import recipeLentilFetaSaladEs from '../recipes/lentil_feta_salad/es.json';
import recipeLentilFetaSaladFr from '../recipes/lentil_feta_salad/fr.json';
import recipeLentilFetaSaladIt from '../recipes/lentil_feta_salad/it.json';
import recipeLentilFetaSaladJa from '../recipes/lentil_feta_salad/ja.json';
import recipeLentilFetaSaladPt from '../recipes/lentil_feta_salad/pt.json';
import recipeLomoSaltado from '../recipes/lomo_saltado/recipe.json';
import recipeLomoSaltadoDe from '../recipes/lomo_saltado/de.json';
import recipeLomoSaltadoEn from '../recipes/lomo_saltado/en.json';
import recipeLomoSaltadoEs from '../recipes/lomo_saltado/es.json';
import recipeLomoSaltadoFr from '../recipes/lomo_saltado/fr.json';
import recipeLomoSaltadoIt from '../recipes/lomo_saltado/it.json';
import recipeLomoSaltadoJa from '../recipes/lomo_saltado/ja.json';
import recipeLomoSaltadoPt from '../recipes/lomo_saltado/pt.json';
import recipeMapoTofu from '../recipes/mapo_tofu/recipe.json';
import recipeMapoTofuDe from '../recipes/mapo_tofu/de.json';
import recipeMapoTofuEn from '../recipes/mapo_tofu/en.json';
import recipeMapoTofuEs from '../recipes/mapo_tofu/es.json';
import recipeMapoTofuFr from '../recipes/mapo_tofu/fr.json';
import recipeMapoTofuIt from '../recipes/mapo_tofu/it.json';
import recipeMapoTofuJa from '../recipes/mapo_tofu/ja.json';
import recipeMapoTofuPt from '../recipes/mapo_tofu/pt.json';
import recipeMasalaOmelette from '../recipes/masala_omelette/recipe.json';
import recipeMasalaOmeletteDe from '../recipes/masala_omelette/de.json';
import recipeMasalaOmeletteEn from '../recipes/masala_omelette/en.json';
import recipeMasalaOmeletteEs from '../recipes/masala_omelette/es.json';
import recipeMasalaOmeletteFr from '../recipes/masala_omelette/fr.json';
import recipeMasalaOmeletteIt from '../recipes/masala_omelette/it.json';
import recipeMasalaOmeletteJa from '../recipes/masala_omelette/ja.json';
import recipeMasalaOmelettePt from '../recipes/masala_omelette/pt.json';
import recipeMenemen from '../recipes/menemen/recipe.json';
import recipeMenemenDe from '../recipes/menemen/de.json';
import recipeMenemenEn from '../recipes/menemen/en.json';
import recipeMenemenEs from '../recipes/menemen/es.json';
import recipeMenemenFr from '../recipes/menemen/fr.json';
import recipeMenemenIt from '../recipes/menemen/it.json';
import recipeMenemenJa from '../recipes/menemen/ja.json';
import recipeMenemenPt from '../recipes/menemen/pt.json';
import recipeMinestroneBeans from '../recipes/minestrone_beans/recipe.json';
import recipeMinestroneBeansDe from '../recipes/minestrone_beans/de.json';
import recipeMinestroneBeansEn from '../recipes/minestrone_beans/en.json';
import recipeMinestroneBeansEs from '../recipes/minestrone_beans/es.json';
import recipeMinestroneBeansFr from '../recipes/minestrone_beans/fr.json';
import recipeMinestroneBeansIt from '../recipes/minestrone_beans/it.json';
import recipeMinestroneBeansJa from '../recipes/minestrone_beans/ja.json';
import recipeMinestroneBeansPt from '../recipes/minestrone_beans/pt.json';
import recipeMisoSalmon from '../recipes/miso_salmon/recipe.json';
import recipeMisoSalmonDe from '../recipes/miso_salmon/de.json';
import recipeMisoSalmonEn from '../recipes/miso_salmon/en.json';
import recipeMisoSalmonEs from '../recipes/miso_salmon/es.json';
import recipeMisoSalmonFr from '../recipes/miso_salmon/fr.json';
import recipeMisoSalmonIt from '../recipes/miso_salmon/it.json';
import recipeMisoSalmonJa from '../recipes/miso_salmon/ja.json';
import recipeMisoSalmonPt from '../recipes/miso_salmon/pt.json';
import recipeMoongDalChilla from '../recipes/moong_dal_chilla/recipe.json';
import recipeMoongDalChillaDe from '../recipes/moong_dal_chilla/de.json';
import recipeMoongDalChillaEn from '../recipes/moong_dal_chilla/en.json';
import recipeMoongDalChillaEs from '../recipes/moong_dal_chilla/es.json';
import recipeMoongDalChillaFr from '../recipes/moong_dal_chilla/fr.json';
import recipeMoongDalChillaIt from '../recipes/moong_dal_chilla/it.json';
import recipeMoongDalChillaJa from '../recipes/moong_dal_chilla/ja.json';
import recipeMoongDalChillaPt from '../recipes/moong_dal_chilla/pt.json';
import recipeMoqueca from '../recipes/moqueca/recipe.json';
import recipeMoquecaDe from '../recipes/moqueca/de.json';
import recipeMoquecaEn from '../recipes/moqueca/en.json';
import recipeMoquecaEs from '../recipes/moqueca/es.json';
import recipeMoquecaFr from '../recipes/moqueca/fr.json';
import recipeMoquecaIt from '../recipes/moqueca/it.json';
import recipeMoquecaJa from '../recipes/moqueca/ja.json';
import recipeMoquecaPt from '../recipes/moqueca/pt.json';
import recipeMozzarellaTomatoSkewers from '../recipes/mozzarella_tomato_skewers/recipe.json';
import recipeMozzarellaTomatoSkewersDe from '../recipes/mozzarella_tomato_skewers/de.json';
import recipeMozzarellaTomatoSkewersEn from '../recipes/mozzarella_tomato_skewers/en.json';
import recipeMozzarellaTomatoSkewersEs from '../recipes/mozzarella_tomato_skewers/es.json';
import recipeMozzarellaTomatoSkewersFr from '../recipes/mozzarella_tomato_skewers/fr.json';
import recipeMozzarellaTomatoSkewersIt from '../recipes/mozzarella_tomato_skewers/it.json';
import recipeMozzarellaTomatoSkewersJa from '../recipes/mozzarella_tomato_skewers/ja.json';
import recipeMozzarellaTomatoSkewersPt from '../recipes/mozzarella_tomato_skewers/pt.json';
import recipeMushroomPolenta from '../recipes/mushroom_polenta/recipe.json';
import recipeMushroomPolentaDe from '../recipes/mushroom_polenta/de.json';
import recipeMushroomPolentaEn from '../recipes/mushroom_polenta/en.json';
import recipeMushroomPolentaEs from '../recipes/mushroom_polenta/es.json';
import recipeMushroomPolentaFr from '../recipes/mushroom_polenta/fr.json';
import recipeMushroomPolentaIt from '../recipes/mushroom_polenta/it.json';
import recipeMushroomPolentaJa from '../recipes/mushroom_polenta/ja.json';
import recipeMushroomPolentaPt from '../recipes/mushroom_polenta/pt.json';
import recipeNasiGoreng from '../recipes/nasi_goreng/recipe.json';
import recipeNasiGorengDe from '../recipes/nasi_goreng/de.json';
import recipeNasiGorengEn from '../recipes/nasi_goreng/en.json';
import recipeNasiGorengEs from '../recipes/nasi_goreng/es.json';
import recipeNasiGorengFr from '../recipes/nasi_goreng/fr.json';
import recipeNasiGorengIt from '../recipes/nasi_goreng/it.json';
import recipeNasiGorengJa from '../recipes/nasi_goreng/ja.json';
import recipeNasiGorengPt from '../recipes/nasi_goreng/pt.json';
import recipeOatPorridgeQuark from '../recipes/oat_porridge_quark/recipe.json';
import recipeOatPorridgeQuarkDe from '../recipes/oat_porridge_quark/de.json';
import recipeOatPorridgeQuarkEn from '../recipes/oat_porridge_quark/en.json';
import recipeOatPorridgeQuarkEs from '../recipes/oat_porridge_quark/es.json';
import recipeOatPorridgeQuarkFr from '../recipes/oat_porridge_quark/fr.json';
import recipeOatPorridgeQuarkIt from '../recipes/oat_porridge_quark/it.json';
import recipeOatPorridgeQuarkJa from '../recipes/oat_porridge_quark/ja.json';
import recipeOatPorridgeQuarkPt from '../recipes/oat_porridge_quark/pt.json';
import recipeOvenSalmon from '../recipes/oven_salmon/recipe.json';
import recipeOvenSalmonDe from '../recipes/oven_salmon/de.json';
import recipeOvenSalmonEn from '../recipes/oven_salmon/en.json';
import recipeOvenSalmonEs from '../recipes/oven_salmon/es.json';
import recipeOvenSalmonFr from '../recipes/oven_salmon/fr.json';
import recipeOvenSalmonIt from '../recipes/oven_salmon/it.json';
import recipeOvenSalmonJa from '../recipes/oven_salmon/ja.json';
import recipeOvenSalmonPt from '../recipes/oven_salmon/pt.json';
import recipeOvernightOatsQuark from '../recipes/overnight_oats_quark/recipe.json';
import recipeOvernightOatsQuarkDe from '../recipes/overnight_oats_quark/de.json';
import recipeOvernightOatsQuarkEn from '../recipes/overnight_oats_quark/en.json';
import recipeOvernightOatsQuarkEs from '../recipes/overnight_oats_quark/es.json';
import recipeOvernightOatsQuarkFr from '../recipes/overnight_oats_quark/fr.json';
import recipeOvernightOatsQuarkIt from '../recipes/overnight_oats_quark/it.json';
import recipeOvernightOatsQuarkJa from '../recipes/overnight_oats_quark/ja.json';
import recipeOvernightOatsQuarkPt from '../recipes/overnight_oats_quark/pt.json';
import recipeOyakodon from '../recipes/oyakodon/recipe.json';
import recipeOyakodonDe from '../recipes/oyakodon/de.json';
import recipeOyakodonEn from '../recipes/oyakodon/en.json';
import recipeOyakodonEs from '../recipes/oyakodon/es.json';
import recipeOyakodonFr from '../recipes/oyakodon/fr.json';
import recipeOyakodonIt from '../recipes/oyakodon/it.json';
import recipeOyakodonJa from '../recipes/oyakodon/ja.json';
import recipeOyakodonPt from '../recipes/oyakodon/pt.json';
import recipePadKraPao from '../recipes/pad_kra_pao/recipe.json';
import recipePadKraPaoDe from '../recipes/pad_kra_pao/de.json';
import recipePadKraPaoEn from '../recipes/pad_kra_pao/en.json';
import recipePadKraPaoEs from '../recipes/pad_kra_pao/es.json';
import recipePadKraPaoFr from '../recipes/pad_kra_pao/fr.json';
import recipePadKraPaoIt from '../recipes/pad_kra_pao/it.json';
import recipePadKraPaoJa from '../recipes/pad_kra_pao/ja.json';
import recipePadKraPaoPt from '../recipes/pad_kra_pao/pt.json';
import recipePadThaiChicken from '../recipes/pad_thai_chicken/recipe.json';
import recipePadThaiChickenDe from '../recipes/pad_thai_chicken/de.json';
import recipePadThaiChickenEn from '../recipes/pad_thai_chicken/en.json';
import recipePadThaiChickenEs from '../recipes/pad_thai_chicken/es.json';
import recipePadThaiChickenFr from '../recipes/pad_thai_chicken/fr.json';
import recipePadThaiChickenIt from '../recipes/pad_thai_chicken/it.json';
import recipePadThaiChickenJa from '../recipes/pad_thai_chicken/ja.json';
import recipePadThaiChickenPt from '../recipes/pad_thai_chicken/pt.json';
import recipePalakDal from '../recipes/palak_dal/recipe.json';
import recipePalakDalDe from '../recipes/palak_dal/de.json';
import recipePalakDalEn from '../recipes/palak_dal/en.json';
import recipePalakDalEs from '../recipes/palak_dal/es.json';
import recipePalakDalFr from '../recipes/palak_dal/fr.json';
import recipePalakDalIt from '../recipes/palak_dal/it.json';
import recipePalakDalJa from '../recipes/palak_dal/ja.json';
import recipePalakDalPt from '../recipes/palak_dal/pt.json';
import recipePalakPaneerLight from '../recipes/palak_paneer_light/recipe.json';
import recipePalakPaneerLightDe from '../recipes/palak_paneer_light/de.json';
import recipePalakPaneerLightEn from '../recipes/palak_paneer_light/en.json';
import recipePalakPaneerLightEs from '../recipes/palak_paneer_light/es.json';
import recipePalakPaneerLightFr from '../recipes/palak_paneer_light/fr.json';
import recipePalakPaneerLightIt from '../recipes/palak_paneer_light/it.json';
import recipePalakPaneerLightJa from '../recipes/palak_paneer_light/ja.json';
import recipePalakPaneerLightPt from '../recipes/palak_paneer_light/pt.json';
import recipePaneerTikkaBites from '../recipes/paneer_tikka_bites/recipe.json';
import recipePaneerTikkaBitesDe from '../recipes/paneer_tikka_bites/de.json';
import recipePaneerTikkaBitesEn from '../recipes/paneer_tikka_bites/en.json';
import recipePaneerTikkaBitesEs from '../recipes/paneer_tikka_bites/es.json';
import recipePaneerTikkaBitesFr from '../recipes/paneer_tikka_bites/fr.json';
import recipePaneerTikkaBitesIt from '../recipes/paneer_tikka_bites/it.json';
import recipePaneerTikkaBitesJa from '../recipes/paneer_tikka_bites/ja.json';
import recipePaneerTikkaBitesPt from '../recipes/paneer_tikka_bites/pt.json';
import recipePaneerTikkaWrap from '../recipes/paneer_tikka_wrap/recipe.json';
import recipePaneerTikkaWrapDe from '../recipes/paneer_tikka_wrap/de.json';
import recipePaneerTikkaWrapEn from '../recipes/paneer_tikka_wrap/en.json';
import recipePaneerTikkaWrapEs from '../recipes/paneer_tikka_wrap/es.json';
import recipePaneerTikkaWrapFr from '../recipes/paneer_tikka_wrap/fr.json';
import recipePaneerTikkaWrapIt from '../recipes/paneer_tikka_wrap/it.json';
import recipePaneerTikkaWrapJa from '../recipes/paneer_tikka_wrap/ja.json';
import recipePaneerTikkaWrapPt from '../recipes/paneer_tikka_wrap/pt.json';
import recipePbBananaSoyOats from '../recipes/pb_banana_soy_oats/recipe.json';
import recipePbBananaSoyOatsDe from '../recipes/pb_banana_soy_oats/de.json';
import recipePbBananaSoyOatsEn from '../recipes/pb_banana_soy_oats/en.json';
import recipePbBananaSoyOatsEs from '../recipes/pb_banana_soy_oats/es.json';
import recipePbBananaSoyOatsFr from '../recipes/pb_banana_soy_oats/fr.json';
import recipePbBananaSoyOatsIt from '../recipes/pb_banana_soy_oats/it.json';
import recipePbBananaSoyOatsJa from '../recipes/pb_banana_soy_oats/ja.json';
import recipePbBananaSoyOatsPt from '../recipes/pb_banana_soy_oats/pt.json';
import recipePescadoVeracruzana from '../recipes/pescado_veracruzana/recipe.json';
import recipePescadoVeracruzanaDe from '../recipes/pescado_veracruzana/de.json';
import recipePescadoVeracruzanaEn from '../recipes/pescado_veracruzana/en.json';
import recipePescadoVeracruzanaEs from '../recipes/pescado_veracruzana/es.json';
import recipePescadoVeracruzanaFr from '../recipes/pescado_veracruzana/fr.json';
import recipePescadoVeracruzanaIt from '../recipes/pescado_veracruzana/it.json';
import recipePescadoVeracruzanaJa from '../recipes/pescado_veracruzana/ja.json';
import recipePescadoVeracruzanaPt from '../recipes/pescado_veracruzana/pt.json';
import recipePho from '../recipes/pho/recipe.json';
import recipePhoDe from '../recipes/pho/de.json';
import recipePhoEn from '../recipes/pho/en.json';
import recipePhoEs from '../recipes/pho/es.json';
import recipePhoFr from '../recipes/pho/fr.json';
import recipePhoIt from '../recipes/pho/it.json';
import recipePhoJa from '../recipes/pho/ja.json';
import recipePhoPt from '../recipes/pho/pt.json';
import recipePicadinho from '../recipes/picadinho/recipe.json';
import recipePicadinhoDe from '../recipes/picadinho/de.json';
import recipePicadinhoEn from '../recipes/picadinho/en.json';
import recipePicadinhoEs from '../recipes/picadinho/es.json';
import recipePicadinhoFr from '../recipes/picadinho/fr.json';
import recipePicadinhoIt from '../recipes/picadinho/it.json';
import recipePicadinhoJa from '../recipes/picadinho/ja.json';
import recipePicadinhoPt from '../recipes/picadinho/pt.json';
import recipePolloAlAjillo from '../recipes/pollo_al_ajillo/recipe.json';
import recipePolloAlAjilloDe from '../recipes/pollo_al_ajillo/de.json';
import recipePolloAlAjilloEn from '../recipes/pollo_al_ajillo/en.json';
import recipePolloAlAjilloEs from '../recipes/pollo_al_ajillo/es.json';
import recipePolloAlAjilloFr from '../recipes/pollo_al_ajillo/fr.json';
import recipePolloAlAjilloIt from '../recipes/pollo_al_ajillo/it.json';
import recipePolloAlAjilloJa from '../recipes/pollo_al_ajillo/ja.json';
import recipePolloAlAjilloPt from '../recipes/pollo_al_ajillo/pt.json';
import recipePouletProvencal from '../recipes/poulet_provencal/recipe.json';
import recipePouletProvencalDe from '../recipes/poulet_provencal/de.json';
import recipePouletProvencalEn from '../recipes/poulet_provencal/en.json';
import recipePouletProvencalEs from '../recipes/poulet_provencal/es.json';
import recipePouletProvencalFr from '../recipes/poulet_provencal/fr.json';
import recipePouletProvencalIt from '../recipes/poulet_provencal/it.json';
import recipePouletProvencalJa from '../recipes/poulet_provencal/ja.json';
import recipePouletProvencalPt from '../recipes/poulet_provencal/pt.json';
import recipePratoFeito from '../recipes/prato_feito/recipe.json';
import recipePratoFeitoDe from '../recipes/prato_feito/de.json';
import recipePratoFeitoEn from '../recipes/prato_feito/en.json';
import recipePratoFeitoEs from '../recipes/prato_feito/es.json';
import recipePratoFeitoFr from '../recipes/prato_feito/fr.json';
import recipePratoFeitoIt from '../recipes/prato_feito/it.json';
import recipePratoFeitoJa from '../recipes/prato_feito/ja.json';
import recipePratoFeitoPt from '../recipes/prato_feito/pt.json';
import recipeProteinEnergyBalls from '../recipes/protein_energy_balls/recipe.json';
import recipeProteinEnergyBallsDe from '../recipes/protein_energy_balls/de.json';
import recipeProteinEnergyBallsEn from '../recipes/protein_energy_balls/en.json';
import recipeProteinEnergyBallsEs from '../recipes/protein_energy_balls/es.json';
import recipeProteinEnergyBallsFr from '../recipes/protein_energy_balls/fr.json';
import recipeProteinEnergyBallsIt from '../recipes/protein_energy_balls/it.json';
import recipeProteinEnergyBallsJa from '../recipes/protein_energy_balls/ja.json';
import recipeProteinEnergyBallsPt from '../recipes/protein_energy_balls/pt.json';
import recipeProteinPancakes from '../recipes/protein_pancakes/recipe.json';
import recipeProteinPancakesDe from '../recipes/protein_pancakes/de.json';
import recipeProteinPancakesEn from '../recipes/protein_pancakes/en.json';
import recipeProteinPancakesEs from '../recipes/protein_pancakes/es.json';
import recipeProteinPancakesFr from '../recipes/protein_pancakes/fr.json';
import recipeProteinPancakesIt from '../recipes/protein_pancakes/it.json';
import recipeProteinPancakesJa from '../recipes/protein_pancakes/ja.json';
import recipeProteinPancakesPt from '../recipes/protein_pancakes/pt.json';
import recipeQuarkBerries from '../recipes/quark_berries/recipe.json';
import recipeQuarkBerriesDe from '../recipes/quark_berries/de.json';
import recipeQuarkBerriesEn from '../recipes/quark_berries/en.json';
import recipeQuarkBerriesEs from '../recipes/quark_berries/es.json';
import recipeQuarkBerriesFr from '../recipes/quark_berries/fr.json';
import recipeQuarkBerriesIt from '../recipes/quark_berries/it.json';
import recipeQuarkBerriesJa from '../recipes/quark_berries/ja.json';
import recipeQuarkBerriesPt from '../recipes/quark_berries/pt.json';
import recipeQuarkBircher from '../recipes/quark_bircher/recipe.json';
import recipeQuarkBircherDe from '../recipes/quark_bircher/de.json';
import recipeQuarkBircherEn from '../recipes/quark_bircher/en.json';
import recipeQuarkBircherEs from '../recipes/quark_bircher/es.json';
import recipeQuarkBircherFr from '../recipes/quark_bircher/fr.json';
import recipeQuarkBircherIt from '../recipes/quark_bircher/it.json';
import recipeQuarkBircherJa from '../recipes/quark_bircher/ja.json';
import recipeQuarkBircherPt from '../recipes/quark_bircher/pt.json';
import recipeQuinoaBreakfastPorridge from '../recipes/quinoa_breakfast_porridge/recipe.json';
import recipeQuinoaBreakfastPorridgeDe from '../recipes/quinoa_breakfast_porridge/de.json';
import recipeQuinoaBreakfastPorridgeEn from '../recipes/quinoa_breakfast_porridge/en.json';
import recipeQuinoaBreakfastPorridgeEs from '../recipes/quinoa_breakfast_porridge/es.json';
import recipeQuinoaBreakfastPorridgeFr from '../recipes/quinoa_breakfast_porridge/fr.json';
import recipeQuinoaBreakfastPorridgeIt from '../recipes/quinoa_breakfast_porridge/it.json';
import recipeQuinoaBreakfastPorridgeJa from '../recipes/quinoa_breakfast_porridge/ja.json';
import recipeQuinoaBreakfastPorridgePt from '../recipes/quinoa_breakfast_porridge/pt.json';
import recipeQuinoaFetaSalad from '../recipes/quinoa_feta_salad/recipe.json';
import recipeQuinoaFetaSaladDe from '../recipes/quinoa_feta_salad/de.json';
import recipeQuinoaFetaSaladEn from '../recipes/quinoa_feta_salad/en.json';
import recipeQuinoaFetaSaladEs from '../recipes/quinoa_feta_salad/es.json';
import recipeQuinoaFetaSaladFr from '../recipes/quinoa_feta_salad/fr.json';
import recipeQuinoaFetaSaladIt from '../recipes/quinoa_feta_salad/it.json';
import recipeQuinoaFetaSaladJa from '../recipes/quinoa_feta_salad/ja.json';
import recipeQuinoaFetaSaladPt from '../recipes/quinoa_feta_salad/pt.json';
import recipeQuinoaPan from '../recipes/quinoa_pan/recipe.json';
import recipeQuinoaPanDe from '../recipes/quinoa_pan/de.json';
import recipeQuinoaPanEn from '../recipes/quinoa_pan/en.json';
import recipeQuinoaPanEs from '../recipes/quinoa_pan/es.json';
import recipeQuinoaPanFr from '../recipes/quinoa_pan/fr.json';
import recipeQuinoaPanIt from '../recipes/quinoa_pan/it.json';
import recipeQuinoaPanJa from '../recipes/quinoa_pan/ja.json';
import recipeQuinoaPanPt from '../recipes/quinoa_pan/pt.json';
import recipeRajma from '../recipes/rajma/recipe.json';
import recipeRajmaDe from '../recipes/rajma/de.json';
import recipeRajmaEn from '../recipes/rajma/en.json';
import recipeRajmaEs from '../recipes/rajma/es.json';
import recipeRajmaFr from '../recipes/rajma/fr.json';
import recipeRajmaIt from '../recipes/rajma/it.json';
import recipeRajmaJa from '../recipes/rajma/ja.json';
import recipeRajmaPt from '../recipes/rajma/pt.json';
import recipeRatatouilleWhiteBeans from '../recipes/ratatouille_white_beans/recipe.json';
import recipeRatatouilleWhiteBeansDe from '../recipes/ratatouille_white_beans/de.json';
import recipeRatatouilleWhiteBeansEn from '../recipes/ratatouille_white_beans/en.json';
import recipeRatatouilleWhiteBeansEs from '../recipes/ratatouille_white_beans/es.json';
import recipeRatatouilleWhiteBeansFr from '../recipes/ratatouille_white_beans/fr.json';
import recipeRatatouilleWhiteBeansIt from '../recipes/ratatouille_white_beans/it.json';
import recipeRatatouilleWhiteBeansJa from '../recipes/ratatouille_white_beans/ja.json';
import recipeRatatouilleWhiteBeansPt from '../recipes/ratatouille_white_beans/pt.json';
import recipeRicottaBerryToast from '../recipes/ricotta_berry_toast/recipe.json';
import recipeRicottaBerryToastDe from '../recipes/ricotta_berry_toast/de.json';
import recipeRicottaBerryToastEn from '../recipes/ricotta_berry_toast/en.json';
import recipeRicottaBerryToastEs from '../recipes/ricotta_berry_toast/es.json';
import recipeRicottaBerryToastFr from '../recipes/ricotta_berry_toast/fr.json';
import recipeRicottaBerryToastIt from '../recipes/ricotta_berry_toast/it.json';
import recipeRicottaBerryToastJa from '../recipes/ricotta_berry_toast/ja.json';
import recipeRicottaBerryToastPt from '../recipes/ricotta_berry_toast/pt.json';
import recipeRoastedChickpeas from '../recipes/roasted_chickpeas/recipe.json';
import recipeRoastedChickpeasDe from '../recipes/roasted_chickpeas/de.json';
import recipeRoastedChickpeasEn from '../recipes/roasted_chickpeas/en.json';
import recipeRoastedChickpeasEs from '../recipes/roasted_chickpeas/es.json';
import recipeRoastedChickpeasFr from '../recipes/roasted_chickpeas/fr.json';
import recipeRoastedChickpeasIt from '../recipes/roasted_chickpeas/it.json';
import recipeRoastedChickpeasJa from '../recipes/roasted_chickpeas/ja.json';
import recipeRoastedChickpeasPt from '../recipes/roasted_chickpeas/pt.json';
import recipeRostiFriedEgg from '../recipes/rosti_fried_egg/recipe.json';
import recipeRostiFriedEggDe from '../recipes/rosti_fried_egg/de.json';
import recipeRostiFriedEggEn from '../recipes/rosti_fried_egg/en.json';
import recipeRostiFriedEggEs from '../recipes/rosti_fried_egg/es.json';
import recipeRostiFriedEggFr from '../recipes/rosti_fried_egg/fr.json';
import recipeRostiFriedEggIt from '../recipes/rosti_fried_egg/it.json';
import recipeRostiFriedEggJa from '../recipes/rosti_fried_egg/ja.json';
import recipeRostiFriedEggPt from '../recipes/rosti_fried_egg/pt.json';
import recipeSabaShioyaki from '../recipes/saba_shioyaki/recipe.json';
import recipeSabaShioyakiDe from '../recipes/saba_shioyaki/de.json';
import recipeSabaShioyakiEn from '../recipes/saba_shioyaki/en.json';
import recipeSabaShioyakiEs from '../recipes/saba_shioyaki/es.json';
import recipeSabaShioyakiFr from '../recipes/saba_shioyaki/fr.json';
import recipeSabaShioyakiIt from '../recipes/saba_shioyaki/it.json';
import recipeSabaShioyakiJa from '../recipes/saba_shioyaki/ja.json';
import recipeSabaShioyakiPt from '../recipes/saba_shioyaki/pt.json';
import recipeSalmonCucumberBites from '../recipes/salmon_cucumber_bites/recipe.json';
import recipeSalmonCucumberBitesDe from '../recipes/salmon_cucumber_bites/de.json';
import recipeSalmonCucumberBitesEn from '../recipes/salmon_cucumber_bites/en.json';
import recipeSalmonCucumberBitesEs from '../recipes/salmon_cucumber_bites/es.json';
import recipeSalmonCucumberBitesFr from '../recipes/salmon_cucumber_bites/fr.json';
import recipeSalmonCucumberBitesIt from '../recipes/salmon_cucumber_bites/it.json';
import recipeSalmonCucumberBitesJa from '../recipes/salmon_cucumber_bites/ja.json';
import recipeSalmonCucumberBitesPt from '../recipes/salmon_cucumber_bites/pt.json';
import recipeSalmonPoke from '../recipes/salmon_poke/recipe.json';
import recipeSalmonPokeDe from '../recipes/salmon_poke/de.json';
import recipeSalmonPokeEn from '../recipes/salmon_poke/en.json';
import recipeSalmonPokeEs from '../recipes/salmon_poke/es.json';
import recipeSalmonPokeFr from '../recipes/salmon_poke/fr.json';
import recipeSalmonPokeIt from '../recipes/salmon_poke/it.json';
import recipeSalmonPokeJa from '../recipes/salmon_poke/ja.json';
import recipeSalmonPokePt from '../recipes/salmon_poke/pt.json';
import recipeSalmonPuyLentils from '../recipes/salmon_puy_lentils/recipe.json';
import recipeSalmonPuyLentilsDe from '../recipes/salmon_puy_lentils/de.json';
import recipeSalmonPuyLentilsEn from '../recipes/salmon_puy_lentils/en.json';
import recipeSalmonPuyLentilsEs from '../recipes/salmon_puy_lentils/es.json';
import recipeSalmonPuyLentilsFr from '../recipes/salmon_puy_lentils/fr.json';
import recipeSalmonPuyLentilsIt from '../recipes/salmon_puy_lentils/it.json';
import recipeSalmonPuyLentilsJa from '../recipes/salmon_puy_lentils/ja.json';
import recipeSalmonPuyLentilsPt from '../recipes/salmon_puy_lentils/pt.json';
import recipeSalpicaoFrango from '../recipes/salpicao_frango/recipe.json';
import recipeSalpicaoFrangoDe from '../recipes/salpicao_frango/de.json';
import recipeSalpicaoFrangoEn from '../recipes/salpicao_frango/en.json';
import recipeSalpicaoFrangoEs from '../recipes/salpicao_frango/es.json';
import recipeSalpicaoFrangoFr from '../recipes/salpicao_frango/fr.json';
import recipeSalpicaoFrangoIt from '../recipes/salpicao_frango/it.json';
import recipeSalpicaoFrangoJa from '../recipes/salpicao_frango/ja.json';
import recipeSalpicaoFrangoPt from '../recipes/salpicao_frango/pt.json';
import recipeScrambledEggs from '../recipes/scrambled_eggs/recipe.json';
import recipeScrambledEggsDe from '../recipes/scrambled_eggs/de.json';
import recipeScrambledEggsEn from '../recipes/scrambled_eggs/en.json';
import recipeScrambledEggsEs from '../recipes/scrambled_eggs/es.json';
import recipeScrambledEggsFr from '../recipes/scrambled_eggs/fr.json';
import recipeScrambledEggsIt from '../recipes/scrambled_eggs/it.json';
import recipeScrambledEggsJa from '../recipes/scrambled_eggs/ja.json';
import recipeScrambledEggsPt from '../recipes/scrambled_eggs/pt.json';
import recipeSeafoodPaella from '../recipes/seafood_paella/recipe.json';
import recipeSeafoodPaellaDe from '../recipes/seafood_paella/de.json';
import recipeSeafoodPaellaEn from '../recipes/seafood_paella/en.json';
import recipeSeafoodPaellaEs from '../recipes/seafood_paella/es.json';
import recipeSeafoodPaellaFr from '../recipes/seafood_paella/fr.json';
import recipeSeafoodPaellaIt from '../recipes/seafood_paella/it.json';
import recipeSeafoodPaellaJa from '../recipes/seafood_paella/ja.json';
import recipeSeafoodPaellaPt from '../recipes/seafood_paella/pt.json';
import recipeSesameTofuBites from '../recipes/sesame_tofu_bites/recipe.json';
import recipeSesameTofuBitesDe from '../recipes/sesame_tofu_bites/de.json';
import recipeSesameTofuBitesEn from '../recipes/sesame_tofu_bites/en.json';
import recipeSesameTofuBitesEs from '../recipes/sesame_tofu_bites/es.json';
import recipeSesameTofuBitesFr from '../recipes/sesame_tofu_bites/fr.json';
import recipeSesameTofuBitesIt from '../recipes/sesame_tofu_bites/it.json';
import recipeSesameTofuBitesJa from '../recipes/sesame_tofu_bites/ja.json';
import recipeSesameTofuBitesPt from '../recipes/sesame_tofu_bites/pt.json';
import recipeShakshuka from '../recipes/shakshuka/recipe.json';
import recipeShakshukaDe from '../recipes/shakshuka/de.json';
import recipeShakshukaEn from '../recipes/shakshuka/en.json';
import recipeShakshukaEs from '../recipes/shakshuka/es.json';
import recipeShakshukaFr from '../recipes/shakshuka/fr.json';
import recipeShakshukaIt from '../recipes/shakshuka/it.json';
import recipeShakshukaJa from '../recipes/shakshuka/ja.json';
import recipeShakshukaPt from '../recipes/shakshuka/pt.json';
import recipeShrimpCocktail from '../recipes/shrimp_cocktail/recipe.json';
import recipeShrimpCocktailDe from '../recipes/shrimp_cocktail/de.json';
import recipeShrimpCocktailEn from '../recipes/shrimp_cocktail/en.json';
import recipeShrimpCocktailEs from '../recipes/shrimp_cocktail/es.json';
import recipeShrimpCocktailFr from '../recipes/shrimp_cocktail/fr.json';
import recipeShrimpCocktailIt from '../recipes/shrimp_cocktail/it.json';
import recipeShrimpCocktailJa from '../recipes/shrimp_cocktail/ja.json';
import recipeShrimpCocktailPt from '../recipes/shrimp_cocktail/pt.json';
import recipeShrimpGarlicPasta from '../recipes/shrimp_garlic_pasta/recipe.json';
import recipeShrimpGarlicPastaDe from '../recipes/shrimp_garlic_pasta/de.json';
import recipeShrimpGarlicPastaEn from '../recipes/shrimp_garlic_pasta/en.json';
import recipeShrimpGarlicPastaEs from '../recipes/shrimp_garlic_pasta/es.json';
import recipeShrimpGarlicPastaFr from '../recipes/shrimp_garlic_pasta/fr.json';
import recipeShrimpGarlicPastaIt from '../recipes/shrimp_garlic_pasta/it.json';
import recipeShrimpGarlicPastaJa from '../recipes/shrimp_garlic_pasta/ja.json';
import recipeShrimpGarlicPastaPt from '../recipes/shrimp_garlic_pasta/pt.json';
import recipeShrimpSaganaki from '../recipes/shrimp_saganaki/recipe.json';
import recipeShrimpSaganakiDe from '../recipes/shrimp_saganaki/de.json';
import recipeShrimpSaganakiEn from '../recipes/shrimp_saganaki/en.json';
import recipeShrimpSaganakiEs from '../recipes/shrimp_saganaki/es.json';
import recipeShrimpSaganakiFr from '../recipes/shrimp_saganaki/fr.json';
import recipeShrimpSaganakiIt from '../recipes/shrimp_saganaki/it.json';
import recipeShrimpSaganakiJa from '../recipes/shrimp_saganaki/ja.json';
import recipeShrimpSaganakiPt from '../recipes/shrimp_saganaki/pt.json';
import recipeShrimpTacos from '../recipes/shrimp_tacos/recipe.json';
import recipeShrimpTacosDe from '../recipes/shrimp_tacos/de.json';
import recipeShrimpTacosEn from '../recipes/shrimp_tacos/en.json';
import recipeShrimpTacosEs from '../recipes/shrimp_tacos/es.json';
import recipeShrimpTacosFr from '../recipes/shrimp_tacos/fr.json';
import recipeShrimpTacosIt from '../recipes/shrimp_tacos/it.json';
import recipeShrimpTacosJa from '../recipes/shrimp_tacos/ja.json';
import recipeShrimpTacosPt from '../recipes/shrimp_tacos/pt.json';
import recipeSilkenChocolateMousse from '../recipes/silken_chocolate_mousse/recipe.json';
import recipeSilkenChocolateMousseDe from '../recipes/silken_chocolate_mousse/de.json';
import recipeSilkenChocolateMousseEn from '../recipes/silken_chocolate_mousse/en.json';
import recipeSilkenChocolateMousseEs from '../recipes/silken_chocolate_mousse/es.json';
import recipeSilkenChocolateMousseFr from '../recipes/silken_chocolate_mousse/fr.json';
import recipeSilkenChocolateMousseIt from '../recipes/silken_chocolate_mousse/it.json';
import recipeSilkenChocolateMousseJa from '../recipes/silken_chocolate_mousse/ja.json';
import recipeSilkenChocolateMoussePt from '../recipes/silken_chocolate_mousse/pt.json';
import recipeSilkenTofuSmoothie from '../recipes/silken_tofu_smoothie/recipe.json';
import recipeSilkenTofuSmoothieDe from '../recipes/silken_tofu_smoothie/de.json';
import recipeSilkenTofuSmoothieEn from '../recipes/silken_tofu_smoothie/en.json';
import recipeSilkenTofuSmoothieEs from '../recipes/silken_tofu_smoothie/es.json';
import recipeSilkenTofuSmoothieFr from '../recipes/silken_tofu_smoothie/fr.json';
import recipeSilkenTofuSmoothieIt from '../recipes/silken_tofu_smoothie/it.json';
import recipeSilkenTofuSmoothieJa from '../recipes/silken_tofu_smoothie/ja.json';
import recipeSilkenTofuSmoothiePt from '../recipes/silken_tofu_smoothie/pt.json';
import recipeSkagenToast from '../recipes/skagen_toast/recipe.json';
import recipeSkagenToastDe from '../recipes/skagen_toast/de.json';
import recipeSkagenToastEn from '../recipes/skagen_toast/en.json';
import recipeSkagenToastEs from '../recipes/skagen_toast/es.json';
import recipeSkagenToastFr from '../recipes/skagen_toast/fr.json';
import recipeSkagenToastIt from '../recipes/skagen_toast/it.json';
import recipeSkagenToastJa from '../recipes/skagen_toast/ja.json';
import recipeSkagenToastPt from '../recipes/skagen_toast/pt.json';
import recipeSkyrAppleCompote from '../recipes/skyr_apple_compote/recipe.json';
import recipeSkyrAppleCompoteDe from '../recipes/skyr_apple_compote/de.json';
import recipeSkyrAppleCompoteEn from '../recipes/skyr_apple_compote/en.json';
import recipeSkyrAppleCompoteEs from '../recipes/skyr_apple_compote/es.json';
import recipeSkyrAppleCompoteFr from '../recipes/skyr_apple_compote/fr.json';
import recipeSkyrAppleCompoteIt from '../recipes/skyr_apple_compote/it.json';
import recipeSkyrAppleCompoteJa from '../recipes/skyr_apple_compote/ja.json';
import recipeSkyrAppleCompotePt from '../recipes/skyr_apple_compote/pt.json';
import recipeSkyrBerryBark from '../recipes/skyr_berry_bark/recipe.json';
import recipeSkyrBerryBarkDe from '../recipes/skyr_berry_bark/de.json';
import recipeSkyrBerryBarkEn from '../recipes/skyr_berry_bark/en.json';
import recipeSkyrBerryBarkEs from '../recipes/skyr_berry_bark/es.json';
import recipeSkyrBerryBarkFr from '../recipes/skyr_berry_bark/fr.json';
import recipeSkyrBerryBarkIt from '../recipes/skyr_berry_bark/it.json';
import recipeSkyrBerryBarkJa from '../recipes/skyr_berry_bark/ja.json';
import recipeSkyrBerryBarkPt from '../recipes/skyr_berry_bark/pt.json';
import recipeSkyrBerryBowl from '../recipes/skyr_berry_bowl/recipe.json';
import recipeSkyrBerryBowlDe from '../recipes/skyr_berry_bowl/de.json';
import recipeSkyrBerryBowlEn from '../recipes/skyr_berry_bowl/en.json';
import recipeSkyrBerryBowlEs from '../recipes/skyr_berry_bowl/es.json';
import recipeSkyrBerryBowlFr from '../recipes/skyr_berry_bowl/fr.json';
import recipeSkyrBerryBowlIt from '../recipes/skyr_berry_bowl/it.json';
import recipeSkyrBerryBowlJa from '../recipes/skyr_berry_bowl/ja.json';
import recipeSkyrBerryBowlPt from '../recipes/skyr_berry_bowl/pt.json';
import recipeSkyrHerbDip from '../recipes/skyr_herb_dip/recipe.json';
import recipeSkyrHerbDipDe from '../recipes/skyr_herb_dip/de.json';
import recipeSkyrHerbDipEn from '../recipes/skyr_herb_dip/en.json';
import recipeSkyrHerbDipEs from '../recipes/skyr_herb_dip/es.json';
import recipeSkyrHerbDipFr from '../recipes/skyr_herb_dip/fr.json';
import recipeSkyrHerbDipIt from '../recipes/skyr_herb_dip/it.json';
import recipeSkyrHerbDipJa from '../recipes/skyr_herb_dip/ja.json';
import recipeSkyrHerbDipPt from '../recipes/skyr_herb_dip/pt.json';
import recipeSmokedSalmonBread from '../recipes/smoked_salmon_bread/recipe.json';
import recipeSmokedSalmonBreadDe from '../recipes/smoked_salmon_bread/de.json';
import recipeSmokedSalmonBreadEn from '../recipes/smoked_salmon_bread/en.json';
import recipeSmokedSalmonBreadEs from '../recipes/smoked_salmon_bread/es.json';
import recipeSmokedSalmonBreadFr from '../recipes/smoked_salmon_bread/fr.json';
import recipeSmokedSalmonBreadIt from '../recipes/smoked_salmon_bread/it.json';
import recipeSmokedSalmonBreadJa from '../recipes/smoked_salmon_bread/ja.json';
import recipeSmokedSalmonBreadPt from '../recipes/smoked_salmon_bread/pt.json';
import recipeSoyChiaPudding from '../recipes/soy_chia_pudding/recipe.json';
import recipeSoyChiaPuddingDe from '../recipes/soy_chia_pudding/de.json';
import recipeSoyChiaPuddingEn from '../recipes/soy_chia_pudding/en.json';
import recipeSoyChiaPuddingEs from '../recipes/soy_chia_pudding/es.json';
import recipeSoyChiaPuddingFr from '../recipes/soy_chia_pudding/fr.json';
import recipeSoyChiaPuddingIt from '../recipes/soy_chia_pudding/it.json';
import recipeSoyChiaPuddingJa from '../recipes/soy_chia_pudding/ja.json';
import recipeSoyChiaPuddingPt from '../recipes/soy_chia_pudding/pt.json';
import recipeSpinachEggWrap from '../recipes/spinach_egg_wrap/recipe.json';
import recipeSpinachEggWrapDe from '../recipes/spinach_egg_wrap/de.json';
import recipeSpinachEggWrapEn from '../recipes/spinach_egg_wrap/en.json';
import recipeSpinachEggWrapEs from '../recipes/spinach_egg_wrap/es.json';
import recipeSpinachEggWrapFr from '../recipes/spinach_egg_wrap/fr.json';
import recipeSpinachEggWrapIt from '../recipes/spinach_egg_wrap/it.json';
import recipeSpinachEggWrapJa from '../recipes/spinach_egg_wrap/ja.json';
import recipeSpinachEggWrapPt from '../recipes/spinach_egg_wrap/pt.json';
import recipeSpinachFetaOmelette from '../recipes/spinach_feta_omelette/recipe.json';
import recipeSpinachFetaOmeletteDe from '../recipes/spinach_feta_omelette/de.json';
import recipeSpinachFetaOmeletteEn from '../recipes/spinach_feta_omelette/en.json';
import recipeSpinachFetaOmeletteEs from '../recipes/spinach_feta_omelette/es.json';
import recipeSpinachFetaOmeletteFr from '../recipes/spinach_feta_omelette/fr.json';
import recipeSpinachFetaOmeletteIt from '../recipes/spinach_feta_omelette/it.json';
import recipeSpinachFetaOmeletteJa from '../recipes/spinach_feta_omelette/ja.json';
import recipeSpinachFetaOmelettePt from '../recipes/spinach_feta_omelette/pt.json';
import recipeSteamedFishGinger from '../recipes/steamed_fish_ginger/recipe.json';
import recipeSteamedFishGingerDe from '../recipes/steamed_fish_ginger/de.json';
import recipeSteamedFishGingerEn from '../recipes/steamed_fish_ginger/en.json';
import recipeSteamedFishGingerEs from '../recipes/steamed_fish_ginger/es.json';
import recipeSteamedFishGingerFr from '../recipes/steamed_fish_ginger/fr.json';
import recipeSteamedFishGingerIt from '../recipes/steamed_fish_ginger/it.json';
import recipeSteamedFishGingerJa from '../recipes/steamed_fish_ginger/ja.json';
import recipeSteamedFishGingerPt from '../recipes/steamed_fish_ginger/pt.json';
import recipeStuffedPeppersTurkey from '../recipes/stuffed_peppers_turkey/recipe.json';
import recipeStuffedPeppersTurkeyDe from '../recipes/stuffed_peppers_turkey/de.json';
import recipeStuffedPeppersTurkeyEn from '../recipes/stuffed_peppers_turkey/en.json';
import recipeStuffedPeppersTurkeyEs from '../recipes/stuffed_peppers_turkey/es.json';
import recipeStuffedPeppersTurkeyFr from '../recipes/stuffed_peppers_turkey/fr.json';
import recipeStuffedPeppersTurkeyIt from '../recipes/stuffed_peppers_turkey/it.json';
import recipeStuffedPeppersTurkeyJa from '../recipes/stuffed_peppers_turkey/ja.json';
import recipeStuffedPeppersTurkeyPt from '../recipes/stuffed_peppers_turkey/pt.json';
import recipeStuffedSweetPotato from '../recipes/stuffed_sweet_potato/recipe.json';
import recipeStuffedSweetPotatoDe from '../recipes/stuffed_sweet_potato/de.json';
import recipeStuffedSweetPotatoEn from '../recipes/stuffed_sweet_potato/en.json';
import recipeStuffedSweetPotatoEs from '../recipes/stuffed_sweet_potato/es.json';
import recipeStuffedSweetPotatoFr from '../recipes/stuffed_sweet_potato/fr.json';
import recipeStuffedSweetPotatoIt from '../recipes/stuffed_sweet_potato/it.json';
import recipeStuffedSweetPotatoJa from '../recipes/stuffed_sweet_potato/ja.json';
import recipeStuffedSweetPotatoPt from '../recipes/stuffed_sweet_potato/pt.json';
import recipeSummerRolls from '../recipes/summer_rolls/recipe.json';
import recipeSummerRollsDe from '../recipes/summer_rolls/de.json';
import recipeSummerRollsEn from '../recipes/summer_rolls/en.json';
import recipeSummerRollsEs from '../recipes/summer_rolls/es.json';
import recipeSummerRollsFr from '../recipes/summer_rolls/fr.json';
import recipeSummerRollsIt from '../recipes/summer_rolls/it.json';
import recipeSummerRollsJa from '../recipes/summer_rolls/ja.json';
import recipeSummerRollsPt from '../recipes/summer_rolls/pt.json';
import recipeSundubuJjigae from '../recipes/sundubu_jjigae/recipe.json';
import recipeSundubuJjigaeDe from '../recipes/sundubu_jjigae/de.json';
import recipeSundubuJjigaeEn from '../recipes/sundubu_jjigae/en.json';
import recipeSundubuJjigaeEs from '../recipes/sundubu_jjigae/es.json';
import recipeSundubuJjigaeFr from '../recipes/sundubu_jjigae/fr.json';
import recipeSundubuJjigaeIt from '../recipes/sundubu_jjigae/it.json';
import recipeSundubuJjigaeJa from '../recipes/sundubu_jjigae/ja.json';
import recipeSundubuJjigaePt from '../recipes/sundubu_jjigae/pt.json';
import recipeSwissCottageRadishBread from '../recipes/swiss_cottage_radish_bread/recipe.json';
import recipeSwissCottageRadishBreadDe from '../recipes/swiss_cottage_radish_bread/de.json';
import recipeSwissCottageRadishBreadEn from '../recipes/swiss_cottage_radish_bread/en.json';
import recipeSwissCottageRadishBreadEs from '../recipes/swiss_cottage_radish_bread/es.json';
import recipeSwissCottageRadishBreadFr from '../recipes/swiss_cottage_radish_bread/fr.json';
import recipeSwissCottageRadishBreadIt from '../recipes/swiss_cottage_radish_bread/it.json';
import recipeSwissCottageRadishBreadJa from '../recipes/swiss_cottage_radish_bread/ja.json';
import recipeSwissCottageRadishBreadPt from '../recipes/swiss_cottage_radish_bread/pt.json';
import recipeTamagoyakiEdamame from '../recipes/tamagoyaki_edamame/recipe.json';
import recipeTamagoyakiEdamameDe from '../recipes/tamagoyaki_edamame/de.json';
import recipeTamagoyakiEdamameEn from '../recipes/tamagoyaki_edamame/en.json';
import recipeTamagoyakiEdamameEs from '../recipes/tamagoyaki_edamame/es.json';
import recipeTamagoyakiEdamameFr from '../recipes/tamagoyaki_edamame/fr.json';
import recipeTamagoyakiEdamameIt from '../recipes/tamagoyaki_edamame/it.json';
import recipeTamagoyakiEdamameJa from '../recipes/tamagoyaki_edamame/ja.json';
import recipeTamagoyakiEdamamePt from '../recipes/tamagoyaki_edamame/pt.json';
import recipeTandooriChickenSalad from '../recipes/tandoori_chicken_salad/recipe.json';
import recipeTandooriChickenSaladDe from '../recipes/tandoori_chicken_salad/de.json';
import recipeTandooriChickenSaladEn from '../recipes/tandoori_chicken_salad/en.json';
import recipeTandooriChickenSaladEs from '../recipes/tandoori_chicken_salad/es.json';
import recipeTandooriChickenSaladFr from '../recipes/tandoori_chicken_salad/fr.json';
import recipeTandooriChickenSaladIt from '../recipes/tandoori_chicken_salad/it.json';
import recipeTandooriChickenSaladJa from '../recipes/tandoori_chicken_salad/ja.json';
import recipeTandooriChickenSaladPt from '../recipes/tandoori_chicken_salad/pt.json';
import recipeTapiocaEggCheese from '../recipes/tapioca_egg_cheese/recipe.json';
import recipeTapiocaEggCheeseDe from '../recipes/tapioca_egg_cheese/de.json';
import recipeTapiocaEggCheeseEn from '../recipes/tapioca_egg_cheese/en.json';
import recipeTapiocaEggCheeseEs from '../recipes/tapioca_egg_cheese/es.json';
import recipeTapiocaEggCheeseFr from '../recipes/tapioca_egg_cheese/fr.json';
import recipeTapiocaEggCheeseIt from '../recipes/tapioca_egg_cheese/it.json';
import recipeTapiocaEggCheeseJa from '../recipes/tapioca_egg_cheese/ja.json';
import recipeTapiocaEggCheesePt from '../recipes/tapioca_egg_cheese/pt.json';
import recipeTempehStirfry from '../recipes/tempeh_stirfry/recipe.json';
import recipeTempehStirfryDe from '../recipes/tempeh_stirfry/de.json';
import recipeTempehStirfryEn from '../recipes/tempeh_stirfry/en.json';
import recipeTempehStirfryEs from '../recipes/tempeh_stirfry/es.json';
import recipeTempehStirfryFr from '../recipes/tempeh_stirfry/fr.json';
import recipeTempehStirfryIt from '../recipes/tempeh_stirfry/it.json';
import recipeTempehStirfryJa from '../recipes/tempeh_stirfry/ja.json';
import recipeTempehStirfryPt from '../recipes/tempeh_stirfry/pt.json';
import recipeTeriyakiTofu from '../recipes/teriyaki_tofu/recipe.json';
import recipeTeriyakiTofuDe from '../recipes/teriyaki_tofu/de.json';
import recipeTeriyakiTofuEn from '../recipes/teriyaki_tofu/en.json';
import recipeTeriyakiTofuEs from '../recipes/teriyaki_tofu/es.json';
import recipeTeriyakiTofuFr from '../recipes/teriyaki_tofu/fr.json';
import recipeTeriyakiTofuIt from '../recipes/teriyaki_tofu/it.json';
import recipeTeriyakiTofuJa from '../recipes/teriyaki_tofu/ja.json';
import recipeTeriyakiTofuPt from '../recipes/teriyaki_tofu/pt.json';
import recipeThaiCurry from '../recipes/thai_curry/recipe.json';
import recipeThaiCurryDe from '../recipes/thai_curry/de.json';
import recipeThaiCurryEn from '../recipes/thai_curry/en.json';
import recipeThaiCurryEs from '../recipes/thai_curry/es.json';
import recipeThaiCurryFr from '../recipes/thai_curry/fr.json';
import recipeThaiCurryIt from '../recipes/thai_curry/it.json';
import recipeThaiCurryJa from '../recipes/thai_curry/ja.json';
import recipeThaiCurryPt from '../recipes/thai_curry/pt.json';
import recipeTikkaMasalaLight from '../recipes/tikka_masala_light/recipe.json';
import recipeTikkaMasalaLightDe from '../recipes/tikka_masala_light/de.json';
import recipeTikkaMasalaLightEn from '../recipes/tikka_masala_light/en.json';
import recipeTikkaMasalaLightEs from '../recipes/tikka_masala_light/es.json';
import recipeTikkaMasalaLightFr from '../recipes/tikka_masala_light/fr.json';
import recipeTikkaMasalaLightIt from '../recipes/tikka_masala_light/it.json';
import recipeTikkaMasalaLightJa from '../recipes/tikka_masala_light/ja.json';
import recipeTikkaMasalaLightPt from '../recipes/tikka_masala_light/pt.json';
import recipeTofuPoke from '../recipes/tofu_poke/recipe.json';
import recipeTofuPokeDe from '../recipes/tofu_poke/de.json';
import recipeTofuPokeEn from '../recipes/tofu_poke/en.json';
import recipeTofuPokeEs from '../recipes/tofu_poke/es.json';
import recipeTofuPokeFr from '../recipes/tofu_poke/fr.json';
import recipeTofuPokeIt from '../recipes/tofu_poke/it.json';
import recipeTofuPokeJa from '../recipes/tofu_poke/ja.json';
import recipeTofuPokePt from '../recipes/tofu_poke/pt.json';
import recipeTofuScramble from '../recipes/tofu_scramble/recipe.json';
import recipeTofuScrambleDe from '../recipes/tofu_scramble/de.json';
import recipeTofuScrambleEn from '../recipes/tofu_scramble/en.json';
import recipeTofuScrambleEs from '../recipes/tofu_scramble/es.json';
import recipeTofuScrambleFr from '../recipes/tofu_scramble/fr.json';
import recipeTofuScrambleIt from '../recipes/tofu_scramble/it.json';
import recipeTofuScrambleJa from '../recipes/tofu_scramble/ja.json';
import recipeTofuScramblePt from '../recipes/tofu_scramble/pt.json';
import recipeTomYumShrimp from '../recipes/tom_yum_shrimp/recipe.json';
import recipeTomYumShrimpDe from '../recipes/tom_yum_shrimp/de.json';
import recipeTomYumShrimpEn from '../recipes/tom_yum_shrimp/en.json';
import recipeTomYumShrimpEs from '../recipes/tom_yum_shrimp/es.json';
import recipeTomYumShrimpFr from '../recipes/tom_yum_shrimp/fr.json';
import recipeTomYumShrimpIt from '../recipes/tom_yum_shrimp/it.json';
import recipeTomYumShrimpJa from '../recipes/tom_yum_shrimp/ja.json';
import recipeTomYumShrimpPt from '../recipes/tom_yum_shrimp/pt.json';
import recipeTonnoFagioli from '../recipes/tonno_fagioli/recipe.json';
import recipeTonnoFagioliDe from '../recipes/tonno_fagioli/de.json';
import recipeTonnoFagioliEn from '../recipes/tonno_fagioli/en.json';
import recipeTonnoFagioliEs from '../recipes/tonno_fagioli/es.json';
import recipeTonnoFagioliFr from '../recipes/tonno_fagioli/fr.json';
import recipeTonnoFagioliIt from '../recipes/tonno_fagioli/it.json';
import recipeTonnoFagioliJa from '../recipes/tonno_fagioli/ja.json';
import recipeTonnoFagioliPt from '../recipes/tonno_fagioli/pt.json';
import recipeTroutPotatoSalad from '../recipes/trout_potato_salad/recipe.json';
import recipeTroutPotatoSaladDe from '../recipes/trout_potato_salad/de.json';
import recipeTroutPotatoSaladEn from '../recipes/trout_potato_salad/en.json';
import recipeTroutPotatoSaladEs from '../recipes/trout_potato_salad/es.json';
import recipeTroutPotatoSaladFr from '../recipes/trout_potato_salad/fr.json';
import recipeTroutPotatoSaladIt from '../recipes/trout_potato_salad/it.json';
import recipeTroutPotatoSaladJa from '../recipes/trout_potato_salad/ja.json';
import recipeTroutPotatoSaladPt from '../recipes/trout_potato_salad/pt.json';
import recipeTunaAvocado from '../recipes/tuna_avocado/recipe.json';
import recipeTunaAvocadoDe from '../recipes/tuna_avocado/de.json';
import recipeTunaAvocadoEn from '../recipes/tuna_avocado/en.json';
import recipeTunaAvocadoEs from '../recipes/tuna_avocado/es.json';
import recipeTunaAvocadoFr from '../recipes/tuna_avocado/fr.json';
import recipeTunaAvocadoIt from '../recipes/tuna_avocado/it.json';
import recipeTunaAvocadoJa from '../recipes/tuna_avocado/ja.json';
import recipeTunaAvocadoPt from '../recipes/tuna_avocado/pt.json';
import recipeTunaNicoise from '../recipes/tuna_nicoise/recipe.json';
import recipeTunaNicoiseDe from '../recipes/tuna_nicoise/de.json';
import recipeTunaNicoiseEn from '../recipes/tuna_nicoise/en.json';
import recipeTunaNicoiseEs from '../recipes/tuna_nicoise/es.json';
import recipeTunaNicoiseFr from '../recipes/tuna_nicoise/fr.json';
import recipeTunaNicoiseIt from '../recipes/tuna_nicoise/it.json';
import recipeTunaNicoiseJa from '../recipes/tuna_nicoise/ja.json';
import recipeTunaNicoisePt from '../recipes/tuna_nicoise/pt.json';
import recipeTunaOnigiri from '../recipes/tuna_onigiri/recipe.json';
import recipeTunaOnigiriDe from '../recipes/tuna_onigiri/de.json';
import recipeTunaOnigiriEn from '../recipes/tuna_onigiri/en.json';
import recipeTunaOnigiriEs from '../recipes/tuna_onigiri/es.json';
import recipeTunaOnigiriFr from '../recipes/tuna_onigiri/fr.json';
import recipeTunaOnigiriIt from '../recipes/tuna_onigiri/it.json';
import recipeTunaOnigiriJa from '../recipes/tuna_onigiri/ja.json';
import recipeTunaOnigiriPt from '../recipes/tuna_onigiri/pt.json';
import recipeTunaPastaSalad from '../recipes/tuna_pasta_salad/recipe.json';
import recipeTunaPastaSaladDe from '../recipes/tuna_pasta_salad/de.json';
import recipeTunaPastaSaladEn from '../recipes/tuna_pasta_salad/en.json';
import recipeTunaPastaSaladEs from '../recipes/tuna_pasta_salad/es.json';
import recipeTunaPastaSaladFr from '../recipes/tuna_pasta_salad/fr.json';
import recipeTunaPastaSaladIt from '../recipes/tuna_pasta_salad/it.json';
import recipeTunaPastaSaladJa from '../recipes/tuna_pasta_salad/ja.json';
import recipeTunaPastaSaladPt from '../recipes/tuna_pasta_salad/pt.json';
import recipeTunaRiceCakes from '../recipes/tuna_rice_cakes/recipe.json';
import recipeTunaRiceCakesDe from '../recipes/tuna_rice_cakes/de.json';
import recipeTunaRiceCakesEn from '../recipes/tuna_rice_cakes/en.json';
import recipeTunaRiceCakesEs from '../recipes/tuna_rice_cakes/es.json';
import recipeTunaRiceCakesFr from '../recipes/tuna_rice_cakes/fr.json';
import recipeTunaRiceCakesIt from '../recipes/tuna_rice_cakes/it.json';
import recipeTunaRiceCakesJa from '../recipes/tuna_rice_cakes/ja.json';
import recipeTunaRiceCakesPt from '../recipes/tuna_rice_cakes/pt.json';
import recipeTurkeyBolognese from '../recipes/turkey_bolognese/recipe.json';
import recipeTurkeyBologneseDe from '../recipes/turkey_bolognese/de.json';
import recipeTurkeyBologneseEn from '../recipes/turkey_bolognese/en.json';
import recipeTurkeyBologneseEs from '../recipes/turkey_bolognese/es.json';
import recipeTurkeyBologneseFr from '../recipes/turkey_bolognese/fr.json';
import recipeTurkeyBologneseIt from '../recipes/turkey_bolognese/it.json';
import recipeTurkeyBologneseJa from '../recipes/turkey_bolognese/ja.json';
import recipeTurkeyBolognesePt from '../recipes/turkey_bolognese/pt.json';
import recipeTurkeyMeatballs from '../recipes/turkey_meatballs/recipe.json';
import recipeTurkeyMeatballsDe from '../recipes/turkey_meatballs/de.json';
import recipeTurkeyMeatballsEn from '../recipes/turkey_meatballs/en.json';
import recipeTurkeyMeatballsEs from '../recipes/turkey_meatballs/es.json';
import recipeTurkeyMeatballsFr from '../recipes/turkey_meatballs/fr.json';
import recipeTurkeyMeatballsIt from '../recipes/turkey_meatballs/it.json';
import recipeTurkeyMeatballsJa from '../recipes/turkey_meatballs/ja.json';
import recipeTurkeyMeatballsPt from '../recipes/turkey_meatballs/pt.json';
import recipeTurkeyRollups from '../recipes/turkey_rollups/recipe.json';
import recipeTurkeyRollupsDe from '../recipes/turkey_rollups/de.json';
import recipeTurkeyRollupsEn from '../recipes/turkey_rollups/en.json';
import recipeTurkeyRollupsEs from '../recipes/turkey_rollups/es.json';
import recipeTurkeyRollupsFr from '../recipes/turkey_rollups/fr.json';
import recipeTurkeyRollupsIt from '../recipes/turkey_rollups/it.json';
import recipeTurkeyRollupsJa from '../recipes/turkey_rollups/ja.json';
import recipeTurkeyRollupsPt from '../recipes/turkey_rollups/pt.json';
import recipeTurkeyVeggieWrap from '../recipes/turkey_veggie_wrap/recipe.json';
import recipeTurkeyVeggieWrapDe from '../recipes/turkey_veggie_wrap/de.json';
import recipeTurkeyVeggieWrapEn from '../recipes/turkey_veggie_wrap/en.json';
import recipeTurkeyVeggieWrapEs from '../recipes/turkey_veggie_wrap/es.json';
import recipeTurkeyVeggieWrapFr from '../recipes/turkey_veggie_wrap/fr.json';
import recipeTurkeyVeggieWrapIt from '../recipes/turkey_veggie_wrap/it.json';
import recipeTurkeyVeggieWrapJa from '../recipes/turkey_veggie_wrap/ja.json';
import recipeTurkeyVeggieWrapPt from '../recipes/turkey_veggie_wrap/pt.json';
import recipeTzatzikiPita from '../recipes/tzatziki_pita/recipe.json';
import recipeTzatzikiPitaDe from '../recipes/tzatziki_pita/de.json';
import recipeTzatzikiPitaEn from '../recipes/tzatziki_pita/en.json';
import recipeTzatzikiPitaEs from '../recipes/tzatziki_pita/es.json';
import recipeTzatzikiPitaFr from '../recipes/tzatziki_pita/fr.json';
import recipeTzatzikiPitaIt from '../recipes/tzatziki_pita/it.json';
import recipeTzatzikiPitaJa from '../recipes/tzatziki_pita/ja.json';
import recipeTzatzikiPitaPt from '../recipes/tzatziki_pita/pt.json';
import recipeVeggieEggMuffins from '../recipes/veggie_egg_muffins/recipe.json';
import recipeVeggieEggMuffinsDe from '../recipes/veggie_egg_muffins/de.json';
import recipeVeggieEggMuffinsEn from '../recipes/veggie_egg_muffins/en.json';
import recipeVeggieEggMuffinsEs from '../recipes/veggie_egg_muffins/es.json';
import recipeVeggieEggMuffinsFr from '../recipes/veggie_egg_muffins/fr.json';
import recipeVeggieEggMuffinsIt from '../recipes/veggie_egg_muffins/it.json';
import recipeVeggieEggMuffinsJa from '../recipes/veggie_egg_muffins/ja.json';
import recipeVeggieEggMuffinsPt from '../recipes/veggie_egg_muffins/pt.json';
import recipeVeggieOmelette from '../recipes/veggie_omelette/recipe.json';
import recipeVeggieOmeletteDe from '../recipes/veggie_omelette/de.json';
import recipeVeggieOmeletteEn from '../recipes/veggie_omelette/en.json';
import recipeVeggieOmeletteEs from '../recipes/veggie_omelette/es.json';
import recipeVeggieOmeletteFr from '../recipes/veggie_omelette/fr.json';
import recipeVeggieOmeletteIt from '../recipes/veggie_omelette/it.json';
import recipeVeggieOmeletteJa from '../recipes/veggie_omelette/ja.json';
import recipeVeggieOmelettePt from '../recipes/veggie_omelette/pt.json';
import recipeVitaminaBanana from '../recipes/vitamina_banana/recipe.json';
import recipeVitaminaBananaDe from '../recipes/vitamina_banana/de.json';
import recipeVitaminaBananaEn from '../recipes/vitamina_banana/en.json';
import recipeVitaminaBananaEs from '../recipes/vitamina_banana/es.json';
import recipeVitaminaBananaFr from '../recipes/vitamina_banana/fr.json';
import recipeVitaminaBananaIt from '../recipes/vitamina_banana/it.json';
import recipeVitaminaBananaJa from '../recipes/vitamina_banana/ja.json';
import recipeVitaminaBananaPt from '../recipes/vitamina_banana/pt.json';
import recipeWhitefishPotatoes from '../recipes/whitefish_potatoes/recipe.json';
import recipeWhitefishPotatoesDe from '../recipes/whitefish_potatoes/de.json';
import recipeWhitefishPotatoesEn from '../recipes/whitefish_potatoes/en.json';
import recipeWhitefishPotatoesEs from '../recipes/whitefish_potatoes/es.json';
import recipeWhitefishPotatoesFr from '../recipes/whitefish_potatoes/fr.json';
import recipeWhitefishPotatoesIt from '../recipes/whitefish_potatoes/it.json';
import recipeWhitefishPotatoesJa from '../recipes/whitefish_potatoes/ja.json';
import recipeWhitefishPotatoesPt from '../recipes/whitefish_potatoes/pt.json';
import recipeYogurtBowl from '../recipes/yogurt_bowl/recipe.json';
import recipeYogurtBowlDe from '../recipes/yogurt_bowl/de.json';
import recipeYogurtBowlEn from '../recipes/yogurt_bowl/en.json';
import recipeYogurtBowlEs from '../recipes/yogurt_bowl/es.json';
import recipeYogurtBowlFr from '../recipes/yogurt_bowl/fr.json';
import recipeYogurtBowlIt from '../recipes/yogurt_bowl/it.json';
import recipeYogurtBowlJa from '../recipes/yogurt_bowl/ja.json';
import recipeYogurtBowlPt from '../recipes/yogurt_bowl/pt.json';
import recipeYumNua from '../recipes/yum_nua/recipe.json';
import recipeYumNuaDe from '../recipes/yum_nua/de.json';
import recipeYumNuaEn from '../recipes/yum_nua/en.json';
import recipeYumNuaEs from '../recipes/yum_nua/es.json';
import recipeYumNuaFr from '../recipes/yum_nua/fr.json';
import recipeYumNuaIt from '../recipes/yum_nua/it.json';
import recipeYumNuaJa from '../recipes/yum_nua/ja.json';
import recipeYumNuaPt from '../recipes/yum_nua/pt.json';
import recipeZurichGeschnetzeltes from '../recipes/zurich_geschnetzeltes/recipe.json';
import recipeZurichGeschnetzeltesDe from '../recipes/zurich_geschnetzeltes/de.json';
import recipeZurichGeschnetzeltesEn from '../recipes/zurich_geschnetzeltes/en.json';
import recipeZurichGeschnetzeltesEs from '../recipes/zurich_geschnetzeltes/es.json';
import recipeZurichGeschnetzeltesFr from '../recipes/zurich_geschnetzeltes/fr.json';
import recipeZurichGeschnetzeltesIt from '../recipes/zurich_geschnetzeltes/it.json';
import recipeZurichGeschnetzeltesJa from '../recipes/zurich_geschnetzeltes/ja.json';
import recipeZurichGeschnetzeltesPt from '../recipes/zurich_geschnetzeltes/pt.json';
import imgAcaiSkyrBowlFull from '../images/recipes/acai_skyr_bowl.webp';
import imgAcaiSkyrBowlThumb from '../images/recipes/acai_skyr_bowl-thumb.webp';
import imgAjiDeGallinaLightFull from '../images/recipes/aji_de_gallina_light.webp';
import imgAjiDeGallinaLightThumb from '../images/recipes/aji_de_gallina_light-thumb.webp';
import imgAlplerMagronenLightFull from '../images/recipes/alpler_magronen_light.webp';
import imgAlplerMagronenLightThumb from '../images/recipes/alpler_magronen_light-thumb.webp';
import imgAppleSkyrPbDipFull from '../images/recipes/apple_skyr_pb_dip.webp';
import imgAppleSkyrPbDipThumb from '../images/recipes/apple_skyr_pb_dip-thumb.webp';
import imgAvocadoEggToastFull from '../images/recipes/avocado_egg_toast.webp';
import imgAvocadoEggToastThumb from '../images/recipes/avocado_egg_toast-thumb.webp';
import imgBacalhauGraoFull from '../images/recipes/bacalhau_grao.webp';
import imgBacalhauGraoThumb from '../images/recipes/bacalhau_grao-thumb.webp';
import imgBakedCodTomatoesFull from '../images/recipes/baked_cod_tomatoes.webp';
import imgBakedCodTomatoesThumb from '../images/recipes/baked_cod_tomatoes-thumb.webp';
import imgBakedFalafelBowlFull from '../images/recipes/baked_falafel_bowl.webp';
import imgBakedFalafelBowlThumb from '../images/recipes/baked_falafel_bowl-thumb.webp';
import imgBakedFetaChickpeasFull from '../images/recipes/baked_feta_chickpeas.webp';
import imgBakedFetaChickpeasThumb from '../images/recipes/baked_feta_chickpeas-thumb.webp';
import imgBananaProteinShakeFull from '../images/recipes/banana_protein_shake.webp';
import imgBananaProteinShakeThumb from '../images/recipes/banana_protein_shake-thumb.webp';
import imgBanhMiBowlFull from '../images/recipes/banh_mi_bowl.webp';
import imgBanhMiBowlThumb from '../images/recipes/banh_mi_bowl-thumb.webp';
import imgBarleyRisottoChickenFull from '../images/recipes/barley_risotto_chicken.webp';
import imgBarleyRisottoChickenThumb from '../images/recipes/barley_risotto_chicken-thumb.webp';
import imgBeefBroccoliFull from '../images/recipes/beef_broccoli.webp';
import imgBeefBroccoliThumb from '../images/recipes/beef_broccoli-thumb.webp';
import imgBeefFajitaBowlFull from '../images/recipes/beef_fajita_bowl.webp';
import imgBeefFajitaBowlThumb from '../images/recipes/beef_fajita_bowl-thumb.webp';
import imgBeefKoftaYogurtFull from '../images/recipes/beef_kofta_yogurt.webp';
import imgBeefKoftaYogurtThumb from '../images/recipes/beef_kofta_yogurt-thumb.webp';
import imgBeefSteakVegetablesFull from '../images/recipes/beef_steak_vegetables.webp';
import imgBeefSteakVegetablesThumb from '../images/recipes/beef_steak_vegetables-thumb.webp';
import imgBerryProteinSmoothieFull from '../images/recipes/berry_protein_smoothie.webp';
import imgBerryProteinSmoothieThumb from '../images/recipes/berry_protein_smoothie-thumb.webp';
import imgBibimbapFull from '../images/recipes/bibimbap.webp';
import imgBibimbapThumb from '../images/recipes/bibimbap-thumb.webp';
import imgBirchermuesliFull from '../images/recipes/birchermuesli.webp';
import imgBirchermuesliThumb from '../images/recipes/birchermuesli-thumb.webp';
import imgBlackBeanSoupFull from '../images/recipes/black_bean_soup.webp';
import imgBlackBeanSoupThumb from '../images/recipes/black_bean_soup-thumb.webp';
import imgBoboCamaraoFull from '../images/recipes/bobo_camarao.webp';
import imgBoboCamaraoThumb from '../images/recipes/bobo_camarao-thumb.webp';
import imgBreakfastBurritoFull from '../images/recipes/breakfast_burrito.webp';
import imgBreakfastBurritoThumb from '../images/recipes/breakfast_burrito-thumb.webp';
import imgBresaolaRocketToastFull from '../images/recipes/bresaola_rocket_toast.webp';
import imgBresaolaRocketToastThumb from '../images/recipes/bresaola_rocket_toast-thumb.webp';
import imgBresaolaRollsFull from '../images/recipes/bresaola_rolls.webp';
import imgBresaolaRollsThumb from '../images/recipes/bresaola_rolls-thumb.webp';
import imgBuckwheatGaletteFull from '../images/recipes/buckwheat_galette.webp';
import imgBuckwheatGaletteThumb from '../images/recipes/buckwheat_galette-thumb.webp';
import imgBulgogiFull from '../images/recipes/bulgogi.webp';
import imgBulgogiThumb from '../images/recipes/bulgogi-thumb.webp';
import imgBunChayTofuFull from '../images/recipes/bun_chay_tofu.webp';
import imgBunChayTofuThumb from '../images/recipes/bun_chay_tofu-thumb.webp';
import imgBundnerBarleySoupFull from '../images/recipes/bundner_barley_soup.webp';
import imgBundnerBarleySoupThumb from '../images/recipes/bundner_barley_soup-thumb.webp';
import imgBundnerfleischCrispbreadFull from '../images/recipes/bundnerfleisch_crispbread.webp';
import imgBundnerfleischCrispbreadThumb from '../images/recipes/bundnerfleisch_crispbread-thumb.webp';
import imgBurritoBowlFull from '../images/recipes/burrito_bowl.webp';
import imgBurritoBowlThumb from '../images/recipes/burrito_bowl-thumb.webp';
import imgCaKhoFull from '../images/recipes/ca_kho.webp';
import imgCaKhoThumb from '../images/recipes/ca_kho-thumb.webp';
import imgCaldoVerdeBeansFull from '../images/recipes/caldo_verde_beans.webp';
import imgCaldoVerdeBeansThumb from '../images/recipes/caldo_verde_beans-thumb.webp';
import imgCevicheSweetPotatoFull from '../images/recipes/ceviche_sweet_potato.webp';
import imgCevicheSweetPotatoThumb from '../images/recipes/ceviche_sweet_potato-thumb.webp';
import imgChanaMasalaFull from '../images/recipes/chana_masala.webp';
import imgChanaMasalaThumb from '../images/recipes/chana_masala-thumb.webp';
import imgChiaSkyrMangoFull from '../images/recipes/chia_skyr_mango.webp';
import imgChiaSkyrMangoThumb from '../images/recipes/chia_skyr_mango-thumb.webp';
import imgChickenBowlFull from '../images/recipes/chicken_bowl.webp';
import imgChickenBowlThumb from '../images/recipes/chicken_bowl-thumb.webp';
import imgChickenCaesarLightFull from '../images/recipes/chicken_caesar_light.webp';
import imgChickenCaesarLightThumb from '../images/recipes/chicken_caesar_light-thumb.webp';
import imgChickenCapreseSaladFull from '../images/recipes/chicken_caprese_salad.webp';
import imgChickenCapreseSaladThumb from '../images/recipes/chicken_caprese_salad-thumb.webp';
import imgChickenCongeeFull from '../images/recipes/chicken_congee.webp';
import imgChickenCongeeThumb from '../images/recipes/chicken_congee-thumb.webp';
import imgChickenFajitasFull from '../images/recipes/chicken_fajitas.webp';
import imgChickenFajitasThumb from '../images/recipes/chicken_fajitas-thumb.webp';
import imgChickenPiccataFull from '../images/recipes/chicken_piccata.webp';
import imgChickenPiccataThumb from '../images/recipes/chicken_piccata-thumb.webp';
import imgChickenSataySkewersFull from '../images/recipes/chicken_satay_skewers.webp';
import imgChickenSataySkewersThumb from '../images/recipes/chicken_satay_skewers-thumb.webp';
import imgChickenShawarmaBowlFull from '../images/recipes/chicken_shawarma_bowl.webp';
import imgChickenShawarmaBowlThumb from '../images/recipes/chicken_shawarma_bowl-thumb.webp';
import imgChickenSouvlakiFull from '../images/recipes/chicken_souvlaki.webp';
import imgChickenSouvlakiThumb from '../images/recipes/chicken_souvlaki-thumb.webp';
import imgChickenSweetPotatoTraybakeFull from '../images/recipes/chicken_sweet_potato_traybake.webp';
import imgChickenSweetPotatoTraybakeThumb from '../images/recipes/chicken_sweet_potato_traybake-thumb.webp';
import imgChickenTagineFull from '../images/recipes/chicken_tagine.webp';
import imgChickenTagineThumb from '../images/recipes/chicken_tagine-thumb.webp';
import imgChickenTortillaSoupFull from '../images/recipes/chicken_tortilla_soup.webp';
import imgChickenTortillaSoupThumb from '../images/recipes/chicken_tortilla_soup-thumb.webp';
import imgChickenVegetableSoupFull from '../images/recipes/chicken_vegetable_soup.webp';
import imgChickenVegetableSoupThumb from '../images/recipes/chicken_vegetable_soup-thumb.webp';
import imgChickpeaChaatFull from '../images/recipes/chickpea_chaat.webp';
import imgChickpeaChaatThumb from '../images/recipes/chickpea_chaat-thumb.webp';
import imgChickpeaTunaSaladFull from '../images/recipes/chickpea_tuna_salad.webp';
import imgChickpeaTunaSaladThumb from '../images/recipes/chickpea_tuna_salad-thumb.webp';
import imgChiliConCarneFull from '../images/recipes/chili_con_carne.webp';
import imgChiliConCarneThumb from '../images/recipes/chili_con_carne-thumb.webp';
import imgChiliSinCarneFull from '../images/recipes/chili_sin_carne.webp';
import imgChiliSinCarneThumb from '../images/recipes/chili_sin_carne-thumb.webp';
import imgCilbirFull from '../images/recipes/cilbir.webp';
import imgCilbirThumb from '../images/recipes/cilbir-thumb.webp';
import imgCocoaProteinMilkFull from '../images/recipes/cocoa_protein_milk.webp';
import imgCocoaProteinMilkThumb from '../images/recipes/cocoa_protein_milk-thumb.webp';
import imgCodDillMustardFull from '../images/recipes/cod_dill_mustard.webp';
import imgCodDillMustardThumb from '../images/recipes/cod_dill_mustard-thumb.webp';
import imgColdSobaTofuFull from '../images/recipes/cold_soba_tofu.webp';
import imgColdSobaTofuThumb from '../images/recipes/cold_soba_tofu-thumb.webp';
import imgCottageCrispbreadFull from '../images/recipes/cottage_crispbread.webp';
import imgCottageCrispbreadThumb from '../images/recipes/cottage_crispbread-thumb.webp';
import imgCottagePineappleFull from '../images/recipes/cottage_pineapple.webp';
import imgCottagePineappleThumb from '../images/recipes/cottage_pineapple-thumb.webp';
import imgCottageTomatoToastFull from '../images/recipes/cottage_tomato_toast.webp';
import imgCottageTomatoToastThumb from '../images/recipes/cottage_tomato_toast-thumb.webp';
import imgCottageZucchiniFrittataFull from '../images/recipes/cottage_zucchini_frittata.webp';
import imgCottageZucchiniFrittataThumb from '../images/recipes/cottage_zucchini_frittata-thumb.webp';
import imgCouscousChickenSaladFull from '../images/recipes/couscous_chicken_salad.webp';
import imgCouscousChickenSaladThumb from '../images/recipes/couscous_chicken_salad-thumb.webp';
import imgCrepiocaChickenFull from '../images/recipes/crepioca_chicken.webp';
import imgCrepiocaChickenThumb from '../images/recipes/crepioca_chicken-thumb.webp';
import imgCuscuzEggFull from '../images/recipes/cuscuz_egg.webp';
import imgCuscuzEggThumb from '../images/recipes/cuscuz_egg-thumb.webp';
import imgDakgalbiFull from '../images/recipes/dakgalbi.webp';
import imgDakgalbiThumb from '../images/recipes/dakgalbi-thumb.webp';
import imgDeviledEggsYogurtFull from '../images/recipes/deviled_eggs_yogurt.webp';
import imgDeviledEggsYogurtThumb from '../images/recipes/deviled_eggs_yogurt-thumb.webp';
import imgEdamameHummusFull from '../images/recipes/edamame_hummus.webp';
import imgEdamameHummusThumb from '../images/recipes/edamame_hummus-thumb.webp';
import imgEdamameQuinoaBowlFull from '../images/recipes/edamame_quinoa_bowl.webp';
import imgEdamameQuinoaBowlThumb from '../images/recipes/edamame_quinoa_bowl-thumb.webp';
import imgEdamameSeaSaltFull from '../images/recipes/edamame_sea_salt.webp';
import imgEdamameSeaSaltThumb from '../images/recipes/edamame_sea_salt-thumb.webp';
import imgEggSaladSandwichFull from '../images/recipes/egg_salad_sandwich.webp';
import imgEggSaladSandwichThumb from '../images/recipes/egg_salad_sandwich-thumb.webp';
import imgEggsCucumberFull from '../images/recipes/eggs_cucumber.webp';
import imgEggsCucumberThumb from '../images/recipes/eggs_cucumber-thumb.webp';
import imgEspinacasGarbanzosFull from '../images/recipes/espinacas_garbanzos.webp';
import imgEspinacasGarbanzosThumb from '../images/recipes/espinacas_garbanzos-thumb.webp';
import imgFeijoadaLightFull from '../images/recipes/feijoada_light.webp';
import imgFeijoadaLightThumb from '../images/recipes/feijoada_light-thumb.webp';
import imgFrangoPiriPiriFull from '../images/recipes/frango_piri_piri.webp';
import imgFrangoPiriPiriThumb from '../images/recipes/frango_piri_piri-thumb.webp';
import imgGaXaoSaOtFull from '../images/recipes/ga_xao_sa_ot.webp';
import imgGaXaoSaOtThumb from '../images/recipes/ga_xao_sa_ot-thumb.webp';
import imgGadoGadoFull from '../images/recipes/gado_gado.webp';
import imgGadoGadoThumb from '../images/recipes/gado_gado-thumb.webp';
import imgGalinhadaFull from '../images/recipes/galinhada.webp';
import imgGalinhadaThumb from '../images/recipes/galinhada-thumb.webp';
import imgGazpachoShrimpFull from '../images/recipes/gazpacho_shrimp.webp';
import imgGazpachoShrimpThumb from '../images/recipes/gazpacho_shrimp-thumb.webp';
import imgGoiGaFull from '../images/recipes/goi_ga.webp';
import imgGoiGaThumb from '../images/recipes/goi_ga-thumb.webp';
import imgGreekChickenSaladFull from '../images/recipes/greek_chicken_salad.webp';
import imgGreekChickenSaladThumb from '../images/recipes/greek_chicken_salad-thumb.webp';
import imgGreekYogurtWalnutFull from '../images/recipes/greek_yogurt_walnut.webp';
import imgGreekYogurtWalnutThumb from '../images/recipes/greek_yogurt_walnut-thumb.webp';
import imgGreenCurryShrimpFull from '../images/recipes/green_curry_shrimp.webp';
import imgGreenCurryShrimpThumb from '../images/recipes/green_curry_shrimp-thumb.webp';
import imgGreenShakshukaFull from '../images/recipes/green_shakshuka.webp';
import imgGreenShakshukaThumb from '../images/recipes/green_shakshuka-thumb.webp';
import imgGreenSkyrSmoothieFull from '../images/recipes/green_skyr_smoothie.webp';
import imgGreenSkyrSmoothieThumb from '../images/recipes/green_skyr_smoothie-thumb.webp';
import imgGyeranJjimFull from '../images/recipes/gyeran_jjim.webp';
import imgGyeranJjimThumb from '../images/recipes/gyeran_jjim-thumb.webp';
import imgGyudonLightFull from '../images/recipes/gyudon_light.webp';
import imgGyudonLightThumb from '../images/recipes/gyudon_light-thumb.webp';
import imgHalloumiLentilSaladFull from '../images/recipes/halloumi_lentil_salad.webp';
import imgHalloumiLentilSaladThumb from '../images/recipes/halloumi_lentil_salad-thumb.webp';
import imgHariraFull from '../images/recipes/harira.webp';
import imgHariraThumb from '../images/recipes/harira-thumb.webp';
import imgHotSourTofuSoupFull from '../images/recipes/hot_sour_tofu_soup.webp';
import imgHotSourTofuSoupThumb from '../images/recipes/hot_sour_tofu_soup-thumb.webp';
import imgHuevosRancherosFull from '../images/recipes/huevos_rancheros.webp';
import imgHuevosRancherosThumb from '../images/recipes/huevos_rancheros-thumb.webp';
import imgHummusVeggieSticksFull from '../images/recipes/hummus_veggie_sticks.webp';
import imgHummusVeggieSticksThumb from '../images/recipes/hummus_veggie_sticks-thumb.webp';
import imgHummusWrapFull from '../images/recipes/hummus_wrap.webp';
import imgHummusWrapThumb from '../images/recipes/hummus_wrap-thumb.webp';
import imgJapaneseChickenCurryFull from '../images/recipes/japanese_chicken_curry.webp';
import imgJapaneseChickenCurryThumb from '../images/recipes/japanese_chicken_curry-thumb.webp';
import imgJapaneseSalmonBreakfastFull from '../images/recipes/japanese_salmon_breakfast.webp';
import imgJapaneseSalmonBreakfastThumb from '../images/recipes/japanese_salmon_breakfast-thumb.webp';
import imgKeralaFishCurryFull from '../images/recipes/kerala_fish_curry.webp';
import imgKeralaFishCurryThumb from '../images/recipes/kerala_fish_curry-thumb.webp';
import imgKimchiScrambledEggsFull from '../images/recipes/kimchi_scrambled_eggs.webp';
import imgKimchiScrambledEggsThumb from '../images/recipes/kimchi_scrambled_eggs-thumb.webp';
import imgKungPaoChickenFull from '../images/recipes/kung_pao_chicken.webp';
import imgKungPaoChickenThumb from '../images/recipes/kung_pao_chicken-thumb.webp';
import imgLabnehZaatarFull from '../images/recipes/labneh_zaatar.webp';
import imgLabnehZaatarThumb from '../images/recipes/labneh_zaatar-thumb.webp';
import imgLarbGaiFull from '../images/recipes/larb_gai.webp';
import imgLarbGaiThumb from '../images/recipes/larb_gai-thumb.webp';
import imgLentilBologneseFull from '../images/recipes/lentil_bolognese.webp';
import imgLentilBologneseThumb from '../images/recipes/lentil_bolognese-thumb.webp';
import imgLentilCurryFull from '../images/recipes/lentil_curry.webp';
import imgLentilCurryThumb from '../images/recipes/lentil_curry-thumb.webp';
import imgLentilFetaSaladFull from '../images/recipes/lentil_feta_salad.webp';
import imgLentilFetaSaladThumb from '../images/recipes/lentil_feta_salad-thumb.webp';
import imgLomoSaltadoFull from '../images/recipes/lomo_saltado.webp';
import imgLomoSaltadoThumb from '../images/recipes/lomo_saltado-thumb.webp';
import imgMapoTofuFull from '../images/recipes/mapo_tofu.webp';
import imgMapoTofuThumb from '../images/recipes/mapo_tofu-thumb.webp';
import imgMasalaOmeletteFull from '../images/recipes/masala_omelette.webp';
import imgMasalaOmeletteThumb from '../images/recipes/masala_omelette-thumb.webp';
import imgMenemenFull from '../images/recipes/menemen.webp';
import imgMenemenThumb from '../images/recipes/menemen-thumb.webp';
import imgMinestroneBeansFull from '../images/recipes/minestrone_beans.webp';
import imgMinestroneBeansThumb from '../images/recipes/minestrone_beans-thumb.webp';
import imgMisoSalmonFull from '../images/recipes/miso_salmon.webp';
import imgMisoSalmonThumb from '../images/recipes/miso_salmon-thumb.webp';
import imgMoongDalChillaFull from '../images/recipes/moong_dal_chilla.webp';
import imgMoongDalChillaThumb from '../images/recipes/moong_dal_chilla-thumb.webp';
import imgMoquecaFull from '../images/recipes/moqueca.webp';
import imgMoquecaThumb from '../images/recipes/moqueca-thumb.webp';
import imgMozzarellaTomatoSkewersFull from '../images/recipes/mozzarella_tomato_skewers.webp';
import imgMozzarellaTomatoSkewersThumb from '../images/recipes/mozzarella_tomato_skewers-thumb.webp';
import imgMushroomPolentaFull from '../images/recipes/mushroom_polenta.webp';
import imgMushroomPolentaThumb from '../images/recipes/mushroom_polenta-thumb.webp';
import imgNasiGorengFull from '../images/recipes/nasi_goreng.webp';
import imgNasiGorengThumb from '../images/recipes/nasi_goreng-thumb.webp';
import imgOatPorridgeQuarkFull from '../images/recipes/oat_porridge_quark.webp';
import imgOatPorridgeQuarkThumb from '../images/recipes/oat_porridge_quark-thumb.webp';
import imgOvenSalmonFull from '../images/recipes/oven_salmon.webp';
import imgOvenSalmonThumb from '../images/recipes/oven_salmon-thumb.webp';
import imgOvernightOatsQuarkFull from '../images/recipes/overnight_oats_quark.webp';
import imgOvernightOatsQuarkThumb from '../images/recipes/overnight_oats_quark-thumb.webp';
import imgOyakodonFull from '../images/recipes/oyakodon.webp';
import imgOyakodonThumb from '../images/recipes/oyakodon-thumb.webp';
import imgPadKraPaoFull from '../images/recipes/pad_kra_pao.webp';
import imgPadKraPaoThumb from '../images/recipes/pad_kra_pao-thumb.webp';
import imgPadThaiChickenFull from '../images/recipes/pad_thai_chicken.webp';
import imgPadThaiChickenThumb from '../images/recipes/pad_thai_chicken-thumb.webp';
import imgPalakDalFull from '../images/recipes/palak_dal.webp';
import imgPalakDalThumb from '../images/recipes/palak_dal-thumb.webp';
import imgPalakPaneerLightFull from '../images/recipes/palak_paneer_light.webp';
import imgPalakPaneerLightThumb from '../images/recipes/palak_paneer_light-thumb.webp';
import imgPaneerTikkaBitesFull from '../images/recipes/paneer_tikka_bites.webp';
import imgPaneerTikkaBitesThumb from '../images/recipes/paneer_tikka_bites-thumb.webp';
import imgPaneerTikkaWrapFull from '../images/recipes/paneer_tikka_wrap.webp';
import imgPaneerTikkaWrapThumb from '../images/recipes/paneer_tikka_wrap-thumb.webp';
import imgPbBananaSoyOatsFull from '../images/recipes/pb_banana_soy_oats.webp';
import imgPbBananaSoyOatsThumb from '../images/recipes/pb_banana_soy_oats-thumb.webp';
import imgPescadoVeracruzanaFull from '../images/recipes/pescado_veracruzana.webp';
import imgPescadoVeracruzanaThumb from '../images/recipes/pescado_veracruzana-thumb.webp';
import imgPhoFull from '../images/recipes/pho.webp';
import imgPhoThumb from '../images/recipes/pho-thumb.webp';
import imgPicadinhoFull from '../images/recipes/picadinho.webp';
import imgPicadinhoThumb from '../images/recipes/picadinho-thumb.webp';
import imgPolloAlAjilloFull from '../images/recipes/pollo_al_ajillo.webp';
import imgPolloAlAjilloThumb from '../images/recipes/pollo_al_ajillo-thumb.webp';
import imgPouletProvencalFull from '../images/recipes/poulet_provencal.webp';
import imgPouletProvencalThumb from '../images/recipes/poulet_provencal-thumb.webp';
import imgPratoFeitoFull from '../images/recipes/prato_feito.webp';
import imgPratoFeitoThumb from '../images/recipes/prato_feito-thumb.webp';
import imgProteinEnergyBallsFull from '../images/recipes/protein_energy_balls.webp';
import imgProteinEnergyBallsThumb from '../images/recipes/protein_energy_balls-thumb.webp';
import imgProteinPancakesFull from '../images/recipes/protein_pancakes.webp';
import imgProteinPancakesThumb from '../images/recipes/protein_pancakes-thumb.webp';
import imgQuarkBerriesFull from '../images/recipes/quark_berries.webp';
import imgQuarkBerriesThumb from '../images/recipes/quark_berries-thumb.webp';
import imgQuarkBircherFull from '../images/recipes/quark_bircher.webp';
import imgQuarkBircherThumb from '../images/recipes/quark_bircher-thumb.webp';
import imgQuinoaBreakfastPorridgeFull from '../images/recipes/quinoa_breakfast_porridge.webp';
import imgQuinoaBreakfastPorridgeThumb from '../images/recipes/quinoa_breakfast_porridge-thumb.webp';
import imgQuinoaFetaSaladFull from '../images/recipes/quinoa_feta_salad.webp';
import imgQuinoaFetaSaladThumb from '../images/recipes/quinoa_feta_salad-thumb.webp';
import imgQuinoaPanFull from '../images/recipes/quinoa_pan.webp';
import imgQuinoaPanThumb from '../images/recipes/quinoa_pan-thumb.webp';
import imgRajmaFull from '../images/recipes/rajma.webp';
import imgRajmaThumb from '../images/recipes/rajma-thumb.webp';
import imgRatatouilleWhiteBeansFull from '../images/recipes/ratatouille_white_beans.webp';
import imgRatatouilleWhiteBeansThumb from '../images/recipes/ratatouille_white_beans-thumb.webp';
import imgRicottaBerryToastFull from '../images/recipes/ricotta_berry_toast.webp';
import imgRicottaBerryToastThumb from '../images/recipes/ricotta_berry_toast-thumb.webp';
import imgRoastedChickpeasFull from '../images/recipes/roasted_chickpeas.webp';
import imgRoastedChickpeasThumb from '../images/recipes/roasted_chickpeas-thumb.webp';
import imgRostiFriedEggFull from '../images/recipes/rosti_fried_egg.webp';
import imgRostiFriedEggThumb from '../images/recipes/rosti_fried_egg-thumb.webp';
import imgSabaShioyakiFull from '../images/recipes/saba_shioyaki.webp';
import imgSabaShioyakiThumb from '../images/recipes/saba_shioyaki-thumb.webp';
import imgSalmonCucumberBitesFull from '../images/recipes/salmon_cucumber_bites.webp';
import imgSalmonCucumberBitesThumb from '../images/recipes/salmon_cucumber_bites-thumb.webp';
import imgSalmonPokeFull from '../images/recipes/salmon_poke.webp';
import imgSalmonPokeThumb from '../images/recipes/salmon_poke-thumb.webp';
import imgSalmonPuyLentilsFull from '../images/recipes/salmon_puy_lentils.webp';
import imgSalmonPuyLentilsThumb from '../images/recipes/salmon_puy_lentils-thumb.webp';
import imgSalpicaoFrangoFull from '../images/recipes/salpicao_frango.webp';
import imgSalpicaoFrangoThumb from '../images/recipes/salpicao_frango-thumb.webp';
import imgScrambledEggsFull from '../images/recipes/scrambled_eggs.webp';
import imgScrambledEggsThumb from '../images/recipes/scrambled_eggs-thumb.webp';
import imgSeafoodPaellaFull from '../images/recipes/seafood_paella.webp';
import imgSeafoodPaellaThumb from '../images/recipes/seafood_paella-thumb.webp';
import imgSesameTofuBitesFull from '../images/recipes/sesame_tofu_bites.webp';
import imgSesameTofuBitesThumb from '../images/recipes/sesame_tofu_bites-thumb.webp';
import imgShakshukaFull from '../images/recipes/shakshuka.webp';
import imgShakshukaThumb from '../images/recipes/shakshuka-thumb.webp';
import imgShrimpCocktailFull from '../images/recipes/shrimp_cocktail.webp';
import imgShrimpCocktailThumb from '../images/recipes/shrimp_cocktail-thumb.webp';
import imgShrimpGarlicPastaFull from '../images/recipes/shrimp_garlic_pasta.webp';
import imgShrimpGarlicPastaThumb from '../images/recipes/shrimp_garlic_pasta-thumb.webp';
import imgShrimpSaganakiFull from '../images/recipes/shrimp_saganaki.webp';
import imgShrimpSaganakiThumb from '../images/recipes/shrimp_saganaki-thumb.webp';
import imgShrimpTacosFull from '../images/recipes/shrimp_tacos.webp';
import imgShrimpTacosThumb from '../images/recipes/shrimp_tacos-thumb.webp';
import imgSilkenChocolateMousseFull from '../images/recipes/silken_chocolate_mousse.webp';
import imgSilkenChocolateMousseThumb from '../images/recipes/silken_chocolate_mousse-thumb.webp';
import imgSilkenTofuSmoothieFull from '../images/recipes/silken_tofu_smoothie.webp';
import imgSilkenTofuSmoothieThumb from '../images/recipes/silken_tofu_smoothie-thumb.webp';
import imgSkagenToastFull from '../images/recipes/skagen_toast.webp';
import imgSkagenToastThumb from '../images/recipes/skagen_toast-thumb.webp';
import imgSkyrAppleCompoteFull from '../images/recipes/skyr_apple_compote.webp';
import imgSkyrAppleCompoteThumb from '../images/recipes/skyr_apple_compote-thumb.webp';
import imgSkyrBerryBarkFull from '../images/recipes/skyr_berry_bark.webp';
import imgSkyrBerryBarkThumb from '../images/recipes/skyr_berry_bark-thumb.webp';
import imgSkyrBerryBowlFull from '../images/recipes/skyr_berry_bowl.webp';
import imgSkyrBerryBowlThumb from '../images/recipes/skyr_berry_bowl-thumb.webp';
import imgSkyrHerbDipFull from '../images/recipes/skyr_herb_dip.webp';
import imgSkyrHerbDipThumb from '../images/recipes/skyr_herb_dip-thumb.webp';
import imgSmokedSalmonBreadFull from '../images/recipes/smoked_salmon_bread.webp';
import imgSmokedSalmonBreadThumb from '../images/recipes/smoked_salmon_bread-thumb.webp';
import imgSoyChiaPuddingFull from '../images/recipes/soy_chia_pudding.webp';
import imgSoyChiaPuddingThumb from '../images/recipes/soy_chia_pudding-thumb.webp';
import imgSpinachEggWrapFull from '../images/recipes/spinach_egg_wrap.webp';
import imgSpinachEggWrapThumb from '../images/recipes/spinach_egg_wrap-thumb.webp';
import imgSpinachFetaOmeletteFull from '../images/recipes/spinach_feta_omelette.webp';
import imgSpinachFetaOmeletteThumb from '../images/recipes/spinach_feta_omelette-thumb.webp';
import imgSteamedFishGingerFull from '../images/recipes/steamed_fish_ginger.webp';
import imgSteamedFishGingerThumb from '../images/recipes/steamed_fish_ginger-thumb.webp';
import imgStuffedPeppersTurkeyFull from '../images/recipes/stuffed_peppers_turkey.webp';
import imgStuffedPeppersTurkeyThumb from '../images/recipes/stuffed_peppers_turkey-thumb.webp';
import imgStuffedSweetPotatoFull from '../images/recipes/stuffed_sweet_potato.webp';
import imgStuffedSweetPotatoThumb from '../images/recipes/stuffed_sweet_potato-thumb.webp';
import imgSummerRollsFull from '../images/recipes/summer_rolls.webp';
import imgSummerRollsThumb from '../images/recipes/summer_rolls-thumb.webp';
import imgSundubuJjigaeFull from '../images/recipes/sundubu_jjigae.webp';
import imgSundubuJjigaeThumb from '../images/recipes/sundubu_jjigae-thumb.webp';
import imgSwissCottageRadishBreadFull from '../images/recipes/swiss_cottage_radish_bread.webp';
import imgSwissCottageRadishBreadThumb from '../images/recipes/swiss_cottage_radish_bread-thumb.webp';
import imgTamagoyakiEdamameFull from '../images/recipes/tamagoyaki_edamame.webp';
import imgTamagoyakiEdamameThumb from '../images/recipes/tamagoyaki_edamame-thumb.webp';
import imgTandooriChickenSaladFull from '../images/recipes/tandoori_chicken_salad.webp';
import imgTandooriChickenSaladThumb from '../images/recipes/tandoori_chicken_salad-thumb.webp';
import imgTapiocaEggCheeseFull from '../images/recipes/tapioca_egg_cheese.webp';
import imgTapiocaEggCheeseThumb from '../images/recipes/tapioca_egg_cheese-thumb.webp';
import imgTempehStirfryFull from '../images/recipes/tempeh_stirfry.webp';
import imgTempehStirfryThumb from '../images/recipes/tempeh_stirfry-thumb.webp';
import imgTeriyakiTofuFull from '../images/recipes/teriyaki_tofu.webp';
import imgTeriyakiTofuThumb from '../images/recipes/teriyaki_tofu-thumb.webp';
import imgThaiCurryFull from '../images/recipes/thai_curry.webp';
import imgThaiCurryThumb from '../images/recipes/thai_curry-thumb.webp';
import imgTikkaMasalaLightFull from '../images/recipes/tikka_masala_light.webp';
import imgTikkaMasalaLightThumb from '../images/recipes/tikka_masala_light-thumb.webp';
import imgTofuPokeFull from '../images/recipes/tofu_poke.webp';
import imgTofuPokeThumb from '../images/recipes/tofu_poke-thumb.webp';
import imgTofuScrambleFull from '../images/recipes/tofu_scramble.webp';
import imgTofuScrambleThumb from '../images/recipes/tofu_scramble-thumb.webp';
import imgTomYumShrimpFull from '../images/recipes/tom_yum_shrimp.webp';
import imgTomYumShrimpThumb from '../images/recipes/tom_yum_shrimp-thumb.webp';
import imgTonnoFagioliFull from '../images/recipes/tonno_fagioli.webp';
import imgTonnoFagioliThumb from '../images/recipes/tonno_fagioli-thumb.webp';
import imgTroutPotatoSaladFull from '../images/recipes/trout_potato_salad.webp';
import imgTroutPotatoSaladThumb from '../images/recipes/trout_potato_salad-thumb.webp';
import imgTunaAvocadoFull from '../images/recipes/tuna_avocado.webp';
import imgTunaAvocadoThumb from '../images/recipes/tuna_avocado-thumb.webp';
import imgTunaNicoiseFull from '../images/recipes/tuna_nicoise.webp';
import imgTunaNicoiseThumb from '../images/recipes/tuna_nicoise-thumb.webp';
import imgTunaOnigiriFull from '../images/recipes/tuna_onigiri.webp';
import imgTunaOnigiriThumb from '../images/recipes/tuna_onigiri-thumb.webp';
import imgTunaPastaSaladFull from '../images/recipes/tuna_pasta_salad.webp';
import imgTunaPastaSaladThumb from '../images/recipes/tuna_pasta_salad-thumb.webp';
import imgTunaRiceCakesFull from '../images/recipes/tuna_rice_cakes.webp';
import imgTunaRiceCakesThumb from '../images/recipes/tuna_rice_cakes-thumb.webp';
import imgTurkeyBologneseFull from '../images/recipes/turkey_bolognese.webp';
import imgTurkeyBologneseThumb from '../images/recipes/turkey_bolognese-thumb.webp';
import imgTurkeyMeatballsFull from '../images/recipes/turkey_meatballs.webp';
import imgTurkeyMeatballsThumb from '../images/recipes/turkey_meatballs-thumb.webp';
import imgTurkeyRollupsFull from '../images/recipes/turkey_rollups.webp';
import imgTurkeyRollupsThumb from '../images/recipes/turkey_rollups-thumb.webp';
import imgTurkeyVeggieWrapFull from '../images/recipes/turkey_veggie_wrap.webp';
import imgTurkeyVeggieWrapThumb from '../images/recipes/turkey_veggie_wrap-thumb.webp';
import imgTzatzikiPitaFull from '../images/recipes/tzatziki_pita.webp';
import imgTzatzikiPitaThumb from '../images/recipes/tzatziki_pita-thumb.webp';
import imgVeggieEggMuffinsFull from '../images/recipes/veggie_egg_muffins.webp';
import imgVeggieEggMuffinsThumb from '../images/recipes/veggie_egg_muffins-thumb.webp';
import imgVeggieOmeletteFull from '../images/recipes/veggie_omelette.webp';
import imgVeggieOmeletteThumb from '../images/recipes/veggie_omelette-thumb.webp';
import imgVitaminaBananaFull from '../images/recipes/vitamina_banana.webp';
import imgVitaminaBananaThumb from '../images/recipes/vitamina_banana-thumb.webp';
import imgWhitefishPotatoesFull from '../images/recipes/whitefish_potatoes.webp';
import imgWhitefishPotatoesThumb from '../images/recipes/whitefish_potatoes-thumb.webp';
import imgYogurtBowlFull from '../images/recipes/yogurt_bowl.webp';
import imgYogurtBowlThumb from '../images/recipes/yogurt_bowl-thumb.webp';
import imgYumNuaFull from '../images/recipes/yum_nua.webp';
import imgYumNuaThumb from '../images/recipes/yum_nua-thumb.webp';
import imgZurichGeschnetzeltesFull from '../images/recipes/zurich_geschnetzeltes.webp';
import imgZurichGeschnetzeltesThumb from '../images/recipes/zurich_geschnetzeltes-thumb.webp';

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
    es: recipeAcaiSkyrBowlEs,
    fr: recipeAcaiSkyrBowlFr,
    it: recipeAcaiSkyrBowlIt,
    ja: recipeAcaiSkyrBowlJa,
    pt: recipeAcaiSkyrBowlPt,
  },
  aji_de_gallina_light: {
    de: recipeAjiDeGallinaLightDe,
    en: recipeAjiDeGallinaLightEn,
    es: recipeAjiDeGallinaLightEs,
    fr: recipeAjiDeGallinaLightFr,
    it: recipeAjiDeGallinaLightIt,
    ja: recipeAjiDeGallinaLightJa,
    pt: recipeAjiDeGallinaLightPt,
  },
  alpler_magronen_light: {
    de: recipeAlplerMagronenLightDe,
    en: recipeAlplerMagronenLightEn,
    es: recipeAlplerMagronenLightEs,
    fr: recipeAlplerMagronenLightFr,
    it: recipeAlplerMagronenLightIt,
    ja: recipeAlplerMagronenLightJa,
    pt: recipeAlplerMagronenLightPt,
  },
  apple_skyr_pb_dip: {
    de: recipeAppleSkyrPbDipDe,
    en: recipeAppleSkyrPbDipEn,
    es: recipeAppleSkyrPbDipEs,
    fr: recipeAppleSkyrPbDipFr,
    it: recipeAppleSkyrPbDipIt,
    ja: recipeAppleSkyrPbDipJa,
    pt: recipeAppleSkyrPbDipPt,
  },
  avocado_egg_toast: {
    de: recipeAvocadoEggToastDe,
    en: recipeAvocadoEggToastEn,
    es: recipeAvocadoEggToastEs,
    fr: recipeAvocadoEggToastFr,
    it: recipeAvocadoEggToastIt,
    ja: recipeAvocadoEggToastJa,
    pt: recipeAvocadoEggToastPt,
  },
  bacalhau_grao: {
    de: recipeBacalhauGraoDe,
    en: recipeBacalhauGraoEn,
    es: recipeBacalhauGraoEs,
    fr: recipeBacalhauGraoFr,
    it: recipeBacalhauGraoIt,
    ja: recipeBacalhauGraoJa,
    pt: recipeBacalhauGraoPt,
  },
  baked_cod_tomatoes: {
    de: recipeBakedCodTomatoesDe,
    en: recipeBakedCodTomatoesEn,
    es: recipeBakedCodTomatoesEs,
    fr: recipeBakedCodTomatoesFr,
    it: recipeBakedCodTomatoesIt,
    ja: recipeBakedCodTomatoesJa,
    pt: recipeBakedCodTomatoesPt,
  },
  baked_falafel_bowl: {
    de: recipeBakedFalafelBowlDe,
    en: recipeBakedFalafelBowlEn,
    es: recipeBakedFalafelBowlEs,
    fr: recipeBakedFalafelBowlFr,
    it: recipeBakedFalafelBowlIt,
    ja: recipeBakedFalafelBowlJa,
    pt: recipeBakedFalafelBowlPt,
  },
  baked_feta_chickpeas: {
    de: recipeBakedFetaChickpeasDe,
    en: recipeBakedFetaChickpeasEn,
    es: recipeBakedFetaChickpeasEs,
    fr: recipeBakedFetaChickpeasFr,
    it: recipeBakedFetaChickpeasIt,
    ja: recipeBakedFetaChickpeasJa,
    pt: recipeBakedFetaChickpeasPt,
  },
  banana_protein_shake: {
    de: recipeBananaProteinShakeDe,
    en: recipeBananaProteinShakeEn,
    es: recipeBananaProteinShakeEs,
    fr: recipeBananaProteinShakeFr,
    it: recipeBananaProteinShakeIt,
    ja: recipeBananaProteinShakeJa,
    pt: recipeBananaProteinShakePt,
  },
  banh_mi_bowl: {
    de: recipeBanhMiBowlDe,
    en: recipeBanhMiBowlEn,
    es: recipeBanhMiBowlEs,
    fr: recipeBanhMiBowlFr,
    it: recipeBanhMiBowlIt,
    ja: recipeBanhMiBowlJa,
    pt: recipeBanhMiBowlPt,
  },
  barley_risotto_chicken: {
    de: recipeBarleyRisottoChickenDe,
    en: recipeBarleyRisottoChickenEn,
    es: recipeBarleyRisottoChickenEs,
    fr: recipeBarleyRisottoChickenFr,
    it: recipeBarleyRisottoChickenIt,
    ja: recipeBarleyRisottoChickenJa,
    pt: recipeBarleyRisottoChickenPt,
  },
  beef_broccoli: {
    de: recipeBeefBroccoliDe,
    en: recipeBeefBroccoliEn,
    es: recipeBeefBroccoliEs,
    fr: recipeBeefBroccoliFr,
    it: recipeBeefBroccoliIt,
    ja: recipeBeefBroccoliJa,
    pt: recipeBeefBroccoliPt,
  },
  beef_fajita_bowl: {
    de: recipeBeefFajitaBowlDe,
    en: recipeBeefFajitaBowlEn,
    es: recipeBeefFajitaBowlEs,
    fr: recipeBeefFajitaBowlFr,
    it: recipeBeefFajitaBowlIt,
    ja: recipeBeefFajitaBowlJa,
    pt: recipeBeefFajitaBowlPt,
  },
  beef_kofta_yogurt: {
    de: recipeBeefKoftaYogurtDe,
    en: recipeBeefKoftaYogurtEn,
    es: recipeBeefKoftaYogurtEs,
    fr: recipeBeefKoftaYogurtFr,
    it: recipeBeefKoftaYogurtIt,
    ja: recipeBeefKoftaYogurtJa,
    pt: recipeBeefKoftaYogurtPt,
  },
  beef_steak_vegetables: {
    de: recipeBeefSteakVegetablesDe,
    en: recipeBeefSteakVegetablesEn,
    es: recipeBeefSteakVegetablesEs,
    fr: recipeBeefSteakVegetablesFr,
    it: recipeBeefSteakVegetablesIt,
    ja: recipeBeefSteakVegetablesJa,
    pt: recipeBeefSteakVegetablesPt,
  },
  berry_protein_smoothie: {
    de: recipeBerryProteinSmoothieDe,
    en: recipeBerryProteinSmoothieEn,
    es: recipeBerryProteinSmoothieEs,
    fr: recipeBerryProteinSmoothieFr,
    it: recipeBerryProteinSmoothieIt,
    ja: recipeBerryProteinSmoothieJa,
    pt: recipeBerryProteinSmoothiePt,
  },
  bibimbap: {
    de: recipeBibimbapDe,
    en: recipeBibimbapEn,
    es: recipeBibimbapEs,
    fr: recipeBibimbapFr,
    it: recipeBibimbapIt,
    ja: recipeBibimbapJa,
    pt: recipeBibimbapPt,
  },
  birchermuesli: {
    de: recipeBirchermuesliDe,
    en: recipeBirchermuesliEn,
    es: recipeBirchermuesliEs,
    fr: recipeBirchermuesliFr,
    it: recipeBirchermuesliIt,
    ja: recipeBirchermuesliJa,
    pt: recipeBirchermuesliPt,
  },
  black_bean_soup: {
    de: recipeBlackBeanSoupDe,
    en: recipeBlackBeanSoupEn,
    es: recipeBlackBeanSoupEs,
    fr: recipeBlackBeanSoupFr,
    it: recipeBlackBeanSoupIt,
    ja: recipeBlackBeanSoupJa,
    pt: recipeBlackBeanSoupPt,
  },
  bobo_camarao: {
    de: recipeBoboCamaraoDe,
    en: recipeBoboCamaraoEn,
    es: recipeBoboCamaraoEs,
    fr: recipeBoboCamaraoFr,
    it: recipeBoboCamaraoIt,
    ja: recipeBoboCamaraoJa,
    pt: recipeBoboCamaraoPt,
  },
  breakfast_burrito: {
    de: recipeBreakfastBurritoDe,
    en: recipeBreakfastBurritoEn,
    es: recipeBreakfastBurritoEs,
    fr: recipeBreakfastBurritoFr,
    it: recipeBreakfastBurritoIt,
    ja: recipeBreakfastBurritoJa,
    pt: recipeBreakfastBurritoPt,
  },
  bresaola_rocket_toast: {
    de: recipeBresaolaRocketToastDe,
    en: recipeBresaolaRocketToastEn,
    es: recipeBresaolaRocketToastEs,
    fr: recipeBresaolaRocketToastFr,
    it: recipeBresaolaRocketToastIt,
    ja: recipeBresaolaRocketToastJa,
    pt: recipeBresaolaRocketToastPt,
  },
  bresaola_rolls: {
    de: recipeBresaolaRollsDe,
    en: recipeBresaolaRollsEn,
    es: recipeBresaolaRollsEs,
    fr: recipeBresaolaRollsFr,
    it: recipeBresaolaRollsIt,
    ja: recipeBresaolaRollsJa,
    pt: recipeBresaolaRollsPt,
  },
  buckwheat_galette: {
    de: recipeBuckwheatGaletteDe,
    en: recipeBuckwheatGaletteEn,
    es: recipeBuckwheatGaletteEs,
    fr: recipeBuckwheatGaletteFr,
    it: recipeBuckwheatGaletteIt,
    ja: recipeBuckwheatGaletteJa,
    pt: recipeBuckwheatGalettePt,
  },
  bulgogi: {
    de: recipeBulgogiDe,
    en: recipeBulgogiEn,
    es: recipeBulgogiEs,
    fr: recipeBulgogiFr,
    it: recipeBulgogiIt,
    ja: recipeBulgogiJa,
    pt: recipeBulgogiPt,
  },
  bun_chay_tofu: {
    de: recipeBunChayTofuDe,
    en: recipeBunChayTofuEn,
    es: recipeBunChayTofuEs,
    fr: recipeBunChayTofuFr,
    it: recipeBunChayTofuIt,
    ja: recipeBunChayTofuJa,
    pt: recipeBunChayTofuPt,
  },
  bundner_barley_soup: {
    de: recipeBundnerBarleySoupDe,
    en: recipeBundnerBarleySoupEn,
    es: recipeBundnerBarleySoupEs,
    fr: recipeBundnerBarleySoupFr,
    it: recipeBundnerBarleySoupIt,
    ja: recipeBundnerBarleySoupJa,
    pt: recipeBundnerBarleySoupPt,
  },
  bundnerfleisch_crispbread: {
    de: recipeBundnerfleischCrispbreadDe,
    en: recipeBundnerfleischCrispbreadEn,
    es: recipeBundnerfleischCrispbreadEs,
    fr: recipeBundnerfleischCrispbreadFr,
    it: recipeBundnerfleischCrispbreadIt,
    ja: recipeBundnerfleischCrispbreadJa,
    pt: recipeBundnerfleischCrispbreadPt,
  },
  burrito_bowl: {
    de: recipeBurritoBowlDe,
    en: recipeBurritoBowlEn,
    es: recipeBurritoBowlEs,
    fr: recipeBurritoBowlFr,
    it: recipeBurritoBowlIt,
    ja: recipeBurritoBowlJa,
    pt: recipeBurritoBowlPt,
  },
  ca_kho: {
    de: recipeCaKhoDe,
    en: recipeCaKhoEn,
    es: recipeCaKhoEs,
    fr: recipeCaKhoFr,
    it: recipeCaKhoIt,
    ja: recipeCaKhoJa,
    pt: recipeCaKhoPt,
  },
  caldo_verde_beans: {
    de: recipeCaldoVerdeBeansDe,
    en: recipeCaldoVerdeBeansEn,
    es: recipeCaldoVerdeBeansEs,
    fr: recipeCaldoVerdeBeansFr,
    it: recipeCaldoVerdeBeansIt,
    ja: recipeCaldoVerdeBeansJa,
    pt: recipeCaldoVerdeBeansPt,
  },
  ceviche_sweet_potato: {
    de: recipeCevicheSweetPotatoDe,
    en: recipeCevicheSweetPotatoEn,
    es: recipeCevicheSweetPotatoEs,
    fr: recipeCevicheSweetPotatoFr,
    it: recipeCevicheSweetPotatoIt,
    ja: recipeCevicheSweetPotatoJa,
    pt: recipeCevicheSweetPotatoPt,
  },
  chana_masala: {
    de: recipeChanaMasalaDe,
    en: recipeChanaMasalaEn,
    es: recipeChanaMasalaEs,
    fr: recipeChanaMasalaFr,
    it: recipeChanaMasalaIt,
    ja: recipeChanaMasalaJa,
    pt: recipeChanaMasalaPt,
  },
  chia_skyr_mango: {
    de: recipeChiaSkyrMangoDe,
    en: recipeChiaSkyrMangoEn,
    es: recipeChiaSkyrMangoEs,
    fr: recipeChiaSkyrMangoFr,
    it: recipeChiaSkyrMangoIt,
    ja: recipeChiaSkyrMangoJa,
    pt: recipeChiaSkyrMangoPt,
  },
  chicken_bowl: {
    de: recipeChickenBowlDe,
    en: recipeChickenBowlEn,
    es: recipeChickenBowlEs,
    fr: recipeChickenBowlFr,
    it: recipeChickenBowlIt,
    ja: recipeChickenBowlJa,
    pt: recipeChickenBowlPt,
  },
  chicken_caesar_light: {
    de: recipeChickenCaesarLightDe,
    en: recipeChickenCaesarLightEn,
    es: recipeChickenCaesarLightEs,
    fr: recipeChickenCaesarLightFr,
    it: recipeChickenCaesarLightIt,
    ja: recipeChickenCaesarLightJa,
    pt: recipeChickenCaesarLightPt,
  },
  chicken_caprese_salad: {
    de: recipeChickenCapreseSaladDe,
    en: recipeChickenCapreseSaladEn,
    es: recipeChickenCapreseSaladEs,
    fr: recipeChickenCapreseSaladFr,
    it: recipeChickenCapreseSaladIt,
    ja: recipeChickenCapreseSaladJa,
    pt: recipeChickenCapreseSaladPt,
  },
  chicken_congee: {
    de: recipeChickenCongeeDe,
    en: recipeChickenCongeeEn,
    es: recipeChickenCongeeEs,
    fr: recipeChickenCongeeFr,
    it: recipeChickenCongeeIt,
    ja: recipeChickenCongeeJa,
    pt: recipeChickenCongeePt,
  },
  chicken_fajitas: {
    de: recipeChickenFajitasDe,
    en: recipeChickenFajitasEn,
    es: recipeChickenFajitasEs,
    fr: recipeChickenFajitasFr,
    it: recipeChickenFajitasIt,
    ja: recipeChickenFajitasJa,
    pt: recipeChickenFajitasPt,
  },
  chicken_piccata: {
    de: recipeChickenPiccataDe,
    en: recipeChickenPiccataEn,
    es: recipeChickenPiccataEs,
    fr: recipeChickenPiccataFr,
    it: recipeChickenPiccataIt,
    ja: recipeChickenPiccataJa,
    pt: recipeChickenPiccataPt,
  },
  chicken_satay_skewers: {
    de: recipeChickenSataySkewersDe,
    en: recipeChickenSataySkewersEn,
    es: recipeChickenSataySkewersEs,
    fr: recipeChickenSataySkewersFr,
    it: recipeChickenSataySkewersIt,
    ja: recipeChickenSataySkewersJa,
    pt: recipeChickenSataySkewersPt,
  },
  chicken_shawarma_bowl: {
    de: recipeChickenShawarmaBowlDe,
    en: recipeChickenShawarmaBowlEn,
    es: recipeChickenShawarmaBowlEs,
    fr: recipeChickenShawarmaBowlFr,
    it: recipeChickenShawarmaBowlIt,
    ja: recipeChickenShawarmaBowlJa,
    pt: recipeChickenShawarmaBowlPt,
  },
  chicken_souvlaki: {
    de: recipeChickenSouvlakiDe,
    en: recipeChickenSouvlakiEn,
    es: recipeChickenSouvlakiEs,
    fr: recipeChickenSouvlakiFr,
    it: recipeChickenSouvlakiIt,
    ja: recipeChickenSouvlakiJa,
    pt: recipeChickenSouvlakiPt,
  },
  chicken_sweet_potato_traybake: {
    de: recipeChickenSweetPotatoTraybakeDe,
    en: recipeChickenSweetPotatoTraybakeEn,
    es: recipeChickenSweetPotatoTraybakeEs,
    fr: recipeChickenSweetPotatoTraybakeFr,
    it: recipeChickenSweetPotatoTraybakeIt,
    ja: recipeChickenSweetPotatoTraybakeJa,
    pt: recipeChickenSweetPotatoTraybakePt,
  },
  chicken_tagine: {
    de: recipeChickenTagineDe,
    en: recipeChickenTagineEn,
    es: recipeChickenTagineEs,
    fr: recipeChickenTagineFr,
    it: recipeChickenTagineIt,
    ja: recipeChickenTagineJa,
    pt: recipeChickenTaginePt,
  },
  chicken_tortilla_soup: {
    de: recipeChickenTortillaSoupDe,
    en: recipeChickenTortillaSoupEn,
    es: recipeChickenTortillaSoupEs,
    fr: recipeChickenTortillaSoupFr,
    it: recipeChickenTortillaSoupIt,
    ja: recipeChickenTortillaSoupJa,
    pt: recipeChickenTortillaSoupPt,
  },
  chicken_vegetable_soup: {
    de: recipeChickenVegetableSoupDe,
    en: recipeChickenVegetableSoupEn,
    es: recipeChickenVegetableSoupEs,
    fr: recipeChickenVegetableSoupFr,
    it: recipeChickenVegetableSoupIt,
    ja: recipeChickenVegetableSoupJa,
    pt: recipeChickenVegetableSoupPt,
  },
  chickpea_chaat: {
    de: recipeChickpeaChaatDe,
    en: recipeChickpeaChaatEn,
    es: recipeChickpeaChaatEs,
    fr: recipeChickpeaChaatFr,
    it: recipeChickpeaChaatIt,
    ja: recipeChickpeaChaatJa,
    pt: recipeChickpeaChaatPt,
  },
  chickpea_tuna_salad: {
    de: recipeChickpeaTunaSaladDe,
    en: recipeChickpeaTunaSaladEn,
    es: recipeChickpeaTunaSaladEs,
    fr: recipeChickpeaTunaSaladFr,
    it: recipeChickpeaTunaSaladIt,
    ja: recipeChickpeaTunaSaladJa,
    pt: recipeChickpeaTunaSaladPt,
  },
  chili_con_carne: {
    de: recipeChiliConCarneDe,
    en: recipeChiliConCarneEn,
    es: recipeChiliConCarneEs,
    fr: recipeChiliConCarneFr,
    it: recipeChiliConCarneIt,
    ja: recipeChiliConCarneJa,
    pt: recipeChiliConCarnePt,
  },
  chili_sin_carne: {
    de: recipeChiliSinCarneDe,
    en: recipeChiliSinCarneEn,
    es: recipeChiliSinCarneEs,
    fr: recipeChiliSinCarneFr,
    it: recipeChiliSinCarneIt,
    ja: recipeChiliSinCarneJa,
    pt: recipeChiliSinCarnePt,
  },
  cilbir: {
    de: recipeCilbirDe,
    en: recipeCilbirEn,
    es: recipeCilbirEs,
    fr: recipeCilbirFr,
    it: recipeCilbirIt,
    ja: recipeCilbirJa,
    pt: recipeCilbirPt,
  },
  cocoa_protein_milk: {
    de: recipeCocoaProteinMilkDe,
    en: recipeCocoaProteinMilkEn,
    es: recipeCocoaProteinMilkEs,
    fr: recipeCocoaProteinMilkFr,
    it: recipeCocoaProteinMilkIt,
    ja: recipeCocoaProteinMilkJa,
    pt: recipeCocoaProteinMilkPt,
  },
  cod_dill_mustard: {
    de: recipeCodDillMustardDe,
    en: recipeCodDillMustardEn,
    es: recipeCodDillMustardEs,
    fr: recipeCodDillMustardFr,
    it: recipeCodDillMustardIt,
    ja: recipeCodDillMustardJa,
    pt: recipeCodDillMustardPt,
  },
  cold_soba_tofu: {
    de: recipeColdSobaTofuDe,
    en: recipeColdSobaTofuEn,
    es: recipeColdSobaTofuEs,
    fr: recipeColdSobaTofuFr,
    it: recipeColdSobaTofuIt,
    ja: recipeColdSobaTofuJa,
    pt: recipeColdSobaTofuPt,
  },
  cottage_crispbread: {
    de: recipeCottageCrispbreadDe,
    en: recipeCottageCrispbreadEn,
    es: recipeCottageCrispbreadEs,
    fr: recipeCottageCrispbreadFr,
    it: recipeCottageCrispbreadIt,
    ja: recipeCottageCrispbreadJa,
    pt: recipeCottageCrispbreadPt,
  },
  cottage_pineapple: {
    de: recipeCottagePineappleDe,
    en: recipeCottagePineappleEn,
    es: recipeCottagePineappleEs,
    fr: recipeCottagePineappleFr,
    it: recipeCottagePineappleIt,
    ja: recipeCottagePineappleJa,
    pt: recipeCottagePineapplePt,
  },
  cottage_tomato_toast: {
    de: recipeCottageTomatoToastDe,
    en: recipeCottageTomatoToastEn,
    es: recipeCottageTomatoToastEs,
    fr: recipeCottageTomatoToastFr,
    it: recipeCottageTomatoToastIt,
    ja: recipeCottageTomatoToastJa,
    pt: recipeCottageTomatoToastPt,
  },
  cottage_zucchini_frittata: {
    de: recipeCottageZucchiniFrittataDe,
    en: recipeCottageZucchiniFrittataEn,
    es: recipeCottageZucchiniFrittataEs,
    fr: recipeCottageZucchiniFrittataFr,
    it: recipeCottageZucchiniFrittataIt,
    ja: recipeCottageZucchiniFrittataJa,
    pt: recipeCottageZucchiniFrittataPt,
  },
  couscous_chicken_salad: {
    de: recipeCouscousChickenSaladDe,
    en: recipeCouscousChickenSaladEn,
    es: recipeCouscousChickenSaladEs,
    fr: recipeCouscousChickenSaladFr,
    it: recipeCouscousChickenSaladIt,
    ja: recipeCouscousChickenSaladJa,
    pt: recipeCouscousChickenSaladPt,
  },
  crepioca_chicken: {
    de: recipeCrepiocaChickenDe,
    en: recipeCrepiocaChickenEn,
    es: recipeCrepiocaChickenEs,
    fr: recipeCrepiocaChickenFr,
    it: recipeCrepiocaChickenIt,
    ja: recipeCrepiocaChickenJa,
    pt: recipeCrepiocaChickenPt,
  },
  cuscuz_egg: {
    de: recipeCuscuzEggDe,
    en: recipeCuscuzEggEn,
    es: recipeCuscuzEggEs,
    fr: recipeCuscuzEggFr,
    it: recipeCuscuzEggIt,
    ja: recipeCuscuzEggJa,
    pt: recipeCuscuzEggPt,
  },
  dakgalbi: {
    de: recipeDakgalbiDe,
    en: recipeDakgalbiEn,
    es: recipeDakgalbiEs,
    fr: recipeDakgalbiFr,
    it: recipeDakgalbiIt,
    ja: recipeDakgalbiJa,
    pt: recipeDakgalbiPt,
  },
  deviled_eggs_yogurt: {
    de: recipeDeviledEggsYogurtDe,
    en: recipeDeviledEggsYogurtEn,
    es: recipeDeviledEggsYogurtEs,
    fr: recipeDeviledEggsYogurtFr,
    it: recipeDeviledEggsYogurtIt,
    ja: recipeDeviledEggsYogurtJa,
    pt: recipeDeviledEggsYogurtPt,
  },
  edamame_hummus: {
    de: recipeEdamameHummusDe,
    en: recipeEdamameHummusEn,
    es: recipeEdamameHummusEs,
    fr: recipeEdamameHummusFr,
    it: recipeEdamameHummusIt,
    ja: recipeEdamameHummusJa,
    pt: recipeEdamameHummusPt,
  },
  edamame_quinoa_bowl: {
    de: recipeEdamameQuinoaBowlDe,
    en: recipeEdamameQuinoaBowlEn,
    es: recipeEdamameQuinoaBowlEs,
    fr: recipeEdamameQuinoaBowlFr,
    it: recipeEdamameQuinoaBowlIt,
    ja: recipeEdamameQuinoaBowlJa,
    pt: recipeEdamameQuinoaBowlPt,
  },
  edamame_sea_salt: {
    de: recipeEdamameSeaSaltDe,
    en: recipeEdamameSeaSaltEn,
    es: recipeEdamameSeaSaltEs,
    fr: recipeEdamameSeaSaltFr,
    it: recipeEdamameSeaSaltIt,
    ja: recipeEdamameSeaSaltJa,
    pt: recipeEdamameSeaSaltPt,
  },
  egg_salad_sandwich: {
    de: recipeEggSaladSandwichDe,
    en: recipeEggSaladSandwichEn,
    es: recipeEggSaladSandwichEs,
    fr: recipeEggSaladSandwichFr,
    it: recipeEggSaladSandwichIt,
    ja: recipeEggSaladSandwichJa,
    pt: recipeEggSaladSandwichPt,
  },
  eggs_cucumber: {
    de: recipeEggsCucumberDe,
    en: recipeEggsCucumberEn,
    es: recipeEggsCucumberEs,
    fr: recipeEggsCucumberFr,
    it: recipeEggsCucumberIt,
    ja: recipeEggsCucumberJa,
    pt: recipeEggsCucumberPt,
  },
  espinacas_garbanzos: {
    de: recipeEspinacasGarbanzosDe,
    en: recipeEspinacasGarbanzosEn,
    es: recipeEspinacasGarbanzosEs,
    fr: recipeEspinacasGarbanzosFr,
    it: recipeEspinacasGarbanzosIt,
    ja: recipeEspinacasGarbanzosJa,
    pt: recipeEspinacasGarbanzosPt,
  },
  feijoada_light: {
    de: recipeFeijoadaLightDe,
    en: recipeFeijoadaLightEn,
    es: recipeFeijoadaLightEs,
    fr: recipeFeijoadaLightFr,
    it: recipeFeijoadaLightIt,
    ja: recipeFeijoadaLightJa,
    pt: recipeFeijoadaLightPt,
  },
  frango_piri_piri: {
    de: recipeFrangoPiriPiriDe,
    en: recipeFrangoPiriPiriEn,
    es: recipeFrangoPiriPiriEs,
    fr: recipeFrangoPiriPiriFr,
    it: recipeFrangoPiriPiriIt,
    ja: recipeFrangoPiriPiriJa,
    pt: recipeFrangoPiriPiriPt,
  },
  ga_xao_sa_ot: {
    de: recipeGaXaoSaOtDe,
    en: recipeGaXaoSaOtEn,
    es: recipeGaXaoSaOtEs,
    fr: recipeGaXaoSaOtFr,
    it: recipeGaXaoSaOtIt,
    ja: recipeGaXaoSaOtJa,
    pt: recipeGaXaoSaOtPt,
  },
  gado_gado: {
    de: recipeGadoGadoDe,
    en: recipeGadoGadoEn,
    es: recipeGadoGadoEs,
    fr: recipeGadoGadoFr,
    it: recipeGadoGadoIt,
    ja: recipeGadoGadoJa,
    pt: recipeGadoGadoPt,
  },
  galinhada: {
    de: recipeGalinhadaDe,
    en: recipeGalinhadaEn,
    es: recipeGalinhadaEs,
    fr: recipeGalinhadaFr,
    it: recipeGalinhadaIt,
    ja: recipeGalinhadaJa,
    pt: recipeGalinhadaPt,
  },
  gazpacho_shrimp: {
    de: recipeGazpachoShrimpDe,
    en: recipeGazpachoShrimpEn,
    es: recipeGazpachoShrimpEs,
    fr: recipeGazpachoShrimpFr,
    it: recipeGazpachoShrimpIt,
    ja: recipeGazpachoShrimpJa,
    pt: recipeGazpachoShrimpPt,
  },
  goi_ga: {
    de: recipeGoiGaDe,
    en: recipeGoiGaEn,
    es: recipeGoiGaEs,
    fr: recipeGoiGaFr,
    it: recipeGoiGaIt,
    ja: recipeGoiGaJa,
    pt: recipeGoiGaPt,
  },
  greek_chicken_salad: {
    de: recipeGreekChickenSaladDe,
    en: recipeGreekChickenSaladEn,
    es: recipeGreekChickenSaladEs,
    fr: recipeGreekChickenSaladFr,
    it: recipeGreekChickenSaladIt,
    ja: recipeGreekChickenSaladJa,
    pt: recipeGreekChickenSaladPt,
  },
  greek_yogurt_walnut: {
    de: recipeGreekYogurtWalnutDe,
    en: recipeGreekYogurtWalnutEn,
    es: recipeGreekYogurtWalnutEs,
    fr: recipeGreekYogurtWalnutFr,
    it: recipeGreekYogurtWalnutIt,
    ja: recipeGreekYogurtWalnutJa,
    pt: recipeGreekYogurtWalnutPt,
  },
  green_curry_shrimp: {
    de: recipeGreenCurryShrimpDe,
    en: recipeGreenCurryShrimpEn,
    es: recipeGreenCurryShrimpEs,
    fr: recipeGreenCurryShrimpFr,
    it: recipeGreenCurryShrimpIt,
    ja: recipeGreenCurryShrimpJa,
    pt: recipeGreenCurryShrimpPt,
  },
  green_shakshuka: {
    de: recipeGreenShakshukaDe,
    en: recipeGreenShakshukaEn,
    es: recipeGreenShakshukaEs,
    fr: recipeGreenShakshukaFr,
    it: recipeGreenShakshukaIt,
    ja: recipeGreenShakshukaJa,
    pt: recipeGreenShakshukaPt,
  },
  green_skyr_smoothie: {
    de: recipeGreenSkyrSmoothieDe,
    en: recipeGreenSkyrSmoothieEn,
    es: recipeGreenSkyrSmoothieEs,
    fr: recipeGreenSkyrSmoothieFr,
    it: recipeGreenSkyrSmoothieIt,
    ja: recipeGreenSkyrSmoothieJa,
    pt: recipeGreenSkyrSmoothiePt,
  },
  gyeran_jjim: {
    de: recipeGyeranJjimDe,
    en: recipeGyeranJjimEn,
    es: recipeGyeranJjimEs,
    fr: recipeGyeranJjimFr,
    it: recipeGyeranJjimIt,
    ja: recipeGyeranJjimJa,
    pt: recipeGyeranJjimPt,
  },
  gyudon_light: {
    de: recipeGyudonLightDe,
    en: recipeGyudonLightEn,
    es: recipeGyudonLightEs,
    fr: recipeGyudonLightFr,
    it: recipeGyudonLightIt,
    ja: recipeGyudonLightJa,
    pt: recipeGyudonLightPt,
  },
  halloumi_lentil_salad: {
    de: recipeHalloumiLentilSaladDe,
    en: recipeHalloumiLentilSaladEn,
    es: recipeHalloumiLentilSaladEs,
    fr: recipeHalloumiLentilSaladFr,
    it: recipeHalloumiLentilSaladIt,
    ja: recipeHalloumiLentilSaladJa,
    pt: recipeHalloumiLentilSaladPt,
  },
  harira: {
    de: recipeHariraDe,
    en: recipeHariraEn,
    es: recipeHariraEs,
    fr: recipeHariraFr,
    it: recipeHariraIt,
    ja: recipeHariraJa,
    pt: recipeHariraPt,
  },
  hot_sour_tofu_soup: {
    de: recipeHotSourTofuSoupDe,
    en: recipeHotSourTofuSoupEn,
    es: recipeHotSourTofuSoupEs,
    fr: recipeHotSourTofuSoupFr,
    it: recipeHotSourTofuSoupIt,
    ja: recipeHotSourTofuSoupJa,
    pt: recipeHotSourTofuSoupPt,
  },
  huevos_rancheros: {
    de: recipeHuevosRancherosDe,
    en: recipeHuevosRancherosEn,
    es: recipeHuevosRancherosEs,
    fr: recipeHuevosRancherosFr,
    it: recipeHuevosRancherosIt,
    ja: recipeHuevosRancherosJa,
    pt: recipeHuevosRancherosPt,
  },
  hummus_veggie_sticks: {
    de: recipeHummusVeggieSticksDe,
    en: recipeHummusVeggieSticksEn,
    es: recipeHummusVeggieSticksEs,
    fr: recipeHummusVeggieSticksFr,
    it: recipeHummusVeggieSticksIt,
    ja: recipeHummusVeggieSticksJa,
    pt: recipeHummusVeggieSticksPt,
  },
  hummus_wrap: {
    de: recipeHummusWrapDe,
    en: recipeHummusWrapEn,
    es: recipeHummusWrapEs,
    fr: recipeHummusWrapFr,
    it: recipeHummusWrapIt,
    ja: recipeHummusWrapJa,
    pt: recipeHummusWrapPt,
  },
  japanese_chicken_curry: {
    de: recipeJapaneseChickenCurryDe,
    en: recipeJapaneseChickenCurryEn,
    es: recipeJapaneseChickenCurryEs,
    fr: recipeJapaneseChickenCurryFr,
    it: recipeJapaneseChickenCurryIt,
    ja: recipeJapaneseChickenCurryJa,
    pt: recipeJapaneseChickenCurryPt,
  },
  japanese_salmon_breakfast: {
    de: recipeJapaneseSalmonBreakfastDe,
    en: recipeJapaneseSalmonBreakfastEn,
    es: recipeJapaneseSalmonBreakfastEs,
    fr: recipeJapaneseSalmonBreakfastFr,
    it: recipeJapaneseSalmonBreakfastIt,
    ja: recipeJapaneseSalmonBreakfastJa,
    pt: recipeJapaneseSalmonBreakfastPt,
  },
  kerala_fish_curry: {
    de: recipeKeralaFishCurryDe,
    en: recipeKeralaFishCurryEn,
    es: recipeKeralaFishCurryEs,
    fr: recipeKeralaFishCurryFr,
    it: recipeKeralaFishCurryIt,
    ja: recipeKeralaFishCurryJa,
    pt: recipeKeralaFishCurryPt,
  },
  kimchi_scrambled_eggs: {
    de: recipeKimchiScrambledEggsDe,
    en: recipeKimchiScrambledEggsEn,
    es: recipeKimchiScrambledEggsEs,
    fr: recipeKimchiScrambledEggsFr,
    it: recipeKimchiScrambledEggsIt,
    ja: recipeKimchiScrambledEggsJa,
    pt: recipeKimchiScrambledEggsPt,
  },
  kung_pao_chicken: {
    de: recipeKungPaoChickenDe,
    en: recipeKungPaoChickenEn,
    es: recipeKungPaoChickenEs,
    fr: recipeKungPaoChickenFr,
    it: recipeKungPaoChickenIt,
    ja: recipeKungPaoChickenJa,
    pt: recipeKungPaoChickenPt,
  },
  labneh_zaatar: {
    de: recipeLabnehZaatarDe,
    en: recipeLabnehZaatarEn,
    es: recipeLabnehZaatarEs,
    fr: recipeLabnehZaatarFr,
    it: recipeLabnehZaatarIt,
    ja: recipeLabnehZaatarJa,
    pt: recipeLabnehZaatarPt,
  },
  larb_gai: {
    de: recipeLarbGaiDe,
    en: recipeLarbGaiEn,
    es: recipeLarbGaiEs,
    fr: recipeLarbGaiFr,
    it: recipeLarbGaiIt,
    ja: recipeLarbGaiJa,
    pt: recipeLarbGaiPt,
  },
  lentil_bolognese: {
    de: recipeLentilBologneseDe,
    en: recipeLentilBologneseEn,
    es: recipeLentilBologneseEs,
    fr: recipeLentilBologneseFr,
    it: recipeLentilBologneseIt,
    ja: recipeLentilBologneseJa,
    pt: recipeLentilBolognesePt,
  },
  lentil_curry: {
    de: recipeLentilCurryDe,
    en: recipeLentilCurryEn,
    es: recipeLentilCurryEs,
    fr: recipeLentilCurryFr,
    it: recipeLentilCurryIt,
    ja: recipeLentilCurryJa,
    pt: recipeLentilCurryPt,
  },
  lentil_feta_salad: {
    de: recipeLentilFetaSaladDe,
    en: recipeLentilFetaSaladEn,
    es: recipeLentilFetaSaladEs,
    fr: recipeLentilFetaSaladFr,
    it: recipeLentilFetaSaladIt,
    ja: recipeLentilFetaSaladJa,
    pt: recipeLentilFetaSaladPt,
  },
  lomo_saltado: {
    de: recipeLomoSaltadoDe,
    en: recipeLomoSaltadoEn,
    es: recipeLomoSaltadoEs,
    fr: recipeLomoSaltadoFr,
    it: recipeLomoSaltadoIt,
    ja: recipeLomoSaltadoJa,
    pt: recipeLomoSaltadoPt,
  },
  mapo_tofu: {
    de: recipeMapoTofuDe,
    en: recipeMapoTofuEn,
    es: recipeMapoTofuEs,
    fr: recipeMapoTofuFr,
    it: recipeMapoTofuIt,
    ja: recipeMapoTofuJa,
    pt: recipeMapoTofuPt,
  },
  masala_omelette: {
    de: recipeMasalaOmeletteDe,
    en: recipeMasalaOmeletteEn,
    es: recipeMasalaOmeletteEs,
    fr: recipeMasalaOmeletteFr,
    it: recipeMasalaOmeletteIt,
    ja: recipeMasalaOmeletteJa,
    pt: recipeMasalaOmelettePt,
  },
  menemen: {
    de: recipeMenemenDe,
    en: recipeMenemenEn,
    es: recipeMenemenEs,
    fr: recipeMenemenFr,
    it: recipeMenemenIt,
    ja: recipeMenemenJa,
    pt: recipeMenemenPt,
  },
  minestrone_beans: {
    de: recipeMinestroneBeansDe,
    en: recipeMinestroneBeansEn,
    es: recipeMinestroneBeansEs,
    fr: recipeMinestroneBeansFr,
    it: recipeMinestroneBeansIt,
    ja: recipeMinestroneBeansJa,
    pt: recipeMinestroneBeansPt,
  },
  miso_salmon: {
    de: recipeMisoSalmonDe,
    en: recipeMisoSalmonEn,
    es: recipeMisoSalmonEs,
    fr: recipeMisoSalmonFr,
    it: recipeMisoSalmonIt,
    ja: recipeMisoSalmonJa,
    pt: recipeMisoSalmonPt,
  },
  moong_dal_chilla: {
    de: recipeMoongDalChillaDe,
    en: recipeMoongDalChillaEn,
    es: recipeMoongDalChillaEs,
    fr: recipeMoongDalChillaFr,
    it: recipeMoongDalChillaIt,
    ja: recipeMoongDalChillaJa,
    pt: recipeMoongDalChillaPt,
  },
  moqueca: {
    de: recipeMoquecaDe,
    en: recipeMoquecaEn,
    es: recipeMoquecaEs,
    fr: recipeMoquecaFr,
    it: recipeMoquecaIt,
    ja: recipeMoquecaJa,
    pt: recipeMoquecaPt,
  },
  mozzarella_tomato_skewers: {
    de: recipeMozzarellaTomatoSkewersDe,
    en: recipeMozzarellaTomatoSkewersEn,
    es: recipeMozzarellaTomatoSkewersEs,
    fr: recipeMozzarellaTomatoSkewersFr,
    it: recipeMozzarellaTomatoSkewersIt,
    ja: recipeMozzarellaTomatoSkewersJa,
    pt: recipeMozzarellaTomatoSkewersPt,
  },
  mushroom_polenta: {
    de: recipeMushroomPolentaDe,
    en: recipeMushroomPolentaEn,
    es: recipeMushroomPolentaEs,
    fr: recipeMushroomPolentaFr,
    it: recipeMushroomPolentaIt,
    ja: recipeMushroomPolentaJa,
    pt: recipeMushroomPolentaPt,
  },
  nasi_goreng: {
    de: recipeNasiGorengDe,
    en: recipeNasiGorengEn,
    es: recipeNasiGorengEs,
    fr: recipeNasiGorengFr,
    it: recipeNasiGorengIt,
    ja: recipeNasiGorengJa,
    pt: recipeNasiGorengPt,
  },
  oat_porridge_quark: {
    de: recipeOatPorridgeQuarkDe,
    en: recipeOatPorridgeQuarkEn,
    es: recipeOatPorridgeQuarkEs,
    fr: recipeOatPorridgeQuarkFr,
    it: recipeOatPorridgeQuarkIt,
    ja: recipeOatPorridgeQuarkJa,
    pt: recipeOatPorridgeQuarkPt,
  },
  oven_salmon: {
    de: recipeOvenSalmonDe,
    en: recipeOvenSalmonEn,
    es: recipeOvenSalmonEs,
    fr: recipeOvenSalmonFr,
    it: recipeOvenSalmonIt,
    ja: recipeOvenSalmonJa,
    pt: recipeOvenSalmonPt,
  },
  overnight_oats_quark: {
    de: recipeOvernightOatsQuarkDe,
    en: recipeOvernightOatsQuarkEn,
    es: recipeOvernightOatsQuarkEs,
    fr: recipeOvernightOatsQuarkFr,
    it: recipeOvernightOatsQuarkIt,
    ja: recipeOvernightOatsQuarkJa,
    pt: recipeOvernightOatsQuarkPt,
  },
  oyakodon: {
    de: recipeOyakodonDe,
    en: recipeOyakodonEn,
    es: recipeOyakodonEs,
    fr: recipeOyakodonFr,
    it: recipeOyakodonIt,
    ja: recipeOyakodonJa,
    pt: recipeOyakodonPt,
  },
  pad_kra_pao: {
    de: recipePadKraPaoDe,
    en: recipePadKraPaoEn,
    es: recipePadKraPaoEs,
    fr: recipePadKraPaoFr,
    it: recipePadKraPaoIt,
    ja: recipePadKraPaoJa,
    pt: recipePadKraPaoPt,
  },
  pad_thai_chicken: {
    de: recipePadThaiChickenDe,
    en: recipePadThaiChickenEn,
    es: recipePadThaiChickenEs,
    fr: recipePadThaiChickenFr,
    it: recipePadThaiChickenIt,
    ja: recipePadThaiChickenJa,
    pt: recipePadThaiChickenPt,
  },
  palak_dal: {
    de: recipePalakDalDe,
    en: recipePalakDalEn,
    es: recipePalakDalEs,
    fr: recipePalakDalFr,
    it: recipePalakDalIt,
    ja: recipePalakDalJa,
    pt: recipePalakDalPt,
  },
  palak_paneer_light: {
    de: recipePalakPaneerLightDe,
    en: recipePalakPaneerLightEn,
    es: recipePalakPaneerLightEs,
    fr: recipePalakPaneerLightFr,
    it: recipePalakPaneerLightIt,
    ja: recipePalakPaneerLightJa,
    pt: recipePalakPaneerLightPt,
  },
  paneer_tikka_bites: {
    de: recipePaneerTikkaBitesDe,
    en: recipePaneerTikkaBitesEn,
    es: recipePaneerTikkaBitesEs,
    fr: recipePaneerTikkaBitesFr,
    it: recipePaneerTikkaBitesIt,
    ja: recipePaneerTikkaBitesJa,
    pt: recipePaneerTikkaBitesPt,
  },
  paneer_tikka_wrap: {
    de: recipePaneerTikkaWrapDe,
    en: recipePaneerTikkaWrapEn,
    es: recipePaneerTikkaWrapEs,
    fr: recipePaneerTikkaWrapFr,
    it: recipePaneerTikkaWrapIt,
    ja: recipePaneerTikkaWrapJa,
    pt: recipePaneerTikkaWrapPt,
  },
  pb_banana_soy_oats: {
    de: recipePbBananaSoyOatsDe,
    en: recipePbBananaSoyOatsEn,
    es: recipePbBananaSoyOatsEs,
    fr: recipePbBananaSoyOatsFr,
    it: recipePbBananaSoyOatsIt,
    ja: recipePbBananaSoyOatsJa,
    pt: recipePbBananaSoyOatsPt,
  },
  pescado_veracruzana: {
    de: recipePescadoVeracruzanaDe,
    en: recipePescadoVeracruzanaEn,
    es: recipePescadoVeracruzanaEs,
    fr: recipePescadoVeracruzanaFr,
    it: recipePescadoVeracruzanaIt,
    ja: recipePescadoVeracruzanaJa,
    pt: recipePescadoVeracruzanaPt,
  },
  pho: {
    de: recipePhoDe,
    en: recipePhoEn,
    es: recipePhoEs,
    fr: recipePhoFr,
    it: recipePhoIt,
    ja: recipePhoJa,
    pt: recipePhoPt,
  },
  picadinho: {
    de: recipePicadinhoDe,
    en: recipePicadinhoEn,
    es: recipePicadinhoEs,
    fr: recipePicadinhoFr,
    it: recipePicadinhoIt,
    ja: recipePicadinhoJa,
    pt: recipePicadinhoPt,
  },
  pollo_al_ajillo: {
    de: recipePolloAlAjilloDe,
    en: recipePolloAlAjilloEn,
    es: recipePolloAlAjilloEs,
    fr: recipePolloAlAjilloFr,
    it: recipePolloAlAjilloIt,
    ja: recipePolloAlAjilloJa,
    pt: recipePolloAlAjilloPt,
  },
  poulet_provencal: {
    de: recipePouletProvencalDe,
    en: recipePouletProvencalEn,
    es: recipePouletProvencalEs,
    fr: recipePouletProvencalFr,
    it: recipePouletProvencalIt,
    ja: recipePouletProvencalJa,
    pt: recipePouletProvencalPt,
  },
  prato_feito: {
    de: recipePratoFeitoDe,
    en: recipePratoFeitoEn,
    es: recipePratoFeitoEs,
    fr: recipePratoFeitoFr,
    it: recipePratoFeitoIt,
    ja: recipePratoFeitoJa,
    pt: recipePratoFeitoPt,
  },
  protein_energy_balls: {
    de: recipeProteinEnergyBallsDe,
    en: recipeProteinEnergyBallsEn,
    es: recipeProteinEnergyBallsEs,
    fr: recipeProteinEnergyBallsFr,
    it: recipeProteinEnergyBallsIt,
    ja: recipeProteinEnergyBallsJa,
    pt: recipeProteinEnergyBallsPt,
  },
  protein_pancakes: {
    de: recipeProteinPancakesDe,
    en: recipeProteinPancakesEn,
    es: recipeProteinPancakesEs,
    fr: recipeProteinPancakesFr,
    it: recipeProteinPancakesIt,
    ja: recipeProteinPancakesJa,
    pt: recipeProteinPancakesPt,
  },
  quark_berries: {
    de: recipeQuarkBerriesDe,
    en: recipeQuarkBerriesEn,
    es: recipeQuarkBerriesEs,
    fr: recipeQuarkBerriesFr,
    it: recipeQuarkBerriesIt,
    ja: recipeQuarkBerriesJa,
    pt: recipeQuarkBerriesPt,
  },
  quark_bircher: {
    de: recipeQuarkBircherDe,
    en: recipeQuarkBircherEn,
    es: recipeQuarkBircherEs,
    fr: recipeQuarkBircherFr,
    it: recipeQuarkBircherIt,
    ja: recipeQuarkBircherJa,
    pt: recipeQuarkBircherPt,
  },
  quinoa_breakfast_porridge: {
    de: recipeQuinoaBreakfastPorridgeDe,
    en: recipeQuinoaBreakfastPorridgeEn,
    es: recipeQuinoaBreakfastPorridgeEs,
    fr: recipeQuinoaBreakfastPorridgeFr,
    it: recipeQuinoaBreakfastPorridgeIt,
    ja: recipeQuinoaBreakfastPorridgeJa,
    pt: recipeQuinoaBreakfastPorridgePt,
  },
  quinoa_feta_salad: {
    de: recipeQuinoaFetaSaladDe,
    en: recipeQuinoaFetaSaladEn,
    es: recipeQuinoaFetaSaladEs,
    fr: recipeQuinoaFetaSaladFr,
    it: recipeQuinoaFetaSaladIt,
    ja: recipeQuinoaFetaSaladJa,
    pt: recipeQuinoaFetaSaladPt,
  },
  quinoa_pan: {
    de: recipeQuinoaPanDe,
    en: recipeQuinoaPanEn,
    es: recipeQuinoaPanEs,
    fr: recipeQuinoaPanFr,
    it: recipeQuinoaPanIt,
    ja: recipeQuinoaPanJa,
    pt: recipeQuinoaPanPt,
  },
  rajma: {
    de: recipeRajmaDe,
    en: recipeRajmaEn,
    es: recipeRajmaEs,
    fr: recipeRajmaFr,
    it: recipeRajmaIt,
    ja: recipeRajmaJa,
    pt: recipeRajmaPt,
  },
  ratatouille_white_beans: {
    de: recipeRatatouilleWhiteBeansDe,
    en: recipeRatatouilleWhiteBeansEn,
    es: recipeRatatouilleWhiteBeansEs,
    fr: recipeRatatouilleWhiteBeansFr,
    it: recipeRatatouilleWhiteBeansIt,
    ja: recipeRatatouilleWhiteBeansJa,
    pt: recipeRatatouilleWhiteBeansPt,
  },
  ricotta_berry_toast: {
    de: recipeRicottaBerryToastDe,
    en: recipeRicottaBerryToastEn,
    es: recipeRicottaBerryToastEs,
    fr: recipeRicottaBerryToastFr,
    it: recipeRicottaBerryToastIt,
    ja: recipeRicottaBerryToastJa,
    pt: recipeRicottaBerryToastPt,
  },
  roasted_chickpeas: {
    de: recipeRoastedChickpeasDe,
    en: recipeRoastedChickpeasEn,
    es: recipeRoastedChickpeasEs,
    fr: recipeRoastedChickpeasFr,
    it: recipeRoastedChickpeasIt,
    ja: recipeRoastedChickpeasJa,
    pt: recipeRoastedChickpeasPt,
  },
  rosti_fried_egg: {
    de: recipeRostiFriedEggDe,
    en: recipeRostiFriedEggEn,
    es: recipeRostiFriedEggEs,
    fr: recipeRostiFriedEggFr,
    it: recipeRostiFriedEggIt,
    ja: recipeRostiFriedEggJa,
    pt: recipeRostiFriedEggPt,
  },
  saba_shioyaki: {
    de: recipeSabaShioyakiDe,
    en: recipeSabaShioyakiEn,
    es: recipeSabaShioyakiEs,
    fr: recipeSabaShioyakiFr,
    it: recipeSabaShioyakiIt,
    ja: recipeSabaShioyakiJa,
    pt: recipeSabaShioyakiPt,
  },
  salmon_cucumber_bites: {
    de: recipeSalmonCucumberBitesDe,
    en: recipeSalmonCucumberBitesEn,
    es: recipeSalmonCucumberBitesEs,
    fr: recipeSalmonCucumberBitesFr,
    it: recipeSalmonCucumberBitesIt,
    ja: recipeSalmonCucumberBitesJa,
    pt: recipeSalmonCucumberBitesPt,
  },
  salmon_poke: {
    de: recipeSalmonPokeDe,
    en: recipeSalmonPokeEn,
    es: recipeSalmonPokeEs,
    fr: recipeSalmonPokeFr,
    it: recipeSalmonPokeIt,
    ja: recipeSalmonPokeJa,
    pt: recipeSalmonPokePt,
  },
  salmon_puy_lentils: {
    de: recipeSalmonPuyLentilsDe,
    en: recipeSalmonPuyLentilsEn,
    es: recipeSalmonPuyLentilsEs,
    fr: recipeSalmonPuyLentilsFr,
    it: recipeSalmonPuyLentilsIt,
    ja: recipeSalmonPuyLentilsJa,
    pt: recipeSalmonPuyLentilsPt,
  },
  salpicao_frango: {
    de: recipeSalpicaoFrangoDe,
    en: recipeSalpicaoFrangoEn,
    es: recipeSalpicaoFrangoEs,
    fr: recipeSalpicaoFrangoFr,
    it: recipeSalpicaoFrangoIt,
    ja: recipeSalpicaoFrangoJa,
    pt: recipeSalpicaoFrangoPt,
  },
  scrambled_eggs: {
    de: recipeScrambledEggsDe,
    en: recipeScrambledEggsEn,
    es: recipeScrambledEggsEs,
    fr: recipeScrambledEggsFr,
    it: recipeScrambledEggsIt,
    ja: recipeScrambledEggsJa,
    pt: recipeScrambledEggsPt,
  },
  seafood_paella: {
    de: recipeSeafoodPaellaDe,
    en: recipeSeafoodPaellaEn,
    es: recipeSeafoodPaellaEs,
    fr: recipeSeafoodPaellaFr,
    it: recipeSeafoodPaellaIt,
    ja: recipeSeafoodPaellaJa,
    pt: recipeSeafoodPaellaPt,
  },
  sesame_tofu_bites: {
    de: recipeSesameTofuBitesDe,
    en: recipeSesameTofuBitesEn,
    es: recipeSesameTofuBitesEs,
    fr: recipeSesameTofuBitesFr,
    it: recipeSesameTofuBitesIt,
    ja: recipeSesameTofuBitesJa,
    pt: recipeSesameTofuBitesPt,
  },
  shakshuka: {
    de: recipeShakshukaDe,
    en: recipeShakshukaEn,
    es: recipeShakshukaEs,
    fr: recipeShakshukaFr,
    it: recipeShakshukaIt,
    ja: recipeShakshukaJa,
    pt: recipeShakshukaPt,
  },
  shrimp_cocktail: {
    de: recipeShrimpCocktailDe,
    en: recipeShrimpCocktailEn,
    es: recipeShrimpCocktailEs,
    fr: recipeShrimpCocktailFr,
    it: recipeShrimpCocktailIt,
    ja: recipeShrimpCocktailJa,
    pt: recipeShrimpCocktailPt,
  },
  shrimp_garlic_pasta: {
    de: recipeShrimpGarlicPastaDe,
    en: recipeShrimpGarlicPastaEn,
    es: recipeShrimpGarlicPastaEs,
    fr: recipeShrimpGarlicPastaFr,
    it: recipeShrimpGarlicPastaIt,
    ja: recipeShrimpGarlicPastaJa,
    pt: recipeShrimpGarlicPastaPt,
  },
  shrimp_saganaki: {
    de: recipeShrimpSaganakiDe,
    en: recipeShrimpSaganakiEn,
    es: recipeShrimpSaganakiEs,
    fr: recipeShrimpSaganakiFr,
    it: recipeShrimpSaganakiIt,
    ja: recipeShrimpSaganakiJa,
    pt: recipeShrimpSaganakiPt,
  },
  shrimp_tacos: {
    de: recipeShrimpTacosDe,
    en: recipeShrimpTacosEn,
    es: recipeShrimpTacosEs,
    fr: recipeShrimpTacosFr,
    it: recipeShrimpTacosIt,
    ja: recipeShrimpTacosJa,
    pt: recipeShrimpTacosPt,
  },
  silken_chocolate_mousse: {
    de: recipeSilkenChocolateMousseDe,
    en: recipeSilkenChocolateMousseEn,
    es: recipeSilkenChocolateMousseEs,
    fr: recipeSilkenChocolateMousseFr,
    it: recipeSilkenChocolateMousseIt,
    ja: recipeSilkenChocolateMousseJa,
    pt: recipeSilkenChocolateMoussePt,
  },
  silken_tofu_smoothie: {
    de: recipeSilkenTofuSmoothieDe,
    en: recipeSilkenTofuSmoothieEn,
    es: recipeSilkenTofuSmoothieEs,
    fr: recipeSilkenTofuSmoothieFr,
    it: recipeSilkenTofuSmoothieIt,
    ja: recipeSilkenTofuSmoothieJa,
    pt: recipeSilkenTofuSmoothiePt,
  },
  skagen_toast: {
    de: recipeSkagenToastDe,
    en: recipeSkagenToastEn,
    es: recipeSkagenToastEs,
    fr: recipeSkagenToastFr,
    it: recipeSkagenToastIt,
    ja: recipeSkagenToastJa,
    pt: recipeSkagenToastPt,
  },
  skyr_apple_compote: {
    de: recipeSkyrAppleCompoteDe,
    en: recipeSkyrAppleCompoteEn,
    es: recipeSkyrAppleCompoteEs,
    fr: recipeSkyrAppleCompoteFr,
    it: recipeSkyrAppleCompoteIt,
    ja: recipeSkyrAppleCompoteJa,
    pt: recipeSkyrAppleCompotePt,
  },
  skyr_berry_bark: {
    de: recipeSkyrBerryBarkDe,
    en: recipeSkyrBerryBarkEn,
    es: recipeSkyrBerryBarkEs,
    fr: recipeSkyrBerryBarkFr,
    it: recipeSkyrBerryBarkIt,
    ja: recipeSkyrBerryBarkJa,
    pt: recipeSkyrBerryBarkPt,
  },
  skyr_berry_bowl: {
    de: recipeSkyrBerryBowlDe,
    en: recipeSkyrBerryBowlEn,
    es: recipeSkyrBerryBowlEs,
    fr: recipeSkyrBerryBowlFr,
    it: recipeSkyrBerryBowlIt,
    ja: recipeSkyrBerryBowlJa,
    pt: recipeSkyrBerryBowlPt,
  },
  skyr_herb_dip: {
    de: recipeSkyrHerbDipDe,
    en: recipeSkyrHerbDipEn,
    es: recipeSkyrHerbDipEs,
    fr: recipeSkyrHerbDipFr,
    it: recipeSkyrHerbDipIt,
    ja: recipeSkyrHerbDipJa,
    pt: recipeSkyrHerbDipPt,
  },
  smoked_salmon_bread: {
    de: recipeSmokedSalmonBreadDe,
    en: recipeSmokedSalmonBreadEn,
    es: recipeSmokedSalmonBreadEs,
    fr: recipeSmokedSalmonBreadFr,
    it: recipeSmokedSalmonBreadIt,
    ja: recipeSmokedSalmonBreadJa,
    pt: recipeSmokedSalmonBreadPt,
  },
  soy_chia_pudding: {
    de: recipeSoyChiaPuddingDe,
    en: recipeSoyChiaPuddingEn,
    es: recipeSoyChiaPuddingEs,
    fr: recipeSoyChiaPuddingFr,
    it: recipeSoyChiaPuddingIt,
    ja: recipeSoyChiaPuddingJa,
    pt: recipeSoyChiaPuddingPt,
  },
  spinach_egg_wrap: {
    de: recipeSpinachEggWrapDe,
    en: recipeSpinachEggWrapEn,
    es: recipeSpinachEggWrapEs,
    fr: recipeSpinachEggWrapFr,
    it: recipeSpinachEggWrapIt,
    ja: recipeSpinachEggWrapJa,
    pt: recipeSpinachEggWrapPt,
  },
  spinach_feta_omelette: {
    de: recipeSpinachFetaOmeletteDe,
    en: recipeSpinachFetaOmeletteEn,
    es: recipeSpinachFetaOmeletteEs,
    fr: recipeSpinachFetaOmeletteFr,
    it: recipeSpinachFetaOmeletteIt,
    ja: recipeSpinachFetaOmeletteJa,
    pt: recipeSpinachFetaOmelettePt,
  },
  steamed_fish_ginger: {
    de: recipeSteamedFishGingerDe,
    en: recipeSteamedFishGingerEn,
    es: recipeSteamedFishGingerEs,
    fr: recipeSteamedFishGingerFr,
    it: recipeSteamedFishGingerIt,
    ja: recipeSteamedFishGingerJa,
    pt: recipeSteamedFishGingerPt,
  },
  stuffed_peppers_turkey: {
    de: recipeStuffedPeppersTurkeyDe,
    en: recipeStuffedPeppersTurkeyEn,
    es: recipeStuffedPeppersTurkeyEs,
    fr: recipeStuffedPeppersTurkeyFr,
    it: recipeStuffedPeppersTurkeyIt,
    ja: recipeStuffedPeppersTurkeyJa,
    pt: recipeStuffedPeppersTurkeyPt,
  },
  stuffed_sweet_potato: {
    de: recipeStuffedSweetPotatoDe,
    en: recipeStuffedSweetPotatoEn,
    es: recipeStuffedSweetPotatoEs,
    fr: recipeStuffedSweetPotatoFr,
    it: recipeStuffedSweetPotatoIt,
    ja: recipeStuffedSweetPotatoJa,
    pt: recipeStuffedSweetPotatoPt,
  },
  summer_rolls: {
    de: recipeSummerRollsDe,
    en: recipeSummerRollsEn,
    es: recipeSummerRollsEs,
    fr: recipeSummerRollsFr,
    it: recipeSummerRollsIt,
    ja: recipeSummerRollsJa,
    pt: recipeSummerRollsPt,
  },
  sundubu_jjigae: {
    de: recipeSundubuJjigaeDe,
    en: recipeSundubuJjigaeEn,
    es: recipeSundubuJjigaeEs,
    fr: recipeSundubuJjigaeFr,
    it: recipeSundubuJjigaeIt,
    ja: recipeSundubuJjigaeJa,
    pt: recipeSundubuJjigaePt,
  },
  swiss_cottage_radish_bread: {
    de: recipeSwissCottageRadishBreadDe,
    en: recipeSwissCottageRadishBreadEn,
    es: recipeSwissCottageRadishBreadEs,
    fr: recipeSwissCottageRadishBreadFr,
    it: recipeSwissCottageRadishBreadIt,
    ja: recipeSwissCottageRadishBreadJa,
    pt: recipeSwissCottageRadishBreadPt,
  },
  tamagoyaki_edamame: {
    de: recipeTamagoyakiEdamameDe,
    en: recipeTamagoyakiEdamameEn,
    es: recipeTamagoyakiEdamameEs,
    fr: recipeTamagoyakiEdamameFr,
    it: recipeTamagoyakiEdamameIt,
    ja: recipeTamagoyakiEdamameJa,
    pt: recipeTamagoyakiEdamamePt,
  },
  tandoori_chicken_salad: {
    de: recipeTandooriChickenSaladDe,
    en: recipeTandooriChickenSaladEn,
    es: recipeTandooriChickenSaladEs,
    fr: recipeTandooriChickenSaladFr,
    it: recipeTandooriChickenSaladIt,
    ja: recipeTandooriChickenSaladJa,
    pt: recipeTandooriChickenSaladPt,
  },
  tapioca_egg_cheese: {
    de: recipeTapiocaEggCheeseDe,
    en: recipeTapiocaEggCheeseEn,
    es: recipeTapiocaEggCheeseEs,
    fr: recipeTapiocaEggCheeseFr,
    it: recipeTapiocaEggCheeseIt,
    ja: recipeTapiocaEggCheeseJa,
    pt: recipeTapiocaEggCheesePt,
  },
  tempeh_stirfry: {
    de: recipeTempehStirfryDe,
    en: recipeTempehStirfryEn,
    es: recipeTempehStirfryEs,
    fr: recipeTempehStirfryFr,
    it: recipeTempehStirfryIt,
    ja: recipeTempehStirfryJa,
    pt: recipeTempehStirfryPt,
  },
  teriyaki_tofu: {
    de: recipeTeriyakiTofuDe,
    en: recipeTeriyakiTofuEn,
    es: recipeTeriyakiTofuEs,
    fr: recipeTeriyakiTofuFr,
    it: recipeTeriyakiTofuIt,
    ja: recipeTeriyakiTofuJa,
    pt: recipeTeriyakiTofuPt,
  },
  thai_curry: {
    de: recipeThaiCurryDe,
    en: recipeThaiCurryEn,
    es: recipeThaiCurryEs,
    fr: recipeThaiCurryFr,
    it: recipeThaiCurryIt,
    ja: recipeThaiCurryJa,
    pt: recipeThaiCurryPt,
  },
  tikka_masala_light: {
    de: recipeTikkaMasalaLightDe,
    en: recipeTikkaMasalaLightEn,
    es: recipeTikkaMasalaLightEs,
    fr: recipeTikkaMasalaLightFr,
    it: recipeTikkaMasalaLightIt,
    ja: recipeTikkaMasalaLightJa,
    pt: recipeTikkaMasalaLightPt,
  },
  tofu_poke: {
    de: recipeTofuPokeDe,
    en: recipeTofuPokeEn,
    es: recipeTofuPokeEs,
    fr: recipeTofuPokeFr,
    it: recipeTofuPokeIt,
    ja: recipeTofuPokeJa,
    pt: recipeTofuPokePt,
  },
  tofu_scramble: {
    de: recipeTofuScrambleDe,
    en: recipeTofuScrambleEn,
    es: recipeTofuScrambleEs,
    fr: recipeTofuScrambleFr,
    it: recipeTofuScrambleIt,
    ja: recipeTofuScrambleJa,
    pt: recipeTofuScramblePt,
  },
  tom_yum_shrimp: {
    de: recipeTomYumShrimpDe,
    en: recipeTomYumShrimpEn,
    es: recipeTomYumShrimpEs,
    fr: recipeTomYumShrimpFr,
    it: recipeTomYumShrimpIt,
    ja: recipeTomYumShrimpJa,
    pt: recipeTomYumShrimpPt,
  },
  tonno_fagioli: {
    de: recipeTonnoFagioliDe,
    en: recipeTonnoFagioliEn,
    es: recipeTonnoFagioliEs,
    fr: recipeTonnoFagioliFr,
    it: recipeTonnoFagioliIt,
    ja: recipeTonnoFagioliJa,
    pt: recipeTonnoFagioliPt,
  },
  trout_potato_salad: {
    de: recipeTroutPotatoSaladDe,
    en: recipeTroutPotatoSaladEn,
    es: recipeTroutPotatoSaladEs,
    fr: recipeTroutPotatoSaladFr,
    it: recipeTroutPotatoSaladIt,
    ja: recipeTroutPotatoSaladJa,
    pt: recipeTroutPotatoSaladPt,
  },
  tuna_avocado: {
    de: recipeTunaAvocadoDe,
    en: recipeTunaAvocadoEn,
    es: recipeTunaAvocadoEs,
    fr: recipeTunaAvocadoFr,
    it: recipeTunaAvocadoIt,
    ja: recipeTunaAvocadoJa,
    pt: recipeTunaAvocadoPt,
  },
  tuna_nicoise: {
    de: recipeTunaNicoiseDe,
    en: recipeTunaNicoiseEn,
    es: recipeTunaNicoiseEs,
    fr: recipeTunaNicoiseFr,
    it: recipeTunaNicoiseIt,
    ja: recipeTunaNicoiseJa,
    pt: recipeTunaNicoisePt,
  },
  tuna_onigiri: {
    de: recipeTunaOnigiriDe,
    en: recipeTunaOnigiriEn,
    es: recipeTunaOnigiriEs,
    fr: recipeTunaOnigiriFr,
    it: recipeTunaOnigiriIt,
    ja: recipeTunaOnigiriJa,
    pt: recipeTunaOnigiriPt,
  },
  tuna_pasta_salad: {
    de: recipeTunaPastaSaladDe,
    en: recipeTunaPastaSaladEn,
    es: recipeTunaPastaSaladEs,
    fr: recipeTunaPastaSaladFr,
    it: recipeTunaPastaSaladIt,
    ja: recipeTunaPastaSaladJa,
    pt: recipeTunaPastaSaladPt,
  },
  tuna_rice_cakes: {
    de: recipeTunaRiceCakesDe,
    en: recipeTunaRiceCakesEn,
    es: recipeTunaRiceCakesEs,
    fr: recipeTunaRiceCakesFr,
    it: recipeTunaRiceCakesIt,
    ja: recipeTunaRiceCakesJa,
    pt: recipeTunaRiceCakesPt,
  },
  turkey_bolognese: {
    de: recipeTurkeyBologneseDe,
    en: recipeTurkeyBologneseEn,
    es: recipeTurkeyBologneseEs,
    fr: recipeTurkeyBologneseFr,
    it: recipeTurkeyBologneseIt,
    ja: recipeTurkeyBologneseJa,
    pt: recipeTurkeyBolognesePt,
  },
  turkey_meatballs: {
    de: recipeTurkeyMeatballsDe,
    en: recipeTurkeyMeatballsEn,
    es: recipeTurkeyMeatballsEs,
    fr: recipeTurkeyMeatballsFr,
    it: recipeTurkeyMeatballsIt,
    ja: recipeTurkeyMeatballsJa,
    pt: recipeTurkeyMeatballsPt,
  },
  turkey_rollups: {
    de: recipeTurkeyRollupsDe,
    en: recipeTurkeyRollupsEn,
    es: recipeTurkeyRollupsEs,
    fr: recipeTurkeyRollupsFr,
    it: recipeTurkeyRollupsIt,
    ja: recipeTurkeyRollupsJa,
    pt: recipeTurkeyRollupsPt,
  },
  turkey_veggie_wrap: {
    de: recipeTurkeyVeggieWrapDe,
    en: recipeTurkeyVeggieWrapEn,
    es: recipeTurkeyVeggieWrapEs,
    fr: recipeTurkeyVeggieWrapFr,
    it: recipeTurkeyVeggieWrapIt,
    ja: recipeTurkeyVeggieWrapJa,
    pt: recipeTurkeyVeggieWrapPt,
  },
  tzatziki_pita: {
    de: recipeTzatzikiPitaDe,
    en: recipeTzatzikiPitaEn,
    es: recipeTzatzikiPitaEs,
    fr: recipeTzatzikiPitaFr,
    it: recipeTzatzikiPitaIt,
    ja: recipeTzatzikiPitaJa,
    pt: recipeTzatzikiPitaPt,
  },
  veggie_egg_muffins: {
    de: recipeVeggieEggMuffinsDe,
    en: recipeVeggieEggMuffinsEn,
    es: recipeVeggieEggMuffinsEs,
    fr: recipeVeggieEggMuffinsFr,
    it: recipeVeggieEggMuffinsIt,
    ja: recipeVeggieEggMuffinsJa,
    pt: recipeVeggieEggMuffinsPt,
  },
  veggie_omelette: {
    de: recipeVeggieOmeletteDe,
    en: recipeVeggieOmeletteEn,
    es: recipeVeggieOmeletteEs,
    fr: recipeVeggieOmeletteFr,
    it: recipeVeggieOmeletteIt,
    ja: recipeVeggieOmeletteJa,
    pt: recipeVeggieOmelettePt,
  },
  vitamina_banana: {
    de: recipeVitaminaBananaDe,
    en: recipeVitaminaBananaEn,
    es: recipeVitaminaBananaEs,
    fr: recipeVitaminaBananaFr,
    it: recipeVitaminaBananaIt,
    ja: recipeVitaminaBananaJa,
    pt: recipeVitaminaBananaPt,
  },
  whitefish_potatoes: {
    de: recipeWhitefishPotatoesDe,
    en: recipeWhitefishPotatoesEn,
    es: recipeWhitefishPotatoesEs,
    fr: recipeWhitefishPotatoesFr,
    it: recipeWhitefishPotatoesIt,
    ja: recipeWhitefishPotatoesJa,
    pt: recipeWhitefishPotatoesPt,
  },
  yogurt_bowl: {
    de: recipeYogurtBowlDe,
    en: recipeYogurtBowlEn,
    es: recipeYogurtBowlEs,
    fr: recipeYogurtBowlFr,
    it: recipeYogurtBowlIt,
    ja: recipeYogurtBowlJa,
    pt: recipeYogurtBowlPt,
  },
  yum_nua: {
    de: recipeYumNuaDe,
    en: recipeYumNuaEn,
    es: recipeYumNuaEs,
    fr: recipeYumNuaFr,
    it: recipeYumNuaIt,
    ja: recipeYumNuaJa,
    pt: recipeYumNuaPt,
  },
  zurich_geschnetzeltes: {
    de: recipeZurichGeschnetzeltesDe,
    en: recipeZurichGeschnetzeltesEn,
    es: recipeZurichGeschnetzeltesEs,
    fr: recipeZurichGeschnetzeltesFr,
    it: recipeZurichGeschnetzeltesIt,
    ja: recipeZurichGeschnetzeltesJa,
    pt: recipeZurichGeschnetzeltesPt,
  },
};

export const RECIPE_IMAGES: Readonly<Record<string, RecipeImageAssets>> = {
  acai_skyr_bowl: {
    full: imgAcaiSkyrBowlFull,
    thumb: imgAcaiSkyrBowlThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  aji_de_gallina_light: {
    full: imgAjiDeGallinaLightFull,
    thumb: imgAjiDeGallinaLightThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  alpler_magronen_light: {
    full: imgAlplerMagronenLightFull,
    thumb: imgAlplerMagronenLightThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  apple_skyr_pb_dip: {
    full: imgAppleSkyrPbDipFull,
    thumb: imgAppleSkyrPbDipThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  avocado_egg_toast: {
    full: imgAvocadoEggToastFull,
    thumb: imgAvocadoEggToastThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bacalhau_grao: {
    full: imgBacalhauGraoFull,
    thumb: imgBacalhauGraoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  baked_cod_tomatoes: {
    full: imgBakedCodTomatoesFull,
    thumb: imgBakedCodTomatoesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  baked_falafel_bowl: {
    full: imgBakedFalafelBowlFull,
    thumb: imgBakedFalafelBowlThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  baked_feta_chickpeas: {
    full: imgBakedFetaChickpeasFull,
    thumb: imgBakedFetaChickpeasThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  banana_protein_shake: {
    full: imgBananaProteinShakeFull,
    thumb: imgBananaProteinShakeThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  banh_mi_bowl: {
    full: imgBanhMiBowlFull,
    thumb: imgBanhMiBowlThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  barley_risotto_chicken: {
    full: imgBarleyRisottoChickenFull,
    thumb: imgBarleyRisottoChickenThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  beef_broccoli: {
    full: imgBeefBroccoliFull,
    thumb: imgBeefBroccoliThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  beef_fajita_bowl: {
    full: imgBeefFajitaBowlFull,
    thumb: imgBeefFajitaBowlThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  beef_kofta_yogurt: {
    full: imgBeefKoftaYogurtFull,
    thumb: imgBeefKoftaYogurtThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  beef_steak_vegetables: {
    full: imgBeefSteakVegetablesFull,
    thumb: imgBeefSteakVegetablesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  berry_protein_smoothie: {
    full: imgBerryProteinSmoothieFull,
    thumb: imgBerryProteinSmoothieThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bibimbap: {
    full: imgBibimbapFull,
    thumb: imgBibimbapThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  birchermuesli: {
    full: imgBirchermuesliFull,
    thumb: imgBirchermuesliThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  black_bean_soup: {
    full: imgBlackBeanSoupFull,
    thumb: imgBlackBeanSoupThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bobo_camarao: {
    full: imgBoboCamaraoFull,
    thumb: imgBoboCamaraoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  breakfast_burrito: {
    full: imgBreakfastBurritoFull,
    thumb: imgBreakfastBurritoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bresaola_rocket_toast: {
    full: imgBresaolaRocketToastFull,
    thumb: imgBresaolaRocketToastThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bresaola_rolls: {
    full: imgBresaolaRollsFull,
    thumb: imgBresaolaRollsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  buckwheat_galette: {
    full: imgBuckwheatGaletteFull,
    thumb: imgBuckwheatGaletteThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bulgogi: {
    full: imgBulgogiFull,
    thumb: imgBulgogiThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bun_chay_tofu: {
    full: imgBunChayTofuFull,
    thumb: imgBunChayTofuThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bundner_barley_soup: {
    full: imgBundnerBarleySoupFull,
    thumb: imgBundnerBarleySoupThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  bundnerfleisch_crispbread: {
    full: imgBundnerfleischCrispbreadFull,
    thumb: imgBundnerfleischCrispbreadThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  burrito_bowl: {
    full: imgBurritoBowlFull,
    thumb: imgBurritoBowlThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  ca_kho: {
    full: imgCaKhoFull,
    thumb: imgCaKhoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  caldo_verde_beans: {
    full: imgCaldoVerdeBeansFull,
    thumb: imgCaldoVerdeBeansThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  ceviche_sweet_potato: {
    full: imgCevicheSweetPotatoFull,
    thumb: imgCevicheSweetPotatoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chana_masala: {
    full: imgChanaMasalaFull,
    thumb: imgChanaMasalaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chia_skyr_mango: {
    full: imgChiaSkyrMangoFull,
    thumb: imgChiaSkyrMangoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_bowl: {
    full: imgChickenBowlFull,
    thumb: imgChickenBowlThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_caesar_light: {
    full: imgChickenCaesarLightFull,
    thumb: imgChickenCaesarLightThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_caprese_salad: {
    full: imgChickenCapreseSaladFull,
    thumb: imgChickenCapreseSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_congee: {
    full: imgChickenCongeeFull,
    thumb: imgChickenCongeeThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_fajitas: {
    full: imgChickenFajitasFull,
    thumb: imgChickenFajitasThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_piccata: {
    full: imgChickenPiccataFull,
    thumb: imgChickenPiccataThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_satay_skewers: {
    full: imgChickenSataySkewersFull,
    thumb: imgChickenSataySkewersThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_shawarma_bowl: {
    full: imgChickenShawarmaBowlFull,
    thumb: imgChickenShawarmaBowlThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_souvlaki: {
    full: imgChickenSouvlakiFull,
    thumb: imgChickenSouvlakiThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_sweet_potato_traybake: {
    full: imgChickenSweetPotatoTraybakeFull,
    thumb: imgChickenSweetPotatoTraybakeThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_tagine: {
    full: imgChickenTagineFull,
    thumb: imgChickenTagineThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_tortilla_soup: {
    full: imgChickenTortillaSoupFull,
    thumb: imgChickenTortillaSoupThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chicken_vegetable_soup: {
    full: imgChickenVegetableSoupFull,
    thumb: imgChickenVegetableSoupThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chickpea_chaat: {
    full: imgChickpeaChaatFull,
    thumb: imgChickpeaChaatThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chickpea_tuna_salad: {
    full: imgChickpeaTunaSaladFull,
    thumb: imgChickpeaTunaSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chili_con_carne: {
    full: imgChiliConCarneFull,
    thumb: imgChiliConCarneThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  chili_sin_carne: {
    full: imgChiliSinCarneFull,
    thumb: imgChiliSinCarneThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cilbir: {
    full: imgCilbirFull,
    thumb: imgCilbirThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cocoa_protein_milk: {
    full: imgCocoaProteinMilkFull,
    thumb: imgCocoaProteinMilkThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cod_dill_mustard: {
    full: imgCodDillMustardFull,
    thumb: imgCodDillMustardThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cold_soba_tofu: {
    full: imgColdSobaTofuFull,
    thumb: imgColdSobaTofuThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cottage_crispbread: {
    full: imgCottageCrispbreadFull,
    thumb: imgCottageCrispbreadThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cottage_pineapple: {
    full: imgCottagePineappleFull,
    thumb: imgCottagePineappleThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cottage_tomato_toast: {
    full: imgCottageTomatoToastFull,
    thumb: imgCottageTomatoToastThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cottage_zucchini_frittata: {
    full: imgCottageZucchiniFrittataFull,
    thumb: imgCottageZucchiniFrittataThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  couscous_chicken_salad: {
    full: imgCouscousChickenSaladFull,
    thumb: imgCouscousChickenSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  crepioca_chicken: {
    full: imgCrepiocaChickenFull,
    thumb: imgCrepiocaChickenThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  cuscuz_egg: {
    full: imgCuscuzEggFull,
    thumb: imgCuscuzEggThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  dakgalbi: {
    full: imgDakgalbiFull,
    thumb: imgDakgalbiThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  deviled_eggs_yogurt: {
    full: imgDeviledEggsYogurtFull,
    thumb: imgDeviledEggsYogurtThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  edamame_hummus: {
    full: imgEdamameHummusFull,
    thumb: imgEdamameHummusThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  edamame_quinoa_bowl: {
    full: imgEdamameQuinoaBowlFull,
    thumb: imgEdamameQuinoaBowlThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  edamame_sea_salt: {
    full: imgEdamameSeaSaltFull,
    thumb: imgEdamameSeaSaltThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  egg_salad_sandwich: {
    full: imgEggSaladSandwichFull,
    thumb: imgEggSaladSandwichThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  eggs_cucumber: {
    full: imgEggsCucumberFull,
    thumb: imgEggsCucumberThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  espinacas_garbanzos: {
    full: imgEspinacasGarbanzosFull,
    thumb: imgEspinacasGarbanzosThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  feijoada_light: {
    full: imgFeijoadaLightFull,
    thumb: imgFeijoadaLightThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  frango_piri_piri: {
    full: imgFrangoPiriPiriFull,
    thumb: imgFrangoPiriPiriThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  ga_xao_sa_ot: {
    full: imgGaXaoSaOtFull,
    thumb: imgGaXaoSaOtThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  gado_gado: {
    full: imgGadoGadoFull,
    thumb: imgGadoGadoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  galinhada: {
    full: imgGalinhadaFull,
    thumb: imgGalinhadaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  gazpacho_shrimp: {
    full: imgGazpachoShrimpFull,
    thumb: imgGazpachoShrimpThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  goi_ga: {
    full: imgGoiGaFull,
    thumb: imgGoiGaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  greek_chicken_salad: {
    full: imgGreekChickenSaladFull,
    thumb: imgGreekChickenSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  greek_yogurt_walnut: {
    full: imgGreekYogurtWalnutFull,
    thumb: imgGreekYogurtWalnutThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  green_curry_shrimp: {
    full: imgGreenCurryShrimpFull,
    thumb: imgGreenCurryShrimpThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  green_shakshuka: {
    full: imgGreenShakshukaFull,
    thumb: imgGreenShakshukaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  green_skyr_smoothie: {
    full: imgGreenSkyrSmoothieFull,
    thumb: imgGreenSkyrSmoothieThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  gyeran_jjim: {
    full: imgGyeranJjimFull,
    thumb: imgGyeranJjimThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  gyudon_light: {
    full: imgGyudonLightFull,
    thumb: imgGyudonLightThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  halloumi_lentil_salad: {
    full: imgHalloumiLentilSaladFull,
    thumb: imgHalloumiLentilSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  harira: {
    full: imgHariraFull,
    thumb: imgHariraThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  hot_sour_tofu_soup: {
    full: imgHotSourTofuSoupFull,
    thumb: imgHotSourTofuSoupThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  huevos_rancheros: {
    full: imgHuevosRancherosFull,
    thumb: imgHuevosRancherosThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  hummus_veggie_sticks: {
    full: imgHummusVeggieSticksFull,
    thumb: imgHummusVeggieSticksThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  hummus_wrap: {
    full: imgHummusWrapFull,
    thumb: imgHummusWrapThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  japanese_chicken_curry: {
    full: imgJapaneseChickenCurryFull,
    thumb: imgJapaneseChickenCurryThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  japanese_salmon_breakfast: {
    full: imgJapaneseSalmonBreakfastFull,
    thumb: imgJapaneseSalmonBreakfastThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  kerala_fish_curry: {
    full: imgKeralaFishCurryFull,
    thumb: imgKeralaFishCurryThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  kimchi_scrambled_eggs: {
    full: imgKimchiScrambledEggsFull,
    thumb: imgKimchiScrambledEggsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  kung_pao_chicken: {
    full: imgKungPaoChickenFull,
    thumb: imgKungPaoChickenThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  labneh_zaatar: {
    full: imgLabnehZaatarFull,
    thumb: imgLabnehZaatarThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  larb_gai: {
    full: imgLarbGaiFull,
    thumb: imgLarbGaiThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  lentil_bolognese: {
    full: imgLentilBologneseFull,
    thumb: imgLentilBologneseThumb,
    width: 640,
    height: 480,
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
  lentil_feta_salad: {
    full: imgLentilFetaSaladFull,
    thumb: imgLentilFetaSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  lomo_saltado: {
    full: imgLomoSaltadoFull,
    thumb: imgLomoSaltadoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  mapo_tofu: {
    full: imgMapoTofuFull,
    thumb: imgMapoTofuThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  masala_omelette: {
    full: imgMasalaOmeletteFull,
    thumb: imgMasalaOmeletteThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  menemen: {
    full: imgMenemenFull,
    thumb: imgMenemenThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  minestrone_beans: {
    full: imgMinestroneBeansFull,
    thumb: imgMinestroneBeansThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  miso_salmon: {
    full: imgMisoSalmonFull,
    thumb: imgMisoSalmonThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  moong_dal_chilla: {
    full: imgMoongDalChillaFull,
    thumb: imgMoongDalChillaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  moqueca: {
    full: imgMoquecaFull,
    thumb: imgMoquecaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  mozzarella_tomato_skewers: {
    full: imgMozzarellaTomatoSkewersFull,
    thumb: imgMozzarellaTomatoSkewersThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  mushroom_polenta: {
    full: imgMushroomPolentaFull,
    thumb: imgMushroomPolentaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  nasi_goreng: {
    full: imgNasiGorengFull,
    thumb: imgNasiGorengThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  oat_porridge_quark: {
    full: imgOatPorridgeQuarkFull,
    thumb: imgOatPorridgeQuarkThumb,
    width: 640,
    height: 480,
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
  overnight_oats_quark: {
    full: imgOvernightOatsQuarkFull,
    thumb: imgOvernightOatsQuarkThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  oyakodon: {
    full: imgOyakodonFull,
    thumb: imgOyakodonThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  pad_kra_pao: {
    full: imgPadKraPaoFull,
    thumb: imgPadKraPaoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  pad_thai_chicken: {
    full: imgPadThaiChickenFull,
    thumb: imgPadThaiChickenThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  palak_dal: {
    full: imgPalakDalFull,
    thumb: imgPalakDalThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  palak_paneer_light: {
    full: imgPalakPaneerLightFull,
    thumb: imgPalakPaneerLightThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  paneer_tikka_bites: {
    full: imgPaneerTikkaBitesFull,
    thumb: imgPaneerTikkaBitesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  paneer_tikka_wrap: {
    full: imgPaneerTikkaWrapFull,
    thumb: imgPaneerTikkaWrapThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  pb_banana_soy_oats: {
    full: imgPbBananaSoyOatsFull,
    thumb: imgPbBananaSoyOatsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  pescado_veracruzana: {
    full: imgPescadoVeracruzanaFull,
    thumb: imgPescadoVeracruzanaThumb,
    width: 640,
    height: 480,
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
  picadinho: {
    full: imgPicadinhoFull,
    thumb: imgPicadinhoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  pollo_al_ajillo: {
    full: imgPolloAlAjilloFull,
    thumb: imgPolloAlAjilloThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  poulet_provencal: {
    full: imgPouletProvencalFull,
    thumb: imgPouletProvencalThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  prato_feito: {
    full: imgPratoFeitoFull,
    thumb: imgPratoFeitoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  protein_energy_balls: {
    full: imgProteinEnergyBallsFull,
    thumb: imgProteinEnergyBallsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  protein_pancakes: {
    full: imgProteinPancakesFull,
    thumb: imgProteinPancakesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  quark_berries: {
    full: imgQuarkBerriesFull,
    thumb: imgQuarkBerriesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  quark_bircher: {
    full: imgQuarkBircherFull,
    thumb: imgQuarkBircherThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  quinoa_breakfast_porridge: {
    full: imgQuinoaBreakfastPorridgeFull,
    thumb: imgQuinoaBreakfastPorridgeThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  quinoa_feta_salad: {
    full: imgQuinoaFetaSaladFull,
    thumb: imgQuinoaFetaSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  quinoa_pan: {
    full: imgQuinoaPanFull,
    thumb: imgQuinoaPanThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  rajma: {
    full: imgRajmaFull,
    thumb: imgRajmaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  ratatouille_white_beans: {
    full: imgRatatouilleWhiteBeansFull,
    thumb: imgRatatouilleWhiteBeansThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  ricotta_berry_toast: {
    full: imgRicottaBerryToastFull,
    thumb: imgRicottaBerryToastThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  roasted_chickpeas: {
    full: imgRoastedChickpeasFull,
    thumb: imgRoastedChickpeasThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  rosti_fried_egg: {
    full: imgRostiFriedEggFull,
    thumb: imgRostiFriedEggThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  saba_shioyaki: {
    full: imgSabaShioyakiFull,
    thumb: imgSabaShioyakiThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  salmon_cucumber_bites: {
    full: imgSalmonCucumberBitesFull,
    thumb: imgSalmonCucumberBitesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  salmon_poke: {
    full: imgSalmonPokeFull,
    thumb: imgSalmonPokeThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  salmon_puy_lentils: {
    full: imgSalmonPuyLentilsFull,
    thumb: imgSalmonPuyLentilsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  salpicao_frango: {
    full: imgSalpicaoFrangoFull,
    thumb: imgSalpicaoFrangoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  scrambled_eggs: {
    full: imgScrambledEggsFull,
    thumb: imgScrambledEggsThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  seafood_paella: {
    full: imgSeafoodPaellaFull,
    thumb: imgSeafoodPaellaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  sesame_tofu_bites: {
    full: imgSesameTofuBitesFull,
    thumb: imgSesameTofuBitesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  shakshuka: {
    full: imgShakshukaFull,
    thumb: imgShakshukaThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  shrimp_cocktail: {
    full: imgShrimpCocktailFull,
    thumb: imgShrimpCocktailThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  shrimp_garlic_pasta: {
    full: imgShrimpGarlicPastaFull,
    thumb: imgShrimpGarlicPastaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  shrimp_saganaki: {
    full: imgShrimpSaganakiFull,
    thumb: imgShrimpSaganakiThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  shrimp_tacos: {
    full: imgShrimpTacosFull,
    thumb: imgShrimpTacosThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  silken_chocolate_mousse: {
    full: imgSilkenChocolateMousseFull,
    thumb: imgSilkenChocolateMousseThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  silken_tofu_smoothie: {
    full: imgSilkenTofuSmoothieFull,
    thumb: imgSilkenTofuSmoothieThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  skagen_toast: {
    full: imgSkagenToastFull,
    thumb: imgSkagenToastThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  skyr_apple_compote: {
    full: imgSkyrAppleCompoteFull,
    thumb: imgSkyrAppleCompoteThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  skyr_berry_bark: {
    full: imgSkyrBerryBarkFull,
    thumb: imgSkyrBerryBarkThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  skyr_berry_bowl: {
    full: imgSkyrBerryBowlFull,
    thumb: imgSkyrBerryBowlThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  skyr_herb_dip: {
    full: imgSkyrHerbDipFull,
    thumb: imgSkyrHerbDipThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  smoked_salmon_bread: {
    full: imgSmokedSalmonBreadFull,
    thumb: imgSmokedSalmonBreadThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  soy_chia_pudding: {
    full: imgSoyChiaPuddingFull,
    thumb: imgSoyChiaPuddingThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  spinach_egg_wrap: {
    full: imgSpinachEggWrapFull,
    thumb: imgSpinachEggWrapThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  spinach_feta_omelette: {
    full: imgSpinachFetaOmeletteFull,
    thumb: imgSpinachFetaOmeletteThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  steamed_fish_ginger: {
    full: imgSteamedFishGingerFull,
    thumb: imgSteamedFishGingerThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  stuffed_peppers_turkey: {
    full: imgStuffedPeppersTurkeyFull,
    thumb: imgStuffedPeppersTurkeyThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  stuffed_sweet_potato: {
    full: imgStuffedSweetPotatoFull,
    thumb: imgStuffedSweetPotatoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  summer_rolls: {
    full: imgSummerRollsFull,
    thumb: imgSummerRollsThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  sundubu_jjigae: {
    full: imgSundubuJjigaeFull,
    thumb: imgSundubuJjigaeThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  swiss_cottage_radish_bread: {
    full: imgSwissCottageRadishBreadFull,
    thumb: imgSwissCottageRadishBreadThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tamagoyaki_edamame: {
    full: imgTamagoyakiEdamameFull,
    thumb: imgTamagoyakiEdamameThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tandoori_chicken_salad: {
    full: imgTandooriChickenSaladFull,
    thumb: imgTandooriChickenSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tapioca_egg_cheese: {
    full: imgTapiocaEggCheeseFull,
    thumb: imgTapiocaEggCheeseThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tempeh_stirfry: {
    full: imgTempehStirfryFull,
    thumb: imgTempehStirfryThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  teriyaki_tofu: {
    full: imgTeriyakiTofuFull,
    thumb: imgTeriyakiTofuThumb,
    width: 640,
    height: 480,
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
  tikka_masala_light: {
    full: imgTikkaMasalaLightFull,
    thumb: imgTikkaMasalaLightThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tofu_poke: {
    full: imgTofuPokeFull,
    thumb: imgTofuPokeThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tofu_scramble: {
    full: imgTofuScrambleFull,
    thumb: imgTofuScrambleThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tom_yum_shrimp: {
    full: imgTomYumShrimpFull,
    thumb: imgTomYumShrimpThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tonno_fagioli: {
    full: imgTonnoFagioliFull,
    thumb: imgTonnoFagioliThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  trout_potato_salad: {
    full: imgTroutPotatoSaladFull,
    thumb: imgTroutPotatoSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tuna_avocado: {
    full: imgTunaAvocadoFull,
    thumb: imgTunaAvocadoThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tuna_nicoise: {
    full: imgTunaNicoiseFull,
    thumb: imgTunaNicoiseThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tuna_onigiri: {
    full: imgTunaOnigiriFull,
    thumb: imgTunaOnigiriThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tuna_pasta_salad: {
    full: imgTunaPastaSaladFull,
    thumb: imgTunaPastaSaladThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tuna_rice_cakes: {
    full: imgTunaRiceCakesFull,
    thumb: imgTunaRiceCakesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  turkey_bolognese: {
    full: imgTurkeyBologneseFull,
    thumb: imgTurkeyBologneseThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  turkey_meatballs: {
    full: imgTurkeyMeatballsFull,
    thumb: imgTurkeyMeatballsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  turkey_rollups: {
    full: imgTurkeyRollupsFull,
    thumb: imgTurkeyRollupsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  turkey_veggie_wrap: {
    full: imgTurkeyVeggieWrapFull,
    thumb: imgTurkeyVeggieWrapThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  tzatziki_pita: {
    full: imgTzatzikiPitaFull,
    thumb: imgTzatzikiPitaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  veggie_egg_muffins: {
    full: imgVeggieEggMuffinsFull,
    thumb: imgVeggieEggMuffinsThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  veggie_omelette: {
    full: imgVeggieOmeletteFull,
    thumb: imgVeggieOmeletteThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  vitamina_banana: {
    full: imgVitaminaBananaFull,
    thumb: imgVitaminaBananaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  whitefish_potatoes: {
    full: imgWhitefishPotatoesFull,
    thumb: imgWhitefishPotatoesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  yogurt_bowl: {
    full: imgYogurtBowlFull,
    thumb: imgYogurtBowlThumb,
    width: 800,
    height: 600,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  yum_nua: {
    full: imgYumNuaFull,
    thumb: imgYumNuaThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
  zurich_geschnetzeltes: {
    full: imgZurichGeschnetzeltesFull,
    thumb: imgZurichGeschnetzeltesThumb,
    width: 640,
    height: 480,
    thumbWidth: 400,
    thumbHeight: 300,
  },
};
