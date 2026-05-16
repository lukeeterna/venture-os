# HANDOFF S181 — CC Autonomy + Orchestration Setup

> Generato S180 (2026-05-16) post critica Luke "CC deve operare autonomo, delegare, creare strumenti se servono".
> **Vincolo nuovo non sindacabile**: Claude Code DEVE delegare proattivamente a sub-agents/skills/LLM economici. Pattern S159 ricaduta (non delegare → faccio io più veloce → context bloat + qualità mediocre) deve essere prevenuto strutturalmente via hooks deterministic.

## CONTESTO

Sessione S180 ha rivelato pattern strutturale critico:
- **Dati 60 sessioni ARGOS+FLUXION**: 4 Agent invocations totali (tutti general-purpose), 0 Skill invocations specifici → 98% peso morto delegation
- **CLAUDE.md global riga 84** cita "Routing LLM: routing.yaml è bootstrap seed" ma 0 skill usa routing.yaml operativamente
- **routing.yaml v5.1 esiste** (12k bytes, modelli Gemini/Cerebras/OpenRouter/Google verificati last 2026-05-14) — INFRASTRUTTURA pronta, USAGE zero
- **Tools spesi su task low-stakes**: lettura 4 file Guardian + sintesi (delegabile a Gemini Flash $0/free), parse 177 jsonl (delegabile a DeepSeek $0.32/M) — invece fatte da Opus 4 $15/M
- **Luke ha pagato €240/mese + tempo design enterprise** — pretende risultati enterprise = orchestrator-workers pattern, non Claude single-thread

## OBIETTIVI S181 (priority by impact, basato su DATI)

### P0 — Hook UserPromptSubmit deterministic (IMPACT ALTO, complexity media)

**Best practice 2026 Anthropic** (verified WebSearch): "Use hooks (not prompts) for anything that must always execute". Hook intercetta prompt utente PRIMA che Claude veda, inietta system-reminder mandatory delega.

**Implementation prompt per `devops-automator` agent**:
```
Crea ~/.claude/hooks/user_prompt_route_enforce.py — hook UserPromptSubmit Python script.

Funzionalità:
1. Legge stdin JSON con campo user_prompt
2. Tokenize keyword complessità (lista):
   IMPLEMENT_KW = ['implementa', 'configura', 'setup', 'deploy', 'crea script', 'build', 'integra']
   RESEARCH_KW = ['analizza', 'researche', 'cerca', 'confronta', 'valuta', 'studio', 'investiga']
   FIX_KW = ['fix', 'risolvi', 'debug', 'errore', 'rotto', 'non funziona']
   DESIGN_KW = ['progetta', 'architettura', 'design', 'pianifica', 'roadmap']
3. Match keyword → agent suggerito (matrice dispatch CLAUDE.md riga 105-160 + 5 user agents core)
4. Output: hookSpecificOutput JSON con additionalContext:
   "DELEGATION_MANDATORY: prompt contiene keyword <X>. PRIMA di tool Bash/Read/Edit/Write, 
    DEVI invocare Task tool con subagent_type='<AGENT>' e prompt specifico al dominio.
    Eccezione solo per task <2 step (es. lettura singolo file noto)."
5. Logging: ogni invocazione hook scritta in ~/venture-os/state/delegation-enforcement.jsonl
   con campo: ts, user_prompt_hash, kw_matched, agent_suggested, agent_invoked (filled by PostTool hook)

Registra hook in ~/.claude/settings.json sezione "hooks.UserPromptSubmit".

Test: invoca prompt con keyword "implementa" → expect injection visibile in Claude system context.
Output expected: agent backend-architect o devops-automator suggerito.
```

### P1 — VOS auto-agent-router skill (IMPACT ALTO)

Skill user-facing che mappa intent → agent + spawn automatico.

**Implementation prompt per `ai-engineer`**:
```
Crea ~/.claude/skills/vos-auto-router/SKILL.md — skill orchestrator-workers pattern.

Funzionalità:
1. YAML frontmatter: triggers su keyword [delega, route, orchestrate, "fai analizzare", "task pesante"]
2. Lettura ~/venture-os/config/routing.yaml per modello selection
3. Decision matrix intent → (agent, model):
   - "leggi N file + sintesi" → Task(general-purpose, model=gemini-2.5-flash) [via OpenRouter $0.075/M long context]
   - "implementa feature backend" → Task(backend-architect, model=sonnet) [delegato direttamente subagent specializzato]
   - "debug error log" → Task(debugger, model=haiku) [low-stakes]
   - "deploy script + monitor" → Task(devops-automator, model=sonnet)
   - "research mercato/competitor" → spawn ricerca con Gemini Flash long-context (free tier)
   - "decision architetturale critica" → MAIN context (Opus 4, costo giustificato)
4. Cost tracking: ogni delegation appende a ~/venture-os/state/costs.jsonl entry:
   {ts, agent, model, input_tokens, output_tokens, cost_usd, task_type}
5. Soglia hard: se cumulativo mese >€30 (vincolo #5 CLAUDE.md), alert + downgrade automatico verso :free models

Test: invoca skill su "fai un'analisi delle ultime 30 sessioni ARGOS per usage stats agents"
→ expect: spawn general-purpose con gemini-2.5-flash, return summary < 1k token al main.
```

