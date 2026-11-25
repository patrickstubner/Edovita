/**
 * Theme-Präferenz der Nutzerin / des Nutzers (ADR-002, ADR-004).
 * Wird beim Lesen über Whitelist normalisiert.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

/** Effektives Farbschema am HTML-Wurzelelement (`data-eff`). */
export type EffectiveTheme = 'light' | 'dark';

const VALID_THEME_PREFS: ReadonlySet<string> = new Set<ThemePreference>([
  'system',
  'light',
  'dark',
]);

/** Whitelist-Normalisierung: unbekannte Werte fallen sicher auf «system». */
export function coerceThemePreference(value: unknown): ThemePreference {
  if (typeof value === 'string' && VALID_THEME_PREFS.has(value)) {
    return value as ThemePreference;
  }
  return 'system';
}

/**
 * Alle Symbol-IDs des SVG-Icon-Sprites (aus dem Prototyp übernommen).
 */
export const ICON_NAMES = [
  'sun',
  'home',
  'camera',
  'utensils',
  'chart',
  'user',
  'lock',
  'check',
  'flame',
  'clock',
  'down',
  'up',
  'eq',
  'spark',
  'left',
  'plus',
  'leaf',
  'play',
  'moon',
  'foot',
  'dumb',
  'cart',
  'file',
  'users',
  'heart',
  'info',
  'alert',
  'scale',
  'chev',
  'book',
  'timer',
  'star',
  'barcode',
  'bell',
  'drop',
  'phone',
  'target',
  'globe',
  'vol',
  'volx',
  'shield',
  'cloud',
  'qr',
  'mic',
  'bookmark',
  'download',
  'trash',
  'music',
  'search',
  'link',
  'x',
  'pause',
  'cal',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
