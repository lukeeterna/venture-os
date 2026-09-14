# Gemini Deep Research Intake — 2026-09-14

Status: RESEARCH INPUT / NOT CANONICAL RUNTIME EVIDENCE

Source supplied by founder: `Enterprise AI Software-Engineering Execution Architecture and Market Research Study (September 2026)`.

This file intentionally records a normalized decision-relevant intake rather than promoting every claim in the research report to repository truth. Any material claim about a provider's current model IDs, pricing/free entitlement, hard-stop behavior, privacy/training policy, ToS, quota reset cadence, data residency or automation support MUST be re-verified against current first-party documentation and, where applicable, real-account runtime evidence.

## Main conclusion

The report independently supports the architecture principle already reached by Sol:

> Subscription-backed frontier workers should remain direct official-client integrations; generic API/free-model capacity should be isolated behind a restricted policy gateway; VOS remains the root of trust.

Recommended high-availability shape:

- Tier A direct official workers: OpenAI Codex CLI + Google Antigravity CLI.
- Tier B local/privacy-compatible capacity candidates, subject to qualification.
- Tier C restricted OmniRoute for allowlisted generic zero-cost API/model capacity only.
- VOS controls authorization, paths, network policy, cost, data classification, result verification, checkpoint and continuation.
- GitHub Actions/local deterministic tests provide independent verification.

## Research-supported controls to evaluate

- hard `max_cost_usd = 0`;
- explicit terminal states for quota/auth/policy/cost/data-policy failure;
- per-worker circuit breaker with OPEN/HALF_OPEN/CLOSED states;
- data classes PUBLIC / INTERNAL / CONFIDENTIAL / SECRET;
- secret data = no external AI egress;
- no consumer OAuth proxying through generic third-party gateways by default;
- no account rotation or quota circumvention;
- static audited provider/model allowlist for Tier C;
- fail closed on unknown quota/billing state;
- exact request/mandate/result hashes;
- OS-level sandbox/path restrictions;
- production pre/post regression checks.

## Candidate conclusions requiring re-verification

The report discusses or ranks:

- OpenAI Codex CLI;
- Google Antigravity CLI;
- Ollama Cloud Free;
- Groq Free;
- OmniRoute;
- OpenCode Zen;
- Kilo Code Auto Free;
- OpenRouter Free;
- Amazon Q Developer Free;
- Mistral Studio Free;
- Kiro CLI;
- Qwen Code/API;
- Grok Build;
- CLIProxyAPI.

Do not enforce the report's exact ranking without current verification.

## OmniRoute conclusion

Use only as a subordinate restricted capacity component if it passes VOS-owned qualification gates. Do not make OmniRoute the authorization authority and do not put Codex/Antigravity subscription OAuth inside it by default.

Candidate treatment:

- reuse protocol/routing concepts where safe;
- wrap behind VOS policy/sidecar and static allowlist;
- pin exact release/SHA;
- patch/fork only if required for fail-closed zero-cost/ToS/data-policy behavior;
- disable unnecessary UI/remote management/consumer OAuth proxying in the VOS deployment profile;
- reject runtime promotion if paid/unknown targets can dispatch.

## CLIProxyAPI conclusion

Treat as reference/lab input, not production credential boundary, unless a future first-party ToS/security review overturns that decision. Features related to consumer credential proxying, identity hiding, multiple-account aggregation or quota evasion are outside the VOS operating policy.

## Fabric architecture candidate

```text
Founder / Sol
  -> VOS root policy kernel
     -> direct Codex official CLI
     -> direct Antigravity official CLI
     -> independently certified Tier B capacity
     -> restricted OmniRoute generic zero-cost pool
  -> normalized results
  -> deterministic verifier / GitHub CI
  -> checkpoint
  -> rollover / continuation
```

## Important omitted dimension added by founder

The research report is not sufficient by itself because Fabric v2 must also include:

- secure local network topology and segmentation;
- iMac/MacBook/NAS trust zones;
- Tailscale/X-VPN/vmnet/Multipass interaction analysis;
- firewall/egress design without destabilizing production;
- smartphone secure remote-control role;
- iMac and MacBook hardware/OS/upgrade assessment;
- measured resource placement before OmniRoute/Hermes deployment.

These requirements are captured in `docs/fabric/HANDOFF_2026-09-14_VOS_FABRIC_V2.md` and are mandatory parts of the final architecture.
