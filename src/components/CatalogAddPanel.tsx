import type { FoodId } from '../domain/index.ts';
import { Icon } from './Icon.tsx';

export interface CatalogFoodOption {
  readonly id: FoodId;
  readonly name: string;
  readonly groupLabel: string;
}

export interface CatalogAddPanelProps {
  readonly heading: string;
  readonly query: string;
  readonly placeholder: string;
  readonly addLabel: string;
  readonly emptyLabel: string;
  readonly results: readonly CatalogFoodOption[];
  readonly onQueryChange: (value: string) => void;
  readonly onAdd: (foodId: FoodId, name: string) => void;
}

/**
 * Kompakte Katalog-Suche in der Einkaufsliste zum manuellen Hinzufügen von Lebensmitteln
 * aus dem geprüften Katalog (`foods.json`).
 */
export function CatalogAddPanel({
  heading,
  query,
  placeholder,
  addLabel,
  emptyLabel,
  results,
  onQueryChange,
  onAdd,
}: CatalogAddPanelProps) {
  const showResults = query.trim().length > 0;

  return (
    <section className="edo-card edo-stack" data-testid="catalog-add-panel">
      <label className="edo-flab" htmlFor="edo-shop-catalog-search">
        {heading}
      </label>
      <div className="edo-search-wrap">
        <Icon name="search" size="sm" />
        <input
          id="edo-shop-catalog-search"
          type="search"
          className="edo-inp edo-grow"
          value={query}
          placeholder={placeholder}
          aria-label={heading}
          data-testid="catalog-search-input"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      {showResults ? (
        results.length > 0 ? (
          <div className="edo-catalog-results" data-testid="catalog-results">
            {results.map((item) => (
              <div key={item.id} className="edo-favrow">
                <div className="edo-grow">
                  <strong>{item.name}</strong>
                  <span className="edo-cap">{item.groupLabel}</span>
                </div>
                <button
                  type="button"
                  className="edo-havebtn"
                  data-testid={`catalog-add-${item.id}`}
                  aria-label={`${addLabel}: ${item.name}`}
                  onClick={() => onAdd(item.id, item.name)}
                >
                  <Icon name="plus" size="sm" />
                  <span>{addLabel}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="edo-cap" data-testid="catalog-empty">
            {emptyLabel}
          </p>
        )
      ) : null}
    </section>
  );
}
