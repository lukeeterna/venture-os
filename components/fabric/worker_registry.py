#!/usr/bin/env python3
"""VOS-owned certified worker registry bindings for Fabric v2.

This module does not authorize work and does not call providers.  It binds exact
runtime qualification references and truthful capacity evidence into deterministic
router inputs.  VOS remains the sole authority for requests, state and effects.

Python 3.8+; stdlib only.
"""
from __future__ import annotations

import copy
from typing import Any, Dict, Mapping

try:
    from . import router
except ImportError:
    import router  # type: ignore


DATA_CLASS_PUBLIC = "PUBLIC"
DATA_POLICY_PUBLIC_ONLY = "PUBLIC_ONLY"

CODEX_WORKER_ID = "codex-g2-live"
A2_WORKER_ID = "antigravity-a2-live"

G2_MODEL = "gpt-5.6-terra"
A2_MODEL = "gemini-3.8-flash-high"

G2_QUALIFICATION_REF = (
    "G2=GREEN;run=34964332252;job=certify;"
    "fabric=18752fb147f6700d4dc0633a55b9367d00ef0d91;"
    "head=4d71653fce595c043636f78ae75aafa7f5612435;"
    "runtime_parent_run=34888246045;runtime_parent_job=104321135055"
)

A2_QUALIFICATION_REF = (
    "A2=GREEN;runtime_run=35001277172;runtime_job=104489983602;"
    "runtime_head=404700158ce0effbf79015c43861dc610ea49c09;"
    "fabric_a2=443d285caff4631de6d0f94d3a28cc765f6b914a;"
    "composite_run=35001894829;"
    "composite_head=490bdef15b266c4c21ee6059081a4088bc3cfd05"
)

# Real Codex capacity evidence.  This is the exact Codex-only G4 runtime that
# failed closed at provider capacity after G2 had already been certified GREEN.
# No reset timestamp is encoded here because the provider message is evidence,
# while timezone/reset semantics have not been promoted into the router contract.
# Unknown reset therefore remains fail-closed until separately re-evidenced.
CODEX_CAPACITY_EVIDENCE_REF = (
    "CODEX_CAPACITY=OPEN;run=34964855224;job=104366796337;"
    "head=d57ac910201b8c53168a649f1144485298976e29;"
    "classification=BLOCKED_PROVIDER_CAPACITY"
)

A2_DATA_POLICY_REF = (
    "A2_PUBLIC_ONLY;runtime_run=35001277172;runtime_job=104489983602;"
    "composite_run=35001894829;composite_job=104492019056"
)
G2_DATA_POLICY_REF = "G2_PUBLIC_ONLY;mandate=T-VOS-FABRIC-G4-G5"


class RegistryBindingError(ValueError):
    """Exact certified registry/capacity bindings are malformed."""


def certified_public_registry() -> list:
    """Return a fresh VOS registry containing only certified PUBLIC direct workers."""
    workers = [
        {
            "worker_id": CODEX_WORKER_ID,
            "provider": "openai-chatgpt",
            "model_id": G2_MODEL,
            "kind": "DIRECT_OFFICIAL",
            "credential_domain": "codex-chatgpt-device-auth-g2",
            "qualification_ref": G2_QUALIFICATION_REF,
            "data_policy_ref": G2_DATA_POLICY_REF,
            "data_classes": [DATA_CLASS_PUBLIC],
            "data_policy": DATA_POLICY_PUBLIC_ONLY,
            "network": "VOS_AUTHORIZED",
            "max_cost_usd": 0,
            "zero_cost_hard_stop": True,
            "consumer_oauth_proxy": False,
            "enabled": True,
            "priority": {DATA_CLASS_PUBLIC: 0},
        },
        {
            "worker_id": A2_WORKER_ID,
            "provider": "google-antigravity",
            "model_id": A2_MODEL,
            "kind": "DIRECT_OFFICIAL",
            "credential_domain": "antigravity-google-account-a2",
            "qualification_ref": A2_QUALIFICATION_REF,
            "data_policy_ref": A2_DATA_POLICY_REF,
            "data_classes": [DATA_CLASS_PUBLIC],
            "data_policy": DATA_POLICY_PUBLIC_ONLY,
            "network": "VOS_AUTHORIZED",
            "max_cost_usd": 0,
            "zero_cost_hard_stop": True,
            "consumer_oauth_proxy": False,
            "enabled": True,
            "priority": {DATA_CLASS_PUBLIC: 10},
        },
    ]
    # Fail closed here, before any caller can use this registry as router input.
    return router.validate_registry(workers)


