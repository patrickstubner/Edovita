import { RECIPE_IMAGES } from '../../content/generated/catalog-index.ts';
import {
  RECIPE_ID_RE,
  isSafeRecordKey,
  type Recipe,
  type RecipeId,
  type RecipeImageAssets,
  type RecipeImageKind,
  type RecipePhoto,
} from '../domain/index.ts';

function resolveRecipeImageKey(
  recipeOrId: Recipe | RecipeId | string,
): string | null {
  const raw =
    typeof recipeOrId === 'string'
      ? recipeOrId
      : (recipeOrId.image ?? recipeOrId.id);
  if (
    typeof raw !== 'string' ||
    !RECIPE_ID_RE.test(raw) ||
    !isSafeRecordKey(raw)
  ) {
    return null;
  }
  return raw;
}

/**
 * Prüft ausschliesslich gegen den statischen Whitelist-Index `RECIPE_IMAGES` (eigene Schlüssel),
 * ob für das Rezept ein lokal gebündeltes Foto vorliegt (Issue #33, keine freien Pfade).
 */
export function hasRecipePhoto(
  recipeOrId: Recipe | RecipeId | string,
  imageMap: Readonly<Record<string, RecipeImageAssets>> = RECIPE_IMAGES,
): boolean {
  const key = resolveRecipeImageKey(recipeOrId);
  return key !== null && Object.hasOwn(imageMap, key);
}

/**
 * Löst das lokal gebündelte Rezeptfoto (Vollbild oder Miniatur) ausschliesslich über die
 * feste Whitelist auf. Ohne Eintrag wird `null` zurückgegeben (UI zeigt Platzhalter).
 */
export function getRecipePhoto(
  recipeOrId: Recipe | RecipeId | string,
  kind: RecipeImageKind = 'full',
  imageMap: Readonly<Record<string, RecipeImageAssets>> = RECIPE_IMAGES,
): RecipePhoto | null {
  const key = resolveRecipeImageKey(recipeOrId);
  if (key === null || !Object.hasOwn(imageMap, key)) {
    return null;
  }
  const assets = imageMap[key];
  if (!assets) {
    return null;
  }
  if (kind === 'thumb') {
    return {
      src: assets.thumb,
      width: assets.thumbWidth,
      height: assets.thumbHeight,
    };
  }
  return {
    src: assets.full,
    width: assets.width,
    height: assets.height,
  };
}
