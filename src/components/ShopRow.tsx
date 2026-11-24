import type { FoodId, ShopState, Unit } from '../domain/index.ts';
import { Icon } from './Icon.tsx';

export interface ShopRowProps {
  readonly id: string;
  readonly food: FoodId;
  readonly unit?: Unit;
  readonly name: string;
  readonly amountText: string;
  readonly buyAmountText?: string;
  readonly isPartial: boolean;
  readonly qtyBuyOfAria?: string;
  readonly state: ShopState;
  readonly toggleLabel: string;
  readonly haveButtonLabel: string;
  readonly haveButtonAriaLabel: string;
  readonly isHaveOpen: boolean;
  readonly hasSource: boolean;
  readonly sourceAriaLabel?: string;
  readonly isSourceOpen: boolean;
  readonly onToggleCart: (id: string) => void;
  readonly onOpenSource: (id: string, trigger: HTMLButtonElement) => void;
  readonly onOpenHave: (id: string, trigger: HTMLButtonElement) => void;
}

/**
 * Einzelne Einkaufszeile gemäss Prototyp v5.9 (`shopRow` in `prototype/app.js` / `styles.css`):
 * - Keine Rezept-/Herkunftszeile unter der Zutat; stattdessen ⓘ-Knopf (Icon 28×28,
 *   Tippfläche 56×56, 16 px Abstand zur Abhakfläche, Geschwister-Button ohne Abhaken)
 * - Teilmenge: Kaufmenge normal + Bedarf durchgestrichen (`aria-hidden`), Screenreader
 *   erhält «kaufen {buy} von {need}», oranger «Teilweise»-Knopf (mind. 48×48)
 * - «Hab ich» / «Teilweise» / «Doch kaufen» öffnen alle dasselbe Vorrats-Sheet; im Korb kein Knopf
 */
export function ShopRow({
  id,
  food,
  unit,
  name,
  amountText,
  buyAmountText,
  isPartial,
  qtyBuyOfAria,
  state,
  toggleLabel,
  haveButtonLabel,
  haveButtonAriaLabel,
  isHaveOpen,
  hasSource,
  sourceAriaLabel,
  isSourceOpen,
  onToggleCart,
  onOpenSource,
  onOpenHave,
}: ShopRowProps) {
  const dataKey = `${food}:${unit ?? ''}`;

  const qtyBlock =
    isPartial && buyAmountText && amountText ? (
      <span
        className="edo-shop-qty"
        aria-label={qtyBuyOfAria}
        data-testid={`shop-qty-${id}`}
      >
        <span className="edo-shop-qty-buy" aria-hidden="true">
          {buyAmountText}
        </span>
        <span className="edo-shop-qty-need" aria-hidden="true">
          {amountText}
        </span>
      </span>
    ) : amountText ? (
      <span className="edo-cap edo-shoprow-amt" data-testid={`shop-qty-${id}`}>
        {amountText}
      </span>
    ) : null;

  const sourceBtn = hasSource ? (
    <button
      type="button"
      className="edo-shop-src-btn"
      data-shop-src={dataKey}
      data-testid={`shop-src-${id}`}
      aria-haspopup="dialog"
      aria-expanded={isSourceOpen}
      aria-label={sourceAriaLabel}
      onClick={(event) => onOpenSource(id, event.currentTarget)}
    >
      <Icon name="info" />
    </button>
  ) : null;

  const haveBtn =
    state !== 'cart' ? (
      <button
        type="button"
        className={
          state !== 'home' && isPartial
            ? 'edo-havebtn edo-havebtn-partial'
            : 'edo-havebtn'
        }
        data-shop-have={dataKey}
        data-testid={`shop-have-${id}`}
        aria-haspopup="dialog"
        aria-expanded={isHaveOpen}
        aria-label={haveButtonAriaLabel}
        onClick={(event) => onOpenHave(id, event.currentTarget)}
      >
        {haveButtonLabel}
      </button>
    ) : null;

  const rowClass = [
    'edo-shoprow',
    state === 'cart' ? 'edo-shoprow-incart' : '',
    state === 'home' ? 'edo-shoprow-athome' : '',
    isPartial ? 'edo-shoprow-partial' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (state === 'home') {
    return (
      <div
        className={rowClass}
        data-testid={`shop-row-${id}`}
        data-state="home"
      >
        <span className="edo-circ edo-circ-sm" aria-hidden="true">
          <Icon name="home" size="sm" />
        </span>
        <span className="edo-grow edo-shop-nm-line">
          <span className="edo-shoprow-nm">{name}</span>
          {qtyBlock}
        </span>
        {sourceBtn}
        {haveBtn}
      </div>
    );
  }

  const inCart = state === 'cart';

  return (
    <div
      className={rowClass}
      data-testid={`shop-row-${id}`}
      data-state={state}
      data-partial={isPartial ? 'true' : undefined}
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
        <span className="edo-grow edo-shop-nm-line">
          <span className="edo-shoprow-nm">{name}</span>
          {qtyBlock}
        </span>
      </button>
      {sourceBtn}
      {haveBtn}
    </div>
  );
}
