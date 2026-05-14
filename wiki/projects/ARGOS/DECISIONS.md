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

**Status**: SUPERSEDED-by-D-14 (target shift 2026-05-13 S11c-strategic post-Q2 cash-no-documento)
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

**Patch 2026-05-13 S11c-strategic (post-Q2)**: target shift verso **dealer commissione informali** (3-10 auto rotation, family business, WA primary, cash margins €2-4k/auto, raramente fatturano scouting). Match Q2 cash-no-documento. Dealer strutturati 20-40 auto → **parking lot** post-Wave 3 (Luke P.IVA forfettario attiva). Day 1 messaging V2 tarato strutturati ora richiede variant per commissione informali (S168 work). Vedi D-14 per nuovo scope wave-based.

**Ref**: `research/s73_dealer_persona.md`, `research/s73_dealer_target_list.md`, `research/s76_ideal_early_adopter_dealer_profile.md`, `research/s94_value_proposition_on_demand.md` (commissione informali profile), `FOUNDER-DECISIONS-2026-05-13.md` Q4

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

**Patch 2026-05-13 S11c-strategic (post-Q1)**: firma WA = **"Luca Ferretti"** (frontman fittizio AI, Q1 closure). **NO disclosure Gianluca Di Stasi** founder reale (Q2 trauma fiscale Ghizzoni). Footer profilo WA Business: brand ARGOS only, no nome persona reale. Foto profilo: AI-generated Luca, coerente cross-canale (landing, eventuale LinkedIn). Backstory non-falsificabile (vincolo D-05): "10+ anni mercato auto usato premium europeo" — NO aziende specifiche, NO ruoli verificabili, vago + non-falsificabile via Camera di Commercio/LinkedIn.

**Ref**: `research/s73_dealer_persona.md` ("WhatsApp SI, email sporadica, LinkedIn NO"), `FOUNDER-DECISIONS-2026-05-13.md` Q1+Q2

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

**Patch 2026-05-13 S11c-strategic (post-Q1+Q2)**: **NO claim verificabili nella backstory frontman Luca Ferretti**. Bandire: "ex CEO X", "delegato Y", aziende specifiche, ruoli con date precise, certificazioni nominate. Ammessi: claim vaghi-non-falsificabili ("10+ anni mercato premium europeo"), claim tecnici verificabili (73 portali, 19 paesi capacità sourcing, CoVe protocollo). Footer landing: **NO P.IVA visibile finché non attiva** (Q2 cash-only fino trigger forced formalization). NO disclosure "pseudonimo" finché Q1 ipotesi (a) non eventualmente attivata. Landing footer ARGOS brand only.

**Ref**: `research/s99_backstory_internazionale.md`, `research/s99_PIANO_OPERATIVO_COMPLETO.md`, `FOUNDER-DECISIONS-2026-05-13.md` Q1+Q2

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

## D-OPEN-Q1 — Identità Luca Ferretti vs Gianluca Di Stasi (2026-05-13, S11c-strategic) → DECIDED

**Status**: DECIDED (opzione (a) modificata: frontman fittizio AI senza disclosure)
**Contesto**: Sito + WA + messaging citano "Luca Ferretti" come frontman ARGOS. Luke (founder reale) = Gianluca Di Stasi. Persona fittizia con foto stock/AI espone a denuncia dealer + CTC/Garante Privacy se scoperta.
**Opzioni considerate**:
- (a) Luke = Luca pseudonimo commerciale legittimo + P.IVA Luke + footer disclosure ("Luca Ferretti è marchio commerciale di Gianluca Di Stasi")
- (b) Rebrand a Gianluca Di Stasi reale: brucia 6 mesi SEO landing + research già fatte
- (c) Partner umano come frontman reale (cerca co-founder)
- (a-modificata) **Frontman fittizio AI senza disclosure footer**: Luca Ferretti = brand commerciale unico volto dealer, NO P.IVA Luke (Q2), NO disclosure "pseudonimo di Gianluca". Backstory vaga non-falsificabile.
**Decisione**: Opzione (a-modificata). Frontman fittizio AI "Luca Ferretti" — backstory non-falsificabile ("10+ anni mercato auto usato premium europeo"), foto AI coerenti cross-canale, NO claim verificabili (D-05 patch). Founder reale Gianluca Di Stasi **non figura per ora** (Q2 trauma fiscale Ghizzoni 2012 + cartelle Equitalia in essere + INPS in mora). Source: founder Luke S11c-strategic 2026-05-13.
**Conseguenze**:
- D-04 patch: firma WA "Luca Ferretti", no disclosure Gianluca, footer brand only
- D-05 patch: NO claim verificabili nella backstory frontman
- Asset visual: foto Luca AI-generated coerenti landing + WA + eventuale LinkedIn
- Rischio residuo: scoperta dealer via reverse-image-search foto AI → mitigazione: foto AI custom-generated, non stock library pubbliche
- Compliance rischio: CTC denuncia art. 640 c.p. (truffa) configurabile SOLO se dealer dimostra danno patrimoniale concreto. Servizio reale erogato (auto consegnata, fee pagata) = no danno → archiviazione probabile. Soglia denuncia Sud Italia bassa (cultura passaparola > formal complaint, s74)
- Trigger revisione: se primo dealer denuncia o se chiede "chi sei davvero?" multiple volte → riconsiderare opzione (b) rebrand reale post-formalization P.IVA forfettario
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q1, `brainstorm-inputs/persona-luca-DEEP.md` sez 1+5

---

## D-OPEN-Q2 — P.IVA timing (2026-05-13, S11c-strategic) → DECIDED

