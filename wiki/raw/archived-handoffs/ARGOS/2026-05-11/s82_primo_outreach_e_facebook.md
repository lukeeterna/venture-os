# PROMPT S82 — PRIMO OUTREACH DEALER + FACEBOOK + VERIFICA LANDING
## Prerequisiti: Landing LIVE come gruppo EU, veicolo BMW X3 confermato, dati CoVe OK

---

## CONTESTO

S81 ha completato: landing rebuild gruppo EU (trust bar, timeline, recensioni EU),
46 agenti enterprise in 13 reparti, fix 10 skill. Il veicolo per il primo outreach
e' confermato nel DB CoVe.

Oggi e' 25 marzo+ = Facebook dovrebbe essere sbloccato (account non piu' troppo nuovo).

---

## FASE 1 — VERIFICA VISIVA LANDING (5 min)

### TASK 1A: Aprire landing su Safari e Chrome
- URL: https://argos-automotive.pages.dev
- Verificare: immagini team visibili, trust bar con stelle, timeline, recensioni
- Se immagini non visibili: debug path, purge cache CF
- Screenshot per conferma

---

## FASE 2 — PDF DOSSIER BMW X3 (bloccante per outreach)

### TASK 2A: Generare PDF dossier
```
Dati dal DB CoVe (confermati S81):
  listing_id: autoscout24_de_b0d65f095510
  BMW X3 xDrive20d 2022 | 50.058km | €34.140 DE
  Market IT: €37.088 | Margine: ~€2.948 | Confidence: 0.84 | Fraud: CLEAN

Script: python3 tools/scripts/pdf_generator_enterprise.py
Dealer: "Stile Car"
Watermark: "Riservato per Stile Car — ARGOS Automotive"
Output: dossier_bmw_x3_2022_stilecar.pdf
```

### TASK 2B: Verificare PDF
- Logo ARGOS presente
- ZERO source (nessun URL portale origine)
- Margine in EUR netti
- Watermark leggibile

---

## FASE 3 — MESSAGGIO DAY 1 PER STILE CAR

### TASK 3A: Comporre messaggio NARCISO
```
Target: Stile Car (Orta Nova FG) — Domenico — WA 333-4254654
Archetipo: NARCISO
Reference: research/s73_messaging_v2.md (sezione NARCISO)

Adattare al veicolo reale:
- BMW X3 xDrive20d 2022, 50.058 km
- €34.140 in Germania
- In Puglia stessi esemplari: €37-39.000
- "Sto cercando 2-3 concessionari della zona"
- "Ho visto il suo stock su AutoScout24"
- Domanda chiusa: "Le mando la scheda completa?"
- Firma: Luca Ferretti
```

### TASK 3B: Invio WA
```
1. Verificare sessione: curl http://192.168.1.2:9191/status
2. Se OK: POST http://192.168.1.2:9191/send
   body: {"number":"393334254654","message":"..."}
3. Allegare PDF se endpoint lo supporta
4. Aggiornare CRM: python3 tools/dealer_crm.py --update "Stile Car" --status CONTACTED
```

---

## FASE 4 — FACEBOOK PAGINA (non bloccante)

### TASK 4A: Riprovare creazione pagina
```
Account: ferretti.argosautomotive@gmail.com (pwd in .env)
Nome: "Luca Ferretti - Vehicle Sourcing EU"
Categoria: Azienda di veicoli a motore
Foto profilo: landing/assets/luca_ferretti.png
Cover: assets/cover_google_business_v2.png
Bio: gia' scritta in memory S80
```

### TASK 4B: Se funziona
- Pubblicare primo post (foto team + "ARGOS Automotive si espande in Italia")
- Linkare landing page
- Aggiornare memory

---

## FASE 5 — PARALLEL: SECONDO E TERZO DEALER

### TASK 5A: Preparare messaggio Day 1 per Car Plus (RAGIONIERE)
```
Target: Car Plus (Grottaminarda AV) — Luca — WA 328-9617180
Archetipo: RAGIONIERE
Trovare veicolo diverso dal DB CoVe (non BMW X3 — diversificare)
Reference: research/s73_messaging_v2.md (sezione RAGIONIERE)
```

### TASK 5B: Preparare messaggio Day 1 per Sa.My. Auto (PERFORMANTE)
```
Target: Sa.My. Auto (Rende CS) — Antonio — WA 349-2587423
Archetipo: PERFORMANTE/TECNICO
Trovare veicolo adatto dal DB CoVe
```

---

## REGOLE S82

```
- PDF PRIMA del messaggio (il dealer deve poter ricevere la scheda)
- Verificare sessione WA PRIMA di inviare
- MAI inviare messaggio generico — sempre veicolo REALE
- MAI piu' di 3 dealer nella stessa sessione (anti-ban + qualita')
- Aggiornare CRM dopo ogni invio
- Screenshot landing come prova visiva
```

## OBIETTIVI MISURABILI S82

```
[ ] Landing verificata visivamente (immagini OK, trust bar OK)
[ ] PDF dossier BMW X3 generato per Stile Car
[ ] Messaggio Day 1 inviato a Domenico/Stile Car via WA
[ ] CRM aggiornato con stato CONTACTED
[ ] Facebook pagina creata (tentativo)
[ ] Messaggi Day 1 preparati per Car Plus e Sa.My. Auto
```
