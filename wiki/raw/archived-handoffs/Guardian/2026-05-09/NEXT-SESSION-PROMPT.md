# GUARDIAN — SESSIONE: 6 PROBLEMI APERTI

## CONTESTO
Guardian monitora mamma anziana via 2 telecamere EZVIZ su iMac 2012.
Sistema live in produzione. Ogni modifica deve avere rollback.

## ENVIRONMENT
- iMac: `ssh gianlucadistasi@192.168.1.2`
- Guardian: `~/guardian/guardian.py` (LaunchAgent, auto-restart)
- Logs: `~/guardian/logs/guardian.log`
- Env: `~/guardian/guardian.env`
- Camera soggiorno: EZVIZ C6CN (PTZ), serial D91472203, IP 192.168.1.6
- Camera cameretta: EZVIZ ezCube Pro (fissa), serial D42498043, IP 192.168.1.5
- RTSP via go2rtc: `rtsp://192.168.1.2:8554/{cameretta,soggiorno}`
- Budget: EUR 0, CPU-only i5, Python 3.9, no Docker

---

## PROBLEMA 1 — PTZ C6CN NON SI MUOVE (P0)

### Stato
- `pyezviz` login OK (MFA disattivato)
- `client.ptz_control('right', 'D91472203', 'start', speed=5)` ritorna `True`
- Ma la camera **NON si muove fisicamente**

### Diagnosi da fare (in ordine)

**STEP 1A — Verifica privacy mode e switch dall'API:**
```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
python3 << 'PYEOF'
from pyezviz import EzvizClient
client = EzvizClient('gianlucanewtech@gmail.com', '@SspLlJk7800', 'apiieu.ezvizlife.com')
client.login()

# Leggi tutti gli switch attivi sulla C6CN
devices = client.get_device_infos()
info = devices['D91472203']
switches = info.get('SWITCH', [])
for s in switches:
    print(f"Switch type={s['type']:3d} enable={s['enable']}")

# Privacy mode = switch type 21 o 25
# PTZ enabled = supportExt key '5'
support = info['deviceInfos']['supportExt']
print(f"\nPTZ support (key 5): {support.get('5', 'N/A')}")
print(f"Privacy (key 21): switch above")

client.close_session()
PYEOF
EOF
```

**STEP 1B — Verifica dall'app EZVIZ sul telefono:**
1. Apri app EZVIZ > C6CN soggiorno > Impostazioni
2. Verifica: "Modalita privacy" = OFF
3. Verifica: "Blocco PTZ" = OFF (se presente)
4. Prova a muovere manualmente dalla app (joystick virtuale)
5. Se si muove dalla app ma non da pyezviz -> problema API
6. Se non si muove neanche dalla app -> problema hardware/firmware

**STEP 1C — Se la app funziona ma pyezviz no, prova metodo alternativo:**
```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
python3 << 'PYEOF'
from pyezviz import EzvizClient
import time
client = EzvizClient('gianlucanewtech@gmail.com', '@SspLlJk7800', 'apiieu.ezvizlife.com')
client.login()

# Metodo alternativo: coordinate assolute
serial = 'D91472203'
print("Test ptz_control_coordinates...")
try:
    result = client.ptz_control_coordinates(serial, x_axis=0.5, y_axis=0.5)
    print(f"Coordinates result: {result}")
except Exception as e:
    print(f"Coordinates error: {e}")

# Metodo alternativo: comandi numerici diretti
# EZVIZ API usa: 0=up 1=down 2=left 3=right 4=upleft 5=downleft 6=upright 7=downright
for cmd_name, cmd_num in [("up","0"),("down","1"),("left","2"),("right","3")]:
    print(f"\nDirect command {cmd_name} ({cmd_num})...")
    try:
        result = client.ptz_control(cmd_num, serial, 'start', speed=5)
        print(f"  start: {result}")
        time.sleep(2)
        result = client.ptz_control(cmd_num, serial, 'stop', speed=5)
        print(f"  stop: {result}")
    except Exception as e:
        print(f"  error: {e}")
    time.sleep(1)

client.close_session()
PYEOF
EOF
```

