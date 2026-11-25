import { describe, expect, it } from '@rstest/core';
import { getFoodsMap, getRecipe, listRecipes } from '../catalog/index.ts';
import { dayPlanNutrition, nutrientsForServings } from '../nutrition/index.ts';
import {
  EMPTY_PLAN,
  PLAN_EXPORT_KIND,
  PLAN_EXPORT_MAX_BYTES,
  PLAN_ITEMS_MAX,
  addDaysIso,
  asRecipeId,
  buildPlanExportBundle,
  coercePlan,
  coercePlanDays,
  coercePlanPortions,
  isValidIsoDate,
  isValidPlanItemId,
  newPlanItemId,
  parsePlanExportBundle,
  planWindowDates,
  removePlanItem,
  setPlanDays,
  todayIso,
  upsertPlanItem,
  type MealPlan,
} from './index.ts';

const FOODS_BY_ID = getFoodsMap();
const KNOWN_RECIPES = new Set<string>(listRecipes().map((r) => r.id));
const KNOWN_FOODS = new Set<string>(FOODS_BY_ID.keys());
const FIXED_NOW = new Date(2026, 10, 25, 10, 30, 0); // 2026-11-25 lokal
const TODAY = todayIso(FIXED_NOW);
const TOMORROW = addDaysIso(TODAY, 1);

