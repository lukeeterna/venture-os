# Stazione 3 — kit ESEGUIBILE (Distribution + Validation + Componente 0)

> Spec/design: `../distribution-station.md`. Contratto fabbrica: `../../VOS_RUN_SPEC.md` (§Stazione-vincolo).
> Questo è lo **strumento riusabile** (niche-free) che porta una scocca **S4 → S6**. Lo costruisce VOS una volta,
> lo **usa** ogni venture (FLUXION primo). Il componente immagazzina **metodo + schemi + meccanismo**, mai scelte verticali.

## Cosa contiene

| File | Tipo | Riusabile perché |
|---|---|---|
| `channel-form-selector.md` | metodo | sceglie la FORMA di Componente 0 dai vincoli (default `aggregator` a reach=0). Niche-free. |
| `RUNBOOK-componente-0.md` | runbook | i fatti ESTERNI (canale esiste / link esiste / pagamento reale) — `BLOCKED-ON`, mai validati staticamente (#1b). |
| `templates/contacts.schema.jsonl` | schema | pool buyer raggiungibili (cattura S5). Provenance obbligatoria. |
| `templates/outreach_log.schema.jsonl` | schema | log invii (S5). Alimenta dossier + tracker. |
| `templates/payments.schema.jsonl` | schema | pagamenti REALI (S6). vincolo #6: no proxy. |
| `templates/outreach-message.skeleton.md` | metodo | scheletro messaggio presell niche-free, slot per-venture. |
| `bin/g3-tracker.py` | **codice** | calcola conversione G3 (paying/reached) e stampa INPUT-al-verdetto. Stdlib, Big Sur. **NON decide** (firewall: Luke). |

## Confine VOS / venture (handoff 2026-06-08)
- **VOS** (questo kit) = la macchina. Niche-free, riusabile, qui in `~/venture-os/components/`.
- **Venture** (FLUXION, ...) = istanzia il kit nel **proprio** terminale: nomina il pubblico, compila i `.jsonl`,
  esegue l'outreach, incassa. Gli artefatti per-corsa vivono sotto `ventures/<run>/`, **non** qui.

## Come una venture lo usa (S4 → S6)
1. **Selettore** → scegli `channel_form` (`channel-form-selector.md`). A reach=0 → `aggregator`.
2. **RUNBOOK Parte A** → fai ESISTERE il canale. Test-esistenza binario (Luke). Finché no → `BLOCKED-ON: esistenza-canale`.
3. **S5 outreach** → compila `contacts.jsonl` (pool) + invia usando lo skeleton + logga in `outreach_log.jsonl`.
4. **RUNBOOK Parte B** → link di incasso live (Stripe/Lemon/bonifico).
5. **S6 / G3** → man mano che arrivano pagamenti reali → `payments.jsonl` → `g3-tracker.py` → Luke chiude il verdetto nel dossier.

## Gate terminale (vincolo #1b)
`TERMINAL_FACT G3` = pagamenti reali in dashboard/conto, decisi da Luke. `BLOCKED-ON: primo pagamento` finché non incassato.
Mai re-validazione statica: l'unico lavoro per sbloccare è più outreach o un fix offerta (max 1 rework), poi escala.

## Stato
- Meccanismo VALIDATION/INCASSO (`g3-tracker.py` + schemi + metodo): **COSTRUITO e verificato** (self-test).
- Componente 0 (il CANALE che esiste) + link incasso + pagamento: **BLOCKED-ON azione Luke** (RUNBOOK). `channel_reach=0` nel seed.
