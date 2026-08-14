# PAYLOAD_SPEC — window.__payload v:1

## Scopo

`window.__payload` è l'oggetto JS esposto dal configuratore che descrive in modo
deterministico la configurazione visiva corrente. È usato per generare il codice
preventivo da inviare all'attività sportiva.

Il payload si aggiorna live ad ogni cambio di selezione (design, colori, stampa,
sponsor) senza richiedere azioni esplicite dell'utente.

## Schema JSON

```json
{
  "v": 1,
  "archetipo": "<design-id>",
  "colori": {
    "maglia_p":        "<#RRGGBB>",
    "maglia_s":        "<#RRGGBB>",
    "pantaloncini_p":  "<#RRGGBB>",
    "pantaloncini_s":  "<#RRGGBB>",
    "calze_p":         "<#RRGGBB>",
    "calze_s":         "<#RRGGBB>"
  },
  "stampa": {
    "nome":    "<stringa>",
    "numero":  "<stringa>",
    "font":    "<font-id>",
    "colore":  "<#RRGGBB>"
  },
  "sponsor": false
}
```

## Campi obbligatori

| Campo | Tipo | Descrizione |
|---|---|---|
| `v` | integer | Versione dello schema. Valore fisso: `1`. |
| `archetipo` | string | ID del design selezionato (es. `"solid"`, `"vertical-stripes"`). |
| `colori.maglia_p` | string | Colore primario maglia, HEX maiuscolo con `#`. |
| `colori.maglia_s` | string | Colore secondario maglia, HEX maiuscolo con `#`. |
| `colori.pantaloncini_p` | string | Colore primario pantaloncini, HEX maiuscolo con `#`. |
| `colori.pantaloncini_s` | string | Colore secondario pantaloncini, HEX maiuscolo con `#`. |
| `colori.calze_p` | string | Colore primario calze, HEX maiuscolo con `#`. |
| `colori.calze_s` | string | Colore secondario calze, HEX maiuscolo con `#`. |
| `stampa.nome` | string | Nome retro normalizzato (max 16 char, maiuscolo). Stringa vuota se non impostato. |
| `stampa.numero` | string | Numero (max 2 cifre). Stringa vuota se non impostato. |
| `stampa.font` | string | ID font sportivo (es. `"block"`, `"condensed"`, `"geometric"`, `"technical"`, `"college"`). |
| `stampa.colore` | string | Colore stampa nome/numero, HEX maiuscolo con `#`. |
| `sponsor` | boolean | `true` se un logo sponsor è caricato e attivo, `false` altrimenti. |

## Valori design-id ammessi

`solid`, `vertical-stripes`, `horizontal-stripes`, `horizontal-band`,
`diagonal-band`, `half-split`, `chevron`, `side-panels`, `contrast-shoulders`,
`center-band`, `quarters`, `pinstripes`

## Valori font-id ammessi

`block`, `condensed`, `geometric`, `technical`, `college`

## Vincoli assoluti

I campi seguenti NON devono mai comparire nel payload:

- Timestamp o data/ora
- Dati cliente (nome, email, telefono, indirizzo)
- Quantità o taglie
- Identificatori casuali (UUID, nonce, session ID)
- Dati binari sponsor (filename, dataURL, Base64)
- Prezzi, costi o valuta

## Ordine chiavi

L'ordine delle chiavi di primo livello è: `v`, `archetipo`, `colori`, `stampa`, `sponsor`.

L'ordine all'interno di `colori`: `maglia_p`, `maglia_s`, `pantaloncini_p`,
`pantaloncini_s`, `calze_p`, `calze_s`.

L'ordine all'interno di `stampa`: `nome`, `numero`, `font`, `colore`.

## Esempio

```json
{
  "v": 1,
  "archetipo": "vertical-stripes",
  "colori": {
    "maglia_p":       "#1E5BD6",
    "maglia_s":       "#FFFFFF",
    "pantaloncini_p": "#FFFFFF",
    "pantaloncini_s": "#1E5BD6",
    "calze_p":        "#1E5BD6",
    "calze_s":        "#FFFFFF"
  },
  "stampa": {
    "nome":   "ROSSI",
    "numero": "10",
    "font":   "block",
    "colore": "#FFFFFF"
  },
  "sponsor": false
}
```

## Aggiornamento live

`window.__payload` viene scritto:
1. All'inizializzazione della pagina (dopo `DOMContentLoaded`).
2. Ad ogni cambio di colore (input `color`).
3. Ad ogni cambio di design (click su card architetipo).
4. Ad ogni modifica di nome, numero, font o colore stampa.
5. Quando uno sponsor viene caricato (`sponsor: true`) o rimosso (`sponsor: false`).

Il payload non contiene né conserva il dataURL dell'immagine sponsor.
