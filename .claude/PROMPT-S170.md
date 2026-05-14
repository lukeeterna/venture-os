# Prompt next session — S170 (cold-lead V5 framework + wave 1 outreach 5 dealer Italia + pipeline inbound E2E)

> Salvato 2026-05-14 close S169 verde. Brief auto-iniettato all'avvio CC.
> S169 ha shipped: pipeline outbound E2E live-tested su iMac production (queue→approve→poll→sendMessage→sent_status='ok'+wa_msg_id+receipt founder phone confermato).
> Foggia geo-anchor caught (memory feedback_argos_scope_italia.md). V3-rev2 deprecated → V5 person-first framework proposto.

---

## Stato S169 close

**Pipeline outbound technical**: VALIDATED E2E live.
- iMac production stack: PM2 daemon PID 33804 con bridge wire-up attivo
- BRIDGE_DB_PATH `/Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/bridge.sqlite`
- `[bridge] polling enabled every 30000ms (batch=5, anti-ban 30-90s)`
- HITL D-07 strict: outbound polled solo se `approved_ts IS NOT NULL AND sent_ts IS NULL`
- `wa_msg_id` audit trail funzionante

**Content V3-rev2**: deprecated.
- Founder feedback: "non lo ritengo efficace"
- Pattern S159 carry-over caught: V3-rev2 da S166→S168→S169 senza re-validation = drift content artifact (B6 L2 da estendere a carry-over content, non solo proposte ex-novo)

**Foggia geo-anchor**: caught + saved.
- Memory file `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_argos_scope_italia.md`
- ARGOS scope = TUTTA ITALIA. Mai hardcodare territorio in proposte/planning/esempi

## V5 cold-lead person-first framework (proposto S169, da validare S170)

Paradigma **relational** (vs V3-rev2/V4 **transactional**). Funzione msg1 = vendere msg2.

**Architettura 3-step**:
- **Msg 1**: persona + mirror reality (margine premium calante, km bassi scarsi mercato IT) + domanda aperta (no yes/no) + ZERO ask transattivo
- **Msg 2** (3-7gg dopo se reply): amplify punto suo + caso concreto mestiere + soft question
- **Msg 3** (post engagement): "le mando dossier?" binary CTA, friction zero, trust pre-built

**V5 Msg 1 testo proposto** (~95 words, NO geo-anchor):

```
Buongiorno,

mi chiamo Luca Ferretti. Mi occupo di trovare auto premium
(BMW, Mercedes, Audi) sui mercati di Germania, Belgio e
Olanda per concessionari italiani che vogliono ampliare
l'offerta senza immobilizzare capitale in stock.

Le scrivo non per propormi qualcosa oggi, ma per capire
come lavora. Ho l'impressione che il margine sul premium
usato si stia restringendo, e che i clienti chiedano sempre
più spesso auto con chilometraggio basso certificato
(sotto i 60.000), che sul mercato italiano costano care e
sono difficili da reperire.

Cosa sta facendo lei in questa situazione? Importa
direttamente, o ci sono altri canali che le funzionano?

Luca Ferretti
Argos Import
```

**Data-anchor verificato** (S169 WebSearch 2026-05-14):
- AutoScout24.it BMW Serie 3 sub-30k€ <60k km ≥2021: 28 annunci Italia
- AutoScout24 cy=D BMW (tutti modelli) stessi filtri: 1152 annunci
- Stima ratio density DE vs IT ≥7-10x → claim "scarsi su mercato italiano" verificato

## Goal S170 — Sequenza atomica

### Step 1 — Test E2E inbound completo (~10 min autonomous)
Pipeline tecnica: outbound validata, inbound NON ancora.
- Founder risponde da `+39 331 492 8901` al messaggio V3-rev2 con stringa di test (es. "ok dossier" o "sì interessato" o "STOP")
- Hook 1 `bridgeIngestInbound` cattura → `bridge_inbound` INSERT
- Run classifier `comm-broker/message_analyzer.py` su body inbound via Groq cascade
- Verify: `intent`, `sentiment`, `scam_flag` populated coerentemente

```bash
# 1. Founder phone: reply al messaggio V3-rev2 (qualsiasi testo)
# 2. SSH iMac: verify inbound capture
ssh imac "sqlite3 -header /Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/bridge.sqlite \
  'SELECT msg_id, body, received_ts FROM bridge_inbound ORDER BY received_ts DESC LIMIT 1'"
# 3. Run classifier
ssh imac "cd ~/Documents/app-antigravity-auto/comm-broker && PYTHONPATH=. .venv/bin/python -c \"
import sqlite3
from message_analyzer import analyze_message
conn = sqlite3.connect('/Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/bridge.sqlite')
row = conn.execute('SELECT msg_id, body FROM bridge_inbound ORDER BY received_ts DESC LIMIT 1').fetchone()
result = analyze_message(row[1], deal_id='S169-TEST-001', target_role='dealer')
print(f'intent={result.intent} sentiment={result.sentiment} scam_flag={result.scam_flag}')
\""
```

