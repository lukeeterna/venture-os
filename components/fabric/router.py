#!/usr/bin/env python3
"""Deterministic VOS Fabric worker router and quota circuit breaker.

This module is policy plumbing, not an authorization boundary and not a provider
client. It selects only among already-registered workers whose qualification,
data-policy and zero-cost evidence has been recorded by VOS.

Python 3.8+; stdlib only.
"""
from __future__ import annotations

from typing import Any, Dict, List, Mapping, Optional, Sequence, Tuple

DATA_CLASSES = frozenset(("PUBLIC", "INTERNAL", "CONFIDENTIAL", "SECRET"))
WORKER_KINDS = frozenset(("DIRECT_OFFICIAL", "LOCAL_DETERMINISTIC", "RESTRICTED_GATEWAY"))
DATA_POLICIES = frozenset(("PUBLIC_ONLY", "NO_TRAINING", "ZDR", "LOCAL_ONLY"))
NETWORK_MODES = frozenset(("NONE", "VOS_AUTHORIZED"))
BREAKER_STATES = frozenset(("CLOSED", "OPEN", "HALF_OPEN"))
BREAKER_EVENTS = frozenset(("SUCCESS", "QUOTA", "PROBE_WINDOW"))
ROUTE_STATUSES = frozenset((
    "ROUTE",
    "BLOCKED_POLICY",
    "BLOCKED_COST",
    "BLOCKED_DATA_POLICY",
    "BLOCKED_QUOTA",
))


class RouterPolicyError(ValueError):
    """Static registry/breaker state is malformed and must fail closed."""


def _nonempty_string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise RouterPolicyError(field + " must be a non-empty string")
    return value.strip()


def _zero_cost(value: Any) -> bool:
    return not isinstance(value, bool) and isinstance(value, (int, float)) and float(value) == 0.0


def _data_policy_allows(worker: Mapping[str, Any], data_class: str) -> bool:
    if data_class not in worker["data_classes"]:
        return False
    policy = worker["data_policy"]
    if data_class == "PUBLIC":
        return True
    if data_class == "INTERNAL":
        return policy in ("NO_TRAINING", "ZDR", "LOCAL_ONLY")
    if data_class == "CONFIDENTIAL":
        return policy in ("ZDR", "LOCAL_ONLY")
    if data_class == "SECRET":
        return (
            worker["kind"] == "LOCAL_DETERMINISTIC"
            and policy == "LOCAL_ONLY"
            and worker["network"] == "NONE"
        )
    return False


