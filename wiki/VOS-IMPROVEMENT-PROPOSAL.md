# VOS Improvement Proposal v2 — Re-scoped 8-12h (post-review)

> **Versione**: v2 (2026-05-15) post-review CTO peer Claude.ai
> **Scope cut**: da 23-32h (5 phase) → 8-12h (3 phase ridotte)
> **Out of scope (vincoli founder)**: heretic-handler, routing chain logic, Karpathy-compiler, briefer markdown format
> **6 fix review applicati**: Phase 4 RIMOSSA, P5.1 field-only, scope cut FLUXION-priority, discovery pre-P1.2, test pre-P2.2, validate P1.1 need
> **Discovery base**: VOS state inventory 2026-05-15

---

## Fix review v1→v2 applicati

| # | Issue review | Fix applicato |
|---|---|---|
| 1 BLOCKER | P5.1 modifica briefer markdown layout (out-of-scope) | Re-scoped: SOLO field `signal_priority` in JSONL, NO modifica markdown output. Founder filtra lato sua. |
| 2 BLOCKER | Phase 4 dipende ARGOS P0 audit out-of-scope | **Phase 4 RIMOSSA**. Riaprire post-AMBRA stabilizzato in ARGOS. |
| 3 HIGH | 23-32h scope creep vs FLUXION priority | **Cut a 8-12h**: P1.2 + P2.1 + P5 depotenziato solo. P2.2/P3/P4 → backlog post-FLUXION MILESTONE 1. |
| 4 HIGH | P1.1 brief-actions populate = assumption need | **Validate founder need PRIMA**: "stai perdendo decisioni? hai bisogno audit trail?". Se NO → P1.1 fuori scope. |
| 5 HIGH | P2.2 memory federation assume Claude Code legge file droppati | **Test empirico pre-P2.2**: drop 1 file in target memory dir, verify SessionStart terminal lo legge. Se fail → P2.2 elimina, sostituire SessionStart hook injection. |
| 8 LOW | G4 cost gap non quantificato | **Discovery 1h pre-P1.2**: export cost log 30gg ultimi, segmentare manuale, verify se gap materiale (>€5/mese drift) o teorico. |

---

## Phase v2 (3 phase, 8-12h)

### Phase 1 (revised) — Cost tracking per-project (4-5h)

**P1.2 — Cost alert per-project (G4 confermato reale)**

