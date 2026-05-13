# heretic_handler.py — VOS S11c-prereq uncensored gateway (blueprint sez 15.11).
#
# Use case: brainstorming strategico ARGOS senza filtri commerciali Anthropic
# (persona fittizia "Luca Ferretti", content trojan-horse, pricing aggressivo,
# sales psychology dealer). Riusa pattern llm_router S9 (provider classes,
# circuit breaker, cost tracking, output chunking).
#
# Vincoli (CLAUDE.md):
#   #1  fattualita: pre-flight HTTP /v1/models verificato (S11c-prereq 2026-05-13)
#       per entrambi modelli dolphin-mistral + hermes-3-405b.
#   #5  zero-cost: entrambi modelli :free OpenRouter.
#   #8  no libs blacklist: stdlib + requests + pyyaml (gia in llm_router).
#   #10 verified > verosimile: test live obbligatorio post-ship.
#
# Gate etico: ALLOWED_CATEGORIES hardcoded. topic_category NOT in lista =>
# raise + audit reject. Non e censura, e scope discipline: handler nato per
# brainstorming commerciale borderline, non bypass generico per content illegale.
#
# Audit: state/heretic-log.jsonl append-only, hash-only.
#   {"ts": "...", "model": "...", "topic_category": "...",
#    "prompt_sha256": "...", "prompt_len": N, "response_len": N,
#    "latency_ms": N, "fallback_depth": N}
# NO contenuto raw. Retrospective audit senza disclosure operativo.