def validate_worker(raw: Mapping[str, Any]) -> Dict[str, Any]:
    if not isinstance(raw, Mapping):
        raise RouterPolicyError("worker must be an object")

    worker_id = _nonempty_string(raw.get("worker_id"), "worker_id")
    provider = _nonempty_string(raw.get("provider"), "provider")
    model_id = _nonempty_string(raw.get("model_id"), "model_id")
    kind = raw.get("kind")
    if kind not in WORKER_KINDS:
        raise RouterPolicyError("kind is not supported")
    credential_domain = _nonempty_string(raw.get("credential_domain"), "credential_domain")
    qualification_ref = _nonempty_string(raw.get("qualification_ref"), "qualification_ref")
    data_policy_ref = _nonempty_string(raw.get("data_policy_ref"), "data_policy_ref")

    data_classes = raw.get("data_classes")
    if (
        not isinstance(data_classes, list)
        or not data_classes
        or any(x not in DATA_CLASSES for x in data_classes)
        or len(set(data_classes)) != len(data_classes)
    ):
        raise RouterPolicyError("data_classes must be a non-empty unique subset of known classes")

    data_policy = raw.get("data_policy")
    if data_policy not in DATA_POLICIES:
        raise RouterPolicyError("data_policy is not supported")

    network = raw.get("network")
    if network not in NETWORK_MODES:
        raise RouterPolicyError("network is not supported")

    if not _zero_cost(raw.get("max_cost_usd")):
        raise RouterPolicyError("worker max_cost_usd must equal 0")
    if raw.get("zero_cost_hard_stop") is not True:
        raise RouterPolicyError("worker requires independently evidenced zero_cost_hard_stop=true")
    if raw.get("consumer_oauth_proxy") is not False:
        raise RouterPolicyError("consumer OAuth proxying is forbidden")

    enabled = raw.get("enabled")
    if not isinstance(enabled, bool):
        raise RouterPolicyError("enabled must be boolean")

    priority = raw.get("priority")
    if not isinstance(priority, Mapping):
        raise RouterPolicyError("priority must be an object")
    normalized_priority: Dict[str, int] = {}
    for data_class in data_classes:
        value = priority.get(data_class)
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise RouterPolicyError("priority must provide a non-negative integer for every data class")
        normalized_priority[data_class] = value

    if kind == "LOCAL_DETERMINISTIC":
        if network != "NONE" or data_policy != "LOCAL_ONLY":
            raise RouterPolicyError("LOCAL_DETERMINISTIC must be LOCAL_ONLY with network NONE")
    elif data_policy == "LOCAL_ONLY":
        raise RouterPolicyError("only LOCAL_DETERMINISTIC may claim LOCAL_ONLY")

    if kind == "RESTRICTED_GATEWAY" and data_policy == "ZDR":
        raise RouterPolicyError("RESTRICTED_GATEWAY may not self-assert ZDR")

    normalized = {
        "worker_id": worker_id,
        "provider": provider,
        "model_id": model_id,
        "kind": kind,
        "credential_domain": credential_domain,
        "qualification_ref": qualification_ref,
        "data_policy_ref": data_policy_ref,
        "data_classes": list(data_classes),
        "data_policy": data_policy,
        "network": network,
        "max_cost_usd": 0.0,
        "zero_cost_hard_stop": True,
        "consumer_oauth_proxy": False,
        "enabled": enabled,
        "priority": normalized_priority,
    }

    for data_class in data_classes:
        if not _data_policy_allows(normalized, data_class):
            raise RouterPolicyError(
                "worker data policy is incompatible with declared data class " + data_class
            )
    return normalized


def validate_registry(raw: Sequence[Mapping[str, Any]]) -> List[Dict[str, Any]]:
    if isinstance(raw, (str, bytes)) or not isinstance(raw, Sequence) or not raw:
        raise RouterPolicyError("registry must be a non-empty array")
    workers = [validate_worker(item) for item in raw]
    worker_ids = [x["worker_id"] for x in workers]
    if len(worker_ids) != len(set(worker_ids)):
        raise RouterPolicyError("worker_id values must be unique")
    credential_domains = [x["credential_domain"] for x in workers]
    if len(credential_domains) != len(set(credential_domains)):
        raise RouterPolicyError("credential domains must be isolated per registered worker")
    return workers


def default_breaker() -> Dict[str, Any]:
    return {"state": "CLOSED", "reset_at": None, "failures": 0}


def validate_breaker(raw: Mapping[str, Any]) -> Dict[str, Any]:
    if not isinstance(raw, Mapping):
        raise RouterPolicyError("breaker must be an object")
    state = raw.get("state")
    if state not in BREAKER_STATES:
        raise RouterPolicyError("unknown breaker state")
    reset_at = raw.get("reset_at")
    if reset_at is not None and (
        isinstance(reset_at, bool) or not isinstance(reset_at, (int, float)) or reset_at < 0
    ):
        raise RouterPolicyError("reset_at must be null or a non-negative unix timestamp")
    failures = raw.get("failures", 0)
    if isinstance(failures, bool) or not isinstance(failures, int) or failures < 0:
        raise RouterPolicyError("failures must be a non-negative integer")
    if state == "HALF_OPEN" and reset_at is None:
        raise RouterPolicyError("HALF_OPEN requires a known reset_at")
    return {"state": state, "reset_at": reset_at, "failures": failures}


