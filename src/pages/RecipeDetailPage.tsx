import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { foodName, getFood, getRecipePhoto } from '../catalog/index.ts';
import {
  Icon,
  IngredientList,
  NutritionPanel,
  PlanSheet,
  RecipeHeader,
  Screen,
  ServingsStepper,
  StepList,
  Toast,
  type IngredientRowItem,
  type NutritionRowData,
  type PlanDayOption,
  type PlanSlotOption,
  type RecipePaletteTone,
} from '../components/index.ts';
import {
  PLAN_SLOTS,
  addDaysIso,
  coercePlanPortions,
  newPlanItemId,
  parseIsoDateLocal,
  planWindowDates,
  todayIso,
  type PlanSlot,
  type RecipeId,
} from '../domain/index.ts';
import {
  useI18n,
  usePlan,
  usePlanShopping,
  useRatings,
  useRecipe,
  useSecondLang,
  useServings,
} from '../hooks/index.ts';
import {
  ALLERGEN_LABEL_KEYS,
  MEAL_LABEL_KEYS,
  MEAL_SHORT_LABEL_KEYS,
  getCuisineLabelKey,
} from '../i18n/index.ts';

const PALETTE_BY_ID: Readonly<Record<string, RecipePaletteTone>> = {
  oven_salmon: 'c1',
  lentil_curry: 'c2',
  thai_curry: 'c3',
  pho: 'c4',
  birchermuesli: 'c6',
};

function toneForRecipe(id: RecipeId): RecipePaletteTone {
  if (Object.hasOwn(PALETTE_BY_ID, id)) {
    return PALETTE_BY_ID[id] ?? 'c1';
  }
  return 'c1';
}

interface ToastState {
  readonly message: string;
  readonly canUndo: boolean;
}

interface DetailPlanDraft {
  readonly date: string;
  readonly slot: PlanSlot;
  readonly portions: number;
}

/**
 * Rezept-Detailseite (#/rezept/:id) gemäss Issues #10/#12/#35/#36, ADR-003 und ADR-005:
 * - RecipeHeader (Sterne & Merken persistent über RatingsRepository)
 * - ServingsStepper (1–12, Tastatur-bedienbar, aria-live)
 * - IngredientList (skalierte Mengen, Zweitsprache via `BilingualName` mit `<bdi>`, Allergene inkl. «Kann enthalten»)
 * - StepList (nur App-Sprache, darunter Hinweis `second.hint`)
 * - NutritionPanel (berechnete Werte, CH-NWD-Quelle, «mindestens»-Hinweis, sichere review.sources F3b)
 * - Fixe BottomActions: Hauptknopf «Zum Plan hinzufügen» (PlanSheet -> #/plan),
 *   zweiter Knopf «Zur Einkaufsliste hinzufügen» (automatische Einplanung + Rückgängig, E11) & «Einkaufsliste öffnen»
 * - Unbekannte ID zeigt «Rezept nicht gefunden» mit Zurück-Navigation.
 */
