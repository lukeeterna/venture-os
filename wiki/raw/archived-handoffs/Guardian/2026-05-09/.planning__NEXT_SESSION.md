# NEXT SESSION — S23 (apertura post-S22 closeout 2026-04-30)

**Auto-generato fine S22. Cancellare/sovrascrivere a fine S23.**

---

## Pre-flight quick (3 min)

```bash
# Guardian + score_observation evidence
ssh gianlucadistasi@imac-di-gianluca.local 'pgrep -af guardian.py; tail -5 ~/guardian/logs/guardian.log | grep FPS'

# Cameretta stall pattern (P1 ancora aperto)
ssh gianlucadistasi@imac-di-gianluca.local 'grep -c "cameretta stalled" ~/guardian/logs/guardian.log'

# Baseline profile state (post-S22 fix verifica)
ssh gianlucadistasi@imac-di-gianluca.local 'sqlite3 ~/guardian/guardian.db "SELECT MAX(learning_days), COUNT(*) FROM baseline_profile"'

# Phone Luna stabilità
ssh -p 8022 192.168.1.11 'pgrep -af luna-v4; tail -3 ~/logs/luna.log'

# Tailscale Luke action item carry-over
ssh gianlucadistasi@imac-di-gianluca.local '/Applications/Tailscale.app/Contents/MacOS/Tailscale status | head -3'
```

## Closeout S22 status — atteso

- ✅ `score_observation()` cablato 3 alert sites (loitering, line_crossing, inactivity) — DA S21
- ✅ Guardian PID 1618+2610 stabile da 10:42 deploy
- ✅ Luna phone UP da S20
- 🔴 ZERO `*_baseline_suppressed` entries — root cause architectural identificato
- 🔴 Cameretta stall = hardware degrado EZVIZ confermato
- ✅ Cameretta baseline 5gg (target raggiunto)

---

## P0 — NORTH STAR fix architectural baseline_learner

**Root cause S22**: `_rebuild_profile` calcola `learning_days` con chiave `(camera, dow, hour, slot, state)` su finestra `learning_period_days=7` → `dow` (0-6) può ricorrere max 1 volta in 7 giorni → `learning_days` sempre = 1 → `min_days_to_score=3` strutturalmente irraggiungibile.

**Decision required**: scegliere e implementare 1 di 2 opzioni (Opzione C scartata).

### Opzione A — Quick win (raccomandata se tempo limitato)
**Modifica**: `~/guardian/baseline_learner.py:21` cambia `"learning_period_days": 7` → `"learning_period_days": 21`.

**Pro**:
- Una linea di codice
- Zero rischio regression (parametro config-only)
- Compatibile con tutto il resto del sistema

**Contro**:
- Richiede T+4gg (siamo a giorno 17 dal start, period=21 abilita fix dal giorno 21 = 2026-05-04)
- Marginale: max 3 occorrenze stesso dow-slot in 21gg, qualunque slot infrequente resta unscored

**Comando deploy**:
```bash
ssh gianlucadistasi@imac-di-gianluca.local 'sed -i "" "s/\"learning_period_days\": 7/\"learning_period_days\": 21/" ~/guardian/baseline_learner.py'
ssh gianlucadistasi@imac-di-gianluca.local 'launchctl unload ~/Library/LaunchAgents/com.guardian.plist && launchctl load ~/Library/LaunchAgents/com.guardian.plist'
# Wait T+30s, verify _rebuild_profile triggers
ssh gianlucadistasi@imac-di-gianluca.local 'sqlite3 ~/guardian/guardian.db "SELECT MAX(learning_days) FROM baseline_profile"'
```

### Opzione B — Fix architettonico (raccomandata long-term)
**Modifica**: `_rebuild_profile()` in `baseline_learner.py:155-191` — cambiare semantica `learning_days` da "distinct days for slot+state" a "distinct days globally for cam+state".

**Diff concettuale**:
```python
# AGGIUNGERE query separata per learning_days globale
days_per_state = self._db.execute("""
    SELECT camera, state, COUNT(DISTINCT date(created_at)) as global_days
    FROM baseline_observations WHERE created_at >= ?
    GROUP BY camera, state
""", (cutoff,)).fetchall()
days_map = {(r[0], r[1]): r[2] for r in days_per_state}

# Nel loop esistente, sostituire learning_days = ddays con:
learning_days = days_map.get((camera, state), 0)
```

**Pro**:
- Fix immediato (no T+4gg attesa)
- Semantica corretta: "abbiamo visto questo state per N giorni totali"
- Sblocca scoring per slot infrequenti

