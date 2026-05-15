# Next VOS Session Prompt — post S170-close

**Sessione precedente**: S170-post-close VOS (2026-05-14 → 2026-05-15)
**Chiusura**: ordinata vincolo #7 (context 60% soglia)
**Workspace**: VOS terminal cwd `/Volumes/MontereyT7/venture-os`

## Stato consolidato

### File pronti per founder action
- `wiki/projects/ARGOS/PROMPT-S171-ARGOS.md` (v2.2 + VOS Utility Feedback Loop)
- `wiki/projects/FLUXION/PROMPT-FLUXION-PRODUCTION-SPRINT-S184.md` (v3.1 + VOS Utility Feedback Loop)

### Decisioni founder Q&A VOS Improvement (memorizzate)
1. ❌ P1.1 brief-actions audit trail → BACKLOG permanente (overhead pre-revenue)
2. ⏳ P2.2 memory federation → test 15min next session VOS
3. ❌ P1.2 cost discovery → SKIP (€0 costi confermati free-tier)
4. ✅ Scope: SOLO Phase 2.1 decision sync cross-project (3-4h)
5. ⏸️ Timing Phase 2.1: DOPO ≥3 sessioni terminal con verdict VOS Utility Feedback Loop

### Founder action pendenti UPSTREAM (block terminali)
**ARGOS** HARD blocker dubbi: #1 numero non-Twilio Layer 2, #3 AMBRA stato, #7 API creds Reddit+Telegram
**FLUXION** 7 Actions: Ehiweb, clienti BASE €297, landing verticali, video Sara, license mechanism, dealer-pull applicabilità, export AMBRA pattern

## Goal next VOS session

### Priority 1 — Test memory federation Claude Code (15 min)
Test empirico Q2: drop file in target memory dir progetto, verify SessionStart terminal lo legge come native memory.

```bash
TEST_FILE=~/.claude/projects/-Users-macbook-Documents-combaretrovamiauto-enterprise/memory/feedback_test_federation.md
cat <<EOF > "$TEST_FILE"
---
name: TEST federation
description: TEST file drop per verifica Claude Code memory federation
type: feedback
---
TEST CONTENUTO — se appare in SessionStart terminal ARGOS, federation rsync fattibile.
EOF
# Founder apre terminal ARGOS, verifica SessionStart context
# Cleanup post-test
```

- SI → P2.2 fattibile via rsync nightly
- NO → sostituire con SessionStart hook injection (estensione P2.1)

### Priority 2 — Aggregate VOS Utility Feedback Loop verdict (gate Phase 2.1)
Quando `state/vos-utility-feedback.jsonl` ha ≥3 entries:
- ≥2 UTILE → procedi Phase 2.1 (3-4h)
- ≥2 OVERHEAD → kill VOS Phase work, document in deviations
- Mixed → wait

### Priority 3 — Routine VOS-meta
- Brief mattutino review
- Memory MEMORY.md updates
- Cross-mount T7 health
- Cost tracking verify (€0 atteso)

## Lessons S170-post-close
1. Review esterno value = access reviewer al material reale (incolla INTERO doc)
2. Hook system-reminder context = off-by-20%, fidarsi contatore UI
3. VOS Utility Feedback Loop = pattern data-driven decision Phase work
4. Founder decisioni insindacabili applicare PRIMA filtrare review esterne

## Commit S170-post-close master
```
eef9eab VOS Proposal v2 + Utility Feedback Loop in 2 prompt
119c08b PROMPT-S171 v2.2 fix Twilio + rimossa ricerca fiscale
c35d994 PROMPT-S171 v2.1 review CTO applicato
7c1bc89 PROMPT-FLUXION v3.1 review filtered
7ed165d PROMPT-FLUXION v3 review applicato
0fc31e5 numeri WA + no code signing FLUXION
70f358d workspace split + PROMPT-S171
174260d Open Q #12 daemon dedup BLOCKER
12d3f78 D-26 cold-lead framework V5
dcc2721 routing.yaml v5.1
```
