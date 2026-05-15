# CTO Review — VOS Improvement Proposal v1

> **Reviewer**: CTO senior peer review
> **Date**: 2026-05-15
> **Target document**: VOS Improvement Proposal v1 (2026-05-15)
> **Founder**: Luke — single founder, runway €0, budget €240/mese CC + €30/mese hard cap LLM
> **Projects in scope**: ARGOS, FLUXION (priority production), Guardian (frozen)

---

## PARTE A — Gap analysis verifica

### G1 — Brief-actions feedback loop non popolato
❓ **NON VERIFICABILE** — il documento afferma "briefer report-only" ma non mostra evidence (es. snippet `briefer.py` attuale, schema `brief-actions.jsonl` esistente). Possibile gap reale ma non provato nel doc.

### G2 — Decision propagation cross-project manuale
✅ **GAP REALE confermato** — DECISIONS.md ARGOS canonical, nessun mechanism sync verso FLUXION/Guardian è coerente con struttura state JSONL VOS dichiarata.

### G3 — Tool-scout → deployment gap
✅ **GAP REALE confermato** — `scouter.py` emette discovery, ma nessun candidate flagging downstream è plausibile e il doc lo argomenta (ROI scouting basso senza adoption pipeline).

### G4 — Cost tracking solo global
❓ **NON VERIFICABILE** — il doc afferma "SOLO global €30/mese" ma non mostra `_shared/llm_router.py` cost log schema attuale. Plausibile ma non provato.

### G5 — Routing regression no auto-trigger
⚠️ **GAP REALE ma sovradimensionato** — l'esempio Llama -50% context il doc stesso lo neutralizza ("Gemini primary 1M, no action needed"). Il gap esiste in teoria ma il trigger reale è raro. Phase 3.2 effort 4-6h per edge case = sproporzionato.

### G6 — Memory cross-progetto VOS ≠ project-side
✅ **GAP REALE confermato** — path `~/.claude/projects/-*/memory/` separati è strutturale Claude Code, federation manca.

### G7 — AMBRA pattern non sharable
⚠️ **GAP REALE ma sovradimensionato** — AMBRA è in ARGOS terminal P0 audit (PROMPT-S171 v2.2 citato come pendente). Estrarre pattern PRIMA che ARGOS lo abbia stabilizzato = premature abstraction. Vedere Issue #2 sotto.

### G8 — Cross-terminal coordination
⚠️ **GAP REALE ma sovradimensionato** — single founder, terminali sequenziali nella pratica. Conflict scenario "2 instance ARGOS che editano stesso file" è ipotetico per workflow single-user. Lock file infra = overkill.

### G9 — Brief signal scoring
✅ **GAP REALE confermato** — coerente con out-of-scope ("solo enhancement signal_priority, no modifica format") e utility immediata.

---

## PARTE B — Issues critici proposal

### Issue #1 — BLOCKER / out-of-scope-violation
**Issue**: Phase 5 P5.1 dichiara "modifica briefer: aggiungi signal_priority field" e "Brief output: sezione 🔴 CRITICAL in cima". Out-of-scope esplicito vincolo founder: "NO modifica briefer format markdown (solo enhancement signal_priority)". Aggiungere sezione "🔴 CRITICAL in cima" + riordinare output IS modifica format, non solo enhancement field interno.

**Raccomandazione**: limitare P5.1 a field `signal_priority` in JSONL state, NO modifica markdown output layout. Founder filtra lato sua se vuole.

---

### Issue #2 — BLOCKER / dipendenza-nascosta
**Issue**: Phase 4 P4.1 dipende da "ARGOS terminal P0 audit completato (PROMPT-S171 v2.2)" — dipendenza OUT-OF-SCOPE VOS dichiarata nel doc stesso. Sequenza grafico mostra Phase 4 dopo Phase 3 come se fosse autonoma, ma in realtà è bloccata da lavoro ARGOS-side non controllato dalla VOS roadmap.

**Raccomandazione**: rimuovere Phase 4 dalla sequenza VOS. Riaprire come Phase opzionale POST-AMBRA-stabilization in ARGOS, non dentro questo proposal.

---

### Issue #3 — HIGH / scope-creep
**Issue**: Total 23-32h effort per single founder con FLUXION dichiarato "priority production SaaS €497/€897". 23-32h su VOS-meta = 3-4 settimane part-time sottratte a FLUXION revenue-generating. Doc non quantifica opportunity cost vs FLUXION delivery.

