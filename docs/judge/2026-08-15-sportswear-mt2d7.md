# MT-2D.7 — UX POLISH + CHIUSURA DIFETTI VISIVI

Repo: `lukeeterna/venture-os`

Base di lavoro: `08b97b1342c82049ca17945e00b6a3478dabb7b8`

Unità precedente chiusa: MT-2D.6 — PASS.

## Obiettivo

Chiudere i sette difetti rinviati in `docs/judge/STATE.md` senza regressioni MT-2D.2 → MT-2D.6 e senza introdurre dipendenze esterne, CDN, API o persistenza.

File prodotto primari:

- `ventures/run_20260711_161411/configurator-2d/index.html`
- `ventures/run_20260711_161411/configurator-2d/PAYLOAD_SPEC.md` solo se necessario per la nuova posizione/scala sponsor.

I verify temporanei possono vivere sotto `/tmp` o in una directory `verify/mt7/` solo se realmente necessari e reviewable.

## Vincoli chiusi

- Canvas 1067×1600 invariato.
- Tre zone reali: maglia, pantaloncini, calze.
- Nessuna nuova sub-zona colletto/maniche.
- Asset derivati sotto `assets-mockup/derived/`, non aggiungere asset binari al repo.
- Nessun prezzo/costo/valuta.
- Nessun dato cliente nel payload.
- Sponsor image solo RAM: mai localStorage/sessionStorage/IndexedDB/file write.
- Nessun CDN, fetch remoto, font remoto o package nuovo.
- MT-2D.6 deve restare funzionante: riepilogo, copy, mailto, payload deterministico.

## I 7 difetti da chiudere

### D7-01 — alone alpha 1–2 px ai bordi

Il compositing del pattern/shading deve restare confinato alla maschera senza frangia chiara/scura visibile sui bordi del capo.

Accettazione:

- nessun alone 1–2 px osservabile sul contorno di maglia/pantaloncini/calze in almeno un colore chiaro e uno scuro;
- nessuna espansione del pattern oltre la maschera;
- non alterare geometricamente la silhouette del mockup.

La tecnica è libera (threshold/edge-safe alpha/compositing order), ma deve essere deterministica e verificabile.

### D7-02 — chevron poco visibile nelle ombre

Il design `chevron` deve restare leggibile anche sulle zone d’ombra profonde della maglia, mantenendo lo shading fotografico.

Accettazione:

- forma a V chiaramente distinguibile in maglia con coppia colori ad alto contrasto;
- shading ancora presente;
- nessuna scorciatoia che disabiliti globalmente `multiply`.

### D7-03 — pattern calze poco leggibile

La densità/spessore dei pattern deve adattarsi alle dimensioni effettive del capo, in particolare alle calze.

Accettazione:

- vertical-stripes, horizontal-stripes, chevron e pinstripes restano riconoscibili sulle calze alla dimensione finale del mockup;
- nessun cambio degli ID `DESIGNS`;
- anteprime gallery e canvas devono restare coerenti semanticamente.

### D7-04 — numero petto “adesivo”

Il numero frontale deve ricevere la stessa integrazione luminosa/tessile del capo invece di essere disegnato come overlay finale piatto.

Accettazione:

- il numero segue visivamente pieghe/luci/ombre della maglia;
- resta leggibile;
- rimane clippato alla maschera maglia;
- `window.__personalization.frontNumberApplied` resta corretto;
- nome/numero/font/colore payload restano invariati semanticamente.

### D7-05 — 5 font non realmente distinti

I cinque ID esistenti devono restare:

`block`, `condensed`, `geometric`, `technical`, `college`.

Non aggiungere font remoti o asset font.

Accettazione:

- i 5 ID producono cinque rese visivamente distinguibili nel rear preview;
- il front number usa coerentemente lo stesso font selezionato;
- nessun ID payload cambia;
- evitare stack che sul Mac corrente ricadono tutti sullo stesso fallback.

### D7-06 — sponsor “adesivo”

Lo sponsor deve essere integrato con lo shading/tessuto e non disegnato come overlay piatto finale.

Accettazione:

- logo clippato alla maglia;
- proporzioni preservate;
- luci/ombre del tessuto percepibili attraverso il logo;
- `window.__sponsorApplied` corretto;
- sponsor on/off/reset continuano a non persistere dati immagine.

### D7-07 — sponsor posizione/scala controllabili

Aggiungere controlli utente semplici per posizione e scala sponsor.

Minimo richiesto:

- posizione orizzontale;
- posizione verticale;
- scala;
- valori limitati a range sicuri che mantengano il logo nel petto/maglia;
- aggiornamento live del canvas;
- reset/rimozione sponsor mantiene stato coerente.

