#!/usr/bin/env python3
# Tool-scout v0 (B5 S7 close 2026-05-12): scouting periodico tool open source per VOS framework.
# Sorgente: HuggingFace public API (no auth, no rate limit issue scala settimanale).
# Output: append snapshot a state/tool-landscape.jsonl + diff vs ultimo snapshot in state/tool-scout-diff.jsonl.
"""
Pattern Luke RunAtLoad: esegue ad ogni invocazione ma snapshot append solo se cambia settimana ISO (anno-week).
Brief mattutino legge tool-scout-diff.jsonl e mostra in sezione Segnali.

Vincolo #5 esteso: license blacklist check (non-commercial, source-available, research-only, cc-by-nc).
RMBG-2.0 caso reale: SOTA accuracy ma license non-commercial → BLOCKER per progetti revenue ARGOS/FLUXION/Guardian.

Stack: stdlib only (urllib.request) + yaml. No pip dependencies pesanti. Big Sur compatible.
"""

import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import date, datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

import yaml

_SHARED = Path(__file__).resolve().parent.parent / "_shared"
sys.path.insert(0, str(_SHARED))
from mount_check import require_t7_or_exit  # noqa: E402

require_t7_or_exit("tool-scout")

VOS_ROOT = Path("/Volumes/MontereyT7/venture-os")
AREAS_CONFIG = VOS_ROOT / "config" / "tool-scout-areas.yaml"
NEEDS_CONFIG = VOS_ROOT / "config" / "capability-needs.yaml"
LANDSCAPE_LOG = VOS_ROOT / "state" / "tool-landscape.jsonl"
DIFF_LOG = VOS_ROOT / "state" / "tool-scout-diff.jsonl"
LAST_RUN_FILE = VOS_ROOT / "state" / "tool-scout-last-run.txt"
ERROR_LOG = VOS_ROOT / "state" / "errors.jsonl"

HF_API_BASE = "https://huggingface.co/api/models"
GITHUB_API_SEARCH = "https://api.github.com/search/repositories"
HTTP_TIMEOUT = 15


def _log_error(msg: str, exc: Optional[Exception] = None) -> None:
    entry = {
        "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "component": "tool-scout",
        "msg": msg,
        "error": repr(exc) if exc else None,
    }
    try:
        with open(ERROR_LOG, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass


def _http_get_json(url: str) -> Optional[object]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "vos-tool-scout/0.1"})
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        _log_error(f"HTTP GET fail {url}", e)
        return None
    except Exception as e:  # noqa: BLE001
        _log_error(f"HTTP GET unexpected {url}", e)
        return None


def _read_areas() -> dict:
    try:
        with open(AREAS_CONFIG) as f:
            return yaml.safe_load(f) or {}
    except Exception as e:  # noqa: BLE001
        _log_error("areas config unreadable", e)
        return {"areas": {}}


def _read_needs() -> dict:
    """Carica capability-needs.yaml — source of truth per discovery filtrata."""
    try:
        with open(NEEDS_CONFIG) as f:
            return (yaml.safe_load(f) or {}).get("needs") or {}
    except FileNotFoundError:
        _log_error("capability-needs.yaml MANCA: discovery generica bypassed")
        return {}
    except Exception as e:  # noqa: BLE001
        _log_error("capability-needs unreadable", e)
        return {}


def _build_query_from_needs(needs_entry: dict) -> str:
    """Costruisce GitHub query da github_keywords. OR su keywords in:name,description.

    GitHub Search API limit: max 5 AND/OR/NOT operators per query.
    Con N keywords e operator OR fra ciascuna coppia consecutiva: N-1 operators.
    Quindi N max = 5 keywords (= 4 OR), troncato a 5 con warning se più.
    """
    kws = needs_entry.get("github_keywords") or []
    if not kws:
        return ""
    if len(kws) > 5:
        _log_error(f"keywords truncated 5: avevi {len(kws)}, GitHub Search OR cap=5 → uso primi 5")
        kws = kws[:5]
    or_block = " OR ".join(kws)
    return f"({or_block}) in:name,description"


def _list_top_models(pipeline_tag: str, top_n: int, sort_by: str) -> list:
    direction = "-1"  # discending
    params = urllib.parse.urlencode({
        "pipeline_tag": pipeline_tag,
        "sort": sort_by,
        "direction": direction,
        "limit": top_n,
    })
    url = f"{HF_API_BASE}?{params}"
    data = _http_get_json(url)
    if not isinstance(data, list):
        return []
    return data