⛔ **Pre-step Discovery 1h** (Issue #8 fix):
```bash
# Export costs.jsonl ultimi 30gg + segmenta manuale per project_tag
python3 -c "
import json
from collections import defaultdict
from datetime import datetime, timedelta
cutoff = datetime.utcnow() - timedelta(days=30)
by_project = defaultdict(float)
with open('state/costs.jsonl') as f:
    for line in f:
        e = json.loads(line)
        if datetime.fromisoformat(e['ts'].replace('Z','+00:00').split('+')[0]) > cutoff:
            tag = e.get('project_tag') or e.get('component', 'UNKNOWN')
            by_project[tag] += e.get('cost_usd', 0)
print(dict(by_project))
"
```
Se max single project >€5/mese drift → gap materiale, procedi. Se <€5 → degrade P1.2 a logging only, no alert.

**Task post-discovery**:
- `_shared/llm_router.py`: aggiungi `project_tag` in cost log (default "VOS-meta" se unknown)
- Script `tools/cost-burn-rate.py`: daily check, telegram alert founder se project cumulative >€10/mese
- `state/cost-by-project.md` weekly summary auto-generated

**Done when**: 1 alert burn-rate testato simulato + 1 settimana cost-by-project.md popolato

### Phase 2 (revised P2.1 only) — Decision sync cross-project (3-4h)

**P2.1 — Decision sync (G2 reale)**

⛔ **Cap retention** (Issue #9 fix): last 20 cross-project decisions FIFO in injected SessionStart context (prevenire context bloat).

**Task**:
- `state/decisions-cross-project.jsonl`: append-only log decisioni VOS-meta trans-progetto (es. workspace split, target microdealer, no Twilio, NO P.IVA ricerca)
- Hook `session_start_brief.sh` enhanced: legge ultimi 20 + injecta in SessionStart context PER OGNI sessione terminale
- Convention: decisioni founder-explicit con tag `[cross-project]` in DECISIONS.md → script auto-extract via grep `^\\[cross-project\\]`

**Done when**: ARGOS terminal SessionStart 2026-05-22 mostra ultimo decision "[cross-project] NO Twilio insindacabile" injection

### Phase 5 (revised, field-only) — Brief signal scoring (1-2h)

**P5.1 — Field signal_priority SOLO (G9 reale, Issue #1 fix)**

⛔ **NO modifica markdown output layout**. Solo:
- Briefer aggiunge `signal_priority` field (CRITICAL/HIGH/LOW) a ogni entry in `state/brief-signals.jsonl`
- Founder può filtrare lato sua via grep o dashboard separato
- NO sezione "🔴 CRITICAL in cima" nel brief markdown

**Done when**: brief 2026-05-22 ha entry JSONL con signal_priority popolato

---

## Phase deferred a backlog post-FLUXION MILESTONE 1

- **P1.1 brief-actions populate**: DEFERRED, validate founder need first via Q&A (Issue #4)
- **P2.2 memory federation**: DEFERRED, test empirico fattibilità Claude Code first (Issue #5). Se fallisce → SessionStart hook injection (P2.1 estensione)
- **P3.1 tool-scout adoption candidates**: DEFERRED, founder bandwidth FLUXION priority (Issue #6)
- **P3.2 routing regression auto-trigger**: DEFERRED, degrade a passive logging (Issue #7)
- **Phase 4 AMBRA sharing**: RIMOSSA, riaprire post-AMBRA stabilizzato ARGOS terminal

---

## Risorse stimate v2

| Phase | Effort | Cost € |
|---|---|---|
| Phase 1 revised | 4-5h | €0 |
| Phase 2.1 revised | 3-4h | €0 |
| Phase 5 revised | 1-2h | €0 |
| **Total v2** | **8-11h** | **€0** |

vs v1: 23-32h → 8-11h = **-65% effort, -100% scope creep**

---

## Dipendenze v2

```
Phase 1 (cost tracking) — independent, parte first
   ↓ (cost log enriched con project_tag)
Phase 2.1 (decision sync) — independent (può parallelizzare P1)
   ↓
Phase 5 (signal_priority field) — independent
```

Nessuna dipendenza out-of-scope. Tutte phase sono single-founder-executable.

---

## VOS Utility Feedback Loop integration

Le 2 modifiche prompt ARGOS+FLUXION (sezione "VOS Utility Feedback Loop") generano dato strutturato in `state/vos-utility-feedback.jsonl`. Briefer mattutino legge aggregate → trigger decisione "scale Phase 1-2-5 vs ridimensionare VOS" basato su evidence empirica.

Trigger soglie:
- Aggregate ≥3 verdict UTILE su 5 sessioni terminali → procedi Phase 1-2-5
- Aggregate ≥3 NEUTRO → discovery pre-Phase
- Aggregate ≥2 OVERHEAD → ridimensionare VOS, kill phase

---

## Q&A founder pending (one-by-one quando comodo)

Salvo risposte in `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_vos_improvement_decisions.md`. Research items in `wiki/TODO-VOS-RESEARCH.md`.

**Q1 (Issue #4 validate)**: stai perdendo decisioni? Hai bisogno audit trail brief-actions? Se NO → P1.1 backlog permanent.

**Q2 (Issue #5 test)**: vuoi che testiamo empiricamente se Claude Code carica memory file droppati esternamente in target dir? 15 min test, decide se P2.2 fattibile.

**Q3 (Issue #8 discovery)**: prima di Phase 1 build, faccio io discovery 1h costs.jsonl segmentazione? Output: cost per project ultimo 30gg.

**Q4 (priority scope)**: confermi v2 scope 8-11h Phase 1+2.1+5 OR vuoi tagliare ulteriormente (es. solo Phase 1)?

**Q5 (timing)**: quando iniziamo VOS Phase work? Subito post Q&A OR dopo ARGOS+FLUXION terminali partono?

---

## Status

PROPOSAL v2 — review CTO applicato 6 fix preliminari → READY for Q&A founder.
