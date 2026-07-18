#!/usr/bin/env python3
"""Stampa l'albero dei layer di un PSD (verbatim). Diagnostica per la
derivazione maschere. Uso: python3 tools/inspect_layers.py <file.psd>"""
import sys
from psd_tools import PSDImage

path = sys.argv[1]
psd = PSDImage.open(path)
print(f"PSD size: {psd.width} x {psd.height}  channels={psd.channels} color_mode={psd.color_mode}")
print("=== LAYER TREE (verbatim) ===")


def walk(layer, depth=0):
    ind = "  " * depth
    kind = layer.kind
    smart = " [SMART-OBJECT]" if kind == "smartobject" else ""
    visible = "V" if layer.visible else "-"
    try:
        bbox = layer.bbox
    except Exception:
        bbox = None
    blend = getattr(layer, "blend_mode", None)
    print(f"{ind}[{visible}] '{layer.name}' kind={kind}{smart} blend={blend} bbox={bbox}")
    if layer.is_group():
        for child in layer:
            walk(child, depth + 1)


for layer in psd:
    walk(layer, 0)
