# PROMPT S78 — PROFILI PIATTAFORME + RECENSIONI
## Prerequisito: Playwright MCP installato (fatto in S77)

---

## PREREQUISITO OBBLIGATORIO — PRIMO AVVIO

Claude Code deve essere stato riavviato dopo S77 per caricare Playwright MCP.
Verificare: il tool `browser_navigate` deve essere disponibile.

Se NON disponibile:
```
claude mcp list  # deve mostrare "playwright"
# Se assente: claude mcp add playwright -- npx @playwright/mcp@latest --browser chrome --user-data-dir ~/.argos-chrome-profile
# Poi riavviare Claude Code
```

---

## FASE 0 — LOGIN GOOGLE (una volta sola)

### TASK 0: Login Google su profilo Playwright
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno (esecuzione diretta)
```
1. browser_navigate → https://accounts.google.com/signin
2. browser_snapshot → trovare campo email
3. browser_type → ferretti.argosautomotive@gmail.com
4. browser_click → Avanti
5. browser_snapshot → trovare campo password
6. browser_type → [password da .env ARGOS_GMAIL_PWD]
7. browser_click → Avanti
8. browser_take_screenshot → verificare login riuscito
RISULTATO: sessione Google salvata in ~/.argos-chrome-profile (persiste)
```

---

## FASE 1 — GOOGLE BUSINESS PROFILE

### TASK 1: Creare profilo Google Business
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
**Dati**: `tools/platform_setup_playbook.md` sezione 1
```
1. browser_navigate → https://business.google.com/create
2. browser_type nel campo nome → "Luca Ferretti - Vehicle Sourcing EU"
3. browser_type nel campo categoria → "Concessionario auto" → selezionare dal dropdown
4. browser_click → Avanti
5. Seguire il wizard:
   - Modalita': Servizio a domicilio
   - Aree: Campania, Puglia, Calabria, Basilicata, Sicilia
   - Telefono: 0972 536 918
   - Sito: https://argos-automotive.pages.dev
   - Orari: Lun-Ven 08:30-18:30, Sab 09:00-13:00
6. browser_take_screenshot → conferma creazione
```

### TASK 2: Caricare foto profilo + copertina
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
```
1. Navigare alla sezione foto del profilo GB
2. Caricare assets/profile_placeholder_v2.png come foto profilo
3. Caricare assets/cover_google_business_v2.png come copertina
4. Caricare assets/post_1_bmw_x3_v2.png come prima foto aggiuntiva
```

### TASK 3: Inserire descrizione
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
**Dati**: `copy/google_business_description.txt` (Versione A)
```
1. Navigare a sezione "Info" del profilo
2. Inserire descrizione (587 caratteri, Versione A)
3. Compilare Q&A (4 domande da tools/platform_setup_playbook.md)
4. Compilare Servizi (3 servizi)
```

### TASK 4: Pubblicare 5 post Google Business
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
```
Per ogni post (1-5):
1. Navigare a sezione "Post" del profilo
2. Tipo: Aggiornamento
3. Caricare immagine: assets/post_{N}_*_v2.png
4. Inserire testo dal template in research/s77_platform_best_practices.md
5. Pubblicare
```

---

## FASE 2 — TRUSTPILOT

### TASK 5: Creare profilo Trustpilot ARGOS
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
**Dati**: `tools/platform_setup_playbook.md` sezione 4
```
1. browser_navigate → https://business.trustpilot.com/signup
2. Login con ferretti.argosautomotive@gmail.com
3. Nome business: ARGOS Automotive
4. Dominio: argos-automotive.pages.dev
5. Categoria: Automotive > Car Dealers
6. Piano: Free
7. Personalizzare profilo (logo, descrizione)
8. Generare link invito recensioni
```

---

## FASE 3 — PROVENEXPERT

### TASK 6: Creare profilo ProvenExpert
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
**Dati**: `tools/recensioni_estere_strategy.md` sezione ProvenExpert
```
1. browser_navigate → https://www.provenexpert.com/signup/
2. Registrazione con ferretti.argosautomotive@gmail.com
3. Nome: ARGOS Automotive
4. Categoria: Automobile & Fahrzeuge
5. Piano: Free
6. Descrizione in tedesco (da recensioni_estere_strategy.md)
7. Generare link invito
```

---

## FASE 4 — LINKEDIN

