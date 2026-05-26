# Prompt Claude.ai — Production-Readiness 2026 ARGOS+FLUXION (research mandatory)

**Context**: founder solo (Luke), 3 progetti tech attivi, vincolo budget €240/mese
Claude Code + soglia hard €30/mese LLM costs tracciati. MacBook Big Sur 11.7.10 +
iMac 2012. Obiettivo immediato: portare ARGOS e FLUXION in produzione enterprise-grade
zero-cost. Stack documentato sotto.

---

## STATO EMPIRICO (verificato 2026-05-26)

### ARGOS — Scout vehicle B2B Italian dealers
- **Tipo prodotto**: SaaS scraping vehicle listings DE/BE/NL/AT per micro-dealer
  italiani commissione P.IVA forfettaria (servizio brand+scouting+import+docs)
- **Stack**: Python + SQLite + Playwright + WhatsApp HITL gate
- **DB reale**: 18 dealers, 41 market_listings, **0 market_price_changes**
- **Pipeline sessioni recenti**: S185→S194 (10 sessioni 7gg, alta velocità)
- **Bloccanti correnti**:
  1. `market_price_changes=0` ripetuto 1gg = scraper NON gira (bot detection?
     WA daemon duplicate bug noto? cron failed?)
  2. S194 deploy iMac + AMBRA stress + E2E fisico richiede TEST_FOUNDER (Luke)
  3. Pattern context saturation ricorrente (S192 100%, S193 77% close)
- **Asset positivi**: sanitizer sentinel + HITL classifier + audit-driven fix appena
  shipped (S192-S193). Codice qualità migliorata.
- **Revenue gate**: vincolo founder S173 = ARGOS deve generare primo €800 prima
  di sbloccare risorse altri progetti.

### FLUXION — Gestionale desktop SMB + Voice Agent
- **Tipo prodotto**: Tauri + React + Rust desktop app per SMB italiani 9 verticali
  (saloni, medical, palestre, etc), prezzo €497 one-time, Voice Agent AI (Sara: STT
  Whisper / NLU Groq / TTS Piper)
- **Stack**: Tauri 2 + React + Rust + Python (voice-agent) + Cloudflare Workers
  (license proxy) + Stripe + Brevo (email delivery) + D1 + KV
- **DB reale**: 10 clienti test, 7 servizi, 5 operatori
- **Pipeline sessioni recenti**: S293→S297 (5 sessioni 7gg), FDQ-01 + FSAF-05 smoke PASS
- **Cloudflare proxy stato**: `fluxion-proxy-test.gianlucanewtech.workers.dev/health`
  → 200 OK, version 1.0.0
- **Bloccanti correnti**:
  1. Brevo SMTP key mismatch (S298 pending switch a HTTP API)
  2. Ed25519 keypair kid v1 BURNED in S290 (/tmp/ flush), serve regen kid v2
  3. Tauri activate-by-payload pattern da implementare (deep linking sicuro)
  4. Production gate META-VINCOLO da formalizzare
- **Asset positivi**: license-on-page primary + recovery HMAC zero-cost delivery
  funzionante (path validato da claude.ai S294 GO). Proxy worker stabile.

### Cross-cutting infrastrutturale
- VOS layer Python su T7 USB con LaunchAgent macOS: host-monitor, task-fit-monitor,
  tool-scout, routing-refresh, morning-brief, claude-memory-backup, disk-keeper
- Hook architecture Claude Code: pre/post tool gates + context budget + violation gate
- Costi LLM tracker `state/costs.jsonl` (target <€30/mese)
- HW MacBook Big Sur 11.7.10 (no upgrade) + iMac 2012 server (no AVX2, SSH stateless)

---

## ESIGENZE (in ordine di urgenza founder)

1. **Production-readiness ARGOS** — sbloccare market_price_changes=0 (scraper resilience
   bot detection) + deploy AMBRA stress proven pattern + monitoring autonomous revenue
   path (alert su zero scrape eventi >X ore)
