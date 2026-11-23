import { useNavigate } from 'react-router';
import { Icon, Screen } from '../components/index.ts';
import { useI18n } from '../hooks/index.ts';

/**
 * Zweite Route (#/status) zur Prüfung von Hash-Router und Zurück-Navigation in E0.
 * Vor Release entfernen (Dev-/Platzhaltertexte); siehe STATUS.md.
 */
export function StatusPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

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
          <h1>{t('status.title')}</h1>
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
      actionsLabel={t('status.actions_label')}
    >
      <div className="edo-stack">
        <section className="edo-card edo-stack">
          <h2>{t('status.ready_title')}</h2>
          <p className="edo-sub">{t('status.ready_body')}</p>
        </section>

        <section className="edo-card edo-stack">
          <h2>{t('status.planned_title')}</h2>
          <ul className="edo-list">
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">{t('status.planned.catalog')}</span>
            </li>
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">{t('status.planned.i18n')}</span>
            </li>
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">{t('status.planned.shopping')}</span>
            </li>
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">{t('status.planned.offline')}</span>
            </li>
          </ul>
        </section>
      </div>
    </Screen>
  );
}
