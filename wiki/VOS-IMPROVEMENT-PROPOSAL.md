# VOS Improvement Proposal — Stack & Tech per Servire ARGOS/FLUXION/Guardian Production

> **Scopo**: identificare miglioramenti tecnici/stack VOS per servire production-ready i 3 progetti
> **Out of scope** (vincolo founder): procedure consolidate (heretic-handler, routing chain, briefer format)
> **Scope**: stack tech, integration mechanisms, feedback loops, missing infrastructure
> **Date**: 2026-05-15
> **Discovery base**: VOS state inventory 2026-05-15 (14 componenti built, 11 JSONL state files, wiki operativa)

---

## Sintesi gap analysis (5 critici + 4 secondari)

### 🔴 GAP CRITICI

| # | Gap | Impatto produzione |
|---|---|---|
| **G1** | Brief-actions feedback loop NON popolato (briefer report-only, nessun trigger azioni) | Decisioni founder non tracciate, no audit trail, no compounding di learnings |
| **G2** | Decision propagation cross-project MANUALE (DECISIONS.md ARGOS no sync a FLUXION/Guardian) | Pattern noti (AMBRA, B6 check, premature optimization) non si riusano cross-progetto = re-discovery loss |
| **G3** | Tool-scout → deployment GAP (scout trova modelli, zero mechanism per integrarli) | Discovery senza adoption = noise informativo, ROI scouting basso |
| **G4** | Cost tracking SOLO global €30/mese, no per-project burn-rate, no alert | Possibile sforamento silente, no segmentazione spesa ARGOS vs FLUXION vs Guardian |
| **G5** | Routing regression NO auto-trigger fallback (es. Llama -50% context S170 non triggera switch) | Degradazione silente qualità VOS-meta operations |

### 🟡 GAP SECONDARI

| # | Gap | Impatto |
|---|---|---|
| **G6** | Memory cross-progetto: VOS-side memory ≠ project-side memory (ARGOS terminal vede solo sua memory locale, manca pattern shared) | Pattern come "feedback_premature_optimization" memorizzato VOS-side non discoverable da terminal ARGOS automaticamente |
| **G7** | AMBRA agent pattern (S170 D-27 Layer 3) replicabile a FLUXION sales agent ma nessuna infra sharing (codice agent + FSM + lessico) | Re-implementation duplicata FLUXION = sprechi tempo + drift design |
| **G8** | Coordination cross-terminal: ARGOS+FLUXION terminali separati, no lock files, no handoff state shared | Conflict potenziale risorse (es. iMac daemon ARGOS + FLUXION sales agent stesso stack Baileys?) |
| **G9** | brief generator non distingue urgenza segnali (tutti uguali importanza), no scoring | Founder deve leggere tutto brief per identificare urgenze |

---

## Roadmap miglioramento VOS (proposed)

### Phase 1 — Feedback loop foundation (sprint VOS-1, 4-6h)

**P1.1 — Brief-actions populate mechanism (G1)**:
- Modifica `morning-briefer/briefer.py`: per ogni decision-needed nel brief genera entry stub in `brief-actions.jsonl` con state `pending` + decision_due_by date
- Aggiungi script `tools/brief-action-close.sh` che founder esegue per chiudere action (sets state `closed` + action_taken + outcome)
- Update brief-tracker score.py per leggere brief-actions.jsonl + report weekly summary

**P1.2 — Cost alert per-project (G4)**:
- Modifica `_shared/llm_router.py`: aggiungi project_tag in cost log entry (es. "ARGOS-classifier", "FLUXION-sara", "VOS-meta")
- Script `tools/cost-burn-rate.py` daily check: se project cumulative cost >€10 mese → telegram alert founder
- Dashboard semplice: `state/cost-by-project.md` markdown summary auto-generated weekly

**Done when**: brief 2026-05-22 ha actions tracked + 1 alert burn-rate testato simulato

### Phase 2 — Decision & memory propagation (sprint VOS-2, 6-8h)

**P2.1 — Decision sync cross-project (G2)**:
- Creazione `~/venture-os/state/decisions-cross-project.jsonl`: append-only log delle decisioni VOS-meta che si applicano cross-progetto (es. workspace split, target microdealer ARGOS, no Twilio)
- Hook `session_start_brief.sh` enhanced: legge cross-project decisions + injecta in SessionStart context PER OGNI sessione terminale (ARGOS, FLUXION, Guardian, VOS)
- Convention: decisioni "founder-explicit" trasversali → marcare con tag `[cross-project]` in DECISIONS.md → script sync auto-extract

**P2.2 — Memory federation cross-project (G6)**:
- Memory file VOS-side restano canonical (`~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/`)
- Symlink/copy script che propaga feedback "trans-project" (es. premature_optimization, workspace_split, pattern_S159) a:
  - `~/.claude/projects/-Users-macbook-Documents-combaretrovamiauto-enterprise/memory/`
  - `~/.claude/projects/-Volumes-MontereyT7-FLUXION/memory/`
  - `~/.claude/projects/-Users-macbook-Documents-pulizia-smartphone/memory/`
- Rsync nightly via launchctl

**Done when**: ARGOS terminal SessionStart vede memory `feedback_premature_optimization.md` come se fosse locale

### Phase 3 — Tool-scout deployment pipeline (sprint VOS-3, 4-6h)

