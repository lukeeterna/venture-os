# PROMPT S74 — CREDIBILITA' + DAY 3 CON VEICOLI REALI

## CONTESTO — COSA ABBIAMO (S73)

```
S73 completata: dealer intelligence completa.
Sappiamo COME parlano, COSA cercano, PERCHE' non rispondono.
Messaging V2 pronto per 5 archetipi.
Pipeline tech: 17 portali, CoVe, batch runner, PDF dossier — tutto funziona.

DAY 1 inviato 18/03 a Autovanny (NARCISO) e FC Luxury (BARONE).
Messaggio V1 con 7 errori fatali. Silenzio atteso.
Day 3 scade 25-26 marzo.
```

## PRIORITA' S74 — DUE BLOCCHI

### BLOCCO 1: CREDIBILITA' VERIFICABILE (prima di Day 3)

Il dealer che riceve Day 3 fara' una cosa: cerchera' "Luca Ferretti" o "ARGOS Automotive" su Google.
Se non trova NULLA di credibile, il messaggio viene ignorato indipendentemente dal contenuto.

**Azioni concrete:**
1. **Google Business Profile** — Creare/verificare per "ARGOS Automotive" o "Luca Ferretti Automotive"
   - Serve indirizzo verificabile (anche virtuale), telefono, orari
   - Le prime 1-2 recensioni sono critiche

2. **LinkedIn Luca Ferretti** — Deve esistere e essere curato
   - Headline: non "CEO ARGOS" (non dice nulla) ma "Trovo auto premium in Europa per concessionari italiani"
   - Esperienza automotive visibile
   - 2-3 post recenti sul mercato auto

3. **Landing argos-automotive.pages.dev** — Verificare che sia presentabile
   - NO tech stack visibile (CoVe, Claude, AI)
   - SI: chi siamo, come funziona, veicoli esempio, contatti
   - Il dealer deve trovare una pagina CREDIBILE in 10 secondi

4. **Numero di telefono** — Deve essere raggiungibile e rispondere in orario lavorativo

### BLOCCO 2: DAY 3 CON VEICOLI REALI

**Non si puo' mandare un Day 3 con un veicolo inventato.**

**Azioni concrete:**
1. Lanciare batch runner per Porsche Macan (per Autovanny NARCISO)
2. Lanciare batch runner per BMW X5/Mercedes GLE (per FC Luxury BARONE)
3. Selezionare 1 veicolo TOP per ciascuno (score CoVe > 80, margine > €4.000)
4. Generare dossier PDF singolo per ciascuno
5. Scaricare foto HD + watermark
6. Comporre messaggio Day 3 secondo template V2 (research/s73_messaging_v2.md)

**Timeline:**
- Autovanny Day 3: martedi 25/03 ore 8:30
- FC Luxury Day 3: mercoledi 26/03 ore 9:00

### NOTA CRITICA
Il Day 3 deve essere PERFETTO. E' il secondo touchpoint dopo un Day 1 debole.
Se anche il Day 3 fallisce, il dealer classifica il numero come spam.
Ogni parola conta. Ogni numero deve essere verificato. La foto deve essere HD.

## NON FARE IN S74
- NON inviare Day 3 senza veicolo reale verificato
- NON inviare senza aver verificato la presenza online (Google, LinkedIn, landing)
- NON usare il template V1 — solo V2
- NON contattare dealer nuovi — prima chiudi il ciclo con Autovanny e FC Luxury
