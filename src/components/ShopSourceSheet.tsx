import { useEffect, useRef } from 'react';
import type { TextDir } from '../domain/index.ts';
import { BilingualName } from './BilingualName.tsx';
import { BilingualText } from './BilingualText.tsx';
import { Icon } from './Icon.tsx';

export interface ShopSourceLineItem {
  readonly key: string;
  readonly recipeTitle: string;
  readonly recipeTitleSecondary?: string | null;
  readonly qtyText: string;
}

export interface ShopSourceSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly titleSecondary?: string | null;
  readonly secondaryLocale?: string;
  readonly secondaryDir?: TextDir;
  readonly lines: readonly ShopSourceLineItem[];
  readonly sumText: string;
  readonly sumSecondary?: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
}

/**
 * Herkunfts-Sheet für Rezept-Zutaten gemäss Prototyp v5.10.1 (`#shopSrcSheet`) & Issue #32:
 * Zeigt Zutatenname zweizeilig gestapelt, pro Rezept Titel (zweizeilig nur bei vorliegender
 * Übersetzung in der Zweitsprache) + Menge darunter sowie die zweisprachige Summenzeile.
 * Schliesst per Escape, Hintergrund oder Schliessen-Knopf (Fokus kehrt auf das ⓘ zurück).
 */
export function ShopSourceSheet({
  open,
  title,
  titleSecondary,
  secondaryLocale,
  secondaryDir,
  lines,
  sumText,
  sumSecondary,
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
          <h2 id="edo-shop-src-title" className="edo-shop-sheet-title">
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
            data-testid="shop-src-close"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <ul className="edo-shop-src-list" data-testid="shop-src-list">
          {lines.map((line) => (
            <li key={line.key} className="edo-shop-src-item">
              <div className="edo-shop-src-name">
                <BilingualName
                  layout="stack"
                  main={line.recipeTitle}
                  secondary={line.recipeTitleSecondary}
                  secondaryLang={secondaryLocale}
                  secondaryDir={secondaryDir}
                />
              </div>
              <div className="edo-shop-src-meta">{line.qtyText}</div>
            </li>
          ))}
          <li className="edo-shop-src-sum" data-testid="shop-src-sum">
            <BilingualText
              main={sumText}
              secondary={sumSecondary}
              secondaryLang={secondaryLocale}
              secondaryDir={secondaryDir}
            />
          </li>
        </ul>
      </div>
    </div>
  );
}
