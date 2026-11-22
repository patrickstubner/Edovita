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
          <h1>Übersicht</h1>
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
      actionsLabel="Übersicht Aktionen"
    >
      <div className="edo-stack">
        <section className="edo-card edo-stack">
          <h2>Bereit für den Aufbau</h2>
          <p className="edo-sub">
            Das Grundgerüst steht. Die Funktionen der App werden Schritt für
            Schritt ergänzt.
          </p>
        </section>

        <section className="edo-card edo-stack">
          <h2>Geplante Bereiche</h2>
          <ul className="edo-list">
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">Lebensmittel-Katalog und Rezepte</span>
            </li>
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">Mehrsprachigkeit und Zweitsprache</span>
            </li>
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">
                Einkaufsliste mit den Zuständen offen, im Korb und zu Hause
              </span>
            </li>
            <li className="edo-list-item">
              <Icon name="clock" size="sm" />
              <span className="edo-sub">Offline-Nutzung für unterwegs</span>
            </li>
          </ul>
        </section>
      </div>
    </Screen>
  );
}
