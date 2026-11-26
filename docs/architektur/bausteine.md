# Bausteine (aus dem Prototyp abgeleitet)

Skizzen für die Agents. Namen und Signaturen sind Vorschläge; Schichten gemäss ADR-001. «Prototyp:» nennt die Stelle, von der das Verhalten übernommen wird.

## 1. domain

- Typen aus ADR-002 (`Food`, `Recipe` inkl. `preferenceTags` aus der 4er-Whitelist `cilantro`/`mushrooms`/`onion`/`meat`, `CUISINES` mit 23 Küchen, `RecipeTitles`, `RecipeIngredient`, `ShoppingItem`, `ShopState`, `Profile`, `Settings`, `LangCode`, `LangMeta { dir, locale, legalApproved, reviewed }`).
- zod-Schemas (`jitless: true`, `hasForbiddenOwnKey`) für alles, was von aussen kommt: Inhalte (Build, 199 Lebensmittel, 7 Glossare, 200 Rezepte inkl. 7 Titel-Sprachen), Export-Bundle, QR-Import.
- `parseShopImport(fragment): Result<ImportItem[]>`. Prototyp: `vendor/edo-qr.js parseImport` (Längen 4000/3000, max. 40 Items, ID `^[\w.-]+$`, Name ohne `<>&"'`, `st` nur open/cart/home).

## 2. Dienste

| Modul | Funktionen | Prototyp |
|---|---|---|
| `nutrition/scale.ts` | `scaleIngredients(recipe, servings): ScaledIngredient[]` (Rundung je Einheit: g auf 5, ml auf 10, pc auf 0,5, tbsp/tsp auf 0,5) | neu |
| `nutrition/sum.ts` | `nutrientsPerServing(recipe, foods): Nutrients` | `RECIPES.kcal/p` (geschätzt) → berechnet |
| `catalog/recipes.ts` | `listRecipes(filter)` (inkl. `excludePreferences` für `preferenceTags`), `getRecipe(id)`, `getRecipeText(id, lang)`, `getRecipeTitle(id, lang)` (alle 7 Sprachen ohne EN-Fallback), `rankRecipes(list, ratings, saved)` inkl. Vielfalt | `rscore`, `rlist` (nie zweimal dieselbe Küche hintereinander) |
| `catalog/foods.ts` | `getFood(id)`, `foodName(id, lang)` (7 Glossare), `isAllowed(food, prefs)` | `rget`, `allowed`, `excluded` |
| `shopping/merge.ts` | `addRecipe(list, recipe, servings)`, `removeRecipe(list, recipeId)`, `setState(list, id, state)`, `groupItems(list)` | `SHOP`, `shopRow`, `renderShop`, `applyShopImport` |
| `i18n/` | `initI18n(registry)`, `detectUiLang(navigator.languages)`, `approved(code)`, `fmtNumber/fmtAmount` | `i18n.js detect/approved/num` |
| `health/` | `kcalFloor`, `minWeight(goal)`, `loseBlocked`, `minTargetWeight`, `sustainableRate`, `goalKcal`, `kcalSafe(bmr)`, `checkBirthDate` | gleichnamige Funktionen in `app.js` (Z. 103–126, 432, 541–547) |
| `storage/` | `*Repository` + `Dexie*`/`Memory*`, `coerceSettings`, Migrationen, `exportAll/importAll/wipeAll` | `getPref/setPref` (Whitelist) |

## 3. Hooks

| Hook | Zweck |
|---|---|
| `useRecipe(id)` | Rezept + Texte in UI-Sprache, `notFound` |
| `useServings(recipe)` | Portionszahl (1–12), Start = `recipe.servings` bzw. zuletzt gewählt; liefert skalierte Zutaten und Nährwerte |
| `useShoppingList()` | Liste, Gruppen, `toggleCart`, `markHome`, `undo`, `addRecipe`, `removeRecipe`, `clearDone` |
| `useSecondLang()` | `secondLang`, `setSecondLang`, `nameFor(foodId)` (null bei gleicher Sprache oder fehlendem Eintrag) |
| `useSettings()` | Theme, Ton, UI-Sprache; Sprachwechsel ohne Neustart |
| `useShareList()` | Text für Web Share API, QR-Fragment (`encodeShopImport`) |

