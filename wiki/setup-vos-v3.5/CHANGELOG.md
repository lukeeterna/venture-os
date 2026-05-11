# CHANGELOG setup-vos-v3.5 — Task B founder patch

**Sessione**: 7 maggio 2026 — chiusura 5 fix AUDIT pre-Sessione 1.
**Vincolo**: NO install in `~/.claude/`, NO Sessione 1 launch finché tutti i fix done.

| # | File | Sezione | Fix | Test verifica | Result |
|---|------|---------|-----|---------------|--------|
| 1 | `PROMPT-CC-SESSIONE-1.md` | task 3+10 | gate `df -h /` → `df -h /System/Volumes/Data` (APFS sealed-system, target reale 92%) | `grep -c '/System/Volumes/Data'` → 2 | ✅ done sess. precedente |
| 2 | `settings.json` | hooks PreToolUse + SessionStart | BLACKLIST regex `\b<lib>\b` (no false-pos pytorch-extras), ROOT 2-pattern (`rm -rf /` + `/Library/...`), SessionStart JSON `hookSpecificOutput.additionalContext` | `eval "$SS_CMD" \| jq` → 1651B JSON valido + 8 BLACKLIST + 11 ROOT pass | ✅ done sess. precedente |
| 3 | `PROMPT-CC-SETUP-GLOBALE.md` | task 3 + 7 | merge esplicito 3a/3b/3c (no overwrite 68 righe Enterprise Suite) + sync test BLACKLIST | `grep 'INIZIO BLOCCO VOS v1.1'` + `jq -s '.[0]*.[1]'` | ✅ done sess. precedente |
| 4 | `BLUEPRINT-JD-v3.5.md` | sez 3.2, 7.1 (linee 111, 322) | `ssh imac.local` → `ssh imac` (alias `~/.ssh/config`, mDNS non risolve LAN Luke) | `grep -c 'ssh imac\.local'` → 0 comandi (solo testo esplicativo negativo) | ✅ done |
| 5a | `BLUEPRINT-JD-v3.5.md` | sez 7.3, 13bis-PBO, 15.7 (9 linee) | Mole `mo analyze --json` → `mo analyze -json` (Go-style single-dash, verificato 7/5/2026) | `grep -c 'mo analyze --json'` → 0; `grep -c 'mo analyze -json'` → 9 | ✅ done |
| 5a-bis | `BLUEPRINT-JD-v3.5.md` | sez 13bis PBO Step 1 (linea 890) | drift residuo post-replace_all: standalone `--json` nel narrative "supporta `--json`" → `-json` con nota esplicita (single-dash Go-style, non `--json`) | `grep -n -- '--json' BLUEPRINT` → solo riga 6 changelog header | ✅ done verifica integrità |
| 5b | `BLUEPRINT-JD-v3.5.md` | sez 6.2 routing.yaml (linee 237, 246, 249, 260) | `qwen/qwen3-coder-480b:free` → `qwen/qwen3-coder:free`; `nemotron-nano-12b-vl:free` → `nemotron-nano-12b-v2-vl:free` | `grep` ID errati → 0; ID corretti → 4 hit | ✅ done |
| 5c | `BLUEPRINT-JD-v3.5.md` | sez 7.6.4 + 15.18 | handoff_glob fisso → `config/handoff-debt-config.yaml` per-progetto (ARGOS: `agent-memory/`, `memory/`, `prompts/s*.md`, `rules/`; FLUXION std; Guardian `.planning/`) + AC scan must >0 | 5 riferimenti a `handoff-debt-config.yaml` coerenti nel blueprint | ✅ done |
| 5d | `BLUEPRINT-JD-v3.5.md` | sez Fase B Validation Window | criteri soggettivi → schema `state/brief-actions.jsonl` (5 campi) + tabella go/no-go misurabile (`source_match≥3/7d` utile, `0` inutile, `1-2` MVP basta) + 3 AC implementazione | tabella decisionale presente, AC `score.py` definita | ✅ done |
| 6 | `BLUEPRINT-JD-v3.5.md` | header (riga 3-5) | v3.4 → v3.5, changelog 5 modifiche v3.5 (a-e) preservando 6 v3.4 | `grep 'Versione 3.5'` → 1 | ✅ done |
| 7 | `CHANGELOG.md` (questo file) | nuovo | tabella sintesi Task B | `wc -l CHANGELOG.md` → ≤30 | ✅ done |
| 8 | `HOOK-REGEX-TESTS.md` | nuovo (in `~/Downloads/`) | 8 BLACKLIST + 11 ROOT_PROTECTION test cases passati pre-compact | `wc -l HOOK-REGEX-TESTS.md` documenta 19 cases | ⏳ next |

**Pre-condizioni Sessione 1 (gate verde)**: tutti i fix 1-6 done + HOOK-REGEX-TESTS al 100% + Luke ack esplicito su CHANGELOG.