def current_capacity_state() -> Dict[str, Any]:
    """Return VOS-owned breaker state plus its exact evidence binding.

    Codex is OPEN because of a real provider-capacity failure.  A2 is CLOSED
    because its canonical qualification/lifecycle composite is GREEN.  The
    breaker state never causes an upstream call; it only determines eligibility.
    """
    state = {
        "breakers": {
            CODEX_WORKER_ID: {"state": "OPEN", "reset_at": None, "failures": 1},
            A2_WORKER_ID: router.default_breaker(),
        },
        "evidence": {
            CODEX_WORKER_ID: CODEX_CAPACITY_EVIDENCE_REF,
            A2_WORKER_ID: A2_QUALIFICATION_REF,
        },
    }
    for worker_id, raw in state["breakers"].items():
        router.validate_breaker(raw)
        evidence = state["evidence"].get(worker_id)
        if not isinstance(evidence, str) or not evidence.strip():
            raise RegistryBindingError("breaker state requires exact evidence ref")
    if state["breakers"][CODEX_WORKER_ID]["state"] != "OPEN":
        raise RegistryBindingError("Codex capacity state must remain OPEN")
    if state["evidence"][CODEX_WORKER_ID] != CODEX_CAPACITY_EVIDENCE_REF:
        raise RegistryBindingError("Codex OPEN state is not bound to exact capacity evidence")
    return copy.deepcopy(state)


def route_public_request() -> Dict[str, Any]:
    """Route the canonical zero-cost PUBLIC worker set and expose audit bindings."""
    registry = certified_public_registry()
    capacity = current_capacity_state()
    request = {
        "data_class": DATA_CLASS_PUBLIC,
        "eligible_workers": [CODEX_WORKER_ID, A2_WORKER_ID],
        "max_cost_usd": 0,
    }
    decision = router.route_request(request, registry, capacity["breakers"])
    if decision.get("status") != "ROUTE":
        raise RegistryBindingError("canonical PUBLIC route failed closed: %s" % decision.get("reason"))
    worker = decision.get("worker")
    if not isinstance(worker, Mapping):
        raise RegistryBindingError("router returned no worker")
    if worker.get("worker_id") != A2_WORKER_ID:
        raise RegistryBindingError("Codex OPEN must deterministically route PUBLIC work to A2")
    if worker.get("qualification_ref") != A2_QUALIFICATION_REF:
        raise RegistryBindingError("selected A2 worker lost exact qualification binding")
    if worker.get("data_policy") != DATA_POLICY_PUBLIC_ONLY:
        raise RegistryBindingError("A2 data policy ceiling must remain PUBLIC_ONLY")
    return {
        "request": request,
        "decision": decision,
        "capacity": capacity,
    }


__all__ = [
    "A2_DATA_POLICY_REF",
    "A2_MODEL",
    "A2_QUALIFICATION_REF",
    "A2_WORKER_ID",
    "CODEX_CAPACITY_EVIDENCE_REF",
    "CODEX_WORKER_ID",
    "G2_MODEL",
    "G2_QUALIFICATION_REF",
    "RegistryBindingError",
    "certified_public_registry",
    "current_capacity_state",
    "route_public_request",
]