### P2 — Agent factory auto-create (IMPACT MOLTO ALTO — Luke esplicito)

Quando intent non matcha agent esistente, CREO nuovo agent .md specializzato + invoco.

**Implementation prompt per `ai-engineer`**:
```
Crea ~/.claude/skills/vos-agent-factory/SKILL.md — pattern auto-create agent on-demand.

Funzionalità:
1. Triggers su keyword [agent specializzato, expert per X, dominio specifico, mai gestito]
2. Workflow:
   a. Identifica dominio task (es. "Oracle bootstrap", "Stripe integration", "RTSP camera setup")
   b. Verifica match agent esistenti (~/.claude/agents/*.md + project-scoped .claude/agents/)
   c. Se nessun match, GENERA nuovo agent .md con template:
      ---
      name: <domain>-specialist
      description: <one-line capability statement>
      model: sonnet  # haiku per task semplici, opus solo critical decisions
      tools: [Read, Write, Edit, Bash, Glob, Grep]  # subset minimo necessario
      ---
      You are an expert <domain> specialist.
      Mission: <specific outcome>
      Inputs expected: <list>
      Outputs: <structured format>
      Constraints: <safety, scope boundaries>
      Anti-patterns: <what NOT to do>
   d. Salva in ~/.claude/agents/<name>.md o ~/.claude/agents/_generated/<name>.md
   e. Invoca subito con Task(subagent_type=name, prompt=...)
3. Guardrail proliferation: cap a 10 agent generati/sessione, log in state/agent-factory.jsonl
4. Naming: convention lowercase-kebab, max 30 chars
5. Esempio reale S180 missed: "oracle-bootstrapper" sarebbe stato creato per signup OCI + retry loop OOC + IP discovery.

Test: chiedi "voglio agent per Stripe webhook handling" → expect:
- stripe-webhook-handler.md generato
- invocato con prompt dedicato setup webhook + verification + idempotency
```

### P3 — VOS llm-router skill (IMPACT ALTO — gap operativo)

**Punto NUOVO post discussione Luke**: routing.yaml esiste ma 0 skill lo usa. Aggiungere skill che:
1. Auto-invocata su task delegabile a LLM economico
2. Chiama OpenRouter API (key in `~/.claude/.env.openrouter`, verificare esistenza prima)
3. Tracking cost in state/costs.jsonl
4. Return risultato sintetico al main

**Cost data verificati 2026-05-16** (WebSearch):
- Opus 4: $15 in / $75 out per M token
- DeepSeek V3 OpenRouter: $0.32 / $0.89 → **47x economico in / 84x out**
- Kimi K2.5: $0.40 / $1.90 → 37x / 39x
- Gemini 2.5 Flash Google direct: free tier 250 RPD (routing.yaml verified)

**Implementation prompt per `ai-engineer`**:
```
Crea ~/.claude/skills/vos-llm-router/SKILL.md + ~/venture-os/components/llm-router/router.py.

Funzionalità router.py:
1. CLI: router.py --task "<text>" --role <long_context|classify|extract|generate|reason>
2. Parse routing.yaml v5.1 (/Volumes/MontereyT7/venture-os/config/routing.yaml)
3. Resolve chain con fallback: primary → backup1 → backup2 (es. gemini-flash → openrouter-70b → opus)
4. HTTP call al primary provider:
   - Google direct (Gemini): API key da ~/.claude/.env.gemini
   - OpenRouter: API key da ~/.claude/.env.openrouter  
   - Cerebras: API key da ~/.claude/.env.cerebras
5. Tracking: scrivi state/costs.jsonl entry
6. Soglia €30/mese: se exceeded → block + alert al main + downgrade :free models
7. Return JSON {result, model_used, tokens_in, tokens_out, cost_usd, latency_ms}

Skill SKILL.md frontmatter:
description: "Auto-delegate task a LLM economico quando appropriato. Risparmio 20-100x vs Opus.
              Invocare su: long-context analysis (>50k token), classification/extraction batch,
              boilerplate generation, sintesi multi-file. NON usare per decisioni architetturali critiche."

Test: skill auto-trigger su "leggi 4 file Guardian e fa sintesi" 
→ expect: spawn router.py role=long_context → gemini-2.5-flash → return summary
→ verify cost <$0.01 logged in state/costs.jsonl
```

