# S146 — Day 1 Stile Car: invio reale (o continuazione pre-warming)

**Data target**: 2026-04-30 (giorno 4 sequenza credibilità Sud)
**Sessione precedente**: S145 (CTO verification) — vedi `~/.claude/projects/-Users-macbook-Documents-combaretrovamiauto-enterprise/memory/s145_cto_verification.md`
**Stato infra al 27/04 19:38**: tutto verde (WA connected, listing X3 200, DB ok)

---

## STEP 0 — Bootstrap (5 min)

1. Leggi questi file IN ORDINE:
   - `~/.claude/projects/-Users-macbook-Documents-combaretrovamiauto-enterprise/memory/MEMORY.md` (entry S145 + S146 + S145 CTO verification)
   - `HANDOFF.md` (sezione S145 ENTRY POINT)
   - `~/.claude/projects/-Users-macbook-Documents-combaretrovamiauto-enterprise/memory/s145_cto_verification.md`
   - `.planning/launch_luca_ferretti/DAY1_STILE_CAR.md` (messaggio + risposte pronte + SQL)

2. Verifica oggi è ≥ 30 aprile 2026. Se NO → vai a STEP 1A. Se SI → STEP 1B.

---

## STEP 1A — Se siamo PRIMA del giorno 4 (pre-warming in corso)

1. Chiedi a Luke quale giorno di pre-warming è (1, 2, 3).
2. Verifica con Luke che abbia fatto le azioni LinkedIn previste:
   - Day 1: follow Stile Car + Sa.My. Auto + Car Plus + like 1 post
   - Day 2: like 1 post (no commento)
   - Day 3: 1 commento non-pitch su Stile Car (es. "Bella X3, configurazione rara")
3. Se Luke non ha fatto → ricorda regola sequenziale credibilità Sud (rules/communication.md): "SE SALTI UNO STEP, RICOMINCIA DA CAPO".
4. STOP — torna al giorno 4.

---

## STEP 1B — Se siamo AL giorno 4 (invio reale)

### B.1 — Pre-flight check (3 comandi, ~30 sec)

```bash
# 1. WA daemon health
ssh gianlucadistasi@192.168.1.2 "curl -sf http://localhost:9191/status | grep -E 'wa_status|daily_remaining'"
# Atteso: wa_status: connected, daily_remaining >= 1

# 2. Listing X3 ancora attivo
curl -sI 'https://www.autoscout24.de/angebote/bmw-x3-xdrive20i-ahk-hifi-sportsitze-benzin-schwarz-70dcd99b-3d68-45ac-ae20-2113e8f3d719' | head -1
# Atteso: HTTP/2 200

# 3. Stato DB Stile Car
ssh gianlucadistasi@192.168.1.2 "sqlite3 -header -column /Users/gianlucadistasi/Documents/app-antigravity-auto/dealer_network.sqlite \"SELECT dealer_id, current_step, conversation_state, outbound_count FROM conversations WHERE dealer_id='TIER0_FG_001';\""
# Atteso: PENDING / COLD / 0
```

**Se UNO fallisce**:
- Daemon down → `pm2 restart wa-daemon` su iMac, riprova
- Listing 404 → re-scrape: `python3 tools/on_demand_runner.py --marca BMW --modello X3 --budget 35000 --dealer "Stile Car"` → aggiorna DAY1_STILE_CAR.md con nuovo top candidate, chiedi OK Luke
- DB diverso da PENDING/COLD → STOP, indagare con Luke (qualcuno ha già inviato?)

### B.2 — Conferma pre-warming completato (Luke)

Chiedi screenshot LinkedIn:
- Profilo Luca Ferretti popolato (foto + About + post fissato + headline)
- Cronologia: follow Stile Car + 1 like + 1 commento visibile sul post Stile Car

Se Luke conferma a voce ok ma non ha screenshot → fidati e procedi (NON bloccare per perfezione formale).

### B.3 — Test su TEST_FOUNDER 393314928901 (regola CLAUDE.md non negoziabile)

**ATTENZIONE**: TEST_FOUNDER ha 9 outbound CLOSED_NO ENGAGED dal 18/04. NON usare il DAY1 reale (contamina la conversazione storica). Usa messaggio MARKER:

```bash
ssh gianlucadistasi@192.168.1.2 'curl -X POST http://localhost:9191/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $WA_API_KEY" \
  -d "{\"to\":\"393314928901\",\"message\":\"Test marker S146 — pre-flight Day 1. Ignora.\"}"'
```

Atteso: `{"ok":true,"message_id":"..."}`. Verifica che daily_sent passi da 0 → 1.

Se KO → STOP, debug daemon prima di toccare Stile Car.

### B.4 — Invio Day 1 a Stile Car (393334254654)

**TESTO ESATTO** (5 righe + firma, RELAZIONALE, da `.planning/launch_luca_ferretti/DAY1_STILE_CAR.md`):

```
Buongiorno, le scrivo direttamente — seguo BMW compatte e Stile Car è uno dei pochi piazzali sotto Foggia con un parco fatto bene.

X3 xDrive20i 2022, 66.000 km, €34.900 — automatica, AHK, HiFi, sport. La stessa configurazione su AS24 Italia parte da €37.000.

Margine netto per lei ~€3.400, fee €800 solo a consegna.

Volevo proporla a lei prima che ad altri. Le mando la scheda?

Luca
```

