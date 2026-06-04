# Factory Routing — tool→task della linea di fabbrica VOS

**Creato**: 2026-06-04 · **Owner**: Luke · **Stato**: v0.1 (collaudo su ARGOS pending)

## Logica di base (non estetica, causale)

Una venture è valida se e solo se questa catena chiude:

> **ESIGENZA reale** (provata da dati esterni) → **SERVIZIO** che la risolve → **VALIDAZIONE = qualcuno paga** (gate esterno, mai proxy)

Corollario (dato CB Insights 2024 / Wilbur Labs 2026): il 42% dei fallimenti è "no market need", il sotto-pattern è validation gate che accetta *proxy* (survey, like, waitlist senza carta). Unico gate che vale: pagamento reale. La sequenza reale dei practitioner è **canale → idea dalla domanda → MVP minimo → charge day one**, non build→distribute.

## Principio di reclutamento tool

Ogni task va al tool **più forte e più economico** per quello scopo. Tutto 0-cost tranne Claude Code (€240/mese, già speso). Claude = **orchestratore + coding agent**: decide il workflow, scrive codice, delega. NON fa il lavoro che un tool gratuito fa meglio (dati massivi → Gemini Deep, non Opus che ragiona da chatbot).

## Routing tool→task

> ⚠️ **La fabbrica NON congela tool specifici. La scelta del tool dipende dal verticale.** Verificato empiricamente 2026-06-04: Apollo è default per SaaS B2B globale ma inutile per micro-dealer italiani (scarsa coverage PMI locali → vince Google Maps scraping). Quindi i "tool" sotto sono SOLO famiglie d'esempio, non factory-truth. Il tool specifico lo sceglie `tool-evaluator` per-venture, JIT, quando una venture tocca lo slot.

| # | Fase (anello catena) | Task | Famiglia candidati per *tipo* verticale (NON factory-truth) | Costo | Criterio di scelta |
|---|---|---|---|---|---|
| 1 | Discovery nicchia | trovare segnali di domanda, nicchie scoperte | Gemini Deep Research; Perplexity (free tier) | €0 | volume dati, browser |
| 2 | Prova esigenza | quantificare l'esigenza con dati esterni triangolati | agent `trend-researcher`; Gemini Deep | €0 | fonti multiple, claim con URL |
| 3 | Scoping servizio | esigenza → feature minima (cosa, non come) | Claude Code (Opus, orchestratore) | incluso | ragionamento/decisione |
| 4 | Build | costruire il servizio/MVP | Claude Code agents: `backend-architect`, `frontend-developer`, `rapid-prototyper` | incluso | coding reale, no chatbot |
| 5 | Distribuzione (il 70%) | canale proprio + outreach | n8n self-host (OSS); Apollo.io free tier [verifica quota] | €0 | il vero collo di bottiglia |
| 6 | **Validation gate** | **"qualcuno ha pagato?"** | Stripe payment link / Lemon Squeezy | €0 | UNICO gate vero, mai proxy |
| — | Long-context / sintesi / classificazione | offload da Opus | skill `vos-llm-router` → Gemini Flash (free) / DeepSeek ($0.32/M) | ~€0 | risparmio 47-84x vs Opus |

## Come si valida il routing (non si deduce)

Il routing tool→task è esso stesso una venture: va validato coi dati esterni, non asserito a tavolino.

- **Chi valida**: agent `tool-evaluator` (scored comparison, mai raccomanda senza dati). Supporto: `vos-scout` (alternative OSS), WebSearch/WebFetch + Gemini Deep per raccolta live.
- **Quando**: just-in-time, **uno slot alla volta** quando una venture raggiunge quella fase. MAI tutti e 6 in anticipo (= trappola tool-collection, autocritica #3).
- **Dove preleviamo i dati**: doc ufficiali tool (capabilities/quote/pricing reali), benchmark practitioner, comparison live. **MAI training-data Claude (cutoff gen-2025)** — panorama tool cambia settimanalmente.
- **Criterio di scelta**: tool più forte × più economico per lo scopo. Vincolo €0 salvo Claude.
- **Output**: ogni slot validato porta una riga "validato il <data> da tool-evaluator, fonte <URL>". Finché manca = candidato.

## Componente 0 — Audience/Channel asset (mancante nel framework dedotto)

Per il solo-founder l'unico asset davvero riusabile tra venture è il **canale di distribuzione personale** (community, newsletter, rete outreach). Senza, ogni venture riparte da zero sulla Fase 5. Da costruire una volta, riusare ovunque. Fonte: venture-studio ops (panscience, High Alpha) — i corporate studio condividono GTM centralizzato; il solo-founder ha solo l'audience personale come equivalente.

## Stato venture sulla catena (live)

- **ARGOS**: a Fase 6 (gate €800 non ancora passato). Blocco noto = bug WA daemon duplicate-sends (impedisce test reali outreach Fase 5). NON ri-mandare a Fase 2 = trappola proxy. Lavoro ARGOS-side, terminale `combaretrovamiauto-enterprise`.
- **FLUXION**: gestionale €497 one-time, primo sale Stripe = trigger. Fase 5-6.
- **Guardian**: paused sine die.

## Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: assume che i tool free mantengano le quote attuali. Apollo free tier e Gemini Deep limiti cambiano; il routing va ri-verificato, non è statico.
2. **Cosa rompe a 30/60/90gg**: la tabella diventa stale appena un tool cambia pricing/quota o ne esce uno migliore. Serve un refresh (analogo a `routing-refresh` per LLM), altrimenti decade come ogni catalogo tool.
3. **Pattern errore noto**: rischio "tool collection" — accumulare tool senza che un caso reale li attraversi. La tabella vale 0 finché ARGOS (o altra venture) non la percorre end-to-end fino a Fase 6.
4. **Dove sovradimensiona**: Fase 1-2 (market-intelligence) è la parte più facile da costruire e la più seducente da lucidare; il valore reale è a Fase 5-6 dove muoiono le venture. Rischio di spendere tempo dove è comodo, non dove serve.
