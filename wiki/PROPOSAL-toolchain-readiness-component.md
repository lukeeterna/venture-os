# PROPOSAL — Componente VOS `toolchain-readiness`

> Stato: PROPOSTA (pending OK Luke). Autore: CC. Data: 2026-06-11.
> Origine: sessione MES-R1 (readiness check toolchain MES oleificio).
> Pre-action check: `[no-D-ref]` VOS-meta non ha DECISIONS.md proprio; vincoli founder
> applicabili: #1 (verifica fattuale), #5 (zero-cost), #8 (preflight Big Sur), #10
> (verificato>verosimile), #12 (scope globale), "VOS generalista, non verticalizzare".

---

## 1. Problema (con evidenza dalla sessione, non ipotesi)

Prima di impegnare un progetto su una toolchain nuova, oggi VOS non ha un modo
**riusabile e verificabile** per rispondere a: *"questo stack si installa e gira
end-to-end su questo MacBook Big Sur, prima di toccare hardware/clienti reali?"*

Evidenza diretta del costo di NON averlo, raccolta oggi nella sessione MES-R1:

| Check | Tentativi falliti prima del VERIFIED | Causa reale (scoperta solo eseguendo) |
|-------|--------------------------------------|----------------------------------------|
| Modbus (B) | **4** | pymodbus 3.13: shim datastore deprecato rotto (`address-1`, `exception_code=2`, blocchi vuoti `IndexError`) → solo la nuova API `SimData/SimDevice` funziona |
| OPC-UA (C) | **1** | asyncua 2.0: `init()` cold lento → client deve attendere il LISTEN, non un delay fisso |
| psycopg (A1) | 0 ma incerto a priori | `psycopg-binary 3.3.4` **gira** su Big Sur (rischio wheel non-compatibile NON materializzato) |

Questi 5 fatti sono **conoscenza che oggi si perde** a fine sessione. Il vincolo #8
(preflight pip blacklist) esiste come **regola statica** in CLAUDE.md, ma non c'è
**nessun luogo dove accumulare i risultati verificati** (`grep preflight|readiness
components/` → nessuno). Ogni nuova valutazione riparte da zero.

