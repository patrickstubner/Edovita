import type { RecipeId, Settings, ShoppingItem } from '../domain/index.ts';

/**
 * Austauschbare Repository-Schnittstellen pro Fachbereich (ADR-002).
 * Implementierungen: Dexie* (Web/PWA), Memory* (Tests), später Sqlite* (Capacitor).
 */

export interface SettingsRepository {
  get(): Promise<Settings>;
  set(next: Settings): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<Settings>;
  clear(): Promise<void>;
}

export interface ShoppingRepository {
  list(): Promise<ShoppingItem[]>;
  get(id: string): Promise<ShoppingItem | undefined>;
  upsert(item: ShoppingItem): Promise<ShoppingItem>;
  replaceAll(items: readonly ShoppingItem[]): Promise<ShoppingItem[]>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface RatingsRepository {
  getRating(recipeId: RecipeId | string): Promise<number | null>;
  setRating(recipeId: RecipeId | string, stars: number | null): Promise<void>;
  listRatings(): Promise<Record<string, number>>;
  isSaved(recipeId: RecipeId | string): Promise<boolean>;
  setSaved(recipeId: RecipeId | string, saved: boolean): Promise<void>;
  listSaved(): Promise<RecipeId[]>;
  clear(): Promise<void>;
}

export interface StorageBundle {
  readonly settings: SettingsRepository;
  readonly shopping: ShoppingRepository;
  readonly ratings: RatingsRepository;
  close?: () => void;
}
