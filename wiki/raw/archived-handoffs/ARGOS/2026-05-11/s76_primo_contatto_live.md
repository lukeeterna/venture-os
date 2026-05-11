# PROMPT S76 — CONTENUTI VISIVI + PRIMO CONTATTO LIVE

## REGOLA D'ORO
> L'identita' e' costruita (landing, backstory, messaggi pronti).
> PRIMA di contattare dealer servono: contenuti visivi professionali + Google Business ATTIVO.
> Claude Code genera TUTTI i contenuti visivi necessari in questa sessione.

## CONTESTO — COSA ABBIAMO (S75)

```
IDENTITA' COMPLETATA:
- Landing page riscritta: persona reale (Luca Ferretti), zero ARGOS come brand consumer
  - No fake reviews, no sedi false, no DEKRA/DAT, no "gruppo internazionale"
  - Modello Bolidem: persona + esperienza + specificity
- Backstory coerente: tools/backstory_luca_ferretti.md
- Google Business checklist: tools/google_business_checklist.md
- VoIP: 0972 536 918 (EhiWeb/VivaVox)

MESSAGGI PRONTI:
- 3 messaggi Day 1 V2 per TIER0: tools/s75_messaggi_day1_tier0.md
  - Stile Car (FG) — Domenico — NARCISO — BMW X3 2022 €34.100 DE
  - Car Plus (AV) — Luca — RAGIONIERE — BMW X3 2022 + tutti i costi
  - Sa.My. Auto (CS) — Antonio — PERFORMANTE — BMW X3 2022 peer-to-peer
- Veicolo REALE: BMW X3 xDrive20d 2022, 50k km, AutoScout24 DE, CoVe 81

DASHBOARD:
- Route /crm + template kanban + dettaglio dealer PRONTI
- db.py: query CRM gia' funzionanti
```

## PRIORITA' S76 — IN ORDINE

### P0: CONTENUTI VISIVI E COPY PROFESSIONALI (Claude Code genera tutto)

Il founder non e' un grafico. Claude Code deve produrre TUTTI i contenuti
pronti all'uso, professionali e realistici. Niente placeholder, niente "da fare dopo".

**0.1 — Foto profilo professionale Luca Ferretti**
- Generare con image generation (Hugging Face turbo) una foto realistica:
  - Uomo italiano ~35 anni, smart casual (camicia/polo scura, no cravatta)
  - Sfondo neutro/sfumato, luce naturale, espressione professionale ma accessibile
  - Stile: profilo LinkedIn/Google Business di un professionista automotive
  - Formati: 1:1 (Google Business), 3:4 (landing page), 16:9 (copertina)
- Se image gen non disponibile: creare un AVATAR SVG professionale con iniziali "LF"
  stilizzato (come i migliori profili business senza foto)

**0.2 — Foto copertina Google Business**
- Auto premium (BMW/Mercedes) in contesto europeo (concessionaria DE, parcheggio pulito)
- Watermark discreto "Luca Ferretti — Vehicle Sourcing"
- Formato: 1024x576 (rapporto Google Business cover)

**0.3 — Immagini per post Google Business (5 post pronti)**
Generare 5 post con immagine + copy, pronti da pubblicare:
1. BMW X3 2022 appena trovata — foto + testo "Appena selezionata dalla Germania..."
2. Mercedes GLC 2021 — foto + testo con delta prezzo DE→IT
3. Audi Q5 2022 — foto + testo "Km certificati, disponibile subito"
4. Generico "Come lavoro" — immagine lifestyle (laptop+auto) + testo processo
5. Generico "Perche' importare dalla Germania" — infografica semplice con numeri

Per ogni post: immagine + copy (max 300 caratteri) + hashtag

**0.4 — Copy professionali pronti all'uso**
Generare TUTTI i testi finali per:
- Descrizione Google Business (750 char) — gia' in checklist, ma rifinire
- Bio WhatsApp Business (139 char max)
- Firma email HTML (nome, ruolo, telefono, email, link landing)
- Testo segreteria telefonica (script da leggere/registrare)
- Messaggio di benvenuto WA Business (auto-reply)

**0.5 — Materiale per landing page**
- Favicon SVG professionale (scudo ARGOS stilizzato o "LF")
- Open Graph image (1200x630) per preview link su WA/social
- Screenshot/mockup del report ARGOS (finto ma realistico) per sezione "Come funziona"

**0.6 — One-pager PDF per dealer**
- 1 pagina A4, design professionale (dark/gold theme coerente con landing)
- Chi e' Luca Ferretti + Come funziona + Numeri reali + Contatti
- Pronto da inviare via WA come allegato se il dealer chiede "mandami qualcosa"
- Generare con tools/scripts/pdf_generator_enterprise.py o HTML→PDF

