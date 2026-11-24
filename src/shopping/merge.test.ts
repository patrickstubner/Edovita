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
  applyShopImport,
  buildQrMatrix,
  clearDone,
  encodeShoppingListFragment,
  formatShareText,
  groupItems,
  removeRecipe,
  setState,
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
