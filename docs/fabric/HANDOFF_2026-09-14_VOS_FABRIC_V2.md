# VOS FABRIC v2 — COMPLETE SESSION HANDOFF

Date: 2026-09-14
Status: DESIGN FREEZE CANDIDATE / RUNTIME CERTIFICATION IN PROGRESS
Authority: Founder -> Sol -> VOS -> replaceable workers
Primary repository: `lukeeterna/venture-os`
Fabric branch: `sol/vos-fabric-worker-contract-20260905`
Review surface: Draft PR #6

## 0. How to use this handoff

This file is the canonical continuation brief for the next Sol session working on the zero-cost enterprise-grade VOS Fabric. Read it before making any repository, machine, network, credential, worker, or runtime decision.

Do not treat research claims in this document as runtime truth unless explicitly marked CERTIFIED. Research findings from Gemini Deep Research and prior Sol web research are design inputs that must be verified against current first-party documentation and then, where applicable, against real-account runtime evidence.

The objective is not merely to make Codex work. The objective is a production-grade, fail-closed, multi-worker software-engineering execution fabric with zero incremental AI/API spend, no single-provider quota blocker, no founder prompt shuttling, deterministic evidence, secure local networking, and a hardware plan that preserves existing iMac production workloads.

## 1. Non-negotiable system invariant

Canonical control chain:

`Founder -> Sol -> VOS -> worker router -> isolated worker -> result -> verifier -> checkpoint -> rollover -> continuation`

Hard invariants:

- VOS is the only authorization/root-of-trust boundary.
- External model workers, gateways, Hermes, Codex, Antigravity, OmniRoute, Groq, Ollama, GitHub Actions, and any future worker are subordinate and replaceable.
- `MAX_COST_USD=0` is a hard policy, not a preference.
- No API-key paid fallback.
- No automatic credit purchase, overage, deposit unlock, or billing-account escalation.
- No quota/rate-limit circumvention, account rotation, identity confusion, credential sharing, or consumer subscription pooling to evade provider limits.
- No fake GREEN. UNKNOWN or contradictory evidence must fail closed.
- No direct production mutation merely because a worker says it succeeded.
- No merge/deploy/irreversible action without the already-defined VOS/founder gate.
- `FOUNDER_PROMPT_SHUTTLING=0` is a required runtime property.
- Guardian, FLUXION, NAS, and unrelated iMac production services must not regress.

## 2. Exact repository state at handoff creation

### venture-os Fabric

Repository: `lukeeterna/venture-os`
Branch: `sol/vos-fabric-worker-contract-20260905`
Draft PR: #6 — `VOS Fabric: repo-certified worker, bridge + rollover package`
Pre-handoff PR head: `17fd193ad969eae201bf0233a77be782db5247fe`
Base: `master` at `08b97b1342c82049ca17945e00b6a3478dabb7b8`

PR #6 already contains:

- generic process worker adapter;
- explicit worker/path/executable allowlists;
- mandatory data class and hard `max_cost_usd == 0`;
- no shell fallback and no inherited caller environment;
- bounded timeout + terminal states;
- stdout/stderr SHA-256 evidence;
- durable monotonic checkpoint contract;
- exactly-once external-effect fingerprints;
- structural VOS -> worker -> checkpoint bridge;
- evidence redaction;
- zero-founder-prompt-shuttle fixtures;
- context rollover with stale-ref/idempotency guards;
- two-worker-turn repo fixture;
- Linux x86_64 Codex qualifier;
- Codex 0.154 forced-stdin deterministic non-TTY handling;
- Python 3.8 + 3.13 CI.

Current Fabric repo evidence before this handoff commit:

