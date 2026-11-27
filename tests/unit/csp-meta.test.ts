import { fileURLToPath } from 'node:url';
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
    expect(meta).toContain("worker-src 'self'");
    expect(meta).toContain("manifest-src 'self'");
    expect(meta).not.toContain('unsafe-inline');
  });
});

describe('getAssetPrefix', () => {
  it('ist lokal der Ursprungspfad', () => {
    expect(getAssetPrefix()).toBe('/');
  });
});

describe('loadSecurityHeaders', () => {
  it('liest nur den /*-Block und ignoriert andere Pfad-Blöcke', () => {
    const headers = loadSecurityHeaders(
      fileURLToPath(new URL('./fixtures/_headers-multiple-blocks', import.meta.url)),
    );
    expect(headers['Content-Security-Policy']).toBe(
      "default-src 'none'; frame-ancestors 'none'",
    );
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Custom']).toBeUndefined();
    expect(headers['X-Other']).toBeUndefined();
  });

  it('findet public/_headers über den Dateipfad der Rsbuild-Konfiguration', () => {
    const headers = loadSecurityHeaders();
    expect(headers['Content-Security-Policy']).toContain("default-src 'none'");
    expect(headers['X-Frame-Options']).toBe('DENY');
  });
});
