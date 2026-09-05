# VOS FABRIC — Plug-and-certify package

Updated: 2026-09-05
Status: CANDIDATE PACKAGE. Do not promote runtime gates without exact evidence.

## Why this package exists

The founder should not return to the PCs and spend time designing plumbing. The package
contains everything that can be designed and statically tested away from the machines.
What remains machine-bound is deliberately narrow: live baseline, VM creation, ChatGPT
device authentication, real Codex calls, resource measurements and regression checks.

## Included now

### 1. Generic worker contract

- `components/fabric/worker_adapter.py`
- `schemas/fabric/worker-request-v1.schema.json`
- `bin/vos-fabric-worker`
- positive/negative unit fixtures

Properties: zero automatic spend, mandatory data class, explicit worker/path/executable
allowlists, no shell fallback, bounded execution, terminal errors and hashed evidence.

### 2. Rollover / idempotency contract

- `components/fabric/checkpoint.py`
- `schemas/fabric/checkpoint-v1.schema.json`
- `components/fabric/test_checkpoint.py`

A checkpoint has a monotonic generation and preserves task/mandate/base identity.
External effects are fingerprinted by stable `effect_id -> sha256`. Replaying the same
id with the same bytes is a no-op; the same id with different bytes fails closed.
The module records evidence only and never performs an external effect itself.

### 3. Codex worker qualification gate

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

The read-only workflow is maintained separately in `fluxion-desktop` PR #66.

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

### G3 — exact VOS kernel

On one exact SHA, run the pre-existing VOS authorization/execution fixtures plus this
package's unit tests. Mandatory negative cases remain:

- wrong base SHA;
- wrong mandate SHA;
- forbidden path;
- STOP active;
- timeout;
- worker death/failure;
- result hash mismatch;
- duplicate external-effect id with changed bytes.

Only then: `VOS_KERNEL_CERTIFIED=GREEN`.

### G4 — zero prompt shuttle

One harmless founder objective enters once and completes:

`Founder -> Sol -> VOS -> worker -> RESULT -> Sol -> verifier -> terminal`

Required:

- `FOUNDER_PROMPT_SHUTTLING=0`
- `ZERO_PROMPT_SHUTTLING=GREEN`

### G5 — rollover

Threshold -> durable checkpoint -> exact resume or fork -> live-state revalidation ->
continue. Re-running the fixture must not duplicate an external effect.

Required: `CONTEXT_ROLLOVER=GREEN`.

## Stop rule

Do not add CRM, marketing, media or another agent framework while G1-G5 are open.
Do not convert a queued/skipped/unavailable machine test into GREEN.
Do not auto-spend and do not add paid API fallback.
