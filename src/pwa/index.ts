/**
 * PWA layer (E7a + E7b, ADR-001, ADR-004).
 * Provides the web app manifest builder, offline service worker generator
 * (app shell + thumbnails precache + bounded runtime full-image cache),
 * user-confirmed update controller, runtime/build kill switch, and registration helper.
 */
export const PWA_LAYER_VERSION = 2;

export {
  MAX_RUNTIME_IMAGE_ENTRIES,
  PWA_CACHE_PREFIX,
  PWA_CACHE_PREFIXES,
  PWA_IMAGES_CACHE_PREFIX,
  PWA_THUMBS_CACHE_PREFIX,
  SHELL_PRECACHE_STATIC_FILES,
  buildCacheName,
  buildCacheNames,
  filterAppShellPaths,
  filterRecipeThumbPaths,
  isAppShellAssetPath,
  isEdovitaCacheName,
  isFullRecipeImagePath,
  isObsoleteEdovitaCache,
  isRecipeThumbPath,
  normalizeBasePath,
  resolveShellCacheLookup,
  type PwaCacheNames,
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
  runPwaKillSwitch,
  type KillSwitchCacheStorageLike,
  type KillSwitchRegistrationLike,
  type KillSwitchSwContainerLike,
  type PwaKillSwitchOptions,
  type PwaKillSwitchResult,
} from './killSwitch.ts';

export {
  createPwaUpdateController,
  defaultPwaUpdateController,
  registerServiceWorker,
  resolveSwScope,
  resolveSwUrl,
  scheduleServiceWorkerRegistration,
  type PwaUpdateController,
  type PwaUpdateListener,
  type PwaUpdateState,
  type RegisterServiceWorkerOptions,
  type ServiceWorkerContainerLike,
  type ServiceWorkerLike,
  type ServiceWorkerRegistrationLike,
  type ServiceWorkerRegistrationResult,
} from './register.ts';

export {
  generateKillSwitchServiceWorkerScript,
  generateServiceWorkerScript,
  type ServiceWorkerBuildConfig,
} from './swScript.ts';
