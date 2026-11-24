(function () {
  'use strict';
  // Reiner Klick-Prototyp v5.7: keine Netzwerkaufrufe. Gespeichert: Sprache, Zweitsprache (manuelle Wahl), Plan, Einkaufsliste, Darstellung, Ton, Melodie. Keine Standort- oder Gesundheitsdaten. Sprachcodes nur nach Whitelist.
  // Alle Texte kommen aus locales/<code>/*.json (über i18n.js) und werden nur per textContent/setAttribute gesetzt.
  var I = window.EdoI18n;
  var T = function (k, v) { return I.t(k, v); };
  var SCREENS = ['start','onboarding','onboarding2','onboarding3','onboarding4','daten','ziel','vorlieben','erinnerungen','hilfe','heute','details','erfassen','rezepte','rezept','plan','einkauf','restaurant','woche','kraft','fortschritt','koerper','profil','partner','arzt','sprache','toene','datenschutz','rechtliches','reste','saison','eintipp','portionen','bardb','fenster','aktivitaet','qrshop','reise','marken'];
  var GOALS = { lose: 1, gain: 1, keep: 1 };
  var gname = function (g) { return T('goal.' + g); };
  var state = { goal: 'lose', goalKcal: 1900, eaten: 720, protein: 48, target: 110, dinnerSaved: false,
    height: 175, age: 42, dob: '1984-03-15', sex: 'm', weight: 78.4, tweight: 74, scale: true, rangeW: '3M', rangeF: 'Alle',
    water: 750, waterGoal: 2250, pmode: 'sus', rate: 0.5, kcal: 1800, kcalConfAt: null, kcalSet: false, open: {}, extra: [], prefs: {}, rmeal: 'all', rprops: {},
    rem: { meals: true, weigh: true, photo: true, water: true },
    ratings: { oven_salmon: 5, thai_curry: 4, birchermuesli: 4, pho: 4, lentil_curry: 3 }, saved: { thai_curry: true, summer_rolls: true },
    shop: { berries: 'cart', olive_oil: 'home' }, portion: 'm', foodQ: '',
    share: { p1: true, p2: true, p3: true, p4: true, p5: false }, pconn: 'qr', backup: false, bkAgree: false,
    sound: true, hymn: 'H1', recipeId: 'oven_salmon' };
  var BASE_WEIGHT = 78.4;
  var ITEMS = [
    { key: 'item.salmon', g: 150, kcal100: 206.6, p100: 21 },
    { key: 'item.rice', g: 180, kcal100: 130, p100: 2.7 },
    { key: 'item.broc', g: 120, kcal100: 34, p100: 2.8 }
  ];
  var BASE_EATEN = 720, BASE_PROTEIN = 48;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return I.num(Math.round(n)); };
  var f1 = function (n) { return I.num(Math.round(n * 10) / 10, 1); };
  var rt = function (r) { var c = Math.round(r * 100); return I.num(c / 100, c % 10 ? 2 : (c % 100 ? 1 : 0)); };
  var history_ = [], curScreen = 'start', prevScreen = '';
  var rx = function () { return I.res(); };

  // ---------- Speicher (nur Einstellungen, Whitelist) ----------
  function getPref(k, ok, def) { try { var v = window.localStorage.getItem(k); return ok.indexOf(v) !== -1 ? v : def; } catch (e) { return def; } }
  function setPref(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* nur bis zum Neuladen */ } }
  state.sound = getPref('edovita.sound', ['on', 'off'], 'on') === 'on';
  state.hymn = getPref('edovita.hymn', ['H1', 'H5', 'H4'], 'H1');

  function show(id) {
    if (SCREENS.indexOf(id) === -1) id = 'heute';
    if (id !== curScreen) { prevScreen = curScreen; curScreen = id; }
    if (typeof closeShopSrc === 'function') closeShopSrc(true);
    if (id === 'rezept') renderRezept();
    if (id === 'plan') renderPlan();
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    var scr = document.getElementById(id);
    var tab = scr.getAttribute('data-tab');
    $$('.tab').forEach(function (t) {
      var on = t.getAttribute('data-tabid') === tab;
      t.classList.toggle('on', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    var inOnb = function (x) { return x === 'start' || x.indexOf('onboarding') === 0; };
    var hideTab = inOnb(id) || (id === 'sprache' && inOnb(prevScreen));
    $('#tabbar').classList.toggle('hide', hideTab);
    $('#app').classList.toggle('has-tab', !hideTab);
    document.title = T('doc.title', { screen: scr.getAttribute('data-title') });
    if (id === 'erfassen') resetCapture();
    if (id === 'fortschritt' || id === 'koerper') drawCharts();
    var body = scr.querySelector(':scope > .screen-body');
    if (body) body.scrollTop = 0; else window.scrollTo(0, 0);
    // A11y: beim Screenwechsel Fokus auf den Titel (Screenreader liest neuen Screen vor); nicht beim allerersten Laden
    if (shownOnce) { var h = scr.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    shownOnce = true;
  }
  var shownOnce = false;
  function route() { var h = (location.hash || '').replace(/^#\/?/, '') || 'start'; if (h.indexOf('einkauf#import=') === 0) h = 'einkauf'; h = h.split('?')[0].split('&')[0]; show(h); }
  function go(id) {
    if (LANG_MENU_OPEN) setLangMenu(false);
    var cur = (location.hash || '').replace(/^#\/?/, '') || 'start';
    if (cur !== id) history_.push(cur);
    location.hash = '#/' + id;
  }
  function toast(msg, opts) {
    var t = $('#toast'), btn, ms;
    opts = opts || {};
    t.textContent = '';
    t.appendChild(document.createTextNode(msg));
    if (opts.undo) {
      btn = mk('button', 'toast-undo');
      btn.type = 'button';
      btn.textContent = T('toast.undo');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(toast.h);
        t.hidden = true;
        if (typeof opts.undo === 'function') opts.undo();
      });
      t.appendChild(btn);
    }
    t.hidden = false;
    clearTimeout(toast.h);
    ms = opts.undo ? 6500 : 2600;
    toast.h = setTimeout(function () { t.hidden = true; }, ms);
  }

  // ---------- Körperdaten, BMI, Kalorienbedarf ----------
  var LIMITS = { height: [140, 210, 1], age: [16, 99, 1], weight: [25, 200, 0.1], tweight: [25, 200, 0.1], rate: [0.1, 1, 0.05], kcal: [800, 4500, 50] };
  var NS_ = 'http://www.w3.org/2000/svg';
  var mk = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  function icon(name, cls) {
    var svg = document.createElementNS(NS_, 'svg'); svg.setAttribute('class', 'ic ' + (cls || '')); svg.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS(NS_, 'use'); u.setAttribute('href', '#i-' + name); svg.appendChild(u); return svg;
  }
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var bmiOf = function (kg) { var h = state.height / 100; return kg / (h * h); };
  var kgOf = function (bmi) { var h = state.height / 100; return bmi * h * h; };
  var BANDS = [
    { lo: 0, hi: 18.5, k: 'bmi.under', ks: 'bmi.under', col: '#BCD8F2' },
    { lo: 18.5, hi: 25, k: 'bmi.normal', ks: 'bmi.normal', col: '#C7EAD6' },
    { lo: 25, hi: 30, k: 'bmi.over', ks: 'bmi.over', col: '#FBE9B9' },
    { lo: 30, hi: 35, k: 'bmi.ob1', ks: 'bmi.ob1s', col: '#F8D2A9' },
    { lo: 35, hi: 40, k: 'bmi.ob2', ks: 'bmi.ob2s', col: '#F3B6A7' },
    { lo: 40, hi: 999, k: 'bmi.ob3', ks: 'bmi.ob3s', col: '#E99C9C' }
  ];
  function bandRng(b) { return b.lo === 0 ? T('bmi.rng.under', { v: f1(18.5) }) : b.hi > 100 ? T('bmi.rng.over', { v: fmt(40) }) : (b.lo % 1 ? f1(b.lo) : fmt(b.lo)) + '–' + f1(b.hi - 0.1); }
  function bandOf(bmi) { for (var i = 0; i < BANDS.length; i++) if (bmi < BANDS[i].hi) return BANDS[i]; return BANDS[BANDS.length - 1]; }
  function kcalNeed() {
    var bmr = 10 * state.weight + 6.25 * state.height - 5 * state.age + (state.sex === 'm' ? 5 : -161);
    return bmr * 1.4; // leichte Aktivität
  }
  // ---------- Ziel, Tempo, Schutzmechanismen ----------
  function kcalFloor() { return state.sex === 'm' ? 1500 : 1200; }
  function wMin() { return (state.goal === 'gain' || state.goal === 'keep') ? 25 : 40; } // Zunehmen/Halten ab 25 kg, Abnehmen ab 40 kg
  function tLo() { return state.goal === 'gain' ? wMin() : tMin(); }
  function loseBlocked() { return bmiOf(state.weight) < 18.5 || state.weight < 40; }
  function tMin() { return Math.ceil(kgOf(18.5) / 0.5) * 0.5; } // kein Zielgewicht unter BMI 18.5
  function susRate() {
    if (state.goal === 'gain') return 0.25;
    return clamp(Math.round(state.weight * 0.005 / 0.05) * 0.05, 0.25, 0.5);
  }
  function wantedRate() { if (state.goal === 'keep') return 0; if (state.pmode === 'kcal') { var r = kcalRate(); return state.goal === 'lose' ? Math.max(0, -r) : Math.max(0, r); } return state.pmode === 'sus' ? susRate() : state.rate; }
  function paceInfo() {
    var want = wantedRate(), eff = want;
    if (state.goal === 'lose' && state.pmode !== 'kcal') {
      var maxF = Math.max(0, Math.floor(Math.round((kcalNeed() - kcalFloor()) / 1100 * 1000) / 1000 / 0.05) * 0.05);
      eff = Math.min(want, maxF);
    }
    eff = Math.round(eff * 100) / 100;
    return { want: want, eff: eff, limited: eff < want - 1e-9 };
  }
  function calcGoalKcal() { return state.pmode === 'kcal' ? kcalEff() : calcGoalKcalBase(); }
  function calcGoalKcalBase() {
    var r = paceInfo().eff, adj = state.goal === 'lose' ? -r * 1100 : state.goal === 'gain' ? r * 1100 : 0;
    return Math.max(kcalFloor(), Math.round((kcalNeed() + adj) / 50) * 50);
  }
  var TODAY = new Date(2026, 10, 4);
  function dayPlus(n) { return new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n); }
  function longDate(d) { return I.date(d, { day: 'numeric', month: 'long', year: 'numeric' }); }
  function projection() {
    var diff = Math.abs(state.weight - state.tweight), eff = paceInfo().eff;
    if (state.goal === 'keep' || diff < 0.05 || eff <= 0) return null;
    var weeks;
    if (state.pmode === 'sus' && state.goal === 'lose') { var slow = Math.min(diff, 2); weeks = (diff - slow) / eff + slow / (eff * 0.6); }
    else weeks = diff / eff;
    var days = Math.ceil(weeks * 7);
    return { weeks: Math.max(1, Math.round(weeks)), date: dayPlus(days), stab: dayPlus(days + 28) };
  }
  function riskInfo() {
    var bmi = bmiOf(state.weight), g = state.goal, help = ' ' + T('risk.help');
    if (bmi < 17) {
      if (g === 'gain') return { lvl: 2, title: T('risk.verylow.title'), text: T('risk.verylow.gain') + help };
      if (g === 'keep' && !state.goalWas) return { lvl: 2, title: T('risk.verylow.title'), text: T('risk.verylow.keep') + help };
      return { lvl: 2, title: T('risk.verylow.title'), text: T('risk.verylow.other') + help };
    }
    if (bmi < 18.5) {
      if (g === 'gain') return { lvl: 1, title: T('risk.low.title'), text: T('risk.low.gain') };
      if (g === 'keep' && !state.goalWas) return { lvl: 1, title: T('risk.low.title'), text: T('risk.low.keep') };
      return { lvl: 1, title: T('risk.low.title'), text: T('risk.low.other') };
    }
    if (g === 'gain' && bmi >= 25) return { lvl: 1, title: T('risk.highgain.title'), text: T('risk.highgain.text') };
    if (g === 'lose' && (wantedRate() > Math.min(0.75, state.weight * 0.01) || bmiOf(state.tweight) < 19))
      return { lvl: 1, title: T('risk.ambitious.title'), text: T('risk.ambitious.text') };
    return { lvl: 0 };
  }
  function renderSafe() {
    var r = riskInfo();
    $$('[data-safe]').forEach(function (box) {
      box.textContent = '';
      if (!r.lvl) return;
      var b = mk('div', 'banner care'); b.setAttribute('role', 'note');
      b.appendChild(icon('heart'));
      var g = mk('span', 'grow'); g.appendChild(mk('b', '', r.title)); g.appendChild(mk('span', '', r.text));
      var btn = mk('button', 'btn line sm', T('risk.btn')); btn.setAttribute('data-go', 'hilfe');
      g.appendChild(btn); b.appendChild(g); box.appendChild(b);
    });
  }

  // Richtwerte Körperfett nach Alter/Geschlecht (grobe Orientierung, keine Diagnose)
  var FAT_REF = { m: [[39, 8, 19.9], [59, 11, 21.9], [999, 13, 24.9]], w: [[39, 21, 32.9], [59, 23, 33.9], [999, 24, 35.9]] };
  function fatRef() {
    var t = FAT_REF[state.sex] || FAT_REF.m;
    for (var i = 0; i < t.length; i++) if (state.age <= t[i][0]) return { lo: t[i][1], hi: t[i][2] };
    return { lo: t[2][1], hi: t[2][2] };
  }
  function fatBands() {
    var r = fatRef();
    return [
      { lo: 0, hi: r.lo, id: 'low', name: T('fat.low'), rng: T('fat.rng.under', { v: f1(r.lo) }), col: '#BCD8F2' },
      { lo: r.lo, hi: r.hi, id: 'normal', name: T('fat.normal'), rng: T('fat.rng.between', { a: f1(r.lo), b: f1(r.hi) }), col: '#C7EAD6' },
      { lo: r.hi, hi: r.hi + 5, id: 'high', name: T('fat.high'), rng: T('fat.rng.between', { a: f1(r.hi), b: f1(r.hi + 5) }), col: '#FBE9B9' },
      { lo: r.hi + 5, hi: 100, id: 'vhigh', name: T('fat.vhigh'), rng: T('fat.rng.over', { v: f1(r.hi + 5) }), col: '#F3B6A7' }
    ];
  }

  // ---------- fiktive Messreihen (deterministisch) ----------
  function interp(keys, d) {
    for (var i = 0; i < keys.length - 1; i++) {
      var a = keys[i], b = keys[i + 1];
      if (d <= a[0] && d >= b[0]) return a[1] + (b[1] - a[1]) * ((a[0] - d) / (a[0] - b[0]));
    }
    return d > keys[0][0] ? keys[0][1] : keys[keys.length - 1][1];
  }
  var W_KEYS = [[540, 91.5], [365, 88.0], [270, 85.6], [180, 83.2], [120, 81.9], [60, 80.9], [29, 80.5], [15, 79.6], [0, 78.4]];
  var F_KEYS = [[270, 28.0], [180, 27.0], [90, 26.0], [29, 25.6], [0, 24.5]];
  var M_KEYS = [[270, 40.6], [180, 40.8], [90, 41.0], [29, 41.0], [0, 41.2]];
  function noise(d, amp) { return amp * (Math.sin(d * 1.7) * 0.6 + Math.sin(d * 0.43) * 0.4) * (d === 0 || d === 15 || d === 29 ? 0 : 1); }
  function wAt(d) { var b = interp(W_KEYS, d); return (state.goal === 'gain' ? state.weight * (2 - b / BASE_WEIGHT) : b + (state.weight - BASE_WEIGHT)) + noise(d, 0.28); }
  function fAt(d) { return interp(F_KEYS, d) + noise(d, 0.18); }
  function mAt(d) { return interp(M_KEYS, d) + noise(d, 0.12); }
  function series(fn, days, step) {
    var out = [];
    for (var d = days; d > 0; d -= step) out.push({ d: d, v: fn(d) });
    out.push({ d: 0, v: fn(0) });
    return out;
  }
  function dateLabel(d, long) {
    var dt = new Date(TODAY.getTime() - d * 86400000);
    return long ? I.date(dt, { day: 'numeric', month: 'short' }) : I.date(dt, { month: 'short', year: '2-digit' });
  }

  // ---------- SVG-Diagramme (ohne Bibliotheken, ohne innerHTML) ----------
  var NS = NS_;
  function se(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, String(attrs[k]));
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceStep(range) { return range > 24 ? 5 : range > 11 ? 2 : range > 5 ? 1 : 0.5; }
  function drawChart(box, o) {
    box.textContent = '';
    var W = 320, H = 250, x0 = 40, x1 = o.rightAxis ? 276 : 308, y0 = 22, y1 = 206;
    var svg = se('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.aria }, box);
    var yOf = function (v) { return y1 - (v - o.lo) / (o.hi - o.lo) * (y1 - y0); };
    var xOf = function (d) { return x1 - d / o.days * (x1 - x0); };
    se('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, class: 'c-bg', rx: 6 }, svg);
    (o.bands || []).forEach(function (b) {
      var a = Math.max(b.lo, o.lo), z = Math.min(b.hi, o.hi);
      if (z > a) se('rect', { x: x0, y: yOf(z).toFixed(1), width: x1 - x0, height: (yOf(a) - yOf(z)).toFixed(1), fill: b.col, 'fill-opacity': 0.85 }, svg);
    });
    var st = niceStep(o.hi - o.lo);
    for (var v = Math.ceil(o.lo / st) * st; v <= o.hi + 1e-6; v += st) {
      se('line', { x1: x0, x2: x1, y1: yOf(v).toFixed(1), y2: yOf(v).toFixed(1), class: 'c-grid', 'stroke-width': 1 }, svg);
      se('text', { x: x0 - 6, y: (yOf(v) + 5).toFixed(1), 'text-anchor': 'end', 'font-size': 13, class: 'c-axis' }, svg, (st < 1 ? f1(v) : fmt(v)));
    }
    se('text', { x: x0 - 6, y: 12, 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, class: 'c-axis' }, svg, o.unit);
    if (o.rightAxis) {
      se('text', { x: x1 + 6, y: 12, 'font-size': 13, 'font-weight': 700, class: 'c-axis' }, svg, 'BMI');
      o.rightAxis.forEach(function (r) {
        if (r.v < o.lo || r.v > o.hi) return;
        se('line', { x1: x1, x2: x1 + 4, y1: yOf(r.v).toFixed(1), y2: yOf(r.v).toFixed(1), class: 'c-axis-s' }, svg);
        se('text', { x: x1 + 7, y: (yOf(r.v) + 5).toFixed(1), 'font-size': 13, 'font-weight': 700, class: 'c-txt' }, svg, r.label);
      });
    }
    if (o.target !== undefined && o.target >= o.lo && o.target <= o.hi) {
      se('line', { x1: x0, x2: x1, y1: yOf(o.target).toFixed(1), y2: yOf(o.target).toFixed(1), class: 'c-tgt', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, svg);
      se('text', { x: x0 + 6, y: (yOf(o.target) - 6).toFixed(1), 'font-size': 13, 'font-weight': 800, class: 'c-tgt-t', 'stroke-width': 3, 'paint-order': 'stroke' }, svg, o.targetLabel);
    }
    var path = o.pts.map(function (p, i) { return (i ? 'L' : 'M') + xOf(p.d).toFixed(1) + ' ' + yOf(p.v).toFixed(1); }).join(' ');
    se('path', { d: path, fill: 'none', stroke: o.color || '#0F9D84', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    var last = o.pts[o.pts.length - 1];
    se('circle', { cx: xOf(last.d).toFixed(1), cy: yOf(last.v).toFixed(1), r: 7, class: 'c-dot', stroke: o.color || '#0F9D84', 'stroke-width': 3.5 }, svg);
    [0, 1 / 3, 2 / 3, 1].forEach(function (f, i) {
      var d = Math.round(o.days * (1 - f));
      se('text', { x: (x0 + f * (x1 - x0)).toFixed(1), y: 232, 'text-anchor': i === 0 ? 'start' : i === 3 ? 'end' : 'middle', 'font-size': 13, class: 'c-axis' }, svg, dateLabel(d, o.days <= 100));
    });
  }
  function legendItem(parent, name, rng, col, cur) {
    var d = mk('div', 'lg' + (cur ? ' cur' : ''));
    var sw = mk('i'); sw.style.background = col; d.appendChild(sw);
    var t = mk('span', '', name);
    t.appendChild(mk('small', '', rng + (cur ? ' ' + T('legend.current') : '')));
    d.appendChild(t); parent.appendChild(d);
  }
  var W_DAYS = { '1M': [30, 1], '3M': [90, 3], '1J': [365, 7], 'Alle': [540, 10] };
  var F_DAYS = { '3M': [90, 3], '6M': [180, 5], 'Alle': [270, 7] };
  function drawCharts() {
    var wd = W_DAYS[state.rangeW], wp = series(wAt, wd[0], wd[1]);
    var vals = wp.map(function (p) { return p.v; });
    var up = kgOf(24.9);
    var lo = Math.min.apply(null, vals.concat([state.tweight, up])) - 1.5, hi = Math.max.apply(null, vals.concat([state.tweight, up])) + 1.5;
    var edges = [18.5, 25, 30, 35, 40].map(function (b) { return { v: kgOf(b), label: b % 1 ? f1(b) : fmt(b) }; });
    var bandsKg = BANDS.map(function (b) { return { lo: kgOf(b.lo), hi: b.hi > 100 ? 999 : kgOf(b.hi), col: b.col }; });
    drawChart($('#wChart'), { pts: wp, days: wd[0], lo: lo, hi: hi, bands: bandsKg, rightAxis: edges,
      target: state.tweight, targetLabel: T('chart.target', { v: f1(state.tweight) }), unit: 'kg',
      aria: T('chart.w.aria', { w: f1(state.weight), b: f1(bmiOf(state.weight)) }) });
    var lg = $('#wLegend'); lg.textContent = '';
    var cur = bandOf(bmiOf(state.weight));
    BANDS.forEach(function (b) { legendItem(lg, T(b.k), bandRng(b), b.col, b === cur); });
    var has = state.scale;
    $('#fatBody').hidden = !has; $('#fatEmpty').hidden = has; $('#fatChip').hidden = !has;
    $('#koerperBody').hidden = !has; $('#koerperEmpty').hidden = has;
    if (!has) return;
    var fd = F_DAYS[state.rangeF], fp = series(fAt, fd[0], fd[1]);
    var fb = fatBands(), fv = fp.map(function (p) { return p.v; });
    var flo = Math.max(0, Math.min.apply(null, fv.concat([fatRef().lo])) - 2), fhi = Math.max.apply(null, fv.concat([fatRef().hi + 5])) + 1.5;
    var sexN = T('sex.' + state.sex);
    drawChart($('#fChart'), { pts: fp, days: fd[0], lo: flo, hi: fhi, bands: fb, unit: '%', color: '#C9762A',
      aria: T('chart.f.aria', { sex: sexN, age: state.age, v: f1(fAt(0)) }) });
    var fl = $('#fLegend'); fl.textContent = '';
    var fcur = fb.filter(function (b) { return fAt(0) >= b.lo && fAt(0) < b.hi; })[0];
    fb.forEach(function (b) { legendItem(fl, b.name, b.rng, b.col, b === fcur); });
    $('#fatChip').textContent = T('fat.chip', { v: f1(fAt(0)), name: fcur.name });
    $('#fHint').textContent = T('fat.hint', { sex: sexN, age: state.age });
    var r = fatRef(), stb = $('#fatStatus');
    stb.classList.toggle('ok', fcur.id === 'normal');
    $('b', stb).textContent = T('fat.st.' + fcur.id);
    $('span.grow > span', stb).textContent = T('fat.ref', { sex: sexN, age: state.age, lo: f1(r.lo), hi: f1(r.hi) });
    var mp = series(mAt, 270, 7), mv = mp.map(function (p) { return p.v; });
    drawChart($('#mChart'), { pts: mp, days: 270, lo: Math.min.apply(null, mv) - 1, hi: Math.max.apply(null, mv) + 1, unit: '%', color: '#0F9D84',
      aria: T('chart.m.aria', { v: f1(mAt(0)) }) });
  }

  // ---------- Formular Körperdaten (Schieberegler, begrenzt) ----------
  // ---------- v5.1 Erfassung Körperdaten: Stepper (Minus/Plus, halten beschleunigt, Wert antippbar) + Geburtsdatum ----------
  var FIELDS = [['height', 'form.height', 'unit.cm'], ['weight', 'form.weight', 'unit.kg']];
  var STEP = { height: 1, weight: 0.1, tweight: 0.1, rate: 0.05, kcal: 50 };  // Minus/Plus
  var SLIDER_STEP = { height: 1, weight: 0.5, tweight: 0.5, rate: 0.05, kcal: 50 };   // Slider grob
  var UNIT = { height: 'unit.cm', weight: 'unit.kg', tweight: 'unit.kg', rate: 'unit.kgweek', kcal: 'unit.kcalday' };
  var AGE_MIN = 13, AGE_MAX = 110, AGE_ADULT = 16;
  function fieldLo(k) { return k === 'weight' ? wMin() : k === 'tweight' ? tLo() : LIMITS[k][0]; }
  function fieldHi(k) { return k === 'rate' && state.goal === 'gain' ? 0.75 : LIMITS[k][1]; }
  function fieldFmt(k, v) { return (k === 'weight' || k === 'tweight') ? f1(v) : k === 'rate' ? rt(v) : k === 'kcal' ? fmt(v) : String(Math.round(v)); }
  function fieldRound(k, v) { return (k === 'weight' || k === 'tweight') ? Math.round(v * 10) / 10 : k === 'rate' ? Math.round(v * 20) / 20 : k === 'kcal' ? Math.round(v / 50) * 50 : Math.round(v); }
  function parseNum(s, k) {
    s = String(s == null ? '' : s).replace(/[\s'\u2019\u00a0\u202f]/g, '');
    if (k === 'kcal') { s = s.replace(/[.,]/g, ''); return /^\d{1,4}$/.test(s) ? parseInt(s, 10) : NaN; } // ganze kcal, Tausendertrenner egal
    s = s.replace(',', '.');
    if (!/^\d{0,3}(\.\d{0,2})?$/.test(s) || s === '' || s === '.') return NaN;
    return parseFloat(s);
  }
  function fldMsg(k, txt) { $$('[data-msg="' + k + '"]').forEach(function (p) { p.textContent = txt || ''; p.hidden = !txt; }); }
  function setField(k, v, announce) {
    var lo = fieldLo(k), hi = fieldHi(k), r = fieldRound(k, clamp(v, lo, hi));
    var clamped = fieldRound(k, v) !== r;
    if (!clamped && state[k] === r) { fldMsg(k, ''); return true; } // unverändert: kein Neuaufbau (sonst geht z. B. ein Klick auf die Bestätigung verloren)
    state[k] = r;
    if (clamped && announce) fldMsg(k, T('step.clamped', { v: fieldFmt(k, r), unit: T(UNIT[k]), min: lo % 1 ? fieldFmt(k, lo) : fmt(lo), max: hi % 1 ? fieldFmt(k, hi) : fmt(hi) }));
    else fldMsg(k, '');
    render();
    return !clamped;
  }
  function stepField(k, dir, mult) { return setField(k, state[k] + dir * STEP[k] * (mult || 1), true); }
  // Halten beschleunigt: 400 ms Verzögerung, dann schneller; Gewicht ab 1,5 s in 0,5-kg-, ab 3 s in 1-kg-Schritten
  var hold = null;
  function holdStop() { if (hold) { clearTimeout(hold.t); hold = null; } }
  function holdTick() {
    if (!hold) return;
    var el = Date.now() - hold.t0, mult = 1, wait = 110;
    var big = hold.k === 'weight' || hold.k === 'tweight';
    if (el > 1500) { wait = 60; mult = big ? 5 : 1; }
    if (el > 3000) { wait = 50; mult = big ? 10 : hold.k === 'kcal' ? 4 : 2; }
    if (!stepField(hold.k, hold.dir, mult)) { holdStop(); return; }
    hold.t = setTimeout(holdTick, wait);
  }
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('[data-step]'); if (!b || e.button > 0) return;
    e.preventDefault(); holdStop();
    try { b.setPointerCapture(e.pointerId); } catch (er) { /* älterer Browser */ }
    var k = b.getAttribute('data-step'), dir = b.getAttribute('data-dir') === '-1' ? -1 : 1; if (!STEP[k]) return;
    stepField(k, dir, 1);
    hold = { k: k, dir: dir, t0: Date.now(), t: 0 }; hold.t = setTimeout(holdTick, 400);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { document.addEventListener(ev, holdStop, true); });
  window.addEventListener('blur', holdStop);
  document.addEventListener('visibilitychange', holdStop);
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('[data-step]')) e.preventDefault(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-step]'); if (!b) return;
    if (e.detail === 0) { var k = b.getAttribute('data-step'); if (STEP[k]) stepField(k, b.getAttribute('data-dir') === '-1' ? -1 : 1, 1); } // Tastatur (Enter/Leertaste)
  });
  function commitVal(inp) {
    var k = inp.getAttribute('data-val'), v = parseNum(inp.value, k);
    if (!isFinite(v)) { fldMsg(k, T('step.invalid')); inp.value = fieldFmt(k, state[k]); return; }
    setField(k, v, true); inp.value = fieldFmt(k, state[k]);
  }
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-val')) commitVal(t); });
  document.addEventListener('keydown', function (e) {
    var t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-val')) return;
    var k = t.getAttribute('data-val');
    if (e.key === 'Enter') { e.preventDefault(); commitVal(t); t.select(); }
    else if (e.key === 'Escape') { t.value = fieldFmt(k, state[k]); fldMsg(k, ''); t.blur(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault(); stepField(k, (e.key === 'ArrowUp' || e.key === 'PageUp') ? 1 : -1, e.key.indexOf('Page') === 0 ? 10 : 1); t.value = fieldFmt(k, state[k]);
    }
  });
  // Antippen markiert den ganzen Wert (auch wenn mouseup/touchend die Auswahl sonst wieder aufhebt)
  var valFresh = null;
  document.addEventListener('focusin', function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-val')) { valFresh = t; try { t.select(); } catch (er) { /* */ } } });
  document.addEventListener('click', function (e) { var t = e.target; if (t && t === valFresh) { valFresh = null; try { t.select(); } catch (er) { /* */ } } });
  document.addEventListener('focusout', function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-val')) { if (valFresh === t) valFresh = null; commitVal(t); } });

  function stepperCard(pid, f) {
    var k = f[0], L = LIMITS[k], id = 'f-' + pid + '-' + k, label = T(f[1]), unit = T(f[2]);
    var card = mk('div', 'card fld');
    var lab = mk('label', 'flab', label); lab.setAttribute('for', id); card.appendChild(lab);
    var st = mk('div', 'stepper');
    function btn(dir) {
      var b = mk('button', 'stepbtn'); b.type = 'button';
      b.setAttribute('data-step', k); b.setAttribute('data-dir', String(dir));
      b.setAttribute('aria-label', T(dir < 0 ? 'step.dec' : 'step.inc', { label: label, step: fieldFmt(k, STEP[k]) + ' ' + unit }));
      b.setAttribute('aria-controls', id);
      b.appendChild(mk('span', '', dir < 0 ? '\u2212' : '+')).setAttribute('aria-hidden', 'true');
      return b;
    }
    var mid = mk('div', 'stepval');
    var inp = document.createElement('input'); inp.type = 'text'; inp.id = id; inp.className = 'valinp' + (k === 'kcal' ? ' wide' : '');
    inp.setAttribute('inputmode', (k === 'height' || k === 'kcal') ? 'numeric' : 'decimal'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('enterkeyhint', 'done');
    inp.setAttribute('data-val', k); inp.setAttribute('maxlength', '6');
    inp.setAttribute('aria-describedby', 'm-' + id);
    mid.appendChild(inp); mid.appendChild(mk('span', 'unit', unit));
    st.appendChild(btn(-1)); st.appendChild(mid); st.appendChild(btn(1));
    card.appendChild(st);
    var rng = document.createElement('input'); rng.type = 'range'; rng.min = L[0]; rng.max = L[1]; rng.step = SLIDER_STEP[k];
    rng.setAttribute('data-key', k); rng.setAttribute('aria-label', label); rng.tabIndex = -1; // Tastatur nutzt Feld + Pfeiltasten; Slider bleibt für Maus/Touch
    card.appendChild(rng);
    var msg = mk('p', 'cap fldmsg'); msg.id = 'm-' + id; msg.setAttribute('data-msg', k); msg.setAttribute('aria-live', 'polite'); msg.hidden = true;
    card.appendChild(msg);
    return card;
  }

  // Geburtsdatum: Tag / Monat / Jahr in der Reihenfolge der Sprache (Intl), Alter wird berechnet
  function dobOrder() {
    try {
      return new Intl.DateTimeFormat(I.locale(), { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(new Date(2000, 10, 22))
        .map(function (p) { return p.type; }).filter(function (t) { return t === 'day' || t === 'month' || t === 'year'; });
    } catch (e) { return ['day', 'month', 'year']; }
  }
  function monthNames() {
    var out = [];
    for (var m = 0; m < 12; m++) { var n; try { n = new Intl.DateTimeFormat(I.locale(), { month: 'long' }).format(new Date(2000, m, 15)); } catch (e) { n = String(m + 1); } out.push(n); }
    return out;
  }
  function ageFrom(y, m, d, now) {
    now = now || new Date();
    var a = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) a--;
    return a;
  }
  function checkDob(d, m, y) {
    if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) return { err: 'form.dob.err.invalid' };
    d = +d; m = +m; y = +y;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return { err: 'form.dob.err.invalid' };
    var now = new Date(); now.setHours(0, 0, 0, 0);
    if (dt > now) return { err: 'form.dob.err.future' };
    var a = ageFrom(y, m, d, now);
    if (a < AGE_MIN || a > AGE_MAX) return { err: 'form.dob.err.range' };
    return { age: a, iso: y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d };
  }
  function dobCard(pid) {
    var card = mk('div', 'card fld'), gid = 'dob-' + pid;
    card.setAttribute('role', 'group'); card.setAttribute('aria-labelledby', gid + '-l'); card.setAttribute('data-dob', pid);
    var head = mk('div', 'row sp');
    var l = mk('b', '', T('form.dob')); l.id = gid + '-l'; head.appendChild(l);
    var age = document.createElement('output'); age.className = 'cap'; age.setAttribute('data-dobage', ''); age.setAttribute('aria-live', 'polite'); head.appendChild(age);
    card.appendChild(head);
    var row = mk('div', 'dobrow'), names = monthNames();
    dobOrder().forEach(function (part) {
      var w = mk('label', 'dobf ' + part); w.appendChild(mk('span', '', T('form.dob.' + part)));
      var el;
      if (part === 'month') {
        el = document.createElement('select'); el.className = 'inp';
        var o0 = document.createElement('option'); o0.value = ''; o0.textContent = '–'; el.appendChild(o0);
        names.forEach(function (n, i) { var o = document.createElement('option'); o.value = String(i + 1); o.textContent = n; el.appendChild(o); });
        el.setAttribute('autocomplete', 'bday-month');
      } else {
        el = document.createElement('input'); el.type = 'text'; el.className = 'inp';
        el.setAttribute('inputmode', 'numeric'); el.setAttribute('maxlength', part === 'year' ? '4' : '2');
        el.setAttribute('autocomplete', part === 'year' ? 'bday-year' : 'bday-day');
        el.setAttribute('placeholder', T(part === 'year' ? 'form.dob.ph.year' : 'form.dob.ph.day'));
      }
      el.setAttribute('data-dobpart', part); el.setAttribute('aria-describedby', gid + '-m');
      w.appendChild(el); row.appendChild(w);
    });
    card.appendChild(row);
    var msg = mk('p', 'cap fldmsg'); msg.id = gid + '-m'; msg.setAttribute('data-dobmsg', ''); msg.setAttribute('aria-live', 'polite'); msg.hidden = true;
    card.appendChild(msg);
    return card;
  }
  function dobRead(card) {
    var v = {}; $$('[data-dobpart]', card).forEach(function (el) { v[el.getAttribute('data-dobpart')] = String(el.value || '').trim(); }); return v;
  }
  function dobMsg(card, key, vars, bad) {
    var p = $('[data-dobmsg]', card); p.textContent = key ? T(key, vars) : ''; p.hidden = !key;
    $$('[data-dobpart]', card).forEach(function (el) { if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); });
  }
  function onDob(card, final) {
    var v = dobRead(card);
    var complete = v.day && v.month && /^\d{4}$/.test(v.year);
    if (!complete) { if (final && (v.day || v.month || v.year)) dobMsg(card, 'form.dob.err.invalid', null, true); else dobMsg(card, '', null, false); return; }
    var r = checkDob(v.day, v.month, v.year);
    if (r.err) { dobMsg(card, r.err, { min: AGE_MIN, max: AGE_MAX }, true); return; }
    state.dob = r.iso; state.age = r.age;
    dobMsg(card, r.age < AGE_ADULT ? 'form.dob.young' : '', { n: AGE_ADULT }, false);
    render();
  }
  document.addEventListener('input', function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-dobpart')) onDob(t.closest('[data-dob]'), false); });
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-dobpart')) onDob(t.closest('[data-dob]'), true); });
  function renderDob() {
    var p = String(state.dob || '').split('-'), vals = { year: p[0] || '', month: p[1] ? String(+p[1]) : '', day: p[2] ? String(+p[2]) : '' };
    $$('[data-dob]').forEach(function (card) {
      if (card.contains(document.activeElement)) { $$('[data-dobage]', card).forEach(function (o) { o.textContent = T('form.dob.age', { n: state.age }); }); return; }
      $$('[data-dobpart]', card).forEach(function (el) { var k = el.getAttribute('data-dobpart'); if (String(el.value) !== vals[k]) el.value = vals[k]; });
      $$('[data-dobage]', card).forEach(function (o) { o.textContent = T('form.dob.age', { n: state.age }); });
    });
  }

  function buildForms() {
    $$('[data-form]').forEach(function (box) {
      box.textContent = '';
      var pid = box.parentNode.parentNode.id;
      box.appendChild(stepperCard(pid, FIELDS[0]));
      box.appendChild(dobCard(pid));
      box.appendChild(stepperCard(pid, FIELDS[1]));
      var hint = mk('p', 'cap', T('step.hint')); box.appendChild(hint);
      var sc = mk('div', 'card fld'), t = mk('div', 'row sp');
      t.appendChild(mk('b', '', T('form.sex'))); t.appendChild(mk('span', 'cap', T('form.sex.cap')));
      var seg = mk('div', 'seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', T('form.sex'));
      ['m', 'w'].forEach(function (x) { var b = mk('button', 'sexbtn', T('sex.' + x)); b.setAttribute('data-sex', x); seg.appendChild(b); });
      sc.appendChild(t); sc.appendChild(seg); box.appendChild(sc);
    });
  }
  function renderForms() {
    $$('input[data-key]').forEach(function (i) { var k = i.getAttribute('data-key'); if (k === 'tweight') { i.min = tLo(); } if (k === 'weight') { i.min = wMin(); } if (k === 'rate') { i.max = state.goal === 'gain' ? 0.75 : 1; } if (String(i.value) !== String(state[k])) i.value = state[k]; i.setAttribute('aria-valuetext', state[k] + ''); });
    $$('input[data-val]').forEach(function (i) { var k = i.getAttribute('data-val'); if (document.activeElement !== i) i.value = fieldFmt(k, state[k]); });
    $$('input[type=range][data-key]').forEach(function (i) { var k = i.getAttribute('data-key'); if (UNIT[k]) i.setAttribute('aria-valuetext', fieldFmt(k, state[k]) + ' ' + T(UNIT[k])); });
    renderDob();
    $$('output[data-f]').forEach(function (o) { var k = o.getAttribute('data-f'); o.textContent = (k === 'weight' || k === 'tweight') ? f1(state[k]) : k === 'rate' ? rt(state.rate) : String(state[k]); });
    $$('[data-sex]').forEach(function (b) { var on = b.getAttribute('data-sex') === state.sex; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    $$('[data-summary]').forEach(function (box) {
      box.textContent = '';
      var bmi = bmiOf(state.weight), band = bandOf(bmi);
      var r1 = mk('div', 'row sp'), a = mk('div');
      a.appendChild(mk('p', 'cap', T('sum.bmi'))); a.appendChild(mk('div', 'big-n', f1(bmi)));
      r1.appendChild(a); r1.appendChild(mk('span', 'chip', T(band.k)));
      box.appendChild(r1);
      box.appendChild(mk('p', '', T('sum.kcal', { need: fmt(kcalNeed()), goal: fmt(calcGoalKcal()), goalname: gname(state.goal), mode: T('kcal.mode.' + state.goal) })));
      box.appendChild(mk('p', 'cap', T('sum.note')));
    });
  }

  // ---------- Zielgewicht und Tempo ----------

  // ---------- v5.2 Zielgewicht, Tempo und eigenes Kalorienziel ----------
  var KCAL_HARD = 800;                       // harte Untergrenze (VLCD), nicht unterschreitbar
  var PACE_KEYS = { sus: 'pace.sus', own: 'pace.own', kcal: 'pace.kcal' };
  var PACE_SUB = { sus: 'pace.opt.sus', own: 'pace.opt.own', kcal: 'pace.opt.kcal' };
  function bmr() { return 10 * state.weight + 6.25 * state.height - 5 * state.age + (state.sex === 'm' ? 5 : -161); }
  function kcalSafe() { return Math.max(kcalFloor(), Math.ceil(bmr() / 50) * 50); }   // ab hier ohne ärztliche Begleitung
  function kcalLow(k) { return k < kcalSafe(); }
  function kcalConfirmed() { return state.kcalConfAt != null && state.kcal >= state.kcalConfAt; }
  function kcalEff() { var k = state.kcal; return (kcalLow(k) && !kcalConfirmed()) ? kcalSafe() : k; }
  function kcalRate() { return Math.round((kcalEff() - kcalNeed()) / 1100 * 100) / 100; } // + = zunehmen, − = abnehmen (kg/Woche)
  function pmodeOk() { return state.goal === 'keep' && state.pmode === 'own' ? 'sus' : state.pmode; }
  function buildPace() {
    $$('[data-pace]').forEach(function (box) {
      box.textContent = '';
      var pid = box.parentNode.parentNode.id;
      var t = stepperCard(pid, ['tweight', 'pace.target', 'unit.kg']); t.setAttribute('data-p', 'target'); box.appendChild(t);
      var keep = mk('div', 'card mint stack'); keep.setAttribute('data-p', 'keep');
      keep.appendChild(mk('b', '', T('pace.keep.title'))); keep.appendChild(mk('p', '', T('pace.keep.text'))); box.appendChild(keep);
      var opts = mk('div', 'optlist'); opts.setAttribute('role', 'group'); opts.setAttribute('aria-label', T('pace.mode')); opts.setAttribute('data-p', 'mode');
      ['sus', 'own', 'kcal'].forEach(function (x) {
        var b = mk('button', 'opt'); b.type = 'button'; b.setAttribute('data-pmode', x);
        var dot = mk('span', 'radio'); dot.setAttribute('aria-hidden', 'true'); dot.appendChild(icon('check')); b.appendChild(dot);
        var tx = mk('span', 'tx grow'); tx.appendChild(mk('b', '', T(PACE_KEYS[x]))); tx.appendChild(mk('small', '', T(PACE_SUB[x]))); b.appendChild(tx);
        opts.appendChild(b);
      });
      box.appendChild(opts);
      var own = stepperCard(pid, ['rate', 'pace.rate', 'unit.kgweek']); own.setAttribute('data-p', 'own'); box.appendChild(own);
      var kc = stepperCard(pid, ['kcal', 'kcal.label', 'unit.kcalday']); kc.setAttribute('data-p', 'kcal');
      var pre = mk('div', 'presets'); pre.setAttribute('data-p', 'presets'); kc.appendChild(pre);
      kc.appendChild(mk('p', 'cap', T('kcal.preset.note')));
      box.appendChild(kc);
      var res = mk('div', 'stack'); res.setAttribute('data-p', 'res'); box.appendChild(res);
    });
  }
  function verdict() {
    var r = paceInfo().want;
    if (state.goal === 'lose') {
      if (r > Math.min(0.75, state.weight * 0.01)) return ['bad', T('v.bad.title'), T('v.lose.bad', { max: rt(Math.min(0.75, Math.round(state.weight * 0.01 / 0.05) * 0.05)), sus: rt(susRate()) })];
      if (r > 0.5) return ['warn', T('v.warn.title'), T('v.lose.warn')];
      return ['ok', T('v.ok.title'), T('v.lose.ok')];
    }
    if (state.goal === 'gain') {
      if (r > 0.5) return ['bad', T('v.bad.title'), T('v.gain.bad')];
      if (r > 0.35) return ['warn', T('v.warn.title'), T('v.gain.warn')];
      return ['ok', T('v.ok.title'), T('v.gain.ok')];
    }
    return null;
  }
  // Hinweis: kurz + aufklappbare Details (<details>, per Tastatur/Screenreader bedienbar)
  function addBanner(box, kind, title, text, more, moreId) {
    var b = mk('div', 'banner' + (kind === 'ok' ? ' ok' : kind === 'bad' ? ' bad' : '')); b.setAttribute('role', 'note');
    b.appendChild(icon(kind === 'ok' ? 'check' : 'alert'));
    var g = mk('span', 'grow'); g.appendChild(mk('b', '', title)); g.appendChild(mk('span', '', text));
    if (more) {
      var d = document.createElement('details'); d.className = 'more'; if (moreId && state.open[moreId]) d.open = true;
      if (moreId) d.addEventListener('toggle', function () { state.open[moreId] = d.open; });
      d.appendChild(mk('summary', '', T('common.more')));
      (Array.isArray(more) ? more : [more]).forEach(function (p) { d.appendChild(mk('p', '', p)); });
      g.appendChild(d);
    }
    b.appendChild(g); box.appendChild(b); return g;
  }
  function renderPresets(box) {
    var pre = $('[data-p=presets]', box); if (!pre) return;
    pre.textContent = '';
    var list = [];
    var sus = susGoalKcal();
    if (state.goal === 'lose') list.push({ k: 1200, t: T('kcal.preset.med', { k: fmt(1200) }), s: T('kcal.preset.med.sub') });
    list.push({ k: sus, t: T(state.goal === 'keep' ? 'kcal.preset.need' : 'kcal.preset.sus', { k: fmt(sus) }), s: '' });
    list.forEach(function (p) {
      var b = mk('button', 'preset' + (state.kcal === p.k ? ' on' : '')); b.type = 'button'; b.setAttribute('data-kpreset', String(p.k));
      b.setAttribute('aria-pressed', state.kcal === p.k ? 'true' : 'false');
      b.appendChild(mk('b', '', p.t)); if (p.s) b.appendChild(mk('small', '', p.s));
      pre.appendChild(b);
    });
  }
  function susGoalKcal() { var pm = state.pmode; state.pmode = 'sus'; var k = calcGoalKcalBase(); state.pmode = pm; return k; }
  function renderPace() {
    var keep = state.goal === 'keep', mode = pmodeOk(), pi = paceInfo(), pr = projection();
    $$('[data-pace]').forEach(function (box) {
      var act = document.activeElement, actId = act && box.contains(act) && act.id ? act.id : null;
      $('[data-p=target]', box).hidden = keep; $('[data-p=keep]', box).hidden = !keep || mode === 'kcal';
      $('[data-p=own]', box).hidden = keep || mode !== 'own';
      $('[data-p=kcal]', box).hidden = mode !== 'kcal';
      $$('[data-pmode]', box).forEach(function (b) {
        var x = b.getAttribute('data-pmode'), on = x === mode; b.hidden = keep && x === 'own';
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
        $('.radio', b).classList.toggle('on', on);
        if (x === 'sus') $('b', b).textContent = T(keep ? 'pace.sus.keep' : 'pace.sus');
      });
      if (mode === 'kcal') renderPresets(box);
      var res = $('[data-p=res]', box); res.textContent = '';
      if (mode === 'kcal') renderKcal(res, box.parentNode.parentNode.id, pr);
      else if (!keep) {
        var card = mk('div', 'card stack');
        var rows = [[T('pace.row.rate'), T('pace.row.rate.v', { r: rt(pi.eff) })], [T('pace.row.goal'), T('pace.row.goal.v', { k: fmt(state.goalKcal) })]];
        if (pr) rows.push([T('pace.row.reach'), T('pace.row.reach.v', { date: longDate(pr.date) })]);
        rows.forEach(function (x) { var r = mk('div', 'row sp'); r.appendChild(mk('span', 'cap', x[0])); r.appendChild(mk('b', 'big-s', x[1])); card.appendChild(r); });
        if (pr) card.appendChild(mk('p', 'cap', T('pace.weeks', { n: pr.weeks })));
        res.appendChild(card);
        if (mode === 'sus') {
          addBanner(res, 'ok', T('pace.sus.title'), state.goal === 'lose' ? T('pace.sus.lose', { until: pr ? T('pace.until', { date: longDate(pr.stab) }) : '' }) : T('pace.sus.gain'));
        } else { var v = verdict(); if (v) addBanner(res, v[0], v[1], v[2]); }
        if (pi.limited) addBanner(res, 'warn', T('pace.limited.title'), T('pace.limited.text', { floor: fmt(kcalFloor()), r: rt(pi.eff) }));
      }
      if (!keep) {
        if (state.goal === 'lose' && state.tweight >= state.weight - 0.05) addBanner(res, 'warn', T('pace.adj.title'), T('pace.adj.lose'));
        if (state.goal === 'gain' && state.tweight <= state.weight + 0.05) addBanner(res, 'warn', T('pace.adj.title'), T('pace.adj.gain'));
        if (state.goal === 'lose' && bmiOf(state.tweight) < 20 && bmiOf(state.tweight) >= 19) res.appendChild(mk('p', 'cap', T('pace.lownormal', { b: f1(18.5), kg: f1(tMin()) })));
        if (state.goal === 'lose' && bmiOf(state.tweight) >= 20) res.appendChild(mk('p', 'cap', T('pace.min', { kg: f1(tMin()) })));
      }
      var back = actId && document.getElementById(actId); if (back && document.activeElement !== back) back.focus({ preventScroll: true }); // Fokus nach Neuaufbau halten
    });
  }
  function renderKcal(res, pid, pr) {
    var need = Math.round(kcalNeed() / 50) * 50, k = state.kcal, eff = kcalEff(), r = kcalRate(), g = state.goal;
    var card = mk('div', 'card stack');
    var rate = r === 0 ? T('kcal.rate.zero') : T(r < 0 ? 'kcal.rate.lose' : 'kcal.rate.gain', { r: rt(Math.abs(r)) });
    var rows = [[T('pace.row.goal'), T('pace.row.goal.v', { k: fmt(eff) })], [T('kcal.row.need'), T('pace.row.goal.v', { k: fmt(need) })], [T('kcal.row.rate'), rate]];
    if (pr && g !== 'keep') rows.push([T('pace.row.reach'), T('pace.row.reach.v', { date: longDate(pr.date) })]);
    rows.forEach(function (x) { var rr = mk('div', 'row sp'); rr.appendChild(mk('span', 'cap', x[0])); rr.appendChild(mk('b', 'big-s', x[1])); card.appendChild(rr); });
    if (pr && g !== 'keep') card.appendChild(mk('p', 'cap', T('pace.weeks', { n: pr.weeks })));
    res.appendChild(card);
    // Leitplanke 1: unter Mindestwert bzw. Grundumsatz → nur unter ärztlicher Begleitung, mit Bestätigung
    if (kcalLow(k)) {
      var gg = addBanner(res, 'bad', T('kcal.low.title'), T('kcal.low.text', { safe: fmt(kcalSafe()) }),
        [T('kcal.low.more1', { floor: fmt(kcalFloor()), bmr: fmt(Math.round(bmr() / 10) * 10) }), T('kcal.low.more2'), T('kcal.low.more3')], 'kcalLow');
      var lab = mk('label', 'confirm'), cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = 'kconf-' + pid; cb.setAttribute('data-kconf', '');
      cb.checked = kcalConfirmed(); lab.appendChild(cb); lab.appendChild(mk('span', '', T('kcal.low.confirm'))); gg.appendChild(lab);
      if (!kcalConfirmed()) gg.appendChild(mk('p', 'cap', T('kcal.low.pending', { safe: fmt(kcalSafe()) })));
    }
    // Leitplanke 2: harte Untergrenze
    if (k <= KCAL_HARD) res.appendChild(mk('p', 'cap', T('kcal.hard', { min: fmt(KCAL_HARD) })));
    // Passende Hinweise je Ziel
    if (g === 'lose') {
      if (eff >= need - 50) addBanner(res, 'warn', T('kcal.lose.none.title'), T('kcal.lose.none', { need: fmt(need) }));
      else { var v = verdict(); if (v && v[0] !== 'ok') addBanner(res, v[0], v[1], v[2]); }
    } else if (g === 'gain') {
      if (eff <= need + 50) addBanner(res, 'warn', T('kcal.gain.none.title'), T('kcal.gain.none', { need: fmt(need) }), T('kcal.gain.more'), 'kcalGain');
      else { var v2 = verdict(); if (v2 && v2[0] !== 'ok') addBanner(res, v2[0], v2[1], v2[2]); }
    } else {
      addBanner(res, Math.abs(r) < 0.1 ? 'ok' : 'warn', T('kcal.keep.title'), T('kcal.keep.text', { need: fmt(need) }), Math.abs(r) >= 0.1 ? T(r < 0 ? 'kcal.keep.more.lose' : 'kcal.keep.more.gain', { r: rt(Math.abs(r)), goal: gname(r < 0 ? 'lose' : 'gain') }) : null, 'kcalKeep');
    }
  }

  // ---------- Allergien und Vorlieben ----------
  var PREF_GROUPS = [['pref.g.diet', ['veg', 'vegan']], ['pref.g.allergy', ['lactose', 'gluten', 'nuts']], ['pref.g.dislike', ['d_mush', 'd_fish', 'd_onion', 'd_cil']]];
  var EXC = { veg: ['meat', 'fish'], vegan: ['meat', 'fish', 'dairy', 'egg'], lactose: ['dairy'], gluten: ['gluten'], nuts: ['nuts'], d_mush: ['mushrooms'], d_fish: ['fish'], d_onion: ['onion'], d_cil: ['cilantro'] };
  function activePrefs() { return Object.keys(EXC).filter(function (k) { return state.prefs[k]; }); }
  function prefSum(k) { return T('prefsum.' + k); }
  function excluded() { var ex = []; activePrefs().forEach(function (k) { ex = ex.concat(EXC[k]); }); return ex; }
  function allowed(has) { var ex = excluded(); return !has.some(function (h) { return ex.indexOf(h) !== -1; }); }
  function buildPrefs() {
    $$('[data-prefs]').forEach(function (box) {
      box.textContent = '';
      PREF_GROUPS.forEach(function (g) {
        var c = mk('div', 'card stack'); c.appendChild(mk('h2', '', T(g[0])));
        var f = mk('div', 'filters');
        g[1].forEach(function (x) { var b = mk('button', 'fchip', T('pref.' + x)); b.setAttribute('data-pref', x); f.appendChild(b); });
        c.appendChild(f); box.appendChild(c);
      });
      box.appendChild(mk('p', 'cap', T('pref.note')));
    });
  }
  function renderPrefs() {
    $$('[data-pref]').forEach(function (b) { var on = !!state.prefs[b.getAttribute('data-pref')]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }

  // ---------- Texte aus recipes.json (mit Fallback Englisch) ----------
  function rget(sec, id) {
    var r = I.res(), v = r && r.recipes && r.recipes[sec] && Object.prototype.hasOwnProperty.call(r.recipes[sec], id) ? r.recipes[sec][id] : null;
    if (v) return v;
    var e = I.res(I.fallback); return (e && e.recipes && e.recipes[sec] && e.recipes[sec][id]) || id;
  }

  // ---------- Rezepte: Bewertung, Merkliste, Vielfalt ----------
  var RECIPES = [
    { id: 'oven_salmon', cui: 'european', kcal: 480, min: 20, p: 36, meal: 'dinner', has: ['fish'], pop: 9, c: 'c1' },
    { id: 'quinoa_pan', cui: 'mediterranean', kcal: 520, min: 25, p: 32, meal: 'dinner', has: ['onion'], pop: 7, c: 'c2' },
    { id: 'thai_curry', cui: 'thai', kcal: 540, min: 25, p: 34, meal: 'dinner', has: ['meat', 'cilantro'], pop: 9, c: 'c3' },
    { id: 'pho', cui: 'vietnamese', kcal: 430, min: 30, p: 31, meal: 'lunch', has: ['meat', 'onion', 'cilantro'], pop: 8, c: 'c4' },
    { id: 'summer_rolls', cui: 'vietnamese', kcal: 320, min: 15, p: 18, meal: 'lunch', has: ['fish', 'cilantro'], pop: 7, c: 'c5' },
    { id: 'birchermuesli', cui: 'swiss', kcal: 350, min: 5, p: 14, meal: 'breakfast', has: ['dairy', 'nuts'], pop: 8, c: 'c6' },
    { id: 'yogurt_bowl', cui: 'european', kcal: 240, min: 5, p: 12, meal: 'snack', has: ['dairy', 'nuts'], pop: 6, c: 'c1' },
    { id: 'lentil_curry', cui: 'indian', kcal: 440, min: 30, p: 22, meal: 'dinner', has: ['onion', 'cilantro'], pop: 7, c: 'c2' },
    { id: 'scrambled_eggs', cui: 'european', kcal: 360, min: 10, p: 24, meal: 'breakfast', has: ['egg', 'gluten'], pop: 6, c: 'c3' },
    { id: 'chicken_bowl', cui: 'japanese', kcal: 510, min: 25, p: 42, meal: 'lunch', has: ['meat'], pop: 8, c: 'c4' },
    { id: 'mushroom_polenta', cui: 'italian', kcal: 390, min: 20, p: 14, meal: 'dinner', has: ['mushrooms', 'onion', 'dairy'], pop: 5, c: 'c5' },
    { id: 'hummus_wrap', cui: 'middle_eastern', kcal: 410, min: 10, p: 15, meal: 'lunch', has: ['gluten'], pop: 6, c: 'c6' },
    { id: 'miso_salmon', cui: 'japanese', kcal: 460, min: 20, p: 35, meal: 'dinner', has: ['fish'], pop: 7, c: 'c1' },
    { id: 'shakshuka', cui: 'middle_eastern', kcal: 380, min: 20, p: 21, meal: 'breakfast', has: ['egg', 'onion'], pop: 6, c: 'c2' },
    { id: 'burrito_bowl', cui: 'mexican', kcal: 530, min: 20, p: 30, meal: 'lunch', has: ['onion', 'cilantro'], pop: 7, c: 'c3' }
  ];
  var RMEALS = { all: 1, breakfast: 1, lunch: 1, dinner: 1, snack: 1 }, RPROPS = { fast: 1, protein: 1, saved: 1 };
  var RECIPE_PHOTOS = { oven_salmon: 1, thai_curry: 1, pho: 1, summer_rolls: 1, birchermuesli: 1, yogurt_bowl: 1, lentil_curry: 1, scrambled_eggs: 1, chicken_bowl: 1, miso_salmon: 1, shakshuka: 1, burrito_bowl: 1 };
  function hasRecipePhoto(id) { return !!RECIPE_PHOTOS[id]; }
  function recipePhoto(id, kind) {
    var img = mk('img');
    var thumb = kind === 'thumb';
    img.src = 'images/recipes/' + id + (thumb ? '-thumb' : '') + '.webp';
    img.alt = rget('recipes', id);
    img.loading = thumb ? 'lazy' : 'eager';
    img.decoding = 'async';
    img.width = thumb ? 400 : 800;
    img.height = thumb ? 300 : 600;
    return img;
  }
  function recipeFigure(r, kind, featured) {
    var box = mk('div', 'img rimg ' + (hasRecipePhoto(r.id) ? 'has-photo' : ('ph ' + r.c)));
    if (hasRecipePhoto(r.id)) box.appendChild(recipePhoto(r.id, kind));
    else {
      box.setAttribute('role', 'img');
      box.setAttribute('aria-label', T('recipe.img'));
      box.appendChild(icon('leaf', featured ? 'l' : ''));
    }
    return box;
  }
  function rscore(r) { var s = state.ratings[r.id]; return (s ? s * 2 : 5) + r.pop / 2 + (state.saved[r.id] ? 1 : 0); }
  function rlist() {
    var f = RECIPES.filter(function (r) {
      if (state.rmeal !== 'all' && r.meal !== state.rmeal) return false;
      if (state.rprops.fast && r.min > 15) return false;
      if (state.rprops.protein && r.p < 30) return false;
      if (state.rprops.saved && !state.saved[r.id]) return false;
      return allowed(r.has);
    }).sort(function (a, b) { return rscore(b) - rscore(a); });
    // Vielfalt: nie zweimal hintereinander dieselbe Küche, wenn eine Alternative da ist
    var out = [];
    while (f.length) {
      var last = out.length ? out[out.length - 1].cui : '', idx = 0;
      for (var i = 0; i < f.length; i++) if (f[i].cui !== last) { idx = i; break; }
      out.push(f.splice(idx, 1)[0]);
    }
    return out;
  }
  function span(txt, ic) { var s_ = mk('span'); if (ic) s_.appendChild(icon(ic, 's')); s_.appendChild(document.createTextNode((ic ? ' ' : '') + txt)); return s_; }
  function recipeMeta(r) { var m = mk('div', 'meta'); m.appendChild(span(T('recipe.kcal', { n: fmt(r.kcal) }), 'flame')); m.appendChild(span(T('recipe.min', { n: r.min }), 'clock')); m.appendChild(span(T('recipe.protein', { n: r.p }))); return m; }
  function recipeBadges() {
    var a = activePrefs().slice(0, 3); if (!a.length) return null;
    var w = mk('div', 'badges'); a.forEach(function (k) { w.appendChild(mk('span', 'chip sm', '✓ ' + prefSum(k))); }); return w;
  }
  function stars(r) {
    var w = mk('div', 'stars'), cur = state.ratings[r.id] || 0;
    w.setAttribute('role', 'group'); w.setAttribute('aria-label', cur ? T('recipe.rated', { n: cur }) : T('recipe.rate', { n: '1–5' }));
    for (var n = 1; n <= 5; n++) {
      var b = mk('button', 'star' + (n <= cur ? ' on' : '')); b.setAttribute('data-rate', r.id + ':' + n);
      b.setAttribute('aria-label', T('recipe.rate', { n: n })); b.setAttribute('aria-pressed', n === cur ? 'true' : 'false');
      b.appendChild(icon('star', n <= cur ? 'fill s' : 's')); w.appendChild(b);
    }
    return w;
  }
  function saveBtn(r) {
    var on = !!state.saved[r.id], b = mk('button', 'savebtn' + (on ? ' on' : ''));
    b.setAttribute('data-save', r.id); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? T('recipe.unsave') : T('recipe.save'));
    b.appendChild(icon('bookmark', on ? 'fill s' : 's')); return b;
  }
  function renderRecipes() {
    var box = $('#recipeList'); box.textContent = '';
    var ok = rlist();
    ok.forEach(function (r, i) {
      var card, img = recipeFigure(r, i === 0 ? 'full' : 'thumb', i === 0);
      var cui = mk('span', 'cui', rget('cuisines', r.cui));
      if (i === 0) {
        card = mk('div', 'card hcard recipe feat'); img.appendChild(cui); card.appendChild(img);
        var body = mk('div', 'body stack'), top = mk('div', 'row top sp'); top.appendChild(mk('h2', 'grow', rget('recipes', r.id))); top.appendChild(saveBtn(r));
        body.appendChild(top);
        var tr = mk('div', 'row sp'); tr.appendChild(mk('span', 'chip', T('recipe.top'))); tr.appendChild(stars(r)); body.appendChild(tr);
        body.appendChild(recipeMeta(r));
        var bd = recipeBadges(); if (bd) body.appendChild(bd);
        var add = mk('button', 'btn line'); add.setAttribute('data-addlist', r.id); add.appendChild(icon('cart', 's')); add.appendChild(document.createTextNode(' ' + T('recipe.addlist')));
        body.appendChild(add); card.appendChild(body);
      } else {
        card = mk('div', 'card recipe sm'); card.appendChild(img);
        var g = mk('div', 'grow'), tg = mk('div', 'row sp');
        tg.appendChild(mk('div', 'tg', T('meal.' + r.meal) + ' · ' + rget('cuisines', r.cui))); tg.appendChild(saveBtn(r));
        g.appendChild(tg); g.appendChild(mk('h3', '', rget('recipes', r.id))); g.appendChild(recipeMeta(r)); g.appendChild(stars(r));
        card.appendChild(g);
      }
      card.setAttribute('data-recipe', r.id);
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', T('recipe.open') + ': ' + rget('recipes', r.id));
      box.appendChild(card);
    });
    if (!ok.length) { var e = mk('div', 'card mint stack'); e.appendChild(mk('b', '', T('recipe.none.title'))); e.appendChild(mk('p', '', T('recipe.none.text'))); box.appendChild(e); }
    var info = $('#recipeInfo'), act = activePrefs(), hidden = RECIPES.length - RECIPES.filter(function (r) { return allowed(r.has); }).length;
    info.textContent = ''; info.classList.toggle('ok', act.length > 0);
    info.appendChild(icon(act.length ? 'check' : 'leaf'));
    var gi = mk('span', 'grow');
    gi.appendChild(mk('b', '', act.length ? T('recipe.info.ok') : T('recipe.info.none')));
    gi.appendChild(mk('span', '', act.length ? act.map(prefSum).join(' · ') + '. ' + (hidden ? T('recipe.info.hidden', { n: hidden }) : '') : T('recipe.info.hint')));
    info.appendChild(gi); info.appendChild(icon('chev', 's'));
    $$('[data-rmeal]').forEach(function (b) { var on = b.getAttribute('data-rmeal') === state.rmeal; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    $$('[data-rprop]').forEach(function (b) { var on = !!state.rprops[b.getAttribute('data-rprop')]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    renderShop();
  }

  // ---------- Einkaufsliste: offen / im Korb / schon zu Hause ----------
  var SHOP = [
    { id: 'broccoli', grp: 'veg', qty: 500, unit: 'g', has: [] },
    { id: 'berries', grp: 'veg', qty: 250, unit: 'g', has: [] },
    { id: 'yogurt', grp: 'dairy', qty: 500, unit: 'g', has: ['dairy'] },
    { id: 'eggs', grp: 'dairy', qty: 6, unit: 'pc', has: ['egg'] },
    { id: 'chickpeas', grp: 'pantry', qty: 400, unit: 'g', has: [] },
    { id: 'quinoa', grp: 'pantry', qty: 500, unit: 'g', has: [] },
    { id: 'nuts', grp: 'pantry', qty: 200, unit: 'g', has: ['nuts'] },
    { id: 'olive_oil', grp: 'pantry', qty: 1, unit: 'bottle', has: [] }
  ];
  var SHOP_ST = { open: 1, cart: 1, home: 1 };

  // ---------- Erfassen per Text oder Stimme (Simulation) ----------
  var FOODS = [
    { id: 'spaghetti', kcal: 620, p: 22 }, { id: 'birchermuesli', kcal: 350, p: 14 }, { id: 'chicken_rice', kcal: 560, p: 40 },
    { id: 'salad', kcal: 280, p: 9 }, { id: 'pizza', kcal: 850, p: 34 }, { id: 'sushi', kcal: 480, p: 24 },
    { id: 'pad_thai', kcal: 640, p: 25 }, { id: 'rosti_egg', kcal: 590, p: 20 }, { id: 'banana', kcal: 105, p: 1.3 }, { id: 'apple', kcal: 80, p: 0.4 }
  ];
  var PORTION = { s: 0.7, m: 1, l: 1.4 }, PORTION_KEY = { s: 'erfassen.kleiner_teller', m: 'erfassen.mittlerer_teller', l: 'erfassen.grosser_teller' };
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  function renderFood() {
    var box = $('#foodSug'); if (!box) return; box.textContent = '';
    var q = norm(state.foodQ).trim(), f = PORTION[state.portion];
    $$('[data-portion]').forEach(function (b) { var on = b.getAttribute('data-portion') === state.portion; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var list = FOODS.filter(function (x) { return !q || norm(rget('foods', x.id)).indexOf(q) !== -1 || norm(x.id).indexOf(q) !== -1; }).slice(0, q ? 5 : 3);
    if (!list.length) { box.appendChild(mk('p', 'cap', T('food.none'))); return; }
    list.forEach(function (x) {
      var nm = rget('foods', x.id), b = mk('button', 'favrow'); b.setAttribute('data-food', x.id); b.setAttribute('aria-label', T('food.add', { name: nm }));
      var c = mk('span', 'fthumb'); c.appendChild(icon('utensils', 's')); b.appendChild(c);
      var g = mk('span', 'grow'); g.appendChild(mk('b', '', nm)); var cp = mk('span', 'cap blk', T('food.kcal', { portion: T(PORTION_KEY[state.portion]), kcal: fmt(x.kcal * f) })); g.appendChild(cp); b.appendChild(g);
      var pl = mk('span', 'circ sm p'); pl.appendChild(icon('plus', 's')); b.appendChild(pl); box.appendChild(b);
    });
  }
  var micTimer;
  function micSim() {
    var m = $('#micTxt'), btn = $('#micBtn'); m.hidden = false; btn.classList.add('on'); clearTimeout(micTimer);
    micTimer = setTimeout(function () {
      m.hidden = true; btn.classList.remove('on');
      state.foodQ = rget('foods', 'spaghetti'); $('#foodQ').value = state.foodQ; renderFood();
      toast(T('food.heard', { q: state.foodQ }));
    }, 1500);
  }

  // ---------- Wasser, Favoriten, Extras, Plananpassung ----------
  var FAVS = [
    { id: 'oatmeal_berries', kcal: 320, p: 9, fav: true }, { id: 'lentil_salad', kcal: 400, p: 19, fav: true },
    { id: 'yogurt_nuts', kcal: 240, p: 12, fav: false }, { id: 'apple_almonds', kcal: 180, p: 5, fav: false }, { id: 'pizza_whole', kcal: 1250, p: 48, fav: false }
  ];
  function buildFavs() {
    var box = $('#favList'); box.textContent = '';
    FAVS.forEach(function (f, i) {
      var nm = rget('foods', f.id), b = mk('button', 'favrow'); b.setAttribute('data-fav', String(i)); b.setAttribute('aria-label', T('fav.aria', { name: nm }));
      var c = mk('span', 'circ'); c.appendChild(icon(f.fav ? 'star' : 'utensils', f.fav ? 'fill' : '')); b.appendChild(c);
      var g = mk('span', 'grow'); g.appendChild(mk('b', '', nm)); g.appendChild(mk('span', 'cap blk', T('fav.label', { kind: T(f.fav ? 'fav.fav' : 'fav.often'), kcal: fmt(f.kcal), p: f.p })));
      b.appendChild(g);
      var pl = mk('span', 'circ sm p'); pl.appendChild(icon('plus', 's')); b.appendChild(pl);
      box.appendChild(b);
    });
  }
  // Extras speichern den Namen als Funktion, damit er beim Sprachwechsel neu übersetzt wird
  function addExtra(m) {
    if (state.extra.length >= 10) { toast(T('toast.enough')); return; }
    state.extra.push({ name: m.name, kcal: m.kcal, p: m.p, tag: m.tag || 'tag.meal' }); render(); toast(T('toast.logged', { name: m.name() }));
  }
  function extraSum(k) { return state.extra.reduce(function (s_, e) { return s_ + e[k]; }, 0); }
  function renderExtras() {
    var box = $('#extraMeals'); box.textContent = '';
    state.extra.forEach(function (e) {
      var r = mk('div', 'meal'); var th = mk('span', 'th'); th.appendChild(icon('utensils')); r.appendChild(th);
      var g = mk('div', 'grow'); g.appendChild(mk('small', '', T(e.tag))); g.appendChild(mk('b', '', e.name())); r.appendChild(g);
      r.appendChild(mk('span', 'kc', T('recipe.kcal', { n: fmt(e.kcal) }))); box.appendChild(r);
    });
  }
  function renderAdapt() {
    var over = state.eaten - state.goalKcal, b = $('#adaptBanner');
    if (over <= 0) { b.hidden = true; return; }
    b.hidden = false;
    if (state.goal === 'gain') { $('#adaptT').textContent = T('adapt.gain.title'); $('#adaptX').textContent = T('adapt.gain.text'); return; }
    var per = Math.min(150, Math.ceil(over / 3 / 10) * 10);
    per = Math.max(0, Math.min(per, state.goalKcal - kcalFloor()));
    $('#adaptT').textContent = T('adapt.title');
    $('#adaptX').textContent = T('adapt.over', { n: fmt(over) }) + ' ' + (per > 0 ? T(per * 3 < over ? 'adapt.spread.rest' : 'adapt.spread', { per: fmt(per) }) : T('adapt.keep')) + ' ' + T('adapt.calm');
  }
  function renderWater() {
    var n = state.water, g = state.waterGoal;
    $('#waterNow').textContent = fmt(n);
    $('#waterGl').textContent = T('water.glasses', { n: Math.round(n / 250), g: Math.round(g / 250) });
    $('#waterBar').style.width = Math.min(100, n / g * 100) + '%';
    $('#waterMsg').textContent = n >= g ? T('water.done') : T('water.left', { n: fmt(g - n) });
  }
  var WK_W = { lose: -0.4, keep: 0, gain: 0.3 };
  var NOTIF_GO = { meals: 'erfassen', weigh: 'fortschritt', photo: 'fortschritt', water: 'heute' };
  function showNotif(k) {
    if (!NOTIF_GO[k]) return;
    if (!state.rem[k]) { toast(T('notif.off')); return; }
    var n = $('#notif');
    $('#notifT').textContent = T('notif.' + k + '.t');
    $('#notifX').textContent = T('notif.' + k + '.x', { n: fmt(state.water), g: fmt(state.waterGoal) });
    n.setAttribute('data-go', NOTIF_GO[k]); n.hidden = false;
    clearTimeout(showNotif.h); showNotif.h = setTimeout(function () { n.hidden = true; }, 6000);
  }
  var BARHAS = ['dairy'];
  var barTimer;
  function showBar() {
    clearTimeout(barTimer);
    $('#capCam').hidden = true; $('#capBusy').hidden = true; $('#capRes').hidden = true; $('#capBar').hidden = false;
    $('#barScan').hidden = false; $('#barRes').hidden = true;
    barTimer = setTimeout(function () {
      $('#barScan').hidden = true; $('#barRes').hidden = false; renderBarFit();
    }, 1600);
  }
  function renderBarFit() {
    var ok = allowed(BARHAS), f = $('#barFit');
    f.classList.toggle('ok', ok);
    $('#barFitT').textContent = T(ok ? 'bar.ok.t' : 'bar.bad.t');
    $('#barFitX').textContent = T(ok ? 'bar.ok.x' : 'bar.bad.x');
  }

  function topRecipe() { var l = rlist(); return l.length ? l[0] : RECIPES[0]; }
  function render() {
    // Schutz: kein Abnehmen-Ziel bei BMI unter 18.5, Zielgewicht nie unter BMI 18.5
    if (state.goal === 'lose' && loseBlocked()) { state.goal = 'keep'; state.goalWas = 'lose'; }
    else if (state.goalWas && !loseBlocked()) { state.goal = state.goalWas; state.goalWas = null; state.tweight = Math.max(tMin(), Math.min(state.weight - 0.5, Math.round(kgOf(24) * 2) / 2)); }
    if (state.goal === 'keep') state.tweight = Math.round(state.weight * 2) / 2;
    else if (state.goal === 'lose') state.tweight = Math.max(state.tweight, tMin());
    state.eaten = BASE_EATEN + (state.dinnerSaved ? mealKcal() : 0) + extraSum('kcal');
    state.protein = BASE_PROTEIN + (state.dinnerSaved ? mealProtein() : 0) + extraSum('p');
    state.goalKcal = calcGoalKcal();
    var remaining = state.goalKcal - state.eaten, gainG = state.goal === 'gain';
    var bmi = bmiOf(state.weight), band = bandOf(bmi), upKg = kgOf(24.9), loKg = kgOf(18.5);
    var bind = function (k, v) { $$('[data-bind=' + k + ']').forEach(function (e) { e.textContent = v; }); };
    bind('weight', f1(state.weight)); bind('tweight', f1(state.tweight));
    bind('bmi', f1(bmi)); bind('bandshort', T(band.ks));
    bind('datasummary', T('data.summary', { h: String(state.height), age: String(state.age), sex: T('sex.' + state.sex), w: f1(state.weight) }));
    var toN = bmi >= 25 ? state.weight - upKg : bmi < 18.5 ? loKg - state.weight : 0;
    bind('toNormal', toN > 0.04 ? f1(toN) + ' kg' : T('tonormal.in'));
    bind('toNormalLbl', toN > 0.04 ? T('tonormal.lbl') : T('bmi.normal'));
    bind('remainTitle', toN > 0.04 ? T('remain.title', { n: f1(toN) }) : T('remain.in'));
    var tdiff = state.weight - state.tweight;
    bind('remainText', T('remain.text', { lo: f1(loKg), hi: f1(upKg) }) + ' ' + (Math.abs(tdiff) < 0.05 ? T('remain.reached') : tdiff > 0 ? T('remain.lose', { n: f1(tdiff), t: f1(state.tweight) }) : T('remain.gain', { n: f1(-tdiff), t: f1(state.tweight) })));
    var dl = state.weight - wAt(29);
    $('#wDelta span').textContent = T('wdelta', { sign: dl <= 0 ? '–' : '+', n: f1(Math.abs(dl)), date: I.date(dayPlus(-29), { day: 'numeric', month: 'short' }) });
    var wu = $('#wDelta use'); if (wu) wu.setAttribute('href', dl <= 0 ? '#i-down' : '#i-up');
    $('#wRemain').classList.toggle('ok', toN <= 0.04);
    renderForms();
    $$('.goal').forEach(function (b) { var g = b.getAttribute('data-goal'), on = g === state.goal; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (g === 'lose') { var dis = loseBlocked(); b.disabled = dis; b.classList.toggle('dis', dis); } });
    renderPace(); renderSafe(); renderPrefs(); renderRecipes(); renderExtras(); renderAdapt(); renderWater(); renderFood(); renderPartner(); renderPlan();
    bind('wgoal', fmt(state.waterGoal)); bind('wgl', String(Math.round(state.waterGoal / 250)));
    bind('pacesummary', state.goal === 'keep' ? T(state.pmode === 'kcal' ? 'pacesum.keep.kcal' : 'pacesum.keep', { k: fmt(state.goalKcal) }) : (state.pmode === 'kcal' ? T('pacesum.kcal', { t: f1(state.tweight), k: fmt(state.goalKcal) }) : T('pacesum', { t: f1(state.tweight), mode: T(PACE_KEYS[state.pmode]), r: rt(paceInfo().eff) })));
    bind('prefsummary', activePrefs().length ? activePrefs().map(prefSum).join(', ') : T('prefsum.none'));
    var remN = Object.keys(state.rem).filter(function (k) { return state.rem[k]; }).length;
    bind('remsummary', remN ? T('rem.active', { n: remN }) : T('rem.alloff'));
    $$('[data-remtx]').forEach(function (e) { var k = e.getAttribute('data-remtx'); e.textContent = state.rem[k] ? T('rem.' + k) : T('rem.off'); });
    bind('remaining', fmt(Math.max(0, remaining)));
    $('#ringNum').textContent = fmt(Math.abs(remaining));
    $('#ringLbl').textContent = T(gainG ? (remaining >= 0 ? 'ring.toGoal' : 'ring.overGoal') : (remaining >= 0 ? 'ring.left' : 'ring.over'));
    $('#recSub').textContent = T(gainG ? 'recipe.sub.gain' : 'recipe.sub.lose', { n: fmt(Math.max(0, remaining)) });
    $('#restSub').textContent = T(gainG ? 'rest.sub.gain' : 'rest.sub.lose', { n: fmt(Math.max(0, remaining)) });
    $('#profSub').textContent = T('prof.sub', { goal: gname(state.goal), t: state.target });
    $('#todayDate').textContent = I.date(TODAY, { weekday: 'long', day: 'numeric', month: 'long' });
    var g = state.goal;
    $('#wkThree').textContent = T('week.' + g + '.three'); $('#wkAdapt').textContent = T('week.' + g + '.adapt');
    $('#wkBetter').textContent = T(g === 'gain' ? 'week.gain.better' : 'week.better');
    $('#wkWeight').textContent = (WK_W[g] > 0 ? '+' : WK_W[g] < 0 ? '–' : '±') + f1(Math.abs(WK_W[g])) + ' kg';
    bind('goalkcal', T('recipe.kcal', { n: fmt(state.goalKcal) }));
    bind('eaten', T('recipe.kcal', { n: fmt(state.eaten) }));
    bind('goalname', gname(state.goal));
    if ($('#fortschritt').classList.contains('active') || $('#koerper').classList.contains('active')) drawCharts();
    bind('target', String(state.target));
    var C = 2 * Math.PI * 66, pct = Math.max(0, Math.min(1, state.eaten / state.goalKcal));
    $('#ring').setAttribute('stroke-dasharray', (C * pct).toFixed(1) + ' ' + C.toFixed(1));
    $('#proTxt').textContent = Math.round(state.protein) + ' / ' + state.target + ' g';
    $('#barPro').style.width = Math.min(100, state.protein / state.target * 100) + '%';
    var b = $('#proteinBanner'), low = state.protein < state.target * 0.75;
    b.classList.toggle('ok', !low);
    $('b', b).textContent = low ? T('heute.zu_wenig_protein') : T('protein.ok.t');
    $('#proteinMsg').textContent = T(low ? 'protein.low.x' : 'protein.ok.x', { t: state.target, p: Math.round(state.protein) });
    var d = $('#dinner');
    d.classList.toggle('empty', !state.dinnerSaved);
    $('#dinnerName').textContent = state.dinnerSaved ? T('dinner.saved') : T('dinner.none');
    $('#dinnerKcal').textContent = state.dinnerSaved ? T('recipe.kcal', { n: fmt(mealKcal()) }) : '–';
    renderSoundState(); renderLangBinds(); renderBackup();
  }

  // Balken-Breiten per CSSOM (CSP-konform, kein style-Attribut im HTML)
  function applyWidths() {
    $$('[data-w]').forEach(function (e) {
      var v = parseFloat(e.getAttribute('data-w'));
      if (isFinite(v)) e.style.width = Math.max(0, Math.min(100, v)) + '%';
    });
  }

  // KI-Foto-Analyse (nach V1, hier simuliert)
  function mealKcal() { return ITEMS.reduce(function (s, i) { return s + i.g * i.kcal100 / 100; }, 0); }
  function mealProtein() { return ITEMS.reduce(function (s, i) { return s + i.g * i.p100 / 100; }, 0); }
  function renderItems() {
    var box = $('#items'); box.textContent = '';
    ITEMS.forEach(function (it) {
      var name = T(it.key), row = mk('div', 'item'), nm = mk('div', 'grow');
      nm.appendChild(mk('b', '', name)); nm.appendChild(mk('div', 'cap', T('item.estimate')));
      var step = mk('div', 'step');
      var minus = mk('button', '', '–'); minus.setAttribute('aria-label', T('item.less', { name: name }));
      var out = document.createElement('output'); out.textContent = it.g + ' g';
      var plus = mk('button', '', '+'); plus.setAttribute('aria-label', T('item.more', { name: name }));
      minus.addEventListener('click', function () { it.g = Math.max(10, it.g - 10); renderItems(); });
      plus.addEventListener('click', function () { it.g = Math.min(500, it.g + 10); renderItems(); });
      step.appendChild(minus); step.appendChild(out); step.appendChild(plus);
      row.appendChild(nm); row.appendChild(step); row.appendChild(mk('b', 'kc', T('recipe.kcal', { n: fmt(it.g * it.kcal100 / 100) })));
      box.appendChild(row);
    });
    var tot = Math.round(mealKcal());
    $('#totalKcal').textContent = T('recipe.kcal', { n: fmt(tot) });
    var rest = state.goalKcal - (BASE_EATEN + extraSum('kcal') + tot);
    $('#afterTxt').textContent = state.goal === 'gain' ? (rest > 0 ? T('after.gain.left', { n: fmt(rest) }) : T('after.gain.done')) : T('after.left', { n: fmt(rest) });
  }
  var busyTimer;
  function syncCapActions() {
    var a = $('#capActions');
    if (a) a.hidden = !$('#capRes') || $('#capRes').hidden;
  }
  function resetCapture() {
    clearTimeout(busyTimer); clearTimeout(barTimer);
    $('#capCam').hidden = false; $('#capBusy').hidden = true; $('#capRes').hidden = true; $('#capBar').hidden = true;
    syncCapActions();
  }
  function analyse() {
    $('#capCam').hidden = true; $('#capBusy').hidden = false; syncCapActions();
    busyTimer = setTimeout(function () { $('#capBusy').hidden = true; $('#capRes').hidden = false; syncCapActions(); renderItems(); }, 1400);
  }

  // Kraft-Timer (Simulation)
  var tInt = null, tLeft = 600;
  function paintTimer() { var m = Math.floor(tLeft / 60), s = tLeft % 60; $('#timerTxt').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function trainLabel() { $('#trainBtn').lastChild.textContent = ' ' + T(tInt ? 'train.pause' : 'kraft.training_starten'); }
  function stopTimer() { clearInterval(tInt); tInt = null; trainLabel(); }
  function toggleTimer() {
    if (tInt) { stopTimer(); return; }
    $('#trainBox').hidden = false; if (tLeft <= 0) tLeft = 600;
    tInt = setInterval(function () { tLeft -= 1; paintTimer(); if (tLeft <= 0) { stopTimer(); showReward('reward.train'); } }, 1000);
    trainLabel();
  }
  var tlTimer;
  function timelapse() {
    var cells = $$('#tl .th2').slice(0, 3), i = 0;
    clearInterval(tlTimer);
    function step() { cells.forEach(function (c, n) { c.classList.toggle('act', n === i); }); i += 1; if (i > cells.length) { clearInterval(tlTimer); cells.forEach(function (c) { c.classList.remove('act'); }); } }
    step(); tlTimer = setInterval(step, 800);
  }

  // ---------- Darstellung (Hell / Dunkel / System) ----------
  function renderTheme() {
    if (!window.EdoTheme) return;
    var p = window.EdoTheme.pref(), e = window.EdoTheme.eff();
    $$('[data-theme-set]').forEach(function (b) { var on = b.getAttribute('data-theme-set') === p; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var n = $('#themeNote'); if (n) n.textContent = T('theme.' + p) + (p === 'system' ? ' ' + T(e === 'dark' ? 'theme.now.dark' : 'theme.now.light') : '');
    var q = $('#themeQuick');
    if (q) { var u = q.querySelector('use'); if (u) u.setAttribute('href', e === 'dark' ? '#i-sun' : '#i-moon'); q.setAttribute('aria-label', T(e === 'dark' ? 'theme.toLight' : 'theme.toDark')); }
    if ($('#fortschritt').classList.contains('active') || $('#koerper').classList.contains('active')) drawCharts();
  }
  document.addEventListener('edovita-theme', renderTheme);

  // ---------- Töne: feste Whitelist, nur nach Berührung, nie wenn Ton aus ----------
  var AUDIO = { H1: 'audio/hymne_H1.mp3', H5: 'audio/hymne_H5.mp3', H4: 'audio/hymne_H4.mp3', A_aufbruch: 'audio/A_aufbruch.mp3', B_erfolg: 'audio/B_erfolg.mp3', C_zusammen: 'audio/C_zusammen.mp3' };
  var HYMNS = ['H1', 'H5', 'H4'], SFX = [['A_aufbruch', 'A'], ['B_erfolg', 'B'], ['C_zusammen', 'C']];
  var player = null, playing = '', fadeInt = null;
  function stopSound() { clearInterval(fadeInt); if (player) { try { player.pause(); } catch (e) { /* egal */ } } playing = ''; renderSoundUI(); }
  function play(id, force) {
    if (!Object.prototype.hasOwnProperty.call(AUDIO, id)) return;
    if (!state.sound && !force) return;
    stopSound();
    player = player || new Audio();
    player.src = AUDIO[id]; player.volume = 0.8; player.currentTime = 0;
    playing = id;
    player.onended = function () { playing = ''; renderSoundUI(); };
    var pr = player.play(); if (pr && pr.catch) pr.catch(function () { playing = ''; renderSoundUI(); });
    renderSoundUI();
  }
  function fadeOut() {
    if (!player || !playing) return; clearInterval(fadeInt);
    fadeInt = setInterval(function () { if (player.volume > 0.08) player.volume = Math.max(0, player.volume - 0.08); else stopSound(); }, 80);
  }
  function setSound(on) {
    state.sound = !!on; setPref('edovita.sound', on ? 'on' : 'off');
    if (!on) stopSound();
    renderSoundState(); toast(T(on ? 'sound.toast.on' : 'sound.toast.off'));
  }
  function renderSoundState() {
    $$('[data-sound]').forEach(function (b) { b.setAttribute('aria-checked', state.sound ? 'true' : 'false'); });
    var q = $('#soundQuick');
    if (q) { var u = q.querySelector('use'); if (u) u.setAttribute('href', state.sound ? '#i-vol' : '#i-volx'); q.setAttribute('aria-label', T(state.sound ? 'sound.toggle.on' : 'sound.toggle.off')); q.setAttribute('aria-pressed', state.sound ? 'true' : 'false'); }
    $$('[data-bind=soundsummary]').forEach(function (e) { e.textContent = state.sound ? T('sound.on') + ' · ' + state.hymn : T('sound.off'); });
  }
  function soundRow(id, title, sub, isHymn) {
    var row = mk('div', 'set');
    if (isHymn) {
      var r = mk('button', 'radio' + (state.hymn === id ? ' on' : '')); r.setAttribute('data-hymn', id);
      r.setAttribute('aria-pressed', state.hymn === id ? 'true' : 'false'); r.setAttribute('aria-label', T(state.hymn === id ? 'sound.chosen' : 'sound.choose') + ': ' + title);
      row.appendChild(r);
    } else { var c = mk('span', 'circ'); c.appendChild(icon('music')); row.appendChild(c); }
    var tx = mk('div', 'tx grow'); tx.appendChild(mk('b', '', title)); tx.appendChild(mk('small', '', sub)); row.appendChild(tx);
    var on = playing === id, p = mk('button', 'circbtn sm' + (on ? ' on' : ''));
    p.setAttribute('data-preview', id); p.setAttribute('aria-label', T(on ? 'sound.stop' : 'sound.play') + ': ' + title);
    p.appendChild(icon(on ? 'pause' : 'play', 's')); row.appendChild(p);
    return row;
  }
  function renderSoundUI() {
    var h = $('#hymnList'), s = $('#sfxList'); if (!h || !s) return;
    h.textContent = ''; s.textContent = '';
    HYMNS.forEach(function (id) { h.appendChild(soundRow(id, T('hymn.' + id), T('hymn.ai') + (state.hymn === id ? ' · ' + T('sound.chosen') : ''), true)); });
    SFX.forEach(function (x) { s.appendChild(soundRow(x[0], T('sfx.' + x[1]), T('sfx.' + x[1] + '.x'), false)); });
  }

  // ---------- Splash (Logo setzt sich zusammen, mit Melodie), Belohnung ----------
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var splashTimer;
  function endSplash() {
    clearTimeout(splashTimer);
    var s = $('#splash'); if (!s || s.hidden) return;
    s.hidden = true; fadeOut();
  }
  function startSplash(loop) {
    var s = $('#splash'); if (!s) return;
    clearTimeout(splashTimer);
    var fresh = s.cloneNode(true); fresh.hidden = false; s.parentNode.replaceChild(fresh, s); // Klon startet die CSS-Animation neu
    var lg = $('.splash-logo', fresh); if (lg) lg.classList.toggle('once', !loop);
    play(state.hymn);
    splashTimer = setTimeout(endSplash, loop ? 21600 : (REDUCED ? 1200 : 5100));
  }
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#splash')) endSplash(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { var s = $('#splash'); if (s && !s.hidden) { e.preventDefault(); endSplash(); return; } }
    if (e.key === 'Escape' && typeof isPlanSheetOpen === 'function' && isPlanSheetOpen()) { e.preventDefault(); closePlanSheet(); return; }
    if (e.key === 'Escape' && typeof isShopSrcOpen === 'function' && isShopSrcOpen()) { e.preventDefault(); closeShopSrc(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('data-recipe') && !SECOND_MENU_OPEN && !LANG_MENU_OPEN) {
      if (!e.target.closest('[data-rate], [data-save], [data-addlist]')) { e.preventDefault(); openRecipe(e.target.getAttribute('data-recipe')); return; }
    }
    if (SECOND_MENU_OPEN) {
      if (e.key === 'Escape') { e.preventDefault(); var last = document.activeElement && document.activeElement.closest('.second-chip-wrap, #secondSwitch'); setSecondMenus(false); if (last) { var b = last.querySelector('button'); if (b) b.focus(); } return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); var sd = secondOptionButtons(); var i1 = sd.indexOf(document.activeElement); var n1 = sd[(i1 + 1 + sd.length) % sd.length]; if (n1) n1.focus(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); var su = secondOptionButtons(); var i2 = su.indexOf(document.activeElement); var n2 = su[(i2 - 1 + su.length) % su.length]; if (n2) n2.focus(); return; }
      if (e.key === 'Tab') { setSecondMenus(false); }
      return;
    }
    if (!LANG_MENU_OPEN) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement && (document.activeElement.id === 'langSwitchBtn' || document.activeElement.classList.contains('second-chip') || document.activeElement.id === 'secondSwitchBtn')) {
        e.preventDefault();
        if (document.activeElement.id === 'langSwitchBtn') {
          setLangMenu(true); if (e.key === 'ArrowUp') { var o = langOptions(); if (o.length) o[o.length - 1].focus(); }
        } else {
          setSecondMenus(true, document.activeElement); if (e.key === 'ArrowUp') { var o2 = secondOptionButtons(); if (o2.length) o2[o2.length - 1].focus(); }
        }
      }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); setLangMenu(false); var sw = $('#langSwitchBtn'); if (sw) sw.focus(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); moveLangOption(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveLangOption(-1); return; }
    if (e.key === 'Home') { e.preventDefault(); var a = langOptions(); if (a[0]) a[0].focus(); return; }
    if (e.key === 'End') { e.preventDefault(); var b = langOptions(); if (b.length) b[b.length - 1].focus(); return; }
    if (e.key === 'Tab') { setLangMenu(false); }
  });
  var rwTimer;
  var PARTS = [[-96, -88, 40], [92, -92, -30], [-110, 10, -60], [108, 18, 50], [-70, 100, 20], [72, 104, -40], [0, -118, 15], [-40, -112, -20], [44, -116, 35], [-118, -42, 70], [118, -38, -70], [10, 118, 0]];
  function showReward(key, sfx) {
    var r = $('#reward'); if (!r) return;
    $('#rwTitle').textContent = T(key + '.t'); $('#rwText').textContent = T(key + '.x');
    var burst = $('#rwBurst'); burst.textContent = '';
    PARTS.forEach(function (p, i) {
      var leaf = i % 3 === 0;
      var el = document.createElementNS(NS_, leaf ? 'path' : 'circle');
      if (leaf) { el.setAttribute('d', 'M120,128 C112,121 112,107 120,98 C128,107 128,121 120,128 Z'); }
      else { el.setAttribute('r', i % 2 ? 5 : 3.5); el.setAttribute('cx', 120); el.setAttribute('cy', 120); }
      el.setAttribute('class', 'rw-p'); el.setAttribute('fill', ['#5CC75F', '#A8D930', '#FF6B5E', '#12B9A8'][i % 4]);
      el.style.setProperty('--dx', p[0] + 'px'); el.style.setProperty('--dy', p[1] + 'px'); el.style.setProperty('--r', p[2] + 'deg'); el.style.setProperty('--d', (0.3 + (i % 4) * 0.06) + 's');
      burst.appendChild(el);
    });
    var card = $('.reward-card', r); var fresh = card.cloneNode(true); card.parentNode.replaceChild(fresh, card); // Animation neu starten
    r.hidden = false; clearTimeout(rwTimer); rwTimer = setTimeout(hideReward, REDUCED ? 2500 : 4200);
    play(sfx || 'B_erfolg');
  }
  function hideReward() { var r = $('#reward'); if (r) r.hidden = true; clearTimeout(rwTimer); }

  // ---------- Sprache: wo (Start, Onboarding-Chip, Profil) und wann (jederzeit, sofort) ----------
  function langRow(code) {
    var m = I.meta(code), cur = code === I.lang(), b = mk('button', 'set langrow' + (cur ? ' cur' : ''));
    b.setAttribute('data-lang', code); b.setAttribute('aria-pressed', cur ? 'true' : 'false'); b.setAttribute('lang', m.locale || code);
    b.appendChild(mk('span', 'circ code', code.toUpperCase()));
    var tx = mk('span', 'tx grow'); tx.appendChild(mk('b', '', m.name || code));
    var st = m.reviewed ? T('lang.source') : T('lang.draft');
    var sm = mk('small', ''); sm.setAttribute('lang', I.locale()); sm.textContent = (m.englishName || '') + ' · ' + st; tx.appendChild(sm); b.appendChild(tx);
    var r = mk('span', 'radio' + (cur ? ' on' : '')); r.setAttribute('aria-hidden', 'true'); b.appendChild(r);
    return b;
  }
  function plannedRow(p) {
    var row = mk('div', 'set langrow dis'); row.setAttribute('aria-disabled', 'true');
    row.appendChild(mk('span', 'circ code', String(p.code).toUpperCase()));
    var tx = mk('span', 'tx grow'), nb = mk('b', '', p.name); if (p.reason === 'review') nb.setAttribute('lang', I.meta(p.code).locale || p.code); tx.appendChild(nb); tx.appendChild(mk('small', '', T('lang.reason.' + (p.reason === 'tr' || p.reason === 'id' || p.reason === 'review' ? p.reason : 'planned')))); row.appendChild(tx);
    row.appendChild(icon('lock', 's'));
    return row;
  }
  function renderLangUI() {
    $$('[data-langlist]').forEach(function (box) {
      box.textContent = '';
      I.active().filter(I.approved).forEach(function (c) { box.appendChild(langRow(c)); });
      // Aktive, aber noch nicht freigegebene Sprachen: sichtbar, ausgegraut, nicht wählbar
      I.active().filter(function (c) { return !I.approved(c); }).forEach(function (c) { box.appendChild(plannedRow({ code: c, name: I.meta(c).name || c, reason: 'review' })); });
    });
    $$('[data-langplanned]').forEach(function (box) { box.textContent = ''; I.planned().forEach(function (p) { box.appendChild(plannedRow(p)); }); });
    var dt = $('#detectT'), dx = $('#detectX');
    if (dt || dx) {
      var d = I.detect(), dm = I.meta(d.code);
      if (dt) dt.textContent = T('lang.detected', { name: dm.name || d.code });
      if (dx) dx.textContent = T(d.matched ? 'lang.detected.x' : 'lang.fallback.x', { device: d.device || '–' });
    }
    renderLangSwitch();
    var tb = $('#langTech'); tb.textContent = '';
    var code = I.lang(), r = I.res(), m = I.meta();
    tb.appendChild(mk('p', 'mono', T('lang.tech.folder', { path: 'locales/' + code + '/' })));
    var ul = mk('ul', 'files');
    [T('lang.tech.meta'), T('lang.tech.ui', { n: Object.keys(r.ui || {}).length }), T('lang.tech.legal'),
      T('lang.tech.recipes', { n: Object.keys((r.recipes || {}).recipes || {}).length }), T('lang.tech.store')].forEach(function (x) { ul.appendChild(mk('li', '', x)); });
    tb.appendChild(ul);
    tb.appendChild(mk('p', 'cap', T('lang.tech.status', { p: I.coverage(code), r: T(m.reviewed ? 'common.yes' : 'common.no'), l: T(m.legalApproved ? 'common.yes' : 'common.no') })));
    tb.appendChild(mk('p', 'cap', T('lang.tech.fallback')));
    if (m.legalNote) { var bn = mk('div', 'banner'); bn.appendChild(icon('alert')); bn.appendChild(mk('span', 'grow', T('lang.tech.sim'))); tb.appendChild(bn); }
    var sp = $('#storePrev'); sp.textContent = '';
    var s = r.store || {};
    ['title', 'subtitle', 'short'].forEach(function (k) { var row = mk('div'); row.appendChild(mk('p', 'cap', T('store.l.' + k))); row.appendChild(mk(k === 'title' ? 'b' : 'p', '', s[k] || '–')); sp.appendChild(row); });
    renderLegal(); renderLangBinds(); renderSecondLangUI();
  }
  // Kompakter Sprachumschalter (Flagge + Kürzel, Dropdown). Nur freigegebene Codes sind wählbar.
  var LANG_MENU_OPEN = false;
  var SECOND_MENU_OPEN = false;
  function flagSvg(code) {
    var svg = document.createElementNS(NS_, 'svg');
    svg.setAttribute('viewBox', '0 0 60 42');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var add = function (tag, attrs) {
      var e = document.createElementNS(NS_, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      svg.appendChild(e);
    };
    var barsH = function (cols) {
      var h = 42 / cols.length;
      cols.forEach(function (c, i) { add('rect', { x: '0', y: String(i * h), width: '60', height: String(h + 0.05), fill: c }); });
    };
    var barsV = function (cols) {
      var w = 60 / cols.length;
      cols.forEach(function (c, i) { add('rect', { x: String(i * w), y: '0', width: String(w + 0.05), height: '42', fill: c }); });
    };
    switch (code) {
      case 'de': barsH(['#000000', '#DD0000', '#FFCE00']); break;
      case 'en':
        add('rect', { width: '60', height: '42', fill: '#012169' });
        add('path', { d: 'M0,0 L60,42 M60,0 L0,42', stroke: '#fff', 'stroke-width': '10' });
        add('path', { d: 'M0,0 L60,42 M60,0 L0,42', stroke: '#C8102E', 'stroke-width': '6' });
        add('path', { d: 'M30,0 V42 M0,21 H60', stroke: '#fff', 'stroke-width': '14' });
        add('path', { d: 'M30,0 V42 M0,21 H60', stroke: '#C8102E', 'stroke-width': '8' });
        break;
      case 'fr': barsV(['#002395', '#FFFFFF', '#ED2939']); break;
      case 'it': barsV(['#009246', '#FFFFFF', '#CE2B37']); break;
      case 'es':
        add('rect', { width: '60', height: '42', fill: '#AA151B' });
        add('rect', { y: '10.5', width: '60', height: '21', fill: '#F1BF00' });
        break;
      case 'ja':
        add('rect', { width: '60', height: '42', fill: '#FFFFFF' });
        add('circle', { cx: '30', cy: '21', r: '12.6', fill: '#BC002D' });
        break;
      case 'pt':
        add('rect', { width: '60', height: '42', fill: '#009B3A' });
        add('polygon', { points: '30,4 56,21 30,38 4,21', fill: '#FEDF00' });
        add('circle', { cx: '30', cy: '21', r: '8.5', fill: '#002776' });
        break;
      default:
        add('rect', { width: '60', height: '42', fill: '#E3F5F0' });
    }
    return svg;
  }
  function setLangMenu(open) {
    var btn = $('#langSwitchBtn'), menu = $('#langMenu');
    if (!btn || !menu) return;
    if (open) setSecondMenus(false);
    LANG_MENU_OPEN = !!open;
    btn.setAttribute('aria-expanded', LANG_MENU_OPEN ? 'true' : 'false');
    menu.hidden = !LANG_MENU_OPEN;
    syncLangBackdrop();
    if (LANG_MENU_OPEN) {
      var cur = menu.querySelector('[aria-selected="true"]') || menu.querySelector('[role="option"]');
      if (cur) cur.focus();
    }
  }
  function renderLangSwitch() {
    var root = $('#langSwitch'), btn = $('#langSwitchBtn'), flagBox = $('#langSwitchFlag'), codeEl = $('#langSwitchCode'), menu = $('#langMenu');
    if (!root || !btn || !menu) return;
    $('#app').classList.add('has-lang-switch');
    var code = I.lang(), m = I.meta(code);
    var label = T('lang.switch.current', { name: m.name || code.toUpperCase() });
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    if (codeEl) codeEl.textContent = String(code).toUpperCase();
    if (flagBox) { flagBox.textContent = ''; flagBox.appendChild(flagSvg(code)); }
    menu.setAttribute('aria-label', T('lang.switch'));
    menu.textContent = '';
    I.active().filter(I.approved).forEach(function (c) {
      var meta = I.meta(c), on = c === code;
      var opt = mk('button', 'lang-opt');
      opt.type = 'button';
      opt.setAttribute('role', 'option');
      opt.setAttribute('data-lang', c);
      opt.setAttribute('aria-selected', on ? 'true' : 'false');
      opt.setAttribute('lang', meta.locale || c);
      var fl = mk('span', 'lang-flag'); fl.setAttribute('aria-hidden', 'true'); fl.appendChild(flagSvg(c));
      opt.appendChild(fl);
      opt.appendChild(mk('span', 'lang-name', meta.name || c));
      opt.appendChild(mk('span', 'lang-code-sm', String(c).toUpperCase()));
      menu.appendChild(opt);
    });
  }
  function langOptions() { return $$('#langMenu [role="option"]'); }
  function moveLangOption(dir) {
    var opts = langOptions(); if (!opts.length) return;
    var i = opts.indexOf(document.activeElement);
    if (i < 0) i = opts.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; });
    var n = opts[(i + dir + opts.length) % opts.length];
    if (n) n.focus();
  }

    // ---------- Zweitsprache (ADR-003): nur Zutaten und Einkaufsartikel, ohne Rechts-Gate ----------
  var SECONDARY = (window.EDO_FOODS && window.EDO_FOODS.secondary) || ['de', 'en', 'pt', 'ja'];
  var SECOND_KEY = 'edovita.secondLang';
  var PLAN_KEY = 'edovita.plan';
  var SHOP_KEY = 'edovita.shopItems';
  var SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
  var SLOT_SET = { breakfast: 1, lunch: 1, dinner: 1, snack: 1 };
  var QTY_UNITS = { g: 1, ml: 1, pc: 1, tbsp: 1, tsp: 1, pinch: 1, bottle: 1 };
  var SHOP_GRPS = ['veg', 'meat', 'dairy', 'pantry'];
  var TZ_COUNTRY = {
    'Europe/Zurich': 'CH', 'Europe/Vaduz': 'LI', 'Europe/Berlin': 'DE', 'Europe/Vienna': 'AT',
    'Europe/Lisbon': 'PT', 'Atlantic/Azores': 'PT', 'Atlantic/Madeira': 'PT',
    'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE',
    'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Recife': 'BR', 'America/Bahia': 'BR',
    'America/Manaus': 'BR', 'America/Belem': 'BR', 'America/Noronha': 'BR', 'America/Porto_Velho': 'BR',
    'America/Rio_Branco': 'BR', 'America/Cuiaba': 'BR', 'America/Campo_Grande': 'BR',
    'America/Santarem': 'BR', 'America/Araguaina': 'BR', 'America/Maceio': 'BR',
    'Asia/Tokyo': 'JP', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Manila': 'PH',
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
    'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Pacific/Auckland': 'NZ'
  };
  var COUNTRY_LANG = {
    PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', GW: 'pt', ST: 'pt', TL: 'pt',
    JP: 'ja', CH: 'de', DE: 'de', AT: 'de', LI: 'de',
    VN: 'vi', PH: 'en', US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', CA: 'en',
    FR: 'fr', BE: 'fr', IT: 'it', ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es'
  };
  function isSecondary(code) { return typeof code === 'string' && SECONDARY.indexOf(code) !== -1; }
  function foodData() { return window.EDO_FOODS || { secondary: SECONDARY, locales: {}, dir: {}, glossary: {}, recipeIngredients: {}, recipeSteps: {}, recipeAmounts: {}, groups: {} }; }
  function secondMeta(code) {
    var d = foodData(), m = (I.meta && I.meta(code)) || {};
    return {
      name: m.name || code,
      locale: m.locale || d.locales[code] || code,
      dir: (m.direction === 'rtl' || d.dir[code] === 'rtl') ? 'rtl' : 'ltr'
    };
  }
  function countryFromTimeZone() {
    var tz = '';
    try { tz = String((Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || ''); } catch (e) { tz = ''; }
    if (tz && Object.prototype.hasOwnProperty.call(TZ_COUNTRY, tz)) return TZ_COUNTRY[tz];
    return null;
  }
  function countryFromLanguages() {
    var langs = [];
    try { langs = (navigator.languages && navigator.languages.length) ? Array.prototype.slice.call(navigator.languages) : [navigator.language]; } catch (e) { langs = []; }
    var i, tag, loc, m;
    for (i = 0; i < langs.length; i++) {
      tag = String(langs[i] || '');
      try {
        if (typeof Intl !== 'undefined' && Intl.Locale) {
          loc = new Intl.Locale(tag);
          if (loc.region && /^[A-Za-z]{2}$/.test(loc.region)) return loc.region.toUpperCase();
        }
      } catch (e2) { /* weiter mit dem Tag */ }
      m = tag.match(/[-_]([A-Za-z]{2})\b/);
      if (m) return m[1].toUpperCase();
    }
    return null;
  }
  function inferCountry() { return countryFromTimeZone() || countryFromLanguages(); }
  function autoSecondLang(ui) {
    var cc = inferCountry(), lang = cc && COUNTRY_LANG[cc] ? COUNTRY_LANG[cc] : null;
    if (lang && isSecondary(lang) && lang !== ui) return lang;
    if (ui !== 'en' && isSecondary('en')) return 'en';
    return null;
  }
  function storedSecond() {
    try {
      var v = window.localStorage.getItem(SECOND_KEY);
      if (v === null || v === '' || v === 'auto') return null;
      if (v === 'none') return 'none';
      if (isSecondary(v)) return v;
      window.localStorage.removeItem(SECOND_KEY);
      return null;
    } catch (e) { return null; }
  }
  function isAutoSecond() { return storedSecond() === null; }
  function effectiveSecond() {
    var s = storedSecond();
    if (s === 'none') return null;
    if (s && s !== I.lang()) return s;
    if (s && s === I.lang()) return null;
    return autoSecondLang(I.lang());
  }
  function setSecondLang(code) {
    try {
      if (code === null || code === '' || code === 'auto') {
        window.localStorage.removeItem(SECOND_KEY);
        return true;
      }
      if (code === 'none') { window.localStorage.setItem(SECOND_KEY, 'none'); return true; }
      if (!isSecondary(code) || code === I.lang()) return false;
      window.localStorage.setItem(SECOND_KEY, code);
      return true;
    } catch (e) { return false; }
  }
  function clearLegacyVariant() {
    try { window.localStorage.removeItem('edovita.secondLangVariant'); } catch (e) { /* ignorieren */ }
    try {
      var u = new URL(location.href);
      if (u.searchParams.has('variant')) {
        u.searchParams.delete('variant');
        history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
      }
    } catch (e2) { /* ignorieren */ }
  }
  function glossName(lang, id) {
    if (typeof id !== 'string' || !lang) return null;
    var g = foodData().glossary;
    if (!g || !Object.prototype.hasOwnProperty.call(g, lang)) return null;
    var pack = g[lang];
    if (!pack || !Object.prototype.hasOwnProperty.call(pack, id)) return null;
    var v = pack[id];
    return typeof v === 'string' ? v : null;
  }
  function uiFoodName(id) {
    var n = glossName(I.lang(), id);
    if (n) return n;
    var rec = rget('ingredients', id);
    if (rec && rec !== id) return rec;
    var fd = rget('foods', id);
    if (fd && fd !== id) return fd;
    return id;
  }
  function secondFoodName(id) {
    var s = effectiveSecond();
    return s ? glossName(s, id) : null;
  }
  function foodAria(id) {
    var a = uiFoodName(id), b = secondFoodName(id);
    return b ? a + ' · ' + b : a;
  }
  function bilingualName(id) {
    var wrap = mk('span', 'biname');
    wrap.appendChild(mk('span', 'biname-main', uiFoodName(id)));
    var sec = secondFoodName(id);
    if (sec) {
      wrap.appendChild(document.createTextNode(' · '));
      var bdi = mk('bdi', 'biname-sec', sec);
      var meta = secondMeta(effectiveSecond());
      bdi.setAttribute('lang', meta.locale);
      bdi.setAttribute('dir', meta.dir);
      wrap.appendChild(bdi);
    }
    return wrap;
  }
  function foodGroup(id) {
    var g = (foodData().groups || {})[id];
    return SHOP_GRPS.indexOf(g) !== -1 ? g : 'pantry';
  }
  function recipeServings(id) {
    var pack = (foodData().recipeAmounts || {})[id];
    var n = pack && pack.servings;
    return (typeof n === 'number' && n >= 1 && n <= 8) ? n : 2;
  }
  function recipeIngList(id) {
    var pack = (foodData().recipeAmounts || {})[id];
    if (pack && pack.items && pack.items.length) {
      return pack.items.map(function (it) {
        return { id: it.id, amount: it.amount, unit: it.unit || '', grams: it.grams };
      });
    }
    return ((foodData().recipeIngredients || {})[id] || []).map(function (fid) {
      return { id: fid, amount: null, unit: '', grams: null };
    });
  }
  function fmtQtyNum(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '';
    var r = Math.round(n * 10) / 10;
    if (Math.abs(r - Math.round(r)) < 0.05) return fmt(Math.round(r));
    return String(r).replace('.', ',');
  }
  function formatQty(qty, unit) {
    if (qty == null || qty === '' || !unit) return T('shop.amount.missing');
    var n = qty, key;
    if (unit === 'g' || unit === 'ml') n = qty >= 10 ? Math.round(qty) : Math.round(qty * 10) / 10;
    else if (unit === 'pc' || unit === 'bottle') n = Math.round(qty * 2) / 2;
    else n = Math.round(qty * 10) / 10;
    if (unit === 'pc') return T('shop.pcs', { n: fmtQtyNum(n) });
    if (unit === 'bottle') return T('shop.bottle', { n: fmtQtyNum(n) });
    key = 'shop.qty.' + unit;
    if (unit === 'g' || unit === 'ml' || unit === 'tbsp' || unit === 'tsp' || unit === 'pinch') return T(key, { n: fmtQtyNum(n) });
    return fmtQtyNum(n) + ' ' + unit;
  }
  function syncLangBackdrop() {
    var bd = $('#langBackdrop');
    if (bd) bd.hidden = !LANG_MENU_OPEN && !SECOND_MENU_OPEN;
  }
  function secondOptionButtons() {
    return $$('#app .lang-menu:not([hidden]) [role="option"]');
  }
  function fillSecondOptions(menu) {
    menu.textContent = '';
    menu.setAttribute('aria-label', T('second.label'));
    var manual = storedSecond(), cur = effectiveSecond(), auto = autoSecondLang(I.lang());
    var add = function (code, label, flagCode, selected) {
      var opt = mk('button', 'lang-opt');
      opt.type = 'button';
      opt.setAttribute('role', 'option');
      opt.setAttribute('data-second', code);
      opt.setAttribute('aria-selected', selected ? 'true' : 'false');
      if (flagCode) {
        opt.setAttribute('lang', secondMeta(flagCode).locale);
        var fl = mk('span', 'lang-flag'); fl.setAttribute('aria-hidden', 'true'); fl.appendChild(flagSvg(flagCode));
        opt.appendChild(fl);
      }
      opt.appendChild(mk('span', 'lang-name', label));
      if (code !== 'none' && code !== 'auto') opt.appendChild(mk('span', 'lang-code-sm', code.toUpperCase()));
      menu.appendChild(opt);
    };
    add('auto', auto ? T('second.auto.current', { code: auto.toUpperCase() }) : T('second.auto.none'), auto, manual === null);
    add('none', T('second.none'), null, manual === 'none');
    SECONDARY.forEach(function (c) {
      if (c === I.lang()) return;
      add(c, secondMeta(c).name, c, manual === c);
    });
  }
  function setSecondMenus(open, sourceBtn) {
    if (open) setLangMenu(false);
    SECOND_MENU_OPEN = !!open;
    $$('#secondMenu').forEach(function (m) { m.hidden = true; });
    var btn = $('#secondSwitchBtn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (SECOND_MENU_OPEN && sourceBtn) {
      sourceBtn.setAttribute('aria-expanded', 'true');
      var wrap = sourceBtn.parentNode, menu = wrap ? wrap.querySelector('.lang-menu') : null;
      if (menu) {
        fillSecondOptions(menu);
        menu.hidden = false;
        var cur = menu.querySelector('[aria-selected="true"]') || menu.querySelector('[role="option"]');
        if (cur) cur.focus();
      }
    }
    syncLangBackdrop();
  }
  function paintSecondButton(btn, flagBox, codeEl) {
    var sec = effectiveSecond(), auto = isAutoSecond();
    var label;
    if (sec && auto) label = T('second.auto.current', { code: sec.toUpperCase() });
    else if (sec) label = T('second.label.current', { name: secondMeta(sec).name });
    else if (auto) label = T('second.auto.none');
    else label = T('second.label.none');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.classList.toggle('is-none', !sec);
    if (codeEl) codeEl.textContent = sec ? sec.toUpperCase() : '—';
    if (flagBox) {
      flagBox.textContent = '';
      if (sec) flagBox.appendChild(flagSvg(sec));
    }
  }
  function renderSecondPickerList() {
    var box = $('#secondLangList'); if (!box) return;
    box.textContent = '';
    var manual = storedSecond(), curEff = effectiveSecond();
    var row = function (code, name, flagCode, selected) {
      var b = mk('button', 'set langrow' + (selected ? ' cur' : ''));
      b.type = 'button';
      b.setAttribute('data-second', code);
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      if (flagCode) {
        var circ = mk('span', 'circ code'); circ.appendChild(flagSvg(flagCode)); b.appendChild(circ);
        b.setAttribute('lang', secondMeta(flagCode).locale);
      } else {
        b.appendChild(mk('span', 'circ code', '–'));
      }
      var tx = mk('span', 'tx grow'); tx.appendChild(mk('b', '', name)); b.appendChild(tx);
      var r = mk('span', 'radio' + (selected ? ' on' : '')); r.setAttribute('aria-hidden', 'true'); b.appendChild(r);
      box.appendChild(b);
    };
    var auto = autoSecondLang(I.lang());
    row('auto', auto ? T('second.auto.current', { code: auto.toUpperCase() }) : T('second.auto.none'), auto, manual === null);
    row('none', T('second.none'), null, manual === 'none');
    SECONDARY.forEach(function (c) {
      if (c === I.lang()) return;
      row(c, secondMeta(c).name, c, manual === c);
    });
  }
  function renderRezept() {
    var id = state.recipeId || 'oven_salmon', rec = RECIPES.filter(function (r) { return r.id === id; })[0];
    var title = $('#rezeptTitle'), cui = $('#rezeptCui'), body = $('#rezeptBody'), add = $('#rezeptAdd');
    if (!title || !body) return;
    if (!rec) { title.textContent = T('recipe.none.title'); body.textContent = ''; return; }
    title.textContent = rget('recipes', rec.id);
    if (cui) cui.textContent = T('meal.' + rec.meal) + ' · ' + rget('cuisines', rec.cui);
    if (add) add.setAttribute('data-addlist', rec.id);
    body.textContent = '';
    var hero = recipeFigure(rec, 'full', true);
    hero.className = 'rezept-hero rimg ' + (hasRecipePhoto(rec.id) ? 'has-photo' : ('ph ' + rec.c));
    body.appendChild(hero);
    var ings = recipeIngList(rec.id), factor = 1;
    var ingBox = mk('div', 'card');
    ingBox.appendChild(mk('h2', '', T('recipe.ingredients')));
    ings.forEach(function (it) {
      var row = mk('div', 'ing-row');
      row.appendChild(bilingualName(it.id));
      if (it.amount != null && it.unit) row.appendChild(mk('span', 'qty', formatQty(it.amount * factor, it.unit)));
      ingBox.appendChild(row);
    });
    if (!ings.length) ingBox.appendChild(mk('p', 'cap', T('recipe.none.text')));
    body.appendChild(ingBox);
    var lang = I.lang(), stepsMap = foodData().recipeSteps || {}, pack = stepsMap[rec.id] || stepsMap._default || {};
    var steps = pack[lang] || pack.en || pack.de || [];
    if (steps.length) {
      var st = mk('div', 'card'); st.appendChild(mk('h2', '', T('recipe.steps')));
      var ol = mk('ol', 'step-list');
      steps.forEach(function (s) { ol.appendChild(mk('li', '', s)); });
      st.appendChild(ol);
      st.appendChild(mk('p', 'cap', T('second.hint')));
      body.appendChild(st);
    }
  }
  function openRecipe(id) {
    if (!RECIPES.some(function (r) { return r.id === id; })) return;
    state.recipeId = id;
    go('rezept');
    renderRezept();
  }
  function renderSecondLangUI() {
    clearLegacyVariant();
    var head = $('#secondSwitch');
    if (head) {
      head.hidden = false;
      var btn = $('#secondSwitchBtn'), flag = $('#secondSwitchFlag'), code = $('#secondSwitchCode'), menu = $('#secondMenu');
      if (btn) {
        btn.setAttribute('aria-haspopup', 'listbox');
        paintSecondButton(btn, flag, code);
        if (menu) fillSecondOptions(menu);
      }
    }
    renderSecondPickerList();
    renderShop();
    if (curScreen === 'rezept') renderRezept();
    if (curScreen === 'plan') renderPlan();
    setSecondMenus(false);
  }

  // ---------- Essensplan und daraus erzeugte Einkaufsliste ----------
  var planState = null, shopLive = null, planSheet = null;
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function addDaysISO(iso, n) {
    var p = String(iso).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function isoInRange(iso, from, to) { return typeof iso === 'string' && iso >= from && iso <= to; }
  function isIsoDate(v) { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v + 'T00:00:00')); }
  function knownRecipe(id) { return RECIPES.some(function (r) { return r.id === id; }); }
  function newPlanItemId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function validPlanItemId(id) { return typeof id === 'string' && /^p[a-z0-9]{4,20}$/.test(id); }
  function coercePortions(n) {
    var x = typeof n === 'number' ? n : parseInt(n, 10);
    if (!isFinite(x)) return 2;
    return Math.max(1, Math.min(8, Math.round(x)));
  }
  function coerceDays(n) {
    var x = typeof n === 'number' ? n : parseInt(n, 10);
    if (!isFinite(x)) return 5;
    return Math.max(3, Math.min(7, Math.round(x)));
  }
  function defaultPlan() {
    var t = todayISO();
    return {
      days: 5,
      items: [
        { id: 'pseed01aa', date: t, slot: 'breakfast', recipeId: 'birchermuesli', portions: 2 },
        { id: 'pseed01ab', date: t, slot: 'lunch', recipeId: 'pho', portions: 2 },
        { id: 'pseed01ac', date: t, slot: 'dinner', recipeId: 'oven_salmon', portions: 2 },
        { id: 'pseed01ad', date: t, slot: 'snack', recipeId: 'yogurt_bowl', portions: 1 },
        { id: 'pseed02aa', date: addDaysISO(t, 1), slot: 'breakfast', recipeId: 'scrambled_eggs', portions: 2 },
        { id: 'pseed02ab', date: addDaysISO(t, 1), slot: 'dinner', recipeId: 'thai_curry', portions: 2 },
        { id: 'pseed03aa', date: addDaysISO(t, 2), slot: 'lunch', recipeId: 'chicken_bowl', portions: 2 }
      ]
    };
  }
  function sanitizePlan(raw) {
    var min = addDaysISO(todayISO(), -1), max = addDaysISO(todayISO(), 14), out = { days: 5, items: [] }, seen = {};
    if (!raw || typeof raw !== 'object') return null;
    out.days = coerceDays(raw.days);
    if (!Array.isArray(raw.items)) return out;
    raw.items.slice(0, 80).forEach(function (it) {
      if (!it || typeof it !== 'object') return;
      var id = validPlanItemId(it.id) ? it.id : newPlanItemId();
      if (seen[id]) return;
      if (!isIsoDate(it.date) || !isoInRange(it.date, min, max)) return;
      if (!SLOT_SET[it.slot]) return;
      if (!knownRecipe(it.recipeId)) return;
      seen[id] = 1;
      out.items.push({ id: id, date: it.date, slot: it.slot, recipeId: String(it.recipeId), portions: coercePortions(it.portions) });
    });
    return out;
  }
  function loadPlan() {
    try {
      var raw = window.localStorage.getItem(PLAN_KEY);
      if (!raw) return defaultPlan();
      var parsed = JSON.parse(raw);
      var clean = sanitizePlan(parsed);
      if (!clean) return defaultPlan();
      return clean;
    } catch (e) { return defaultPlan(); }
  }
  function savePlan() {
    if (!planState) return;
    var clean = sanitizePlan(planState);
    if (!clean) return;
    planState = clean;
    try { window.localStorage.setItem(PLAN_KEY, JSON.stringify(clean)); } catch (e) { /* nur bis zum Neuladen */ }
  }
  function getPlan() {
    if (!planState) planState = loadPlan();
    return planState;
  }
  function planWindowDates() {
    var p = getPlan(), t = todayISO(), i, out = [];
    for (i = 0; i < p.days; i++) out.push(addDaysISO(t, i));
    return out;
  }
  function itemsOn(date, slot) {
    return getPlan().items.filter(function (it) { return it.date === date && (!slot || it.slot === slot); });
  }
  function recipeTitle(id) { return rget('recipes', id); }
  function dayLabel(iso) {
    var t = todayISO();
    if (iso === t) return T('plan.today');
    if (iso === addDaysISO(t, 1)) return T('plan.tomorrow');
    var p = String(iso).split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    try { return I.date(dt, { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { return iso; }
  }
  function dayTotals(date) {
    var kcal = 0, p = 0, n = 0;
    itemsOn(date).forEach(function (it) {
      var rec = RECIPES.filter(function (r) { return r.id === it.recipeId; })[0];
      if (!rec) return;
      if (typeof rec.kcal === 'number') { kcal += rec.kcal * it.portions; n++; }
      if (typeof rec.p === 'number') p += rec.p * it.portions;
    });
    return n ? { kcal: Math.round(kcal), p: Math.round(p) } : null;
  }
  function setPlanDays(n) {
    getPlan().days = coerceDays(n);
    savePlan();
    renderPlan();
  }
  function upsertPlanItem(item) {
    var p = getPlan(), clean, i;
    clean = sanitizePlan({ days: p.days, items: [item] });
    if (!clean || !clean.items.length) return false;
    item = clean.items[0];
    if (item.slot !== 'snack') {
      p.items = p.items.filter(function (x) { return !(x.date === item.date && x.slot === item.slot && x.id !== item.id); });
    }
    i = -1;
    p.items.forEach(function (x, idx) { if (x.id === item.id) i = idx; });
    if (i >= 0) p.items[i] = item; else p.items.push(item);
    savePlan();
    renderPlan();
    return true;
  }
  function removePlanItem(id) {
    var p = getPlan();
    if (!validPlanItemId(id)) return;
    p.items = p.items.filter(function (x) { return x.id !== id; });
    savePlan();
    renderPlan();
  }
  function renderPlan() {
    var daysBox = $('#planDays'), list = $('#planList'); if (!list) return;
    var p = getPlan(), dates = planWindowDates();
    if (daysBox) {
      daysBox.textContent = '';
      [3, 4, 5, 6, 7].forEach(function (n) {
        var b = mk('button', p.days === n ? 'on' : '');
        b.type = 'button';
        b.setAttribute('data-plan-days', String(n));
        b.setAttribute('aria-pressed', p.days === n ? 'true' : 'false');
        b.textContent = T('plan.days.n', { n: String(n) });
        daysBox.appendChild(b);
      });
    }
    list.textContent = '';
    dates.forEach(function (iso) {
      var day = mk('div', 'plan-day');
      var head = mk('div', 'plan-day-head');
      head.appendChild(mk('b', '', dayLabel(iso)));
      var tot = dayTotals(iso);
      if (tot) head.appendChild(mk('span', 'cap', T('plan.total', { kcal: fmt(tot.kcal), p: String(tot.p) })));
      day.appendChild(head);
      SLOTS.forEach(function (slot) {
        var box = mk('div', 'plan-slot');
        box.appendChild(mk('p', 'plan-slot-label', T('meal.' + slot)));
        var filled = itemsOn(iso, slot);
        filled.forEach(function (it) {
          var rec = RECIPES.filter(function (r) { return r.id === it.recipeId; })[0];
          var row = mk('div', 'plan-item');
          if (rec) {
            var thumb = recipeFigure(rec, 'thumb', false);
            thumb.className = 'plan-thumb rimg ' + (hasRecipePhoto(rec.id) ? 'has-photo' : ('ph ' + rec.c));
            thumb.setAttribute('aria-hidden', 'true');
            row.appendChild(thumb);
          }
          var main = mk('button', 'grow');
          main.type = 'button';
          main.setAttribute('data-plan-open', it.recipeId);
          main.setAttribute('aria-label', T('plan.filled', { name: recipeTitle(it.recipeId), n: String(it.portions) }));
          main.appendChild(mk('b', '', recipeTitle(it.recipeId)));
          var meta = T('plan.portions') + ' · ' + it.portions;
          if (rec && typeof rec.kcal === 'number') meta += ' · ' + T('plan.total', { kcal: fmt(rec.kcal * it.portions), p: String(rec.p * it.portions) });
          main.appendChild(mk('span', 'cap blk', meta));
          row.appendChild(main);
          var acts = mk('div', 'plan-actions');
          var sw = mk('button', 'iconbtn'); sw.type = 'button'; sw.setAttribute('data-plan-swap', it.id); sw.setAttribute('aria-label', T('plan.swap')); sw.appendChild(icon('utensils', 's'));
          var rm = mk('button', 'iconbtn'); rm.type = 'button'; rm.setAttribute('data-plan-remove', it.id); rm.setAttribute('aria-label', T('plan.slot.remove', { name: recipeTitle(it.recipeId) })); rm.appendChild(icon('trash', 's'));
          acts.appendChild(sw); acts.appendChild(rm); row.appendChild(acts);
          box.appendChild(row);
        });
        if (slot === 'snack' || !filled.length) {
          var add = mk('button', 'plan-empty');
          add.type = 'button';
          add.setAttribute('data-plan-add', iso + '|' + slot);
          add.textContent = T('plan.empty');
          box.appendChild(add);
        }
        day.appendChild(box);
      });
      list.appendChild(day);
    });
  }
  function closePlanSheet() {
    planSheet = null;
    var sh = $('#planSheet'), bd = $('#planSheetBack');
    if (sh) sh.hidden = true;
    if (bd) bd.hidden = true;
  }
  function isPlanSheetOpen() { return !!(planSheet && $('#planSheet') && !$('#planSheet').hidden); }
  function openPlanSheet(spec) {
    planSheet = spec || {};
    if (planSheet.portions == null) planSheet.portions = planSheet.recipeId ? recipeServings(planSheet.recipeId) : 2;
    if (!planSheet.date) planSheet.date = todayISO();
    if (!planSheet.slot) planSheet.slot = planSheet.recipeId ? ((RECIPES.filter(function (r) { return r.id === planSheet.recipeId; })[0] || {}).meal || 'dinner') : 'dinner';
    if (!SLOT_SET[planSheet.slot]) planSheet.slot = 'dinner';
    if (planWindowDates().indexOf(planSheet.date) === -1) planSheet.date = todayISO();
    renderPlanSheet();
  }
  function renderPlanSheet() {
    var sh = $('#planSheet'), bd = $('#planSheetBack'), body = $('#planSheetBody'), title = $('#planSheetTitle');
    if (!sh || !body || !planSheet) return;
    bd.hidden = false; sh.hidden = false;
    body.textContent = '';
    var mode = planSheet.mode || 'form';
    title.textContent = mode === 'pick' ? T('plan.pick') : T('plan.add.title');
    if (mode === 'pick') {
      var filter = planSheet.filterMeal;
      RECIPES.forEach(function (r) {
        if (filter && filter !== 'snack' && r.meal !== filter && r.meal !== 'snack') return;
        var b = mk('button', 'pick-row');
        b.type = 'button';
        b.setAttribute('data-plan-pick', r.id);
        b.appendChild(mk('b', 'grow', recipeTitle(r.id)));
        b.appendChild(mk('span', 'cap', T('meal.' + r.meal)));
        body.appendChild(b);
      });
      return;
    }
    if (planSheet.recipeId) body.appendChild(mk('p', '', recipeTitle(planSheet.recipeId)));
    body.appendChild(mk('p', 'grph', T('plan.day')));
    var days = mk('div', 'seg'); days.setAttribute('role', 'group');
    planWindowDates().forEach(function (iso) {
      var b = mk('button', iso === planSheet.date ? 'on' : '');
      b.type = 'button'; b.setAttribute('data-plan-day', iso);
      b.setAttribute('aria-pressed', iso === planSheet.date ? 'true' : 'false');
      b.textContent = dayLabel(iso);
      days.appendChild(b);
    });
    body.appendChild(days);
    body.appendChild(mk('p', 'grph', T('plan.meal')));
    var meals = mk('div', 'seg'); meals.setAttribute('role', 'group');
    SLOTS.forEach(function (s) {
      var b = mk('button', s === planSheet.slot ? 'on' : '');
      b.type = 'button'; b.setAttribute('data-plan-slot', s);
      b.setAttribute('aria-pressed', s === planSheet.slot ? 'true' : 'false');
      b.textContent = T('meal.' + s);
      meals.appendChild(b);
    });
    body.appendChild(meals);
    body.appendChild(mk('p', 'grph', T('plan.portions')));
    var st = mk('div', 'stepper');
    var minus = mk('button', ''); minus.type = 'button'; minus.setAttribute('data-plan-step', '-1'); minus.setAttribute('aria-label', T('plan.portions') + ' −'); minus.textContent = '−';
    var out = mk('output', ''); out.setAttribute('data-plan-out', '1'); out.textContent = String(planSheet.portions);
    out.setAttribute('aria-live', 'polite');
    var plus = mk('button', ''); plus.type = 'button'; plus.setAttribute('data-plan-step', '1'); plus.setAttribute('aria-label', T('plan.portions') + ' +'); plus.textContent = '+';
    st.appendChild(minus); st.appendChild(out); st.appendChild(plus);
    body.appendChild(st);
    var ok = mk('button', 'btn'); ok.type = 'button'; ok.setAttribute('data-plan-confirm', '1'); ok.textContent = T('plan.confirm');
    var cancel = mk('button', 'btn line'); cancel.type = 'button'; cancel.id = 'planSheetCancel'; cancel.textContent = T('plan.cancel');
    body.appendChild(ok); body.appendChild(cancel);
    var focus = sh.querySelector('h2'); if (focus) { focus.setAttribute('tabindex', '-1'); focus.focus({ preventScroll: true }); }
  }

  function defaultShopItems() {
    return SHOP.map(function (it) {
      var q = typeof it.qty === 'number' ? it.qty : null, u = it.unit || '';
      return { id: it.id, unit: u, qtyPlan: 0, qtyExtra: q, recipesPlan: [], recipesExtra: [], grp: it.grp || foodGroup(it.id) };
    });
  }
  function sanitizeShopItems(raw) {
    var out = [], seen = {}, ids = {};
    (foodData().glossary && foodData().glossary.de ? Object.keys(foodData().glossary.de) : []).forEach(function (id) { ids[id] = 1; });
    SHOP.forEach(function (it) { ids[it.id] = 1; });
    RECIPES.forEach(function (r) { recipeIngList(r.id).forEach(function (it) { ids[it.id] = 1; }); });
    if (!Array.isArray(raw)) return defaultShopItems();
    raw.slice(0, 120).forEach(function (it) {
      if (!it || typeof it !== 'object') return;
      if (typeof it.id !== 'string' || !ids[it.id]) return;
      var unit = (it.unit === '' || it.unit == null) ? '' : String(it.unit);
      if (unit && !QTY_UNITS[unit]) return;
      var key = it.id + '\0' + unit, qp, qe;
      if (seen[key]) return;
      seen[key] = 1;
      qp = (typeof it.qtyPlan === 'number' && isFinite(it.qtyPlan) && it.qtyPlan >= 0 && it.qtyPlan <= 1e6) ? it.qtyPlan : 0;
      qe = (typeof it.qtyExtra === 'number' && isFinite(it.qtyExtra) && it.qtyExtra >= 0 && it.qtyExtra <= 1e6) ? it.qtyExtra : 0;
      var rp = Array.isArray(it.recipesPlan) ? it.recipesPlan.filter(knownRecipe).slice(0, 20) : [];
      var re = Array.isArray(it.recipesExtra) ? it.recipesExtra.filter(knownRecipe).slice(0, 20) : [];
      out.push({ id: it.id, unit: unit, qtyPlan: qp, qtyExtra: qe, recipesPlan: rp, recipesExtra: re, grp: foodGroup(it.id) });
    });
    return out;
  }
  function loadShopItems() {
    try {
      var raw = window.localStorage.getItem(SHOP_KEY);
      if (!raw) return defaultShopItems();
      return sanitizeShopItems(JSON.parse(raw));
    } catch (e) { return defaultShopItems(); }
  }
  function saveShopItems() {
    if (!shopLive) return;
    shopLive = sanitizeShopItems(shopLive);
    try { window.localStorage.setItem(SHOP_KEY, JSON.stringify(shopLive)); } catch (e) { /* nur bis zum Neuladen */ }
  }
  function getShopItems() {
    if (!shopLive) shopLive = loadShopItems();
    return shopLive;
  }
  function shopKey(id, unit) { return id + '\0' + (unit || ''); }
  function findShopItem(id, unit) {
    var k = shopKey(id, unit || ''), found = null;
    getShopItems().forEach(function (it) { if (shopKey(it.id, it.unit) === k) found = it; });
    return found;
  }
  function uniquePush(arr, v) { if (arr.indexOf(v) === -1) arr.push(v); }
  function addIngBundle(entries, dest) {
    // entries: [{id, qty, unit, recipeId}], dest 'plan' | 'extra'
    entries.forEach(function (e) {
      if (!e || typeof e.id !== 'string') return;
      var unit = e.unit || '', item = findShopItem(e.id, unit);
      if (!item) {
        item = { id: e.id, unit: unit, qtyPlan: 0, qtyExtra: 0, recipesPlan: [], recipesExtra: [], grp: foodGroup(e.id) };
        getShopItems().push(item);
      }
      if (dest === 'plan') {
        if (typeof e.qty === 'number' && isFinite(e.qty)) item.qtyPlan += e.qty;
        if (e.recipeId) uniquePush(item.recipesPlan, e.recipeId);
      } else {
        if (typeof e.qty === 'number' && isFinite(e.qty)) item.qtyExtra += e.qty;
        if (e.recipeId) uniquePush(item.recipesExtra, e.recipeId);
      }
    });
  }
  function ingsForPlanEntry(it) {
    var factor = it.portions / recipeServings(it.recipeId), out = [];
    recipeIngList(it.recipeId).forEach(function (ing) {
      var qty = (ing.amount != null && ing.unit) ? ing.amount * factor : null;
      out.push({ id: ing.id, qty: qty, unit: ing.unit || '', recipeId: it.recipeId });
    });
    return out;
  }
  function refreshPlanQuantities() {
    getShopItems().forEach(function (it) { it.qtyPlan = 0; it.recipesPlan = []; });
    var dates = planWindowDates();
    getPlan().items.forEach(function (it) {
      if (dates.indexOf(it.date) === -1) return;
      addIngBundle(ingsForPlanEntry(it), 'plan');
    });
    shopLive = getShopItems().filter(function (it) {
      return (it.qtyPlan && it.qtyPlan > 0) || (it.qtyExtra && it.qtyExtra > 0) || (it.unit === '' && (it.recipesPlan.length || it.recipesExtra.length)) || state.shop[it.id];
    });
    saveShopItems();
  }
  function addRecipeIngredientsToShop(recipeId, portions) {
    if (!knownRecipe(recipeId)) return false;
    addIngBundle(ingsForPlanEntry({ recipeId: recipeId, portions: coercePortions(portions || recipeServings(recipeId)) }), 'extra');
    saveShopItems();
    renderShop();
    return true;
  }
  function recipeAlreadyInPlan(recipeId) {
    return getPlan().items.some(function (it) { return it.recipeId === recipeId; });
  }
  function slotTargetsFor(recipeId) {
    var rec = RECIPES.filter(function (r) { return r.id === recipeId; })[0];
    var meal = rec && SLOT_SET[rec.meal] ? rec.meal : 'lunch';
    if (meal === 'breakfast') return ['breakfast'];
    if (meal === 'snack') return ['snack'];
    return ['lunch', 'dinner'];
  }
  function slotIsFree(date, slot) {
    return itemsOn(date, slot).length === 0;
  }
  function findNextFreeSlot(recipeId) {
    var targets = slotTargetsFor(recipeId), dates = planWindowDates(), d, s, i, j;
    for (i = 0; i < dates.length; i++) {
      d = dates[i];
      for (j = 0; j < targets.length; j++) {
        s = targets[j];
        if (slotIsFree(d, s)) return { date: d, slot: s };
      }
    }
    return null;
  }
  function weekdayShort(iso) {
    var p = String(iso).split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]), lab;
    try { lab = I.date(dt, { weekday: 'short' }); } catch (e) { lab = iso; }
    return String(lab || iso).replace(/\.$/, '');
  }
  function planWhenLabel(date, slot) {
    return weekdayShort(date) + ' ' + T('meal.short.' + slot);
  }
  function snapshotShopAndPlan() {
    return {
      items: JSON.parse(JSON.stringify(getPlan().items)),
      shop: JSON.parse(JSON.stringify(getShopItems()))
    };
  }
  function restoreShopAndPlan(snap) {
    if (!snap) return;
    getPlan().items = snap.items || [];
    savePlan();
    shopLive = snap.shop || [];
    saveShopItems();
    renderPlan();
    renderShop();
    if (curScreen === 'rezept') renderRezept();
  }
  function ensurePlanRecipeOnList(planItems) {
    var added = false;
    planItems.forEach(function (it) {
      var already = getShopItems().some(function (s) {
        return (s.recipesPlan || []).indexOf(it.recipeId) !== -1;
      });
      if (!already) {
        addIngBundle(ingsForPlanEntry(it), 'plan');
        added = true;
      }
    });
    if (added) saveShopItems();
    return added;
  }
  function addRecipeToListAndMaybePlan(recipeId) {
    if (!knownRecipe(recipeId)) return;
    var portions = recipeServings(recipeId);
    var snap = snapshotShopAndPlan();
    var existing = getPlan().items.filter(function (it) { return it.recipeId === recipeId; });
    var slot, item, when;
    if (existing.length) {
      ensurePlanRecipeOnList(existing);
      renderShop();
      renderPlan();
      toast(T('toast.addlist.already'));
      return;
    }
    slot = findNextFreeSlot(recipeId);
    if (!slot) {
      addRecipeIngredientsToShop(recipeId, portions);
      toast(T('toast.addlist.noslot'), { undo: function () { restoreShopAndPlan(snap); } });
      return;
    }
    item = { id: newPlanItemId(), date: slot.date, slot: slot.slot, recipeId: recipeId, portions: coercePortions(portions) };
    if (!upsertPlanItem(item)) {
      addRecipeIngredientsToShop(recipeId, portions);
      toast(T('toast.addlist.noslot'), { undo: function () { restoreShopAndPlan(snap); } });
      return;
    }
    addIngBundle(ingsForPlanEntry(item), 'plan');
    saveShopItems();
    renderShop();
    renderPlan();
    when = planWhenLabel(item.date, item.slot);
    toast(T('toast.addlist.planned', { when: when }), { undo: function () { restoreShopAndPlan(snap); } });
  }
  function shopQtyOf(it) {
    var a = it.qtyPlan || 0, b = it.qtyExtra || 0, extra, only;
    if (!it.unit) return null;
    extra = it.recipesExtra || [];
    only = extra.filter(function (id) { return (it.recipesPlan || []).indexOf(id) === -1; });
    // Dieselbe Rezeptquelle nicht aus Liste und Plan doppelt zählen
    if (extra.length && !only.length) return a;
    return a + b;
  }
  function shopRecipesOf(it) {
    var all = [], seen = {};
    (it.recipesPlan || []).concat(it.recipesExtra || []).forEach(function (id) {
      if (knownRecipe(id) && !seen[id]) { seen[id] = 1; all.push(id); }
    });
    return all;
  }
  function shopSourceLines(it) {
    var lines = [], seen = {}, dates = planWindowDates();
    getPlan().items.forEach(function (pitem) {
      if (dates.indexOf(pitem.date) === -1) return;
      ingsForPlanEntry(pitem).forEach(function (ing) {
        if (ing.id !== it.id || (ing.unit || '') !== (it.unit || '')) return;
        lines.push({ recipeId: pitem.recipeId, when: planWhenLabel(pitem.date, pitem.slot), qty: ing.qty, unit: ing.unit || it.unit });
        seen[pitem.recipeId] = 1;
      });
    });
    shopRecipesOf(it).forEach(function (rid) {
      if (seen[rid]) return;
      ingsForPlanEntry({ recipeId: rid, portions: recipeServings(rid) }).forEach(function (ing) {
        if (ing.id !== it.id || (ing.unit || '') !== (it.unit || '')) return;
        lines.push({ recipeId: rid, when: '', qty: ing.qty, unit: ing.unit || it.unit });
      });
    });
    return lines;
  }
  function formatShopSrcLine(line) {
    var recipe = recipeTitle(line.recipeId);
    var qty = (line.qty != null && line.unit) ? formatQty(line.qty, line.unit) : '';
    if (line.when && qty) return T('shop.src.line.plan', { recipe: recipe, when: line.when, qty: qty });
    if (qty) return T('shop.src.line.extra', { recipe: recipe, qty: qty });
    return line.when ? (recipe + ' · ' + line.when) : recipe;
  }
  var shopSrcKey = null, shopSrcBtn = null;
  function isShopSrcOpen() {
    var sh = $('#shopSrcSheet');
    return !!(sh && !sh.hidden);
  }
  function closeShopSrc(silent) {
    var sh = $('#shopSrcSheet'), bd = $('#shopSrcBack'), last = shopSrcBtn;
    if (sh) sh.hidden = true;
    if (bd) bd.hidden = true;
    shopSrcKey = null;
    shopSrcBtn = null;
    $$('.shop-src-btn[aria-expanded="true"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (!silent && last && last.focus) last.focus();
  }
  function openShopSrc(it, btn) {
    var sh = $('#shopSrcSheet'), bd = $('#shopSrcBack'), title = $('#shopSrcTitle'), body = $('#shopSrcBody'), closeBtn = $('#shopSrcClose');
    var lines, key;
    if (!sh || !body || !it) return;
    key = it.id + '\0' + (it.unit || '');
    if (isShopSrcOpen() && shopSrcKey === key) { closeShopSrc(); return; }
    lines = shopSourceLines(it);
    if (!lines.length) return;
    shopSrcKey = key;
    shopSrcBtn = btn || null;
    $$('.shop-src-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (title) title.textContent = uiFoodName(it.id);
    body.textContent = '';
    lines.forEach(function (line) {
      var li = mk('li', '');
      li.textContent = formatShopSrcLine(line);
      body.appendChild(li);
    });
    if (bd) bd.hidden = false;
    sh.hidden = false;
    if (closeBtn) { closeBtn.setAttribute('aria-label', T('plan.close')); closeBtn.focus({ preventScroll: true }); }
  }
  function shopSrcButton(it) {
    var src = shopRecipesOf(it), b, names;
    if (!src.length && !shopSourceLines(it).length) return null;
    names = src.length ? src.map(recipeTitle) : shopSourceLines(it).map(function (l) { return recipeTitle(l.recipeId); });
    b = mk('button', 'shop-src-btn');
    b.type = 'button';
    b.setAttribute('data-shop-src', it.id + ':' + (it.unit || ''));
    b.setAttribute('aria-haspopup', 'dialog');
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', T('shop.usedin', { recipes: names.join(', ') }));
    b.appendChild(icon('info'));
    return b;
  }
  function shopRow(it, st) {
    var qty = shopQtyOf(it), srcBtn = shopSrcButton(it);
    var row = mk('div', 'shoprow' + (st === 'cart' ? ' incart' : st === 'home' ? ' athome' : ''));
    var cap = formatQty(qty, it.unit);
    if (st === 'home') {
      var c0 = mk('span', 'circ sm'); c0.appendChild(icon('home', 's')); row.appendChild(c0);
      var g0 = mk('span', 'nm grow'); g0.appendChild(bilingualName(it.id));
      row.appendChild(g0);
      row.appendChild(mk('span', 'cap', cap));
      if (srcBtn) row.appendChild(srcBtn);
      var u = mk('button', 'havebtn', T('shop.undo')); u.setAttribute('data-shop', it.id + ':' + (it.unit || '') + ':open'); row.appendChild(u); return row;
    }
    var b = mk('button', 'chk grow' + (st === 'cart' ? ' on' : ''));
    b.setAttribute('data-shop', it.id + ':' + (it.unit || '') + ':' + (st === 'cart' ? 'open' : 'cart'));
    b.setAttribute('aria-pressed', st === 'cart' ? 'true' : 'false');
    b.setAttribute('aria-label', T(st === 'cart' ? 'shop.fromcart' : 'shop.tocart', { name: foodAria(it.id) }));
    var cb = mk('span', 'cb'); cb.appendChild(icon('check')); b.appendChild(cb);
    var ng = mk('span', 'nm grow'); ng.appendChild(bilingualName(it.id));
    b.appendChild(ng); b.appendChild(mk('span', 'cap', cap)); row.appendChild(b);
    if (srcBtn) row.appendChild(srcBtn);
    if (st !== 'cart') { var h = mk('button', 'havebtn', T('shop.have')); h.setAttribute('data-shop', it.id + ':' + (it.unit || '') + ':home'); row.appendChild(h); }
    return row;
  }
  function shopStatusKey(it) { return it.id + '\0' + (it.unit || ''); }
  function stOfItem(it) { return state.shop[shopStatusKey(it)] || state.shop[it.id] || 'open'; }
  function renderShop() {
    var box = $('#shopList'); if (!box) return; box.textContent = '';
    var vis = getShopItems().filter(function (it) {
      var src = SHOP.filter(function (s) { return s.id === it.id; })[0];
      return !src || allowed(src.has || []);
    });
    var anyOpen = false;
    SHOP_GRPS.forEach(function (g) {
      var its = vis.filter(function (it) { return (it.grp || foodGroup(it.id)) === g && stOfItem(it) === 'open'; });
      if (!its.length) return;
      anyOpen = true;
      var w = mk('div'); w.appendChild(mk('p', 'grph', T('shop.grp.' + g))); var c = mk('div', 'card');
      its.forEach(function (it) { c.appendChild(shopRow(it, 'open')); }); w.appendChild(c); box.appendChild(w);
    });
    if (!anyOpen) { var d = mk('div', 'banner ok'); d.appendChild(icon('check')); d.appendChild(mk('b', 'grow', T('shop.done'))); box.appendChild(d); }
    ['cart', 'home'].forEach(function (s) {
      var its = vis.filter(function (it) { return stOfItem(it) === s; }); if (!its.length) return;
      var w = mk('div'); w.appendChild(mk('p', 'grph', T('shop.sec.' + s) + ' (' + its.length + ')')); var c = mk('div', 'card');
      its.forEach(function (it) { c.appendChild(shopRow(it, s)); }); w.appendChild(c); box.appendChild(w);
    });
    var sub = $('#shopSub');
    if (sub) {
      var planN = 0;
      getShopItems().forEach(function (it) { planN += (it.recipesPlan || []).length ? 1 : 0; });
      if (planN) sub.textContent = T('shop.from.plan', { n: String(getPlan().days) });
    }
  }
  function makeShopFromPlan() {
    refreshPlanQuantities();
    renderShop();
    toast(T('plan.shop.done'));
    go('einkauf');
  }
  function confirmPlanSheet() {
    if (!planSheet || !planSheet.recipeId) return;
    var item = {
      id: (planSheet.itemId && validPlanItemId(planSheet.itemId)) ? planSheet.itemId : newPlanItemId(),
      date: planSheet.date,
      slot: planSheet.slot,
      recipeId: planSheet.recipeId,
      portions: coercePortions(planSheet.portions)
    };
    if (!upsertPlanItem(item)) return;
    closePlanSheet();
    toast(T('recipe.addplan.toast'));
    if (curScreen !== 'plan') go('plan');
  }

    function renderLangBinds() {
    var m = I.meta();
    $$('[data-bind=langcode]').forEach(function (e) { e.textContent = I.lang().toUpperCase(); });
    $$('[data-bind=langname]').forEach(function (e) { e.textContent = m.name || I.lang(); });
  }
  function renderLegal() {
    var box = $('#legalBox'); if (!box) return; box.textContent = '';
    var L = I.res().legal || (I.res(I.fallback) || {}).legal || {};
    var hd = mk('div', 'row sp'); hd.appendChild(mk('span', 'chip warn', T('legal.status'))); box.appendChild(hd);
    if (L.note) { var bn = mk('div', 'banner care'); bn.appendChild(icon('heart')); bn.appendChild(mk('span', 'grow', L.note)); box.appendChild(bn); }
    (L.sections || []).forEach(function (sec) {
      var c = mk('div', 'card stack'); c.appendChild(mk('h2', '', sec.title));
      (sec.paragraphs || []).forEach(function (p) { c.appendChild(mk('p', '', p)); }); box.appendChild(c);
    });
    if (L.credits) {
      var cc = mk('div', 'card stack'); cc.appendChild(mk('h2', '', L.credits.title));
      var ul = mk('ul', 'files'); (L.credits.items || []).forEach(function (x) { ul.appendChild(mk('li', '', x)); }); cc.appendChild(ul); box.appendChild(cc);
    }
  }
  // Statuszeilen der Schalter aus dem aktuellen Schalterzustand in der aktiven Sprache setzen (Start + Sprachwechsel)
  function renderSwitchTexts() {
    var on = function (sel) { var e = document.querySelector(sel); return !!e && e.getAttribute('aria-checked') === 'true'; };
    var set = function (id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; };
    if (document.querySelector('[data-sw="hc"]')) set('hcTxt', T(on('[data-sw="hc"]') ? 'hc.on' : 'hc.off'));
    if (document.querySelector('[data-sw="sc"]')) set('scTxt', T(on('[data-sw="sc"]') ? 'sc.on' : 'sc.off'));
    if (document.querySelector('[data-sw="ew"]')) set('ewTxt', on('[data-sw="ew"]') ? T('ew.on') : T('rem.off'));
    if (document.querySelector('[data-fast]')) set('fastTxt', T(on('[data-fast]') ? 'fast.on' : 'fast.off'));
  }
  function onLang() {
    $('#toast').hidden = true;
    buildForms(); buildPace(); buildPrefs(); buildFavs();
    renderLangUI(); renderSoundUI(); render(); renderTheme(); renderItems(); renderBarFit(); renderQr(); renderSwitchTexts();
    if (tInt) trainLabel();
    var scr = document.getElementById(curScreen); if (scr) document.title = T('doc.title', { screen: scr.getAttribute('data-title') });
    if ($('#fortschritt').classList.contains('active') || $('#koerper').classList.contains('active')) drawCharts();
  }
  document.addEventListener('edovita-lang', onLang);

  // ---------- Partnermodus ----------
  var PCONN = { qr: 'pcQr', code: 'pcCode', wa: 'pcWa' };
  function renderPartner() {
    var v = $('#partnerView'); if (!v) return;
    var rem = Math.max(0, state.goalKcal - state.eaten), rec = rget('recipes', topRecipe().id);
    v.textContent = state.share.p3 ? T(state.goal === 'gain' ? 'partner.view.gain' : 'partner.view.lose', { n: fmt(rem), recipe: rec }) : T('partner.view.hidden');
    $$('[data-sw^=p]').forEach(function (b) { var k = b.getAttribute('data-sw'); if (state.share.hasOwnProperty(k)) b.setAttribute('aria-checked', state.share[k] ? 'true' : 'false'); });
    $$('[data-pconn]').forEach(function (b) { var on = b.getAttribute('data-pconn') === state.pconn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    Object.keys(PCONN).forEach(function (k) { $('#' + PCONN[k]).hidden = k !== state.pconn; });
  }
  // Deterministischer Beispiel-QR (kein echter Code, nur Optik)
  function renderQr() {
    var box = $('#pcQr'); if (!box) return; box.textContent = '';
    var N = 25, sz = 8, svg = se('svg', { viewBox: '0 0 ' + (N * sz) + ' ' + (N * sz), class: 'qr', role: 'img', 'aria-label': T('partner.qr_code') }, box);
    se('rect', { x: 0, y: 0, width: N * sz, height: N * sz, fill: '#fff' }, svg);
    var seed = 482913, rnd = function () { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    var inFinder = function (x, y) { return (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9); };
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() < 0.48) se('rect', { x: x * sz, y: y * sz, width: sz, height: sz, fill: '#1B2B2A' }, svg);
    }
    [[0, 0], [N - 7, 0], [0, N - 7]].forEach(function (p) {
      se('rect', { x: p[0] * sz, y: p[1] * sz, width: 7 * sz, height: 7 * sz, fill: '#1B2B2A' }, svg);
      se('rect', { x: (p[0] + 1) * sz, y: (p[1] + 1) * sz, width: 5 * sz, height: 5 * sz, fill: '#fff' }, svg);
      se('rect', { x: (p[0] + 2) * sz, y: (p[1] + 2) * sz, width: 3 * sz, height: 3 * sz, fill: '#0F9D84' }, svg);
    });
  }

  // ---------- Datenschutz: Backup nur mit ausdrücklicher Einwilligung ----------
  function renderBackup() {
    var sw = $('#bkSw'); if (!sw) return;
    sw.setAttribute('aria-checked', state.backup ? 'true' : 'false');
    $('#bkTxt').textContent = T(state.backup ? 'bk.on' : 'bk.off');
    $('#bkAgree').classList.toggle('on', state.bkAgree); $('#bkAgree').setAttribute('aria-pressed', state.bkAgree ? 'true' : 'false');
    $('#bkOn').disabled = !state.bkAgree;
    $$('[data-bind=backupsummary]').forEach(function (e) { e.textContent = T(state.backup ? 'bk.sum.on' : 'bk.sum.off'); });
  }

  // ---------- Klicks ----------
  function pressGroup(sel, el) { $$(sel, el.parentNode).forEach(function (b) { var on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
  document.addEventListener('click', function (e) {
    if (e.target && (e.target.id === 'langBackdrop' || (e.target.closest && e.target.closest('#langBackdrop')))) {
      setLangMenu(false); setSecondMenus(false); return;
    }
    if (e.target && e.target.id === 'planSheetBack') { closePlanSheet(); return; }
    if (e.target && e.target.id === 'shopSrcBack') { closeShopSrc(); return; }
    var recCard = e.target.closest ? e.target.closest('[data-recipe]') : null;
    if (recCard && !(e.target.closest && e.target.closest('[data-rate], [data-save], [data-addlist], [data-second], .second-chip, #secondSwitchBtn'))) {
      openRecipe(recCard.getAttribute('data-recipe')); return;
    }
    var el = e.target.closest ? e.target.closest('button, [data-go], [data-back]') : null;
    if (!el) return;
    if (el.id === 'notif') el.hidden = true;
    if (el.hasAttribute('data-sfx')) play(el.getAttribute('data-sfx'));
    if (el.id === 'langSwitchBtn' || (el.closest && el.closest('#langSwitchBtn'))) {
      setLangMenu(!LANG_MENU_OPEN); return;
    }
    if (el.id === 'secondSwitchBtn' || el.classList.contains('second-chip')) {
      setSecondMenus(!SECOND_MENU_OPEN || el.getAttribute('aria-expanded') !== 'true', el); return;
    }
    if (el.hasAttribute('data-second')) {
      var sc = el.getAttribute('data-second');
      if (sc === 'auto') { setSecondLang('auto'); }
      else if (sc === 'none') { setSecondLang('none'); }
      else if (sc === I.lang()) { toast(T('second.same')); setSecondMenus(false); return; }
      else if (!setSecondLang(sc)) { toast(T('second.same')); setSecondMenus(false); return; }
      setSecondMenus(false);
      renderSecondLangUI();
      return;
    }
    if (el.id === 'rezeptAddPlan') {
      openPlanSheet({ mode: 'form', recipeId: state.recipeId || 'oven_salmon' }); return;
    }
    if (el.id === 'planMakeShop') { makeShopFromPlan(); return; }
    if (el.id === 'planSheetClose' || el.id === 'planSheetCancel' || el.id === 'planSheetBack') { closePlanSheet(); return; }
    if (el.id === 'shopSrcClose' || el.id === 'shopSrcBack') { closeShopSrc(); return; }
    if (el.hasAttribute('data-shop-src')) {
      var sk = el.getAttribute('data-shop-src').split(':');
      var sitem = getShopItems().filter(function (x) { return x.id === sk[0] && (x.unit || '') === (sk[1] || ''); })[0];
      if (sitem) openShopSrc(sitem, el);
      return;
    }
    if (el.hasAttribute('data-plan-days')) { setPlanDays(el.getAttribute('data-plan-days')); return; }
    if (el.hasAttribute('data-plan-add')) {
      var pa = el.getAttribute('data-plan-add').split('|');
      if (pa.length === 2) openPlanSheet({ mode: 'pick', date: pa[0], slot: pa[1], filterMeal: pa[1] });
      return;
    }
    if (el.hasAttribute('data-plan-swap')) {
      var swid = el.getAttribute('data-plan-swap'), swit = getPlan().items.filter(function (x) { return x.id === swid; })[0];
      if (swit) openPlanSheet({ mode: 'pick', date: swit.date, slot: swit.slot, itemId: swit.id, portions: swit.portions, filterMeal: swit.slot });
      return;
    }
    if (el.hasAttribute('data-plan-remove')) { removePlanItem(el.getAttribute('data-plan-remove')); return; }
    if (el.hasAttribute('data-plan-open')) { openRecipe(el.getAttribute('data-plan-open')); return; }
    if (el.hasAttribute('data-plan-pick')) {
      planSheet = planSheet || {};
      planSheet.recipeId = el.getAttribute('data-plan-pick');
      planSheet.mode = 'form';
      if (planSheet.portions == null) planSheet.portions = recipeServings(planSheet.recipeId);
      renderPlanSheet();
      return;
    }
    if (el.hasAttribute('data-plan-day')) { planSheet.date = el.getAttribute('data-plan-day'); renderPlanSheet(); return; }
    if (el.hasAttribute('data-plan-slot')) { planSheet.slot = el.getAttribute('data-plan-slot'); renderPlanSheet(); return; }
    if (el.hasAttribute('data-plan-step')) {
      var stv = parseInt(el.getAttribute('data-plan-step'), 10);
      planSheet.portions = coercePortions((planSheet.portions || 2) + (isFinite(stv) ? stv : 0));
      renderPlanSheet();
      return;
    }
    if (el.hasAttribute('data-plan-confirm')) { confirmPlanSheet(); return; }
    if (el.hasAttribute('data-lang')) {
      var lc = el.getAttribute('data-lang');
      if (!I.approved(lc)) { toast(T('lang.notApproved')); setLangMenu(false); return; }
      if (lc !== I.lang() && I.setLang(lc)) toast(T('lang.changed', { name: I.meta().name }));
      setLangMenu(false);
      var sw = $('#langSwitchBtn'); if (sw) sw.focus();
      return;
    }
    if (el.hasAttribute('data-sound')) { setSound(!state.sound); return; }
    if (el.id === 'soundQuick') { setSound(!state.sound); return; }
    if (el.hasAttribute('data-hymn')) { var hy = el.getAttribute('data-hymn'); if (HYMNS.indexOf(hy) !== -1) { state.hymn = hy; setPref('edovita.hymn', hy); renderSoundUI(); renderSoundState(); play(hy); } return; }
    if (el.hasAttribute('data-preview')) { var pv = el.getAttribute('data-preview'); if (playing === pv) stopSound(); else play(pv, true); return; }
    if (el.hasAttribute('data-theme-set')) { if (window.EdoTheme) window.EdoTheme.set(el.getAttribute('data-theme-set')); return; }
    if (el.id === 'themeQuick') { if (window.EdoTheme) window.EdoTheme.set(window.EdoTheme.eff() === 'dark' ? 'light' : 'dark'); return; }
    if (el.hasAttribute('data-splash')) { startSplash(el.getAttribute('data-splash') === 'loop'); return; }
    if (el.hasAttribute('data-reward')) { showReward('reward.demo'); return; }
    if (el.id === 'rwClose') { hideReward(); return; }
    if (el.hasAttribute('data-go')) { go(el.getAttribute('data-go')); return; }
    if (el.hasAttribute('data-back')) { var prev = history_.pop(); go_back(prev || el.getAttribute('data-back')); return; }
    if (el.hasAttribute('data-goal')) {
      var g = el.getAttribute('data-goal'); if (!GOALS[g]) return;
      state.goalWas = null; if (g !== state.goal) state.kcalConfAt = null; state.goal = g; // Bestätigung gilt nur für das Ziel, bei dem sie gegeben wurde
      if (g === 'lose' && loseBlocked()) { toast(T('toast.loseBlocked')); return; }
      state.tweight = g === 'lose' ? Math.max(tMin(), Math.min(state.weight - 0.5, Math.round(kgOf(24) * 2) / 2)) : g === 'gain' ? Math.round(clamp(state.weight + 3, state.weight, Math.max(state.weight, kgOf(24.9))) * 2) / 2 : Math.round(state.weight * 2) / 2;
      render(); return;
    }
    if (el.hasAttribute('data-sex')) { var sx = el.getAttribute('data-sex'); if (sx === 'm' || sx === 'w') { state.sex = sx; render(); } return; }
    if (el.hasAttribute('data-range')) {
      var grp = el.closest('[data-seg]'), kind = grp.getAttribute('data-seg'), rv = el.getAttribute('data-range');
      if (kind === 'w' && W_DAYS[rv]) state.rangeW = rv; else if (kind === 'f' && F_DAYS[rv]) state.rangeF = rv; else return;
      pressGroup('[data-range]', el); drawCharts(); return;
    }
    if (el.hasAttribute('data-pmode')) { var pm = el.getAttribute('data-pmode'); if (PACE_KEYS[pm]) { if (pm === 'kcal' && !state.kcalSet) { state.kcal = Math.max(KCAL_HARD, calcGoalKcal()); state.kcalSet = true; } state.pmode = pm; render(); } return; }
    if (el.hasAttribute('data-kpreset')) { var kp = parseInt(el.getAttribute('data-kpreset'), 10); if (isFinite(kp)) { state.kcalSet = true; setField('kcal', kp, true); } return; }
    if (el.hasAttribute('data-pref')) {
      var pk = el.getAttribute('data-pref'); if (!EXC[pk]) return;
      state.prefs[pk] = !state.prefs[pk];
      if (state.prefs[pk] && pk === 'veg') state.prefs.vegan = false;
      if (state.prefs[pk] && pk === 'vegan') state.prefs.veg = false;
      render(); return;
    }
    if (el.hasAttribute('data-rmeal')) { var rm = el.getAttribute('data-rmeal'); if (RMEALS[rm]) { state.rmeal = rm; renderRecipes(); } return; }
    if (el.hasAttribute('data-rprop')) { var rp = el.getAttribute('data-rprop'); if (RPROPS[rp]) { state.rprops[rp] = !state.rprops[rp]; renderRecipes(); } return; }
    if (el.hasAttribute('data-rate')) {
      var rr = el.getAttribute('data-rate').split(':'), rn = parseInt(rr[1], 10);
      if (RECIPES.some(function (x) { return x.id === rr[0]; }) && rn >= 1 && rn <= 5) { state.ratings[rr[0]] = rn; renderRecipes(); toast(T('recipe.rated.toast')); }
      return;
    }
    if (el.hasAttribute('data-save')) {
      var sid = el.getAttribute('data-save');
      if (RECIPES.some(function (x) { return x.id === sid; })) { state.saved[sid] = !state.saved[sid]; renderRecipes(); if (state.saved[sid]) toast(T('recipe.saved.toast')); }
      return;
    }
    if (el.hasAttribute('data-shop')) {
      var sh = el.getAttribute('data-shop').split(':');
      var sid = sh[0], sunit = sh.length === 3 ? sh[1] : '', sst = sh.length === 3 ? sh[2] : sh[1];
      if (sid && SHOP_ST[sst] && getShopItems().some(function (x) { return x.id === sid && (x.unit || '') === sunit; })) {
        state.shop[sid + '\0' + sunit] = sst;
        if (!sunit) state.shop[sid] = sst;
        renderShop();
      }
      return;
    }
    if (el.hasAttribute('data-portion')) { var po = el.getAttribute('data-portion'); if (PORTION[po]) { state.portion = po; renderFood(); } return; }
    if (el.hasAttribute('data-food')) {
      var fd = FOODS.filter(function (x) { return x.id === el.getAttribute('data-food'); })[0];
      if (fd) { var fp = state.portion, ff = PORTION[fp]; addExtra({ name: function () { return rget('foods', fd.id); }, kcal: fd.kcal * ff, p: fd.p * ff, tag: PORTION_KEY[fp] }); state.foodQ = ''; $('#foodQ').value = ''; go('heute'); }
      return;
    }
    if (el.id === 'micBtn') { micSim(); return; }
    if (el.hasAttribute('data-water')) { var wv = parseInt(el.getAttribute('data-water'), 10); if ([250, 500, -250].indexOf(wv) !== -1) { var wasBelow = state.water < state.waterGoal; state.water = clamp(state.water + wv, 0, 6000); render(); if (wasBelow && state.water >= state.waterGoal) showReward('reward.water'); } return; }
    if (el.hasAttribute('data-wg')) { var wg = parseInt(el.getAttribute('data-wg'), 10); if (wg === 250 || wg === -250) { state.waterGoal = clamp(state.waterGoal + wg, 1000, 4000); render(); } return; }
    if (el.hasAttribute('data-notif')) { showNotif(el.getAttribute('data-notif')); return; }
    if (el.hasAttribute('data-fav')) { var fi = parseInt(el.getAttribute('data-fav'), 10); if (FAVS[fi]) { var fv = FAVS[fi]; addExtra({ name: function () { return rget('foods', fv.id); }, kcal: fv.kcal, p: fv.p, tag: 'tag.meal' }); go('heute'); } return; }
    if (el.id === 'barBtn' || el.id === 'barAgain') { showBar(); return; }
    if (el.id === 'barCancel') { resetCapture(); return; }
    if (el.id === 'barAdd') { addExtra({ name: function () { return T('erfassen.naturjoghurt_3_5'); }, kcal: 95, p: 5.4, tag: 'tag.barcode' }); go('heute'); return; }
    if (el.hasAttribute('data-pconn')) { var pc = el.getAttribute('data-pconn'); if (PCONN[pc]) { state.pconn = pc; renderPartner(); } return; }
    if (el.id === 'pcSim') { showReward('reward.partner', 'C_zusammen'); return; }
    if (el.id === 'bkSw') {
      if (state.backup) { state.backup = false; state.bkAgree = false; renderBackup(); toast(T('bk.toast.off')); }
      else { $('#bkConsent').hidden = false; }
      return;
    }
    if (el.id === 'bkAgree') { state.bkAgree = !state.bkAgree; renderBackup(); return; }
    if (el.id === 'bkOn') { if (!state.bkAgree) return; state.backup = true; $('#bkConsent').hidden = true; renderBackup(); toast(T('bk.toast.on')); return; }
    if (el.id === 'bkCancel') { state.bkAgree = false; $('#bkConsent').hidden = true; renderBackup(); return; }
    if (el.hasAttribute('data-toast')) { toast(el.getAttribute('data-toast')); return; }
    if (el.hasAttribute('data-addlist')) {
      var arid = el.getAttribute('data-addlist') || state.recipeId;
      addRecipeToListAndMaybePlan(arid);
      setTimeout(function () { go('einkauf'); }, 700);
      return;
    }
    if (el.id === 'shutter') { analyse(); return; }
    if (el.id === 'confirm') { state.dinnerSaved = true; render(); go('heute'); showReward('reward.meal'); return; }
    if (el.id === 'trainBtn') { toggleTimer(); return; }
    if (el.id === 'tlapse') { timelapse(); return; }
    if (el.classList.contains('fchip') && !el.hasAttribute('data-reste-ing') && !el.hasAttribute('data-region') && !el.hasAttribute('data-month') && !el.hasAttribute('data-akt') && !el.hasAttribute('data-travel-region') && !el.hasAttribute('data-ean-sample')) { pressGroup('.fchip', el); return; }
    if (el.hasAttribute('data-view')) { pressGroup('[data-view]', el); return; }
    if (el.classList.contains('chk')) { var on = !el.classList.contains('on'); el.classList.toggle('on', on); el.setAttribute('aria-pressed', on ? 'true' : 'false'); return; }
    if (el.hasAttribute('data-tgt')) {
      var d = parseInt(el.getAttribute('data-tgt'), 10);
      if (d === 10 || d === -10) { state.target = Math.max(60, Math.min(200, state.target + d)); render(); }
      return;
    }
    if (el.getAttribute('role') === 'switch') {
      var v = el.getAttribute('aria-checked') !== 'true';
      el.setAttribute('aria-checked', v ? 'true' : 'false');
      var k = el.getAttribute('data-sw');
      if (k && state.share.hasOwnProperty(k)) { state.share[k] = v; renderPartner(); }
      if (k === 'hc') $('#hcTxt').textContent = T(v ? 'hc.on' : 'hc.off');
      if (k && k.indexOf('r_') === 0 && state.rem.hasOwnProperty(k.slice(2))) { state.rem[k.slice(2)] = v; render(); }
      if (k === 'sc') { state.scale = v; $('#scTxt').textContent = T(v ? 'sc.on' : 'sc.off'); }
      if (k === 'ew') $('#ewTxt').textContent = v ? T('ew.on') : T('rem.off');
      if (el.hasAttribute('data-fast')) { $('#fastTxt').textContent = T(v ? 'fast.on' : 'fast.off'); $('#fastBar').style.width = v ? '73%' : '0%'; }
    }
  });
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-kconf')) { state.kcalConfAt = t.checked ? state.kcal : null; render(); } });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.id === 'foodQ') { state.foodQ = String(t.value || '').slice(0, 40); renderFood(); return; }
    if (!t || t.type !== 'range' || !t.hasAttribute('data-key')) return;
    var k = t.getAttribute('data-key'), L = LIMITS[k]; if (!L) return;
    var v = parseFloat(t.value); if (!isFinite(v)) return;
    state[k] = fieldRound(k, clamp(v, fieldLo(k), fieldHi(k)));
    if (k === 'kcal') state.kcalSet = true;
    fldMsg(k, ''); render();
  });
  function go_back(id) { if (SCREENS.indexOf(id) === -1) id = 'heute'; location.hash = '#/' + id; }


  // ---------- V1-Bridge für v1-features.js ----------
  window.EdoApp = {
    addMeal: function (o) { addExtra({ name: function () { return o.name; }, kcal: o.kcal, p: o.p, tag: o.tag || 'tag.meal' }); render(); },
    weight: function () { return state.weight; },
    addActivityKcal: function (k) {
      k = Math.round(Number(k) || 0);
      if (k > 0) { state.goalKcal = Math.round((state.goalKcal + k) / 50) * 50; render(); }
    },
    shopSnapshot: function () {
      return SHOP.filter(function (it) { return allowed(it.has); }).map(function (it) {
        return { id: it.id, name: rget('ingredients', it.id) || it.id, st: state.shop[it.id] || 'open' };
      });
    },
    applyShopImport: function (items) {
      (items || []).forEach(function (it) {
        if (!it || !it.id) return;
        if (SHOP.some(function (x) { return x.id === it.id; })) state.shop[it.id] = it.st || 'open';
      });
      renderShop(); toast(T('qrshop.imported', { n: String((items || []).length) }));
    }
  };


  // ---------- v5.4: Screen-Body + fixe Aktionsleiste ----------
  function layoutScreens() {
    $$('.screen').forEach(function (scr) {
      if (scr.querySelector(':scope > .screen-body')) return;
      var body = document.createElement('div');
      body.className = 'screen-body';
      var actions = null;
      var nodes = Array.prototype.slice.call(scr.childNodes);
      nodes.forEach(function (n) {
        if (n.nodeType === 1 && n.classList && n.classList.contains('actions')) {
          actions = n;
        } else {
          body.appendChild(n);
        }
      });
      // Trailing Hauptbuttons ohne .actions: aus letztem Stack ziehen (nicht in .card)
      if (!actions) {
        var stacks = $$(':scope > .stack', body);
        var host = stacks.length ? stacks[stacks.length - 1] : body;
        var kids = Array.prototype.slice.call(host.children);
        var take = [];
        for (var i = kids.length - 1; i >= 0; i--) {
          var el = kids[i];
          if (el.matches && el.matches('button.btn, a.btn') && !el.classList.contains('half') && !el.classList.contains('goal')) {
            take.unshift(el);
          } else break;
        }
        if (take.length) {
          actions = document.createElement('div');
          actions.className = 'actions';
          actions.setAttribute('role', 'group');
          actions.setAttribute('aria-label', 'Aktionen');
          take.forEach(function (el) { actions.appendChild(el); });
        }
      }
      scr.appendChild(body);
      if (actions) scr.appendChild(actions);
    });
  }
  function syncAppHeight() {
    var vv = window.visualViewport;
    var h = vv && vv.height ? Math.round(vv.height) : window.innerHeight;
    if (h > 0) document.documentElement.style.setProperty('--app-h', h + 'px');
  }

  window.addEventListener('hashchange', route);
  layoutScreens();
  syncAppHeight();
  window.addEventListener('resize', syncAppHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncAppHeight);
    window.visualViewport.addEventListener('scroll', syncAppHeight);
  }
  I.applyDom(document);
  (function () { var p = String(state.dob).split('-'); state.age = ageFrom(+p[0], +p[1], +p[2]); })();
  buildForms(); buildPace(); buildPrefs(); buildFavs(); applyWidths(); render(); renderLangUI(); renderSoundUI(); renderQr(); renderSwitchTexts(); route(); renderTheme();
  splashTimer = setTimeout(endSplash, REDUCED ? 1200 : 5100);
})();
