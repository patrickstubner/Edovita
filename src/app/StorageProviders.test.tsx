import { afterEach, describe, expect, it } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { asFoodId, asRecipeId } from '../domain/index.ts';
import { useRatings, useSettings, useShopping } from '../hooks/index.ts';
import { createMemoryStorage } from '../storage/index.ts';
import { RatingsProvider } from './RatingsProvider.tsx';
import { SettingsProvider } from './SettingsProvider.tsx';
import { ShoppingProvider } from './ShoppingProvider.tsx';

afterEach(() => {
  cleanup();
});

function ProbeComponent() {
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { items, upsertItem } = useShopping();
  const { getRating, isSaved, setRating, toggleSaved } = useRatings();

  return (
    <div>
      <span data-testid="settings-loading">{String(settingsLoading)}</span>
      <span data-testid="settings-second">{settings.secondLang ?? 'none'}</span>
      <span data-testid="shopping-count">{items.length}</span>
      <span data-testid="rating-salmon">{getRating('oven_salmon') ?? 0}</span>
      <span data-testid="saved-salmon">{String(isSaved('oven_salmon'))}</span>

      <button
        type="button"
        onClick={() => void updateSettings({ secondLang: 'pt' })}
      >
        set-second-pt
      </button>
      <button
        type="button"
        onClick={() =>
          void upsertItem({
            id: 'item_broccoli',
            food: asFoodId('broccoli'),
            amount: 300,
            unit: 'g',
            state: 'open',
            fromRecipes: [asRecipeId('oven_salmon')],
            addedAt: '2026-11-23T12:00:00.000Z',
          })
        }
      >
        add-broccoli
      </button>
      <button
        type="button"
        onClick={() => void setRating('oven_salmon', 5)}
      >
        rate-salmon
      </button>
      <button
        type="button"
        onClick={() => void toggleSaved('oven_salmon')}
      >
        toggle-saved
      </button>
    </div>
  );
}

describe('Getrennte Speicher-Provider mit Repository-Injektion (ADR-001 Regel 6, E3)', () => {
  it('injiziert Memory-Repositories sauber in Settings-, Shopping- und RatingsProvider', async () => {
    const memory = createMemoryStorage();

    render(
      <SettingsProvider repository={memory.settings}>
        <ShoppingProvider repository={memory.shopping}>
          <RatingsProvider repository={memory.ratings}>
            <ProbeComponent />
          </RatingsProvider>
        </ShoppingProvider>
      </SettingsProvider>,
    );

    expect(await screen.findByText('false')).toBeInTheDocument();
    expect(screen.getByTestId('settings-second')).toHaveTextContent('none');

    fireEvent.click(screen.getByRole('button', { name: 'set-second-pt' }));
    expect(await screen.findByText('pt')).toBeInTheDocument();
    expect((await memory.settings.get()).secondLang).toBe('pt');

    fireEvent.click(screen.getByRole('button', { name: 'add-broccoli' }));
    expect(await screen.findByTestId('shopping-count')).toHaveTextContent('1');
    expect((await memory.shopping.list()).length).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'rate-salmon' }));
    expect(await screen.findByTestId('rating-salmon')).toHaveTextContent('5');
    expect(await memory.ratings.getRating('oven_salmon')).toBe(5);

    fireEvent.click(screen.getByRole('button', { name: 'toggle-saved' }));
    expect(await screen.findByTestId('saved-salmon')).toHaveTextContent('true');
    expect(await memory.ratings.isSaved('oven_salmon')).toBe(true);
  });
});
