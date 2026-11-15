/* Edovita – i18n-Laufzeit für den Klick-Prototyp.
   Bildet die Entscheidung nach (i18next + react-i18next mit ICU): pro Sprache locales/<code>/{meta,ui,legal,recipes,store}.json,
   Fallback Englisch, aktive Sprachen in locales/languages.json, Sprache nur wählbar wenn meta.legalApproved === true.
   Die JSON-Dateien werden von tools/build-locales.py zu locales.js gebündelt (CSP connect-src 'none': kein fetch nötig).
   Sicherheit: Übersetzungen werden nur per textContent/setAttribute gesetzt, nie als HTML. */
(function () {
  'use strict';
  var B = window.EDO_LOCALES || { languages: { fallback: 'en', active: [], planned: [] }, res: {} };
  var KEY = 'edovita.lang';
  var FB = B.languages.fallback || 'en';
  var ATTR_OK = { 'aria-label': 1, 'data-title': 1, 'data-toast': 1, 'placeholder': 1 };
  var own = function (o, k) { return o && Object.prototype.hasOwnProperty.call(o, k); };
  function approved(code) {
    return typeof code === 'string' && B.languages.active.indexOf(code) !== -1 && own(B.res, code) && B.res[code].meta && B.res[code].meta.legalApproved === true;
  }
  function detect() {
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || FB];
    for (var i = 0; i < list.length; i++) {
      var base = String(list[i] || '').toLowerCase().split('-')[0];
      if (approved(base)) return { code: base, device: String(list[i]), matched: true };
    }
    return { code: approved(FB) ? FB : B.languages.active[0], device: String(list[0] || ''), matched: false };
  }
  function stored() { try { var v = window.localStorage.getItem(KEY); return approved(v) ? v : null; } catch (e) { return null; } }
  var cur = stored() || detect().code;
  function res(code) { return own(B.res, code) ? B.res[code] : null; }
  function meta(code) { var r = res(code || cur); return r ? r.meta : {}; }
  function locale() { return meta().locale || cur; }
  function raw(key) {
    var r = res(cur); if (r && own(r.ui, key)) return r.ui[key];
    var f = res(FB); if (f && own(f.ui, key)) return f.ui[key];
    return key;
  }
  // ---- Minimaler ICU-MessageFormat-Teil: {name}, {n, plural, =0 {...} one {...} other {...}} mit #, {x, select, a {...} other {...}}
  function matchBrace(s, i) { var d = 0; for (var j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) return j; } } return s.length - 1; }
  function splitTop(s, max) {
    var out = [], d = 0, last = 0;
    for (var i = 0; i < s.length && out.length < max - 1; i++) { var c = s[i]; if (c === '{') d++; else if (c === '}') d--; else if (c === ',' && !d) { out.push(s.slice(last, i)); last = i + 1; } }
    out.push(s.slice(last)); return out;
  }
  function opts(s) {
    var o = {}, re = /\s*([=\w]+)\s*\{/g, m;
    while ((m = re.exec(s))) { var st = m.index + m[0].length - 1, en = matchBrace(s, st); o[m[1]] = s.slice(st + 1, en); re.lastIndex = en + 1; }
    return o;
  }
  function num(n, dec) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    var d = dec === undefined ? 0 : dec;
    try { return new Intl.NumberFormat(locale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n); } catch (e) { return n.toFixed(d); }
  }
  function val(v) { return typeof v === 'number' ? num(v, v % 1 ? 1 : 0) : (v === undefined || v === null ? '' : String(v)); }
  function format(msg, vars) {
    var out = '', i = 0; vars = vars || {};
    while (i < msg.length) {
      var c = msg[i];
      if (c !== '{') { out += c; i++; continue; }
      var e = matchBrace(msg, i), inner = msg.slice(i + 1, e), p = splitTop(inner, 3), name = p[0].trim();
      if (p.length === 1) out += val(vars[name]);
      else {
        var type = p[1].trim(), o = opts(p[2] || ''), v = vars[name], pick;
        if (type === 'plural') {
          var n = Number(v), cat = 'other';
          try { cat = new Intl.PluralRules(locale()).select(n); } catch (er) { cat = n === 1 ? 'one' : 'other'; }
          pick = own(o, '=' + n) ? o['=' + n] : own(o, cat) ? o[cat] : (o.other || '');
          out += format(pick.replace(/#/g, num(n)), vars);
        } else if (type === 'select') { pick = own(o, String(v)) ? o[String(v)] : (o.other || ''); out += format(pick, vars); }
        else out += val(v);
      }
      i = e + 1;
    }
    return out;
  }
  function t(key, vars) { return format(raw(key), vars); }
  function setText(el, txt) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && /\S/.test(n.nodeValue)) { var m = n.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); n.nodeValue = m[1] + txt + m[2]; return; }
    }
    el.appendChild(document.createTextNode(txt));
  }
  function applyDom(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n]'), function (el) { setText(el, t(el.getAttribute('data-i18n'))); });
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n-a]'), function (el) {
      el.getAttribute('data-i18n-a').split('|').forEach(function (pair) {
        var k = pair.split('='); if (k.length === 2 && ATTR_OK[k[0]]) el.setAttribute(k[0], t(k[1]));
      });
    });
    var h = document.documentElement, m = meta();
    h.setAttribute('lang', m.locale || cur);
    h.setAttribute('dir', m.direction === 'rtl' ? 'rtl' : 'ltr');
  }
  function setLang(code) {
    if (!approved(code)) return false;
    cur = code;
    try { window.localStorage.setItem(KEY, code); } catch (e) { /* gilt bis zum Neuladen */ }
    applyDom(document);
    document.dispatchEvent(new CustomEvent('edovita-lang', { detail: { lang: code } }));
    return true;
  }
  function date(d, o) { try { return new Intl.DateTimeFormat(locale(), o).format(d); } catch (e) { return d.toDateString(); } }
  function coverage(code) {
    var en = res(FB), r = res(code); if (!en || !r) return 0;
    var ks = Object.keys(en.ui), have = ks.filter(function (k) { return own(r.ui, k); }).length;
    return Math.round(have / ks.length * 100);
  }
  window.EdoI18n = {
    t: t, format: format, lang: function () { return cur; }, setLang: setLang, approved: approved, detect: detect,
    meta: meta, res: function (code) { return res(code || cur); }, locale: locale, num: num, date: date, applyDom: applyDom,
    active: function () { return B.languages.active.slice(); }, planned: function () { return (B.languages.planned || []).slice(); },
    coverage: coverage, fallback: FB
  };
})();