### P4 — Regola DURA CLAUDE.md (IMPACT BASSO, zero costo, ridondanza)

**Implementation diretta (no agent, Write tool)**:
Aggiungere a `~/.claude/CLAUDE.md` sezione nuova prima dei 12 vincoli:

```
## REGOLA #0 — Delegation-first mandatory (non sindacabile)

**WHAT**: PRIMA di Bash/Read/Edit/Write per task multi-step (>2 azioni), valutare OBBLIGATORIO:
  1. Esiste agent specializzato che può fare in context isolato? → Task() obbligatorio
  2. Task delegabile a LLM economico (Gemini Flash/DeepSeek)? → skill vos-llm-router
  3. Nessun agent matcha ma dominio richiede expertise? → skill vos-agent-factory crea nuovo
  4. Solo decisione architetturale critica/strutturale → main context (Opus 4)

**WHY**: 60 sessioni ARGOS+FLUXION = 4 Agent invocations totali = 98% peso morto delegation.
Pattern S159 ricaduta (faccio io più veloce → context bloat + qualità mediocre).

**HOW**: hook UserPromptSubmit `user_prompt_route_enforce.py` inietta system-reminder mandatory.
Eccezione documentata e motivata, mai default.

**Reference**: ~/venture-os/state/delegation-enforcement.jsonl (audit), ~/venture-os/wiki/HANDOFF-S181-cc-autonomy-orchestration.md
```

### P5 — Statusline warning 5+ tool consecutive (IMPACT BASSO, nice-to-have)

**Implementation prompt per `devops-automator`**:
```
Estendere ~/.claude/statusline-command.sh per warning visivo se 5+ tool_use consecutive senza Task spawn.

Funzionalità:
1. Track tool usage sliding window in /tmp/claude-tool-tracker-<session>.json
2. PostToolUse hook (PARALLEL al global_context_gate.py) appende {ts, tool_name} 
3. Statusline check: ultimi 5 entry — se tutti != "Agent" → emit warning emoji + msg "DELEGA"
4. Reset counter dopo Agent spawn

Output statusline esempio:
- Normal: "✓ ctx 28% | model opus-4 | branch master"
- Warning: "⚠️ DELEGA! 5 tool no-agent | ctx 28% | model opus-4"
```

## PATTERN AGGIUNTIVI AVANZATI (espansione S181, copertura completa best practice 2026)

Ricerca aggiuntiva ha rivelato pattern critici che mancavano nel piano P0-P5:

### P6 — Plan-and-Execute (economia fino 90% vs frontier-only)

**Dati**: Gartner 2026 — heterogeneous architecture (Opus planning + DeepSeek/Gemini execute) riduce costi 40-90% mantenendo task success.

**Pattern**:
- Opus 4 (io main) → crea PLAN strutturato (sub-task list + assignment matrix)
- DeepSeek V3 / Gemini Flash → eseguono singoli sub-task in parallelo via OpenRouter
- Aggregator agent → sintetizza risultati in summary unico al main

**Prompt per `ai-engineer` da unire al P1**:
```
Estendi vos-auto-router con modalità "plan-and-execute":
1. Main crea plan JSON: [{subtask, agent, model, expected_output_format}]
2. Skill esegue in parallelo via batch OpenRouter (sub-task indipendenti)
3. Result aggregator (gemini-flash) sintetizza in markdown summary <2k token al main
4. Cost target: <$0.10 per plan execution complete vs $2-5 Opus-only
```

### P7 — Reviewer chain anti-hallucination

**Dati**: feedback loop con reviewer agent riduce hallucinations significativamente (best practice arXiv 2026).

**Pattern**: ogni output critico (code, research, decision) passa attraverso reviewer agent dedicato PRIMA di essere accettato.

**Implementation prompt per `ai-engineer`**:
```
Crea ~/.claude/agents/code-reviewer.md + research-fact-checker.md + decision-validator.md.

- code-reviewer: legge diff Edit/Write recenti, valuta security/correctness/idempotency, return PASS|FAIL+issues
- research-fact-checker: legge claim WebSearch output, verifica con secondary source, return CONFIRMED|DISPUTED+evidence
- decision-validator: prima di scrivere DECISIONS.md D-XX, valida (a) D-XX rif applicabile, (b) vincolo founder DECIDED rispettato, (c) fonte dati — esistente skill pre-action-check ma standalone agent

Integration: PostToolUse hook chain trigger su Edit/Write/WebSearch → spawn reviewer → block commit se FAIL.
```

### P8 — Multi-dimensional eval framework (continuous, NOT post-deploy)

**Dati**: "Evaluation frameworks must be multi-dimensional: task success, reasoning quality, cost, safety, latency — continuously, not as post-deployment audits".

