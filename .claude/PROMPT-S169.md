# Prompt next session — S169 (wa-daemon E2E test + V3-rev2 send TEST_FOUNDER + handoff next)

> Salvato 2026-05-14 close S168 verde. Brief auto-iniettato all'avvio CC.
> S168 ha shipped: wa-daemon wire-up patches (hook 1 + hook 2 + schema migration). Code path completo, code-side production-ready.
> S169 = founder-action sequence (env setup + QR auth) + E2E test reale TEST_FOUNDER.

---

## Cosa è SHIPPED S168 (autonomous, code-side)

**Commit S168 ARGOS** in `~/Documents/combaretrovamiauto-enterprise/`:
- `wa-intelligence/wa-daemon.js` patch additive feature-flagged `BRIDGE_DB_PATH`:
  - Bridge helpers: `getBridgeDb()`, `bridgeResolveRole()`, `bridgeIngestInbound()`, `pollBridgeOutbound()`
  - Hook 1: `message_create` → `bridgeIngestInbound(msg)` (dual-write a `bridge_inbound`)
  - Hook 2: `client.on('ready')` → `setInterval(pollBridgeOutbound, 30s)` con anti-ban 30-90s D-04
  - LIMIT 5 per ciclo → throughput cap built-in
  - HITL strict D-07: SELECT solo righe `approved_ts IS NOT NULL AND sent_ts IS NULL`
- `comm-broker/wa_bridge.py`:
  - `BRIDGE_SCHEMA` aggiornato con `wa_msg_id TEXT` in `bridge_outbound` (nuovi DB)
  - `_init_schema()` ALTER idempotente per DB pre-S168 (verify via PRAGMA)
  - `mark_sent(outbound_id, status='ok', wa_msg_id=None)` aggiornato per audit trail
- `comm-broker/WA_DAEMON_WIRE_UP_PLAN.md` aggiornato con status [x] su 4 DoD items

**Verifiche autonome eseguite**:
- `node --check wa-daemon.js` → OK
- Tests regression 17/17 PASS (incl 4 live Groq calls)
- Schema migration smoke su legacy DB: ALTER idempotent + `wa_msg_id` roundtrip verified
- Patch è feature-flagged → no-op completo se `BRIDGE_DB_PATH` non set (zero regression risk su daemon esistente)

## Gap rilevati S168 (env setup MAI eseguito su MacBook)

1. **`wa-intelligence/.env` non esiste** → wa-daemon non avviabile (manca `OPENROUTER_API_KEY`, `ARGOS_TELEGRAM_TOKEN`, ecc)
2. **`ecosystem.config.js` BASE stale**: punta `~/Documents/app-antigravity-auto/` (non esiste). Repo reale `~/Documents/combaretrovamiauto-enterprise/`. Probabile residuo da rename pre-S116.
3. **pm2 non installato globalmente** (solo via npx)
4. **WA LocalAuth session assente** → primo avvio richiede QR scan da telefono Luke (one-time)

## Goal S169 — Sequenza atomica

### Step 1 — Fix ecosystem.config.js BASE path (~2 min, autonomous)
Sed line 24: `Documents/app-antigravity-auto` → `Documents/combaretrovamiauto-enterprise`
Verify: `node -e "require('./wa-intelligence/ecosystem.config.js')"` no error.

### Step 2 — Crea `wa-intelligence/.env` (~5 min, FOUNDER input keys)

```bash
cat > ~/Documents/combaretrovamiauto-enterprise/wa-intelligence/.env <<'EOF'
# Mandatory wa-daemon + handler keys
OPENROUTER_API_KEY=sk-or-v1-...           # da 1Password "OpenRouter ARGOS"
OPENROUTER_MODEL=anthropic/claude-haiku-4-5
ARGOS_TELEGRAM_TOKEN=...                  # da 1Password "Telegram Bot ARGOS"
ARGOS_TELEGRAM_CHAT_ID=931063621
ARGOS_API_KEY=...                         # genera fresh: openssl rand -hex 32
WA_CLIENT_ID=argos-business
GMAIL_FERRETTI_EMAIL=...                  # opzionale, solo se CF monitor in uso
GMAIL_FERRETTI_APP_PASSWORD=...

# S168 BRIDGE WIRE-UP — feature flag attivazione
BRIDGE_DB_PATH=/Users/macbook/Documents/combaretrovamiauto-enterprise/comm-broker/bridge.sqlite
BRIDGE_POLL_INTERVAL_MS=30000
EOF
chmod 600 ~/Documents/combaretrovamiauto-enterprise/wa-intelligence/.env
```

