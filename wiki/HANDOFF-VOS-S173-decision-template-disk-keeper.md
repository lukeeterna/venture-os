# HANDOFF VOS S173 → S174

> **Sessione chiusa**: S173 — decision-template MVP + S173 esteso (CTO autonomous, 3 flag handoff S174 chiusi)
> **Stato**: VERDE (gate raggiunto, scope chiuso pulito)
> **Context out**: ~15-18% stimato (chiusura ordinata, non forzata da budget)
> **Data**: 2026-05-15

---

## Cosa è stato chiuso in S173

### Core (gap #1 da S172 ranking)
1. **Template schema** → `templates/DECISION-entry.yaml` (87 righe)
   - Pattern regex header, status enum esteso (DECIDED/OPEN/SUPERSEDED/DEFERRED/PROPOSED), stale_days=90, field patterns.
2. **Validator** → `components/decision-validator/validate.py` (173 logical LOC < 200 vincolo)
   - Args `--project=ARGOS|FLUXION|Guardian`, `--quiet`. Output `state/decision-validation.jsonl`. Exit 0/1/2/3.
   - Edge cases gestiti: emoji prefix status, date YYYY-MM legacy → warning, `**Decisione proposta**` come alias.
3. **Briefer hook** → `morning-briefer/briefer.py` modificato
   - `_signals()` consuma `decision-validation.jsonl` ultimo run (malformed/stale/missing in Segnali).
   - `_run_decision_validator()` invocato pre-aggregazione (subprocess timeout 10s, fail-soft).
4. **Guardian DECISIONS.md** → `wiki/projects/Guardian/DECISIONS.md` (4 DECIDED + 1 OPEN + 6 OQ)
   - **Pattern S159 doc drift risolto**: Guardian = suite 2 verticali (V1 fall-detection in `~/fall-poc/`, V2 pulizia smartphone TBD). Founder S173 ha chiarito esplicitamente.
   - D-01 scope 2 verticali | D-02 stack fall-detection (YOLOv8n+LSTM+MQTT) | D-03 activation gating zero-FP ≥30min | D-04 pulizia smartphone scope OPEN | D-05 architettura clienti zero-cost IP cam + smartphone (deep research pending OQ-02).
5. **Validator final run**: `[ARGOS] 29/29 ok — 4 warnings | [FLUXION] 3/3 ok | [Guardian] 5/5 ok | verdict: OK`

### S173 esteso (CTO autonomous, context surplus)
6. **CLAUDE.md riga 47 update** ✅ — Guardian descritto come suite 2 verticali con riferimenti D-02/D-03/D-04/D-05 + path DECISIONS.md. OQ-05 chiuso.
7. **Disk-keeper LaunchAgent settimanale** ✅
   - `~/Library/LaunchAgents/com.luke.vos.disk-keeper.plist` installato (RunAtLoad + StartCalendarInterval Mon 09:00, Python direct pattern).
   - Whitelist estesa: `~/Library/Caches/Google` (~994MB) + `~/Library/Caches/com.facebook.archon.developerID` (~199MB).
   - Briefer: aggiunta soglia `DATA_SSD_CRITICAL = 90.0` (warning forte).
   - Deviation log: `state/blueprint-deviations.jsonl` event `missing-cron-trigger-resolved`.
   - Verification: `launchctl list` status 0, clean event registrato 17:02:43Z, df_root_pct 86%→83%.

### Side-discovery (richiede S174)
- **bash wrapper pattern fragile in plist VOS** (status 126 ripetuto). Python direct pattern (tool-scout/claude-memory/host-monitor) funziona consistente.
- **heretic-retry-d23 LaunchAgent status 78** (broken, stessa root cause bash wrapper). Sub-task S174.

---

## Flag aperti per S174 (priorità ordinata)

1. **Gap #2 session-health** ← **PRIMO** (handoff S172 ranking, vincolo #7 oggi manuale via /context).
2. **heretic-retry-d23 broken**: status 78 launchctl. Investigare se script ancora necessario per D-23 ARGOS retry, migrare a Python direct pattern se sì, deload se no.
3. **OQ-02 Guardian deep research zero-cost client inference**: founder S173 esplicito "con dati". Skill `vos-scout` per area `edge-inference-mobile`. Variabili: on-device Core ML/TFLite vs Colab T4 ngrok vs Google ecosystem free (Drive + FCM).
4. **Gap #3 pipeline-runner** + **Gap #4 llm-router multi-role**: handoff S172 ranking. Sessioni dedicate post-session-health.
5. **OQ-01 Guardian pulizia smartphone scope dettagliato**: sessione discovery dedicata, founder TBD.

---

## Stato risorse a chiusura S173

- MacBook: CPU ~22%, RAM ~73%, Data SSD **83.0%** (post-cleanup S173 esteso, sotto soglia warn 85%)
- iMac: CPU 57.3%, RAM 63.7%, Data SSD 42.9%
- T7: 1.9% MacBook / 0.0% iMac
- Costi LLM mese: tracking attivo `state/costs.jsonl`, soglia <€30/mese

---

## File modificati/creati in S173

