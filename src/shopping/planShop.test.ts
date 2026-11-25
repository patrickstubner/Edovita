import { describe, expect, it } from '@rstest/core';
import { getFood, getRecipe, listFoods, listRecipes } from '../catalog/index.ts';
import {
  EMPTY_PLAN,
  PLAN_EXPORT_KIND,
  addDaysIso,
  asFoodId,
  asRecipeId,
  buildPlanExportBundle,
  computeEffectiveNeed,
  parsePlanExportBundle,
  shoppingItemsToTransferExport,
  transferBundleToShoppingItems,
  type MealPlan,
  type ShoppingItem,
} from '../domain/index.ts';
import { buildSourceSummary, shopNeedOf } from './have.ts';
import {
  addIngredientBundle,
  addRecipeToListAndMaybePlan,
  findNextFreeSlot,
  ingsForPlanEntry,
  planWhenLabel,
  refreshPlanQuantities,
  resolveQrImportItems,
  restoreShopAndPlan,
  slotTargetsFor,
  snapshotShopAndPlan,
} from './planShop.ts';

const FIXED_NOW = new Date(2026, 10, 25, 12, 0, 0); // Mi 25.11.2026
const TODAY = '2026-11-25';
const TOMORROW = addDaysIso(TODAY, 1);
const DAY_3 = addDaysIso(TODAY, 2);
const DAY_4 = addDaysIso(TODAY, 3);
const KNOWN_RECIPES = new Set<string>(listRecipes().map((r) => r.id));
const KNOWN_FOODS = new Set<string>(listFoods().map((f) => f.id));

