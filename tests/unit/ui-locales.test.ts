import { describe, expect, it } from '@rstest/core';
import { t } from '../../src/i18n/index.ts';

describe('E0-Locales (content/locales/de/ui.json)', () => {
  it('liefert die Start- und Platzhaltertexte über die i18n-Schicht', () => {
    expect(t('start.willkommen_bei_edovita')).toBe('Willkommen bei Edovita');
    expect(t('status.ready_title')).toBe('Bereit für den Aufbau');
    expect(t('status.planned.catalog')).toContain('Rezepte');
  });
});
