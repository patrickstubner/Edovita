/**
 * App-shell, thumbnail precache, and bounded runtime full-image cache rules
 * for the Edovita service worker (E7a + E7b, ADR-001, ADR-004).
 *
 * Strictly whitelists same-origin static assets only.
 * Never caches user data, IndexedDB/Dexie content, API responses,
 * non-GET requests, cross-origin requests, query-string assets, or #import fragments.
 */

export const PWA_CACHE_PREFIX = 'edovita-shell-';
export const PWA_THUMBS_CACHE_PREFIX = 'edovita-thumbs-';
export const PWA_IMAGES_CACHE_PREFIX = 'edovita-images-';

export const PWA_CACHE_PREFIXES = [
  PWA_CACHE_PREFIX,
  PWA_THUMBS_CACHE_PREFIX,
  PWA_IMAGES_CACHE_PREFIX,
] as const;

/** Maximum number of full-size recipe WebP images stored in the runtime cache. */
export const MAX_RUNTIME_IMAGE_ENTRIES = 60;

/**
 * Static public assets precached with the app shell so installability metadata,
 * icons, and app logos work fully offline (for both `/` and `/Edovita/`).
 */
export const SHELL_PRECACHE_STATIC_FILES = [
  'manifest.webmanifest',
  'favicon.ico',
  'theme-init.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-192.png',
  'icons/maskable-512.png',
  'icons/favicon-16.png',
  'icons/favicon-32.png',
  'icons/favicon-48.png',
  'icons/apple-touch-icon-180.png',
  'assets/edovita_appicon.svg',
  'assets/edovita_logo.svg',
  'assets/edovita_logo_dark_transparent.svg',
] as const;

const SAFE_VERSION_RE = /^[0-9A-Za-z._-]+$/;
const SAFE_HASH_RE = /^[0-9a-f]{8,64}$/i;
/** Allows nested subfolders such as `static/js/async/<chunk>.js` (E7a L2). */
const SHELL_ASSET_RE =
  /^static\/(?:js|css)\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+\.(?:js|css)$/;
const RECIPE_THUMB_RE =
  /^static\/image\/[a-z0-9_]+-thumb(?:\.[0-9a-f]+)?\.webp$/;
const RECIPE_FULL_IMAGE_RE =
  /^static\/image\/[a-z0-9_]+(?:\.[0-9a-f]+)?\.webp$/;

const SHELL_STATIC_FILE_SET: ReadonlySet<string> = new Set(
  SHELL_PRECACHE_STATIC_FILES,
);

export interface PwaCacheNames {
  shell: string;
  thumbs: string;
  images: string;
}

export function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function validateCacheParts(appVersion: string, buildHash: string): {
  version: string;
  hash: string;
} {
  const version = appVersion.trim();
  const hash = buildHash.trim().toLowerCase();
  if (!SAFE_VERSION_RE.test(version)) {
    throw new Error('Invalid app version for service worker cache name.');
  }
  if (!SAFE_HASH_RE.test(hash)) {
    throw new Error('Invalid build hash for service worker cache name.');
  }
  return { version, hash };
}

export function buildCacheName(appVersion: string, buildHash: string): string {
  const { version, hash } = validateCacheParts(appVersion, buildHash);
  return `${PWA_CACHE_PREFIX}v${version}-${hash}`;
}

export function buildCacheNames(
  appVersion: string,
  buildHash: string,
): PwaCacheNames {
  const { version, hash } = validateCacheParts(appVersion, buildHash);
  return {
    shell: `${PWA_CACHE_PREFIX}v${version}-${hash}`,
    thumbs: `${PWA_THUMBS_CACHE_PREFIX}v${version}-${hash}`,
    images: `${PWA_IMAGES_CACHE_PREFIX}v${version}-${hash}`,
  };
}

export function isEdovitaCacheName(cacheName: string): boolean {
  return PWA_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
}

export function isObsoleteEdovitaCache(
  cacheName: string,
  activeCacheNames: string | readonly string[] | ReadonlySet<string>,
): boolean {
  if (!isEdovitaCacheName(cacheName)) {
    return false;
  }
  if (typeof activeCacheNames === 'string') {
    return cacheName !== activeCacheNames;
  }
  if (Array.isArray(activeCacheNames)) {
    return !activeCacheNames.includes(cacheName);
  }
  return !(activeCacheNames as ReadonlySet<string>).has(cacheName);
}

