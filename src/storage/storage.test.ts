import { afterEach, describe, expect, it } from '@rstest/core';
import {
  asFoodId,
  asRecipeId,
  coerceQtyHave,
  coerceShoppingItem,
  type Settings,
  type ShoppingItem,
} from '../domain/index.ts';
import {
  EDOVITA_MIGRATIONS,
  EDOVITA_SCHEMA_V1,
  EdovitaDb,
  coerceSettings,
  createDexieStorage,
  exportAll,
  exportPlanTransferBundle,
  importAll,
  importPlanTransferBundle,
  settingsSchema,
  wipeAll,
  type DexieStorageBundle,
  type SchemaMigration,
} from './index.ts';

const createdDbs: EdovitaDb[] = [];
let seq = 0;

function nextDbName(prefix: string): string {
  seq += 1;
  return `edovita_${prefix}_${seq}_${Date.now()}`;
}

afterEach(async () => {
  window.localStorage.clear();
  while (createdDbs.length > 0) {
    const db = createdDbs.pop()!;
    await db.delete();
  }
});

describe('Speicher: Neuladen, Coercion, Export/Import/Wipe und Migrationen (E3)', () => {
  it('Daten überleben Neuladen (IndexedDB schliessen und neu öffnen)', async () => {
    const dbName = nextDbName('reload');
    const first: DexieStorageBundle = createDexieStorage(dbName);

    const item: ShoppingItem = {
      id: 'item_1',
      food: asFoodId('salmon'),
      amount: 300,
      unit: 'g',
      state: 'cart',
      fromRecipes: [asRecipeId('oven_salmon')],
      addedAt: '2026-11-23T12:00:00.000Z',
    };

    await first.settings.set({
      uiLang: 'de',
      secondLang: 'ja',
      theme: 'dark',
      sound: false,
      hymn: 'H4',
    });
    await first.shopping.upsert(item);
    await first.ratings.setRating('oven_salmon', 5);
    await first.ratings.setSaved('oven_salmon', true);

    first.db.close();

    // Simuliertes Neuladen: neue Dexie-Instanz auf derselben IndexedDB
    const reopened: DexieStorageBundle = createDexieStorage(dbName);
    createdDbs.push(reopened.db);

    expect(await reopened.settings.get()).toEqual({
      uiLang: 'de',
      secondLang: 'ja',
      theme: 'dark',
      sound: false,
      hymn: 'H4',
    });
    expect(await reopened.shopping.list()).toEqual([item]);
    expect(await reopened.ratings.getRating('oven_salmon')).toBe(5);
    expect(await reopened.ratings.isSaved('oven_salmon')).toBe(true);
  });

  it('coerceSettings normalisiert manipulierte DB-Werte sicher auf Standardwerte (F1, F3a)', async () => {
    const dbName = nextDbName('coerce');
    const storage = createDexieStorage(dbName);
    createdDbs.push(storage.db);

    // Direkt manipulierte Rohdaten in IndexedDB schreiben
    await storage.db.settings.put({
      key: 'current',
      value: {
        uiLang: 'fr', // nicht legalApproved -> Fallback en
        secondLang: 'vi', // nicht in registry.secondary -> null
        theme: 'invalid-theme',
        sound: 'nein',
        hymn: 'H99',
      } as unknown as Settings,
    });

    expect(await storage.settings.get()).toEqual({
      uiLang: 'en',
      secondLang: null,
      theme: 'system',
      sound: true,
      hymn: 'H1',
    });

    // Auch direkte Funktionsprüfung inklusive Prototype-Schlüsseln
    expect(
      coerceSettings({
        uiLang: 'constructor',
        secondLang: '__proto__',
        theme: 'light',
        sound: false,
        hymn: 'H5',
      }),
    ).toEqual({
      uiLang: 'en',
      secondLang: null,
      theme: 'light',
      sound: false,
      hymn: 'H5',
    });

    // Registry-gebundenes settingsSchema lehnt nicht freigegebene uiLang & unlisted secondLang ab
    expect(
      settingsSchema.safeParse({
        uiLang: 'fr',
        secondLang: null,
        theme: 'system',
        sound: true,
        hymn: 'H1',
      }).success,
    ).toBe(false);
    expect(
      settingsSchema.safeParse({
        uiLang: 'de',
        secondLang: 'vi',
        theme: 'system',
        sound: true,
        hymn: 'H1',
      }).success,
    ).toBe(false);
  });

  it('Export -> Alles löschen (wipeAll) -> Import stellt alle Daten wieder her', async () => {
    const dbName = nextDbName('roundtrip');
    const storage = createDexieStorage(dbName);
    createdDbs.push(storage.db);

    window.localStorage.setItem('edovita.theme', 'dark');
    window.localStorage.setItem('edovita.lang', 'de');
    window.localStorage.setItem('unrelated.key', 'keep-me');

    const item: ShoppingItem = {
      id: 'item_oats',
      food: asFoodId('oats'),
      amount: 120,
      unit: 'g',
      state: 'home',
      fromRecipes: [asRecipeId('birchermuesli')],
      addedAt: '2026-11-23T08:00:00.000Z',
    };

    await storage.settings.set({
      uiLang: 'de',
      secondLang: 'pt',
      theme: 'dark',
      sound: false,
      hymn: 'H5',
    });
    await storage.shopping.upsert(item);
    await storage.ratings.setRating('birchermuesli', 5);
    await storage.ratings.setSaved('birchermuesli', true);

    const exported = await exportAll(storage, {
      now: () => new Date('2026-11-23T12:00:00.000Z'),
    });
    expect(exported.format).toBe(1);
    expect(exported.exportedAt).toBe('2026-11-23T12:00:00.000Z');
    const serialized = JSON.stringify(exported);

    // Alles löschen (IndexedDB + edovita.* in localStorage)
    await wipeAll(storage, { db: storage.db });

    expect(window.localStorage.getItem('edovita.theme')).toBeNull();
    expect(window.localStorage.getItem('edovita.lang')).toBeNull();
    expect(window.localStorage.getItem('unrelated.key')).toBe('keep-me');
    expect(await storage.shopping.list()).toEqual([]);
    expect(await storage.ratings.listRatings()).toEqual({});
    expect(await storage.ratings.listSaved()).toEqual([]);
    expect(await storage.settings.get()).toEqual({
      uiLang: 'en',
      secondLang: null,
      theme: 'system',
      sound: true,
      hymn: 'H1',
    });

    // Import stellt alles wieder her
    const imported = await importAll(storage, serialized);
    expect(imported.ok).toBe(true);
    expect(await storage.settings.get()).toEqual({
      uiLang: 'de',
      secondLang: 'pt',
      theme: 'dark',
      sound: false,
      hymn: 'H5',
    });
    expect(await storage.shopping.list()).toEqual([item]);
    expect(await storage.ratings.listRatings()).toEqual({ birchermuesli: 5 });
    expect(await storage.ratings.listSaved()).toEqual(['birchermuesli']);
  });

  it('lehnt ungültige Importe ab ohne bestehende Daten zu verändern', async () => {
    const dbName = nextDbName('invalid_import');
    const storage = createDexieStorage(dbName);
    createdDbs.push(storage.db);

    await storage.settings.set({
      uiLang: 'de',
      secondLang: 'ja',
      theme: 'light',
      sound: true,
      hymn: 'H1',
    });

    // Kaputtes JSON
    expect(await importAll(storage, '{ungültiges json')).toEqual({
      ok: false,
      error: 'parse',
    });

    // Falsche Format-Version
    expect(
      await importAll(storage, {
        format: 99,
        exportedAt: '2026-11-23T12:00:00.000Z',
        data: {},
      }),
    ).toEqual({ ok: false, error: 'schema' });

    // Unfreigegebene UI-Sprache (F1)
    expect(
      await importAll(storage, {
        format: 1,
        exportedAt: '2026-11-23T12:00:00.000Z',
        data: {
          settings: {
            uiLang: 'fr',
            secondLang: null,
            theme: 'dark',
            sound: false,
            hymn: 'H1',
          },
        },
      }),
    ).toEqual({ ok: false, error: 'schema' });

    // Ungültige Zweitsprache nicht in registry.secondary (F3a)
    expect(
      await importAll(storage, {
        format: 1,
        exportedAt: '2026-11-23T12:00:00.000Z',
        data: {
          settings: {
            uiLang: 'de',
            secondLang: 'vi',
            theme: 'dark',
            sound: false,
            hymn: 'H1',
          },
        },
      }),
    ).toEqual({ ok: false, error: 'schema' });

    // Prototype-Schlüssel in ratings
    expect(
      await importAll(
        storage,
        '{"format":1,"exportedAt":"2026-11-23T12:00:00.000Z","data":{"ratings":{"__proto__":5}}}',
      ),
    ).toEqual({ ok: false, error: 'schema' });

    // Bestehende Daten blieben vollständig unberührt
    expect(await storage.settings.get()).toEqual({
      uiLang: 'de',
      secondLang: 'ja',
      theme: 'light',
      sound: true,
      hymn: 'H1',
    });
  });

  it('Migrationstest-Gerüst: führt Dexie version(1) -> version(2).upgrade() sauber auf Altdaten aus', async () => {
    const dbName = nextDbName('migration');

    // 1. Altdaten in v1 anlegen
    const v1Db = new EdovitaDb(dbName, [
      { version: 1, stores: { ...EDOVITA_SCHEMA_V1 } },
    ]);
    await v1Db.settings.put({
      key: 'current',
      value: {
        uiLang: 'de',
        secondLang: null,
        theme: 'system',
        sound: true,
        hymn: 'H1',
      },
    });
    v1Db.close();

    // 2. Beispiel-v2-Migration über das Gerüst anwenden (z. B. Standard-Zweitsprache auf Altdatensatz setzen)
    const migrationsV2: SchemaMigration[] = [
      { version: 1, stores: { ...EDOVITA_SCHEMA_V1 } },
      {
        version: 2,
        stores: { ...EDOVITA_SCHEMA_V1 },
        upgrade: async (tx) => {
          await tx
            .table('settings')
            .toCollection()
            .modify((row: { key: string; value: Settings }) => {
              if (row.value.secondLang === null) {
                row.value.secondLang = 'en';
              }
            });
        },
      },
    ];

    const v2Db = new EdovitaDb(dbName, migrationsV2);
    createdDbs.push(v2Db);

    const migrated = await v2Db.settings.get('current');
    expect(migrated?.value.uiLang).toBe('de');
    expect(migrated?.value.secondLang).toBe('en');
  });

  it('E5b Dexie-Migration v1 -> v2: ergänzt fehlendes qtyHave mit 0 und deckelt/bereinigt Altwerte (Issue #31)', async () => {
    const dbName = nextDbName('migration_v2_qtyhave');

    // 1. Altdaten in v1 (ohne qtyHave sowie mit ungültigen/übergrossen Werten) schreiben
    const v1Db = new EdovitaDb(dbName, [
      { version: 1, stores: { ...EDOVITA_SCHEMA_V1 } },
    ]);
    await v1Db.shopping.bulkPut([
      {
        id: 'old_no_have',
        food: asFoodId('broccoli'),
        amount: 400,
        unit: 'g',
        state: 'open',
        fromRecipes: [asRecipeId('oven_salmon')],
        addedAt: '2026-11-23T08:00:00.000Z',
      },
      {
        id: 'old_over_cap',
        food: asFoodId('oats'),
        amount: 100,
        unit: 'g',
        qtyHave: 999,
        state: 'open',
        fromRecipes: [],
        addedAt: '2026-11-23T08:01:00.000Z',
      },
      {
        id: 'old_negative',
        food: asFoodId('garlic'),
        amount: 4,
        unit: 'pc',
        qtyHave: -5,
        state: 'open',
        fromRecipes: [],
        addedAt: '2026-11-23T08:02:00.000Z',
      },
      {
        id: 'old_corrupt',
        food: asFoodId('salt'),
        amount: 10,
        unit: 'g',
        qtyHave: 'kaputt' as unknown as number,
        state: 'open',
        fromRecipes: [],
        addedAt: '2026-11-23T08:03:00.000Z',
      },
    ]);
    v1Db.close();

    // 2. Mit produktiven EDOVITA_MIGRATIONS (v2) öffnen
    expect(EDOVITA_MIGRATIONS.some((m) => m.version === 2)).toBe(true);
    const storage = createDexieStorage(dbName);
    createdDbs.push(storage.db);

    const list = await storage.shopping.list();
    const byId = new Map(list.map((it) => [it.id, it]));
    expect(byId.get('old_no_have')?.qtyHave).toBe(0);
    expect(byId.get('old_over_cap')?.qtyHave).toBe(100);
    expect(byId.get('old_negative')?.qtyHave).toBe(0);
    expect(byId.get('old_corrupt')?.qtyHave).toBe(0);
  });

  it('E5b coerceQtyHave & coerceShoppingItem bereinigen negative Werte, NaN, Strings und 1e9 und deckeln auf Bedarf', () => {
    expect(coerceQtyHave(undefined)).toBe(0);
    expect(coerceQtyHave(-5, 100)).toBe(0);
    expect(coerceQtyHave(Number.NaN, 100)).toBe(0);
    expect(coerceQtyHave(Number.POSITIVE_INFINITY, 100)).toBe(0);
    expect(coerceQtyHave('50', 100)).toBe(0);
    expect(coerceQtyHave(1e9, 100)).toBe(0);
    expect(coerceQtyHave(1e9)).toBe(0);
    expect(coerceQtyHave(250, 100)).toBe(100);
    expect(coerceQtyHave(50, 100)).toBe(50);

    const coercedNeg = coerceShoppingItem({
      id: 'item_neg',
      food: 'oats',
      amount: 100,
      unit: 'g',
      qtyHave: -10,
      state: 'open',
      fromRecipes: [],
      addedAt: '2026-11-24T10:00:00.000Z',
    });
    expect(coercedNeg?.qtyHave).toBe(0);

    const coercedStr = coerceShoppingItem({
      id: 'item_str',
      food: 'oats',
      amount: 100,
      unit: 'g',
      qtyHave: 'abc',
      state: 'open',
      fromRecipes: [],
      addedAt: '2026-11-24T10:00:00.000Z',
    });
    expect(coercedStr?.qtyHave).toBe(0);

    const coercedHuge = coerceShoppingItem({
      id: 'item_huge',
      food: 'oats',
      amount: 100,
      unit: 'g',
      qtyHave: 1e9,
      state: 'open',
      fromRecipes: [],
      addedAt: '2026-11-24T10:00:00.000Z',
    });
    expect(coercedHuge?.qtyHave).toBe(0);

    const coercedOverCap = coerceShoppingItem({
      id: 'item_over',
      food: 'oats',
      amount: 100,
      unit: 'g',
      qtyHave: 250,
      state: 'open',
      fromRecipes: [],
      addedAt: '2026-11-24T10:00:00.000Z',
    });
    expect(coercedOverCap?.qtyHave).toBe(100);

    const coercedNan = coerceShoppingItem({
      id: 'item_nan',
      food: 'oats',
      amount: 100,
      unit: 'g',
      qtyHave: Number.NaN,
      state: 'open',
      fromRecipes: [],
      addedAt: '2026-11-24T10:00:00.000Z',
    });
    expect(coercedNan?.qtyHave).toBe(0);
  });

  it('G2: importAll läuft atomar in einer Dexie-Transaktion – Fehler mitten im Import lässt Altbestand unverändert', async () => {
    const dbName = nextDbName('tx_rollback');
    const storage = createDexieStorage(dbName);
    createdDbs.push(storage.db);

    const existingItem: ShoppingItem = {
      id: 'item_keep',
      food: asFoodId('broccoli'),
      amount: 400,
      unit: 'g',
      state: 'home',
      fromRecipes: [asRecipeId('oven_salmon')],
      addedAt: '2026-11-23T08:00:00.000Z',
    };

    await storage.settings.set({
      uiLang: 'de',
      secondLang: 'pt',
      theme: 'dark',
      sound: false,
      hymn: 'H5',
    });
    await storage.shopping.upsert(existingItem);
    await storage.ratings.setRating('oven_salmon', 5);
    await storage.ratings.setSaved('oven_salmon', true);

    // Fehler mitten in der Transaktion (nach settings/shopping/ratings, beim Schreiben von saved) erzwingen
    const origBulkPut = storage.db.saved.bulkPut.bind(storage.db.saved);
    storage.db.saved.bulkPut = (() => {
      const err = new Error('Simulated QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }) as typeof storage.db.saved.bulkPut;

    try {
      const res = await importAll(storage, {
        format: 1,
        exportedAt: '2026-11-23T15:00:00.000Z',
        data: {
          settings: {
            uiLang: 'en',
            secondLang: 'ja',
            theme: 'light',
            sound: true,
            hymn: 'H1',
          },
          shopping: [
            {
              id: 'item_new',
              food: asFoodId('salmon'),
              amount: 300,
              unit: 'g',
              state: 'open',
              fromRecipes: [asRecipeId('oven_salmon')],
              addedAt: '2026-11-23T15:00:00.000Z',
            },
          ],
          ratings: { pho: 4 },
          saved: ['pho'],
        },
      });

      expect(res).toEqual({ ok: false, error: 'write' });
    } finally {
      storage.db.saved.bulkPut = origBulkPut;
    }

    // Alle vier Tabellen müssen durch das Dexie-Transaktions-Rollback vollständig unverändert sein
    expect(await storage.settings.get()).toEqual({
      uiLang: 'de',
      secondLang: 'pt',
      theme: 'dark',
      sound: false,
      hymn: 'H5',
    });
    expect(await storage.shopping.list()).toEqual([existingItem]);
    expect(await storage.ratings.listRatings()).toEqual({ oven_salmon: 5 });
    expect(await storage.ratings.listSaved()).toEqual(['oven_salmon']);
  });

  it('migriert Bestandsdaten von Schema-Version 2 sauber auf Version 4 (plan-Tabelle leer, Altbestand erhalten)', async () => {
    const dbName = nextDbName('mig_v2_v4');

    // Altdatenbank in Version 2 anlegen
    const oldDb = new EdovitaDb(
      dbName,
      EDOVITA_MIGRATIONS.filter((m) => m.version <= 2),
    );
    await oldDb.settings.put({
      key: 'current',
      value: {
        uiLang: 'de',
        secondLang: 'pt',
        theme: 'dark',
        sound: true,
        hymn: 'H1',
      },
    });
    await oldDb.ratings.put({ recipeId: 'pho', stars: 5 });
    oldDb.close();

    // Mit aktuellem v4-Schema öffnen
    const upgraded = createDexieStorage(dbName);
    createdDbs.push(upgraded.db);

    expect(upgraded.db.verno).toBe(4);
    expect((await upgraded.settings.get()).uiLang).toBe('de');
    expect(await upgraded.ratings.getRating('pho')).toBe(5);
    expect(await upgraded.plan.get()).toEqual({ days: 5, items: [] });
  });

  it('migriert Bestandsdaten von Schema-Version 3 auf Version 4 (qtyExtra/recipesExtra & qtyHave-Deckelung)', async () => {
    const dbName = nextDbName('mig_v3_v4');

    const oldDb = new EdovitaDb(
      dbName,
      EDOVITA_MIGRATIONS.filter((m) => m.version <= 3),
    );
    await oldDb.shopping.put({
      id: 'potato__g',
      food: asFoodId('potato'),
      amount: 300,
      unit: 'g',
      qtyHave: 500, // grösser als Bedarf -> wird in v4 auf 300 gedeckelt
      state: 'open',
      fromRecipes: [asRecipeId('oven_salmon')],
      addedAt: '2026-11-24T12:00:00.000Z',
    });
    oldDb.close();

    const upgraded = createDexieStorage(dbName);
    createdDbs.push(upgraded.db);

    expect(upgraded.db.verno).toBe(4);
    const list = await upgraded.shopping.list();
    expect(list).toHaveLength(1);
    const potato = list[0]!;
    expect(potato.qtyPlan).toBe(0);
    expect(potato.qtyExtra).toBe(300);
    expect(potato.recipesPlan).toEqual([]);
    expect(potato.recipesExtra).toEqual([asRecipeId('oven_salmon')]);
    expect(potato.qtyHave).toBe(300);
    expect(potato.state).toBe('home');
  });

  it('F1b: importPlanTransferBundle läuft echt transaktional über Dexie für Plan + Liste + Status und lässt Altbestand bei Fehler unverändert', async () => {
    const dbName = nextDbName('f1b_plan_tx');
    const storage = createDexieStorage(dbName);
    createdDbs.push(storage.db);

    const fixedNow = new Date();
    const today = `${fixedNow.getFullYear()}-${String(fixedNow.getMonth() + 1).padStart(2, '0')}-${String(fixedNow.getDate()).padStart(2, '0')}`;

    const initialPlan = {
      days: 4,
      items: [
        {
          id: 'pinit01',
          date: today,
          slot: 'breakfast' as const,
          recipeId: asRecipeId('birchermuesli'),
          portions: 2,
        },
      ],
    };
    const initialShopping = [
      {
        id: 'oats__g',
        food: asFoodId('oats'),
        amount: 100,
        unit: 'g' as const,
        qtyPlan: 100,
        qtyExtra: 0,
        qtyHave: 40,
        state: 'open' as const,
        fromRecipes: [asRecipeId('birchermuesli')],
        recipesPlan: [asRecipeId('birchermuesli')],
        recipesExtra: [],
        addedAt: fixedNow.toISOString(),
      },
    ];
    await storage.plan.set(initialPlan, fixedNow);
    await storage.shopping.replaceAll(initialShopping);

    // Rundreise: Export erzeugt edovita-prototype-export mit Plan + shopItems + shopStatus ohne Körperdaten
    const exported = await exportPlanTransferBundle(storage, { now: fixedNow });
    expect(exported.v).toBe(1);
    expect(exported.kind).toBe('edovita-prototype-export');
    expect(exported.plan).toEqual(initialPlan);
    expect(exported.shopItems).toHaveLength(1);
    expect(exported.shopItems?.[0]?.id).toBe('oats');
    expect(exported.shopItems?.[0]?.qtyHave).toBe(40);
    expect(exported.shopStatus?.['oats\0g']).toBe('open');
    expect('settings' in exported).toBe(false);
    expect('profile' in exported).toBe(false);

    // Altes Bündel ohne `plan`, aber mit gültigen `shopItems` aktualisiert die Liste und lässt Plan unberührt
    const legacyShopOnly = JSON.stringify({
      v: 1,
      kind: 'edovita-prototype-export',
      shopItems: [
        {
          id: 'broccoli',
          unit: 'g',
          qtyPlan: 0,
          qtyExtra: 200,
          qtyHave: 0,
          recipesPlan: [],
          recipesExtra: ['oven_salmon'],
        },
      ],
      shopStatus: { 'broccoli\0g': 'cart' },
    });
    const legacyRes = await importPlanTransferBundle(storage, legacyShopOnly, {
      now: fixedNow,
    });
    expect(legacyRes.ok).toBe(true);
    expect(await storage.plan.get(fixedNow)).toEqual(initialPlan);
    const afterLegacyShop = await storage.shopping.list();
    expect(afterLegacyShop.find((it) => it.food === 'broccoli')?.state).toBe(
      'cart',
    );

    // Altbestand vor Rollback-Test wieder herstellen
    await storage.shopping.replaceAll(initialShopping);

    // Simulierter Fehler mitten in der Dexie-Transaktion -> Rollback lässt Plan UND Einkaufsliste unverändert
    const nextBundle = JSON.stringify({
      v: 1,
      kind: 'edovita-prototype-export',
      plan: {
        days: 7,
        items: [
          {
            id: 'pnext01',
            date: today,
            slot: 'dinner',
            recipeId: 'oven_salmon',
            portions: 4,
          },
        ],
      },
      shopItems: [
        {
          id: 'potato',
          unit: 'g',
          qtyPlan: 1000,
          qtyExtra: 0,
          qtyHave: 250,
          recipesPlan: ['oven_salmon'],
          recipesExtra: [],
        },
      ],
      shopStatus: { 'potato\0g': 'open' },
    });

    const origPut = storage.db.plan.put.bind(storage.db.plan);
    storage.db.plan.put = (() => {
      const err = new Error('Simulated Dexie write error');
      err.name = 'QuotaExceededError';
      throw err;
    }) as typeof storage.db.plan.put;

    try {
      const failed = await importPlanTransferBundle(storage, nextBundle, {
        now: fixedNow,
      });
      expect(failed).toEqual({ ok: false, error: 'write' });
    } finally {
      storage.db.plan.put = origPut;
    }

    expect(await storage.plan.get(fixedNow)).toEqual(initialPlan);
    expect(await storage.shopping.list()).toEqual(initialShopping);

    // Ohne Fehler übernimmt der Import Plan + Einkaufsliste + Teilmenge atomar
    const applied = await importPlanTransferBundle(storage, nextBundle, {
      now: fixedNow,
    });
    expect(applied.ok).toBe(true);
    expect(await storage.plan.get(fixedNow)).toEqual({
      days: 7,
      items: [
        {
          id: 'pnext01',
          date: today,
          slot: 'dinner',
          recipeId: asRecipeId('oven_salmon'),
          portions: 4,
        },
      ],
    });
    const importedShop = await storage.shopping.list();
    const importedPotato = importedShop.find((it) => it.food === 'potato');
    expect(importedPotato?.qtyPlan).toBe(1000);
    expect(importedPotato?.qtyHave).toBe(250);
  });
});
