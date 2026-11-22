#!/usr/bin/env python3
"""Erzeugt die Edovita-Logo-Animation (Zusammenbau -> Herzschlag lub-dub mit EKG-Linie -> Zerfall -> Loop).
Ausgabe: logo-anim.css (geteilt mit dem Prototyp), edovita_logo_animation.html (standalone),
splash-Markup fuer den Prototyp (wird in prototype/index.html zwischen den Markern ersetzt; Ausgabe nur innerhalb des Repos).
Quelle des Logos: ../final/edovita_logo.svg (Gruppen #leaf #midrib #veins #fork #heart #pulse #wordmark #symbol)."""
import re, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))

def _inside_repo(path):
    """Verweigert Schreibpfade ausserhalb des Repo-Stamms."""
    ap = os.path.abspath(path)
    prefix = os.path.join(ROOT, '')
    if not (ap == ROOT or ap.startswith(prefix)):
        raise SystemExit('Ausgabe ausserhalb des Repos verweigert: ' + ap)
    return ap

SRC = open(os.path.join(HERE, '..', 'final', 'edovita_logo.svg')).read()
T = 7.2  # Loop-Dauer in Sekunden
BEAT0, BEAT = 2.8, 0.9  # Start des ersten Herzschlags, Dauer eines Schlags (ca. 67/min)
NBEATS = 3

# ---------- Markup ----------
def markup(cls='alogo'):
    body = SRC[SRC.index('<g id="symbol"'):SRC.rindex('</svg>')]
    body = body.replace('url(#g)', 'url(#edg)').replace('url(#shade)', 'url(#edshade)')
    mot_open = re.search(r'<g transform="translate\(280,282\)[^>]*>', body).group(0)
    rect = re.search(r'<rect id="bg"[^>]*/>', body).group(0)
    fork = body[body.index('<g id="fork"'):body.index('<g id="leaf"')]
    leaf = body[body.index('<g id="leaf"'):body.index('<g id="heart"')]
    hi = body.index('<g id="heart"'); he = body.index('</g>', body.index('<polyline', hi)) + 4
    heart = body[hi:he]
    wm = body[body.index('<g id="wordmark"'):body.rindex('</g>') + 4]
    leaf = leaf.replace('<path id="midrib"', '<path id="midrib" pathLength="1"')
    leaf = re.sub(r'(<g id="veins"[^>]*>)(.*?)(</g>)', lambda m: m.group(1) + m.group(2).replace('<path ', '<path pathLength="1" ') + m.group(3), leaf, flags=re.S)
    pulse = re.search(r'<polyline id="pulse"[^>]*/>', heart).group(0)
    heart = heart.replace(pulse, pulse.replace('<polyline id="pulse"', '<polyline id="pulse" class="a-pulse" pathLength="1"')
                          + pulse.replace('<polyline id="pulse"', '<polyline class="a-sweep" pathLength="1"'))
    wm = wm.replace('<path ', '<path class="wl" ')
    return ('<svg class="%s" viewBox="0 0 1024 967" aria-hidden="true">'
            '<g id="symbol" transform="translate(162.0,50) scale(1.25)"><g class="a-bg">%s</g>%s<g class="a-fork">%s</g><g class="a-leaf">%s</g><g class="a-heart">%s</g></g></g>'
            '<g class="a-word">%s</g></svg>') % (cls, rect, mot_open, fork, leaf, heart, wm)

GRAD = ('<linearGradient id="edg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8D930"/><stop offset=".5" stop-color="#5CC75F"/><stop offset="1" stop-color="#12B9A8"/></linearGradient>'
        '<linearGradient id="edshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4F2EA" stop-opacity=".9"/><stop offset="1" stop-color="#D3E8DC" stop-opacity=".9"/></linearGradient>')

