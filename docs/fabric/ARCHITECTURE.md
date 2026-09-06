# VOS FABRIC — Architecture (candidate)

Status: CANDIDATE. Repository/runtime evidence wins over chat prose.

## Authority boundary

FOUNDER -> Sol -> existing VOS authority/policy -> typed worker adapter -> replaceable worker.

This directory does **not** create a second control plane. Existing VOS remains the
root of trust. The generic worker adapter is defense-in-depth and result normalization;
it does not authenticate a mandate and must not be exposed as an independent authority.

## First code slice

`components/fabric/worker_adapter.py` is deliberately narrow:

- stdlib-only, Python 3.8+;
- argv execution only (`shell=False`);
- absolute executable + explicit executable allowlist;
- explicit worker eligibility and mandatory data classification;
- hard `max_cost_usd == 0`;
- cwd must resolve under an allowlisted path;
- no silent inheritance of the caller environment;
- bounded timeout and terminal normalized statuses;
- SHA-256 evidence for stdout/stderr without returning raw output by default;
- external effects are rejected in this generic lane.

`network=VOS_AUTHORIZED` is only a structural handoff field. It is **not** a network
sandbox and is accepted only with a VOS authorization reference. The sealed VOS kernel
must authenticate/authorize that reference. Provider-specific runtime isolation belongs
to its own certified adapter; do not weaken or misrepresent this generic component.

## Node candidate

- iMac: server/data/runtime; isolated on-demand Ubuntu `vos-worker` after production
  baseline is GREEN.
- MacBook Big Sur: console/dev; not the production Codex worker.
- Guardian + FLUXION: protected production dependencies; regression is a hard stop.
- smartphone-backup disk: general VOS writes DENY.
- NAS_LOCAL: preservation/backup target.

## Promotion gates

1. `IMAC_PRODUCTION_BASELINE=GREEN`
2. `LINUX_CODEX_WORKER=GREEN`
3. `VOS_KERNEL_CERTIFIED=GREEN`
4. `ZERO_PROMPT_SHUTTLING=GREEN`
5. `CONTEXT_ROLLOVER=GREEN`

No architecture is OFFICIAL before the relevant exact-SHA/runtime evidence is recorded.
