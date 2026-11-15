/* Edovita – Theme (Hell/Dunkel/System). Läuft synchron im <head>, damit es kein Aufblitzen gibt (CSP-konform: externe Datei, kein Inline-Script).
   Einzige gespeicherte Einstellung des Prototyps: "edovita.theme" = "light" | "dark" (fehlt = System). Alles andere wird nicht gespeichert. */
(function () {
  'use strict';
  var KEY = 'edovita.theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var BAR = { light: '#0F9D84', dark: '#000000' };
  function pref() {
    try { var v = window.localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system'; }
    catch (e) { return 'system'; }
  }
  function eff(p) { return p === 'system' ? (mq && mq.matches ? 'dark' : 'light') : p; }
  function apply() {
    var p = pref(), e = eff(p);
    root.setAttribute('data-pref', p);
    root.setAttribute('data-eff', e);
    var m = document.getElementById('themeColor');
    if (m) m.setAttribute('content', BAR[e]);
    document.dispatchEvent(new CustomEvent('edovita-theme', { detail: { pref: p, eff: e } }));
    return e;
  }
  function set(p) {
    if (p !== 'light' && p !== 'dark' && p !== 'system') return; // Whitelist
    try { if (p === 'system') window.localStorage.removeItem(KEY); else window.localStorage.setItem(KEY, p); } catch (e) { /* Speicher gesperrt: gilt nur bis zum Neuladen */ root.setAttribute('data-pref', p); }
    apply();
  }
  window.EdoTheme = { pref: pref, eff: function () { return eff(pref()); }, set: set, apply: apply };
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', apply); else if (mq.addListener) mq.addListener(apply); }
  root.setAttribute('data-pref', pref()); root.setAttribute('data-eff', eff(pref()));
  document.addEventListener('DOMContentLoaded', apply);
})();
