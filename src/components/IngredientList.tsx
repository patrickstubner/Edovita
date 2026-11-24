import { Icon } from './Icon.tsx';

export interface IngredientRowItem {
  readonly key: string;
  readonly amountText: string;
  readonly name: string;
  readonly note?: string;
  readonly optional?: boolean;
  readonly strained?: boolean;
  readonly allergens: readonly string[];
  readonly allergensToCheck: readonly string[];
}

export interface IngredientListProps {
  heading: string;
  items: readonly IngredientRowItem[];
  optionalLabel: string;
  strainedLabel: string;
  allergensHeading: string;
  containsLabel?: string;
  mayContainLabel?: string;
  checkBadgeLabel: string;
  noAllergensLabel: string;
  disclaimerLabel: string;
}

/**
 * Zutatenliste mit skalierten Mengen, optionalen Hinweisen und Allergen-Kennzeichnung
 * inklusive «Kann enthalten» für `allergensToCheck` (Issue #10, ADR-005).
 */
export function IngredientList({
  heading,
  items,
  optionalLabel,
  strainedLabel,
  allergensHeading,
  containsLabel,
  mayContainLabel,
  checkBadgeLabel,
  noAllergensLabel,
  disclaimerLabel,
}: IngredientListProps) {
  const hasAnyAllergenInfo = Boolean(containsLabel || mayContainLabel);

  return (
    <section
      className="edo-card edo-stack"
      aria-labelledby="ingredients-heading"
      data-testid="ingredient-list"
    >
      <h2 id="ingredients-heading">{heading}</h2>

      <ul className="edo-ing-list">
        {items.map((item) => (
          <li
            key={item.key}
            className="edo-ing-row"
            data-testid={`ingredient-${item.key}`}
          >
            <span className="edo-ing-amount">{item.amountText}</span>
            <div className="edo-grow">
              <div className="edo-ing-name-line">
                <span className="edo-ing-name">{item.name}</span>
                {item.optional ? (
                  <span className="edo-cap"> ({optionalLabel})</span>
                ) : null}
                {item.strained ? (
                  <span className="edo-cap"> · {strainedLabel}</span>
                ) : null}
              </div>

              {item.note ? <p className="edo-cap">{item.note}</p> : null}

              {item.allergens.length > 0 || item.allergensToCheck.length > 0 ? (
                <div className="edo-ing-allergens">
                  {item.allergens.map((allergen) => (
                    <span key={`a-${allergen}`} className="edo-chip edo-chip-sm">
                      {allergen}
                    </span>
                  ))}
                  {item.allergensToCheck.map((allergen) => (
                    <span
                      key={`c-${allergen}`}
                      className="edo-chip edo-chip-sm edo-chip-warn"
                    >
                      {checkBadgeLabel}: {allergen}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div
        className={
          hasAnyAllergenInfo
            ? 'edo-banner edo-banner-warn'
            : 'edo-banner'
        }
        data-testid="allergen-summary"
      >
        <Icon name={hasAnyAllergenInfo ? 'alert' : 'check'} size="sm" />
        <div className="edo-grow">
          <b>{allergensHeading}</b>
          {containsLabel ? <span>{containsLabel}</span> : null}
          {mayContainLabel ? <span>{mayContainLabel}</span> : null}
          {!hasAnyAllergenInfo ? <span>{noAllergensLabel}</span> : null}
          <p className="edo-allergen-disclaimer">{disclaimerLabel}</p>
        </div>
      </div>
    </section>
  );
}
