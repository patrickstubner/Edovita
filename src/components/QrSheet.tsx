import { useEffect } from 'react';
import { Icon } from './Icon.tsx';
import { QrCodeSvg } from './QrCodeSvg.tsx';

export interface QrSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly subtitle: string;
  readonly qrSize: number | null;
  readonly qrPath: string | null;
  readonly errorText: string;
  readonly emptyText: string;
  readonly isEmpty: boolean;
  readonly fragmentPreview: string;
  readonly copyLabel: string;
  readonly receiveNote: string;
  readonly securityNote: string;
  readonly closeLabel: string;
  readonly onCopy: () => void;
  readonly onClose: () => void;
}

/**
 * Dialog für die lokale QR-Einkaufsliste (kein Server, URL-Fragment, Escape/Backdrop schliesst).
 */
export function QrSheet({
  open,
  title,
  subtitle,
  qrSize,
  qrPath,
  errorText,
  emptyText,
  isEmpty,
  fragmentPreview,
  copyLabel,
  receiveNote,
  securityNote,
  closeLabel,
  onCopy,
  onClose,
}: QrSheetProps) {
  useEffect(() => {
    if (!open) return undefined;
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
      data-testid="qr-sheet-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="edo-modal-card edo-stack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edo-qr-dialog-title"
        data-testid="qr-sheet"
      >
        <div className="edo-row edo-row-sp">
          <h2 id="edo-qr-dialog-title">{title}</h2>
          <button
            type="button"
            className="edo-back-btn"
            aria-label={closeLabel}
            data-testid="qr-sheet-close"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <p className="edo-sub">{subtitle}</p>

        {isEmpty ? (
          <p className="edo-cap">{emptyText}</p>
        ) : (
          <div className="edo-card edo-stack edo-center">
            {qrSize !== null && qrPath !== null ? (
              <QrCodeSvg size={qrSize} path={qrPath} label={title} />
            ) : (
              <p className="edo-cap">{errorText}</p>
            )}
            <p className="edo-cap edo-mono" data-testid="qr-fragment-preview">
              {fragmentPreview}
            </p>
            <button
              type="button"
              className="edo-btn edo-btn-secondary"
              data-testid="qr-copy-btn"
              onClick={onCopy}
            >
              <Icon name="qr" size="sm" />
              <span>{copyLabel}</span>
            </button>
          </div>
        )}

        <p className="edo-cap">{receiveNote}</p>
        <p className="edo-cap">{securityNote}</p>
      </div>
    </div>
  );
}
