# VOS FABRIC — Plug-and-certify package

Updated: 2026-09-06
Status: REPO-CERTIFIED CANDIDATE PACKAGE. Do not promote runtime gates without exact machine evidence.

## Why this package exists

The founder should not return to the PCs and spend time designing plumbing. The package
contains everything that can be designed and tested away from the machines. What remains
machine-bound is deliberately narrow: live baseline, isolated VM creation, ChatGPT device
authentication if needed, real Codex calls, resource measurements and production
regression checks.

## Included now

### 1. Generic worker contract

- `components/fabric/worker_adapter.py`
- `schemas/fabric/worker-request-v1.schema.json`
- `bin/vos-fabric-worker`
- positive/negative unit fixtures

Properties: zero automatic spend, mandatory data class, explicit worker/path/executable
allowlists, no shell fallback, bounded execution, terminal errors and hashed evidence.
The normalized request preserves the worker eligibility set so a validated handoff may be
revalidated by the actual worker without weakening policy.

### 2. Durable checkpoint / idempotency contract

- `components/fabric/checkpoint.py`
- `schemas/fabric/checkpoint-v1.schema.json`
- `components/fabric/test_checkpoint.py`

A checkpoint has a monotonic generation and preserves task/mandate/base identity.
External effects are fingerprinted by stable `effect_id -> sha256`. Replaying the same
id with the same bytes is a no-op; the same id with different bytes fails closed.
The module records evidence only and never performs an external effect itself.

### 3. Structural VOS -> worker bridge

- `components/fabric/bridge.py`
- `components/fabric/test_bridge.py`

The bridge does not authenticate mandates and does not become a second control plane. It
accepts an opaque `vos_authorization_ref` only after the existing VOS authority has made
the authorization decision. It owns request identity/mandate identity, emits a
deterministic worker request, advances the checkpoint to `DISPATCH_READY`, consumes one
terminal worker result, and records a canonical result SHA-256.

Safety properties proven by fixtures:

- worker cannot override bridge-owned request/mandate identity;
- paid execution is rejected;
- external-effect execution is rejected in this generic lane;
- mismatched result identity is rejected;
- same terminal result replay is idempotent;
- changed replay after terminal state fails closed;
- worker failure becomes a terminal failed checkpoint;
- `FOUNDER_PROMPT_SHUTTLING=0` throughout the fixture.

### 4. Context rollover watcher

- `components/fabric/rollover.py`
- `components/fabric/test_rollover.py`

The watcher has no network access and does not call Codex. It accepts measured context
telemetry and uses integer-only threshold comparison. Default threshold is 80%.

At threshold it requires an existing continuation, advances exactly once to
`ROLLOVER_REQUIRED`, preserves the last result hash, and rejects rollover from a failed
worker state. Completion requires an exact old continuation ref plus a distinct new ref;
stale completion fails closed. Replaying an already completed rollover to the same new
ref is idempotent.

The end-to-end repository fixture proves:

`checkpoint -> bridge -> worker -> result -> threshold -> rollover-required -> new continuation -> bridge -> worker -> result`

with monotonic checkpoint generations, preserved evidence and zero founder prompt shuttle.
The actual Codex resume/fork remains a G2/G5 runtime proof, not something this watcher
pretends to perform.

### 5. Codex worker qualification gate

- `tools/fabric/codex_worker_gate.sh`

Run **inside** the isolated Ubuntu x86_64 `vos-worker`. It has four explicit actions:

- `preflight` — Linux/x86_64/RAM/disk/tooling only;
- `auth-status` — checks the isolated Codex ChatGPT login;
- `device-auth` — the one explicit human authentication gate;
- `qualify` — real `codex exec --json`, exact resume and fork in read-only sandbox,
  hashes the JSONL evidence and records first-run max RSS when GNU time is available.

`qualify` requires `VOS_CODEX_MODEL` instead of silently claiming that a moving default
model equals the required model.

The isolated auth/session root defaults to `$HOME/.codex-vos-fabric`; it does not reuse
the normal user Codex home unless explicitly overridden.

## Upstream contract verified before writing the gate