# ---------- Keyframes ----------
def pct(t): return ('%.3f' % (t / T * 100)).rstrip('0').rstrip('.') + '%'
def keyframes(name, steps):
    """steps: [(t, 'css', easing_zur_naechsten_Stufe|None)]; vor dem ersten/nach dem letzten Schritt gilt dessen Zustand."""
    steps = sorted(steps, key=lambda s: s[0])
    if steps[0][0] > 0: steps.insert(0, (0, steps[0][1], None))
    if steps[-1][0] < T: steps.append((T, steps[-1][1], None))
    out = ['@keyframes %s{' % name]
    for t, css, ease in steps:
        out.append('%s{%s%s}' % (pct(t), css, ';animation-timing-function:%s' % ease if ease else ''))
    out.append('}')
    return '\n'.join(out)
EO = 'cubic-bezier(.2,.9,.3,1)'; EB = 'cubic-bezier(.2,.9,.3,1.25)'; EI = 'cubic-bezier(.5,0,.9,.6)'; LIN = 'linear'; ES = 'ease-in-out'
H = 'opacity:0;'
anims = []   # (selector, name, extra)
kfs = []
def add(sel, name, steps, origin=None):
    kfs.append(keyframes(name, steps))
    anims.append('%s{animation:%s %ss linear infinite%s}' % (sel, name, T, ';transform-box:fill-box;transform-origin:%s' % origin if origin else ''))

# Hintergrundkachel
add('.alogo .a-bg', 'e-bg', [(0, H + 'transform:scale(.7)', EB), (.55, 'opacity:1;transform:scale(1)', None), (6.3, 'opacity:1;transform:scale(1)', EI), (6.95, H + 'transform:scale(.8)', None)], 'center')
# Gabel
add('.alogo .a-fork', 'e-fork', [(.35, H + 'transform:translate(70px,60px) rotate(14deg)', EO), (1.0, 'opacity:1;transform:none', None), (6.05, 'opacity:1;transform:none', EI), (6.7, H + 'transform:translate(110px,80px) rotate(28deg)', None)], '10% 95%')
# Blatt
add('.alogo .a-leaf', 'e-leaf', [(.55, H + 'transform:scale(.1)', EB), (1.25, 'opacity:1;transform:scale(1)', None), (5.95, 'opacity:1;transform:none', EI), (6.6, H + 'transform:translate(-130px,70px) rotate(-38deg) scale(.8)', None)], '90% 95%')
# Mittelrippe und Adern (zeichnen sich)
D = 'stroke-dasharray:1 2;'
add('.alogo #midrib', 'e-rib', [(1.05, D + 'stroke-dashoffset:1', LIN), (1.5, D + 'stroke-dashoffset:0', None), (5.8, D + 'stroke-dashoffset:0', LIN), (6.05, D + 'stroke-dashoffset:1', None)])
add('.alogo #veins path', 'e-vein', [(1.35, D + 'stroke-dashoffset:1', LIN), (1.8, D + 'stroke-dashoffset:0', None), (5.8, D + 'stroke-dashoffset:0', LIN), (6.0, D + 'stroke-dashoffset:1', None)])
# Herz: Auftauchen, Herzschlag (lub-dub), Zerfall
hs = [(1.4, H + 'transform:scale(0)', EB), (1.75, 'opacity:1;transform:scale(1.2)', ES), (1.95, 'opacity:1;transform:scale(1)', None)]
for i in range(NBEATS):
    c = BEAT0 + i * BEAT
    hs += [(c + .00, 'opacity:1;transform:scale(1)', 'ease-out'), (c + .22, 'opacity:1;transform:scale(1)', 'ease-out'),
           (c + .30, 'opacity:1;transform:scale(1.17)', 'ease-in-out'), (c + .43, 'opacity:1;transform:scale(1)', 'ease-out'),
           (c + .50, 'opacity:1;transform:scale(1)', 'ease-out'), (c + .57, 'opacity:1;transform:scale(1.10)', 'ease-in-out'), (c + .71, 'opacity:1;transform:scale(1)', None)]
