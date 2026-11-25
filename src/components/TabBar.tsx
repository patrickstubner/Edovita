import type { IconName } from '../domain/index.ts';
import { Icon } from './Icon.tsx';

export interface TabBarItem<TId extends string = string> {
  readonly id: TId;
  readonly path: string;
  readonly icon: IconName;
  readonly label: string;
}

export interface TabBarProps<TId extends string = string> {
  readonly items: readonly TabBarItem<TId>[];
  readonly activeId: TId | null;
  readonly ariaLabel: string;
  readonly onSelect: (id: TId) => void;
}

/**
 * Untere Hauptnavigation (Tab-Leiste gemäss Prototyp v5.10, Issue #34).
 * Reine Darstellungskomponente ohne Router- oder Speicher-Abhängigkeit (ADR-001).
 * Spiegelt in RTL automatisch über logische CSS-Eigenschaften und CSS-Grid.
 */
export function TabBar<TId extends string = string>({
  items,
  activeId,
  ariaLabel,
  onSelect,
}: TabBarProps<TId>) {
  return (
    <nav
      id="tabbar"
      className="edo-tabbar"
      aria-label={ariaLabel}
      data-testid="tabbar"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.path}`}
            className={isActive ? 'edo-tab edo-tab-on' : 'edo-tab'}
            data-tabid={item.id}
            data-testid={`tab-${item.id}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={(event) => {
              if (
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey &&
                event.button === 0
              ) {
                event.preventDefault();
                onSelect(item.id);
              }
            }}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
