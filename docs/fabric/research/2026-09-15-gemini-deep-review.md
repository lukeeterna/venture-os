# VOS Fabric — Gemini Deep Research Review / Falsification

Date: 2026-09-15
Status: REVIEWED RESEARCH INPUT; only claims explicitly promoted below may influence architecture. Runtime qualification remains mandatory for worker promotion.

Source reviewed: user-supplied report `Enterprise Architectural Blueprint for Venture OS Fabric: Zero-Cost Autonomous Multi-Agent Engineering Systems`.

## 1. Executive verdict

The Gemini report contributes a useful architectural thesis: VOS must own durable state, treat provider exhaustion as an operational routing state, combine direct official workers with deterministic local/GitHub execution, and retain a local minimum-capability lane.

It is **not** accepted as an executable production design. Several recommendations contradict the already-established VOS invariants (`MAX_COST_USD=0`, no paid fallback, no account rotation/quota circumvention, credential-domain isolation, four data classes, fail-closed evidence).

Canonical rule: Gemini research is an evidence/candidate source, never authority. First-party documentation, exact-account state, repository certification, and runtime evidence supersede it.

## 2. Promoted architectural ideas

The following concepts are accepted directionally, subject to implementation evidence:

- State belongs to VOS, not to any cloud worker.
- Quota exhaustion is a routable worker-capacity state, not a reason to lose task state.
- Direct official CLI workers should be independent credential/quota domains.
- Deterministic build/test/lint/evidence work should be offloaded from AI inference to GitHub Actions and local runners.
- A local baseline must remain available when every cloud AI source is unavailable.
- Provider diversity should be measured by independent failure domains, not provider count.
- External effects require idempotency/exactly-once protection through the VOS ledger.

## 3. Rejected Gemini recommendations

### 3.1 Antigravity credit/API fallback — REJECTED

Gemini proposed configurations equivalent to:

- `useG1Credits=true`
- `modelProvider=gemini`
- direct `GEMINI_API_KEY`

for continuity after included Antigravity quota.

This directly violates the A2 contract. Current Google documentation states that enabling `useG1Credits` permits personal AI credits to be consumed after included quota. VOS therefore requires `useG1Credits=false`, removes an explicit Gemini API provider override, forbids `GEMINI_API_KEY` / `GOOGLE_API_KEY`, and fails closed when included capacity is unavailable.

Decision: Antigravity A2 remains **DIRECT_OFFICIAL account OAuth**, hard-zero-cost, no API fallback.

### 3.2 Multi-account round-robin / quota pooling — REJECTED

Gemini proposes multi-account credential pooling to maximize free throughput. VOS explicitly forbids account rotation or other quota circumvention.

Decision: one independently authorized credential domain is a capacity domain; when exhausted it transitions to a circuit-breaker state and is skipped until a legitimate reset/probe window.

### 3.3 OmniRoute as production control plane — REJECTED FOR NOW

Gemini places OmniRoute at the heart of VOS and recommends immediate deployment. Existing Sol first-party research found unresolved upstream/release/provider concerns and semantics that do not yet satisfy VOS static allowlists, OAuth boundaries, and fail-closed zero-cost enforcement.

Decision: OmniRoute remains LAB/REFERENCE only. VOS root authority and router remain local/deterministic. Selected gateway concepts may be reused only after OR-qualification gates pass.

### 3.4 Three data classes — REJECTED

Gemini collapses security into Public / Internal / Critical. The canonical VOS model remains four tiers:

1. `PUBLIC`
2. `INTERNAL`
3. `CONFIDENTIAL`
4. `SECRET`

Unknown retention/privacy eligibility fails closed. `SECRET` never leaves explicitly certified local boundaries.

### 3.5 Global Node.js 24 floor — NOT PROMOTED

The report prescribes Node.js 24 globally and attributes unrelated native-module/proxy defects to that choice. This is not supported as a universal VOS architectural requirement.

Decision: runtime versions are project-specific and must be validated by each repository's compatibility/test gates.

### 3.6 Codex reset/cache workarounds — REJECTED

The report discusses saved resets/cache purges as remedies for rate-limit errors. Current VOS evidence independently proved a real OpenAI provider usage-limit condition. VOS will not reset-farm, rotate accounts, buy credits, or classify a real quota condition as local cache corruption without evidence.

## 4. Provider findings after first-party recheck

### 4.1 Mistral Vibe Free — QUALIFY NEXT

First-party Mistral documentation currently supports:

- browser sign-in with a Mistral account for normal Mistral-provider use;
- Free mode;
- one plan shared across Vibe / Studio / API;
- pay-as-you-go OFF by default;
- with PAYG off, Vibe can stop after included monthly usage rather than bill additional usage;
- local/offline model compatibility.

Decision: strong next direct-worker candidate after A2/G4/G5. Qualification must prove account plan, PAYG off, headless automation, bounded execution, workspace tools, session continuity, and data-class eligibility. Start PUBLIC-only.

