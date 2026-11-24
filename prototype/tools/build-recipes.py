#!/usr/bin/env python3
"""Erzeugt data/recipes-ext.js aus tools/recipes-src/ (Lebensmittel, Kuechen, Rezepte).

Naehrwerte werden aus den Zutatenmengen berechnet (nicht von Hand gesetzt).
Aufruf aus prototype/:  python3 tools/build-recipes.py
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'recipes-src')
LANGS = ['de', 'en', 'fr', 'it', 'es', 'pt', 'ja']
STEP_LANGS = ['de', 'en']
MEALS = ('breakfast', 'lunch', 'dinner', 'snack')
UNITS = ('g', 'ml', 'pc', 'tbsp', 'tsp', 'pinch')
HAS_KEYS = ('meat', 'fish', 'dairy', 'egg', 'gluten', 'nuts', 'mushrooms', 'onion', 'cilantro')
DEFAULT_UNIT_G = {'tbsp': 15.0, 'tsp': 5.0, 'pinch': 0.5, 'ml': 1.0}
EXISTING = ['oven_salmon', 'quinoa_pan', 'thai_curry', 'pho', 'summer_rolls', 'birchermuesli', 'yogurt_bowl',
            'lentil_curry', 'scrambled_eggs', 'chicken_bowl', 'mushroom_polenta', 'hummus_wrap', 'miso_salmon',
            'shakshuka', 'burrito_bowl']
ID_RE = re.compile(r'^[a-z][a-z0-9_]{1,39}$')


def load_edo_foods():
    s = open(os.path.join(ROOT, 'data', 'glossary.js'), encoding='utf-8').read()
    return json.loads(s[s.index('{'):s.rindex('}') + 1])


def load_locales():
    s = open(os.path.join(ROOT, 'locales.js'), encoding='utf-8').read()
    return json.loads(s[s.index('{'):s.rindex('}') + 1])


def parse_foods():
    foods = {}
    for ln, line in enumerate(open(os.path.join(SRC, 'foods.txt'), encoding='utf-8'), 1):
        line = line.rstrip('\n')
        if not line.strip() or line.startswith('#'):
            continue
        p = line.split('|')
        if len(p) != 12:
            sys.exit('foods.txt:%d: %d Felder statt 12' % (ln, len(p)))
        fid, grp, nut, tags, units = p[:5]
        kcal, prot, carb, fat = [float(x) for x in nut.split(',')]
        u = dict(DEFAULT_UNIT_G)
        if units:
            for kv in units.split(','):
                k, v = kv.split('=')
                u[k] = float(v)
        foods[fid] = {'grp': grp, 'kcal': kcal, 'p': prot, 'c': carb, 'f': fat,
                      'tags': [t for t in tags.split(',') if t], 'u': u,
                      'names': dict(zip(LANGS, p[5:12])), 'line': ln}
    return foods


def parse_cuisines():
    out = {}
    for line in open(os.path.join(SRC, 'cuisines.txt'), encoding='utf-8'):
        if not line.strip() or line.startswith('#'):
            continue
        p = line.rstrip('\n').split('|')
        out[p[0]] = dict(zip(LANGS, p[1:8]))
    return out


AMT_RE = re.compile(r'^([a-z0-9_]+)\s+([0-9]+(?:\.[0-9]+)?)\s*(g|ml|pc|tbsp|tsp|pinch)$')


def parse_recipes():
    recs, order = {}, []
    for path in sorted(glob.glob(os.path.join(SRC, 'recipes-*.txt'))):
        cur = None
        for ln, raw in enumerate(open(path, encoding='utf-8'), 1):
            line = raw.strip()
            if not line or line.startswith('#'):
                continue
            where = '%s:%d' % (os.path.basename(path), ln)
            if line.startswith('@'):
                p = [x.strip() for x in line[1:].split('|')]
                if len(p) < 5:
                    sys.exit(where + ': Kopfzeile braucht id|meal|cui|min|servings')
                rid = p[0]
                if rid in recs:
                    sys.exit(where + ': doppelte id ' + rid)
                cur = {'id': rid, 'meal': p[1], 'cui': p[2], 'min': int(p[3]), 'servings': int(p[4]),
                       'pop': int(p[5]) if len(p) > 5 and p[5] else None, 'titles': {}, 'items': [],
                       'steps': {}, 'q': '', 'src': where}
                recs[rid] = cur
                order.append(rid)
                continue
            if cur is None:
                sys.exit(where + ': Zeile ausserhalb eines Rezepts')
            key, _, val = line.partition(':')
            key, val = key.strip(), val.strip()
            if key in LANGS:
                cur['titles'][key] = val
            elif key == 'i':
                for part in [x.strip() for x in val.split(',') if x.strip()]:
                    m = AMT_RE.match(part)
                    if not m:
                        sys.exit(where + ': Zutat nicht lesbar: ' + part)
                    cur['items'].append((m.group(1), float(m.group(2)), m.group(3)))
            elif key in ('sd', 'se'):
                cur['steps']['de' if key == 'sd' else 'en'] = [s.strip() for s in val.split(' | ') if s.strip()]
            elif key == 'q':
                cur['q'] = val
            else:
                sys.exit(where + ': unbekannter Schluessel ' + key)
    return recs, order


def grams_of(food, amount, unit):
    if unit == 'g':
        return amount
    if unit == 'ml':
        return amount * food['u'].get('ml', 1.0)
    if unit == 'pc':
        if 'pc' not in food['u']:
            raise ValueError('kein Stueckgewicht')
        return amount * food['u']['pc']
    return amount * food['u'].get(unit, DEFAULT_UNIT_G[unit])


def r1(x):
    return round(x + 1e-9, 1)


def main():
    edo = load_edo_foods()
    loc = load_locales()
    foods = parse_foods()
    cuis = parse_cuisines()
    recs, order = parse_recipes()
    errors = []
    gl = edo['glossary']

    # Lebensmittel: Glossar und Gruppen
    gloss_add = {l: {} for l in LANGS}
    groups_add = {}
    for fid, f in foods.items():
        if not ID_RE.match(fid):
            errors.append('Lebensmittel-ID ungueltig: ' + fid)
        exists = fid in gl.get('de', {})
        for l in LANGS:
            have = gl.get(l, {}).get(fid)
            name = f['names'][l]
            if have:
                continue
            if name == '-' or not name:
                errors.append('Name fehlt: %s/%s' % (fid, l))
                continue
            gloss_add[l][fid] = name
        if not exists:
            groups_add[fid] = f['grp']
        elif edo['groups'].get(fid) != f['grp']:
            errors.append('Gruppe abweichend: %s (%s statt %s)' % (fid, f['grp'], edo['groups'].get(fid)))

    existing_cuis = set(loc['res']['en']['recipes']['cuisines'].keys())
    meta, amounts, steps, titles = [], {}, {}, {l: {} for l in LANGS}
    report = []
    colors = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']
    img_dir = os.path.join(ROOT, 'images', 'recipes')
    for n, rid in enumerate(order):
        r = recs[rid]
        is_old = rid in EXISTING
        if not ID_RE.match(rid):
            errors.append('Rezept-ID ungueltig: ' + rid)
        if r['meal'] not in MEALS:
            errors.append('%s: meal %s' % (rid, r['meal']))
        if r['cui'] not in existing_cuis and r['cui'] not in cuis:
            errors.append('%s: Kueche unbekannt %s' % (rid, r['cui']))
        if not is_old:
            for l in LANGS:
                if not r['titles'].get(l):
                    errors.append('%s: Titel fehlt (%s)' % (rid, l))
                else:
                    titles[l][rid] = r['titles'][l]
        old_amt = edo['recipeAmounts'].get(rid)
        if old_amt and not r['items']:
            items = [(it['id'], it['amount'], it['unit'], it['grams']) for it in old_amt['items']]
            servings = old_amt['servings']
        else:
            items, servings = [], r['servings']
            for fid, amt, unit in r['items']:
                f = foods.get(fid)
                if not f:
                    errors.append('%s: Lebensmittel unbekannt %s' % (rid, fid))
                    continue
                try:
                    g = grams_of(f, amt, unit)
                except ValueError as e:
                    errors.append('%s: %s %s' % (rid, fid, e))
                    continue
                items.append((fid, amt, unit, r1(g)))
            amounts[rid] = {'servings': servings,
                            'items': [{'id': a, 'amount': (int(b) if float(b).is_integer() else b), 'unit': c, 'grams': (int(d) if float(d).is_integer() else d)} for a, b, c, d in items]}
        if not items:
            errors.append('%s: keine Zutaten' % rid)
        ids = [x[0] for x in items]
        if len(ids) != len(set(ids)):
            errors.append('%s: Zutat doppelt' % rid)
        tot = {'kcal': 0.0, 'p': 0.0, 'c': 0.0, 'f': 0.0}
        tags = set()
        for fid, amt, unit, g in items:
            f = foods.get(fid)
            if not f:
                errors.append('%s: Naehrwerte fehlen fuer %s' % (rid, fid))
                continue
            for k in tot:
                tot[k] += f[k] * g / 100.0
            tags.update(t for t in f['tags'] if t in HAS_KEYS)
        per = {k: v / servings for k, v in tot.items()}
        kcal = int(round(per['kcal'] / 10.0) * 10)
        prot = int(round(per['p']))
        if r['steps'] or not is_old:
            for l in STEP_LANGS:
                if len(r['steps'].get(l, [])) < 3:
                    errors.append('%s: zu wenige Schritte (%s)' % (rid, l))
            if r['steps']:
                steps[rid] = {l: r['steps'][l] for l in STEP_LANGS if l in r['steps']}
        has = sorted(tags)
        photo = os.path.isfile(os.path.join(img_dir, rid + '.webp')) and os.path.isfile(os.path.join(img_dir, rid + '-thumb.webp'))
        m = {'id': rid, 'cui': r['cui'], 'kcal': kcal, 'min': r['min'], 'p': prot, 'meal': r['meal'], 'has': has,
             'pop': r['pop'] if r['pop'] else 6, 'c': colors[n % 6], 'photo': photo,
             'nut': {'kcal': int(round(per['kcal'])), 'p': r1(per['p']), 'c': r1(per['c']), 'f': r1(per['f'])}}
        meta.append(m)
        report.append(m)

    new_cuis = {l: {k: v[l] for k, v in cuis.items() if k not in existing_cuis} for l in LANGS}
    if errors:
        print('\n'.join(errors))
        sys.exit('%d Fehler' % len(errors))

    data = {'v': 1, 'recipes': meta, 'titles': titles, 'cuisines': new_cuis, 'glossary': gloss_add,
            'groups': groups_add, 'amounts': amounts, 'steps': steps}
    js = ('/* Generiert von tools/build-recipes.py – nicht von Hand aendern. Quelle: tools/recipes-src/ */\n'
          '(function () {\n  \'use strict\';\n  var D = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n' +
          open(os.path.join(SRC, 'merge.js.tpl'), encoding='utf-8').read() + '})();\n')
    open(os.path.join(ROOT, 'data', 'recipes-ext.js'), 'w', encoding='utf-8').write(js)
    json.dump({'recipes': report}, open(os.path.join(SRC, 'build-report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok: %d Rezepte (%d neu), %d neue Lebensmittel, data/recipes-ext.js %d Bytes' % (
        len(meta), len([x for x in order if x not in EXISTING]), len(groups_add), len(js.encode('utf-8'))))


if __name__ == '__main__':
    main()
