# MEMORY.md — devops-automator

- [Hook output format UserPromptSubmit](feedback_hook_output_format.md) — formato stdout hook CC: {"additionalContext": "..."} senza wrapper hookSpecificOutput per UserPromptSubmit
- [Delegation enforcement hook P0 S181](project_delegation_enforcement_hook.md) — hook user_prompt_route_enforce.py creato, registrato in settings.json sezione UserPromptSubmit
- [WAVE 3 P8 deliverables — eval-tracker, dashboard, auto_code_review](project_wave3_p8_deliverables.md) — eval.py, eval_dashboard_core.py, eval-dashboard.sh, LaunchAgent 07:00, hook PostToolUse
- [macOS lock no flock — usa mkdir atomico](feedback_macos_lock_no_flock.md) — flock util-linux non disponibile Big Sur, pattern corretto: mkdir + trap rmdir
