# Report al giudice — Integrazione Configuratore (pubblico) → Preventivatore (backoffice)

- **Data**: 2026-07-17
- **Origine**: chiarimento architetturale del founder (Luke), in sessione.
- **Natura**: decisione di scope/architettura che RIMODELLA la catena VIA 3 (in particolare MT-2D.6). Richiede ratifica del giudice PRIMA di eseguire l'MT relativo.

## Il fatto nuovo dichiarato dal founder
Il preventivatore già consegnato (`8be510e`) è un **backoffice privato del founder**, non un artefatto cliente. La visione è:

> il **configuratore 2D** pubblicato sulla **landing (Cloudflare Pages, zero costi)** raccoglie la scelta kit del cliente e **alimenta il preventivatore** del founder, così il founder genera il preventivo partendo dalla configurazione del cliente invece di ri-digitarla.

## Vincolo di confidenzialità che l'integrazione NON può violare (repo + landing PUBBLICI)
Due contesti con regimi opposti di visibilità:

| | Preventivatore (backoffice) | Configuratore (landing pubblica) |
|---|---|---|
| Visibilità | privato, solo browser founder | PUBBLICO su internet |
| Contiene | costi fornitore, margini €, prezzi | SOLO scelte estetiche + contatti, **MAI prezzi/costi/margini** |
| Dati | localStorage founder + Export/Import JSON | nessun dato economico, nessun backend |

L'integrazione deve trasportare **solo dati non economici** dal pubblico al privato: etichette voce + quantità + zone/colori/pattern/nome-numero/sponsor + dati cliente. **Mai** un prezzo attraversa il confine. I prezzi nascono SOLO dentro il backoffice, dopo.

## Meccanismo di integrazione — raccomandazione (da ratificare)
Zero-cost, zero-backend, coerente con lo stack (vanilla, localStorage, Import JSON già presente nel preventivatore):

1. **MT-2D.6 (configuratore)**: la CTA "Richiedi preventivo gratuito" NON si limita al `mailto` in chiaro. Produce un **payload strutturato client-safe** (JSON compatto) con: dati cliente (società/referente/recapito), righe = { voce-label, quantità, zona/colore/pattern/nome-numero, riferimento sponsor }, **zero prezzi**. Due canali possibili per farlo arrivare al founder:
   - (a) nel corpo del `mailto` (blocco `--- CONFIG ---` incollabile), oppure
   - (b) bottone "Copia codice preventivo" che il cliente incolla / il founder riceve.
2. **Preventivatore (backoffice)**: nuova funzione **"Importa da configuratore"** che legge quel payload e **precompila un nuovo preventivo** (cliente + righe con label+quantità, prezzi VUOTI). Il founder mette i costi/margini e genera. NB: l'attuale `importaJson` del preventivatore **ripristina l'intero stato** (backup/restore) — l'import-da-config è una **capability NUOVA e diversa** (merge di un preventivo, non overwrite dello stato). Va aggiunta.

**Trade-off**: nessun server ⇒ il trasferimento passa da un copia-incolla (email o codice), non è automatico end-to-end. È il prezzo di "zero-cost/zero-backend". Un passaggio automatico richiederebbe un backend (Cloudflare Worker/KV) → esce dal vincolo zero-cost e va deciso a parte.

## Impatto sulla catena VIA 3
- **MT-2D.6** cambia definizione: da "mailto in chiaro" a "payload strutturato client-safe + mailto/codice". Il vincolo NO-PREZZO (grep `prezzo|costo|eur|€` = 0 match) resta e diventa ANCORA più critico (il payload è machine-readable).
- **Nuovo MT o unità di modifica al preventivatore**: "Importa da configuratore" nel backoffice. Non è nel mandato VIA 3 attuale (che consegna solo il configuratore pubblico). Serve una riga di catena aggiuntiva, oppure un'unità separata sul preventivatore. **Decisione del giudice.**
- Il preventivatore `8be510e` NON va toccato finché il giudice non ratifica lo schema del payload (altrimenti si costruisce un import contro un formato non congelato).

## File da guardare (mirror pubblico `github.com/lukeeterna/venture-os`, branch `master`)
1. **Backoffice preventivatore (IL file di cui parla il founder)**
   `ventures/run_20260711_161411/tools/preventivatore/index.html`
   → funzioni rilevanti per l'integrazione: `buildClientOutputData()` (L1252), `importaJson`/`esportaJson` (L~1547), `state` con `contatore` (L770).
2. **Report chiusura preventivatore** (checklist requisiti, isolamento margine)
   `docs/judge/2026-07-17-sportswear-preventivatore-v1.md`
3. **Piano catena configuratore 2D** (dove va ratificato il cambio di MT-2D.6)
   `state/plans/plan_sportswear_configurator_2d_v1.md`
4. **Contesto configuratore (3D esistente, storia + stile shell)**
   `ventures/run_20260711_161411/CONFIGURATOR_PROGRESS.md`

## Decisione richiesta al giudice
1. Ratificare (o correggere) lo **schema del payload client-safe** configuratore→preventivatore.
2. Decidere se "Importa da configuratore" è un **nuovo MT nella catena VIA 3** o un'**unità separata** sul preventivatore.
3. Confermare che il transfer resta **copia-incolla zero-backend** (raccomandato) o se autorizza un backend (esce da zero-cost).

Fino alla ratifica: la catena VIA 3 riprende da **MT-2D.1** (template nudo) come da piano — quell'MT non dipende dall'integrazione. Il preventivatore `8be510e` resta congelato lato integrazione.
