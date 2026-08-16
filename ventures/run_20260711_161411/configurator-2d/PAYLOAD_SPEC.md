# PAYLOAD_SPEC — window.__payload

## Versione corrente: v:2 (MT-2D.7)

`window.__payload` è l'oggetto JS esposto dal configuratore che descrive in modo
deterministico la configurazione visiva corrente. È usato per generare il codice
preventivo da inviare all'attività sportiva.

Il payload si aggiorna live ad ogni cambio di selezione (design, colori, stampa,
sponsor, posizione/scala logo) senza richiedere azioni esplicite dell'utente.

---

## Schema JSON v:2 (corrente)

```json
{
  "v": 2,
  "archetipo": "<design-id>",
  "colori": {
    "maglia_p":        "<#rrggbb>",
    "maglia_s":        "<#rrggbb>",
    "pantaloncini_p":  "<#rrggbb>",
    "pantaloncini_s":  "<#rrggbb>",
    "calze_p":         "<#rrggbb>",
    "calze_s":         "<#rrggbb>"
  },
  "stampa": {
    "nome":    "<stringa>",
    "numero":  "<stringa>",
    "font":    "<font-id>",
    "colore":  "<#rrggbb>"
  },
  "sponsor": false,
  "sponsor_layout": {
    "x":     0.5,
    "y":     0.25,
    "scala": 0.2
  }
}
```

---

## Campi obbligatori v:2

| Campo | Tipo | Descrizione |
|---|---|---|
| `v` | integer | Versione dello schema. Valore attuale: `2`. Incrementare obbligatoriamente ad ogni modifica strutturale. |
| `archetipo` | string | ID del design selezionato (es. `"solid"`, `"vertical-stripes"`). |
| `colori.maglia_p` | string | Colore primario maglia, HEX **minuscolo** con `#` (es. `"#1e5bd6"`). |
| `colori.maglia_s` | string | Colore secondario maglia, HEX **minuscolo** con `#`. |
| `colori.pantaloncini_p` | string | Colore primario pantaloncini, HEX **minuscolo** con `#`. |
| `colori.pantaloncini_s` | string | Colore secondario pantaloncini, HEX **minuscolo** con `#`. |
| `colori.calze_p` | string | Colore primario calze, HEX **minuscolo** con `#`. |
| `colori.calze_s` | string | Colore secondario calze, HEX **minuscolo** con `#`. |
| `stampa.nome` | string | Nome retro normalizzato (max 16 char, maiuscolo). Stringa vuota se non impostato. |
| `stampa.numero` | string | Numero (max 2 cifre). Stringa vuota se non impostato. |
| `stampa.font` | string | ID font sportivo (es. `"block"`, `"condensed"`, `"geometric"`, `"technical"`, `"college"`). |
| `stampa.colore` | string | Colore stampa nome/numero, HEX **minuscolo** con `#`. |
| `sponsor` | boolean | `true` se un logo sponsor è caricato e attivo, `false` altrimenti. |
| `sponsor_layout.x` | number | Posizione orizzontale del centro del logo, normalizzata [0,1] rispetto alla larghezza della maglia. Default: `0.5`. |
| `sponsor_layout.y` | number | Posizione verticale del centro del logo, normalizzata [0,1] rispetto all'altezza della maglia. Default: `0.25`. |
| `sponsor_layout.scala` | number | Scala del logo come frazione della larghezza della maglia. Range sicuro: [0.05, 0.4]. Default: `0.2`. |

---

## Ordine chiavi v:2

L'ordine delle chiavi di primo livello è: `v`, `archetipo`, `colori`, `stampa`, `sponsor`, `sponsor_layout`.

L'ordine all'interno di `colori`: `maglia_p`, `maglia_s`, `pantaloncini_p`,
`pantaloncini_s`, `calze_p`, `calze_s`.

L'ordine all'interno di `stampa`: `nome`, `numero`, `font`, `colore`.

L'ordine all'interno di `sponsor_layout`: `x`, `y`, `scala`.

---

## Normalizzazione coordinate sponsor_layout

- `x` e `y` sono coordinate **normalizzate** rispetto alle dimensioni effettive
  del bounding box della maglia calcolato a runtime dalla maschera PNG.
- `scala` è una frazione della larghezza del bounding box.
- I valori sono deterministici e indipendenti dalla risoluzione del canvas o del
  viewport: possono essere salvati e riapplicati su qualsiasi dispositivo.
- `sponsor_layout` è **sempre presente** nel payload, anche quando `sponsor === false`.
  In questo caso i valori riflettono la posizione/scala corrente dei controlli
  (default deterministici: `x=0.5, y=0.25, scala=0.2`).
- I valori sono limitati a range sicuri che mantengono il logo visibile nel
  petto della maglia: `x` ∈ [0.1, 0.9], `y` ∈ [0.1, 0.9], `scala` ∈ [0.05, 0.4].

---

## Normalizzazione colori

Tutti i valori HEX nel payload sono sempre in **minuscolo** (es. `#1e5bd6`, non `#1E5BD6`).
La normalizzazione è applicata con `.toLowerCase()` in `buildPayload()`.
Qualsiasi consumer che riceve un payload deve considerare maiuscolo/minuscolo equivalenti,
ma la forma canonica prodotta da questo configuratore è sempre minuscola.

---

## Normalizzazione nome e numero

