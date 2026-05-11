# PROMPT S73 — DEALER INTELLIGENCE: Capire il dealer PRIMA di parlare

## REGOLA D'ORO
> La tech e' pronta. 17 portali, CoVe, PDF, batch runner. Tutto funziona.
> Ma stiamo per mandare un dossier enterprise a un concessionario di Eboli
> SENZA SAPERE come parla, cosa cerca, perche' non risponde.
> E' come avere un fucile di precisione e sparare bendati.

## CONTESTO — COSA ABBIAMO (S72)
```
Pipeline COMPLETA e TESTATA:
- 17 portali fast (incluso mobile.de, WAF Akamai abbattuto)
- CoVe scoring bayesiano + fraud detection
- Batch runner CLI per N modelli
- Combined dossier PDF per dealer
- BMW X3 test: 15 opp, top score 93, margine +EUR 11.404
```

La macchina e' pronta. Manca il PILOTA che sa dove puntare.

## PRIORITA' S73 — DEALER INTELLIGENCE (LA SESSIONE INTERA)

### 1. RICERCA: COME PARLANO I DEALER (45 min)

**Obiettivo**: Capire il linguaggio REALE dei concessionari family-business Sud Italia.

**Fonti da analizzare** (deep research):
- Forum dealer italiani (DealerLink, gruppi Facebook concessionari)
- Gruppi WhatsApp di settore (come comunicano tra loro)
- Recensioni Trustpilot/Google di concessionari target (come parlano ai clienti)
- LinkedIn di titolari concessionarie Salerno/Napoli/Campania
- Articoli trade: DealerToday, InterAutoNews Italia, Quattroruote B2B
- Interviste/podcast con concessionari italiani

**Domande chiave**:
- Che TONO usano tra colleghi? (formale, dialettale, tecnico, misto?)
- Quali PAROLE usano per descrivere un buon affare?
- Come chiamano l'import EU? (reimportazione? importazione parallela? acquisto estero?)
- Quali NUMERI li fanno reagire? (margine % o EUR? ROI? volume?)
- Come parlano dei PROBLEMI dell'import? (burocrazia, tempi, garanzia, km reali)

### 2. RICERCA: COSA CERCANO I DEALER (30 min)

**Obiettivo**: Identificare i bisogni REALI (non quelli che pensiamo noi).

**Ipotesi da validare**:
- Cercano margine? (probabile, ma QUANTO margine li muove? EUR 2K? 5K? 10K?)
- Cercano volume? (quante auto/mese importano? 1? 5? 20?)
- Cercano esclusivita'? (vogliono deal che altri non hanno?)
- Cercano sicurezza? (paura fregature, km scalati, danni nascosti?)
- Cercano comodita'? (non vogliono gestire pratiche, trasporto, dogana?)

**Dati concreti da trovare**:
- Margine medio concessionario italiano su auto usata (%)
- Margine medio su auto importata EU vs acquistata IT
- Volume medio import per dealer family-business
- Costi reali che il dealer affronta oggi senza ARGOS
- Chi sono i concorrenti REALI (altri intermediari, non piattaforme)

### 3. RICERCA: PERCHE' NON RISPONDONO (30 min)

**Obiettivo**: Capire le obiezioni IMPLICITE (quelle che non dicono).

**Pattern comuni da cercare**:
- "Gia' ho il mio fornitore" → come superare la fedelta' al canale esistente?
- "Non ho tempo" → il messaggio e' troppo lungo/complesso?
- "Non mi fido" → manca proof/referral/track record?
- "Non capisco il valore" → il primo messaggio e' troppo astratto?
- Silenzio totale → non hanno nemmeno aperto il messaggio?

**Ricerca specifica**:
- Tasso di apertura WA business vs personale nel B2B automotive IT
- Migliore orario/giorno per contattare dealer (mattina presto? dopo pranzo?)
- Primo messaggio: testo? voce? foto? PDF diretto?
- Quanto tempo passa prima che un dealer risponda (media settore)

### 4. SINTESI: DEALER PERSONA PER AUTOVANNY (30 min)

**Output**: Un documento strutturato per ogni archetipo dealer:

```
ARCHETIPO: "Il Titolare Family-Business" (30-80 auto, Sud Italia)
NOME ESEMPIO: Giovanni Vannicola, Autovanny Group, Eboli
ETA': 45-60 | ESPERIENZA: 20+ anni | TECH: basso (WA si, email poco, LinkedIn no)

COME PARLA: [linguaggio, tono, riferimenti]
COSA CERCA: [bisogni ordinati per priorita']
COSA TEME: [paure, obiezioni, brutte esperienze passate]
COME DECIDE: [chi influenza, quanto tempo, che prove vuole]
CANALE PREFERITO: [WA? telefono? visita? referral?]
TRIGGER DI RISPOSTA: [cosa lo fa rispondere a un messaggio freddo]
MOTIVI DI SILENZIO: [perche' ignora]
```

### 5. APPLICAZIONE: RISCRIVERE IL PRIMO MESSAGGIO (30 min)

Alla luce di tutto, riscrivere:
- **Messaggio WA Day 1**: primo contatto freddo (max 6 righe)
- **Messaggio WA Day 3**: follow-up con dossier (cosa scrivere + come allegare)
- **Messaggio WA Day 7**: recovery se silenzio
- **Messaggio vocale**: se opportuno, 30 secondi max

Per OGNUNO: spiegare PERCHE' ogni parola e' scelta cosi'.

## METODO DI RICERCA

Usare in parallelo:
1. **WebSearch** per fonti pubbliche (forum, articoli, interviste)
2. **WebFetch** per contenuti specifici trovati
3. **Analisi dei dati che abbiamo** (8 dealer Salerno, i 2 Day1 inviati)
4. **Ragionamento**: cosa sappiamo del mondo dealer da CLAUDE.md e conversazioni precedenti

## OUTPUT ATTESO

1. `research/s73_dealer_intelligence.md` — Ricerca completa
2. `research/s73_dealer_persona.md` — Persona strutturata per archetipo
3. `research/s73_messaging_v2.md` — Messaggi WA riscritti con motivazioni
4. Aggiornamento prompt dealer personality engine se necessario

## NON FARE IN S73
- NON inviare NULLA ai dealer prima di aver completato la ricerca
- NON costruire nuove feature tech (la macchina e' pronta)
- NON scrivere messaggi "da libro" — devono suonare come un collega del settore
- NON ignorare il contesto Sud Italia (e' diverso da Milano/Roma)
