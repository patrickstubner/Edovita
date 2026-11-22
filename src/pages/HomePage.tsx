import { useNavigate } from 'react-router';
import { publicUrl } from '../app/publicBase.ts';
import { Icon, Screen } from '../components/index.ts';
import type { ThemePreference } from '../domain/index.ts';
import { useTheme } from '../hooks/index.ts';

const THEME_OPTIONS: ReadonlyArray<{
  value: ThemePreference;
  label: string;
}> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

const THEME_NOTES: Record<ThemePreference, string> = {
  system: 'Folgt der Einstellung deines Geräts.',
  light: 'Immer hell.',
  dark: 'Immer dunkel.',
};

/**
 * Startseite der Edovita-App (E0).
 * Zeigt Logo, Darstellungswahl im Prototyp-Stil, Datenschutzhinweise und fixe BottomActions.
 */
export function HomePage() {
  const { preference, effective, setPreference } = useTheme();
  const navigate = useNavigate();

  const logoSrc =
    effective === 'dark'
      ? publicUrl('/assets/edovita_logo_dark_transparent.svg')
      : publicUrl('/assets/edovita_logo.svg');

  return (
    <Screen
      actions={
        <button
          type="button"
          className="edo-btn"
          onClick={() => navigate('/status')}
        >
          <span>Weiter</span>
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
            width={150}
            height={142}
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
          <h2 id="theme-heading">Darstellung</h2>
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
                {opt.label}
              </button>
            ))}
          </div>
          <p className="edo-cap" data-testid="theme-note">
            {THEME_NOTES[preference]}
          </p>
        </section>

        <section
          className="edo-card edo-card-mint edo-stack"
          aria-labelledby="privacy-heading"
        >
          <h2 id="privacy-heading">Deine Daten bleiben bei dir</h2>
          <ul className="edo-list">
            <li className="edo-list-item">
              <span className="edo-icon-badge" aria-hidden="true">
                <Icon name="shield" size="sm" />
              </span>
              <span className="edo-sub">
                Kein Konto, kein Server und keine Werbung – alles bleibt direkt
                auf deinem Gerät.
              </span>
            </li>
            <li className="edo-list-item">
              <span className="edo-icon-badge" aria-hidden="true">
                <Icon name="lock" size="sm" />
              </span>
              <span className="edo-sub">
                Deine Angaben und Einkaufslisten gehören nur dir und lassen sich
                jederzeit löschen.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </Screen>
  );
}
