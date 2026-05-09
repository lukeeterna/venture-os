# PROMPT S34 — P0 NORTH STAR fix S32 Bug A+B (sessione dedicata mirata)

## Brief
S33 ha completato Phase 0 research esterna (taufeeque9/HumanFallDetection winner Feature 1, deferred S35). S34 è **sessione dedicata fix mirato** con scope chiuso: risolvere Bug A+B S32 senza research, senza scope creep, senza integration esterna. Plan dettagliato pronto da S32+S33 findings.

## Vincoli S34 (rigidi)
- **Scope chiuso**: solo Bug A+B fix + re-test live. NO research esterna, NO taufeeque9 integration, NO nuove features.
- **Budget context**: 50% target. Stimato realistic ~40% (no research overhead).
- **Pre-flight obbligatorio**: phone Termux SSH alive (`termux-wake-lock` se kill MIUI Doze).
- **NO re-enable cron** watchdog/health-check finché P0+P1+P2 ALL PASS.

## Plan atomico

### P0 — Fix Bug B zones.json polygon (smoking gun S32)
1. Backup: `ssh imac "cp ~/guardian/zones.json ~/guardian/zones.json.bak.s34"`
2. Edit `~/guardian/zones.json` soggiorno zona "divano":
   - OLD: `[[600,400],[1200,400],[1200,900],[600,900]]` (ingloba pavimento)
   - NEW: `[[650,500],[1150,500],[1150,800],[650,800]]` (sola superficie seduta)
3. Aggiungere zona `pavimento_soggiorno` con `safe: false` coprente area davanti divano `[[400,800],[1400,800],[1400,1000],[400,1000]]` (verificare con snapshot S32)
4. Reload Guardian: SIGHUP o restart controllato
5. Verify zone caricate: tail log `"zones loaded: ..."`

### P1 — Fix Bug A conf threshold 0.25→0.15
1. Test OFFLINE su 18 snap S32 `~/guardian/snapshots/s32/`:
   - Run `yolov8n-pose @conf=0.15` su tutti S1 (sdraiato divano) + S2 (sdraiato pavimento)
   - Atteso: recovery ≥7/9 S1 boxes (vs 1/9 @0.25 S32)
   - Verificare FP gatto bianco: deve restare ≤1 box stale
2. Se OK → bump `guardian.py` HPT path conf da 0.25 a 0.15
3. Restart Guardian

### P2 — Re-test live 90s controllato
1. Pre-flight: phone Termux SSH ack `termux-wake-lock; sshd`
2. Orchestrator riusa `~/guardian/s32_test.sh` (snap continuo + audio TTS phone)
3. Scenario S2 ridotto: 90s Luke sdraiato pavimento davanti divano
4. **Atteso**: FALL alert ≤30s, snap evidence catturati, log `cap_level→LYING_DOWN→FALLEN`
5. Audit visivo snap + Guardian log

### P3 — Production activation (SOLO se P0+P1+P2 PASS)
1. Re-enable cron watchdog (`# MAINTENANCE S29`) → uncomment
2. Re-enable cron health-check (`# MAINTENANCE S28+`) → uncomment
3. Telegram ping production "Guardian fall detection active S34"
4. 24h monitoring via Telegram

## Anti-pattern proibiti S34
- ❌ Research esterna (S33 chiusa, scope research esaurito)
- ❌ Integration taufeeque9 LSTM (backlog S35)
- ❌ Re-enable cron prima di ALL PASS
- ❌ Scope creep "già che ci siamo aggiungiamo X"
- ❌ Skip pre-flight phone Termux (vincolo S31)

## Reference S34
- `~/.claude/projects/.../memory/project_s32_findings.md` (smoking gun guardian.py:2424)
- `~/.claude/projects/.../memory/project_s33_findings.md` (research esterna closure)
- `~/guardian/snapshots/s32/` (18 snap evidence per offline test)
- `.planning/HANDOFF.md` sezione `[2026-05-02 SESSIONE 33]`

---
**Inizio S34**: pre-flight phone Termux → P0 fix zones.json → P1 conf tune + offline test → P2 live test 90s → P3 production activation se ALL PASS.