def _model_license(model_id: str) -> str:
    """Estrai license da model card cardData. None/empty → 'unknown'."""
    safe_id = urllib.parse.quote(model_id, safe="/")
    url = f"{HF_API_BASE}/{safe_id}"
    data = _http_get_json(url)
    if not isinstance(data, dict):
        return "unknown"
    card = data.get("cardData") or {}
    lic = card.get("license")
    if isinstance(lic, list) and lic:
        lic = lic[0]
    if not isinstance(lic, str):
        return "unknown"
    return lic.lower().strip()


def _classify_license(lic: str, whitelist: list, blacklist_patterns: list) -> str:
    """Return: 'safe' | 'blocked' | 'unknown'."""
    if not lic or lic == "unknown":
        return "unknown"
    if lic in whitelist:
        return "safe"
    for pat in blacklist_patterns:
        if pat in lic:
            return "blocked"
    return "unknown"


def _scout_area_github(area_name: str, area_cfg: dict, needs: dict) -> dict:
    """GitHub Search API: trending AI repos last N days, filtered by stars + license.

    Supporta 2 modi:
    - area_cfg ha 'query' inline → usa direttamente
    - area_cfg ha 'needs_from: <key>' → costruisce query da capability-needs.yaml[key].github_keywords
    """
    needs_from = area_cfg.get("needs_from")
    if needs_from:
        needs_entry = needs.get(needs_from) or {}
        query = _build_query_from_needs(needs_entry)
        if not query:
            _log_error(f"area {area_name} needs_from={needs_from} ma keywords vuoti, skip")
            return {
                "area": area_name, "source": "github", "needs_from": needs_from,
                "scanned": 0, "safe_count": 0, "top_safe": [],
                "all_scanned_ids": [], "blocked_ids": [], "skip_reason": "no_keywords",
            }
    else:
        query = area_cfg.get("query", "topic:ai")
    days = int(area_cfg.get("created_within_days", 30))
    min_stars = int(area_cfg.get("min_stars", 100))
    top_n = int(area_cfg.get("top_n", 5))
    whitelist = [l for l in area_cfg.get("license_whitelist") or []]  # GitHub SPDX case-sensitive
    blacklist_patterns = [p for p in area_cfg.get("license_blacklist_patterns") or []]

    since = (date.today() - timedelta(days=days)).isoformat()
    full_query = f"{query} created:>{since} stars:>{min_stars}"
    params = urllib.parse.urlencode({
        "q": full_query,
        "sort": "stars",
        "order": "desc",
        "per_page": top_n,
    })
    url = f"{GITHUB_API_SEARCH}?{params}"
    data = _http_get_json(url)
    if not isinstance(data, dict):
        return {
            "area": area_name, "source": "github", "scanned": 0, "safe_count": 0,
            "top_safe": [], "all_scanned_ids": [], "blocked_ids": [],
        }
    items = data.get("items") or []
    enriched = []
    for r in items:
        if r.get("fork"):
            continue  # filtra forks
        spdx = ((r.get("license") or {}).get("spdx_id")) or "NOASSERTION"
        if spdx in whitelist:
            status = "safe"
        elif spdx in blacklist_patterns:
            status = "blocked"
        else:
            status = "unknown"
        enriched.append({
            "id": r["full_name"],
            "stars": r.get("stargazers_count", 0),
            "created_at": r.get("created_at", "")[:10],
            "pushed_at": r.get("pushed_at", "")[:10],
            "license": spdx,
            "license_status": status,
            "description": (r.get("description") or "")[:120],
        })
    safe_only = [m for m in enriched if m["license_status"] == "safe"]
    return {
        "area": area_name,
        "source": "github",
        "needs_from": needs_from,
        "query": full_query,
        "scanned": len(enriched),
        "safe_count": len(safe_only),
        "top_safe": safe_only,
        "all_scanned_ids": [m["id"] for m in enriched],
        "blocked_ids": [m["id"] for m in enriched if m["license_status"] == "blocked"],
    }


