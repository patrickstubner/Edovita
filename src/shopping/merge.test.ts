import { describe, expect, it } from '@rstest/core';
import { getRecipe } from '../catalog/index.ts';
import {
  asFoodId,
  asRecipeId,
  parseShopImport,
  type ShoppingItem,
} from '../domain/index.ts';
import {
  addCatalogItem,
  addRecipe,
  applyHave,
  applyShopImport,
  buildQrMatrix,
  buildSourceSummary,
  capHaveToNeed,
  clearDone,
  defaultCatalogAmountForGroup,
  effectiveShopState,
  encodeShoppingListFragment,
  formatShareText,
  groupItems,
  haveStepOf,
  isHaveAll,
  isPartialHave,
  removeRecipe,
  resetHave,
  setState,
  shopBuyQty,
  snapHaveQty,
} from './index.ts';

describe('shopping/merge & share (E5, Issue #11)', () => {
  it('zählt gleiche Zutat + Einheit aus zwei Rezepten zusammen, erhält Zustand home und zieht bei removeRecipe exakt ab (J2)', () => {
    const salmon = getRecipe('oven_salmon')!;
    const lentil = getRecipe('lentil_curry')!;

    // 1) Ofenlachs (2 Portionen): Knoblauch 2 pc, Salz 4 g, Kartoffeln 500 g
    let list = addRecipe([], salmon, 2, '2026-11-24T10:00:00.000Z');
    const garlic1 = list.find((i) => i.food === asFoodId('garlic'))!;
    const salt1 = list.find((i) => i.food === asFoodId('salt'))!;
    expect(garlic1.amount).toBe(2);
    expect(garlic1.unit).toBe('pc');
    expect(salt1.amount).toBe(4);
    expect(salt1.unit).toBe('g');

    // Zustand `home` auf Salz setzen -> muss beim Zusammenführen erhalten bleiben (ADR-002)
    list = setState(list, salt1.id, 'home');

    // 2) Linsencurry (2 Portionen): Knoblauch 2 pc, Salz 3 g, Rote Linsen 150 g
    list = addRecipe(list, lentil, 2, '2026-11-24T10:01:00.000Z');
    const garlicMerged = list.find((i) => i.food === asFoodId('garlic'))!;
    const saltMerged = list.find((i) => i.food === asFoodId('salt'))!;
    expect(garlicMerged.amount).toBe(4);
    expect(garlicMerged.fromRecipes).toEqual([salmon.id, lentil.id]);
    expect(saltMerged.amount).toBe(7);
    expect(saltMerged.state).toBe('home');
    expect(list.some((i) => i.food === asFoodId('red_lentils'))).toBe(true);

    // 3) Linsencurry entfernen -> zieht exakt 2 pc Knoblauch & 3 g Salz ab und entfernt Rote Linsen
    const afterRemove = removeRecipe(list, lentil.id);
    expect(afterRemove.some((i) => i.food === asFoodId('red_lentils'))).toBe(
      false,
    );
    const garlicAfter = afterRemove.find((i) => i.food === asFoodId('garlic'))!;
    const saltAfter = afterRemove.find((i) => i.food === asFoodId('salt'))!;
    expect(garlicAfter.amount).toBe(2);
    expect(garlicAfter.fromRecipes).toEqual([salmon.id]);
    expect(saltAfter.amount).toBe(4);
    expect(saltAfter.state).toBe('home');
    expect(saltAfter.fromRecipes).toEqual([salmon.id]);
  });

  it('hält gleiche Zutat mit unterschiedlicher Einheit getrennt und unterstützt Katalog-Hinzufügen & clearDone', () => {
    const start: ShoppingItem[] = [
      {
        id: 'broccoli__g',
        food: asFoodId('broccoli'),
        amount: 400,
        unit: 'g',
        state: 'open',
        fromRecipes: [asRecipeId('oven_salmon')],
        addedAt: '2026-11-24T10:00:00.000Z',
      },
    ];

    // Gleiche Zutat mit anderer Einheit (`pc`) bleibt eigene Zeile
    const withPieces = addCatalogItem(start, asFoodId('broccoli'), {
      amount: 1,
      unit: 'pc',
      nowIso: '2026-11-24T10:02:00.000Z',
    });
    expect(withPieces).toHaveLength(2);

    const inCart = setState(withPieces, 'broccoli__g', 'cart');
    const atHome = setState(inCart, 'broccoli__pc', 'home');
    const grouped = groupItems(atHome);
    expect(grouped.counts).toEqual({ total: 2, open: 0, cart: 1, home: 1 });

    // clearDone entfernt nur `cart`, nicht `home`
    const cleared = clearDone(atHome);
    expect(cleared).toHaveLength(1);
    expect(cleared[0]?.state).toBe('home');
  });

  it('applyShopImport unterstützt Ersetzen & Ergänzen und erhält home-Zustand beim Ergänzen', () => {
    const existing: ShoppingItem[] = [
      {
        id: 'broccoli__g',
        food: asFoodId('broccoli'),
        amount: 200,
        unit: 'g',
        state: 'home',
        fromRecipes: [],
        addedAt: '2026-11-24T10:00:00.000Z',
      },
    ];

    const imported = [
      { id: 'broccoli', name: 'Broccoli', st: 'open' as const, amount: 300, unit: 'g' as const },
      { id: 'oats', name: 'Haferflocken', st: 'cart' as const },
      { id: 'custom_1', name: 'Hausbrot', st: 'open' as const },
    ];

    const merged = applyShopImport(existing, imported, 'merge');
    expect(merged).toHaveLength(3);
    const broc = merged.find((i) => i.food === asFoodId('broccoli'))!;
    expect(broc.amount).toBe(500);
    expect(broc.state).toBe('home');
    const custom = merged.find((i) => i.customLabel === 'Hausbrot')!;
    expect(custom).toBeDefined();

    const replaced = applyShopImport(existing, imported, 'replace');
    expect(replaced).toHaveLength(3);
    expect(replaced.find((i) => i.food === asFoodId('broccoli'))?.state).toBe(
      'open',
    );
  });

  it('erzeugt reinen Teilen-Text (ohne G-Daten) sowie ein lokales QR-SVG-Fragment mit Round-Trip', () => {
    const salmon = getRecipe('oven_salmon')!;
    let list = addRecipe([], salmon, 2, '2026-11-24T10:00:00.000Z');
    list = setState(list, list[0]!.id, 'cart');
    list = setState(list, list[1]!.id, 'home');

    const grouped = groupItems(list);
    const shareText = formatShareText(grouped, {
      title: 'Einkaufsliste',
      groupLabel: (g) => g,
      cartHeading: 'Im Korb',
      homeHeading: 'Schon zu Hause',
      itemName: (i) => i.food,
      itemAmount: (i) => (i.amount && i.unit ? `${i.amount} ${i.unit}` : ''),
      stateLabels: { open: 'Offen', cart: 'Im Korb', home: 'Zu Hause' },
    });

    expect(shareText).toContain('Einkaufsliste');
    expect(shareText).toContain('[Im Korb]');
    expect(shareText).toContain('[Zu Hause]');
    expect(shareText).toContain('[Offen]');
    expect(shareText).not.toMatch(/BMI|kcal|Gewicht|Geburtsdatum/i);

    const fragment = encodeShoppingListFragment(list, (i) => i.food);
    const decoded = parseShopImport(fragment);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value).toHaveLength(list.length);
      expect(decoded.value[0]?.st).toBe('cart');
      expect(decoded.value[1]?.st).toBe('home');
    }

    const matrix = buildQrMatrix(`https://example.invalid/${fragment}`);
    expect(matrix.modules).toBeGreaterThanOrEqual(21);
    expect(matrix.size).toBe(matrix.modules + 4);
    expect(matrix.path.startsWith('M')).toBe(true);
    expect(matrix.path).not.toContain('<');
  });
});

