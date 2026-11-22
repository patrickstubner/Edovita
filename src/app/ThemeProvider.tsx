import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  coerceThemePreference,
  type EffectiveTheme,
  type ThemePreference,
} from '../domain/index.ts';
import {
  applyThemeToDocument,
  prefersSystemDark,
  readStoredThemePreference,
  resolveEffectiveTheme,
  writeStoredThemePreference,
} from './theme.ts';

export interface ThemeContextValue {
  preference: ThemePreference;
  effective: EffectiveTheme;
  setPreference: (next: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  initialPreference?: ThemePreference;
}

/**
 * Eigener Provider nur für das Farbschema (System / Hell / Dunkel).
 * ADR-001 Regel 6: ein Provider pro Bereich, kein globaler App-Zustand.
 */
export function ThemeProvider({
  children,
  initialPreference,
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    initialPreference !== undefined
      ? coerceThemePreference(initialPreference)
      : readStoredThemePreference(),
  );
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    prefersSystemDark(),
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };
    mediaQuery.addEventListener('change', onChange);
    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  const effective = resolveEffectiveTheme(preference, systemDark);

  useEffect(() => {
    applyThemeToDocument(preference, effective);
  }, [preference, effective]);

  const setPreference = useCallback((next: ThemePreference) => {
    const safe = coerceThemePreference(next);
    setPreferenceState(safe);
    writeStoredThemePreference(safe);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, effective, setPreference }),
    [preference, effective, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
