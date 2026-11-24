import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_SETTINGS, type Settings } from '../domain/index.ts';
import type { SettingsRepository } from '../storage/index.ts';
import {
  classifyStorageError,
  type StorageErrorCode,
} from './storageError.ts';

export interface SettingsContextValue {
  settings: Settings;
  loading: boolean;
  /** `true`, sobald explizit gespeicherte Einstellungen aus dem Repository geladen oder geschrieben wurden (H1). */
  persisted: boolean;
  /** Monotoner Zähler für geladene/geschriebene Settings-Stände (H1-Synchronisierung). */
  version: number;
  error: StorageErrorCode | null;
  clearError: () => void;
  updateSettings: (patch: Partial<Settings>) => Promise<Settings>;
  reload: () => Promise<Settings>;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export interface SettingsProviderProps {
  repository: SettingsRepository;
  children: ReactNode;
}

/**
 * Eigener Bereichs-Provider nur für persistierte Einstellungen (ADR-001 Regel 6, ADR-002).
 * Repository wird injiziert (Web: DexieSettingsRepository, Tests: MemorySettingsRepository).
 * IndexedDB-/Quota-Fehler werden gefangen, `loading` zurückgesetzt und nur ein generischer
 * Fehlercode bereitgestellt (G1).
 */
export function SettingsProvider({
  repository,
  children,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
  }));
  const [loading, setLoading] = useState<boolean>(true);
  const [persisted, setPersisted] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(0);
  const [error, setError] = useState<StorageErrorCode | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const readFromRepo = useCallback(async (): Promise<{
    loaded: Settings;
    isPersisted: boolean;
  }> => {
    if (repository.getStored) {
      const stored = await repository.getStored();
      if (stored !== null) {
        return { loaded: stored, isPersisted: true };
      }
      const fallback = await repository.get();
      return { loaded: fallback, isPersisted: false };
    }
    const loaded = await repository.get();
    return { loaded, isPersisted: true };
  }, [repository]);

  const reload = useCallback(async (): Promise<Settings> => {
    try {
      const { loaded, isPersisted } = await readFromRepo();
      setSettings(loaded);
      setPersisted(isPersisted);
      setVersion((v) => v + 1);
      setError(null);
      setLoading(false);
      return loaded;
    } catch (err) {
      setError(classifyStorageError(err, 'read'));
      setLoading(false);
      return settings;
    }
  }, [readFromRepo, settings]);

  useEffect(() => {
    let active = true;
    void readFromRepo()
      .then(({ loaded, isPersisted }) => {
        if (active) {
          setSettings(loaded);
          setPersisted(isPersisted);
          setVersion((v) => v + 1);
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
  }, [readFromRepo]);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>): Promise<Settings> => {
      try {
        const updated = await repository.update(patch);
        setSettings(updated);
        setPersisted(true);
        setVersion((v) => v + 1);
        setError(null);
        return updated;
      } catch (err) {
        setError(classifyStorageError(err, 'write'));
        return settings;
      }
    },
    [repository, settings],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loading,
      persisted,
      version,
      error,
      clearError,
      updateSettings,
      reload,
    }),
    [
      settings,
      loading,
      persisted,
      version,
      error,
      clearError,
      updateSettings,
      reload,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