Dato strutturale: VOS è la fabbrica generalista. Un readiness-check ben fatto è
**metodo riusabile**, non scelta verticale — esattamente la classe di asset che VOS
deve immagazzinare (memoria "VOS generalista: componenti immagazzinano metodo+criteri,
mai scelte verticali").

---

## 2. Proposta (raccomandazione singola, vincolo #3)

Nuovo componente **`components/toolchain-readiness/`** + skill on-demand
**`~/.claude/skills/vos-readiness/`**, che:

1. esegue una **readiness suite** dichiarativa (lista di check) in un **venv isolato**;
2. ogni check chiude `VERIFIED | FAILED | BLOCKED-ON` con **comando + output verbatim**
   (metodo Rule 1b già validato oggi);
3. **accumula** ogni run in `state/readiness-runs.jsonl` (append-only) → diventa la
   knowledge base interrogabile "lib X verificata su Big Sur? sì/no + data + output";
4. produce un report `MES_READINESS.md`-style come artefatto.

Il codice protocollo prodotto oggi (`simulator.py`, `client.py`, `opcua_*.py`,
`soak.py`) diventa il **set di probe di riferimento**: pluggabile, non hard-coded nel
core. Il core è generalista; i probe sono i mattoni verticali opzionali.

### Layout (coerente con convenzione VOS verificata)

```
components/toolchain-readiness/
  readiness.py            # core: legge suite.yaml, esegue check, scrive jsonl + report
  probes/                 # probe riusabili (ognuno = funzione check() -> verdict)
    modbus_loopback.py    # da simulator.py+client.py di oggi
    opcua_loopback.py     # da opcua_server.py+opcua_client.py
    pip_install.py        # install + exit-code + import-check (assorbe vincolo #8)
    pg_smoke.py           # createdb + CTE
    soak.py               # micro-soak RSS/righe
  suites/
    mes-oleificio.yaml    # la suite eseguita oggi, come dato riproducibile
state/readiness-runs.jsonl  # append-only, una riga per check
~/.claude/skills/vos-readiness/SKILL.md   # invocazione on-demand
```

(Convenzione confermata: `tool-scout/scouter.py`, `eval-tracker/eval.py`, 20+
`state/*.jsonl`. Il layout sopra è isomorfo, non inventato.)

### Schema riga `readiness-runs.jsonl`

```json
{"ts":"2026-06-11T18:38:59Z","suite":"mes-oleificio","check":"A1.psycopg",
 "verdict":"VERIFIED","os":"macos-11.7.10","cmd":"pip install psycopg[binary]",
 "key_output":"psycopg-binary 3.3.4 import OK","exit":0,"blocked_on":null}
```

---

## 3. Scelte di design motivate con dati

**3.1 Skill on-demand, NON LaunchAgent/cron.**
Dato: i componenti VOS time-based (`session-health`, `morning-briefer`,
`brief-tracker`) monitorano stato continuo; quelli **event-based** (`tool-scout`,
`vos-scout`) sono on-demand. Il readiness-check è innescato da un **evento di
decisione** (valuto una toolchain/un verticale nuovo), non dal tempo. Un cron
produrrebbe rumore (run identici a vuoto). → trigger = invocazione skill.

**3.2 `state/readiness-runs.jsonl` append-only.**
Dato: 20+ file state già in questo formato; append-only = lossless (allineato vincolo
#1d, mai riscrittura distruttiva). Beneficio concreto: trasforma il vincolo #8 da
regola statica a **knowledge base interrogabile** — "abbiamo già verificato `torch`
su Big Sur?" diventa una query, non una rilettura mnemonica.

**3.3 Loopback in-process PRIMA dell'hardware reale.**
Dato di oggi: il loopback Modbus ha intercettato la rottura API di pymodbus 3.13
**con zero hardware**. Il valore intero del check è **fallire a costo zero** prima di
toccare un PLC / un cliente. → i probe simulano sempre l'estremo remoto.

**3.4 Riuso > riscrittura.**
Dato: i 5 script di oggi sono già VERIFIED end-to-end. Diventano i probe template; il
core generalizza solo l'harness (venv, esecuzione, verdict, log). Nessuna riscrittura.

**3.5 Zero-cost (vincolo #5).**
Tutto OSS già installato (FastAPI, pymodbus, asyncua, psycopg, Postgres 14.17 locale
già presente). Nessun capex, nessun servizio paid. Costo marginale = ~1 file core +
1 SKILL.md.

---

## 4. Cosa il componente NON fa (confine di scope esplicito)

- **Non** decide quale verticale perseguire (MES oleificio incluso) → decisione di
  scope = Luke (vincolo #3 eccezione).
- **Non** introduce un 4° progetto. È infrastruttura VOS, non un prodotto.
- **Non** verticalizza il core: il codice Modbus/OPC-UA resta confinato in `probes/`
  come plugin opzionali, mai nel motore generalista.
- **Non** sostituisce il preflight pip di #8 in-line: lo **assorbe** come un probe,
  mantenendo la regola per gli install ad-hoc fuori da una suite.

---

## 5. Autocritica strutturale (vincolo #4)

**5.1 Assunzioni nascoste.** Assumo che ci saranno *altre* toolchain nuove da
validare. Se VOS resta sui 3 progetti attuali (stack già noti e stabili), il
componente è un'astrazione costruita su **n=1 caso reale** (oggi). Rischio di
over-engineering: un singolo readiness check non giustifica un framework.

**5.2 Cosa rompe a 30/60/90gg.** A 30gg: i probe Modbus/OPC-UA invecchiano con le
versioni libreria (oggi stesso pymodbus 3.13 ha rotto l'API 3.x). Senza esecuzione
periodica, il jsonl diventa **knowledge stale** (memoria "memory records can become
stale") — fotografia di un'API che non esiste più. A 90gg: il rischio è che diventi
un altro componente "designed, implementation pending" come control-tower S184.

**5.3 Pattern d'errore noti su sistemi simili.** VOS ha già componenti che si
sovrappongono per area: `tool-scout`/`vos-scout` (scouting), preflight #8. Aggiungere
`toolchain-readiness` rischia **frammentazione di responsabilità** (chi valuta cosa?).
Il pattern-killer storico VOS è proliferazione di componenti parzialmente
sovrapposti.

**5.4 Dove sovradimensiono.** `suites/*.yaml` + `probes/` pluggabili è architettura da
framework. Per n=1, un singolo `readiness.py` con i check inline + il jsonl basterebbe.
La struttura modulare si giustifica solo a **n≥3 toolchain distinte** verificate.

**Conseguenza onesta dell'autocritica:** la versione difendibile-coi-dati **oggi** non
è il framework di §2, ma un **MVP minimo**: §6.

---

## 6. Raccomandazione finale calibrata sui dati (MVP, non framework)

Implementare **solo**:
1. `state/readiness-runs.jsonl` + uno script `readiness.py` che, dato un report
   `*_READINESS.md` già prodotto, ne **estrae le righe e le accoda** al jsonl
   (capitalizza il lavoro di oggi: 6 righe VERIFIED + i fatti Big Sur, subito).
2. Una query one-liner: "lib X già verificata su questo OS?".
3. I 5 script di oggi **archiviati come probe template** in `components/toolchain-readiness/probes/`
   (semplice `cp`, additivo), senza generalizzarli ancora.

**NON** implementare ora skill/suites/framework: si attivano alla **2ª toolchain
reale** da validare (trigger n≥2, stessa disciplina di enforcement differito usata per
i vincoli 1b/1d). Questo evita l'over-engineering che la mia stessa §5 ha diagnosticato.

Costo MVP: 1 script piccolo + 1 file jsonl + `cp` di 5 file. Beneficio: i fatti
verificati oggi smettono di essere perduti, a costo quasi nullo e senza nuova
astrazione speculativa.

---

## 7. Decisione aperta a Luke (scope, non tecnica)

1. MVP §6 ora **sì/no**?
2. I 5 probe template li teniamo nel componente o restano solo nel workspace
   `mes-oleificio-readiness`?
3. ~~MES oleificio: verticale?~~ **DECISO da Luke 2026-06-11: MES oleificio resta
   esperimento ISOLATO. NON diventa verticale FLUXION, NON apre un 4° progetto.**
   Conseguenza per questa proposta: i probe Modbus/OPC-UA restano artefatti di
   archivio/template generalista; il loro valore è il METODO readiness, non il
   dominio oleificio. Da non riproporre come pipeline in sessioni future.
