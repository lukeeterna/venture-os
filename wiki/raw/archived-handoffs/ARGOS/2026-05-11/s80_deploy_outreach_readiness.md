# PROMPT S80 — DEPLOY LANDING + OUTREACH READINESS
## Prerequisiti: Token Cloudflare RIGENERATO, Cartolina GBP (5-14gg)

---

## FASE 0 — DEPLOY LANDING + VERIFICA TRUSTPILOT (bloccante)

### TASK 0A: Token Cloudflare — ATTENZIONE
**PROBLEMA**: 2 token forniti in S79 erano ENTRAMBI "Invalid API Token" (non problema permessi).
**Causa probabile**: token non copiato completamente o pagina chiusa prima di copiare.
**Azione**: Il founder deve:
1. dashboard.cloudflare.com > My Profile > API Tokens
2. Cliccare "Roll" sul token esistente (o crearne uno nuovo)
3. **COPIARE IMMEDIATAMENTE** il token (si vede UNA SOLA VOLTA)
4. Incollarlo SENZA modifiche
5. Verificare: `curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer TOKEN"` deve dare `success: true`

### TASK 0B: Deploy landing + file verifica Trustpilot
**Skill**: terminale diretto
```bash
cd /Users/macbook/Documents/combaretrovamiauto-enterprise/landing
CLOUDFLARE_API_TOKEN=$NEW_TOKEN npx wrangler pages deploy . --project-name=argos-automotive
```
**Verifica**: https://argos-automotive.pages.dev deve caricare
**Verifica Trustpilot**: https://argos-automotive.pages.dev/0b0d1a53-5e15-4327-ae22-a2dc47743b4a.html deve mostrare il token

### TASK 0C: Completare verifica Trustpilot
**Skill**: `skill-browser-chrome` (Playwright MCP)
1. Accedere a https://businessapp.b2b.trustpilot.com
2. Login con ferretti.argosautomotive@gmail.com
3. Andare in Settings > Domain verification
4. Cliccare "Verify domain"
5. Salvare il link invito recensioni

---

## FASE 1 — GOOGLE BUSINESS COMPLETAMENTO (dopo cartolina, ~5-14gg)

### TASK 1A: Inserire codice verifica cartolina
**Skill**: `skill-browser-chrome`
1. Google Search > "la mia impresa"
2. Banner "Inserisci codice" > digitare codice dalla cartolina
3. Confermare

### TASK 1B: Upload foto (sbloccato dopo verifica)
**Skill**: `skill-browser-chrome`
```
Logo: assets/profile_placeholder_v2.png
Copertina: assets/cover_google_business_v2.png
Galleria: assets/post_1_bmw_x3_v2.png
```

### TASK 1C: Pubblicare 5 post
**Skill**: `skill-browser-chrome`
**Dati**: assets/post_{1-5}.txt (testi) + assets/post_{1-5}_*_v2.png (immagini)
```
Post 1: BMW X3 xDrive20d dalla Germania
Post 2: Mercedes GLC 300d dal Belgio
Post 3: Audi Q5 40 TDI dall'Olanda
Post 4: Come lavoro con i concessionari
Post 5: Perche' importare dalla Germania conviene
```

---

## FASE 2 — FACEBOOK COMPLETAMENTO

### TASK 2A: Aggiungere dettagli alla Pagina Facebook
**Skill**: `skill-browser-chrome`
**Prerequisito**: Pagina gia' creata dal founder
```
1. Accedere alla Pagina > Modifica info
2. Sito web: https://argos-automotive.pages.dev
3. Telefono: 0972 536 918
4. WhatsApp: +393281536308
5. Email: ferretti.argosautomotive@gmail.com
6. CTA button: "Invia messaggio WhatsApp"
7. Upload foto profilo: assets/profile_placeholder_v2.png
8. Upload copertina: assets/cover_google_business_v2.png
```

---

## FASE 3 — LINKEDIN (manuale o Playwright con cautela)

### TASK 3A: Creare profilo LinkedIn — MANUALE
**Deep research S79 conclusione**: LinkedIn ha 5 layer anti-bot simultanei nel 2026.
Nessun tool gratuito li bypassa. Rischio ban 15-60% anche con stack premium (€200-500/mese).
**Decisione**: creazione MANUALE dal founder (45 min, zero rischio, zero costo).
**Research completa**: research/s79_linkedin_automation_research.md

**Istruzioni per il founder**:
1. linkedin.com/signup con ferretti.argosautomotive@gmail.com
2. Headline: "Vehicle Sourcing EU per Concessionari | BMW · Mercedes · Audi"
3. About: copia da tools/platform_setup_playbook.md sezione 3
4. Foto: assets/profile_placeholder_v2.png
5. Banner: assets/cover_google_business_v2.png (ritagliare 1584x396)
6. Esperienza: "Vehicle Sourcing Specialist — 2016 a oggi"

---

## FASE 4 — PRIMO OUTREACH DEALER (post-deploy)

### TASK 4A: Preparare dossier veicolo REALE per Tier0
**Skill**: `skill-cove` + `agent-sales`
```
1. Scrape BMW X3 / Mercedes GLC da mobile.de o autoscout24.de
2. CoVe scoring
3. PDF dossier enterprise
4. Comporre messaggio Day 1 per Stile Car (Domenico, NARCISO)
```

### TASK 4B: Inviare primo messaggio WA
**Skill**: `skill-argos`
```
Target: Stile Car (Orta Nova FG) — Domenico — WA 333-4254654
Archetipo: NARCISO
Messaggio: veicolo concreto + domanda chiusa (max 5 righe)
```

---

## REGOLE S80

```
- Token Cloudflare: RIGENERARE, non modificare permessi (gia' corretti)
- GBP: aspettare cartolina (5-14gg da 2026-03-23)
- Trustpilot: verifica dominio via file upload (file gia' in landing/)
- LinkedIn: tentare Playwright, fallback manuale
- MAI tech stack nei profili (no CoVe, no Claude, no AI)
- Primo outreach: SOLO dopo landing deployata + almeno GBP verificato
- Gmail firma: GIA' IMPOSTATA (tools/set_gmail_signature.py)
- OAuth token Gmail: ~/.argos-gmail-token.json
```

## OBIETTIVI MISURABILI S80

```
[ ] Landing deployata su argos-automotive.pages.dev
[ ] Trustpilot dominio verificato + link invito generato
[ ] GBP codice cartolina inserito (quando arriva)
[ ] GBP foto caricate (logo + copertina + 1 galleria)
[ ] GBP 5 post pubblicati
[ ] Facebook pagina completata (info + foto + CTA WA)
[ ] LinkedIn profilo creato
[ ] Primo dossier veicolo REALE generato
[ ] Primo messaggio WA inviato a Stile Car (Tier0)
[ ] 5+ richieste recensioni inviate (rete personale)
```

## ASSET PRONTI

```
Gmail firma:     GIA' IMPOSTATA
Testi post:      assets/post_{1-5}.txt
Immagini post:   assets/post_{1-5}_*_v2.png
Foto profilo:    assets/profile_placeholder_v2.png
Cover:           assets/cover_google_business_v2.png
Firma email:     copy/email_signature.html
Verifica TP:     landing/0b0d1a53-5e15-4327-ae22-a2dc47743b4a.html
OAuth Gmail:     /Users/macbook/Downloads/argos-gmail-credentials.json
Token Gmail:     ~/.argos-gmail-token.json
```
