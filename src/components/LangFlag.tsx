import type { LangCode } from '../domain/index.ts';

export interface LangFlagProps {
  readonly code: LangCode;
}

/**
 * Feste lokale SVG-Flaggen (22×16 px Container, viewBox 0 0 60 42) exakt nach
 * Prototyp v5.5 (`13e323e0`). Kein `innerHTML`, keine Netzabrufe, keine freien Nutzereingaben.
 */
export function LangFlag({ code }: LangFlagProps) {
  return (
    <span className="edo-lang-flag" aria-hidden="true">
      <svg
        viewBox="0 0 60 42"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {renderFlagShapes(code)}
      </svg>
    </span>
  );
}

function renderFlagShapes(code: LangCode) {
  switch (code) {
    case 'de':
      return (
        <>
          <rect x="0" y="0" width="60" height="14.05" fill="#000000" />
          <rect x="0" y="14" width="60" height="14.05" fill="#DD0000" />
          <rect x="0" y="28" width="60" height="14.05" fill="#FFCE00" />
        </>
      );
    case 'en':
      return (
        <>
          <rect width="60" height="42" fill="#012169" />
          <path d="M0,0 L60,42 M60,0 L0,42" stroke="#FFFFFF" strokeWidth="10" />
          <path d="M0,0 L60,42 M60,0 L0,42" stroke="#C8102E" strokeWidth="6" />
          <path d="M30,0 V42 M0,21 H60" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M30,0 V42 M0,21 H60" stroke="#C8102E" strokeWidth="8" />
        </>
      );
    case 'fr':
      return (
        <>
          <rect x="0" y="0" width="20.05" height="42" fill="#002395" />
          <rect x="20" y="0" width="20.05" height="42" fill="#FFFFFF" />
          <rect x="40" y="0" width="20.05" height="42" fill="#ED2939" />
        </>
      );
    case 'it':
      return (
        <>
          <rect x="0" y="0" width="20.05" height="42" fill="#009246" />
          <rect x="20" y="0" width="20.05" height="42" fill="#FFFFFF" />
          <rect x="40" y="0" width="20.05" height="42" fill="#CE2B37" />
        </>
      );
    case 'es':
      return (
        <>
          <rect width="60" height="42" fill="#AA151B" />
          <rect y="10.5" width="60" height="21" fill="#F1BF00" />
        </>
      );
    case 'ja':
      return (
        <>
          <rect width="60" height="42" fill="#FFFFFF" />
          <circle cx="30" cy="21" r="12.6" fill="#BC002D" />
        </>
      );
    case 'pt':
      return (
        <>
          <rect width="60" height="42" fill="#009B3A" />
          <polygon points="30,4 56,21 30,38 4,21" fill="#FEDF00" />
          <circle cx="30" cy="21" r="8.5" fill="#002776" />
        </>
      );
    default:
      return <rect width="60" height="42" fill="#E3F5F0" />;
  }
}
