import { useEffect, useRef } from 'react';
import { Icon } from './Icon.tsx';

export interface ShopSourceLineItem {
  readonly key: string;
  readonly text: string;
}

export interface ShopSourceSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly lines: readonly ShopSourceLineItem[];
  readonly sumText: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
}

/**
 * Herkunfts-Sheet für Rezept-Zutaten gemäss Prototyp v5.8.1/v5.9 (`#shopSrcSheet`):
 * Zeigt Zutatenname als Titel, pro Rezept Gericht + Menge sowie die berechnete Summe.
 * Schliesst per Escape, Hintergrund oder Schliessen-Knopf (Fokus kehrt auf das ⓘ zurück).
 */
export function ShopSourceSheet({
  open,
  title,
  lines,
  sumText,
  closeLabel,
  onClose,
}: ShopSourceSheetProps) {
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

  return (
    <div
      className="edo-modal-backdrop"
      data-testid="shop-src-backdrop"
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
        aria-labelledby="edo-shop-src-title"
        data-testid="shop-src-sheet"
      >
        <div className="edo-row edo-row-sp">
          <h2 id="edo-shop-src-title">{title}</h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="edo-back-btn"
            aria-label={closeLabel}
            data-testid="shop-src-close"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <ul className="edo-shop-src-list" data-testid="shop-src-list">
          {lines.map((line) => (
            <li key={line.key} className="edo-shop-src-item">
              {line.text}
            </li>
          ))}
          <li className="edo-shop-src-sum" data-testid="shop-src-sum">
            {sumText}
          </li>
        </ul>
      </div>
    </div>
  );
}
