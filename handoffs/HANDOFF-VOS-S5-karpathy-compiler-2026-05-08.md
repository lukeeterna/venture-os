# HANDOFF S4 → S5 — Pattern compilation Karpathy operativo

**Generato**: 2026-05-08T17:50Z (fine sessione S4)
**Sessione successiva**: S5 dedicata implementazione compiler + pilot Guardian
**Stato S4 chiuso**: VERDE (3/3 debiti tecnici risolti, vedi commit `f15aad5`)

---

## Come riprendere

1. Chiudi sessione S4 corrente (`/exit`)
2. Apri nuova sessione Claude Code da `~/venture-os`
3. Incolla il prompt nel blocco qui sotto

---

## Prompt resume (copia-incolla in nuova sessione)

```
Sessione S5 dedicata: implementare componente karpathy-compiler in VOS e
fare pilot su Guardian (debt più alto: 16.398 righe, stack più semplice).

Leggi nell'ordine:
1. ~/.claude/CLAUDE.md sezione "Pattern compilation Karpathy" (definisce contratto)
2. ~/.claude/projects/-Users-macbook/memory/MEMORY.md (4 voci)
3. ~/venture-os/state/projects-inventory.yaml (fonte: handoff_files per ogni progetto)
4. ~/venture-os/briefs/$(date +%F).md (3 segnali ⚠ compilation raccomandata)
5. ~/venture-os/handoffs/HANDOFF-VOS-S5-karpathy-compiler-2026-05-08.md (questo file)

Affronta in ordine, uno step alla volta con verifica:

STEP 1 — config/routing.yaml bootstrap
Creare config/routing.yaml con almeno 1 model "long_context" (target: contesto
≥500K tokens per leggere 16K righe handoff Guardian senza chunking).
Candidati free-tier verificati 2026-05: Gemini 2.5 Pro (1M context) via API key
gratuita oppure OpenRouter free models. NIENTE training-data guesses su prezzi:
verifica con WebSearch/doc upstream PRIMA di scrivere il file.
Schema YAML deve includere: model_id, provider, context_window, cost_per_1m_in,
cost_per_1m_out, free_tier (bool). Una raccomandazione singola motivata.

STEP 2 — components/karpathy-compiler/compiler.py
Pipeline: legge inventory → per progetto target legge tutti i handoff_files
(elenco già in inventory) → costruisce singolo prompt → chiama LLM long_context
da routing.yaml → riceve markdown ≤500 righe → scrive in
wiki/projects/<NAME>/COMPILED-STATE.md → archivia handoff originali in
wiki/raw/archived-handoffs/<project>/<YYYY-MM-DD>/.

Vincoli implementazione:
- Idempotenza: rilanciare su stesso progetto stesso giorno = no-op (skip se
  COMPILED-STATE.md esiste con data odierna in frontmatter)
- Cost tracking: ogni chiamata LLM logga in state/costs.jsonl (model, tokens_in,
  tokens_out, cost_usd, project, ts) — soglia hard €30/mese da CLAUDE.md
- Dry-run mode: --dry-run stampa prompt + tokens stimati senza chiamare LLM
- Safety: NON cancellare handoff originali, solo MV in archived-handoffs/. Mai
  --delete o rm su file utente.

STEP 3 — Pilot Guardian
Eseguire compiler.py --project Guardian. Verificare:
- COMPILED-STATE.md generato ≤500 righe
- Contiene almeno: stato attuale, decisioni chiuse, blocker aperti, prossimi passi
  (4 sezioni minimo da pattern Karpathy CLAUDE.md)
- Handoff originali archiviati in wiki/raw/archived-handoffs/Guardian/2026-05-08/
- state/costs.jsonl ha entry con cost_usd reale
- Prossimo run scanner mostra Guardian sotto soglia (handoff_debt_lines < 1500)

Se pilot Guardian verde → ARGOS (più rischioso, persona Luca Ferretti production).
Poi FLUXION. Se uno step fallisce in S5: handoff S5 → S6 sullo stesso modello.

Vincoli sessione: una raccomandazione tecnica per volta, autocritica 4 punti
dopo ogni proposta, push automatico via hook esistente, niente PARTIAL.
Verifica fattuale obbligatoria su API LLM/prezzi/context window prima di
scrivere routing.yaml (vincolo #1 CLAUDE.md, mai inventare versioni/prezzi).
```

