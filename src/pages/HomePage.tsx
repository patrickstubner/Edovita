import { useNavigate } from 'react-router';
import { publicUrl } from '../app/publicBase.ts';
import { Icon, Screen } from '../components/index.ts';
import type { ThemePreference } from '../domain/index.ts';
import { useI18n, useTheme } from '../hooks/index.ts';
import type { UiKey } from '../i18n/index.ts';

const THEME_OPTIONS: ReadonlyArray<{
  value: ThemePreference;
  labelKey: UiKey;
}> = [
  { value: 'system', labelKey: 'theme.option.system' },
  { value: 'light', labelKey: 'theme.option.light' },
  { value: 'dark', labelKey: 'theme.option.dark' },
];

const THEME_NOTE_KEYS: Record<ThemePreference, UiKey> = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
};

/**
 * Startseite der Edovita-App (E0 + E2 Sprachwahl im Prototyp-Stil).
 * Zeigt Logo, erkannte Gerätesprache, freigegebene und ausgegraute Sprachen (Rechts-Gate),
 * Darstellungswahl, Datenschutzhinweise und fixe BottomActions.
 */
export function HomePage() {
  const { preference, effective, setPreference } = useTheme();
  const {
    lang,
    locale,
    detected,
    uiLanguages,
    isApproved,
    metaFor,
    setLang,
    t,
  } = useI18n();
  const navigate = useNavigate();

  const logoSrc =
    effective === 'dark'
      ? publicUrl('/assets/edovita_logo_dark_transparent.svg')
      : publicUrl('/assets/edovita_logo.svg');

  const detectedMeta = metaFor(detected.code);
  const approvedLangs = uiLanguages.filter((code) => isApproved(code));
  const pendingLangs = uiLanguages.filter((code) => !isApproved(code));

  return (
    <Screen
      actions={
        <button
          type="button"
          className="edo-btn"
          onClick={() => navigate('/status')}
        >
          <span>{t('start.weiter')}</span>
          <Icon name="chev" size="sm" />
        </button>
      }
      actionsLabel={t('start.actions_label')}
    >
      <div className="edo-stack">
        <div className="edo-logo-wrap">
          <img
            src={logoSrc}
            alt={t('start.logo_alt')}
            className="edo-logo-img"
            width={150}
            height={142}
          />
        </div>

        <div className="edo-center edo-stack">
          <h1>{t('start.willkommen_bei_edovita')}</h1>
          <p className="edo-sub">{t('start.tagline')}</p>
        </div>

        <div className="edo-banner" data-testid="lang-detect-banner">
          <Icon name="globe" />
          <span className="edo-grow">
            <b>
              {t('lang.detected', {
                name: detectedMeta?.name ?? detected.code,
              })}
            </b>
            <span>
              {t(detected.matched ? 'lang.detected.x' : 'lang.fallback.x', {
                device: detected.device || '–',
              })}
            </span>
          </span>
        </div>

        <section
          className="edo-card"
          aria-label={t('lang.heading')}
          data-testid="lang-list"
        >
          {approvedLangs.map((code) => {
            const m = metaFor(code);
            const isCurrent = code === lang;
            const statusText = m?.reviewed ? t('lang.source') : t('lang.draft');
            return (
              <button
                key={code}
                type="button"
                className={
                  isCurrent
                    ? 'edo-set edo-langrow edo-langrow-cur'
                    : 'edo-set edo-langrow'
                }
                data-lang={code}
                aria-pressed={isCurrent}
                lang={m?.locale ?? code}
                onClick={() => setLang(code)}
              >
                <span className="edo-circ edo-circ-code">
                  {code.toUpperCase()}
                </span>
                <span className="edo-set-tx edo-grow">
                  <b>{m?.name ?? code}</b>
                  <small lang={locale}>
                    {m?.englishName
                      ? `${m.englishName} · ${statusText}`
                      : statusText}
                  </small>
                </span>
                <span
                  className={
                    isCurrent ? 'edo-radio edo-radio-on' : 'edo-radio'
                  }
                  aria-hidden="true"
                />
              </button>
            );
          })}

          {pendingLangs.map((code) => {
            const m = metaFor(code);
            return (
              <div
                key={code}
                className="edo-set edo-langrow edo-langrow-dis"
                data-lang-pending={code}
                aria-disabled="true"
              >
                <span className="edo-circ edo-circ-code">
                  {code.toUpperCase()}
                </span>
                <span className="edo-set-tx edo-grow">
                  <b lang={m?.locale ?? code}>{m?.name ?? code}</b>
                  <small>{t('lang.reason.review')}</small>
                </span>
                <Icon name="lock" size="sm" />
              </div>
            );
          })}
        </section>

        <p className="edo-cap edo-row edo-row-top">
          <Icon name="spark" size="sm" />
          <span className="edo-grow">{t('start.du_kannst_die_sprache')}</span>
        </p>

        <p className="edo-cap">{t('lang.greyed_hint')}</p>

        <section className="edo-card edo-stack" aria-labelledby="theme-heading">
          <h2 id="theme-heading">{t('theme.heading')}</h2>
          <div
            className="edo-segmented"
            role="group"
            aria-label={t('theme.choose')}
          >
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="edo-seg-btn"
                aria-pressed={preference === opt.value}
                onClick={() => setPreference(opt.value)}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          <p className="edo-cap" data-testid="theme-note">
            {t(THEME_NOTE_KEYS[preference])}
          </p>
        </section>

        <section
          className="edo-card edo-card-mint edo-stack"
          aria-labelledby="privacy-heading"
        >
          <h2 id="privacy-heading">{t('datenschutz.heading')}</h2>
          <ul className="edo-list">
            <li className="edo-list-item">
              <span className="edo-icon-badge" aria-hidden="true">
                <Icon name="shield" size="sm" />
              </span>
              <span className="edo-sub">{t('datenschutz.kein_konto')}</span>
            </li>
            <li className="edo-list-item">
              <span className="edo-icon-badge" aria-hidden="true">
                <Icon name="lock" size="sm" />
              </span>
              <span className="edo-sub">{t('datenschutz.gehoeren_dir')}</span>
            </li>
          </ul>
        </section>
      </div>
    </Screen>
  );
}
