import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { getRecipePhoto } from '../catalog/index.ts';
import {
  Icon,
  RecipeCard,
  Screen,
  Toast,
  type RecipePaletteTone,
} from '../components/index.ts';
import type { Meal, RecipeId } from '../domain/index.ts';
import {
  useI18n,
  usePlanShopping,
  useRatings,
  useRecipes,
} from '../hooks/index.ts';
import {
  MEAL_LABEL_KEYS,
  getCuisineLabelKey,
  type UiKey,
} from '../i18n/index.ts';

interface RecipesToastState {
  readonly message: string;
  readonly canUndo: boolean;
}

const MEAL_FILTERS: ReadonlyArray<{
  value: Meal | 'all';
  labelKey: UiKey;
}> = [
  { value: 'all', labelKey: 'rezepte.alle' },
  { value: 'breakfast', labelKey: 'meal.breakfast' },
  { value: 'lunch', labelKey: 'meal.lunch' },
  { value: 'dinner', labelKey: 'meal.dinner' },
  { value: 'snack', labelKey: 'meal.snack' },
];

const PALETTE_BY_ID: Readonly<Record<string, RecipePaletteTone>> = {
  oven_salmon: 'c1',
  lentil_curry: 'c2',
  thai_curry: 'c3',
  pho: 'c4',
  birchermuesli: 'c6',
};

const PALETTE_CYCLE: readonly RecipePaletteTone[] = [
  'c1',
  'c2',
  'c3',
  'c4',
  'c5',
  'c6',
];

function toneForRecipe(id: RecipeId, index: number): RecipePaletteTone {
  if (Object.hasOwn(PALETTE_BY_ID, id)) {
    return PALETTE_BY_ID[id] ?? 'c1';
  }
  return PALETTE_CYCLE[index % PALETTE_CYCLE.length] ?? 'c1';
}

/**
 * Rezeptliste (#/rezepte) im Prototyp-Stil:
 * Mahlzeit-Filter (einer), Eigenschaften-Filter (mehrere), Vielfalt-Ranking (`rankRecipes`),
 * Top-Karten-Knopf «Zur Einkaufsliste hinzufügen» (E11 / Entscheid 25.11.),
 * Sterne und Merken persistent über `RatingsRepository`.
 */
