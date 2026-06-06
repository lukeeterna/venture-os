# Market-Intelligence Engine — componente factory VOS (Fase 1-2)

**Creato**: 2026-06-06 · **Owner**: Luke · **Stato**: v0.1 (metodo fondato su dati esterni, validazione tool JIT pending) · **Tipo**: componente generalista, agnostico al verticale

> Anello 1-2 della catena `factory-routing.md`. Definisce **come trovare nicchie e provare l'esigenza coi dati esterni**, prima di scrivere una riga di prodotto. Generalista: immagazzina **metodo + criteri + famiglie tool per tipo-verticale**, MAI tool specifici (la scelta del tool dipende dal verticale → JIT via `tool-evaluator`).

---

## Riframe strutturale (il cuore, non l'estetica)

**Fase 1-2 NON prova la domanda. L'unica prova è il pagamento (Fase 6).**
Il market-intelligence engine è un **filtro di esclusione a basso costo**: il suo lavoro è *uccidere le nicchie sbagliate prima di spendere build*, non dichiarare "valida" una nicchia. Dato CB Insights (2 coorti, 2014-2021 e post-2023): i criteri pre-build A–D possono passare TUTTI e il prodotto fallire comunque (43% fallimenti = PMF su segmento/intensità sbagliata). Quindi i criteri sotto sono **kill-criteria** (fallisci uno → stop), non proof-criteria. La prova resta esterna e terminale: qualcuno paga.

