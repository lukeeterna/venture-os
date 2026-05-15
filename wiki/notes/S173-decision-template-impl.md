# S173 — Decision-template MVP implementation

**Data**: 2026-05-15
**Sessione**: S173-VOS-coord (continua handoff S172, gap #1 = `decision-template`)
**Verdict**: VERDE

---

## Cosa è stato chiuso in S173

1. **Schema canonico** → `templates/DECISION-entry.yaml` (87 righe)
   - Pattern parsing markdown `## D-NN — Title (date, session)`
   - Required: id, title, status, decided_at, contesto, decisione
   - Optional: founder_input (citazione raw status), last_reviewed (HTML comment), supersedes, ref
   - Status enum esteso post-discovery entries reali ARGOS: DECIDED, OPEN, SUPERSEDED, DEFERRED, PROPOSED
   - Stale policy: 90gg da last_reviewed (fallback decided_at)

2. **Validator** → `components/decision-validator/validate.py` (215 totali, 173 logical LOC < 200 vincolo)
   - Args: `--project=ARGOS|FLUXION|Guardian`, `--quiet`
   - Output: `state/decision-validation.jsonl` (run-per-line, consumed da briefer)
   - Exit codes: 0=ok, 1=malformed, 2=schema err, 3=io err
   - Emoji prefix `⚠️` strippata da status (D-26 ARGOS gestito)
   - Date legacy `YYYY-MM` → warning, `YYYY-MM-DD` canonico

3. **Briefer hook** → `components/morning-briefer/briefer.py` modificato
   - Nuova sezione `_signals()` consuma `decision-validation.jsonl` ultimo run
   - Mostra `DECISIONS malformed: <project> (N)` se entries rotte
   - Mostra `DECISIONS stale >90gg: <proj/D-NN>` (max 3 + count, raccomandazione `<!-- last_reviewed: ... -->`)
   - Mostra `DECISIONS.md missing: <projects>` se pre-action-check disattivo

4. **Guardian DECISIONS.md** → `wiki/projects/Guardian/DECISIONS.md` (4 DECIDED + 1 OPEN + 6 OQ)
   - **Pattern S159 risolto**: drift CLAUDE.md riga 47 ("pulizia smartphone, in costruzione") vs realtà filesystem (fall-detection production-grade). Founder S173 ha chiarito: 2 verticali separati.
   - D-01: scope 2 verticali (fall-detection + pulizia smartphone)
   - D-02: stack fall-detection production (YOLOv8n + LSTM + MQTT, formalizzazione retroattiva S60/S64)
   - D-03: activation gating zero-FP test naturale ≥30min
   - D-04: scope pulizia smartphone OPEN (founder TBD)
   - D-05: architettura clienti zero-cost IP cam + smartphone (deep research pending OQ-02)

5. **Validator run finale**:
   ```
   [ARGOS] 29/29 ok — 4 warnings  (date YYYY-MM legacy, no fail)
   [FLUXION] 3/3 ok
   [Guardian] 5/5 ok
   verdict: OK
   ```

---

## Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: che il validator markdown-parse-based catturi tutte le entries malformate future. Realtà: regex header tollera `D-\d{2,3}` ma se qualcuno scrive `## D-100` o `## D-3` (1 cifra) fail silenzioso. Mitigazione: monitor count `entries` per progetto in briefer hook, alert se decremento improvviso (entry skippata). Out-of-scope S173.

2. **Cosa rompe a 30/60/90gg**: il vincolo `last_reviewed` è opt-in fail-soft. Nessuno aggiunge `<!-- last_reviewed: YYYY-MM-DD -->` se non costretto. Pattern errore noto ADR-driven dev: friction-on-write decade. Mitigazione attuale: briefer mostra stale in Segnali (visibility, no enforcement). A 90gg primo flag stale ARGOS D-01 (decided 2026-03-21) trigger → verifica retroattiva.

3. **Pattern errori noti su sistemi simili**: enforcement-by-commit-hook è classico ADR fail-mode (Luke commit con `--no-verify`, vincolo CLAUDE.md vieta esplicito). Validator standalone esecuzione manuale = entropia. Cron settimanale validator + briefer pipeline è il giusto compromesso (autonomia + visibility). Out-of-scope MVP: LaunchAgent dedicato validator. Frequency suggerita: daily run inline briefer (briefer già attivo, validator <1s, low cost).

4. **Dove sovradimensiono**: schema YAML 87 righe per parsing markdown puro. Alternativa più snella era hardcodare pattern dentro validate.py. Scelta YAML giustificata da: (a) skill pre-action-check può leggere schema senza Python, (b) futuri update (es. nuovo status, nuovo required field) editabili senza touch codice, (c) cross-language readable. Trade-off accettato.

---

## Vincolo founder rispettato

- **D-26 ARGOS** (DECISIONS.md): non in conflitto, decision-template è infra VOS-meta, non ARGOS-ops.
- **D-01 FLUXION** (gestionale desktop, NON video marketing): rispettato, FLUXION DECISIONS.md parsato corretto.
- **D-01 Guardian** (2 verticali): nuovo DECIDED, formalizza scope multi-modulo.
- **Vincolo #5 (zero-cost)**: stdlib + pyyaml (già installato per briefer/scanner). Nessun servizio paid.
- **Vincolo #12 (scope globale vs project-scoped)**: template in `~/venture-os/templates/`, validator in `~/venture-os/components/decision-validator/`, mai dentro `<progetto>/.claude/`.
- **Vincolo #13 (pre-action-check)**: ora attivo su 3/3 progetti (coverage completata, root cause S159 mitigata).

---

## Fonte dati decisioni S173

- `wiki/VOS-COMPLETION-AUDIT-S172.md` (decisione CTO gap priority + autocritica)
- `wiki/HANDOFF-VOS-S172-completion-audit.md` (prompt resume S173, scope chiuso)
- `wiki/projects/ARGOS/DECISIONS.md` (884 righe, pattern canonico)
- `wiki/projects/FLUXION/DECISIONS.md` (95 righe, thin)
- `wiki/projects/Guardian/COMPILED-STATE.md` (fonte autoritativa scope Guardian, fall-detection)
- `~/.claude/skills/pre-action-check/SKILL.md` (consumer del template)
- Founder S173 raw answers (Q1=Entrambi 2 verticali, Q2=pacchettizzato TBD, Q3=IP cam + smartphone zero-cost deep research)

---

## Flag aperti per S174

1. **CLAUDE.md riga 47 update** (OQ-05 Guardian): da "pulizia smartphone, stack TBD, in costruzione" a "suite 2 verticali (fall-detection + pulizia smartphone)". File `~/.claude/CLAUDE.md` (global). Out-of-scope S173. Trigger S174 (5min edit).

2. **Disk-keeper LaunchAgent settimanale** (handoff S172 sub-task parallel): non eseguito S173 per scope focus decision-template. Carry-over S174 o S175.

3. **Gap #2 session-health** (post-S173 priority): handoff S172 ranking. Sessione dedicata implementazione.

4. **OQ-02 Guardian deep research zero-cost client inference**: research dedicata (founder S173 esplicito "con dati"). Sessione separata, può usare skill `vos-scout` per area `edge-inference-mobile`.

5. **Validator scheduling**: aggiungere validator a daily briefer pipeline (run automatic pre-briefer). Modifica suggerita briefer.py: invocare `validate.py --quiet` all'inizio `build_brief()`. Trivial, può andare in qualsiasi sessione.

---

## Brief-actions line S173

```bash
echo '{"date": "2026-05-15", "brief_read": true, "action_taken": "S173-decision-template-MVP-impl", "source_match": false, "notes": "Implementato gap #1 da S172: template YAML + validator (173 logical LOC) + briefer hook + Guardian DECISIONS.md backfill (4 DECIDED + 1 OPEN). Validator OK su 3/3 progetti (37 entries totali, 0 malformed, 4 warnings YYYY-MM legacy). Pattern S159 doc drift Guardian risolto: 2 verticali confermati founder S173. Pre-action-check ora attivo 3/3."}' >> ~/venture-os/state/brief-actions.jsonl
```
