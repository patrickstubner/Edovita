import { useContext } from 'react';
import {
  SettingsContext,
  type SettingsContextValue,
} from '../app/SettingsProvider.tsx';

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error(
      'useSettings muss innerhalb von SettingsProvider verwendet werden.',
    );
  }
  return ctx;
}