describe('Paket E10: Essensplan-Domäne, Tagessummen & JSON-Transfer (Issue #35)', () => {
  it('prüft Datums- und ID-Hilfsfunktionen streng', () => {
    expect(TODAY).toBe('2026-11-25');
    expect(TOMORROW).toBe('2026-11-26');
    expect(planWindowDates(5, FIXED_NOW)).toEqual([
      '2026-11-25',
      '2026-11-26',
      '2026-11-27',
      '2026-11-28',
      '2026-11-29',
    ]);
    expect(isValidIsoDate('2026-11-25')).toBe(true);
    expect(isValidIsoDate('2026-02-29')).toBe(false);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('25.11.2026')).toBe(false);

    expect(isValidPlanItemId('p1234')).toBe(true);
    expect(isValidPlanItemId('pabc123def456')).toBe(true);
    expect(isValidPlanItemId('x1234')).toBe(false);
    expect(isValidPlanItemId('p123')).toBe(false);
    expect(isValidPlanItemId('p<script>')).toBe(false);
    expect(isValidPlanItemId(newPlanItemId())).toBe(true);

    expect(coercePlanDays(1)).toBe(3);
    expect(coercePlanDays(9)).toBe(7);
    expect(coercePlanDays('4')).toBe(4);
    expect(coercePlanDays('abc')).toBe(5);

    expect(coercePlanPortions(0)).toBe(1);
    expect(coercePlanPortions(12)).toBe(8);
    expect(coercePlanPortions('3')).toBe(3);
    expect(coercePlanPortions(Number.NaN)).toBe(2);
  });

  it('coercePlan bereinigt Grenzwerte, unbekannte Rezepte, ungültige Slots, Datumsfenster, XSS-IDs und maximal 80 Einträge', () => {
    const yesterday = addDaysIso(TODAY, -1);
    const twoDaysAgo = addDaysIso(TODAY, -2);
    const in14Days = addDaysIso(TODAY, 14);
    const in15Days = addDaysIso(TODAY, 15);

    const cleaned = coercePlan(
      {
        days: 99,
        items: [
          {
            id: 'pvalid01',
            date: yesterday,
            slot: 'breakfast',
            recipeId: 'birchermuesli',
            portions: 2,
          },
          {
            id: 'pvalid01', // doppelte ID wird verworfen
            date: TODAY,
            slot: 'lunch',
            recipeId: 'pho',
            portions: 2,
          },
          {
            id: 'p<img src=x onerror=alert(1)>', // XSS-ID wird durch sichere ID ersetzt
            date: in14Days,
            slot: 'dinner',
            recipeId: 'oven_salmon',
            portions: 99, // auf 8 begrenzt
          },
          {
            id: 'pold0001',
            date: twoDaysAgo, // ausserhalb Fenster
            slot: 'lunch',
            recipeId: 'pho',
            portions: 2,
          },
          {
            id: 'pfut0001',
            date: in15Days, // ausserhalb Fenster
            slot: 'lunch',
            recipeId: 'pho',
            portions: 2,
          },
          {
            id: 'pbadslot',
            date: TODAY,
            slot: 'midnight',
            recipeId: 'pho',
            portions: 2,
          },
          {
            id: 'pbadrec1',
            date: TODAY,
            slot: 'lunch',
            recipeId: 'does_not_exist',
            portions: 2,
          },
        ],
      },
      { knownRecipeIds: KNOWN_RECIPES, now: FIXED_NOW },
    );

    expect(cleaned.days).toBe(7);
    expect(cleaned.items).toHaveLength(2);
    expect(cleaned.items[0]).toEqual({
      id: 'pvalid01',
      date: yesterday,
      slot: 'breakfast',
      recipeId: asRecipeId('birchermuesli'),
      portions: 2,
    });
    expect(cleaned.items[1]?.date).toBe(in14Days);
    expect(cleaned.items[1]?.portions).toBe(8);
    expect(isValidPlanItemId(cleaned.items[1]?.id)).toBe(true);
    expect(cleaned.items[1]?.id).not.toContain('<');

    // Mehr als 80 Einträge werden bei 80 gekappt
    const many = Array.from({ length: 85 }, (_, i) => ({
      id: `pitem${String(i).padStart(3, '0')}`,
      date: TODAY,
      slot: 'snack',
      recipeId: 'birchermuesli',
      portions: 1,
    }));
    const capped = coercePlan(
      { days: 5, items: many },
      { knownRecipeIds: KNOWN_RECIPES, now: FIXED_NOW },
    );
    expect(capped.items).toHaveLength(PLAN_ITEMS_MAX);
  });

  it('upsertPlanItem ersetzt Hauptmahlzeiten pro Tag/Slot und erlaubt mehrere Snacks', () => {
    const opts = { knownRecipeIds: KNOWN_RECIPES, now: FIXED_NOW };

    let plan: MealPlan = EMPTY_PLAN;
    plan = upsertPlanItem(
      plan,
      {
        id: 'plunch01',
        date: TODAY,
        slot: 'lunch',
        recipeId: asRecipeId('pho'),
        portions: 2,
      },
      opts,
    );
    // Zweites Mittagessen am selben Tag ersetzt das erste
    plan = upsertPlanItem(
      plan,
      {
        id: 'plunch02',
        date: TODAY,
        slot: 'lunch',
        recipeId: asRecipeId('lentil_curry'),
        portions: 3,
      },
      opts,
    );
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0]?.id).toBe('plunch02');
    expect(plan.items[0]?.recipeId).toBe(asRecipeId('lentil_curry'));

    // Zwei Snacks am selben Tag bleiben beide erhalten
    plan = upsertPlanItem(
      plan,
      {
        id: 'psnack01',
        date: TODAY,
        slot: 'snack',
        recipeId: asRecipeId('birchermuesli'),
        portions: 1,
      },
      opts,
    );
    plan = upsertPlanItem(
      plan,
      {
        id: 'psnack02',
        date: TODAY,
        slot: 'snack',
        recipeId: asRecipeId('thai_curry'),
        portions: 2,
      },
      opts,
    );
    expect(plan.items).toHaveLength(3);

    // Tauschen eines Snacks über dieselbe ID aktualisiert gezielt nur diesen Eintrag
    plan = upsertPlanItem(
      plan,
      {
        id: 'psnack01',
        date: TODAY,
        slot: 'snack',
        recipeId: asRecipeId('oven_salmon'),
        portions: 2,
      },
      opts,
    );
    expect(plan.items).toHaveLength(3);
    expect(
      plan.items.find((it) => it.id === 'psnack01')?.recipeId,
    ).toBe(asRecipeId('oven_salmon'));

    // Entfernen & Zeitraum ändern
    plan = removePlanItem(plan, 'psnack02');
    plan = setPlanDays(plan, 7);
    expect(plan.days).toBe(7);
    expect(plan.items).toHaveLength(2);
  });

  it('dayPlanNutrition summiert exakt aus nutrientsForServings für einen Tag', () => {
    const plan: MealPlan = {
      days: 5,
      items: [
        {
          id: 'pday001',
          date: TODAY,
          slot: 'breakfast',
          recipeId: asRecipeId('birchermuesli'),
          portions: 2,
        },
        {
          id: 'pday002',
          date: TODAY,
          slot: 'dinner',
          recipeId: asRecipeId('oven_salmon'),
          portions: 3,
        },
        {
          id: 'pday003',
          date: TOMORROW,
          slot: 'lunch',
          recipeId: asRecipeId('pho'),
          portions: 4,
        },
      ],
    };

    const actual = dayPlanNutrition(
      plan.items.filter((it) => it.date === TODAY),
      getRecipe,
      FOODS_BY_ID,
    );

    const bircher = nutrientsForServings(
      getRecipe('birchermuesli')!,
      2,
      FOODS_BY_ID,
    );
    const salmon = nutrientsForServings(
      getRecipe('oven_salmon')!,
      3,
      FOODS_BY_ID,
    );

    expect(actual.hasValues).toBe(true);
    expect(actual.kcal).toBe(Math.round(bircher.kcal + salmon.kcal));
    expect(actual.protein).toBe(Math.round(bircher.protein + salmon.protein));

    const empty = dayPlanNutrition([], getRecipe, FOODS_BY_ID);
    expect(empty).toEqual({ kcal: 0, protein: 0, hasValues: false });
  });

  it('buildPlanExportBundle & parsePlanExportBundle prüfen Schema, Grösse, Prototype-Pollution, XSS, 81 Einträge und alte Bündel', () => {
    const parseOpts = {
      knownRecipeIds: KNOWN_RECIPES,
      knownFoodIds: KNOWN_FOODS,
      now: FIXED_NOW,
    };

    const samplePlan: MealPlan = {
      days: 6,
      items: [
        {
          id: 'pexp001',
          date: TODAY,
          slot: 'breakfast',
          recipeId: asRecipeId('birchermuesli'),
          portions: 2,
        },
      ],
    };

    const bundle = buildPlanExportBundle(samplePlan, {
      knownRecipeIds: KNOWN_RECIPES,
      now: FIXED_NOW,
    });
    expect(bundle.v).toBe(1);
    expect(bundle.kind).toBe(PLAN_EXPORT_KIND);
    expect(bundle.plan).toEqual(samplePlan);
    expect('profile' in bundle).toBe(false);
    expect('weight' in bundle).toBe(false);

    const roundtrip = parsePlanExportBundle(JSON.stringify(bundle), parseOpts);
    expect(roundtrip).toEqual({
      ok: true,
      value: {
        plan: samplePlan,
        shopItems: [],
        shopStatus: {},
      },
    });

    // Altes Bündel ohne `plan`, aber mit gültigen `shopItems` bleibt gültig
    const legacy = parsePlanExportBundle(
      JSON.stringify({
        v: 1,
        kind: PLAN_EXPORT_KIND,
        shopItems: [
          {
            id: 'broccoli',
            unit: 'g',
            qtyPlan: 300,
            qtyExtra: 0,
            qtyHave: 50,
            recipesPlan: ['oven_salmon'],
            recipesExtra: [],
          },
        ],
      }),
      parseOpts,
    );
    expect(legacy.ok).toBe(true);
    if (legacy.ok) {
      expect(legacy.value.plan).toBeNull();
      expect(legacy.value.shopItems).toHaveLength(1);
    }

    // Leeres Bündel ohne `plan` und ohne `shopItems` wird abgelehnt
    expect(
      parsePlanExportBundle(
        JSON.stringify({ v: 1, kind: PLAN_EXPORT_KIND }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'empty' });

    // Grössenlimit (> 100 KB)
    expect(
      parsePlanExportBundle('a'.repeat(PLAN_EXPORT_MAX_BYTES + 1), parseOpts),
    ).toEqual({ ok: false, error: 'size' });

    // Defektes JSON
    expect(parsePlanExportBundle('{kaputt', parseOpts)).toEqual({
      ok: false,
      error: 'parse',
    });

    // Prototype Pollution über __proto__ / constructor
    expect(
      parsePlanExportBundle(
        `{"v":1,"kind":"${PLAN_EXPORT_KIND}","__proto__":{"polluted":true},"plan":{"days":5,"items":[]}}`,
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // 81 Planeinträge -> plan-count
    const items81 = Array.from({ length: 81 }, (_, i) => ({
      id: `pitem${String(i).padStart(3, '0')}`,
      date: TODAY,
      slot: 'snack',
      recipeId: 'birchermuesli',
      portions: 1,
    }));
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: { days: 5, items: items81 },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'plan-count' });

    // XSS-ID im Import wird hart abgelehnt (plan-id)
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: {
            days: 5,
            items: [
              {
                id: '<script>alert(1)</script>',
                date: TODAY,
                slot: 'lunch',
                recipeId: 'pho',
                portions: 2,
              },
            ],
          },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'plan-id' });

    // Unbekanntes Rezept -> plan-recipe
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: {
            days: 5,
            items: [
              {
                id: 'pitem001',
                date: TODAY,
                slot: 'lunch',
                recipeId: 'unknown_recipe',
                portions: 2,
              },
            ],
          },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'plan-recipe' });

    // Datum ausserhalb Fenster -> plan-date
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: {
            days: 5,
            items: [
              {
                id: 'pitem001',
                date: addDaysIso(TODAY, 30),
                slot: 'lunch',
                recipeId: 'pho',
                portions: 2,
              },
            ],
          },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'plan-date' });

    // Ungültige Portionen -> plan-portions
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: {
            days: 5,
            items: [
              {
                id: 'pitem001',
                date: TODAY,
                slot: 'lunch',
                recipeId: 'pho',
                portions: 9,
              },
            ],
          },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'plan-portions' });

    // Ungültiger Slot -> plan-slot
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: {
            days: 5,
            items: [
              {
                id: 'pitem001',
                date: TODAY,
                slot: 'brunch',
                recipeId: 'pho',
                portions: 2,
              },
            ],
          },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'plan-slot' });
  });

  it('F1b-Härtung: parsePlanExportBundle lehnt falsche Version, falsches kind, unbekannte Felder, ungültige grp und doppelte plan-IDs ab', () => {
    const parseOpts = {
      knownRecipeIds: KNOWN_RECIPES,
      knownFoodIds: KNOWN_FOODS,
      now: FIXED_NOW,
    };

    // Falsche Version (v: 2) -> schema
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 2,
          kind: PLAN_EXPORT_KIND,
          plan: { days: 5, items: [] },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // Falsches kind -> schema
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: 'edovita-other-export',
          plan: { days: 5, items: [] },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // Unbekanntes Top-Level-Feld -> schema
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: { days: 5, items: [] },
          extraField: true,
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // Unbekanntes Feld in plan -> schema
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: { days: 5, items: [], extraPlanField: 'x' },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // Unbekanntes Feld in plan.items[i] -> schema
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: {
            days: 5,
            items: [
              {
                id: 'pitem001',
                date: TODAY,
                slot: 'lunch',
                recipeId: 'pho',
                portions: 2,
                extraItemField: 'x',
              },
            ],
          },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // Unbekanntes Feld in shopItems[i] -> schema
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          shopItems: [
            {
              id: 'broccoli',
              unit: 'g',
              qtyPlan: 200,
              qtyExtra: 0,
              qtyHave: 0,
              recipesPlan: [],
              recipesExtra: [],
              extraShopField: 123,
            },
          ],
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // shopItems[i].grp gegen FOOD_GROUPS: ungültig -> schema, gültig -> ok
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          shopItems: [
            {
              id: 'broccoli',
              unit: 'g',
              qtyPlan: 200,
              qtyExtra: 0,
              qtyHave: 0,
              recipesPlan: [],
              recipesExtra: [],
              grp: 'unknown_group',
            },
          ],
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          shopItems: [
            {
              id: 'broccoli',
              unit: 'g',
              qtyPlan: 200,
              qtyExtra: 0,
              qtyHave: 0,
              recipesPlan: [],
              recipesExtra: [],
              grp: 42,
            },
          ],
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'schema' });

    const validGrp = parsePlanExportBundle(
      JSON.stringify({
        v: 1,
        kind: PLAN_EXPORT_KIND,
        shopItems: [
          {
            id: 'broccoli',
            unit: 'g',
            qtyPlan: 200,
            qtyExtra: 0,
            qtyHave: 0,
            recipesPlan: [],
            recipesExtra: [],
            grp: 'veg',
          },
        ],
      }),
      parseOpts,
    );
    expect(validGrp.ok).toBe(true);
    if (validGrp.ok) {
      expect(validGrp.value.shopItems?.[0]?.grp).toBe('veg');
    }

    // Doppelte plan-IDs -> plan-id
    expect(
      parsePlanExportBundle(
        JSON.stringify({
          v: 1,
          kind: PLAN_EXPORT_KIND,
          plan: {
            days: 5,
            items: [
              {
                id: 'pdup001',
                date: TODAY,
                slot: 'breakfast',
                recipeId: 'birchermuesli',
                portions: 2,
              },
              {
                id: 'pdup001',
                date: TOMORROW,
                slot: 'dinner',
                recipeId: 'oven_salmon',
                portions: 2,
              },
            ],
          },
        }),
        parseOpts,
      ),
    ).toEqual({ ok: false, error: 'plan-id' });
  });
});
