#!/usr/bin/env python3
"""Turn the raw generated art into web-ready assets.

Each source image is written as WebP (primary) and JPEG (fallback) at the
widths the storefront actually requests, so no oversized art ships.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

SRC = Path.home() / ".cursor/projects/Users-adamelmoussati-world-of-molds/assets"
OUT = Path(__file__).resolve().parent.parent / "assets/img"

# source stem -> (destination folder, destination stem, widths)
JOBS = [
    ("cut-buddy2-elephant", "products", "buddy-elephant", (900, 450)),
    ("cut-buddy2-cat", "products", "buddy-cat", (900, 450)),
    ("cut-buddy2-dog", "products", "buddy-dog", (900, 450)),
    ("cut-buddy2-dino-mint", "products", "buddy-dino-mint", (900, 450)),
    ("cut-buddy2-dino-grape", "products", "buddy-dino-grape", (900, 450)),
    ("cut-buddy2-bear", "products", "buddy-bear", (900, 450)),
    ("hero3d-closeup", "products", "on-mug", (1200, 600)),
    ("detail-charging", "products", "detail-charging", (1000, 500)),
    ("collection-lineup", "brand", "lineup", (1600, 800)),
    ("hero3d-desktop", "lifestyle", "hero-afterschool", (1800, 1100, 700)),
    ("hero3d-mobile", "lifestyle", "hero-mobile", (900, 560)),
    ("family3d", "lifestyle", "family-tea", (1400, 700)),
    ("ugc3d-soup", "ugc", "soup", (720, 420)),
    ("ugc3d-cocoa", "ugc", "hot-chocolate", (720, 420)),
    ("ugc3d-breakfast", "ugc", "breakfast", (720, 420)),
]


def emit(img: Image.Image, folder: str, stem: str, width: int, is_widest: bool) -> None:
    ratio = width / img.width
    resized = img.resize((width, round(img.height * ratio)), Image.LANCZOS)
    target_dir = OUT / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    suffix = "" if is_widest else f"-{width}"
    resized.save(target_dir / f"{stem}{suffix}.webp", "WEBP", quality=82, method=6)
    # JPEG cannot hold the cutout alpha, so the fallback gets a cream backing.
    flat = Image.new("RGBA", resized.size, (255, 248, 238, 255))
    flat.alpha_composite(resized)
    flat.convert("RGB").save(
        target_dir / f"{stem}{suffix}.jpg", "JPEG", quality=84, optimize=True, progressive=True
    )


def main() -> int:
    missing = []
    for src_stem, folder, stem, widths in JOBS:
        src = SRC / f"{src_stem}.png"
        if not src.exists():
            missing.append(src.name)
            continue
        with Image.open(src) as img:
            img = img.convert("RGBA")
            widest = max(widths)
            for width in widths:
                emit(img, folder, stem, width, width == widest)
        print(f"ok  {folder}/{stem}")

    if missing:
        print("\nmissing sources:", ", ".join(missing), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