### Step 3 — pm2 install + bootstrap (~5 min, founder cmd)
```bash
npm install -g pm2  # one-time global install
cd ~/Documents/combaretrovamiauto-enterprise/wa-intelligence
pm2 start ecosystem.config.js
pm2 save
# launchd auto-restart già documentato in launchd/com.argos.pm2.plist
```

### Step 4 — WA QR auth one-time (~3 min, FOUNDER action telefono)
```bash
pm2 logs argos-wa-daemon --lines 50
# Cerca riga "QR ricevuto" o URL /qr → apri http://localhost:9191/qr in browser
# Scan QR con WhatsApp business Luca Ferretti +39 328 1536308
# Attendi "✅ Client PRONTO" + "[bridge] polling enabled every 30000ms"
```

### Step 5 — Bridge wire setup E2E test (~10 min, autonomous post-QR)

```bash
cd ~/Documents/combaretrovamiauto-enterprise/comm-broker
BRIDGE_DB=$(grep '^BRIDGE_DB_PATH=' ../wa-intelligence/.env | cut -d= -f2)

# 1. Crea bridge DB + deal test + party TEST_FOUNDER
.venv/bin/python <<PYEOF
from wa_bridge import WABridge, OutboundCandidate
from deal_state_machine import Deal, DealStateMachine
import sqlite3

bridge_db = "$BRIDGE_DB"
deals_db = "/tmp/deals_s169.sqlite"

# Crea deal test
fsm = DealStateMachine(Deal(deal_id='S169-TEST-001', dealer_alias='TEST_FOUNDER', seller_alias='SELF',
                            vehicle_desc='Test V3-rev2', fee_eur=0), db_path=deals_db)

br = WABridge(bridge_db, deals_db)
br.register_party('393314928901', 'dealer', 'TEST_FOUNDER', 'IT')

# Queue V3-rev2 finale (testo D-21 communication-broker)
v3 = """Buongiorno, sono Luca Ferretti.

Trovo auto premium dalla Germania, Belgio, Olanda, Austria
per concessionari italiani. Sto cercando 2-3 referenti per la
provincia di Foggia.

Niente da venderle oggi. Solo presentarmi: se le capita un cliente
che chiede una BMW, Mercedes o Audi specifica, mi può scrivere.
Le mando il dossier completo dell'auto che ho trovato (foto, anno,
km, prezzo, margine atteso per lei). Se la convince, sblocca con
€1.000 cash i dati per andarla a prendere. Il resto lo fa lei,
margine resta tutto suo.

Per il momento è solo per averla nel pallottoliere.

Luca Ferretti"""

oid = br.queue_outbound(OutboundCandidate(
    deal_id='S169-TEST-001', target_role='dealer', target_phone='393314928901',
    template_phase='offer', template_lang='it', body=v3, state_at_send='offer_sent'
))
print(f'queued id={oid}')
br.approve_outbound(oid)
print(f'approved id={oid} — wa-daemon poll dovrebbe inviarlo entro 30s')
PYEOF

# 2. Verifica log
sleep 35
pm2 logs argos-wa-daemon --lines 30 --nostream | grep -E "\[bridge\]|sent ok"

# 3. Verifica delivery su telefono Luke (TEST_FOUNDER 393314928901)
sqlite3 "$BRIDGE_DB" "SELECT id, sent_ts, sent_status, wa_msg_id FROM bridge_outbound;"
```

**Done when**:
- `sent_status='ok'` + `wa_msg_id` non-null
- Telefono Luke riceve messaggio V3-rev2 entro 30s
- Reply Luke ("sì interessato" o "STOP") → `bridge_inbound` row generata (verify `SELECT * FROM bridge_inbound`)

### Step 6 — Verify classifier su reply (~5 min, autonomous post-Luke-reply)