**Done when**: bridge_inbound row presente + classifier output coerente (e.g., "ok dossier" → intent=positive, sentiment=POSITIVE, scam_flag=False).

### Step 1.5 — Trial `pp-openrouter` cross-LLM check su V5 (~10 min, autonomous)
Trigger gate seed 999.1: install `pp-openrouter` CLI + 1 trial reale per validare workflow.

```bash
# Install (npm-global, no sudo)
npm install -g pp-openrouter  # OR via Printing Press factory se non in registry

# Trial: cross-LLM check V5 testo
pp-openrouter ask --model "google/gemini-2.0-flash-exp:free" \
  "Valuta efficacia di questo cold-lead B2B Italian per dealer auto premium: [V5 testo]. \
   Bocciare specifico, suggerire alternative se applicabile."
pp-openrouter ask --model "meta-llama/llama-3.3-70b-instruct:free" \
  "[same prompt]"
```

Done when: 2 cross-LLM output collected, salvati in `~/venture-os/state/cross-llm-checks/S170-V5.md`. Se workflow utile → keep CLI. Se non uso entro 14gg → uninstall + downgrade seed 999.1 a DEFER pieno.

### Step 2 — V5 testo final review founder (~5 min, founder gate)
Founder decide:
- V5 testo va bene così, o modifichi parole?
- Footer "Argos Import" SI/NO?
- "Le scrivo non per propormi qualcosa oggi" suona troppo USA-sales → alternativa "Le scrivo per conoscerla, non per vendere oggi"?

### Step 3 — Wave 1 outreach 5 dealer Italia (~30 min con founder selection)
**FOUNDER ACTION**: scegli 5 dealer Italiani (mix territori per evitare geo-bias) da `dealer_network.sqlite` (18 dealers presenti):
- 1 dealer Nord (Lombardia/Veneto/Piemonte)
- 1 dealer Centro (Toscana/Lazio/Marche)
- 1 dealer Sud (Campania/Puglia/Calabria)
- 1 dealer Isole (Sicilia/Sardegna)
- 1 dealer wildcard founder choice

Per ogni dealer: register_party → queue V5 → approve → daemon poll send 30s (anti-ban 30-90s tra send = 5 send distribuiti su ~5 min).

```bash
ssh imac "cd ~/Documents/app-antigravity-auto/comm-broker && PYTHONPATH=. .venv/bin/python -c \"
from wa_bridge import WABridge, OutboundCandidate
from deal_state_machine import Deal, DealStateMachine

V5 = '''[testo finale V5 dopo Step 2 review]'''

br = WABridge('/Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/bridge.sqlite',
              '/Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/deals.sqlite')

DEALERS = [
    # ('39XXXXX', 'NomeDealer', 'IT'),  # founder fills 5 rows
]
for phone, name, country in DEALERS:
    DealStateMachine(Deal(deal_id=f'S170-WAVE1-{name}', dealer_alias=name, seller_alias='SELF'),
                     db_path='/Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/deals.sqlite')
    br.register_party(phone, 'dealer', name, country)
    oid = br.queue_outbound(OutboundCandidate(
        deal_id=f'S170-WAVE1-{name}', target_role='dealer', target_phone=phone,
        template_phase='offer', template_lang='it', body=V5, state_at_send='offer_sent'
    ))
    br.approve_outbound(oid)
    print(f'queued+approved {name} {phone} id={oid}')
\""
```

### Step 4 — Reply tracker manual review (~30 min/giorno per 7 giorni)
Per ogni reply nei prossimi 7gg:
- `bridge_inbound` capture automatic
- Manual review classifier output → decide msg 2 personalizzato hand-crafted (NO automation msg2 ancora)
- Tracker KPI: reply rate msg1, time-to-reply, sentiment, intent

**Metric success target**:
- Reply rate msg1 ≥ 20% (1+ su 5) → V5 funziona, OK procedere wave 2
- Reply rate < 20% dopo 7gg → V5 a debug, spawn research-protocol-v2 4-agent su cold-lead B2B IT specifico

### Step 5 — Patch D-21 con V5 testo finale + framework + autocritica (~15 min)
ARGOS DECISIONS.md D-21 update:
- Sostituire V3 testo con V5 testo validato
- Aggiungere D-26 nuova entry "framework cold-lead B2B 3-step relational" come decisione standalone riusabile cross-territori

### Step 6 — Iterazione post-wave 1 (~variabile)
Base sui dati wave 1:
- Se ≥20% reply: prepara wave 2 da 15-20 dealer (scaling D-14)
- Se <20% reply: research-protocol-v2 deep dive cold-lead IT + V6 iteration
- Se reply qualità bassa (dismissive/spammy responses): rivedere targeting CoVe pipeline output (dealer_network qualità dataset)

