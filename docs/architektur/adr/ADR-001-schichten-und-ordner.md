# ADR-001: Schichtregeln und Ordnerstruktur

- **Status:** akzeptiert (Projektinhaber, 15.11.2026)
- **Bezug:** Review Befund 4; Lehren aus Travel Talk (Review 13.11., Befunde 1, 4, 5)

## Kontext

Bei Travel Talk entstanden ein Gott-Kontext (`AppProvider`), ein Zyklus `storage` ↔ `audio` und ein Grundtyp in einer Inhaltsdatei. Der Umbau kostet dort 6–8 Agent-Tage (R1–R4). Edovita startet bei null und kann das von Anfang an vermeiden. Stack laut Decision-Log: React + TypeScript + Rsbuild, PWA zuerst, Capacitor später.

## Entscheid

```
src/
  pages/        Routen, dünne Komposition (RecipeDetailPage, ShoppingListPage …)
  components/   reine Darstellung: Props rein, Events raus (RecipeHeader, ShopRow, BottomActions …)
  hooks/        React-Bausteine (useRecipe, useServings, useShoppingList, useSecondLang …)
  app/          Provider (Settings, Profile, Shopping, Journal), Router, Shell, Theme
  ── Dienste ──────────────────────────────────────────────────────────────
  storage/      Repository-Schnittstellen + Dexie/Memory-Implementierungen, Migrationen
  catalog/      Lesen der Inhalte (Rezepte, Lebensmittel, Glossare), Abfragen
  i18n/         i18next-Setup, Registry-Zugriff, Formatierer (Intl)
  nutrition/    Portionsrechnung, Nährwertsummen, Einheiten
  health/       Schutzregeln (kcal, BMI, Gewicht, Geburtsdatum) – reine Funktionen
  pwa/          Service Worker registrieren, Update-Hinweis
  ── Basis ────────────────────────────────────────────────────────────────
  domain/       Typen, IDs, zod-Schemas, Sprach-Registry-Typen. Importiert nichts aus src/.
content/        nur Daten (Rezepte, Lebensmittel, Glossare, Locales) + Build-Skripte; importiert nur domain
```

### Regeln

1. `domain` importiert nichts aus `src/` oder `content/`. Erlaubt: `zod`.
2. Dienste importieren `domain` und untereinander nur: `nutrition` → `catalog`; `catalog` → `i18n` (nur Typen). Kein Dienst importiert React oder `app/`.
3. `health` ist rein (keine Speicher-, keine UI-Importe) und hat 100 % Zweigabdeckung.
4. `components` importieren nur `domain`-Typen, `i18n` (Hook `useT`) und andere Komponenten.
5. `pages` setzen Hooks und Komponenten zusammen, keine direkten Importe aus `storage` oder `content`.
6. Ein Provider pro Bereich, kein globaler App-Zustand. Repositories werden injiziert (Tests nutzen `Memory*Repository`).
7. Keine Zyklen, auch nicht über Typ-Importe. Tests sind ausgenommen.

### Durchsetzung (in E0, nicht später)

- `dependency-cruiser` mit Regeln 1–7, im CI-Schritt `npm run lint`.
- ESLint: `no-restricted-imports` für Regel 4/5, `react/no-danger` als Fehler.
- Stylelint mit `stylelint-use-logical` (Regel `csstools/use-logical`), wegen RTL der Zweitsprache.

## Folgen

- Jedes Issue nennt die Schicht, in der es arbeitet. Ein Agent muss nicht die ganze App lesen.
- Graphify kann später den Wirkungsradius pro Schicht zeigen (`graphify_impact`), die Regeln halten ihn klein.
