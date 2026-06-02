# DEFERRED — Spec enforcement hook per vincolo 1d

> **Stato**: DIFFERITO. Costruire SOLO quando (a) arriva un 2° caso della classe 1d (`n≥2`) E (b) VOS è riaperto (oggi paused pre-€800). Finché no, 1d vive come regola in `~/.claude/CLAUDE.md` letta a ogni boot.
> **Genesi**: incidente MEMORY-S327 (riscrittura LLM-lossy di MEMORY.md), review avversariale Claude.ai 2026-06-02, validazione empirica doc CC + infra VOS.
> **Threat-model dichiarato**: sbadataggine di CC, NON evasione attiva. Il gate deve catturare i modi *naturali* di sbagliare, non essere evasion-proof. Dichiarare completezza = security theater; scopare alla sbadataggine = barriera reale.

## Regola sorgente
`~/.claude/CLAUDE.md` § 1d. Questa spec è solo l'implementazione del suo HOW.

## Fatti verificati (2026-06-02, NON assumere — già validati)
- PreToolUse riceve `tool_input.command` (Bash, stringa intera) e `tool_input.file_path` (Write/Edit). Fonte: doc CC + `auto_code_review.py:101`, `vos_pretool_gate.sh:15`.
- matcher supporta `"Write|Edit|Bash"`. Blocco canonico = stdout JSON `{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"..."}}` con exit 0. (exit 2 = errore non-controllato, evitare.)
- Estrazione path da Bash arbitrario NON è sound (command-substitution/variabili/pipe sfuggono). Accettato: matching euristico sui vettori nominati.
- Source-of-truth e `state/*.jsonl` sono path DISGIUNTI → over-fire eliminato per costruzione con whitelist per-file-nominato.

## Design

### 1. Trigger per-EFFETTO (non per-tool)
PreToolUse matcher `"Write|Edit|Bash"`, script unico `~/.claude/hooks/source_of_truth_guard.py`.

Estrazione path-target:
- tool `Write`/`Edit` → `tool_input.file_path` (diretto, sound).
- tool `Bash` → regex euristica su `tool_input.command` per i vettori nominati:
  - redirect overwrite: `>\s*<path>` (escludi `>>` che è append → lossless, NON blocca)
  - `mv\s+\S+\s+<path>`, `rm\s+(-\S+\s+)*<path>`, `sed\s+-i`, `truncate\s+.*<path>`, `tee\s+<path>` (senza `-a`), `cp\s+\S+\s+<path>` (overwrite del target).
- Normalizza il path estratto (`os.path.realpath`, espandi `~`) e confronta con whitelist.

### 2. Whitelist ESPLICITA per-file (mai glob di directory)
Config in `~/venture-os/config/source-of-truth-whitelist.yaml` (da creare):
```yaml
# match per realpath esatto O per pattern file-name in dir nominata
files:
  - ~/.claude/CLAUDE.md
  - ~/.claude/projects/*/memory/MEMORY.md      # auto-memory, 9 file
patterns:
  - "**/wiki/projects/*/DECISIONS.md"
  - "**/PLAN.md"                                 # project root only
  - "**/*.sqlite"                                # project DB
  - "**/*.db"
exclude_always:                                  # additivo = lossless, MAI bloccare
  - "**/state/*.jsonl"
  - "**/*.log"
```
Se path-target ∉ whitelist → PASS (exit 0, no JSON). Tenere stretta: over-fire = rumore = morte del gate per ignore-rate.

### 3. Backup verificato per PROPRIETÀ (deterministico, no LLM, load-bearing)
Se path-target ∈ whitelist, cerca un backup valido. NON basta che esista la stringa `*.bak`. Criteri TUTTI veri (verifiche `os.stat`):
- esiste un file `<path>.bak.*` (stesso basename del target);
- `st_size > 0` (no `touch`-vuoto, no file già troncato a 0);
- `st_mtime` del backup ≤ ora-corrente E precedente all'edit in corso (backup PRE non POST);
- directory del backup ≠ `/tmp` e ≠ `$TMPDIR` (no dir volatile);
- opzionale rafforzativo: `st_size` del backup ≥ soglia ragionevole rispetto allo storico (anti backup-di-file-già-svuotato).

Backup valido → PASS. Assente/invalido → DENY con `permissionDecisionReason`: "1d: <path> è source-of-truth non-rigenerabile. Backup valido assente. Esegui `cp <path> <path>.bak.$(date +%Y%m%d-%H%M%S)` e cita il path, poi riprova."

### 4. Clausola RIDUZIONE (c) — NON automatizzabile in hook, resta regola
"Il contenuto necessario è presente dopo" non è verificabile deterministicamente da un hook (richiederebbe semantica). Resta enforcement *comportamentale* via testo 1d: su una riduzione, vietato dichiarare done su soglia di dimensione. Eventuale check debole automatizzabile: warn (non block) se l'azione riduce un source-of-truth di >X% e il done-claim della sessione cita "righe"/"byte"/"size" → flag in `state/cc-violations.jsonl` per review umana. Da valutare a n≥2.

### 5. Modalità & rollout (allineato a global_violation_gate.py)
- Fase 1 `MODE=log`: logga in `~/venture-os/state/cc-violations.jsonl` senza bloccare, 1 settimana, misura false-positive rate.
- Fase 2 `MODE=block`: attiva DENY solo se false-positive ≈ 0. Stessa disciplina data-driven di `global_violation_gate.py` (oggi log-only, 150 entry).
- Rollback: rimuovere l'entry hook da `settings.json` (backup `settings.json.bak.*` prima di toccarlo — 1d su sé stesso).

## Limiti onesti (autocritica #4)
1. **Assunzione**: la whitelist resta stretta e aggiornata. Se cresce a glob → frizione → morte. Mitigazione: per-file-nominato, review periodica.
2. **30/60/90gg**: i `.bak` proliferano e sporcano `git status`. Serve `*.bak.*` in `.gitignore` + cron di pruning (>30gg) — altrimenti la cura genera bloat.
3. **Bypass residuo**: indirection in Bash (`$VAR`, command-substitution, pipe a `tee` via script) sfugge. Accettato: fuori threat-model (sbadataggine, non evasione). Se un giorno il threat-model cambia → serve FS-monitor/sandbox, fuori scope zero-cost Big Sur.
4. **Clausola (c)** non automatizzabile senza semantica → resta comportamentale. Non fingere che l'hook la copra.