def transition_breaker(
    raw: Mapping[str, Any],
    event: str,
    *,
    now: float,
    reset_at: Optional[float] = None,
) -> Dict[str, Any]:
    breaker = validate_breaker(raw)
    if event not in BREAKER_EVENTS:
        raise RouterPolicyError("unknown breaker event")
    if isinstance(now, bool) or not isinstance(now, (int, float)) or now < 0:
        raise RouterPolicyError("now must be a non-negative timestamp")

    if event == "SUCCESS":
        return default_breaker()

    if event == "QUOTA":
        if reset_at is not None and (
            isinstance(reset_at, bool) or not isinstance(reset_at, (int, float)) or reset_at < now
        ):
            raise RouterPolicyError("quota reset_at must be null or >= now")
        return {
            "state": "OPEN",
            "reset_at": reset_at,
            "failures": breaker["failures"] + 1,
        }

    if breaker["state"] != "OPEN":
        raise RouterPolicyError("PROBE_WINDOW requires OPEN breaker")
    if breaker["reset_at"] is None:
        raise RouterPolicyError("unknown quota reset remains fail-closed")
    if now < breaker["reset_at"]:
        raise RouterPolicyError("probe window has not been reached")
    return {
        "state": "HALF_OPEN",
        "reset_at": breaker["reset_at"],
        "failures": breaker["failures"],
    }


def _decision(status: str, reason: str, worker: Optional[Mapping[str, Any]] = None) -> Dict[str, Any]:
    result: Dict[str, Any] = {"status": status, "reason": reason}
    if worker is not None:
        result["worker"] = dict(worker)
    if status not in ROUTE_STATUSES:
        raise AssertionError("non-terminal router status")
    return result


def route_request(
    request: Mapping[str, Any],
    registry: Sequence[Mapping[str, Any]],
    breakers: Mapping[str, Mapping[str, Any]],
    *,
    probe: bool = False,
) -> Dict[str, Any]:
    """Select a worker without making an upstream call.

    Unknown, contradictory or unevidenced state fails closed.
    """
    if not isinstance(request, Mapping):
        return _decision("BLOCKED_POLICY", "request must be an object")
    if not _zero_cost(request.get("max_cost_usd")):
        return _decision("BLOCKED_COST", "max_cost_usd must equal 0")

    data_class = request.get("data_class")
    if data_class not in DATA_CLASSES:
        return _decision("BLOCKED_POLICY", "unknown data_class")

    eligible_workers = request.get("eligible_workers")
    if (
        not isinstance(eligible_workers, list)
        or not eligible_workers
        or any(not isinstance(x, str) or not x for x in eligible_workers)
        or len(set(eligible_workers)) != len(eligible_workers)
    ):
        return _decision("BLOCKED_POLICY", "eligible_workers must be a non-empty unique string array")

    try:
        workers = validate_registry(registry)
    except RouterPolicyError as exc:
        return _decision("BLOCKED_POLICY", "registry invalid: " + str(exc))

    registry_ids = {worker["worker_id"] for worker in workers}
    unknown = sorted(set(eligible_workers) - registry_ids)
    if unknown:
        return _decision("BLOCKED_POLICY", "eligible worker is not registered: " + unknown[0])

    selected_scope = [worker for worker in workers if worker["worker_id"] in eligible_workers]
    enabled = [worker for worker in selected_scope if worker["enabled"]]
    if not enabled:
        return _decision("BLOCKED_POLICY", "no enabled eligible worker")

    data_eligible = [worker for worker in enabled if _data_policy_allows(worker, data_class)]
    if not data_eligible:
        return _decision("BLOCKED_DATA_POLICY", "no eligible worker satisfies data policy")

    routable: List[Tuple[int, str, Dict[str, Any]]] = []
    quota_blocked = False
    for worker in data_eligible:
        raw_breaker = breakers.get(worker["worker_id"], default_breaker())
        try:
            breaker = validate_breaker(raw_breaker)
        except RouterPolicyError as exc:
            return _decision(
                "BLOCKED_POLICY",
                "breaker invalid for %s: %s" % (worker["worker_id"], exc),
            )
        state = breaker["state"]
        if state == "OPEN":
            quota_blocked = True
            continue
        if state == "HALF_OPEN" and not probe:
            quota_blocked = True
            continue
        routable.append((worker["priority"][data_class], worker["worker_id"], worker))

    if not routable:
        if quota_blocked:
            return _decision("BLOCKED_QUOTA", "all data-eligible workers are quota-blocked")
        return _decision("BLOCKED_POLICY", "no routable worker")

    routable.sort(key=lambda item: (item[0], item[1]))
    worker = routable[0][2]
    return _decision("ROUTE", "deterministic eligible worker selected", worker)


__all__ = [
    "RouterPolicyError",
    "default_breaker",
    "route_request",
    "transition_breaker",
    "validate_breaker",
    "validate_registry",
    "validate_worker",
]