**P3.1 — Tool-scout → adoption candidate flagging (G3)**:
- Modifica `components/tool-scout/scouter.py`: per ogni top-safe model trovato, genera entry in `state/tool-adoption-candidates.jsonl` con campi: `model_id`, `area`, `target_project`, `fit_score`, `adoption_status` (default `proposed`)
- Brief mattutino legge tool-adoption-candidates pending → lista come "azioni discovery" in brief
- Founder può marcare `adopted` o `rejected` con commento → tracking ROI scouting

**P3.2 — Routing regression auto-trigger (G5)**:
- Routing-refresh notturno: se field_change su context_window decreased >30% → auto-flag model `degraded` in routing.yaml + adjust fallback chain
- Esempio: Llama-3.3-70b 131K→65K -50% → routing chain promote alternative free 131K (e.g., Gemini-flash primary già è 1M, no action needed; ma se Gemini primary degraded, serve alternative)
- Alert founder telegram quando auto-flag scattata

**Done when**: prossima settimana di scout → 3 tool-candidate flagged + founder ha workflow chiarocone per adopt/reject

### Phase 4 — AMBRA pattern sharing (sprint VOS-4, 6-8h)

**P4.1 — AMBRA pattern artifact shared (G7)**:
- DOPO ARGOS terminal P0 audit completato (PROMPT-S171 v2.2): export AMBRA codice/FSM/lessico in `~/venture-os/components/ambra-agent-pattern/`
- Document standard: `wiki/patterns/ambra-agent-pattern.md` con architettura + reusable FSM + LLM cascade integration
- Riferimento: FLUXION sales agent P3 può fare `import` da venture-os/components/ambra-agent-pattern/

**P4.2 — Cross-terminal lock + handoff (G8)**:
- File lock semplice `~/venture-os/state/active-terminals.jsonl`: ogni terminal session scrive entry start + close (PID + cwd + start_ts)
- Briefer/dashboard mostra terminali attivi → previene conflict (es. 2 instance ARGOS che editano stesso file)
- Coordination handoff: quando terminal close, dump in `state/handoff-N.md` con summary work done + open items

**Done when**: AMBRA pattern doc + 1 successful import test in FLUXION repo + lock files visible in brief mattutino

### Phase 5 — Brief intelligence (sprint VOS-5, 3-4h)

**P5.1 — Brief signal scoring (G9)**:
- Modifica briefer: aggiungi `signal_priority` field per ogni voce (CRITICAL/HIGH/LOW basato su euristiche: routing-drift CRITICAL se -50% ctx; cost burn-rate HIGH se >€20; tool-scout LOW)
- Brief output: sezione "🔴 CRITICAL" in cima, poi report dettagliato
- Founder può read solo CRITICAL se busy, dettaglio resta accessibile

**Done when**: brief 2026-05-29 ha sezione priority scored

---

## Risorse stimate

| Phase | Effort | Cost € | Vincolo #5 |
|---|---|---|---|
| Phase 1 | 4-6h | €0 (script Python solo) | ✅ |
| Phase 2 | 6-8h | €0 | ✅ |
| Phase 3 | 4-6h | €0 | ✅ |
| Phase 4 | 6-8h | €0 | ✅ |
| Phase 5 | 3-4h | €0 | ✅ |
| **Total** | **23-32h** | **€0** | ✅ |

---

## Dipendenze & sequenza

```
Phase 1 (foundation) — independent, parte first
   ↓
Phase 2 (propagation) — depends Phase 1 P1.2 cost tracking
   ↓
Phase 3 (tool-scout deployment) — depends Phase 2 propagation
   ↓
Phase 4 (AMBRA sharing) — depends ARGOS terminal P0 audit (out-of-scope VOS)
   ↓
Phase 5 (brief intelligence) — independent, ultima
```

---

## Out of scope esplicito (vincolo founder)

- ❌ NO modifica procedure heretic-handler (whitelist, audit hash-only)
- ❌ NO modifica routing chain logic (gemini-flash primary, fallback structure)
- ❌ NO modifica briefer format markdown (solo enhancement signal_priority)
- ❌ NO modifica Karpathy-compiler logic (lavora bene)
- ❌ NO modifica heretic categorie ALLOWED

---

## Risks identified

1. **Phase 2 memory federation** rischia divergenza file (canonical VOS vs project copies). Mitigation: rsync one-way (VOS → projects), never reverse. Project-specific memory resta in project memory dir.
2. **Phase 3 routing auto-trigger** rischia false positive (regression transient API change). Mitigation: trigger solo se drift persistent >7 giorni.
3. **Phase 4 cross-terminal lock** rischia stale lock (terminal crash, no close). Mitigation: timeout 8h, auto-clean entry stale.
4. **Total effort 23-32h** è significativo. Mitigation: serializzazione (1 phase alla volta), validation gate dopo ognuna.

---

## Open questions per founder (one-by-one)

Le faccio in ordine sequenziale dopo review Claude.ai del documento. Non discuto risposte, memorizzo in `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_vos_improvement_decisions.md`.

Research items se serve → traccio in `/Volumes/MontereyT7/venture-os/wiki/TODO-VOS-RESEARCH.md`.

---

## Status

PROPOSAL v1 — pending review Claude.ai → pending founder decisioni one-by-one → execution sequenziale phase
