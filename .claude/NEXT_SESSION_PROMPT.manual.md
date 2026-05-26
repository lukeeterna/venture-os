# NEXT_SESSION_PROMPT — VOS chiusura 2026-05-26 → ripartenza S+

**Generato**: 2026-05-26 18:05 UTC (override prompt auto-generato session-end hook)
**Sessione chiusa**: 9690fad5-e74c-4b6c-a75c-a369063c7537
**Tipo**: audit cross-progetto + deploy MVP infrastruttura task-context fit
**Stato**: VERDE — tutto testato, no PARTIAL (vincolo #6)

---

## Sessione 2026-05-26 — cosa è stato fatto

Sessione triggerata da audit Luke su FLUXION S290 (privkey persa, context 71%→81%
HARD_STOP). Allargata cross-progetto a ARGOS S192 (compact a 100%) e FLUXION S296
(gate false positive bypass anti-pattern). Ha prodotto:

### Fix infrastrutturali (8 file modificati/creati)

**Hooks globali `~/.claude/hooks/`** (fuori repo VOS):
- `global_context_gate.py` → PreToolUse HARD_BLOCK @80% deny eccetto chiusura
- `post_compact_validation.py` → nuovo, forza validation prompt post-/compact
- `task_context_logger.py` → nuovo, MVP v0.1 logger UserPromptSubmit
- `session_peak_logger.py` → nuovo, Stop bridge consumer
- `settings.json` → registra i 3 hooks nuovi

**Hooks FLUXION `/Volumes/MontereyT7/FLUXION/.claude/hooks/`** (fuori repo VOS):
- `pre_write_gate.py` → word-boundary + tests/ whitelist + fixture-/test- bypass
- `context_budget_gate.py` → osascript notification CLOSING_ONLY/HARD_STOP + merge bridge
- `check-services.sh` → VOS broadcast injection single-shot mechanism

**LaunchAgent `~/Library/LaunchAgents/`** (fuori repo VOS):
- `com.luke.vos.task-fit-monitor.plist` → daily 08:00 anomaly + calibration tracker

**Componenti VOS** (in repo):
- `components/task-fit-monitor/monitor.py` → script daily
- `components/morning-briefer/briefer.py` → consumer monitor jsonl in sezione Segnali

### Handoff scritti
- `handoffs/FLUXION-S290-additions.md` → privkey rigenerazione kid v2 + CF token scope
- `handoffs/CLAUDE-AI-VALIDATION-task-context-fit-gate.md` → verdict claude.ai REVISE + MVP design

### Audit deviations (8 nuove entries in state/blueprint-deviations.jsonl)
- fluxion-context-gate-invisible-delivery (HIGH, fixed)
- fluxion-bridge-file-race-condition (MED, fixed)
- fluxion-privkey-tmp-generation-antipattern (HIGH, action required S+ FLUXION)
- fluxion-pre-write-gate-false-positive-test-fixture (MED, fixed)
- global-context-gate-no-hard-enforcement (HIGH, fixed)
- post-compact-no-validation-gate (HIGH, fixed)
- task-context-fit-gate-mvp-deployed (INFO)
- sXXX-task-md-needs-budget-phase-field (MED, deferred cross-progetto)

### Memoria scritta
- `project_task_context_fit_mvp.md` → MVP design + calibration plan
- `MEMORY.md` aggiornato con pointer

---

## Per la prossima sessione VOS

### Vincoli da rispettare

1. **NO introduzione gate hard SPLIT-forcing prima del 2026-06-09 + N≥50 joined sessions**
   (verdict claude.ai: "Costruisci prima il logger, la gate dopo i dati")
2. **NO modifica template sXXX_task.md** senza sessione dedicata cross-progetto
3. **NO disable `CLAUDE_VIOLATION_GATE_MODE=block`** in settings.json

### Comandi rapidi stato

```bash
# Stato monitor manuale (anomaly detection + calibration readiness)
python3 ~/venture-os/components/task-fit-monitor/monitor.py

# Statistiche logger correnti (deve crescere monotonicamente con uso CC)
wc -l ~/venture-os/state/task-fit-scores.jsonl ~/venture-os/state/session-peaks.jsonl

# Correlation rapida quando N >= 50
python3 -c "
import json
from pathlib import Path
scores = {}
for line in Path.home().joinpath('venture-os/state/task-fit-scores.jsonl').read_text().splitlines():
    d = json.loads(line)
    if d.get('file_detected') and d.get('score_pct_of_1M'):
        scores[d['session_id']] = d['score_pct_of_1M']
peaks = {}
for line in Path.home().joinpath('venture-os/state/session-peaks.jsonl').read_text().splitlines():
    d = json.loads(line)
    if d.get('final_context_pct'):
        peaks[d['session_id']] = d['final_context_pct']
joined = [(sid, scores[sid], peaks[sid]) for sid in scores if sid in peaks]
for sid, s, p in sorted(joined, key=lambda x: -x[2]):
    print(f'{sid[:8]}  score={s:5.1f}%  peak={p:5.1f}%  ratio={p/max(s,0.1):4.1f}x')
print(f'N={len(joined)}, calibration target 2026-06-09 + N>=50')
"
```

### Trigger per riapertura sessione VOS dedicata

- **2026-06-09**: brief mattutino mostrerà `task-fit-monitor: calibration READY` se N≥50 → apri sessione VOS per analisi correlazione + decidere soglia gate
- **Anomalia HIGH/CRITICAL** rilevata da monitor → notifica desktop osascript + brief segnale → indaga
- **Heartbeat silente >24h** task_context_logger o session_peak_logger → fail-soft mascherato, debug hook

### Deferred task aperti (priority MED)

- **`budget_phase` field in template sXXX_task.md** cross-progetto. Claude.ai punto 1 verdict: fix primario è nel template, non hook. Richiede coordinamento ARGOS/FLUXION/Guardian per format canonico. Apri quando hai 3 progetti in fase contemporaneamente stabile.

---

## Reference

- Verdict claude.ai integrale: `~/venture-os/handoffs/CLAUDE-AI-VALIDATION-task-context-fit-gate.md`
- Handoff FLUXION S290: `~/venture-os/handoffs/FLUXION-S290-additions.md`
- Audit sessione: `git log --oneline | grep "VOS audit S290"` + `state/blueprint-deviations.jsonl`
