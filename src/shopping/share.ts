import qrcode from 'qrcode-generator';
import {
  UNSAFE_QR_NAME_RE,
  encodeShopImport,
  type FoodGroup,
  type ImportShopItem,
  type ShoppingItem,
} from '../domain/index.ts';
import {
  effectiveShopState,
  isPartialHave,
  shopBuyQty,
  shopNeedOf,
} from './have.ts';
import type { GroupedShoppingList } from './merge.ts';

export interface QrMatrix {
  /** Anzahl Module pro Seite inkl. Quiet-Zone (für `viewBox="0 0 size size"`). */
  readonly size: number;
  /** Kompaktes SVG-Pfad-Datenattribut für alle dunklen Module (kein `innerHTML`). */
  readonly path: string;
  /** Anzahl QR-Module ohne Quiet-Zone. */
  readonly modules: number;
}

const MAX_QR_ITEMS = 40;
const QUIET_ZONE = 2;

function sanitizeQrName(raw: string, fallback: string): string {
  const cleaned = raw.replace(new RegExp(UNSAFE_QR_NAME_RE.source, 'g'), ' ').replace(/\s+/g, ' ').trim();
  const safe = cleaned.slice(0, 80);
  return safe.length > 0 ? safe : fallback.slice(0, 80);
}

/**
 * Wandelt Einkaufsartikel in das minimale QR-Import-Payload um (max. 40 Artikel).
 * Enthält ausschliesslich Artikel-IDs, Namen, optionale Mengen/Einheiten und Zustände –
 * niemals Gesundheitsdaten und niemals `qtyHave` (ADR-004, Issue #31, Issue #36).
 * Teilmengen werden als Zustand `open` mit der verbleibenden Kaufmenge geteilt.
 */
export function shoppingItemsToImportPayload(
  items: readonly ShoppingItem[],
  resolveName: (item: ShoppingItem) => string,
): ImportShopItem[] {
  return items.slice(0, MAX_QR_ITEMS).map((item) => {
    const partial = isPartialHave(item);
    const entry: ImportShopItem = {
      id: item.food,
      name: sanitizeQrName(resolveName(item), item.food),
      st: partial ? 'open' : effectiveShopState(item),
    };
    const exportAmt = partial ? shopBuyQty(item) : shopNeedOf(item);
    if (exportAmt !== null && Number.isFinite(exportAmt) && exportAmt > 0) {
      entry.amount = exportAmt;
    }
    if (item.unit !== undefined) {
      entry.unit = item.unit;
    }
    return entry;
  });
}

/**
 * Erzeugt das vollständige lokale QR-URL-Fragment (`#/einkauf#import=...`) für die aktuelle Liste.
 */
export function encodeShoppingListFragment(
  items: readonly ShoppingItem[],
  resolveName: (item: ShoppingItem) => string,
): string {
  const payload = shoppingItemsToImportPayload(items, resolveName);
  return encodeShopImport(payload);
}

/**
 * Erzeugt eine reine SVG-Pfad-Matrix über das lokale Paket `qrcode-generator`.
 * Kein `innerHTML`, kein `DOMParser`, kein Netzabruf (CSP-konform).
 */
export function buildQrMatrix(
  text: string,
  ecc: 'L' | 'M' | 'Q' | 'H' = 'M',
): QrMatrix {
  const qr = qrcode(0, ecc);
  qr.addData(text, 'Byte');
  qr.make();

  const modules = qr.getModuleCount();
  const segments: string[] = [];

  for (let row = 0; row < modules; row += 1) {
    let runStart = -1;
    for (let col = 0; col <= modules; col += 1) {
      const dark = col < modules && qr.isDark(row, col);
      if (dark && runStart === -1) {
        runStart = col;
      } else if (!dark && runStart !== -1) {
        const len = col - runStart;
        segments.push(
          `M${runStart + QUIET_ZONE} ${row + QUIET_ZONE}h${len}v1h-${len}z`,
        );
        runStart = -1;
      }
    }
  }

  return {
    size: modules + QUIET_ZONE * 2,
    path: segments.join(''),
    modules,
  };
}

export interface FormatShareTextOptions {
  readonly title: string;
  readonly groupLabel: (group: FoodGroup) => string;
  readonly cartHeading: string;
  readonly homeHeading: string;
  readonly itemName: (item: ShoppingItem) => string;
  readonly itemAmount: (item: ShoppingItem) => string;
  readonly stateLabels: {
    readonly open: string;
    readonly cart: string;
    readonly home: string;
  };
}

/**
 * Formatiert die Einkaufsliste als lesbaren Klartext zum Teilen (Web Share API / Zwischenablage).
 * Enthält ausschliesslich Artikelnamen, Mengen und Zustände – niemals Gesundheitsdaten (ADR-004).
 */
export function formatShareText(
  grouped: GroupedShoppingList,
  options: FormatShareTextOptions,
): string {
  const lines: string[] = [options.title];

  const formatLine = (item: ShoppingItem, prefix: string): string => {
    const name = options.itemName(item);
    const amt = options.itemAmount(item);
    return amt ? `${prefix} ${name} (${amt})` : `${prefix} ${name}`;
  };

  for (const grp of grouped.openGroups) {
    lines.push('', options.groupLabel(grp.group));
    for (const item of grp.items) {
      lines.push(formatLine(item, `[${options.stateLabels.open}]`));
    }
  }

  if (grouped.cartItems.length > 0) {
    lines.push('', options.cartHeading);
    for (const item of grouped.cartItems) {
      lines.push(formatLine(item, `[${options.stateLabels.cart}]`));
    }
  }

  if (grouped.homeItems.length > 0) {
    lines.push('', options.homeHeading);
    for (const item of grouped.homeItems) {
      lines.push(formatLine(item, `[${options.stateLabels.home}]`));
    }
  }

  return lines.join('\n');
}
