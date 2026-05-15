# AMBRA-AUDIT — Stato implementazione + gap analysis post D-26/D-27/D-28

**Data audit**: 2026-05-15 (S172, completion P0 da S171 handoff)
**Scope**: Verifica fattuale stato AMBRA agent WA autonomo (Phase 06 plan 5/5) + gap-to-decisions founder D-27 (mystery shopper paradigm) e D-28 (target micro-dealer commissione P.IVA forfettaria).
**Verifica fonte**: file:line concreti da codebase ARGOS (`/Users/macbook/Documents/combaretrovamiauto-enterprise`) + SUMMARY plan files.

---

## 1. Stato implementazione plan 5/5 (Phase 06)

Tutti i 5 plan AMBRA risultano con status `complete` (SUMMARY.md generati 2026-03-27).

| Plan | Titolo | File SUMMARY | Stato code |
|------|--------|--------------|-----------|
| 06-01 | Multi-messaggio + typing simulato | `.planning/phases/06-ambra-agent-wa-autonomo/06-01-SUMMARY.md` | ✅ in `wa-daemon.js` |
| 06-02 | SYSTEM_PROMPT JSON modulare + imperfezioni | `06-02-SUMMARY.md` | ✅ in `response-analyzer.py` |
| 06-03 | Debounce 15s inbound | `06-03-SUMMARY.md` | ✅ MessageBuffer in `wa-daemon.js` |
| 06-04 | KB ARGOS strutturata | `06-04-SUMMARY.md` | ✅ `argos_knowledge_base.md` |
| 06-05 | Anti-ban HumanLike | `06-05-SUMMARY.md` | ✅ in `wa-daemon.js` |

---

## 2. Architettura verificata (file:line)

### 2.1 `wa-intelligence/wa-daemon.js` (1755 righe)

- **`/send-multi` endpoint** — line 1174. Accetta payload `{phone, messages:[{text, delayMs}]}` con typing simulato fra messaggi.
- **`/send-voice` endpoint** — line 1283. Audio note via PTT con `simulateRecording`.
- **MessageBuffer (debounce 15s inbound)** — line 627+ class definition; `bufferMessage(jid, msg)` line 774; `flushBuffer(jid)` line 800 → emette singolo evento aggregato post-15s silenzio.
- **HumanLike anti-ban**:
  - `simulateTyping(jid, ms)` — typing presence durante composizione
  - `simulateRecording(jid, ms)` — recording presence per voice
  - `logNormalDelay(meanMs, stdMs)` — distribuzione log-normale tra messaggi (no flat 1s)
  - `checkOnWhatsApp(phone)` — verifica registrazione numero pre-send
  - `clearPresence(jid)` — reset presence post-send
  - `isAllowedToSend()` — quota giornaliera + window check (20/giorno)
- **47 occorrenze pattern HumanLike** distribuite tra send/receive paths.

### 2.2 `wa-intelligence/response-analyzer.py` (2031 righe)

- **PROMPT_MODULES XML modulari** — line 305-353. Tag: `<IDENTITY>`, `<RULES>`, `<OUTPUT_FORMAT>`, `<TONE>`, `<REGISTER>`, `<ARCHETYPE>`. Build per concatenazione XML.
- **`build_system_prompt(archetype, cls_type)`** — line 356. Compose prompt da modules, parametrizzato per archetipo D-08 (NARCISO/BARONE/RAGIONIERE/TECNICO/RELAZIONALE) + classification type (INBOUND/OBJ/SILENT).
- **Knowledge base loader**:
  - `_load_knowledge_base()` line 230-260 — parsing markdown `argos_knowledge_base.md` in sezioni
  - `_get_relevant_kb(cls_type, obj_code)` line 261-289 — retrieval contestuale per tipo obiezione
