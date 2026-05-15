# FLUXION Prompt v3 — Review CTO Senior

> **Reviewer**: Claude (CTO senior review)
> **Target**: Prompt FLUXION Production Sprint S184-S188 v3
> **Date**: 2026-05-15
> **Context**: Review v3 post-fix v2 (10 fix originali: 3 BLOCKER + 7 HIGH)

---

## Premessa onesta

Non ho accesso al commit `7ed165d` del repo VOS né al testo della v2, quindi i "10 fix v2→v3" sono **inferiti** dal contenuto della v3 e dai pattern noti (S159, V5, vincoli founder). Dove non posso verificare l'esito del fix con certezza, lo dichiaro esplicitamente invece di inventare un verdict.

---

## PARTE A — Verifica fix v2→v3 (inferiti da contenuto v3)

| # | Fix originale (inferito) | Verdict |
|---|---|---|
| 1 | **BLOCKER** — Pricing tier €297 da rimuovere (decision S170-post-close) | ✅ **APPLICATO CORRECT**. P0 con audit `grep` esplicito + done criteria misurabile ("zero reference"). |
| 2 | **BLOCKER** — Ehiweb mechanic post-trial (founder explicit "SEMPLIFICARE") | ⚠️ **APPLICATO PARZIALE**. La P1 elenca 3 opzioni (a/b/c) ma viola vincolo #3 (una raccomandazione singola motivata, NO A/B/C). Dubbio #1 sblocca scelta ma il prompt non forza il CTO a decidere — lascia lo stallo. |
| 3 | **BLOCKER** — Workspace split FLUXION vs VOS/ARGOS | ✅ **APPLICATO CORRECT**. Riga 3 + memory pointers chiariscono cwd dedicato. |
| 4 | **HIGH** — Code signing Windows zero-capex | ✅ **APPLICATO CORRECT**. Decisione esplicita "NO cert" + reference guida esistente + tradeoff documentato. |
| 5 | **HIGH** — Numero WA FLUXION confermato | ✅ **APPLICATO CORRECT**. `3314928901` "Erica Fluxion" risolve dubbio v2. |
| 6 | **HIGH** — Stack WA sales agent (Baileys vs alternative) | ⚠️ **APPLICATO PARZIALE**. Decisione Baileys ok, ma "stesso iMac PM2 OR instance separata" lascia un OR irrisolto che è proprio il tipo di stack creep S159. |
| 7 | **HIGH** — Sara latency target verificabile | ✅ **APPLICATO CORRECT**. P95 <800ms + "3x consecutive run" + reference doc esistente. |
| 8 | **HIGH** — Beta program gate go/no-go esplicito | ✅ **APPLICATO CORRECT**. P6 con metric NPS + 4 settimane data + gate vincolo #6. |
| 9 | **HIGH** — AMBRA cross-reference ARGOS pattern | ⚠️ **APPLICATO PARZIALE**. P5 dice "TBD audit terminal ARGOS" — workspace cross-cut che vincolo workspace split dovrebbe evitare. Manca artifact concreto (es. "copia file X da ARGOS repo a FLUXION/docs/ambra-pattern.md prima di start"). |
| 10 | **HIGH** — Dubbi founder ridotti/risolti | ⚠️ **APPLICATO PARZIALE**. Da N dubbi v2 a 5 residui v3, ma il prompt dice "Rispondi prima ai **8 DUBBI FOUNDER** (block until clarified)" mentre nella sezione effettiva i dubbi residui sono **5**. Numerazione incoerente = signal di edit incompleto. |

### 🆕 Nuovo issue introdotto

Il prompt cita **"8 DUBBI FOUNDER"** ma ne lista **5**. Discrepanza numerica = errore di patching v2→v3.

---

## PARTE B — Nuovi issues critici v3

### 1. ❌ BLOCKER — Conteggio dubbi incoerente
- **Categoria**: `gap-context-business`
- **Issue**: "8 DUBBI FOUNDER" in start trigger vs 5 dubbi residui effettivi. Il CTO in esecuzione bloccherà su domanda inesistente o salterà dubbi.
- **Raccomandazione**: cambia start trigger riga 1 a "Rispondi prima ai **5 DUBBI FOUNDER residui**" + verifica conteggio.

### 2. ❌ BLOCKER — P1 Ehiweb viola vincolo #3
- **Categoria**: `vincolo-founder-violato`
- **Issue**: P1 Ehiweb presenta 3 opzioni a/b/c — viola vincolo #3 ("una raccomandazione singola motivata, NO opzioni A/B/C"). Founder ha esplicitamente proibito questo pattern.
- **Raccomandazione**: P1 deve diventare "Raccomandazione singola: opzione (a) affiliate link + UTM, motivata da [zero capex + zero dipendenza contrattuale + reversibile]. Autocritica 4 punti obbligatoria."

### 3. ❌ BLOCKER — P5 dipende da audit ARGOS cross-workspace
- **Categoria**: `dipendenza-nascosta`
- **Issue**: P5 sales agent dipende da "audit terminal ARGOS TBD" per pattern AMBRA. Vincolo workspace split impedisce a FLUXION-instance di leggere ARGOS repo direttamente. Stallo strutturale.
- **Raccomandazione**: aggiungi prerequisito P5 = "founder copia AMBRA spec da ARGOS in `/Volumes/MontereyT7/FLUXION/docs/ambra-pattern-import.md` prima di start P5". O P5 si sblocca o si sposta a S189.