describe('Paket E11: Plan -> Einkaufsliste, automatische Einplanung & Rückgängig (Issue #36)', () => {
  it('merged & skaliert Zutaten aus 2 Plan-Rezepten, erhält Extra/Custom-Artikel und entfernt weggefallene Plan-Artikel', () => {
    const plan: MealPlan = {
      days: 5,
      items: [
        {
          id: 'p1',
          date: TODAY,
          slot: 'dinner',
          recipeId: asRecipeId('oven_salmon'),
          portions: 4, // 2× Basis (servings=2) -> olive_oil 20 ml, potato 1000 g
        },
        {
          id: 'p2',
          date: TOMORROW,
          slot: 'lunch',
          recipeId: asRecipeId('lentil_curry'),
          portions: 2, // 1× Basis (servings=2) -> olive_oil 10 ml, red_lentils 160 g
        },
      ],
    };

    const existing: ShoppingItem[] = [
      {
        id: 'apple__piece',
        food: asFoodId('apple'),
        amount: 3,
        unit: 'pc',
        qtyPlan: 0,
        qtyExtra: 3,
        qtyHave: 0,
        state: 'open',
        fromRecipes: [],
        recipesPlan: [],
        recipesExtra: [],
        addedAt: '2026-11-25T10:00:00.000Z',
      },
      {
        id: 'qr_custom_1',
        food: asFoodId('custom_soap'),
        customLabel: 'Spülmittel',
        state: 'open',
        fromRecipes: [],
        recipesPlan: [],
        recipesExtra: [],
        addedAt: '2026-11-25T10:00:00.000Z',
      },
    ];

    const refreshed = refreshPlanQuantities(existing, plan, { now: FIXED_NOW });

    // Gemeinsame Zutat Knoblauch aus Ofen-Lachs (4 Port. = 4 Stk.) + Dal (2 Port. = 2 Stk.) = 6 Stk.
    const garlic = refreshed.find((it) => it.food === 'garlic' && it.unit === 'pc');
    expect(garlic?.qtyPlan).toBe(6);
    expect(garlic?.amount).toBe(6);
    expect(garlic?.recipesPlan).toEqual([
      asRecipeId('oven_salmon'),
      asRecipeId('lentil_curry'),
    ]);

    const salt = refreshed.find((it) => it.food === 'salt' && it.unit === 'g');
    expect(salt?.qtyPlan).toBe(11);

    const potato = refreshed.find((it) => it.food === 'potato' && it.unit === 'g');
    expect(potato?.qtyPlan).toBe(1000);

    // Extra-Katalog-Artikel & Custom-Artikel bleiben erhalten
    expect(refreshed.some((it) => it.id === 'apple__piece')).toBe(true);
    expect(refreshed.some((it) => it.customLabel === 'Spülmittel')).toBe(true);

    // Entfernen von Ofen-Lachs aus dem Plan -> Kartoffeln verschwinden, Knoblauch fällt auf 2 Stk.
    const reducedPlan: MealPlan = {
      days: 5,
      items: [plan.items[1]!],
    };
    const afterRemove = refreshPlanQuantities(refreshed, reducedPlan, {
      now: FIXED_NOW,
    });
    expect(afterRemove.some((it) => it.food === 'potato')).toBe(false);
    expect(
      afterRemove.find((it) => it.food === 'garlic')?.amount,
    ).toBe(2);
    expect(afterRemove.some((it) => it.id === 'apple__piece')).toBe(true);
    expect(afterRemove.some((it) => it.customLabel === 'Spülmittel')).toBe(true);
  });

  it('Regel «einmal zählen»: Rezept im Plan und zusätzlich als Extra zählt nicht doppelt', () => {
    const salmon = getRecipe('oven_salmon')!;
    const entries = ingsForPlanEntry({
      recipeId: salmon.id,
      portions: 2,
    });

    // Erst als Extra hinzugefügt (500 g Kartoffeln)
    let items = addIngredientBundle([], entries, 'extra');
    // Danach auch im Plan (500 g Kartoffeln für dasselbe Rezept)
    items = addIngredientBundle(items, entries, 'plan');

    const potato = items.find((it) => it.food === 'potato')!;
    expect(potato.qtyPlan).toBe(500);
    expect(potato.qtyExtra).toBe(500);
    expect(computeEffectiveNeed(potato)).toBe(500);
    expect(shopNeedOf(potato)).toBe(500);
    expect(potato.amount).toBe(500);

    // Ein anderes Rezept als Extra zählt dagegen normal dazu (Olivenöl aus lentil_curry: +10 ml)
    const lentilEntries = ingsForPlanEntry({
      recipeId: asRecipeId('lentil_curry'),
      portions: 2,
    });
    const combined = addIngredientBundle(items, lentilEntries, 'extra');
    const oil = combined.find((it) => it.food === 'olive_oil')!;
    // oven_salmon ist in plan & extra (Überschneidung -> zählt einmal: nur qtyPlan = 10 ml);
    // wenn lentil_curry auch in recipesExtra ist, enthält recipesExtra noch oven_salmon -> overlap true!
    // Für disjunkte Rezepte (plan: oven_salmon, extra: nur lentil_curry) wird summiert:
    const disjointOil: ShoppingItem = {
      id: 'olive_oil__ml',
      food: asFoodId('olive_oil'),
      amount: 0,
      unit: 'ml',
      qtyPlan: 10,
      qtyExtra: 15,
      recipesPlan: [asRecipeId('oven_salmon')],
      recipesExtra: [asRecipeId('lentil_curry')],
      fromRecipes: [asRecipeId('oven_salmon'), asRecipeId('lentil_curry')],
      state: 'open',
      addedAt: '2026-11-25T10:00:00.000Z',
    };
    expect(computeEffectiveNeed(disjointOil)).toBe(25);
    expect(oil.recipesPlan).toContain(asRecipeId('oven_salmon'));
  });

  it('findNextFreeSlot beachtet Mahlzeit-Art (Frühstück, Snack, Mittag/Abend) und Zeitraum-Grenze', () => {
    const bircher = getRecipe('birchermuesli')!; // breakfast
    const salmon = getRecipe('oven_salmon')!; // dinner -> ['lunch', 'dinner']

    expect(slotTargetsFor(bircher)).toEqual(['breakfast']);
    expect(slotTargetsFor(salmon)).toEqual(['lunch', 'dinner']);
    expect(slotTargetsFor({ meal: 'snack' })).toEqual(['snack']);

    // Leerer 3-Tage-Plan: Abendessen-Rezept landet zuerst im freien Mittagessen heute
    const empty3: MealPlan = { days: 3, items: [] };
    expect(findNextFreeSlot(empty3, salmon, FIXED_NOW)).toEqual({
      date: TODAY,
      slot: 'lunch',
    });
    expect(findNextFreeSlot(empty3, bircher, FIXED_NOW)).toEqual({
      date: TODAY,
      slot: 'breakfast',
    });

    // Mittag heute belegt -> Abend heute
    const lunchTaken: MealPlan = {
      days: 3,
      items: [
        {
          id: 'p1',
          date: TODAY,
          slot: 'lunch',
          recipeId: asRecipeId('pho'),
          portions: 2,
        },
      ],
    };
    expect(findNextFreeSlot(lunchTaken, salmon, FIXED_NOW)).toEqual({
      date: TODAY,
      slot: 'dinner',
    });

    // Alle 3 Frühstück-Slots belegt -> null (Tag 4 liegt ausserhalb des 3-Tage-Fensters)
    const fullBreakfast: MealPlan = {
      days: 3,
      items: [
        { id: 'b1', date: TODAY, slot: 'breakfast', recipeId: bircher.id, portions: 1 },
        { id: 'b2', date: TOMORROW, slot: 'breakfast', recipeId: bircher.id, portions: 1 },
        { id: 'b3', date: DAY_3, slot: 'breakfast', recipeId: bircher.id, portions: 1 },
      ],
    };
    expect(findNextFreeSlot(fullBreakfast, bircher, FIXED_NOW)).toBeNull();

    // Mit 4 Tagen wird Tag 4 frei
    const expanded4: MealPlan = { ...fullBreakfast, days: 4 };
    expect(findNextFreeSlot(expanded4, bircher, FIXED_NOW)).toEqual({
      date: DAY_4,
      slot: 'breakfast',
    });
  });

  it('addRecipeToListAndMaybePlan: Fälle A (bereits im Plan), B (eingeplant + Rückgängig) und C (kein Slot frei)', () => {
    const salmon = getRecipe('oven_salmon')!;
    const bircher = getRecipe('birchermuesli')!;

    // Fall B: leere Ausgangslage -> plant in Mi Mittag & fügt Plan-Zutaten hinzu (mit Rückgängig)
    const caseB = addRecipeToListAndMaybePlan(EMPTY_PLAN, [], salmon, {
      now: FIXED_NOW,
      knownRecipeIds: KNOWN_RECIPES,
    });
    expect(caseB.outcome).toBe('planned');
    expect(caseB.canUndo).toBe(true);
    expect(caseB.plannedItem?.date).toBe(TODAY);
    expect(caseB.plannedItem?.slot).toBe('lunch');
    expect(caseB.plan.items).toHaveLength(1);
    expect(caseB.items.length).toBeGreaterThan(0);

    // Snapshot & Restore stellen den leeren Ursprungszustand vollständig wieder her
    const snap = snapshotShopAndPlan(EMPTY_PLAN, []);
    const restored = restoreShopAndPlan(caseB.snapshot);
    expect(restored).toEqual(snap);

    // Fall A: Rezept ist bereits im Plan -> kein doppelter Eintrag, kein Rückgängig
    const caseA = addRecipeToListAndMaybePlan(caseB.plan, caseB.items, salmon, {
      now: FIXED_NOW,
      knownRecipeIds: KNOWN_RECIPES,
    });
    expect(caseA.outcome).toBe('already');
    expect(caseA.canUndo).toBe(false);
    expect(caseA.plan.items).toHaveLength(1);

    // Fall A bei fehlenden Listeneinträgen (z. B. Rezept im Plan, Liste geleert) -> ergänzt Plan-Zutaten
    const caseAMissing = addRecipeToListAndMaybePlan(caseB.plan, [], salmon, {
      now: FIXED_NOW,
      knownRecipeIds: KNOWN_RECIPES,
    });
    expect(caseAMissing.outcome).toBe('already');
    expect(caseAMissing.items.length).toBe(caseB.items.length);

    // Fall C: alle passenden Frühstücks-Slots im 3-Tage-Plan durch anderes Rezept belegt
    const fullBreakfastOther: MealPlan = {
      days: 3,
      items: [
        { id: 'b1', date: TODAY, slot: 'breakfast', recipeId: asRecipeId('pho'), portions: 1 },
        { id: 'b2', date: TOMORROW, slot: 'breakfast', recipeId: asRecipeId('pho'), portions: 1 },
        { id: 'b3', date: DAY_3, slot: 'breakfast', recipeId: asRecipeId('pho'), portions: 1 },
      ],
    };
    const caseC = addRecipeToListAndMaybePlan(fullBreakfastOther, [], bircher, {
      now: FIXED_NOW,
      knownRecipeIds: KNOWN_RECIPES,
    });
    expect(caseC.outcome).toBe('noslot');
    expect(caseC.canUndo).toBe(true);
    expect(caseC.plan.items).toHaveLength(3);
    expect(caseC.items.every((it) => (it.qtyExtra ?? 0) > 0)).toBe(true);
    expect(caseC.items.every((it) => (it.qtyPlan ?? 0) === 0)).toBe(true);
  });

  it('deckelt qtyHave beim Verkleinern oder Verkürzen des Plans sauber auf den neuen Bedarf', () => {
    const plan5: MealPlan = {
      days: 5,
      items: [
        {
          id: 'p1',
          date: TODAY,
          slot: 'dinner',
          recipeId: asRecipeId('oven_salmon'),
          portions: 2, // 500 g Kartoffeln
        },
        {
          id: 'p2',
          date: DAY_4,
          slot: 'dinner',
          recipeId: asRecipeId('oven_salmon'),
          portions: 2, // +500 g = 1000 g Kartoffeln
        },
      ],
    };
    let items = refreshPlanQuantities([], plan5, { now: FIXED_NOW });
    // Nutzer hat 700 g Kartoffeln zu Hause (Teilmenge von 1000 g)
    items = items.map((it) =>
      it.food === 'potato' ? { ...it, qtyHave: 700, state: 'open' as const } : it,
    );

    // Zeitraum von 5 auf 3 Tage kürzen -> Tag 4 fällt weg -> Bedarf sinkt auf 500 g
    // qtyHave 700 g wird auf 500 g gedeckelt -> vollständig vorhanden (state: 'home')!
    const shortened: MealPlan = { ...plan5, days: 3 };
    const afterShorten = refreshPlanQuantities(items, shortened, { now: FIXED_NOW });
    const potato = afterShorten.find((it) => it.food === 'potato')!;
    expect(potato.amount).toBe(500);
    expect(potato.qtyHave).toBe(500);
    expect(potato.state).toBe('home');
  });

  it('buildSourceSummary listet jeden Plan-Slot mit Wochentag+Mahlzeit (auch bei doppelt geplantem Rezept)', () => {
    const plan: MealPlan = {
      days: 5,
      items: [
        {
          id: 'p1',
          date: TODAY,
          slot: 'lunch',
          recipeId: asRecipeId('oven_salmon'),
          portions: 2, // 500 g Kartoffeln
        },
        {
          id: 'p2',
          date: TOMORROW,
          slot: 'dinner',
          recipeId: asRecipeId('oven_salmon'),
          portions: 4, // 1000 g Kartoffeln
        },
      ],
    };
    const items = refreshPlanQuantities([], plan, { now: FIXED_NOW });
    const potato = items.find((it) => it.food === 'potato')!;

    const fmtDate = (d: Date, opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat('de-CH', opts).format(d);
    const shortSlot = (slot: string) =>
      ({ breakfast: 'Frühstück', lunch: 'Mittag', dinner: 'Abend', snack: 'Snack' })[
        slot
      ] ?? slot;

    const summary = buildSourceSummary(potato, {
      plan,
      now: FIXED_NOW,
      formatWhen: (iso, slot) => planWhenLabel(iso, slot, fmtDate, shortSlot),
    });

    expect(summary.lines).toHaveLength(2);
    expect(summary.lines[0]?.when).toContain('Mittag');
    expect(summary.lines[0]?.amount).toBe(500);
    expect(summary.lines[1]?.when).toContain('Abend');
    expect(summary.lines[1]?.amount).toBe(1000);
    expect(summary.sumAmount).toBe(1500);
  });

  it('resolveQrImportItems behält bekannte Katalog- und Live-Plan-Zeilen und verwirft unbekannte IDs', () => {
    const liveList: ShoppingItem[] = [
      {
        id: 'potato__g',
        food: asFoodId('potato'),
        amount: 500,
        unit: 'g',
        qtyPlan: 500,
        qtyExtra: 0,
        state: 'open',
        fromRecipes: [asRecipeId('oven_salmon')],
        recipesPlan: [asRecipeId('oven_salmon')],
        recipesExtra: [],
        addedAt: '2026-11-25T10:00:00.000Z',
      },
    ];

    const resolved = resolveQrImportItems(
      [
        { id: 'potato__g', name: 'Kartoffeln', st: 'cart', amount: 500, unit: 'g' },
        { id: 'apple', name: 'Äpfel', st: 'open', amount: 2, unit: 'pc' },
        { id: 'unbekannt_xyz', name: 'Fremd-Artikel', st: 'open' },
        { id: '__proto__', name: 'Angriff', st: 'open' },
      ],
      liveList,
      KNOWN_FOODS,
    );

    expect(resolved.map((it) => it.id)).toEqual(['potato__g', 'apple']);
  });

  it('Transfer-Export/Import (edovita-plan-einkauf.json) erhält Plan, shopItems, shopStatus & qtyHave und weist ungültige shopStatus-IDs ab', () => {
    const plan: MealPlan = {
      days: 5,
      items: [
        {
          id: 'p1',
          date: TODAY,
          slot: 'dinner',
          recipeId: asRecipeId('oven_salmon'),
          portions: 2,
        },
      ],
    };
    const items = refreshPlanQuantities([], plan, { now: FIXED_NOW }).map((it) =>
      it.food === 'potato'
        ? { ...it, qtyHave: 200, state: 'open' as const }
        : it.food === 'lemon'
          ? { ...it, state: 'cart' as const }
          : it,
    );

    const shopExport = shoppingItemsToTransferExport(items, {
      knownFoodIds: KNOWN_FOODS,
      knownRecipeIds: KNOWN_RECIPES,
      lookupFoodGroup: (fid) => getFood(fid)?.group,
    });
    const bundle = buildPlanExportBundle(plan, {
      knownRecipeIds: KNOWN_RECIPES,
      shopItems: shopExport.shopItems,
      shopStatus: shopExport.shopStatus,
    });

    const parsed = parsePlanExportBundle(JSON.stringify(bundle), {
      knownRecipeIds: KNOWN_RECIPES,
      knownFoodIds: KNOWN_FOODS,
      now: FIXED_NOW,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const restored = transferBundleToShoppingItems(parsed.value, [], {
      lookupRecipe: getRecipe,
      now: FIXED_NOW,
    });
    const potato = restored.find((it) => it.food === 'potato');
    const lemon = restored.find((it) => it.food === 'lemon');
    expect(potato?.qtyPlan).toBe(500);
    expect(potato?.qtyHave).toBe(200);
    expect(potato?.state).toBe('open');
    expect(lemon?.state).toBe('cart');

    // Negativtests: unbekannte food-ID oder __proto__ in shopStatus -> Fehler 'status'
    const badUnknownFood = parsePlanExportBundle(
      JSON.stringify({
        v: 1,
        kind: PLAN_EXPORT_KIND,
        shopStatus: { 'nicht_im_katalog\0g': 'cart' },
      }),
      { knownRecipeIds: KNOWN_RECIPES, knownFoodIds: KNOWN_FOODS, now: FIXED_NOW },
    );
    expect(badUnknownFood).toEqual({ ok: false, error: 'status' });

    const badUnit = parsePlanExportBundle(
      JSON.stringify({
        v: 1,
        kind: PLAN_EXPORT_KIND,
        shopStatus: { 'potato\0tonne': 'cart' },
      }),
      { knownRecipeIds: KNOWN_RECIPES, knownFoodIds: KNOWN_FOODS, now: FIXED_NOW },
    );
    expect(badUnit).toEqual({ ok: false, error: 'status' });

    const badProto = parsePlanExportBundle(
      '{"v":1,"kind":"edovita-prototype-export","shopStatus":{"__proto__":"cart"}}',
      { knownRecipeIds: KNOWN_RECIPES, knownFoodIds: KNOWN_FOODS, now: FIXED_NOW },
    );
    expect(badProto).toEqual({ ok: false, error: 'schema' });
  });
});
