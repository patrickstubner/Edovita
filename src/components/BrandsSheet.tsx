import { useEffect } from 'react';
import { Icon } from './Icon.tsx';

export interface BrandCardData {
  readonly id: string;
  readonly name: string;
  readonly storesText: string;
  readonly linesText: string;
}

export interface BrandsSheetProps {
  readonly open: boolean;
  readonly title: string;
  readonly subtitle: string;
  readonly brands: readonly BrandCardData[];
  readonly note: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
}

/**
 * Info-Dialog «Hausmarken» gemäss Prototyp (`markenBox` in `prototype/v1-features.js`),
 * erreichbar über das Info-Icon oben in der Einkaufsliste. Nur beschreibende Namen, keine Logos.
 */
export function BrandsSheet({
  open,
  title,
  subtitle,
  brands,
  note,
  closeLabel,
  onClose,
}: BrandsSheetProps) {
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
      data-testid="brands-sheet-backdrop"
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
        aria-labelledby="edo-brands-title"
        data-testid="brands-sheet"
      >
        <div className="edo-row edo-row-sp">
          <h2 id="edo-brands-title">{title}</h2>
          <button
            type="button"
            className="edo-back-btn"
            aria-label={closeLabel}
            data-testid="brands-sheet-close"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <p className="edo-sub">{subtitle}</p>

        <div className="edo-stack">
          {brands.map((brand) => (
            <div key={brand.id} className="edo-card edo-stack">
              <strong>{brand.name}</strong>
              <p className="edo-cap">{brand.storesText}</p>
              <p>{brand.linesText}</p>
            </div>
          ))}
        </div>

        <p className="edo-cap">{note}</p>
      </div>
    </div>
  );
}