def _scout_area(area_name: str, area_cfg: dict, needs: dict) -> dict:
    source = (area_cfg.get("source") or "hf").lower()
    if source == "github":
        return _scout_area_github(area_name, area_cfg, needs)
    # default: hf source
    pipeline_tag = area_cfg.get("hf_pipeline_tag")
    top_n = int(area_cfg.get("top_n", 10))
    sort_by = area_cfg.get("sort_by", "likes")
    whitelist = [l.lower() for l in area_cfg.get("license_whitelist") or []]
    blacklist_patterns = [p.lower() for p in area_cfg.get("license_blacklist_patterns") or []]

    raw_models = _list_top_models(pipeline_tag, top_n, sort_by)
    enriched = []
    for m in raw_models:
        mid = m.get("id", "")
        if not mid:
            continue
        lic = _model_license(mid)
        cls = _classify_license(lic, whitelist, blacklist_patterns)
        enriched.append({
            "id": mid,
            "likes": m.get("likes", 0),
            "downloads": m.get("downloads", 0),
            "license": lic,
            "license_status": cls,
        })

    safe_only = [m for m in enriched if m["license_status"] == "safe"]

    return {
        "area": area_name,
        "source": "hf",
        "pipeline_tag": pipeline_tag,
        "sort_by": sort_by,
        "scanned": len(enriched),
        "safe_count": len(safe_only),
        "top_safe": safe_only[:5],  # top 5 commercially-safe
        "all_scanned_ids": [m["id"] for m in enriched],
        "blocked_ids": [m["id"] for m in enriched if m["license_status"] == "blocked"],
    }


def _iso_week(d: date) -> str:
    iso = d.isocalendar()
    return f"{iso[0]}-W{iso[1]:02d}"


def _last_run_week() -> Optional[str]:
    if not LAST_RUN_FILE.exists():
        return None
    try:
        return LAST_RUN_FILE.read_text(encoding="utf-8").strip() or None
    except Exception:
        return None


def _save_last_run_week(week: str) -> None:
    try:
        LAST_RUN_FILE.write_text(week, encoding="utf-8")
    except Exception as e:  # noqa: BLE001
        _log_error("save last run fail", e)


def _last_snapshot() -> Optional[dict]:
    if not LANDSCAPE_LOG.exists():
        return None
    try:
        with open(LANDSCAPE_LOG) as f:
            lines = [ln for ln in f if ln.strip()]
        if not lines:
            return None
        return json.loads(lines[-1])
    except Exception as e:  # noqa: BLE001
        _log_error("last snapshot unreadable", e)
        return None


def _diff_top_safe(prev: dict, curr: dict) -> list:
    """Calcola diff per area: nuovo top_safe IDs vs precedente."""
    diffs = []
    prev_areas = {a["area"]: a for a in (prev.get("areas") or [])}
    for a in curr.get("areas") or []:
        area = a["area"]
        curr_top_ids = [m["id"] for m in a.get("top_safe") or []]
        prev_a = prev_areas.get(area, {})
        prev_top_ids = [m["id"] for m in prev_a.get("top_safe") or []]
        if not prev_top_ids:
            # primo snapshot
            continue
        if curr_top_ids == prev_top_ids:
            continue
        # ordine cambiato o set diverso → diff
        new_entries = [mid for mid in curr_top_ids if mid not in prev_top_ids]
        dropped = [mid for mid in prev_top_ids if mid not in curr_top_ids]
        if new_entries or dropped:
            diffs.append({
                "area": area,
                "prev_top": prev_top_ids,
                "curr_top": curr_top_ids,
                "new_entries": new_entries,
                "dropped": dropped,
            })
    return diffs


def main() -> int:
    today = date.today()
    week = _iso_week(today)
    last_week = _last_run_week()

    if last_week == week:
        print(f"[tool-scout] Skip: ultima esecuzione stessa settimana {week}")
        return 0

    cfg = _read_areas()
    areas = cfg.get("areas") or {}
    if not areas:
        _log_error("nessuna area in config")
        return 1

    needs = _read_needs()
    print(f"[tool-scout] Scouting settimana {week} — {len(areas)} aree, {len(needs)} needs caricati")

    area_results = []
    for area_name, area_cfg in areas.items():
        print(f"  - {area_name} ...")
        result = _scout_area(area_name, area_cfg, needs)
        area_results.append(result)

    snapshot = {
        "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "week": week,
        "areas": area_results,
    }

    prev = _last_snapshot()
    diffs = _diff_top_safe(prev, snapshot) if prev else []

    # Append snapshot
    LANDSCAPE_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(LANDSCAPE_LOG, "a") as f:
        f.write(json.dumps(snapshot, ensure_ascii=False) + "\n")

    # Append diff (anche se vuoto, per audit run effettuato)
    diff_entry = {
        "ts": snapshot["ts"],
        "week": week,
        "diffs": diffs,
        "areas_scanned": len(area_results),
    }
    with open(DIFF_LOG, "a") as f:
        f.write(json.dumps(diff_entry, ensure_ascii=False) + "\n")

    _save_last_run_week(week)

    print(f"[tool-scout] Snapshot scritto. Diffs: {len(diffs)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
