import type { ReactNode } from 'react';
import type { TextDir } from '../domain/index.ts';
import { BilingualText } from './BilingualText.tsx';

export interface ShopGroupProps {
  readonly title: string;
  readonly secondaryTitle?: string;
  readonly secondaryLocale?: string;
  readonly secondaryDir?: TextDir;
  readonly count: number;
  readonly action?: ReactNode;
  readonly testId?: string;
  readonly children: ReactNode;
}

/**
 * Gruppierter Abschnitt der Einkaufsliste (Lebensmittelgruppe, «Im Korb» oder «Schon zu Hause»)
 * mit zweisprachiger Kopfzeile (Anzahl nur einmal) und optionaler Aktion (z. B. «Korb leeren»).
 */
export function ShopGroup({
  title,
  secondaryTitle,
  secondaryLocale,
  secondaryDir,
  count,
  action,
  testId,
  children,
}: ShopGroupProps) {
  return (
    <section className="edo-shopgroup" data-testid={testId}>
      <div className="edo-row edo-row-sp edo-shopgroup-head">
        <p className="edo-grph">
          <BilingualText
            main={title}
            suffix={` (${count})`}
            secondary={secondaryTitle}
            secondaryLang={secondaryLocale}
            secondaryDir={secondaryDir}
          />
        </p>
        {action}
      </div>
      <div className="edo-card edo-shopgroup-card">{children}</div>
    </section>
  );
}
