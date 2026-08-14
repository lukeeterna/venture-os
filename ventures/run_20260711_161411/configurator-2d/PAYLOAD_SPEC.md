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
  "sponsor": false
}
```

## Campi obbligatori

| Campo | Tipo | Descrizione |
|---|---|---|
| `v` | integer | Versione dello schema. Valore fisso: `1`. Incrementare obbligatoriamente ad ogni modifica strutturale dello schema. |
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

## Normalizzazione colori

Tutti i valori HEX nel payload sono sempre in **minuscolo** (es. `#1e5bd6`, non `#1E5BD6`).
La normalizzazione è applicata con `.toLowerCase()` in `buildPayload()`.
Qualsiasi consumer che riceve un payload deve considerare maiuscolo/minuscolo equivalenti,
ma la forma canonica prodotta da questo configuratore è sempre minuscola.

## Normalizzazione nome e numero

- `stampa.nome`: applicato con `normalizeName()` — maiuscolo `it-IT`, solo caratteri
  `[A-ZÀ-ÖØ-Ý0-9' -]`, spazi multipli collassati, max 16 caratteri.
- `stampa.numero`: solo cifre `[0-9]`, max 2 caratteri.

## Rappresentazione canonica

Il codice configurazione è prodotto con `JSON.stringify(window.__payload)` — senza
indentazione, senza wrapper Base64. Non includere mai dati immagine nel payload.

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

## Versione e compatibilità

Il campo `v` deve essere incrementato obbligatoriamente ad ogni modifica strutturale
dello schema (aggiunta/rimozione campi, cambio semantica). I consumer devono rifiutare
le versioni sconosciute senza reinterpretazione silenziosa; l'unica azione corretta
su versione non riconosciuta è segnalare l'incompatibilità.

## Sponsor

`sponsor: true` indica che un logo era caricato al momento della configurazione.
Il payload non contiene il dataURL né il filename dell'immagine.
Quando si conferma un ordine con `sponsor: true`, è necessario ricaricare l'immagine
separatamente (invio allegato email o upload dedicato): il dataURL non è conservato
dopo la chiusura della pagina.

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

## Procedura di ricostruzione

Per ricostruire la configurazione da un codice preventivo:
1. Parsare `JSON.parse(codice)`.
2. Verificare che `v === 1` (rifiutare se versione sconosciuta).
3. Applicare `archetipo` selezionando la card corrispondente.
4. Applicare i 6 valori `colori.*` agli input `type="color"` corrispondenti.
5. Applicare `stampa.nome`, `stampa.numero`, `stampa.font`, `stampa.colore`.
6. Impostare visivamente `sponsor` (non ripristinabile automaticamente — richiedere upload separato se `true`).
