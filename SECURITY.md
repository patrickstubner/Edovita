# SECURITY.md – Edovita

Sicherheitskonzept, laufende Sicherheitsprüfungen und offene Risiken für die Edovita-App (ab Paket E0, Version `0.1.0`). Historische Prüfungen des eingefrorenen Prototyps und der Vorarbeit liegen unter `docs/architektur/SECURITY.md` und `prototype/SECURITY.md`.

## Sicherheitsmodell (Phase 1)

- **Local-first, kein Server, keine Analytics (ADR-004):** Gesundheitsdaten bleiben ausschliesslich auf dem Gerät. Kein Konto, keine Dritt-CDNs, keine Fremdschriften, keine Tracking-SDKs.
- **Strenge CSP (`public/_headers` und `rsbuild.config.ts`):**
  `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`
  Kein `'unsafe-inline'`, kein `'unsafe-eval'`.
- **XSS- & Injection-Schutz:** ESLint `react/no-danger` als Fehler, `no-eval` / `no-new-func`, automatisierte Senken-Prüfung (`pnpm run security:check`), keine Inline-Skripte oder Inline-Stile im Build-Artefakt (`dist/index.html`).
- **Eingabe- & Speicher-Validierung:** Alle externen Eingaben (QR, Export/Import, Inhalte) werden ab E1/E3/E5 per `zod` geprüft; gespeicherte Werte laufen über Whitelist-Funktionen (`coerce*()`, z. B. `coerceThemePreference()` in `src/domain/theme.ts`).
- **Supply-Chain-Härtung:**
  - **Nur `pnpm`** (`packageManager` in `package.json`, kein `npm`/`yarn`, kein `package-lock.json`).
  - **`.npmrc`:** `ignore-scripts=true` (CA-3), kein `shamefully-hoist`.
  - **4-Tage-Mindestalter neuer Paketversionen:** `minimumReleaseAge: 5760` in `pnpm-workspace.yaml` sowie `cooldown: { default-days: 4 }` in `.github/dependabot.yml`.
  - **GitHub Actions (`.github/workflows/ci.yml`):** alle Actions auf feste Commit-SHAs gepinnt, minimale Rechte (`permissions: { contents: read }`), `gitleaks 8.30.1` mit SHA-256-Prüfung.
  - **Rstest vor 1.0 (ADR-006):** `@rstest/core` und `@rstest/adapter-rsbuild` exakt auf `0.12.6` gepinnt, Updates nur bewusst im eigenen PR.
- **Öffentliches Repository:** keine Secrets, keine `.env`-Dateien, keine Personendaten.

---

## Sicherheitsprüfung Paket E0 (`feat/e0-scaffold`, 22.11.2026)

- **Basis:** `main` `40aa5b5`, App-Version `0.1.0`
- **Methode:** `pnpm run lint` (TypeScript strict, ESLint inkl. `react/no-danger`, Stylelint `csstools/use-logical`, `dependency-cruiser`), `pnpm run test:arch` (3 Negativtests für ADR-001), `pnpm test` (Rstest `0.12.6`), `pnpm run build`, `pnpm run security:check` (DOM-Senken, `public/_headers`, `dist/index.html`, `.npmrc`, `pnpm-workspace.yaml`), `pnpm audit --audit-level=moderate`, Playwright E2E (`390×844`, Hell & Dunkel, HTTP-CSP-Header + 0 `securitypolicyviolation`-Events), `gitleaks 8.30.1` (`dir` und `git`).

| # | Prüfpunkt | Befund | Schwere | Fix / Massnahme |
|---|---|---|---|---|
| 1 | Eingabevalidierung & Injection (XSS, DOM-Senken) | Kein `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write`. `localStorage["edovita.theme"]` strikt über `coerceThemePreference()`-Whitelist (Unit-Test inkl. `<script>`-Probe grün). SVG-Icons nur als interne `#i-…`-Symbolreferenzen. | kein Befund | Durch ESLint + `pnpm run security:check` in CI dauerhaft erzwungen. |
| 2 | Geheimnisse & Personendaten | `gitleaks 8.30.1` (`dir` und `git`) ohne Funde. Keine `.env`, keine Keys/Tokens, keine Personendaten oder lokalen Pfade im Code. | kein Befund | Automatischer `gitleaks`-Job in `.github/workflows/ci.yml`. |
| 3 | Berechtigungen & Zugriffskontrolle | CI-Workflow nutzt minimal `permissions: { contents: read }`; alle Actions auf feste Commit-SHAs gepinnt. Keine Server-Endpunkte, keine Auth-Fläche in E0. | kein Befund | Bei künftigen Workflows minimale Rechte beibehalten. |
| 4 | Abhängigkeiten & Lieferkette | `pnpm audit --audit-level=moderate`: 0 bekannte Schwachstellen; `pnpm peers check`: 0 Fehler; `minimumReleaseAge: 5760` aktiv; `.npmrc` mit `ignore-scripts=true`. | niedrig (beobachtet) | `@rstest/core` / `@rstest/adapter-rsbuild` sind vor 1.0 (`0.12.6` exakt gepinnt, ADR-006). Dependabot-Updates mit 4-Tage-Cooldown, jede Änderung durch Stabschef prüfen. `eslint@9.39.5` (wegen `eslint-plugin-react`-Peer-Range) bei Verfügbarkeit von ESLint-10-Support nachziehen. |
| 5 | Fehlermeldungen & Logs | Keine sensiblen Daten oder Stacktraces nach aussen. Playwright-Test bestätigt 0 Konsolenfehler. | kein Befund | Weiterhin bei jedem PR prüfen. |
| 6 | Angriffsflächen & CSP/Header | Statische App ohne Netz (`connect-src 'self'`). `dist/index.html` ohne Inline-Skripte und ohne Inline-Stile; `theme-init.js` extern. Playwright bestätigt alle HTTP-Sicherheits-Header und 0 `securitypolicyviolation`-Events. | kein Befund | Bei E7 (Service Worker) `worker-src 'self'` gezielt ergänzen, niemals Nutzerdaten cachen. |
| 7 | Offene Produkt-/Rechtsrisiken (aus Vorarbeit) | Rechtstexte (`design/brief/legal/`), medizinische Grenzwerte und 12 fehlende CH-NWD-Lebensmittelwerte sind noch offen (erst ab E1/E4/Onboarding bzw. vor Release relevant). | mittel (fachlich, nicht E0-Code) | Vor Release juristisch und medizinisch prüfen lassen (siehe `docs/architektur/SECURITY.md`). |
