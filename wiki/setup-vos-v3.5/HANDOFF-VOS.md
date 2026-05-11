# HANDOFF VOS Task B — sessione chiusa context ~85%

> Sessione chiusa puliti su istruzione context-rot. Ripartire pulita per Fix 4+5.
> **NON è FLUXION S188** — il `/compact` directive era misaligned (template auto-loaded). Questo handoff è per VOS setup v3.5.

## Stato fix sui 6 file allegati originali

| # | File | Fix | Status | Verifica |
|---|------|-----|--------|----------|
| 1 | `PROMPT-CC-SESSIONE-1.md` | gate `df -h /System/Volumes/Data` (linee 85, 211) | ✅ DONE | grep `/System/Volumes/Data` → 2 hit |
| 2 | `settings.json` | BLACKLIST `\b...\b` + ROOT 2-pattern + SessionStart JSON `hookSpecificOutput` | ✅ DONE | `eval "$SS_CMD" \| jq` → JSON valido 1651 byte; regex test 8 BLACKLIST + 11 ROOT pass pre-compact |
| 3 | `PROMPT-CC-SETUP-GLOBALE.md` | task 3 da "copia esatta" a merge esplicito 3a/3b/3c + sync test BLACKLIST task 7 | ✅ DONE | grep `INIZIO BLOCCO VOS v1.1` + `jq -s '.[0] * .[1]'` presenti |
| 4 | `BLUEPRINT-JD-v3.5.md` | `ssh imac.local` → `ssh imac` (linee 111, 322 + altre se affiorano) | ⏳ PENDING | da fare next session |
| 5a | `BLUEPRINT-JD-v3.5.md` | `mo analyze --json` → `mo analyze -json` (~9 linee: 5, 365, 367, 390, 844, 848, 850, 945, 949) | ⏳ PENDING | Mole 1.37 syntax Go-style single-dash |
| 5b | `BLUEPRINT-JD-v3.5.md` sez 6.2 | OpenRouter IDs reali: `qwen/qwen3-coder:free` (no `-480b`), `nvidia/nemotron-nano-12b-v2-vl:free` (con `-v2-`) — linee 237, 246, 249, 260 | ⏳ PENDING | drift S185 confermato |
| 5c | `BLUEPRINT-JD-v3.5.md` sez 7.6.4 | handoff_glob fisso (`HANDOFF*.md/MEMORY*.md/STATO_CORRENTE*.md`) → per-progetto YAML config (ARGOS usa `agent-memory/`, `memory/`, `prompts/s*.md`) | ⏳ PENDING | senza patch compilation pattern fallisce su ARGOS |
| 5d | `BLUEPRINT-JD-v3.5.md` Fase B | `state/brief-actions.jsonl` schema + AC misurabili Validation Window 7-14gg | ⏳ PENDING | senza, Fase B parte zoppa |

## Files state

```
~/Downloads/setup-vos-v3.5/
├── BLUEPRINT-JD-v3.5.md          ⏳ PENDING (fix 4 + 5a-d)
├── CLAUDE.md                      ✅ unchanged (122 righe vincoli)
├── PROMPT-CC-NUOVA-SESSIONE.md    ✅ unchanged
├── PROMPT-CC-SESSIONE-1.md        ✅ Fix 1 applicato
├── PROMPT-CC-SETUP-GLOBALE.md     ✅ Fix 3 applicato
└── settings.json                  ✅ Fix 2 applicato
```

AUDIT deliverables Task A (read-only references):
```
~/Downloads/AUDIT-blueprint-coerenza.md
~/Downloads/AUDIT-decisioni-aperte-CTO.md
~/Downloads/AUDIT-flussi-progetti.md
~/Downloads/AUDIT-hw-sw-realta.md
~/Downloads/AUDIT-rischi-implementazione.md
```

## Decisioni chiuse / vincoli memorizzati

