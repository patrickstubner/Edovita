import {
  coerceThemePreference,
  type EffectiveTheme,
  type ThemePreference,
} from '../domain/index.ts';

export const THEME_STORAGE_KEY = 'edovita.theme';

const THEME_BAR_COLOR: Record<EffectiveTheme, string> = {
  light: '#0F9D84',
  dark: '#000000',
};

export function readStoredThemePreference(): ThemePreference {
  try {
    return coerceThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function writeStoredThemePreference(pref: ThemePreference): void {
  const safePref = coerceThemePreference(pref);
  try {
    if (safePref === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, safePref);
    }
  } catch {
    // Speicher gesperrt: Einstellung gilt bis zum Neuladen im Arbeitsspeicher.
  }
}

export function prefersSystemDark(): boolean {
  if (typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveEffectiveTheme(
  pref: ThemePreference,
  systemDark: boolean,
): EffectiveTheme {
  if (pref === 'light' || pref === 'dark') {
    return pref;
  }
  return systemDark ? 'dark' : 'light';
}

export function applyThemeToDocument(
  pref: ThemePreference,
  eff: EffectiveTheme,
): void {
  const root = document.documentElement;
  root.setAttribute('data-pref', pref);
  root.setAttribute('data-eff', eff);
  const meta = document.getElementById('themeColor');
  if (meta) {
    meta.setAttribute('content', THEME_BAR_COLOR[eff]);
  }
}
