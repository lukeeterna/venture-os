#!/usr/bin/env python3
"""Estrae dal PSD del mockup le 3 maschere alpha per-capo + la base composita.

Dal gruppo "Parts" del PSD unisce (lighten) gli alpha dei layer nominati per
ciascun capo. Output nella dir derivati (gitignored).

Uso: python3 tools/extract_masks.py <Football Kit.psd> [out_dir]
     out_dir default = assets-mockup/derived/

NB: sub-zone colletto/maniche sono layer separati ('Neck', 'Right Arm',
'Left Arm') -> estraibili in futuro senza nuovo lavoro sul PSD (enhancement).
"""
import os
import sys
from psd_tools import PSDImage
from PIL import Image, ImageChops

PSD = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
    os.path.dirname(__file__), "..", "assets-mockup", "derived")
os.makedirs(OUT, exist_ok=True)

psd = PSDImage.open(PSD)
W, H = psd.width, psd.height
print(f"canvas {W}x{H}")

GARMENTS = {
    "maglia": ["Shirt", "Back", "Neck", "Right Arm", "Left Arm", "Sleeve line", "Sleeves ends"],
    "pantaloncini": ["Short"],
    "calze": ["Socks", "Upper socks"],
}

parts = {}
for group in psd:
    if group.name == "Parts" and group.is_group():
        for lyr in group:
            parts[lyr.name] = lyr
print("Parts found:", list(parts.keys()))


def layer_alpha(lyr):
    img = lyr.composite(viewport=(0, 0, W, H))
    if img is None:
        return None
    return img.convert("RGBA").split()[3]


for garment, names in GARMENTS.items():
    acc = Image.new("L", (W, H), 0)
    used = []
    for n in names:
        lyr = parts.get(n)
        if lyr is None:
            print(f"  WARN missing part '{n}'"); continue
        a = layer_alpha(lyr)
        if a is None:
            print(f"  WARN empty composite '{n}'"); continue
        acc = ImageChops.lighter(acc, a)
        used.append(n)
    out = os.path.join(OUT, f"mask_{garment}.png")
    # salva RGBA con alpha = forma del capo (RGB azzerato): formato usato dal
    # configuratore via canvas destination-in.
    rgba = Image.new("RGBA", (W, H), (0, 0, 0, 0)); rgba.putalpha(acc)
    rgba.save(out)
    print(f"{garment}: parts={used} -> {out} bbox={acc.getbbox()}")

print("compositing full base ...")
base = psd.composite()
base.convert("RGB").save(os.path.join(OUT, "composite_base.png"))
print("saved composite_base.png", base.size)
