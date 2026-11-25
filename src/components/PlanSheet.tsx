import { useEffect, useRef } from 'react';
import {
  PLAN_PORTIONS_MAX,
  PLAN_PORTIONS_MIN,
  type PlanSlot,
  type RecipeId,
} from '../domain/index.ts';
import { Icon } from './Icon.tsx';

export interface PlanPickOption {
  readonly id: RecipeId;
  readonly title: string;
  readonly mealLabel: string;
}

export interface PlanDayOption {
  readonly iso: string;
  readonly label: string;
}

export interface PlanSlotOption {
  readonly slot: PlanSlot;
  readonly label: string;
}

export interface PlanSheetProps {
  readonly open: boolean;
  readonly mode: 'pick' | 'form';
  readonly title: string;
  readonly closeLabel: string;
  readonly recipeTitle?: string;
  readonly pickOptions?: readonly PlanPickOption[];
  readonly dayOptions?: readonly PlanDayOption[];
  readonly selectedDate?: string;
  readonly slotOptions?: readonly PlanSlotOption[];
  readonly selectedSlot?: PlanSlot;
  readonly portions?: number;
  readonly dayHeading?: string;
  readonly mealHeading?: string;
  readonly portionsHeading?: string;
  readonly portionsDecLabel?: string;
  readonly portionsIncLabel?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onPickRecipe?: (recipeId: RecipeId) => void;
  readonly onSelectDate?: (iso: string) => void;
  readonly onSelectSlot?: (slot: PlanSlot) => void;
  readonly onChangePortions?: (next: number) => void;
  readonly onConfirm?: () => void;
  readonly onClose: () => void;
}

/**
 * Modales Plan-Sheet (Prototyp `#planSheet`, E10 / Issue #35):
 * - Modus `pick`: Rezeptwahl gefiltert nach Slot.
 * - Modus `form`: Tag, Mahlzeit, Portionen-Stepper 1–8 (`aria-live`), Hinzufügen / Abbrechen.
 * Schliesst per Escape, Hintergrundklick oder Schliessen-Knopf und gibt Fokus zurück.
 */
export function PlanSheet({
  open,
  mode,
  title,
  closeLabel,
  recipeTitle,
  pickOptions = [],
  dayOptions = [],
  selectedDate,
  slotOptions = [],
  selectedSlot,
  portions = 2,
  dayHeading,
  mealHeading,
  portionsHeading,
  portionsDecLabel,
  portionsIncLabel,
  confirmLabel,
  cancelLabel,
  onPickRecipe,
  onSelectDate,
  onSelectSlot,
  onChangePortions,
  onConfirm,
  onClose,
}: PlanSheetProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    prevFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    titleRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      prevFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="edo-sheet-backdrop"
      role="presentation"
      data-testid="plan-sheet-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="planSheet"
        className="edo-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-sheet-title"
        data-testid="plan-sheet"
      >
        <div className="edo-row edo-row-between">
          <h2 id="plan-sheet-title" ref={titleRef} tabIndex={-1}>
            {title}
          </h2>
          <button
            type="button"
            className="edo-back-btn"
            aria-label={closeLabel}
            data-testid="plan-sheet-close"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        {mode === 'pick' ? (
          <div className="edo-stack" data-testid="plan-pick-list">
            {pickOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="edo-plan-pick-row"
                data-plan-pick={opt.id}
                data-testid={`plan-pick-${opt.id}`}
                onClick={() => onPickRecipe?.(opt.id)}
              >
                <b className="edo-grow">{opt.title}</b>
                <span className="edo-cap">{opt.mealLabel}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="edo-stack" data-testid="plan-form">
            {recipeTitle ? <p className="edo-plan-form-title">{recipeTitle}</p> : null}

            {dayHeading ? (
              <div className="edo-stack edo-stack-sm">
                <p className="edo-section-heading">{dayHeading}</p>
                <div
                  className="edo-segmented edo-plan-seg"
                  role="group"
                  aria-label={dayHeading}
                >
                  {dayOptions.map((day) => {
                    const active = day.iso === selectedDate;
                    return (
                      <button
                        key={day.iso}
                        type="button"
                        className="edo-seg-btn"
                        aria-pressed={active}
                        data-plan-day={day.iso}
                        data-testid={`plan-day-opt-${day.iso}`}
                        onClick={() => onSelectDate?.(day.iso)}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {mealHeading ? (
              <div className="edo-stack edo-stack-sm">
                <p className="edo-section-heading">{mealHeading}</p>
                <div
                  className="edo-segmented edo-plan-seg"
                  role="group"
                  aria-label={mealHeading}
                >
                  {slotOptions.map((opt) => {
                    const active = opt.slot === selectedSlot;
                    return (
                      <button
                        key={opt.slot}
                        type="button"
                        className="edo-seg-btn"
                        aria-pressed={active}
                        data-plan-slot={opt.slot}
                        data-testid={`plan-slot-opt-${opt.slot}`}
                        onClick={() => onSelectSlot?.(opt.slot)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {portionsHeading ? (
              <div className="edo-stack edo-stack-sm">
                <p className="edo-section-heading">{portionsHeading}</p>
                <div className="edo-plan-stepper">
                  <button
                    type="button"
                    className="edo-step-btn"
                    aria-label={portionsDecLabel ?? `${portionsHeading} −`}
                    disabled={portions <= PLAN_PORTIONS_MIN}
                    data-testid="plan-portions-dec"
                    onClick={() =>
                      onChangePortions?.(
                        Math.max(PLAN_PORTIONS_MIN, portions - 1),
                      )
                    }
                  >
                    −
                  </button>
                  <output
                    className="edo-plan-portions-out"
                    aria-live="polite"
                    data-testid="plan-portions-output"
                  >
                    {portions}
                  </output>
                  <button
                    type="button"
                    className="edo-step-btn"
                    aria-label={portionsIncLabel ?? `${portionsHeading} +`}
                    disabled={portions >= PLAN_PORTIONS_MAX}
                    data-testid="plan-portions-inc"
                    onClick={() =>
                      onChangePortions?.(
                        Math.min(PLAN_PORTIONS_MAX, portions + 1),
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ) : null}

            <div className="edo-stack edo-stack-sm">
              <button
                type="button"
                className="edo-btn"
                data-testid="plan-sheet-confirm"
                onClick={() => onConfirm?.()}
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                className="edo-btn edo-btn-secondary"
                data-testid="plan-sheet-cancel"
                onClick={onClose}
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
