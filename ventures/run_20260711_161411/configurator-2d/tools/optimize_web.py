#!/usr/bin/env python3
"""Genera le versioni web-ottimizzate dei derivati del mockup.

Input : assets-mockup/derived/{shading_base.png, mask_maglia.png,
        mask_pantaloncini.png, mask_calze.png}   (full-res 3715x5573)
Output: assets-mockup/derived/web/{shading_base.jpg, mask_*.png}
        lato lungo <= MAXSIDE px, peso totale target < 2.5 MB.

Solo lo script e' versionato (tools/); gli output vivono sotto
assets-mockup/ (gitignored). Uso: python3 tools/optimize_web.py [derived_dir]
"""
import os
import sys
from PIL import Image

DERIVED = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(__file__), "..", "assets-mockup", "derived")
WEB = os.path.join(DERIVED, "web")
MAXSIDE = 1600

os.makedirs(WEB, exist_ok=True)


def scaled_size(w, h):
    f = min(1.0, MAXSIDE / float(max(w, h)))
    return (max(1, round(w * f)), max(1, round(h * f)))


def do_shading():
    src = os.path.join(DERIVED, "shading_base.png")
    im = Image.open(src).convert("RGB")
    im = im.resize(scaled_size(*im.size), Image.LANCZOS)
    out = os.path.join(WEB, "shading_base.jpg")
    im.save(out, "JPEG", quality=85, optimize=True, progressive=True)
    return out


def do_mask(name):
    src = os.path.join(DERIVED, f"mask_{name}.png")
    im = Image.open(src).convert("RGBA")
    # per destination-in conta solo l'alpha: azzero RGB per massima compressione
    a = im.split()[3].resize(scaled_size(*im.size), Image.LANCZOS)
    flat = Image.new("RGBA", a.size, (0, 0, 0, 0))
    flat.putalpha(a)
    out = os.path.join(WEB, f"mask_{name}.png")
    flat.save(out, "PNG", optimize=True)
    return out


def main():
    outs = [do_shading()]
    for n in ("maglia", "pantaloncini", "calze"):
        outs.append(do_mask(n))
    total = 0
    for o in outs:
        sz = os.path.getsize(o)
        total += sz
        print(f"{os.path.relpath(o, DERIVED)}: {sz/1024:.0f} KB {Image.open(o).size}")
    print(f"TOTALE web: {total/1024/1024:.2f} MB (target < 2.5 MB)")
    if total > 2.5 * 1024 * 1024:
        print("WARN: oltre target 2.5 MB")
        sys.exit(2)


if __name__ == "__main__":
    main()
