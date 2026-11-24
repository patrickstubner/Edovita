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
  ShopRow,
  Toast,
  type BrandCardData,
  type CatalogFoodOption,
} from '../components/index.ts';
import {
  parseShopImport,
  type FoodId,
  type ImportShopItem,
  type RecipeId,
  type ShopState,
} from '../domain/index.ts';
import { useI18n, useShareList, useShoppingList } from '../hooks/index.ts';
import {
  BRAND_LABEL_KEYS,
  FOOD_GROUP_LABEL_KEYS,
  REGION_LABEL_KEYS,
} from '../i18n/index.ts';
import { STORE_BRANDS } from '../shopping/index.ts';

interface ToastState {
  readonly message: string;
  readonly canUndo: boolean;
}

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Einkaufsliste (`#/einkauf`) gemäss Prototyp & Issue #11:
 * - Drei Zustände (offen / im Korb / schon zu Hause) persistent über `ShoppingRepository`
 * - Gruppen nach Lebensmittelbereich, Abschnitte «Im Korb» & «Schon zu Hause»
 * - Rezept-Herkunft (`fromRecipes`) mit Entfernen & Rückgängig
 * - Manuelle Katalog-Suche (`foods.json`), Hausmarken-Info oben
 * - Fixe `BottomActions`: «QR-Einkaufsliste» (lokales `qrcode-generator`, reines React-SVG)
 *   und «Liste teilen» (Web Share API / Zwischenablage; nie G-Daten, ADR-004)
 * - Gehärteter QR-Import (`#/einkauf#import=...`) mit Validierung + Bestätigungsdialog
 */
export function ShoppingListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t, fmtAmount } = useI18n();
  const {
    items,
    grouped,
    resolveItemName,
    resolveItemAmount,
    toggleCart,
    markHome,
    markOpen,
    undo,
    removeRecipe,
    addFromCatalog,
    clearDone,
    applyImport,
  } = useShoppingList();

  const [query, setQuery] = useState<string>('');
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [brandsOpen, setBrandsOpen] = useState<boolean>(false);
  const [dismissedHash, setDismissedHash] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleToggleCart = useCallback(
    (id: string) => {
      void toggleCart(id);
    },
    [toggleCart],
  );

  const handleMarkHome = useCallback(
    (id: string) => {
      const target = items.find((it) => it.id === id);
      const name = target ? resolveItemName(target) : id;
      void markHome(id).then(() => {
        showToast({
          message: t('shop.home_toast', { name }),
          canUndo: true,
        });
      });
    },
    [items, markHome, resolveItemName, showToast, t],
  );

  const handleMarkOpen = useCallback(
    (id: string) => {
      void markOpen(id);
    },
    [markOpen],
  );

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

  const handleRemoveRecipe = useCallback(
    (recipeId: RecipeId, title: string) => {
      void removeRecipe(recipeId).then(() => {
        showToast({
          message: t('shop.recipe.removed_toast', { title }),
          canUndo: true,
        });
      });
    },
    [removeRecipe, showToast, t],
  );

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
        showToast({ message: t('shop.share.failed'), canUndo: false }, 2600);
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

        {grouped.recipeIds.length > 0 ? (
          <div
            className="edo-recipe-chips"
            data-testid="shop-recipe-chips"
          >
            {grouped.recipeIds.map((rid) => {
              const title = getRecipeText(rid, lang)?.title ?? rid;
              return (
                <button
                  key={rid}
                  type="button"
                  className="edo-recipe-chip"
                  data-testid={`shop-remove-recipe-${rid}`}
                  aria-label={t('shop.recipe.remove', { title })}
                  onClick={() => handleRemoveRecipe(rid, title)}
                >
                  <span>{title}</span>
                  <Icon name="x" size="sm" />
                </button>
              );
            })}
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
                {group.items.map((item) => {
                  const name = resolveItemName(item);
                  return (
                    <ShopRow
                      key={item.id}
                      id={item.id}
                      name={name}
                      amountText={resolveItemAmount(item)}
                      state={item.state}
                      toggleLabel={t('shop.tocart', { name })}
                      haveLabel={t('shop.have')}
                      undoLabel={t('shop.undo')}
                      onToggleCart={handleToggleCart}
                      onMarkHome={handleMarkHome}
                      onMarkOpen={handleMarkOpen}
                    />
                  );
                })}
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
                {grouped.cartItems.map((item) => {
                  const name = resolveItemName(item);
                  return (
                    <ShopRow
                      key={item.id}
                      id={item.id}
                      name={name}
                      amountText={resolveItemAmount(item)}
                      state={item.state}
                      toggleLabel={t('shop.fromcart', { name })}
                      haveLabel={t('shop.have')}
                      undoLabel={t('shop.undo')}
                      onToggleCart={handleToggleCart}
                      onMarkHome={handleMarkHome}
                      onMarkOpen={handleMarkOpen}
                    />
                  );
                })}
              </ShopGroup>
            ) : null}

            {grouped.homeItems.length > 0 ? (
              <ShopGroup
                title={t('shop.sec.home')}
                count={grouped.homeItems.length}
                testId="shop-section-home"
              >
                {grouped.homeItems.map((item) => {
                  const name = resolveItemName(item);
                  return (
                    <ShopRow
                      key={item.id}
                      id={item.id}
                      name={name}
                      amountText={resolveItemAmount(item)}
                      state={item.state}
                      toggleLabel={t('shop.tocart', { name })}
                      haveLabel={t('shop.have')}
                      undoLabel={t('shop.undo')}
                      onToggleCart={handleToggleCart}
                      onMarkHome={handleMarkHome}
                      onMarkOpen={handleMarkOpen}
                    />
                  );
                })}
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
