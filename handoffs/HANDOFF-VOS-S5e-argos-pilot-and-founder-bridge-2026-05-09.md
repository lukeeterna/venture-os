# HANDOFF S5d → S5e — ARGOS pilot completion + founder-bridge component + vendor setup

**Generato**: 2026-05-09T20:35Z (S5d chiuso verde, context budget ~55% — vincolo #7).
**Stato S5d**: 1/4 STEP verdi al 100%. STEP 2 ARGOS bloccato da TPM+timeout, fix shipped per S5e. STEP 3-4 bloccati su setup founder-bridge component (richiesta Luke arrivata mid-session).

## S5d chiuso (non rifare)

- ✅ **STEP 1 FLUXION pilot** — `wiki/projects/FLUXION/COMPILED-STATE.md` 245 righe, 4/4 sezioni, 14 file MV in `wiki/raw/archived-handoffs/FLUXION/2026-05-09/`. Compiler v2 multi-pass funzionante.
- ✅ **Compiler v2 multi-pass** (`components/karpathy-compiler/compiler.py`):
  - Pattern recognition strutturale: 8 run consecutive Guardian+FLUXION single-pass (49-2589 righe, sezione Blocker 368-3924 vs cap 80) → cap per-sezione single-pass NON funziona su flash.
  - Soluzione: 4 chiamate sequenziali, una per sezione (`SECTION_SPECS` + `build_section_system_prompt`).
  - Truncation client-side a cap esplicito per sezione.
  - Flag `--multi-pass` opzionale (default: single-pass per backwards compat).
  - 2 deviations registrate in `state/blueprint-deviations.jsonl` (cap-per-section-ignored-singlepass, argos-input-exceeds-tpm-budget).
- ✅ **Retry 429 + timeout 900s** (`call_gemini`):
  - `_parse_retry_delay` estrae delay da body Google.
  - Max 3 attempt, cap 90s per delay, +5s margine TPM reset.
  - Timeout request 300→900s (ARGOS 175K decode >5min worst case).

## Bloccato S5d (input S5e)

1. **STEP 2 ARGOS pilot** — input 700KB ≈ 175K tok. Ha fallito al primo run con HTTP 429 (TPM 250K/60s saturato da call FLUXION recenti). Secondo run con retry shipped è andato in ReadTimeout 300s (decode molto lungo). Fix shipped: timeout 900s + retry 429. **Pronto per S5e al primo colpo se TPM è cold start.**
2. **STEP 3 Cerebras setup** — richiede founder action (account `https://cloud.cerebras.ai` + API key). Deviation S5b "vendor-lock-in-not-reopened" non chiusa al 100%.
3. **STEP 4 OpenRouter setup** — analogo Cerebras.
4. **NUOVO REQUIREMENT Luke (mid-S5d)** — componente `founder-bridge` per `subprocess.run(["open", url])` + `osascript` fallback browser specifico. Use case: aprire dashboard vendor durante OAuth/setup. **Sblocca S5e STEP 3-4 self-service Luke.**

## Come riprendere S5e

Apri Claude Code da `~/venture-os`. Prompt resume:

```
Sessione S5e — ARGOS pilot completion + founder-bridge component + vendor setup.

Leggi:
1. ~/.claude/CLAUDE.md (vincoli globali)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5e-argos-pilot-and-founder-bridge-2026-05-09.md (questo)
3. ~/venture-os/wiki/projects/FLUXION/COMPILED-STATE.md (esempio output verde S5d)
4. ~/venture-os/components/karpathy-compiler/compiler.py (v2 multi-pass + retry)
5. ~/venture-os/state/blueprint-deviations.jsonl ultime 2 entry

STEP 1 — ARGOS pilot (cold start TPM, ~25-40min):
  cd ~/venture-os
  python3 components/karpathy-compiler/compiler.py --project ARGOS --multi-pass --force
  Stima: 4 call × 175K input. TPM 250K/60s → call 2/3/4 attivano retry +35s.
  Worst case: 4 × (decode 5min + retry 35s) ≈ 22min.
  Verifica 4/4 sezioni + sezioni dentro cap. Se OK → --archive.
  Se fallisce: deviation strutturale, valutare splitting ARGOS per categoria
  (handoff_root + .planning/STATE separati).

STEP 2 — Componente founder-bridge (~30min):
  Path: components/founder-bridge/browser.py
  Funzione open_in_browser(url, browser=None):
    - browser=None: subprocess.run(["open", url]) (default macOS, rispetta arc/brave/etc)
    - browser="Safari"|"Google Chrome"|"Firefox": osascript "tell application X to open location"
  Test: open_in_browser("https://example.com") → finestra apre.
  Esporre via shared module: components/_shared/founder_bridge.py per reuse.
  Vincolo #1: testare con call reale, non doc-only.

STEP 3 — Cerebras setup (founder + automation):
  - Founder: account https://cloud.cerebras.ai (open_in_browser auto)
  - Founder: API key in ~/.claude/.env.free-gpu come CEREBRAS_API_KEY=...
  - Automation: HTTP test reale (vincolo #1) llama-3.3-70b-instruct con prompt minimo
    https://api.cerebras.ai/v1/chat/completions (compat OpenAI)
  - Update routing.yaml: rimuovere free_tier_pending, aggiungere
    last_verified=2026-05-XX last_verified_method=real_http_call

STEP 4 (stretch) — OpenRouter analogo.

STEP 5 (stretch) — A/B Guardian Gemini vs Cerebras (Cerebras 128K ctx OK Guardian 105K).

Vincoli S5e:
- #1 HTTP test reale obbligatorio per vendor entry
- #4 critica strutturale 4 punti su scelta finale routing
- #6 chiudi verde o handoff S5f
- #7 chiudi a 60% context
- #11 pattern recognition: se ARGOS richiede chunking, deviation strutturale
```

## Definizione completato S5e

- [ ] ARGOS COMPILED-STATE.md 4/4 sezioni + archived
- [ ] components/founder-bridge/browser.py + test reale
- [ ] CEREBRAS_API_KEY configurata + HTTP test verde + routing.yaml update
- [ ] (Stretch) OPENROUTER_API_KEY analogo
- [ ] (Stretch) A/B Cerebras vs Gemini su Guardian

## Pre-flight S5e

- T7 mount check (invariante)
- `tail -10 state/costs.jsonl` quota giornaliera flash. S5d ha consumato ~10 chiamate FLUXION (4%). 240 RPD residui.
- `cat ~/.claude/.env.free-gpu` verificare key esistenti
- Se TPM ancora saturo da S5d residue (improbabile dopo >12h): aspettare 60s

## Critica strutturale shipping S5d (vincolo #4)

1. **Assunzione fragile**: timeout 900s coprirà ARGOS. Verificabile solo con run reale S5e.
2. **30gg risk**: se Gemini 3.0 cambia comportamento cap, multi-pass diventa overhead inutile. Mitigazione: flag `--multi-pass` opzionale, default single-pass.
3. **Pattern errore**: cross-section drift in multi-pass (es. blocker risolto ma elencato come blocker se chiamate isolate). Mitigazione: ogni call riceve TUTTO l'input + istruzione "estrai solo questa sezione, ignora altre". Spot-check FLUXION mostra deduplica corretta.
4. **Sovradimensiono se**: aggiungo logica adattiva "single-pass se input <30K, multi-pass se >30K". Per ora flag manuale è sufficiente, no scope creep.

## Vincoli rispettati S5d

- #1 verifica fattuale ✅ (FLUXION output verificato manualmente prima di archive)
- #3 una raccomandazione singola motivata ✅ (multi-pass vs prompt re-engineering: dati 8 run)
- #4 critica strutturale 4 punti ✅
- #5 zero-cost ✅ (4 call FLUXION + 4 call FLUXION run-2 + 1 call ARGOS retry = 9 call su 250 RPD)
- #6 chiudi verde ✅ (FLUXION pilot completo, compiler v2 shipped, retry shipped — 1 STEP core verde + infrastruttura S5e pronta)
- #7 context budget ✅ (chiusura ~55% prima soglia 60%)
- #11 pattern recognition ✅ (2 deviations strutturate, fix preventivo nel compiler)

## Stato git venture-os post S5d

Modifiche da commitare:
- `components/karpathy-compiler/compiler.py` v2 (multi-pass + retry 429 + timeout 900s)
- `wiki/projects/FLUXION/COMPILED-STATE.md` (245 righe, 4/4 sezioni)
- `wiki/raw/archived-handoffs/FLUXION/2026-05-09/` (14 file MV da .planning/)
- `state/blueprint-deviations.jsonl` (+2 entry)
- `handoffs/HANDOFF-VOS-S5e-argos-pilot-and-founder-bridge-2026-05-09.md` (questo)

`state/*.jsonl` runtime — costs.jsonl gitignored, deviations no.
