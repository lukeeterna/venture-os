# PROMPT S77 — AZIONI FOUNDER + BATCH VEICOLI + PRIMO INVIO

## CONTESTO — COSA ABBIAMO (S76)

```
CONTENUTI VISIVI COMPLETATI (assets/ + copy/):
- Profilo: profile_photo_1x1.png/svg, profile_photo_3x4.svg
- Google Business: cover_google_business.png, 5 post (png+txt)
- Landing: favicon.svg, og_image.png, report_mockup.png
- PDF: one_pager_dealer.pdf (A4, dark/gold, pronto per WA)
- Copy: google_business_description.txt, wa_business_bio.txt,
  email_signature.html, segreteria_script.txt, wa_auto_reply.txt
- Landing aggiornata: OG tags, favicon, foto profilo SVG

NOTA: Le immagini profilo sono SVG/avatar (HF quota esaurita).
Il founder DEVE sostituirle con foto REALE appena possibile.
L'avatar professionale e' un placeholder accettabile per partire,
ma la foto vera e' obbligatoria per credibilita' nel Sud Italia.
```

## PRIORITA' S77

### P0: DEPLOY LANDING AGGIORNATA
```bash
cd landing && npx wrangler pages deploy .
```
Verificare che OG image, favicon e profilo SVG siano visibili.

### P1: CHECKLIST FOUNDER (comunicare al founder)
```
- [ ] Upload foto profilo REALE su Google Business (avatar LF come placeholder)
- [ ] Upload copertina Google Business (assets/cover_google_business.png)
- [ ] Pubblicare post #1 (assets/post_1_bmw_x3.png + post_1.txt)
- [ ] Impostare bio WA Business (copy/wa_business_bio.txt — 123 char)
- [ ] Impostare auto-reply WA (copy/wa_auto_reply.txt)
- [ ] Copia/incolla firma email (copy/email_signature.html)
- [ ] Registrare segreteria (copy/segreteria_script.txt) su VoIP Zoiper
- [ ] Configurare Zoiper con VoIP 0972 536 918
- [ ] Chiedere 3-5 recensioni Google alla rete personale
- [ ] Pubblicare 1 post Google ogni 2-3 giorni (5 post pronti)
```

### P2: BATCH VEICOLI DIVERSIFICATI (per Day 3)
```bash
python3 tools/batch_runner.py --model "Mercedes GLC" --mode fast
python3 tools/batch_runner.py --model "Porsche Macan" --mode fast
python3 tools/batch_runner.py --model "BMW X5" --mode fast
```

### P3: PRIMO INVIO (dopo P1 completato dal founder)
1. Verificare BMW X3 ancora disponibile su AutoScout24 DE
2. Inviare a Stile Car (FG) — PRIMO
3. Aspettare 24-48h
4. Inviare a Car Plus (AV) e Sa.My. Auto (CS)
5. Aggiornare CRM dopo ogni invio

### P4: DEPLOY DASHBOARD SU iMAC
```bash
ssh gianlucadistasi@192.168.1.2
cd ~/wa-intelligence && git pull && pm2 restart argos-dashboard
```

## FILE DI RIFERIMENTO
```
Assets:      assets/ (19 file)
Copy:        copy/ (5 file)
Messaggi:    tools/s75_messaggi_day1_tier0.md
CRM:         tools/dealer_crm.py
Checklist:   tools/google_business_checklist.md
Landing:     landing/index.html
```
