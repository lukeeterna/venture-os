# PIANO — Fabbrica Sicura (Livello-4) · error-containment basato su MAST (NeurIPS 2025)

> Tipo: architettura L4 del VOS. Principio: NON "agenti infallibili" (i dati lo escludono) ma
> ZERO ERRORI-SFUGGITI — ogni errore catturato da un gate prima di produzione/soldi.
> Fonte empirica: MAST/MASFT (Cemri et al., NeurIPS 2025, 1600+ tracce, 7 framework): fallimento
> 41-86.7% in produzione; specifica+coordinamento = 79% dei crash, verifica = 21%; i miglioramenti
> del modello base NON bastano (problema architetturale). Council Mode 2026: supervisione incrociata
> -35.9% rel. allucinazioni — riduce molto, NON a zero. -> contenimento per progettazione.

## I 3 punti di fallimento MAST -> i 3 contenimenti
1. Specifica/design (42%) -> CONTRATTO DI STADIO: ogni agente ha ruolo/input/output/vincoli/UN
   criterio di successo (fatto terminale). Nessuna azione fuori contratto. (= Rule 1b + MANDATO)
2. Coordinamento (37%) -> MASTER con autorita + anti-loop (stop_hook_active+counter, gia in
   production_claim_gate) + stato su file (STATE.md, non contesto che drifta) + un solo decisore.
3. Verifica + cascata (21%) -> GATE A FATTO TERMINALE ESTERNO, mai "agenti d'accordo" (condividono
   punti ciechi). Verifica = strumento (test verde/build/scan/exit code). Anti-cascata: l'output di
   uno stadio NON diventa input del successivo finche il suo fatto terminale non e verde.

## Regole trasversali
- NON multi-agent dove il singolo fa meglio (MAST: spesso single-agent batte multi). Decomponi solo
  dove serve davvero. (P2/Simplicity, col dato dietro.)
- MISURA il tasso di ERRORI-SFUGGITI (errori che passano tutti i gate -> produzione/soldi). E il
  numero che decide se il gate umano resta.
- GATE UMANO (G-APPROVAL) ai confini irreversibili/soldi, finche errori-sfuggiti ~ 0 su task reali.
  Ipotesi falsificabile, non dogma.
- USABILITA (primo livello): superficie non-dev (idea -> approvi gate -> stato -> KPI), CLI o web
  deciso sui dati di F2, mai "lancia prompt a mano".

## Roadmap (ogni fase un fatto terminale, una unita per volta)
- F2: audit orchestrazione esistente mappata contro i 3 punti MAST + decisione CLI vs web.
- F3: contratti di stadio + criterio della prima fetta verticale.
- F4: costruzione fetta, uno stadio alla volta, ognuno gated da fatto terminale esterno.
- F5: go-to-market solo dopo che F4 regge.
