# SECURITY.md – Edovita

Sicherheitskonzept, laufende Sicherheitsprüfungen und offene Risiken für die Edovita-App (ab Paket E0, Version `0.1.0`). Historische Prüfungen des eingefrorenen Prototyps und der Vorarbeit liegen unter `docs/architektur/SECURITY.md` und `prototype/SECURITY.md`.

## Sicherheitsmodell (Phase 1)

- **Local-first, kein Server, keine Analytics (ADR-004):** Gesundheitsdaten bleiben ausschliesslich auf dem Gerät. Kein Konto, keine Dritt-CDNs, keine Fremdschriften, keine Tracking-SDKs.
- **Strenge CSP & Sicherheits-Header (Single Source of Truth in `public/_headers`, von `rsbuild.config.ts` geladen):**
  `Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`
  Zusätzlich: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow, noarchive`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`. Kein `'unsafe-inline'`, kein `'unsafe-eval'`.
- **XSS- & Injection-Schutz:** ESLint `react/no-danger` als Fehler, `no-eval` / `no-new-func`, automatisierte Senken-Prüfung (`pnpm run security:check`), keine Inline-Skripte oder Inline-Stile im Build-Artefakt (`dist/index.html`).
- **Eingabe- & Speicher-Validierung:** Alle externen Eingaben (QR, Export/Import, Inhalte) werden ab E1/E3/E5 per `zod` geprüft; gespeicherte Werte laufen über Whitelist-Funktionen (`coerce*()`, z. B. `coerceThemePreference()` in `src/domain/theme.ts`).
- **Supply-Chain-Härtung:**
  - **Nur `pnpm`** (`packageManager` in `package.json`, kein `npm`/`yarn`, kein `package-lock.json`).
  - **`.npmrc`:** `ignore-scripts=true` (CA-3), kein `shamefully-hoist`; in CI zusätzlich explizit `pnpm install --frozen-lockfile --ignore-scripts`.
  - **4-Tage-Mindestalter neuer Paketversionen:** `minimumReleaseAge: 5760` in `pnpm-workspace.yaml` sowie `cooldown: { default-days: 4 }` in `.github/dependabot.yml`.
  - **GitHub Actions (`.github/workflows/ci.yml`):** alle Actions auf feste Commit-SHAs gepinnt (`pnpm/action-setup` `v6.1.1`), minimale Rechte (`permissions: { contents: read }`), mit `actionlint 1.7.12` geprüft, `gitleaks 8.30.1` mit SHA-256-Prüfung.
  - **Rstest vor 1.0 (ADR-006):** `@rstest/core` und `@rstest/adapter-rsbuild` exakt auf `0.12.6` gepinnt, Updates nur bewusst im eigenen PR.
- **Öffentliches Repository:** keine Secrets, keine `.env`-Dateien, keine Personendaten.

---

## Sicherheitsprüfung Paket E0 (`feat/e0-scaffold`, 22.11.2026)

- **Geprüfter Code-Stand (Commit-SHA):** `9e45e9e9688d33e781d03d3b8e722b0af55f68d6` (Basis `main` `40aa5b5`, App-Version `0.1.0`)
- **GitHub Actions CI (belegt auf `9e45e9e`):** Run `45042950181` – `Lint, Tests, Build & Audit` grün (45 s) und `Secret Scan (gitleaks)` grün (8 s).
- **Methode:** `actionlint 1.7.12`, `pnpm run lint` (TypeScript strict, ESLint inkl. `react/no-danger`, Stylelint `csstools/use-logical`, `dependency-cruiser`), `pnpm run test:arch` (3 Negativtests für ADR-001), `pnpm test` (Rstest `0.12.6`), `pnpm run build`, `pnpm run security:check` (DOM-Senken, Single-Source-CSP in `public/_headers` + `rsbuild.config.ts`, `X-Robots-Tag`, `dist/index.html`, `.npmrc`, `pnpm-workspace.yaml`), `pnpm audit --audit-level=moderate`, Playwright E2E (`390×844`, Hell & Dunkel, HTTP-CSP- & `X-Robots-Tag`-Header + 0 `securitypolicyviolation`-Events), `gitleaks 8.30.1` lokal (`dir` und `git`) sowie in GitHub Actions CI.

