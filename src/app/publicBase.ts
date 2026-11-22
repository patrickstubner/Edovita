/**
 * Public-Basis mit abschliessendem Schrägstrich.
 * Lokal `/`, auf GitHub Pages `/Edovita/` (über `output.assetPrefix`).
 */
export function getPublicBase(): string {
  const raw = import.meta.env.ASSET_PREFIX;
  if (typeof raw === 'string' && raw.length > 0) {
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  return '/';
}

/** URL-Pfad einer Datei aus `public/`. */
export function publicUrl(path: string): string {
  return `${getPublicBase()}${path.replace(/^\/+/, '')}`;
}
