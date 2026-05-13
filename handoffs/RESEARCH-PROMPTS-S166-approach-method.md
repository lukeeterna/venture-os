# Research prompts — Metodo primo contatto dealer auto Italia (S166 protocollo VOS)

> **Data**: 2026-05-13
> **Obiettivo**: derivare dai DATI (non inventare) il metodo di primo contatto via WhatsApp efficace per dealer auto in Italia. Scope **nazionale**, NON solo Sud.
> **Contesto**: ARGOS Automotive, broker B2B vehicle scouting EU→IT, frontman commerciale "Luca Ferretti", zero recensioni, fase bootstrap, target tipologia dealer (3-10 auto rotation family business, OR 20-40 auto strutturati, OR altro) **da DERIVARE dai dati di ricerca**, NON assumere a priori.
> **Audit bias evitato**: research interna S73 ARGOS era tarata "Sud Italia 20-40 auto premium" perché founder vive in Basilicata. Bias NON data-driven. Wave 1 D-14 mantenuto bias Sud. **Questo prompt set audita il bias: lasciare ai DATI dire dove sta il valore €€€ per ARGOS €1k success-fee.**
> **Output atteso da ogni tool**: dati + pattern + fonti citate (no opinioni generiche). Poi sintetizzo io.
> **Vincolo**: nessuna disclosure di "frontman fittizio AI", "cash-only no documento", "P.IVA inesistente" — questi sono interni ARGOS, fuori dai prompt esterni.
> **Vincolo #5 zero-cost**: SOLO tool free-tier. Niente Perplexity Pro / Claude Pro / ChatGPT Plus / Gemini Advanced.

## Tool free-tier disponibili (verificati 2026-05-13)

| Tool | Free-tier reale | Strength |
|------|-----------------|----------|
| **Google AI Studio (Gemini 2.5 Pro)** | aistudio.google.com — free dev, 1M context, Search grounding | Search + synthesis 1M context |
| **NotebookLM** | notebooklm.google.com — free completo Google | Source-grounded Q&A su upload |
| **Claude.ai** | claude.ai — Sonnet free con limite ~5-10 msg/giorno | Ragionamento strutturale |
| **ChatGPT** | chatgpt.com — GPT-5 limitato + GPT-4o-mini illimitato | Cross-validation prospettiva |
| **Google/DDG search** | manuale browser | Ground truth dealer Reddit/forum |

**Skip se non accesso**: Claude.ai free se quota esaurita → ripeti prompt Tool 2 su Gemini AI Studio con Search OFF.

---

## Tool 1 — Google AI Studio (Gemini 2.5 Pro + Google Search grounding) — FREE

**Strength**: search web con grounding Google integrato, citation, 1M context, free-tier sviluppatore. Sostituto free di Perplexity Pro.

**Setup**:
1. Vai su https://aistudio.google.com (login con Google account)
2. Apri nuovo prompt, modello **Gemini 2.5 Pro**
3. Nel pannello a destra **abilita Tool "Grounding with Google Search"** (toggle on)
4. Imposta temperature 0.3 (factual mode)

**Copia in Google AI Studio**:

```
Sto cercando dati empirici 2024-2026 su pattern di primo contatto B2B via WhatsApp Business in Italia, specifico settore automotive.

Contesto operativo:
- Mittente: consulente/broker che fa scouting auto premium dai mercati europei (Germania, Olanda, Belgio, Austria) per concessionari italiani
- Destinatario: titolare concessionario auto family business, 3-10 auto in stock rotation, **Italia intera (Nord, Centro, Sud, Isole — DATI decidono dove cluster di valore sta)**, età 45-60 anni
- Canale: WhatsApp Business, mai contatto precedente, mittente sconosciuto al destinatario
- Goal: aprire relazione commerciale, non vendere subito

Domande specifiche:

**0. Mappatura geografica del valore (PRIORITÀ #1, audit bias)**: dove sono concentrati in Italia 2024-2026 i dealer auto premium con margini operativi sufficienti per pagare €1k success-fee per veicolo importato? Distribuzione Nord (Lombardia/Veneto/Emilia/Piemonte) vs Centro (Toscana/Lazio/Marche) vs Sud+Isole (Campania/Puglia/Sicilia/Calabria). Dati ACI, ISTAT, Federauto, UNRAE 2024-2026 su numero concessionari premium per regione, fatturato medio, marginalità.

1. Quali pattern di "primo messaggio WhatsApp" funzionano vs falliscono in B2B services italiani 2024-2026? Cerca case study, articoli specializzati, post LinkedIn con metriche di conversion rate.
2. Conversion rate medio cold WhatsApp B2B Italia: dati pubblicati 2024-2026 (HubSpot, Salesforce, agenzie italiane CRM).
3. Differenza efficacia "messaggio con offerta specifica" (es. veicolo specifico) vs "messaggio relazionale" (qualifying + insight value-first) in cold WA B2B. Studi o A/B test pubblici.
4. Cosa fa percepire "spam" un primo messaggio WA a un imprenditore italiano family business Italia (tutte le aree)? Pattern documentati di rifiuto immediato (sociologia commerciale, etnografia trade Italia (tutte le aree)).
5. Trust signals che bypassano la diffidenza al primo contatto quando il mittente è sconosciuto: referenze, education content, soft introduction, qualifying questions. Quali funzionano in cultura commerciale Italia (tutte le aree) 2024-2026.
6. Broker auto EU-IT operativi 2024-2026: quali si pubblicizzano apertamente, come si presentano al primo contatto. Esempi specifici named entities (Bolidem.it, Autotedesche.it, Global Cars Importazioni, Michael-AutoGermania, altri).

Output strutturato richiesto:
- Per ogni domanda: 3-5 bullet point data-driven con fonti URL
- Lista pattern "FUNZIONA" + lista pattern "FALLISCE" con evidence
- Citation precise (link articolo, autore, data)
- Se mancano dati 2024-2026 per Italia specifico, segnala lacuna esplicitamente — NON estrapolare da US/UK senza disclaimer.
```

---

## Tool 2 — Claude.ai FREE (Sonnet, ragionamento strutturale)

**Strength**: ragionamento strutturale, framing strategico, critica metodologica. Per derivare framework dai principi, non da search.

**Setup**: claude.ai free-tier (5-10 messaggi/giorno limite). Se non hai accesso → skip questo tool, sostituisci con Gemini 2.5 Pro (AI Studio, Tool 1) ripetendo il prompt con Search disabilitato + temperature 0.5 per ragionamento.

**Copia in Claude.ai (conversazione nuova, modello default)**:

