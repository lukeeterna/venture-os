# Prompt ripartenza — VOS fabbrica generalista, routing validato

**Chiuso**: 2026-06-04, context ~50% (vincolo #7). Branch `master`. VOS RIATTIVATO.

## Stato raggiunto questa sessione
- VOS confermato **riattivato** come venture factory (memoria pause aggiornata, Layer 1 superato; monito empirico S182 preservato: lane B sempre delegata/parallela, mai assorbe main thread).
- Framework fabbrica validato con dati esterni (trend-researcher, non più dedotto): **DA 3 A 3+1**. Manca **Componente 0 = Audience/Channel asset** (l'unico asset riusabile cross-venture per solo-founder). Market-intelligence va davanti (discovery nicchia). Sales+distribuzione = il 70%, è il vero collo di bottiglia. Validation gate = "qualcuno ha pagato?", mai proxy. Punto di morte modello = distribuzione senza canale + gate proxy (CB Insights: 42% "no market need").
- Creato `~/venture-os/components/factory-routing.md` = linea di fabbrica come routing tool→task, **generalista**.

## INSIGHT STRUTTURALE CHIAVE (la correzione di Luke)
**La fabbrica è GENERALISTA. Non verticalizzare su ARGOS quando si ragiona sulla factory.**
La scelta del tool è intrinsecamente dipendente dal verticale (verificato: Apollo ottimo per SaaS B2B globale, inutile per dealer italiani → Google Maps scraping). Quindi la fabbrica immagazzina **metodo + criteri + famiglie candidati per tipo-verticale**, MAI tool specifici congelati. Il tool si sceglie per-venture JIT via `tool-evaluator`. (Memoria: feedback_vos_generalista_no_verticalizza.md)

## La logica della fabbrica (cuore, non estetica)
ESIGENZA reale provata da dati esterni → SERVIZIO che la risolve → VALIDAZIONE = qualcuno paga (gate esterno). Reclutare il tool più forte × più economico per ogni anello, €0 salvo Claude. Claude = orchestratore + coding agent, non chatbot Q/A.

## OBIETTIVO TERMINALE VOS (corretto enfatico da Luke 2026-06-06)
Questo terminale **COSTRUISCE LA FABBRICA GENERALISTA IN SÉ** (il meta-asset). ARGOS/FLUXION vanno avanti INDIPENDENTI nei loro terminali — MAI misurare VOS col metro revenue-venture, MAI redirigere a ARGOS ops. Una fabbrica non si avvia a pezzi (Teoria dei Vincoli: stazione mancante = throughput zero): si costruisce la LINEA COMPLETA + la logica che collega le stazioni, poi gira end-to-end.

## FATTO 2026-06-06
1. `components/market-intelligence-engine.md` (v0.1) — stazioni 1-2 (Discovery + Demand validation). Gate kill-criteria A–F. Riframe: Fase 1-2 UCCIDE nicchie sbagliate a costo zero, non "prova" (la prova è il pagamento).
2. `components/factory-line.md` (v0.1) — **LA LINEA COMPLETA**: 6 stazioni mappate su fabbrica auto + **la SCOCCA** (`venture-dossier.md`, WIP unit 7 stati S0→S6 che viaggia e si arricchisce) + **il NASTRO** (orchestrazione vos-auto-router + gate Stage-Gate go/kill/rework) + Componente 0. **Validato empiricamente** (§8b, trend-researcher, fonti §10): trasferibilità solo-founder CONFERMATA (Pieter Levels), bottleneck = **distribuzione come ASSET DUREVOLE che compone** (non task), gate DEVONO essere esterni-binari (stazione con deliverable interno = over-engineering → fondere).

## PROSSIMO STEP (dove ripartire — ordine per priorità-vincolo ToC, NON 1→6)
La stazione-VINCOLO è la **5 Distribution + Componente 0** (canale che preesiste a ogni venture). Sequenza build corretta: (a) template scocca `venture-dossier.md`; (b) **Componente 0 + stazione 5 PER PRIMA** (è il vincolo — costruire 1-4 prima = throughput zero comunque); (c) spec stazioni 3-4-6 con gate ESTERNI-binari (correggere gate interno stazione 3); (d) cablare nastro vos-auto-router sulle 6 stazioni; (e) prima corsa end-to-end di una scocca da S0 a S6 su nicchia NUOVA. Fallback se 6 stazioni troppe: pipeline minima 4 stazioni + 2 gate (§8b). NON lucidare stazioni 1-2.
ARGOS-side (terminale separato `combaretrovamiauto-enterprise`, NON da qui): è a Fase 6, bloccato dal bug WA daemon duplicate-sends. Output tool-evaluator Fase 5 ARGOS-specifico già disponibile nel thread (Google Maps scraping + Apollo + Gmail/n8n + fix daemon, NON sostituire).

## Decisioni founder da onorare
- VOS = generalista. Componenti factory = metodo/criteri, mai scelte verticali.
- Luke = decide scope business; Claude = amplifica+valida su dati reali, NON limita (asse business). Scelte tecniche = Claude decide con dati (vincolo #3, asse tecnico).
- Fonte dati per validare la fabbrica = research esterna generalista, mai dati interni ARGOS.
- Tono: realismo costruttivo, no negativismo, no verbose, no chatbot Q/A — eseguire/delegare.
