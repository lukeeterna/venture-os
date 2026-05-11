# S136 — E2E Demo TEST_FOUNDER + Fix Regressione make/model

**Data:** 2026-04-19+ | **Sessione precedente:** S135 (opusplan confermato)

---

## Contesto

Sprint S132 Task 1+2 DONE (commit 96c3865). Task 3 PENDING per business hours.
Daemon WA iMac: UNREACHABLE alla S135 session start — verificare subito.

**opusplan CONFERMATO:** `/model` mostra "Opus 4.6 in plan mode, else Sonnet 4.6" ✓

---

## Prima di iniziare — leggi questi file
1. `CURRENT_SPRINT.md` — task attivi
2. `BACKLOG.md` — problemi parcheggiati

---

## Task priorità ALTA

### 1. Verifica daemon iMac
```bash
ssh gianlucadistasi@192.168.1.2 "curl -s localhost:9191/status"
```
Se UNREACHABLE → fermarsi. Non procedere senza daemon.

### 2. Task 3 — E2E demo TEST_FOUNDER (PENDING da S132)
**Prerequisiti:**
- Daemon online
- Orario: 09:00-19:00 IT
- Payload pronto (da MEMORY S132):
  - phone: `393314928901`
  - dealer_id: `test_e2e_s132`
  - listing: `autoscout24_it_98e091353d97` (BMW X3 2022 €34.000, conf 0.8425)

**Comando invio:**
```bash
ssh gianlucadistasi@192.168.1.2 "curl -s -X POST localhost:9191/send \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: h_65WFGPMtlgROInLfZtU5TM8hFlVLfYLrn8vSV6kko' \
  -d '{\"phone\":\"393314928901\",\"message\":\"...\",\"dealer_id\":\"test_e2e_s132\"}'"
```
Template Day 1 (4 variabili verificate):
```
Buongiorno, sono Luca Ferretti.
Ho notato che la sua BMW X3 2022 a €34.000 è in listing da [GIORNI] giorni
— è il prezzo più alto tra i BMW X3 2022 che trovo su AutoScout24 in Italia.
Volevo capire se è una scelta precisa sull'auto o se sta valutando di muoverla.
Luca
```
DONE quando: messaggio ricevuto su 393314928901 ✓

### 3. Fix regressione make/model VUOTI (da BACKLOG)
Post-S132, nuovi listing AS24.it inseriti con `seller_name` popolato ma `make`/`model` VUOTI.
- File: `src/cove/scraper_cove_pipeline.py`
- Causa: side-effect del fix seller_name — l'INSERT non include correttamente make/model per AS24.it
- DONE quando:
```sql
SELECT COUNT(*) FROM vehicle_listings
WHERE source='autoscout24_it' AND make IS NOT NULL AND make != '';
-- restituisce listing con make/model corretti inseriti dopo fix
```

---

## Stato TEST_FOUNDER (non disturbare)
- Messaggio Day 1 inviato: 2026-04-16 10:31 (out_1776333946343_fho2m)
- Silenzio atteso fino al **23 Aprile 2026**
- Se risponde prima → query `messages` table (NON `current_step`)

---

## Decisioni aperte per il founder
- [ ] Primo dealer reale dopo E2E demo confermata (chi e quale modello?)
- [ ] Fix regressione make/model: priorità rispetto a nuovi scraper?
