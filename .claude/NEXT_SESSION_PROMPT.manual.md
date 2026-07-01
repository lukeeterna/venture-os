# Prompt ripartenza — F3a done, LIVE-FIRE da osservare

**Chiusa**: 2026-07-01 (context 60%, chiusura ordinata vincolo #7)

## Fatto questa sessione (verde)
- **F3a**: `components/vos_advance_gate.py` — PreToolUse hook, lettura B stretta. Intercetta SOLO `vos-factory-run advance`; blocca (exit 2) se provenance della **stazione corrente** (`state:` del front-block del dossier) ha `{{`. Invariante DISTINTO dal runner (che controlla `--to` destinazione). Test `components/test_advance_gate.sh` verde (block/pass + regression-guard 3 varianti path + PY_SYNTAX_OK).
- **Cablaggio**: aggiunto 1 blocco `hooks.PreToolUse` (matcher `Bash`) in `~/.claude/settings.json` → `if test -f <abs>; then python3 <abs>; fi` (mount-safe + propaga exit 2). PRE_COUNT 3→4, altri hook preservati, JSON valido. Backup Rule 1d: `~/.claude/settings.json.bak-1782922265`.

## PRIMO GESTO prossima sessione (NON il dispatcher)
**LIVE-FIRE OSSERVATO**: lo snapshot hook della sessione fresca ORA include il gate. Da un dossier a provenance incompleta, lancia realmente `vos-factory-run advance ...` e **verifica che CC blocchi davvero il tool** (fatto esterno = negato dal runner-hook vivo, non da chiamata manuale allo script).
- **VERDE** → gate VIVO, Cont.2 coperto al layer harness → poi **F3b** dispatcher `advance→Task(worker)`.
- **ROSSO** → fixa il wiring (formato matcher / contratto exit-2), NON costruire il dispatcher.

## Residui / discordanze
- Bypass hand-edit del dossier: aperto, coperto solo dal firewall provenance interno al runner (scelta di scope).
- `STATE.md` è puntatore MORTO (non esiste): source-of-truth reale = breadcrumb `HANDOFF_CURRENT.md` + dossier.
- Rollback cablaggio: `cp ~/.claude/settings.json.bak-1782922265 ~/.claude/settings.json`.

## Come riprendere
1. Apri Claude Code da `/Volumes/MontereyT7/venture-os`.
2. Leggi `.claude/HANDOFF_CURRENT.md` (sezione INCOLLA-AL-GIUDICE) + questo file.
3. Esegui il PRIMO GESTO (LIVE-FIRE osservato) prima di qualsiasi altra unità.
