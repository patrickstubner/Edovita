import type { RecipePhoto } from '../domain/index.ts';
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
  photo?: RecipePhoto | null;
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
 * Kopfbereich der Rezept-Detailseite: 4:3-Titelbild (`loading="eager"`, feste Masse gegen Layout Shift)
 * oder neutraler Platzhalter, Küche, Titel, Mahlzeit, Dauer, Nährwert-Kurzinfo, Sterne und Merken.
 */
export function RecipeHeader({
  title,
  mealLabel,
  cuisineLabel,
  kcalLabel,
  minutesLabel,
  proteinLabel,
  imageLabel,
  photo,
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
  const hasPhoto = photo !== null && photo !== undefined;

  return (
    <header className="edo-card edo-hcard edo-recipe-detail-header">
      {hasPhoto ? (
        <div
          className="edo-rimg edo-rimg-has-photo edo-recipe-detail-hero"
          data-testid="recipe-detail-hero"
        >
          <img
            src={photo.src}
            alt={title}
            width={photo.width}
            height={photo.height}
            loading="eager"
            decoding="async"
          />
          <span className="edo-cui">{cuisineLabel}</span>
        </div>
      ) : (
        <div
          className={`edo-rimg edo-rimg-ph edo-rimg-${tone} edo-recipe-detail-hero`}
          role="img"
          aria-label={imageLabel}
          data-testid="recipe-detail-hero"
        >
          <Icon name="leaf" size="lg" />
          <span className="edo-cui">{cuisineLabel}</span>
        </div>
      )}

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
