# Prompt ripartenza VOS — 2026-05-28 chiusura ordinata

**Generato**: 2026-05-28 ~19:15 UTC (override session-end hook auto)
**Tipo**: fix motore vos_plan L1 + riallineamento PLAN FLUXION S308 + audit code-truth FLUXION+ARGOS salvati

## Cosa è stato fatto

1. **L1 fix motore `~/.vos/vos_plan.py`** — `read_resume_state` ora prefer `NEXT_SESSION_PROMPT.manual.md` se fresh (≤14gg) e ≥1.5x size dell'auto-cosmetic. Parsing esteso cattura headline operativa (AZIONE PRIMARIA / TASK A / SCOPE / STATO APERTURA). Output brief mostra `[manual]`/`[auto]` + riga "azione". Smoke test 3 progetti verde (FLUXION→S308, ARGOS→S196, Guardian→fallback auto).

2. **PLAN.md FLUXION riallineato a S308** — STACK_TOOL aggiunge Resend+Cloudflare Workers e qualifica Stripe (test OK, prod pending Task E); CRITIQUE C-FLUXI-002 riformulato con sub-task A-E + FBUG-RESEND-SHARED-SENDER-01 ancorato + evidence file linkato; C-LIC-001 chiuso CC con evidence Stripe webhook 200; STATO_FEATURE license aggiornato (`scripts/license-delivery/` flaggato superseded da `fluxion-proxy/`); PROSSIMA_AZIONE = S308 Task A founder Cloudflare Registrar `fluxion-app.com` con URL diretto.

3. **Audit code-truth FLUXION + ARGOS salvati come evidence datata** — `state/code-truth/fluxion-2026-05-28.md` (3.7KB, 23 feature: 2 GIRA / 17 NON_TESTATO / 3 SCAFFOLD / 1 ASSENTE, 0/22 E2E, 8 pezzi mancanti per primo €497) + `state/code-truth/argos-2026-05-28.md` (3.6KB, 20 feature: 9 GIRA / 3 NON_TESTATO / 2 SCAFFOLD / 6 ASSENTE, 0/14 E2E con dealer reale, 6 pezzi mancanti per Stile Car T-6gg). Output prodotti dai CC di progetto via prompt 4-punti Luke (`feedback_codice_fonte_di_verita_prompt.md`).

4. **3 memorie nuove** in `memory/`: `project_vos_plan_l1_manual_priority.md`, `feedback_codice_fonte_di_verita_prompt.md`, già esistente `project_vos_active_hooks.md`. MEMORY.md indice aggiornato.

## Cosa rimane aperto

### Immediato (prossima sessione VOS):

1. **PLAN.md ARGOS riallineamento** — convertire STATO_FEATURE in puntatore a `state/code-truth/argos-2026-05-28.md`. Aggiungere CRITIQUE: `C-ARGOS-DEPLOY-001` (Step C deploy iMac S202/S203 pending, blocker Stile Car T-6gg) + `C-ARGOS-SPLIT-001` (DB split-brain MacBook dealers vs iMac messages) + `C-ARGOS-WA-RESTART-001` (48 restart/34h WA daemon). Aggiornare STACK_TOOL: dealer_network.sqlite split-brain, scrapers 3 (non 28). PROSSIMA_AZIONE = sequence concreta: deploy S203 → E2E TEST_FOUNDER → UAT sanitizer 5/5 → Stile Car. Fonte = audit code-truth datato.

2. **PLAN.md FLUXION STATO_FEATURE** — convertire da inline TBD a puntatore `state/code-truth/fluxion-2026-05-28.md`. Aggiungere CRITIQUE: `C-FLUXI-003` sidecar voice-agent MacBook 296B placeholder vs 77MB iMac (CC tecnico) + `C-FLUXI-004` incoerenza MACRO_CATEGORIE 5/9/8 tra setup.ts/voice/CLAUDE.md (Luke decisione).

### Strutturale (sessione dedicata futura):

3. **L2-vero per motore vos_plan** — abbandonare l'idea di `vos_plan refresh` come diff sintattico PLAN vs NSP. Il fix vero emerso dall'audit Luke 28/5: **STATO_FEATURE fuori da PLAN.md**, sostituito da puntatore a `state/code-truth/<project>-<date>.md`. Nuovo comando `vos_plan audit <project>` che esegue il prompt code-truth 4-punti tramite CC di progetto e scrive evidence datato. PLAN diventa puntatore stabile (cambia su decisioni founder, non su stato codice). Cron settimanale `vos_plan audit` su progetti attivi → drift detection automatico.

## Come riprendere

```bash
cd /Volumes/MontereyT7/venture-os
git status                                      # NSP.md auto cosmetic dirty + state/code-truth/ untracked
cat state/code-truth/argos-2026-05-28.md        # fonte verità ARGOS
cat state/code-truth/fluxion-2026-05-28.md      # fonte verità FLUXION
```

Quindi: punto 1 (ARGOS) o punto 2 (FLUXION STATO_FEATURE) in ordine di urgenza dichiarata. Senza urgenza esplicita, **ARGOS prima per Stile Car T-6gg**.

## Vincoli respected stamattina

- #1 verifica fattuale: tutti i numeri (filesize, mtime, /health 200, smoke test 3 progetti) verificati con Bash/Read
- #3 mai A/B: dopo richiamo Luke "ma che cazzo ne so", riformulato fix L1 + decisione autonoma
- #4 critica strutturale: applicata sulla proposta originale "Edit 3 sezioni PLAN.md" → identificato come terapia sintomatica, riformulato fix L1+L2
- #9 mai diplomatico: riconosciuta proposta originale sbagliata con dati
- #11 pattern recognition: root cause "PLAN.md snapshot stale" → fix strutturale L2-vero (audit code-truth come fonte, non PLAN duplicato)

## Non committato volutamente

`state/code-truth/*.md` untracked + `.claude/NEXT_SESSION_PROMPT.md` modified + `~/.vos/vos_plan.py` modificato fuori da repo. Lascio a sessione successiva o richiesta esplicita commit.

## Fonte canonica corrente

Questo file (`.manual.md`) — brief mattutino prossimo apre da qui via L1 fix appena deployato.
