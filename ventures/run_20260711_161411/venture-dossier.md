# venture-dossier — run_20260711_161411

> SCOCCA della fabbrica VOS. Un file per venture-candidato. Percorre S0→S6, ogni stazione compila la sua sezione.
> **Regola firewall (non negoziabile)**: ogni sezione DEVE avere il blocco `provenance:` compilato prima di chiudere il gate. Provenienza mancante = gate FAIL. Vedi `VOS_RUN_SPEC.md §Principio FIREWALL`.
> Compila in ordine. Non saltare stati. Non riempire S3+ se G1 ha dato KILL.

```yaml
run_id: run_20260711_161411
created_ts: 2026-07-11T16:14:11Z
state: S1
verdict: null      # null | SHIPPED | KILLED
seed_envelope: seeds/seed_sportswear_20260711.md
```

---

## S0 — seed (intake) — chiuso da: VOS, da seed_envelope

- **Vincoli ricevuti** (niche-free, copiati dall'envelope): {{...}}
- **Tipo-verticale ipotizzato** (B2B-globale / servizi-locali / consumer): {{...}}

```yaml
provenance:
  source: seeds/seed_sportswear_20260711.md
  ts: 2026-07-11T16:14:11Z
```

> ⚠️ Se l'envelope nominava una nicchia → VIOLAZIONE FIREWALL. Annota qui e ignora la nicchia suggerita.

---

## S1 — segnali (Discovery) — stazione 1, worker market-researcher

Nicchie candidate **partorite da VOS** (Luke NON le ha scelte). Per ognuna, segnale di spesa esistente con URL:

| Nicchia candidata | Segnale di spesa esistente | URL/fonte | Forza (1-5) |
|---|---|---|---|
| Personalizzazione teamwear calcio dilettanti FIGC — Basilicata + Nord Puglia (Foggia) | Dealer locale attivo con brand teamwear (Sportissimo Potenza, partnership Erreà / Potenza Calcio) + kit gara a listino pubblico €12–46 sui 3 brand + finestra ordini pre-campionato stagionale (iscrizioni Eccellenza/Promozione entro 20 lug 2026, avvio 6 set 2026) | s1_censimento.md §A/§B/§C — https://www.tuttopotenza.com/primo-piano/errea-e-sportissimo-griffano-il-potenza-17311 ; https://www.lndbasilicata.it/2026/06/29/stagione-sportiva-2026-2027-deliberate-date-e-scadenze-dei-campionati-regionali/ | 3 |

> Nota S1: segnale di spesa esistente documentato (dealer + brand-sponsor su club locali + ciclo ordini stagionale), ma copertura territoriale sottile — 1 dealer certo (Potenza), Foggia senza dealer teamwear dilettanti identificato con evidenza pubblica. Volley/basket: nessun operatore emerso [DA-VERIFICARE]. Forza=3 = spesa reale ma frammentata. Kill-criteria territory_exclusive/margin_floor restano [DA-VERIFICARE] (condizioni reseller non pubbliche) — verdetto G1 a Luke.
> Scope-fornitore (correzione Luke 2026-07-11): il target-fornitore = piccoli produttori/laboratori locali BAT (sublimazione/personalizzazione diretta), NON i brand strutturati (Macron/Erreà/Givova) né i loro rivenditori, che sono l'alternativa da cui differenziarsi. Filiera corta = margine a monte + territory_exclusive più favorevole. Dettaglio in s1_censimento.md §A0/§A-bis (10 produttori BAT da directory, specializzazione teamwear [DA-VERIFICARE per telefono]).

```yaml
provenance:
  tool: trend-researcher (WebSearch/WebFetch)
  source: ventures/run_20260711_161411/s1_censimento.md
  derived_from: seeds/seed_sportswear_20260711.md
  sources: [https://www.lndbasilicata.it/2026/06/29/stagione-sportiva-2026-2027-deliberate-date-e-scadenze-dei-campionati-regionali/, https://www.tuttopotenza.com/primo-piano/errea-e-sportissimo-griffano-il-potenza-17311, https://www.teamsport-id.com/forniture-macron, https://www.iacosport.com/calcio/kit-calcio/kit-calcio-manica-corta/kit-macron.html]
  ts: 2026-07-11T16:40:00Z
```

---

## S2 — scocca (Demand validation) — GATE G1

Nicchia selezionata: **{{...}}**. Tesi di domanda triangolata.

Kill-criteria (market-intelligence-engine.md) — ognuno con evidenza esterna:

| Gate | Criterio | Esito | Evidenza (URL) |
|---|---|---|---|
| A | Audience raggiungibile e nominabile | {{PASS/FAIL}} | {{≥2 luoghi}} |
| B | Evidenza di spesa esistente | {{PASS/FAIL}} | {{URL}} |
| C | Floor di dimensione quantificabile | {{PASS/FAIL}} | {{URL fonte}} |
| D | Distribuzione fattibile da solo | {{PASS/FAIL}} | {{canale}} |
| E | Intensità del dolore | {{PASS/FAIL}} | {{citazioni non sollecitate + URL}} |

**G1 VERDICT**: {{GO → S3 | KILL → archivia con motivo}}

> **Decisioni founder 2026-07-11 (registrate dal giudice)** — nota informativa; NON compila la provenance S2, che si chiude coi risultati dell'outreach di Luke in un mandato successivo.
> (a) **Target cliente** = scuole calcio + ASD/SSD, ambito Italia (lato domanda, oltre il perimetro seed; la fornitura resta produttori BAT).
> (b) **Modello** = nessun anticipo per l'ingaggio; conferma d'ordine con caparra (stesso test WTP del seed, in forma di caparra).
> (c) **Validazione** = email redatte da CC e inviate dal founder; nessun invio autonomo (<10 CLOSED_WON).
> (d) **Proposta giudice in attesa di ratifica founder**: `g2_fact` riscritto in ">=2/5 realtà contattate riportano un problema concreto col fornitore attuale (ritardi consegna, errori personalizzazione)".

```yaml
provenance:
  sources: [{{URL}}, ...]
  ts: 2026-07-11T16:14:11Z
gate: G1
gate_decided_by: Luke      # collaudo umano sull'evidenza, non auto-validazione
```

---

## S3 — offerta (Offer scoping) — stazione 2 (parte A), worker builder

- **Cosa vendi** (job-core, 1 frase): {{...}}
- **Prezzo**: {{≥ revenue_floor / unità}}
- **Positioning vs workaround esistente**: {{...}}
- **Feature minima del job-core**: {{...}}

```yaml
provenance:
  derived_from: {{derived_from}}
  ts: 2026-07-11T16:14:11Z
```

---

## S4 — MVP (Build) — stazione 2 (parte B) — GATE G2

- **Repo / path**: {{...}}
- **URL deploy** (se applicabile): {{...}}
- **Test E2E del job-core**: comando eseguito = `{{...}}`, esito = {{exit-code / output osservabile}}

**G2 VERDICT**: {{GO → S5 | REWORK (max 1) | escala}}

```yaml
provenance:
  e2e_command: "{{...}}"
  e2e_result: "{{exit-code / URL raggiungibile}}"
  artifact_paths: [{{...}}]
  ts: 2026-07-11T16:14:11Z
gate: G2
```

---

## S5 — outreach (Distribution) — stazione 3 (parte A), worker distributor

- **Canale usato** (Componente 0): {{...}}
- **Buyer raggiungibili targetizzati**: {{N}}
- **Outreach consegnato**: {{N inviati, come, quando}}
- **Risposte tracciate**: {{...}}

```yaml
provenance:
  channel: {{Componente 0 ref}}
  outreach_log: {{path/URL}}
  ts: 2026-07-11T16:14:11Z
```

---

## S6 — verdetto (Validation) — GATE G3 = gate F TERMINALE

**Tasso di conversione** (niche-free): paganti reali / buyer raggiunti — NESSUN proxy.

- **Buyer raggiunti (N)**: {{...}} / target `buyers_reached_target`
- **Paganti reali**: {{...}} (soglia SHIPPED = `min_paying_to_pass`)
- **Esito**: {{≥soglia → SHIPPED | 1 → segnale debole, rework/kill | 0 → KILLED}}

**G3 VERDICT**: {{SHIPPED | KILLED-motivato}}

```yaml
provenance:
  buyers_reached: {{N}}
  paying_count: {{...}}
  payment_refs: [{{Stripe/Lemon tx id}}]
  ts: 2026-07-11T16:14:11Z
gate: G3
gate_decided_by: Luke      # pagamento reale osservato da Luke, terminale
verdict: {{SHIPPED | KILLED}}
```

---

## Log decisioni di linea (append-only)
- 2026-07-11T16:14:11Z — S0 creato
- 2026-07-11T16:14:11Z — G1 {{GO/KILL}}: motivo
- 2026-07-11T16:14:11Z — G2 {{GO/REWORK}}: motivo
- 2026-07-11T16:14:11Z — G3 {{SHIPPED/KILLED}}: motivo
