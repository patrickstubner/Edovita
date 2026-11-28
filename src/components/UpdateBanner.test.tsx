import { describe, expect, it } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { UpdateBanner } from './UpdateBanner.tsx';

describe('UpdateBanner (E7b)', () => {
  it('renders nothing when visible is false', () => {
    const { container } = render(
      <UpdateBanner
        visible={false}
        message="A new version of Edovita is ready."
        actionLabel="Update now"
        dismissLabel="Dismiss update notice"
        onUpdate={() => {}}
        onDismiss={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders polite status banner and triggers user-confirmed update and dismiss handlers', () => {
    let updates = 0;
    let dismisses = 0;

    render(
      <UpdateBanner
        visible
        message="A new version of Edovita is ready."
        actionLabel="Update now"
        dismissLabel="Dismiss update notice"
        onUpdate={() => {
          updates += 1;
        }}
        onDismiss={() => {
          dismisses += 1;
        }}
      />,
    );

    const banner = screen.getByRole('status');
    expect(banner.getAttribute('aria-live')).toBe('polite');
    expect(banner.textContent).toContain('A new version of Edovita is ready.');

    fireEvent.click(screen.getByRole('button', { name: 'Update now' }));
    expect(updates).toBe(1);

    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss update notice' }),
    );
    expect(dismisses).toBe(1);
  });

  it('disables the update button while reloading', () => {
    render(
      <UpdateBanner
        visible
        disabled
        message="A new version of Edovita is ready."
        actionLabel="Update now"
        dismissLabel="Dismiss update notice"
        onUpdate={() => {}}
        onDismiss={() => {}}
      />,
    );

    const btn = screen.getByRole('button', {
      name: 'Update now',
    }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
