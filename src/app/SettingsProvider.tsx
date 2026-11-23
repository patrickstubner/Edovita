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

export interface SettingsContextValue {
  settings: Settings;
  loading: boolean;
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
 */
export function SettingsProvider({
  repository,
  children,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
  }));
  const [loading, setLoading] = useState<boolean>(true);

  const reload = useCallback(async (): Promise<Settings> => {
    const loaded = await repository.get();
    setSettings(loaded);
    setLoading(false);
    return loaded;
  }, [repository]);

  useEffect(() => {
    let active = true;
    void repository.get().then((loaded) => {
      if (active) {
        setSettings(loaded);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [repository]);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>): Promise<Settings> => {
      const updated = await repository.update(patch);
      setSettings(updated);
      return updated;
    },
    [repository],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, loading, updateSettings, reload }),
    [settings, loading, updateSettings, reload],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
