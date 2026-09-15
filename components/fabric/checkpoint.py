#!/usr/bin/env python3
"""Durable VOS Fabric checkpoint primitives.

This module is intentionally small and stdlib-only. It does not execute external
effects. It records enough state to resume/fork work without silently duplicating an
external effect. VOS remains the authority that decides whether an effect is allowed.
Python 3.8+.
"""

from __future__ import annotations

import copy
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any, Dict, Mapping, Optional, Tuple

SCHEMA_VERSION = 1


class CheckpointError(ValueError):
    """Checkpoint is invalid or violates monotonic/idempotency rules."""


def _is_sha256(value: Any) -> bool:
    if not isinstance(value, str) or len(value) != 64:
        return False
    try:
        int(value, 16)
    except ValueError:
        return False
    return True


def _canonical_bytes(value: Mapping[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def checkpoint_digest(checkpoint: Mapping[str, Any]) -> str:
    """Return a stable SHA-256 over the normalized checkpoint document."""
    normalized = validate_checkpoint(checkpoint)
    return hashlib.sha256(_canonical_bytes(normalized)).hexdigest()


def new_checkpoint(
    task_id: str,
    mandate_sha256: str,
    base_sha: str,
    *,
    state: str = "READY",
) -> Dict[str, Any]:
    checkpoint = {
        "schema_version": SCHEMA_VERSION,
        "task_id": task_id,
        "mandate_sha256": mandate_sha256.lower() if isinstance(mandate_sha256, str) else mandate_sha256,
        "base_sha": base_sha.lower() if isinstance(base_sha, str) else base_sha,
        "generation": 0,
        "state": state,
        "continuation_ref": None,
        "last_result_sha256": None,
        "effects": {},
    }
    return validate_checkpoint(checkpoint)


def validate_checkpoint(raw: Mapping[str, Any]) -> Dict[str, Any]:
    if not isinstance(raw, Mapping):
        raise CheckpointError("checkpoint must be an object")

    required = (
        "schema_version",
        "task_id",
        "mandate_sha256",
        "base_sha",
        "generation",
        "state",
        "continuation_ref",
        "last_result_sha256",
        "effects",
    )
    missing = [key for key in required if key not in raw]
    if missing:
        raise CheckpointError("missing checkpoint fields: " + ", ".join(missing))
    unknown = sorted(set(raw.keys()) - set(required))
    if unknown:
        raise CheckpointError("unknown checkpoint fields: " + ", ".join(unknown))

    if raw["schema_version"] != SCHEMA_VERSION:
        raise CheckpointError("unsupported schema_version")
    task_id = raw["task_id"]
    if not isinstance(task_id, str) or not task_id.strip():
        raise CheckpointError("task_id is required")
    if not _is_sha256(raw["mandate_sha256"]):
        raise CheckpointError("mandate_sha256 must be SHA-256")
    if not _is_sha256(raw["base_sha"]):
        raise CheckpointError("base_sha must be SHA-256")

    generation = raw["generation"]
    if isinstance(generation, bool) or not isinstance(generation, int) or generation < 0:
        raise CheckpointError("generation must be a non-negative integer")
    state = raw["state"]
    if not isinstance(state, str) or not state.strip():
        raise CheckpointError("state is required")

    continuation_ref = raw["continuation_ref"]
    if continuation_ref is not None and (not isinstance(continuation_ref, str) or not continuation_ref.strip()):
        raise CheckpointError("continuation_ref must be null or a non-empty string")
    last_result = raw["last_result_sha256"]
    if last_result is not None and not _is_sha256(last_result):
        raise CheckpointError("last_result_sha256 must be null or SHA-256")

    effects = raw["effects"]
    if not isinstance(effects, Mapping):
        raise CheckpointError("effects must be an object")
    normalized_effects: Dict[str, str] = {}
    for effect_id, effect_sha in effects.items():
        if not isinstance(effect_id, str) or not effect_id.strip():
            raise CheckpointError("effect ids must be non-empty strings")
        if not _is_sha256(effect_sha):
            raise CheckpointError("effect hashes must be SHA-256")
        normalized_effects[effect_id] = effect_sha.lower()

    return {
        "schema_version": SCHEMA_VERSION,
        "task_id": task_id,
        "mandate_sha256": raw["mandate_sha256"].lower(),
        "base_sha": raw["base_sha"].lower(),
        "generation": generation,
        "state": state,
        "continuation_ref": continuation_ref,
        "last_result_sha256": last_result.lower() if isinstance(last_result, str) else None,
        "effects": dict(sorted(normalized_effects.items())),
    }


def advance(
    checkpoint: Mapping[str, Any],
    *,
    state: str,
    continuation_ref: Optional[str] = None,
    last_result_sha256: Optional[str] = None,
) -> Dict[str, Any]:
    """Create the next monotonic checkpoint generation."""
    current = validate_checkpoint(checkpoint)
    if not isinstance(state, str) or not state.strip():
        raise CheckpointError("state is required")
    if continuation_ref is not None and (not isinstance(continuation_ref, str) or not continuation_ref.strip()):
        raise CheckpointError("continuation_ref must be null or a non-empty string")
    if last_result_sha256 is not None and not _is_sha256(last_result_sha256):
        raise CheckpointError("last_result_sha256 must be null or SHA-256")

    nxt = copy.deepcopy(current)
    nxt["generation"] += 1
    nxt["state"] = state
    nxt["continuation_ref"] = continuation_ref
    nxt["last_result_sha256"] = last_result_sha256.lower() if isinstance(last_result_sha256, str) else None
    return validate_checkpoint(nxt)


def claim_effect(checkpoint: Mapping[str, Any], effect_id: str, effect_sha256: str) -> Tuple[Dict[str, Any], bool]:
    """Record an authorized external-effect fingerprint exactly once.

    Returns (checkpoint, claimed_now). Replaying the same effect id with the same hash
    is safe and returns False. Reusing an effect id for different bytes fails closed.
    This function records intent/evidence only; it does not perform the effect.
    """
    current = validate_checkpoint(checkpoint)
    if not isinstance(effect_id, str) or not effect_id.strip():
        raise CheckpointError("effect_id is required")
    if not _is_sha256(effect_sha256):
        raise CheckpointError("effect_sha256 must be SHA-256")
    effect_sha256 = effect_sha256.lower()

    previous = current["effects"].get(effect_id)
    if previous is not None:
        if previous != effect_sha256:
            raise CheckpointError("effect_id already claimed with a different hash")
        return current, False

    nxt = copy.deepcopy(current)
    nxt["effects"][effect_id] = effect_sha256
    nxt["generation"] += 1
    return validate_checkpoint(nxt), True


def write_atomic(path: Path, checkpoint: Mapping[str, Any]) -> str:
    """Atomically persist a validated checkpoint and return its content digest."""
    normalized = validate_checkpoint(checkpoint)
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(normalized, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    fd, tmp_name = tempfile.mkstemp(prefix=destination.name + ".", suffix=".tmp", dir=str(destination.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_name, str(destination))
    finally:
        try:
            os.unlink(tmp_name)
        except FileNotFoundError:
            pass
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def read_checkpoint(path: Path) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as handle:
        raw = json.load(handle)
    return validate_checkpoint(raw)
