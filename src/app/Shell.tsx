import { useContext, useEffect, useMemo } from 'react';
import { Outlet } from 'react-router';
import {
  Icon,
  IconSprite,
  LangSwitcher,
  type LangSwitcherOption,
} from '../components/index.ts';
import { useI18n } from '../hooks/index.ts';
import { RatingsContext } from './RatingsProvider.tsx';
import { SettingsContext } from './SettingsProvider.tsx';
import { ShoppingContext } from './ShoppingProvider.tsx';
import type { StorageErrorCode } from './storageError.ts';

/**
 * App-Shell: Handy-Container (max. 480 px), synchronisiert `--edo-app-h`
 * mit `visualViewport`, damit die fixe Aktionsleiste auch bei geöffneter Tastatur
 * sichtbar bleibt (Muster aus Prototyp v5.4).
 * Zeigt oben rechts (in RTL oben links) den kompakten Sprachumschalter auf jedem Screen
 * (Prototyp v5.5) und bei Speicherfehlern nur eine generische Meldung (G1).
 */
export function Shell() {
  const { lang, meta, uiLanguages, isApproved, metaFor, setLang, t } =
    useI18n();
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

  const langOptions = useMemo<readonly LangSwitcherOption[]>(() => {
    return uiLanguages
      .filter((code) => isApproved(code))
      .map((code) => {
        const m = metaFor(code);
        return {
          code,
          name: m?.name ?? code.toUpperCase(),
          locale: m?.locale ?? code,
        };
      });
  }, [isApproved, metaFor, uiLanguages]);

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
    <main id="app" className="edo-app-shell has-lang-switch">
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
      <LangSwitcher
        currentCode={lang}
        options={langOptions}
        buttonLabel={t('lang.switch.current', {
          name: meta.name || lang.toUpperCase(),
        })}
        menuLabel={t('lang.switch')}
        onSelect={setLang}
      />
    </main>
  );
}