**STEP 1D — Se nulla funziona, ricerca pyezviz GitHub issues:**
Usa `WebSearch` per cercare:
`"pyezviz" "ptz" "not moving" OR "C6CN" site:github.com`

### PASS criteria
Camera si muove fisicamente quando riceve comando PTZ.

---

## PROBLEMA 2 — YOLO NON RILEVA CADUTA (P0)

### Stato
- Utente sdraiato a terra in soggiorno + cameretta: ZERO fall detection
- YOLO tracciava moglie sul divano (STANDING), ignorava utente a terra
- Cameretta aveva 84% packet drop (fixato con restart go2rtc)

### Diagnosi da fare

**STEP 2A — Verificare cosa vede YOLO quando qualcuno e a terra:**
```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
# Monitora in tempo reale (utente deve sdraiarsi DA SOLO davanti camera soggiorno)
tail -f ~/guardian/logs/guardian.log | grep -E "fall-diag|boxes=|LYING|FALLEN|FALL_SCORE|skeleton"
EOF
```

L'utente deve:
1. Essere DA SOLO nell'inquadratura (nessun altro in piedi)
2. Stare IN PIEDI per 5s (YOLO deve tracciarlo come STANDING)
3. Sdraiarsi PER TERRA (non divano) velocemente
4. Restare immobile 10+ secondi

**STEP 2B — Se YOLO non rileva nessuno a terra (boxes=0):**
Il problema e la confidence threshold. Abbassala:
```python
# In guardian.py, cerca conf_thresh o DETECTION_CONFIDENCE
# Cambia da 0.4 a 0.25 per testare
```
YOLO ha difficolta con persone a terra viste dall'alto.

**STEP 2C — Se YOLO rileva ma non classifica come FALLEN:**
Verificare FallScorer thresholds:
- `FALL_SCORE_THRESHOLD = 75` potrebbe essere troppo alto
- La transizione STANDING->LYING_DOWN deve avere velocita sufficiente
- Il `FALL_VELOCITY_SCORE_THRESH` potrebbe filtrare cadute lente

**STEP 2D — Se il camera-level tracker (60s timer) e troppo lento:**
Per test, ridurre temporaneamente:
```python
# Timer UNKNOWN->LYING_DOWN prima di escalare a FALLEN
# Cambia da 60s a 10s per test
```

### PASS criteria
Guardian rileva caduta (log `[FALL]` + alert Telegram) quando utente si sdraia per terra DA SOLO.

---

## PROBLEMA 3 — VOICE CONFIRMATION TEST E2E (P1)

### Stato
- `voice_confirmator.py` deployato: sd.InputStream 44100Hz -> resample 16kHz -> faster-whisper tiny IT
- Integrato in guardian.py su entrambi i fall alert
- Mic funziona (RMS=6.6 ambientale), ma mai testato con voce umana
- DIPENDE da Problema 2: serve una caduta rilevata per triggerare il flusso

### Test (dopo che Problema 2 e risolto)

**Test A — Risposta positiva:**
1. Sdraiati per terra, aspetta alert vocale "Stai bene?"
2. Rispondi "si sto bene"
3. Verifica log: `[voice-confirm] response=positive`
4. Verifica Telegram: "alert cancellato"
5. Verifica: NESSUN alert caduta su Telegram

**Test B — Silenzio:**
1. Sdraiati per terra, aspetta alert vocale
2. Non dire nulla per 15s
3. Verifica Telegram: alert caduta con "nessuna risposta"

### PASS criteria
Test A + Test B entrambi superati con evidenza nel log.

---

## PROBLEMA 4 — GO2RTC CAMERETTA INSTABILE (P2)

### Stato
- Stream go2rtc "soggiorno" (cam .5 cameretta) aveva 88789 drop su 105357 pacchetti (84%)
- Fixato con restart go2rtc, ma potrebbe tornare
- WiFi signal: camera .5 = 74%, camera .6 = 100%

