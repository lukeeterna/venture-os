# S95 — Primo Contatto Nuovi Target + Day 7 TIER0

## Contesto

S94 ha completato il pivot strategico:
- 8 deep research → S94_MASTER_REFERENCE.md (sostituisce S73)
- Dealer discovery engine funzionante (Subito.it + curl_cffi)
- 46 dealer trovati in 3 province, 6 profilati, 2 CONTATTARE
- Messaggi Day 1/3/7 pronti per i 2 nuovi target
- Insight critico: i dealer puri "su commissione" sono troppo invisibili per lo scraping.
  Il target realistico e' il dealer MEDIO-PICCOLO (15-60 auto) che fa ANCHE commissione.
  Il modello ibrido (proattivo + on-demand) funziona per entrambi.

## File critici S94
```
research/S94_MASTER_REFERENCE.md                     ← NUOVO riferimento strategico
research/s94_top6_dealer_profiles.md                  ← Profili 6 dealer
research/s94_messaggi_day1_day3_day7_nuovi_target.md  ← Messaggi pronti
research/s94_ACTION_PLAN_NUOVI_TARGET.md              ← Piano operativo
tools/dealer_discovery/                               ← Discovery engine
  discovery_engine.py                                 ← Orchestratore
  subito_dealer_scraper.py                            ← Scraper Subito.it
  commission_classifier.py                            ← Classificatore commissione
  config.py                                           ← Province target + scoring
```

## Priorita' S95

### 1. INVIARE Day 1 ai nuovi target (CRITICO)
- Enzo Car (Ascoli Satriano FG) — tel 339 8835656
  Day 1: Mercedes GLC 220d 2022 da DE, margine €6.000
  PRIMA: verificare su AS24.de che esista una GLC simile al prezzo indicato
- Dream Car (Cerignola FG) — tel 349 453 0357
  Day 1: Audi A6 Avant 40 TDI 2022 da DE, margine €6.600
  PRIMA: verificare su AS24.de che esista una A6 simile

### 2. Day 7 ai TIER0 con bridge on-demand (scade 3 aprile!)
Messaggi da inviare ai 3 TIER0 attuali con bridge:
"Se ha un cliente che cerca una tedesca specifica, mi mandi marca/modello/budget.
In 24 ore le mando 3 opzioni verificate con margine."
+ allegare 1 PDF dossier gia' pronto

### 3. Fix bug outreach_scheduler
Il scheduler NON controlla se il dealer ha risposto prima di mandare il next step.
Se il dealer dice "si" e poi riceve Day 7 automatico, perde fiducia.
Fix: prima di inviare, check ultimo messaggio ricevuto dal dealer.

### 4. Ampliare discovery a province priorita' 2
```
python3 tools/dealer_discovery/discovery_engine.py --all-priority 2 --pages 3 --output /tmp/discovery_p2.json
```
Province: avellino, lecce, taranto, salerno, catanzaro

### 5. Costruire request_parser.py
Per il flusso on-demand: il dealer scrive "mi serve una X3 2022 sotto 38k"
→ il sistema parsea marca/modello/anno/budget
→ triggera scraper con filtri specifici
→ produce shortlist 3 opzioni

### 6. Google Business Profile
Il dealer che riceve WA da sconosciuto cerca su Google. Se non trova nulla = spam.
Serve Google Business con:
- Indirizzo verificabile
- 5+ recensioni (anche da conoscenti/collaboratori)
- Foto professionali
- Descrizione del servizio

## Infra (invariata)
```
iMac: ssh gianlucadistasi@192.168.1.2
PM2: wa-daemon (:9191), dashboard (:8080)
Cron: scrape 5am, pipeline 4h, outreach 8-20 lun-sab
```

## Test di successo S95
```
- Day 1 inviato a Enzo Car e Dream Car con veicolo REALE verificato
- Day 7 inviato ai 3 TIER0 con bridge on-demand + PDF
- Bug outreach_scheduler fixato (check risposta)
- Discovery ampliato a 5+ province
- Almeno 1 risposta da qualsiasi dealer (anche negativa)
```
