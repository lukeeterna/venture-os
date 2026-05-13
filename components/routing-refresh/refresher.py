#!/usr/bin/env python3
# refresher.py — VOS S12 routing-refresh notturno (blueprint CLAUDE.md sez "Vincoli invarianti").
#
# Esegue ogni notte (LaunchAgent RunAtLoad — pattern Luke MacBook saltagiorni):
#   1. GET /v1/models live su Google, Cerebras, OpenRouter (stdlib urllib).
#   2. Confronta catalogo upstream vs entries in config/routing.yaml.
#   3. Append delta a state/routing-drift.jsonl. MAI modifica routing.yaml
#      automaticamente — gate manuale Luke (vincolo #6 e blueprint scope).
#   4. Brief mattutino consuma drift via _signals() in briefer.py.
#
# Vincoli (CLAUDE.md):
#   #1  fattualita: HTTP reale, no doc-only. Pre-flight S12 2026-05-13 verified.
#   #5  zero-cost: /v1/models gratis tutti i provider, no token inference.
#   #8  no libs blacklist: stdlib urllib + json + pyyaml. NO requests.
#   #10 verified > verosimile: ogni run scrive run_marker, anche se 0 drift.
#
# Drift schema (3 type):
#   {ts, run_id, drift_type=model_removed,    provider, model_id, role, details}
#   {ts, run_id, drift_type=model_added,      provider, model_id,       details, scope}
#   {ts, run_id, drift_type=field_change,     provider, model_id, role, field, yaml_val, upstream_val}
#   {ts, run_id, drift_type=run_marker,       providers_ok, providers_fail, drift_count, duration_ms}
#
# Scope model_added: NON loggare ogni nuovo modello upstream (catalogo OpenRouter
#   = centinaia di entry, spam giornaliero). Filtro:
#     - solo `:free` suffix (OpenRouter) OR free_tier provider (Cerebras tutti free)
#     - match keyword categoria target: uncensored set (dolphin/hermes/venice/
#       abliterated/nous/wizard) OR long_context (>= 100K ctx upstream)
#   Pattern signal alto, false-positive basso.

"""VOS routing-refresh — drift detector notturno."""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import yaml

VOS_ROOT = Path(os.path.expanduser("~/venture-os"))
ROUTING_PATH = VOS_ROOT / "config" / "routing.yaml"
DRIFT_LOG = VOS_ROOT / "state" / "routing-drift.jsonl"
ENV_FILE = Path(os.path.expanduser("~/.claude/.env.free-gpu"))

COMPONENT = "routing-refresh"
HTTP_TIMEOUT = 20

# Keyword target per model_added scope (uncensored set + long_context candidates)
UNCENSORED_KEYWORDS = (
    "dolphin", "hermes", "venice", "abliterated", "wizard", "nous", "uncensored",
)
LONG_CONTEXT_MIN_CTX = 100_000


def _load_env_file(path: Path = ENV_FILE) -> Dict[str, str]:
    out: Dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def _http_get_json(url: str, headers: Dict[str, str], timeout: int = HTTP_TIMEOUT) -> Tuple[int, Any, Optional[str]]:
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            try:
                return resp.status, json.loads(body), None
            except json.JSONDecodeError as e:
                return resp.status, None, f"json_decode: {e}"
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace") if e.fp else ""
        return e.code, None, f"http_error: {body[:200]}"
    except urllib.error.URLError as e:
        return 0, None, f"url_error: {e.reason}"
    except Exception as e:  # noqa: BLE001
        return 0, None, f"exception: {type(e).__name__}: {e}"


# ----- per-provider catalog fetchers -----

def fetch_catalog_google(endpoint: str, api_key: str) -> Tuple[Dict[str, dict], Optional[str]]:
    """Returns {model_id: {context_window, output_tokens_max}} or ({}, err).

    Google espone inputTokenLimit + outputTokenLimit nel response /v1beta/models.
    """
    url = f"{endpoint.rstrip('/')}/models?key={api_key}"
    status, body, err = _http_get_json(url, headers={"User-Agent": "venture-os/1.0"})
    if err or not isinstance(body, dict):
        return {}, f"google status={status} err={err}"
    out: Dict[str, dict] = {}
    for m in body.get("models", []):
        name = m.get("name", "")
        if name.startswith("models/"):
            name = name.split("/", 1)[1]
        if not name:
            continue
        out[name] = {
            "context_window": m.get("inputTokenLimit"),
            "output_tokens_max": m.get("outputTokenLimit"),
            "display_name": m.get("displayName", ""),
        }
    return out, None


def fetch_catalog_cerebras(endpoint: str, api_key: str) -> Tuple[Dict[str, dict], Optional[str]]:
    """Cerebras /v1/models — OpenAI-compat shape. NON espone context_window."""
    url = f"{endpoint.rstrip('/')}/models"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "User-Agent": "venture-os/1.0",  # Cloudflare 1010 block senza UA custom
        "Accept": "application/json",
    }
    status, body, err = _http_get_json(url, headers=headers)
    if err or not isinstance(body, dict):
        return {}, f"cerebras status={status} err={err}"
    out: Dict[str, dict] = {}
    for m in body.get("data", []):
        mid = m.get("id")
        if not mid:
            continue
        out[mid] = {"owned_by": m.get("owned_by", "")}
    return out, None