export function RecipesPage() {
  const navigate = useNavigate();
  const { t, fmtNumber } = useI18n();
  const { setRating, toggleSaved } = useRatings();
  const { addRecipeToList, undoPlanAndShopping } = usePlanShopping();

  const [meal, setMeal] = useState<Meal | 'all'>('all');
  const [fast, setFast] = useState<boolean>(false);
  const [protein, setProtein] = useState<boolean>(false);
  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [toast, setToast] = useState<RecipesToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = useRecipes({ meal, fast, protein, savedOnly });

  const showToast = useCallback(
    (next: RecipesToastState, durationMs = 2600) => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
      setToast(next);
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, durationMs);
    },
    [],
  );

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
      if (navTimerRef.current !== null) {
        clearTimeout(navTimerRef.current);
      }
    },
    [],
  );

  const handleOpen = useCallback(
    (id: RecipeId) => {
      navigate(`/rezept/${id}`);
    },
    [navigate],
  );

  const handleRate = useCallback(
    (id: RecipeId, stars: number | null) => {
      void setRating(id, stars).then(() => {
        if (stars !== null) {
          showToast({ message: t('recipe.rated.toast'), canUndo: false });
        }
      });
    },
    [setRating, showToast, t],
  );

  const handleToggleSave = useCallback(
    (id: RecipeId) => {
      void toggleSaved(id).then((isNowSaved) => {
        if (isNowSaved) {
          showToast({ message: t('recipe.saved.toast'), canUndo: false });
        }
      });
    },
    [showToast, t, toggleSaved],
  );

  const handleTopCardAddToList = useCallback(
    (id: RecipeId) => {
      const target = items.find((entry) => entry.recipe.id === id);
      if (!target) return;
      if (navTimerRef.current !== null) {
        clearTimeout(navTimerRef.current);
        navTimerRef.current = null;
      }
      void addRecipeToList(target.recipe).then((feedback) => {
        showToast(
          { message: feedback.message, canUndo: feedback.canUndo },
          feedback.canUndo ? 4500 : 3200,
        );
        navTimerRef.current = setTimeout(() => {
          navTimerRef.current = null;
          void navigate('/einkauf', {
            state: {
              shopToast: {
                message: feedback.message,
                canUndo: feedback.canUndo,
                isPlanUndo: feedback.canUndo,
              },
            },
          });
        }, 700);
      });
    },
    [addRecipeToList, items, navigate, showToast],
  );

  const handleUndo = useCallback(() => {
    if (navTimerRef.current !== null) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    void undoPlanAndShopping().then((didUndo) => {
      if (didUndo) {
        showToast({ message: t('detail.undone_toast'), canUndo: false }, 2400);
      }
    });
  }, [showToast, t, undoPlanAndShopping]);

  return (
    <Screen
      header={
        <div className="edo-row">
          <button
            type="button"
            className="edo-back-btn"
            aria-label={t('status.back')}
            onClick={() => navigate('/')}
          >
            <Icon name="left" />
          </button>
          <h1>{t('rezepte.rezepte_fur_dich')}</h1>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            data-testid="open-shopping-btn"
            onClick={() => navigate('/einkauf')}
          >
            <Icon name="cart" size="sm" />
            <span>{t('rezepte.einkaufsliste_offnen')}</span>
          </button>
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            onClick={() => navigate('/')}
          >
            <Icon name="home" size="sm" />
            <span>{t('status.back_home')}</span>
          </button>
        </>
      }
      actionsLabel={t('rezepte.actions_label')}
    >
      <div className="edo-stack">
        <div>
          <p className="edo-grph">{t('rezepte.mahlzeit')}</p>
          <div
            className="edo-filters"
            role="group"
            aria-label={t('rezepte.mahlzeit_2')}
          >
            {MEAL_FILTERS.map((opt) => {
              const active = meal === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={
                    active ? 'edo-fchip edo-fchip-on' : 'edo-fchip'
                  }
                  aria-pressed={active}
                  data-rmeal={opt.value}
                  onClick={() => setMeal(opt.value)}
                >
                  {t(opt.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="edo-grph">
            {t('rezepte.eigenschaften_mehrere_moglich')}
          </p>
          <div
            className="edo-filters"
            role="group"
            aria-label={t('rezepte.eigenschaften')}
          >
            <button
              type="button"
              className={fast ? 'edo-fchip edo-fchip-on' : 'edo-fchip'}
              aria-pressed={fast}
              data-rprop="fast"
              onClick={() => setFast((prev) => !prev)}
            >
              {t('rezepte.schnell_bis_15_min')}
            </button>
            <button
              type="button"
              className={protein ? 'edo-fchip edo-fchip-on' : 'edo-fchip'}
              aria-pressed={protein}
              data-rprop="protein"
              onClick={() => setProtein((prev) => !prev)}
            >
              {t('rezepte.eiweissreich')}
            </button>
            <button
              type="button"
              className={savedOnly ? 'edo-fchip edo-fchip-on' : 'edo-fchip'}
              aria-pressed={savedOnly}
              data-rprop="saved"
              onClick={() => setSavedOnly((prev) => !prev)}
            >
              {t('rezepte.gemerkt')}
            </button>
          </div>
        </div>

        <div className="edo-stack" data-testid="recipe-list">
          {items.length > 0 ? (
            items.map((item, index) => {
              const { recipe, title, rating, saved } = item;
              const cuisineKey = getCuisineLabelKey(recipe.cuisine);
              const cuisineLabel = cuisineKey ? t(cuisineKey) : recipe.cuisine;
              const mealLabel = t(MEAL_LABEL_KEYS[recipe.meal]);
              const kcalVal = Math.round(recipe.nutritionPerServing.values.kcal);
              const proteinVal = Math.round(
                recipe.nutritionPerServing.values.protein,
              );

              return (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={title}
                  mealLabel={mealLabel}
                  cuisineLabel={cuisineLabel}
                  kcalLabel={t('recipe.kcal', { n: fmtNumber(kcalVal) })}
                  minutesLabel={t('recipe.min', { n: recipe.minutes })}
                  proteinLabel={t('recipe.protein', {
                    n: fmtNumber(proteinVal),
                  })}
                  imageLabel={t('recipe.img')}
                  photo={getRecipePhoto(
                    recipe,
                    index === 0 ? 'full' : 'thumb',
                  )}
                  openLabel={t('rezepte.open_recipe', { title })}
                  topLabel={index === 0 ? t('recipe.top') : undefined}
                  featured={index === 0}
                  tone={toneForRecipe(recipe.id, index)}
                  rating={rating}
                  saved={saved}
                  ratingGroupLabel={
                    rating
                      ? t('recipe.rated', { n: rating })
                      : t('recipe.rate', { n: '1–5' })
                  }
                  starLabel={(n) => t('recipe.rate', { n })}
                  saveLabel={t('recipe.save')}
                  unsaveLabel={t('recipe.unsave')}
                  addToListLabel={
                    index === 0 ? t('detail.add_to_list') : undefined
                  }
                  onOpen={handleOpen}
                  onRate={handleRate}
                  onToggleSave={handleToggleSave}
                  onAddToList={
                    index === 0 ? handleTopCardAddToList : undefined
                  }
                />
              );
            })
          ) : (
            <section
              className="edo-card edo-card-mint edo-stack"
              data-testid="recipes-empty"
            >
              <h2>{t('recipe.none.title')}</h2>
              <p className="edo-sub">{t('recipe.none.text')}</p>
            </section>
          )}
        </div>

        <section className="edo-card edo-card-mint edo-row edo-row-top">
          <Icon name="spark" />
          <div className="edo-grow">
            <h2>{t('rezepte.so_wahlen_wir_aus')}</h2>
            <p className="edo-cap">
              {t('rezepte.gut_bewertete_rezepte_schlagen')}
            </p>
          </div>
        </section>
      </div>

      <Toast
        message={toast?.message ?? null}
        undoLabel={toast?.canUndo ? t('detail.undo') : undefined}
        onUndo={toast?.canUndo ? handleUndo : undefined}
      />
    </Screen>
  );
}
