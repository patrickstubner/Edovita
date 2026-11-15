# Quelle für meta.json, legal.json, recipes.json, store.json pro Sprache.
# de = Quelltext (geprüft). Alle anderen = Entwurf (reviewed False).
# legalApproved = True ist eine PROTOTYP-SIMULATION (legalNote), die Anwaltsprüfung ist offen.
META = {
 "de": dict(name="Deutsch", englishName="German", locale="de-CH"),
 "en": dict(name="English", englishName="English", locale="en-GB"),
 "fr": dict(name="Français", englishName="French", locale="fr-CH"),
 "it": dict(name="Italiano", englishName="Italian", locale="it-CH"),
 "es": dict(name="Español", englishName="Spanish", locale="es-ES"),
 "ja": dict(name="日本語", englishName="Japanese", locale="ja-JP", font="system: Hiragino Sans / Noto Sans CJK JP"),
 # Entscheid 6.11.2026: Portugiesisch in v1, Basis pt-BR (grösste Sprechergruppe).
 # pt-PT-Nutzer:innen sehen vorerst pt-BR (gleicher Ordner pt/); eigene pt-PT-Variante nur bei Bedarf.
 "pt": dict(name="Português", englishName="Portuguese", locale="pt-BR", variant="pt-BR",
            variantNote="Basis Brasilianisches Portugiesisch (pt-BR): grösste Sprechergruppe; Anrede 'você'. pt-PT-Geräte erhalten vorerst pt-BR, eigene pt-PT-Variante erst bei Bedarf (Store-Listing pt-PT separat prüfen)."),
}
PLANNED = [
 {"code": "hi", "name": "हिन्दी", "reason": "planned"},
 {"code": "ko", "name": "한국어", "reason": "planned"},
 {"code": "bn", "name": "বাংলা", "reason": "planned"},
 {"code": "tr", "name": "Türkçe", "reason": "tr"},
 {"code": "id", "name": "Bahasa Indonesia", "reason": "id"},
]
CREDITS_ITEMS = [
 "Hymne H1, H5, H4: ACE-Step v1 (Apache-2.0)",
 "Drum samples provided by DrumGizmo.org",
]
LEGAL = {
 "de": {"note": "Edovita ersetzt keine ärztliche oder ernährungsmedizinische Beratung. Allergenfilter sind Hinweise, keine Garantie.",
  "sections": [
   {"title": "Gesundheitshinweis", "paragraphs": ["Kalorien- und Körperwerte sind Schätzungen und Richtwerte. Bei Vorerkrankungen, in der Schwangerschaft oder bei Essproblemen sprich zuerst mit deiner Hausärztin oder deinem Hausarzt.", "Edovita bietet bewusst kein Abnehmen bei einem BMI unter 18.5 und kein Tagesziel unter 1'200 kcal (Frauen) bzw. 1'500 kcal (Männer) an."]},
   {"title": "Datenschutz", "paragraphs": ["Deine Gesundheitsdaten bleiben auf deinem Gerät. Es gibt kein Konto und keine Werbung.", "Das Cloud-Backup ist standardmässig aus. Wenn du es einschaltest, werden die Daten vorher auf dem Gerät verschlüsselt und in der EU gespeichert. Grundlage ist deine ausdrückliche Einwilligung, die du jederzeit widerrufen kannst."]},
   {"title": "Sprachen", "paragraphs": ["Rechtstexte gelten in der Sprache, in der sie geprüft wurden. Übersetzungen dieses Prototyps sind Entwürfe."]}],
  "credits": {"title": "Credits", "items": CREDITS_ITEMS}},
 "en": {"note": "Edovita does not replace medical or dietetic advice. Allergen filters are hints, not guarantees.",
  "sections": [
   {"title": "Health notice", "paragraphs": ["Calorie and body values are estimates and guide values. If you have pre-existing conditions, are pregnant or have eating problems, talk to your GP first.", "Edovita deliberately offers no weight loss at a BMI below 18.5 and no daily goal below 1,200 kcal (women) or 1,500 kcal (men)."]},
   {"title": "Privacy", "paragraphs": ["Your health data stays on your device. There is no account and no advertising.", "Cloud backup is off by default. If you turn it on, data is encrypted on the device first and stored in the EU. The legal basis is your explicit consent, which you can withdraw at any time."]},
   {"title": "Languages", "paragraphs": ["Legal texts apply in the language in which they were reviewed. Translations in this prototype are drafts."]}],
  "credits": {"title": "Credits", "items": CREDITS_ITEMS}},
 "fr": {"note": "Edovita ne remplace pas un avis médical ou diététique. Les filtres d'allergènes sont des indications, pas des garanties.",
  "sections": [
   {"title": "Avis santé", "paragraphs": ["Les valeurs caloriques et corporelles sont des estimations et des repères. En cas de maladie préexistante, de grossesse ou de troubles alimentaires, parle d'abord à ton médecin de famille.", "Edovita ne propose volontairement aucune perte de poids sous un IMC de 18,5 et aucun objectif quotidien sous 1 200 kcal (femmes) ou 1 500 kcal (hommes)."]},
   {"title": "Confidentialité", "paragraphs": ["Tes données de santé restent sur ton appareil. Pas de compte, pas de publicité.", "La sauvegarde cloud est désactivée par défaut. Si tu l'actives, les données sont d'abord chiffrées sur l'appareil puis stockées dans l'UE. La base légale est ton consentement exprès, révocable à tout moment."]},
   {"title": "Langues", "paragraphs": ["Les textes juridiques font foi dans la langue dans laquelle ils ont été vérifiés. Les traductions de ce prototype sont des brouillons."]}],
  "credits": {"title": "Crédits", "items": CREDITS_ITEMS}},
 "it": {"note": "Edovita non sostituisce la consulenza medica o dietetica. I filtri allergeni sono indicazioni, non garanzie.",
  "sections": [
   {"title": "Avvertenza sanitaria", "paragraphs": ["I valori di calorie e corporei sono stime e valori indicativi. In caso di malattie preesistenti, gravidanza o problemi alimentari parla prima con il tuo medico di famiglia.", "Edovita non offre volutamente la perdita di peso con un BMI inferiore a 18,5 né obiettivi giornalieri sotto 1'200 kcal (donne) o 1'500 kcal (uomini)."]},
   {"title": "Privacy", "paragraphs": ["I tuoi dati sanitari restano sul tuo dispositivo. Nessun account, nessuna pubblicità.", "Il backup cloud è disattivato per impostazione predefinita. Se lo attivi, i dati vengono prima crittografati sul dispositivo e salvati nell'UE. La base giuridica è il tuo consenso esplicito, revocabile in qualsiasi momento."]},
   {"title": "Lingue", "paragraphs": ["I testi legali valgono nella lingua in cui sono stati verificati. Le traduzioni di questo prototipo sono bozze."]}],
  "credits": {"title": "Crediti", "items": CREDITS_ITEMS}},
 "es": {"note": "Edovita no sustituye el consejo médico o dietético. Los filtros de alérgenos son indicaciones, no garantías.",
  "sections": [
   {"title": "Aviso de salud", "paragraphs": ["Los valores de calorías y corporales son estimaciones y referencias. Si tienes enfermedades previas, estás embarazada o tienes problemas alimentarios, habla primero con tu médico de cabecera.", "Edovita no ofrece deliberadamente perder peso con un IMC inferior a 18,5 ni objetivos diarios por debajo de 1200 kcal (mujeres) o 1500 kcal (hombres)."]},
   {"title": "Privacidad", "paragraphs": ["Tus datos de salud se quedan en tu dispositivo. Sin cuenta y sin publicidad.", "La copia en la nube está desactivada por defecto. Si la activas, los datos se cifran primero en el dispositivo y se guardan en la UE. La base legal es tu consentimiento expreso, que puedes retirar en cualquier momento."]},
   {"title": "Idiomas", "paragraphs": ["Los textos legales valen en el idioma en que fueron revisados. Las traducciones de este prototipo son borradores."]}],
  "credits": {"title": "Créditos", "items": CREDITS_ITEMS}},
 "ja": {"note": "Edovitaは医療・栄養指導の代わりにはなりません。アレルゲンフィルターは目安であり、保証ではありません。",
  "sections": [
   {"title": "健康に関する注意", "paragraphs": ["カロリーや身体の数値は推定値・目安です。持病がある方、妊娠中の方、食の悩みがある方は、まずかかりつけ医に相談してください。", "EdovitaはBMI 18.5未満での減量や、1日の目標が1,200 kcal（女性）・1,500 kcal（男性）を下回るプランを意図的に提供しません。"]},
   {"title": "プライバシー", "paragraphs": ["健康データはあなたの端末に残ります。アカウントも広告もありません。", "クラウドバックアップは標準でオフです。オンにすると、データは端末上で暗号化されてからEU内に保存されます。根拠はあなたの明示的な同意で、いつでも撤回できます。"]},
   {"title": "言語", "paragraphs": ["法的文書は確認済みの言語で効力を持ちます。このプロトタイプの翻訳は下書きです。"]}],
  "credits": {"title": "クレジット", "items": CREDITS_ITEMS}},
 "pt": {"note": "O Edovita não substitui orientação médica ou nutricional. Os filtros de alérgenos são indicações, não garantias.",
  "sections": [
   {"title": "Aviso de saúde", "paragraphs": ["Os valores de calorias e corporais são estimativas e referências. Se você tem doenças preexistentes, está grávida ou tem problemas alimentares, converse primeiro com seu médico de família.", "O Edovita deliberadamente não oferece perda de peso com IMC abaixo de 18,5 nem meta diária abaixo de 1.200 kcal (mulheres) ou 1.500 kcal (homens)."]},
   {"title": "Privacidade", "paragraphs": ["Seus dados de saúde ficam no seu aparelho. Sem conta e sem anúncios.", "O backup na nuvem vem desligado. Se você ligá-lo, os dados são primeiro criptografados no aparelho e guardados na UE. A base legal é o seu consentimento específico e destacado, que você pode revogar a qualquer momento."]},
   {"title": "Idiomas", "paragraphs": ["Os textos jurídicos valem no idioma em que foram revisados. As traduções deste protótipo são rascunhos."]}],
  "credits": {"title": "Créditos", "items": CREDITS_ITEMS}},
}
STORE = {
 "de": {"title": "Edovita", "subtitle": "Ernährungstagebuch, lokal auf deinem Gerät", "short": "Ernährung und Ziele tracken – lokal auf dem Gerät, klar und behutsam."},
 "en": {"title": "Edovita", "subtitle": "Local-first food diary – goals, recipes, gentle guardrails", "short": "Track meals and goals on-device. Built for clarity and care."},
 "fr": {"title": "Edovita", "subtitle": "Journal alimentaire, en local sur ton appareil", "short": "Suis repas et objectifs sur ton appareil. Clair et bienveillant."},
 "it": {"title": "Edovita", "subtitle": "Diario alimentare, in locale sul tuo dispositivo", "short": "Monitora pasti e obiettivi sul dispositivo. Chiaro e premuroso."},
 "es": {"title": "Edovita", "subtitle": "Diario de comidas, en local en tu dispositivo", "short": "Registra comidas y objetivos en tu dispositivo. Claro y cuidadoso."},
 "ja": {"title": "Edovita", "subtitle": "端末内で完結する食事日記", "short": "食事と目標を端末内で記録。わかりやすく、やさしく。"},
 "pt": {"title": "Edovita", "subtitle": "Diário alimentar, local no seu aparelho", "short": "Registre refeições e metas no aparelho. Claro e cuidadoso."},
}
# Reihenfolge: recipes(15), cuisines(10), ingredients(8), foods(15)
R_IDS = ["oven_salmon","quinoa_pan","thai_curry","pho","summer_rolls","birchermuesli","yogurt_bowl","lentil_curry","scrambled_eggs","chicken_bowl","mushroom_polenta","hummus_wrap","miso_salmon","shakshuka","burrito_bowl"]
C_IDS = ["european","thai","mediterranean","vietnamese","swiss","japanese","indian","middle_eastern","mexican","italian"]
I_IDS = ["broccoli","chickpeas","berries","yogurt","eggs","quinoa","nuts","olive_oil"]
F_IDS = ["spaghetti","birchermuesli","chicken_rice","salad","pizza","sushi","pad_thai","rosti_egg","banana","apple","oatmeal_berries","lentil_salad","yogurt_nuts","apple_almonds","pizza_whole"]
REC = {
 "de": [["Ofenlachs mit Brokkoli","Quinoa-Gemüsepfanne mit Kichererbsen","Thai-Curry mit Poulet","Pho mit Rindfleisch","Vietnamesische Sommerrollen mit Crevetten","Birchermüesli","Joghurt mit Beeren und Nüssen","Linsen-Curry mit Kokosmilch","Rührei mit Spinat und Vollkornbrot","Teriyaki-Poulet-Bowl","Pilzpfanne mit Polenta","Hummus-Gemüse-Wrap","Miso-Lachs mit Pak Choi","Shakshuka","Burrito-Bowl mit Bohnen"],
        ["Europäisch","Thailändisch","Mediterran","Vietnamesisch","Schweizerisch","Japanisch","Indisch","Nahöstlich","Mexikanisch","Italienisch"],
        ["Brokkoli","Kichererbsen","Beeren","Naturjoghurt","Eier","Quinoa","Nüsse","Olivenöl"],
        ["Spaghetti Bolognese","Birchermüesli","Poulet mit Reis","Gemischter Salat","Pizza Margherita","Sushi","Pad Thai","Rösti mit Spiegelei","Banane","Apfel","Haferbrei mit Beeren","Linsensalat mit Feta","Joghurt mit Beeren und Nüssen","Apfel mit Mandeln","Pizza Margherita, ganz"]],
 "en": [["Oven-baked salmon with broccoli","Quinoa vegetable pan with chickpeas","Thai chicken curry","Beef pho","Vietnamese summer rolls with prawns","Bircher muesli","Yoghurt with berries and nuts","Lentil curry with coconut milk","Scrambled eggs with spinach and wholemeal bread","Teriyaki chicken bowl","Mushroom pan with polenta","Hummus vegetable wrap","Miso salmon with pak choi","Shakshuka","Burrito bowl with beans"],
        ["European","Thai","Mediterranean","Vietnamese","Swiss","Japanese","Indian","Middle Eastern","Mexican","Italian"],
        ["Broccoli","Chickpeas","Berries","Natural yoghurt","Eggs","Quinoa","Nuts","Olive oil"],
        ["Spaghetti bolognese","Bircher muesli","Chicken with rice","Mixed salad","Pizza margherita","Sushi","Pad thai","Rösti with fried egg","Banana","Apple","Porridge with berries","Lentil salad with feta","Yoghurt with berries and nuts","Apple with almonds","Pizza margherita, whole"]],
 "fr": [["Saumon au four et brocoli","Poêlée de quinoa aux légumes et pois chiches","Curry thaï au poulet","Pho au bœuf","Rouleaux de printemps vietnamiens aux crevettes","Birchermüesli","Yogourt aux baies et noix","Curry de lentilles au lait de coco","Œufs brouillés aux épinards et pain complet","Bowl de poulet teriyaki","Poêlée de champignons et polenta","Wrap houmous et légumes","Saumon miso et pak choï","Chakchouka","Burrito bowl aux haricots"],
        ["Européenne","Thaïe","Méditerranéenne","Vietnamienne","Suisse","Japonaise","Indienne","Moyen-orientale","Mexicaine","Italienne"],
        ["Brocoli","Pois chiches","Baies","Yogourt nature","Œufs","Quinoa","Noix","Huile d'olive"],
        ["Spaghetti bolognaise","Birchermüesli","Poulet et riz","Salade mêlée","Pizza margherita","Sushi","Pad thaï","Rösti et œuf au plat","Banane","Pomme","Porridge aux baies","Salade de lentilles à la feta","Yogourt aux baies et noix","Pomme et amandes","Pizza margherita entière"]],
 "it": [["Salmone al forno con broccoli","Padella di quinoa e verdure con ceci","Curry thai di pollo","Pho di manzo","Involtini estivi vietnamiti con gamberi","Birchermüesli","Yogurt con frutti di bosco e noci","Curry di lenticchie al latte di cocco","Uova strapazzate con spinaci e pane integrale","Bowl di pollo teriyaki","Padella di funghi con polenta","Wrap con hummus e verdure","Salmone al miso con pak choi","Shakshuka","Burrito bowl con fagioli"],
        ["Europea","Thailandese","Mediterranea","Vietnamita","Svizzera","Giapponese","Indiana","Mediorientale","Messicana","Italiana"],
        ["Broccoli","Ceci","Frutti di bosco","Yogurt naturale","Uova","Quinoa","Noci","Olio d'oliva"],
        ["Spaghetti alla bolognese","Birchermüesli","Pollo con riso","Insalata mista","Pizza margherita","Sushi","Pad thai","Rösti con uovo all'occhio di bue","Banana","Mela","Porridge ai frutti di bosco","Insalata di lenticchie con feta","Yogurt con frutti di bosco e noci","Mela con mandorle","Pizza margherita intera"]],
 "es": [["Salmón al horno con brócoli","Salteado de quinoa y verduras con garbanzos","Curry tailandés de pollo","Pho de ternera","Rollitos vietnamitas de verano con gambas","Muesli Bircher","Yogur con frutos rojos y frutos secos","Curry de lentejas con leche de coco","Huevos revueltos con espinacas y pan integral","Bowl de pollo teriyaki","Salteado de setas con polenta","Wrap de hummus y verduras","Salmón al miso con pak choi","Shakshuka","Burrito bowl con alubias"],
        ["Europea","Tailandesa","Mediterránea","Vietnamita","Suiza","Japonesa","India","De Oriente Medio","Mexicana","Italiana"],
        ["Brócoli","Garbanzos","Frutos rojos","Yogur natural","Huevos","Quinoa","Frutos secos","Aceite de oliva"],
        ["Espaguetis a la boloñesa","Muesli Bircher","Pollo con arroz","Ensalada mixta","Pizza margarita","Sushi","Pad thai","Rösti con huevo frito","Plátano","Manzana","Gachas de avena con frutos rojos","Ensalada de lentejas con feta","Yogur con frutos rojos y frutos secos","Manzana con almendras","Pizza margarita entera"]],
 "ja": [["サーモンのオーブン焼きとブロッコリー","ひよこ豆入りキヌアの野菜炒め","タイ風チキンカレー","牛肉のフォー","エビの生春巻き","ビルヒャーミューズリー","ベリーとナッツのヨーグルト","ココナッツミルクのレンズ豆カレー","ほうれん草入りスクランブルエッグと全粒粉パン","照り焼きチキン丼","きのこ炒めとポレンタ","フムスと野菜のラップ","サーモンの味噌焼きとチンゲン菜","シャクシュカ","豆入りブリトーボウル"],
        ["ヨーロッパ","タイ","地中海","ベトナム","スイス","日本","インド","中東","メキシコ","イタリア"],
        ["ブロッコリー","ひよこ豆","ベリー","プレーンヨーグルト","卵","キヌア","ナッツ","オリーブオイル"],
        ["スパゲッティ・ボロネーゼ","ビルヒャーミューズリー","チキンとご飯","ミックスサラダ","マルゲリータピザ","寿司","パッタイ","目玉焼きのせレシュティ","バナナ","りんご","ベリー入りオートミール","フェタ入りレンズ豆サラダ","ベリーとナッツのヨーグルト","りんごとアーモンド","マルゲリータピザ（1枚）"]],
 "pt": [["Salmão assado com brócolis","Quinoa refogada com legumes e grão-de-bico","Curry tailandês de frango","Pho de carne","Rolinhos primavera vietnamitas com camarão","Bircher muesli","Iogurte com frutas vermelhas e castanhas","Curry de lentilha com leite de coco","Ovos mexidos com espinafre e pão integral","Bowl de frango teriyaki","Cogumelos salteados com polenta","Wrap de homus e legumes","Salmão ao missô com pak choi","Shakshuka","Burrito bowl com feijão"],
        ["Europeia","Tailandesa","Mediterrânea","Vietnamita","Suíça","Japonesa","Indiana","Do Oriente Médio","Mexicana","Italiana"],
        ["Brócolis","Grão-de-bico","Frutas vermelhas","Iogurte natural","Ovos","Quinoa","Castanhas","Azeite de oliva"],
        ["Espaguete à bolonhesa","Bircher muesli","Frango com arroz","Salada mista","Pizza margherita","Sushi","Pad thai","Rösti com ovo frito","Banana","Maçã","Mingau de aveia com frutas vermelhas","Salada de lentilha com feta","Iogurte com frutas vermelhas e castanhas","Maçã com amêndoas","Pizza margherita inteira"]],
}
