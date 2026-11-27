import { normalizeBasePath } from './config.ts';

/** Light-mode brand green (WCAG 4.9:1 on white) matching exported PWA assets. */
export const PWA_THEME_COLOR = '#0B7F6B';
export const PWA_BACKGROUND_COLOR = '#FFFFFF';

export interface WebAppManifestIcon {
  src: string;
  sizes: string;
  type: 'image/png';
  purpose: 'any' | 'maskable';
}

export interface WebAppManifest {
  id: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: 'standalone';
  orientation: 'portrait-primary';
  theme_color: string;
  background_color: string;
  icons: readonly WebAppManifestIcon[];
}

export const PWA_ICON_FILES = [
  { file: 'icons/icon-192.png', sizes: '192x192', purpose: 'any' as const },
  { file: 'icons/icon-512.png', sizes: '512x512', purpose: 'any' as const },
  {
    file: 'icons/maskable-192.png',
    sizes: '192x192',
    purpose: 'maskable' as const,
  },
  {
    file: 'icons/maskable-512.png',
    sizes: '512x512',
    purpose: 'maskable' as const,
  },
] as const;

export function buildWebManifest(basePath: string): WebAppManifest {
  const base = normalizeBasePath(basePath);
  return {
    id: base,
    name: 'Edovita',
    short_name: 'Edovita',
    description:
      'Nutrition app with recipes, meal planning, shopping list, and bilingual food names.',
    start_url: base,
    scope: base,
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: PWA_THEME_COLOR,
    background_color: PWA_BACKGROUND_COLOR,
    icons: PWA_ICON_FILES.map((icon) => ({
      src: `${base}${icon.file}`,
      sizes: icon.sizes,
      type: 'image/png',
      purpose: icon.purpose,
    })),
  };
}