**Raccomandazione**: tagliare scope a Phase 1 + Phase 2 P2.1 solo (decision sync) + Phase 5 (depotenziata vedi #1). Stima realistica: 8-12h. Phase 2 P2.2 / 3 / 4 / 8 → backlog post-FLUXION milestone.

---

### Issue #4 — HIGH / sequenza-priorità-errata
**Issue**: Phase 1 P1.1 (brief-actions populate) presuppone che il founder USI il feedback loop. Nessuna evidenza nel doc che il founder abbia chiesto audit trail / compounding. È un'inferenza del proposer su "best practice", non un need-driven gap. Pattern S159 (stack creep) applicabile.

**Raccomandazione**: prima di costruire P1.1, validare con founder: "stai perdendo decisioni? hai bisogno audit trail?" Se no → P1.1 fuori scope.

---

### Issue #5 — HIGH / assunzione-sbagliata
**Issue**: Phase 2 P2.2 memory federation via rsync nightly verso `~/.claude/projects/-*/memory/` assume che Claude Code legga memory file droppati lì da processo esterno. Comportamento Claude Code re: memory injection è canonical interno (gestito da app), non garantito che file copiati esternamente vengano caricati come "native memory". Dipendenza nascosta su implementazione Claude Code non documentata.

**Raccomandazione**: prima di P2.2, test empirico singolo: drop 1 file in target memory dir, verifica SessionStart terminal target lo legge. Se no → P2.2 fattibilità zero, sostituire con context injection via SessionStart hook (già infra esistente VOS).

---

### Issue #6 — HIGH / assunzione-sbagliata
**Issue**: Phase 3 P3.1 "tool-adoption-candidates" presume founder abbia bandwidth per triage settimanale candidate adopt/reject. Single founder con FLUXION priority production → triage discovery = altro task overhead. Doc afferma "ROI scouting basso" come gap, ma soluzione (più triage) può peggiorare ROI tempo founder.

**Raccomandazione**: invertire P3.1 logica — tool-scout emette candidate SOLO se `fit_score > threshold` E `target_project` is `FLUXION` (priority). Eliminare triage manuale per ARGOS/Guardian candidates.

---

### Issue #7 — LOW / scope-creep
**Issue**: Phase 3 P3.2 routing auto-trigger 4-6h per scenario edge-case (Gemini-flash 1M già coperto, doc stesso lo ammette). Effort/value ratio basso.

**Raccomandazione**: degradare a passive logging only (no auto-flag, no telegram alert). Founder review settimanale routing-refresh log. -4h effort.

---

### Issue #8 — LOW / vincolo-founder-violato (#10 verificato>verosimile)
**Issue**: Doc usa formulazioni "plausibile / possibile sforamento silente / pattern noti non si riusano" senza evidence quantificato. G4 cost tracking: nessun dato su quanto sia attualmente la spesa per-project, solo affermazione di gap.

**Raccomandazione**: prima di P1.2 implementation, 1h discovery — esportare cost log 30gg ultimi, segmentare manuale, verificare se gap è materiale (>€5/mese drift) o teorico.

---

### Issue #9 — LOW / dipendenza-nascosta
**Issue**: P2.1 "cross-project decisions injected in SessionStart context PER OGNI sessione terminale" — aumenta context window every session. Se cross-project decisions cresce nel tempo, context bloat. Nessuna policy retention nel doc.

**Raccomandazione**: aggiungere cap (es. last 20 cross-project decisions, FIFO) prima di implementare.

---

## PARTE C — Verdict finale

### 🔴 REVISION REQUIRED

**Counter**: 2 BLOCKER + 4 HIGH. Soglia "PROPOSAL ACCEPTABLE" (0 BLOCKER + max 2 HIGH) **non raggiunta**.

### Fix preliminari obbligatori prima di proceed

1. **Rimuovere Phase 4 dal proposal** (Issue #2 — dipendenza ARGOS P0 out-of-scope VOS).
2. **Re-scope P5.1 a field-only, no modifica markdown layout** (Issue #1 — out-of-scope violation briefer format).
3. **Tagliare proposal a 8-12h scope** (Phase 1 P1.2 + Phase 2 P2.1 + Phase 5 depotenziato) (Issue #3 — opportunity cost FLUXION).
4. **Discovery 1h pre-P1.2** per verificare materialità gap G4 con dati cost log reali (Issue #8).
5. **Test empirico pre-P2.2** memory federation fattibilità Claude Code (Issue #5). Se fallisce, P2.2 elimina, sostituire con SessionStart hook injection.
6. **Validare con founder P1.1 need** (Issue #4) prima di costruire — possibile S159 stack creep su feature non richiesta.

### Next step

Re-submit **v2** con fix sopra → re-review.

---

## Summary table

| Gap | Status | Phase | Action |
|---|---|---|---|
| G1 | ❓ Non verificabile | P1.1 | Validate need first (Issue #4) |
| G2 | ✅ Reale | P2.1 | Proceed (con cap retention #9) |
| G3 | ✅ Reale | P3.1 | Re-scope a FLUXION-only (Issue #6) |
| G4 | ❓ Non verificabile | P1.2 | Discovery 1h pre-build (Issue #8) |
| G5 | ⚠️ Sovradimensionato | P3.2 | Degrade a passive logging (Issue #7) |
| G6 | ✅ Reale | P2.2 | Test empirico fattibilità (Issue #5) |
| G7 | ⚠️ Sovradimensionato | P4.1 | **RIMUOVERE** (Issue #2) |
| G8 | ⚠️ Sovradimensionato | P4.2 | **RIMUOVERE** (Issue #2) |
| G9 | ✅ Reale | P5.1 | Field-only, no format change (Issue #1) |

### Effort revised

| Original | Revised |
|---|---|
| 23-32h | **8-12h** |
| 5 phases | **3 phases** (P1, P2.1, P5 depotenziato) |
| €0 | €0 ✅ |

---

**Review status**: COMPLETE — awaiting proposer v2 re-submit
