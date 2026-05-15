# S174 — session-health implementation

> Sessione: S174 VOS — chiusura gap #2 da ranking S172
> Data: 2026-05-15
> Stato: VERDE (probe validato, hook briefer integrato, output coerente)

## Scope chiuso

Gap #2 da `VOS-COMPLETION-AUDIT-S172.md` (ranking gap critici):
- gap #1 decision-template ✅ chiuso S173
- gap #2 session-health ✅ chiuso S174 (questo)
- gap #3 pipeline-runner ⏸ S175+
- gap #4 llm-router multi-role ⏸ S175+

## File modificati/creati

```
NEW   components/session-health/health.py             (276 righe, 224 logical LOC)
NEW   state/session-health.jsonl                       (append-only output)
NEW   wiki/notes/S174-session-health-impl.md          (questo file)
MOD   components/morning-briefer/briefer.py            (+1 const SESSION_HEALTH, +18 righe hook in _signals)
APP   state/brief-actions.jsonl                        (linea S174 a chiusura)
```

## Design implementato

### Probe (`components/session-health/health.py --probe`)

Auto-detect session jsonl più recente in `~/.claude/projects/-Volumes-MontereyT7-venture-os/`.
Override path via `--session <id-or-path>` e `--project-dir <path>`.

Metriche estratte:
- `turn_count`: somma record `type=user` + `type=assistant` (nota: tool_use/tool_result aumentano turn_count perché Claude Code li registra come messaggi separati. Soglia 80 calibrata su questo).
- `total_chars` → `est_tokens` (chars / 3.3) → `context_pct` su window 200000 default (override `VOS_CTX_WINDOW_TOKENS=1000000` per variante 1M).
- `drift_signals`: entries `state/blueprint-deviations.jsonl` con `ts >= first_ts` sessione. Proxy pattern-recognition vincolo #11 e #4.
- `session_age_minutes`: now - `first_ts` (primo record con timestamp non-null).

