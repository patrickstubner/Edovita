import { useCallback, useMemo } from 'react';
import type { ShoppingItem } from '../domain/index.ts';
import { FOOD_GROUP_LABEL_KEYS } from '../i18n/index.ts';
import {
  buildQrMatrix,
  encodeShoppingListFragment,
  formatShareText,
  type GroupedShoppingList,
  type QrMatrix,
} from '../shopping/index.ts';
import { useI18n } from './useI18n.ts';

export type ShareOutcome = 'shared' | 'copied' | 'failed';

export interface UseShareListParams {
  readonly items: readonly ShoppingItem[];
  readonly grouped: GroupedShoppingList;
  readonly resolveItemName: (item: ShoppingItem) => string;
  readonly resolveItemAmount: (item: ShoppingItem) => string;
  readonly qrEnabled: boolean;
}

export interface UseShareListResult {
  readonly shareText: string;
  readonly qrFragment: string;
  readonly qrUrl: string;
  readonly qrMatrix: QrMatrix | null;
  readonly shareList: () => Promise<ShareOutcome>;
  readonly copyQrLink: () => Promise<boolean>;
}

async function copyText(text: string): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Erzeugt den reinen Teilen-Text (nur Artikelnamen, Mengen, Zustände – nie G-Daten, ADR-004),
 * das lokale QR-URL-Fragment (`#/einkauf#import=...`) und die SVG-QR-Matrix.
 */
export function useShareList({
  items,
  grouped,
  resolveItemName,
  resolveItemAmount,
  qrEnabled,
}: UseShareListParams): UseShareListResult {
  const { t } = useI18n();

  const shareText = useMemo(
    () =>
      formatShareText(grouped, {
        title: t('einkauf.einkaufsliste'),
        groupLabel: (group) => t(FOOD_GROUP_LABEL_KEYS[group]),
        cartHeading: t('shop.sec.cart'),
        homeHeading: t('shop.sec.home'),
        itemName: resolveItemName,
        itemAmount: resolveItemAmount,
        stateLabels: {
          open: t('shop.state.open'),
          cart: t('shop.state.cart'),
          home: t('shop.state.home'),
        },
      }),
    [grouped, resolveItemAmount, resolveItemName, t],
  );

  const qrFragment = useMemo(
    () => encodeShoppingListFragment(items, resolveItemName),
    [items, resolveItemName],
  );

  const qrUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return qrFragment;
    }
    const base = window.location.href.split('#')[0] ?? '';
    return `${base}${qrFragment}`;
  }, [qrFragment]);

  const qrMatrix = useMemo<QrMatrix | null>(() => {
    if (!qrEnabled || items.length === 0) {
      return null;
    }
    try {
      return buildQrMatrix(qrUrl, 'M');
    } catch {
      try {
        return buildQrMatrix(qrFragment, 'L');
      } catch {
        return null;
      }
    }
  }, [items.length, qrEnabled, qrFragment, qrUrl]);

  const shareList = useCallback(async (): Promise<ShareOutcome> => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          title: t('einkauf.einkaufsliste'),
          text: shareText,
        });
        return 'shared';
      } catch (err) {
        // Nutzerabbruch oder nicht erlaubt -> Fallback auf Zwischenablage
        if (err instanceof Error && err.name === 'AbortError') {
          return 'failed';
        }
      }
    }
    const copied = await copyText(shareText);
    return copied ? 'copied' : 'failed';
  }, [shareText, t]);

  const copyQrLink = useCallback(async (): Promise<boolean> => {
    return copyText(qrUrl);
  }, [qrUrl]);

  return {
    shareText,
    qrFragment,
    qrUrl,
    qrMatrix,
    shareList,
    copyQrLink,
  };
}