- workflow `VOS Fabric Unit`
- run `34778355728`
- exact SHA `17fd193ad969eae201bf0233a77be782db5247fe`
- Python 3.8 SUCCESS
- Python 3.13 SUCCESS
- `ZERO_PROMPT_SHUTTLING_FIXTURE=GREEN`
- `FOUNDER_PROMPT_SHUTTLING_FIXTURE=0`
- `CONTEXT_ROLLOVER_FIXTURE=GREEN`
- `EVIDENCE_REDACTION_FIXTURE=GREEN`
- `INFLIGHT_ROLLOVER_GUARD=GREEN`
- machine-independent E2E worker/checkpoint/rollover fixture GREEN.

### fluxion-desktop machine/runtime evidence

#### G1 — iMac production baseline

REAL GREEN in Draft PR #66.

Known certified evidence:

- exact branch head at certification: `e997d3ac7f0fd64cf5e2731ac942d260f4df7f78`
- workflow run `34774774249`
- successful job `103771574629`
- iMac model `iMac13,1`
- macOS `12.7.4`
- 4 logical CPUs
- 16 GiB RAM
- Guardian PASS
- go2rtc PASS
- MQTT PASS
- FLUXION backend/TCP 3002/`/health` PASS
- FLUXION engine/UDP 5080 PASS
- NAS PASS
- Multipass PASS
- baseline evidence SHA-256 `b4915c84cae63e3b551e1bb42b89f6477e0c5abe5ea96bde5086ac2bd7898d94`
- `IMAC_PRODUCTION_BASELINE=GREEN`.

#### G2 — isolated Linux Codex worker

Repository: `lukeeterna/fluxion-desktop`
Branch: `sol/vos-fabric-g2-worker-20260913`
Draft PR: #70
Current PR head observed at handoff creation: `95e79b8fa64b00dc5f959ddcdfdec151802ea048`

Real facts already proven:

- VM `vos-worker` exists and is owned by `VOS_FABRIC_G2`.
- Ubuntu `22.04.5 LTS`, x86_64.
- 2 vCPU, ~4 GiB RAM, ~30 GiB disk.
- IP `192.168.64.3`.
- iMac Multipass bridge is `192.168.64.1/24`.
- Codex CLI `0.154.0` installed.
- Codex binary SHA-256 `3188814c35471432d4123203e0eb38e5bddc60226e3d7ddf0e59e649ea140022`.
- ChatGPT device auth persisted and is GREEN.
- exact certification model: `gpt-5.6-terra`.
- paid API fallback = 0.
- Guardian/FLUXION/NAS regression observed = 0.
- direct guest NAT is not trusted; an ephemeral iMac bridge-local CONNECT proxy has proven guest -> ChatGPT connectivity without changing PF/firewall/VPN.

Latest certified blocker recorded in PR #70:

- full G2 run `34778416427`
- job `103780817695`
- first authenticated real `codex exec` reaches ChatGPT
- account returned usage-limit exhaustion with reset after 23:05 Europe/Rome on 2026-09-13.

Truthful recorded verdict remains `G2=BLOCKED_QUOTA` until a newer exact run proves otherwise. At handoff creation no newer successful G2 qualification was found on the branch. The next session MUST re-check current GitHub Actions/PR truth before assuming quota is still the blocker.

G2 only becomes GREEN if one exact run proves:

1. ChatGPT auth GREEN;
2. real requested model invocation;
3. `exec --json` GREEN;
4. exact resume on same thread GREEN;
5. exact fork to distinct thread GREEN;
6. real command/tool execution visible in machine-readable evidence;
7. bounded resource evidence;
8. clean stop/start of only `vos-worker`;
9. auth persistence after restart;
10. Guardian/FLUXION/NAS unchanged;
11. no unexpected host mounts;
12. paid fallback = 0.

#### G3 — VOS kernel machine/runtime certification

REAL GREEN in Draft PR #67.