**Contro**:
- Cambia semantica (più permissivo): un slot mai visto su lunedì alle 14:00 può essere "scored" se quel state è frequente in altri slot
- Mitigazione: `confidence` rimane locale a slot (basata su `observations` per slot specifico) → suppression richiede sia high probability sia high local confidence

**Test runtime post-deploy**:
```python
# Dopo restart, atteso:
soggiorno/ABSENT: suppress=True p=0.86 conf=0.62 reason=p=0.86 conf=0.62 days=4
```

### Opzione D nuova — Hybrid (idea S22 closeout)
- `learning_period_days` = 14 (compromesso 7/21)
- `learning_days` semantica = `COUNT(DISTINCT date) per (camera, hour_bucket, state)` dove `hour_bucket = hour // 4` (6 buckets/day)
- Riduce sparsity 4x mantenendo locality temporale (mattino/pomeriggio/sera/notte)

→ **Decisione DACI da prendere S23 dopo discussione con Luke**.

## P1 — Cameretta hardware stall

**Root cause S22**: degrado hardware EZVIZ camera 192.168.1.5 (i/o timeout RTSP intermittente). Pattern: connect → 115s ricezione → stall → reconnect loop → HARD ESCALATION → Guardian restart launchctl.

**Decision tree S23**:
1. **Se >7gg di degrado continuativo** → hardware swap (C6CN spare se disponibile, altrimenti acquisto nuovo EZVIZ ~30€)
2. **Se intermittente** → tuning go2rtc:
   ```yaml
   streams:
     cameretta:
       - "rtsp://admin:GEGURX@192.168.1.5:554/H.264#input=rtsp/tcp"
   ```
3. **Se irrimediabile** → disabilitare cameretta thread Guardian (commenta in zones.json `cameretta` block)

**Diagnostic commands**:
```bash
# Test diretto camera (5min sample)
ssh gianlucadistasi@imac-di-gianluca.local 'timeout 300 ffmpeg -rtsp_transport tcp -i rtsp://admin:GEGURX@192.168.1.5:554/H.264 -c copy -t 300 /tmp/cameretta_test.mp4 2>&1 | tail -20'
# Atteso healthy: durata 300s, no errors. Atteso degraded: timeout/errors mid-stream
```

## P2 — Update CLAUDE.md + memory device_config

IP camera shift documentato S22 ma config repo vecchia.

```bash
# CLAUDE.md sezione "Device & Connections" — update line:
# - EZVIZ Cameretta: 192.168.1.2  → 192.168.1.5
# - EZVIZ C6CN Soggiorno: 192.168.1.5  → 192.168.1.4
```

Update anche memory `device_config.md`.

## P3 — Prototipo `install-guardian.sh` (validation ADR 007)

Setup script Tailscale-first per Guardian distribuibile. Step:
1. Check Tailscale installed → suggerisci install
2. `tailscale up` → ottieni `100.x.x.x` IP server
3. Stampa istruzioni QR/invite per onboarding phone secondo client
4. Fallback: se Tailscale rifiutato → mDNS check → manual env

## P3 — Pulizia residui post-S20 (gate temporale)

Eseguire SOLO se `date >= 2026-05-06`:
- `rm /usr/local/etc/mosquitto/mosquitto.conf.s20-bak`
- `rm ~/Library/LaunchAgents/com.mqtt.broker.plist`
- `rm -rf ~/mqtt/broker.py` (amqtt orfano)
- `ssh -p 8022 192.168.1.11 'rm ~/scripts/luna-v3.py'`

## P3 — Action items Luke aperti (verificare al pre-flight)

- ⏳ `tailscale login` su iMac (S19+S20+S21+S22 carry-over) — richiede browser interattivo
- ⏳ MIUI Termux + Termux:API + Termux:Boot battery "no restrictions" + autostart ON

---

## NON in S23 (out of scope)
- Refactor camera process isolation (subprocess-per-camera)
- Phone wake word v2 (Vosk Italian model)
- TCN retry con Le2i Kaggle
- Medication Reminder (vincolato hardware)
- Frontend dashboard
- Refactor luna-v4.py architecture

---

## Targets PASS S23
- [ ] Baseline scoring funzionante: ≥1 entry `*_baseline_suppressed is_normal=True` LIVE OPPURE `score_observation` runtime test ritorna `suppress=True` per almeno 1 (cam, state) nello slot corrente
- [ ] Cameretta hardware decision presa (swap/tuning/disable) + applicata
- [ ] CLAUDE.md `Device & Connections` aggiornata con IP corretti
- [ ] Guardian process stabile T+24h post-S22 (no regression edits S22 — zero)
- [ ] (opzionale P3) Prototipo `install-guardian.sh` versione 0.1
