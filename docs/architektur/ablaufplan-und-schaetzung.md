# Ablaufplan ab 27.11.2026 und Schätzung der Agent-Tage

- **Stand:** 15.11.2026 (aktualisiert nach den Entscheiden des Projektinhabers vom 15.11.), alle Zeiten Zürich.
- **Rahmen:** Edovita hat ca. ein Drittel des Kontingents ab dem Reset am 27.11. (Start Fr 27.11., 09:00). On-Demand bleibt aus; ist das Drittel aufgebraucht, wird pausiert. Vor jedem Start Budget prüfen.
- **Grössenordnung des Drittels:** Travel Talk bekommt ca. 50 % und plant dafür ca. 7–9 Agent-Tage (S1, S2, R1–R4 laut Ablaufplan 13.11., plus V1). Ein Drittel entspricht damit grob **5–6 Agent-Tagen**. Annahme, nicht gemessen.

## Reihenfolge

| # | Wann (ca.) | Paket | Voraussetzung | Aufwand |
|---|---|---|---|---|
| – | 15.11. ✓ | **Ohne Agent (lokal):** 5 Start-Rezepte, Katalog (55 Lebensmittel, CH-NWD 7.1), Glossare de/en/pt/ja, Validierung: erledigt in `inhalte/`. Offen bis 26.11.: Werte für 14 «zu prüfen»-Lebensmittel, Probekochen, Gegenlesen JA/PT | erledigt (Entscheid 15.11.) | 0 Agent-Tage |
| E0 | Fr 27.11. | Grundgerüst mit Leitplanken, dazu `docs/architektur/` (dieser Ordner) ins Repo | Doku ins Repo: entschieden (Entwickler macht es mit E0) | 1–1,5 |
| E1 | ~30.11. | Domäne, Katalog, Rezept-Schema, Inhaltsprüfung; übernimmt `inhalte/` und portiert `validate.py` als Test | E0 | 1 |
| E2 | ~1.12. | i18n-Laufzeit und Registry | E0 | 0,5–1 |
| E3 | ~2.12. | Speicherung mit Dexie-Repositories | E0 (Dexie entschieden 15.11.) | 0,5–1 |
| E4 | ~3.12. | Rezept-Detailseite | E1, E2, E3 | 1 |
| E5 | ~4.12. | Einkaufsliste mit drei Zuständen | E1, E3 (E4) | 1 |
| E6 | ~7.12. | Zweitsprache | E2, E5 | 0,5 |
| E7 | Dez./Jan. | PWA und Offline | E0 | 0,5 |

E2 und E3 sind unabhängig und können parallel laufen. Passt das Drittel nur für 5 Tage, fallen E6/E7 in den Januar; E4 und E5 (Start-Wunsch des Projektinhabers) sind in jedem Fall drin.

## Schätzung: mit und ohne diese Vorarbeit

| Paket | Mit Vorarbeit | Ohne Vorarbeit | Warum der Unterschied |
|---|---|---|---|
| E0 Grundgerüst | 1–1,5 | 1,5–2 | Ordner, Regeln, CSP sind vorgegeben statt selbst gesucht |
| E1 Domäne/Inhalte | 1 | 2–3 | Schema fertig; Rezepte/Nährwerte werden lokal vorbereitet statt vom Agent (Recherche + Gegenprüfung wären Agent-Zeit) |
| E2 i18n | 0,5–1 | 1 | Registry und Regeln fest, Locales übernehmbar |
| E3 Speicherung | 0,5–1 | 1–1,5 | Repository-Muster aus Travel Talk (via Graphify belegt) |
| E4 Rezept-Detail | 1 | 1,5–2 | Bausteine und Akzeptanz fertig, keine Rückfragerunde zum Verhalten |
| E5 Einkaufsliste | 1 | 1,5–2 | Merge-Regeln und Zustände spezifiziert |
| E6 Zweitsprache | 0,5 | 1–1,5 | ein Katalog statt sechs Vokabulare, RTL von Anfang an |
| **Summe E0–E6** | **≈ 5,5–7** | **≈ 9,5–13** | |

**Einsparung jetzt: ca. 4–6 Agent-Tage** für denselben Umfang. Dazu kommt ein späterer Umbau, der gar nicht erst nötig wird: Travel Talk braucht für das Nachholen von Schichtregeln, Zustands-Aufteilung und generischen Sprachen 6–8 Agent-Tage (R1–R4) plus 2–2,5 (R7). Diese Zahl ist eine Schätzung auf Basis der Travel-Talk-Pläne, keine Messung.

## Graphify im Ablauf

- Ab E0 ist echter Code im Repo, Graphify indexiert jeden Commit auf `main` automatisch (Free-Plan).
- Ab E1 fragen die Agents Graphify nach Wirkungsradius und Tests (`graphify_impact`, `graphify_tests_for`), statt Dateien zu durchsuchen.
- Prototyp als `prototype/` ins Repo: vom Projektinhaber am 15.11. entschieden; gepusht als Commit `7ccbd06`, siehe `graphify-befund.md` §5.

## Pro PR (Dauerregeln)

Sicherheitsprüfung nach jeder Codeänderung mit Schweregrad und Fix-Vorschlag, `pnpm audit`, Meldung an den Projektinhaber. Merge nur nach dem Ja des Projektinhabers. Deploy nur über den Pages-Workflow nach Merge auf `main`; andere Deploys nur mit Freigabe.
