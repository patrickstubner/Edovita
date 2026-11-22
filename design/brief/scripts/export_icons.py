#!/usr/bin/env python3
"""Edovita M2: generate PWA/Capacitor/Favicon/Android-adaptive/iOS icon pack.

Reads from design/logos/final/, writes to design/logos/export/.
No network. Local box only. Does not touch the GitHub app repo.
"""
from __future__ import annotations

import io
import json
import os
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw

ROOT = Path("design/logos")
FINAL = ROOT / "final"
OUT = ROOT / "export"
PRIMARY = (11, 127, 107, 255)  # #0B7F6B
WHITE = (255, 255, 255, 255)
BLACK = (0, 0, 0, 255)
SRC_ICON = FINAL / "edovita_appicon.png"
SRC_SVG = FINAL / "edovita_appicon.svg"
SRC_LOGO_DARK = FINAL / "edovita_logo_dark_transparent.png"
SRC_LOGO_LIGHT = FINAL / "edovita_logo_transparent.png"


def ensure_dirs() -> None:
    for sub in (
        "",
        "pwa",
        "favicon",
        "apple",
        "android/adaptive",
        "android/mipmap",
        "capacitor",
        "dark",
        "source",
    ):
        (OUT / sub).mkdir(parents=True, exist_ok=True)


def load_rgb_icon() -> Image.Image:
    im = Image.open(SRC_ICON).convert("RGBA")
    if im.size != (1024, 1024):
        im = im.resize((1024, 1024), Image.Resampling.LANCZOS)
    return im


def resize_cover(im: Image.Image, size: int) -> Image.Image:
    return im.resize((size, size), Image.Resampling.LANCZOS)


def save_png(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Drop alpha for opaque app icons when fully opaque; keep RGBA otherwise
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    im.save(path, format="PNG", optimize=True)


def make_maskable(base: Image.Image, size: int, pad_ratio: float = 0.2) -> Image.Image:
    """Pad icon into safe zone (~80% content) on full-bleed gradient/bg clone."""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # Use average edge color from base corners as fill (gradient icon → sample center-edge)
    # Simpler: fill with #0B7F6B then paste scaled icon in safe zone
    canvas.paste(PRIMARY, (0, 0, size, size))
    content = int(round(size * (1.0 - pad_ratio)))
    scaled = resize_cover(base, content)
    # Prefer keeping original full icon but scale down into safe zone
    # Re-render from original with letterbox: take full icon scaled to content
    offset = (size - content) // 2
    canvas.alpha_composite(scaled, (offset, offset))
    return canvas


def extract_foreground(base: Image.Image, size: int = 1024) -> Image.Image:
    """Transparent foreground: motif only on transparent bg, padded for adaptive safe zone.

    Adaptive icons: keyline / safe zone is the center 66% (72/108 dp).
    We place the full appicon content scaled to ~66% of canvas.
    """
    fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    content = int(round(size * 0.66))
    scaled = resize_cover(base, content)
    # Punch: use base as-is (includes gradient bg). For true transparent motif we'd
    # need a motif-only SVG. Approximate: keep full icon but on transparent padding.
    # Better approach: scale the whole icon into safe zone with transparent outside.
    offset = (size - content) // 2
    fg.alpha_composite(scaled, (offset, offset))
    return fg


def solid(size: int, color: tuple[int, int, int, int]) -> Image.Image:
    im = Image.new("RGBA", (size, size), color)
    return im


def make_ico(sizes: list[int], base: Image.Image, path: Path) -> None:
    imgs = [resize_cover(base, s).convert("RGBA") for s in sizes]
    # PIL saves multi-size ICO from the largest with sizes= parameter
    largest = imgs[-1]
    largest.save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=imgs[:-1] if len(imgs) > 1 else [],
    )


def copy_source() -> None:
    for name in (
        "edovita_appicon.png",
        "edovita_appicon.svg",
        "edovita_logo.svg",
        "edovita_logo_dark.svg",
        "edovita_logo_dark.png",
        "edovita_logo_dark_transparent.png",
        "edovita_logo_dark_transparent.svg",
        "edovita_logo_transparent.png",
        "edovita_logo_white.png",
        "edovita_logo_white.svg",
    ):
        src = FINAL / name
        if src.exists():
            data = src.read_bytes()
            (OUT / "source" / name).write_bytes(data)


