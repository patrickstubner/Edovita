import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { foodName, getRecipeText, listFoods } from '../catalog/index.ts';
import {
  BrandsSheet,
  CatalogAddPanel,
  Icon,
  QrImportDialog,
  QrSheet,
  Screen,
  ShopGroup,
  ShopHaveSheet,
  ShopRow,
  ShopSourceSheet,
  Toast,
  type BrandCardData,
  type CatalogFoodOption,
  type ShopSourceLineItem,
} from '../components/index.ts';
import {
  parseShopImport,
  type FoodId,
  type ImportShopItem,
  type ShopState,
  type ShoppingItem,
} from '../domain/index.ts';
import {
  useI18n,
  useSecondLang,
  useShareList,
  useShoppingList,
} from '../hooks/index.ts';
import {
  BRAND_LABEL_KEYS,
  FOOD_GROUP_LABEL_KEYS,
  REGION_LABEL_KEYS,
} from '../i18n/index.ts';
import {
  STORE_BRANDS,
  buildSourceSummary,
  haveStepOf,
  isHaveAll,
  isPartialHave,
  shopBuyQty,
  shopHaveOf,
  shopNeedOf,
  snapHaveQty,
} from '../shopping/index.ts';

interface ToastState {
  readonly message: string;
  readonly canUndo: boolean;
}

interface HaveDraftState {
  readonly all: boolean;
  readonly value: number;
}

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Einkaufsliste (`#/einkauf`) gemäss Prototyp v5.9 & Issues #11 / #31:
 * - Drei Zustände (offen / im Korb / schon zu Hause) + Teilmenge (`qtyHave`) persistent über `ShoppingRepository`
 * - Gruppen nach Lebensmittelbereich, Abschnitte «Im Korb» & «Schon zu Hause»
 * - Rezept-Herkunft über ⓘ-Knopf pro Rezept-Zutat mit Herkunfts-Sheet (Gericht, Menge, Summe)
 * - «Hab ich» / «Teilweise» / «Doch kaufen» öffnen einheitlich das Vorrats-Sheet (Alles vorhanden oder Teilmenge)
 * - Manuelle Katalog-Suche (`foods.json`, bewusste Ergänzung), Hausmarken-Info oben
 * - Fixe `BottomActions`: «QR-Einkaufsliste» (lokales `qrcode-generator`, reines React-SVG)
 *   und «Liste teilen» (Web Share API / Zwischenablage; nie G-Daten, nie `qtyHave`)
 * - Gehärteter QR-Import (`#/einkauf#import=...`) mit Validierung + Bestätigungsdialog
 */
