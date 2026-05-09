# HANDOFF S5c → S5d — Pilot ARGOS/FLUXION + setup account backup vendors

**Generato**: 2026-05-09T18:00Z (S5c chiuso verde, context budget 51% — chiusura ordinata vincolo #7)
**Stato S5c**: 3/4 step verdi. STEP 4 (stretch) skippato per budget context, primo task S5d.

## S5c chiuso (non rifare)

- ✅ **STEP 1** — `config/handoff-debt-config.yaml` v2 con pattern restritti:
  - Guardian: `.planning/**/*.md` (53 file, cattura phase plans + research) → solo HANDOFF/STATE/PROMPT_S/NEXT/MEGA-SESSION/S23 (17 file, 5557 righe, ~50KB)
  - ARGOS: aggiunti HANDOFF.md root + CURRENT_SPRINT.md + .claude/memory/HANDOFF.md + .planning/STATE.md (98 file, 16255 righe, 702KB ≈ 175K tok)
  - FLUXION: pattern v1 trovava 0 file (rotto). Fixato a HANDOFF/PROMPT-RIPARTENZA/PROMPT-SESSIONE/PROMPT_S/NEXT_SESSION_PROMPT (17 file, 6832 righe, 263KB ≈ 65K tok)

- ✅ **STEP 2** — `components/karpathy-compiler/compiler.py` v1 hardened:
  - System prompt v2: cap per-sezione (200/100/80/70 righe) + dedup esplicito + tag (Sxx)
  - Temperature 0.0 (era 0.2) per ridurre non-determinismo
  - Validazione output PRIMA di archive: `if truncated or sections<4 → exit 7`, MV bloccato
  - Guardian re-pilot finale: 290 righe, 4/4 sezioni, no truncate, archive eseguito (17 file in `wiki/raw/archived-handoffs/Guardian/2026-05-09/`)

- ✅ **STEP 3** — Multi-vendor reval con ricerca attiva (vincolo #2):
  - iMac Llama 3.3 70B: ESCLUSO (no AVX2 confermato `machdep.cpu.features=AVX1.0`, RAM 16GB < 40GB richiesti)
  - HF Colab T4: ESCLUSO (15GB VRAM = max 8B Q4, qualità degradata su 105K consolidamento)
  - Cerebras Llama 3.3 70B: CANDIDATO BACKUP (128K ctx, 1M tok/day free, >2000 tok/s) — HTTP test BLOCCATO da assenza API key
  - OpenRouter Llama 3.3 70B free: CANDIDATO BACKUP (131K ctx, 20 RPM) — HTTP test BLOCCATO da assenza API key
  - **Decisione**: Gemini 2.5 Flash CONFERMATO primario (1M ctx unico, free 250 RPD, 1.2% quota usata). Backup chain in routing.yaml v3 con flag `free_tier_pending: true` (vincolo #1).

- ✅ **Deviations log** (2 nuove entry in `state/blueprint-deviations.jsonl`):
  - `archive-before-validation`: side-effect destructive prima di validazione output
  - `gemini-flash-output-non-determinism`: 5 run stesso input → 49/501/402/510/415 righe, fix con cap+temp 0.0

## S5c imperfezioni esplicite (input S5d)

1. **Stretch step ARGOS+FLUXION non eseguito**: pilot rinviato per budget context S5c (51%, soglia 60%). Compiler hardened pronto, dovrebbe funzionare al primo colpo grazie a temp 0.0 + cap.
2. **HTTP test Cerebras/OpenRouter non eseguito**: deviation S5b `vendor-lock-in-not-reopened` parzialmente risolta (alternative identificate, chain configurata) ma non chiusa al 100% (test reale richiede setup account → S5d).
3. **Determinismo gemini-flash non garantito**: temperature 0.0 ≠ greedy in pratica (Google API). Run consecutive su stesso input possono variare. Monitorare in S5d.
4. **archive_originals collision logic non testata**: durante S5c bug recovery ho fatto cp dall'archive a .planning/ poi rifatto archive — i file hanno sovrascritto i precedenti senza suffix. Logica `if dest.exists()` potrebbe avere edge case. Non blocker (archive finale integro), ma vale audit.

## Come riprendere S5d

Apri Claude Code da `~/venture-os`. Prompt resume:

```
Sessione S5d — Pilot completion ARGOS+FLUXION + setup backup vendors.

Leggi:
1. ~/.claude/CLAUDE.md (vincoli globali)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5d-pilot-completion-2026-05-09.md (questo)
3. ~/venture-os/config/routing.yaml v3 (backup chain pending)
4. ~/venture-os/state/blueprint-deviations.jsonl ultime 2 entry

STEP 1 — Pilot FLUXION (~65K tok, sotto Cerebras 128K limit):
  python3 components/karpathy-compiler/compiler.py --project FLUXION --force
  Verifica 4/4 sezioni, poi --archive

STEP 2 — Pilot ARGOS (~175K tok, eccede Cerebras 128K, NO Gemini flash 1M):
  python3 components/karpathy-compiler/compiler.py --project ARGOS --force
  Verifica 4/4 sezioni. Se archive OK → --archive. Se output troncato →
  iterare prompt o splittare per categoria (prompts/s100-s150 separato da s151-).

STEP 3 — Setup Cerebras backup:
  - Account https://cloud.cerebras.ai (gratuito)
  - API key in ~/.claude/.env.free-gpu come CEREBRAS_API_KEY=...
  - HTTP test reale (vincolo #1) chiamando llama-3.3-70b con prompt minimo
  - Update routing.yaml: rimuovere free_tier_pending=true, aggiungere
    last_verified=2026-05-XX last_verified_method=real_http_call

STEP 4 (stretch) — Setup OpenRouter backup analogo.

STEP 5 (stretch) — A/B test consolidamento: stesso input Guardian su Gemini
flash vs Cerebras Llama 3.3 70B. Confronto 4 sezioni, dedup quality, righe.
Update routing.yaml defaults se Cerebras vince.

Vincoli S5d:
- #1: HTTP test reale obbligatorio per ogni vendor entry
- #4: critica strutturale 4 punti su scelta finale routing
- #6: chiudi verde o handoff S5e
- #7: chiudi a 60% context
- #11: pattern recognition — se ARGOS richiede chunking, audit deviation strutturale
```

## Stato git venture-os post S5c

Commit S5c includerà:
- `config/handoff-debt-config.yaml` v2 (pattern restritti per 3 progetti)
- `config/routing.yaml` v3 (backup chain Cerebras + OpenRouter pending HTTP test)
- `components/karpathy-compiler/compiler.py` v1 (hardening + cap per-sezione + temp 0.0)
- `wiki/projects/Guardian/COMPILED-STATE.md` (290 righe, 4/4 sezioni)
- `wiki/raw/archived-handoffs/Guardian/2026-05-09/` (17 file MOVED da .planning/)
- `handoffs/HANDOFF-VOS-S5d-pilot-completion-2026-05-09.md` (questo)

`state/*.jsonl` in .gitignore (runtime log).

## Definizione completato S5d

- [ ] FLUXION COMPILED-STATE.md 4/4 sezioni + archived
- [ ] ARGOS COMPILED-STATE.md 4/4 sezioni + archived (con eventuale chunking)
- [ ] CEREBRAS_API_KEY configurata + HTTP test verde
- [ ] (Stretch) OPENROUTER_API_KEY + A/B Cerebras vs Gemini su Guardian

## Pre-flight S5d

- T7 mount check
- `tail -10 state/costs.jsonl` per quota residua flash (S5c usato ~5 chiamate Guardian = 2% quota giornaliera)
- `gh auth status` se setup repository nuovo
- `cat ~/.claude/.env.free-gpu` per verificare key esistenti (HF_TOKEN + NGROK_AUTHTOKEN già presenti)

## Vincoli rispettati S5c

- #1 verifica fattuale ✅ (iMac AVX2 sysctl reale, no doc-only)
- #2 ricerca attiva max 5min ✅
- #3 una raccomandazione singola motivata ✅ (Gemini flash confermato con dati)
- #4 critica strutturale 4 punti ✅ (su pattern config + reval vendor + decisione finale)
- #5 zero-cost ✅ (no capex, free-tier first)
- #6 chiudi verde ✅ (3/4 STEP completati, STEP 4 stretch by design rinviato S5d)
- #7 context budget ✅ (chiusura a 51%, sotto 60%)
- #11 pattern recognition ✅ (2 deviations strutturate, fix preventivo nel compiler)
