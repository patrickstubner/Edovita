import { Icon } from './Icon.tsx';

export interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
  saveLabel: string;
  unsaveLabel: string;
}

/**
 * Merken-Knopf (Lesezeichen) im Prototyp-Stil (`.savebtn`, >= 44 px Tap-Fläche).
 */
export function SaveButton({
  saved,
  onToggle,
  saveLabel,
  unsaveLabel,
}: SaveButtonProps) {
  return (
    <button
      type="button"
      className={saved ? 'edo-savebtn edo-savebtn-on' : 'edo-savebtn'}
      aria-pressed={saved}
      aria-label={saved ? unsaveLabel : saveLabel}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <Icon name="bookmark" size="sm" filled={saved} />
    </button>
  );
}
