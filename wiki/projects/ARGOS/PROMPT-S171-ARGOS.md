# Prompt S171 — ARGOS terminal — debug daemon duplicate sends + dataset extension

> **Workspace**: questo prompt va eseguito in terminal Claude Code con `cwd ~/Documents/combaretrovamiauto-enterprise`
> **NON** in terminal VOS (cwd `/Volumes/MontereyT7/venture-os`)
> Decisione split workspace presa S170 close 2026-05-14.
> Memory pointer VOS: `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_workspace_split_vos_vs_argos.md`

---

## Stato precedente (S170 close)

**Verde tecnico**:
- Pipeline outbound E2E validata S169 (daemon Baileys + bridge.sqlite + wa_msg_id)
- Pipeline inbound classifier E2E validata S170 (MessageAnalyzer.analyze → intent/sentiment/scam_flag via Groq cascade)
- GROQ_API_KEY ruotata + daemon restart pickup confermato

**Rosso strutturale scoperto S170 close**:
- 🔴 **Bug daemon duplicate sends** (blocker assoluto wave 2+)
  - Sintomo: daemon invia N msg identici per ogni outbound row queue+approved
  - Confermato wave 1 S170: 4/5 bridge_outbound mostravano `sent_status=ok` row singola MA dealer riceveva multipli msg identici
  - Founder ha eliminato msg prima reply window → wave 1 V5/D-26 metric INVALIDATO (spam percezione ≠ test paradigma)
  - Pattern: noto-non-fixato ricorrente cross-session
  - Memoria VOS: `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_wa_daemon_duplicate_sends.md`
- **Dataset wave 1 burned**: 4 dealer pool nazionale non re-contattabili stesso V5 msg1
  - Dream Car (Puglia/FG) 393494530357
  - GP Cars (Puglia/TA) 393283132484
  - Autoline (Campania/AV) 393478956058
  - WP Cars (Campania/SA) 393479227573
- **Dataset geo-bias**: 18 dealer tutti Sud (Puglia/Campania/Calabria). 0 Nord/Centro/Isole. Blocker wave 2 territory-diversified.

**Framework V5 paradigma relational** (founder S169 explicit, D-26 DECIDED S170):
- Msg 1: persona + mirror reality + domanda aperta no-CTA (~95-105 parole)
- Msg 2 (3-7gg post reply): amplify + caso concreto + soft question (hand-crafted)
- Msg 3 (post engagement): "le mando dossier?" binary CTA → entra D-21 step 2
- Testo V5 canonical: vedi DECISIONS.md D-26

## Goal S171 — Sequenza atomica

### Priority 1 — Fix daemon duplicate sends (blocker assoluto)

**Diagnostic candidati root cause**:
1. **Poll race condition**: daemon polla ogni 30s `WHERE approved_ts IS NOT NULL AND sent_ts IS NULL`. Se Baileys send-call dura > 30s (network slow), poll #2 vede stesso row → re-send. Lock missing.
2. **Baileys retry layer interno**: libreria Baileys ha logica retry su WebSocket glitch → retry stesso payload senza idempotency check ARGOS-side.
3. **Schema missing UNIQUE constraint**: `bridge_outbound` non ha `UNIQUE (deal_id, target_phone, body_hash)` → permette N row identici (anche se nel test S170 sembrava single row).

**Step diagnostic**:
```bash
# 1. Query duplicate sent_ts stamps
ssh imac "sqlite3 -header /Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/bridge.sqlite \
  'SELECT id, deal_id, target_phone, sent_ts, sent_status, wa_msg_id FROM bridge_outbound WHERE deal_id LIKE \"S170-WAVE1-%\" ORDER BY id'"

# 2. Tail daemon logs S170 send window (20:43-20:46)
ssh imac "grep -E '(send|outbound|S170-WAVE1)' /tmp/argos-wa-daemon-out.log /tmp/argos-wa-daemon-err.log | tail -50"

# 3. Inspect daemon source per poll/send logic
ls ~/Documents/app-antigravity-auto/wa-intelligence/
# wa-daemon.js — cerca: poll interval, Baileys send call, lock/mutex, idempotency
```

**Fix design (post-diagnostic)**:
- Se poll race → aggiungi UPDATE `processing_ts = NOW()` PRE-send + filter `processing_ts IS NULL OR processing_ts < NOW() - 60s` (timeout reclaim stale rows).
- Se Baileys retry → wrap send in idempotency layer ARGOS-side (cache `wa_msg_id` per outbound id, skip se già present).
- Se schema → ALTER TABLE bridge_outbound ADD COLUMN body_hash + UNIQUE constraint (idempotent via DROP/recreate).

**Verifica fix**:
1. Queue 1 outbound test (test number founder phone)
2. Founder count msg ricevuti via WA business: deve essere esattamente 1
3. Repeat 3 volte con phone diversi → 1 msg ciascuno
4. Solo se 3/3 = 1 msg → fix verified

### Priority 2 — Extension dataset Nord/Centro/Isole