### Fix

**STEP 4A — Monitorare drop rate:**
```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
# Check drop rate ogni ora
curl -s http://localhost:1984/api/streams | python3 -c "
import sys, json
d = json.load(sys.stdin)
for k, v in d.items():
    for c in (v.get('consumers') or []):
        for s in c.get('senders', []):
            drops = s.get('drops', 0)
            pkts = s.get('packets', 0)
            total = drops + pkts
            pct = (drops/total*100) if total > 0 else 0
            print(f'{k}: {drops} drops / {total} total = {pct:.1f}%')
"
EOF
```

**STEP 4B — Se drop > 10%: restart go2rtc automatico**
Aggiungere un health check cron che restarta go2rtc se drop rate alto.

**STEP 4C — Fix permanente: cavo ethernet o WiFi extender**
Camera .5 ha solo 74% segnale. Migliorare posizione router o usare powerline adapter.

### PASS criteria
Drop rate < 5% per 24h consecutive.

---

## PROBLEMA 5 — MEDICATION REMINDER (P3 — dopo i bug)

### Stato
- `disease_profiles.json` gia deployato: `~/guardian/disease_profiles.json`
- 6 profili con schedule farmaci
- TTS via iMac speaker (stesso path di voice confirmation)
- NON implementato ancora

### Implementazione
1. Leggere `disease_profiles.json` per schedule farmaci
2. Aggiungere thread scheduler in guardian.py
3. Agli orari configurati: TTS "Mamma, e ora di prendere [farmaco]"
4. Loggare compliance: se persona rilevata in piedi entro 5min = preso
5. Se nessun movimento in 5min: re-prompt + Telegram alert

### PASS criteria
TTS audibile all'orario configurato + log compliance.

---

## PROBLEMA 6 — BASELINE LEARNING COPERTURA (P3 — automatico)

### Stato
- 53 osservazioni, 4/24 ore coperte, giorno 0/7
- learning_start: 2026-04-13
- Profilo operativo stimato: 2026-04-20
- Nessuna azione richiesta — raccolta automatica

### Verifica periodica
```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
sqlite3 ~/guardian/guardian.db "
SELECT 'Osservazioni: ' || SUM(count) FROM baseline_observations;
SELECT 'Ore coperte: ' || COUNT(DISTINCT hour) FROM baseline_observations;
SELECT 'Giorni: ' || value FROM baseline_meta WHERE key='learning_days_collected';
"
EOF
```

### PASS criteria
- Osservazioni > 500
- Ore coperte > 16
- Giorni >= 7

---

## ORDINE DI ESECUZIONE

```
1. PROBLEMA 1 (PTZ) — diagnostica, non implementare patrol finche non si muove
2. PROBLEMA 2 (YOLO fall) — test DA SOLO, fix threshold se necessario
3. PROBLEMA 3 (Voice confirm) — test E2E dopo che #2 funziona
4. PROBLEMA 4 (go2rtc) — monitoring + auto-restart cron
5. PROBLEMA 5 (Medication) — implementare dopo #1-3 risolti
6. PROBLEMA 6 (Baseline) — solo verifica, nessuna azione
```

## TOOLS DA USARE

| Problema | Agent/Skill |
|----------|------------|
| PTZ debug | `WebSearch` per pyezviz issues + `backend-architect` |
| YOLO fall threshold | `backend-architect` + lettura codice FallScorer |
| Voice confirm test | `devops-automator` per monitoring SSH |
| go2rtc stability | `devops-automator` per cron health check |
| Medication reminder | `backend-architect` per scheduler logic |

## CONSTRAINTS
- CPU-only iMac i5 2012, no Docker, EUR 0
- Sistema live — zero downtime > 60s
- Backup obbligatorio prima di ogni modifica
- Deploy: scp da MacBook + restart LaunchAgent (MAI nohup manuale)
- Restart: `launchctl unload/load com.guardian.plist` (no pkill diretto)
- Lock file: `/tmp/guardian.lock` — rimuovere prima di restart
