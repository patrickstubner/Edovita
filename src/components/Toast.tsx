export interface ToastProps {
  message: string | null;
  undoLabel?: string;
  onUndo?: () => void;
}

/**
 * Schwebender Status-Toast im Prototyp-Stil (`.toast`), optional mit «Rückgängig»-Button.
 */
export function Toast({ message, undoLabel, onUndo }: ToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="edo-toast"
      role="status"
      aria-live="polite"
      data-testid="toast"
    >
      <span className="edo-toast-msg">{message}</span>
      {onUndo && undoLabel ? (
        <button
          type="button"
          className="edo-toast-undo"
          onClick={onUndo}
          data-testid="toast-undo"
        >
          {undoLabel}
        </button>
      ) : null}
    </div>
  );
}
