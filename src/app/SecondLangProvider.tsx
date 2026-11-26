import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { foodName, getRecipeTitle } from '../catalog/index.ts';
import {
  isSupportedSecondaryLang,
  type FoodId,
  type LangCode,
  type LangMeta,
  type LanguagesRegistry,
  type RecipeId,
  type SecondLangSetting,
  type UiLocaleDict,
} from '../domain/index.ts';
import {
  LANGUAGES_REGISTRY,
  PSEUDO_RTL_LANG,
  autoSecondLang,
  effectiveSecondLang,
  getLangMeta,
  isPseudoRtlEnabled,
  pseudoRtlFoodName,
  pseudoRtlRecipeTitle,
  readStoredSecondLang,
  tIn,
  tSecond as translateSecond,
  withPseudoRtlRegistry,
  writeStoredSecondLang,
  type SecondLangEnv,
} from '../i18n/index.ts';
import { I18nContext } from './I18nProvider.tsx';
import { SettingsContext } from './SettingsProvider.tsx';

export type SetSecondLangResult = 'ok' | 'same' | 'invalid';

export interface SecondLangContextValue {
  /** Gespeicherte Einstellung: `null` = automatisch, `'none'` = keine, Sprachcode = manuelle Wahl. */
  readonly setting: SecondLangSetting;
  /** Wirksame Zweitsprache (nie gleich der UI-Sprache, `null` wenn aus oder nicht verfügbar). */
  readonly effective: LangCode | null;
  /** Metadaten der wirksamen Zweitsprache (`locale`, `dir`, `name`) oder `null`. */
  readonly effectiveMeta: LangMeta | null;
  /** Automatisch aus Ort ermittelte Zweitsprache (für Menü-/Listen-Beschriftung). */
  readonly autoCode: LangCode | null;
  /** Wahr, wenn die Einstellung auf «Automatisch (Ort)» steht (`setting === null`). */
  readonly isAuto: boolean;
  /** Alle in der Registry eingetragenen Zweitsprachen (ohne Rechts-Gate, ADR-003). */
  readonly secondaryLanguages: readonly LangCode[];
  /** Metadaten einer Zweitsprache über eigene Schlüssel. */
  readonly metaFor: (code: LangCode) => LangMeta | undefined;
  /** Liefert den Lebensmittelnamen in der wirksamen Zweitsprache oder `null` (kein EN-Ersatz). */
  readonly secondFoodName: (
    foodId: FoodId | string,
    fallbackBaseName?: string,
  ) => string | null;
  /** Liefert den Rezepttitel in der wirksamen Zweitsprache, wenn er vorliegt und vom Haupttitel abweicht (kein EN-Ersatz). */
  readonly secondRecipeTitle: (
    recipeId: RecipeId | string,
    mainTitle: string,
  ) => string | null;
  /** Liefert einen UI-Text in der wirksamen Zweitsprache (leer, wenn keine Zweitsprache, Schlüssel fehlt oder gleich Haupttext). */
  readonly tSecond: (
    key: string,
    vars?: Readonly<Record<string, string | number>>,
  ) => string;
  /** Ändert die Zweitsprachen-Wahl (`'auto'`, `'none'` oder Sprachcode). */
  readonly setSecondLang: (
    next: 'auto' | 'none' | LangCode,
  ) => SetSecondLangResult;
}

export const SecondLangContext = createContext<SecondLangContextValue | null>(
  null,
);

export interface SecondLangProviderProps {
  readonly children: ReactNode;
  readonly timeZone?: string | null;
  readonly navigatorLanguages?: readonly string[] | null;
  readonly registry?: LanguagesRegistry;
  readonly glossaries?: Readonly<Record<string, Readonly<Record<string, string>>>>;
  readonly locales?: Readonly<Record<string, UiLocaleDict>>;
  readonly enablePseudoRtl?: boolean;
}

interface LocalSecondState {
  readonly value: SecondLangSetting;
  readonly minVersion: number;
}

/**
 * Eigener Bereichs-Provider für die Zweitsprache von Lebensmitteln (ADR-001 Regel 6, ADR-003, Issues #12 & #32).
 * - Standard ist `null` (automatisch nach Ort über feste Tabellen, keine Geolocation-API, nicht gespeichert).
 * - Manuelle Wahl (`'none'` oder Sprachcode) wird lokal in `localStorage` und `Settings.secondLang` gespeichert.
 * - Bei Wechsel der UI-Sprache auf die gewählte Zweitsprache wird diese automatisch ausgeblendet.
 */
