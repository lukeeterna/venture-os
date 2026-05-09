# ZEROCLAW — MEGA SESSION: BUG FIX + NUOVE INTEGRAZIONI + HARDENING

## IDENTITA PROGETTO
ZeroClaw Smart Home per monitoraggio mamma anziana + automazione casa.
Stack: Guardian (TVCC ML), Luna (voice agent), MQTT, Telegram, go2rtc.
iMac 2012 i5 CPU-only come hub centrale. Phone Redmi Note 9 Pro come client.
57 agents + 34 skills + Enterprise Suite operativa.
Budget: EUR 0 — solo OSS.

## ENVIRONMENT

| Risorsa | Accesso |
|---------|---------|
| iMac | `ssh gianlucadistasi@192.168.1.2` |
| Phone | `ssh -p 8022 192.168.1.9` / Tailscale `100.101.219.214` |
| Guardian | `~/guardian/guardian.py` (LaunchAgent com.guardian.plist) |
| Luna | `~/scripts/luna-v4.py` su phone |
| MQTT | mosquitto 192.168.1.2:1883 (zeroclaw/ZeroClaw2026Home) |
| Logs | `~/guardian/logs/guardian.log` |
| Env | `~/guardian/guardian.env` (credenziali, MAI in git) |
| NAS | `/Volumes/NAS_LOCAL/` (931GB Samsung T7 USB) |
| go2rtc | `http://localhost:1984` config `~/go2rtc.yaml` |
| GDrive | rclone remote `gdrive:phone-backup/` (cron 16:00) |
| Dashboard | `http://192.168.1.2:8088` |
| Bot Telegram | @Lukehomedx_bot (chat_id 931063621) |

### Dispositivi

| Device | IP | Protocollo | Stato |
|--------|----|-----------|-------|
| EZVIZ C6CN PTZ (soggiorno) | .6 | RTSP + pyezviz cloud | PTZ non si muove |
| EZVIZ ezCube Pro (cameretta) | .5 | RTSP via go2rtc | Stream instabile (drop) |
| PS4-893 | .12 | pyps4-2ndscreen | Pairing pendente |
| Eureka Robot | .8 | Midea LAN 6444 | Solo app, serve MSmartHome |
| Ferroli AC | .3 | msmart-ng | Funzionante |
| Netatmo | .11 | OAuth2 API | Funzionante |
| TV Box MBOX | .7 | ADB :5555 | Solo da phone |
| TCL 55DP600X1 | - | IR blaster | Funzionante |
| HP LaserJet | .14 | CUPS | Funzionante |

### Credenziali (in guardian.env)

| Servizio | User | Variabile env |
|----------|------|--------------|
| EZVIZ Cloud | gianlucanewtech@gmail.com | EZVIZ_EMAIL + EZVIZ_PASSWORD |
| EZVIZ C6CN | serial D91472203 | EZVIZ_PTZ_SERIAL |
| EZVIZ ezCube | serial D42498043 | EZVIZ_CAM2_SERIAL |
| Telegram | bot token | TELEGRAM_TOKEN |
| MQTT | zeroclaw | MQTT_USER + MQTT_PASS |
| Traccar | gianlucanewtech | TRACCAR_USER + TRACCAR_PASS |
| MSmartHome (Eureka) | gianlucanewtech@gmail.com / 1FdT67.tr4 | non in env ancora |
| Netatmo | client 69c6cf3b7f0255f6ff012895 | ~/envs/netatmo.env |
| Groq | gsk_...aYm | ~/envs/groq.env |

### Constraints ASSOLUTI
- CPU-only iMac i5 2012, 16GB RAM, macOS 12.7 — no Docker, no GPU
- EUR 0 budget
- Python 3.9 system
- Zero downtime monitoraggio anziana > 60s
- MAI hardcode credenziali — env vars only
- MAI patch via sed/ssh — file completi + scp
- Backup obbligatorio prima di OGNI modifica
- Deploy: `launchctl unload/load` (MAI nohup manuale)
- Lock file `/tmp/guardian.lock` — rm prima di restart
- Test E2E con evidenza reale prima di dichiarare DONE
- Push git a fine sessione

---

## SEZIONE A — BUG FIX (priorita massima, fare PRIMA di tutto)

### BUG 1 — PTZ C6CN non si muove (CRITICO per ronda)

