#!/usr/bin/env python3
"""Edovita-Prototyp: baut locales/<code>/{meta,ui,legal,recipes,store}.json und das Bündel locales.js.

Quelle:   tools/i18n-src/keys.json (Schlüsselreihenfolge), <code>.txt ("N|Text" pro Zeile), content.py
Prüfung:  gegen Englisch (Fallback): fehlende/überzählige Schlüssel, Platzhalter-Abweichungen, Klammer-Balance.
Ausgabe:  locales/…/*.json, locales/languages.json, locales.js (window.EDO_LOCALES, kein fetch nötig wegen CSP).
Aufruf:   python3 tools/build-locales.py           (bricht bei Fehlern mit Exit 1 ab)
"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(HERE, 'i18n-src')
sys.path.insert(0, SRC)
import content as C  # noqa: E402

ACTIVE = ['de', 'en', 'fr', 'it', 'es', 'ja', 'pt']  # pt (Basis pt-BR) seit 6.11.2026 in v1
FALLBACK = 'en'
APPROVED = ['de', 'en']  # Entscheid 6.11.2026: nur DE/EN wählbar bis zur Prüfung
keys = json.load(open(os.path.join(SRC, 'keys.json'), encoding='utf-8'))
errors, warns = [], []

def load_txt(code):
    out = {}
    with open(os.path.join(SRC, code + '.txt'), encoding='utf-8') as f:
        for ln, line in enumerate(f, 1):
            line = line.rstrip('\n')
            if not line:
                continue
            m = re.match(r'^(\d+)\|(.*)$', line)
            if not m:
                errors.append(f'{code}.txt:{ln}: Zeile ohne "N|"'); continue
            n = int(m.group(1))
            if n != ln:
                errors.append(f'{code}.txt:{ln}: Nummer {n} passt nicht zur Zeile')
            if not 1 <= n <= len(keys):
                errors.append(f'{code}.txt:{ln}: Nummer {n} ausserhalb'); continue
            out[keys[n - 1]] = m.group(2)
    return out

def names(s):
    return sorted(set(re.findall(r'\{\s*([A-Za-z_]\w*)\s*[,}]', s)))

def balanced(s):
    d = 0
    for ch in s:
        d += ch == '{'; d -= ch == '}'
        if d < 0: return False
    return d == 0

ui = {c: load_txt(c) for c in ACTIVE}
en = ui[FALLBACK]
for c in ACTIVE:
    u = ui[c]
    miss = [k for k in keys if k not in u]
    if c == FALLBACK and miss:
        errors.append(f'{c}: {len(miss)} Schlüssel fehlen im Fallback')
    elif miss:
        warns.append(f'{c}: {len(miss)} Schlüssel fehlen (Fallback Englisch)')
    for k, v in u.items():
        if not balanced(v):
            errors.append(f'{c}:{k}: Klammern unausgeglichen')
        if k in en and names(v) != names(en[k]):
            errors.append(f'{c}:{k}: Platzhalter {names(v)} ≠ en {names(en[k])}')
        if '<' in v and re.search(r'<\s*/?\s*[a-zA-Z]', v):
            errors.append(f'{c}:{k}: sieht nach HTML aus (nicht erlaubt)')

def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1); f.write('\n')

bundle = {'languages': {'fallback': FALLBACK, 'active': ACTIVE, 'planned': C.PLANNED}, 'res': {}}
for c in ACTIVE:
    m = C.META[c]
    meta = {'code': c, 'name': m['name'], 'englishName': m['englishName'], 'locale': m['locale'], 'direction': 'ltr',
            'fallback': FALLBACK, 'units': 'metric', 'font': m.get('font', 'system'), 'reviewed': c == 'de',
            'legalApproved': c in APPROVED, 'legalNote': 'Prototyp-Simulation, Anwaltsprüfung offen' if c in APPROVED else 'In Prüfung, nicht wählbar'}
    if m.get('variant'):
        meta['variant'] = m['variant']; meta['variantNote'] = m['variantNote']
    r, cu, ing, fo = C.REC[c]
    for lst, ids, nm in ((r, C.R_IDS, 'recipes'), (cu, C.C_IDS, 'cuisines'), (ing, C.I_IDS, 'ingredients'), (fo, C.F_IDS, 'foods')):
        if len(lst) != len(ids):
            errors.append(f'{c}: recipes.json/{nm}: {len(lst)} statt {len(ids)} Einträge')
    rec = {'recipes': dict(zip(C.R_IDS, r)), 'cuisines': dict(zip(C.C_IDS, cu)), 'ingredients': dict(zip(C.I_IDS, ing)), 'foods': dict(zip(C.F_IDS, fo))}
    uio = {k: ui[c][k] for k in keys if k in ui[c]}
    files = {'meta': meta, 'ui': uio, 'legal': C.LEGAL[c], 'recipes': rec, 'store': C.STORE[c]}
    for name, obj in files.items():
        write(os.path.join(ROOT, 'locales', c, name + '.json'), obj)
    bundle['res'][c] = files
write(os.path.join(ROOT, 'locales', 'languages.json'), bundle['languages'])

if errors:
    print(f'FEHLER ({len(errors)}):'); [print('  ' + e) for e in errors[:60]]; sys.exit(1)
js = json.dumps(bundle, ensure_ascii=False, separators=(',', ':')).replace('\u2028', '\\u2028').replace('\u2029', '\\u2029').replace('</', '<\\/')
with open(os.path.join(ROOT, 'locales.js'), 'w', encoding='utf-8') as f:
    f.write('/* Generiert von tools/build-locales.py – nicht von Hand ändern. Quelle: locales/<code>/*.json */\n')
    f.write('window.EDO_LOCALES = ' + js + ';\n')
print(f'OK: {len(ACTIVE)} Sprachen, {len(keys)} UI-Schlüssel, Fallback {FALLBACK}')
for c in ACTIVE:
    print(f'  {c}: {len(ui[c])}/{len(keys)} Texte ({round(len(ui[c]) / len(keys) * 100)} %), reviewed={c == "de"}')
for w in warns: print('Hinweis: ' + w)
print(f'locales.js: {os.path.getsize(os.path.join(ROOT, "locales.js"))} Bytes')
