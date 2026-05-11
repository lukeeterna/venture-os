# S88 — Fix Prompt + Day 3 Follow-up + TIER1

## Contesto
S87 completata. 3 dealer TIER0 contattati, tutti hanno letto, nessuno ha risposto.
Agente testato dal founder — soddisfatto ma con fix da fare.
KB arricchita 13 sezioni, fee validator fixato, business hours estese.

## Priorita' S88

### 1. Fix System Prompt (CRITICI)
- **Mix tu/lei**: il system prompt deve forzare "lei" al primo contatto, "tu" solo dopo che il dealer usa "tu"
- **DEKRA/DAT**: rimuovere dal SYSTEM_PROMPT (regola E6). Sostituire con "km certificati, storico controllato"
- **Cap per-dealer**: max 3 risposte automatiche al giorno per dealer (evitare spam)
- **INBOUND non salvati**: i messaggi dei dealer non vengono salvati nella tabella messages — solo outbound

### 2. Day 3 Follow-up (30/03)
I 3 TIER0 non hanno risposto. Serve follow-up:
- Stile Car / Domenico (NARCISO): veicolo esclusivo con config rara
- Car Plus / Luca (RAGIONIERE): numeri completi su un veicolo specifico
- Sa.My. Auto / Antonio (TECNICO): scheda tecnica dettagliata con allestimento

Veicoli candidati dallo scrape S87:
- Audi Q5 35 TDI Advanced — €25.730, 29.922 km, margine ~€5.700-7.700
- BMW X3 xDrive20d M Sport 2023 — €31.500, 45.863 km, margine ~€2.900-4.900

### 3. Scheduler Day 3 automatico
Il daemon e' REATTIVO. Serve un cron/scheduler che:
- Controlla next_action_at nel CRM
- Se oggi >= next_action_at E next_action_type = 'DAY3_FOLLOW_UP'
- Manda il messaggio calibrato per archetipo
- Il daemon ha gia' scheduled_actions table — usarla

### 4. TIER1 Outreach
Dopo aver validato Day 3 TIER0, procedere con TIER1 (stesso approccio: presentarsi + esigenze).

### 5. edge-tts PATH fix
PM2 non trova edge-tts. Opzioni:
- Aggiungere PATH nel pm2 ecosystem.config.js
- Oppure usare path assoluto nel daemon: `/Users/gianlucadistasi/Library/Python/3.9/bin/edge-tts`

### 6. Baileys migration (backlog)
Post primo ciclo Day 1-7. Eliminare Puppeteer, usare WebSocket diretto.

## Infra
```
iMac: ssh gianlucadistasi@192.168.1.2
PM2 start: source ~/.zshrc && pm2 restart argos-wa-daemon
Dashboard: Python 3.9 -m uvicorn dashboard.app:app --host 0.0.0.0 --port 8080 --app-dir wa-intelligence
QR Auth: http://192.168.1.2:9191/qr
Business hours: 8-20 lun-sab (time-context.js)
DB daemon: /Users/gianlucadistasi/Documents/app-antigravity-auto/dealer_network.sqlite
```
