# SECURITY.md – Edovita

Sicherheitskonzept, laufende Sicherheitsprüfungen und offene Risiken für die Edovita-App (ab Paket E0, Version `0.1.0`). Historische Prüfungen des eingefrorenen Prototyps und der Vorarbeit liegen unter `docs/architektur/SECURITY.md` und `prototype/SECURITY.md`.

## Sicherheitsmodell (Phase 1)

- **Local-first, kein Server, keine Analytics (ADR-004):** Gesundheitsdaten bleiben ausschliesslich auf dem Gerät. Kein Konto, keine Dritt-CDNs, keine Fremdschriften, keine Tracking-SDKs.
- **Strenge CSP & Sicherheits-Header (Single Source of Truth in `public/_headers`, von `rsbuild.config.ts` geladen):**
  `Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`
  Zusätzlich: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow, noarchive`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`. Kein `'unsafe-inline'`, kein `'unsafe-eval'`.
- **GitHub Pages und `_headers` (bekannte Grenze):** GitHub Pages wertet `public/_headers` nicht aus und setzt auch keine eigenen `Content-Security-Policy`- oder `X-Frame-Options`-Header. Deshalb setzt `rsbuild.config.ts` dieselbe CSP zusätzlich als `<meta http-equiv="Content-Security-Policy">` ins HTML (aus dem `/*`-Block von `_headers` abgeleitet, ohne Duplikat). **`frame-ancestors` und `X-Frame-Options` lassen sich per Meta-Tag nicht setzen** (HTML-/CSP-Standard); ein Meta-Tag ersetzt diese Direktiven nicht. Clickjacking-Schutz über `frame-ancestors`/`X-Frame-Options` gilt deshalb auf GitHub Pages nicht, sondern nur dort, wo HTTP-Header ankommen (lokaler Preview-Server, spätere eigene Herkunft z. B. Cloudflare). `frame-ancestors` wird im Meta-Tag bewusst weggelassen. `noindex` bleibt über das HTML-Meta `robots` gesetzt. Die HTTP-Header in `_headers` bleiben für Preview und künftige Hosts die massgebliche Quelle.
- **XSS- & Injection-Schutz:** ESLint `react/no-danger` als Fehler, `no-eval` / `no-new-func`, automatisierte Senken-Prüfung (`pnpm run security:check`), keine Inline-Skripte oder Inline-Stile im Build-Artefakt (`dist/index.html`).
- **Eingabe- & Speicher-Validierung:** Alle externen Eingaben (QR, Export/Import, Inhalte) werden ab E1/E3/E5 per `zod` geprüft; gespeicherte Werte laufen über Whitelist-Funktionen (`coerce*()`, z. B. `coerceThemePreference()` in `src/domain/theme.ts`).
- **Supply-Chain-Härtung:**
  - **Nur `pnpm`** (`packageManager` in `package.json`, kein `npm`/`yarn`, kein `package-lock.json`).
  - **`.npmrc`:** `ignore-scripts=true` (CA-3), kein `shamefully-hoist`; in CI zusätzlich explizit `pnpm install --frozen-lockfile --ignore-scripts`.
  - **4-Tage-Mindestalter neuer Paketversionen:** `minimumReleaseAge: 5760` in `pnpm-workspace.yaml` sowie `cooldown: { default-days: 4 }` in `.github/dependabot.yml`.
  - **GitHub Actions (`.github/workflows/ci.yml` und `deploy-pages.yml`):** alle Actions auf feste Commit-SHAs gepinnt (`pnpm/action-setup` `v6.1.1`, Pages-Actions `configure-pages` `v6.0.0`, `upload-pages-artifact` `v5.0.0`, `deploy-pages` `v5.0.1`), minimale Rechte (CI: `contents: read`; Pages: Schreibrechte `pages: write` und `id-token: write` nur im Deploy-Job), mit `actionlint` geprüft, `gitleaks 8.30.1` mit SHA-256-Prüfung. Deploy nur nach grüner CI auf `main` (`workflow_run` auf den Workflow «CI») oder per `workflow_dispatch` ausschliesslich auf `main`.
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

---