**Stato**: pyezviz login OK (MFA disattivato), `ptz_control()` ritorna `True`, camera NON si muove.
- Camera: EZVIZ C6CN (CS-CV246-A0-1C2WFR), firmware V5.3.2 build 230722
- Serial: D91472203, IP 192.168.1.6
- pyezviz installato, login funziona senza MFA

**Diagnosi obbligatoria (in ordine):**

1. Verificare privacy mode switch nell'API (switch type 21, 25)
2. Provare `ptz_control_coordinates(serial, 0.5, 0.5)` come alternativa
3. Provare comandi numerici diretti (0=up, 1=down, 2=left, 3=right) invece di stringhe
4. Verificare se `supportExt['5'] == '1'` conferma PTZ hardware presente
5. Cercare su GitHub issues pyezviz: `"C6CN" "ptz" "not moving"`
6. Se nulla funziona via pyezviz: provare HTTP API diretto EZVIZ endpoint:
   `POST https://apiieu.ezvizlife.com/api/lapp/device/ptz/start`
7. Ultima risorsa: reverse engineer app EZVIZ con mitmproxy per catturare chiamata PTZ reale

**Agent**: `backend-architect` per API debug + `WebSearch` per ricerca issues

**PASS**: camera si muove fisicamente quando riceve comando.

---

### BUG 2 — YOLO non rileva caduta a terra (CRITICO per safety)

**Stato**: utente sdraiato per terra, Guardian non ha rilevato caduta.
- Cameretta stream aveva 84% packet drop (fixato con restart go2rtc)
- Soggiorno: YOLO tracciava moglie (STANDING) e ignorava utente a terra
- Nessuna transizione STANDING->FALLING/FALLEN nel log

**Diagnosi obbligatoria:**

