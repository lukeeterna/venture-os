# CLOSE S172/S173/S173b ARGOS — WA daemon dedup fix VERDE

> Chiusura definitiva ciclo S172 (diagnosi) → S173 (implementation+smoke+deploy) → S173b (test fisico + commit + closure).
> Data closure: 2026-05-20
> Esito: VERDE 4/4 T1-T4 PASS + Luke conferma fisica 6/6 messaggi ricevuti.

## Root cause confermato

**Candidato B**: multi-path concurrent send senza single-writer guard. 7 callsite `client.sendMessage` in `wa-daemon.js`, solo `pollBridgeOutbound` (linea 336) protetto da `processing_ts` lock S168-S171.

Path coinvolti nei duplicate sends S170:
1. Day3 scheduler → `client.sendMessage` diretto, no lock
2. Day7 scheduler → `client.sendMessage` + MessageMedia voice, no lock
3. `auto_approve_and_send` → subprocess Popen + sleep + HTTP `/send`/`/send-multi`, no guard cross-path
4. `/send` HTTP HITL → diretto da Telegram/dashboard, no precheck

## Fix scope split applicato

| Path | Decisione | Implementato |
|------|-----------|--------------|
| Day3 scheduler | Refactor → bridge INSERT OR IGNORE + auto-approve | ✅ wa-daemon.js |
| Day7 scheduler | Diretto + precheck 24h + force=true esplicito + audit | ✅ wa-daemon.js |
| auto_approve_and_send mono-msg | Refactor → bridge | ✅ response-analyzer.py |
| auto_approve_and_send multi-msg | Fallback Popen + WARN + Telegram alert (BACKLOG #S172-1) | ✅ response-analyzer.py |
| /send HTTP HITL | Precheck 24h + force=true esplicito | ✅ wa-daemon.js |
| Telegram /approva | Precheck 24h + force=true keyword override | ✅ telegram-handler.py |
| UNIQUE INDEX | `uq_outbound_deal_phone_phase` partial WHERE sent_ts IS NULL | ✅ migration iMac |
| INSERT OR IGNORE | wa_bridge.py | ✅ comm-broker/wa_bridge.py |

## File modificati (commit 1cdb5e1)

```
comm-broker/wa_bridge.py             |  21 +++-
wa-intelligence/response-analyzer.py |  75 ++++++++++++--
wa-intelligence/telegram-handler.py  | 103 ++++++++++++++++++--
wa-intelligence/wa-daemon.js         | 182 ++++++++++++++++++++++++++++-------
4 files changed, 329 insertions(+), 52 deletions(-)
```

## Smoke offline (S173 STEP 1) — 4/4 PASS

Script `/tmp/smoke_bridge_unique.py` su iMac:
- T1: INSERT 1 → OK
- T2: INSERT 2 identico → UNIQUE blocca (IntegrityError atteso)
- T3: poll SELECT pre-approve = 0 rows → OK
- T4: poll SELECT post-approve = 1 row → OK

## Test fisico S173b T1-T4 — 4/4 PASS su 393314928901

Eseguito 2026-05-20, daemon restart S173 12:55 + commit S173b.

| Test | deal_id | sent_status | attempt | wa_msg_id | Note |
|------|---------|-------------|---------|-----------|------|
| T1 | S173-T1-1779276129 | ok | 1 | true_141115562971357@lid_3EB0594C7C9763708F8CF1 | single send, 22s delay |
| T2-A | S173-T2A-1779276199 | ok | 1 | true_141115562971357@lid_3EB0B068E430A68A5E6FCE | day1, gap +0s |
| T2-B | S173-T2B-1779276199 | ok | 1 | true_141115562971357@lid_3EB08AB9FF5728D75676DC | day3, gap +30s anti-ban |
| T2-C | S173-T2C-1779276199 | ok | 1 | true_141115562971357@lid_3EB03CE5209E8ABBF88EF0 | day7, gap +60s anti-ban |
| T3 | S173-T3-1779276280 | (not sent expected) | - | - | INSERT 2 silenziato UNIQUE, row count=1 |
| T4 | S173-T4-1779276287 | ok | 1 | true_141115562971357@lid_3EB098F68480AE7DCBD33C | restart mid-poll, 81s delay, NO doppio invio |

**Conferma fisica Luke**: 6/6 messaggi ricevuti su WA Business 393314928901.

## Migration applied (iMac)

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_outbound_deal_phone_phase
    ON bridge_outbound(deal_id, target_phone, template_phase)
    WHERE sent_ts IS NULL;
```

Backup pre-fix: timestamp 1779272082 (`bridge.sqlite.s172-1779272082.bak` + `dealer_network.sqlite.s172-1779272082.bak`).

## Gates sbloccati

- **REVIEW S171 issue #9 HIGH**: ✅ CLOSED (duplicate sends multi-path → single writer bridge)
- **Day 1 dealer Aprile**: 🟡 GATED su BACKLOG #S172-1 multi-msg + media schema (handoff S174)

## Pattern strutturale registrato

S173 = case study delegation-first VINCOLO #0 funzionante: STEP 2 (implementation effettiva +329/-52) delegato a `implementer` agent in context isolato. Main context speso solo su pre-flight + audit + verifica deliverable. Senza delegation: stima +25-30% main context → sforo immediato 60%.

S172→S173→S173b pattern Karpathy: scope split 3 sessioni per ridurre context burn singola sessione, ognuna VERDE su scope ridotto, niente PARTIAL/ARANCIONE (vincolo #6).

## Riferimenti

- Diagnosi: `wiki/projects/ARGOS/HANDOFF-S173-WA-DEDUP.md`
- Audit Fase 2: `wiki/projects/ARGOS/PROMPT-S172-WA-DAEMON-DEDUP.md`
- Test setup: `iMac:/tmp/s173_test_setup.sh`
- Smoke script: `iMac:/tmp/smoke_bridge_unique.py`
- Migration: `iMac:/tmp/migration_bridge_s172.sql`
- Commit: `1cdb5e1` master `9eb6e28..1cdb5e1`

**Fine closure S172/S173/S173b.**
