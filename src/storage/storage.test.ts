import { afterEach, describe, expect, it } from '@rstest/core';
import {
  asFoodId,
  asRecipeId,
  type Settings,
  type ShoppingItem,
} from '../domain/index.ts';
import {
  EDOVITA_SCHEMA_V1,
  EdovitaDb,
  coerceSettings,
  createDexieStorage,
  exportAll,
  importAll,
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
        secondLang: 'fr', // nicht in registry.secondary -> null
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
        secondLang: 'fr',
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
            secondLang: 'fr',
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
    const v1Db = new EdovitaDb(dbName);
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
});
