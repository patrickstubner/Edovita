# Edovita Icon-Export (M2)

Quelle: `logos/final/edovita_appicon.svg` + `.png` (1024×1024).
Primärfarbe Kontrast-Fix: `#0B7F6B`.

## Ordner
- `pwa/` – 192/512 + maskable 192/512 (Safe-Zone ~20 % Rand)
- `favicon/` – 16/32/48 PNG + `favicon.ico`
- `apple/` – Apple Touch 120/152/167/180
- `capacitor/` – 48–512 Zwischengrössen
- `android/mipmap/` – Launcher + round
- `android/adaptive/` – foreground (transparent padded) + backgrounds primary/white/black (mdpi–xxxhdpi + master)
- `dark/` – Appicon auf dunklem Grund + Wordmarks hell/dunkel
- `source/` – Kopie der Final-Quellen

Native Splash-Bilder bewusst nicht erzeugt (einfarbig weiss/schwarz laut Checkliste).

Erzeugt mit `edovita-brief/scripts/export_icons.py`.