## Vincoli sessione S170

- **#1** verifica fattuale: ogni numero/claim ARGOS V5 deve essere verificato (V5 attuale già verified S169 WebSearch)
- **#3** raccomandazione singola: founder choose dealer (scope) ma NO opzioni A/B su V5 finalizzato
- **#4** autocritica 4 punti per ogni decisione content
- **#5** zero capex
- **#6** verde wave 1 send completata + reply tracker armato, OR handoff S171-debug se reply rate critico
- **#7** chiusura sotto 60% context
- **#9** no diplomatico (continua pattern S169 dove Luke ha sfidato 2 volte e ho corretto)
- **#10** verificato > verosimile (data anchor mandatorio prima di operationalize V5+)
- **#11** memoria feedback_argos_scope_italia.md applica anche a V5+ — MAI Foggia/etc
- **#13** pre-action check (B6) su ogni V5 modifica

## Open question critical pre-S170

1. **GROQ_API_KEY rotation founder action** (S169 close verification):
   - ✅ `.env` IN `.gitignore` ARGOS — NON tracked, NON in git history
   - ✅ `.env.example` (no-secrets template) correctly committed
   - ⚠️ Key `gsk_MA8...mc` apparsa nel log Bash di questa sessione (conversation context). Non in repo ma visibile in session log.
   - **FOUNDER ACTION S170**: rotate key via console Groq (https://console.groq.com/keys) → revoke old + generate new (30 sec, free) → update iMac `wa-intelligence/.env` GROQ_API_KEY → `pm2 restart argos-wa-daemon` per pickup nuova env.
2. **Dealer numero telefono whitelist**: il daemon ARGOS ha "pipeline whitelist" filter (log mostra "Messaggio da numero non in pipeline: 393XXXX — ignorato" per numeri non in dealer_network.sqlite). I 5 dealer wave 1 devono essere già in pipeline OR aggiungerli prima del send.
3. **Image-shield V5**: V5 NON include foto nel msg1 (text-only). Image-shield D-25 entra in scena msg3 quando si invia il dossier reale. S170 non testa image-shield ancora.
4. **DocuSeal pre-deal anti-disintermediation D-24**: NON in scope msg1/2/3. Entra a partire da dealer #1 reale chiusura deal (S171+). 

## Riferimenti

- ARGOS commit S168 `d60d682` (wa-daemon patches additive)
- ARGOS commit S169 portable `032393b` (paths __dirname)
- ARGOS commit S169 close `1085328` (SHARED_ENV expose + WA_DAEMON_WIRE_UP_PLAN.md DoD)
- VOS handoff S168 chiuso → S169 chiuso → questo PROMPT-S170 attivo
- Memory: `feedback_pattern_S159_mitigation.md`, `feedback_premature_optimization.md`, `feedback_argos_scope_italia.md` (NUOVO S169)
- E2E send confermato: bridge_outbound id=1 wa_msg_id `true_141115562971357@lid_3EB0B9613EDB1E3D36675B` 2026-05-14T19:26:59
- WebSearch density data: [AutoScout24.it](https://www.autoscout24.it/lst/bmw/serie-3-(tutto)?fc=BERLINA&priceto=30000&kmto=60000&fregfrom=2021) 28 IT vs DE 7-10x

## Pattern recognition S169

1. **Geo-anchor carry-over**: "Foggia" da PROMPT-S168 (esempio test scenario) carry-over come scope assunto in V3-rev2 → V4 proposals. B6 L2 prevenuto su nuove decisioni, mancante su content artifact carry-over. **Estensione**: ogni testo/claim che cita territorio/segmento/numero specifico va re-validated contro scope ufficiale ARGOS (= tutta Italia) prima di propagare a S+1.
2. **Paradigma transactional vs relational**: V3-rev2/V4 = transactional cold lead (msg1 = ask). V5 = relational (msg1 = persona+mirror+question, NO ask). Luke ha esplicitato relational. Documento pattern in framework D-26 nuovo.
3. **iMac branch divergence**: git pull blocked perché iMac local è su `main` 224 commits behind `master`. Risolvere convergence quando founder ha 30 min: rebase main → master OR delete main + checkout master tracking origin/master. Non bloccante per S170 (rsync mirato funziona).
4. **SHARED_ENV gate**: ogni env var letta in wa-daemon.js DEVE essere esposta in ecosystem.config.js SHARED_ENV o ignorata. Documentato in WA_DAEMON_WIRE_UP_PLAN.md DoD.
5. **Pipeline test = technical validation, NOT content validation**: distinguere. S169 ha validato tecnologia. Content validation = S170+ con metric reply rate reale dealer.
