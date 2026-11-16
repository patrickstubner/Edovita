# ADR-002: Datenmodell und lokale Speicherung mit Migrationen

- **Status:** akzeptiert (Projektinhaber, 15.11.2026): Dexie in der Web-Phase, SQLite später mit der Handy-App. Ersetzt Punkt 4 «Datenhaltung» im Handoff vom 6.11.
- **Bezug:** Review Befunde 2–5; Graphify-Abfrage Travel Talk (`ProgressRepository`, `coerceSettings`, Import mit Formatversion)

## Kontext

Phase 1 ist PWA-zuerst, Capacitor kommt später. Im Handoff steht SQLite (`@capacitor-community/sqlite`, Web: wa-sqlite/OPFS). wa-sqlite im Browser braucht WASM, OPFS-Worker und `wasm-unsafe-eval` in der CSP. Das kostet mehrere Agent-Iterationen, bevor die erste Funktion steht. Travel Talk nutzt Dexie (IndexedDB) mit Repository-Schnittstelle, Memory-Implementierung für Tests und Whitelist-Normalisierung (`coerceSettings`), das funktioniert dort.

## Entscheid

### Domänenmodell (Auszug, `src/domain`)

```ts
type FoodId = string & { __brand: 'FoodId' }      // z. B. 'broccoli', stabil, nie umbenennen
type RecipeId = string & { __brand: 'RecipeId' }
type Unit = 'g' | 'ml' | 'pc' | 'tbsp' | 'tsp' | 'pinch'   // Anzeige- und Einkaufseinheit

interface Food { id: FoodId; group: 'veg'|'fruit'|'dairy'|'meat'|'fish'|'pantry'|'spice'|'bakery'|'drinks'
  allergens: Allergen[]; allergensToCheck: Allergen[]   // «kann enthalten», produktabhängig
  per100g: Nutrients | null                            // null = nicht in der Quelle, status 'zu_pruefen'
  source: { db: 'CH-NWD'; version: '7.1'; ref: number; name: string } | null
  status: 'ok' | 'zu_pruefen'; proxy?: boolean; density?: number }
interface RecipeIngredient { food: FoodId; amount: number; unit: Unit
  grams: number            // gegessenes Gewicht bei Grundportionen, Basis der Nährwertrechnung (g = amount, ml = amount × Dichte)
  optional?: boolean; strained?: boolean /* abgesiebt, zählt nicht */; noteKey?: string }
interface Recipe { id: RecipeId; cuisine: CuisineId; meal: Meal; minutes: number; servings: number
  ingredients: RecipeIngredient[]; steps: number /* Anzahl, Texte in Locales */; tags: Tag[]
  review: { checkedAt: string; sources: string[] } }   // Gegenprüfung (ADR-005)
type ShopState = 'open' | 'cart' | 'home'
interface ShoppingItem { id: string; food: FoodId; amount?: number; unit?: Unit; state: ShopState
  fromRecipes: RecipeId[]; addedAt: string }
interface Profile { id: string; name: string; birthDate?: string; sexForCalc?: 'm'|'f'|'na'
  heightCm?: number; goal: 'lose'|'keep'|'gain'; pace: Pace }       // Gesundheitsdaten (ADR-004)
interface Settings { uiLang: LangCode; secondLang: LangCode | null; theme: 'system'|'light'|'dark'
  sound: boolean; hymn: 'H1'|'H5'|'H4' }
```

Nährwerte pro Rezept werden aus `grams` × `per100g` berechnet (`nutrition/`). Der Build schreibt sie als `nutritionPerServing` mit `isMinimum`, `notIncluded` und `proxies` in den Inhalt; ein Test rechnet nach. Beispielinhalte: `inhalte/`.

### Speicherung

- **Schnittstellen pro Bereich:** `SettingsRepository`, `ProfileRepository`, `ShoppingRepository`, `JournalRepository` (Mahlzeiten, Gewicht), `RatingsRepository` (Sterne, Merkliste).
- **Implementierungen:** `Dexie*Repository` (PWA) und `Memory*Repository` (Tests, Storybook). Später `Sqlite*Repository` für Capacitor, gleiche Schnittstelle, gleicher Vertragstest.
- **Migrationen:** Dexie-`version(n).upgrade()` pro Schema-Stand, jede Migration mit eigenem Test (alter Datensatz rein → neuer raus). Beim Lesen läuft jeder Datensatz durch `coerce*()` (Whitelist, Standardwerte), wie bei Travel Talk.
- **Export/Import:** JSON-Bundle `{ format: 1, exportedAt, data }`, zod-validiert, Formatversion für spätere Umwandlung. Gleichzeitig die DSG-Pflicht «Daten herausgeben» (ADR-004).
- **localStorage** nur für die Sprache vor dem DB-Start und das Theme (gegen Aufblitzen). Alles andere in IndexedDB.
- **Einkaufsliste:** gleiche Zutat + gleiche Einheit wird zusammengezählt, `fromRecipes` merkt sich die Herkunft (Entfernen eines Rezepts zieht nur dessen Menge ab). Zustand `home` bleibt beim Zusammenführen erhalten.

### Technik (entschieden 15.11.2026)

- **Web-Phase:** Dexie/IndexedDB. Kein wa-sqlite, keine `wasm-unsafe-eval` in der CSP.
- **Handy-App (Capacitor):** `Sqlite*Repository` mit SQLCipher, gleiche Schnittstellen, gleicher Vertragstest. Beim Umstieg eine einmalige Übernahme der IndexedDB-Daten (Export-Bundle `format: 1`).

## Folgen

- Die Startfunktionen (Rezept-Detail, Einkaufsliste) brauchen nur `ShoppingRepository`, `SettingsRepository`, `RatingsRepository`. Profil und Journal kommen mit dem Onboarding.
- Ein Wechsel auf SQLite ist ein Adapter-PR mit Vertragstest, kein Umbau.
