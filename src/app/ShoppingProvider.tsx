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
import {
  classifyStorageError,
  type StorageErrorCode,
} from './storageError.ts';

export interface ShoppingContextValue {
  items: readonly ShoppingItem[];
  loading: boolean;
  error: StorageErrorCode | null;
  clearError: () => void;
  upsertItem: (item: ShoppingItem) => Promise<ShoppingItem | null>;
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
 * IndexedDB-/Quota-Fehler werden gefangen, `loading` zurückgesetzt und nur generisch gemeldet (G1).
 */
export function ShoppingProvider({
  repository,
  children,
}: ShoppingProviderProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<StorageErrorCode | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reload = useCallback(async (): Promise<ShoppingItem[]> => {
    try {
      const loaded = await repository.list();
      setItems(loaded);
      setError(null);
      setLoading(false);
      return loaded;
    } catch (err) {
      setError(classifyStorageError(err, 'read'));
      setLoading(false);
      return items;
    }
  }, [items, repository]);

  useEffect(() => {
    let active = true;
    void repository
      .list()
      .then((loaded) => {
        if (active) {
          setItems(loaded);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(classifyStorageError(err, 'read'));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [repository]);

  const upsertItem = useCallback(
    async (item: ShoppingItem): Promise<ShoppingItem | null> => {
      try {
        const saved = await repository.upsert(item);
        const next = await repository.list();
        setItems(next);
        setError(null);
        return saved;
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return null;
      }
    },
    [repository],
  );

  const replaceAll = useCallback(
    async (nextItems: readonly ShoppingItem[]): Promise<ShoppingItem[]> => {
      try {
        const saved = await repository.replaceAll(nextItems);
        setItems(saved);
        setError(null);
        return saved;
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return items;
      }
    },
    [items, repository],
  );

  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        await repository.remove(id);
        const next = await repository.list();
        setItems(next);
        setError(null);
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
      }
    },
    [repository],
  );

  const clear = useCallback(async (): Promise<void> => {
    try {
      await repository.clear();
      setItems([]);
      setError(null);
    } catch (err) {
      setError(classifyStorageError(err, 'write'));
    }
  }, [repository]);

  const value = useMemo<ShoppingContextValue>(
    () => ({
      items,
      loading,
      error,
      clearError,
      upsertItem,
      replaceAll,
      removeItem,
      clear,
      reload,
    }),
    [
      items,
      loading,
      error,
      clearError,
      upsertItem,
      replaceAll,
      removeItem,
      clear,
      reload,
    ],
  );

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
}
