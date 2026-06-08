#!/usr/bin/env python3
"""g3-tracker — meccanismo VALIDATION/INCASSO riusabile della stazione 3 (VOS).

NICHE-FREE. Legge gli artefatti append-only di una corsa (outreach_log + payments),
calcola il TASSO DI CONVERSIONE del gate G3 (paganti reali / buyer raggiunti) e
stampa un INPUT-AL-VERDETTO per Luke. NON decide il gate (firewall VOS_RUN_SPEC:
gate_decided_by = Luke, sull'evidenza esterna).

Vincoli incorporati:
  - #6 no-proxy: un pagamento conta solo se ha tx_ref reale e kind in PAYMENT_KINDS.
    waitlist/like/"lo comprerei"/survey -> SCARTATI con warning, non contano mai.
  - firewall: ogni riga deve avere provenance (source/ts). Riga senza provenance ->
    warning ed esclusione (non auditabile = non conta).

Stdlib only (json, argparse, pathlib, sys). macOS 11 Big Sur compat, zero deps.

Uso:
  g3-tracker.py --outreach <outreach_log.jsonl> --payments <payments.jsonl> \
                [--reached-target 50] [--min-paying 3] [--seed <seed.md>]

Le soglie vengono dal seed_envelope (buyers_reached_target / min_paying_to_pass).
Se --seed e' dato, vengono estratte da li'; gli argomenti CLI hanno precedenza.
"""
import argparse
import json
import sys
from pathlib import Path

# vincolo #6: solo questi tipi sono pagamenti REALI. Tutto il resto = proxy = scartato.
PAYMENT_KINDS = {"stripe", "lemon", "card", "bonifico", "loi", "preorder"}
# stati outreach che contano come "buyer RAGGIUNTO" (consegnato, non solo accodato).
REACHED_STATUS = {"sent", "delivered", "replied", "opened"}


def load_jsonl(path):
    """Ritorna (righe_valide, warnings). Riga = dict con provenance presente."""
    rows, warns = [], []
    p = Path(path)
    if not p.exists():
        warns.append(f"file mancante: {path} (0 righe)")
        return rows, warns
    for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError as e:
            warns.append(f"{path}:{i} JSON invalido, riga scartata ({e})")
            continue
        prov = obj.get("provenance")
        if not (isinstance(prov, dict) and prov.get("source") and prov.get("ts")):
            warns.append(f"{path}:{i} provenance mancante (source+ts) -> riga esclusa (firewall)")
            continue
        rows.append(obj)
    return rows, warns


def count_reached(outreach_rows):
    seen = set()
    for r in outreach_rows:
        if r.get("status") in REACHED_STATUS:
            # dedup per contatto: un buyer raggiunto piu' volte conta 1.
            seen.add(r.get("contact_id") or r.get("contact") or json.dumps(r, sort_keys=True))
    return len(seen)


def count_paying(payment_rows):
    """Ritorna (paganti_reali, refs, scartati_proxy)."""
    paying, refs, rejected = 0, [], []
    seen = set()
    for r in payment_rows:
        kind = (r.get("kind") or "").lower()
        tx = r.get("tx_ref")
        if kind not in PAYMENT_KINDS or not tx:
            rejected.append(r)  # vincolo #6: proxy o tx mancante
            continue
        if tx in seen:
            continue
        seen.add(tx)
        paying += 1
        refs.append(tx)
    return paying, refs, rejected


def parse_seed_thresholds(seed_path):
    """Estrae buyers_reached_target / min_paying_to_pass dal seed_envelope (parser
    minimale stdlib: cerca 'chiave: intero' ignorando commenti inline)."""
    out = {}
    txt = Path(seed_path).read_text(encoding="utf-8")
    for key in ("buyers_reached_target", "min_paying_to_pass"):
        for line in txt.splitlines():
            s = line.strip()
            if s.startswith(key):
                rest = s.split(":", 1)[1].split("#", 1)[0].strip()
                if rest.isdigit():
                    out[key] = int(rest)
                break
    return out


def main():
    ap = argparse.ArgumentParser(description="G3 conversion tracker (VOS station 3)")
    ap.add_argument("--outreach", required=True, help="outreach_log.jsonl")
    ap.add_argument("--payments", required=True, help="payments.jsonl")
    ap.add_argument("--reached-target", type=int, default=None)
    ap.add_argument("--min-paying", type=int, default=None)
    ap.add_argument("--seed", default=None, help="seed_envelope per soglie (override da CLI)")
    args = ap.parse_args()

    reached_target = args.reached_target
    min_paying = args.min_paying
    if args.seed and (reached_target is None or min_paying is None):
        seed_vals = parse_seed_thresholds(args.seed)
        if reached_target is None:
            reached_target = seed_vals.get("buyers_reached_target")
        if min_paying is None:
            min_paying = seed_vals.get("min_paying_to_pass")
    if reached_target is None or min_paying is None:
        ap.error("soglie mancanti: passa --reached-target e --min-paying, oppure --seed valido")

    outreach_rows, w1 = load_jsonl(args.outreach)
    payment_rows, w2 = load_jsonl(args.payments)
    warns = w1 + w2

    reached = count_reached(outreach_rows)
    paying, refs, rejected = count_paying(payment_rows)

    # INPUT-al-verdetto (NON il verdetto). Luke decide sull'evidenza.
    if paying >= min_paying:
        verdict_input = "SHIPPED-candidate"
        note = f">= min_paying_to_pass ({min_paying}) -> nicchia efficace, decide Luke"
    elif paying >= 1:
        verdict_input = "WEAK-signal"
        note = "1..min-1 paganti -> rework offerta (max 1) o kill, decide Luke"
    elif reached >= reached_target:
        verdict_input = "KILL-candidate"
        note = f"0 paganti dopo {reached}/{reached_target} raggiunti -> KILL motivato (output valido), decide Luke"
    else:
        verdict_input = "IN-PROGRESS"
        note = f"raggiunti {reached}/{reached_target}: outreach non completo, gate non valutabile"

    report = {
        "gate": "G3",
        "gate_decided_by": "Luke",  # firewall: questo tool NON decide
        "buyers_reached": reached,
        "buyers_reached_target": reached_target,
        "paying_count": paying,
        "min_paying_to_pass": min_paying,
        "conversion": (round(paying / reached, 4) if reached else None),
        "payment_refs": refs,
        "verdict_input": verdict_input,
        "note": note,
        "proxy_rejected_count": len(rejected),
        "rows_excluded_no_provenance": len(warns),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if warns:
        print("\n[WARN] firewall/qualita':", file=sys.stderr)
        for w in warns:
            print("  - " + w, file=sys.stderr)
    if rejected:
        print(f"\n[WARN] vincolo #6 no-proxy: {len(rejected)} pagamento/i SCARTATI "
              f"(kind non in {sorted(PAYMENT_KINDS)} o tx_ref mancante)", file=sys.stderr)

    # exit-code utile per il nastro: 0 SHIPPED-candidate, 2 in-progress, 3 weak, 4 kill.
    sys.exit({"SHIPPED-candidate": 0, "IN-PROGRESS": 2, "WEAK-signal": 3, "KILL-candidate": 4}[verdict_input])


if __name__ == "__main__":
    main()