**Pattern**: ogni delegation logged → metric extraction → dashboard real-time.

**Implementation prompt per `devops-automator`**:
```
Crea ~/venture-os/components/eval-tracker/eval.py + dashboard cron giornaliero.

Funzionalità eval.py:
1. Append delegation entry a state/eval.jsonl: {ts, agent, model, task_type, input_tokens, output_tokens, cost, latency_ms, user_feedback (1-5 score post-completion), success_binary, error_type}
2. Daily cron job ~/venture-os/scripts/eval-dashboard.sh: aggrega ultimi 7gg in markdown report ~/venture-os/state/eval-weekly.md
3. Metriche: success rate per agent, cost per agent, avg latency per agent, anti-pattern detected (es. "stesso task fallisce 3x")
4. Alert se metric degrada: success rate <80% → email/log critical
5. Brief mattutino integration: morning-briefer legge eval-weekly.md e include "Top agent della settimana", "Agent da migliorare"
```

### P9 — Meta-monitor agent (auto-detect anti-pattern comportamento CC)

**Pattern**: agent dedicato osserva session jsonl recenti e segnala anti-pattern.

**Implementation prompt per `ai-engineer`**:
```
Crea ~/.claude/agents/cc-meta-monitor.md + componente VOS components/cc-meta-monitor/monitor.py.

Funzionalità monitor.py:
1. Cron-triggered ogni 30min: analizza ultima sessione attiva jsonl
2. Anti-pattern detection rules:
   - >5 tool consecutive senza Agent spawn → "delegation gap"
   - WebSearch ripetuto identico (>2x stessa query in 1h) → "search loop"
   - Edit-revert pattern (edit X poi revert X poi edit X) → "indecision/no-plan"
   - File read >3 volte in stessa sessione → "context pollution"
   - Bash error rate >30% ultimi 10 cmd → "blind execution"
3. Append finding a state/cc-anti-patterns.jsonl
4. Se severity HIGH: emit alert system-reminder visible main (next prompt)
5. Weekly aggregation → memory feedback rule auto-generated (se pattern recurrent)
```

### P10 — Knowledge accumulation via session log mining

**Pattern**: estrarre automaticamente learnings da session jsonl → memory feedback rules.

**Implementation prompt per `general-purpose` con gemini-flash (long context)**:
```
Componente ~/venture-os/components/learning-extractor/extractor.py:
1. Weekly cron: legge ultime 50 session jsonl
2. Estrai pattern: "Luke ha corretto X N volte" → propone nuova feedback memory  
3. Estrai: "Agent Y ha avuto N success vs M fail" → propone update dispatch matrix
4. Output: ~/venture-os/state/learning-proposals-<weekn>.md con suggested memory updates
5. Luke review weekly, accetta/rifiuta proposte → applicate a MEMORY.md
```

### P11 — Voice integration per non-dev (Luke explicit need)

**Pattern**: Luke chiama "delega questo task" o "spiegami cosa fa agent X" via voice.

**Note**: Luna voice agent (FLUXION/pulizia-smartphone repo) già STT Groq + NLU. Integration opportunity.

**Implementation deferred S182**: skill `vos-voice-orchestration` che wraps Luna NLU → spawn CC agents → speaks results back.

## OBIETTIVO STRUTTURALE FINALE

Sistema che produce risultati enterprise per non-developer founder:
1. **Trust senza audit**: reviewer chain (P7) + eval framework (P8) → Luke vede metric, non legge codice
2. **Cost-efficient**: heterogeneous LLM (P6) + delegation enforcement (P0) → 90% riduzione costo operativo
3. **Self-improving**: meta-monitor (P9) + learning extractor (P10) → sistema migliora autonomo nel tempo
4. **Auto-creating**: agent factory (P2) → no friction quando emerge dominio nuovo
5. **Observable**: dashboard eval (P8) + costs.jsonl (P3) → visibilità totale spending+quality

## REFERENZE BEST PRACTICE 2026 (verified WebSearch)

- 6 orchestration patterns production-grade: beam.ai/agentic-insights/multi-agent-orchestration-patterns-production
- Gartner cost optimization 40-55%: aetherlink.ai/en/blog/agentic-ai-multi-agent-orchestration-enterprise-guide-2026
- Plan-and-Execute economia 90%: aetherlink.ai stesso source
- Eval multi-dim continuous: gurusup.com/blog/best-multi-agent-frameworks-2026
- arXiv reviewer/fact-checker pattern: arxiv.org/html/2601.13671v1

## SEQUENZA IMPLEMENTAZIONE RACCOMANDATA

In nuova sessione VOS (cwd `/Volumes/MontereyT7/venture-os`):

