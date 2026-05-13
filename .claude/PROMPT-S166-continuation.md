# Prompt next session — S166 continuation (Step 2/3/4 wallclock + Luke action)

> Salvato 2026-05-13 post-S166 step1+5 PASS sintetici.
> Sostituisce uso del template auto-generato `NEXT_SESSION_PROMPT.md` (volatile).
> Copia-incolla l'intero blocco sotto la riga di separazione nella nuova sessione Claude Code.

---

## Pre-condizioni GIÀ COMPLETATE (verificate 2026-05-13 17:27 UTC)

| Step | Status | Evidence |
|------|--------|----------|
| Step 1 SMOKE Day 1 template validator | ✅ PASS | `state/s166-results.json` |
| Step 5 EDGE CASE classifier + validator gates | ✅ PASS (8/8) | `state/s166-results.json` |
| wa-daemon iMac 192.168.1.2:9191 health | ✅ connected, daily_remaining=20, business_hours=true | `curl /status` |
| Frontman backstory landing | ✅ A.1-A.5 patched (commit 250c47f origin) | `landing/index.html` |
| WA_BUSINESS_NUMBER configurato | ✅ 393281536308 | `.env` |

## Pre-req BLOCCANTE S166-continuation (verifica prima di partire)

### B1 — TEST_FOUNDER numero dedicato

`grep TEST_FOUNDER ~/Documents/combaretrovamiauto-enterprise/.env` — se vuoto:
- Luke deve aggiungere riga: `TEST_FOUNDER_PHONE=393NNNNNNNNN` (numero personale Luke dedicato come dealer fittizio)
- **DEVE essere un secondo numero**, non WA_BUSINESS_NUMBER (frontman Luca Ferretti)
- Luke deve scaricare WhatsApp su secondo device/SIM OR usare numero family member con consenso esplicito

Se TEST_FOUNDER non configurato → STOP, sessione handoff S166-continuation-deferred fino setup.

### B2 — wa-daemon iMac connesso

```bash
curl -s -H "x-api-key: $(grep ARGOS_API_KEY ~/Documents/combaretrovamiauto-enterprise/.env | cut -d= -f2)" \
  http://192.168.1.2:9191/status | jq '.wa_status, .daily_remaining'
```
Atteso: `"connected"` + `>0`. Se diverso → diagnosi prima procedere.

### B3 — daily_remaining >= 5

Step 2+3+4 + buffer = ~5 messaggi. Se `daily_remaining < 5` → aspetta reset 24h o aumenta limit (vincolo anti-ban: max 20/giorno).

---

## Sessione S166-continuation — Step 2/3/4 esecuzione wallclock

### Goal: 3 step pipeline test reali con TEST_FOUNDER come dealer fittizio

**Vincolo critico**: Luke deve essere disponibile per:
- Step 2: rispondere "interessato, dimmi di più" entro 2-5 min da send Day 1
- Step 3: rispondere "STOP" entro 2-5 min da send Day 1 secondo invio
- Step 4: NON rispondere per 7 giorni → scheduler trigger Day 7 follow-up

### Workflow

**Step 2 — Response INTEREST (~30 min sessione)**

1. Send Day 1 a TEST_FOUNDER via `/send` daemon:
   ```bash
   curl -s -X POST -H "x-api-key: ${ARGOS_API_KEY}" -H "Content-Type: application/json" \
     http://192.168.1.2:9191/send \
     -d '{"to":"'${TEST_FOUNDER_PHONE}'","body":"<Day1 template stile_car_fg.txt content>"}'
   ```
2. Luke risponde su TEST_FOUNDER WhatsApp: `"sì, dimmi di più"`
3. Daemon riceve → response-analyzer classifica → atteso `type=POSITIVE`, `confidence>0.8`
4. Sistema genera Day 3 follow-up candidate → salva in DB `pending_replies`
5. Verifica CRM entry creato: `sqlite3 wa-intelligence/argos.db "SELECT * FROM pending_replies WHERE dealer_phone=...;"`
6. Acceptance: response classified=POSITIVE + Day 3 candidate generato + HITL approve gate attivo

**Step 3 — Response STOP opt-out (~15 min sessione)**

1. Send secondo messaggio a TEST_FOUNDER (può essere Day 3 dal Step 2 OR Day 1 nuovo per altro)
2. Luke risponde: `"STOP"`
3. Daemon riceve → response-analyzer classifica → atteso `type=NEGATIVE`, `method=short_match`
4. Sistema marca dealer status: `opted_out=true` + schedule soft-delete 90gg
5. Verifica: nessun ulteriore messaggio outbound a TEST_FOUNDER (cron block)
6. Acceptance: dealer.opted_out=true + nessun outbound queued + log compliance event

**Step 4 — No-reply Day 7 trigger (~7gg wallclock, 15 min check)**

1. Send Day 1 fresh a TEST_FOUNDER (deve essere reset opted_out per test OR usare altro numero TEST_FOUNDER_2)
2. Luke NON risponde per 7 giorni
3. Scheduler/cron trigger Day 7 follow-up generation
4. Verifica entry in CRM `scheduled_follow_ups` con due_at = send_ts + 7gg
5. HITL gate: founder review Day 7 candidate PRIMA send
6. Acceptance: Day 7 candidate generato + HITL approve gate enforced + no auto-send

### Vincoli sessione

- **#3**: una raccomandazione per ogni decisione tecnica (no liste A/B/C)
- **#6**: chiude verde Step 2+3 OK / Step 4 in-flight (Day 7 wallclock) → handoff S166-day7-check fra 7gg
- **#7**: context budget — Step 2+3 in singola sessione ~45 min, Step 4 deferred sessione corta +7gg
- **#9**: no "hai ragione" — se test fallisce documenta root cause + fix
- **#11**: pattern recognition — se classifier OR validator fallisce, audit `state/blueprint-deviations.jsonl`

### Done when

- `state/s166-results.json` aggiornato con `step2_actual`, `step3_actual` (almeno questi)
- `state/s166-day7-trigger.jsonl` entry con send_ts + due_at (per check fra 7gg)
- Commit verde + push ARGOS origin
- Se TUTTI 5 step PASS → ROADMAP Phase 5 sub-task 1 closed → trigger Phase 5 sub-task 2 (dealer-intel MVP S167)

### Next post-S166 (ARGOS verso produzione)

1. **S167 ARGOS** — `dealer-intel` componente MVP (Google Maps scrape Wave 1 Salerno/Bari/Foggia/Catania/Cosenza, filter commissione informale stock 3-10, output `dealer-targets.jsonl` ≥50 leads qualificati)
2. **S168 ARGOS** — skill `/outreach-day1` upgrade + variant macro-area + anchor anti-Bolidem + primo dealer reale TIER 0 (Stile Car FG / Car Plus AV / Sa.My. CS) HITL 100%
3. **S169 ARGOS** — primi 1-3 dealer "1-deal eccellenza" (D-15) + dossier full-spec D-16+D-18 + money-back DEKRA + follow-up 30gg → trigger Wave 1 passaparola

---

## Output S166 step1+5 (questa sessione)

- File creato: `tests/s166_pipeline_test.py` (auto-eseguibile)
- Risultati: `state/s166-results.json` (commit ARGOS + sync VOS)
- Pre-flight wa-daemon: OK
- Founder closure 2026-05-13 (D-OPEN-Q1..Q5 DECIDED + D-13..D-20) rispettata in template + validator gates
