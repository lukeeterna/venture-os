# PROMPT S77 — CONTENUTI REALI ENTERPRISE-GRADE

## CONTESTO — COSA MANCA

I contenuti S76 sono placeholder SVG con silhouette astratte — NON utilizzabili.
Servono contenuti REALI, professionali, pronti per Google Business / WA / email.

**Research gia' completata**: `research/s77_google_business_visual_standards.md`
- Cover: 1332x750px, JPG/PNG, area sicura 60px margini
- Profilo: 720x720px, volto reale OBBLIGATORIO (founder deve fare foto)
- Post: 1200x900px (4:3), 3 template (veicolo, insight, social proof)
- Descrizione: 750 char max, 2 versioni (fase zero / fase matura)
- Recensioni: soglia minima 10, 3 template WA per richiesta

---

## TASK E SKILL/AGENT ASSEGNATI

### TASK 1: Cover Google Business (1332x750 PNG)
**Skill**: `agent-marketing` (brand voice + layout) + `mcp__playwright` (render HTML→PNG)
```
Creare cover_google_business_v2.html (1332x750) con:
- Sfondo dark gradient (#06060a → #12121a)
- Testo "LUCA FERRETTI" (Georgia serif, 48px, #e8e8f0)
- Sottotitolo "Vehicle Sourcing · Mercati EU" (#c8a446, Courier, 14px)
- Brand auto: BMW · MERCEDES · AUDI · PORSCHE (spacing orizzontale)
- Badge "SUCCESS FEE · ZERO ANTICIPI" (bordo gold)
- Contatto: +39 328 153 6308 (angolo basso destro)
- NO silhouette auto astratte — usare gradient/glow professionali
- Renderizzare con Playwright → assets/cover_google_business_v2.png
```

### TASK 2: 5 Post Google Business (1200x900 PNG ciascuno)
**Skill**: `agent-marketing` (copy) + `mcp__playwright` (render)
```
5 post HTML→PNG con dati REALI dal batch S71:

POST 1 — BMW X3 xDrive20d 2022 (€34.100 DE → €42.000 IT)
POST 2 — Mercedes GLC 220d 2021 (dati da batch o stima mercato)
POST 3 — Audi Q5 40 TDI 2022 (dati da batch o stima mercato)
POST 4 — "Come lavoro" (processo in 3 step: Scouting → Verifica → Consegna)
POST 5 — "Perche' importare dalla Germania" (3 numeri chiave: -15% prezzo, km certificati, garanzia EU)

Layout per ogni post veicolo:
- Sfondo dark, accent gold
- Modello + anno + km in grande
- Confronto prezzo DE vs IT (numeri grandi)
- "Luca Ferretti · Vehicle Sourcing" in footer
- Dimensione: 1200x900px
```

### TASK 3: OG Image Landing (1200x630 PNG)
**Skill**: `agent-marketing` + `mcp__playwright`
```
og_image_v2.html → og_image_v2.png
- 1200x630px (standard OG)
- "Luca Ferretti — Vehicle Sourcing"
- Sottotitolo: "Veicoli premium dall'Europa per concessionari italiani"
- Palette dark/gold coerente
```

### TASK 4: Report Mockup (A4, PNG)
**Skill**: `agent-marketing` + `mcp__playwright`
```
report_mockup_v2.html → report_mockup_v2.png
- Aspetto di un PDF report professionale
- Header: "PROTOCOLLO ARGOS — Verifica Veicolo"
- Dati finti ma realistici (BMW X3, score 93/100, km OK, prezzo OK)
- Grafici semplici CSS (barre, score circle)
- Footer: "Riservato — Luca Ferretti · Vehicle Sourcing"
```

### TASK 5: One-Pager Dealer (A4, PDF)
**Skill**: `agent-marketing` (copy enterprise) + `mcp__playwright` (render)
```
one_pager_v2.html → one_pager_v2.pdf (o PNG)
- Chi sono (2 righe)
- Come lavoro (3 step visuali)
- Cosa propongo (veicoli reali con prezzi)
- Modello economico (success fee, zero anticipi)
- Contatti
- Design dark/gold, A4, stampabile
```

### TASK 6: Copy Enterprise-Grade
**Skill**: `agent-marketing` (brand voice)
```
Riscrivere/verificare tutti i copy:
- copy/google_business_description.txt — 2 versioni (fase 0 e fase matura)
- copy/wa_business_bio.txt — 139 char max WA Business
- copy/wa_auto_reply.txt — risposta automatica WA
- copy/segreteria_script.txt — script voce segreteria VoIP
- copy/email_signature.html — firma Gmail con link
- Template recensione WA (3 varianti: post-transazione, post-proposta, rete personale)
```

### TASK 7: Favicon + Profile Placeholder
**Skill**: `mcp__playwright`
```
- favicon.svg → favicon.png (32x32 + 180x180 apple-touch)
- profile_placeholder.png (720x720) — avatar "LF" professionale
  (placeholder fino a foto reale del founder)
```

### TASK 8: Landing Page Update
**Skill**: `agent-marketing` (copy) + edit diretto
```
- Aggiornare landing/index.html con nuovi asset PNG
- Verificare OG tags puntano a og_image_v2.png
- Verificare favicon puntato correttamente
- Deploy: cd landing && npx wrangler pages deploy .
```

---

## WORKFLOW ESECUZIONE

```
FASE 1 — RENDER (Task 1-4, 7): Creare tutti gli HTML, renderizzare con Playwright
FASE 2 — COPY (Task 6): Riscrivere tutti i testi enterprise-grade
FASE 3 — ASSEMBLY (Task 5, 8): One-pager + landing update
FASE 4 — DEPLOY: Cloudflare Pages + verifica visiva
```

## REGOLE

- Playwright headless per tutti i render HTML→PNG
- Palette: #06060a (bg), #0c0c12 (bg2), #c8a446 (gold), #e8c870 (gold light), #e8e8f0 (text), #68687a (muted)
- Font: Georgia/serif per titoli, Courier New/mono per label, Arial/sans per body
- MAI tech stack visibile (no CoVe, no Claude, no AI)
- MAI sedi false, team inventati, numeri gonfiati
- Coerenza con backstory: `tools/backstory_luca_ferretti.md`
- Standard visivi: `research/s77_google_business_visual_standards.md`

## FILE DI RIFERIMENTO
```
Backstory:      tools/backstory_luca_ferretti.md
Visual std:     research/s77_google_business_visual_standards.md
Assets attuali: assets/ (da sostituire con v2)
Copy attuali:   copy/ (da riscrivere/verificare)
Landing:        landing/index.html
Dati BMW X3:    batch S71 (366 listing, 48 PROCEED, margine +€8.645)
Dati Porsche:   batch S71 (169 listing, 14 PROCEED, margine +€27.980)
```
