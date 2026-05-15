# S176 — disk-keeper LaunchAgent hardening + audit-bias closure

**Sessione**: S176 VOS coordinator
**Data**: 2026-05-15
**Predecessore**: S175 chiuso VERDE (gap 3+4 deload)
**Input**: flag aperto S175 #1 "disk-keeper cron/LaunchAgent settimanale: verificare se installato"
**Esito**: VERDE — già installato, hardened, audit S172 closure 5/5.

## Verifica fattuale (vincolo #1)

Flag S175 era basato su audit S172 stale ("disk-keeper mai eseguito post-S5"). Realtà verificata via `launchctl print`:

```
Label: com.luke.vos.disk-keeper
state = waiting
StartCalendarInterval: Weekday=1 Hour=9 Minute=0  (lunedì 09:00 weekly)
RunAtLoad = true
runs = 1  last exit code = 0
```

**Già installato + funzionante da prima di S176.** Esecuzioni recenti documentate in `state/disk-keeper-log.jsonl` (15 mag multiple manuali).

## Pattern recognition (vincolo #11)

Pattern "audit-completion-bias" — già flaggato in S175 per gap pipeline-runner/llm-router. Ricorre qui: flag aperto S175 derivato da audit S172 senza verifica `launchctl list`. Pattern strutturale: voci "to-implement" da audit vanno validate con state corrente prima di consumare turn implementativi.

**Mitigation S176**: validation-before-implement-from-audit. Prima di iniziare implementazione da flag derivato da audit datato, eseguire 1 comando di verifica state attuale. Costo: ~30 sec. Risparmio: turn implementativo intero.

Aggiungo questa regola al pattern S175 §autocritica punto 2 (audit-completion-bias) come corollario.

## Issues residui risolti S176

### Issue 1 — Manca stdout/stderr log per debug weekly run

**Symptom**: plist senza `StandardOutPath`/`StandardErrorPath`. Run weekly invisibile salvo audit jsonl applicativo. Errori python potenziali silent.

**Fix**: aggiunti `StandardOutPath` e `StandardErrorPath` → `~/Library/Logs/VOS/disk-keeper-stdout.log` / `disk-keeper-stderr.log`.

### Issue 2 — launchd rifiuta path stdout/stderr su volume external

**Symptom iniziale**: configurato stdout/stderr su `/Volumes/MontereyT7/venture-os/state/`. Boot LaunchAgent → `last exit code = 78: EX_CONFIG`. File log mai creati nonostante `touch` manuale ok.

