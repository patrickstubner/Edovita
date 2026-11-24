import type { IconName } from '../domain/index.ts';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  filled?: boolean;
  label?: string;
}

/**
 * Einzelnes Stroke-Icon aus dem gebündelten SVG-Sprite.
 * Verweist ausschliesslich auf interne `#i-…`-Symbol-IDs.
 */
export function Icon({ name, size = 'md', filled = false, label }: IconProps) {
  const sizeClass =
    size === 'sm'
      ? 'edo-ic edo-ic-sm'
      : size === 'lg'
        ? 'edo-ic edo-ic-lg'
        : 'edo-ic';
  const className = filled ? `${sizeClass} edo-ic-fill` : sizeClass;

  return (
    <svg
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