**Pattern current**: CoVe v4 scouting probabilmente configurato regioni Sud-only (legacy Foggia S168). Verifica:
```bash
grep -rE 'region|provincia' ~/Documents/combaretrovamiauto-enterprise/scout/ | head
```

**Target wave 2**:
- ≥30 dealer total nuovi (NOT in wave 1)
- Distribution balanced: ≥6 Nord, ≥6 Centro, ≥6 Sud (esclusi 4 burned wave 1), ≥4 Isole, resto wildcard
- Filtro: NEW + WA present + score_fit ≥ 5.0

**Step**:
1. Identifica modulo scout regions config
2. Estendi a tutte 20 regioni IT
3. Re-run scout pipeline su Nord (Lombardia/Veneto/Piemonte/Emilia), Centro (Toscana/Lazio/Marche/Umbria), Isole (Sicilia/Sardegna)
4. Output: `dealer_network.sqlite` cresce a 50+ entry balanced

### Priority 3 — Variante msg1 per dealer wave 1 burned (cooldown decision)

4 dealer Sud (Dream Car, GP Cars, Autoline, WP Cars) sono stati spammati. Opzioni:
- (a) Re-contatto immediato con msg "scusa, problema tecnico, ecco testo singolo" — risk: peggiora trust
- (b) Cooldown 30-60gg + msg1 variante (V6 testo diverso) — preferibile
- (c) Skip definitivo, marcare `pipeline_status=BURNED_S170` — perde 4/18

**Raccomandazione**: (b) cooldown 60gg + V6 variante. Memoria dealer si attenua, V6 ricontestualizza.

### Priority 4 — Test V5 wave 2 puliti (post fix daemon + extension dataset)

Solo dopo P1 + P2 done:
- Wave 2 = 5-10 dealer Nord/Centro mai contattati
- Verify metric reply rate reale paradigma V5 (target ≥20% = 1/5)
- Se reply rate <20% wave 2 puliti → V5 design da rivedere (V6 iteration)
- Se ≥20% → procedi wave 3 scaling D-14

## Vincoli S171

- **#1** verifica fattuale: ogni claim su Baileys/daemon/SQLite verified con doc upstream o source code
- **#3** raccomandazione singola (P1 fix design dopo diagnostic — no opzioni A/B/C aperte a Luke)
- **#4** autocritica 4 punti per fix design (assunzioni, cosa rompe, pattern errore, sovradimensione)
- **#5** zero capex (solo OSS, free-tier)
- **#6** verde gate: fix daemon verified 3/3 single send OR handoff strutturato S172
- **#7** /context periodicamente — sopra 60% chiusura
- **#9** no diplomatico
- **#10** verificato > verosimile (NON inventare Baileys API non documented)
- **#11** root cause strutturale fix (no workaround episodico)

## Memory pointers da leggere (manualmente o via skill)

Memory VOS-side path: `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/`
File rilevanti per ARGOS S171:
- `feedback_pattern_S159_mitigation.md` — B6 3-line check D-XX/founder-vincolo/fonte-dati
- `feedback_argos_scope_italia.md` — MAI hardcodare territorio
- `feedback_premature_optimization.md` — NO legale-fiscale pre-revenue
- `feedback_wa_daemon_duplicate_sends.md` — DETTAGLI bug daemon (questo prompt riassume)
- `feedback_workspace_split_vos_vs_argos.md` — regola workspace split

ARGOS-side memory dir (questa sessione): `~/.claude/projects/-Users-macbook-Documents-combaretrovamiauto-enterprise/memory/`
Se vuota: leggi quelle VOS-side come reference iniziale, poi crea feedback ARGOS-specifici incrementali in dir locale.

## Riferimenti

- ARGOS DECISIONS.md path: `/Volumes/MontereyT7/venture-os/wiki/projects/ARGOS/DECISIONS.md` (canonical VOS-wiki)
  - D-21: workflow comm-broker-garante 8-step
  - D-26 NEW: cold-lead framework V5 3-step relational (S170)
  - Open Q #10: dataset geo-bias Sud-only
  - Open Q #11: Auto Carfora send fail (No LID)
  - Open Q #12: 🔴 BLOCKER daemon duplicate sends (questo prompt P1)
- Repo ARGOS local: `~/Documents/combaretrovamiauto-enterprise/` (git tracked)
- Daemon iMac: PM2 `argos-wa-daemon` PID dinamico, source `~/Documents/app-antigravity-auto/wa-intelligence/wa-daemon.js`
- Bridge DB iMac: `/Users/gianlucadistasi/Documents/app-antigravity-auto/comm-broker/bridge.sqlite`
- Deals DB iMac: stessa dir `deals.sqlite`
- Last VOS commit S170: `174260d` master (Open Q #12 added DECISIONS.md)

## Start trigger

Founder apre terminal ARGOS, copia-incolla questo prompt. Tu (Claude ARGOS-instance) inizi P1 diagnostic step 1 query.