- exact SHA `1f16ab2505480adab67b20411cf0b5819179a2b2`
- workflow `VOS Fabric G3 Kernel Runtime`
- run `34780894842`
- job `103787590649`
- runner MacBook Darwin 20.6.0 x86_64
- iMac production precheck GREEN
- `MACHINES.json` PASS
- VOS apply fixtures 4/4 PASS
- fail-closed kernel fixtures 6/6 PASS
- iMac production postcheck GREEN
- production mutations = 0
- `VOS_KERNEL_CERTIFIED=GREEN`
- `G3=GREEN`.

Do not rerun G1/G3 merely for activity. Re-run only if relevant underlying state changes or evidence has regressed.

#### G4 / G5

Not runtime GREEN yet.

- G4 = real VOS-authorized worker chain proving `FOUNDER_PROMPT_SHUTTLING=0`.
- G5 = real context rollover/resume-or-fork continuation using durable Fabric checkpoints with no duplicated external effect.

Repo fixtures are already GREEN but do not substitute for live model/runtime proof.

## 3. Architecture decision now under design freeze

The working architecture is:

**VOS + Codex direct + Antigravity direct + OmniRoute restricted capacity pool**

Refined target:

```text
Founder / Sol
    |
    v
VOS ROOT POLICY KERNEL
    |
    v
VOS CAPABILITY / WORKER ROUTER
    |
    +--> Tier A1: OpenAI Codex official CLI, direct ChatGPT auth
    |
    +--> Tier A2: Google Antigravity official CLI, direct Google auth
    |
    +--> Tier B candidates: independently certified privacy-compatible zero-cost workers
    |      - Ollama Cloud Free candidate
    |      - other workers only after first-party + runtime qualification
    |
    +--> Tier C: restricted OmniRoute capacity pool
           - generic API/free-model capacity only
           - static VOS allowlist
           - zero-cost hard-stop only
           - no consumer subscription OAuth proxying
           - no authority

All worker results
    -> VOS normalized result schema
    -> deterministic verification/tests/diff/SHA
    -> GitHub Actions independent verification where appropriate
    -> checkpoint
    -> rollover/continuation
```

The crucial credential-domain principle is:

**Subscription-backed frontier workers remain direct official-client integrations. Generic API/free-model capacity may be routed behind a restricted gateway. Do not mix those credential domains unless first-party provider terms explicitly permit it and VOS qualification proves it safe.**

Codex and Antigravity consumer/subscription OAuth credentials must NOT be placed in OmniRoute as part of the production design.

## 4. Gemini Deep Research input — status and synthesis

The founder supplied a Gemini Deep Research report on 2026-09-14. It independently converged on the same high-level design:

- VOS as immutable/out-of-band root of trust;
- direct official Codex and Antigravity CLIs for frontier subscription capacity;
- restricted local gateway for generic zero-cost API capacity;
- hard data-classification routing;
- circuit breakers for exhausted quota;
- strict zero-cost enforcement;
- explicit rejection of credential/account pooling for quota circumvention;
- separate local deterministic lane for secret data;
- prefer highest-availability multi-tier architecture over a single-provider design.

Gemini proposed/mentioned candidates including Codex, Antigravity, Ollama Cloud Free, Groq Free, OpenCode Zen, Kilo Auto Free, OpenRouter Free, Amazon Q Free, Kiro, Qwen, Grok Build, OmniRoute, and CLIProxyAPI.

IMPORTANT: model names, free quotas, privacy claims, ToS assertions, reset cadence, hard-stop behavior, geographic handling, and product status from that report are RESEARCH CLAIMS, not VOS authority. The next session must verify material candidate claims against current first-party documentation before design promotion and then execute live-account qualification where needed.

Gemini's report recommends Architecture 2 / highest-availability multi-tier policy-gated fabric. This is consistent with the current Sol recommendation and is therefore the design candidate to falsify, not blindly accept.

## 5. Worker policy contract to preserve/extend

Every dispatch must preserve the existing Fabric authorization semantics and eventually normalize at least:

### Required mandate fields

