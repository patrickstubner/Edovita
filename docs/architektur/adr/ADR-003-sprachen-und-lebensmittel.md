# ADR-003: Sprachen, Lebensmittel-Übersetzungen und Zweitsprache

- **Status:** akzeptiert (Projektinhaber, 15.11.2026), Zweitsprache ohne Rechts-Gate
- **Bezug:** Decision-Log «i18n», «v1 Sprachen + PT»; Projektinhaber 07.11./10.11. (Zweitsprache); Review Befunde 1, 6; Travel Talk ADR-003 (neue Sprache = Inhalt + Registry, RTL verbindlich)

## Entscheid

### 1. Drei Arten Text, drei Orte

| Art | Ort | Rechts-Gate | Sprachen |
|---|---|---|---|
| UI, Rechtstexte, Store | `content/locales/<code>/{meta,ui,legal,store}.json` | ja (`legalApproved`) | 7 (en, de, fr, it, es, ja, pt=pt-BR); wählbar heute nur de, en |
| Rezepttexte (Titel, Schritte, Hinweise) | `content/recipes/<id>/<code>.json` | folgt UI-Sprache | wie UI |
| Lebensmittelnamen | `content/foods/glossary/<code>.json` (`{ "<FoodId>": "Name" }`) | **nein** (entschieden 15.11.) | UI-Sprachen + Zweitsprachen (Ziel ca. 25) |

Es gibt genau **einen** Lebensmittel-Katalog (`content/foods/foods.json`, IDs) und pro Sprache **ein** Glossar. `ing.*`, `produce.*`, `item.*`, `food.*`, `fooddb.*` und `recipes.ingredients` aus dem Prototyp werden darin zusammengeführt.

### 2. Registry

`content/locales/languages.json` erweitert:
```json
{ "fallback": "en",
  "ui": ["de","en","fr","it","es","ja","pt"],
  "secondary": ["de","en","pt","ja", "..."],
  "meta": { "ar": { "name": "العربية", "dir": "rtl", "locale": "ar" } } }
```
Jede Sprache hat `dir` (`ltr`/`rtl`). Eine neue Sprache braucht **nur** Inhalt + Registry-Eintrag, keinen Code. Prüfung `languages.complete.test.ts`: jede UI-Sprache hat alle Schlüssel und Platzhalter (wie `tools/build-locales.py`), jede Zweitsprache hat alle `FoodId` des Katalogs.

### 3. Zweitsprache

- Wählbar in Einkaufsliste (Chip oben) und Profil › Sprache, auch «keine».
- Angezeigt **nur** bei Zutaten (Rezept-Detail) und Einkaufsartikeln: `Brokkoli · broccoli`. Kochschritte, Titel und UI bleiben in der App-Sprache.
- Gleiche Sprache wie die App = ausgeblendet. Fehlt ein Eintrag im Glossar: nur App-Name, kein englischer Ersatz (sonst irreführend im Laden).
- Darstellung über Komponente `BilingualName` mit `<bdi lang dir>` für den Zweitnamen. Layout nur mit logischen CSS-Eigenschaften, damit Arabisch/Urdu/Persisch ohne Codeänderung gehen. Pseudo-Sprache `ar-XB` für den RTL-Test.
- Start: **de, en, pt, ja** (Projektinhaber 07.11.), vorbereitet in `inhalte/foods/glossary/`. Die Zweitsprache ist **frei wählbar ohne Rechts-Gate**, weil sie nur Lebensmittelnamen zeigt; `legalApproved` gilt weiterhin nur für die UI-Sprache. Unsichere Übersetzungen stehen in `_status.json` und werden in der App trotzdem gezeigt, bis sie gegengelesen sind.

### 4. Laufzeit

- i18next + react-i18next + i18next-icu (Decision-Log). Namespaces `ui`, `legal`, `recipes`, `foods`; Ressourcen werden pro Sprache gebündelt und lazy geladen (CSP `connect-src 'self'`).
- Gerätesprache: Basis-Abgleich (`pt-BR` → `pt`), nur freigegebene Sprachen, sonst `en` (wie `i18n.js` `detect()`).
- Zahlen, Daten, Mengen nur über `Intl` (`NumberFormat` mit `unit` wo möglich). Einheiten bleiben metrisch.
- Texte nur als React-Text, nie `dangerouslySetInnerHTML` (ESLint-Fehler).

## Folgen

- Eine neue Zweitsprache ist eine reine Inhaltsdatei (ca. 150–300 Lebensmittel), ein guter Kandidat für Übersetzung ohne Cloud Agent.
- Die UI-Locales aus dem Prototyp (1'020 Schlüssel) werden in E2 übernommen und auf die tatsächlich gebauten Screens gekürzt; ungenutzte Schlüssel fallen per Test auf.
