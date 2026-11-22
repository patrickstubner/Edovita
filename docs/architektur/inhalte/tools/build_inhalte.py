#!/usr/bin/env python3
"""Erzeugt foods/, glossary/ und recipes/ aus definitionen.py + Schweizer Nährwertdatenbank V7.1."""
import json, os, sys, hashlib
import openpyxl
sys.path.insert(0, os.path.dirname(__file__))
from definitionen import FOODS, RECIPES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, 'quelle', 'Schweizer_Nahrwertdatenbank_V7.1.xlsx')
LANGS = ['de', 'en', 'pt', 'ja']
COLS = {'kcal': 'Energie, Kilokalorien (kcal)', 'fat': 'Fett, total (g)', 'satFat': 'Fettsäuren, gesättigt (g)',
        'carbs': 'Kohlenhydrate, verfügbar (g)', 'sugars': 'Zucker (g)', 'fiber': 'Nahrungsfasern (g)',
        'protein': 'Protein (g)', 'salt': 'Salz (NaCl) (g)'}

def load_nwd():
    ws = openpyxl.load_workbook(XLSX, read_only=True)['Generische Lebensmittel']
    rows = list(ws.iter_rows(values_only=True)); h = rows[2]
    idx = {k: h.index(v) for k, v in COLS.items()}
    out = {}
    for r in rows[3:]:
        if r[0] is None: continue
        vals = {}
        for k, i in idx.items():
            v = r[i]
            vals[k] = float(v) if isinstance(v, (int, float)) else None   # 'k.A.' -> None
        out[int(r[0])] = {'name': r[3], 'density': r[6], 'per100g': vals,
                          'derivation': {k: r[i + 1] for k, i in idx.items()}}
    return out

def write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1); f.write('\n')

def main():
    nwd = load_nwd()
    sha = hashlib.sha256(open(XLSX, 'rb').read()).hexdigest()
    foods, gloss, status = [], {l: {} for l in LANGS}, {'ja_unsicher': [], 'pt_unsicher': []}
    for fid, (grp, nid, proxy, note, alg, alg_chk, names, ja_u, pt_u) in FOODS.items():
        f = {'id': fid, 'group': grp, 'allergens': alg, 'allergensToCheck': alg_chk}
        if nid is None:
            f.update(per100g=None, source=None, status='zu_pruefen', note=note)
        else:
            e = nwd[nid]
            f.update(per100g=e['per100g'], source={'db': 'CH-NWD', 'version': '7.1', 'ref': nid, 'name': e['name']},
                     status='zu_pruefen' if proxy else 'ok', proxy=proxy, note=note)
            if e['density']: f['density'] = e['density']
        foods.append(f)
        for l in LANGS: gloss[l][fid] = names[l]
        if ja_u: status['ja_unsicher'].append(fid)
        if pt_u: status['pt_unsicher'].append(fid)
    write(os.path.join(ROOT, 'foods', 'foods.json'), {'format': 1, 'source': {
        'name': 'Schweizer Nährwertdatenbank V 7.1 (01.07.2026), BLV, naehrwertdaten.ch',
        'license': 'Kostenlos, auch kommerziell, mit Quellenangabe (naehrwertdaten.ch/de/downloads)',
        'file': 'quelle/Schweizer_Nahrwertdatenbank_V7.1.xlsx', 'sha256': sha}, 'foods': foods})
    for l in LANGS: write(os.path.join(ROOT, 'foods', 'glossary', l + '.json'), gloss[l])
    write(os.path.join(ROOT, 'foods', 'glossary', '_status.json'), status)

    fmap = {f['id']: f for f in foods}
    summary = []
    for rid, r in RECIPES.items():
        ings, tot, missing, proxies = [], {k: 0.0 for k in COLS}, [], []
        for (fid, amt, unit, grams, flags, n_de, n_en) in r['ingredients']:
            ing = {'food': fid, 'amount': amt, 'unit': unit, 'grams': grams}
            if 'optional' in flags: ing['optional'] = True
            if 'strained' in flags: ing['strained'] = True
            if n_de: ing['noteKey'] = f'{rid}.ing.{fid}'
            ings.append(ing)
            if ing.get('optional') or ing.get('strained'): continue
            f = fmap[fid]
            if f['per100g'] is None:
                missing.append(fid); continue
            if f.get('proxy'): proxies.append(fid)
            for k in COLS:
                v = f['per100g'][k]
                if v is None: missing.append(f'{fid}:{k}')
                else: tot[k] += v * grams / 100
        per = {k: round(v / r['servings'], 1) for k, v in tot.items()}
        per['kcal'] = round(tot['kcal'] / r['servings'])
        allergens = sorted({a for i in ings if not i.get('strained') for a in fmap[i['food']]['allergens']})
        to_check = sorted({a for i in ings if not i.get('strained') for a in fmap[i['food']]['allergensToCheck']})
        recipe = {'format': 1, 'id': rid, 'cuisine': r['cuisine'], 'meal': r['meal'], 'minutes': r['minutes'],
                  'servings': r['servings'], 'tags': r['tags'], 'ingredients': ings, 'steps': len(r['steps']['de']),
                  'allergens': allergens, 'allergensToCheck': to_check,
                  'nutritionPerServing': {'values': per, 'isMinimum': bool(missing),
                                          'notIncluded': sorted(set(missing)), 'proxies': sorted(set(proxies)),
                                          'basis': 'CH-NWD 7.1, pro 100 g essbarer Anteil, roh; Garverluste nicht berücksichtigt'},
                  'review': {'status': 'zu_pruefen', 'checkedAt': '2026-11-15', 'by': 'Master Bot (Abgleich von Zutaten und Mengenverhältnissen, keine Texte übernommen)',
                             'sources': r['sources'], 'open': ['Probekochen durch einen Menschen', 'Nährwerte gegenlesen']}}
        write(os.path.join(ROOT, 'recipes', rid, 'recipe.json'), recipe)
        for l in ('de', 'en'):
            notes = {f'{rid}.ing.{i[0]}': (i[5] if l == 'de' else i[6]) for i in r['ingredients'] if i[5]}
            write(os.path.join(ROOT, 'recipes', rid, l + '.json'), {'title': r['title'][l], 'steps': r['steps'][l], 'notes': notes})
        summary.append((rid, r['title']['de'], per, missing, proxies))
    return summary

if __name__ == '__main__':
    for rid, t, per, miss, prox in main():
        print(f"{rid:14} {per['kcal']:5} kcal  P {per['protein']:5} g  F {per['fat']:5} g  KH {per['carbs']:5} g  ohne: {sorted(set(miss))}  Näherung: {prox}")
