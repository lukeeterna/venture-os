# Prompt next session — S167 (B6 fix strutturale + ARGOS Day 1 V3 send)

> Salvato 2026-05-13 close S166 verde.
> Copia-incolla SOLO se questa sessione chiude (altrimenti procediamo qui).

---

## Pre-condizioni GIÀ COMPLETATE in S166 (verifica)

- Sintesi data-driven 3 fonti (Gemini Search + Claude Opus + NotebookLM): `~/venture-os/handoffs/S166-SYNTHESIS-approach-method.md`
- Protocollo VOS riusabile: `~/venture-os/wiki/patterns/data-driven-research-protocol.md`
- Day 1 V3 derivato data-driven (12/12 anti-pattern check PASS), aspetta validation founder pre-send TEST_FOUNDER
- B6 entry aggiunto in ROADMAP.md (escalation FASE 4.2, priorità HIGH)

## Pattern recognition critico

5 rebrand S159 documentati S166 in 1 giorno (`state/blueprint-deviations.jsonl`). Soglia FASE 4.2 superata. **B6 strutturale OBBLIGATORIO prima di S167 ARGOS dealer-intel + outreach reale**, altrimenti pattern si ripete su dealer reali = bruciato target Wave 1.

## Goal S167 — Sequenza atomica

### Step 1 — B6 implementazione fix strutturale (2-3h)
3 layer:
- **L1 Hook SessionStart upgrade** (`~/.claude/hooks/session_start_brief.sh`):
  - Detect cwd progetto (ARGOS/FLUXION/Guardian)
  - Estrai DECIDED entries con tag founder-input da `wiki/projects/<cwd>/DECISIONS.md`
  - Inject in JSON additionalContext come blocco "DECISIONI FOUNDER NON RINEGOZIABILI"
- **L2 Skill `pre-action-check`** (`~/.claude/skills/pre-action-check/SKILL.md`):
  - Auto-trigger keyword: ["propongo", "raccomando", "Path", "decisione", "V3", "strategia", "scrivo per"]
  - Forza 3-line check PRIMA del corpo proposta: (1) D-XX rif applicabile, (2) vincolo founder esplicito rispettato, (3) fonte dati/research a supporto
  - Se manca uno dei 3 → STOP, conferma esplicita Luke pre-output
- **L3 CLAUDE.md vincolo #13** (sotto soglia 200 righe doc Anthropic compliance):
  - Aggiungi 3-4 righe vincolo #13 "Pre-action check obbligatorio"
  - Verifica wc -l ~/.claude/CLAUDE.md ≤ 200

Done when:
- Hook L1 testato: cwd `~/Documents/combaretrovamiauto-enterprise` → inject DECISIONS.md DECIDED entries verificato in transcript SessionStart
- Skill L2 installata + 5 sample prompt test (3 trigger keyword, 2 no-trigger)
- CLAUDE.md L3 aggiornato, sotto 200 righe, vincoli totali = 13
- Memoria persistente `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_pattern_S159_mitigation.md` salvata
- Commit + push iMac + GitHub

### Step 2 — Day 1 V3 validation founder + send TEST_FOUNDER (~15 min)
Day 1 V3 proposto S166 (provincia Foggia, lessico Sud commissione informale, zero-ask, 12/12 anti-pattern check PASS):

```
Buongiorno, sono Luca Ferretti.

Trovo macchine premium dalla Germania, Olanda, Belgio, Austria
per concessionari italiani. Sto cercando 2-3 referenti per la
provincia di Foggia.

Niente da venderle oggi. Solo presentarmi: se le capita un cliente
che cerca BMW/Mercedes/Audi e vuole risparmiare 3-5k sull'identica
macchina che trova qui, mi può scrivere. Pago io tutto fino al suo
piazzale — lei paga cash a consegna, quando l'auto è da lei.

Per il momento è solo per averla nel pallottoliere.

Luca Ferretti
```

Workflow:
- Founder valida V3 (provincia OK? lessico? lunghezza?)
- Send a 393314928901 (TEST_FOUNDER configurato `.env` S166)
- Luke risponde "sì interessato" → verify classifier=POSITIVE + Day 3 candidate generato
- Luke risponde "STOP" → verify NEGATIVE + opted_out

### Step 3 — DECISIONS.md update post-V3 validato (~10 min)
Se V3 PASS → nuova entry `D-21 — Day 1 V3 commissione informale Italia (frontman + cash-only) data-driven 3-tool research`. Reference: S166-SYNTHESIS + responses/.

## Vincoli sessione S167

- **#1** verifica fattuale: ogni proposta cita D-XX + vincolo founder + fonte dati (B6 L2 enforced)
- **#3** raccomandazione singola motivata (NO Path A vs B)
- **#4** critica strutturale 4 punti
- **#5** zero-cost
- **#6** verde o handoff S167-deferred
- **#7** chiusura ordinata sotto 60% context
- **#9** no diplomatico, no scarico decisioni su founder
- **#11** pattern recognition: zero rebrand S159 tolerabile post-B6 ship

## Done when S167

- B6 3 layer shipped + testato
- Day 1 V3 send a TEST_FOUNDER + Step 2+3 classifier verified
- D-21 entry in DECISIONS.md
- Commit + push (VOS + ARGOS)
- Deviation `S159-mitigation-B6-shipped + V3-validated` in blueprint-deviations.jsonl

## Next post-S167

S168 ARGOS dealer-intel MVP (Google Maps scrape Wave 1 → 50+ leads qualificati TIER 0/1) + S169 outreach reale primo dealer TIER 0 (Stile Car FG / Car Plus AV / Sa.My. CS) HITL 100% applicando V3 Day 1 + sequenza commitment ladder inversion derivata research.