## 4. Komponenten

| Komponente | Verhalten | Prototyp |
|---|---|---|
| `Screen` + `BottomActions` | Kopf, scrollender Körper, fixe Leiste unten mit 1–3 Buttons, Safe-Area, Tastatur über `visualViewport` | `layoutScreens`, `.actions`, `syncAppHeight` (v5.4) |
| `RecipeCard` | Kachel mit Küche, Titel, kcal/min/Protein, Sterne, Merken; Tippen öffnet Detail; Top-Karte zusätzlich mit Knopf «Zur Einkaufsliste hinzufügen» (E11: automatische Einplanung im Plan, Einkaufsliste aktualisieren, Toast mit «Rückgängig» und Wechsel zu `#/einkauf`) | `renderRecipes` |
| `RecipeHeader` | Bild/Farbfläche, Titel, Küche, Zeit, Sterne, Merken | neu |
| `ServingsStepper` | − / Zahl / +, 44 px Tap-Fläche, `aria-live` | Stepper aus `stepperCard` |
| `IngredientList` | Zeilen mit Menge + `BilingualName`, Allergene markiert | neu |
| `StepList` | nummerierte Schritte, nur App-Sprache | neu |
| `NutritionPanel` | pro Portion: kcal, Protein, Fett, KH, Ballaststoffe; Quellenvermerk | neu |
| `BilingualName` | `Name · <bdi lang dir>Zweitname</bdi>` | neu (Projektinhaber 07.11.) |
| `ShopRow` | offen: Häkchen-Button «in den Korb»; im Korb: durchgestrichen + rückgängig; zu Hause: Haus-Symbol + «Rückgängig» | `shopRow` |
| `ShopGroup` | Gruppenkopf, Zähler | `renderShop` |
| `LangChip` / `SecondLangSheet` | Chip oben in der Liste, Auswahlblatt mit Suche, «keine» | Sprach-Chip im Onboarding |
| `Stars`, `SaveButton`, `Chip`, `Toast`, `Icon` (SVG-Sprite aus `index.html`, ca. 50 Symbole) | wie Prototyp | `stars`, `saveBtn`, `toast`, `icon` |

## 5. Seiten für den Start

- **`RecipesPage`** (`#/rezepte`): Filter-Chips, nach Vielfalt gereihte `RecipeCard`-Liste; die Top-Karte bietet zusätzlich den Knopf «Zur Einkaufsliste hinzufügen» (E11: automatische Einplanung in den nächsten freien passenden Slot im Plan, Neuberechnung der Einkaufsliste, Toast mit «Rückgängig» und Weiterleitung zu `#/einkauf`).
- **`RecipeDetailPage`** (`#/rezept/:id`): `Screen` > `RecipeHeader`, `ServingsStepper`, `IngredientList`, `StepList`, `NutritionPanel`; `BottomActions`: «Zum Plan hinzufügen» (`PlanSheet` → `#/plan`), «Zur Einkaufsliste hinzufügen» (ab E11: automatische Einplanung mit gewählter Portionszahl in den nächsten freien passenden Slot im Plan, Neuberechnung der Einkaufsliste, Toast mit «Rückgängig» und Wechsel zu `#/einkauf`) sowie «Einkaufsliste öffnen».
- **`ShoppingListPage`** (`#/einkauf`): `LangChip` oben rechts neben Info-Icon «Hausmarken», Gruppen mit `ShopRow`, Abschnitt «Schon zu Hause», leerer Zustand mit Link zu Rezepten; `BottomActions`: «QR-Einkaufsliste», «Liste teilen».
