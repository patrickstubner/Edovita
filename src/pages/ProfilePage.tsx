import { useNavigate } from 'react-router';
import { Icon, Screen } from '../components/index.ts';
import { useI18n } from '../hooks/index.ts';

/**
 * Profil-Einstiegsseite (`#/profil`, Issue #34 / Prototyp v5.10):
 * Bietet den direkten Zugang zu `#/profil/sprache` (Zeile «Sprache» mit Globus,
 * aktuellem Sprachnamen und Chevron). Kein Demo-Abschnitt für noch fehlende Screens.
 */
export function ProfilePage() {
  const { lang, meta, t } = useI18n();
  const navigate = useNavigate();

  return (
    <Screen header={<h1>{t('profil.profil')}</h1>}>
      <div className="edo-stack">
        <section className="edo-card" aria-label={t('profil.profil')}>
          <button
            type="button"
            className="edo-set edo-langrow"
            data-testid="profil-sprache-btn"
            onClick={() => navigate('/profil/sprache')}
          >
            <span className="edo-circ" aria-hidden="true">
              <Icon name="globe" />
            </span>
            <span className="edo-set-tx edo-grow">
              <b>{t('profil.sprache')}</b>
              <small>{meta.name || lang.toUpperCase()}</small>
            </span>
            <span className="edo-set-chev" aria-hidden="true">
              <Icon name="chev" />
            </span>
          </button>
        </section>
      </div>
    </Screen>
  );
}
