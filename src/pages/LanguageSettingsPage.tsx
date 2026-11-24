import { useNavigate } from 'react-router';
import { Icon, Screen } from '../components/index.ts';
import { useI18n } from '../hooks/index.ts';

/**
 * Ausführliche Sprachliste unter `#/profil/sprache` (Prototyp v5.5):
 * Zeigt Gerätesprachen-Erkennung, freigegebene UI-Sprachen und ausgegraute Sprachen
 * («In Prüfung», Rechts-Gate ADR-003).
 */
export function LanguageSettingsPage() {
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

  const detectedMeta = metaFor(detected.code);
  const approvedLangs = uiLanguages.filter((code) => isApproved(code));
  const pendingLangs = uiLanguages.filter((code) => !isApproved(code));

  return (
    <Screen
      header={
        <div className="edo-row">
          <button
            type="button"
            className="edo-back-btn"
            aria-label={t('status.back')}
            onClick={() => navigate('/')}
          >
            <Icon name="left" />
          </button>
          <h1>{t('lang.heading')}</h1>
        </div>
      }
      actions={
        <button
          type="button"
          className="edo-btn edo-btn-secondary"
          onClick={() => navigate('/')}
        >
          <Icon name="home" size="sm" />
          <span>{t('status.back_home')}</span>
        </button>
      }
      actionsLabel={t('profil.sprache.actions_label')}
    >
      <div className="edo-stack">
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
      </div>
    </Screen>
  );
}
