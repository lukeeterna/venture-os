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

## FATTO 2026-06-06 — market-intelligence engine definito
`components/market-intelligence-engine.md` (v0.1, generalista). Metodo fondato su research esterna (trend-researcher, fonti con URL). Riframe chiave: **Fase 1-2 UCCIDE a basso costo le nicchie sbagliate, non "prova" quelle giuste — la prova è solo il pagamento (Fase 6)**. Gate decidibile A–F (F = pre-payment terminale, owned Fase 6 ma tentato a fine Fase 2). Famiglie tool per tipo-verticale (B2B-globale / servizi-locali / consumer). tool-evaluator NON eseguito generico (= trappola tool-collection): protocollo JIT definito, prima esecuzione quando una venture entra in Fase 1. Agganciato in factory-routing.md.

## PROSSIMO STEP (dove ripartire)
Per autocritica #4 (il valore vero è a Fase 5-6, non 1-2): il prossimo componente da definire è il **distribution engine (Fase 5, il 70%) + Componente 0 (Audience/Channel asset)** — il vero collo di bottiglia dove muoiono le venture. Stesso metodo: generalista, fondato su dati esterni, kill-criteria decidibili, famiglie tool per tipo-verticale, tool-evaluator JIT. NON partire da ARGOS. NON lucidare ancora Fase 1-2.
ARGOS-side (terminale separato `combaretrovamiauto-enterprise`, NON da qui): è a Fase 6, bloccato dal bug WA daemon duplicate-sends. Output tool-evaluator Fase 5 ARGOS-specifico già disponibile nel thread (Google Maps scraping + Apollo + Gmail/n8n + fix daemon, NON sostituire).

## Decisioni founder da onorare
- VOS = generalista. Componenti factory = metodo/criteri, mai scelte verticali.
- Luke = decide scope business; Claude = amplifica+valida su dati reali, NON limita (asse business). Scelte tecniche = Claude decide con dati (vincolo #3, asse tecnico).
- Fonte dati per validare la fabbrica = research esterna generalista, mai dati interni ARGOS.
- Tono: realismo costruttivo, no negativismo, no verbose, no chatbot Q/A — eseguire/delegare.
