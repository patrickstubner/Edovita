import { normalizeBasePath } from './config.ts';

export interface ServiceWorkerContainerLike {
  register: (
    scriptURL: string,
    options?: RegistrationOptions,
  ) => Promise<ServiceWorkerRegistration>;
}

export interface RegisterServiceWorkerOptions {
  basePath?: string;
  isProduction?: boolean;
  serviceWorker?: ServiceWorkerContainerLike | null;
}

export type ServiceWorkerRegistrationResult =
  | { status: 'registered'; registration: ServiceWorkerRegistration }
  | { status: 'skipped' }
  | { status: 'unsupported' }
  | { status: 'error' };

export function resolveSwUrl(basePath: string): string {
  return `${normalizeBasePath(basePath)}sw.js`;
}

export function resolveSwScope(basePath: string): string {
  return normalizeBasePath(basePath);
}

/**
 * Registers the Edovita app-shell service worker in production builds.
 * Fails gracefully when the Service Worker API is unavailable or blocked
 * (for example in private browsing) without surfacing raw error details.
 */
export async function registerServiceWorker(
  options: RegisterServiceWorkerOptions = {},
): Promise<ServiceWorkerRegistrationResult> {
  const isProduction = options.isProduction ?? true;
  if (!isProduction) {
    return { status: 'skipped' };
  }

  const swContainer =
    options.serviceWorker !== undefined
      ? options.serviceWorker
      : typeof navigator !== 'undefined' && 'serviceWorker' in navigator
        ? navigator.serviceWorker
        : null;

  if (!swContainer || typeof swContainer.register !== 'function') {
    return { status: 'unsupported' };
  }

  const basePath = normalizeBasePath(options.basePath ?? '/');
  try {
    const registration = await swContainer.register(resolveSwUrl(basePath), {
      scope: resolveSwScope(basePath),
      updateViaCache: 'none',
    });
    return { status: 'registered', registration };
  } catch {
    return { status: 'error' };
  }
}

/**
 * Defers service worker registration until the document has finished loading
 * so initial page render and navigation are never contended.
 */
export function scheduleServiceWorkerRegistration(
  options: RegisterServiceWorkerOptions = {},
): void {
  if (options.isProduction === false) {
    return;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (document.readyState === 'complete') {
    void registerServiceWorker(options);
    return;
  }
  window.addEventListener(
    'load',
    () => {
      void registerServiceWorker(options);
    },
    { once: true },
  );
}
