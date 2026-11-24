import { Icon } from './Icon.tsx';

export interface StarsProps {
  rating: number | null;
  onRate: (stars: number | null) => void;
  groupLabel: string;
  starLabel: (stars: number) => string;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

/**
 * Sterne-Bewertung (1–5) exakt nach Prototyp (`.stars` / `.star`).
 * Erneutes Antippen des aktiven Sterns hebt die Bewertung auf (`null`).
 */
export function Stars({ rating, onRate, groupLabel, starLabel }: StarsProps) {
  const current = rating ?? 0;

  return (
    <div className="edo-stars" role="group" aria-label={groupLabel}>
      {STAR_VALUES.map((n) => {
        const isActive = n <= current;
        const isSelected = n === current;
        return (
          <button
            key={n}
            type="button"
            className={isActive ? 'edo-star edo-star-on' : 'edo-star'}
            aria-label={starLabel(n)}
            aria-pressed={isSelected}
            onClick={(event) => {
              event.stopPropagation();
              onRate(isSelected ? null : n);
            }}
          >
            <Icon name="star" size="sm" filled={isActive} />
          </button>
        );
      })}
    </div>
  );
}