export function ShoppingListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t, fmtAmount } = useI18n();
  const { effectiveMeta: secondMeta, secondFoodName } = useSecondLang();
  const {
    items,
    grouped,
    resolveItemName,
    resolveItemAmount,
    toggleCart,
    applyHave,
    resetHave,
    undo,
    addFromCatalog,
    clearDone,
    applyImport,
  } = useShoppingList();

  const [query, setQuery] = useState<string>('');
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [brandsOpen, setBrandsOpen] = useState<boolean>(false);
  const [sourceItemId, setSourceItemId] = useState<string | null>(null);
  const [haveItemId, setHaveItemId] = useState<string | null>(null);
  const [haveDraft, setHaveDraft] = useState<HaveDraftState | null>(null);
  const [dismissedHash, setDismissedHash] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const haveTriggerRef = useRef<HTMLButtonElement | null>(null);

  const showToast = useCallback((next: ToastState, durationMs = 3600) => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(next);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  // Eingehendes QR-Import-Fragment (`#/einkauf#import=...`) direkt aus location.hash ableiten
  const incomingImport = useMemo(() => {
    const hash = location.hash;
    if (!hash || !hash.startsWith('#import=') || hash === dismissedHash) {
      return null;
    }
    return {
      hash,
      result: parseShopImport(`#/einkauf${hash}`),
    };
  }, [dismissedHash, location.hash]);

  const pendingImportItems =
    incomingImport && incomingImport.result.ok
      ? incomingImport.result.value
      : null;
  const importError =
    incomingImport && !incomingImport.result.ok
      ? incomingImport.result.error
      : null;

  const clearImportFragment = useCallback(() => {
    if (incomingImport) {
      setDismissedHash(incomingImport.hash);
    }
    navigate('/einkauf', { replace: true });
  }, [incomingImport, navigate]);

  const { qrFragment, qrMatrix, shareList, copyQrLink } = useShareList({
    items,
    grouped,
    resolveItemName,
    resolveItemAmount,
    qrEnabled: qrOpen,
  });

  const allCatalogOptions = useMemo<readonly CatalogFoodOption[]>(() => {
    return listFoods()
      .map((food) => ({
        id: food.id,
        name: foodName(food.id, lang) ?? food.id,
        groupLabel: t(FOOD_GROUP_LABEL_KEYS[food.group]),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
  }, [lang, t]);

  const catalogResults = useMemo<readonly CatalogFoodOption[]>(() => {
    const q = normalizeSearch(query).trim();
    if (!q) return [];
    return allCatalogOptions
      .filter(
        (entry) =>
          normalizeSearch(entry.name).includes(q) ||
          normalizeSearch(entry.id).includes(q),
      )
      .slice(0, 6);
  }, [allCatalogOptions, query]);

  const brandCards = useMemo<readonly BrandCardData[]>(() => {
    return STORE_BRANDS.map((brand) => ({
      id: brand.id,
      name: t(BRAND_LABEL_KEYS[brand.id]),
      storesText: t('marken.stores', {
        s: brand.stores.map((region) => t(REGION_LABEL_KEYS[region])).join(', '),
      }),
      linesText: t('marken.lines', { l: brand.lines.join(' · ') }),
    }));
  }, [t]);

  const stateLabels = useMemo<Readonly<Record<ShopState, string>>>(
    () => ({
      open: t('shop.state.open'),
      cart: t('shop.state.cart'),
      home: t('shop.state.home'),
    }),
    [t],
  );

  const activeSourceItem = useMemo<ShoppingItem | null>(() => {
    if (!sourceItemId) return null;
    const found = items.find((it) => it.id === sourceItemId);
    return found && found.fromRecipes.length > 0 ? found : null;
  }, [items, sourceItemId]);

  const activeHaveItem = useMemo<ShoppingItem | null>(() => {
    if (!haveItemId) return null;
    return items.find((it) => it.id === haveItemId) ?? null;
  }, [haveItemId, items]);

  const handleToggleCart = useCallback(
    (id: string) => {
      void toggleCart(id);
    },
    [toggleCart],
  );

  const handleCloseSource = useCallback(() => {
    setSourceItemId(null);
    const trigger = sourceTriggerRef.current;
    if (trigger && trigger.isConnected) {
      trigger.focus({ preventScroll: true });
    }
  }, []);

  const handleOpenSource = useCallback(
    (id: string, trigger: HTMLButtonElement) => {
      setHaveItemId(null);
      setHaveDraft(null);
      if (sourceItemId === id) {
        setSourceItemId(null);
        trigger.focus({ preventScroll: true });
        return;
      }
      const target = items.find(
        (it) => it.id === id && it.fromRecipes.length > 0,
      );
      if (!target) return;
      sourceTriggerRef.current = trigger;
      setSourceItemId(target.id);
    },
    [items, sourceItemId],
  );

  const handleCloseHave = useCallback(() => {
    setHaveItemId(null);
    setHaveDraft(null);
    const trigger = haveTriggerRef.current;
    if (trigger && trigger.isConnected) {
      trigger.focus({ preventScroll: true });
    }
  }, []);

  const handleOpenHave = useCallback(
    (id: string, trigger: HTMLButtonElement) => {
      setSourceItemId(null);
      if (haveItemId === id) {
        setHaveItemId(null);
        setHaveDraft(null);
        trigger.focus({ preventScroll: true });
        return;
      }
      const target = items.find((it) => it.id === id);
      if (!target) return;
      const need = shopNeedOf(target);
      const have = shopHaveOf(target);
      const all = isHaveAll(target);
      const partial = isPartialHave(target);
      haveTriggerRef.current = trigger;
      setHaveItemId(target.id);
      if (!all && !partial) {
        setHaveDraft({ all: true, value: need ?? 1 });
      } else if (all) {
        setHaveDraft({ all: true, value: need ?? 1 });
      } else {
        setHaveDraft({ all: false, value: have });
      }
    },
    [haveItemId, items],
  );

  const handleToggleHaveAll = useCallback(() => {
    if (!activeHaveItem || !haveDraft) return;
    const need = shopNeedOf(activeHaveItem);
    if (haveDraft.all) {
      setHaveDraft({ all: false, value: 0 });
    } else {
      setHaveDraft({ all: true, value: need ?? 1 });
    }
  }, [activeHaveItem, haveDraft]);

  const handleStepHave = useCallback(
    (delta: -1 | 1) => {
      if (!activeHaveItem || !haveDraft) return;
      const need = shopNeedOf(activeHaveItem);
      if (need === null) return;
      const step = haveStepOf(need, activeHaveItem.unit);
      const base = haveDraft.all ? need : haveDraft.value;
      const next = snapHaveQty(base + delta * step, need, activeHaveItem.unit);
      setHaveDraft({ all: next >= need, value: next });
    },
    [activeHaveItem, haveDraft],
  );

  const handleSliderHave = useCallback(
    (rawValue: number) => {
      if (!activeHaveItem) return;
      const need = shopNeedOf(activeHaveItem);
      if (need === null) return;
      const next = snapHaveQty(rawValue, need, activeHaveItem.unit);
      setHaveDraft({ all: next >= need, value: next });
    },
    [activeHaveItem],
  );

  const handleApplyHave = useCallback(() => {
    if (!activeHaveItem || !haveDraft) return;
    const targetId = activeHaveItem.id;
    const draft = haveDraft;
    setHaveItemId(null);
    setHaveDraft(null);
    void applyHave(targetId, { all: draft.all, qtyHave: draft.value }).then(
      () => {
        const trigger = haveTriggerRef.current;
        if (trigger && trigger.isConnected) {
          trigger.focus({ preventScroll: true });
        }
      },
    );
  }, [activeHaveItem, applyHave, haveDraft]);

  const handleResetHave = useCallback(() => {
    if (!activeHaveItem) return;
    const targetId = activeHaveItem.id;
    setHaveItemId(null);
    setHaveDraft(null);
    void resetHave(targetId).then(() => {
      const trigger = haveTriggerRef.current;
      if (trigger && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    });
  }, [activeHaveItem, resetHave]);

  const handleUndo = useCallback(() => {
    void undo().then((didUndo) => {
      if (didUndo) {
        showToast(
          {
            message: t('shop.undone_toast'),
            canUndo: false,
          },
          2400,
        );
      }
    });
  }, [showToast, t, undo]);

  const handleCatalogAdd = useCallback(
    (foodId: FoodId, name: string) => {
      void addFromCatalog(foodId).then(() => {
        setQuery('');
        showToast(
          {
            message: t('shop.add.added_toast', { name }),
            canUndo: false,
          },
          2400,
        );
      });
    },
    [addFromCatalog, showToast, t],
  );

  const handleClearDone = useCallback(() => {
    void clearDone().then(() => {
      showToast({
        message: t('shop.cleared_toast'),
        canUndo: true,
      });
    });
  }, [clearDone, showToast, t]);

  const handleShare = useCallback(() => {
    void shareList().then((outcome) => {
      if (outcome === 'shared') {
        showToast({ message: t('shop.share.shared'), canUndo: false }, 2400);
      } else if (outcome === 'copied') {
        showToast({ message: t('shop.share.copied'), canUndo: false }, 2400);
      } else {
        showToast({ message: t('shop.share.failed'), canUndo: false }, 2400);
      }
    });
  }, [shareList, showToast, t]);

  const handleCopyQr = useCallback(() => {
    void copyQrLink().then((copied) => {
      showToast(
        {
          message: copied ? t('qrshop.copied') : t('qrshop.copyfail'),
          canUndo: false,
        },
        2600,
      );
    });
  }, [copyQrLink, showToast, t]);

  const handleConfirmImport = useCallback(
    (mode: 'merge' | 'replace') => {
      if (!pendingImportItems) return;
      const count = pendingImportItems.length;
      void applyImport(pendingImportItems, mode).then(() => {
        clearImportFragment();
        showToast(
          {
            message: t('qrshop.imported', { n: count }),
            canUndo: true,
          },
          3600,
        );
      });
    },
    [applyImport, clearImportFragment, pendingImportItems, showToast, t],
  );

  const formatImportAmount = useCallback(
    (item: ImportShopItem): string => {
      if (
        typeof item.amount === 'number' &&
        Number.isFinite(item.amount) &&
        item.unit
      ) {
        return fmtAmount(item.amount, item.unit);
      }
      return '';
    },
    [fmtAmount],
  );

  const renderShopRow = (item: ShoppingItem, rowState: ShopState) => {
    const name = resolveItemName(item);
    const secondaryName = item.customLabel
      ? null
      : secondFoodName(item.food, name);
    const ariaName = secondaryName ? `${name} · ${secondaryName}` : name;
    const needText = resolveItemAmount(item);
    const partial = rowState !== 'home' && isPartialHave(item);
    const buyQty = partial ? shopBuyQty(item) : null;
    const buyAmountText =
      partial && buyQty !== null && item.unit
        ? fmtAmount(buyQty, item.unit)
        : undefined;
    const qtyBuyOfAria =
      partial && buyAmountText && needText
        ? t('shop.qty.buyof', { buy: buyAmountText, need: needText })
        : undefined;
    const baseToggleLabel = t(
      rowState === 'cart' ? 'shop.fromcart' : 'shop.tocart',
      { name: ariaName },
    );
    const toggleLabel = qtyBuyOfAria
      ? `${baseToggleLabel}, ${qtyBuyOfAria}`
      : baseToggleLabel;

    const haveButtonLabel =
      rowState === 'home'
        ? t('shop.undo')
        : partial
          ? t('shop.have.partial')
          : t('shop.have');
    const haveButtonAriaLabel =
      rowState === 'home'
        ? t('shop.have.aria.home', { name: ariaName })
        : partial
          ? t('shop.have.aria.partial', { name: ariaName })
          : t('shop.have.aria', { name: ariaName });

    const hasSource = item.fromRecipes.length > 0;
    const sourceAriaLabel = hasSource
      ? t('shop.usedin', {
          recipes: item.fromRecipes
            .map((rid) => getRecipeText(rid, lang)?.title ?? rid)
            .join(', '),
        })
      : undefined;

    return (
      <ShopRow
        key={item.id}
        id={item.id}
        food={item.food}
        unit={item.unit}
        name={name}
        secondaryName={secondaryName}
        secondaryLocale={secondMeta?.locale}
        secondaryDir={secondMeta?.dir}
        amountText={needText}
        buyAmountText={buyAmountText}
        isPartial={partial}
        qtyBuyOfAria={qtyBuyOfAria}
        state={rowState}
        toggleLabel={toggleLabel}
        haveButtonLabel={haveButtonLabel}
        haveButtonAriaLabel={haveButtonAriaLabel}
        isHaveOpen={haveItemId === item.id}
        hasSource={hasSource}
        sourceAriaLabel={sourceAriaLabel}
        isSourceOpen={sourceItemId === item.id}
        onToggleCart={handleToggleCart}
        onOpenSource={handleOpenSource}
        onOpenHave={handleOpenHave}
      />
    );
  };

  const sourceSheetData = useMemo<{
    readonly title: string;
    readonly lines: readonly ShopSourceLineItem[];
    readonly sumText: string;
  } | null>(() => {
    if (!activeSourceItem) return null;
    const summary = buildSourceSummary(activeSourceItem);
    const missingLabel = t('shop.amount.missing');
    const lines: ShopSourceLineItem[] = summary.lines.map((line) => ({
      key: line.recipeId,
      text: t('shop.src.line.extra', {
        recipe: getRecipeText(line.recipeId, lang)?.title ?? line.recipeId,
        qty:
          line.amount !== null && line.unit
            ? fmtAmount(line.amount, line.unit)
            : missingLabel,
      }),
    }));
    const sumQty =
      summary.sumAmount !== null && summary.unit
        ? fmtAmount(summary.sumAmount, summary.unit)
        : missingLabel;
    return {
      title: resolveItemName(activeSourceItem),
      lines,
      sumText: t('shop.src.sum', { qty: sumQty }),
    };
  }, [activeSourceItem, fmtAmount, lang, resolveItemName, t]);

  const haveSheetData = useMemo<{
    readonly title: string;
    readonly need: number | null;
    readonly step: number;
    readonly draftAll: boolean;
    readonly draftValue: number;
    readonly formattedValue: string;
    readonly atHomeLabel: string;
  } | null>(() => {
    if (!activeHaveItem || !haveDraft) return null;
    const need = shopNeedOf(activeHaveItem);
    const step = need !== null ? haveStepOf(need, activeHaveItem.unit) : 1;
    const displayVal =
      need !== null ? (haveDraft.all ? need : haveDraft.value) : 0;
    const formattedValue =
      need !== null && activeHaveItem.unit
        ? fmtAmount(displayVal, activeHaveItem.unit)
        : t('shop.amount.missing');
    return {
      title: resolveItemName(activeHaveItem),
      need,
      step,
      draftAll: haveDraft.all,
      draftValue: haveDraft.value,
      formattedValue,
      atHomeLabel: t('shop.have.athome', { qty: formattedValue }),
    };
  }, [activeHaveItem, fmtAmount, haveDraft, resolveItemName, t]);

  const subtitle =
    grouped.recipeIds.length > 0
      ? t('shop.subtitle.recipes', { n: grouped.recipeIds.length })
      : t('shop.subtitle.items', { n: grouped.counts.total });

  return (
    <Screen
      header={
        <div className="edo-row">
          <button
            type="button"
            className="edo-back-btn"
            aria-label={t('status.back')}
            onClick={() => navigate('/rezepte')}
          >
            <Icon name="left" />
          </button>
          <div className="edo-grow">
            <h1>{t('einkauf.einkaufsliste')}</h1>
            <p className="edo-cap" data-testid="shop-subtitle">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            className="edo-back-btn"
            aria-label={t('marken.title')}
            title={t('marken.title')}
            data-testid="brands-info-btn"
            onClick={() => setBrandsOpen(true)}
          >
            <Icon name="info" />
          </button>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            className="edo-btn edo-btn-secondary"
            data-testid="shop-qr-btn"
            onClick={() => setQrOpen(true)}
          >
            <Icon name="qr" size="sm" />
            <span>{t('qrshop.title')}</span>
          </button>
          <button
            type="button"
            className="edo-btn"
            data-testid="shop-share-btn"
            onClick={handleShare}
          >
            <Icon name="users" size="sm" />
            <span>{t('shop.share.button')}</span>
          </button>
        </>
      }
      actionsLabel={t('shop.actions_label')}
    >
      <div className="edo-stack">
        {importError ? (
          <div
            className="edo-banner edo-banner-bad"
            role="alert"
            data-testid="qr-import-error"
          >
            <Icon name="alert" />
            <span className="edo-grow">
              {t('qrshop.bad', { e: importError })}
            </span>
            <button
              type="button"
              className="edo-havebtn"
              onClick={clearImportFragment}
            >
              {t('dialog.close')}
            </button>
          </div>
        ) : null}

        <CatalogAddPanel
          heading={t('shop.add.heading')}
          query={query}
          placeholder={t('shop.add.placeholder')}
          addLabel={t('shop.add.button')}
          emptyLabel={t('shop.add.empty')}
          results={catalogResults}
          onQueryChange={setQuery}
          onAdd={handleCatalogAdd}
        />

        {items.length > 0 ? (
          <>
            <section className="edo-card edo-card-mint edo-stack">
              <strong>{t('einkauf.so_funktioniert_die_liste')}</strong>
              <p className="edo-row">
                <Icon name="check" size="sm" />
                <span>{t('einkauf.antippen_liegt_im_korb')}</span>
              </p>
              <p className="edo-row">
                <Icon name="home" size="sm" />
                <span>{t('einkauf.hab_ich_schon_zu')}</span>
              </p>
            </section>

            {grouped.openGroups.map((group) => (
              <ShopGroup
                key={group.group}
                title={t(FOOD_GROUP_LABEL_KEYS[group.group])}
                count={group.count}
                testId={`shop-group-${group.group}`}
              >
                {group.items.map((item) => renderShopRow(item, 'open'))}
              </ShopGroup>
            ))}

            {grouped.counts.open === 0 ? (
              <div
                className="edo-banner edo-banner-ok"
                data-testid="shop-all-done"
              >
                <Icon name="check" />
                <strong className="edo-grow">{t('shop.done')}</strong>
              </div>
            ) : null}

            {grouped.cartItems.length > 0 ? (
              <ShopGroup
                title={t('shop.sec.cart')}
                count={grouped.cartItems.length}
                testId="shop-section-cart"
                action={
                  <button
                    type="button"
                    className="edo-havebtn"
                    data-testid="shop-clear-done"
                    onClick={handleClearDone}
                  >
                    <Icon name="trash" size="sm" />
                    <span>{t('shop.clear_done')}</span>
                  </button>
                }
              >
                {grouped.cartItems.map((item) => renderShopRow(item, 'cart'))}
              </ShopGroup>
            ) : null}

            {grouped.homeItems.length > 0 ? (
              <ShopGroup
                title={t('shop.sec.home')}
                count={grouped.homeItems.length}
                testId="shop-section-home"
              >
                {grouped.homeItems.map((item) => renderShopRow(item, 'home'))}
              </ShopGroup>
            ) : null}
          </>
        ) : (
          <section
            className="edo-card edo-card-mint edo-stack"
            data-testid="shop-empty"
          >
            <h2>{t('shop.empty.title')}</h2>
            <p className="edo-sub">{t('shop.empty.text')}</p>
            <button
              type="button"
              className="edo-btn edo-btn-secondary"
              onClick={() => navigate('/rezepte')}
            >
              <Icon name="utensils" size="sm" />
              <span>{t('shop.empty.cta')}</span>
            </button>
          </section>
        )}
      </div>

      <ShopSourceSheet
        open={sourceSheetData !== null}
        title={sourceSheetData?.title ?? ''}
        lines={sourceSheetData?.lines ?? []}
        sumText={sourceSheetData?.sumText ?? ''}
        closeLabel={t('dialog.close')}
        onClose={handleCloseSource}
      />

      <ShopHaveSheet
        open={haveSheetData !== null}
        title={haveSheetData?.title ?? ''}
        hint={t('shop.have.title')}
        allLabel={t('shop.have.all')}
        atHomeLabel={haveSheetData?.atHomeLabel ?? ''}
        resetLabel={t('shop.have.reset')}
        applyLabel={t('shop.have.apply')}
        sliderLabel={t('shop.have.slider')}
        minusLabel={t('shop.have.step.minus')}
        plusLabel={t('shop.have.step.plus')}
        closeLabel={t('dialog.close')}
        need={haveSheetData?.need ?? null}
        step={haveSheetData?.step ?? 1}
        draftAll={haveSheetData?.draftAll ?? true}
        draftValue={haveSheetData?.draftValue ?? 0}
        formattedValue={haveSheetData?.formattedValue ?? ''}
        onToggleAll={handleToggleHaveAll}
        onStepMinus={() => handleStepHave(-1)}
        onStepPlus={() => handleStepHave(1)}
        onSliderChange={handleSliderHave}
        onReset={handleResetHave}
        onApply={handleApplyHave}
        onClose={handleCloseHave}
      />

      <QrSheet
        open={qrOpen}
        title={t('qrshop.title')}
        subtitle={t('qrshop.sub')}
        qrSize={qrMatrix?.size ?? null}
        qrPath={qrMatrix?.path ?? null}
        errorText={t('qrshop.err')}
        emptyText={t('qrshop.empty')}
        isEmpty={items.length === 0}
        fragmentPreview={
          qrFragment.length > 64 ? `${qrFragment.slice(0, 64)}…` : qrFragment
        }
        copyLabel={t('qrshop.copy')}
        receiveNote={t('qrshop.receive')}
        securityNote={t('qrshop.note')}
        closeLabel={t('dialog.close')}
        onCopy={handleCopyQr}
        onClose={() => setQrOpen(false)}
      />

      <QrImportDialog
        items={pendingImportItems}
        title={t('qrshop.confirm.title', {
          n: pendingImportItems?.length ?? 0,
        })}
        subtitle={t('qrshop.confirm.sub')}
        stateLabels={stateLabels}
        formatAmount={formatImportAmount}
        mergeLabel={t('qrshop.confirm.merge')}
        replaceLabel={t('qrshop.confirm.replace')}
        cancelLabel={t('qrshop.confirm.cancel')}
        closeLabel={t('dialog.close')}
        onMerge={() => handleConfirmImport('merge')}
        onReplace={() => handleConfirmImport('replace')}
        onCancel={clearImportFragment}
      />

      <BrandsSheet
        open={brandsOpen}
        title={t('marken.title')}
        subtitle={t('marken.sub')}
        brands={brandCards}
        note={t('marken.note')}
        closeLabel={t('dialog.close')}
        onClose={() => setBrandsOpen(false)}
      />

      <Toast
        message={toast?.message ?? null}
        undoLabel={toast?.canUndo ? t('detail.undo') : undefined}
        onUndo={toast?.canUndo ? handleUndo : undefined}
      />
    </Screen>
  );
}
