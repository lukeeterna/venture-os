# ARGOS Automotive — DECISIONS.md

> Architecture Decision Records lean (5-field schema). Append-only.
> Mai cancellare entry SUPERSEDED — sostituirne lo Status e linkare alla nuova D-NN.
> Indice: vedi `README.md` (TBD S11d). Strategia: vedi `STRATEGY.md` (TBD S11d).
>
> **Schema entry**:
> ```
> ## D-NN — Titolo (YYYY-MM-DD, sessione)
> **Status**: OPEN | DECIDED | SUPERSEDED-by-D-MM
> **Contesto**: 2-3 righe
> **Opzioni considerate**: 2-4 bullet
> **Decisione**: 1-2 righe + chi
> **Conseguenze**: 2-4 bullet operativi
> ```

---

## D-01 — Business model: success-fee B2B €800-1.200 (2026-03-21, S73)

**Status**: DECIDED
**Contesto**: Quale modello commerciale tra subscription, abbonamento, success-fee, percentuale margine. Dealer family-business Sud Italia diffida di abbonamenti recurring e percentuali variabili (paragonate a "fregature mediatori").
**Opzioni considerate**:
- (a) Success-fee fissa €800-1.200/veicolo consegnato, zero anticipi
- (b) Subscription mensile €X + N ricerche incluse
- (c) Percentuale sul margine (5-10% dello sconto vs prezzo IT)
- (d) Fee fissa anticipata €500 + saldo a consegna
**Decisione**: Success-fee fissa €1.000 default (range €800-1.200 per modello/complessità), pagamento solo a veicolo consegnato. Founder + research S73.
**Conseguenze**:
- Zero anticipi = barriera ingresso azzerata per dealer scettici
- Cash flow ARGOS dipende interamente da chiusure (rischio operativo)
- Linguaggio messaging: "paghi ZERO finché non hai l'auto in mano" (s73_messaging_v2)
- Trasparenza vs trader tradizionali che nascondono €7-10k nel prezzo

**Ref**: `research/s73_messaging_v2.md`, `research/s99_DATI_CERTI_modello_b2b.md`

---

## D-02 — Pivot proattivo → ibrido on-demand (2026-03-31, S94)

**Status**: DECIDED
**Contesto**: Modello iniziale era "ARGOS propone veicoli al dealer" (push). Dealer 20-40 auto premium Sud Italia NON tiene stock speculativo: cerca SU COMMISSIONE del cliente finale (cliente dice "X3 2022 sotto 40k", dealer cerca su AS24/Mobile.de).
**Opzioni considerate**:
- (a) Solo proattivo: ARGOS manda dossier veicoli a dealer
- (b) Solo on-demand: dealer manda richiesta, ARGOS evade in 24-48h
- (c) Ibrido: dossier proattivo = activation/follow-up, on-demand = core revenue
**Decisione**: Modello ibrido (c). Primo contatto = veicolo reale specifico (dossier). Core revenue post-attivazione = ricerche on-demand su richiesta dealer. Research S94.
**Conseguenze**:
- Day 1 message porta auto reale ("ho trovato questa X3 a 32k DE, cliente la paga 39k IT")
- Pacchetto "Partner" post-prima-transazione: N ricerche/mese tariffa ridotta (retention)
- ARGOS = "ufficio acquisti EU" del dealer, non venditore di leads
- Discovery scraper (commission_classifier) deve identificare dealer "su commissione" — gap S101

**Ref**: `research/s94_value_proposition_on_demand.md`

---

## D-03 — Target: dealer family-business Sud Italia 20-40 auto premium (2026-03-21, S73)

