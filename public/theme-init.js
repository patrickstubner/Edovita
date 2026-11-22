/* Edovita – Frühe Theme-Initialisierung (Hell/Dunkel/System).
   Läuft synchron als externe Datei im <head>, um Aufblitzen zu verhindern (CSP-konform, kein Inline-Skript).
   Speichert ausschliesslich die Whitelist-Einstellung localStorage["edovita.theme"] = "light" | "dark" (fehlt = system). */
(function () {
  'use strict';
  var STORAGE_KEY = 'edovita.theme';
  var THEME_COLOR = { light: '#0F9D84', dark: '#000000' };
  var root = document.documentElement;
  var mq =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  function readPref() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw === 'light' || raw === 'dark' ? raw : 'system';
    } catch {
      return 'system';
    }
  }

  function resolveEff(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return mq && mq.matches ? 'dark' : 'light';
  }

  var pref = readPref();
  var eff = resolveEff(pref);
  root.setAttribute('data-pref', pref);
  root.setAttribute('data-eff', eff);
  var meta = document.getElementById('themeColor');
  if (meta) {
    meta.setAttribute('content', THEME_COLOR[eff]);
  }
})();