```
Analisi strategica B2B outreach. Aiutami a derivare il METODO di primo contatto, non a scrivere un messaggio.

Setup:
- Servizio B2B: vehicle sourcing EU→IT per concessionari italiani (success-fee €1k a consegna, zero anticipi, money-back DEKRA)
- Target: dealer family business Italia (tutte le aree) 3-10 auto stock, cercano su commissione del cliente finale (cliente chiede X, dealer cerca su AS24/Mobile.de), 45-60 anni, fatturano poco (commissione informale), cash margins, WhatsApp è canale primario
- Posizione del mittente: nuovo nel mercato, zero recensioni Google, zero referenze concrete, frontman commerciale (consulente che è il volto del servizio)
- Canale: WhatsApp Business, primo contatto cold
- Cultura: Italia intera. Differenze regionali Nord/Centro/Sud da considerare data-driven, non assumere passaparola Sud-style universale. Dealer Nord (Lombardia/Veneto/Emilia) tipicamente più capitalizzati, formalizzati P.IVA ordinaria, business-mindset transazionale. Dealer Sud tipicamente passaparola, cash, informalità. Dove sta il valore €€€ per ARGOS €1k success-fee deve emergere DAI DATI di ricerca.

Domande:

**0. Segmentazione target ottimale (audit bias)**: dato il setup (success-fee €1k, zero anticipi, money-back DEKRA, frontman commerciale solo, zero referenze), qual è il tipo di dealer auto italiano con **maggiore probabilità di accettare** il servizio E con margini operativi sufficienti a pagare €1k? Considera matrice: (a) dealer 3-10 auto family business commissione informale vs (b) dealer 20-40 auto strutturati premium P.IVA ordinaria vs (c) gruppi multi-brand 50+ auto. Per ogni segmento: pro/contro accettazione + capacità €1k + concentrazione geografica nazionale Italia (Nord/Centro/Sud). Argomenta con principi di buying psychology B2B, NON assumere "Sud Italia commissione informale" come target ottimale — quello è ipotesi founder bias da auditare data-driven.

1. **Push vs Pull vs Relationship-first vs Value-first**: confronta i 4 frame di primo contatto applicati a questo setup. Quale ha maggior probabilità di non finire in blocchi/ignorato? Argomenta con principi di buying psychology B2B, non con esempi.
2. **Problema strutturale**: dealer commissione informale lavorano "su richiesta cliente". Inviare auto specifica al primo contatto = push obsoleto. Qual è l'asset di valore che PUÒ essere portato al primo contatto SENZA chiedere niente al dealer (no qualifying spinto, no auto specifica, no pitch servizio)?
3. **Trust building sequence**: derivare la sequenza ottimale primi 3 touchpoint (Day 1, Day 3, Day 7) per un mittente sconosciuto che vuole costruire relazione asincrona via WA — coerente con cultura Italia (tutte le aree). Sequenza per principi, non per messaggi.
4. **Anti-pattern**: quali frame di primo contatto AMPLIFICANO il rischio "spam" in questo setup? Riconoscili come pattern strutturali (non come errori cosmetici).
5. **Education layer come Trojan-horse**: pattern HubSpot Academy/Salesforce Trailhead funziona se LTV alto (subscription). ARGOS è transazionale (€1k success-fee). Education layer ha senso in transazionale B2B? Argomenta i trade-off.
6. **Critica al frame "porta sempre un'auto specifica"**: questo era il pattern S73 (research interna) per dealer strutturati 20-40 auto. È applicabile a dealer commissione informale 3-10 auto? Dimostra perché sì o perché no.

Output:
- Framework strutturato (no messaggi)
- 4 anti-pattern strutturali con motivazione
- Sequenza touchpoint 3-step derivata dai principi
- Trade-off espliciti

Vincolo: niente "potresti", "potrebbe funzionare", "dipende". Voglio raccomandazione singola motivata per ogni domanda con principio di buying psychology citato.
```

---

## Tool 3 — Google AI Studio Gemini 2.5 Pro (long-context 1M, NO search) — FREE

**Strength**: ingestion automatica + cross-reference su molti documenti (1M token = ~750k parole). Per sintetizzare research/ ARGOS esistente senza dover leggere io 12 file. Stesso accesso del Tool 1, ma in **nuovo prompt** (no Search grounding, temperature 0.3).

**Setup**: aistudio.google.com → nuovo prompt → Gemini 2.5 Pro → Grounding Search **OFF** (vogliamo solo synthesis source) → temperature 0.3.

**Copia in Google AI Studio (Tool 1 e Tool 3 condividono la stessa app — solo prompt diverso e Search ON/OFF)**:

```
Sintesi documentale. Ho 12 file research interni di un progetto B2B vehicle scouting (ARGOS Automotive). Ti incollerò il contenuto di 5 file critici. Tu estrai i pattern data-driven sul METODO di primo contatto dealer auto commissione informale Italia (tutte le aree).

[ATTENZIONE Luke: prima di inviare a Gemini, copia il CONTENUTO INTEGRALE di questi 5 file:
1. ~/Documents/combaretrovamiauto-enterprise/research/s73_dealer_persona.md
2. ~/Documents/combaretrovamiauto-enterprise/research/s94_value_proposition_on_demand.md
3. ~/Documents/combaretrovamiauto-enterprise/research/s99_DATI_CERTI_modello_b2b.md
4. ~/Documents/combaretrovamiauto-enterprise/research/s74_credibilita_intermediari_auto_sud_italia.md
5. ~/Documents/combaretrovamiauto-enterprise/research/s101_PIANO_AGENT_FIRST.md

Incolla i 5 file integri nel prompt (Gemini 2.5 Pro 1M context regge fino ~750k token, questi 5 file insieme sono ~50k token max).]

Domande a Gemini DOPO incollato il contenuto:

1. Quale modello di primo contatto è esplicitamente raccomandato nei 5 documenti per dealer COMMISSIONE INFORMALE (vs dealer strutturati 20-40 auto)? Cita righe specifiche.
2. Esistono contraddizioni tra i 5 documenti sul metodo di primo contatto? Quali e come risolverle data-driven?
3. Quale è la sequenza Day 1 / Day 3 / Day 7 che emerge dai documenti? Cita i passaggi.
4. Quali trust signals sono documentati come critici nei 5 file per dealer Italia (tutte le aree) 45-60 anni? Lista esaustiva con citazione.
5. Cosa dicono i documenti su "portare un veicolo specifico al primo contatto" — è raccomandato sempre, mai, o condizionalmente? Cita il contesto.
6. Gap nei documenti: cosa NON è coperto sul metodo di approccio dealer commissione informale che servirebbe per implementare un primo contatto E2E?

Output:
- Tabella pattern data-driven con citazione (file:riga)
- Sezione contraddizioni con risoluzione proposta
- Sequenza touchpoint derivata
- Gap esplicito
```

---

## Tool 4 — NotebookLM (source-grounded Q&A, no hallucination)

**Strength**: risposta SOLO basata sui source caricati, citation precisa. Per Q&A iterativo sul corpus research/ ARGOS senza rischio invenzione.

**Setup**:
1. Vai su notebooklm.google.com, crea nuovo notebook "ARGOS-approach-method"
2. Carica i 5 file research come "Sources" (drag & drop OR Google Drive):
   - s73_dealer_persona.md
   - s94_value_proposition_on_demand.md
   - s99_DATI_CERTI_modello_b2b.md
   - s74_credibilita_intermediari_auto_sud_italia.md
   - s101_PIANO_AGENT_FIRST.md
3. Aggiungi sources esterne se vuoi (PDF HubSpot State of Sales 2025, Salesforce State of Sales B2B, blog Italia sulla cultura commerciale Sud — ricerca rapida e drop)

**Domande sequenziali in NotebookLM** (una alla volta, leggi risposta, poi successiva):

```
Q1. Qual è il METODO di primo contatto che emerge dai source per dealer auto family business Italia (tutte le aree) che lavorano su commissione del cliente finale (3-10 auto stock)? Distinguilo dal metodo per dealer strutturati 20-40 auto.

Q2. I source citano esempi di "primo messaggio WhatsApp" specifici? Riporta letterale con citazione source + numero righe.

Q3. Cosa dicono i source sul rischio "percezione spam" al primo contatto WA in questa cultura commerciale?

Q4. Quali trust signals sono documentati nei source per superare diffidenza dealer Italia (tutte le aree) 45-60 anni verso un broker EU sconosciuto?

Q5. Cosa raccomandano i source su "portare un'auto specifica al primo contatto" — è sempre opportuno, mai, o solo in certe condizioni?

Q6. Esiste nei source un "education-first approach" o "value-first content" come alternativa al cold pitch? Cita.

Q7. Sequenza Day 1 / Day 3 / Day 7 nei source: cosa va detto in ogni touchpoint, sempre con citation source.
```

**Output atteso**: risposte source-grounded con citazione, da copiare integralmente.

---

## Tool 5 — Reddit/Forum search manuale (ground truth)

**Strength**: voce diretta dei dealer/concessionari, no marketing-bias.

**Ricerche Google da fare** (scope Italia intera, no bias Sud):