```
NEW   templates/DECISION-entry.yaml
NEW   components/decision-validator/validate.py
NEW   wiki/projects/Guardian/DECISIONS.md
NEW   wiki/notes/S173-decision-template-impl.md
NEW   wiki/HANDOFF-VOS-S173-decision-template-disk-keeper.md (questo file)
NEW   ~/Library/LaunchAgents/com.luke.vos.disk-keeper.plist
NEW   scripts/disk-keeper-weekly.sh (opzionale, conservato per CLI use)
MOD   components/morning-briefer/briefer.py (hook validator + soglia critica + Segnali decisions)
MOD   config/disk-keeper-include.yaml (+2 path whitelist)
MOD   ~/.claude/CLAUDE.md (riga 47 Guardian scope 2 verticali)
APP   state/decision-validation.jsonl (run line)
APP   state/blueprint-deviations.jsonl (missing-cron-trigger-resolved)
APP   state/brief-actions.jsonl (S173 + S173-extended lines)
APP   state/disk-keeper-log.jsonl (clean events post-LaunchAgent install)
```

---

## Prompt resume S174

```
Sessione S174 VOS. Implementazione gap #2 `session-health` (da S172 ranking, post-decision-template chiuso S173).

LEGGI:
- /Volumes/MontereyT7/venture-os/wiki/HANDOFF-VOS-S173-decision-template-disk-keeper.md (questo handoff)
- /Volumes/MontereyT7/venture-os/wiki/VOS-COMPLETION-AUDIT-S172.md (ranking gap originale)
- /Volumes/MontereyT7/venture-os/components/host-monitor/monitor.py (riferimento pattern monitor existing, NON sovrapporre)
- ~/.claude/CLAUDE.md vincolo #7 (context budget management)

TASK S174 PRIMARIO (scope chiuso):
1. Implementare `~/venture-os/components/session-health/health.py` (≤250 LOC, stdlib).
   Scope: monitor sessione Claude attiva (NON macchina, già coperto da host-monitor).
   Probe candidati:
   - context_pct: heuristic da log conversazione (token count proxy via wc -c su transcript se disponibile, oppure parsing `/context` output cached)
   - turn_count: estratto da .claude/projects/<encoded-cwd>/<session>.jsonl se accessibile
   - drift_signals: count incrementi blueprint-deviations.jsonl per session (proxy per pattern S159 risk)
   - session_age_minutes: da first message ts a now
   Output: `state/session-health.jsonl` append-only.
   Soglia warning: context_pct >=50% (vincolo #7), turn_count >=80 (drift risk), drift_signals >=3.
2. Hook briefer: aggiungere Segnali `session-health` ultimo run → "sessione attiva XXh / NN turn / drift YY" se valori sopra soglia.
3. NON eseguire come daemon. Trigger:
   - manual: `python3 components/session-health/health.py --probe`
   - LaunchAgent opzionale (deferred S175 se complex)
4. Validation: run probe corrente Claude session, verifica output coerente.

TASK S174 SECONDARIO (se context budget consente, altrimenti S175):
- **heretic-retry-d23 broken**: investigare `~/Library/LaunchAgents/com.luke.vos.heretic-retry-d23.plist` status 78. Migrare a Python direct pattern se script ancora necessario (verifica `scripts/heretic-d23-retry.sh` cosa fa), oppure deload se obsoleto.

VINCOLI:
- tutti CLAUDE.md v1.1
- vincolo #4: autocritica 4 punti su design session-health
- vincolo #5: zero-cost (stdlib only)
- vincolo #11: pattern recognition strutturale — session-health è infra per PREVENIRE drift pattern S159, non solo monitoring
- vincolo #12: scope globale `~/venture-os/components/session-health/`

NON FARE in S174:
- gap #3 pipeline-runner, gap #4 llm-router multi-role: sessioni separate (S175+)
- OQ-02 Guardian deep research: sessione dedicata vos-scout
- OQ-01 Guardian pulizia smartphone scope: sessione discovery founder dedicata
- Dashboard/UI session-health: out-of-scope permanente

Output atteso S174:
- 1 file creato (health.py)
- 1 hook briefer aggiunto
- 1 wiki note `wiki/notes/S174-session-health-impl.md`
- brief-actions line a chiusura
- (se secondario): heretic-retry-d23 plist fixed o deload + deviation log

DECISIONI TECNICHE PRE-DEFINITE (vincolo #3, non chiedere a founder):
- Accesso `~/.claude/projects/<encoded>/<session>.jsonl` = OK (infra VOS self-monitoring, no privacy issue).
- Soglie default: context_pct >=50% warn, >=70% critical (vincolo #7) | turn_count >=80 warn, >=120 critical | drift_signals >=3 warn. Tunable via config se serve.
```

---

## Pattern-recognition log (vincolo #11)

- **Pattern S159 mitigation propagazione**: pre-action-check skill ora coverage 3/3 progetti (era 2/3). Root cause closed.
- **Pattern doc-drift Guardian** (sotto-caso S159): identificato e risolto via D-01 Guardian + CLAUDE.md update. Stesso pattern di S171 (`project_fluxion_real_product`).
- **Pattern bash-wrapper-fragile LaunchAgent**: nuovo pattern emerso S173. Mitigation parziale (disk-keeper migrato a Python direct), residuo heretic-retry-d23 S174.
- **Pattern missing-cron-trigger**: identificato S172 (root cause disk-keeper 7gg drift), risolto S173 (LaunchAgent settimanale). Audit `state/blueprint-deviations.jsonl`.
