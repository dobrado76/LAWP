"""Punch white canvas out of build/icon.png and write a multi-size .ico."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PNG = ROOT / "build" / "icon.png"
ICO = ROOT / "build" / "icon.ico"

def is_canvas(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb[:3]
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = max(r, g, b) - min(r, g, b)
    return luma >= 160 and chroma <= 80


def fill_color(im: Image.Image) -> tuple[int, int, int]:
    px = im.load()
    w, h = im.size
    for i in range(0, min(w, h)):
        r, g, b = px[i, i][:3]
        if r < 80 and b > 70:
            return (r, g, b)
    return (24, 18, 98)


def punch(im: Image.Image) -> Image.Image:
    rgb = im.convert("RGB")
    fill = fill_color(rgb)
    px = rgb.load()
    w, h = rgb.size
    stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or x < 0 or y < 0 or x >= w or y >= h:
            continue
        seen.add((x, y))
        if not is_canvas(px[x, y]):
            continue
        px[x, y] = fill
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return rgb


def main() -> None:
    src = Image.open(PNG)
    out = punch(src)
    out.save(PNG, "PNG")
    sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    out.save(ICO, sizes=sizes)
    print(f"Wrote {PNG} and {ICO} (white canvas filled with {fill_color(out)})")


if __name__ == "__main__":
    main()
