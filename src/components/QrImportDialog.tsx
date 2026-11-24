import { useEffect } from 'react';
import type { ImportShopItem, ShopState } from '../domain/index.ts';
import { Icon } from './Icon.tsx';

export interface QrImportDialogProps {
  readonly items: readonly ImportShopItem[] | null;
  readonly title: string;
  readonly subtitle: string;
  readonly stateLabels: Readonly<Record<ShopState, string>>;
  readonly formatAmount: (item: ImportShopItem) => string;
  readonly mergeLabel: string;
  readonly replaceLabel: string;
  readonly cancelLabel: string;
  readonly closeLabel: string;
  readonly onMerge: () => void;
  readonly onReplace: () => void;
  readonly onCancel: () => void;
}

/**
 * Sicherheits-Bestätigungsdialog vor Übernahme eines geprüften QR-Imports (Issue #11, ADR-004).
 * Zeigt eine Vorschau aller geprüften Artikel (Name, optionale Menge, Zustand) und lässt
 * explizit zwischen «Ergänzen», «Liste ersetzen» und «Abbrechen» wählen.
 */
export function QrImportDialog({
  items,
  title,
  subtitle,
  stateLabels,
  formatAmount,
  mergeLabel,
  replaceLabel,
  cancelLabel,
  closeLabel,
  onMerge,
  onReplace,
  onCancel,
}: QrImportDialogProps) {
  const isOpen = items !== null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!items) {
    return null;
  }

  return (
    <div
      className="edo-modal-backdrop"
      data-testid="qr-import-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="edo-modal-card edo-stack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edo-qr-import-title"
        data-testid="qr-import-dialog"
      >
        <div className="edo-row edo-row-sp">
          <h2 id="edo-qr-import-title">{title}</h2>
          <button
            type="button"
            className="edo-back-btn"
            aria-label={closeLabel}
            onClick={onCancel}
          >
            <Icon name="x" />
          </button>
        </div>

        <p className="edo-sub">{subtitle}</p>

        <ul className="edo-import-preview" data-testid="qr-import-preview">
          {items.map((item, index) => {
            const amt = formatAmount(item);
            return (
              <li
                key={`${item.id}-${index}`}
                className="edo-import-preview-row"
              >
                <span className="edo-grow">
                  <span className="edo-shoprow-nm">{item.name}</span>
                  {amt ? (
                    <span className="edo-cap edo-shoprow-amt"> · {amt}</span>
                  ) : null}
                </span>
                <span className="edo-chip">{stateLabels[item.st]}</span>
              </li>
            );
          })}
        </ul>

        <div className="edo-stack">
          <button
            type="button"
            className="edo-btn"
            data-testid="qr-import-merge"
            onClick={onMerge}
          >
            {mergeLabel}
          </button>
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            data-testid="qr-import-replace"
            onClick={onReplace}
          >
            {replaceLabel}
          </button>
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            data-testid="qr-import-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
