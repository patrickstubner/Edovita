import { useEffect, useRef } from 'react';
import { Icon } from './Icon.tsx';

export interface DataImportSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly closeLabel: string;
  readonly planPreview?: string | null;
  readonly shopPreview?: string | null;
  readonly shopItemNames?: readonly string[];
  readonly hasMoreShopItems?: boolean;
  readonly cancelLabel: string;
  readonly applyLabel: string;
  readonly onCancel: () => void;
  readonly onApply: () => void;
}

/**
 * Bestätigungs-Sheet für den Datei-Import (`edovita-plan-einkauf.json`, Prototyp `#dataImportSheet`, E10).
 * Zeigt die geprüfte Vorschau und übernimmt erst nach ausdrücklicher Bestätigung.
 */
export function DataImportSheet({
  open,
  title,
  closeLabel,
  planPreview,
  shopPreview,
  shopItemNames = [],
  hasMoreShopItems = false,
  cancelLabel,
  applyLabel,
  onCancel,
  onApply,
}: DataImportSheetProps) {
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
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      prevFocusRef.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="edo-sheet-backdrop"
      role="presentation"
      data-testid="data-import-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        id="dataImportSheet"
        className="edo-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-import-title"
        data-testid="data-import-sheet"
      >
        <div className="edo-row edo-row-between">
          <h2 id="data-import-title" ref={titleRef} tabIndex={-1}>
            {title}
          </h2>
          <button
            type="button"
            className="edo-back-btn"
            aria-label={closeLabel}
            data-testid="data-import-close"
            onClick={onCancel}
          >
            <Icon name="x" />
          </button>
        </div>

        <div className="edo-stack edo-stack-sm">
          {planPreview ? (
            <p className="edo-cap" data-testid="data-import-preview-plan">
              {planPreview}
            </p>
          ) : null}
          {shopPreview ? (
            <p className="edo-cap" data-testid="data-import-preview-shop">
              {shopPreview}
            </p>
          ) : null}
          {shopItemNames.length > 0 ? (
            <ul className="edo-import-preview">
              {shopItemNames.map((name, idx) => (
                <li key={`${name}-${idx}`}>{name}</li>
              ))}
              {hasMoreShopItems ? <li className="edo-cap">…</li> : null}
            </ul>
          ) : null}
        </div>

        <div className="edo-sheet-actions">
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            data-testid="data-import-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="edo-btn"
            data-testid="data-import-apply"
            onClick={onApply}
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