**Status**: DECIDED (scope stretto, vedi D-OPEN-Q4 per allargamento)
**Contesto**: Definire ideal early adopter — chi è più disposto a sperimentare ARGOS in fase bootstrap.
**Opzioni considerate**:
- (a) Dealer grandi 50+ auto (volume) — fornitori consolidati, no motivo cambiare
- (b) Dealer micro <20 auto — budget zero, decisioni lente
- (c) Dealer 20-40 auto premium (BMW/Mercedes/Audi) Sud Italia — sweet spot
**Decisione**: Target (c). Archetipo "IL TITOLARE" 45-60 anni, 20-30 anni esperienza, fatturato €3-10M, utile netto €70-100k (0.93% in calo). Research S73.
**Conseguenze**:
- Discovery scraper filtra: stock 20-40, quota premium >40%, presenza WA, recensioni >50
- Lessico messaging tarato su profilo: "macchina" non "veicolo", "auto tedesca" non "veicolo EU"
- Geografia bootstrap: Campania + Puglia + Calabria (Foggia/Salerno/Cosenza first)
- TIER 0 priorità: dealer che già fanno import EU (Stile Car FG, Car Plus AV, Sa.My. CS)

**Ref**: `research/s73_dealer_persona.md`, `research/s73_dealer_target_list.md`, `research/s76_ideal_early_adopter_dealer_profile.md`

---

## D-04 — Canale outreach: WhatsApp primary, no email/LinkedIn (2026-03-21, S73)

**Status**: DECIDED
**Contesto**: Quale canale per primo contatto e relazione operativa. Dealer Sud Italia uso quotidiano variabile per canale.
**Opzioni considerate**:
- (a) Email PEC formale
- (b) LinkedIn InMail
- (c) WhatsApp Business diretto
- (d) Cold-call telefonico
**Decisione**: WhatsApp primary (c). Email solo sporadica, LinkedIn ignorata da target. Cold-call backup ma non scalabile. Founder + research S73.
**Conseguenze**:
- WA daemon è componente critical-path (S101 conferma operativo)
- Anti-ban: delay random 30-90s tra messaggi, max 20 contatti/giorno
- Compliance: ogni messaggio Day 1 deve avere "opt-out reply STOP" (GDPR + WhatsApp ToS)
- Pipeline test 5-step su TEST_FOUNDER prima di qualsiasi dealer reale

**Ref**: `research/s73_dealer_persona.md` ("WhatsApp SI, email sporadica, LinkedIn NO")

---

## D-05 — Backstory internazionale: riformulare capacità reali, mai inventare (2026-04-03, S99)

**Status**: DECIDED (vincolo operativo non negoziabile)
**Contesto**: Landing argos-automotive.pages.dev aveva claim falsi ("10 anni esperienza", "P.IVA in corso") che esponevano a CTC/Garante. Servono claim credibili senza menzogna.
**Opzioni considerate**:
- (a) Pulire tutti i claim e ripartire minimale ("nuovo servizio, 0 deal chiusi")
- (b) Costruire backstory N26-style: riformulare 73 portali/19 paesi/CoVe v4 come "esperienza EU"
- (c) Mantenere claim attuali e sperare
**Decisione**: Opzione (b). Principio operativo: *"il posizionamento seleziona e amplifica fatti veri. La menzogna inventa fatti falsi."* Research S99 backstory internazionale.
**Conseguenze**:
- I 3 pilastri verificabili: competenza tecnica EU (73 portali real), specializzazione progressiva (mesi sviluppo), risultati misurabili (140+ veicoli analizzati protocollo)
- Landing FASE 0 cleanup S165 ARGOS: rimuovere "10 anni esperienza" → "Il Protocollo ARGOS nasce dall'analisi sistematica di migliaia di inserzioni EU"
- Cross-canale coerenza obbligatoria: messaggio WA, landing, eventuale LinkedIn devono dire LA STESSA STORIA tono diverso
- Footer disclosure P.IVA quando attiva (vedi D-OPEN-Q2)

**Ref**: `research/s99_backstory_internazionale.md`, `research/s99_PIANO_OPERATIVO_COMPLETO.md`

---

## D-06 — Stack tecnico: CoVe Engine v4 + WA daemon + discovery scraper (2026-04, S101)