describe('shopping/have v5.9: Teilmenge, Rasterung, Deckelung, Herkunfts-Summe & Share/QR (Issue #31)', () => {
  it('berechnet Schrittweiten (haveStepOf) und Rasterung (snapHaveQty) exakt pro Einheit wie Prototyp v5.9', () => {
    // g / ml Stufen
    expect(haveStepOf(600, 'g')).toBe(50);
    expect(haveStepOf(500, 'ml')).toBe(50);
    expect(haveStepOf(250, 'g')).toBe(25);
    expect(haveStepOf(100, 'g')).toBe(10);
    expect(haveStepOf(30, 'ml')).toBe(5);
    expect(haveStepOf(12, 'g')).toBe(1);

    // Stück / Flasche / Löffel / Prise
    expect(haveStepOf(6, 'pc')).toBe(1);
    expect(haveStepOf(4, 'pc')).toBe(1);
    expect(haveStepOf(2.5, 'pc')).toBe(0.5);
    expect(haveStepOf(1.5, 'bottle')).toBe(0.5);
    expect(haveStepOf(2, 'tbsp')).toBe(0.5);
    expect(haveStepOf(3, 'tsp')).toBe(0.5);
    expect(haveStepOf(2, 'pinch')).toBe(1);

    // snapHaveQty Begrenzung & Rundung
    expect(snapHaveQty(-10, 100, 'g')).toBe(0);
    expect(snapHaveQty(Number.NaN, 100, 'g')).toBe(0);
    expect(snapHaveQty(0, 100, 'g')).toBe(0);
    expect(snapHaveQty(120, 100, 'g')).toBe(100);
    expect(snapHaveQty(46, 100, 'g')).toBe(50);
    expect(snapHaveQty(1.3, 3, 'tbsp')).toBe(1.5);
    expect(snapHaveQty(3.6, 5, 'g')).toBe(4);
    expect(snapHaveQty(10, 0, 'g')).toBe(0);
  });

  it('behandelt Teilmengen (isPartialHave, isHaveAll, shopBuyQty, applyHave, resetHave) und deckelt qtyHave auf Bedarf', () => {
    const base: ShoppingItem = {
      id: 'oats__g',
      food: asFoodId('oats'),
      amount: 100,
      unit: 'g',
      state: 'open',
      fromRecipes: [asRecipeId('berry_porridge')],
      addedAt: '2026-11-24T10:00:00.000Z',
    };

    // Anfangszustand: keine Teilmenge, nicht alles da
    expect(isPartialHave(base)).toBe(false);
    expect(isHaveAll(base)).toBe(false);
    expect(shopBuyQty(base)).toBe(100);
    expect(effectiveShopState(base)).toBe('open');

    // Teilmenge 50 g von 100 g -> bleibt `open`, Kaufmenge 50 g
    const partialList = applyHave([base], base.id, { all: false, qtyHave: 50 });
    const partial = partialList[0]!;
    expect(partial.qtyHave).toBe(50);
    expect(partial.state).toBe('open');
    expect(isPartialHave(partial)).toBe(true);
    expect(isHaveAll(partial)).toBe(false);
    expect(shopBuyQty(partial)).toBe(50);
    expect(effectiveShopState(partial)).toBe('open');

    // «Alles vorhanden» -> qtyHave === need, state === 'home'
    const fullList = applyHave(partialList, base.id, { all: true });
    const full = fullList[0]!;
    expect(full.qtyHave).toBe(100);
    expect(full.state).toBe('home');
    expect(isPartialHave(full)).toBe(false);
    expect(isHaveAll(full)).toBe(true);
    expect(shopBuyQty(full)).toBe(0);
    expect(effectiveShopState(full)).toBe('home');

    // Aus `home` zurück auf Teilmenge 40 g -> wird wieder `open`
    const backPartial = applyHave(fullList, base.id, { all: false, qtyHave: 40 })[0]!;
    expect(backPartial.state).toBe('open');
    expect(backPartial.qtyHave).toBe(40);
    expect(shopBuyQty(backPartial)).toBe(60);

    // Zurücksetzen -> qtyHave = 0, state = 'open'
    const reset = resetHave(fullList, base.id)[0]!;
    expect(reset.qtyHave).toBe(0);
    expect(reset.state).toBe('open');
    expect(isPartialHave(reset)).toBe(false);
    expect(isHaveAll(reset)).toBe(false);

    // Deckelung bei übergrossem qtyHave (capHaveToNeed)
    const overCapped = capHaveToNeed({ ...base, qtyHave: 250 });
    expect(overCapped.qtyHave).toBe(100);
    expect(isHaveAll(overCapped)).toBe(true);
  });

  it('deckelt qtyHave automatisch, wenn removeRecipe den Bedarf senkt, und bildet Herkunfts-Summe korrekt', () => {
    const salmon = getRecipe('oven_salmon')!;
    const lentil = getRecipe('lentil_curry')!;

    let list = addRecipe([], salmon, 2, '2026-11-24T10:00:00.000Z');
    list = addRecipe(list, lentil, 2, '2026-11-24T10:01:00.000Z');

    // Knoblauch: Ofenlachs 2 pc + Linsencurry 2 pc = 4 pc
    const garlic = list.find((i) => i.food === asFoodId('garlic'))!;
    const summary = buildSourceSummary(garlic);
    expect(summary.lines).toHaveLength(2);
    expect(summary.lines[0]).toEqual({ recipeId: salmon.id, amount: 2, unit: 'pc' });
    expect(summary.lines[1]).toEqual({ recipeId: lentil.id, amount: 2, unit: 'pc' });
    expect(summary.sumAmount).toBe(4);
    expect(summary.unit).toBe('pc');

    // Teilmenge 3 Stk. von 4 Stk. vorhanden -> danach Linsencurry entfernen -> Bedarf sinkt auf 2 Stk. -> qtyHave gedeckelt auf 2 Stk. -> `home`
    list = applyHave(list, garlic.id, { all: false, qtyHave: 3 });
    expect(isPartialHave(list.find((i) => i.id === garlic.id)!)).toBe(true);

    const afterRemove = removeRecipe(list, lentil.id);
    const garlicAfter = afterRemove.find((i) => i.id === garlic.id)!;
    expect(garlicAfter.amount).toBe(2);
    expect(garlicAfter.qtyHave).toBe(2);
    expect(garlicAfter.state).toBe('home');
    expect(isHaveAll(garlicAfter)).toBe(true);
  });

  it('überträgt qtyHave niemals in Share-Text oder QR-Payload (Teilmenge wird als open geteilt)', () => {
    const item: ShoppingItem = {
      id: 'oats__g',
      food: asFoodId('oats'),
      amount: 100,
      unit: 'g',
      qtyHave: 50,
      state: 'open',
      fromRecipes: [asRecipeId('berry_porridge')],
      addedAt: '2026-11-24T10:00:00.000Z',
    };
    const grouped = groupItems([item]);
    const text = formatShareText(grouped, {
      title: 'Einkaufsliste',
      groupLabel: (g) => g,
      cartHeading: 'Im Korb',
      homeHeading: 'Schon zu Hause',
      itemName: () => 'Haferflocken',
      itemAmount: (i) => (i.amount && i.unit ? `${i.amount} ${i.unit}` : ''),
      stateLabels: { open: 'Offen', cart: 'Im Korb', home: 'Zu Hause' },
    });
    expect(text).toContain('[Offen] Haferflocken (100 g)');
    expect(text).not.toContain('qtyHave');
    expect(text).not.toContain('50 g');

    const fragment = encodeShoppingListFragment([item], () => 'Haferflocken');
    expect(fragment).not.toContain('qtyHave');
    const decoded = parseShopImport(fragment);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value).toHaveLength(1);
      expect(decoded.value[0]?.st).toBe('open');
      expect('qtyHave' in (decoded.value[0] as object)).toBe(false);
    }

    // Standardmengen für Katalog-Artikel je Gruppe
    expect(defaultCatalogAmountForGroup('drinks')).toEqual({ amount: 500, unit: 'ml' });
    expect(defaultCatalogAmountForGroup('fruit')).toEqual({ amount: 2, unit: 'pc' });
    expect(defaultCatalogAmountForGroup('spice')).toEqual({ amount: 10, unit: 'g' });
    expect(defaultCatalogAmountForGroup('pantry')).toEqual({ amount: 200, unit: 'g' });
  });
});