**WAVE 1 — Core enforcement (P0+P1+P3+P4)**:
1. **Turn 1**: leggi questo handoff (Read tool)
2. **Turn 2**: spawn `ai-engineer` con prompt unito P1+P3 (router + llm-router skills, correlate) → return skill files + test
3. **Turn 3**: spawn `devops-automator` con prompt P0 (hook user_prompt_route_enforce) → return script + settings.json patch
4. **Turn 4**: applica patch settings.json + Write CLAUDE.md regola #0 (P4) + test E2E hook injection

**WAVE 2 — Auto-creation & reviewer (P2+P7)**:
5. **Turn 5**: spawn `ai-engineer` con prompt P2 (agent factory) + P7 (reviewer chain) → return skill + 3 reviewer agents
6. **Turn 6**: test agent factory creando dummy agent "stripe-webhook-handler" via skill

**WAVE 3 — Eval & monitoring (P6+P8+P9)**:
7. **Turn 7**: spawn `devops-automator` con prompt P8 (eval framework + dashboard cron) → return components/eval-tracker/
8. **Turn 8**: spawn `ai-engineer` con prompt P9 (meta-monitor agent) + P6 (plan-and-execute extension) → return components/cc-meta-monitor/ + router extension

**WAVE 4 — Knowledge & integration (P5+P10)**:
9. **Turn 9**: spawn `devops-automator` con prompt P5 (statusline warning) + P10 (learning extractor) → return statusline patch + extractor.py
10. **Turn 10**: commit + update DECISIONS VOS con D-VOS-01 (orchestration architecture P0-P10 decided)

**VALIDATION**:
11. **Turn 11**: test E2E completo:
    - Apri sessione test su ARGOS, prompt "analizza ultime 30 sessioni ARGOS per usage"
    - Expect: hook inietta delegation reminder → spawn general-purpose con Gemini Flash via router → cost <$0.05 → reviewer chain → eval logged
12. **Turn 12**: handoff S182 con metriche before/after (cost, delegation rate, anti-pattern detection)

**WAVE 5 (deferred S182)**: P11 voice integration via Luna NLU.

**Effort stimato**: 12 turn × ~5min/turn = 1 ora sessione + agent execution paralleli ~30min totali = **~90 min implementazione completa**.

## STRATEGIA OTTIMALE BUILD-EXECUTE-REVIEW (decisione autonoma S180, data-driven 2026)

**Pattern**: Opus pianifica + LLM economici eseguono + reviewer chain indipendente valida + main aggregator integra.

**Routing matrix per ruolo task** (verified WebSearch 2026-05-16):

| Ruolo task | Modello primario | Costo M token | Score benchmark | Fallback |
|-----------|------------------|---------------|-----------------|----------|
| **Architettura/decisioni strutturali** | Opus 4 (main) | $15 in / $75 out | best reasoning | — (no downgrade) |
| **Code generation specialized** | Kimi K2.6 Thinking via OpenRouter | $0.73 / $3.49 | 78.57 coding / 58.33 agentic | DeepSeek V4 Pro $0.27/$1.10 |
| **Code review indipendente** | DeepSeek V3 via OpenRouter | $0.32 / $0.89 | alta intelligenza review | Qwen 3.6 27B free OpenRouter |
| **Long-context analysis (>50k)** | Gemini 2.5 Flash direct | FREE 250 RPD | 1M context | Llama 4 Scout via OpenRouter (10M context, free quota) |
| **Boilerplate/extraction batch** | DeepSeek V4 Flash | $0.01 / token (ultra budget) | sufficient quality | DeepSeek V3 |
| **Reasoning math/algorithm** | DeepSeek V3.2 reasoning | $0.32 / $0.89 | leader algorithmic | Opus solo se fail |
| **Voice/conversation/STT-NLU** | Groq Llama 3.3 70B | FREE 14400 RPD | low latency | Cerebras free |

**Build-Execute-Review chain esempio reale** (task: "implementa skill vos-llm-router"):
1. **Opus main** (io): crea spec dettagliata + acceptance criteria + test cases (architettura, ~2k token, $0.03)
2. **Spawn Kimi K2.6 Thinking** via vos-llm-router: implementa router.py + SKILL.md secondo spec (~10k token out, $0.04)
3. **Spawn DeepSeek V3** (reviewer indipendente, mai stesso modello che ha scritto): review codice per security/correctness/idempotency (~3k token, $0.003)
4. **Spawn DeepSeek V4 Flash**: genera test cases dai acceptance criteria (~2k token, $0.00002)
5. **Opus main aggrega**: summary + commit
- **Totale**: $0.07 (vs $2-3 se Opus avesse fatto tutto = saving 95%+)

**Pattern decisionale automatico**:
- Task <2 step: io direct (no overhead delega)
- Task 2-5 step uniformi: spawn singolo agent appropriato
- Task multi-domain o >5 step: orchestrator-workers pattern → spawn N agents paralleli + aggregator
- Task critico (decisione architetturale/scope): io main, no delega

