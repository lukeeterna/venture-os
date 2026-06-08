# Channel-form selector — quale FORMA dà Componente 0 (metodo, niche-free)

> Decisione di VOS, non lista a Luke (vincolo #3). Immagazzina **criterio**, non scelta verticale
> (memory: VOS generalista). Il *pubblico* lo specializza la venture; la *forma* la sceglie questo selettore.

## Regola di default (autocritica #1 di distribution-station.md)

A `channel_reach: 0`, **NON costruire audience da zero** (Levels = 10 anni). Default per la PRIMA corsa di
ogni venture: **sfruttare un aggregatore esistente** dove il pubblico c'è già.

```
SE channel_reach > 0:                      -> usa il canale esistente, salta il build (è già Componente 0)
ALTRIMENTI (==0):
  SE esiste un aggregatore con il buyer dentro,
     pubblicabile a €0, regole-ammesse:    -> FORMA = aggregator   (DEFAULT, time-to-buyer più corto)
  ALTRIMENTI SE buyer è una lista nominale
     raggiungibile (email/DM verificati):  -> FORMA = direct-outreach
  ALTRIMENTI (audience davvero assente):   -> FORMA = build-in-public (lento, ultima scelta)
```

## Le forme (test binario "esiste", esterno — non auto-valutato)

| Forma | Esiste SSE (test binario) | Costo | Quando |
|---|---|---|---|
| `aggregator` | accesso a pubblicare su un luogo dove il buyer è già (subreddit/gruppo/marketplace/directory) + regole lette + 1 post live via URL | €0 | DEFAULT a reach=0 |
| `direct-outreach` | lista di ≥N contatti con indirizzo/handle verificato + 1 invio test ricevuto | €0 | buyer nominabile 1:1 |
| `newsletter` | ≥1 iscritto reale + provider free-tier + invio test ricevuto | €0 | reach in costruzione, non per prima corsa |
| `build-in-public` | profilo attivo + ≥1 post + ≥1 follower non-bot | €0 | nessun aggregatore esiste |

## Output del selettore (va nel dossier S5, campo `channel`)
`channel_form: <aggregator|direct-outreach|newsletter|build-in-public>` + URL dei luoghi scelti + test-esistenza superato (vedi RUNBOOK).

## Tetto anti-lucidatura (autocritica #3)
Componente 0 = **endpoint + cattura contatti + 1 invio test riuscito. STOP.**
Niente automazione (n8n) finché una corsa reale non la richiede. Niente audience-building elaborato pre-primo-buyer.
