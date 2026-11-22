import type { ReactNode } from 'react';
import { BottomActions } from './BottomActions.tsx';

export interface ScreenProps {
  header?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  actionsLabel?: string;
}

/**
 * Basis-Screen-Baustein gemäss bausteine.md:
 * optionaler Kopf, scrollbarer Körper und fixe Aktionsleiste unten.
 */
export function Screen({
  header,
  children,
  actions,
  actionsLabel,
}: ScreenProps) {
  return (
    <section className="edo-screen">
      {header ? <header className="edo-screen-header">{header}</header> : null}
      <div className="edo-screen-body" data-testid="screen-body">
        {children}
      </div>
      {actions ? (
        <BottomActions ariaLabel={actionsLabel}>{actions}</BottomActions>
      ) : null}
    </section>
  );
}
