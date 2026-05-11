# S104 — Deploy v2 + Arricchimento Dealer + Go Live

## Contesto

S103 ha prodotto:
- Response Agent v2 completo (prompt modulare, validator, CoVe→LLM, sliding window)
- 112 dealer discovery P1 (7 province Sud, 19 fit>=5.5)
- Stress test 10/10 PASS (classificazione + validator)
- Response-analyzer v2 pronto ma NON deployato su iMac

## 3 Blocchi di Lavoro

### BLOCCO 1: Deploy + Test LLM su iMac (1h)

1. rsync atomico response-analyzer.py su iMac
2. Healthcheck post-deploy (daemon running, analyzer importabile)
3. Stress test completo su iMac (con Groq API key):
   `python3 tools/stress_test_autonomous.py` (senza --with-templates)
4. Verificare 10/10 PASS con risposte LLM reali
5. Se fallisce: debug su iMac, non rollback v2

### BLOCCO 2: Arricchimento Top 20 Dealer (2h)

1. Per ogni dealer in top 20 di research/s103_discovery_report.md:
   - Cercare su Google Maps: telefono, sito, recensioni, rating
   - Verificare WA disponibile (prefisso mobile = 3xx)
   - Classificare archetipo (NARCISO/RAGIONIERE/TECNICO/etc.)
   - Compilare scheda: nome, citta, tel, WA, score, archetipo, brand mix
2. Output: research/s104_dealer_enriched_top20.md
3. Almeno 10 con WA disponibile

### BLOCCO 3: Go Live — Invio Day 1 a Top 5 (2h)

1. Selezionare top 5 dealer (WA disponibile, fit>=7, brand premium)
2. Per ognuno: on_demand_runner → CoVe → listing reale
3. Comporre messaggio Day 1 personalizzato per archetipo
4. Gate validazione pre-invio (listing_id, recommendation, fraud)
5. Invio via daemon (python3 tools/send_day1_top5_discovery.py)
6. Monitorare risposte su Telegram

## File chiave

```
Response-analyzer v2: wa-intelligence/response-analyzer.py
Stress test:          tools/stress_test_autonomous.py
Discovery JSON:       research/s103_discovery_p1.json
Discovery report:     research/s103_discovery_report.md
Config province:      tools/dealer_discovery/config.py
Deploy script:        deploy/sync.sh
On-demand runner:     tools/on_demand_runner.py
Send script:          tools/send_day1_top5_discovery.py
```

## Regole

- Deploy PRIMA di go live — agent v2 deve essere in produzione
- Test LLM su iMac obbligatorio — le template non bastano
- Ogni messaggio Day 1 DEVE avere listing reale (gate validazione)
- Monitorare Telegram per risposte nelle prime 2h
