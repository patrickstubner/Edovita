import type { IconName } from '../domain/index.ts';
import type { UiKey } from '../i18n/index.ts';

export type NavTabId = 'rezepte' | 'plan' | 'profil';
export type NavTabPath = '/rezepte' | '/plan' | '/profil';

export interface NavTabSpec {
  readonly id: NavTabId;
  readonly path: NavTabPath;
  readonly icon: IconName;
  readonly labelKey: UiKey;
  /** Tab «Plan» wird erst mit E10 (#35) eingeblendet. */
  readonly enabled: boolean;
}

/**
 * Feste Routen-Whitelist der Hauptnavigation gemäss Prototyp v5.10 (Issue #34):
 * ausschliesslich Rezepte, Plan (ab E10) und Profil.
 */
export const NAV_TABS: readonly NavTabSpec[] = [
  {
    id: 'rezepte',
    path: '/rezepte',
    icon: 'utensils',
    labelKey: 'rezepte.rezepte',
    enabled: true,
  },
  {
    id: 'plan',
    path: '/plan',
    icon: 'cal',
    labelKey: 'plan.title',
    enabled: true,
  },
  {
    id: 'profil',
    path: '/profil',
    icon: 'user',
    labelKey: 'profil.profil',
    enabled: true,
  },
];

export const VISIBLE_NAV_TABS: readonly NavTabSpec[] = NAV_TABS.filter(
  (tab) => tab.enabled,
);

/**
 * Löst eine Tab-ID strikt gegen die Whitelist aktiver Tabs auf.
 * Deaktivierte oder unbekannte Werte liefern `null` (keine Navigation aus Nutzereingaben).
 */
export function resolveNavTabPath(tabId: string): NavTabPath | null {
  for (const tab of VISIBLE_NAV_TABS) {
    if (tab.id === tabId) {
      return tab.path;
    }
  }
  return null;
}

/**
 * Ordnet den aktuellen Router-Pfad dem zugehörigen Tab zu (Prototyp `data-tab`).
 */
export function resolveActiveNavTab(pathname: string): NavTabId | null {
  if (
    pathname === '/rezepte' ||
    pathname === '/rezept' ||
    pathname.startsWith('/rezept/') ||
    pathname === '/einkauf'
  ) {
    return 'rezepte';
  }
  if (pathname === '/plan' || pathname.startsWith('/plan/')) {
    return 'plan';
  }
  if (pathname === '/profil' || pathname.startsWith('/profil/')) {
    return 'profil';
  }
  return null;
}
