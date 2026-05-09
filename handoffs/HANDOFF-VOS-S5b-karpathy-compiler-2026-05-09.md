# HANDOFF S5 → S5b — Karpathy compiler implementation

**Generato**: 2026-05-09T16:30Z (S5 STEP 1 chiuso verde)
**Stato S5**: STEP 1 ✅ — `config/routing.yaml` bootstrap committato (`daec00d`), parità 3-way locale/imac/github
**Sessione successiva S5b**: STEP 2 (compiler.py) + STEP 3 (pilot Guardian)

## STEP 1 chiuso (non rifare)

`config/routing.yaml` versionato con:
- Model `long_context` = **gemini-2.5-pro** (Google API)
- Free tier verificato 2026-05-09 (sources upstream documentati inline)
- 1M context, 50 RPD, output 65K, $0
- Alternative scartate documentate: qwen/qwen3.6-plus PAID, qwen3-next:free 262K insufficiente

## Bonus chiuso S5-prep (non rifare)

- Remote `github` (PRIVATE) aggiunto, repo `lukeeterna/venture-os`, issues+wiki disabilitati
- Post-commit hook esteso multi-remote (`REMOTES=(imac github)`), log per-remote
- Fix HEAD bare repo iMac (`main` → `master`)
- Seed S6 in `seeds/S6-blueprint-backup.md` per blueprint update post-S5
- Deviation tracciata `git-backup-multi-remote-codified-ad-hoc`

## Come riprendere

1. Apri nuova sessione Claude Code da `~/venture-os`
2. Incolla prompt sotto

## Prompt resume (copia-incolla)

```
Sessione S5b dedicata: STEP 2 + STEP 3 di S5 Karpathy compiler.

Leggi nell'ordine:
1. ~/.claude/CLAUDE.md sezione "Pattern compilation Karpathy"
2. ~/venture-os/handoffs/HANDOFF-VOS-S5b-karpathy-compiler-2026-05-09.md (questo file)
3. ~/venture-os/config/routing.yaml (S5 STEP 1 chiuso, NON modificare)
4. ~/venture-os/state/projects-inventory.yaml (handoff_files per progetto)
5. ~/venture-os/handoffs/HANDOFF-VOS-S5-karpathy-compiler-2026-05-08.md (contesto originale)

STEP 2 — components/karpathy-compiler/compiler.py
Pipeline:
- legge config/routing.yaml → seleziona model role=long_context
- legge state/projects-inventory.yaml → trova handoff_files per --project
- costruisce prompt singolo: system "compila stato attuale + decisioni chiuse +
  blocker aperti + prossimi passi, ≤500 righe, SOLO contenuto presente, mai
  inferenza" + concat di tutti gli handoff
- chiama Gemini 2.5 Pro via API (auth: GEMINI_API_KEY env, vedi routing.yaml)
- riceve markdown ≤500 righe
- scrive in wiki/projects/<NAME>/COMPILED-STATE.md (frontmatter con date)
- archivia handoff originali in wiki/raw/archived-handoffs/<project>/<YYYY-MM-DD>/
  via MV (mai rm)

Vincoli implementazione:
- Idempotenza: skip se COMPILED-STATE.md esiste con data odierna in frontmatter
- Cost tracking: append a state/costs.jsonl (model, tokens_in, tokens_out,
  cost_usd, project, ts). Soglia hard €30/mese
- Dry-run: --dry-run stampa prompt + tokens stimati senza chiamare LLM
- Safety: NON cancellare handoff originali, MV in archived-handoffs/
- Errors: se rate limit Gemini (50 RPD), exit con messaggio chiaro + retry-after

STEP 3 — Pilot Guardian
Eseguire compiler.py --project Guardian. Verificare:
- COMPILED-STATE.md generato ≤500 righe
- 4 sezioni: stato attuale, decisioni chiuse, blocker aperti, prossimi passi
- Handoff originali archiviati in wiki/raw/archived-handoffs/Guardian/2026-05-09/
- state/costs.jsonl ha entry reale (anche se cost_usd=0 per free tier, traccia tokens)
- Brief mattutino successivo mostra Guardian sotto soglia (debt <1500)

Se Guardian verde → ARGOS. Poi FLUXION.

Vincoli sessione:
- Vincolo #1: GEMINI_API_KEY se non già in ~/.claude/.env.free-gpu o simile,
  chiedere a Luke di aggiungerla. NON inventare endpoint/parametri SDK
- Vincolo #2: WebSearch/doc Gemini Python SDK PRIMA di scrivere codice
- Vincolo #3: una raccomandazione singola per scelta SDK (google-genai vs
  google-generativeai vs REST puro)
- Vincolo #4: autocritica 4 punti dopo design pipeline
- Vincolo #7: chiudi sessione a 60% context. Se STEP 3 non chiude, handoff S5c
- Vincolo #8: se aggiungi deps Python al progetto, NO blacklist (paddleocr/
  torch/etc). google-genai è puro Python ~2MB, sicuro.
- Output verificato > verosimile: ogni claim API Gemini va da doc ufficiale
```

