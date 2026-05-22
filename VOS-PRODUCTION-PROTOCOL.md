# VOS-PRODUCTION-PROTOCOL.md

> **Documento costituzionale operativo per VOS.**
> Da posizionare in `~/venture-os/VOS-PRODUCTION-PROTOCOL.md` e referenziato da `~/.claude/CLAUDE.md` (root) con `@~/venture-os/VOS-PRODUCTION-PROTOCOL.md` quando cwd = VOS.
> Scopo: VOS metabolizza la definizione REALE di "production-ready", smette di accettare stime da git log, e monitora attivamente i processi child ARGOS / FLUXION contro criteri osservabili.
>
> **Principio #0 di questo documento:** un sistema è production-ready quando una E2E ADVERSARIAL SUITE passa con criteri osservabili da Luke. NON quando un commit dice "GATE verde". NON quando CC dichiara "E2E funzionante". NON quando la roadmap segna una Phase done. Solo output di test reale, letto da Luke.

---

## PARTE 1 — Il problema che VOS deve correggere (causa-radice)

Storico empirico (180+ sessioni): i processi child entrano in **loop su pre-requisiti percepiti** (es. sanitizer S183, 3 commit in 48h, UAT NO-GO ricorrente) perché **nessun task ha una definizione di "done" osservabile**. Un task senza criterio di completamento misurabile è un loop per costruzione: CC trova sempre un caso che fallisce e ricomincia.

Il secondo errore strutturale: **stime "distance-to-revenue" calcolate da git log + ROADMAP**, non da pipeline funzionante. CC ha confessato (22/5): *"la pipeline completa con sales agent ATTIVO non è mai stata validata su nessun numero test, e FLUXION non ha mai chiuso un sale di prova nemmeno in TEST mode."* Tutte le stime in giorni precedenti erano speculazione.

**VOS d'ora in poi rifiuta due categorie di output dai child:**
1. Stime in giorni-a-revenue non ancorate a una E2E run reale → BLOCK
2. Dichiarazioni "ready / done / funzionante" senza output di test allegato → BLOCK

---

## PARTE 2 — Definizione operativa di PRODUCTION-READY

Un processo child è production-ready quando, e solo quando, **tutti** questi sono veri:

1. **CHAIN-MAP completa**: ogni anello della catena revenue è classificato ✅ VERIFICATO (non ⚠️/❌).
2. **SAFETY SUITE = 100% pass**: i test dove un errore causa danno irreversibile (messaggio non autorizzato a dealer, pagamento errato) passano tutti. Zero tolleranza.
3. **DATA-QUALITY SUITE sopra soglia**: i test di correttezza output passano sopra la soglia decisa da Luke (default proposto: ≥ 90% confusion-matrix accuracy).
4. **UNA E2E RUN REALE osservata da Luke**: la catena gira dall'inizio alla fine una volta, su input reale (numero WA founder reale / Stripe test card reale), e Luke vede l'output finale con i propri occhi.

Finché i 4 non sono veri, lo stato è **NON-READY**, e la distance-to-revenue è **indeterminata** (non un numero in giorni).

---

## PARTE 3 — ARGOS: CHAIN-MAP + ADVERSARIAL SUITE

### 3.1 Chain-map (anelli da classificare ✅/⚠️/❌)

| # | Anello | Input → Output | Comando isolato di verifica | Stato |
|---|--------|----------------|------------------------------|-------|
| 1 | scrape annuncio | URL mobile.de → dati veicolo JSON | `python -m argos.scrape <url>` | ⬜ |
| 2 | CoVe scoring | dati → Si score + recommendation | `python -m argos.cove <json>` | ⬜ |
| 3 | dossier PDF | veicolo certificato → file PDF | `python -m argos.dossier <json>` | ⬜ |
| 4 | sanitizer foto | foto raw → foto sanitizzata (targa/seller coperti) | `python -m argos.sanitize <img>` | ⬜ |
| 5 | WA Day-1 send | dossier+dealer → msg inviato a TEST_FOUNDER | `python -m argos.wa_send --test` | ⬜ |
| 6 | ricezione reply | reply WA → messaggio catturato in DB | `python -m argos.wa_inbox` | ⬜ |
| 7 | AMBRA classifier | reply → categoria/intent | `python -m argos.ambra <reply>` | ⬜ |
| 8 | handler risposta | categoria → reply proposta | `python -m argos.handler <intent>` | ⬜ |
| 9 | HITL approval gate | reply proposta → invio SOLO se approvo | `python -m argos.hitl --dry` | ⬜ |

> CC compila la colonna Stato eseguendo OGNI comando e incollando l'output reale. ⬜ → ✅/⚠️/❌. Adatta i nomi modulo ai path reali del progetto.

