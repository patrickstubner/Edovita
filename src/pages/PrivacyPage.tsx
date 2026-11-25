import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { foodName } from '../catalog/index.ts';
import { DataImportSheet, Icon, Screen, Toast } from '../components/index.ts';
import {
  PLAN_EXPORT_FILENAME,
  PLAN_EXPORT_MAX_BYTES,
  type ParsedPlanExportBundle,
} from '../domain/index.ts';
import { useI18n, usePlan } from '../hooks/index.ts';

const MAX_PREVIEW_SHOP_ITEMS = 8;

/**
 * Datenschutz-Seite (`#/profil/datenschutz`, E10 / Issue #35, Prototyp v5.10.1):
 * Bietet Export und Import von `edovita-plan-einkauf.json` (ohne Körper- oder Gesundheitsdaten)
 * mit vollständiger Vorab-Validierung, Bestätigungs-Sheet und transaktionalem Dexie-Import (F1b).
 */
export function PrivacyPage() {
  const { lang, t } = useI18n();
  const { exportTransferBundle, parseTransferFile, applyTransferBundle } =
    usePlan();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pendingImport, setPendingImport] =
    useState<ParsedPlanExportBundle | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMsg(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 3200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const handleExport = useCallback(() => {
    try {
      const bundle = exportTransferBundle();
      const json = JSON.stringify(bundle, null, 2);
      if (json.length > PLAN_EXPORT_MAX_BYTES) {
        showToast(t('datenschutz.export.fail'));
        return;
      }
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = PLAN_EXPORT_FILENAME;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      showToast(t('datenschutz.export.done'));
    } catch {
      showToast(t('datenschutz.export.fail'));
    }
  }, [exportTransferBundle, showToast, t]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      input.value = '';
      if (!file) {
        return;
      }
      if (file.size > PLAN_EXPORT_MAX_BYTES) {
        showToast(t('datenschutz.import.bad'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const parsed = parseTransferFile(text);
        if (!parsed.ok) {
          showToast(t('datenschutz.import.bad'));
          return;
        }
        setPendingImport(parsed.value);
      };
      reader.onerror = () => {
        showToast(t('datenschutz.import.bad'));
      };
      try {
        reader.readAsText(file);
      } catch {
        showToast(t('datenschutz.import.bad'));
      }
    },
    [parseTransferFile, showToast, t],
  );

  const handleConfirmImport = useCallback(() => {
    const bundle = pendingImport;
    setPendingImport(null);
    if (!bundle) {
      return;
    }
    void applyTransferBundle(bundle).then((res) => {
      showToast(
        res.ok ? t('datenschutz.import.ok') : t('datenschutz.import.bad'),
      );
    });
  }, [applyTransferBundle, pendingImport, showToast, t]);

  const planPreview = pendingImport?.plan
    ? t('datenschutz.import.preview.plan', {
        n: pendingImport.plan.items.length,
        d: pendingImport.plan.days,
      })
    : null;

  const shopPreview = pendingImport?.shopItems
    ? t('datenschutz.import.preview.shop', {
        n: pendingImport.shopItems.length,
      })
    : null;

  const previewShopNames = (pendingImport?.shopItems ?? [])
    .slice(0, MAX_PREVIEW_SHOP_ITEMS)
    .map((it) => foodName(it.id, lang) ?? it.id);

  const hasMoreShopItems =
    (pendingImport?.shopItems?.length ?? 0) > MAX_PREVIEW_SHOP_ITEMS;

  return (
    <Screen
      header={
        <div className="edo-row">
          <button
            type="button"
            className="edo-back-btn"
            aria-label={t('status.back')}
            onClick={() => navigate('/profil')}
          >
            <Icon name="left" />
          </button>
          <h1>{t('datenschutz.datenschutz')}</h1>
        </div>
      }
    >
      <div className="edo-stack">
        <section
          className="edo-card edo-card-mint edo-stack"
          aria-labelledby="privacy-local-heading"
        >
          <div className="edo-row">
            <Icon name="shield" />
            <h2 id="privacy-local-heading">{t('datenschutz.heading')}</h2>
          </div>
          <p className="edo-sub">{t('datenschutz.kein_konto')}</p>
          <p className="edo-sub">{t('datenschutz.gehoeren_dir')}</p>
        </section>

        <div className="edo-stack edo-stack-sm">
          <h2 className="edo-section-heading" id="privacy-data-heading">
            {t('datenschutz.deine_daten')}
          </h2>
          <section
            className="edo-card"
            aria-labelledby="privacy-data-heading"
          >
            <button
              id="dataExport"
              type="button"
              className="edo-set edo-langrow"
              data-testid="data-export-btn"
              onClick={handleExport}
            >
              <span className="edo-circ" aria-hidden="true">
                <Icon name="download" />
              </span>
              <span className="edo-set-tx edo-grow">
                <b>{t('datenschutz.daten_exportieren')}</b>
                <small>{t('datenschutz.als_datei_z_b')}</small>
              </span>
            </button>

            <button
              id="dataImport"
              type="button"
              className="edo-set edo-langrow"
              data-testid="data-import-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="edo-circ" aria-hidden="true">
                <Icon name="file" />
              </span>
              <span className="edo-set-tx edo-grow">
                <b>{t('datenschutz.daten_importieren')}</b>
                <small>{t('datenschutz.import.sub')}</small>
              </span>
            </button>

            <input
              ref={fileInputRef}
              id="dataImportFile"
              type="file"
              accept="application/json,.json"
              hidden
              data-testid="data-import-file"
              onChange={handleFileChange}
            />
          </section>
        </div>
      </div>

      <DataImportSheet
        open={pendingImport !== null}
        title={t('datenschutz.import.confirm')}
        closeLabel={t('dialog.close')}
        planPreview={planPreview}
        shopPreview={shopPreview}
        shopItemNames={previewShopNames}
        hasMoreShopItems={hasMoreShopItems}
        cancelLabel={t('datenschutz.import.cancel')}
        applyLabel={t('datenschutz.import.apply')}
        onCancel={() => setPendingImport(null)}
        onApply={handleConfirmImport}
      />

      <Toast message={toastMsg} />
    </Screen>
  );
}
