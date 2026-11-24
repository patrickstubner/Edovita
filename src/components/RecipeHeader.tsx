import { Icon } from './Icon.tsx';
import type { RecipePaletteTone } from './RecipeCard.tsx';
import { SaveButton } from './SaveButton.tsx';
import { Stars } from './Stars.tsx';

export interface RecipeHeaderProps {
  title: string;
  mealLabel: string;
  cuisineLabel: string;
  kcalLabel: string;
  minutesLabel: string;
  proteinLabel: string;
  imageLabel: string;
  tone: RecipePaletteTone;
  rating: number | null;
  saved: boolean;
  ratingGroupLabel: string;
  starLabel: (stars: number) => string;
  saveLabel: string;
  unsaveLabel: string;
  onRate: (stars: number | null) => void;
  onToggleSave: () => void;
}

/**
 * Kopfbereich der Rezept-Detailseite: Farbfläche/Platzhalter, Küche, Titel,
 * Mahlzeit, Dauer, Nährwert-Kurzinfo, Sterne und Merken.
 */
export function RecipeHeader({
  title,
  mealLabel,
  cuisineLabel,
  kcalLabel,
  minutesLabel,
  proteinLabel,
  imageLabel,
  tone,
  rating,
  saved,
  ratingGroupLabel,
  starLabel,
  saveLabel,
  unsaveLabel,
  onRate,
  onToggleSave,
}: RecipeHeaderProps) {
  return (
    <header className="edo-card edo-hcard edo-recipe-detail-header">
      <div
        className={`edo-rimg edo-rimg-${tone} edo-recipe-detail-hero`}
        role="img"
        aria-label={imageLabel}
      >
        <Icon name="leaf" size="lg" />
        <span className="edo-cui">{cuisineLabel}</span>
      </div>

      <div className="edo-hcard-body edo-stack">
        <div className="edo-row edo-row-top edo-row-between">
          <div className="edo-grow">
            <p className="edo-recipe-tg">
              {mealLabel} · {cuisineLabel}
            </p>
            <h1>{title}</h1>
          </div>
          <SaveButton
            saved={saved}
            onToggle={onToggleSave}
            saveLabel={saveLabel}
            unsaveLabel={unsaveLabel}
          />
        </div>

        <div className="edo-recipe-meta">
          <span>
            <Icon name="flame" size="sm" />
            {kcalLabel}
          </span>
          <span>
            <Icon name="clock" size="sm" />
            {minutesLabel}
          </span>
          <span>{proteinLabel}</span>
        </div>

        <Stars
          rating={rating}
          onRate={onRate}
          groupLabel={ratingGroupLabel}
          starLabel={starLabel}
        />
      </div>
    </header>
  );
}
