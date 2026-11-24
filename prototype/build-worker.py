#!/usr/bin/env python3
"""Erzeugt worker.mjs (Dateien eingebettet) und /tmp/deploy-code.tmp.js fuer das Cloudflare-Deployment."""
import json
import os
files={'/index.html':('text/html; charset=utf-8','index.html'),'/styles.css':('text/css; charset=utf-8','styles.css'),'/logo-anim.css':('text/css; charset=utf-8','logo-anim.css'),'/app.js':('text/javascript; charset=utf-8','app.js'),'/theme.js':('text/javascript; charset=utf-8','theme.js'),'/i18n.js':('text/javascript; charset=utf-8','i18n.js'),'/locales.js':('text/javascript; charset=utf-8','locales.js'),'/v1-features.js':('text/javascript; charset=utf-8','v1-features.js'),'/data/v1-data.js':('text/javascript; charset=utf-8','data/v1-data.js'),'/data/glossary.js':('text/javascript; charset=utf-8','data/glossary.js'),'/vendor/qrcode-generator.js':('text/javascript; charset=utf-8','vendor/qrcode-generator.js'),'/vendor/edo-qr.js':('text/javascript; charset=utf-8','vendor/edo-qr.js'),'/robots.txt':('text/plain; charset=utf-8','robots.txt')}
for f in sorted(os.listdir('assets')):
    if f.endswith('.svg'): files['/assets/'+f]=('image/svg+xml','assets/'+f)  # PNGs werden nicht eingebettet (Worker liefert nur Text)
for root,_,fs in sorted(os.walk('locales')):
    for f in sorted(fs):
        if f.endswith('.json'): files['/'+os.path.join(root,f)]=('application/json; charset=utf-8',os.path.join(root,f))
F={k:{'t':t,'b':open(f,encoding='utf-8').read()} for k,(t,f) in files.items()}
# Audio: feste Liste, base64 eingebettet, im Worker binaer ausgeliefert
import base64
AUDIO=['hymne_H1.mp3','hymne_H5.mp3','hymne_H4.mp3','A_aufbruch.mp3','B_erfolg.mp3','C_zusammen.mp3']
for f in AUDIO:
    F['/audio/'+f]={'t':'audio/mpeg','b64':base64.b64encode(open('audio/'+f,'rb').read()).decode('ascii')}
# Rezeptbilder: lokal gebündelt, CSP img-src 'self' (kein Hotlinking)
REC_IMG='images/recipes'
if os.path.isdir(REC_IMG):
    for f in sorted(os.listdir(REC_IMG)):
        if f.endswith('.webp'):
            F['/images/recipes/'+f]={'t':'image/webp','b64':base64.b64encode(open(os.path.join(REC_IMG,f),'rb').read()).decode('ascii')}
csp="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
tpl=open('worker.tpl.mjs',encoding='utf-8').read()
worker=tpl.replace('__FILES__',json.dumps(F,ensure_ascii=False)).replace('__CSP__',json.dumps(csp))
open('worker.mjs','w',encoding='utf-8').write(worker)
code='''async () => {
  const code = %s;
  const metadata = { main_module: "worker.js", compatibility_date: "2025-09-01" };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("worker.js", new Blob([code], { type: "application/javascript+module" }), "worker.js");
  const up = await cloudflare.request({ method: "PUT", path: `/accounts/${accountId}/workers/scripts/edovita-prototyp`, body: form });
  return { uploaded: up.success };
}''' % json.dumps(worker,ensure_ascii=False)
open('/tmp/deploy-code.tmp.js','w',encoding='utf-8').write(code)
