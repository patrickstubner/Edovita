import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nContext, type I18nContextValue } from '../app/I18nProvider.tsx';
import type { UiKey } from '../i18n/index.ts';

export interface UseI18nResult extends I18nContextValue {
  t: (key: UiKey, vars?: Readonly<Record<string, string | number>>) => string;
}

export function useI18n(): UseI18nResult {
  const ctx = useContext(I18nContext);
  const { t: rawT } = useTranslation('ui');

  const t = useCallback(
    (key: UiKey, vars?: Readonly<Record<string, string | number>>): string =>
      rawT(key, vars as Record<string, unknown>),
    [rawT],
  );

  if (!ctx) {
    throw new Error('useI18n muss innerhalb von I18nProvider verwendet werden.');
  }

  return {
    ...ctx,
    t,
  };
}
