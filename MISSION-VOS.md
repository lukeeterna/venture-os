# MISSION-VOS.md — Perché Venture OS esiste

> Documento costituzionale strategico: il **perché** di VOS (gli "come" stanno in
> `VOS-PRODUCTION-PROTOCOL.md` e `wiki/DECISIONS-VOS.md`).
> Lazy-load: referenziato da `~/.claude/CLAUDE.md` per task VOS strategici. NON auto-load.
> Definizione founder (Luke, Gianluca Di Stasi), 2026-06-04. Validatore: Claude Code.

---

## Tesi di fondo

Il costo di **creare** software tende a zero: Anthropic e l'AI danno capacità chiavi-in-mano
alle PMI, e presto un prompt produrrà l'artefatto. Il vantaggio competitivo non sparisce —
**migra**: verso distribuzione, fiducia, dati proprietari e **assemblaggio intelligente di ciò
che già esiste**. VOS è la macchina che cattura quel vantaggio prima che la commoditizzazione
raggiunga la singola nicchia.

## Cosa è VOS

Una **venture factory zero-cost**. Non reinventa la ruota. Prende ciò che già esiste
(OSS best-in-class, tool, modelli), lo **seleziona con research minuziosa**, lo **assembla
migliorandone le feature**, lo affina e risolve i gap con research + Claude AI + Gemini Deep
Research + altri tool, e **dà vita a strumenti esclusivi e appetibili, enterprise, a costo
zero**, validati da analisi di mercato enterprise e portati al cliente da sales agent competenti.

### Cosa significa "strumento esclusivo"

Un tool assemblato da OSS è, di per sé, replicabile: il codice è commodity. L'esclusività **non
viene dal tool** — viene dallo strato proprietario che gli avvolgi attorno. Uno strumento è
esclusivo se ha **almeno uno** di questi quattro (altrimenti è un assemblaggio che il prossimo
replica in un pomeriggio):

- **(a)** integrazione/tuning non ovvio su una nicchia specifica (la combinazione, non i pezzi);
- **(b)** dato proprietario con flywheel — migliora con l'uso (es. rete dealer + storico prezzi ARGOS);
- **(c)** distribuzione + fiducia + responsabilità — chi lo vende, chi mette la faccia;
- **(d)** conoscenza di dominio codificata — workflow/regole italiane dentro lo strumento.

È anche la risposta alla commoditizzazione: "le PMI si fanno tutto da sé" tocca solo il codice
(a), non (b)(c)(d). **L'esclusività è proprietà di go-to-market e dato, non di software.**

## Le quattro funzioni costitutive

Ordine = flusso di creazione del valore. Le prime due sono **primarie** (lo scopo), le ultime
due **abilitanti** (il mezzo).

1. **Research come fonte di dati reali** — il pilastro e l'input. Tutto parte da dati veri
   (Claude AI, Gemini Deep Research, tool): scoprire, orientare, validare il mercato.
2. **Ideazione + validazione nuovi progetti** — cosa fai con i dati: dare vita a verticali
   esclusivi e appetibili dal mercato, validati con market analyst enterprise.
3. **Orchestrazione CC** (`DECISIONS-VOS.md` D-VOS-01) — il motore che costruisce: delega,
   routing LLM economico, agent factory, autonomia.
4. **Prevenzione + esame problemi + accrescimento** (`VOS-PRODUCTION-PROTOCOL.md`) — "done"
   osservabile, rifiuto di stime fasulle; e il **learning loop**: i problemi che emergono nei
   progetti child (ARGOS/FLUXION) vengono esaminati qui, in questo terminale, e VOS ne ricava
   feature migliori per i progetti a venire.

## Il loop

```
research minuziosa (seleziona l'esistente)
  → assembla + migliora le feature
  → affina / risolve i gap (research + Claude AI + Gemini Deep Research + altri tool)
  → strumento esclusivo + appetibile, 0-cost, enterprise
  → validazione di mercato enterprise
  → distribuzione (sales agent competenti + credibilità costruita)
  → (problemi emersi → esaminati da VOS → feature migliori per il prossimo progetto)
```

## Distribuzione

La distribuzione è curata da **sales agent competenti** (lo strato agentico). La credibilità
**si costruisce** — come si costruisce quella di un personaggio TV — e poi sta a noi essere
**professionali** nell'esecuzione. Il mercato si adegua a chi presidia nicchia, fiducia e
professionalità.

## Ruoli

- **Luke = la mente che decide e che paga.** Scope, direzione, priorità, go/no-go: sue.
- **Claude = validatore + amplificatore.** Un *allungamento* della creatività di Luke, un
  potenziamento — non un limite. Concretezza verso gli obiettivi, mai frenata fine a sé stessa.

Il validatore ha **un solo dovere non negoziabile**: validare contro **dati reali e artefatti
reali**, mai contro narrazione verosimile (gerarchia delle fonti: artefatto > doc > research).
La research orienta e scopre il mercato; la correttezza-in-produzione di uno strumento
assemblato si dimostra solo su artefatto/test reale, non su research. Questo non limita Luke:
**protegge gli strumenti che porta sul mercato.**

## Principi invarianti

- **Zero-cost**: nessun costo oltre l'abbonamento Claude Code (€240/mese) + il tempo di Luke +
  l'impegno concreto di Claude. "0-cost" = costo di build (free-tier/OSS), **non** prezzo al
  cliente (ARGOS commissione, FLUXION €497).
- **Compose, don't invent**: l'esistente selezionato e migliorato batte il costruito da zero,
  su costo e velocità.
- **Research = verità per scoperta e mercato; artefatto = verità per "funziona".**
- **Esclusivo e appetibile**, non "innovativo": l'obiettivo è il vantaggio difendibile
  (proprietà a/b/c/d), non la novità rischiosa.
- **Max 3 venture attive**: la quarta chiede quale chiudere.
- **Time-to-revenue** resta priorità founder: la fabbrica dimostra il proprio valore portando
  venture a cassa.

---

> Questo file colma il riferimento mancante citato da `~/.claude/CLAUDE.md`
> ("leggi `~/venture-os/MISSION-VOS.md` prima di task VOS importanti").