### 4. ⚠️ HIGH — Dependency graph implicito
- **Categoria**: `sequenza-priorità-errata`
- **Issue**: Founder ha detto S170-post-close "FLUXION priority production quanto prima". P5 Sales agent (5-8h) → P6 Beta program = catena sequenziale 13-16h prima del gate verde. P2 MSI Build + P3 Sentry + P4 latency sono i veri unblocker production technical. Ordine corrente sembra giusto ma il prompt non rende esplicito che P5+P6 sono blocco gate, P0-P4 sono technical readiness parallelizzabile.
- **Raccomandazione**: aggiungi sezione "DEPENDENCY GRAPH" 3 righe: "P0,P1,P2,P3,P4 = technical readiness parallelizzabile. P5→P6 sequenziali. P7 = P0..P6 all green."

### 5. ⚠️ HIGH — P4 latency budget time ottimistico
- **Categoria**: `assunzione-sbagliata`
- **Issue**: P4 Sara latency "4-6h" per andare da 1330ms → <800ms (riduzione 40%+). Stima ottimista senza verifica root cause. Doc `D3-voice-latency.md` esiste ma il prompt non forza root cause analysis prima di optimization (vincolo #11).
- **Raccomandazione**: P4 step 1 = "leggi D3-voice-latency.md, identifica top-3 contributors P95, ricalcola budget time se >6h serve handoff S185". No optimization blind.

### 6. ⚠️ HIGH — Dubbio #2 presuppone clienti esistenti
- **Categoria**: `dubbio-founder-mancante`
- **Issue**: Dubbio #2 ("clienti BASE €297 esistenti come gestiamo") presuppone esistano clienti paganti. Se FLUXION è pre-launch ALPHA (come stato attuale dichiara), questo dubbio è irrilevante o segnala stato confuso. Verificare: ci sono clienti €297 reali o no?
- **Raccomandazione**: riformula Dubbio #2 a "Esistono clienti €297 attualmente paganti? Se sì N=?, se no rimuovi questo dubbio."

### 7. ⚠️ HIGH — P5 generalizza su 9 verticali pre-validation
- **Categoria**: `vincolo-founder-violato`
- **Issue**: P5 sales agent target verticali = 9 verticali listati. Vincolo #1 verifica fattuale + founder pattern V5 cold-lead target wrong = generalizzare su 9 verticali pre-validation = ripetere errore noto.
- **Raccomandazione**: P5 done criteria già dice "1 verticale (es. saloni)" — ok. Ma rimuovi lista 9 verticali da discovery prospect, sostituisci con "1 verticale pilota scelto founder, scale gated da P6 risultati".

### 8. ⚠️ HIGH — P5 dipende da asset (landing + video) inesistenti
- **Categoria**: `dipendenza-nascosta`
- **Issue**: P5 sales agent richiede "landing page verticale-specifica" + "video demo Sara verticale" (Dubbi #3, #4 founder). Se entrambi non esistono, P5 esegue su materiali inesistenti.
- **Raccomandazione**: P5 prerequisito esplicito = "Dubbio #3 + #4 risolti (asset materiali esistenti o produzione schedulata in P5 stesso con budget time)".

### 9. 🔵 LOW — Memory FLUXION-instance path non specificato
- **Categoria**: `gap-context-business`
- **Issue**: Memory pointers VOS-side ("se vuota, lavora da scratch in dir locale FLUXION-instance") — non specifica dove salvare memory FLUXION nuova. Crea ambiguità per la prossima sessione.
- **Raccomandazione**: aggiungi 1 riga "Memory FLUXION-instance: salva feedback in `/Volumes/MontereyT7/FLUXION/.claude/memory/`".

### 10. 🔵 LOW — P7 MILESTONE 1 senza timeframe
- **Categoria**: `gap-context-business`
- **Issue**: Done criteria P7 "First public buyer paying €497 = MILESTONE 1" — buon outcome ma manca timeframe. Quando dichiariamo P7 fallito?
- **Raccomandazione**: "30 giorni post-launch senza primo buyer = retro vincolo #11 root cause, no extension".

---

## PARTE C — Verdict finale

# 🔴 NOT READY

### Azioni preliminari richieste prima di execution (bloccanti):

1. **Fix conteggio dubbi** start trigger ("8" → "5") — 30 secondi.
2. **Riscrivi P1 Ehiweb** in raccomandazione singola motivata (rimuovi a/b/c) — vincolo #3 violato è non-negoziabile per il workflow CTO.
3. **Risolvi dipendenza P5 → ARGOS** prima di start: o copia AMBRA spec in FLUXION repo, o sposta P5 a S189.
4. **Verifica realtà Dubbio #2** clienti €297 esistenti sì/no.

Una volta applicati questi **4 fix** la v4 è "READY FOR EXECUTION". Gli HIGH #5-#8 sono raccomandati ma il CTO in esecuzione può gestirli inline se i 4 bloccanti sono risolti.

---

## Nota onesta finale

Non avendo letto v2 né commit `7ed165d`, la **PARTE A è inferita**. Se vuoi review più solida, incolla la lista esplicita dei 10 fix originali e rifaccio la verifica punto per punto con verdict certificato anziché dedotto.

---

**Summary**:
- BLOCKER: **3**
- HIGH: **5**
- LOW: **2**
- Fix v2→v3 confermati: **5/10 ✅**, **4/10 ⚠️ parziali**, **1/10 🆕 nuovo issue**
