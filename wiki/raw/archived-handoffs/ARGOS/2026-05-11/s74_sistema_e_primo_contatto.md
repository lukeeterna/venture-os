# PROMPT S74 — SISTEMA OPERATIVO + IDENTITA' + PRIMO CONTATTO

## REGOLA D'ORO
> Abbiamo target, dati, script, template. Ora costruiamo il SISTEMA che gira da solo
> e l'IDENTITA' che rende credibile il primo contatto.
> NON contattare nessuno finche' sistema + identita' non sono pronti.

## CONTESTO — COSA ABBIAMO (S73)

```
RICERCA COMPLETATA:
- 12 file research (~200KB dati verificati, fonti citate)
- Mercato premium: BMW +17%, Porsche +8%, HNWI +8.4%
- 3 vantaggi ARGOS unici: proattivo + success fee + B2B Sud vuoto
- 33 dealer scoutati, 3 lead d'oro (gia' fanno import EU)
- Programma Partner ARGOS: selezione → onboarding → partner attivo

SCRIPT OPERATIVI:
- dealer_scouting_playbook.py — scoring, messaggi, sequenze, checklist
- dealer_target_profiles.py — 5 target, 6 regioni, vehicle matching

FILE MASTER: research/S73_MASTER_REFERENCE.md ← LEGGERE SEMPRE PRIMA DI AGIRE
```

## PRIORITA' S74 — IN ORDINE CTO

### BLOCCO 1: SISTEMA CRM DEALER (P0 — costruire subito)

**1.1 Schema SQLite dealer unificato**
Aggiornare `dealer_network.sqlite` con:
- Campi: dealer_id, name, city, province, region, phone, wa, email, stock_size,
  brands, premium_pct, years, rating, reviews, archetype, target_type
  (IMPORTER/GROWTH/LUXURY/MONO_BRAND/VOLUME), score_fit, obj_primary,
  source_url, instagram, facebook, website, titolare_name, titolare_age_est,
  import_signal, notes
- Stati pipeline: NEW / CONTACTED / REPLIED / INTERESTED / DEAL / CLOSED / LOST / DORMANT
- Log interazioni: dealer_id, timestamp, channel (WA/TEL/EMAIL/VISIT), direction (OUT/IN),
  content, template_used, vehicle_proposed

**1.2 Sequencer touchpoint nel WA daemon**
- Day 1 → 3 → 7 → 10 → 14 → 21 → 30 automatico per ogni dealer
- Se risponde → STOP sequenza + notifica Telegram al founder
- Template selezionato per archetipo + giorno + target_type
- Max 5-7 WA/giorno (anti-ban)
- Invio schedulato mart/merc 8:30-9:00

**1.3 Vehicle-dealer matching**
- CoVe trova opportunita' → sistema incrocia con dealer per marchio/zona
- Genera messaggio personalizzato con variabili auto-compilate
- Allega foto HD + delta prezzo

### BLOCCO 2: IDENTITA' LUCA FERRETTI (P0 — prima del primo contatto)

**2.1 Backstory coerente**
- Dati: mandatari che funzionano = 1-2 persone con NOME + VOLTO + ANNI ESPERIENZA
- NON "gruppo internazionale" (nessuno nel settore lo fa)
- Modello Bolidem: persona reale, esperienza dichiarata, processo trasparente
- ARGOS = protocollo di verifica, non brand consumer

**2.2 Google Business Profile**
- Categoria: "Intermediario veicoli" o "Importatore auto"
- Indirizzo verificabile (anche virtuale con recensioni reali)
- Foto fondatore
- Obiettivo: 5-10 recensioni iniziali (rete personale/professionale)

**2.3 Landing page argos-automotive.pages.dev**
- Chi e' Luca Ferretti (volto, esperienza, numeri)
- Come funziona (3 step: cerco → verifico → consegno)
- Programma Partner (esclusivita' per zona, selezione)
- Numeri reali (delta EU-IT, margini, modelli)
- ZERO tech stack visibile (no CoVe, no AI, no Claude)

**2.4 Numero telefono**
- Che risponde in orario lavorativo
- Non solo WA — anche chiamata (il Sud vuole sentire la voce)

### BLOCCO 3: PRIMO CONTATTO MIRATO (dopo Blocco 1+2)

**Target #1: Stile Car (Orta Nova FG) — Domenico**
- WA: 333-4254654
- Archetipo: NARCISO-BARONE
- GIA' importa EU → pitch OBJ-3: "ti apro portali che non raggiungi da solo"
- Veicolo: batch runner su BMW X5 o Mercedes GLE da portale NL/BE/SE
- Messaggio: template IMPORT_DEALER_DAY1 personalizzato

**Target #2: Car Plus (Grottaminarda AV) — Luca**
- WA: 328-9617180
- Archetipo: RAGIONIERE-BARONE
- GIA' importa EU → pitch: "zero rischio anticipato, success fee"
- Veicolo: Audi Q8 o BMW X5 (gia' hanno avuto Q8)

**Target #3: Sa.My. Auto (Rende CS) — Antonio Salerni**
- WA: 349-2587423
- Archetipo: PERFORMANTE-NARCISO
- Vissuto in DE → approccio peer-to-peer, informale
- Veicolo: BMW X5 M50d o Mercedes GLE Coupe da DE

**PRIMA di ogni contatto, verificare checklist:**
```
python3 tools/dealer_scouting_playbook.py checklist
```

### BLOCCO PARALLELO: PROGRAMMA PARTNER ARGOS

- Struttura: Selezione → Onboarding → Primo acquisto → Partner attivo
- Esclusivita' per zona (1 dealer per provincia)
- Landing page dedicata al programma
- Kit onboarding: report mercato EU + 1 opportunita' reale
- Naming del programma (da definire con founder)

### BLOCCO PARALLELO: CONTENT MARKETING

- Post Facebook/Instagram con numeri reali (€350 vs €4.500 margine)
- Presenza nel gruppo "Venditori e Concessionari Auto" su Facebook
- Automotive Dealer Day Verona 19-21 maggio 2026 (2 mesi)

## REGOLE OPERATIVE S74

```
1. LEGGERE S73_MASTER_REFERENCE.md prima di qualsiasi azione dealer
2. NON contattare dealer senza identita' Luca Ferretti verificabile su Google
3. NON contattare dealer senza veicolo REALE dal batch runner
4. NON usare messaggi V1 — solo V2 (research/s73_messaging_v2.md)
5. Ogni messaggio deve passare la checklist pre-invio
6. Il sistema deve funzionare SENZA Claude — script + dashboard + WA daemon
```

## FILE DI RIFERIMENTO

```
MASTER:     research/S73_MASTER_REFERENCE.md ← LEGGERE SEMPRE
Target:     research/s73_dealer_target_list.md
Features:   research/s73_system_features_roadmap.md
Messaggi:   research/s73_messaging_v2.md
Persona:    research/s73_dealer_persona.md
Mercato:    research/s77_mercato_premium_italia_2024_2025.md
Competitor: research/s75_competitive_analysis_argos_vs_market.md
Script:     tools/dealer_scouting_playbook.py
Profili:    tools/dealer_target_profiles.py
```
