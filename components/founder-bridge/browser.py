"""founder-bridge / browser.py — apre URL nel browser del founder.

Use case: OAuth flow, vendor signup, dashboard setup durante automazione VOS.
Esposto via shared shim components/_shared/founder_bridge.py per reuse cross-component.

Vincolo #1: testato con call reale (vedi __main__).
Vincolo #5: zero-cost (subprocess + osascript, built-in macOS).

Sicurezza:
- URL schema whitelist (http/https) → no apertura file locali via 'open'
- Browser whitelist → no osascript injection
- subprocess.run con args list → no shell injection
- osascript args via -e + escape literal per AppleScript string
"""
from __future__ import annotations

import subprocess
import sys
from typing import Optional
from urllib.parse import urlparse


# Browser supportati via AppleScript "open location".
# Aggiungere qui future entry (Arc, Brave). Whitelist obbligatoria.
SUPPORTED_BROWSERS = {
    "Safari",
    "Google Chrome",
    "Firefox",
}


class BrowserOpenError(RuntimeError):
    """Errore apertura URL — wrap di subprocess fallimenti."""


def _validate_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(
            f"URL schema '{parsed.scheme}' non supportato. "
            "Solo http/https per evitare apertura file locali via 'open'."
        )
    if not parsed.netloc:
        raise ValueError(f"URL senza host: {url!r}")


def _escape_applescript_string(s: str) -> str:
    """Escape per literal string AppleScript: backslash + quote."""
    return s.replace("\\", "\\\\").replace('"', '\\"')


def open_in_browser(url: str, browser: Optional[str] = None, timeout: float = 5.0) -> None:
    """Apre URL nel browser specificato (o default macOS).

    Args:
        url: URL http/https da aprire.
        browser: None per default macOS (`open <url>`), oppure uno di
                 SUPPORTED_BROWSERS per forzare via osascript.
        timeout: secondi per subprocess.run (default 5s — apertura è async).

    Raises:
        ValueError: URL non valido o browser non whitelistato.
        BrowserOpenError: subprocess fallisce.
    """
    _validate_url(url)

    if browser is None:
        cmd = ["open", url]
    else:
        if browser not in SUPPORTED_BROWSERS:
            raise ValueError(
                f"Browser {browser!r} non whitelistato. "
                f"Supportati: {sorted(SUPPORTED_BROWSERS)}"
            )
        # AppleScript: tell application "<browser>" to open location "<url>"
        # URL già validato http/https, ma escape comunque per difesa in profondità.
        safe_url = _escape_applescript_string(url)
        safe_browser = _escape_applescript_string(browser)
        script = f'tell application "{safe_browser}" to open location "{safe_url}"'
        cmd = ["osascript", "-e", script]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as e:
        raise BrowserOpenError(
            f"Timeout {timeout}s aprendo {url!r} con {browser or 'default'}"
        ) from e

    if result.returncode != 0:
        raise BrowserOpenError(
            f"Apertura fallita (rc={result.returncode}) "
            f"url={url!r} browser={browser or 'default'} "
            f"stderr={result.stderr.strip()!r}"
        )


if __name__ == "__main__":
    # Test reale (vincolo #1): apre example.com con default browser.
    # Uso: python3 browser.py [browser_name]
    target = "https://example.com"
    chosen = sys.argv[1] if len(sys.argv) > 1 else None
    print(f"Apro {target} con browser={chosen or 'default'} ...")
    try:
        open_in_browser(target, browser=chosen)
        print("OK — comando eseguito (verifica finestra aperta).")
    except (ValueError, BrowserOpenError) as e:
        print(f"FAIL: {e}", file=sys.stderr)
        sys.exit(1)