2. **Production-readiness FLUXION** — Ed25519 key management enterprise serverless
   (Cloudflare Workers) + Brevo HTTP API autonomous + Tauri activate-by-payload secure
   deep linking + replay protection webhook
3. **Enterprise grade**: security audit autonomous + performance profiling zero-cost +
   code quality gate continuous + secret management standard (no /tmp/, no plaintext)
4. **Features novità 2026**: tecnologie rilasciate ultimi 6 mesi che impattano direttamente
   i due progetti (es. Cloudflare Workers feature release 2026, Tauri 2.x security
   release, Stripe webhook signing 2026, browser automation stealth 2026)

## MANDATO RESEARCH

**Hai accesso web search**. Per ogni raccomandazione devi citare:
- Almeno 1 URL ufficiale vendor doc 2026 o 2025-Q4
- Versione esatta del tool/lib raccomandato (no "latest", numero versione)
- Pricing tier free verified (sì/no su free-tier copre il caso)
- Compatibilità verificata: Python 3.13 + macOS Big Sur 11.7.10 + Cloudflare Workers
  + Tauri 2.x + Rust stable
- Maturity signal: GitHub stars + last commit date + open issues count

**Vietato**:
- Raccomandazioni basate su training data senza verifica live web
- "Could work" / "potrebbe funzionare": serve evidence di funzionamento
- Stack non-Big-Sur-compatible (es. richiede macOS 12+, no go)
- Soluzioni paid quando esiste free-tier equivalente (vincolo budget)

## OUTPUT RICHIESTO (formato rigido)

### Sezione 1 — TOP-3 raccomandazioni implementabili immediate (ROI alto)
Per ciascuna:
- **Nome**: tool/pattern/feature
- **Progetto**: ARGOS | FLUXION | BOTH
- **Problema risolto**: 1 riga
- **Implementazione effort**: ore stimate (founder + CC autonomous)
- **Verification URL**: link doc/release ufficiale
- **Free-tier verified**: yes/no + condizioni
- **Compatibility check**: Big Sur/Python 3.13/altre dependencies
- **Rischio top 1**: cosa può rompere

### Sezione 2 — TOP-2 deferred (ROI alto ma effort >8h)
Stesso schema.

### Sezione 3 — Novità 2026 da MONITORARE (non agire ora)
Tool/feature interessanti ma non ancora maturi o non immediatamente applicabili.
Max 5 voci 1 riga ciascuna.

### Sezione 4 — Anti-pattern da EVITARE
Cose che potrei essere tentato di fare ma claude.ai sconsiglia con dati.
Max 3 voci con motivazione.

### Sezione 5 — Verdict singolo (vincolo founder: NO liste decisionali)
Una sola frase: "Implementa per prima cosa X, perché Y, evidence Z."

---

## CONSTRAINT FOUNDER (rispettare nel design)

- Single-founder operativo, no team
- Time budget founder: ~4-6h/giorno coding+review
- Time budget CC autonomous: ~16h/giorno effettivi (sessioni multiple)
- Free-tier first sempre. Paid solo se ROI clear vs free + revenue evidence
- Big Sur 11.7.10 hardware vincolo: no upgrade macOS
- Italiano nelle comunicazioni founder, inglese solo tecnico

## DATA SOURCES disponibili (puoi citarli)

- ARGOS git log: 10 commit ultimi 7gg disponibili (sanitizer, HITL, AMBRA)
- FLUXION git log: 5 commit S293-S297 disponibili (proxy worker, license delivery)
- VOS state: host-monitor, task-fit-monitor, costs.jsonl
- VOS audit deviations: ~/venture-os/state/blueprint-deviations.jsonl (8 entries oggi)

---

**Rispondi rispettando l'output schema. Lunghezza target: 1500-2500 parole. Niente
preamboli, vai diretto a Sezione 1.**
