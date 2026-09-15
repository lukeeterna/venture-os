# VOS Fabric v2 — LATEST CANONICAL HANDOFF

`CANONICAL_LATEST_HANDOFF: true`

Date: 2026-09-15
Status: **A2 DIRECT_OFFICIAL ANTIGRAVITY GREEN; G4/G5 NEXT**
Supersedes for continuation purposes: `docs/fabric/HANDOFF_2026-09-14_VOS_FABRIC_V2.md`.
The historical handoff remains evidence and must not be deleted.

## 1. Continuation rule

A future Sol/ChatGPT session MUST read this file first, then the Gemini review named below, then verify live GitHub state before taking action. Do not reconstruct the project from chat memory and do not repeat already-certified A2 inference experiments unless an exact requalification reason exists.

Canonical authority order:

1. founder mandate and VOS invariants;
2. exact repository/runtime evidence;
3. this latest handoff;
4. reviewed first-party research;
5. raw external research only as non-authoritative input.

## 2. Non-negotiable invariants

- `MAX_COST_USD=0`
- `PAID_API_FALLBACK=0`
- no credit purchase or top-up
- no account rotation or quota circumvention
- no unofficial OAuth proxy substitution for a DIRECT_OFFICIAL credential domain
- four data classes remain canonical: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `SECRET`
- state, checkpoints and exactly-once effect ledger belong to VOS
- unknown privacy/billing/runtime eligibility fails closed
- exact SHA/run/job evidence is required before any GREEN
- Guardian / FLUXION / NAS / telephony / DB / firewall / VPN remain immutable unless a separate explicit mandate authorizes mutation
- founder prompt/result shuttling target remains zero

## 3. Stable Fabric package / PR #6

Repository: `lukeeterna/venture-os`
PR: `#6` — `VOS Fabric: repo-certified worker, bridge + rollover package`
Branch: `sol/vos-fabric-worker-contract-20260905`
Current package head: `18752fb147f6700d4dc0633a55b9367d00ef0d91`
PR remains Draft.

G3 kernel runtime remains real GREEN at:
- SHA `1f16ab2505480adab67b20411cf0b5819179a2b2`
- run `34780894842`
- job `103787590649`

## 4. G2 Codex DIRECT_OFFICIAL — certified but currently quota-bounded

Repository: `lukeeterna/fluxion-desktop`
PR: `#70`
Branch: `sol/vos-fabric-g2-worker-20260913`
Head: `4d71653fce595c043636f78ae75aafa7f5612435`

Canonical G2 composite:
- run `34964332252`
- job `104365115820`
- runtime parent run `34888246045`
- runtime parent job `104321135055`
- source thread `01a0a453-c93a-71c0-a3b9-3a579a7510b1`

Qualification ref:

`G2=GREEN;run=34964332252;job=certify;fabric=18752fb147f6700d4dc0633a55b9367d00ef0d91;head=4d71653fce595c043636f78ae75aafa7f5612435;runtime_parent_run=34888246045;runtime_parent_job=104321135055`

A later live probe independently proved a real provider usage limit. Latest known provider message said capacity could be retried after **2026-09-20 10:01 AM** as returned by the provider. No credits were bought and no API-key fallback was used.

Architectural implication: Codex remains an eligible high-value worker, never the only continuity dependency.

## 5. A2 Antigravity DIRECT_OFFICIAL — FULL GREEN

### 5.1 Repositories and branches

VOS/A2 gate repository: `lukeeterna/venture-os`
Branch: `sol/vos-fabric-antigravity-a2-20260915`
Exact A2 gate commit:
`443d285caff4631de6d0f94d3a28cc765f6b914a`
Commit intent: bind tool proof to the exact workspace path.

Runtime repository: `lukeeterna/fluxion-desktop`
PR: `#74`
Branch: `sol/vos-fabric-a2-antigravity-runtime-20260915`
Composite head:
`490bdef15b266c4c21ee6059081a4088bc3cfd05`

### 5.2 Official worker identity

- Antigravity CLI: `1.2.3`
- official package SHA-256: `57afb34f2a4be9296beb477e600761b6ac7401eb3a54a64a0014d573b7fc3af4`
- installed binary SHA-256: `c4c8a6722f9b570e370941b0953ba29051336307d7999ec842bdf7500b0ca7c8`
- A2 gate SHA-256: `38b8cabbf3a660fcbf697365a9652d9f8aeb070daa35140280739fdbcd443237`
- selected real model: `gemini-3.8-flash-high`
- isolated worker: Multipass `vos-worker`, Ubuntu x86_64, owner marker `VOS_FABRIC_G2`
- guest IP observed: `192.168.64.3`
- bridge: `192.168.64.1`
- host mounts forbidden and rechecked before/after lifecycle

