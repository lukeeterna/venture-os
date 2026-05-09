# PROMPT AUTONOMO S23 — copy-paste ready

```
Apri Sessione 23. Leggi:
- .planning/NEXT_SESSION.md (priorità complete S23, scritto fine S22)
- .planning/HANDOFF.md sezione SESSIONE 22
- ~/guardian/baseline_learner.py:155-191 (codice da fixare)

CONTESTO da S22 (chiusa 2026-04-30, commit e35d31d):
- Diagnosi-only sessione, ZERO edits codice
- P0 NORTH STAR root cause: _rebuild_profile groups by (camera,dow,hour,slot,state)
  con learning_period_days=7 → dow ricorre max 1x → learning_days SEMPRE=1 →
  min_days_to_score=3 strutturalmente irraggiungibile → score_observation
  ritorna state_never_seen_in_slot per OGNI cam/state combo
- P1 cameretta stall = hardware EZVIZ degrado RTSP (192.168.1.5), 1970 events
- 3 opzioni fix in NEXT_SESSION.md S23

PRE-FLIGHT (3 min):
  ssh gianlucadistasi@imac-di-gianluca.local 'pgrep -af guardian.py; tail -3 ~/guardian/logs/guardian.log | grep FPS'
  ssh gianlucadistasi@imac-di-gianluca.local 'sqlite3 ~/guardian/guardian.db "SELECT MAX(learning_days), COUNT(*) FROM baseline_profile"'
  ssh gianlucadistasi@imac-di-gianluca.local 'grep -c "cameretta stalled" ~/guardian/logs/guardian.log'
  ssh -p 8022 192.168.1.11 'pgrep -af luna-v4'

P0 NORTH STAR — fix baseline_learner (60-90 min):
  Decision DACI con Luke su 3 opzioni:
    A) learning_period_days 7→21 (1-line, sicuro, attesa T+4gg per scoring abilitato)
    B) cambiare semantica learning_days a globale per (cam,state) con query separata
    C) hybrid: period=14 + hour_bucket (hour//4)
  Default consigliato: A (low-risk) + commit incrementale per B se A insufficiente in 1 settimana.

  Comando A:
    ssh gianlucadistasi@imac-di-gianluca.local 'cp ~/guardian/baseline_learner.py ~/guardian/baseline_learner.py.s23-bak'
    ssh gianlucadistasi@imac-di-gianluca.local 'sed -i "" "s/\"learning_period_days\": 7/\"learning_period_days\": 21/" ~/guardian/baseline_learner.py'
    ssh gianlucadistasi@imac-di-gianluca.local 'launchctl unload ~/Library/LaunchAgents/com.guardian.plist; sleep 2; launchctl load ~/Library/LaunchAgents/com.guardian.plist'
    sleep 30; runtime test score_observation (script /tmp/test_baseline_score.py già su iMac)

P1 — Cameretta hardware decision (30-60 min):
  Decision tree:
    1. ffmpeg test 5min camera diretta → se i/o timeout mid-stream → degrado confermato
    2. Tuning go2rtc TCP+lower bitrate → se persiste → decision swap
    3. Se irrimediabile: disable cameretta thread (commenta zones.json cameretta block)

P2 — Update CLAUDE.md Device & Connections (5 min):
  - EZVIZ Cameretta: 192.168.1.5 (era 192.168.1.2)
  - EZVIZ C6CN Soggiorno: 192.168.1.4 (era 192.168.1.5)
  - Update memory device_config.md

Action items Luke aperti carry-over (S19-S22):
  - tailscale login iMac
  - MIUI Termux battery whitelist

NON in S23:
  - Refactor camera process isolation
  - Vosk wake word v2
  - TCN retry Le2i
  - Medication Reminder
  - Frontend dashboard

Targets PASS S23:
  - Baseline scoring funzionante: ≥1 score_observation runtime test ritorna suppress=True
    OPPURE ≥1 entry *_baseline_suppressed nel log live
  - Cameretta hardware decision presa + applicata
  - CLAUDE.md aggiornata IP camera
  - Guardian stabile T+24h post-S22 (no regression edits S22)

Agisci in autonomia da CTO. Aggiorna HANDOFF + commit + push a fine sessione.

PRIORITÀ: fix baseline_learner (NORTH STAR sblocco) > cameretta hardware > CLAUDE.md update.
```
