import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  Icon,
  IconSprite,
  LangSwitcher,
  SecondLangSwitcher,
  TabBar,
  Toast,
  type LangSwitcherOption,
  type SecondLangOptionValue,
  type SecondLangSwitcherOption,
  type TabBarItem,
} from '../components/index.ts';
import { useI18n, useSecondLang } from '../hooks/index.ts';
import {
  VISIBLE_NAV_TABS,
  resolveActiveNavTab,
  resolveNavTabPath,
  type NavTabId,
} from './navigation.ts';
import { PlanContext } from './PlanProvider.tsx';
import { RatingsContext } from './RatingsProvider.tsx';
import { SettingsContext } from './SettingsProvider.tsx';
import { ShoppingContext } from './ShoppingProvider.tsx';
import type { StorageErrorCode } from './storageError.ts';

type OpenHeaderMenu = 'ui' | 'second' | null;

/**
 * App-Shell: Handy-Container (max. 480 px), synchronisiert `--edo-app-h`
 * mit `visualViewport`, damit die fixe Aktionsleiste auch bei geöffneter Tastatur
 * sichtbar bleibt (Muster aus Prototyp v5.4).
 * Zeigt oben rechts (in RTL oben links) die beiden kompakten Sprachumschalter
 * (`SecondLangSwitcher` links neben `LangSwitcher`, nur ein Menü gleichzeitig offen;
 * Prototyp v5.5–v5.10), unten die Hauptnavigation (`TabBar`, Prototyp v5.10 / E9)
 * und bei Speicherfehlern nur eine generische Meldung (G1).
 */
export function Shell() {
  const { lang, meta, uiLanguages, isApproved, metaFor, setLang, t } =
    useI18n();
  const {
    setting: secondSetting,
    effective: secondEffective,
    autoCode: secondAutoCode,
    isAuto: secondIsAuto,
    secondaryLanguages,
    metaFor: secondMetaFor,
    setSecondLang,
  } = useSecondLang();
  const location = useLocation();
  const navigate = useNavigate();
  const settingsCtx = useContext(SettingsContext);
  const shoppingCtx = useContext(ShoppingContext);
  const ratingsCtx = useContext(RatingsContext);
  const planCtx = useContext(PlanContext);

  const [activeMenu, setActiveMenu] = useState<OpenHeaderMenu>(null);
  const [sameToast, setSameToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const activeError: StorageErrorCode | null =
    settingsCtx?.error ??
    shoppingCtx?.error ??
    ratingsCtx?.error ??
    planCtx?.error ??
    null;

  const dismissAllErrors = () => {
    settingsCtx?.clearError();
    shoppingCtx?.clearError();
    ratingsCtx?.clearError();
    planCtx?.clearError();
  };

  const activeNavTab = resolveActiveNavTab(location.pathname);

  const tabItems = useMemo<readonly TabBarItem<NavTabId>[]>(
    () =>
      VISIBLE_NAV_TABS.map((tab) => ({
        id: tab.id,
        path: tab.path,
        icon: tab.icon,
        label: t(tab.labelKey),
      })),
    [t],
  );

  const handleSelectTab = useCallback(
    (tabId: NavTabId) => {
      const target = resolveNavTabPath(tabId);
      if (!target) return;
      setActiveMenu(null);
      void navigate(target);
    },
    [navigate],
  );

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

  const secondOptions = useMemo<readonly SecondLangSwitcherOption[]>(() => {
    const autoLabel = secondAutoCode
      ? t('second.auto.current', { code: secondAutoCode.toUpperCase() })
      : t('second.auto.none');
    const autoLocale = secondAutoCode
      ? secondMetaFor(secondAutoCode)?.locale
      : undefined;

    const list: SecondLangSwitcherOption[] = [
      {
        value: 'auto',
        label: autoLabel,
        flagCode: secondAutoCode,
        locale: autoLocale,
        selected: secondIsAuto,
      },
      {
        value: 'none',
        label: t('second.none'),
        flagCode: null,
        selected: secondSetting === 'none',
      },
    ];

    for (const code of secondaryLanguages) {
      if (code === lang) continue;
      const m = secondMetaFor(code);
      list.push({
        value: code,
        label: m?.name ?? code.toUpperCase(),
        flagCode: code,
        locale: m?.locale ?? code,
        showCodeBadge: true,
        selected: secondSetting === code,
      });
    }

    return list;
  }, [
    lang,
    secondAutoCode,
    secondIsAuto,
    secondMetaFor,
    secondSetting,
    secondaryLanguages,
    t,
  ]);

  const secondButtonLabel = useMemo(() => {
    if (secondEffective && secondIsAuto) {
      return t('second.auto.current', { code: secondEffective.toUpperCase() });
    }
    if (secondEffective) {
      return t('second.label.current', {
        name: secondMetaFor(secondEffective)?.name ?? secondEffective,
      });
    }
    if (secondIsAuto) {
      return t('second.auto.none');
    }
    return t('second.label.none');
  }, [secondEffective, secondIsAuto, secondMetaFor, t]);

  const handleSelectSecond = useCallback(
    (value: SecondLangOptionValue) => {
      const outcome = setSecondLang(value);
      if (outcome === 'same') {
        if (toastTimerRef.current !== null) {
          clearTimeout(toastTimerRef.current);
        }
        setSameToast(t('second.same'));
        toastTimerRef.current = setTimeout(() => {
          setSameToast(null);
          toastTimerRef.current = null;
        }, 3200);
      }
    },
    [setSecondLang, t],
  );

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
    <main id="app" className="edo-app-shell has-lang-switch has-tab">
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
      <TabBar
        items={tabItems}
        activeId={activeNavTab}
        ariaLabel={t('nav.hauptnavigation')}
        onSelect={handleSelectTab}
      />
      <div
        id="langBackdrop"
        className="edo-lang-backdrop"
        hidden={activeMenu === null}
        onClick={() => setActiveMenu(null)}
        data-testid="lang-switch-backdrop"
      />
      <SecondLangSwitcher
        effectiveCode={secondEffective}
        options={secondOptions}
        buttonLabel={secondButtonLabel}
        menuLabel={t('second.label')}
        open={activeMenu === 'second'}
        onOpenChange={(next) => setActiveMenu(next ? 'second' : null)}
        hideBackdrop
        onSelect={handleSelectSecond}
      />
      <LangSwitcher
        currentCode={lang}
        options={langOptions}
        buttonLabel={t('lang.switch.current', {
          name: meta.name || lang.toUpperCase(),
        })}
        menuLabel={t('lang.switch')}
        open={activeMenu === 'ui'}
        onOpenChange={(next) => setActiveMenu(next ? 'ui' : null)}
        hideBackdrop
        onSelect={setLang}
      />
      <Toast message={sameToast} />
    </main>
  );
}
