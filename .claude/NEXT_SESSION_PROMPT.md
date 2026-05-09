# NEXT SESSION PROMPT — generato 2026-05-09T16:35Z (override manuale post-MANDATE 60%)

**Sessione precedente**: S5-prep + S5 STEP 1 (chiusa VERDE per MANDATE vincolo #7)
**Sessione successiva**: S5b — STEP 2+3 Karpathy compiler

## Stato chiuso

- S5 STEP 1: `config/routing.yaml` (Gemini 2.5 Pro free, 1M ctx, 50 RPD) — `daec00d`
- S5-prep: GH multi-remote `lukeeterna/venture-os` PRIVATE, hook `REMOTES=(imac github)`, fix HEAD bare iMac, seed S6, deviation — `259b4fc`
- Parità 3-way locale = imac/master = github/master

## Task aperto bloccante S5b STEP 3

**`find-and-implement-gemini-key`** — Luke ha key Google API attiva. NON trovata in:
- `~/.claude/.env.free-gpu` (solo HF + ngrok)
- Grep ricorsivo `~/` (solo match in transcript jsonl backup)

NON ancora cercato (5 comandi pronti in handoff S5b sezione "Pre-flight"):
shell rc, project envs ARGOS/FLUXION/Guardian, Keychain macOS, find env files.

## Prompt resume (copia in nuova sessione da `~/venture-os`)

```
Leggi nell'ordine:
1. ~/venture-os/.claude/NEXT_SESSION_PROMPT.md (questo)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5b-karpathy-compiler-2026-05-09.md

PRIMA AZIONE: eseguire i 5 comandi pre-flight (handoff S5b sezione Pre-flight)
per trovare GEMINI_API_KEY esistente Luke. Implementarla in
~/.claude/.env.free-gpu (chmod 600). Verifica con 1 curl test Gemini.

POI procedere S5b STEP 2 (compiler.py) + STEP 3 (pilot Guardian).

Vincoli: #1 verifica fattuale, #3 raccomandazione singola, #4 autocritica 4 punti,
#7 chiusura a 60%, #8 preflight Big Sur per google-genai SDK.
```

## Pre-flight check rapido

```bash
mount | grep -q MontereyT7 && echo "T7 OK" || echo "T7 MISSING"
ls ~/.claude/hooks/global_context_gate.py ~/.claude/hooks/global_session_end.sh
cd ~/venture-os && for r in imac github; do echo "$r: $(git ls-remote $r master | cut -f1)"; done
echo "local: $(git rev-parse HEAD)"
```
