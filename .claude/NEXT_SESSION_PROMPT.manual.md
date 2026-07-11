# NEXT SESSION — sportswear S2-prep (run_20260711_161411)

**Stato:** BLOCKED-ON target list 26/30. Kit outreach (mail/tracking/dossier) fatto e committato (`5e77fc8`; mail/tracking/dossier già in `f548675`/`b8d5789`). Provenance S2 = **false** (corretto).

## DECISIONI FOUNDER 2026-07-11 (da registrare dal giudice)
1. **Canale outreach = TELEFONO**, poi WhatsApp tramite **sales agent**. Invia **Luke** (G-APPROVAL, <10 CLOSED_WON) — CC prepara, non invia mai.
   → il **telefono è dato di prima classe** nella target list, quanto/più dell'email.
2. **§3.3 (no login/automazione Meta) — override PENDENTE, non ratificato.** Focus-telefono riduce il bisogno. `harvest_dealers_fb.py` (ARGOS, account "Mario Reali") si usa SOLO come override esplicito §3.3 e SOLO per club FB-only irreperibili altrove. Ratifica founder→giudice PRIMA di eseguire. uid NON salvato.
3. **Correzione CC:** "impossibile usare cookie/scraping" era FALSO — `harvest_dealers_fb.py` via Bash lo fa. Limite reale: estrae telefono/sito/indirizzo (NON email); regex fragile ai cambi DOM FB; ARGOS-tuned (riparametrare QUERY_VARIANTS, togliere filtri auto).

## APRIRE al giudice (proposta CC)
Rilassare fatto terminale S2 da "≥30 con email+URL fonte" a **"≥30 realtà con telefono pubblico VERIFICATO (email opzionale), URL fonte ciascuna"**, coerente col canale telefono→WA deciso oggi.

## RESUME target list (26/30)
Bacino allargato: scuole calcio + ASD + **squadre amatoriali da tornei**. Fonte = **comitati provinciali CSI/UISP/PGS/ACSI + registro CONI/RASD + tuttocampo + siti società** (dati pubblici, no ToS). Priorità Sud: Foggia/Nord Puglia + Basilicata (PZ/MT).
- WebFetch mirati in **main context** (NON subagent background: auto-negano WebFetch). Append `printf '...\n' >> s2_targets.md` (7 colonne).
- MAI dedotti: letti su pagina reale, URL fonte = pagina specifica. Chiudere righe 33-34 (URL fonte) e riga 8 (ValleNoce).
- A ≥30: `git add` 4 file s2_* + dossier + state/pipeline.json → commit "sportswear S2-prep: kit validazione outreach (targets Italia + mail produttori/clienti) — invio a carico founder". Ledger `state/*.jsonl` MAI in git add.

## VINCOLI
Zero contatti in uscita. Provenance S2 resta false. accept-edits OFF.