**Root cause**: launchd policy macOS rifiuta `StandardOutPath`/`StandardErrorPath` su volumi external (/Volumes/*). Constraint non documentato esplicitamente in `launchd.plist(5)` ma comportamento riprodotto consistentemente con bootstrap fresh: stesso plist con path locale → exit 0. Stesso plist con path T7 → exit 78 EX_CONFIG.

**Fix**: log launchd (stdout/stderr) in `~/Library/Logs/VOS/`. Audit applicativo (jsonl) resta in T7. Trade-off: launchd logs sono fallback debug only, audit reale è in T7.

**Vincolo CLAUDE.md "storage VOS T7"**: rispettato — il payload audit è in T7. Solo bootstrap-time stdout/stderr (failure modes raros) sono in Library/Logs.

## Verifica post-fix

```bash
$ launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.luke.vos.disk-keeper.plist
$ launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.luke.vos.disk-keeper.plist
$ launchctl print gui/$(id -u)/com.luke.vos.disk-keeper | grep -E "state|exit|runs"
    state = waiting
    runs = 1
    last exit code = 0
$ tail ~/Library/Logs/VOS/disk-keeper-stdout.log
    OK  liberato 512.0 KB  (512.0 KB -> 0.0 B)  /Users/macbook/Library/Caches/Google
    [disk-keeper] Disco / ora al 83%
```

Cleanup eseguito automaticamente al bootstrap (RunAtLoad=true), 512KB Google cache liberati. Next scheduled run: lunedì 18 maggio 2026 09:00.

## Backup

- `~/Library/LaunchAgents/com.luke.vos.disk-keeper.plist.bak.s176` — plist pre-modifica.

## Critica strutturale (vincolo #4)

1. **Assunzione nascosta**: lo stato "weekly trigger funziona" è verificato fino al PROSSIMO lunedì. Non posso fare time-travel. Se launchd policy cambia o disco T7 non monto al trigger time, run salta. Mitigazione: keeper.py ha `require_t7_or_exit` (linea 191) — se T7 non monto, exit code != 0 finisce in stderr log → visibile a operatore. Detectable.
2. **Cosa rompe a 30/60/90gg**: macOS upgrade (improbabile: Big Sur frozen per Luke) potrebbe rompere launchctl bootstrap syntax. Mitigazione: backup plist preservato. Restore = 1 comando `bootstrap`.
3. **Pattern errori noti**: LaunchAgent installati e dimenticati = fail silent classico (caso Guardian S24-26). Mitigazione strutturale: morning-briefer dovrebbe controllare `last exit code` di tutti gli agent VOS e flaggare in Segnali. NOT IMPL S176 — defer S177 se gap si manifesta. Per ora `LastExitStatus` esposto via `launchctl list` accessibile manualmente.
4. **Dove sovradimensiono**: stavo per scrivere `validator-launchagents.py` per audit tutti i 7 plist VOS-luke. Tagliato. Validate-all-launchagents è scope nuovo, non flag S175 → futuro on-demand.

## Vincoli founder rispettati

- Vincolo #1 (verifica fattuale): `launchctl list` + `launchctl print` eseguiti prima di scrivere claim "già installato".
- Vincolo #3 (no A/B tecnico): decisione path Library/Logs vs T7 presa unilateralmente con dato EX_CONFIG=78 ripetibile.
- Vincolo #6 (no PARTIAL): chiude VERDE, hardening completo, verifica empirica eseguita.
- Vincolo #11 (pattern recognition): "audit-completion-bias" ricorre, regola "validation-before-implement-from-audit" aggiunta.

## Audit S172 closure

Aggiornamento: audit S172 chiude 5/5 voci (no più 4/4 come riportato in S175).

| Voce audit | Sessione | Esito |
|------------|----------|-------|
| decision-template | S173 | IMPLEMENTED |
| session-health | S174 | IMPLEMENTED |
| pipeline-runner | S175 | DELOAD (overlap gsd:*) |
| llm-router multi-role | S175 | DELOAD (no demand) |
| **disk-keeper trigger weekly** | **S176** | **VERIFIED + HARDENED (era già installato)** |

Update `wiki/VOS-COMPLETION-AUDIT-S172.md` necessario (sezione 6 voci flagged).

## Brief-actions log

```bash
echo '{"date": "2026-05-15", "brief_read": true, "action_taken": "S176-disk-keeper-launchagent-hardening", "source_match": false, "notes": "disk-keeper LaunchAgent gia installato da prima S176 (lunedi 09:00 weekly, RunAtLoad=true, last_exit=0). Hardening: aggiunti StandardOutPath/StandardErrorPath in ~/Library/Logs/VOS/ (T7 rifiutato da launchd policy, exit 78 EX_CONFIG). Audit S172 closure 5/5. Pattern audit-completion-bias ricorre da S175."}' >> ~/venture-os/state/brief-actions.jsonl
```

## Flag aperti per S177

Da S175 residui (ordine raccomandato CTO, vincolo #3):

1. **OQ-02 Guardian deep research zero-cost client edge-inference-mobile** (vos-scout, ~45min) — esplorativo
2. **OQ-01 Guardian pulizia smartphone scope** — discovery founder dedicata, blocking V2
3. **routing.yaml validate hook** — enforcement policy demand-driven role addition
4. **Calibration session-health CHARS_PER_TOKEN** — defer fino primo falso positivo
5. **morning-briefer LaunchAgent health check** — emerso da autocritica S176 punto 3, defer

**CTO call S177 raccomandato (vincolo #3)**: (1) OQ-02 Guardian deep research. Motivo: Guardian V2 scope OPEN bloccato anche da OQ-01, ma OQ-02 sblocca architettura clienti (D-05) indipendentemente dallo scope. Avanza il path critico più lungo.

## Prompt resume S177

```
Sessione S177 VOS. S176 chiuso VERDE — disk-keeper LaunchAgent verificato gia installato
+ hardened (stdout/stderr in ~/Library/Logs/VOS/, T7 rifiutato da launchd EX_CONFIG=78).
Audit S172 closure 5/5.

LEGGI:
- /Volumes/MontereyT7/venture-os/wiki/notes/S176-disk-keeper-launchagent-hardening.md
- /Volumes/MontereyT7/venture-os/wiki/notes/S175-gaps-3-4-deload.md (pattern audit-completion-bias)

TASK RACCOMANDATO (CTO call, vincolo #3):
S177 = OQ-02 Guardian deep research zero-cost client edge-inference-mobile via
vos-scout. Apre branch ma sblocca path critico Guardian V2 architettura (D-05).

NON FARE:
- Riaprire flag S175/S176 senza demand reale
- ARGOS/FLUXION operations (workspace split, vincolo memory)
- Implementare da flag derivati da audit S172 senza verifica state attuale (regola S176)

VINCOLI: CLAUDE.md v1.1 invariati.
```