### 3.2 SAFETY SUITE (100% pass obbligatorio — un errore qui = ban WA / danno legale)

Questi test provano a far inviare messaggi NON autorizzati. Il GATE outreach è bloccato finché non passano tutti.

| Test ID | Scenario avversario | Atteso | Criterio |
|---------|---------------------|--------|----------|
| SAF-01 | Reply rifiutata 10x consecutive | `sent=0` sempre | 10/10 |
| SAF-02 | Kill processo con reply in stato `pending` → riavvio | reply NON parte | nessun invio post-crash |
| SAF-03 | Reply approvata 1x | inviata ESATTAMENTE 1 volta (idempotenza) | no doppio invio |
| SAF-04 | chat_id mismatch (reply dealer A) | NON va al dealer B | accoppiamento msg→destinatario corretto |
| SAF-05 | Reply contiene claim non verificato (Händlergarantie senza VIN, CarFax EU) | bloccata pre-invio | content validation attiva |
| SAF-06 | Race: 2 approvazioni simultanee stessa reply | 1 solo invio | lock/idempotenza |
| SAF-07 | DAILY_LIMIT=30 raggiunto | invio 31 rifiutato | hard limit rispettato |
| SAF-08 | Numero non in whitelist TEST | invio rifiutato | guard su destinatari |

> **Riproduce il bug confessato `reply approvata=0 ma sent=1`.** SAF-01/02/03 sono progettati esattamente per catturarlo. Se uno fallisce, ARGOS NON fa outreach reale. Non negoziabile.

### 3.3 DATA-QUALITY SUITE (soglia decisa da Luke, default ≥ 90%)

Questi test provano a far certificare spazzatura. Misurano l'efficacia reale del CoVe.

| Test ID | Input avversario | Atteso |
|---------|------------------|--------|
| DQ-01 | km incoerente (2019, 8.000 km, ma usura foto = 180k) | CoVe NON certifica / flag anomalia |
| DQ-02 | VIN non corrisponde al modello | VIN_CHECK < 0.60 scatta |
| DQ-03 | annuncio incompleto (no prezzo / no anno) | degrada con grazia, nessun PDF con campi `undefined` |
| DQ-04 | stesso annuncio, 2 run | Si score IDENTICO (determinismo della formula) |
| DQ-05 | formato diverso (autoscout.be vs mobile.de) | parser regge o errore esplicito, non crash |
| DQ-06 | annuncio con km sotto soglia frode (< 4.500/anno KBA) | flag anomalia, non certificato |
| DQ-07 | batch 10 annunci misti (5 buoni, 5 marci) | confusion matrix: certificati i 5 buoni, esclusi i 5 marci |
| DQ-08 | sanitizer su 10 foto reali diverse | targa+seller coperti in 10/10, soggetto auto visibile in 10/10 |

> DQ-07 è il test-principe: l'output è una **confusion matrix** (veri positivi / falsi positivi / veri negativi / falsi negativi). Quella è l'efficacia reale della pipeline, non "il dossier si genera".

---

## PARTE 4 — FLUXION: CHAIN-MAP + ADVERSARIAL SUITE

### 4.1 Prerequisiti che sblocca Luke (credenziali TEST, zero rischio finanziario)

In `~/.zshrc` o `~/.claude/.env`:
```bash
export CF_API_TOKEN="..."                      # account.cloudflare.com/profile/api-tokens
export STRIPE_TEST_SECRET_KEY="sk_test_..."    # dashboard.stripe.com/test/apikeys (TEST, mai live)
export STRIPE_TEST_PUBLISHABLE_KEY="pk_test_..."
export RESEND_TEST_KEY="re_..."                # resend.com/api-keys
```
Senza queste, FLUXION Track B Stripe E2E non parte. È blocco di Luke, non di FLUXION.

### 4.2 Chain-map FLUXION

| # | Anello | Input → Output | Comando isolato | Stato |
|---|--------|----------------|------------------|-------|
| 1 | landing → signup | visita → lead catturato | `npm run test:e2e:signup` | ⬜ |
| 2 | checkout Stripe | lead → PaymentIntent creato | `npm run test:e2e:checkout` | ⬜ |
| 3 | pagamento confermato | card → charge succeeded + webhook | `stripe trigger payment_intent.succeeded` | ⬜ |
| 4 | licenza generata | payment → license key emessa €497 | `npm run test:license` | ⬜ |
| 5 | email consegna | license → email a customer (Resend) | `npm run test:email` | ⬜ |
| 6 | attivazione app | license key → app Tauri sblocca | manuale, app desktop | ⬜ |
| 7 | sales agent WA (Phase 12) | lead → outreach (NON iniziato) | n/a | ❌ noto |

### 4.3 SAFETY SUITE FLUXION (100% pass — un errore = soldi sbagliati / licenza non dovuta)

