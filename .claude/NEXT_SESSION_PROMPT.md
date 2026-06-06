# Resume VOS — fabbrica generalista (chiuso 2026-06-06, context 61% vincolo #7)

Dettaglio completo in `.claude/NEXT_SESSION_PROMPT.manual.md`. Qui il delta di oggi.

## Obiettivo terminale (corretto enfatico da Luke)
Questo terminale COSTRUISCE LA FABBRICA GENERALISTA in sé. ARGOS/FLUXION indipendenti, mai il metro revenue-venture qui, mai redirigere a ARGOS ops. Una fabbrica non si avvia a pezzi (ToC): linea completa + logica che collega le stazioni, poi gira.

## Fatto oggi
- `components/factory-line.md` (v0.1): LINEA COMPLETA — 6 stazioni (mappate su fabbrica auto) + SCOCCA (`venture-dossier.md`, WIP unit S0→S6) + NASTRO (vos-auto-router + gate Stage-Gate) + Componente 0 (canale durevole). Validato §8b (trend-researcher, fonti §10): solo-founder CONFERMATO (Pieter Levels), bottleneck = distribuzione come ASSET DUREVOLE che compone, gate DEVONO essere esterni-binari.
- `components/market-intelligence-engine.md` (v0.1): stazioni 1-2, kill-criteria A-F.
- Second opinion Claude AI ottenuta. Output chiave = PRINCIPIO FIREWALL (tienilo): Luke dà solo `seed_envelope` niche-free → VOS partorisce nicchia/offerta/contatti → ogni gate logga evidenza verificabile da terzi → Luke fa audit di provenienza (nicchia valida sse ricostruibile dai criteri loggati). Né fiducia in Claude AI né in VOS: solo evidenza.

## DECISIONE PRESA (non ridiscutere)
I prompt-stazione + schema `vertical_profile` YAML li scrive CC (orchestratore), NON Claude AI. Motivo: la spec di Claude AI è cablata su componenti ARGOS — CoVe (CLAUDE.md) e AMBRA (verificato: `wiki/projects/ARGOS/AMBRA-AUDIT.md`) → verticalizzano la fabbrica generalista. Si tiene il principio firewall, si butta il cablaggio ARGOS.

## PROSSIMO STEP (ordine per priorità-vincolo ToC)
1. VERIFICA EMPIRICA prima di buildare (vincolo #1): grep cosa esiste davvero in VOS e se è generico o ARGOS — `vos-auto-router` (skill, esiste), `research.py` (esiste? dove? generico?), `vos-childwatch`. NON assumere dai nomi della spec Claude AI.
2. Committa `VOS_RUN_SPEC.md` GENERICO: seed_envelope niche-free + 3 stazioni con worker-ROLE generici (discovery/scoring/outreach), gate esterni-binari, provenienza obbligatoria per audit. Zero nomi ARGOS.
3. Costruisci stazione-VINCOLO per prima: Componente 0 (canale durevole) + stazione 5/outreach. Costruire 1-4 prima = throughput zero (ToC).
4. Template scocca `venture-dossier.md` + cablaggio nastro vos-auto-router sulle stazioni.
5. Prima corsa end-to-end di una scocca S0→S6 su nicchia NUOVA (VOS la partorisce dal seed_envelope, Luke NON la sceglie — altrimenti il test è sporco).
- Delega: build multi-step → Task backend-architect/rapid-prototyper (REGOLA #0). Non lucidare stazioni 1-2.
