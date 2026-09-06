# VOS FABRIC — STATE

Updated: 2026-09-06
Status: CANDIDATE / REPO-CERTIFIED PLUG-AND-CERTIFY PACKAGE

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

Implemented and covered by GitHub-hosted CI without requiring the physical PCs:

1. generic worker adapter + request schema + stable CLI;
2. fail-closed worker/path/executable/cost/data-class/timeout gates;
3. durable monotonic checkpoint contract;
4. external-effect fingerprint/idempotency guard;
5. structural VOS -> worker -> checkpoint bridge;
6. deterministic zero-founder-shuttle fixture;
7. context rollover watcher with stale-ref/idempotency guards;
8. two-worker-turn rollover fixture with monotonic generations and continuation transfer;
9. Codex G2 qualification script using official CLI commands;
10. exact resume/fork JSONL evidence path;
11. package/runbook documentation;
12. Python 3.8 + 3.13 CI and shell syntax gate.

See `docs/fabric/PACKAGE.md`.

## Repo-certification evidence

### VOS kernel portable fixtures (G3 repo slice)

Repository: `lukeeterna/fluxion-desktop`

- Draft PR: #67 `VOS Fabric G3: portable fail-closed kernel certification`
- exact SHA: `84fc8307b420b539b577e112942a9d929a2ff3ae`
- Actions run: `34053242916`
- Python 3.11: GREEN
- Python 3.13: GREEN
- existing executor fixtures: GREEN
- wrong mandate SHA / wrong plan HEAD / STOP / timeout / worker failure / result-log hash fixtures: GREEN

Supported verdict: `G3_REPO_FIXTURES=GREEN`.

This is not full machine/runtime G3 certification.

### Fabric bridge + rollover fixtures (G4/G5 repo slices)

Repository: `lukeeterna/venture-os`

Code snapshot before this evidence-document update:

- exact SHA: `2c0d1ce721db6528ee09875472159be59b8e3bf7`
- Actions run: `34053905104`
- Python 3.8: GREEN
- Python 3.13: GREEN
- compile: GREEN
- shell syntax: GREEN
- worker/checkpoint/bridge/rollover unit suite: GREEN

Supported repo-only verdicts:

- `ZERO_PROMPT_SHUTTLING_FIXTURE=GREEN`
- `FOUNDER_PROMPT_SHUTTLING_FIXTURE=0`
- `CONTEXT_ROLLOVER_FIXTURE=GREEN`

The rollover fixture proves two worker turns across an 80% threshold transition, durable checkpoint generations, exact old/new continuation matching, idempotent replay and zero founder prompt transport. It does not claim a real Codex session rollover until G2 exists.

## Gate state

- G1 `IMAC_PRODUCTION_BASELINE`: BLOCKED — MacBook/self-hosted runner currently unavailable; read-only lane is prepared in `fluxion-desktop` PR #66.
- G2 `LINUX_CODEX_WORKER`: PACKAGE READY / RUNTIME BLOCKED ON G1 + possible device-auth.
- G3 `VOS_KERNEL_CERTIFIED`: `G3_REPO_FIXTURES=GREEN`; machine/runtime exact-SHA proof still OPEN.
- G4 `ZERO_PROMPT_SHUTTLING`: `ZERO_PROMPT_SHUTTLING_FIXTURE=GREEN`, `FOUNDER_PROMPT_SHUTTLING_FIXTURE=0`; runtime proof blocked on G1-G3.
- G5 `CONTEXT_ROLLOVER`: `CONTEXT_ROLLOVER_FIXTURE=GREEN`; real Codex resume/fork proof blocked on G2/G4 runtime.

No unavailable, queued or simulated machine gate is promoted to runtime GREEN.

## Current authority boundary

`Founder -> Sol -> existing VOS authority/policy -> structural bridge -> typed worker adapter -> replaceable worker`

The new Fabric code does not create a second authority. `vos_authorization_ref` and `network=VOS_AUTHORIZED` are structural evidence references only; VOS must authenticate/authorize them. The checkpoint and rollover modules record/transition evidence but never execute an external effect or a Codex session action themselves.

## Exact next action when the PC lane is available

1. Let PR #66 execute the read-only iMac G1 baseline and require a real GREEN.
2. Only if G1 is GREEN, create/use isolated `vos-worker` (initial target 2 vCPU / 4 GB / 40 GB).
3. Install official Codex CLI; record version and binary SHA-256.
4. Use isolated `$HOME/.codex-vos-fabric`; perform `codex login --device-auth` only if `codex login status` is not GREEN.
5. Resolve the exact supported model name and export it as `VOS_CODEX_MODEL`.
6. Run `tools/fabric/codex_worker_gate.sh qualify` and preserve JSONL/hash/resource evidence.
7. Stop the VM and prove Guardian + FLUXION did not regress.
8. Run exact-SHA VOS machine/runtime fixtures; require full G3 GREEN.
9. Execute the already-tested bridge fixture against the real authorized worker; require `FOUNDER_PROMPT_SHUTTLING=0`.
10. Drive the real Codex session to the rollover threshold and prove exact resume/fork into the next continuation with no duplicated effect.

Do not add CRM/marketing/media infrastructure before these gates.
