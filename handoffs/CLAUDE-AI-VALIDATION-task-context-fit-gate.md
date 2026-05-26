# Validation prompt per Claude.ai — Task-Context Fit Gate design

**Context**: sto progettando un sistema VOS per Claude Code (CC) che prevenga
la saturazione del context window quando CC accetta task troppo grandi rispetto
al budget residuo. Voglio second opinion architetturale prima di implementare.

---

## Problema

Su 3 progetti attivi (ARGOS, FLUXION, Guardian) gestiti da CC, pattern ricorrente:
- Sessione parte con prompt opaco: `leggi prompts/sXXX_task.md`
- Il file referenziato contiene task complessi multi-step (es. "FASE 2.1-2.8:
  ed25519 keypair + stripe webhook + D1 schema + tests + deploy")
- CC accetta e parte senza valutare se ha context sufficiente
- Sessione satura @ 80-100% → /compact (degrada claim) o hard-stop
- Output prodotto post-saturazione è inaffidabile (verificato empirico: 15
  /compact in 14 giorni, sessioni 60% > 200 turn = probabile saturazione)

## Diagnosi empirica

Boot context baseline ~40-75K token (CLAUDE.md global+project + MEMORY.md +
skills metadata + agents metadata + SessionStart inject). 1M context window
totale → boot consuma 4-7.5%. Resta ~920K-960K per il task. MA: il task
"implementa FASE 2.1-2.8" può tranquillamente richiedere 600K+ tokens (file
multipli letti, edit ripetuti, test, errori, retry).

Letteratura rilevante:
- BACM (Budget-Aware Context Management) arxiv 2604.01664 — pattern compress/preserve
- Tokalator arxiv 2604.08290 — visibility invisible budget consumers
- Task Decomposition Strategies — break-down pre-execution

## Soluzione che sto progettando

**Hook UserPromptSubmit** intercetta il prompt iniziale `leggi <file>.md`:

1. Legge il file puntato
2. Estimator euristico:
   - Conta STEP/FASE numerati
   - Pesa keyword: implementa=10, refactor=8, test=5, debug=6, migrate=12
   - Conta path file da toccare (parse src/, tests/, /Volumes/)
   - Conta sub-task indipendenti
3. Score → stima tokens richiesti (regressione su dati storici di sessioni
   completate vs saturated)
4. Confronto vs context disponibile (1M - boot 50K - margin sicurezza 200K =
   ~750K usable)
5. Se `task_estimate / context_disponibile > 50%`:
   - Inietta system-reminder MANDATORY con 3 opzioni:
     - (a) scope cut esplicito (founder decide quale FASE)
     - (b) delega via Task tool a subagent (context isolato)
     - (c) split in N sessioni con handoff esplicito
   - Forza acknowledgement ("ho letto, scelgo opzione X") prima di partire
6. Audit log per regressione score futura

**Variante con LLM**: per task complessi, chiamata Gemini Flash gratis
(via vos-llm-router) per scoring intelligente invece di parser euristico.
Trade-off: latency +2s al prompt entry, accuracy ++.

## Domande per cui voglio second opinion

1. **Approccio è corretto?** Hook UserPromptSubmit è il punto giusto, o
   ci sono pattern migliori (es. modificare prompt template iniziale per
   forzare CC stessa a valutare task-fit prima di partire)?

2. **Estimator euristico è realistico?** Pesi keyword + count step è troppo
   naïf? Cosa usano BabyAGI/AutoGPT/CrewAI per task decomposition pre-exec?

3. **Soglia 50% è ragionevole?** Su 1M context, 750K usable, soglia 50% = task
   stimato max 375K tokens. Cosa suggerisce la letteratura su safety margin?

4. **Pattern alternativi che dovrei considerare**:
   - "Speculative pre-flight": CC fa first-pass quick lettura task, emette
     self-assessment ("questo task richiede ~X tokens, ho Y disponibili,
     proseguo/scopecut")
   - "Mandatory subagent dispatch": ogni task multi-step OBBLIGATORIAMENTE
     delegato a subagent fresh-context, mai eseguito da main
   - "Session-level task limit": max 1 FASE per sessione, forced handoff

5. **Anti-pattern strutturali da evitare**: cosa sbaglierei se implemento
   come proposto?

6. **MVP minimo**: qual è la versione 0.1 utilizzabile in 1-2 ore di lavoro,
   che produce dati per regressione futura?

## Constraints VOS (rispettare nel design)

- Free-tier first (Gemini Flash gratis ammesso, Anthropic API a pagamento NO)
- Hook deve girare in <2s (timeout UserPromptSubmit)
- Big Sur macOS 11.7.10 (Python 3.13)
- Fail-soft: se hook crash, CC parte normalmente (no hard-fail)
- Idempotente
- Audit log in jsonl

## Output richiesto

- Verdict approccio: GO / REVISE / REJECT
- Se REVISE: cosa cambiare
- Se REJECT: alternativa concreta
- MVP step-by-step (max 5 step)
- Risk del design proposto (top 3)

---

Rispondi sintetico (max 600 parole). Non sviluppare codice, solo
architettura + verdict.