- `stampa.nome`: applicato con `normalizeName()` — maiuscolo `it-IT`, solo caratteri
  `[A-ZÀ-ÖØ-Ý0-9' -]`, spazi multipli collassati, max 16 caratteri.
- `stampa.numero`: solo cifre `[0-9]`, max 2 caratteri.

---

## Rappresentazione canonica

Il codice configurazione è prodotto con `JSON.stringify(window.__payload)` — senza
indentazione, senza wrapper Base64. Non includere mai dati immagine nel payload.

---

## Valori design-id ammessi

`solid`, `vertical-stripes`, `horizontal-stripes`, `horizontal-band`,
`diagonal-band`, `half-split`, `chevron`, `side-panels`, `contrast-shoulders`,
`center-band`, `quarters`, `pinstripes`

---

## Valori font-id ammessi

`block`, `condensed`, `geometric`, `technical`, `college`

---

## Vincoli assoluti

I campi seguenti NON devono mai comparire nel payload:

- Timestamp o data/ora
- Dati cliente (nome, email, telefono, indirizzo)
- Quantità o taglie
- Identificatori casuali (UUID, nonce, session ID)
- Dati binari sponsor (filename, dataURL, Base64)
- Prezzi, costi o valuta

---

## Versione e compatibilità

Il campo `v` deve essere incrementato obbligatoriamente ad ogni modifica strutturale
dello schema (aggiunta/rimozione campi, cambio semantica).

I consumer **devono rifiutare** le versioni sconosciute senza reinterpretazione
silenziosa; l'unica azione corretta su versione non riconosciuta è segnalare
l'incompatibilità.

Pseudocodice consumer-side:

```js
var p = JSON.parse(codice);
if (p.v !== 2) {
  throw new Error("Versione payload non supportata: " + p.v + ". Attesa: 2.");
}
```

---

## v:1 — Legacy (deprecated)

v:1 è stato prodotto dal configuratore fino a MT-2D.6 incluso. Schema:

```json
{
  "v": 1,
  "archetipo": "<design-id>",
  "colori": { "maglia_p": "...", "maglia_s": "...", "pantaloncini_p": "...",
              "pantaloncini_s": "...", "calze_p": "...", "calze_s": "..." },
  "stampa": { "nome": "...", "numero": "...", "font": "...", "colore": "..." },
  "sponsor": false
}
```

Differenze rispetto a v:2:
- Assente `sponsor_layout` (campo aggiunto in v:2 per posizione/scala logo).

Ricostruzione da v:1 a v:2 (migration):
1. Parsare il payload v:1.
2. Aggiungere `sponsor_layout` con valori default: `{ "x": 0.5, "y": 0.25, "scala": 0.2 }`.
3. Impostare `v: 2`.

I campi di v:1 sono **tutti preservati** in v:2 con gli stessi nomi e la stessa semantica.

---

## Procedura di ricostruzione da payload v:2

1. Parsare `JSON.parse(codice)`.
2. Verificare `v === 2` (rifiutare con errore esplicito se versione sconosciuta).
3. Applicare `archetipo` selezionando la card corrispondente.
4. Applicare i 6 valori `colori.*` agli input `type="color"` corrispondenti.
5. Applicare `stampa.nome`, `stampa.numero`, `stampa.font`, `stampa.colore`.
6. Impostare visivamente `sponsor` (non ripristinabile automaticamente — richiedere
   upload separato se `true`).
7. Applicare `sponsor_layout.x`, `sponsor_layout.y`, `sponsor_layout.scala`
   ai range input corrispondenti (anche se `sponsor === false`, i valori
   sono deterministici e ripristinabili).

---

## Sponsor

`sponsor: true` indica che un logo era caricato al momento della configurazione.
Il payload non contiene il dataURL né il filename dell'immagine.
Quando si conferma un ordine con `sponsor: true`, è necessario ricaricare l'immagine
separatamente (invio allegato email o upload dedicato): il dataURL non è conservato
dopo la chiusura della pagina.

`sponsor_layout` è sempre presente e descrive la posizione/scala del logo impostata
dall'utente, indipendentemente dallo stato di `sponsor`.

---

## Aggiornamento live

`window.__payload` viene scritto:
1. All'inizializzazione della pagina (dopo `DOMContentLoaded`).
2. Ad ogni cambio di colore (input `color`).
3. Ad ogni cambio di design (click su card architetipo).
4. Ad ogni modifica di nome, numero, font o colore stampa.
5. Quando uno sponsor viene caricato (`sponsor: true`) o rimosso (`sponsor: false`).
6. Ad ogni cambio dei controlli posizione/scala sponsor (input `range`).

Il payload non contiene né conserva il dataURL dell'immagine sponsor.

---

## Esempio v:2

```json
{
  "v": 2,
  "archetipo": "vertical-stripes",
  "colori": {
    "maglia_p":       "#1e5bd6",
    "maglia_s":       "#ffffff",
    "pantaloncini_p": "#ffffff",
    "pantaloncini_s": "#1e5bd6",
    "calze_p":        "#1e5bd6",
    "calze_s":        "#ffffff"
  },
  "stampa": {
    "nome":   "ROSSI",
    "numero": "10",
    "font":   "block",
    "colore": "#ffffff"
  },
  "sponsor": false,
  "sponsor_layout": {
    "x":     0.5,
    "y":     0.25,
    "scala": 0.2
  }
}
```
