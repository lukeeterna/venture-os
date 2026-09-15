# Sol Delta Research — Zero-Cost Capacity Fabric

Date: 2026-09-15
Status: FIRST-PARTY RESEARCH INPUT / RUNTIME QUALIFICATION STILL REQUIRED
Purpose: eliminate Codex/ChatGPT Work quota as a single-project-development blocker without quota circumvention or paid fallback.

## 1. Structural finding

OpenAI currently documents that Codex, ChatGPT Work, ChatGPT for Excel and Workspace Agents share allowance/credits when included in the plan. Therefore Codex/Work capacity is useful Tier A capacity but cannot be a continuity dependency for VOS.

First-party source:
- https://help.openai.com/en/articles/11369540

Decision: KEEP Codex direct, but never as the sole eligible worker.

## 2. Antigravity — Tier A2 qualification candidate

Google currently documents:

- Individual plan: $0/month with basic weekly rate limits.
- Official native CLI installer for Linux/macOS/Windows.
- Headless `-p` mode.
- `json` and `stream-json` machine-readable output.
- explicit model pinning and fail-loud unknown-model behavior.
- conversation IDs plus `--conversation` / `--continue` resume.
- OS-level terminal sandbox.
- fine-grained deny/ask/allow permissions.
- model listing via `agy models`.

First-party sources:
- https://antigravity.google/pricing
- https://antigravity.google/docs/cli/headless/
- https://antigravity.google/docs/cli/sandbox/
- https://antigravity.google/docs/cli/permissions
- https://antigravity.google/docs/cli-install
- https://antigravity.google/docs/models

Important caveats:

- Free is rate-limited, so Antigravity is not itself a no-quota solution.
- The production lane must use direct official account authentication, not Gemini API-key fallback.
- The account's actual zero-cost entitlement and current data-collection settings require account/runtime evidence before promotion.
- PUBLIC is the maximum default data class until first-party/account-specific data-policy evidence is promoted by VOS.

Decision: PROCEED to isolated A2 runtime qualification. A qualification gate is added in `tools/fabric/antigravity_worker_gate.sh`.

## 3. GroqCloud Free — Tier B API-capacity candidate

Current Groq documentation exposes explicit organization limits and returns HTTP 429 when limits are reached. Example current free/base limits include 30 RPM / 1,000 RPD and 200K TPD for several coding-capable open models, subject to the account's exact Limits page.

Groq billing docs distinguish Free from Developer; upgrading to Developer requires a payment method and usage then becomes billable. VOS must never perform such an upgrade.

Groq data docs state inference customer data is not retained by default, with limited reliability/abuse-monitoring exceptions that can retain data temporarily; exact Data Controls must be audited before any class above PUBLIC is considered.

First-party sources:
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/billing-faqs
- https://console.groq.com/docs/your-data

Decision: PROCEED as PUBLIC-only Tier B candidate, preferably behind a replaceable coding harness such as OpenCode. It is capacity, not VOS authority.

## 4. OpenCode — harness candidate, not capacity source

OpenCode currently provides:

- `opencode run` non-interactive automation;
- JSON output;
- session continuation and fork;
- 75+ providers and local models;
- granular shell/edit/web permissions;
- headless server support.

Its own Zen free models are explicitly limited-time and therefore must not be production capacity assumptions.

First-party sources:
- https://opencode.ai/v2/docs/cli
- https://opencode.ai/v2/docs/providers
- https://opencode.ai/v2/docs/permissions
- https://dev.opencode.ai/docs/zen

Decision: KEEP as a Tier-B/Tier-C harness candidate. Do not treat OpenCode Zen promotional free models as durable capacity.

## 5. OpenRouter Free — Tier C opportunistic capacity

OpenRouter currently publishes a Free plan with 25+ free models and 50 requests/day. `openrouter/free` selects among zero-token-price endpoints. OpenRouter states prompt retention is opt-in on its layer, while provider-specific data handling remains a separate policy concern.

First-party sources:
- https://openrouter.ai/pricing
- https://openrouter.ai/openrouter/free/
- https://openrouter.ai/docs/guides/privacy/data-collection

