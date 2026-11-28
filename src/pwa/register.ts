import { normalizeBasePath } from './config.ts';

export interface ServiceWorkerLike {
  state?: string;
  postMessage?: (message: unknown) => void;
  addEventListener?: (
    type: string,
    listener: () => void,
    options?: { once?: boolean },
  ) => void;
}

export interface ServiceWorkerRegistrationLike {
  waiting?: ServiceWorkerLike | null;
  installing?: ServiceWorkerLike | null;
  addEventListener?: (type: string, listener: () => void) => void;
}

export interface ServiceWorkerContainerLike {
  controller?: ServiceWorkerLike | null;
  register: (
    scriptURL: string,
    options?: RegistrationOptions,
  ) => Promise<ServiceWorkerRegistrationLike>;
  addEventListener?: (
    type: string,
    listener: () => void,
    options?: { once?: boolean },
  ) => void;
}

export interface RegisterServiceWorkerOptions {
  basePath?: string;
  isProduction?: boolean;
  serviceWorker?: ServiceWorkerContainerLike | null;
  onUpdateAvailable?: (registration: ServiceWorkerRegistrationLike) => void;
}

export type ServiceWorkerRegistrationResult =
  | { status: 'registered'; registration: ServiceWorkerRegistrationLike }
  | { status: 'skipped' }
  | { status: 'unsupported' }
  | { status: 'error' };

export interface PwaUpdateState {
  updateAvailable: boolean;
  isReloading: boolean;
}

export type PwaUpdateListener = (state: PwaUpdateState) => void;

export interface PwaUpdateController {
  getState: () => PwaUpdateState;
  subscribe: (listener: PwaUpdateListener) => () => void;
  attachRegistration: (
    registration: ServiceWorkerRegistrationLike,
    swContainer: ServiceWorkerContainerLike,
  ) => void;
  applyUpdate: () => boolean;
  dismissUpdate: () => void;
  reset: () => void;
}

export function resolveSwUrl(basePath: string): string {
  return `${normalizeBasePath(basePath)}sw.js`;
}

export function resolveSwScope(basePath: string): string {
  return normalizeBasePath(basePath);
}

/**
 * Pure update state machine for the E7b user-confirmed update flow:
 * - Never activates a waiting worker silently.
 * - Exposes `updateAvailable` when a new SW finishes installing while an older
 *   controller is already active (not on first install).
 * - Sends `{ type: 'SKIP_WAITING' }` only when the user clicks "Update now"
 *   and reloads the page at most once via a single `controllerchange` listener.
 */
export function createPwaUpdateController(
  reloadPage: () => void = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
): PwaUpdateController {
  let state: PwaUpdateState = { updateAvailable: false, isReloading: false };
  let waitingRegistration: ServiceWorkerRegistrationLike | null = null;
  let activeContainer: ServiceWorkerContainerLike | null = null;
  const listeners = new Set<PwaUpdateListener>();

  function emit(): void {
    const snapshot: PwaUpdateState = { ...state };
    for (const listener of listeners) {
      listener(snapshot);
    }
  }

  function markUpdateAvailable(
    registration: ServiceWorkerRegistrationLike,
    swContainer: ServiceWorkerContainerLike,
  ): void {
    waitingRegistration = registration;
    activeContainer = swContainer;
    if (!state.updateAvailable) {
      state = { ...state, updateAvailable: true };
      emit();
    }
  }

  function attachRegistration(
    registration: ServiceWorkerRegistrationLike,
    swContainer: ServiceWorkerContainerLike,
  ): void {
    activeContainer = swContainer;

    if (registration.waiting && swContainer.controller) {
      markUpdateAvailable(registration, swContainer);
    }

    registration.addEventListener?.('updatefound', () => {
      const installing = registration.installing;
      if (!installing) {
        return;
      }
      installing.addEventListener?.('statechange', () => {
        if (installing.state === 'installed' && swContainer.controller) {
          markUpdateAvailable(registration, swContainer);
        }
      });
    });
  }

  function applyUpdate(): boolean {
    if (state.isReloading) {
      return false;
    }
    const waiting = waitingRegistration?.waiting;
    if (!waiting || typeof waiting.postMessage !== 'function') {
      return false;
    }

    state = { updateAvailable: false, isReloading: true };
    emit();

    let reloaded = false;
    const handleControllerChange = () => {
      if (reloaded) {
        return;
      }
      reloaded = true;
      reloadPage();
    };

    activeContainer?.addEventListener?.(
      'controllerchange',
      handleControllerChange,
      { once: true },
    );
    waiting.postMessage({ type: 'SKIP_WAITING' });
    return true;
  }

  function dismissUpdate(): void {
    if (!state.updateAvailable) {
      return;
    }
    state = { ...state, updateAvailable: false };
    emit();
  }

  function reset(): void {
    state = { updateAvailable: false, isReloading: false };
    waitingRegistration = null;
    activeContainer = null;
    emit();
  }

  return {
    getState: () => ({ ...state }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    attachRegistration,
    applyUpdate,
    dismissUpdate,
    reset,
  };
}

export const defaultPwaUpdateController = createPwaUpdateController();

/**
 * Registers the Edovita service worker in production builds and connects it
 * to the user-confirmed update controller.
 * Fails gracefully when the Service Worker API is unavailable or blocked
 * (for example in private browsing) without surfacing raw error details (G1).
 */
export async function registerServiceWorker(
  options: RegisterServiceWorkerOptions = {},
  updateController: PwaUpdateController = defaultPwaUpdateController,
): Promise<ServiceWorkerRegistrationResult> {
  const isProduction = options.isProduction ?? true;
  if (!isProduction) {
    return { status: 'skipped' };
  }

  const swContainer =
    options.serviceWorker !== undefined
      ? options.serviceWorker
      : typeof navigator !== 'undefined' && 'serviceWorker' in navigator
        ? (navigator.serviceWorker as unknown as ServiceWorkerContainerLike)
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
    updateController.attachRegistration(registration, swContainer);
    if (registration.waiting && swContainer.controller) {
      options.onUpdateAvailable?.(registration);
    }
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
  updateController: PwaUpdateController = defaultPwaUpdateController,
): void {
  if (options.isProduction === false) {
    return;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (document.readyState === 'complete') {
    void registerServiceWorker(options, updateController);
    return;
  }
  window.addEventListener(
    'load',
    () => {
      void registerServiceWorker(options, updateController);
    },
    { once: true },
  );
}
