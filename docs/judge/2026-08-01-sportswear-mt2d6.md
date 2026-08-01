# Brief Sol — MT-2D.6 CTA "Richiedi preventivo" + payload strutturato

**Data**: 2026-08-01  
**Giudice**: VOS  
**File target**: `ventures/run_20260711_161411/configurator-2d/index.html`  
**Commit base**: `ee317d1`  
**Branch CC**: `claude/vos-judge-luke-sportswear-8jzzy7`  
**Conversazione ChatGPT (titolo esatto)**: `VOS-SPORTSWEAR-2D-MT6-PAYLOAD`

---

## Contesto — stato attuale del file

Il configuratore 2D è un singolo `index.html` autoportante (~1500 righe, JS vanilla, zero CDN).
Sezioni panel già presenti (in ordine): Design → Colori per capo → Nome e numero → Sponsor.
La sezione Sponsor termina alla riga ~652 con `</section>` prima di `</aside></main>`.
Non esiste ancora nessuna CTA né form preventivo.

Globals esposti dalla funzione `render()` (NON SI TOCCANO, comportamento invariato):
- `window.__rendered` (bool, true dopo ogni render OK)
- `window.__design` (string, id design attivo)
- `window.__boundsFallback` (bool)
- `window.__personalization` `{ name, number, font, fontLabel, fontStack, printColor, frontNumberApplied, rearPreviewAvailable, rearRendering }`
- `window.__sponsorApplied` (bool)

---

## GIÀ FALSIFICATO — non proporre mai

- Modello 3D Blender: bocciato, usare solo la traccia 2D fotografica.
- Template SVG vettoriale: congelato.
- `getImageData` per i bordi: sotto `file://` lancia SecurityError. Verifica visiva solo da `http://`.
- Font scaricati da CDN o embed base64 in questo file.
- Qualsiasi prezzo, costo, margine, valuta (€/$) nel payload o nella UI.

---

## Scope MT-2D.6 — PRECISO, NON ESTENDERE

Aggiungere, dopo la sezione Sponsor e prima di `</aside>`, una nuova sezione HTML:

```html
<section class="panel-section" aria-labelledby="cta-heading">
  <h2 id="cta-heading">Richiedi preventivo</h2>
  <p class="section-help">
    Compila i dati del tuo team. Riceverai un preventivo personalizzato senza impegno.
  </p>
  <!-- campi: societa, referente, recapito -->
  <!-- quantità per voce: maglia / pantaloncini / calze (numerici, min 1, step 1) -->
  <!-- bottone "Copia codice preventivo" (clipboard) -->
  <!-- bottone "Richiedi preventivo gratuito" (mailto) -->
  <!-- feedback status (aria-live="polite") -->
</section>
```

### Campi form cliente (id esatti da usare)

| id HTML | label | tipo | vincoli |
|---------|-------|------|---------|
| `cta-societa` | Società / squadra | text | maxlength 64 |
| `cta-referente` | Referente | text | maxlength 64 |
| `cta-recapito` | Email o telefono | text | maxlength 128 |
| `cta-qta-maglia` | Maglie | number | min 1, step 1, valore default 10 |
| `cta-qta-pantaloncini` | Pantaloncini | number | min 1, step 1, valore default 10 |
| `cta-qta-calze` | Calze | number | min 1, step 1, valore default 10 |

### Schema payload (congelato — non modificare)

```json
{
  "v": 1,
  "ts": "<ISO 8601 UTC, generato al momento del click>",
  "cliente": {
    "societa": "<stringa>",
    "referente": "<stringa>",
    "recapito": "<stringa>"
  },
  "kit": [
    {
      "voce": "Maglia",
      "qta": 10,
      "colori": { "primario": "#1e5bd6", "secondario": "#ffffff" },
      "pattern": "solid",
      "nome": "ROSSI",
      "numero": "10",
      "sponsor_ref": "logo caricato | nessuno"
    },
    {
      "voce": "Pantaloncini",
      "qta": 10,
      "colori": { "primario": "#ffffff", "secondario": "#1e5bd6" },
      "pattern": "solid",
      "nome": "",
      "numero": "",
      "sponsor_ref": "nessuno"
    },
    {
      "voce": "Calze",
      "qta": 10,
      "colori": { "primario": "#1e5bd6", "secondario": "#ffffff" },
      "pattern": "solid",
      "nome": "",
      "numero": "",
      "sponsor_ref": "nessuno"
    }
  ]
}
```

