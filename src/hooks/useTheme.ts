import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '../app/ThemeProvider.tsx';

/**
 * Hook für das aktuelle Farbschema (System / Hell / Dunkel).
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme muss innerhalb von ThemeProvider verwendet werden.');
  }
  return ctx;
}