- **No install in `~/.claude/`** finché tutti i 5 fix non sono completi (vincolo iniziale Task B founder).
- **No Sessione 1 launch** finché HOOK-REGEX-TESTS pass al 100% E BLUEPRINT v3.5 chiuso (decisione 5 AUDIT).
- **macOS Big Sur**: APFS dual-volume, `/` sempre 72% (sealed read-only), `/System/Volumes/Data` 92% (vero target cleanup). Gate v3.4 falso positivo, v3.5 fixed.
- **SSH iMac**: Bonjour mDNS NON risolve `imac.local` su MacBook Luke. Alias `imac` in `~/.ssh/config` → 192.168.1.2. Patch globale Fix 4.
- **Mole 1.37**: `mo analyze -json <path>` (Go-style single dash). NOT `--json`.
- **OpenRouter ID drift S185**: `qwen3-coder` (no -480b suffix), `nemotron-nano-12b-v2-vl` (con -v2-). Verificare con `curl https://openrouter.ai/api/v1/models | jq '.data[] | select(.pricing.prompt=="0")'` se serve riconferma next session.
- **3 progetti VOS-attivi**: ARGOS (handoff non-standard, serve adapter 5c), FLUXION (handoff std OK), Guardian (no DB ancora, scanner deve gestire `db_files: []`).
- **REGOLA AUDIT**: se errore in fix proposto da AUDIT → dichiarare secco con dati, non confermare per inerzia. Già esercitata: bug `(\$HOME|~)([/[:space:]]|$)` proposto user vs corretto applicato `(\$HOME|~)([[:space:]]|$)`.

## Prompt ripartenza next session (copia/incolla)

```
Sono Luke. Sessione VOS Task B continua — leggi PRIMA:
1. ~/Downloads/setup-vos-v3.5/HANDOFF-VOS.md (stato: 3/5 fix done, 2 pending)
2. ~/Downloads/AUDIT-decisioni-aperte-CTO.md (5 decisioni CTO chiuse)
3. ~/Downloads/AUDIT-blueprint-coerenza.md (drift Mole + OpenRouter già documentati)

DA FARE:
- Fix 4: BLUEPRINT-JD-v3.5.md `ssh imac.local` → `ssh imac` (Edit tool, una linea per volta, mostra diff)
- Fix 5a: BLUEPRINT mo `--json` → `-json` (~9 linee, Edit per occorrenza)
- Fix 5b: BLUEPRINT sez 6.2 OpenRouter IDs (4 linee: 237, 246, 249, 260)
- Fix 5c: BLUEPRINT sez 7.6.4 handoff_glob per-progetto YAML
- Fix 5d: BLUEPRINT Fase B brief-actions.jsonl schema + AC 7-14gg
- Update header v3.5 changelog
- Crea CHANGELOG.md (max 30 righe tabella)
- Crea HOOK-REGEX-TESTS.md (8+11 test già passati pre-compact)

VINCOLI: italiano, no A/B/C, autocritica strutturale, NO install ~/.claude/, NO Sessione 1 launch.
Edit tool preferito a sed (audit trail). Una fix = un Edit = un report.
Context budget: appena tocchi 50% riapri sessione clean. Vincolo n.7 CLAUDE.md.
```

## Autocritica strutturale chiusura

1. **Mancato /context periodico**: vincolo n.7 CLAUDE.md violato — non ho monitorato budget durante Fix 1-3, primo /compact a sorpresa. Ironia: il VOS che sto patchando ha proprio il context-budget-gate come pattern centrale.
2. **Sed batch rifiutato**: avrei dovuto usare Edit tool fin dall'inizio per Fix 4-5 (audit trail per founder, una linea per volta visibile). Sed è opaco per file critici come BLUEPRINT.
3. **Compact directive misaligned**: l'auto-loaded FLUXION CLAUDE.md ha iniettato istruzioni S188 in un context VOS. Pattern noto, da segnalare in blueprint sez. 12 (project-scoped vs global) come pitfall.
4. **Handoff scritto solo a 85%**: avrei dovuto scrivere handoff incrementale dopo Fix 3 (50%) invece che tutto a fine sessione. Lezione per template VOS Sessione 2 (closing checklist).

## Costo non-fix Fix 4+5 (next session deve fare)

- Senza Fix 4: Sessione 2 host-monitor iMac fallisce primo SSH → Fase B Validation parte zoppa.
- Senza Fix 5a: Mole probe schermo crash su Big Sur → screen-brief vuoto.
- Senza Fix 5b: OpenRouter NLU classifier free → 404 model not found → fallback template-only.
- Senza Fix 5c: ARGOS compilation pattern → empty handoff (no file match) → brief Argos sempre "no context".
- Senza Fix 5d: Validation Window 7-14gg senza AC misurabili → decisione go/no-go VOS arbitraria.

Tempo Fix 4+5 next session: ~30-40 min con Edit tool atomic.
