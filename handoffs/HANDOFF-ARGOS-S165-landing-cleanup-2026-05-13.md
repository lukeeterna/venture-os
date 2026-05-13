# HANDOFF ARGOS S164 → S165

**Data**: 2026-05-13
**Sessione chiusa**: S164 (E2E full test founder — TEST_FOUNDER PROMPT preparato ma non inviato)
**Prossima sessione**: S165 — Landing cleanup post-audit S99 (40gg deferred)
**Cwd**: `~/Documents/combaretrovamiauto-enterprise` (ARGOS, non VOS)

---

## Background critico

VOS S11b log analysis ha rivelato: audit `research/s99_DATI_CERTI_identita_internazionale.md` (3 Apr 2026) ha flaggato come CRITICO 4/7 elementi della landing `argos-automotive.pages.dev`. Mai actuati. **40 giorni di drift tra diagnosi e azione.**

Conseguenza: landing live in produzione ha claim falsi (10 anni esperienza), red flag (P.IVA in corso), telefono non verificato. Se dealer cerca ARGOS su Google dopo Day 1 WA, trova questi claim — credibilità a rischio prima del primo deal.

**Blocco**: nessun outreach reale può partire (anche TEST_FOUNDER che simula dealer) senza fix landing. S165 è prerequisito S166/S167/S168.

---

## Stato verificato (vincolo #1, fatti)

| Elemento landing | Stato attuale | Gravità S99 |
|---|---|---|
| "Opero da oltre 10 anni nel settore automotive europeo" | LIVE | **CRITICO 8/10** — FALSO, persona creata marzo 2026 |
| "P.IVA in corso di attivazione" | LIVE | **CRITICO 9/10** — red flag per dealer professionista |
| Email `ferretti.argosautomotive@gmail.com` | LIVE | MEDIO 4/10 — poco pro per B2B |
| Telefono `0972 536 918` | LIVE | NON VERIFICATO se attivo |
| 8 immagini "Luca Ferretti" (showroom/fiera/telefono/scrivania/ispezione/laptop/handshake) | LIVE | NON VERIFICATO se stock/AI/reali |
| Footer disclosure su P.IVA reale Luke + frontman framing | ASSENTE | Compliance gap |
| Claim "73 portali, 19 paesi" | LIVE | MEDIO — gonfiato (realtà: 65 profili configurati, 2 scraper operativi) |

---

## Goal S165 (~2-3h, 5 fix atomici)

5 fix sequenziali, ognuno commit separato per audit trail pulito.

### A.1 — Rimuovi claim "10 anni esperienza"

File: `landing/index.html` + `landing/copy_definitivo.md`

Sostituisci hero/chi-sono claim "10 anni nel settore automotive europeo" con focus su **metodo** (verificabile):
- "Success-fee puro: paga solo se l'auto entra in concessionaria"
- "Sourcing su 65 portali in 26 paesi europei" (dato verificabile da `portal_profiles.py`)
- "Zero anticipo, zero rischio per il dealer"

NO claim su anni di attività. NO "esperienza" generica. SOLO metodo + infrastruttura.

Verifica post-edit: `grep -i "10 anni\|esperienza\|da oltre" landing/index.html` → 0 match.

### A.2 — Rimuovi "P.IVA in corso di attivazione"

File: `landing/index.html` + eventuali altri menzioni in `landing/contract/`

Opzioni:
- Se P.IVA reale è già attiva (Luke verifica con commercialista): dichiararla con numero
- Se non attiva: rimuovere ogni menzione (anche "P.IVA in corso"). Footer minimo solo legal disclosure post-disclosure (vedi A.4)

Verifica post-edit: `grep -i "p.iva\|partita iva\|in corso" landing/` → solo menzioni legittime (es. footer disclosure A.4).

### A.3 — Verifica telefono 0972 536 918

Test attivo: chiamare il numero (può Luke da WA o telefono fisso). Stati possibili:
- **Risponde**: ok, lasciare. Decidere se segreteria personalizzata "ARGOS / Luca Ferretti"
- **Non risponde / cessato**: rimuovere dalla landing. Lasciare solo WA Business `3281536308` (identity.md ARGOS)

Verifica post-edit: telefono presente solo se confermato attivo + segreteria coerente con brand.

### A.4 — Footer disclosure (frontman framing)

Aggiungi al footer landing (tutte le pagine):
```
ARGOS Automotive è il brand commerciale di [P.IVA reale Luke / ragione sociale Luke].
Luca Ferretti è il consulente commerciale dedicato ai dealer italiani.
Contatti: WA 3281536308 — argos-automotive.pages.dev
```

**Formulazione esatta da concordare con commercialista PRIMA del deploy live.** Draft ok per branch staging, commit live solo post-approval legal.

Compliance: questa è la pietra angolare per giustificare legalmente lo pseudonimo commerciale. Senza disclosure footer, "Luca Ferretti" è frontman fittizio non disclosed = rischio compliance.

### A.5 — Verifica 8 immagini Luca Ferretti

Per ognuna delle 8 immagini con alt text "Luca Ferretti ...":
1. Estrai filename da `landing/index.html`
2. Apri `landing/assets/<file>` in browser O lookup origine
3. Reverse-image-search su Google Images (manualmente, drag-drop su images.google.com)
4. Documenta in BACKLOG.md ARGOS:
   - **AI-generated** trovabile (Stable Diffusion artifact, sguardo storto, mani malformate): da sostituire URGENT
   - **Stock photo** reverse-search trovata (Shutterstock/Unsplash visibili): da sostituire — dealer Sud Italia 35-55 NON le riconoscono ma chiunque googli può trovarle
   - **Foto reale** (con consenso): ok, ma serve consent doc su file
   - **Origine ignota**: da sostituire per safety