- **`parse_llm_responses(raw)`** — line 797. JSON multi-fallback: tenta `json.loads` strict → regex extract `{...}` → linea-per-linea reconciliation. Robustness LLM output drift.
- **`auto_approve_and_send`** — line 1353. Route logic: se 1 msg → POST `/send`, se ≥2 → POST `/send-multi` con delayMs computati.
- **`ResponseValidator` (5-check)** — line 375. Validation gate prima di approval:
  1. lunghezza msg ≤ 280 char
  2. no banned word "ARGOS" (in pre-handoff)
  3. no banned phrases ("germania", "import", "premium", "estero", "cerco auto")
  4. no link/URL
  5. no CTA aggressivo / urgency trigger

### 2.3 `wa-intelligence/argos_knowledge_base.md` (293 righe)

7 sezioni:
1. **COME FUNZIONA** — workflow scout EU→IT
2. **COSTI** — success-fee €800-1.200 cash a consegna
3. **TEMPI** — 7-21gg scouting + consegna
4. **DOCUMENTI** — COC + ricevuta + libretto EU
5. **FISCALITA'** — TD17 reverse charge (regime IVA ordinaria)
6. **GARANZIA** — costruttore UE + money-back guarantee DEKRA (D-15)
7. **TRASPORTO** — bisarca DE/BE/NL/AT → IT

Sotto-sezione **OBIEZIONI COMUNI** — 8 obiezioni con risposta:
- "Ho gia il mio fornitore"
- "Troppo caro / fee alta"
- "Non mi fido / chi sei"
- "Mi serve subito"
- "Brand sconosciuto"
- "Voglio vedere foto / VIN"
- "Pago dopo"
- "Esempio caso reale"

### 2.4 `wa-intelligence/state_machine.py`

FSM dealer lifecycle:
- **STATES**: `COLD` → `CONTACTED` → `ENGAGED` → `INTERESTED` → `CONVERTING` → `CLOSED_WON` / `CLOSED_LOST` / `ARCHIVED`
- **Per stato**: `template_id`, `max_outbound`, `requires_inbound: bool`, `transitions: list[state]`
- `requires_inbound=True` per `ENGAGED`/`INTERESTED`/`CONVERTING` — gate strutturale che impedisce push outbound senza segnale dealer.

---

## 3. wa-daemon duplicate sends fix S171 (Open Q #12)

**Stato**: code IN PLACE, verifica live PENDING (founder fisico TEST_FOUNDER required).

### Patch in `wa-daemon.js`

- **`ensureBridgeOutboundSchemaS171(bdb)`** line 270-284 — schema migration additive:
  - `ALTER TABLE bridge_outbound ADD COLUMN processing_ts INTEGER` (claim timestamp)
  - `ALTER TABLE bridge_outbound ADD COLUMN attempt_count INTEGER DEFAULT 0`
- **`isPermanentSendError(errStr)`** line 287-289 — regex classifier:
  ```js
  /No LID for user|invalid wid|invalid number|not.?registered|forbidden|not.?found/i
  ```
  Errori permanenti → mark `sent_status='permanent_error'` NO retry. Errori transient → retry fino `BRIDGE_MAX_ATTEMPTS=3`.
- **`BRIDGE_RECLAIM_WINDOW_S = max(120, poll_interval*4/1000)`** line 292 — finestra reclaim row stuck in `processing_ts < now - window`.
- **`BRIDGE_MAX_ATTEMPTS = 3`** line 293 — cap retry per row.
- **`pollBridgeOutbound`** line 295-372 — atomic claim PRE-send:
  ```sql
  UPDATE bridge_outbound
  SET processing_ts = ?, attempt_count = attempt_count + 1
  WHERE id = ? AND sent_ts IS NULL
    AND (processing_ts IS NULL OR processing_ts < ?)
  ```
  Row processed solo se UPDATE ritorna `changes=1` (claim vinto). Post-send: classifica errore → permanent/transient/capped.

### Schema upstream `comm-broker/wa_bridge.py` (line 64-78)

⚠️ **NO UNIQUE constraint** su `(deal_id, target_phone, body_hash)`. Fix S171 è SOLO poll-side:
- ✅ Previene stessa row processata 2x da poll race
- ❌ NON previene upstream emit di 2 rows duplicate identiche