**Status**: DECIDED (pipeline E2E funzionante)
**Contesto**: Architettura tecnica ARGOS — quali componenti core production-ready.
**Opzioni considerate**: (decisione storica, alternative deferred)
**Decisione**: Stack attuale:
- Scraper su 28 portali (target 73) con anti-ban
- CoVe Engine v4: 4 analisi indipendenti (prezzo, km, anno, anomalie)
- WA daemon: connesso, invia/riceve
- Response-analyzer: classifica intent (10/10 accuracy), genera risposte LLM (Groq primary)
- Gate validazione: blocca listing falsi/SKIP
- Discovery engine + commission_classifier: PRONTI ma non lanciati
**Conseguenze**:
- LLM cascade fragile = single point of failure (S101): Groq unico provider attivo. Dipendenza VOS `llm_router` (S9) per fallback chain
- auto_approve_and_send: riscritto 3 volte, subprocess deployato, non testato E2E → HITL obbligatorio primi N dealer
- Due DB separati (CRM MacBook vs dammeno iMac) NON sincronizzati → gap operativo aperto
- Pipeline 341s scraper→CoVe→PDF (S99 piano operativo)

**Ref**: `research/s101_PIANO_AGENT_FIRST.md`, `wiki/projects/ARGOS/COMPILED-STATE.md`

---

## D-07 — HITL strutturale primi 20 dealer reali (2026-04, S101 + handoff S11c-strategic)

**Status**: DECIDED
**Contesto**: auto_approve_and_send non testato E2E + LLM cascade fragile + zero dealer chiusi finora. Risk reale di messaggio sbagliato a dealer reale = bruciato target.
**Opzioni considerate**:
- (a) Full automation da Day 1
- (b) HITL primi 20 dealer (approve/edit/reject ogni messaggio outbound)
- (c) HITL forever
**Decisione**: HITL strutturale primi 20 dealer reali. Founder approva/edita/rigetta ogni Day 1/Day 3/Day 7 message PRIMA invio. Post-20 deal validati → criteri sblocco auto_approve. Source: handoff S11c-strategic.
**Conseguenze**:
- Throughput limitato ~3-5 dealer/giorno (capacità founder review)
- Protocollo HITL deve essere skill `/outreach-day1` (S168 ARGOS)
- TEST_FOUNDER NON è validation contenuto (è pipeline test 5-step) — content gating resta founder reale
- Sblocco auto-mode: criteri da definire S168+ (es. 20 deal closed + 0 messaggi sbagliati 14gg)

**Ref**: `handoffs/HANDOFF-VOS-S11c-strategic-wiki-argos-2026-05-13.md`, `research/s101_PIANO_AGENT_FIRST.md`

---

## D-08 — 5 archetipi dealer (NARCISO/BARONE/RAGIONIERE/TECNICO/RELAZIONALE) — IPOTESI (2026-03-21, S73)

**Status**: OPEN (ipotesi-non-validata, n=6 portfolio assignment, validazione HITL S168+)
**Contesto**: Tarare messaggio Day 1 sul singolo dealer richiede classificazione. 5 archetipi proposti S73 sul portfolio Sud Italia (n=6 dealer profilati: FC Luxury Car Center, A.B. Motors Buoninfante, Autovanny Group, Auto Genova, Gruppo Emme, Stile Car). **n=6 non è evidenza statistica** — è assegnazione founder-led basata su review count + tone landing + presentazione team, non su risposta comportamentale a messaggi.
**Opzioni considerate**:
- (a) Confermare 5 archetipi pre-S168, response-analyzer include archetype-classifier dal Day 1
- (b) Tenere come ipotesi di lavoro: skill `/outreach-day1` genera variant by archetype proposto, ma archetype = etichetta operativa NON ground truth. Validazione = risposta vs predicted leva (es. NARCISO predicted ama citation stock → risponde se Day 1 cita stock?). Validazione richiede ≥20 dealer HITL con outcome tracciato in CRM
- (c) Scartare tassonomia, usare scoring numerico (review count, stock size, recensione media) come unica feature
**Decisione**: TBD — opzione (b) operativa come default fino a validazione S168+. Tassonomia in `s73_dealer_persona.md` resta canonical reference operativa, NON canonical ground truth.
**Conseguenze**:
- response-analyzer archetype-classifier resta gap aperto (S101 explicit: *"Archetipi non validati, assegnati per portfolio, mai confermati"*)
- Skill `/outreach-day1` accetta archetype come parametro ma flagga `[ipotesi-non-validata]` nel CRM
- Outcome tracking obbligatorio: ogni dealer outbound → record (predicted archetype, leva utilizzata, response observed, archetype-fit verified/falsified)
- Promozione a DECIDED richiede: ≥20 dealer HITL con ≥70% concordanza predicted-vs-observed su almeno 2 archetipi (no dummy "1 archetipo cattura tutto")
- Falsificazione possibile: se outcome dimostra che 2-3 archetipi sono indistinguibili → ridurre tassonomia (opzione c diventa preferita)
**Sblocco richiesto da**: 20 dealer HITL closed S168+ con outcome tracking attivo

