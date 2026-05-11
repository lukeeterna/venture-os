# PROMPT S81 — PRIMO OUTREACH DEALER REALE
## Prerequisiti: Landing LIVE, Trustpilot verificato, Veicolo REALE nel CoVe DB

---

## FASE 0 — GENERA PDF DOSSIER (bloccante)

### TASK 0A: Recupera dettagli veicolo dal CoVe DB
**DB**: `src/cove/data/cove_tracker.duckdb`
**Tabella**: `cove_results` (ATTENZIONE: NON cove_tracker)
**Query**:
```sql
SELECT * FROM cove_results
WHERE listing_id = 'autoscout24_de_b0d65f095510'
ORDER BY analyzed_at DESC LIMIT 1;
```
**Veicolo**: BMW X3 xDrive20d 2022 | 50.058km | €34.140 | AutoScout24 DE
**Margine stimato**: ~€2.948 (prezzo mercato IT €37.088)
**Confidence**: 0.84 (sopra DEALER_PREMIUM_THRESHOLD 0.75)

### TASK 0B: Genera PDF enterprise
**Script**: `tools/scripts/pdf_generator_enterprise.py`
```bash
python3 tools/scripts/pdf_generator_enterprise.py \
  --listing-id autoscout24_de_b0d65f095510 \
  --dealer "Stile Car" \
  --output dossier_bmw_x3_2022_stilecar.pdf
```
**Regole PDF**:
- Watermark con nome dealer
- ZERO fonte/portale visibile (MAI "AutoScout24")
- Prezzo netto in EUR
- Margine stimato per il dealer
- Foto se disponibili

---

## FASE 1 — COMPONI MESSAGGIO DAY 1

### TASK 1A: Messaggio WhatsApp per Stile Car
**Target**: Stile Car (Orta Nova FG)
**Contatto**: Domenico — WA 333-4254654
**Archetipo**: NARCISO
**Reference**: research/s73_messaging_v2.md (sezione NARCISO Day 1)

**Regole messaggio**:
- Max 5 righe
- PRIMO contenuto = veicolo REALE con numeri REALI
- Domanda chiusa (risposta monosillabica)
- NO presentazione lunga (max 1 riga)
- NO fee/prezzo servizio
- NO link
- NO brand "ARGOS" come primo elemento
- Linguaggio: "macchina/auto", "margine", "ci guadagna €X", "km certificati"
- MAI: "veicolo EU", "ROI", "pipeline", "piattaforma", "algoritmo"

**Template NARCISO Day 1** (adattare con dati reali):
```
Buongiorno Domenico, sono Luca Ferretti.
Ho una BMW X3 xDrive20d del 2022, 50.000 km, dalla Germania a €34.100.
In Italia parte da €37.000 — ci sono quasi €3.000 netti di margine.
Le puo' interessare per il suo stock?
```

### TASK 1B: Prepara anche Day 3 (secondo touchpoint)
Secondo veicolo alternativo (Mercedes GLC o Audi Q5 se disponibile nel DB)
+ foto HD del primo veicolo

---

## FASE 2 — INVIA VIA WHATSAPP

### TASK 2A: Verifica sessione WA
**Skill**: `skill-argos`
```bash
# Verifica daemon attivo
curl -s http://localhost:9191/health
# O via iMac
ssh gianlucadistasi@192.168.1.2 "pm2 status wa-daemon"
```

### TASK 2B: Invia messaggio
**Skill**: `skill-argos`
```
Target: 393334254654 (Domenico, Stile Car)
Tipo: testo
Contenuto: messaggio Day 1 composto in TASK 1A
Allegato: PDF dossier (se supportato)
```

### TASK 2C: Aggiorna CRM
```bash
python3 tools/dealer_crm.py update "Stile Car" --status "DAY1_SENT" --note "BMW X3 2022 50k €34.1k"
```

---

## FASE 3 — FACEBOOK (non bloccante, riprova)

### TASK 3A: Riprovare creazione pagina Facebook
**Prerequisito**: almeno 48h dopo creazione account (25 marzo 2026+)
**Login**: ferretti.argosautomotive@gmail.com (pwd in .env, campo FACEBOOK_PWD)
**Dati**:
- Nome: "Luca Ferretti - Vehicle Sourcing EU" (trattino semplice, NON em dash)
- Categoria: "Azienda di veicoli a motore"
- Bio: "Trovo auto premium dalla Germania e dall'Europa per concessionari italiani. BMW, Mercedes, Audi, Porsche. Paghi solo a veicolo consegnato."
- Foto profilo: assets/profile_placeholder_v2.png
- Copertina: assets/cover_google_business_v2.png
- Sito: https://argos-automotive.pages.dev
- Tel: 0972 536 918
- WA: +393281536308
- CTA: "Invia messaggio WhatsApp"

**Se fallisce ancora**: account potrebbe richiedere verifica telefono o maturazione piu' lunga. Provare ad aggiungere numero di telefono all'account FB.

---

## FASE 4 — GBP (quando arriva cartolina)

### TASK 4A: Inserire codice verifica
Cartolina attesa 5-14gg da 23 marzo 2026 (entro 6 aprile)
Dopo verifica: upload foto + pubblicare 5 post (asset pronti in assets/)

---

## REGOLE S81

```
- PRIORITA' ASSOLUTA: messaggio WA inviato a dealer reale
- PDF: zero source, watermark dealer, margine in EUR netti
- Messaggio: max 5 righe, domanda chiusa, no tech
- WA: verificare sessione PRIMA di inviare
- CRM: aggiornare stato dealer dopo invio
- Facebook: tentativo secondario, non blocca outreach
- GBP: aspettare cartolina, non forzare
```

## OBIETTIVI MISURABILI S81

```
[ ] PDF dossier BMW X3 2022 generato per Stile Car
[ ] Messaggio Day 1 composto (NARCISO, max 5 righe)
[ ] Messaggio WA inviato a Domenico (333-4254654)
[ ] CRM aggiornato con stato DAY1_SENT
[ ] Facebook pagina creata (tentativo, non bloccante)
[ ] Messaggio Day 3 preparato (secondo veicolo)
```

## ASSET PRONTI

```
Landing:         https://argos-automotive.pages.dev (LIVE)
Trustpilot:      it.trustpilot.com/review/argos-automotive.pages.dev (LIVE)
Veicolo DB:      autoscout24_de_b0d65f095510 (BMW X3 2022 50k €34.1k)
CoVe DB:         src/cove/data/cove_tracker.duckdb (tabella: cove_results)
PDF generator:   tools/scripts/pdf_generator_enterprise.py
Messaggi ref:    research/s73_messaging_v2.md
WA daemon:       wa-intelligence/wa-daemon.js (:9191)
CRM:             tools/dealer_crm.py
Foto profilo:    assets/profile_placeholder_v2.png
Cover:           assets/cover_google_business_v2.png
Post testi:      assets/post_{1-5}.txt
Post immagini:   assets/post_{1-5}_*_v2.png
```
