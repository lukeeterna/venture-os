# Sol Zero-Cost Capacity Delta — Addendum

Date: 2026-09-15
Status: FIRST-PARTY RESEARCH; runtime qualification required before promotion.

This addendum extends `2026-09-15-sol-zero-cost-capacity-delta.md` with additional independent credential/capacity domains. It does not change VOS authority or the hard `MAX_COST_USD=0` invariant.

## Mistral Vibe Free — strong Tier A/B qualification candidate

Current first-party facts:

- Mistral Free is $0 and includes limited Vibe coding plus monthly included usage/API credits.
- Vibe CLI supports non-interactive `--prompt`, bounded `--max-turns`, JSON output, tool restrictions, trusted folders and exact session resume.
- A Mistral account can be used directly instead of an API key.
- Included monthly usage is shared across Studio/API/Vibe.
- Pay-as-you-go is OFF by default. With pay-as-you-go OFF, Vibe can stop at the included limit instead of generating additional billed usage.
- Mistral exposes organization spend-limit/rate-limit controls.

Primary sources:
- https://mistral.ai/pricing/
- https://docs.mistral.ai/vibe/code/cli/work-with-cli
- https://docs.mistral.ai/vibe/code/cli/install-setup
- https://docs.mistral.ai/vibe/code/cli/api-keys-profiles
- https://docs.mistral.ai/admin/billing-usage/subscriptions
- https://docs.mistral.ai/admin/billing-usage/billing

Decision:
- ADD to qualification queue after Antigravity A2.
- Prefer direct account-auth Vibe lane if runtime proves it can operate headlessly after one-time setup.
- Require explicit evidence that pay-as-you-go remains disabled and the account is Free before every promotion/periodic requalification.
- PUBLIC only until data-policy/account settings are independently accepted.

## Kiro Free — low-volume independent direct coding domain

Current first-party facts:

- Kiro Free is perpetual at $0/month.
- Current Free allocation is 50 credits/month.
- Free tier cannot buy add-on credits; paid tiers can.
- Kiro CLI supports macOS/Linux/Windows and account sessions; current product surfaces also include managed cloud sessions on supported plans/surfaces.
- Free includes open-weight models and currently Claude Sonnet 4.5 subject to limits.

Primary sources:
- https://kiro.dev/pricing/
- https://kiro.dev/docs/billing/
- https://kiro.dev/cli/

Decision:
- RADAR -> QUALIFY as a low-volume fallback after Mistral/Groq.
- It does not solve continuity alone, but provides a separate vendor/credential/quota domain.
- Do not upgrade or purchase credits automatically.

## Cloudflare Workers AI Free — useful API capacity with hard plan boundary

Current first-party facts:

- Workers AI has a Free allocation of 10,000 Neurons/day.
- On Workers Free, exceeding the free allocation requires upgrade to Workers Paid; further operations fail rather than silently billing.
- Daily allocation resets at 00:00 UTC.
- Some resource-heavy models explicitly require Workers Paid and return 403 on Free; those model IDs must be denylisted by VOS.
- Cloudflare Unified Billing can charge prepaid/payment-method balances and is therefore forbidden for the VOS zero-cost lane.

Primary sources:
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/
- https://developers.cloudflare.com/ai-gateway/features/unified-billing/

Decision:
- ADD as Tier B/C PUBLIC-only API capacity candidate.
- Require an account on Workers Free, Unified Billing OFF/not configured, static free-model allowlist, 10,000-Neuron circuit breaker and no automatic upgrade.

## Gemini Developer API Free — capacity exists but data policy restricts use

Current first-party facts:

- Gemini Developer API provides a Free tier with no-cost input/output on selected models.
- Free-tier content is used to improve Google products according to current pricing documentation.
- Paid billing must be explicitly configured to move to paid tiers.
- Free rate limits vary by model and can return 429/RESOURCE_EXHAUSTED.

Primary sources:
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/billing
- https://ai.google.dev/gemini-api/docs/rate-limits

Decision:
- PUBLIC/SANITIZED Tier C only unless current policy changes.
- Keep separate from Antigravity direct account OAuth; do not use it as an API-key fallback for A2.

## Cerebras — current durable-free status is contradictory; HOLD

Current official pages are not fully consistent:

- the current corporate pricing page describes a $5 Free Trial credit and paid Developer tier;
- inference documentation still describes a $0 Free tier with explicit free rate limits for some models.

Primary sources:
- https://www.cerebras.ai/pricing
- https://inference-docs.cerebras.ai/support/rate-limits
- https://inference-docs.cerebras.ai/support/pricing

Decision:
- HOLD / UNVERIFIED until account-level and current first-party product status resolves whether recurring free capacity exists after trial credits.
- Trial credits are never production capacity under VOS.

## Revised qualification order

1. Antigravity direct official A2.
2. Mistral Vibe direct Free with pay-as-you-go OFF.
3. OpenCode harness + Groq Free API.
4. Cloudflare Workers AI Free static allowlist.
5. Kiro Free low-volume direct lane.
6. OpenRouter Free PUBLIC-only opportunistic lane.
7. Gemini Developer API Free PUBLIC/SANITIZED only.
8. Cerebras only if durable recurring free status is re-proven.

The target is not an unlimited provider. The target is independent capacity domains plus deterministic VOS circuit breakers, so exhaustion of any one token/credit pool becomes a routing event rather than a project stop.