```bash
cd ~/Documents/combaretrovamiauto-enterprise/comm-broker
.venv/bin/python <<PYEOF
import sqlite3
from message_analyzer import analyze_message

bridge_db = "$BRIDGE_DB"
conn = sqlite3.connect(bridge_db)
row = conn.execute("SELECT msg_id, body FROM bridge_inbound ORDER BY received_ts DESC LIMIT 1").fetchone()
if not row:
    print("NO REPLY YET — Luke deve rispondere a TEST_FOUNDER")
else:
    msg_id, body = row
    result = analyze_message(body, deal_id='S169-TEST-001', target_role='dealer')
    print(f"classifier su '{body[:50]}...': sentiment={result.sentiment} intent={result.intent} scam_flag={result.scam_flag}")
PYEOF
```

**Done when**: `sentiment` ∈ {POSITIVE, NEGATIVE, NEUTRAL} coerente con testo reply Luke. Se POSITIVE → Day 3 candidate generabile via state machine. Se NEGATIVE/STOP → opted_out flag.

### Step 7 — Entry D-21 V3-rev2 finale (~10 min)
Patch `wiki/projects/ARGOS/DECISIONS.md` D-21 con:
- testo V3-rev2 finale validato (Step 5)
- classifier outcome verify (Step 6)
- timestamp send + reply

### Step 8 — Handoff S170 (~10 min)
- Se Step 1-7 verde → S170 dealer reale primo TIER 0 (Stile Car FG o Car Plus AV)
- Se Step 4 QR fail / Step 5 send fail → debug + handoff S170-debug

## Vincoli sessione S169

- **#1** verifica fattuale ogni cmd con `--help` reale prima exec
- **#3** raccomandazione singola motivata (es: pm2 vs nohup → pm2, già configurato ecosystem.config.js)
- **#4** critica strutturale su cambiamenti env (segreti in `.env`, NO commit)
- **#5** zero capex (pm2 OSS, nessun servizio paid)
- **#6** verde fino Step 6 incluso, OR handoff S170-debug strutturato
- **#7** chiusura sotto 60% context
- **#9** no diplomatico
- **#13** pre-action check obbligatorio (cwd ARGOS → B6 L1 inietta DECIDED entries)

## Open question critical pre-S169

1. **`OPENROUTER_API_KEY` e `ARGOS_TELEGRAM_TOKEN`**: Luke deve recuperare da 1Password o credenziali archiviate. Se mancano → fallback: scheduler/cf-monitor falliscono ma wa-daemon + bridge funzionano comunque (vincolo Bridge isolato da OpenRouter).
2. **Image-shield NOT in V3-rev2**: Step 5 invia solo testo (no immagini). Image-shield (`comm-broker/image_shield.py`) sarà testato S170 quando dossier reale generato per dealer TIER 0.
3. **`time-context.js` (TC.buildAgentTimeContext)**: verifica modulo presente in wa-intelligence/ o richiede ulteriore patch.
4. **DocuSeal self-host iMac**: deferred a S170+ (richiede Docker iMac setup, non blocca send TEST_FOUNDER).

## Rollback plan se patch S168 rompe wa-daemon

```bash
# Opzione A: disabilita feature flag (~5 sec, no code change)
sed -i '' '/^BRIDGE_DB_PATH=/d' ~/Documents/combaretrovamiauto-enterprise/wa-intelligence/.env
pm2 restart argos-wa-daemon
# → tutte le hook diventano no-op, daemon torna a pre-S168 behavior

# Opzione B: revert commit S168 completo
cd ~/Documents/combaretrovamiauto-enterprise
git log --oneline | head -5  # trova commit hash S168
git revert <hash>
pm2 restart argos-wa-daemon
```

## Riferimenti S168

- Commit S168 ARGOS: `git log -1 --format=%H wa-intelligence/wa-daemon.js comm-broker/wa_bridge.py`
- WA_DAEMON_WIRE_UP_PLAN.md (DoD aggiornata, [x] su patches/migration/tests)
- VOS handoff S168 chiuso (questo file = nuovo PROMPT-S169)

## Pattern recognition S168

1. **Verifica env locale prima di "production assumption"**: S167 plan assumeva PM2 stack production. Realtà: stale `BASE` + `.env` missing + pm2 non installato. Pattern: prima di proporre patch su "production stack", verify locale via `pm2 list`, `cat .env`, `node -e "require('./ecosystem.config.js')"`.
2. **Feature-flagged additive = ship-friendly**: patch è no-op completo senza env → posso shippare side-code anche senza setup env. Permette parallel work: code-side (autonomous) vs env-side (founder).
3. **Schema migration idempotent**: pattern PRAGMA `table_info` + condizionale ALTER è clean. Riutilizzabile pattern S169+.
