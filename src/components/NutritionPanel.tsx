import { sanitizeExternalHttpsUrl } from '../domain/index.ts';
import { Icon } from './Icon.tsx';

export interface NutritionRowData {
  readonly key: string;
  readonly label: string;
  readonly perServing: string;
  readonly forServings?: string;
  readonly indent?: boolean;
}

export interface NutritionPanelProps {
  heading: string;
  perServingLabel: string;
  forServingsLabel?: string;
  rows: readonly NutritionRowData[];
  isMinimum: boolean;
  minimumBadgeLabel: string;
  minimumNoteLabel: string;
  sourceLabel: string;
  basisNote?: string;
  reviewSourcesHeading: string;
  reviewSources: readonly string[];
}

function formatSourceLinkLabel(safeUrl: string): string {
  try {
    const parsed = new URL(safeUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return safeUrl;
  }
}

/**
 * Nährwert-Tafel gemäss ADR-005: berechnete Werte aus der Schweizer Nährwertdatenbank
 * mit Quellenvermerk, «mindestens»-Hinweis bei unvollständigen Werten und sicheren
 * `review.sources`-Links (F3b: nur https ohne Userinfo, `rel="noopener noreferrer"`).
 */
export function NutritionPanel({
  heading,
  perServingLabel,
  forServingsLabel,
  rows,
  isMinimum,
  minimumBadgeLabel,
  minimumNoteLabel,
  sourceLabel,
  basisNote,
  reviewSourcesHeading,
  reviewSources,
}: NutritionPanelProps) {
  const safeSources: Array<{ href: string; label: string }> = [];
  for (const raw of reviewSources) {
    const safeHref = sanitizeExternalHttpsUrl(raw);
    if (safeHref !== null) {
      safeSources.push({
        href: safeHref,
        label: formatSourceLinkLabel(safeHref),
      });
    }
  }

  return (
    <section
      className="edo-card edo-stack"
      aria-labelledby="nutrition-heading"
      data-testid="nutrition-panel"
    >
      <div className="edo-row edo-row-between">
        <h2 id="nutrition-heading">{heading}</h2>
        {isMinimum ? (
          <span
            className="edo-chip edo-chip-warn"
            data-testid="nutrition-minimum-badge"
          >
            {minimumBadgeLabel}
          </span>
        ) : null}
      </div>

      <table className="edo-nutri-table">
        <thead>
          <tr>
            <th scope="col" className="edo-nutri-name">
              <span className="edo-sr">{heading}</span>
            </th>
            <th scope="col" className="edo-nutri-val">
              {perServingLabel}
            </th>
            {forServingsLabel ? (
              <th scope="col" className="edo-nutri-val">
                {forServingsLabel}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className={row.indent ? 'edo-nutri-sub' : undefined}
              data-testid={`nutrition-row-${row.key}`}
            >
              <th scope="row" className="edo-nutri-name">
                {row.label}
              </th>
              <td
                className="edo-nutri-val"
                data-testid={`nutrition-per-${row.key}`}
              >
                {row.perServing}
              </td>
              {forServingsLabel ? (
                <td
                  className="edo-nutri-val"
                  data-testid={`nutrition-total-${row.key}`}
                >
                  {row.forServings ?? ''}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>

      {isMinimum ? (
        <div className="edo-banner edo-banner-warn" data-testid="nutrition-minimum-note">
          <Icon name="info" size="sm" />
          <span className="edo-grow">{minimumNoteLabel}</span>
        </div>
      ) : null}

      <div className="edo-nutri-meta">
        <p className="edo-cap" data-testid="nutrition-source">
          {sourceLabel}
        </p>
        {basisNote ? <p className="edo-cap">{basisNote}</p> : null}
      </div>

      {safeSources.length > 0 ? (
        <div className="edo-sources" data-testid="recipe-sources">
          <p className="edo-cap edo-sources-title">{reviewSourcesHeading}</p>
          <ul className="edo-sources-list">
            {safeSources.map((src) => (
              <li key={src.href}>
                <a
                  href={src.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="edo-source-link"
                >
                  <Icon name="link" size="sm" />
                  <span>{src.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
