export type BrandId = 'migros' | 'coop' | 'lidl' | 'aldi' | 'denner' | 'spar';
export type StoreRegionCode = 'CH' | 'DE' | 'AT' | 'IT' | 'ES' | 'FR' | 'PT';

export interface StoreBrandInfo {
  readonly id: BrandId;
  readonly stores: readonly StoreRegionCode[];
  readonly lines: readonly string[];
}

/**
 * Beschreibende Hausmarken-Beispiele gemäss Prototyp (`prototype/data/v1-data.js`).
 * Keine Logos, keine Partnerschaften, keine Preise.
 */
export const STORE_BRANDS: readonly StoreBrandInfo[] = [
  {
    id: 'migros',
    stores: ['CH'],
    lines: ['M-Budget', 'Migros Bio', 'Sélection'],
  },
  {
    id: 'coop',
    stores: ['CH'],
    lines: ['Prix Garantie', 'Naturaplan', 'Fine Food'],
  },
  {
    id: 'lidl',
    stores: ['CH', 'DE', 'AT', 'IT', 'ES', 'FR', 'PT'],
    lines: ['Freeway', 'Bellasan', 'Milbona'],
  },
  {
    id: 'aldi',
    stores: ['CH', 'DE', 'AT', 'ES', 'FR', 'PT'],
    lines: ['GutBio', 'Milsani', "Nature's"],
  },
  {
    id: 'denner',
    stores: ['CH'],
    lines: ['Denner'],
  },
  {
    id: 'spar',
    stores: ['AT', 'IT', 'ES', 'PT'],
    lines: ['S-Budget', 'Spar Natur*pur'],
  },
];
