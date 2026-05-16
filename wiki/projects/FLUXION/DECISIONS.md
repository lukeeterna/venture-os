# FLUXION — DECISIONS.md

> Architecture Decision Records lean (5-field schema). Append-only.
> Mai cancellare entry SUPERSEDED — sostituirne lo Status e linkare alla nuova D-NN.
> Cross-reference ARGOS DECISIONS.md per decisioni cross-progetto (es. D-29 WA numero condiviso).
>
> **Schema entry**:
> ```
> ## D-NN — Titolo (YYYY-MM-DD, sessione)
> **Status**: OPEN | DECIDED | SUPERSEDED-by-D-MM
> **Contesto**: 2-3 righe
> **Opzioni considerate**: 2-4 bullet
> **Decisione**: 1-2 righe + chi
> **Conseguenze**: 2-4 bullet operativi
> ```

---

## D-01 — Prodotto = gestionale desktop SMB con Voice Agent AI Sara (2026-05-15, S171-VOS-coord)

**Status**: DECIDED (founder S171 raw "FLUXION è un GESTIONALE con SEGRETARIA AI", confermato via PRD-FLUXION-COMPLETE-v3.md riga 11)
**Contesto**: VOS S171 ha rilevato errore documentazione propagato in CLAUDE.md user-level riga 94 ("9 verticali video marketing") che ha causato confusione cross-sessione su cos'è FLUXION. Founder ha corretto esplicitamente.
**Decisione**:
- FLUXION = gestionale desktop enterprise per PMI italiane con Voice Agent AI integrata (Sara)
- Stack: Tauri + React + Rust + Python + MCP. Voice pipeline: VAD Silero → STT Whisper → NLU Groq → TTS Piper
- Agent Orchestrator MCP-CoVe: Voice / Booking / FAQ / Analytics agents
- Sara = segretaria AI che risponde telefono clienti SMB, prenotazioni, FAQ
- 9 verticali settori SMB (NON 9 verticali video marketing): saloni, medical, palestre, auto, odonto, vet, servizi, immobiliare, assicurazioni
- Pricing: €497 one-time. Tier €297 BASE = NON ESISTE (mai esistito, riferimenti PRD da rimuovere)
- Skill `fluxion-video-creator` = produce video MARKETING per VENDERE FLUXION (uso interno marketing), NON è il prodotto
**Conseguenze**:
- PRD canonical: `/Volumes/MontereyT7/FLUXION/PRD-FLUXION-COMPLETE-v3.md`
- P0 S241 = cleanup PRD da riferimenti tier €297 inesistente (~30min, NON 4h migration logic)
- F3 landing per-verticale = 9 pagine Cloudflare Pages (free tier), skill `fluxion-landing-generator`
- F4 video demo = video Sara in azione per ogni verticale (es. salone: Sara prende appuntamento taglio capelli via telefono), skill `fluxion-video-creator`
- F5 promo lancio = "primi 100 clienti = 1° mese gratis" in outreach P5 (NON 6 clienti beta privata)
- Memoria VOS aggiornata: `project_fluxion_real_product.md`
**Ref**: PRD-FLUXION-COMPLETE-v3.md, CLAUDE.md user-level riga 94 (corretta S171), memoria `project_fluxion_real_product.md`, blueprint-deviation S171-VOS-coord

---

## D-02 — WA numero zero-cost pre-revenue (3314928901 condiviso ARGOS+FLUXION) (2026-05-15, S171-VOS-coord)