def export_dark_wordmarks() -> None:
    """Export dark/light wordmark PNGs at common UI sizes for splash/headers."""
    for label, src in (
        ("logo_dark", SRC_LOGO_DARK),
        ("logo_light", SRC_LOGO_LIGHT),
    ):
        if not src.exists():
            continue
        im = Image.open(src).convert("RGBA")
        for w in (128, 256, 512, 1024):
            # preserve aspect
            ratio = w / im.width
            h = max(1, int(round(im.height * ratio)))
            resized = im.resize((w, h), Image.Resampling.LANCZOS)
            save_png(resized, OUT / "dark" / f"{label}_{w}.png")


def main() -> None:
    ensure_dirs()
    base = load_rgb_icon()
    copy_source()

    # Master 1024
    save_png(base, OUT / "icon-1024.png")

    # PWA
    for s in (192, 512):
        save_png(resize_cover(base, s), OUT / "pwa" / f"icon-{s}.png")
        save_png(make_maskable(base, s), OUT / "pwa" / f"maskable-{s}.png")

    # Favicon
    for s in (16, 32, 48):
        save_png(resize_cover(base, s), OUT / "favicon" / f"favicon-{s}.png")
    # Multi-size ICO
    ico_imgs = [resize_cover(base, s) for s in (16, 32, 48)]
    ico_imgs[-1].save(
        OUT / "favicon" / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    # Apple Touch
    save_png(resize_cover(base, 180), OUT / "apple" / "apple-touch-icon-180.png")
    for s in (120, 152, 167, 180):
        save_png(resize_cover(base, s), OUT / "apple" / f"apple-touch-icon-{s}.png")

    # Capacitor / Android mipmap common sizes
    for s in (48, 72, 96, 144, 192, 256, 384, 512):
        save_png(resize_cover(base, s), OUT / "capacitor" / f"icon-{s}.png")
        save_png(resize_cover(base, s), OUT / "android" / "mipmap" / f"ic_launcher-{s}.png")

    # Android adaptive: 108dp templates at mdpi..xxxhdpi
    # mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432; plus 1024 master
    adaptive_sizes = {
        "mdpi": 108,
        "hdpi": 162,
        "xhdpi": 216,
        "xxhdpi": 324,
        "xxxhdpi": 432,
        "master": 1024,
    }
    fg_master = extract_foreground(base, 1024)
    save_png(fg_master, OUT / "android" / "adaptive" / "ic_launcher_foreground-1024.png")
    for density, px in adaptive_sizes.items():
        save_png(
            resize_cover(fg_master, px),
            OUT / "android" / "adaptive" / f"ic_launcher_foreground-{density}-{px}.png",
        )
        save_png(solid(px, PRIMARY), OUT / "android" / "adaptive" / f"ic_launcher_background_primary-{density}-{px}.png")
        save_png(solid(px, WHITE), OUT / "android" / "adaptive" / f"ic_launcher_background_white-{density}-{px}.png")
        save_png(solid(px, BLACK), OUT / "android" / "adaptive" / f"ic_launcher_background_black-{density}-{px}.png")

    # Also full-bleed legacy round/square from base
    for s in (48, 72, 96, 144, 192):
        save_png(resize_cover(base, s), OUT / "android" / "mipmap" / f"ic_launcher_round-{s}.png")

    export_dark_wordmarks()

    # Dark-mode friendly app icon variant: same motif on near-black (for splash/docs)
    dark_icon = Image.new("RGBA", (1024, 1024), (18, 18, 18, 255))
    # Keep original icon (already has gradient) — additionally provide monochrome-bg pad version
    inset = resize_cover(base, 896)
    dark_icon.alpha_composite(inset, (64, 64))
    save_png(dark_icon, OUT / "dark" / "appicon-on-dark-1024.png")
    for s in (192, 512):
        save_png(resize_cover(dark_icon, s), OUT / "dark" / f"appicon-on-dark-{s}.png")

    # Manifest snippet for PWA icons
    manifest_icons = {
        "icons": [
            {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "icons/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
        "theme_color": "#0B7F6B",
        "background_color": "#FFFFFF",
        "note_dark_splash": "Native splash bewusst einfarbig weiss/schwarz; siehe dark/ und adaptive backgrounds.",
    }
    (OUT / "icons-manifest-snippet.json").write_text(
        json.dumps(manifest_icons, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    readme = """# Edovita Icon-Export (M2)

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

Erzeugt mit `design/brief/scripts/export_icons.py`.
"""
    (OUT / "README.md").write_text(readme, encoding="utf-8")

    # inventory
    files = sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file())
    (OUT / "EXPORT_LIST.txt").write_text("\n".join(files) + "\n", encoding="utf-8")
    print(f"Wrote {len(files)} files under {OUT}")


if __name__ == "__main__":
    main()