end = BEAT0 + NBEATS * BEAT
hs += [(end + .35, 'opacity:1;transform:scale(1)', EB), (end + .5, 'opacity:1;transform:scale(1.12)', EI), (6.45, H + 'transform:translate(0,-40px) scale(0)', None)]
add('.alogo .a-heart', 'e-heart', hs, 'center')
# EKG-Linie: zeichnet sich, wird waehrend der Schlaege gedimmt, Sweep laeuft als heller Strahl durch
P = 'stroke-dasharray:1 2;'
ps = [(1.8, P + 'stroke-dashoffset:1;opacity:1', LIN), (2.35, P + 'stroke-dashoffset:0;opacity:1', None), (BEAT0 - .05, P + 'stroke-dashoffset:0;opacity:1', 'ease-in-out'),
      (BEAT0 + .15, P + 'stroke-dashoffset:0;opacity:.35', None), (end - .05, P + 'stroke-dashoffset:0;opacity:.35', 'ease-in-out'), (end + .2, P + 'stroke-dashoffset:0;opacity:1', None),
      (end + .6, P + 'stroke-dashoffset:0;opacity:1', LIN), (end + .9, P + 'stroke-dashoffset:1;opacity:1', None)]
add('.alogo .a-pulse', 'e-pulse', ps)
SW = 'stroke-dasharray:.28 2;'
sw = [(0, SW + 'stroke-dashoffset:.28;opacity:0', None)]
for i in range(NBEATS):
    c = BEAT0 + i * BEAT
    sw += [(c, SW + 'stroke-dashoffset:.28;opacity:1', LIN), (c + .62, SW + 'stroke-dashoffset:-1;opacity:1', None), (c + .63, SW + 'stroke-dashoffset:-1;opacity:0', None)]
    if i < NBEATS - 1: sw += [(c + BEAT - .01, SW + 'stroke-dashoffset:.28;opacity:0', None)]
add('.alogo .a-sweep', 'e-sweep', sw)
# Schriftzug: Buchstaben erscheinen nacheinander, am Ende verschwinden sie wieder
add('.alogo .a-word', 'e-word', [(1.95, 'transform:translateY(16px)', EO), (2.75, 'transform:none', None), (5.55, 'transform:none', EI), (6.3, 'transform:translateY(26px)', None)])
for i in range(7):
    a = 2.0 + .09 * i; z = 5.55 + .05 * i
    kfs.append(keyframes('e-l%d' % i, [(a, 'opacity:0', EO), (a + .35, 'opacity:1', None), (z, 'opacity:1', EI), (z + .4, 'opacity:0', None)]))
    anims.append('.alogo .wl:nth-child(%d){animation:e-l%d %ss linear infinite}' % (i + 1, i, T))

CSS = '''/* Edovita Logo-Animation, erzeugt von build_animation.py. Loop %ss: Zusammenbau 0-2.8 s, Herzschlag %.1f-%.1f s (lub-dub, EKG-Strahl), Zerfall bis 6.95 s.
   Farben: Symbol bleibt in beiden Modi gleich; nur der Schriftzug wechselt (--wm). Ohne Animation (prefers-reduced-motion) wird das fertige Logo gezeigt. */
.alogo{display:block;width:100%%;height:auto;overflow:visible;--wm:#0B6633}
html[data-eff=dark] .alogo,.alogo.dark{--wm:#fff}
.alogo #wordmark{fill:var(--wm)}
.alogo .a-sweep{fill:none;stroke:#fff;stroke-width:10;stroke-linecap:round;stroke-linejoin:round;opacity:0}
.alogo.once *{animation-iteration-count:1!important}
.alogo.once .a-sweep{opacity:0}
''' % (T, BEAT0, end) + '\n'.join(anims) + '\n' + '\n'.join(kfs) + '''
@media (prefers-reduced-motion:reduce){.alogo,.alogo *{animation:none!important}.alogo .a-sweep{display:none}}
'''
open(_inside_repo(os.path.join(HERE, 'logo-anim.css')), 'w').write(CSS)

