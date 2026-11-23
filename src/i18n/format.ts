import type { Unit } from '../domain/index.ts';

/**
 * Formatiert Zahlen sprachabhängig über `Intl.NumberFormat` (ADR-003 §4).
 */
export function fmtNumber(
  value: number,
  locale: string,
  decimals?: number,
): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return String(value);
  }
  const options: Intl.NumberFormatOptions =
    decimals === undefined
      ? { maximumFractionDigits: Number.isInteger(value) ? 0 : 1 }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return decimals === undefined ? String(value) : value.toFixed(decimals);
  }
}

const INTL_METRIC_UNITS: Readonly<Partial<Record<Unit, string>>> = {
  g: 'gram',
  ml: 'milliliter',
};

const FALLBACK_UNIT_LABELS: Readonly<
  Record<string, Readonly<Record<Unit, string>>>
> = {
  de: { g: 'g', ml: 'ml', pc: 'Stk.', tbsp: 'EL', tsp: 'TL', pinch: 'Prise' },
  en: { g: 'g', ml: 'ml', pc: 'pc', tbsp: 'tbsp', tsp: 'tsp', pinch: 'pinch' },
  fr: { g: 'g', ml: 'ml', pc: 'pce', tbsp: 'c. à s.', tsp: 'c. à c.', pinch: 'pincée' },
  it: { g: 'g', ml: 'ml', pc: 'pz', tbsp: 'cucchiaio', tsp: 'cucchiaino', pinch: 'pizzico' },
  es: { g: 'g', ml: 'ml', pc: 'ud.', tbsp: 'cda.', tsp: 'cdta.', pinch: 'pizca' },
  ja: { g: 'g', ml: 'ml', pc: '個', tbsp: '大さじ', tsp: '小さじ', pinch: '少々' },
  pt: { g: 'g', ml: 'ml', pc: 'un.', tbsp: 'c. sopa', tsp: 'c. chá', pinch: 'pitada' },
};

/**
 * Formatiert metrische Mengen sprachabhängig über `Intl.NumberFormat` (mit `unit` wo unterstützt).
 * Einheiten bleiben gemäss ADR-003 strikt metrisch.
 */
export function fmtAmount(
  value: number,
  unit: Unit,
  locale: string,
): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return String(value);
  }

  const intlUnit = Object.hasOwn(INTL_METRIC_UNITS, unit)
    ? INTL_METRIC_UNITS[unit]
    : undefined;

  if (intlUnit) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: intlUnit,
        unitDisplay: 'short',
        maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
      }).format(value);
    } catch {
      // Fallback auf Zahl + metrische Kurzform
    }
  }

  const baseLang = locale.toLowerCase().split(/[-_]/)[0] ?? 'en';
  const labels = Object.hasOwn(FALLBACK_UNIT_LABELS, baseLang)
    ? FALLBACK_UNIT_LABELS[baseLang]!
    : FALLBACK_UNIT_LABELS.en!;

  return `${fmtNumber(value, locale)} ${labels[unit]}`;
}

/**
 * Formatiert ein Datum sprachabhängig über `Intl.DateTimeFormat`.
 */
export function fmtDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