**Ref**: `research/s73_dealer_persona.md` (definizioni + matrice credibilità), `research/S73_MASTER_REFERENCE.md` (esempi assegnazione), `research/s101_PIANO_AGENT_FIRST.md` (gap esplicito non-validato)

---

## D-09 — Scope sourcing: EU 73 portali, 19 paesi (focus DE/BE/NL/AT) (2026-04, S99)

**Status**: DECIDED
**Contesto**: Quali mercati di sourcing ARGOS copre. Capacità tecnica copre 73 portali; il pitch operativo deve essere stretto.
**Opzioni considerate**:
- (a) Solo DE (mercato più grande EU usato premium)
- (b) DACH (DE+AT+CH)
- (c) DE/BE/NL/AT (sweet spot prezzo + import facile in IT)
- (d) Tutti i 19 paesi capacità tecnica
**Decisione**: Pitch operativo Day 1 = "Germania, Belgio, Olanda, Austria". Capacità tecnica retained 73 portali/19 paesi per ricerche specifiche on-demand.
**Conseguenze**:
- Messaging V2 nomina solo DE/BE/NL/AT (s73_messaging_v2): cognitive load dealer ridotto
- CoVe Engine deve mantenere copertura full 19 paesi per ricerche estese on-demand
- Differenziale prezzo verificato EU/IT: 15-25% su BMW/Mercedes/Audi 2018-2023 (s99_DATI_CERTI_margini_reali)
- Compliance import: EUROCOC + DAT + DEKRA inclusi nel servizio

**Ref**: `research/s99_DATI_CERTI_margini_reali.md`, `research/s65_all_eu_car_portals.md`

---

## D-10 — TIER 0/1/2 segmentation discovery (2026-03-21, S73)

**Status**: DECIDED
**Contesto**: Priorità outreach in fase bootstrap (budget tempo limitato founder + HITL).
**Opzioni considerate**: (tassonomia)
**Decisione**: 3-tier priority:
- **TIER 0** — dealer che GIÀ fanno import EU (3 noti: Stile Car FG, Car Plus AV, Sa.My. CS). Pitch = upgrade non concetto nuovo
- **TIER 1** — dealer growth-mode con stock premium 20-40, no import attuale ma capacità (auto premium + recensioni >50)
- **TIER 2** — dealer mass-market o stock <20: parking lot, ricontattati post-prime-deal
**Conseguenze**:
- Discovery scraper filtra TIER 0 prima via keyword "importazione", "Germania", "EU" su listing dealer
- ROADMAP outreach: TIER 0 primi 10 dealer, TIER 1 successivi 50, TIER 2 solo post-validation
- Tracking conversion-by-tier in CRM (gap: due DB non sincro)

**Ref**: `research/s73_dealer_target_list.md`

---

## D-11 — Test pipeline 5-step su TEST_FOUNDER prima dealer reale (2026-05-13, S11c-prereq)

**Status**: DECIDED
**Contesto**: auto_approve_and_send mai testato E2E. Bug runtime su dealer reale = bruciato target + reputation.
**Opzioni considerate**:
- (a) Andare diretti su dealer reale Day 1
- (b) Test pipeline 5-step su TEST_FOUNDER (numero founder dedicato come dealer fittizio)
- (c) Setup ambiente staging completo prima
**Decisione**: Opzione (b). 5-step test su TEST_FOUNDER: smoke send, response interest, response negative, response no-reply, edge case bug. Source: handoff S11c-strategic.
**Conseguenze**:
- TEST_FOUNDER = pipeline test only — NON valida contenuto messaggi (content gating resta founder reale, D-07)
- 5 scenari come acceptance criteria S166 ARGOS prima di S168 (dealer reale)
- Fallimento qualsiasi step = blocker, no advance

