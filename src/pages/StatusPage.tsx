import { useNavigate } from 'react-router';
import { Icon, Screen } from '../components/index.ts';

/**
 * Zweite Route (#/status) zur Prüfung von Hash-Router und Zurück-Navigation in E0.
 */
export function StatusPage() {
  const navigate = useNavigate();

  return (
    <Screen
      header={
        <div className="edo-row">
          <button
            type="button"
            className="edo-back-btn"
            aria-label="Zurück"
            onClick={() => navigate('/')}
          >
            <Icon name="left" />
          </button>
          <h1>Grundgerüst E0</h1>
        </div>
      }
      actions={
        <button
          type="button"
          className="edo-btn edo-btn-secondary"
          onClick={() => navigate('/')}
        >
          <Icon name="home" size="sm" />
          <span>Zurück zur Startseite</span>
        </button>
      }
      actionsLabel="Projektstand Aktionen"
    >
      <div className="edo-stack">
        <section className="edo-card edo-stack">
          <h2>Aktive Leitplanken</h2>
          <p className="edo-sub">
            Schichten nach ADR-001 (dependency-cruiser), logische CSS-Regeln für
            RTL, strikte CSP und Rstest als Testrunner (ADR-006).
          </p>
        </section>

        <section className="edo-card edo-stack">
          <h2>Nächste Schritte</h2>
          <ul className="edo-list">
            <li className="edo-list-item">
              <Icon name="check" size="sm" />
              <span className="edo-sub">E1: Domäne, Lebensmittel-Katalog und Rezepte</span>
            </li>
            <li className="edo-list-item">
              <Icon name="check" size="sm" />
              <span className="edo-sub">E2: i18n-Laufzeit und Sprach-Registry</span>
            </li>
            <li className="edo-list-item">
              <Icon name="check" size="sm" />
              <span className="edo-sub">E3: Lokale Speicherung mit Dexie</span>
            </li>
            <li className="edo-list-item">
              <Icon name="check" size="sm" />
              <span className="edo-sub">E4–E6: Rezept-Detail, Einkaufsliste &amp; Zweitsprache</span>
            </li>
          </ul>
        </section>
      </div>
    </Screen>
  );
}
