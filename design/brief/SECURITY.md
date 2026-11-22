# SECURITY.md – Edovita Prep-Skripte (Box)

**Datum:** 2026-11-06 (Europe/Zurich)
**Scope:** `design/brief/scripts/*.py` und erzeugte Artefakte unter `design/brief/` + `design/logos/export/`.
**Nicht im Scope:** GitHub-Repo dieses Repo, kein Cloud Agent, kein Deploy.

## Methode
- Manuelle Review + Regex-Scan (eval/exec/shell/Secrets/Netzwerk)
- AST-Parse der Python-Skripte
- Keine Laufzeit-Abhängigkeiten neu installiert; Nutzung bestehender `Pillow`, `cairosvg`
- Quicksand OFL einmalig per HTTPS von GitHub raw geholt (öffentliche Lizenzdatei); nicht Teil der dauerhaften Skripte

## Geprüfte Dateien

| Datei | SHA-256 | Zeilen | Flags |
|---|---|---|---|
| `design/brief/scripts/build_sounds_manifest.py` | `7f75ed9245461503995c9a8447fc2e1ffc6b7e8de6e7e7c56397bf86bf29d42e` | 278 | none |
| `design/brief/scripts/export_icons.py` | `e2be789f0448adb0ea0ae8e329e5e92319a631ac6373c7409b9186155e0e9bd7` | 263 | none |

## Ergebnis

**Keine kritischen, hohen oder mittleren Befunde.**

- Skripte lesen/schreiben nur feste Pfade unter `design/` (keine Nutzer-URL-Eingabe).
- Keine Secrets, keine Auth, kein Netzwerk in den persistenten Prep-Skripten.
- Icon-Export: Bildverarbeitung lokal (cairosvg/Pillow); keine Uploads.
- Sound-Manifest: nur Verzeichnislisting + CSV-Schreiben.
- Legal/Store/Cloudflare: reine Markdown/JSON-Artefakte.

## Hinweise (niedrig)

1. `export_icons.py` erzeugt viele PNG-Dateien – Speicherplatz auf der Box; kein Sicherheitsrisiko.
2. Adaptive-Foreground enthält aktuell das volle Appicon (inkl. Verlauf) in der Safe-Zone, nicht ein reines Transparent-Motif ohne Hintergrund. Für finales Android-Adaptive ggf. motif-only SVG nachziehen (Produktqualität, nicht Sicherheit).
3. String-Inventar enthält Prototyp-Copy; medizinische Texte vor Release reviewen (Produkt-/Haftung, siehe Prototyp-SECURITY).

## Abhängigkeiten

- Pillow (System/venv vorhanden), cairosvg – nur Offline-Rendering.
- Kein `npm`/`pip install` in diesem Prep-Lauf für die Skripte nötig gewesen (cairosvg/Pillow bereits nutzbar).
- `npm audit` / `pip-audit` nicht erneut voll gefahren; bei künftigen Dependency-Updates nachziehen.