1. Test DA SOLO nel soggiorno (nessun altro nell'inquadratura):
   - Stare in piedi 5s → sdraiarsi velocemente → restare immobile 10s
   - Monitorare: `grep -E "fall-diag|LYING|FALLEN|FALL_SCORE" guardian.log`

2. Se YOLO non rileva persona a terra (`boxes=0`):
   - Abbassare `conf_thresh` da 0.4 a 0.25
   - YOLOv8n-pose ha difficolta con persone sdraiate viste dall'alto

3. Se rileva persona ma non classifica come FALLEN:
   - Verificare FallScorer threshold (75 potrebbe essere troppo alto)
   - Verificare `FALL_VELOCITY_SCORE_THRESH` (cadute lente non passano)
   - Ridurre timer UNKNOWN→LYING_DOWN→FALLEN da 60s a 15s per test

4. Se camera-level tracker non scatta:
   - Verificare `MIN_SKELETON_HEIGHT_RATIO` (0.08 potrebbe filtrare persona a terra)
   - Verificare angolo detection: persona orizzontale deve avere `angle > 55`

**Agent**: `backend-architect` per FallScorer analysis + leggere codice PersonState/FallScorer

**PASS**: caduta rilevata (log `[FALL]` + alert Telegram) quando utente si sdraia per terra DA SOLO.

---

### BUG 3 — Voice Confirmation mai testata live (dipende da BUG 2)

**Stato**: voice_confirmator.py deployato, mai triggerato perche nessuna caduta rilevata.
- Mic funziona (RMS=6.6 ambientale)
- sd.InputStream con 44100Hz + resample 16kHz per faster-whisper tiny IT
- Integrato in guardian.py su entrambi i fall alert paths

**Test (dopo BUG 2 risolto):**

Test A — Risposta positiva:
1. Sdraiati, aspetta TTS "Stai bene?"
2. Rispondi "si sto bene"
3. Verifica log: `[voice-confirm] response=positive`
4. Verifica Telegram: messaggio "alert cancellato"

Test B — Silenzio:
1. Sdraiati, aspetta TTS "Stai bene?"
2. Non dire nulla per 15s
3. Verifica Telegram: alert caduta con "nessuna risposta"

**Agent**: `test-results-analyzer` per analisi log

**PASS**: entrambi i test superati con evidenza.

---

### BUG 4 — go2rtc stream cameretta instabile

**Stato**: 84% packet drop sullo stream go2rtc "soggiorno" (camera .5 cameretta). Fixato con restart ma torna.
- WiFi signal camera .5: 74% vs camera .6: 100%
- Causa probabile: segnale WiFi debole

**Fix:**

1. Aggiungere cron health check ogni 5 min:
   ```bash
   curl -s http://localhost:1984/api/streams | check drop rate
   if drop > 20%: restart go2rtc + log alert
   ```
2. Considerare: spostare camera .5 piu vicino al router
3. Lungo termine: WiFi extender o powerline adapter (costo ~15 EUR)

**Agent**: `devops-automator` per cron + `infrastructure-maintainer` per monitoring

**PASS**: drop rate < 5% per 24h.

---

## SEZIONE B — NUOVE INTEGRAZIONI (dopo bug risolti)

### INTEGRAZIONE 1 — Tailscale obbligatorio per telecamere

**Obiettivo**: le cam EZVIZ devono essere accessibili SOLO via Tailscale VPN.
Se Tailscale non e attivo, gli stream RTSP non devono essere raggiungibili dall'esterno.

**Implementazione:**

1. Verificare che go2rtc fa bind su 127.0.0.1 (non 0.0.0.0)
2. Le cam EZVIZ usano RTSP locale (.5/.6 porta 554) — non sono esposte su internet
3. Ma go2rtc espone la porta 8554 + WebRTC 1984 su tutte le interfacce
4. Fix: go2rtc config bind solo su Tailscale IP o localhost
5. Firewall iMac: bloccare porte 8554, 1984 su interfaccia WiFi, permettere solo su Tailscale
6. Test: da rete locale senza Tailscale → stream non raggiungibile. Con Tailscale → funziona.

**Agent**: `network-hardener` per firewall + `devops-automator` per config

**PASS**: `curl http://192.168.1.2:1984` da rete locale FAIL. `curl http://100.x.x.x:1984` via Tailscale OK.

---

### INTEGRAZIONE 2 — PS4 controllo completo

**Stato**: PS4-893 su .12, pairing pendente. Serve:
1. Installare PS4 Second Screen app sul phone
2. 5 min accesso fisico alla TV per PIN
3. Poi: pyps4-2ndscreen per credential extraction

**Implementazione (dopo pairing):**

1. `pip3 install pyps4-2ndscreen` su iMac
2. Credential extraction: `pyps4-2ndscreen pair --host 192.168.1.12`
3. Comandi base: wake, standby, start_title (Netflix CUSA00127)
4. Integrazione Luna: "Luna, accendi playstation" → MQTT → iMac → pyps4
5. Parental control: cron 21:00 → standby command
6. Script: `~/guardian/ps4_control.py` con classe PS4Controller

```python
# ps4_control.py — production ready
class PS4Controller:
    def __init__(self, host, credentials_file):
        ...
    def wake(self): ...
    def standby(self): ...
    def start_app(self, title_id): ...  # CUSA00127 = Netflix
    def status(self): ...
```

7. MQTT integration: subscribe `luna/ps4_cmd`, publish `guardian/ps4_status`

**Agent**: `backend-architect` per controller + `devops-automator` per cron

**PASS**: "Luna, accendi playstation" → PS4 wake. Cron 21:00 → standby.

---

### INTEGRAZIONE 3 — Eureka Robot

**Stato**: Eureka su .8, protocollo Midea LAN, serve registrazione su MSmartHome app.

**Pre-requisiti (azione utente):**
1. Installare app MSmartHome sul telefono
2. Login: gianlucanewtech@gmail.com / 1FdT67.tr4
3. Aggiungere robot Eureka all'account
4. Poi: midea-local discover per ottenere token+key

**Implementazione (dopo pre-requisiti):**

1. `midea-local discover` su iMac (venv ~/eureka-env)
2. Comandi: start_clean, stop, dock, status
3. Integrazione Luna: "Luna, pulisci casa" → MQTT → iMac → midea-local
4. Geofence: uscita da casa → Eureka parte
5. Script: `~/guardian/eureka_control.py`

```python
# eureka_control.py — production ready
class EurekaController:
    def __init__(self, device_id, ip, token, key):
        ...
    def start_clean(self): ...
    def stop(self): ...
    def dock(self): ...
    def status(self): ...  # battery, state, error
```

**Agent**: `backend-architect` per Midea protocol + `devops-automator` per geofence hook

**PASS**: "Luna, pulisci casa" → robot parte. Geofence exit → auto clean.

---

### INTEGRAZIONE 4 — PTZ Ronda Intelligente (dopo BUG 1 risolto)

**Stato**: pyezviz API funziona per login/device info ma PTZ non si muove. Risolvere BUG 1 prima.

**Implementazione (dopo che PTZ funziona):**

1. `~/guardian/ptz_patrol.py` — PatrolScheduler + PTZController (pyezviz)
2. 3-4 preset zone: divano (8s dwell), cucina (5s), camminata (6s), poltrona (5s)
3. Ciclo: preset → 2.5s transizione (blind spot) → dwell (detection attiva) → next
4. Lock-on: caduta rilevata → patrol stop → camera ferma sul soggetto
5. Resume: dopo voice confirmation o 5min timeout → patrol riprende
6. Integrazione guardian.py: thread PatrolThread, hook nel FallScorer

**Agent**: `backend-architect` per patrol logic + `devops-automator` per deploy

**PASS**: camera cicla tra preset. Caduta → lock-on. Conferma vocale → resume.

---

### INTEGRAZIONE 5 — Backup e NAS perfetto

**Stato attuale:**
- GDrive: rclone cron 16:00 phone → gdrive:phone-backup/
- Guardian DB: cron 3AM daily → ~/guardian/backups/ (7gg retention)
- NAS: /Volumes/NAS_LOCAL/ (931GB Samsung T7) — presente ma NON usato per backup automatico

**Obiettivo: strategia backup 3-2-1**
3 copie, 2 media diversi, 1 offsite.

**Implementazione:**

1. **NAS backup automatico** (locale, veloce):
   ```
   Cron ogni 4h:
   - Guardian DB + config → /Volumes/NAS_LOCAL/backups/guardian/
   - Luna config + scripts → /Volumes/NAS_LOCAL/backups/luna/
   - go2rtc config → /Volumes/NAS_LOCAL/backups/go2rtc/
   - guardian.env (criptato con gpg) → /Volumes/NAS_LOCAL/backups/secrets/
   Retention: 30 giorni rolling
   ```

2. **GDrive backup** (offsite, gia parziale):
   ```
   Ampliare cron esistente:
   - Aggiungere Guardian DB weekly → gdrive:guardian-backup/
   - Aggiungere config files weekly → gdrive:config-backup/
   ```

3. **Clip EZVIZ** (video eventi):
   ```
   Guardian gia salva clip su caduta/intrusion.
   Cron notturno: muovi clip > 24h → NAS → dopo 7gg elimina da NAS
   ```

4. **Script unico**: `~/guardian/backup_manager.py`
   ```python
   class BackupManager:
       def backup_guardian_db(self): ...
       def backup_configs(self): ...
       def backup_clips_to_nas(self): ...
       def backup_to_gdrive(self): ...
       def verify_integrity(self): ...  # checksum
       def cleanup_old(self, days): ...
       def report_status(self): ...  # Telegram report
   ```

5. **LaunchAgent**: `com.backup.daily.plist` (03:30 AM, dopo Guardian DB backup 03:00)

6. **Monitoring**: report Telegram settimanale con:
   - Spazio NAS usato/libero
   - Ultimo backup riuscito per ogni categoria
   - Checksum verification result

**Agent**: `devops-automator` per cron/LaunchAgent + `infrastructure-maintainer` per monitoring

**PASS**: backup NAS ogni 4h + GDrive weekly + report Telegram + verify checksum.

---

## SEZIONE C — HARDENING SICUREZZA

### HARDENING 1 — Tailscale enforcement

Come descritto in INTEGRAZIONE 1. Le porte sensibili (go2rtc 8554/1984, dashboard 8088, MQTT 1883) devono essere accessibili SOLO via Tailscale o localhost.

**Implementazione firewall macOS (pf):**
```
# /etc/pf.anchors/zeroclaw
# Blocca accesso da rete locale a porte sensibili
block in on en0 proto tcp to port { 1883, 1984, 8088, 8554 }
# Permetti da Tailscale
pass in on utun3 proto tcp to port { 1883, 1984, 8088, 8554 }
# Permetti localhost
pass in on lo0 proto tcp to port { 1883, 1984, 8088, 8554 }
```

**Agent**: `network-hardener`

---

### HARDENING 2 — Audit credenziali

Verificare che NESSUNA credenziale sia in file committati:
```bash
grep -r "password\|secret\|token\|api_key" scripts/ --include="*.py" | grep -v ".env" | grep -v "os.getenv"
```

**Agent**: security audit via `infrastructure-maintainer`

---

## SEZIONE D — POST-IMPLEMENTAZIONE: AUDIT OBBLIGATORIO

Dopo OGNI implementazione della Sezione B, lanciare subito:

### Audit 1 — Verify Agents
```
/verify-agents
```
Conferma che tutti i 57 agents + 34 skills sono caricati correttamente.

### Audit 2 — Test All Systems
```
/test-all
```
Test completo: phone, iMac, Luna, Guardian, devices, battery.

### Audit 3 — Status Casa
```
/status-casa
```
Stato aggregato: tutti i servizi, porte, dispositivi.

### Audit 4 — Security Audit
```
/audit
```
Security + stripe + licenze completo.

### Audit 5 — Guardian specifico
```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
echo "=== GUARDIAN ===" && pgrep -af guardian.py
echo "=== MQTT ===" && pgrep -af mosquitto
echo "=== GO2RTC ===" && pgrep -af go2rtc
echo "=== LOCK ===" && cat /tmp/guardian.lock
echo "=== BASELINE ===" && sqlite3 ~/guardian/guardian.db "SELECT COUNT(*), COUNT(DISTINCT hour) FROM baseline_observations"
echo "=== DISK ===" && df -h /Volumes/NAS_LOCAL/
echo "=== BACKUP ===" && ls -la ~/guardian/backups/ | tail -5
echo "=== ERRORS LAST 1H ===" && grep -c "ERROR" ~/guardian/logs/guardian.log
echo "=== MQTT DISCONNECT ===" && grep -c "Disconnected" ~/guardian/logs/guardian.log
echo "=== FPS ===" && grep "FPS:" ~/guardian/logs/guardian.log | tail -4
EOF
```

---

## ORDINE DI ESECUZIONE

```
FASE 1 — BUG FIX (obbligatorio, fare prima):
  1.1  BUG 1: PTZ C6CN → diagnostica + fix
  1.2  BUG 2: YOLO fall detection → test + threshold tuning
  1.3  BUG 3: Voice confirmation → test E2E (dipende da 1.2)
  1.4  BUG 4: go2rtc stability → cron health check
  → /test-all dopo ogni fix

FASE 2 — HARDENING:
  2.1  Tailscale enforcement (firewall pf)
  2.2  Credential audit
  → /audit dopo hardening

FASE 3 — BACKUP:
  3.1  NAS backup automatico
  3.2  GDrive ampliamento
  3.3  Clip management
  3.4  BackupManager + LaunchAgent
  → /status-casa dopo backup

FASE 4 — INTEGRAZIONI (dopo bug risolti):
  4.1  PS4 (se utente ha fatto pairing)
  4.2  Eureka (se utente ha registrato su MSmartHome)
  4.3  PTZ Ronda (dopo BUG 1 risolto)
  → /verify-agents + /test-all dopo ogni integrazione

FASE 5 — MEDICATION REMINDER:
  5.1  disease_profiles.json → scheduler → TTS
  → test audibile + compliance log
```

## AGENTS DA USARE

| Task | Agent | Skill |
|------|-------|-------|
| PTZ debug | `backend-architect` | pyezviz API |
| YOLO fall tuning | `backend-architect` | FallScorer code |
| Voice confirm test | `test-results-analyzer` | log analysis |
| go2rtc health | `devops-automator` | cron + monitoring |
| Tailscale firewall | `network-hardener` | pf rules |
| PS4 controller | `backend-architect` | pyps4-2ndscreen |
| Eureka controller | `backend-architect` | midea-local |
| Backup system | `devops-automator` + `infrastructure-maintainer` | rclone + cron |
| NAS management | `infrastructure-maintainer` | disk + retention |
| Credential audit | `infrastructure-maintainer` | grep + review |
| Post-deploy audit | `/verify-agents` + `/test-all` + `/audit` | skills |

## REGOLE OPERATIVE

1. **Agent-first**: ogni task va all'agent specializzato, MAI ragionamento generico
2. **Evidence-based**: MAI dire "funziona" senza output reale
3. **Research-first**: ricerca GitHub/docs PRIMA di scrivere codice
4. **File completi**: MAI patch incrementali, SEMPRE file completo + scp
5. **Backup**: cp file file.bak PRIMA di ogni modifica
6. **Test**: test E2E con evidenza PRIMA di dichiarare DONE
7. **Audit**: /test-all + /audit DOPO ogni implementazione
8. **Push**: git push a fine sessione SEMPRE
