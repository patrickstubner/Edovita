/* Edovita QR helpers: real QR via bundled qrcode-generator; strict import validation. */
(function (g) {
  'use strict';
  function svg(text, opt) {
    opt = opt || {};
    if (typeof qrcode !== 'function') throw new Error('qrcode missing');
    var q = qrcode(0, opt.ecc || 'M');
    q.addData(String(text || ''), 'Byte');
    q.make();
    return {
      svg: q.createSvgTag({ cellSize: opt.cell || 4, margin: opt.margin == null ? 8 : opt.margin, scalable: true, alt: opt.alt || 'QR', title: opt.title || 'QR' }),
      modules: q.getModuleCount()
    };
  }
  function parseImport(hash) {
    var m = String(hash || '').match(/#\/einkauf#import=([A-Za-z0-9_-]{1,4000})$/);
    if (!m) return { ok: false, err: 'format' };
    try {
      var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      var json = decodeURIComponent(escape(atob(b64)));
      if (json.length > 3000) return { ok: false, err: 'size' };
      var data = JSON.parse(json);
      if (!data || data.v !== 1 || !Array.isArray(data.items)) return { ok: false, err: 'schema' };
      if (data.items.length > 40) return { ok: false, err: 'count' };
      var items = [];
      for (var i = 0; i < data.items.length; i++) {
        var it = data.items[i];
        if (!it || typeof it !== 'object') return { ok: false, err: 'item' };
        var id = String(it.id || '').slice(0, 40);
        var name = String(it.n || '').slice(0, 80);
        if (id && !/^[\w.-]+$/.test(id)) return { ok: false, err: 'id' };
        if (/[<>&"']/.test(name)) return { ok: false, err: 'name' };
        items.push({ id: id || ('i' + i), name: name || id, st: it.st === 'cart' || it.st === 'home' ? it.st : 'open' });
      }
      return { ok: true, items: items };
    } catch (e) { return { ok: false, err: 'parse' }; }
  }
  function encodeImport(items) {
    var payload = { v: 1, items: (items || []).slice(0, 40).map(function (it) {
      return { id: String(it.id || '').slice(0, 40), n: String(it.name || it.n || '').slice(0, 80), st: it.st || 'open' };
    }) };
    var json = JSON.stringify(payload);
    var b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return '#/einkauf#import=' + b64;
  }
  g.EdoQR = { svg: svg, parseImport: parseImport, encodeImport: encodeImport };
})(window);
