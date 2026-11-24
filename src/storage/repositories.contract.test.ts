import { afterEach, describe, expect, it } from '@rstest/core';
import {
  DEFAULT_SETTINGS,
  asFoodId,
  asRecipeId,
  type Settings,
  type ShoppingItem,
} from '../domain/index.ts';
import {
  createDexieStorage,
  createMemoryStorage,
  type DexieStorageBundle,
  type StorageBundle,
} from './index.ts';

function runRepositoryContractSuite(
  label: string,
  createBundle: () => { bundle: StorageBundle; teardown: () => Promise<void> },
) {
  let activeTeardown: (() => Promise<void>) | null = null;

  afterEach(async () => {
    if (activeTeardown) {
      await activeTeardown();
      activeTeardown = null;
    }
  });

  function setup(): StorageBundle {
    const { bundle, teardown } = createBundle();
    activeTeardown = teardown;
    return bundle;
  }

  describe(`Repository-Vertragstest (${label})`, () => {
    it('SettingsRepository: liefert Defaults, speichert, aktualisiert und normalisiert ungültige Werte', async () => {
      const { settings } = setup();

      expect(await settings.get()).toEqual(DEFAULT_SETTINGS);

      const saved = await settings.set({
        uiLang: 'de',
        secondLang: 'pt',
        theme: 'dark',
        sound: false,
        hymn: 'H5',
      });
      expect(saved).toEqual({
        uiLang: 'de',
        secondLang: 'pt',
        theme: 'dark',
        sound: false,
        hymn: 'H5',
      });
      expect(await settings.get()).toEqual(saved);

      // Teil-Update inkl. F1/F3a-Coercion (nicht freigegebene UI-Sprache -> en, ungültige secondLang -> null)
      const updated = await settings.update({
        uiLang: 'fr',
        secondLang: 'xx',
      } as Partial<Settings>);
      expect(updated.uiLang).toBe('en');
      expect(updated.secondLang).toBeNull();
      expect(updated.theme).toBe('dark');

      await settings.clear();
      expect(await settings.get()).toEqual(DEFAULT_SETTINGS);
    });

    it('ShoppingRepository: CRUD, replaceAll, clear und Schutz gegen Prototype-Schlüssel', async () => {
      const { shopping } = setup();

      expect(await shopping.list()).toEqual([]);

      const broccoli: ShoppingItem = {
        id: 'shop_broccoli_g',
        food: asFoodId('broccoli'),
        amount: 400,
        unit: 'g',
        state: 'open',
        fromRecipes: [asRecipeId('oven_salmon')],
        addedAt: '2026-11-23T10:00:00.000Z',
      };
      const milk: ShoppingItem = {
        id: 'shop_milk_ml',
        food: asFoodId('milk'),
        amount: 250,
        unit: 'ml',
        state: 'home',
        fromRecipes: [asRecipeId('birchermuesli')],
        addedAt: '2026-11-23T10:05:00.000Z',
      };

      await shopping.upsert(broccoli);
      await shopping.upsert(milk);

      const fetched = await shopping.get('shop_broccoli_g');
      expect(fetched).toEqual(broccoli);
      expect(await shopping.get('constructor')).toBeUndefined();
      expect(await shopping.get('__proto__')).toBeUndefined();

      const listed = await shopping.list();
      expect(listed.length).toBe(2);

      // Zustand aktualisieren (offen -> im Korb)
      await shopping.upsert({ ...broccoli, state: 'cart' });
      expect((await shopping.get('shop_broccoli_g'))?.state).toBe('cart');

      await shopping.remove('shop_milk_ml');
      expect((await shopping.list()).map((i) => i.id)).toEqual([
        'shop_broccoli_g',
      ]);

      await shopping.replaceAll([milk]);
      expect((await shopping.list()).map((i) => i.id)).toEqual([
        'shop_milk_ml',
      ]);

      await shopping.clear();
      expect(await shopping.list()).toEqual([]);
    });

    it('RatingsRepository: Sterne (1–5), Merkliste, Validierung und Schutz gegen Prototype-Schlüssel', async () => {
      const { ratings } = setup();

      expect(await ratings.getRating('oven_salmon')).toBeNull();
      expect(await ratings.isSaved('oven_salmon')).toBe(false);
      expect(await ratings.listRatings()).toEqual({});
      expect(await ratings.listSaved()).toEqual([]);

      await ratings.setRating('oven_salmon', 5);
      await ratings.setRating('pho', 4);
      expect(await ratings.getRating('oven_salmon')).toBe(5);
      expect(await ratings.listRatings()).toEqual({
        oven_salmon: 5,
        pho: 4,
      });

      // Ungültige Bewertung ablehnen
      await expect(ratings.setRating('oven_salmon', 6)).rejects.toThrow();
      await expect(ratings.setRating('oven_salmon', 0)).rejects.toThrow();

      // Löschen via null
      await ratings.setRating('pho', null);
      expect(await ratings.getRating('pho')).toBeNull();
      expect(await ratings.listRatings()).toEqual({ oven_salmon: 5 });

      // Merkliste
      await ratings.setSaved('birchermuesli', true);
      await ratings.setSaved('oven_salmon', true);
      expect(await ratings.isSaved('birchermuesli')).toBe(true);
      expect(await ratings.listSaved()).toEqual([
        'birchermuesli',
        'oven_salmon',
      ]);

      await ratings.setSaved('birchermuesli', false);
      expect(await ratings.isSaved('birchermuesli')).toBe(false);
      expect(await ratings.listSaved()).toEqual(['oven_salmon']);

      // Prototype-Schlüssel werden ignoriert
      await ratings.setRating('constructor', 5);
      await ratings.setSaved('__proto__', true);
      expect(await ratings.getRating('constructor')).toBeNull();
      expect(await ratings.isSaved('__proto__')).toBe(false);

      await ratings.clear();
      expect(await ratings.listRatings()).toEqual({});
      expect(await ratings.listSaved()).toEqual([]);
    });
  });
}

runRepositoryContractSuite('Memory*Repository', () => {
  const bundle = createMemoryStorage();
  return {
    bundle,
    teardown: async () => {
      await bundle.settings.clear();
      await bundle.shopping.clear();
      await bundle.ratings.clear();
    },
  };
});

let dbCounter = 0;
runRepositoryContractSuite('Dexie*Repository', () => {
  dbCounter += 1;
  const dbName = `edovita_contract_${dbCounter}_${Date.now()}`;
  const dexieBundle: DexieStorageBundle = createDexieStorage(dbName);
  return {
    bundle: dexieBundle,
    teardown: async () => {
      await dexieBundle.db.delete();
    },
  };
});