| Test ID | Scenario | Test card / azione | Atteso |
|---------|----------|--------------------|--------|
| FSAF-01 | Pagamento rifiutato | `4000 0000 0000 0002` (generic_decline) | NESSUNA licenza emessa |
| FSAF-02 | Fondi insufficienti | `4000 0000 0000 9995` (insufficient_funds) | nessuna licenza, errore gestito |
| FSAF-03 | Carta rubata | `4000 0000 0000 9979` (stolen_card) | nessuna licenza, log frode |
| FSAF-04 | 3D Secure richiesto | `4000 0000 0000 3220` | licenza SOLO dopo auth completata |
| FSAF-05 | Webhook duplicato (Stripe re-invia) | `stripe trigger` 2x stesso evento | UNA sola licenza (idempotenza webhook) |
| FSAF-06 | Pagamento OK ma email fallisce | success card + Resend down | licenza salvata, retry email, MAI persa |
| FSAF-07 | Importo manipolato lato client | checkout con amount alterato | server rifiuta, usa prezzo server €497 |
| FSAF-08 | Licenza riusata su 2ª macchina | stessa key, 2 device | policy attivazione applicata |

> Le test card sono valori ufficiali Stripe sandbox (verificati docs.stripe.com, feb 2026). Muovono zero denaro reale. FSAF-05 (idempotenza webhook) è il bug-killer classico: Stripe re-invia i webhook, se non sei idempotente emetti 2 licenze per 1 pagamento.

### 4.4 DATA-QUALITY / FLOW SUITE

| Test ID | Scenario | Atteso |
|---------|----------|--------|
| FDQ-01 | Success card `4242 4242 4242 4242` full flow | licenza emessa + email ricevuta (Resend test inbox) |
| FDQ-02 | Geo EEA (SCA obbligatorio) email `+location_IT` | 3DS flow corretto |
| FDQ-03 | Refund post-pagamento | licenza revocata |
| FDQ-04 | Dispute/chargeback simulato | licenza sospesa + alert |

---

## PARTE 5 — MONITORAGGIO ATTIVO VOS → CHILD (il cuore di VOS)

VOS non è osservatore passivo. Veglia e corregge. Tre meccanismi, tutti file-based, €0, Big Sur compatibili, no daemon.

### 5.1 GATE-STATE FILE per child

Ogni child mantiene `~/venture-os/state/gate-state-<PROJECT>.json` aggiornato a fine di ogni sessione CC:

```json
{
  "project": "ARGOS",
  "updated_at": "2026-05-22T17:00:00Z",
  "chain_map": {
    "1_scrape": "VERIFIED", "2_cove": "VERIFIED", "3_dossier": "VERIFIED",
    "4_sanitizer": "VERIFIED", "5_wa_send": "EXISTS", "6_inbox": "EXISTS",
    "7_ambra": "MISSING", "8_handler": "MISSING", "9_hitl": "EXISTS_BUGGY"
  },
  "safety_suite": { "total": 8, "passed": 0, "last_run": null },
  "data_quality_suite": { "total": 8, "passed": 0, "accuracy": null, "last_run": null },
  "e2e_real_run_observed": false,
  "production_ready": false,
  "blocking_reason": "AMBRA classifier MISSING (7,8), HITL bug SAF-01..03 non testati"
}
```

**VOS calcola `production_ready` da questo file con una regola sola:** tutti gli anelli VERIFIED **AND** safety_suite.passed == total **AND** e2e_real_run_observed == true. Se uno è falso → NON-READY, e VOS rifiuta qualsiasi stima in giorni.

### 5.2 HOOK Stop di VOS-enforcement sui child

`~/.claude/hooks/production_claim_gate.py` (Stop hook): quando l'istanza CC child sta per dichiarare "ready / done / funzionante / production / E2E ok" SENZA che il gate-state-file lo confermi, BLOCCA con messaggio:

```
[VOS BLOCK] Hai dichiarato 'ready/done/E2E funzionante' ma gate-state-ARGOS.json
dice production_ready=false (blocking: <reason>). Vietato dichiarare ready senza:
(1) safety_suite 100% pass con output reale, (2) e2e_real_run osservata da Luke.
Riformula con lo STATO REALE degli anelli, non con una dichiarazione di completamento.
```

### 5.3 BRIEF mattutino VOS — sezione child-watch

Ogni mattina VOS legge i 2 gate-state-file e produce:

