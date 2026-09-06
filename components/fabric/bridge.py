#!/usr/bin/env python3
"""Structural VOS -> worker -> checkpoint bridge.

This is deliberately not an authorization boundary and does not execute external
effects. It converts an already-authorized VOS dispatch into the generic worker
contract, then consumes the worker's normalized terminal result into a durable
checkpoint. The VOS kernel remains responsible for authenticating/authorizing the
opaque authorization reference.

Python 3.8+; stdlib only.
"""

from __future__ import annotations

import hashlib
import json
import re
from typing import Any, Dict, Mapping, Optional

try:
    from . import checkpoint as checkpoint_mod
    from . import worker_adapter
except ImportError:  # pragma: no cover - direct script/import fallback
    import checkpoint as checkpoint_mod  # type: ignore
    import worker_adapter  # type: ignore


SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
TERMINAL_CHECKPOINT_STATES = frozenset(("WORKER_DONE", "WORKER_FAILED"))


class BridgeError(ValueError):
    """Dispatch/result violates the narrow bridge contract."""


def _canonical_bytes(value: Mapping[str, Any]) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def _sha256(value: Mapping[str, Any]) -> str:
    return hashlib.sha256(_canonical_bytes(value)).hexdigest()


def _sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _request_id(task_id: str, mandate_sha256: str, generation: int) -> str:
    seed = "%s\0%s\0%d" % (task_id, mandate_sha256, generation)
    return "vos-" + hashlib.sha256(seed.encode("utf-8")).hexdigest()[:24]


