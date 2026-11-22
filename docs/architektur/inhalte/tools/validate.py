#!/usr/bin/env python3
"""Prüft die Edovita-Startinhalte (unabhängig vom Build). Exit 1 bei Fehlern."""
import json, os, sys, glob, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS, UI_LANGS = ['de', 'en', 'pt', 'ja'], ['de', 'en']
UNITS = {'g', 'ml', 'pc', 'tbsp', 'tsp', 'pinch'}
GROUPS = {'veg', 'fruit', 'dairy', 'meat', 'fish', 'pantry', 'spice', 'bakery', 'drinks'}
ALLERGENS = {'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soy', 'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs'}
NUTR = ['kcal', 'fat', 'satFat', 'carbs', 'sugars', 'fiber', 'protein', 'salt']
err, warn = [], []
J = lambda p: json.load(open(os.path.join(ROOT, p), encoding='utf-8'))

cat = J('foods/foods.json'); foods = {f['id']: f for f in cat['foods']}
if len(foods) != len(cat['foods']): err.append('doppelte Food-IDs')
xlsx = os.path.join(ROOT, cat['source']['file'])
if hashlib.sha256(open(xlsx, 'rb').read()).hexdigest() != cat['source']['sha256']: err.append('xlsx-Prüfsumme stimmt nicht')
# Rückverfolgung: Werte gegen die Original-xlsx
try:
    import openpyxl
    ws = openpyxl.load_workbook(xlsx, read_only=True)['Generische Lebensmittel']
    rows = list(ws.iter_rows(values_only=True)); h = rows[2]
    COL = {'kcal': 'Energie, Kilokalorien (kcal)', 'fat': 'Fett, total (g)', 'satFat': 'Fettsäuren, gesättigt (g)', 'carbs': 'Kohlenhydrate, verfügbar (g)',
           'sugars': 'Zucker (g)', 'fiber': 'Nahrungsfasern (g)', 'protein': 'Protein (g)', 'salt': 'Salz (NaCl) (g)'}
    byid = {int(r[0]): r for r in rows[3:] if r[0] is not None}
except ImportError:
    byid = None; warn.append('openpyxl fehlt: Werte nicht gegen xlsx geprüft')
for fid, f in foods.items():
    if not fid.replace('_', '').isalnum() or fid != fid.lower(): err.append(f'{fid}: ID-Format')
    if f['group'] not in GROUPS: err.append(f'{fid}: Gruppe {f["group"]}')
    for a in f['allergens'] + f['allergensToCheck']:
        if a not in ALLERGENS: err.append(f'{fid}: Allergen {a}')
    if f['per100g'] is None:
        if f['status'] != 'zu_pruefen': err.append(f'{fid}: ohne Werte, aber nicht zu_pruefen')
        continue
    if set(f['per100g']) != set(NUTR): err.append(f'{fid}: Nährwertfelder')
    if byid is not None:
        r = byid.get(f['source']['ref'])
        if r is None: err.append(f'{fid}: Ref {f["source"]["ref"]} nicht in xlsx'); continue
        if r[3] != f['source']['name']: err.append(f'{fid}: Name in xlsx weicht ab')
        for k, c in COL.items():
            v = r[h.index(c)]; v = float(v) if isinstance(v, (int, float)) else None
            if v != f['per100g'][k]: err.append(f'{fid}.{k}: {f["per100g"][k]} != xlsx {v}')
    if f.get('proxy') and f['status'] != 'zu_pruefen': err.append(f'{fid}: Näherung muss zu_pruefen sein')

for l in LANGS:
    g = J(f'foods/glossary/{l}.json')
    for fid in foods:
        if not isinstance(g.get(fid), str) or not g[fid].strip(): err.append(f'Glossar {l}: {fid} fehlt')
    for fid in g:
        if fid not in foods: err.append(f'Glossar {l}: unbekannte ID {fid}')
    for fid, v in g.items():
        if any(c in v for c in '<>&"'): err.append(f'Glossar {l}: {fid} enthält HTML-Zeichen')

rids = []
for p in sorted(glob.glob(os.path.join(ROOT, 'recipes', '*', 'recipe.json'))):
    r = json.load(open(p, encoding='utf-8')); rid = r['id']; rids.append(rid)
    if os.path.basename(os.path.dirname(p)) != rid: err.append(f'{rid}: Ordnername')
    if not (1 <= r['servings'] <= 12): err.append(f'{rid}: Portionen')
    notes_needed = set()
    for i in r['ingredients']:
        fid = i['food']
        if fid not in foods: err.append(f'{rid}: Zutat {fid} nicht im Katalog'); continue
        if i['unit'] not in UNITS: err.append(f'{rid}/{fid}: Einheit {i["unit"]}')
        if not (i['amount'] > 0 and i['grams'] > 0): err.append(f'{rid}/{fid}: Menge')
        if i['unit'] == 'g' and abs(i['grams'] - i['amount']) > 1e-9: err.append(f'{rid}/{fid}: g != grams')
        if i['unit'] == 'ml':
            d = foods[fid].get('density')
            if d is None: warn.append(f'{rid}/{fid}: ml ohne Dichte in CH-NWD (1,0 angenommen)'); d = 1.0
            if abs(i['grams'] - i['amount'] * d) > 0.01 * i['grams']: err.append(f'{rid}/{fid}: ml×Dichte != grams')
        if 'noteKey' in i: notes_needed.add(i['noteKey'])
    derived = sorted({a for i in r['ingredients'] if not i.get('strained') and i['food'] in foods for a in foods[i['food']]['allergens']})
    if derived != r['allergens']: err.append(f'{rid}: Allergene nicht abgeleitet ({r["allergens"]} vs {derived})')
    if len(r['review']['sources']) < 2: err.append(f'{rid}: weniger als 2 Quellen')
    k = r['nutritionPerServing']['values']['kcal']
    if not (100 <= k <= 1200): err.append(f'{rid}: kcal/Portion {k} unplausibel')
    for l in UI_LANGS:
        t = J(f'recipes/{rid}/{l}.json')
        if not t.get('title'): err.append(f'{rid}/{l}: Titel fehlt')
        if len(t.get('steps', [])) != r['steps']: err.append(f'{rid}/{l}: Schrittzahl {len(t.get("steps", []))} != {r["steps"]}')
        if set(t.get('notes', {})) != notes_needed: err.append(f'{rid}/{l}: Hinweis-Schlüssel stimmen nicht')
    if r['nutritionPerServing']['isMinimum']: warn.append(f'{rid}: Nährwerte unvollständig ohne {r["nutritionPerServing"]["notIncluded"]}')
    if r['nutritionPerServing']['proxies']: warn.append(f'{rid}: Näherungswerte für {r["nutritionPerServing"]["proxies"]}')

used = {i['food'] for rid in rids for i in J(f'recipes/{rid}/recipe.json')['ingredients']}
st = J('foods/glossary/_status.json')
print(f'Katalog: {len(foods)} Lebensmittel ({sum(1 for f in foods.values() if f["status"]=="ok")} ok, {sum(1 for f in foods.values() if f["status"]!="ok")} zu prüfen), in Rezepten genutzt: {len(used)}')
print(f'Glossare: {", ".join(LANGS)} je {len(foods)} Einträge; JA unsicher: {len(st["ja_unsicher"])}, PT unsicher: {len(st["pt_unsicher"])}')
print(f'Rezepte: {len(rids)} ({", ".join(rids)})')
for w in warn: print('WARNUNG', w)
for e in err: print('FEHLER', e)
print('ERGEBNIS:', 'OK' if not err else f'{len(err)} Fehler'); sys.exit(1 if err else 0)