# ---------- Standalone-HTML ----------
LOGO = markup()
HTML = '''<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Edovita – Logo-Animation</title>
<style>
:root{--bg:#fff;--fg:#14211F}
html[data-eff=dark]{--bg:#000;--fg:#E9F1EF}
*{box-sizing:border-box}
.sp{position:absolute}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{width:min(92vw,560px);padding:24px 0}
.ctl{display:flex;gap:10px;justify-content:center;margin-top:18px}
.ctl button{font:inherit;font-weight:600;color:var(--fg);background:transparent;border:1.5px solid currentColor;border-radius:22px;padding:8px 16px;min-height:44px;cursor:pointer;opacity:.8}
body.bare .ctl{display:none}
%s
</style>
</head>
<body>
<svg width="0" height="0" class="sp" aria-hidden="true"><defs>%s</defs></svg>
<main role="img" aria-label="Edovita Logo: setzt sich zusammen, das Herz schlägt, das Logo löst sich auf – im Loop">
%s
<div class="ctl"><button id="th">Hell / Dunkel</button><button id="rs">Neu starten</button></div>
</main>
<script>
(function(){
  'use strict';
  var d=document.documentElement,q=new URLSearchParams(location.search);
  var mq=matchMedia('(prefers-color-scheme: dark)');
  var forced=q.get('theme')==='dark'||q.get('theme')==='light'?q.get('theme'):null;
  function apply(){d.setAttribute('data-eff',forced||(mq.matches?'dark':'light'));}
  apply(); if(mq.addEventListener) mq.addEventListener('change',apply);
  if(q.get('bare')==='1') document.body.className='bare';
  if(q.get('once')==='1') document.querySelector('.alogo').classList.add('once');
  document.getElementById('th').addEventListener('click',function(){forced=d.getAttribute('data-eff')==='dark'?'light':'dark';apply();});
  document.getElementById('rs').addEventListener('click',function(){document.getAnimations().forEach(function(a){a.currentTime=0;a.play();});});
  /* Fuer Vorschau-Rendering: window.edoSeek(sekunden) friert die Animation an einer Stelle ein. */
  window.edoSeek=function(t){document.getAnimations().forEach(function(a){a.pause();a.currentTime=t*1000;});};
})();
</script>
</body>
</html>
''' % (CSS, GRAD, LOGO)
# CSP per Hash (kein unsafe-inline): Inline-<style> und -<script> werden mit ihrem SHA-256 freigegeben
import hashlib, base64
def sri(x): return "'sha256-" + base64.b64encode(hashlib.sha256(x.encode('utf-8')).digest()).decode() + "'"
sty = re.search(r'<style>(.*?)</style>', HTML, re.S).group(1); scr = re.search(r'<script>(.*?)</script>', HTML, re.S).group(1)
csp = "default-src 'none'; style-src %s; script-src %s; img-src data:; base-uri 'none'; form-action 'none'; connect-src 'none'" % (sri(sty), sri(scr))
HTML = HTML.replace('<meta name="color-scheme"', '<meta http-equiv="Content-Security-Policy" content="%s">\n<meta name="referrer" content="no-referrer">\n<meta name="color-scheme"' % csp, 1)
open(_inside_repo(os.path.join(HERE, 'edovita_logo_animation.html')), 'w').write(HTML)

# ---------- Prototyp: CSS kopieren, Splash-Markup ersetzen (nur im Repo) ----------
# Frueher: Geschwisterordner edovita-prototyp ausserhalb des Repos. Jetzt nur prototype/ im Repo.
PROTO = _inside_repo(os.path.join(ROOT, 'prototype'))
if os.path.isdir(PROTO):
    open(_inside_repo(os.path.join(PROTO, 'logo-anim.css')), 'w').write(CSS)
    ip = _inside_repo(os.path.join(PROTO, 'index.html')); h = open(ip, encoding='utf-8').read()
    splash = '<div id="splash" role="img" aria-label="Edovita">' + markup('alogo once splash-logo') + '<p class="splash-hint">Tippen zum Überspringen</p></div>'
    h2 = re.sub(r'<div id="splash".*?</p></div>', lambda m: splash, h, count=1, flags=re.S)
    assert h2 != h or splash in h
    open(ip, 'w', encoding='utf-8').write(h2)
print('ok', T, end)
