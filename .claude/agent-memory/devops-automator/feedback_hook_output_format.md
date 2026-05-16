---
name: Hook output format UserPromptSubmit
description: Formato stdout corretto per hook Claude Code UserPromptSubmit — verificato su prompt-router.sh e pre_compact.py
type: feedback
---

Output corretto per hook CC (UserPromptSubmit e PostToolUse): `{"additionalContext": "..."}` senza wrapper `hookSpecificOutput`.

**Why:** Verificato leggendo prompt-router.sh riga 34 e pre_compact.py riga 38 prima di scrivere. Il wrapper `{"hookSpecificOutput": {"hookEventName": "...", "additionalContext": "..."}}` e' usato SOLO per SessionStart (vedi settings.json riga 18). Per altri eventi hook il formato piatto e' quello che funziona.

**How to apply:** Prima di scrivere qualsiasi nuovo hook Python/sh, leggi sempre un hook esistente dello stesso tipo (UserPromptSubmit, PostToolUse, Stop) per verificare il formato output atteso. Non assumere mai dalla doc — verificare dal codice funzionante.
