#!/usr/bin/env python3
"""Genera shading_base.png: normalizza gli interni dei capi a mappa di
ombreggiatura (bianco = highlight, grigio = piega) preservando
background/scarpe/ombre originali. Il configuratore ricolora via
multiply(colore) x clip(maschera) sopra questa base.

Uso: python3 tools/generate_shading.py [derived_dir]
     derived_dir default = assets-mockup/derived/
Legge: composite_base.png + mask_{maglia,pantaloncini,calze}.png
Scrive: shading_base.png
"""
import os
import sys
import numpy as np
from PIL import Image

DERIVED = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(__file__), "..", "assets-mockup", "derived")

base = Image.open(os.path.join(DERIVED, "composite_base.png")).convert("RGB")
W, H = base.size
arr = np.asarray(base).astype(np.float32)
luma = 0.299*arr[:, :, 0] + 0.587*arr[:, :, 1] + 0.114*arr[:, :, 2]

out = arr.copy()
LO = 0.42  # multiply floor: pieghe profonde restano visibili senza annerire

for name in ["maglia", "pantaloncini", "calze"]:
    mpath = os.path.join(DERIVED, f"mask_{name}.png")
    # formato canonico maschera = RGBA con alpha=forma (RGB azzerato): leggi l'alpha
    m = np.asarray(Image.open(mpath).convert("RGBA").split()[3]).astype(np.float32)/255.0
    sel = m > 0.5
    if sel.sum() == 0:
        print("skip empty", name); continue
    vals = luma[sel]
    p5, p95 = np.percentile(vals, 5), np.percentile(vals, 95)
    rng = max(p95 - p5, 1.0)
    shade = np.clip((luma - p5)/rng, 0.0, 1.0)   # 0=piega, 1=highlight
    shade = LO + (1.0 - LO)*shade                 # mappa in [LO,1]
    g = shade*255.0
    for c in range(3):
        out[:, :, c] = out[:, :, c]*(1-m) + g*m   # blend morbido (m come alpha)
    print(f"{name}: p5={p5:.0f} p95={p95:.0f} px={int(sel.sum())}")

Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(
    os.path.join(DERIVED, "shading_base.png"))
print("saved shading_base.png", (W, H))
