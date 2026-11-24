import { useContext } from 'react';
import {
  SecondLangContext,
  type SecondLangContextValue,
  type SetSecondLangResult,
} from '../app/SecondLangProvider.tsx';

export type { SecondLangContextValue, SetSecondLangResult };

/**
 * Liefert die wirksame Zweitsprache (nie gleich der UI-Sprache), den automatischen
 * Orts-Standard, die Lebensmittel-Übersetzung ohne EN-Ersatz sowie `setSecondLang` (E6).
 */
export function useSecondLang(): SecondLangContextValue {
  const ctx = useContext(SecondLangContext);
  if (!ctx) {
    throw new Error(
      'useSecondLang darf nur innerhalb von SecondLangProvider verwendet werden.',
    );
  }
  return ctx;
}