**Cost target operativo**:
- Sessione complessa pre-S181: $3.75-$5 (Opus full)
- Sessione complessa post-S181: $0.20-$0.40 (build-execute-review)
- **Saving**: 90-95%
- Budget mensile target: <€15/mese (vs €30 soglia hard CLAUDE.md vincolo #5)

**Aggiornamenti routing.yaml necessari** (S181 implementation):
- Aggiungere ruolo `code_gen`: kimi-k2.6-thinking primary, deepseek-v4-pro backup
- Aggiungere ruolo `code_review`: deepseek-v3 primary (forced different model than code_gen for independence), qwen-3.6-27b backup
- Aggiungere ruolo `boilerplate`: deepseek-v4-flash primary (ultra-cheap)
- Aggiungere ruolo `reasoning_algorithm`: deepseek-v3.2 primary
- Mantenere `long_context`: gemini-2.5-flash (free, 1M ctx)

## CREATIVE AI EXPANSION (S181 P12-P15, image/video/social/AI-news monitoring)

### P12 — Image generation routing (FREE-first)

**Stack consigliato 2026** (verified WebSearch 2026-05-16):
- **Primary FREE**: ComfyUI Web (cloud, no install, Flux.2 + Stable Diffusion 3.5 + LoRAs supportate) — free tier sufficient per 10-20 img/giorno marketing
- **Local fallback se serve unlimited**: ComfyUI desktop + Flux Schnell su iMac (no AVX2 limit con CPU mode lento ma funzionante)
- **Existing skill VOS**: `free-gpu-api` (~/.claude/skills/free-gpu-api/) — Colab T4 15GB VRAM gratis + ngrok per esporre Flux/SD come REST API. **GIÀ DISPONIBILE, mai usato**.

**Implementation prompt per `ai-engineer`**:
```
Estendi vos-llm-router con ruolo `image_gen`:
- primary: free-gpu-api skill (Colab T4 + Flux.2-schnell, già configurato)
- backup: ComfyUI Web API
- fallback paid: Replicate Flux.2 ($0.003/img solo se free quota exceeded)
Auto-trigger su keyword [genera immagine, crea visual, illustrazione, banner, poster, mockup].
Output: URL/path immagine + metadata prompt.
```

### P13 — Video generation routing

**Stack 2026 verified**:
- **Primary FREE**: ComfyUI Web video tools (Wan 2.5, Seedance, Hailuo) — free tier 5-10 video/giorno
- **Self-host**: Stable Video Diffusion via Colab T4 (free-gpu-api stack)
- **Paid backup**: Hailuo API $0.05/sec, Kling 3.0 $0.10/sec — solo se urgente

**Implementation prompt per `ai-engineer`**:
```
Estendi vos-llm-router ruolo `video_gen`:
- primary: ComfyUI Web (free tier)
- self-host: Stable Video Diffusion via Colab (free-gpu-api extension)
- paid only if needed
Auto-trigger su keyword [genera video, crea clip, animazione, marketing video, reel, short].
```

### P14 — Social media automation hub

**Existing**: 5 social agent in ~/.claude/skills (instagram-curator, tiktok-strategist, twitter-engager, reddit-community-builder, app-store-optimizer) **mai invocati**.

**Implementation prompt per `ai-engineer`**:
```
Crea skill ~/.claude/skills/vos-social-hub/SKILL.md orchestrator dei 5 social agent esistenti.

Funzionalità:
1. Input: campagna scope (es. "lancio FLUXION V1.2, target SMB italiani, 7 giorni")
2. Spawn parallelo dei 5 social agent (instagram-curator, tiktok-strategist, twitter-engager, reddit-community-builder, content-creator) per generare:
   - Instagram: 7 caption + 3 carousel scripts
   - TikTok: 7 video scripts
   - Twitter/X: 14 tweets + 1 thread
   - Reddit: 3 post pitches subreddit-specific
   - Long content: 1 blog post 1000 word
3. Aggregator: produce calendar editoriale markdown + assets list
4. Pricing route: spawn agents con model=haiku 4.5 (writing creative, low-cost)

Auto-trigger su keyword [lancio prodotto, campagna social, content calendar, marketing push].
```

### P15 — AI news/tools monitoring continuous

**Vincolo Luke S180**: "restare sempre aggiornati sul mondo dell'ai che può interessare quello che faccio... promessa fatta mai mantenuta".

**Existing infrastructure**: `tool-scout` componente VOS (~/venture-os/components/tool-scout/) + `tool-landscape.jsonl` snapshot settimanale + brief mattutino già mostra "tool-scout github-fluxion-tech nuovo top-safe X". Funziona MA solo per tech areas (fluxion-tech, cross-vos già configurate in `config/tool-scout-areas.yaml`).

**Implementation prompt per `devops-automator`**:
```
Estendi tool-scout config con NUOVE aree:
- creative-ai (image gen, video gen, audio gen, comfyui workflows)
- social-automation (scheduling tools, AI copywriting, engagement bots)
- voice-ai (TTS, STT, voice cloning)
- vertical-italia (AI tools mercato italiano, fintech, gestionali AI)
- llm-news (model releases, pricing changes, free tier updates)

Update `~/venture-os/config/tool-scout-areas.yaml` add 5 sezioni.
Schedule tool-scout esistente già notturno → estende automaticamente coverage.
Update morning-briefer template per includere top-3 highlights da nuove aree in Brief mattutino.
```

## CONSULENZA ESTERNA — PROMPT PRONTI

**Quando usare**: validation architetturale terza parte + research fresca senza bias my context.

### Gemini 2.5 Pro (free 1M context) — VALIDAZIONE ARCHITETTURA

Copia in https://gemini.google.com/ (Pro free tier):
```
Sono founder non-developer di 3 venture (ARGOS lead-gen B2B Italian auto dealers, FLUXION gestionale SMB con voice agent, Guardian fall-detection anziani). Pago Claude Code €240/mese ma sto avendo problemi di "delegation gap" — CC non usa proattivamente i sub-agents/skills installati (4 invocazioni su 60 sessioni). Ho un piano in 11 pattern (P0-P11) + 4 expansion creative (P12-P15). Allegato handoff completo S181. 

Valuta:
1. Gap strutturali nell'architettura proposta che ho mancato
2. Anti-pattern noti in orchestrator-workers + agent-factory dinamici (proliferation risk?)
3. Best practice 2026 per non-developer founder che vogliono trust enterprise senza audit codice
4. Modelli FREE/CHEAP migliori per code review chain indipendente che hai trovato nei tuoi dati 2026
5. Cost realistico totale operativo se applico tutto (€/mese, traffico medio 5h/giorno)

Output: critica strutturale lean (max 800 word) + 3 concrete improvement suggestions + 1 risk #1 da mitigare.
```

### Perplexity (free) — RESEARCH FRESCA MODELLI

Copia in https://www.perplexity.ai/:
```
Aggiornamento maggio 2026: dammi top-5 LLM free-tier o ultra-cheap (<$0.50/M input) per ognuna di queste 4 categorie, con prezzi verificati ultima settimana:

1. Code generation (Python/TypeScript backend)
2. Code review indipendente (security, correctness)
3. Long-context analysis (>500k token, sintesi multi-file)
4. Reasoning critico (math, algorithm, decision tree)

Per ogni modello: provider (OpenRouter/direct/HuggingFace), context window, prezzo input/output per M token, latency tipica, benchmark score (LiveBench/SWE-bench se disponibile).

Cita SOLO fonti ultimo mese (no training data).
```

### Claude.ai (web, free tier) — SECOND OPINION DECISIONALE

Quando Luke vuole second opinion strutturale, copia handoff S181 + chiedi:
```
Second opinion da AI peer su questo piano. Sono un founder non-developer che ha Claude Code in sessione tecnica. Il piano implementa orchestrator-workers + agent factory + multi-LLM routing per ridurre costi 90% + migliorare delegation rate dal 6.7% al 70%+.

Cosa NON faresti in questo piano se fossi tu, e perché?
```

## VINCOLI HARD

- EUR 0 spend incrementale (uso solo free-tier Gemini + paid OpenRouter <€30/mese hard)
- Routing.yaml NON modificare (è già config bootstrap S5)
- Costs.jsonl scrittura solo via router.py (no direct echo)
- Hook test in isolated session prima di commit produzione
- Reversibile: TUTTI i nuovi file in commit dedicato `s181-cc-autonomy`, revert con `git revert` se rompe

## STATO LASCIATO IN S181 (WAVE 1 DONE — 2026-05-16 chiusura verde)

**WAVE 1 completata** (P0+P1+P3+P4):

| Item | Path | Stato |
|------|------|-------|
| P0 hook delegation enforcement | `~/.claude/hooks/user_prompt_route_enforce.py` | ✓ E2E test 3/3 pass |
| P0 hook registrazione | `~/.claude/settings.json` (+ `.bak`) | ✓ idempotente |
| P1 orchestrator-workers skill | `~/.claude/skills/vos-auto-router/SKILL.md` | ✓ loaded |
| P3 LLM router skill | `~/.claude/skills/vos-llm-router/SKILL.md` | ✓ loaded |
| P3 building block | `/Volumes/MontereyT7/venture-os/components/llm-router/router.py` | ✓ commit 3f7274c |
| P4 regola #0 mandatory | `~/.claude/CLAUDE.md` (prima dei 12 vincoli) | ✓ |
| Audit log delegation | `~/venture-os/state/delegation-enforcement.jsonl` | ✓ 2 entry test |

**Test E2E hook**:
1. `"implementa hook backend API"` → injection `backend-architect` ✓
2. `"analizza tutti gli handoff..."` → injection `vos-llm-router:long_context` ✓
3. Stdin malformato → exit 0 silente (fail-soft) ✓

**Critica strutturale rilevata dagli agents (da affrontare WAVE 2+)**:
- Anti-pattern coesistenza: `~/.claude/hooks/prompt-router.sh` orfano (non registrato in settings.json). Se in futuro registrato → doppia injection contraddittoria. **Azione**: consolidare/eliminare in WAVE 2.
- vos-llm-router NO check preventivo quota Gemini Flash 250 RPD. **Azione P8**: aggiungere a eval-tracker.
- `delegation-enforcement.jsonl` cresce senza rotazione. **Azione**: logrotate weekly in P8.
- Schema PLAN JSON vos-auto-router sovradimensionato per task ≤3 step (overhead/friction). **Azione**: documentare opt-out per task semplici.
- Matrice dispatch keyword diventa stale a 60gg se nuovi agent on-demand creati. **Azione P2 agent-factory**: auto-update keyword matrix all'insert.

**Entry point WAVE 2**: spawn `ai-engineer` con prompt P2 (agent-factory skill) + P7 (3 reviewer agents: code-reviewer/research-fact-checker/decision-validator).

**OQ-S181 da rispondere PRIMA di WAVE 2** (governance/budget):
- OQ-S181-1: cap mensile costs.jsonl €30 hard (vincolo #5) o €15 conservative?
- OQ-S181-2: agent-factory genera in `_generated/` subdir o main `agents/`?
- OQ-S181-3: hook UserPromptSubmit skip-pable con flag esplicito utente (es. `[no-delegate]`)?

**Commit WAVE 1**: file deliverable in `~/.claude/` (scope globale vincolo #12, fuori repo VOS). VOS repo contiene solo update handoff + state log gitignored.

---

## STATO LASCIATO IN S180

- **Loop Oracle ARM A1** retry attivo background (PID 81238, log /tmp/oracle-launch-retry.log, monitor task ba3xdsccp). 
  - **DECISIONE NUOVA S180**: Oracle è infra DEV mia, NON path produzione cliente Guardian (chiarito da Luke "ogni cliente paga sua infra", D-07 update).
  - **AZIONE consigliata S181**: stoppare loop se non serve più (`kill 81238`), oppure lasciare gira per dogfooding Luke.
- **Guardian DECISIONS aggiornato**: D-07 DECIDED (scope distribuzione = commerciale lean, no overhead legale pre-revenue, 2026-05-16)
- **Guardian Q3-Q8 founder discovery PENDING** (riferimento conversazione S180 turn ~50 in poi: hub on-premise vs cloud cliente, iOS support, feature scope V1, pricing, GDPR, Luna inclusion)
- **GSD archive completo** in ~/.claude/_archive/ (commands-gsd/ + agents-gsd/ + get-shit-done-framework/). Reversibile.
- **Memory feedback rules nuove** in S180 (vedi sezione MEMORY UPDATE sotto)

## MEMORY UPDATE (da applicare in S181 turn 1)

Aggiungere a `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/MEMORY.md`:
- `feedback_delegation_first_mandatory.md` — regola comportamentale "DEVI delegare proattivamente, vincolo Luke S180 non sindacabile"
- `feedback_cc_create_agents_on_demand.md` — se nessun agent matcha, crea nuovo agent .md invece di fare io step-by-step
- `feedback_llm_router_use_routing_yaml.md` — invoca vos-llm-router skill per task delegabile (long-context analysis, classification, sintesi) → risparmio 20-100x vs Opus

## DOMANDE OPEN

- OQ-S181-1: cap mensile costs.jsonl a €30 hard (vincolo #5) o €15 conservative?
- OQ-S181-2: agent factory genera in `_generated/` subdir o in main agents/? (governance proliferation)
- OQ-S181-3: hook UserPromptSubmit deve essere skip-pable in casi spiegati (es. comando esplicito utente "no delega questa volta")?

## REFERENCES

- Best practice Anthropic 2026: https://code.claude.com/docs/en/hooks (UserPromptSubmit)
- Orchestrator-workers pattern: docs.anthropic.com agent SDK
- OpenRouter pricing verified 2026-05-16: https://openrouter.ai/pricing
- VOS routing.yaml v5.1: `/Volumes/MontereyT7/venture-os/config/routing.yaml`
- Critica Luke S180: turno conversazione "io non sono uno sviluppatore e pretendo che cc operi i maniera autonoma e addirittura CREI quello che gli serve"
