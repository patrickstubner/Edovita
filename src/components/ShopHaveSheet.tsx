import { useEffect, useRef } from 'react';
import { Icon } from './Icon.tsx';

export interface ShopHaveSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly hint: string;
  readonly allLabel: string;
  readonly atHomeLabel: string;
  readonly resetLabel: string;
  readonly applyLabel: string;
  readonly sliderLabel: string;
  readonly minusLabel: string;
  readonly plusLabel: string;
  readonly closeLabel: string;
  readonly need: number | null;
  readonly step: number;
  readonly draftAll: boolean;
  readonly draftValue: number;
  readonly formattedValue: string;
  readonly onToggleAll: () => void;
  readonly onStepMinus: () => void;
  readonly onStepPlus: () => void;
  readonly onSliderChange: (value: number) => void;
  readonly onReset: () => void;
  readonly onApply: () => void;
  readonly onClose: () => void;
}

/**
 * «Hab ich»-Sheet gemäss Prototyp v5.9 (`#shopHaveSheet`):
 * Option «Alles vorhanden» (`role="checkbox"`), darunter «Davon schon zu Hause: {qty}»
 * mit Stepper (−/+) und Schieber (`input type="range"`), dazu «Zurücksetzen» und «Übernehmen».
 * Verwerfen (Escape / Hintergrund / Schliessen) übernimmt nichts.
 */
export function ShopHaveSheet({
  open,
  title,
  hint,
  allLabel,
  atHomeLabel,
  resetLabel,
  applyLabel,
  sliderLabel,
  minusLabel,
  plusLabel,
  closeLabel,
  need,
  step,
  draftAll,
  draftValue,
  formattedValue,
  onToggleAll,
  onStepMinus,
  onStepPlus,
  onSliderChange,
  onReset,
  onApply,
  onClose,
}: ShopHaveSheetProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    closeBtnRef.current?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const hasNumericNeed = need !== null && need > 0;
  const effectiveSliderValue =
    hasNumericNeed && draftAll ? need : hasNumericNeed ? draftValue : 0;

  return (
    <div
      className="edo-modal-backdrop"
      data-testid="shop-have-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="edo-modal-card edo-shop-sheet edo-stack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edo-shop-have-title"
        data-testid="shop-have-sheet"
      >
        <div className="edo-row edo-row-sp">
          <h2 id="edo-shop-have-title">{title}</h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="edo-back-btn"
            aria-label={closeLabel}
            data-testid="shop-have-close"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <p className="edo-shop-have-hint">{hint}</p>

        <button
          type="button"
          role="checkbox"
          aria-checked={draftAll}
          className={
            draftAll ? 'edo-shop-have-all edo-shop-have-all-on' : 'edo-shop-have-all'
          }
          data-testid="shop-have-all"
          onClick={onToggleAll}
        >
          <span className="edo-cb" aria-hidden="true">
            <Icon name="check" size="sm" />
          </span>
          <span className="edo-grow edo-shop-have-all-lab">{allLabel}</span>
        </button>

        <p className="edo-shop-have-amt" data-testid="shop-have-amt">
          {atHomeLabel}
        </p>

        {hasNumericNeed ? (
          <div className="edo-shop-have-ctrl">
            <div className="edo-stepper edo-shop-have-step">
              <button
                type="button"
                className="edo-stepbtn"
                aria-label={minusLabel}
                data-testid="shop-have-minus"
                onClick={onStepMinus}
              >
                –
              </button>
              <output className="edo-shop-have-out" data-testid="shop-have-out">
                {formattedValue}
              </output>
              <button
                type="button"
                className="edo-stepbtn"
                aria-label={plusLabel}
                data-testid="shop-have-plus"
                onClick={onStepPlus}
              >
                +
              </button>
            </div>
            <input
              type="range"
              className="edo-shop-have-range"
              min={0}
              max={need}
              step={step}
              value={effectiveSliderValue}
              aria-label={sliderLabel}
              aria-valuetext={formattedValue}
              data-testid="shop-have-range"
              onChange={(event) => onSliderChange(Number(event.target.value))}
            />
          </div>
        ) : null}

        <div className="edo-shop-have-actions">
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            data-testid="shop-have-reset"
            onClick={onReset}
          >
            {resetLabel}
          </button>
          <button
            type="button"
            className="edo-btn"
            data-testid="shop-have-apply"
            onClick={onApply}
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
