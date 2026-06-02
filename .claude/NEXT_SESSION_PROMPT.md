# Prompt ripartenza — generato automaticamente

**Generato**: `2026-06-02T18:XX:XXZ`
**Sessione**: tool-evaluator ground-truth substrate
**Repo**: `/Volumes/MontereyT7/venture-os` (branch `master`)

## Task completato in questa sessione

Valutazione substrato ground-truth persistente per Claude Code (problema: CC sostituisce fatti esterni con narrativa interna quando il check e' costoso).

**RACCOMANDAZIONE: codebase-memory-mcp (DeusData)**
- GitHub: https://github.com/DeusData/codebase-memory-mcp
- 2.9k stelle, MIT, ultimo commit 2026-05-30
- Binario statico, macOS 11 Big Sur esplicito supportato
- MCP server nativo CC, SQLite embedded, zero dipendenze runtime
- Benchmark: 83% answer quality, 10x fewer tokens, 2.1x fewer tool calls

**Candidati scartati:**
- Graphify (58.3k stelle, MIT, v0.8.28 2026-06-01) — piu' pesante (Python + server separato), orientato a visualization non a query veloci in-session
- mcp-knowledge-graph (862 stelle, MIT, ultima release 2025-12-22) — memoria semantica manuale, non indicizza codice reale

**2 rischi codebase-memory-mcp:**
1. Adozione bassa (2.9k stelle) — binario funziona offline comunque
2. Grafo stale se non re-indicizzato dopo modifiche — serve hook PostToolUse su git commit

## Se Luke vuole procedere con integrazione

```bash
# Install (un comando, nessun pip/npm)
curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash

# Indicizza VOS
codebase-memory index /Volumes/MontereyT7/venture-os

# Registra come MCP in ~/.claude/settings.json sezione mcpServers
```

## Come riprendere

Apri Claude Code da `/Volumes/MontereyT7/venture-os` e leggi questo file.
