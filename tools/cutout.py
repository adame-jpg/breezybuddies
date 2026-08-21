#!/usr/bin/env python3
"""Free the character renders from their studio backdrop.

The renders sit on a smooth light backdrop, so the background is the region
that is reachable from the image border without crossing a colour edge. A
flood fill finds exactly that, which keeps the character and its contact
shadow intact while everything around it becomes transparent.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path.home() / ".cursor/projects/Users-adamelmoussati-world-of-molds/assets"
STEMS = [
    "buddy2-elephant",
    "buddy2-cat",
    "buddy2-dog",
    "buddy2-dino-mint",
    "buddy2-dino-grape",
    "buddy2-bear",
]
TOLERANCE = 24
# The cream cat is nearly the colour of the backdrop, so it needs a strict eye.
TOLERANCE_BY_STEM = {"buddy2-cat": 10}


def background_mask(
    img: Image.Image, tolerance: int = TOLERANCE, drop_shadow: bool = False
) -> Image.Image:
    """Flood fill from the border, always comparing against the backdrop colour.

    Comparing neighbour-to-neighbour would let the fill walk through the soft
    shading of the character itself, so every candidate is measured against the
    median border colour instead.
    """
    w, h = img.size
    px = img.convert("RGB").load()

    border = [px[x, 0] for x in range(0, w, 8)] + [px[x, h - 1] for x in range(0, w, 8)]
    border += [px[0, y] for y in range(0, h, 8)] + [px[w - 1, y] for y in range(0, h, 8)]
    seed = tuple(sorted(c[i] for c in border)[len(border) // 2] for i in range(3))

    def is_bg(p):
        return all(abs(p[i] - seed[i]) <= tolerance for i in range(3))

    seen = bytearray(w * h)
    queue = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(px[x, y]):
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(px[x, y]):
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        idx = y * w + x
        if seen[idx]:
            continue
        seen[idx] = 1
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_bg(px[nx, ny]):
                queue.append((nx, ny))

    if drop_shadow:
        # Off by default: the contact shadow and the cream parts of the cat and
        # the dog occupy the same colour band, so this pass eats the characters
        # along with their shadow. Kept for renders that have no light fur.
        def is_shadow(p):
            r, g, b = p
            return (
                6 <= r - g <= 36
                and 22 <= r - b <= 62
                and seed[0] - 62 <= r <= seed[0] - 8
                and max(p) - min(p) <= 70
            )

        queue = deque(
            (x, y)
            for y in range(h)
            for x in range(w)
            if seen[y * w + x]
        )
        while queue:
            x, y = queue.popleft()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_shadow(px[nx, ny]):
                    seen[ny * w + nx] = 1
                    queue.append((nx, ny))

    return Image.frombytes("L", (w, h), bytes(255 if v else 0 for v in seen))


def main() -> int:
    for stem in STEMS:
        src = SRC / f"{stem}.png"
        if not src.exists():
            print("missing", src.name)
            continue
        with Image.open(src) as img:
            img = img.convert("RGBA")
            tol = TOLERANCE_BY_STEM.get(stem, TOLERANCE)
            alpha = background_mask(img, tol).point(lambda v: 0 if v else 255)
            # Shrink by a pixel first, otherwise the beige backdrop survives as
            # a halo once the cutout lands on a saturated card.
            alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
            img.putalpha(alpha)
            out = SRC / f"cut-{stem}.png"
            img.save(out)
            print("ok", out.name)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
