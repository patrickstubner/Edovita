import type { ReactNode } from 'react';

export interface BottomActionsProps {
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * Fixe Aktionsleiste unten auf jedem Screen (1–3 Hauptbuttons).
 * Produktvorgabe Edovita: immer sichtbar im Viewport, Inhalt scrollt darüber.
 */
export function BottomActions({
  children,
  ariaLabel = 'Hauptaktionen',
}: BottomActionsProps) {
  return (
    <div
      className="edo-actions"
      role="group"
      aria-label={ariaLabel}
      data-testid="bottom-actions"
    >
      {children}
    </div>
  );
}