Note schema:
- `v: 1` fisso.
- `ts`: `new Date().toISOString()` al momento del click — NON pre-calcolato.
- `pattern`: valore dell'id design attivo (es. "solid", "vertical-stripes", ecc.).
- `colori`: letti dagli `input[type=color]` al momento del click.
- `nome` e `numero`: letti dai campi personalizzazione al momento del click (solo per Maglia).
- `sponsor_ref`: stringa leggibile "logo caricato" se `window.__sponsorApplied === true`, altrimenti "nessuno". MAI base64 né dataUrl.
- **ZERO prezzi/costi/margini/valute** (grep `prezzo|costo|eur|€|\$` = 0 nel payload e nella sezione JS).

### Funzione `buildPayload()` (JS da aggiungere)

```js
function buildPayload() {
  var ts = new Date().toISOString();
  var design = window.__design || selectedDesign;
  var p = window.__personalization || {};
  var readColor = function(id) {
    var el = document.getElementById(id);
    return el ? el.value : "#000000";
  };
  var readQta = function(id) {
    var el = document.getElementById(id);
    return el ? Math.max(1, parseInt(el.value, 10) || 1) : 1;
  };
  return {
    v: 1,
    ts: ts,
    cliente: {
      societa: (document.getElementById("cta-societa").value || "").trim(),
      referente: (document.getElementById("cta-referente").value || "").trim(),
      recapito: (document.getElementById("cta-recapito").value || "").trim()
    },
    kit: [
      {
        voce: "Maglia",
        qta: readQta("cta-qta-maglia"),
        colori: { primario: readColor("maglia-primary"), secondario: readColor("maglia-secondary") },
        pattern: design,
        nome: (p.name || "").trim(),
        numero: (p.number || "").trim(),
        sponsor_ref: window.__sponsorApplied ? "logo caricato" : "nessuno"
      },
      {
        voce: "Pantaloncini",
        qta: readQta("cta-qta-pantaloncini"),
        colori: { primario: readColor("pantaloncini-primary"), secondario: readColor("pantaloncini-secondary") },
        pattern: design,
        nome: "",
        numero: "",
        sponsor_ref: "nessuno"
      },
      {
        voce: "Calze",
        qta: readQta("cta-qta-calze"),
        colori: { primario: readColor("calze-primary"), secondario: readColor("calze-secondary") },
        pattern: design,
        nome: "",
        numero: "",
        sponsor_ref: "nessuno"
      }
    ]
  };
}
```

### Globale `window.__payload` (OBBLIGATORIO per verify)

Deve essere assegnato ogni volta che si costruisce il payload (click su entrambi i bottoni):

```js
window.__payload = buildPayload();
```

Dopo il click "Copia codice preventivo", `window.__payload` deve essere l'oggetto JS (non stringa).

### Bottone "Copia codice preventivo"

```js
function handleCopyPayload() {
  window.__payload = buildPayload();
  var text = "--- CONFIG PREVENTIVO ---\n" + JSON.stringify(window.__payload, null, 2) + "\n--- FINE ---";
  navigator.clipboard.writeText(text).then(function() {
    setCtaStatus("Codice copiato! Incollalo nel messaggio al fornitore.");
  }).catch(function() {
    setCtaStatus("Copia non disponibile: seleziona e copia il testo sopra.");
    // fallback: mostra il testo in un <textarea readonly> temporaneo
  });
}
```

