import type { ReactNode } from 'react';

export interface ShopGroupProps {
  readonly title: string;
  readonly count: number;
  readonly action?: ReactNode;
  readonly testId?: string;
  readonly children: ReactNode;
}

/**
 * Gruppierter Abschnitt der Einkaufsliste (Lebensmittelgruppe, «Im Korb» oder «Schon zu Hause»)
 * mit Kopfzeile, Zähler und optionaler Aktion (z. B. «Korb leeren»).
 */
export function ShopGroup({
  title,
  count,
  action,
  testId,
  children,
}: ShopGroupProps) {
  return (
    <section className="edo-shopgroup" data-testid={testId}>
      <div className="edo-row edo-row-sp edo-shopgroup-head">
        <p className="edo-grph">
          {title} ({count})
        </p>
        {action}
      </div>
      <div className="edo-card edo-shopgroup-card">{children}</div>
    </section>
  );
}
