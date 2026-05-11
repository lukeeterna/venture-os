# S97 — Fix Pipeline E2E + Verifica Risposte Dealer

## Contesto

S96 ha inviato (cron 2/4 08:30) 9 messaggi a 5 dealer:
- Day 7: Stile Car, Car Plus, Sa.My. Auto (testo + PDF dossier BMW X3)
- Day 1: Enzo Car (CHI-PERCHE'-CHIEDI)
- Day 1: Autoline (Lioni AV), GP Cars (Manduria TA)

Pipeline on-demand funziona (219 listing) ma 3 bug bloccano il flusso completo.

## PRIMA DI TUTTO

1. Verificare se il cron del 2/4 08:30 ha funzionato:
   ```bash
   cat /tmp/argos_outreach.log
   ```
2. Controllare risposte dealer:
   ```bash
   curl http://192.168.1.2:9191/status
   ssh gianlucadistasi@192.168.1.2 "sqlite3 ~/Documents/combaretrovamiauto-enterprise/dealer_network.sqlite 'SELECT * FROM messages WHERE direction=\"INBOUND\" ORDER BY created_at DESC LIMIT 10'"
   ```
3. Rimuovere il cron one-shot:
   ```bash
   crontab -l | grep -v send_all_20260402 | crontab -
   ```

## Bug da fixare (priorità)

### BUG 1 — AS24 parser non estrae prezzo/km/anno
```
Sintomo: price_eur=0.0, km=0, year=0 per tutti i 219 listing
File: tools/scrapers/autoscout_scraper.py -> parse_search_results()
Causa probabile: AutoScout24 ha cambiato struttura HTML/JSON, il parser non matcha
Fix: leggere HTML raw di una pagina AS24, trovare dove sono prezzo/km/anno, aggiornare regex/selectors
```

### BUG 2 — CoVe dynamic import fallisce
```
Sintomo: 'NoneType' object has no attribute '__dict__'
File: tools/on_demand_runner.py -> score_vehicles()
Causa: importlib.util.spec_from_file_location ritorna None (path o modulo non compatibile)
Fix: verificare interfaccia reale di cove_engine_v4.py, adattare il wrapper
```

### BUG 3 — PDF generator CLI incompatibile
```
Sintomo: "error: the following arguments are required: --listing, --dealer"
File: tools/scripts/pdf_generator_enterprise.py
Causa: il runner passa --output --data ma il generatore aspetta --listing --dealer --output
Fix: adattare la chiamata nel runner OPPURE aggiungere un CLI adapter
```

## Dopo i fix — Test E2E completo

```bash
# Test pipeline completa: dealer chiede BMW X3 → PDF dossier pronto
python3 tools/on_demand_runner.py --marca BMW --modello X3 --budget 35000 --dealer "Test Dealer"
# Deve stampare il path di un PDF valido con prezzo/km reali
```

## Se un dealer risponde

Il VEHICLE_REQUEST classifier è attivo. Se un dealer risponde "cerco una BMW X3 budget 35k":
1. response-analyzer.py classifica come VEHICLE_REQUEST
2. Estrae marca/modello/budget via Haiku
3. Notifica Telegram con comando pipeline
4. Founder approva → LLM genera risposta "ricevuto, ci lavoro"
5. Founder lancia `python3 tools/on_demand_runner.py --marca BMW --budget 35000`
6. PDF generato → inviato via WA

## Preparare Day 3 per TIER1

Se Enzo Car o Autoline o GP Cars NON rispondono entro Day 3 (4 aprile):
- Verificare veicoli REALI su AS24.de per ciascuno
- Preparare foto HD + secondo veicolo personalizzato per archetipo
- L'outreach_scheduler su iMac notificherà automaticamente su Telegram

## Facebook appeal

Controllare stato appeal:
```
https://www.facebook.com/checkpoint/
```
Se respinto → Piano B: nuovo account SIM secondaria (vedi research/s96_gap4_scheduler_research.md)

## CRM attuale (12 dealer)
```
TIER0 (3): Stile Car, Car Plus, Sa.My. Auto — DAY7_FOLLOWUP → domani Day 7
TIER1 (3): Enzo Car, Autoline, GP Cars — NEW → domani Day 1
ESCLUSO: Dream Car (Cerignola)
TIER2 (2): Auto Carfora (CE), Sull'Auto (CZ) — HOLD
SKIPPED (3): Crimarcar, De Cicco, 2F Motors
```