Verdict:
- context: warn ≥50% (vincolo #7), critical ≥70%
- turn: warn ≥80, critical ≥120
- drift: warn ≥3
- overall = max severity tra i 3

Soglie tunable via env (`VOS_SH_CTX_WARN`, `VOS_SH_TURN_WARN`, `VOS_SH_DRIFT_WARN`, ecc.).

### Hook briefer

`components/morning-briefer/briefer.py::_signals()` legge ultima riga `state/session-health.jsonl`.
Se `overall != ok` → riga Segnali:
`session-health WARN (sid=XXX 0.2h / 57 turn / ctx 7.73% / drift 0) — vincolo #7 chiudi sessione`

Coerente con pattern altri hook esistenti (tool-scout, routing-refresh, decision-validation).

### Trigger

Manuale only (S174 scope chiuso):
```bash
python3 ~/venture-os/components/session-health/health.py --probe
```

Modalità hook (quiet, exit code ok):
```bash
python3 ~/venture-os/components/session-health/health.py --probe --quiet
```

LaunchAgent deferred a S175+ (decision: la probe è utile on-demand quando founder vuole snapshot pre-/context, non in continuo).

## Validation

Run su sessione S174 corrente (commando `python3 components/session-health/health.py --probe`):
```json
{
  "turn_count": 44, "user_turns": 18, "assistant_turns": 26,
  "total_chars": 48985, "est_tokens": 14843,
  "context_pct": 7.42, "drift_signals": 0,
  "session_age_minutes": 4.4,
  "overall": "ok"
}
```

Test scenario warn (env soglie basse `VOS_SH_CTX_WARN=1 VOS_SH_TURN_WARN=10`):
verdict overall=warn, briefer rigenerato include riga `session-health WARN`. Entry test rimossa post-validazione.

## Autocritica strutturale (vincolo #4)

### 1. Assunzione nascosta
`context_pct` da char count / 3.3 è proxy grossolano. JSON envelope + tool_result lunghi gonfiano chars rispetto a token reali; viceversa, system prompt + memory + skills caricati dal harness NON sono nel jsonl ma occupano context window reale.

→ Heuristic underestima il vero `/context`. Mitigazione: documentato in commento codice (`CHARS_PER_TOKEN` tunable), soglia warn al 50% lascia margine. Calibrazione future: confronto `/context` reale vs probe stesso turno, aggiusto `CHARS_PER_TOKEN` o aggiungo `STATIC_CONTEXT_BUDGET` (system+memory bytes fissi).

### 2. Cosa rompe a 30/60/90gg
- Schema `~/.claude/projects/*/session.jsonl` può cambiare con upgrade Claude Code (è formato interno, non API stabile). Già visto evoluzione attachment/permission-mode/last-prompt types.
- Mitigazione: `_extract_text_chars` resiliente (best-effort, ritorna 0 su shape sconosciuta), `parse_bad_lines` count tracciato in output → segnale futuro se >10% bad lines.
- `drift_signals` su `blueprint-deviations.jsonl` cresce monotonicamente; dopo 90gg il ts-since-session-start filter resta corretto perché ts ISO è string-comparable. OK.

### 3. Pattern errori noti
Self-monitoring tool simili (cli-prompt-rate-limiter, etc) falliscono quando:
- (a) misurazione modifica il monitorato (Heisenberg): qui safe perché append-only, no side-effect sul jsonl Claude. ✓
- (b) il segnale arriva troppo tardi: probe è on-demand, NON sostituisce `/context` realtime, è solo audit. Se founder dimentica probe → segnale assente.
  → Mitigazione futura S175: LaunchAgent ogni 10min + warning push se overall=critical, OPPURE hook SessionEnd in `~/.claude/settings.json` che salva probe alla chiusura sessione (più adatto a vincolo #6 handoff).
- (c) falso positivo: probe legge MOST_RECENT jsonl in project_dir, ma se altre sessioni concorrenti su altro cwd VOS-related esistono, può misurare quella sbagliata. Oggi unico project_dir per cwd `/Volumes/MontereyT7/venture-os/` → safe.

### 4. Dove sovradimensiono
- `_classify` con dict `levels` per max severity: 5 righe per logica che poteva essere `overall = "critical" if ... else "warn" if ... else "ok"`. Marginale, accettabile per leggibilità.
- Env override `VOS_SH_CHARS_PER_TOKEN`: tunable mai usato day-1. Tenuto per calibration futura (autocritica punto 1).
- `--project-dir` arg: hardcodato project venture-os in default. CLI flag per estendere a future probe su altri progetti (Guardian/ARGOS che usano Claude Code) → utile, non sovradimensione.

NON sovradimensiono: nessun DB, nessuna UI, nessun daemon, nessuna dependency (stdlib only vincolo #5).

## Vincoli rispettati

- **#3 mai liste A/B/C/D**: design singolo motivato, no opzioni a founder.
- **#4 autocritica obbligatoria**: 4 punti sopra.
- **#5 zero-cost**: stdlib only (`argparse`, `json`, `pathlib`, `datetime`), no pip install.
- **#6 mai PARTIAL**: probe restituisce exit 0/1/2 strutturato, no stato ambiguo.
- **#7 context budget**: la feature SERVE vincolo #7. Soglia warn 50%, critical 70% mappa diretta a "chiudi sessione" del founder.
- **#10 verificato > verosimile**: probe testato su sessione reale, output JSON coerente, scenario warn validato e poi pulito.
- **#11 pattern strutturale**: drift_signals proxy per pattern S159 recurrence. Hook briefer è infrastruttura anti-drift, non monitoring episodico.
- **#12 scope globale**: `~/venture-os/components/session-health/`, mai dentro `<progetto>/.claude/`.

## Pattern-recognition log (vincolo #11)

- **Pattern self-monitoring infra VOS**: S174 segue stesso template di host-monitor (S2), tool-scout (S7), routing-refresh (S12), decision-validator (S173) → mount_check, append-only jsonl, hook briefer, error log isolato. Componenti VOS converging su pattern coerente.
- **Pattern context-budget enforcement evolution**:
  - S159 root cause: drift dopo 70%+ context senza /context check
  - S173: vincolo #7 documentato in CLAUDE.md ma manual
  - S174: probe + segnale briefer (passive, no enforcement automatico)
  - Future S175+: hook SessionEnd o LaunchAgent per active enforcement

## Flag aperti per S175

1. **heretic-retry-d23 broken** (status 78, side-discovery S173): non chiuso in S174 — scope primario session-health completato, secondario rimandato per chiusura ordinata. Migrare bash wrapper plist a Python direct pattern.
2. **Gap #3 pipeline-runner**: dopo S174, sessione dedicata.
3. **Gap #4 llm-router multi-role**: dopo S174, sessione dedicata.
4. **OQ-02 Guardian deep research zero-cost client**: scout `edge-inference-mobile`.
5. **OQ-01 Guardian pulizia smartphone scope**: discovery founder.
6. **Calibration session-health `CHARS_PER_TOKEN`**: confronto vs `/context` reale (autocritica punto 1).
7. **SessionEnd hook** (Claude Code) o LaunchAgent 10min: enforcement automatico (autocritica punto 3.b).

## Prompt resume S175

```
Sessione S175 VOS. Chiusura task secondario S174 + scelta gap successivo.

LEGGI:
- /Volumes/MontereyT7/venture-os/wiki/notes/S174-session-health-impl.md (gap #2 chiuso)
- /Volumes/MontereyT7/venture-os/wiki/HANDOFF-VOS-S173-decision-template-disk-keeper.md (flag heretic-retry-d23)

TASK CANDIDATI (scegli UNO, no parallelo):
1. heretic-retry-d23 plist status 78: investigare `scripts/heretic-d23-retry.sh`,
   migrare a Python direct pattern (come disk-keeper S173) o deload se obsoleto.
   ETA: 30-60min.
2. gap #3 pipeline-runner MVP (orchestratore discuss→plan→execute con commit
   atomici). Verifica overlap con skill `gsd:*` prima di implementare.
3. gap #4 llm-router multi-role expansion (`reasoning`, `coding`, `vision`, `cheap`
   roles oltre attuale `long_context`).

VINCOLI: CLAUDE.md v1.1 invariati.
```
