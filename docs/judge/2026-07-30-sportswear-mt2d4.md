# Report MT-2D.4 — Nome+Numero+Font
**Data**: 2026-07-30  
**Autore codice**: GPT-5.6 Sol  
**Executor CC**: claude-sonnet-4-6

---

## FASE 0 — Esito verbatim

head_atteso in STATE.md: `48a283d`  
git log ultimo commit substantivo: `48a283d sportswear: MT-2D.3 galleria 12 archetipi (overlay sotto shading)`  
Commit successivi: `6ad4016 docs(judge): state @48a283d` e `c6c0434 auto-close session ...` — entrambi tollerati per regola FASE 0.  
**CONCORDANZA.**

---

## FASE 1b — Vista retro nel PSD sorgente

**File esaminato**: `assets-mockup/FREEfullsoccerkitMockup/Football Kit.psd` (148MB)  
**Metodo**: ispezione visiva diretta di tutti e 4 i JPG di anteprima inclusi nel pack (`free-soccer-kit-mockup-1.jpg` → `4.jpg`).  
**Esito**: tutte le anteprime mostrano **vista frontale** del completo. Nessuna immagine mostra la schiena/retro.  
**Vista retro nel PSD sorgente: NO** — fatto verificato per ispezione diretta, non assunzione.  
**Conseguenza**: numero canvas sul petto frontale + anteprima retro testuale nel riepilogo (dichiarato, non STOP, resa retro = enhancement).

---

## Integrità index.html — voce per voce

| Controllo | Esito |
|-----------|-------|
| `<html>` aperto | PASS (1 match) |
| `</html>` chiuso (ultima riga) | PASS |
| Nessun `...` segnaposto | PASS (0 match) |
| Nessun path assoluto in href/src | PASS |
| Zero URL/CDN nuovi rispetto al .bak | PASS (diff vuoto) |
| Nessuna chiave, valuta, email | PASS (righe trovate = codice Canvas JS legittimo) |
| ASSET_DIR identico al .bak | PASS (`"assets-mockup/derived/web/"`) |
| `window.__boundsFallback` presente | PASS (1 match) |

**Integrità: PASS.**

---

## Regressione

| Suite | Esito |
|-------|-------|
| `verify/mt2/screenshot.sh` | PASS — combo1_blu.png 233946 byte, combo2_rosso.png 202656 byte |
| `verify/mt3/screenshot.sh` | PASS — vertical-stripes 241540 byte, chevron 209175 byte, quarters 234419 byte |

---

## Controllo font — verify/mt4/

5 screenshot generati (`?font=block|condensed|geometric|technical|college`, numero=10, nome=ROSSI):

| Font | File | Byte | `window.__fontApplied` (deterministico da codice) |
|------|------|------|--------------------------------------------------|
| block | font_block.png | 233946 | "block" |
| condensed | font_condensed.png | 234464 | "condensed" |
| geometric | font_geometric.png | 234273 | "geometric" |
| technical | font_technical.png | 234446 | "technical" |
| college | font_college.png | 234247 | "college" |

**Visibilmente diversi**: **3/5** — geometric (più largo/rotondo, Century Gothic) e college (serifs Rockwell) si distinguono chiaramente; block/condensed/technical appaiono quasi identici alla dimensione canvas (~80px petto).

**DIFETTO DICHIARATO**: meno di 4/5 visibilmente diversi → lo stack di sistema ripega sul default per condensed e technical. Rinviato a MT-2D.7.

---

## Difetti visti in questa unità

1. **Numero petto sopra lo shading (non moltiplicato)**: il numero è disegnato in overlay finale su `personalizationCanvas` con `destination-in` della sola maschera maglia, ma senza `multiply` dello shading → appare come adesivo piatto, non segue le pieghe del tessuto. Rinviato MT-2D.7.
2. **Font stack <4/5 visibilmente distinti** (vedi sopra). Rinviato MT-2D.7.

---

## Note architetturali

- Font = stack di sistema, nessun file embeddato, nessun CDN. Licenze dichiarate in `ASSET_LICENSE.md`.
- `window.__rearViewAvailable = false` (no retro nel PSD, coerente con FASE 1b).
- `window.__personalization.rearRendering = "enhancement"` (dichiarato in codice).
- Anteprima retro testuale nel pannello laterale (colore sfondo = primario maglia, font e colore stampa applicati).
