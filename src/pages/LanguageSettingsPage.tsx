import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Icon,
  LangFlag,
  Screen,
  Toast,
  type SecondLangOptionValue,
} from '../components/index.ts';
import { useI18n, useSecondLang } from '../hooks/index.ts';

/**
 * Ausführliche Sprachliste unter `#/profil/sprache` (Prototyp v5.5–v5.10):
 * Zeigt Gerätesprachen-Erkennung, freigegebene UI-Sprachen, ausgegraute Sprachen
 * («In Prüfung», Rechts-Gate ADR-003) sowie den Abschnitt «Zweitsprache»
 * (Automatisch nach Ort, Keine, oder manuelle Wahl ohne Rechts-Gate).
 */
export function LanguageSettingsPage() {
  const {
    lang,
    locale,
    detected,
    uiLanguages,
    isApproved,
    metaFor,
    setLang,
    t,
  } = useI18n();
  const {
    setting: secondSetting,
    autoCode: secondAutoCode,
    isAuto: secondIsAuto,
    secondaryLanguages,
    metaFor: secondMetaFor,
    setSecondLang,
  } = useSecondLang();
  const navigate = useNavigate();

  const [sameToast, setSameToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const handleSelectSecond = useCallback(
    (value: SecondLangOptionValue) => {
      const outcome = setSecondLang(value);
      if (outcome === 'same') {
        if (toastTimerRef.current !== null) {
          clearTimeout(toastTimerRef.current);
        }
        setSameToast(t('second.same'));
        toastTimerRef.current = setTimeout(() => {
          setSameToast(null);
          toastTimerRef.current = null;
        }, 3200);
      }
    },
    [setSecondLang, t],
  );

  const detectedMeta = metaFor(detected.code);
  const approvedLangs = uiLanguages.filter((code) => isApproved(code));
  const pendingLangs = uiLanguages.filter((code) => !isApproved(code));
  const selectableSecondary = secondaryLanguages.filter(
    (code) => code !== lang,
  );
  const autoLabel = secondAutoCode
    ? t('second.auto.current', { code: secondAutoCode.toUpperCase() })
    : t('second.auto.none');

  return (
    <Screen
      header={
        <div className="edo-row">
          <button
            type="button"
            className="edo-back-btn"
            aria-label={t('status.back')}
            onClick={() => navigate('/')}
          >
            <Icon name="left" />
          </button>
          <h1>{t('lang.heading')}</h1>
        </div>
      }
      actions={
        <button
          type="button"
          className="edo-btn edo-btn-secondary"
          onClick={() => navigate('/')}
        >
          <Icon name="home" size="sm" />
          <span>{t('status.back_home')}</span>
        </button>
      }
      actionsLabel={t('profil.sprache.actions_label')}
    >
      <div className="edo-stack">
        <div className="edo-banner" data-testid="lang-detect-banner">
          <Icon name="globe" />
          <span className="edo-grow">
            <b>
              {t('lang.detected', {
                name: detectedMeta?.name ?? detected.code,
              })}
            </b>
            <span>
              {t(detected.matched ? 'lang.detected.x' : 'lang.fallback.x', {
                device: detected.device || '–',
              })}
            </span>
          </span>
        </div>

        <section
          className="edo-card"
          aria-label={t('lang.heading')}
          data-testid="lang-list"
        >
          {approvedLangs.map((code) => {
            const m = metaFor(code);
            const isCurrent = code === lang;
            const statusText = m?.reviewed ? t('lang.source') : t('lang.draft');
            return (
              <button
                key={code}
                type="button"
                className={
                  isCurrent
                    ? 'edo-set edo-langrow edo-langrow-cur'
                    : 'edo-set edo-langrow'
                }
                data-lang={code}
                aria-pressed={isCurrent}
                lang={m?.locale ?? code}
                onClick={() => setLang(code)}
              >
                <span className="edo-circ edo-circ-code">
                  {code.toUpperCase()}
                </span>
                <span className="edo-set-tx edo-grow">
                  <b>{m?.name ?? code}</b>
                  <small lang={locale}>
                    {m?.englishName
                      ? `${m.englishName} · ${statusText}`
                      : statusText}
                  </small>
                </span>
                <span
                  className={
                    isCurrent ? 'edo-radio edo-radio-on' : 'edo-radio'
                  }
                  aria-hidden="true"
                />
              </button>
            );
          })}

          {pendingLangs.map((code) => {
            const m = metaFor(code);
            return (
              <div
                key={code}
                className="edo-set edo-langrow edo-langrow-dis"
                data-lang-pending={code}
                aria-disabled="true"
              >
                <span className="edo-circ edo-circ-code">
                  {code.toUpperCase()}
                </span>
                <span className="edo-set-tx edo-grow">
                  <b lang={m?.locale ?? code}>{m?.name ?? code}</b>
                  <small>{t('lang.reason.review')}</small>
                </span>
                <Icon name="lock" size="sm" />
              </div>
            );
          })}
        </section>

        <div className="edo-stack">
          <h2 className="edo-section-heading" id="second-lang-heading">
            {t('second.label')}
          </h2>
          <p className="edo-cap">{t('second.hint')}</p>
          <section
            className="edo-card"
            aria-labelledby="second-lang-heading"
            data-testid="second-lang-list"
          >
            <button
              type="button"
              className={
                secondIsAuto
                  ? 'edo-set edo-langrow edo-langrow-cur'
                  : 'edo-set edo-langrow'
              }
              data-second="auto"
              aria-pressed={secondIsAuto}
              lang={
                secondAutoCode
                  ? (secondMetaFor(secondAutoCode)?.locale ?? secondAutoCode)
                  : undefined
              }
              onClick={() => handleSelectSecond('auto')}
            >
              <span className="edo-circ edo-circ-code">
                {secondAutoCode ? <LangFlag code={secondAutoCode} /> : '–'}
              </span>
              <span className="edo-set-tx edo-grow">
                <b>{autoLabel}</b>
              </span>
              <span
                className={
                  secondIsAuto ? 'edo-radio edo-radio-on' : 'edo-radio'
                }
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              className={
                secondSetting === 'none'
                  ? 'edo-set edo-langrow edo-langrow-cur'
                  : 'edo-set edo-langrow'
              }
              data-second="none"
              aria-pressed={secondSetting === 'none'}
              onClick={() => handleSelectSecond('none')}
            >
              <span className="edo-circ edo-circ-code">–</span>
              <span className="edo-set-tx edo-grow">
                <b>{t('second.none')}</b>
              </span>
              <span
                className={
                  secondSetting === 'none'
                    ? 'edo-radio edo-radio-on'
                    : 'edo-radio'
                }
                aria-hidden="true"
              />
            </button>

            {selectableSecondary.map((code) => {
              const m = secondMetaFor(code);
              const isSelected = secondSetting === code;
              return (
                <button
                  key={code}
                  type="button"
                  className={
                    isSelected
                      ? 'edo-set edo-langrow edo-langrow-cur'
                      : 'edo-set edo-langrow'
                  }
                  data-second={code}
                  aria-pressed={isSelected}
                  lang={m?.locale ?? code}
                  onClick={() => handleSelectSecond(code)}
                >
                  <span className="edo-circ edo-circ-code">
                    <LangFlag code={code} />
                  </span>
                  <span className="edo-set-tx edo-grow">
                    <b>{m?.name ?? code}</b>
                  </span>
                  <span
                    className={
                      isSelected ? 'edo-radio edo-radio-on' : 'edo-radio'
                    }
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </section>
        </div>

        <p className="edo-cap edo-row edo-row-top">
          <Icon name="spark" size="sm" />
          <span className="edo-grow">{t('start.du_kannst_die_sprache')}</span>
        </p>

        <p className="edo-cap">{t('lang.greyed_hint')}</p>
      </div>
      <Toast message={sameToast} />
    </Screen>
  );
}
