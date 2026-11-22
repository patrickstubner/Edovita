import { useNavigate } from 'react-router';
import { Icon, Screen } from '../components/index.ts';
import type { ThemePreference } from '../domain/index.ts';
import { useTheme } from '../hooks/index.ts';

const THEME_OPTIONS: ReadonlyArray<{
  value: ThemePreference;
  label: string;
  icon: 'spark' | 'sun' | 'moon';
}> = [
  { value: 'system', label: 'System', icon: 'spark' },
  { value: 'light', label: 'Hell', icon: 'sun' },
  { value: 'dark', label: 'Dunkel', icon: 'moon' },
];

/**
 * Startseite des Phase-1-Grundgerüsts (E0).
 * Prüft Shell, Theme (System/Hell/Dunkel), SVG-Sprite, Hash-Routing und fixe BottomActions.
 */
export function HomePage() {
  const { preference, effective, setPreference } = useTheme();
  const navigate = useNavigate();

  const logoSrc =
    effective === 'dark'
      ? '/assets/edovita_logo_dark_transparent.svg'
      : '/assets/edovita_logo.svg';

  return (
    <Screen
      header={
        <div className="edo-row edo-row-between">
          <span className="edo-chip">
            <Icon name="leaf" size="sm" />
            <span>v0.1.0 · Phase 1</span>
          </span>
          <span className="edo-cap" data-testid="theme-indicator">
            {effective === 'dark' ? 'Dunkel' : 'Hell'}
          </span>
        </div>
      }
      actions={
        <button
          type="button"
          className="edo-btn"
          onClick={() => navigate('/status')}
        >
          <span>Weiter zum Projektstand</span>
          <Icon name="chev" size="sm" />
        </button>
      }
      actionsLabel="Startseite Aktionen"
    >
      <div className="edo-stack">
        <div className="edo-logo-wrap">
          <img
            src={logoSrc}
            alt="Edovita"
            className="edo-logo-img"
            width={140}
            height={132}
          />
        </div>

        <div className="edo-center edo-stack">
          <h1>Willkommen bei Edovita</h1>
          <p className="edo-sub">
            Iss fürs Leben. Rezepte, Einkaufsliste und Zweitsprache für
            Lebensmittel – lokal auf deinem Gerät.
          </p>
        </div>

        <section className="edo-card edo-stack" aria-labelledby="theme-heading">
          <div className="edo-row edo-row-between">
            <h2 id="theme-heading">Darstellung</h2>
            <span className="edo-cap">Kontrast #0B7F6B</span>
          </div>
          <div
            className="edo-segmented"
            role="group"
            aria-label="Darstellung wählen"
          >
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="edo-seg-btn"
                aria-pressed={preference === opt.value}
                onClick={() => setPreference(opt.value)}
              >
                <Icon name={opt.icon} size="sm" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="edo-card edo-card-mint edo-stack"
          aria-labelledby="privacy-heading"
        >
          <h2 id="privacy-heading">Schutz von Anfang an</h2>
          <ul className="edo-list">
            <li className="edo-list-item">
              <span className="edo-icon-badge" aria-hidden="true">
                <Icon name="shield" size="sm" />
              </span>
              <span className="edo-sub">
                Kein Konto, kein Server, keine Analyse-Tracker in Phase 1.
              </span>
            </li>
            <li className="edo-list-item">
              <span className="edo-icon-badge" aria-hidden="true">
                <Icon name="lock" size="sm" />
              </span>
              <span className="edo-sub">
                Strenge CSP ohne Inline-Skripte, alle Daten bleiben lokal.
              </span>
            </li>
            <li className="edo-list-item">
              <span className="edo-icon-badge" aria-hidden="true">
                <Icon name="book" size="sm" />
              </span>
              <span className="edo-sub">
                Als Nächstes folgen Katalog &amp; Rezepte (E1), Sprachen (E2)
                und lokale Speicherung (E3).
              </span>
            </li>
          </ul>
        </section>
      </div>
    </Screen>
  );
}