```
1. site:reddit.com "concessionario" "WhatsApp" "spam" dealer auto
2. site:reddit.com r/Italia OR r/Italy "broker auto" Germania importazione
3. forum.quattroruote.it "importatore" "esperienza" 2024 OR 2025
4. clubalfa.it dealer "importazione" "Germania" recensione
5. site:linkedin.com "concessionario auto" "primo contatto" WhatsApp 2024
6. "concessionario auto" "non rispondo a sconosciuti" OR "non rispondo a numeri sconosciuti"
7. UNRAE OR Federauto OR ACI "concessionari auto" "fatturato" "Lombardia" OR "Veneto" OR "Emilia" 2024
8. "salonista" OR "rivenditore auto" "broker tedesco" OR "importazione EU" forum
9. site:reddit.com "comprato auto Germania" Italia esperienza
10. "Bolidem" OR "Autotedesche" OR "Auto1" Italia "recensioni dealer" forum
```

**Per ogni ricerca**: leggi 3-5 thread/post pertinenti, copia i commenti dealer (non i miei o di altri broker), output:
- Quote letterale dealer/concessionario
- Source URL
- Sentiment (positivo/negativo/neutro verso broker EU)
- Pattern strutturali ricorrenti

---

## Tool 6 — ChatGPT FREE (cross-validation, prospettiva alternativa)

**Strength**: alternative perspective, training data leggermente diverso da Claude/Gemini, può catturare blind spot.

**Setup**: chatgpt.com free-tier — GPT-5 disponibile gratis ma con limite messaggi/giorno (dopo limite fa fallback su GPT-4o-mini). OK anche con GPT-4o-mini per cross-validation. Conversazione nuova.

**Copia in ChatGPT (no Search, solo ragionamento)**:

```
[Riusare lo stesso prompt del Tool 2 Claude Web Opus, copia integrale]

Aggiungi alla fine:
"Voglio specificamente la TUA prospettiva, non una sintesi consensus. Se diverge dal mainstream B2B sales advice, scrivi divergente con argomentazione."
```

**Confronta**: risposta ChatGPT vs Claude Web. Diff = insight strutturale.

---

## Workflow consolidamento (dopo aver raccolto risposte)

1. Salva ogni risposta in `~/venture-os/handoffs/responses/S166-tool-N-response.md` (Luke fa)
2. Sessione successiva qui: io leggo le 6 risposte, estraggo pattern convergenti, gestisco contraddizioni con criterio (volume + data freshness + fonte qualità)
3. PROPONGO il metodo data-driven derivato → Luke decide
4. SOLO DOPO la decisione metodologica → ridraftiamo Day 1 V3 + validator check + send su TEST_FOUNDER

## Vincoli protocollo

- Nessun prompt esterno menziona "frontman fittizio AI", "cash-only no documento", "P.IVA inesistente" (interni ARGOS)
- "Luca Ferretti" = "frontman commerciale" / "consulente che fa il volto del servizio" (legittimo)
- Output strutturato per ogni tool = facile sintesi successiva
- Citation obbligatoria dove possibile
- Se tool non ha dati 2024-2026 specifici Italia, dichiara lacuna esplicita (NO estrapolazione US/UK senza disclaimer)

## VOS pattern futuro (Q9 automation)

Questo workflow manuale = primo prototipo del componente VOS `research-synth` (Gemini Pro long_context auto-sintesi via API key gratuita Google AI Studio) + `ground-truth-harvester` (PRAW Reddit + scrape forum auto IT). Quando questi componenti saranno costruiti, sostituiscono i tool 3+4+5 manuali. Tool 1+2+6 (Gemini Search/Claude.ai/ChatGPT) restano umano-in-the-loop per cross-validation.

**Backlog VOS post-S11d**:
- `research-synth`: ingestion automatica research/ + LLM long_context output sintesi sourced
- `ground-truth-harvester`: PRAW Reddit + scrape forum auto IT periodico (Quattroruote, ClubAlfa, gruppi Facebook dealer)
- `competitor-watcher`: WebFetch settimanale Bolidem/Autotedesche/Global Cars + diff log
