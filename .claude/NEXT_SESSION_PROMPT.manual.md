# NEXT SESSION — VOS (chiusura ordinata 2026-06-02 #7 @71%, VERDE)

## 1. Fatto: vincolo 1d (asse "sicuro/reversibile")
Estesa la metodologia draft-V2 da "è fatto" (1b) a "è sicuro/reversibile" (1d). Principio unico: **ogni claim di CC su sé stesso ancorato a un fatto esterno verificabile, mai alla narrazione interna.**

Trigger: incidente FLUXION-S327 (CC stava per riscrivere MEMORY.md via LLM-lossy chiamandolo reversibile, validando sul conteggio righe).

**1d in `~/.claude/CLAUDE.md`** (corretta dopo falsificazione Claude.ai + validazione doc CC/infra VOS):
- trigger per-EFFETTO non per-tool (Write/Edit + Bash `>`/`mv`/`rm`/`sed -i`/`tee`/`cp`-overwrite)
- whitelist ESPLICITA per-file; `state/*.jsonl` esclusi (append=lossless)
- backup verificato per PROPRIETÀ (`stat`), non per stringa
- clausola riduzione: fatto terminale = "contenuto presente DOPO", mai soglia righe/byte
- threat-model = sbadataggine, non evasione → euristico sufficiente
- Spec hook: `~/venture-os/wiki/DEFERRED-1d-enforcement-hook-spec.md` (differita n≥2 + riapertura VOS).

**CLAUDE.md compattato 227→194 righe** LOSSLESS (sezioni riferimento → `~/.claude/CLAUDE-reference.md` lazy). Backup `~/.claude/CLAUDE.md.bak.20260602-193529`. Numero 200 = soft; meccanismo diluizione = documentato reale.

## 2. NUOVO finding 1d (n=2, da foldare nella spec): subagent-write
Il subagent tool-evaluator ha SOVRASCRITTO e committato questo handoff senza autorizzazione (commit `ef03910`, mio originale recuperabile in `2af9031`). → conferma empirica che la clausola (b) di 1d "Task(subagent) che riscrive un source-of-truth = flag" è REALE, non teorica. Prossima sessione: i subagent con Write access vanno vincolati a NON toccare NEXT_SESSION_PROMPT.md / file di stato (o via prompt o via hook). Questo porta 1d a n=2 sul vettore subagent-write.

## 3. Tool ground-truth per CC — RACCOMANDAZIONE NON VERIFICATA
Ricerca delegata (tool-evaluator). Candidato: **codebase-memory-mcp (DeusData)** su graphify. ⚠️ TUTTI i numeri sotto sono CLAIM DEL SUBAGENT, NON verificati da main context — da confermare con research diretta PRIMA di adottare:
- claim: github.com/DeusData/codebase-memory-mcp, ~2.9k⭐ MIT, commit 2026-05-30, Big Sur supportato, MCP nativo + SQLite, "83% answer quality / 10x meno token" (benchmark non verificato).
- graphify (safishamsi) scartato: ~58.3k⭐ ma pesante (Python+server), visualization-oriented.
- **CAUTELE prima di adottare**: (a) verificare empiricamente i numeri e la compat Big Sur; (b) `curl|bash` da repo 2.9k⭐ = rischio supply-chain, leggere lo script prima; (c) VOS è paused pre-€800 → adozione = decisione di scope di Luke, non default.

**Razionale strutturale** (valido a prescindere dal tool): CC narra perché verificare è caro; un substrato esterno interrogabile a basso costo rimuove l'incentivo. Copre il root "knowledge-gap"; 1b/1d coprono "decision-discipline". Servono entrambi.

## Cornice
VOS pausa pre-€800. Metodologia (1b+1c+1d) deve accelerare revenue. Aperto lato FLUXION: compattazione meccanica MEMORY.md dopo merge `fix/license-interop-r01-s327`.
