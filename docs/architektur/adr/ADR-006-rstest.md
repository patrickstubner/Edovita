# ADR-006: Rstest als Testrunner

- **Status:** akzeptiert (Projektinhaber, 22.11.2026)
- **Bezug:** Entscheid des Projektinhabers vom 22.11.2026; Testplan; Paket E0

## Kontext

Edovita baut die echte App ab E0 mit Rsbuild. In den Entwürfen stand bisher Vitest (wie bei Travel Talk) für Unit- und Komponententests, dazu Testing Library, `fake-indexeddb` und Playwright für Journeys. Vitest bringt eine eigene Toolchain mit, die typischerweise auf Vite beruht. Rstest ist der Rsbuild-eigene Testrunner (aktuell 0.12.6, noch vor 1.0).

## Entscheid

Edovita nutzt **Rstest** für Unit- und Komponententests, mit `@rstest/adapter-rsbuild`, Testing Library und `fake-indexeddb`. Playwright bleibt für Journeys (Handy-Viewport 390×844, hell und dunkel). Die Version wird in E0 exakt auf 0.12.6 gepinnt (`@rstest/core` und `@rstest/adapter-rsbuild`).

**Travel Talk und die anderen Repos bleiben bei Vitest.** Dieser Entscheid gilt nur für Edovita.

## Gründe

- Eine Build-Kette mit Rsbuild: Konfiguration und Auflösung bleiben dieselben wie im App-Build.
- Kein Vite nur für Tests.
- Weniger Abhängigkeiten im Grundgerüst.

## Risiken

- Rstest ist noch vor 1.0. Die API und das Verhalten können sich ändern.
- In 0.11 gab es Breaking Changes. Weitere Sprünge vor 1.0 sind möglich.

## Massnahmen

- Version exakt pinnen, keine Bereichsangabe (`^`/`~`).
- Die 4-Tage-Regel gilt (`minimumReleaseAge: 5760` in `pnpm-workspace.yaml`, ab E0). 0.12.6 ist seit dem 3.11.2026 veröffentlicht und erfüllt die Regel heute.
- Updates bewusst und in einem eigenen PR, nicht stillschweigend. Bei einem Major-Sprung oder einem Bruch vor 1.0 entscheidet der Projektinhaber.

## Rückweg

Falls Rstest in der Praxis blockiert, ist der Wechsel zu Vitest der vorgesehene Rückweg. Die API ist weitgehend identisch; die offizielle Anleitung steht unter https://rstest.rs/guide/migration/vitest. Playwright, Testing Library und `fake-indexeddb` bleiben in beiden Fällen.

## Folgen

- E0 setzt Rstest um (CI: `pnpm test`). In E1 wird `validate.py` als Rstest-Test nachgebaut.
- `AGENTS.md`, Testplan und Issue-Entwürfe beschreiben Rstest, nicht Vitest.
