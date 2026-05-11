"""Shim shared per components/founder-bridge — import diretto.

Use case: altri componenti VOS (es. vendor-setup, oauth-flow) importano
da qui senza dipendere dal path con trattino (`founder-bridge` non è
importabile come modulo Python diretto).

Esempio:
    from components._shared.founder_bridge import open_in_browser
    open_in_browser("https://cloud.cerebras.ai")
"""
from __future__ import annotations

import importlib.util
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_BROWSER_PY = os.path.normpath(
    os.path.join(_HERE, "..", "founder-bridge", "browser.py")
)

# Import dinamico: il package "founder-bridge" ha trattino, non importabile
# via `from components.founder-bridge import ...`. Risolviamo via spec loader.
_spec = importlib.util.spec_from_file_location(
    "_founder_bridge_browser", _BROWSER_PY
)
if _spec is None or _spec.loader is None:
    raise ImportError(f"Impossibile caricare {_BROWSER_PY}")
_mod = importlib.util.module_from_spec(_spec)
sys.modules["_founder_bridge_browser"] = _mod
_spec.loader.exec_module(_mod)

# Re-export API pubblica.
open_in_browser = _mod.open_in_browser
BrowserOpenError = _mod.BrowserOpenError
SUPPORTED_BROWSERS = _mod.SUPPORTED_BROWSERS

__all__ = ["open_in_browser", "BrowserOpenError", "SUPPORTED_BROWSERS"]
