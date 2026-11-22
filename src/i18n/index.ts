/**
 * Internationalisierungs-Schicht (ADR-001, ADR-003).
 * i18next-Setup, Registry-Zugriff und Intl-Formatierer folgen in Paket E2.
 * Bis dahin liegen die E0-Texte (inkl. Platzhalter der Statusseite) in
 * `content/locales/de/ui.json` und werden nur über diese Schicht gelesen.
 */
import deUi from '../../content/locales/de/ui.json';

export const I18N_LAYER_VERSION = 0;

export const UI_LOCALE = 'de' as const;

export type UiKey = keyof typeof deUi;

export function t(key: UiKey): string {
  return deUi[key];
}