## Sicherheitsprüfung Paket E0b (`feat/e0b-github-pages`, 22.11.2026)

- **Geprüfter Code-Stand (Commit-SHA):** `1891b0f18ea31bf4e22ec92b538e86306fc8744a` (Branch `feat/e0b-github-pages`, Basis `main` `7f49e3d`, nach Squash-Merge auf `main` `e7d46884e98c61619ec85702133670ec32aca4a3`, App-Version `0.1.0`, Issue `#21`, PR #22).
- **Methode:** Lesen der Änderungen, `pnpm run lint`, `pnpm run test:arch`, `pnpm test` (10/10), `pnpm run build`, `pnpm run security:check`, Pages-Build (`GITHUB_PAGES=true PAGES_DIST=dist-pages`) plus `security:check` auf `dist-pages`, `pnpm audit --audit-level=high` (0 Funde), Playwright E2E (2/2), lokale Preview unter `/Edovita/` (alle Assets HTTP 200, Hash-Route `#/status`, 0 Konsolenfehler), `gitleaks 8.30.1 dir` (0 Funde), `actionlint 1.7.12` (0 Funde). Skill `sicherheitspr-fung-nach-code-nderung`.
- **Keine neuen Pakete.** 4-Tage-Regel unverändert. Pages ist für öffentliche Repositories kostenlos.

| # | Prüfpunkt | Befund | Schwere | Fix / Massnahme |
|---|---|---|---|---|
| 1 | Eingabevalidierung & Injection (XSS, DOM-Senken) | Unverändert keine verbotenen Senken. CSP-Meta wird aus `public/_headers` erzeugt, nicht fest kodiert; ohne `unsafe-inline`/`unsafe-eval`. Asset-Pfade laufen über `publicUrl()` bzw. `publicBase`. | kein Befund | `pnpm run security:check` prüft Meta-CSP und Pages-Prefix in CI. |
| 2 | Geheimnisse & Personendaten | Keine neuen Secrets, keine `.env`, keine Personendaten. `gitleaks` auf dem Diff bzw. Working Tree. | kein Befund | Weiterhin in CI. |
| 3 | Berechtigungen & Zugriffskontrolle | Neuer Workflow `deploy-pages.yml`: Deploy erst nach grüner CI (`workflow_run`) bzw. `workflow_dispatch` nur auf `main`. Schreibrechte `pages: write` und `id-token: write` nur im Deploy-Job; Build-Job nur `contents: read`. Actions SHA-gepinnt (älter als 4 Tage). Environment `github-pages` auf Branch `main` beschränkt. OIDC für Pages, keine Repo-Secrets. | kein Befund | Environment-Schutz und SHA-Pinning beibehalten. |
| 4 | Abhängigkeiten & Lieferkette | Keine neuen npm-Pakete. Pages-Actions: `configure-pages` `v6.0.0` (25.03.2026), `upload-pages-artifact` `v5.0.0` (10.04.2026), `deploy-pages` `v5.0.1` (01.09.2026), alle älter als 4 Tage. `pnpm audit --audit-level=high`: 0 bekannte Schwachstellen. | kein Befund | Dependabot deckt `github-actions` mit 4-Tage-Cooldown bereits ab. |
| 5 | Fehlermeldungen & Logs | Keine neuen nach aussen sichtbaren Fehlerpfade. | kein Befund | Weiterhin bei jedem PR prüfen. |
| 6 | Angriffsflächen & CSP/Header | GitHub Pages ignoriert `_headers`. Ausgleich: CSP-Meta (ohne `frame-ancestors`). HTTP-Header `X-Frame-Options`, `Permissions-Policy`, `COOP` und `X-Robots-Tag` kommen auf Pages nicht an. `robots`-Meta bleibt. Öffentliche Vorschau zeigt nur Platzhalter, keine Nutzerdaten (local-first). | niedrig | Bekannte Grenze von GitHub Pages: `frame-ancestors` und `X-Frame-Options` wirken dort nicht (weder über `_headers` noch per Meta-Tag). Für eine spätere eigene Herkunft (z. B. Cloudflare) `_headers` beibehalten. Vor Release `noindex` prüfen, falls Indexierung erwünscht ist. |
| 7 | Offene Produkt-/Rechtsrisiken (aus Vorarbeit) | Unverändert: Rechtstexte, medizinische Grenzwerte, fehlende Nährwerte (nicht E0b-Code). | mittel (fachlich, nicht E0b-Code) | Vor Release juristisch und medizinisch prüfen lassen. |

---

## Sicherheitsprüfung Folge-PR Stabschef-Hinweise #15/#22 (`fix/stabschef-e0-e0b`, 22.11.2026)

- **Geprüfter Code-Stand (Commit-SHA):** `PENDING_HEAD_SHA` (Basis `main` `e7d46884e98c61619ec85702133670ec32aca4a3`, App-Version `0.1.0`).
- **Methode:** Skill `sicherheitspr-fung-nach-code-nderung`. Lesen der Änderungen; `pnpm run lint` grün; `test:arch` 3/3; `pnpm test` 13/13 (Rstest 0.12.6); `content:check` OK; `pnpm run build` OK; `security:check` OK (auch auf `dist-pages` mit Prefix `/Edovita/`); `pnpm audit --audit-level=high` 0 Funde; Playwright E2E 2/2 (390×844 Hell/Dunkel); `gitleaks 8.30.1` (`dir` und `git` über `origin/main..HEAD`) 0 Funde; `actionlint 1.7.12` auf beide Workflows 0 Funde.
- **Keine neuen Pakete.** 4-Tage-Regel (`minimumReleaseAge: 5760`) unverändert, keine Ausnahme.

| # | Prüfpunkt | Befund | Schwere | Fix / Massnahme |
|---|---|---|---|---|
| 1 | Eingabevalidierung & Injection (XSS, DOM-Senken) | Texte kommen aus `content/locales/de/ui.json` über `src/i18n` (`t()`), werden als Textknoten gerendert, nicht als HTML. Keine neuen Senken. `_headers`-Parser liest nur den `/*`-Block, Pfad über `import.meta.dirname`. | kein Befund | Weiterhin `pnpm run security:check` und ADR-001 (Pages importieren nicht direkt `content/`). |
| 2 | Geheimnisse & Personendaten | Keine neuen Secrets, keine `.env`, keine Personendaten. `gitleaks` auf Diff und Arbeitsbaum. | kein Befund | Weiterhin in CI. |
| 3 | Berechtigungen & Zugriffskontrolle | `deploy-pages.yml` startet nicht mehr direkt bei `push` auf `main`, sondern nach erfolgreicher CI (`workflow_run`, `conclusion == success`) und checkt den geprüften `head_sha`. `workflow_dispatch` nur, wenn `github.ref == refs/heads/main`. Schreibrechte unverändert nur im Deploy-Job. Actions weiterhin SHA-gepinnt. | kein Befund | Environment `github-pages` bleibt auf Branch `main` beschränkt. |
| 4 | Abhängigkeiten & Lieferkette | Keine neuen npm-Pakete, Lockfile unverändert. `pnpm audit --audit-level=high`: siehe Prüfprotokoll in `STATUS.md`. | kein Befund | 4-Tage-Regel und Dependabot-Cooldown unverändert. |
| 5 | Fehlermeldungen & Logs | Keine neuen nach aussen sichtbaren Fehlerpfade. | kein Befund | Weiterhin bei jedem PR prüfen. |
| 6 | Angriffsflächen & CSP/Header | Bekannte Grenze von GitHub Pages festgehalten: `frame-ancestors` und `X-Frame-Options` lassen sich per Meta-Tag nicht setzen und kommen auf Pages nicht als HTTP-Header an. Parser ignoriert fremde `_headers`-Blöcke. | niedrig (bekannt, dokumentiert) | `_headers` für Preview und künftige eigene Herkunft beibehalten. |
| 7 | Offene Produkt-/Rechtsrisiken | Unverändert fachlich offen. `#/status` und Dev-/Platzhaltertexte bleiben bis vor Release (nur in `STATUS.md` vermerkt, nicht entfernt). | mittel (fachlich, nicht dieser PR-Code) | Vor Release juristisch/medizinisch prüfen und Dev-Route/Platzhalter entfernen. |
