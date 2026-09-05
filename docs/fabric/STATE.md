# VOS FABRIC — STATE

Updated: 2026-09-05
Status: CANDIDATE / IMPLEMENTATION ACTIVE

## Live repository baseline

- repository: `lukeeterna/venture-os`
- base branch: `master`
- base exact SHA: `08b97b1342c82049ca17945e00b6a3478dabb7b8`
- implementation branch: `sol/vos-fabric-worker-contract-20260905`

## Canonical runtime direction recovered from latest handoff

- U1 iMac preservation: previously GREEN; must still be regression-checked before
  new runtime work.
- U1 MacBook preservation: previously GREEN.
- iMac is server/data/runtime.
- MacBook Big Sur is console/dev, not the production Codex runtime.
- candidate Codex/Sol worker is isolated Ubuntu x86_64 Multipass `vos-worker`
  ON_DEMAND on iMac.
- Guardian + FLUXION must not regress.
- smartphone-backup volume: general VOS writes DENY.
- automatic spend: DENY (`max_cost_usd = 0`).

## Gate state

- G1 `IMAC_PRODUCTION_BASELINE`: NOT EXECUTED in this GitHub-only continuation.
- G2 `LINUX_CODEX_WORKER`: NOT EXECUTED; requires live iMac + device-auth.
- G3 `VOS_KERNEL_CERTIFIED`: OPEN.
  - current branch adds the first minimum-code slice: generic worker adapter contract.
  - its isolated unit tests must be GREEN before this branch is reviewable.
  - this does not certify the pre-existing VOS kernel exact SHA/runtime by itself.
- G4 `ZERO_PROMPT_SHUTTLING`: BLOCKED on G1-G3.
- G5 `CONTEXT_ROLLOVER`: BLOCKED on G4.

## Current implementation unit

Build and test a generic worker adapter that is:

- deterministic and fail-closed;
- zero-cost only;
- mandatory data-class;
- explicit worker/path/executable allowlists;
- bounded by timeout;
- terminal on worker failure/death;
- content-addressed via stdout/stderr SHA-256;
- explicit that network authorization is upstream VOS authority, not a fake local sandbox.

## Exact next action

1. Review this branch's worker adapter + negative fixtures and require CI GREEN.
2. Execute the latest handoff's G1 read-only iMac production baseline.
3. Only if G1 is GREEN, create/use isolated `vos-worker` and prove official Codex
   device-auth, GPT-5.6 Sol call, exec JSON, exact resume/fork, resources, stop/rollback.
4. Run existing VOS kernel positive/negative fixtures on the exact runtime SHA.
5. Then wire the smallest Sol <-> VOS bridge; do not add CRM/marketing/media infra yet.
