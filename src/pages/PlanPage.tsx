import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  getRecipe,
  getRecipePhoto,
  getRecipeText,
  listRecipes,
} from '../catalog/index.ts';
import {
  Icon,
  PlanSheet,
  Screen,
  Toast,
  type PlanDayOption,
  type PlanPickOption,
  type PlanSlotOption,
  type RecipePaletteTone,
} from '../components/index.ts';
import {
  PLAN_DAYS_MAX,
  PLAN_DAYS_MIN,
  PLAN_SLOTS,
  addDaysIso,
  coercePlanPortions,
  newPlanItemId,
  parseIsoDateLocal,
  planWindowDates,
  todayIso,
  type PlanItem,
  type PlanSlot,
  type RecipeId,
} from '../domain/index.ts';
import { useI18n, usePlan } from '../hooks/index.ts';
import { MEAL_LABEL_KEYS, MEAL_SHORT_LABEL_KEYS } from '../i18n/index.ts';
import { dayPlanNutrition, nutrientsForServings } from '../nutrition/index.ts';

const DAY_CHOICES: readonly number[] = Array.from(
  { length: PLAN_DAYS_MAX - PLAN_DAYS_MIN + 1 },
  (_, idx) => PLAN_DAYS_MIN + idx,
);

const TONE_BY_RECIPE: Readonly<Record<string, RecipePaletteTone>> = {
  oven_salmon: 'c1',
  lentil_curry: 'c2',
  thai_curry: 'c3',
  pho: 'c4',
  birchermuesli: 'c6',
};

function toneForRecipe(id: string): RecipePaletteTone {
  return Object.hasOwn(TONE_BY_RECIPE, id) ? TONE_BY_RECIPE[id]! : 'c1';
}

interface PlanSheetState {
  readonly mode: 'pick' | 'form';
  readonly date: string;
  readonly slot: PlanSlot;
  readonly filterMeal?: PlanSlot;
  readonly itemId?: string;
  readonly recipeId?: RecipeId;
  readonly portions: number;
}

/**
 * Essensplan-Screen (`#/plan`, E10 / Issue #35, Prototyp v5.10.1):
 * Zeitraum 3–7 Tage, vier Slots (Frühstück, Mittagessen, Abendessen, Snacks),
 * Tagestotale aus `nutrientsForServings`, Tauschen/Entfernen und modales Plan-Sheet.
 * Knopf «Einkaufsliste erstellen» folgt separat in E11 (#36).
 */
