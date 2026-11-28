import { Icon } from './Icon.tsx';

export interface UpdateBannerProps {
  visible: boolean;
  message: string;
  actionLabel: string;
  dismissLabel: string;
  disabled?: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

/**
 * Non-intrusive PWA update notice (E7b).
 * Shown when a newer service worker is waiting so the user explicitly chooses
 * when to activate the update and reload. Never steals focus (`role="status"`).
 */
export function UpdateBanner({
  visible,
  message,
  actionLabel,
  dismissLabel,
  disabled = false,
  onUpdate,
  onDismiss,
}: UpdateBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="edo-update-banner"
      role="status"
      aria-live="polite"
      data-testid="pwa-update-banner"
    >
      <span className="edo-update-banner-msg">{message}</span>
      <button
        type="button"
        className="edo-update-banner-btn"
        disabled={disabled}
        onClick={onUpdate}
        data-testid="pwa-update-action"
      >
        {actionLabel}
      </button>
      <button
        type="button"
        className="edo-update-banner-close"
        aria-label={dismissLabel}
        onClick={onDismiss}
        data-testid="pwa-update-dismiss"
      >
        <Icon name="x" size="sm" />
      </button>
    </div>
  );
}
