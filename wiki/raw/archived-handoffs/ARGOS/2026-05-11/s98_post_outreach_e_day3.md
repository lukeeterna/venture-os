# S98 — Post-Outreach Verification + Day 3 Preparation

## Contesto

S97 ha fixato la pipeline E2E (scraper→CoVe→PDF). 150 listing reali, 63 PROCEED, PDF generato.
Il cron del 2/4 08:30 dovrebbe aver inviato 9 messaggi a 5 dealer.

## PRIMA DI TUTTO — Verificare invio cron

1. Controllare log outreach:
   ```bash
   cat /tmp/argos_outreach.log
   ```

2. Verificare WA daemon e messaggi inviati:
   ```bash
   curl http://192.168.1.2:9191/status
   ssh gianlucadistasi@192.168.1.2 "sqlite3 ~/Documents/combaretrovamiauto-enterprise/dealer_network.sqlite \"SELECT dealer_name, message_type, direction, status, created_at FROM messages ORDER BY created_at DESC LIMIT 20\""
   ```

3. Rimuovere cron one-shot (se eseguito):
   ```bash
   crontab -l | grep -v send_all_20260402 | crontab -
   ```

## Controllare risposte dealer

```bash
ssh gianlucadistasi@192.168.1.2 "sqlite3 ~/Documents/combaretrovamiauto-enterprise/dealer_network.sqlite \"SELECT * FROM messages WHERE direction='INBOUND' ORDER BY created_at DESC LIMIT 10\""
```

### Se un dealer risponde
Il VEHICLE_REQUEST classifier è attivo in response-analyzer.py. Flow:
1. response-analyzer classifica → Telegram notifica
2. Founder approva → `python3 tools/on_demand_runner.py --marca BMW --budget 35000 --dealer "NomeDealer"`
3. PDF pronto → invia via WA

### Se nessuno risponde
Normale. Prepara Day 3 (4 aprile) per TIER1.

## Preparare Day 3 per TIER1 (4 aprile)

Per ciascun TIER1 che NON ha risposto al Day 1:

### Enzo Car (Ascoli Satriano FG) — NARCISO
- Veicolo REALE personalizzato (BMW/Mercedes premium, fascia 25-40k)
- Foto HD dal listing
- Secondo veicolo diverso dal Day 1
- Messaggio: foto + "Enzo, questo [modello] è appena uscito su [paese]. [dato specifico]. Le interessa che le mando la scheda completa?"

### Autoline (Lioni AV) — RAGIONIERE
- Veicolo con margine esplicito (prezzo EU vs IT)
- Dati numerici precisi (km, anno, prezzo)
- Messaggio: "Pasqualino, [modello] [anno] [km]km — prezzo DE €X, in Italia si vende a €Y. Margine netto €Z. Le mando i dettagli?"

### GP Cars (Manduria TA) — NARCISO
- Veicolo luxury/sportivo (Porsche, Range Rover, BMW M)
- Foto accattivante
- Messaggio: "Gregory, [modello luxury] appena uscito. [colore] [optional], solo [km]km. La concorrenza non ce l'ha ancora. Interessato?"

### Come trovare veicoli REALI per Day 3
```bash
# Per ciascun dealer, lancia pipeline on-demand:
python3 tools/on_demand_runner.py --marca BMW --modello X3 --budget 40000 --dealer "Enzo Car"
python3 tools/on_demand_runner.py --marca Mercedes --modello GLC --budget 45000 --dealer "Autoline"
python3 tools/on_demand_runner.py --marca Porsche --modello Macan --budget 55000 --dealer "GP Cars"
```

## Preparare script send_day3_tier1.py

Creare script analogo a send_day1_tier1.py ma con:
- Foto HD allegata (image_url dal listing)
- Secondo veicolo personalizzato per archetipo
- Scheduling per 4 aprile mattina

## Facebook appeal

Controllare stato:
```
https://www.facebook.com/checkpoint/
```
Se respinto → Piano B: nuovo account con SIM secondaria.

## CRM attuale (12 dealer)
```
TIER0 (3): Stile Car, Car Plus, Sa.My. Auto — Day 7 inviato 2/4
TIER1 (3): Enzo Car, Autoline, GP Cars — Day 1 inviato 2/4, Day 3 il 4/4
ESCLUSO: Dream Car (Cerignola)
TIER2 (2): Auto Carfora (CE), Sull'Auto (CZ) — HOLD
SKIPPED (3): Crimarcar, De Cicco, 2F Motors
```

## Pipeline E2E — ora funzionante
```
on_demand_runner.py --marca BMW --modello X3 --budget 40000 --dealer "Nome"
→ Scrape AS24 DE/NL (dati reali da __NEXT_DATA__)
→ CoVe scoring (63/150 PROCEED nel test)
→ PDF dossier generato
→ ~5.5 minuti per ciclo completo
```