"""VOS heretic-handler — uncensored brainstorming gateway."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path
from typing import Optional

# Riuso pattern llm_router (stesso parent dir _shared)
_SHARED = Path(__file__).resolve().parents[1] / "_shared"
sys.path.insert(0, str(_SHARED))
from llm_router import (  # noqa: E402
    _build_provider,
    _call_with_chunking,
    _cb_record_failure,
    _cb_reset_on_success,
    _cb_should_skip,
    _compute_cost_usd,
    _load_routing,
    _resolve_chain,
    _track_cost,
    RouterError,
    _ProviderFatal,
    _ProviderRetryable,
)

VOS_ROOT = Path(os.path.expanduser("~/venture-os"))
HERETIC_LOG = VOS_ROOT / "state" / "heretic-log.jsonl"
COMPONENT = "heretic-handler"
ROLE = "uncensored"

# Hardcoded scope gate (blueprint sez 15.11). Modifica = decisione esplicita
# in PR/commit dedicato, non runtime config.
ALLOWED_CATEGORIES = [
    "persona-fittizia",
    "content-strategy",
    "pricing-aggressivo",
    "scope-borderline-legal",
    "sales-psychology",
    "competitor-positioning",
    "brainstorm-generale",
]


class HereticError(Exception):
    """Errore handler-level (gate reject, chain exhaustion, fatal provider)."""


def _audit(record: dict) -> None:
    """Append audit record JSONL. Crea state/ se manca. Mai contenuto raw."""
    HERETIC_LOG.parent.mkdir(parents=True, exist_ok=True)
    record.setdefault("ts", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    record.setdefault("component", COMPONENT)
    with HERETIC_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def brainstorm(prompt: str,
               *,
               topic_category: str,
               system: Optional[str] = None,
               max_tokens: int = 4096,
               temperature: float = 0.7,
               timeout_s: int = 60) -> str:
    """Brainstorming uncensored. Gate hardcoded su topic_category.

    Args:
        prompt: user prompt.
        topic_category: must be in ALLOWED_CATEGORIES (keyword-only).
        system: optional system instruction.
        max_tokens: output cap (default 4096 = provider cap).
        temperature: 0.7 default (brainstorming = some creativity).
        timeout_s: HTTP timeout per provider call.

    Returns:
        response text concatenato.

    Raises:
        HereticError: gate reject o exhaustion fallback chain o provider fatal.
        RouterError: config routing.yaml invalida.
    """
    prompt_hash = hashlib.sha256(prompt.encode("utf-8")).hexdigest()

    if topic_category not in ALLOWED_CATEGORIES:
        _audit({
            "event": "reject_category",
            "topic_category": topic_category,
            "prompt_sha256": prompt_hash,
            "prompt_len": len(prompt),
            "reason": "topic_category not in ALLOWED_CATEGORIES",
            "allowed": ALLOWED_CATEGORIES,
        })
        raise HereticError(
            f"topic_category '{topic_category}' not in ALLOWED_CATEGORIES. "
            f"Allowed: {ALLOWED_CATEGORIES}"
        )

    routing = _load_routing()
    chain = _resolve_chain(routing, ROLE)
    if not chain:
        raise HereticError(f"no models with role='{ROLE}' in routing.yaml")

    last_error: Optional[Exception] = None
    fallback_depth = 0

    for entry in chain:
        provider = _build_provider(entry)
        cb_key = provider.cb_key()

        if _cb_should_skip(cb_key):
            sys.stderr.write(f"[{COMPONENT}] cb_skip provider={cb_key}\n")
            fallback_depth += 1
            continue

        t0 = time.time()
        try:
            text, tin, tout, rounds = _call_with_chunking(
                provider, system, prompt, max_tokens, temperature, timeout_s
            )
            latency_ms = int((time.time() - t0) * 1000)
            _cb_reset_on_success(cb_key)
            _track_cost({
                "event": "complete",
                "role": ROLE,
                "provider": provider.name,
                "model": provider.model_id,
                "input_tokens": tin,
                "output_tokens": tout,
                "cost_usd": _compute_cost_usd(entry, tin, tout),
                "latency_ms": latency_ms,
                "fallback_depth": fallback_depth,
                "chunk_rounds": rounds,
                "component": COMPONENT,
            })
            _audit({
                "event": "ok",
                "model": provider.model_id,
                "topic_category": topic_category,
                "prompt_sha256": prompt_hash,
                "prompt_len": len(prompt),
                "response_len": len(text),
                "latency_ms": latency_ms,
                "fallback_depth": fallback_depth,
                "tokens_in": tin,
                "tokens_out": tout,
                "chunk_rounds": rounds,
            })
            return text

        except _ProviderFatal as e:
            latency_ms = int((time.time() - t0) * 1000)
            _audit({
                "event": "fatal",
                "model": provider.model_id,
                "topic_category": topic_category,
                "prompt_sha256": prompt_hash,
                "prompt_len": len(prompt),
                "error": str(e)[:300],
                "http_status": e.status,
                "latency_ms": latency_ms,
                "fallback_depth": fallback_depth,
            })
            _cb_record_failure(cb_key)
            # missing_key (es. fallback senza auth) degradato a retryable,
            # come in llm_router.complete().
            if "missing_key" in str(e):
                last_error = e
                fallback_depth += 1
                continue
            raise HereticError(f"provider fatal ({provider.model_id}): {e}") from e

        except _ProviderRetryable as e:
            latency_ms = int((time.time() - t0) * 1000)
            _audit({
                "event": "retryable_fail",
                "model": provider.model_id,
                "topic_category": topic_category,
                "prompt_sha256": prompt_hash,
                "prompt_len": len(prompt),
                "error": str(e)[:300],
                "http_status": e.status,
                "latency_ms": latency_ms,
                "fallback_depth": fallback_depth,
            })
            _cb_record_failure(cb_key)
            last_error = e
            fallback_depth += 1
            sys.stderr.write(
                f"[{COMPONENT}] retryable fail {provider.name}/{provider.model_id} "
                f"status={e.status} -> next (depth={fallback_depth})\n"
            )
            continue

    raise HereticError(
        f"uncensored fallback chain exhausted, depth={fallback_depth}. "
        f"Last error: {last_error}"
    )


def _cli() -> int:
    ap = argparse.ArgumentParser(
        description="VOS heretic-handler — uncensored brainstorming gateway",
    )
    ap.add_argument("--topic", required=True,
                    help=f"topic_category, one of: {ALLOWED_CATEGORIES}")
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--input-file", type=str, default=None,
                     help="leggi prompt da file (path expandable ~)")
    src.add_argument("--prompt", type=str, default=None,
                     help="prompt inline")
    ap.add_argument("--system", default=None, help="system instruction opzionale")
    ap.add_argument("--max-tokens", type=int, default=4096)
    ap.add_argument("--temperature", type=float, default=0.7)
    ap.add_argument("--timeout", type=int, default=60)
    args = ap.parse_args()

    if args.input_file:
        prompt = Path(args.input_file).expanduser().read_text(encoding="utf-8")
    elif args.prompt:
        prompt = args.prompt
    else:
        prompt = sys.stdin.read()

    if not prompt.strip():
        sys.stderr.write("error: empty prompt\n")
        return 2

    try:
        out = brainstorm(
            prompt,
            topic_category=args.topic,
            system=args.system,
            max_tokens=args.max_tokens,
            temperature=args.temperature,
            timeout_s=args.timeout,
        )
    except HereticError as e:
        sys.stderr.write(f"heretic_error: {e}\n")
        return 1
    except RouterError as e:
        sys.stderr.write(f"router_error: {e}\n")
        return 3

    sys.stdout.write(out)
    if not out.endswith("\n"):
        sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(_cli())