- `task_id`
- `base_sha`
- `mandate_sha256`
- `allowed_paths`
- `forbidden_paths`
- `external_effects`
- `network_mode`
- `data_classification`
- `eligible_workers`
- `max_cost_usd` (must equal 0)
- `required_tests`
- `timeout`
- `rollback`
- `authorization_ref`

### Required normalized result fields

- `status`
- `worker`
- `provider`
- `model`
- `request_sha256`
- `mandate_sha256`
- `result_sha256`
- `changed_paths`
- `tests`
- `external_effects`
- `cost_usd`
- `quota_state`
- `data_policy_class`
- `terminal_reason`

Required terminal-state vocabulary should distinguish at minimum:

- `DONE`
- `FAILED`
- `TIMEOUT`
- `BLOCKED_QUOTA`
- `BLOCKED_AUTH`
- `BLOCKED_POLICY`
- `BLOCKED_COST`
- `BLOCKED_DATA_POLICY`
- `WORKER_ERROR`

Do not weaken existing request/checkpoint/rollover schemas merely to accommodate a provider. Prefer provider adapters that normalize into VOS contracts.

## 6. Zero-cost enforcement

Enterprise-grade here means engineering-grade controls and evidence at zero incremental inference cost. It does NOT mean a contractual vendor Enterprise SLA/DPA/indemnity for $0.

Required hard controls:

- `max_cost_usd == 0` in VOS before dispatch.
- No payment-method-dependent account accepted as a guaranteed zero-cost lane unless an independently verified hard spend cap/hard stop makes liability impossible.
- No deposit-unlock or one-time-credit strategy in production routing.
- Unknown billing or unknown quota semantics => ineligible/fail closed.
- Paid model IDs => ineligible.
- Provider overage setting, if available, must be explicitly OFF/NEVER and tested.
- Provider usage exhaustion must trip a circuit breaker rather than cause blind retries.
- No multi-account rotation to evade subscription/provider limits.

Circuit breaker baseline:

- CLOSED: eligible.
- OPEN: skip with zero upstream call until provider-advertised reset/probe window.
- HALF_OPEN: exactly one bounded probe.
- probe success => CLOSED.
- probe quota failure => OPEN with bounded backoff.
- never repeatedly burn scarce free quota proving a known exhausted condition.

## 7. Data-classification routing

Final policy must be supported by first-party data-handling evidence, not marketing assumptions.

### PUBLIC

May use any VOS-certified zero-cost worker whose provider/ToS/cost gates pass.

### INTERNAL

Only workers whose data retention/training behavior is explicitly acceptable for internal source and whose credential/cost semantics are certified.

### CONFIDENTIAL

Only direct official/ZDR-or-equivalent workers whose current first-party policy and account settings have been verified for the actual account/plan. Tier C generic gateways are blocked by default unless specifically promoted by an explicit later policy decision.

### SECRET

No external AI egress. Local deterministic tools only. Credentials, tokens, auth material, secrets, customer data, sensitive DB dumps and equivalent must never be placed in prompts sent to free third-party inference.

The next session must refine this matrix using current first-party evidence. Do not copy Gemini's provider eligibility table into enforcement without verification.

## 8. OmniRoute integration decision

OmniRoute is a subordinate capacity component, not the VOS router authority.

Current upstream examined before this handoff:

- project: `diegosouzapw/OmniRoute`
- observed default branch: `release/v3.8.51`
- observed branch SHA: `152d95108c9c3d557562311ffed63240a511eb31`
- MIT licensed
- large active project with extensive provider/routing/security functionality.

Useful concepts/components observed:

- OpenAI-compatible local gateway;
- quota-aware routing;
- circuit breakers/cooldowns/model lockout;
- `STRICT_ZERO_COST` machinery;
- per-connection free allowance checks;
- multiple routing strategies;
- API/MCP audit concepts;
- encryption-at-rest support;
- large provider catalog.

Known reasons NOT to deploy upstream OmniRoute blindly into production:

