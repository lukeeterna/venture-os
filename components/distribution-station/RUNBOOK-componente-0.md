# RUNBOOK — far ESISTERE Componente 0 + il link di incasso (fatti esterni, BLOCKED-ON)

> **Perché un runbook e non codice** (vincolo #1b/#1c): l'esistenza del canale e del pagamento sono
> **fatti esterni decidibili solo dal mondo reale** (un destinatario riceve / una dashboard mostra una tx).
> VOS NON li può validare staticamente. L'unico lavoro ammesso è **renderli raggiungibili** (questi passi)
> o escalare. Mai "ricontrollare il codice del link" per simulare progresso.

Stato corrente seed `seed_20260606`: `channel_reach: 0` → Componente 0 **0-build, BLOCCA G3**.

---

## Parte A — far esistere il CANALE (Componente 0)

Forma scelta dal selettore (`channel-form-selector.md`). A reach=0 il default è `aggregator`.

1. **Scegli i luoghi** (la venture nomina il pubblico): 1-3 aggregatori dove il buyer è già presente,
   pubblicabili a €0. Annota URL + regole di pubblicazione lette.
2. **Endpoint pubblicabile**: account/accesso ok su quei luoghi (Luke crea/usa il proprio account).
3. **Cattura contatti** (form → lista): un meccanismo €0 per raccogliere chi risponde in `contacts.jsonl`.
   Opzioni free-tier (scelta JIT via tool-evaluator quando si tocca lo slot): Google Form→Sheet, Tally free,
   o anche raccolta manuale in `contacts.jsonl`. **Non automatizzare oltre questo (tetto autocritica #3).**

### ✅ TEST-ESISTENZA CANALE (binario, owner = Luke)
> Componente 0 **esiste** SSE almeno UNO è vero, verificato da Luke:
> - un **post è live e raggiungibile via URL** sull'aggregatore scelto, **oppure**
> - un **messaggio di test è stato ricevuto** da un destinatario reale (screenshot/conferma).
>
> Finché nessuno dei due è vero → `BLOCKED-ON: esistenza-canale`. Non avanzare S5.

---

## Parte B — far esistere il LINK DI INCASSO (per G3)

Provider-agnostico (Stripe / Lemon Squeezy, €0 setup). Scelta JIT.

1. Account provider (Luke). Per Stripe: Payment Link o Checkout, importo = acconto o pieno (lo decide la venture).
2. Genera il link. **Modalità test ≠ incasso reale**: il fatto terminale è una tx in **live mode**.
3. Fallback se provider non pronto: **bonifico** con causale tracciabile (CRO = `tx_ref`).

### ✅ TEST-ESISTENZA LINK (binario, owner = Luke)
> Il link **esiste** SSE è **live e apribile via URL** e porta a un checkout reale.
> (Questo NON è il gate G3 — è solo il canale di incasso pronto.)

---

## Parte C — il GATE G3 (terminale, vincolo #1b) — `BLOCKED-ON: primo pagamento reale`

> **Fatto terminale G3**: ≥ `min_paying_to_pass` (=3) pagamenti **reali** su `buyers_reached_target` (=50)
> raggiunti, visibili nella dashboard provider / sul conto. Deciso da **Luke** sull'evidenza.
>
> Irraggiungibile in-sessione (dipende dai buyer nel mondo reale) → resta `BLOCKED-ON`.
> **Mai re-validare staticamente.** Lavoro ammesso per sbloccare: più outreach o fix offerta (max 1 rework), poi escala.

Quando arrivano pagamenti: appendi a `payments.jsonl` (1 riga/tx, con `tx_ref` reale) e lancia il tracker:

```
python3 bin/g3-tracker.py \
  --outreach <run>/outreach_log.jsonl \
  --payments <run>/payments.jsonl \
  --seed seeds/seed_20260606.md
```

Il tracker stampa l'INPUT-al-verdetto (reached, paying, conversion). **Luke** chiude il gate nel dossier S6.

---

## Catena di stati (cosa sblocca cosa)
`canale 0-build` → [TEST-ESISTENZA CANALE] → `S5 outreach attivo` → [≥1 risposta calda]
→ [LINK live] → `ask di pagamento` → [primo pagamento reale] → tracker → `S6 verdetto (Luke)`.

Ogni `[...]` è un fatto esterno: se non è vero, lo stato è `BLOCKED-ON: <quel fatto>`, non "in lavorazione".
