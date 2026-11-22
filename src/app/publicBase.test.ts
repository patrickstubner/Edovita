import { describe, expect, it } from '@rstest/core';
import { getPublicBase, publicUrl } from './publicBase.ts';

describe('publicUrl', () => {
  it('hängt den Public-Pfad an und entfernt führende Schrägstriche', () => {
    const base = getPublicBase();
    expect(base.endsWith('/')).toBe(true);
    expect(publicUrl('/assets/edovita_logo.svg')).toBe(
      `${base}assets/edovita_logo.svg`,
    );
    expect(publicUrl('assets/edovita_logo.svg')).toBe(
      `${base}assets/edovita_logo.svg`,
    );
  });
});