Comando:
```bash
ssh gianlucadistasi@192.168.1.2 'curl -X POST http://localhost:9191/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $WA_API_KEY" \
  -d @-' <<EOF
{"to":"393334254654","message":"Buongiorno, le scrivo direttamente — seguo BMW compatte e Stile Car è uno dei pochi piazzali sotto Foggia con un parco fatto bene.\n\nX3 xDrive20i 2022, 66.000 km, €34.900 — automatica, AHK, HiFi, sport. La stessa configurazione su AS24 Italia parte da €37.000.\n\nMargine netto per lei ~€3.400, fee €800 solo a consegna.\n\nVolevo proporla a lei prima che ad altri. Le mando la scheda?\n\nLuca"}
EOF
```

Verifica risposta `{"ok":true,...}`.

### B.5 — Update DB SUBITO dopo conferma WA "sent"

```bash
ssh gianlucadistasi@192.168.1.2 "sqlite3 /Users/gianlucadistasi/Documents/app-antigravity-auto/dealer_network.sqlite \"UPDATE conversations SET current_step='DAY1_SENT', conversation_state='ENGAGED', outbound_count=outbound_count+1, last_contact_at=datetime('now'), state_updated_at=datetime('now'), notes='S146 Day 1 RELAZIONALE — BMW X3 xDrive20i 2022 €34.904 Autohaus Becker-Tiemann' WHERE dealer_id='TIER0_FG_001';\""
```

Verifica:
```bash
ssh gianlucadistasi@192.168.1.2 "sqlite3 -header -column /Users/gianlucadistasi/Documents/app-antigravity-auto/dealer_network.sqlite \"SELECT dealer_id, current_step, conversation_state, outbound_count, last_contact_at FROM conversations WHERE dealer_id='TIER0_FG_001';\""
```

### B.6 — Documenta in MEMORY + HANDOFF

1. Crea `~/.claude/projects/.../memory/s146_day1_invio.md` con: orario invio, message_id WA, testo esatto, stato DB pre/post.
2. Aggiorna `MEMORY.md` con 1 riga indice.
3. Aggiorna `HANDOFF.md` sezione "S146 ENTRY POINT" → "S147 ENTRY POINT" con: stato post-invio, attesa 48h silenzio osservativo, prossimo trigger (risposta inbound o Day 3 follow-up).
4. Commit:
```bash
git add HANDOFF.md prompts/s147_*.md .planning/launch_luca_ferretti/DAY1_STILE_CAR.md
git commit -m "feat(S146): Day 1 inviato a Stile Car — primo dealer cold reale"
git push origin master
```

---

## STEP 2 — Post-invio (48h silenzio osservativo)

- NON inviare follow-up nei 2 giorni successivi
- Se Stile Car risponde → segui albero risposte pronte in `DAY1_STILE_CAR.md` (sezione "Risposte pronte")
- Aggiorna DB ad ogni inbound: `inbound_count`, `last_inbound_at`, eventuale `current_step` change
- Se silenzio a 7gg → Day 3 soft (definire formulazione con Luke)
- Se silenzio a 14gg → break-up message dignitoso

---

## VINCOLI NON DEROGABILI (CLAUDE.md + rules/)

- ✅ Test TEST_FOUNDER PRIMA di Stile Car
- ✅ Pre-warming LinkedIn 3gg PRIMA del Day 1
- ✅ Listing 200 OK pre-invio (pre-flight B.1)
- ✅ Max 5 righe + domanda chiusa
- ✅ NO trigger words ("Germania", "import", "premium", "cerco auto", "estero")
- ✅ Max 1 messaggio Day 1 per numero
- ✅ ZERO COSTI (tutto già in infrastruttura)

## STATO DEALER ATTESO POST-S146

| dealer_id | dealer_name | current_step | conversation_state | outbound | last_contact |
|-----------|-------------|--------------|--------------------|---------|--------------|
| TIER0_FG_001 | Stile Car | DAY1_SENT | ENGAGED | 1 | 2026-04-30 hh:mm |
| TIER1_AV_002 | Autoline | PENDING | COLD | 0 | NULL |
| TIER1_TA_001 | GP Cars | PENDING | COLD | 0 | NULL |
| TIER0_AV_001 | Car Plus | PENDING | COLD | 0 | NULL |
| TIER0_CS_001 | Sa.My. Auto | PENDING | COLD | 0 | NULL |

## SUCCESS CRITERIA S146

- [ ] Pre-flight 3 comandi tutti OK
- [ ] Test TEST_FOUNDER marker `{"ok":true}`
- [ ] WA Stile Car inviato `{"ok":true}` con message_id
- [ ] DB Stile Car aggiornato a DAY1_SENT/ENGAGED/outbound=1
- [ ] MEMORY.md + HANDOFF.md aggiornati
- [ ] Commit pushed su origin/master

## FALLIMENTO ACCETTABILE

Se al giorno 4 il listing X3 è 404 e non c'è top candidate sostitutivo PROCEED entro 1 ora di scrape → **rinvia di 24h**, non forzare un veicolo mediocre. La prima impressione su Stile Car vale più di 24h di ritardo.
