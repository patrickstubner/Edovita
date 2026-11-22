import { describe, expect, it } from '@rstest/core';
import { cspForMeta, getAssetPrefix, loadSecurityHeaders } from '../../rsbuild.config.ts';

describe('cspForMeta', () => {
  it('entfernt frame-ancestors und lässt die übrigen Direktiven unverändert', () => {
    const csp =
      "default-src 'none'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'";
    expect(cspForMeta(csp)).toBe(
      "default-src 'none'; script-src 'self'; base-uri 'none'",
    );
  });

  it('entspricht public/_headers ohne frame-ancestors', () => {
    const headers = loadSecurityHeaders();
    const headerCsp = headers['Content-Security-Policy'];
    expect(headerCsp).toBeTruthy();
    expect(headerCsp).toContain("frame-ancestors 'none'");
    const meta = cspForMeta(headerCsp ?? '');
    expect(meta).not.toMatch(/frame-ancestors/i);
    expect(meta).toContain("default-src 'none'");
    expect(meta).toContain("script-src 'self'");
    expect(meta).not.toContain('unsafe-inline');
  });
});

describe('getAssetPrefix', () => {
  it('ist lokal der Ursprungspfad', () => {
    expect(getAssetPrefix()).toBe('/');
  });
});
