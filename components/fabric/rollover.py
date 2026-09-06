#!/usr/bin/env python3
"""Deterministic VOS Fabric context-rollover watcher.

The watcher has no network access and does not start/resume/fork an agent session. It
turns measured context telemetry into a fail-closed checkpoint transition. A runtime
adapter must later perform the authorized Codex resume/fork and feed the resulting new
continuation reference back to ``complete_rollover``.

Python 3.8+; stdlib only.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, Mapping

try:
    from . import checkpoint as checkpoint_mod
except ImportError:  # pragma: no cover
    import checkpoint as checkpoint_mod  # type: ignore


class RolloverError(ValueError):
    """Telemetry or rollover transition is unsafe/inconsistent."""


def _canonical_sha256(value: Mapping[str, Any]) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def validate_telemetry(raw: Mapping[str, Any]) -> Dict[str, int]:
    if not isinstance(raw, Mapping):
        raise RolloverError("telemetry must be an object")
    required = {"context_used_units", "context_limit_units"}
    missing = sorted(required - set(raw.keys()))
    if missing:
        raise RolloverError("telemetry missing fields: " + ", ".join(missing))
    unknown = sorted(set(raw.keys()) - required)
    if unknown:
        raise RolloverError("telemetry unknown fields: " + ", ".join(unknown))

    used = raw["context_used_units"]
    limit = raw["context_limit_units"]
    for key, value in (("context_used_units", used), ("context_limit_units", limit)):
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise RolloverError(key + " must be a non-negative integer")
    if limit <= 0:
        raise RolloverError("context_limit_units must be greater than zero")
    if used > limit:
        raise RolloverError("context_used_units cannot exceed context_limit_units")
    return {"context_used_units": used, "context_limit_units": limit}


def watch(
    checkpoint: Mapping[str, Any],
    telemetry: Mapping[str, Any],
    *,
    threshold_percent: int = 80,
) -> Dict[str, Any]:
    """Return CONTINUE or atomically-plannable ROLLOVER checkpoint transition.

    The comparison is integer-only: ``used * 100 >= limit * threshold``. Re-reading an
    already ``ROLLOVER_REQUIRED`` checkpoint is idempotent and does not bump generation.
    """
    cp = checkpoint_mod.validate_checkpoint(checkpoint)
    measured = validate_telemetry(telemetry)
    if (
        isinstance(threshold_percent, bool)
        or not isinstance(threshold_percent, int)
        or threshold_percent < 1
        or threshold_percent > 99
    ):
        raise RolloverError("threshold_percent must be an integer in 1..99")

    event = {
        "schema_version": 1,
        "task_id": cp["task_id"],
        "checkpoint_generation": cp["generation"],
        "context_used_units": measured["context_used_units"],
        "context_limit_units": measured["context_limit_units"],
        "threshold_percent": threshold_percent,
    }
    event_sha = _canonical_sha256(event)

    if cp["state"] == "ROLLOVER_REQUIRED":
        return {
            "action": "ROLLOVER",
            "checkpoint": cp,
            "planned_now": False,
            "telemetry_sha256": event_sha,
            "founder_prompt_shuttling": 0,
        }

    should_rollover = (
        measured["context_used_units"] * 100
        >= measured["context_limit_units"] * threshold_percent
    )
    if not should_rollover:
        return {
            "action": "CONTINUE",
            "checkpoint": cp,
            "planned_now": False,
            "telemetry_sha256": event_sha,
            "founder_prompt_shuttling": 0,
        }

    if cp["state"] == "WORKER_FAILED":
        raise RolloverError("failed worker checkpoint must be resolved before rollover")
    if not cp["continuation_ref"]:
        raise RolloverError("rollover requires an existing continuation_ref")

    next_cp = checkpoint_mod.advance(
        cp,
        state="ROLLOVER_REQUIRED",
        continuation_ref=cp["continuation_ref"],
        last_result_sha256=cp["last_result_sha256"],
    )
    return {
        "action": "ROLLOVER",
        "checkpoint": next_cp,
        "planned_now": True,
        "telemetry_sha256": event_sha,
        "founder_prompt_shuttling": 0,
    }


def complete_rollover(
    checkpoint: Mapping[str, Any],
    *,
    expected_old_continuation_ref: str,
    new_continuation_ref: str,
) -> Dict[str, Any]:
    """Record an externally proven session rollover and return READY checkpoint.

    The actual resume/fork is intentionally outside this module. Both old and new refs
    are required so stale/ambiguous completions fail closed. Replaying the same completed
    rollover is idempotent.
    """
    cp = checkpoint_mod.validate_checkpoint(checkpoint)
    if not isinstance(expected_old_continuation_ref, str) or not expected_old_continuation_ref.strip():
        raise RolloverError("expected_old_continuation_ref is required")
    if not isinstance(new_continuation_ref, str) or not new_continuation_ref.strip():
        raise RolloverError("new_continuation_ref is required")
    old_ref = expected_old_continuation_ref.strip()
    new_ref = new_continuation_ref.strip()
    if new_ref == old_ref:
        raise RolloverError("new continuation_ref must differ from old continuation_ref")

    if cp["state"] == "READY" and cp["continuation_ref"] == new_ref:
        return {
            "checkpoint": cp,
            "completed_now": False,
            "founder_prompt_shuttling": 0,
        }
    if cp["state"] != "ROLLOVER_REQUIRED":
        raise RolloverError("complete_rollover requires ROLLOVER_REQUIRED checkpoint")
    if cp["continuation_ref"] != old_ref:
        raise RolloverError("stale rollover: old continuation_ref does not match checkpoint")

    next_cp = checkpoint_mod.advance(
        cp,
        state="READY",
        continuation_ref=new_ref,
        last_result_sha256=cp["last_result_sha256"],
    )
    return {
        "checkpoint": next_cp,
        "completed_now": True,
        "founder_prompt_shuttling": 0,
    }
