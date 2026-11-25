import { useEffect, useRef } from 'react';
import type { TextDir } from '../domain/index.ts';
import { BilingualName } from './BilingualName.tsx';
import { BilingualText } from './BilingualText.tsx';
import { Icon } from './Icon.tsx';

export interface ShopHaveSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly titleSecondary?: string | null;
  readonly secondaryLocale?: string;
  readonly secondaryDir?: TextDir;
  readonly hint: string;
  readonly hintSecondary?: string;
  readonly allLabel: string;
  readonly allSecondary?: string;
  readonly atHomeLabel: string;
  readonly atHomeSecondary?: string;
  readonly resetLabel: string;
  readonly resetSecondary?: string;
  readonly applyLabel: string;
  readonly applySecondary?: string;
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
 * «Hab ich»-Sheet gemäss Prototyp v5.10.1 (`#shopHaveSheet`) & Issue #32:
 * Titel, Hinweis, Option «Alles vorhanden» (`role="checkbox"`), «Davon schon zu Hause: {qty}»
 * sowie «Zurücksetzen» und «Übernehmen» erscheinen bei aktiver Zweitsprache zweisprachig.
 * Verwerfen (Escape / Hintergrund / Schliessen) übernimmt nichts.
 */
export function ShopHaveSheet({
  open,
  title,
  titleSecondary,
  secondaryLocale,
  secondaryDir,
  hint,
  hintSecondary,
  allLabel,
  allSecondary,
  atHomeLabel,
  atHomeSecondary,
  resetLabel,
  resetSecondary,
  applyLabel,
  applySecondary,
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
          <h2 id="edo-shop-have-title" className="edo-shop-sheet-title">
            <BilingualName
              layout="stack"
              main={title}
              secondary={titleSecondary}
              secondaryLang={secondaryLocale}
              secondaryDir={secondaryDir}
            />
          </h2>
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

        <p className="edo-shop-have-hint" data-testid="shop-have-hint">
          <BilingualText
            main={hint}
            secondary={hintSecondary}
            secondaryLang={secondaryLocale}
            secondaryDir={secondaryDir}
          />
        </p>

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
          <span className="edo-grow edo-shop-have-all-lab">
            <BilingualText
              main={allLabel}
              secondary={allSecondary}
              secondaryLang={secondaryLocale}
              secondaryDir={secondaryDir}
            />
          </span>
        </button>

        <p className="edo-shop-have-amt" data-testid="shop-have-amt">
          <BilingualText
            main={atHomeLabel}
            secondary={atHomeSecondary}
            secondaryLang={secondaryLocale}
            secondaryDir={secondaryDir}
          />
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
            <BilingualText
              main={resetLabel}
              secondary={resetSecondary}
              secondaryLang={secondaryLocale}
              secondaryDir={secondaryDir}
            />
          </button>
          <button
            type="button"
            className="edo-btn"
            data-testid="shop-have-apply"
            onClick={onApply}
          >
            <BilingualText
              main={applyLabel}
              secondary={applySecondary}
              secondaryLang={secondaryLocale}
              secondaryDir={secondaryDir}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
