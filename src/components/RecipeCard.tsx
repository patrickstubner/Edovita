import type { RecipeId, RecipePhoto } from '../domain/index.ts';
import { Icon } from './Icon.tsx';
import { SaveButton } from './SaveButton.tsx';
import { Stars } from './Stars.tsx';

export type RecipePaletteTone = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';

export interface RecipeCardProps {
  id: RecipeId;
  title: string;
  mealLabel: string;
  cuisineLabel: string;
  kcalLabel: string;
  minutesLabel: string;
  proteinLabel: string;
  imageLabel: string;
  photo?: RecipePhoto | null;
  openLabel: string;
  topLabel?: string;
  featured?: boolean;
  tone: RecipePaletteTone;
  rating: number | null;
  saved: boolean;
  ratingGroupLabel: string;
  starLabel: (stars: number) => string;
  saveLabel: string;
  unsaveLabel: string;
  onOpen: (id: RecipeId) => void;
  onRate: (id: RecipeId, stars: number | null) => void;
  onToggleSave: (id: RecipeId) => void;
}

/**
 * Rezept-Kachel im Prototyp-Stil (`featured` als grosse Top-Karte 16:9 max. 180 px, sonst kompakt `.recipe.sm`).
 * Zeigt lokal gebündeltes WebP-Foto (`loading="lazy"`, feste Masse gegen Layout Shift) oder den neutralen Platzhalter.
 * Keine verschachtelten `<button>`-Elemente: Öffnen, Merken und Sterne bleiben getrennte Kontrollen.
 */
export function RecipeCard({
  id,
  title,
  mealLabel,
  cuisineLabel,
  kcalLabel,
  minutesLabel,
  proteinLabel,
  imageLabel,
  photo,
  openLabel,
  topLabel,
  featured = false,
  tone,
  rating,
  saved,
  ratingGroupLabel,
  starLabel,
  saveLabel,
  unsaveLabel,
  onOpen,
  onRate,
  onToggleSave,
}: RecipeCardProps) {
  const hasPhoto = photo !== null && photo !== undefined;

  if (featured) {
    return (
      <article
        className="edo-card edo-hcard edo-recipe edo-recipe-feat"
        data-testid={`recipe-card-${id}`}
      >
        <button
          type="button"
          className={
            hasPhoto
              ? 'edo-rimg edo-rimg-has-photo edo-recipe-hero-btn'
              : `edo-rimg edo-rimg-ph edo-rimg-${tone} edo-recipe-hero-btn`
          }
          aria-label={openLabel}
          onClick={() => onOpen(id)}
        >
          {hasPhoto ? (
            <img
              src={photo.src}
              alt={title}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span
              className="edo-rimg-placeholder"
              role="img"
              aria-label={imageLabel}
            >
              <Icon name="leaf" size="lg" />
            </span>
          )}
          <span className="edo-cui">{cuisineLabel}</span>
        </button>

        <div className="edo-hcard-body edo-stack">
          <div className="edo-row edo-row-top edo-row-between">
            <button
              type="button"
              className="edo-recipe-title-btn edo-grow"
              onClick={() => onOpen(id)}
            >
              <h2>{title}</h2>
            </button>
            <SaveButton
              saved={saved}
              onToggle={() => onToggleSave(id)}
              saveLabel={saveLabel}
              unsaveLabel={unsaveLabel}
            />
          </div>

          <div className="edo-row edo-row-between">
            {topLabel ? <span className="edo-chip">{topLabel}</span> : null}
            <Stars
              rating={rating}
              onRate={(stars) => onRate(id, stars)}
              groupLabel={ratingGroupLabel}
              starLabel={starLabel}
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
        </div>
      </article>
    );
  }

  return (
    <article
      className="edo-card edo-recipe edo-recipe-sm"
      data-testid={`recipe-card-${id}`}
    >
      <button
        type="button"
        className={
          hasPhoto
            ? 'edo-rimg edo-rimg-has-photo edo-recipe-thumb-btn'
            : `edo-rimg edo-rimg-ph edo-rimg-${tone} edo-recipe-thumb-btn`
        }
        aria-label={openLabel}
        onClick={() => onOpen(id)}
      >
        {hasPhoto ? (
          <img
            src={photo.src}
            alt={title}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span
            className="edo-rimg-placeholder"
            role="img"
            aria-label={imageLabel}
          >
            <Icon name="leaf" />
          </span>
        )}
      </button>

      <div className="edo-grow edo-recipe-sm-body">
        <div className="edo-row edo-row-between">
          <span className="edo-recipe-tg">
            {mealLabel} · {cuisineLabel}
          </span>
          <SaveButton
            saved={saved}
            onToggle={() => onToggleSave(id)}
            saveLabel={saveLabel}
            unsaveLabel={unsaveLabel}
          />
        </div>

        <button
          type="button"
          className="edo-recipe-title-btn"
          onClick={() => onOpen(id)}
        >
          <h3>{title}</h3>
        </button>

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
          onRate={(stars) => onRate(id, stars)}
          groupLabel={ratingGroupLabel}
          starLabel={starLabel}
        />
      </div>
    </article>
  );
}
