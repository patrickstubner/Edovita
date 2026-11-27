/**
 * PWA layer (E7a, ADR-001, ADR-004).
 * Provides the web app manifest builder, app-shell service worker skeleton,
 * cache whitelist helpers, and production registration helper.
 */
export const PWA_LAYER_VERSION = 1;

export {
  PWA_CACHE_PREFIX,
  buildCacheName,
  filterAppShellPaths,
  isAppShellAssetPath,
  isObsoleteEdovitaCache,
  normalizeBasePath,
  resolveShellCacheLookup,
  type ShellRequestLike,
} from './config.ts';

export {
  PWA_BACKGROUND_COLOR,
  PWA_ICON_FILES,
  PWA_THEME_COLOR,
  buildWebManifest,
  type WebAppManifest,
  type WebAppManifestIcon,
} from './manifest.ts';

export {
  registerServiceWorker,
  resolveSwScope,
  resolveSwUrl,
  scheduleServiceWorkerRegistration,
  type RegisterServiceWorkerOptions,
  type ServiceWorkerContainerLike,
  type ServiceWorkerRegistrationResult,
} from './register.ts';

export {
  generateServiceWorkerScript,
  type ServiceWorkerBuildConfig,
} from './swScript.ts';
