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
 * Startseite der Edovita-App (Prototyp v5.5):
 * Keine ausführliche Sprachliste mehr auf der Startseite (diese liegt unter `#/profil/sprache`);
 * stattdessen sitzt der kompakte Sprachumschalter oben rechts auf allen Screens.
 */
export function HomePage() {
  const { preference, effective, setPreference } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();

  const logoSrc =
    effective === 'dark'
      ? publicUrl('/assets/edovita_logo_dark_transparent.svg')
      : publicUrl('/assets/edovita_logo.svg');

  return (
    <Screen
      actions={
        <>
          <button
            type="button"
            className="edo-btn"
            onClick={() => navigate('/rezepte')}
          >
            <Icon name="utensils" size="sm" />
            <span>{t('rezepte.rezepte')}</span>
          </button>
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            onClick={() => navigate('/status')}
          >
            <span>{t('start.weiter')}</span>
            <Icon name="chev" size="sm" />
          </button>
        </>
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
