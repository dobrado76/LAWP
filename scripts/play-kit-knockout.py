"""Remove studio plates from play-kit sprites. Floors stay opaque. No leftover halo."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "resources" / "play" / "assets"
SKIP_PREFIX = ("floor-",)


def lum_sat(r: int, g: int, b: int) -> tuple[float, int]:
    return 0.299 * r + 0.587 * g + 0.114 * b, max(r, g, b) - min(r, g, b)


def knockout(path: Path) -> None:
    src = Image.open(path).convert("RGBA")
    w, h = src.size
    pix = src.load()
    cr, cg, cb, _ = pix[2, 2]
    plate = (cr, cg, cb)

    def plate_like(r: int, g: int, b: int) -> bool:
        lum, sat = lum_sat(r, g, b)
        if sat > 18:
            return False
        if max(abs(r - plate[0]), abs(g - plate[1]), abs(b - plate[2])) <= 58:
            return True
        return lum >= 200

    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = pix[x, y]
        if a == 0 or not plate_like(r, g, b):
            continue
        pix[x, y] = (0, 0, 0, 0)
        q.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))

    # Eat a 2px leftover rim that is still plate-like and touches transparency.
    for _ in range(2):
        rim: list[tuple[int, int]] = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = pix[x, y]
                if a == 0 or not plate_like(r, g, b):
                    continue
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and pix[nx, ny][3] == 0:
                        rim.append((x, y))
                        break
        for x, y in rim:
            pix[x, y] = (0, 0, 0, 0)

    src.save(path, "PNG")


def main() -> None:
    n = 0
    for path in sorted(ROOT.glob("*.png")):
        if path.name.startswith(SKIP_PREFIX):
            continue
        knockout(path)
        n += 1
        print(path.name)
    print(f"knocked out {n} sprites")


if __name__ == "__main__":
    main()