**Ref**: `handoffs/HANDOFF-VOS-S11c-strategic-wiki-argos-2026-05-13.md` (Sez 5 Pipeline test)

---

## D-12 — Recensioni reali = gap critico pre-S168 (2026-04, S99)

**Status**: DECIDED (gap riconosciuto, mitigazione in corso)
**Contesto**: Competitor Autotedesche: 169 recensioni. ARGOS: 0. Dealer Sud Italia controllano Google Reviews PRIMA di rispondere (s73_dealer_persona "decide nei primi 10 secondi").
**Opzioni considerate**:
- (a) Lancio senza recensioni, costruire over time
- (b) Recensioni fake (illegale + bruciate al primo dealer che googla)
- (c) Lancio con N recensioni "soft": ex-clienti consulenza founder, contatti professionali validati
- (d) Aspettare 6 mesi per accumulare 10 recensioni organic prima di scalare outreach
**Decisione**: Combinazione (a)+(c). Recensioni soft da contatti pre-ARGOS validate genuine + outreach concorrente per accumulare organic. NON aspettare 6 mesi (founder runway).
**Conseguenze**:
- Google Business Profile ARGOS: setup priorità S165
- Primi 5 dealer chiusi: chiedere review esplicitamente nel D+7 post-consegna
- Landing deve avere placeholder "Recensioni clienti" che si popola progressivamente
- Mai citare review count gonfiato in messaging (rule D-05)

**Ref**: `research/s99_PIANO_OPERATIVO_COMPLETO.md`, `research/s74_credibilita_intermediari_auto_sud_italia.md`

---

# OPEN DECISIONS — Founder input pending