export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, t, fmtDate, fmtNumber, fmtAmount } = useI18n();
  const { plan } = usePlan();
  const { addRecipeToList, syncUpsertPlanItem, undoPlanAndShopping } =
    usePlanShopping();
  const { effectiveMeta: secondMeta, secondFoodName } = useSecondLang();
  const { recipe, text, missingText, nutrition, catalogSource, notFound } =
    useRecipe(id);
  const [planDraft, setPlanDraft] = useState<DetailPlanDraft | null>(null);
  const {
    servings,
    min,
    max,
    setServings,
    scaledIngredients,
    totalNutrients,
  } = useServings(recipe);
  const { getRating, setRating, isSaved, toggleSaved } = useRatings();

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: ToastState, durationMs = 4500) => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(next);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, durationMs);
  }, []);

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

  const ingredientRows = useMemo<readonly IngredientRowItem[]>(() => {
    if (!recipe) return [];
    return scaledIngredients.map((ing, idx) => {
      const food = getFood(ing.food);
      const translatedName = foodName(ing.food, lang);
      const missingName = translatedName === null;
      const displayName =
        translatedName ?? t('detail.missing_food_name', { id: ing.food });
      const secondaryName = missingName
        ? null
        : secondFoodName(ing.food, displayName);
      const note =
        ing.noteKey && text && Object.hasOwn(text.notes, ing.noteKey)
          ? text.notes[ing.noteKey]
          : undefined;
      const allergens = (food?.allergens ?? []).map((a) =>
        t(ALLERGEN_LABEL_KEYS[a]),
      );
      const allergensToCheck = (food?.allergensToCheck ?? []).map((a) =>
        t(ALLERGEN_LABEL_KEYS[a]),
      );

      return {
        key: `${ing.food}-${idx}`,
        amountText: fmtAmount(ing.scaledAmount, ing.unit),
        name: displayName,
        secondaryName,
        secondaryLocale: secondMeta?.locale,
        secondaryDir: secondMeta?.dir,
        missingName,
        note,
        optional: ing.optional,
        strained: ing.strained,
        allergens,
        allergensToCheck,
      };
    });
  }, [
    fmtAmount,
    lang,
    recipe,
    scaledIngredients,
    secondFoodName,
    secondMeta?.dir,
    secondMeta?.locale,
    t,
    text,
  ]);

  const nutritionRows = useMemo<readonly NutritionRowData[]>(() => {
    if (!nutrition || !totalNutrients) return [];
    const per = nutrition.values;
    const tot = totalNutrients;
    const showTotal = servings > 1;
    const fmtGram = (val: number) => `${fmtNumber(val, 1)} g`;

    return [
      {
        key: 'kcal',
        label: t('detail.nutrition.energy'),
        perServing: t('recipe.kcal', { n: fmtNumber(Math.round(per.kcal)) }),
        forServings: showTotal
          ? t('recipe.kcal', { n: fmtNumber(Math.round(tot.kcal)) })
          : undefined,
      },
      {
        key: 'protein',
        label: t('detail.nutrition.protein'),
        perServing: fmtGram(per.protein),
        forServings: showTotal ? fmtGram(tot.protein) : undefined,
      },
      {
        key: 'fat',
        label: t('detail.nutrition.fat'),
        perServing: fmtGram(per.fat),
        forServings: showTotal ? fmtGram(tot.fat) : undefined,
      },
      {
        key: 'satFat',
        label: t('detail.nutrition.sat_fat'),
        perServing: fmtGram(per.satFat),
        forServings: showTotal ? fmtGram(tot.satFat) : undefined,
        indent: true,
      },
      {
        key: 'carbs',
        label: t('detail.nutrition.carbs'),
        perServing: fmtGram(per.carbs),
        forServings: showTotal ? fmtGram(tot.carbs) : undefined,
      },
      {
        key: 'sugars',
        label: t('detail.nutrition.sugars'),
        perServing: fmtGram(per.sugars),
        forServings: showTotal ? fmtGram(tot.sugars) : undefined,
        indent: true,
      },
      {
        key: 'fiber',
        label: t('detail.nutrition.fiber'),
        perServing: fmtGram(per.fiber),
        forServings: showTotal ? fmtGram(tot.fiber) : undefined,
      },
      {
        key: 'salt',
        label: t('detail.nutrition.salt'),
        perServing: fmtGram(per.salt),
        forServings: showTotal ? fmtGram(tot.salt) : undefined,
      },
    ];
  }, [fmtNumber, nutrition, servings, t, totalNutrients]);

  const handleAddToShoppingList = useCallback(() => {
    if (!recipe) return;
    if (navTimerRef.current !== null) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    void addRecipeToList(recipe, coercePlanPortions(servings)).then(
      (feedback) => {
        showToast(
          {
            message: feedback.message,
            canUndo: feedback.canUndo,
          },
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
      },
    );
  }, [addRecipeToList, navigate, recipe, servings, showToast]);

  const handleUndo = useCallback(() => {
    if (navTimerRef.current !== null) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    void undoPlanAndShopping().then((didUndo) => {
      if (didUndo) {
        showToast(
          {
            message: t('detail.undone_toast'),
            canUndo: false,
          },
          2400,
        );
      }
    });
  }, [showToast, t, undoPlanAndShopping]);

  const planDayOptions = useMemo<readonly PlanDayOption[]>(() => {
    const today = todayIso();
    const tomorrow = addDaysIso(today, 1);
    return planWindowDates(plan.days).map((iso) => ({
      iso,
      label:
        iso === today
          ? t('plan.today')
          : iso === tomorrow
            ? t('plan.tomorrow')
            : fmtDate(parseIsoDateLocal(iso), {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }),
    }));
  }, [fmtDate, plan.days, t]);

  const planSlotOptions = useMemo<readonly PlanSlotOption[]>(
    () =>
      PLAN_SLOTS.map((slot) => ({
        slot,
        label: t(MEAL_SHORT_LABEL_KEYS[slot]),
      })),
    [t],
  );

  const handleOpenPlanSheet = useCallback(() => {
    if (!recipe) return;
    setPlanDraft({
      date: todayIso(),
      slot: recipe.meal,
      portions: coercePlanPortions(servings),
    });
  }, [recipe, servings]);

  const handleConfirmPlanSheet = useCallback(() => {
    if (!recipe || !planDraft) return;
    const item = {
      id: newPlanItemId(),
      date: planDraft.date,
      slot: planDraft.slot,
      recipeId: recipe.id,
      portions: coercePlanPortions(planDraft.portions),
    };
    setPlanDraft(null);
    void syncUpsertPlanItem(item).then(() => {
      void navigate('/plan', { state: { planAdded: true } });
    });
  }, [navigate, planDraft, recipe, syncUpsertPlanItem]);

  if (notFound || !recipe || !nutrition) {
    return (
      <Screen
        header={
          <div className="edo-row">
            <button
              type="button"
              className="edo-back-btn"
              aria-label={t('detail.back')}
              onClick={() => navigate('/rezepte')}
            >
              <Icon name="left" />
            </button>
            <h1>{t('detail.not_found.title')}</h1>
          </div>
        }
        actions={
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            onClick={() => navigate('/rezepte')}
          >
            <Icon name="left" size="sm" />
            <span>{t('detail.back')}</span>
          </button>
        }
        actionsLabel={t('detail.actions_label')}
      >
        <section
          className="edo-card edo-card-mint edo-stack"
          data-testid="recipe-not-found"
        >
          <h2>{t('detail.not_found.title')}</h2>
          <p className="edo-sub">{t('detail.not_found.text')}</p>
        </section>
      </Screen>
    );
  }

  const rating = getRating(recipe.id);
  const saved = isSaved(recipe.id);
  const cuisineKey = getCuisineLabelKey(recipe.cuisine);
  const cuisineLabel = cuisineKey ? t(cuisineKey) : recipe.cuisine;
  const mealLabel = t(MEAL_LABEL_KEYS[recipe.meal]);
  const containsNames = recipe.allergens.map((a) => t(ALLERGEN_LABEL_KEYS[a]));
  const mayContainNames = recipe.allergensToCheck.map((a) =>
    t(ALLERGEN_LABEL_KEYS[a]),
  );

  return (
    <Screen
      header={
        <div className="edo-row">
          <button
            type="button"
            className="edo-back-btn"
            aria-label={t('detail.back')}
            onClick={() => navigate('/rezepte')}
          >
            <Icon name="left" />
          </button>
          <span className="edo-sub edo-grow">{t('rezepte.rezepte')}</span>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            className="edo-btn"
            onClick={handleOpenPlanSheet}
            data-testid="add-to-plan-btn"
          >
            <Icon name="cal" size="sm" />
            <span>{t('plan.add')}</span>
          </button>
          <div className="edo-actions-row">
            <button
              type="button"
              className="edo-btn edo-btn-secondary"
              onClick={handleAddToShoppingList}
              data-testid="add-to-shopping-btn"
            >
              <Icon name="cart" size="sm" />
              <span>{t('detail.add_to_list')}</span>
            </button>
            <button
              type="button"
              className="edo-btn edo-btn-secondary"
              onClick={() => navigate('/einkauf')}
              data-testid="detail-open-shopping-btn"
            >
              <Icon name="cart" size="sm" />
              <span>{t('rezepte.einkaufsliste_offnen')}</span>
            </button>
          </div>
        </>
      }
      actionsLabel={t('detail.actions_label')}
    >
      <div className="edo-stack">
        <RecipeHeader
          title={text ? text.title : recipe.id}
          mealLabel={mealLabel}
          cuisineLabel={cuisineLabel}
          kcalLabel={t('recipe.kcal', {
            n: fmtNumber(Math.round(nutrition.values.kcal)),
          })}
          minutesLabel={t('recipe.min', { n: recipe.minutes })}
          proteinLabel={t('recipe.protein', {
            n: fmtNumber(Math.round(nutrition.values.protein)),
          })}
          imageLabel={t('recipe.img')}
          photo={getRecipePhoto(recipe, 'full')}
          tone={toneForRecipe(recipe.id)}
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
          onRate={(stars) => {
            void setRating(recipe.id, stars).then(() => {
              if (stars !== null) {
                showToast({
                  message: t('recipe.rated.toast'),
                  canUndo: false,
                });
              }
            });
          }}
          onToggleSave={() => {
            void toggleSaved(recipe.id).then((isNowSaved) => {
              if (isNowSaved) {
                showToast({
                  message: t('recipe.saved.toast'),
                  canUndo: false,
                });
              }
            });
          }}
        />

        {missingText ? (
          <div
            className="edo-banner edo-banner-warn"
            role="status"
            data-testid="missing-recipe-text"
          >
            <Icon name="alert" size="sm" />
            <span className="edo-grow">
              {t('detail.missing_recipe_text', { lang })}
            </span>
          </div>
        ) : null}

        <ServingsStepper
          value={servings}
          min={min}
          max={max}
          heading={t('detail.servings')}
          countLabel={t('detail.servings.count', { n: servings })}
          decrementLabel={t('detail.servings.dec')}
          incrementLabel={t('detail.servings.inc')}
          onChange={setServings}
        />

        <IngredientList
          heading={t('detail.ingredients')}
          items={ingredientRows}
          optionalLabel={t('detail.optional')}
          strainedLabel={t('detail.strained')}
          allergensHeading={t('detail.allergens.heading')}
          containsLabel={
            containsNames.length > 0
              ? t('detail.allergens.contains', {
                  list: containsNames.join(', '),
                })
              : undefined
          }
          mayContainLabel={
            mayContainNames.length > 0
              ? t('detail.allergens.may_contain', {
                  list: mayContainNames.join(', '),
                })
              : undefined
          }
          checkBadgeLabel={t('detail.allergens.check_badge')}
          noAllergensLabel={t('detail.allergens.none')}
          disclaimerLabel={t('detail.allergens.disclaimer')}
        />

        {text ? (
          <StepList
            heading={t('detail.steps')}
            steps={text.steps}
            hint={t('second.hint')}
          />
        ) : null}

        <NutritionPanel
          heading={t('detail.nutrition')}
          perServingLabel={t('detail.nutrition.per_serving')}
          forServingsLabel={
            servings > 1
              ? t('detail.nutrition.for_servings', { n: servings })
              : undefined
          }
          rows={nutritionRows}
          isMinimum={nutrition.isMinimum}
          minimumBadgeLabel={t('detail.nutrition.minimum_badge')}
          minimumNoteLabel={t('detail.nutrition.minimum_note')}
          sourceLabel={t('detail.nutrition.source', {
            source: `${catalogSource.name} (${catalogSource.license})`,
          })}
          basisNote={nutrition.basis}
          reviewSourcesHeading={t('detail.sources.heading')}
          reviewSources={recipe.review.sources}
        />
      </div>

      <PlanSheet
        open={planDraft !== null}
        mode="form"
        title={t('plan.add.title')}
        closeLabel={t('dialog.close')}
        recipeTitle={text ? text.title : recipe.id}
        dayOptions={planDayOptions}
        selectedDate={planDraft?.date}
        slotOptions={planSlotOptions}
        selectedSlot={planDraft?.slot}
        portions={planDraft?.portions ?? 2}
        dayHeading={t('plan.day')}
        mealHeading={t('plan.meal')}
        portionsHeading={t('plan.portions')}
        portionsDecLabel={`${t('plan.portions')} −`}
        portionsIncLabel={`${t('plan.portions')} +`}
        confirmLabel={t('plan.confirm')}
        cancelLabel={t('plan.cancel')}
        onSelectDate={(iso) =>
          setPlanDraft((prev) => (prev ? { ...prev, date: iso } : null))
        }
        onSelectSlot={(slot) =>
          setPlanDraft((prev) => (prev ? { ...prev, slot } : null))
        }
        onChangePortions={(portions) =>
          setPlanDraft((prev) => (prev ? { ...prev, portions } : null))
        }
        onConfirm={handleConfirmPlanSheet}
        onClose={() => setPlanDraft(null)}
      />

      <Toast
        message={toast?.message ?? null}
        undoLabel={toast?.canUndo ? t('detail.undo') : undefined}
        onUndo={toast?.canUndo ? handleUndo : undefined}
      />
    </Screen>
  );
}
