#!/usr/bin/env python3
"""Bereitet den Upload der Rezeptbilder (alle ausser den eingebetteten) nach Workers KV vor.

Schreibt /tmp/kv-chunk-<n>.js: je eine async-Funktion fuer das Cloudflare-MCP-Tool `execute`
(PUT .../storage/kv/namespaces/<id>/bulk, Werte base64). Schluessel: 'images/recipes/<datei>'.
Aufruf aus prototype/:  python3 tools/kv-upload-images.py [--only=datei1,datei2]
Free Plan: 1000 KV-Schreibvorgaenge pro Tag; ein voller Upload sind ca. 330.
"""
import base64
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHUNK = 1_800_000  # Zeichen base64 pro Aufruf


def build_cfg():
    src = open(os.path.join(ROOT, 'build-worker.py'), encoding='utf-8').read()
    ns = {}
    for line in src.splitlines():
        if line.startswith(('KV_NAMESPACE_ID=', 'EMBED_IMG=')):
            exec(line, ns)
    return ns['KV_NAMESPACE_ID'], ns['EMBED_IMG']


def main():
    ns_id, embed = build_cfg()
    only = None
    for a in sys.argv[1:]:
        if a.startswith('--only='):
            only = set(a[7:].split(','))
    d = os.path.join(ROOT, 'images', 'recipes')
    items = []
    for f in sorted(os.listdir(d)):
        if not f.endswith('.webp') or f[:-5].replace('-thumb', '') in embed:
            continue
        if only and f not in only:
            continue
        items.append({'key': 'images/recipes/' + f, 'value': base64.b64encode(open(os.path.join(d, f), 'rb').read()).decode('ascii'), 'base64': True})
    chunks, cur, size = [], [], 0
    for it in items:
        if cur and size + len(it['value']) > CHUNK:
            chunks.append(cur); cur, size = [], 0
        cur.append(it); size += len(it['value'])
    if cur:
        chunks.append(cur)
    for n, c in enumerate(chunks):
        js = ('async () => {\n  const body = %s;\n  const r = await cloudflare.request({ method: "PUT", path: `/accounts/${accountId}/storage/kv/namespaces/%s/bulk`, body });\n'
              '  return { ok: r.success, n: body.length, result: r.result };\n}') % (json.dumps(c), ns_id)
        open('/tmp/kv-chunk-%d.js' % n, 'w').write(js)
    print('%d Dateien in %d Teilen: /tmp/kv-chunk-0..%d.js' % (len(items), len(chunks), len(chunks) - 1))


if __name__ == '__main__':
    main()
