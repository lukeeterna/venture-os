# S116 — ARGOS TOTAL VALUE ENGINE: PARAMETER EXPANSION + LOGISTICS INTEGRATION

## OBIETTIVO STRATEGICO

Trasformare il dossier ARGOS da "scheda veicolo" a
"proposta d'acquisto chiavi in mano". Il dealer apre il PDF
e vede: veicolo + analisi mercato + preventivo logistico completo.
Zero lavoro aggiuntivo richiesto. Risposta immediata: sì/no.

**Il game-changer non è avere più dati.
È eliminare OGNI friczione decisionale del dealer.**

Ricerca 2026: i dealer che usano AI per total cost transparency
chiudono 2x più velocemente (Cox Automotive, 2025).
ARGOS deve essere l'unico servizio che fornisce questo.

---

## RESEARCH FINDINGS 2026 (dati verificati)

### Bisarca DE→IT (fonte: Macingo, Trasportami, SpediamoAuto):
- Nord Italia (MI/TO/VR): €800-1.100
- Centro Italia (RM/BO): €1.000-1.500
- Sud Italia (NA/BA/PZ): €1.400-2.200
- Isole: +€300-500 traghetto
- SUV vs utilitaria: +€50-100

### Immatricolazione EU→IT 2026 (fonte: ACI, Motorizzazione):
- Emolumenti ACI: €27
- Iscrizione PRA: €32
- Bollo DU: €16
- Diritti Motorizzazione: €10.20
- Targhe: €41.78
- IPT base: €150.81 + €3.51/kW per kW > 53kW (±30% per provincia)
- Agenzia pratiche: €150-300
- Totale realistico: €480-900 depending on kW e provincia

### Game-changer 2026 (Cox Automotive, McKinsey, BCG):
- Dealers con AI 2x più efficienti
- Differenziatore B2B = delivery estimate + total cost transparency
- Mercato B2B automotive UE €92B entro 2035

---

## STEP 0 — CONTEXT LOAD (mandatory)

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto

echo "=== TRIP CALCULATOR ===" && \
  ls processors/trip_cost_calculator.py \
     processors/import_cost_calculator.py \
     tools/fee_calculator.py \
     processors/travel_calculator.py 2>&1

echo "=== TRIP CALC API ===" && \
  grep -n "^def \|^class " processors/trip_cost_calculator.py | head -20

echo "=== PIPELINE CONNECTION CHECK ===" && \
  grep -n "trip\|import_cost\|logistic\|bisarca\|transport" \
  tools/on_demand_runner.py | head -10

echo "=== LISTING MODEL ===" && \
  grep -n "price_eu\|km\|image_url\|equipment\|days_online\
\|seller_rating\|tco\|percentile\|logistics" \
  tools/scrapers/models.py 2>/dev/null | head -30
EOF
```

Confirm: "trip_cost_calculator.py exists. Pipeline connection: [NONE/PARTIAL].
Listing model has logistics fields: [YES/NO]."

---

## ENVIRONMENT
```
iMac:         ssh gianlucadistasi@192.168.1.2
Project:      ~/Documents/app-antigravity-auto
Python:       /usr/local/bin/python3 (3.14)
Python OCR:   /usr/local/bin/python3.12
Enricher:     tools/scrapers/detail_enricher.py
PDF gen:      tools/scripts/pdf_generator_enterprise.py
Models:       tools/scrapers/models.py
Pipeline:     tools/on_demand_runner.py
Trip calc:    processors/trip_cost_calculator.py (EXISTS, not wired)
Import calc:  processors/import_cost_calculator.py (EXISTS, not wired)
CoVe:         src/cove/cove_engine_v4.py (READ ONLY — zero modifiche)
```

**Constraints assoluti:**
- €0 budget aggiuntivo (API con free tier già in .env sono OK)
- Zero modifiche a `cove_engine_v4.py`
- Zero breaking changes a firme esistenti
- Ogni nuovo campo: enricher → Listing model → JSON → PDF
- Test E2E con evidence concreta (output del comando, non "dovrebbe")

---

## ARCHITETTURA TARGET

```
Listing JSON (arricchito S116):
├── MARKET INTELLIGENCE (Block 1)
│   ├── equipment: ["Panoramadach", "LED Matrix", ...]
│   ├── days_online: 45
│   ├── price_drops: 2
│   ├── owners_count: 1
│   ├── warranty_months_remaining: 8
│   └── seller_rating: 4.7 / seller_reviews: 127
│
├── DERIVED ANALYTICS (Block 2)
│   ├── price_percentile: 15  ← "più economico dell'85%"
│   ├── eur_per_km: 0.39
│   └── tco_estimate: { ... }
│
└── LOGISTICS PACKAGE (Block 3) ← IL DIFFERENZIATORE
    ├── transport_bisarca: 1100
    ├── registration_it: 680
    ├── total_landed_it: 30279
    ├── margin_net: 4221
    ├── transport_days: "7-10 giorni"
    └── docs_required: ["COC", "Targa provv.", "F24", ...]
```

---

## BLOCK 1 — MARKET INTELLIGENCE (dal detail page, zero API)

Usa `backend-architect` skill per analisi __NEXT_DATA__ prima di scrivere.

### 1A — Discovery: struttura __NEXT_DATA__ AS24

```bash
ssh gianlucadistasi@192.168.1.2 << 'EOF'
cd ~/Documents/app-antigravity-auto
python3 << 'PYEOF'
from curl_cffi import requests as cffi_req
import json, re

