#!/usr/bin/env python3
"""
VOS Fabric generic process worker adapter.

Thin, deterministic and stdlib-only:
- does not choose a worker;
- does not call an LLM by itself;
- is NOT the VOS authorization boundary;
- executes only an absolute executable explicitly allowlisted by the request;
- executes inside an explicitly allowed cwd;
- never uses shell=True;
- never silently inherits the caller environment;
- always emits a terminal normalized result.

The sealed VOS kernel remains responsible for authenticating/authorizing the mandate
and for any network sandbox/authorization. Python 3.8+.
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Mapping, Sequence


DATA_CLASSES = frozenset(("PUBLIC", "INTERNAL", "CONFIDENTIAL", "SECRET"))
NETWORK_MODES = frozenset(("NONE", "VOS_AUTHORIZED"))
TERMINAL_STATUSES = frozenset(("DONE", "FAILED", "TIMEOUT", "BLOCKED", "WORKER_ERROR"))


class PolicyError(ValueError):
    """Request is structurally ineligible for this deliberately narrow worker lane."""


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _is_sha256(value: Any) -> bool:
    if not isinstance(value, str) or len(value) != 64:
        return False
    try:
        int(value, 16)
    except ValueError:
        return False
    return True


def _is_within(path: Path, roots: Sequence[Path]) -> bool:
    path_s = str(path)
    for root in roots:
        try:
            if os.path.commonpath((path_s, str(root))) == str(root):
                return True
        except ValueError:
            continue
    return False


def validate_request(raw: Mapping[str, Any]) -> Dict[str, Any]:
    """Validate and normalize one already-authorized worker request."""
    if not isinstance(raw, Mapping):
        raise PolicyError("request must be a JSON object")

    request_id = raw.get("request_id")
    if not isinstance(request_id, str) or not request_id.strip():
        raise PolicyError("request_id is required")

    mandate_sha256 = raw.get("mandate_sha256")
    if not _is_sha256(mandate_sha256):
        raise PolicyError("mandate_sha256 must be a 64-character hexadecimal SHA-256")

    worker_id = raw.get("worker_id")
    eligible_workers = raw.get("eligible_workers")
    if not isinstance(worker_id, str) or not worker_id.strip():
        raise PolicyError("worker_id is required")
    if (
        not isinstance(eligible_workers, list)
        or not eligible_workers
        or any(not isinstance(x, str) or not x for x in eligible_workers)
    ):
        raise PolicyError("eligible_workers must be a non-empty string array")
    if worker_id not in eligible_workers:
        raise PolicyError("worker_id is not eligible")

    data_class = raw.get("data_class")
    if data_class not in DATA_CLASSES:
        raise PolicyError("data_class must be one of: " + ", ".join(sorted(DATA_CLASSES)))

    max_cost_usd = raw.get("max_cost_usd")
    if isinstance(max_cost_usd, bool) or not isinstance(max_cost_usd, (int, float)):
        raise PolicyError("max_cost_usd must be numeric")
    if float(max_cost_usd) != 0.0:
        raise PolicyError("automatic paid execution is forbidden: max_cost_usd must equal 0")

    network = raw.get("network", "NONE")
    if network not in NETWORK_MODES:
        raise PolicyError("network must be NONE or VOS_AUTHORIZED")
    network_authorization_ref = raw.get("network_authorization_ref")
    if network == "VOS_AUTHORIZED":
        if not isinstance(network_authorization_ref, str) or not network_authorization_ref.strip():
            raise PolicyError("VOS_AUTHORIZED network requires network_authorization_ref")
    elif network_authorization_ref is not None:
        raise PolicyError("network_authorization_ref is only valid with VOS_AUTHORIZED network")

    if raw.get("external_effects", False) is not False:
        raise PolicyError("external_effects must be false for the generic process worker")

    command = raw.get("command")
    if (
        not isinstance(command, list)
        or not command
        or any(not isinstance(x, str) or x == "" for x in command)
    ):
        raise PolicyError("command must be a non-empty argv string array")
    executable = Path(command[0]).expanduser()
    if not executable.is_absolute():
        raise PolicyError("command[0] must be an absolute executable path")
    executable = executable.resolve()

    allowed_executables = raw.get("allowed_executables")
    if (
        not isinstance(allowed_executables, list)
        or not allowed_executables
        or any(not isinstance(x, str) or not x for x in allowed_executables)
    ):
        raise PolicyError("allowed_executables must be a non-empty string array")
    normalized_executables = [str(Path(x).expanduser().resolve()) for x in allowed_executables]
    if str(executable) not in normalized_executables:
        raise PolicyError("command executable is outside allowed_executables")

    allowed_paths = raw.get("allowed_paths")
    if (
        not isinstance(allowed_paths, list)
        or not allowed_paths
        or any(not isinstance(x, str) or not x for x in allowed_paths)
    ):
        raise PolicyError("allowed_paths must be a non-empty string array")

    roots: List[Path] = [Path(x).expanduser().resolve() for x in allowed_paths]
    cwd_raw = raw.get("cwd")
    if not isinstance(cwd_raw, str) or not cwd_raw:
        raise PolicyError("cwd is required")
    cwd = Path(cwd_raw).expanduser().resolve()
    if not cwd.is_dir():
        raise PolicyError("cwd must exist and be a directory")
    if not _is_within(cwd, roots):
        raise PolicyError("cwd is outside allowed_paths")

    timeout_seconds = raw.get("timeout_seconds", 300)
    if (
        isinstance(timeout_seconds, bool)
        or not isinstance(timeout_seconds, (int, float))
        or timeout_seconds <= 0
        or timeout_seconds > 3600
    ):
        raise PolicyError("timeout_seconds must be >0 and <=3600")

    env = raw.get("env", {})
    if not isinstance(env, Mapping):
        raise PolicyError("env must be an object")
    normalized_env: Dict[str, str] = {}
    for key, value in env.items():
        if not isinstance(key, str) or not key:
            raise PolicyError("env keys must be non-empty strings")
        if not isinstance(value, str):
            raise PolicyError("env values must be strings")
        normalized_env[key] = value

    normalized_command = list(command)
    normalized_command[0] = str(executable)
    return {
        "request_id": request_id,
        "mandate_sha256": mandate_sha256.lower(),
        "worker_id": worker_id,
        "data_class": data_class,
        "max_cost_usd": 0.0,
        "network": network,
        "network_authorization_ref": network_authorization_ref,
        "external_effects": False,
        "command": normalized_command,
        "allowed_executables": normalized_executables,
        "allowed_paths": [str(p) for p in roots],
        "cwd": str(cwd),
        "timeout_seconds": float(timeout_seconds),
        "env": normalized_env,
    }


def blocked_result(request_id: Any, mandate_sha256: Any, reason: str) -> Dict[str, Any]:
    rid = request_id if isinstance(request_id, str) and request_id else "UNKNOWN"
    msh = mandate_sha256 if _is_sha256(mandate_sha256) else None
    return {
        "schema_version": 1,
        "request_id": rid,
        "mandate_sha256": msh,
        "status": "BLOCKED",
        "exit_code": None,
        "duration_ms": 0,
        "stdout_sha256": _sha256(b""),
        "stderr_sha256": _sha256(b""),
        "stdout_bytes": 0,
        "stderr_bytes": 0,
        "reason": reason,
    }


def run_request(raw: Mapping[str, Any]) -> Dict[str, Any]:
    """Execute an eligible process and return one normalized terminal result."""
    try:
        req = validate_request(raw)
    except PolicyError as exc:
        if isinstance(raw, Mapping):
            return blocked_result(raw.get("request_id"), raw.get("mandate_sha256"), str(exc))
        return blocked_result(None, None, str(exc))

    started = time.monotonic()

    try:
        completed = subprocess.run(
            req["command"],
            cwd=req["cwd"],
            env=req["env"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=req["timeout_seconds"],
            check=False,
            shell=False,
        )
        stdout = completed.stdout or b""
        stderr = completed.stderr or b""
        status = "DONE" if completed.returncode == 0 else "FAILED"
        reason = None
        exit_code = completed.returncode
    except subprocess.TimeoutExpired as exc:
        stdout = exc.stdout or b""
        stderr = exc.stderr or b""
        status = "TIMEOUT"
        reason = "worker exceeded timeout_seconds"
        exit_code = None
    except OSError as exc:
        stdout = b""
        stderr = str(exc).encode("utf-8", errors="replace")
        status = "WORKER_ERROR"
        reason = "worker process could not start"
        exit_code = None

    result = {
        "schema_version": 1,
        "request_id": req["request_id"],
        "mandate_sha256": req["mandate_sha256"],
        "status": status,
        "exit_code": exit_code,
        "duration_ms": int((time.monotonic() - started) * 1000),
        "stdout_sha256": _sha256(stdout),
        "stderr_sha256": _sha256(stderr),
        "stdout_bytes": len(stdout),
        "stderr_bytes": len(stderr),
        "reason": reason,
    }
    assert result["status"] in TERMINAL_STATUSES
    return result


def main(argv: Sequence[str]) -> int:
    if len(argv) != 2:
        print("usage: worker_adapter.py <request.json>", file=sys.stderr)
        return 64
    try:
        with open(argv[1], "r", encoding="utf-8") as fh:
            raw = json.load(fh)
    except (OSError, ValueError) as exc:
        result = blocked_result("UNKNOWN", None, "invalid request file: " + str(exc))
        print(json.dumps(result, sort_keys=True))
        return 2

    result = run_request(raw)
    print(json.dumps(result, sort_keys=True))
    return 0 if result["status"] == "DONE" else 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