The gate syntax was checked against OpenAI Codex upstream commit:

`19b62211d9f5999f8d74298f78097e8aeb0e3009`

At that source revision the official CLI exposes:

- `codex login --device-auth`;
- `codex login status`;
- `codex exec --json`;
- `--sandbox read-only`;
- `--model`;
- `--output-last-message`;
- non-interactive `exec resume` and `exec fork`;
- x86_64 Linux standalone release support.

The official README also documents ChatGPT sign-in as the recommended plan-based route
and the official install script / standalone release paths. No API-key fallback is part
of this VOS package.

## Current repository evidence

### G3 portable VOS kernel slice

In `lukeeterna/fluxion-desktop` Draft PR #67:

- exact SHA `84fc8307b420b539b577e112942a9d929a2ff3ae`;
- Actions run `34053242916`;
- Python 3.11 + 3.13 GREEN;
- existing SAFE_AUTO fixtures GREEN;
- wrong mandate SHA, wrong plan HEAD, STOP, timeout, worker failure and result/log hash fixtures GREEN.

Supported verdict: `G3_REPO_FIXTURES=GREEN`.

### G4/G5 Fabric slices

Code snapshot `2c0d1ce721db6528ee09875472159be59b8e3bf7`, Actions run `34053905104`:

- Python 3.8 GREEN;
- Python 3.13 GREEN;
- compile GREEN;
- shell syntax GREEN;
- full worker/checkpoint/bridge/rollover unit discovery GREEN.

Supported repository-only verdicts:

- `ZERO_PROMPT_SHUTTLING_FIXTURE=GREEN`
- `FOUNDER_PROMPT_SHUTTLING_FIXTURE=0`
- `CONTEXT_ROLLOVER_FIXTURE=GREEN`

These fixture verdicts deliberately do not substitute for hardware/runtime gates.

## Machine-bound gates still required

### G1 — iMac production baseline

Must prove current, not historical:

- Guardian process and support services live;
- FLUXION backend/engine and listeners live;
- NAS_LOCAL available;
- disk headroom;
- memory headroom;
- load headroom;
- Multipass healthy;
- no pre-existing ambiguous `vos-worker`.

The read-only workflow is maintained separately in `fluxion-desktop` PR #66. While the
MacBook self-hosted runner is unavailable, G1 remains blocked rather than being inferred.

### G2 — Linux Codex worker

Only after G1 GREEN:

1. create isolated Ubuntu x86_64 `vos-worker` (initial target: 2 vCPU / 4 GB / 40 GB);
2. install the official Codex CLI and record version + binary SHA-256;
3. perform ChatGPT device auth in isolated `CODEX_HOME` if required;
4. set the exact supported model in `VOS_CODEX_MODEL`;
5. run `tools/fabric/codex_worker_gate.sh qualify`;
6. record host resources before/during/after;
7. stop the VM cleanly;
8. prove Guardian + FLUXION still match the baseline.

Only then: `LINUX_CODEX_WORKER=GREEN`.

### G3 — exact VOS kernel runtime

The portable failure matrix is already GREEN, but the enrolled machine/runtime exact-SHA
proof is still required before claiming:

`VOS_KERNEL_CERTIFIED=GREEN`.

### G4 — zero prompt shuttle runtime

The repository fixture is GREEN. The real harmless founder objective must still enter
once and complete through the authorized runtime chain:

`Founder -> Sol -> VOS -> bridge -> worker -> RESULT -> verifier -> terminal`

Required runtime verdicts:

- `FOUNDER_PROMPT_SHUTTLING=0`
- `ZERO_PROMPT_SHUTTLING=GREEN`

### G5 — real context rollover

The deterministic watcher/fixture is GREEN. Runtime must still prove:

measured threshold -> durable checkpoint -> exact real Codex resume or fork -> live-state
revalidation -> continuation without duplicate effect.

Only then: `CONTEXT_ROLLOVER=GREEN`.

## Stop rule

Do not add CRM, marketing, media or another agent framework while G1-G5 runtime gates are
open. Do not convert a queued/skipped/unavailable machine test into GREEN. Do not
auto-spend and do not add paid API fallback.