### 4.2 Kiro Free — QUALIFY LOW-VOLUME

First-party Kiro pricing currently describes a perpetual $0 Free tier with 50 credits and no add-on credits on Free.

Decision: independent low-volume capacity domain. No automatic upgrade. Qualify after higher-value direct/API lanes.

### 4.3 Cloudflare Workers AI Free — QUALIFY PUBLIC API LANE

Current Cloudflare documentation states:

- 10,000 Neurons/day free allocation;
- reset at 00:00 UTC;
- Workers Free cannot exceed the allocation without upgrading; further operations fail;
- some resource-intensive models require Workers Paid and return 403;
- prepaid/Unified Billing paths exist and are forbidden for the VOS free lane.

Decision: useful PUBLIC-only hard-boundary API candidate with a static Free-plan model allowlist and Unified Billing absent/off.

### 4.4 Gemini Developer API Free — PUBLIC/SANITIZED ONLY

Selected Gemini Developer API models have a Free tier, but current free-tier data-use terms are unsuitable for proprietary/secret workloads without a stronger account-specific policy basis.

Decision: keep separate from Antigravity account OAuth. Never use Gemini API-key access as A2 fallback. PUBLIC/SANITIZED only if independently qualified.

### 4.5 OpenRouter Free — OPPORTUNISTIC PUBLIC ONLY

Current Free plan provides a limited free-model pool and daily request allowance. Increasing allowance by deposits/top-ups is outside the zero-incremental-spend policy.

Decision: burst diversity only; never continuity authority.

### 4.6 Cerebras — HOLD / TRIAL, NOT DURABLE FREE

Current Cerebras corporate pricing presents a $5 Free Trial followed by paid Developer access. This conflicts with older/other documentation that may describe free rate limits.

Decision: do not count Cerebras as recurring zero-cost production capacity unless future first-party/account evidence proves a durable Free tier.

## 5. Hardware claims

Gemini assumes Ivy Bridge/Haswell capabilities and assigns exact 1.5B / 3B–4B model ceilings. These remain hypotheses until the physical machines are inventoried and benchmarked.

Required before promotion:

- exact CPU model/flags;
- RAM and memory pressure under production load;
- OS/runtime compatibility;
- llama.cpp/Ollama executable ISA checks;
- measured cold start, RSS, tokens/sec, p50/p95 latency, thermals;
- coexistence with existing iMac services.

No exact model-size ceiling or compiler flag is canonical before those measurements.

## 6. Canonical architecture delta after review

```text
VOS ROOT AUTHORITY
  -> durable task/checkpoint/effect ledger owned by VOS
  -> deterministic policy router
       -> A1 Codex DIRECT_OFFICIAL, quota-bounded
       -> A2 Antigravity DIRECT_OFFICIAL, quota-bounded
       -> next independently certified zero-cost workers/APIs
       -> PUBLIC-only opportunistic free pools
       -> local deterministic / minimum-intelligence lane
  -> normalized result
  -> deterministic verification
  -> checkpoint
  -> resume / fork / rollover
```

No provider/gateway owns authorization, state, billing decisions, or the effect ledger.

If every eligible zero-cost AI worker is unavailable, VOS persists the task as `WORKER_CAPACITY_UNAVAILABLE` / appropriate breaker state, continues deterministic work where possible, and resumes after legitimate capacity recovery. It never silently becomes paid.

## 7. Current qualification order

1. Finish Antigravity A2 direct-official runtime qualification.
2. Prove real G4 routing with Codex breaker OPEN and A2 selected, founder prompt shuttling = 0.
3. Prove G5 checkpoint/rollover across worker/process boundary with duplicate external effects = 0.
4. Mistral Vibe Free direct account lane with PAYG OFF.
5. OpenCode + Groq Free PUBLIC lane.
6. Cloudflare Workers AI Free PUBLIC lane.
7. Kiro Free low-volume lane.
8. OpenRouter Free opportunistic PUBLIC lane.
9. Gemini Developer API Free PUBLIC/SANITIZED lane.
10. Cerebras only after durable recurring-free status is re-proven.
11. OmniRoute production eligibility only after an explicit independent gateway qualification program.

## 8. Non-negotiable invariants

- `MAX_COST_USD=0`
- `PAID_API_FALLBACK=0`
- no credit purchase/top-up
- no account rotation/quota circumvention
- no unofficial OAuth proxy substitution for direct-official credential domains
- four data classes remain canonical
- state/checkpoints/effect ledger belong to VOS
- exact-SHA/run/job evidence before GREEN
- unknown privacy/billing/runtime state fails closed
- production services remain immutable unless a separate explicit mandate authorizes mutation

This review supersedes the raw Gemini report as an architecture input. It does not supersede historical runtime evidence or repository certification records.