function extractSafeRelativePath(
  pathname: string,
  basePath: string,
): string | null {
  if (
    !pathname ||
    pathname.includes('?') ||
    pathname.includes('#') ||
    pathname.includes('..') ||
    pathname.includes('\\')
  ) {
    return null;
  }
  const base = normalizeBasePath(basePath);
  if (!pathname.startsWith(base)) {
    return null;
  }
  return pathname.slice(base.length);
}

/**
 * Returns true if and only if `pathname` is a whitelisted app-shell asset
 * (HTML, JS/CSS incl. `async/` chunks, manifest, icons, or app logos) within `basePath`.
 */
export function isAppShellAssetPath(
  pathname: string,
  basePath: string,
): boolean {
  const relative = extractSafeRelativePath(pathname, basePath);
  if (relative === null) {
    return false;
  }
  if (
    relative === '' ||
    relative === 'index.html' ||
    SHELL_STATIC_FILE_SET.has(relative)
  ) {
    return true;
  }
  return SHELL_ASSET_RE.test(relative);
}

/**
 * Returns true if and only if `pathname` is a recipe thumbnail (`*-thumb*.webp`)
 * emitted under `static/image/` within `basePath`.
 */
export function isRecipeThumbPath(
  pathname: string,
  basePath: string,
): boolean {
  const relative = extractSafeRelativePath(pathname, basePath);
  if (relative === null) {
    return false;
  }
  return RECIPE_THUMB_RE.test(relative);
}

/**
 * Returns true if and only if `pathname` is a full-size recipe WebP image
 * (NOT `-thumb`) emitted under `static/image/` within `basePath`.
 */
export function isFullRecipeImagePath(
  pathname: string,
  basePath: string,
): boolean {
  const relative = extractSafeRelativePath(pathname, basePath);
  if (relative === null) {
    return false;
  }
  if (RECIPE_THUMB_RE.test(relative)) {
    return false;
  }
  return RECIPE_FULL_IMAGE_RE.test(relative);
}

export function filterAppShellPaths(
  candidates: readonly string[],
  basePath: string,
): string[] {
  const base = normalizeBasePath(basePath);
  const unique = new Set<string>();
  for (const candidate of candidates) {
    if (isAppShellAssetPath(candidate, base)) {
      unique.add(candidate);
    }
  }
  return Array.from(unique).sort();
}

export function filterRecipeThumbPaths(
  candidates: readonly string[],
  basePath: string,
): string[] {
  const base = normalizeBasePath(basePath);
  const unique = new Set<string>();
  for (const candidate of candidates) {
    if (isRecipeThumbPath(candidate, base)) {
      unique.add(candidate);
    }
  }
  return Array.from(unique).sort();
}

export interface ShellRequestLike {
  method: string;
  url: string;
  mode?: string;
}

/**
 * Resolves the canonical precached app-shell pathname for an incoming request,
 * or returns `null` if the request must not be served from the shell cache.
 */
export function resolveShellCacheLookup(
  request: ShellRequestLike,
  origin: string,
  shellPaths: ReadonlySet<string>,
  basePath: string,
): string | null {
  if (request.method !== 'GET') {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(request.url, origin);
  } catch {
    return null;
  }
  if (parsed.origin !== origin) {
    return null;
  }
  const base = normalizeBasePath(basePath);
  const indexPath = `${base}index.html`;
  if (
    parsed.pathname.startsWith('/api/') ||
    parsed.pathname.startsWith(`${base}api/`)
  ) {
    return null;
  }
  if (request.mode === 'navigate') {
    if (parsed.pathname === base || parsed.pathname === indexPath) {
      return shellPaths.has(indexPath) ? indexPath : null;
    }
    return null;
  }
  if (parsed.search !== '') {
    return null;
  }
  if (
    isAppShellAssetPath(parsed.pathname, base) &&
    shellPaths.has(parsed.pathname)
  ) {
    return parsed.pathname;
  }
  return null;
}