Decision: PUBLIC-only Tier C candidate. Useful for burst diversity, not continuity by itself. No deposit/top-up is allowed to raise free limits under the VOS zero-capital policy.

## 6. Ollama Cloud Free — candidate with billing guard concern

Ollama currently has a Free plan and documents one concurrent request. It states prompts/responses are not logged or trained and partner providers must use no-logging/no-training/ZDR policies.

However current pricing also states every plan, including Free, can buy usage credits and usage can draw from purchased credits after included plan credits. Therefore VOS cannot call the lane hard-zero-cost unless the real account is proven to have no purchased-credit fallback or a hard mechanism prevents consumption beyond free included usage.

First-party source:
- https://ollama.com/pricing

Decision: HOLD for zero-cost hard-stop qualification. Do not promote merely because a Free plan exists.

## 7. Qwen Code

Qwen Code is technically attractive as a harness: headless mode, JSON/stream-JSON, resume, sandbox and execution budgets are documented.

But Qwen's own troubleshooting documentation states the Qwen OAuth free tier was discontinued on 2026-04-15. Therefore Qwen Code itself is not a durable free capacity source. It may still be used as a harness against separately qualified zero-cost providers.

First-party sources:
- https://qwenlm.github.io/qwen-code-docs/en/users/features/headless/
- https://qwenlm.github.io/qwen-code-docs/en/users/support/troubleshooting/

Decision: HARNESS/RADAR only; no independent zero-cost capacity credit.

## 8. Amazon Q Developer Free

AWS documents a perpetual Free tier available in the command line with a personal Builder ID, but current agentic capacity is limited (currently published as 50 agentic requests/month). Data collection opt-out is available on Free.

First-party sources:
- https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-tiers.html
- https://aws.amazon.com/q/developer/pricing/

Decision: RADAR / low-volume fallback candidate. Qualify only after higher-value A2 and API capacity lanes.

## 9. OmniRoute

Current upstream evidence is not sufficient for production promotion:

- repeated release/v3.8.51 release-green failures were recorded in late Aug / early Sep 2026;
- open/current provider defects include Antigravity-specific behavior;
- upstream troubleshooting explicitly recommends provider rotation for quota handling, but VOS requires a stricter static allowlist and fail-closed policy semantics.

Sources:
- https://github.com/diegosouzapw/OmniRoute/issues/12732
- https://github.com/diegosouzapw/OmniRoute/issues/13447
- https://github.com/diegosouzapw/OmniRoute/blob/release/v3.8.51/docs/guides/TROUBLESHOOTING.md

Decision: DO NOT production-install now. Keep as lab/reference and reuse selected MIT concepts only after OR-1..OR-14 qualification.

## 10. Current architecture recommendation

```text
Founder / Sol
    -> VOS ROOT AUTHORITY
       -> deterministic worker router + circuit breakers
          -> A1 Codex direct official (quota-bounded)
          -> A2 Antigravity direct official (quota-bounded)
          -> B1 OpenCode + Groq Free (candidate)
          -> B2 other independently certified hard-zero-cost API capacity
          -> C1 OpenRouter Free PUBLIC-only opportunistic capacity
          -> local deterministic lane for SECRET/no-egress tasks
    -> normalized result
    -> deterministic tests / independent review
    -> durable checkpoint
    -> resume / rollover
```

No individual lane is required to be unlimited. Continuity is achieved by independent credential/provider domains plus fail-closed circuit breakers and durable checkpoints.

If every eligible zero-cost lane is exhausted, VOS records `BLOCKED_QUOTA` and resumes after a certified reset/probe window. It never purchases capacity and never evades a provider limit.

## 11. Immediate critical path

1. Repo-certify the Antigravity gate.
2. Run A2 on isolated Linux worker with direct official account auth.
3. Capture exact version/binary hash/model/conversation/tool/resume/resource evidence.
4. Register A2 only when zero-cost-account evidence and PUBLIC data-policy evidence are real.
5. Execute real multi-worker G4 with Codex breaker OPEN to prove route-to-A2 without founder prompt shuttling.
6. Execute G5 rollover across worker/process boundary with duplicated effects = 0.
7. Qualify Groq Free + OpenCode as the next independent capacity domain.
8. Only then reconsider a restricted gateway deployment.
