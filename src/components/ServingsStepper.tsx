import type { KeyboardEvent } from 'react';

export interface ServingsStepperProps {
  value: number;
  min?: number;
  max?: number;
  heading: string;
  countLabel: string;
  decrementLabel: string;
  incrementLabel: string;
  onChange: (next: number) => void;
}

/**
 * Portionsrechner (1–12) mit >= 44 px Tap-Flächen, voller Tastaturbedienung
 * (Pfeiltasten, +/-, Home/End) und `aria-live="polite"` für Screenreader.
 */
export function ServingsStepper({
  value,
  min = 1,
  max = 12,
  heading,
  countLabel,
  decrementLabel,
  incrementLabel,
  onChange,
}: ServingsStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
      case '-':
        if (canDecrement) {
          event.preventDefault();
          onChange(value - 1);
        }
        break;
      case 'ArrowRight':
      case 'ArrowUp':
      case '+':
      case '=':
        if (canIncrement) {
          event.preventDefault();
          onChange(value + 1);
        }
        break;
      case 'Home':
        if (value !== min) {
          event.preventDefault();
          onChange(min);
        }
        break;
      case 'End':
        if (value !== max) {
          event.preventDefault();
          onChange(max);
        }
        break;
      default:
        break;
    }
  };

  return (
    <section
      className="edo-card edo-row edo-row-between"
      aria-label={heading}
      data-testid="servings-stepper"
    >
      <div>
        <h2>{heading}</h2>
      </div>

      <div className="edo-step" onKeyDown={handleKeyDown}>
        <button
          type="button"
          className="edo-step-btn"
          aria-label={decrementLabel}
          disabled={!canDecrement}
          onClick={() => canDecrement && onChange(value - 1)}
          data-testid="servings-dec"
        >
          −
        </button>

        <div
          role="spinbutton"
          tabIndex={0}
          className="edo-step-val"
          aria-label={heading}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={countLabel}
          data-testid="servings-spinbutton"
        >
          <output
            aria-live="polite"
            aria-atomic="true"
            data-testid="servings-output"
          >
            {countLabel}
          </output>
        </div>

        <button
          type="button"
          className="edo-step-btn"
          aria-label={incrementLabel}
          disabled={!canIncrement}
          onClick={() => canIncrement && onChange(value + 1)}
          data-testid="servings-inc"
        >
          +
        </button>
      </div>
    </section>
  );
}
