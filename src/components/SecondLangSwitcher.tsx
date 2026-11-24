import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { LangCode } from '../domain/index.ts';
import { LangFlag } from './LangFlag.tsx';

export type SecondLangOptionValue = 'auto' | 'none' | LangCode;

export interface SecondLangSwitcherOption {
  readonly value: SecondLangOptionValue;
  readonly label: string;
  readonly flagCode: LangCode | null;
  readonly locale?: string;
  readonly showCodeBadge?: boolean;
  readonly selected: boolean;
}

export interface SecondLangSwitcherProps {
  /** Wirksame Zweitsprache für Flagge und Kürzel (oder `null` -> «—» ohne Flagge). */
  readonly effectiveCode: LangCode | null;
  readonly options: readonly SecondLangSwitcherOption[];
  readonly buttonLabel: string;
  readonly menuLabel: string;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly hideBackdrop?: boolean;
  readonly onSelect: (value: SecondLangOptionValue) => void;
}

type OpenFocusTarget = 'selected' | 'last';

/**
 * Zweiter kompakter Sprachumschalter in der Kopfzeile (links neben dem Hauptumschalter,
 * in RTL entsprechend rechts daneben) gemäss Prototyp v5.7–v5.10 & Issue #12.
 * Gleiche Tastatur- & ARIA-Bedienung wie `LangSwitcher` (≥ 44 px, `role="listbox"`,
 * Pfeiltasten, Home/End, Escape, Tab).
 */
export function SecondLangSwitcher({
  effectiveCode,
  options,
  buttonLabel,
  menuLabel,
  open: controlledOpen,
  onOpenChange,
  hideBackdrop = false,
  onSelect,
}: SecondLangSwitcherProps) {
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

  const handleOptionSelect = (value: SecondLangOptionValue) => {
    onSelect(value);
    closeMenu(true);
  };

  return (
    <>
      {!hideBackdrop ? (
        <div
          className="edo-lang-backdrop"
          hidden={!open}
          onClick={() => closeMenu(false)}
          data-testid="second-switch-backdrop"
        />
      ) : null}
      <div
        id="secondSwitch"
        className="edo-second-switch"
        onKeyDown={handleContainerKeyDown}
        data-testid="second-switch"
      >
        <button
          ref={btnRef}
          type="button"
          id="secondSwitchBtn"
          className={
            effectiveCode
              ? 'edo-lang-switch-btn edo-second-switch-btn'
              : 'edo-lang-switch-btn edo-second-switch-btn edo-second-switch-none'
          }
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="secondMenu"
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
          data-testid="second-switch-btn"
        >
          {effectiveCode ? <LangFlag code={effectiveCode} /> : null}
          <span className="edo-lang-code" data-testid="second-switch-code">
            {effectiveCode ? effectiveCode.toUpperCase() : '—'}
          </span>
        </button>

        <div
          ref={menuRef}
          id="secondMenu"
          className="edo-lang-menu"
          role="listbox"
          aria-label={menuLabel}
          hidden={!open}
          data-testid="second-switch-menu"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              className="edo-lang-opt"
              data-second={opt.value}
              aria-selected={opt.selected}
              lang={opt.locale}
              onClick={() => handleOptionSelect(opt.value)}
            >
              {opt.flagCode ? <LangFlag code={opt.flagCode} /> : null}
              <span className="edo-lang-name">{opt.label}</span>
              {opt.showCodeBadge ? (
                <span className="edo-lang-code-sm">
                  {opt.value.toUpperCase()}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