### Bottone "Richiedi preventivo gratuito" (mailto)

L'indirizzo email destinatario NON va hardcodato nel file — lo riceve come stringa vuota o placeholder `[EMAIL_FORNITORE]`. Il founder la sostituisce manualmente o la configura via query-parameter `?email=`.

```js
function handleCtaMailto() {
  window.__payload = buildPayload();
  var recipientEl = document.getElementById("cta-recipient");
  var recipient = recipientEl ? recipientEl.value.trim() : "";
  var subject = encodeURIComponent("Richiesta preventivo kit — " + (window.__payload.cliente.societa || "cliente"));
  var body = encodeURIComponent(
    "Buongiorno,\n\nsono interessato a un preventivo per il seguente kit:\n\n" +
    "--- CONFIG ---\n" +
    JSON.stringify(window.__payload, null, 2) +
    "\n--- FINE ---\n\nGrazie"
  );
  window.location.href = "mailto:" + recipient + "?subject=" + subject + "&body=" + body;
}
```

Aggiungere anche un campo opzionale `id="cta-recipient"` (nascosto o con label "Email fornitore", `type="email"`, placeholder `[EMAIL_FORNITORE]`) — valorizzabile da query-param `?email=` tramite `applyQueryParameters()` già esistente.

### Gestione query-param `?email=`

Dentro la funzione `applyQueryParameters()` già esistente, aggiungere:

```js
var emailEl = document.getElementById("cta-recipient");
if (emailEl && params.get("email")) {
  emailEl.value = params.get("email");
}
```

---

## Vincoli ASSOLUTI

1. **File singolo**: tutto in `index.html`. Nessun file JS/CSS separato aggiunto.
2. **Zero CDN/URL esterni** in `href` o `src` (grep `http` = 0 match, come ora).
3. **Zero segreti**: nessun indirizzo email, API key, dominio hardcodato.
4. **Zero prezzi** nel payload (grep `prezzo|costo|eur|€|\$` = 0).
5. **Globals esistenti invariati**: `window.__rendered`, `__design`, `__boundsFallback`, `__personalization`, `__sponsorApplied` mantengono la propria semantica e posizione.
6. **Nessuna modifica a** `render()`, `drawSponsor()`, `drawFrontNumber()`, `handleSponsorFile()`, `removeSponsor()`, `buildGallery()`, `renderGarment()` (funzioni già testate da mt2/mt3/mt4/mt5).
7. **`applyQueryParameters()`**: si può estendere SOLO aggiungendo il caso `?email=`, nessuna altra modifica.
8. **Stile**: usare le classi CSS già presenti (`.panel-section`, `.section-help`, `.field`, `.text-input`, `.secondary-button`). Nessun colore o dimensione hardcodata fuori dal sistema esistente. Aggiungere CSS solo se strettamente necessario e in coda al `<style>` esistente.

---

## Ciò che Sol NON deve fare

- Non modificare le sezioni HTML esistenti (Design, Colori, Nome e numero, Sponsor).
- Non riscrivere la logica di render o sponsor.
- Non aggiungere file separati.
- Non usare framework, librerie, o CDN.
- Non inserire commenti su questa unità, il task, o i caller — al massimo uno se il WHY è non-ovvio.
- Non proporre backend, server, o Cloudflare Workers.
- Non scegliere o inserire indirizzi email reali.

---

## Output atteso da Sol

Un unico file `index.html` completo, identico all'originale eccetto:
1. Nuova sezione HTML CTA inserita dopo `</section>` dello sponsor (prima di `</aside>`).
2. JS aggiunto: `buildPayload()`, `handleCopyPayload()`, `handleCtaMailto()`, estensione `applyQueryParameters()`, handler `bindControls()` per i due nuovi bottoni.
3. `window.__payload` assegnato ad ogni click.
4. CSS aggiunto (se necessario, solo in coda al `<style>`).

Sol consegna UN SOLO file, si ferma, non apre altre conversazioni.
