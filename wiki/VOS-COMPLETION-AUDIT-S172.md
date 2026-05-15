# VOS-COMPLETION-AUDIT-S172

> **Sessione**: S172 — coordinatore VOS
> **Data**: 2026-05-15
> **Input baseline**: 13 componenti `components/`, state/* (15 mag), brief-actions ultimi 3gg, CLAUDE.md v1.1, BLUEPRINT-JD-v3.5
> **Nota integrità**: tre file dichiarati nel prompt S172 non esistono su filesystem (`HANDOFF-VOS-S171-vision-merged.md`, `BLUEPRINT-JD-v3.4.md`, `memory/project_vos_vision_v3.6.md`). Audit prosegue su artefatti effettivi. Flag `[no-S171-handoff]` registrato.

---

## 1. Audit completion 13 componenti

Verdetto per componente (LOC = righe file principale; output = evidenza ultima esecuzione in `state/`):

| # | Componente | LOC | Output reale (state/) | Verdetto |
|---|------------|-----|------------------------|----------|
| 1 | `_shared/` (llm_router + founder_bridge shim + mount_check) | 598+38+40 | importato da karpathy/heretic (S9 router prod-validated, 12 call gemini-flash fb=0) | **ATTIVO** |
| 2 | `brief-tracker/` (score + validator) | 128+69 | `brief-actions.jsonl` validato fino 14 mag, score window 7-14gg operativa | **ATTIVO** |
| 3 | `claude-memory-backup/` (backup.sh + rotate-imac.sh) | 53+57 | `claude-memory-rsync.log` rsync OK 14 mag 07:51 (LaunchAgent RunAtLoad) | **ATTIVO** |
| 4 | `disk-keeper/` (keeper.py) | 249 | `disk-keeper-log.jsonl` ultimo 8 mag (580B). Mai eseguito post-S5. SSD MacBook oggi a 85% — segnale brief 15 mag — keeper non triggered | **STUB** |
| 5 | `founder-bridge/` (browser.py) | 114 | shim importato da heretic-handler, callable (no log dedicato, side-effect su browser) | **ATTIVO** |
| 6 | `heretic-handler/` (handler.py) | 279 | `heretic-outputs/d23-*.md` 3 file 14 mag 11:46 (deepseek-v4-flash D-23 ARGOS) | **ATTIVO** |
| 7 | `host-monitor/` (monitor.py + check-runatload.sh) | 132+96 | `host-monitor.jsonl` 15 mag 17:48 (MacBook + iMac SSH probe) | **ATTIVO** |
| 8 | `karpathy-compiler/` (compiler.py) | 554 | S10 compilation 12 mag 16:43: FLUXION/Guardian/ARGOS COMPILED-STATE.md verdi, 11 originali archiviati | **ATTIVO** |
| 9 | `morning-briefer/` (briefer.py) | 500 | `briefs/2026-05-15.md` generato oggi (segnali tool-scout + routing-drift inclusi) | **ATTIVO** |
| 10 | `project-scanner/` (scanner.py) | 184 | `projects-inventory.yaml` rigenerato 12 mag post-S10 (ARGOS 0 / FLUXION 41 / Guardian 0 handoff debt) | **ATTIVO** |
| 11 | `routing-refresh/` (refresher.py) | 412 | `routing-drift.jsonl` 14 mag (23 entry: 3 field_change + 20 model_added) | **ATTIVO** |
| 12 | `sara-gate-orchestrator/` (orchestrator.py) | 235 | **Zero output in state/.** Nessun JSON report sara-release, nessun audit per-verticale presente. Wrapper su `FLUXION/scripts/sara-release-gate.sh` mai invocato production. | **STUB** |
| 13 | `tool-scout/` (scouter.py) | 391 | `tool-landscape.jsonl` 12 mag 16:50 (settimana ISO 2026-W20), diff in `tool-scout-diff.jsonl` consumato da briefer | **ATTIVO** |

**Sintesi**: 11 ATTIVI / 2 STUB (disk-keeper, sara-gate-orchestrator) / 0 MISSING / 0 SUPERSEDED.

Note operative:
- `disk-keeper` STUB ma SSD MacBook 85% oggi → keeper.py va eseguito manuale o messo in cron settimanale. Non è gap di codice, è gap di trigger.
- `sara-gate-orchestrator` STUB perché dipendenza upstream (FLUXION self-hosted runner) non attivata. Pre-revenue FLUXION = non bloccante.

---

## 2. Gap critici dichiarati nel prompt vs realtà filesystem

| Gap dichiarato | Stato reale | Risoluzione |
|----------------|-------------|-------------|
| `llm-router` | **PARZIALMENTE PRESENTE**: `_shared/llm_router.py` S9 copre solo role=`long_context` (Gemini fb). Multi-role (`reasoning`, `coding`, `vision`, `cheap`) non implementato. Gap = espansione, non assenza. | **DELOAD S175** — no demand reale (0/13 consumer per ruoli speculativi). Policy "demand-driven role addition" aggiunta a routing.yaml header. Vedi `wiki/notes/S175-gaps-3-4-deload.md`. |
| `pipeline-runner` | **MISSING**: nessun orchestratore phases discuss→plan→execute con commit atomici nei components VOS. Esiste in skill `gsd:*` (terzo-parte), non in VOS-core. | **DELOAD S175** — overlap ~85% con skill `gsd:*` (autonomous, execute-phase, next, manager, plan-phase, verify-work, quick). Implementare = duplicare upstream Anthropic-distributed. Vedi `wiki/notes/S175-gaps-3-4-deload.md`. |
| `session-health` | **MISSING**: `host-monitor` probe macchina, NON sessione Claude (context %, turn count, drift). Vincolo #7 oggi gestito manuale via `/context`. | **IMPLEMENTED S174** — probe + briefer signal. Vedi `wiki/notes/S174-session-health-impl.md`. |
| `decision-template` | **MISSING (scaffolding)**: `wiki/projects/ARGOS/DECISIONS.md` (884 righe, D-XX strutturate), `wiki/projects/FLUXION/DECISIONS.md` (95 righe, thin), `wiki/projects/Guardian/DECISIONS.md` **assente**. Skill `pre-action-check` esiste ma coverage 2/3 progetti. | **IMPLEMENTED S173** — validator + template + Guardian backfill. |

**Closure audit S172: 4/4 gap risolti** (2 implemented S173-S174, 2 deload-with-rationale S175).

---

## 3. Decisione CTO singola — quale gap chiudere PRIMO

### Raccomandazione

**Chiudere PRIMO: `decision-template`** (scaffolding DECISIONS.md + DECIDED-entry validator + Guardian backfill).

### Motivazione (impatto diretto su rottura-pattern-S159)

Pattern S159 root cause documentata in `feedback_pattern_S159_mitigation.md`:
> "proposte applicate meccanicamente senza ancoraggio decisioni founder già closed → drift; 5 rebrand in S166".

Mitigation esistente (skill `pre-action-check`) richiede `DECISIONS.md` con DECIDED entries per produrre i 3-line check (D-XX rif + vincolo founder + fonte dati). Stato attuale: **coverage 2/3 progetti**. Guardian senza DECISIONS.md = pre-action-check disattivato per Guardian = pattern S159 può ripresentarsi nativo lì. FLUXION con 95 righe è troppo thin per coprire decision drift (caso `project_fluxion_real_product` corretto S171 = drift su cosa-è-FLUXION possibile perché DECIDED entries sparse).

`decision-template` è **upstream**: senza di esso, la closure verde delle decisioni founder non è enforceable cross-progetto, e il pattern S159 — che è anche pattern di **mancata closure di decisioni già prese** — resta aperto su 1/3 portafoglio attivo.

### Confronto con gli altri 3 gap (perché non primi)

- **`session-health`**: gestisce vincolo #7 (context budget), riduce ARANCIONE/PARTIAL (vincolo #6). **Non blocca decision drift**: una sessione al 30% context può ancora rebrandare D-26. Secondario.
- **`pipeline-runner`**: orchestrazione gate atomici. Utile per FLUXION/ARGOS execution, ma sovrapposto con skill `gsd:*` già disponibili. **Non tocca decisioni founder**. Terzo.
- **`llm-router` (full multi-role)**: infra LLM. Espande copertura ruoli, **nessun impatto su pattern rebrand decisionale**. Ultimo.

### Trade-off (2 righe)

Pro: copertura pre-action-check 2/3 → 3/3, taglia root cause rebrand documentata, MVP <200 LOC (1 template + 1 validator JSONL).
Contro: non risolve context budget overflow (next iter: session-health) né execution atomicity (gsd:* nel frattempo).

### Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: che `pre-action-check` con DECISIONS.md popolato sia sufficiente. Caso S170 (workspace-split deciso DOPO violazioni cwd) mostra che drift può accadere anche con D-26 closed se il check nudge è fail-soft e Luke non legge l'output. Mitigazione: validator NON solo template, ma anche hook commit su `wiki/projects/<NAME>/` che rifiuta DECIDED entries malformate.
2. **Cosa rompe a 30/60/90gg**: template markdown statico → wiki morta senza review periodico. Pattern errore propagato dal caso `project_fluxion_real_product` (memory corretta S171 dopo doc drift). Fix: validator richiede `last_reviewed: YYYY-MM-DD` per ogni DECIDED entry, briefer mostra entries stale >90gg in Segnali.
3. **Pattern errori noti su sistemi simili**: ADR-driven dev (Architecture Decision Records) classicamente fallisce per friction-on-write. Se l'aggiunta di una DECIDED entry costa >2min, smette di essere usata. Vincolo MVP: snippet `vos decision add <project> <D-XX>` apre `$EDITOR` con frontmatter pre-compilato, total UX <30s.
4. **Dove sovradimensiono**: NON serve full ADR system, NON serve cross-linking automatico, NON serve UI. MVP = 1 template `templates/DECISION-entry.yaml` + 1 validator `components/decision-validator/validate.py` + Guardian backfill manuale 5-10 entries D-XX dalle memorie esistenti. Tutto ≤200 LOC + ≤100 righe markdown.

### Vincolo founder rispettato

- D-26 ARGOS (DECISIONS.md): non in conflitto, decision-template è infra VOS-meta, non ARGOS-ops.
- Vincolo #5 (zero-cost): solo stdlib + YAML, nessun servizio paid.
- Vincolo #12 (scope globale vs project-scoped): template in `~/venture-os/templates/`, validator in `~/venture-os/components/decision-validator/`, mai dentro `<progetto>/.claude/`.

### Fonte dati decisione

- `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_pattern_S159_mitigation.md` (root cause + mitigation B6 3-layer)
- `~/.claude/skills/pre-action-check/SKILL.md` (skill esistente, dependency)
- Filesystem evidence: `wiki/projects/Guardian/DECISIONS.md` MISSING, FLUXION 95 righe thin
- `brief-actions.jsonl` 14 mag: workspace-split decisione S170 emersa solo dopo violazioni → conferma che enforcement decisionale è gap operativo

---

## 4. Output S172 atteso (handoff prossima sessione)

Per chiudere S172 verde (vincolo #6):
1. Questo audit → `wiki/VOS-COMPLETION-AUDIT-S172.md` (✓ scritto).
2. Prossima sessione S173 apre con scope chiuso: implementazione `decision-template` MVP (template + validator + Guardian backfill).
3. `disk-keeper` flag in handoff: SSD MacBook 85% → keeper.py manuale entro 24h (azione Luke, non sessione).

Brief-actions S172 line da scrivere a chiusura:
```bash
echo '{"date": "2026-05-15", "brief_read": true, "action_taken": "S172-completion-audit+decision-template-priority", "source_match": false, "notes": "13 componenti audited: 11 ATTIVI / 2 STUB (disk-keeper trigger gap, sara-gate FLUXION-upstream-dep). 4 gap critici ranked: decision-template > session-health > pipeline-runner > llm-router-multirole. Prossima S173 implementa decision-template MVP."}' >> ~/venture-os/state/brief-actions.jsonl
```