def fetch_catalog_openrouter(endpoint: str, api_key: str) -> Tuple[Dict[str, dict], Optional[str]]:
    """OpenRouter /v1/models — espone context_length + pricing per model."""
    url = f"{endpoint.rstrip('/')}/models"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "User-Agent": "venture-os/1.0",
        "Accept": "application/json",
    }
    status, body, err = _http_get_json(url, headers=headers)
    if err or not isinstance(body, dict):
        return {}, f"openrouter status={status} err={err}"
    out: Dict[str, dict] = {}
    for m in body.get("data", []):
        mid = m.get("id")
        if not mid:
            continue
        pricing = m.get("pricing", {}) or {}
        out[mid] = {
            "context_window": m.get("context_length"),
            "pricing_prompt": pricing.get("prompt"),
            "pricing_completion": pricing.get("completion"),
        }
    return out, None


PROVIDER_FETCHERS = {
    "google": fetch_catalog_google,
    "cerebras": fetch_catalog_cerebras,
    "openrouter": fetch_catalog_openrouter,
}


def _scope_model_added(provider: str, mid: str, info: dict) -> Optional[str]:
    """Decide se un model upstream non-in-yaml merita un model_added entry.

    Returns scope label (es. 'uncensored-candidate') o None se da skippare.
    """
    low = mid.lower()
    # Solo free-tier: OpenRouter `:free` suffix oppure provider cerebras (tutti free per Luke)
    is_free = False
    if provider == "openrouter" and ":free" in low:
        is_free = True
    elif provider == "cerebras":
        is_free = True  # Cerebras tier Luke = free su tutti i modelli catalog
    # Google: catalog espone tutti i modelli (free/paid mixed) — non possiamo discriminare
    # da catalog. Per evitare spam, escludiamo Google da model_added.
    if not is_free:
        return None

    # Match categoria target
    for kw in UNCENSORED_KEYWORDS:
        if kw in low:
            return "uncensored-candidate"
    ctx = info.get("context_window") or 0
    try:
        if int(ctx) >= LONG_CONTEXT_MIN_CTX:
            return "long-context-candidate"
    except (TypeError, ValueError):
        pass
    return None


def _field_compare(provider: str, role: str, mid: str,
                   yaml_entry: dict, upstream_info: dict) -> List[dict]:
    """Confronta campi yaml vs upstream. Solo provider che espongono i field."""
    out: List[dict] = []
    checks: List[Tuple[str, str]] = []  # (yaml_key, upstream_key)
    if provider == "google":
        checks = [
            ("context_window", "context_window"),
            ("output_tokens_max", "output_tokens_max"),
        ]
    elif provider == "openrouter":
        checks = [("context_window", "context_window")]
    # Cerebras: catalog non espone fields → no check.

    for yaml_k, up_k in checks:
        yv = yaml_entry.get(yaml_k)
        uv = upstream_info.get(up_k)
        if yv is None or uv is None:
            continue
        try:
            if int(yv) != int(uv):
                out.append({
                    "drift_type": "field_change",
                    "provider": provider,
                    "model_id": mid,
                    "role": role,
                    "field": yaml_k,
                    "yaml_val": int(yv),
                    "upstream_val": int(uv),
                })
        except (TypeError, ValueError):
            # Non numeric → string compare
            if str(yv) != str(uv):
                out.append({
                    "drift_type": "field_change",
                    "provider": provider,
                    "model_id": mid,
                    "role": role,
                    "field": yaml_k,
                    "yaml_val": str(yv),
                    "upstream_val": str(uv),
                })
    return out


def compute_drift(routing: dict,
                  catalogs: Dict[str, Tuple[Dict[str, dict], Optional[str]]]) -> List[dict]:
    """Calcola tutte le drift entries. Non include run_marker (aggiunto da main)."""
    drifts: List[dict] = []
    yaml_ids_by_provider: Dict[str, Set[str]] = {}

    # 1. model_removed: yaml entries assenti in upstream
    for entry in routing.get("models", []):
        provider = entry.get("provider")
        mid = entry.get("model_id")
        role = entry.get("role", "")
        if not provider or not mid:
            continue
        cat, err = catalogs.get(provider, ({}, "provider_not_fetched"))
        if err:
            # Provider down → NO model_removed (no false-positive su outage upstream).
            continue
        yaml_ids_by_provider.setdefault(provider, set()).add(mid)
        if mid not in cat:
            drifts.append({
                "drift_type": "model_removed",
                "provider": provider,
                "model_id": mid,
                "role": role,
                "details": f"present in routing.yaml ma assente in /v1/models (catalog_size={len(cat)})",
            })
        else:
            # field_change check (solo se model presente)
            drifts.extend(_field_compare(provider, role, mid, entry, cat[mid]))

    # 2. model_added: upstream presente, scoped per provider+keyword
    for provider, (cat, err) in catalogs.items():
        if err:
            continue
        known = yaml_ids_by_provider.get(provider, set())
        for mid, info in cat.items():
            if mid in known:
                continue
            scope = _scope_model_added(provider, mid, info)
            if scope is None:
                continue
            drifts.append({
                "drift_type": "model_added",
                "provider": provider,
                "model_id": mid,
                "details": f"upstream catalog ma non in routing.yaml — candidato {scope}",
                "scope": scope,
                "context_window": info.get("context_window"),
            })

    return drifts