**Status**: DECIDED (founder S171 raw "per ora nessun costo ulteriore senza revenue", vincolo #5 zero-cost rigoroso)
**Contesto**: P5 sales agent FLUXION (Erica Fluxion) richiede numero WA. Conflitto cross-progetto rilevato VOS: 3314928901 era previsto sia ARGOS (Luca Ferretti) sia FLUXION (Erica Fluxion). Cross-reference D-29 ARGOS DECISIONS.md.
**Decisione**:
- 3314928901 = numero condiviso pre-revenue per FLUXION P5 test simulato + FLUXION beta 100 clienti (promo 1° mese gratis)
- Profilo WA 3314928901: foto neutra, no nome brand visibile, bio generica (cross-progetto con ARGOS)
- Persona Erica Fluxion = solo nel corpo messaggi testuali, mai nel profilo numero
- Finestre temporali separate: ARGOS e FLUXION non testano contemporaneamente contatti reali
- Switch a Twilio +39 dedicato "Erica Fluxion" SOLO post-1°-cliente-pagante (€497 one-time)
**Conseguenze**:
- P5 outreach FLUXION beta 100 clienti procede su 3314928901
- BLOCKER WA daemon duplicate sends (cross-progetto ARGOS Open Q #12) DEVE essere risolto prima outreach reale: se FLUXION codebase riusa wa-daemon ARGOS, bug colpisce entrambi
- Costo €0 fino a primo cliente pagante
**Ref**: ARGOS DECISIONS.md D-29 (cross-progetto), CLAUDE.md vincolo #5

---

## D-03 — Rapporto Ehiweb = contatto aperto no reseller (2026-05-15, S171-VOS-coord)

**Status**: DECIDED (founder S171 "al momento no, ho già parlato con Ehiweb del progetto")
**Contesto**: P1 onboarding cliente FLUXION richiede credenziali Ehiweb (provider VoIP per Voice Agent Sara). Founder ha relazione commerciale aperta MA non reseller/affiliate formale.
**Decisione**:
- Wizard onboarding step-by-step in app FLUXION: cliente copia-incolla credenziali Ehiweb post-trial
- Step opzionale "contatta Ehiweb per tariffa custom progetto FLUXION" con WA/email pre-compilato (sfrutta relazione aperta founder)
- NO dipendenza commerciale firmata Ehiweb (zero-cost vincolo #5)
- Tariffa Ehiweb cliente = TBD (founder chiederà a Ehiweb post-P1, dato che ha contatto aperto)
**Conseguenze**:
- P1 design wizard = friction medium (cliente attiva Ehiweb da sé) ma zero dipendenza
- Possibile upgrade futuro a reseller se Ehiweb propone deal post-trazione FLUXION (trigger: >10 clienti FLUXION attivi)
**Ref**: founder S171 raw, no contratto formale Ehiweb

---

## D-04 — Verticali reali = 8 macro x 50 micro (riconciliazione count) (2026-05-16, S248)

**Status**: DECIDED (verifica fattuale codice `src/types/setup.ts` `MICRO_CATEGORIE` S248)
**Contesto**: D-01 menziona "9 verticali settori SMB" come riferimento di alto livello. Codice reale `src/types/setup.ts` espone 8 macro (medico, beauty, hair, auto, wellness, professionale, pet, formazione) e 50 micro-categorie. CLAUDE.md progetto riga 263 diceva erroneamente "6 macro x 17 sotto-verticali". Task S248 D3 ha richiesto riconciliazione doc.
**Opzioni considerate**:
- Superseding D-01 (eccessivo: D-01 corretta sostanza prodotto)
- Edit inline D-01 (vietato: append-only)
- Nuova entry D-04 riconciliante (scelta)
**Decisione**:
- Source of truth count verticali = codice `src/types/setup.ts` (`MACRO_CATEGORIE` + `MICRO_CATEGORIE`)
- Numero macro: **8** (medico, beauty, hair, auto, wellness, professionale, pet, formazione)
- Numero micro totale: **50** (medico 10 + beauty 7 + hair 6 + auto 7 + wellness 6 + professionale 5 + pet 4 + formazione 5)
- D-01 conserva valore storico ("9 settori" era riferimento commerciale alto livello pre-codice maturo)
**Conseguenze**:
- CLAUDE.md progetto riga 263 aggiornato a "8 macro x 50 micro-verticali" (commit S248)
- PRD-FLUXION-COMPLETE.md riga 151 aggiornato (commit S248)
- Open question #4 "Landing per-verticale 9 settori" → ridenominare implicitamente: produzione landing per macro+micro principali (non vincolato a 9)
- Skill `fluxion-landing-generator` deve leggere `MICRO_CATEGORIE` runtime, non hardcoded
**Ref**: codice `src/types/setup.ts`, S248 plan `.claude/NEXT_SESSION_PROMPT.manual.md` Task 1

---

## D-05 — Ephemeral port allocation HTTP Bridge + Voice Pipeline (no hardcode 3001/3002) (2026-05-16, S254)

**Status**: DECIDED (CTO-driven post bug discovery S254, vincolo enterprise-grade FLUXION CLAUDE.md guardrail #2)
**Contesto**: Audit S254 ha rilevato `src-tauri/src/http_bridge.rs:149` `bind("127.0.0.1:3001")` hardcoded + `voice-agent/main.py:347,1058,1358` default `3002` (parzialmente mitigato da `--port` CLI). Preflight check `commands/preflight.rs:286-288` rileva collision ma è informativo non risolvente. Su `AddrInUse` l'errore in `lib.rs:709` è swallowed → app parte ma Sara muta, MCP rotto, Voice Agent feature morti. Conflitti reali documentati: Skype Classic, Docker Desktop, Rails dev server (porta 3000-3001), IIS Express, AirPlay sotto certe config.
**Opzioni considerate**:
- A. Range scan fallback (3001→3011→3021... 10 tentativi) — quick fix ~2-3h, meno robusto
- B. Ephemeral port (`bind 127.0.0.1:0`) + service discovery via `$APP_DATA/runtime.json` + Tauri command `get_bridge_port()` — pattern Slack/Discord/Cursor/Zoom, ~6-8h refactor cross-component
- C. Status quo (preflight informativo, cliente PMI si arrangia) — rotto, refund-driver
**Decisione**: **B (Ephemeral)** — pattern industriale per app desktop con sidecar HTTP. Frontend `invoke('get_bridge_port')` invece di hardcode. Voice Pipeline lanciata con env `FLUXION_BRIDGE_PORT=N`. MCP server legge `runtime.json`. Stesso pattern per voice 3002. Owner: backend-architect + frontend-developer + voice-engineer (sessione dedicata pre-launch).
**Conseguenze**:
- P0 pre-launch: nessuna distribuzione public finché D-05 non implementato (rischio reputation Capterra/G2 "non funziona post-install")
- Effort stimato ~6-8h FILE CRITICI cross-component → sessione dedicata mente fresca <40% context (rule context-budget-gate)
- Aggiunto a sprint S184-S188 backlog come P0.5 (tra P1 Ehiweb e P2 Win MSI)
- Backward compat: legacy `--port` CLI voice-agent mantenuto, ephemeral è default
- Test E2E obbligatorio: simulare conflict (avviare server dummy su 3001 PRIMA di app) → app deve trovare porta alternativa e funzionare end-to-end
**Ref**: bug discovery S254, `http_bridge.rs:149`, `preflight.rs:286-288`, `voice-agent/main.py:347`, CLAUDE.md FLUXION guardrail #2 "ENTERPRISE GRADE"

---

## D-06 — Modulo Magazzino con sottoscorta + popup riordino per verticali product-heavy (2026-05-16, S254)

**Status**: OPEN (founder input S254 raw: "gestione magazzino per le PMI che necessitano... parrucchiere colori infinite texture per riordino si rende conto quando finisce, estetista identico... popup di riordino quando prodotti vanno in sottoscorta")
**Contesto**: FLUXION attualmente non ha modulo magazzino/inventory. Founder ha identificato gap per verticali product-heavy (hair, beauty in primis) dove il professionista usa prodotti consumabili (colori parrucchiere con N texture/marche, creme estetista, smalti, maschere). Pain point: si accorgono di aver finito solo davanti al cliente. Bisogno: tracking giacenza + alert sottoscorta + popup riordino contestuale.
**Opzioni considerate**: TBD post-research
- A. Modulo magazzino full-fledged (catalogo prodotti, fornitori, ordini, ricezione, scarico per servizio) — scope grande, sovrapposto a P2 suppliers S254
- B. Modulo "lite" inventory-only (giacenza + alert sottoscorta + popup riordino manuale via WA fornitore) — scope contenuto, integrabile con `suppliers` esistente
- C. Solo alert checklist semplice (founder inserisce manualmente lista prodotti + soglie + reminder calendario) — minimal viable
- D. Verticale-specific (attivabile solo per verticali product-heavy, off per medico/professionale/formazione che non hanno consumabili)
**Decisione**: PENDING — richiede research vertical-researcher + ux-researcher prima di plan.
**Research questions (per S256+ dedicata)**:
1. Quali dei 50 micro-verticali hanno bisogno REALE di magazzino? (hair: tutti; beauty: estetista/depilatoria sì, makeup-artist forse; medico: dentista/podologo materiale consumabile sì, psicologo no; auto: officine pneumatici/ricambi sì, autolavaggio no; pet: toelettatura sì, vet sì; wellness: massaggi oli sì, yoga no; professionale: probabilmente no; formazione: no)
2. Granularità prodotto: SKU semplice (nome + quantità) o variant matrix (es. colore parrucchiere = brand × tonalità × volume)?
3. Decremento giacenza: manuale (operatore scarica post-servizio) o automatico (link servizio→prodotti consumati con quantità default)?
4. Trigger popup riordino: soglia fissa, soglia % rispetto stock iniziale, predizione consumo (cliente avg/mese)?
5. Integrazione fornitori: lookup `suppliers` table + WA template "Ordine prodotti X Y Z" pre-compilato + send via WhatsApp service?
6. Competitor benchmark: Treatwell, Fresha, Mindbody, Vagaro hanno magazzino? Come? (gold standard 2026)
**Conseguenze attese**:
- Nuova table `prodotti` (id, nome, sku, fornitore_id FK suppliers, giacenza_attuale, soglia_sottoscorta, unita_misura)
- Nuova table `movimenti_magazzino` (id, prodotto_id, tipo enum carico/scarico/rettifica, quantita, servizio_id FK nullable, operatore_id FK, data)
- Nuova UI page `/magazzino` (filtri per categoria, alert sottoscorta evidenziato)
- Hook frontend `use-magazzino.ts` + popup contestuale `MagazzinoSottoscortaAlert.tsx` (trigger su login + dopo scarico servizio)
- Possibile estensione P2 suppliers (S254 Cat 3) per includere PII encryption sui nuovi `prodotti` (probabile NO, prodotti non sono PII)
- Vertical-scoped: attivabile/disattivabile per verticale tramite `setup.ts` MICRO_CATEGORIE flag `has_inventory: true`
**Trigger ripresa**: post launch base (Cat 3 chiusi + Step E + P1 operatori + P2 suppliers + D-05 ephemeral port). Sessione dedicata `vertical-researcher` agent + `ux-researcher` agent per discriminare A/B/C/D + roadmap dettagliata.
**Ref**: founder raw S254 messaggio chat, gap competitor `vertical-researcher` agent S139 routing

---

# Indice cronologico

| # | Titolo | Status | Data | Sessione |
|---|--------|--------|------|----------|
| D-01 | Prodotto = gestionale SMB con Voice Agent AI Sara | DECIDED | 2026-05-15 | S171-VOS-coord |
| D-02 | WA 3314928901 condiviso pre-revenue; Twilio post-1°-cliente | DECIDED | 2026-05-15 | S171-VOS-coord |
| D-03 | Ehiweb = contatto aperto no reseller; wizard onboarding self-serve | DECIDED | 2026-05-15 | S171-VOS-coord |
| D-04 | Verticali reali = 8 macro x 50 micro (riconciliazione count vs D-01) | DECIDED | 2026-05-16 | S248 |
| D-05 | Ephemeral port HTTP Bridge + Voice Pipeline (no hardcode 3001/3002) | DECIDED | 2026-05-16 | S254 |
| D-06 | Modulo Magazzino con sottoscorta + popup riordino per verticali product-heavy | OPEN | 2026-05-16 | S254 |

**Totale**: 5 entry DECIDED + 1 OPEN. File iniziato S171-VOS-coord post-correzione errore documentazione "video marketing" propagato CLAUDE.md user.

---

# Open questions / Risks

1. **Tier €297 BASE riferimenti residui nel codebase**: P0 S241 deve grep `/Volumes/MontereyT7/FLUXION/` per "€297" e "BASE" e rimuovere. Owner: terminal FLUXION operations.
2. **WA daemon duplicate sends — cross-progetto DISCONFERMATO (verifica S171-VOS-coord)**: FLUXION usa `whatsapp-web.js` (package.json:88), ARGOS usa Baileys (D-22). Stack diversi → bug ARGOS Open Q #12 (Baileys retry no idempotency / poll 30s race) NON automaticamente trasferibile a FLUXION. MA: pattern (missing UNIQUE constraint schema, race condition send pipeline) può ricorrere anche con stack diverso. Trigger pre-outreach reale P5: audit `scripts/whatsapp-service.cjs` + `src-tauri/src/commands/whatsapp.rs` per UNIQUE constraint + idempotency key prima beta 100 clienti.
3. **Tariffa Ehiweb cliente €/mese**: TBD, founder chiederà a Ehiweb. Serve per UI pricing onesto wizard onboarding.
4. **Landing per-verticale 9 settori**: produzione tramite skill `fluxion-landing-generator`. Trigger: post P0+P1 working.
5. **Video demo Sara per verticale**: produzione tramite skill `fluxion-video-creator`. 1 settore alla volta. Trigger: post P5 outreach iniziato.
6. **Switch Twilio post-1°-revenue**: monitorare arrivo primo bonifico €497. Trigger acquisto numero dedicato + setup persona "Erica Fluxion" su profilo WA Twilio.
7. **D-05 implementazione (P0 pre-launch)**: ephemeral port HTTP Bridge + Voice Pipeline. Owner: backend-architect + frontend-developer + voice-engineer. Effort ~6-8h sessione dedicata. Trigger: prima sessione post-S254 con context <40% baseline.
8. **D-06 research (modulo magazzino)**: spawn `vertical-researcher` + `ux-researcher` agents per discriminare opzioni A/B/C/D + identificare verticali target + competitor benchmark Fresha/Treatwell/Mindbody/Vagaro. Trigger: post Cat 3 close + D-05 done.
9. **SetupWizard tier "trial" contraddice modello commerciale (S254 founder discovery)**: `SetupWizard.tsx:411-470` Step 5 offre tier "trial" come default, attivando trial 30gg dell'intera FLUXION → contraddice D-01 + architecture-distribution.md ("MAI download gratuito", trial solo per Sara nella Base). Decisione TBD: rimuovere tier "trial" da production build OPPURE limitare a dev mode (env flag) OPPURE riformulare come "demo locale 7gg con dati fittizi auto-cleanup". Owner: backend-architect + frontend-developer + brand-guardian. P0 pre-launch.
10. **PEC opzionale in wizard rompe FatturaPA day-1 (S254 founder discovery)**: `SetupWizard.tsx:316-322` Step 2 campo `pec` skippable. Per verticali medico/professionale (B2B/sanitario) PEC è obbligatoria per fatturazione elettronica. Decisione TBD: rendere PEC obbligatoria solo per macro=medico+professionale OPPURE alternativa "codice SDI 7 caratteri" se PEC non disponibile. Owner: fatture-specialist + ui-designer. P0 pre-launch.
11. **License key opzionale = security bypass (S254 founder discovery)**: `SetupWizard.tsx:457-469` Step 5 campo "Chiave Licenza FLUXION (opzionale)" + "Puoi attivare successivamente" → cliente legittimo che ha pagato €497 potrebbe by-passare attivazione e usare tier "trial" indefinitamente. License enforcement bypass. Decisione TBD: rendere chiave obbligatoria se tier ≠ "trial" OPPURE forzare downgrade a "trial" se chiave mancante con countdown 30gg visibile OPPURE block setup completion senza chiave. Owner: license-manager + frontend-developer. P0 pre-launch (security-critical).
12. **VoIP Sara "opzionale + 30gg gratis" misleading (S254 founder discovery)**: SetupWizard mostra VoIP Sara come opzionale con "30 giorni gratis" — falso. Realtà (D-03): VoIP è pagato dal CLIENTE direttamente al provider (Ehiweb). FLUXION fornisce solo wizard "4 passi attivazione Ehiweb" che NON FUNZIONA ancora. Decisione TBD: rimuovere claim "30gg gratis" + completare wizard Ehiweb 4 passi + chiarire "VoIP a carico cliente, tariffa Ehiweb da contattare provider". Owner: voice-engineer + ui-designer + content-creator. P0 pre-launch.
13. **CF Worker proxy unreachable post-wizard (S254 founder discovery)**: messaggio "Server FLUXION non risponde — DNS aziendale/firewall/manutenzione, Sara passa a Piper". Da indagare: è issue temporanea Cloudflare? `fluxion-proxy.gianlucanewtech.workers.dev` healthcheck failing? Worker scale-to-zero cold start? Fallback Piper funziona = OK ma UX fa pensare "prodotto rotto". Owner: cloudflare-engineer + infrastructure-maintainer. P1 pre-launch (cosmetic + UX).