### P1: AZIONI FOUNDER CON CONTENUTI PRONTI
```
Tutti i contenuti generati in P0 vanno consegnati al founder con istruzioni:
- [ ] Upload foto profilo su Google Business
- [ ] Upload foto copertina su Google Business
- [ ] Pubblicare i 5 post (1 ogni 2-3 giorni)
- [ ] Impostare bio WA Business
- [ ] Impostare firma email
- [ ] Registrare segreteria telefonica (leggere lo script generato)
- [ ] Impostare auto-reply WA Business
- [ ] Deploy landing con OG image: cd landing && npx wrangler pages deploy .
- [ ] Ottenere 5+ recensioni dalla rete personale
- [ ] Configurare Zoiper con VoIP 0972 536 918
```

### P2: BATCH VEICOLI AGGIUNTIVI
```bash
# Veicoli diversificati per Day 3 (secondo veicolo)
python3 tools/batch_runner.py --model "Mercedes GLC" --mode fast
python3 tools/batch_runner.py --model "Porsche Macan" --mode fast
python3 tools/batch_runner.py --model "BMW X5" --mode fast
```

### P3: PRIMO INVIO (dopo P1 completato)
1. Verificare che il veicolo BMW X3 sia ancora disponibile su AutoScout24 DE
2. Inviare messaggio Day 1 a Stile Car (Orta Nova FG) — PRIMO
3. Aggiornare CRM (comandi in tools/s75_messaggi_day1_tier0.md)
4. Aspettare 24-48h
5. Inviare a Car Plus e Sa.My. Auto (uno alla volta, non tutti insieme)

### P4: DEPLOY DASHBOARD SU iMAC
```bash
ssh gianlucadistasi@192.168.1.2
cd ~/wa-intelligence
git pull
pm2 restart argos-dashboard
pm2 logs argos-dashboard --lines 10
```

### P5: MONITORAGGIO POST-INVIO
- Controllare WA per risposte
- Se risponde → dossier PDF immediato (batch_runner + pdf_generator)
- Se silenzio → Day 3 automatico dal sequencer (wa-daemon)
- Loggare TUTTO nel CRM

## REGOLE PER CONTENUTI VISIVI

```
1. ZERO tech stack visibile — no CoVe, no AI, no Claude, no "algoritmo"
2. Tono: professionista del settore, NON startup
3. Colori: dark (#06060a) + gold (#c8a446) coerenti con landing
4. Foto: realistiche, professionali, contesto automotive europeo
5. Copy: italiano naturale, come parla un professionista, NON come un marketer
6. MAI "ARGOS" come primo elemento — sempre "Luca Ferretti" prima
7. Numeri REALI (delta DE→IT, margini, modelli) — mai inventati
8. Se image gen non produce qualita' sufficiente → SVG/HTML professionale
```

## OUTPUT ATTESO FINE SESSIONE

```
assets/
  profile_photo_1x1.png (o .svg)     ← Google Business + landing
  profile_photo_3x4.png              ← Landing sezione "Chi sono"
  cover_google_business.png          ← Copertina Google Business
  og_image.png (o .svg)              ← Open Graph 1200x630
  favicon.svg                        ← Favicon landing
  post_1_bmw_x3.png + post_1.txt    ← Post Google Business #1
  post_2_merc_glc.png + post_2.txt   ← Post Google Business #2
  post_3_audi_q5.png + post_3.txt    ← Post Google Business #3
  post_4_come_lavoro.png + post_4.txt
  post_5_perche_importare.png + post_5.txt
  one_pager_dealer.pdf               ← PDF per dealer
  report_mockup.png                  ← Screenshot finto report ARGOS

copy/
  google_business_description.txt    ← 750 char
  wa_business_bio.txt                ← 139 char
  email_signature.html               ← Firma email HTML
  segreteria_script.txt              ← Script voce segreteria
  wa_auto_reply.txt                  ← Auto-reply WA Business
```

## FILE DI RIFERIMENTO
```
Landing:      landing/index.html
Backstory:    tools/backstory_luca_ferretti.md
Google BIZ:   tools/google_business_checklist.md
Messaggi:     tools/s75_messaggi_day1_tier0.md
CRM:          tools/dealer_crm.py
Dashboard:    wa-intelligence/dashboard/app.py (route /crm)
Templates:    wa-intelligence/dashboard/templates/crm.html + crm_detail.html
Credibilita': research/s74_broker_credibility_digital_presence.md
PDF gen:      tools/scripts/pdf_generator_enterprise.py
VoIP:         memory/reference_voip_ehiweb.md
```
