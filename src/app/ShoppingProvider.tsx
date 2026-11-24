import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ShoppingItem } from '../domain/index.ts';
import type { ShoppingRepository } from '../storage/index.ts';

export interface ShoppingContextValue {
  items: readonly ShoppingItem[];
  loading: boolean;
  upsertItem: (item: ShoppingItem) => Promise<ShoppingItem>;
  replaceAll: (items: readonly ShoppingItem[]) => Promise<ShoppingItem[]>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<ShoppingItem[]>;
}

export const ShoppingContext = createContext<ShoppingContextValue | null>(null);

export interface ShoppingProviderProps {
  repository: ShoppingRepository;
  children: ReactNode;
}

/**
 * Eigener Bereichs-Provider nur für die Einkaufsliste (ADR-001 Regel 6, ADR-002).
 * Repository wird injiziert (Web: DexieShoppingRepository, Tests: MemoryShoppingRepository).
 */
export function ShoppingProvider({
  repository,
  children,
}: ShoppingProviderProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reload = useCallback(async (): Promise<ShoppingItem[]> => {
    const loaded = await repository.list();
    setItems(loaded);
    setLoading(false);
    return loaded;
  }, [repository]);

  useEffect(() => {
    let active = true;
    void repository.list().then((loaded) => {
      if (active) {
        setItems(loaded);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [repository]);

  const upsertItem = useCallback(
    async (item: ShoppingItem): Promise<ShoppingItem> => {
      const saved = await repository.upsert(item);
      const next = await repository.list();
      setItems(next);
      return saved;
    },
    [repository],
  );

  const replaceAll = useCallback(
    async (nextItems: readonly ShoppingItem[]): Promise<ShoppingItem[]> => {
      const saved = await repository.replaceAll(nextItems);
      setItems(saved);
      return saved;
    },
    [repository],
  );

  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      await repository.remove(id);
      const next = await repository.list();
      setItems(next);
    },
    [repository],
  );

  const clear = useCallback(async (): Promise<void> => {
    await repository.clear();
    setItems([]);
  }, [repository]);

  const value = useMemo<ShoppingContextValue>(
    () => ({
      items,
      loading,
      upsertItem,
      replaceAll,
      removeItem,
      clear,
      reload,
    }),
    [items, loading, upsertItem, replaceAll, removeItem, clear, reload],
  );

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
}