## Stato git venture-os post S5 STEP 1

- HEAD: `daec00d`
- Parità 3-way verificata: locale = `imac/master` = `github/master`
- Hook multi-remote attivo, ultimo successo log per entrambi 16:29:40Z

## Definizione completato S5b

- [ ] `components/karpathy-compiler/compiler.py` con dry-run + idempotenza + cost log
- [ ] Pilot Guardian verde — COMPILED-STATE.md ≤500 righe + archived-handoffs + costs.jsonl entry
- [ ] (Opzionale stretch) Pilot ARGOS o FLUXION se context budget consente

Se solo STEP 2 chiude in S5b: handoff S5c con solo pilot.
Se STEP 2 + Guardian chiudono: S6 = blueprint update (vedi `seeds/S6-blueprint-backup.md`) oppure ARGOS+FLUXION pilot a scelta Luke.

## Pre-flight S5b

- **TASK PRIORITARIO `find-and-implement-gemini-key`**: Luke 2026-05-09T16:30Z ha confermato di avere già una Google API key attiva. Sessione S5-prep ha verificato negativo:
  - `~/.claude/.env.free-gpu` NO key
  - Grep `~/` solo match in transcript jsonl backup, no env files
  Cercare in (in ordine, fermarsi al primo HIT):
  1. `grep -i "gemini\|google.*api\|aistudio" ~/.zshrc ~/.zshenv ~/.profile 2>/dev/null`
  2. `grep -ril "GEMINI_API_KEY\|GOOGLE_API_KEY" ~/Documents/combaretrovamiauto-enterprise /Volumes/MontereyT7/FLUXION ~/Documents/pulizia-smartphone --include=".env*" 2>/dev/null`
  3. `security find-generic-password -l "gemini" 2>&1 | head -5` e variants ("google api", "aistudio", "genai")
  4. `find ~ -maxdepth 4 -name ".env*" -type f 2>/dev/null | xargs grep -l "GEMINI\|GOOGLE_API" 2>/dev/null`
  5. Chiedere a Luke quale progetto la usa, dump diretto da lì
  Una volta trovata: `echo 'GEMINI_API_KEY=...' >> ~/.claude/.env.free-gpu && chmod 600 ~/.claude/.env.free-gpu` + verifica con curl test Gemini API endpoint (1 chiamata gratuita)
- Verificare `pip install google-genai --dry-run --report -.json` per check Big Sur compatibility (vincolo #8 — google-genai NON in blacklist, ma verifica wheel macOS 11)
- T7 mount check come ogni componente VOS

## Rischi noti S5b

1. **Gemini API key non esiste** — Luke deve crearla. Mitigazione: STEP 2 può girare in `--dry-run` senza key, blocca solo STEP 3 pilot.
2. **google-genai SDK richiede Python ≥3.9** — Big Sur ha 3.9 system, OK lato MacBook. iMac ha 3.13, OK.
3. **50 RPD può sembrare ampio ma se test/retry/debug consuma chiamate, esaurisci la quota giornaliera presto** — usa `--dry-run` aggressivamente, riserva chiamate reali a pilot effettivo.
4. **Output Gemini può "inventare" stato non presente** — prompt ha vincolo "SOLO contenuto presente", ma è un soft constraint LLM. Spot-check manuale del COMPILED-STATE.md Guardian è obbligatorio prima di archiviare handoff originali. Se l'output è dubbio, mantieni handoff originali in place finché Luke non conferma.
