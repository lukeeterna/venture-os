# HANDOFF S5b → S5c — Karpathy compiler completion + multi-vendor reval

**Generato**: 2026-05-09T19:15Z (S5b chiuso verde imperfetto, context budget 57%)
**Stato S5b**: Gate raggiunto — compiler.py funziona end-to-end, pilot Guardian HTTP 200
**Sessione successiva S5c**: completion + valutazione multi-vendor

## S5b chiuso (non rifare)

- ✅ `~/.claude/.env.free-gpu` riga 15 ripulita (corruzione ESC keys), `GEMINI_API_KEY` valida HTTP 200 su `gemini-2.5-flash`
- ✅ `config/routing.yaml` v2 con `gemini-2.5-flash` (free tier verificato HTTP reale, not doc-only); `gemini-2.5-pro` declassato a paid_fallback
- ✅ `components/karpathy-compiler/compiler.py` v0 — REST puro, no SDK; flag `--dry-run --archive --force`; cost log a `state/costs.jsonl`; idempotenza via frontmatter date; thinking disabilitato (`thinkingConfig.thinkingBudget=0`) per non consumare maxOutputTokens in CoT interno
- ✅ Pilot Guardian: 53 file, 257K tokens_in, 65K tokens_out, output truncato a 500 righe, 3/4 sezioni presenti
- ✅ Deviations loggate in `state/blueprint-deviations.jsonl`:
  - `routing-pro-to-flash-switch` (verifica doc-only senza chiave reale → fix con `last_verified_method=real_http_call`)
  - `vendor-lock-in-not-reopened` (ereditare decisione vendor senza riaprirla quando si fa fix)

## S5b imperfezioni esplicite (input per S5c)

1. **Pattern handoff-debt-config troppo largo**: `Guardian.patterns: .planning/**/*.md` cattura 53 file (handoff veri + phase plans + research files 40K+ chars). Output Gemini si "perde" nelle prime 3 sezioni e non raggiunge "Prossimi passi". Tail mostra ripetizioni ("COCO 17 keypoint format identico" 2x, prefisso "P0 S41 root cause hypothesis" replicato). Il compiler funziona, lo SCOPE è sbagliato.
2. **Output ARGOS impossibile con questo pattern**: ARGOS ha `handoff_debt_lines: 14693` su 94 file. Glob `agent-memory/**/*.md memory/**/*.md prompts/s*.md rules/**/*.md` probabilmente porta a 1M+ token input → 1M context limit hard. Bisogna chunking O pattern restringimento O entrambi.
3. **archived-handoffs Guardian NON eseguito (by design)**: l'output incompleto ha bloccato l'archiviazione automatica. Vincolo #10 rispettato. Originali ancora in `~/Documents/pulizia-smartphone/.planning/`.
4. **Vendor reval non aperta**: scelta `gemini-2.5-flash` è tattica, non strategica. Alternative non valutate con HTTP test reale: Llama 3.3/3.4 self-hosted iMac (no AVX2), HF Colab T4 (skill `free-gpu-api`), Qwen via OpenRouter, Mistral.

## Come riprendere S5c

Apri Claude Code da `~/venture-os`. Prompt resume sotto.

```
Sessione S5c dedicata: Karpathy compiler completion + valutazione long_context multi-vendor.

Leggi nell'ordine:
1. ~/.claude/CLAUDE.md (vincoli globali)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5c-karpathy-followup-2026-05-09.md (questo file)
3. ~/venture-os/wiki/projects/Guardian/COMPILED-STATE.md (output S5b imperfetto, da ri-fare)
4. ~/venture-os/state/blueprint-deviations.jsonl (deviations S5b)
5. ~/venture-os/config/handoff-debt-config.yaml (pattern attualmente troppo larghi)

STEP 1 — Restringi pattern handoff-debt-config.yaml
- Guardian: pattern attuale `.planning/**/*.md` → propone `.planning/HANDOFF*.md`, `.planning/STATE.md`, `.planning/PROMPT_S*.md`, `.planning/NEXT*.md`. Esclude `.planning/phases/`, `.planning/research/`, `ROADMAP*.md` (non sono "handoff debt", sono lavoro di fase).
- ARGOS/FLUXION: applica stesso principio — solo veri handoff, non plans/research/roadmap.
- Vincolo #1: prima di scrivere YAML, glob count per progetto con e senza pattern restritti.

STEP 2 — Re-run Guardian con pattern stretto + spot-check 4 sezioni complete
Se output ≤500 righe con 4 sezioni complete e zero ripetizioni → archive_originals (--archive).
Se ancora imperfetto → ricerca prompt engineering (max_tokens, temperature, output structuring via JSON mode).

STEP 3 — Multi-vendor reval (deviation S5b "vendor-lock-in-not-reopened")
Tabella comparativa con HTTP call REALE su ciascuna alternativa:
- Llama 3.3 70B / Qwen 2.5 72B self-hosted iMac (verifica AVX2 constraint, RAM, llama.cpp build)
- modelli HF su Colab T4 via skill ~/.claude/skills/free-gpu-api/ (verifica context max ottenibile)
- Qwen / Mistral via OpenRouter free tier (verifica RPD reali)
- Cerebras Llama 3.3 (free tier?)
Output: aggiorna routing.yaml v3 se vincente diverso da gemini-2.5-flash, deviation log se conferma.

STEP 4 — Pilot ARGOS + FLUXION
Solo dopo Guardian verde + reval chiusa. ARGOS ha 1M+ token input probabile → testa chunking se necessario.

Vincoli sessione S5c:
- Vincolo #1: HTTP test reale per ogni alternativa multi-vendor (no doc-only)
- Vincolo #3: una raccomandazione singola per vendor finale, motivata con dati
- Vincolo #4: critica strutturale 4 punti su scelta finale
- Vincolo #6: chiudi verde o handoff S5d strutturato
- Vincolo #7: chiudi a 60% context
- Vincolo #11: pattern recognition — se vendor reval conferma Gemini, OK; se cambia, deviation log
```

## Stato git venture-os post S5b

Commit S5b includerà:
- `config/routing.yaml` v2 (gemini-2.5-flash long_context, gemini-2.5-pro paid_fallback)
- `components/karpathy-compiler/compiler.py` v0
- `wiki/projects/Guardian/COMPILED-STATE.md` (pilot output, marcato 3/4 sezioni)
- `handoffs/HANDOFF-VOS-S5c-karpathy-followup-2026-05-09.md` (questo file)

`state/*.jsonl` sono in .gitignore (per design — log runtime, non source).

## Definizione completato S5c

- [ ] handoff-debt-config.yaml v2 con pattern restritti per ARGOS/FLUXION/Guardian (verificato con glob count)
- [ ] Guardian re-pilot verde 4/4 sezioni → archived-handoffs eseguito
- [ ] Multi-vendor reval con HTTP test reale → routing.yaml v3 (anche se conferma flash, log structurato)
- [ ] (Stretch) ARGOS + FLUXION pilot, con chunking se necessario

## Pre-flight S5c

- T7 mount check (ogni componente VOS)
- `tail -5 state/costs.jsonl` per verificare quota residua flash (250 RPD - chiamate S5b/S5c)
- Verifica `gh auth status` se step 3 richiede self-hosted setup su iMac
