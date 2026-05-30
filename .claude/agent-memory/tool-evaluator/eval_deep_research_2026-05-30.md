---
name: Deep Research evaluation 2026-05-30
description: Comparativa strumenti deep research da terminale per Luke (Big Sur, free-tier first, OpenRouter esistente)
type: reference
---

Valutazione eseguita 2026-05-30. Fonti: doc ufficiale Google AI, OpenRouter, GitHub repo.

## Gemini Deep Research (nativo Google)
- Modelli: deep-research-preview-04-2026 (standard ~$2/task), max ~$5/task
- API: Interactions API (async, separata da generate_content)
- Free tier API: NO (Gemini 3.1 Pro non ha free tier API; 5000 free search queries/mese condivise)
- Costo reale per task: $1.12 search + ~$0.95 inference = ~$2/task standard
- Wrapper CLI: agent-deep-research (24601/agent-deep-research) — MIT, v2.1.3 Feb 2026
  - Install: `npx skills add 24601/agent-deep-research -a claude-code -g -y` → INCOMPATIBILE Big Sur (Node 20 richiede macOS 13.5+)
  - Alternativa: uv run scripts/research.py direttamente — COMPATIBILE se Python funzionante

## Perplexity sonar-deep-research via OpenRouter
- Endpoint: openrouter.ai/perplexity/sonar-deep-research
- Pricing: $2/M input, $8/M output, $5/1000 searches
- Costo stimato per query: $0.30-$1.30 (variabile, modello decide numero ricerche)
- Free tier: NO su OpenRouter API
- VANTAGGIO: già su OpenRouter esistente di Luke (routing.yaml), zero setup aggiuntivo

## Brave Search API
- Free tier eliminato maggio 2026 → $5 prepaid credit (~1000 query)
- Non fa deep research multi-step nativo → ESCLUSO

## gemini-cli (Google ufficiale)
- Richiede Node.js 20+, Node 20 richiede macOS 13.5+ → INCOMPATIBILE Big Sur

## Raccomandazione finale
Perplexity sonar-deep-research via OpenRouter esistente.
- Zero setup: già ha chiave OpenRouter + routing.yaml
- Costo per research task profondo: ~$0.50-$1.00 stimato
- Integrazione CC: skill bash wrapper in ~/.claude/skills/deep-research/
- Path implementazione: aggiungere model alias in routing.yaml + script Python 20 righe

**Why:** agent-deep-research (24601) è più potente ma il path npx è bloccato da Node/Big Sur.
Il path uv diretto richiede Google API key paid ($2/task). Perplexity via OR è infrastruttura già presente.
