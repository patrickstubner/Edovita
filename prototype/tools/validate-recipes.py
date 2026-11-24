#!/usr/bin/env python3
"""Prueft die Rezeptdaten (app.js-Basis + data/recipes-ext.js) so, wie die App sie nach dem Merge sieht.

Prueft: Pflichtfelder, Mahlzeit, Kueche, Titel in allen Sprachen, Zutaten-IDs im Katalog (Glossar, Gruppe,
Namen in allen Sprachen), Einheiten und Portionen, Schritte (de/en wie bestehende Rezepte), has-Tags,
kcal-Plausibilitaet (Atwater), Fotos (Dateien, Manifest, Platzhalterliste), Proteinstatistik.
Aufruf aus prototype/:  python3 tools/validate-recipes.py   (Exit 1 bei Fehlern)
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEALS = ('breakfast', 'lunch', 'dinner', 'snack')
UNITS = ('g', 'ml', 'pc', 'tbsp', 'tsp', 'pinch', 'bottle')
HAS = {'meat', 'fish', 'dairy', 'egg', 'gluten', 'nuts', 'mushrooms', 'onion', 'cilantro'}
GROUPS = {'veg', 'meat', 'dairy', 'pantry'}
ID_RE = re.compile(r'^[a-z][a-z0-9_]{1,39}$')
TARGET = {'breakfast': 15, 'snack': 15, 'lunch': 25, 'dinner': 25}


def obj(path, start_pat=None):
    s = open(os.path.join(ROOT, path), encoding='utf-8').read()
    if start_pat:
        s = s[s.index(start_pat) + len(start_pat):]
        return json.JSONDecoder().raw_decode(s.lstrip())[0]
    return json.loads(s[s.index('{'):s.rindex('}') + 1])


def main():
    err, warn = [], []
    loc = obj('locales.js')
    foods = obj('data/glossary.js')
    ext = obj('data/recipes-ext.js', 'var D =')
    langs = list(loc['res'].keys())
    app = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
    base_ids = re.findall(r"\{\s*id:\s*'([a-z0-9_]+)',\s*cui:", app[app.index('RECIPES'):app.index('RECIPE_PHOTOS')])
    m = re.search(r'RECIPE_PHOTOS\s*=\s*\{([^}]*)\}', app)
    base_photos = set(re.findall(r'([a-z0-9_]+)\s*:', m.group(1))) if m else set()

    # Merge wie merge.js.tpl
    gl = {l: dict(foods['glossary'].get(l, {})) for l in langs}
    for l, d in ext['glossary'].items():
        for k, v in d.items():
            gl.setdefault(l, {}).setdefault(k, v)
    groups = dict(foods['groups']); [groups.setdefault(k, v) for k, v in ext['groups'].items()]
    amounts = dict(foods['recipeAmounts']); [amounts.setdefault(k, v) for k, v in ext['amounts'].items()]
    steps = dict(foods['recipeSteps']); [steps.setdefault(k, v) for k, v in ext['steps'].items()]
    titles = {l: dict(loc['res'][l]['recipes']['recipes']) for l in langs}
    cuis = {l: dict(loc['res'][l]['recipes']['cuisines']) for l in langs}
    for l in langs:
        for k, v in ext['titles'].get(l, {}).items():
            titles[l].setdefault(k, v)
        for k, v in ext['cuisines'].get(l, {}).items():
            cuis[l].setdefault(k, v)

    recs = ext['recipes']
    ids = [r['id'] for r in recs]
    if len(ids) != len(set(ids)):
        err.append('doppelte Rezept-IDs')
    for b in base_ids:
        if b not in ids:
            err.append('Basisrezept fehlt in recipes-ext: ' + b)
    t_de = [titles['de'].get(i, '').strip().lower() for i in ids]
    for t in set(t_de):
        if t and t_de.count(t) > 1:
            err.append('doppelter Titel: ' + t)

    man = json.load(open(os.path.join(ROOT, 'images', 'recipes', 'manifest.json'), encoding='utf-8'))
    man_img = {i['recipeId']: i for i in man['images']}
    man_ph = {p['recipeId'] for p in man['placeholders']}
    img_dir = os.path.join(ROOT, 'images', 'recipes')
    used_foods = set()
    stats = {}
    for r in recs:
        rid = r['id']
        for k in ('id', 'cui', 'kcal', 'min', 'p', 'meal', 'has', 'pop', 'c', 'photo', 'nut'):
            if k not in r:
                err.append('%s: Feld fehlt %s' % (rid, k))
        if not ID_RE.match(rid):
            err.append('%s: ID ungueltig' % rid)
        if r.get('meal') not in MEALS:
            err.append('%s: meal ungueltig' % rid)
        for l in langs:
            if not titles[l].get(rid):
                err.append('%s: Titel fehlt (%s)' % (rid, l))
            if not cuis[l].get(r['cui']):
                err.append('%s: Kueche %s ohne Namen (%s)' % (rid, r['cui'], l))
        bad_has = set(r['has']) - HAS
        if bad_has:
            err.append('%s: has ungueltig %s' % (rid, sorted(bad_has)))
        if not (1 <= r['min'] <= 600 and 0 < r['kcal'] <= 3000 and 0 <= r['p'] <= 300):
            err.append('%s: Zahlen ausserhalb Bereich' % rid)
        n = r['nut']
        atw = 4 * n['p'] + 4 * n['c'] + 9 * n['f']
        if abs(atw - n['kcal']) > max(40, 0.15 * n['kcal']):
            err.append('%s: kcal %s passt nicht zu Makros (%.0f)' % (rid, n['kcal'], atw))
        if abs(r['kcal'] - n['kcal']) > 10 or abs(r['p'] - n['p']) > 1:
            err.append('%s: gerundete Werte weichen von nut ab' % rid)
        if r['meal'] in ('lunch', 'dinner') and not 250 <= r['kcal'] <= 1100:
            warn.append('%s: kcal %s fuer Hauptmahlzeit auffaellig' % (rid, r['kcal']))
        pack = amounts.get(rid)
        if not pack or not pack.get('items'):
            err.append('%s: keine Zutatenmengen' % rid)
        else:
            if not (isinstance(pack['servings'], int) and 1 <= pack['servings'] <= 8):
                err.append('%s: Portionen %s' % (rid, pack['servings']))
            seen = set()
            for it in pack['items']:
                fid = it['id']
                used_foods.add(fid)
                if fid in seen:
                    err.append('%s: Zutat doppelt %s' % (rid, fid))
                seen.add(fid)
                if it.get('unit') not in UNITS:
                    err.append('%s: Einheit %s' % (rid, it.get('unit')))
                if not (isinstance(it.get('amount'), (int, float)) and it['amount'] > 0):
                    err.append('%s: Menge fehlt %s' % (rid, fid))
                if not (isinstance(it.get('grams'), (int, float)) and 0 < it['grams'] <= 2000):
                    err.append('%s: Gramm unplausibel %s' % (rid, fid))
        st = steps.get(rid)
        for l in ('de', 'en'):
            if not st or len(st.get(l, [])) < 3:
                err.append('%s: weniger als 3 Schritte (%s)' % (rid, l))
        if st and len(st.get('de', [])) != len(st.get('en', [])):
            err.append('%s: Schrittzahl de/en ungleich' % rid)
        has_files = all(os.path.isfile(os.path.join(img_dir, rid + s)) for s in ('.webp', '-thumb.webp'))
        photo = r['photo'] or rid in base_photos
        if photo and not has_files:
            err.append('%s: Foto markiert, Datei fehlt' % rid)
        if has_files and not r['photo'] and rid not in base_photos:
            err.append('%s: Datei vorhanden, aber nicht als Foto markiert' % rid)
        if photo and rid not in man_img:
            err.append('%s: Foto ohne Manifest-Eintrag' % rid)
        if not photo and rid not in man_ph:
            err.append('%s: Platzhalter nicht im Manifest begruendet' % rid)
        s = stats.setdefault(r['meal'], {'n': 0, 'ok': 0, 'p': []})
        s['n'] += 1; s['p'].append(r['p']); s['ok'] += r['p'] >= TARGET[r['meal']]

    for fid in sorted(used_foods):
        if fid not in groups or groups[fid] not in GROUPS:
            err.append('Lebensmittel ohne gueltige Einkaufsgruppe: ' + fid)
        for l in langs:
            if not gl.get(l, {}).get(fid):
                err.append('Lebensmittelname fehlt: %s (%s)' % (fid, l))
    for k in man_img:
        if k not in ids:
            err.append('Manifest-Bild ohne Rezept: ' + k)

    tot = sum(os.path.getsize(os.path.join(img_dir, f)) for f in os.listdir(img_dir) if f.endswith('.webp'))
    nphoto = sum(1 for r in recs if r['photo'] or r['id'] in base_photos)
    print('Rezepte: %d  (Fotos %d, Platzhalter %d, Bilder %.1f MB)' % (len(recs), nphoto, len(recs) - nphoto, tot / 1048576))
    allok = 0
    for meal in MEALS:
        s = stats.get(meal, {'n': 0, 'ok': 0, 'p': [0]})
        p = sorted(s['p']); allok += s['ok']
        print('  %-9s %3d  Protein Median %2d g, >= %d g: %d (%d %%)' % (meal, s['n'], p[len(p) // 2], TARGET[meal], s['ok'], round(100 * s['ok'] / max(1, s['n']))))
    print('  Proteinziel erreicht: %d von %d (%d %%)' % (allok, len(recs), round(100 * allok / len(recs))))
    for w in warn:
        print('Hinweis: ' + w)
    if err:
        print('\n'.join('FEHLER: ' + e for e in err))
        sys.exit(1)
    print('ok')


if __name__ == '__main__':
    main()