---

## Contesto già su disk (S5 deve solo leggerlo)

### Pattern definito in CLAUDE.md (citato letterale)
> Quando un progetto accumula HANDOFF/MEMORY/STATO_CORRENTE > 2000 righe totali:
> 1. LLM `long_context` (Gemini 2.5 Pro 1M context) legge tutti gli handoff
> 2. Produce `wiki/projects/<NAME>/COMPILED-STATE.md` max 500 righe (stato attuale verificato + decisioni chiuse + blocker aperti + prossimi passi)
> 3. Vecchi handoff archiviati in `wiki/raw/archived-handoffs/<project>/<data>/`
> 4. Sessioni successive partono leggendo solo COMPILED-STATE.md

### Stato VOS post-S4
- **Componenti esistenti**: `_shared`, `brief-tracker`, `claude-memory-backup`, `disk-keeper`, `host-monitor`, `morning-briefer`, `project-scanner`
- **Componenti mancanti** (S5): `karpathy-compiler` (nuovo)
- **Config esistenti**: `disk-keeper-include.yaml`, `handoff-debt-config.yaml`, `projects-whitelist.yaml`
- **Config mancanti** (S5 STEP 1): `config/routing.yaml`
- **Wiki struttura**: `wiki/projects/{ARGOS,FLUXION,Guardian}/index.md` (stub da scanner). `wiki/raw/`, `wiki/workflows/` vuoti.

### Inventory progetti (debt corrente, fonte: brief 2026-05-08)
- ARGOS: 14.693 righe / 94 file (soglia 2000) → SECONDO pilot
- FLUXION: 3.277 righe (soglia 2000) → TERZO pilot
- **Guardian**: 16.398 righe (soglia 1500) → **PILOT scelto S5** (debt più alto, ma stack TBD = basso rischio se compilation perde sfumature)

### Stato git venture-os
- HEAD: `f15aad5` (S4 close)
- Remote `imac`: parità verificata (drift None)
- Ultimi 3 commit: `f15aad5`, `e980fb9` (test empty drift), `e026dd5`

### Vincoli VOS rilevanti per S5 (da CLAUDE.md)
- **Costo**: soglia hard **€30/mese** LLM tracciati in `state/costs.jsonl`. Free-tier first.
- **Big Sur**: blacklist librerie `paddleocr`, `torch`, `tensorflow` ecc. Niente preflight necessario per LLM cloud (no install pesante locale).
- **Hardware**: T7 mount obbligatorio (`require_t7_or_exit` come morning-briefer).
- **Output verificato > verosimile**: API LLM cambia spesso, verifica con WebSearch/doc upstream PRIMA di scrivere routing.yaml.

---

## Definizione di completato S5 (per non chiudere PARTIAL)

- [ ] STEP 1: `config/routing.yaml` versionato, almeno 1 model long_context con cost_per_1m verificato da doc upstream
- [ ] STEP 2: `components/karpathy-compiler/compiler.py` testato in dry-run + idempotenza + cost log
- [ ] STEP 3: pilot Guardian verde — COMPILED-STATE.md ≤500 righe + handoff archiviati + scanner conferma debt sotto soglia + entry costs.jsonl reale

Se uno step si rivela troppo grande in S5, handoff S5 → S6 sullo stesso modello.

---

## Rischi noti (per S5 awareness)

1. **API LLM gratuite spariscono o cambiano rate limit** — verifica fattuale obbligatoria prima di committare routing.yaml a un provider specifico.
2. **Compilation lossy** — il LLM può "inventare" stato non presente negli handoff. Mitigazione: prompt include vincolo "SOLO contenuto presente negli handoff, mai inferenza". S5 deve includere almeno 1 spot-check manuale.
3. **Pilot Guardian può rivelare che il pattern è troppo aggressivo** — se COMPILED-STATE.md non cattura abbastanza contesto operativo, alzare soglia righe (max 500 → max 800?) o splittare in COMPILED-STATE.md + DECISIONS.md.
