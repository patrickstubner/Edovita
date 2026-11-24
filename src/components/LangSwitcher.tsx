import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { LangCode } from '../domain/index.ts';
import { LangFlag } from './LangFlag.tsx';

export interface LangSwitcherOption {
  readonly code: LangCode;
  readonly name: string;
  readonly locale: string;
}

export interface LangSwitcherProps {
  readonly currentCode: LangCode;
  readonly options: readonly LangSwitcherOption[];
  readonly buttonLabel: string;
  readonly menuLabel: string;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly hideBackdrop?: boolean;
  readonly onSelect: (code: LangCode) => void;
}

type OpenFocusTarget = 'selected' | 'last';

/**
 * Kompakter Sprachumschalter (Flagge 22×16 + zweistelliges Kürzel, Dropdown `role="listbox"`)
 * fest oben rechts auf jedem Screen (in RTL oben links) gemäss Prototyp v5.5 (`13e323e0`).
 * Zeigt ausschliesslich die übergebenen aktiven & freigegebenen UI-Sprachen.
 */
export function LangSwitcher({
  currentCode,
  options,
  buttonLabel,
  menuLabel,
  open: controlledOpen,
  onOpenChange,
  hideBackdrop = false,
  onSelect,
}: LangSwitcherProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pendingFocusRef = useRef<OpenFocusTarget | null>(null);

  const setOpenState = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const getOptionButtons = useCallback((): HTMLButtonElement[] => {
    if (!menuRef.current) return [];
    return Array.from(
      menuRef.current.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    );
  }, []);

  const openMenu = useCallback(
    (focusTarget: OpenFocusTarget = 'selected') => {
      pendingFocusRef.current = focusTarget;
      setOpenState(true);
    },
    [setOpenState],
  );

  const closeMenu = useCallback(
    (returnFocusToButton: boolean) => {
      pendingFocusRef.current = null;
      setOpenState(false);
      if (returnFocusToButton) {
        btnRef.current?.focus();
      }
    },
    [setOpenState],
  );

  useEffect(() => {
    if (!open || pendingFocusRef.current === null) {
      return;
    }
    const target = pendingFocusRef.current;
    pendingFocusRef.current = null;
    const opts = getOptionButtons();
    if (opts.length === 0) {
      return;
    }
    if (target === 'last') {
      opts[opts.length - 1]?.focus();
      return;
    }
    const selected =
      opts.find((el) => el.getAttribute('aria-selected') === 'true') ?? opts[0];
    selected?.focus();
  }, [getOptionButtons, open]);

  const moveFocus = useCallback(
    (delta: number) => {
      const opts = getOptionButtons();
      if (opts.length === 0) return;
      const activeEl = document.activeElement;
      let index = opts.indexOf(activeEl as HTMLButtonElement);
      if (index < 0) {
        index = opts.findIndex(
          (el) => el.getAttribute('aria-selected') === 'true',
        );
      }
      const next = opts[(index + delta + opts.length) % opts.length];
      next?.focus();
    },
    [getOptionButtons],
  );

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('selected');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
    }
  };

  const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeMenu(true);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-1);
        break;
      case 'Home': {
        event.preventDefault();
        const opts = getOptionButtons();
        opts[0]?.focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        const opts = getOptionButtons();
        opts[opts.length - 1]?.focus();
        break;
      }
      case 'Tab':
        closeMenu(false);
        break;
      default:
        break;
    }
  };

  const handleOptionSelect = (code: LangCode) => {
    onSelect(code);
    closeMenu(true);
  };

  return (
    <>
      {!hideBackdrop ? (
        <div
          id="langBackdrop"
          className="edo-lang-backdrop"
          hidden={!open}
          onClick={() => closeMenu(false)}
          data-testid="lang-switch-backdrop"
        />
      ) : null}
      <div
        id="langSwitch"
        className="edo-lang-switch"
        onKeyDown={handleContainerKeyDown}
        data-testid="lang-switch"
      >
        <button
          ref={btnRef}
          type="button"
          id="langSwitchBtn"
          className="edo-lang-switch-btn"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="langMenu"
          aria-label={buttonLabel}
          title={buttonLabel}
          onClick={() => {
            if (open) {
              closeMenu(false);
            } else {
              openMenu('selected');
            }
          }}
          onKeyDown={handleButtonKeyDown}
          data-testid="lang-switch-btn"
        >
          <LangFlag code={currentCode} />
          <span className="edo-lang-code" data-testid="lang-switch-code">
            {currentCode.toUpperCase()}
          </span>
        </button>

        <div
          ref={menuRef}
          id="langMenu"
          className="edo-lang-menu"
          role="listbox"
          aria-label={menuLabel}
          hidden={!open}
          data-testid="lang-switch-menu"
        >
          {options.map((opt) => {
            const isSelected = opt.code === currentCode;
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                className="edo-lang-opt"
                data-lang={opt.code}
                aria-selected={isSelected}
                lang={opt.locale}
                onClick={() => handleOptionSelect(opt.code)}
              >
                <LangFlag code={opt.code} />
                <span className="edo-lang-name">{opt.name}</span>
                <span className="edo-lang-code-sm">
                  {opt.code.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
