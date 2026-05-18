# PROMPT S172 ARGOS — WA daemon duplicate sends: root cause + fix strutturale

> Generato VOS S182 (2026-05-18) dopo audit codice + REVIEW S171 v2.1 + memory rule S170.
> Bloccante revenue documentato: 4/18 dealer pool nazionale già burned per WA spam multipli.
> Pre-requisito P5 E2E (issue #9 HIGH REVIEW S171).

---

## STATO INPUT (verificato lato VOS audit 2026-05-18)

**Codice attuale**:
- `wa-intelligence/wa-daemon.js` 85.7 KB, last commit `a97dd07` S177c (TEST_FOUNDER bypass BUG-3, NON daemon dedup)
- `comm-broker/wa_bridge.py` 15 KB, last commit S168 wire-up
- Lock `processing_ts` già implementato S168-S171 (linee 272-329 wa-daemon.js):
  ```javascript
  // Line 295: pollBridgeOutbound
  SELECT FROM bridge_outbound WHERE approved_ts IS NOT NULL AND sent_ts IS NULL
  // Line 321: TENTATIVE CLAIM atomic
  UPDATE bridge_outbound SET processing_ts = ? WHERE id = ? AND sent_ts IS NULL
  // Line 339: success → SET sent_ts, sent_status='ok', wa_msg_id
  ```
- **3 callsite alternativi `sendMessage`** che bypassano `pollBridgeOutbound`:
  - Line 1118-1119: `const sentMsg = await client.sendMessage(chatId, message)` (path inbound reply?)
  - Line 1242: `await client.sendMessage(chatId, msg)` (loop inter-message?)
  - Line 1322: `await client.sendMessage(chatId, media, { sendAudioAsVoice: true })` (audio TTS?)

**Memory bug (S170 confermato 2026-05-14)**:
- Wave 1 = 5 outbound queued (id 2-6 bridge.sqlite)
- 4/5 bridge_outbound `sent_status='ok'` + wa_msg_id valido (= single-send technically a livello DB)
- **MA dealer riceveva multipli messaggi identici**
- Founder ha eliminato messaggi prima della reply window → Wave 1 metric V5 reply rate **INVALIDATO**
- Dealer percezione = spam, NON = paradigma relational

**Implicazione root cause**:
Lock `processing_ts` impedisce **doppio claim DB** ma il bug persiste a livello recezione dealer. Quindi NON è race poll loop. Candidati residui:
- (A) **Baileys send retry interno**: glitch network → retry senza idempotency check + lo stesso wa_msg_id appare nel return ma in realtà 2+ pacchetti WA inviati
- (B) **Multi-path sendMessage**: callsite linee 1118/1242/1322 invocati con stesso payload da altro entry point (es. dashboard HTTP, watch-mode), bypassando `pollBridgeOutbound`
- (C) **Schema missing UNIQUE constraint** su `(deal_id, target_phone, body_hash)` permette inserimento duplicato in `bridge_outbound` da sorgenti diverse (es. dashboard approve + worker auto-approve)

**REVIEW S171 issue #9 (HIGH)**:
> P3 fix daemon duplicate è prerequisito implicito P5 E2E (15 step richiedono single-send deterministico). Nessun gate esplicito P3→P5.

Quindi P3 era tracked in S171 ma chiusura S178 ha fatto altro (BUG-4 Pages Function /contract). P3 daemon dedup PENDING.

---

## PRE-ACTION CHECK (vincolo #13)

Prima di scrivere fix, verificare:

- **D-XX founder applicabile**:
  - D-07 HITL strict: no auto-send senza `approved_ts`. Fix non deve aprire shortcut auto-send.
  - D-21 workflow: msg1 → msg2 → msg3 single-send deterministico. Fix deve garantire **exactly-once delivery** per (deal_id, message_step).
  - D-22 F1 bridge SQLite: `bridge_outbound` è canonical queue. Source-of-truth.
  - D-26 cold-lead V5 framework: reply rate metric solo valido se single-send confermato.
  - WA primary (DECIDED): non rinegoziare canale.

- **Vincolo founder rispettati**:
  - NO numero FLUXION brandato `3314928901` per test (REVIEW S171 issue #10). Usare numero personale founder `3281536308` se controllato bidirezionale, OPPURE numero terzo non-brandato.
  - NO contattare 4/18 dealer già burned wave 1 S170 (Dream Car FG, GP Cars TA, Autoline AV, WP Cars SA) — re-contatto = ulteriore spam.
  - ARGOS scope ITALIA (memory rule), non hardcoded territorio (Foggia/etc).
  - Target micro-dealer commissione P.IVA forfettaria, ESCLUDERE stock ≥20 (memory rule).

- **Fonte dati**:
  - Memory rule `feedback_wa_daemon_duplicate_sends.md` (3 gg fa, verifica current state)
  - REVIEW S171 v2.1 (NOT READY, 4 BLOCKER + 6 HIGH non chiusi)
  - Codice wa-daemon.js linee 295-365 (lock S168-S171) + 1118/1242/1322 (callsite alt)
  - REVIEW S171 issue #9 HIGH (P3 prerequisito P5)

---

## STEP 0 — PRE-FLIGHT diagnostico (obbligatorio, 10 min)

Scopo: **reproduce bug + identifica root cause prima di scrivere fix** (vincolo #1, vincolo #10).

0.1 **Verifica daemon online iMac**:
```bash
ssh imac "pm2 status | grep argos-wa-daemon"
# Expect: status=online, restart count basso
```

0.2 **Query evidence S170 burned dataset** (distingue race vs Baileys retry vs multi-path):
```bash
ssh imac "sqlite3 /path/to/bridge.sqlite '
  SELECT id, deal_id, target_phone, sent_ts, sent_status, wa_msg_id, processing_ts, attempt_count
  FROM bridge_outbound
  WHERE deal_id LIKE \"S170%\"
  ORDER BY approved_ts ASC;
'"
# Patterns interpretation:
# - Tutti single sent_ts + single wa_msg_id → bug a livello Baileys retry (candidate A)
# - attempt_count >1 per ogni row → fix attempts ricicla send (candidate A o B)
# - Multiple rows stesso (deal_id, target_phone) senza UNIQUE constraint → candidate C
```

0.3 **Identificare BRIDGE_DB_PATH effettivo iMac**:
```bash
ssh imac "ps aux | grep wa-daemon | grep -v grep" 
# Cerca env var BRIDGE_DB_PATH nel cmdline o leggi ecosystem.config.js PM2
ssh imac "cat ~/argos-wa-daemon/ecosystem.config.js | grep BRIDGE_DB_PATH"
```

0.4 **Schema bridge_outbound**:
```bash
ssh imac "sqlite3 <bridge_db_path> '.schema bridge_outbound'"
# Verifica presenza UNIQUE constraint su (deal_id, target_phone, body_hash) o equivalente
# Se assente → candidate C confermato come parte del problema
```

0.5 **Log daemon ultimi 200 righe filtrate per sendMessage**:
```bash
ssh imac "pm2 logs argos-wa-daemon --lines 200 --nostream | grep -E '(sendMessage|wa_msg_id|retry|ECONN|ETIMEDOUT)'"
# Cerca pattern: multiple "sendMessage returned wa_msg_id=..." per stesso chatId in <2s
# Se sì → candidate A (Baileys retry interno) o B (multi-callsite concorrenti)
```

0.6 **Audit callsite sendMessage**:
```bash
cd ~/Documents/combaretrovamiauto-enterprise
grep -n "client\.sendMessage\|clientRef\.sendMessage" wa-intelligence/wa-daemon.js
# Verifica per ogni callsite:
#   - protetto da lock processing_ts? (solo pollBridgeOutbound lo è)
#   - protetto da idempotency key separato? (es. cache wa_msg_id già inviato)
#   - chiamabile da HTTP endpoint daemon? (rischio race con poll)
```

0.7 **Output diagnostico**:
Tabella in markdown:
| Candidato | Evidence pro | Evidence contro | Severity |
|-----------|--------------|-----------------|----------|
| A — Baileys retry | log retry pattern, single sent_ts, single wa_msg_id | network logs no errors | HIGH se confermato |
| B — Multi-callsite | callsite linee 1118/1242/1322 invocati con stesso payload | nessuna evidence log dual-call | MED |
| C — Missing UNIQUE | schema senza constraint, duplicate rows | bridge_outbound INSERT controllato da broker | LOW se broker singolo |

**Decision tree**:
- Se almeno 1 evidence pro per candidato → **identificato root cause**, procedi STEP 1 fix mirato
- Se zero evidence per tutti i 3 → **nuovo candidato non previsto**, sessione handoff giallo con ricerca aggiuntiva

---

## STEP 1 — ROOT CAUSE INVESTIGATION (codice + Baileys docs)

Solo se STEP 0 ha narrowed root cause. Altrimenti handoff.

### Se candidato A confermato (Baileys retry)

1.1 Leggere Baileys repo docs sezione "Send Reliability / Retry":
- https://github.com/WhiskeySockets/Baileys (verificare README/wiki)
- Cercare se `sendMessage` ha retry interno + come disabilitarlo / gestire idempotency

1.2 Audit `wa-daemon.js` sezione import + config Baileys:
```bash
grep -n "Baileys\|makeWASocket\|retryRequestDelayMs\|maxMsgRetryCount" wa-intelligence/wa-daemon.js
```

1.3 Pattern fix (high-level, validare con docs upstream prima di codare):
- Set `maxMsgRetryCount: 1` se config existe
- Wrap `sendMessage` in idempotency cache: `Set<wa_msg_id_attempted>` + skip se già inviato
- Logging: ogni `sendMessage` call + response wa_msg_id

### Se candidato B confermato (multi-callsite)

1.4 Per ogni callsite alternativo (1118, 1242, 1322), determinare:
- Da quale entry point HTTP/event è invocato?
- Payload sovrapposto con `pollBridgeOutbound`?
- Race possibile (es. webhook trigger + poll simultanei)?

1.5 Pattern fix:
- Centralizzare **tutti** i `sendMessage` in singolo helper `sendMessageIdempotent(chatId, body, idempotency_key)` con cache TTL 60s
- Tutti callsite passano `idempotency_key` derivato da (deal_id, message_step) o (chatId, hash(body))
- Helper esegue dedup pre-send + log dedup hits

### Se candidato C confermato (missing UNIQUE)

1.6 Migration SQL bridge.sqlite:
```sql
-- Audit duplicate esistenti prima
SELECT deal_id, target_phone, body, COUNT(*)
FROM bridge_outbound GROUP BY 1,2,3 HAVING COUNT(*) > 1;

-- Cleanup duplicate (preservare row con sent_ts NOT NULL più vecchio)
DELETE FROM bridge_outbound WHERE id NOT IN (
  SELECT MIN(id) FROM bridge_outbound GROUP BY deal_id, target_phone, body
);

-- Aggiungere UNIQUE constraint
CREATE UNIQUE INDEX idx_bridge_outbound_dedup
ON bridge_outbound(deal_id, target_phone, body);
```

1.7 Aggiornare comm-broker insert path per `ON CONFLICT DO NOTHING`.

---

## STEP 2 — FIX strutturale (autocritica vincolo #4 PRIMA di scrivere)

### Critica strutturale obbligatoria del fix proposto

Per ogni candidato (A/B/C) e relativo fix, autocritica in 4 punti **PRIMA di edit codice**:

1. **Assunzioni nascoste**:
   - Fix A: assume Baileys `sendMessage` ritorna sempre wa_msg_id reale, anche su retry. Verifica con docs.
   - Fix B: assume idempotency_key derivabile da payload. Verifica che (deal_id, message_step) sia univoco per ogni outbound atteso.
   - Fix C: assume body identico = duplicato. Falso se body include timestamp/random nonce. Verifica.

2. **Cosa rompe a 30/60/90gg**:
   - Fix A: maxMsgRetryCount=1 può causare false negative (network glitch reale = msg perso, NON ritentato). Mitigation: alert post-send con failed delivery report.
   - Fix B: cache TTL 60s in-memory. Daemon restart = cache lost = race window al boot. Mitigation: persistere idempotency cache in SQLite.
   - Fix C: UNIQUE constraint blocca insert legittimi (es. re-send dopo failed delivery deliberato). Mitigation: includere `attempt_count` nella UNIQUE chiave.

3. **Pattern errore noti su sistemi simili**:
   - "Idempotency at wrong layer" — risolvere a livello DB lock ma bug è in network layer = fix non efficace
   - "Dedup TTL troppo corto" — Baileys retry può scattare dopo 60s+
   - "Cache invalidation on restart" — daemon PM2 restart frequente in dev = race ricorrente

4. **Dove sovradimensioni**:
   - Fix B helper centralizzato: refactor invasivo, rompe testing path esistenti. Valutare se basta wrap minimal su pollBridgeOutbound.
   - Fix C migration: tocca DB live in production. Verificare backup pre-migration + dry-run.

### Implementazione (solo dopo critica strutturale chiara)

Pattern S257 (FLUXION encryption):
- Commit atomico singolo, reversibile via `git revert`
- Test E2E verifica reale (queue 1 outbound → 1 messaggio ricevuto)
- Sentry warn su retry rate >threshold
- Backup DB prima di migration se candidato C

---

## STEP 3 — TEST FIX (live verify, founder fisico)

3.1 **Pre-test setup** (founder):
- Numero test = `3281536308` (personale founder, se controllato bidirezionale) OR numero terzo non-FLUXION
- **MAI** `3314928901` (FLUXION brand Erica, vincolo founder S171 issue #10)
- Verificare che il numero test NON sia mai stato contattato da `wa-daemon` precedentemente (clean state)

3.2 **Test 1 — single outbound**:
- Queue 1 row in `bridge_outbound`: approved_ts=now, sent_ts=NULL, target_phone=<test_number>, body="Test S172 fix dedup [timestamp]"
- Attendere prossimo poll cycle (BRIDGE_POLL_INTERVAL_MS, ~30s)
- Verifica WhatsApp app dealer test riceve **esattamente 1 messaggio**:
  - Screenshot WA chat
  - Count = 1
- Query DB post-send:
  ```sql
  SELECT sent_ts, sent_status, wa_msg_id, attempt_count
  FROM bridge_outbound WHERE id = <test_id>;
  ```
  - sent_ts NOT NULL, sent_status='ok', wa_msg_id reale, attempt_count=1

3.3 **Test 2 — concurrent simulated**:
- Queue 3 row in `bridge_outbound` con `approved_ts` simultaneo
- Verifica tutte e 3 inviate **esattamente 1 volta ciascuna**, no overlap
- Query verifica: 3 sent_ts distinti, 3 wa_msg_id distinti

3.4 **Test 3 — daemon restart mid-send** (resilience):
- Queue 1 outbound, restart daemon `pm2 restart argos-wa-daemon` 5s dopo poll start
- Verifica messaggio inviato 1 volta E NON ri-inviato dopo restart
- Edge case importante: idempotency cache deve sopravvivere restart (se candidato B fix)

3.5 **Test 4 — anti-ban check**:
- Daemon log post-test: zero retry, zero ECONNRESET, zero ban warning
- WhatsApp account `Luca Ferretti` NON flagged

---

## STEP 4 — OUTCOME (verde/handoff, NO arancione vincolo #6)

### VERDE (chiusura sessione + push S172 done)

Tutti i criteri:
- STEP 3 Test 1 + Test 2 + Test 3 + Test 4 PASS (4/4)
- Codice committed singolo commit reversibile
- Migration DB (se candidato C) eseguita con backup pre-migration
- REVIEW S171 issue #9 chiusa (P3 fix daemon duplicate done)
- Founder ha screenshot dealer = 1 messaggio per outbound

Commit message format:
```
fix(S172): WA daemon duplicate sends — root cause <A|B|C> + fix strutturale

Root cause identificato: <descrizione>
Fix: <descrizione tecnica concisa>
Test E2E: 4/4 PASS (single, concurrent x3, restart resilience, anti-ban)
Sblocca: P5 E2E (REVIEW S171 issue #9 HIGH), wave outreach reale S172+

Co-Authored-By: Claude Opus 4 <noreply@anthropic.com>
```

Update DECISIONS.md ARGOS con nuova D-XX se fix introduce nuovo pattern dedup (es. "Idempotency key (deal_id, message_step) is canonical").

### VERDE-CON-ASTERISCO

Test 1-3 PASS, Test 4 anti-ban edge case (es. 1 ECONNRESET non-critico recuperato). Documentare in HANDOFF + procedere a wave outreach con monitoring intensificato.

### HANDOFF STRUTTURATO (giallo/rosso, no fix forzato sopra 50% context)

Trigger:
- STEP 0 diagnostico NON identifica root cause (tutti e 3 candidati zero-evidence)
- STEP 2 critica strutturale rivela rotture 30/60gg non mitigabili in-session
- STEP 3 test FAIL su almeno 1 dei 4 test
- Context VOS sessione >50% (vincolo #7)

Scrivere `wiki/projects/ARGOS/HANDOFF-S172-WA-DAEMON-DEDUP.md` con:
- Stato preciso: STEP completati, fail point
- Root cause identificati vs ipotesi residue
- Code diff parziale se esiste
- Prompt resume specifico per S173
- NO commit codice rotto, NO push

---

## VINCOLI HARD (non negoziabili)

- **D-07 HITL strict**: fix NON deve aprire shortcut auto-send.
- **Numero test**: mai `3314928901` FLUXION. Solo personale founder o terzo neutro.
- **Burned dealer pool wave 1 S170**: 4/18 NON ri-contattabili (Dream Car FG, GP Cars TA, Autoline AV, WP Cars SA). Test E2E NON usa loro numeri.
- **Scope Italia**: nessun hardcode territorio. Test usa numero italiano +39.
- **Target micro-dealer commissione**: post-fix wave outreach segue D-26 V5 framework, NON dealer stock ≥20.
- **Zero-cost (vincolo #5)**: no servizi paid (Twilio, Vonage, etc.). Solo Baileys + bridge SQLite esistenti.
- **Big Sur compat**: macOS 11 MacBook + iMac. No API macOS 12+.
- **Pre-flight env check**: nessuna libreria blacklist (paddlepaddle, etc.). Stack Node.js + Python esistente.
- **Workspace split (memory rule S170)**: lavorare cwd `~/Documents/combaretrovamiauto-enterprise/`. VOS terminal separato per meta-decisioni.
- **No --no-verify**: rispettare hook pre-commit ARGOS.
- **Backup DB pre-migration** (se candidato C): copia `bridge.sqlite` su iMac timestamped prima di ALTER/UNIQUE constraint.

---

## OUTPUT ATTESO sessione S172

1. **Tabella diagnostica STEP 0** (markdown, candidati A/B/C con evidence)
2. **Decisione root cause** (1 dei 3 candidati o handoff)
3. **Fix proposto + autocritica strutturale** (4 punti vincolo #4)
4. **Diff codice + migration SQL** (se applicabile)
5. **Risultati STEP 3 test** (4 test, screenshot WA dealer)
6. **Outcome verde/verde* /handoff** con commit + update REVIEW S171 issue #9 chiusa
7. **Critica strutturale finale** del workflow eseguito (cosa rompe a 30/60/90gg)
8. **Path next wave outreach S172+** post-fix (segue D-26, esclude 4/18 burned)

---

## RIFERIMENTI

- Codice: `wa-intelligence/wa-daemon.js` (linee 195-370 lock S168-S171, callsite alt 1118/1242/1322)
- Codice: `comm-broker/wa_bridge.py`
- Memory rule: `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_wa_daemon_duplicate_sends.md`
- REVIEW S171 v2.1: `wiki/projects/ARGOS/REVIEW-S171-ARGOS-v2.1.md` (NOT READY, issue #9 HIGH P3 prerequisito P5)
- COMPILED-STATE: `wiki/projects/ARGOS/COMPILED-STATE.md` (S147 area, daemon connesso S156, S149 patch real wa_msg_id)
- DECISIONS.md: D-07 HITL strict, D-21 workflow, D-22 F1 bridge, D-26 V5 cold-lead
- Baileys docs: https://github.com/WhiskeySockets/Baileys (verificare per fix candidato A)
- Last commit ARGOS: `9eb6e28` S178 closure VERDE 3/3 (Pages Function fix, NOT daemon dedup)
