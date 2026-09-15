# VOS Fabric v2 — Gemini/Handoff Gap Matrix (2026-09-14)

Status: CURRENT WORKING GAP MATRIX. Runtime evidence wins over design prose.

## Source hierarchy

1. `docs/fabric/HANDOFF_2026-09-14_VOS_FABRIC_V2.md` — canonical continuation/operating authority.
2. Founder-supplied Gemini Deep Research report — architecture/research input, not runtime truth.
3. Current first-party provider documentation — required for volatile product/cost/privacy facts.
4. Exact-SHA repository CI and real machine/account runtime evidence — required for promotion.

Research claims about model IDs, quotas, pricing, privacy, retention, ToS, reset cadence and unattended auth MUST NOT be copied into enforcement without current verification.

## Certified machine gates retained

- G1 `IMAC_PRODUCTION_BASELINE=GREEN`: certified in `fluxion-desktop` PR #66 at `e997d3ac7f0fd64cf5e2731ac942d260f4df7f78`, run `34774774249`, job `103771574629`.
- G3 `VOS_KERNEL_CERTIFIED=GREEN`: certified in `fluxion-desktop` PR #67 at `1f16ab2505480adab67b20411cf0b5819179a2b2`, run `34780894842`, job `103787590649`.
- Do not rerun G1/G3 merely for activity; regression evidence remains mandatory around machine-bound changes.

## Current open runtime gates

- G2: isolated Linux Codex worker still requires one complete exact run proving auth, requested model, JSON execution, exact resume, distinct fork, real command/tool evidence, bounded resources, worker-only stop/start, auth persistence, unchanged production, no unexpected mounts and paid fallback = 0.
- G4: real VOS-authorized chain proving `FOUNDER_PROMPT_SHUTTLING=0`.
- G5: real durable checkpoint -> context threshold -> exact resume/fork continuation with no duplicated external effect.
- Repo fixtures never substitute for these runtime gates.

## Gemini architecture delta

The report recommends a multi-tier policy-gated fabric. The stable principle retained is:

`Founder -> Sol -> VOS -> worker router -> isolated replaceable worker -> verifier -> checkpoint -> rollover`

Required separation:

- Tier A subscription-backed frontier workers use direct official clients and isolated credential homes.
- Local deterministic execution is a separate zero-egress lane.
- Any generic gateway is subordinate to VOS and uses a separate credential domain.
- Consumer subscription OAuth must not be proxied through generic gateways.
- `max_cost_usd == 0` is a hard policy.

The report's exact worker/model rankings are NOT registry truth until re-verified.

## Router contract introduced by this change

`components/fabric/router.py` is deliberately provider-agnostic and does not call a model.

A registered worker must carry evidence references for qualification and data policy, hard zero-cost stop, explicit credential domain, data-class eligibility and deterministic priority. Consumer OAuth proxying is forbidden.

Data-policy baseline:

- PUBLIC: structurally qualified zero-cost worker.
- INTERNAL: `NO_TRAINING`, `ZDR` or `LOCAL_ONLY`.
- CONFIDENTIAL: `ZDR` or `LOCAL_ONLY` only.
- SECRET: local deterministic + `LOCAL_ONLY` + network `NONE` only.

Quota circuit breaker baseline:

- `CLOSED`: eligible.
- quota signal -> `OPEN`.
- unknown reset -> remain fail-closed; no blind probes.
- known reset reached -> explicit `HALF_OPEN` probe only.
- successful probe -> `CLOSED`.

This is a repo-level abstraction. It does not promote G4/G5.

## Real infrastructure audit — 2026-09-14

Read-only workflow: `fluxion-desktop/.github/workflows/vos-fabric-infra-audit.yml`

Exact evidence:

- branch SHA `2254f37ed972f16f5f6e37149ac666447a2ec651`
- Actions run `34860600551`
- job `104031482335`
- conclusion SUCCESS
- runner `fluxion-macbook`
- `PROTECTED_SERVICES=GREEN`
- `INFRA_AUDIT_READ_ONLY=1`
- `NETWORK_SECURITY_VERDICT=PENDING_DESIGN_REVIEW`

### MacBook measured snapshot

- `MacBookPro11,1`, macOS 11.7.10, 2 physical / 4 logical CPUs, 8 GiB RAM.
- root filesystem showed about 9 GiB available at capture time; SSD SMART Verified.
- application firewall enabled and stealth mode enabled.
- self-hosted runner active.
- instantaneous load was very high for this 2-core machine; do not assign an always-on inference/runtime role without further measurement.

### iMac measured snapshot

- `iMac13,1`, macOS 12.7.4, quad-core Intel Core i5 2.7 GHz, 16 GiB RAM.
- memory-pressure command reported 75% free at capture time; no thermal/performance warning recorded.
- internal SSD SMART Verified; substantial disk headroom.
- NAS_LOCAL mounted.
- Multipass 1.12.2+mac using qemu.
- `vos-worker`: Ubuntu 22.04.5 LTS, 2 vCPU, ~3.8 GiB RAM, ~29 GiB disk, no host mounts, low guest load at capture time.
- Guardian/go2rtc/MQTT/FLUXION/NAS protected-service gate GREEN.
- OCLP present; SIP is a custom configuration and boot/EFI state must be preserved.

### Network/security audit items

Measured, not yet promoted:

- iMac `bridge100` = `192.168.64.1/24`; `vos-worker` = `192.168.64.3`.
- iMac IP forwarding = enabled.
- iMac application firewall = disabled; stealth mode = disabled.
- PF read-only inspection was unavailable to the noninteractive audit account.
- five active `utun` interfaces were observed; the process-name probe did not attribute them to Tailscale or X-VPN.
- private-overlay-looking routes exist and must be attributed before changing VPN, routing, firewall or PF state.

Therefore: **hardware/network baseline captured, but secure-network certification is NOT GREEN.**

No Tailscale/X-VPN/PF/firewall toggle, router port-forward or production reboot is authorized from this matrix. First produce an attributable topology and rollback-safe filtering plan, then require pre/post production evidence for any change.

## Next sequence

1. Keep the current Codex G2 direct lane and finish only the remaining real G2 qualifier failure; no paid fallback.
2. Re-verify Antigravity current official headless/auth/cost behavior and design an isolated direct-client qualification lane with overage/spend impossible.
3. Use the router contract to register only evidence-backed workers; define persistent breaker evidence/state.
4. Attribute the iMac `utun`/overlay routes and safely inspect PF/NAT/guest egress before proposing network changes.
5. Produce a hardware placement verdict from repeated load/memory measurements; do not add heavyweight always-on gateways while headroom is uncertain.
6. Pin and audit OmniRoute only in a lab after current upstream/cost/data-policy verification; no production install yet.
7. Once G2 and the router abstraction are sound, execute real G4.
8. Then execute real G5.
9. Keep PRs Draft/unmerged until their stated runtime scope is certified.
