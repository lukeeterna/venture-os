# venture-dossier — {{RUN_ID}}

> SCOCCA della fabbrica VOS. Un file per venture-candidato. Percorre S0→S6, ogni stazione compila la sua sezione.
> **Regola firewall (non negoziabile)**: ogni sezione DEVE avere il blocco `provenance:` compilato prima di chiudere il gate. Provenienza mancante = gate FAIL. Vedi `VOS_RUN_SPEC.md §Principio FIREWALL`.
> Compila in ordine. Non saltare stati. Non riempire S3+ se G1 ha dato KILL.

```yaml
run_id: {{RUN_ID}}
created_ts: {{TS}}
state: S0          # S0..S6
verdict: null      # null | SHIPPED | KILLED
seed_envelope: {{SEED_PATH}}
```

---

## S0 — seed (intake) — chiuso da: VOS, da seed_envelope

- **Vincoli ricevuti** (niche-free, copiati dall'envelope): {{...}}
- **Tipo-verticale ipotizzato** (B2B-globale / servizi-locali / consumer): {{...}}

```yaml
provenance:
  source: {{seed_envelope path}}
  ts: {{TS}}
```

> ⚠️ Se l'envelope nominava una nicchia → VIOLAZIONE FIREWALL. Annota qui e ignora la nicchia suggerita.

---

## S1 — segnali (Discovery) — stazione 1, worker market-researcher

Nicchie candidate **partorite da VOS** (Luke NON le ha scelte). Per ognuna, segnale di spesa esistente con URL:

| Nicchia candidata | Segnale di spesa esistente | URL/fonte | Forza (1-5) |
|---|---|---|---|
| {{...}} | {{competitor revenue / workaround a pagamento / job-posting}} | {{URL}} | {{...}} |

```yaml
provenance:
  tool: {{trend-researcher / deep-research / WebSearch}}
  sources: [{{URL}}, {{URL}}]
  ts: {{TS}}
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

```yaml
provenance:
  sources: [{{URL}}, ...]
  ts: {{TS}}
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
  derived_from: S2
  ts: {{TS}}
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
  ts: {{TS}}
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
  ts: {{TS}}
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
  ts: {{TS}}
gate: G3
gate_decided_by: Luke      # pagamento reale osservato da Luke, terminale
verdict: {{SHIPPED | KILLED}}
```

---

## Log decisioni di linea (append-only)
- {{TS}} — S0 creato
- {{TS}} — G1 {{GO/KILL}}: motivo
- {{TS}} — G2 {{GO/REWORK}}: motivo
- {{TS}} — G3 {{SHIPPED/KILLED}}: motivo
