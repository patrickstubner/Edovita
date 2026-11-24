/* Edovita V1 feature screens (local-first). Depends on EdoI18n, EdoV1Data, EdoQR. */
(function () {
  'use strict';
  var I = window.EdoI18n;
  var D = window.EdoV1Data || {};
  var T = function (k, v) { return I.t(k, v); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mk = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  var icon = function (name, cls) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'ic ' + (cls || '')); svg.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#i-' + name); svg.appendChild(u); return svg;
  };
  var fmt = function (n) { return I.num(Math.round(n)); };
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  var v1 = {
    region: 'CH',
    month: (new Date(2026, 10, 6)).getMonth() + 1, // Nov
    leftovers: [], // {id, amount}
    windowOn: false,
    windowFrom: '10:00',
    windowTo: '18:00',
    travel: false,
    travelRegion: 'IT',
    activities: [], // {id, min, intensity 1-3, kcal}
    yesterday: { id: 'oatmeal_berries', kcal: 320, p: 12 },
    barQuery: '',
    barHit: null
  };

  try {
    var raw = localStorage.getItem('edovita.v1');
    if (raw) {
      var o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        if (typeof o.region === 'string' && (D.regions || []).indexOf(o.region) !== -1) v1.region = o.region;
        if (typeof o.windowOn === 'boolean') v1.windowOn = o.windowOn;
        if (typeof o.travel === 'boolean') v1.travel = o.travel;
        if (typeof o.travelRegion === 'string') v1.travelRegion = o.travelRegion;
      }
    }
  } catch (e) { /* ignore */ }

  function save() {
    try {
      localStorage.setItem('edovita.v1', JSON.stringify({
        region: v1.region, windowOn: v1.windowOn, travel: v1.travel, travelRegion: v1.travelRegion
      }));
    } catch (e) { /* ignore */ }
  }

  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function go(id) { location.hash = '#/' + id; }

  // ---------- 1 Resteverwertung ----------
  var ING_POOL = ['broccoli','chickpeas','berries','yogurt','eggs','quinoa','nuts','olive_oil','salmon','rice','tomato','onion','spinach','carrot','chicken','apple','oats','lentils','beans','potato','cucumber','lettuce','mushroom','pepper'];

  function renderReste() {
    var box = $('#resteList'); if (!box) return;
    box.textContent = '';
    var wrap = mk('div', 'stack');
    wrap.appendChild(mk('p', 'sub', T('reste.sub')));
    var add = mk('div', 'card stack');
    add.appendChild(mk('b', '', T('reste.add')));
    var row = mk('div', 'filters'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', T('reste.add'));
    ING_POOL.slice(0, 12).forEach(function (id) {
      var on = v1.leftovers.some(function (x) { return x.id === id; });
      var b = mk('button', 'fchip' + (on ? ' on' : ''), T('ing.' + id));
      b.type = 'button'; b.setAttribute('data-reste-ing', id); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      row.appendChild(b);
    });
    add.appendChild(row);
    wrap.appendChild(add);

    if (v1.leftovers.length) {
      var am = mk('div', 'card stack'); am.appendChild(mk('b', '', T('reste.amounts')));
      v1.leftovers.forEach(function (it) {
        var r = mk('div', 'set');
        r.appendChild(mk('div', 'tx grow', T('ing.' + it.id)));
        var st = mk('div', 'step');
        var m = mk('button', '', '–'); m.type = 'button'; m.setAttribute('data-reste-amt', it.id + ':-1'); m.setAttribute('aria-label', T('step.dec'));
        var o = mk('output', '', String(it.amount) + ' ' + T('reste.unit'));
        var p = mk('button', '', '+'); p.type = 'button'; p.setAttribute('data-reste-amt', it.id + ':1'); p.setAttribute('aria-label', T('step.inc'));
        st.appendChild(m); st.appendChild(o); st.appendChild(p); r.appendChild(st); am.appendChild(r);
      });
      wrap.appendChild(am);
    }

    var sug = mk('div', 'stack'); sug.appendChild(mk('p', 'grph', T('reste.suggestions')));
    var hits = matchRecipes();
    if (!hits.length) sug.appendChild(mk('p', 'cap', T('reste.none')));
    hits.forEach(function (h) {
      var c = mk('div', 'card row top');
      var tx = mk('div', 'grow');
      tx.appendChild(mk('b', '', h.title));
      tx.appendChild(mk('p', 'cap', T('reste.match', { n: h.score, total: h.need })));
      c.appendChild(tx);
      var btn = mk('button', 'btn line sm', T('reste.use')); btn.type = 'button'; btn.setAttribute('data-go', 'rezepte');
      c.appendChild(btn); sug.appendChild(c);
    });
    wrap.appendChild(sug);
    wrap.appendChild(mk('p', 'cap', T('reste.note')));
    box.appendChild(wrap);
  }

  function matchRecipes() {
    var have = {};
    v1.leftovers.forEach(function (x) { have[x.id] = x.amount; });
    var ings = D.recipeIngs || {};
    var out = [];
    Object.keys(ings).forEach(function (rid) {
      var need = ings[rid], score = 0;
      need.forEach(function (i) { if (have[i]) score++; });
      if (score > 0) {
        var title = (I.res().recipes && I.res().recipes.recipes && I.res().recipes.recipes[rid]) || rid;
        out.push({ id: rid, title: title, score: score, need: need.length });
      }
    });
    out.sort(function (a, b) { return b.score - a.score || a.need - b.need; });
    return out.slice(0, 6);
  }

  // ---------- 2 Saisonkalender ----------
  function renderSaison() {
    var box = $('#saisonBox'); if (!box) return;
    box.textContent = '';
    var head = mk('div', 'card stack');
    head.appendChild(mk('b', '', T('saison.region')));
    var regs = mk('div', 'filters'); regs.setAttribute('role', 'group'); regs.setAttribute('aria-label', T('saison.region'));
    (D.regions || []).forEach(function (r) {
      var b = mk('button', 'fchip' + (v1.region === r ? ' on' : ''), T('region.' + r));
      b.type = 'button'; b.setAttribute('data-region', r); b.setAttribute('aria-pressed', v1.region === r ? 'true' : 'false');
      regs.appendChild(b);
    });
    head.appendChild(regs);
    head.appendChild(mk('b', '', T('saison.month')));
    var months = mk('div', 'filters');
    for (var m = 1; m <= 12; m++) {
      var b = mk('button', 'fchip' + (v1.month === m ? ' on' : ''), T('month.' + m));
      b.type = 'button'; b.setAttribute('data-month', String(m)); b.setAttribute('aria-pressed', v1.month === m ? 'true' : 'false');
      months.appendChild(b);
    }
    head.appendChild(months);
    box.appendChild(head);

    var list = mk('div', 'stack');
    list.appendChild(mk('p', 'grph', T('saison.now', { region: T('region.' + v1.region), month: T('month.' + v1.month) })));
    var prod = D.produce || {};
    var veg = mk('div', 'card stack'); veg.appendChild(mk('b', '', T('saison.veg')));
    var fruit = mk('div', 'card stack'); fruit.appendChild(mk('b', '', T('saison.fruit')));
    var anyV = false, anyF = false;
    Object.keys(prod).forEach(function (id) {
      var p = prod[id];
      var months = (p.m && p.m[v1.region]) || [];
      if (months.indexOf(v1.month) === -1) return;
      var row = mk('div', 'set'); row.appendChild(mk('div', 'tx grow', T('produce.' + id)));
      row.appendChild(mk('span', 'chip', T('saison.local')));
      if (p.kind === 'fruit') { fruit.appendChild(row); anyF = true; } else { veg.appendChild(row); anyV = true; }
    });
    if (!anyV) veg.appendChild(mk('p', 'cap', T('saison.empty')));
    if (!anyF) fruit.appendChild(mk('p', 'cap', T('saison.empty')));
    list.appendChild(veg); list.appendChild(fruit);
    list.appendChild(mk('p', 'cap', T('saison.note')));
    box.appendChild(list);
  }

  // ---------- 3 Ein-Tipp ----------
  function renderEintipp() {
    var box = $('#eintippBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('eintipp.sub')));
    var y = mk('button', 'card link row'); y.type = 'button'; y.setAttribute('data-eintipp', 'yesterday');
    y.appendChild(icon('clock')); 
    var yt = mk('div', 'grow'); yt.appendChild(mk('b', '', T('eintipp.yesterday'))); yt.appendChild(mk('p', 'cap', T('eintipp.yesterday.x', { name: T('food.' + v1.yesterday.id), k: fmt(v1.yesterday.kcal) })));
    y.appendChild(yt); box.appendChild(y);

    (D.templates || []).filter(function (t) { return t.kind !== 'yesterday'; }).forEach(function (t) {
      var b = mk('button', 'card link row'); b.type = 'button'; b.setAttribute('data-eintipp', t.id);
      b.appendChild(icon(t.kind === 'fav' ? 'star' : 'utensils'));
      var tx = mk('div', 'grow');
      tx.appendChild(mk('b', '', T('eintipp.' + t.id)));
      tx.appendChild(mk('p', 'cap', T('eintipp.kcal', { k: fmt(t.kcal), p: fmt(t.p) })));
      b.appendChild(tx); box.appendChild(b);
    });
    box.appendChild(mk('p', 'cap', T('eintipp.note')));
  }

  // ---------- 4 Portionen Hand ----------
  function renderPortionen() {
    var box = $('#portionenBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('hand.sub')));
    (D.hand || []).forEach(function (h) {
      var c = mk('div', 'card row top');
      var circ = mk('span', 'circ'); circ.appendChild(icon('hand' === 'x' ? 'leaf' : 'leaf')); c.appendChild(circ);
      var tx = mk('div', 'grow');
      tx.appendChild(mk('b', '', T('hand.' + h.id)));
      tx.appendChild(mk('p', 'cap', T('hand.' + h.id + '.x', { g: fmt(h.approx_g) })));
      tx.appendChild(mk('p', 'cap', T('hand.use.' + h.use)));
      c.appendChild(tx); box.appendChild(c);
    });
    box.appendChild(mk('p', 'cap', T('hand.note')));
  }

  // ---------- 5 Barcode DB ----------
  function lookupEan(q) {
    q = String(q || '').replace(/\D/g, '');
    if (!q) return null;
    var list = D.foodDb || [];
    for (var i = 0; i < list.length; i++) if (list[i].ean === q || list[i].ean.indexOf(q) === 0) return list[i];
    return null;
  }

  function renderBarcodeDb() {
    var box = $('#bardbBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('bardb.sub')));
    var card = mk('div', 'card stack');
    var lab = mk('label', ''); lab.appendChild(mk('span', 'cap', T('bardb.ean')));
    var inp = document.createElement('input'); inp.type = 'text'; inp.className = 'inp'; inp.id = 'barEan';
    inp.setAttribute('inputmode', 'numeric'); inp.setAttribute('maxlength', '13');
    inp.setAttribute('autocomplete', 'off'); inp.value = v1.barQuery;
    inp.setAttribute('aria-label', T('bardb.ean'));
    lab.appendChild(inp); card.appendChild(lab);
    var actions = mk('div', 'row');
    var search = mk('button', 'btn', T('bardb.search')); search.type = 'button'; search.id = 'barSearch';
    var scan = mk('button', 'btn line', T('bardb.scan')); scan.type = 'button'; scan.id = 'barScan';
    actions.appendChild(search); actions.appendChild(scan); card.appendChild(actions);
    box.appendChild(card);

    var hit = v1.barHit;
    var res = mk('div', 'stack'); res.id = 'barResult';
    if (hit) {
      var c = mk('div', 'card stack');
      c.appendChild(mk('b', '', T(hit.name_key)));
      c.appendChild(mk('p', 'cap', T(hit.brand_key) + ' · EAN ' + hit.ean));
      c.appendChild(mk('p', '', T('bardb.macros', { k: fmt(hit.kcal), p: f1(hit.p), g: fmt(hit.g) })));
      var add = mk('button', 'btn', T('bardb.add')); add.type = 'button'; add.id = 'barAddDb';
      c.appendChild(add); res.appendChild(c);
    } else if (v1.barQuery) {
      res.appendChild(mk('p', 'cap', T('bardb.miss')));
    }
    box.appendChild(res);

    var sample = mk('div', 'card stack'); sample.appendChild(mk('b', '', T('bardb.samples')));
    (D.foodDb || []).slice(0, 6).forEach(function (f) {
      var b = mk('button', 'set'); b.type = 'button'; b.setAttribute('data-ean-sample', f.ean);
      var tx = mk('div', 'tx grow'); tx.appendChild(mk('b', '', T(f.name_key))); tx.appendChild(mk('small', '', f.ean + ' · ' + T(f.brand_key)));
      b.appendChild(tx); sample.appendChild(b);
    });
    box.appendChild(sample);
    box.appendChild(mk('p', 'cap', T('bardb.license')));
  }

  function f1(n) { return I.num(Math.round(n * 10) / 10, 1); }

  // ---------- 6 Essensfenster ----------
  function renderFenster() {
    var box = $('#fensterBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('fenster.sub')));
    var card = mk('div', 'card');
    var set = mk('div', 'set');
    set.appendChild(icon('timer'));
    var tx = mk('div', 'tx grow'); tx.appendChild(mk('b', '', T('profil.essensfenster')));
    tx.appendChild(mk('small', '', v1.windowOn ? T('fenster.on', { a: v1.windowFrom, b: v1.windowTo }) : T('fenster.off')));
    set.appendChild(tx);
    var sw = mk('button', 'sw'); sw.type = 'button'; sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', v1.windowOn ? 'true' : 'false'); sw.setAttribute('aria-label', T('profil.essensfenster'));
    sw.id = 'fensterSw'; set.appendChild(sw); card.appendChild(set); box.appendChild(card);
    if (v1.windowOn) {
      var times = mk('div', 'card stack');
      times.appendChild(mk('label', '', T('fenster.from')));
      var f = document.createElement('input'); f.type = 'time'; f.className = 'inp'; f.id = 'fensterFrom'; f.value = v1.windowFrom;
      times.appendChild(f);
      times.appendChild(mk('label', '', T('fenster.to')));
      var t = document.createElement('input'); t.type = 'time'; t.className = 'inp'; t.id = 'fensterTo'; t.value = v1.windowTo;
      times.appendChild(t);
      box.appendChild(times);
    }
    box.appendChild(mk('p', 'cap', T('fenster.note')));
    // sync profil switch
    var pew = document.querySelector('[data-sw="ew"]');
    if (pew) {
      pew.setAttribute('aria-checked', v1.windowOn ? 'true' : 'false');
      var ewTxt = $('#ewTxt'); if (ewTxt) ewTxt.textContent = v1.windowOn ? T('fenster.on', { a: v1.windowFrom, b: v1.windowTo }) : T('fenster.off');
    }
  }

  // ---------- 7 Sport / Aktivität ----------
  function activityKcal(act, min, intensity, weight) {
    var met = act.met * (intensity === 1 ? 0.85 : intensity === 3 ? 1.15 : 1);
    // kcal = MET * kg * hours
    return Math.round(met * (weight || 78) * (min / 60));
  }

  function renderAktivitaet() {
    var box = $('#aktivBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('aktiv.sub')));
    var pick = mk('div', 'card stack'); pick.appendChild(mk('b', '', T('aktiv.pick')));
    var filters = mk('div', 'filters');
    (D.activities || []).forEach(function (a) {
      var b = mk('button', 'fchip', T('aktiv.' + a.id));
      b.type = 'button'; b.setAttribute('data-akt', a.id); filters.appendChild(b);
    });
    pick.appendChild(filters); box.appendChild(pick);

    var form = mk('div', 'card stack'); form.id = 'aktivForm'; form.hidden = true;
    form.appendChild(mk('b', '', T('aktiv.details')));
    form.appendChild(mk('p', 'cap', T('aktiv.duration')));
    var dur = mk('div', 'step');
    var dm = mk('button', '', '–'); dm.type = 'button'; dm.setAttribute('data-akt-dur', '-10');
    var dout = mk('output', '', '30'); dout.id = 'aktDur';
    var dp = mk('button', '', '+'); dp.type = 'button'; dp.setAttribute('data-akt-dur', '10');
    dur.appendChild(dm); dur.appendChild(dout); dur.appendChild(dp); form.appendChild(dur);
    form.appendChild(mk('p', 'cap', T('aktiv.intensity')));
    var inten = mk('div', 'seg'); inten.setAttribute('role', 'group');
    [1, 2, 3].forEach(function (n) {
      var b = mk('button', n === 2 ? 'on' : '', T('aktiv.int.' + n));
      b.type = 'button'; b.setAttribute('data-akt-int', String(n)); b.setAttribute('aria-pressed', n === 2 ? 'true' : 'false');
      inten.appendChild(b);
    });
    form.appendChild(inten);
    var add = mk('button', 'btn', T('aktiv.add')); add.type = 'button'; add.id = 'aktAdd'; add.setAttribute('data-akt-add', '1'); form.appendChild(add);
    box.appendChild(form);

    var log = mk('div', 'stack'); log.appendChild(mk('p', 'grph', T('aktiv.log')));
    var total = 0;
    if (!v1.activities.length) log.appendChild(mk('p', 'cap', T('aktiv.empty')));
    v1.activities.forEach(function (a, i) {
      total += a.kcal;
      var c = mk('div', 'card row');
      var tx = mk('div', 'grow');
      tx.appendChild(mk('b', '', T('aktiv.' + a.id)));
      tx.appendChild(mk('p', 'cap', T('aktiv.entry', { min: fmt(a.min), k: fmt(a.kcal), int: T('aktiv.int.' + a.intensity) })));
      c.appendChild(tx);
      var del = mk('button', 'circbtn sm'); del.type = 'button'; del.setAttribute('data-akt-del', String(i)); del.setAttribute('aria-label', T('aktiv.del'));
      del.appendChild(icon('trash', 's')); c.appendChild(del); log.appendChild(c);
      if (a.id === 'strength') {
        var tip = mk('div', 'banner'); tip.appendChild(icon('alert')); tip.appendChild(mk('span', 'grow', T('aktiv.protein')));
        log.appendChild(tip);
      }
    });
    if (total) log.appendChild(mk('p', '', T('aktiv.total', { k: fmt(total) })));
    box.appendChild(log);
    box.appendChild(mk('p', 'cap', T('aktiv.note')));
    v1._akt = v1._akt || { id: null, min: 30, intensity: 2 };
  }

  // ---------- 8 QR Einkauf ----------
  function shopItemsForQr() {
    // Prefer live shop state from app if exposed; else sample
    var items = [];
    try {
      if (window.EdoApp && typeof window.EdoApp.shopSnapshot === 'function') items = window.EdoApp.shopSnapshot();
    } catch (e) { /* ignore */ }
    if (!items.length) {
      items = [
        { id: 'berries', name: T('ing.berries'), st: 'cart' },
        { id: 'yogurt', name: T('ing.yogurt'), st: 'open' },
        { id: 'olive_oil', name: T('ing.olive_oil'), st: 'home' }
      ];
    }
    return items;
  }

  function renderQrShop() {
    var box = $('#qrshopBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('qrshop.sub')));
    var items = shopItemsForQr();
    var frag = window.EdoQR.encodeImport(items);
    var abs = location.href.split('#')[0] + frag;
    var card = mk('div', 'card stack center');
    try {
      var drawn = window.EdoQR.svg(abs, { cell: 3, margin: 6, alt: T('qrshop.title'), title: T('qrshop.title') });
      var wrap = mk('div', 'qrbox');
      // Kein innerHTML: SVG nur über DOMParser, ausschliesslich <svg>-Wurzel übernehmen
      try {
        var doc = new DOMParser().parseFromString(drawn.svg, 'image/svg+xml');
        var svg = doc.documentElement;
        if (svg && svg.tagName && svg.tagName.toLowerCase() === 'svg' && !doc.querySelector('parsererror')) {
          wrap.appendChild(document.importNode(svg, true));
        } else { throw new Error('svg'); }
      } catch (err2) { wrap.appendChild(mk('p', 'cap', T('qrshop.err'))); }
      card.appendChild(wrap);
    } catch (e) {
      card.appendChild(mk('p', 'cap', T('qrshop.err')));
    }
    card.appendChild(mk('p', 'cap mono', frag.slice(0, 64) + '…'));
    var copy = mk('button', 'btn line', T('qrshop.copy')); copy.type = 'button'; copy.id = 'qrCopy'; copy.setAttribute('data-qr-frag', frag);
    card.appendChild(copy);
    box.appendChild(card);
    box.appendChild(mk('p', 'cap', T('qrshop.receive')));
    box.appendChild(mk('p', 'cap', T('qrshop.note')));
  }

  function handleQrImport() {
    var parsed = window.EdoQR.parseImport(location.hash);
    if (!parsed.ok) {
      if (/#\/einkauf#import=/.test(location.hash)) toast(T('qrshop.bad', { e: parsed.err }));
      return;
    }
    try { history.replaceState(null, '', '#/einkauf'); } catch (e) { location.hash = '#/einkauf'; }
    try {
      if (window.EdoApp && typeof window.EdoApp.offerShopImport === 'function') window.EdoApp.offerShopImport(parsed.items);
      else if (window.EdoApp && typeof window.EdoApp.applyShopImport === 'function') window.EdoApp.applyShopImport(parsed.items);
      else toast(T('qrshop.imported', { n: fmt(parsed.items.length) }));
    } catch (e) { toast(T('qrshop.bad', { e: 'apply' })); }
  }

  // ---------- 9 Reisemodus ----------
  function renderReise() {
    var box = $('#reiseBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('reise.sub')));
    var card = mk('div', 'card');
    var set = mk('div', 'set');
    set.appendChild(icon('globe'));
    var tx = mk('div', 'tx grow'); tx.appendChild(mk('b', '', T('reise.title')));
    tx.appendChild(mk('small', '', v1.travel ? T('reise.on') : T('reise.off')));
    set.appendChild(tx);
    var sw = mk('button', 'sw'); sw.type = 'button'; sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', v1.travel ? 'true' : 'false'); sw.id = 'reiseSw'; sw.setAttribute('aria-label', T('reise.title'));
    set.appendChild(sw); card.appendChild(set); box.appendChild(card);
    if (v1.travel) {
      var opts = mk('div', 'card stack');
      opts.appendChild(mk('b', '', T('reise.where')));
      var regs = mk('div', 'filters');
      (D.regions || []).forEach(function (r) {
        var b = mk('button', 'fchip' + (v1.travelRegion === r ? ' on' : ''), T('region.' + r));
        b.type = 'button'; b.setAttribute('data-travel-region', r); regs.appendChild(b);
      });
      opts.appendChild(regs);
      opts.appendChild(mk('p', '', T('reise.effects')));
      var ul = mk('ul', 'files');
      ['capture', 'restaurant', 'season', 'tz'].forEach(function (k) { ul.appendChild(mk('li', '', T('reise.fx.' + k))); });
      opts.appendChild(ul);
      var rest = mk('button', 'btn line', T('reise.open_restaurant')); rest.type = 'button'; rest.setAttribute('data-go', 'restaurant');
      opts.appendChild(rest);
      box.appendChild(opts);
    }
    box.appendChild(mk('p', 'cap', T('reise.note')));
  }

  // ---------- 10 Hausmarken ----------
  function renderMarken() {
    var box = $('#markenBox'); if (!box) return;
    box.textContent = '';
    box.appendChild(mk('p', 'sub', T('marken.sub')));
    (D.brands || []).forEach(function (b) {
      var c = mk('div', 'card stack');
      c.appendChild(mk('b', '', T('brand.' + b.id)));
      c.appendChild(mk('p', 'cap', T('marken.stores', { s: b.stores.map(function (x) { return T('region.' + x); }).join(', ') })));
      c.appendChild(mk('p', '', T('marken.lines', { l: b.lines.join(' · ') })));
      box.appendChild(c);
    });
    box.appendChild(mk('p', 'cap', T('marken.note')));
  }

  // ---------- Hub on heute / rezepte / profil ----------
  function renderHub() {
    $$('[data-v1-hub]').forEach(function (box) {
      box.textContent = '';
      var title = mk('p', 'grph', T('v1.hub'));
      box.appendChild(title);
      var card = mk('div', 'card');
      var links = [
        ['reste', 'spark'], ['saison', 'leaf'], ['eintipp', 'star'], ['portionen', 'hand'],
        ['bardb', 'barcode'], ['fenster', 'timer'], ['aktivitaet', 'dumb'], ['qrshop', 'qr'],
        ['reise', 'globe'], ['marken', 'cart']
      ];
      // hand icon may not exist — use leaf/scale fallbacks
      var iconMap = { hand: 'leaf', spark: 'spark', leaf: 'leaf', star: 'star', barcode: 'barcode', timer: 'timer', dumb: 'dumb', qr: 'qr', globe: 'globe', cart: 'cart' };
      links.forEach(function (L) {
        var b = mk('button', 'set'); b.type = 'button'; b.setAttribute('data-go', L[0]);
        var circ = mk('span', 'circ'); circ.appendChild(icon(iconMap[L[1]] || 'spark')); b.appendChild(circ);
        var tx = mk('div', 'tx grow'); tx.appendChild(mk('b', '', T(L[0] + '.title'))); tx.appendChild(mk('small', '', T(L[0] + '.teaser')));
        b.appendChild(tx); b.appendChild(icon('chev')); card.appendChild(b);
      });
      box.appendChild(card);
    });
  }

  function renderArztBald() {
    var box = $('#arztBald'); if (!box) return;
    box.textContent = '';
    var c = mk('div', 'card mint stack');
    c.appendChild(mk('b', '', T('arzt.bald.title')));
    c.appendChild(mk('p', '', T('arzt.bald.text')));
    c.appendChild(mk('p', 'cap', T('arzt.bald.backlog')));
    box.appendChild(c);
  }

  function renderAll() {
    renderHub(); renderReste(); renderSaison(); renderEintipp(); renderPortionen();
    renderBarcodeDb(); renderFenster(); renderAktivitaet(); renderQrShop(); renderReise();
    renderMarken(); renderArztBald();
  }

  // ---------- Events ----------
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('button, [data-go]') : null;
    if (!el) return;
    // mark handled V1 controls so later handlers can ignore if needed

    if (el.hasAttribute('data-reste-ing')) {
      var id = el.getAttribute('data-reste-ing');
      var i = v1.leftovers.findIndex(function (x) { return x.id === id; });
      if (i >= 0) v1.leftovers.splice(i, 1); else v1.leftovers.push({ id: id, amount: 1 });
      renderReste(); return;
    }
    if (el.hasAttribute('data-reste-amt')) {
      var p = el.getAttribute('data-reste-amt').split(':');
      var it = v1.leftovers.filter(function (x) { return x.id === p[0]; })[0];
      if (it) { it.amount = clamp(it.amount + parseInt(p[1], 10), 1, 8); renderReste(); }
      return;
    }
    if (el.hasAttribute('data-region')) { v1.region = el.getAttribute('data-region'); save(); renderSaison(); return; }
    if (el.hasAttribute('data-month')) { v1.month = parseInt(el.getAttribute('data-month'), 10); renderSaison(); return; }
    if (el.hasAttribute('data-eintipp')) {
      var tid = el.getAttribute('data-eintipp');
      if (tid === 'yesterday') {
        if (window.EdoApp && window.EdoApp.addMeal) window.EdoApp.addMeal({ name: T('food.' + v1.yesterday.id), kcal: v1.yesterday.kcal, p: v1.yesterday.p, tag: 'tag.meal' });
        else toast(T('eintipp.done'));
        go('heute'); return;
      }
      var tpl = (D.templates || []).filter(function (t) { return t.id === tid; })[0];
      if (tpl && window.EdoApp && window.EdoApp.addMeal) {
        window.EdoApp.addMeal({ name: T('food.' + tpl.food), kcal: tpl.kcal, p: tpl.p, tag: 'tag.meal' });
        go('heute');
      } else if (tpl) { toast(T('eintipp.done')); go('heute'); }
      return;
    }
    if (el.id === 'barSearch') {
      v1.barQuery = ($('#barEan') && $('#barEan').value || '').replace(/\D/g, '').slice(0, 13);
      v1.barHit = lookupEan(v1.barQuery); renderBarcodeDb(); return;
    }
    if (el.id === 'barScan') {
      // Optional BarcodeDetector
      if (window.BarcodeDetector) {
        toast(T('bardb.scan.sim'));
        v1.barQuery = '7610200012345'; v1.barHit = lookupEan(v1.barQuery); renderBarcodeDb();
      } else {
        toast(T('bardb.scan.unavailable'));
      }
      return;
    }
    if (el.hasAttribute('data-ean-sample')) {
      v1.barQuery = el.getAttribute('data-ean-sample'); v1.barHit = lookupEan(v1.barQuery); renderBarcodeDb(); return;
    }
    if (el.id === 'barAddDb' && v1.barHit) {
      if (window.EdoApp && window.EdoApp.addMeal) {
        window.EdoApp.addMeal({ name: T(v1.barHit.name_key), kcal: Math.round(v1.barHit.kcal * v1.barHit.g / 100), p: Math.round(v1.barHit.p * v1.barHit.g / 100 * 10) / 10, tag: 'tag.barcode' });
        go('heute');
      } else toast(T('bardb.added'));
      return;
    }
    if (el.id === 'fensterSw') {
      v1.windowOn = !v1.windowOn; save(); renderFenster(); toast(v1.windowOn ? T('fenster.toast.on') : T('fenster.toast.off')); return;
    }
    if (el.hasAttribute('data-akt')) {
      v1._akt = v1._akt || { min: 30, intensity: 2 };
      v1._akt.id = el.getAttribute('data-akt');
      var form = $('#aktivForm'); if (form) { form.hidden = false; try { form.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (err) { /* ignore */ } }
      $$('[data-akt]').forEach(function (b) { var on = b.getAttribute('data-akt') === v1._akt.id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      return;
    }
    if (el.hasAttribute('data-akt-dur')) {
      v1._akt.min = clamp((v1._akt.min || 30) + parseInt(el.getAttribute('data-akt-dur'), 10), 10, 180);
      var o = $('#aktDur'); if (o) o.textContent = String(v1._akt.min);
      return;
    }
    if (el.hasAttribute('data-akt-int')) {
      v1._akt.intensity = parseInt(el.getAttribute('data-akt-int'), 10);
      $$('[data-akt-int]').forEach(function (b) { var on = b.getAttribute('data-akt-int') === String(v1._akt.intensity); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      return;
    }
    if ((el.id === 'aktAdd' || el.getAttribute('data-akt-add') === '1') && v1._akt && v1._akt.id) {
      var act = (D.activities || []).filter(function (a) { return a.id === v1._akt.id; })[0];
      if (!act) return;
      var w = (window.EdoApp && window.EdoApp.weight) ? window.EdoApp.weight() : 78.4;
      var kcal = activityKcal(act, v1._akt.min, v1._akt.intensity, w);
      v1.activities.push({ id: act.id, min: v1._akt.min, intensity: v1._akt.intensity, kcal: kcal });
      if (window.EdoApp && window.EdoApp.addActivityKcal) window.EdoApp.addActivityKcal(kcal);
      renderAktivitaet(); toast(T('aktiv.toast', { k: fmt(kcal) })); return;
    }
    if (el.hasAttribute('data-akt-del')) {
      v1.activities.splice(parseInt(el.getAttribute('data-akt-del'), 10), 1); renderAktivitaet(); return;
    }
    if (el.id === 'qrCopy') {
      var frag = el.getAttribute('data-qr-frag') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href.split('#')[0] + frag).then(function () { toast(T('qrshop.copied')); }).catch(function () { toast(T('qrshop.copyfail')); });
      } else toast(T('qrshop.copyfail'));
      return;
    }
    if (el.id === 'reiseSw') { v1.travel = !v1.travel; save(); renderReise(); toast(v1.travel ? T('reise.toast.on') : T('reise.toast.off')); return; }
    if (el.hasAttribute('data-travel-region')) {
      v1.travelRegion = el.getAttribute('data-travel-region');
      v1.region = v1.travelRegion; save(); renderReise(); renderSaison(); return;
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.id === 'fensterFrom') { v1.windowFrom = t.value || '10:00'; save(); renderFenster(); }
    if (t && t.id === 'fensterTo') { v1.windowTo = t.value || '18:00'; save(); renderFenster(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'barEan') v1.barQuery = String(e.target.value || '').replace(/\D/g, '').slice(0, 13);
  });

  document.addEventListener('edovita-lang', renderAll);
  window.addEventListener('hashchange', function () {
    if (/#\/einkauf#import=/.test(location.hash)) handleQrImport();
    var id = (location.hash || '').replace(/^#\/?/, '').split('?')[0].split('&')[0];
    if (id.indexOf('import=') === 0) id = 'einkauf';
    var map = { reste: renderReste, saison: renderSaison, eintipp: renderEintipp, portionen: renderPortionen, bardb: renderBarcodeDb, fenster: renderFenster, aktivitaet: renderAktivitaet, qrshop: renderQrShop, reise: renderReise, marken: renderMarken, arzt: renderArztBald, heute: renderHub, rezepte: renderHub, profil: renderHub };
    if (map[id]) map[id]();
  });

  // Sync profil EW switch default OFF
  function syncEwDefault() {
    var pew = document.querySelector('[data-sw="ew"]');
    if (pew && !pew.hasAttribute('data-v1-synced')) {
      pew.setAttribute('aria-checked', v1.windowOn ? 'true' : 'false');
      pew.setAttribute('data-v1-synced', '1');
      var ewTxt = $('#ewTxt'); if (ewTxt) ewTxt.textContent = v1.windowOn ? T('fenster.on', { a: v1.windowFrom, b: v1.windowTo }) : T('fenster.off');
    }
  }

  // Hook profil EW toggles into v1 state
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-sw="ew"]') : null;
    if (!el) return;
    // runs after app.js toggles aria-checked
    setTimeout(function () {
      v1.windowOn = el.getAttribute('aria-checked') === 'true';
      save();
      var ewTxt = $('#ewTxt'); if (ewTxt) ewTxt.textContent = v1.windowOn ? T('fenster.on', { a: v1.windowFrom, b: v1.windowTo }) : T('fenster.off');
    }, 0);
  }, true);

  window.EdoV1 = {
    state: v1,
    render: renderAll,
    activityBurn: function () { return v1.activities.reduce(function (s, a) { return s + a.kcal; }, 0); },
    isTravel: function () { return !!v1.travel; },
    region: function () { return v1.travel ? v1.travelRegion : v1.region; }
  };


  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-akt-add], #aktAdd');
    if (!el) return;
    if (!v1._akt || !v1._akt.id) { toast(T('aktiv.pick')); return; }
    var act = (D.activities || []).filter(function (a) { return a.id === v1._akt.id; })[0];
    if (!act) return;
    var w = (window.EdoApp && window.EdoApp.weight) ? window.EdoApp.weight() : 78.4;
    var kcal = activityKcal(act, v1._akt.min || 30, v1._akt.intensity || 2, w);
    v1.activities.push({ id: act.id, min: v1._akt.min || 30, intensity: v1._akt.intensity || 2, kcal: kcal });
    if (window.EdoApp && window.EdoApp.addActivityKcal) window.EdoApp.addActivityKcal(kcal);
    renderAktivitaet(); toast(T('aktiv.toast', { k: fmt(kcal) }));
    e.preventDefault(); e.stopPropagation();
  }, true);

  function boot() {
    syncEwDefault();
    renderAll();
    if (/#\/einkauf#import=/.test(location.hash)) handleQrImport();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();
