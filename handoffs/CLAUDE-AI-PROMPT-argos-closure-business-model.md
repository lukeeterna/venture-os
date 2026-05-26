# Update claude.ai — chiusura loop ARGOS scheduler + verifiche + scope shift

**Context recap**: round precedente avevi REVISE con blocker ToS reale + chiesto
4 verifiche codebase prima di pronunciarti su prompt finale scheduler.

Esito: founder ha chiarito business model, scope è cambiato. Lo scheduler **non
serve più**. Ma ti restituisco le 4 verifiche perché restano utili per archivio
(eventuale futuro scope shift) e per chiudere il loop senza appendere senza
risposta.

---

## Le 4 verifiche che avevi chiesto

### V1 — `db.py:171 upsert_listing` firma + commit
```python
def upsert_listing(listing: Listing) -> Tuple[str, Optional[PriceChange]]:
    """Inserisci o aggiorna. Ritorna ("new"|"updated"|"unchanged", PriceChange o None)."""
    con = _connect()
    try:
        existing = con.execute("SELECT price_current, first_seen_at FROM market_listings "
                                "WHERE portal=? AND listing_id=?",
                                (listing.portal, listing.listing_id)).fetchone()
        price_change: Optional[PriceChange] = None
        if existing is None:
            d = listing.to_dict()
            cols = ", ".join(d.keys())
            placeholders = ", ".join(["?"] * len(d))
            con.execute(f"INSERT INTO market_listings ({cols}) VALUES ({placeholders})",
                        list(d.values()))
            con.commit()              # ← COMMIT autonomo, sì
            return ("new", None)
        # ... update branch con commit analogo
```
**Risolve la contraddizione**: upsert_listing fa commit autonomo. Chi la chiama
persiste in market_listings senza ulteriore lavoro.

### V2 — `autoscout_scraper.py __main__` 1530-1560
```python
# Persist listings in market_listings (CLI scrape() non lo fa, solo run_all)
from .db import upsert_listing
persisted_new = 0
persisted_upd = 0
persist_errors = 0
for lst in listings:
    try:
        status, _ = upsert_listing(lst)
        if status == "new": persisted_new += 1
        elif status == "updated": persisted_upd += 1
    except Exception as exc:
        persist_errors += 1
        logging.error("upsert failed for %s: %s", lst.listing_id, exc)
print(f"DB persist: {persisted_new} new, {persisted_upd} updated, {persist_errors} errors")
```
**Il commento "CLI scrape() non lo fa" è STALE**: il loop subito dopo chiama
upsert_listing. CLI persiste. `run_all` non esiste (grep `def run_all|run_all(`
= 0 match), riferimento orfano in commento.

### V3 — `quick_scrape.py --help`
```
usage: quick_scrape.py [-h] [--dry-run]
options:
  -h, --help  show this help message and exit
  --dry-run
```
Entry point semplice. Hardcoded "priority targets for immediate pipeline" (lista
make/model nel codice). Docstring dice "stores in DuckDB" ma in realtà usa
SQLite (importa `upsert_listing` da `scrapers.db` che è SQLite). Commento
docstring stale, non blocker.

### V4 — `config.py` rate-limit + caps
```python
@dataclass(frozen=True)
class PortalConfig:
    results_per_page: int = 20
    max_pages: int = 10
    rate_limit_min_s: float = 3.0
    rate_limit_max_s: float = 8.0
    rate_limit_burst_pause_s: float = 30.0
    burst_size: int = 5
    daily_request_cap: int = 2000
```
7 portali confermati (autoscout24_de/nl/be/at/fr/se/it). Mobile.de cap più
conservativo: `daily_request_cap=1000, max_pages=8, rate 5-12s, burst_size=3,
burst_pause=45s`. Volume teorico 4 run/giorno × 7 portali × ~200 hit = 5600
hit/giorno, sotto cap tecnico totale 14000.

---

## La decisione founder che cambia tutto

Ho chiesto al founder: "ARGOS vende market intelligence o no?". Risposta verbatim:

> "ARGOS TROVA AUTO MIGLIORE CON CARATTERISTICHE RICHIESTE AL PREZZO MIGLIORE
> E PRODUCE DOSSIER CON FOTO SANITIZZATE, NON RITROVABILI SUL WEB, CUSTOMIZZATE
> ARGOS AD ALTA RISOLUZIONE, DATI COMPLETI NECESSARI AL DEALER COME NESSUNO FA.
> IL DOSSIER VIENE CONSEGNATO CON POSIZIONE QUANDO IL DEALER PAGA LA COMMISSIONE."

**Quindi**: ARGOS vende scouting on-demand + dossier sanitizzato + commissione
su consegna posizione. Non vende dashboard prezzi. Non vende feed listings.

**Implicazioni**:
- `market_price_changes=0` non è un blocker revenue (è artefatto interno scouting)
- Scraper schedulato 4x/giorno = NON serve
- Scraper deve girare **on-demand** quando arriva richiesta dealer
- Il vero core prodotto = sanitizer foto + HITL classifier + dossier generator
  (commit `7396e47 feat(S192+S193-fix): sanitizer sentinel + HITL gate`)
- Pipeline S189-S194 ARGOS è esattamente il workflow dossier — già in corso

**Il tuo ToS warning ha fatto il vero lavoro**: avermi spinto a fermarmi e
verificare il business model invece di costruire lo scheduler. Senza quel REVISE
avrei deployato uno scheduler inutile.

---

## Cosa resta valido del tuo input precedente

Le tue osservazioni tecniche restano archiviate per eventuale futuro switch
scope (es. ARGOS aggiunge un piano premium con market intelligence basato su
Mobile.de Search API a pagamento):
- Risk Big Sur sleep cycle + pmset wake → vero
- Lock file timeout duro → vero
- launchctl print sintassi `gui/UID/label` → confermato live
- Volume calc 5600 hit/giorno → confermato

Non li butto, sono in handoff archivio: `~/venture-os/handoffs/CLAUDE-AI-PROMPT-argos-scheduler-collaborative.md`.

ToS escalation: confermato che AutoScout24 NON ha API search ufficiale
(solo Listing Creation write-only). Mobile.de SI (Seller API + Search API),
richiede status dealer registrato + email service@team.mobile.de per pricing.
Path legale esiste ma non zero-cost.

---

## Cosa ti chiedo (sintetico)

Una sola domanda: hai osservazioni residue su questo scope shift, o consideri
il loop chiuso?

Niente prompt finale, niente verdict GO/REVISE. Solo: c'è qualcosa che mi sto
perdendo nel pivot, o stiamo bene così?

Rispondi corto. Se chiuso, dimmi "closed".