### 5.3 Real runtime-core evidence

Core run:
- workflow run `35001277172`
- job `104489983602`
- head `404700158ce0effbf79015c43861dc610ea49c09`

The workflow as a whole was red only because its post-restart helper had been placed in `/tmp`, which does not survive VM stop/start. The exact runtime core before that lifecycle-only defect proved:

- `ANTIGRAVITY_VERSION=1.2.3`
- `ANTIGRAVITY_BINARY_SHA256=c4c8a6722f9b570e370941b0953ba29051336307d7999ec842bdf7500b0ca7c8`
- `ANTIGRAVITY_MODEL_REQUESTED=gemini-3.8-flash-high`
- `ANTIGRAVITY_CONVERSATION_ID=a3ff795f-838f-4bdd-aba8-335e5d4c1d4c`
- `ANTIGRAVITY_TOOL_NAMES=write_to_file,view_file`
- first-events SHA-256 `6907bbf506de35666d373cad39848eadbac3b8150026c35b5cbf39b51b711811`
- resume-events SHA-256 `041c9b20b06c09691cd08cc703f48ead9437ddd4ee8cd86d3c2a7b275f1cd21b`
- first-run max RSS `235852 KiB`
- real exact-workspace write/read tool effect
- structured output GREEN
- exact conversation resume GREEN
- headless JSON GREEN
- sandbox requested GREEN
- API-key fallback `0`
- Antigravity credit fallback `0`
- production pre/post qualification GREEN
- bounded clean stop GREEN

### 5.4 Composite/lifecycle certification

Canonical A2 composite:
- workflow: `VOS Fabric A2 Antigravity Composite`
- run `35001894829`
- job `104492019056`
- composite head `490bdef15b266c4c21ee6059081a4088bc3cfd05`
- conclusion: **SUCCESS**

The composite first re-read and revalidated the exact core run/job markers above, including the expected core-workflow failure class `POST_RESTART_TMP_HELPER_LOSS`, then performed a fresh bounded lifecycle without another model inference turn.

Lifecycle evidence:

- `A2_COMPOSITE_PRE_PRODUCTION=GREEN`
- `A2_COMPOSITE_STOP_CLI_RC=0`
- `A2_COMPOSITE_STOP_STATE=GREEN`
- `A2_COMPOSITE_START_CLI_RC=124`
- `A2_COMPOSITE_START_STATE=GREEN`
- start CLI timeout is not treated as success by itself; independent VM state proved `Running`
- owner/architecture/no-host-mount boundary revalidated after restart
- OAuth/account state persisted across restart
- `agy models` worked after restart through a fresh guest-only CONNECT:443 proxy
- `useG1Credits=false` was reasserted and verified after the post-restart metadata call
- explicit Gemini API provider override remained absent
- `A2_AUTH_PERSISTENCE_AFTER_RESTART=GREEN`
- `A2_ZERO_COST_AFTER_RESTART=GREEN`
- `A2_COMPOSITE_POST_RESTART_PRODUCTION=GREEN`
- `A2_RUNTIME_CORE=GREEN`
- `A2_LIFECYCLE=GREEN`
- `A2=GREEN`
- `PAID_API_FALLBACK=0`
- `ANTIGRAVITY_CREDIT_FALLBACK=0`
- `PRODUCTION_MUTATIONS=0`

Canonical A2 qualification ref:

`A2=GREEN;runtime_run=35001277172;runtime_job=104489983602;runtime_head=404700158ce0effbf79015c43861dc610ea49c09;fabric_a2=443d285caff4631de6d0f94d3a28cc765f6b914a;composite_run=35001894829;composite_head=490bdef15b266c4c21ee6059081a4088bc3cfd05`

Do not rerun the A2 inference qualification merely to obtain a monolithic all-green job. The split exact-core + bounded-lifecycle composite is the canonical certification, analogous to the already accepted split G2 design.

Current A2 default data-policy ceiling remains `PUBLIC` until stronger first-party/account-specific evidence is separately certified.

## 6. G4/G5 truthful state

Repository: `lukeeterna/fluxion-desktop`
PR: `#71`
Branch: `sol/vos-fabric-g4-g5-runtime-20260914`
Current recorded head: `d57ac910201b8c53168a649f1144485298976e29`
Mandate SHA-256: `9a7785af557da76405dfd2b28f9a9b481603f51a8e6bd77057132722a36ad46c`

