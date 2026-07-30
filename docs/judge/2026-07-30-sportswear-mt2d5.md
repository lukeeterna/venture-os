# Report MT-2D.5 — Sponsor (upload logo sul petto)
**Data**: 2026-07-30
**Autore codice**: Sol (ponte incoming/MT-2D.5.html)
**Executor CC**: claude-opus-4 (main context)

---

## FASE 0 — Esito verbatim

head_atteso in STATE.md: `57e6c98`
git log ultimo commit sostantivo sportswear: `57e6c98 sportswear: MT-2D.4 nome+numero+font`
Commit successivi: `483899e docs(judge): state @57e6c98` e `228f69f auto-close session ...` — entrambi tollerati per regola FASE 0.
**CONCORDANZA.**

Ponte: `incoming/MT-2D.5.html` materializzato e copiato in `index.html`.
Restore point pre-overwrite: `index.html.bak-mt2d5` (30794 B, == `incoming/MT-2D.4.html`, MT-2D.4 pienamente recuperabile).

---

## FASE 1 — Integrità index.html

grep>0 (nuove voci MT-2D.5):

| Token | Match | Esito |
|-------|-------|-------|
| `window.__sponsorApplied` | 5 | PASS |
| `FileReader` | 1 | PASS |
| `window.__boundsFallback` | 1 | PASS |

Voci invariate:

| Controllo | Esito |
|-----------|-------|
| `<html>` aperto | PASS (1 match) |
| `</html>` ultima riga | PASS |
| Nessun `...` segnaposto | PASS (0 match) |
| Nessun path assoluto in href/src, nessun http/CDN | PASS (0 match) |
| Zero URL/CDN nuovi vs .bak | PASS (diff vuoto) |
| Nessuna chiave/valuta/email | PASS (0 match) |
| ASSET_DIR identico | PASS (`"assets-mockup/derived/web/"`) |

**Integrità: PASS.**

---

## FASE 1b — Non applicabile

Lo sponsor upload agisce solo sul petto frontale (overlay su `mask_maglia`); non tocca la
questione vista-retro del PSD. **FASE 1b saltata e dichiarata: non serve per questa unità.**

---

## Regressione (mt2 + mt3 + mt4)

| Suite | Esito |
|-------|-------|
| `verify/mt2/screenshot.sh` | PASS — combo1_blu 229257 B, combo2_rosso 197582 B |
| `verify/mt3/screenshot.sh` | PASS — vertical-stripes 236127 B, chevron 204319 B, quarters 228205 B |
| `verify/mt4/screenshot.sh` | PASS — block/condensed/geometric/technical/college tutti ~229 KB |

---

## FASE 4 — verify/mt5/ (sponsor)

Pilotaggio del configuratore reale via CDP (Chrome headless + Node 22 driver `drive.mjs`,
zero dipendenze npm). Sponsor di prova generato **in pagina con la Canvas API** (rettangolo
arancio `#ff7a1a` + scritta bianca "SPONSOR"): **mai un logo/marchio reale**, mai un file su disco.
Applicazione tramite la pipeline reale `applySponsorImage()` → `drawSponsor()`; reset tramite `removeSponsor()`.

| Stato | File | Byte | `window.__sponsorApplied` |
|-------|------|------|---------------------------|
| senza sponsor | sponsor_off.png | 625000 | false |
| sponsor applicato | sponsor_on.png | 614511 | true |
| dopo reset | sponsor_reset.png | 625000 | false |

- **Reset identico all'iniziale**: `cmp -s sponsor_off.png sponsor_reset.png` → **byte-identici. PASS**
  (il reset ripristina esattamente il render precedente; nessun residuo dello sponsor).
- **Nessuna scrittura su disco del repo fuori da verify/mt5/**: delta `git status` durante lo
  script = vuoto; il logo sintetico vive solo in memoria (dataURL). **PASS.**

---

## FASE 5 — Difetti NUOVI di questa unità (in coda ai 5 esistenti, non toccati)

1. **Sponsor sopra lo shading, non moltiplicato**: `drawSponsor` compone `destination-in` della
   maschera maglia + `ctx.drawImage` in overlay finale, senza `multiply` dello shading → come il
   numero (MT-2D.4), appare come adesivo piatto, non segue le pieghe del tessuto.
2. **Sponsor a posizione/scala fisse**: area petto `box.w*0.48 × box.h*0.12`, `y = 0.2h`, contain
   fit centrato → nessun controllo utente su collocazione o dimensione del logo.

I 5 difetti preesistenti in `STATE.md` restano invariati.

---

## Note

- Sponsor gestito interamente client-side: `FileReader.readAsDataURL`, validazione `type` immagine
  + limite 5 MB, decode via `Image`, tenuto solo in `sponsorImage`/`sponsorDataUrl` in memoria.
- `removeSponsor()` azzera stato, svuota l'input file, ridisegna: nessuna immagine conservata.
- Verdetto/sigillo (head_atteso, "Ultima unità chiusa", eventuale commit) lasciati al giudice:
  l'executor riporta solo fatti terminali (protocollo mandati, "mai auto-sigillare").
