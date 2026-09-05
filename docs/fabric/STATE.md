# VOS FABRIC — STATE

Updated: 2026-09-05
Status: CANDIDATE / PLUG-AND-CERTIFY PACKAGE ACTIVE

## Live repository baseline

- repository: `lukeeterna/venture-os`
- base branch: `master`
- base exact SHA: `08b97b1342c82049ca17945e00b6a3478dabb7b8`
- implementation branch: `sol/vos-fabric-worker-contract-20260905`
- review surface: PR #6 (Draft)

## Canonical runtime direction

- U1 iMac preservation: previously GREEN; must still be regression-checked before new runtime work.
- U1 MacBook preservation: previously GREEN.
- iMac is server/data/runtime.
- MacBook Big Sur is console/dev, not the production Codex runtime.
- candidate Codex/Sol worker is isolated Ubuntu x86_64 Multipass `vos-worker` ON_DEMAND on iMac.
- Guardian + FLUXION must not regress.
- smartphone-backup volume: general VOS writes DENY.
- automatic spend: DENY (`max_cost_usd = 0`).

## Package state

Prepared and statically testable without the physical PCs:

1. generic worker adapter + request schema + stable CLI;
2. fail-closed worker/path/executable/cost/data-class/timeout gates;
3. durable monotonic checkpoint contract;
4. external-effect fingerprint/idempotency guard;
5. Codex G2 qualification script using official CLI commands;
6. exact resume/fork JSONL evidence path;
7. package/runbook documentation;
8. Python 3.8 + 3.13 CI and shell syntax gate.

See `docs/fabric/PACKAGE.md`.

## Gate state

- G1 `IMAC_PRODUCTION_BASELINE`: EXECUTION PENDING on `fluxion-desktop` PR #66 / self-hosted MacBook runner.
- G2 `LINUX_CODEX_WORKER`: PACKAGE READY / RUNTIME BLOCKED ON G1 + possible device-auth.
- G3 `VOS_KERNEL_CERTIFIED`: PACKAGE READY / RUNTIME CERTIFICATION OPEN.
- G4 `ZERO_PROMPT_SHUTTLING`: DESIGN BOUNDED / BLOCKED ON G1-G3.
- G5 `CONTEXT_ROLLOVER`: CHECKPOINT + IDEMPOTENCY PRIMITIVES IMPLEMENTED / end-to-end runtime proof blocked on G4.

None of these labels is a runtime GREEN until exact machine evidence exists.

## Current authority boundary

`Founder -> Sol -> existing VOS authority/policy -> typed worker adapter -> replaceable worker`

The new Fabric code does not create a second authority. `network=VOS_AUTHORIZED` is a structural reference only; VOS must authenticate/authorize it. The checkpoint module records external-effect fingerprints but never executes external effects.

## Exact next action when the PC lane is available

1. Let PR #66 execute the read-only iMac G1 baseline and require a real GREEN.
2. Only if G1 is GREEN, create/use isolated `vos-worker` (initial target 2 vCPU / 4 GB / 40 GB).
3. Install official Codex CLI; record version and binary SHA-256.
4. Use isolated `$HOME/.codex-vos-fabric`; perform `codex login --device-auth` only if `codex login status` is not GREEN.
5. Resolve the exact supported model name and export it as `VOS_CODEX_MODEL`.
6. Run `tools/fabric/codex_worker_gate.sh qualify` and preserve JSONL/hash/resource evidence.
7. Stop the VM and prove Guardian + FLUXION did not regress.
8. Run exact-SHA VOS positive/negative fixtures plus Fabric unit tests.
9. Only then execute one harmless zero-shuttle fixture and rollover/idempotency fixture.

Do not add CRM/marketing/media infrastructure before these gates.
