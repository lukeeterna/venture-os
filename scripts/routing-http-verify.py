#!/usr/bin/env python3
"""
routing-http-verify.py — VOS S8 FASE 2.1

Esegue HTTP GET /v1/models su ciascun provider in routing.yaml e calcola drift
vs catalogo locale. Log drift in state/routing-drift.jsonl.

Vincoli applicati:
  #1  fattualita: real HTTP call, no doc-only.
  #5  zero-cost: solo endpoint free, GET /models (no token spent).
  #10 verified > verosimile: ogni model entry marcato verified|drift|not_verified.

NB Big Sur: stdlib only (urllib), Python 3.9+ compat (typing.Optional).
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import yaml

ROOT = Path(os.path.expanduser("~/venture-os"))
ROUTING_PATH = ROOT / "config" / "routing.yaml"
DRIFT_LOG = ROOT / "state" / "routing-drift.jsonl"
ENV_FILE = Path(os.path.expanduser("~/.claude/.env.free-gpu"))


def load_env() -> Dict[str, str]:
    env: Dict[str, str] = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def http_get_json(url: str, headers: Dict[str, str], timeout: int = 15) -> Tuple[int, Any, Optional[str]]:
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
        snippet = body[:300]
        return e.code, None, f"http_error: {snippet}"
    except urllib.error.URLError as e:
        return 0, None, f"url_error: {e.reason}"
    except Exception as e:  # pragma: no cover
        return 0, None, f"exception: {type(e).__name__}: {e}"


def list_models_google(endpoint: str, api_key: str) -> Tuple[int, List[str], Optional[str]]:
    # Google Generative Language: GET /v1beta/models?key=API_KEY
    url = f"{endpoint.rstrip('/')}/models?key={api_key}"
    status, body, err = http_get_json(url, headers={"User-Agent": "venture-os/1.0"})
    if err or not isinstance(body, dict):
        return status, [], err
    models: List[str] = []
    for m in body.get("models", []):
        name = m.get("name", "")
        # name format: "models/gemini-2.5-flash"
        if name.startswith("models/"):
            name = name.split("/", 1)[1]
        if name:
            models.append(name)
    return status, models, None


def list_models_openai_compat(endpoint: str, api_key: str, ua: str = "venture-os/1.0") -> Tuple[int, List[str], Optional[str]]:
    # Cerebras + OpenRouter expose OpenAI-style GET /v1/models
    url = f"{endpoint.rstrip('/')}/models"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "User-Agent": ua,
        "Accept": "application/json",
    }
    status, body, err = http_get_json(url, headers=headers)
    if err or not isinstance(body, dict):
        return status, [], err
    data = body.get("data", []) or body.get("models", [])
    models: List[str] = []
    for m in data:
        if isinstance(m, dict):
            mid = m.get("id") or m.get("name")
            if mid:
                models.append(mid)
    return status, models, None


def fetch_provider(provider: str, endpoint: str, api_key: str) -> Tuple[int, List[str], Optional[str]]:
    if provider == "google":
        return list_models_google(endpoint, api_key)
    if provider in ("cerebras", "openrouter", "groq", "openai"):
        return list_models_openai_compat(endpoint, api_key)
    return 0, [], f"unknown_provider:{provider}"


def main() -> int:
    if not ROUTING_PATH.exists():
        print(f"routing.yaml missing: {ROUTING_PATH}", file=sys.stderr)
        return 2
    routing = yaml.safe_load(ROUTING_PATH.read_text())
    env = load_env()
    env.update({k: v for k, v in os.environ.items() if k.endswith("_API_KEY") or k == "GEMINI_API_KEY"})

    ts = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    drift_entries: List[Dict[str, Any]] = []
    provider_cache: Dict[str, Tuple[int, List[str], Optional[str]]] = {}

    print(f"[{ts}] routing.yaml v{routing.get('version')} — {len(routing.get('models', []))} model entries")
    print("-" * 72)

    for entry in routing.get("models", []):
        model_id = entry.get("model_id")
        provider = entry.get("provider")
        endpoint = entry.get("api_endpoint")
        auth_env = entry.get("auth_env")
        role = entry.get("role")
        if not (model_id and provider and endpoint):
            continue

        api_key = env.get(auth_env, "") if auth_env else ""

        # Cache per provider to avoid hammering /models multiple times
        cache_key = f"{provider}|{endpoint}"
        if cache_key not in provider_cache:
            if not api_key:
                provider_cache[cache_key] = (0, [], f"missing_key:{auth_env}")
            else:
                status, models, err = fetch_provider(provider, endpoint, api_key)
                provider_cache[cache_key] = (status, models, err)
                time.sleep(0.3)  # be polite

        status, upstream_models, err = provider_cache[cache_key]

        if not api_key:
            verdict = "not_verified"
            reason = f"missing_key:{auth_env}"
        elif err:
            verdict = "not_verified"
            reason = f"http_fail status={status} err={err}"
        elif model_id in upstream_models:
            verdict = "verified"
            reason = f"present_upstream count={len(upstream_models)}"
        else:
            verdict = "drift"
            reason = f"absent_upstream count={len(upstream_models)}"

        line = f"  [{verdict:12s}] {provider:10s} {model_id:55s} role={role}"
        print(line)
        if verdict == "drift":
            print(f"               reason: {reason}")

        drift_entries.append({
            "ts": ts,
            "session": "S8",
            "role": role,
            "model_id": model_id,
            "provider": provider,
            "endpoint": endpoint,
            "verdict": verdict,
            "reason": reason,
            "http_status": status,
            "upstream_model_count": len(upstream_models),
        })

    DRIFT_LOG.parent.mkdir(parents=True, exist_ok=True)
    with DRIFT_LOG.open("a", encoding="utf-8") as f:
        for entry in drift_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    # Aggregate summary
    print("-" * 72)
    counts = {"verified": 0, "drift": 0, "not_verified": 0}
    for e in drift_entries:
        counts[e["verdict"]] = counts.get(e["verdict"], 0) + 1
    print(f"Summary: verified={counts['verified']} drift={counts['drift']} not_verified={counts['not_verified']}")
    print(f"Log written: {DRIFT_LOG}")

    return 0 if counts["drift"] == 0 and counts["not_verified"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
