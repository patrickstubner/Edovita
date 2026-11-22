from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
import cairosvg, os
os.chdir("design/logos/final")  # Aufruf aus der Repo-Wurzel
f=instancer.instantiateVariableFont(TTFont('design/logos/fonts/Quicksand-VF.ttf'),{'wght':700})
gs=f.getGlyphSet(); cmap=f.getBestCmap(); hm=f['hmtx']
x=0;paths=[]
for ch in 'Edovita':
    g=cmap[ord(ch)]; p=SVGPathPen(gs); gs[g].draw(p)
    paths.append(f'<path transform="translate({x},0)" d="{p.getCommands()}"/>'); x+=hm[g][0]+10
W=x-10; cap=f['OS/2'].sCapHeight
WW=520; s=WW/W; SYM=700; top=50; gap=60
base=top+SYM+gap+cap*s
word=f'<g id="wordmark" fill="#0B6633" transform="translate({512-WW/2},{base}) scale({s},{-s})">{"".join(paths)}</g>'
tw=16; hw=82; g=(hw-4*tw)/3
def tine(c): return f'<path d="M{c-6.5:.2f},-262 L{c-4.5:.2f},-370 A4.5,4.5 0 0 1 {c+4.5:.2f},-370 L{c+6.5:.2f},-262 Z"/>'
tines="".join(tine(-hw/2+tw/2+i*(tw+g)) for i in range(4))
fork=f'''<g id="fork" transform="translate(272,500) rotate(30)" fill="#fff">
 <rect x="-14" y="-215" width="28" height="215" rx="14"/>
<g id="forkhead" transform="translate(0,-190) scale(0.85) translate(0,190)"> <path d="M-39.5,-264 L39.5,-264 Q41,-258 41,-250 C41,-222 28,-205 14,-196 L14,-185 L-14,-185 L-14,-196 C-28,-205 -41,-222 -41,-250 Q-41,-258 -39.5,-264 Z"/>
 {tines}</g></g>'''
defs='''<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8D930"/><stop offset=".5" stop-color="#5CC75F"/><stop offset="1" stop-color="#12B9A8"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4F2EA" stop-opacity=".9"/><stop offset="1" stop-color="#D3E8DC" stop-opacity=".9"/></linearGradient><linearGradient id="leafg" x1="0.1" y1="0.1" x2="0.9" y2="0.9"><stop offset="0" stop-color="#3FAE4A"/><stop offset="1" stop-color="#14773A"/></linearGradient>
<linearGradient id="hl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'''
def vein(y,w,sg): return f'<path d="M0,{y} Q{sg*w*.45},{y-12} {sg*w},{y-50}"/>'
veins="".join(vein(y,w,sg) for y,w in [(-100,50),(-175,52),(-250,36)] for sg in (-1,1))
leaf=f'''<g id="leaf" transform="translate(262,495) rotate(-26.5) scale(1.07)">
<path d="M0,0 C-100,-60 -112,-255 0,-360 C102,-250 96,-68 0,0 Z" fill="#fff"/>
<path d="M0,-6 Q-3,-180 0,-352 C102,-250 96,-68 0,-6 Z" fill="url(#shade)"/>
<g fill="none" stroke="#B9D9C6" stroke-linecap="round">
<path id="midrib" d="M0,-6 Q-3,-180 0,-345" stroke-width="6"/>
<g id="veins" stroke-width="3.5">{veins}</g></g></g>'''
heart='''<g id="heart"><path d="M280,240 C230,205 170,165 170,115 C170,80 198,58 228,58 C252,58 270,72 280,92 C290,72 308,58 332,58 C362,58 390,80 390,115 C390,165 330,205 280,240 Z" fill="#FF6B5E"/>
<polyline id="pulse" points="178,130 240,130 256,100 274,165 292,85 308,130 382,130" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/></g>'''
motif=fork+leaf+heart
sym=f'<rect id="bg" width="560" height="560" rx="135" fill="url(#g)"/><g transform="translate(280,282) scale(1.15) translate(-285,-284)">{motif}</g>'
H=int(base+60)
def svg(bg,body,w=1024,h=1024): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{defs}{bg}{body}</svg>'
logo=f'<g id="symbol" transform="translate({512-SYM/2},{top}) scale({SYM/560})">{sym}</g>{word}'
open('edovita_logo.svg','w').write(svg('',logo,1024,H))
open('edovita_logo_white.svg','w').write(svg(f'<rect width="1024" height="{H}" fill="#fff"/>',logo,1024,H))
icon=f'<rect width="1024" height="1024" fill="url(#g)"/><g transform="translate(513,520) scale(2.08) translate(-285,-284)">{motif}</g>'
open('edovita_appicon.svg','w').write(svg('',icon))
cairosvg.svg2png(url='edovita_logo.svg',write_to='edovita_logo_transparent.png',output_width=1024)
cairosvg.svg2png(url='edovita_logo_white.svg',write_to='edovita_logo_white.png',output_width=1024)
cairosvg.svg2png(url='edovita_appicon.svg',write_to='edovita_appicon.png',output_width=1024,output_height=1024)