## Evoluzione payload obbligatoria

MT-2D.6 ha congelato `v:1` e `PAYLOAD_SPEC.md` impone incremento `v` ad ogni modifica strutturale.

Poiché posizione/scala sponsor sono nuovo stato utente necessario per ricostruire la configurazione, MT-2D.7 DEVE produrre `v:2` invece di alterare silenziosamente `v:1`.

Schema raccomandato v2, mantenendo il significato dei campi v1:

```json
{
  "v": 2,
  "archetipo": "<design-id>",
  "colori": {
    "maglia_p": "#rrggbb",
    "maglia_s": "#rrggbb",
    "pantaloncini_p": "#rrggbb",
    "pantaloncini_s": "#rrggbb",
    "calze_p": "#rrggbb",
    "calze_s": "#rrggbb"
  },
  "stampa": {
    "nome": "<stringa>",
    "numero": "<stringa>",
    "font": "<font-id>",
    "colore": "#rrggbb"
  },
  "sponsor": false,
  "sponsor_layout": {
    "x": 0.5,
    "y": 0.2,
    "scala": 1.0
  }
}
```

Regole:

- `sponsor` resta booleano per compatibilità semantica con v1;
- `sponsor_layout` usa numeri normalizzati/deterministici, non pixel dipendenti dal viewport;
- ordine chiavi deterministico;
- JSON canonico resta `JSON.stringify(window.__payload)`;
- `PAYLOAD_SPEC.md` deve documentare v2 e dichiarare v1 legacy/ricostruibile;
- nessun dato immagine sponsor nel payload;
- se `sponsor === false`, `sponsor_layout` resta comunque presente con valori deterministici/default;
- nessun timestamp, UUID, cliente, quantità, prezzo o valuta.

## UX mobile / accessibilità

MT-2D.7 è anche polish finale del configuratore 2D prima del deploy.

Verificare almeno:

- 390×844 CSS viewport senza overflow orizzontale;
- controlli sponsor usabili da touch;
- label associate;
- focus visibile;
- bottoni copy/send ancora raggiungibili;
- canvas responsivo e pannello leggibile.

Non ridisegnare l’intera UI: correggere solo ciò che serve per robustezza/usabilità.

## Verifica obbligatoria

Eseguire via HTTP localhost, non usare `file://` come prova finale.

Minimo:

- JS syntax PASS;
- asset load PASS;
- MT2 regression PASS;
- MT3 regression PASS;
- MT4 regression PASS;
- MT5 regression PASS;
- MT6 regression PASS;
- D7_ALPHA_EDGE=PASS;
- D7_CHEVRON_VISIBILITY=PASS;
- D7_SOCK_PATTERN=PASS;
- D7_FRONT_NUMBER_SHADING=PASS;
- D7_FONTS_DISTINCT=PASS;
- D7_SPONSOR_SHADING=PASS;
- D7_SPONSOR_POSITION=PASS;
- D7_SPONSOR_SCALE=PASS;
- PAYLOAD_V2_SCHEMA=PASS;
- PAYLOAD_V2_ORDER=PASS;
- PAYLOAD_V1_MEANING_PRESERVED=PASS;
- NO_IMAGE_DATA=PASS;
- NO_PERSISTENCE=PASS;
- MOBILE_390=PASS.

Per i difetti visuali non basta un grep: usare screenshot/canary browser e, dove utile, pixel assertions deterministiche.

## Scope fail-closed

Non toccare:

- traccia 3D (`configurator/`);
- preventivatore;
- pricing;
- Cloudflare/deploy (MT-2D.8);
- import configurazione (MT-2D.9);
- asset binari;
- file fuori Sportswear.

Se una correzione richiede un cambiamento strutturale non descritto qui, fermarsi e riportare il blocker invece di espandere lo scope.

## Output esecutore atteso

```text
MT2D7_IMPLEMENTED=YES|NO
BASE_SHA=<sha>
HEAD_SHA=<sha>
CHANGED_PATHS=<lista>
D7_ALPHA_EDGE=PASS|FAIL
D7_CHEVRON_VISIBILITY=PASS|FAIL
D7_SOCK_PATTERN=PASS|FAIL
D7_FRONT_NUMBER_SHADING=PASS|FAIL
D7_FONTS_DISTINCT=PASS|FAIL
D7_SPONSOR_SHADING=PASS|FAIL
D7_SPONSOR_POSITION=PASS|FAIL
D7_SPONSOR_SCALE=PASS|FAIL
PAYLOAD_V2=PASS|FAIL
MOBILE_390=PASS|FAIL
MT2_MT6_REGRESSIONS=PASS|FAIL
DEFECTS=<solo osservati>
READY_FOR_SOL_REVIEW=YES|NO
```