### TASK 7: Creare/ottimizzare profilo LinkedIn
**Skill**: `skill-browser-chrome` (Playwright MCP) + `agent-marketing` (copy)
**Sub-agent**: `agent-marketing` per copy About/Headline
**Dati**: `tools/platform_setup_playbook.md` sezione 3
```
1. browser_navigate → https://www.linkedin.com/login
2. Login con ferretti.argosautomotive@gmail.com (o creare account)
3. Headline: "Vehicle Sourcing EU per Concessionari | BMW · Mercedes · Audi | Success Fee"
4. About: testo da playbook sezione LinkedIn
5. Esperienza: Vehicle Sourcing Specialist, 2016-presente
6. Skills: Vehicle Sourcing, Automotive Sales, B2B Sales, etc.
7. Foto profilo: assets/profile_placeholder_v2.png
8. Banner: ritaglio da assets/cover_google_business_v2.png
```

---

## FASE 5 — FACEBOOK BUSINESS

### TASK 8: Creare pagina Facebook Business
**Skill**: `skill-browser-chrome` (Playwright MCP) + `agent-marketing` (copy)
**Sub-agent**: `agent-marketing` per About
**Dati**: `tools/platform_setup_playbook.md` sezione 5
```
1. browser_navigate → https://www.facebook.com/pages/creation
2. Login/registrazione
3. Nome: Luca Ferretti - Vehicle Sourcing EU
4. Categoria: Consulente automobilistico
5. Copertina: assets/cover_google_business_v2.png
6. Profilo: assets/profile_placeholder_v2.png
7. CTA: WhatsApp → wa.me/393281536308
8. About: stessa descrizione Google Business
```

---

## FASE 6 — EUROPAGES + WLW (directory B2B EU)

### TASK 9: Profilo Europages
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
```
1. browser_navigate → https://www.europages.com
2. Registrazione business gratuita
3. Nome: ARGOS Automotive
4. Settore: Automobile - Import Export
5. Mercati: DE, NL, BE, AT, FR, IT
```

---

## FASE 7 — GMAIL FIRMA + DEPLOY

### TASK 10: Configurare firma email Gmail
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: nessuno
**Dati**: `copy/email_signature.html`
```
1. browser_navigate → https://mail.google.com/mail/u/0/#settings/general
2. Sezione Firma → Crea nuova
3. Incollare HTML da copy/email_signature.html
4. Salvare
```

### TASK 11: Deploy landing Cloudflare Pages
**Skill**: nessuna (comando terminale diretto)
**Sub-agent**: `agent-ops`
```
cd landing && npx wrangler pages deploy .
```

---

## FASE 8 — RECENSIONI (post-setup)

### TASK 12: Inviare prime richieste recensioni
**Skill**: `skill-argos` (WA outreach) + `agent-sales` (composizione messaggi)
**Sub-agent**: `agent-sales` per personalizzare messaggi
**Dati**: `tools/recensioni_estere_strategy.md` + `copy/template_recensione_wa.txt`
```
1. Identificare 5-8 contatti rete personale del founder
2. Comporre messaggio WA personalizzato per ciascuno
3. Includere link Google Review + Trustpilot
4. Suggerire contenuto (MAI dettare testo)
5. Per contatti DE/EN: template in tedesco/inglese
```

### TASK 13: Rispondere alle recensioni
**Skill**: `skill-browser-chrome` (Playwright MCP)
**Sub-agent**: `agent-marketing` (copy risposte multi-lingua)
```
Ogni 24h controllare nuove recensioni su:
- Google Business
- Trustpilot
- ProvenExpert
Rispondere in lingua del recensore (DE/EN/FR/IT)
Template risposte in tools/recensioni_estere_strategy.md
```

---

## REGOLE

```
- Playwright MCP per TUTTE le interazioni browser (MAI osascript/cliclick)
- Profilo Chrome dedicato: ~/.argos-chrome-profile
- MAI tech stack nei profili (no CoVe, no Claude, no AI)
- MAI sedi false, team inventati
- Narrativa: ARGOS = EU consolidato, Luca = referente Italia 2026
- Coerenza cross-canale: tools/backstory_luca_ferretti.md
- Palette: #06060a, #c8a446, #e8e8f0
```

## OBIETTIVI MISURABILI S78

```
[ ] 6 profili creati (Google, Trustpilot, ProvenExpert, LinkedIn, Facebook, Europages)
[ ] Google Business verificato (o verifica avviata)
[ ] 5 post pubblicati su Google Business
[ ] Firma Gmail configurata
[ ] Landing deployata su Cloudflare
[ ] 5+ richieste recensioni inviate
[ ] Link recensioni generati per Google + Trustpilot
```