1. observed `release/v3.8.51` was base-red / not release-green;
2. open defects existed specifically around Codex/Antigravity/tool-call/session/quota paths;
3. some quota-share behavior is deliberately fail-open when all targets are saturated, which conflicts with VOS hard cost/policy gates;
4. ToS risk flags are advisory in upstream catalog rather than hard routing enforcement;
5. it is substantially heavier than a minimal router and can consume significant RAM/storage over time;
6. its broad functionality creates unnecessary attack surface for the VOS use case.

Required OmniRoute qualification lab gates before any runtime promotion:

- OR-1 exact upstream/fork SHA + supply-chain inventory.
- OR-2 build reproducibility and dependency audit.
- OR-3 `STRICT_ZERO_COST` fail-closed proof.
- OR-4 VOS-owned ToS/data-policy allowlist enforcement.
- OR-5 quota exhaustion -> immediate eligible-next-provider behavior.
- OR-6 function/tool schema translation correctness.
- OR-7 session continuity correctness.
- OR-8 synthetic paid target -> MUST NOT DISPATCH.
- OR-9 unknown quota/billing -> MUST NOT DISPATCH.
- OR-10 restart + credential persistence without secret leakage.
- OR-11 CPU/RAM/disk growth bounded and measured on target hardware.
- OR-12 Guardian/FLUXION/NAS pre/post regression GREEN.
- OR-13 no consumer Codex/Antigravity OAuth credential proxying.
- OR-14 local listener/network exposure constrained to VOS design.

Possible treatment order:

1. first attempt WRAP + STATIC ALLOWLIST around a pinned upstream release;
2. if upstream behavior cannot be made fail-closed externally, use a minimal maintained fork;
3. if OR-3/4/8/9 cannot be proved, reject OmniRoute as runtime and reuse only selected MIT concepts/code after license/provenance review.

Do not install OmniRoute into the existing 4 GiB `vos-worker` merely because it is convenient. Resource isolation must be designed first.

## 9. CLIProxyAPI position

Treat CLIProxyAPI as a research/reference implementation only unless a future independent review overturns this decision with first-party ToS/security evidence.

Do NOT use it to proxy, capture, rotate, cloak, or aggregate Codex/Antigravity/Claude consumer subscription OAuth credentials. Features intended to hide client identity, pool accounts, rotate exhausted credentials, or bypass provider limitations are negative enterprise signals for this project.

No worker/gateway is allowed to solve quota exhaustion by violating provider limits.

## 10. Secure local network architecture — REQUIRED BEFORE FABRIC v2 PRODUCTION

This was explicitly requested by the founder and must not be deferred or forgotten.

### Known physical/logical nodes

#### iMac always-on server

- `iMac13,1`
- macOS `12.7.4`
- 16 GiB RAM
- always-on server role
- production Guardian/go2rtc/MQTT/FLUXION already running
- Multipass 1.12.2+mac / qemu
- NAS mounted
- active Tailscale indicators previously observed
- active X-VPN process previously observed
- host Internet works
- IP forwarding enabled
- macOS application firewall was observed disabled at the G2 diagnostic time
- `bridge100` at `192.168.64.1/24`
- `vos-worker` at `192.168.64.3`.

#### MacBook development machine

- `MacBookPro11,1`
- macOS `11.7.10`
- Dual-Core Intel Core i5
- development/self-hosted-runner role
- not always powered on.

#### NAS

- persistent local storage / preservation target
- must remain outside general untrusted worker write scope.

#### Smartphone

Required role: remote control/approval/monitoring console, not a development runtime and not an authorization root.

### Network design goals

The next session must produce a measured network baseline and an implementation plan covering at least:

1. TRUST ZONES
   - founder control devices: MacBook + smartphone;
   - iMac production host;
   - VOS control plane;
   - disposable/isolated worker VM(s);
   - OmniRoute/generic API capacity zone if adopted;
   - NAS/preservation zone;
   - public Internet/provider egress.

