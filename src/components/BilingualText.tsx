import type { TextDir } from '../domain/index.ts';

export interface BilingualTextProps {
  readonly main: string;
  readonly secondary?: string | null;
  readonly secondaryLang?: string;
  readonly secondaryDir?: TextDir;
  /** Optionaler Zusatz hinter dem Haupttext (z. B. Zähler ` (3)`), erscheint nur einmal. */
  readonly suffix?: string;
}

/**
 * Zweisprachiger UI-Text gemäss Prototyp v5.10.1 (`fillBilingual`) & Issue #32:
 * Rendert Haupttext in `.edo-i18n-main` und — sofern vorhanden — den Zweittext
 * Bidi-isoliert in `<bdi className="edo-i18n-sec" lang dir>`.
 * Reine React-Textknoten ohne HTML-Senken.
 */
export function BilingualText({
  main,
  secondary,
  secondaryLang,
  secondaryDir = 'ltr',
  suffix,
}: BilingualTextProps) {
  const hasSecondary = typeof secondary === 'string' && secondary.length > 0;
  return (
    <>
      <span className="edo-i18n-main">
        {main}
        {suffix ?? null}
      </span>
      {hasSecondary ? (
        <bdi
          className="edo-i18n-sec"
          lang={secondaryLang}
          dir={secondaryDir}
        >
          {secondary}
        </bdi>
      ) : null}
    </>
  );
}
