# NEXT SESSION PROMPT — generato 2026-05-09T16:38Z (override post-MANDATE 72%)

**Sessione precedente**: S5-prep + S5 STEP 1 chiusa VERDE. STEP 2-3 = S5b.
**Stato bloccante S5b**: `.env.free-gpu` riga 15 CORROTTA con escape sequences (Luke incollato in zsh prompt fallito `read -p` no-coprocess; key length=169 invece di ~39).

## URGENTE — FIRST ACTION S5b

`~/.claude/.env.free-gpu` riga 15 contiene escape sequences ANSI (`^[[19`, `^[[15~` etc), NON una key valida. Curl test → HTTP 403.

**Fix:**
```bash
# 1. Mostra file (no leak chiave reale, ma vedi la riga 15 corrotta)
cat -An ~/.claude/.env.free-gpu | tail -5
# 2. Rimuovi riga 15 corrotta (oppure tutte righe con "GEMINI_API_KEY")
sed -i '' '/^GEMINI_API_KEY=/d' ~/.claude/.env.free-gpu
# 3. Re-implementa key con metodo robusto (nano):
nano ~/.claude/.env.free-gpu
# Aggiungi riga: GEMINI_API_KEY=AIza...
# Salva con Ctrl+O, Invio, Ctrl+X
chmod 600 ~/.claude/.env.free-gpu
# 4. Verifica length attesa ~39 + curl test
KEY_LEN=$(grep '^GEMINI_API_KEY=' ~/.claude/.env.free-gpu | cut -d= -f2- | tr -d '\n' | wc -c | tr -d ' ')
echo "Length: $KEY_LEN"
set -a; . ~/.claude/.env.free-gpu; set +a
curl -s -o /dev/null -w "HTTP %{http_code}\n" "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
# Atteso: HTTP 200
```

## Stato chiuso S5-prep + STEP 1 (NON rifare)

- `config/routing.yaml` Gemini 2.5 Pro free → commit `daec00d`
- GH multi-remote `lukeeterna/venture-os` PRIVATE, hook `REMOTES=(imac github)`, log per-remote
- Fix HEAD bare repo iMac, seed S6, deviation tracciata
- Parità 3-way verde a `e8c9bb3`

## Prompt resume S5b (copia in nuova sessione)

```
Leggi:
1. ~/venture-os/.claude/NEXT_SESSION_PROMPT.md (questo, FIRST ACTION urgente)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5b-karpathy-compiler-2026-05-09.md

OBBLIGATORIO PRIMA AZIONE: fix .env.free-gpu riga 15 corrotta + re-implementa
GEMINI_API_KEY via nano (metodo robusto). Verifica con curl HTTP 200.

POI S5b STEP 2 (compiler.py) + STEP 3 (pilot Guardian).

Vincoli: #1 verifica fattuale, #3 raccomandazione singola, #4 autocritica 4 punti,
#7 chiusura a 60% context, #8 preflight Big Sur per google-genai SDK.
```

## Lesson learned (per memory feedback futura)

`read -s -p "..."` NON funziona in zsh (`-p` = coprocess). Per prompt nascosto in zsh:
- `read -s "key?GEMINI_API_KEY> "` (sintassi zsh)
- oppure `nano` + edit manuale (più robusto, pattern usato S5b)