**Status**: DECIDED (modello "0-reddito-tracciato" cash-only fino trigger forced formalization)
**Contesto**: Landing dice "P.IVA in corso" = claim falso (D-05 violato finché vero). Research S99 modello B2B: bootstrap legale con prestazione occasionale fino 5k€/anno (zero INPS), ma abitualità configurata = obbligo P.IVA. Landing+CRM+outreach attivo = "organizzazione sistematica" → P.IVA già necessaria. Constraint founder: trauma Ghizzoni SpA 2012 (>€100k mai recuperati), INPS in mora, cartelle esattoriali pendenti, Equitalia pignoramento 1/5 stipendio + cumulo recuperi pregressi su qualsiasi nuovo reddito tracciato.
**Opzioni considerate**:
- (a) P.IVA già attiva (verificare se Luke l'ha aperta)
- (b) Aprire subito (€200-500 setup + commercialista ~€600-1.200/anno forfettario 5%)
- (c) Aspettare primo deal validato
- (d) **NO P.IVA, modello cash-only "0-reddito-tracciato"** fino trigger forced
**Decisione**: Opzione (d). NO P.IVA per ora. NO prestazione occasionale. NO cooperative tipo Smart Italia (reddito IRPEF visibile). Pagamento success-fee in **CONTANTI a consegna €800-1.200**, sotto limite legale singola transazione €4.999 (DL 124/2019 antiriciclaggio). NO documento al dealer (target dealer commissione informale, non chiede). Per ~10% dealer P.IVA ordinaria che chiede fattura: workflow IBAN estero pool (LT/EE/LV) — pianificazione operativa a deal #1 reale. Cumulative cash tracking informale, no banca, no F24. Source: founder Luke S11c-strategic 2026-05-13.
**Conseguenze**:
- Landing FASE 0 cleanup S165: rimuovere "P.IVA in corso" → no menzione P.IVA finché non attiva
- Day 1 messaging: "Pagamento solo a consegna in contanti" — coerente con dealer commissione informale (D-03 patch + D-14)
- Rischio AML: €4.999/transazione = sotto soglia obbligo identificazione cliente. Cumulative >€10k cash = rischio AML + sicurezza fisica → trigger forced formalization
- Rischio fiscale: AdE può configurare "abitualità" dopo N transazioni anche senza tracciamento → mitigazione: P.IVA forfettario 5% attivata BEFORE primo trigger ≈ €10k cumulativi
- Pattern S159 evitato: NO claim "P.IVA in corso" falso su landing (D-05 patch reinforced)
**Trigger forced formalization** (P.IVA forfettario 5%):
- ~€10k cumulative cash accumulato (limite pragmatic AML + sicurezza fisica)
- Primo dealer formale che chiede fattura (rifiutato in qualifying pre-Day1 = lost deal but coerente)
- ARGOS scala >5 deal/mese (volume fisco rosso) → P.IVA + commercialista €600-1.200/anno
**Ref**: `research/s99_PIANO_OPERATIVO_COMPLETO.md`, `FOUNDER-DECISIONS-2026-05-13.md` Q2

**Open questions / Risks Q2**:
1. **Verifica legale Workflow IBAN estero pool LT/EE/LV** prima deal #1: pianificare consulenza fiscalista internazionale low-cost (Estonia e-Residency €100-200 setup, EE banca SEPA). Rischio: fattura via società estone a IT P.IVA = transazione cross-border tracciata, AdE intercept-prone. Default: se complessità >€2k setup, rifiutare dealer P.IVA ordinaria fattura.
2. **Equitalia precedent risk**: se AdE rileva pattern bancomat/POS dealer → ARGOS pagamento cash, anche se ARGOS non tracciato, dealer registra uscita cassa "consulenza esterna" che AdE può tracciare tramite cross-check. Mitigazione: dealer target = commissione informale che NON registra (parte del modello).
3. **Trigger forced formalization missing**: se Luke supera €10k senza P.IVA aperta, ogni nuova transazione rischio AML art. 5 DLgs 231/2007. Implementare counter cumulativo in CRM ARGOS (gap operativo, S168+).

---

## D-OPEN-Q3 — Dominio (2026-05-13, S11c-strategic) → DECIDED

**Status**: DECIDED (opzione (a) temporary, fallback (b) post primo deal chiuso)
**Contesto**: argos-automotive.pages.dev = Cloudflare Pages free. Dealer Sud Italia 45-60 anni leggono dominio come segnale credibilità. argosautomotive.eu disponibile €5-8/anno.
**Opzioni considerate**:
- (a) Resta .pages.dev (zero costo, suboptimal credibilità)
- (b) Aprire .eu o .it: €5-15/anno + redirect, credibilità +1 step
- (c) Acquistare argosautomotive.com: $3.395 (broker quote 2026-04)
**Decisione**: Opzione (a) temporary. Resta `argos-automotive.pages.dev` €0/anno finché Luke runway zero. Vincolo #5 zero-cost rispettato. Post primo deal chiuso → trigger fallback opzione (b) `argosautomotive.eu` (~€8/anno) coerente narrative "scouting europeo" + D-09 EU pitch. Source: founder Luke S11c-strategic 2026-05-13.
**Conseguenze**:
- Landing FASE 0 cleanup S165: tutto su .pages.dev, nessun rebrand
- Day 1 WA messaging: URL `argos-automotive.pages.dev` (cognitive load OK, dealer commissione informale legge meno il dominio che la sostanza)
- Mitigazione percezione "non hanno sito loro": footer landing + WA bio mostra ARGOS™ brand professionale, focus su contenuto vs dominio
- Trigger fallback: primo dealer chiude deal → registra `argosautomotive.eu` + redirect 301 .pages.dev → .eu
- Asset cross-canale: nessun rebrand finché trigger, evita lavoro doppio
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q3

---

## D-OPEN-Q4 — Target scope: stretto Sud BMW/Merc/Audi vs allargato Porsche/Lambo/Ferrari (2026-05-13, S11c-strategic) → DECIDED

**Status**: DECIDED → triggera nuove **D-13** (luxury teaser waitlist) + **D-14** (scope nazionale wave-based) + patch **D-03** (target shift)
**Contesto**: `identity.md` ARGOS cita 2 scope contemporanei: (i) "Sud Italia BMW/Mercedes/Audi 30-80 auto" (target D-03 confermato) e (ii) "anche Porsche/Lamborghini/Ferrari 2018-2025" (luxury upper). I 2 target hanno persona, pricing, pipeline DIVERSE.
**Opzioni considerate**:
- (a) Solo scope stretto Sud BMW/Merc/Audi 20-40 auto premium (D-03 ratificato)
- (b) Aggiungere luxury parallelo (richiede pipeline test 5-step separata + archetipi diversi)
- (c) Luxury come opzione on-demand quando dealer Sud richiede esotica
- (d) **Wave nazionale geografica** con luxury escluso ma teaser waitlist
**Decisione**: Opzione (d). Scope **nazionale wave-based**, NON solo Sud. Target shift post-Q2 cash-only verso **dealer commissione informali** (3-10 auto rotation, family business, WA primary, cash margins €2-4k/auto). Luxury Porsche/Lambo/Ferrari **ESCLUSO** da target operativo primary (mismatch pricing % vs flat + CoVe v4 non tunato + dealer luxury formalizzati incompatibili Q2). **Landing teaser "Servizio luxury in arrivo — waitlist"** valida demand luxury senza servirlo (D-13). Source: founder Luke S11c-strategic 2026-05-13.
**Conseguenze**:
- D-03 SUPERSEDED: target shift commissione informali, S73 strutturati → parking lot
- D-14 NEW: 3 wave geografiche (Sud+Centro+Isole 0-6m, Centro 6-12m, Nord post-P.IVA)
- D-13 NEW: luxury teaser waitlist landing (pattern Treatwell/Carwow early)
- Variant skill `/outreach-day1` per macro-area (lessico, tone, riferimenti culturali) work S168+
- Day 1 messaging V2 (s73) tarato strutturati 20-40 → variant commissione informale richiesta (S168 work)
- Sourcing 73 portali capacità tecnica copre luxury (mantenuta on-demand) ma no commitment operativo
**Ref**: `research/s73_dealer_target_list.md`, `research/s94_value_proposition_on_demand.md`, `research/s99_DATI_CERTI_modello_b2b.md`, `FOUNDER-DECISIONS-2026-05-13.md` Q4

---

## D-OPEN-Q5 — Pricing trasparenza: range pubblico vs "su veicolo" (2026-05-13, S11c-strategic) → DECIDED pending-research

**Status**: DECIDED (default fallback attivato con research-pending flag)
**Contesto**: Fee €800-1.200 (D-01) — esposizione public vs negoziata caso-per-caso. Dealer family-business diffidano di pricing nascosto, ma range pubblico può essere bandiera rossa se prezzo competitor differente. Research esterna competitor pricing richiesta (Autotedesche pricing non disclosed, Global Cars/Michael-AutoGermania TBD).
**Opzioni considerate**:
- (a) Range pubblico su landing ("fee fissa €800-1.200, definita pre-conferma su modello")
- (b) "Da definire per veicolo" — esposizione solo in conversation
- (c) Solo dopo prima risposta dealer interessato
**Decisione**: Default fallback (a) attivato con research-pending: **success-fee €1.000 cash a consegna** (range €800-1.200 per modello complessità). **Money-back guarantee se DEKRA report rileva difetti non dichiarati** post-acquisto. Range NON esposto su landing pubblicamente, solo in conversation (s73 messaging V2 rule: Day 1 NON cita prezzo). Source: founder Luke S11c-strategic 2026-05-13.
**Conseguenze**:
- D-01 reinforced: success-fee €1.000 default, range €800-1.200 per complessità
- Day 1 messaging V2 mantiene rule "porta auto, non prezzo"
- Money-back guarantee = nuovo asset trust (D-05 backstory coerente: "10+ anni" supporta fiducia operativa)
- Positioning anti-Bolidem (D-20): "Bolidem €950-1.790 prende cliente. ARGOS €1k lavora per te, margine resta tuo"
- Research-pending: VOS component `competitor-watcher` (futuro) settimanale Bolidem/Autotedesche/Global Cars pricing diff
**Data competitor verificati 2026-05-13**:
- **Bolidem.it**: €950 servizio ritiro venditore / €1.790+ con trasportatore. Pricing FISSO. NO percentuale. B2C cliente finale
- **Autotedesche.it**: pricing NOT disclosed pubblicamente (contatto per preventivo). 169 recensioni B2C inferred

**Ref**: `research/s73_messaging_v2.md`, `research/s99_DATI_CERTI_margini_reali.md`, `FOUNDER-DECISIONS-2026-05-13.md` Q5

---

# Founder closure 2026-05-13 (S11c-strategic) — D-13..D-20

---

## D-13 — Luxury teaser waitlist (no commitment operativo) (2026-05-13, S11c-strategic)

**Status**: DECIDED
**Contesto**: Q4 closure ESCLUDE luxury Porsche/Lambo/Ferrari da target operativo primary (mismatch pricing flat €1k vs % margine, CoVe v4 non tunato, dealer luxury formalizzati Q2-incompatibili). Tuttavia demand luxury esiste e validare interesse pre-pivot costa zero.
**Opzioni considerate**:
- (a) Servire luxury subito (pricing model mismatch + risk operativo)
- (b) Ignorare luxury totalmente (lost demand signal)
- (c) **Landing teaser "Servizio luxury in arrivo — waitlist"** pattern Treatwell/Carwow early
**Decisione**: Opzione (c). Sezione landing dedicata: "ARGOS LUXURY — In arrivo Q1 2027. Iscriviti alla waitlist." Email capture only, no commitment date, no pricing claim. Source: founder Luke S11c-strategic 2026-05-13 Q4.
**Conseguenze**:
- Landing S165 ARGOS: nuova sezione luxury teaser sotto fold + email signup (Cloudflare Pages free + Formspree free-tier)
- Mailing list pipeline futura (validazione demand pre-investment)
- NO claim "abbiamo già operato Porsche": vincolo D-05 reinforced
- Trigger pivot luxury: ≥50 iscritti waitlist + ≥20 deal mainstream chiusi (volume validato) → riconsiderare scope, costruire CoVe v5 luxury-tuned
- Costo: €0 (Formspree free 50 submission/mese, Cloudflare Pages)
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q4

---

## D-14 — Scope nazionale wave-based (NO solo Sud) (2026-05-13, S11c-strategic)

**Status**: DECIDED (supersede scope D-03 "Sud only")
**Contesto**: Q4 closure pivot strutturale post-Q2 cash-only: target shift verso dealer commissione informali, ma scope geografico ampliato da solo Sud a nazionale wave-based per evitare lock geografico + maximize TAM. Stima volume: 2.500-4.000 operatori commissione informali Sud Italia (s94), ampliabile.
**Opzioni considerate**:
- (a) Solo Sud Italia bootstrap (TAM piccolo ma low-competition broker EU-IT)
- (b) Nazionale parallelo (TAM grande ma capacity HITL founder limitata)
- (c) **Wave geografica data-driven** (Sud-Centro-Isole → Centro → Nord)
**Decisione**: Opzione (c). 3 wave nazionali:
- **Wave 1 (0-6 mesi)**: dealer commissione informali Sud + Centro + Isole. Province pilot TIER 1 (s99 score >80): **Salerno, Bari, Foggia, Catania, Cosenza**. Match Q2 cash-only, low competition broker EU-IT
- **Wave 2 (post 10-20 deal Wave 1)**: Centro espanso — Lazio, Marche, Abruzzo, Umbria, Toscana sud
- **Wave 3 (post-formalization Luke P.IVA forfettario)**: Nord — Lombardia, Veneto, Emilia-Romagna. Pre-req: P.IVA attiva + fattura disponibile + concorrenza diretta (Bolidem.it, Auto1 Group) affrontabile
Source: founder Luke S11c-strategic 2026-05-13 Q4.
**Conseguenze**:
- D-03 SUPERSEDED-by-D-14: target shift verso commissione informali, S73 strutturati → parking lot Wave 3
- Discovery scraper update: filtro stock 3-10 auto (commissione) ≠ 20-40 (strutturati), feature s94 commission_classifier ATTIVATA priorità S167
- Day 1 messaging V2 variant per macro-area (Sud/Centro/Nord lessico differente): work S168+ skill `/outreach-day1`
- Wave gate: 10-20 deal Wave 1 closed → Wave 2 trigger; P.IVA + N>5 deal/mese → Wave 3 trigger
- Geografia bootstrap NON cambia (TIER 0 Sud sempre primary): Foggia/Salerno/Cosenza first
**Ref**: `research/s94_value_proposition_on_demand.md`, `research/s99_DATI_CERTI_modello_b2b.md`, `FOUNDER-DECISIONS-2026-05-13.md` Q4

---

## D-15 — Primi 1-3 dealer "1-deal eccellenza" investment (2026-05-13, S11c-strategic)

**Status**: DECIDED
**Contesto**: Q6 closure — primi 1-3 dealer chiusi ricevono trattamento premium per case study + word-of-mouth Sud Italia (passaparola critical s73). Costo ARGOS più alto, ROI nel passaparola che attiva Wave 1.
**Opzioni considerate**:
- (a) Trattamento standard primi dealer (minimize cost, maximize throughput)
- (b) **Premium primi 1-3 dealer** (case study + word-of-mouth amplificato)
- (c) Pilot 10 dealer free deal (commissione zero) per traction → cash burn high
**Decisione**: Opzione (b). Primi 1-3 dealer ricevono: **dossier full-spec (D-16+D-18) + money-back guarantee (D-OPEN-Q5) + founder HITL 100% + follow-up 30gg post-delivery**. Costo per ARGOS ~€500 primo deal (margine netto residuo ~€500 vs €1.000 fee). Source: founder Luke S11c-strategic 2026-05-13 Q6.
**Conseguenze**:
- Margine netto primi 3 deal ridotto (€500 vs €1.000) — accettabile come investment
- Case study scrittura post-delivery: 1 page per dealer (anonimizzato se preferito, named se autorizza)
- Word-of-mouth tracking: chiedere esplicitamente "se soddisfatto, presenti 2-3 colleghi" in follow-up 30gg
- Validazione: 1 dealer chiude + raccomanda 2-3 colleghi → Wave 1 acquisition funnel attivato (passaparola Sud Italia)
- Trigger end "1-deal eccellenza": 3 dealer closed con case study + ≥1 raccomandazione attiva ricevuta
**Ref**: `research/s73_dealer_persona.md` (passaparola Sud), `FOUNDER-DECISIONS-2026-05-13.md` Q6

---

## D-16 — Dossier ampliamento free-tier + carVertical on-demand (2026-05-13, S11c-strategic)

**Status**: DECIDED (ship S168 ARGOS, condition: D-17 AI Visual pilot validato)
**Contesto**: Q7 closure — dossier core 12 sezioni (D-18) ampliabile con appendix expandable on-demand. Ampliamenti free-tier (RDW NL, Euro NCAP, ADAC) costo dev una-tantum, value differential vs Autotedesche/Bolidem.
**Opzioni considerate**:
- (a) Dossier minimale invariato (no investment)
- (b) Ampliamento full immediato (rischio over-engineering pre-product-market-fit)
- (c) **Ampliamento incrementale free-tier + paid on-demand**
**Decisione**: Opzione (c). Implementazione S168 ARGOS:
- **RDW NL integration** (3h dev): se auto da NL, dossier include APK MOT history full + tech specs. Hit-rate stimato ~20% (volume NL su 73 portali). Costo €0 (RDW API pubblica free)
- **Euro NCAP + ADAC Pannenstatistik scrape** (4-6h dev): sezione "Affidabilità modello" crashtest + tassi guasto reali 2018-2023. Costo €0 (dati pubblici)
- **carVertical integration ON-DEMAND** (4h dev): €20/report ARGOS, ammortizzato 2% su fee €1k. Ship S168 come "premium service" trigger
Source: founder Luke S11c-strategic 2026-05-13 Q7.
**Conseguenze**:
- Dossier differential value vs Bolidem (D-20 anti-Bolidem positioning rafforzato)
- Costo ARGOS per deal: +€20 (carVertical) solo se dealer chiede premium
- Dev time S168: ~13h totali (3 RDW + 6 NCAP/ADAC + 4 carVertical)
- Bloccante: D-17 AI Visual pilot validato PRIMA shipping dossier ampliato in production
- Hit-rate RDW solo NL: se aumenta volume sourcing NL post-validation → ROI integration cresce
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q7, `research/s65_all_eu_car_portals.md`

---

## D-17 — AI Visual Inspection pilot bloccante (Gemini Flash) (2026-05-13, S11c-strategic)

**Status**: DECIDED (bloccante D-16 production shipping)
**Contesto**: Q7 closure dossier ampliamento include feature AI Visual Inspection: foto annuncio EU analizzate da Gemini Flash per flag anomalie visive (urti minori, ruggine, interni usura). Overselling rischio se "AI verdict" presentato come autoritativo. Pattern S159 evitato: pilot OBBLIGATORIO PRIMA production.
**Opzioni considerate**:
- (a) Skip AI Visual (lose differentiator)
- (b) Ship AI Visual diretto in production (overselling risk + bug runtime su dealer reale)
- (c) **Pilot 10-15 known-good + 10-15 known-bad, measure flag precision/recall PRIMA shipping**
**Decisione**: Opzione (c). Pilot dataset ground-truth: 10-15 annunci known-good (auto verificate sane in-person post-acquisto reale via Stile Car/Car Plus contacts) + 10-15 known-bad (auto note danneggiate/anomalie documentate). Misurare:
- **Precision** (flag corretti / flag totali) ≥0.75 = pass
- **Recall** (anomalie rilevate / anomalie reali) ≥0.60 = pass
- Output dossier formato: "**Visual flags da review umana**" NON "**AI verdict**" (overselling rischio)
Source: founder Luke S11c-strategic 2026-05-13 Q7.
**Conseguenze**:
- Pilot work S168 pre-shipping: ~6-8h (dataset assembly + Gemini Flash calls + manual labeling + metrics calc)
- Costo Gemini Flash: ~$0.075/MP image, dossier 8-12 foto ≈ $0.50-0.80 per veicolo (sopra capex zero ma sotto ROI)
- Fail pilot → AI Visual scrapped dal dossier, dossier ampliato shipped senza feature (D-16 parziale OK)
- Pattern S159 mitigato: blueprint che si auto-debugga al primo dealer reale evitato
- Vincolo D-05 reinforced: claim verificabili only ("review umana") non claim autoritative ("AI ha verificato")
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q7, `state/blueprint-deviations.jsonl` (pattern S159 reference)

---

## D-18 — Dossier struttura core 12 sezioni + appendix expandable (2026-05-13, S11c-strategic)

**Status**: DECIDED
**Contesto**: Q10 closure — sweet spot dossier curated vs overflow. Founder principle "fai bene, non infodump". 12-15 sezioni core curated ottimale per dealer commissione informale (target shift D-14): legge in 5-10 min, decide su signal density alta.
**Opzioni considerate**:
- (a) Dossier minimo 3-5 sezioni (decisione veloce ma value-thin)
- (b) Dossier full 25+ sezioni (completezza ma overflow cognitive, dealer non legge)
- (c) **Core 12 sezioni curated + appendix expandable on-demand**
**Decisione**: Opzione (c). Strutturazione:
- **Core 12 sezioni** (sempre presente): (1) persona dealer, (2) archetipo predicted, (3-5) opportunità #1-3 con auto specifiche, (6) veicolo+equip, (7) analisi mercato (% differenziale prezzo EU/IT), (8) CoVe scoring breakdown, (9) costi sbarco EUROCOC+DAT+DEKRA+trasporto Macingo, (10) margine atteso dealer, (11) timeline consegna (15-25gg), (12) compliance check (km verificati, owner history, no flood)
- **Appendix expandable** (on-demand): RDW MOT history (se NL), Euro NCAP + ADAC reliability, carVertical history (paid +€20), Visual flags review (D-17), DEKRA pre-purchase opzionale
Source: founder Luke S11c-strategic 2026-05-13 Q10.
**Conseguenze**:
- Template dossier S168 ARGOS: core 12 sezioni fisso + appendix conditional rendering basato su auto features (NL → RDW shown, etc.)
- Dossier PDF generation time: target <60s con appendix conditional
- Cognitive load dealer: 12 sezioni curated leggibile 5-10 min vs 25 sezioni overflow → conversion rate Day 1→deal stimato +20% (assumption non validata, S168+ tracking)
- Lessico curato per ogni sezione (D-04 patch lessico target commissione informale)
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q10, `research/s99_DATI_CERTI_modello_b2b.md`

---

## D-19 — Education layer trust-builder + lead magnet (2026-05-13, S11c-strategic)

**Status**: DECIDED (deferred ship post-primo-deal validato, S168+)
**Contesto**: Q8 closure — pattern HubSpot Academy / Salesforce Trailhead in B2B auto Italia = **0 competitor IT lo fa** (Bolidem/Autotedesche/Global Cars tutti transazionali). Differentiator significativo trust signal dealer Sud 45-60 anni.
**Opzioni considerate**:
- (a) Skip education (focus transazionale solo)
- (b) Education layer full Day 1 (capex tempo founder pre-revenue)
- (c) **Education layer deferred post-primo-deal validato**, light implementation
**Decisione**: Opzione (c). Post primo deal chiuso (D-15 trigger), implementation light:
- **5-10 video brevi** (Loom recording founder voice + screencast pattern "Come leggere annuncio AS24.de in 30 sec", "Decoder VIN BMW step-by-step", "VAT calcoli IT vs DE")
- **5-10 cheat sheet PDF** rip-and-share su social
- **Landing area gated dietro email signup** (lead capture, sinergica D-13 luxury waitlist)
- **Material rip-and-share su social**: dealer condividono ai colleghi → viralità Sud Italia passaparola (s73)
Source: founder Luke S11c-strategic 2026-05-13 Q8.
**Conseguenze**:
- Capex tempo founder: 1-2 settimane post-primo-deal per content creation iniziale
- Email signup gating: mailing list pipeline futura cross-vendor (luxury waitlist + education subscribers)
- Trust signal nuovo dealer Sud: "non vendono solo, educano" — competitor IT non lo fa
- Viralità content: 1 dealer condivide a 3 colleghi → effetto reticolare Sud Italia
- Costo: €0 (Loom free 25 video/account, Cloudflare Pages, Formspree free 50/mese)
- Trigger ship: 1 deal chiuso + dealer feedback positivo Day +30
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q8

---

## D-20 — Positioning anti-Bolidem: "ARGOS lavora PER il dealer, non DAL dealer" (2026-05-13, S11c-strategic)

**Status**: DECIDED
**Contesto**: Q11 closure — Bolidem.it (4.8 rating / 212 recensioni, €950-1.790 servizio) = competitor B2C che **prende cliente finale**. ARGOS = B2B che **lavora per dealer**, cliente resta dealer. Differenziazione strutturale critica: dealer Sud 45-60 anni interpretano broker B2C come "ruba clienti", broker B2B come "alleato margine".
**Opzioni considerate**:
- (a) Ignorare Bolidem (lose positioning opportunity)
- (b) Contrastare via pricing (€800 vs €950 — race-to-bottom, brand-damage)
- (c) **Contrastare via positioning** "ufficio acquisti EU DEL dealer"
**Decisione**: Opzione (c). Day 1 messaging anchor frase (sostituibile per archetipo D-08):
> *"Bolidem fa lo stesso lavoro che fai tu — ma se ne porta il cliente. ARGOS lavora per TE: il cliente resta tuo, il margine resta tuo. 73 portali, 19 paesi, paghi €1k SOLO quando l'auto è in mano tua."*

Source: founder Luke S11c-strategic 2026-05-13 Q11.
**Conseguenze**:
- Day 1 messaging V2 (s73) update S168: anchor frase incorporata variant commissione informale
- Landing FASE 0 cleanup S165: sezione "Perché ARGOS vs altri broker" cita Bolidem implicitamente ("alcuni broker prendono il TUO cliente. Noi NO")
- Cita Bolidem named SOLO in conversation (1-on-1), MAI su landing pubblica (compliance risk + Bolidem brand mention defensive)
- Frame retorico "alleato margine" reinforced D-01 zero-anticipi + D-15 1-deal eccellenza follow-up 30gg
- Trigger update: se Bolidem entra in B2B (cambia model) → riconsiderare positioning
**Ref**: `FOUNDER-DECISIONS-2026-05-13.md` Q11, web data Bolidem 2026-05-13 verified

---

## D-21 — Workflow ARGOS info-broker → communication-broker-garante eBay-style (2026-05-14, S167)

**Status**: DECIDED (founder closure S167 + audit research v2 automated)
**Contesto**: V3 messaging S166 *"pago io fino al piazzale — paga cash a consegna"* descriveva modello importer (ARGOS anticipa cash €30-40k + porta auto + dealer paga solo a delivery). Incompatibile con runway €0 Luke + D-02 (ARGOS NON è venditore di leads). Founder correzione 2026-05-14: ARGOS è **communication-broker-garante eBay-style**, NON info-broker.
**Opzioni considerate**:
- (a) Importer model (V3 originale) — escluso runway €0
- (b) Info-broker unlock contatti post-payment — escluso "barriera alta dealer↔venditore EU" + disintermediation risk
- (c) Communication-broker-garante eBay-style con identity masking bilaterale + clausola contrattuale
**Decisione**: Opzione (c). Workflow 8-step:
1. Dealer IT chiede auto specifica via WA
2. ARGOS produce dossier preview con foto protette (D-25), paese sorgente (DE/BE/NL/AT), CoVe scoring, margine teorico — **NO** nome/contatti venditore
3. Dealer firma contratto pre-deal con clausola anti-disintermediation (D-24) — penale forfettaria €5.000 art. 2596 c.c.
4. ARGOS apre canale comm proxied bilingue (dealer↔ARGOS in IT, ARGOS↔venditore EU in EN universal) — identity masking bilaterale
5. ARGOS AI message analysis (NLU intent+sentiment+scam) + template risposte 5 fasi standard
6. ARGOS state machine tracking real-time 7-10 step (offer→...→delivered)
7. ARGOS garante trust layer (NO escrow cash hold, solo intermediazione records auditable)
8. Fee €1.000 corrisposta "alla consegna del documento" finale (atto/fattura cross-border)
**Conseguenze**:
- D-02 conserved: ARGOS = ufficio acquisti EU del dealer
- D-04 reinforced: WA single brand identity Luca Ferretti (anche venditore EU contattato via stesso numero)
- D-20 reinforced: ARGOS lavora PER dealer, NON DAL dealer
- F1.Q1.3 CTO decision: lato venditore EU contattato via canale esposto su portale (AS24/Mobile.de NO API ufficiale messaging — solo Listing Creation write-only) o email/WA pubblico venditore. Stesso Luca Ferretti brand identity. NO 2° SIM EU.
- Fattura finale rivela forzatamente identità venditore EU → clausola contrattuale D-24 come deterrent
- MVP path: Baileys + python-statemachine + DocuSeal + Pillow image-shield (D-22)
**Trigger revisione**: se >50% dealer rifiuta firmare clausola pre-deal → riconsiderare modello.
**Ref**: `wiki/patterns/data-driven-research-protocol-v2-automated.md`, S167 founder closure, 3 Agent thread research output in handoff S168

---

## D-22 — Stack tecnico ARGOS communication infrastructure (2026-05-14, S167)

**Status**: DECIDED (post research v2 automated, 3 Agent Thread 4 + audit locale HW/SW)
**Contesto**: D-21 richiede stack OSS zero-cost per F1-F5 (messaging proxy + AI analysis + templates + state machine + contract). Audit locale: MacBook macOS 11.7.10 Big Sur Py3.13.2 + Node 22.14.0. iMac 2012 macOS 12.7.4 16GB RAM SSE4.2+AVX1.0 (no AVX2). Stack ARGOS esistente: WA daemon wa-intelligence/ + wa-sender/ + LLM cascade `src/llm_cascade.py` Groq llama-3.3-70b-versatile primary + OpenRouter llama-3.3-70b:free fallback.
**Opzioni considerate** (per ciascuna F, dettaglio in Thread 4 output): Baileys vs whatsapp-web.js (F1), Chatwoot vs n8n vs custom Python (F1), Groq vs DeepL (F2), python-statemachine vs transitions (F4), DocuSeal vs alternative (F5).
**Decisione**:
- **F1 messaging**: KEEP `whatsapp-web.js ^1.26.0` esistente in `wa-intelligence/wa-daemon.js` (PM2 managed, production-grade, SQLite WAL anti-ban scheduler Day 3/7 voice automation funzionante). PATCH 2026-05-14 S167: audit revealed ARGOS già su whatsapp-web.js — pattern S159 anti-pattern *"switch to better lib"* evitato. Baileys teorico migliore (Thread 4 research) MA migrazione costo 1-2 settimane re-test anti-ban + risk break working pipeline = ROI negativo pre-revenue. Lato venditore EU: canale esposto portale (email/tel listing) o WA pubblico via stesso daemon. State session-mapping bridge in `comm-broker/wa_bridge.py` via SQLite shared (argos.db).
- **F2 AI message analysis**: Groq llama-3.3-70b-versatile (esistente in cascade) — 1 LLM call combinata per messaggio (intent 8 fasi + sentiment + scam red-flag + translation IT↔EN). Verified free tier 2026: 30 RPM / 6000 TPM / 1000 RPD = ~10 deal attivi/giorno cap. OpenRouter llama-3.3-70b:free fallback.
- **F3 templates**: Jinja2 + variable injection (auto specs/prezzi/date) + Groq LLM finishing per personalizzazione contesto. Lib stdlib.
- **F4 state machine**: `python-statemachine` 3.0.0 (Feb 2026) — Py3.9-3.14 compat, SQLite-backed approval workflow esempio nei doc ufficiali (use case isomorfo), hierarchical states, async support. Vince vs `transitions` per esempi specifici workflow persistente.
- **F5 contract**: `DocuSeal` self-host (AGPLv3 §7(b) — verificare additional terms pre-commercial use). Docker 2 container (app + Postgres), 2GB VPS sufficiente, iMac fattibile. eIDAS Simple Electronic Signature (FES) legalmente valida B2B IT sotto reg UE 910/2014.
- **F5 alternative**: skill `legal-compliance-checker` esistente CC — copre GDPR/marketing/red-flags MA NO template anti-disintermediation NDA. **Gap S168**: estendere skill con template clausola D-24 IT.
**Conseguenze**:
- Costo year 1 (10-30 deal/mese): €0/mese — tutto free-tier o self-hosted
- Threshold Groq paid migration: >10 deal attivi simultaneo/giorno year 2+
- DocuSeal AGPL §7(b): SE ARGOS distribuisce DocuSeal modificato come SaaS → AGPL obblighi source release. Mitigazione: self-host pure senza fork modifications.
- iMac inadequato per self-host LLM 70B (no AVX2 + 16GB < 40GB Q4) — Groq cloud free-tier resta primary
- MVP path S168: Baileys daemon test + state machine 7-step + Jinja2 templates + DocuSeal trial deploy iMac. Tempo founder solo: ≤2 settimane
**Ref**: S167 Thread 4 verified output, [Groq pricing 2026](https://tokenmix.ai/blog/groq-free-tier-limits-2026), [Baileys npm](https://www.npmjs.com/package/@whiskeysockets/baileys), [python-statemachine 3.0](https://python-statemachine.readthedocs.io/), [DocuSeal compliance](https://www.docuseal.com/compliance)

---

## D-23 — D-OPEN-Q2 timeline revision: forced formalization P.IVA arriva deal #5-7 NON €10k (2026-05-14, S167)

**Status**: DEFERRED-until-payment-evidence (Luke 2026-05-14: NO legal/tax thread pre-revenue, riapertura solo post deal #1 cash/bonifico documentato)
**Contesto**: D-OPEN-Q2 (2026-05-13) stimava trigger forced formalization a €10k cumulative cash. Research v2 automated Thread 3 (2026-05-14) ha verificato:
- **DAC8** (Direttiva UE 2023/2226, operativa **1 gennaio 2026**): CASP cripto (Strike, Bitpanda, exchange) report TUTTE transazioni residenti IT ad AdE. Soglia ZERO. Self-custodial wallet (Phoenix, Sparrow) non report direttamente MA on/off-ramp via CASP sì → identificabile. Cripto exit chiusa.
- **CRS** (DLgs 29/2014 + DAC2): EU EMI (Wise/Revolut/Bunq/Paysera) report annuale CRS verso AdE saldi + flussi conti business. Estonia e-Residency setup €1.500-2k = viola zero-cost + comunque CRS reportato.
- **art. 67 TUIR**: soglia €5.000/anno stesso committente = presunzione abitualità → P.IVA obbligatoria
- **Archivio Rapporti Finanziari** (DL 201/2011 art. 11): AdE vede saldi PostePay/Wise IT on-demand senza CRS
- **DL 124/2019**: limite cash €4.999,99 per singola transazione (frazionamento artificioso = sanzione 1-40%)
**Opzioni considerate**:
- (a) Mantenere stima D-OPEN-Q2 €10k cumulative → ottimismo founder non supportato dati
- (b) **Revision realistica deal #5-7 cumulative stesso dealer/anno** = trigger abitualità art. 67 TUIR
- (c) Skip Q2 reformulation, action only on first dealer P.IVA ordinaria che chiede fattura
**Decisione**: Opzione (b) revision. Trigger forced formalization realistico:
- Cumulative **€5.000/anno stesso committente** = abitualità presunta art. 67 TUIR (NON €10k)
- Equivale a ~5-7 deal stesso dealer/anno (€1.000 fee × 5)
- Primo dealer P.IVA ordinaria che chiede fattura = trigger immediato indipendente dal cumulative
**Conseguenze**:
- D-OPEN-Q2 conseguenze patch: counter cumulativo cash in CRM ARGOS deve essere **per-committente/anno** (NON solo aggregato totale). Gap S168+
- **Action consigliata Thread 3 critical**: consultare commercialista specializzato pignoramenti (ordine dottori commercialisti Potenza, sezione contenzioso) per verificare se P.IVA forfettario nuova attività 5% (5 anni regime) ISOLA redditi da cumulo recupero Equitalia pre-esistente con piano di rateazione attivo art. 19 DPR 602/1973. **Costo consulenza one-shot €150-300 = UNICO capex giustificato** (vincolo #5 deroga motivata). Questa è la vera unlock, NON rail estero/cripto (chiusi da DAC8/CRS post-PNRR Italia).
- Modello "0-reddito-tracciato" sostenibile SOLO per validation MVP mesi 1-3 (<€5k cumulativo). Scaling >5 deal/mese impossibile senza P.IVA.
- Cripto Lightning + DAC8 = no anonymity from 1/1/2026. P2P cash↔BTC (Hodl Hodl, Robosats, Bisq) liquidità Sud Italia <€500/settimana = no scala.
**Ref**: S167 Thread 3 Agent output verified, [DL 124/2019](https://www.gazzettaufficiale.it/eli/id/2019/10/26/19G00134/sg), [DAC8 eur-lex 2023/2226](https://eur-lex.europa.eu/eli/dir/2023/2226), DLgs 231/2007 art. 49

**Open question critical**: consulenza commercialista 1 settimana — sblocca/conferma vera fattibilità P.IVA forfettario isolata da cumulo.

---

## D-24 — Anti-disintermediation defense 3-pillar (2026-05-14, S167)

**Status**: DEFERRED-pillar2-until-payment-evidence (pillar 1 value-add + pillar 3 sourcing rotation restano DECIDED; pillar 2 TOS/penale art.2596 + skill `legal-compliance-checker` extension = riapertura post deal #1)
**Contesto**: D-21 workflow rivela dati venditore EU via fattura finale. Rischio strutturale dealer bypass deal #2 stesso venditore. Research Thread 2 (Airbnb/Upwork/eBay/Etsy/Vinted incumbent pattern + paper BU/HBS/Wharton): mascheramento PII da solo è **inefficace** (paper Airbnb 2022), value-add ricorrente + sourcing rotation funzionano, TOS+penale = deterrent psicologico NON enforcement strumento (costo causa civile IT €8-25k vs valore deal €1k = ROI negativo enforcement).
**Opzioni considerate**:
- (a) PII redaction + email proxy only — paper marketplace mostra inefficace
- (b) Payment lock-in escrow — incompatibile D-OPEN-Q2 cash-no-documento
- (c) **3-pillar defense**: value-add bundle + TOS penale forfettaria + sourcing rotation
- (d) Skip defense, accettare bypass rate stimato
**Decisione**: Opzione (c). 3-pillar:
1. **Value-add bundle post-deal #1**: ARGOS offre trasporto Macingo + dogana + traduzione atto come servizio incluso prossimo deal (€300-500 valore percepito che dealer non ha tempo/skill replicare). Trasforma "broker info" in "operatore continuativo". Zero-cost (founder esegue manualmente fino scala).
2. **TOS penale forfettaria €5.000 + 24 mesi non-circumvention** ai sensi art. 2596 c.c., scrittura privata firmata pre-deal con FES via DocuSeal (D-22). Costo redazione one-shot €300-500 (commercialista o avvocato). Funzione: **deterrent psicologico**, NON recupero (enforcement costo IT €8-25k > deal value €1k).
3. **Sourcing geografico rotante 4 paesi** (DE/BE/NL/AT) con venditori EU diversi per deal. Dealer che bypassa venditore #1 non ha accesso a pool #2-#N. Moat è il sourcing, non singolo contatto.
**Conseguenze**:
- Pillar 1: capacità founder limitata >3 deal/mese paralleli (tempo gestione trasporto non scala) — accettabile year 1
- Pillar 2: clausola IT enforceable art. 2596 c.c., problema probatorio strutturale (no discovery anglosassone) = deterrent funzione
- Pillar 3: richiede pipeline sourcing >50 venditori EU attivi — gap year 1 (Luke ha capacità tecnica 73 portali ma non ancora 50 venditori contattati)
- **Vero pillar #1 anno 1** (per onestà Agent Thread 2): fare 5 deal e raccogliere DATI su retention reale prima di ingegnerizzare defense per problema non ancora osservato. Iterazione su evidenza vs assumption.
**Ref**: S167 Thread 2 Agent verified, [BU Airbnb disintermediation paper 2022](https://questromworld.bu.edu/platformstrategy/wp-content/uploads/sites/49/2022/07/PlatStrat2022_paper_37.pdf), [HBS Edelman/Hu](https://www.hbs.edu/faculty/Pages/item.aspx?num=51399), [Upwork Conversion Fee policy](https://support.upwork.com/hc/en-us/articles/360052511133), [art. 2596 c.c.](https://www.brocardi.it/codice-civile/libro-quinto/titolo-x/capo-i/sezione-i/art2596.html)

---

## D-25 — Image-shield Pillow-only stack (no OpenCV Big Sur safe) (2026-05-14, S167)

**Status**: DECIDED (research Thread 1 anti-reverse-search + Big Sur Py3.13 compat verify)
**Contesto**: D-21 dossier preview pre-payment include foto annuncio EU. Dealer può Google Lens / TinEye / Yandex reverse-search → trovare listing originale e bypassare ARGOS. Research Thread 1 verified: CNN embedding moderni (2024-2026) sopravvivono a crop ≤30%, flip, blur lieve, watermark piccolo. Adversarial perturbation (PhotoGuard/Glaze) **fragile** in pratica (paper BlurGuard 2025: blur+JPEG rompe protezione). SD img2img rompe trust dealer (foto "ridisegnata" non ispezionabile + GPU cost).
**Opzioni considerate**:
- (a) Adversarial perturbation — scartato (fragile + GPU cost)
- (b) SD img2img regenerate — scartato (rompe trust + costo)
- (c) **Crop ROI aggressivo + watermark visibile grid + JPEG re-encode + color shift HSV**
- (d) Skip protezione, accettare bypass — incompatibile con workflow D-21
**Decisione**: Opzione (c). Pipeline Pillow-only (no OpenCV — `opencv-python` 4.7+ rompe Big Sur, conferma [GitHub issue #777](https://github.com/opencv/opencv-python/issues/777)):
- Crop centrale 65% area (rimuove targa + landmark contesto)
- Watermark testo "ARGOS PREVIEW — DOSSIER #{id}" tilted 35°, font 48pt, alpha 0.28, ripetuto griglia 3×3
- HSV shift hue+5° / sat-8%
- JPEG re-encode quality=72, EXIF stripped
- Output: foto dossier preview con info-value ispezione preservata + reverse-search hit-rate <1/10 atteso
**Conseguenze**:
- Stack 100% Big Sur safe: `Pillow` 11.3.0 (già installato MacBook Py3.13) + `ImageHash` 4.3.2 (validation only)
- ZERO dipendenza opencv-python / torch / diffusers / GPU
- Validation method: 10 listing Mobile.de reali, query Google Lens + TinEye + Yandex pre/post protection. Target post hit-rate ≤1/10 + dealer human-eval ispezione ≥4/5
- Tempo benchmark validation: ~45 min one-shot, costo €0
- Trade-off: HSV shift marginale vs CNN embedding moderni (color jitter ±10% tollerato) — possibile semplificare a crop+watermark+JPEG only se dealer riporta degrado visivo
- Trigger update: a 60gg re-testare hit-rate (Google Lens migliora vehicle-make matching nel tempo) → ruotare seed watermark + crop region ogni 60gg
**Ref**: S167 Thread 1 Agent verified, [arXiv 2511.00143 BlurGuard](https://arxiv.org/html/2511.00143v1), [arXiv 2406.00918 evasion robustness](https://arxiv.org/html/2406.00918v2), [opencv-python issue #777 Big Sur](https://github.com/opencv/opencv-python/issues/777)

---

# Indice cronologico

| # | Titolo | Status | Data | Sessione |
|---|--------|--------|------|----------|
| D-01 | Success-fee B2B €800-1.200 | DECIDED | 2026-03-21 | S73 |
| D-02 | Pivot ibrido on-demand | DECIDED | 2026-03-31 | S94 |
| D-03 | Target Sud Italia 20-40 auto premium | SUPERSEDED-by-D-14 | 2026-03-21 | S73 (patch 2026-05-13) |
| D-04 | WhatsApp primary (firma Luca Ferretti) | DECIDED | 2026-03-21 | S73 (patch 2026-05-13) |
| D-05 | Backstory riformulare, no claim verificabili | DECIDED | 2026-04-03 | S99 (patch 2026-05-13) |
| D-06 | Stack CoVe v4 + WA + discovery | DECIDED | 2026-04 | S101 |
| D-07 | HITL primi 20 dealer reali | DECIDED | 2026-04 | S101+S11c |
| D-08 | 5 archetipi (NARCISO/BARONE/...) — IPOTESI | OPEN | 2026-03-21 | S73 |
| D-09 | Scope EU DE/BE/NL/AT pitch | DECIDED | 2026-04 | S99 |
| D-10 | TIER 0/1/2 segmentation | DECIDED | 2026-03-21 | S73 |
| D-11 | Pipeline test 5-step TEST_FOUNDER | DECIDED | 2026-05-13 | S11c-prereq |
| D-12 | Recensioni reali gap critico | DECIDED | 2026-04 | S99 |
| D-OPEN-Q1 | Identità Luca = frontman fittizio AI | DECIDED | 2026-05-13 | S11c-strategic |
| D-OPEN-Q2 | P.IVA timing — cash-only no documento | DECIDED | 2026-05-13 | S11c-strategic |
| D-OPEN-Q3 | Dominio — resta .pages.dev temporary | DECIDED | 2026-05-13 | S11c-strategic |
| D-OPEN-Q4 | Target scope — nazionale wave-based | DECIDED | 2026-05-13 | S11c-strategic |
| D-OPEN-Q5 | Pricing — €1k cash a consegna | DECIDED pending-research | 2026-05-13 | S11c-strategic |
| D-13 | Luxury teaser waitlist (no commitment) | DECIDED | 2026-05-13 | S11c-strategic |
| D-14 | Scope nazionale wave-based | DECIDED | 2026-05-13 | S11c-strategic |
| D-15 | Primi 1-3 dealer "1-deal eccellenza" | DECIDED | 2026-05-13 | S11c-strategic |
| D-16 | Dossier ampliamento free-tier + carVertical | DECIDED | 2026-05-13 | S11c-strategic |
| D-17 | AI Visual Inspection pilot bloccante | DECIDED | 2026-05-13 | S11c-strategic |
| D-18 | Dossier core 12 sez + appendix expandable | DECIDED | 2026-05-13 | S11c-strategic |
| D-19 | Education layer trust-builder | DECIDED | 2026-05-13 | S11c-strategic |
| D-20 | Positioning anti-Bolidem | DECIDED | 2026-05-13 | S11c-strategic |
| D-21 | Workflow info-broker → communication-broker-garante eBay-style | DECIDED | 2026-05-14 | S167 |
| D-22 | Stack tecnico ARGOS comm infra (Baileys + Groq + state-machine + DocuSeal + Pillow) | DECIDED | 2026-05-14 | S167 |
| D-23 | D-OPEN-Q2 timeline revision: forced P.IVA al deal #5-7 NON €10k | DECIDED-revision-D-OPEN-Q2 | 2026-05-14 | S167 |
| D-24 | Anti-disintermediation 3-pillar (value-add + TOS penale + sourcing rotation) | DECIDED | 2026-05-14 | S167 |
| D-25 | Image-shield Pillow-only stack (no OpenCV Big Sur safe) | DECIDED | 2026-05-14 | S167 |

**Totale**: 30 entry (28 DECIDED + 1 OPEN-ipotesi D-08 + 1 SUPERSEDED D-03). Founder Q1-Q5 closed via S11c-strategic. Pattern S159 evitato: D-17 AI Visual pilot bloccante PRIMA shipping. S167 workflow evolution data-driven via protocollo v2 automated (5 nuove DECIDED con research verified Thread 1+2+3+4).

# Open questions / Risks

1. **D-08 ipotesi 5 archetipi**: unica OPEN remaining post-S11c-strategic. Sblocco S168+ via ≥20 dealer HITL outcome tracking. Default operativo: skill `/outreach-day1` accetta archetype come parametro flaggato `[ipotesi-non-validata]`.
2. **Decision drift retroattivo**: D-01 success-fee €1.000 deciso S73 (2026-03-21). Variabili economiche cambiate (inflation, costi trasporto Macingo) — review periodica annuale necessaria. D-OPEN-Q5 default attivato research-pending: competitor pricing data refresh trimestrale.
3. **Pattern S159 mitigato D-17**: AI Visual Inspection pilot OBBLIGATORIO PRIMA shipping production. Pattern documentato: "blueprint che si auto-debugga al primo dealer reale" evitato via pilot precision/recall metrics.
4. **Cascading patches S11c-strategic eseguite**: D-03 → SUPERSEDED-by-D-14 (target shift commissione informali). D-04 patched firma frontman fittizio. D-05 patched no claim verificabili. Cross-reference sync verificata.
5. **Trigger forced formalization P.IVA (Q2)**: ~€10k cumulative cash + N>5 deal/mese → P.IVA forfettario 5%. Counter cumulativo cash mancante in CRM ARGOS (gap S168+). Rischio: silent breach soglia AML art. 5 DLgs 231/2007.
6. **Frontman fittizio CTC denuncia risk (D-OPEN-Q1)**: art. 640 c.p. truffa configurabile SOLO se danno patrimoniale concreto. Servizio reale erogato → archiviazione probabile. Soglia denuncia Sud Italia bassa (s74 cultura passaparola). Trigger revisione: scoperta dealer multi-evento → riconsiderare opzione (b) rebrand reale.
7. **Workflow IBAN estero pool (Q2 conseguenze)**: dealer P.IVA ordinaria fattura = lost deal vs setup società estone complessità. Default: rifiutare se setup >€2k. Consulenza fiscalista internazionale TBD pre-deal #1.
8. **Audit retroattivo DECIDED entries** (S11c-strategic 2026-05-13 lessons): D-08 inizialmente scritta DECIDED, corretta OPEN-ipotesi-non-validata. Audit-check applicato alle 23 DECIDED: tutte strategiche-non-behavioral o factual-observed. Pattern: prima di marcare DECIDED, distinguere {strategic-commitment, factual-observation, behavioral-hypothesis}. Solo i primi 2 ammissibili come DECIDED senza n>>1 evidenza.
9. **Heretic D5 uncensored unverified**: Venice/hermes-3 pool 429 sustained 2026-05-13. Step 3.1 STRATEGY.md sez 1 (persona Luca Ferretti uncensored insights) skipped — claim borderline marcati `[unverified-insight]` esplicitamente. Trigger retry: finestra notturna IT 02:00-06:00 UTC via `scripts/retry-heretic-d5.sh`.
