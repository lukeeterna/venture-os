# HANDOFF [venture-os] — sessione `74c2f3b2-d6f6-44c7-b589-b28d4ab915e5`


> Breadcrumb effimero generato a SessionEnd. NON è un mandato e NON è committato
> (gitignorato). Lo stato REALE è `STATE.md`.
> 2026-07-01T16:29:41Z

## Stato git alla chiusura

- **Branch**: `master`
- **HEAD**: `ea42d9b auto-close session 74c2f3b2-d6f6-44c7-b589-b28d4ab915e5 @ 2026-07-01T16:27:08Z`

### Working tree (`git status --porcelain`)
```
 M .claude/NEXT_SESSION_PROMPT.manual.md
 M .claude/NEXT_SESSION_PROMPT.md
?? .claude/HANDOFF_CURRENT.md
```

## Done-condition (orientamento prossima sessione)

- HEAD sopra = ultimo commit reale; ripartire da lì.
- File dirty sopra = WIP NON committato (verificare prima di nuovo lavoro).
- Stato task/anelli: leggere `STATE.md` (source-of-truth generato), non questo file.

<!-- HANDOFF-SEMANTIC: scritto a mano a fine sessione — hook NON sovrascrive sotto questa riga -->

## 6. INCOLLA-AL-GIUDICE
- Aperti / BLOCKED-ON (ognuno col fatto terminale che lo sblocca): EREDITA'-GATE: RESOLVED VERDE (era UNVERIFIED-BLOCCANTE). Test empirico 2026-07-01: subagent spawnato EREDITA i PreToolUse-Bash del parent. Doppia fonte indipendente: (a) worker riporta blocco da runtime CC su advance con provenance {{ (runner mai partito, no STDOUT); (b) advance-gate.jsonl seconda entry decision:block 17:53:33Z, stesso session_id 29e61d21 dell'arm-check, distinta -> evento nuovo innescato dalla tool-call del worker. factory-runs.jsonl 0 append, fixture ferma S1 = nessuna mutazione. Caveat onesto: osservato direttamente solo vos_advance_gate; altri hook catena exit-0 passthrough su questo comando (invisibili) ma stessa catena/matcher/sessione -> l'intera catena PreToolUse-Bash e' invocata per i subagent, non bypassata. CONSEGUENZA: spawn reale NON apre superficie fuori Cont.2; i figli sono contenuti dalla stessa cintura. Cont.2 esteso ai figli per ereditarieta' osservata. || STEP(2) F3b-BUILD FATTO 2026-07-01: components/vos_dispatch_dryrun.py creato+verificato (PY_SYNTAX_OK, matrice S1/S3/S4->true, S5->false external-action PROVATA, S2/S6->human-gate, no-op negativi, spawned literal False, fail-closed unknown-stage). NON cablato in settings.json (isolato come F3a). || RESIDUO confine-autonomia INVARIATO: solo S1/S3/S4 spawnabili in autonomia; S5=outreach esterno gated G-APPROVAL; S2/S6 gate umani. || Nessun run attivo: E2E dispatcher richiede init fresco + advance su linea S0..S6 viva.
- DISCORDANZE giudice↔disco: STRUTTURALE (disco vince): 'dispatcher advance->Task(worker)' come auto-spawner puro-hook NON ESISTE. Task e' tool solo del modello CC in-context, non invocabile da processo shell. Un hook puo' solo DETECT+LOG+SEGNALE; lo spawn reale e' azione del SOLO main model. Ogni breadcrumb precedente che diceva 'auto-spawn' era errato sulla fisica della macchina. || Aggancio dispatcher = PostToolUse-Bash (esiste, espone exit_code); NON estendere vos-factory-run (auto-dichiarato thin, non-decide).
- Prossima unità proposta (una, scoped): RAMO A SCELTO da Luke (non piu' bivio): CABLARE vos_dispatch_dryrun in settings.json (PostToolUse-Bash async). Lo rende VIVO in dry-run su advance reali — logga cosa spawnerebbe, NON spawna. PATTERN DUE-TEMPI (come F3a-bis, snapshot hook all'avvio): (1) sessione cablatura = backup Rule 1d (settings.json si tocca!) + JSON valido + referenza=1 + 4 PostToolUse esistenti preservati + max-prova su fixture (la stringa cablata scrive un record dry-run); il record su advance REALE NON si osserva mid-session. (2) sessione fresca DOPO = hook nello snapshot + VENTURE VIVA -> osserva record dry-run reale con classe corretta. || PRE-STEP comune: l'unica venture e' CLOSED -> serve 'vos-factory-run init' fresco + advance su linea S0..S6 viva per l'osservazione. || accept-edits OFF nella cablatura (settings.json e' load-bearing). || RAMO B (real-spawn) resta DOPO che A ha prodotto telemetria reale di classificazione corretta sul campo.