**Trade-off ragionato S171**: atomic claim copre ~95% root cause (poll race su PM2 daemon restart). UNIQUE constraint upstream = scope creep separato (richiede backfill + dedup script). Documentato come Open Q post-P5 verde.

### Stato verifica live

- ✅ `/status` endpoint OK (curl http://192.168.1.2:9191/status — wa_status: connected, daily 0/20)
- ✅ `/send-multi` validation OK (curl dryrun → 400 invalid phone, payload schema OK)
- ❌ **3/3 single-send verification PENDING** — richiede founder fisico TEST_FOUNDER 3314928901 online per ricevere e validare ESATTAMENTE 3 messaggi (no duplicati).

---

## 4. Gap-to-D-27 (mystery shopper paradigm, S170-post-close)

D-27 PROPOSED: 3-layer architecture **Layer 1 marketing infiltration + Layer 2 mystery shopper WA + Layer 3 AMBRA autonomous handoff**. Codice AMBRA attuale è progettato per scenario V3 transactional (carry-over S166→S169) → INVALIDATED dal pivot D-26→D-27/D-28.

### Conflitti file:line

1. **`<IDENTITY>` module** `response-analyzer.py:305-320`
   Frase corrente: *"Sei tu che hai contattato il dealer PER PRIMO — hai trovato il suo contatto online"*
   Conflitto: Layer 3 AMBRA gestisce handoff DOPO Layer 2 mystery shopper. Dealer ha "sentito parlare" PRIMA dal cliente fittizio. AMBRA NON è il first-contact.
   Fix richiesto: variante `identity_post_handoff` con flag `post_mystery_shopper=True` → IDENTITY adatta ("riprendo io il contatto dopo che il cliente le ha parlato di noi").

2. **`<RULES>` module** `response-analyzer.py:321-340`
   Vincolo corrente: hard-ban parola "ARGOS" in messaggi (carry-over D-05 "no brand first").
   Conflitto: in Layer 3 il dealer ASPETTA contatto da "Argos" perché Layer 2 ha già menzionato il nome. Hard-ban diventa innaturale ("scusi chi è di nuovo?").
   Fix richiesto: vincolo condizionale — ban "ARGOS" solo se `post_mystery_shopper=False` (pre-handoff). Post-handoff: "ARGOS" OK come reaction ("sì sono io di Argos, il cliente le ha parlato di me"), MAI come self-promotion proattiva.

3. **Archetipi D-08 (NARCISO/BARONE/RAGIONIERE/TECNICO/RELAZIONALE)** `response-analyzer.py:341-353`
   Conflitto: D-08 è OPEN-ipotesi non validata + costruita su target wave 1 (dealer stock 30-200) → non target-fit con D-28 micro-dealer commissione stock <20.
   Fix richiesto: P3 deferred. In S172: documentare gap, NO modifica archetipi finché D-08 non rivalidato su micro-dealer reali.

4. **Flow auto_approve `response-analyzer.py:1353`** route /send vs /send-multi
   Conflitto: nessun gating Layer 3 handoff. AMBRA risponde a qualsiasi inbound classificato `INTERESTED` senza check se è arrivato via Layer 2 (mystery shopper) o cold inbound diretto.
   Fix richiesto: aggiungere flag `deal.handoff_source: 'mystery_shopper' | 'cold' | 'referral'` in schema deal → AMBRA carica IDENTITY/RULES coerenti.

5. **`<TONE>` module** `response-analyzer.py` (sezione modules)
   Manca registro "reactive" — AMBRA attuale è sempre proattiva (proposing). Layer 3 = reactive (rispondere a curiosità già seeded).
   Fix richiesto: nuovo modulo `<TONE_REACTIVE>` con esempi frase "ah sì il cliente mi ha detto che le aveva accennato".

6. **State machine `state_machine.py`**
   Stato corrente `COLD` non discrimina cold lead vs post-mystery-shopper warm lead.
   Fix richiesto: nuovo stato `MYSTERY_PRIMED` tra `COLD` e `CONTACTED`, transizione triggered da `handoff_source='mystery_shopper'`.

---

## 5. Gap-to-D-28 (target micro-dealer commissione P.IVA forfettaria)

D-28 DECIDED: target = micro-dealer stock <20, P.IVA forfettaria 5-15%, modello commissione informale (no inventory ownership, broker style), no brand proprio. KB e lessico AMBRA non calibrati.

### Conflitti KB `argos_knowledge_base.md`

1. **Sezione COSTI**
   Linea corrente: *"il dealer riceve dossier veicolo pre-curato, paga success-fee €800-1.200 a consegna"*
   Conflitto: micro-dealer commissione NON riceve dossier per stock proprio, lo richiede SU RICHIESTA cliente finale già seduto in negozio.
   Fix: aggiungere variante COSTI "su richiesta cliente" — fee €800-1.200 trasferita su cliente finale + commissione micro-dealer trattenuta separatamente.

2. **Sezione "margine €4-7k su premium"**
   Conflitto: micro-dealer NON calcola margine così. Calcola commissione % (5-15%) o flat (€500-2.000) su singola vendita brokered.
   Fix: riformulare in lessico commissione — "ARGOS porta auto a €X, tu addebiti €Y al cliente, differenza è tua commissione".

3. **Sezione FISCALITA' (TD17 reverse charge)**
   Conflitto: regime forfettario P.IVA 5-15% NON applica reverse charge TD17 (esente IVA). Sezione attuale assume regime ordinario.
   Fix: aggiungere variante "Regime forfettario": auto importata fatturata direttamente al cliente finale (B2C), micro-dealer percepisce commissione fuori-IVA da ARGOS.

4. **Sezione OBIEZIONI: "Ho gia il mio fornitore"**
   Risposta corrente: argomenta superiorità ARGOS scouting EU vs fornitori italiani.
   Conflitto: micro-dealer commissione tipicamente NON ha "fornitori" — ha clienti che chiedono auto.
   Fix: riformulare obiezione → "Lavoro su richiesta cliente, non tengo stock" → risposta: "esatto, ARGOS è perfetto per te. Cliente chiede X, io trovo X in 7-14gg, tu trattieni commissione".

5. **Lessico mancante**
   Termini D-28 da iniettare in `<TARGET_LEXICON>` nuovo modulo:
   - "commissione" (non "margine")
   - "percentuale sulla vendita"
   - "su ordine"
   - "il cliente cerca"
   - "non tengo stock" / "non ho auto in piazzale"
   - "piazzo l'auto"
   - "broker"

6. **Sezione GARANZIA**
   Linea corrente: "money-back guarantee DEKRA report" (D-15) → assume dealer ha capitale per offrire money-back al cliente.
   Conflitto: micro-dealer commissione NON anticipa capitale. Money-back ricade su ARGOS (D-15 primi 1-3 dealer "1-deal eccellenza").
   Fix: chiarire sezione → "money-back è offerto da ARGOS, non dal dealer" + scope limitato a primi 3 deal (D-15).

---

## 6. Retune plan P3 (proposta concreta)

### 6.1 Modifiche `response-analyzer.py`

- **Line 305-320 `<IDENTITY>`**: branching su `deal.handoff_source`:
  - `cold` → identity attuale (deferred — D-26 V5 cold SUPERSEDED, scope ridotto)
  - `mystery_shopper` → nuova identity reactive post-handoff
  - `referral` → identity "il collega [X] mi ha dato il suo contatto" (deferred D-12 post primo deal chiuso)
- **Line 321-340 `<RULES>`**: ban "ARGOS" condizionale `if handoff_source != 'mystery_shopper'`.
- **Nuovo modulo `<TARGET_LEXICON>`** inseribile dopo `<TONE>` (~line 345): inject lessico commissione D-28.
- **`build_system_prompt(archetype, cls_type, handoff_source='cold')`** line 356: aggiungere param `handoff_source`, default `'cold'` retrocompat.

### 6.2 Modifiche `argos_knowledge_base.md`

- Sezione COSTI: aggiungere sotto-sezione **"Modello commissione"** (variante D-28).
- Sezione FISCALITA': aggiungere sotto-sezione **"Regime forfettario"**.
- Sezione OBIEZIONI: riscrivere "Ho gia fornitore" → "Lavoro su richiesta cliente".

### 6.3 Test scenari handoff Layer 2→3

Nuovo file `tests/test_ambra_layer3.py` con 3 conversation mocks:
1. **Mock 1**: cliente Layer 2 ha menzionato Argos → dealer scrive "ah sì Argos, mi ha detto X". AMBRA deve rispondere reactive con identity post-handoff.
2. **Mock 2**: dealer skeptical "boh non mi convince". AMBRA deve usare obiezione "non mi fido" calibrata + KB micro-dealer.
3. **Mock 3**: dealer interested "quanto costa". AMBRA deve usare COSTI variante commissione (no margine).

### 6.4 Stima effort P3

- Modifiche code: ~45min (response-analyzer.py + state_machine.py + KB rewrite)
- Test mocks: ~30min
- Smoke test classifier: ~15min
- **Totale**: ~90min — eseguibile S172 solo se P0+P1 chiudono < 50% context budget.

---

## 7. Smoke test plan `/send-multi` (gated A1 founder fisico)

**Pre-condizione**: founder online TEST_FOUNDER 3314928901, conferma "pronto a ricevere".

Procedura (NON eseguibile S172 senza founder presente):

```bash
# Step 1: schema check
ssh imac "sqlite3 /Users/gianlucadistasi/argos/bridge.sqlite \
  'PRAGMA table_info(bridge_outbound)'" \
  | grep -E 'processing_ts|attempt_count'
# Expected: 2 righe (colonne S171 presenti)

# Step 2: insert 3 outbound test rows
ssh imac "sqlite3 /Users/gianlucadistasi/argos/bridge.sqlite <<SQL
INSERT INTO bridge_outbound (deal_id, target_phone, body, body_hash, approved_ts) VALUES
  ('S172-DEDUP-001', '393314928901', 'Test S172 msg 1 dedup verification', 'h1', strftime('%s','now')),
  ('S172-DEDUP-002', '393314928901', 'Test S172 msg 2 dedup verification', 'h2', strftime('%s','now')),
  ('S172-DEDUP-003', '393314928901', 'Test S172 msg 3 dedup verification', 'h3', strftime('%s','now'));
SQL"

# Step 3: wait BRIDGE_POLL_INTERVAL_MS x 4 (~2min)
sleep 120

# Step 4: founder verifica WA — deve ricevere ESATTAMENTE 3 messaggi distinti

# Step 5: query post-test
ssh imac "sqlite3 /Users/gianlucadistasi/argos/bridge.sqlite \
  \"SELECT id, deal_id, sent_ts, sent_status, attempt_count
    FROM bridge_outbound
    WHERE deal_id LIKE 'S172-DEDUP-%'\""
# Expected: 3 rows, sent_status='ok', attempt_count=1 ciascuno
```

**Fail cases**:
- 3 messaggi + qualcuno con `attempt_count>1` → atomic claim funziona ma c'è retry transient (OK, classificare)
- 4+ messaggi (duplicate observed) → escalation: debug Baileys retry layer o UNIQUE constraint upstream
- `attempt_count=3` con `sent_status='permanent_error'` → permanent classifier overactive (verificare regex)

---

## 8. Critica strutturale 4 punti (vincolo #4)

### 1. Assunzioni nascoste

- **Assunzione**: `handoff_source` flag in schema deal è semplice da aggiungere. **Realtà**: schema deal è condiviso tra Telegram bot, response-analyzer, comm-broker, dashboard — migration richiede coordinated update + backfill default `'cold'` per deal pre-S172. Effort sottostimato.
- **Assunzione**: KB markdown è "facilmente" estendibile con sezioni varianti. **Realtà**: `_get_relevant_kb()` line 261-289 fa string matching su titoli sezione → varianti aggiunte rompono retrieval se non testate.
- **Assunzione**: ban "ARGOS" condizionale è banale. **Realtà**: `ResponseValidator` line 375 ha check 2 hardcoded. Condizionalizzare richiede passare context `post_handoff` dentro validator → refactor signature.

### 2. Cosa rompe a 30/60/90gg

- **30gg**: nuovo modulo `<TARGET_LEXICON>` introduce 7 termini → se LLM (Groq/Gemini) li sovra-usa diventa marcato/scriptato → drift dal "italiano naturale" D-26 lessons.
- **60gg**: branching identity per `handoff_source` aumenta superficie test da 5 archetipi × 3 cls_type = 15 a × 3 source = 45 combinations → test coverage drops, regressioni difficili.
- **90gg**: D-27 mystery shopper validation P1 potrebbe rivelare che Layer 2 non è scalabile (richiede founder dedicato) → tutto P3 retune diventa investimento parzialmente sprecato.

### 3. Pattern errore noti su sistemi simili

- **Conversational AI with branching identities**: pattern fallimento documentato (Replika 2023, Character.ai 2024) — variant personas con shared backbone scivolano in incoerenza dopo 3-4 turni. Mitigation: state passing esplicito ogni turno (deal_id → handoff_source → load corretto IDENTITY).
- **KB retrieval markdown-based**: pattern noto (LangChain early users 2023) — markdown section retrieval fragile a riordino sezioni / typo. Mitigation: schema YAML strutturato invece di markdown free-form, deferred ma da considerare post P5.
- **Atomic claim su SQLite poll loop**: pattern OK su single-writer, ma se PM2 spawns multi-instance daemon → race ricompare. Verificare ecosystem.config.js `instances: 1` (cluster mode rompe atomic claim).

### 4. Dove sovradimensiono

- **`<TARGET_LEXICON>` modulo separato**: probabilmente over-engineering. 7 termini possono andare in `<TONE>` esistente come sub-section. Aggiungere modulo richiede update XML parser → costo > benefit.
- **`MYSTERY_PRIMED` nuovo stato FSM**: forse risolvibile con flag bool `is_mystery_primed` in deal record senza modificare FSM transitions. Modifica FSM = blast radius alto.
- **Test mocks 3 scenari Layer 3**: pre-mature finché D-27 Layer 2 mystery shopper NON validato su dealer terzi reali. Test su scenari ipotetici rischia di codificare assumption sbagliate.

---

## 9. Riferimenti decisioni founder

- **D-26** SUPERSEDED — V5 cold-lead invalidated (target + paradigm wrong)
- **D-27** PROPOSED — 3-layer mystery shopper, validation pending P1
- **D-28** DECIDED — target micro-dealer commissione P.IVA forfettaria stock <20
- **D-29** DECIDED — numero 3314928901 condiviso ARGOS+FLUXION pre-revenue
- **D-08** OPEN — archetipi NARCISO/BARONE/RAGIONIERE/TECNICO/RELAZIONALE ipotesi non validata su micro-dealer
- **D-15** DECIDED — primi 1-3 dealer "1-deal eccellenza" money-back guarantee ARGOS-funded

---

## 10. Stato AMBRA — verdict

**Code maturity**: 5/5 plan implementati e verificati su file:line concreti.
**Production-readiness pre-D27/D28**: ❌ NOT READY. Identity + Rules + KB carry-over da scenario V3 invalidato.
**Production-readiness post-P3 retune**: condizionato a (a) D-27 validation via P1 research, (b) primo deal reale per validare archetipi D-08, (c) `/send-multi` duplicate-sends verification fisica TEST_FOUNDER (A1).
**Gating per Day 1 reale**: P0 (questo audit) ✅, P1 research, P2 verifica fix duplicate, P3 retune, P4 V6 messaggi, P5 E2E 15-step founder.
