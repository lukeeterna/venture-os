# HANDOFF VOS S172 → S173

> **Sessione chiusa**: S172 — completion audit + decisione CTO gap priority
> **Stato**: VERDE (gate raggiunto)
> **Context out**: ~7-10% (margine abbondante, chiusura ordinata non forzata da budget)
> **Data**: 2026-05-15

---

## Cosa è stato chiuso in S172

1. **Audit 13 componenti VOS** → `wiki/VOS-COMPLETION-AUDIT-S172.md`
   - 11 ATTIVI / 2 STUB (disk-keeper, sara-gate-orchestrator) / 0 MISSING
2. **Decisione CTO ranking 4 gap critici** (impatto pattern S159 closure):
   1. `decision-template` ← **PRIMO**
   2. `session-health`
   3. `pipeline-runner`
   4. `llm-router` multi-role
3. **Autocritica strutturale 4 punti** sul gap selezionato (template-driven decay, friction-on-write, enforcement, scope minimale)
4. **Brief-actions line** appesa a `state/brief-actions.jsonl`

---

## Flag aperti (NON bloccanti S173)

- **SSD MacBook 85%** → `disk-keeper/keeper.py` mai eseguito post-S5 (8 mag). Azione Luke: `python3 components/disk-keeper/keeper.py --dry-run` + review whitelist + `--execute` entro 24h.
- **3 file prompt S172 inesistenti**: `HANDOFF-VOS-S171-vision-merged.md`, `BLUEPRINT-JD-v3.4.md`, `memory/project_vos_vision_v3.6.md`. Se Luke voleva passarmeli, sono in altra location (verificare `/tmp/vos-luke-vision/`?).
- **sara-gate-orchestrator STUB** = dipendenza FLUXION self-hosted runner. Pre-revenue FLUXION, non-bloccante.

---

## Prompt resume S173

```
Sessione S173 VOS. Implementazione MVP `decision-template` (gap #1 da S172).

LEGGI:
- /Volumes/MontereyT7/venture-os/wiki/VOS-COMPLETION-AUDIT-S172.md (decisione CTO + autocritica)
- /Volumes/MontereyT7/venture-os/wiki/projects/ARGOS/DECISIONS.md (esempio strutturato, 884 righe, D-XX format)
- /Volumes/MontereyT7/venture-os/wiki/projects/FLUXION/DECISIONS.md (esempio thin, 95 righe, da espandere)
- ~/.claude/skills/pre-action-check/SKILL.md (consumer del template)

TASK S173 (scope chiuso):
1. Scrivere `~/venture-os/templates/DECISION-entry.yaml` — frontmatter schema per nuove DECIDED entries (campi: id, title, status, decided_at, founder_input, source_data, last_reviewed, supersedes, related_constraints).
2. Implementare `~/venture-os/components/decision-validator/validate.py` (≤200 LOC, stdlib + pyyaml):
   - scan `wiki/projects/*/DECISIONS.md`
   - parse DECIDED entries (regex pattern D-XX), verifica frontmatter required fields
   - flag stale entries (last_reviewed > 90gg) → output JSONL `state/decision-validation.jsonl`
   - exit 1 se entries malformate, 0 se tutto ok
   - hook `briefer.py` consuma per Segnali brief mattutino
3. Backfill `wiki/projects/Guardian/DECISIONS.md` con header + 3-5 entries seed (stack TBD, scope pulizia smartphone, target user). Chiedere a Luke conferma campi prima di scrivere — Guardian è "in costruzione" CLAUDE.md, non ho fonte autoritativa per DECIDED.
4. Run validator su ARGOS + FLUXION + Guardian. Tutti devono passare prima close verde S173.

VINCOLI:
- tutti CLAUDE.md v1.1
- vincolo #4: autocritica 4 punti su validator scelto
- vincolo #5: zero-cost (stdlib + pyyaml)
- vincolo #12: scope globale (`~/venture-os/templates/`, `~/venture-os/components/decision-validator/`)
- MVP ≤200 LOC validator + ≤100 righe template + Guardian backfill markdown
- UX add-entry: target <30s (snippet `vos decision add <project>` apre $EDITOR con frontmatter pre-compilato)

NON FARE in S173:
- gap #2-4 (session-health, pipeline-runner, llm-router multi-role): sessioni separate
- enforcement cross-progetto via git hook: out-of-scope MVP, valutare S174
- UI/dashboard decisioni: out-of-scope permanente

Output atteso S173:
- 3 file creati (template + validator + Guardian DECISIONS.md)
- 1 hook briefer aggiornato
- 1 wiki note `wiki/notes/S173-decision-template-impl.md`
- brief-actions line a chiusura
```

---

## Stato risorse a chiusura S172

- MacBook: CPU 22.4%, RAM 77.0%, Data SSD **85.0%** (warning brief 15 mag)
- iMac: CPU 57.3%, RAM 63.7%, Data SSD 42.9%
- T7: 1.8% MacBook / 0.0% iMac
- Costi LLM mese: vedere `state/costs.jsonl` (tracking attivo, <€30/mese soglia)
