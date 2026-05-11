# S116 — ARGOS PRE-LAUNCH AUDIT & FIX
# Da zero contatti reali a primo dossier inviato in sicurezza

## STEP 0 — CONTEXT LOAD (mandatory, no skip)

Leggi questi file in ordine PRIMA di toccare qualsiasi codice:
1. `HANDOFF.md`
2. `wa-intelligence/wa-daemon.js`
3. `wa-intelligence/response-analyzer.py`
4. `.env` (solo per verificare keys presenti — non stampare valori)

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto
export PATH=$HOME/.npm-global/bin:/usr/local/bin:$PATH

echo "=== WA DAEMON STATUS ==="
pm2 list | grep argos
curl -s http://localhost:9191/status 2>/dev/null | python3 -m json.tool

echo ""
echo "=== DB SCHEMA ==="
python3 -c "
import sqlite3
con = sqlite3.connect('dealer_network.sqlite')
for t in ['conversations','messages','pending_replies']:
    cols = [c[1] for c in con.execute(f'PRAGMA table_info({t})').fetchall()]
    count = con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]
    print(f'{t} ({count} rows): {cols}')
"

echo ""
echo "=== ULTIMI PDF ==="
ls -lht dossiers/*.pdf 2>/dev/null | head -3

echo ""
echo "=== STATO CONVERSAZIONI ==="
python3 -c "
import sqlite3
con = sqlite3.connect('dealer_network.sqlite')
rows = con.execute('''
    SELECT dealer_id, dealer_name, city,
           conversation_state, outbound_count, inbound_count
    FROM conversations
''').fetchall()
for r in rows:
    print(f'  {r}')
"
EOF
```

Confirm: "WA daemon online porta 9191. DB letto.
Bug direction confermato. Stato conversazioni caricato."

Do NOT proceed until confirmed.

---

## EXECUTION POLICY

Esegui autonomamente Block 1-4 (fix tecnici).
**Block 5 (invio reale) richiede approvazione esplicita del fondatore**
sul dealer scelto, numero esatto, testo esatto del messaggio.

---

## CRITICAL RISK — WA BAN PREVENTION

**PRIMA di qualsiasi fix, aggiungi questo controllo permanente.**

Ricerca verificata ottobre 2025 (Chatarmin, TechCrunch, WASenderAPI):
- Account nuovi: limite 250 messaggi/giorno (non più 1000)
- Frequency cap: max 2 template marketing per utente/24h
- Il pattern LLM spam (stesso msg x5) è il trigger principale di ban
- Cold outreach senza opt-in = policy violation + ban immediato
- Safe delay: 3-8 secondi tra messaggi, max 5 nuovi contatti/giorno

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto

python3 -c "
import sqlite3
from datetime import datetime, timedelta
con = sqlite3.connect('dealer_network.sqlite')

cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
count_24h = con.execute('''
    SELECT COUNT(*) FROM messages
    WHERE direction = 'outbound'
    AND created_at > ?
''', (cutoff,)).fetchone()[0]

print(f'Outbound ultime 24h: {count_24h}')
print('SAFE' if count_24h < 50 else 'ATTENZIONE: volume alto')
"

echo ""
echo "=== HEALTH CHECK WA NUMBER ==="
curl -s http://localhost:9191/status 2>/dev/null | python3 -m json.tool
EOF
```

---

## BLOCK 1 — FIX DIRECTION BUG

Usa `backend-architect` skill per analisi prima di scrivere il fix.

### 1A — Diagnosi esatta

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto

echo "=== DOVE VIENE SCRITTO DIRECTION ==="
grep -n "direction\|fromMe\|INSERT.*messages\|saveMessage" \
  wa-intelligence/wa-daemon.js | head -30

echo ""
echo "=== EVIDENCE: msg ARGOS loggati come inbound ==="
python3 -c "
import sqlite3
con = sqlite3.connect('dealer_network.sqlite')
rows = con.execute('''
    SELECT dealer_id, direction, SUBSTR(body,1,80), created_at
    FROM messages
    WHERE direction = 'inbound'
      AND (body LIKE '%Luca Ferretti%'
           OR body LIKE '%dossier%'
           OR body LIKE '%margine%'
           OR body LIKE '%Germania%')
    ORDER BY created_at DESC LIMIT 10
''').fetchall()
print(f'Msg ARGOS loggati come inbound: {len(rows)}')
for r in rows:
    print(f'  [{r[0]}] {r[1]}: {r[2]}')
"
EOF
```

### 1B — Fix nel wa-daemon.js

Trova il handler message e correggi direction.
Il pattern corretto:
```javascript
const direction = msg.fromMe ? 'outbound' : 'inbound';
```

Backup obbligatorio prima:
```bash
ssh gianlucadistasi@192.168.1.2 \
  "cp ~/Documents/app-antigravity-auto/wa-intelligence/wa-daemon.js \
      ~/Documents/app-antigravity-auto/wa-intelligence/wa-daemon.js.bak_s116"
```

### 1C — Test direction fix

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
export PATH=$HOME/.npm-global/bin:/usr/local/bin:$PATH
cd ~/Documents/app-antigravity-auto

pm2 restart argos-wa-daemon
sleep 5

API_KEY=$(grep ARGOS_API_KEY .env | cut -d= -f2 | tr -d ' ')
curl -s -X POST http://localhost:9191/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "phone": "393314928901",
    "message": "[TEST DIRECTION FIX] Questo è un outbound test",
    "dealer_id": "TEST_FOUNDER"
  }'

sleep 8

python3 -c "
import sqlite3
con = sqlite3.connect('dealer_network.sqlite')
r = con.execute('''
    SELECT direction, SUBSTR(body,1,60), created_at
    FROM messages
    WHERE dealer_id = 'TEST_FOUNDER'
      AND body LIKE '%TEST DIRECTION FIX%'
    ORDER BY created_at DESC LIMIT 1
''').fetchone()
if r:
    print(f'Direction: {r[0]}')
    print(f'Body: {r[1]}')
    print('PASS' if r[0] == 'outbound' else 'FAIL — direction ancora invertita')
else:
    print('FAIL — messaggio non trovato nel DB')
"
EOF
```

**PASS criteria:** direction = 'outbound'. Non procedere se FAIL.

---

## BLOCK 2 — FIX STATO ENGAGED FALSO + DB CLEANUP

### 2A — Diagnosi state machine

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto

echo "=== COME DECIDE ENGAGED ==="
grep -n "ENGAGED\|RESPONSE_RECEIVED\|state.*=\|transition" \
  wa-intelligence/response-analyzer.py | head -30

echo ""
echo "=== FILTRO MESSAGGI NOISE ==="
grep -n "empty\|media\|image\|broadcast\|body.*None\|len.*body" \
  wa-intelligence/response-analyzer.py | head -15
EOF
```

### 2B — Fix filtro messaggi noise

Il sistema deve ignorare messaggi vuoti, media senza testo,
status update WA. Classificare come risposta SOLO testo >= 3 char.

### 2C — Cleanup DB

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto

cp dealer_network.sqlite \
   dealer_network.sqlite.bak_s116_$(date +%Y%m%d_%H%M%S)

python3 -c "
import sqlite3
con = sqlite3.connect('dealer_network.sqlite')

updated = con.execute('''
    UPDATE conversations
    SET conversation_state = 'CONTACTED',
        inbound_count = 0,
        last_contact_at = NULL
    WHERE dealer_id = 'TIER0_AV_001'
      AND conversation_state = 'ENGAGED'
''').rowcount
print(f'Car Plus reset: {updated} rows')

deleted_msg = con.execute('''
    DELETE FROM messages
    WHERE dealer_id = 'TIER0_AV_001'
''').rowcount
print(f'Messaggi noise eliminati: {deleted_msg}')

deleted_pr = con.execute('''
    DELETE FROM pending_replies
    WHERE dealer_id = 'TIER0_AV_001'
''').rowcount
print(f'Pending replies eliminate: {deleted_pr}')

con.commit()

print()
print('=== STATO POST-CLEANUP ===')
rows = con.execute('''
    SELECT dealer_id, dealer_name, conversation_state,
           outbound_count, inbound_count
    FROM conversations
    WHERE dealer_id != 'TEST_FOUNDER'
''').fetchall()
for r in rows:
    print(f'  {r[0]:<20} {r[1]:<20} {r[2]:<12} out={r[3]} in={r[4]}')

pending = con.execute(
    'SELECT COUNT(*) FROM pending_replies').fetchone()[0]
print(f'Pending replies totali: {pending}')
"
EOF
```

**PASS:** Car Plus CONTACTED, 0 pending replies, backup presente.

---

## BLOCK 3 — FIX ANTI-SPAM LLM

**Fix più critico per sopravvivenza numero WA.**

### 3A — Diagnosi loop

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto

echo "=== DOVE GENERA MULTI-MESSAGE ==="
grep -n "generate\|reply.*send\|multi.*message\|for.*msg" \
  wa-intelligence/response-analyzer.py | head -20

echo ""
echo "=== ESISTE UN DEDUP? ==="
grep -n "dedup\|duplicate\|already_sent\|cooldown\|last_reply" \
  wa-intelligence/response-analyzer.py | head -10

echo ""
echo "=== CAP OUTBOUND ==="
grep -n "outbound_count\|can_send\|max_send\|daily_limit" \
  wa-intelligence/response-analyzer.py | head -10
EOF
```

### 3B — Fix anti-spam

3 regole da implementare:
1. Max 1 risposta per dealer per 24h
2. Dedup via checksum (no messaggi identici)
3. Safe delay 3-8s tra messaggi (policy WA 2026)

### 3C — Test anti-spam

```bash
# Invia 2 msg consecutivi → il secondo deve essere BLOCCATO
# PASS: solo 1 messaggio loggato su 2 inviati
```

---

## BLOCK 4 — TOKEN TG + WA HEALTH

### 4A — Token Telegram (azione manuale fondatore)

```
BotFather → /mybots → seleziona bot → API Token → Revoke
→ Copia nuovo token → aggiorna .env su iMac → pm2 restart
```

### 4B — Verifica

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto
export PATH=$HOME/.npm-global/bin:/usr/local/bin:$PATH

TG=$(grep -E "^TELEGRAM_BOT_TOKEN|^ARGOS_TELEGRAM_TOKEN" \
  .env | tail -1 | cut -d= -f2 | tr -d ' ')
echo "Token: ${#TG} chars, prefix: ${TG:0:10}..."

curl -s "https://api.telegram.org/bot${TG}/getMe" | \
  python3 -c "
import sys, json
d = json.load(sys.stdin)
print('ok:', d.get('ok'))
print('bot:', d.get('result',{}).get('username',''))
print('PASS' if d.get('ok') else 'FAIL')
"

pm2 list | grep argos-wa-daemon
curl -s http://localhost:9191/status | python3 -m json.tool
EOF
```

---

## BLOCK 5 — PRIMO DOSSIER REALE

**Richiede approvazione esplicita fondatore per: dealer, numero, testo.**

### 5A — Lista dealer disponibili
### 5B — Genera dossier (7/7 quality gate)
### 5C — Fondatore scrive messaggio WA a mano (NON LLM)

Template:
```
Buongiorno, sono Luca Ferretti.
Ho una BMW X3 2021, [KM] km, [COLORE] — €[PREZZO] in Germania.
A lei resta un margine di €[MARGINE] netti, bisarca e pratiche incluse.
Le mando la scheda. Interessato a questo tipo di macchina?
```

### 5D — Invio (commentato, decommenta solo dopo conferma)
### 5E — Verifica post-invio (log + DB + health)

---

## BLOCK 6 — MONITORING 24-48H

Script giornaliero: stato WA, messaggi, stato dealer.

---

## DONE CRITERIA

| Block | Check | Evidence | Status |
|-------|-------|----------|--------|
| Risk | Ultime 48h < 50 outbound | DB count | ☐ |
| 1 | Direction = outbound | Msg test DB | ☐ |
| 2 | Car Plus = CONTACTED | DB query | ☐ |
| 2 | Pending replies = 0 | DB count | ☐ |
| 3 | Anti-spam: 1 msg su 2 | DB count | ☐ |
| 4 | Token TG ok:true | curl getMe | ☐ |
| 4 | WA health GREEN | /status | ☐ |
| 5 | PDF 7/7 quality | Output script | ☐ |
| 5 | Dealer+testo approvati | Fondatore | ☐ |
| 5 | WA inviato | pm2 log | ☐ |
| 5 | Direction outbound DB | DB query | ☐ |
| 6 | Dealer risponde | Msg in 48h | ☐ |

```
S116 PRE-LAUNCH:

WA risk:         [GREEN/YELLOW/RED]
Direction fix:   [PASS/FAIL]
DB cleanup:      [PASS/FAIL]
Anti-spam:       [PASS/FAIL]
Token TG:        [VALID/INVALID]
PDF quality:     [7/7 o N/7]
WA inviato a:    [DEALER_NAME] / [BLOCKED_BY: X]
Dealer risponde: [ATTESA / RICEVUTA / NESSUNA 48h]
```

**Zero features nuove finché questo report non è completo.
L'unico numero che conta: 1 risposta reale da 1 dealer reale.**