Corollario operativo (vincolo #1b — terminal fact esterno): l'output dell'engine non è un verdetto "go", è (a) un *demand dossier* con segnali osservabili citati per URL, e (b) la prescrizione di **portare avanti il pre-sale il prima possibile** — il gate vero (F) va tentato a fine Fase 2, *prima* del codice di produzione, non dopo.

---

## Le due fasi sono due segnali diversi (non confonderle)

| Fase | Domanda a cui risponde | Segnale | Costo | Natura |
|---|---|---|---|---|
| **1. Discovery** | "Esiste un segmento strutturalmente sotto-servito?" | **Spesa già esistente su un workaround peggiore** | €0, osservabile, nessuna conversazione | scoperta |
| **2. Prove-need** | "Questo segmento, non un altro, ha budget per QUESTO?" | spesa esistente triangolata + intenzione commerciale | €0 | esclusione |
| (6. Validation) | "Qualcuno paga per la MIA soluzione?" | **carta di credito / LOI / deposito** | €0 | *unica* prova, terminale |

Discovery e proof operano in fasi diverse: senza evidenza di spesa esistente il mercato probabilmente non esiste (kill); con essa, la prova della *tua* soluzione è solo il commitment monetario. Servono entrambi — pre-payment da solo prova che *qualcuno* paga, la spesa-esistente prova che il *segmento* è sotto-servito.

---

## Metodo (procedura ripetibile, agnostica al verticale)

**Step 1 — Discovery: cerca spesa esistente, non interesse.**
Segnali osservabili ordinati per forza predittiva di willingness-to-pay (consenso practitioner, non RCT — vedi caveat):

1. **Budget su un workaround peggiore** — gente che paga una soluzione parziale (consulente-spreadsheet, workflow improvvisato, competitor inferiore). Budget già allocato = zero attrito di price-discovery, la domanda è *cattura* non *creazione*.
2. **Competitor con traction + recensioni scarse** — il revenue conferma che il problema è reale, le recensioni scarse localizzano il gap. Rimuove "interessa a qualcuno?", lascia solo "possiamo prendere quota?".
3. **Segnali di hiring/spesa B2B** — aziende-target che assumono per *eseguire a mano* il problema (ruoli "data entry", "spreadsheet analyst"). Budget committed alla soluzione manuale = leading indicator di willingness-to-automate.
4. **Search a intento commerciale** — volume su "best X software", "X alternative", "X pricing" (NON query informazionali). Prova comportamento d'acquisto attivo.
5. **Community pain harvesting** — frasi non sollecitate "vorrei solo qualcosa che…", "ogni tool che ho provato…". Solo direzionale, nessun segnale di budget: vale *solo* se conferma 1 o 2.

**Step 2 — Prove-need: triangola e applica i kill-criteria.** Esegui la checklist sotto. Fallisci un kill-criterion → stop, prossima nicchia.

**Step 3 — Output: demand dossier** (cosa, dove, quanto, con quali URL) + prescrizione pre-sale (gate F a fine Fase 2). Passa a Fase 3 (scoping) *solo* con A–E verdi e un pre-sale attivo o pianificato.

---

## Gate decidibile (kill-criteria — checklist applicabile da non-esperto)

| Gate | Criterio | Test falsificabile |
|---|---|---|
| **A** | Audience raggiungibile e nominabile | Sai nominare ≥2 luoghi specifici dove congrega (subreddit, conferenza, gruppo LinkedIn, associazione di categoria) E puoi raggiungerne uno entro 48h |
| **B** | Evidenza di spesa esistente | ≥1 competitor con revenue verificabile, OPPURE ≥3 post community su un workaround a pagamento, OPPURE ≥5 job posting che pagano l'esecuzione manuale |
| **C** | Floor di dimensione quantificabile | Fonte esterna (Statista, Mordor, volume job-board, keyword tool) mostra audience indirizzabile, con URL. Floor solo-founder ≈ 1.000 buyer raggiungibili a prezzo target = revenue-goal / prezzo-per-unità |
| **D** | Distribuzione fattibile da solo | Raggiungi i primi 100 buyer senza paid ads: outreach diretto, una singola community, o un aggregatore esistente (marketplace, directory, app store) |
| **E** | Intensità del dolore | Membri dell'audience usano superlativi non sollecitati ("incubo", "mi costa ore a settimana", "ho provato tutto"). Assenza = red flag anche con budget |
| **F** | Pre-payment (gate terminale, owned da Fase 6 ma tentato qui) | ≥1 persona ha committed denaro (carta/LOI/deposito) PRIMA del codice di produzione. Nessun sostituto statico. |

A–D necessari-non-sufficienti; E filtra il falso-positivo "budget senza dolore"; **F è l'unico terminale**. Gate F mancante nella checklist dedotta v0 — senza, A–E passano e il prodotto muore lo stesso (caso PMF CB Insights).

Esclusi esplicitamente come proxy (vincolo #6, gate-proxy = morte modello): survey, like, waitlist senza carta, "lo comprerei" verbale. Misurano intenzione, non willingness-to-pay.

---

## Famiglie tool per tipo-verticale (NON factory-truth — candidati JIT)

> ⚠️ I "tool specifici" dentro ogni famiglia cambiano ogni trimestre; la **classificazione in famiglie è stabile**. Si immagazzina la famiglia, mai il tool congelato. Il tool lo sceglie `tool-evaluator` per-venture, JIT, quando una venture tocca questo slot.

| Tipo verticale | Famiglie data-source appropriate | Perché queste |
|---|---|---|
| **B2B SaaS / globale** | Database job-posting; aggregatori recensioni (categorie G2/Capterra); database arricchimento contatti B2B; keyword data a intento commerciale; pagine pricing competitor | Segnale di budget istituzionale; evidenza pubblica e strutturata; competitor esistono e hanno recensioni |
| **Servizi locali / SMB** | Scraping directory locali (recensioni Maps, categorie Yelp); mining forum/gruppi FB locali; dati permessi e registrazioni d'impresa; liste associazioni di categoria | Segnali di spesa locali e frammentati, nessun DB centralizzato; il confine geografico limita il TAM → dimensiona via proxy (conteggio permessi/registrazioni) |
| **Consumer / prosumer** | Mining recensioni app store; analisi community Reddit/Discord; scraping commenti influencer; dati community a membership; segnali engagement contenuti | Willingness-to-pay individuale e impulsiva; i segnali d'acquisto vivono in recensioni e attrito community, non in budget istituzionali; il search intent è il proxy più forte |

---

## Protocollo di validazione JIT (via `tool-evaluator`)

Decisione tecnica (vincolo #3): **NON si esegue uno sweep generico di tool-evaluator ora.** Non c'è venture a questo slot → uno sweep generico = trappola "tool collection" (autocritica #3 di factory-routing, e #4 sotto). Il protocollo si *definisce* qui; la *prima esecuzione* avviene quando la prossima venture entra in Fase 1.

Quando una venture raggiunge lo slot:
1. Identifica il **tipo-verticale** (B2B-globale / servizi-locali / consumer) → seleziona la riga di famiglie sopra.
2. Invoca `tool-evaluator` su quella famiglia, JIT: scored comparison su capabilities/quota/pricing reali da **doc ufficiali e benchmark live**, MAI training-data Claude (cutoff gen-2025, panorama cambia settimanalmente).
3. Vincolo €0 salvo Claude. Output: una riga "validato il <data>, fonte <URL>" agganciata allo slot.
4. Finché manca quella riga, il tool resta candidato, non scelta.

---

## Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: il ranking dei segnali discovery è *consenso practitioner, non RCT* — nessuno studio misura il lift predittivo reale. Il floor "1.000-10.000 entità" è rule-of-thumb senza metodologia primaria. Trattali come euristiche d'esclusione, non come soglie provate.
2. **Cosa rompe a 30/60/90gg**: i campioni CB Insights sono *VC-backed*, non bootstrap/solo-founder — la validità dei segnali per il solo-founder potrebbe divergere e non è quantificata. Il metodo va ricalibrato sui dati delle nostre venture reali, non assunto trasferibile.
3. **Pattern errore noto**: questo componente è il più facile da costruire e il più seducente da lucidare. Vale 0 finché una venture non lo percorre fino a un pre-sale reale (gate F). Misurare l'engine sul numero di nicchie *uccise* a basso costo, non sulla bellezza del dossier.
4. **Dove sovradimensiona**: il rischio è raffinare Fase 1-2 mentre il collo di bottiglia vero è Fase 5-6 (distribuzione + pagamento). Tetto di disciplina: l'engine produce un dossier *minimo* e spinge il pre-sale avanti; non diventa un report di mercato da 20 pagine. Se il dossier supera ~1 pagina senza un pre-sale attivo, è lucidatura.

---

## Fonti (research esterna 2024-2026, delegata trend-researcher 2026-06-06)

- CB Insights — Top Reasons Startups Fail: https://www.cbinsights.com/research/report/startup-failure-reasons-top/
- Preuve AI — Why Startups Fail: Market Fit (5.000+ scans): https://preuve.ai/blog/why-startups-fail-market-fit
- Origami — Hiring Signals for B2B Prospecting (2026): https://origami.chat/blog/hiring-signals-b2b-prospecting-guide
- Volumetree — Startup Idea Validation: Will Customers Pay? (2026): https://www.volumetree.com/2026/03/16/startup-idea-validation-will-customers-pay/
- Forum VC — How to Validate Your B2B SaaS Idea: https://www.forumvc.com/thought-pieces/how-to-validate-your-b2b-saas-idea-for-vc-investment-a-comprehensive-guide-for-founders
- EIM Services — Pre-Selling Strategies: https://www.eimservices.ca/blog/pre-selling-strategies