Le 5 entry sotto sono **scope decisions** (eccezione vincolo #3) che richiedono input founder reale. Mantenute esplicite per evitare implicit-assumption drift. Ogni OPEN entry verrà chiusa in `FOUNDER-DECISIONS-2026-05-13.md` (pre-req S11c-strategic completo) o in sessione successiva con founder presente.

---

## D-OPEN-Q1 — Identità Luca Ferretti vs Gianluca Di Stasi (TBD)

**Status**: OPEN
**Contesto**: Sito + WA + messaging citano "Luca Ferretti" come frontman ARGOS. Luke (founder reale) = Gianluca Di Stasi. Persona fittizia con foto stock/AI espone a denuncia dealer + CTC/Garante Privacy se scoperta.
**Opzioni considerate**:
- (a) Luke = Luca pseudonimo commerciale legittimo + P.IVA Luke + footer disclosure ("Luca Ferretti è marchio commerciale di Gianluca Di Stasi")
- (b) Rebrand a Gianluca Di Stasi reale: brucia 6 mesi SEO landing + research già fatte
- (c) Partner umano come frontman reale (cerca co-founder)
**Decisione**: TBD founder S11c o S168
**Conseguenze**: cascading su D-05 (footer disclosure), D-04 (messaggi WA "sono Luca" → "sono Gianluca"), tutti gli asset visual (foto Luca AI vs foto Luke reale)
**Sblocco richiesto da**: Luke
**Default fallback se non risolto entro S168**: opzione (a) con footer "pseudonimo commerciale" — minimo rischio legale, costo zero rebrand. Da confermare commercialista per formulazione esatta footer.

---

## D-OPEN-Q2 — P.IVA timing (TBD)

**Status**: OPEN
**Contesto**: Landing dice "P.IVA in corso" = claim falso (D-05 violato finché vero). Research S99 modello B2B: bootstrap legale con prestazione occasionale fino 5k€/anno (zero INPS), ma abitualità configurata = obbligo P.IVA. Landing+CRM+outreach attivo = "organizzazione sistematica" → P.IVA già necessaria.
**Opzioni considerate**:
- (a) P.IVA già attiva (verificare se Luke l'ha aperta)
- (b) Aprire subito (€200-500 setup + commercialista ~€600-1.200/anno forfettario 5%)
- (c) Aspettare primo deal validato
**Decisione**: TBD Luke
**Conseguenze**: bloccante per fatturazione legale prima transazione. Senza P.IVA: ricevuta prestazione occasionale con ritenuta 20% (max 5k€/anno totali, oltre = obbligo iscrizione Gestione Separata INPS 26.07%)
**Sblocco richiesto da**: Luke + commercialista
**Default fallback**: opzione (b) — research S99 raccomandazione operativa diretta "apri P.IVA PRIMA del primo incasso. Costo basso, rischio contestazione con infrastruttura già in piedi alto".

---

## D-OPEN-Q3 — Dominio (TBD)

**Status**: OPEN
**Contesto**: argos-automotive.pages.dev = Cloudflare Pages free. Dealer Sud Italia 45-60 anni leggono dominio come segnale credibilità ("non hanno nemmeno il sito loro"). argosautomotive.eu disponibile €5-8/anno.
**Opzioni considerate**:
- (a) Resta .pages.dev (zero costo, suboptimal credibilità)
- (b) Aprire .eu o .it: €5-15/anno + redirect, credibilità +1 step
- (c) Acquistare argosautomotive.com: $3.395 (broker quote 2026-04)
**Decisione**: TBD Luke
**Conseguenze**: tocca asset cross-canale (firma email, landing meta, footer WA), redirect SEO non blocca research già fatte
**Sblocco richiesto da**: Luke
**Default fallback**: opzione (b) — €5-15/anno è capex trascurabile, vincolo #5 zero-cost esce dall'ipotesi solo per uplift credibility verificata necessaria.

---

## D-OPEN-Q4 — Target scope: stretto Sud BMW/Merc/Audi vs allargato Porsche/Lambo/Ferrari (TBD)

**Status**: OPEN
**Contesto**: `identity.md` ARGOS cita 2 scope contemporanei: (i) "Sud Italia BMW/Mercedes/Audi 30-80 auto" (target D-03 confermato) e (ii) "anche Porsche/Lamborghini/Ferrari 2018-2025" (luxury upper). I 2 target hanno persona, pricing, pipeline DIVERSE.
**Opzioni considerate**:
- (a) Solo scope stretto Sud BMW/Merc/Audi 20-40 auto premium (D-03 ratificato)
- (b) Aggiungere luxury parallelo (richiede pipeline test 5-step separata + archetipi diversi)
- (c) Luxury come opzione on-demand quando dealer Sud richiede esoticа
**Decisione**: TBD Luke. Default operativo finché aperta: scope stretto (a) per coerenza messaging + capacità HITL founder
**Conseguenze**:
- Allargamento richiede S94 simile su persona dealer luxury (es. Modena/Riviera vs Sud)
- Pricing potrebbe non scalare (Porsche 911 2020 €80k margine ≠ €1.000 fee giustificabile?)
- Sourcing 73 portali capacità tecnica copre luxury, no work tecnico aggiuntivo
**Sblocco richiesto da**: Luke
**Default fallback**: opzione (a) — scope stretto fino a 20 deal chiusi su BMW/Merc/Audi, poi rivalutare allargamento con dati.

---

## D-OPEN-Q5 — Pricing trasparenza: range pubblico vs "su veicolo" (TBD)

**Status**: OPEN
**Contesto**: Fee €800-1.200 (D-01) — esposizione public vs negoziata caso-per-caso. Dealer family-business diffidano di pricing nascosto, ma range pubblico può essere bandiera rossa se prezzo competitor differente.
**Opzioni considerate**:
- (a) Range pubblico su landing ("fee fissa €800-1.200, definita pre-conferma su modello")
- (b) "Da definire per veicolo" — esposizione solo in conversation
- (c) Solo dopo prima risposta dealer interessato
**Decisione**: TBD Luke
**Conseguenze**:
- Trasparenza (a) coerente con D-05 backstory + D-01 zero-anticipi narrativa
- "Da definire" (b) compatibile con messaging V2 attuale (s73_messaging_v2 non cita prezzo Day 1)
- Day 1 message comunque non cita prezzo (regola "porta auto, non te stesso" — s73)
**Sblocco richiesto da**: Luke
**Default fallback**: opzione (a) — coerente con principio operativo D-05 (riformulare fatti veri vs nasconderli). Range visibile su landing, dettaglio per modello in conversation.

---

# Indice cronologico

| # | Titolo | Status | Data | Sessione |
|---|--------|--------|------|----------|
| D-01 | Success-fee B2B €800-1.200 | DECIDED | 2026-03-21 | S73 |
| D-02 | Pivot ibrido on-demand | DECIDED | 2026-03-31 | S94 |
| D-03 | Target Sud Italia 20-40 auto premium | DECIDED | 2026-03-21 | S73 |
| D-04 | WhatsApp primary | DECIDED | 2026-03-21 | S73 |
| D-05 | Backstory riformulare, mai inventare | DECIDED | 2026-04-03 | S99 |
| D-06 | Stack CoVe v4 + WA + discovery | DECIDED | 2026-04 | S101 |
| D-07 | HITL primi 20 dealer reali | DECIDED | 2026-04 | S101+S11c |
| D-08 | 5 archetipi (NARCISO/BARONE/...) — IPOTESI | OPEN | 2026-03-21 | S73 |
| D-09 | Scope EU DE/BE/NL/AT pitch | DECIDED | 2026-04 | S99 |
| D-10 | TIER 0/1/2 segmentation | DECIDED | 2026-03-21 | S73 |
| D-11 | Pipeline test 5-step TEST_FOUNDER | DECIDED | 2026-05-13 | S11c-prereq |
| D-12 | Recensioni reali gap critico | DECIDED | 2026-04 | S99 |
| D-OPEN-Q1 | Identità Luca vs Gianluca | OPEN | — | TBD |
| D-OPEN-Q2 | P.IVA timing | OPEN | — | TBD |
| D-OPEN-Q3 | Dominio | OPEN | — | TBD |
| D-OPEN-Q4 | Target scope stretto vs luxury | OPEN | — | TBD |
| D-OPEN-Q5 | Pricing trasparenza | OPEN | — | TBD |

**Totale**: 17 entry (11 DECIDED + 6 OPEN: Q1-Q5 founder-input + D-08 ipotesi-da-validare). Soglia handoff S11c-strategic D2 ≥13 → ✅.

# Open questions / Risks

1. **Default fallback per OPEN entries non risolte entro S168 ARGOS**: ogni D-OPEN-Qx ha un "Default fallback" che indica cosa fare se Luke non risolve in tempo. Rischio: defaults si attivano in silent e diventano decisioni implicite. Mitigazione: brief mattutino può segnalare D-OPEN-Qx age >14gg.
2. **Cascading dipendenze**: D-OPEN-Q1 (identità) tocca D-04 (firma WA), D-05 (footer landing), tutti gli asset visual. Risolvere Q1 trigger update D-04+D-05 (cross-reference da mantenere sync).
3. **Decision drift retroattivo**: D-01 success-fee €1.000 deciso S73 (2026-03-21). Variabili economiche cambiate (inflation, costi trasporto Macingo) — review periodica annuale necessaria.
4. **Pattern S159 ribattezzato**: scrivere STRATEGY.md (D3 deferred S11d) senza chiudere D-OPEN-Q1 = blueprint che si auto-debugga al primo dealer reale (D-05 violato). STRATEGY.md NON va scritta prima di Q1 closed o default attivato esplicitamente.
5. **Audit retroattivo DECIDED entries** (S11c-strategic 2026-05-13 lessons): D-08 inizialmente scritta DECIDED, corretta OPEN-ipotesi-non-validata dopo flag founder (n=6 portfolio ≠ evidenza, S101 stesso cita gap). Audit-check applicato alle restanti 11 DECIDED: tutte sono strategiche-non-behavioral (success-fee, pivot, canale WA, backstory, stack, HITL, scope EU, tier segmentation, pipeline test, gap recensioni) o factual-observed (recensioni 0 vs 169 Autotedesche). Nessuna è ipotesi comportamentale travestita da decisione. Pattern: prima di marcare DECIDED, distinguere {strategic-commitment, factual-observation, behavioral-hypothesis}. Solo i primi 2 ammissibili come DECIDED senza n>>1 evidenza.