2. REMOTE ACCESS
   - prefer an authenticated private overlay such as Tailscale for smartphone/MacBook control;
   - no public VOS admin port exposure;
   - no router port-forwarding as the default control path;
   - ACLs must separate founder control from worker access;
   - smartphone cannot directly mutate production outside VOS/founder authorization gates.

3. WORKER EGRESS
   - worker network must be deny-by-default where technically practical;
   - permit only provider/GitHub endpoints required by the active mandate;
   - Tier C gateway egress must be restricted to the static provider allowlist;
   - no arbitrary LAN scan/access from model workers;
   - no NAS access unless explicitly required and authorized.

4. HOST BINDINGS
   - internal gateways/admin surfaces bound to loopback or a dedicated private interface;
   - do not expose OmniRoute management UI/PWA remotely;
   - separate control-plane listeners from worker data-plane listeners.

5. VPN/NAT INTERACTION
   - existing Multipass guest NAT failure occurred while Tailscale/X-VPN indicators were present;
   - DO NOT disable Tailscale, X-VPN, PF, firewall or reboot production blindly;
   - first measure route tables, DNS, vmnet/bridge, PF/NAT state where safely accessible, and extension interactions;
   - preserve the current ephemeral CONNECT proxy as a known safe workaround until a better network design is certified.

6. FIREWALL
   - current G2 diagnostics observed macOS application firewall disabled; treat this as an audit item, not an instruction to toggle it immediately;
   - design host/application/network filtering without breaking SIP/FLUXION/Guardian/go2rtc/MQTT/Tailscale;
   - any firewall/PF change requires pre/post production regression evidence and rollback.

7. CREDENTIAL NETWORK BOUNDARY
   - Codex/Antigravity OAuth homes must not be mounted into OmniRoute or generic workers;
   - generic API keys must be scoped to the gateway process and not inherited by unrelated workers;
   - no secrets in workflow logs/evidence.

8. LOGGING/AUDIT
   - log decisions, worker identity, provider/model, quota terminal state, request/result hashes, but never raw secrets;
   - network decisions and gateway failover must be content-addressed where possible.

## 11. Hardware / PC upgrade evaluation — REQUIRED BEFORE CAPACITY EXPANSION

This was explicitly requested by the founder and is part of the Fabric architecture, not an unrelated future task.

### Objective

Determine the most cost-effective safe path for the always-on server and development machine while preserving `0 incremental inference cost` and avoiding unnecessary hardware spend.

### iMac audit

Measure before recommending an upgrade/replacement:

- exact CPU model/cores;
- installed RAM topology and actual upgrade ceiling for `iMac13,1`;
- internal storage type/capacity/SMART/health and free space;
- thermal/load behavior under current Guardian + FLUXION + one worker VM;
- idle/peak RAM pressure and swap;
- Multipass/qemu resource cost;
- OCLP/boot/EFI state and preservation requirements;
- macOS support/security constraints;
- available USB/Thunderbolt/Ethernet paths;
- power/reliability needs for 24/7 service.

Evaluate separately:

A. no-cost configuration optimization;
B. low-cost RAM/SSD upgrade if physically sensible;
C. repurpose existing hardware with Linux/VM role changes;
D. replacement only if evidence shows the old Intel iMac materially blocks reliability/security/capacity.

Do not purchase or recommend replacement hardware merely because a modern machine is faster.

### MacBook audit

Measure:

- CPU/RAM/SSD health and free space;
- current developer workload and GitHub self-hosted runner load;
- macOS 11 compatibility/security/tooling constraints;
- whether a newer OS path is safe/realistic;
- whether it should remain dev-only or take any Fabric control-plane role;
- battery/power reliability if used as an intermittent runner.

The MacBook is NOT an always-on production dependency. Fabric must keep operating when it is offline.

### Resource placement rule