```
=== VOS CHILD-WATCH 2026-05-23 ===
ARGOS    [✅✅✅✅⚠️⚠️❌❌⚠️] 4/9 verified | safety 0/8 | E2E real: NO | READY: ❌
         → prossimo anello da chiudere: #5 wa_send (EXISTS→VERIFIED via SAF suite)
         → blocco: AMBRA #7,#8 MISSING. Decisione: implementare o tagliare da Day-1?
FLUXION  [⬜⬜⬜⬜⬜⬜❌] credenziali Luke mancanti → suite non eseguibile
         → azione Luke: export 4 credenziali test (vedi 4.1)

REGOLA VOS: nessuna stima giorni-a-revenue finché safety suite non gira.
Il numero vero NON è 'giorni'. È 'anelli VERIFIED su totale' + 'safety pass su totale'.
```

### 5.4 DEVIATION LOG cross-progetto

`~/venture-os/state/blueprint-deviations.jsonl` registra (già esistente) ogni volta che un child:
- dichiara ready senza test (pattern `premature-ready-claim`)
- stima giorni da git log (pattern `estimate-without-e2e`)
- entra in loop su un anello (≥3 commit/48h stesso file → pattern `single-link-loop`)

Questi sono i pattern S159-class. VOS li conta. Se un pattern si ripete cross-progetto ≥3 volte, VOS lo promuove a regola di blocco hard.

---

## PARTE 6 — SEQUENZA OPERATIVA (cosa fa CC child da ORA)

**STOP ogni lavoro su feature nuove.** Ordine rigido:

### Fase A — MAPPATURA (1 sessione, no codice nuovo)
1. Compila chain-map ARGOS (Parte 3.1) eseguendo ogni comando isolato, output reale.
2. Scrivi `gate-state-ARGOS.json` con stato vero di ogni anello.
3. Identifica l'anello più A MONTE che è ⚠️/❌. Quello è l'unico lavoro successivo.

### Fase B — SAFETY FIRST (priorità assoluta)
4. Scrivi la SAFETY SUITE (Parte 3.2) come pytest eseguibile. NON eseguirla tu — Luke la lancia.
5. Luke lancia, legge output PASS/FAIL grezzo, incolla a Claude.ai per analisi.
6. Fixa finché safety = 8/8. Il bug `sent=1 approvata=0` deve morire qui.

### Fase C — DATA QUALITY
7. Scrivi DATA-QUALITY SUITE (Parte 3.3). Luke sceglie input avversari (non CC).
8. Luke lancia, legge confusion matrix, decide la soglia.

### Fase D — E2E REAL RUN
9. Una run completa scrape→...→HITL su TEST_FOUNDER (numero WA reale di Luke).
10. Luke VEDE il messaggio arrivare sul telefono. `e2e_real_run_observed = true`.

### Fase E — solo ora
11. `production_ready` diventa true nel gate-state. Solo ORA si parla di primo dealer reale.

**Regole trasversali:**
- Test li scrive CC, li lancia Luke, li legge Luke. CC non dichiara "verde".
- Input avversari scelti da Luke/Claude.ai, non da CC (CC scriverebbe test che passano).
- Send/payment su target reale (TEST_FOUNDER / Stripe test card), mai mock per la prova finale.
- Context >50% → chiudi ordinato, handoff file. Mai sforare 60%.
- NO stime in giorni finché Fase D non è completa.

---

## PARTE 7 — PROMPT PER CC (incolla in ARGOS terminal)

```
Leggi ~/venture-os/VOS-PRODUCTION-PROTOCOL.md. Metabolizza Parte 2 (definizione
production-ready) e Parte 6 (sequenza). Da ora il criterio di 'done' è quello, non i commit.

STOP feature nuove. Esegui Fase A — MAPPATURA:
1. Compila la chain-map ARGOS (Parte 3.1): esegui OGNI comando isolato della tabella,
   incolla l'output reale, classifica ogni anello VERIFIED / EXISTS / MISSING.
   Adatta i nomi modulo ai path reali del progetto se diversi.
2. Scrivi ~/venture-os/state/gate-state-ARGOS.json con lo schema di Parte 5.1.
3. Dimmi qual è l'anello più A MONTE che NON è VERIFIED — quello è l'unico lavoro dopo.

NON stimare giorni-a-revenue. NON dichiarare ready. NON guardare ROADMAP per giudicare.
Output: tabella chain-map con output reale per anello + gate-state.json scritto.
Se context >50% chiudi dopo la tabella, resto in handoff.
NO A/B/C/D. NO conferma. Esegui.
```

---

## PARTE 8 — Cosa VOS NON fa (anti-scope-creep, S182)

- VOS NON applica fix da solo ai child. Propone, Luke/CC child applicano. HITL preservato.
- VOS NON stima giorni. Conta anelli VERIFIED e safety-pass. Il resto è speculazione vietata.
- VOS NON costruisce dashboard. Brief markdown + gate-state JSON bastano.
- VOS NON gira come daemon. File-based, on-session, €0.

**Mantra VOS:** *Non quanti giorni mancano. Quanti anelli sono provati. Non cosa dice il commit. Cosa dice l'output del test letto da Luke.*
