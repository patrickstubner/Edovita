import type { ReactNode } from 'react';
import type { TextDir } from '../domain/index.ts';

export interface BilingualNameProps {
  readonly main: string;
  readonly secondary?: string | null;
  readonly secondaryLang?: string;
  readonly secondaryDir?: TextDir;
  /** `inline`: Rezept-Detail (`Name · Zweitname`), `stacked`: Einkaufsliste (zweizeilig mit Zweitname + Menge, sonst einzeilig). */
  readonly layout?: 'inline' | 'stacked';
  /** Nachgestelltes Element im `stacked`-Layout (z. B. Mengenblock in `ShopRow`). */
  readonly trailing?: ReactNode;
}

/**
 * Zweisprachiger Lebensmittelname mit Bidi-Isolation (`<bdi lang dir>`) gemäss ADR-003 & Prototyp v5.10:
 * - Im Rezept-Detail einzeilig: `Name · <bdi lang dir>Zweitname</bdi>`
 * - In der Einkaufsliste zweizeilig (Zeile 1 Name, Zeile 2 Zweitname gedämpft + Menge),
 *   ohne Zweitsprache einzeilig.
 */
export function BilingualName({
  main,
  secondary,
  secondaryLang,
  secondaryDir = 'ltr',
  layout = 'inline',
  trailing,
}: BilingualNameProps) {
  const hasSecondary = typeof secondary === 'string' && secondary.length > 0;

  if (layout === 'stacked') {
    if (hasSecondary) {
      return (
        <span
          className="edo-shop-nm edo-shop-nm-has-sec edo-grow"
          data-bilingual="two-line"
        >
          <span className="edo-shoprow-nm edo-biname-main">{main}</span>
          <span className="edo-shop-nm-2">
            <bdi
              className="edo-biname-sec"
              lang={secondaryLang}
              dir={secondaryDir}
            >
              {secondary}
            </bdi>
            {trailing}
          </span>
        </span>
      );
    }

    return (
      <span
        className="edo-shop-nm edo-shop-nm-one-line edo-grow"
        data-bilingual="one-line"
      >
        <span className="edo-shoprow-nm edo-biname-main">{main}</span>
        {trailing ? <span className="edo-shop-nm-2">{trailing}</span> : null}
      </span>
    );
  }

  return (
    <span className="edo-biname">
      <span className="edo-biname-main">{main}</span>
      {hasSecondary ? (
        <>
          {' · '}
          <bdi
            className="edo-biname-sec"
            lang={secondaryLang}
            dir={secondaryDir}
          >
            {secondary}
          </bdi>
        </>
      ) : null}
    </span>
  );
}