def _require_authorization_ref(value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        raise BridgeError("vos_authorization_ref is required")
    return value.strip()


def _request_evidence_summary(request: Mapping[str, Any]) -> Dict[str, Any]:
    """Return audit metadata without persisting argv/env/path values or auth material."""
    env = request.get("env", {})
    command = request.get("command", [])
    return {
        "request_id": request["request_id"],
        "mandate_sha256": request["mandate_sha256"],
        "worker_id": request["worker_id"],
        "eligible_worker_count": len(request["eligible_workers"]),
        "data_class": request["data_class"],
        "max_cost_usd": request["max_cost_usd"],
        "network": request["network"],
        "external_effects": request["external_effects"],
        "argv_count": len(command),
        "env_key_count": len(env),
        "allowed_executable_count": len(request["allowed_executables"]),
        "allowed_path_count": len(request["allowed_paths"]),
        "timeout_seconds": request["timeout_seconds"],
    }


def prepare_dispatch(
    checkpoint: Mapping[str, Any],
    worker_spec: Mapping[str, Any],
    *,
    vos_authorization_ref: str,
    continuation_ref: Optional[str] = None,
) -> Dict[str, Any]:
    """Prepare one deterministic worker request from an already-authorized VOS unit.

    The opaque authorization ref is carried only as a digest in persisted evidence.
    This function does not verify its authenticity; that remains the sealed VOS kernel's
    job. Full argv/env/path values remain only in the executable handoff object.
    """
    cp = checkpoint_mod.validate_checkpoint(checkpoint)
    authorization_ref = _require_authorization_ref(vos_authorization_ref)
    if cp["state"] in TERMINAL_CHECKPOINT_STATES:
        raise BridgeError("terminal checkpoint cannot be dispatched again")
    if cp["state"] not in ("READY",):
        raise BridgeError("dispatch requires READY checkpoint")
    if not isinstance(worker_spec, Mapping):
        raise BridgeError("worker_spec must be an object")

    next_generation = cp["generation"] + 1
    request = dict(worker_spec)
    forbidden = {"request_id", "mandate_sha256"}.intersection(request)
    if forbidden:
        raise BridgeError(
            "worker_spec must not override bridge-owned fields: "
            + ", ".join(sorted(forbidden))
        )
    request["request_id"] = _request_id(
        cp["task_id"], cp["mandate_sha256"], next_generation
    )
    request["mandate_sha256"] = cp["mandate_sha256"]

    try:
        normalized_request = worker_adapter.validate_request(request)
    except worker_adapter.PolicyError as exc:
        raise BridgeError("worker request blocked: " + str(exc)) from exc

    next_cp = checkpoint_mod.advance(
        cp,
        state="DISPATCH_READY",
        continuation_ref=continuation_ref,
        last_result_sha256=None,
    )
    if next_cp["generation"] != next_generation:
        raise BridgeError("checkpoint generation did not advance monotonically")

    request_sha = _sha256(normalized_request)
    evidence = {
        "schema_version": 1,
        "task_id": cp["task_id"],
        "base_sha": cp["base_sha"],
        "checkpoint_generation": next_cp["generation"],
        "checkpoint_sha256": checkpoint_mod.checkpoint_digest(next_cp),
        "vos_authorization_ref_sha256": _sha256_text(authorization_ref),
        "worker_request_sha256": request_sha,
        "worker_request_summary": _request_evidence_summary(normalized_request),
        "founder_prompt_shuttling": 0,
    }
    return {
        "worker_request": normalized_request,
        "checkpoint": next_cp,
        "dispatch_sha256": _sha256(evidence),
        "founder_prompt_shuttling": 0,
        "evidence": evidence,
    }


def _validate_worker_result(raw: Mapping[str, Any]) -> Dict[str, Any]:
    if not isinstance(raw, Mapping):
        raise BridgeError("worker_result must be an object")
    required = {
        "schema_version",
        "request_id",
        "mandate_sha256",
        "status",
        "exit_code",
        "duration_ms",
        "stdout_sha256",
        "stderr_sha256",
        "stdout_bytes",
        "stderr_bytes",
        "reason",
    }
    missing = sorted(required - set(raw.keys()))
    if missing:
        raise BridgeError("worker_result missing fields: " + ", ".join(missing))
    unknown = sorted(set(raw.keys()) - required)
    if unknown:
        raise BridgeError("worker_result unknown fields: " + ", ".join(unknown))
    if raw["schema_version"] != 1:
        raise BridgeError("unsupported worker_result schema_version")
    if not isinstance(raw["request_id"], str) or not raw["request_id"]:
        raise BridgeError("worker_result request_id is required")
    mandate = raw["mandate_sha256"]
    if not isinstance(mandate, str) or not SHA256_RE.fullmatch(mandate):
        raise BridgeError("worker_result mandate_sha256 must be SHA-256")
    if raw["status"] not in worker_adapter.TERMINAL_STATUSES:
        raise BridgeError("worker_result status is not terminal")
    for key in ("stdout_sha256", "stderr_sha256"):
        value = raw[key]
        if not isinstance(value, str) or not SHA256_RE.fullmatch(value):
            raise BridgeError(key + " must be SHA-256")
    for key in ("duration_ms", "stdout_bytes", "stderr_bytes"):
        value = raw[key]
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise BridgeError(key + " must be a non-negative integer")
    exit_code = raw["exit_code"]
    if exit_code is not None and (isinstance(exit_code, bool) or not isinstance(exit_code, int)):
        raise BridgeError("exit_code must be null or integer")
    reason = raw["reason"]
    if reason is not None and not isinstance(reason, str):
        raise BridgeError("reason must be null or string")
    return dict(raw)


def consume_result(
    checkpoint: Mapping[str, Any],
    worker_result: Mapping[str, Any],
) -> Dict[str, Any]:
    """Consume a terminal worker result exactly once (same-result replay is idempotent)."""
    cp = checkpoint_mod.validate_checkpoint(checkpoint)
    result = _validate_worker_result(worker_result)
    result_sha = _sha256(result)

    if cp["state"] in TERMINAL_CHECKPOINT_STATES:
        if cp["last_result_sha256"] == result_sha:
            return {
                "checkpoint": cp,
                "result_sha256": result_sha,
                "consumed_now": False,
                "founder_prompt_shuttling": 0,
            }
        raise BridgeError("terminal checkpoint already contains a different result")

    if cp["state"] != "DISPATCH_READY":
        raise BridgeError("worker result requires DISPATCH_READY checkpoint")
    expected_request_id = _request_id(
        cp["task_id"], cp["mandate_sha256"], cp["generation"]
    )
    if result["request_id"] != expected_request_id:
        raise BridgeError("worker_result request_id does not match checkpoint generation")
    if result["mandate_sha256"].lower() != cp["mandate_sha256"]:
        raise BridgeError("worker_result mandate_sha256 does not match checkpoint")

    terminal_state = "WORKER_DONE" if result["status"] == "DONE" else "WORKER_FAILED"
    next_cp = checkpoint_mod.advance(
        cp,
        state=terminal_state,
        continuation_ref=cp["continuation_ref"],
        last_result_sha256=result_sha,
    )
    return {
        "checkpoint": next_cp,
        "result_sha256": result_sha,
        "consumed_now": True,
        "founder_prompt_shuttling": 0,
    }
