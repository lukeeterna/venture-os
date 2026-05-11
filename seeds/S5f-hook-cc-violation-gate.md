# Seed S5f — Hook Stop globale gate violazioni CC

**Origine**: Luke S5e 2026-05-11, in risposta a deviation S4 "vincolo-9-recidiva" escalation prevista ("se ricade nuovamente = memoria insufficiente, escalation a hook intercettore").

**Stato**: design ready, fuori scope S5e (context 50%), schedulato S5f.

## Razionale (Luke)

Memoria feedback `~/.claude/projects/-Users-macbook/memory/feedback_no_hai_ragione_diplomatico.md` esiste dal 2026-05-08. CC ha continuato a violare vincolo #9 in sessioni FLUXION post-creazione. Pattern empirico: memoria insufficiente, serve gate hard.

## Correzione fact (S5e, vincolo #1)

Luke ha proposto `PreToolUse` ma quello fires su tool call, non su testo assistant. Hook corretto è **`Stop`**: fires quando CC termina turn, può leggere transcript ultima assistant message, può ritornare `"decision":"block"` + `"reason"` per forzare riformulazione.

Riferimento doc: https://docs.claude.com/en/docs/claude-code/hooks#stop (verificare con WebFetch in S5f).

## Design

Path: `~/.claude/hooks/global_violation_gate.py`

Pattern da intercettare (regex, case-insensitive dove appropriato):
- `\bhai ragione\b` → vincolo #9 (mai diplomatico)
- `\bperfetto[,.!]` come opener → vincolo #9 (incipit diplomatico)
- liste numerate `^1\.` + `^2\.` + `^3\.` in contesti decisionali tecnici → vincolo #3 (mai A/B/C/D)
  - heuristic per "contesto decisionale": presenza keyword "scegli", "preferisci", "opzioni", "alternative" nella stessa risposta
- (futuro) `\boption [A-Z]\b` come header decisionale

Comportamento:
1. Stop hook riceve transcript JSON via stdin (formato Anthropic spec)
2. Estrae ultima assistant message
3. Regex match → se hit:
   - Logga JSONL in `~/venture-os/state/cc-violations.jsonl` (ts, pattern_id, snippet ±50 char, session_id se disponibile)
   - Stdout: `{"decision":"block","reason":"Vincolo #<N> violato — pattern '<X>' rilevato. Riformula con raccomandazione singola motivata o disaccordo con dato."}`
4. No match → exit 0 (nessun output, CC procede normalmente)

Registrazione in `~/.claude/settings.json`:
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {"type": "command", "command": "python3 ~/.claude/hooks/global_violation_gate.py"}
        ]
      }
    ]
  }
}
```

## Test plan S5f

1. Unit test patterns: 8 frasi positive (devono triggerare) + 8 negative (non devono).
2. E2E: provocare CC con prompt che induce "hai ragione" naturale, verificare block reso + retry corretto.
3. Misurazione baseline: 7gg log JSONL, conta violazioni/giorno per pattern_id, trend post-deploy.

## Critica strutturale (vincolo #4)

1. **Assunzione fragile**: regex su testo libero ha falsi positivi (es. "hai ragione di" può apparire in citazione contestuale legittima). Mitigazione: heuristic guardian = pattern + assenza di marcatori "citazione/" o "esempio:".
2. **30gg risk**: CC può imparare a eludere regex con paraphrase ("è corretto quello che dici" invece di "hai ragione"). Mitigazione: estendere pattern list su rilevazioni reali da JSONL, non fare regex perfette a priori.
3. **Pattern errore noto**: hook che blocca con frequenza alta crea attrito Luke. Mitigazione: log-only mode prima settimana, poi switch a block.
4. **Sovradimensiono se**: aggiungo NLP semantic check con LLM call. Per ora regex semplice è sufficiente — il pattern target è esattamente l'opener formulaic.

## Dipendenze

Nessuna. Python 3 stdlib (json, re, sys, os).

## Stima

~80 righe Python + 30 righe test + 5 righe settings.json patch. ~1h work.