def append_drift_jsonl(entries: List[dict], path: Path = DRIFT_LOG) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser(description="VOS routing-refresh — drift detector notturno")
    ap.add_argument("--dry-run", action="store_true",
                    help="stampa drift senza append a state/routing-drift.jsonl")
    args = ap.parse_args()

    t0 = time.time()
    run_id = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    if not ROUTING_PATH.exists():
        sys.stderr.write(f"[{COMPONENT}] FATAL routing.yaml missing: {ROUTING_PATH}\n")
        return 2
    routing = yaml.safe_load(ROUTING_PATH.read_text(encoding="utf-8"))

    env = _load_env_file()
    env.update({k: v for k, v in os.environ.items() if k.endswith("_API_KEY")})

    # Dedup providers da routing.yaml (provider+endpoint key)
    seen: Set[Tuple[str, str, str]] = set()
    for m in routing.get("models", []):
        prov = m.get("provider", "")
        ep = m.get("api_endpoint", "")
        au = m.get("auth_env", "")
        if prov and ep:
            seen.add((prov, ep, au))

    catalogs: Dict[str, Tuple[Dict[str, dict], Optional[str]]] = {}
    providers_ok: List[str] = []
    providers_fail: List[Tuple[str, str]] = []

    print(f"[{ts}] {COMPONENT} run_id={run_id} routing.yaml v{routing.get('version')}")
    print("-" * 70)

    # Cache per (provider, endpoint) per non hammer
    for provider, endpoint, auth_env in sorted(seen):
        if provider in catalogs:  # gia preso (stesso provider 2 endpoint = caso raro)
            continue
        fetcher = PROVIDER_FETCHERS.get(provider)
        if fetcher is None:
            catalogs[provider] = ({}, f"no_fetcher_for_provider:{provider}")
            providers_fail.append((provider, "no_fetcher"))
            continue
        api_key = env.get(auth_env, "")
        if not api_key:
            catalogs[provider] = ({}, f"missing_key:{auth_env}")
            providers_fail.append((provider, f"missing_key:{auth_env}"))
            print(f"  [{provider}] FAIL missing_key:{auth_env}")
            continue
        cat, err = fetcher(endpoint, api_key)
        catalogs[provider] = (cat, err)
        if err:
            providers_fail.append((provider, err))
            print(f"  [{provider}] FAIL {err}")
        else:
            providers_ok.append(provider)
            print(f"  [{provider}] OK catalog_size={len(cat)}")
        time.sleep(0.3)  # be polite

    print("-" * 70)
    drifts = compute_drift(routing, catalogs)

    # Annota run_id + ts su tutti i drift
    for d in drifts:
        d["ts"] = ts
        d["run_id"] = run_id

    counts: Dict[str, int] = {}
    for d in drifts:
        counts[d["drift_type"]] = counts.get(d["drift_type"], 0) + 1

    print(f"Drift detected: {len(drifts)} total — {dict(counts)}")
    for d in drifts:
        print(f"  [{d['drift_type']:14s}] {d['provider']:10s} {d['model_id']:60s}")
        if d["drift_type"] == "field_change":
            print(f"                 field={d['field']} yaml={d['yaml_val']} upstream={d['upstream_val']}")
        elif d["drift_type"] == "model_added":
            print(f"                 scope={d['scope']} ctx={d.get('context_window')}")

    duration_ms = int((time.time() - t0) * 1000)
    marker = {
        "ts": ts,
        "run_id": run_id,
        "drift_type": "run_marker",
        "providers_ok": providers_ok,
        "providers_fail": [{"provider": p, "err": e} for p, e in providers_fail],
        "drift_count": len(drifts),
        "drift_breakdown": counts,
        "duration_ms": duration_ms,
        "component": COMPONENT,
        "routing_version": routing.get("version"),
    }

    print(f"Run marker: providers_ok={providers_ok} providers_fail={[p for p,_ in providers_fail]} duration={duration_ms}ms")

    if args.dry_run:
        print("[dry-run] no write to routing-drift.jsonl")
    else:
        append_drift_jsonl(drifts + [marker])
        print(f"Appended {len(drifts) + 1} entries to {DRIFT_LOG}")

    # Exit code: 0 OK (anche con drift, drift = signal non error),
    # 1 se almeno 1 provider failed (Luke vuole sapere),
    # 2 se routing.yaml missing.
    return 1 if providers_fail else 0


if __name__ == "__main__":
    sys.exit(main())
