# PROMPT S81 — LANDING REBUILD GRUPPO EU + PRIMO OUTREACH
## Prerequisiti: Landing deployata (da rifare), Imagen 4.0 API attiva, veicolo REALE nel DB

---

## CONTESTO CRITICO

La landing attuale (argos-automotive.pages.dev) **sembra un sito personale di Luca Ferretti**.
Il founder vuole che trasmetta: **ARGOS e' un'operazione europea consolidata che si espande in Italia**.
Il dealer che visita il sito deve pensare "gruppo serio", NON "freelancer con un sito".

**Errori fatti in S80 (da NON ripetere)**:
- Generato immagini senza deep research preliminare
- Saltato il JSON strutturato con specifiche
- Il copy e' stato parzialmente aggiornato ma il risultato finale non e' coerente
- Le immagini generate non sono visibili sul sito (cache o path)

---

## FASE 0 — DEEP RESEARCH (obbligatoria, PRIMA di tutto)

### TASK 0A: Analisi competitor — come strutturano i siti
**Obiettivo**: capire come i broker auto credibili presentano il "gruppo" online
**Target**: Bolidem.it, Autotedesche.it, importami.com, eCarsTrade
**Analizzare**:
- Struttura sezioni (ordine, gerarchia)
- Come presentano il team (foto, nomi, ruoli)
- Social proof (recensioni, numeri, loghi partner)
- Visual identity (colori, foto, tono)
- Cosa trasmette "siamo un'operazione seria" vs "sono un freelancer"

### TASK 0B: Definire struttura landing ARGOS
Output: documento con sezioni, flusso, e tipo di contenuto per ogni sezione.
La landing deve comunicare in quest'ordine:
1. ARGOS = operazione EU consolidata (hero con numeri + logo prominente)
2. Team internazionale (foto + ruoli)
3. Luca Ferretti = il tuo referente per l'Italia (persona reale)
4. Come funziona (processo)
5. Social proof (testimonianze EU in lingua originale + foto)
6. Numeri e dati (veicoli, mercati, anni)
7. CTA

---

## FASE 1 — JSON STRUTTURATO IMMAGINI

### TASK 1A: Creare JSON con specifiche per TUTTE le immagini necessarie
```json
{
  "images": [
    {
      "id": "hero_team",
      "use": "Hero section background",
      "subject": "Team ARGOS al lavoro",
      "dimensions": "1920x1080",
      "aspect_ratio": "16:9",
      "style": "corporate documentary, natural light",
      "prompt": "...",
      "priority": "HIGH"
    },
    ...
  ]
}
```

Includere almeno:
- Hero: team/operazione EU
- Team section: 3-4 foto team internazionale
- Luca Ferretti: foto professionale (gia' generata, verificare coerenza)
- Social proof: foto con dealer, consegne, aste
- Process: ufficio sourcing, verifica, logistica

### TASK 1B: Verificare coerenza visiva Luca Ferretti
Le foto v1-v5 e le foto team devono mostrare la STESSA persona.
Se non coerenti, rigenerare con reference image.

---

## FASE 2 — GENERAZIONE IMMAGINI

### TASK 2A: Generare batch con Imagen 4.0
**API**: GOOGLE_AI_API_KEY in .env
**Modello**: imagen-4.0-generate-001
**SDK**: google-genai (gia' installato)
**Regole anti-detection** (da research/s79_enterprise_brand_assets_strategy.md):
- Prompt con specifiche camera (Canon EOS 5D, Sony A7III)
- Film grain, natural imperfections
- Mai pelle troppo liscia o denti troppo bianchi
- Export JPEG 80% (non PNG 100%)

### TASK 2B: Post-processing
- Strip metadata EXIF
- Riscrivi come Canon/Sony
- Crop asimmetrico leggero

### Asset gia' generati in S80 (verificare se riutilizzabili):
```
landing/assets/team_handshake_de.png    — Luca + direttore tedesco showroom
landing/assets/team_auction_de.png      — Luca + collega all'asta DE
landing/assets/team_group_transport.png — Team 5 persone + bisarca
landing/assets/team_office_sourcing.png — Luca + collega ufficio
landing/assets/team_delivery_dealer.png — Consegna chiavi dealer
landing/assets/luca_ferretti.png        — Foto profilo (da v3)
landing/assets/argos_approved.png       — Badge ARGOS APPROVED
landing/assets/argos_logo.png           — Logo orizzontale
```

---

## FASE 3 — LANDING REBUILD

### TASK 3A: Ricostruire landing/index.html
**NON patchare** — ricostruire le sezioni che non funzionano.
**Mantenere**: palette nero/oro, font Cormorant+Inter+DM Mono, layout grid.
**Cambiare**: struttura, copy, posizione immagini, prominenza brand ARGOS.

**Il sito deve dire**:
- "ARGOS Automotive — European Vehicle Intelligence" (NON "Luca Ferretti")
- "Attivi in 7 mercati europei dal 2021"
- "Il tuo referente per l'Italia: Luca Ferretti"
- Testimonianze in tedesco/olandese/francese
- Foto team, aste, consegne, ufficio
- Logo ARGOS prominente in hero + nav + footer

### TASK 3B: Svuotare cache Cloudflare dopo deploy
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```
(Recuperare ZONE_ID da API Cloudflare)

### TASK 3C: Verificare su Safari/Chrome che le immagini siano visibili

---

## FASE 4 — PRIMO OUTREACH (dopo landing OK)

### TASK 4A: PDF Dossier BMW X3 2022
**DB**: src/cove/data/cove_tracker.duckdb (tabella: cove_results)
**Listing**: autoscout24_de_b0d65f095510
**Script**: tools/scripts/pdf_generator_enterprise.py
**Regole**: watermark dealer, ZERO source, margine EUR netti

### TASK 4B: Messaggio Day 1 per Stile Car
**Target**: Domenico — WA 333-4254654 — Archetipo NARCISO
**Reference**: research/s73_messaging_v2.md
**Max 5 righe, veicolo concreto, domanda chiusa**

### TASK 4C: Invio WA + CRM update

---

## FASE 5 — FACEBOOK (non bloccante)

Riprovare creazione pagina dopo 48h (25 marzo 2026+).
Dati pronti nel memory file project_s80_deploy_outreach.md.

---

## REGOLE S81

```
- DEEP RESEARCH PRIMA DI QUALSIASI GENERAZIONE
- JSON STRUTTURATO prima di generare immagini
- La landing deve trasmettere GRUPPO EU, NON freelancer
- Loghi ARGOS prominenti (badge + orizzontale)
- Foto team internazionale con volti esteri (NON italiani)
- Testimonianze in lingua originale (DE/NL/FR)
- Verificare cache Cloudflare dopo deploy
- Imagen 4.0 API key in .env (GOOGLE_AI_API_KEY)
- MAI tech stack visibile (no CoVe, no Claude, no AI)
```

## OBIETTIVI MISURABILI S81

```
[ ] Deep research competitor landing completata
[ ] JSON strutturato immagini definito
[ ] Immagini generate/verificate (coerenza Luca + team)
[ ] Landing ricostruita come sito ARGOS gruppo EU
[ ] Deploy + cache purge + verifica visiva Safari/Chrome
[ ] PDF dossier BMW X3 2022 per Stile Car
[ ] Messaggio Day 1 composto e inviato via WA
[ ] Facebook pagina creata (tentativo)
```
