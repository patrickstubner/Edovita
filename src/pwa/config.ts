/**
 * App-shell caching rules for the Edovita service worker (E7a, ADR-001, ADR-004).
 *
 * Strictly whitelists same-origin HTML, JS, and CSS app-shell assets only.
 * Never allows images (reserved for E7b), API responses, user data,
 * IndexedDB/Dexie content, query parameters on assets, or hash fragments.
 */

export const PWA_CACHE_PREFIX = 'edovita-shell-';

const SAFE_VERSION_RE = /^[0-9A-Za-z._-]+$/;
const SAFE_HASH_RE = /^[0-9a-f]{8,64}$/i;
const SHELL_ASSET_RE = /^static\/(?:js|css)\/[A-Za-z0-9._-]+\.(?:js|css)$/;

export function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export function buildCacheName(appVersion: string, buildHash: string): string {
  const version = appVersion.trim();
  const hash = buildHash.trim().toLowerCase();
  if (!SAFE_VERSION_RE.test(version)) {
    throw new Error('Invalid app version for service worker cache name.');
  }
  if (!SAFE_HASH_RE.test(hash)) {
    throw new Error('Invalid build hash for service worker cache name.');
  }
  return `${PWA_CACHE_PREFIX}v${version}-${hash}`;
}

export function isObsoleteEdovitaCache(
  cacheName: string,
  currentCacheName: string,
): boolean {
  return (
    cacheName.startsWith(PWA_CACHE_PREFIX) && cacheName !== currentCacheName
  );
}

/**
 * Returns true if and only if `pathname` is a same-origin app-shell HTML, JS,
 * or CSS asset within `basePath`. Rejects images, JSON, manifests, API paths,
 * path traversal, query strings, and hash fragments.
 */
export function isAppShellAssetPath(
  pathname: string,
  basePath: string,
): boolean {
  if (
    !pathname ||
    pathname.includes('?') ||
    pathname.includes('#') ||
    pathname.includes('..') ||
    pathname.includes('\\')
  ) {
    return false;
  }
  const base = normalizeBasePath(basePath);
  if (!pathname.startsWith(base)) {
    return false;
  }
  const relative = pathname.slice(base.length);
  if (relative === '' || relative === 'index.html' || relative === 'theme-init.js') {
    return true;
  }
  return SHELL_ASSET_RE.test(relative);
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
