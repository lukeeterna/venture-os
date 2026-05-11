# PROMPT S75 — IDENTITA' LUCA FERRETTI + PRIMO CONTATTO V2

## REGOLA D'ORO
> Il CRM gira, il sequencer e' completo (Day 1→30), 12 dealer pronti.
> ORA serve l'IDENTITA' credibile e poi il PRIMO CONTATTO con i lead d'oro.
> NON contattare nessuno finche' l'identita' non e' verificabile su Google.

## CONTESTO — COSA ABBIAMO (S74)

```
CRM OPERATIVO:
- tools/dealer_crm.py — 12 dealer in SQLite, 3 tabelle (dealers/interactions/vehicles_proposed)
- CLI: init/list/show/update/log/propose/pipeline/match/sync/stats
- Vehicle-dealer matching funzionante (match BMW → 9 dealer)

SEQUENCER COMPLETO:
- wa-daemon.js: Day 1→3→7→10→14→21→30 automatico
- 9 template per archetipo per OGNI step (Day 3/7/10/14/21)
- Day 30: alert Telegram al founder (no auto-send WA)
- Anti-ban: sleep 2-6 min tra invii, max 30/giorno

PIPELINE:
- 3 TIER0 (lead d'oro — gia' importano EU): Stile Car, Car Plus, Sa.My. Auto
- 6 TIER1 (premium puri): BD Auto, Top Cars, AutoQuarta, Loforese, Autovanny, FC Luxury
- 3 TIER2 (da monitorare): ASM Service, Delta Automotive, Dag Auto
- 2 gia' contattati con V1 (errori — da rivalutare)

FILE MASTER: research/S73_MASTER_REFERENCE.md ← LEGGERE SEMPRE
MESSAGGI V2: research/s73_messaging_v2.md ← Template corretti
CREDIBILITA': research/s74_broker_credibility_digital_presence.md
```

## PRIORITA' S75 — IN ORDINE CTO

### BLOCCO 1: IDENTITA' LUCA FERRETTI (P0 — prima di tutto)

**1.1 Landing page argos-automotive.pages.dev**
Riscrivere la landing con:
- Chi e' Luca Ferretti (volto, esperienza, numeri)
- Come funziona (3 step: cerco → verifico → consegno)
- Programma Partner (esclusivita' per zona, selezione)
- Numeri reali (delta EU-IT, margini, modelli)
- ZERO tech stack visibile (no CoVe, no AI, no Claude)
- Riferimento: research/s74_broker_credibility_digital_presence.md
- Benchmark: Bolidem (2 fondatori, 25 anni, 219 reviews, processo trasparente)

**1.2 Google Business Profile — checklist**
- Categoria: "Intermediario veicoli" o "Importatore auto"
- Indirizzo verificabile
- Foto fondatore
- Obiettivo: 5-10 recensioni iniziali (rete personale)
- Output: checklist step-by-step per il founder

**1.3 Backstory coerente**
- 1-2 persone con NOME + VOLTO + ANNI ESPERIENZA
- NON "gruppo internazionale" (nessuno nel settore lo fa cosi')
- ARGOS = protocollo di verifica, non brand consumer
- Documento interno: chi e' Luca Ferretti, cosa ha fatto, perche' ha iniziato

**1.4 Numero telefono**
- Deve rispondere in orario lavorativo
- Non solo WA — anche chiamata (Sud vuole sentire la voce)
- VoIP ehiweb gia' valutato (vedi memory/reference_voip_ehiweb.md)

### BLOCCO 2: PRIMO CONTATTO V2 (dopo Blocco 1)

**2.1 Batch runner per veicoli target**
```bash
# Per Stile Car (BMW/Merc/Audi/Volvo)
python3 tools/batch_runner.py --model "BMW X5" --mode fast
python3 tools/batch_runner.py --model "Mercedes GLE" --mode fast

# Per Car Plus (BMW/Merc/Jaguar/LR)
python3 tools/batch_runner.py --model "Audi Q8" --mode fast

# Per Sa.My. Auto (BMW/Merc/Porsche/Lambo)
python3 tools/batch_runner.py --model "BMW X5 M50d" --mode fast
```

**2.2 Generare dossier PDF per ogni target**
- 1-2 veicoli PROCEED per ogni dealer
- Foto HD con watermark
- ZERO source leak

**2.3 Primo contatto**
- Target #1: Stile Car (Orta Nova FG) — Domenico — NARCISO
- Target #2: Car Plus (Grottaminarda AV) — Luca — RAGIONIERE
- Target #3: Sa.My. Auto (Rende CS) — Antonio — PERFORMANTE
- Messaggio V2 personalizzato (research/s73_messaging_v2.md)
- Veicolo REALE dal batch runner
- Checklist pre-invio: `python3 tools/dealer_scouting_playbook.py checklist`

**2.4 Dopo invio**
- Aggiornare CRM: `python3 tools/dealer_crm.py update <id> pipeline_status CONTACTED`
- Loggare interazione: `python3 tools/dealer_crm.py log <id> WA OUT "messaggio day1 V2"`
- Registrare veicolo: `python3 tools/dealer_crm.py propose <id> "BMW X5..." 38900 47000`
- Il sequencer Day 3→30 parte automatico

### BLOCCO 3: DEPLOY + OPERATIVO

**3.1 Deploy WA daemon aggiornato su iMac**
```bash
# Su iMac
cd ~/wa-intelligence
git pull
pm2 restart wa-daemon
pm2 logs wa-daemon --lines 20
```

**3.2 Dashboard CRM view**
- Le query sono pronte in db.py (get_crm_dealers, get_crm_pipeline_stats, etc.)
- Aggiungere route + template nella dashboard per vista CRM
- Kanban per pipeline_status
- Dettaglio dealer con interazioni + veicoli proposti

## REGOLE OPERATIVE S75

```
1. LEGGERE S73_MASTER_REFERENCE.md prima di qualsiasi azione dealer
2. NON contattare dealer senza identita' Luca Ferretti verificabile
3. NON contattare dealer senza veicolo REALE dal batch runner
4. Usare SOLO messaggi V2 (research/s73_messaging_v2.md)
5. Ogni contatto DEVE essere loggato nel CRM (dealer_crm.py log)
6. Ogni veicolo proposto DEVE essere registrato (dealer_crm.py propose)
7. Deploy wa-daemon su iMac PRIMA di attivare sequencer
```

## FILE DI RIFERIMENTO

```
CRM:        tools/dealer_crm.py                     ← CLI CRM unificato
MASTER:     research/S73_MASTER_REFERENCE.md         ← LEGGERE SEMPRE
Messaggi:   research/s73_messaging_v2.md             ← Template V2 per archetipo
Target:     research/s73_dealer_target_list.md       ← 12 dealer con dettagli
Credibilita': research/s74_broker_credibility_digital_presence.md
Competitor: research/s75_competitive_analysis_argos_vs_market.md
WA daemon:  wa-intelligence/wa-daemon.js             ← Sequencer Day 1→30
Dashboard:  wa-intelligence/dashboard/db.py          ← Query CRM pronte
VoIP:       memory/reference_voip_ehiweb.md
```