| # | Prüfpunkt | Befund | Schwere | Fix / Massnahme |
|---|---|---|---|---|
| 1 | Eingabevalidierung & Injection (XSS, DOM-Senken) | Kein `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write`. `localStorage["edovita.theme"]` strikt über `coerceThemePreference()`-Whitelist (Unit-Test inkl. `<script>`-Probe grün). SVG-Icons nur als interne `#i-…`-Symbolreferenzen. | kein Befund | Durch ESLint + `pnpm run security:check` in CI dauerhaft erzwungen. |
| 2 | Geheimnisse & Personendaten | `gitleaks 8.30.1` lokal (`dir` & `git`) und auf GitHub Actions (Run `45042950181`, Job `Secret Scan (gitleaks)`) ohne Funde. Keine `.env`, keine Keys/Tokens, keine Personendaten oder lokalen Pfade im Code. | kein Befund | Läuft ab diesem PR bei jedem Push/PR automatisch in `.github/workflows/ci.yml`. |
| 3 | Berechtigungen & Zugriffskontrolle | CI-Workflow nutzt minimal `permissions: { contents: read }`; alle Actions auf feste Commit-SHAs gepinnt (`pnpm/action-setup` `v6.1.1`), `actionlint 1.7.12` ohne Funde. Keine Server-Endpunkte, keine Auth-Fläche in E0. | kein Befund | Bei künftigen Workflows minimale Rechte, SHA-Pinning und `actionlint` beibehalten. |
| 4 | Abhängigkeiten & Lieferkette | `pnpm audit --audit-level=moderate`: 0 bekannte Schwachstellen; `pnpm peers check`: 0 Fehler; `minimumReleaseAge: 5760` aktiv; `.npmrc` mit `ignore-scripts=true` + CI `--ignore-scripts`. | niedrig (beobachtet) | `@rstest/core` / `@rstest/adapter-rsbuild` sind vor 1.0 (`0.12.6` exakt gepinnt, ADR-006). Dependabot-Updates mit 4-Tage-Cooldown, jede Änderung durch Stabschef prüfen. `eslint@9.39.5` (wegen `eslint-plugin-react`-Peer-Range) bei Verfügbarkeit von ESLint-10-Support nachziehen. |
| 5 | Fehlermeldungen & Logs | Keine sensiblen Daten oder Stacktraces nach aussen. Playwright-Test bestätigt 0 Konsolenfehler. | kein Befund | Weiterhin bei jedem PR prüfen. |
| 6 | Angriffsflächen & CSP/Header | Statische App ohne Netz (`connect-src 'self'`). `rsbuild.config.ts` liest alle Header direkt aus `public/_headers` (Single Source of Truth, inkl. `X-Robots-Tag: noindex, nofollow, noarchive`); `dist/index.html` ohne Inline-Skripte und ohne Inline-Stile; `theme-init.js` extern. Playwright bestätigt alle HTTP-Sicherheits-Header und 0 `securitypolicyviolation`-Events. | kein Befund | Bei E7 (Service Worker) `worker-src 'self'` gezielt ergänzen, niemals Nutzerdaten cachen. |
| 7 | Offene Produkt-/Rechtsrisiken (aus Vorarbeit) | Rechtstexte (`design/brief/legal/`), medizinische Grenzwerte und 12 fehlende CH-NWD-Lebensmittelwerte sind noch offen (erst ab E1/E4/Onboarding bzw. vor Release relevant). | mittel (fachlich, nicht E0-Code) | Vor Release juristisch und medizinisch prüfen lassen (siehe `docs/architektur/SECURITY.md`). |