Do not place all of the following in one 4 GiB guest without measurement:

- Codex/Antigravity worker runtime;
- OmniRoute full daemon/dashboard/database;
- Hermes;
- build/test workloads.

Prefer separate processes/VMs or hard resource budgets once actual memory/CPU measurements exist.

## 12. Smartphone control-plane role

Target role:

- view system/worker/gate status;
- receive actionable alerts;
- approve only founder-gated actions;
- trigger predefined VOS operations;
- select countries/cities or other campaign/research scopes for future workloads;
- inspect result/checkpoint summaries.

Not allowed:

- direct worker shell as the normal operating model;
- raw credential storage in an ad-hoc mobile workflow;
- bypass of VOS authorization;
- public unauthenticated dashboard exposure.

Control should traverse the secure private network/control plane defined in section 10.

## 13. Antigravity qualification

Antigravity is the intended second direct frontier worker, but it is NOT yet VOS GREEN.

Next session must verify current first-party facts before install, including:

- current CLI/package/version/install path;
- exact $0 entitlement and reset semantics;
- supported headless/structured-output modes;
- model discovery and exact model IDs available to the account;
- official OAuth/device/browser flow;
- token refresh persistence without repeated founder action;
- explicit paid-overage/credit behavior and whether it can be disabled;
- sandbox/file/shell/network permission controls;
- session continuation/resume/fork semantics;
- data retention/training policy for the actual account/plan;
- current ToS for automated/headless coding use.

Then create an Antigravity qualification gate analogous in spirit to the Codex G2 gate:

- version + binary/package hash;
- auth GREEN;
- real model inference;
- structured JSON/NDJSON evidence;
- resume/continuation proof;
- real bounded tool execution;
- path and command restrictions;
- restart + auth persistence;
- hard zero-cost behavior;
- production pre/post regression;
- no secret leakage.

Only after this may Antigravity become Tier A2 GREEN.

## 14. Other candidate capacity

Candidates such as Ollama Cloud Free, Groq Free, OpenCode free models, Kilo Auto Free, OpenRouter Free, Amazon Q Free, Mistral Free, Grok Build, Kiro, Qwen and others must be assessed under one reusable qualification rubric.

No candidate enters the routing table because it is merely free or popular.

Minimum promotion checks:

- first-party current free entitlement;
- hard stop / zero liability;
- payment method requirement;
- recurring vs promotional quota;
- current data retention/training rules;
- automation/headless support;
- tool/coding capability;
- ToS fit;
- model quality on our representative engineering benchmark;
- terminal quota classification;
- stable provider/model identity;
- live runtime proof;
- resource/network impact.

## 15. Existing local/orchestration components

Hermes remains optional and subordinate. Do not install Hermes to solve the quota problem. The quota/failover policy belongs in the VOS worker router so Hermes itself is replaceable.

If later adopted, Hermes may serve as a persistent daemon/orchestrator only after the VOS authority, worker pool, network, and checkpoint semantics are stable.

The previously prepared Hermes bootstrap package and historical pinned upstream SHA may be consulted, but it is not a prerequisite for G2/G4/G5.

## 16. Immediate next-session sequence

Do this in order unless new evidence invalidates a step:

