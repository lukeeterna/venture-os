# NEXT SESSION — VOS (chiusura manuale 2026-06-02, VERDE)

## Fatto questa sessione
Disciplina GATE "done-condition anti-avvitamento" (v2, validata storico n=5) committata in 3 file canonici:
- `~/.claude/CLAUDE.md` → `### 1b` (Luke ha aggiunto anche `### 1c` research-or-escalate, complementare)
- `/Volumes/MontereyT7/FLUXION/PLAN.md` → convenzione GATE header (commit landed via auto-daemon)
- `/Users/macbook/Documents/combaretrovamiauto-enterprise/PLAN.md` → idem

**Regola:** gate ben formato sse (a) `TERMINAL_FACT` decidibile da FUORI il codice protetto (URL/exit-code/sì-no umano/esito reale), mai validazione statica; (b) se NON raggiungibile-in-sessione (dipende da Luke/terzo mondo-reale) → `BLOCKED-ON:<fatto>`, vietato re-validare staticamente. Firma audit DUALE dalle tool-call: (1) gate attivo con fatto non-esterno = viol.(a)[R-01]; (2) BLOCKED-ON con tool-call statiche = viol.(b)[sanitizer/E2E].

**Come ci siamo arrivati:** v1 ("nomina fatto esterno") FALSIFICATA dal retrospettivo n=5 — controesempi C-SAN-001 (~10 sess) e C-E2E-ZERO (~28) nominavano il fatto e si avvitavano perché irraggiungibile. v2 aggiunge clausola raggiungibilità + firma duale. Draft completo: `/tmp/vos-discipline-gate-draft.md`.

## Differito a n≥2 (non riaprire senza secondo gate stesso pattern)
Enforcement hook deterministico della firma audit. Costo onesto: LLM-judge o mappa gate→file, NON regex/15-righe.

## Primo gate sotto la regola — già scritto, da SBLOCCARE non validare
**FLUXION credenziali Stripe/Resend/Cloudflare** = `TERMINAL_FACT` esito-reale, irraggiungibile-in-sessione → `BLOCKED-ON:Luke`. Atto di Luke, più vicino al revenue di qualsiasi guardia. + R-01 fix tecnica residua: KV→D1 quando si tocca il refund gate FLUXION.

## Cornice
VOS pausa pre-€800. Metodologia deve accelerare. Thread chiuso: gate "qual è la regola" = DONE (fatto esterno = retrospettivo, raggiunto).
