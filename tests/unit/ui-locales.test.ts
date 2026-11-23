import { describe, expect, it } from '@rstest/core';
import { createI18nInstance } from '../../src/i18n/index.ts';

describe('UI-Locales (content/locales/{de,en}/ui.json)', () => {
  it('liefert Start- und Status-Texte über die i18n-Schicht in DE und EN', async () => {
    const inst = createI18nInstance({ initialLang: 'de' });
    expect(inst.t('start.willkommen_bei_edovita')).toBe('Willkommen bei Edovita');
    expect(inst.t('status.ready_title')).toBe('Bereit für den Aufbau');
    expect(inst.t('status.planned.catalog')).toContain('Rezepte');

    await inst.changeLanguage('en');
    expect(inst.t('start.willkommen_bei_edovita')).toBe('Welcome to Edovita');
    expect(inst.t('status.ready_title')).toBe('Ready to build');
  });
});