1. Read this handoff plus `docs/fabric/ARCHITECTURE.md`, `docs/fabric/PACKAGE.md`, `docs/fabric/STATE.md` and current PR #6.
2. Re-fetch current heads/status for venture-os PR #6 and fluxion-desktop PRs #66/#67/#70. Never trust this file for a state that may have changed overnight.
3. Inspect whether any post-quota-reset G2 run exists. If a newer G2 qualifier succeeded, record exact SHA/run/job and do not repeat it. If not, preserve the existing Codex direct lane and diagnose/complete only the still-failing G2 gate without paid fallback.
4. Do NOT rush directly to G4/G5 if doing so would freeze the old single-worker architecture. Extend the design/contracts only as needed so G4/G5 remain valid under replaceable multi-worker routing.
5. Perform the secure local-network + hardware baseline/audit before adding a heavyweight OmniRoute/Hermes deployment to the iMac.
6. Verify Antigravity current first-party facts and design its isolated qualification lane.
7. Define the VOS worker-router registry/policy so Codex direct and Antigravity direct are first-class independent workers and generic gateways are separate credential domains.
8. Define/validate the zero-cost circuit-breaker state contract and data-classification eligibility matrix.
9. Build an OmniRoute lab plan using pinned upstream SHA/release, static provider allowlist and OR-1..OR-14 gates. Do not production-install it yet.
10. Benchmark/qualify at least one independent Tier B/Tier C zero-cost capacity source only after first-party data/cost review.
11. Once G2 and at least the router abstraction are sound, complete real G4 `FOUNDER_PROMPT_SHUTTLING=0` through VOS authority.
12. Complete real G5 checkpoint rollover/resume-or-fork, proving no duplicated external effect.
13. Keep PRs Draft and unmerged until their stated runtime scope is actually certified.

## 17. Explicit do-not-do list

- Do not merge PR #6/#67/#70 just to reduce branch count.
- Do not reset/rewrite unrelated Git history.
- Do not hide historical accidental master commits in fluxion-desktop; tree was restored by compensating commit, history remains factual.
- Do not buy OpenAI/API credits.
- Do not add OpenAI API key fallback.
- Do not bypass provider quota with multiple consumer accounts.
- Do not copy OAuth credentials into third-party gateways by default.
- Do not install OmniRoute latest/unpinned into production.
- Do not rely on OmniRoute dynamic free-tier catalog as VOS authority.
- Do not expose OmniRoute/VOS admin ports publicly.
- Do not disable VPN/firewall/network extensions blindly to repair Multipass NAT.
- Do not restart Guardian/FLUXION/NAS to qualify an AI worker.
- Do not let MacBook availability become a production requirement.
- Do not promote repository fixtures to machine/runtime GREEN.
- Do not use Gemini research claims as proof of current provider policy.

## 18. Definition of the desired Fabric v2 outcome

Target properties:

```text
VOS_AUTHORITY              = 1
WORKER_AUTHORITY           = 0
SINGLE_PROVIDER_BLOCKING   = 0
SINGLE_VENDOR_LOCK_IN      = 0
FOUNDER_PROMPT_SHUTTLING   = 0
AUTOMATIC_PAID_FALLBACK    = 0
MAX_COST_USD               = 0
UNKNOWN_COST_DISPATCH      = 0
UNKNOWN_POLICY_DISPATCH    = 0
SECRET_EXTERNAL_EGRESS     = 0
PRODUCTION_REGRESSION      = 0
DETERMINISTIC_EVIDENCE     = 1
CHECKPOINT_CONTINUATION     = 1
```

A provider quota may reduce available capacity but must not corrupt authority, billing, audit, or checkpoint semantics.

If every zero-cost eligible inference worker is simultaneously exhausted, the correct terminal state is a truthful `BLOCKED_QUOTA`, not a paid fallback and not a policy bypass.

## 19. Research provenance

Research input supplied by founder on 2026-09-14: `Enterprise AI Software-Engineering Execution Architecture and Market Research Study (September 2026)` generated via Gemini Deep Research.

Its executive conclusion supports strict segregation between official subscription CLIs and restricted API gateways, VOS as root of trust, multi-tier failover, and a restricted OmniRoute role. These conclusions are useful design evidence but remain subordinate to current first-party documentation and runtime certification.

## 20. Session completion protocol

At the end of the next substantive session:

- update this handoff or supersede it with a dated successor;
- record exact repo SHAs, PRs, workflow runs/jobs, machine evidence and remaining blockers;
- separate CERTIFIED / RESEARCH / PENDING claims;
- never leave the founder dependent on chat-only context to resume work.