export function SecondLangProvider({
  children,
  timeZone,
  navigatorLanguages,
  registry,
  glossaries,
  locales,
  enablePseudoRtl,
}: SecondLangProviderProps) {
  const settingsCtx = useContext(SettingsContext);
  const i18nCtx = useContext(I18nContext);
  const uiLang: LangCode = i18nCtx?.lang ?? 'de';

  const activeRegistry = useMemo<LanguagesRegistry>(() => {
    const base = registry ?? LANGUAGES_REGISTRY;
    if (enablePseudoRtl || isPseudoRtlEnabled()) {
      return withPseudoRtlRegistry(base);
    }
    return base;
  }, [enablePseudoRtl, registry]);

  const env = useMemo<SecondLangEnv | undefined>(() => {
    if (timeZone === undefined && navigatorLanguages === undefined) {
      return undefined;
    }
    return { timeZone, navigatorLanguages };
  }, [navigatorLanguages, timeZone]);

  const [localState, setLocalState] = useState<LocalSecondState>(() => ({
    value: readStoredSecondLang(activeRegistry),
    minVersion: 0,
  }));

  const persistedSettings = settingsCtx?.persisted ?? false;
  const settingsLoading = settingsCtx?.loading ?? true;
  const settingsVersion = settingsCtx?.version ?? 0;
  const dbSecondLang = settingsCtx?.settings.secondLang;

  const syncedFromDb =
    !settingsLoading &&
    persistedSettings &&
    dbSecondLang !== undefined &&
    settingsVersion > localState.minVersion;

  const setting: SecondLangSetting = syncedFromDb
    ? dbSecondLang
    : localState.value;

  useEffect(() => {
    if (syncedFromDb) {
      writeStoredSecondLang(setting, activeRegistry);
    }
  }, [activeRegistry, setting, syncedFromDb]);

  const autoCode = useMemo(
    () => autoSecondLang(uiLang, activeRegistry, env),
    [activeRegistry, env, uiLang],
  );

  const effective = useMemo(
    () => effectiveSecondLang(setting, uiLang, activeRegistry, env),
    [activeRegistry, env, setting, uiLang],
  );

  const effectiveMeta = useMemo<LangMeta | null>(
    () => (effective ? (getLangMeta(effective, activeRegistry) ?? null) : null),
    [activeRegistry, effective],
  );

  const updateSettings = settingsCtx?.updateSettings;

  const setSecondLang = useCallback(
    (next: 'auto' | 'none' | LangCode): SetSecondLangResult => {
      if (next === 'auto') {
        setLocalState({ value: null, minVersion: settingsVersion + 1 });
        writeStoredSecondLang(null, activeRegistry);
        if (updateSettings && persistedSettings) {
          void updateSettings({ secondLang: null });
        }
        return 'ok';
      }

      if (next === 'none') {
        setLocalState({ value: 'none', minVersion: settingsVersion + 1 });
        writeStoredSecondLang('none', activeRegistry);
        if (updateSettings) {
          void updateSettings(
            persistedSettings
              ? { secondLang: 'none' }
              : { uiLang, secondLang: 'none' },
          );
        }
        return 'ok';
      }

      if (next === uiLang) {
        return 'same';
      }

      if (!isSupportedSecondaryLang(next, activeRegistry)) {
        return 'invalid';
      }

      setLocalState({ value: next, minVersion: settingsVersion + 1 });
      writeStoredSecondLang(next, activeRegistry);
      if (
        updateSettings &&
        next !== PSEUDO_RTL_LANG &&
        isSupportedSecondaryLang(next, LANGUAGES_REGISTRY)
      ) {
        void updateSettings(
          persistedSettings
            ? { secondLang: next }
            : { uiLang, secondLang: next },
        );
      }
      return 'ok';
    },
    [activeRegistry, persistedSettings, settingsVersion, uiLang, updateSettings],
  );

  const metaFor = useCallback(
    (code: LangCode) => getLangMeta(code, activeRegistry),
    [activeRegistry],
  );

  const secondFoodName = useCallback(
    (foodId: FoodId | string, fallbackBaseName?: string): string | null => {
      if (!effective) {
        return null;
      }
      if (effective === PSEUDO_RTL_LANG) {
        return pseudoRtlFoodName(foodId, fallbackBaseName);
      }
      return foodName(foodId, effective, glossaries);
    },
    [effective, glossaries],
  );

  const secondRecipeTitle = useCallback(
    (recipeId: RecipeId | string, mainTitle: string): string | null => {
      if (!effective) {
        return null;
      }
      if (effective === PSEUDO_RTL_LANG) {
        const rtlTitle = pseudoRtlRecipeTitle(recipeId, mainTitle);
        return rtlTitle && rtlTitle !== mainTitle ? rtlTitle : null;
      }
      const localized = getRecipeTitle(recipeId, effective);
      return localized && localized !== mainTitle ? localized : null;
    },
    [effective],
  );

  const tSecond = useCallback(
    (
      key: string,
      vars?: Readonly<Record<string, string | number>>,
    ): string => {
      if (!effective) {
        return '';
      }
      const mainText = tIn(uiLang, key, vars, {
        registry: activeRegistry,
        locales:
          locales && Object.hasOwn(locales, uiLang) ? locales : undefined,
      });
      return translateSecond(effective, uiLang, key, vars, {
        registry: activeRegistry,
        locales,
        mainText,
      });
    },
    [activeRegistry, effective, locales, uiLang],
  );

  const value = useMemo<SecondLangContextValue>(
    () => ({
      setting,
      effective,
      effectiveMeta,
      autoCode,
      isAuto: setting === null,
      secondaryLanguages: activeRegistry.secondary,
      metaFor,
      secondFoodName,
      secondRecipeTitle,
      tSecond,
      setSecondLang,
    }),
    [
      activeRegistry.secondary,
      autoCode,
      effective,
      effectiveMeta,
      metaFor,
      secondFoodName,
      secondRecipeTitle,
      setSecondLang,
      setting,
      tSecond,
    ],
  );

  return (
    <SecondLangContext.Provider value={value}>
      {children}
    </SecondLangContext.Provider>
  );
}
