import type { ShopState } from '../domain/index.ts';
import { Icon } from './Icon.tsx';

export interface ShopRowProps {
  readonly id: string;
  readonly name: string;
  readonly amountText: string;
  readonly state: ShopState;
  readonly toggleLabel: string;
  readonly haveLabel: string;
  readonly undoLabel: string;
  readonly onToggleCart: (id: string) => void;
  readonly onMarkHome: (id: string) => void;
  readonly onMarkOpen: (id: string) => void;
}

/**
 * Einzelne Einkaufszeile gemäss Prototyp (`shopRow` in `prototype/app.js` / `styles.css`):
 * - `open`: Checkbox-Button («in den Korb») + rechts «Hab ich» (44 px Tap-Fläche)
 * - `cart`: durchgestrichen + Häkchen aktiv, Antippen setzt zurück auf `open`
 * - `home`: Haus-Symbol + Name + «Doch kaufen»-Button (`open`)
 */
export function ShopRow({
  id,
  name,
  amountText,
  state,
  toggleLabel,
  haveLabel,
  undoLabel,
  onToggleCart,
  onMarkHome,
  onMarkOpen,
}: ShopRowProps) {
  if (state === 'home') {
    return (
      <div
        className="edo-shoprow edo-shoprow-athome"
        data-testid={`shop-row-${id}`}
        data-state="home"
      >
        <span className="edo-circ edo-circ-sm" aria-hidden="true">
          <Icon name="home" size="sm" />
        </span>
        <span className="edo-grow edo-shoprow-home-text">
          <span className="edo-shoprow-nm">{name}</span>
          {amountText ? (
            <small className="edo-cap edo-shoprow-amt">{amountText}</small>
          ) : null}
        </span>
        <button
          type="button"
          className="edo-havebtn"
          data-testid={`shop-undo-home-${id}`}
          onClick={() => onMarkOpen(id)}
        >
          {undoLabel}
        </button>
      </div>
    );
  }

  const inCart = state === 'cart';

  return (
    <div
      className={inCart ? 'edo-shoprow edo-shoprow-incart' : 'edo-shoprow'}
      data-testid={`shop-row-${id}`}
      data-state={state}
    >
      <button
        type="button"
        className={inCart ? 'edo-chk edo-chk-on edo-grow' : 'edo-chk edo-grow'}
        aria-pressed={inCart}
        aria-label={toggleLabel}
        data-testid={`shop-toggle-${id}`}
        onClick={() => onToggleCart(id)}
      >
        <span className="edo-cb" aria-hidden="true">
          <Icon name="check" size="sm" />
        </span>
        <span className="edo-shoprow-nm edo-grow">{name}</span>
        {amountText ? (
          <span className="edo-cap edo-shoprow-amt">{amountText}</span>
        ) : null}
      </button>
      {!inCart ? (
        <button
          type="button"
          className="edo-havebtn"
          data-testid={`shop-have-${id}`}
          onClick={() => onMarkHome(id)}
        >
          {haveLabel}
        </button>
      ) : null}
    </div>
  );
}