Sostituzione URGENT (S168?): elementi grafici non-volto (auto premium, mappe EU, processo schematico), oppure UNA foto reale con consenso documentato.

S165 scope su A.5: solo audit + documentazione in BACKLOG.md. Sostituzione effettiva = sessione separata (estetica + asset acquisition).

---

## Pre-flight obbligatorio

```bash
cd ~/Documents/combaretrovamiauto-enterprise
git status --short  # verifica WIP pendente (S164 ha lasciato file in stato dirty — vedi SESSION_DIRTY.md)
git diff --stat landing/
ls -la landing/index.html landing/copy_definitivo.md
cat .claude/SESSION_DIRTY.md 2>/dev/null | head -20  # cosa è ancora dirty?
```

**Decisione bloccante PRE-edit**: cosa fare con WIP S164 pendente?
- **Opzione A**: prima cleanup WIP S164 (commit o discard), poi S165 fresh. Pulito ma 30 min extra.
- **Opzione B**: ramo separato `s165-landing-cleanup` da HEAD attuale ignorando WIP. Veloce ma rischio merge complesso.
- **Opzione C**: WIP S164 + S165 fix tutto insieme commit S165. Veloce ma audit trail sporco.

Raccomandazione: **A**. WIP S164 (PDF dossier post-fix S11b è già parte del WIP che sarà committed con gitignore fix S11b commit `f118677`).

---

## Vincoli sessione

- **#1**: fact-check ogni claim sostitutivo (es. "65 portali" deve essere verificato da `portal_profiles.py` count attuale, non assunto)
- **#3**: una raccomandazione per wording sostitutivo, NO 3 alternative su scelta editoriale tecnica
- **#5**: zero-cost. Niente acquisto dominio in S165 (decisione Q3 founder, separata)
- **#6**: 5 fix atomici. Se A.4 (disclosure footer) bloccato da pending commercialista → handoff S165b per A.4 only, A.1+A.2+A.3+A.5 chiudono verde
- **#9**: NO diplomatico sulle decisioni di wording. Founder approva il copy finale, ma proposta CC singola e netta
- **#11**: pattern audit-mai-actuato è recurrent. Append deviation `argos-audit-s99-actuated-40gg-late` post-shippato

---

## Done when

- A.1: 0 match grep "10 anni|esperienza|da oltre" in landing/
- A.2: 0 match grep "in corso" P.IVA (solo legit disclosure A.4)
- A.3: telefono verificato attivo O rimosso
- A.4: footer disclosure draft con `[P.IVA REALE LUKE - DA INSERIRE]` placeholder, branch staging non live
- A.5: BACKLOG.md ARGOS aggiornato con audit 8 immagini + verdict per ognuna
- 5 commit separati su ARGOS repo, push origin
- Verifica WebFetch post-deploy: `argos-automotive.pages.dev` mostra claim corretti
- HANDOFF.md aggiornato + commit
- Append deviation VOS `argos-audit-s99-actuated-40gg-late` in `~/venture-os/state/blueprint-deviations.jsonl` con context "audit S99 produced 2026-04-03, actuated 2026-05-13, 40 days drift between diagnosis and action — pattern strutturale documentato per future referenze."

---

## Refs

- `~/Documents/combaretrovamiauto-enterprise/research/s99_DATI_CERTI_identita_internazionale.md` (audit fonte)
- `~/Documents/combaretrovamiauto-enterprise/research/s99_backstory_internazionale.md` (positioning N26-style)
- `~/Documents/combaretrovamiauto-enterprise/landing/index.html` (target file 1)
- `~/Documents/combaretrovamiauto-enterprise/landing/copy_definitivo.md` (target file 2)
- `~/Documents/combaretrovamiauto-enterprise/landing/contract/index.html` (target file 3 se ha menzioni P.IVA)
- `~/Documents/combaretrovamiauto-enterprise/.claude/SESSION_DIRTY.md` (WIP S164 da gestire)
- `~/venture-os/wiki/projects/ARGOS/STRATEGY.md` (se esiste post-S11c-strategic: usare sezione 4 Compliance gates per wording disclosure)

---

## Next post-S165

- **S166 ARGOS** — Pipeline test 5-step su TEST_FOUNDER (smoke send + response interest/negative/no-reply + edge cases). PRE-requisito: S165 done.
- **S167 ARGOS** — `dealer-intel` componente MVP (Google Maps scrape). PRE-requisito: S166 done + STRATEGY.md sez 2 (Layer 1 spec) shipped.
- **S168 ARGOS** — Skill `/outreach-day1` upgrade gate hook obbligatorio + primo dealer reale HITL.

---

## NON FARE in S165

- NO invio Day 1 a TEST_FOUNDER (rimandato a S166 dopo landing fix)
- NO sostituzione 8 immagini (deferred, scope separato)
- NO nuova sezione "Approccio per concessionari" (deferred a S168+, post-STRATEGY.md)
- NO modifiche `dealer_network.sqlite` o codice scraper/CoVe
- NO deploy live di footer disclosure A.4 prima approval commercialista (branch staging only)
