import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Icon, IconSprite } from '../components/index.ts';
import { useI18n } from '../hooks/index.ts';
import { RatingsContext } from './RatingsProvider.tsx';
import { SettingsContext } from './SettingsProvider.tsx';
import { ShoppingContext } from './ShoppingProvider.tsx';
import type { StorageErrorCode } from './storageError.ts';

/**
 * App-Shell: Handy-Container (max. 480 px), synchronisiert `--edo-app-h`
 * mit `visualViewport`, damit die fixe Aktionsleiste auch bei geöffneter Tastatur
 * sichtbar bleibt (Muster aus Prototyp v5.4). Zeigt bei Speicherfehlern nur eine
 * generische, übersetzte Meldung ohne Rohdaten oder Stacktrace (G1).
 */
export function Shell() {
  const { t } = useI18n();
  const settingsCtx = useContext(SettingsContext);
  const shoppingCtx = useContext(ShoppingContext);
  const ratingsCtx = useContext(RatingsContext);

  const activeError: StorageErrorCode | null =
    settingsCtx?.error ?? shoppingCtx?.error ?? ratingsCtx?.error ?? null;

  const dismissAllErrors = () => {
    settingsCtx?.clearError();
    shoppingCtx?.clearError();
    ratingsCtx?.clearError();
  };

  useEffect(() => {
    const syncHeight = () => {
      const vv = window.visualViewport;
      const height = vv ? Math.round(vv.height) : window.innerHeight;
      if (height > 0) {
        document.documentElement.style.setProperty('--edo-app-h', `${height}px`);
      }
    };

    syncHeight();
    window.addEventListener('resize', syncHeight);
    window.visualViewport?.addEventListener('resize', syncHeight);
    window.visualViewport?.addEventListener('scroll', syncHeight);

    return () => {
      window.removeEventListener('resize', syncHeight);
      window.visualViewport?.removeEventListener('resize', syncHeight);
      window.visualViewport?.removeEventListener('scroll', syncHeight);
    };
  }, []);

  return (
    <main id="app" className="edo-app-shell">
      <IconSprite />
      {activeError ? (
        <div
          className="edo-storage-alert"
          role="alert"
          data-testid="storage-error-banner"
        >
          <Icon name="alert" size="sm" />
          <span className="edo-grow">{t(activeError)}</span>
          <button
            type="button"
            className="edo-storage-alert-close"
            aria-label={t('storage.error.dismiss')}
            onClick={dismissAllErrors}
          >
            <Icon name="x" size="sm" />
          </button>
        </div>
      ) : null}
      <Outlet />
    </main>
  );
}