export function PlanPage() {
  const { lang, fmtDate, fmtNumber, t } = useI18n();
  const { plan, setDays, upsertItem, removeItem } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPlanAdded = Boolean(
    (location.state as { planAdded?: boolean } | null)?.planAdded,
  );

  const [sheet, setSheet] = useState<PlanSheetState | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(() =>
    initialPlanAdded ? t('recipe.addplan.toast') : null,
  );
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMsg(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 3200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  // Router-State nach Weiterleitung aus Rezept-Detail zurücksetzen und Toast nach 3,2 s ausblenden
  useEffect(() => {
    if (!initialPlanAdded) {
      return;
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 3200);
    void navigate('/plan', { replace: true, state: null });
  }, [initialPlanAdded, navigate]);

  const today = todayIso();
  const tomorrow = addDaysIso(today, 1);
  const dates = useMemo(() => planWindowDates(plan.days), [plan.days]);
  const allRecipes = useMemo(() => listRecipes(), []);

  const dayLabel = useCallback(
    (iso: string): string => {
      if (iso === today) return t('plan.today');
      if (iso === tomorrow) return t('plan.tomorrow');
      return fmtDate(parseIsoDateLocal(iso), {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    },
    [fmtDate, t, today, tomorrow],
  );

  const recipeTitle = useCallback(
    (id: RecipeId): string => {
      const txt = getRecipeText(id, lang);
      return txt ? txt.title : id;
    },
    [lang],
  );

  const dayOptions = useMemo<readonly PlanDayOption[]>(
    () => dates.map((iso) => ({ iso, label: dayLabel(iso) })),
    [dates, dayLabel],
  );

  const slotOptions = useMemo<readonly PlanSlotOption[]>(
    () =>
      PLAN_SLOTS.map((slot) => ({
        slot,
        label: t(MEAL_SHORT_LABEL_KEYS[slot]),
      })),
    [t],
  );

  const pickOptions = useMemo<readonly PlanPickOption[]>(() => {
    if (!sheet || sheet.mode !== 'pick') {
      return [];
    }
    const filter = sheet.filterMeal;
    return allRecipes
      .filter((r) => {
        if (!filter || filter === 'snack') {
          return true;
        }
        return r.meal === filter || r.meal === 'snack';
      })
      .map((r) => ({
        id: r.id,
        title: recipeTitle(r.id),
        mealLabel: t(MEAL_LABEL_KEYS[r.meal]),
      }));
  }, [allRecipes, recipeTitle, sheet, t]);

  const handleOpenAdd = useCallback((date: string, slot: PlanSlot) => {
    setSheet({
      mode: 'pick',
      date,
      slot,
      filterMeal: slot,
      portions: 2,
    });
  }, []);

  const handleOpenSwap = useCallback((item: PlanItem) => {
    setSheet({
      mode: 'pick',
      date: item.date,
      slot: item.slot,
      filterMeal: item.slot,
      itemId: item.id,
      portions: item.portions,
    });
  }, []);

  const handlePickRecipe = useCallback((recipeId: RecipeId) => {
    const rec = getRecipe(recipeId);
    setSheet((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        mode: 'form',
        recipeId,
        portions: prev.itemId
          ? prev.portions
          : coercePlanPortions(rec?.servings ?? 2),
      };
    });
  }, []);

  const handleConfirmSheet = useCallback(() => {
    if (!sheet || !sheet.recipeId) {
      return;
    }
    const nextItem: PlanItem = {
      id: sheet.itemId ?? newPlanItemId(),
      date: sheet.date,
      slot: sheet.slot,
      recipeId: sheet.recipeId,
      portions: coercePlanPortions(sheet.portions),
    };
    setSheet(null);
    void upsertItem(nextItem).then(() => {
      showToast(t('recipe.addplan.toast'));
    });
  }, [sheet, showToast, t, upsertItem]);

  return (
    <Screen
      header={
        <div>
          <h1>{t('plan.title')}</h1>
          <p className="edo-cap">{t('plan.sub')}</p>
        </div>
      }
    >
      <div className="edo-stack">
        <div className="edo-stack edo-stack-sm">
          <p className="edo-section-heading">{t('plan.days')}</p>
          <div
            id="planDays"
            className="edo-segmented edo-plan-seg"
            role="group"
            aria-label={t('plan.days')}
            data-testid="plan-days-group"
          >
            {DAY_CHOICES.map((d) => (
              <button
                key={d}
                type="button"
                className="edo-seg-btn"
                aria-pressed={plan.days === d}
                data-testid={`plan-days-${d}`}
                onClick={() => void setDays(d)}
              >
                {t('plan.days.n', { n: d })}
              </button>
            ))}
          </div>
        </div>

        <div className="edo-stack" data-testid="plan-list">
          {dates.map((iso) => {
            const dayItems = plan.items.filter((it) => it.date === iso);
            const totals = dayPlanNutrition(dayItems, getRecipe);

            return (
              <section
                key={iso}
                className="edo-plan-day"
                data-testid={`plan-day-${iso}`}
              >
                <div className="edo-plan-day-head">
                  <b>{dayLabel(iso)}</b>
                  {totals.hasValues ? (
                    <span
                      className="edo-cap"
                      data-testid={`plan-day-total-${iso}`}
                    >
                      {t('plan.total', {
                        kcal: fmtNumber(totals.kcal),
                        p: fmtNumber(totals.protein),
                      })}
                    </span>
                  ) : null}
                </div>

                {PLAN_SLOTS.map((slot) => {
                  const slotItems = dayItems.filter((it) => it.slot === slot);
                  const showAddButton =
                    slot === 'snack' || slotItems.length === 0;

                  return (
                    <div
                      key={slot}
                      className="edo-plan-slot"
                      data-testid={`plan-slot-${iso}-${slot}`}
                    >
                      <p className="edo-plan-slot-label">
                        {t(MEAL_LABEL_KEYS[slot])}
                      </p>

                      {slotItems.map((it) => {
                        const rec = getRecipe(it.recipeId);
                        const title = recipeTitle(it.recipeId);
                        const photo = rec ? getRecipePhoto(rec, 'thumb') : null;
                        const itemTotals = rec
                          ? nutrientsForServings(rec, it.portions)
                          : null;
                        const metaText = itemTotals
                          ? `${t('plan.portions')} · ${it.portions} · ${t(
                              'plan.total',
                              {
                                kcal: fmtNumber(itemTotals.kcal),
                                p: fmtNumber(Math.round(itemTotals.protein)),
                              },
                            )}`
                          : `${t('plan.portions')} · ${it.portions}`;

                        return (
                          <div
                            key={it.id}
                            className="edo-plan-item"
                            data-testid={`plan-item-${it.id}`}
                          >
                            {rec ? (
                              <div
                                className={
                                  photo
                                    ? 'edo-plan-thumb edo-rimg-has-photo'
                                    : `edo-plan-thumb edo-rimg-ph edo-rimg-${toneForRecipe(rec.id)}`
                                }
                                aria-hidden="true"
                              >
                                {photo ? (
                                  <img
                                    className="edo-plan-thumb-img"
                                    src={photo.src}
                                    alt=""
                                    width={photo.width}
                                    height={photo.height}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  <span className="edo-rimg-placeholder">
                                    <Icon name="leaf" size="sm" />
                                  </span>
                                )}
                              </div>
                            ) : null}

                            <button
                              type="button"
                              className="edo-plan-item-main edo-grow"
                              aria-label={t('plan.filled', {
                                name: title,
                                n: it.portions,
                              })}
                              data-testid={`plan-open-${it.id}`}
                              onClick={() => navigate(`/rezept/${it.recipeId}`)}
                            >
                              <b>{title}</b>
                              <span className="edo-cap edo-plan-item-meta">
                                {metaText}
                              </span>
                            </button>

                            <div className="edo-plan-actions">
                              <button
                                type="button"
                                className="edo-plan-iconbtn"
                                aria-label={`${t('plan.swap')}: ${title}`}
                                data-testid={`plan-swap-${it.id}`}
                                onClick={() => handleOpenSwap(it)}
                              >
                                <Icon name="utensils" size="sm" />
                              </button>
                              <button
                                type="button"
                                className="edo-plan-iconbtn"
                                aria-label={t('plan.slot.remove', {
                                  name: title,
                                })}
                                data-testid={`plan-remove-${it.id}`}
                                onClick={() => void removeItem(it.id)}
                              >
                                <Icon name="trash" size="sm" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {showAddButton ? (
                        <button
                          type="button"
                          className="edo-plan-empty"
                          data-testid={`plan-add-${iso}-${slot}`}
                          onClick={() => handleOpenAdd(iso, slot)}
                        >
                          {t('plan.empty')}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>

      <PlanSheet
        open={sheet !== null}
        mode={sheet?.mode ?? 'pick'}
        title={sheet?.mode === 'pick' ? t('plan.pick') : t('plan.add.title')}
        closeLabel={t('dialog.close')}
        recipeTitle={sheet?.recipeId ? recipeTitle(sheet.recipeId) : undefined}
        pickOptions={pickOptions}
        dayOptions={dayOptions}
        selectedDate={sheet?.date}
        slotOptions={slotOptions}
        selectedSlot={sheet?.slot}
        portions={sheet?.portions ?? 2}
        dayHeading={t('plan.day')}
        mealHeading={t('plan.meal')}
        portionsHeading={t('plan.portions')}
        portionsDecLabel={`${t('plan.portions')} −`}
        portionsIncLabel={`${t('plan.portions')} +`}
        confirmLabel={t('plan.confirm')}
        cancelLabel={t('plan.cancel')}
        onPickRecipe={handlePickRecipe}
        onSelectDate={(iso) =>
          setSheet((prev) => (prev ? { ...prev, date: iso } : null))
        }
        onSelectSlot={(slot) =>
          setSheet((prev) => (prev ? { ...prev, slot } : null))
        }
        onChangePortions={(portions) =>
          setSheet((prev) => (prev ? { ...prev, portions } : null))
        }
        onConfirm={handleConfirmSheet}
        onClose={() => setSheet(null)}
      />

      <Toast message={toastMsg} />
    </Screen>
  );
}