Repo/router contract is GREEN for the earlier Codex-only PUBLIC route.
Canonical real runtime attempt:
- run `34964855224`
- job `104366796337`

That runtime correctly failed closed at G4 stage1 because the exact G2 Codex worker was provider-capacity blocked.

Therefore, as of this handoff:

- historical PR71 repo certification: GREEN
- historical Codex-only real G4 runtime: BLOCKED_PROVIDER_CAPACITY
- G4 durable checkpoint: **not yet certified GREEN**
- G5 rollover/exactly-once: **not yet executed/certified GREEN**
- no false G4/G5 GREEN exists

## 7. Gemini Deep Research — reviewed, not copied blindly

Canonical reviewed research input:
`docs/fabric/research/2026-09-15-gemini-deep-review.md`

The raw Gemini report is not architecture authority.

Promoted directionally:
- VOS owns durable state/checkpoint/effect ledger
- provider exhaustion is a circuit-breaker/routing state
- independent credential/provider failure domains create continuity
- deterministic build/test/evidence work should avoid inference where possible
- a local minimum-capability lane remains necessary

Explicitly rejected:
- `useG1Credits=true`
- `modelProvider=gemini` as Antigravity fallback
- `GEMINI_API_KEY` / paid-capable API fallback for A2
- multi-account round-robin / quota pooling
- account rotation or quota evasion
- immediate OmniRoute promotion to VOS control plane
- collapsing the four VOS data classes to three
- treating cache/reset tricks as a remedy for a proven provider quota

Candidate qualification order after G4/G5:
1. Mistral Vibe Free with PAYG OFF
2. OpenCode + Groq Free PUBLIC lane
3. Cloudflare Workers AI Free PUBLIC lane
4. Kiro Free low-volume lane
5. OpenRouter Free opportunistic PUBLIC lane
6. Gemini Developer API Free PUBLIC/SANITIZED only and never as A2 fallback
7. Cerebras only if recurring durable free status is re-proven
8. OmniRoute production eligibility only after a separate gateway qualification program

## 8. Exact next engineering action

A2 is complete. The next session must NOT spend time recertifying A2 unless live state has materially changed.

Next objective:

**prove real multi-worker G4, then G5, using the newly certified A2 as the zero-cost automatic route when Codex is breaker-OPEN / quota-blocked.**

Required sequence:

1. Verify current GitHub heads/runs for PRs `#70`, `#71`, `#74` and `venture-os #6` before writing.
2. Register/bind the exact A2 qualification ref in the VOS worker/router contract without replacing VOS as root authority.
3. Preserve data class `PUBLIC` for A2.
4. Make the Codex capacity breaker explicitly OPEN from truthful provider-capacity evidence; do not simulate a healthy Codex failure.
5. Execute one real PUBLIC G4 objective through:
   `VOS root -> deterministic router -> A2 DIRECT_OFFICIAL -> normalized result -> verification -> durable checkpoint`
6. Prove `FOUNDER_PROMPT_SHUTTLING=0`, paid fallback `0`, production mutation `0`.
7. Execute G5 across a separate process/worker continuation boundary from the durable checkpoint.
8. Prove exactly-once isolated effect claim succeeds once and replay is rejected; no duplicated external effect.
9. Only after exact runtime evidence may `G4=GREEN` and `G5=GREEN` be emitted.
10. After G4/G5, resume the provider-diversification qualification order from the reviewed Gemini research.

Do not merge Draft PRs or mutate production merely to close repository bookkeeping. Promotion/merge remains a separate decision after runtime gates are evidenced.

## 9. Required files for the next session

Read in this order:

1. `docs/fabric/HANDOFF_LATEST.md` — this file
2. `docs/fabric/research/2026-09-15-gemini-deep-review.md`
3. `docs/fabric/ARCHITECTURE.md`
4. `docs/fabric/PACKAGE.md`
5. `docs/fabric/STATE.md`
6. `docs/fabric/HANDOFF_2026-09-14_VOS_FABRIC_V2.md` — historical context only where not superseded

Then inspect live GitHub PR/run state before execution.

## 10. Founder burden / cost boundary

The A2 qualification was completed without buying capacity and without requiring founder prompt/result shuttling. The continuing design target remains **ZERO gesti founder** except for unavoidable first-party credential/consent gates that cannot lawfully or technically be automated.

No hidden paid fallback is authorized.