api = 'https://www.autoscout24.de/lst/bmw/x3?atype=C&cy=D&fregfrom=2021&fregto=2023&kmto=100000&priceto=40000'
r = cffi_req.get(api, impersonate='chrome', timeout=15)
nd = json.loads(re.search(
    r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',
    r.text, re.DOTALL
).group(1))
first = nd['props']['pageProps']['listings'][0]
url = 'https://www.autoscout24.de' + first['url']

r2 = cffi_req.get(url, impersonate='chrome', timeout=20)
nd2 = json.loads(re.search(
    r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',
    r2.text, re.DOTALL
).group(1))

details = nd2.get('props', {}).get('pageProps', {}).get('listingDetails', {})

print("=== TOP KEYS ===")
for k in list(details.keys())[:30]:
    v = details[k]
    print(f"  {k}: {type(v).__name__} → {str(v)[:80]}")

for key in ['features', 'equipment', 'vehicleDetails', 'seller',
            'firstOnlineDate', 'priceHistory', 'highlights',
            'consumptionData', 'emissionData']:
    val = details.get(key, 'NOT_FOUND')
    print(f"\n[{key}] = {str(val)[:200]}")
PYEOF
EOF
```

Riporta la struttura esatta. Poi implementa 1B-1D.

### 1B — Equipment extractor
### 1C — Listing age + price drops
### 1D — Seller intelligence

(Codice di riferimento nel prompt — adattare alla struttura reale di __NEXT_DATA__)

**Test Block 1:** ≥ 4/7 nuovi campi con valore reale nel JSON.

---

## BLOCK 2 — DERIVED ANALYTICS (calcoli puri, zero scraping)

Crea `processors/analytics_engine.py`:
- Price Percentile (vs market price index già in DB)
- €/km Score vs benchmark segmento
- Value Score sintetico (ECCELLENTE/BUONO/NELLA MEDIA)
- TCO Calculator con dati 2026 reali (bisarca + IPT + bollo)

**Test Block 2:** tutti i calcoli producono output nel JSON.

---

## BLOCK 3 — LOGISTICS PACKAGE: COLLEGARE TRIP CALCULATOR

**Questo è il game-changer.**

Crea `processors/logistics_package.py`:
- `build_logistics_package(listing, dealer, target_price_it)` → `LogisticsPackage`
- Prova trip_cost_calculator.py (Google Maps + TollGuru) se API disponibili
- Fallback a calcolo statico basato su regione (dati Macingo 2025)
- Calcolo immatricolazione esatto per provincia (IPT + ACI + targhe)
- Lista documenti richiesti
- Timeline consegna

Collega a `on_demand_runner.py` dopo CoVe scoring, prima del PDF.

**Test Block 3:** logistics.total_landed_it > price_eu, margin_net > 0.

---

## BLOCK 4 — PDF DOSSIER v2: LAYOUT NUOVE SEZIONI

Aggiungi al PDF (deve stare su max 2 pagine A4):

1. **Sezione "OPTIONAL & EQUIPAGGIAMENTO"** — top 8 con bullet
2. **Badge "Percentile Prezzo"** — "Top 15% più economico"
3. **Indicatore "Online da X giorni"** — con trend prezzo
4. **Rating Venditore** — stelle + numero recensioni
5. **€/km Score** — barra colorata vs media segmento
6. **PREVENTIVO LOGISTICO CHIAVI IN MANO** — tabella:
   - Trasporto bisarca DE→IT: €X.XXX
   - Immatricolazione IT: €XXX
   - Fee ARGOS: €X.XXX
   - **TOTALE VEICOLO A TERRA IT: €XX.XXX**
   - **MARGINE NETTO STIMATO: €X.XXX**
   - Consegna stimata: 7-10 giorni
   - Documenti inclusi nel servizio

---

## BLOCK 5 — TEST E2E CON EVIDENCE COMPLETA

Pipeline completa → JSON con 13 nuovi campi → PDF v2 → WA send → verifica telefono.

**13 campi da verificare nel JSON:**
```
Block 1: equipment, days_online, owners_count, warranty_months, seller_rating
Block 2: price_percentile, eur_per_km, value_score
Block 3: logistics.transport_cost, logistics.registration_cost,
         logistics.total_landed_it, logistics.margin_net_estimate,
         logistics.docs_required
```

**10 check visivi su telefono dopo WA send.**

---

## DONE CRITERIA

| Block | Check | Evidence | Status |
|-------|-------|----------|--------|
| 1 | ≥4 equipment estratti | JSON field | ☐ |
| 1 | days_online reale | JSON field | ☐ |
| 1 | seller_rating estratto | JSON field | ☐ |
| 2 | price_percentile | JSON int 0-100 | ☐ |
| 2 | eur_per_km + vs_avg | JSON fields | ☐ |
| 3 | logistics.transport_cost > 0 | JSON + source | ☐ |
| 3 | logistics.total_landed_it calcolato | JSON > price_eu | ☐ |
| 4 | PDF v2 con equipment section | Visivo | ☐ |
| 4 | PDF v2 con preventivo logistico | Visivo | ☐ |
| 5 | E2E ≥10/13 campi PASS | Output comando | ☐ |
| 5 | WA delivered | pm2 log | ☐ |

**Il metro: il dealer apre il PDF, vede il preventivo completo,
e risponde "fammi vedere il veicolo" senza fare nessuna altra domanda.**
