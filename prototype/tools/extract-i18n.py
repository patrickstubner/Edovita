#!/usr/bin/env python3
"""Einmal-Werkzeug: versieht sichtbare deutsche Texte in index.html mit data-i18n-Schlüsseln
und schreibt sie nach tools/html-strings-de.json. Idempotent: bereits markierte Elemente werden übersprungen."""
import json, re, sys, unicodedata
from html.parser import HTMLParser
SRC = 'index.html'
src = open(SRC, encoding='utf-8').read()
lines = src.split('\n'); offs = [0]
for l in lines: offs.append(offs[-1] + len(l) + 1)
VOID = {'meta','link','img','input','br','hr','use','path','circle','rect','polyline','polygon','stop','line'}
SKIP_IDS = {'restSub','profSub','adaptT','adaptX','proteinMsg','waterGl','waterMsg','dinnerName','dinnerKcal','fastTxt','wkThree','wkWeight','wkAdapt','wkBetter','timerTxt','fatChip','fHint','hcTxt','scTxt','ewTxt','themeNote','rwTitle','rwText','ringLbl','ringNum','notifT','notifX','barFitT','barFitX','afterTxt','totalKcal','proTxt','todayDate','detectT','detectX','bkTxt','recSub','partnerView','waterNow'}
ATTRS = ['aria-label','data-title','data-toast','placeholder']
def slug(t):
    t = unicodedata.normalize('NFKD', t.replace('ß','ss')).encode('ascii','ignore').decode().lower()
    w = re.findall(r'[a-z0-9]+', t)
    return '_'.join(w[:4]) or 'x'
class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.stack=[]; s.ins=[]; s.strings={}; s.bytext={}; s.multi=[]; s.section='app'
    def key(s, text):
        if text in s.bytext: return s.bytext[text]
        base = s.section + '.' + slug(text); k = base; n = 2
        while k in s.strings: k = '%s_%d' % (base, n); n += 1
        s.strings[k] = text; s.bytext[text] = k; return k
    def handle_starttag(s, tag, attrs):
        a = dict(attrs); pos = offs[s.getpos()[0]-1] + s.getpos()[1]
        if tag == 'section' and a.get('id'): s.section = a['id']
        if tag == 'nav': s.section = 'nav'
        insvg = any(e['tag'] == 'svg' for e in s.stack) or tag == 'svg'
        ent = {'tag': tag, 'pos': pos, 'a': a, 'texts': [], 'svg': insvg}
        if not insvg:
            pairs = []
            for at in ATTRS:
                v = a.get(at)
                if v and re.search(r'[A-Za-zÄÖÜäöü]', v) and v != 'Edovita' and 'data-i18n-a' not in a:
                    pairs.append(at + '=' + s.key(v))
            if pairs: s.ins.append((pos + 1 + len(tag), ' data-i18n-a="%s"' % '|'.join(pairs)))
        if tag in VOID: return
        s.stack.append(ent)
    def handle_startendtag(s, tag, attrs): s.handle_starttag(tag, attrs)
    def handle_endtag(s, tag):
        while s.stack:
            e = s.stack.pop()
            if e['tag'] == tag: break
        else: return
        if e['svg'] or tag in ('script','style','title','output'): return
        a = e['a']
        if 'data-i18n' in a or 'data-bind' in a or 'data-remtx' in a or a.get('id') in SKIP_IDS: return
        t = [x for x in e['texts'] if re.search(r'[A-Za-zÄÖÜäöü]', x)]
        if not t: return
        if len(t) > 1: s.multi.append((e['pos'], t)); return
        txt = re.sub(r'\s+', ' ', t[0]).strip()
        if txt in ('Edovita', 'kcal', 'ml', 'g', 'kg', 'BMI', '%'): return
        s.ins.append((e['pos'] + 1 + len(tag), ' data-i18n="%s"' % s.key(txt)))
    def handle_data(s, d):
        if s.stack and d.strip(): s.stack[-1]['texts'].append(d)
p = P(); p.feed(src)
if p.multi:
    for pos, t in p.multi: print('MEHRFACH-TEXT bei', src[pos:pos+60].replace('\n',' '), t, file=sys.stderr)
out = src
for pos, txt in sorted(p.ins, key=lambda x: -x[0]): out = out[:pos] + txt + out[pos:]
if '--write' in sys.argv:
    open(SRC, 'w', encoding='utf-8').write(out)
    json.dump(p.strings, open('tools/html-strings-de.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(p.strings), 'Texte,', len(p.ins), 'Einfügungen,', len(p.multi), 'Mehrfach')
